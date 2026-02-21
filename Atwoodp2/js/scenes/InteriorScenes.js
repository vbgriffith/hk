// ════════════════════════════════════════════════════════════
//  THE ASHWOOD INHERITANCE — Interior Scenes
//  Foyer, Study, Drawing Room, Kitchen, Carriage House
// ════════════════════════════════════════════════════════════

// ── FOYER ────────────────────────────────────────────────────
class FoyerScene extends BaseScene {
  constructor() { super({ key: 'FoyerScene' }); }

  create() {
    const { W, H } = this.baseCreate();
    this.sceneId = 'foyer';
    this.buildRoom(W, H);
    this.buildHotspots(W, H);
    this.addExitZone('manor_exterior', '← Front Door', 0, 0, W * 0.1, H);
    this.addExitZone('drawing_room', '← Drawing Room', W * 0.1, H * 0.55, W * 0.18, H * 0.25);
    this.addExitZone('study', 'Study Corridor →', W * 0.72, H * 0.48, W * 0.16, H * 0.3);
    this.addExitZone('kitchen', 'Kitchen ↗', W * 0.82, H * 0.68, W * 0.18, H * 0.22);
    uiManager.showLocationBanner('foyer');
  }

  buildRoom(W, H) {
    const g = this.add.graphics();
    // Parquet floor
    g.fillStyle(0x120e08, 1); g.fillRect(0, H * 0.65, W, H * 0.35);
    g.lineStyle(0.5, 0x1e1810, 0.6);
    for (let x = 0; x < W; x += 32) g.lineBetween(x, H * 0.65, x, H);
    for (let y = H * 0.65; y < H; y += 26) g.lineBetween(0, y, W, y);
    // Back wall
    g.fillStyle(0x0e0c08, 1); g.fillRect(0, 0, W, H * 0.65);
    // Wainscoting
    g.fillStyle(0x1a1510, 1); g.fillRect(0, H * 0.57, W, H * 0.08);
    g.lineStyle(0.5, 0x28200e, 0.6); g.lineBetween(0, H * 0.57, W, H * 0.57);
    // Staircase (right side)
    g.fillStyle(0x100d08, 1);
    for (let s = 0; s < 8; s++) {
      g.fillRect(W * 0.58 + s * 22, H * 0.42 - s * 7, W * 0.42 - s * 22, H * 0.08);
      g.lineStyle(0.4, 0x28200e, 0.5);
      g.lineBetween(W * 0.58 + s * 22, H * 0.42 - s * 7, W, H * 0.42 - s * 7);
    }
    // Banister suggestion
    g.lineStyle(1, 0x302010, 0.5);
    g.lineBetween(W * 0.58, H * 0.42, W * 0.58 + 7 * 22, H * 0.42 - 7 * 7);
    // Chandelier
    g.fillStyle(0x908828, 0.45); g.fillCircle(W * 0.5, H * 0.1, 16);
    g.fillStyle(0x080604, 0.6);
    for (let a = 0; a < 8; a++) {
      const ang = (a/8)*Math.PI*2;
      g.fillCircle(W*0.5+Math.cos(ang)*20, H*0.1+Math.sin(ang)*5, 2.5);
    }
    this.createCandleFlicker(W * 0.5, H * 0.1, 140, 0.07);
    // Portrait wall - LEFT
    const portraitData = [
      { x: W*0.07, y: H*0.1 }, { x: W*0.07, y: H*0.3 },
      { x: W*0.2,  y: H*0.1 }, { x: W*0.2,  y: H*0.3 }
    ];
    portraitData.forEach(({x, y}, i) => {
      g.fillStyle(0x0a0806, 1); g.fillRect(x, y, 58, 72);
      g.lineStyle(i === 0 ? 2 : 1.5, i === 0 ? 0x604830 : 0x402818, 0.7);
      g.strokeRect(x - 4, y - 4, 66, 80);
      // Figure
      g.fillStyle(0x281c10, 0.8);
      g.fillEllipse(x + 29, y + 16, 18, 22);
      g.fillRect(x + 18, y + 25, 22, 32);
    });
    this.createDustMotes(10);
    return g;
  }

