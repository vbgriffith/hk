/* js/entities/bosses/HollowKnightBoss.js — Final boss, two phases */
'use strict';

class HollowKnightBoss extends Entity {
  constructor(scene, x, y, data = {}) {
    super(scene, x, y, 'hollow_knight_boss', 0);
    this.hp        = 1000;
    this.maxHp     = 1000;
    this.dmg       = 25;
    this.geoReward = 0;
    this.id        = data.id ?? 'boss_hollow_knight';

    this._phase       = 1;
    this._aiState     = 'intro';
    this._aiTimer     = 0;
    this._attackCount = 0;
    this._bossStarted = false;
    this._defeated    = false;
    this._staggerTimer= 0;
    this._voidTendrils= [];

    this.setSize(28, 48, 14, 8);
    this.sprite.setDepth(C.LAYER_ENTITY + 3);
    this.sprite.setGravityY(C.GRAVITY * 0.7);
    this._play('idle');
  }

  update(dt) {
    if (!this.alive || this._defeated) return;
    this._aiTimer -= dt;
    const player = this.scene.knight;

    if (!this._bossStarted && player && Math.abs(player.x - this.x) < 420) {
      this._startBoss();
    }
    if (!this._bossStarted) return;

    this.sprite.setFlipX((player?.x ?? 0) < this.x);

    switch (this._aiState) {
      case 'idle':    this._doIdle(dt, player);    break;
      case 'slash':   this._doSlash(dt, player);   break;
      case 'jump':    this._doJump(dt, player);    break;
      case 'stab':    this._doStab(dt, player);    break;
      case 'scream':  this._doScream(dt);          break;
      case 'stagger': this._doStagger(dt);         break;
      case 'p2_lunge':this._doP2Lunge(dt, player); break;
      case 'intro':   if (this._aiTimer <= 0) this._setState('idle'); break;
    }
  }

  _startBoss() {
    this._bossStarted = true;
    this.scene._hud?.showBossBar('Hollow Knight', this.hp, this.maxHp);
    this.scene._bossActive = true;
    this.scene._camera?.flash(0x000000, 800);
    this.scene._audio?.playSfx('sfx_boss_intro');
    this.scene._dialogue.show(DIALOGUE.hollow_knight_intro, () => {
      this._setState('idle');
    });
  }

  _doIdle(dt, player) {
    this.body.setVelocityX(0);
    if (this._aiTimer <= 0) this._chooseAttack(player);
  }

  _doSlash(dt, player) {
    if (!this._slashDone && this._aiTimer <= 0) {
      this._slashDone = true;
      const dir = Math.sign((player?.x ?? this.x + 1) - this.x);
      this.body.setVelocityX(dir * 160);
      // Wide hitbox
      const bx = this.x + dir * 40;
      const zone = this.scene.physics.add.staticImage(bx, this.y, '__DEFAULT');
      zone.setSize(70, 40).setVisible(false);
      const ol = this.scene.physics.add.overlap(this.scene.knight.sprite, zone, () => {
        this.scene.knight.onHit(this.dmg, this); ol.destroy(); zone.destroy();
      });
      this.scene.time.delayedCall(350, () => { ol?.destroy(); zone?.active && zone.destroy(); });
      this._aiTimer = 0.5;
    } else if (this._slashDone && this._aiTimer <= 0) {
      this._slashDone = false;
      this.body.setVelocityX(0);
      this._setState('idle');
    }
  }

  _doJump(dt, player) {
    if (!this._jumpDone) {
      this._jumpDone = true;
      const dir = Math.sign((player?.x ?? this.x) - this.x);
      this.body.setVelocity(dir * 200, -500);
    }
    if (this.body.blocked.down && this._jumpDone) {
      this._jumpDone = false;
      this.scene._camera?.shake(10, 300);
      this._spawnVoidWave();
      this._setState('idle');
    }
  }

  _doStab(dt, player) {
    this.body.setVelocityX(0);
    if (!this._stabFired && this._aiTimer <= 0) {
      this._stabFired = true;
      // Rapid stab forward
      if (player) {
        const dir = Math.sign(player.x - this.x);
        this.body.setVelocityX(dir * 300);
        const hitZone = this.scene.physics.add.staticImage(this.x + dir * 30, this.y - 4, '__DEFAULT');
        hitZone.setSize(50, 28).setVisible(false);
        const ol = this.scene.physics.add.overlap(this.scene.knight.sprite, hitZone, () => {
          this.scene.knight.onHit(this.dmg * 0.8, this); ol.destroy(); hitZone.destroy();
        });
        this.scene.time.delayedCall(200, () => { ol?.destroy(); hitZone?.active && hitZone.destroy(); });
      }
      this._aiTimer = 0.6;
    } else if (this._stabFired && this._aiTimer <= 0) {
      this._stabFired = false;
      this.body.setVelocityX(0);
      this._setState('idle');
    }
  }

