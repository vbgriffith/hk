// ════════════════════════════════════════════════════════════
//  THE ASHWOOD INHERITANCE — Act 2-3 Scenes
//  Nathaniel's Room, Library East, Groundskeeper's Shed,
//  Dr. Crane's Office, Whitmore Bank, Declan's Study
// ════════════════════════════════════════════════════════════

// ── NATHANIEL'S ROOM ─────────────────────────────────────────
class NathanielRoomScene extends BaseScene {
  constructor() { super({ key: 'NathanielRoomScene' }); }

  create() {
    const { W, H } = this.baseCreate();
    this.sceneId = 'nathaniel_room';
    this.buildRoom(W, H);
    this.buildHotspots(W, H);
    this.addExitZone('foyer', '← Corridor', 0, H * 0.5, W * 0.1, H * 0.45);
    uiManager.showLocationBanner('nathaniel_room');

    if (!gameState.getFlag('met_nathaniel') && gameState.currentAct >= 2) {
      setTimeout(() => {
        gameState.setFlag('met_nathaniel', true);
        dialogueEngine.startConversation('nathaniel', 'nathaniel_intro');
      }, 1500);
    }
  }

  buildRoom(W, H) {
    const g = this.add.graphics();
    // Dark floor — polished
    g.fillStyle(0x0e0b06, 1); g.fillRect(0, H * 0.66, W, H * 0.34);
    g.lineStyle(0.4, 0x1a1208, 0.5);
    for (let x = 0; x < W; x += 50) g.lineBetween(x, H * 0.66, x, H);
    for (let y = H * 0.66; y < H; y += 50) g.lineBetween(0, y, W, y);
    // Walls — dark paint, controlled
    g.fillStyle(0x0a0c10, 1); g.fillRect(0, 0, W, H * 0.66);
    // Window — city-facing, curtains slightly open
    g.fillStyle(0x0a0e18, 1); g.fillRect(W * 0.62, H * 0.08, W * 0.14, H * 0.22);
    g.lineStyle(1, 0x242830, 0.7); g.strokeRect(W * 0.62, H * 0.08, W * 0.14, H * 0.22);
    g.fillStyle(0x080c16, 0.12); g.fillTriangle(W * 0.62, H * 0.3, W * 0.76, H * 0.3, W * 0.7, H * 0.66);
    // Curtains
    g.fillStyle(0x141210, 1); g.fillRect(W * 0.6, H * 0.06, W * 0.04, H * 0.28);
    g.fillStyle(0x141210, 1); g.fillRect(W * 0.76, H * 0.06, W * 0.04, H * 0.28);
    // Bed — made with military precision
    g.fillStyle(0x1a1814, 1); g.fillRect(W * 0.55, H * 0.42, W * 0.38, H * 0.25);
    g.fillStyle(0x242018, 1); g.fillRect(W * 0.55, H * 0.42, W * 0.38, H * 0.05); // pillow
    g.lineStyle(0.5, 0x302820, 0.5); g.strokeRect(W * 0.55, H * 0.42, W * 0.38, H * 0.25);
    // Bedside table — KEY CLUE LOCATION
    g.fillStyle(0x181410, 1); g.fillRect(W * 0.52, H * 0.48, W * 0.06, H * 0.18);
    g.lineStyle(0.5, 0x282010, 0.5); g.strokeRect(W * 0.52, H * 0.48, W * 0.06, H * 0.18);
    // Drawer handle — slight glint
    g.fillStyle(0x806040, 0.6); g.fillRect(W * 0.544, H * 0.56, W * 0.02, 3);
    // Desk — business-like, papers
    g.fillStyle(0x181610, 1); g.fillRect(W * 0.06, H * 0.5, W * 0.38, H * 0.16);
    g.lineStyle(0.5, 0x282010, 0.4); g.strokeRect(W * 0.06, H * 0.5, W * 0.38, H * 0.16);
    // Papers on desk — financial statements
    g.fillStyle(0xd0c8a0, 0.35); g.fillRect(W * 0.08, H * 0.51, W * 0.12, H * 0.06);
    g.fillStyle(0xc0b890, 0.3); g.fillRect(W * 0.14, H * 0.52, W * 0.12, H * 0.06);
    // Laptop (closed, dark)
    g.fillStyle(0x101010, 0.9); g.fillRect(W * 0.28, H * 0.51, W * 0.12, H * 0.06);
    g.lineStyle(0.5, 0x202020, 0.8); g.strokeRect(W * 0.28, H * 0.51, W * 0.12, H * 0.06);
    // Framed achievement/diploma on wall
    g.fillStyle(0x0c0a06, 1); g.fillRect(W * 0.08, H * 0.08, W * 0.18, H * 0.13);
    g.lineStyle(1.5, 0x504030, 0.6); g.strokeRect(W * 0.07, H * 0.07, W * 0.2, H * 0.15);
    // Whisky glass on desk — clue
    g.fillStyle(0x242018, 0.8); g.fillRect(W * 0.36, H * 0.51, 10, 14);
    g.fillStyle(0xd4a840, 0.2); g.fillRect(W * 0.361, H * 0.517, 8, 8);
    // Nathaniel figure if present
    if (!gameState.getFlag('nathaniel_dismissed')) {
      const f = this.add.graphics();
      f.fillStyle(0x101820, 0.9); f.fillRect(W * 0.1, H * 0.44, 20, H * 0.24);
      f.fillEllipse(W * 0.11, H * 0.40, 20, 24);
    }
    this.createDustMotes(5);
    return g;
  }