  buildHotspots(W, H) {
    this.addHotspot(W * 0.05, H * 0.07, W * 0.25, H * 0.58, {
      id: 'portrait_anomaly', label: 'Study Portraits', clueId: 'portrait_anomaly',
      dialogue: [
        'Four generations of Ashwoods in oil.',
        'Three share the jaw, the brow, the slightly hooded eyes.',
        'The oldest portrait is different. The face is a composite — no real person.',
        'The gilded frame is old. The paint beneath is not.',
        'Someone constructed a history here and hung it at eye level.'
      ]
    });
    this.addHotspot(W * 0.34, H * 0.53, W * 0.18, H * 0.1, {
      id: 'foyer_table', label: 'Entry Table',
      dialogue: ['A visitor\'s registry. Last entry: October 12th. "A. Crane." Three days before Elias died.']
    });
  }
}

// ── STUDY ────────────────────────────────────────────────────
class StudyScene extends BaseScene {
  constructor() { super({ key: 'StudyScene' }); }

  create() {
    const { W, H } = this.baseCreate();
    this.sceneId = 'study';
    this.buildRoom(W, H);
    this.buildHotspots(W, H);
    this.addExitZone('foyer', '← Study Corridor', 0, H * 0.45, W * 0.1, H * 0.45);
    uiManager.showLocationBanner('study');
  }

