/**
 * NanoMind v4.2 — Best Friend AI Engine
 *
 * Architecture:
 *   • TF-IDF vectorizer (ngrams 1-3, sublinear_tf, 4000 features)
 *   • Sparse cosine similarity retrieval against 2137 pre-normalized entries
 *   • Live learning: user exchanges encoded + stored in localStorage
 *   • Conversation memory: name, age, gender, mood, topics, facts
 *   • Best-friend persona: casual tone, mood-aware, no repeats
 */
'use strict';

// ─── VECTORIZER ───────────────────────────────────────────────
class Vectorizer {
  constructor(vocab, idf) {
    this.vocab = vocab;   // { token: index }
    this.idf   = idf;     // float array, length = n_features
    this.dim   = idf.length;
  }

  tokenize(t) { return (t.toLowerCase().match(/\b\w+\b/g) || []); }

  ngrams(toks, lo, hi) {
    const out = [];
    for (let n = lo; n <= hi; n++)
      for (let i = 0; i <= toks.length - n; i++)
        out.push(toks.slice(i, i + n).join(' '));
    return out;
  }

  // Returns a sparse {idx:[], val:[]} normalized TF-IDF vector
  transformSparse(text) {
    const toks = this.tokenize(text);
    const grams = this.ngrams(toks, 1, 3);
    const tf = {};
    for (const g of grams) tf[g] = (tf[g] || 0) + 1;

    const pairs = [];
    for (const [g, cnt] of Object.entries(tf)) {
      const idx = this.vocab[g];
      if (idx !== undefined)
        pairs.push([idx, (1 + Math.log(cnt)) * this.idf[idx]]);
    }

    // L2 normalize
    let sq = 0;
    for (const [, v] of pairs) sq += v * v;
    const n = Math.sqrt(sq) || 1e-9;

    const idx = new Uint16Array(pairs.length);
    const val = new Float32Array(pairs.length);
    for (let i = 0; i < pairs.length; i++) {
      idx[i] = pairs[i][0];
      val[i] = pairs[i][1] / n;
    }
    return { idx, val };
  }
}

// ─── SPARSE DOT PRODUCT ───────────────────────────────────────
// dot(sparse_a, sparse_b) — both stored as sorted index arrays
function sparseDot(ai, av, bi, bv) {
  let dot = 0, ia = 0, ib = 0;
  while (ia < ai.length && ib < bi.length) {
    if      (ai[ia] === bi[ib]) { dot += av[ia] * bv[ib]; ia++; ib++; }
    else if (ai[ia]  < bi[ib])  ia++;
    else                         ib++;
  }
  return dot;
}

// ─── MEMORY ───────────────────────────────────────────────────
class Memory {
  constructor() {
    this.name = null; this.age = null; this.gender = null;
    this.mood = 'neutral'; this.topics = []; this.facts = {};
    this.hist = []; this.turns = 0; this.MAX = 30;
  }

  push(role, text) {
    this.hist.push({ role, text });
    if (this.hist.length > this.MAX) this.hist.shift();
    if (role === 'user') { this.turns++; this._mine(text); }
  }

