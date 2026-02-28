# Campaign Forge — Pathfinder 2e Complete Adventure Generator

**PF2e Remaster Compatible · No Build Step · Runs in Any Modern Browser**

Campaign Forge is a browser-based toolkit for Pathfinder Second Edition Game Masters. Drop the files in a folder, open `index.html`, and generate complete adventures with maps, encounter tables, faction webs, timelines, and session zero materials — all from a single interface.

---

## Quick Start

1. Unzip the full package into any folder
2. Open `index.html` in Chrome, Firefox, Edge, or Safari 14+
3. Configure players, level range, tone, and theme
4. Click **FORGE CAMPAIGN**
5. Use the tabs across the top of the output panel to explore every feature

No server, no Node.js, no build step. Everything runs in your browser.

---

## File Structure

```
pf2e-campaign-forge/
├── index.html                 Main entry point
├── README.md                  This file
├── css/
│   └── style.css              All styles (dark manuscript aesthetic)
├── data/
│   ├── campaigns.js           20 complete campaign seeds
│   └── components.js          Modular villain/faction/quest/reward pools
└── js/
    ├── generator.js           Core campaign generation engine
    ├── renderer.js            HTML output builder
    ├── mapGenerator.js        Procedural regional + dungeon map engine (Build 2)
    ├── factionMap.js          Faction relationship web visualizer (Build 2)
    ├── timeline.js            Campaign timeline / chronicle canvas (Build 3)
    ├── encounterBuilder.js    XP-budget encounter assembler (Build 3)
    ├── sessionZero.js         Session zero builder and safety tools (Build 3)
    └── ui.js                  DOM controller, tabs, state, export
```

---

## Build History

### Build 1 — Campaign Generator

Core campaign generation. Configure and forge complete adventure campaigns with:

- Full synopsis, villain, factions, NPCs, locations, plot twists
- 1–6 acts with milestones, encounters, boss setpieces, and side quests
- Treasure & rewards scaled to act level
- PF2e Remaster notes (encounter budgets, key rules changes)
- Mix & Match modal to swap any component
- Export: JSON save/load, Markdown copy, Print

### Build 2 — Maps & Faction Web

Three new output tabs added to the campaign panel:

**Regional Map** — Procedural overworld map using multi-octave fractal noise. Terrain type responds to campaign theme (undead themes weight toward swamp; nature toward forest). Campaign locations appear as named red dots. Two colour palettes: Parchment (day) and Night/Tactical. 9 seed variations. PNG download.

**Dungeon Map** — BSP room partitioning generates connected room networks with doors, secret doors, stairs, and named features. Location dropdown pulls from your campaign's generated locations. Theme-matched colour schemes. 9 variations. PNG download.

**Faction Web** — All campaign factions rendered as hexagonal nodes on a dark canvas. Edges auto-generated based on faction roles: Allied (green), Neutral (dashed), Hostile (red), Secret Deal (purple dash), Proxy War (orange), Rivals (tan). Hover any node or edge for a detailed tooltip. PNG download.

### Build 3 — GM Toolkit

Three additional tabs completing the toolkit:

**Timeline / Chronicle** — Scrollable canvas timeline showing all acts as coloured level-keyed bands, side quests as branching nodes, boss encounters and plot twists as coloured markers. Click any node to expand a detail panel below the canvas. PNG download.

**Encounter Builder** — Full encounter assembly tool with a 60+ creature library covering levels −1 through 20. XP budget bar shows Trivial/Low/Moderate/Severe/Extreme thresholds auto-adjusted for your party size. Filter by theme, role, level range, and name. Add/remove creatures with +/− controls. Save encounters to specific acts. Export printable encounter cards as HTML.

**Session Zero** — Complete session zero document builder with per-player character questionnaires, party composition analyser (role coverage, skill gaps, action economy notes), safety tools reference (X-Card, Lines & Veils, Open Door, Script Change, Stars & Wishes), editable Lines/Veils lists, CATS framework summary, and a campaign contract with logistics, table rules, tone/content, and signature blocks. Export as HTML or copy as plain text.

---

## Campaign Seeds (20 Total)

