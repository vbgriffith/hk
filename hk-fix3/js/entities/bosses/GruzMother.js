/* js/entities/bosses/GruzMother.js — Large flying boss that spawns babies */
'use strict';

class GruzMother extends Entity {
  constructor(scene, x, y, data = {}) {
    super(scene, x, y, 'gruz_mother', 0);

    this.hp        = C.GRUZ_MOTHER_HP;
    this.maxHp     = C.GRUZ_MOTHER_HP;
    this.dmg       = C.GRUZ_MOTHER_DMG;
    this.geoReward = data.geoReward ?? 90;
    this.id        = data.id ?? 'boss_gruz_mother';

    this._aiState    = 'intro';
    this._aiTimer    = 0;
    this._chargeDir  = 1;
    this._charges    = 0;
    this._phase      = 1;
    this._bossStarted= false;
    this._defeated   = false;
    this._babies     = [];

    this.setSize(44, 44, 10, 10);
    this.sprite.setDepth(C.LAYER_ENTITY + 2);
    this.body.setAllowGravity(false);

    this._play('idle');
  }

  update(dt) {
    if (!this.alive || this._defeated) return;
    this._aiTimer -= dt;

    const player = this.scene.knight;
    if (!this._bossStarted && player) {
      if (Math.abs(player.x - this.x) < 300) this._startBoss();
    }
    if (!this._bossStarted) return;

    // Update babies
    this._babies = this._babies.filter(b => b.alive);
    this._babies.forEach(b => b.update(dt));

    switch (this._aiState) {
      case 'hover':  this._aiHover(dt, player);  break;
      case 'charge': this._aiCharge(dt, player); break;
      case 'spawn':  this._aiSpawn(dt);          break;
      case 'roar':   this._aiRoar(dt);           break;
    }
  }

  _startBoss() {
    this._bossStarted = true;
    this._setState('roar');
    this.scene._hud?.showBossBar('Gruz Mother', this.hp, this.maxHp);
    this.scene._audio?.playSfx('sfx_boss_intro');
    this.scene._camera?.shake(6, 400);
    this.scene._bossActive = true;
  }

  _aiHover(dt, player) {
    if (!player) return;
    // Drift slowly toward player's Y level
    const ty = player.y - 60;
    const dy = ty - this.y;
    this.body.setVelocityY(Math.sign(dy) * Math.min(Math.abs(dy) * 0.8, C.GRUZ_MOTHER_SPEED));

    // Oscillate horizontally
    this.body.setVelocityX(Math.sin(Date.now() / 800) * 30);

    if (this._aiTimer <= 0) {
      // Roll attack: 60% charge, 40% spawn
      if (Math.random() < 0.6 || this._charges < 1) {
        this._setState('charge');
      } else {
        this._setState('spawn');
      }
    }
  }

  _aiCharge(dt, player) {
    if (!player) { this._setState('hover'); return; }

    if (this._aiTimer > 0) {
      // Wind-up drift
      const tx = player.x, ty = player.y;
      const dx = tx - this.x, dy = ty - this.y;
      const dist = Math.hypot(dx, dy) || 1;
      this.body.setVelocity((dx / dist) * 40, (dy / dist) * 40);
      return;
    }

    // Full charge
    const dx = player.x - this.x, dy = player.y - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    const spd  = this._phase === 2 ? C.GRUZ_MOTHER_CHARGE_SPD * 1.3 : C.GRUZ_MOTHER_CHARGE_SPD;
    this.body.setVelocity((dx / dist) * spd, (dy / dist) * spd);

    // Hit check
    if (player) {
      const cdx = Math.abs(player.x - this.x);
      const cdy = Math.abs(player.y - this.y);
      if (cdx < 30 && cdy < 30 && !this._chargeHit) {
        player.onHit(this.dmg, this);
        this._chargeHit = true;
      }
    }

    this._charges++;
    if (this._aiTimer <= -0.5) {
      this._chargeHit = false;
      if (this._charges >= (this._phase === 2 ? 4 : 3)) {
        this._charges = 0;
        this._setState('spawn');
      } else {
        this._setState('hover');
      }
    }
  }

  _aiSpawn(dt) {
    this.body.setVelocity(0, 0);
    if (this._aiTimer <= 0) {
      const count = this._phase === 2 ? C.GRUZ_MOTHER_BABIES : 4;
      for (let i = 0; i < count; i++) {
        this.later(i * 100, () => this._spawnBaby());
      }
      this._setState('hover');
    }
  }

  _aiRoar(dt) {
    this.body.setVelocity(0, 0);
    if (this._aiTimer <= 0) this._setState('hover');
  }

