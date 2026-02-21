# The Ashwood Inheritance — Phase 2

## What's New in Phase 2

### Visual Scenes (Phaser 3 — Procedural)
All locations drawn programmatically — no external image files needed.
- **Manor Exterior** — Animated rain, lit windows with candle flicker, silhouette depth layers
- **Foyer** — Chandelier glow, portrait wall, parquet floor, staircase
- **Study** — Fireplace with animated flame, the brandy glass, the lever bookcase
- **Drawing Room** — Piano with sheet music, drinks cabinet, Dorothea's playbill
- **Kitchen** — The washed decanter on the drying rack (key evidence)
- **Carriage House** — Sylvie's studio, interval camera, observation journal
- **Title Screen** — Fully animated manor silhouette with flickering windows

### Character Portraits (Canvas 2D — Procedural)
All 7 characters hand-drawn in code — noir illustration style:
Maren, Hester, Dorothea, Nathaniel, Sylvie, Dr. Crane, Declan

### Systems
- **Ambient Audio** — Web Audio API synthesized: rain, fireplace crackle, low hum, piano notes
- **Evidence Board** — Cork board with clue nodes, red-string connections, case strength meter  
- **Inventory** — Physical item collection with detail panel
- **Navigation Map** — Illustrated estate map, clickable rooms, locked room indicators
- **Typewriter Dialogue** — Variable-speed text with punctuation pauses, audio key clicks
- **Hotspot System** — Clickable scene objects with examine prompts

## Run
```
npx serve .
# or
python3 -m http.server 8080
```
Then open `http://localhost:8080`

## Debug Console (localhost only)
```js
DEBUG.goto('study')          // teleport to location
DEBUG.talk('dorothea')       // start conversation
DEBUG.giveClue('pharmacy_receipt')
DEBUG.fullEvidence()         // all clues at once
DEBUG.winGame()              // trigger good ending
DEBUG.allLocations()         // list location IDs
```

## File Structure
```
index.html
css/
  main.css          — Victorian noir theme, typography, HUD
  ui.css            — Dialogue, panels, inventory, map, endings
  evidenceboard.css — Evidence board / cork board styles
assets/data/
  story.js          — All narrative data (Phase 1)
  dialogue.js       — All dialogue trees (Phase 1)
js/systems/
  gameState.js      — State management, save/load
  audioManager.js   — Web Audio API synthesis
  portraitRenderer.js — Canvas portrait drawing
js/ui/
  dialogueEngine.js — Typewriter + portrait + response flow
  uiManager.js      — HUD, toasts, transitions, menus, endings
  inventoryUI.js    — Physical item inventory
  evidenceBoardUI.js — Cork board with clue connections
  mapUI.js          — Interactive location map
js/scenes/
  BaseScene.js      — Shared scene functionality, hotspots, particles
  BootScene.js      — Boot + Preload + TitleBg scenes
  ManorExteriorScene.js — Exterior grounds
  InteriorScenes.js — Foyer, Study, Drawing Room, Kitchen, Carriage House
js/main.js          — Scene manager + entry point + debug tools
```
