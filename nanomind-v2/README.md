# NanoMind — Offline Small Language Model

A fully offline, in-browser Small Language Model (SLM) trained on a custom dataset.
No internet required. No API keys. No server. Everything runs in your browser.

## 📁 File Structure

```
nanomind/
├── index.html              ← Main application (open this!)
├── README.md               ← You're here
├── data/
│   └── dataset.json        ← Training corpus (200+ Q&A examples)
└── lib/
    ├── nanomind-engine.js  ← Core SLM: tokenizer + transformer model + RAG
    ├── code-module.js      ← Code suggestion templates & logic
    └── worker.js           ← Web Worker for background training (optional)
```

## 🚀 How to Use

### Option A: Direct file (simplest)
1. Open `index.html` directly in Chrome or Edge
2. Click **Train & Load** in the sidebar
3. Wait ~30-60 seconds for training
4. Start chatting!

### Option B: Local server (recommended, avoids CORS)
```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .

# Then open: http://localhost:8080
```

## 🧠 Architecture

### Model
- **Type**: Transformer-based Small Language Model
- **Layers**: 3 transformer blocks
- **Embedding dim**: 64
- **Attention heads**: 4 (multi-head self-attention)
- **Hidden dim**: 128 (feed-forward layers)
- **Max sequence**: 128 tokens
- **Parameters**: ~500K–800K (depending on vocab size)
- **Activation**: GELU
- **Normalization**: Layer Norm
- **Attention**: Causal (autoregressive) multi-head attention

### Tokenizer
- Word-level tokenization with punctuation splitting
- Special tokens: `<bos>`, `<eos>`, `<pad>`, `<unk>`
- Vocabulary built from training corpus

### RAG (Retrieval-Augmented Generation)
- TF-IDF bag-of-words vectors for each training example
- Cosine similarity search at inference time
- High-confidence matches returned directly
- Low-confidence matches used as generation seeds
- Ensures coherent, on-topic responses

### Training
- 3 epochs over the training dataset
- Gradient-based embedding updates
- In-browser, no WebAssembly or GPU required (pure JavaScript)
- Trained model saved to `localStorage` for instant reload

## 📊 Dataset

The `data/dataset.json` contains 200+ curated examples covering:

- **Conversation**: Greetings, general Q&A, personality
- **Web Development**: HTML elements, CSS properties, JavaScript
- **Programming Concepts**: Closures, promises, async/await, algorithms
- **Frameworks**: React, Node.js, TypeScript, REST APIs
- **Code Examples**: Navigation bars, forms, modals, todo lists, animations
- **General Knowledge**: AI/ML, computing history, philosophy, science
- **Creative**: Poems, jokes, storytelling

### Extending the Dataset

Add more examples to `data/dataset.json`:
```json
{
  "input": "your question or prompt here",
  "output": "the ideal response"
}
```
Then re-train with the **Train & Load** button.

## ⚡ Features

### Chat Mode
- Conversational AI powered by the trained model
- Streaming token output
- Adjustable temperature (creativity) and top-P sampling
- Chat history context
- Quick-start suggestion chips

### Code Mode
- HTML, CSS, JavaScript, and Full Page generation
- Pattern-matched template library for 15+ common UI components:
  - Navigation bars, forms, cards, modals, tables
  - CSS animations, grid layouts, button styles, dark mode
  - JavaScript fetch utilities, todo apps, search/filter, form validation
- Model-augmented output for novel requests

### Image Mode
- Procedural SVG art generation seeded by your text prompt
- 5 style modes: Abstract, Geometric, Landscape, Pattern, Minimal
- Model-attempted SVG generation (with procedural fallback)
- Deterministic seeding from prompt text

## 🔒 Privacy

- **Zero network requests** after initial page load
- **No telemetry** or analytics
- **No API keys** or accounts needed
- All data stays in your browser's memory
- Model cached in `localStorage` only

## 🛠 Customization

### Change model size (edit `lib/nanomind-engine.js`):
```javascript
this.model = new NanoMindModel({
  embedDim: 128,    // larger = more capacity, slower
  hiddenDim: 256,   // feed-forward size
  numHeads: 8,      // attention heads
  numLayers: 4,     // transformer blocks
  maxSeqLen: 256,   // max context length
});
```

### Change training epochs (edit `index.html`):
```javascript
await nm.train(callback);  // modify trainer epochs in engine
```

### Add code templates (edit `lib/code-module.js`):
```javascript
templates: {
  myTemplate: `<!-- your HTML/CSS/JS here -->`
}
```

## 🌐 Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome 90+ | ✅ Recommended |
| Edge 90+ | ✅ Supported |
| Firefox 90+ | ✅ Supported |
| Safari 14+ | ✅ Supported |
| Mobile Chrome | ✅ Works (slower training) |

## ⚠️ Limitations

- **Quality**: As a tiny ~500K param model, responses are much simpler than GPT-class models
- **Knowledge cutoff**: Limited to what's in the training dataset
- **Training time**: 30-90 seconds on first run (then instant from cache)
- **Context**: Shorter context window than cloud LLMs
- **RAG dependency**: Best responses come from topics in the dataset

For production-quality offline LLMs, see [Transformers.js](https://huggingface.co/docs/transformers.js) which loads quantized 1-7B models.

## 📄 License

MIT License — free to use, modify, and distribute.