  buildHotspots(W, H) {
    // Locked nightstand — pharmacy receipt inside
    this.addHotspot(W * 0.51, H * 0.46, W * 0.08, H * 0.22, {
      id: 'nightstand_drawer', label: 'Check Drawer',
      dialogue: gameState.getFlag('nathaniel_dismissed')
        ? ['The drawer is locked. But Nathaniel isn\'t here now.', 'I take out my lock pick set.']
        : ['Nathaniel is in the room. I can\'t search while he\'s watching.'],
      onActivate: () => {
        if (gameState.getFlag('nathaniel_dismissed') && !gameState.hasClue('pharmacy_receipt')) {
          setTimeout(() => dialogueEngine.narrate([
            'The drawer yields to the pick in under a minute.',
            'Inside: a folded receipt. Greystone Compounding, Ltd. October 9th.',
            'And beneath that — a printed document. Elias\'s new will draft.',
            'A note in the margin: "Pending my disclosure."',
            'He knew. He\'d known for two weeks.'
          ], () => {
            dialogueEngine.giveClue('pharmacy_receipt');
            dialogueEngine.giveClue('new_will_draft');
            gameState.addItem('pharmacy_receipt');
            gameState.addItem('new_will_draft');
            uiManager.updateBadges();
            gameState.setFlag('nightstand_searched');
          }), 600);
        }
      }
    });

    // Financial papers on desk
    this.addHotspot(W * 0.06, H * 0.48, W * 0.38, H * 0.2, {
      id: 'nathaniel_papers', label: 'Examine Desk',
      clueId: gameState.getFlag('nathaniel_dismissed') ? 'debt_correspondence' : null,
      dialogue: gameState.getFlag('nathaniel_dismissed')
        ? ['Financial statements. Highlighted in red.', 'Three lines of credit, all maxed. A private gambling debt note — a firm in the city.', 'Seven hundred thousand, with a payment due in November.', 'He needed money. He needed it urgently.']
        : ['I\'d need him out of the room to really look at these.']
    });

    // The diploma on wall
    this.addHotspot(W * 0.06, H * 0.06, W * 0.22, H * 0.18, {
      id: 'nathaniel_diploma', label: 'Read Diploma',
      dialogue: ['"Nathaniel Elias Ashwood." Wharton MBA, 2006.', 'His name. A name his father built from nothing and gave to him.', 'Now it\'s going to be in every newspaper in the county.']
    });
  }
}

// ── LIBRARY EAST ─────────────────────────────────────────────
class LibraryEastScene extends BaseScene {
  constructor() { super({ key: 'LibraryEastScene' }); }

  create() {
    const { W, H } = this.baseCreate();
    this.sceneId = 'library_east';
    this.buildRoom(W, H);
    this.buildHotspots(W, H);
    this.addExitZone('foyer', '← Corridor', 0, H * 0.5, W * 0.1, H * 0.45);
    uiManager.showLocationBanner('library_east');
  }

