/* js/entities/Entity.js — Base class for all game entities */
'use strict';

// A no-op proxy returned from entity.body when the sprite has been destroyed.
// Prevents crashes when collision callbacks or timers fire on dead entities.
const _deadBody = new Proxy({}, {
  get(_, prop) {
    if (prop === 'blocked')  return { down: false, up: false, left: false, right: false };
    if (prop === 'velocity') return { x: 0, y: 0 };
    if (prop === 'onFloor')  return () => false;
    return typeof prop === 'string' ? () => {} : undefined;
  },
  set() { return true; }
});

class Entity {
  constructor(scene, x, y, texture, frame = 0) {
    this.scene  = scene;
    this.alive  = true;
    this.sprite = scene.physics.add.sprite(x, y, texture, frame);
    this.sprite.setDepth(C.LAYER_ENTITY);
    this.sprite.entity = this;
    this._timers = [];
  }

  get x()  { return this.sprite?.x ?? 0; }
  get y()  { return this.sprite?.y ?? 0; }
  set x(v) { if (this.sprite) this.sprite.x = v; }
  set y(v) { if (this.sprite) this.sprite.y = v; }

  // Returns live physics body, or a silent no-op proxy when sprite is destroyed.
  get body() {
    return (this.sprite && this.sprite.body) ? this.sprite.body : _deadBody;
  }

  setSize(w, h, ox = 0, oy = 0) {
    this.sprite.setBodySize(w, h);
    this.sprite.setOffset(ox, oy);
    return this;
  }

  later(ms, fn) {
    const t = this.scene.time.delayedCall(ms, fn);
    this._timers.push(t);
    return t;
  }

  update(dt) {}
  onHit(damage, source) {}

  destroy() {
    this.alive = false;
    for (const t of this._timers) t.remove(false);
    this._timers = [];
    if (this.sprite) this.sprite.destroy();
  }
}
