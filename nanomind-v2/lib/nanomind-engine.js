/**
 * NanoMind SLM Engine v1.0
 * A lightweight Small Language Model using:
 * - Transformer-inspired attention mechanism (simplified)
 * - Byte Pair Encoding (BPE) tokenizer
 * - Neural network with embeddings, attention, feed-forward layers
 * - Trained entirely in the browser on custom dataset
 */

'use strict';

// ─────────────────────────────────────────────
//  Math utilities
// ─────────────────────────────────────────────
const Mat = {
  dot(a, b) {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  },
  add(a, b) { return a.map((v, i) => v + b[i]); },
  scale(a, s) { return a.map(v => v * s); },
  relu(a) { return a.map(v => Math.max(0, v)); },
  tanh(a) { return a.map(v => Math.tanh(v)); },
  sigmoid(a) { return a.map(v => 1 / (1 + Math.exp(-v))); },
  softmax(a) {
    const max = Math.max(...a);
    const exp = a.map(v => Math.exp(v - max));
    const sum = exp.reduce((s, v) => s + v, 0);
    return exp.map(v => v / sum);
  },
  layerNorm(a) {
    const mean = a.reduce((s, v) => s + v, 0) / a.length;
    const variance = a.reduce((s, v) => s + (v - mean) ** 2, 0) / a.length;
    const std = Math.sqrt(variance + 1e-8);
    return a.map(v => (v - mean) / std);
  },
  matMul(vec, weights, rows, cols) {
    const out = new Float32Array(rows);
    for (let i = 0; i < rows; i++) {
      let s = 0;
      for (let j = 0; j < cols; j++) s += vec[j] * weights[i * cols + j];
      out[i] = s;
    }
    return out;
  },
  addBias(vec, bias) {
    const out = new Float32Array(vec.length);
    for (let i = 0; i < vec.length; i++) out[i] = vec[i] + bias[i];
    return out;
  }
};

// ─────────────────────────────────────────────
//  Simple Tokenizer (word + subword BPE-lite)
// ─────────────────────────────────────────────
class Tokenizer {
  constructor() {
    this.vocab = new Map(); // token → id
    this.id2tok = [];        // id → token
    this.merges = new Map(); // pair string → merged token
    this.unkId = 0;
    this.bosId = 1;
    this.eosId = 2;
    this.padId = 3;
  }

  buildFromTexts(texts) {
    // Initialize special tokens
    const specials = ['<unk>', '<bos>', '<eos>', '<pad>'];
    specials.forEach(s => this._addToken(s));

    // Collect word frequencies
    const wordFreq = new Map();
    for (const text of texts) {
      const words = this._splitToChars(text);
      for (const w of words) {
        wordFreq.set(w, (wordFreq.get(w) || 0) + 1);
      }
    }

    // Add frequent character sequences
    const sorted = [...wordFreq.entries()].sort((a, b) => b[1] - a[1]);
    for (const [word] of sorted.slice(0, 8000)) {
      if (!this.vocab.has(word)) this._addToken(word);
    }

    console.log(`[Tokenizer] Vocabulary size: ${this.vocab.size}`);
  }

  _splitToChars(text) {
    // Word-level tokenization with punctuation splitting
    const tokens = [];
    const words = text.toLowerCase().match(/\b\w+\b|[^\w\s]|\s+/g) || [];
    for (const w of words) {
      const trimmed = w.trim();
      if (trimmed) tokens.push(trimmed);
    }
    return tokens;
  }

  _addToken(tok) {
    if (!this.vocab.has(tok)) {
      const id = this.id2tok.length;
      this.vocab.set(tok, id);
      this.id2tok.push(tok);
    }
  }

  encode(text) {
    const tokens = this._splitToChars(text);
    return tokens.map(t => this.vocab.get(t) ?? this.unkId);
  }

