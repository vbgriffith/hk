/* js/ui/HUD.js — In-game heads-up display */
'use strict';

class HUD {
  constructor(scene) {
    this.scene  = scene;
    this._masks = [];
    this._soulOrbs = [];
    this._geoText  = null;
    this._geoIcon  = null;
    this._dreamNailCharge = null;

    this._build();
  }

  _build() {
    const s = this.scene;
    const M = 6;  // margin

    // ── Masks (health) ────────────────────────────────────────────────────
    for (let i = 0; i < C.MASK_MAX; i++) {
      const mask = s.add.graphics();
      mask.setScrollFactor(0).setDepth(C.LAYER_UI);
      mask.setPosition(M + i * 14, M);
      this._masks.push(mask);
    }

    // ── Soul vessel ───────────────────────────────────────────────────────
    this._soulVessel = s.add.graphics();
    this._soulVessel.setScrollFactor(0).setDepth(C.LAYER_UI);
    this._soulVessel.setPosition(M, 30);

    this._soulFill = s.add.graphics();
    this._soulFill.setScrollFactor(0).setDepth(C.LAYER_UI + 0.5);
    this._soulFill.setPosition(M, 30);

    // ── Geo counter ───────────────────────────────────────────────────────
    this._geoText = s.add.text(C.WIDTH - M, M, '0', {
      fontFamily: 'Cinzel',
      fontSize: 27,
      color: '#e8c84a',
    }).setScrollFactor(0).setDepth(C.LAYER_UI).setOrigin(1, 0);

    // Geo icon (diamond shape)
    this._geoIcon = s.add.graphics();
    this._geoIcon.setScrollFactor(0).setDepth(C.LAYER_UI);
    this._geoIcon.setPosition(C.WIDTH - M - 30, M + 5);
    this._geoIcon.fillStyle(0xe8c84a);
    this._geoIcon.fillTriangle(0, -5, 5, 0, 0, 5);
    this._geoIcon.fillTriangle(0, -5, -5, 0, 0, 5);

    // ── Focus bar (shown only during focus) ───────────────────────────────
    this._focusBar = s.add.graphics();
    this._focusBar.setScrollFactor(0).setDepth(C.LAYER_UI);
    this._focusBar.setVisible(false);

    this.update();
  }

  update() {
    const knight = this.scene.knight;
    if (!knight) return;

    this._drawMasks(knight.masks, knight.masksMax);
    this._drawSoul(knight.soul);
    this._geoText.setText(String(knight.geo));
  }

  _drawMasks(current, max) {
    for (let i = 0; i < this._masks.length; i++) {
      const g = this._masks[i];
      g.clear();

      if (i >= max) { g.setVisible(false); continue; }
      g.setVisible(true);

      // Shell outline
      g.lineStyle(1, 0x888888, 0.7);
      g.strokeCircle(5, 5, 5);

      if (i < current) {
        // Full mask — white/cream fill
        g.fillStyle(0xe8e0d0, 1);
        g.fillCircle(5, 5, 4.5);
        // Shine
        g.fillStyle(0xffffff, 0.5);
        g.fillCircle(3.5, 3.5, 1.5);
      } else {
        // Empty mask — dark
        g.fillStyle(0x1a1a2a, 0.8);
        g.fillCircle(5, 5, 4);
      }
    }
  }

  _drawSoul(soul) {
    const g  = this._soulVessel;
    const gf = this._soulFill;
    g.clear(); gf.clear();

    const W = 4, H = 22;

    // Vessel border
    g.lineStyle(1, 0x5ae3e3, 0.5);
    g.strokeRect(0, 0, W, H);

    // Soul fill (bottom to top)
    const fillH = Math.floor((soul / C.SOUL_MAX) * H);
    if (fillH > 0) {
      gf.fillStyle(0x5ae3e3, 0.9);
      gf.fillRect(1, H - fillH, W - 2, fillH);

      // Glow
      gf.fillStyle(0xaaf5f5, 0.3);
      gf.fillRect(1, H - fillH, 1, fillH);
    }

    // Notches at 1/3 intervals
    g.lineStyle(1, 0x5ae3e3, 0.3);
    g.lineBetween(0, Math.floor(H * 0.33), W, Math.floor(H * 0.33));
    g.lineBetween(0, Math.floor(H * 0.67), W, Math.floor(H * 0.67));
  }

  showFocusBar(pct) {
    const g = this._focusBar;
    g.clear().setVisible(true);
    const W = 30, H = 3;
    const x = C.WIDTH / 2 - W / 2;
    const y = C.HEIGHT - 20;
    g.fillStyle(0x1a1a2a, 0.7);
    g.fillRect(x, y, W, H);
    g.fillStyle(0x5ae3e3, 0.9);
    g.fillRect(x, y, W * pct, H);
    g.lineStyle(0.5, 0x5ae3e3, 0.4);
    g.strokeRect(x, y, W, H);
  }

