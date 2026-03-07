# PortraitGAN — Offline Text-to-Image for People & Families

A fully self-contained, offline-capable text-to-image system for portraits, families,
candid shots, and pets. Uses a trained DCGAN generator bundled directly into a single
HTML file — **zero downloads at runtime, zero server required.**

---

## Project Structure

```
portrait-dcgan/
│
├── README.md                   ← You are here
│
├── src/
│   ├── dataset.py              ← Dataset loader, augmentation, scraping helpers
│   ├── model.py                ← Generator + Discriminator architectures
│   ├── train.py                ← Full training loop with checkpointing
│   ├── labels.py               ← All keyword classes, condition vectors
│   └── evaluate.py             ← FID score, sample grids, quality checks
│
├── data/
│   ├── download_datasets.py    ← Auto-download CelebA, UTKFace, COCO-People
│   └── prepare_splits.py       ← Resize, filter, assign condition labels
│
├── export/
│   ├── export_weights.py       ← Convert .pth → base64 Float32Array for JS
│   └── quantize.py             ← Optional int8 quantization to halve file size
│
├── inference/
│   ├── inference.js            ← Pure JS forward pass (no dependencies)
│   ├── prompt_parser.js        ← Text → condition vector mapping
│   └── renderer.js             ← Upscaling, color correction, canvas output
│
└── docs/
    ├── portrait_gan.html       ← THE FINAL DELIVERABLE: single-file app
    ├── architecture.md         ← Model architecture details
    └── training_log_example.md ← What to expect during training
```

---

## Quick Start

### Step 1 — Set up the environment

```bash
conda create -n portraitgan python=3.10
conda activate portraitgan
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
pip install pillow numpy tqdm matplotlib scipy clean-fid gdown
```

### Step 2 — Download datasets

```bash
python data/download_datasets.py --datasets celeba utkface coco-people
# Downloads ~3 GB total. Run once, cached locally.
# Approximate sizes:
#   CelebA (aligned faces, 202K images):   1.4 GB
#   UTKFace (age-labeled faces, 24K):      100 MB
#   COCO People (full-body, 64K crops):    1.5 GB
```

### Step 3 — Prepare training splits

```bash
python data/prepare_splits.py --input_dir ./raw_data --output_dir ./processed \
    --img_size 64 --conditions all
# Resizes to 64×64, assigns condition labels from labels.py
# Outputs: processed/train/ and processed/val/ with label manifests
```

### Step 4 — Train

```bash
# Fast training (4–8 hrs, RTX 3060 8GB):
python src/train.py --config configs/fast.yaml

# Quality training (12–24 hrs, RTX 3090 24GB):
python src/train.py --config configs/quality.yaml

# CPU-only training (36–72 hrs, any machine):
python src/train.py --config configs/cpu.yaml
```

Training outputs:
- `checkpoints/generator_epoch_XXX.pth` — generator at each checkpoint
- `samples/` — visual grid every 500 steps
- `training_log.csv` — loss curves

### Step 5 — Export to JavaScript

```bash
python export/export_weights.py \
    --checkpoint checkpoints/generator_best.pth \
    --output inference/weights_b64.js \
    --quantize int8
# Produces a ~2-5 MB JS file with all weights as a Float32Array literal
```

### Step 6 — Build the final HTML

```bash
python export/build_html.py \
    --weights inference/weights_b64.js \
    --template inference/portrait_template.html \
    --output docs/portrait_gan.html
# Produces a single self-contained HTML file, typically 3–8 MB
# Open in any browser — no server, no internet required
```

---

## Keyword System

The model understands structured keywords organized into **7 condition dimensions**.
You can combine one option from each dimension, or leave dimensions unset (wildcard).

| Dimension      | Options |
|---------------|---------|
| **Subject**    | `individual`, `couple`, `group`, `family` |
| **Age**        | `baby`, `toddler`, `child`, `teen`, `young_adult`, `adult` |
| **Ethnicity**  | `american`, `asian`, `latin`, `diverse` |
| **Framing**    | `portrait`, `headshot`, `full_body`, `waist_up` |
| **Style**      | `candid`, `posed`, `formal`, `casual` |
| **Hair**       | `blonde`, `brunette`, `black_hair`, `red_hair`, `gray_hair` |
| **Extras**     | `with_pet`, `outdoor`, `indoor`, `smiling` |

