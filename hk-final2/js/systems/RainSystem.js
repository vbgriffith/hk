/* js/systems/RainSystem.js — City of Tears rain effect */
'use strict';

class RainSystem {
  constructor(scene) {
    this.scene    = scene;
    this._drops   = [];
    this._splashes= [];
    this._active  = false;
    this._graphics= scene.add.graphics()
      .setScrollFactor(0).setDepth(C.LAYER_FG + 2);
  }

  start() {
    if (this._active) return;
    this._active = true;
    this._spawnDrops();
  }

  stop() {
    this._active = false;
    this._drops   = [];
    this._splashes= [];
    this._graphics.clear();
  }

  _spawnDrops() {
    const W = C.WIDTH, H = C.HEIGHT;
    this._drops = [];
    for (let i = 0; i < C.RAIN_DROP_COUNT; i++) {
      this._drops.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: -0.5,
        vy: Phaser.Math.FloatBetween(C.RAIN_SPEED_MIN, C.RAIN_SPEED_MAX) / 60,
        len: Phaser.Math.FloatBetween(4, 10),
        alpha: Phaser.Math.FloatBetween(0.15, 0.45),
        layer: Math.random(), // 0=far/slow, 1=near/fast
      });
    }
  }

  update(dt) {
    if (!this._active) return;
    const W = C.WIDTH, H = C.HEIGHT;
    const g = this._graphics;
    g.clear();

    for (const d of this._drops) {
      const speed = d.layer < 0.4 ? 0.6 : 1.0;  // parallax
      d.x += d.vx * speed * 60 * dt;
      d.y += d.vy * speed * 60 * dt;

      // Wrap
      if (d.y > H + 12) { d.y = -12; d.x = Math.random() * W; }
      if (d.x < -5)     { d.x = W + 5; }

      // Draw
      const alpha = d.alpha * (d.layer < 0.4 ? 0.5 : 1.0);
      const col = Phaser.Display.Color.GetColor32(
        Math.floor(100 + d.layer * 80),
        Math.floor(120 + d.layer * 80),
        Math.floor(200 + d.layer * 55),
        Math.floor(alpha * 255)
      );
      g.lineStyle(d.layer < 0.4 ? 0.5 : 0.8, 0x8899cc, alpha);
      g.lineBetween(d.x, d.y, d.x + d.vx * d.len * speed, d.y + d.vy * d.len * speed * -0.5);
    }

    // Splash particles on ground
    this._splashes = this._splashes.filter(s => s.life > 0);
    for (const s of this._splashes) {
      s.life -= dt;
      s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 200 * dt;
      const a = Math.max(0, s.life / s.maxLife * 0.4);
      g.fillStyle(0x8899cc, a);
      g.fillCircle(s.x, s.y, 0.8);
    }

    // Spawn splashes on platforms periodically
    if (Math.random() < 0.3) {
      const platforms = this.scene._platforms?.getChildren() ?? [];
      if (platforms.length > 0) {
        const plat = platforms[Math.floor(Math.random() * platforms.length)];
        const b = plat.getBounds();
        const sx = b.left + Math.random() * b.width;
        for (let i = 0; i < 2; i++) {
          this._splashes.push({
            x: sx, y: b.top,
            vx: Phaser.Math.FloatBetween(-25, 25),
            vy: Phaser.Math.FloatBetween(-40, -15),
            life: 0.35, maxLife: 0.35,
          });
        }
      }
    }
  }

  destroy() {
    this.stop();
    this._graphics.destroy();
  }
}