  buildRoom(W, H) {
    const g = this.add.graphics();
    g.fillStyle(0x0c0a08, 1); g.fillRect(0, H * 0.66, W, H * 0.34);
    g.fillStyle(0x0a0906, 1); g.fillRect(0, 0, W, H * 0.66);
    // Floor boards
    g.lineStyle(0.4, 0x161208, 0.5);
    for (let x = 0; x < W; x += 38) g.lineBetween(x, H * 0.66, x, H);
    // Books — all four walls
    const bookC = [0x2a1206, 0x061420, 0x081808, 0x1a0c04, 0x120818, 0x200e06];
    for (let col = 0; col < 28; col++) {
      const c = bookC[col % bookC.length];
      g.fillStyle(c, 0.8); g.fillRect(col * 28, H * 0.04, 26, H * 0.58);
      g.lineStyle(0.3, 0x060402, 1); g.lineBetween(col * 28, H * 0.04, col * 28, H * 0.62);
      // Shelf lines every ~12%
      [0.2, 0.36, 0.52].forEach(yf => {
        g.lineStyle(0.5, 0x0a0806, 0.8); g.lineBetween(col * 28, H * yf, col * 28 + 28, H * yf);
      });
    }
    // Window — overlooks the study
    g.fillStyle(0x0a0e18, 1); g.fillRect(W * 0.38, H * 0.06, W * 0.18, H * 0.24);
    g.lineStyle(1.5, 0x202830, 0.7); g.strokeRect(W * 0.38, H * 0.06, W * 0.18, H * 0.24);
    g.lineBetween(W * 0.47, H * 0.06, W * 0.47, H * 0.3);
    g.lineBetween(W * 0.38, H * 0.18, W * 0.56, H * 0.18);
    // The study is visible — tiny amber square
    g.fillStyle(0xd4a840, 0.12); g.fillRect(W * 0.42, H * 0.1, 20, 14);
    // Reading chair
    g.fillStyle(0x1a1610, 1); g.fillRect(W * 0.34, H * 0.54, W * 0.14, H * 0.14);
    g.fillStyle(0x221e14, 1); g.fillRect(W * 0.34, H * 0.5, W * 0.14, H * 0.06);
    // Side table with book and teacup — Dorothea's alibi location
    g.fillStyle(0x181410, 1); g.fillRect(W * 0.5, H * 0.54, W * 0.06, H * 0.1);
    g.fillStyle(0xd8d0b8, 0.55); g.fillRect(W * 0.51, H * 0.53, W * 0.04, H * 0.025);
    // Teacup
    g.fillStyle(0xe0d8c0, 0.65); g.fillEllipse(W * 0.527, H * 0.548, 16, 8);
    g.fillStyle(0xd4a840, 0.2); g.fillEllipse(W * 0.527, H * 0.549, 12, 5);
    // Bookmark in book — chamomile tea placed here
    g.fillStyle(0xd4a840, 0.7); g.fillRect(W * 0.53, H * 0.528, 2, 16);
    // Dorothea alibi marker
    const da = this.add.graphics();
    da.fillStyle(0xc8882a, 0.15); da.fillCircle(W * 0.52, H * 0.55, 22);
    this.createDustMotes(12);
    this.createRain(10);
    return g;
  }

  buildHotspots(W, H) {
    this.addHotspot(W * 0.37, H * 0.05, W * 0.2, H * 0.27, {
      id: 'library_window_view', label: 'Look Out Window',
      clueId: 'library_window_view',
      dialogue: [
        'The window faces south — directly toward the study wing.',
        'From here, I can see the study window clearly.',
        'If someone was sitting in that reading chair... they could have seen into the study all evening.',
        'Or — they could have seen when the light went out.'
      ]
    });
    this.addHotspot(W * 0.48, H * 0.5, W * 0.1, H * 0.16, {
      id: 'dorothea_reading_spot', label: 'Examine Reading Spot',
      clueId: 'teacup_chamomile',
      dialogue: [
        'A reading chair. Recently used — the seat is slightly depressed.',
        'On the table: a half-finished cup of chamomile tea. Cold now.',
        'An open book, face-down to mark the page.',
        'And a bookmark that\'s slipped — only about forty pages in.',
        'She wasn\'t here long enough to be here all evening.'
      ]
    });
    this.addHotspot(W * 0.08, H * 0.04, W * 0.82, H * 0.62, {
      id: 'library_books', label: 'Browse Shelves',
      dialogue: [
        'Thousands of books. Acquired over decades — some original Ashwood purchases, some collected by Elias himself.',
        'One section stands out: Czech history and emigration, 1960s-1970s.',
        'He kept it close. Studied it, maybe. Tried to understand where he came from.',
        'Or tried to remember where he\'d buried it.'
      ]
    });
  }
}