  _doScream(dt) {
    this.body.setVelocityX(0);
    if (!this._screamFired && this._aiTimer <= 0) {
      this._screamFired = true;
      // Spawn void tendrils spreading outward
      for (let i = -2; i <= 2; i++) {
        const tx = this.x + i * 60;
        const tendril = this.scene.physics.add.staticImage(tx, this.y + 20, '__DEFAULT');
        tendril.setSize(20, 40).setVisible(false);
        const ol = this.scene.physics.add.overlap(this.scene.knight.sprite, tendril, () => {
          this.scene.knight.onHit(this.dmg * 0.7, this);
        });
        this.scene._voidTendrils = this.scene._voidTendrils ?? [];
        this.scene._voidTendrils.push({ tendril, ol });
        this.scene.time.delayedCall(1200, () => {
          ol?.destroy(); tendril?.active && tendril.destroy();
        });
        // Visual
        const vfx = this.scene.add.graphics().setDepth(C.LAYER_PARTICLES);
        vfx.fillStyle(0x221133, 0.8);
        vfx.fillRect(tx - 8, this.y, 16, 40);
        this.scene.tweens.add({ targets: vfx, alpha: 0, duration: 1200, onComplete: () => vfx.destroy() });
      }
      this.scene._camera?.shake(6, 500);
      this._aiTimer = 1.4;
    } else if (this._screamFired && this._aiTimer <= 0) {
      this._screamFired = false;
      this._setState('idle');
    }
  }

  _doP2Lunge(dt, player) {
    if (!this._lungeDone) {
      this._lungeDone = true;
      const dir = Math.sign((player?.x ?? this.x + 1) - this.x);
      this.body.setVelocity(dir * 380, -200);
      this._lungeHit = false;
    }
    if (player && !this._lungeHit) {
      if (Math.abs(player.x - this.x) < 30 && Math.abs(player.y - this.y) < 40) {
        player.onHit(this.dmg * 1.2, this);
        this._lungeHit = true;
      }
    }
    if ((this.body.blocked.left || this.body.blocked.right) && this._lungeDone) {
      this._lungeDone = false;
      this.body.setVelocityX(0);
      this.scene._camera?.shake(8, 250);
      this._setState('idle');
    }
    if (this._aiTimer <= 0) {
      this._lungeDone = false;
      this._setState('idle');
    }
  }

  _doStagger(dt) {
    this.body.setVelocityX(0);
    if (this._aiTimer <= 0) {
      if (this.hp <= this.maxHp * 0.35 && this._phase === 1) {
        this._enterPhase2();
      } else {
        this._setState('idle');
      }
    }
  }

  _enterPhase2() {
    this._phase = 2;
    this.dmg   *= 1.25;
    this.sprite.setTint(0x4444aa);
    this.scene._camera?.flash(0x0000ff, 500);
    this.scene._camera?.shake(16, 800);
    this.scene._audio?.playSfx('sfx_boss_rage');
    // Check for dream nail interaction — if player used dream nail enough, trigger Radiance phase
    this._setState('scream');
  }

  _chooseAttack(player) {
    this._attackCount++;
    const roll = Math.random();
    if (this._phase === 1) {
      if (roll < 0.35)      this._setState('slash');
      else if (roll < 0.60) this._setState('jump');
      else if (roll < 0.80) this._setState('stab');
      else                  this._setState('scream');
    } else {
      if (roll < 0.25)      this._setState('p2_lunge');
      else if (roll < 0.50) this._setState('slash');
      else if (roll < 0.70) this._setState('scream');
      else                  this._setState('jump');
    }
  }

  _spawnVoidWave() {
    for (let dir of [-1, 1]) {
      const w = this.scene.add.graphics().setDepth(C.LAYER_PARTICLES);
      w.fillStyle(0x110022, 0.7);
      w.fillRect(0, -8, 12, 16);
      w.setPosition(this.x, this.y + 10);
      this.scene.tweens.add({
        targets: w, x: this.x + dir * 300, duration: 600,
        onComplete: () => w.destroy(),
      });
      const zone = this.scene.physics.add.staticImage(this.x, this.y + 10, '__DEFAULT');
      zone.setSize(16, 24).setVisible(false);
      const ol = this.scene.physics.add.overlap(this.scene.knight.sprite, zone, () => {
        this.scene.knight.onHit(this.dmg * 0.6, this); ol.destroy(); zone.destroy();
      });
      this.scene.tweens.add({
        targets: zone, x: this.x + dir * 300, duration: 600,
        onUpdate: () => zone.refreshBody(),
        onComplete: () => { ol?.destroy(); zone?.active && zone.destroy(); },
      });
    }
  }

