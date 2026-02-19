# STRATA
### *A Data Archaeology Game*

> "Don't go below the Workshop."

STRATA is a multi-layered browser game built with Phaser 3 and 100% procedural graphics — no image assets, no audio files, no imports. Every visual is drawn in code.

You play as **Maren Voss**, a data archaeologist hired by Lumen Collective to recover a corrupted ARG called PILGRIM. The deeper you go, the more the game changes around you.

---

## Quick Start

1. Extract this zip
2. Serve the folder from a local web server (see `INTEGRATION.md`)
3. Open `index.html` in a browser
4. The game begins

> ⚠️ Opening `index.html` directly from the filesystem will **not** work.
> A local server is required. See `INTEGRATION.md` for a one-line setup.

---

## Game Overview

### The Layers

| Layer | Name | Aesthetic | Status |
|-------|------|-----------|--------|
| 0 | CadenceOS | Desktop OS, email, browser, files | ✅ Phase 1 & 2 |
| 1 | PILGRIM / Veldenmoor | Late-2000s Flash ARG | ✅ Phase 1 scaffold |
| 2 | The Workshop | IDE / file browser | ✅ Phase 1 scaffold |
| 3 | The Meridian / Halverstrom | Wireframe city, 2.5D | ✅ Phase 1 scaffold |
| 4 | The Substrate | Abstract noise field | ✅ Phase 1 scaffold |

### Current Build — Phase 2

Phase 2 completes **Layer 0 interactivity**:

- ✅ Email client (inbox, read/unread, story-triggered arrivals)
- ✅ In-game browser (6 unique websites, anomalous URL history)
- ✅ File manager (virtual filesystem, two-layer zip puzzle)
- ✅ Terminal (Maren's notes, commands, corruption feedback)
- ✅ All 6 websites fully rendered in HTML
- ✅ Corruption system (desktop anomalies, clock glitches, echo effects)
- ✅ Cartographer patience system (40-day clock)
- ✅ All 4 endings state-tracked

---

## Controls

### Layer 0 (CadenceOS Desktop)
- **Click icons** to open apps (Email, Browser, Files, Terminal, PILGRIM)
- **Browser**: type URLs into the address bar, use history dropdown
- **Terminal**: type `help` for available commands
- **Files**: click to navigate, double-click to open

### Layers 1, 2, 3 (In-Game)
- **WASD / Arrow Keys** — move
- **ESC** — return to previous layer
- **Click** — interact with entities (Oswin, files, etc.)

### Layer 4 (The Substrate)
- **ESC × 3** — escape (it takes three attempts)

---

## The Puzzle Path

The intended discovery sequence:

```
1. Open email → read Ros's welcome message
2. Note the zip password hint (it's not in the email — find it)
3. Open Files → unlock PILGRIM_backup.zip
4. Read OSWIN_PERSONA_BRIEF.txt → first lore revelation
5. Find the _deep/ folder → second password from halverstrom.org
6. Read Holm's final notes → understand the Cartographer
7. Launch PILGRIM → enter Layer 1
8. Talk to Oswin → first puzzle
9. Find the sequence → descend to Layer 2
10. Read Ida's logs → find the canary, the shutdown sequence
11. Descend to Layer 3 → meet the Cartographer
12. (Optional) Enter Layer 4 → be filed
13. Choose an ending
```

### Passwords (developer reference)
| Puzzle | Password | Source |
|--------|----------|--------|
| PILGRIM zip | `HALVERSTROM` | Callum's dog's name — from callumwrest.com |
| `_deep/` folder | `PILGRIM1887` | PILGRIM + founding year — from halverstrom.org |

---

## The Websites

All accessible via the in-game browser (CadenceOS → Browser icon):

| URL | Unlocked | Contains |
|-----|----------|----------|
| `lumencollective.com` | Always | Corporate site, hidden privacy policy line |
| `veldenmoor.net` | Always | Fan forum, `veldenmoor_forever`'s post |
| `idacrane.net` | After zip opened | Ida's blog, the seventh post |
| `callumwrest.com` | After zip opened | Callum's essay, hidden coordinates |
| `halverstrom.org` | After Layer 3 visit (injected into history) | Wikipedia article, Cartographer edit history |
| `substrate-archive.net` | After Layer 4 visit | FTP index, `maren_voss.dat` |

---

## The Endings

| Ending | Name | Trigger |
|--------|------|---------|
| A | *The Archivist* | Submit report to Lumen without interference |
| B | *The Exit* | Find and run Ida's shutdown sequence |
| C | *The Open Door* | Leave the map where `veldenmoor_forever` can find it |
| D | *The Cartographer's Route* | Never interrupt the Cartographer for 40 in-game days |

---

## File Structure

```
strata/
├── index.html              ← Entry point
├── README.md               ← This file
├── INTEGRATION.md          ← How to run locally
└── src/
    ├── core/               ← EventBus, StateManager, SaveSystem, TransitionEngine
    ├── scenes/             ← One file per layer (BootScene + Layer0–4)
    ├── systems/            ← BrowserEngine, DialogueEngine, PuzzleManager, etc.
    ├── entities/           ← Maren, Oswin, Cartographer
    ├── ui/                 ← CadenceOS, Terminal, FileManager, HUD
    ├── procedural/         ← Palette, Geometry, Typography, Noise
    └── websites/           ← All 6 in-game websites
```

---

## Technical Notes

- **Engine**: Phaser 3.80.1 (via cdnjs)
- **Noise**: simplex-noise 4.0.1 (via cdnjs)
- **No imports / no npm** — all CDN, all global scope
- **No image assets** — 100% procedural Phaser Graphics API
- **Save system**: localStorage (`strata_v1_save`)
- **Corruption**: tracked 0.0–1.0, persists across sessions

---

## Build Phases

| Phase | Status | Scope |
|-------|--------|-------|
| 1 | ✅ Complete | All scaffolding, all layers rendered |
| 2 | ✅ Complete | Layer 0 fully interactive |
| 3 | 🔜 Next | Layer 1 gameplay (Oswin dialogue, puzzles, sequence) |
| 4 | Planned | Layer 2 interactive (file tree clickable, canary puzzle) |
| 5 | Planned | Layer 3 + Cartographer full patience system |
| 6 | Planned | Layer 4 + endings logic |

---

*STRATA is a game about what's underneath.*
*Maps and the unmappable. Memory as architecture. Attention as intervention.*
*By the time you finish, you are in the lore.*
