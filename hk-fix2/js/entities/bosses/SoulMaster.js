/* js/entities/bosses/SoulMaster.js */
'use strict';

class SoulMaster extends Entity {
  constructor(scene, x, y, data = {}) {
    super(scene, x, y, 'soul_master', 0);
    this.hp        = 300;
    this.maxHp     = 300;
    this.dmg       = 20;
    this.geoReward = data.geoReward ?? 200;
    this.id        = data.id ?? 'boss_soul_master';

    this._phase      = 1;
    this._aiState    = 'intro';
    this._aiTimer    = 0;
    this._attackCount= 0;
    this._bossStarted= false;
    this._defeated   = false;
    this._teleportCd = 0;
    this._orbGroup   = [];

    this.setSize(22, 40, 11, 8);
    this.sprite.setDepth(C.LAYER_ENTITY + 2);
    this.body.setAllowGravity(false);
    this._play('float');
  }

  update(dt) {
    if (!this.alive || this._defeated) return;
    this._aiTimer  -= dt;
    this._teleportCd -= dt;

    // Hover bob
    this._hoverT = (this._hoverT || 0) + dt * 1.2;
    if (this._aiState !== 'teleport' && this._aiState !== 'slam') {
      this.sprite.y += Math.sin(this._hoverT) * 0.4;
    }

    const player = this.scene.knight;
    if (!this._bossStarted && player && Math.abs(player.x - this.x) < 360) {
      this._startBoss();
    }
    if (!this._bossStarted) return;

    this._orbGroup = this._orbGroup.filter(o => o.alive);

    switch (this._aiState) {
      case 'idle':      this._doIdle(dt, player);      break;
      case 'float':     this._doFloat(dt, player);     break;
      case 'orb_shot':  this._doOrbShot(dt, player);   break;
      case 'teleport':  this._doTeleport(dt, player);  break;
      case 'slam':      this._doSlam(dt, player);      break;
      case 'p2_burst':  this._doP2Burst(dt, player);   break;
      case 'stagger':   this._doStagger(dt);           break;
      case 'roar':      this._doRoar(dt);              break;
    }
    this.sprite.setFlipX((player?.x ?? this.x) < this.x);
  }

  _startBoss() {
    this._bossStarted = true;
    this.scene._hud?.showBossBar('Soul Master', this.hp, this.maxHp);
    this.scene._bossActive = true;
    this._setState('roar');
    this.scene._camera?.flash(0xffffff, 300);
  }

  _doIdle(dt, player) {
    this.body.setVelocity(0, 0);
    if (this._aiTimer <= 0) this._chooseAttack(player);
  }

  _doFloat(dt, player) {
    if (!player) return;
    const tx = player.x + (Math.sign(this.x - player.x) || 1) * 100;
    const ty = player.y - 70;
    const dx = tx - this.x, dy = ty - this.y;
    const spd = 60;
    this.body.setVelocity(
      Math.sign(dx) * Math.min(Math.abs(dx) * 2, spd),
      Math.sign(dy) * Math.min(Math.abs(dy) * 2, spd)
    );
    if (this._aiTimer <= 0) this._chooseAttack(player);
  }

