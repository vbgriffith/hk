// ============================================================
//  AXIOM BREAK — hud.js
//  Manages the DOM-based HUD overlay
// ============================================================

const HUD = {

  _el: {},

  init() {
    this._el = {
      hud:        document.getElementById('hud'),
      healthBar:  document.getElementById('health-bar'),
      score:      document.getElementById('score-value'),
      spliceReady:document.getElementById('splice-ready'),
      levelTitle: document.getElementById('level-title'),
      txOverlay:  document.getElementById('transmission-overlay'),
      txFrom:     document.getElementById('tx-from'),
      txText:     document.getElementById('transmission-text'),
    };
  },

  show() { this._el.hud.classList.remove('hidden'); },
  hide() { this._el.hud.classList.add('hidden'); },

  // health: 0-100
  setHealth(hp, maxHp = 100) {
    const pct = Utils.clamp((hp / maxHp) * 100, 0, 100);
    this._el.healthBar.style.width = pct + '%';
    if (pct <= 30) {
      this._el.healthBar.classList.add('danger');
    } else {
      this._el.healthBar.classList.remove('danger');
    }
  },

  setScore(n) {
    this._el.score.textContent = Utils.formatScore(n);
  },

  setLevel(name) {
    this._el.levelTitle.textContent = name;
  },

  // state: 'READY' | 'REC' | 'ACTIVE' | 'COOLDOWN' | 'WAIT'
  setSpliceState(state) {
    const el = this._el.spliceReady;
    el.className = '';
    switch (state) {
      case 'READY':    el.textContent = 'READY';    el.style.color = ''; break;
      case 'REC':      el.textContent = '● REC';    el.classList.add('recording'); break;
      case 'ACTIVE':   el.textContent = 'CLONING';  el.classList.add('recording'); break;
      case 'COOLDOWN': el.textContent = 'RECHARGE'; el.classList.add('cooldown'); break;
      default:         el.textContent = state;
    }
  },

  // ── Transmission ────────────────────────────────────────

  showTransmission(txKey, onDone) {
    const tx = AXIOM.TRANSMISSIONS[txKey];
    if (!tx) { if (onDone) onDone(); return; }

    const overlay = this._el.txOverlay;
    const fromEl  = this._el.txFrom;
    const textEl  = this._el.txText;

    fromEl.textContent  = '// ' + tx.from;
    textEl.textContent  = '';
    overlay.classList.remove('hidden');

    // Typewriter effect
    const fullText = tx.lines.join('\n');
    let idx = 0;
    const speed = 22; // ms per char

    const timer = setInterval(() => {
      idx++;
      textEl.textContent = fullText.slice(0, idx);
      if (idx >= fullText.length) clearInterval(timer);
    }, speed);

    // Close on Space
    const handler = (e) => {
      if (e.code === 'Space') {
        clearInterval(timer);
        textEl.textContent = fullText;
        // Second press: actually close
        const close = (e2) => {
          if (e2.code === 'Space') {
            overlay.classList.add('hidden');
            document.removeEventListener('keydown', close);
            if (onDone) onDone();
          }
        };
        document.removeEventListener('keydown', handler);
        document.addEventListener('keydown', close);
      }
    };
    document.addEventListener('keydown', handler);
  },

};
