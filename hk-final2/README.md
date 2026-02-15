# Hollow Knight — Web Clone (Complete Edition)

A full-featured browser-based Hollow Knight clone built with **Phaser 3**, pure JavaScript, and zero build steps.  
Open `index.html` in any modern browser. No server required.

---

## Controls

| Action | Keyboard |
|--------|----------|
| Move | Arrow Keys / WASD |
| Jump | Z / Space |
| Attack (Nail) | X / J |
| Dash | C / Shift |
| Focus / Heal | A / F |
| Cast Spell | Q / U |
| Dream Nail (charge) | R / N |
| Interact / Talk | E / Enter |
| Inventory (Charms) | I |
| Map | Tab / M |
| Pause | Esc / P |

---

## Content Implemented

### Areas (9 total)
- **Forgotten Crossroads** — Tutorial zone with crawlers, spitters, flying scouts
- **Greenpath** — Mossy ruins, acid lakes, vengeflies, aspids
- **City of Tears** — Rain-soaked city with great hoppers, winged fools
- **Soul Sanctum** — Soul twister enemies, corrupted energy
- **Fungal Wastes** — Mushroom caves, spore fog, fungoons, shrumal ogres
- **Mantis Village** — Proud warriors, mantis combat mechanics
- **Ancient Basin** — Pale lurkers, void tide hazards
- **The Abyss** — Void Heart altar, origin of all vessels
- **Dreamer locations** — Teacher's Archives, Watcher's Spire, Beast's Den

### Bosses (9 total)
| Boss | Location | Mechanics |
|------|----------|-----------|
| False Knight | Forgotten Crossroads | Two-phase slam/charge, rage mode, shockwaves |
| Gruz Mother | Crossroads Below | Flying, baby spawns, phase 2 rampage |
| Vengefly King | (Crossroads area) | Charge dives, minion summons |
| Soul Master | Soul Sanctum | Teleport, orb shots, ground slam, phase 2 |
| Mantis Lords | Mantis Village | 3-lord gauntlet, dash/slash/throw, bow on defeat |
| Uumuu | Teacher's Archives | Electric jellyfish, invuln during shock |
| Dung Defender | Beast's Den | Rolling charge, dung ball throws |
| Lurien Watcher | Watcher's Spire | Circle shot patterns, laser orbs |
| Hollow Knight + Radiance | Black Egg Temple | Final two-phase boss, dream ending |

### Player Abilities
- **Mothwing Cloak** — Horizontal dash, ghost trail
- **Mantis Claw** — Wall cling + wall jump
- **Monarch Wings** — Double jump (acquired in Greenpath)
- **Dream Nail** — Charge strike revealing NPC thoughts, grants Soul
- **Desolate Dive** — Aerial plunge + ground shockwave
- **Shade Cloak** — Invincible dash through enemies (Ancient Basin)
- **Vengeful Spirit / Shade Soul** — Horizontal fireball spell

### Charm System (11 charms)
Equip via `[I]` key. Notch-limited loadout with real effects:
- Gathering Swarm, Wayward Compass, Fragile Heart
- Quick Slash, Mark of Pride, Long Nail
- Spell Twister, Soul Catcher, Shaman Stone
- Steady Body, Stalwart Shell

### Other Systems
- **Dreamer System** — Collect 3 dreamer seals to unlock the Black Egg
- **Shop System** — Buy charms/items from Sly and maps from Iselda
- **Dream Nail dialogue** — Read thoughts of NPCs and dream-slain enemies
- **Rain System** — Procedural parallax rain in City of Tears
- **Spore Fog** — DoT hazard in Fungal Wastes
- **Void Tide** — Instant-kill in The Abyss
- **Toll Gates** — Geo-locked passages
- **Two Endings** — "Sealed" and "Dream No More"
- **Credits roll** — Full scrolling credits

### Technical
- **Engine**: Phaser 3.60.0 (CDN)
- **Graphics**: 100% procedural via Canvas 2D API — no external images
- **Audio**: Web Audio API procedural synth music + SFX
- **Save**: localStorage (auto-save every 30s + bench saves)
- **Resolution**: 480×270 @ 3× pixel scale (1440×810 display)
- **No build step** — open index.html directly

---

## File Structure

```
hollow-knight-complete/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── data/
    │   ├── constants.js / constants_p3.js
    │   ├── animationDefs.js / animationDefs_p3.js
    │   ├── mapData.js / mapData_p3.js
    │   └── dialogueData.js / dialogueData_p3.js
    ├── systems/
    │   ├── AnimationManager.js, InputHandler.js
    │   ├── AudioSystem.js (+ SaveSystem, CameraSystem, ParticleSystem)
    │   ├── AudioEngine.js (Web Audio procedural)
    │   ├── CharmSystem.js, DreamerSystem.js
    │   ├── RainSystem.js, ShopSystem.js
    ├── entities/
    │   ├── Entity.js, Knight.js, NPC.js, DreamNail.js
    │   ├── enemies/
    │   │   ├── Crawler.js, Spitter.js (+ FlyingScout)
    │   │   ├── Mosscreep.js (+ Vengefly, Aspid)
    │   │   └── PhaseIIIEnemies.js (10 enemy classes)
    │   └── bosses/
    │       ├── FalseKnight.js
    │       ├── GruzMother.js (+ VengeflyKing, GruzBaby)
    │       ├── SoulMaster.js, MantisLords.js
    │       └── HollowKnightBoss.js (+ Radiance)
    ├── ui/
    │   ├── HUD.js, DialogueBox.js (+ PauseMenu, MapScreen)
    │   └── InventoryScreen.js
    └── scenes/
        ├── BootScene.js, PreloadScene.js, PreloadScene_p3.js
        ├── MainMenuScene.js, GameScene.js
        ├── GameScene_p3.js (Phase III-V extensions)
        ├── TransitionScene.js, EndingScene.js (+ CreditsScene)
        └── main.js
```

---

## Credits

Fan project — all game design, characters, and lore belong to **Team Cherry**.  
Built as a technical demonstration of procedural web game development.
