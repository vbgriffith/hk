# Hollow Knight Web Clone — Integration Guide

## Quick Start

Unzip the archive and open `index.html` in any modern browser. No build step, no server required — it runs directly from the filesystem.

```
hollow-knight-complete/
├── index.html          ← Open this
├── css/style.css
├── js/
│   ├── main.js
│   ├── data/
│   ├── systems/
│   ├── entities/
│   ├── ui/
│   └── scenes/
└── README.md
```

---

## Architecture Overview

The game is built on **Phaser 3** (loaded from CDN) with a layered patching system. Each phase of development adds to the base by monkey-patching `GameScene.prototype` rather than subclassing, so all phases stay in one scene.

### Load Order (index.html)

Scripts must load in this exact order:

```
1. Phaser 3 (CDN)
2. data/constants.js         → C object (game constants)
3. data/constants_p3.js      → merges extra constants into window.C
4. data/animationDefs.js     → ANIM_DEFS
5. data/animationDefs_p3.js  → extends ANIM_DEFS
6. data/mapData.js           → WORLD_MAP (Phase I–II rooms)
7. data/mapData_p3.js        → extends WORLD_MAP (Phase III–V rooms)
8. data/dialogueData.js      → DIALOGUE
9. data/dialogueData_p3.js   → extends DIALOGUE
10. systems/ (all)           → SaveSystem, AudioSystem, etc.
11. entities/ (all)          → Entity, Knight, NPC, bosses, enemies
12. ui/ (all)                → HUD, DialogueBox, PauseMenu, etc.
13. scenes/ (all)            → Boot→Preload→MainMenu→Game
14. main.js                  → Phaser.Game bootstrap
```

---

## Key Systems

### SaveSystem (`js/systems/AudioSystem.js`)

```js
SaveSystem.save(data)    // writes to localStorage
SaveSystem.load()        // returns merged save or null
SaveSystem.clear()       // wipes save
SaveSystem.defaultSave() // returns fresh save object
```

**Save data shape:**
```js
{
  geo: 0,
  masks: 5,
  soul: 0,
  abilities: { dash, walljump, doublejump, dreamnail, fireball, dive, shade_cloak, void_heart, ... },
  charms: [],         // currently equipped charm IDs
  ownedCharms: [],    // all collected charm IDs
  charmSlots: 3,
  visitedRooms: [],
  benchRoom: 'crossroads_entrance',
  benchSpawn: 'default',
  itemsCollected: [], // IDs of collected/spent items
  flags: {},          // boss defeats: { false_knight_01: true, ... }
  shade: null         // { room, x, y, geo } or null
}
```

---

### InputHandler (`js/systems/InputHandler.js`)

All input flows through `scene._input`. Key bindings are defined in `C.INPUT` (constants.js).

```js
scene._input.left        // held
scene._input.right       // held
scene._input.jump        // just pressed (buffered 2 frames)
scene._input.jumpHeld    // held
scene._input.attack      // just pressed
scene._input.dash        // just pressed
scene._input.focus       // held
scene._input.cast        // just pressed
scene._input.interact    // just pressed
scene._input.justPressed('ACTION')  // raw buffer check
scene._input.isDown('ACTION')       // raw held check
```

Default bindings:

| Action | Keys |
|--------|------|
| Move | Arrow keys / WASD |
| Jump | Z / Space |
| Attack | X / J |
| Dash | C / Shift |
| Focus (Heal) | A / F |
| Cast Spell | Q / U |
| Dream Nail | R / N |
| Interact | E / Enter |
| Map | Tab / M |
| Pause | Esc / P |
| Inventory | I |

Gamepad (Xbox layout) is also supported.

---

### Room System (`js/data/mapData.js`)

Each room is an entry in the `WORLD_MAP` object:

