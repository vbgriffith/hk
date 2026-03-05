/**
 * NanoMind v4.1 — Best Friend AI Engine
 *
 * Architecture:
 *   • TF-IDF (ngrams 1-3, sublinear_tf, 4000 features)
 *   • MLP encoder: vocab → 256 → 256 → 128-dim semantic embedding
 *     - Layer 0: int8-quantized (compact), Layers 1-2: float16
 *   • Cosine retrieval against 2137 pre-embedded training entries
 *   • Live learning: every exchange gets encoded + stored in localStorage
 *   • Conversation memory: name, age, gender, mood, topics, facts
 *   • Best-friend persona: casual tone, context callbacks, no repetition
 *
 * Pre-training done offline (Python/scikit-learn). Zero in-browser training.
 */

'use strict';

// ─────────────────────────────────────────────
//  TYPED ARRAY / BASE64 HELPERS
// ─────────────────────────────────────────────
function _buf(b64) {
  const s = atob(b64), u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
  return u.buffer;
}
const asF32  = b64 => new Float32Array(_buf(b64));
const asI8   = b64 => new Int8Array(_buf(b64));
function asF16toF32(b64) {
  const u = new Uint16Array(_buf(b64)), f = new Float32Array(u.length);
  for (let i = 0; i < u.length; i++) {
    const h = u[i], s = h >> 15 ? -1 : 1, e = (h >> 10) & 0x1f, m = h & 0x3ff;
    f[i] = e === 0  ? s * 5.96e-8 * m
         : e === 31 ? (m ? NaN : s * Infinity)
         : s * Math.pow(2, e - 15) * (1 + m / 1024);
  }
  return f;
}

// ─────────────────────────────────────────────
//  MATH
// ─────────────────────────────────────────────
function l2(v) { let s=0; for(let i=0;i<v.length;i++) s+=v[i]*v[i]; return Math.sqrt(s)||1e-9; }
function norm(v) { const n=l2(v), o=new Float32Array(v.length); for(let i=0;i<v.length;i++) o[i]=v[i]/n; return o; }
function mvAdd(W, v, rows, cols, b) {
  const o = new Float32Array(rows);
  for (let r=0; r<rows; r++) {
    let s=b[r]; const off=r*cols;
    for (let c=0; c<cols; c++) s+=W[off+c]*v[c];
    o[r]=s;
  }
  return o;
}
function relu(v) { for(let i=0;i<v.length;i++) if(v[i]<0) v[i]=0; return v; }

// ─────────────────────────────────────────────
//  VECTORIZER  (matches sklearn TF-IDF)
// ─────────────────────────────────────────────
class Vectorizer {
  constructor(vocab, idf) { this.vocab=vocab; this.idf=idf; this.d=idf.length; }
  tok(t)  { return (t.toLowerCase().match(/\b\w+\b/g)||[]); }
  ngram(toks, lo, hi) {
    const out=[];
    for (let n=lo; n<=hi; n++) for (let i=0; i<=toks.length-n; i++) out.push(toks.slice(i,i+n).join(' '));
    return out;
  }
  transform(text) {
    const toks = this.tok(text), grams = this.ngram(toks,1,3), tf={};
    for (const g of grams) tf[g]=(tf[g]||0)+1;
    const v = new Float32Array(this.d);
    for (const [g,c] of Object.entries(tf)) {
      const idx=this.vocab[g];
      if (idx!==undefined) v[idx]=(1+Math.log(c))*this.idf[idx];
    }
    return norm(v);
  }
}

// ─────────────────────────────────────────────
//  MLP ENCODER  (3 layers: 256→256→128)
// ─────────────────────────────────────────────
class Encoder {
  constructor(layers) {
    this.L = layers.map(l => {
      let W;
      if (l.quant === 'int8') {
        const qi = asI8(l.W_b64); W = new Float32Array(qi.length);
        const sc = l.W_sc; for (let i=0;i<qi.length;i++) W[i]=qi[i]*sc;
      } else {
        W = asF16toF32(l.W_b64);
      }
      return { W, b: asF32(l.b_b64), rows: l.shape[1], cols: l.shape[0] };
    });
  }
  encode(v) {
    let h = v;
    for (let i=0; i<this.L.length; i++) {
      const {W,b,rows,cols} = this.L[i];
      h = relu(mvAdd(W, h, rows, cols, b));
      if (i === 2) break; // stop at 128-dim bottleneck
    }
    return norm(h);
  }
}

