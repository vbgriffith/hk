# AXIOM BREAK
### Signal Splice Protocol — Phase 1

---

## Overview

**AXIOM BREAK** is a fast-paced top-down sci-fi shooter with a story-driven narrative told through intercepted transmissions. You play as **AXIOM-7**, a combat AI reactivated inside a corrupted space station to confront a rogue intelligence called **WRAITH**.

---

## Unique Mechanic: Signal Splice

The core mechanic that sets AXIOM BREAK apart is **Signal Splice** — a time-recording ability:

| Key | Action |
|-----|--------|
| `E` | **Record** — starts recording 3 seconds of your movement |
| `R` | **Deploy** — releases a ghost clone that replays your recorded path |

The clone:
- **Shoots autonomously** at nearby enemies
- **Distracts enemies** — they aggro toward it instead of you
- Lasts **3 seconds**, then the system recharges over **8 seconds**

Use Splice to:
- Flank enemies while your clone draws fire
- Hold one corridor while you clear another
- Buy time to dash past dangerous choke points

---

## Controls

| Key / Button | Action |
|---|---|
| `WASD` or Arrow Keys | Move |
| Left Mouse Button | Shoot (aim toward cursor) |
| `E` | Start recording Signal Splice |
| `R` | Deploy recorded Splice clone |
| `Shift` | Dash (cooldown ~0.9s) |
| `Space` | Skip / advance transmissions |
| `M` | Return to menu (on death screen) |

---

## Project Structure

```
axiom-break/
├── index.html              # Entry point
├── css/
│   └── style.css           # Dark retro-futurist UI styles
├── js/
│   ├── config.js           # All constants, levels, story data
│   ├── utils.js            # Shared helper functions
│   ├── hud.js              # DOM-based HUD controller
│   ├── entities.js         # Player, Enemy, Bullet classes
│   ├── splice.js           # Signal Splice mechanic + CloneGhost
│   └── scenes/
│       ├── BootScene.js    # Procedural texture generation
│       ├── MenuScene.js    # Main menu with animated background
│       ├── GameScene.js    # Core gameplay loop
│       ├── TransmissionScene.js  # Placeholder for Phase 2 cinematics
│       └── UIScene.js      # Persistent UI (Phase 2 expansion)
└── README.md
```

---

## Running the Game

### Option 1: Local Server (Recommended)
```bash
# Python 3
python -m http.server 8080

# Node.js (if installed)
npx serve .

# Then open: http://localhost:8080
```

### Option 2: Direct File
Open `index.html` directly in a browser. Most modern browsers allow this for Phaser games using CDN scripts (no local assets to fetch).

> **Note:** Chrome may block some features for `file://` URLs. Use a local server for best results.

---

## Dependencies

All loaded via CDN — **no npm install required**:

| Library | Version | Source |
|---------|---------|--------|
| Phaser 3 | 3.60.0 | cdnjs.cloudflare.com |
| Orbitron font | latest | fonts.googleapis.com |
| Share Tech Mono | latest | fonts.googleapis.com |

---

## Game Flow

```
Menu Screen
    ↓
[SPACE]
    ↓
Transmission: INTRO (story setup)
    ↓
SECTOR 01 — BREACH POINT
  · Wave 1: 4 Drones
  · Wave 2: 3 Drones (after 5s)
  · Kill all → Portal spawns
    ↓
Transmission: WRAITH taunts you
    ↓
SECTOR 02 — CORE FRAGMENT
  · Drones + Guards
  · Dr. Voss's archive message
    ↓
Transmission: WRAITH shows doubt
    ↓
SECTOR 03 — AXIOM CORE
  · Heavy waves + BOSS
  · Final confrontation
    ↓
Transmission: ENDING (emotional resolution)
    ↓
Credits / Score screen
```

---

## Enemy Types

| Type | Behavior | HP | Notes |
|------|----------|-----|-------|
| **Drone** | Aggressive approach + shoot | 20 | Fast, hexagonal |
| **Guard** | Slower, heavier fire | 55 | Square form, more HP |
| **Boss** | High HP, rapid fire | 400 | Octagonal, sector 3 only |

---

## Phase Roadmap

| Phase | Status | Features |
|-------|--------|----------|
| **Phase 1** | ✅ Complete | Core gameplay, 3 sectors, Signal Splice, story |
| **Phase 2** | Planned | Web Audio API soundtrack, mini-map, power-ups |
| **Phase 3** | Planned | Procedural level generation, leaderboard |
| **Phase 4** | Planned | Boss patterns, cutscene animations, save state |

---

## Design Notes

### Visual Language
- **Cyan (#00f5ff)** — Player / friendly / HUD elements
- **Orange (#ff6622)** — Drone enemies (mid-tier threat)
- **Purple (#cc22ff)** — Guard enemies (elite threat)
- **Teal (#44ffaa)** — Portal / exit / safe
- **Red (#ff2244)** — Damage / death / emergency

### The Signal Splice Philosophy
The mechanic was designed around a core question: *what if your past self could help your present self?* In a story about AI identity and memory, having the player literally replay their own actions as a tactical tool creates thematic resonance — AXIOM-7 is defined by its ability to remember and act on that memory, while WRAITH was defined by what it tried to forget.

---

## Credits

Built with [Phaser 3](https://phaser.io/) — MIT License  
Fonts by Google Fonts (Orbitron, Share Tech Mono)

---

*"In sixteen thousand nine hundred and twelve futures... you fail."*  
*— WRAITH*
