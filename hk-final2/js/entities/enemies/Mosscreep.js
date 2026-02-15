/* js/entities/enemies/Mosscreep.js — Moss-covered ground patrol enemy */
'use strict';

class Mosscreep extends Entity {
  constructor(scene, x, y, data = {}) {
    super(scene, x, y, 'mosscreep', 0);

    this.hp        = C.MOSSCREEP_HP;
    this.dmg       = C.MOSSCREEP_DMG;
    this.geoReward = data.geoReward ?? 5;

    this.facingDir   = data.dir ?? 1;
    this.patrolLeft  = data.patrolLeft  ?? x - 90;
    this.patrolRight = data.patrolRight ?? x + 90;

    this._aiState  = 'walk';
    this._aiTimer  = 0;
    this._turnCd   = 0;
    this._attackCd = 0;

    this.setSize(18, 14, 5, 7);
    this.sprite.setGravityY(C.GRAVITY);
    this._play('walk');
  }

  update(dt) {
    if (!this.alive) return;
    this._aiTimer -= dt;
    this._attackCd -= dt;
    this._turnCd   -= dt;

    switch (this._aiState) {
      case 'walk':   this._aiWalk(dt);   break;
      case 'turn':   this._aiTurn(dt);   break;
      case 'attack': this._aiAttack(dt); break;
      case 'stun':   this._aiStun(dt);   break;
    }

    this.sprite.setFlipX(this.facingDir < 0);
  }

  _aiWalk(dt) {
    this.body.setVelocityX(this.facingDir * C.MOSSCREEP_SPEED);

    const atLeft  = this.x <= this.patrolLeft  || this.body.blocked.left;
    const atRight = this.x >= this.patrolRight || this.body.blocked.right;

    if ((atLeft && this.facingDir < 0) || (atRight && this.facingDir > 0)) {
      if (this._turnCd <= 0) {
        this._aiState = 'turn'; this._aiTimer = 0.4;
        this.body.setVelocityX(0); this._play('turn');
        return;
      }
    }

    const player = this.scene.knight;
    if (player && this._attackCd <= 0) {
      const dx = player.x - this.x, dy = player.y - this.y;
      if (Math.abs(dx) < 50 && Math.abs(dy) < 18 && Math.sign(dx) === this.facingDir) {
        this._setState('attack');
      }
    }
  }

  _aiTurn(dt) {
    this.body.setVelocityX(0);
    if (this._aiTimer <= 0) {
      this.facingDir *= -1;
      this._turnCd = 2.0;
      this._setState('walk');
    }
  }

  _aiAttack(dt) {
    this.body.setVelocityX(this.facingDir * C.MOSSCREEP_SPEED * 2.2);
    const player = this.scene.knight;
    if (player && !this._hitPlayer) {
      if (Math.abs(player.x - this.x) < 28 && Math.abs(player.y - this.y) < 18) {
        player.onHit(this.dmg, this);
        this._hitPlayer = true;
      }
    }
    if (this._aiTimer <= 0) {
      this._hitPlayer = false;
      this._attackCd = 1.8;
      this._setState('walk');
    }
  }

  _aiStun(dt) {
    this.body.setVelocityX(0);
    if (this._aiTimer <= 0) this._setState('walk');
  }

  _setState(next) {
    this._aiState = next;
    this._hitPlayer = false;
    switch (next) {
      case 'walk':   this._play('walk');   this._aiTimer = 0; break;
      case 'turn':   this._play('turn');   this._aiTimer = 0.4; break;
      case 'attack': this._play('attack'); this._aiTimer = 0.45; break;
      case 'stun':   this._play('walk');   this._aiTimer = 0.4; break;
    }
  }

  onHit(damage, source) {
    if (!this.alive) return;
    this.hp -= damage;
    this.sprite.setTint(0xffffff);
    this.later(80, () => this.sprite.clearTint());

    const kbDir = source ? Math.sign(this.x - source.x) : -this.facingDir;
    this.body.setVelocity(kbDir * 100, -50);
    this._setState('stun');

    if (this.hp <= 0) this._die();
  }