  buildRoom(W, H) {
    const g = this.add.graphics();
    // Floor — Persian rug
    g.fillStyle(0x0e0b06, 1); g.fillRect(0, H * 0.65, W, H * 0.35);
    g.fillStyle(0x1a0c0a, 0.35); g.fillRect(W*0.12, H*0.68, W*0.76, H*0.24);
    // Walls
    g.fillStyle(0x0c0a06, 1); g.fillRect(0, 0, W, H * 0.65);
    // Fireplace left
    g.fillStyle(0x080604, 1); g.fillRect(W*0.04, H*0.28, W*0.16, H*0.37);
    g.fillStyle(0x050402, 1); g.fillRect(W*0.07, H*0.33, W*0.1, H*0.3);
    g.fillStyle(0x1a1610, 1); g.fillRect(W*0.03, H*0.26, W*0.18, H*0.05);
    this.createCandleFlicker(W*0.12, H*0.6, 110, 0.22);
    this.createCandleFlame(W*0.10, H*0.62);
    this.createCandleFlame(W*0.12, H*0.61);
    this.createCandleFlame(W*0.14, H*0.62);
    // Bookshelf right
    g.fillStyle(0x100d08, 1); g.fillRect(W*0.7, 0, W*0.3, H*0.65);
    const bookColors = [0x3a1a08, 0x081830, 0x0a2010, 0x201008, 0x180820, 0x281408];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 11; col++) {
        g.fillStyle(bookColors[(row+col)%bookColors.length], 0.8);
        g.fillRect(W*0.72 + col*18, H*0.04 + row*60, 16, 55);
        g.lineStyle(0.4, 0x080604, 1);
        g.lineBetween(W*0.72+col*18, H*0.04+row*60, W*0.72+col*18, H*0.04+row*60+55);
      }
    }
    // Lever book — slightly out of alignment
    g.fillStyle(0x3a2a10, 1); g.fillRect(W*0.72+9*18, H*0.04, 16, 62);
    g.lineStyle(1, 0x806040, 0.6); g.strokeRect(W*0.72+9*18, H*0.04, 16, 62);
    // Desk
    g.fillStyle(0x1e1808, 1); g.fillRect(W*0.28, H*0.52, W*0.4, H*0.15);
    g.lineStyle(0.5, 0x302010, 0.5); g.strokeRect(W*0.28, H*0.52, W*0.4, H*0.15);
    // Desk items
    g.fillStyle(0x080604, 0.7); g.fillRect(W*0.3, H*0.53, W*0.06, H*0.06);
    g.fillStyle(0x2a2010, 0.9); g.fillRect(W*0.54, H*0.53, W*0.08, H*0.06);
    // Brandy glass - KEY
    g.fillStyle(0x282010, 0.75); g.fillRect(W*0.46, H*0.53, 14, 18);
    g.lineStyle(0.5, 0x706040, 0.6); g.strokeRect(W*0.46, H*0.53, 14, 18);
    g.fillStyle(0xa09090, 0.15); g.fillRect(W*0.465, H*0.534, 4, 14);
    // Leather chair — stain
    g.fillStyle(0x180e06, 1); g.fillRect(W*0.33, H*0.42, W*0.18, H*0.12);
    g.fillStyle(0x200808, 0.28); g.fillEllipse(W*0.38, H*0.47, 22, 16);
    // Window cold light
    g.fillStyle(0x080c14, 1); g.fillRect(W*0.55, H*0.1, W*0.12, H*0.18);
    g.lineStyle(1, 0x202818, 0.6); g.strokeRect(W*0.55, H*0.1, W*0.12, H*0.18);
    g.fillStyle(0x0a0c14, 0.1); g.fillTriangle(W*0.55, H*0.28, W*0.67, H*0.28, W*0.62, H*0.65);
    this.createDustMotes(8);
    const cx = W*0.43, cy = H*0.52;
    const cg = this.add.graphics();
    cg.fillStyle(0xe8e0d0, 0.75); cg.fillRect(cx-3, cy-14, 6, 14);
    this.createCandleFlame(cx, cy-14); this.createCandleFlicker(cx, cy-14, 55, 0.12);
    return g;
  }

  buildHotspots(W, H) {
    this.addHotspot(W*0.44, H*0.5, W*0.06, H*0.1, {
      id: 'brandy_glass', label: 'Examine Glass', clueId: 'brandy_glass',
      dialogue: ['A crystal glass. Rinsed but not well enough.', 'Residue at the base. Not brandy.', 'I bag it. This goes to a lab.']
    });
    this.addHotspot(W*0.52, H*0.5, W*0.1, H*0.1, {
      id: 'appointment_calendar', label: 'Read Calendar', clueId: 'crane_appointment',
      dialogue: ['October 12th: "Crane — private matter."', 'Not a medical visit. A different notation.']
    });
    this.addHotspot(W*0.72+9*18-5, H*0.02, 32, H*0.65, {
      id: 'lever_book', label: 'Pull Book',
      dialogue: ['"The Life of Elias Marsh." Slightly out of line.', 'I pull it.'],
      onActivate: () => {
        if (!gameState.hasClue('desk_hidden_compartment')) {
          setTimeout(() => dialogueEngine.narrate([
            'The book moves on a hinge. A panel in the shelf back opens.',
            'A sealed envelope. His handwriting: "For whoever finds this when I am gone."'
          ], () => {
            dialogueEngine.giveClue('desk_hidden_compartment');
            gameState.addItem('confession_letter');
            uiManager.updateBadges();
            gameState.setFlag('hidden_compartment_found');
          }), 600);
        }
      }
    });
    this.addHotspot(W*0.3, H*0.4, W*0.2, H*0.14, {
      id: 'stained_chair', label: 'Examine Chair',
      dialogue: ['Leather. A faint stain — cleaned but not erased.', 'He sat here when he died.']
    });
    this.addHotspot(W*0.54, H*0.09, W*0.14, H*0.22, {
      id: 'study_window', label: 'Look Through Window',
      dialogue: [
        'The east wing library is visible from here.',
        'Someone standing at that window could see directly into this room.'
      ]
    });
  }
}

// ── DRAWING ROOM ──────────────────────────────────────────────
class DrawingRoomScene extends BaseScene {
  constructor() { super({ key: 'DrawingRoomScene' }); }

