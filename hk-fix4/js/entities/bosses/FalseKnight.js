/* js/entities/bosses/FalseKnight.js — Phase I & II boss */
'use strict';

/**
 * The False Knight — a maggot wearing stolen warrior armour.
 * Phases:
 *   Phase 1 (HP > rage threshold): Walk, Jump Slam, Charge
 *   Phase 2 (HP <= rage threshold): Faster, aerial slams, ground shockwaves
 * Staggers every STAGGER_HP damage taken.
 */
class FalseKnight extends Entity {
  constructor(scene, x, y, data = {}) {
    super(scene, x, y, 'false_knight', 0);

    this.hp         = C.FALSE_KNIGHT_HP;
    this.maxHp      = C.FALSE_KNIGHT_HP;
    this.dmg        = C.FALSE_KNIGHT_DMG;
    this.geoReward  = data.geoReward ?? 120;
    this.id         = data.id ?? 'boss_false_knight';

    this._phase     = 1;
    this._aiState   = 'intro';
    this._aiTimer   = 0;
    this._staggerAccum = 0;
    this._staggerThresh= C.FALSE_KNIGHT_STAGGER;
    this._attackCount  = 0;
    this._hitPlayer    = false;
    this._shockwaveOut = false;
    this._bossStarted  = false;
    this._defeated     = false;

    // Build health bar
    this._hpBar = null;
    this._buildHpBar();

    // Physics
    this.setSize(38, 50, 13, 14);
    this.sprite.setDepth(C.LAYER_ENTITY + 2);
    this.sprite.setGravityY(C.GRAVITY * 0.8);

    // Start in intro state — wait for player proximity
    this._play('idle');
  }

  // ── Update ────────────────────────────────────────────────────────────────
  update(dt) {
    if (!this.alive || this._defeated) return;

    this._aiTimer -= dt;
    this._updateHpBar();

    const player = this.scene.knight;

    // Trigger intro when player enters arena
    if (!this._bossStarted && player) {
      const dist = Math.abs(player.x - this.x);
      if (dist < 320) {
        this._startBoss();
      }
    }

    if (!this._bossStarted) return;

    switch (this._aiState) {
      case 'idle':    this._aiIdle(dt, player);    break;
      case 'walk':    this._aiWalk(dt, player);    break;
      case 'jump':    this._aiJump(dt, player);    break;
      case 'slam':    this._aiSlam(dt, player);    break;
      case 'charge':  this._aiCharge(dt, player);  break;
      case 'stagger': this._aiStagger(dt);         break;
      case 'roar':    this._aiRoar(dt);            break;
    }

    this.sprite.setFlipX(this.x > (player?.x ?? this.x));
  }

  // ── Boss start sequence ───────────────────────────────────────────────────
  _startBoss() {
    this._bossStarted = true;
    this._setState('roar');
    this.scene._hud?.showBossBar('False Knight', this.hp, this.maxHp);
    this.scene._audio?.playSfx('sfx_boss_intro');
    this.scene._camera?.shake(5, 400);
    // Lock room transitions during boss fight
    this.scene._bossActive = true;
  }

  // ── AI states ─────────────────────────────────────────────────────────────
  _aiIdle(dt, player) {
    this.body.setVelocityX(0);
    if (this._aiTimer <= 0) {
      // Choose next attack based on phase and distance
      const dx = player ? Math.abs(player.x - this.x) : 200;

      if (this._phase === 2 && Math.random() < 0.4) {
        this._setState('jump');
      } else if (dx < 100 && Math.random() < 0.5) {
        this._setState('slam');
      } else if (dx > 150 && Math.random() < 0.6) {
        this._setState('charge');
      } else {
        this._setState('walk');
      }
    }
  }

  _aiWalk(dt, player) {
    if (!player) { this._setState('idle'); return; }

    const dir = Math.sign(player.x - this.x);
    const spd = this._phase === 2 ? 80 : 55;
    this.body.setVelocityX(dir * spd);

    // Close distance, then attack
    const dx = Math.abs(player.x - this.x);
    if (dx < 90 || this._aiTimer <= 0) {
      if (dx < 90) this._setState('slam');
      else         this._setState('idle');
    }
  }

  _aiJump(dt, player) {
    if (this._aiTimer > 0.6) {
      // Wind-up — stand still
      this.body.setVelocityX(0);
      return;
    }
    if (this._aiTimer > 0) {
      // In air — track player horizontally
      if (player) {
        const dir = Math.sign(player.x - this.x);
        this.body.setVelocityX(dir * C.FALSE_KNIGHT_SLAM_SPD * 0.6);
      }
      return;
    }
    // Land
    if (this.body.blocked.down) {
      this._doSlamLand();
    }
  }

