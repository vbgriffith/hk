/* js/entities/Entity.js — Base class for all game entities */
'use strict';

class Entity {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} texture
   * @param {number} [frame]
   */
  constructor(scene, x, y, texture, frame = 0) {
    this.scene   = scene;
    this.alive   = true;
    this.sprite  = scene.physics.add.sprite(x, y, texture, frame);
    this.sprite.setDepth(C.LAYER_ENTITY);
    this.sprite.entity = this;   // back-reference for collision callbacks

    this._timers = [];
  }

  get x() { return this.sprite?.x ?? 0; }
  get y() { return this.sprite?.y ?? 0; }
  set x(v) { if (this.sprite) this.sprite.x = v; }
  set y(v) { if (this.sprite) this.sprite.y = v; }
  set x(v) { this.sprite.x = v; }
  set y(v) { this.sprite.y = v; }

  get body() { return this.sprite.body; }

  setSize(w, h, ox = 0, oy = 0) {
    this.sprite.setBodySize(w, h);
    this.sprite.setOffset(ox, oy);
    return this;
  }

  /**
   * Schedule a callback with a delay.
   * Timers are cleared when entity is destroyed.
   */
  later(ms, fn) {
    const t = this.scene.time.delayedCall(ms, fn);
    this._timers.push(t);
    return t;
  }

  /** Called every frame by the owning scene/manager. */
  update(dt) {}

  /** Override to handle receiving damage. */
  onHit(damage, source) {}

  destroy() {
    this.alive = false;
    for (const t of this._timers) t.remove(false);
    this._timers = [];
    this.sprite.destroy();
  }
}
