/* js/data/mapData_p3.js — Phase III–V map rooms appended to WORLD_MAP */
'use strict';

// ── City of Tears ──────────────────────────────────────────────────────────
WORLD_MAP.city_entrance = {
  key: 'city_entrance',
  displayName: 'City of Tears',
  music: 'music_city',
  ambient: 'amb_rain',
  _w: 480, _h: 320,
  spawns: { default: [60, 260], from_greenpath: [60, 260], from_city_main: [420, 260] },
  connections: {
    left:  { roomKey: 'greenpath_main',  spawnPoint: 'default' },
    right: { roomKey: 'city_main',       spawnPoint: 'from_entrance' },
  },
  enemies: [
    { type: 'great_hopper', x: 200, y: 255, data: {} },
    { type: 'winged_fool',  x: 340, y: 180, data: {} },
  ],
  npcs: [],
  items: [{ type: 'geo_pile', x: 120, y: 255, id: 'geo_city_01', value: 30 }],
  platforms: [
    { x:0,y:270,w:480,h:50 }, { x:0,y:0,w:10,h:320 }, { x:470,y:0,w:10,h:320 },
    { x:80, y:200,w:80,h:10 }, { x:280,y:180,w:100,h:10 }, { x:100,y:120,w:60,h:10 },
  ],
  hazards: [{ type: 'spikes', x: 200, y: 264, w: 80, h: 14 }],
  rain: true,
};

WORLD_MAP.city_main = {
  key: 'city_main',
  displayName: 'City of Tears',
  music: 'music_city',
  ambient: 'amb_rain',
  _w: 640, _h: 380,
  spawns: { default: [60, 310], from_entrance: [60, 310], from_soul_sanctum: [400, 100] },
  connections: {
    left:  { roomKey: 'city_entrance',   spawnPoint: 'from_city_main' },
    up:    { roomKey: 'soul_sanctum_entrance', spawnPoint: 'from_city' },
    right: { roomKey: 'city_east',       spawnPoint: 'default' },
    down:  { roomKey: 'ancient_basin_entrance', spawnPoint: 'from_city' },
  },
  enemies: [
    { type: 'great_hopper', x: 200, y: 318, data: {} },
    { type: 'winged_fool',  x: 380, y: 250, data: {} },
    { type: 'great_hopper', x: 500, y: 318, data: {} },
  ],
  npcs: [
    { type: 'sly',    x: 120, y: 310, dialogueKey: 'sly_shop',   id: 'sly_01' },
    { type: 'iselda', x: 520, y: 310, dialogueKey: 'iselda',      id: 'iselda_city' },
  ],
  items: [
    { type: 'bench', x: 320, y: 326, id: 'bench_city_main' },
    { type: 'toll_gate', x: 480, y: 290, id: 'toll_city', cost: 50 },
  ],
  platforms: [
    { x:0,y:330,w:640,h:50 }, { x:0,y:0,w:10,h:380 }, { x:630,y:0,w:10,h:380 },
    { x:0,y:0,w:640,h:10 },
    { x:80, y:270,w:100,h:10 }, { x:240,y:230,w:120,h:10 }, { x:420,y:190,w:80,h:10 },
    { x:100,y:150,w:80,h:10 },  { x:300,y:110,w:100,h:10 }, { x:500,y:130,w:80,h:10 },
  ],
  hazards: [],
  rain: true,
};

