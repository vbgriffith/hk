/* js/data/mapData_expansion.js — Session 7: World completion & connection fixes
 * 
 * This file adds missing Hollow Knight areas and corrects all room connections.
 * Load AFTER mapData.js and mapData_p3.js in index.html
 */
'use strict';

// ══════════════════════════════════════════════════════════════════════════
// FOG CANYON — Uumuu boss area, connects Greenpath/Queen's Gardens/Archives
// ══════════════════════════════════════════════════════════════════════════

WORLD_MAP.fog_canyon_entrance = {
  key: 'fog_canyon_entrance',
  displayName: 'Fog Canyon',
  music: 'music_city',
  ambient: 'amb_city',
  tilemap: null,
  _w: 480, _h: 270,
  spawns: {
    default: [60, 220],
    from_greenpath: [60, 220],
    from_main: [420, 220],
  },
  connections: {
    left: { roomKey: 'greenpath_main', spawnPoint: 'from_fog' },
    right: { roomKey: 'fog_canyon_main', spawnPoint: 'from_entrance' },
  },
  enemies: [],
  npcs: [],
  items: [],
  platforms: [
    { x: 0, y: 235, w: 480, h: 35 },
    { x: 100, y: 170, w: 80, h: 10 },
    { x: 300, y: 170, w: 80, h: 10 },
  ],
  hazards: [],
};

WORLD_MAP.fog_canyon_main = {
  key: 'fog_canyon_main',
  displayName: 'Fog Canyon',
  music: 'music_city',
  ambient: 'amb_city',
  tilemap: null,
  _w: 480, _h: 320,
  spawns: {
    default: [240, 260],
    from_entrance: [60, 260],
    from_archives: [420, 100],
  },
  connections: {
    left: { roomKey: 'fog_canyon_entrance', spawnPoint: 'from_main' },
    up: { roomKey: 'teacher_archives', spawnPoint: 'from_fog' },
  },
  enemies: [
    { type: 'winged_fool', x: 200, y: 150, data: {} },
    { type: 'winged_fool', x: 350, y: 180, data: {} },
  ],
  npcs: [],
  items: [],
  platforms: [
    { x: 0, y: 290, w: 480, h: 30 },
    { x: 150, y: 220, w: 180, h: 10 },
    { x: 80, y: 150, w: 100, h: 10 },
    { x: 300, y: 150, w: 100, h: 10 },
  ],
  hazards: [],
};

WORLD_MAP.teacher_archives = {
  key: 'teacher_archives',
  displayName: "Teacher's Archives",
  music: 'music_city',
  ambient: 'amb_city',
  tilemap: null,
  _w: 480, _h: 270,
  spawns: {
    default: [240, 220],
    from_fog: [420, 220],
    from_uumuu: [240, 80],
  },
  connections: {
    down: { roomKey: 'fog_canyon_main', spawnPoint: 'from_archives' },
    up: { roomKey: 'uumuu_arena', spawnPoint: 'from_archives' },
  },
  enemies: [],
  npcs: [
    { type: 'generic', x: 100, y: 215, dialogueKey: 'quirrel_archives', id: 'quirrel_archives' },
  ],
  items: [
    { type: 'lore_tablet', x: 350, y: 218, id: 'tablet_archives', dialogueKey: 'archives_tablet' },
  ],
  platforms: [
    { x: 0, y: 235, w: 480, h: 35 },
    { x: 180, y: 170, w: 120, h: 10 },
  ],
  hazards: [],
};