```js
WORLD_MAP['my_room'] = {
  key:         'my_room',
  displayName: 'My Room',
  music:       'music_crossroads',
  _w:          480,   // optional, defaults to C.WIDTH
  _h:          270,   // optional, defaults to C.HEIGHT

  spawns: {
    default:       [60, 200],   // [x, y]
    from_left:     [60, 200],
    from_right:    [400, 200],
  },

  connections: {
    left:  { roomKey: 'other_room', spawnPoint: 'from_right' },
    right: { roomKey: 'another',    spawnPoint: 'default'    },
    up:    { roomKey: 'above',      spawnPoint: 'from_below' },
    down:  { roomKey: 'below',      spawnPoint: 'from_above' },
  },

  platforms: [
    { x: 0, y: 205, w: 480, h: 65 },  // floor
    { x: 100, y: 150, w: 80, h: 10 }, // ledge
  ],

  hazards: [
    { type: 'acid',      x: 200, y: 240, w: 80,  h: 30 },
    { type: 'spike',     x: 300, y: 200, w: 16,  h: 10 },
    { type: 'spore_fog', x: 0,   y: 100, w: 480, h: 80 },
    { type: 'void_tide', x: 0,   y: 240, w: 480, h: 30 },
  ],

  enemies: [
    { type: 'crawler',   x: 200, y: 195, id: 'crawler_01', data: { dir: 1 } },
    { type: 'spitter',   x: 320, y: 195, id: 'spitter_01', data: {} },
  ],

  npcs: [
    { type: 'elderbug', x: 100, y: 185, dialogueKey: 'elderbug', id: 'npc_01' },
  ],

  bosses: [
    { type: 'false_knight', x: 240, y: 180, id: 'false_knight_01' },
  ],

  items: [
    { type: 'bench',          x: 80,  y: 207, id: 'bench_01' },
    { type: 'lore_tablet',    x: 150, y: 188, id: 'tablet_01', dialogueKey: 'crossroads_tablet_1' },
    { type: 'dreamer_seal',   x: 240, y: 100, id: 'seal_monomon', dreamer: 'monomon' },
    { type: 'ability',        x: 240, y: 150, id: 'dive_tome', abilityId: 'dive' },
    { type: 'charm',          x: 200, y: 180, id: 'charm_01', charmId: 'wayward_compass' },
    { type: 'black_egg_door', x: 240, y: 150, id: 'black_egg_door' },
  ],

  rain: true,  // enables rain effect (City of Tears style)
};
```

**Adding a new room:** Add the entry to `WORLD_MAP`, add spawn points, wire `connections` in both the new room and any connected rooms.

---

### Adding a New Enemy

1. Create a class extending `Entity` in `js/entities/enemies/`:

```js
class MyEnemy extends Entity {
  constructor(scene, x, y, data = {}) {
    super(scene, x, y, 'my_enemy_texture');
    this.hp    = 30;
    this.dmg   = 10;
    this.alive = true;
    this._aiTimer = 0;

    this.setSize(16, 20, 8, 10);  // physics body
    this.sprite.setGravityY(C.GRAVITY);
  }

  update(dt) {
    if (!this.alive) return;
    const player = this.scene.knight;
    if (!player) return;

    // AI logic here...

    // Deal contact damage:
    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    if (dist < 16) player.onHit(this.dmg, this);
  }

  onHit(damage, source) {
    this.hp -= damage;
    this.scene._particles?.hitBurst({ x: this.x, y: this.y });
    if (this.hp <= 0) this._die();
  }

  _die() {
    this.alive = false;
    this.scene.spawnGeo(this.x, this.y, 10);
    this.sprite.destroy();
  }
}
```

2. Add the sprite texture to `PreloadScene.js` inside `_genCustomTextures()` using `textures.createCanvas()`.

3. Register the type in `GameScene.prototype._spawnEnemy` (or in a phase extension).

4. Add to `mapData.js` room under `enemies: [{ type: 'my_enemy', x: 200, y: 195, id: 'unique_id' }]`.

---

### Adding a New Boss

1. Extend `Entity`, add `onHit(damage, source)` and `update(dt)` with phase logic.