  onHit(damage, source) {
    if (!this.alive || this._defeated) return;
    this.hp -= damage;
    this.sprite.setTint(0xffffff);
    this.later(80, () => { if (this.alive) this.sprite.clearTint(); });
    const kbDir = source ? Math.sign(this.x - source.x) : 1;
    this.body.setVelocityX(kbDir * 50);
    this.scene._hud?.updateBossBar(this.hp, this.maxHp);
    if (this.hp % 150 < damage) this._setState('stagger');
    if (this.hp <= 0) this._die();
  }

  _die() {
    if (this._defeated) return;
    this._defeated = true; this.alive = false;
    this.body.setEnable(false);
    this.scene._bossActive = false;

    // Check if player has dream nail for Radiance ending
    if (this.scene.knight?.abilities?.dreamnail) {
      this._triggerRadiancePhase();
    } else {
      this._triggerSealedEnding();
    }
  }

  _triggerSealedEnding() {
    this.scene._camera?.fade(2000, 0, 0, 0);
    this.scene.time.delayedCall(2000, () => {
      this.scene._hud?.hideBossBar();
      this.scene._dialogue.show(DIALOGUE.ending_sealed, () => {
        this.scene.scene.start(C.SCENE_MENU);
      });
    });
  }

  _triggerRadiancePhase() {
    this.scene._camera?.flash(0xffffff, 1000);
    this.scene._hud?.hideBossBar();
    this.scene.time.delayedCall(1000, () => {
      this.destroy();
      this.scene._loadRoom('radiance_dream', 'default');
      const rad = new Radiance(this.scene, C.WIDTH / 2, 80, {});
      this.scene._bosses = [rad];
      this.scene.physics.add.collider(rad.sprite, this.scene._platforms);
      this.scene._hud?.showBossBar('Radiance', rad.hp, rad.maxHp);
    });
  }

  _setState(next) {
    this._aiState   = next;
    this._slashDone = false; this._jumpDone = false;
    this._stabFired = false; this._screamFired = false;
    this._lungeDone = false;
    switch (next) {
      case 'intro':   this._aiTimer = 2.0;  this._play('idle');    break;
      case 'idle':    this._aiTimer = 0.6;  this._play('idle');    break;
      case 'slash':   this._aiTimer = 0.3;  this._play('slash');   break;
      case 'jump':    this._aiTimer = 0;    this._play('jump');    break;
      case 'stab':    this._aiTimer = 0.4;  this._play('stab');    break;
      case 'scream':  this._aiTimer = 0.5;  this._play('scream');  break;
      case 'stagger': this._aiTimer = 1.8;  this._play('stagger'); break;
      case 'p2_lunge':this._aiTimer = 0.8;  this._play('slash');   break;
    }
  }

  _play(n) { AnimationManager.safePlay(this.sprite, `hk_boss_${n}`); }
}


/* ── Radiance — Dream phase final boss ───────────────────────────────────── */
class Radiance extends Entity {
  constructor(scene, x, y, data = {}) {
    super(scene, x, y, 'radiance', 0);
    this.hp        = 600;
    this.maxHp     = 600;
    this.dmg       = 30;
    this.id        = 'boss_radiance';

    this._aiState = 'enter';
    this._aiTimer = 2.5;
    this._defeated= false;
    this._beamCd  = 0;
    this._spikesCd= 0;

    this.setSize(40, 40, 12, 12);
    this.sprite.setDepth(C.LAYER_ENTITY + 4);
    this.body.setAllowGravity(false);

    // Set dream-like background colour
    scene.cameras.main.setBackgroundColor(0x080418);
    this._play('float');
  }

  update(dt) {
    if (!this.alive || this._defeated) return;
    this._aiTimer -= dt;
    this._beamCd  -= dt;
    this._spikesCd -= dt;

    this._hoverT = (this._hoverT || 0) + dt;
    this.sprite.y = 80 + Math.sin(this._hoverT * 0.8) * 20;

    if (this._aiTimer <= 0 && this._aiState !== 'stagger') {
      this._chooseAttack();
    }

    const player = this.scene.knight;
    if (!player) return;

    switch (this._aiState) {
      case 'beam':   this._doBeam(dt, player);   break;
      case 'spikes': this._doSpikes(dt, player); break;
      case 'orbs':   this._doOrbs(dt, player);   break;
      case 'stagger':
        if (this._aiTimer <= 0) this._setState('idle'); break;
    }
  }

  _chooseAttack() {
    const roll = Math.random();
    if (roll < 0.35 && this._beamCd <= 0)  this._setState('beam');
    else if (roll < 0.65 && this._spikesCd <= 0) this._setState('spikes');
    else                                    this._setState('orbs');
  }

