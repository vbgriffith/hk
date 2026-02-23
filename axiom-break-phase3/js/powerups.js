// ============================================================
//  AXIOM BREAK — powerups.js  [PHASE 3 REPLACEMENT]
//  Adds to Phase 2:
//   - REGEN powerup: instantly restores 25 HP
//   - PHANTOM enemy stun support in EMP
//   - SNIPER stun in EMP
// ============================================================

class Powerup {
  constructor(scene, x, y, type) {
    this.scene = scene;
    this.type  = type;
    this.x     = x;
    this.y     = y;
    this.dead  = false;
    this.life  = 12000;
    this._age  = 0;
    this._cfg  = AXIOM.POWERUPS[type];

    this.gfx = scene.add.graphics();
    this._draw(1);

    scene.tweens.add({
      targets: this.gfx,
      y: { from: y - 4, to: y + 4 },
      duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  _draw(alpha) {
    const g = this.gfx;
    const c = this._cfg.color;
    const s = 9;
    g.clear();

    g.lineStyle(1.5, c, alpha * 0.5);
    g.strokeCircle(0, 0, s + 5);
    g.fillStyle(c, alpha * 0.15);
    g.fillCircle(0, 0, s);
    g.lineStyle(2, c, alpha);
    g.strokeCircle(0, 0, s);
    g.lineStyle(2, c, alpha);
    g.fillStyle(c, alpha * 0.9);

    if (this.type === 'SHIELD') {
      g.fillTriangle(-5, 2, 0, -6, 5, 2);
      g.fillStyle(c, alpha * 0.4);
      g.fillTriangle(-3, 4, 0, 6, 3, 4);

    } else if (this.type === 'OVERCLOCK') {
      g.fillTriangle(2, -6, -2, 0, 2, 0);
      g.fillTriangle(-2, 0, 2, 0, -2, 6);

    } else if (this.type === 'EMP_BURST') {
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        g.strokeLineShape({ x1: Math.cos(a)*3, y1: Math.sin(a)*3, x2: Math.cos(a)*7, y2: Math.sin(a)*7 });
      }
      g.fillCircle(0, 0, 3);

    } else if (this.type === 'REGEN') {
      // [P3] Cross symbol
      g.fillRect(-1.5, -6, 3, 12);
      g.fillRect(-6, -1.5, 12, 3);
    }

    this.gfx.x = this.x;
    this.gfx.y = this.y;
  }

  update(delta) {
    if (this.dead) return;
    this._age += delta;
    if (this._age >= this.life) { this.kill(); return; }
    if (this._age > this.life - 3000) {
      this._draw(1 - (this._age - (this.life - 3000)) / 3000);
    }
  }

  kill() {
    this.dead = true;
    this.gfx.destroy();
  }
}


class PowerupManager {
  constructor(scene, player) {
    this.scene   = scene;
    this.player  = player;
    this.pickups = [];

    player.activeEffects = {
      SHIELD:    false,
      OVERCLOCK: 0,
    };

    this._shieldGfx   = scene.add.graphics().setDepth(5);
    this._shieldPulse = 0;
  }

  tryDrop(enemy) {
    const dropTable = AXIOM.POWERUPS._dropTable[enemy.type];
    if (!dropTable) return;
    const roll = Math.random();
    let cum = 0;
    for (const [type, chance] of dropTable) {
      cum += chance;
      if (roll < cum) { this._spawnPickup(enemy.x, enemy.y, type); return; }
    }
  }

  _spawnPickup(x, y, type) {
    const p = new Powerup(this.scene, x, y, type);
    this.pickups.push(p);
    this.scene.spawnParticles(x, y, AXIOM.POWERUPS[type].color, 5);
  }

  update(delta) {
    const px = this.player.x, py = this.player.y;

    for (const p of this.pickups) {
      p.update(delta);
      if (!p.dead && Utils.dist(px, py, p.x, p.y) < 22) {
        this._applyEffect(p.type);
        p.kill();
      }
    }
    this.pickups = this.pickups.filter(p => !p.dead);

    const fx = this.player.activeEffects;
    if (fx.OVERCLOCK > 0) {
      fx.OVERCLOCK -= delta;
      if (fx.OVERCLOCK <= 0) { fx.OVERCLOCK = 0; this._onOverclockEnd(); }
    }

    this._updateShieldVisual(delta);
    HUD.setActivePowerups(fx);
  }

  _applyEffect(type) {
    const fx = this.player.activeEffects;
    AudioSynth.play('powerup');
    this.scene.spawnParticles(this.player.x, this.player.y, AXIOM.POWERUPS[type].color, 14);

    if (type === 'SHIELD') {
      fx.SHIELD = true;
      this.scene.cameras.main.flash(80, 0, 120, 255, true);

    } else if (type === 'OVERCLOCK') {
      fx.OVERCLOCK = AXIOM.POWERUPS.OVERCLOCK.duration;
      this._origFireRate  = AXIOM.PLAYER.FIRE_RATE;
      this._origBulletSpd = AXIOM.PLAYER.BULLET_SPEED;
      AXIOM.PLAYER.FIRE_RATE    = Math.floor(AXIOM.PLAYER.FIRE_RATE * 0.45);
      AXIOM.PLAYER.BULLET_SPEED = Math.floor(AXIOM.PLAYER.BULLET_SPEED * 1.6);
      this.scene.cameras.main.flash(80, 255, 200, 0, true);

    } else if (type === 'EMP_BURST') {
      this._triggerEMP();

    } else if (type === 'REGEN') {
      // [P3] Heal 25 HP
      this.player.heal(25);
      this.scene.cameras.main.flash(100, 0, 255, 100, true);
    }
  }

  _onOverclockEnd() {
    if (this._origFireRate !== undefined) {
      AXIOM.PLAYER.FIRE_RATE    = this._origFireRate;
      AXIOM.PLAYER.BULLET_SPEED = this._origBulletSpd;
    }
  }

  _triggerEMP() {
    AudioSynth.play('emp_burst');
    this.scene.cameras.main.flash(250, 100, 220, 255, true);
    this.scene.cameras.main.shake(300, 0.012);

    for (const e of this.scene.enemies) {
      if (e.dead) continue;
      if (e.type === 'DRONE') {
        e.damage(e.hp + 1);
      } else if (e.type === 'GUARD') {
        e.damage(e.maxHp * 0.6);
        this._stunEnemy(e, 2500);
      } else if (e.type === 'SNIPER') {
        this._stunEnemy(e, 1200);
      } else if (e.type === 'PHANTOM') {
        // [P3] EMP forces phantom to unphase + stun
        e._phantomPhased = false;
        this._stunEnemy(e, 2000);
      } else if (e.type === 'BOSS') {
        e.damage(e.maxHp * 0.2);
        this._stunEnemy(e, 1200);
      }
      this.scene.spawnParticles(e.x, e.y, 0x88ccff, 8);
    }
    this._spawnEMPRing();
  }

  _stunEnemy(enemy, duration) {
    enemy._stunTimer = (enemy._stunTimer || 0) + duration;
    enemy._stunned   = true;
  }

  _spawnEMPRing() {
    const ring = this.scene.add.graphics();
    ring.lineStyle(3, 0x88ccff, 0.9);
    ring.strokeCircle(this.player.x, this.player.y, 10);
    this.scene.tweens.add({
      targets: ring, scaleX: 45, scaleY: 45, alpha: 0,
      duration: 500, ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  _updateShieldVisual(delta) {
    const g  = this._shieldGfx;
    const fx = this.player.activeEffects;
    if (!fx.SHIELD) { g.clear(); return; }

    this._shieldPulse += delta / 400;
    const pulse = 0.5 + 0.3 * Math.sin(this._shieldPulse);
    const r     = AXIOM.PLAYER.SIZE + 8;
    g.clear();
    g.lineStyle(2.5, 0x00aaff, pulse);
    g.strokeCircle(this.player.x, this.player.y, r);
    g.lineStyle(1, 0x88ddff, pulse * 0.4);
    g.strokeCircle(this.player.x, this.player.y, r + 4);
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i + this._shieldPulse * 0.2;
      g.fillStyle(0x00aaff, pulse * 0.6);
      g.fillCircle(this.player.x + Math.cos(a) * (r+2), this.player.y + Math.sin(a) * (r+2), 2);
    }
  }

  interceptDamage(amount) {
    const fx = this.player.activeEffects;
    if (fx.SHIELD) {
      fx.SHIELD = false;
      AudioSynth.play('shield_hit');
      this.scene.spawnParticles(this.player.x, this.player.y, 0x00aaff, 10);
      this.scene.cameras.main.flash(60, 0, 100, 200, true);
      return 0;
    }
    return amount;
  }

  destroy() {
    this._shieldGfx.destroy();
    for (const p of this.pickups) p.kill();
  }
}