WORLD_MAP.city_east = {
  key: 'city_east',
  displayName: 'City of Tears',
  music: 'music_city',
  ambient: 'amb_rain',
  _w: 480, _h: 270,
  spawns: { default: [60, 210] },
  connections: {
    left: { roomKey: 'city_main', spawnPoint: 'default' },
  },
  enemies: [
    { type: 'winged_fool', x: 200, y: 160, data: {} },
    { type: 'winged_fool', x: 360, y: 140, data: {} },
  ],
  npcs: [],
  items: [
    { type: 'chest', x: 380, y: 200, id: 'chest_city_east',
      contains: { type: 'charm', id: 'shaman_stone' } },
    { type: 'geo_pile', x: 200, y: 200, id: 'geo_city_e1', value: 60 },
  ],
  platforms: [
    { x:0,y:220,w:480,h:50 }, { x:0,y:0,w:10,h:270 }, { x:470,y:0,w:10,h:270 },
    { x:100,y:165,w:80,h:10 }, { x:260,y:140,w:100,h:10 }, { x:380,y:110,w:60,h:10 },
  ],
  hazards: [{ type: 'acid', x: 0, y: 248, w: 100, h: 22 }],
  rain: true,
};

WORLD_MAP.soul_sanctum_entrance = {
  key: 'soul_sanctum_entrance',
  displayName: 'Soul Sanctum',
  music: 'music_soul_sanctum',
  ambient: 'amb_hum',
  _w: 480, _h: 270,
  spawns: { default: [240, 220], from_city: [240, 220] },
  connections: {
    down: { roomKey: 'city_main',     spawnPoint: 'from_soul_sanctum' },
    up:   { roomKey: 'soul_master_arena', spawnPoint: 'default' },
  },
  enemies: [
    { type: 'soul_twister', x: 160, y: 210, data: {} },
    { type: 'soul_twister', x: 320, y: 210, data: {} },
  ],
  npcs: [],
  items: [{ type: 'bench', x: 420, y: 218, id: 'bench_sanctum' }],
  platforms: [
    { x:0,y:230,w:480,h:40 }, { x:0,y:0,w:10,h:270 }, { x:470,y:0,w:10,h:270 },
    { x:100,y:170,w:80,h:10 }, { x:280,y:150,w:80,h:10 },
  ],
  hazards: [],
};

WORLD_MAP.soul_master_arena = {
  key: 'soul_master_arena',
  displayName: 'Soul Sanctum',
  music: 'music_boss',
  ambient: 'amb_hum',
  _w: 480, _h: 320,
  spawns: { default: [60, 270], after_boss: [240, 270] },
  connections: {
    down: { roomKey: 'soul_sanctum_entrance', spawnPoint: 'default' },
  },
  bosses: [{ type: 'soul_master', x: 350, y: 250, geoReward: 200, id: 'boss_soul_master' }],
  enemies: [],
  npcs: [],
  items: [
    { type: 'bench',  x: 440, y: 288, id: 'bench_soul_master_post' },
    { type: 'ability', x: 240, y: 260, id: 'desolate_dive_tome', abilityId: 'dive' },
  ],
  platforms: [
    { x:0,y:290,w:480,h:30 }, { x:0,y:0,w:10,h:320 }, { x:470,y:0,w:10,h:320 },
    { x:0,y:0,w:480,h:10 },
    { x:60, y:230,w:80,h:10 }, { x:340,y:230,w:80,h:10 }, { x:200,y:200,w:80,h:10 },
  ],
  hazards: [],
};

// ── Fungal Wastes ──────────────────────────────────────────────────────────
WORLD_MAP.fungal_entrance = {
  key: 'fungal_entrance',
  displayName: 'Fungal Wastes',
  music: 'music_fungal',
  ambient: 'amb_fungal',
  _w: 640, _h: 270,
  spawns: { default: [60, 200], from_crossroads: [60, 200], from_fungal_main: [580, 200] },
  connections: {
    left:  { roomKey: 'crossroads_main', spawnPoint: 'default' },
    right: { roomKey: 'fungal_main',     spawnPoint: 'from_entrance' },
  },
  enemies: [
    { type: 'fungoon',    x: 200, y: 205, data: { dir: 1 } },
    { type: 'fungoon',    x: 400, y: 205, data: { dir: -1 } },
    { type: 'shrumal_ogre', x: 320, y: 185, data: {} },
  ],
  npcs: [{ type: 'cornifer', x: 480, y: 200, dialogueKey: 'cornifer_fungal', id: 'cornifer_fungal' }],
  items: [{ type: 'geo_pile', x: 140, y: 200, id: 'geo_fungal_01', value: 22 }],
  platforms: [
    { x:0,y:215,w:640,h:55 }, { x:0,y:0,w:10,h:270 }, { x:630,y:0,w:10,h:270 },
    { x:100,y:155,w:100,h:10 }, { x:280,y:130,w:120,h:10 }, { x:470,y:155,w:80,h:10 },
  ],
  hazards: [
    { type: 'spore_fog', x: 200, y: 150, w: 100, h: 80 },
  ],
};

