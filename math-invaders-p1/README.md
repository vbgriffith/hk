# Math Invaders 🚀

> A retro Space Invaders-style math learning game built with **Phaser 3**.  
> Defend Earth by shooting the alien carrying the correct answer to each math problem!

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [How to Play](#how-to-play)
3. [Game Mechanics](#game-mechanics)
4. [Math System](#math-system)
5. [Scoring & Tracking](#scoring--tracking)
6. [Project Structure](#project-structure)
7. [Architecture Overview](#architecture-overview)
8. [Build Phases](#build-phases)
9. [Dependencies](#dependencies)
10. [Customization Guide](#customization-guide)
11. [Keyboard Reference](#keyboard-reference)

---

## Quick Start

No build step required. This is a pure browser game.

```bash
# Option 1: Open directly in browser (Chrome/Edge recommended)
open index.html

# Option 2: Serve locally (recommended for best compatibility)
npx serve .
# or
python3 -m http.server 8080
# then open http://localhost:8080
```

> **Note:** Google Fonts require an internet connection on first load.  
> Phaser 3 is loaded from jsDelivr CDN — internet required unless you cache it locally.

---

## How to Play

1. **A math problem** appears at the top of the screen: e.g., `7 + 4 = ?`
2. **Aliens descend** carrying numbers on their bodies — one of them has the **correct answer**.
3. **Move your ship** (← / →) and **shoot** (SPACE) the alien with the correct answer.
4. **Alternatively**, type your answer using the number keys and press ENTER — the ship auto-aims!
5. **Correct hit** → entire wave explodes, new problem appears, score goes up.
6. **Wrong hit** → that alien dies, score penalty, problem continues (find the correct one!).
7. **Dodge bombs** dropped by aliens or use the bunkers for cover.
8. **Survive** all levels or beat your high score!

---

## Game Mechanics

### Alien Formation
- Aliens move in a classic grid formation (3 rows × 4–6 columns, scaling with level)
- They speed up as their numbers decrease — last alien is extremely fast
- They drop bombs randomly — more bombs at higher levels

### The Answer Grid
- **Every alien in the wave carries a number** — exactly **one** alien has the correct answer
- Correct answer is always placed in the **bottom row** for fairness (hardest to shoot)
- Decoy answers are close in value to the correct answer — easier at low levels, trickier at high levels

### Barriers / Bunkers
- 4 destructible bunkers protect your ship
- Each bunker absorbs **5 hits** (from alien bombs OR your own bullets)
- Color shifts from green → orange → destroyed as health decreases

### Player Lives
- You start with **3 lives**
- A life is lost when an **alien bomb hits your ship**
- Brief invincibility period after being hit
- **Game Over** when lives reach 0 OR aliens reach the ground

---

## Math System

### Operations by Level

| Level | Operations Available |
|-------|----------------------|
| 1     | Addition only (+)    |
| 2–3   | Addition & Subtraction (+ −) |
| 4–5   | Addition, Subtraction, Multiplication (+ − ×) |
| 6+    | All four operations (+ − × ÷) |

### Number Ranges
- All numbers: **0 – 10**
- Addition: sum never exceeds 10
- Subtraction: result never goes below 0
- Multiplication: product may exceed 10 (e.g., 5 × 6 = 30) — this challenges players!
- Division: always results in a whole number; no remainders

### Difficulty Scaling
- Decoy answers get closer to the correct answer at higher levels
- Alien movement speed increases each level
- Number of columns may decrease (fewer aliens = fewer decoys = easier to spot the right one)
- Bomb frequency increases slightly

---

## Scoring & Tracking

### Points

| Event | Score Change |
|-------|-------------|
| Correct answer hit | +100 base |
| Streak bonus | +50 × streak count |
| Wrong answer hit | −15 |
| Bomb hit (life lost) | −25 |

### Streak System
- Each consecutive correct answer increases your streak
- Streak resets on wrong answer
- Streak multiplier shown in HUD

### Session Tracking (in-game)
- Current score
- Current level
- Lives remaining
- Current streak
- Last 5 answers (shown on Game Over screen)

### Persistent Tracking (localStorage)
- **High score** — survives browser restarts
- **Total games played**
- **Total correct / wrong answers**
- **Per-operation accuracy** (+ − × ÷ separately tracked)
- Accessible via **Stats screen** (press S on menu)

### Answer History
Every answer you give is recorded with:
- The question text
- The correct answer
- What you answered
- Whether it was correct
- Which operation it used
- Time since game start

---

## Project Structure

```
math-invaders/
│
├── index.html              # Entry point — loads all scripts
├── README.md               # This file
│
├── css/
│   └── style.css           # Retro arcade styling, scanlines, HUD
│
└── js/
    ├── config.js           # All game constants (tune here)
    ├── utils.js            # Math generation, answer grid logic
    ├── scoreTracker.js     # Score, stats, persistence, HUD updates
    ├── main.js             # Phaser 3 initialization
    │
    └── scenes/
        ├── BootScene.js    # Procedural texture generation
        ├── MenuScene.js    # Title screen with animated starfield
        ├── GameScene.js    # Core gameplay (aliens, player, math, combat)
        ├── GameOverScene.js # End screen with full session stats
        └── StatsScene.js   # All-time statistics viewer
```

---

## Architecture Overview

```
index.html
  │
  ├── css/style.css          ← Visual layer (scanlines, HUD, fonts)
  │
  └── js/                    ← Game logic layer
       │
       ├── config.js         ← Single source of truth for all constants
       │                        (speeds, colors, thresholds, scoring)
       │
       ├── utils.js          ← Pure functions (no side effects)
       │                        - generateProblem(level) → {question, answer, op}
       │                        - buildAnswerGrid(problem, rows, cols) → 2D array
       │                        - generateAnswers(correct, count, spread) → array
       │
       ├── scoreTracker.js   ← Singleton module (IIFE pattern)
       │                        - Session state management
       │                        - localStorage persistence
       │                        - DOM HUD updates
       │                        - Answer history recording
       │
       ├── main.js           ← Phaser.Game instantiation
       │                        - Scene registry
       │                        - Scale/render config
       │                        - Keyboard scroll prevention
       │
       └── scenes/
            ├── BootScene    ← Draws all sprites procedurally via Phaser Graphics
            │                   (no image files needed)
            │
            ├── MenuScene    ← Animated title, alien showcase, key hints
            │
            ├── GameScene    ← Main game loop:
            │                   • AlienGrid: buildAlienGrid(), moveAliens(),
            │                                dropBombs(), onAlienHit()
            │                   • Player: buildPlayer(), movePlayer(), shoot()
            │                   • Math: newProblem(), onCorrectAnswer(),
            │                           onWrongAnswer(), submitTypedAnswer()
            │                   • Barriers: buildBarriers(), checkBombBarrierCollision()
            │                   • Effects: explode(), updateParticles()
            │
            ├── GameOverScene ← Session stats display, answer history
            │
            └── StatsScene   ← All-time stats, per-operation accuracy bars,
                                weakness analysis, clear stats option
```

### Data Flow

```
User Input (keyboard)
       ↓
  GameScene.setupInput()
       ↓
  ┌─ SPACE ─────────────── shoot() ──→ checkBulletAlienCollisions()
  │                                              ↓
  │                                       onAlienHit(cell)
  │                                              ↓
  │                               ScoreTracker.recordAnswer()
  │                                              ↓
  │                               Utils.generateProblem() → new wave
  │
  └─ NUMBER KEYS ──── submitTypedAnswer() ──→ auto-aim & shoot
```

---

## Build Phases

### Phase 1 — Foundation
**Files:** `config.js`, `utils.js`, `main.js`, `BootScene.js`, `MenuScene.js`

Establishes the Phaser game shell, procedural asset generation, and math problem engine. You can run this phase with placeholder gameplay.

### Phase 2 — Core Gameplay
**Files:** `GameScene.js`, `scoreTracker.js`, `style.css`

Implements the full game loop: alien grid, player movement, shooting, collision detection, math validation, bomb system, barrier destruction, particle effects, and HUD updates.

### Phase 3 — Polish & Analytics
**Files:** `GameOverScene.js`, `StatsScene.js`

Adds the complete post-game analytics screens, all-time stat persistence, per-operation accuracy visualization, and the weakness analysis system.

### Future Phases (not yet implemented)
- **Phase 4:** Sound effects via Phaser's Web Audio (all procedural, no files)
- **Phase 5:** Multiplayer via WebSocket (competitive mode)
- **Phase 6:** Curriculum integration (problem sets from teacher-defined sequences)

---

## Dependencies

All loaded via CDN — no npm install required.

| Library | Version | Source | Purpose |
|---------|---------|--------|---------|
| Phaser 3 | 3.60.0 | jsDelivr | Game engine (rendering, physics, input, scenes) |
| Press Start 2P | latest | Google Fonts | Pixel art display font |
| Orbitron | latest | Google Fonts | HUD / numeric display font |

**CDN URLs:**
```
https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js
https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;700;900
```

No Cloudflare/cdnjs packages are used in this build beyond what jsDelivr provides. If you prefer cdnjs, replace the Phaser URL with:
```
https://cdnjs.cloudflare.com/ajax/libs/phaser/3.60.0/phaser.min.js
```

---

## Customization Guide

All game tuning is in **`js/config.js`**. Key values to tweak:

```javascript
// Make the game easier:
CONFIG.BOMB_CHANCE = 0.001;        // fewer bombs
CONFIG.ALIEN_MOVE_DELAY = 1800;    // slower aliens
CONFIG.DECOY_SPREAD = [12, 6, 3];  // decoys further from correct answer

// Make the game harder:
CONFIG.BOMB_CHANCE = 0.006;        // more bombs
CONFIG.ALIEN_SPEED_INC = 120;      // faster acceleration per level
CONFIG.SHOOT_COOLDOWN = 500;       // slower shooting

// Change number range:
CONFIG.MAX_NUMBER = 20;            // extend to 0-20

// Add more levels:
CONFIG.LEVEL_THRESHOLDS.push(10000, 15000);
CONFIG.LEVEL_OPS.push(['+', '-', '×', '÷']);
```

---

## Keyboard Reference

| Key | Action |
|-----|--------|
| ← / A | Move ship left |
| → / D | Move ship right |
| SPACE | Fire bullet |
| 0–9 | Type an answer digit |
| BACKSPACE | Delete last typed digit |
| ENTER | Submit typed answer (auto-aims) |
| ESC | Return to menu / pause |
| S | Open Stats screen (from menu) |
| C | Clear all stats (from Stats screen) |

---

## Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome 90+ | ✅ Fully supported |
| Firefox 88+ | ✅ Fully supported |
| Edge 90+ | ✅ Fully supported |
| Safari 14+ | ✅ Supported |
| Mobile browsers | ⚠️ Keyboard-only game; touchscreen not supported |

---

## License

This project is released for educational use. Phaser 3 is MIT licensed.  
Math Invaders game code is free to use, modify, and distribute for non-commercial purposes.

---

*Built with Phaser 3, love for retro games, and a genuine belief that math should be fun.*
