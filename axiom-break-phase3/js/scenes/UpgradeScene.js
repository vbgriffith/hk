// ============================================================
//  AXIOM BREAK — UpgradeScene.js  [PHASE 3]
//
//  Shown between sectors after clearing waves.
//  Presents 3 random available upgrades — player picks one.
//  If all 6 upgrades are already unlocked, shows BONUS SCORE screen.
//
//  Flow:
//    GameScene → (portal entered) → UpgradeScene → GameScene (next level)
//
//  Receives data: { nextLevelIndex, score, mapSeed }
//  Passes to GameScene: { levelIndex, score }
// ============================================================

class UpgradeScene extends Phaser.Scene {
  constructor() { super({ key: 'Upgrade' }); }

  init(data) {
    this._nextLevel = data.nextLevelIndex || 0;
    this._score     = data.score          || 0;
    this._seed      = data.mapSeed        || Date.now();
  }

  create() {
    const W = AXIOM.WIDTH, H = AXIOM.HEIGHT;

    // Dark overlay BG
    this.add.graphics()
      .fillStyle(0x000000, 1).fillRect(0, 0, W, H)
      .fillStyle(AXIOM.COLORS.FLOOR, 1).fillRect(10, 10, W-20, H-20)
      .lineStyle(1, AXIOM.COLORS.WALL_EDGE, 0.3).strokeRect(10, 10, W-20, H-20);

    // Scanline texture
    const scan = this.add.graphics();
    for (let y = 0; y < H; y += 3) {
      scan.lineStyle(1, 0x000000, 0.12);
      scan.strokeLineShape({ x1: 0, y1: y, x2: W, y2: y });
    }

    // Header
    this._drawHeader(W, H);

    // Get upgrade choices
    const choices = Progression.getChoices(3);

    if (choices.length === 0) {
      this._showMaxedOut(W, H);
      return;
    }

    // Draw choice cards
    this._drawChoices(choices, W, H);

    // Next sector preview (bottom)
    this._drawSectorPreview(W, H);

    // Keyboard shortcut hints
    this.add.text(W/2, H - 18, '[1] [2] [3] — SELECT   |   [SPACE] SKIP', {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '9px', color: '#003344', letterSpacing: 2,
    }).setOrigin(0.5);

    // Skip (space / enter) — take no upgrade
    this.input.keyboard.once('keydown-SPACE', () => this._advance(null));
    this.input.keyboard.once('keydown-ENTER', () => this._advance(null));

    // Number keys
    this.input.keyboard.once('keydown-ONE',   () => choices[0] && this._advance(choices[0].id));
    this.input.keyboard.once('keydown-TWO',   () => choices[1] && this._advance(choices[1].id));
    this.input.keyboard.once('keydown-THREE', () => choices[2] && this._advance(choices[2].id));
  }

  _drawHeader(W, H) {
    // Sector cleared line
    this.add.text(W/2, 28, '// SECTOR CLEARED //', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '10px', color: '#39ff14', letterSpacing: 4,
    }).setOrigin(0.5);

