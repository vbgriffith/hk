// ============================================================
//  AXIOM BREAK — main.js
//  Phaser 3 game initialization entry point
// ============================================================

// Initialize HUD (DOM layer)
HUD.init();

// Phaser configuration
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
    UIScene,
  ],
  audio: { noAudio: true }, // Phase 1: no audio (Phase 2 will add Web Audio)
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
    mouse: {
      preventDefaultDown: false,
    },
  },
});

// Prevent context menu on right-click within canvas
document.getElementById('game-canvas').addEventListener('contextmenu', e => e.preventDefault());

console.log('%c AXIOM BREAK v1.0 ', 'background:#0d2035;color:#00f5ff;font-family:monospace;font-size:14px;padding:4px 8px;border:1px solid #00f5ff');
console.log('%c Signal Splice Protocol ACTIVE ', 'color:#39ff14;font-family:monospace;font-size:10px');
