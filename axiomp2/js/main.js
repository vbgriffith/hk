// ============================================================
//  AXIOM BREAK — main.js  [PHASE 2 REPLACEMENT]
//  Changes from Phase 1:
//   - UIScene now set active: true (runs persistently)
//   - Audio init hooked to first pointer event
//   - Version bump to 2.0
// ============================================================

// Initialize DOM HUD
HUD.init();

// ── Audio: init on first user interaction (browser policy) ──
let _audioInited = false;
function _initAudio() {
  if (_audioInited) return;
  _audioInited = true;
  AudioSynth.init();
  document.removeEventListener('pointerdown', _initAudio);
  document.removeEventListener('keydown', _initAudio);
}
document.addEventListener('pointerdown', _initAudio, { once: true });
document.addEventListener('keydown', _initAudio, { once: true });

// ── Phaser config ────────────────────────────────────────────
const game = new Phaser.Game({
  type: Phaser.CANVAS,
  width:  AXIOM.WIDTH,
  height: AXIOM.HEIGHT,
  canvas: document.getElementById('game-canvas'),
  backgroundColor: '#000000',
  pixelArt: false,
  antialias: true,
  scene: [
    BootScene,
    MenuScene,
    TransmissionScene,
    GameScene,
    UIScene,      // Phase 2: runs persistently alongside GameScene
  ],
  audio: { noAudio: true },  // We use Web Audio API directly — bypass Phaser audio
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width:  AXIOM.WIDTH,
    height: AXIOM.HEIGHT,
  },
  input: {
    mouse: { preventDefaultDown: false },
    keyboard: { capture: ['TAB'] },  // Capture Tab to prevent browser focus-trap
  },
  callbacks: {
    // Launch UIScene alongside GameScene whenever Game starts
    postBoot: (game) => {
      game.scene.scenes.forEach(s => {
        if (s.sys.key === 'Game') {
          s.events.on('create', () => {
            // UIScene follows Game
            if (!game.scene.isActive('UI')) {
              game.scene.start('UI');
            }
          });
        }
      });
    }
  },
});

// Prevent context menu on canvas
document.getElementById('game-canvas').addEventListener('contextmenu', e => e.preventDefault());

// Suppress Tab scroll in browser when game is focused
window.addEventListener('keydown', e => {
  if (e.code === 'Tab') e.preventDefault();
}, false);

console.log('%c AXIOM BREAK v2.0 ', 'background:#0d2035;color:#00f5ff;font-family:monospace;font-size:14px;padding:4px 8px;border:1px solid #00f5ff');
console.log('%c Phase 2: Signal Splice · Audio · Minimap · Powerups · WRAITH AI ', 'color:#39ff14;font-family:monospace;font-size:10px');
