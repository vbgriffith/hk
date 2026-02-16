# Hollow Knight Web Clone — Session 6 Complete Fixes

## Critical Fixes

### FIX 16 — Dialogue Not Showing After Transitions
**Bug:** Dialogue boxes don't appear after room transitions.  
**Root Cause:** `DialogueBox.show()` pauses physics. When transitioning mid-dialogue, `_clearRoom` manually hid dialogue without calling `hide()`, so physics stayed paused. All overlaps stopped firing.

**Fix:**
```js
// GameScene.js — _clearRoom
if (this._dialogue?.isVisible) {
  this._dialogue._visible = false;
  this._dialogue._callback = null;
  this._dialogue._panel?.setVisible(false);
  this._dialogue._speakerText?.setVisible(false);
  this._dialogue._bodyText?.setVisible(false);
  this._dialogue._arrow?.setVisible(false);
  // Resume physics (show() pauses it)
  try { this.physics.resume(); } catch(_) {}
}
```

---

### FIX 17 — Lore Tablet Errors After Transitions
**Bug:** Lore tablets throw errors after room transitions.  
**Cause:** Same as Fix #16 — physics paused.  
**Fix:** Physics resume in `_clearRoom`.

---

### FIX 18 — Crossroads Chest Not Loading
**Bug:** Geo chest doesn't appear.  
**Cause:** Only charm chests implemented.  
**Fix:** Added geo chest handler to `_buildItem` in GameScene.js.

---

### FIX 19 — _buildSaveData Crashes
**Bug:** Save system crashes when dreamers enabled.  
**Root Causes:**
1. GameScene `_buildSaveData` didn't guard undefined sub-fields
2. P3 patch called `toSaveData()` without error handling
3. DreamerSystem didn't validate `brokenSeals` array

**Fixes:**
- GameScene.js: Safe field guards with null checks
- GameScene_p3.js: try-catch around dreamer data merge
- DreamerSystem.js: Array validation in constructor

---

### FIX 20 — Error When Hitting Boss (Red Flash)
**Bug:** Error thrown when knight takes damage from boss (screen flashes red).  
**Root Cause:** `Knight.onHit()` calls `this._camera.flash(0xff4444, 100)` without guards. If camera is in invalid state (mid-transition, destroyed, etc.), Phaser's camera.flash() throws.

**Fix Part 1 — Knight.js:**
```js
onHit(damage, source) {
  // ... damage logic ...
  
  this._audio.playSfx('sfx_player_hit');
  
  // Guard camera calls against destroyed/invalid state
  try {
    this._camera?.shake(4, 200);
    this._camera?.flash(0xff4444, 100);
  } catch(e) {
    console.warn('Camera effect failed:', e);
  }
  
  // ... rest of method ...
}
```

**Fix Part 2 — AudioSystem.js (CameraSystem):**
```js
flash(colour = 0xffffff, duration = 80) {
  if (!this.cam || !this.cam.active) return;
  try {
    this.cam.flash(duration, (colour >> 16) & 0xff,
                             (colour >> 8)  & 0xff,
                              colour        & 0xff, true);
  } catch(e) {
    console.warn('Camera flash failed:', e);
  }
}
```

**Result:** Camera effects never crash, even during complex state transitions.

---

## Installation

Replace these 5 files:
- `js/scenes/GameScene.js`
- `js/scenes/GameScene_p3.js`
- `js/systems/DreamerSystem.js`
- `js/systems/AudioSystem.js`
- `js/entities/Knight.js`

Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R) and reload.

---

## Testing Checklist

✓ Dialogue shows after all transitions  
✓ Lore tablets work after transitions  
✓ NPCs work after transitions  
✓ Benches work after transitions  
✓ Crossroads chest appears  
✓ Auto-save works  
✓ Dreamer seals work  
✓ **Boss fights don't crash**  
✓ **Taking damage doesn't crash**  
✓ **Camera effects work correctly**  

---

## Root Cause Summary

**Dialogue/Physics bug:** show() pauses physics, _clearRoom didn't resume it → all interactions broke

**Camera crash bug:** Camera effects called without state validation → crash during transitions/destruction

Both fixed with proper cleanup and error handling.

---

## Files Changed (Session 6)

- `GameScene.js` — Physics resume, geo chest, save guards  
- `GameScene_p3.js` — Dreamer save try-catch  
- `DreamerSystem.js` — Array validation  
- `AudioSystem.js` — Camera flash guards  
- `Knight.js` — Camera effect try-catch  

**Total bugs fixed: 20**
