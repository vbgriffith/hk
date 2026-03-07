"""
evaluate.py — Evaluate a trained PortraitGAN generator.

Metrics:
  - FID (Fréchet Inception Distance) via clean-fid
  - Per-condition sample grids (visual inspection)
  - Coverage: fraction of condition space that produces diverse outputs

Usage:
    # Generate a visual sample grid for all conditions:
    python src/evaluate.py \
        --checkpoint run/checkpoints/generator_best.pth \
        --output eval_samples/

    # Compute FID against a dataset:
    python src/evaluate.py \
        --checkpoint run/checkpoints/generator_best.pth \
        --fid --dataset_dir ./processed/val/images \
        --n_fid 5000

    # Full evaluation report:
    python src/evaluate.py \
        --checkpoint run/checkpoints/generator_best.pth \
        --all --output eval/
"""

import os
import sys
import json
import argparse
from pathlib import Path

import torch
import torchvision.utils as vutils
import torchvision.transforms.functional as TF
import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent.parent))
from src.model import Generator, NZ, NUM_DIMS
from src.labels import CONDITION_VOCAB, parse_prompt, condition_to_indices


DIM_NAMES = list(CONDITION_VOCAB.keys())


# ─────────────────────────────────────────────────────────────────────────────
# LOAD GENERATOR
# ─────────────────────────────────────────────────────────────────────────────

def load_generator(checkpoint_path: str, device: torch.device) -> Generator:
    """Load generator from checkpoint, preferring EMA weights."""
    ckpt = torch.load(checkpoint_path, map_location=device)
    G = Generator().to(device)

    if "G_ema" in ckpt:
        print(f"  Using EMA weights")
        G.load_state_dict(ckpt["G_ema"])
    elif "G" in ckpt:
        G.load_state_dict(ckpt["G"])
    else:
        G.load_state_dict(ckpt)

    G.eval()
    return G


# ─────────────────────────────────────────────────────────────────────────────
# SAMPLE GENERATION
# ─────────────────────────────────────────────────────────────────────────────

@torch.no_grad()
def generate_samples(G, cond_indices_list: list, seeds: list,
                     device: torch.device) -> torch.Tensor:
    """
    Generate a batch of images.
    cond_indices_list: list of [7-int lists]
    Returns: [N, 3, 64, 64] tensor in [-1, 1]
    """
    images = []
    for i, (cond_indices, seed) in enumerate(zip(cond_indices_list, seeds)):
        torch.manual_seed(seed)
        z = torch.randn(1, NZ, device=device)
        cond = torch.tensor([cond_indices], dtype=torch.long, device=device)
        img = G(z, cond)
        images.append(img.cpu())
    return torch.cat(images, dim=0)


# ─────────────────────────────────────────────────────────────────────────────
# SAMPLE GRID: all conditions
# ─────────────────────────────────────────────────────────────────────────────

EVAL_PROMPTS = {
    # Portrait / headshot variations
    "american_adult_portrait":      "american adult headshot smiling",
    "asian_adult_portrait":         "asian adult headshot",
    "latin_adult_portrait":         "latin adult formal headshot",
    "black_adult_portrait":         "black adult headshot",
    "diverse_adult":                "diverse adult studio",

    # Full body
    "american_fullbody":            "american young adult full body casual",
    "asian_fullbody":               "asian adult full body posed",

    # Age range
    "baby_portrait":                "baby individual full body",
    "toddler_outdoor":              "toddler individual outdoor candid",
    "child_candid":                 "child individual candid outdoor",
    "teen_casual":                  "teen individual casual outdoor",
    "young_adult_candid":           "young adult individual candid",

    # Hair colors
    "blonde_portrait":              "blonde young adult individual headshot",
    "brunette_portrait":            "brunette adult individual headshot",
    "black_hair_portrait":          "black hair adult individual headshot",
    "red_hair_portrait":            "red hair young adult individual",
    "gray_hair_portrait":           "gray hair adult individual portrait",

    # Family compositions
    "family_portrait":              "family portrait posed indoor",
    "asian_family_portrait":        "asian family portrait formal",
    "american_family_candid":       "american family candid outdoor",
    "parent_child":                 "parent child individual waist up",
    "siblings":                     "siblings group candid",

    # Extras / pets
    "with_dog":                     "adult american individual with dog outdoor",
    "with_cat":                     "young adult asian individual with cat indoor",
    "couple_smiling":               "couple young adult smiling outdoor",
    "group_teens":                  "group teen candid outdoor",

    # Style variety
    "formal_studio":                "american adult individual formal studio",
    "holiday_family":               "family holiday photo indoor smiling",
    "casual_outdoor":               "child individual casual outdoor",
    "glasses":                      "adult individual glasses headshot",
}


def generate_eval_grid(G, output_dir: Path, device: torch.device,
                       seeds_per_prompt: int = 4):
    """Generate a grid of samples for all eval prompts."""
    output_dir.mkdir(parents=True, exist_ok=True)

    all_prompts = list(EVAL_PROMPTS.items())
    n = len(all_prompts)
    print(f"  Generating {n} prompts × {seeds_per_prompt} seeds = {n*seeds_per_prompt} images")

    # Per-prompt grids
    for name, prompt in all_prompts:
        cond = condition_to_indices(parse_prompt(prompt))
        cond_list = [cond] * seeds_per_prompt
        seeds     = list(range(seeds_per_prompt))

        imgs = generate_samples(G, cond_list, seeds, device)
        grid = vutils.make_grid(imgs, nrow=seeds_per_prompt, normalize=True,
                                padding=2, value_range=(-1, 1))
        path = output_dir / f"{name}.png"
        TF.to_pil_image(grid).save(path)

    # Big overview grid (1 seed per prompt)
    all_conds = [condition_to_indices(parse_prompt(p)) for _, p in all_prompts]
    all_seeds = [42] * len(all_prompts)
    all_imgs  = generate_samples(G, all_conds, all_seeds, device)
    overview  = vutils.make_grid(all_imgs, nrow=8, normalize=True,
                                 padding=2, value_range=(-1, 1))
    TF.to_pil_image(overview).save(output_dir / "_overview.png")
    print(f"  Overview grid: {output_dir / '_overview.png'}")


