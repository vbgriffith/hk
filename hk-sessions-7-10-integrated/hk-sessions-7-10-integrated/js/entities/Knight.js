/* js/entities/Knight.js — INTEGRATED (Sessions 8, 10)
 * 
 * Enhancements:
 * - Session 8: Sprite facing direction with flipX
 * - Session 8: Better hitbox proportions
 * - Session 10: Visual polish compatibility
 */
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
      dash: true,
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
    
    // SESSION 8: Better hitbox for enhanced sprite
    this.setSize(12, 22, 10, 11);  // Slightly larger for detailed sprite

    // ── State machine ─────────────────────────────────────────────────────
    this.state = {
      action:      'idle',
      facing:       1,          // 1 = right, -1 = left
      onGround:     false,
      onWall:       0,
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
      iframeTimer:  0,
      jumpBufferTimer:0,
      coyoteTimer:  0,
      chargeTimer:  0,
    };

    // SESSION 9: Inventory and collectibles
    this.inventory = saveData?.inventory || [];
    this.grubsRescued = saveData?.grubsRescued || 0;
    this.maskShards = saveData?.maskShards || 0;
    this.vesselFragments = saveData?.vesselFragments || 0;
    this.paleOre = saveData?.paleOre || 0;
    this.rancidEggs = saveData?.rancidEggs || 0;
    this.charms = saveData?.charms || [];

    // ── Animation ─────────────────────────────────────────────────────────
    this._animPlaying = null;
    this._playAnim('idle');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // UPDATE LOOP
  // ══════════════════════════════════════════════════════════════════════════
  
  update(dt, inp = {}) {
    if (this.state.isDead) return;

    const s = this.state;
    s.onGround = this.sprite.body.touching.down || this.sprite.body.blocked.down;
    s.onWall   = (this.sprite.body.touching.left || this.sprite.body.blocked.left)  ? -1 :
                 (this.sprite.body.touching.right || this.sprite.body.blocked.right) ?  1 : 0;

    // Coyote time
    if (s.onGround) {
      s.coyoteTimer = 0.12;
      s.canDoubleJump = this.abilities.doublejump;
    } else if (s.coyoteTimer > 0) {
      s.coyoteTimer -= dt;
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

    // SESSION 8: Update sprite facing direction
    if (s.facing === -1 && !this.sprite.flipX) {
      this.sprite.setFlipX(true);
    } else if (s.facing === 1 && this.sprite.flipX) {
      this.sprite.setFlipX(false);
    }

    // Priority order of actions
    if      (s.isHurt)      this._updateHurt(dt);
    else if (s.isDashing)   this._updateDash(dt);
    else if (s.isAttacking) this._updateAttack(dt);
    else if (s.isFocusing)  this._handleFocus(dt, inp);
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
    if (s.onWall !== 0 && !s.onGround && this.abilities.walljump) {
      const vy = this.sprite.body.velocity.y;
      if (vy > 50) this.sprite.setVelocityY(50);
      s.wallClingTime += dt;
      this._playAnim('wall_cling');
    } else {
      s.wallClingTime = 0;
    }

    // Auto-action animation
    if (!s.isDashing && !s.isAttacking && !s.isFocusing) {
      if (s.onWall !== 0 && !s.onGround && this.abilities.walljump) {
        this._playAnim('wall_cling');
      } else if (!s.onGround) {
        this._playAnim(this.sprite.body.velocity.y < -20 ? 'jump' : 'fall');
      } else if (Math.abs(this.sprite.body.velocity.x) > 10) {
        this._playAnim('run');
      } else {
        this._playAnim('idle');
      }
    }

    // I-frame flicker
    if (s.iframeTimer > 0) {
      this.sprite.setAlpha(Math.floor(s.iframeTimer * 20) % 2 === 0 ? 0.5 : 1);
    } else {
      this.sprite.setAlpha(1);
    }
  }

  _handleMovement(dt, inp) {
    const s = this.state;
    const speed = C.KNIGHT_SPEED;

    if (inp.left && !inp.right) {
      this.sprite.setVelocityX(-speed);
      s.facing = -1;
    } else if (inp.right && !inp.left) {
      this.sprite.setVelocityX(speed);
      s.facing = 1;
    }

    // Hard turn
    const vx = this.sprite.body.velocity.x;
    if ((inp.left && vx > 0) || (inp.right && vx < 0)) {
      this.sprite.setVelocityX(vx * 0.5);
    }
  }

  _handleJump(dt, inp) {
    const s = this.state;
    
    if (s.jumpBufferTimer > 0 && s.canJump) {
      // Wall jump
      if (s.onWall !== 0 && this.abilities.walljump && s.wallClingTime > 0.05) {
        this.sprite.setVelocity(s.onWall * -180, -C.KNIGHT_JUMP);
        s.canJump = false;
        s.jumpBufferTimer = 0;
        s.wallClingTime = 0;
        this._playAnim('jump');
        this.scene._audio?.playSfx('sfx_jump');
        return;
      }

      // Ground / coyote jump
      if (s.onGround || s.coyoteTimer > 0) {
        this.sprite.setVelocityY(-C.KNIGHT_JUMP);
        s.canJump = false;
        s.coyoteTimer = 0;
        s.jumpBufferTimer = 0;
        this._playAnim('jump');
        this.scene._audio?.playSfx('sfx_jump');
        return;
      }

      // Double jump
      if (s.canDoubleJump && this.abilities.doublejump) {
        this.sprite.setVelocityY(-C.KNIGHT_JUMP * 0.9);
        s.canDoubleJump = false;
        s.jumpBufferTimer = 0;
        this._playAnim('double_jump');
        this.scene._audio?.playSfx('sfx_jump');
        return;
      }
    }

    // Reset jump when grounded
    if (s.onGround) s.canJump = true;

    // Variable jump height
    if (!inp.jump && this.sprite.body.velocity.y < -50) {
      this.sprite.setVelocityY(this.sprite.body.velocity.y * 0.5);
    }
  }

  _handleDash(dt, inp) {
    const s = this.state;
    if (!inp.dash || !s.canDash || !this.abilities.dash) return;
    if (s.isAttacking || s.isFocusing) return;

    s.isDashing = true;
    s.canDash = false;
    s.dashTimer = C.KNIGHT_DASH_TIME;
    s.dashCdTimer = C.KNIGHT_DASH_CD;

    const dir = (inp.left && !inp.right) ? -1 : (inp.right && !inp.left) ? 1 : s.facing;
    this.sprite.setVelocity(dir * C.KNIGHT_DASH_SPEED, 0);
    s.facing = dir;

    this._playAnim('dash');
    this.scene._audio?.playSfx('sfx_dash');

    // Dash invulnerability
    s.iframeTimer = C.KNIGHT_DASH_TIME;
  }

  _updateDash(dt) {
    const s = this.state;
    if (s.dashTimer <= 0) {
      s.isDashing = false;
      this.sprite.setVelocityX(this.sprite.body.velocity.x * 0.7);
    }
  }

  _handleAttack(dt, inp) {
    const s = this.state;
    if (!inp.attack || !s.canAttack) return;
    if (s.isDashing) return;

    s.isAttacking = true;
    s.canAttack = false;
    s.attackTimer = 0.35;
    s.attackCdTimer = 0.4;

    // Determine attack direction
    let attackDir = 'h';
    if (inp.up) attackDir = 'up';
    else if (inp.down && !s.onGround) attackDir = 'down';

    this._performAttack(attackDir);
    this._playAnim(`attack_${attackDir}`);
    this.scene._audio?.playSfx('sfx_nail');
  }

  _updateAttack(dt) {
    if (this.state.attackTimer <= 0) {
      this.state.isAttacking = false;
    }
  }

  _performAttack(dir) {
    const s = this.state;
    const range = 40;
    const damage = 5;
    
    let hitX = this.sprite.x + (s.facing * range / 2);
    let hitY = this.sprite.y;
    let hitW = range;
    let hitH = 30;

    if (dir === 'up') {
      hitX = this.sprite.x;
      hitY = this.sprite.y - range / 2;
      hitW = 30;
      hitH = range;
    } else if (dir === 'down') {
      hitX = this.sprite.x;
      hitY = this.sprite.y + range / 2;
      hitW = 30;
      hitH = range;
    }

    // Create slash effect
    this._createSlashEffect(dir);

    // Hit enemies
    this.scene._enemies?.forEach(enemy => {
      if (enemy.isDead) return;
      const ex = enemy.sprite.x;
      const ey = enemy.sprite.y;
      if (Math.abs(ex - hitX) < hitW / 2 && Math.abs(ey - hitY) < hitH / 2) {
        enemy.takeDamage(damage);
        
        // Knockback
        const kbDir = Math.sign(ex - this.sprite.x);
        enemy.sprite.setVelocity(kbDir * 150, -100);
      }
    });

    // Down slash bounce
    if (dir === 'down' && this.sprite.body.velocity.y > 0) {
      this.sprite.setVelocityY(-200);
    }
  }

  _createSlashEffect(dir) {
    const angle = dir === 'up' ? -90 : dir === 'down' ? 90 : (this.state.facing === 1 ? 0 : 180);
    const offsetX = dir === 'h' ? this.state.facing * 20 : 0;
    const offsetY = dir === 'up' ? -20 : dir === 'down' ? 20 : 0;

    const slash = this.scene.add.sprite(
      this.sprite.x + offsetX,
      this.sprite.y + offsetY,
      'slash_effect',
      0
    );
    slash.setAngle(angle);
    slash.setDepth(C.LAYER_FX);

    const animKey = `slash_${dir}`;
    slash.play(animKey);
    slash.once('animationcomplete', () => slash.destroy());
  }

  _handleFocus(dt, inp) {
    const s = this.state;
    
    if (inp.focus && this.soul >= C.SOUL_FOCUS_COST && !s.onWall) {
      if (!s.isFocusing) {
        s.isFocusing = true;
        this._playAnim('focus');
        this.scene._audio?.playSfx('sfx_focus_start');
      }
      
      // Heal over time
      if (this.masks < this.masksMax) {
        s.chargeTimer += dt;
        if (s.chargeTimer >= C.SOUL_FOCUS_TIME) {
          this.heal(1);
          this.soul -= C.SOUL_FOCUS_COST;
          s.chargeTimer = 0;
          this.scene._audio?.playSfx('sfx_focus_heal');
          
          // Focus particles
          this._spawnFocusParticles();
        }
      }
    } else {
      if (s.isFocusing) {
        s.isFocusing = false;
        s.chargeTimer = 0;
        this.scene._audio?.playSfx('sfx_focus_cancel');
      }
    }
  }

  _handleCast(dt, inp) {
    if (!inp.cast || !this.abilities.fireball) return;
    if (this.soul < C.SOUL_SPELL_COST) return;

    this.soul -= C.SOUL_SPELL_COST;
    this._castFireball();
    this.scene._audio?.playSfx('sfx_fireball');
  }

  _castFireball() {
    const fb = this.scene.add.sprite(
      this.sprite.x + this.state.facing * 20,
      this.sprite.y - 5,
      'fireball',
      0
    );
    this.scene.physics.add.existing(fb);
    fb.body.setVelocityX(this.state.facing * 300);
    fb.setDepth(C.LAYER_FX);
    fb.play('fireball_travel');

    // Collision with enemies
    setTimeout(() => {
      this.scene.physics.add.overlap(fb, this.scene._enemies?.map(e => e.sprite), (fbSprite, enemySprite) => {
        const enemy = this.scene._enemies.find(e => e.sprite === enemySprite);
        if (enemy && !enemy.isDead) {
          enemy.takeDamage(10);
          fb.play('fireball_burst');
          fb.body.setVelocity(0, 0);
          setTimeout(() => fb.destroy(), 200);
        }
      });
    }, 10);

    // Auto-destroy after 2 seconds
    setTimeout(() => {
      if (fb.active) fb.destroy();
    }, 2000);
  }

  _handleNailCharge(dt, inp) {
    // Placeholder for charged nail attacks
  }

  _spawnFocusParticles() {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = 20 + Math.random() * 10;
      const particle = this.scene.add.sprite(
        this.sprite.x + Math.cos(angle) * dist,
        this.sprite.y + Math.sin(angle) * dist,
        'particle_soul'
      );
      particle.setAlpha(0.8);
      particle.setDepth(C.LAYER_FX);
      
      this.scene.tweens.add({
        targets: particle,
        x: this.sprite.x,
        y: this.sprite.y - 10,
        alpha: 0,
        duration: 600,
        ease: 'Cubic.easeIn',
        onComplete: () => particle.destroy(),
      });
    }
  }

  takeDamage(amount) {
    if (this.state.iframeTimer > 0 || this.state.isDead) return;

    this.masks -= amount;
    this.state.iframeTimer = 1.5;
    this.state.isHurt = true;
    this.state.isAttacking = false;
    this.state.isFocusing = false;

    // Knockback
    const kbDir = this.state.facing * -1;
    this.sprite.setVelocity(kbDir * 200, -150);

    this._playAnim('hurt');
    this.scene._audio?.playSfx('sfx_damage');

    // Flash white
    this.sprite.setTint(0xffffff);
    setTimeout(() => this.sprite.clearTint(), 100);

    if (this.masks <= 0) {
      this.die();
    }

    setTimeout(() => {
      this.state.isHurt = false;
    }, 300);
  }

  _updateHurt(dt) {
    // Hurt state handles itself via timer
  }

  heal(amount) {
    this.masks = Math.min(this.masks + amount, this.masksMax);
  }

  addSoul(amount) {
    this.soul = Math.min(this.soul + amount, C.SOUL_MAX);
  }

  addGeo(amount) {
    this.geo += amount;
  }

  die() {
    if (this.state.isDead) return;
    this.state.isDead = true;
    this._playAnim('death');
    this.sprite.setVelocity(0, 0);
    this.scene._audio?.playSfx('sfx_death');
    
    // Respawn after delay
    setTimeout(() => {
      this.scene._respawnKnight();
    }, 2000);
  }

  _playAnim(key) {
    if (this._animPlaying === key) return;
    this._animPlaying = key;
    this.sprite.play(key, true);
  }

  setSize(w, h, ox, oy) {
    this.sprite.body.setSize(w, h);
    this.sprite.body.setOffset(ox, oy);
  }
}
