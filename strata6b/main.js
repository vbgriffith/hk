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

  // Autosave on any state mutation — throttled to at most once per 2 seconds.
  // Means a reload never loses more than a couple seconds of player actions.
  let _saveTimer = null;
  function scheduleSave() {
    if (_saveTimer) return;
    _saveTimer = setTimeout(() => {
      _saveTimer = null;
      StateManager.save();
    }, 2000);
  }
  EventBus.on('state:changed', scheduleSave);
  EventBus.on('state:flag',    scheduleSave);
  EventBus.on('terminal:note', scheduleSave);

  // Safety net: flush any pending save immediately on page unload
  window.addEventListener('beforeunload', () => {
    if (_saveTimer) { clearTimeout(_saveTimer); _saveTimer = null; }
    StateManager.save();
  });

  window.STRATA = new Phaser.Game(config);
  window.STRATA.W = W;
  window.STRATA.H = H;
})();
