"""
download_datasets.py — Automated download of portrait datasets.

Usage:
    python data/download_datasets.py --datasets celeba utkface
    python data/download_datasets.py --datasets all --output_dir ./raw_data
    python data/download_datasets.py --list   # show all available datasets

Datasets:
    celeba    — CelebA aligned faces (202K images, ~1.4 GB)
                Requires Google Drive download (uses gdown)
    utkface   — UTKFace age+race labeled (24K images, ~100 MB)
    ffhq_64   — FFHQ faces resized to 64×64 (70K, permissive license)
    lfw       — Labeled Faces in the Wild (13K face photos, ~170 MB)

IMPORTANT — CelebA Terms of Use:
    CelebA is for non-commercial research only.
    By downloading, you agree to the original terms at:
    https://mmlab.ie.cuhk.edu.hk/projects/CelebA.html
"""

import os
import sys
import shutil
import argparse
import zipfile
import tarfile
import urllib.request
from pathlib import Path


# ─────────────────────────────────────────────────────────────────────────────
# DATASET REGISTRY
# ─────────────────────────────────────────────────────────────────────────────

DATASETS = {
    "utkface": {
        "description": "UTKFace — 24K face images with age, gender, race labels (0–116 years)",
        "license": "Research/non-commercial",
        "size": "~100 MB",
        "url": "https://drive.google.com/file/d/0BxYys69jI14kYVM3aVhKS1VhRUk/view",
        "instructions": """
UTKFace requires manual download from:
    https://susanqq.github.io/UTKFace/

Steps:
    1. Go to: https://susanqq.github.io/UTKFace/
    2. Download 'Aligned&Cropped Faces' (part1.tar.gz, part2.tar.gz, part3.tar.gz)
    3. Extract all files to: {output_dir}/utkface/
    4. The directory should contain files like: 25_1_2_20170119154142637.jpg

Alternatively, run:
    pip install kaggle
    kaggle datasets download -d jangedoo/utkface-new
    unzip utkface-new.zip -d {output_dir}/utkface/
""",
    },

    "celeba": {
        "description": "CelebA — 202K aligned celebrity faces with 40 attribute labels",
        "license": "Non-commercial research only",
        "size": "~1.4 GB",
        "url": "https://mmlab.ie.cuhk.edu.hk/projects/CelebA.html",
        "instructions": """
CelebA requires accepting license terms. Download via:
    Method 1 — gdown (recommended):
        pip install gdown
        gdown --id 0B7EVK8r0v71pZjFTYXZWM3FlRnM -O {output_dir}/celeba/img_align_celeba.zip
        gdown --id 0B7EVK8r0v71pblRyaVFSWGxPYXM -O {output_dir}/celeba/list_attr_celeba.txt

    Method 2 — Kaggle:
        pip install kaggle
        kaggle datasets download -d jessicali9530/celeba-dataset
        unzip celeba-dataset.zip -d {output_dir}/celeba/

    Method 3 — PyTorch (downloads automatically, needs ~1.4GB free):
        from torchvision.datasets import CelebA
        CelebA(root='{output_dir}', split='train', download=True)

After download, your directory should look like:
    {output_dir}/celeba/
        img_align_celeba/
            000001.jpg
            000002.jpg
            ...
        list_attr_celeba.txt
""",
    },

    "lfw": {
        "description": "Labeled Faces in the Wild — 13K face photos, diverse people",
        "license": "Free for research",
        "size": "~170 MB",
        "url": "http://vis-www.cs.umass.edu/lfw/lfw.tgz",
        "auto_download": True,
    },

    "ffhq_64": {
        "description": "FFHQ faces at 64×64 — 70K high-quality faces, permissive license",
        "license": "Creative Commons (see https://github.com/NVlabs/ffhq-dataset)",
        "size": "~1.0 GB",
        "url": "https://drive.google.com/open?id=1tZUcXDBeOibC6jcMCtgRRz67pzrAHeHL",
        "instructions": """
FFHQ download options:
    Method 1 — Official (requires Google Drive):
        git clone https://github.com/NVlabs/ffhq-dataset
        python ffhq-dataset/download_ffhq.py --images

    Method 2 — Kaggle:
        kaggle datasets download -d rahulbhalley/ffhq-1024x1024
        # Then resize: python data/prepare_splits.py --resize 64

    Method 3 — Pre-resized (64×64) via Hugging Face:
        pip install datasets
        python -c "
from datasets import load_dataset
ds = load_dataset('huggan/FFHQ', split='train')
# Save images manually to {output_dir}/ffhq_64/
"
""",
    },

    "open_images_people": {
        "description": "Open Images subset — people/portraits, full-body shots (~60K)",
        "license": "CC BY 4.0",
        "size": "~2 GB",
        "instructions": """
Open Images People subset:
    pip install fiftyone

    python -c "
import fiftyone as fo
import fiftyone.zoo as foz

# Download person subset
dataset = foz.load_zoo_dataset(
    'open-images-v7',
    split='train',
    label_types=['detections'],
    classes=['Person'],
    max_samples=60000,
)
# Export to {output_dir}/open_images_people/
dataset.export(
    export_dir='{output_dir}/open_images_people/',
    dataset_type=fo.types.ImageDirectory
)
"
""",
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# AUTO-DOWNLOAD: LFW (small, public)
# ─────────────────────────────────────────────────────────────────────────────

def download_lfw(output_dir: Path):
    """Download Labeled Faces in the Wild automatically."""
    url = "http://vis-www.cs.umass.edu/lfw/lfw.tgz"
    out_path = output_dir / "lfw.tgz"
    extract_dir = output_dir / "lfw"

    if extract_dir.exists() and len(list(extract_dir.rglob("*.jpg"))) > 1000:
        print(f"  LFW already downloaded at {extract_dir}")
        return extract_dir

    print(f"  Downloading LFW from {url} (~170 MB)...")
    extract_dir.mkdir(parents=True, exist_ok=True)

    def progress(block_num, block_size, total_size):
        downloaded = block_num * block_size
        pct = min(downloaded / total_size * 100, 100)
        bar = "█" * int(pct / 2) + "░" * (50 - int(pct / 2))
        print(f"\r  [{bar}] {pct:.0f}% ({downloaded // 1024**2} MB)", end="", flush=True)

    urllib.request.urlretrieve(url, out_path, progress)
    print()

    print("  Extracting...")
    with tarfile.open(out_path, "r:gz") as tar:
        tar.extractall(output_dir)

    os.remove(out_path)
    n_images = len(list(extract_dir.rglob("*.jpg")))
    print(f"  ✓ LFW extracted: {n_images:,} images at {extract_dir}")
    return extract_dir


# ─────────────────────────────────────────────────────────────────────────────
# GDOWN HELPER (for CelebA)
# ─────────────────────────────────────────────────────────────────────────────

def try_celeba_gdown(output_dir: Path):
    """Attempt automatic CelebA download via gdown."""
    try:
        import gdown
    except ImportError:
        print("  gdown not installed. Run: pip install gdown")
        return False

    celeba_dir = output_dir / "celeba"
    celeba_dir.mkdir(parents=True, exist_ok=True)
    img_dir = celeba_dir / "img_align_celeba"

    if img_dir.exists() and len(list(img_dir.glob("*.jpg"))) > 100000:
        print(f"  CelebA already present at {img_dir}")
        return True

    print("  Downloading CelebA images via gdown (~1.4 GB)...")
    print("  NOTE: This requires you have agreed to CelebA terms of use.")
    print("  Terms: https://mmlab.ie.cuhk.edu.hk/projects/CelebA.html")

    # CelebA aligned faces
    img_zip = celeba_dir / "img_align_celeba.zip"
    try:
        gdown.download(
            "https://drive.google.com/uc?id=0B7EVK8r0v71pZjFTYXZWM3FlRnM",
            str(img_zip),
            quiet=False
        )
    except Exception as e:
        print(f"  ✗ gdown failed: {e}")
        return False

    if img_zip.exists():
        print("  Extracting CelebA images...")
        with zipfile.ZipFile(img_zip) as zf:
            zf.extractall(celeba_dir)
        os.remove(img_zip)

    # Attributes file
    print("  Downloading CelebA attributes...")
    attr_path = celeba_dir / "list_attr_celeba.txt"
    try:
        gdown.download(
            "https://drive.google.com/uc?id=0B7EVK8r0v71pblRyaVFSWGxPYXM",
            str(attr_path),
            quiet=False
        )
    except Exception as e:
        print(f"  ✗ Attributes download failed: {e}")
        print("  You can manually download list_attr_celeba.txt from CelebA Google Drive")

    n_imgs = len(list(img_dir.glob("*.jpg"))) if img_dir.exists() else 0
    if n_imgs > 0:
        print(f"  ✓ CelebA ready: {n_imgs:,} images")
        return True
    return False


# ─────────────────────────────────────────────────────────────────────────────
# VERIFY
# ─────────────────────────────────────────────────────────────────────────────

def verify_dataset(name: str, output_dir: Path) -> bool:
    """Check if a dataset looks properly installed."""
    checks = {
        "celeba": {
            "path": output_dir / "celeba" / "img_align_celeba",
            "min_files": 100000,
            "ext": "*.jpg"
        },
        "utkface": {
            "path": output_dir / "utkface",
            "min_files": 10000,
            "ext": "*.jpg"
        },
        "lfw": {
            "path": output_dir / "lfw",
            "min_files": 5000,
            "ext": "*.jpg"
        },
        "ffhq_64": {
            "path": output_dir / "ffhq_64",
            "min_files": 10000,
            "ext": "*.png"
        },
    }
    if name not in checks:
        return False
    chk = checks[name]
    path = chk["path"]
    if not path.exists():
        return False
    n = len(list(path.rglob(chk["ext"])))
    ok = n >= chk["min_files"]
    status = "✓" if ok else "✗"
    print(f"  {status} {name}: {n:,} images at {path}")
    return ok


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    p = argparse.ArgumentParser(description="Download portrait datasets for PortraitGAN")
    p.add_argument("--datasets", nargs="+", default=["utkface", "lfw"],
                   choices=list(DATASETS.keys()) + ["all"],
                   help="Which datasets to download")
    p.add_argument("--output_dir", default="./raw_data",
                   help="Where to save datasets")
    p.add_argument("--list", action="store_true",
                   help="List available datasets and exit")
    p.add_argument("--verify", action="store_true",
                   help="Check existing downloads")
    args = p.parse_args()

    if args.list:
        print("\nAvailable datasets:\n")
        for name, info in DATASETS.items():
            print(f"  {name:<25} {info['size']:<10}  {info['description']}")
            print(f"  {'':25} License: {info['license']}\n")
        return

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    datasets = list(DATASETS.keys()) if "all" in args.datasets else args.datasets

    if args.verify:
        print(f"\nVerifying datasets in {output_dir}:")
        for name in datasets:
            verify_dataset(name, output_dir)
        return

    print(f"\nPortraitGAN Dataset Downloader")
    print(f"Output directory: {output_dir}\n")

    for name in datasets:
        print(f"─── {name.upper()} ───")
        info = DATASETS.get(name)
        if not info:
            print(f"  Unknown dataset: {name}")
            continue

        # Auto-download if supported
        if name == "lfw":
            try:
                download_lfw(output_dir)
            except Exception as e:
                print(f"  ✗ Auto-download failed: {e}")
                print(f"  Manual: {info.get('url', 'see instructions')}")

        elif name == "celeba":
            print(f"  Attempting automated download via gdown...")
            success = try_celeba_gdown(output_dir)
            if not success:
                instr = info.get("instructions", "").format(output_dir=output_dir)
                print(f"\n  Manual download required:\n{instr}")

        else:
            instr = info.get("instructions", "").format(output_dir=output_dir)
            print(f"  Manual download required:\n{instr}")

        print()

    print("─── VERIFICATION ───")
    for name in datasets:
        verify_dataset(name, output_dir)

    print(f"\nNext step: python data/prepare_splits.py --input_dir {output_dir} --output_dir ./processed")


if __name__ == "__main__":
    main()
