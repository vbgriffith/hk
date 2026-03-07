"""
prepare_splits.py — Resize, filter, label, and split datasets into train/val.

Usage:
    # Process all available datasets:
    python data/prepare_splits.py \
        --celeba ./raw_data/celeba \
        --utkface ./raw_data/utkface \
        --output_dir ./processed \
        --img_size 64

    # Include custom photos labeled by filename:
    python data/prepare_splits.py \
        --custom ./raw_data/my_photos \
        --output_dir ./processed

    # Verify a processed split:
    python data/prepare_splits.py --verify ./processed

Output structure:
    processed/
        train/
            images/
                00000001.jpg
                00000002.jpg
            manifest.csv        ← filename + 7 condition columns
        val/
            images/
            manifest.csv
        stats.json              ← per-dimension class balance
"""

import os
import csv
import json
import random
import argparse
import shutil
from pathlib import Path
from collections import defaultdict

from PIL import Image, ImageOps
import numpy as np

from src.labels import (
    CONDITION_VOCAB, NUM_DIMS, DIM_SIZES,
    parse_prompt, condition_to_indices,
    CELEBA_ATTR_MAP, UTKFACE_RACE_MAP, utkface_age_to_index,
)


IMG_SIZE = 64   # Change to 128 for higher-res training
TRAIN_FRAC = 0.9

DIM_NAMES = list(CONDITION_VOCAB.keys())
CSV_COLUMNS = ["filename"] + DIM_NAMES


# ─────────────────────────────────────────────────────────────────────────────
# IMAGE PROCESSING
# ─────────────────────────────────────────────────────────────────────────────

def process_image(src_path: Path, dst_path: Path, size: int = IMG_SIZE) -> bool:
    """
    Load, crop to square, resize, and save a training image.
    Returns True on success, False if the image should be skipped.
    """
    try:
        img = Image.open(src_path).convert("RGB")
    except Exception:
        return False

    # Skip extremely small images
    if img.width < 32 or img.height < 32:
        return False

    # Center-crop to square
    w, h = img.size
    if w != h:
        min_dim = min(w, h)
        left   = (w - min_dim) // 2
        top    = (h - min_dim) // 2
        img = img.crop((left, top, left + min_dim, top + min_dim))

    # Resize
    img = img.resize((size, size), Image.LANCZOS)

    # Basic quality check: reject near-solid-color images
    arr = np.array(img)
    if arr.std() < 5.0:
        return False

    dst_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst_path, "JPEG", quality=92, optimize=True)
    return True


# ─────────────────────────────────────────────────────────────────────────────
# CELEBA LABELER
# ─────────────────────────────────────────────────────────────────────────────

def load_celeba_labels(celeba_root: Path) -> dict:
    """Load CelebA attribute file → {filename: [7 condition indices]}"""
    attr_file = celeba_root / "list_attr_celeba.txt"
    if not attr_file.exists():
        print(f"  [WARN] CelebA attributes not found: {attr_file}")
        return {}

    with open(attr_file) as f:
        lines = f.read().strip().split('\n')
    attr_names = lines[1].split()

    labels = {}
    for line in lines[2:]:
        parts = line.split()
        fname = parts[0]
        attr_vals = {name: int(v) for name, v in zip(attr_names, parts[1:])}

        cond = [0] * NUM_DIMS

        # Subject: individual headshot (CelebA is always single-face aligned)
        cond[DIM_NAMES.index("subject")] = 1   # individual
        cond[DIM_NAMES.index("framing")] = 1   # headshot
        cond[DIM_NAMES.index("style")]   = 7   # studio

        # Hair color
        hair_priority = [
            ("Blond_Hair", 4), ("Black_Hair", 1),
            ("Brown_Hair", 2), ("Gray_Hair", 6)
        ]
        for attr, idx in hair_priority:
            if attr_vals.get(attr, -1) == 1:
                cond[DIM_NAMES.index("hair")] = idx
                break

        # Age: "Young" attribute
        cond[DIM_NAMES.index("age")] = 5 if attr_vals.get("Young", -1) == 1 else 6

        # Extras
        if attr_vals.get("Smiling", -1) == 1:
            cond[DIM_NAMES.index("extras")] = 4   # smiling
        elif attr_vals.get("Eyeglasses", -1) == 1:
            cond[DIM_NAMES.index("extras")] = 7   # glasses
        elif attr_vals.get("Wearing_Hat", -1) == 1:
            cond[DIM_NAMES.index("extras")] = 8   # hat

        labels[fname] = cond

    return labels