// ── GROUNDSKEEPER'S SHED ─────────────────────────────────────
class GroundskeeperShedScene extends BaseScene {
  constructor() { super({ key: 'GroundskeeperShedScene' }); }

  create() {
    const { W, H } = this.baseCreate();
    this.sceneId = 'groundskeeper_shed';
    this.buildRoom(W, H);
    this.buildHotspots(W, H);
    this.addExitZone('manor_exterior', '← Grounds', 0, H * 0.5, W * 0.12, H * 0.45);
    uiManager.showLocationBanner('groundskeeper_shed');
  }

  buildRoom(W, H) {
    const g = this.add.graphics();
    // Dirt floor
    g.fillStyle(0x0c0a06, 1); g.fillRect(0, H * 0.7, W, H * 0.3);
    g.lineStyle(0.3, 0x100e08, 0.5);
    for (let i = 0; i < 20; i++) {
      g.lineBetween(Math.random()*W, H*0.7, Math.random()*W, H);
    }
    // Wooden walls
    g.fillStyle(0x100c06, 1); g.fillRect(0, 0, W, H * 0.7);
    g.lineStyle(1, 0x181008, 0.4);
    for (let x = 0; x < W; x += 55) g.lineBetween(x, 0, x, H * 0.7);
    // Tool rack
    g.fillStyle(0x0c0a06, 1); g.fillRect(W * 0.62, H * 0.08, W * 0.34, H * 0.52);
    const tools = [[W*0.65,H*0.1,4,H*0.32],[W*0.71,H*0.1,4,H*0.28],[W*0.77,H*0.1,5,H*0.3],[W*0.84,H*0.1,3,H*0.26]];
    tools.forEach(([tx,ty,tw,th]) => { g.fillStyle(0x282010,0.8); g.fillRect(tx,ty,tw,th); });
    // Shelf
    g.fillStyle(0x181008, 1); g.fillRect(0, H * 0.28, W * 0.58, H * 0.04);
    // Jars on shelf
    [W*0.05,W*0.12,W*0.19,W*0.28,W*0.37].forEach(jx => {
      g.fillStyle(0x1a2010, 0.8); g.fillEllipse(jx, H*0.25, 22, 28);
      g.lineStyle(0.5, 0x303828, 0.6); g.strokeEllipse(jx, H*0.25, 22, 28);
    });
    // Workbench — KEY ITEM LOCATION
    g.fillStyle(0x181008, 1); g.fillRect(W*0.04, H*0.5, W*0.5, H*0.2);
    g.lineStyle(0.5, 0x282010, 0.5); g.strokeRect(W*0.04, H*0.5, W*0.5, H*0.2);
    // Loose floorboard under workbench (subtle)
    g.fillStyle(0x0e0c08, 1); g.fillRect(W*0.1, H*0.68, W*0.2, H*0.04);
    g.lineStyle(1, 0x282010, 0.6); g.strokeRect(W*0.1, H*0.68, W*0.2, H*0.04);
    // High window — grey outside light
    g.fillStyle(0x0c1018, 1); g.fillRect(W*0.34, H*0.07, W*0.12, H*0.12);
    g.lineStyle(1, 0x202428, 0.5); g.strokeRect(W*0.34, H*0.07, W*0.12, H*0.12);
    this.createRain(15);
    this.createDustMotes(18);
    return g;
  }

