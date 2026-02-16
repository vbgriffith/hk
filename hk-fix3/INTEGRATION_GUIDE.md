# Hollow Knight Web Clone — Integration Guide
*All bugs fixed through session 4. 66 files, 100% procedural graphics + Web Audio.*

---

## Quick Start

Unzip and open `index.html` in any modern browser. No build step, no server required.

## Script Load Order (index.html)

Scripts must load in this exact order:

1. Phaser 3 CDN
2. data/constants.js → constants_p3.js
3. data/animationDefs.js → animationDefs_p3.js
4. data/mapData.js → mapData_p3.js
5. data/dialogueData.js → dialogueData_p3.js
6. systems/ (AudioEngine, AudioSystem, InputHandler, AnimationManager, CharmSystem, DreamerSystem, RainSystem, ShopSystem)
7. entities/ (Entity, Knight, NPC, DreamNail, enemies/*, bosses/*)
8. ui/ (HUD, DialogueBox, InventoryScreen)
9. scenes/ (PreloadScene, PreloadScene_p3, MainMenuScene, GameScene, GameScene_p3, EndingScene, BootScene)
10. main.js

---

## Controls

| Key | Action |
|-----|--------|
| Arrow / WASD | Move |
| Z / Space | Jump (hold longer = higher) |
| X / J | Attack |
| C / Shift | Dash |
| A / F | Focus (heal — costs soul) |
| Q / U | Cast spell |
| R / N | Dream Nail (hold) |
| E / Enter | Interact |
| Tab / M | Map |
| I | Charm inventory |
| Esc / P | Pause |

---

## Bug Fix Log (Sessions 1–4)

### FIX 1 — Animation Load Order
**Bug:** All boss/enemy animations broken; sprites frozen on frame 0.
**Cause:** `AnimationManager.registerAll()` ran before Phase II/III textures were generated.
**Fix:** Moved `registerAll()` to run after ALL texture generators complete.

```js
// PreloadScene.js Phase II patch — correct order:
PreloadScene.prototype.create = function() {
  this._generateAllTextures();   // Phase I textures
  this._genPhase2Textures();     // Phase II + III (chained)
  AnimationManager.registerAll(this);  // NOW safe
  this.scene.start(C.SCENE_MENU);
};
```

### FIX 2 — Animation Row Count Mismatches
**Bug:** Boss animations crash or play wrong frames.
**Cause:** `_simpleEnemySheet(key, w, h, rowCount)` row counts didn't match ANIM_DEFS.
**Fix:** Updated all mismatched row counts:

| Entity | Old rows | Correct rows |
|--------|----------|--------------|
| soul_master | 5 | 7 |
| hollow_knight_boss | 7 | 9 |
| radiance | 3 | 7 |
| mantis_lords | 5 | 8 |
| mantis_warrior | 3 | 6 |
| dung_defender | 3 | 6 |
| great_hopper / fungoon / shrumal_ogre / uumuu / lurien_watcher | 3 | 4 |
| pale_lurker | 2 | 4 |

### FIX 3 — Dialogue Crash After Room Transition (Bug #2)
**Bug:** Interacting with NPCs, tablets, or bench after transitioning back crashes with `Cannot read setText`.
**Cause:** `scene.time.delayedCall` timer fires after `_clearRoom` destroys objects. The timer callback tries `_bodyText.setText()` on a scene that's been cleaned up.
**Fix:** Three-part fix:

1. Added `cancelTyping()` to DialogueBox — removes timer safely.
2. `_typeText` callbacks guard `if (!this._bodyText?.active || !this._visible) return`.
3. `_clearRoom` calls `this._dialogue.cancelTyping()` + silently clears `_visible` as its very first step.

```js
// _clearRoom, first lines:
this._dialogue?.cancelTyping?.();
if (this._dialogue?.isVisible) {
  this._dialogue._visible = false;
  this._dialogue._callback = null;
}
```

### FIX 4 — No Sound or Music (Bug #3)
**Bug:** Complete silence.
**Cause:** `this._audio = new AudioSystem(this)` — AudioSystem wraps Phaser's sound manager which needs audio FILES. The game has no audio files; all sound is procedural via AudioEngine (Web Audio API).
**Fix:** `this._audio = AUDIO_ENGINE` and added sfx key aliases for legacy names (`sfx_nail`, `sfx_player_hit`, `sfx_player_death`, `sfx_doublejump`, `sfx_heal`, `sfx_geo`, `sfx_shade_collect`).

### FIX 5 — showCompass Missing (Bug #4)
**Bug:** Equipping Wayward Compass throws `_showCompass is not a function`.
**Fix:** Added stub to MapScreen:
```js
_showCompass(visible) { this._compassActive = visible; }
```

### FIX 6 — Charm Inventory Blank (Bug #5)
**Bug:** Inventory screen shows nothing.
**Cause:** `_allCharms = save.ownedCharms ?? []` — empty on fresh save.
**Fix:** Show ALL charms from CHARM_DEFS. Unowned shown as dim silhouettes. Owned shown with full icon and equippable.

### FIX 7 — Text Too Large (Bug #6)
**Bug:** All UI text renders 3× too large.
**Cause:** A prior session multiplied font sizes by C.SCALE=3. But scrollFactor(0) text is already zoomed by camera — `fontSize:9` at `zoom:3` = 27px on screen. Multiplying made it 81px.
**Fix:** Divided all fontSize values by 3 across HUD, DialogueBox, InventoryScreen, MainMenuScene, EndingScene, ShopSystem, NPC, GameScene_p3. Also fixed PauseMenu string literals (`'27px'` → `'9px'`).

### FIX 8 — Continue Crashes After Pause Quit (Bug #7)
**Bug:** After quitting to main menu and starting a new game, crash on re-enter.
**Cause:** Quit left physics paused and dialogue timer running. Phaser can't fully restart the scene cleanly in that state.
**Fix:** Clean shutdown before scene.start:
```js
case 'Quit': {
  try { SaveSystem.save(scene._buildSaveData()); } catch(_) {}
  scene._dialogue?.cancelTyping?.();
  scene._paused = false;
  this._visible = false;
  try { scene.physics.resume(); } catch(_) {}
  scene.scene.start('MainMenu');
}
```

### FIX 9 — Shade Reappears After Collection (Bug #8)
**Bug:** Collected shade respawns when revisiting the room.
**Cause:** `Shade._collect()` destroyed the sprite but never set `scene._save.shade = null`. `_loadRoom` checked `_save.shade.room === currentRoom` and spawned another one.
**Fix:** `_collect()` now clears `scene._save.shade = null`.

### FIX 10 — Soul / Geo Not Resetting on Death (Bug #9)
**Bug:** Soul meter keeps its value after respawning; knight may stay tinted or remain invincible.
**Cause:** `onPlayerDeath` only reset `masks`, not `soul`, `invincible`, tint, or velocity.
**Fix:** Full state reset on respawn:
```js
this.knight.masks    = this.knight.masksMax;
this.knight.soul     = 0;
this.knight.geo      = 0;
this.knight.state.invincible = 0;
this.knight.sprite.setTint(0xffffff);
this.knight.body.setVelocity(0, 0);
```

### FIX 11 — Fungal Entrance Transition Error (Bug #10)
**Bug:** Transitioning to `fungal_entrance` then interacting with Cornifer NPC crashes.
**Cause:** `DIALOGUE.cornifer_fungal` is a flat array. `NPC._getDialogueLines()` called `Object.keys(array)` → `['0','1','2']`, then `def['0']` returned a single line object (not array). `DialogueBox.show()` crashed trying to iterate a non-array.
**Fix:** `_getDialogueLines()` detects flat-array format and returns it directly:
```js
_getDialogueLines() {
  const def = DIALOGUE[this.dialogueKey];
  if (!def) return [{ speaker: '', text: '...' }];
  if (Array.isArray(def)) return def;       // ← flat array support
  const keys = this._getDialogueKeys();
  const key  = keys[Math.min(this._talkIndex, keys.length - 1)];
  const lines = def[key] || def[keys[0]] || [];
  return Array.isArray(lines) ? lines : [lines];
}
```

---

## Save Data Shape

```js
{
  geo: 0, masks: 5, soul: 0, deaths: 0,
  abilities: { dash, walljump, doublejump, dreamnail, fireball, dive, shade_cloak, void_heart },
  charms: [],         // equipped charm IDs
  ownedCharms: [],    // collected charm IDs
  charmSlots: 3,
  visitedRooms: [],
  benchRoom: 'crossroads_entrance',
  benchSpawn: 'default',
  itemsCollected: [], // spent geo piles, one-time items
  flags: {},          // boss defeats: { 'false_knight_arena': true }
  shade: null,        // { room, x, y, geo } or null
}
```

## Key Systems

### AudioEngine (procedural Web Audio)
All sounds are synthesized — no audio files needed.
```js
AUDIO_ENGINE.playSfx('sfx_jump');
AUDIO_ENGINE.playMusic('music_crossroads');
AUDIO_ENGINE.toggleMute();
```

### SaveSystem
```js
SaveSystem.save(data);     // write to localStorage
SaveSystem.load();         // returns merged save or null
SaveSystem.clear();        // wipe (console: SaveSystem.clear())
SaveSystem.defaultSave();  // fresh save object
```

### InputHandler (scene._input)
```js
scene._input.left / right / jump / jumpHeld
scene._input.attack / dash / focus / cast
scene._input.interact / pause / map
scene._input.justPressed('ACTION')
scene._input.isDown('ACTION')
```

### Adding Dialogue
```js
// Flat array (simplest — works with NPC dialogueKey and direct show() call):
DIALOGUE.my_npc = [
  { speaker: 'Elderbug', text: 'Hello, stranger.' },
  { speaker: 'Elderbug', text: 'Safe travels.' }
];

// Keyed object (NPC with progressive conversations):
DIALOGUE.my_npc_2 = {
  first:  [{ speaker: 'NPC', text: 'First meeting.' }],
  repeat: [{ speaker: 'NPC', text: 'We meet again.' }]
};

// Show programmatically:
scene._dialogue.show(DIALOGUE.my_npc, onCompleteCallback);
```

### Adding a Room
```js
WORLD_MAP.my_room = {
  key: 'my_room', displayName: 'Name', music: 'music_crossroads',
  _w: 480, _h: 270,
  spawns: { default: [60, 200], from_left: [60, 200] },
  connections: { left: { roomKey: 'other_room', spawnPoint: 'from_right' } },
  platforms: [{ x: 0, y: 215, w: 480, h: 55 }],
  hazards: [], enemies: [], npcs: [], items: []
};
```

## Hazard Types
| type | Effect |
|------|--------|
| `acid` | Instant kill on contact |
| `spike` | Deals SPIKE_DMG on contact |
| `spore_fog` | Damages after 2s continuous contact |
| `void_tide` | Instant kill, wavy animation |

## Item Types
| type | Description |
|------|-------------|
| `bench` | Save point — respawn anchor |
| `lore_tablet` | Readable inscription |
| `geo_pile` | One-time geo pickup |
| `dream_nail_pedestal` | Grants Dream Nail ability |
| `dreamer_seal` | Dreamer system gate |
| `ability` | Grants movement ability |
| `charm` | Charm pickup on ground |
| `toll_gate` | Geo-cost door |
| `black_egg_door` | Final boss gate |
| `void_heart_altar` | True ending item |
| `chest` | Contains charm |

## Known Limitations
- Normal enemies always respawn on room re-entry (intended HK behaviour). Bosses use `flags` for permanent defeat.
- One save slot only (localStorage `hk_save`). Clear with `SaveSystem.clear()`.
- Audio requires a user gesture on iOS (handled automatically on first click/keypress).
