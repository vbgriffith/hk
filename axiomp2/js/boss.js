// ============================================================
//  AXIOM BREAK — boss.js  [PHASE 2]
//
//  WRAITH — multi-phase boss AI.
//
//  Phase 1 (100→65% HP)  — Orbit + spread shot
//  Phase 2 (65→30% HP)   — Teleport dash + burst fire
//  Phase 3 (30→0% HP)    — Rage: all patterns + summon drones
//
//  Replaces the generic Enemy 'BOSS' type in Sector 03.
//  GameScene checks levelData.useWraithBoss to spawn this.
// ============================================================

class WraithBoss {
  constructor(scene, x, y) {
    this.scene  = scene;
    this.type   = 'BOSS';   // satisfies enemy type checks
    this.cfg    = AXIOM.ENEMY.BOSS;
    this.dead   = false;

    // HP scaled from config but with phase structure
    this.maxHp  = AXIOM.ENEMY.BOSS.HP;
    this.hp     = this.maxHp;
    this.phase  = 1;

    // Position
    this._x     = x;
    this._y     = y;

    // Movement
    this._orbitAngle = 0;
    this._orbitRadius = 180;
    this._orbitSpeed  = 0.6;   // rad/sec
    this._targetX     = x;
    this._targetY     = y;
    this._centerX     = AXIOM.WIDTH  / 2;
    this._centerY     = AXIOM.HEIGHT / 2;

    // Attack timers
    this._fireTimer    = 0;
    this._teleTimer    = 0;
    this._summonTimer  = 0;
    this._patternTimer = 0;

    // Stun
    this._stunTimer    = 0;
    this._stunned      = false;

    // Phase transition flash flag
    this._phaseFlashed = { 2: false, 3: false };

    // Graphics
    this.gfx = scene.add.graphics();
    this.gfx.setDepth(4);
    this._draw(1);

    // Eye trail effect
    this._trailGfx = scene.add.graphics();
    this._trailGfx.setDepth(3);
    this._trail = [];

    // Tell UIScene to show boss bar
    if (scene.scene.get('UI') && scene.scene.get('UI').showBossBar) {
      scene.scene.get('UI').showBossBar('WRAITH', this.maxHp);
    }
    HUD.showBossBar(true, 'WRAITH');

    // Play boss music
    AudioSynth.playMusic('boss');
    AudioSynth.play('boss_alert');
  }

  get x() { return this._x; }
  set x(v) { this._x = v; this.gfx.x = v; }
  get y() { return this._y; }
  set y(v) { this._y = v; this.gfx.y = v; }

  _draw(alpha) {
    const g   = this.gfx;
    const s   = this.cfg.SIZE;
    const col = AXIOM.COLORS.ENEMY_BOSS;
    const pct = this.hp / this.maxHp;
    g.clear();

    // Phase-based color tinting
    let tint = col;
    if (this.phase === 2) tint = 0xff2288;
    if (this.phase === 3) tint = 0xff0000;

    // Outer pulsing ring
    const pulse = 0.3 + 0.4 * Math.sin(this.scene.time.now / 120);
    g.lineStyle(2, tint, alpha * pulse);
    g.strokeCircle(0, 0, s + 14);

    // Body — double octagon
    for (const [r, a] of [[s, alpha], [s * 0.6, alpha * 0.7]]) {
      g.lineStyle(2, tint, a);
      g.fillStyle(tint, a * 0.1);
      g.beginPath();
      for (let i = 0; i < 8; i++) {
        const ang = (Math.PI / 4) * i + (this.scene.time.now / 2000);
        const px  = Math.cos(ang) * r;
        const py  = Math.sin(ang) * r;
        i === 0 ? g.moveTo(px, py) : g.lineTo(px, py);
      }
      g.closePath();
      g.fillPath();
      g.strokePath();
    }

    // Core eye
    g.fillStyle(0xffffff, alpha);
    g.fillCircle(0, 0, 6);
    g.fillStyle(tint, alpha);
    g.fillCircle(0, 0, 3.5);

    // Cross scan lines
    g.lineStyle(1, tint, alpha * 0.5);
    g.strokeLineShape({ x1: -s, y1: 0, x2: s, y2: 0 });
    g.strokeLineShape({ x1: 0, y1: -s, x2: 0, y2: s });

    // HP bar
    const barW  = s * 2.8;
    const hpPct = pct;
    const barCol = hpPct > 0.5 ? tint : (hpPct > 0.25 ? 0xffaa00 : 0xff2200);
    g.fillStyle(0x111111, 0.7);
    g.fillRect(-barW/2, -s - 14, barW, 5);
    g.fillStyle(barCol, 1);
    g.fillRect(-barW/2, -s - 14, barW * hpPct, 5);

    this.gfx.x = this._x;
    this.gfx.y = this._y;
  }

