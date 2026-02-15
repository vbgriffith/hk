/* js/entities/NPC.js — Interactive NPC with dialogue */
'use strict';

class NPC extends Entity {
  constructor(scene, x, y, type, dialogueKey, id) {
    super(scene, x, y, type, 0);

    this.npcType    = type;
    this.dialogueKey= dialogueKey;
    this.npcId      = id;
    this.interacted = false;
    this._talkIndex = 0;

    this.sprite.setDepth(C.LAYER_ENTITY);
    this.setSize(16, 22, 8, 10);
    this.sprite.setGravityY(C.GRAVITY);

    // Interaction prompt (will be shown when player is near)
    this._prompt = null;
    this._promptVisible = false;

    this._playIdle();
  }

  update(dt) {
    if (!this.alive) return;
    const player = this.scene.knight;
    if (!player) return;

    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    const inRange = dist < 40;

    if (inRange !== this._promptVisible) {
      this._promptVisible = inRange;
      this._setPrompt(inRange);
    }
  }

  _setPrompt(visible) {
    if (visible) {
      this._prompt = this.scene.add.text(this.x, this.y - 26, '[E]', {
        fontFamily: 'Cinzel',
        fontSize: 6,
        color: '#d4cfc9',
        alpha: 0.9,
      }).setDepth(C.LAYER_UI - 1).setOrigin(0.5);
    } else {
      if (this._prompt) { this._prompt.destroy(); this._prompt = null; }
    }
  }

  tryInteract() {
    if (!this._promptVisible) return false;
    const lines = this._getDialogueLines();
    if (!lines || lines.length === 0) return false;

    this.scene._dialogue.show(lines, () => {
      this.interacted = true;
      this._talkIndex = Math.min(this._talkIndex + 1,
        this._getDialogueKeys().length - 1);
    });

    this._playTalk();
    return true;
  }

  _getDialogueKeys() {
    const def = DIALOGUE[this.dialogueKey];
    if (!def) return ['generic'];
    return Object.keys(def);
  }

  _getDialogueLines() {
    const def = DIALOGUE[this.dialogueKey];
    if (!def) return [];
    const keys = this._getDialogueKeys();
    const key  = keys[Math.min(this._talkIndex, keys.length - 1)];
    return def[key] || def[keys[0]] || [];
  }

  _playIdle() {
    const key = `${this.npcType}_idle`;
    if (this.scene.anims.exists(key)) this.sprite.play(key);
  }

  _playTalk() {
    const key = `${this.npcType}_talk`;
    if (this.scene.anims.exists(key)) this.sprite.play(key);
    this.later(2000, () => this._playIdle());
  }

  destroy() {
    if (this._prompt) this._prompt.destroy();
    super.destroy();
  }
}


/* ── Projectile ─────────────────────────────────────────────────────────── */
class Projectile {
  constructor(scene, { x, y, vx, vy, texture = 'fireball', dmg = 5,
                       owner = 'player', tint = 0xffffff, lifespan = 1500 }) {
    this.scene  = scene;
    this.owner  = owner;
    this.dmg    = dmg;
    this.alive  = true;

    this.sprite = scene.physics.add.sprite(x, y, texture, 0);
    this.sprite.setDepth(C.LAYER_PARTICLES + 1);
    this.sprite.setTint(tint);
    this.sprite.entity = this;
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setVelocity(vx, vy);

    // Play anim
    const animKey = `${texture}_travel`;
    if (scene.anims.exists(animKey)) this.sprite.play(animKey);

    // Flip toward direction
    this.sprite.setFlipX(vx < 0);

    // Auto-destroy
    scene.time.delayedCall(lifespan, () => this.burst());
  }

  update(dt) {
    if (!this.alive) return;
    // Wrap check – destroy if off world
    const bounds = this.scene._worldBounds;
    if (bounds && (
        this.sprite.x < bounds.left || this.sprite.x > bounds.right ||
        this.sprite.y < bounds.top  || this.sprite.y > bounds.bottom)) {
      this.burst();
    }
  }

