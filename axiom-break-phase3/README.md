# AXIOM BREAK — Phase 3 Patch
**Signal Received: Upgrade Tree · Procedural Maps · Leaderboard · Phantoms**

---

## Integration

Drop into your existing Phase 2 folder (which already contains Phase 1 files).  
Match the file list below — REPLACE overwrites, ADD is a new file.

```
axiom-break/
├── index.html                          ← REPLACE
├── css/
│   ├── style.css                       ← KEEP (Phase 1)
│   ├── style-phase2.css                ← KEEP (Phase 2)
│   └── style-phase3.css                ← ADD
├── js/
│   ├── config.js                       ← REPLACE
│   ├── utils.js                        ← KEEP
│   ├── hud.js                          ← REPLACE
│   ├── entities.js                     ← REPLACE
│   ├── splice.js                       ← KEEP
│   ├── audio.js                        ← KEEP (Phase 2)
│   ├── minimap.js                      ← KEEP (Phase 2)
│   ├── powerups.js                     ← REPLACE
│   ├── boss.js                         ← KEEP (Phase 2)
│   ├── progression.js                  ← ADD
│   ├── procedural.js                   ← ADD
│   ├── leaderboard.js                  ← ADD
│   └── scenes/
│       ├── BootScene.js                ← KEEP
│       ├── MenuScene.js                ← REPLACE
│       ├── TransmissionScene.js        ← REMOVE (no longer used)
│       ├── GameScene.js                ← REPLACE
│       ├── UIScene.js                  ← KEEP (Phase 2)
│       ├── UpgradeScene.js             ← ADD
│       └── LeaderboardScene.js         ← ADD
│   └── main.js                         ← REPLACE
```

> **Note:** `TransmissionScene.js` is superseded — transmissions are handled in `HUD.showTransmission()`. The file can be deleted or left in place; it is no longer registered in `main.js`.

---

## Phase 3 Features

### 🌳 Upgrade Tree
Between every sector you enter the **Upgrade Screen** — pick one of 3 random upgrades (or skip). All 6 upgrades per run, choose wisely:

| Tree | Upgrade | Effect |
|------|---------|--------|
| FIREPOWER | OVERDRIVE | +35% bullet speed, +20% damage |
| FIREPOWER | RICOCHET | Bullets bounce once off walls |
| MOBILITY | AFTERBURNER | Dash cooldown -40%, +1 dash charge |
| MOBILITY | GHOST STEP | 600ms i-frames after every dash |
| SPLICE | ECHO CLONE | Deploy 2 simultaneous clones |
| SPLICE | RESONANCE | Clone lifespan +2s, cooldown -2s |

Upgrades persist per-run in `localStorage`. New run = fresh slate.

### 🗺️ Procedural Maps (Sectors 6–8)
Sectors 01–05 use hand-crafted layouts (Phase 1 + Phase 2).  
Sectors 06, 07, and 08 use **procedurally generated** maps:
- Cellular automata + flood-fill largest region
- Guaranteed corner rooms for spawn variety
- Unique layout every run (seed-based, reproducible)
- Map preview shown in Upgrade Screen before entering sector

### 🏆 Leaderboard
- **Top 10** scores stored in `localStorage`
- Auto-prompted when you achieve a high score at run end
- 3-character initials entry (type or use arrow keys)
- Accessible from main menu with **[L]**
- Seeded with example entries on first run

### 👻 Phantom Enemy (Sectors 6–8)
New stealth enemy class — alternates between visible and phased states:
- **Phased**: fully immune to damage, moves 60% faster
- **Unphased**: visible, vulnerable, fires rapidly
- EMP Burst forces immediate unphase + stun
- Drops REGEN or SHIELD on death

### 💊 REGEN Powerup
New fourth powerup type dropped by Phantoms:
- Instantly restores **25 HP**
- Green cross icon, distinct from other types

### 📊 Score Multiplier
Kill streak system — consecutive kills without taking damage multiply your score:
- `×1.0` base
- +10% per kill, up to ×1.5 cap
- Resets on hit or 3s without a kill
- **No-Hit Bonus**: +2500 if you clear a sector without taking damage

---

## New Controls
All existing controls unchanged. Phase 3 adds:

| Key | Action |
|-----|--------|
| `[L]` | View leaderboard (from menu or death screen) |
| `[SPACE]` | Proceed through upgrade screen |
| `[1][2][3]` | Select upgrade card by number |

---

## Story Arc — Phase 3: Signal Received
The beacon sent at the end of Phase 2 reaches Earth. A rescue ship responds.  
But something older is moving in the deep sectors — something that predates WRAITH, the crew, even the station. Phantoms. Indigenous.

Transmissions:
- `tx_p3_before6` — Earth relay makes contact. Rescue vessel en route. 14 days.
- `tx_p3_after6` — Phantom signal signatures predate WRAITH. What was here before?
- `tx_p3_before7` — Classified: the station was built to study a 2.3 billion year old signal.
- `tx_p3_after7` — Phantoms react to Signal Splice. They recognise it.
- `tx_p3_before8` — WRAITH fragment found the ancient structure in Sector 08 first.
- `tx_p3_ending` — The structure is a map. Pointing somewhere further out. AXIOM-7 waits for the crew.

---

## Technical Notes

**Progression system** (`progression.js`):
- `Progression.init()` — loads from localStorage on boot
- `Progression.reset()` — clears run upgrades, restores AXIOM defaults
- `Progression.applyAll()` — called at each level start to ensure stats are correct
- Snapshot taken on first `_restore()` call; safe against multiple `applyAll()` calls

**Procedural maps** (`procedural.js`):
- Deterministic given a seed (mulberry32 PRNG)
- Seed passed as `mapSeed` in scene data; XOR'd with level index per sector
- Validation ensures ≥30% open tiles; up to 20 regeneration attempts before fallback

**Leaderboard** (`leaderboard.js`):
- `localStorage` key: `axiombreak_leaderboard_v1`
- Sorted descending by score, capped at 10 entries
- Seeded with 4 example entries on first run

**Upgrade scene flow**:
```
GameScene (portal entered)
  → HUD.showTransmission(after)
    → scene.start('Upgrade', { nextLevelIndex, score, mapSeed })
      → player picks upgrade
        → scene.start('Game', { levelIndex: next, score })
```

**Phantom immunity**: Bullet collision check in `GameScene.js` uses `e.damage()` which returns early if `e._phantomPhased === true`. Melee collision also skips phased phantoms.
