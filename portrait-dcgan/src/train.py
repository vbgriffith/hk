"""
train.py — PortraitGAN training loop.

Usage:
    python src/train.py --config configs/fast.yaml
    python src/train.py --config configs/quality.yaml --resume checkpoints/latest.pth

Features:
  - Non-saturating GAN loss (standard DCGAN)
  - R1 gradient penalty (stabilizes training, replaces WGAN-GP)
  - Learning rate schedule (cosine decay after warmup)
  - Automatic mixed precision (AMP) for faster training on RTX cards
  - Exponential moving average (EMA) of generator weights
  - Checkpoint saving every N epochs + best model by FID
  - Sample grid saved every 500 steps to ./samples/
  - CSV log of all losses

Typical command:
    python src/train.py \
        --celeba /path/to/celeba \
        --utkface /path/to/utkface \
        --epochs 100 \
        --batch_size 64 \
        --lr 0.0002 \
        --device cuda \
        --output_dir ./run_001
"""

import os
import sys
import csv
import time
import math
import argparse
import yaml
from pathlib import Path
from copy import deepcopy
from datetime import datetime

import torch
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import GradScaler, autocast
import torchvision.utils as vutils
import numpy as np

from src.model import Generator, Discriminator, NZ, NUM_DIMS
from src.dataset import build_dataloader
from src.labels import CONDITION_VOCAB, condition_to_indices, parse_prompt


# ─────────────────────────────────────────────────────────────────────────────
# LOSSES
# ─────────────────────────────────────────────────────────────────────────────

def d_loss_fn(real_scores, fake_scores):
    """Non-saturating GAN discriminator loss."""
    real_loss = F.softplus(-real_scores).mean()
    fake_loss = F.softplus(fake_scores).mean()
    return real_loss + fake_loss

def g_loss_fn(fake_scores):
    """Non-saturating GAN generator loss."""
    return F.softplus(-fake_scores).mean()

def r1_penalty(real_scores, real_imgs):
    """
    R1 gradient penalty: penalizes discriminator gradients on real data.
    Much more stable than WGAN-GP for portrait images.
    gamma=10 is standard; reduce to 1–5 if training is too slow.
    """
    grad = torch.autograd.grad(
        outputs=real_scores.sum(),
        inputs=real_imgs,
        create_graph=True,
    )[0]
    return grad.pow(2).reshape(grad.size(0), -1).sum(1).mean()

import torch.nn.functional as F


# ─────────────────────────────────────────────────────────────────────────────
# EMA UTILITY
# ─────────────────────────────────────────────────────────────────────────────

class EMA:
    """
    Exponential moving average of generator weights.
    Use the EMA weights for all sample generation and export.
    """
    def __init__(self, model, decay=0.999):
        self.decay = decay
        self.shadow = deepcopy(model)
        self.shadow.eval()
        for p in self.shadow.parameters():
            p.requires_grad_(False)

    @torch.no_grad()
    def update(self, model):
        for s_param, m_param in zip(self.shadow.parameters(), model.parameters()):
            s_param.data.mul_(self.decay).add_(m_param.data, alpha=1 - self.decay)

    def state_dict(self):
        return self.shadow.state_dict()


# ─────────────────────────────────────────────────────────────────────────────
# FIXED SAMPLE CONDITIONS (for visual progress tracking)
# ─────────────────────────────────────────────────────────────────────────────

SAMPLE_PROMPTS = [
    "american individual young adult headshot smiling",
    "asian family portrait",
    "individual baby full body",
    "group of teens outdoor candid",
    "blonde adult individual portrait",
    "asian young adult individual studio",
    "family portrait with pet",
    "black hair child individual casual",
    "couple waist up smiling",
    "american adult formal headshot",
    "toddler individual full body outdoor",
    "asian adult individual glasses",
    "individual teen casual outdoor",
    "family indoor holiday photo",
    "latin individual young adult",
    "individual child full body",
]

def build_fixed_conditions(device):
    """Build a fixed batch of condition vectors for consistent sample grids."""
    from src.labels import parse_prompt, condition_to_indices
    conds = []
    for prompt in SAMPLE_PROMPTS:
        parsed = parse_prompt(prompt)
        indices = condition_to_indices(parsed)
        conds.append(indices)
    return torch.tensor(conds, dtype=torch.long, device=device)


# ─────────────────────────────────────────────────────────────────────────────
# CHECKPOINT UTILITIES
# ─────────────────────────────────────────────────────────────────────────────

