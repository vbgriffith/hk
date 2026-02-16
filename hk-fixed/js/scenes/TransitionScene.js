/* js/scenes/TransitionScene.js — Room transition overlay */
'use strict';

class TransitionScene extends Phaser.Scene {
  constructor() { super(C.SCENE_TRANSITION); }

  create() {
    // Transparent overlay used by cameras.main.fadeIn/fadeOut
    // This scene runs on top of GameScene for smooth transitions
  }
}

/* ── UIScene (stub) — future parallel scene for UI ─────────────────────── */
// Currently HUD is rendered directly in GameScene.
// In Phase 2 this can be separated for cleaner layering.