  create() {
    const { W, H } = this.baseCreate();
    this.sceneId = 'drawing_room';
    this.buildRoom(W, H);
    this.buildHotspots(W, H);
    this.addExitZone('foyer', '← Foyer', W*0.85, H*0.55, W*0.15, H*0.35);
    uiManager.showLocationBanner('drawing_room');
    if (!gameState.hasSeenDialogue('dorothea_intro') && !gameState.getFlag('met_dorothea')) {
      setTimeout(() => {
        gameState.setFlag('met_dorothea', true);
        dialogueEngine.startConversation('dorothea', 'dorothea_intro');
      }, 2000);
    }
  }

  buildRoom(W, H) {
    const g = this.add.graphics();
    g.fillStyle(0x14100a, 1); g.fillRect(0, H*0.68, W, H*0.32);
    g.fillStyle(0x0d0b08, 1); g.fillRect(0, 0, W, H*0.68);
    // Wallpaper geometric
    g.lineStyle(0.3, 0x1c1810, 0.4);
    for (let x = 0; x < W; x += 50) for (let y = 0; y < H*0.68; y += 50) g.strokeRect(x+10, y+10, 30, 30);
    // Piano
    g.fillStyle(0x080604, 1); g.fillRect(W*0.04, H*0.43, W*0.22, H*0.27);
    g.fillStyle(0x0e0a06, 1); g.fillRect(W*0.05, H*0.44, W*0.2, H*0.05);
    for (let k = 0; k < 14; k++) {
      g.fillStyle(k%5!==2&&k%7!==5 ? 0xe0d8c0 : 0x080604, 0.7);
      g.fillRect(W*0.05+k*(W*0.2/14), H*0.44, W*0.2/14-1, H*0.04);
    }
    g.fillStyle(0xd0c8b0, 0.7); g.fillRect(W*0.08, H*0.43, W*0.1, H*0.025);
    // Drinks cabinet
    g.fillStyle(0x1a1208, 1); g.fillRect(W*0.7, H*0.33, W*0.2, H*0.37);
    g.lineStyle(1, 0x302010, 0.6); g.strokeRect(W*0.7, H*0.33, W*0.2, H*0.37);
    [[W*0.73,H*0.37],[W*0.79,H*0.37],[W*0.85,H*0.37]].forEach(([dx,dy]) => {
      g.fillStyle(0x302818, 0.8); g.fillRect(dx, dy, 12, 22);
      g.fillStyle(0xd4a840, 0.2); g.fillRect(dx+1, dy+8, 10, 12);
    });
    g.fillStyle(0x383028, 0.9); g.fillRect(W*0.85, H*0.37, 13, 24);
    g.lineStyle(0.5, 0x806040, 0.4); g.strokeRect(W*0.85, H*0.37, 13, 24);
    // Playbill framed
    g.fillStyle(0x0a0806, 1); g.fillRect(W*0.3, H*0.1, W*0.14, H*0.2);
    g.lineStyle(1.5, 0x604030, 0.7); g.strokeRect(W*0.28, H*0.08, W*0.18, H*0.24);
    g.fillStyle(0x806040, 0.45);
    g.fillRect(W*0.31, H*0.12, W*0.12, H*0.02);
    g.fillRect(W*0.33, H*0.16, W*0.08, H*0.01);
    // Dorothea figure if not met
    if (!gameState.getFlag('met_dorothea')) {
      const f = this.add.graphics();
      f.fillStyle(0x280808, 0.9); f.fillRect(W*0.545, H*0.56, 22, H*0.14);
      f.fillEllipse(W*0.556, H*0.52, 18, 22);
    }
    this.createDustMotes(10);
    this.createCandleFlicker(W*0.5, H*0.35, 200, 0.06);
    return g;
  }

