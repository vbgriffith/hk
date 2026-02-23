// ============================================================
//  AXIOM BREAK — entities.js  [PHASE 3 REPLACEMENT]
//  New in Phase 3:
//   - Phantom enemy: blinks in/out, faster, disorients
//   - Player: ricochet bullets, ghost step post-dash iframes,
//             dual dash charges, upgrade-aware _bulletDamage
//   - REGEN powerup handled in powerups.js (entities unaffected)
// ============================================================

// ── Player ───────────────────────────────────────────────────

class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.hp    = AXIOM.PLAYER.HP;
    this.maxHp = AXIOM.PLAYER.HP;
    this.dead  = false;

    // Dash
    this.dashing       = false;
    this.dashTimer     = 0;
    this.dashCooldown  = 0;
    this.dashVelX      = 0;
    this.dashVelY      = 0;
    // [P3] dual-charge dash
    this._dashChargesLeft = AXIOM.PLAYER._dashCharges || 1;
    this._dashChargeTimer = 0;   // replenish timer

    // Fire
    this.lastFired = 0;

    // Iframes (damage + ghost step)
    this.iframes = 0;

    // [P2] Audio flags
    this._justFired  = false;
    this._justDashed = false;

    // [P2] Active effects
    this.activeEffects = { SHIELD: false, OVERCLOCK: 0 };

    // [P3] Kill streak for score multiplier
    this.killStreak     = 0;
    this._streakResetTimer = 0;

    // [P3] No-hit tracking
    this._tookHitThisSector = false;

    this.gfx     = scene.add.graphics();
    this.x       = x;
    this.y       = y;
    this._draw();
    this.bullets = scene.add.group();
  }

  _draw(alpha = 1) {
    const g = this.gfx;
    const s = AXIOM.PLAYER.SIZE;
    g.clear();

    // Outer ring
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
    g.fillStyle(0xffffff, alpha);
    g.fillCircle(0, 0, 3);

    // [P2] Overclock aura
    if (this.activeEffects && this.activeEffects.OVERCLOCK > 0) {
      const pulse = 0.3 + 0.2 * Math.sin(this.scene.time.now / 80);
      g.lineStyle(1, 0xffb700, pulse);
      g.strokeCircle(0, 0, s + 8);
    }

    // [P3] Ghost step glow
    if (AXIOM.PLAYER._ghostStep && this.iframes > 400) {
      g.lineStyle(1.5, 0x44ddff, 0.6);
      g.strokeCircle(0, 0, s + 12);
    }
  }

  get x() { return this.gfx.x; }
  set x(v) { this.gfx.x = v; }
  get y() { return this.gfx.y; }
  set y(v) { this.gfx.y = v; }

  damage(amt) {
    if (this.iframes > 0 || this.dead) return;
    this.hp -= amt;
    this.iframes = 800;
    this._tookHitThisSector = true;
    this.killStreak = 0;              // [P3] break streak on hit
    HUD.setHealth(this.hp, this.maxHp);
    if (this.hp <= 0) { this.hp = 0; this.dead = true; }
    this.scene.cameras.main.flash(120, 255, 0, 0, true);
  }

  heal(amt) {
    this.hp = Math.min(this.maxHp, this.hp + amt);
    HUD.setHealth(this.hp, this.maxHp);
  }

  update(delta, cursors, pointer, spliceSystem) {
    if (this.dead) return;

    // Iframes
    if (this.iframes > 0) {
      this.iframes -= delta;
      this._draw(this.iframes % 150 < 75 ? 0.3 : 1);
    } else {
      this._draw(1);
    }

    // [P3] Kill streak decay (3s without kill → reset)
    this._streakResetTimer += delta;
    if (this._streakResetTimer > 3000) {
      this.killStreak = 0;
      this._streakResetTimer = 0;
    }

    // Dash cooldown
    this.dashCooldown = Math.max(0, this.dashCooldown - delta);

    // [P3] dual-charge replenish
    if (this._dashChargesLeft < (AXIOM.PLAYER._dashCharges || 1)) {
      this._dashChargeTimer -= delta;
      if (this._dashChargeTimer <= 0) {
        this._dashChargesLeft++;
        this._dashChargeTimer = AXIOM.PLAYER.DASH_COOLDOWN;
      }
    }

    if (this.dashing) {
      this.dashTimer -= delta;
      if (this.dashTimer <= 0) { this.dashing = false; }
      else {
        this._moveBy(this.dashVelX * (delta / 1000), this.dashVelY * (delta / 1000));
        return;
      }
    }

    // Movement
    let vx = 0, vy = 0;
    if (cursors.left.isDown  || cursors.a.isDown)  vx -= 1;
    if (cursors.right.isDown || cursors.d.isDown)  vx += 1;
    if (cursors.up.isDown    || cursors.w.isDown)  vy -= 1;
    if (cursors.down.isDown  || cursors.s.isDown)  vy += 1;
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

    this._moveBy(vx * AXIOM.PLAYER.SPEED * (delta / 1000), vy * AXIOM.PLAYER.SPEED * (delta / 1000));

    // Dash
    if (cursors.shift.isDown && this.dashCooldown <= 0 && this._dashChargesLeft > 0 && (vx !== 0 || vy !== 0)) {
      this.dashing      = true;
      this.dashTimer    = AXIOM.PLAYER.DASH_DURATION;
      this.dashCooldown = AXIOM.PLAYER.DASH_COOLDOWN;
      this.dashVelX     = vx * AXIOM.PLAYER.DASH_SPEED;
      this.dashVelY     = vy * AXIOM.PLAYER.DASH_SPEED;
      this._justDashed  = true;
      this._dashChargesLeft--;
      if (this._dashChargesLeft < (AXIOM.PLAYER._dashCharges || 1)) {
        this._dashChargeTimer = AXIOM.PLAYER.DASH_COOLDOWN;
      }

      // [P3] Ghost step iframes
      if (AXIOM.PLAYER._ghostStep) {
        this.iframes = Math.max(this.iframes, AXIOM.PLAYER._ghostStepDuration || 600);
      }

      this.scene.spawnParticles(this.x, this.y, AXIOM.COLORS.PLAYER, 6);
    }

    // Shoot
    const now = this.scene.time.now;
    if (pointer.isDown && now - this.lastFired > AXIOM.PLAYER.FIRE_RATE) {
      this.lastFired  = now;
      this._justFired = true;
      const angle = Utils.angleTo(this.x, this.y, pointer.worldX, pointer.worldY);
      this._spawnBullet(angle);
    }

    spliceSystem.recordFrame(this.x, this.y, vx, vy);
  }

  _moveBy(dx, dy) {
    const r = AXIOM.PLAYER.SIZE;
    const newX = this.x + dx;
    const newY = this.y + dy;
    if (!this.scene.walls.hitsWall(newX, this.y, r)) this.x = Utils.clamp(newX, r, AXIOM.WIDTH - r);
    if (!this.scene.walls.hitsWall(this.x, newY, r)) this.y = Utils.clamp(newY, r, AXIOM.HEIGHT - r);
  }

  _spawnBullet(angle) {
    const b = new Bullet(this.scene, this.x, this.y, angle,
      AXIOM.PLAYER.BULLET_SPEED, AXIOM.COLORS.BULLET_P, 'player',
      AXIOM.PLAYER._ricochet || false);  // [P3] ricochet flag
    this.bullets.add(b.gfx, true);
    this.scene.playerBullets.push(b);
  }

  onKill() {
    // [P3] Called by GameScene when an enemy dies from player damage
    this.killStreak++;
    this._streakResetTimer = 0;
  }

  getScoreMultiplier() {
    const streakBonus = Math.min(this.killStreak * AXIOM.SCORE.STREAK_MULT, 0.5);
    return (AXIOM.SCORE.BASE_MULTIPLIER + streakBonus).toFixed(1);
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

    // [P2] Stun
    this._stunned   = false;
    this._stunTimer = 0;

    // [P3] Phantom phase state
    this._phantomPhased   = false;
    this._phantomTimer    = 0;
    this._phantomCycle    = type === 'PHANTOM' ? Utils.randFloat(1200, 2000) : 0;
    this._phantomVisTimer = 0;

    this.gfx = scene.add.graphics();
    this.x   = x;
    this.y   = y;
    this._draw(1);
  }

  _draw(alpha) {
    const g   = this.gfx;
    const s   = this.cfg.SIZE;
    const col = AXIOM.COLORS['ENEMY_' + this.type] || 0xff6622;
    g.clear();
    g.lineStyle(2, col, alpha);
    g.fillStyle(col, alpha * 0.25);

    if (this.type === 'DRONE') {
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        i === 0 ? g.moveTo(Math.cos(a)*s, Math.sin(a)*s) : g.lineTo(Math.cos(a)*s, Math.sin(a)*s);
      }
      g.closePath(); g.fillPath(); g.strokePath();

    } else if (this.type === 'GUARD') {
      g.fillRect(-s,-s,s*2,s*2); g.strokeRect(-s,-s,s*2,s*2);
      g.fillStyle(col, alpha); g.fillCircle(0,0,4);

    } else if (this.type === 'SNIPER') {
      g.fillTriangle(-s*0.5,0,0,-s*1.4,s*0.5,0);
      g.fillTriangle(-s*0.5,0,0, s*1.4,s*0.5,0);
      g.strokeTriangle(-s*0.5,0,0,-s*1.4,s*0.5,0);
      g.strokeTriangle(-s*0.5,0,0, s*1.4,s*0.5,0);
      g.fillStyle(0xffffff, alpha*0.9); g.fillCircle(0,0,2);

    } else if (this.type === 'PHANTOM') {
      // [P3] Teardrop / ghost shape — semi-transparent layered ovals
      g.fillStyle(col, alpha * (this._phantomPhased ? 0.08 : 0.3));
      g.fillEllipse(0, 0, s * 1.6, s * 2.2);
      g.lineStyle(1.5, col, alpha * (this._phantomPhased ? 0.2 : 0.9));
      g.strokeEllipse(0, 0, s * 1.6, s * 2.2);
      // Eye
      g.fillStyle(0xffffff, alpha * (this._phantomPhased ? 0.1 : 0.85));
      g.fillCircle(0, -s * 0.25, 3);
      g.fillStyle(col, alpha);
      g.fillCircle(0, -s * 0.25, 1.5);

    } else if (this.type === 'BOSS') {
      for (const r of [s, s*0.55]) {
        g.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI/4)*i;
          i===0 ? g.moveTo(Math.cos(a)*r,Math.sin(a)*r) : g.lineTo(Math.cos(a)*r,Math.sin(a)*r);
        }
        g.closePath(); g.fillPath(); g.strokePath();
      }
    }

    // Stun
    if (this._stunned) {
      g.lineStyle(2, 0x88ccff, 0.6);
      g.strokeCircle(0, 0, s+4);
    }

    // HP bar (hidden when phased)
    if (!this._phantomPhased) {
      const barW  = s * 2.5;
      const hpPct = this.hp / this.maxHp;
      g.fillStyle(0x333333, 0.7);
      g.fillRect(-barW/2, -s-10, barW, 4);
      g.fillStyle(col, 1);
      g.fillRect(-barW/2, -s-10, barW * hpPct, 4);
    }
  }

  get x() { return this.gfx.x; }
  set x(v) { this.gfx.x = v; }
  get y() { return this.gfx.y; }
  set y(v) { this.gfx.y = v; }

  damage(amt) {
    if (this.dead) return;
    // [P3] Phantom is immune while phased
    if (this.type === 'PHANTOM' && this._phantomPhased) return;
    this.hp -= amt;
    this._draw(1);
    this.scene.spawnParticles(this.x, this.y, AXIOM.COLORS['ENEMY_' + this.type] || 0xff6622, 3);
    if (this.hp <= 0) {
      this.hp = 0; this.dead = true;
      this.scene.onEnemyDead(this);
    }
  }

  update(delta, playerX, playerY) {
    if (this.dead) return;

    if (this._stunned) {
      this._stunTimer -= delta;
      if (this._stunTimer <= 0) this._stunned = false;
      this._draw(0.4 + 0.2 * Math.sin(this.scene.time.now / 80));
      return;
    }

    const angle = Utils.angleTo(this.x, this.y, playerX, playerY);

    if (this.type === 'PHANTOM') {
      this._updatePhantom(delta, angle, playerX, playerY);
    } else if (this.type === 'SNIPER') {
      this._updateSniper(delta, angle, playerX, playerY);
    } else {
      // Standard approach
      const spd = this.cfg.SPEED * (delta/1000);
      const nx  = this.x + Math.cos(angle)*spd;
      const ny  = this.y + Math.sin(angle)*spd;
      if (!this.scene.walls.hitsWall(nx, this.y, this.cfg.SIZE)) this.x = nx;
      if (!this.scene.walls.hitsWall(this.x, ny, this.cfg.SIZE)) this.y = ny;
      this.gfx.rotation += (this.type==='DRONE' ? 0.04 : 0.02);
    }

    // Fire (only if not phased)
    if (!this._phantomPhased) {
      const now = this.scene.time.now;
      if (now - this.lastFired > this.cfg.FIRE_RATE) {
        this.lastFired = now;
        const b = new Bullet(this.scene, this.x, this.y, angle,
          this.cfg.BULLET_SPEED, AXIOM.COLORS.BULLET_E, 'enemy');
        this.scene.enemyBullets.push(b);
      }
    }
  }

  _updatePhantom(delta, angle, px, py) {
    // Phase cycle
    this._phantomTimer += delta;
    if (this._phantomTimer >= this._phantomCycle) {
      this._phantomTimer = 0;
      this._phantomPhased = !this._phantomPhased;
      // When unphasing, snap toward player aggressively
      if (!this._phantomPhased) {
        this.scene.spawnParticles(this.x, this.y, AXIOM.COLORS.ENEMY_PHANTOM, 5);
      }
      this._draw(this._phantomPhased ? 0.15 : 1);
    }

    // Move faster when phased (untouchable sprint)
    const spd = this.cfg.SPEED * (this._phantomPhased ? 1.6 : 0.7) * (delta/1000);
    const nx  = this.x + Math.cos(angle)*spd;
    const ny  = this.y + Math.sin(angle)*spd;
    if (!this.scene.walls.hitsWall(nx, this.y, this.cfg.SIZE)) this.x = nx;
    if (!this.scene.walls.hitsWall(this.x, ny, this.cfg.SIZE)) this.y = ny;

    // Subtle rotation
    this.gfx.rotation += 0.01;

    // Animate transparency
    const baseAlpha = this._phantomPhased ? 0.12 : 1.0;
    const flicker = this._phantomPhased
      ? baseAlpha + 0.06 * Math.sin(this.scene.time.now / 120)
      : baseAlpha;
    this._draw(flicker);
  }

  _updateSniper(delta, angle, px, py) {
    const dist = Utils.dist(this.x, this.y, px, py);
    const idealDist = 220;
    const spd = this.cfg.SPEED * (delta/1000);

    if (dist < idealDist - 40) {
      const nx = this.x - Math.cos(angle)*spd;
      const ny = this.y - Math.sin(angle)*spd;
      if (!this.scene.walls.hitsWall(nx, this.y, this.cfg.SIZE)) this.x = nx;
      if (!this.scene.walls.hitsWall(this.x, ny, this.cfg.SIZE)) this.y = ny;
    } else if (dist > idealDist + 60) {
      const nx = this.x + Math.cos(angle)*spd*0.5;
      const ny = this.y + Math.sin(angle)*spd*0.5;
      if (!this.scene.walls.hitsWall(nx, this.y, this.cfg.SIZE)) this.x = nx;
      if (!this.scene.walls.hitsWall(this.x, ny, this.cfg.SIZE)) this.y = ny;
    }
    this.gfx.rotation = angle + Math.PI/2;
  }

  destroy() { this.gfx.destroy(); }
}