  damage(amt) {
    if (this.dead) return;
    this.hp -= amt;
    this._draw(1);
    this.scene.spawnParticles(this._x, this._y, AXIOM.COLORS.ENEMY_BOSS, 4);

    // Update boss HP bar in HUD
    HUD.updateBossBar(this.hp, this.maxHp);

    // Phase transitions
    const pct = this.hp / this.maxHp;
    if (pct <= 0.65 && this.phase < 2) this._enterPhase(2);
    if (pct <= 0.30 && this.phase < 3) this._enterPhase(3);

    if (this.hp <= 0) {
      this.hp = 0;
      this._die();
    }
  }

  _enterPhase(num) {
    this.phase = num;
    this.scene.cameras.main.shake(300, 0.018);
    this.scene.cameras.main.flash(200, 255, 0, 80, true);
    this.scene.spawnParticles(this._x, this._y, 0xff0066, 20);
    AudioSynth.play('boss_alert');

    // Show phase message
    HUD.showPhaseAlert(`WRAITH — PHASE ${num}`);

    if (num === 2) {
      this._orbitSpeed  = 1.1;
      this._orbitRadius = 140;
    } else if (num === 3) {
      this._orbitSpeed  = 1.6;
      this._orbitRadius = 110;
      AudioSynth.playMusic('boss');
    }
  }

  _die() {
    this.dead = true;
    this.scene.cameras.main.shake(600, 0.025);
    this.scene.cameras.main.flash(400, 255, 60, 0, true);

    // Massive death particle explosion
    for (let i = 0; i < 5; i++) {
      this.scene.time.delayedCall(i * 120, () => {
        this.scene.spawnParticles(
          this._x + Utils.randFloat(-20, 20),
          this._y + Utils.randFloat(-20, 20),
          AXIOM.COLORS.ENEMY_BOSS, 16
        );
      });
    }

    HUD.showBossBar(false);
    this.gfx.destroy();
    this._trailGfx.destroy();
    AudioSynth.stopMusic();
    this.scene.time.delayedCall(400, () => {
      AudioSynth.playMusic('ambient');
    });

    this.scene.onEnemyDead(this);
  }

  update(delta, playerX, playerY) {
    if (this.dead) return;

    // Stun check
    if (this._stunned) {
      this._stunTimer -= delta;
      if (this._stunTimer <= 0) { this._stunned = false; }
      else {
        this._draw(0.4 + 0.3 * Math.sin(this.scene.time.now / 80));
        return;
      }
    }

    // ── Rotation animation
    this.gfx.rotation += (0.02 + this.phase * 0.008);

    // ── Trail
    this._trail.unshift({ x: this._x, y: this._y });
    if (this._trail.length > 12) this._trail.pop();
    this._drawTrail();

    // ── Phase movement
    switch (this.phase) {
      case 1: this._updatePhase1(delta, playerX, playerY); break;
      case 2: this._updatePhase2(delta, playerX, playerY); break;
      case 3: this._updatePhase3(delta, playerX, playerY); break;
    }

    this._draw(1);
  }

  _updatePhase1(delta, px, py) {
    // Orbit around arena center
    this._orbitAngle += this._orbitSpeed * (delta / 1000);
    const cx = this._centerX;
    const cy = this._centerY;
    this.x   = cx + Math.cos(this._orbitAngle) * this._orbitRadius;
    this.y   = cy + Math.sin(this._orbitAngle) * this._orbitRadius;

    // Spread shot every 1.8s
    this._fireTimer -= delta;
    if (this._fireTimer <= 0) {
      this._fireTimer = 1800;
      this._fireSpread(px, py, 3, 22);
    }
  }

