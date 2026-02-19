# Sessions 7-10 Integration Checklist

Complete guide for integrating all enhancements into your Hollow Knight web clone.

---

## Quick Start

```bash
# 1. Run the automatic integration script
./integrate_sessions_7-10.sh

# 2. Follow this checklist for manual steps
# 3. Test in browser
```

---

## Automatic Steps (Done by Script)

✅ **Knight.js** — Updated with:
- Sprite facing direction (flipX)
- Better hitbox (12×22)
- Inventory system
- Collectible fields

✅ **index.html** — Added script loads:
- mapData_expansion.js (Session 7)
- RoomGeometry.js (Session 9)
- EnemyVariants.js (Session 9)
- QuestSystem.js (Session 9)

✅ **Directories** — Created:
- js/entities/enemies/
- js/systems/

---

## Manual Steps Required

### STEP 1: PreloadScene.js Graphics Integration

**File:** `js/scenes/PreloadScene.js`

#### 1A. Replace Enemy Drawing Methods (Session 10)

Find and replace these methods:

```javascript
// FIND:
_drawCrawlerFrame(ctx, x, y, w, h, anim, f, total) {
  // ... old code ...
}

// REPLACE WITH: (from PreloadScene_graphics_complete.js)
_drawCrawlerFrame(ctx, x, y, w, h, anim, f, total) {
  const cx = x + w / 2, cy = y + h / 2;
  const t = f / Math.max(total - 1, 1);
  const bob = Math.sin(t * Math.PI * 4) * 1;
  
  ctx.save();
  ctx.translate(cx, cy);
  // ... [COPY FULL METHOD FROM PreloadScene_graphics_complete.js] ...
  ctx.restore();
}
```

**Repeat for:**
- `_drawSpitterFrame` → `_drawSpitterFrame_ENHANCED`
- `_drawFlyingScoutFrame` → `_drawFlyingScoutFrame_ENHANCED`

#### 1B. Add NPC Drawing Methods (Session 10)

Add these new methods after `_genNPCs()`:

```javascript
_drawElderbugFrame(ctx, x, y, w, h, f, total) {
  // [COPY FROM PreloadScene_graphics_complete.js]
}

_drawSlyFrame(ctx, x, y, w, h, f, total) {
  // [COPY FROM PreloadScene_graphics_complete.js]
}
```

Then update `_genNPCs()`:

```javascript
_genNPCs() {
  // Elderbug
  const elderbugCanvas = this.textures.createCanvas('elderbug', 28 * 8, 32 * 2);
  const ectx = elderbugCanvas.context;
  for (let ri = 0; ri < 2; ri++) {
    for (let f = 0; f < 4; f++) {
      this._drawElderbugFrame(ectx, f * 28, ri * 32, 28, 32, f, 4);
      elderbugCanvas.add(ri * 100 + f, 0, f * 28, ri * 32, 28, 32);
    }
  }
  elderbugCanvas.refresh();
  
  // Sly
  const slyCanvas = this.textures.createCanvas('sly', 28 * 8, 28 * 2);
  const sctx = slyCanvas.context;
  for (let ri = 0; ri < 2; ri++) {
    for (let f = 0; f < 4; f++) {
      this._drawSlyFrame(sctx, f * 28, ri * 28, 28, 28, f, 4);
      slyCanvas.add(ri * 100 + f, 0, f * 28, ri * 28, 28, 28);
    }
  }
  slyCanvas.refresh();
  
  // ... continue with other generic NPCs ...
}
```

#### 1C. Replace Effect Generation (Session 10)

Find and replace these methods:

```javascript
// In _genEffects():
_genEffects() {
  this._genSlashEffect_ENHANCED();  // Changed
  this._genGeo_ENHANCED();          // Changed
  this._genFireball_ENHANCED();     // Changed
  this._genParticles();             // Keep existing
  this._genAcidBlob();              // Keep existing
}
```

Replace each method with enhanced version from `PreloadScene_graphics_complete.js`.

#### 1D. Add Tileset Generation (Session 9)

At the end of `_generateAllTextures()`, add:

```javascript
_generateAllTextures() {
  this._genKnight();
  this._genCrawler();
  this._genSpitter();
  this._genFlyingScout();
  this._genNPCs();
  this._genEffects();
  this._genUI();
  this._genTiles();
  
  // SESSION 9: Add area-specific tilesets
  this._genTiles_ENHANCED();  // Add this line
}
```

Then copy the `_genTiles_ENHANCED()` method and all sub-methods from `PreloadScene_tilesets.js`.

#### 1E. Replace UI Generation (Session 10)

Find and replace:

```javascript
// FIND:
_genUI() {
  // Bench
  const bc = this.textures.createCanvas('bench', 24, 16);
  // ... old code ...
}

// REPLACE WITH:
_genUI() {
  this._genBench_ENHANCED();
  this._genChest_ENHANCED();
  this._genLoreTablet_ENHANCED();
  // ... other UI elements ...
}
```

Add the three enhanced methods from `PreloadScene_graphics_complete.js`.

#### 1F. Add Enemy Variant Sprites (Session 9)

At end of `_generateAllTextures()`, add:

```javascript
this._genEnemyVariants();  // Session 9 enemy sprites
```

Copy `_genEnemyVariants()` from `EnemyVariants.js` file.

---

### STEP 2: GameScene.js Enhancements

**File:** `js/scenes/GameScene.js`

#### 2A. Add System Managers (Session 9)

In constructor, after existing setup:

```javascript
constructor() {
  super(C.SCENE_GAME);
  // ... existing code ...
  
  // SESSION 9: Add quest and collectible systems
  this._questSystem = null;
  this._collectibles = null;
  this._decorator = null;
}
```

In `create()` method:

```javascript
create(data) {
  // ... existing setup ...
  
  // SESSION 9: Initialize systems
  this._questSystem = new QuestSystem(this);
  this._collectibles = new CollectibleManager(this);
  this._decorator = new RoomDecorator(this);
}
```

#### 2B. Update _buildRoom() (Session 9)

Add at end of `_buildRoom()`:

```javascript
_buildRoom(roomData) {
  // ... existing room building code ...
  
  // SESSION 9: Add collectibles
  this._collectibles.spawnCollectibles(roomData.key);
  
  // SESSION 9: Add decorations
  const enhanced = ENHANCED_ROOMS[roomData.key + '_enhanced'];
  if (enhanced) {
    this._decorator.renderDecorations(enhanced);
    
    // Use enhanced platforms if available
    if (enhanced.platforms) {
      // Note: This would require rebuilding platforms
      // For now, enhanced platforms are optional
    }
  }
}
```

#### 2C. Update _clearRoom() (Session 9)

Add at end:

```javascript
_clearRoom() {
  // ... existing cleanup ...
  
  // SESSION 9: Clear decorations
  this._decorator?.clear();
}
```

#### 2D. Update Save System (Session 9)

In save method, add new fields:

```javascript
_saveGame() {
  const saveData = {
    // ... existing fields ...
    
    // SESSION 9: New fields
    quests: this._questSystem.saveState().quests,
    completedQuests: this._questSystem.saveState().completedQuests,
    collectibles: this._collectibles.saveState(),
    inventory: this.knight.inventory || [],
    grubsRescued: this.knight.grubsRescued || 0,
    maskShards: this.knight.maskShards || 0,
    vesselFragments: this.knight.vesselFragments || 0,
    paleOre: this.knight.paleOre || 0,
    rancidEggs: this.knight.rancidEggs || 0,
    charms: this.knight.charms || [],
  };
  
  // ... save logic ...
}
```

---

### STEP 3: Update index.html (if not auto-patched)

**File:** `index.html`

Verify these lines exist before `</body>`:

```html
    <!-- Session 7: World Expansion -->
    <script src="js/data/mapData_expansion.js"></script>
    
    <!-- Session 9: Room Geometry -->
    <script src="js/data/RoomGeometry.js"></script>
    
    <!-- Session 9: Enemy Variants -->
    <script src="js/entities/enemies/EnemyVariants.js"></script>
    
    <!-- Session 9: Quest System -->
    <script src="js/systems/QuestSystem.js"></script>
    
  </body>
```