  buildHotspots(W, H) {
    // The loose floorboard / tin box
    this.addHotspot(W*0.08, H*0.64, W*0.25, H*0.12, {
      id: 'tin_box', label: 'Check Floorboard',
      dialogue: ['One plank is slightly raised. Recently disturbed.', 'I lift it.'],
      onActivate: () => {
        if (!gameState.hasClue('safety_deposit_key')) {
          setTimeout(() => dialogueEngine.narrate([
            'A tin box wrapped in oilcloth.',
            'Inside: a small key stamped "Vault 114, Whitmore National Bank."',
            'And a photograph.',
            'A young man in his twenties. A Czech summer, by the look of the background.',
            'On the back, in pencil: "Tomas. 1969."',
            'Not Elias. Someone else who became Elias.',
          ], () => {
            dialogueEngine.giveClue('safety_deposit_key');
            gameState.addItem('safety_deposit_key');
            gameState.addItem('tomas_vey_photo');
            gameState.setFlag('shed_accessed', true);
            uiManager.updateBadges();
          }), 600);
        }
      }
    });
    this.addHotspot(W*0.03, H*0.48, W*0.52, H*0.24, {
      id: 'workbench_tools', label: 'Examine Workbench',
      dialogue: ['Tools. Fertilizer logs. A pair of work gloves.', 'The shed smells of earth and old wood.', 'Nothing unusual on the surface.']
    });
  }
}

// ── DR. CRANE'S OFFICE ───────────────────────────────────────
class CraneOfficeScene extends BaseScene {
  constructor() { super({ key: 'CraneOfficeScene' }); }

  create() {
    const { W, H } = this.baseCreate();
    this.sceneId = 'dr_crane_office';
    this.buildRoom(W, H);
    this.buildHotspots(W, H);
    this.addExitZone('whitmore_bank', 'Whitmore Bank →', W*0.85, H*0.6, W*0.15, H*0.3);
    this.addExitZone('manor_exterior', '← Return to Manor', 0, H*0.5, W*0.12, H*0.4);
    uiManager.showLocationBanner('dr_crane_office');

    if (!gameState.getFlag('met_crane')) {
      setTimeout(() => {
        gameState.setFlag('met_crane', true);
        dialogueEngine.startConversation('dr_crane', 'crane_intro');
      }, 1500);
    }
  }

  buildRoom(W, H) {
    const g = this.add.graphics();
    // Beige/clinical floor
    g.fillStyle(0x0e0d0a, 1); g.fillRect(0, H*0.66, W, H*0.34);
    g.lineStyle(0.4, 0x181610, 0.4);
    for (let x = 0; x < W; x += 60) g.lineBetween(x, H*0.66, x, H);
    for (let y = H*0.66; y < H; y += 60) g.lineBetween(0, y, W, y);
    // Walls — neutral, medical
    g.fillStyle(0x0d0d0c, 1); g.fillRect(0, 0, W, H*0.66);
    // Diplomas and certificates
    [[W*0.06,H*0.06],[W*0.26,H*0.06],[W*0.48,H*0.08]].forEach(([dx,dy]) => {
      g.fillStyle(0x0a0906, 1); g.fillRect(dx, dy, 80, 55);
      g.lineStyle(1, 0x484030, 0.6); g.strokeRect(dx-2, dy-2, 84, 59);
      g.fillStyle(0x605040, 0.35); g.fillRect(dx+8, dy+8, 64, 8);
      g.fillRect(dx+18, dy+22, 44, 4);
    });
    // Desk
    g.fillStyle(0x181610, 1); g.fillRect(W*0.2, H*0.5, W*0.5, H*0.16);
    g.lineStyle(0.5, 0x282010, 0.5); g.strokeRect(W*0.2, H*0.5, W*0.5, H*0.16);
    // Prescription log — KEY — with torn page
    g.fillStyle(0xe8e0d0, 0.65); g.fillRect(W*0.26, H*0.51, W*0.14, H*0.08);
    g.lineStyle(0.5, 0x302010, 0.5); g.strokeRect(W*0.26, H*0.51, W*0.14, H*0.08);
    g.lineStyle(0.4, 0x484030, 0.6);
    for (let l = 0; l < 5; l++) g.lineBetween(W*0.28, H*0.525+l*8, W*0.38, H*0.525+l*8);
    // Torn page edge — the giveaway
    g.lineStyle(1.5, 0x806040, 0.7);
    g.lineBetween(W*0.26, H*0.53, W*0.268, H*0.528);
    g.lineBetween(W*0.268, H*0.528, W*0.275, H*0.532);
    // Safe behind a painting reproduction — Monet
    g.fillStyle(0x0a0806, 1); g.fillRect(W*0.72, H*0.14, W*0.2, H*0.26);
    g.lineStyle(1, 0x504030, 0.5); g.strokeRect(W*0.71, H*0.13, W*0.22, H*0.28);
    // Painting tones — impressionist suggestion
    [0x304820,0x486038,0x284040,0x405830,0x385040].forEach((c, i) => {
      g.fillStyle(c, 0.5); g.fillEllipse(W*0.76+i*15, H*0.24+Math.sin(i)*8, 22, 18);
    });
    // Safe hint — slightly ajar painting edge
    g.lineStyle(1, 0x383028, 0.5);
    g.lineBetween(W*0.71, H*0.13, W*0.69, H*0.22);
    // Patient chair
    g.fillStyle(0x181410, 1); g.fillRect(W*0.06, H*0.52, W*0.12, H*0.16);
    g.fillStyle(0x201c14, 1); g.fillRect(W*0.06, H*0.5, W*0.12, H*0.04);
    // Dr. Crane figure if present
    if (!gameState.getFlag('crane_confronted')) {
      const f = this.add.graphics();
      f.fillStyle(0xe0d8c8, 0.75); f.fillRect(W*0.42, H*0.5, 18, H*0.16);
      f.fillEllipse(W*0.429, H*0.46, 18, 22);
    }
    this.createDustMotes(6);
    return g;
  }

