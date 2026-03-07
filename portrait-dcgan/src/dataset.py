"""
dataset.py — Dataset loading, augmentation, and condition label assignment.

Supports:
  - CelebA (aligned faces, 202K images, attribute-based labeling)
  - UTKFace (age + race labels, 24K images)
  - COCO People (full-body crops, crowd-sourced)
  - Custom directory (labeled by filename convention or CSV manifest)

All datasets are normalized to:
  - Image size: 64×64 (or IMG_SIZE from model.py)
  - Pixel range: [-1.0, 1.0]
  - Condition: 7-integer vector per image
"""

import os
import csv
import random
from pathlib import Path
from PIL import Image

import torch
from torch.utils.data import Dataset, DataLoader, ConcatDataset
import torchvision.transforms as T
import numpy as np

from src.labels import (
    CELEBA_ATTR_MAP, UTKFACE_RACE_MAP, utkface_age_to_index,
    DIM_SIZES, NUM_DIMS, CONDITION_VOCAB
)
from src.model import IMG_SIZE


# ─────────────────────────────────────────────────────────────────────────────
# BASE TRANSFORM
# ─────────────────────────────────────────────────────────────────────────────

def get_transform(augment: bool = True, img_size: int = IMG_SIZE):
    """Returns a transform pipeline appropriate for training or validation."""
    ops = [
        T.Resize((img_size, img_size), interpolation=T.InterpolationMode.LANCZOS),
    ]
    if augment:
        ops += [
            T.RandomHorizontalFlip(p=0.5),
            T.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.1, hue=0.03),
            T.RandomAffine(degrees=5, translate=(0.05, 0.05), scale=(0.95, 1.05)),
        ]
    ops += [
        T.ToTensor(),
        T.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5]),  # → [-1, 1]
    ]
    return T.Compose(ops)


def denormalize(tensor):
    """Convert a [-1,1] tensor back to [0,1] for visualization."""
    return (tensor * 0.5 + 0.5).clamp(0, 1)


# ─────────────────────────────────────────────────────────────────────────────
# CELEBA DATASET
# ─────────────────────────────────────────────────────────────────────────────

class CelebADataset(Dataset):
    """
    CelebA aligned faces dataset.

    Expected directory structure:
        celeba/
          img_align_celeba/   ← JPEG files
          list_attr_celeba.txt ← attribute annotations

    Condition assignment:
      - Hair color from attributes
      - Age: Young=1 → young_adult(5), Young=0 → adult(6)
      - Subject: always "individual" (1) — single-face crops
      - Framing: always "headshot" (1)
      - Smiling attribute → extras=4
      - Eyeglasses → extras=7
    """
    def __init__(self, root: str, split: str = "train", augment: bool = True):
        self.root = Path(root)
        self.img_dir = self.root / "img_align_celeba"
        self.transform = get_transform(augment)

        # Load attribute file
        attr_file = self.root / "list_attr_celeba.txt"
        if not attr_file.exists():
            raise FileNotFoundError(f"CelebA attributes not found at {attr_file}")

        self.filenames, self.attrs, self.attr_names = self._load_attrs(attr_file)

        # Train/val split (CelebA standard: first 162,770 = train)
        n = len(self.filenames)
        split_idx = int(n * 0.9)
        if split == "train":
            self.filenames = self.filenames[:split_idx]
            self.attrs = self.attrs[:split_idx]
        else:
            self.filenames = self.filenames[split_idx:]
            self.attrs = self.attrs[split_idx:]

    def _load_attrs(self, path):
        with open(path) as f:
            lines = f.read().strip().split('\n')
        n_imgs = int(lines[0])
        attr_names = lines[1].split()
        records = []
        fnames = []
        for line in lines[2:]:
            parts = line.split()
            fnames.append(parts[0])
            vals = [int(v) for v in parts[1:]]
            records.append(vals)
        return fnames, records, attr_names

    def _attrs_to_condition(self, attr_vals: list) -> list:
        attr_dict = dict(zip(self.attr_names, attr_vals))
        cond = [0] * NUM_DIMS
        dims = list(CONDITION_VOCAB.keys())

        # Subject: always individual headshot
        cond[dims.index("subject")] = 1   # individual
        cond[dims.index("framing")] = 1   # headshot

        # Hair
        hair_map = {
            "Blond_Hair": 4, "Black_Hair": 1, "Brown_Hair": 2, "Gray_Hair": 6
        }
        for attr, idx in hair_map.items():
            if attr_dict.get(attr, -1) == 1:
                cond[dims.index("hair")] = idx
                break

        # Age (Young attribute: 1=young, -1=not young)
        if attr_dict.get("Young", -1) == 1:
            cond[dims.index("age")] = 5   # young_adult
        else:
            cond[dims.index("age")] = 6   # adult

        # Style
        cond[dims.index("style")] = 7   # studio (CelebA is mostly studio shots)

        # Extras: smiling, glasses
        if attr_dict.get("Smiling", -1) == 1:
            cond[dims.index("extras")] = 4
        elif attr_dict.get("Eyeglasses", -1) == 1:
            cond[dims.index("extras")] = 7

        return cond

    def __len__(self):
        return len(self.filenames)

    def __getitem__(self, idx):
        img_path = self.img_dir / self.filenames[idx]
        img = Image.open(img_path).convert("RGB")
        img = self.transform(img)
        cond = torch.tensor(self._attrs_to_condition(self.attrs[idx]), dtype=torch.long)
        return img, cond


