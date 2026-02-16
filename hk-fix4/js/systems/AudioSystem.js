/* js/systems/SaveSystem.js */
'use strict';

class SaveSystem {
  static defaultSave() {
    return {
      geo: 0,
      masks: C.MASK_MAX,
      soul: 0,
      dreamEssence: 0,
      abilities: {
        dash: false,
        doublejump: false,
        walljump: false,
        isma_tear: false,
        shade_cloak: false,
        fireball: false,
        dive: false,
        scream: false,
        great_slash: false,
        cyclone_slash: false,
        dash_slash: false,
        dreamnail: false,
      },
      charms:      [],      // equipped charms
      ownedCharms: [],      // all charms collected
      charmSlots:  3,
      visitedRooms: [],
      benchRoom:  'crossroads_entrance',
      benchSpawn: 'default',
      npcsInteracted: [],
      itemsCollected: [],
      flags: {},            // boss defeats, story flags
      playTime: 0,
      deaths: 0,
      shade: null,          // { room, x, y, geo }
    };
  }

  static save(data) {
    try {
      localStorage.setItem(C.SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('SaveSystem: could not write to localStorage', e);
      return false;
    }
  }

  static load() {
    try {
      const raw = localStorage.getItem(C.SAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Merge with defaults to handle version upgrades
      const merged = Object.assign(SaveSystem.defaultSave(), parsed);
      // Ensure critical object fields are never null/undefined
      if (!merged.flags         || typeof merged.flags !== 'object')         merged.flags = {};
      if (!merged.abilities     || typeof merged.abilities !== 'object')     merged.abilities = SaveSystem.defaultSave().abilities;
      if (!Array.isArray(merged.charms))         merged.charms = [];
      if (!Array.isArray(merged.ownedCharms))    merged.ownedCharms = [];
      if (!Array.isArray(merged.visitedRooms))   merged.visitedRooms = [];
      if (!Array.isArray(merged.itemsCollected)) merged.itemsCollected = [];
      if (!Array.isArray(merged.npcsInteracted)) merged.npcsInteracted = [];
      return merged;
    } catch (e) {
      console.warn('SaveSystem: corrupted save', e);
      return null;
    }
  }

  static clear() {
    localStorage.removeItem(C.SAVE_KEY);
  }
}

/* ── Audio System ───────────────────────────────────────────────────────── */
class AudioSystem {
  constructor(scene) {
    this.scene  = scene;
    this._music = null;
    this._sfx   = {};
    this._muted = false;
  }

  playMusic(key, { fade = 800, loop = true } = {}) {
    if (this._music?.key === key && this._music.isPlaying) return;

    const next = this.scene.sound.add(key, {
      loop, volume: 0,
    });

    if (this._music) {
      const old = this._music;
      this.scene.tweens.add({
        targets: old, volume: 0, duration: fade,
        onComplete: () => old.destroy(),
      });
    }

    next.play();
    this.scene.tweens.add({
      targets: next, volume: C.MUSIC_VOL, duration: fade,
    });
    this._music = next;
  }

  stopMusic(fade = 600) {
    if (!this._music) return;
    const old = this._music;
    this.scene.tweens.add({
      targets: old, volume: 0, duration: fade,
      onComplete: () => old.destroy(),
    });
    this._music = null;
  }

  playSfx(key, { volume = C.SFX_VOL, detune = 0 } = {}) {
    if (this._muted) return;
    if (!this.scene.cache.audio.exists(key)) return;
    this.scene.sound.play(key, { volume, detune });
  }

  setMuted(v) {
    this._muted = v;
    this.scene.sound.mute = v;
  }

  destroy() {
    this._music?.destroy();
  }
}

/* ── Camera System ──────────────────────────────────────────────────────── */
class CameraSystem {
  constructor(scene) {
    this.scene  = scene;
    this.cam    = scene.cameras.main;
    this._shake = 0;
  }

  follow(target, worldW, worldH) {
    this.cam.startFollow(target, true, 0.08, 0.08);
    this.cam.setBounds(0, 0, worldW, worldH);
    this.cam.setZoom(C.SCALE);
    this.cam.setBackgroundColor('#0d0d12');
    this.cam.setRoundPixels(true);
  }

  shake(intensity = 3, duration = 180) {
    this.cam.shake(duration, intensity / C.SCALE);
  }

  flash(colour = 0xffffff, duration = 80) {
    this.cam.flash(duration, (colour >> 16) & 0xff,
                             (colour >> 8)  & 0xff,
                              colour        & 0xff, true);
  }

  fadeOut(duration = 400, callback) {
    this.cam.fadeOut(duration, 0, 0, 0);
    if (callback) {
      this.cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, callback);
    }
  }

  fadeIn(duration = 400) {
    this.cam.fadeIn(duration, 0, 0, 0);
  }

  panTo(x, y, duration = 500, ease = 'Sine.easeInOut') {
    this.cam.pan(x, y, duration, ease);
  }
}

/* ── Particle System ────────────────────────────────────────────────────── */
class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
  }

  /** Burst of particles at a world position */
  burst({ x, y, texture = 'particle', frame = 0, count = 8,
          speedX = [-80, 80], speedY = [-120, -20],
          scale = [0.5, 1.5], alpha = [1, 0],
          tint = 0xffffff, lifespan = 400, gravityY = 200 }) {

    const emitter = this.scene.add.particles(x, y, texture, {
      frame,
      quantity:  count,
      lifespan,
      speedX, speedY,
      scale: { start: scale[0], end: 0 },
      alpha: { start: alpha[0], end: alpha[1] },
      tint,
      gravityY,
      emitting: false,
    });

    emitter.setDepth(C.LAYER_PARTICLES);
    emitter.explode(count);

    // Auto-destroy after particles die
    this.scene.time.delayedCall(lifespan + 50, () => {
      if (emitter?.active) emitter.destroy();
    });

    return emitter;
  }

  /** Continuous trail emitter — caller responsible for destroying */
  trail({ x, y, texture = 'particle', tint = 0xffffff,
          frequency = 40, lifespan = 250 }) {
    const emitter = this.scene.add.particles(x, y, texture, {
      tint, lifespan, frequency,
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.7, end: 0 },
      speedX: [-20, 20], speedY: [-20, 20],
    });
    emitter.setDepth(C.LAYER_PARTICLES - 1);
    return emitter;
  }

  /** Soul burst effect */
  soul({ x, y, count = 6 }) {
    this.burst({ x, y, texture: 'particle_soul', count,
                 speedX: [-60, 60], speedY: [-100, -40],
                 scale: [0.8, 0], tint: 0x5ae3e3,
                 lifespan: 500, gravityY: -30 });
  }

  /** Geo collect sparkle */
  geo({ x, y, count = 4 }) {
    this.burst({ x, y, texture: 'particle_geo', count,
                 speedX: [-50, 50], speedY: [-80, -10],
                 scale: [1, 0], tint: 0xe8c84a,
                 lifespan: 350, gravityY: 150 });
  }

  /** Blood / ichor hit burst */
  hitBurst({ x, y, count = 10, colour = 0xaaffaa }) {
    this.burst({ x, y, texture: 'particle', count,
                 speedX: [-100, 100], speedY: [-120, 20],
                 scale: [1.2, 0], tint: colour,
                 lifespan: 300, gravityY: 300 });
  }

  /** Dash afterimage — simple sprite ghost */
  dashGhost(sprite) {
    const ghost = this.scene.add.sprite(sprite.x, sprite.y, sprite.texture.key);
    ghost.setFrame(sprite.frame.name);
    ghost.setFlipX(sprite.flipX);
    ghost.setAlpha(0.5);
    ghost.setTint(0x99ccff);
    ghost.setDepth(C.LAYER_ENTITY - 1);

    this.scene.tweens.add({
      targets: ghost, alpha: 0, duration: 150,
      onComplete: () => ghost.destroy(),
    });
  }
}
