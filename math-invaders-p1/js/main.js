/**
 * main.js
 * Phaser 3 game initialization and configuration.
 * Entry point that wires all scenes together.
 */

(function () {
  'use strict';

  const gameConfig = {
    type:   Phaser.AUTO,
    width:  CONFIG.CANVAS_WIDTH,
    height: CONFIG.CANVAS_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#050a14',

    physics: {
      default: 'arcade',
      arcade:  {
        gravity: { y: 0 },
        debug:   false,
      },
    },

    scene: [
      BootScene,
      MenuScene,
      GameScene,
      GameOverScene,
      StatsScene,
    ],

    // Scale to fit the screen while maintaining aspect ratio
    scale: {
      mode:            Phaser.Scale.FIT,
      autoCenter:      Phaser.Scale.CENTER_BOTH,
      width:           CONFIG.CANVAS_WIDTH,
      height:          CONFIG.CANVAS_HEIGHT,
    },

    render: {
      pixelArt:       false,
      antialias:      true,
      roundPixels:    true,
    },

    input: {
      keyboard: true,
      mouse:    false,
      touch:    false,
      gamepad:  false,
    },
  };

  // Initialize Phaser game
  window.game = new Phaser.Game(gameConfig);

  // Handle page visibility changes — pause/resume
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.game.scene.pause('GameScene');
    } else {
      window.game.scene.resume('GameScene');
    }
  });

  // Prevent arrow keys from scrolling the page
  window.addEventListener('keydown', (e) => {
    const blocked = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
    if (blocked.includes(e.code)) e.preventDefault();
  });

})();