  _spawnBaby() {
    const b = new GruzBaby(this.scene, this.x, this.y);
    this._babies.push(b);
    this.scene.physics.add.collider(b.sprite, this.scene._platforms);
    // Register nail hit
    const overlap = this.scene.physics.add.overlap(
      this.scene.knight.sprite, b.sprite, () => {
        if (b.alive) b.onHit(C.KNIGHT_ATTACK_DMG, null);
      }
    );
  }

  onHit(damage, source) {
    if (!this.alive || this._defeated) return;
    this.hp -= damage;
    this.sprite.setTint(0xffffff);
    this.later(80, () => this.sprite.clearTint());

    const kbDir = source ? Math.sign(this.x - source.x) || 1 : 1;
    this.body.setVelocity(kbDir * 80, -50);

    this.scene._hud?.updateBossBar(this.hp, this.maxHp);

    // Phase 2
    if (this.hp <= C.GRUZ_MOTHER_HP / 2 && this._phase === 1) {
      this._phase = 2;
      this.dmg *= 1.2;
      this.sprite.setTint(0xff8800);
      this.scene.time.delayedCall(400, () => this.sprite.clearTint());
    }

    if (this.hp <= 0) this._die();
  }

  _die() {
    if (this._defeated) return;
    this._defeated = true;
    this.alive = false;
    this.body.setEnable(false);
    this.scene._bossActive = false;
    this._babies.forEach(b => b.alive && b.destroy());

    this.scene._camera?.shake(14, 800);
    this.scene._audio?.playSfx('sfx_boss_die');
    this.scene._particles?.hitBurst({ x: this.x, y: this.y, count: 25, colour: 0xaa88ff });

    AnimationManager.playThen(this.sprite, 'gruz_mother_death', () => {
      this.scene._hud?.hideBossBar();
      this.scene.spawnGeo(this.x, this.y, this.geoReward);
      (this.scene._save.flags || (this.scene._save.flags = {}))[this.id] = true;
      this.scene._save.itemsCollected.push(this.id);
      SaveSystem.save(this.scene._buildSaveData());
      this.destroy();
    });
  }

  _setState(next) {
    this._aiState = next;
    switch (next) {
      case 'hover':  this._aiTimer = 1.8; this._play('fly');    break;
      case 'charge': this._aiTimer = 0.5; this._play('charge'); break;
      case 'spawn':  this._aiTimer = 0.8; this._play('fly');    break;
      case 'roar':   this._aiTimer = 1.5; this._play('fly');    break;
    }
  }

  _play(name) { AnimationManager.safePlay(this.sprite, `gruz_mother_${name}`); }
}

/* ── Gruz Baby ───────────────────────────────────────────────────────────── */
class GruzBaby extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, 'gruz_mother', 500); // use baby row
    this.hp  = 8;
    this.dmg = 8;
    this.setSize(10, 10, 7, 7);
    this.body.setAllowGravity(true);

    // Launch in random arc
    const angle = Phaser.Math.Between(-180, 0) * (Math.PI / 180);
    this.body.setVelocity(Math.cos(angle) * 140, Math.sin(angle) * 140);

    AnimationManager.safePlay(this.sprite, 'gruz_mother_baby');
    this.later(4000, () => { if (this.alive) this.destroy(); });
  }

  update(dt) {
    if (!this.alive) return;
    const player = this.scene.knight;
    if (!player) return;
    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    if (dist < 14) {
      player.onHit(this.dmg, this);
      this.destroy();
    }
  }

  onHit(dmg) {
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.scene._particles?.hitBurst({ x: this.x, y: this.y, count: 5 });
      this.scene.spawnGeo(this.x, this.y, 1);
      this.destroy();
    }
  }
}


/* ── Vengefly King ────────────────────────────────────────────────────────── */
class VengeflyKing extends Entity {
  constructor(scene, x, y, data = {}) {
    super(scene, x, y, 'vengefly_king', 0);

    this.hp        = C.VENGEFLY_KING_HP;
    this.maxHp     = C.VENGEFLY_KING_HP;
    this.dmg       = C.VENGEFLY_KING_DMG;
    this.geoReward = data.geoReward ?? 80;
    this.id        = data.id ?? 'boss_vengefly_king';

    this._aiState    = 'patrol';
    this._aiTimer    = 0;
    this._summonCd   = 0;
    this._summons    = [];
    this._bossStarted= false;
    this._defeated   = false;
    this._homeX      = x;
    this._homeY      = y;
    this._chargeTarget = null;

    this.setSize(28, 28, 6, 6);
    this.sprite.setDepth(C.LAYER_ENTITY + 2);
    this.body.setAllowGravity(false);
    this._play('fly');
  }