# ─────────────────────────────────────────────────────────────────────────────
# FID SCORING
# ─────────────────────────────────────────────────────────────────────────────

def compute_fid(G, dataset_dir: str, n_samples: int,
                device: torch.device, tmp_dir: str = "/tmp/fid_fake") -> float:
    """
    Compute FID between n_samples generated images and a real dataset directory.
    Requires: pip install clean-fid
    """
    try:
        from cleanfid import fid
    except ImportError:
        print("  cleanfid not installed. Run: pip install clean-fid")
        return -1.0

    import tempfile
    tmp = Path(tmp_dir)
    tmp.mkdir(parents=True, exist_ok=True)

    print(f"  Generating {n_samples} images for FID...")
    G.eval()
    n_batches = (n_samples + 63) // 64

    img_idx = 0
    for batch_i in range(n_batches):
        bs = min(64, n_samples - img_idx)
        z    = torch.randn(bs, NZ, device=device)
        # Random conditions
        cond = torch.randint(0, 4, (bs, NUM_DIMS), device=device)
        cond[:, 0] = torch.randint(1, 5, (bs,), device=device)  # non-zero subject

        with torch.no_grad():
            imgs = G(z, cond)  # [bs, 3, 64, 64]

        for i in range(bs):
            img = imgs[i]
            # Denormalize
            img = (img * 0.5 + 0.5).clamp(0, 1)
            pil = TF.to_pil_image(img.cpu())
            pil.save(tmp / f"{img_idx:06d}.png")
            img_idx += 1

        if (batch_i + 1) % 10 == 0:
            print(f"    Generated {img_idx}/{n_samples}")

    print(f"  Computing FID against {dataset_dir}...")
    fid_score = fid.compute_fid(
        str(dataset_dir),
        str(tmp),
        device=device,
        num_workers=4,
    )

    # Cleanup
    import shutil
    shutil.rmtree(tmp)

    return fid_score


# ─────────────────────────────────────────────────────────────────────────────
# DIVERSITY SCORE (pairwise pixel distance)
# ─────────────────────────────────────────────────────────────────────────────

@torch.no_grad()
def compute_diversity(G, device: torch.device, n_samples: int = 100) -> float:
    """
    Measure diversity as mean pairwise L2 distance between generated images.
    A well-trained GAN should have diversity > 0.3 (on normalized pixels).
    """
    cond = torch.ones(n_samples, NUM_DIMS, dtype=torch.long, device=device)
    cond[:, 0] = 1  # all "individual"
    z = torch.randn(n_samples, NZ, device=device)

    imgs = G(z, cond).view(n_samples, -1)  # [N, 3*64*64]
    # Compute pairwise distances (sample 500 pairs)
    n_pairs = min(500, n_samples * (n_samples - 1) // 2)
    dists = []
    for _ in range(n_pairs):
        i, j = torch.randint(0, n_samples, (2,))
        if i != j:
            d = (imgs[i] - imgs[j]).norm().item()
            dists.append(d)

    return np.mean(dists) if dists else 0.0


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    p = argparse.ArgumentParser(description="Evaluate PortraitGAN")
    p.add_argument("--checkpoint", required=True)
    p.add_argument("--output",     default="./eval")
    p.add_argument("--device",     default="cuda" if torch.cuda.is_available() else "cpu")
    p.add_argument("--fid",        action="store_true", help="Compute FID score")
    p.add_argument("--dataset_dir", type=str, default=None, help="Real images for FID")
    p.add_argument("--n_fid",      type=int, default=5000)
    p.add_argument("--grid",       action="store_true", help="Generate sample grids")
    p.add_argument("--all",        action="store_true", help="Run all evaluations")
    p.add_argument("--seeds_per_prompt", type=int, default=4)
    args = p.parse_args()

    device = torch.device(args.device)
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=True)

    print(f"\nLoading generator from {args.checkpoint}...")
    G = load_generator(args.checkpoint, device)

    results = {}

    if args.grid or args.all:
        print("\nGenerating sample grids...")
        grid_dir = output / "grids"
        generate_eval_grid(G, grid_dir, device, args.seeds_per_prompt)
        print(f"  Grids saved to {grid_dir}")

    if args.fid or args.all:
        if not args.dataset_dir:
            print("[WARN] --dataset_dir required for FID. Skipping.")
        else:
            print(f"\nComputing FID (n={args.n_fid})...")
            fid_score = compute_fid(G, args.dataset_dir, args.n_fid, device)
            results["fid"] = round(fid_score, 2)
            print(f"  FID: {fid_score:.2f}  (lower = better; <50 = decent, <30 = good)")

    print("\nComputing diversity score...")
    div = compute_diversity(G, device)
    results["diversity"] = round(div, 4)
    print(f"  Diversity: {div:.4f}  (>30 = good)")

    # Save results
    results_path = output / "results.json"
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nResults saved to {results_path}")
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
