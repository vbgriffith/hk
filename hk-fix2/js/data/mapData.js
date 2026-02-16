/* js/data/mapData.js — Room and world layout definitions */
'use strict';

/**
 * Each room defines:
 *  - key: unique string ID
 *  - displayName: shown in bottom-left
 *  - tilemap: key of loaded Tiled JSON (or null for procedural)
 *  - music: track key
 *  - ambient: ambient loop key
 *  - connections: { direction: { roomKey, spawnPoint } }
 *  - spawns: named spawn positions [x, y]
 *  - enemies: [{ type, x, y, data? }]
 *  - npcs: [{ type, x, y, dialogueKey }]
 *  - platforms: [{ x, y, w, h }]  — fallback if no tilemap
 *  - hazards: [{ type, x, y, w, h }]
 *  - items: [{ type, x, y, id }]
 */

const WORLD_MAP = {

  // ── Dirtmouth ─────────────────────────────────────────────────────────────
  dirtmouth: {
    key: 'dirtmouth',
    displayName: 'Dirtmouth',
    music: 'music_dirtmouth',
    ambient: 'amb_wind',
    tilemap: 'map_dirtmouth',
    spawns: {
      default:     [80, 200],
      from_crossroads: [380, 200],
      bench:       [240, 200],
    },
    connections: {
      down:  { roomKey: 'crossroads_entrance', spawnPoint: 'from_dirtmouth' },
    },
    enemies: [],
    npcs: [
      { type: 'elderbug', x: 280, y: 195, dialogueKey: 'elderbug', id: 'elderbug_01' },
    ],
    items: [
      { type: 'bench', x: 220, y: 207, id: 'bench_dirtmouth' },
    ],
    platforms: [
      { x: 0,   y: 215, w: 480, h: 55 },   // ground
      { x: 160, y: 150, w: 60,  h: 10 },   // ledge
    ],
    hazards: []
  },

  // ── Forgotten Crossroads entrance ─────────────────────────────────────────
  crossroads_entrance: {
    key: 'crossroads_entrance',
    displayName: 'Forgotten Crossroads',
    music: 'music_crossroads',
    ambient: 'amb_crossroads',
    tilemap: 'map_crossroads_01',
    spawns: {
      default:        [60, 180],
      from_dirtmouth: [60, 80],
      from_room_2:    [400, 180],
    },
    connections: {
      up:    { roomKey: 'dirtmouth',        spawnPoint: 'from_crossroads' },
      right: { roomKey: 'crossroads_main',  spawnPoint: 'from_entrance' },
    },
    enemies: [
      { type: 'crawler', x: 200, y: 195, data: { dir: 1 } },
      { type: 'crawler', x: 320, y: 195, data: { dir: -1 } },
    ],
    npcs: [
      { type: 'quirrel', x: 100, y: 185, dialogueKey: 'quirrel_forgotten_crossroads', id: 'quirrel_01' },
    ],
    items: [
      { type: 'lore_tablet', x: 150, y: 188, id: 'tablet_cr_01', dialogueKey: 'crossroads_tablet_1' },
    ],
    platforms: [
      { x: 0,   y: 205, w: 480, h: 65 },  // main floor
      { x: 80,  y: 155, w: 80,  h: 10 },  // left platform
      { x: 280, y: 140, w: 100, h: 10 },  // right platform
      { x: 0,   y: 60,  w: 120, h: 10 },  // top left
    ],
    hazards: [
      { type: 'acid', x: 200, y: 240, w: 80, h: 30 },
    ]
  },

  // ── Forgotten Crossroads main hub ─────────────────────────────────────────
  crossroads_main: {
    key: 'crossroads_main',
    displayName: 'Forgotten Crossroads',
    music: 'music_crossroads',
    ambient: 'amb_crossroads',
    tilemap: 'map_crossroads_02',
    spawns: {
      default:      [60, 200],
      from_entrance: [60, 200],
      from_chest:   [380, 200],
    },
    connections: {
      left:  { roomKey: 'crossroads_entrance', spawnPoint: 'from_room_2' },
      down:  { roomKey: 'crossroads_below',    spawnPoint: 'from_main' },
      right: { roomKey: 'crossroads_chest',    spawnPoint: 'from_main' },
    },
    enemies: [
      { type: 'crawler',     x: 180, y: 200, data: { dir: 1 } },
      { type: 'spitter',     x: 290, y: 160, data: { facingLeft: false } },
      { type: 'flying_scout',x: 350, y: 130, data: {} },
    ],
    npcs: [],
    items: [
      { type: 'bench',       x: 420, y: 205, id: 'bench_cr_main' },
      { type: 'geo_pile',    x: 130, y: 195, id: 'geo_01', value: 12 },
    ],
    platforms: [
      { x: 0,   y: 215, w: 300, h: 55 },
      { x: 350, y: 215, w: 130, h: 55 },
      { x: 120, y: 155, w: 90,  h: 10 },
      { x: 250, y: 125, w: 110, h: 10 },
      { x: 30,  y: 100, w: 70,  h: 10 },
      // ceiling
      { x: 0,   y: 0,   w: 480, h: 10 },
      // walls
      { x: 0,   y: 0,   w: 10,  h: 270 },
      { x: 470, y: 0,   w: 10,  h: 270 },
    ],
    hazards: [
      { type: 'spikes', x: 300, y: 208, w: 50, h: 14 },
    ]
  },

  // ── Crossroads lower path ─────────────────────────────────────────────────
  crossroads_below: {
    key: 'crossroads_below',
    displayName: 'Forgotten Crossroads',
    music: 'music_crossroads',
    ambient: 'amb_crossroads_deep',
    tilemap: 'map_crossroads_03',
    spawns: {
      default:   [240, 50],
      from_main: [240, 50],
    },
    connections: {
      up: { roomKey: 'crossroads_main', spawnPoint: 'default' },
    },
    enemies: [
      { type: 'crawler',      x: 150, y: 220, data: { dir: 1 } },
      { type: 'crawler',      x: 320, y: 220, data: { dir: -1 } },
      { type: 'flying_scout', x: 240, y: 140, data: {} },
    ],
    npcs: [],
    items: [
      { type: 'shade_gate',  x: 240, y: 190, id: 'shade_gate_01' },
    ],
    platforms: [
      { x: 0,   y: 235, w: 480, h: 35 },
      { x: 80,  y: 170, w: 80,  h: 10 },
      { x: 300, y: 170, w: 80,  h: 10 },
      { x: 180, y: 110, w: 120, h: 10 },
    ],
    hazards: [
      { type: 'acid', x: 0,   y: 255, w: 70,  h: 20 },
      { type: 'acid', x: 410, y: 255, w: 70,  h: 20 },
    ]
  },

  // ── Crossroads chest room ─────────────────────────────────────────────────
  crossroads_chest: {
    key: 'crossroads_chest',
    displayName: 'Forgotten Crossroads',
    music: 'music_crossroads',
    ambient: 'amb_crossroads',
    tilemap: null,
    spawns: {
      default:   [60, 220],
      from_main: [60, 220],
    },
    connections: {
      left: { roomKey: 'crossroads_main', spawnPoint: 'from_chest' },
    },
    enemies: [],
    npcs: [],
    items: [
      { type: 'chest',   x: 300, y: 200, id: 'chest_cr_01', contains: { type: 'geo', value: 50 } },
      { type: 'ability', x: 200, y: 195, id: 'mothwing_cloak', abilityId: 'dash', interacted: false },
    ],
    platforms: [
      { x: 0,   y: 235, w: 480, h: 35 },
      { x: 100, y: 170, w: 280, h: 10 },
    ],
    hazards: []
  },
};