  buildHotspots(W, H) {
    this.addHotspot(W*0.04, H*0.41, W*0.24, H*0.32, {
      id: 'piano_music', label: 'Examine Piano',
      dialogue: ['"Variations on a Departure." A commissioned piece, 2019.', 'The year of his first heart episode.', '"Departure." The title means something.']
    });
    this.addHotspot(W*0.68, H*0.31, W*0.24, H*0.4, {
      id: 'drinks_cabinet', label: 'Examine Cabinet',
      dialogue: ['Four decanters. Three old, one recently replaced.', 'A matching replacement — but newer glass.']
    });
    this.addHotspot(W*0.27, H*0.07, W*0.2, H*0.27, {
      id: 'playbill_dorothea', label: 'Read Playbill',
      dialogue: ['"The Glass Meridian," Aldgate Theatre, 1979.', 'Lead actress: Dorothea Marsh.', 'Before she was Ashwood.']
    });
  }
}

// ── KITCHEN ───────────────────────────────────────────────────
class KitchenScene extends BaseScene {
  constructor() { super({ key: 'KitchenScene' }); }

  create() {
    const { W, H } = this.baseCreate();
    this.sceneId = 'kitchen';
    this.buildRoom(W, H);
    this.buildHotspots(W, H);
    this.addExitZone('foyer', '← Foyer', 0, H*0.5, W*0.12, H*0.4);
    uiManager.showLocationBanner('kitchen');
    if (!gameState.getFlag('met_hester')) {
      setTimeout(() => {
        gameState.setFlag('met_hester', true);
        dialogueEngine.startConversation('hester', 'hester_intro');
      }, 1800);
    }
  }

  buildRoom(W, H) {
    const g = this.add.graphics();
    g.fillStyle(0x0f0e0a, 1); g.fillRect(0, H*0.65, W, H*0.35);
    g.lineStyle(0.5, 0x1a1810, 0.5);
    for (let x = 0; x < W; x += 45) g.lineBetween(x, H*0.65, x, H);
    for (let y = H*0.65; y < H; y += 45) g.lineBetween(0, y, W, y);
    g.fillStyle(0x0d0c08, 1); g.fillRect(0, 0, W, H*0.65);
    g.fillStyle(0x1e1a10, 1); g.fillRect(0, H*0.58, W*0.65, H*0.1);
    g.fillStyle(0x28221a, 1); g.fillRect(0, H*0.56, W*0.65, H*0.025);
    // Sink
    g.fillStyle(0x0a0c0e, 1); g.fillRect(W*0.35, H*0.56, W*0.2, H*0.05);
    g.lineStyle(1, 0x282828, 0.7); g.strokeRect(W*0.35, H*0.56, W*0.2, H*0.05);
    g.fillStyle(0x505050, 0.8); g.fillRect(W*0.445, H*0.535, 4, H*0.038);
    // KEY CLUE: Drying rack with washed decanter
    const rx = W*0.08, ry = H*0.49;
    g.fillStyle(0x1a1a18, 0.65); g.fillRect(rx, ry, W*0.17, H*0.1);
    g.lineStyle(0.5, 0x303028, 0.7);
    for (let i = 0; i < 5; i++) g.lineBetween(rx, ry+i*12, rx+W*0.17, ry+i*12);
    // The washed decanter — crystal clear, newly cleaned
    g.fillStyle(0x383028, 0.88); g.fillRect(rx+W*0.07, ry+H*0.01, 14, 24);
    g.lineStyle(1, 0x706050, 0.65); g.strokeRect(rx+W*0.07, ry+H*0.01, 14, 24);
    g.fillStyle(0xb0b8b0, 0.18); g.fillRect(rx+W*0.075, ry+H*0.015, 5, 18); // gleam
    // Cabinet
    g.fillStyle(0x181410, 1); g.fillRect(W*0.7, H*0.4, W*0.25, H*0.26);
    g.lineStyle(0.5, 0x282010, 0.5); g.strokeRect(W*0.7, H*0.4, W*0.25, H*0.26);
    // Hester figure
    if (!gameState.getFlag('met_hester')) {
      const f = this.add.graphics();
      f.fillStyle(0x202018, 0.9); f.fillRect(W*0.38, H*0.55, 18, H*0.12);
      f.fillEllipse(W*0.389, H*0.52, 16, 20);
    }
    return g;
  }

