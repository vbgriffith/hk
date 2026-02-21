// ════════════════════════════════════════════════════════════
//  THE ASHWOOD INHERITANCE — BaseScene
//  Shared functionality for all game scenes
// ════════════════════════════════════════════════════════════

class BaseScene extends Phaser.Scene {
  constructor(config) {
    super(config);
    this.hotspots = [];
    this.activeHotspot = null;
    this.particles = [];
    this.sceneId = config.key;
  }

  // ──────────────────────────────────────────
  //  COMMON CREATE SETUP
  // ──────────────────────────────────────────
  baseCreate() {
    const { width: W, height: H } = this.cameras.main;
    this.W = W; this.H = H;

    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.cameras.main.setBackgroundColor('#080604');

    // Set audio for this scene
    audioManager.setScene(this.sceneId);

    // Update map
    if (window.mapUI) mapUI.renderRoomLabels?.();

    return { W, H };
  }

  // ──────────────────────────────────────────
  //  DRAW HELPERS (Graphics shortcuts)
  // ──────────────────────────────────────────
  drawRect(g, x, y, w, h, fillColor, fillAlpha = 1) {
    g.fillStyle(fillColor, fillAlpha);
    g.fillRect(x, y, w, h);
  }

  drawGradientSky(g, w, h, topColor, bottomColor) {
    // Phaser gradient via multiple filled strips
    const steps = 20;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const r1 = (topColor >> 16) & 0xFF, g1 = (topColor >> 8) & 0xFF, b1 = topColor & 0xFF;
      const r2 = (bottomColor >> 16) & 0xFF, g2 = (bottomColor >> 8) & 0xFF, b2 = bottomColor & 0xFF;
      const r = Math.round(r1 + (r2 - r1) * t);
      const gv = Math.round(g1 + (g2 - g1) * t);
      const b = Math.round(b1 + (b2 - b1) * t);
      const color = (r << 16) | (gv << 8) | b;
      const stripH = h / steps + 1;
      g.fillStyle(color, 1);
      g.fillRect(0, i * h / steps, w, stripH);
    }
  }

  // ──────────────────────────────────────────
  //  CANDLE / LIGHT FLICKER
  // ──────────────────────────────────────────
  createCandleFlicker(x, y, radius = 80, baseAlpha = 0.15) {
    const light = this.add.graphics();
    this.time.addEvent({
      delay: 80,
      loop: true,
      callback: () => {
        light.clear();
        const flicker = 0.7 + Math.random() * 0.3;
        const r = radius * flicker;
        light.fillStyle(0xc8882a, baseAlpha * flicker);
        light.fillCircle(x, y, r);
        light.fillStyle(0xe8a84a, baseAlpha * 0.5 * flicker);
        light.fillCircle(x, y, r * 0.4);
      }
    });
    return light;
  }

  // Animated candle flame shape
  createCandleFlame(x, y) {
    const g = this.add.graphics();
    let t = 0;
    this.time.addEvent({
      delay: 50,
      loop: true,
      callback: () => {
        t++;
        g.clear();
        const sway = Math.sin(t * 0.15) * 2;
        const flicker = 0.85 + Math.random() * 0.15;
        // Outer flame (amber)
        g.fillStyle(0xc8882a, 0.7 * flicker);
        g.fillTriangle(x + sway - 5, y, x + sway + 5, y, x + sway, y - 14 * flicker);
        // Inner flame (bright)
        g.fillStyle(0xffe8a0, 0.9 * flicker);
        g.fillTriangle(x + sway - 2, y, x + sway + 2, y, x + sway, y - 7 * flicker);
      }
    });
    return g;
  }

  // ──────────────────────────────────────────
  //  RAIN
  // ──────────────────────────────────────────
  createRain(density = 40) {
    const drops = [];
    for (let i = 0; i < density; i++) {
      drops.push({
        x: Phaser.Math.Between(0, this.W),
        y: Phaser.Math.Between(-this.H, 0),
        speed: Phaser.Math.Between(280, 480),
        alpha: Phaser.Math.FloatBetween(0.08, 0.2),
        len: Phaser.Math.Between(8, 18)
      });
    }

    const rainG = this.add.graphics();
    this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        rainG.clear();
        drops.forEach(d => {
          rainG.lineStyle(0.8, 0x5080a0, d.alpha);
          rainG.lineBetween(d.x, d.y, d.x - 2, d.y + d.len);
          d.y += d.speed * 0.016;
          if (d.y > this.H + 20) {
            d.y = Phaser.Math.Between(-20, 0);
            d.x = Phaser.Math.Between(0, this.W);
          }
        });
      }
    });
    return rainG;
  }

  // ──────────────────────────────────────────
  //  DUST MOTES
  // ──────────────────────────────────────────
  createDustMotes(count = 15) {
    const motes = [];
    for (let i = 0; i < count; i++) {
      motes.push({
        x: Phaser.Math.Between(0, this.W),
        y: Phaser.Math.FloatBetween(this.H * 0.2, this.H * 0.8),
        vx: Phaser.Math.FloatBetween(-0.3, 0.3),
        vy: Phaser.Math.FloatBetween(-0.2, -0.05),
        r: Phaser.Math.FloatBetween(0.8, 2.5),
        alpha: Phaser.Math.FloatBetween(0.05, 0.2),
        phase: Math.random() * Math.PI * 2
      });
    }
    const g = this.add.graphics();
    let t = 0;
    this.time.addEvent({
      delay: 32,
      loop: true,
      callback: () => {
        t++;
        g.clear();
        motes.forEach(m => {
          m.phase += 0.008;
          m.x += m.vx + Math.sin(m.phase) * 0.2;
          m.y += m.vy;
          if (m.y < -5) { m.y = this.H + 5; m.x = Phaser.Math.Between(0, this.W); }
          const pulse = m.alpha * (0.7 + 0.3 * Math.sin(m.phase * 2));
          g.fillStyle(0xd4b888, pulse);
          g.fillCircle(m.x, m.y, m.r);
        });
      }
    });
    return g;
  }

  // ──────────────────────────────────────────
  //  HOTSPOT MANAGEMENT
  // ──────────────────────────────────────────
  addHotspot(x, y, w, h, config) {
    // Create invisible interactive zone
    const zone = this.add.zone(x + w/2, y + h/2, w, h).setInteractive();
    const hotspot = {
      zone, x, y, w, h,
      id: config.id,
      label: config.label || 'Examine',
      clueId: config.clueId,
      itemId: config.itemId,
      dialogue: config.dialogue,
      onActivate: config.onActivate,
      examined: false,
      indicator: this.createHotspotIndicator(x + w/2, y + h/2)
    };

    zone.on('pointerover', () => {
      uiManager.showInteractionPrompt(config.label || 'Examine');
      this.activeHotspot = hotspot;
    });

    zone.on('pointerout', () => {
      uiManager.hideInteractionPrompt();
      if (this.activeHotspot === hotspot) this.activeHotspot = null;
    });

    zone.on('pointerdown', () => this.activateHotspot(hotspot));

    this.hotspots.push(hotspot);
    return hotspot;
  }

  createHotspotIndicator(x, y) {
    const g = this.add.graphics();
    let t = 0;
    const ev = this.time.addEvent({
      delay: 50, loop: true,
      callback: () => {
        t++;
        g.clear();
        const alpha = 0.2 + 0.15 * Math.sin(t * 0.08);
        g.lineStyle(1, 0xc8882a, alpha);
        g.strokeCircle(x, y, 14 + Math.sin(t * 0.05) * 3);
        g.fillStyle(0xc8882a, alpha * 0.3);
        g.fillCircle(x, y, 4);
      }
    });
    return { g, ev };
  }

  activateHotspot(hotspot) {
    if (hotspot.examined && !hotspot.repeatable) {
      uiManager.toast('Already examined.');
      return;
    }
    hotspot.examined = true;

    // Hide indicator once examined
    hotspot.indicator.g.clear();

    // Give clue
    if (hotspot.clueId) dialogueEngine.giveClue(hotspot.clueId);
    if (hotspot.itemId) {
      gameState.addItem(hotspot.itemId);
      uiManager.updateBadges();
    }

    // Start dialogue or narration
    if (hotspot.dialogue) {
      if (typeof hotspot.dialogue === 'string') {
        dialogueEngine.narrate([hotspot.dialogue]);
      } else if (Array.isArray(hotspot.dialogue)) {
        dialogueEngine.narrate(hotspot.dialogue);
      }
    }

    // Custom callback
    if (hotspot.onActivate) hotspot.onActivate(hotspot);
  }

  triggerHotspot() {
    if (this.activeHotspot) this.activateHotspot(this.activeHotspot);
  }

  // ──────────────────────────────────────────
  //  WINDOW / LIGHT EFFECT
  // ──────────────────────────────────────────
  createWindowLight(x, y, w, h, angle = 0.15) {
    const g = this.add.graphics();
    g.fillStyle(0xd4a840, 0.06);
    // Main beam
    const beamW = w * 3;
    const beamH = h * 4;
    g.fillTriangle(
      x, y + h,
      x + w, y + h,
      x + w + beamW, y + h + beamH
    );
    g.fillTriangle(
      x, y + h,
      x - beamW * angle, y + h + beamH,
      x + w + beamW, y + h + beamH
    );
    return g;
  }

  // ──────────────────────────────────────────
  //  COMMON NAVIGATION ZONE (to foyer/back)
  // ──────────────────────────────────────────
  addExitZone(exitId, exitLabel, x, y, w, h) {
    const zone = this.add.zone(x + w/2, y + h/2, w, h).setInteractive();

    // Exit label
    const textX = x + w/2;
    const textY = y + h/2;
    const bg = this.add.graphics();
    bg.fillStyle(0x080604, 0.6);
    bg.fillRect(x, y, w, h);
    const text = this.add.text(textX, textY, `→ ${exitLabel}`, {
      fontFamily: '"Special Elite", monospace',
      fontSize: '11px',
      fill: '#c8882a',
      alpha: 0.7
    }).setOrigin(0.5);

    zone.on('pointerover', () => {
      text.setAlpha(1);
      uiManager.showInteractionPrompt(exitLabel);
    });
    zone.on('pointerout', () => {
      text.setAlpha(0.7);
      uiManager.hideInteractionPrompt();
    });
    zone.on('pointerdown', () => {
      uiManager.hideInteractionPrompt();
      window.sceneManager?.goToLocation(exitId);
    });
  }
}
