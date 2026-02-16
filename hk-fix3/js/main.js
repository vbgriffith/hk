/* js/main.js — Game bootstrap */
'use strict';

window.addEventListener('load', () => {
  const config = {
    type:   Phaser.AUTO,
    width:  C.WIDTH  * C.SCALE,
    height: C.HEIGHT * C.SCALE,
    canvas: document.getElementById('game-canvas'),
    backgroundColor: '#000000',
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: C.GRAVITY },
        debug: false,
      },
    },
    scene: [
      BootScene,
      PreloadScene,
      MainMenuScene,
      GameScene,
      TransitionScene,
      EndingScene,
      CreditsScene,
    ],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  const game = new Phaser.Game(config);

  // Resume audio on first interaction
  document.addEventListener('pointerdown', () => AUDIO_ENGINE.resume(), { once: true });
  document.addEventListener('keydown',     () => AUDIO_ENGINE.resume(), { once: true });

  // Expose for debugging
  window._game = game;
});
