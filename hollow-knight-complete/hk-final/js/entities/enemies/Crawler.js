/* js/entities/enemies/Crawler.js — Mask-wearing crawler enemy */
'use strict';

class Crawler extends Entity {
  constructor(scene, x, y, data = {}) {
    super(scene, x, y, 'crawler', 0);

    this.hp       = C.CRAWLER_HP;
    this.maxHp    = C.CRAWLER_HP;
    this.dmg      = C.CRAWLER_DMG;
    this.geoReward= data.geoReward ?? 4;

    this.facingDir   = data.dir ?? 1;
    this.patrolLeft  = data.patrolLeft  ?? x - 80;
    this.patrolRight = data.patrolRight ?? x + 80;

    this._aiState    = 'walk';   // walk | turn | attack | stun | dead
    this._aiTimer    = 0;
    this._turnCd     = 0;
    this._attackCd   = 0;
    this._staggerHits= 0;

    this.sprite.setDepth(C.LAYER_ENTITY);
    this.setSize(20, 14, 6, 8);
    this.sprite.setGravityY(C.GRAVITY);
    this.sprite.setCollideWorldBounds(false);

    this._play('walk');
  }

  // ── Main update ───────────────────────────────────────────────────────────
  update(dt) {
    if (!this.alive) return;

    switch (this._aiState) {
      case 'walk':    this._aiWalk(dt);   break;
      case 'turn':    this._aiTurn(dt);   break;
      case 'attack':  this._aiAttack(dt); break;
      case 'stun':    this._aiStun(dt);   break;
    }

    this.sprite.setFlipX(this.facingDir < 0);
  }

  // ── AI states ─────────────────────────────────────────────────────────────
  _aiWalk(dt) {
    this._aiTimer -= dt;
    this._attackCd -= dt;
    this._turnCd   -= dt;

    const spd = C.CRAWLER_SPEED;
    this.body.setVelocityX(this.facingDir * spd);

    // Patrol bounds or wall/edge
    const atLeftBound  = this.x <= this.patrolLeft  || this.body.blocked.left;
    const atRightBound = this.x >= this.patrolRight || this.body.blocked.right;
    const atEdge       = this._isNearEdge();

    if ((atLeftBound && this.facingDir < 0) ||
        (atRightBound && this.facingDir > 0) ||
        atEdge) {
      if (this._turnCd <= 0) {
        this._setState('turn');
      }
    }

    // Aggro check — attack if player is close
    const player = this.scene.knight;
    if (player && this._attackCd <= 0) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      if (Math.abs(dx) < 40 && Math.abs(dy) < 20 &&
          Math.sign(dx) === this.facingDir) {
        this._setState('attack');
      }
    }
  }

  _aiTurn(dt) {
    this._aiTimer -= dt;
    this.body.setVelocityX(0);

    if (this._aiTimer <= 0) {
      this.facingDir *= -1;
      this._turnCd = C.CRAWLER_TURN_CD;
      this._setState('walk');
    }
  }

  _aiAttack(dt) {
    this._aiTimer -= dt;
    this.body.setVelocityX(this.facingDir * C.CRAWLER_SPEED * 1.8);

    // Check hit on player
    const player = this.scene.knight;
    if (player && !this._hitPlayer) {
      const dx = Math.abs(player.x - this.x);
      const dy = Math.abs(player.y - this.y);
      if (dx < 24 && dy < 18) {
        player.onHit(this.dmg, this);
        this._hitPlayer = true;
      }
    }

    if (this._aiTimer <= 0) {
      this._hitPlayer   = false;
      this._attackCd    = 1.5;
      this._setState('walk');
    }
  }

  _aiStun(dt) {
    this._aiTimer -= dt;
    this.body.setVelocityX(0);
    if (this._aiTimer <= 0) {
      this._staggerHits = 0;
      this._setState('walk');
    }
  }

  // ── State transitions ─────────────────────────────────────────────────────
  _setState(next) {
    this._aiState = next;
    switch (next) {
      case 'walk':
        this._aiTimer = 0;
        this._play('walk');
        break;
      case 'turn':
        this._aiTimer = 0.35;
        this._play('turn');
        break;
      case 'attack':
        this._aiTimer = 0.4;
        this._play('attack');
        break;
      case 'stun':
        this._aiTimer = 0.5;
        this._play('stun');
        break;
    }
  }

  // ── Receive damage ────────────────────────────────────────────────────────
  onHit(damage, source) {
    if (!this.alive) return;

    this.hp -= damage;

    // Flash white
    this.sprite.setTint(0xffffff);
    this.later(80, () => this.sprite.clearTint());

    // Stagger
    this._staggerHits++;
    if (this._staggerHits >= 2) {
      this._setState('stun');
    }

    // Knockback
    const kbDir = source ? Math.sign(this.x - source.x) || 1 : -this.facingDir;
    this.body.setVelocity(kbDir * 120, -60);

    if (this.hp <= 0) this._die();
  }

  _die() {
    if (!this.alive) return;
    this.alive = false;
    this._aiState = 'dead';

    this.sprite.setDepth(C.LAYER_ENTITY - 1);
    this.body.setEnable(false);

    // Play death animation then destroy
    AnimationManager.playThen(this.sprite, 'crawler_death', () => {
      this._spawnGeo();
      this.destroy();
    });

    this.scene._audio.playSfx('sfx_enemy_die');
    this.scene._particles.hitBurst({ x: this.x, y: this.y, count: 12, colour: 0x88ff88 });
    this.scene._camera.shake(2, 80);
  }

  _spawnGeo() {
    this.scene.spawnGeo(this.x, this.y, this.geoReward);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  _isNearEdge() {
    // Raycast downward one tile ahead
    const ahead = this.x + this.facingDir * (C.TILE_SIZE / 2 + 2);
    const below = this.y + 14;
    // Phaser doesn't do raycasts natively; we check if there's ground nearby
    // The scene provides a helper
    if (this.scene._checkGroundAt) {
      return !this.scene._checkGroundAt(ahead, below + 8);
    }
    return false;
  }

  _play(animName) {
    AnimationManager.safePlay(this.sprite, `crawler_${animName}`);
  }
}