  update(dt) {
    if (!this.alive || this._defeated) return;
    this._aiTimer -= dt;
    this._summonCd -= dt;

    const player = this.scene.knight;
    if (!this._bossStarted && player && Math.abs(player.x - this.x) < 280) {
      this._bossStarted = true;
      this.scene._hud?.showBossBar('Vengefly King', this.hp, this.maxHp);
      this.scene._bossActive = true;
    }
    if (!this._bossStarted) return;

    // Hover sine
    this._hoverT = (this._hoverT || 0) + dt * 1.5;
    this.sprite.y = this._homeY + Math.sin(this._hoverT) * 15;

    switch (this._aiState) {
      case 'patrol':  this._doPatrol(dt, player);  break;
      case 'charge':  this._doCharge(dt, player);  break;
      case 'summon':  this._doSummon(dt);          break;
      case 'retreat': this._doRetreat(dt);         break;
    }
  }

  _doPatrol(dt, player) {
    if (!player) return;
    const tx = player.x + 60 * Math.sign(this._homeX - player.x);
    const dy = (player.y - 80) - this.sprite.y;
    this.body.setVelocityX(Math.sign(tx - this.x) * C.VENGEFLY_KING_SPEED * 0.5);
    this.body.setVelocityY(Math.sign(dy) * 40);

    if (this._summonCd <= 0 && this._summons.filter(s => s.alive).length < 3) {
      this._setState('summon');
      return;
    }
    if (this._aiTimer <= 0) {
      this._setState('charge');
    }
  }

  _doCharge(dt, player) {
    if (!player) { this._setState('patrol'); return; }
    if (!this._chargeTarget) {
      this._chargeTarget = { x: player.x, y: player.y };
      const dx = this._chargeTarget.x - this.x;
      const dy = this._chargeTarget.y - this.sprite.y;
      const dist = Math.hypot(dx, dy) || 1;
      const spd = C.VENGEFLY_KING_SPEED * 2.2;
      this.body.setVelocity((dx / dist) * spd, (dy / dist) * spd);
    }

    const dx = Math.abs(player.x - this.x);
    const dy = Math.abs(player.y - this.sprite.y);
    if (dx < 22 && dy < 22) {
      player.onHit(this.dmg, this);
    }

    if (this._aiTimer <= 0) {
      this._chargeTarget = null;
      this._setState('retreat');
    }
  }

  _doSummon(dt) {
    this.body.setVelocity(0, 0);
    if (this._aiTimer <= 0) {
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        const sv = new Vengefly(this.scene, this.x + (i - 0.5) * 40, this.sprite.y, {});
        this._summons.push(sv);
        this.scene._enemies.push(sv);
        this.scene.physics.add.collider(sv.sprite, this.scene._platforms);
        this.scene.registerNailHit(sv._makeHitbox?.() ?? sv.sprite);
      }
      this._summonCd = C.VENGEFLY_KING_SUMMON_CD;
      this._setState('patrol');
    }
  }

  _doRetreat(dt) {
    const tx = this._homeX, ty = this._homeY;
    const dx = tx - this.x, dy = ty - this.sprite.y;
    const dist = Math.hypot(dx, dy) || 1;
    this.body.setVelocity((dx / dist) * 100, (dy / dist) * 100);
    if (dist < 20 || this._aiTimer <= 0) this._setState('patrol');
  }

  _setState(next) {
    this._aiState = next;
    this._chargeTarget = null;
    switch (next) {
      case 'patrol':  this._aiTimer = 2.5; this._play('fly');    break;
      case 'charge':  this._aiTimer = 0.6; this._play('charge'); break;
      case 'summon':  this._aiTimer = 1.0; this._play('summon'); break;
      case 'retreat': this._aiTimer = 1.2; this._play('fly');    break;
    }
  }

  onHit(damage, source) {
    if (!this.alive || this._defeated) return;
    this.hp -= damage;
    this.sprite.setTint(0xffffff);
    this.later(80, () => this.sprite.clearTint());
    this.scene._hud?.updateBossBar(this.hp, this.maxHp);
    if (this.hp <= 0) this._die();
  }

  _die() {
    if (this._defeated) return;
    this._defeated = true; this.alive = false;
    this.body.setEnable(false);
    this.scene._bossActive = false;
    this._summons.forEach(s => s.alive && s.destroy());
    this.scene._camera?.shake(10, 600);
    AnimationManager.playThen(this.sprite, 'vengefly_king_death', () => {
      this.scene._hud?.hideBossBar();
      this.scene.spawnGeo(this.x, this.y, this.geoReward);
      (this.scene._save.flags || (this.scene._save.flags = {}))[this.id] = true;
      this.scene._save.itemsCollected.push(this.id);
      this.destroy();
    });
  }

  _play(name) { AnimationManager.safePlay(this.sprite, `vengefly_king_${name}`); }
}
