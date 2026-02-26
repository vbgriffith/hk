/**
 * scenes/BootScene.js
 * Phase 1: Boot / preload.
 * Generates all game textures procedurally using Phaser Graphics.
 * No external image files needed — everything is drawn at runtime.
 */

class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    // Nothing to load from disk — all assets are generated in create()
    this.showLoadText();
  }

  showLoadText() {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2, 'INITIALIZING...', {
      fontFamily: CONFIG.FONT_PIXEL,
      fontSize:   '16px',
      color:      CONFIG.COLORS.TEXT_MAIN,
    }).setOrigin(0.5);
  }

  create() {
    this.generateTextures();
    this.scene.start('MenuScene');
  }

  // ────────────────────────────────────────────────────────
  // Procedural texture generators
  // ────────────────────────────────────────────────────────

  generateTextures() {
    this.makeAlienTextures();
    this.makePlayerTexture();
    this.makeBulletTexture();
    this.makeBombTexture();
    this.makeBarrierTexture();
    this.makeExplosionParticle();
    this.makeStarTexture();
  }

  /**
   * Three alien body shapes, one per row color.
   * Each is a 48×40 pixel sprite drawn as a classic space-invader silhouette.
   */
  makeAlienTextures() {
    const types = [
      { key: 'alien_0', color: CONFIG.COLORS.ALIEN_ROW0, shape: 'crab'   },
      { key: 'alien_1', color: CONFIG.COLORS.ALIEN_ROW1, shape: 'squid'  },
      { key: 'alien_2', color: CONFIG.COLORS.ALIEN_ROW2, shape: 'spider' },
    ];

    for (const { key, color, shape } of types) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(color, 1);
      g.lineStyle(1, 0xffffff, 0.2);

      const W = 48, H = 40;

      if (shape === 'crab') {
        // Body
        g.fillRoundedRect(8, 10, 32, 22, 4);
        // Eyes
        g.fillStyle(0x000000, 1); g.fillRect(14, 15, 6, 6); g.fillRect(28, 15, 6, 6);
        g.fillStyle(0xffffff, 1); g.fillRect(16, 17, 3, 3); g.fillRect(30, 17, 3, 3);
        g.fillStyle(color, 1);
        // Antennae
        g.fillRect(10, 4, 3, 8); g.fillRect(35, 4, 3, 8);
        g.fillRect(6, 2, 6, 4);  g.fillRect(36, 2, 6, 4);
        // Claws
        g.fillRect(2, 26, 8, 6); g.fillRect(38, 26, 8, 6);
        g.fillRect(0, 28, 4, 4); g.fillRect(44, 28, 4, 4);
        // Legs
        g.fillRect(12, 32, 4, 6); g.fillRect(22, 32, 4, 6); g.fillRect(32, 32, 4, 6);

      } else if (shape === 'squid') {
        // Dome
        g.fillEllipse(24, 16, 30, 22);
        // Eyes
        g.fillStyle(0x000000, 1); g.fillRect(14, 12, 6, 6); g.fillRect(28, 12, 6, 6);
        g.fillStyle(0xffffff, 1); g.fillRect(16, 14, 3, 3); g.fillRect(30, 14, 3, 3);
        g.fillStyle(color, 1);
        // Tentacles
        for (let i = 0; i < 6; i++) {
          g.fillRect(6 + i * 7, 26, 4, 10 + (i % 2) * 4);
        }

      } else { // spider
        // Head
        g.fillRect(14, 8, 20, 18);
        // Eyes
        g.fillStyle(0x000000, 1); g.fillRect(17, 12, 5, 5); g.fillRect(26, 12, 5, 5);
        g.fillStyle(0xffffff, 1); g.fillRect(19, 14, 2, 2); g.fillRect(28, 14, 2, 2);
        g.fillStyle(color, 1);
        // Mandibles
        g.fillRect(12, 24, 6, 4); g.fillRect(30, 24, 6, 4);
        // Legs
        g.fillRect(2, 14, 12, 3);  g.fillRect(34, 14, 12, 3);
        g.fillRect(4, 20, 10, 3);  g.fillRect(34, 20, 10, 3);
        g.fillRect(6, 26, 8, 3);   g.fillRect(34, 26, 8, 3);
        // Abdomen
        g.fillEllipse(24, 34, 18, 12);
      }

      // Render to texture
      const rt = this.add.renderTexture(0, 0, W, H).setVisible(false);
      rt.draw(g, 0, 0);
      rt.saveTexture(key);
      g.destroy();
      rt.destroy();
    }
  }

  makePlayerTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const W = 48, H = 36;
    const C = CONFIG.COLORS.PLAYER;

    g.fillStyle(C, 1);
    // Main hull
    g.fillRect(14, 16, 20, 14);
    // Nose
    g.fillTriangle(24, 2, 14, 16, 34, 16);
    // Wings
    g.fillRect(2, 22, 14, 8);
    g.fillRect(32, 22, 14, 8);
    // Engine glow
    g.fillStyle(0x00aaff, 0.8);
    g.fillRect(18, 28, 4, 6);
    g.fillRect(26, 28, 4, 6);
    // Cockpit
    g.fillStyle(0x80ffff, 0.9);
    g.fillEllipse(24, 12, 8, 10);

    const rt = this.add.renderTexture(0, 0, W, H).setVisible(false);
    rt.draw(g, 0, 0);
    rt.saveTexture('player');
    g.destroy();
    rt.destroy();
  }

  makeBulletTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(CONFIG.COLORS.BULLET, 1);
    g.fillRect(0, 0, 4, 14);
    g.fillStyle(0xffffff, 0.8);
    g.fillRect(1, 0, 2, 4);

    const rt = this.add.renderTexture(0, 0, 4, 14).setVisible(false);
    rt.draw(g, 0, 0);
    rt.saveTexture('bullet');
    g.destroy();
    rt.destroy();
  }

  makeBombTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(CONFIG.COLORS.BOMB, 1);
    // Zigzag bomb
    g.fillRect(2, 0, 4, 4);
    g.fillRect(0, 4, 4, 4);
    g.fillRect(2, 8, 4, 4);
    g.fillRect(0, 12, 4, 4);

    const rt = this.add.renderTexture(0, 0, 8, 16).setVisible(false);
    rt.draw(g, 0, 0);
    rt.saveTexture('bomb');
    g.destroy();
    rt.destroy();
  }

  makeBarrierTexture() {
    const g  = this.make.graphics({ x: 0, y: 0, add: false });
    const W  = 64, H = 40;
    g.fillStyle(CONFIG.COLORS.BARRIER, 1);
    // Classic bunker shape
    g.fillRect(0, 10, 64, 30);
    g.fillRect(10, 0, 44, 14);
    // Notch (gun port)
    g.fillStyle(0x000000, 1);
    g.fillRect(22, 26, 20, 14);

    const rt = this.add.renderTexture(0, 0, W, H).setVisible(false);
    rt.draw(g, 0, 0);
    rt.saveTexture('barrier');
    g.destroy();
    rt.destroy();
  }

  makeExplosionParticle() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 6, 6);

    const rt = this.add.renderTexture(0, 0, 6, 6).setVisible(false);
    rt.draw(g, 0, 0);
    rt.saveTexture('particle');
    g.destroy();
    rt.destroy();
  }

  makeStarTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 2, 2);

    const rt = this.add.renderTexture(0, 0, 2, 2).setVisible(false);
    rt.draw(g, 0, 0);
    rt.saveTexture('star');
    g.destroy();
    rt.destroy();
  }
}