2. Call `this.scene._hud.showBossBar('Name', hp, maxHp)` when the boss activates.

3. On defeat, call `this.scene._save.flags[this._id] = true` and `this.scene._hud.hideBossBar()`.

4. Register in `GameScene.prototype._spawnBoss` switch or P2/P3 extension.

5. Add to room's `bosses` array in `mapData.js`.

---

### Adding a New Charm

1. Add entry to `CHARMS` in `js/systems/CharmSystem.js`:

```js
{
  id:       'my_charm',
  name:     'My Charm',
  desc:     'Does something useful.',
  notches:  1,
  onEquip:  (knight) => { knight.state.myCharmActive = true; },
  onUnequip:(knight) => { knight.state.myCharmActive = false; },
  onUpdate: (knight, dt) => { /* per-frame effect */ },
}
```

2. Add texture generation in `PreloadScene.js` under `_genCharmTextures()`.

3. Place in world via a `{ type: 'charm', charmId: 'my_charm', ... }` item in a room.

---

### Dialogue System

All dialogue lives in `DIALOGUE` (global object, populated by `dialogueData.js` and `dialogueData_p3.js`).

```js
// Simple array format (most common):
DIALOGUE.my_npc = {
  first_meeting: [
    { speaker: 'NPC Name', text: 'Hello, traveller.' },
    { speaker: 'NPC Name', text: 'Watch your step.' },
  ],
  generic: [
    { speaker: 'NPC Name', text: 'Still here.' },
  ],
};

// Show programmatically:
scene._dialogue.show(lines, onCompleteCallback);

// Show then transition:
scene._dialogue.show(DIALOGUE.my_npc.first_meeting, () => {
  scene._transitionRoom('next_room', 'from_here');
});
```

---

### Physics & Collision Notes

- **Platforms** are `Phaser.Physics.Arcade.StaticGroup` objects rebuilt each room load.
- **`_clearRoom()`** calls `physics.world.colliders.destroy()` — all colliders/overlaps are wiped between rooms. Re-register colliders after every `_loadRoom()` call.
- **Transition zones** extend 28px inward from each edge so they're reachable before the player hits the wall.
- **Cooldown**: 0.6s transition cooldown prevents immediate back-triggers on arrival.
- **UI objects** (HUD, DialogueBox, PauseMenu, MapScreen, InventoryScreen, ShopScreen) survive `_clearRoom()` via `_getDisplayObjects()` protection lists.

---

## Bug Fixes Applied (Today's Session)

### Fix 1 — Room Transitions: Walls blocking exits
**File:** `GameScene.js` — `_buildRoomEdges()`  
**Problem:** Invisible collision walls were added on *all* sides unconditionally, blocking the player from reaching the transition zones on connected sides.  
**Fix:** Only add walls on sides with no `connections` entry for that direction.

### Fix 2 — Transition Zones Unreachable
**File:** `GameScene.js` — `_buildTransitions()`  
**Problem:** Transition overlap zones were placed just outside the room boundary (at `x = W`, `y = H`), behind the walls.  
**Fix:** Zones now extend 28px *inward* from the edge, so the player walks into them before reaching any boundary.

### Fix 3 — Transition Cooldown
**File:** `GameScene.js` — `_transitionRoom()`, `update()`  
**Problem:** Overlap callbacks fire on the same frame as room load, potentially triggering an immediate reverse transition.  
**Fix:** Added `_transitionCooldown = 0.6s` that prevents transition triggers immediately after arriving in a new room.

### Fix 4 — Post-Transition Interaction Crashes
**File:** `GameScene.js` — `_clearRoom()`  
**Problem:** `physics.world.colliders.destroy()` was called before groups were cleared, causing double-destroy on static physics bodies. Stale overlap callbacks from the previous room could fire against destroyed entities.  
**Fix:** Groups cleared first, entities destroyed, then `colliders.destroy()` — all inside `try/catch`. Entity arrays (enemies, npcs, projectiles, shards, bosses, transitions) reset to `[]`.