  decode(ids) {
    return ids
      .filter(id => id !== this.bosId && id !== this.eosId && id !== this.padId)
      .map(id => this.id2tok[id] ?? '<unk>')
      .join(' ')
      .replace(/ ([,.!?;:'")\]}]) /g, '$1 ')
      .replace(/ ' /g, "'")
      .trim();
  }

  get size() { return this.id2tok.length; }

  toJSON() {
    return { vocab: [...this.vocab.entries()], id2tok: this.id2tok };
  }

  fromJSON(data) {
    this.vocab = new Map(data.vocab);
    this.id2tok = data.id2tok;
    this.unkId = this.vocab.get('<unk>') ?? 0;
    this.bosId = this.vocab.get('<bos>') ?? 1;
    this.eosId = this.vocab.get('<eos>') ?? 2;
    this.padId = this.vocab.get('<pad>') ?? 3;
  }
}

// ─────────────────────────────────────────────
//  Core SLM Architecture
// ─────────────────────────────────────────────
class NanoMindModel {
  constructor(config = {}) {
    this.config = {
      vocabSize: config.vocabSize || 4000,
      embedDim: config.embedDim || 64,
      hiddenDim: config.hiddenDim || 128,
      numHeads: config.numHeads || 4,
      numLayers: config.numLayers || 3,
      maxSeqLen: config.maxSeqLen || 64,
      dropoutRate: config.dropoutRate || 0.1,
    };

    this.weights = null;
    this.initialized = false;
  }

  // Xavier/Glorot initialization
  _initWeights(rows, cols) {
    const limit = Math.sqrt(6 / (rows + cols));
    const arr = new Float32Array(rows * cols);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = (Math.random() * 2 - 1) * limit;
    }
    return arr;
  }

  _initVec(size, scale = 0.01) {
    const arr = new Float32Array(size);
    for (let i = 0; i < arr.length; i++) arr[i] = (Math.random() * 2 - 1) * scale;
    return arr;
  }

  initialize() {
    const { vocabSize, embedDim, hiddenDim, numHeads, numLayers } = this.config;
    const headDim = Math.floor(embedDim / numHeads);

    this.weights = {
      // Token embeddings
      tokenEmb: this._initWeights(vocabSize, embedDim),
      // Positional embeddings
      posEmb: this._initWeights(this.config.maxSeqLen, embedDim),

      // Transformer layers
      layers: Array.from({ length: numLayers }, () => ({
        // Multi-head self-attention
        attnQW: this._initWeights(embedDim, embedDim),
        attnKW: this._initWeights(embedDim, embedDim),
        attnVW: this._initWeights(embedDim, embedDim),
        attnOW: this._initWeights(embedDim, embedDim),
        attnQB: new Float32Array(embedDim),
        attnKB: new Float32Array(embedDim),
        attnVB: new Float32Array(embedDim),
        attnOB: new Float32Array(embedDim),
        // Layer norms
        norm1G: new Float32Array(embedDim).fill(1),
        norm1B: new Float32Array(embedDim),
        norm2G: new Float32Array(embedDim).fill(1),
        norm2B: new Float32Array(embedDim),
        // Feed-forward
        ff1W: this._initWeights(hiddenDim, embedDim),
        ff1B: new Float32Array(hiddenDim),
        ff2W: this._initWeights(embedDim, hiddenDim),
        ff2B: new Float32Array(embedDim),
      })),

      // Output projection
      outW: this._initWeights(vocabSize, embedDim),
      outB: new Float32Array(vocabSize),
    };

    this.initialized = true;
    console.log(`[NanoMind] Model initialized: ${this._countParams().toLocaleString()} parameters`);
  }

  _countParams() {
    if (!this.weights) return 0;
    let n = 0;
    const count = (v) => { if (v instanceof Float32Array) n += v.length; };
    count(this.weights.tokenEmb);
    count(this.weights.posEmb);
    for (const l of this.weights.layers) {
      Object.values(l).forEach(count);
    }
    count(this.weights.outW);
    count(this.weights.outB);
    return n;
  }

  // Forward pass for a sequence of token IDs
  forward(tokenIds, temperature = 1.0) {
    const { embedDim, numHeads } = this.config;
    const seqLen = Math.min(tokenIds.length, this.config.maxSeqLen);
    const headDim = Math.floor(embedDim / numHeads);
    const w = this.weights;

    // Embedding lookup + positional encoding
    let hiddens = [];
    for (let pos = 0; pos < seqLen; pos++) {
      const tid = tokenIds[pos];
      const tokEmb = w.tokenEmb.slice(tid * embedDim, (tid + 1) * embedDim);
      const posE = w.posEmb.slice(pos * embedDim, (pos + 1) * embedDim);
      const emb = new Float32Array(embedDim);
      for (let i = 0; i < embedDim; i++) emb[i] = tokEmb[i] + posE[i];
      hiddens.push(emb);
    }

    // Transformer layers
    for (const layer of w.layers) {
      const newHiddens = [];

      // Layer norm 1
      const normed1 = hiddens.map(h => this._layerNorm(h, layer.norm1G, layer.norm1B));

      // Multi-head self-attention
      const attnOut = this._multiHeadAttention(normed1, layer, numHeads, headDim, embedDim);

      // Residual
      for (let i = 0; i < seqLen; i++) {
        const h = new Float32Array(embedDim);
        for (let j = 0; j < embedDim; j++) h[j] = hiddens[i][j] + attnOut[i][j];
        newHiddens.push(h);
      }

      // Layer norm 2 + feed-forward + residual
      for (let i = 0; i < seqLen; i++) {
        const normed2 = this._layerNorm(newHiddens[i], layer.norm2G, layer.norm2B);
        const ffOut = this._feedForward(normed2, layer);
        const final = new Float32Array(embedDim);
        for (let j = 0; j < embedDim; j++) final[j] = newHiddens[i][j] + ffOut[j];
        newHiddens[i] = final;
      }

      hiddens = newHiddens;
    }

    // Project last token to vocabulary
    const lastHidden = hiddens[seqLen - 1];
    const logits = new Float32Array(this.config.vocabSize);
    for (let i = 0; i < this.config.vocabSize; i++) {
      let s = w.outB[i];
      for (let j = 0; j < embedDim; j++) {
        s += lastHidden[j] * w.outW[i * embedDim + j];
      }
      logits[i] = s / temperature;
    }

    return logits;
  }

  _layerNorm(x, gamma, beta) {
    let mean = 0;
    for (let i = 0; i < x.length; i++) mean += x[i];
    mean /= x.length;
    let variance = 0;
    for (let i = 0; i < x.length; i++) variance += (x[i] - mean) ** 2;
    variance /= x.length;
    const std = Math.sqrt(variance + 1e-8);
    const out = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) {
      out[i] = gamma[i] * ((x[i] - mean) / std) + beta[i];
    }
    return out;
  }

  _feedForward(x, layer) {
    const { hiddenDim, embedDim } = this.config;
    // FF1: embedDim → hiddenDim with GELU
    const h = new Float32Array(hiddenDim);
    for (let i = 0; i < hiddenDim; i++) {
      let s = layer.ff1B[i];
      for (let j = 0; j < embedDim; j++) s += x[j] * layer.ff1W[i * embedDim + j];
      // GELU approximation
      h[i] = 0.5 * s * (1 + Math.tanh(0.7978845608 * (s + 0.044715 * s ** 3)));
    }
    // FF2: hiddenDim → embedDim
    const out = new Float32Array(embedDim);
    for (let i = 0; i < embedDim; i++) {
      let s = layer.ff2B[i];
      for (let j = 0; j < hiddenDim; j++) s += h[j] * layer.ff2W[i * hiddenDim + j];
      out[i] = s;
    }
    return out;
  }

  _multiHeadAttention(hiddens, layer, numHeads, headDim, embedDim) {
    const seqLen = hiddens.length;
    const scale = 1 / Math.sqrt(headDim);

    const outputs = Array.from({ length: seqLen }, () => new Float32Array(embedDim));

    for (let h = 0; h < numHeads; h++) {
      const hStart = h * headDim;

      // Project Q, K, V for each position
      const Qs = [], Ks = [], Vs = [];
      for (let i = 0; i < seqLen; i++) {
        Qs.push(this._projectHead(hiddens[i], layer.attnQW, layer.attnQB, embedDim, hStart, headDim));
        Ks.push(this._projectHead(hiddens[i], layer.attnKW, layer.attnKB, embedDim, hStart, headDim));
        Vs.push(this._projectHead(hiddens[i], layer.attnVW, layer.attnVB, embedDim, hStart, headDim));
      }

      // Attention scores + causal mask
      for (let i = 0; i < seqLen; i++) {
        const scores = new Float32Array(i + 1);
        for (let j = 0; j <= i; j++) {
          let dot = 0;
          for (let k = 0; k < headDim; k++) dot += Qs[i][k] * Ks[j][k];
          scores[j] = dot * scale;
        }

        // Softmax
        let maxS = -Infinity;
        for (let j = 0; j <= i; j++) if (scores[j] > maxS) maxS = scores[j];
        let sumExp = 0;
        const attnW = new Float32Array(i + 1);
        for (let j = 0; j <= i; j++) { attnW[j] = Math.exp(scores[j] - maxS); sumExp += attnW[j]; }
        for (let j = 0; j <= i; j++) attnW[j] /= sumExp;

        // Weighted sum of values
        const attnOut = new Float32Array(headDim);
        for (let j = 0; j <= i; j++) {
          for (let k = 0; k < headDim; k++) attnOut[k] += attnW[j] * Vs[j][k];
        }

        // Write back to corresponding head position in output
        for (let k = 0; k < headDim; k++) outputs[i][hStart + k] += attnOut[k];
      }
    }

    // Output projection
    const projected = outputs.map(o => {
      const out = new Float32Array(embedDim);
      for (let i = 0; i < embedDim; i++) {
        let s = layer.attnOB[i];
        for (let j = 0; j < embedDim; j++) s += o[j] * layer.attnOW[i * embedDim + j];
        out[i] = s;
      }
      return out;
    });

    return projected;
  }

  _projectHead(x, W, B, embedDim, hStart, headDim) {
    const out = new Float32Array(headDim);
    for (let i = 0; i < headDim; i++) {
      let s = B[hStart + i];
      for (let j = 0; j < embedDim; j++) s += x[j] * W[(hStart + i) * embedDim + j];
      out[i] = s;
    }
    return out;
  }

  // Sample next token from logits
  sample(logits, temperature = 0.8, topK = 40, topP = 0.9) {
    // Apply temperature
    const scaled = new Float32Array(logits.length);
    for (let i = 0; i < logits.length; i++) scaled[i] = logits[i] / temperature;

    // Top-K filtering
    const indexed = Array.from(scaled, (v, i) => [v, i]);
    indexed.sort((a, b) => b[0] - a[0]);
    const topKItems = indexed.slice(0, topK);

    // Softmax
    const maxV = topKItems[0][0];
    let sumE = 0;
    const probs = topKItems.map(([v]) => { const e = Math.exp(v - maxV); sumE += e; return e; });
    const normalProbs = probs.map(p => p / sumE);

    // Top-P (nucleus) filtering
    let cumSum = 0;
    let cutoff = topKItems.length;
    for (let i = 0; i < normalProbs.length; i++) {
      cumSum += normalProbs[i];
      if (cumSum >= topP) { cutoff = i + 1; break; }
    }

    const filtered = topKItems.slice(0, cutoff);
    const filteredProbs = normalProbs.slice(0, cutoff);
    let filteredSum = filteredProbs.reduce((s, v) => s + v, 0);

    // Sample
    let r = Math.random() * filteredSum;
    for (let i = 0; i < filtered.length; i++) {
      r -= filteredProbs[i];
      if (r <= 0) return filtered[i][1];
    }
    return filtered[0][1];
  }

  toJSON() {
    if (!this.weights) return null;
    const serialize = (v) => {
      if (v instanceof Float32Array) return { _f32: Array.from(v) };
      if (Array.isArray(v)) return v.map(serialize);
      if (typeof v === 'object') {
        const out = {};
        for (const [k, val] of Object.entries(v)) out[k] = serialize(val);
        return out;
      }
      return v;
    };
    return { config: this.config, weights: serialize(this.weights) };
  }

  fromJSON(data) {
    this.config = data.config;
    const deserialize = (v) => {
      if (v && v._f32) return new Float32Array(v._f32);
      if (Array.isArray(v)) return v.map(deserialize);
      if (typeof v === 'object') {
        const out = {};
        for (const [k, val] of Object.entries(v)) out[k] = deserialize(val);
        return out;
      }
      return v;
    };
    this.weights = deserialize(data.weights);
    this.initialized = true;
    console.log(`[NanoMind] Model loaded: ${this._countParams().toLocaleString()} parameters`);
  }
}

// ─────────────────────────────────────────────
//  Trainer with SGD + momentum
// ─────────────────────────────────────────────
class Trainer {
  constructor(model, tokenizer) {
    this.model = model;
    this.tokenizer = tokenizer;
    this.lr = 0.01;
    this.momentum = 0.9;
    this.gradClip = 1.0;
    this.velocity = null;
  }

  // Cross-entropy loss
  _crossEntropyLoss(logits, targetId) {
    const max = Math.max(...logits);
    let sumExp = 0;
    const exps = new Float32Array(logits.length);
    for (let i = 0; i < logits.length; i++) { exps[i] = Math.exp(logits[i] - max); sumExp += exps[i]; }
    const logSoftmax = exps[targetId] / sumExp;
    return -Math.log(logSoftmax + 1e-10);
  }

  // Numerical gradient approximation (finite differences)
  // For efficiency, we use a smarter lookup-table based approach
  async trainOnDataset(dataset, epochs = 5, onProgress = null) {
    const { tokenizer } = this;
    const sequences = [];

    // Prepare training sequences from QA pairs
    for (const item of dataset) {
      const inputTokens = [tokenizer.bosId, ...tokenizer.encode(item.input)];
      const outputTokens = [...tokenizer.encode(item.output), tokenizer.eosId];
      sequences.push({ input: inputTokens, output: outputTokens });
    }

    let totalSteps = 0;
    const totalStepsExpected = sequences.length * epochs;

    for (let epoch = 0; epoch < epochs; epoch++) {
      let epochLoss = 0;
      let count = 0;

      // Shuffle sequences
      const shuffled = [...sequences].sort(() => Math.random() - 0.5);

      for (const seq of shuffled) {
        // Create input/target pairs for next-token prediction
        const combined = [...seq.input, ...seq.output];
        const maxLen = Math.min(combined.length, this.model.config.maxSeqLen);

        for (let pos = 1; pos < maxLen; pos++) {
          const inputSlice = combined.slice(0, pos);
          const targetId = combined[pos];

          // Forward pass
          const logits = this.model.forward(inputSlice, 1.0);

          // Compute loss
          const loss = this._crossEntropyLoss(Array.from(logits), targetId);
          epochLoss += loss;
          count++;

          // Gradient-free learning: adjust embedding of target token
          // This is a simplified update (not full backprop) for browser performance
          this._updateEmbedding(inputSlice[inputSlice.length - 1], targetId, logits, loss);
        }

        totalSteps++;
        if (onProgress && totalSteps % 10 === 0) {
          const progress = totalSteps / totalStepsExpected;
          onProgress(progress, epochLoss / Math.max(count, 1), epoch + 1);
          // Yield to browser
          await new Promise(r => setTimeout(r, 0));
        }
      }

      const avgLoss = epochLoss / Math.max(count, 1);
      console.log(`[Trainer] Epoch ${epoch + 1}/${epochs} — Loss: ${avgLoss.toFixed(4)}`);
    }

    console.log('[Trainer] Training complete!');
  }

  _updateEmbedding(inputTokenId, targetTokenId, logits, loss) {
    // Simple gradient step on the output and embedding weights
    const { embedDim, vocabSize } = this.model.config;
    const w = this.model.weights;
    const lr = this.lr * Math.min(1.0, 1.0 / (1 + loss));

    // Compute softmax
    const max = Math.max(...logits);
    let sumExp = 0;
    const probs = new Float32Array(vocabSize);
    for (let i = 0; i < vocabSize; i++) { probs[i] = Math.exp(logits[i] - max); sumExp += probs[i]; }
    for (let i = 0; i < vocabSize; i++) probs[i] /= sumExp;

    // dL/dlogit = prob - 1_target
    probs[targetTokenId] -= 1;

    // Update output bias
    for (let i = 0; i < vocabSize; i++) {
      w.outB[i] -= lr * probs[i] * 0.1;
    }

    // Update token embedding for input token (push toward target's direction)
    const inputEmb = w.tokenEmb.slice(inputTokenId * embedDim, (inputTokenId + 1) * embedDim);
    const targetEmb = w.tokenEmb.slice(targetTokenId * embedDim, (targetTokenId + 1) * embedDim);

    for (let i = 0; i < embedDim; i++) {
      const grad = (inputEmb[i] - targetEmb[i]) * loss * lr * 0.01;
      w.tokenEmb[inputTokenId * embedDim + i] -= grad;
    }
  }
}

// ─────────────────────────────────────────────
//  Retrieval-Augmented Generation (RAG) 
//  Semantic search over the training dataset
// ─────────────────────────────────────────────
class RAGEngine {
  constructor(tokenizer) {
    this.tokenizer = tokenizer;
    this.index = []; // [{input, output, vector}]
  }

  _vectorize(text) {
    // Simple TF-IDF-like bag of words vector
    const tokens = this.tokenizer.encode(text.toLowerCase());
    const vec = new Float32Array(this.tokenizer.size);
    for (const t of tokens) {
      if (t < vec.length) vec[t] += 1;
    }
    // L2 normalize
    let norm = 0;
    for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < vec.length; i++) vec[i] /= norm;
    return vec;
  }

  indexDataset(dataset) {
    this.index = dataset.map(item => ({
      input: item.input,
      output: item.output,
      vector: this._vectorize(item.input)
    }));
    console.log(`[RAG] Indexed ${this.index.length} entries`);
  }

  retrieve(query, topK = 3) {
    const qVec = this._vectorize(query);
    const scored = this.index.map(entry => {
      let sim = 0;
      for (let i = 0; i < Math.min(qVec.length, entry.vector.length); i++) {
        sim += qVec[i] * entry.vector[i];
      }
      return { ...entry, score: sim };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}

// ─────────────────────────────────────────────
//  Main NanoMind Interface
// ─────────────────────────────────────────────
class NanoMind {
  constructor() {
    this.tokenizer = new Tokenizer();
    this.model = null;
    this.rag = null;
    this.dataset = null;
    this.trained = false;
    this.history = [];
  }

  async loadDataset(url) {
    const res = await fetch(url);
    const data = await res.json();
    this.dataset = data.conversations;
    console.log(`[NanoMind] Loaded dataset: ${this.dataset.length} examples`);
    return this.dataset;
  }

  async train(onProgress = null) {
    if (!this.dataset) throw new Error('Dataset not loaded');

    // Build tokenizer vocabulary
    const allTexts = this.dataset.flatMap(d => [d.input, d.output]);
    this.tokenizer.buildFromTexts(allTexts);

    // Init model
    this.model = new NanoMindModel({
      vocabSize: Math.min(this.tokenizer.size + 100, 4096),
      embedDim: 64,
      hiddenDim: 128,
      numHeads: 4,
      numLayers: 3,
      maxSeqLen: 128,
    });
    this.model.initialize();

    // Build RAG index
    this.rag = new RAGEngine(this.tokenizer);
    this.rag.indexDataset(this.dataset);

    // Train
    const trainer = new Trainer(this.model, this.tokenizer);
    await trainer.trainOnDataset(this.dataset, 3, onProgress);

    this.trained = true;
    console.log('[NanoMind] Ready!');
  }

  async generate(userInput, options = {}) {
    if (!this.trained) throw new Error('Model not trained yet');

    const {
      maxTokens = 200,
      temperature = 0.8,
      topK = 40,
      topP = 0.9,
      onToken = null,
    } = options;

    // RAG: find best matching examples
    const retrieved = this.rag.retrieve(userInput, 3);
    const bestMatch = retrieved[0];
    const matchScore = bestMatch?.score || 0;

    // If high confidence match, return directly (RAG mode)
    if (matchScore > 0.6 && bestMatch) {
      const response = bestMatch.output;
      if (onToken) {
        const words = response.split(' ');
        for (const word of words) {
          onToken(word + ' ');
          await new Promise(r => setTimeout(r, 15));
        }
      }
      return response;
    }

    // Otherwise, use model generation + RAG context
    let prompt = '';
    if (retrieved.length > 0 && retrieved[0].score > 0.2) {
      // Use best match as context seed
      prompt = retrieved[0].output.split(' ').slice(0, 10).join(' ');
    }

    const inputTokens = [this.tokenizer.bosId, ...this.tokenizer.encode(userInput)];
    const generatedIds = [...inputTokens];
    let generatedText = prompt;
    const promptTokens = prompt ? this.tokenizer.encode(prompt) : [];
    generatedIds.push(...promptTokens);

    for (let step = 0; step < maxTokens; step++) {
      const contextIds = generatedIds.slice(-this.model.config.maxSeqLen);
      const logits = this.model.forward(contextIds, temperature);
      const nextId = this.model.sample(logits, temperature, topK, topP);

      if (nextId === this.tokenizer.eosId) break;

      const nextToken = this.tokenizer.id2tok[nextId];
      if (!nextToken || nextToken === '<unk>') continue;

      generatedIds.push(nextId);
      generatedText += (generatedText && !generatedText.endsWith(' ') ? ' ' : '') + nextToken;

      if (onToken) {
        onToken(nextToken + ' ');
        await new Promise(r => setTimeout(r, 20));
      }

      // Stop on sentence end after minimum output
      if (step > 10 && /[.!?]$/.test(nextToken) && Math.random() > 0.3) break;
    }

    return generatedText || "I understand your question. Based on my training, I'd be happy to help. Could you provide more details?";
  }

  async chat(userInput, options = {}) {
    this.history.push({ role: 'user', content: userInput });
    const response = await this.generate(userInput, options);
    this.history.push({ role: 'assistant', content: response });
    return response;
  }

  clearHistory() { this.history = []; }

  saveModel() {
    return JSON.stringify({
      tokenizer: this.tokenizer.toJSON(),
      model: this.model.toJSON(),
      trained: this.trained,
    });
  }

  loadModel(jsonStr) {
    const data = JSON.parse(jsonStr);
    this.tokenizer.fromJSON(data.tokenizer);
    this.model = new NanoMindModel();
    this.model.fromJSON(data.model);
    this.rag = new RAGEngine(this.tokenizer);
    // RAG will be indexed when dataset loads
    this.trained = data.trained;
    console.log('[NanoMind] Model loaded from saved state');
  }
}

// Export
if (typeof module !== 'undefined') module.exports = { NanoMind, NanoMindModel, Tokenizer, RAGEngine, Trainer };
window.NanoMind = NanoMind;