  _die() {
    if (!this.alive) return;
    this.alive = false;
    this.body.setEnable(false);
    AnimationManager.playThen(this.sprite, 'mosscreep_death', () => {
      this.scene.spawnGeo(this.x, this.y, this.geoReward);
      this.destroy();
    });
    this.scene._audio?.playSfx('sfx_enemy_die');
    this.scene._particles?.hitBurst({ x: this.x, y: this.y, count: 10, colour: 0x44aa44 });
  }

  _play(n) { AnimationManager.safePlay(this.sprite, `mosscreep_${n}`); }
}


/* ── Vengefly ─────────────────────────────────────────────────────────────── */
class Vengefly extends Entity {
  constructor(scene, x, y, data = {}) {
    super(scene, x, y, 'vengefly', 0);

    this.hp        = C.VENGEFLY_HP;
    this.dmg       = C.VENGEFLY_DMG;
    this.geoReward = data.geoReward ?? 2;

    this._homeX  = x;
    this._homeY  = y;
    this._aiState= 'patrol';
    this._aiTimer= 0;
    this._hoverT = Math.random() * Math.PI * 2;
    this._retreatCd = 0;
    this._diveHit   = false;
    this._diveTarget= null;

    this.setSize(12, 12, 6, 6);
    this.body.setAllowGravity(false);
    this._play('fly');
  }

  update(dt) {
    if (!this.alive) return;
    this._aiTimer  -= dt;
    this._retreatCd -= dt;
    this._hoverT   += dt * 1.8;

    switch (this._aiState) {
      case 'patrol':  this._doPatrol(dt);  break;
      case 'dive':    this._doDive(dt);    break;
      case 'retreat': this._doRetreat(dt); break;
    }
  }

  _doPatrol(dt) {
    const tx = this._homeX + Math.cos(this._hoverT * 0.5) * 35;
    const ty = this._homeY + Math.sin(this._hoverT * 0.7) * 18;
    const dx = tx - this.x, dy = ty - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    this.body.setVelocity((dx / dist) * 70, (dy / dist) * 70);
    this.sprite.setFlipX(dx < 0);

    const player = this.scene.knight;
    if (!player || this._retreatCd > 0) return;
    const pdx = player.x - this.x, pdy = player.y - this.y;
    const pdist = Math.hypot(pdx, pdy);
    if (pdist < 120 && Math.abs(pdx) < 30 && this.y < player.y) {
      this._diveTarget = { x: player.x, y: player.y };
      this._setState('dive');
    }
  }

  _doDive(dt) {
    if (!this._diveTarget) { this._setState('patrol'); return; }
    const tx = this._diveTarget.x, ty = this._diveTarget.y;
    const dx = tx - this.x, dy = ty - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    this.body.setVelocity((dx / dist) * C.VENGEFLY_SPEED * 1.8, (dy / dist) * C.VENGEFLY_SPEED * 1.8);

    const player = this.scene.knight;
    if (player && !this._diveHit) {
      const pdx = Math.abs(player.x - this.x), pdy = Math.abs(player.y - this.y);
      if (pdx < 14 && pdy < 14) {
        player.onHit(this.dmg, this);
        this._diveHit = true;
      }
    }

    if (dist < 20 || this._aiTimer <= 0) {
      this._diveHit   = false;
      this._diveTarget = null;
      this._retreatCd = 1.8;
      this._setState('retreat');
    }
  }

  _doRetreat(dt) {
    const tx = this._homeX, ty = this._homeY - 20;
    const dx = tx - this.x, dy = ty - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    this.body.setVelocity((dx / dist) * 120, (dy / dist) * 120);
    if (dist < 20 || this._aiTimer <= 0) this._setState('patrol');
  }

  _setState(next) {
    this._aiState = next;
    switch (next) {
      case 'patrol':  this._aiTimer = 0;   this._play('fly');  break;
      case 'dive':    this._aiTimer = 0.7; this._play('dive'); break;
      case 'retreat': this._aiTimer = 1.0; this._play('fly');  break;
    }
  }

