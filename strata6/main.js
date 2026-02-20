/**
 * STRATA — main.js
 * Phaser 3 game configuration and initialization.
 * All scenes registered here. No assets loaded — 100% procedural.
 */
(function () {
  const W = 1280;
  const H = 720;

  const config = {
    type: Phaser.AUTO,
    width: W,
    height: H,
    backgroundColor: '#000000',
    parent: 'game-container',
    scene: [
      BootScene,
      Layer0Scene,
      Layer1Scene,
      Layer2Scene,
      Layer3Scene,
      Layer4Scene,
      EndingScene
    ],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
      antialias: true,
      pixelArt: false
    }
  };

  // Initialize core systems before Phaser boots
  SaveSystem;           // ensure loaded
  StateManager.init();  // load or create save state
  CorruptionTracker;    // bind to EventBus

  window.STRATA = new Phaser.Game(config);
  window.STRATA.W = W;
  window.STRATA.H = H;
})();