  buildHotspots(W, H) {
    this.addHotspot(W*0.06, H*0.46, W*0.22, H*0.18, {
      id: 'washed_decanter', label: 'Examine Decanter', clueId: 'washed_decanter',
      dialogue: [
        'Crystal. Same pattern as the drawing room decanters.',
        'On the drying rack. Washed this morning.',
        'I\'ll need to ask Hester who washes the decanters in this house.'
      ]
    });
    this.addHotspot(W*0.7, H*0.38, W*0.25, H*0.3, {
      id: 'kitchen_log', label: 'Check Kitchen Log',
      dialogue: ['A household log in the cabinet. Deliveries, maintenance. Nothing unusual.']
    });
  }
}

// ── CARRIAGE HOUSE ────────────────────────────────────────────
class CarriageHouseScene extends BaseScene {
  constructor() { super({ key: 'CarriageHouseScene' }); }

  create() {
    const { W, H } = this.baseCreate();
    this.sceneId = 'carriage_house';
    this.buildRoom(W, H);
    this.buildHotspots(W, H);
    this.addExitZone('manor_exterior', '← Grounds', 0, H*0.5, W*0.12, H*0.4);
    uiManager.showLocationBanner('carriage_house');
    if (!gameState.getFlag('met_sylvie')) {
      setTimeout(() => {
        gameState.setFlag('met_sylvie', true);
        dialogueEngine.startConversation('sylvie', 'sylvie_intro');
      }, 1800);
    }
  }

  buildRoom(W, H) {
    const g = this.add.graphics();
    // Concrete/stone floor
    g.fillStyle(0x100f0c, 1); g.fillRect(0, H*0.7, W, H*0.3);
    g.lineStyle(0.4, 0x181510, 0.5);
    for (let x = 0; x < W; x += 60) g.lineBetween(x, H*0.7, x, H);
    // Brick walls
    g.fillStyle(0x0c0b08, 1); g.fillRect(0, 0, W, H*0.7);
    g.lineStyle(0.4, 0x1a1610, 0.3);
    for (let y = 0; y < H*0.7; y += 14) g.lineBetween(0, y, W, y);
    // Warm space heater glow — right corner
    this.createCandleFlicker(W*0.88, H*0.65, 80, 0.18);
    const heater = this.add.graphics();
    heater.fillStyle(0x1c1208, 1); heater.fillRect(W*0.83, H*0.6, W*0.1, H*0.1);
    heater.fillStyle(0x601808, 0.5); heater.fillRect(W*0.84, H*0.64, W*0.08, H*0.04);
    // Prints hanging on wall
    const printPositions = [[W*0.1,H*0.07],[W*0.25,H*0.1],[W*0.4,H*0.06],[W*0.55,H*0.09],[W*0.68,H*0.07]];
    printPositions.forEach(([px, py], i) => {
      const pw = 55 + i*8, ph = 70 + i*5;
      g.fillStyle(0x0a0806, 1); g.fillRect(px, py, pw, ph);
      g.lineStyle(0.8, 0x302010, 0.5); g.strokeRect(px-2, py-2, pw+4, ph+4);
      // Abstract print suggestion
      g.fillStyle(0x282010 + i*0x050502, 0.6);
      g.fillEllipse(px+pw/2, py+ph/2, pw*0.6, ph*0.5);
    });
    // Worktable — center
    g.fillStyle(0x181410, 1); g.fillRect(W*0.2, H*0.52, W*0.55, H*0.14);
    g.lineStyle(0.5, 0x282010, 0.5); g.strokeRect(W*0.2, H*0.52, W*0.55, H*0.14);
    // Journal on worktable — KEY ITEM
    g.fillStyle(0x282018, 0.9); g.fillRect(W*0.24, H*0.53, W*0.12, H*0.09);
    g.lineStyle(1, 0x604030, 0.7); g.strokeRect(W*0.24, H*0.53, W*0.12, H*0.09);
    g.lineStyle(0.4, 0x403020, 0.5);
    for (let l = 0; l < 5; l++) g.lineBetween(W*0.26, H*0.55+l*9, W*0.34, H*0.55+l*9);
    // Camera on tripod — KEY
    g.fillStyle(0x202020, 0.9); g.fillRect(W*0.56, H*0.4, W*0.06, H*0.05);
    g.lineStyle(0.5, 0x303030, 0.8); g.strokeRect(W*0.56, H*0.4, W*0.06, H*0.05);
    g.fillStyle(0x151515, 1); // tripod
    g.lineBetween(W*0.59, H*0.45, W*0.56, H*0.65);
    g.lineBetween(W*0.59, H*0.45, W*0.62, H*0.65);
    g.lineBetween(W*0.59, H*0.45, W*0.59, H*0.65);
    // Fairweather research file on wall
    g.fillStyle(0x1a1612, 0.8); g.fillRect(W*0.8, H*0.35, W*0.1, H*0.15);
    g.lineStyle(1, 0x483820, 0.6); g.strokeRect(W*0.8, H*0.35, W*0.1, H*0.15);
    // Sylvie figure
    if (!gameState.getFlag('met_sylvie')) {
      const f = this.add.graphics();
      f.fillStyle(0x282010, 0.85); f.fillRect(W*0.48, H*0.45, 16, H*0.26);
      f.fillEllipse(W*0.488, H*0.42, 18, 22);
    }
    this.createDustMotes(14);
    return g;
  }

