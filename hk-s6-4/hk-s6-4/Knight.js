/* js/entities/Knight.js — Player character with full HK mechanics */
'use strict';

class Knight extends Entity {
  constructor(scene, x, y, saveData) {
    super(scene, x, y, 'knight', 0);

    // ── Stats from save ───────────────────────────────────────────────────
    this.masks      = saveData?.masks  ?? C.MASK_MAX;
    this.masksMax   = C.MASK_MAX;
    this.soul       = saveData?.soul   ?? 0;
    this.geo        = saveData?.geo    ?? 0;
    this.abilities  = Object.assign({
      dash: true,   // start with dash for demo
      doublejump: false,
      walljump: true,
      fireball: true,
      dive: false,
      great_slash: false,
      cyclone_slash: false,
      dash_slash: false,
    }, saveData?.abilities ?? {});

    // ── Physics body ──────────────────────────────────────────────────────
    this.sprite.setBounce(0);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.setMaxVelocity(C.KNIGHT_DASH_SPEED * 1.1, C.TERMINAL_VEL);
    this.sprite.setDragX(1200);
    this.setSize(10, 20, 11, 12);

    // ── State machine ─────────────────────────────────────────────────────
    this.state = {
      action:      'idle',
      facing:       1,          // 1 = right, -1 = left
      onGround:     false,
      onWall:       0,          // -1 left, 0 none, 1 right
      canJump:      true,
      canDoubleJump:false,
      canDash:      true,
      canAttack:    true,
      isDashing:    false,
      isAttacking:  false,
      isFocusing:   false,
      isCasting:    false,
      isHurt:       false,
      isDead:       false,
      wallClingTime:0,
      attackCombo:  0,
      attackTimer:  0,
      attackCdTimer:0,
      dashTimer:    0,
      dashCdTimer:  0,
      focusTimer:   0,
      iframeTimer:  0,
      nailCharge:   0,          // for nail arts
      jumpBufferTimer: 0,
      coyoteTimer:  0,
    };

    // ── Internal ──────────────────────────────────────────────────────────
    this._input    = scene._input;
    this._particles= scene._particles;
    this._camera   = scene._camera;
    this._audio    = scene._audio;
    this._hud      = null;      // set after HUD created

    // Nail hitbox (temporary physics sprite)
    this._nailBox  = null;
    this._shadow   = null;

    // Trail emitter during dash
    this._dashTrail = null;

    this.sprite.setDepth(C.LAYER_ENTITY + 1);
    this._updateFlip();
  }

  // ── Update ────────────────────────────────────────────────────────────────
  update(dt) {
    if (this.state.isDead) return;

    const s = this.state;
    const inp = this._input;
    const body = this.body;

    // Detect ground / wall
    s.onGround = body.blocked.down;
    s.onWall   = body.blocked.left ? -1 : (body.blocked.right ? 1 : 0);

    // Coyote time
    if (s.onGround) {
      s.coyoteTimer = 0.1;
      s.canJump = true;
      if (!s.isDashing) s.canDoubleJump = this.abilities.doublejump;
    } else if (s.coyoteTimer > 0) {
      s.coyoteTimer -= dt;
    } else {
      if (s.canJump && !s.onWall) s.canJump = false;
    }

    // Jump buffer
    if (inp.jump) s.jumpBufferTimer = 0.12;
    else if (s.jumpBufferTimer > 0) s.jumpBufferTimer -= dt;

    // Tick timers
    if (s.iframeTimer  > 0) s.iframeTimer  -= dt;
    if (s.attackTimer  > 0) s.attackTimer  -= dt;
    if (s.attackCdTimer> 0) s.attackCdTimer-= dt;
    if (s.dashCdTimer  > 0) s.dashCdTimer  -= dt;
    if (s.dashTimer    > 0) s.dashTimer    -= dt;

    if (s.attackCdTimer <= 0) s.canAttack = true;
    if (s.dashCdTimer   <= 0) s.canDash   = true;

    // Priority order of actions
    if      (s.isHurt)      this._updateHurt(dt);
    else if (s.isDashing)   this._updateDash(dt);
    else if (s.isAttacking) this._updateAttack(dt);
    else if (s.isFocusing)  this._updateFocus(dt, inp);
    else {
      this._handleMovement(dt, inp);
      this._handleJump(dt, inp);
      this._handleDash(dt, inp);
      this._handleAttack(dt, inp);
      this._handleFocus(dt, inp);
      this._handleCast(dt, inp);
      this._handleNailCharge(dt, inp);
    }

    // Gravity for wall slide
    if (s.onWall && !s.onGround && body.velocity.y > 0 && !s.isDashing) {
      body.setVelocityY(Math.min(body.velocity.y, C.KNIGHT_WALL_SLIDE));
    }

    this._updateAnimation();
    this._updateFlip();
    this._updateShade();
  }