  onHit(damage, source) {
    if (!this.alive) return;
    this.hp -= damage;
    const kbDir = source ? Math.sign(this.x - source.x) : 1;
    this.body.setVelocity(kbDir * 80, -60);
    if (this.hp <= 0) this._die();
  }

  _die() {
    if (!this.alive) return;
    this.alive = false;
    this.body.setEnable(false);
    this.body.setAllowGravity(true);
    AnimationManager.playThen(this.sprite, 'vengefly_death', () => {
      this.scene.spawnGeo(this.x, this.y, this.geoReward);
      this.destroy();
    });
    this.scene._audio?.playSfx('sfx_enemy_die');
  }

  _play(n) { AnimationManager.safePlay(this.sprite, `vengefly_${n}`); }
}


/* ── Aspid (Acid spitter, Greenpath variant) ─────────────────────────────── */
class Aspid extends Entity {
  constructor(scene, x, y, data = {}) {
    super(scene, x, y, 'aspid', 0);

    this.hp        = C.ASPID_HP;
    this.dmg       = C.ASPID_DMG;
    this.geoReward = data.geoReward ?? 4;
    this.facingDir = data.dir ?? 1;

    this._aiState  = 'idle';
    this._aiTimer  = 0;
    this._shootCd  = 2.5;

    this.setSize(16, 14, 6, 7);
    this.sprite.setGravityY(C.GRAVITY);
    this._play('idle');
  }

  update(dt) {
    if (!this.alive) return;
    this._aiTimer -= dt;
    this._shootCd -= dt;

    const player = this.scene.knight;
    if (!player) return;

    const dist = Math.hypot(player.x - this.x, player.y - this.y);

    // Aggro: shoot when player in range
    if (dist < 160 && this._shootCd <= 0 && this._aiState !== 'shoot') {
      this.facingDir = Math.sign(player.x - this.x);
      this._setState('shoot');
    }

    if (this._aiState === 'idle' && this._aiTimer <= 0) {
      // Slow walk
      this._setState('walk');
    } else if (this._aiState === 'walk') {
      this.body.setVelocityX(this.facingDir * 30);
      if (this._aiTimer <= 0) this._setState('idle');
    } else if (this._aiState === 'shoot') {
      this.body.setVelocityX(0);
      if (this._aiTimer <= 0) {
        this._fireAspidSpray(player);
        this._shootCd = 2.0;
        this._setState('idle');
      }
    }

    this.sprite.setFlipX(this.facingDir < 0);
  }

  _fireAspidSpray(player) {
    // Fire 3 spread projectiles
    const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    for (let i = -1; i <= 1; i++) {
      const angle = baseAngle + i * 0.28;
      const spd   = 140;
      this.scene.spawnProjectile({
        x: this.x + this.facingDir * 10, y: this.y - 4,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        texture: 'acid_blob',
        dmg: this.dmg,
        owner: 'enemy',
        tint: 0x88ff44,
        lifespan: 1600,
      });
    }
    this.scene._audio?.playSfx('sfx_spit');
  }

  _setState(next) {
    this._aiState = next;
    switch (next) {
      case 'idle':  this._aiTimer = 0.8; this._play('idle'); break;
      case 'walk':  this._aiTimer = 1.2; this._play('walk'); break;
      case 'shoot': this._aiTimer = 0.5; this._play('shoot'); break;
    }
  }

  onHit(damage, source) {
    if (!this.alive) return;
    this.hp -= damage;
    this.sprite.setTint(0xffffff);
    this.later(80, () => this.sprite.clearTint());
    if (this.hp <= 0) this._die();
  }

  _die() {
    if (!this.alive) return;
    this.alive = false;
    this.body.setEnable(false);
    AnimationManager.playThen(this.sprite, 'aspid_death', () => {
      this.scene.spawnGeo(this.x, this.y, this.geoReward);
      this.destroy();
    });
    this.scene._audio?.playSfx('sfx_enemy_die');
    this.scene._particles?.hitBurst({ x: this.x, y: this.y, colour: 0xaaff44 });
  }

  _play(n) { AnimationManager.safePlay(this.sprite, `aspid_${n}`); }
}
