// ============================================================
//  AXIOM BREAK — MenuScene.js
// ============================================================

class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'Menu' }); }

  create() {
    HUD.hide();
    const W = AXIOM.WIDTH, H = AXIOM.HEIGHT;
    const g = this.add.graphics();

    // Background
    g.fillStyle(AXIOM.COLORS.BG, 1);
    g.fillRect(0, 0, W, H);

    // Animated grid lines
    this._gridLines = [];
    for (let x = 0; x < W; x += 48) {
      const ln = this.add.graphics();
      ln.lineStyle(1, 0x00f5ff, 0.06);
      ln.strokeLineShape({ x1: x, y1: 0, x2: x, y2: H });
      this._gridLines.push(ln);
    }
    for (let y = 0; y < H; y += 48) {
      const ln = this.add.graphics();
      ln.lineStyle(1, 0x00f5ff, 0.06);
      ln.strokeLineShape({ x1: 0, y1: y, x2: W, y2: y });
      this._gridLines.push(ln);
    }

    // Glowing center title box
    const boxG = this.add.graphics();
    boxG.lineStyle(1, 0x00f5ff, 0.4);
    boxG.strokeRect(W/2 - 210, H/2 - 130, 420, 230);
    boxG.lineStyle(1, 0x00f5ff, 0.15);
    boxG.strokeRect(W/2 - 204, H/2 - 124, 408, 218);

    // Corner marks
    for (const [cx, cy, ax, ay] of [
      [W/2-210, H/2-130, 1, 1],[W/2+210, H/2-130, -1, 1],
      [W/2-210, H/2+100, 1,-1],[W/2+210, H/2+100, -1,-1]
    ]) {
      boxG.lineStyle(2, 0x00f5ff, 1);
      boxG.strokeLineShape({ x1: cx, y1: cy, x2: cx + ax*20, y2: cy });
      boxG.strokeLineShape({ x1: cx, y1: cy, x2: cx, y2: cy + ay*20 });
    }

    // Title text
    this.add.text(W/2, H/2 - 80, 'AXIOM', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#00f5ff',
      stroke: '#003344',
      strokeThickness: 4,
      shadow: { blur: 30, color: '#00f5ff', fill: true },
    }).setOrigin(0.5);

    this.add.text(W/2, H/2 - 20, 'BREAK', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#003344',
      strokeThickness: 3,
      shadow: { blur: 15, color: '#00f5ff', fill: true },
    }).setOrigin(0.5);

    this.add.text(W/2, H/2 + 20, 'SIGNAL SPLICE PROTOCOL', {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '11px',
      color: '#006688',
      letterSpacing: 4,
    }).setOrigin(0.5);

    // Start prompt
    const startText = this.add.text(W/2, H/2 + 70, '[  PRESS SPACE TO INITIALIZE  ]', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '13px',
      color: '#00f5ff',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: { from: 1, to: 0.15 },
      duration: 900,
      yoyo: true,
      repeat: -1,
    });

    // Version
    this.add.text(W - 10, H - 10, 'v1.0 — PHASE 1', {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '9px',
      color: '#002233',
    }).setOrigin(1, 1);

    // Controls blurb
    this.add.text(W/2, H - 28, 'WASD/MOVE · LMB/SHOOT · E/RECORD · R/DEPLOY CLONE · SHIFT/DASH', {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '9px',
      color: '#004455',
    }).setOrigin(0.5);

    // Start game
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('Game', { levelIndex: 0 });
    });

    // Ambient particle stream
    this._spawnAmbient();
  }

  _spawnAmbient() {
    this.time.addEvent({
      delay: 120,
      loop: true,
      callback: () => {
        const x = Phaser.Math.Between(0, AXIOM.WIDTH);
        const dot = this.add.graphics();
        dot.fillStyle(0x00f5ff, Phaser.Math.FloatBetween(0.1, 0.5));
        dot.fillCircle(x, 0, Phaser.Math.Between(1, 3));
        this.tweens.add({
          targets: dot,
          y: AXIOM.HEIGHT,
          alpha: 0,
          duration: Phaser.Math.Between(1500, 3500),
          ease: 'Linear',
          onComplete: () => dot.destroy(),
        });
      }
    });
  }
}
