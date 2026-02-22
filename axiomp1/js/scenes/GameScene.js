// ============================================================
//  AXIOM BREAK — GameScene.js
//  Core game loop: rendering, input, collision, waves
// ============================================================

// ── Wall / tilemap helper ─────────────────────────────────────
class WallSystem {
  constructor(scene, layout) {
    this.tileSize = 64;
    this.layout   = layout; // 2D array: 1=wall, 0=floor
    this._gfx     = scene.add.graphics();
    this._drawMap();
  }

  _drawMap() {
    const g  = this._gfx;
    const ts = this.tileSize;
    g.clear();
    for (let row = 0; row < this.layout.length; row++) {
      for (let col = 0; col < this.layout[row].length; col++) {
        const isWall = this.layout[row][col] === 1;
        const x = col * ts, y = row * ts;
        if (isWall) {
          g.fillStyle(AXIOM.COLORS.WALL, 1);
          g.fillRect(x, y, ts, ts);
          g.lineStyle(1, AXIOM.COLORS.WALL_EDGE, 0.4);
          g.strokeRect(x, y, ts, ts);
          // Hazard stripe top edge
          g.fillStyle(AXIOM.COLORS.WALL_EDGE, 0.12);
          g.fillRect(x, y, ts, 4);
        } else {
          g.fillStyle(AXIOM.COLORS.FLOOR, 1);
          g.fillRect(x, y, ts, ts);
          g.lineStyle(1, 0x0d2035, 0.35);
          g.strokeRect(x, y, ts, ts);
          // Grid dots
          g.fillStyle(0x00aabb, 0.08);
          g.fillCircle(x + ts / 2, y + ts / 2, 2);
        }
      }
    }
  }

  hitsWall(x, y, radius = 8) {
    const ts = this.tileSize;
    const pts = [
      [x - radius, y - radius],[x + radius, y - radius],
      [x - radius, y + radius],[x + radius, y + radius],
    ];
    for (const [px, py] of pts) {
      const col = Math.floor(px / ts);
      const row = Math.floor(py / ts);
      if (row < 0 || row >= this.layout.length || col < 0 || col >= this.layout[0].length) return true;
      if (this.layout[row][col] === 1) return true;
    }
    return false;
  }
}


// ── Particle system ──────────────────────────────────────────
class ParticleSystem {
  constructor(scene) {
    this.scene     = scene;
    this.particles = [];
  }

  spawn(x, y, color, count = 5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Utils.randFloat(40, 140);
      const life  = Utils.randFloat(300, 700);
      const size  = Utils.randFloat(1.5, 4);
      this.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, maxLife: life, size, color });
    }
  }

  update(delta) {
    const dt = delta / 1000;
    this.particles = this.particles.filter(p => {
      p.x    += p.vx * dt;
      p.y    += p.vy * dt;
      p.vx   *= 0.92;
      p.vy   *= 0.92;
      p.life -= delta;
      return p.life > 0;
    });
  }

  draw(gfx) {
    gfx.clear();
    for (const p of this.particles) {
      const alpha = Utils.clamp(p.life / p.maxLife, 0, 1);
      gfx.fillStyle(p.color, alpha);
      gfx.fillCircle(p.x, p.y, p.size * alpha);
    }
  }
}


// ── Map layouts ───────────────────────────────────────────────
const MAP_LAYOUTS = {
  level1: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,1,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,1,0,1,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,0,1,0,0,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  level2: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,0,1,0,0,0,0,0,1,0,1,1],
    [1,0,0,0,0,1,0,1,0,0,0,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,0,0,0,0,1,0,1,0,0,0,0,1],
    [1,1,0,1,0,0,0,0,0,1,0,1,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  level3: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,0,1,0,0,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,0,0,0,0,1,0,1,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,1,0,0,1],
    [1,0,0,0,0,1,0,1,0,0,0,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,0,0,1,0,0,1,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
};


// ── GameScene ────────────────────────────────────────────────

