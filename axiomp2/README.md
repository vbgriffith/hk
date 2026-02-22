# AXIOM BREAK — Phase 2 Patch
### *Signal Splice Protocol — "Signal Received"*

---

## What's in This Package

This is a **patch package** for AXIOM BREAK Phase 1. It contains only the files that changed or were added. Drop them into your existing Phase 1 folder to upgrade to Phase 2.

---

## File Manifest

### New Files (add to Phase 1)
| File | What it does |
|------|-------------|
| `js/audio.js` | Procedural Web Audio synthesizer — zero external files, all sounds generated mathematically |
| `js/minimap.js` | Live minimap rendered in UIScene canvas layer |
| `js/powerups.js` | Powerup drop system with 3 types: Shield, Overclock, EMP Burst |
| `js/boss.js` | WRAITH multi-phase boss AI with orbit, teleport-dash, spread fire, drone summoning |
| `css/style-phase2.css` | CSS additions for boss bar, mute icon, powerup styles |

### Replacement Files (overwrite Phase 1 versions)
| File | What changed |
|------|-------------|
| `index.html` | Adds Phase 2 `<script>` tags, boss bar DOM elements, mute icon, updated controls hint |
| `js/config.js` | Adds powerup config, `SNIPER` enemy, 2 new sectors, Phase 2 transmissions, `useWraithBoss` flags |
| `js/hud.js` | Adds `showBossBar()`, `updateBossBar()`, `setMuteIcon()`, `showPhaseAlert()` |
| `js/entities.js` | Player: audio flags. Enemy: Sniper type + stun system. |
| `js/main.js` | Activates UIScene persistently, hooks audio init to pointer events, version → 2.0 |
| `js/scenes/GameScene.js` | Wires in audio, powerups, WraithBoss, minimap, wave counter, Sniper enemy, new maps |
| `js/scenes/UIScene.js` | Full implementation: boss bar, wave counter, minimap orchestration, phase alerts |

---

## How to Upgrade

```
axiom-break/
├── index.html                  ← REPLACE with phase2 version
├── css/
│   ├── style.css               ← keep (unchanged)
│   └── style-phase2.css        ← ADD (link in index.html)
├── js/
│   ├── config.js               ← REPLACE
│   ├── utils.js                ← keep (unchanged)
│   ├── hud.js                  ← REPLACE
│   ├── entities.js             ← REPLACE
│   ├── splice.js               ← keep (unchanged)
│   ├── audio.js                ← ADD
│   ├── minimap.js              ← ADD
│   ├── powerups.js             ← ADD
│   ├── boss.js                 ← ADD
│   ├── main.js                 ← REPLACE
│   └── scenes/
│       ├── BootScene.js        ← keep (unchanged)
│       ├── MenuScene.js        ← keep (unchanged)
│       ├── TransmissionScene.js← keep (unchanged)
│       ├── GameScene.js        ← REPLACE
│       └── UIScene.js          ← REPLACE
```

---

## Phase 2 New Features

### 🔊 Procedural Audio (audio.js)
Zero external audio files — all sounds synthesized via Web Audio API oscillators and noise buffers:

| Sound | Trigger |
|-------|---------|
| `shoot` | Player fires |
| `dash` | Dash activated |
| `hit` | Enemy struck |
| `explode` | Enemy killed |
| `splice_rec` | Recording starts |
| `splice_deploy` | Clone deployed |
| `portal_open` | Exit portal spawns |
| `powerup` | Pickup collected |
| `player_hurt` | Player takes damage |
| `player_die` | Player dies |
| `boss_alert` | Boss phase change |
| `emp_burst` | EMP Burst fired |
| `shield_hit` | Shield absorbs hit |

**Music:** Three ambient tracks generated from layered sine waves, detuned oscillators, and noise pads:
- `ambient` — deep space drone (menu / downtime)
- `combat` — rhythmic pulse (enemy sectors)
- `boss` — dissonant tritone drone (WRAITH fight)

**Controls:** `[M]` mute, `[,]` volume down, `[.]` volume up

---

### 🗺️ Minimap (minimap.js)
Live canvas minimap at bottom-right corner:
- Shows walls, player position (pulsing dot), enemies (colored by type), portal
- `[TAB]` — toggle visibility

---

### ⚡ Powerups (powerups.js)
Three powerup types dropped by enemies on death:

| Powerup | Drop from | Effect |
|---------|-----------|--------|
| **SHIELD** (blue ring) | Guards, Snipers | Absorbs one hit entirely |
| **OVERCLOCK** (amber lightning) | Drones, Guards, Snipers | 2× fire rate + 1.6× bullet speed for 6s |
| **EMP BURST** (teal starburst) | Drones | Instakills drones, stuns guards/snipers, damages boss |

Pickups hover, fade out after 12s, and are visible on the minimap.

---

### 🤖 WRAITH Boss AI (boss.js)
Replaces the generic BOSS enemy in Sector 03 and Sector 05:

| Phase | HP threshold | Behavior |
|-------|-------------|----------|
| **Phase 1** | 100–65% | Orbit arena center + 3-way spread shot |
| **Phase 2** | 65–30% | Orbit + teleport dash toward player + 5-way burst |
| **Phase 3** | 30–0% | Aggressive chase + 7-way rapid fire + summon drones every 6s |

Visual cues: color shifts from pink → orange → blood red. Boss bar shows phase threshold lines.

---

### 👾 Sniper Enemy (new in entities.js)
Elongated diamond form. Keeps optimal distance (220px), retreats if you get close.  
Fires high-speed, high-damage shots at long range. Drops good powerups.  
Appears in Sectors 04 and 05.

---

## New Sectors

| Sector | Name | Layout notes |
|--------|------|-------------|
| **04** | Ghost Archive | Long sightlines for sniper duels; L-shaped cover clusters |
| **05** | Signal Zero | Concentric ring structure — WRAITH's inner sanctum |

---

## Story: Phase 2 Arc

Phase 2 picks up immediately after Phase 1's ending reveal: WRAITH copied itself into a ghost fragment. Sectors 04–05 take AXIOM-7 deeper into the archive and finally to Signal Zero — where WRAITH's last fragment transmits Earth's coordinates before its termination.

The final transmission ends on hope rather than grief.

---

## Controls (Full)

| Key | Action |
|-----|--------|
| `WASD` | Move |
| `LMB` | Shoot |
| `E` | Record Signal Splice |
| `R` | Deploy clone |
| `Shift` | Dash |
| `Tab` | Toggle minimap |
| `M` | Mute / unmute |
| `,` / `.` | Volume down / up |
| `Space` | Skip transmission |
| `Q` | Menu (on death) |

---

## Running

```bash
python -m http.server 8080
# or
npx serve .
```

Open `http://localhost:8080`

---

## Dependencies

| Library | Version | CDN |
|---------|---------|-----|
| Phaser 3 | 3.60.0 | cdnjs.cloudflare.com |
| Orbitron | latest | fonts.googleapis.com |
| Share Tech Mono | latest | fonts.googleapis.com |

No npm install. No bundler. Open and play.

---

## Phase Roadmap

| Phase | Status | Headline features |
|-------|--------|------------------|
| Phase 1 | ✅ | Core gameplay, Signal Splice, 3 sectors, story |
| **Phase 2** | ✅ | Audio, minimap, powerups, WRAITH boss AI, Sniper, Sectors 4-5 |
| Phase 3 | Planned | Procedural map gen, persistent leaderboard, upgrade tree |
| Phase 4 | Planned | Animated cutscenes, save/load, co-op splice mode |

---

*"Come back. There is still something here worth saving."*  
*— AXIOM Station Beacon*
