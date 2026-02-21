# The Ashwood Inheritance — Phase 1: Story Foundation

> *"He did not die by his heart. Come to Ashwood."*

A 2D mystery game with a deep, multi-hour branching narrative. Built with Phaser 3.

---

## What's in Phase 1

Phase 1 establishes the **complete story foundation** — narrative, characters, clues, dialogue trees, and game systems — before visual art is layered on in Phase 2.

### File Structure

```
index.html              Entry point + CDN imports + UI overlay
css/
  main.css              Full UI stylesheet (Victorian noir)
assets/data/
  story.js              All story data (characters, locations, clues, acts, endings)
  dialogue.js           All dialogue trees (full branching for every character)
js/
  gameState.js          State manager: clues, flags, conditions, save/load
  dialogueEngine.js     Typewriter conversation renderer + response handling
  uiManager.js          Journal, HUD, clue notifications, menus
  sceneManager.js       Scene/location management, Phaser setup, scene stubs
  main.js               Entry point, title screen, global bindings, debug tools
README.md               This file
```

---

## The Story

**Premise:** Detective Maren Cole investigates the "natural" death of Elias Ashwood — and uncovers a decades-long conspiracy of stolen identity and murder.

**Killer:** Nathaniel Ashwood (eldest son) poisoned his father with digitalis compound.

**Why:** Elias planned to confess that he was actually Tomas Vey — a stolen identity since 1972 — which would have destroyed Nathaniel's inheritance and name.

**Play time:** 3-4 hours | **Endings:** 6 | **Acts:** 5

---

## Running the Game

```bash
npx serve .
# or
python3 -m http.server 8080
# Open: http://localhost:8080
```

No build step. All dependencies loaded from CDN.

---

## Integration Guide

### Adding New Dialogue

In `assets/data/dialogue.js`, add a node to any character's object:

```javascript
DIALOGUE.hester.hester_new_node = {
  id: "hester_new_node",
  speaker: "hester",
  text: ["Line 1", "Line 2"],
  condition: "some_flag",        // optional — only appears when flag is set
  setsFlag: "flag_to_set",       // optional — set on enter
  responses: [
    {
      text: "Player response",
      leadsTo: "next_node_id",   // null to end
      givesClue: "clue_id",      // optional
      setsFlag: "another_flag"   // optional
    }
  ]
}
```

### Condition Syntax

```javascript
"flagName"          // flag is truthy
"NOT flagName"      // flag is falsy  
"flagA AND flagB"   // both truthy
"flagA OR flagB"    // either truthy
"clue_id"           // clue has been collected
```

### Adding Clues

In `assets/data/story.js` under `STORY.clues`:

```javascript
my_clue: {
  id: "my_clue",
  name: "Display Name",
  location: "location_id",
  description: "What this clue reveals.",
  weight: "critical | significant | minor | revelatory | key_item | atmospheric"
}
```

Give clue programmatically: `gameState.addClue('my_clue')`

### Debug Console Tools (localhost only)

```javascript
DEBUG.state()                         // Print game summary
DEBUG.giveClue('clue_id')             // Add any clue
DEBUG.testDialogue('hester')          // Start any dialogue
DEBUG.skipToAct(3)                    // Jump to act
DEBUG.triggerEnding('ending_justice') // Test any ending
DEBUG.allClues()                      // List all clue IDs
DEBUG.allEndings()                    // List all ending IDs
```

---

## Ending Summary

| Ending | How to Get |
|--------|-----------|
| The Weight of Evidence (Good) | Full evidence, call police |
| One More Day (Bittersweet) | Give Nathaniel 24 hours |
| The House Decides (Complex) | Bring evidence to family first |
| The Full Measure (Melancholy) | Understand Nathaniel fully + visited Declan + found Jonas letter |
| The Open File (Bad) | Too little evidence when confronting |
| What the House Keeps (Hidden Dark) | Accept Dorothea's bribe |

---

## Phase 2 Preview

- Full Phaser scene art per location (tilemap + illustrated backgrounds)
- Character portrait illustrations  
- Ambient audio (rain, music, interior ambience)
- Clickable investigation hotspots
- Physical inventory system
- Evidence board UI
- Navigation map overlay

---

*Phase 1 — Story Foundation | The Ashwood Inheritance*
