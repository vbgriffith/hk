# STRATA — Integration Guide

How to get STRATA running locally, and how to extend it.

---

## Running Locally

STRATA loads JavaScript files from multiple subdirectories. Browsers
block this when opening `index.html` directly from the filesystem
(CORS restriction on `file://` protocol). You need a local web server.

Pick whichever option matches what you already have installed.

---

### Option A — Python (recommended, no install needed on Mac/Linux)

```bash
# Navigate to the strata/ folder
cd path/to/strata

# Python 3 (comes pre-installed on Mac and most Linux)
python -m http.server 8000

# Python 2 (older systems)
python -m SimpleHTTPServer 8000
```

Then open: **http://localhost:8000**

To stop: press `Ctrl+C` in the terminal.

---

### Option B — VS Code Live Server (easiest GUI option)

1. Install the **Live Server** extension by Ritwick Dey
   (Extensions panel → search "Live Server")
2. Right-click `index.html` in the VS Code file explorer
3. Select **"Open with Live Server"**

The game opens automatically in your browser.
Live Server also auto-reloads when you edit files — ideal for development.

---

### Option C — Node.js

```bash
# If you have Node installed
cd path/to/strata
npx serve .
```

Follow the URL it prints (usually http://localhost:3000).

---

### Option D — PHP (common on web hosting environments)

```bash
cd path/to/strata
php -S localhost:8000
```

---

### Option E — Chrome Extension

Search the Chrome Web Store for **"Web Server for Chrome"**.
Point it at the `strata/` folder and click the link it generates.
No terminal required.

---

## Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome / Chromium | ✅ Recommended |
| Firefox | ✅ Supported |
| Edge | ✅ Supported |
| Safari | ⚠️ May have WebGL quirks |
| IE / Legacy Edge | ❌ Not supported |

Minimum recommended resolution: **1280×720**.
The game scales down on smaller screens via Phaser's FIT mode.

---

## CDN Dependencies

STRATA loads two libraries from CDN at startup.
An internet connection is required on first load.
After that, browsers cache the scripts.

```html
<!-- Phaser 3 game engine -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.80.1/phaser.min.js"></script>

<!-- Simplex noise (Layer 4 substrate effects) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/simplex-noise/4.0.1/simplex-noise.min.js"></script>
```

If you need to run fully offline, download these two files and update
the `src` attributes in `index.html` to point to local copies.

---

## Save Data

STRATA saves game state to `localStorage` under the key `strata_v1_save`.

To reset progress:
```javascript
// In browser console:
localStorage.removeItem('strata_v1_save');
localStorage.removeItem('strata_v1_meta');
location.reload();
```

Or from the in-game terminal:
```
reset-save
```

---

## Development — Adding Content

### Adding a New Website

1. Create a new file in `src/websites/` (e.g., `MyNewSite.js`)
2. Define an object with a `render(state)` method that returns an HTML string:

```javascript
const MyNewSite = {
  url: 'mysite.example',

  render(state) {
    return `<style>body { font-family: monospace; }</style>
      <div>Hello from ${state.currentLayer === 0 ? 'Layer 0' : 'elsewhere'}</div>`;
  },

  postRender(div) {
    // Optional: runs after innerHTML is set
    // Use for event listeners, StateManager flags, Maren notes
  }
};
```

3. Add the script tag to `index.html` (before `main.js`):
```html
<script src="src/websites/MyNewSite.js"></script>
```

4. Register the URL in `BrowserEngine`'s `URL_REGISTRY` inside `BrowserEngine.js`:
```javascript
'mysite.example': { site: 'MyNewSite', requiresFlag: 'some_flag' },
```

5. Register the renderer in `Layer0Scene.js`'s `create()`:
```javascript
BrowserEngine.registerSite('mysite.example', MyNewSite);
```

---

### Adding a New Email

Emails are defined in the `EMAILS` array inside `src/ui/CadenceOS.js`.

```javascript
{
  id: 'my_email_id',
  from: 'sender@lumencollective.com',
  subject: 'Subject line',
  date: null,             // Set at runtime
  body: `Email body text here.`,
  read: false,
  triggerFlag: 'some_state_flag',  // Email sends when this flag is set
  anomalous: false,       // true = dark styling, triggers Maren note
},
```

Emails send automatically when their `triggerFlag` is set via
`StateManager.flag('some_state_flag')`.

---

### Adding a New Puzzle

Puzzles live in `src/systems/PuzzleManager.js` in the `PUZZLES` object:

```javascript
'my_puzzle_id': {
  layer: 1,                        // Which layer this belongs to
  hint: 'A clue for the player',   // null = no hint
  solution: 'ANSWER',              // String (auto-uppercased on check)
  solved: false,
  attempts: 0,
},
```

To check/attempt a solution:
```javascript
const result = PuzzleManager.attempt('my_puzzle_id', playerInput);
if (result.success) { /* puzzle solved */ }
```

To check if already solved:
```javascript
PuzzleManager.isSolved('my_puzzle_id')
```

Solving a puzzle automatically emits `puzzle:solved` on the EventBus
and can trigger `StateManager.flag()` calls defined in `PuzzleManager.onSolve()`.

---

### Adding a New Maren Note

Maren's observations are the game's narrative voice. Add them anywhere:

```javascript
StateManager.addMarenNote(
  `This is a note Maren writes in her terminal. ` +
  `Keep her voice: dry, precise, observant. She notices small things.`
);
```

Notes appear in the Terminal (`notes` command) and — after Layer 2 is
visited — begin appearing as found documents in The Workshop.

---

### Adding a Corruption Effect

New corruption threshold effects go in `src/systems/CorruptionTracker.js`
in the `GLITCH_EFFECTS` array:

```javascript
{ threshold: 0.55, id: 'my_effect', fired: false },
```

And the trigger logic in `triggerGlitch()`:

```javascript
case 'my_effect':
  EventBus.emit('my:custom_event', { data: 'whatever' });
  break;
```

---

### Triggering a Layer Transition

From any scene or system:
```javascript
EventBus.emit('layer:transition_start', { to: 2 });
// or
EventBus.emit('layer1:open'); // specifically opens PILGRIM
```

From a Phaser scene directly:
```javascript
this.scene.start('Layer2Scene');
```

---

### The EventBus — Key Events

| Event | Payload | Description |
|-------|---------|-------------|
| `layer:transition_start` | `{ to: number }` | Request layer change |
| `layer:enter` | `{ depth, from }` | Fired when a layer is entered |
| `layer:exit` | `{ depth }` | Fired when leaving a layer |
| `corruption:changed` | `{ value }` | Corruption level updated |
| `desktop:anomaly` | `{ id }` | Anomaly file spawned on desktop |
| `puzzle:solved` | `{ id }` | A puzzle was solved |
| `puzzle:canary_seen` | — | Player opened canary.as in Workshop |
| `email:received` | `email` | New email arrived |
| `browser:navigated` | `{ url }` | Browser navigated to a URL |
| `state:flag` | `{ name, value }` | A StateManager flag was set |
| `terminal:note` | `{ note }` | Maren wrote a note |
| `workshop:note_leaked` | `{ note }` | Maren's note appeared in Workshop |

---

### StateManager — Key State Keys

```javascript
StateManager.get('currentLayer')        // 0-4
StateManager.get('deepestLayer')        // highest layer reached
StateManager.get('corruption')          // 0.0-1.0
StateManager.get('cartographerDays')    // 0-40+
StateManager.get('marenNotes')          // array of { text, timestamp }
StateManager.get('browserHistory')      // array of { url, timestamp, anomalous? }
StateManager.get('emailsReceived')      // array of email objects
StateManager.get('discoveredSites')     // array of URL strings
StateManager.hasFlag('flag_name')       // boolean
StateManager.flag('flag_name')          // set a flag to true
```

---

## File Load Order

Scripts must load in this order (already correct in `index.html`):

```
1. Phaser (CDN)
2. simplex-noise (CDN)
3. core/      EventBus → StateManager → SaveSystem → TransitionEngine
4. procedural/ Palette → Geometry → Typography → Noise
5. systems/   BrowserEngine → ForumRenderer → DialogueEngine → PuzzleManager → CorruptionTracker
              ↑ must come before websites, which call BrowserEngine.registerSite() at load time
6. ui/        Terminal → CadenceOS → FileManager → HUD
7. websites/  LumenCollective → Veldenmoor → all_sites
              ↑ all_sites.js self-registers IdaCrane, Halverstrom, SubstrateArchive, CallumWrest
8. entities/  Maren → Oswin → Cartographer
9. scenes/    Boot → Layer0 → Layer1 → Layer2 → Layer3 → Layer4
10. main.js   Phaser game config — must be last
```

### Website Files

| File | Contains | Self-registers? |
|------|----------|-----------------|
| `LumenCollective.js` | lumencollective.com | No — Layer0Scene registers it |
| `Veldenmoor.js` | veldenmoor.net + forum | No — Layer0Scene registers it |
| `all_sites.js` | idacrane.net, halverstrom.org, substrate-archive.net, callumwrest.com | Yes — calls `BrowserEngine.registerSite()` at load |

---

## Known Limitations (Current Build)

- Layer 2 (Workshop): file tree is decorative — Phase 4 will make it fully interactive
- Layer 3 (Halverstrom): Cartographer walks but 40-day patience ending not fully scripted
- Layer 4 (Substrate): ESC escape works but fragments are read-only; endings not wired
- No audio — intentional; Phase 5 will add procedural Web Audio API ambience
- Mobile: touch controls not yet implemented

---

*Questions? Add them as Maren would: precisely, and with a note of dry concern.*
