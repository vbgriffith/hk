/* js/entities/bosses/MantisLords.js */
'use strict';

class MantisLords {
  constructor(scene, x, y, data = {}) {
    this.scene     = scene;
    this.geoReward = data.geoReward ?? 180;
    this.id        = data.id ?? 'boss_mantis_lords';
    this.alive     = true;

    // Three lords: left, centre, right
    this._lords = [
      new MantisLord(scene, x - 110, y, 'lord_a', this),
      new MantisLord(scene, x,       y, 'lord_b', this),
      new MantisLord(scene, x + 110, y, 'lord_c', this),
    ];
    this._phase       = 1;
    this._defeated    = false;
    this._bossStarted = false;
    this._activeLords = [...this._lords];

    // Phase 1: only centre lord active
    this._lords[0].sprite.setVisible(false).setActive(false);
    this._lords[2].sprite.setVisible(false).setActive(false);
    this._lords[0].alive = false;
    this._lords[2].alive = false;
  }

  get sprite() { return this._lords[1].sprite; } // primary sprite for collision

  update(dt) {
    if (!this.alive) return;
    const player = this.scene.knight;

    if (!this._bossStarted && player && Math.abs(player.x - this._lords[1].x) < 350) {
      this._startBoss();
    }
    if (!this._bossStarted) return;

    for (const lord of this._lords) lord.alive && lord.update(dt);

    // Phase transitions
    const alive = this._lords.filter(l => l.alive);
    if (alive.length === 0 && !this._defeated) {
      this._winFight();
    } else if (alive.length === 1 && this._phase === 2 && !this._phaseTransitioning) {
      this._enterPhase3();
    } else if (alive.length === 2 && this._phase === 1 && !this._phaseTransitioning) {
      this._enterPhase2();
    }
  }

  _startBoss() {
    this._bossStarted = true;
    this.scene._hud?.showBossBar('Mantis Lords', this._totalHp(), this._maxHp());
    this.scene._bossActive = true;
    this.scene._dialogue.show(DIALOGUE.mantis_lords_intro, () => {
      this._lords[1]._setState('idle');
    });
  }

  _totalHp() { return this._lords.reduce((s, l) => s + Math.max(l.hp, 0), 0); }
  _maxHp()   { return this._lords.reduce((s, l) => s + l.maxHp, 0); }

  _enterPhase2() {
    this._phase = 2;
    this._phaseTransitioning = true;
    this.scene._camera?.shake(8, 400);
    // Activate left lord
    const left = this._lords[0];
    left.alive = true;
    left.sprite.setVisible(true).setActive(true);
    left._setState('idle');
    this.scene.physics.add.collider(left.sprite, this.scene._platforms);
    this._phaseTransitioning = false;
  }

  _enterPhase3() {
    this._phase = 3;
    this._phaseTransitioning = true;
    this.scene._camera?.shake(8, 400);
    // Activate right lord
    const right = this._lords[2];
    right.alive = true;
    right.sprite.setVisible(true).setActive(true);
    right._setState('idle');
    this.scene.physics.add.collider(right.sprite, this.scene._platforms);
    // Surviving lords get faster
    for (const l of this._lords) if (l.alive) { l._speedMult = 1.4; l.dmg *= 1.2; }
    this._phaseTransitioning = false;
  }

  _winFight() {
    this._defeated = true;
    this.alive     = false;
    this.scene._bossActive = false;
    this.scene._camera?.shake(16, 1000);
    this.scene._dialogue.show(DIALOGUE.mantis_lords_defeat, () => {});
    this.scene._hud?.hideBossBar();
    this.scene.spawnGeo(this._lords[1].x, this._lords[1].y, this.geoReward);
    this.scene._save.flags[this.id] = true;
    this.scene._save.itemsCollected.push(this.id);
    SaveSystem.save(this.scene._buildSaveData());
  }

  onHit(damage, source) {
    // Forwarded from individual lords; update shared boss bar
    this.scene._hud?.updateBossBar(this._totalHp(), this._maxHp());
  }

  destroy() {
    for (const l of this._lords) l.destroy?.();
  }
}

class MantisLord extends Entity {
  constructor(scene, x, y, lordId, parent) {
    super(scene, x, y, 'mantis_lords', 0);
    this.hp       = 120;
    this.maxHp    = 120;
    this.dmg      = 18;
    this._parent  = parent;
    this._lordId  = lordId;
    this._speedMult = 1;

    this._aiState  = 'wait';
    this._aiTimer  = 0;
    this._jumpCd   = 0;
    this._slashCd  = 0;
    this._lungeDir = 1;
    this._hitPlayer= false;

    this.setSize(20, 34, 10, 7);
    this.sprite.setDepth(C.LAYER_ENTITY + 2);
    this._play('idle');
  }

