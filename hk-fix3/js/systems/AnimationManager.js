/* js/systems/AnimationManager.js — Registers all animations with Phaser */
'use strict';

class AnimationManager {
  /**
   * Call once during scene create() after textures are loaded.
   * Reads ANIM_DEFS and registers each animation with Phaser's global
   * AnimationManager so sprites can reference them by key.
   */
  static registerAll(scene) {
    for (const [charKey, charDef] of Object.entries(ANIM_DEFS)) {
      for (const [animName, cfg] of Object.entries(charDef.anims)) {
        const key = `${charKey}_${animName}`;

        // Don't re-register if already exists (multiple scene restarts)
        if (scene.anims.exists(key)) continue;

        scene.anims.create({
          key,
          frames: AnimationManager._buildFrames(scene, charDef.texture, cfg),
          frameRate: cfg.fps,
          repeat: cfg.repeat,
          yoyo: cfg.yoyo || false,
        });
      }
    }
  }

  static _buildFrames(scene, texture, cfg) {
    const { row, frames } = cfg;
    const frameArr = [];
    for (let f = 0; f < frames; f++) {
      frameArr.push({ key: texture, frame: row * 100 + f });
    }
    return frameArr;
  }

  /**
   * Safe play — only plays if not already playing the same animation.
   * Returns true if animation actually changed.
   */
  static safePlay(sprite, key, ignoreIfPlaying = true) {
    if (!sprite || !sprite.active) return false;
    if (ignoreIfPlaying && sprite.anims.currentAnim?.key === key) return false;
    if (!sprite.scene?.anims.exists(key)) return false;
    sprite.play(key);
    return true;
  }

  /**
   * Play animation and do something when it completes.
   */
  static playThen(sprite, key, callback) {
    if (!sprite || !sprite.active) return;
    sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, callback);
    AnimationManager.safePlay(sprite, key, false);
  }

  /**
   * Determine the correct knight animation key based on state.
   */
  static getKnightAnim(state) {
    const prefix = 'knight_';
    switch (state.action) {
      case 'idle':          return `${prefix}idle`;
      case 'walk':          return `${prefix}walk`;
      case 'run':           return `${prefix}run`;
      case 'jump_rise':     return `${prefix}jump_rise`;
      case 'jump_fall':     return `${prefix}jump_fall`;
      case 'jump_land':     return `${prefix}jump_land`;
      case 'dash':          return `${prefix}dash`;
      case 'wall_cling':    return `${prefix}wall_cling`;
      case 'wall_slide':    return `${prefix}wall_slide`;
      case 'take_hit':      return `${prefix}take_hit`;
      case 'death':         return `${prefix}death`;
      case 'focus':         return `${prefix}focus`;
      case 'focus_loop':    return `${prefix}focus_loop`;
      case 'cast_fireball': return `${prefix}cast_fireball`;
      case 'cast_dive':     return `${prefix}cast_dive`;
      case 'great_slash':   return `${prefix}great_slash`;
      case 'cyclone_slash': return `${prefix}cyclone_slash`;
      case 'nail_charge':   return `${prefix}nail_charge`;
      case 'sit':           return `${prefix}sit`;
      case 'bench_rest':    return `${prefix}bench_rest`;
      case 'look_up':       return `${prefix}look_up`;
      case 'look_down':     return `${prefix}look_down`;
      case 'attack_1':
      case 'attack_2':
      case 'attack_3':
      case 'attack_up':
      case 'attack_down':
      case 'attack_air':
        return `${prefix}${state.action}`;
      default:              return `${prefix}idle`;
    }
  }
}