  _mine(t) {
    const s = t.toLowerCase();
    const nm = s.match(/(?:my name is|i'm called|call me)\s+([a-z]+)/);
    if (nm) this.name = nm[1][0].toUpperCase() + nm[1].slice(1);

    const ag = s.match(/i(?:'m| am)\s+(\d+)/);
    if (ag) { const a = +ag[1]; if (a > 4 && a < 116) this.age = a; }

    if (/i(?:'m| am) (?:a )?(?:man|male|guy|dude)\b/.test(s)) this.gender = 'male';
    if (/i(?:'m| am) (?:a )?(?:woman|female|lady)\b/.test(s)) this.gender = 'female';

    const POS = ['happy','great','amazing','excited','wonderful','awesome','thrilled','fantastic','best day'];
    const NEG = ['sad','depressed','anxious','angry','terrible','stressed','scared','lonely','hopeless','awful','rough','devastated','hurt','crying'];
    if (POS.some(w => s.includes(w))) this.mood = 'positive';
    if (NEG.some(w => s.includes(w))) this.mood = 'negative';

    const TM = {
      work:    ['job','work','career','boss','salary','fired','quit','promotion','coworker'],
      love:    ['boyfriend','girlfriend','partner','husband','wife','dating','breakup','love','crush','relationship'],
      family:  ['mom','dad','sister','brother','family','kids','baby','parents','child'],
      health:  ['sick','health','doctor','anxiety','depression','tired','pain','therapy','hospital'],
      life:    ['meaning','purpose','future','goals','regret','death','happiness','direction'],
      fun:     ['music','movies','game','food','travel','sport','hobby','book','art','show'],
    };
    for (const [tp, ws] of Object.entries(TM))
      if (ws.some(w => s.includes(w)) && !this.topics.includes(tp))
        this.topics.push(tp);

    const wk = s.match(/i work (?:as|at) (?:a |an )?([a-z ]+?)(?:\.|,|$)/);
    if (wk) this.facts.job = wk[1].trim();
    const lv = s.match(/i (?:live|am from|grew up) (?:in|near) ([a-z ]+?)(?:\.|,|$)/);
    if (lv) this.facts.location = lv[1].trim();
  }

  lastAI() { return [...this.hist].reverse().find(h => h.role === 'ai')?.text || null; }
}

// ─── LIVE LEARNER ─────────────────────────────────────────────
class Learner {
  constructor() { this.e = []; this.KEY = 'nm42'; this._load(); }

  add(input, response, sparse) {
    if (this.e.some(x => x.i === input && x.r === response)) return;
    this.e.push({
      i: input, r: response,
      idx: Array.from(sparse.idx),
      val: Array.from(sparse.val),
      t: Date.now()
    });
    if (this.e.length > 1000) this.e = this.e.slice(-1000);
    this._save();
  }

  _save()  { try { localStorage.setItem(this.KEY, JSON.stringify(this.e)); } catch(e) {} }
  _load()  {
    try {
      const r = localStorage.getItem(this.KEY);
      if (r) { this.e = JSON.parse(r); console.log(`[Learner] Restored ${this.e.length}`); }
    } catch(e) { this.e = []; }
  }
  clear()      { this.e = []; localStorage.removeItem(this.KEY); }
  get count()  { return this.e.length; }
}

// ─── PERSONA ──────────────────────────────────────────────────
function polish(text, mem) {
  let r = text;
  if (mem.name && mem.turns > 3 && mem.turns % 12 === 0 && !r.includes(mem.name)) {
    const hooks = [`${mem.name}! `, `Okay ${mem.name}, `, `${mem.name}, honestly — `];
    r = hooks[mem.turns % hooks.length] + r[0].toLowerCase() + r.slice(1);
  }
  if (mem.mood === 'negative') {
    r = r.replace(/LETS GO[O]*/gi, "that's real")
         .replace(/!{3,}/g, '!')
         .replace(/\bOMG\b/gi, 'wow');
  }
  if (mem.age !== null) {
    if (mem.age < 22) r = r.replace(/\bHonestly\?/g, 'Honestly lol');
    if (mem.age > 65) r = r.replace(/\blol\b/g, '').replace(/😄/g, '').trim();
  }
  return r.trim() || text.trim();
}

// ─── ENGINE ───────────────────────────────────────────────────
class NanoMindEngine {
  constructor() {
    this.ready   = false;
    this.vec     = null;
    this.model   = null;
    this.mem     = new Memory();
    this.lrn     = new Learner();
    this._matrix = null;  // array of {idx, val} sparse vectors
    this._pend   = null;
  }

  // ── LOAD ────────────────────────────────
  async load(json) {
    this.model = json;
    this.vec   = new Vectorizer(json.vocab, json.idf);

    // Convert stored matrix to typed arrays for fast dot products
    this._matrix = json.matrix.map(row => ({
      idx: new Uint16Array(row.idx),
      val: new Float32Array(row.val)
    }));

    console.log(`[NanoMind v4.2] ${json.n_samples} entries, vocab=${json.n_features}`);
    this.ready = true;
  }

  // ── RESPOND ─────────────────────────────
  respond(raw) {
    if (!this.ready) return "One sec, still loading!";
    const text = raw.trim();
    if (!text) return "Go ahead, I'm all ears 👂";

    this.mem.push('user', text);

    if (this._pend) {
      this._reinforce(this._pend.inp, this._pend.out, this._pend.sp);
      this._pend = null;
    }

    const sp = this.vec.transformSparse(text);
    const { resp } = this._retrieve(sp, text);
    const out = polish(resp, this.mem);
    this.mem.push('ai', out);
    this._pend = { inp: text, out, sp };
    return out;
  }

  // ── RETRIEVAL ───────────────────────────
  _retrieve(sp, text) {
    const lastAI = this.mem.lastAI();
    const M = this._matrix;
    const N = M.length;

    let bScore = -1, bIdx = 0;
    for (let i = 0; i < N; i++) {
      let dot = sparseDot(sp.idx, sp.val, M[i].idx, M[i].val);
      // Penalize last AI response strongly to avoid repetition
      if (this.model.responses[i] === lastAI) dot *= 0.4;
      if (dot > bScore) { bScore = dot; bIdx = i; }
    }

    // Search learned entries (8% retrieval bonus)
    let lScore = -1, lIdx = -1;
    for (let i = 0; i < this.lrn.e.length; i++) {
      const le = this.lrn.e[i];
      const lIdx2 = new Uint16Array(le.idx);
      const lVal2 = new Float32Array(le.val);
      let dot = sparseDot(sp.idx, sp.val, lIdx2, lVal2) * 1.08;
      if (dot > lScore) { lScore = dot; lIdx = i; }
    }

    if (lScore > bScore && lIdx >= 0)
      return { resp: this.lrn.e[lIdx].r, score: lScore };

    if (bScore < 0.12)
      return { resp: this._fallback(text), score: 0 };

    return { resp: this.model.responses[bIdx], score: bScore };
  }

  // ── LIVE LEARNING ───────────────────────
  _reinforce(inp, out, sp) {
    if (/^(no|nope|wrong|not what|that'?s? (wrong|not right|bad)|stop|don'?t)/i.test(inp.trim())) return;
    this.lrn.add(inp, out, sp);
  }

  // ── TEACH ───────────────────────────────
  teach(when, respond) {
    const sp = this.vec.transformSparse(when.toLowerCase().trim());
    this.lrn.add(when.toLowerCase().trim(), respond.trim(), sp);
    return `Got it! I'll remember that. ${this.lrn.count} things learned from our chats.`;
  }

  // ── FALLBACK ────────────────────────────
  _fallback(text) {
    const m = this.mem;
    if (m.mood === 'negative') return [
      "Hey, I'm right here. Tell me what's going on.",
      "That sounds really hard. Keep talking to me.",
      "I'm not going anywhere — what's happening?"
    ][m.turns % 3];
    if (text.includes('?')) return [
      "Hmm, what made you think about that?",
      "Good question — what's your take?",
      "That's a deep one. What's behind the question?"
    ][m.turns % 3];
    return [
      "Okay, tell me more about that.",
      "Wait — what happened next?",
      "That's interesting. What's the context?",
      "I feel like there's more to this story.",
      "Say more. I'm genuinely curious.",
      "Keep going — I want the full picture.",
      "Where does that come from for you?",
      "Hmm, interesting. Go on.",
    ][m.turns % 8];
  }

  // ── PUBLIC ──────────────────────────────
  isReady()      { return this.ready; }
  getMemory()    { return this.mem; }
  clearLearned() { this.lrn.clear(); }
  stats() {
    return {
      base:    this.model?.n_samples || 0,
      learned: this.lrn.count,
      turns:   this.mem.turns,
      name:    this.mem.name,
      age:     this.mem.age,
      topics:  this.mem.topics,
      mood:    this.mem.mood,
    };
  }
}

if (typeof module !== 'undefined') module.exports = { NanoMindEngine };
else window.NanoMindEngine = NanoMindEngine;
