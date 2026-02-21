# The Ashwood Inheritance
### A Mystery in Five Acts — Phase 3: Complete Game

> *"He did not die by his heart. Come to Ashwood."*

A Victorian noir mystery built entirely in the browser. No external assets. No build step. All visuals drawn procedurally via Phaser 3 + Canvas 2D. All audio synthesized via Web Audio API.

---

## Quick Start

```bash
npx serve .
# or
python3 -m http.server 8080
# then open http://localhost:8080
```

No Node.js, no npm, no build tools needed. Dependencies load from CDN.

---

## The Story

**Elias Ashwood** — patriarch, industrialist — died October 14th. Official cause: cardiac arrest. A letter sent to PI **Maren Cole** says otherwise.

The truth: Elias was **Tomas Vey**, a Czech emigrant who survived a 1972 fire, took a dead man's name, and built his empire on land stolen from the Calwell family through forged deeds. When he decided to confess publicly — invalidating the Ashwood name and Nathaniel's inheritance — his son **Nathaniel** obtained a digitalis compound through coerced Dr. Crane and administered it in the evening brandy.

**Dorothea** had known for eleven years. She watched the study light go out and said nothing. **Sylvie** is Declan Fairweather's daughter — Elias silenced Declan too. The Calwell family's land was stolen. That fact stands regardless of which ending is reached.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `E` | Examine (trigger nearest hotspot) |
| `I` | Toggle inventory |
| `B` | Toggle evidence board |
| `M` | Toggle map |
| `N` | Toggle case notes |
| `Esc` | Close all panels |
| `Ctrl+S` | Save game |
| `Space` | Skip typewriter / advance dialogue |

---

## Six Endings

| ID | Title | Condition |
|----|-------|-----------|
| `ending_justice` | The Weight of Evidence | Call police immediately |
| `ending_honor` | One More Day | Give Nathaniel 24 hours |
| `ending_family` | The House Decides | Family calls police together |
| `ending_understanding` | The Full Measure | Hear everything, then act |
| `ending_incomplete` | The Open File | Insufficient evidence — Nathaniel walks |
| `ending_coverup` | What the House Keeps | Accept Dorothea's bribe |

---

## Locations

| ID | Name | Act | Key Clues |
|----|------|-----|-----------|
| `manor_exterior` | Ashwood Manor — Exterior | 1 | tire_tracks, porch step key |
| `foyer` | The Foyer | 1 | portrait_anomaly, guest_registry; Act 4 confrontation |
| `drawing_room` | Drawing Room | 1 | drinks_cabinet, playbill_dorothea |
| `kitchen` | Kitchen | 1 | washed_decanter |
| `study` | Elias's Study | 1 | brandy_glass, crane_appointment, desk_hidden_compartment |
| `carriage_house` | Carriage House / Studio | 2 | sylvie_camera_photos, observation_journal, fairweather_research |
| `library_east` | East Library | 2 | teacup_chamomile, library_window_view |
| `nathaniel_room` | Nathaniel's Room | 2 | pharmacy_receipt, new_will_draft |
| `groundskeeper_shed` | Groundskeeper's Shed | 3 | safety_deposit_key, tomas_vey_photo |
| `dr_crane_office` | Dr. Crane's Office | 3 | torn_log_page, toxicology_results |
| `whitmore_bank` | Whitmore National Bank | 3 | stolen_deeds, jonas_letter_1972 |
| `declan_study` | Declan Fairweather's Study | 3 | fairweather_research (deepened) |

---

## Clues

| ID | Name | Weight | Pts |
|----|------|--------|-----|
| `brandy_glass` | The Brandy Glass (Trace) | critical | 3 |
| `pharmacy_receipt` | Pharmacy Receipt | critical | 3 |
| `toxicology_results` | Dr. Crane's Private Toxicology Report | critical | 3 |
| `sylvie_camera_photos` | Sylvie's Interval Camera Photos | critical | 3 |
| `desk_hidden_compartment` | Elias's Hidden Confession | revelatory | 2 |
| `jonas_letter_1972` | Jonas Merrill's Letter (1972) | revelatory | 2 |
| `washed_decanter` | The Washed Decanter | significant | 2 |
| `new_will_draft` | Draft of New Will | significant | 2 |
| `observation_journal` | Sylvie's Observation Journal | significant | 2 |
| `crane_appointment` | Appointment Calendar Entry | significant | 2 |
| `blackmail_letters` | Blackmail Correspondence | significant | 2 |
| `stolen_deeds` | Forged Land Deeds | significant | 2 |
| `forged_will` | A Forged Earlier Will | significant | 2 |
| `portrait_anomaly` | The Anomalous Portrait | atmospheric | 0 |
| `tire_tracks` | Tire Tracks (Driveway) | minor | 1 |
| `groundskeeper_shed_key` | Groundskeeper's Shed Key | key_item | 0 |
| `safety_deposit_key` | Safety Deposit Box Key | key_item | 0 |

Minimum 8 pts for a good ending. Maximum possible: 22 pts.

---

## Characters

