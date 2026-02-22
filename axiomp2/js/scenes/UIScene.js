// ============================================================
//  AXIOM BREAK — UIScene.js  [PHASE 2 REPLACEMENT]
//  Persistent overlay scene that runs ON TOP of GameScene.
//
//  Renders:
//   - Boss health bar (animated, phased colour)
//   - Wave counter
//   - Active powerup timers
//   - Minimap (via Minimap class)
//   - Phase alert banner
// ============================================================

class UIScene extends Phaser.Scene {
  constructor() { super({ key: 'UI', active: false }); }

  create() {
    const W = AXIOM.WIDTH;
    const H = AXIOM.HEIGHT;

    // ── Boss bar (hidden by default)
    this._bossBarVisible = false;
    this._bossHp   = 0;
    this._bossMax  = 1;
    this._bossName = '';

    this._bossBarGfx = this.add.graphics();
    this._bossBarGfx.setDepth(20);
    this._bossLabel  = this.add.text(W / 2, H - 38, '', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '9px',
      color: '#ff0066',
      letterSpacing: 3,
    }).setOrigin(0.5, 1).setDepth(21);

    this._bossBarGfx.setVisible(false);
    this._bossLabel.setVisible(false);

    // ── Wave counter
    this._waveText = this.add.text(16, 28, '', {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '9px',
      color: '#005566',
      letterSpacing: 2,
    }).setDepth(20);

    // ── Powerup timer bar
    this._powerupGfx  = this.add.graphics().setDepth(20);
    this._powerupLabel = this.add.text(16, H - 28, '', {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '9px',
      color: '#ffb700',
    }).setDepth(21);

    // ── Phase alert
    this._alertText = this.add.text(W / 2, H / 2 - 80, '', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ff0066',
      shadow: { blur: 20, color: '#ff0066', fill: true },
    }).setOrigin(0.5).setDepth(30).setAlpha(0);

    // ── Minimap
    this._minimap = new Minimap(this);

    // Tab key to toggle minimap
    this.input.keyboard.on('keydown-TAB', () => {
      this._minimap.toggle();
    });

    // M key for mute toggle
    this.input.keyboard.on('keydown-M', () => {
      const muted = AudioSynth.toggleMute();
      HUD.setMuteIcon(muted);
    });

    // Volume keys
    this.input.keyboard.on('keydown-COMMA', () => {
      AudioSynth.setVolume(AudioSynth._volume - 0.1);
    });
    this.input.keyboard.on('keydown-PERIOD', () => {
      AudioSynth.setVolume(AudioSynth._volume + 0.1);
    });
  }

  // ── Called by GameScene when boss spawns ───────────────────
  showBossBar(visible, name) {
    this._bossBarVisible = visible;
    this._bossName       = name || '';
    this._bossBarGfx.setVisible(visible);
    this._bossLabel.setVisible(visible);
    if (!visible) {
      this._bossBarGfx.clear();
      this._bossLabel.setText('');
    }
  }

  updateBossBar(hp, maxHp) {
    this._bossHp  = hp;
    this._bossMax = maxHp;
    this._redrawBossBar();
  }

  _redrawBossBar() {
    if (!this._bossBarVisible) return;
    const W   = AXIOM.WIDTH;
    const g   = this._bossBarGfx;
    const pct = Utils.clamp(this._bossHp / this._bossMax, 0, 1);
    const bw  = W * 0.55;
    const bx  = (W - bw) / 2;
    const by  = AXIOM.HEIGHT - 30;

    g.clear();

    // Track
    g.fillStyle(0x111111, 0.8);
    g.fillRect(bx, by, bw, 8);
    g.lineStyle(1, 0xff0066, 0.3);
    g.strokeRect(bx, by, bw, 8);

    // Filled portion with phase colour
    let barCol = 0xff0066;
    if (pct > 0.65)       barCol = 0xff0066;
    else if (pct > 0.30)  barCol = 0xff4400;
    else                   barCol = 0xff0000;

    if (pct > 0) {
      g.fillStyle(barCol, 1);
      g.fillRect(bx, by, bw * pct, 8);

      // Glow pulse
      const pulse = 0.3 + 0.3 * Math.sin(this.time.now / 150);
      g.fillStyle(0xffffff, pulse * 0.2);
      g.fillRect(bx, by, bw * pct, 4);
    }

    // Tick marks at phase thresholds
    for (const t of [0.30, 0.65]) {
      const tx = bx + bw * t;
      g.lineStyle(1, 0xffffff, 0.4);
      g.strokeLineShape({ x1: tx, y1: by - 2, x2: tx, y2: by + 10 });
    }

    // Label
    this._bossLabel.setText(
      `// ${this._bossName} //  ${Math.max(0, Math.ceil(this._bossHp))} / ${this._bossMax}`
    );
  }

  // ── Called by GameScene each frame ─────────────────────────
  updateMinimap(playerX, playerY, enemies, portalActive, portalX, portalY) {
    if (this._minimap) {
      this._minimap.update(playerX, playerY, enemies, portalActive, portalX, portalY);
    }
  }

  buildMinimap(layout) {
    if (this._minimap) this._minimap.buildMap(layout);
  }

  // ── Wave counter ───────────────────────────────────────────
  setWaveInfo(current, total) {
    this._waveText.setText(
      total > 0
        ? `WAVE ${current}/${total}`
        : (current > 0 ? `WAVE ${current} — CLEAR` : '')
    );
  }

  // ── Phase alert banner ─────────────────────────────────────
  showPhaseAlert(msg) {
    this._alertText.setText(msg);
    this._alertText.setAlpha(1);
    this.tweens.killTweensOf(this._alertText);
    this.tweens.add({
      targets: this._alertText,
      alpha: 0,
      duration: 1800,
      delay: 1000,
      ease: 'Cubic.easeIn',
    });
  }

  // ── Powerup display ────────────────────────────────────────
  updatePowerups(activeEffects) {
    const g = this._powerupGfx;
    g.clear();
    this._powerupLabel.setText('');

    if (!activeEffects) return;

    let msgs = [];

    if (activeEffects.SHIELD) {
      msgs.push('SHIELD ACTIVE');
      g.lineStyle(1.5, 0x0088ff, 0.8);
      g.strokeCircle(10, AXIOM.HEIGHT - 22, 5);
    }

    if (activeEffects.OVERCLOCK > 0) {
      const secs = (activeEffects.OVERCLOCK / 1000).toFixed(1);
      msgs.push(`OVERCLOCK ${secs}s`);

      // Small bar
      const bw  = 80;
      const pct = activeEffects.OVERCLOCK / AXIOM.POWERUPS.OVERCLOCK.duration;
      g.fillStyle(0xffb700, 0.2);
      g.fillRect(18, AXIOM.HEIGHT - 26, bw, 4);
      g.fillStyle(0xffb700, 0.9);
      g.fillRect(18, AXIOM.HEIGHT - 26, bw * pct, 4);
    }

    this._powerupLabel.setText(msgs.join('  |  '));
  }

  update() {
    if (this._bossBarVisible) this._redrawBossBar();
  }
}
