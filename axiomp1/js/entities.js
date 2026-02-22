// ============================================================
//  AXIOM BREAK — entities.js
//  Player, Enemy, and Bullet classes built on Phaser GameObjects
// ============================================================

// ── Player ───────────────────────────────────────────────────

class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.hp    = AXIOM.PLAYER.HP;
    this.maxHp = AXIOM.PLAYER.HP;
    this.dead  = false;
    this.score = 0;

    // Dash state
    this.dashing      = false;
    this.dashTimer    = 0;
    this.dashCooldown = 0;
    this.dashVelX     = 0;
    this.dashVelY     = 0;

    // Fire rate
    this.lastFired = 0;

    // Invincibility frames after hit
    this.iframes = 0;

    // Create Phaser graphics object
    this.gfx = scene.add.graphics();
    this.x   = x;
    this.y   = y;
    this._draw();

    // Bullet group
    this.bullets = scene.add.group();
  }

  _draw(alpha = 1) {
    const g = this.gfx;
    const s = AXIOM.PLAYER.SIZE;
    g.clear();
    g.lineStyle(1.5, AXIOM.COLORS.PLAYER, alpha * 0.35);
    g.fillStyle(AXIOM.COLORS.PLAYER, alpha * 0.12);
    g.strokeCircle(0, 0, s + 4);

    // Core diamond
    g.lineStyle(2, AXIOM.COLORS.PLAYER, alpha);
    g.fillStyle(AXIOM.COLORS.PLAYER, alpha * 0.4);
    g.fillTriangle(-s, 0, 0, -s, s, 0);
    g.fillTriangle(-s, 0, 0,  s, s, 0);
    g.strokeTriangle(-s, 0, 0, -s, s, 0);
    g.strokeTriangle(-s, 0, 0,  s, s, 0);

    // Center dot
    g.fillStyle(0xffffff, alpha);
    g.fillCircle(0, 0, 3);
  }

  get x() { return this.gfx.x; }
  set x(v) { this.gfx.x = v; }
  get y() { return this.gfx.y; }
  set y(v) { this.gfx.y = v; }

  damage(amt) {
    if (this.iframes > 0 || this.dead) return;
    this.hp -= amt;
    this.iframes = 800;
    HUD.setHealth(this.hp, this.maxHp);
    if (this.hp <= 0) { this.hp = 0; this.dead = true; }
    // Flash red
    this.scene.cameras.main.flash(120, 255, 0, 0, true);
  }

  update(delta, cursors, pointer, spliceSystem) {
    if (this.dead) return;

    // Iframes countdown
    if (this.iframes > 0) {
      this.iframes -= delta;
      this._draw(this.iframes % 150 < 75 ? 0.3 : 1);
    } else {
      this._draw(1);
    }

    // ── Dash
    this.dashCooldown = Math.max(0, this.dashCooldown - delta);
    if (this.dashing) {
      this.dashTimer -= delta;
      if (this.dashTimer <= 0) { this.dashing = false; }
      else {
        this._moveBy(this.dashVelX * (delta / 1000), this.dashVelY * (delta / 1000));
        return;
      }
    }

    // ── Movement
    let vx = 0, vy = 0;
    if (cursors.left.isDown  || cursors.a.isDown)  vx -= 1;
    if (cursors.right.isDown || cursors.d.isDown)  vx += 1;
    if (cursors.up.isDown    || cursors.w.isDown)  vy -= 1;
    if (cursors.down.isDown  || cursors.s.isDown)  vy += 1;

    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

    const spd = AXIOM.PLAYER.SPEED;
    this._moveBy(vx * spd * (delta / 1000), vy * spd * (delta / 1000));

    // ── Dash trigger
    if (cursors.shift.isDown && this.dashCooldown <= 0 && (vx !== 0 || vy !== 0)) {
      this.dashing   = true;
      this.dashTimer = AXIOM.PLAYER.DASH_DURATION;
      this.dashCooldown = AXIOM.PLAYER.DASH_COOLDOWN;
      this.dashVelX  = vx * AXIOM.PLAYER.DASH_SPEED;
      this.dashVelY  = vy * AXIOM.PLAYER.DASH_SPEED;
      // Particle burst
      this.scene.spawnParticles(this.x, this.y, AXIOM.COLORS.PLAYER, 6);
    }

    // ── Rotate toward cursor
    // (no rotation needed for diamond; just orient the graphic later if desired)

    // ── Shoot
    const now = this.scene.time.now;
    if (pointer.isDown && now - this.lastFired > AXIOM.PLAYER.FIRE_RATE) {
      this.lastFired = now;
      const wx = pointer.worldX;
      const wy = pointer.worldY;
      const angle = Utils.angleTo(this.x, this.y, wx, wy);
      this._spawnBullet(angle);
    }

    // ── Record splice input
    spliceSystem.recordFrame(this.x, this.y, vx, vy);
  }

  _moveBy(dx, dy) {
    const walls = this.scene.walls;
    const newX = this.x + dx;
    const newY = this.y + dy;
    const r = AXIOM.PLAYER.SIZE;
    const W = AXIOM.WIDTH, H = AXIOM.HEIGHT;

    if (!walls.hitsWall(newX, this.y, r)) this.x = Utils.clamp(newX, r, W - r);
    if (!walls.hitsWall(this.x, newY, r)) this.y = Utils.clamp(newY, r, H - r);
  }

  _spawnBullet(angle) {
    const b = new Bullet(this.scene, this.x, this.y, angle,
      AXIOM.PLAYER.BULLET_SPEED, AXIOM.COLORS.BULLET_P, 'player');
    this.bullets.add(b.gfx, true);
    this.scene.playerBullets.push(b);
  }

  destroy() {
    this.gfx.destroy();
    this.bullets.destroy(true);
  }
}


