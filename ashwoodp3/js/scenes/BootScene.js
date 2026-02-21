// ════════════════════════════════════════════════════════════
//  BootScene — Initial setup
// ════════════════════════════════════════════════════════════
class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }
  create() {
    this.scene.start('PreloadScene');
  }
}

// ════════════════════════════════════════════════════════════
//  PreloadScene — Load any external assets, then title
// ════════════════════════════════════════════════════════════
class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: 'PreloadScene' }); }

  preload() {
    // Phase 2 uses procedurally generated graphics — no assets to load.
    // Phase 3+ would load spritesheet PNGs here.
    // Fake brief load for transition feel
    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      '...', {
        fontFamily: '"Libre Baskerville", serif',
        fontSize: '14px', fill: '#c8882a',
        alpha: 0.4, fontStyle: 'italic'
      }
    ).setOrigin(0.5);
  }

  create() {
    this.cameras.main.fadeIn(800, 0, 0, 0);
    this.time.delayedCall(1000, () => {
      this.scene.start('TitleBgScene');
    });
  }
}

// ════════════════════════════════════════════════════════════
//  TitleBgScene — Animated manor background for title screen
// ════════════════════════════════════════════════════════════
class TitleBgScene extends BaseScene {
  constructor() { super({ key: 'TitleBgScene' }); }

  create() {
    const { W, H } = this.baseCreate();

    // Sky
    const sky = this.add.graphics();
    this.drawGradientSky(sky, W, H * 0.65, 0x080810, 0x0d0c14);

    // Stars — sparse
    const stars = this.add.graphics();
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H * 0.55);
      const r = Phaser.Math.FloatBetween(0.3, 1.2);
      const a = Phaser.Math.FloatBetween(0.1, 0.5);
      stars.fillStyle(0xd4c8a8, a);
      stars.fillCircle(x, y, r);
    }

    // Twinkling stars
    this.time.addEvent({
      delay: 1800,
      loop: true,
      callback: () => {
        stars.clear();
        for (let i = 0; i < 60; i++) {
          const seed = i * 137.508;
          const x = (seed * 17) % W;
          const y = (seed * 31) % (H * 0.55);
          const r = (Math.sin(this.time.now * 0.001 + seed) * 0.4 + 0.8);
          stars.fillStyle(0xd4c8a8, r * 0.3);
          stars.fillCircle(x, y, r);
        }
      }
    });

    // Ground
    const ground = this.add.graphics();
    ground.fillStyle(0x060503, 1);
    ground.fillRect(0, H * 0.65, W, H * 0.35);

    // Tree line
    const trees = this.add.graphics();
    trees.fillStyle(0x080604, 1);
    for (let tx = 0; tx < W + 60; tx += 40) {
      const h = Phaser.Math.Between(40, 90);
      const treeW = Phaser.Math.Between(18, 32);
      trees.fillTriangle(
        tx, H * 0.65,
        tx + treeW / 2, H * 0.65 - h,
        tx + treeW, H * 0.65
      );
    }

    // Manor silhouette — dramatic
    const manor = this.add.graphics();
    manor.fillStyle(0x050402, 1);
    // Main body
    manor.fillRect(W * 0.28, H * 0.2, W * 0.44, H * 0.45);
    // West wing
    manor.fillRect(W * 0.12, H * 0.28, W * 0.18, H * 0.37);
    // East wing
    manor.fillRect(W * 0.7, H * 0.28, W * 0.18, H * 0.37);
    // Roof — main pointed
    manor.fillTriangle(W * 0.28, H * 0.2, W * 0.5, H * 0.04, W * 0.72, H * 0.2);
    // Towers
    manor.fillRect(W * 0.28, H * 0.07, W * 0.04, H * 0.15);
    manor.fillRect(W * 0.68, H * 0.07, W * 0.04, H * 0.15);
    // Tower roofs
    manor.fillTriangle(W * 0.28, H * 0.07, W * 0.3, H * 0.02, W * 0.32, H * 0.07);
    manor.fillTriangle(W * 0.68, H * 0.07, W * 0.7, H * 0.02, W * 0.72, H * 0.07);
    // Chimney stacks
    manor.fillRect(W * 0.38, H * 0.04, W * 0.025, H * 0.18);
    manor.fillRect(W * 0.595, H * 0.04, W * 0.025, H * 0.18);

    // Lit windows — amber glow on manor
    const windows = this.add.graphics();
    const windowPositions = [
      [W * 0.36, H * 0.3], [W * 0.44, H * 0.3], [W * 0.52, H * 0.3], [W * 0.6, H * 0.3],
      [W * 0.36, H * 0.41], [W * 0.52, H * 0.41],
      [W * 0.44, H * 0.51],
      [W * 0.16, H * 0.36], [W * 0.22, H * 0.36],
      [W * 0.74, H * 0.36],
    ];

    let wt = 0;
    this.time.addEvent({
      delay: 120,
      loop: true,
      callback: () => {
        wt++;
        windows.clear();
        windowPositions.forEach(([wx, wy], idx) => {
          const flicker = 0.25 + 0.12 * Math.sin(wt * 0.04 + idx * 0.7);
          windows.fillStyle(0xd4a840, flicker);
          windows.fillRect(wx, wy, 10, 14);
        });
        // Study window — brighter, story-significant
        const sf = 0.45 + 0.18 * Math.sin(wt * 0.06);
        windows.fillStyle(0xe8c060, sf);
        windows.fillRect(W * 0.46, H * 0.41, 12, 16);
      }
    });

    // Window light cones
    const cones = this.add.graphics();
    cones.fillStyle(0xd4a840, 0.03);
    windowPositions.forEach(([wx, wy]) => {
      cones.fillTriangle(wx + 5, wy + 14, wx - 15, wy + 60, wx + 25, wy + 60);
    });

    // Rain
    this.createRain(35);

    // Fog bank at ground level
    const fog = this.add.graphics();
    fog.fillStyle(0x0a0c10, 0.35);
    fog.fillRect(0, H * 0.62, W, H * 0.12);

    // Atmospheric haze
    const haze = this.add.graphics();
    haze.fillStyle(0x080812, 0.2);
    haze.fillRect(0, H * 0.1, W, H * 0.4);

    // Slow parallax wind on trees — subtle
    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        trees.setX(trees.x + (Math.random() - 0.5) * 1.5);
      }
    });
  }
}