  _doOrbShot(dt, player) {
    this.body.setVelocity(0, 0);
    if (this._aiTimer <= 0) {
      if (!this._shotDone) {
        this._shotDone = true;
        const count = this._phase === 2 ? 5 : 3;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const spd   = this._phase === 2 ? 130 : 100;
          this.scene.spawnProjectile({
            x: this.x, y: this.y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            texture: 'soul_orb', dmg: this.dmg,
            owner: 'enemy', tint: 0xeeeeff, lifespan: 3000,
          });
        }
        this.scene._audio?.playSfx('sfx_spit');
        this._aiTimer = 1.2;
      } else {
        this._shotDone = false;
        this._setState('float');
      }
    }
  }

  _doTeleport(dt, player) {
    this.body.setVelocity(0, 0);
    if (this._aiTimer <= 0) {
      if (!this._tpDone) {
        this._tpDone = true;
        this.sprite.setAlpha(0);
        // Teleport to random position near player
        const W = this.scene._worldBounds?.right ?? C.WIDTH;
        const H = this.scene._worldBounds?.bottom ?? C.HEIGHT;
        const nx = Phaser.Math.Between(60, W - 60);
        const ny = Phaser.Math.Between(50, H - 80);
        this.sprite.setPosition(nx, ny);
        this.scene.tweens.add({ targets: this.sprite, alpha: 1, duration: 200 });
        this.scene._particles?.burst({ x: nx, y: ny, count: 8, tint: 0xaaaaff });
        this._aiTimer = 0.5;
      } else {
        this._tpDone = false;
        this._setState('orb_shot');
      }
    }
  }

  _doSlam(dt, player) {
    if (!player) { this._setState('float'); return; }
    if (!this._slamStarted) {
      this._slamStarted = true;
      // Line up above player
      this.sprite.setPosition(player.x, 20);
      this.body.setVelocity(0, 0);
      this._aiTimer = 0.4;
      return;
    }
    if (this._aiTimer > 0) return;

    // Dive
    this.body.setVelocity(0, 400);
    this.body.setAllowGravity(false);

    const dy = Math.abs(this.y - (player?.y ?? 200));
    if (dy < 30 || this._aiTimer <= -1.0) {
      this.scene._camera?.shake(8, 300);
      this.scene._particles?.burst({ x: this.x, y: this.y, count: 12, tint: 0xffffff });
      if (player && Math.abs(player.x - this.x) < 40) player.onHit(this.dmg * 1.4, this);
      this.body.setVelocity(0, 0);
      this._slamStarted = false;
      this._setState('float');
    }
  }

  _doP2Burst(dt, player) {
    this.body.setVelocity(0, 0);
    if (this._aiTimer <= 0) {
      if (!this._burstDone) {
        this._burstDone = true;
        // Ring of 8 orbs + 4 tracking orbs
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          this.scene.spawnProjectile({
            x: this.x, y: this.y, vx: Math.cos(a)*110, vy: Math.sin(a)*110,
            texture: 'soul_orb', dmg: this.dmg, owner: 'enemy', tint: 0xffffff, lifespan: 2500,
          });
        }
        if (player) {
          const dx = player.x - this.x, dy = player.y - this.y;
          const dist = Math.hypot(dx, dy) || 1;
          this.scene.spawnProjectile({
            x: this.x, y: this.y, vx: (dx/dist)*140, vy: (dy/dist)*140,
            texture: 'soul_orb', dmg: this.dmg, owner: 'enemy', tint: 0x8888ff, lifespan: 2000,
          });
        }
        this._aiTimer = 1.5;
      } else {
        this._burstDone = false;
        this._setState('float');
      }
    }
  }

  _doStagger(dt) {
    this.body.setVelocity(0, 0);
    if (this._aiTimer <= 0) {
      if (this.hp <= this.maxHp * 0.4 && this._phase === 1) {
        this._enterPhase2();
      } else {
        this._setState('float');
      }
    }
  }

  _doRoar(dt) {
    this.body.setVelocity(0, 0);
    if (this._aiTimer <= 0) this._setState('float');
  }

  _chooseAttack(player) {
    this._attackCount++;
    const roll = Math.random();
    if (this._phase === 2) {
      if (roll < 0.3)       this._setState('p2_burst');
      else if (roll < 0.55) this._setState('teleport');
      else if (roll < 0.75) this._setState('slam');
      else                  this._setState('orb_shot');
    } else {
      if (roll < 0.4)       this._setState('orb_shot');
      else if (roll < 0.65) this._setState('teleport');
      else if (roll < 0.85) this._setState('slam');
      else                  this._setState('float');
    }
  }

  _enterPhase2() {
    this._phase = 2;
    this.dmg *= 1.3;
    this.sprite.setTint(0xaaaaff);
    this.scene.tweens.add({
      targets: this.sprite, scaleX: 1.15, scaleY: 1.15,
      duration: 600, yoyo: true,
    });
    this.scene._camera?.shake(12, 600);
    this.scene._audio?.playSfx('sfx_boss_rage');
    this._setState('roar');
  }

  _setState(next) {
    this._aiState   = next;
    this._shotDone  = false;
    this._tpDone    = false;
    this._slamStarted = false;
    this._burstDone = false;
    switch (next) {
      case 'idle':     this._aiTimer = 0.6;  this._play('float');   break;
      case 'float':    this._aiTimer = 1.8;  this._play('float');   break;
      case 'orb_shot': this._aiTimer = 0.4;  this._play('cast');    break;
      case 'teleport': this._aiTimer = 0.3;  this._play('vanish');  break;
      case 'slam':     this._aiTimer = 0.5;  this._play('slam');    break;
      case 'p2_burst': this._aiTimer = 0.5;  this._play('cast');    break;
      case 'stagger':  this._aiTimer = 1.6;  this._play('stagger'); break;
      case 'roar':     this._aiTimer = 1.8;  this._play('float');   break;
    }
  }

  onHit(damage, source) {
    if (!this.alive || this._defeated) return;
    this.hp -= damage;
    this.sprite.setTint(0xffffff);
    this.later(80, () => { if (this.alive) this.sprite.clearTint(); });
    this.scene._hud?.updateBossBar(this.hp, this.maxHp);
    if (this.hp % 60 < damage) this._setState('stagger');
    if (this.hp <= 0) this._die();
  }

  _die() {
    if (this._defeated) return;
    this._defeated = true; this.alive = false;
    this.body.setEnable(false);
    this.scene._bossActive = false;
    this.scene._camera?.shake(14, 800);
    this.scene._particles?.hitBurst({ x: this.x, y: this.y, count: 24, colour: 0xffffff });
    this.scene._dialogue.show(DIALOGUE.soul_master_defeat, () => {});
    AnimationManager.playThen(this.sprite, 'soul_master_death', () => {
      this.scene._hud?.hideBossBar();
      this.scene.spawnGeo(this.x, this.y, this.geoReward);
      this.scene._save.flags[this.id] = true;
      this.scene._save.itemsCollected.push(this.id);
      SaveSystem.save(this.scene._buildSaveData());
      this.destroy();
    });
  }

  _play(n) { AnimationManager.safePlay(this.sprite, `soul_master_${n}`); }
}