WORLD_MAP.fungal_main = {
  key: 'fungal_main',
  displayName: 'Fungal Wastes',
  music: 'music_fungal',
  ambient: 'amb_fungal',
  _w: 640, _h: 380,
  spawns: { default: [60, 310], from_entrance: [60, 310], from_mantis_village: [580, 310] },
  connections: {
    left:  { roomKey: 'fungal_entrance',   spawnPoint: 'from_fungal_main' },
    right: { roomKey: 'mantis_village_entrance', spawnPoint: 'from_fungal' },
    down:  { roomKey: 'fungal_deep',       spawnPoint: 'from_main' },
  },
  enemies: [
    { type: 'fungoon',    x: 180, y: 318, data: { dir: 1 } },
    { type: 'shrumal_ogre', x: 350, y: 310, data: {} },
    { type: 'fungoon',    x: 500, y: 318, data: { dir: -1 } },
  ],
  npcs: [],
  items: [
    { type: 'bench', x: 580, y: 326, id: 'bench_fungal_main' },
    { type: 'chest', x: 300, y: 130, id: 'chest_fungal_01', contains: { type: 'charm', id: 'soul_catcher' } },
  ],
  platforms: [
    { x:0,y:330,w:640,h:50 }, { x:0,y:0,w:10,h:380 }, { x:630,y:0,w:10,h:380 },
    { x:80,y:270,w:100,h:10 }, { x:240,y:220,w:120,h:10 }, { x:420,y:190,w:100,h:10 },
    { x:250,y:150,w:80,h:10 }, { x:100,y:100,w:80,h:10 },
  ],
  hazards: [
    { type: 'spore_fog', x: 0, y: 200, w: 80, h: 130 },
    { type: 'acid', x: 500, y: 355, w: 140, h: 25 },
  ],
};

WORLD_MAP.fungal_deep = {
  key: 'fungal_deep',
  displayName: 'Fungal Wastes',
  music: 'music_fungal',
  ambient: 'amb_fungal_deep',
  _w: 480, _h: 270,
  spawns: { default: [240, 40], from_main: [240, 40] },
  connections: {
    up:   { roomKey: 'fungal_main',       spawnPoint: 'default' },
    down: { roomKey: 'ancient_basin_entrance', spawnPoint: 'from_fungal' },
  },
  enemies: [
    { type: 'fungoon',    x: 150, y: 215, data: { dir: 1 } },
    { type: 'shrumal_ogre', x: 280, y: 200, data: {} },
  ],
  npcs: [],
  items: [{ type: 'geo_pile', x: 380, y: 205, id: 'geo_fungal_d1', value: 35 }],
  platforms: [
    { x:0,y:230,w:480,h:40 }, { x:0,y:0,w:10,h:270 }, { x:470,y:0,w:10,h:270 },
    { x:80,y:170,w:80,h:10 }, { x:280,y:150,w:80,h:10 },
  ],
  hazards: [{ type: 'acid', x: 0, y: 252, w: 100, h: 22 }, { type: 'acid', x: 380, y: 252, w: 100, h: 22 }],
};