| ID | Name | Role | Portrait |
|----|------|------|---------|
| `maren` | Maren Cole | Player / PI | ✓ |
| `hester` | Hester Drum | Housekeeper | ✓ |
| `dorothea` | Dorothea Ashwood | Wife / blackmailer | ✓ |
| `nathaniel` | Nathaniel Ashwood | Eldest son / killer | ✓ |
| `sylvie` | Sylvie Vance | Artist / witness | ✓ |
| `dr_crane` | Dr. Arthur Crane | Family physician | ✓ |
| `declan` | Declan Fairweather | Ruined partner | ✓ |
| `elias` | Elias Ashwood (Tomas Vey) | Victim | — |

---

## Debug Tools (localhost only)

```js
// State inspection
DEBUG.state()               // full summary object
DEBUG.allFlags()            // list all true flags
DEBUG.allLocations()        // list all location IDs
DEBUG.allClues()            // list all clue IDs
DEBUG.allEndings()          // list all ending IDs

// Navigation
DEBUG.goto('whitmore_bank')
DEBUG.goto('nathaniel_room')
DEBUG.goto('dr_crane_office')
DEBUG.goto('declan_study')

// Evidence
DEBUG.giveClue('toxicology_results')
DEBUG.giveClue('pharmacy_receipt')
DEBUG.giveClue('sylvie_camera_photos')
DEBUG.fullEvidence()        // all clues at once

// Flags
DEBUG.setFlag('crane_confronted')
DEBUG.setFlag('nathaniel_dismissed')
DEBUG.setFlag('sylvie_trust_gained')
DEBUG.setFlag('bribe_offered')

// Act shortcuts
DEBUG.skipToAct(3)
DEBUG.act3Ready()           // preloads clues + flags for Act 3
DEBUG.act4Ready()           // full evidence + flags, ready for confrontation

// Confrontations
DEBUG.confront('nathaniel') // climax
DEBUG.confront('dorothea')
DEBUG.confront('hester')
DEBUG.confront('dr_crane')

// Endings
DEBUG.triggerEnding('ending_justice')
DEBUG.triggerEnding('ending_honor')
DEBUG.triggerEnding('ending_family')
DEBUG.triggerEnding('ending_understanding')
DEBUG.triggerEnding('ending_incomplete')
DEBUG.triggerEnding('ending_coverup')
DEBUG.winGame()             // full evidence → ending_justice
```

---

## Full File Structure