---

## Testing Checklist

### Session 7: World Map
- [ ] Can travel to all 44 rooms
- [ ] New areas accessible:
  - [ ] Crystal Peak (from Dirtmouth right)
  - [ ] Fog Canyon (from Greenpath right)
  - [ ] Queen's Gardens (from Greenpath Lake up)
  - [ ] Kingdom's Edge (from City East right)
- [ ] Map screen shows all rooms
- [ ] Room connections work both ways

### Session 8: Graphics
- [ ] Knight sprite has detailed appearance
- [ ] Knight faces left when moving left
- [ ] Knight faces right when moving right
- [ ] Knight has proper proportions

### Session 9: Content
- [ ] Area-specific tiles render correctly
- [ ] New enemies spawn in their areas:
  - [ ] Mosscreep in Greenpath
  - [ ] Fungoon in Fungal Wastes
  - [ ] Crystal Crawler in Crystal Peak
  - [ ] Pale Lurker in Ancient Basin
- [ ] Collectibles spawn and can be collected
- [ ] Quest system shows notifications
- [ ] Grubs can be rescued
- [ ] Mask shards grant health at 4/4

### Session 10: Polish
- [ ] Enemies have detailed sprites:
  - [ ] Crawler has segmented body
  - [ ] Spitter has glowing acid sac
  - [ ] All have infection orange eyes
- [ ] NPCs look distinct:
  - [ ] Elderbug looks old and wise
  - [ ] Sly looks cunning
- [ ] Effects enhanced:
  - [ ] Slash has 3 layers + particles
  - [ ] Geo has faceted gems with glow
  - [ ] Soul fireball has trail
- [ ] UI improved:
  - [ ] Bench has soul glow
  - [ ] Lore tablets have ancient text glow

---

## Troubleshooting

### "Room not found" errors
→ Check that mapData_expansion.js loads AFTER mapData.js and mapData_p3.js in index.html

### Knight doesn't flip
→ Verify Knight.js has the sprite facing code in update() method (around line 115)

### Graphics look wrong
→ Check browser console for errors
→ Clear browser cache (Ctrl+Shift+R)
→ Verify PreloadScene methods were replaced, not just added

### Collectibles don't spawn
→ Check that QuestSystem.js is loaded
→ Verify GameScene creates CollectibleManager
→ Check console for "collectibles" errors

### Performance issues
→ Reduce number of decorations in RoomGeometry.js
→ Disable enhanced tilesets temporarily
→ Check for infinite loops in enemy AI

---

## File Checklist

Required files in correct locations:

```
project/
├── index.html (updated with new scripts)
├── js/
│   ├── data/
│   │   ├── mapData.js (existing)
│   │   ├── mapData_p3.js (existing)
│   │   ├── mapData_expansion.js (Session 7) ✓
│   │   ├── dialogueData.js (updated Session 7)
│   │   └── RoomGeometry.js (Session 9) ✓
│   ├── entities/
│   │   ├── Knight.js (updated Sessions 8,9)
│   │   └── enemies/
│   │       └── EnemyVariants.js (Session 9) ✓
│   ├── scenes/
│   │   ├── PreloadScene.js (updated Sessions 8,9,10)
│   │   ├── PreloadScene_graphics_complete.js (reference)
│   │   └── PreloadScene_tilesets.js (reference)
│   └── systems/
│       └── QuestSystem.js (Session 9) ✓
```

---

## Integration Complete!

Once all steps are done:

1. **Clear browser cache:** Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. **Open in browser:** Load index.html
3. **Test:** Walk around, visit new areas, collect items
4. **Verify:** Check console for errors

Your Hollow Knight clone now has:
- ✨ 44 interconnected rooms
- ✨ Detailed Knight with facing
- ✨ Area-specific tilesets
- ✨ 10 enemy variants
- ✨ Quest system with 6 quests
- ✨ 50+ collectibles
- ✨ Enhanced graphics throughout
- ✨ Professional visual polish

Enjoy your complete Hollow Knight experience!