  _doBeam(dt, player) {
    if (!this._beamFired && this._aiTimer <= 0) {
      this._beamFired = true;
      // Horizontal beam sweep
      const beamY = player ? player.y - 20 : 150;
      const beam  = this.scene.add.graphics().setDepth(C.LAYER_PARTICLES + 2);
      beam.fillStyle(0xffffaa, 0.8);
      beam.fillRect(0, beamY - 6, C.WIDTH, 12);
      // Hit check
      if (player && Math.abs(player.y - beamY) < 20) player.onHit(this.dmg, this);
      this.scene.tweens.add({ targets: beam, alpha: 0, duration: 600, onComplete: () => beam.destroy() });
      this._beamCd = 3.5;
      this._aiTimer = 1.0;
    } else if (this._beamFired && this._aiTimer <= 0) {
      this._beamFired = false;
      this._setState('idle');
    }
  }

  _doSpikes(dt, player) {
    if (!this._spikesFired && this._aiTimer <= 0) {
      this._spikesFired = true;
      // Random column spikes from floor
      const cols = 7 + Math.floor(Math.random() * 4);
      for (let i = 0; i < cols; i++) {
        const sx = Phaser.Math.Between(20, C.WIDTH - 20);
        const spike = this.scene.add.graphics().setDepth(C.LAYER_PARTICLES + 1);
        spike.fillStyle(0xffffaa, 0.9);
        spike.fillTriangle(sx - 8, C.HEIGHT, sx + 8, C.HEIGHT, sx, C.HEIGHT - 50);
        const zone = this.scene.physics.add.staticImage(sx, C.HEIGHT - 20, '__DEFAULT');
        zone.setSize(16, 50).setVisible(false);
        const ol = this.scene.physics.add.overlap(this.scene.knight.sprite, zone, () => {
          this.scene.knight.onHit(this.dmg * 0.7, this);
        });
        this.scene.time.delayedCall(1400, () => {
          ol?.destroy(); zone?.active && zone.destroy(); spike.destroy();
        });
      }
      this._spikesCd = 2.5;
      this._aiTimer = 1.6;
    } else if (this._spikesFired && this._aiTimer <= 0) {
      this._spikesFired = false;
      this._setState('idle');
    }
  }

  _doOrbs(dt, player) {
    if (!this._orbsFired && this._aiTimer <= 0) {
      this._orbsFired = true;
      const count = 6;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        this.scene.spawnProjectile({
          x: C.WIDTH / 2, y: 80,
          vx: Math.cos(a) * 120, vy: Math.sin(a) * 120,
          texture: 'soul_orb', dmg: this.dmg,
          owner: 'enemy', tint: 0xffeeaa, lifespan: 2800,
        });
      }
      this._aiTimer = 1.2;
    } else if (this._orbsFired && this._aiTimer <= 0) {
      this._orbsFired = false;
      this._setState('idle');
    }
  }

  _setState(next) {
    this._aiState    = next;
    this._beamFired  = false;
    this._spikesFired = false;
    this._orbsFired  = false;
    switch (next) {
      case 'enter':   this._aiTimer = 2.5; break;
      case 'idle':    this._aiTimer = 1.0; break;
      case 'beam':    this._aiTimer = 0.6; break;
      case 'spikes':  this._aiTimer = 0.5; break;
      case 'orbs':    this._aiTimer = 0.4; break;
      case 'stagger': this._aiTimer = 1.4; break;
    }
  }

  onHit(damage, source) {
    if (!this.alive || this._defeated) return;
    this.hp -= damage;
    this.sprite.setTint(0xffffaa);
    this.later(80, () => { if (this.alive) this.sprite.clearTint(); });
    this.scene._hud?.updateBossBar(this.hp, this.maxHp);
    if (this.hp % 120 < damage) this._setState('stagger');
    if (this.hp <= 0) this._die();
  }

  _die() {
    if (this._defeated) return;
    this._defeated = true; this.alive = false;
    this.body.setEnable(false);
    this.scene._bossActive = false;

    this.scene._camera?.flash(0xffffff, 2000);
    this.scene._particles?.burst({ x: C.WIDTH/2, y: 80, count: 40, tint: 0xffffaa });
    this.scene._audio?.playSfx('sfx_boss_die');

    this.scene.time.delayedCall(2000, () => {
      this.scene._hud?.hideBossBar();
      this.scene._dialogue.show(DIALOGUE.ending_dream_no_more, () => {
        this.scene._showCredits();
      });
    });
  }

  _play(n) { AnimationManager.safePlay(this.sprite, `radiance_${n}`); }
}