// ── Area metadata for map screen ──────────────────────────────────────────
const AREAS = {
  dirtmouth:   { label: 'Dirtmouth',             colour: 0x888888 },
  crossroads:  { label: 'Forgotten Crossroads',  colour: 0x3a5a3a },
  greenpath:   { label: 'Greenpath',             colour: 0x2a7a2a },
  fog_canyon:  { label: 'Fog Canyon',            colour: 0x5a3a7a },
  city:        { label: 'City of Tears',         colour: 0x3a3a7a },
  basin:       { label: 'Ancient Basin',         colour: 0x1a1a2a },
};

// ── Phase II rooms ────────────────────────────────────────────────────────

WORLD_MAP.false_knight_arena = {
  key: 'false_knight_arena',
  displayName: 'Forgotten Crossroads',
  music: 'music_boss',
  ambient: 'amb_crossroads',
  tilemap: null,
  _w: 480, _h: 320,
  spawns: {
    default:         [60, 260],
    from_crossroads: [60, 260],
    after_boss:      [240, 260],
  },
  connections: {
    left: { roomKey: 'crossroads_main', spawnPoint: 'default' },
  },
  enemies: [],
  bosses: [
    { type: 'false_knight', x: 360, y: 240,
      geoReward: 120, defeated: false, id: 'boss_false_knight' },
  ],
  npcs: [],
  items: [
    { type: 'bench', x: 440, y: 308, id: 'bench_fk_post' },
  ],
  platforms: [
    { x: 0,   y: 290, w: 480, h: 30 },   // main floor
    { x: 0,   y: 0,   w: 10,  h: 320 },  // left wall
    { x: 470, y: 0,   w: 10,  h: 320 },  // right wall
    { x: 0,   y: 0,   w: 480, h: 10 },   // ceiling
    { x: 40,  y: 220, w: 80,  h: 10 },   // left platform
    { x: 360, y: 220, w: 80,  h: 10 },   // right platform
  ],
  hazards: []
};

