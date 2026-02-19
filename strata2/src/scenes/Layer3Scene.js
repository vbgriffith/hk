/**
 * STRATA — Layer3Scene
 * The Meridian — Halverstrom.
 * A vast, eerily calm city rendered in clean architectural white lines.
 * No color. The city is perfect. The city is empty.
 * Except for The Cartographer, who walks the same route every day.
 * 2D top-down with 2.5D building silhouettes — isometric-lite projection.
 */
class Layer3Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Layer3Scene' });
    this._camera = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this._player = null;
    this._cartographer = null;
    this._city = null;
    this._dayTimer = 0;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    StateManager.enterLayer(3);
    TransitionEngine.init(this);

    // Pure darkness base
    const bg = this.add.graphics();
    bg.fillStyle(0x04060a, 1);
    bg.fillRect(0, 0, W, H);

    // Generate Halverstrom
    this._city = this._generateCity(W, H);
    this._drawCity(W, H);

    // Player — small moving point of light
    this._player = { x: W / 2, y: H / 2, speed: 100 };
    this._playerSprite = this.add.graphics().setDepth(40);
    this._drawPlayerLight();

    // Cartographer entity
    this._cartographer = new CartographerEntity(this, W, H, this._city);

    // HUD
    this._hud = HUD;
    HUD.show(this, 3);

    // Subtle ambient — tiny particles suggesting depth
    this._particles = [];
    this._spawnAmbientParticles(W, H);

    // Controls
    this._cursors = this.input.keyboard.createCursorKeys();
    this._wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.input.keyboard.on('keydown-ESC', () => this._return());

    // Day counter display
    this._dayText = this.add.text(W - 20, 40, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#1e2a3a'
    }).setOrigin(1, 0).setDepth(100);

    this._fadeIn(W, H);

    // First visit: Maren's note
    if (StateManager.get('layerVisits')[3] === 1) {
      this.time.delayedCall(2000, () => {
        StateManager.addMarenNote(
          `below the workshop. this isn't a development environment. ` +
          `this is a city. it's rendered entirely in white lines. ` +
          `there are 847 streets. I counted the intersections. ` +
          `something is walking one of them.`
        );
      });
    }

    StateManager.save();
  }

  _generateCity(W, H) {
    // Procedural city grid for Halverstrom
    // 2D top-down street network
    const city = {
      streets: [],
      blocks: [],
      buildings: [],
      plazas: [],
      centerX: W / 2,
      centerY: H / 2
    };

    const BLOCK_W = 80;
    const BLOCK_H = 60;
    const COLS = 12;
    const ROWS = 9;
    const startX = W / 2 - (COLS * BLOCK_W) / 2;
    const startY = H / 2 - (ROWS * BLOCK_H) / 2;

    // Streets (horizontal)
    for (let row = 0; row <= ROWS; row++) {
      const sy = startY + row * BLOCK_H;
      const weight = row === 0 || row === ROWS ? 1 : (row % 3 === 0 ? 1.5 : 0.8);
      city.streets.push({ x1: startX - 20, y1: sy, x2: startX + COLS * BLOCK_W + 20, y2: sy, w: weight });
    }

    // Streets (vertical)
    for (let col = 0; col <= COLS; col++) {
      const sx = startX + col * BLOCK_W;
      const weight = col === 0 || col === COLS ? 1 : (col % 4 === 0 ? 1.5 : 0.8);
      city.streets.push({ x1: sx, y1: startY - 20, x2: sx, y2: startY + ROWS * BLOCK_H + 20, w: weight });
    }

    // Buildings in blocks — some tall, some short (2.5D silhouettes)
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const bx = startX + col * BLOCK_W + 6;
        const by = startY + row * BLOCK_H + 6;
        const bw = BLOCK_W - 12;
        const bh = BLOCK_H - 12;

        // Some blocks are plazas
        const isPlaza = (col === 5 && row === 4) || (col === 2 && row === 2) || (col === 9 && row === 6);
        if (isPlaza) {
          city.plazas.push({ x: bx, y: by, w: bw, h: bh });
          continue;
        }

        // Sub-divide block into buildings
        const subCols = 1 + Math.floor((col * 7 + row * 3) % 3);
        const subRows = 1 + Math.floor((col * 3 + row * 11) % 2);
        for (let sc = 0; sc < subCols; sc++) {
          for (let sr = 0; sr < subRows; sr++) {
            const sw = bw / subCols;
            const sh = bh / subRows;
            const buildH = 8 + ((col * 13 + row * 7 + sc * 3) % 20); // height variation
            city.buildings.push({
              x: bx + sc * sw + 1,
              y: by + sr * sh + 1,
              w: sw - 2,
              h: sh - 2,
              height: buildH // visual height for 2.5D silhouette
            });
          }
        }
      }
    }

    // Central plaza — where The Cartographer begins
    city.centralPlaza = { x: W / 2, y: H / 2 };

    return city;
  }

  _drawCity(W, H) {
    const g = this.add.graphics().setDepth(5);

    // Streets
    this._city.streets.forEach(s => {
      g.lineStyle(s.w, 0x1a2535, 1);
      g.lineBetween(s.x1, s.y1, s.x2, s.y2);
    });

    // Buildings — 2.5D: footprint + top face offset + side shadow
    this._city.buildings.forEach(b => {
      const elev = b.height * 0.4; // elevation offset for 2.5D

      // Side face (shadow)
      g.fillStyle(0x0a1018, 1);
      g.fillPoints([
        { x: b.x + b.w, y: b.y },
        { x: b.x + b.w + elev * 0.5, y: b.y - elev },
        { x: b.x + b.w + elev * 0.5, y: b.y - elev + b.h },
        { x: b.x + b.w, y: b.y + b.h }
      ], true);

      // Front face
      g.fillStyle(0x0d1520, 1);
      g.fillRect(b.x, b.y, b.w, b.h);

      // Top face (lighter)
      g.fillStyle(0x1e2d40, 1);
      g.fillPoints([
        { x: b.x, y: b.y },
        { x: b.x + elev * 0.5, y: b.y - elev },
        { x: b.x + b.w + elev * 0.5, y: b.y - elev },
        { x: b.x + b.w, y: b.y }
      ], true);

      // Outline — thin white lines
      g.lineStyle(0.5, 0x2a3f55, 0.8);
      g.strokeRect(b.x, b.y, b.w, b.h);
      // Top outline
      g.lineStyle(0.5, 0x3a5070, 0.6);
      g.beginPath();
      g.moveTo(b.x, b.y);
      g.lineTo(b.x + elev * 0.5, b.y - elev);
      g.lineTo(b.x + b.w + elev * 0.5, b.y - elev);
      g.lineTo(b.x + b.w, b.y);
      g.strokePath();
      // Vertical edge
      g.lineStyle(0.5, 0x2a3f55, 0.6);
      g.lineBetween(b.x + b.w, b.y, b.x + b.w + elev * 0.5, b.y - elev);

      // Occasional lit window
      if ((b.x * 7 + b.y * 3) % 5 === 0) {
        g.fillStyle(0x1e3a5a, 0.8);
        g.fillRect(b.x + b.w * 0.25, b.y + b.h * 0.2, b.w * 0.2, b.h * 0.15);
        g.fillRect(b.x + b.w * 0.55, b.y + b.h * 0.2, b.w * 0.2, b.h * 0.15);
      }
    });

    // Plazas — open squares with subtle pattern
    this._city.plazas.forEach(p => {
      g.lineStyle(0.5, 0x1a2a3a, 0.8);
      g.strokeRect(p.x, p.y, p.w, p.h);
      // Cross pattern
      g.lineBetween(p.x + p.w / 2, p.y, p.x + p.w / 2, p.y + p.h);
      g.lineBetween(p.x, p.y + p.h / 2, p.x + p.w, p.y + p.h / 2);
    });

    // City boundary — thin outer line
    const s = this._city.streets;
    g.lineStyle(1, 0x2a3a4a, 0.5);
    g.strokeRect(
      this._city.centerX - 12 * 40,
      this._city.centerY - 9 * 30,
      12 * 80, 9 * 60
    );
  }

  _drawPlayerLight() {
    const p = this._player;
    this._playerSprite.clear();
    // Soft point of light
    this._playerSprite.fillStyle(0x4a7fa8, 0.15);
    this._playerSprite.fillCircle(p.x, p.y, 20);
    this._playerSprite.fillStyle(0x7ab4d8, 0.4);
    this._playerSprite.fillCircle(p.x, p.y, 8);
    this._playerSprite.fillStyle(0xacd8f0, 0.9);
    this._playerSprite.fillCircle(p.x, p.y, 3);
  }

  _spawnAmbientParticles(W, H) {
    for (let i = 0; i < 30; i++) {
      this._particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        alpha: Math.random() * 0.4,
        speed: 0.2 + Math.random() * 0.3,
        size: 0.5 + Math.random()
      });
    }
    this._particleGraphics = this.add.graphics().setDepth(3);
  }

  _updateParticles(W, H) {
    this._particleGraphics.clear();
    this._particles.forEach(p => {
      p.y -= p.speed;
      if (p.y < 0) { p.y = H; p.x = Math.random() * W; }
      this._particleGraphics.fillStyle(0x2a4060, p.alpha);
      this._particleGraphics.fillCircle(p.x, p.y, p.size);
    });
  }

  _fadeIn(W, H) {
    const overlay = this.add.graphics().setDepth(1000);
    overlay.fillStyle(0x04060a, 1);
    overlay.fillRect(0, 0, W, H);
    this.tweens.addCounter({
      from: 1, to: 0, duration: 1200, ease: 'Sine.easeOut',
      onUpdate: (tween) => {
        overlay.clear();
        overlay.fillStyle(0x04060a, tween.getValue());
        overlay.fillRect(0, 0, W, H);
      },
      onComplete: () => overlay.clear()
    });
  }

  _return() {
    this.input.keyboard.enabled = false;
    TransitionEngine.transition(this, 3, 2,
      () => this.scene.start('Layer2Scene'), null
    );
  }

  update(time, delta) {
    if (!this.input.enabled) return;
    StateManager.tickPlayTime(delta);

    const dt = delta / 1000;
    const spd = this._player.speed;

    if (this._cursors.left.isDown || this._wasd.A.isDown)  this._player.x -= spd * dt;
    if (this._cursors.right.isDown || this._wasd.D.isDown) this._player.x += spd * dt;
    if (this._cursors.up.isDown || this._wasd.W.isDown)    this._player.y -= spd * dt;
    if (this._cursors.down.isDown || this._wasd.S.isDown)  this._player.y += spd * dt;

    this._player.x = Phaser.Math.Clamp(this._player.x, 10, this.scale.width - 10);
    this._player.y = Phaser.Math.Clamp(this._player.y, 10, this.scale.height - 10);
    this._drawPlayerLight();

    // Cartographer
    this._dayTimer += delta;
    const dayDuration = 60000; // 1 minute = 1 in-game day
    if (this._dayTimer >= dayDuration) {
      this._dayTimer = 0;
      StateManager.increment('cartographerDays');
    }
    const days = StateManager.get('cartographerDays');
    this._dayText.setText(`day ${days}`).setColor(days >= 38 ? '#3a5a7a' : '#1e2a3a');

    HUD.update(3);

    if (this._cartographer) {
      this._cartographer.update(time, delta, this._player.x, this._player.y);
    }

    this._updateParticles(this.scale.width, this.scale.height);
  }

  shutdown() {
    StateManager.save();
  }
}
