# PixelDream — Real AI Text-to-Image Generator

Generates **photorealistic images** using **Stable Diffusion 1.5** running entirely
in your browser. No server. No Python. No GPU required.

---

## ⚡ Quick Start

1. Open `index.html` in **Chrome 113+** or **Edge 113+**
2. Click **"Download Model & Start"**
3. Wait for the ~600 MB one-time download (progress shown)
4. Type a prompt → Generate

**After the first download the model is cached permanently. Close the tab, reopen, and it loads instantly with no internet needed.**

---

## 🔑 The Key Fact About Offline AI Image Generation

Real diffusion models store their "knowledge" as hundreds of millions of floating-point
weight values — about 600 MB for SD 1.5. There is no way to bundle this in a zip file
and have it work without any download.

What PixelDream does instead:

| Phase | Internet? | Time |
|---|---|---|
| First run — model download | ✅ Required | ~5–15 min on broadband |
| After caching — every run | ❌ Not needed | Loads in ~5–30 seconds |
| Image generation | ❌ Not needed | 30s–2min (CPU) / 5–20s (GPU) |

The model is stored in your browser's **IndexedDB** (same mechanism as service workers,
but more persistent). It survives browser restarts.

---

## 🎨 Features

- **Real Stable Diffusion 1.5** — photorealistic people, animals, scenes
- **WebGPU acceleration** — automatically uses GPU if available (Chrome/Edge)
- **14 prompt chips** — people of all ages + animals, ready to click
- **6 style suffixes** — Photo, Oil Paint, Watercolour, Pencil, Impressionist, Neon
- **Full parameter control** — steps, guidance scale, seed
- **In-session gallery** — save and revisit generated images
- **PNG download** — one click

---

## ⚙️ Parameter Guide

| Parameter | Range | Notes |
|---|---|---|
| **Steps** | 1–20 | More steps = better quality, slower. 4–8 is sweet spot for SD 1.5 |
| **Guidance** | 0–15 | How closely to follow prompt. 7–9 recommended. 0 = ignore prompt |
| **Seed** | 0–9999 | Same seed + same prompt = same image |

---

## 💻 Browser Requirements

| Browser | CPU (WASM) | GPU (WebGPU) |
|---|---|---|
| Chrome 113+ | ✅ | ✅ Recommended |
| Edge 113+ | ✅ | ✅ Recommended |
| Firefox | ✅ | ⚠️ Experimental |
| Safari | ✅ | ❌ Not yet |

---

## 📁 Files

```
pixeldream/
├── index.html    ← Open this in your browser
└── README.md     ← This file
```

---

## 🔒 Privacy

All processing happens on your device. No prompts, no images, no data of any kind
is sent to any server after the initial model download from HuggingFace.

---

## 📄 License

MIT. Model weights © Stability AI / RunwayML —
[CreativeML Open RAIL-M License](https://huggingface.co/spaces/CompVis/stable-diffusion-license)
