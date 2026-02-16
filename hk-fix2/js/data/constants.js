/* js/data/constants.js — Global game constants */
'use strict';

const C = Object.freeze({
  // ── Display ───────────────────────────────────────────────────
  WIDTH:  480,
  HEIGHT: 270,
  SCALE:  3,          // pixel-art upscale
  FPS:    60,

  // ── Physics ───────────────────────────────────────────────────
  GRAVITY:       1800,
  TERMINAL_VEL:  900,

  // ── Knight ────────────────────────────────────────────────────
  KNIGHT_SPEED:        140,
  KNIGHT_JUMP_VEL:    -480,
  KNIGHT_DOUBLE_JUMP: -420,
  KNIGHT_DASH_SPEED:   380,
  KNIGHT_DASH_DUR:     0.18,   // seconds
  KNIGHT_DASH_CD:      0.6,
  KNIGHT_WALL_SLIDE:   60,
  KNIGHT_WALL_JUMP_X:  220,
  KNIGHT_WALL_JUMP_Y: -400,
  KNIGHT_CLING_TIME:   1.2,    // max seconds on wall

  KNIGHT_ATTACK_DUR:   0.25,
  KNIGHT_ATTACK_CD:    0.35,
  KNIGHT_ATTACK_RANGE: 36,
  KNIGHT_ATTACK_DMG:   5,

  // ── Soul / Spells ─────────────────────────────────────────────
  SOUL_MAX:            99,
  SOUL_PER_HIT:        11,    // soul gained on hitting enemy
  SOUL_FOCUS_COST:     33,    // heal one mask
  SOUL_FIREBALL_COST:  33,
  SOUL_DIVE_COST:      33,
  SOUL_FOCUS_DUR:      1.3,   // seconds to focus
  FOCUS_HEAL_AMOUNT:   1,     // masks healed

  // ── Health ────────────────────────────────────────────────────
  MASK_MAX:            5,
  IFRAMES_ON_HIT:      1.2,   // invincibility seconds

  // ── Nail Arts ─────────────────────────────────────────────────
  GREAT_SLASH_CHARGE:  1.0,   // hold time for great slash
  CYCLONE_CHARGE:      0.6,
  DASH_SLASH_WINDOW:   0.15,

  // ── Geo ───────────────────────────────────────────────────────
  GEO_BASE_ATTRACT:    80,    // px radius for auto-collect

  // ── Enemies ───────────────────────────────────────────────────
  CRAWLER_HP:          20,
  CRAWLER_DMG:         10,
  CRAWLER_SPEED:       60,
  CRAWLER_TURN_CD:     2.5,

  SPITTER_HP:          30,
  SPITTER_DMG:         15,
  SPITTER_SPEED:       40,
  SPITTER_SHOOT_CD:    2.0,
  SPITTER_PROJ_SPEED:  160,

  FLYING_HP:           18,
  FLYING_DMG:          10,
  FLYING_SPEED:        90,
  FLYING_DIVE_SPEED:   220,
  FLYING_RETREAT_CD:   1.5,

  // ── World ─────────────────────────────────────────────────────
  TILE_SIZE:           16,
  ROOM_W:              480,  // 30 tiles
  ROOM_H:              270,  // 16.875 tiles

  // ── Audio ─────────────────────────────────────────────────────
  MUSIC_VOL:   0.45,
  SFX_VOL:     0.7,
  AMBIENT_VOL: 0.3,

  // ── Layers (depth) ────────────────────────────────────────────
  LAYER_BG:         0,
  LAYER_BG_DETAIL:  1,
  LAYER_TILES:      5,
  LAYER_ENTITY:     10,
  LAYER_FG:         15,
  LAYER_PARTICLES:  20,
  LAYER_UI:         100,

  // ── Scene keys ────────────────────────────────────────────────
  SCENE_BOOT:       'Boot',
  SCENE_PRELOAD:    'Preload',
  SCENE_MENU:       'MainMenu',
  SCENE_GAME:       'Game',
  SCENE_UI:         'UI',
  SCENE_TRANSITION: 'Transition',
  SCENE_BOSS:       'BossScene',

  // ── Bosses ────────────────────────────────────────────────────
  FALSE_KNIGHT_HP:        200,
  FALSE_KNIGHT_DMG:       20,
  FALSE_KNIGHT_STAGGER:   40,
  FALSE_KNIGHT_SLAM_SPD:  260,
  FALSE_KNIGHT_JUMP_VEL: -520,
  FALSE_KNIGHT_RAGE_HP:   80,

  GRUZ_MOTHER_HP:         160,
  GRUZ_MOTHER_DMG:        15,
  GRUZ_MOTHER_SPEED:      70,
  GRUZ_MOTHER_CHARGE_SPD: 300,
  GRUZ_MOTHER_BABIES:     8,

  VENGEFLY_KING_HP:       140,
  VENGEFLY_KING_DMG:      10,
  VENGEFLY_KING_SPEED:    110,
  VENGEFLY_KING_SUMMON_CD:3.5,

  // ── New enemies ───────────────────────────────────────────────
  MOSSCREEP_HP:     22,
  MOSSCREEP_DMG:    10,
  MOSSCREEP_SPEED:  50,
  VENGEFLY_HP:      15,
  VENGEFLY_DMG:     8,
  VENGEFLY_SPEED:   100,
  ASPID_HP:         18,
  ASPID_DMG:        12,

  // ── Dream Nail ────────────────────────────────────────────────
  DREAM_NAIL_CHARGE:      1.2,
  DREAM_ESSENCE_PER_HIT:  1,

  // ── Desolate Dive ─────────────────────────────────────────────
  DIVE_COST:          33,
  DIVE_SPEED:         800,
  DIVE_SHOCKWAVE_DMG: 20,
  DIVE_SHOCKWAVE_R:   48,

  // ── Charms ────────────────────────────────────────────────────
  CHARM_SLOT_MAX:     11,

  // ── Save ──────────────────────────────────────────────────────
  SAVE_KEY: 'hk_clone_save',

  // ── Input ─────────────────────────────────────────────────────
  INPUT: {
    LEFT:       ['LEFT',  'A'],
    RIGHT:      ['RIGHT', 'D'],
    UP:         ['UP',    'W'],
    DOWN:       ['DOWN',  'S'],
    JUMP:       ['Z',     'SPACE'],
    ATTACK:     ['X',     'J'],
    DASH:       ['C',     'SHIFT'],
    FOCUS:      ['A',     'F'],
    CAST:       ['Q',     'U'],
    DREAM_NAIL: ['R',     'N'],
    MAP:        ['TAB',   'M'],
    PAUSE:      ['ESC',   'P'],
    INTERACT:   ['E',     'ENTER'],
    INVENTORY:  ['I'],
  },
});
