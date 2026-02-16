/* js/entities/DreamNail.js — Dream Nail weapon and Desolate Dive spell extension
 * This file extends the Knight class with Dream Nail and Dive abilities.
 * Call DreamNailExtension.apply(knight) after Knight is created.
 */
'use strict';

const DreamNailExtension = {
  apply(knight) {
    // Bind new methods onto the knight instance
    knight._dreamNailCharging = false;
    knight._dreamNailTimer    = 0;
    knight._dreamEssence      = 0;
    knight._diveActive        = false;
    knight._diveTimer         = 0;

    // Override update to include new abilities
    const origUpdate = knight.update.bind(knight);
    knight.update = function(dt) {
      origUpdate(dt);
      if (!this.state.isDead) {
        this._handleDreamNail(dt);
        this._handleDive(dt);
      }
    };
  },
};

// Inject methods into Knight prototype for Phase 2
Object.assign(Knight.prototype, {

  // ── Dream Nail ─────────────────────────────────────────────────────────────
  _handleDreamNail(dt) {
    if (!this.abilities.dreamnail) return;
    const s   = this._input;
    const st  = this.state;

    if (s.isDown('DREAM_NAIL') && !st.isAttacking && !st.isDashing && !st.isFocusing) {
      this._dreamNailCharging = true;
      this._dreamNailTimer   += dt;
      st.action = 'nail_charge';

      if (this._dreamNailTimer >= C.DREAM_NAIL_CHARGE) {
        this._dreamNailCharging = false;
        this._dreamNailTimer    = 0;
        this._fireDreamNail();
      }
    } else if (this._dreamNailCharging && !s.isDown('DREAM_NAIL')) {
      this._dreamNailCharging = false;
      this._dreamNailTimer    = 0;
    }
  },

  _fireDreamNail() {
    // Slow-mo flash
    this.scene.time.timeScale = 0.15;
    this.scene.time.delayedCall(600, () => {
      this.scene.time.timeScale = 1;
    });

    this.scene._camera?.flash(0xaaaaff, 200);
    this.scene._audio?.playSfx('sfx_dream_nail');

    // Dream nail arc effect
    const fx = this.scene.add.sprite(
      this.x + this.state.facing * 28, this.y - 4, 'dream_nail', 0
    );
    fx.setDepth(C.LAYER_PARTICLES + 2);
    fx.setFlipX(this.state.facing < 0);
    fx.setTint(0xaaaaff);
    if (this.scene.anims.exists('dream_nail_swing')) {
      fx.play('dream_nail_swing');
      fx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => fx.destroy());
    }

    // Hit nearby enemies/npcs and read their dreams
    const range = 50;
    const targets = [
      ...this.scene._enemies,
      ...this.scene._npcs,
    ];

    for (const t of targets) {
      if (!t.alive) continue;
      const dist = Math.hypot(t.x - this.x, t.y - this.y);
      if (dist < range) {
        // Show dream dialogue
        const dreamLines = this._getDreamDialogue(t);
        if (dreamLines.length > 0) {
          this.scene._dialogue.show(
            dreamLines.map(text => ({ speaker: '...dream...', text })),
            () => {}
          );
        }

        // Gain essence
        this._dreamEssence += C.DREAM_ESSENCE_PER_HIT;
        // Gain soul
        this.gainSoul(C.SOUL_PER_HIT);
      }
    }
  },

  _getDreamDialogue(target) {
    const type = target.npcType || target.constructor?.name?.toLowerCase();
    const key = DIALOGUE.dream?.[type];
    if (!key) return [];
    const arr = Array.isArray(key) ? key : Object.values(key);
    return arr.length > 0 ? [arr[Math.floor(Math.random() * arr.length)]] : [];
  },

  // ── Desolate Dive ──────────────────────────────────────────────────────────
  _handleDive(dt) {
    if (!this.abilities.dive) return;

    // Activate: cast button while in air with DOWN held
    if (!this._diveActive) {
      const inp = this._input;
      if (inp.justPressed('CAST') && inp.isDown('DOWN') &&
          !this.state.onGround && this.soul >= C.DIVE_COST &&
          !this.state.isDashing) {
        this._startDive();
      }
      return;
    }

    // Dive in progress
    this._diveTimer += dt;
    this.body.setVelocityY(C.DIVE_SPEED);
    this.body.setVelocityX(0);
    this.body.setAllowGravity(false);

    if (this.state.onGround) {
      this._endDive();
    }
    if (this._diveTimer > 1.5) this._endDive(); // safety
  },

  _startDive() {
    this._diveActive = true;
    this._diveTimer  = 0;
    this.soul -= C.DIVE_COST;
    this.state.action = 'cast_dive';
    this.body.setAllowGravity(false);
    this.body.setVelocity(0, 50);
    this._hud?.update();
    this.scene._audio?.playSfx('sfx_dive');

    // Visual: dark shroud trails
    this._diveTrail = this.scene._particles?.trail({
      x: this.x, y: this.y, texture: 'particle',
      tint: 0x3333aa, frequency: 30, lifespan: 200,
    });
    this._diveTrail?.startFollow(this.sprite);
  },

  _endDive() {
    this._diveActive = false;
    this._diveTimer  = 0;
    this.body.setAllowGravity(true);

    if (this._diveTrail) {
      this._diveTrail.stopFollow();
      this._diveTrail.stop();
      this._diveTrail = null;
    }

    // Shockwave at landing point
    this._spawnDiveShockwave();
    this.scene._camera?.shake(8, 300);
    this.scene._audio?.playSfx('sfx_dive_land');
  },

  _spawnDiveShockwave() {
    const x = this.x, y = this.y + 10;

    // Visual ring
    const sw = this.scene.add.sprite(x, y, 'shockwave', 0);
    sw.setDepth(C.LAYER_PARTICLES);
    if (this.scene.anims.exists('shockwave_expand')) {
      sw.play('shockwave_expand');
      sw.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => sw.destroy());
    }

    // Damage all enemies in radius
    const r = C.DIVE_SHOCKWAVE_R;
    for (const e of this.scene._enemies) {
      if (!e.alive) continue;
      const dist = Math.hypot(e.x - x, e.y - y);
      if (dist < r) {
        e.onHit(C.DIVE_SHOCKWAVE_DMG, this);
        this.gainSoul();
      }
    }

    this.scene._particles?.burst({
      x, y, count: 14, tint: 0x3355ff,
      speedX: [-120, 120], speedY: [-40, 10],
      scale: [1.4, 0], lifespan: 400,
    });
  },
});