WORLD_MAP.gruz_mother_chamber = {
  key: 'gruz_mother_chamber',
  displayName: 'Forgotten Crossroads',
  music: 'music_boss',
  ambient: 'amb_crossroads',
  tilemap: null,
  _w: 480, _h: 270,
  spawns: {
    default:    [60, 220],
    from_above: [240, 40],
  },
  connections: {
    up:   { roomKey: 'crossroads_main', spawnPoint: 'default' },
  },
  bosses: [
    { type: 'gruz_mother', x: 300, y: 160, geoReward: 90, id: 'boss_gruz_mother' },
  ],
  enemies: [],
  npcs:    [],
  items:   [],
  platforms: [
    { x: 0,   y: 240, w: 480, h: 30 },
    { x: 0,   y: 0,   w: 10,  h: 270 },
    { x: 470, y: 0,   w: 10,  h: 270 },
    { x: 0,   y: 0,   w: 480, h: 10 },
    { x: 120, y: 180, w: 60,  h: 10 },
    { x: 300, y: 160, w: 60,  h: 10 },
  ],
  hazards: []
};

WORLD_MAP.greenpath_entrance = {
  key: 'greenpath_entrance',
  displayName: 'Greenpath',
  music: 'music_greenpath',
  ambient: 'amb_greenpath',
  tilemap: null,
  _w: 640, _h: 270,
  spawns: {
    default:          [50, 200],
    from_crossroads:  [50, 200],
    from_greenpath_2: [580, 200],
  },
  connections: {
    left:  { roomKey: 'crossroads_below',   spawnPoint: 'default' },
    right: { roomKey: 'greenpath_main',     spawnPoint: 'from_entrance' },
  },
  enemies: [
    { type: 'mosscreep', x: 220, y: 205, data: { dir: 1 } },
    { type: 'mosscreep', x: 420, y: 205, data: { dir: -1 } },
    { type: 'vengefly',  x: 300, y: 140, data: {} },
  ],
  npcs: [
    { type: 'cornifer', x: 500, y: 200, dialogueKey: 'cornifer_greenpath', id: 'cornifer_gp' },
  ],
  items: [
    { type: 'lore_tablet', x: 150, y: 198, id: 'tablet_gp_01', dialogueKey: 'greenpath_tablet_1' },
    { type: 'geo_pile',    x: 320, y: 200, id: 'geo_gp_01', value: 18 },
  ],
  platforms: [
    { x: 0,   y: 215, w: 640, h: 55 },
    { x: 100, y: 155, w: 100, h: 12 },
    { x: 280, y: 130, w: 120, h: 12 },
    { x: 470, y: 155, w: 80,  h: 12 },
    { x: 0,   y: 0,   w: 10,  h: 270 },
    { x: 630, y: 0,   w: 10,  h: 270 },
  ],
  hazards: [
    { type: 'acid', x: 200, y: 248, w: 100, h: 25 },
    { type: 'acid', x: 460, y: 248, w: 80,  h: 25 },
  ]
};

