/**
 * NanoMind v3 - Offline Conversational AI Engine
 * Pre-trained TF-IDF retrieval model — ZERO training time in browser.
 * Weights loaded from pretrained.json, inference only.
 *
 * Architecture:
 *   - TF-IDF vectorizer with vocab + IDF pre-loaded from model file
 *   - Cosine similarity retrieval against pre-computed corpus
 *   - Soft fallback + context-aware follow-up responses
 *   - Persona system (adapts tone to user age/gender)
 */
'use strict';

class NanoMindEngine {
  constructor() {
    this.model = null;
    this.ready = false;
    this.context = {
      userName: null,
      userAge: null,
      userGender: null,
      turnCount: 0,
      lastTopic: null,
      history: [], // last N (input, response) pairs
    };
    this.HISTORY_SIZE = 6;
  }

  // ──────────────────────────────────────────────────────────
  //  LOAD PRE-TRAINED MODEL
  // ──────────────────────────────────────────────────────────
  async loadModel(modelJson) {
    this.model = modelJson;
    // Pre-compute normalized input vectors for fast cosine similarity
    console.log(`[NanoMind] Loading model: ${this.model.n_samples} entries, ${this.model.n_features} features`);
    this._buildMatrix();
    this.ready = true;
    console.log('[NanoMind] Ready. Zero training required.');
  }

  _buildMatrix() {
    const n = this.model.n_samples;
    const d = this.model.n_features;
    const inputs = this.model.inputs;
    const idf = this.model.idf;
    const vocab = this.model.vocab; // {token: idx}

    // Build normalized TF-IDF matrix for all training inputs
    this._matrix = new Float32Array(n * d);
    this._norms  = new Float32Array(n);

    for (let row = 0; row < n; row++) {
      const vec = this._tfidfVector(inputs[row], vocab, idf, d);
      const norm = this._l2norm(vec);
      for (let j = 0; j < d; j++) {
        this._matrix[row * d + j] = norm > 0 ? vec[j] / norm : 0;
      }
      this._norms[row] = norm;
    }
    console.log('[NanoMind] Matrix built:', n, '×', d);
  }

  // ──────────────────────────────────────────────────────────
  //  TF-IDF VECTORIZATION (mirrors sklearn logic)
  // ──────────────────────────────────────────────────────────
  _tokenize(text) {
    return (text.toLowerCase().match(/\b\w+\b/g) || []);
  }

  _getNgrams(tokens, minN, maxN) {
    const ngrams = [];
    for (let n = minN; n <= maxN; n++) {
      for (let i = 0; i <= tokens.length - n; i++) {
        ngrams.push(tokens.slice(i, i + n).join(' '));
      }
    }
    return ngrams;
  }

  _tfidfVector(text, vocab, idf, d) {
    const vec = new Float32Array(d);
    const tokens = this._tokenize(text);
    const ngrams = this._getNgrams(tokens, 1, 3);
    const tf = {};
    for (const ng of ngrams) {
      tf[ng] = (tf[ng] || 0) + 1;
    }
    for (const [ng, count] of Object.entries(tf)) {
      const idx = vocab[ng];
      if (idx !== undefined) {
        // sublinear TF: 1 + log(tf)
        vec[idx] = (1 + Math.log(count)) * idf[idx];
      }
    }
    return vec;
  }

  _l2norm(vec) {
    let s = 0;
    for (let i = 0; i < vec.length; i++) s += vec[i] * vec[i];
    return Math.sqrt(s);
  }

  _cosineSim(queryVec, row) {
    const d = this.model.n_features;
    const offset = row * d;
    let dot = 0;
    for (let j = 0; j < d; j++) {
      dot += queryVec[j] * this._matrix[offset + j];
    }
    return dot;
  }

  // ──────────────────────────────────────────────────────────
  //  INFERENCE
  // ──────────────────────────────────────────────────────────
  respond(userInput) {
    if (!this.ready) return "I'm still loading — one moment!";

    const input = userInput.trim();
    if (!input) return "I'm here — what's on your mind?";

    this.context.turnCount++;
    this._extractContextClues(input);

    // Retrieve best match
    const { response, score, matchedInput } = this._retrieve(input);

    // Add to history
    this.context.history.push({ input, response });
    if (this.context.history.length > this.HISTORY_SIZE) {
      this.context.history.shift();
    }

    // Personalize if we have context
    return this._personalize(response, score, input);
  }