**Example prompts parsed by the system:**
```
"asian family portrait"       → ethnicity=asian, subject=family, framing=portrait
"candid group of teens"       → style=candid, subject=group, age=teen
"blonde toddler full body"    → hair=blonde, age=toddler, framing=full_body
"american adult with pet"     → ethnicity=american, age=adult, extras=with_pet
"formal asian couple portrait"→ style=formal, ethnicity=asian, subject=couple, framing=portrait
```

---

## Model Architecture

### Generator (bundled in HTML)
- Input: 128-d noise vector + 64-d condition embedding
- Architecture: Transposed convolution UNet, 5 stages
- Output: 64×64 RGB image (upgradeable to 128×128)
- Parameters: ~3.8M
- Size: ~15 MB (float32) → ~4 MB (int8 quantized, gzipped)

### Discriminator (training only, discarded after)
- Input: 64×64 RGB image + 64-d condition embedding  
- Architecture: Strided convolution, 5 stages + projection discriminator
- Parameters: ~2.5M
- Purpose: Not deployed — exists only to train the generator

### Text Conditioning
- No CLIP, no T5, no transformer required
- Condition vector = concatenation of 7 learned embedding tables (one per dimension)
- Total condition dim: 64 (7 × ~9-d per dimension, projected to 64)
- Vocabulary: ~50 keywords total, mapped to indices

---

## Hardware Requirements

| Training Setup | GPU | VRAM | Expected Time | Output Quality |
|---------------|-----|------|---------------|----------------|
| Fast (recommended) | RTX 3060 | 8 GB | 4–8 hrs | Good |
| Quality | RTX 3090 / 4090 | 24 GB | 12–24 hrs | Excellent |
| Budget | GTX 1080 Ti | 11 GB | 16–36 hrs | Good |
| CPU only | — | 16 GB RAM | 36–72 hrs | Good |
| Google Colab (free T4) | T4 | 15 GB | 6–10 hrs | Good |

---

## Expected Results

After training, the generator produces:
- **Faces**: recognizable face structure with age/ethnicity variation
- **Full body**: rough body proportions, clothing color variation  
- **Groups**: 2–5 figure compositions with spatial arrangement
- **Pets**: simplified dog/cat forms alongside people figures

At 64×64, results resemble "blurry photo thumbnails" — faces are recognizable,
compositions read correctly, but fine detail (individual facial features, text on
clothing) is not expected. This matches the quality of early Stable Diffusion
latent codes before the VAE decoder upscales them.

Use the built-in **4× bilinear upscaler** in the HTML to display at 256×256.

---

## Extending the Model

### To add new keywords:
1. Add entries to `src/labels.py` → `CONDITION_VOCAB`
2. Re-run `data/prepare_splits.py` to relabel your dataset
3. Retrain from latest checkpoint: `--resume checkpoints/latest.pth`

### To increase resolution to 128×128:
- In `src/model.py`, set `IMG_SIZE = 128`
- Increase dataset size to 50K+ images for best results
- Training time approximately doubles; generator size increases to ~8 MB

### To add your own photos:
```bash
# Drop JPG/PNG files in raw_data/custom/
# Name files with labels: asian_family_portrait_001.jpg
# Or use a metadata CSV — see data/prepare_splits.py --help
python data/prepare_splits.py --include_custom --custom_dir raw_data/custom/
```

---

## Files You Actually Need to Run Inference

After training and export, the only file needed for end-users is:

```
docs/portrait_gan.html   (~3–8 MB)
```

Open it in any modern browser. No internet. No Python. No installation.

---

## License & Data

- Code: MIT License
- CelebA dataset: Non-commercial research only (original license applies)
- UTKFace: Research/non-commercial
- COCO: CC BY 4.0
- Your trained model weights: You own them

**Do not** train on scraped data without verifying licensing.
Consider using [FFHQ](https://github.com/NVlabs/ffhq-dataset) (Flickr-Faces-HQ)
as an alternative — permissive licensing, 70K high-quality faces.
