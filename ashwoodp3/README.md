# The Ashwood Inheritance — Phase 3: Complete Game

## What's New in Phase 3

### Six New Locations (Procedurally Drawn)
- **Nathaniel's Room** — Controlled, precise. Locked nightstand holds the pharmacy receipt and new will draft.
- **East Library** — Dorothea's supposed alibi. Cold chamomile tea, and a window overlooking the study.
- **Groundskeeper's Shed** — A loose floorboard. A tin box. A photograph of Tomas Vey before he became Elias Ashwood.
- **Dr. Crane's Office** — A prescription log with a torn page. A safe behind a crooked Monet.
- **Whitmore National Bank** — Vault 114. The stolen Calwell deeds. Jonas Merrill's letter.
- **Declan Fairweather's Study** — Modest, worn. A photograph of two young men dated 1988.

### Full Confrontation System (Act 4)
Each character confronted with evidence — adaptive responses based on what you've found.
- **Hester** — Break her alibi with the library window clue
- **Dorothea** — She may offer a bribe (opens the dark ending)
- **Dr. Crane** — The pharmacy receipt makes him talk
- **Nathaniel** — Requires toxicology + camera photos for full confession

### Six Endings — All Playable
1. **The Weight of Evidence** — Call police immediately
2. **One More Day** — Give Nathaniel 24 hours
3. **The House Decides** — Let the family call the police
4. **The Full Measure** — Hear everything, then act
5. **The Open File** — Insufficient evidence. Nathaniel walks free.
6. **What the House Keeps** — Accept Dorothea's bribe. The darkest path.

### Case Notes Panel (Press N)
Auto-updating notebook. Color-coded deductions, critical findings, and to-dos from Maren's perspective.

---

## Run
```bash
npx serve .
# or
python3 -m http.server 8080
```

## Debug (localhost)
```js
DEBUG.act3Ready()            // skip to Act 3
DEBUG.act4Ready()            // skip to Act 4 with full evidence
DEBUG.confront('nathaniel')  // trigger final confrontation
DEBUG.winGame()              // ending_justice immediately
DEBUG.triggerEnding('ending_coverup')   // dark ending
DEBUG.triggerEnding('ending_incomplete') // bad ending
DEBUG.goto('whitmore_bank')
DEBUG.goto('nathaniel_room')
DEBUG.goto('dr_crane_office')
DEBUG.allFlags()
DEBUG.state()
```

---

## The Truth

**Elias Ashwood was Tomas Vey** — a Czech emigrant who took a dead man's name and built his empire on stolen Calwell family land.

When Elias decided to confess publicly, **Nathaniel** obtained a digitalis compound through a coerced Dr. Crane and administered it in his father's evening brandy.

**Dorothea** watched the study light go out from the library window and understood. She said nothing.

**Sylvie** is Declan Fairweather's daughter — another of Elias's silenced victims, who had been researching her own history for months before the death.

The Calwell family's land was stolen. That fact stands regardless of which ending is reached.