  _aiSlam(dt, player) {
    if (this._aiTimer > 0) {
      // Wind-up
      this.body.setVelocityX(0);
      return;
    }
    // Actually slam
    if (!this._slamDone) {
      this._slamDone = true;
      const dir = player ? Math.sign(player.x - this.x) : 1;
      this.body.setVelocity(dir * C.FALSE_KNIGHT_SLAM_SPD, -80);
      this._hitPlayer = false;
    }

    // Check hit on player during slam
    if (player && !this._hitPlayer) {
      const dx = Math.abs(player.x - this.x);
      const dy = Math.abs(player.y - this.y);
      if (dx < 50 && dy < 36) {
        player.onHit(this.dmg, this);
        this._hitPlayer = true;
      }
    }

    // Land → shockwave
    if (this.body.blocked.down && this._slamDone) {
      this._doSlamLand();
    }

    if (this._aiTimer <= -0.8) this._setState('idle');
  }

  _aiCharge(dt, player) {
    if (this._aiTimer > 0) {
      this.body.setVelocityX(0);
      return;
    }

    if (!player) { this._setState('idle'); return; }
    const dir = Math.sign(player.x - this.x);
    const spd = this._phase === 2 ? 280 : 200;
    this.body.setVelocityX(dir * spd);
    this._hitPlayer = false;

    if (player && !this._hitPlayer) {
      const dx = Math.abs(player.x - this.x);
      if (dx < 45) {
        player.onHit(this.dmg, this);
        this._hitPlayer = true;
      }
    }

    // Hit wall or timer → stop
    if (this.body.blocked.left || this.body.blocked.right || this._aiTimer <= -1.0) {
      this.body.setVelocityX(0);
      if (this.body.blocked.left || this.body.blocked.right) {
        this.scene._camera?.shake(6, 250);
        this._spawnShockwave(this.x, this.y + 20, false);
      }
      this._setState('idle');
    }
  }

  _aiStagger(dt) {
    this.body.setVelocityX(0);
    if (this._aiTimer <= 0) {
      // Check for phase 2 transition
      if (this.hp <= C.FALSE_KNIGHT_RAGE_HP && this._phase === 1) {
        this._enterPhase2();
      } else {
        this._setState('idle');
      }
    }
  }

  _aiRoar(dt) {
    this.body.setVelocityX(0);
    if (this._aiTimer <= 0) {
      this._setState('walk');
    }
  }

  // ── Slam landing shockwave ─────────────────────────────────────────────────
  _doSlamLand() {
    this._slamDone = false;
    AnimationManager.safePlay(this.sprite, 'false_knight_slam_land', false);
    this.scene._camera?.shake(8, 300);
    this.scene._audio?.playSfx('sfx_slam');

    // Spawn shockwaves both directions
    this._spawnShockwave(this.x - 30, this.y + 20, true, -1);
    this._spawnShockwave(this.x + 30, this.y + 20, true, 1);

    this._setState('idle');
  }

  _spawnShockwave(x, y, ground, dir = 0) {
    // Shockwave hitbox that travels outward
    const sw = this.scene.add.sprite(x, y, 'shockwave', 0);
    sw.setDepth(C.LAYER_PARTICLES + 1);
    sw.setFlipX(dir < 0);
    if (this.scene.anims.exists('shockwave_expand')) {
      sw.play('shockwave_expand');
      sw.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => sw.destroy());
    }

    // Damage zone
    const zone = this.scene.physics.add.staticImage(x, y, '__DEFAULT');
    zone.setSize(ground ? 60 : 40, 20);
    zone.setVisible(false);

    const overlap = this.scene.physics.add.overlap(
      this.scene.knight.sprite, zone, () => {
        this.scene.knight.onHit(this.dmg * 0.6, { x });
        overlap.destroy();
        zone.destroy();
      }
    );

    this.scene.time.delayedCall(ground ? 500 : 300, () => {
      overlap?.destroy();
      if (zone?.active) zone.destroy();
    });