```
phase3/
├── index.html                         256 lines
│   HTML shell. Contains: #game-container (Phaser canvas), #ui-overlay
│   (all UI panels as direct children), title screen, HUD (#hud-left,
│   #hud-right, #hud-clock), dialogue box (#dialogue-box with portrait
│   canvas + typewriter text + response list), inventory panel, evidence
│   board panel, map panel, menu overlay. Loads all 21 scripts in
│   dependency order.
│
├── assets/
│   └── data/
│       ├── story.js                   958 lines
│       │   const STORY = {
│       │     characters: {}   8 entries — bio, motive, alibi, secrets,
│       │                      cluesAgainst[], cluesFor[]
│       │     locations:  {}   12 entries — description, atmosphere, clues[],
│       │                      exits[], locked, unlockCondition, firstVisit,
│       │                      characters[], note
│       │     clues:      {}   17 entries — location, description, revealedBy,
│       │                      connectsTo[], weight
│       │     acts:       {}   5 entries — title, subtitle, summary, objectives[],
│       │                      keyEvents[], openingNarration[], playerChoice_N,
│       │                      endCondition
│       │     endings:    {}   6 entries — type, unlockCondition, summary,
│       │                      marenFinalThought[], epilogues{}, isHidden
│       │     flags:      {}   ~30 initial progression flags (all false)
│       │     systemNotes: {}  pacing, redHerrings[], endingDetermination logic,
│       │                      criticalCluesForConviction[], clueWeightings{}
│       │   }
│       │
│       ├── dialogue.js                1148 lines
│       │   const DIALOGUE = {
│       │     hester:    { hester_intro, hester_letter_response,
│       │                  hester_questions_start, hester_morning_routine,
│       │                  hester_brandy_detail, hester_alibi_question,
│       │                  hester_breaks, hester_closing }
│       │     dorothea:  { dorothea_intro, dorothea_elias_death,
│       │                  dorothea_alibi, dorothea_elias_past,
│       │                  dorothea_trust_deepens, dorothea_final_revelation }
│       │     nathaniel: { nathaniel_intro, nathaniel_dinner_alibi,
│       │                  nathaniel_financial_pressure, nathaniel_father_topic }
│       │     sylvie:    { sylvie_intro, sylvie_camera_question,
│       │                  sylvie_opens_up, sylvie_testimony,
│       │                  sylvie_gives_photos, sylvie_declan_mention }
│       │   }
│       │   Node format: { id, speaker, portrait, text[], responses[], condition,
│       │                  setsFlag, givesClue, endsConversation, isPhone }
│       │
│       └── dialogue_p3.js             709 lines
│           Object.assign(DIALOGUE, { ... }) extending with:
│           dr_crane:    { crane_intro, crane_last_visit, crane_private_matter,
│                          crane_torn_page, crane_confrontation,
│                          crane_prescription_confession, crane_opens_safe,
│                          crane_soft_approach }
│           declan:      { declan_intro, declan_tomas, declan_1995,
│                          declan_sylvie, declan_knows }
│           Merged into hester:
│                        { hester_alibi_confrontation, hester_chamomile,
│                          hester_window, hester_timeline, hester_alibi_soft }
│           Merged into dorothea:
│                        { dorothea_identity_confrontation,
│                          dorothea_admits_knowledge, dorothea_denial,
│                          dorothea_gives_key, dorothea_bribe_moment,
│                          dorothea_bribe_offer, dorothea_bribe_accepted,
│                          dorothea_bribe_refused, dorothea_pressure }
│           Merged into nathaniel:
│                        { nathaniel_confrontation_weak,
│                          nathaniel_confrontation_strong,
│                          nathaniel_receipt_revealed, nathaniel_camera_revealed,
│                          nathaniel_toxicology_revealed, nathaniel_breaks,
│                          nathaniel_confession_full }
│
├── css/
│   ├── main.css                       423 lines
│   │   :root custom properties:
│   │     --ink, --ink-soft, --ink-mid, --ink-raised
│   │     --parchment, --parchment-mid, --parchment-dim
│   │     --amber, --amber-light, --amber-dim
│   │     --blood, --blood-soft, --sage, --mist, --ghost
│   │     --font-display (IM Fell English)
│   │     --font-body (Libre Baskerville)
│   │     --font-mono (Special Elite)
│   │     --shadow-text, --transition-fast/med/slow
│   │   Sections: reset, typography, game canvas, HUD (act label, clock,
│   │   location banner, badges, interaction prompt), grain overlay (SVG
│   │   filter + ::before pseudo), vignette (radial-gradient ::after).
│   │
│   ├── ui.css                         372 lines
│   │   Sections: dialogue box (#dialogue-box, .dialogue-portrait,
│   │   .dialogue-text, .response-list, .response-btn), clue notification
│   │   toast (.clue-notify), inventory panel (#inventory-panel, .item-grid,
│   │   .item-card, .item-detail), map overlay (#map-panel, .map-room-label,
│   │   .map-room-label.current, .map-room-label.locked), act transition card
│   │   (.act-transition-card), ending screen (#ending-screen, .ending-card,
│   │   .ending-type-label, .ending-title, .ending-divider, .ending-narration,
│   │   .ending-epilogue, .epilogue-entry, .ending-replay), menu overlay
│   │   (#menu-overlay, .menu-btn).
│   │
│   └── evidenceboard.css              163 lines
│       Sections: panel container (#evidence-board-panel), cork board canvas
│       wrapper (.cork-board-canvas), clue sidebar (.evidence-sidebar),
│       clue list items (.evidence-item, .evidence-weight-badge),
│       case strength meter (.case-strength-bar, .case-strength-fill).
│
└── js/
    ├── main.js                        326 lines
    │   class SceneManager {
    │     initPhaser()              Phaser.Game config — registers all 14 scenes,
    │                               960×540, FIT scale, no physics
    │     goToLocation(id)          fadeOut → stop scene → start scene → fadeIn →
    │                               checkLocationEvents → audioManager.setScene
    │     getSceneKey(id)           maps 12 location IDs → Phaser scene keys
    │     handleLocked(result)      narrates lock message with context
    │     checkLocationEvents(id)   firstVisit narration from STORY.locations;
    │                               foyer + Act 4 → injectConfrontationHotspot();
    │                               drawing_room + Act 4 + conditions → bribe trigger
    │     onDialogueEnd()           checks act completion
    │     triggerHotspot()          forwards to active Phaser scene
    │     triggerEnding()           gameState.determineEnding() → uiManager.showEnding
    │   }
    │   const sceneManager = new SceneManager()
    │   IIFE entry (DOMContentLoaded):
    │     bindTitleScreen()         #btn-new-game, #btn-continue click handlers
    │     checkSaveExists()         disables Continue if no localStorage save
    │     animateTitleCard()        CSS opacity + translateY fade-in on #title-card
    │     startNewGame()            gameState.reset() → dismissTitle() →
    │                               actProgressionManager.start() →
    │                               opening narration → goto manor_exterior
    │     continueGame()            deserialize → restore → actProgressionManager.start()
    │     dismissTitle()            CSS opacity fade → display:none on #title-screen
    │   window.DEBUG (localhost only): 20+ utility methods
    │
    ├── scenes/
    │   ├── BaseScene.js               316 lines
    │   │   class BaseScene extends Phaser.Scene
    │   │   Shared by all 11 gameplay scenes.
    │   │   baseCreate()           returns {W, H}; sets this.hotspots = [],
    │   │                          this.exitZones = []; calls audioManager.setScene
    │   │   drawRect(g,x,y,w,h,fillColor,fillAlpha)
    │   │   drawGradientSky(g,w,h,topColor,bottomColor)
    │   │                          20-step fillRect gradient simulation
    │   │   createCandleFlicker(x,y,radius,baseAlpha)
    │   │                          Phaser Graphics circle; tweens alpha via sine
    │   │                          oscillation with slight random variance each cycle
    │   │   createCandleFlame(x,y)
    │   │                          3-point polygon flame; small sway animation loop
    │   │   createRain(density)    array of {x,y,speed,length} line objects;
    │   │                          updated each frame in scene update()
    │   │   createDustMotes(count) circles drifting with Math.sin(time) vertical bob
    │   │   addHotspot(x,y,w,h,config)
    │   │                          pushes to this.hotspots[]; config accepts:
    │   │                          id, label, clueId (auto-given on activate),
    │   │                          dialogue[] (narrated), onActivate(hotspot) callback,
    │   │                          requiresFlag condition string
    │   │   createHotspotIndicator(x,y)
    │   │                          amber pulsing circle at hotspot center
    │   │   activateHotspot(h)     sets h.examined=true, removes indicator,
    │   │                          calls dialogueEngine.giveClue if clueId,
    │   │                          narrates dialogue[] if present,
    │   │                          calls h.config.onActivate if present
    │   │   triggerHotspot()       finds nearest unexamined hotspot within 140px;
    │   │                          called by E key via sceneManager
    │   │   createWindowLight(x,y,w,h,angle)
    │   │                          low-alpha triangle beam suggesting window light
    │   │   addExitZone(exitId,label,x,y,w,h)
    │   │                          creates invisible interactive zone; click/E
    │   │                          calls sceneManager.goToLocation(exitId)
    │   │
    │   ├── BootScene.js               178 lines
    │   │   BootScene    → PreloadScene (immediate redirect)
    │   │   PreloadScene → TitleBgScene (no assets to load)
    │   │   TitleBgScene (extends BaseScene):
    │   │     Animated title backdrop. Procedural elements:
    │   │     - Night sky: deep blue-black gradient
    │   │     - Stars: 120 random circles with slight twinkle alpha
    │   │     - Manor silhouette: multi-rect with 4 chimney stacks
    │   │     - Lit windows: amber filled rects, random flicker intervals
    │   │     - Fog layers: 3 animated semi-transparent strips scrolling
    │   │     - Rain: BaseScene.createRain(30)
    │   │
    │   ├── ManorExteriorScene.js      234 lines
    │   │   Exterior grounds at night. Layers:
    │   │   - Sky: drawGradientSky dark blue/black
    │   │   - Stars: scattered points
    │   │   - Distant trees: silhouette rectangles with rounded tops
    │   │   - Ground: dark gradient
    │   │   - Iron gate posts: left and right pillars
    │   │   - Gravel driveway: lighter strip with edge lines
    │   │   - Tire tracks: parallel lines with gravel displacement marks
    │   │   - Carriage house: right side building silhouette
    │   │   - Manor: multi-part facade, 4 stories, east/west wings,
    │   │     lit windows (study brighter amber), dark Victorian trim
    │   │   - Rain: createRain(25)
    │   │   Hotspots: tire_tracks (gives tire_tracks clue),
    │   │             porch_step (gives groundskeeper_shed_key if
    │   │                         dorothea_gave_key flag set),
    │   │             manor_entrance
    │   │   Exits: foyer, carriage_house
    │   │
    │   ├── InteriorScenes.js          487 lines
    │   │   FoyerScene (extends BaseScene)
    │   │     Parquet floor (grid lines), wainscoting, dark walls, grand
    │   │     staircase (8 step offsets right side), half-lit chandelier with
    │   │     candle flicker glow, 4 portrait frames (figure silhouettes),
    │   │     dust motes. Flag study_accessed set on StudyScene create().
    │   │     Hotspots: portrait_anomaly (clue), foyer_table
    │   │     Exits: manor_exterior, drawing_room, study, kitchen
    │   │
    │   │   StudyScene (extends BaseScene)
    │   │     Fireplace (animated 3-flame), bookshelves (6 color groups × 5 rows),
    │   │     lever book (slightly protruding, gold highlight), large desk with
    │   │     brandy glass (subtle crystal gleam), appointment calendar, leather
    │   │     chair with stain (elliptical dark smear), moonlit window with
    │   │     triangular light beam, candle on desk, dust motes.
    │   │     Hotspots: brandy_glass (critical clue), appointment_calendar (significant),
    │   │               lever_book (reveals hidden compartment → confession_letter item
    │   │               + desk_hidden_compartment clue), stained_chair, study_window
    │   │     Exit: foyer
    │   │
    │   │   DrawingRoomScene (extends BaseScene)
    │   │     Geometric wallpaper pattern (grid lines), upright piano with
    │   │     keyboard (14 keys, black key pattern), sheet music on stand,
    │   │     drinks cabinet (4 decanters — 3 old, 1 newer glass), framed
    │   │     playbill, Dorothea figure on first visit.
    │   │     Triggers dorothea_intro on first visit.
    │   │     Hotspots: piano_music, drinks_cabinet, playbill_dorothea
    │   │     Exit: foyer
    │   │
    │   │   KitchenScene (extends BaseScene)
    │   │     Stone tile floor (large grid), service counter, sink with
    │   │     tap, drying rack with the washed decanter (gleam highlight),
    │   │     cabinet, Hester figure on first visit.
    │   │     Triggers hester_intro on first visit.
    │   │     Hotspots: washed_decanter (significant clue), kitchen_log
    │   │     Exit: foyer
    │   │
    │   │   CarriageHouseScene (extends BaseScene)
    │   │     Brick walls (horizontal lines), concrete floor, 5 abstract
    │   │     prints hanging at varied sizes, worktable with observation
    │   │     journal (ruled lines), camera on tripod (aimed at window),
    │   │     Fairweather research file on wall, space heater glow (candle
    │   │     flicker), Sylvie figure on first visit, dust motes.
    │   │     Triggers sylvie_intro on first visit.
    │   │     Hotspots: sylvie_camera (requires sylvie_trust_gained → sylvie_camera_photos),
    │   │               observation_journal (requires sylvie_trust_gained),
    │   │               fairweather_file (gives fairweather_research)
    │   │     Exit: manor_exterior
    │   │
    │   │   injectConfrontationHotspot(scene, W, H)
    │   │     Called by sceneManager when entering foyer in Act 4.
    │   │     Draws Nathaniel figure at staircase, adds hotspot triggering
    │   │     confrontationSystem.startConfrontation('nathaniel').
    │   │     Skips if nathaniel_confessed or path_chosen already set.
    │   │
    │   └── Act2and3Scenes.js          574 lines
    │       NathanielRoomScene (extends BaseScene)
    │         Dark walls, polished floor, military-precise bed, bedside table
    │         with locked drawer (brass handle detail), desk with financial
    │         papers + closed laptop + whisky glass, diploma on wall,
    │         city-facing window with curtains, Nathaniel figure if not dismissed.
    │         Hotspots: nightstand_drawer (requires nathaniel_dismissed flag;
    │                     gives pharmacy_receipt + new_will_draft items + clues),
    │                   nathaniel_papers (debt_correspondence clue if dismissed),
    │                   nathaniel_diploma
    │         Exit: foyer
    │
    │       LibraryEastScene (extends BaseScene)
    │         Floor-to-ceiling bookshelves (28 columns, 3 shelf breaks each),
    │         reading chair, side table with cold chamomile teacup + open book
    │         + slipped bookmark, window facing south (study visible as tiny
    │         amber square), rain on window. Dorothea alibi marker (subtle glow).
    │         Hotspots: library_window_view (gives clue), dorothea_reading_spot
    │                   (gives teacup_chamomile), library_books
    │         Exit: foyer
    │
    │       GroundskeeperShedScene (extends BaseScene)
    │         Textured dirt floor (random scratch lines), vertical wood plank
    │         walls, tool rack (4 hanging tools), shelf with 5 jar shapes,
    │         workbench, loose floorboard (slightly raised rectangle), high
    │         window with grey outside light, rain, dense dust motes.
    │         Hotspots: tin_box (loose floorboard → gives safety_deposit_key +
    │                     tomas_vey_photo item, sets shed_accessed),
    │                   workbench_tools
    │         Exit: manor_exterior
    │
    │       CraneOfficeScene (extends BaseScene)
    │         Grid tile floor, 3 diplomas on wall, patient chair, desk with
    │         prescription log (torn page visible as jagged edge), Monet
    │         reproduction (impressionist blobs) slightly crooked (safe hint),
    │         Dr. Crane figure if not yet confronted.
    │         Triggers crane_intro on first visit.
    │         Hotspots: prescription_log (gives torn_log_page clue),
    │                   office_safe (requires crane_confronted flag;
    │                                gives toxicology_results + sets
    │                                toxicology_obtained; plays stingerFX)
    │         Exits: whitmore_bank, manor_exterior
    │
    │       WhitmoreBankScene (extends BaseScene)
    │         Marble floor (large squares), institutional walls, teller counter,
    │         heavy vault door (spoke wheel handle, number plate "114"),
    │         safety deposit table with open box containing paper stacks.
    │         Hotspot: vault_114 (requires safety_deposit_key item;
    │                   gives stolen_deeds + jonas_letter_1972, sets
    │                   bank_visited + true_identity_known; plays stingerFX;
    │                   triggers two-stage narration with pause between)
    │         Exits: dr_crane_office, manor_exterior
    │
    │       DeclanStudyScene (extends BaseScene)
    │         8 columns of books (personal, fewer), well-used desk, photograph
    │         of two men dated 1988 (Elias/Declan), letter stack, untouched
    │         whisky, modest window with rain.
    │         Triggers declan_intro on first visit.
    │         Hotspot: declan_desk (gives fairweather_research clue)
    │         Exit: whitmore_bank
    │
    ├── systems/
    │   ├── gameState.js               328 lines
    │   │   class GameState (singleton: gameState)
    │   │   State properties: clues (Set), flags{}, seenDialogue (Set),
    │   │   currentAct, currentLocation, notes[], inventory (Set),
    │   │   evidenceWeight, conversationHistory{}, choices{}, timeElapsed
    │   │   reset()              initializes from STORY.flags
    │   │   addClue(id)          Set + evidenceWeight + found_X flag + addNote
    │   │   hasClue(id)          boolean
    │   │   getClueList()        mapped array of resolved STORY.clues objects
    │   │   setFlag(name,val)    direct flag write
    │   │   getFlag(name)        flag read with || false fallback
    │   │   markDialogueSeen(id) adds to seenDialogue Set
    │   │   hasSeenDialogue(id)  boolean
    │   │   getAvailableDialogue(charId)  unseen nodes with met conditions
    │   │   checkCondition(str)  recursive parser:
    │   │                        "NOT x" → !check(x)
    │   │                        "a AND b" → check(a) && check(b)
    │   │                        "a OR b"  → check(a) || check(b)
    │   │                        single: checks flags[x] || clues.has(x)
    │   │   addItem(id)          adds to inventory Set
    │   │   addNote(title, body) pushes to notes[]
    │   │   advanceAct()         currentAct++ (max 5)
    │   │   checkActCompletion() evaluates STORY.acts[n].completionConditions[]
    │   │   determineEnding()    priority: coverup > incomplete > understanding
    │   │                        > family > honor > justice
    │   │   moveTo(id)           checks locked + unlockCondition; returns
    │   │                        {success:bool, location: obj}
    │   │   getCurrentLocation() STORY.locations[currentLocation]
    │   │   serialize()          JSON: clues→array, seenDialogue→array,
    │   │                        inventory→array, flags, acts, location, weight
    │   │   deserialize(json)    reconstructs Sets from arrays; merges flags
    │   │   getSummary()         console-friendly status object
    │   │
    │   ├── audioManager.js            454 lines
    │   │   class AudioManager (singleton: audioManager)
    │   │   Web Audio API only. Zero external files.
    │   │   init()               creates AudioContext; sets initialized=true
    │   │   ensureInit()         calls init() if not already (gesture guard)
    │   │   startRain(intensity) white noise source → BiquadFilter (bandpass)
    │   │                        → StereoPannerNode → GainNode; crossfade on change
    │   │   stopRain(fade)       exponentialRampToValueAtTime → source.stop
    │   │   startInterior(scene) low OscillatorNode (40Hz) → LFO modulation
    │   │                        (0.08Hz rate) → GainNode; scene-specific base gain
    │   │   stopInterior(fade)   gain ramp → stop
    │   │   startFireplace()     repeating random-interval filtered noise bursts
    │   │                        simulating crackle; each burst: noise slice →
    │   │                        BiquadFilter → short GainNode envelope
    │   │   stopFireplace()      clearTimeout + gain fade
    │   │   startAmbientMusic(theme)  generateNote() scheduled loop;
    │   │                        pentatonic minor pitch array, random note selection,
    │   │                        OscillatorNode (sine) → ConvolverNode (reverb IR
    │   │                        built from noise decay) → GainNode;
    │   │                        next note scheduled at random interval 4–12s
    │   │   stopAmbientMusic()   clearTimeout + gain fade
    │   │   playClueFX()         brief sine sweep up (220→440Hz) with fast envelope
    │   │   playDoorFX()         low-frequency noise burst with filter sweep
    │   │   playTypeFX()         very short high-frequency tick (1800Hz, 30ms)
    │   │   playStingerFX()      multi-oscillator chord → reverb (revelation moment)
    │   │   setScene(locationId) adjusts rain/interior/fireplace layers per room:
    │   │                        exterior = heavy rain + no interior
    │   │                        study = fireplace + interior + light rain
    │   │                        whitmore = minimal interior + no rain
    │   │                        default = interior + light rain
    │   │   stopAll()            stops all layers (called before ending screen)
    │   │
    │   ├── portraitRenderer.js        572 lines
    │   │   class PortraitRenderer (singleton: portraitRenderer)
    │   │   Canvas 2D only. Portrait size: 140×180px.
    │   │   draw(canvas, characterId)  clears + calls per-character method
    │   │   Shared primitives:
    │   │     drawHead(ctx,cx,cy,rx,ry,skin,shadow)  ellipse + side shadow
    │   │     drawEye(ctx,x,y,w,h,iris,shine)        white → iris → pupil → shine dot
    │   │     drawHair(ctx,cx,headTop,r,color,hl,style)
    │   │                 styles: 'short', 'bun', 'loose', 'receding', 'disheveled'
    │   │     addNoise(ctx,w,h,alpha)  random pixel scatter for ink-wash texture
    │   │   Per-character (each with unique palette + emotional expression):
    │   │     drawMaren()     tired precision; slight under-eye shadow;
    │   │                     grey wool jacket; neutral expression with focus
    │   │     drawHester()    wire-rimmed glasses; severe bun; black uniform;
    │   │                     set jaw; guarded eyes
    │   │     drawDorothea()  dramatic liner; pearl earring suggestion; deep
    │   │                     collar; composed expression concealing calculation
    │   │     drawNathaniel() cold brow furrow; immaculate collar; expensive
    │   │                     cufflink hint; charm as surface tension
    │   │     drawSylvie()    paint-stained collar; loose hair; open expression;
    │   │                     watchful eyes; slight warmth
    │   │     drawCrane()     worry lines; reading glasses; clinical white coat;
    │   │                     eyes that have seen too much and stayed silent
    │   │     drawDeclan()    heavy under-eye circles; worn tweed; grey stubble;
    │   │                     the look of a man who has been carrying something too long
    │   │     drawGeneric()   silhouette fallback for unknown speakers
    │   │
    │   ├── confrontationSystem.js     268 lines
    │   │   class ConfrontationSystem (singleton: confrontationSystem)
    │   │   startConfrontation(charId)    dispatches to per-character method
    │   │   confrontHester()              picks alibi node based on evidence found
    │   │   confrontDorothea()            identity vs pressure node selection
    │   │   confrontCrane()               sets crane_confronted, picks dialogue
    │   │   confrontNathaniel(str,crit)   weak path if <6pts or no critical clues;
    │   │                                 strong path calls nathaniel_confrontation_strong
    │   │                                 with onNathanielBreaks() callback
    │   │   onNathanielBreaks()           sets nathaniel_confessed → showEndingChoice()
    │   │   showEndingChoice()            fadeOut → fullscreen overlay with:
    │   │                                 4 standard path buttons + bribe if offered;
    │   │                                 overlay closes on click → executeEnding(path)
    │   │   buildChoiceBtn(path,txt,sub)  HTML string for overlay button
    │   │   executeEnding(path)           sets path_chosen flag, narrates path-specific
    │   │                                 lines (8–10 lines each), then calls
    │   │                                 uiManager.showEnding(endingId) after 1.2s
    │   │
    │   └── actProgressionManager.js   199 lines
    │       class ActProgressionManager (singleton: actProgressionManager)
    │       Polls gameState every 2000ms.
    │       start() / stop()            setInterval on/off
    │       tick()                      detects act changes + runs checks
    │       onActChange(n)              dispatches to setupAct2–5
    │       setupAct2()                 nathaniel_arrived, library_east_accessible
    │       setupAct3()                 crane office + bank accessibility toasts
    │       setupAct4()                 confrontation_mode, declan_accessible,
    │                                   nathaniel_dismissed (room now searchable)
    │       checkPassiveUnlocks()       library on met_dorothea;
    │                                   upper floor on Act 2;
    │                                   crane_office on crane_appointment clue;
    │                                   bank on safety_deposit_key clue
    │       checkActAdvancement()       Act 1→2: manor clue + met_dorothea
    │                                   Act 2→3: new_will_draft + sylvie_trust_gained
    │                                   Act 3→4: toxicology_results + jonas_letter_1972
    │                                   Act 4→5: confessed / bribe / incomplete path
    │       advanceAct(n)               sets currentAct, triggers act transition card
    │       checkBribeEnding()          fires executeEnding('path_coverup') if set
    │       getActTime(n)               {hour, minute, date} for HUD clock per act
    │       syncHudClock()              updates HUD clock display + date label
    │
    └── ui/
        ├── dialogueEngine.js          376 lines
        │   class DialogueEngine (singleton: dialogueEngine)
        │   startConversation(charId, nodeId, _, onComplete)
        │                    finds charDialogue in DIALOGUE[charId]; finds entry node;
        │                    shows box; calls playNode(). Fallback: narrate "nothing new"
        │   findEntryNode()  checks _intro key first; then first unseen node
        │                    passing checkCondition(); returns null if exhausted
        │   playNode(node)   marks seen; applies setsFlag/givesClue; updates
        │                    speaker name + title; calls portraitRenderer.draw();
        │                    calls displayLines(node.text[])
        │   displayLines()   queues lines; calls typewriterLine() for each; shows
        │                    responses only after last line finishes
        │   typewriterLine(el,text,cb)
        │                    char-by-char with playTypeFX(); punctuation = 3× delay;
        │                    stores typeInterval for skip functionality
        │   skipTyping()     on first press: instant complete line;
        │                    on second press: advance to next line or show responses
        │   displayResponses(arr)
        │                    filters by r.condition via checkCondition();
        │                    stagger-animates in with 60ms per button offset
        │   selectResponse(r) applies r.setsFlag + r.givesClue; leadsTo next
        │                    node or endConversation()
        │   narrate(lines,cb) no-character mode; clears portrait; same typewriter flow
        │   giveClue(id)     gameState.addClue(id) + playClueFX() + showClueNotification()
        │   showClueNotification(clue)
        │                    brief toast: clue name + weight color badge (3s)
        │   showBox()        removes .hidden, adds .visible (CSS transition)
        │   hideBox()        removes .visible, adds .hidden after 400ms
        │   endConversation() isActive=false; fires onCompleteCallback;
        │                    notifies sceneManager.onDialogueEnd()
        │   speakerTitles{}  id → {name, title} for all 7 characters + narrator
        │
        ├── uiManager.js               312 lines
        │   class UIManager (singleton: uiManager)
        │   constructor()   caches DOM refs; calls bindEvents(); calls startClock()
        │   bindEvents()    E → triggerHotspot; I → inventory; B → evidence;
        │                   M → map; Esc → close all; Ctrl+S → saveGame
        │   updateAct(n)    #hud-act text + CSS act-color class (amber→red progression)
        │   startClock()    setInterval 12000ms per in-game minute; calls renderClock
        │   renderClock()   12h format → #hud-clock; advances timeElapsed in gameState
        │   showLocationBanner(id)
        │                   resolves STORY.locations[id].name; animates banner
        │                   in/out; 3.2s display; queues if banner already showing
        │   updateBadges()  #inventory-badge (item count), #evidence-badge (weight pts)
        │   showInteractionPrompt(label)
        │                   positions #interaction-prompt near cursor; fade in
        │   hideInteractionPrompt()
        │                   fade out + remove
        │   toast(msg,ms)   creates .toast div; appends to #toast-container;
        │                   slides in; auto-removes after ms
        │   fadeOut(ms)     CSS opacity 0 on #fade-overlay; returns Promise
        │   fadeIn(ms)      CSS opacity 1 on #fade-overlay; returns Promise
        │   showMenu()      #menu-overlay: display block + animate in
        │   hideMenu()      animate out + display none
        │   saveGame()      gameState.serialize() → localStorage 'ashwood_save_v2';
        │                   toast "Game saved."
        │   loadGame()      localStorage → gameState.deserialize(); returns bool
        │   showEnding(id)  stopAll audio; fadeOut(1200); builds ending DOM:
        │                   type label, title, divider rule, marenFinalThought
        │                   paragraphs, epilogue entries, Begin Again button;
        │                   appends to body; fadeIn(1500);
        │                   startAmbientMusic('melancholy')
        │   showActTransition(n)
        │                   fadeOut(600); centered act card with act number +
        │                   title + subtitle; 2.2s display; fadeIn(600)
        │
        ├── evidenceBoardUI.js         252 lines
        │   class EvidenceBoardUI (singleton: evidenceBoardUI)
        │   Cork board canvas panel. Toggles with B key.
        │   buildBoard()    groups clues by weight: critical (center) →
        │                   revelatory → significant → minor/atmospheric;
        │                   arranges in concentric zones; calls drawNodes,
        │                   drawConnections, drawCaseStrengthMeter
        │   drawNodes()     per clue: rounded-rect card with weight color
        │                   coding (red/purple/amber/grey); clue name text;
        │                   examined status indicator
        │   drawConnections() iterates clue.connectsTo[]; draws red lines
        │                   between connected node positions; uses STORY.clues
        │                   connection data
        │   drawCaseStrengthMeter()
        │                   horizontal progress bar: evidenceWeight / 22 max;
        │                   color shifts amber → red as evidence accumulates
        │   renderSidebar() scrollable list of collected clues with weight badge
        │                   + description text
        │   onCanvasDrag()  mousedown/mousemove pan offset
        │
        ├── inventoryUI.js             164 lines
        │   class InventoryUI (singleton: inventoryUI)
        │   Physical items panel. Toggles with I key.
        │   Items: pharmacy_receipt, shed_key, safety_deposit_key,
        │          confession_letter, new_will_draft, tomas_vey_photo,
        │          toxicology_report
        │   render()        grid of .item-card elements from gameState.inventory Set
        │   showDetail(id)  expands detail panel with name + flavor description
        │   itemData{}      maps item IDs → {name, description} for display
        │
        ├── mapUI.js                   241 lines
        │   class MapUI (singleton: mapUI)
        │   Blueprint-style interactive map. Toggles with M key.
        │   Rooms array: 13 entries with {id, label, x, y, accessible, lockedFlag}
        │                lockedFlag supports OR via gameState.checkCondition()
        │   drawMap()      blueprint grid (0.5px lines), manor building footprint
        │                  (main body + east/west wings), carriage house, shed,
        │                  driveway paths, Whitmore inset area lower-right;
        │                  all via canvas fillRect + strokeRect
        │   renderRoomLabels()
        │                  DOM labels positioned over canvas; current = amber ring;
        │                  locked = dimmed + cursor:not-allowed; uses checkCondition
        │   onRoomClick(id) → sceneManager.goToLocation(id)
        │   highlightCurrent()
        │                  amber semi-transparent circle on active room position
        │
        └── caseNotesUI.js             210 lines
            class CaseNotesUI (singleton: caseNotesUI)
            Maren's running case notebook. Left-side slide-in panel. N key toggle.
            createPanel()   builds #case-notes-panel DOM; adds Notes button to #hud-right
            bindHotkey()    N keydown → toggle()
            generateEntries()
                            reads gameState flags + clues in narrative order;
                            returns typed entry array. Entry types:
                              act         — act name header (amber, uppercase)
                              critical    — red ⚠ finding (e.g. pharmacy receipt found)
                              revelation  — purple ✦ (identity revealed, confession)
                              deduction   — amber italic (logical inference)
                              observation — grey italic (atmospheric detail)
                              todo        — grey □ (still-missing evidence)
            render()        maps entries → styled divs with 40ms stagger
                            opacity + translateY animation per entry
```

