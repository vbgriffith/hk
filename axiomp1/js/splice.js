// ============================================================
//  AXIOM BREAK — splice.js
//  Signal Splice: Record 3s of movement → deploy ghost clone
//
//  MECHANICS:
//   [E] Start recording — AXIOM-7 records positions for 3 sec
//   [R] Deploy clone    — replay ghost follows recorded path,
//                         fires bullets, and draws enemy attention
//   After clone finishes, system recharges for COOLDOWN ms
// ============================================================

class SpliceSystem {
  constructor(scene) {
    this.scene      = scene;
    this.state      = 'READY'; // READY | RECORDING | STORED | ACTIVE | COOLDOWN
    this.recording  = [];
    this.recTimer   = 0;
    this.coolTimer  = 0;
    this.clone      = null;
    this.cloneIndex = 0;
    this.cloneTimer = 0;

    // Keys handled externally (passed in update)
    this._eJustPressed = false;
    this._rJustPressed = false;
  }

  // Called every frame with player position
  recordFrame(px, py, vx, vy) {
    if (this.state !== 'RECORDING') return;
    this.recording.push({ x: px, y: py, vx, vy });
  }

  // Call from GameScene update
  update(delta, eKey, rKey, playerX, playerY, enemies) {
    // Key edge detection
    const eDown = eKey && eKey.isDown;
    const rDown = rKey && rKey.isDown;

    if (eDown && !this._eWasDown) this._onE(playerX, playerY);
    if (rDown && !this._rWasDown) this._onR();
    this._eWasDown = eDown;
    this._rWasDown = rDown;

    switch (this.state) {

      case 'RECORDING':
        this.recTimer -= delta;
        if (this.recTimer <= 0) {
          this._finishRecording();
        } else {
          const pct = 1 - (this.recTimer / AXIOM.SPLICE.RECORD_DURATION);
          HUD.setSpliceState('REC ' + Math.ceil(pct * 3) + 's');
        }
        break;

      case 'ACTIVE':
        this._updateClone(delta, enemies);
        break;

      case 'COOLDOWN':
        this.coolTimer -= delta;
        if (this.coolTimer <= 0) {
          this.state = 'READY';
          HUD.setSpliceState('READY');
        } else {
          const secs = Math.ceil(this.coolTimer / 1000);
          HUD.setSpliceState('COOL ' + secs + 's');
        }
        break;
    }
  }

  _onE(px, py) {
    if (this.state !== 'READY' && this.state !== 'STORED') return;
    this.recording = [];
    this.recTimer  = AXIOM.SPLICE.RECORD_DURATION;
    this.state     = 'RECORDING';
    HUD.setSpliceState('REC');
    this.scene.spawnParticles(px, py, AXIOM.COLORS.CLONE, 8);
  }

  _finishRecording() {
    if (this.recording.length === 0) {
      this.state = 'READY';
      HUD.setSpliceState('READY');
      return;
    }
    this.state = 'STORED';
    HUD.setSpliceState('SPLICE READY');
    // Flash indicator
    this.scene.cameras.main.flash(80, 0, 180, 255, true);
  }

  _onR() {
    if (this.state !== 'STORED') return;
    if (this.recording.length === 0) return;
    this._deployClone();
  }

  _deployClone() {
    const first = this.recording[0];
    this.clone = new CloneGhost(this.scene, first.x, first.y);
    this.cloneIndex = 0;
    this.cloneTimer = 0;
    this.state      = 'ACTIVE';
    HUD.setSpliceState('ACTIVE');
    this.scene.spawnParticles(first.x, first.y, AXIOM.COLORS.CLONE, 12);
  }

  _updateClone(delta, enemies) {
    if (!this.clone) return;

    // Advance clone through recorded frames
    // Frames captured at ~60fps so each frame ≈ 16ms
    const frameDuration = 16;
    this.cloneTimer += delta;
    const targetFrame = Math.floor(this.cloneTimer / frameDuration);

    if (targetFrame >= this.recording.length) {
      // Clone finished
      this.clone.destroy();
      this.clone      = null;
      this.recording  = [];
      this.state      = 'COOLDOWN';
      this.coolTimer  = AXIOM.SPLICE.COOLDOWN;
      HUD.setSpliceState('COOLDOWN');
      return;
    }

    const frame = this.recording[Math.min(targetFrame, this.recording.length - 1)];
    this.clone.moveTo(frame.x, frame.y);
    this.clone.update(delta);

    // Clone shoots at nearest enemy
    if (targetFrame % 15 === 0 && enemies.length > 0) {
      let nearest = null, nearDist = Infinity;
      for (const e of enemies) {
        if (e.dead) continue;
        const d = Utils.dist(this.clone.x, this.clone.y, e.x, e.y);
        if (d < nearDist) { nearDist = d; nearest = e; }
      }
      if (nearest && nearDist < 350) {
        const angle = Utils.angleTo(this.clone.x, this.clone.y, nearest.x, nearest.y);
        const b = new Bullet(this.scene, this.clone.x, this.clone.y,
          angle, AXIOM.PLAYER.BULLET_SPEED, AXIOM.COLORS.CLONE, 'player');
        this.scene.playerBullets.push(b);
      }
    }

    // Enemies aggro toward clone (distraction effect)
    for (const e of enemies) {
      if (e.dead) continue;
      const d = Utils.dist(this.clone.x, this.clone.y, e.x, e.y);
      if (d < 200) {
        // Nudge enemy toward clone instead of player
        const angle = Utils.angleTo(e.x, e.y, this.clone.x, this.clone.y);
        const pull  = e.cfg.SPEED * 0.6 * (delta / 1000);
        e.x += Math.cos(angle) * pull;
        e.y += Math.sin(angle) * pull;
      }
    }
  }

  destroy() {
    if (this.clone) this.clone.destroy();
  }
}


// ── Clone Ghost visual ───────────────────────────────────────

class CloneGhost {
  constructor(scene, x, y) {
    this.scene  = scene;
    this.gfx    = scene.add.graphics();
    this.x      = x;
    this.y      = y;
    this._tick  = 0;
    this._draw();
  }

  get x() { return this.gfx.x; }
  set x(v) { this.gfx.x = v; }
  get y() { return this.gfx.y; }
  set y(v) { this.gfx.y = v; }

  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }

  update(delta) {
    this._tick += delta;
    const pulse = 0.3 + 0.2 * Math.sin(this._tick / 150);
    this._draw(AXIOM.SPLICE.CLONE_ALPHA + pulse * 0.15);
  }

  _draw(alpha = AXIOM.SPLICE.CLONE_ALPHA) {
    const g = this.gfx;
    const s = AXIOM.PLAYER.SIZE;
    const c = AXIOM.COLORS.CLONE;
    g.clear();

    // Outer glow ring
    g.lineStyle(1, c, alpha * 0.4);
    g.strokeCircle(0, 0, s + 6);

    // Ghost diamond (dashed feel via segments)
    g.lineStyle(1.5, c, alpha);
    g.fillStyle(c, alpha * 0.2);
    g.fillTriangle(-s, 0, 0, -s, s, 0);
    g.fillTriangle(-s, 0, 0,  s, s, 0);
    g.strokeTriangle(-s, 0, 0, -s, s, 0);
    g.strokeTriangle(-s, 0, 0,  s, s, 0);

    // Scanline cross
    g.lineStyle(1, c, alpha * 0.5);
    g.strokeLineShape({ x1: -s, y1: 0, x2: s, y2: 0 });
    g.strokeLineShape({ x1: 0, y1: -s, x2: 0, y2: s });
  }

  destroy() {
    this.gfx.destroy();
  }
}
