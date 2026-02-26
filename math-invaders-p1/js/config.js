/**
 * config.js
 * Central configuration for Math Invaders.
 * All tunable game constants live here.
 */

const CONFIG = {
  // ── Phaser canvas ──────────────────────────────────
  CANVAS_WIDTH:  800,
  CANVAS_HEIGHT: 600,

  // ── Player ──────────────────────────────────────────
  PLAYER_SPEED:      320,
  PLAYER_LIVES:      3,
  PLAYER_Y_OFFSET:   60,   // px from bottom
  BULLET_SPEED:      520,
  SHOOT_COOLDOWN:    300,  // ms between shots

  // ── Aliens ──────────────────────────────────────────
  ALIEN_ROWS:        3,
  ALIEN_COLS:        6,    // starts at 6, reduces at higher levels
  ALIEN_X_START:     80,
  ALIEN_Y_START:     80,
  ALIEN_X_GAP:       100,
  ALIEN_Y_GAP:       70,
  ALIEN_MOVE_DELAY:  1200, // ms between grid moves (decreases per level)
  ALIEN_MOVE_STEP:   18,   // px per lateral move
  ALIEN_DROP_STEP:   22,   // px drop when reversing
  ALIEN_SPEED_INC:   80,   // ms reduction per level
  ALIEN_MIN_DELAY:   200,  // floor for move delay

  // Alien bomb config
  BOMB_SPEED:        180,
  BOMB_CHANCE:       0.003, // per-alien per-frame chance to drop bomb
  BOMB_MAX:          4,     // max simultaneous bombs

  // ── Math ────────────────────────────────────────────
  OPERATIONS: ['+', '-', '×', '÷'],
  MAX_NUMBER:  10,
  MIN_NUMBER:  0,

  // Answer choice spread on aliens per row
  //   row 0 (top)   = decoys further from answer
  //   row 2 (bottom)= closest decoys
  DECOY_SPREAD: [8, 4, 2],

  // ── Scoring ─────────────────────────────────────────
  SCORE_CORRECT:    100,   // base score for hitting correct alien
  SCORE_STREAK_MUL: 0.5,  // extra × streak count
  SCORE_BOMB_HIT:  -25,   // penalty for getting hit by bomb
  SCORE_WRONG:     -15,   // penalty for shooting wrong alien

  // ── Level thresholds ───────────────────────────────
  // Score needed to advance to each level
  LEVEL_THRESHOLDS: [0, 500, 1200, 2200, 3500, 5200, 7500],

  // Operations unlocked per level (index = level-1)
  LEVEL_OPS: [
    ['+'],                 // Level 1: addition only
    ['+', '-'],            // Level 2: + and -
    ['+', '-'],            // Level 3: + and -
    ['+', '-', '×'],       // Level 4: add multiplication
    ['+', '-', '×'],       // Level 5
    ['+', '-', '×', '÷'], // Level 6: all four
    ['+', '-', '×', '÷'], // Level 7+
  ],

  // ── Colors (used in Phaser graphics) ──────────────
  COLORS: {
    ALIEN_ROW0:   0x00ff88,  // neon green  — top row
    ALIEN_ROW1:   0x00e5ff,  // neon cyan   — middle row
    ALIEN_ROW2:   0xff2d78,  // neon pink   — bottom row (closest)
    ALIEN_CORRECT:0xffe600,  // yellow highlight on correct target
    PLAYER:       0x00e5ff,
    BULLET:       0xffe600,
    BOMB:         0xff2d78,
    BARRIER:      0x00ff88,
    BARRIER_HIT:  0xffaa00,
    EXPLOSION:    0xff6600,
    STARFIELD:    0xffffff,
    TEXT_MAIN:    '#00ff88',
    TEXT_YELLOW:  '#ffe600',
    TEXT_CYAN:    '#00e5ff',
    TEXT_PINK:    '#ff2d78',
  },

  // ── Fonts ───────────────────────────────────────────
  FONT_PIXEL:   'Press Start 2P',
  FONT_HUD:     'Orbitron',

  // ── Barriers ────────────────────────────────────────
  BARRIER_COUNT:    4,
  BARRIER_HP:       5,    // hits before destroyed
  BARRIER_Y_OFFSET: 130,  // px from bottom

  // ── UI element depths ────────────────────────────────
  DEPTH: {
    STARS:     0,
    BARRIERS:  5,
    ALIENS:    10,
    PLAYER:    15,
    BULLETS:   20,
    BOMBS:     20,
    PARTICLES: 25,
    UI:        30,
  },
};

// Freeze to prevent accidental mutation
Object.freeze(CONFIG);
Object.freeze(CONFIG.COLORS);
Object.freeze(CONFIG.DEPTH);