  burst() {
    if (!this.alive) return;
    this.alive = false;

    const burstKey = `${this.sprite.texture.key}_burst`;
    if (this.scene.anims.exists(burstKey)) {
      this.sprite.setVelocity(0, 0);
      this.sprite.body.setEnable(false);
      this.sprite.play(burstKey);
      this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE,
        () => this.sprite.destroy());
    } else {
      this.sprite.destroy();
    }
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
}


/* ── Geo Shard ──────────────────────────────────────────────────────────── */
class Shard {
  constructor(scene, x, y, value) {
    this.scene  = scene;
    this.value  = value;
    this.alive  = true;
    this._timer = 0;
    this._magnetDist = C.GEO_BASE_ATTRACT;

    const size = value >= 10 ? 2 : (value >= 5 ? 1 : 0);
    const animKey = `geo_spin_${['s','m','l'][size]}`;

    this.sprite = scene.physics.add.sprite(x, y, 'geo', size);
    this.sprite.setDepth(C.LAYER_ENTITY - 1);
    this.sprite.setGravityY(C.GRAVITY * 0.6);
    this.sprite.setCollideWorldBounds(false);
    this.sprite.entity = this;

    if (scene.anims.exists(animKey)) this.sprite.play(animKey);

    // Launch in random direction
    const angle = Phaser.Math.Between(-160, -20) * (Math.PI / 180);
    const spd   = Phaser.Math.Between(40, 100);
    this.sprite.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);

    // Bounce briefly
    this.sprite.setBounce(0.4);
  }

  update(dt) {
    if (!this.alive) return;
    this._timer += dt;
    if (this._timer < 0.4) return;  // brief settle time

    const player = this.scene.knight;
    if (!player) return;

    const dx = player.x - this.sprite.x;
    const dy = player.y - this.sprite.y;
    const dist = Math.hypot(dx, dy);

    // Magnet
    if (dist < this._magnetDist) {
      const spd = 200 + (1 - dist / this._magnetDist) * 200;
      this.sprite.setVelocity((dx / dist) * spd, (dy / dist) * spd);
    }

    // Collect
    if (dist < 12) {
      player.collectGeo(this.value);
      this.alive = false;
      this.sprite.destroy();
    }
  }
}


/* ── Shade (lost geo when dead) ─────────────────────────────────────────── */
class Shade extends Entity {
  constructor(scene, x, y, geo) {
    super(scene, x, y, 'shade', 0);

    this.geo   = geo;
    this._collected = false;

    this.setSize(12, 20, 10, 12);
    this.sprite.setGravityY(C.GRAVITY);
    this.sprite.setAlpha(0);
    this.sprite.setDepth(C.LAYER_ENTITY + 0.5);

    // Fade in
    scene.tweens.add({ targets: this.sprite, alpha: 0.85, duration: 600 });

    // Eerie pulse
    scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.05, scaleY: 0.95,
      duration: 900,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    AnimationManager.safePlay(this.sprite, 'shade_idle');
  }

  update(dt) {
    if (this._collected || !this.alive) return;

    const player = this.scene.knight;
    if (!player) return;

    // Confront — attack when player is close
    const dist = Math.hypot(player.x - this.x, player.y - this.y);

    if (dist < 20) {
      this._collect(player);
      return;
    }

    // Drift slowly toward player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const spd = 30;
    this.body.setVelocity(
      (dx / dist) * spd,
      this.body.blocked.down ? 0 : (dy / dist) * spd * 0.3
    );
  }

  _collect(player) {
    this._collected = true;
    player.collectGeo(this.geo);
    this.scene._audio.playSfx('sfx_shade_collect');
    this.scene._particles.soul({ x: this.x, y: this.y, count: 12 });
    this.scene.tweens.add({
      targets: this.sprite, alpha: 0, scaleX: 2, scaleY: 2,
      duration: 400,
      onComplete: () => this.destroy(),
    });
    this._collected = true;
  }
}