// ── Mantis Village ─────────────────────────────────────────────────────────
WORLD_MAP.mantis_village_entrance = {
  key: 'mantis_village_entrance',
  displayName: 'Mantis Village',
  music: 'music_mantis',
  ambient: 'amb_fungal',
  _w: 480, _h: 320,
  spawns: { default: [60, 260], from_fungal: [60, 260], after_lords: [240, 260] },
  connections: {
    left: { roomKey: 'fungal_main',       spawnPoint: 'from_mantis_village' },
    down: { roomKey: 'mantis_lords_arena', spawnPoint: 'default' },
  },
  enemies: [
    { type: 'mantis_warrior', x: 200, y: 255, data: {} },
    { type: 'mantis_warrior', x: 340, y: 255, data: {} },
  ],
  npcs: [],
  items: [{ type: 'bench', x: 420, y: 272, id: 'bench_mantis' }],
  platforms: [
    { x:0,y:270,w:480,h:50 }, { x:0,y:0,w:10,h:320 }, { x:470,y:0,w:10,h:320 },
    { x:0,y:0,w:480,h:10 },
    { x:100,y:210,w:80,h:10 }, { x:300,y:190,w:80,h:10 },
  ],
  hazards: [],
};

WORLD_MAP.mantis_lords_arena = {
  key: 'mantis_lords_arena',
  displayName: 'Mantis Village',
  music: 'music_boss',
  ambient: 'amb_fungal',
  _w: 480, _h: 320,
  spawns: { default: [60, 270], after_boss: [240, 270] },
  connections: {
    up:   { roomKey: 'mantis_village_entrance', spawnPoint: 'default' },
    down: { roomKey: 'ancient_basin_entrance',  spawnPoint: 'from_mantis' },
  },
  bosses: [{ type: 'mantis_lords', x: 350, y: 250, geoReward: 180, id: 'boss_mantis_lords' }],
  enemies: [],
  npcs: [],
  items: [
    { type: 'bench', x: 440, y: 288, id: 'bench_mantis_post' },
    { type: 'charm', x: 240, y: 260, id: 'mark_of_pride_reward', charmId: 'mark_of_pride' },
  ],
  platforms: [
    { x:0,y:290,w:480,h:30 }, { x:0,y:0,w:10,h:320 }, { x:470,y:0,w:10,h:320 },
    { x:0,y:0,w:480,h:10 },
    { x:50,y:240,w:60,h:10 }, { x:370,y:240,w:60,h:10 }, { x:210,y:220,w:60,h:10 },
  ],
  hazards: [],
};

// ── Ancient Basin ──────────────────────────────────────────────────────────
WORLD_MAP.ancient_basin_entrance = {
  key: 'ancient_basin_entrance',
  displayName: 'Ancient Basin',
  music: 'music_basin',
  ambient: 'amb_void',
  _w: 480, _h: 270,
  spawns: {
    default: [240, 40], from_city: [240, 40],
    from_fungal: [240, 40], from_mantis: [240, 40],
  },
  connections: {
    up:   { roomKey: 'city_main', spawnPoint: 'default' },
    down: { roomKey: 'abyss_entrance', spawnPoint: 'from_basin' },
    left: { roomKey: 'basin_west',     spawnPoint: 'default' },
  },
  enemies: [
    { type: 'pale_lurker', x: 180, y: 215, data: {} },
    { type: 'pale_lurker', x: 320, y: 215, data: {} },
  ],
  npcs: [],
  items: [
    { type: 'bench', x: 400, y: 218, id: 'bench_basin' },
    { type: 'chest', x: 240, y: 200, id: 'chest_basin_01', contains: { type: 'charm', id: 'stalwart_shell' } },
  ],
  platforms: [
    { x:0,y:230,w:480,h:40 }, { x:0,y:0,w:10,h:270 }, { x:470,y:0,w:10,h:270 },
    { x:100,y:170,w:80,h:10 }, { x:280,y:150,w:80,h:10 },
  ],
  hazards: [{ type: 'void_tide', x: 0, y: 255, w: 480, h: 20 }],
};

