/**
 * STRATA — Layer4Scene
 * The Substrate — the distributed backup array, experienced as space.
 * Not a simulation. Not a game. An accumulation.
 * Decades of human thought, partially preserved, without context.
 * The system tries to file Maren. She is new data.
 * The UI dissolves here. Input is uncertain. Output is uncertain.
 */
class Layer4Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Layer4Scene' });
    this._noiseOffset = 0;
    this._filingProgress = 0;
    this._fragments = [];
    this._filed = false;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    StateManager.enterLayer(4);
    TransitionEngine.init(this);

    // The Substrate has no skybox, no floor — just field
    this._bg = this.add.graphics().setDepth(0);
    this._fieldGraphics = this.add.graphics().setDepth(5);
    this._fragmentGraphics = this.add.graphics().setDepth(10);
    this._uiGraphics = this.add.graphics().setDepth(20);

    // Generate substrate fragments — echoes of old research data
    this._generateFragments(W, H);

    // The filing behavior — the system classifying Maren
    this._filingDisplay = this.add.text(W / 2, H - 60, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#1a2a1a'
    }).setOrigin(0.5, 0).setDepth(25);

    // Maren's controls still work but feel wrong
    this._cursors = this.input.keyboard.createCursorKeys();
    this._wasd = this.input.keyboard.addKeys('W,A,S,D');

    // ESC — escape is harder from here
    this.input.keyboard.on('keydown-ESC', () => {
      if (this._escPressCount === undefined) this._escPressCount = 0;
      this._escPressCount++;
      if (this._escPressCount >= 3) this._return();
      else {
        // UI dissolves further — escape doesn't work right away
        this._showFilingMessage(`// attempting to exit... (${3 - this._escPressCount} more)`);
      }
    });

    // No HUD here — it would be wrong to show depth this deep

    // First visit note
    if (StateManager.get('layerVisits')[4] === 1) {
      this.time.delayedCall(1500, () => {
        StateManager.addMarenNote(
          `I don't know what this is. it's not a layer in the same sense. ` +
          `it goes further back than PILGRIM. further back than Lumen. ` +
          `there are shapes here. some of them look like filing systems. ` +
          `I pressed ESC and nothing happened. there's text in the corner. ` +
          `it says 'classifying: new_data_subject_[unknown]'`
        );
      });

      // Corruption gain is heavier here — tracked in StateManager
      StateManager.addCorruption(0.12);
    }

    // No fade in — you're just here
    this._noSnap = true;

    StateManager.save();
  }

  _generateFragments(W, H) {
    // Data fragments — ghosts of old research
    const fragmentData = [
      { text: '// project ECHO — 1993\n// cognitive load study\n// subject count: 12\n// STATUS: archived', x: 0.1, y: 0.15 },
      { text: 'MEMORANDUM\nre: distributed storage config\ndate: 14 nov 1991\nprior auth required', x: 0.7, y: 0.1 },
      { text: 'subject_callum_w\ndiagnosis: topographic disorientation\nspatial memory: non-forming\nsubj. describes: "living in weather"', x: 0.55, y: 0.6 },
      { text: '// holm_p note 2005-09-03\n// the array self-organized.\n// this was not designed.\n// I am documenting it anyway.', x: 0.15, y: 0.55 },
      { text: 'PROJECT ATLAS — 1998\nneural mapping via\nexternal storage proxy\n[INCONCLUSIVE]', x: 0.8, y: 0.45 },
      { text: 'ida_crane@[REDACTED]\n"I think someone lives here.\nnot metaphorically.\nI think someone actually lives here."', x: 0.3, y: 0.8 },
      { text: 'LUMEN COLLECTIVE\ninternal audit 2023\nsubject status: living\nconsent status: [NOT UPDATED]', x: 0.6, y: 0.25 },
      { text: '// unknown origin\n// estimated: pre-2000\n// content: a list of street names\n// 847 entries', x: 0.25, y: 0.35 },
    ];

    this._fragments = fragmentData.map(f => ({
      ...f,
      rx: W * f.x,
      ry: H * f.y,
      alpha: 0.05 + Math.random() * 0.1,
      targetAlpha: 0.05 + Math.random() * 0.1,
      pulsePhase: Math.random() * Math.PI * 2,
      w: 200,
      h: 60
    }));
  }

  _showFilingMessage(msg) {
    this._filingDisplay.setText(msg);
    this.tweens.add({
      targets: this._filingDisplay,
      alpha: { from: 0.8, to: 0.2 },
      duration: 2000,
      ease: 'Sine.easeOut'
    });
  }

  _drawBackground(W, H, time) {
    this._bg.clear();
    // Deep void — not quite black
    this._bg.fillStyle(0x020408, 1);
    this._bg.fillRect(0, 0, W, H);

    // Very faint noise field using manual grid
    const gridSize = 8;
    for (let x = 0; x < W; x += gridSize) {
      for (let y = 0; y < H; y += gridSize) {
        const n = Noise.get(x * 0.003 + this._noiseOffset * 0.2, y * 0.003 + this._noiseOffset * 0.1);
        if (n > 0.3) {
          const a = (n - 0.3) * 0.06;
          this._bg.fillStyle(0x081420, a);
          this._bg.fillRect(x, y, gridSize, gridSize);
        }
      }
    }
  }

  _drawField(W, H, time) {
    this._fieldGraphics.clear();

    // Geometric field lines — like a filing system that extends infinitely
    const t = time * 0.0004;

    // Concentric irregular shapes that slowly expand
    for (let i = 0; i < 5; i++) {
      const r = 80 + i * 60 + Math.sin(t + i * 0.8) * 15;
      const alpha = 0.06 - i * 0.008;
      const sides = 6 + i;
      this._fieldGraphics.lineStyle(0.5, 0x1a3a2a, alpha);
      this._drawPolygon(this._fieldGraphics, W / 2, H / 2, r, sides, t * 0.3 + i * 0.4);
    }

    // Grid lines that pulse
    const gridAlpha = 0.03 + Math.sin(t * 0.5) * 0.01;
    this._fieldGraphics.lineStyle(0.5, 0x0a1a10, gridAlpha);
    for (let x = 0; x < W; x += 60) {
      this._fieldGraphics.lineBetween(x, 0, x + Math.sin(t + x * 0.01) * 5, H);
    }
    for (let y = 0; y < H; y += 60) {
      this._fieldGraphics.lineBetween(0, y, W, y + Math.sin(t + y * 0.01) * 5);
    }
  }

  _drawPolygon(g, cx, cy, r, sides, rotation) {
    const points = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 + rotation;
      points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
    }
    g.beginPath();
    g.moveTo(points[0].x, points[0].y);
    points.forEach(p => g.lineTo(p.x, p.y));
    g.closePath();
    g.strokePath();
  }

  _drawFragments(time) {
    this._fragmentGraphics.clear();
    this._fragments.forEach((f, i) => {
      // Fragments pulse in and out
      const pulse = Math.sin(time * 0.001 + f.pulsePhase) * 0.5 + 0.5;
      const alpha = f.alpha * (0.4 + pulse * 0.6);

      // Fragment bounding box
      this._fragmentGraphics.lineStyle(0.5, 0x1a3a2a, alpha * 0.5);
      this._fragmentGraphics.strokeRect(f.rx - 2, f.ry - 2, f.w + 4, f.h + 4);

      // Fragment text — rendered per line
      const lines = f.text.split('\n');
    });

    // Redraw text objects — done via Phaser text, created once in create
    if (!this._fragmentTexts) {
      this._fragmentTexts = this._fragments.map(f => {
        return this.add.text(f.rx, f.ry, f.text, {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: '#1a4a2a',
          lineSpacing: 2
        }).setDepth(11);
      });
    }

    this._fragmentTexts.forEach((t, i) => {
      const f = this._fragments[i];
      const pulse = Math.sin(this.time.now * 0.001 + f.pulsePhase) * 0.5 + 0.5;
      t.setAlpha(f.alpha * (0.4 + pulse * 0.6));
    });
  }

  _drawFilingProcess(W, H, time) {
    this._uiGraphics.clear();
    this._filingProgress = Math.min(1, this._filingProgress + 0.0002);

    // Filing progress bar — barely visible
    if (this._filingProgress > 0.05) {
      const barW = 200;
      const barX = W / 2 - barW / 2;
      const barY = H - 40;

      this._uiGraphics.lineStyle(0.5, 0x1a3a1a, 0.3);
      this._uiGraphics.strokeRect(barX, barY, barW, 2);
      this._uiGraphics.fillStyle(0x1a4a1a, 0.4);
      this._uiGraphics.fillRect(barX, barY, barW * this._filingProgress, 2);

      // Label
      const pct = Math.floor(this._filingProgress * 100);
      if (pct % 10 === 0 && !this._filed) {
        this._showFilingMessage(`// classifying: new_data_subject_[maren_voss] — ${pct}%`);
      }
    }

    if (this._filingProgress >= 1 && !this._filed) {
      this._filed = true;
      this._showFilingMessage('// classification complete. filed under: investigator > external > [year unknown]');
      // This triggers a desktop anomaly when player returns
      StateManager.addCorruption(0.08);
    }
  }

  _return() {
    this.input.keyboard.enabled = false;
    // Snap cut — abrupt return, no comfort transition
    TransitionEngine.transition(this, 4, 3,
      () => this.scene.start('Layer3Scene'), null
    );
  }

  update(time, delta) {
    StateManager.tickPlayTime(delta);
    this._noiseOffset += delta * 0.0001;

    const W = this.scale.width;
    const H = this.scale.height;

    this._drawBackground(W, H, time);
    this._drawField(W, H, time);
    this._drawFragments(time);
    this._drawFilingProcess(W, H, time);
  }

  shutdown() {
    StateManager.save();
  }
}