# ─────────────────────────────────────────────────────────────────────────────
# UTKFACE DATASET
# ─────────────────────────────────────────────────────────────────────────────

class UTKFaceDataset(Dataset):
    """
    UTKFace dataset — diverse ages (0–116) with race labels.
    Filename format: [age]_[gender]_[race]_[date].jpg

    Provides strong age and ethnicity conditioning.
    Only uses images where age <= 45 (per project scope).
    """
    def __init__(self, root: str, split: str = "train", augment: bool = True):
        self.root = Path(root)
        self.transform = get_transform(augment)

        all_files = sorted(self.root.glob("*.jpg")) + \
                    sorted(self.root.glob("*.JPG")) + \
                    sorted(self.root.glob("*.png"))

        # Parse and filter
        valid = []
        for f in all_files:
            parts = f.stem.split("_")
            if len(parts) < 3:
                continue
            try:
                age = int(parts[0])
                race = int(parts[2])
            except ValueError:
                continue
            if age > 45:
                continue  # outside project scope
            valid.append((f, age, race))

        random.shuffle(valid)
        split_idx = int(len(valid) * 0.9)
        if split == "train":
            self.data = valid[:split_idx]
        else:
            self.data = valid[split_idx:]

    def _build_condition(self, age: int, race: int) -> list:
        cond = [0] * NUM_DIMS
        dims = list(CONDITION_VOCAB.keys())

        cond[dims.index("age")]       = utkface_age_to_index(age)
        cond[dims.index("ethnicity")] = UTKFACE_RACE_MAP.get(race, 0)
        cond[dims.index("subject")]   = 1   # individual
        cond[dims.index("framing")]   = 1   # headshot (UTKFace is face crops)
        return cond

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        fpath, age, race = self.data[idx]
        img = Image.open(fpath).convert("RGB")
        img = self.transform(img)
        cond = torch.tensor(self._build_condition(age, race), dtype=torch.long)
        return img, cond


# ─────────────────────────────────────────────────────────────────────────────
# CUSTOM DIRECTORY DATASET
# ─────────────────────────────────────────────────────────────────────────────