WORLD_MAP.basin_west = {
  key: 'basin_west',
  displayName: 'Ancient Basin',
  music: 'music_basin',
  ambient: 'amb_void',
  _w: 480, _h: 270,
  spawns: { default: [420, 200] },
  connections: {
    right: { roomKey: 'ancient_basin_entrance', spawnPoint: 'default' },
  },
  enemies: [{ type: 'pale_lurker', x: 200, y: 210, data: {} }],
  npcs: [],
  items: [
    { type: 'ability', x: 140, y: 195, id: 'shade_cloak_altar', abilityId: 'shade_cloak' },
  ],
  platforms: [
    { x:0,y:225,w:480,h:45 }, { x:0,y:0,w:10,h:270 }, { x:470,y:0,w:10,h:270 },
    { x:80,y:165,w:80,h:10 }, { x:260,y:145,w:80,h:10 },
  ],
  hazards: [],
};

WORLD_MAP.abyss_entrance = {
  key: 'abyss_entrance',
  displayName: 'The Abyss',
  music: 'music_abyss',
  ambient: 'amb_void_deep',
  _w: 480, _h: 270,
  spawns: { default: [240, 30], from_basin: [240, 30] },
  connections: {
    up: { roomKey: 'ancient_basin_entrance', spawnPoint: 'default' },
  },
  enemies: [],
  npcs: [],
  items: [
    { type: 'void_heart_altar', x: 240, y: 200, id: 'void_heart', requires: 'all_dreamers' },
    { type: 'lore_tablet', x: 120, y: 208, id: 'tablet_abyss_01', dialogueKey: 'abyss_tablet_01' },
  ],
  platforms: [
    { x:0,y:220,w:480,h:50 }, { x:0,y:0,w:10,h:270 }, { x:470,y:0,w:10,h:270 },
    { x:80,y:160,w:80,h:10 }, { x:300,y:140,w:80,h:10 },
  ],
  hazards: [{ type: 'void_tide', x: 0, y: 248, w: 480, h: 25 }],
};

// ── Dreamers / Late game ───────────────────────────────────────────────────
WORLD_MAP.dreamer_monomon = {
  key: 'dreamer_monomon',
  displayName: 'Teacher\'s Archives',
  music: 'music_archive',
  ambient: 'amb_hum',
  _w: 480, _h: 270,
  spawns: { default: [60, 200] },
  connections: {
    left: { roomKey: 'fungal_deep', spawnPoint: 'default' },
  },
  enemies: [
    { type: 'uumuu', x: 300, y: 160, data: { id: 'boss_uumuu' } },
  ],
  npcs: [{ type: 'monomon', x: 240, y: 100, dialogueKey: 'monomon', id: 'monomon_01' }],
  items: [{ type: 'dreamer_seal', x: 240, y: 80, id: 'seal_monomon', dreamer: 'monomon' }],
  platforms: [
    { x:0,y:215,w:480,h:55 }, { x:0,y:0,w:10,h:270 }, { x:470,y:0,w:10,h:270 },
    { x:100,y:155,w:80,h:10 }, { x:300,y:130,w:80,h:10 },
  ],
  hazards: [{ type: 'acid', x: 0, y: 250, w: 480, h: 20 }],
};

WORLD_MAP.dreamer_lurien = {
  key: 'dreamer_lurien',
  displayName: 'Watcher\'s Spire',
  music: 'music_city',
  ambient: 'amb_rain',
  _w: 480, _h: 320,
  spawns: { default: [60, 260] },
  connections: {
    left: { roomKey: 'city_east', spawnPoint: 'default' },
  },
  enemies: [
    { type: 'lurien_watcher', x: 300, y: 180, data: { id: 'boss_lurien' } },
  ],
  npcs: [{ type: 'lurien', x: 240, y: 80, dialogueKey: 'lurien', id: 'lurien_01' }],
  items: [{ type: 'dreamer_seal', x: 240, y: 60, id: 'seal_lurien', dreamer: 'lurien' }],
  platforms: [
    { x:0,y:280,w:480,h:40 }, { x:0,y:0,w:10,h:320 }, { x:470,y:0,w:10,h:320 },
    { x:100,y:220,w:80,h:10 }, { x:300,y:200,w:80,h:10 }, { x:200,y:160,w:80,h:10 },
  ],
  hazards: [],
  rain: true,
};

