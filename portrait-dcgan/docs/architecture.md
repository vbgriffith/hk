# PortraitGAN Architecture

## Overview

PortraitGAN is a conditional DCGAN trained to generate 64×64 portraits conditioned
on 7 independent text-derived attributes. The generator is the only component
deployed at inference — the discriminator exists solely to train the generator.

---

## Condition System

Text prompts are mapped to a 7-dimensional condition vector. Each dimension is
an integer index into a learned embedding table. The seven dimensions are:

| Dim | Name | Vocab size | Example values |
|-----|------|-----------|----------------|
| 0 | subject | 8 | individual, couple, family, group |
| 1 | age | 8 | baby, toddler, child, teen, young_adult, adult |
| 2 | ethnicity | 9 | american, east_asian, south_asian, latin, black |
| 3 | framing | 8 | headshot, waist_up, full_body, wide_group |
| 4 | style | 9 | candid, posed, formal, casual, outdoor, studio |
| 5 | hair | 9 | black_hair, brunette, blonde, red_hair, gray_hair |
| 6 | extras | 12 | smiling, with_dog, glasses, holiday, newborn |

Index 0 in every dimension means "wildcard/unknown" — the generator is free to
choose whatever it learned as the default for that dimension.

### Condition Embedding

```
condIndices [B, 7]
    → 7 separate Embedding tables, each [vocab_i, 16]
    → 7 × [B, 16] embeddings
    → Concatenate → [B, 112]
    → Linear(112, 112) + LeakyReLU(0.2)
    → cond [B, 112]
```

Total condition parameters: 7 embedding tables + 1 projection layer ≈ 25K params.

---

## Generator Architecture

```
Input: z [B, 128] + cond [B, 112]
                │
         concat([z, cond]) → [B, 240]
                │
         Linear(240 → 4×4×512) + ReLU
                │
         Reshape → [B, 512, 4, 4]
                │
         ResBlock(512) × 2  ← bottleneck residual blocks
                │
         ┌─────────────────────────────────────────┐
         │  GeneratorBlock (up1)                   │
         │  ConvTranspose2d(512→256, k=4, s=2, p=1)│
         │  CondBatchNorm(256) + ReLU              │
         │  [B, 256, 8, 8]                         │
         └─────────────────────────────────────────┘
                │
         ┌─────────────────────────────────────────┐
         │  GeneratorBlock (up2)                   │
         │  ConvTranspose2d(256→128, k=4, s=2, p=1)│
         │  CondBatchNorm(128) + ReLU              │
         │  [B, 128, 16, 16]                       │
         └─────────────────────────────────────────┘
                │
         ┌─────────────────────────────────────────┐
         │  GeneratorBlock (up3)                   │
         │  ConvTranspose2d(128→64, k=4, s=2, p=1) │
         │  CondBatchNorm(64) + ReLU               │
         │  [B, 64, 32, 32]                        │
         └─────────────────────────────────────────┘
                │
         ┌─────────────────────────────────────────┐
         │  GeneratorBlock (up4)                   │
         │  ConvTranspose2d(64→32, k=4, s=2, p=1)  │
         │  CondBatchNorm(32) + ReLU               │
         │  [B, 32, 64, 64]                        │
         └─────────────────────────────────────────┘
                │
         Conv2d(32→3, k=3, s=1, p=1) + Tanh
                │
         Output: [B, 3, 64, 64] ∈ [-1, 1]
```

### Conditional Batch Normalization

At each upsampling stage, instead of standard BN, the model uses CBN:

```
x_normalized = BatchNorm(x, affine=False)  ← standard normalize
γ = Linear(cond → C)                        ← learned per-condition scale
β = Linear(cond → C)                        ← learned per-condition shift
output = γ · x_normalized + β
```

This lets the condition vector directly control the activation statistics at
every spatial resolution — a much stronger conditioning signal than just
concatenating at the input.

### Residual Blocks at Bottleneck

```
ResBlock:
    x → Conv3×3 → BN → ReLU → Conv3×3 → BN → + x
```

Two residual blocks at 4×4 encourage the model to refine coarse structure before
upsampling begins.

---

## Discriminator Architecture (training only)

```
Input: [B, 3, 64, 64] + cond [B, 112]
                │
         DiscriminatorBlock: Conv(3→64, k=4, s=2) + LeakyReLU  → [B,64,32,32]
         DiscriminatorBlock: Conv(64→128, k=4, s=2) + LReLU    → [B,128,16,16]
         DiscriminatorBlock: Conv(128→256, k=4, s=2) + LReLU   → [B,256,8,8]
         DiscriminatorBlock: Conv(256→512, k=4, s=2) + LReLU   → [B,512,4,4]
                │
         Conv(512→512, k=4, s=1) → [B, 512, 1, 1]
                │
         Flatten → [B, 512]
                │
         ┌────────────────────────────┐
         │  Unconditional:            │
         │  Linear(512 → 1)           │ → score_uncond [B, 1]
         └────────────────────────────┘
                │
         ┌────────────────────────────┐
         │  Projection:               │
         │  inner_product(h, W·cond)  │ → score_cond  [B, 1]
         └────────────────────────────┘
                │
         final score = score_uncond + score_cond
```

**Projection discriminator** (Miyato & Koyama 2018) adds condition awareness
via an inner product between the feature vector and a condition projection,
without concatenation. More stable than concatenation-based conditioning.

All discriminator layers use spectral normalization.

---

## Training Details

### Loss Functions

**Discriminator:** Non-saturating GAN loss
```
L_D = E[softplus(-D(real))] + E[softplus(D(fake))]
```

**Generator:** Non-saturating loss
```
L_G = E[softplus(-D(fake))]
```

**R1 Gradient Penalty** (stabilizes training on real data only):
```
R1 = (γ/2) · E[||∇_x D(x)||²]   where γ=10
```
Computed every 16 steps rather than every step (lazy regularization).

### Optimizer

Adam with β₁=0.0, β₂=0.99 (standard for spectral-norm GANs).
Learning rate: 2×10⁻⁴, cosine decay to 2×10⁻⁵.
Mixed precision (AMP) on CUDA.

### EMA

Exponential moving average of generator weights with decay=0.999.
EMA weights are used for all sample generation and export — they produce
smoother, less noisy images than the raw generator weights.

---

## Parameter Count

| Component | Parameters | FP32 Size |
|-----------|-----------|-----------|
| Generator (with cond embed) | ~3.8M | ~14.5 MB |
| Discriminator (training only) | ~2.5M | ~9.5 MB |
| **Generator only (deployed)** | **~3.8M** | **~14.5 MB** |
| Generator, int8 quantized | ~3.8M | **~3.8 MB** |

Int8 quantization typically achieves 37–42 dB SNR, resulting in visually
identical outputs with 75% smaller file size.

---

## Expected Training Curves

```
Epoch 1-5:    D_loss ≈ 1.4, G_loss ≈ 1.4  (random noise output)
Epoch 5-15:   D_loss ↓ to ~0.8, G_loss ↑ to ~2.0  (D starts winning)
Epoch 15-30:  G catches up, outputs show faint structure
Epoch 30-50:  FID drops below 100, faces become recognizable
Epoch 50-80:  FID approaches 40-60, consistent face shapes
Epoch 80+:    Fine detail, diversity stabilizes
```

If G_loss exceeds 5.0 persistently, reduce learning rate.
If D_loss drops below 0.1, increase R1 penalty (γ → 20) or reduce LR.
Mode collapse: diversity score drops below 10 → restart from earlier checkpoint.