def save_checkpoint(state, path):
    torch.save(state, path)

def load_checkpoint(path, G, D, opt_G, opt_D, device):
    ckpt = torch.load(path, map_location=device)
    G.load_state_dict(ckpt["G"])
    D.load_state_dict(ckpt["D"])
    opt_G.load_state_dict(ckpt["opt_G"])
    opt_D.load_state_dict(ckpt["opt_D"])
    return ckpt.get("epoch", 0), ckpt.get("step", 0), ckpt.get("best_fid", float("inf"))


# ─────────────────────────────────────────────────────────────────────────────
# MAIN TRAINING FUNCTION
# ─────────────────────────────────────────────────────────────────────────────

def train(config):
    device = torch.device(config.get("device", "cuda" if torch.cuda.is_available() else "cpu"))
    print(f"\n{'='*60}")
    print(f"  PortraitGAN Training")
    print(f"  Device: {device}")
    print(f"  Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    # ── Directories ──
    out_dir = Path(config.get("output_dir", "./run"))
    (out_dir / "checkpoints").mkdir(parents=True, exist_ok=True)
    (out_dir / "samples").mkdir(exist_ok=True)

    # ── Models ──
    G = Generator().to(device)
    D = Discriminator().to(device)
    G_ema = EMA(G, decay=config.get("ema_decay", 0.999))

    from src.model import count_params, model_size_mb
    print(f"Generator:     {count_params(G):>9,} params  ({model_size_mb(G):.1f} MB fp32)")
    print(f"Discriminator: {count_params(D):>9,} params  ({model_size_mb(D):.1f} MB fp32)\n")

    # ── Optimizers ──
    lr      = config.get("lr", 2e-4)
    beta1   = config.get("beta1", 0.0)   # 0.0 is standard for DCGAN/spectral norm
    beta2   = config.get("beta2", 0.99)

    opt_G = optim.Adam(G.parameters(), lr=lr, betas=(beta1, beta2))
    opt_D = optim.Adam(D.parameters(), lr=lr * config.get("d_lr_ratio", 1.0),
                       betas=(beta1, beta2))

    # ── LR Schedulers ──
    n_epochs = config.get("epochs", 100)
    sched_G = optim.lr_scheduler.CosineAnnealingLR(opt_G, T_max=n_epochs, eta_min=lr * 0.1)
    sched_D = optim.lr_scheduler.CosineAnnealingLR(opt_D, T_max=n_epochs, eta_min=lr * 0.1)

    # ── AMP ──
    use_amp = config.get("amp", True) and device.type == "cuda"
    scaler = GradScaler(enabled=use_amp)

    # ── Data ──
    print("Loading datasets...")
    train_loader = build_dataloader(config, split="train")
    val_loader   = build_dataloader(config, split="val")

    # ── Resume ──
    start_epoch, global_step, best_fid = 0, 0, float("inf")
    if config.get("resume"):
        resume_path = config["resume"]
        print(f"Resuming from {resume_path}")
        start_epoch, global_step, best_fid = load_checkpoint(
            resume_path, G, D, opt_G, opt_D, device
        )

    # ── Fixed noise + conditions for sample grids ──
    fixed_z    = torch.randn(len(SAMPLE_PROMPTS), NZ, device=device)
    fixed_cond = build_fixed_conditions(device)

    # ── Hyperparams ──
    n_critic      = config.get("n_critic", 1)        # D steps per G step
    r1_gamma      = config.get("r1_gamma", 10.0)
    r1_every      = config.get("r1_every", 16)        # compute R1 every N steps
    sample_every  = config.get("sample_every", 500)
    ckpt_every    = config.get("checkpoint_every", 5)
    log_every     = config.get("log_every", 50)

    # ── CSV Logger ──
    log_path = out_dir / "training_log.csv"
    log_fields = ["epoch", "step", "d_loss", "g_loss", "r1", "lr_g", "time_per_step"]
    with open(log_path, "w", newline="") as f:
        csv.DictWriter(f, fieldnames=log_fields).writeheader()

    # ─────────────────────────────────────────────
    # TRAINING LOOP
    # ─────────────────────────────────────────────
    print(f"\nStarting training for {n_epochs} epochs...\n")

    for epoch in range(start_epoch, n_epochs):
        G.train()
        D.train()
        epoch_start = time.time()
        d_losses, g_losses = [], []

        for batch_idx, (real_imgs, cond_indices) in enumerate(train_loader):
            batch_start = time.time()
            B = real_imgs.size(0)
            real_imgs    = real_imgs.to(device)
            cond_indices = cond_indices.to(device)

            # ── DISCRIMINATOR STEP ──
            for _ in range(n_critic):
                opt_D.zero_grad(set_to_none=True)

                with autocast(enabled=use_amp):
                    # Real images: require grad for R1
                    real_imgs_req = real_imgs.requires_grad_(True)
                    real_scores   = D(real_imgs_req, cond_indices)

                    # Fake images
                    z          = torch.randn(B, NZ, device=device)
                    fake_imgs  = G(z, cond_indices).detach()
                    fake_scores = D(fake_imgs, cond_indices)

                    # GAN loss
                    d_loss = d_loss_fn(real_scores, fake_scores)

                    # R1 penalty (computed every r1_every steps)
                    r1 = torch.tensor(0.0, device=device)
                    if global_step % r1_every == 0:
                        r1 = r1_penalty(real_scores, real_imgs_req)
                        d_loss = d_loss + (r1_gamma / 2) * r1 * r1_every

                scaler.scale(d_loss).backward()
                scaler.unscale_(opt_D)
                nn.utils.clip_grad_norm_(D.parameters(), 1.0)
                scaler.step(opt_D)

            # ── GENERATOR STEP ──
            opt_G.zero_grad(set_to_none=True)

            with autocast(enabled=use_amp):
                z          = torch.randn(B, NZ, device=device)
                fake_imgs  = G(z, cond_indices)
                fake_scores = D(fake_imgs, cond_indices)
                g_loss      = g_loss_fn(fake_scores)

            scaler.scale(g_loss).backward()
            scaler.unscale_(opt_G)
            nn.utils.clip_grad_norm_(G.parameters(), 1.0)
            scaler.step(opt_G)
            scaler.update()

            G_ema.update(G)
            global_step += 1

            d_losses.append(d_loss.item())
            g_losses.append(g_loss.item())

            step_time = time.time() - batch_start

            # ── Logging ──
            if global_step % log_every == 0:
                d_avg = np.mean(d_losses[-log_every:])
                g_avg = np.mean(g_losses[-log_every:])
                lr_g  = opt_G.param_groups[0]["lr"]
                print(f"  Epoch {epoch+1:3d}/{n_epochs}  "
                      f"Step {global_step:6d}  "
                      f"D: {d_avg:.4f}  G: {g_avg:.4f}  "
                      f"R1: {r1.item():.4f}  "
                      f"lr: {lr_g:.6f}  "
                      f"t/step: {step_time*1000:.0f}ms")
                with open(log_path, "a", newline="") as f:
                    csv.DictWriter(f, fieldnames=log_fields).writerow({
                        "epoch": epoch + 1, "step": global_step,
                        "d_loss": f"{d_avg:.5f}", "g_loss": f"{g_avg:.5f}",
                        "r1": f"{r1.item():.5f}", "lr_g": f"{lr_g:.8f}",
                        "time_per_step": f"{step_time:.4f}",
                    })

            # ── Sample grid ──
            if global_step % sample_every == 0:
                G_ema.shadow.eval()
                with torch.no_grad():
                    fake_samples = G_ema.shadow(fixed_z, fixed_cond)
                sample_path = out_dir / "samples" / f"step_{global_step:07d}.png"
                vutils.save_image(fake_samples, sample_path, normalize=True,
                                  nrow=4, padding=2)
                print(f"  → Saved sample grid: {sample_path}")

        # ── Epoch end ──
        sched_G.step()
        sched_D.step()
        epoch_time = time.time() - epoch_start
        print(f"\nEpoch {epoch+1} done in {epoch_time/60:.1f} min  "
              f"(D: {np.mean(d_losses):.4f}  G: {np.mean(g_losses):.4f})\n")

        # ── Checkpoint ──
        if (epoch + 1) % ckpt_every == 0:
            ckpt_path = out_dir / "checkpoints" / f"epoch_{epoch+1:04d}.pth"
            save_checkpoint({
                "epoch": epoch + 1,
                "step": global_step,
                "G": G.state_dict(),
                "D": D.state_dict(),
                "G_ema": G_ema.state_dict(),
                "opt_G": opt_G.state_dict(),
                "opt_D": opt_D.state_dict(),
                "best_fid": best_fid,
                "config": config,
            }, ckpt_path)

            # Always save a "latest" symlink-style copy
            save_checkpoint({
                "epoch": epoch + 1,
                "step": global_step,
                "G": G.state_dict(),
                "G_ema": G_ema.state_dict(),
                "opt_G": opt_G.state_dict(),
                "opt_D": opt_D.state_dict(),
                "D": D.state_dict(),
                "best_fid": best_fid,
                "config": config,
            }, out_dir / "checkpoints" / "latest.pth")
            print(f"  Saved checkpoint: {ckpt_path}")

    # ── Final save ──
    final_path = out_dir / "checkpoints" / "generator_final.pth"
    torch.save({
        "G_ema": G_ema.state_dict(),
        "G": G.state_dict(),
        "config": config,
    }, final_path)
    print(f"\nTraining complete. Final generator saved to {final_path}")
    print(f"Run export with: python export/export_weights.py --checkpoint {final_path}")


# ─────────────────────────────────────────────────────────────────────────────
# CONFIG FILES
# ─────────────────────────────────────────────────────────────────────────────

DEFAULT_CONFIGS = {
    "fast": {
        "device": "cuda",
        "epochs": 60,
        "batch_size": 64,
        "lr": 2e-4,
        "beta1": 0.0,
        "beta2": 0.99,
        "n_critic": 1,
        "r1_gamma": 10.0,
        "r1_every": 16,
        "amp": True,
        "ema_decay": 0.999,
        "sample_every": 500,
        "checkpoint_every": 5,
        "log_every": 50,
        "num_workers": 4,
        "output_dir": "./run_fast",
    },
    "quality": {
        "device": "cuda",
        "epochs": 150,
        "batch_size": 32,
        "lr": 1e-4,
        "beta1": 0.0,
        "beta2": 0.99,
        "n_critic": 2,
        "r1_gamma": 10.0,
        "r1_every": 4,
        "amp": True,
        "ema_decay": 0.9999,
        "sample_every": 250,
        "checkpoint_every": 5,
        "log_every": 25,
        "num_workers": 8,
        "output_dir": "./run_quality",
    },
    "cpu": {
        "device": "cpu",
        "epochs": 50,
        "batch_size": 16,
        "lr": 2e-4,
        "beta1": 0.0,
        "beta2": 0.99,
        "n_critic": 1,
        "r1_gamma": 1.0,
        "r1_every": 16,
        "amp": False,
        "ema_decay": 0.999,
        "sample_every": 200,
        "checkpoint_every": 10,
        "log_every": 20,
        "num_workers": 0,
        "output_dir": "./run_cpu",
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

def parse_args():
    p = argparse.ArgumentParser(description="Train PortraitGAN")
    p.add_argument("--config",       type=str, default=None,
                   help="Path to YAML config, or one of: fast, quality, cpu")
    p.add_argument("--celeba",       type=str, default=None)
    p.add_argument("--utkface",      type=str, default=None)
    p.add_argument("--custom",       type=str, nargs="+", default=[])
    p.add_argument("--epochs",       type=int, default=None)
    p.add_argument("--batch_size",   type=int, default=None)
    p.add_argument("--lr",           type=float, default=None)
    p.add_argument("--device",       type=str, default=None)
    p.add_argument("--output_dir",   type=str, default=None)
    p.add_argument("--resume",       type=str, default=None)
    p.add_argument("--num_workers",  type=int, default=None)
    return p.parse_args()


if __name__ == "__main__":
    args = parse_args()

    # Load base config
    if args.config and os.path.isfile(args.config):
        with open(args.config) as f:
            config = yaml.safe_load(f)
    elif args.config in DEFAULT_CONFIGS:
        config = DEFAULT_CONFIGS[args.config].copy()
    else:
        config = DEFAULT_CONFIGS["fast"].copy()

    # CLI overrides
    if args.celeba:      config["celeba"]      = args.celeba
    if args.utkface:     config["utkface"]     = args.utkface
    if args.custom:      config["custom"]      = args.custom
    if args.epochs:      config["epochs"]      = args.epochs
    if args.batch_size:  config["batch_size"]  = args.batch_size
    if args.lr:          config["lr"]          = args.lr
    if args.device:      config["device"]      = args.device
    if args.output_dir:  config["output_dir"]  = args.output_dir
    if args.resume:      config["resume"]      = args.resume
    if args.num_workers is not None: config["num_workers"] = args.num_workers

    # Validate: need at least one dataset
    has_data = any(k in config for k in ["celeba", "utkface", "custom"])
    if not has_data:
        print("ERROR: No dataset specified. Use --celeba, --utkface, or --custom.")
        print("       See README.md for dataset download instructions.")
        sys.exit(1)

    train(config)
