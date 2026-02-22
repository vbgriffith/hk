// ============================================================
//  AXIOM BREAK — GameScene.js  [PHASE 2 — FULL REPLACEMENT]
//  Extends Phase 1 with:
//   - Audio integration (AudioSynth)
//   - PowerupManager drop & pickup
//   - WraithBoss (useWraithBoss flag)
//   - UIScene minimap + boss bar hookup
//   - Sniper enemy type support
//   - 2 new sector maps (level4, level5)
//   - Wave counter display
// ============================================================

// ── Wall / tilemap helper (unchanged from Phase 1) ───────────
class WallSystem {
  constructor(scene, layout) {
    this.tileSize = 64;
    this.layout   = layout;
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
          g.fillStyle(AXIOM.COLORS.WALL_EDGE, 0.12);
          g.fillRect(x, y, ts, 4);
        } else {
          g.fillStyle(AXIOM.COLORS.FLOOR, 1);
          g.fillRect(x, y, ts, ts);
          g.lineStyle(1, 0x0d2035, 0.35);
          g.strokeRect(x, y, ts, ts);
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


// ── Particle system (unchanged) ──────────────────────────────
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
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life, maxLife: life, size, color,
      });
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


// ── Map layouts (Phase 1 + Phase 2 additions) ────────────────
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
  // ── Phase 2 maps ─────────────────────────────────────────
  // Level 4: long sight lines for snipers, scattered cover
  level4: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,0,1,1,0,0,0,1,1,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,1,1,0,0,0,1,1,0,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
  ],
  // Level 5: ring structure — WRAITH's final lair
  level5: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,0,0,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,0,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,1,0,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,0,0,0,1,1,1,0,1],
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
    HUD.showBossBar(false);

    // ── Map
    const layout    = MAP_LAYOUTS[levelData.map];
    this.walls      = new WallSystem(this, layout);
    this._mapLayout = layout;

    // ── Portal
    this._portalGfx    = this.add.graphics();
    this._portalActive = false;
    this._portalX      = 0;
    this._portalY      = 0;

    // ── Player
    const playerStart = this._findOpenTile(layout, 1, 1);
    this.player = new Player(this, playerStart.x, playerStart.y);

    // ── Splice
    this.splice = new SpliceSystem(this);

    // ── Bullets
    this.playerBullets = [];
    this.enemyBullets  = [];

    // ── Enemies
    this.enemies       = [];
    this._waveQueue    = [...levelData.enemyWaves];
    this._waveTimer    = 0;
    this._waveIndex    = 0;
    this._allWavesDone = false;
    this._enemiesLeft  = 0;
    this._countEnemies();

    // ── Boss
    this._hasBoss       = levelData.hasBoss;
    this._useWraithBoss = levelData.useWraithBoss || false;
    this._bossSpawned   = false;

    // ── Powerups [PHASE 2]
    this.powerups = new PowerupManager(this, this.player);

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

    // ── UIScene integration [PHASE 2]
    const uiScene = this.scene.get('UI');
    if (uiScene) {
      uiScene.buildMinimap(layout);
      uiScene.setWaveInfo(0, this._waveQueue.length);
    }

    // ── Audio [PHASE 2]
    // Init after first user interaction — already handled by menu click
    AudioSynth.init();
    AudioSynth.playMusic(levelData.music || 'ambient');

    // ── Transmission, then start
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
    AudioSynth.play('explode');
    this._enemiesLeft--;

    // [PHASE 2] Powerup drop
    this.powerups.tryDrop(enemy);

    if (this._enemiesLeft <= 0 && this._allWavesDone) {
      this._spawnPortal();
    }
  }

  _spawnWave(waveDef) {
    const ts = 64;
    for (let i = 0; i < waveDef.count; i++) {
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
      duration: 700, yoyo: true, repeat: -1,
    });

    this.spawnParticles(pos.x, pos.y, AXIOM.COLORS.PORTAL, 16);
    AudioSynth.play('portal_open');
  }

  _checkPortal() {
    if (!this._portalActive) return;
    const d = Utils.dist(this.player.x, this.player.y, this._portalX, this._portalY);
    if (d < 28) {
      this._portalActive = false;
      AudioSynth.stopMusic();
      this.splice.destroy();
      this.powerups.destroy();
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

    this.add.text(W/2, H/2 - 80, 'PHASE 2 COMPLETE', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '28px', color: '#00f5ff',
      shadow: { blur: 20, color: '#00f5ff', fill: true },
    }).setOrigin(0.5);

    this.add.text(W/2, H/2 - 30, 'SIGNAL RECEIVED', {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '12px', color: '#39ff14', letterSpacing: 4,
    }).setOrigin(0.5);

    this.add.text(W/2, H/2 + 10, `FINAL SCORE: ${Utils.formatScore(this.score)}`, {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(W/2, H/2 + 60, '[PRESS SPACE]', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '12px', color: '#00f5ff',
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
        this._waveIndex++;
        this._spawnWave(w);

        // Update UI wave counter
        const uiScene = this.scene.get('UI');
        if (uiScene) uiScene.setWaveInfo(this._waveIndex, this._waveIndex + this._waveQueue.length);

        if (this._waveQueue.length === 0) {
          this._allWavesDone = true;
          if (this._hasBoss && !this._bossSpawned) {
            this._bossSpawned = true;
            const bpos = this._findOpenTileFar(this._mapLayout, this.player.x, this.player.y);

            if (this._useWraithBoss) {
              const boss = new WraithBoss(this, bpos.x, bpos.y);
              this.enemies.push(boss);
            } else {
              const boss = new Enemy(this, bpos.x, bpos.y, 'BOSS');
              this.enemies.push(boss);
              this.cameras.main.flash(200, 255, 0, 60, true);
            }
          }
        }
      }
    }

    // ── Player
    this.player.update(delta, this.cursors, this.input.activePointer, this.splice);

    // ── Splice
    this.splice.update(delta, this._eKey, this._rKey,
      this.player.x, this.player.y, this.enemies.filter(e => !e.dead));

    // ── Powerups [PHASE 2]
    this.powerups.update(delta);

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

    // ── Collision: player bullets → enemies
    for (const b of this.playerBullets) {
      for (const e of this.enemies) {
        if (e.dead) continue;
        if (Utils.dist(b.x, b.y, e.x, e.y) < e.cfg.SIZE + 6) {
          e.damage(12);
          b.kill();
          AudioSynth.playThrottled('hit');
        }
      }
    }

    // ── Collision: enemy bullets → player
    for (const b of this.enemyBullets) {
      if (Utils.dist(b.x, b.y, this.player.x, this.player.y) < AXIOM.PLAYER.SIZE + 4) {
        // [PHASE 2] Shield interception
        const dmg = this.powerups.interceptDamage(10);
        if (dmg > 0) {
          this.player.damage(dmg);
          AudioSynth.playThrottled('player_hurt');
        }
        b.kill();
      }
    }

    // ── Melee contact
    for (const e of this.enemies) {
      if (e.dead) continue;
      if (Utils.dist(e.x, e.y, this.player.x, this.player.y) < e.cfg.SIZE + AXIOM.PLAYER.SIZE) {
        const raw = e.cfg.DAMAGE * (delta / 1000);
        const dmg = this.powerups.interceptDamage(raw);
        if (dmg > 0) {
          this.player.damage(dmg);
        }
      }
    }

    // ── Audio: shoot sound
    if (this.input.activePointer.isDown) {
      // Throttled by fire rate — emit on bullet spawn (handled via player)
      // We listen via a flag set in Player._spawnBullet
      if (this.player._justFired) {
        AudioSynth.playThrottled('shoot');
        this.player._justFired = false;
      }
      if (this.player.dashing && this.player._justDashed) {
        AudioSynth.play('dash');
        this.player._justDashed = false;
      }
    }

    // Dash sound
    if (this.player._justDashed) {
      AudioSynth.play('dash');
      this.player._justDashed = false;
    }

    // ── Particles
    this.particles.update(delta);
    this.particles.draw(this._particleGfx);

    // ── Portal
    this._checkPortal();

    // ── UIScene minimap update [PHASE 2]
    const uiScene = this.scene.get('UI');
    if (uiScene && uiScene.updateMinimap) {
      uiScene.updateMinimap(
        this.player.x, this.player.y,
        this.enemies,
        this._portalActive, this._portalX, this._portalY
      );
      uiScene.updatePowerups(this.player.activeEffects);
    }
  }

  _handleDeath() {
    if (this._dying) return;
    this._dying = true;
    AudioSynth.play('player_die');
    AudioSynth.stopMusic();
    this.cameras.main.flash(300, 255, 20, 20, true);
    this.cameras.main.shake(400, 0.015);

    const W = AXIOM.WIDTH, H = AXIOM.HEIGHT;
    this.time.delayedCall(600, () => {
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.8);
      g.fillRect(0, 0, W, H);

      this.add.text(W/2, H/2 - 40, 'SIGNAL LOST', {
        fontFamily: 'Orbitron, monospace',
        fontSize: '36px', color: '#ff2244',
        shadow: { blur: 20, color: '#ff2244', fill: true },
      }).setOrigin(0.5);

      this.add.text(W/2, H/2 + 10, `SCORE: ${Utils.formatScore(this.score)}`, {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '14px', color: '#ffffff',
      }).setOrigin(0.5);

      this.add.text(W/2, H/2 + 55, '[SPACE] RESTART  |  [Q] MENU', {
        fontFamily: 'Orbitron, monospace',
        fontSize: '11px', color: '#00f5ff',
      }).setOrigin(0.5);

      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.restart({ levelIndex: this.levelIndex, score: 0 });
      });
      this.input.keyboard.once('keydown-Q', () => {
        this.scene.start('Menu');
      });
    });
  }
}