  buildHotspots(W, H) {
    // Camera — the key evidence
    this.addHotspot(W*0.54, H*0.38, W*0.1, H*0.16, {
      id: 'sylvie_camera', label: 'Examine Camera',
      dialogue: [
        'A digital camera on a tripod, aimed at the window.',
        'Set to interval mode — automatic shot every fifteen minutes.',
        'There\'s a full memory card in it.',
        'The view from here includes the driveway.',
        gameState.getFlag('sylvie_trust_gained')
          ? 'Sylvie said I could take the card. I remove it.'
          : 'I shouldn\'t take this without Sylvie\'s permission.'
      ],
      onActivate: (hotspot) => {
        if (gameState.getFlag('sylvie_trust_gained') && !gameState.hasClue('sylvie_camera_photos')) {
          setTimeout(() => {
            dialogueEngine.giveClue('sylvie_camera_photos');
            gameState.addItem(null); // no physical item, evidence only
            uiManager.updateBadges();
          }, 400);
        }
      }
    });

    // Journal on worktable
    this.addHotspot(W*0.22, H*0.51, W*0.16, H*0.13, {
      id: 'observation_journal', label: 'Read Journal',
      dialogue: gameState.getFlag('sylvie_trust_gained')
        ? ['October 14th: "N.\'s car left 9:43. Study light on. N. back 11:58. Light out 12:17."',
           'Written in her precise hand. She knew.']
        : ['A journal. I shouldn\'t read it without asking.'],
      onActivate: (hotspot) => {
        if (gameState.getFlag('sylvie_trust_gained')) {
          dialogueEngine.giveClue('observation_journal');
        }
      }
    });

    // Fairweather research
    this.addHotspot(W*0.79, H*0.33, W*0.13, H*0.18, {
      id: 'fairweather_file', label: 'Research Notes',
      clueId: 'fairweather_research',
      dialogue: [
        'Newspaper clippings, printouts. Ashwood Industries, 1995.',
        '"Partner ousted: fraud allegations." Photo of a man named Declan Fairweather.',
        'Below it, handwritten: "He\'s my father."',
        'Sylvie has been researching this alone.'
      ]
    });
  }
}