class CustomDataset(Dataset):
    """
    Load images from a directory. Labels come from either:
      (a) A CSV manifest: manifest.csv with columns: filename, + one per dimension
      (b) Filename convention: asian_family_portrait_001.jpg

    For option (b), the filename is parsed with parse_prompt() from labels.py.

    Also supports a flat directory where all images have the same condition
    (pass fixed_condition as a dict like {"subject": 3, "ethnicity": 2}).
    """
    def __init__(self, root: str, split: str = "train",
                 augment: bool = True, fixed_condition: dict = None):
        from src.labels import parse_prompt, condition_to_indices
        self.transform = get_transform(augment)
        self.root = Path(root)
        self.fixed_condition = fixed_condition
        self.parse_prompt = parse_prompt
        self.condition_to_indices = condition_to_indices

        exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
        all_files = [f for f in self.root.rglob("*") if f.suffix.lower() in exts]
        all_files.sort()

        # Check for manifest CSV
        manifest = self.root / "manifest.csv"
        if manifest.exists():
            self.data = self._load_manifest(manifest, all_files)
        else:
            self.data = [(f, self._label_from_filename(f)) for f in all_files]

        # Train/val split
        random.seed(42)
        random.shuffle(self.data)
        split_idx = int(len(self.data) * 0.9)
        if split == "train":
            self.data = self.data[:split_idx]
        else:
            self.data = self.data[split_idx:]

    def _label_from_filename(self, path: Path) -> list:
        if self.fixed_condition:
            from src.labels import condition_to_indices
            return condition_to_indices(self.fixed_condition)
        stem = path.stem.replace("_", " ").replace("-", " ")
        cond = self.parse_prompt(stem)
        return self.condition_to_indices(cond)

    def _load_manifest(self, csv_path: Path, all_files: list) -> list:
        dims = list(CONDITION_VOCAB.keys())
        file_map = {f.name: f for f in all_files}
        data = []
        with open(csv_path) as f:
            reader = csv.DictReader(f)
            for row in reader:
                fname = row.get("filename", "")
                if fname not in file_map:
                    continue
                cond = [int(row.get(dim, 0)) for dim in dims]
                data.append((file_map[fname], cond))
        return data

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        fpath, cond_indices = self.data[idx]
        img = Image.open(fpath).convert("RGB")
        img = self.transform(img)
        return img, torch.tensor(cond_indices, dtype=torch.long)


# ─────────────────────────────────────────────────────────────────────────────
# DATASET FACTORY
# ─────────────────────────────────────────────────────────────────────────────

def build_dataloader(config: dict, split: str = "train") -> DataLoader:
    """
    Build a combined DataLoader from multiple dataset sources.

    config example:
        {
            "celeba": "/data/celeba",
            "utkface": "/data/utkface",
            "custom": ["/data/my_families"],
            "batch_size": 64,
            "num_workers": 4,
        }
    """
    datasets = []
    augment = (split == "train")

    if "celeba" in config:
        try:
            ds = CelebADataset(config["celeba"], split=split, augment=augment)
            datasets.append(ds)
            print(f"  CelebA {split}: {len(ds):,} images")
        except FileNotFoundError as e:
            print(f"  [WARN] CelebA not found: {e}")

    if "utkface" in config:
        try:
            ds = UTKFaceDataset(config["utkface"], split=split, augment=augment)
            datasets.append(ds)
            print(f"  UTKFace {split}: {len(ds):,} images")
        except Exception as e:
            print(f"  [WARN] UTKFace not found: {e}")

    for custom_path in config.get("custom", []):
        try:
            ds = CustomDataset(custom_path, split=split, augment=augment)
            datasets.append(ds)
            print(f"  Custom ({custom_path}) {split}: {len(ds):,} images")
        except Exception as e:
            print(f"  [WARN] Custom dataset error: {e}")

    if not datasets:
        raise ValueError("No datasets could be loaded. Check your config paths.")

    combined = ConcatDataset(datasets)
    print(f"  Total {split}: {len(combined):,} images")

    return DataLoader(
        combined,
        batch_size=config.get("batch_size", 64),
        shuffle=(split == "train"),
        num_workers=config.get("num_workers", 4),
        pin_memory=True,
        drop_last=True,
        persistent_workers=config.get("num_workers", 4) > 0,
    )


# ─────────────────────────────────────────────────────────────────────────────
# QUICK SYNTHETIC FALLBACK (for testing without real data)
# ─────────────────────────────────────────────────────────────────────────────

class SyntheticDataset(Dataset):
    """
    Generates simple synthetic training data for pipeline testing.
    Not for real training — use real portrait photos.
    """
    def __init__(self, n=1000, img_size=64):
        self.n = n
        self.img_size = img_size

    def __len__(self):
        return self.n

    def __getitem__(self, idx):
        # Random noise image with a circle (face proxy)
        img = torch.randn(3, self.img_size, self.img_size) * 0.1
        # Draw a "face" oval
        cx, cy = self.img_size // 2, self.img_size // 2
        r = self.img_size // 3
        skin_color = torch.tensor([0.2, 0.1, 0.0]).view(3, 1, 1)
        for y in range(self.img_size):
            for x in range(self.img_size):
                if ((x - cx)**2 / (r*0.8)**2 + (y - cy)**2 / r**2) < 1:
                    img[:, y, x] = skin_color.squeeze() + torch.randn(3) * 0.05
        cond = torch.zeros(NUM_DIMS, dtype=torch.long)
        cond[0] = 1  # individual
        return img, cond