// ── Enemy ────────────────────────────────────────────────────

class Enemy {
  constructor(scene, x, y, type = 'DRONE') {
    this.scene  = scene;
    this.type   = type;
    this.cfg    = AXIOM.ENEMY[type];
    this.hp     = this.cfg.HP;
    this.maxHp  = this.cfg.HP;
    this.dead   = false;
    this.lastFired = 0;

    this.gfx = scene.add.graphics();
    this.x   = x;
    this.y   = y;
    this._draw(1);
  }

  _draw(alpha) {
    const g   = this.gfx;
    const s   = this.cfg.SIZE;
    const col = AXIOM.COLORS['ENEMY_' + this.type];
    g.clear();
    g.lineStyle(2, col, alpha);
    g.fillStyle(col, alpha * 0.25);

    if (this.type === 'DRONE') {
      // Hexagon
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const px = Math.cos(a) * s, py = Math.sin(a) * s;
        i === 0 ? g.moveTo(px, py) : g.lineTo(px, py);
      }
      g.closePath();
      g.fillPath();
      g.strokePath();
    } else if (this.type === 'GUARD') {
      // Square rotated 45°
      g.fillRect(-s, -s, s * 2, s * 2);
      g.strokeRect(-s, -s, s * 2, s * 2);
      g.fillStyle(col, alpha);
      g.fillCircle(0, 0, 4);
    } else if (this.type === 'BOSS') {
      // Large octagon with inner ring
      for (let r of [s, s * 0.55]) {
        g.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI / 4) * i;
          const px = Math.cos(a) * r, py = Math.sin(a) * r;
          i === 0 ? g.moveTo(px, py) : g.lineTo(px, py);
        }
        g.closePath();
        g.fillPath();
        g.strokePath();
      }
    }

    // HP bar
    const barW = s * 2.5;
    const hpPct = this.hp / this.maxHp;
    g.fillStyle(0x333333, 0.7);
    g.fillRect(-barW / 2, -s - 10, barW, 4);
    g.fillStyle(col, 1);
    g.fillRect(-barW / 2, -s - 10, barW * hpPct, 4);
  }

  get x() { return this.gfx.x; }
  set x(v) { this.gfx.x = v; }
  get y() { return this.gfx.y; }
  set y(v) { this.gfx.y = v; }

  damage(amt) {
    if (this.dead) return;
    this.hp -= amt;
    this._draw(1);
    this.scene.spawnParticles(this.x, this.y, AXIOM.COLORS['ENEMY_' + this.type], 3);
    if (this.hp <= 0) {
      this.hp = 0;
      this.dead = true;
      this.scene.onEnemyDead(this);
    }
  }

  update(delta, playerX, playerY) {
    if (this.dead) return;
    const angle = Utils.angleTo(this.x, this.y, playerX, playerY);
    const spd   = this.cfg.SPEED * (delta / 1000);
    const newX  = this.x + Math.cos(angle) * spd;
    const newY  = this.y + Math.sin(angle) * spd;

    if (!this.scene.walls.hitsWall(newX, this.y, this.cfg.SIZE)) this.x = newX;
    if (!this.scene.walls.hitsWall(this.x, newY, this.cfg.SIZE)) this.y = newY;

    this.gfx.rotation += (this.type === 'DRONE' ? 0.04 : 0.02);

    // Shoot
    const now = this.scene.time.now;
    if (now - this.lastFired > this.cfg.FIRE_RATE) {
      this.lastFired = now;
      const b = new Bullet(this.scene, this.x, this.y, angle,
        this.cfg.BULLET_SPEED, AXIOM.COLORS.BULLET_E, 'enemy');
      this.scene.enemyBullets.push(b);
    }
  }

  destroy() { this.gfx.destroy(); }
}


// ── Bullet ───────────────────────────────────────────────────

class Bullet {
  constructor(scene, x, y, angle, speed, color, owner) {
    this.scene  = scene;
    this.owner  = owner;
    this.angle  = angle;
    this.speed  = speed;
    this.dead   = false;
    this.life   = 2200; // ms

    this.gfx = scene.add.graphics();
    this.x   = x;
    this.y   = y;

    this.gfx.fillStyle(color, 1);
    this.gfx.lineStyle(1, 0xffffff, 0.5);
    // Elongated bolt
    this.gfx.fillRect(-6, -2, 12, 4);
    this.gfx.fillStyle(0xffffff, 0.8);
    this.gfx.fillRect(-4, -1, 8, 2);
    this.gfx.rotation = angle;
    this.color = color;
  }

  get x() { return this.gfx.x; }
  set x(v) { this.gfx.x = v; }
  get y() { return this.gfx.y; }
  set y(v) { this.gfx.y = v; }

  update(delta) {
    if (this.dead) return;
    this.life -= delta;
    if (this.life <= 0) { this.kill(); return; }

    this.x += Math.cos(this.angle) * this.speed * (delta / 1000);
    this.y += Math.sin(this.angle) * this.speed * (delta / 1000);

    // Out of bounds
    if (this.x < 0 || this.x > AXIOM.WIDTH || this.y < 0 || this.y > AXIOM.HEIGHT) {
      this.kill(); return;
    }

    // Wall collision
    if (this.scene.walls.hitsWall(this.x, this.y, 2)) {
      this.scene.spawnParticles(this.x, this.y, this.color, 4);
      this.kill();
    }
  }

  kill() {
    this.dead = true;
    this.gfx.destroy();
  }
}
