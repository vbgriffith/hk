// ============================================================
//  AXIOM BREAK — hud.js  [PHASE 3 REPLACEMENT]
//  Adds to Phase 2:
//   - setMultiplier(val)    — score multiplier display
//   - showSectorBonus(msg)  — temporary bonus flash banner
// ============================================================

const HUD = {

  _el: {},

  init() {
    this._el = {
      hud:          document.getElementById('hud'),
      healthBar:    document.getElementById('health-bar'),
      score:        document.getElementById('score-value'),
      spliceReady:  document.getElementById('splice-ready'),
      levelTitle:   document.getElementById('level-title'),
      txOverlay:    document.getElementById('transmission-overlay'),
      txFrom:       document.getElementById('tx-from'),
      txText:       document.getElementById('transmission-text'),
      bossWrap:     document.getElementById('boss-bar-wrap'),
      bossLabel:    document.getElementById('boss-bar-label'),
      bossFill:     document.getElementById('boss-bar-fill'),
      muteIcon:     document.getElementById('mute-icon'),
      // Phase 3
      multiplier:   document.getElementById('score-multiplier'),
      bonusBanner:  document.getElementById('bonus-banner'),
    };
  },

  show() { this._el.hud.classList.remove('hidden'); },
  hide() { this._el.hud.classList.add('hidden'); },

  setHealth(hp, maxHp = 100) {
    const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
    this._el.healthBar.style.width = pct + '%';
    if (pct <= 30) this._el.healthBar.classList.add('danger');
    else           this._el.healthBar.classList.remove('danger');
  },

  setScore(n) {
    this._el.score.textContent = Utils.formatScore(n);
  },

  setLevel(name) {
    this._el.levelTitle.textContent = name;
  },

  setSpliceState(state) {
    const el = this._el.spliceReady;
    el.className = '';
    switch (state) {
      case 'READY':    el.textContent = 'READY';    el.style.color = ''; break;
      case 'REC':      el.textContent = '● REC';    el.classList.add('recording'); break;
      case 'ACTIVE':   el.textContent = 'CLONING';  el.classList.add('recording'); break;
      case 'COOLDOWN': el.textContent = 'RECHARGE'; el.classList.add('cooldown');  break;
      default:         el.textContent = state;
    }
  },

  // ── Phase 3: Score multiplier ─────────────────────────────

  setMultiplier(val) {
    if (!this._el.multiplier) return;
    const v = parseFloat(val);
    this._el.multiplier.textContent = `×${v.toFixed(1)}`;
    // Highlight when boosted
    if (v > 1.0) {
      this._el.multiplier.classList.add('active');
    } else {
      this._el.multiplier.classList.remove('active');
    }
  },

  // ── Phase 3: Sector bonus flash ───────────────────────────

  showSectorBonus(msg) {
    if (!this._el.bonusBanner) return;
    this._el.bonusBanner.textContent = msg;
    this._el.bonusBanner.classList.add('show');
    clearTimeout(this._bonusTimer);
    this._bonusTimer = setTimeout(() => {
      this._el.bonusBanner.classList.remove('show');
    }, 2200);
  },

  // ── Phase 2 (unchanged) ───────────────────────────────────

  showBossBar(visible, name) {
    if (!this._el.bossWrap) return;
    if (visible) {
      this._el.bossWrap.classList.remove('hidden');
      this._el.bossLabel.textContent = name || 'BOSS';
      this._el.bossFill.style.width  = '100%';
    } else {
      this._el.bossWrap.classList.add('hidden');
    }
  },

  updateBossBar(hp, maxHp) {
    if (!this._el.bossFill) return;
    const pct = Math.max(0, Math.min(1, hp / maxHp));
    this._el.bossFill.style.width = (pct * 100) + '%';
    if (pct > 0.65)      this._el.bossFill.style.background = 'linear-gradient(90deg,#ff0066,#ff4488)';
    else if (pct > 0.30) this._el.bossFill.style.background = 'linear-gradient(90deg,#ff4400,#ff8800)';
    else                 this._el.bossFill.style.background = 'linear-gradient(90deg,#ff0000,#ff4400)';
  },

  setMuteIcon(muted) {
    if (!this._el.muteIcon) return;
    if (muted) this._el.muteIcon.classList.remove('hidden');
    else       this._el.muteIcon.classList.add('hidden');
  },

  setActivePowerups(effects) {
    // UIScene handles Phaser canvas display
  },

  showPhaseAlert(msg) {
    const uiScene = window._axiomUIScene;
    if (uiScene && uiScene.showPhaseAlert) uiScene.showPhaseAlert(msg);
  },

  // ── Transmission ──────────────────────────────────────────

  showTransmission(txKey, onDone) {
    const tx = AXIOM.TRANSMISSIONS[txKey];
    if (!tx) { if (onDone) onDone(); return; }

    const overlay = this._el.txOverlay;
    const fromEl  = this._el.txFrom;
    const textEl  = this._el.txText;

    fromEl.textContent = '// ' + tx.from;
    textEl.textContent = '';
    overlay.classList.remove('hidden');

    const fullText = tx.lines.join('\n');
    let idx = 0;
    const speed = 22;

    const timer = setInterval(() => {
      idx++;
      textEl.textContent = fullText.slice(0, idx);
      if (idx >= fullText.length) clearInterval(timer);
    }, speed);

    const handler = (e) => {
      if (e.code === 'Space') {
        clearInterval(timer);
        textEl.textContent = fullText;
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
