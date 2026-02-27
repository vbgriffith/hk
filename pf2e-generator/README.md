# Pathfinder 2e Campaign Forge

> A complete, in-browser campaign generator for Pathfinder Second Edition (Remaster compatible).
> Generates full adventure campaigns with acts, side quests, villains, factions, NPCs, encounters, and rewards — all in one click.

---

## Quick Start

```bash
# No build step required. Open directly:
open index.html

# Or serve locally:
npx serve .
# → http://localhost:3000
```

> Requires an internet connection to load fonts and Lodash from CDN on first run.

---

## Features

### Generation
- **20 preloaded campaign seeds** inspired by major Paizo Adventure Paths (Age of Ashes, Extinction Curse, Blood Lords, Kingmaker, Crimson Throne, and more)
- **Complete campaigns** generated in seconds: synopsis, plot beats, acts, encounters, boss fights, NPCs, factions, locations, and treasure
- **Side quests per act** (1–5) with unique titles, descriptions, DCs, and rewards
- **Plot twists** with suggested timing (Act 2 revelation, mid-campaign, etc.)
- **Boss encounter templates** with Phase 2 mechanics and environmental hazards

### Configuration
- Players: 2–6 (XP budget auto-adjusts)
- Level range: 1–20 (any span)
- Acts: 1–6
- Side quests per act: 1–5
- Tone filters: Heroic, Dark, Political, Exploration, Horror, Swashbuckling
- Theme filters: Undead, Arcane, Divine, Nature, Urban, Planar, Ancient, Political

### Mix & Match
After generation, swap any component:
- Change campaign base / source inspiration
- Randomize villain archetype
- Swap faction pack
- Regenerate locations, plot twists, NPCs, or adventure hook independently

### Export / Import
- **Save JSON** — export the full campaign object
- **Load JSON** — reload a saved campaign
- **Copy (Markdown)** — copy the full campaign as formatted text
- **Print** — browser print dialog with print-optimized styling

---

## File Structure

```
pf2e-generator/
│
├── index.html              # Entry point
│
├── css/
│   └── style.css           # Dark illuminated-manuscript aesthetic
│
├── data/
│   ├── campaigns.js        # 20 preloaded campaign seeds (full villain, factions, plot)
│   └── components.js       # Modular pieces: villain archetypes, factions, side quest
│                           # templates, plot twists, rewards, NPC archetypes, boss
│                           # encounter templates, PF2e Remaster notes
│
└── js/
    ├── generator.js        # Core campaign generation engine
    ├── renderer.js         # HTML output builder
    └── ui.js               # DOM controller (steppers, modal, export/import)
```

---

## Campaign Seeds Reference

| ID | Campaign Name | Source | Levels | Themes |
|----|--------------|--------|--------|--------|
| AoA | Embers of the Fallen Throne | Age of Ashes | 1–20 | Ancient, Arcane, Planar |
| EC | The Last Circus of Kortos | Extinction Curse | 1–20 | Nature, Ancient, Divine |
| AoE | The Edgewatch Protocols | Agents of Edgewatch | 1–20 | Urban, Political |
| SoT | The Magaambya Accord | Strength of Thousands | 1–20 | Arcane, Ancient, Nature |
| OoA | Smoke & Gunpowder | Outlaws of Alkenstar | 1–10 | Urban, Political |
| BB2 | Lords of Eviscerated Crowns | Blood Lords | 1–20 | Undead, Political, Arcane |
| GG | The Amnesiac Constellation | Gatewalkers | 1–10 | Planar, Arcane, Divine |
| SR | The Vault of the Iron Crown | Sky King's Tomb | 1–10 | Ancient, Divine |
| WoW | When Gods Bleed | War of Immortals | 15–20 | Divine, Planar |
| GoG | The Final Performance | Curtain Call | 15–20 | Urban, Arcane |
| SiW | The Long Winter of Hungry Spirits | Season of Ghosts | 1–10 | Nature, Divine, Undead |
| FoF | The Ruby Phoenix Grand Tournament | Fists of the Ruby Phoenix | 11–15 | Political, Arcane |
| RotR | The Shattered Sihedron | Rise of the Runelords (PF2e) | 1–18 | Ancient, Arcane, Political |
| CotCT | Blood on the Crimson Throne | Curse of the Crimson Throne (PF2e) | 1–14 | Political, Urban, Divine |
| Kingmaker | The Stolen Lands Compact | Kingmaker (PF2e) | 1–20 | Nature, Political, Ancient |
| SD | Seven Dooms for a Quiet Town | Seven Dooms for Sandpoint | 1–10 | Ancient, Divine, Political |
| SW | The Ooze That Swallowed a City | The Slithering | 3–8 | Ancient, Arcane, Nature |
| BB | The Towers of Light | Beginner Box | 1–4 | Arcane, Ancient, Divine |
| VP | The Cacophonic Descent | Vaults of Pandemonium | 13–20 | Planar, Arcane, Divine |
| custom | The Shattered Confluence | Custom Mix | 1–20 | Arcane, Divine, Ancient |

---

## PF2e Remaster Compatibility

This generator uses **PF2e Remaster** terminology throughout:
- Alignment removed; replaced with Edicts/Anathema and personal ethics
- "Unholy" and "Holy" damage tags replace "Evil/Good" on damage
- Spell traditions (Arcane/Divine/Primal/Occult) unchanged
- Encounter XP budgets from GM Core
- Milestone leveling recommended for campaign play

### Encounter Budget Calculator

| Players | Trivial | Low | Moderate | Severe | Extreme |
|---------|---------|-----|----------|--------|---------|
| 2 | 20 | 40 | 60 | 100 | 140 |
| 3 | 30 | 50 | 70 | 110 | 150 |
| 4 | 40 | 60 | 80 | 120 | 160 |
| 5 | 50 | 70 | 90 | 130 | 170 |
| 6 | 60 | 80 | 100 | 140 | 180 |

---

## CDN Dependencies

| Library | Version | URL | Purpose |
|---------|---------|-----|---------|
| Lodash | 4.17.21 | jsDelivr | Array sampling, utilities |
| Google Fonts | — | fonts.googleapis.com | Cinzel Decorative, Crimson Pro, JetBrains Mono |

---

## Browser Support

| Browser | Status |
|---------|--------|
| Chrome 90+ | ✅ Full support |
| Firefox 88+ | ✅ Full support |
| Edge 90+ | ✅ Full support |
| Safari 14+ | ✅ Full support |
| Mobile browsers | ✅ Responsive layout |

---

## Future Phases

- **Phase 2:** Faction relationship map (visual)
- **Phase 3:** Encounter builder with statblock references
- **Phase 4:** Session zero questionnaire export
- **Phase 5:** Multiple campaign comparison / mashup mode

---

*Campaign Forge is not affiliated with or endorsed by Paizo Publishing. Pathfinder is a registered trademark of Paizo Inc. This tool is for personal use at the gaming table.*
