/**
 * STRATA — Layer1Scene  (Phase 3)
 * PILGRIM — fully playable.
 *
 * What's here:
 *  - Veldenmoor world with interactive ravens (sequence puzzle 3,1,4,1,5 = Pi)
 *  - Workshop gate — locked until sequence solved, then descend animation
 *  - Oswin dialogue fully wired (keyboard + mouse)
 *  - Coin inventory item after first puzzle
 *  - Corruption bleed — sky darkens, Oswin degrades, ravens go silent
 *  - The Drafts door — visible but sealed, Oswin hints at it
 *  - First-visit Maren note
 *  - Player proximity prompts on interactables
 */
class Layer1Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Layer1Scene' });
    this._player       = null;
    this._ravens       = [];      // { x, y, postIndex, g, label }
    this._ravenLights  = [];      // current lit sequence
    this._seqBuffer    = [];      // player's click sequence
    this._seqGraphics  = null;
    this._gate         = null;    // { x, y, g, locked }
    this._promptText   = null;
    this._coinSprite   = null;
    this._cursors      = null;
    this._wasd         = null;
    this._spaceKey     = null;
    this._upKey        = null;
    this._downKey      = null;
    this._interactables = [];     // { x, y, radius, label, onInteract }
    this._nearestInteractable = null;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    StateManager.enterLayer(1);
    TransitionEngine.init(this);

    const corruption = StateManager.get('corruption') || 0;

    // ── World ──────────────────────────────────────────────────────────
    this._generateWorld(W, H, corruption);

    // ── Interactables layer ────────────────────────────────────────────
    this._seqGraphics  = this.add.graphics().setDepth(20);
    this._promptText   = this.add.text(W / 2, H - 48, '', {
      fontFamily: 'monospace', fontSize: '11px',
      color: '#d4a853', backgroundColor: '#1a1208cc',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 1).setDepth(60).setAlpha(0);

    // ── Ravens ─────────────────────────────────────────────────────────
    this._spawnRavens(W, H, corruption);

    // ── Gate (Workshop entrance) ───────────────────────────────────────
    this._spawnGate(W, H);

    // ── Player ────────────────────────────────────────────────────────
    this._spawnPlayer(W * 0.5, H * 0.6);

    // ── Oswin ─────────────────────────────────────────────────────────
    this._marketX = W * 0.5;
    this._marketY = H * 0.57;
    Oswin.create(this, this._marketX, this._marketY, 'forward', 1);
    this._registerInteractable(
      this._marketX, this._marketY - 20, 45,
      'Talk to Oswin  [E]',
      () => Oswin.interact()
    );

    // ── Coin inventory (if already solved) ────────────────────────────
    if (StateManager.hasFlag('oswin_coin_solved')) {
      this._showCoin(W, H);
    }
    EventBus.on('puzzle:solved', ({ id }) => {
      if (id === 'oswin_coin_riddle') this._showCoin(W, H);
      if (id === 'veldenmoor_sequence') this._unlockGate();
    }, this);

    // ── Browser frame chrome ──────────────────────────────────────────
    this._drawBrowserFrame(W, H);

    // ── HUD ───────────────────────────────────────────────────────────
    HUD.show(this, 1);

    // ── Controls ──────────────────────────────────────────────────────
    this._cursors  = this.input.keyboard.createCursorKeys();
    this._wasd     = this.input.keyboard.addKeys('W,A,S,D,E');
    this._spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this._upKey    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this._downKey  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

    // Space / Enter — advance dialogue
    this.input.keyboard.on('keydown-SPACE', () => {
      if (DialogueEngine.isActive()) DialogueEngine.advance();
      else this._tryInteract();
    });
    this.input.keyboard.on('keydown-ENTER', () => {
      if (DialogueEngine.isActive()) DialogueEngine.advance();
    });
    // Arrow up/down — navigate choices
    this.input.keyboard.on('keydown-UP',   () => DialogueEngine.navigateChoice(-1));
    this.input.keyboard.on('keydown-DOWN', () => DialogueEngine.navigateChoice(1));
    // E — interact with nearest
    this.input.keyboard.on('keydown-E', () => {
      if (!DialogueEngine.isActive()) this._tryInteract();
    });
    // ESC
    this.input.keyboard.on('keydown-ESC', () => {
      if (DialogueEngine.isActive()) { DialogueEngine.destroy(); return; }
      this._returnToLayer0();
    });

    // ── First visit note ──────────────────────────────────────────────
    if ((StateManager.get('layerVisits')[1] || 0) <= 1) {
      this.time.delayedCall(2000, () => {
        StateManager.addMarenNote(
          `PILGRIM. 2009. cobblestones and lamp posts and a man in a wide hat ` +
          `who already knows my name. ` +
          `there are ravens on the posts. five of them. ` +
          `they landed in a specific order and I'm choosing to believe that's intentional.`
        );
      });
    }

    // ── Corruption note (if high) ──────────────────────────────────────
    if (corruption > 0.5 && !StateManager.hasFlag('l1_corruption_noted')) {
      StateManager.flag('l1_corruption_noted');
      this.time.delayedCall(3500, () => {
        StateManager.addMarenNote(
          `the sky in Veldenmoor is wrong. it was warm when I first arrived. ` +
          `it's the color of old static now. Oswin's smile is smaller.`
        );
      });
    }

    this._fadeIn(W, H);
    StateManager.save();
  }

  // ─── World generation ─────────────────────────────────────────────────────

  _generateWorld(W, H, corruption) {
    const g = this.add.graphics().setDepth(1);

    // Sky — corrupts from warm blue toward dark static-grey
    const skyColor = Palette.lerp(0xa8d8ea, 0x2a2830, Math.min(1, corruption * 1.4));
    g.fillStyle(skyColor, 1);
    g.fillRect(0, 0, W, H * 0.35);

    // Sun — dims and reddens with corruption
    if (corruption < 0.7) {
      const sunAlpha = 0.9 - corruption * 0.8;
      const sunColor = Palette.lerp(0xffd166, 0x8a4a20, corruption);
      g.fillStyle(sunColor, sunAlpha);
      g.fillCircle(W * 0.15, H * 0.12, 28);
      g.fillStyle(sunColor, sunAlpha * 0.2);
      g.fillCircle(W * 0.15, H * 0.12, 48);
    }

    // Hills
    const hillColor = Palette.lerp(0x6aa76f, 0x3a3830, corruption * 0.8);
    g.fillStyle(hillColor, 1);
    for (let i = 0; i < 5; i++) {
      const hx = (W / 5) * i + W / 10;
      const hy = H * 0.28 + Math.sin(i * 1.7) * 20;
      const r  = 90 + i * 15;
      g.fillEllipse(hx, hy, r * 2, r * 0.8);
    }

    // Ground
    const groundColor = Palette.lerp(0xc8a96e, 0x4a4038, corruption * 0.6);
    g.fillStyle(groundColor, 1);
    g.fillRect(0, H * 0.32, W, H * 0.68);

    // Cobblestones
    const stoneW = 28, stoneH = 14;
    for (let row = 0; row < 30; row++) {
      const oy = H * 0.32 + row * stoneH;
      const ox = (row % 2) * (stoneW / 2);
      for (let col = -1; col < W / stoneW + 1; col++) {
        const sx = col * stoneW + ox;
        const base  = (row + col) % 3 === 0 ? 0xb08050 : 0xc09868;
        const stone = Palette.lerp(base, 0x303028, corruption * 0.5);
        g.fillStyle(stone, 1);
        g.fillRoundedRect(sx + 1, oy + 1, stoneW - 2, stoneH - 2, 2);
        g.lineStyle(0.5, 0x907040, 0.3);
        g.strokeRoundedRect(sx + 1, oy + 1, stoneW - 2, stoneH - 2, 2);
      }
    }

    // Buildings
    this._drawBuildings(g, W, H, corruption);

    // Lamp posts
    this._drawLampPosts(g, W, H, corruption);

    // Market circle
    const ringColor = Palette.lerp(0xd4a03a, 0x505048, corruption * 0.8);
    g.lineStyle(2, ringColor, 0.6 - corruption * 0.3);
    g.strokeCircle(W * 0.5, H * 0.57, 42);
    g.lineStyle(1, ringColor, 0.3 - corruption * 0.2);
    g.strokeCircle(W * 0.5, H * 0.57, 56);

    // Sign
    this._drawSign(g, W * 0.07, H * 0.42, 'VELDENMOOR');
  }

  _drawBuildings(g, W, H, corruption) {
    const defs = [
      { x: 0.04, w: 0.11, h: 0.22, color: 0xd4956a, roof: 0x8b4513, label: 'Apothecary' },
      { x: 0.16, w: 0.10, h: 0.18, color: 0xc8a87a, roof: 0x6b3a1f, label: 'Inn'         },
      { x: 0.27, w: 0.13, h: 0.24, color: 0xb8956a, roof: 0x9b5523, label: 'Cartographer'},
      { x: 0.58, w: 0.11, h: 0.20, color: 0xd0a860, roof: 0x7a4418, label: 'Curiosities' },
      { x: 0.70, w: 0.12, h: 0.22, color: 0xc4906a, roof: 0x8b3e1a, label: 'Blacksmith'  },
      { x: 0.84, w: 0.14, h: 0.19, color: 0xd8b070, roof: 0x7b4a1e, label: ''            },
    ];
    defs.forEach(b => {
      const bx = W * b.x, bw = W * b.w, bh = H * b.h, by = H * 0.32 - bh;
      const wall = Palette.lerp(b.color, 0x282420, corruption * 0.6);
      const roof = Palette.lerp(b.roof,  0x181410, corruption * 0.6);
      g.fillStyle(wall, 1);
      g.fillRect(bx, by, bw, bh);
      g.lineStyle(1.5, 0x3a2010, 0.7);
      g.strokeRect(bx, by, bw, bh);
      g.fillStyle(roof, 1);
      g.fillTriangle(bx - 4, by, bx + bw / 2, by - bh * 0.3, bx + bw + 4, by);
      // Windows — dimmer with corruption
      const winAlpha = Math.max(0.1, 0.7 - corruption * 0.5);
      g.fillStyle(0xf0d890, winAlpha);
      g.fillRect(bx + bw * 0.2,  by + bh * 0.25, bw * 0.25, bh * 0.2);
      g.fillRect(bx + bw * 0.55, by + bh * 0.25, bw * 0.25, bh * 0.2);
      // Door
      g.fillStyle(0x4a2a10, 1);
      g.fillRect(bx + bw * 0.35, by + bh * 0.6, bw * 0.3, bh * 0.4);
      g.fillStyle(0xd4a03a, winAlpha);
      g.fillCircle(bx + bw * 0.35 + bw * 0.26, by + bh * 0.8, 3);
      // Label plaque
      if (b.label) {
        g.fillStyle(0x2a1808, 0.7);
        g.fillRect(bx + bw * 0.1, by + bh * 0.05, bw * 0.8, 14);
        this.add.text(bx + bw * 0.5, by + bh * 0.05 + 7, b.label, {
          fontFamily: 'monospace', fontSize: '8px',
          color: Palette.toCSS(Palette.lerp(0xd4c0a0, 0x605040, corruption * 0.8))
        }).setOrigin(0.5, 0.5).setDepth(5);
      }
    });
  }

  _drawLampPosts(g, W, H, corruption) {
    this._lampPositions = [0.14, 0.28, 0.48, 0.68, 0.86].map(px => W * px);
    this._lampPositions.forEach(lx => {
      const ly = H * 0.32;
      const postColor = Palette.lerp(0x4a3a28, 0x282018, corruption * 0.5);
      g.fillStyle(postColor, 1);
      g.fillRect(lx - 3, ly - 68, 6, 68);
      g.fillRect(lx - 9, ly - 70, 18, 4);
      // Lamp — dims with corruption
      const lampAlpha = Math.max(0.05, 0.55 - corruption * 0.45);
      const lampColor = Palette.lerp(0xffd166, 0x804020, corruption);
      g.fillStyle(lampColor, lampAlpha);
      g.fillCircle(lx, ly - 78, 11);
      g.fillStyle(lampColor, lampAlpha * 0.35);
      g.fillCircle(lx, ly - 78, 20);
    });

    // Autumn leaves — fewer and darker with corruption
    const leafAlpha = Math.max(0.1, 0.6 - corruption * 0.5);
    const leafColor = Palette.lerp(0xd4821a, 0x402810, corruption * 0.7);
    g.fillStyle(leafColor, leafAlpha);
    for (let i = 0; i < 18; i++) {
      g.fillEllipse((i * 137.5) % W, H * 0.32 + (i * 73) % (H * 0.28), 8, 5);
    }
  }

  _drawSign(g, x, y, text) {
    const sw = 180, sh = 30;
    g.fillStyle(0x6b4520, 1);
    g.fillRoundedRect(x, y, sw, sh, 4);
    g.lineStyle(1.5, 0x3a2010, 0.8);
    g.strokeRoundedRect(x, y, sw, sh, 4);
    g.fillStyle(0x4a2e10, 1);
    g.fillRect(x + sw / 2 - 3, y + sh, 6, 28);
    this.add.text(x + sw / 2, y + sh / 2, text, {
      fontFamily: 'monospace', fontSize: '11px', color: '#c8a860', letterSpacing: 3
    }).setOrigin(0.5, 0.5).setDepth(5);
  }

  // ─── Ravens ───────────────────────────────────────────────────────────────

  _spawnRavens(W, H, corruption) {
    // Pi sequence: 3,1,4,1,5 — ravens sit on posts 0-4
    // The player discovers the order by watching which raven lands first, second, etc.
    // We show subtle landing-order numbers (1–5) near each raven
    const PI_ORDER = [3, 1, 4, 1, 5]; // post indices in click order
    // Position on post tops
    const posts = this._lampPositions || [0.14, 0.28, 0.48, 0.68, 0.86].map(p => W * p);
    const postY  = H * 0.32 - 90;

    // Which posts have ravens: all 5 posts but the CLICK order is Pi
    // Visually: each raven has a tiny landing-order glyph (◈ 1..5)
    // shown only at high enough clarity (pre-corruption)
    const solved  = PuzzleManager.isSolved('veldenmoor_sequence');
    const hinted  = StateManager.hasFlag('oswin_sequence_hint_given');

    this._ravens = posts.map((lx, i) => {
      const rg = this.add.graphics().setDepth(18);
      const orderLabel = this.add.text(lx, postY - 18, '', {
        fontFamily: 'monospace', fontSize: '9px', color: '#d4a853'
      }).setOrigin(0.5, 1).setDepth(19).setAlpha(0);

      this._drawRaven(rg, lx, postY, corruption, solved);

      // Show subtle order label if hint has been given and not yet solved
      if (hinted && !solved) {
        const landingNum = PI_ORDER.indexOf(i) + 1;
        if (PI_ORDER.filter(p => p === i).length > 0) {
          orderLabel.setText(String(PI_ORDER.indexOf(i) + 1));
          orderLabel.setAlpha(0.4 - corruption * 0.3);
        }
      }

      // Click zone
      const hitZone = this.add.rectangle(lx, postY, 26, 30, 0, 0)
        .setInteractive({ cursor: 'pointer' }).setDepth(19);

      hitZone.on('pointerover', () => {
        if (!solved && !DialogueEngine.isActive()) {
          this._showPrompt('Click raven  [E]');
          orderLabel.setAlpha(Math.max(orderLabel.alpha, 0.7));
        }
      });
      hitZone.on('pointerout', () => {
        this._hidePrompt();
        if (hinted && !solved) orderLabel.setAlpha(0.4 - corruption * 0.3);
        else orderLabel.setAlpha(0);
      });
      hitZone.on('pointerdown', () => this._ravenClicked(i));

      return { x: lx, y: postY, postIndex: i, g: rg, label: orderLabel, hitZone };
    });

    // Register as interactable (for E key — click nearest raven)
    posts.forEach((lx, i) => {
      this._registerInteractable(lx, postY, 28, 'Click raven', () => this._ravenClicked(i));
    });

    this._seqFeedback = this.add.text(W / 2, H * 0.32 - 110, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#d4a853'
    }).setOrigin(0.5, 1).setDepth(22).setAlpha(0);
  }

  _drawRaven(g, x, y, corruption, solved) {
    g.clear();
    const bodyColor = solved
      ? Palette.lerp(0x1a1a1a, 0xd4a853, 0.15)
      : Palette.lerp(0x1a1a1a, 0x4a4040, corruption * 0.4);
    const eyeColor = solved ? 0xd4a853 : Palette.lerp(0xd4a03a, 0x603020, corruption);

    g.fillStyle(bodyColor, 1);
    g.fillEllipse(x,     y,     20, 13);
    g.fillEllipse(x + 6, y - 5, 13, 10);
    g.fillTriangle(x + 11, y - 5, x + 20, y - 3, x + 10, y + 1);
    g.fillStyle(eyeColor, 1);
    g.fillCircle(x + 9, y - 6, 2.5);
  }

  _ravenClicked(postIndex) {
    if (PuzzleManager.isSolved('veldenmoor_sequence')) return;
    if (!StateManager.hasFlag('oswin_coin_solved')) {
      this._showPrompt('Talk to Oswin first');
      this.time.delayedCall(1200, () => this._hidePrompt());
      return;
    }

    this._seqBuffer.push(postIndex);
    const step = this._seqBuffer.length;
    const PI_ORDER = [3, 1, 4, 1, 5];

    // Flash the clicked raven
    const raven = this._ravens[postIndex];
    if (raven) {
      const corruption = StateManager.get('corruption') || 0;
      this._drawRavenLit(raven.g, raven.x, raven.y);
      this.time.delayedCall(300, () => this._drawRaven(raven.g, raven.x, raven.y, corruption, false));
    }

    // Draw progress
    this._drawSeqProgress();

    // Check against Pi sequence
    const correct = PI_ORDER[step - 1] === postIndex;
    if (!correct) {
      // Wrong — shake feedback and reset
      this._seqFeedback.setText('✕ wrong order').setAlpha(1);
      this.tweens.add({ targets: this._seqFeedback, alpha: 0, duration: 800, delay: 600 });
      this._seqBuffer = [];
      this._seqGraphics.clear();
      this._drawSeqProgress();
      StateManager.addMarenNote(`raven sequence: wrong. I'll watch them again.`);
      return;
    }

    if (step === 5) {
      // Complete!
      PuzzleManager.attempt('veldenmoor_sequence', PI_ORDER);
      this._seqFeedback.setText('✓').setAlpha(1);
      this.tweens.add({ targets: this._seqFeedback, alpha: 0, duration: 1200, delay: 800 });
      this._seqBuffer = [];
      this._seqGraphics.clear();
      // Ravens react — all light up briefly
      this._ravens.forEach((r, i) => {
        this.time.delayedCall(i * 100, () => {
          this._drawRavenLit(r.g, r.x, r.y);
          this.time.delayedCall(400, () => {
            const c = StateManager.get('corruption') || 0;
            this._drawRaven(r.g, r.x, r.y, c, true);
          });
        });
      });
      StateManager.addMarenNote(
        `3, 1, 4, 1, 5. Pi. Ida's quiet joke, ` +
        `buried in the raven landing order of a 2009 Flash game. ` +
        `the gate is open.`
      );
    } else {
      // Partial progress feedback
      this._seqFeedback.setText(`${step}/5`).setAlpha(0.7);
    }
  }

  _drawRavenLit(g, x, y) {
    g.clear();
    g.fillStyle(0xd4a853, 1);
    g.fillEllipse(x, y, 20, 13);
    g.fillEllipse(x + 6, y - 5, 13, 10);
    g.fillTriangle(x + 11, y - 5, x + 20, y - 3, x + 10, y + 1);
    g.fillStyle(0xffd166, 1);
    g.fillCircle(x + 9, y - 6, 2.5);
  }

  _drawSeqProgress() {
    const W = this.scale.width;
    const H = this.scale.height;
    this._seqGraphics.clear();
    if (this._seqBuffer.length === 0) return;

    // Draw small dots below lamp posts for each correctly entered step
    const PI_ORDER = [3, 1, 4, 1, 5];
    this._seqBuffer.forEach((val, i) => {
      const lx = this._lampPositions[val];
      const ly = H * 0.32 + 8;
      this._seqGraphics.fillStyle(0xd4a853, 0.8);
      this._seqGraphics.fillCircle(lx, ly, 4);
    });
  }

  // ─── Gate (Workshop entrance) ─────────────────────────────────────────────

  _spawnGate(W, H) {
    const gx = W * 0.415;
    const gy = H * 0.32 - 80;
    const locked = !PuzzleManager.isSolved('veldenmoor_sequence');

    this._gate = { x: gx, y: gy, locked, g: this.add.graphics().setDepth(8) };
    this._drawGate(locked);

    // Interaction zone
    this._registerInteractable(gx + 22, gy + 50, 36,
      locked ? 'Gate locked  (solve raven sequence)' : 'Enter Workshop  [E]',
      () => {
        if (this._gate.locked) {
          DialogueEngine.start(this, {
            startNode: 'locked',
            nodes: {
              locked: {
                speaker: 'SYSTEM',
                text: `The gate is sealed with an old mechanism.\n\nFive positions. Particular order.\n\nThe ravens know.`,
              }
            }
          });
        } else {
          this._descendToLayer2();
        }
      }
    );
  }

  _drawGate(locked) {
    const { x: gx, y: gy } = this._gate;
    const g = this._gate.g;
    g.clear();

    const postColor = locked ? 0x4a3820 : 0x8a6030;
    const barColor  = locked ? 0x3a2e18 : 0x705020;
    const glowColor = locked ? null     : 0xd4a853;

    // Gate posts
    g.fillStyle(postColor, 1);
    g.fillRect(gx,      gy, 10, 90);
    g.fillRect(gx + 34, gy, 10, 90);

    // Horizontal bars
    g.fillStyle(barColor, 1);
    [0.15, 0.4, 0.65, 0.85].forEach(t => {
      g.fillRect(gx + 10, gy + 90 * t, 24, 5);
    });

    // Arch top
    g.lineStyle(3, barColor, 1);
    g.beginPath();
    g.arc(gx + 22, gy + 12, 22, Math.PI, 0, false);
    g.strokePath();

    // Lock or handle
    if (locked) {
      g.fillStyle(0x6a4820, 1);
      g.fillRect(gx + 16, gy + 52, 12, 10);
      g.lineStyle(2, 0x4a3010, 1);
      g.strokeRect(gx + 16, gy + 52, 12, 10);
      g.beginPath();
      g.arc(gx + 22, gy + 52, 5, Math.PI, 0);
      g.strokePath();
    } else {
      // Glow — gate is open
      g.fillStyle(glowColor, 0.15);
      g.fillRect(gx + 10, gy, 24, 90);
      g.lineStyle(1, glowColor, 0.4);
      g.strokeRect(gx + 10, gy, 24, 90);
      // Handle
      g.fillStyle(0xd4a853, 1);
      g.fillCircle(gx + 22, gy + 58, 4);
    }

    // Gate label
    this.add.text(gx + 22, gy - 12, locked ? '🔒' : '▼', {
      fontFamily: 'monospace', fontSize: locked ? '12px' : '14px',
      color: locked ? '#6a4820' : '#d4a853'
    }).setOrigin(0.5, 1).setDepth(9);
  }

  _unlockGate() {
    this._gate.locked = false;
    this._drawGate(false);

    // Update interactable label
    const gateInteract = this._interactables.find(i => Math.abs(i.x - (this._gate.x + 22)) < 5);
    if (gateInteract) gateInteract.label = 'Enter Workshop  [E]';

    // Brief flash
    const flash = this.add.graphics().setDepth(100);
    const W = this.scale.width, H = this.scale.height;
    this.tweens.addCounter({
      from: 0, to: 1, duration: 300, yoyo: true,
      onUpdate: t => {
        flash.clear();
        flash.fillStyle(0xd4a853, t.getValue() * 0.12);
        flash.fillRect(0, 0, W, H);
      },
      onComplete: () => flash.clear()
    });
  }

  // ─── Player ───────────────────────────────────────────────────────────────

  _spawnPlayer(px, py) {
    this._player = {
      x: px, y: py, speed: 130,
      g: this.add.graphics().setDepth(30)
    };
    this._drawPlayer();
  }

  _drawPlayer() {
    const p = this._player;
    const corruption = StateManager.get('corruption') || 0;
    const color = Palette.lerp(0xffd166, 0xa05030, corruption * 0.7);
    p.g.clear();
    p.g.fillStyle(color, 0.9);
    p.g.fillCircle(p.x, p.y, 8);
    p.g.lineStyle(2, Palette.lerp(0xf0a030, 0x603020, corruption), 0.5);
    p.g.strokeCircle(p.x, p.y, 13);
  }

  // ─── Coin ─────────────────────────────────────────────────────────────────

  _showCoin(W, H) {
    if (this._coinSprite) return;
    const cx = W - 28, cy = H - 48;
    this._coinSprite = this.add.graphics().setDepth(55);
    this._coinSprite.fillStyle(0xd4a853, 1);
    this._coinSprite.fillCircle(cx, cy, 10);
    this._coinSprite.lineStyle(1.5, 0xa07820, 1);
    this._coinSprite.strokeCircle(cx, cy, 10);
    this.add.text(cx, cy, '✦', {
      fontFamily: 'monospace', fontSize: '9px', color: '#7a5010'
    }).setOrigin(0.5, 0.5).setDepth(56);
    this.add.text(cx, cy + 16, 'coin', {
      fontFamily: 'monospace', fontSize: '8px', color: '#8a6828'
    }).setOrigin(0.5, 0).setDepth(56);
    // Pulse
    this.tweens.add({
      targets: this._coinSprite, alpha: { from: 1, to: 0.6 },
      duration: 900, yoyo: true, repeat: -1
    });
  }

  // ─── Browser frame ────────────────────────────────────────────────────────

  _drawBrowserFrame(W, H) {
    const f = this.add.graphics().setDepth(50);
    f.fillStyle(0x2e2a24, 1);
    f.fillRect(0, 0, W, 28);
    f.fillStyle(0x1e1a14, 1);
    f.fillRoundedRect(120, 4, W - 250, 20, 3);
    [0xd0442a, 0xe0a020, 0x40a030].forEach((c, i) => {
      f.fillStyle(c, 1); f.fillCircle(16 + i * 20, 14, 6);
    });
    this.add.text(128, 14, 'pilgrim.veldenmoor.net/play', {
      fontFamily: 'monospace', fontSize: '10px', color: '#6a6050'
    }).setOrigin(0, 0.5).setDepth(51);
    this.add.text(W - 10, H - 8, '▶ FLASH PLAYER 10.1', {
      fontFamily: 'monospace', fontSize: '9px', color: '#3a3028'
    }).setOrigin(1, 1).setDepth(51);
    f.fillStyle(0x2e2a24, 1);
    f.fillRect(0, H - 20, W, 20);
  }

  // ─── Interactable system ──────────────────────────────────────────────────

  _registerInteractable(x, y, radius, label, onInteract) {
    this._interactables.push({ x, y, radius, label, onInteract });
  }

  _updateNearestInteractable() {
    if (DialogueEngine.isActive()) {
      if (this._nearestInteractable) {
        this._hidePrompt();
        this._nearestInteractable = null;
      }
      return;
    }

    const px = this._player.x, py = this._player.y;
    let nearest = null, nearestDist = Infinity;

    this._interactables.forEach(item => {
      const dx = px - item.x, dy = py - item.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < item.radius && dist < nearestDist) {
        nearestDist = dist;
        nearest = item;
      }
    });

    if (nearest !== this._nearestInteractable) {
      this._nearestInteractable = nearest;
      if (nearest) this._showPrompt(nearest.label);
      else this._hidePrompt();
    }
  }

  _tryInteract() {
    if (this._nearestInteractable) {
      this._nearestInteractable.onInteract();
    }
  }

  _showPrompt(text) {
    this._promptText.setText(text).setAlpha(1);
  }

  _hidePrompt() {
    this._promptText.setAlpha(0);
  }

  // ─── Fades & transitions ──────────────────────────────────────────────────

  _fadeIn(W, H) {
    const overlay = this.add.graphics().setDepth(1000);
    overlay.fillStyle(0xf5f0e8, 1);
    overlay.fillRect(0, 0, W, H);
    this.tweens.addCounter({
      from: 1, to: 0, duration: 700, ease: 'Sine.easeOut',
      onUpdate: t => {
        overlay.clear();
        overlay.fillStyle(0xf5f0e8, t.getValue());
        overlay.fillRect(0, 0, W, H);
      },
      onComplete: () => overlay.clear()
    });
  }

  _returnToLayer0() {
    this.input.enabled = false;
    DialogueEngine.destroy();
    TransitionEngine.transition(this, 1, 0, () => this.scene.start('Layer0Scene'), null);
  }

  _descendToLayer2() {
    this.input.enabled = false;
    DialogueEngine.destroy();
    StateManager.flag('visited_layer2');
    TransitionEngine.transition(this, 1, 2, () => this.scene.start('Layer2Scene'), null);
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update(time, delta) {
    if (!this.input.enabled) return;
    StateManager.tickPlayTime(delta);

    const dt = delta / 1000;

    // Movement — locked while dialogue active
    if (!DialogueEngine.isActive()) {
      const spd = this._player.speed;
      let moved = false;
      if (this._cursors.left.isDown  || this._wasd.A.isDown) { this._player.x -= spd * dt; moved = true; }
      if (this._cursors.right.isDown || this._wasd.D.isDown) { this._player.x += spd * dt; moved = true; }
      if (this._cursors.up.isDown    || this._wasd.W.isDown) { this._player.y -= spd * dt; moved = true; }
      if (this._cursors.down.isDown  || this._wasd.S.isDown) { this._player.y += spd * dt; moved = true; }
      if (moved) {
        this._player.x = Phaser.Math.Clamp(this._player.x, 20, this.scale.width - 20);
        this._player.y = Phaser.Math.Clamp(this._player.y, 30, this.scale.height - 25);
        this._drawPlayer();
      }
    }

    this._updateNearestInteractable();
    HUD.update(1);
  }

  shutdown() {
    EventBus.off('puzzle:solved');
    DialogueEngine.destroy();
    Oswin.destroy();
    HUD.hide();
    StateManager.save();
  }
}