  // ── Movement ──────────────────────────────────────────────────────────────
  _handleMovement(dt, inp) {
    const s = this.state;
    if (s.isDashing || s.isAttacking && s.onGround) return;

    const spd = C.KNIGHT_SPEED;
    const x   = inp.xAxis;

    if (x !== 0) {
      s.facing = x;
      this.body.setVelocityX(x * spd);
    } else {
      this.body.setVelocityX(0);
    }

    // Update action state
    if (s.onGround) {
      if (x !== 0) s.action = 'walk';
      else s.action = 'idle';
    } else {
      if (this.body.velocity.y < -20) s.action = 'jump_rise';
      else s.action = 'jump_fall';
    }
  }

  // ── Jump ──────────────────────────────────────────────────────────────────
  _handleJump(dt, inp) {
    const s = this.state;

    // Variable height — cut jump short on release
    if (!inp.jumpHeld && this.body.velocity.y < -100) {
      this.body.velocity.y *= 0.85;
    }

    if (s.jumpBufferTimer <= 0) return;

    // Wall jump
    if (s.onWall && !s.onGround && this.abilities.walljump) {
      s.jumpBufferTimer = 0;
      s.wallClingTime   = 0;
      this.body.setVelocity(-s.onWall * C.KNIGHT_WALL_JUMP_X, C.KNIGHT_WALL_JUMP_Y);
      s.facing = -s.onWall;
      s.action = 'jump_rise';
      this._audio.playSfx('sfx_jump');
      return;
    }

    // Normal jump (with coyote)
    if (s.canJump) {
      s.canJump = false;
      s.jumpBufferTimer = 0;
      this.body.setVelocityY(C.KNIGHT_JUMP_VEL);
      s.action = 'jump_rise';
      this._audio.playSfx('sfx_jump');
      return;
    }

    // Double jump
    if (s.canDoubleJump && !s.onGround) {
      s.canDoubleJump = false;
      s.jumpBufferTimer = 0;
      this.body.setVelocityY(C.KNIGHT_DOUBLE_JUMP);
      s.action = 'jump_rise';
      this._particles.burst({ x: this.x, y: this.y + 8, count: 8, tint: 0xffffff });
      this._audio.playSfx('sfx_doublejump');
    }
  }

  // ── Dash ──────────────────────────────────────────────────────────────────
  _handleDash(dt, inp) {
    const s = this.state;
    if (!this.abilities.dash || !s.canDash || !inp.dash) return;

    s.isDashing   = true;
    s.canDash     = false;
    s.dashTimer   = C.KNIGHT_DASH_DUR;
    s.dashCdTimer = C.KNIGHT_DASH_CD;
    s.action      = 'dash';

    // Dash direction: horizontal, prefer facing
    const dir = this._input.xAxis || s.facing;
    this.body.setVelocity(dir * C.KNIGHT_DASH_SPEED, 0);
    this.body.setAllowGravity(false);

    this._audio.playSfx('sfx_dash');
    this._dashTrail = this._particles.trail({
      x: this.x, y: this.y, texture: 'particle', tint: 0x99ccff,
    });
    this._dashTrail.startFollow(this.sprite);
  }

  _updateDash(dt) {
    const s = this.state;
    s.dashTimer -= dt;

    // Ghosting effect every other frame
    if (Math.floor(s.dashTimer * 60) % 2 === 0) {
      this._particles.dashGhost(this.sprite);
    }

    if (s.dashTimer <= 0) {
      s.isDashing = false;
      this.body.setAllowGravity(true);
      this.body.setVelocityX(this.body.velocity.x * 0.3);
      if (this._dashTrail) {
        this._dashTrail.stopFollow();
        this._dashTrail.stop();
        this._dashTrail = null;
      }
    }
  }

