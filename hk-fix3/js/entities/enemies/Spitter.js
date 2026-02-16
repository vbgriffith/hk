/* js/entities/enemies/Spitter.js — Acid-spitting stationary/patrol bug */
'use strict';

class Spitter extends Entity {
  constructor(scene, x, y, data = {}) {
    super(scene, x, y, 'spitter', 0);

    this.hp        = C.SPITTER_HP;
    this.dmg       = C.SPITTER_DMG;
    this.geoReward = data.geoReward ?? 6;
    this.facingDir = data.facingLeft ? -1 : 1;

    this.patrolLeft  = data.patrolLeft  ?? x - 60;
    this.patrolRight = data.patrolRight ?? x + 60;

    this._aiState  = 'idle';
    this._aiTimer  = 0;
    this._shootCd  = C.SPITTER_SHOOT_CD;
    this._aggroRange = 180;
    this._staggerHits = 0;

    this.setSize(18, 18, 7, 7);
    this.sprite.setGravityY(C.GRAVITY);
    this._play('idle');
  }

  update(dt) {
    if (!this.alive) return;
    this._shootCd -= dt;
    this._aiTimer -= dt;

    switch (this._aiState) {
      case 'idle':    this._aiIdle(dt);    break;
      case 'walk':    this._aiWalk(dt);    break;
      case 'spit':    this._aiSpit(dt);    break;
      case 'stun':    this._aiStun(dt);    break;
    }

    this.sprite.setFlipX(this.facingDir < 0);
  }

  _aiIdle(dt) {
    this.body.setVelocityX(0);
    const player = this.scene.knight;
    if (!player) return;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < this._aggroRange) {
      this.facingDir = Math.sign(dx);
      if (this._shootCd <= 0) {
        this._setState('spit', dy);
      } else {
        this._setState('walk');
      }
    }
  }

  _aiWalk(dt) {
    this.body.setVelocityX(this.facingDir * C.SPITTER_SPEED);

    // Bounds check
    if (this.x <= this.patrolLeft  && this.facingDir < 0) this.facingDir = 1;
    if (this.x >= this.patrolRight && this.facingDir > 0) this.facingDir = -1;

    const player = this.scene.knight;
    if (player && this._shootCd <= 0) {
      const dist = Math.hypot(player.x - this.x, player.y - this.y);
      if (dist < this._aggroRange) {
        const dy = player.y - this.y;
        this._setState('spit', dy);
      }
    }

    if (this._aiTimer <= 0) this._setState('idle');
  }

  _aiSpit(dt) {
    this.body.setVelocityX(0);
    if (this._aiTimer <= 0) {
      this._fireProjectile();
      this._shootCd = C.SPITTER_SHOOT_CD;
      this._setState('idle');
    }
  }

  _aiStun(dt) {
    this.body.setVelocityX(0);
    if (this._aiTimer <= 0) {
      this._staggerHits = 0;
      this._setState('idle');
    }
  }

  _setState(next, extraData) {
    this._aiState = next;
    switch (next) {
      case 'idle': this._aiTimer = 1.0; this._play('idle'); break;
      case 'walk': this._aiTimer = Phaser.Math.Between(100, 200) / 100; this._play('walk'); break;
      case 'spit':
        this._aiTimer = 0.45;
        // spit_up if player is higher, else spit_fwd
        this._play(extraData < -20 ? 'spit_up' : 'spit_fwd');
        break;
      case 'stun': this._aiTimer = 0.4; this._play('hit'); break;
    }
  }

  _fireProjectile() {
    const player = this.scene.knight;
    if (!player) return;

    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    const vx = Math.cos(angle) * C.SPITTER_PROJ_SPEED;
    const vy = Math.sin(angle) * C.SPITTER_PROJ_SPEED;

    this.scene.spawnProjectile({
      x: this.x + this.facingDir * 10,
      y: this.y - 4,
      vx, vy,
      texture: 'acid_blob',
      dmg: this.dmg,
      owner: 'enemy',
      tint: 0x88ff44,
      lifespan: 2000,
    });

    this.scene._audio.playSfx('sfx_spit');
  }

  onHit(damage, source) {
    if (!this.alive) return;
    this.hp -= damage;
    this.sprite.setTint(0xffffff);
    this.later(80, () => this.sprite.clearTint());

    this._staggerHits++;
    const kbDir = source ? Math.sign(this.x - source.x) || 1 : -this.facingDir;
    this.body.setVelocity(kbDir * 100, -40);

    if (this._staggerHits >= 2) this._setState('stun');
    if (this.hp <= 0) this._die();
  }

  _die() {
    if (!this.alive) return;
    this.alive = false;
    this.body.setEnable(false);
    AnimationManager.playThen(this.sprite, 'spitter_death', () => {
      this.scene.spawnGeo(this.x, this.y, this.geoReward);
      this.destroy();
    });
    this.scene._audio.playSfx('sfx_enemy_die');
    this.scene._particles.hitBurst({ x: this.x, y: this.y, colour: 0xaaffaa });
  }

  _play(name) {
    AnimationManager.safePlay(this.sprite, `spitter_${name}`);
  }
}