  _retrieve(input) {
    const vocab = this.model.vocab;
    const idf = this.model.idf;
    const d = this.model.n_features;
    const n = this.model.n_samples;

    // Vectorize query
    const qVec = this._tfidfVector(input, vocab, idf, d);
    const qNorm = this._l2norm(qVec);

    if (qNorm === 0) {
      return this._fallback(input);
    }

    // Normalize query vector
    const qNorm_ = new Float32Array(d);
    for (let j = 0; j < d; j++) qNorm_[j] = qVec[j] / qNorm;

    // Cosine similarity against all training vectors
    let bestScore = -1;
    let bestIdx = 0;
    let secondScore = -1;
    let secondIdx = 0;

    for (let i = 0; i < n; i++) {
      const sim = this._cosineSim(qNorm_, i);
      if (sim > bestScore) {
        secondScore = bestScore; secondIdx = bestIdx;
        bestScore = sim; bestIdx = i;
      } else if (sim > secondScore) {
        secondScore = sim; secondIdx = i;
      }
    }

    // If confidence is low, use fallback
    if (bestScore < 0.15) {
      return this._fallback(input);
    }

    // If tie between two close responses, pick the one that avoids repetition
    if (secondScore > bestScore * 0.92 && this.context.history.length > 0) {
      const lastResp = this.context.history[this.context.history.length - 1]?.response;
      if (this.model.responses[bestIdx] === lastResp) {
        bestIdx = secondIdx;
        bestScore = secondScore;
      }
    }

    return {
      response: this.model.responses[bestIdx],
      score: bestScore,
      matchedInput: this.model.inputs[bestIdx]
    };
  }

  _fallback(input) {
    const fallbacks = [
      "That's interesting — tell me more about that.",
      "I want to make sure I understand. Can you say a bit more?",
      "I find that worth exploring. What's behind that thought?",
      "I'm not sure I quite follow, but I'm curious — what do you mean?",
      "Hmm, help me understand — what are you thinking about?",
      "That touches on something. Can you expand on it a bit?",
    ];
    const idx = Math.floor(Math.random() * fallbacks.length);
    return { response: fallbacks[idx], score: 0, matchedInput: '' };
  }

  // ──────────────────────────────────────────────────────────
  //  CONTEXT EXTRACTION
  // ──────────────────────────────────────────────────────────
  _extractContextClues(input) {
    const lower = input.toLowerCase();

    // Name detection
    const nameMatch = lower.match(/(?:my name is|i'm called|call me|i am)\s+([a-z]+)/i);
    if (nameMatch && !this.context.userName) {
      this.context.userName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
    }

    // Age detection
    const ageMatch = lower.match(/i(?:'m| am)\s+(\d+)(?:\s+years?\s+old)?/i);
    if (ageMatch) {
      const age = parseInt(ageMatch[1]);
      if (age >= 5 && age <= 120) this.context.userAge = age;
    }

    // Gender detection
    if (/\bi(?:'m| am) (?:a )?(?:man|male|guy|dude|boy)\b/.test(lower)) this.context.userGender = 'male';
    if (/\bi(?:'m| am) (?:a )?(?:woman|female|lady|girl)\b/.test(lower)) this.context.userGender = 'female';
  }

  // ──────────────────────────────────────────────────────────
  //  PERSONALIZATION
  // ──────────────────────────────────────────────────────────
  _personalize(response, score, input) {
    const { userName, userAge, turnCount } = this.context;

    // Occasional name use (every ~8 turns if known)
    if (userName && turnCount > 1 && turnCount % 8 === 0) {
      if (!response.includes(userName)) {
        const hooks = [`${userName}, `, `You know, ${userName} — `];
        const h = hooks[Math.floor(Math.random() * hooks.length)];
        response = h + response.charAt(0).toLowerCase() + response.slice(1);
      }
    }

    // Age-appropriate tone tweaks
    if (userAge !== null) {
      if (userAge < 20 && response.includes("decade")) {
        response = response.replace("decade", "chapter of your life");
      }
      if (userAge > 70 && response.includes("still so much ahead")) {
        response = response + " You've earned every bit of it.";
      }
    }

    return response;
  }

  getContext() { return { ...this.context }; }
  isReady() { return this.ready; }
}

// Export for both module and global scope
if (typeof module !== 'undefined') module.exports = NanoMindEngine;
else if (typeof window !== 'undefined') window.NanoMindEngine = NanoMindEngine;