  // ── Attack ────────────────────────────────────────────────────────────────
  _handleAttack(dt, inp) {
    const s = this.state;
    if (!s.canAttack || !inp.attack) return;

    s.isAttacking = true;
    s.canAttack   = false;
    s.attackCdTimer = C.KNIGHT_ATTACK_CD;
    s.attackTimer   = C.KNIGHT_ATTACK_DUR;

    // Determine direction
    let dir = 'h';  // horizontal
    if (inp.up)   dir = 'up';
    else if (inp.down && !s.onGround) dir = 'down';

    // Combo
    if (dir === 'h') {
      s.attackCombo = (s.attackCombo + 1) % 3 + 1;
      s.action = `attack_${s.attackCombo}`;
    } else {
      s.attackCombo = 0;
      s.action = `attack_${dir}`;
    }

    // Nail art — great slash on charge
    if (s.nailCharge >= C.GREAT_SLASH_CHARGE && dir === 'h' && this.abilities.great_slash) {
      s.action = 'great_slash';
      s.attackTimer *= 1.5;
      s.attackCdTimer += 0.2;
      s.nailCharge = 0;
    }

    this._spawnNailHitbox(dir);
    this._audio.playSfx('sfx_nail');

    // Knockback from attack (slight)
    if (dir === 'h') {
      this.body.setVelocityX(-s.facing * 40);
    } else if (dir === 'up') {
      this.body.setVelocityY(40);
    } else if (dir === 'down') {
      this.body.setVelocityY(-80);  // small upward for pogo
    }
  }

  _spawnNailHitbox(dir) {
    const s   = this.state;
    const r   = C.KNIGHT_ATTACK_RANGE;
    let ox = 0, oy = 0, w = r, h = 14;

    switch (dir) {
      case 'h':
        ox = s.facing * r * 0.5;
        break;
      case 'up':
        oy = -r * 0.7; w = 14; h = r;
        break;
      case 'down':
        oy = r * 0.7;  w = 14; h = r;
        break;
    }

    if (this._nailBox) this._nailBox.destroy();
    this._nailBox = this.scene.physics.add.staticImage(
      this.x + ox, this.y + oy, '__DEFAULT'
    );
    this._nailBox.setSize(w, h);
    this._nailBox.setVisible(false);
    this._nailBox.dir  = dir;
    this._nailBox.dmg  = C.KNIGHT_ATTACK_DMG;
    this._nailBox.owner = this;

    // Register with scene's enemy collision
    this.scene.registerNailHit(this._nailBox);

    // Slash VFX
    this._spawnSlashEffect(dir);

    // Remove hitbox after short duration
    this.later(C.KNIGHT_ATTACK_DUR * 500, () => {
      if (this._nailBox) { this._nailBox.destroy(); this._nailBox = null; }
    });
  }

