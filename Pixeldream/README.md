# PixelDream — In-Browser Text-to-Image Generator

> 100% offline text-to-image generation running entirely in your browser.  
> No server. No API key. No data leaves your device.

---

## 🚀 Quick Start

1. **Open `index.html`** in a modern browser (Chrome 90+, Firefox 90+, Edge 90+)
2. Click **"⚡ Load Model & Generate"**
3. Wait for the model to download (one-time, ~600 MB — then cached forever)
4. Type a prompt and generate!

> **Tip:** After the first load the model is cached in your browser's IndexedDB and the app's files are cached by the Service Worker. You can go fully offline and it will still work.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Model** | Xenova/stable-diffusion-v1-5 (ONNX, browser-optimized) |
| **Library** | [@xenova/transformers](https://github.com/xenova/transformers.js) v2.17.2 via jsDelivr |
| **Runtime** | ONNX Runtime Web (WebAssembly + WebGPU where available) |
| **Offline** | ✅ Works fully offline after first model download |
| **Privacy** | ✅ Zero data sent anywhere after initial download |
| **Output sizes** | 256×256, 384×384, 512×512, 512×768, 768×512, 768×768 |
| **Controls** | Prompt, negative prompt, steps, guidance scale, seed |
| **Gallery** | In-session gallery with click-to-restore |
| **Download** | One-click PNG export |

---

## 🎨 Optimized Prompts for People & Animals

The app ships with curated example prompts for:

- 👴 **Elderly people** — seniors, grandparents, aged portraits
- 👶 **Babies & toddlers** — infants, young children
- 🧒 **Children** — kids at play
- 👦 **Teenagers** — youth, adolescents
- 👩 **Adults** — professionals, everyday people
- 🐺 **Wild animals** — wolves, bears, eagles
- 🐕 **Domestic animals** — dogs, cats, birds
- 🦁 **Exotic animals** — lions, parrots, horses

**Tip for best results with people:**  
Describe age explicitly: _"elderly woman", "teenage boy", "young child", "middle-aged man"_ etc.

---

## ⚙️ Parameters Guide

| Parameter | Range | Effect |
|---|---|---|
| **Steps** | 1–50 | Higher = more detail, slower. 15–25 is sweet spot. |
| **Guidance Scale** | 1–20 | Higher = more prompt-adherent, less creative. 7–10 recommended. |
| **Seed** | 0–9999 | Same seed + same prompt = same image. Change for variation. |

---

## 💻 Technical Architecture

```
index.html              — Main app UI (HTML + CSS + JS)
sw.js                   — Service Worker for offline caching
```

### How it works:

1. **Transformers.js** is loaded from jsDelivr CDN (`cdn.jsdelivr.net/npm/@xenova/transformers`)
2. On first generate, it fetches the **Stable Diffusion v1.5** model (ONNX format) from HuggingFace Hub
3. Models are stored in **browser IndexedDB** — persisting between sessions
4. The **Service Worker** (`sw.js`) caches the app shell and CDN assets
5. Inference runs in a **Web Worker** (via Transformers.js internals) using **ONNX Runtime Web**
6. Output pixels are drawn directly to an HTML `<canvas>` element

### Performance expectations:

| Device | 256×256 / 20 steps |
|---|---|
| Modern laptop (CPU) | ~30–90 seconds |
| Desktop with GPU | ~10–30 seconds (if WebGPU enabled) |
| Mobile | Not recommended |

> Smaller output sizes and fewer steps = dramatically faster generation.

---

## 🌐 First Run Requirements

- Internet connection (to download model ~600 MB from HuggingFace)
- Modern browser with WebAssembly support
- ~1 GB free browser storage

After first run: **100% offline**, no internet needed.

---

## 🔒 Privacy

- No analytics
- No tracking  
- No server communication after model download
- All generation happens on your CPU/GPU locally

---

## 📦 Files

```
pixeldream/
├── index.html    ← Open this in your browser
├── sw.js         ← Service Worker (auto-registered by index.html)
└── README.md     ← This file
```

---

## 🛠️ Troubleshooting

**Model won't load?**
- Check your internet connection (required for first download)
- Try a different browser (Chrome recommended)
- Clear browser cache and retry

**Generation is very slow?**
- Use smaller output size (256×256)
- Reduce steps to 10–15
- Close other browser tabs

**"Out of memory" error?**
- Use smaller output size
- Close other tabs/apps
- Restart browser

**Service Worker not registering?**
- Must be served over `http://` or `https://` (not `file://`)
- Use a local server: `python3 -m http.server 8080` then open `http://localhost:8080`

---

## 📄 License

MIT — free to use, modify, and distribute.

Model weights © Stability AI / RunwayML — [CreativeML Open RAIL-M License](https://huggingface.co/spaces/CompVis/stable-diffusion-license)

---

*Built with ❤️ using Transformers.js + ONNX Runtime Web*
