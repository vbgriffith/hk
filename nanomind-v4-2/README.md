# NanoMind v4.1 — Your AI Best Friend

A fully offline conversational AI that runs in any modern browser.
Talks like a best friend. Learns from every conversation. Zero internet required.

## Features
- **2,137 training entries** across 19 topic categories
- **3-layer MLP encoder** (vocab→256→256→128) for semantic understanding
- **Live learning** — your messages automatically train the model and persist via localStorage
- **🎓 Teach mode** — explicitly teach it anything you want
- **🎤 Voice input** — speak directly to it (modern browsers)
- **Memory panel** — see what it's learned about you (name, age, job, mood, topics)
- **Mood-aware responses** — softens tone when you're struggling
- **Zero training time** — loads in ~1 second, pre-trained offline

## Topics Covered
Greetings · Emotions (all of them) · Romantic relationships · Friendships ·
Family · Work & career · Money · Health & mental health · Life philosophy ·
Identity & self-knowledge · Age & life stages · Gender & sexuality ·
Pop culture & hobbies · The world & society · Stories & nostalgia ·
Random humor & fun · Difficult life events · Personal growth · Culture & background

## File Structure
```
nanomind/
├── index.html              ← Open this in your browser
├── lib/
│   └── nanomind-engine.js  ← Inference engine + live learner
├── model/
│   └── pretrained.json     ← Pre-trained weights (2.6MB)
└── README.md
```

## How to Run
1. Unzip
2. Open `index.html` in Chrome, Firefox, Edge, or Safari
3. Start talking

## Architecture
**Pre-training** (done offline, Python/scikit-learn):
- TF-IDF with 4000 features, ngrams 1-3, sublinear TF
- MLP autoencoder: vocab→256→256→128→256→256→vocab
- Encoder (first 3 layers) extracts 128-dim semantic embeddings
- Layer 0 weights: int8-quantized (4× compression)
- Layer 1-2 weights: float16

**Browser inference**:
- TF-IDF vectorize query → MLP forward pass → 128-dim embedding
- Cosine similarity against 2137 pre-embedded training entries
- Live entries (from your chats) also searched with 8% retrieval bonus
- Soft fallback for out-of-distribution input
- Repeat-response penalty (0.55× weight for last AI response)

**Live learning**:
- After every exchange, the pair gets encoded and added to localStorage
- On next chat, those entries are included in retrieval
- Up to 1000 learned pairs stored
- Explicit teach via 🎓 button for targeted learning
- User can clear with the memory panel

**Persona system**:
- Name injection every ~12 turns
- Mood mirroring (tones down hype when user is struggling)
- Age voice adjustments (teens vs 65+)
- Contextual bridges between turns
- Fallback responses adapt to mood and question type