# ─────────────────────────────────────────────────────────────────────────────
# UTKFACE LABELER
# ─────────────────────────────────────────────────────────────────────────────

def utkface_label_from_path(path: Path) -> list:
    """Parse UTKFace filename → [7 condition indices]"""
    parts = path.stem.split("_")
    if len(parts) < 3:
        return None
    try:
        age  = int(parts[0])
        race = int(parts[2])
    except (ValueError, IndexError):
        return None

    if age > 45:
        return None  # out of scope

    cond = [0] * NUM_DIMS
    cond[DIM_NAMES.index("age")]       = utkface_age_to_index(age)
    cond[DIM_NAMES.index("ethnicity")] = UTKFACE_RACE_MAP.get(race, 0)
    cond[DIM_NAMES.index("subject")]   = 1   # individual
    cond[DIM_NAMES.index("framing")]   = 1   # headshot
    return cond


# ─────────────────────────────────────────────────────────────────────────────
# MAIN PROCESSING PIPELINE
# ─────────────────────────────────────────────────────────────────────────────

def process_dataset(
    source_pairs: list,   # list of (src_path: Path, cond_indices: list)
    output_dir: Path,
    img_size: int = IMG_SIZE,
    train_frac: float = TRAIN_FRAC,
    start_idx: int = 0
) -> tuple:
    """
    Process and save a list of (image_path, condition) pairs.
    Returns (train_records, val_records, next_start_idx).
    """
    random.seed(42)
    random.shuffle(source_pairs)
    split_idx = int(len(source_pairs) * train_frac)

    train_records = []
    val_records   = []

    for i, (src, cond) in enumerate(source_pairs):
        is_train = i < split_idx
        split    = "train" if is_train else "val"
        idx      = start_idx + i
        dst_name = f"{idx:08d}.jpg"
        dst_path = output_dir / split / "images" / dst_name

        if not process_image(src, dst_path, img_size):
            continue

        record = {"filename": dst_name}
        record.update({dim: cond[j] for j, dim in enumerate(DIM_NAMES)})

        if is_train:
            train_records.append(record)
        else:
            val_records.append(record)

        if (i + 1) % 5000 == 0:
            print(f"    Processed {i+1}/{len(source_pairs)}")

    return train_records, val_records, start_idx + len(source_pairs)