// ── Bullet ───────────────────────────────────────────────────

class Bullet {
  constructor(scene, x, y, angle, speed, color, owner, ricochet = false) {
    this.scene    = scene;
    this.owner    = owner;
    this.angle    = angle;
    this.speed    = speed;
    this.dead     = false;
    this.life     = 2200;
    this.color    = color;
    this.ricochet = ricochet;   // [P3]
    this._bounced = false;

    this.gfx = scene.add.graphics();
    this.x   = x;
    this.y   = y;
    this.gfx.fillStyle(color, 1);
    this.gfx.lineStyle(1, 0xffffff, 0.5);
    this.gfx.fillRect(-6, -2, 12, 4);
    this.gfx.fillStyle(0xffffff, 0.8);
    this.gfx.fillRect(-4, -1, 8, 2);
    this.gfx.rotation = angle;
  }

  get x() { return this.gfx.x; }
  set x(v) { this.gfx.x = v; }
  get y() { return this.gfx.y; }
  set y(v) { this.gfx.y = v; }

  update(delta) {
    if (this.dead) return;
    this.life -= delta;
    if (this.life <= 0) { this.kill(); return; }

    const nx = this.x + Math.cos(this.angle) * this.speed * (delta/1000);
    const ny = this.y + Math.sin(this.angle) * this.speed * (delta/1000);

    if (nx < 0 || nx > AXIOM.WIDTH || ny < 0 || ny > AXIOM.HEIGHT) {
      this.kill(); return;
    }

    // [P3] Ricochet: check individual axis collisions
    if (this.ricochet && !this._bounced && this.scene.walls.hitsWall(nx, this.y, 2)) {
      this.angle = Math.PI - this.angle;
      this._bounced = true;
      this.gfx.rotation = this.angle;
      this.scene.spawnParticles(this.x, this.y, this.color, 3);
      return;
    }
    if (this.ricochet && !this._bounced && this.scene.walls.hitsWall(this.x, ny, 2)) {
      this.angle = -this.angle;
      this._bounced = true;
      this.gfx.rotation = this.angle;
      this.scene.spawnParticles(this.x, this.y, this.color, 3);
      return;
    }

    if (this.scene.walls.hitsWall(nx, ny, 2)) {
      this.scene.spawnParticles(this.x, this.y, this.color, 4);
      this.kill();
      return;
    }

    this.x = nx;
    this.y = ny;
  }

  kill() {
    this.dead = true;
    this.gfx.destroy();
  }
}