  update(dt) {
    if (!this.alive) return;
    this._aiTimer -= dt;
    this._jumpCd  -= dt;
    this._slashCd -= dt;

    const player = this.scene.knight;
    if (!player) return;

    this.sprite.setFlipX(player.x < this.x);

    switch (this._aiState) {
      case 'idle':   this._doIdle(dt, player);  break;
      case 'walk':   this._doWalk(dt, player);  break;
      case 'jump':   this._doJump(dt, player);  break;
      case 'slash':  this._doSlash(dt, player); break;
      case 'lunge':  this._doLunge(dt, player); break;
      case 'wait':   break;
    }
  }

  _doIdle(dt, player) {
    this.body.setVelocityX(0);
    if (this._aiTimer <= 0) {
      const dx = player.x - this.x;
      const absDx = Math.abs(dx);
      const roll = Math.random();
      if (absDx < 80 && this._slashCd <= 0 && roll < 0.4)  this._setState('slash');
      else if (this._jumpCd <= 0 && roll < 0.6)             this._setState('jump');
      else                                                    this._setState('walk');
    }
  }

  _doWalk(dt, player) {
    const dir = Math.sign(player.x - this.x) || 1;
    this.body.setVelocityX(dir * 70 * this._speedMult);
    if (this._aiTimer <= 0) this._setState('idle');
  }

  _doJump(dt, player) {
    if (!this._jumped) {
      this._jumped = true;
      const dir = Math.sign(player.x - this.x) || 1;
      this.body.setVelocity(dir * 140 * this._speedMult, -420);
      this._lungeDir = dir;
    }
    // Mid-air slash when near player
    if (this.body.blocked.down) {
      this._jumped = false;
      this._jumpCd = 1.2;
      this._setState('idle');
    }
    // Contact damage in air
    const player_ = this.scene.knight;
    if (player_ && !this._hitPlayer) {
      if (Math.abs(player_.x - this.x) < 24 && Math.abs(player_.y - this.y) < 30) {
        player_.onHit(this.dmg, this);
        this._hitPlayer = true;
      }
    }
    if (this.body.blocked.down) this._hitPlayer = false;
  }

  _doSlash(dt, player) {
    this.body.setVelocityX(0);
    if (!this._slashFired && this._aiTimer <= 0) {
      this._slashFired = true;
      const dir = Math.sign(player.x - this.x) || 1;
      // Wide slash
      const bx = this.x + dir * 30, by = this.y;
      const zone = this.scene.physics.add.staticImage(bx, by, '__DEFAULT');
      zone.setSize(50, 30).setVisible(false);
      const ol = this.scene.physics.add.overlap(this.scene.knight.sprite, zone, () => {
        this.scene.knight.onHit(this.dmg, this);
        ol.destroy(); zone.destroy();
      });
      this.scene.time.delayedCall(250, () => { ol?.destroy(); zone?.active && zone.destroy(); });
      this._slashCd = 1.5;
      this._aiTimer = 0.4;
    } else if (this._slashFired && this._aiTimer <= 0) {
      this._slashFired = false;
      this._setState('idle');
    }
  }

  _doLunge(dt, player) {
    this.body.setVelocityX(this._lungeDir * 220 * this._speedMult);
    if (this.scene.knight && !this._hitPlayer) {
      if (Math.abs(this.scene.knight.x - this.x) < 28) {
        this.scene.knight.onHit(this.dmg, this);
        this._hitPlayer = true;
      }
    }
    if (this.body.blocked.left || this.body.blocked.right || this._aiTimer <= 0) {
      this._hitPlayer = false;
      this._setState('idle');
    }
  }

  _setState(next) {
    this._aiState = next;
    this._jumped  = false;
    switch (next) {
      case 'idle':  this._aiTimer = 0.5 / this._speedMult; this._play('idle');  break;
      case 'walk':  this._aiTimer = 1.2 / this._speedMult; this._play('walk');  break;
      case 'jump':  this._aiTimer = 2.0;                   this._play('jump');  break;
      case 'slash': this._aiTimer = 0.3 / this._speedMult; this._play('slash'); break;
      case 'lunge': this._aiTimer = 0.6 / this._speedMult; this._play('lunge'); break;
    }
  }

  onHit(damage, source) {
    if (!this.alive) return;
    this.hp -= damage;
    this.sprite.setTint(0xffffff);
    this.later(80, () => this.sprite.clearTint());
    const kbDir = source ? Math.sign(this.x - source.x) : 1;
    this.body.setVelocity(kbDir * 80, -60);
    this._parent?.onHit(damage, source);
    if (this.hp <= 0) this._die();
  }

  _die() {
    if (!this.alive) return;
    this.alive = false;
    this.body.setEnable(false);
    this.scene._particles?.hitBurst({ x: this.x, y: this.y, count: 16, colour: 0x33aa33 });
    this.scene._audio?.playSfx('sfx_enemy_die');
    AnimationManager.playThen(this.sprite, 'mantis_lords_death', () => { this.destroy(); });
  }

  _play(n) { AnimationManager.safePlay(this.sprite, `mantis_lords_${n}`); }
}