| ID | Campaign Name | Source Inspiration | Level Range | Tones | Themes |
|----|---------------|--------------------|-------------|-------|--------|
| AoA | Embers of the Fallen Throne | Age of Ashes | 1–20 | heroic, exploration | ancient, arcane, planar |
| EC | The Last Circus of Kortos | Extinction Curse | 1–20 | swashbuckling, exploration | nature, ancient, divine |
| AoE | The Edgewatch Protocols | Agents of Edgewatch | 1–20 | political, dark | urban, political |
| SoT | The Magaambya Accord | Strength of Thousands | 1–20 | heroic, exploration | arcane, ancient, nature |
| OoA | Smoke & Gunpowder | Outlaws of Alkenstar | 1–10 | swashbuckling, dark | urban, political |
| BB2 | Lords of Eviscerated Crowns | Blood Lords | 1–20 | dark, political | undead, political, arcane |
| GG | The Amnesiac Constellation | Gatewalkers | 1–10 | horror, exploration | planar, arcane, divine |
| SR | The Vault of the Iron Crown | Sky King's Tomb | 1–10 | heroic, exploration | ancient, divine |
| WoW | When Gods Bleed | War of Immortals | 15–20 | heroic, dark | divine, planar |
| GoG | The Final Performance | Curtain Call | 15–20 | political, swashbuckling | urban, arcane |
| SiW | The Long Winter of Hungry Spirits | Season of Ghosts | 1–10 | horror, dark | nature, divine, undead |
| FoF | The Ruby Phoenix Grand Tournament | Fists of the Ruby Phoenix | 11–15 | swashbuckling | political, arcane |
| RotR | The Shattered Sihedron | Rise of the Runelords (PF2e) | 1–18 | heroic, dark | ancient, arcane, political |
| CotCT | Blood on the Crimson Throne | Curse of the Crimson Throne (PF2e) | 1–14 | dark, political | political, urban, divine |
| Kingmaker | The Stolen Lands Compact | Kingmaker (PF2e) | 1–20 | heroic, exploration | nature, political, ancient |
| SD | Seven Dooms for a Quiet Town | Seven Dooms for Sandpoint | 1–10 | heroic, dark | ancient, divine, political |
| SW | The Ooze That Swallowed a City | The Slithering | 3–8 | horror, dark | ancient, arcane, nature |
| BB | The Towers of Light | Beginner Box | 1–4 | heroic | arcane, ancient, divine |
| VP | The Cacophonic Descent | Vaults of Pandemonium | 13–20 | horror, dark | planar, arcane, divine |
| custom | The Shattered Confluence | Custom Mix | 1–20 | any | arcane, divine, ancient |

---

## Generation Options

### Configuration Panel

| Setting | Range | Effect |
|---------|-------|--------|
| Players | 2–6 | Adjusts encounter XP budgets (±10 XP per player above/below 4) |
| Starting Level | 1–19 | First act begins here |
| Ending Level | 2–20 | Must exceed starting level |
| Acts | 1–6 | Divides level range proportionally |
| Side Quests / Act | 1–5 | Optional quests per act |
| Campaign Tone | 7 options | Filters available campaign seeds |
| Primary Theme | 9 options | Filters seeds; affects map terrain weights |
| Source Inspiration | Any / 20 specific | Selects base seed |

### Generation Toggles

| Toggle | When off |
|--------|----------|
| Unique Villain | Uses base seed villain without archetype overlay |
| Rich Locations | Keeps only canonical locations from seed |
| Factions & Politics | Omits faction generation |
| Plot Twists | No twists generated |
| Key NPCs | No NPC generation |
| Treasure & Rewards | No reward table |
| Adventure Hooks | No hook generated |
| Boss Encounters | Boss blocks omitted from acts |

---

## PF2e Remaster Notes

Campaign Forge is built for the **PF2e Remaster** (Player Core, GM Core, Monster Core).

**Key rules changes reflected:**
- Alignment removed; creatures described by ethics, edicts, and anathema
- Evil damage → Unholy; Good damage → Holy
- Spell traditions unchanged (arcane, divine, primal, occult)
- Recall Knowledge uses structured DCs from GM Core
- Hero Points, Fortune, and Misfortune terminology standardised

**Encounter XP Budgets (base 4 players):**