WORLD_MAP.uumuu_arena = {
  key: 'uumuu_arena',
  displayName: "Teacher's Archives",
  music: 'music_boss',
  ambient: 'amb_city',
  tilemap: null,
  _w: 480, _h: 320,
  spawns: {
    default: [240, 280],
    from_archives: [240, 280],
    after_boss: [240, 100],
  },
  connections: {
    down: { roomKey: 'teacher_archives', spawnPoint: 'from_uumuu' },
    up: { roomKey: 'dreamer_monomon', spawnPoint: 'from_uumuu' },
  },
  bosses: [
    { type: 'uumuu', x: 240, y: 180, geoReward: 200, id: 'boss_uumuu' },
  ],
  enemies: [],
  npcs: [],
  items: [],
  platforms: [
    { x: 0, y: 305, w: 480, h: 15 },
    { x: 100, y: 240, w: 80, h: 10 },
    { x: 300, y: 240, w: 80, h: 10 },
    { x: 0, y: 60, w: 480, h: 20 },
  ],
  hazards: [],
};

// ══════════════════════════════════════════════════════════════════════════
// CRYSTAL PEAK — connects Dirtmouth, Resting Grounds
// ══════════════════════════════════════════════════════════════════════════

WORLD_MAP.crystal_peak_entrance = {
  key: 'crystal_peak_entrance',
  displayName: 'Crystal Peak',
  music: 'music_crossroads',
  ambient: 'amb_crossroads',
  tilemap: null,
  _w: 480, _h: 270,
  spawns: {
    default: [60, 220],
    from_dirtmouth: [60, 80],
    from_main: [420, 220],
  },
  connections: {
    up: { roomKey: 'dirtmouth', spawnPoint: 'from_peak' },
    right: { roomKey: 'crystal_peak_main', spawnPoint: 'from_entrance' },
  },
  enemies: [
    { type: 'crawler', x: 200, y: 215, data: { dir: 1 } },
  ],
  npcs: [],
  items: [],
  platforms: [
    { x: 0, y: 235, w: 480, h: 35 },
    { x: 0, y: 100, w: 120, h: 10 },
    { x: 200, y: 160, w: 80, h: 10 },
  ],
  hazards: [],
};

WORLD_MAP.crystal_peak_main = {
  key: 'crystal_peak_main',
  displayName: 'Crystal Peak',
  music: 'music_crossroads',
  ambient: 'amb_crossroads',
  tilemap: null,
  _w: 480, _h: 320,
  spawns: {
    default: [240, 280],
    from_entrance: [60, 280],
    from_resting: [420, 100],
  },
  connections: {
    left: { roomKey: 'crystal_peak_entrance', spawnPoint: 'from_main' },
    up: { roomKey: 'resting_grounds_entrance', spawnPoint: 'from_peak' },
  },
  enemies: [
    { type: 'crawler', x: 150, y: 275, data: { dir: 1 } },
    { type: 'crawler', x: 350, y: 275, data: { dir: -1 } },
  ],
  npcs: [],
  items: [
    { type: 'geo_pile', x: 240, y: 250, id: 'geo_peak_01', value: 30 },
  ],
  platforms: [
    { x: 0, y: 295, w: 480, h: 25 },
    { x: 100, y: 230, w: 100, h: 10 },
    { x: 280, y: 230, w: 100, h: 10 },
    { x: 360, y: 120, w: 120, h: 10 },
  ],
  hazards: [],
};

// ══════════════════════════════════════════════════════════════════════════
// RESTING GROUNDS — connects Crystal Peak, City of Tears
// ══════════════════════════════════════════════════════════════════════════

WORLD_MAP.resting_grounds_entrance = {
  key: 'resting_grounds_entrance',
  displayName: 'Resting Grounds',
  music: 'music_city',
  ambient: 'amb_city',
  tilemap: null,
  _w: 480, _h: 270,
  spawns: {
    default: [240, 220],
    from_peak: [60, 220],
    from_city: [420, 220],
  },
  connections: {
    down: { roomKey: 'crystal_peak_main', spawnPoint: 'from_resting' },
    right: { roomKey: 'city_main', spawnPoint: 'from_resting' },
  },
  enemies: [],
  npcs: [],
  items: [
    { type: 'bench', x: 240, y: 228, id: 'bench_resting' },
    { type: 'lore_tablet', x: 350, y: 218, id: 'tablet_resting', dialogueKey: 'resting_tablet' },
  ],
  platforms: [
    { x: 0, y: 235, w: 480, h: 35 },
  ],
  hazards: [],
};

