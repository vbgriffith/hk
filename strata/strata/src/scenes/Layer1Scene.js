/**
 * STRATA — Layer1Scene
 * PILGRIM — the 2009 ARG surface layer.
 * Flash-era browser game aesthetic. Chunky pixels, bright palette, warm cursor.
 * Veldenmoor: cobblestones, ravens, Oswin the merchant.
 * Thousands of players loved this. Some are still here.
 */
class Layer1Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Layer1Scene' });
    this._world = null;
    this._player = null;
    this._oswin = null;
    this._camera = { x: 0, y: 0 };
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    StateManager.enterLayer(1);
    TransitionEngine.init(this);

    // PILGRIM has a slightly pixelated look — simulate with a subtle render pass
    this._graphics = this.add.graphics();

    // Generate Veldenmoor procedurally
    this._generateWorld(W, H);

    // Spawn player (Maren, manifested in the ARG layer as a cursor-like presence)
    this._spawnPlayer(W, H);

    // Spawn Oswin at the market square
    this._oswin = new OswinEntity(this, this._marketX, this._marketY);

    // Browser-frame overlay — this appears to be running inside a Flash player
    this._drawBrowserFrame(W, H);

    // HUD: layer indicator
    this._hud = new HUD(this, W, H);
    this._hud.init();

    // Controls
    this._cursors = this.input.keyboard.createCursorKeys();
    this._wasd = this.input.keyboard.addKeys('W,A,S,D');

    // Escape returns to Layer 0
    this.input.keyboard.on('keydown-ESC', () => this._returnToLayer0());

    // Dialogue engine
    this._dialogue = new DialogueEngine(this, W, H);

    // Fade in
    this._fadeIn(W, H);

    EventBus.on('layer:request', (d) => {
      if (d.targetLayer === 0) this._returnToLayer0();
      if (d.targetLayer === 2) this._descendToLayer2();
    }, this);
  }

  _generateWorld(W, H) {
    const g = this.add.graphics();
    const TILE = 32;

    // Sky gradient — warm morning light
    const skyColors = [0x8ecae6, 0xa8d8ea, 0xffd166];
    g.fillStyle(0xa8d8ea, 1);
    g.fillRect(0, 0, W, H * 0.35);

    // Sun — warm circle
    g.fillStyle(0xffd166, 0.9);
    g.fillCircle(W * 0.15, H * 0.12, 28);
    // Sun glow
    g.fillStyle(0xffd166, 0.2);
    g.fillCircle(W * 0.15, H * 0.12, 48);

    // Background hills — rolling shapes
    g.fillStyle(0x6aa76f, 1);
    for (let i = 0; i < 5; i++) {
      const hx = (W / 5) * i + W / 10;
      const hy = H * 0.28 + Math.sin(i * 1.7) * 20;
      const r = 90 + i * 15;
      g.fillEllipse(hx, hy, r * 2, r * 0.8);
    }

    // Ground base
    g.fillStyle(0xc8a96e, 1);
    g.fillRect(0, H * 0.32, W, H * 0.68);

    // Cobblestone pattern — rows of offset stones
    g.fillStyle(0xb89860, 1);
    const stoneW = 28, stoneH = 14;
    for (let row = 0; row < 30; row++) {
      const oy = H * 0.32 + row * stoneH;
      const offsetX = (row % 2) * (stoneW / 2);
      for (let col = -1; col < W / stoneW + 1; col++) {
        const sx = col * stoneW + offsetX;
        const shade = (row + col) % 3 === 0 ? 0xb08050 : 0xc09868;
        g.fillStyle(shade, 1);
        g.fillRoundedRect(sx + 1, oy + 1, stoneW - 2, stoneH - 2, 2);
        g.lineStyle(1, 0x907040, 0.5);
        g.strokeRoundedRect(sx + 1, oy + 1, stoneW - 2, stoneH - 2, 2);
      }
    }

    // Buildings — procedural row of shop facades
    this._drawBuildings(g, W, H);

    // Trees / lamp posts
    this._drawStreetDetails(g, W, H);

    // Market square indicator
    this._marketX = W * 0.5;
    this._marketY = H * 0.55;
    g.lineStyle(2, 0xd4a03a, 0.6);
    g.strokeCircle(this._marketX, this._marketY, 40);
    g.lineStyle(1, 0xd4a03a, 0.3);
    g.strokeCircle(this._marketX, this._marketY, 55);

    // Raven — sitting on a post
    this._drawRaven(g, W * 0.72, H * 0.4);

    // Sign: VELDENMOOR
    this._drawSign(g, W * 0.08, H * 0.42, 'VELDENMOOR', 0x5a3e28);
  }

  _drawBuildings(g, W, H) {
    const buildingData = [
      { x: 0.05, w: 0.12, h: 0.22, color: 0xd4956a, roofColor: 0x8b4513, label: "Apothecary" },
      { x: 0.18, w: 0.10, h: 0.18, color: 0xc8a87a, roofColor: 0x6b3a1f, label: "Inn" },
      { x: 0.29, w: 0.14, h: 0.24, color: 0xb8956a, roofColor: 0x9b5523, label: "Cartographer" },
      { x: 0.58, w: 0.11, h: 0.20, color: 0xd0a860, roofColor: 0x7a4418, label: "Curiosities" },
      { x: 0.70, w: 0.13, h: 0.22, color: 0xc4906a, roofColor: 0x8b3e1a, label: "Blacksmith" },
      { x: 0.84, w: 0.15, h: 0.19, color: 0xd8b070, roofColor: 0x7b4a1e, label: "" },
    ];

    buildingData.forEach(b => {
      const bx = W * b.x;
      const bw = W * b.w;
      const bh = H * b.h;
      const by = H * 0.32 - bh;

      // Wall
      g.fillStyle(b.color, 1);
      g.fillRect(bx, by, bw, bh);

      // Dark outline
      g.lineStyle(2, 0x5a3a20, 0.7);
      g.strokeRect(bx, by, bw, bh);

      // Roof — triangle
      g.fillStyle(b.roofColor, 1);
      g.fillTriangle(bx - 4, by, bx + bw / 2, by - bh * 0.3, bx + bw + 4, by);
      g.lineStyle(2, 0x3a2010, 0.6);
      g.strokeTriangle(bx - 4, by, bx + bw / 2, by - bh * 0.3, bx + bw + 4, by);

      // Window
      g.fillStyle(0xf0d890, 0.7);
      g.fillRect(bx + bw * 0.2, by + bh * 0.25, bw * 0.25, bh * 0.2);
      g.fillRect(bx + bw * 0.55, by + bh * 0.25, bw * 0.25, bh * 0.2);
      g.lineStyle(1, 0x7a5a30, 1);
      g.strokeRect(bx + bw * 0.2, by + bh * 0.25, bw * 0.25, bh * 0.2);
      g.strokeRect(bx + bw * 0.55, by + bh * 0.25, bw * 0.25, bh * 0.2);

      // Door
      g.fillStyle(0x6b3a1f, 1);
      g.fillRect(bx + bw * 0.35, by + bh * 0.6, bw * 0.3, bh * 0.4);
      g.fillStyle(0xd4a03a, 1);
      g.fillCircle(bx + bw * 0.35 + bw * 0.25, by + bh * 0.8, 3);

      // Label
      if (b.label) {
        g.fillStyle(0x4a2e10, 0.8);
        g.fillRect(bx + bw * 0.1, by + bh * 0.05, bw * 0.8, 14);
      }
    });
  }

  _drawStreetDetails(g, W, H) {
    // Lamp posts
    const lampPositions = [0.15, 0.38, 0.62, 0.85];
    lampPositions.forEach(px => {
      const lx = W * px;
      const ly = H * 0.32;
      g.fillStyle(0x4a3a28, 1);
      g.fillRect(lx - 3, ly - 60, 6, 60);
      g.fillRect(lx - 8, ly - 62, 16, 4);
      // Lamp glow
      g.fillStyle(0xffd166, 0.5);
      g.fillCircle(lx, ly - 70, 10);
      g.fillStyle(0xffd166, 0.2);
      g.fillCircle(lx, ly - 70, 18);
    });

    // Scattered autumn leaves
    g.fillStyle(0xd4821a, 0.6);
    for (let i = 0; i < 20; i++) {
      const lx = (i * 137.5) % W;
      const ly = H * 0.32 + (i * 73) % (H * 0.3);
      g.fillEllipse(lx, ly, 8, 5);
    }
  }

  _drawRaven(g, x, y) {
    // Simple raven silhouette
    g.fillStyle(0x1a1a1a, 1);
    g.fillEllipse(x, y, 18, 12);         // body
    g.fillEllipse(x + 6, y - 4, 12, 9); // head
    g.fillTriangle(x + 10, y - 4, x + 18, y - 2, x + 9, y);  // beak
    // Eyes
    g.fillStyle(0xd4a03a, 1);
    g.fillCircle(x + 8, y - 5, 2);
  }

  _drawSign(g, x, y, text, color) {
    const sw = 180, sh = 32;
    g.fillStyle(0x8b5e3c, 1);
    g.fillRoundedRect(x, y, sw, sh, 4);
    g.lineStyle(2, 0x5a3820, 1);
    g.strokeRoundedRect(x, y, sw, sh, 4);
    // Sign post
    g.fillStyle(0x6b4520, 1);
    g.fillRect(x + sw / 2 - 3, y + sh, 6, 30);
  }

  _drawBrowserFrame(W, H) {
    // Simulate a late-2000s Flash player chrome
    const frame = this.add.graphics().setDepth(50);

    // Top bar — browser chrome
    frame.fillStyle(0x3a3530, 1);
    frame.fillRect(0, 0, W, 28);

    // URL bar area
    frame.fillStyle(0x2a2520, 1);
    frame.fillRoundedRect(120, 4, W - 250, 20, 3);

    // Traffic lights (decorative)
    [0xd0442a, 0xe0a020, 0x40a030].forEach((c, i) => {
      frame.fillStyle(c, 1);
      frame.fillCircle(16 + i * 20, 14, 6);
    });

    // URL text
    this.add.text(128, 14, 'pilgrim.veldenmoor.net/play', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#7a7060'
    }).setOrigin(0, 0.5).setDepth(51);

    // Flash player badge (bottom right)
    this.add.text(W - 10, H - 8, '▶ FLASH PLAYER 10.1', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#3a3530'
    }).setOrigin(1, 1).setDepth(51);

    // Thin bottom bar
    frame.fillStyle(0x3a3530, 1);
    frame.fillRect(0, H - 20, W, 20);
  }

  _spawnPlayer(W, H) {
    // Player is a small glowing cursor-like presence
    const px = W * 0.5;
    const py = H * 0.58;

    this._player = {
      x: px, y: py,
      speed: 120,
      sprite: this.add.graphics().setDepth(30)
    };
    this._drawPlayer();
  }

  _drawPlayer() {
    const p = this._player;
    p.sprite.clear();
    // Presence: small warm circle with a pulse
    p.sprite.fillStyle(0xffd166, 0.9);
    p.sprite.fillCircle(p.x, p.y, 8);
    p.sprite.lineStyle(2, 0xf0a030, 0.6);
    p.sprite.strokeCircle(p.x, p.y, 12);
  }

  _fadeIn(W, H) {
    const overlay = this.add.graphics().setDepth(1000);
    overlay.fillStyle(0xf5f0e8, 1);
    overlay.fillRect(0, 0, W, H);
    this.tweens.addCounter({
      from: 1, to: 0, duration: 700, ease: 'Sine.easeOut',
      onUpdate: (tween) => {
        overlay.clear();
        overlay.fillStyle(0xf5f0e8, tween.getValue());
        overlay.fillRect(0, 0, W, H);
      },
      onComplete: () => overlay.clear()
    });
  }

  _returnToLayer0() {
    this.input.enabled = false;
    TransitionEngine.transition(this, 1, 0,
      () => this.scene.start('Layer0Scene'),
      null
    );
  }

  _descendToLayer2() {
    this.input.enabled = false;
    TransitionEngine.transition(this, 1, 2,
      () => this.scene.start('Layer2Scene'),
      null
    );
  }

  update(time, delta) {
    if (!this.input.enabled) return;
    StateManager.tickPlayTime(delta);

    const dt = delta / 1000;
    const spd = this._player.speed;
    let moved = false;

    if (this._cursors.left.isDown || this._wasd.A.isDown) {
      this._player.x -= spd * dt; moved = true;
    }
    if (this._cursors.right.isDown || this._wasd.D.isDown) {
      this._player.x += spd * dt; moved = true;
    }
    if (this._cursors.up.isDown || this._wasd.W.isDown) {
      this._player.y -= spd * dt; moved = true;
    }
    if (this._cursors.down.isDown || this._wasd.S.isDown) {
      this._player.y += spd * dt; moved = true;
    }

    if (moved) {
      this._player.x = Phaser.Math.Clamp(this._player.x, 20, this.scale.width - 20);
      this._player.y = Phaser.Math.Clamp(this._player.y, 50, this.scale.height - 30);
      this._drawPlayer();
    }

    // Oswin interaction proximity
    if (this._oswin) this._oswin.update(time, delta, this._player.x, this._player.y);
  }

  shutdown() {
    EventBus.clear('layer:request');
    StateManager.save();
  }
}