  buildHotspots(W, H) {
    // Prescription log
    this.addHotspot(W*0.24, H*0.49, W*0.18, H*0.12, {
      id: 'prescription_log', label: 'Examine Log',
      clueId: 'torn_log_page',
      dialogue: [
        'A prescription log. Current year.',
        'October entries — I run my finger down.',
        'Then I stop.',
        'There\'s a gap. A clean tear where a page should be.',
        'October 7th through 9th — gone.',
        'Someone removed it.'
      ]
    });

    // Safe behind painting
    this.addHotspot(W*0.7, H*0.12, W*0.24, H*0.3, {
      id: 'office_safe', label: 'Examine Painting',
      dialogue: gameState.getFlag('crane_confronted')
        ? ['Crane gave me the combination. Four digits: the year he graduated.']
        : ['A reproduction. Slightly crooked.', 'There\'s a safe behind it.', 'I\'ll need Crane to cooperate to get it open.'],
      onActivate: () => {
        if (gameState.getFlag('crane_confronted') && !gameState.hasClue('toxicology_results')) {
          setTimeout(() => dialogueEngine.narrate([
            'The safe opens.',
            'A single sealed envelope. Inside: a toxicology report.',
            '"Private — not for case file."',
            'Digitalis derivative. In Elias Ashwood\'s preserved blood sample.',
            'Crane ran the test three days after the death. He knew.',
            'He signed the death certificate anyway.'
          ], () => {
            dialogueEngine.giveClue('toxicology_results');
            gameState.addItem('toxicology_report');
            gameState.setFlag('toxicology_obtained');
            uiManager.updateBadges();
            audioManager.playStingerFX();
          }), 600);
        }
      }
    });
  }
}

// ── WHITMORE BANK ────────────────────────────────────────────
class WhitmoreBankScene extends BaseScene {
  constructor() { super({ key: 'WhitmoreBankScene' }); }

  create() {
    const { W, H } = this.baseCreate();
    this.sceneId = 'whitmore_bank';
    this.buildRoom(W, H);
    this.buildHotspots(W, H);
    this.addExitZone('dr_crane_office', '← Crane\'s Office', W*0.02, H*0.25, W*0.12, H*0.3);
    this.addExitZone('manor_exterior', '← Return to Manor', W*0.02, H*0.55, W*0.12, H*0.3);
    uiManager.showLocationBanner('whitmore_bank');
  }