// ══════════════════════════════════════════════════════════════════════════
// QUEEN'S GARDENS — connects Greenpath, Fungal Wastes
// ══════════════════════════════════════════════════════════════════════════

WORLD_MAP.queens_gardens_entrance = {
  key: 'queens_gardens_entrance',
  displayName: "Queen's Gardens",
  music: 'music_greenpath',
  ambient: 'amb_greenpath',
  tilemap: null,
  _w: 480, _h: 270,
  spawns: {
    default: [60, 220],
    from_greenpath: [60, 220],
    from_main: [420, 220],
  },
  connections: {
    left: { roomKey: 'greenpath_lake', spawnPoint: 'from_gardens' },
    right: { roomKey: 'queens_gardens_main', spawnPoint: 'from_entrance' },
  },
  enemies: [
    { type: 'mosscreep', x: 200, y: 215, data: {} },
  ],
  npcs: [],
  items: [],
  platforms: [
    { x: 0, y: 235, w: 480, h: 35 },
    { x: 150, y: 170, w: 180, h: 10 },
  ],
  hazards: [],
};

WORLD_MAP.queens_gardens_main = {
  key: 'queens_gardens_main',
  displayName: "Queen's Gardens",
  music: 'music_greenpath',
  ambient: 'amb_greenpath',
  tilemap: null,
  _w: 480, _h: 320,
  spawns: {
    default: [240, 280],
    from_entrance: [60, 280],
    from_fungal: [420, 280],
  },
  connections: {
    left: { roomKey: 'queens_gardens_entrance', spawnPoint: 'from_main' },
    right: { roomKey: 'fungal_deep', spawnPoint: 'from_gardens' },
  },
  enemies: [
    { type: 'mosscreep', x: 150, y: 275, data: {} },
    { type: 'mosscreep', x: 350, y: 275, data: {} },
  ],
  npcs: [],
  items: [
    { type: 'chest', x: 240, y: 270, id: 'chest_gardens', contains: { type: 'geo', value: 100 } },
  ],
  platforms: [
    { x: 0, y: 295, w: 480, h: 25 },
    { x: 120, y: 220, w: 240, h: 10 },
  ],
  hazards: [],
};

// ══════════════════════════════════════════════════════════════════════════
// KINGDOM'S EDGE — connects City, Basin
// ══════════════════════════════════════════════════════════════════════════

WORLD_MAP.kingdoms_edge_entrance = {
  key: 'kingdoms_edge_entrance',
  displayName: "Kingdom's Edge",
  music: 'music_crossroads',
  ambient: 'amb_crossroads',
  tilemap: null,
  _w: 480, _h: 270,
  spawns: {
    default: [60, 220],
    from_city: [60, 220],
    from_main: [420, 220],
  },
  connections: {
    left: { roomKey: 'city_east', spawnPoint: 'from_edge' },
    right: { roomKey: 'kingdoms_edge_main', spawnPoint: 'from_entrance' },
  },
  enemies: [
    { type: 'great_hopper', x: 200, y: 210, data: {} },
  ],
  npcs: [],
  items: [],
  platforms: [
    { x: 0, y: 235, w: 480, h: 35 },
    { x: 200, y: 170, w: 80, h: 10 },
  ],
  hazards: [],
};

