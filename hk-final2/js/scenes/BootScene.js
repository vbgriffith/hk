/* js/scenes/BootScene.js — Minimal boot, kicks off PreloadScene */
'use strict';

class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    // Nothing to preload here — PreloadScene handles everything procedurally
  }

  create() {
    this.scene.start('Preload');
  }
}