WORLD_MAP.greenpath_main = {
  key: 'greenpath_main',
  displayName: 'Greenpath',
  music: 'music_greenpath',
  ambient: 'amb_greenpath',
  tilemap: null,
  _w: 640, _h: 380,
  spawns: {
    default:      [60, 310],
    from_entrance:[ 60, 310],
  },
  connections: {
    left: { roomKey: 'greenpath_entrance', spawnPoint: 'from_greenpath_2' },
    down: { roomKey: 'greenpath_lake',     spawnPoint: 'from_main' },
  },
  enemies: [
    { type: 'mosscreep',   x: 200, y: 318, data: { dir: 1 } },
    { type: 'mosscreep',   x: 380, y: 318, data: { dir: -1 } },
    { type: 'vengefly',    x: 300, y: 250, data: {} },
    { type: 'aspid',       x: 450, y: 200, data: {} },
  ],
  npcs: [],
  items: [
    { type: 'chest',   x: 300, y: 130, id: 'chest_gp_01', contains: { type: 'charm', id: 'wayward_compass' } },
    { type: 'bench',   x: 580, y: 326, id: 'bench_greenpath' },
  ],
  platforms: [
    { x: 0,   y: 330, w: 640, h: 50 },
    { x: 80,  y: 270, w: 100, h: 12 },
    { x: 240, y: 220, w: 120, h: 12 },
    { x: 420, y: 190, w: 100, h: 12 },
    { x: 250, y: 150, w: 80,  h: 12 },
    { x: 0,   y: 0,   w: 10,  h: 380 },
    { x: 630, y: 0,   w: 10,  h: 380 },
  ],
  hazards: [
    { type: 'acid', x: 0,   y: 355, w: 160, h: 25 },
    { type: 'acid', x: 480, y: 355, w: 160, h: 25 },
  ]
};

WORLD_MAP.greenpath_lake = {
  key: 'greenpath_lake',
  displayName: 'Greenpath',
  music: 'music_greenpath_quiet',
  ambient: 'amb_lake',
  tilemap: null,
  _w: 480, _h: 270,
  spawns: {
    default:   [60, 200],
    from_main: [240, 30],
  },
  connections: {
    up: { roomKey: 'greenpath_main', spawnPoint: 'default' },
  },
  enemies: [],
  npcs: [
    { type: 'quirrel', x: 380, y: 205, dialogueKey: 'quirrel_blue_lake', id: 'quirrel_lake' },
  ],
  items: [
    { type: 'dream_nail_pedestal', x: 200, y: 200, id: 'dream_nail_acquire' },
  ],
  platforms: [
    { x: 0,   y: 218, w: 480, h: 52 },
    { x: 100, y: 160, w: 80,  h: 10 },
    { x: 300, y: 140, w: 80,  h: 10 },
  ],
  hazards: [
    { type: 'acid', x: 0,   y: 250, w: 100, h: 20 },
    { type: 'acid', x: 380, y: 250, w: 100, h: 20 },
  ]
};

// Add more connections to existing rooms
WORLD_MAP.crossroads_main.connections.down = { roomKey: 'false_knight_arena',    spawnPoint: 'from_crossroads' };
WORLD_MAP.crossroads_below.connections.down = { roomKey: 'gruz_mother_chamber',  spawnPoint: 'default' };
WORLD_MAP.crossroads_below.connections.left = { roomKey: 'greenpath_entrance',   spawnPoint: 'default' };

AREAS.greenpath = { label: 'Greenpath', colour: 0x2a7a2a };