/* ── Flying Scout ─────────────────────────────────────────────────────────── */
class FlyingScout extends Entity {
  constructor(scene, x, y, data = {}) {
    super(scene, x, y, 'flying_scout', 0);

    this.hp         = C.FLYING_HP;
    this.dmg        = C.FLYING_DMG;
    this.geoReward  = data.geoReward ?? 3;

    this._homeX     = x;
    this._homeY     = y;
    this._aiState   = 'patrol';
    this._aiTimer   = 0;
    this._retreatCd = 0;
    this._aggroRange= 140;
    this._diveActive= false;
    this._hitPlayer = false;

    this.setSize(14, 14, 9, 9);
    this.sprite.setGravityY(0);    // flying — no gravity
    this.body.setAllowGravity(false);
    this._play('fly');

    // Gentle hovering sine offset
    this._hoverT = Math.random() * Math.PI * 2;
  }

  update(dt) {
    if (!this.alive) return;
    this._aiTimer  -= dt;
    this._retreatCd-= dt;
    this._hoverT   += dt * 2;

    switch (this._aiState) {
      case 'patrol':  this._aiPatrol(dt);  break;
      case 'aggro':   this._aiAggro(dt);   break;
      case 'dive':    this._aiDive(dt);    break;
      case 'retreat': this._aiRetreat(dt); break;
      case 'stun':    this._aiStun(dt);    break;
    }
  }

  _aiPatrol(dt) {
    // Figure-8 hover around home position
    const tx = this._homeX + Math.cos(this._hoverT * 0.6) * 40;
    const ty = this._homeY + Math.sin(this._hoverT * 0.8) * 20;
    this._moveTo(tx, ty, C.FLYING_SPEED * 0.5, dt);

    // Detect player
    const player = this.scene.knight;
    if (player) {
      const dist = Math.hypot(player.x - this.x, player.y - this.y);
      if (dist < this._aggroRange) this._setState('aggro');
    }
  }

  _aiAggro(dt) {
    const player = this.scene.knight;
    if (!player) { this._setState('patrol'); return; }

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > this._aggroRange * 1.5) { this._setState('patrol'); return; }

    // Position above player, then dive
    const targetX = player.x;
    const targetY = player.y - 50;
    this._moveTo(targetX, targetY, C.FLYING_SPEED, dt);

    if (Math.abs(dx) < 20 && this.y < player.y - 30 && this._retreatCd <= 0) {
      this._setState('dive');
    }
  }

  _aiDive(dt) {
    this.body.setVelocityY(C.FLYING_DIVE_SPEED);

    const player = this.scene.knight;
    if (player && !this._hitPlayer) {
      const dx = Math.abs(player.x - this.x);
      const dy = Math.abs(player.y - this.y);
      if (dx < 14 && dy < 16) {
        player.onHit(this.dmg, this);
        this._hitPlayer = true;
      }
    }

    // Hit ground or gone far enough → retreat
    if (this.body.blocked.down || this._aiTimer <= 0) {
      this._hitPlayer = false;
      this._retreatCd = C.FLYING_RETREAT_CD;
      this._setState('retreat');
    }
  }

  _aiRetreat(dt) {
    this._moveTo(this._homeX, this._homeY - 30, C.FLYING_SPEED * 1.2, dt);

    const dist = Math.hypot(this._homeX - this.x, (this._homeY - 30) - this.y);
    if (dist < 20) this._setState('patrol');
  }

  _aiStun(dt) {
    if (this._aiTimer <= 0) this._setState('patrol');
  }

  _moveTo(tx, ty, spd, dt) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const vx = (dx / dist) * spd;
    const vy = (dy / dist) * spd;
    this.body.setVelocity(vx, vy);
    this.sprite.setFlipX(vx < 0);
  }

  _setState(next) {
    this._aiState = next;
    switch (next) {
      case 'patrol':  this._play('fly');     break;
      case 'aggro':   this._play('fly');     break;
      case 'dive':
        this._aiTimer = 0.6;
        this._play('dive');
        break;
      case 'retreat':
        this._aiTimer = 1.2;
        this._play('recover');
        break;
      case 'stun':
        this._aiTimer = 0.5;
        this.body.setVelocity(0, 0);
        this._play('hit');
        break;
    }
  }

  onHit(damage, source) {
    if (!this.alive) return;
    this.hp -= damage;
    this.sprite.setTint(0xffffff);
    this.later(80, () => this.sprite.clearTint());

    const kbDir = source ? Math.sign(this.x - source.x) : 1;
    this.body.setVelocity(kbDir * 80, -60);

    if (this.hp <= 0) this._die();
    else this._setState('stun');
  }

  _die() {
    if (!this.alive) return;
    this.alive = false;
    this.body.setEnable(false);
    this.body.setAllowGravity(true);
    AnimationManager.playThen(this.sprite, 'flying_scout_death', () => {
      this.scene.spawnGeo(this.x, this.y, this.geoReward);
      this.destroy();
    });
    this.scene._audio.playSfx('sfx_enemy_die');
    this.scene._particles.hitBurst({ x: this.x, y: this.y, colour: 0xaaddff });
  }

  _play(name) {
    AnimationManager.safePlay(this.sprite, `flying_scout_${name}`);
  }
}