  buildRoom(W, H) {
    const g = this.add.graphics();
    // Marble floor — stone cold
    g.fillStyle(0x100f0e, 1); g.fillRect(0, H*0.66, W, H*0.34);
    g.lineStyle(0.4, 0x1c1a18, 0.5);
    for (let x = 0; x < W; x += 80) g.lineBetween(x, H*0.66, x, H);
    for (let y = H*0.66; y < H; y += 80) g.lineBetween(0, y, W, y);
    // Walls — institutional dark
    g.fillStyle(0x0c0c0e, 1); g.fillRect(0, 0, W, H*0.66);
    // Bank counter
    g.fillStyle(0x181818, 1); g.fillRect(W*0.15, H*0.35, W*0.7, H*0.15);
    g.fillStyle(0x202020, 1); g.fillRect(W*0.15, H*0.32, W*0.7, H*0.04);
    g.lineStyle(0.5, 0x303030, 0.7); g.strokeRect(W*0.15, H*0.35, W*0.7, H*0.15);
    // Vault door — heavy, iron, old
    g.fillStyle(0x141414, 1); g.fillRect(W*0.34, H*0.08, W*0.32, H*0.28);
    g.lineStyle(2, 0x484840, 0.7); g.strokeRect(W*0.34, H*0.08, W*0.32, H*0.28);
    // Vault handle
    g.fillStyle(0x606050, 0.8); g.fillCircle(W*0.62, H*0.22, 14);
    g.fillStyle(0x404038, 1); g.fillCircle(W*0.62, H*0.22, 8);
    // Spoke handles on vault
    for (let a = 0; a < 6; a++) {
      const ang = (a/6)*Math.PI*2;
      g.lineStyle(2, 0x606050, 0.7);
      g.lineBetween(W*0.62, H*0.22, W*0.62+Math.cos(ang)*20, H*0.22+Math.sin(ang)*20);
    }
    // Vault number plate
    g.fillStyle(0xc8b880, 0.4); g.fillRect(W*0.45, H*0.1, W*0.1, H*0.03);
    // Safety deposit box table — the moment of revelation
    g.fillStyle(0x181616, 1); g.fillRect(W*0.3, H*0.52, W*0.4, H*0.14);
    g.lineStyle(0.5, 0x282624, 0.5); g.strokeRect(W*0.3, H*0.52, W*0.4, H*0.14);
    // The open box on table
    g.fillStyle(0x202020, 0.9); g.fillRect(W*0.36, H*0.53, W*0.12, H*0.07);
    g.lineStyle(1, 0x484840, 0.8); g.strokeRect(W*0.36, H*0.53, W*0.12, H*0.07);
    // Papers inside box — the deeds
    g.fillStyle(0xd4c8a8, 0.6); g.fillRect(W*0.37, H*0.535, W*0.1, H*0.05);
    // Old letter — slightly yellowed
    g.fillStyle(0xddd0a8, 0.5); g.fillRect(W*0.5, H*0.535, W*0.08, H*0.05);
    this.createDustMotes(8);
    return g;
  }

  buildHotspots(W, H) {
    // The vault / safety deposit box
    this.addHotspot(W*0.32, H*0.5, W*0.38, H*0.18, {
      id: 'vault_114', label: 'Open Vault 114',
      onActivate: () => {
        if (!gameState.hasClue('jonas_letter_1972')) {
          setTimeout(() => dialogueEngine.narrate([
            'Vault 114.',
            'The key turns.',
            'The box contains two things.',
            'The first: a set of land deeds. Two versions of the same document — one original, one forged.',
            'The names are different. One says "Calwell." One says "Ashwood."',
            'They are identical except for that.'
          ], () => {
            dialogueEngine.giveClue('stolen_deeds');
            setTimeout(() => dialogueEngine.narrate([
              'The second item is a letter.',
              'Dated 1972. Written by someone named Jonas Merrill.',
              '"I thought I was helping him survive. I didn\'t know I was building his throne."',
              '"His name was Tomas Vey. I helped him take the dead man\'s name."',
              '"He said it was temporary. That was fifty-four years ago."',
              '"I kept this in case anyone ever needed to know the truth."',
              '"I kept this because I couldn\'t carry it alone."'
            ], () => {
              dialogueEngine.giveClue('jonas_letter_1972');
              gameState.addItem('confession_letter');
              gameState.setFlag('bank_visited', true);
              gameState.setFlag('true_identity_known', true);
              uiManager.updateBadges();
              audioManager.playStingerFX();
            }), 1200);
          }), 600);
        }
      }
    });
  }
}