def write_manifest(records: list, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        writer.writerows(records)
    print(f"  Wrote {len(records):,} records → {path}")


def compute_stats(records: list) -> dict:
    """Compute per-dimension class balance statistics."""
    stats = {}
    for dim in DIM_NAMES:
        counts = defaultdict(int)
        for r in records:
            counts[int(r[dim])] += 1
        total = sum(counts.values())
        stats[dim] = {
            CONDITION_VOCAB[dim].get(k, str(k)): f"{v/total*100:.1f}%"
            for k, v in sorted(counts.items())
        }
    return stats


def verify_split(processed_dir: Path):
    """Print a summary of a processed dataset directory."""
    for split in ["train", "val"]:
        manifest = processed_dir / split / "manifest.csv"
        img_dir  = processed_dir / split / "images"
        if not manifest.exists():
            print(f"  {split}: NOT FOUND")
            continue
        with open(manifest) as f:
            rows = list(csv.DictReader(f))
        n_imgs = len(list(img_dir.glob("*.jpg"))) if img_dir.exists() else 0
        print(f"  {split}: {len(rows):,} records, {n_imgs:,} images")
        if rows:
            # Show a sample of condition distribution
            stats = compute_stats(rows)
            for dim in ["subject", "age", "ethnicity"]:
                print(f"    {dim}: {dict(list(stats[dim].items())[:5])}")


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    p = argparse.ArgumentParser(description="Prepare PortraitGAN training data")
    p.add_argument("--celeba",      type=str, default=None)
    p.add_argument("--utkface",     type=str, default=None)
    p.add_argument("--custom",      type=str, nargs="+", default=[])
    p.add_argument("--output_dir",  type=str, default="./processed")
    p.add_argument("--img_size",    type=int, default=IMG_SIZE)
    p.add_argument("--verify",      type=str, default=None,
                   help="Verify an existing processed dir and exit")
    p.add_argument("--max_per_source", type=int, default=None,
                   help="Limit images per source (for quick tests)")
    args = p.parse_args()

    if args.verify:
        print(f"\nVerifying processed dataset at: {args.verify}")
        verify_split(Path(args.verify))
        return

    output_dir = Path(args.output_dir)

    all_train, all_val = [], []
    idx = 0

    # ── CelebA ──
    if args.celeba:
        celeba_root = Path(args.celeba)
        img_dir = celeba_root / "img_align_celeba"
        if not img_dir.exists():
            print(f"[WARN] CelebA image dir not found: {img_dir}")
        else:
            print(f"\nProcessing CelebA from {img_dir}...")
            labels = load_celeba_labels(celeba_root)
            files = sorted(img_dir.glob("*.jpg"))
            if args.max_per_source:
                files = files[:args.max_per_source]
            pairs = [(f, labels.get(f.name, [0]*NUM_DIMS)) for f in files]
            tr, va, idx = process_dataset(pairs, output_dir, args.img_size, start_idx=idx)
            all_train.extend(tr)
            all_val.extend(va)
            print(f"  CelebA: {len(tr):,} train, {len(va):,} val")

    # ── UTKFace ──
    if args.utkface:
        utkface_root = Path(args.utkface)
        if not utkface_root.exists():
            print(f"[WARN] UTKFace dir not found: {utkface_root}")
        else:
            print(f"\nProcessing UTKFace from {utkface_root}...")
            files = list(utkface_root.rglob("*.jpg")) + list(utkface_root.rglob("*.JPG"))
            if args.max_per_source:
                files = files[:args.max_per_source]
            pairs = []
            for f in files:
                cond = utkface_label_from_path(f)
                if cond is not None:
                    pairs.append((f, cond))
            tr, va, idx = process_dataset(pairs, output_dir, args.img_size, start_idx=idx)
            all_train.extend(tr)
            all_val.extend(va)
            print(f"  UTKFace: {len(tr):,} train, {len(va):,} val (age ≤ 45 only)")

    # ── Custom directories ──
    for custom_path in args.custom:
        custom_root = Path(custom_path)
        if not custom_root.exists():
            print(f"[WARN] Custom dir not found: {custom_root}")
            continue
        print(f"\nProcessing custom dir: {custom_root}...")
        exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
        files = [f for f in custom_root.rglob("*") if f.suffix.lower() in exts]
        if args.max_per_source:
            files = files[:args.max_per_source]
        pairs = []
        for f in files:
            stem = f.stem.replace("_", " ").replace("-", " ")
            parsed = parse_prompt(stem)
            cond = condition_to_indices(parsed)
            pairs.append((f, cond))
        tr, va, idx = process_dataset(pairs, output_dir, args.img_size, start_idx=idx)
        all_train.extend(tr)
        all_val.extend(va)
        print(f"  Custom: {len(tr):,} train, {len(va):,} val")

    if not all_train:
        print("\nNo data processed. Check source paths and try again.")
        return

    # ── Write manifests ──
    print(f"\nWriting manifests...")
    write_manifest(all_train, output_dir / "train" / "manifest.csv")
    write_manifest(all_val,   output_dir / "val"   / "manifest.csv")

    # ── Stats ──
    stats = {
        "total_train": len(all_train),
        "total_val": len(all_val),
        "img_size": args.img_size,
        "train_distribution": compute_stats(all_train),
    }
    with open(output_dir / "stats.json", "w") as f:
        json.dump(stats, f, indent=2)

    # ── Summary ──
    print(f"\n{'='*50}")
    print(f"  Dataset prepared at: {output_dir}")
    print(f"  Training images: {len(all_train):,}")
    print(f"  Validation images: {len(all_val):,}")
    print(f"  Image size: {args.img_size}×{args.img_size}")
    print(f"\n  Condition distribution (train):")
    for dim in ["subject", "age", "ethnicity", "style"]:
        print(f"    {dim}:")
        for label, pct in list(stats["train_distribution"][dim].items())[:6]:
            print(f"      {label:<20} {pct}")
    print(f"\nNext step: python src/train.py --celeba {args.celeba or ''} --utkface {args.utkface or ''}")


if __name__ == "__main__":
    main()
