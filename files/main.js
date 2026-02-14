/* js/main.js — Phaser 3 game bootstrap */
'use strict';

const config = {
  type: Phaser.AUTO,
  canvas: document.getElementById('game-canvas'),

  width:  C.WIDTH,
  height: C.HEIGHT,

  // Pixel art rendering
  render: {
    antialias:        false,
    pixelArt:         true,
    roundPixels:      true,
    powerPreference: 'high-performance',
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: C.GRAVITY },
      debug:   false,   // set true to see hitboxes
    },
  },

  backgroundColor: '#000000',

  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    GameScene,
    TransitionScene,
  ],

  scale: {
    mode:            Phaser.Scale.FIT,
    autoCenter:      Phaser.Scale.CENTER_BOTH,
    width:           C.WIDTH,
    height:          C.HEIGHT,
    zoom:            C.SCALE,
    parent:          'game-wrapper',
  },

  fps: {
    target:     C.FPS,
    forceSetTimeOut: false,
  },

  audio: {
    disableWebAudio: false,
    noAudio: true,   // enable when audio assets are present
  },
};

// Boot the game
const game = new Phaser.Game(config);

// Expose for debugging
window._HK = game;

// Prevent right-click context menu on canvas
document.getElementById('game-canvas')?.addEventListener('contextmenu', e => e.preventDefault());

// Prevent arrow key scrolling
window.addEventListener('keydown', e => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
    e.preventDefault();
  }
}, { passive: false });
