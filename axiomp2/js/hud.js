// ============================================================
//  AXIOM BREAK — hud.js  [PHASE 2 REPLACEMENT]
//  Extends Phase 1 HUD with:
//   - showBossBar() / updateBossBar()  — DOM boss HP strip
//   - setMuteIcon()                    — mute indicator
//   - setActivePowerups()              — powerup status line
//   - showPhaseAlert()                 — phase transition banner
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
      // Phase 2
      bossWrap:     document.getElementById('boss-bar-wrap'),
      bossLabel:    document.getElementById('boss-bar-label'),
      bossFill:     document.getElementById('boss-bar-fill'),
      muteIcon:     document.getElementById('mute-icon'),
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

  // ── Phase 2: Boss bar ──────────────────────────────────────

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
    // Colour shift by phase
    if (pct > 0.65)      this._el.bossFill.style.background = 'linear-gradient(90deg,#ff0066,#ff4488)';
    else if (pct > 0.30) this._el.bossFill.style.background = 'linear-gradient(90deg,#ff4400,#ff8800)';
    else                 this._el.bossFill.style.background = 'linear-gradient(90deg,#ff0000,#ff4400)';
  },

  // ── Phase 2: Mute ─────────────────────────────────────────

  setMuteIcon(muted) {
    if (!this._el.muteIcon) return;
    if (muted) this._el.muteIcon.classList.remove('hidden');
    else       this._el.muteIcon.classList.add('hidden');
  },

  // ── Phase 2: Powerup status ───────────────────────────────
  // (visual handled by UIScene canvas; this is a spare DOM hook)
  setActivePowerups(effects) {
    // intentionally minimal — UIScene handles the Phaser canvas display
  },

  // ── Phase 2: Phase alert (forwarded to UIScene) ───────────
  showPhaseAlert(msg) {
    // UIScene.showPhaseAlert called directly from WraithBoss
    // This is a passthrough for cases where UIScene isn't up yet
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