---

## Architecture Notes

**Script load order matters.** `story.js` and `dialogue.js` must precede all systems. `dialogue_p3.js` must follow `dialogue.js`. All systems precede UI. All UI precedes scenes. `main.js` last.

**No module system.** Everything uses global scope. Each system and UI class instantiates itself as a singleton constant immediately after the class definition.

**Canvas dimensions:** 960×540, `Phaser.Scale.FIT` + `CENTER_BOTH`.

**Save format:** `localStorage` key `ashwood_save_v2`. JSON with clues[], flags{}, seenDialogue[], inventory[], currentAct, currentLocation, evidenceWeight, savedAt.

**No external assets.** Zero PNG/JPG/MP3/OGG files. All Phaser graphics via `GameObjects.Graphics` (procedural shapes). All portraits via Canvas 2D `drawImage`-free drawing. All audio via `AudioContext` synthesis.

**Condition syntax** (used in dialogue nodes, location locks, mapUI):
- Single flag: `"met_nathaniel"`
- Single clue: `"pharmacy_receipt"` (checked via `clues.has()`)
- Negation: `"NOT shed_accessed"`
- AND: `"toxicology_results AND pharmacy_receipt"`
- OR: `"dorothea_gave_key OR shed_accessed"`

---

## Project Stats

| | |
|---|---|
| Total source files | 25 |
| Total lines of code | ~9,520 |
| Phaser scenes registered | 14 |
| Playable locations | 12 |
| Collectible clues | 17 |
| Physical inventory items | 7 |
| Dialogue nodes | 104 |
| Characters with drawn portraits | 7 |
| Endings | 6 |
| Acts | 5 |
| External CDN dependencies | 3 |
| External asset files | 0 |