// ─────────────────────────────────────────────
//  CONVERSATION MEMORY
// ─────────────────────────────────────────────
class Memory {
  constructor() {
    this.name=null; this.age=null; this.gender=null;
    this.mood='neutral'; this.topics=[]; this.facts={};
    this.hist=[]; this.turns=0; this.MAX=24;
  }
  push(role, text) {
    this.hist.push({role,text});
    if (this.hist.length>this.MAX) this.hist.shift();
    if (role==='user') { this.turns++; this._mine(text); }
  }
  _mine(t) {
    const s=t.toLowerCase();
    const nm=s.match(/(?:my name is|i'm called|call me)\s+([a-z]+)/); if(nm) this.name=nm[1][0].toUpperCase()+nm[1].slice(1);
    const ag=s.match(/i(?:'m| am)\s+(\d+)/); if(ag){const a=+ag[1];if(a>4&&a<116)this.age=a;}
    if(/i(?:'m| am) (?:a )?(?:man|male|guy|dude)\b/.test(s)) this.gender='male';
    if(/i(?:'m| am) (?:a )?(?:woman|female|lady)\b/.test(s)) this.gender='female';
    const pos=['happy','great','amazing','excited','wonderful','awesome','thrilled','love','fantastic','good day'];
    const neg=['sad','depressed','anxious','angry','terrible','stressed','scared','lonely','hopeless','awful','rough','devastated'];
    if(pos.some(w=>s.includes(w))) this.mood='positive';
    if(neg.some(w=>s.includes(w))) this.mood='negative';
    const TM={work:['job','work','career','boss','salary','fired','quit','promotion'],
              love:['boyfriend','girlfriend','partner','husband','wife','dating','breakup','love','crush','relationship'],
              family:['mom','dad','sister','brother','family','kids','baby','parents'],
              health:['sick','health','doctor','anxiety','depression','tired','pain','therapy'],
              life:['meaning','purpose','future','goals','regret','death','happiness'],
              fun:['music','movies','game','food','travel','sport','hobby','book','art']};
    for(const[tp,ws]of Object.entries(TM)) if(ws.some(w=>s.includes(w))&&!this.topics.includes(tp)) this.topics.push(tp);
    const wk=s.match(/i work (?:as|at) (?:a |an )?([a-z ]+?)(?:\.|,|$)/); if(wk) this.facts.job=wk[1].trim();
    const lv=s.match(/i (?:live|am from|grew up) (?:in|near) ([a-z ]+?)(?:\.|,|$)/); if(lv) this.facts.location=lv[1].trim();
  }
  lastAI() { return [...this.hist].reverse().find(h=>h.role==='ai')?.text||null; }
  lastFew(n=4) { return this.hist.slice(-n*2); }
}

// ─────────────────────────────────────────────
//  LIVE LEARNER  (persists to localStorage)
// ─────────────────────────────────────────────
class Learner {
  constructor() { this.e=[]; this.KEY='nm41_v1'; this._load(); }
  add(input, response, emb) {
    if(this.e.some(x=>x.i===input&&x.r===response)) return;
    this.e.push({i:input,r:response,e:Array.from(emb),t:Date.now()});
    if(this.e.length>1000) this.e=this.e.slice(-1000);
    this._save();
  }
  _save() { try{localStorage.setItem(this.KEY,JSON.stringify(this.e));}catch(e){} }
  _load() { try{const r=localStorage.getItem(this.KEY); if(r){this.e=JSON.parse(r);console.log(`[Learner] Loaded ${this.e.length}`);}}catch(e){this.e=[];} }
  clear() { this.e=[]; localStorage.removeItem(this.KEY); }
  get count() { return this.e.length; }
}

// ─────────────────────────────────────────────
//  PERSONA
// ─────────────────────────────────────────────
function polish(text, mem) {
  let r = text;
  if (mem.name && mem.turns>3 && mem.turns%12===0 && !r.includes(mem.name)) {
    const hooks=[`${mem.name}! `,`Okay ${mem.name}, `,`${mem.name}, honestly — `];
    r = hooks[mem.turns%hooks.length] + r[0].toLowerCase()+r.slice(1);
  }
  if (mem.mood==='negative') {
    r = r.replace(/LETS GO[O]*/gi,"that's real").replace(/!{2,}/g,'.').replace(/\bOMG\b/gi,'wow');
  }
  if (mem.age!==null) {
    if(mem.age<22) r=r.replace(/\bHonestly\?/g,'Honestly lol');
    if(mem.age>65) r=r.replace(/\blol\b/g,'').replace(/😄/g,'').trim();
  }
  return r.trim()||text.trim();
}

// Contextual bridges drawn from recent conversation
function bridge(mem) {
  const last = mem.hist.filter(h=>h.role==='user').at(-2)?.text;
  if (!last || mem.turns<3) return '';
  const bridges = ['','','','','',  // most turns: no bridge
    'Okay and following on from before — ','Thinking about what you said — '];
  return bridges[mem.turns%bridges.length];
}

// ─────────────────────────────────────────────
//  MAIN ENGINE
// ─────────────────────────────────────────────
class NanoMindEngine {
  constructor() {
    this.ready=false; this.vec=null; this.enc=null;
    this.mem=new Memory(); this.lrn=new Learner();
    this.model=null; this._E=null; this._N=0; this._D=0;
    this._pend=null; // pending exchange to reinforce
  }

  // ── LOAD ─────────────────────────────────
  async load(json) {
    this.model = json;
    this.vec   = new Vectorizer(json.vocab, asF32(json.idf_b64));
    this.enc   = new Encoder(json.encoder);
    this._E    = asF16toF32(json.emb_b64);
    this._N    = json.n_samples;
    this._D    = json.embed_dim;
    console.log(`[NanoMind v4.1] ${this._N} entries, vocab=${json.n_features}, D=${this._D}, learned=${this.lrn.count}`);
    this.ready = true;
  }

  // ── RESPOND ──────────────────────────────
  respond(raw) {
    if (!this.ready) return "One sec, still waking up!";
    const text = raw.trim();
    if (!text) return "Go ahead, I'm all ears 👂";

    this.mem.push('user', text);

    // Reinforce previous exchange if user continued naturally
    if (this._pend) { this._reinforce(this._pend.inp, this._pend.out, text); this._pend=null; }

    const {resp} = this._retrieve(text);
    const out = polish(bridge(this.mem) + resp, this.mem);
    this.mem.push('ai', out);
    this._pend = {inp:text, out};
    return out;
  }

  // ── RETRIEVAL ────────────────────────────
  _retrieve(text) {
    const tf  = this.vec.transform(text);
    const emb = this.enc.encode(tf);
    const D=this._D, N=this._N, E=this._E;
    const lastAI = this.mem.lastAI();

    // Search base corpus
    let bScore=-1, bIdx=0;
    for (let i=0; i<N; i++) {
      let dot=0; const off=i*D;
      for (let j=0; j<D; j++) dot+=emb[j]*E[off+j];
      if(this.model.responses[i]===lastAI) dot*=0.55; // strong repeat penalty
      if(dot>bScore){bScore=dot;bIdx=i;}
    }

    // Search learned entries (8% retrieval bonus for real-conversation pairs)
    let lScore=-1, lIdx=-1;
    for (let i=0; i<this.lrn.e.length; i++) {
      const le=this.lrn.e[i]; let dot=0;
      for (let j=0; j<D; j++) dot+=emb[j]*le.e[j];
      dot*=1.08;
      if(dot>lScore){lScore=dot;lIdx=i;}
    }

    if (lScore>bScore && lIdx>=0)
      return {resp: this.lrn.e[lIdx].r, score:lScore, src:'learned'};

    if (bScore<0.16)
      return {resp: this._fallback(text), score:0, src:'fallback'};

    return {resp: this.model.responses[bIdx], score:bScore, src:'base'};
  }

  // ── LIVE LEARNING ────────────────────────
  _reinforce(inp, out, followup) {
    // Don't reinforce if user signaled a bad response
    if (/^(no|nope|wrong|that'?s? (wrong|not|off)|not what|don'?t|stop|bad answer)/i.test(followup.trim())) return;
    const emb = this.enc.encode(this.vec.transform(inp));
    this.lrn.add(inp, out, emb);
  }

  // Explicit teach
  teach(when, respond) {
    const emb = this.enc.encode(this.vec.transform(when));
    this.lrn.add(when.toLowerCase().trim(), respond.trim(), emb);
    return `Got it! Locked in. I now have ${this.lrn.count} things I've personally learned from you.`;
  }

  // ── FALLBACKS ────────────────────────────
  _fallback(text) {
    const m=this.mem;
    if (m.mood==='negative') return [
      "Hey, I'm right here. Tell me what's going on.",
      "That sounds really hard. Keep talking to me.",
      "I'm not going anywhere — what's happening?"
    ][m.turns%3];
    if (text.includes('?')) return [
      "Hmm, what made you think about that?",
      "Good question — what's your take on it?",
      "That's actually a deep one. What's behind the question?"
    ][m.turns%3];
    return [
      "Okay wait, tell me more about that.",
      "I'm following — go on, what happened?",
      "That's interesting. What's the context?",
      "I feel like there's more to this story.",
      "Say more. I'm genuinely curious.",
      "Keep going — I want the full picture.",
      "That landed in my brain. What do you mean exactly?",
      "Hmm, interesting. Where does that come from for you?",
    ][m.turns%8];
  }

  // ── PUBLIC API ───────────────────────────
  isReady()    { return this.ready; }
  getMemory()  { return this.mem; }
  clearLearned() { this.lrn.clear(); }
  stats() {
    return {
      base:    this._N,
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