WORLD_MAP.dreamer_herrah = {
  key: 'dreamer_herrah',
  displayName: 'Beast\'s Den',
  music: 'music_beasts_den',
  ambient: 'amb_den',
  _w: 480, _h: 270,
  spawns: { default: [60, 200] },
  connections: {
    left: { roomKey: 'basin_west', spawnPoint: 'default' },
  },
  enemies: [
    { type: 'dung_defender', x: 300, y: 200, data: { id: 'boss_dung_defender' } },
  ],
  npcs: [{ type: 'herrah', x: 240, y: 100, dialogueKey: 'herrah', id: 'herrah_01' }],
  items: [{ type: 'dreamer_seal', x: 240, y: 80, id: 'seal_herrah', dreamer: 'herrah' }],
  platforms: [
    { x:0,y:215,w:480,h:55 }, { x:0,y:0,w:10,h:270 }, { x:470,y:0,w:10,h:270 },
    { x:80,y:155,w:80,h:10 }, { x:280,y:140,w:80,h:10 },
  ],
  hazards: [],
};

// ── Final confrontation ────────────────────────────────────────────────────
WORLD_MAP.black_egg_temple = {
  key: 'black_egg_temple',
  displayName: 'Black Egg Temple',
  music: 'music_temple',
  ambient: 'amb_void_deep',
  _w: 480, _h: 270,
  spawns: { default: [60, 200], from_basin: [60, 200] },
  connections: {
    up: { roomKey: 'abyss_entrance', spawnPoint: 'default' },
  },
  enemies: [],
  npcs: [{ type: 'elderbug', x: 240, y: 198, dialogueKey: 'elderbug_temple', id: 'elderbug_temple' }],
  items: [
    { type: 'black_egg_door', x: 240, y: 160, id: 'black_egg_door', requires: 'all_dreamers' },
  ],
  platforms: [
    { x:0,y:215,w:480,h:55 }, { x:0,y:0,w:10,h:270 }, { x:470,y:0,w:10,h:270 },
    { x:100,y:140,w:280,h:10 },
  ],
  hazards: [],
};

WORLD_MAP.hollow_knight_arena = {
  key: 'hollow_knight_arena',
  displayName: 'Black Egg Temple',
  music: 'music_boss_final',
  ambient: 'amb_void_deep',
  _w: 480, _h: 320,
  spawns: { default: [60, 270] },
  connections: {},
  bosses: [{ type: 'hollow_knight', x: 350, y: 250, geoReward: 0, id: 'boss_hollow_knight' }],
  enemies: [],
  npcs:    [],
  items:   [],
  platforms: [
    { x:0,y:290,w:480,h:30 }, { x:0,y:0,w:10,h:320 }, { x:470,y:0,w:10,h:320 },
    { x:0,y:0,w:480,h:10 },
  ],
  hazards: [],
};

// ── Update existing connections ────────────────────────────────────────────
WORLD_MAP.crossroads_main.connections.right = { roomKey: 'fungal_entrance', spawnPoint: 'from_crossroads' };
WORLD_MAP.greenpath_main.connections.down   = { roomKey: 'city_entrance',   spawnPoint: 'from_greenpath' };

AREAS.city_of_tears   = { label: 'City of Tears',   colour: 0x3a3a8a };
AREAS.soul_sanctum    = { label: 'Soul Sanctum',     colour: 0x6a3a8a };
AREAS.fungal_wastes   = { label: 'Fungal Wastes',    colour: 0x5a6a2a };
AREAS.mantis_village  = { label: 'Mantis Village',   colour: 0x2a5a2a };
AREAS.ancient_basin   = { label: 'Ancient Basin',    colour: 0x1a1a2a };
AREAS.abyss           = { label: 'The Abyss',        colour: 0x050508 };