### Fix 5 — HUD Destroyed on Room Transition
**File:** `GameScene.js` — `_clearRoom()`, `HUD.js`  
**Problem:** `_clearRoom` destroyed all scene children including HUD graphics objects. After transition, `hud.update()` threw on destroyed objects.  
**Fix:** HUD now exposes `getDisplayObjects()`. DialogueBox, PauseMenu, MapScreen, InventoryScreen, ShopScreen each expose `_getDisplayObjects()`. `_clearRoom` builds a `Set` of all protected objects and skips them during cleanup.

### Fix 6 — Missing BootScene
**File:** `BootScene.js`  
**Problem:** `BootScene` was already defined inside `PreloadScene.js` but `index.html` loaded a separate `BootScene.js` that redefined it, causing a class redeclaration error.  
**Fix:** `BootScene.js` now contains only a comment pointing to its actual location in `PreloadScene.js`.

### Fix 7 — Invalid Keycode 'NONE'
**File:** `constants.js` — `INPUT.INVENTORY`  
**Problem:** `'NONE'` is not a valid Phaser KeyCode — caused a throw in `InputHandler._setupKeyboard()` on game init.  
**Fix:** Removed `'NONE'`. `InputHandler` also updated to filter invalid/missing keycodes gracefully.

### Fix 8 — Text Unreadable (Font Sizes)
**Files:** All UI/scene files  
**Problem:** Game renders at 480×270 with `camera.setZoom(3)`. Text drawn in game-space with `fontSize: 6–14` displayed at 6–14 actual pixels on a 1440px canvas — completely unreadable.  
**Fix:** All `fontSize` values multiplied by 3 across 8 files (HUD, DialogueBox, InventoryScreen, ShopSystem, MainMenuScene, EndingScene, NPC, GameScene_p3). Credits `size:` data arrays also scaled.

### Fix 9 — Entity x/y Getters Unsafe
**File:** `Entity.js`, `NPC.js` (Projectile class)  
**Problem:** `get x() { return this.sprite.x; }` throws if sprite is destroyed.  
**Fix:** `get x() { return this.sprite?.x ?? 0; }` with matching setters on all entity base classes.