    if (dir !== 0 && ground) {
      // Travelling shockwave
      this.scene.tweens.add({
        targets: sw, x: x + dir * 100, duration: 400,
        ease: 'Linear',
        onUpdate: () => zone.setPosition(sw.x, sw.y).refreshBody(),
      });
    }
  }

  // ── Phase 2 ───────────────────────────────────────────────────────────────
  _enterPhase2() {
    this._phase = 2;
    this._staggerThresh = 60;   // harder to stagger in rage
    this.dmg = C.FALSE_KNIGHT_DMG * 1.3;

    // Visual: turn orange with infection
    this.sprite.setTint(0xff6600);
    this.scene.tweens.add({
      targets: this.sprite,
      tint: { from: 0xff6600, to: 0xffffff },
      duration: 1200,
    });

    this.scene._camera?.shake(12, 600);
    this.scene._audio?.playSfx('sfx_boss_rage');
    this._play('roar');
    this._aiTimer = 1.5;
    this._aiState = 'roar';
  }

  // ── Receive damage ────────────────────────────────────────────────────────
  onHit(damage, source) {
    if (!this.alive || this._defeated) return;
    if (this._aiState === 'stagger') return;  // already staggered

    this.hp -= damage;
    this._staggerAccum += damage;

    // Flash
    this.sprite.setTint(0xffffff);
    this.later(60, () => {
      if (this.alive) this.sprite.clearTint();
    });

    // Knockback
    const kbDir = source ? Math.sign(this.x - source.x) || 1 : 1;
    this.body?.setVelocityX(kbDir * 60);

    this.scene._hud?.updateBossBar(this.hp, this.maxHp);

    // Stagger check
    if (this._staggerAccum >= this._staggerThresh) {
      this._staggerAccum = 0;
      this._setState('stagger');
    }

    if (this.hp <= 0) this._die();
  }

  // ── Death ─────────────────────────────────────────────────────────────────
  _die() {
    if (this._defeated) return;
    this._defeated = true;
    this.alive     = false;

    this.body.setEnable(false);
    this.body.setVelocity(0, 0);
    this.scene._bossActive = false;

    this.scene._camera?.shake(14, 800);
    this.scene._audio?.playSfx('sfx_boss_die');
    this.scene._particles?.hitBurst({ x: this.x, y: this.y, count: 20, colour: 0xffaa44 });

    // Show defeat cutscene dialogue
    this.scene._dialogue.show(DIALOGUE.false_knight_defeat, () => {});

    // Collapse animation
    AnimationManager.playThen(this.sprite, 'false_knight_death', () => {
      this._hpBar?.destroy();
      this.scene._hud?.hideBossBar();
      this.scene.spawnGeo(this.x, this.y, this.geoReward);
      (this.scene._save.flags || (this.scene._save.flags = {}))[this.id] = true;
      this.scene._save.itemsCollected.push(this.id);
      SaveSystem.save(this.scene._buildSaveData());
      this.destroy();

      // Unlock bench behind arena
      this.scene._loadRoom('false_knight_arena', 'after_boss');
    });
  }

  // ── State helper ──────────────────────────────────────────────────────────
  _setState(next) {
    this._aiState  = next;
    this._slamDone = false;
    this._hitPlayer = false;

    switch (next) {
      case 'idle':
        this._aiTimer = this._phase === 2 ? 0.4 : 0.8;
        this._play('idle');
        break;
      case 'walk':
        this._aiTimer = this._phase === 2 ? 1.2 : 2.0;
        this._play('walk');
        break;
      case 'jump':
        this._aiTimer = 0.7;
        this._play('jump');
        // Jump!
        this.scene.time.delayedCall(200, () => {
          if (this.alive) this.body.setVelocityY(C.FALSE_KNIGHT_JUMP_VEL);
        });
        break;
      case 'slam':
        this._aiTimer = 0.3;
        this._play('slam');
        break;
      case 'charge':
        this._aiTimer = 0.4;
        this._play('charge');
        break;
      case 'stagger':
        this._aiTimer = 1.4;
        this._play('stagger');
        this.scene._camera?.shake(6, 300);
        break;
      case 'roar':
        this._aiTimer = 1.6;
        this._play('roar');
        this.scene._camera?.shake(4, 200);
        break;
    }
  }

  // ── HP bar ────────────────────────────────────────────────────────────────
  _buildHpBar() {
    // Delegates to HUD — boss bar shown at bottom of screen
    // The scene's HUD.showBossBar() handles this
  }

  _updateHpBar() {
    // Scene's HUD handles continuous update
  }

  _play(name) {
    AnimationManager.safePlay(this.sprite, `false_knight_${name}`);
  }
}