// ── DECLAN FAIRWEATHER'S STUDY ───────────────────────────────
class DeclanStudyScene extends BaseScene {
  constructor() { super({ key: 'DeclanStudyScene' }); }

  create() {
    const { W, H } = this.baseCreate();
    this.sceneId = 'declan_study';
    this.buildRoom(W, H);
    this.buildHotspots(W, H);
    this.addExitZone('whitmore_bank', '← Whitmore', 0, H*0.5, W*0.12, H*0.4);
    uiManager.showLocationBanner('declan_study');

    if (!gameState.getFlag('declan_visited')) {
      setTimeout(() => {
        gameState.setFlag('declan_visited', true);
        dialogueEngine.startConversation('declan', 'declan_intro');
      }, 1600);
    }
  }

  buildRoom(W, H) {
    const g = this.add.graphics();
    g.fillStyle(0x0e0c0a, 1); g.fillRect(0, H*0.66, W, H*0.34);
    g.fillStyle(0x0a0906, 1); g.fillRect(0, 0, W, H*0.66);
    // Warm but worn — a man who used to have more
    g.lineStyle(0.4, 0x181208, 0.5);
    for (let x = 0; x < W; x += 40) g.lineBetween(x, H*0.66, x, H);
    // Books — fewer, personal
    for (let col = 0; col < 8; col++) {
      const c = [0x2a1206,0x1a0c04,0x0c1408,0x200e06][col%4];
      g.fillStyle(c, 0.7); g.fillRect(col*35, H*0.08, 33, H*0.5);
      g.lineStyle(0.3, 0x060402, 1); g.lineBetween(col*35, H*0.08, col*35, H*0.58);
    }
    // Desk — well-used, modest
    g.fillStyle(0x1a1208, 1); g.fillRect(W*0.34, H*0.44, W*0.5, H*0.2);
    g.lineStyle(0.5, 0x282010, 0.5); g.strokeRect(W*0.34, H*0.44, W*0.5, H*0.2);
    // Old photos on desk — Elias, Declan, young
    g.fillStyle(0xd0c8a8, 0.45); g.fillRect(W*0.36, H*0.45, 55, 45);
    g.lineStyle(0.5, 0x504030, 0.5); g.strokeRect(W*0.36, H*0.45, 55, 45);
    g.fillStyle(0x201810, 0.7); g.fillEllipse(W*0.375, H*0.47, 18, 22); // figure 1
    g.fillEllipse(W*0.415, H*0.47, 18, 22); // figure 2
    // Letter stack — correspondence
    g.fillStyle(0xd8d0a8, 0.4); g.fillRect(W*0.5, H*0.45, W*0.12, H*0.07);
    // Whisky (neat, untouched)
    g.fillStyle(0x282010, 0.7); g.fillRect(W*0.76, H*0.45, 12, 18);
    g.fillStyle(0xd4a840, 0.25); g.fillRect(W*0.761, H*0.455, 10, 11);
    // Window — modest flat view, rainy
    g.fillStyle(0x0a0c14, 1); g.fillRect(W*0.7, H*0.08, W*0.22, H*0.22);
    g.lineStyle(1, 0x182028, 0.6); g.strokeRect(W*0.7, H*0.08, W*0.22, H*0.22);
    // Declan figure if present
    if (!gameState.getFlag('declan_visited')) {
      const f = this.add.graphics();
      f.fillStyle(0x282010, 0.85); f.fillRect(W*0.42, H*0.43, 18, H*0.25);
      f.fillEllipse(W*0.429, H*0.39, 20, 24);
    }
    this.createRain(12);
    this.createDustMotes(10);
    return g;
  }

  buildHotspots(W, H) {
    this.addHotspot(W*0.34, H*0.43, W*0.52, H*0.24, {
      id: 'declan_desk', label: 'Examine Desk',
      clueId: 'fairweather_research',
      dialogue: [
        'The photograph on his desk shows two young men.',
        'One of them I recognize as a younger Elias — or rather, as Tomas Vey.',
        'Declan hasn\'t changed that much.',
        'The photo is dated 1988. Before everything fell apart.',
        'He kept it all these years.'
      ]
    });
  }
}
