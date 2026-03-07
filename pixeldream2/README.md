# PixelDream v2 — 100% Offline Text-to-Image Generator

> Zero downloads. Zero internet. Zero model files. Open `index.html` and generate.

---

## 🚀 Quick Start

1. Unzip the folder
2. Open `index.html` in any modern browser
3. Type a prompt — click **Generate Image**
4. Done. No setup, no loading, no waiting.

---

## ⚡ Truly Offline — How?

### Why not Stable Diffusion?

Every genuine neural diffusion model (Stable Diffusion, DALL·E mini, etc.) requires downloading 200 MB–2 GB of weights before use. There is no way around this — the weights *are* the trained knowledge. A version that claims to work offline without any prior download is either:
- Extremely low quality (tiny 1–2 MB models produce barely-recognisable noise)
- Actually loading from a cache set up beforehand
- Not a real diffusion model

### What PixelDream uses instead

PixelDream is a **semantic procedural synthesis engine** — a different paradigm:

| Component | Implementation |
|---|---|
| **Text understanding** | Rule-based NLP keyword parser |
| **Semantic vocabulary** | ~200 hand-curated subject/environment/lighting descriptors encoded as JS constants |
| **Image rendering** | Layered procedural synthesis on HTML5 Canvas |
| **Noise generation** | Seeded Perlin-style coherent noise |
| **Style transfer** | Pixel-level post-processing (blur, dab, desaturate, grain) |
| **Colour science** | HSL palettes derived from artistic colour theory |

The "pre-trained" knowledge is baked directly into the JavaScript as a semantic vocabulary table — comparable to how an artist has internalised colour relationships and compositional rules. The model *is* the code.

### What you get

- Unique image for every prompt + seed combination
- Deterministic: same prompt + seed = same image every time
- Subjects: humans of all ages (baby → elderly) + animals
- Environments: beach, forest, snow, urban, lab, library, sea, rooftop…
- Lighting: sunset, moonlit, candlelight, dramatic, warm afternoon…
- 6 style filters: Photorealistic, Oil Painting, Watercolour, Pencil Sketch, Impressionist, Neon
- 4 output sizes: 256×256 up to 768×768

---

## 📁 Files

```
pixeldream/
├── index.html    ← The entire application (open this)
├── sw.js         ← Service Worker (optional offline caching)
└── README.md     ← This file
```

Everything is in `index.html`. No external model files. No node_modules. No build step.

---

## 🎨 Best Prompts

Describe your subject, environment, and lighting explicitly:

```
elderly man reading a book, warm candlelight, oil painting
baby laughing, close portrait, soft window light
young girl running on beach at sunset, candid
majestic wolf in snowy forest, moonlight
golden retriever puppy in green grass, sunny day
middle-aged woman scientist in laboratory
old fisherman weathered face, sea background
```

**Tips:**
- Name the age: `elderly`, `old`, `baby`, `toddler`, `teenager`, `young`, `middle-aged`
- Name the setting: `beach`, `forest`, `garden`, `snow`, `street`, `laboratory`, `library`, `sea`
- Name the light: `sunset`, `moonlit`, `candlelight`, `warm`, `dramatic`, `window light`
- Use **Seed** to explore variations of the same prompt

---

## ⚙️ Controls

| Control | Effect |
|---|---|
| **Detail** (1–10) | Rendering passes and texture complexity |
| **Mood** (0–100) | Colour saturation and warmth |
| **Seed** (0–9999) | Deterministic variation source |
| **Size** | Output resolution: 256 / 512 / 640 / 768 px |
| **Style** | Post-processing filter applied to the render |

---

## 🌐 Optional: Service Worker

For the Service Worker to register (enabling the app to work offline even when opened via `file://`), serve via a local HTTP server:

```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .
```

Then open `http://localhost:8080`. After first visit, fully offline.

> Without a local server, the app still works fine from `file://` — only the Service Worker won't register, which only matters for PWA installation.

---

## 📄 License

MIT — free to use, modify, and distribute.

---

*PixelDream — all synthesis runs in-browser, no server, no model weights, no internet required.*