    this.add.text(W/2, 52, 'SELECT UPGRADE', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '22px', fontStyle: 'bold',
      color: '#00f5ff',
      shadow: { blur: 14, color: '#00f5ff', fill: true },
    }).setOrigin(0.5);

    // Score
    this.add.text(W - 24, 28, `SCORE: ${Utils.formatScore(this._score)}`, {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '10px', color: '#005566',
    }).setOrigin(1, 0.5);

    // Current upgrades summary (tiny)
    const owned = Progression.getUnlocked();
    if (owned.length > 0) {
      const names = owned.map(u => u.name).join('  ·  ');
      this.add.text(W/2, 74, `INSTALLED: ${names}`, {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '8px', color: '#004455', letterSpacing: 1,
      }).setOrigin(0.5);
    }

    // Divider
    this.add.graphics()
      .lineStyle(1, AXIOM.COLORS.WALL_EDGE, 0.4)
      .strokeLineShape({ x1: 20, y1: 88, x2: W-20, y2: 88 });
  }

  _drawChoices(choices, W, H) {
    const cardW  = 200;
    const cardH  = 190;
    const gap    = 24;
    const totalW = choices.length * cardW + (choices.length - 1) * gap;
    const startX = (W - totalW) / 2;
    const cardY  = 104;

    choices.forEach((upg, idx) => {
      const cx = startX + idx * (cardW + gap);
      this._drawCard(upg, idx + 1, cx, cardY, cardW, cardH);
    });
  }

  _drawCard(upg, num, x, y, w, h) {
    const g = this.add.graphics();

    // Background
    g.fillStyle(0x060a10, 0.95);
    g.fillRect(x, y, w, h);

    // Border (dim)
    g.lineStyle(1, Phaser.Display.Color.HexStringToColor(upg.cssColor).color, 0.35);
    g.strokeRect(x, y, w, h);

    // Corner marks
    const col = Phaser.Display.Color.HexStringToColor(upg.cssColor).color;
    g.lineStyle(2, col, 0.8);
    for (const [cx, cy, ax, ay] of [
      [x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]
    ]) {
      g.strokeLineShape({ x1:cx, y1:cy, x2:cx+ax*10, y2:cy });
      g.strokeLineShape({ x1:cx, y1:cy, x2:cx, y2:cy+ay*10 });
    }

    // Tree label
    this.add.text(x + w/2, y + 14, upg.tree, {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '8px', letterSpacing: 3,
      color: upg.cssColor, alpha: 0.6,
    }).setOrigin(0.5).setAlpha(0.55);

    // Icon
    this.add.text(x + w/2, y + 40, upg.icon, {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '28px', color: upg.cssColor,
    }).setOrigin(0.5);

    // Name
    this.add.text(x + w/2, y + 82, upg.name, {
      fontFamily: 'Orbitron, monospace',
      fontSize: '13px', fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Desc
    this.add.text(x + w/2, y + 110, upg.desc, {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '10px', color: '#aabbcc',
      align: 'center', lineSpacing: 4,
    }).setOrigin(0.5);

    // Key hint
    this.add.text(x + w/2, y + h - 18, `[${num}] SELECT`, {
      fontFamily: 'Orbitron, monospace',
      fontSize: '9px', color: upg.cssColor, letterSpacing: 2,
    }).setOrigin(0.5);

    // Hover interaction
    const zone = this.add.zone(x, y, w, h).setOrigin(0, 0).setInteractive();
    zone.on('pointerover', () => {
      g.clear();
      g.fillStyle(0x0a1520, 1).fillRect(x, y, w, h);
      g.lineStyle(2, Phaser.Display.Color.HexStringToColor(upg.cssColor).color, 0.9);
      g.strokeRect(x, y, w, h);
      AudioSynth.play('hit');
    });
    zone.on('pointerout', () => {
      g.clear();
      g.fillStyle(0x060a10, 0.95).fillRect(x, y, w, h);
      g.lineStyle(1, Phaser.Display.Color.HexStringToColor(upg.cssColor).color, 0.35);
      g.strokeRect(x, y, w, h);
    });
    zone.on('pointerdown', () => this._advance(upg.id));
  }

  _drawSectorPreview(W, H) {
    const previewY = H - 100;

    this.add.graphics()
      .lineStyle(1, AXIOM.COLORS.WALL_EDGE, 0.25)
      .strokeLineShape({ x1: 20, y1: previewY - 10, x2: W-20, y2: previewY - 10 });

    this.add.text(W/2, previewY, 'NEXT SECTOR LAYOUT', {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '8px', color: '#003344', letterSpacing: 3,
    }).setOrigin(0.5);

    // Generate and render mini preview of next map
    const result = ProceduralGen.generate(this._seed);
    const previewGfx = this.add.graphics();
    const cellSize = 5;
    const mapW = result.layout[0].length * cellSize;
    const mapH = result.layout.length * cellSize;
    ProceduralGen.renderPreview(
      result.layout, previewGfx,
      W/2 - mapW/2, previewY + 16, cellSize
    );
  }

  _showMaxedOut(W, H) {
    // All upgrades owned — bonus score screen
    this.add.text(W/2, H/2 - 30, 'ALL UPGRADES INSTALLED', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '18px', color: '#39ff14',
      shadow: { blur: 12, color: '#39ff14', fill: true },
    }).setOrigin(0.5);

    this._score += 5000;
    this.add.text(W/2, H/2 + 10, '+5000 SCORE BONUS', {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '13px', color: '#ffb700',
    }).setOrigin(0.5);

    const cont = this.add.text(W/2, H/2 + 60, '[PRESS SPACE]', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '11px', color: '#00f5ff',
    }).setOrigin(0.5);

    this.tweens.add({ targets: cont, alpha: { from: 1, to: 0.2 }, yoyo: true, repeat: -1, duration: 700 });
    this.input.keyboard.once('keydown-SPACE', () => this._advance(null));
  }

  _advance(upgradeId) {
    if (upgradeId) {
      Progression.unlock(upgradeId);
      AudioSynth.play('powerup');
    }
    this.scene.start('Game', {
      levelIndex: this._nextLevel,
      score:      this._score,
    });
  }
}
