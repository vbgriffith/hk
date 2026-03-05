# NanoMind v3 — Offline Conversational AI

A fully offline conversational AI that runs in any modern browser.
**Zero training time** — uses a pre-trained model shipped with the app.

## What changed in v3
- Removed HTML/CSS/JS technical dataset
- Focused on life, people, storytelling, age, gender, daily conversation
- Pre-trained offline using Python/scikit-learn TF-IDF
- Loads instantly — no 1-hour training loop
- 513 conversational entries, 1,515-feature vocabulary

## Files
```
nanomind/
├── index.html              — Main UI (open this in browser)
├── lib/
│   └── nanomind-engine.js  — Inference engine (no training)
├── model/
│   └── pretrained.json     — Pre-trained weights (114 KB)
└── README.md
```

## How to run
1. Open `index.html` in any modern browser
2. Model loads in ~1 second
3. Start chatting

## Architecture
- TF-IDF vectorizer with bigrams/trigrams (pre-built vocabulary + IDF weights)
- Cosine similarity retrieval against 513 pre-encoded training entries
- Context tracking: name, age, gender extraction from conversation
- Personalized responses based on detected context
- Soft fallback responses for out-of-vocabulary queries

## Pre-training (offline, no internet)
The model was trained with Python + scikit-learn + numpy:
```bash
python3 pretrain.py   # generates model/pretrained.json
```
All training happens offline using only standard system packages.
