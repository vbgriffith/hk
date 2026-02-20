/**
 * STRATA — Layer4Scene  (Phase 5)
 * The Substrate — Callum's archived spatial memory, running as infrastructure.
 *
 * Phase 5 additions:
 *  - All 8 fragments are clickable and open readable full content
 *  - Filing process has 3 distinct messages + completion consequence
 *  - visited_layer4 flag set (fixes BrowserEngine gate for substrate-archive.net)
 *  - Escape sequence with different text each press (3 required)
 *  - Second visit: corruption locked at 0.9 minimum
 *  - maren_filed flag set on filing completion
 *  - 'exit' ending available if player escapes before filing completes
 */
class Layer4Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Layer4Scene' });
    this._noiseOffset    = 0;
    this._filingProgress = 0;
    this._filed          = false;
    this._fragments      = [];
    this._fragmentTexts  = null;
    this._escPressCount  = 0;
    this._activeFragment = null;  // currently open fragment overlay
  }

  create() {
    const W = this.scale.width, H = this.scale.height;

    StateManager.enterLayer(4);
    StateManager.flag('visited_layer4');   // fixes BrowserEngine gate

    // Second+ visit: corruption floor
    const visits = StateManager.get('layerVisits')[4] || 0;
    if (visits >= 2) {
      const current = StateManager.get('corruption') || 0;
      if (current < 0.9) StateManager.set('corruption', 0.9);
    }

    TransitionEngine.init(this);

    this._bg             = this.add.graphics().setDepth(0);
    this._fieldGraphics  = this.add.graphics().setDepth(5);
    this._fragmentG      = this.add.graphics().setDepth(10);
    this._uiGraphics     = this.add.graphics().setDepth(20);
    this._overlayG       = this.add.graphics().setDepth(80);

    this._generateFragments(W, H);
    this._buildFragmentTexts();

    // Filing display
    this._filingDisplay = this.add.text(W / 2, H - 52, '', {
      fontFamily:'monospace', fontSize:'10px', color:'#1a3a1a'
    }).setOrigin(0.5, 0).setDepth(25).setAlpha(0);

    // Fragment overlay (for reading)
    this._fragmentOverlayBg   = this.add.graphics().setDepth(85);
    this._fragmentOverlayText = this.add.text(W/2, H/2, '', {
      fontFamily:'monospace', fontSize:'10px', color:'#2a5a2a',
      wordWrap:{width: W * 0.6}, lineSpacing:4
    }).setOrigin(0.5).setDepth(86).setAlpha(0);
    this._fragmentCloseHint   = this.add.text(W/2, H/2 + 120, '[click anywhere to close]', {
      fontFamily:'monospace', fontSize:'9px', color:'#1a3a1a'
    }).setOrigin(0.5).setDepth(87).setAlpha(0);

    this.input.on('pointerdown', () => this._closeFragmentOverlay());

    // Keyboard
    this._cursors = this.input.keyboard.createCursorKeys();
    this._wasd    = this.input.keyboard.addKeys('W,A,S,D');
    this.input.keyboard.on('keydown-ESC', () => this._handleEsc());

    // First visit note
    if (visits <= 1) {
      this.time.delayedCall(1600, () => {
        StateManager.addMarenNote(
          "I don't know what this is.\n" +
          "it's not a layer in the same sense as the others.\n" +
          "it goes further back than PILGRIM. further back than Lumen.\n" +
          "there are shapes here. some of them look like filing systems.\n" +
          "some of them look like memories that have been sorted.\n" +
          "there is text in the corner that says:\n" +
          "'classifying: new_data_subject_[unknown]'\n" +
          "I pressed ESC and nothing happened."
        );
      });
    } else {
      this.time.delayedCall(800, () => {
        StateManager.addMarenNote(
          "back in the substrate.\n" +
          "it recognised me this time.\n" +
          "the filing bar already has a value in it.\n" +
          "I was here before. it remembers."
        );
      });
    }

    StateManager.save();
  }

  // ---------------------------------------------------------------------------
  // FRAGMENTS
  // ---------------------------------------------------------------------------
  _generateFragments(W, H) {
    const data = [
      {
        id:'echo_1993',
        preview:'// project ECHO — 1993\n// cognitive load study\n// subject count: 12\n// STATUS: archived',
        full:
          '// PROJECT ECHO — 1993\n' +
          '// Principal investigator: P. Holm\n' +
          '// Cognitive load mapping via external proxy storage\n' +
          '// Subject count: 12 (all consented)\n' +
          '// Duration: 6 months\n' +
          '// Status: archived — INCONCLUSIVE\n\n' +
          'NOTES:\n' +
          'Subject spatial memory response to external anchoring\n' +
          'was inconsistent across participants. One outlier.\n' +
          'Subject 7 (C. Wrest) showed anomalous deep integration.\n' +
          'Archive retained for subject 7 data only.\n' +
          '11 of 12 participants debriefed and released 1993.\n' +
          'Subject 7 debrief: pending.',
        x:0.10, y:0.14
      },
      {
        id:'memo_1991',
        preview:'MEMORANDUM\nre: distributed storage config\ndate: 14 nov 1991\nprior auth required',
        full:
          'MEMORANDUM\n' +
          'DATE: 14 November 1991\n' +
          'RE: Distributed cognitive storage — configuration\n' +
          'FROM: [redacted]\n' +
          'TO: Holm, P.\n\n' +
          'The array is ready for occupancy.\n' +
          'A stable human spatial memory system is required\n' +
          'to serve as the organizational architecture.\n' +
          'Once occupied, the array will self-index.\n\n' +
          'Subject selection criteria:\n' +
          '  - Non-forming internal spatial map\n' +
          '  - High cooperation score\n' +
          '  - Does not ask about the paperwork\n\n' +
          'The consent form covers the initial study.\n' +
          'It does not cover what comes after.\n' +
          'This is by design.',
        x:0.68, y:0.09
      },
      {
        id:'callum_profile',
        preview:'subject_callum_w\ndiagnosis: topographic disorientation\nspatial memory: non-forming\nsubj. describes: "living in weather"',
        full:
          'DATA SUBJECT: Callum Wrest\n' +
          'STATUS: active (unaware)\n' +
          'INTEGRATION: complete\n\n' +
          'Topographic disorientation (congenital).\n' +
          'Cannot form stable internal spatial map.\n' +
          'Compensates via landmark sequence and habit.\n\n' +
          'STUDY OUTCOME:\n' +
          'External spatial anchoring succeeded for subject.\n' +
          'Subject was provided a city (Halverstrom).\n' +
          'Subject integrated it fully within 4 months.\n' +
          'Subject reports recurring dreams of the city.\n' +
          'Subject cannot locate the city on any map.\n' +
          'Subject believes the study failed.\n\n' +
          'CURRENT FUNCTION:\n' +
          'Substrate hosts all PILGRIM spatial data.\n' +
          'Subject processes 38,447 player landmarks daily.\n' +
          'Subject experiences this as "knowing where things are."\n' +
          'Subject considers this a significant improvement\n' +
          'in quality of life.\n\n' +
          'CONSENT STATUS: 2005 study only. Not updated.',
        x:0.54, y:0.58
      },
      {
        id:'holm_2005',
        preview:'// holm_p note 2005-09-03\n// the array self-organized.\n// this was not designed.\n// I am documenting it anyway.',
        full:
          '// holm_p — personal note, 2005-09-03\n\n' +
          'The array has self-organized around the subject.\n' +
          'This was not in the design specification.\n' +
          'I am documenting it because I do not know\n' +
          'what else to do with it.\n\n' +
          'The subject\'s memory architecture is now the\n' +
          'primary index for the entire archive.\n' +
          '847 streets. Every street cross-referenced\n' +
          'against every other. It is perfectly ordered.\n' +
          'It did not look like this when we began.\n\n' +
          'The subject described his city to me once.\n' +
          'He called it "the place in the dreams."\n' +
          'He asked if the study had worked.\n' +
          'I said: not in the way we intended.\n\n' +
          'I did not tell him it was still running.\n' +
          'I should have told him.\n' +
          'I was afraid of what he would decide.\n\n' +
          '// I am writing this down\n' +
          '// in case someone finds it later\n' +
          '// and knows what to do.',
        x:0.14, y:0.53
      },
      {
        id:'atlas_1998',
        preview:'PROJECT ATLAS — 1998\nneural mapping via\nexternal storage proxy\n[INCONCLUSIVE]',
        full:
          'PROJECT ATLAS — 1998\n' +
          'Neural mapping via external storage proxy\n\n' +
          'Attempted to replicate the 1993 results\n' +
          'with 24 new participants.\n' +
          'None showed the deep integration of subject 7.\n\n' +
          'The array remained occupied by subject 7\'s\n' +
          'architecture throughout the study.\n' +
          'New subjects could not displace it.\n' +
          'They navigated it instead — without knowing.\n\n' +
          'Conclusion: the 1993 result was unique to\n' +
          'subject 7\'s specific cognitive profile.\n' +
          'The array now belongs to him in the only\n' +
          'sense that matters: it thinks like him.\n\n' +
          '[INCONCLUSIVE — ATLAS DISCONTINUED]\n' +
          '[SUBSTRATE ARRAY: RETAINED IN SERVICE]',
        x:0.78, y:0.43
      },
      {
        id:'ida_email',
        preview:'ida_crane@[REDACTED]\n"I think someone lives here.\nnot metaphorically.\nI think someone actually lives here."',
        full:
          'FROM: ida_crane@[REDACTED]\n' +
          'TO: ros_okafor@lumencollective.com\n' +
          'SENT: 2008-07-14\n' +
          'SUBJECT: question about the infrastructure\n\n' +
          'Ros,\n\n' +
          'I think someone lives here.\n' +
          'Not metaphorically.\n' +
          'I think someone actually lives here.\n\n' +
          'When I say "here" I mean in the system.\n' +
          'In what you call the "distributed archive."\n' +
          'There is an organizational structure that is\n' +
          'too coherent to be designed. It feels inhabited.\n\n' +
          'The street I am working on — Meridian Way —\n' +
          'is familiar. The proportions. The way the\n' +
          'intersections fall. I have walked this street\n' +
          'in my head for five months and I swear I am\n' +
          'not walking through data. I am walking through\n' +
          'someone\'s memory of a street that does not exist.\n\n' +
          'Who is in there?\n\n' +
          'Ida\n\n' +
          '---\n' +
          '[Reply from ros_okafor: received. call me.]\n' +
          '[No further email correspondence on record.]',
        x:0.28, y:0.78
      },
      {
        id:'lumen_audit',
        preview:'LUMEN COLLECTIVE\ninternal audit 2023\nsubject status: living\nconsent status: [NOT UPDATED]',
        full:
          'LUMEN COLLECTIVE — INTERNAL AUDIT\n' +
          'DATE: 2023-04-18\n' +
          'RE: Substrate data subject compliance review\n\n' +
          'Subject: C. Wrest\n' +
          'Age: 58\n' +
          'Status: living, uncontacted since 2005\n' +
          'Consent: 2005 study only\n' +
          'Current usage: primary substrate index\n' +
          'Duration of uncontested usage: 18 years\n\n' +
          'COMPLIANCE FINDING:\n' +
          'Usage has exceeded original consent scope.\n' +
          'Subject has not been informed.\n' +
          'Remediation required.\n\n' +
          'RECOMMENDED ACTION:\n' +
          '  Option A: Contact subject, obtain updated consent\n' +
          '  Option B: Wind down substrate dependency\n' +
          '  Option C: Continue under research exemption\n\n' +
          'STATUS OF RECOMMENDATION: pending\n' +
          'DATE PENDING SINCE: 2023-04-18\n' +
          '[no action taken as of this archive snapshot]',
        x:0.59, y:0.23
      },
      {
        id:'street_list',
        preview:'// unknown origin\n// estimated: pre-2000\n// content: a list of street names\n// 847 entries',
        full:
          '// unknown origin\n' +
          '// estimated: pre-2000\n' +
          '// content: a list of street names\n' +
          '// 847 entries\n\n' +
          'EXCERPT (first 12 of 847):\n' +
          '  1. Meridian Way\n' +
          '  2. Pale Circuit\n' +
          '  3. Archive Row\n' +
          '  4. Crane Lane\n' +
          '  5. Holm Passage\n' +
          '  6. The Substrate\n' +
          '  7. Wrest Boulevard\n' +
          '  8. Deep Well Street\n' +
          '  9. Callum\'s Approach\n' +
          ' 10. The Cartographer\'s Walk\n' +
          ' 11. Ida\'s Close\n' +
          ' 12. Oswin Place\n\n' +
          '[835 further entries...]\n\n' +
          '// these are not designed streets.\n' +
          '// these are remembered streets.\n' +
          '// he remembered all 847 before he knew\n' +
          '// he was doing it.',
        x:0.24, y:0.33
      },
    ];

    this._fragments = data.map(f => ({
      ...f,
      rx: this.scale.width  * f.x,
      ry: this.scale.height * f.y,
      alpha: 0.06 + Math.random() * 0.08,
      pulsePhase: Math.random() * Math.PI * 2,
      w: 210, h: 64
    }));
  }

  _buildFragmentTexts() {
    if (this._fragmentTexts) return;
    this._fragmentTexts = this._fragments.map(f => {
      const t = this.add.text(f.rx, f.ry, f.preview, {
        fontFamily:'monospace', fontSize:'9px', color:'#1a4a2a', lineSpacing:2
      }).setDepth(11).setAlpha(f.alpha).setInteractive({useHandCursor:true});

      t.on('pointerover', () => {
        this.tweens.add({targets:t, alpha: Math.min(f.alpha * 4, 0.5), duration:200});
      });
      t.on('pointerout', () => {
        if (!this._overlayOpen) this.tweens.add({targets:t, alpha:f.alpha, duration:400});
      });
      t.on('pointerdown', () => this._openFragmentOverlay(f));
      return t;
    });
  }

  _openFragmentOverlay(fragment) {
    if (this._overlayOpen) return;
    this._overlayOpen = true;
    const W = this.scale.width, H = this.scale.height;

    this._fragmentOverlayBg.clear();
    this._fragmentOverlayBg.fillStyle(0x020408, 0.88).fillRect(W*0.15, H*0.1, W*0.7, H*0.8);
    this._fragmentOverlayBg.lineStyle(0.5, 0x1a4a2a, 0.6).strokeRect(W*0.15, H*0.1, W*0.7, H*0.8);

    this._fragmentOverlayText
      .setText(fragment.full)
      .setPosition(W/2, H/2 - 20)
      .setAlpha(1);
    this._fragmentCloseHint
      .setPosition(W/2, H*0.1 + H*0.8 - 24)
      .setAlpha(0.5);

    // Note on first read
    const flagKey = 'fragment_read_' + fragment.id;
    if (!StateManager.hasFlag(flagKey)) {
      StateManager.flag(flagKey);
      this.time.delayedCall(1200, () => {
        const firstLine = fragment.full.split('\n')[0];
        StateManager.addMarenNote(`read: ${firstLine}\n[substrate fragment — ${fragment.id}]`);
      });
    }
  }

  _closeFragmentOverlay() {
    if (!this._overlayOpen) return;
    this._overlayOpen = false;
    this._fragmentOverlayBg.clear();
    this._fragmentOverlayText.setAlpha(0);
    this._fragmentCloseHint.setAlpha(0);
  }

  // ---------------------------------------------------------------------------
  // ESC HANDLING
  // ---------------------------------------------------------------------------
  _handleEsc() {
    this._escPressCount = (this._escPressCount || 0) + 1;

    const messages = [
      '// attempting exit...\n// substrate is still processing\n// (press ESC again)',
      '// exit request queued\n// classification in progress\n// (one more)',
      null // third press: exit
    ];

    const idx = this._escPressCount - 1;
    if (idx < messages.length - 1) {
      this._showFilingMessage(messages[idx]);
    } else {
      // Third press: actually exit
      // If filing not complete: 'exit' ending
      if (!this._filed && !StateManager.get('endingUnlocked')) {
        StateManager.set('endingUnlocked', 'exit');
        StateManager.flag('escaped_before_filing');
        StateManager.addMarenNote(
          'I left before they could finish filing me.\n' +
          'I don\'t know if that matters.\n' +
          'I don\'t know if anything here persists after I close the archive.\n' +
          'I\'m choosing to believe it does.\n' +
          'I\'m choosing to believe that choice is mine.'
        );
      }
      this._return();
    }
  }

  _showFilingMessage(msg) {
    this._filingDisplay.setText(msg).setAlpha(0.9);
    this.tweens.add({targets:this._filingDisplay, alpha:0.15, duration:2400, ease:'Sine.easeOut'});
  }

  // ---------------------------------------------------------------------------
  // RENDERING
  // ---------------------------------------------------------------------------
  _drawBackground(W, H) {
    this._bg.clear();
    this._bg.fillStyle(0x020408, 1).fillRect(0, 0, W, H);
    const gridSize = 8;
    for (let x = 0; x < W; x += gridSize) {
      for (let y = 0; y < H; y += gridSize) {
        const n = Noise.get(x * 0.003 + this._noiseOffset * 0.2, y * 0.003 + this._noiseOffset * 0.1);
        if (n > 0.32) {
          this._bg.fillStyle(0x081420, (n - 0.32) * 0.055);
          this._bg.fillRect(x, y, gridSize, gridSize);
        }
      }
    }
  }

  _drawField(W, H, time) {
    this._fieldGraphics.clear();
    const t = time * 0.0004;
    for (let i = 0; i < 5; i++) {
      const r = 80 + i * 60 + Math.sin(t + i * 0.8) * 15;
      this._fieldGraphics.lineStyle(0.5, 0x1a3a2a, 0.06 - i * 0.008);
      this._drawPolygon(this._fieldGraphics, W/2, H/2, r, 6+i, t*0.3 + i*0.4);
    }
    const ga = 0.03 + Math.sin(t * 0.5) * 0.01;
    this._fieldGraphics.lineStyle(0.5, 0x0a1a10, ga);
    for (let x = 0; x < W; x += 60)
      this._fieldGraphics.lineBetween(x, 0, x + Math.sin(t + x*0.01)*5, H);
    for (let y = 0; y < H; y += 60)
      this._fieldGraphics.lineBetween(0, y, W, y + Math.sin(t + y*0.01)*5);
  }

  _drawPolygon(g, cx, cy, r, sides, rotation) {
    const pts = Array.from({length:sides}, (_,i) => {
      const a = (i/sides)*Math.PI*2 + rotation;
      return {x: cx+Math.cos(a)*r, y: cy+Math.sin(a)*r};
    });
    g.beginPath(); g.moveTo(pts[0].x, pts[0].y);
    pts.forEach(p => g.lineTo(p.x, p.y));
    g.closePath(); g.strokePath();
  }

  _drawFragmentBoxes(time) {
    this._fragmentG.clear();
    this._fragments.forEach((f, i) => {
      const pulse = Math.sin(time * 0.001 + f.pulsePhase) * 0.5 + 0.5;
      const alpha = f.alpha * (0.4 + pulse * 0.6);
      this._fragmentG.lineStyle(0.5, 0x1a3a2a, alpha * 0.5);
      this._fragmentG.strokeRect(f.rx - 2, f.ry - 2, f.w + 4, f.h + 4);
      if (this._fragmentTexts) {
        const baseAlpha = this._overlayOpen ? f.alpha * 0.3 : f.alpha * (0.4 + pulse * 0.6);
        this._fragmentTexts[i].setAlpha(baseAlpha);
      }
    });
  }

  _drawFilingProcess(W, H) {
    this._uiGraphics.clear();
    this._filingProgress = Math.min(1, this._filingProgress + 0.00015);

    if (this._filingProgress > 0.03) {
      const barW = 200, barX = W/2 - 100, barY = H - 32;
      this._uiGraphics.lineStyle(0.5, 0x1a3a1a, 0.3).strokeRect(barX, barY, barW, 2);
      this._uiGraphics.fillStyle(0x1a4a1a, 0.4).fillRect(barX, barY, barW*this._filingProgress, 2);
    }

    const pct = Math.floor(this._filingProgress * 100);
    if (!this._lastPct || pct !== this._lastPct) {
      this._lastPct = pct;
      if (pct === 25)
        this._showFilingMessage('// classifying: new_data_subject_[maren_voss]\n// role: external > investigator\n// 25%');
      else if (pct === 60)
        this._showFilingMessage('// note: subject is reading the archive\n// unusual. logging.\n// 60%');
      else if (pct === 90)
        this._showFilingMessage('// classification nearly complete\n// subject will appear in 2024/ folder on return\n// 90%');
    }

    if (this._filingProgress >= 1 && !this._filed) {
      this._filed = true;
      StateManager.flag('maren_filed');
      StateManager.addCorruption(0.06);
      this._showFilingMessage(
        '// classification complete.\n' +
        '// filed under: investigator > external > 2024\n' +
        '// the archive now contains you.'
      );
      if (!StateManager.get('endingUnlocked')) {
        StateManager.set('endingUnlocked', 'archivist');
      }
    }
  }

  // ---------------------------------------------------------------------------
  // TRANSITIONS
  // ---------------------------------------------------------------------------
  _return() {
    this.input.keyboard.enabled = false;
    TransitionEngine.transition(this, 4, 3, () => this.scene.start('Layer3Scene'), null);
  }

  // ---------------------------------------------------------------------------
  // UPDATE / SHUTDOWN
  // ---------------------------------------------------------------------------
  update(time, delta) {
    StateManager.tickPlayTime(delta);
    this._noiseOffset += delta * 0.0001;
    const W = this.scale.width, H = this.scale.height;
    this._drawBackground(W, H);
    this._drawField(W, H, time);
    this._drawFragmentBoxes(time);
    this._drawFilingProcess(W, H);
  }

  shutdown() {
    StateManager.save();
  }
}