class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'Game' }); }

  init(data) {
    this.levelIndex = data.levelIndex || 0;
    this.score      = data.score      || 0;
  }

  create() {
    const levelData = AXIOM.LEVELS[this.levelIndex];
    HUD.show();
    HUD.setLevel(levelData.name);
    HUD.setScore(this.score);

    // ── Map
    const layout = MAP_LAYOUTS[levelData.map];
    this.walls   = new WallSystem(this, layout);
    this._mapLayout = layout;

    // ── Portal (exit)
    this._portal      = null;
    this._portalGfx   = this.add.graphics();
    this._portalActive= false;
    this._portalX     = 0;
    this._portalY     = 0;

    // ── Player
    const playerStart = this._findOpenTile(layout, 1, 1);
    this.player = new Player(this, playerStart.x, playerStart.y);

    // ── Splice system
    this.splice = new SpliceSystem(this);

    // ── Bullets
    this.playerBullets = [];
    this.enemyBullets  = [];

    // ── Enemies
    this.enemies     = [];
    this._waveQueue  = [...levelData.enemyWaves];
    this._waveTimer  = 0;
    this._allWavesDone = false;
    this._enemiesLeft  = 0;
    this._countEnemies();

    // ── Boss
    this._hasBoss = levelData.hasBoss;
    this._bossSpawned = false;

    // ── Particles
    this.particles    = new ParticleSystem(this);
    this._particleGfx = this.add.graphics();

    // ── Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors.a     = this.input.keyboard.addKey('A');
    this.cursors.s     = this.input.keyboard.addKey('S');
    this.cursors.d     = this.input.keyboard.addKey('D');
    this.cursors.w     = this.input.keyboard.addKey('W');
    this.cursors.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this._eKey = this.input.keyboard.addKey('E');
    this._rKey = this.input.keyboard.addKey('R');

    // ── Camera
    this.cameras.main.setBackgroundColor('#000000');

    // Show intro transmission then start waves
    this._gameStarted = false;
    HUD.showTransmission(levelData.transmission_before, () => {
      this._gameStarted = true;
    });
  }

  _countEnemies() {
    let total = 0;
    for (const w of this._waveQueue) total += w.count;
    if (this._hasBoss) total += 1;
    this._enemiesLeft = total;
  }

  _findOpenTile(layout, preferRow = 1, preferCol = 1) {
    const ts = 64;
    for (let row = preferRow; row < layout.length - 1; row++) {
      for (let col = preferCol; col < layout[0].length - 1; col++) {
        if (layout[row][col] === 0) {
          return { x: col * ts + ts / 2, y: row * ts + ts / 2 };
        }
      }
    }
    return { x: 96, y: 96 };
  }

  _findOpenTileFar(layout, fromX, fromY) {
    const ts  = 64;
    let best  = null, bestDist = 0;
    for (let row = 1; row < layout.length - 1; row++) {
      for (let col = 1; col < layout[0].length - 1; col++) {
        if (layout[row][col] === 0) {
          const wx = col * ts + ts / 2, wy = row * ts + ts / 2;
          const d  = Utils.dist(fromX, fromY, wx, wy);
          if (d > bestDist) { bestDist = d; best = { x: wx, y: wy }; }
        }
      }
    }
    return best || { x: 400, y: 300 };
  }

  spawnParticles(x, y, color, count) {
    this.particles.spawn(x, y, color, count);
  }

  onEnemyDead(enemy) {
    this.score += enemy.cfg.SCORE;
    HUD.setScore(this.score);
    this.spawnParticles(enemy.x, enemy.y, AXIOM.COLORS['ENEMY_' + enemy.type], 10);
    this._enemiesLeft--;

    if (this._enemiesLeft <= 0 && this._allWavesDone) {
      this._spawnPortal();
    }
  }

  _spawnWave(waveDef) {
    const ts = 64;
    for (let i = 0; i < waveDef.count; i++) {
      // Find random open tile away from player
      let attempts = 0, ex, ey;
      do {
        const row = Utils.randInt(1, this._mapLayout.length - 2);
        const col = Utils.randInt(1, this._mapLayout[0].length - 2);
        if (this._mapLayout[row][col] === 0) {
          ex = col * ts + ts / 2;
          ey = row * ts + ts / 2;
        }
        attempts++;
      } while (attempts < 30 && (!ex || Utils.dist(ex, ey, this.player.x, this.player.y) < 200));

      if (!ex) { ex = 100; ey = 100; }
      const type = waveDef.type;
      const e = new Enemy(this, ex, ey, type);
      this.enemies.push(e);
      this.spawnParticles(ex, ey, AXIOM.COLORS['ENEMY_' + type], 6);
    }
  }

  _spawnPortal() {
    const pos = this._findOpenTileFar(this._mapLayout, this.player.x, this.player.y);
    this._portalX = pos.x;
    this._portalY = pos.y;
    this._portalActive = true;

    const g = this._portalGfx;
    g.clear();
    g.lineStyle(3, AXIOM.COLORS.PORTAL, 1);
    g.strokeCircle(pos.x, pos.y, 22);
    g.lineStyle(1, AXIOM.COLORS.PORTAL, 0.5);
    g.strokeCircle(pos.x, pos.y, 15);
    g.fillStyle(AXIOM.COLORS.PORTAL, 0.25);
    g.fillCircle(pos.x, pos.y, 13);

    this.tweens.add({
      targets: g,
      alpha: { from: 0.4, to: 1 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.spawnParticles(pos.x, pos.y, AXIOM.COLORS.PORTAL, 16);
  }

  _checkPortal() {
    if (!this._portalActive) return;
    const d = Utils.dist(this.player.x, this.player.y, this._portalX, this._portalY);
    if (d < 28) {
      this._portalActive = false;
      this.splice.destroy();
      this.player.destroy();
      const levelData = AXIOM.LEVELS[this.levelIndex];

      HUD.showTransmission(levelData.transmission_after, () => {
        const next = this.levelIndex + 1;
        if (next < AXIOM.LEVELS.length) {
          this.scene.restart({ levelIndex: next, score: this.score });
        } else {
          this._showCredits();
        }
      });
    }
  }

  _showCredits() {
    const W = AXIOM.WIDTH, H = AXIOM.HEIGHT;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.9);
    g.fillRect(0, 0, W, H);

    this.add.text(W/2, H/2 - 60, 'PHASE 1 COMPLETE', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '28px',
      color: '#00f5ff',
      shadow: { blur: 20, color: '#00f5ff', fill: true },
    }).setOrigin(0.5);

    this.add.text(W/2, H/2, `FINAL SCORE: ${Utils.formatScore(this.score)}`, {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(W/2, H/2 + 60, '[PRESS SPACE]', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '12px',
      color: '#00f5ff',
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('Menu');
    });
  }

  update(time, delta) {
    if (!this._gameStarted) return;
    if (this.player.dead) {
      this._handleDeath();
      return;
    }

    // ── Wave spawning
    if (!this._allWavesDone) {
      this._waveTimer += delta;
      while (this._waveQueue.length > 0 && this._waveTimer >= this._waveQueue[0].delay) {
        const w = this._waveQueue.shift();
        this._spawnWave(w);
        if (this._waveQueue.length === 0) {
          this._allWavesDone = true;
          // Spawn boss?
          if (this._hasBoss && !this._bossSpawned) {
            this._bossSpawned = true;
            const bpos = this._findOpenTileFar(this._mapLayout, this.player.x, this.player.y);
            const boss = new Enemy(this, bpos.x, bpos.y, 'BOSS');
            this.enemies.push(boss);
            this.cameras.main.flash(200, 255, 0, 60, true);
          }
        }
      }
    }

    // ── Player
    this.player.update(delta, this.cursors, this.input.activePointer, this.splice);

    // ── Splice
    this.splice.update(delta, this._eKey, this._rKey,
      this.player.x, this.player.y, this.enemies.filter(e => !e.dead));

    // ── Enemies
    for (const e of this.enemies) {
      if (!e.dead) {
        e.update(delta, this.player.x, this.player.y);
      }
    }
    this.enemies = this.enemies.filter(e => !e.dead);

    // ── Bullets
    for (const b of this.playerBullets) b.update(delta);
    for (const b of this.enemyBullets)  b.update(delta);
    this.playerBullets = this.playerBullets.filter(b => !b.dead);
    this.enemyBullets  = this.enemyBullets.filter(b => !b.dead);

    // ── Collisions: player bullets → enemies
    for (const b of this.playerBullets) {
      for (const e of this.enemies) {
        if (e.dead) continue;
        if (Utils.dist(b.x, b.y, e.x, e.y) < e.cfg.SIZE + 6) {
          e.damage(12);
          b.kill();
        }
      }
    }

    // ── Collisions: enemy bullets → player
    for (const b of this.enemyBullets) {
      if (Utils.dist(b.x, b.y, this.player.x, this.player.y) < AXIOM.PLAYER.SIZE + 4) {
        this.player.damage(10);
        b.kill();
      }
    }

    // ── Enemy melee vs player
    for (const e of this.enemies) {
      if (e.dead) continue;
      if (Utils.dist(e.x, e.y, this.player.x, this.player.y) < e.cfg.SIZE + AXIOM.PLAYER.SIZE) {
        this.player.damage(e.cfg.DAMAGE * (delta / 1000));
      }
    }

    // ── Particles
    this.particles.update(delta);
    this.particles.draw(this._particleGfx);

    // ── Portal check
    this._checkPortal();
    this._animatePortal();
  }

  _animatePortal() {
    if (!this._portalActive) return;
    // Handled by tween
  }

  _handleDeath() {
    if (this._dying) return;
    this._dying = true;
    this.cameras.main.flash(300, 255, 20, 20, true);
    this.cameras.main.shake(400, 0.015);

    const W = AXIOM.WIDTH, H = AXIOM.HEIGHT;
    this.time.delayedCall(600, () => {
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.8);
      g.fillRect(0, 0, W, H);

      this.add.text(W/2, H/2 - 40, 'SIGNAL LOST', {
        fontFamily: 'Orbitron, monospace',
        fontSize: '36px',
        color: '#ff2244',
        shadow: { blur: 20, color: '#ff2244', fill: true },
      }).setOrigin(0.5);

      this.add.text(W/2, H/2 + 10, `SCORE: ${Utils.formatScore(this.score)}`, {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '14px',
        color: '#ffffff',
      }).setOrigin(0.5);

      this.add.text(W/2, H/2 + 55, '[SPACE] RESTART  |  [M] MENU', {
        fontFamily: 'Orbitron, monospace',
        fontSize: '11px',
        color: '#00f5ff',
      }).setOrigin(0.5);

      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.restart({ levelIndex: this.levelIndex, score: 0 });
      });
      this.input.keyboard.once('keydown-M', () => {
        this.scene.start('Menu');
      });
    });
  }
}