  hideFocusBar() {
    this._focusBar.setVisible(false);
  }

  flashMasks() {
    // Quick red flash on all masks
    for (const g of this._masks) {
      this.scene.tweens.add({
        targets: g, alpha: 0.2, duration: 80,
        yoyo: true, repeat: 3,
        onComplete: () => g.setAlpha(1),
      });
    }
  }

  showAreaName(name) {
    if (this._areaText) this._areaText.destroy();
    this._areaText = this.scene.add.text(
      C.WIDTH / 2, C.HEIGHT - 14, name, {
        fontFamily: 'IM Fell English',
        fontStyle: 'italic',
        fontSize: 24,
        color: '#d4cfc9',
        alpha: 0,
      }
    ).setScrollFactor(0).setDepth(C.LAYER_UI).setOrigin(0.5, 1);

    this.scene.tweens.add({
      targets: this._areaText,
      alpha: 0.8, duration: 800, ease: 'Sine.easeOut',
      hold: 2000,
      yoyo: true,
      onComplete: () => { this._areaText?.destroy(); this._areaText = null; },
    });
  }

  resize(w, h) {
    // Reposition elements if canvas resized
  }

  /** Returns all display objects owned by the HUD for protection during room clears */
  getDisplayObjects() {
    return [
      ...this._masks,
      this._soulVessel,
      this._soulFill,
      this._geoText,
      this._geoIcon,
      this._focusBar,
      this._bossBar,
      this._bossName,
    ].filter(Boolean);
  }
}

// ── Phase II: Boss health bar additions ───────────────────────────────────

Object.assign(HUD.prototype, {

  showBossBar(name, hp, maxHp) {
    const W = C.WIDTH, H = C.HEIGHT;
    const BW = W * 0.6, BH = 7, BX = W * 0.2, BY = H - 18;

    if (!this._bossBar) {
      this._bossBar = this.scene.add.graphics()
        .setScrollFactor(0).setDepth(C.LAYER_UI + 5);
    }
    if (!this._bossName) {
      this._bossName = this.scene.add.text(W / 2, H - 26, '', {
        fontFamily: 'Cinzel', fontSize: 21, color: '#d4cfc9',
      }).setScrollFactor(0).setDepth(C.LAYER_UI + 5).setOrigin(0.5);
    }

    this._bossMaxHp = maxHp;
    this._bossBarW  = BW;
    this._bossBarX  = BX;
    this._bossBarY  = BY;
    this._bossBarH  = BH;

    this._bossName.setText(name).setVisible(true);
    this._bossBar.setVisible(true);
    this.updateBossBar(hp, maxHp);

    // Animate in from bottom
    this._bossBar.setAlpha(0);
    this._bossName.setAlpha(0);
    this.scene.tweens.add({
      targets: [this._bossBar, this._bossName],
      alpha: 1, duration: 400, ease: 'Sine.easeOut',
    });
  },

  updateBossBar(hp, maxHp) {
    if (!this._bossBar) return;
    const g = this._bossBar;
    g.clear();
    const pct = Math.max(0, hp / (maxHp || 1));
    const BW  = this._bossBarW, BH = this._bossBarH;
    const BX  = this._bossBarX, BY  = this._bossBarY;

    // Background
    g.fillStyle(0x1a1a2a, 0.9);
    g.fillRoundedRect(BX - 1, BY - 1, BW + 2, BH + 2, 2);

    // Red empty portion
    g.fillStyle(0x3a0a0a, 0.8);
    g.fillRoundedRect(BX, BY, BW, BH, 1);

    // Filled portion — shifts orange in rage phase
    const fillCol = pct < 0.4 ? 0xff4400 : 0xcc2222;
    g.fillStyle(fillCol, 0.9);
    g.fillRoundedRect(BX, BY, BW * pct, BH, 1);

    // Shine
    g.fillStyle(0xffffff, 0.1);
    g.fillRect(BX, BY, BW * pct, 2);

    // Border
    g.lineStyle(0.5, 0x888888, 0.5);
    g.strokeRoundedRect(BX - 1, BY - 1, BW + 2, BH + 2, 2);
  },

  hideBossBar() {
    if (!this._bossBar) return;
    this.scene.tweens.add({
      targets: [this._bossBar, this._bossName],
      alpha: 0, duration: 600,
      onComplete: () => {
        this._bossBar?.setVisible(false);
        this._bossName?.setVisible(false);
      },
    });
  },

});
