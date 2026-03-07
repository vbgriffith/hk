# What to Expect During Training

A reference log showing typical PortraitGAN training progression
on CelebA + UTKFace (~226K images), RTX 3090, batch=64, 80 epochs.

---

## Console Output Format

```
  Epoch   1/80  Step    100  D: 1.3824  G: 1.3901  R1: 0.0432  lr: 0.000200  t/step: 187ms
  Epoch   1/80  Step    200  D: 1.2103  G: 1.6511  R1: 0.0381  lr: 0.000200  t/step: 184ms
  ...
  → Saved sample grid: run_quality/samples/step_0000500.png

  Epoch 1 done in 4.2 min  (D: 1.2843  G: 1.7201)
```

---

## Loss Progression (typical)

| Epoch | D_loss | G_loss | What you'll see in samples |
|-------|--------|--------|---------------------------|
| 1     | 1.38   | 1.40   | Random colored noise |
| 3     | 1.05   | 1.82   | Blurry skin-tone blobs |
| 5     | 0.92   | 2.01   | Oval shapes with color variation |
| 10    | 0.78   | 2.31   | Face-like shapes, no detail |
| 20    | 0.72   | 2.45   | Eye regions appear, crude hair shape |
| 30    | 0.68   | 2.52   | Recognizable face structure |
| 50    | 0.65   | 2.61   | Distinct faces, condition responds |
| 80    | 0.63   | 2.68   | Consistent quality across conditions |

**Normal behavior:**
- D_loss oscillates between 0.5 and 1.5
- G_loss slowly increases as G improves (this is correct)
- R1 penalty should stay below 0.5

---

## Training Time Estimates

| Hardware | Batch | Steps/sec | Epoch time | 80 epochs |
|----------|-------|-----------|------------|-----------|
| RTX 4090 | 64    | ~180/s    | ~2.5 min   | ~3.3 hrs  |
| RTX 3090 | 64    | ~120/s    | ~4 min     | ~5.3 hrs  |
| RTX 3080 | 64    | ~90/s     | ~5.5 min   | ~7.3 hrs  |
| RTX 3060 | 32    | ~50/s     | ~8 min     | ~10.7 hrs |
| T4 (Colab)| 32   | ~40/s     | ~10 min    | ~13.3 hrs |
| CPU (i7) | 8     | ~2/s      | ~200 min   | ~11 days  |

---

## Warning Signs

### Mode Collapse (bad)
```
D: 0.03  G: 5.81  — D has won completely, G produces one image
```
**Fix:** Load earlier checkpoint, increase R1 gamma from 10 → 20.

### D Too Strong Early
```
D: 0.05  G: 4.20  at epoch 3
```
**Fix:** This is normal for first 5 epochs if using large dataset. Should self-correct.

### G Loss Explodes
```
G: 15.32  — gradient explosion
```
**Fix:** Gradient clipping (already at 1.0) should prevent this. Check learning rate.

### Training Stalls
```
D: 0.693  G: 0.693  — Nash equilibrium at random
```
**Fix:** Reduce learning rate by 5×. Usually recovers within 10 epochs.

---

## Checkpoints

Saved every 5 epochs to:
```
run/checkpoints/
    epoch_0005.pth
    epoch_0010.pth
    ...
    latest.pth          ← always current
    generator_final.pth ← after training completes
```

Each checkpoint contains:
- `G`: raw generator state dict
- `G_ema`: EMA generator state dict (use this for export)
- `D`: discriminator state dict
- `opt_G`, `opt_D`: optimizer states (for resuming)
- `epoch`, `step`, `config`

Size: ~25 MB per checkpoint (G + D + optimizer states).

---

## Evaluating Mid-Training

Check sample grids in `run/samples/` every 500 steps.

Use evaluate.py for quantitative checks:
```bash
# Quick visual check at epoch 30:
python src/evaluate.py \
    --checkpoint run/checkpoints/epoch_0030.pth \
    --grid --output eval/epoch30/

# Full FID at epoch 80:
python src/evaluate.py \
    --checkpoint run/checkpoints/generator_final.pth \
    --all --dataset_dir processed/val/images --n_fid 5000
```

**Target metrics for "good enough to deploy":**
- FID < 60 (decent), < 40 (good), < 25 (excellent)
- Diversity score > 25
- All 30 eval prompts produce visually distinct, condition-appropriate images

---

## Export When Ready

```bash
# Export EMA weights as int8 (recommended, ~4 MB):
python export/export_weights.py \
    --checkpoint run/checkpoints/generator_final.pth \
    --output inference/weights_b64.js \
    --quantize int8

# Build final HTML:
python export/build_html.py \
    --weights inference/weights_b64.js \
    --output docs/portrait_gan.html \
    --title "FamilyPixel"

# Test it:
open docs/portrait_gan.html   # macOS
xdg-open docs/portrait_gan.html  # Linux
```