| Difficulty | XP | Effect |
|------------|-----|--------|
| Trivial | 40 | No resource drain |
| Low | 60 | Minor resource drain |
| Moderate | 80 | Some resources spent; someone may be hurt |
| Severe | 120 | Major resources; someone may fall |
| Extreme | 160 | Real death risk; use sparingly |

Adjust ±10 XP per player above or below 4.

**Creature XP by level difference:**

| Creature vs Party Level | XP |
|-------------------------|----|
| −4 or lower | 10 |
| −3 | 15 |
| −2 | 20 |
| −1 | 30 |
| Same level | 40 |
| +1 | 60 |
| +2 | 80 |
| +3 | 120 |
| +4 | 160 |

**Leveling:** Milestone XP is recommended. Award level-ups at natural story beats — end of acts, major villain defeats, completing a story arc — rather than per-encounter.

---

## Encounter Builder Reference

The encounter builder includes 60+ creatures spanning levels −1 to 20. Each creature entry includes:

- **Level** and **XP value** relative to your party level
- **Role** (Boss, Soldier, Brute, Skirmisher, Caster, Controller, etc.)
- **Traits** for filtering (undead, dragon, construct, fey, etc.)
- **Tactics** summary for the GM
- **Special Ability** with mechanics detail

Filters: search by name or trait, filter by theme and role, set level range.

Saved encounters are keyed by act and persist for the session. Export any encounter as a printable HTML card with full creature tactics and special abilities.

---

## Session Zero Builder Reference

### Player Character Form (per player)
- Ancestry, Class, Level, Background, Key Ability
- Trained skills list
- Goal, Motivation, Greatest Fear, Defining Flaw
- Campaign Connection (ties character to current campaign)
- Character Secret (GM-only backstory element)
- Backstory freeform + 12 prompt suggestions

### Party Analysis (auto-generated)
- Role coverage matrix: Striker, Healer, Controller, Support, Scout, Skill Monkey, Face
- Critical skill gap checker: 18 key skills flagged if uncovered
- Warnings: missing healer, missing striker, no Medicine, etc.
- Action economy note adjusted for party size

### Safety Tools
- X-Card, Lines & Veils, Open Door Policy, Script Change, Stars & Wishes
- Editable Lines list (never appears in play)
- Editable Veils list (happens off-screen)
- CATS framework summary (Concept, Aim, Tone, Subject Matter)

### Campaign Contract
- Session logistics (day, time, location, cancellation policy)
- Table rules (phones, PvP, metagaming, spotlight)
- Tone statement, content rating, house rules
- Signature blocks for all players and GM

---

## Mix & Match

After forging a campaign, click **Mix & Match** to swap any component without regenerating the whole campaign:

- Change the campaign base seed (re-generates everything)
- Swap villain archetype (keeps name, changes race/CR/tactics/weakness)
- Change faction pack (keep, randomize, or restore defaults)
- Shift campaign tone (re-generates if changed)
- Randomize: locations, plot twists, NPCs, adventure hook

---

## Export Options

| Button | Output |
|--------|--------|
| Save JSON | Full campaign object as `.json` — reload with Load JSON |
| Copy Markdown | Plain text formatted for Obsidian/Notion/any notes app |
| Print | Browser print dialog; print-optimized CSS hides UI chrome |
| ⬇ Download PNG | On map/timeline/faction tabs — saves canvas as PNG |
| Session Zero: Export HTML | Standalone HTML document ready to print or share |
| Session Zero: Copy Text | Plain text to clipboard |
| Encounter: Export Card | Printable HTML encounter card with full creature detail |

---

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Mobile (responsive) | ✅ Supported |

---

## Dependencies

All loaded from CDN — no installation required:

- **Lodash 4.17.21** — array sampling (`_.sampleSize`)
- **Google Fonts** — Cinzel Decorative, Crimson Pro, JetBrains Mono

---

## Legal

Campaign Forge is a fan-made GM tool for personal use at the gaming table. It is not affiliated with, endorsed by, or licensed by Paizo Inc. Pathfinder and Pathfinder Second Edition are trademarks of Paizo Inc.

Campaign seeds are inspired by published Paizo Adventure Paths but contain entirely original text, names, plots, and mechanics. No Paizo intellectual property is reproduced.