### Fix 10 — Knight.onHit Source Reference Crash
**File:** `Knight.js`  
**Problem:** `Math.sign(this.x - source.x)` throws if `source` is a destroyed entity (its sprite's `x` getter throws).  
**Fix:** Guard: bail if `this.sprite?.active` is false; read `source.x` inside `try/catch`.

### Fix 11 — PauseMenu Item Overlap
**File:** `DialogueBox.js` — `PauseMenu._build()`  
**Problem:** Menu items spaced `i * 18` pixels — too close together after font scaling.  
**Fix:** Spacing increased to `i * 28`.

### Fix 12 — PauseMenu Quit Crashes
**File:** `DialogueBox.js` — `PauseMenu.select()`  
**Problem:** `scene.scene.start(C.SCENE_MENU)` — the Phaser scene key `'MainMenu'` must match the string used in `MainMenuScene`'s constructor `super(C.SCENE_MENU)`. Additionally, the save was not written before quitting.  
**Fix:** Save is now written before scene transition. Inventory option now opens InventoryScreen properly.

---

## Common Extension Patterns

### Trigger dialogue then transition
```js
this.scene._dialogue.show(myLines, () => {
  this.scene._transitionRoom('destination_room', 'spawn_name');
});
```

### Grant an ability
```js
this.scene.knight.abilities.dash = true;
this.scene._save.abilities.dash  = true;
SaveSystem.save(this.scene._buildSaveData());
```

### Set a flag (e.g. boss defeated)
```js
this.scene._save.flags['my_boss_id'] = true;
SaveSystem.save(this.scene._buildSaveData());
```

### Spawn a particle burst
```js
this.scene._particles.burst({
  x: this.x, y: this.y,
  count: 12,
  tint: 0x5ae3e3,
  speedX: [-80, 80],
  speedY: [-120, -20],
  lifespan: 400,
});
```

### Spawn a projectile (enemy fires at player)
```js
this.scene.spawnProjectile({
  x: this.x, y: this.y,
  vx: dir * 160, vy: -30,
  texture: 'fireball',
  dmg: 15,
  owner: 'enemy',
  tint: 0xff8800,
  lifespan: 2000,
});
```

---

## File Reference

| File | Purpose |
|------|---------|
| `js/data/constants.js` | All numeric constants and config |
| `js/data/constants_p3.js` | Phase III–V constant additions |
| `js/data/mapData.js` | Phase I–II room definitions |
| `js/data/mapData_p3.js` | Phase III–V room definitions |
| `js/data/dialogueData.js` | All dialogue text |
| `js/data/animationDefs.js` | Animation frame configs |
| `js/systems/AudioSystem.js` | SaveSystem, AudioSystem, CameraSystem, ParticleSystem |
| `js/systems/InputHandler.js` | Keyboard/gamepad input |
| `js/systems/AnimationManager.js` | Phaser animation registration |
| `js/systems/CharmSystem.js` | Charm equip/effects |
| `js/systems/DreamerSystem.js` | Dreamer seal tracking |
| `js/systems/RainSystem.js` | City of Tears rain particles |
| `js/systems/ShopSystem.js` | Shop UI and inventory |
| `js/systems/AudioEngine.js` | Web Audio API procedural music/SFX |
| `js/entities/Entity.js` | Base class for all game objects |
| `js/entities/Knight.js` | Player character, all abilities |
| `js/entities/NPC.js` | NPC, Projectile, Shard, Shade classes |
| `js/entities/DreamNail.js` | Dream Nail swing and effects |
| `js/entities/enemies/Crawler.js` | Crawler + Spitter (Spitter.js contains FlyingScout) |
| `js/entities/enemies/Mosscreep.js` | Mosscreep + Vengefly + Aspid |
| `js/entities/enemies/PhaseIIIEnemies.js` | Phase III–V enemies |
| `js/entities/bosses/FalseKnight.js` | False Knight boss |
| `js/entities/bosses/GruzMother.js` | Gruz Mother + VengeflyKing |
| `js/entities/bosses/SoulMaster.js` | Soul Master boss |
| `js/entities/bosses/MantisLords.js` | Mantis Lords (3-entity) boss |
| `js/entities/bosses/HollowKnightBoss.js` | Hollow Knight + Radiance |
| `js/ui/HUD.js` | Health masks, soul vessel, geo counter, boss bar |
| `js/ui/DialogueBox.js` | Dialogue + PauseMenu + MapScreen |
| `js/ui/InventoryScreen.js` | Charm inventory screen |
| `js/scenes/PreloadScene.js` | BootScene + PreloadScene (texture generation) |
| `js/scenes/PreloadScene_p3.js` | Phase III–V texture generation |
| `js/scenes/MainMenuScene.js` | Title screen |
| `js/scenes/GameScene.js` | Core gameplay (Phase I + II patches) |
| `js/scenes/GameScene_p3.js` | Phase III–V gameplay patches |
| `js/scenes/EndingScene.js` | Ending + Credits scenes |
| `js/main.js` | Phaser.Game bootstrap |

---

## Controls Reference

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move |
| Z / Space | Jump (hold for higher jump) |
| X / J | Attack (nail swing) |
| Hold X/J | Charge nail art |
| C / Shift | Dash |
| A / F | Focus (heal, costs 33 soul) |
| Q / U | Cast spell (Fireball / Dive) |
| R / N | Dream Nail (hold) |
| E / Enter | Interact with NPCs / items |
| Tab / M | Open map |
| I | Charm inventory |
| Esc / P | Pause |

---

*Built with Phaser 3.60 — All graphics and audio procedurally generated.*