  _spawnSlashEffect(dir) {
    const s   = this.state;
    const r   = C.KNIGHT_ATTACK_RANGE;
    let ex = this.x, ey = this.y;
    let animKey = 'slash_effect_slash_h';

    switch (dir) {
      case 'h':
        ex += s.facing * (r * 0.6);
        animKey = 'slash_effect_slash_h';
        break;
      case 'up':
        ey -= r * 0.6;
        animKey = 'slash_effect_slash_up';
        break;
      case 'down':
        ey += r * 0.6;
        animKey = 'slash_effect_slash_down';
        break;
    }

    const fx = this.scene.add.sprite(ex, ey, 'slash_effect');
    fx.setDepth(C.LAYER_PARTICLES);
    fx.setFlipX(s.facing < 0);
    if (this.scene.anims.exists(animKey)) {
      fx.play(animKey);
      fx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => fx.destroy());
    } else {
      fx.destroy();
    }
  }

  _updateAttack(dt) {
    this.state.attackTimer -= dt;
    if (this.state.attackTimer <= 0) {
      this.state.isAttacking = false;
      this.state.action = this.state.onGround ? 'idle' : 'jump_fall';
    }
  }

  // ── Nail charge (Nail Arts) ────────────────────────────────────────────────
  _handleNailCharge(dt, inp) {
    const s = this.state;
    if (inp.attackHeld && s.onGround && !s.isAttacking && !s.isDashing && !s.isFocusing) {
      s.nailCharge += dt;
      if (s.nailCharge >= 0.3) s.action = 'nail_charge';
    } else if (!inp.attackHeld) {
      if (s.nailCharge > 0 && !inp.attack) s.nailCharge = 0;
    }
  }

  // ── Focus (heal) ──────────────────────────────────────────────────────────
  _handleFocus(dt, inp) {
    const s = this.state;
    if (!inp.focus || !s.onGround || s.isAttacking || s.isDashing) {
      if (s.isFocusing) this._cancelFocus();
      return;
    }
    if (this.soul < C.SOUL_FOCUS_COST || this.masks >= this.masksMax) return;

    s.isFocusing = true;
    s.focusTimer += dt;
    s.action = s.focusTimer < 0.15 ? 'focus' : 'focus_loop';
    this.body.setVelocityX(0);

    if (s.focusTimer >= C.SOUL_FOCUS_DUR) {
      this._completeFocus();
    }
  }

  _completeFocus() {
    const s = this.state;
    s.isFocusing = false;
    s.focusTimer = 0;

    if (this.soul >= C.SOUL_FOCUS_COST && this.masks < this.masksMax) {
      this.soul -= C.SOUL_FOCUS_COST;
      this.masks = Math.min(this.masks + C.FOCUS_HEAL_AMOUNT, this.masksMax);
      this._audio.playSfx('sfx_heal');
      this._particles.soul({ x: this.x, y: this.y - 10 });
      this._hud?.update();
    }
  }

  _cancelFocus() {
    this.state.isFocusing = false;
    this.state.focusTimer = 0;
  }

  // ── Spells ────────────────────────────────────────────────────────────────
  _handleCast(dt, inp) {
    const s = this.state;
    if (!inp.cast || s.isCasting || this.soul < C.SOUL_FIREBALL_COST) return;

    if (this.abilities.fireball) {
      this._castFireball();
    }
  }

  _castFireball() {
    this.soul -= C.SOUL_FIREBALL_COST;
    this.state.isCasting = true;
    this.state.action    = 'cast_fireball';

    this._audio.playSfx('sfx_fireball');

    // Spawn projectile in scene
    const dir = this.state.facing;
    this.scene.spawnFireball(this.x + dir * 12, this.y - 4, dir);

    this.later(300, () => {
      this.state.isCasting = false;
    });
  }

  // ── Taking damage ─────────────────────────────────────────────────────────
  onHit(damage, source) {
    if (!this.sprite?.active) return;   // knight already destroyed / transitioning
    const s = this.state;
    if (s.iframeTimer > 0 || s.isDead) return;

    this.masks -= Math.ceil(damage / 10);
    s.iframeTimer = C.IFRAMES_ON_HIT;
    s.isHurt = true;

    // Knockback away from source — guard against destroyed source
    let srcX = null;
    try { srcX = (source != null) ? (source.x ?? null) : null; } catch(_) {}
    const kbDir = (srcX != null) ? (Math.sign(this.x - srcX) || 1) : -s.facing;
    this.body.setVelocity(kbDir * 180, -200);

    this._audio.playSfx('sfx_player_hit');
    
    // Guard camera calls against destroyed/invalid state
    try {
      this._camera?.shake(4, 200);
      this._camera?.flash(0xff4444, 100);
    } catch(e) {
      console.warn('Camera effect failed:', e);
    }

    this._hud?.flashMasks();

    if (this.masks <= 0) {
      this._die();
      return;
    }

    this.state.action = 'take_hit';
    this.later(400, () => {
      s.isHurt = false;
    });
  }

  _updateHurt(dt) {
    // Flash sprite during iframes
    if (this.state.iframeTimer > 0) {
      this.sprite.setAlpha(Math.sin(Date.now() / 60) > 0 ? 1 : 0.3);
    } else {
      this.sprite.setAlpha(1);
    }
  }

  _die() {
    const s = this.state;
    s.isDead = true;
    s.action = 'death';

    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);

    this._audio.playSfx('sfx_player_death');

    // Drop shade with geo
    this.scene.spawnShade(this.x, this.y, this.geo);
    this.geo = 0;

    this.later(1200, () => {
      this.scene.onPlayerDeath();
    });
  }

  // ── Soul gain from hitting enemies ────────────────────────────────────────
  gainSoul(amount = C.SOUL_PER_HIT) {
    this.soul = Math.min(this.soul + amount, C.SOUL_MAX);
    this._hud?.update();
  }

  collectGeo(amount) {
    this.geo += amount;
    this._hud?.update();
    this._particles.geo({ x: this.x, y: this.y - 10 });
    this._audio.playSfx('sfx_geo');
  }

  // ── Animation ─────────────────────────────────────────────────────────────
  _updateAnimation() {
    const key = AnimationManager.getKnightAnim(this.state);
    AnimationManager.safePlay(this.sprite, key);
  }

  _updateFlip() {
    this.sprite.setFlipX(this.state.facing < 0);
  }

  // Shade shadow under knight
  _updateShade() {
    // Simple ground shadow (ellipse drawn in render, or a pre-made sprite)
  }

  // ── Serialise for save ────────────────────────────────────────────────────
  toSaveData() {
    return {
      masks:     this.masks,
      soul:      this.soul,
      geo:       this.geo,
      abilities: { ...this.abilities },
    };
  }
}