WORLD_MAP.kingdoms_edge_main = {
  key: 'kingdoms_edge_main',
  displayName: "Kingdom's Edge",
  music: 'music_crossroads',
  ambient: 'amb_crossroads',
  tilemap: null,
  _w: 480, _h: 320,
  spawns: {
    default: [240, 280],
    from_entrance: [60, 280],
    from_basin: [240, 80],
  },
  connections: {
    left: { roomKey: 'kingdoms_edge_entrance', spawnPoint: 'from_main' },
    down: { roomKey: 'ancient_basin_entrance', spawnPoint: 'from_edge' },
  },
  enemies: [
    { type: 'great_hopper', x: 150, y: 270, data: {} },
    { type: 'great_hopper', x: 350, y: 270, data: {} },
  ],
  npcs: [],
  items: [
    { type: 'geo_pile', x: 240, y: 250, id: 'geo_edge_01', value: 50 },
  ],
  platforms: [
    { x: 0, y: 295, w: 480, h: 25 },
    { x: 100, y: 230, w: 80, h: 10 },
    { x: 300, y: 230, w: 80, h: 10 },
    { x: 200, y: 100, w: 80, h: 10 },
  ],
  hazards: [],
};

// ══════════════════════════════════════════════════════════════════════════
// CONNECTION FIXES — Update existing rooms
// ══════════════════════════════════════════════════════════════════════════

// Dirtmouth
if (WORLD_MAP.dirtmouth) {
  WORLD_MAP.dirtmouth.connections.right = { roomKey: 'crystal_peak_entrance', spawnPoint: 'from_dirtmouth' };
  if (!WORLD_MAP.dirtmouth.spawns.from_peak) {
    WORLD_MAP.dirtmouth.spawns.from_peak = [420, 180];
  }
}

// Greenpath
if (WORLD_MAP.greenpath_main) {
  WORLD_MAP.greenpath_main.connections.right = { roomKey: 'fog_canyon_entrance', spawnPoint: 'from_greenpath' };
  if (!WORLD_MAP.greenpath_main.spawns.from_fog) {
    WORLD_MAP.greenpath_main.spawns.from_fog = [420, 180];
  }
}

if (WORLD_MAP.greenpath_lake) {
  WORLD_MAP.greenpath_lake.connections.up = { roomKey: 'queens_gardens_entrance', spawnPoint: 'from_greenpath' };
  if (!WORLD_MAP.greenpath_lake.spawns.from_gardens) {
    WORLD_MAP.greenpath_lake.spawns.from_gardens = [240, 80];
  }
}

// City of Tears
if (WORLD_MAP.city_main) {
  WORLD_MAP.city_main.connections.left = { roomKey: 'resting_grounds_entrance', spawnPoint: 'from_city' };
  if (!WORLD_MAP.city_main.spawns.from_resting) {
    WORLD_MAP.city_main.spawns.from_resting = [60, 180];
  }
}

if (WORLD_MAP.city_east) {
  WORLD_MAP.city_east.connections.right = { roomKey: 'kingdoms_edge_entrance', spawnPoint: 'from_city' };
  if (!WORLD_MAP.city_east.spawns.from_edge) {
    WORLD_MAP.city_east.spawns.from_edge = [420, 180];
  }
}

// Fungal Wastes
if (WORLD_MAP.fungal_deep) {
  WORLD_MAP.fungal_deep.connections.left = { roomKey: 'queens_gardens_main', spawnPoint: 'from_fungal' };
  if (!WORLD_MAP.fungal_deep.spawns.from_gardens) {
    WORLD_MAP.fungal_deep.spawns.from_gardens = [60, 220];
  }
}

// Ancient Basin
if (WORLD_MAP.ancient_basin_entrance) {
  WORLD_MAP.ancient_basin_entrance.connections.up = { roomKey: 'kingdoms_edge_main', spawnPoint: 'from_basin' };
  if (!WORLD_MAP.ancient_basin_entrance.spawns.from_edge) {
    WORLD_MAP.ancient_basin_entrance.spawns.from_edge = [240, 80];
  }
}

// Dreamer Monomon (accessed via Uumuu arena)
if (WORLD_MAP.dreamer_monomon) {
  WORLD_MAP.dreamer_monomon.connections.down = { roomKey: 'uumuu_arena', spawnPoint: 'after_boss' };
  if (!WORLD_MAP.dreamer_monomon.spawns.from_uumuu) {
    WORLD_MAP.dreamer_monomon.spawns.from_uumuu = [240, 220];
  }
}
