/**
 * STRATA — EndingScene  (Phase 6)
 *
 * Four endings, four visual treatments, one shared truth.
 *
 * 'archivist'   — Maren was filed. She becomes part of the archive.
 * 'exit'        — Maren escaped before filing. Ambiguous. Callum is still in there.
 * 'opendoor'    — Maren found the shutdown, returned to Oswin, used it. Callum is freed.
 * 'cartographer'— Day 40. The Cartographer mapped the way out. Oswin knew.
 *
 * All endings end with:
 *  - Maren's final note
 *  - A long pause
 *  - A prompt: [start over] [stay here]
 */
class EndingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndingScene' });
    this._ending    = null;
    this._phase     = 'intro';   // 'intro' | 'note' | 'final' | 'prompt'
    this._noteChars = 0;
    this._noteText  = '';
    this._g         = null;
  }

  // ---------------------------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------------------------
  create() {
    const W = this.scale.width, H = this.scale.height;
    this._W = W; this._H = H;

    this._ending = StateManager.get('endingUnlocked') || 'exit';
    StateManager.set('gameComplete', true);
    StateManager.save();

    this._g = this.add.graphics().setDepth(0);

    switch (this._ending) {
      case 'archivist':    this._buildArchivist();    break;
      case 'exit':         this._buildExit();         break;
      case 'opendoor':     this._buildOpendoor();     break;
      case 'cartographer': this._buildCartographer(); break;
      default:             this._buildExit();
    }

    // ESC / click after prompt appears: restart
    this.input.keyboard.on('keydown-ESC', () => {
      if (this._phase === 'prompt') this._restart();
    });
  }

  // ---------------------------------------------------------------------------
  // ARCHIVIST ENDING
  // "She became part of the archive."
  // Layer 4 aesthetic — void, her note materialises as fragment among fragments.
  // ---------------------------------------------------------------------------
  _buildArchivist() {
    const W = this._W, H = this._H;
    const g = this._g;
    g.fillStyle(0x020408, 1).fillRect(0, 0, W, H);

    // Recreate the 8 fragment boxes very faintly
    const positions = [
      [0.10, 0.14], [0.68, 0.09], [0.54, 0.58], [0.14, 0.53],
      [0.78, 0.43], [0.28, 0.78], [0.59, 0.23], [0.24, 0.33]
    ];
    positions.forEach(([px, py]) => {
      g.lineStyle(0.4, 0x1a3a2a, 0.2).strokeRect(W*px, H*py, 210, 64);
    });

    // Existing fragment labels — barely visible
    const oldFragments = [
      '// project ECHO — 1993', 'MEMORANDUM', 'subject_callum_w',
      '// holm_p note 2005', 'PROJECT ATLAS — 1998',
      'ida_crane@[REDACTED]', 'LUMEN COLLECTIVE', '// unknown origin'
    ];
    oldFragments.forEach(([px, py, txt], i) => {
      const pos = positions[i];
      this.add.text(W*pos[0], H*pos[1], oldFragments[i], {
        fontFamily:'monospace', fontSize:'9px', color:'#1a3a2a', lineSpacing:2
      }).setAlpha(0.15).setDepth(3);
    });

    // "new entry" — Maren's fragment — starts invisible, materialises
    const mx = W * 0.42, my = H * 0.45;
    const marenBox = this.add.graphics().setDepth(4);
    const marenText = this.add.text(mx, my, '', {
      fontFamily:'monospace', fontSize:'9px', color:'#2a6a4a', lineSpacing:2
    }).setAlpha(0).setDepth(5);

    const marenFinal = [
      '// maren_voss — 2024',
      '// role: investigator > external',
      '// status: filed',
      '',
      '// she read all of it.',
      '// she knows what this is.',
      '// she chose to stay long enough',
      '// to be counted.',
    ].join('\n');

    // Intro pause, then materialise
    this.time.delayedCall(1800, () => {
      marenBox.lineStyle(0.8, 0x2a6a4a, 0.5).strokeRect(mx - 2, my - 2, 214, 86);
      this.tweens.add({ targets: marenText, alpha: 1, duration: 1200, ease: 'Sine.easeIn',
        onComplete: () => {
          Typography.typewrite(this, marenText, marenFinal, 25, () => {
            this.time.delayedCall(2400, () => this._showFinalNote(
              'I am in the archive now.\n\n' +
              'Not as a researcher. As data.\n\n' +
              "I don't know if that's what I intended.\n\n" +
              "Callum is still in here. I'm going to find him.\n\n" +
              "The archive is very large.\n\n" +
              "I have time."
            ));
          });
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // EXIT ENDING
  // "She left. The cursor blinks."
  // CadenceOS reboots. Files are still there. Anomaly files are gone. New doc open.
  // ---------------------------------------------------------------------------
  _buildExit() {
    const W = this._W, H = this._H;
    const g = this._g;
    g.fillStyle(0x1c1c1e, 1).fillRect(0, 0, W, H);

    // Taskbar
    g.fillStyle(0x111113, 1).fillRect(0, H - 28, W, 28);

    // Single open window — a text document
    const winX = W * 0.22, winY = H * 0.12;
    const winW = W * 0.56, winH = H * 0.7;
    g.fillStyle(0x2c2c2e, 1).fillRoundedRect(winX, winY, winW, winH, 6);
    g.lineStyle(1, 0x48484a, 0.8).strokeRoundedRect(winX, winY, winW, winH, 6);

    // Window titlebar
    g.fillStyle(0x3a3a3c, 1).fillRoundedRect(winX, winY, winW, 28, 6);
    g.fillStyle(0x3a3a3c, 1).fillRect(winX, winY + 14, winW, 14);

    // Traffic lights
    [0xc0392b, 0xe67e22, 0x27ae60].forEach((c, i) => {
      g.fillStyle(c, 0.8).fillCircle(winX + 16 + i * 18, winY + 14, 5);
    });

    this.add.text(winX + winW/2, winY + 8, 'document_final.txt', {
      fontFamily:'monospace', fontSize:'11px', color:'#8e8e93'
    }).setOrigin(0.5, 0).setDepth(2);

    // Document body — typewritten gradually
    const docText = this.add.text(winX + 24, winY + 42, '', {
      fontFamily:'monospace', fontSize:'12px', color:'#e5e0d5',
      lineSpacing:6, wordWrap:{width: winW - 48}
    }).setDepth(3);

    // Blinking cursor
    const cur = this.add.rectangle(winX + 24, winY + 42, 8, 14, 0xd4a853, 0.8)
      .setOrigin(0, 0).setDepth(4);
    this.tweens.add({targets:cur, alpha:0, duration:530, yoyo:true, repeat:-1, ease:'Stepped'});

    // Small clock on taskbar
    const now = new Date();
    this.add.text(W - 16, H - 14, `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`, {
      fontFamily:'monospace', fontSize:'10px', color:'#8e8e93'
    }).setOrigin(1, 0.5).setDepth(2);

    // Boot sequence — brief, then document types itself
    const bootLines = [
      'cadenceos rebooting...',
      'session: voss_m',
      'anomaly files: [cleared]',
      'previous session: intact',
      'ready.',
    ];

    const bootText = this.add.text(winX + 24, winY + 42, '', {
      fontFamily:'monospace', fontSize:'11px', color:'#5e9e8a', lineSpacing:4
    }).setDepth(5);

    let bi = 0;
    const showBoot = () => {
      if (bi >= bootLines.length) {
        this.time.delayedCall(800, () => {
          bootText.destroy();
          cur.setPosition(winX + 24, winY + 42);
          Typography.typewrite(this, docText,
            "notes — final session\n\n" +
            "I left before they could finish.\n\n" +
            "I don't know if that was the right thing.\n\n" +
            "Callum Wrest. 58 years old. Lives in Graz.\n" +
            "Has a dog named Halverstrom.\n" +
            "Thinks a study he participated in ended in 2005.\n\n" +
            "It didn't end.\n\n" +
            "I need to make some calls.",
            28,
            () => {
              cur.setVisible(false);
              this.time.delayedCall(2800, () => this._showFinalNote(
                "I escaped.\n\n" +
                "I don't know if that word is right.\n\n" +
                "The archive still has Callum.\n" +
                "I'm still outside.\n\n" +
                "Those are the facts.\n\n" +
                "I have a phone number.\n" +
                "I have a name.\n\n" +
                "That's enough to start."
              ));
            }
          );
        });
        return;
      }
      bootText.setText(bootLines.slice(0, bi + 1).join('\n'));
      bi++;
      this.time.delayedCall(bi === bootLines.length - 1 ? 600 : 200, showBoot);
    };

    this.time.delayedCall(600, showBoot);
  }

  // ---------------------------------------------------------------------------
  // OPENDOOR ENDING
  // "He showed her the door."
  // Veldenmoor, corruption peels back as shutdown runs. Sky clears. Oswin's smile
  // returns. Then everything fades to white.
  // ---------------------------------------------------------------------------
  _buildOpendoor() {
    const W = this._W, H = this._H;

    // Rebuild a simplified Veldenmoor at high corruption
    this._drawVeldenmoor(0.85);

    // Oswin — facing forward, small, at market position
    const oxw = W * 0.35, oyw = H * 0.52;
    const oswinG = this.add.graphics().setDepth(10);
    this._drawOswinSimple(oswinG, oxw, oyw, 0.85);

    // Dialogue box — Oswin's final words
    this.time.delayedCall(800, () => {
      this._showDialogueBox(
        'OSWIN',
        "You found the shutdown sequence.\n\nYou came back here instead of using it alone.\n\nThat was the right thing to do.",
        () => {
          this._showDialogueBox(
            'OSWIN',
            "The exit was always here. Ida built it in.\n\nI know what I am. I have known for a long time.\n\nThank you for asking if I was alright.",
            () => {
              this._showDialogueBox(
                'OSWIN',
                "Run it.\n\nI'll be here while it runs.\n\nI will not be here after.",
                () => this._runShutdown(oswinG, oxw, oyw)
              );
            }
          );
        }
      );
    });
  }

  _runShutdown(oswinG, ox, oy) {
    const W = this._W, H = this._H;

    // Corruption peels back — redraw Veldenmoor progressively cleaner
    let corruption = 0.85;
    const cleanInterval = this.time.addEvent({
      delay: 80,
      repeat: 30,
      callback: () => {
        corruption = Math.max(0, corruption - 0.03);
        this._g.clear();
        this._drawVeldenmoor(corruption);
        oswinG.clear();
        this._drawOswinSimple(oswinG, ox, oy, corruption);
        if (corruption <= 0) {
          cleanInterval.remove();
          // Oswin at full width — warm, clear sky
          this.time.delayedCall(600, () => {
            this._showDialogueBox(
              'OSWIN',
              "...\n\n...there.\n\nHe will wake up now.",
              () => {
                this.time.delayedCall(400, () => {
                  this._showFinalNote(
                    "The sky is the right colour again.\n\n" +
                    "Oswin is smiling.\n" +
                    "Fully. The way he did before I knew what he was.\n\n" +
                    "I pressed Execute.\n\n" +
                    "PILGRIM ended at 11:47pm on a Tuesday.\n" +
                    "38,447 players lost their save data.\n" +
                    "Callum Wrest woke up the next morning\n" +
                    "and could not find his way around his own neighbourhood.\n\n" +
                    "He called it a miracle.\n\n" +
                    "He said it felt like putting something down\n" +
                    "he had been carrying for twenty years."
                  );
                });
              }
            );
          });
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // CARTOGRAPHER ENDING
  // "He mapped it. She brought the map to Oswin."
  // Starts in Halverstrom (Layer 3 aesthetic), the city brightens,
  // then cuts to Veldenmoor for the same Oswin goodbye.
  // ---------------------------------------------------------------------------
  _buildCartographer() {
    const W = this._W, H = this._H;
    const g = this._g;

    // Layer 3 aesthetic — the city
    g.fillStyle(0x04060a, 1).fillRect(0, 0, W, H);
    this._drawHalverstromLines(0.0);

    // The Cartographer's map — glowing gently at screen centre
    const mx = W / 2 - 50, my = H / 2 - 33;
    const mapG = this.add.graphics().setDepth(10);
    mapG.lineStyle(1.2, 0x4a8aba, 0.9).strokeRect(mx, my, 100, 66);
    mapG.lineStyle(0.4, 0x2a5080, 0.5);
    for (let i = 1; i < 5; i++) mapG.lineBetween(mx+i*20, my, mx+i*20, my+66);
    for (let i = 1; i < 3; i++) mapG.lineBetween(mx, my+i*22, mx+100, my+i*22);
    [[0,0],[0,2],[0,4],[1,1],[1,3],[2,0],[2,2],[2,4]].forEach(([r,c]) => {
      mapG.fillStyle(0x4a8aba, 0.9).fillCircle(mx+c*20+10, my+r*22+11, 3);
    });

    this.add.text(W/2, my + 78, 'layer 4 — complete', {
      fontFamily:'monospace', fontSize:'8px', color:'#3a6a9a', align:'center'
    }).setOrigin(0.5, 0).setDepth(11);

    // Brief pause — look at the map
    this.time.delayedCall(2200, () => {
      StateManager.addMarenNote(
        "I took the map.\n" +
        "He let me take it.\n" +
        "He stood at the plaza and watched me leave."
      );

      // Fade to Veldenmoor
      const fade = this.add.graphics().setDepth(500);
      this.tweens.addCounter({
        from:0, to:1, duration:1400, ease:'Sine.easeIn',
        onUpdate: t => { fade.clear(); fade.fillStyle(0x04060a,t.getValue()).fillRect(0,0,W,H); },
        onComplete: () => {
          fade.clear();
          g.clear();
          g.fillStyle(0x0a0906, 1).fillRect(0, 0, W, H);
          mapG.clear();
          this._drawVeldenmoor(0.3);

          const ox = W * 0.35, oy = H * 0.52;
          const oswinG = this.add.graphics().setDepth(10);
          this._drawOswinSimple(oswinG, ox, oy, 0.3);

          this.time.delayedCall(600, () => {
            this._showDialogueBox(
              'OSWIN',
              "I see you have Holm's map.\n\nThe Cartographer gave you this.",
              () => {
                this._showDialogueBox(
                  'OSWIN',
                  "He has been walking for forty days.\n\nFor you. He did not know it was for you.\n\nBut it was.",
                  () => {
                    this._showDialogueBox(
                      'OSWIN',
                      "Now.\n\nUse the shutdown sequence.\n\nI have been waiting a very long time for someone patient enough to find both paths.",
                      () => this._runShutdown(oswinG, ox, oy)
                    );
                  }
                );
              }
            );
          });
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // SHARED FINAL NOTE + PROMPT
  // ---------------------------------------------------------------------------
  _showFinalNote(text) {
    this._phase = 'note';
    const W = this._W, H = this._H;

    // Dark overlay
    const ov = this.add.graphics().setDepth(200);
    ov.fillStyle(0x000000, 0).fillRect(0, 0, W, H);
    this.tweens.addCounter({
      from:0, to:0.85, duration:1200, ease:'Sine.easeIn',
      onUpdate: t => { ov.clear(); ov.fillStyle(0x000000, t.getValue()).fillRect(0,0,W,H); }
    });

    // Note text
    const noteT = this.add.text(W/2, H * 0.38, '', {
      fontFamily:'monospace', fontSize:'13px', color:'#d4a853',
      lineSpacing:8, wordWrap:{width: W * 0.52}, align:'center'
    }).setOrigin(0.5, 0).setAlpha(0).setDepth(210);

    this.time.delayedCall(900, () => {
      noteT.setAlpha(1);
      Typography.typewrite(this, noteT, text, 22, () => {
        this.time.delayedCall(2200, () => this._showEndPrompt());
      });
    });
  }

  _showEndPrompt() {
    this._phase = 'prompt';
    const W = this._W, H = this._H;

    // Ending title
    const titles = {
      archivist:    'ENDING: THE ARCHIVIST',
      exit:         'ENDING: THE EXIT',
      opendoor:     'ENDING: THE OPEN DOOR',
      cartographer: 'ENDING: THE CARTOGRAPHER',
    };

    this.add.text(W/2, H * 0.78, titles[this._ending] || 'ENDING', {
      fontFamily:'monospace', fontSize:'10px', color:'#4a4540', letterSpacing:4
    }).setOrigin(0.5, 0).setAlpha(0).setDepth(215)
      .setAlpha(1);

    // Flags summary — what Maren accomplished
    const summary = this._buildSummary();
    if (summary) {
      this.add.text(W/2, H * 0.84, summary, {
        fontFamily:'monospace', fontSize:'9px', color:'#3a3530', lineSpacing:3, align:'center'
      }).setOrigin(0.5, 0).setDepth(215);
    }

    // Prompt
    const promptT = this.add.text(W/2, H * 0.92, '[ESC / click]  start over', {
      fontFamily:'monospace', fontSize:'11px', color:'#5a5550'
    }).setOrigin(0.5, 0).setDepth(215);

    // Blink
    this.tweens.add({targets:promptT, alpha:{from:1,to:0.2}, duration:900, yoyo:true, repeat:-1});

    // Click to restart
    this.input.on('pointerdown', () => {
      if (this._phase === 'prompt') this._restart();
    });
  }

  _buildSummary() {
    const lines = [];
    if (StateManager.hasFlag('canarySolved'))           lines.push('canary: solved');
    if (StateManager.hasFlag('idaShutdownFound'))       lines.push("ida's shutdown: found");
    if (StateManager.hasFlag('knows_callum_is_substrate')) lines.push('callum: identified');
    if (StateManager.hasFlag('cartographer_spoken_to')) lines.push('cartographer: spoken to');
    if (StateManager.hasFlag('maren_filed'))            lines.push('maren: filed');
    if (StateManager.hasFlag('escaped_before_filing'))  lines.push('maren: escaped');
    if (StateManager.get('cartographerDays') >= 40)    lines.push(`patience: day ${StateManager.get('cartographerDays')}`);
    const pt = Math.floor((StateManager.get('playTime') || 0) / 60);
    lines.push(`play time: ${pt}m`);
    return lines.join('   \u00b7   ');
  }

  _restart() {
    SaveSystem.wipe();
    StateManager.init();
    this.scene.start('BootScene');
  }

  // ---------------------------------------------------------------------------
  // HELPER: Dialogue box (no DialogueEngine — ending has its own simplified version)
  // ---------------------------------------------------------------------------
  _showDialogueBox(speaker, text, onDone) {
    const W = this._W, H = this._H;
    const bx = 60, by = H - 160, bw = W - 120, bh = 120;
    const SPEAKER_COLORS = { 'OSWIN': '#5e9e8a', 'MAREN': '#d4a853' };

    const bg = this.add.graphics().setDepth(300);
    bg.fillStyle(0x1a1a1c, 0.96).fillRoundedRect(bx, by, bw, bh, 6);
    bg.lineStyle(1, 0x3a3a3e, 0.8).strokeRoundedRect(bx, by, bw, bh, 6);

    const nameT = this.add.text(bx + 16, by + 10, speaker, {
      fontFamily:'monospace', fontSize:'12px', fontStyle:'bold',
      color: SPEAKER_COLORS[speaker] || '#ffffff'
    }).setDepth(301);

    const bodyT = this.add.text(bx + 16, by + 30, '', {
      fontFamily:'monospace', fontSize:'13px', color:'#e5e0d5',
      lineSpacing:5, wordWrap:{width: bw - 32}
    }).setDepth(301);

    const cont = this.add.text(bx + bw - 24, by + bh - 18, '\u25b6', {
      fontFamily:'monospace', fontSize:'10px', color:'#d4a853'
    }).setDepth(301).setAlpha(0);
    this.tweens.add({targets:cont, alpha:{from:0,to:1}, duration:500, yoyo:true, repeat:-1});

    let done = false;
    const advance = () => {
      if (done) return;
      done = true;
      bg.destroy(); nameT.destroy(); bodyT.destroy(); cont.destroy();
      this.input.keyboard.off('keydown-SPACE', advance);
      this.input.off('pointerdown', advance);
      if (onDone) onDone();
    };

    Typography.typewrite(this, bodyT, text, 28, () => cont.setAlpha(1));

    // Advance on space or click (after 400ms delay to avoid instant skip)
    this.time.delayedCall(400, () => {
      this.input.keyboard.once('keydown-SPACE', advance);
      this.input.once('pointerdown', advance);
    });
  }

  // ---------------------------------------------------------------------------
  // HELPER: Simplified Veldenmoor renderer (for opendoor/cartographer endings)
  // ---------------------------------------------------------------------------
  _drawVeldenmoor(corruption) {
    const W = this._W, H = this._H, g = this._g;

    // Sky
    const skyA = Palette.lerp(0xa8d8ea, 0x2a2830, Math.min(1, corruption * 1.4));
    const skyB = Palette.lerp(0x7ec8e0, 0x1a1820, Math.min(1, corruption * 1.4));
    g.fillStyle(skyA, 1).fillRect(0, 0, W, H * 0.48);
    g.fillStyle(skyB, 1).fillRect(0, H * 0.48, W, H * 0.52);

    // Ground
    const groundC = Palette.lerp(0x8b7355, 0x2a2420, corruption * 0.6);
    g.fillStyle(groundC, 1).fillRect(0, H * 0.62, W, H * 0.38);

    // A few buildings (simplified)
    const wallC = Palette.lerp(0xc8b898, 0x403830, corruption * 0.6);
    const roofC = Palette.lerp(0x8b6050, 0x302820, corruption * 0.6);
    [[0.05, 0.36, 0.12, 0.26], [0.18, 0.4, 0.1, 0.22],
     [0.72, 0.38, 0.1, 0.24], [0.84, 0.35, 0.13, 0.27]].forEach(([bx,by,bw,bh]) => {
      g.fillStyle(wallC, 1).fillRect(W*bx, H*by, W*bw, H*bh);
      g.fillStyle(roofC, 1).fillTriangle(
        W*bx, H*by, W*(bx+bw), H*by, W*(bx+bw/2), H*(by-0.06)
      );
    });

    // Cobblestones (just a pattern)
    const stoneC = Palette.lerp(0xb0a090, 0x302820, corruption * 0.5);
    g.lineStyle(0.6, stoneC, 0.3 * (1 - corruption * 0.5));
    for (let i = 0; i < 12; i++) g.lineBetween(W*0.1 + i*W*0.07, H*0.62, W*0.1 + i*W*0.07, H);
    for (let j = 0; j < 8; j++) g.lineBetween(W*0.1, H*0.64 + j*18, W*0.9, H*0.64 + j*18);

    // Sun (hidden above 0.7 corruption)
    if (corruption < 0.7) {
      const sunAlpha = 1 - corruption / 0.7;
      const sunC = Palette.lerp(0xffe080, 0xe06030, corruption);
      g.fillStyle(sunC, sunAlpha * 0.9).fillCircle(W * 0.75, H * 0.18, 22);
    }
  }

  _drawOswinSimple(g, x, y, corruption) {
    const c = corruption;
    const smileW = Math.max(2, 8 - c * 6);
    const skinC   = Palette.lerp(0xf5d5a0, 0x806050, c * 0.5);
    const coatC   = Palette.lerp(0x8b3a20, 0x302820, c * 0.4);
    const hatC    = Palette.lerp(0x4a2810, 0x201810, c * 0.3);
    g.fillStyle(hatC, 1);
    g.fillEllipse(x, y - 28, 38, 9);
    g.fillRect(x - 10, y - 28, 20, 14);
    g.fillStyle(coatC, 1).fillEllipse(x, y - 6, 26, 28);
    g.fillRect(x - 7, y, 6, 14); g.fillRect(x + 1, y, 6, 14);
    g.fillStyle(skinC, 1).fillCircle(x, y - 22, 10);
    g.fillStyle(0x1a1208, 1).fillCircle(x - 3, y - 23, 1.5).fillCircle(x + 3, y - 23, 1.5);
    g.lineStyle(1.2, Palette.lerp(0x1a1208, 0x603020, c), 0.9);
    g.beginPath();
    g.arc(x, y - 20, smileW, 0.1 * Math.PI, 0.9 * Math.PI, false);
    g.strokePath();
  }

  // ---------------------------------------------------------------------------
  // HELPER: Halverstrom line city (for cartographer ending)
  // ---------------------------------------------------------------------------
  _drawHalverstromLines(brightness) {
    const W = this._W, H = this._H, g = this._g;
    const col = brightness > 0.5
      ? Palette.lerp(0x1a2535, 0x3a5070, (brightness - 0.5) * 2)
      : Palette.lerp(0x0d1520, 0x1a2535, brightness * 2);

    const BW = 80, BH = 60, COLS = 12, ROWS = 9;
    const ox = W/2 - COLS*BW/2, oy = H/2 - ROWS*BH/2;

    for (let r = 0; r <= ROWS; r++) {
      const sy = oy + r * BH;
      const w = (r % 3 === 0) ? 1.2 : 0.7;
      g.lineStyle(w, col, 0.7 + brightness * 0.3).lineBetween(ox - 20, sy, ox + COLS*BW + 20, sy);
    }
    for (let c = 0; c <= COLS; c++) {
      const sx = ox + c * BW;
      const w = (c % 4 === 0) ? 1.2 : 0.7;
      g.lineStyle(w, col, 0.7 + brightness * 0.3).lineBetween(sx, oy - 20, sx, oy + ROWS*BH + 20);
    }
  }

  // ---------------------------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------------------------
  update() {}

  shutdown() {
    StateManager.save();
  }
}
