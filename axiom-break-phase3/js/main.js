// ============================================================
//  AXIOM BREAK — main.js  [PHASE 3 REPLACEMENT]
//  Adds:
//   - Progression.init() + Leaderboard.init() on load
//   - UpgradeScene + LeaderboardScene in scene list
//   - Version bump to 3.0
// ============================================================

// Initialize DOM HUD
HUD.init();

// ── Phase 3: persistent systems init ─────────────────────────
Progression.init();
Leaderboard.init();

// ── Audio: init on first user interaction ────────────────────
let _audioInited = false;
function _initAudio() {
  if (_audioInited) return;
  _audioInited = true;
  AudioSynth.init();
}
document.addEventListener('pointerdown', _initAudio, { once: true });
document.addEventListener('keydown', _initAudio, { once: true });

// ── Phaser config ─────────────────────────────────────────────
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
    GameScene,
    UIScene,
    UpgradeScene,       // Phase 3
    LeaderboardScene,   // Phase 3
  ],
  audio: { noAudio: true },
  fps: { target: 60, forceSetTimeOut: false },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width:  AXIOM.WIDTH,
    height: AXIOM.HEIGHT,
  },
  input: {
    mouse: { preventDefaultDown: false },
    keyboard: { capture: ['TAB'] },
  },
  callbacks: {
    postBoot: (game) => {
      game.scene.scenes.forEach(s => {
        if (s.sys.key === 'Game') {
          s.events.on('create', () => {
            if (!game.scene.isActive('UI')) game.scene.start('UI');
          });
        }
      });
    }
  },
});

document.getElementById('game-canvas').addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('keydown', e => { if (e.code === 'Tab') e.preventDefault(); }, false);

console.log('%c AXIOM BREAK v3.0 ', 'background:#0d2035;color:#00f5ff;font-family:monospace;font-size:14px;padding:4px 8px;border:1px solid #00f5ff');
console.log('%c Phase 3: Upgrade Tree · Procedural Maps · Leaderboard · Phantoms ', 'color:#39ff14;font-family:monospace;font-size:10px');