  _updatePhase2(delta, px, py) {
    // Orbit + periodic teleport-dash toward player
    this._orbitAngle += this._orbitSpeed * (delta / 1000);
    const cx = this._centerX;
    const cy = this._centerY;
    this.x   = cx + Math.cos(this._orbitAngle) * this._orbitRadius;
    this.y   = cy + Math.sin(this._orbitAngle) * this._orbitRadius;

    // Spread shot, faster
    this._fireTimer -= delta;
    if (this._fireTimer <= 0) {
      this._fireTimer = 1100;
      this._fireSpread(px, py, 5, 18);
    }

    // Teleport dash every 4s
    this._teleTimer -= delta;
    if (this._teleTimer <= 0) {
      this._teleTimer = 4000;
      this._teleportDash(px, py);
    }
  }

  _updatePhase3(delta, px, py) {
    // Aggressive chase + full pattern
    const angle = Utils.angleTo(this._x, this._y, px, py);
    const spd   = this.cfg.SPEED * 1.8 * (delta / 1000);
    const newX  = this._x + Math.cos(angle) * spd;
    const newY  = this._y + Math.sin(angle) * spd;

    if (!this.scene.walls.hitsWall(newX, this._y, this.cfg.SIZE)) this.x = newX;
    if (!this.scene.walls.hitsWall(this._x, newY, this.cfg.SIZE)) this.y = newY;

    // Rapid-fire burst
    this._fireTimer -= delta;
    if (this._fireTimer <= 0) {
      this._fireTimer = 600;
      this._fireSpread(px, py, 7, 14);
    }

    // Summon drones every 6s
    this._summonTimer -= delta;
    if (this._summonTimer <= 0) {
      this._summonTimer = 6000;
      this._summonDrones(2);
    }
  }

  _fireSpread(targetX, targetY, count, spread) {
    const baseAngle = Utils.angleTo(this._x, this._y, targetX, targetY);
    const half = ((count - 1) / 2) * (spread * Math.PI / 180);

    for (let i = 0; i < count; i++) {
      const angle = baseAngle - half + i * (spread * Math.PI / 180);
      const b = new Bullet(
        this.scene, this._x, this._y,
        angle, this.cfg.BULLET_SPEED,
        AXIOM.COLORS.BULLET_E, 'enemy'
      );
      this.scene.enemyBullets.push(b);
    }
    AudioSynth.play('boss_shoot');
  }

  _teleportDash(px, py) {
    // Flash, move close to player, burst
    this.scene.spawnParticles(this._x, this._y, 0xff0066, 12);
    this.scene.cameras.main.flash(80, 255, 0, 80, true);

    const angle = Utils.angleTo(this._x, this._y, px, py);
    const dist  = Math.min(Utils.dist(this._x, this._y, px, py) - 80, 200);
    this.x = this._x + Math.cos(angle) * dist;
    this.y = this._y + Math.sin(angle) * dist;

    // Clamp to arena
    this.x = Utils.clamp(this._x, 60, AXIOM.WIDTH  - 60);
    this.y = Utils.clamp(this._y, 60, AXIOM.HEIGHT - 60);

    this.scene.spawnParticles(this._x, this._y, 0xff0066, 12);
    AudioSynth.play('dash');

    // Burst fire at arrival
    this.scene.time.delayedCall(80, () => {
      if (!this.dead) this._fireSpread(px, py, 8, 45);
    });
  }

  _summonDrones(count) {
    this.scene.spawnParticles(this._x, this._y, AXIOM.COLORS.ENEMY_DRONE, 8);
    AudioSynth.play('boss_alert');

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const sx = this._x + Math.cos(angle) * 60;
      const sy = this._y + Math.sin(angle) * 60;
      const drone = new Enemy(this.scene, sx, sy, 'DRONE');
      this.scene.enemies.push(drone);
    }
  }

  _drawTrail() {
    const g = this._trailGfx;
    g.clear();
    for (let i = 1; i < this._trail.length; i++) {
      const alpha = (1 - i / this._trail.length) * 0.35;
      const size  = 4 * (1 - i / this._trail.length);
      g.fillStyle(0xff0066, alpha);
      g.fillCircle(this._trail[i].x, this._trail[i].y, size);
    }
  }

  destroy() {
    this.gfx.destroy();
    this._trailGfx.destroy();
    HUD.showBossBar(false);
  }
}
