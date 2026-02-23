// ============================================================
//  AXIOM BREAK — LeaderboardScene.js  [PHASE 3]
//
//  Two modes:
//    ENTRY  — player types 3-char initials after a high score run
//    VIEW   — browse top 10 from the main menu
//
//  Data in:  { score, level, fromGame: true/false }
//  On exit:  → 'Menu'
// ============================================================

class LeaderboardScene extends Phaser.Scene {
  constructor() { super({ key: 'Leaderboard' }); }

  init(data) {
    this._score    = data.score    || 0;
    this._level    = data.level    || 0;
    this._fromGame = data.fromGame || false;
    this._isEntry  = this._fromGame && Leaderboard.isHighScore(this._score);
    this._initials = ['A', 'A', 'A'];
    this._cursor   = 0;
    this._submitted = false;
    this._rank     = null;
  }

  create() {
    const W = AXIOM.WIDTH, H = AXIOM.HEIGHT;
    AudioSynth.playMusic('ambient');

    // BG
    const bg = this.add.graphics();
    bg.fillStyle(AXIOM.COLORS.BG, 1).fillRect(0, 0, W, H);
    this._drawGrid(bg, W, H);

    // Outer frame
    bg.lineStyle(1, AXIOM.COLORS.WALL_EDGE, 0.35);
    bg.strokeRect(16, 16, W-32, H-32);
    bg.lineStyle(1, AXIOM.COLORS.WALL_EDGE, 0.15);
    bg.strokeRect(22, 22, W-44, H-44);

    // Header
    this.add.text(W/2, 38, 'SIGNAL RECEIVED', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '9px', color: '#006688', letterSpacing: 5,
    }).setOrigin(0.5);

    this.add.text(W/2, 58, 'LEADERBOARD', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '28px', fontStyle: 'bold',
      color: '#00f5ff',
      shadow: { blur: 18, color: '#00f5ff', fill: true },
    }).setOrigin(0.5);

    this.add.graphics()
      .lineStyle(1, AXIOM.COLORS.WALL_EDGE, 0.3)
      .strokeLineShape({ x1: 32, y1: 90, x2: W-32, y2: 90 });

    if (this._isEntry) {
      this._drawEntryMode(W, H);
    } else {
      this._drawViewMode(W, H);
    }
  }

  _drawGrid(g, W, H) {
    g.lineStyle(1, 0x00f5ff, 0.04);
    for (let x = 0; x < W; x += 40) g.strokeLineShape({ x1:x, y1:0, x2:x, y2:H });
    for (let y = 0; y < H; y += 40) g.strokeLineShape({ x1:0, y1:y, x2:W, y2:y });
  }

  // ── ENTRY MODE ──────────────────────────────────────────────

  _drawEntryMode(W, H) {
    this.add.text(W/2, 108, 'NEW HIGH SCORE!', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '14px', color: '#39ff14',
      shadow: { blur: 10, color: '#39ff14', fill: true },
    }).setOrigin(0.5);

    this.add.text(W/2, 130, Utils.formatScore(this._score), {
      fontFamily: 'Orbitron, monospace',
      fontSize: '32px', color: '#ffffff',
      shadow: { blur: 8, color: '#00f5ff', fill: true },
    }).setOrigin(0.5);

    this.add.text(W/2, 168, 'ENTER YOUR INITIALS', {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '10px', color: '#005566', letterSpacing: 4,
    }).setOrigin(0.5);

    // Initials display (3 boxes)
    this._letterTexts = [];
    this._cursorGfxs  = [];
    const boxW = 52, gap = 16;
    const total = 3 * boxW + 2 * gap;
    const startX = W/2 - total/2;

    for (let i = 0; i < 3; i++) {
      const bx = startX + i * (boxW + gap);
      const by = 192;

      const bg = this.add.graphics();
      bg.fillStyle(0x0a1a28, 1).fillRect(bx, by, boxW, 60);
      bg.lineStyle(1, i === 0 ? 0x00f5ff : 0x003344, 0.6);
      bg.strokeRect(bx, by, boxW, 60);
      this._cursorGfxs.push(bg);

      const lt = this.add.text(bx + boxW/2, by + 30, this._initials[i], {
        fontFamily: 'Orbitron, monospace',
        fontSize: '28px', fontStyle: 'bold', color: '#00f5ff',
      }).setOrigin(0.5);
      this._letterTexts.push(lt);
    }

    this.add.text(W/2, 270, '↑↓ CHANGE   →← MOVE   [ENTER] CONFIRM', {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '9px', color: '#003344', letterSpacing: 1,
    }).setOrigin(0.5);

    // ── Draw top-5 for context ────────────────────────────────
    this._drawTopList(W, 300, 5);

    // ── Input handling ────────────────────────────────────────
    this.input.keyboard.on('keydown', (e) => {
      if (this._submitted) return;
      if (e.code === 'ArrowUp')    this._changeLetter(1);
      if (e.code === 'ArrowDown')  this._changeLetter(-1);
      if (e.code === 'ArrowRight') this._moveCursor(1);
      if (e.code === 'ArrowLeft')  this._moveCursor(-1);
      if (e.code === 'Enter')      this._submitEntry();

      // Type A-Z directly
      if (e.key.length === 1 && /[A-Za-z0-9]/.test(e.key)) {
        this._initials[this._cursor] = e.key.toUpperCase();
        this._refreshLetters();
        this._moveCursor(1);
      }
    });
  }

  _changeLetter(dir) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const curr  = this._initials[this._cursor];
    const idx   = chars.indexOf(curr);
    this._initials[this._cursor] = chars[(idx + dir + chars.length) % chars.length];
    this._refreshLetters();
    AudioSynth.play('hit');
  }

  _moveCursor(dir) {
    this._cursor = Utils.clamp(this._cursor + dir, 0, 2);
    this._refreshCursors();
  }

  _refreshLetters() {
    for (let i = 0; i < 3; i++) {
      this._letterTexts[i].setText(this._initials[i]);
    }
  }

  _refreshCursors() {
    const boxW = 52, gap = 16;
    const total = 3 * boxW + 2 * gap;
    const startX = AXIOM.WIDTH/2 - total/2;
    for (let i = 0; i < 3; i++) {
      const bx = startX + i * (boxW + gap);
      const by = 192;
      const g  = this._cursorGfxs[i];
      g.clear();
      g.fillStyle(0x0a1a28, 1).fillRect(bx, by, boxW, 60);
      g.lineStyle(i === this._cursor ? 2 : 1, i === this._cursor ? 0x00f5ff : 0x003344, 0.6);
      g.strokeRect(bx, by, boxW, 60);
    }
  }

  _submitEntry() {
    this._submitted = true;
    const initials = this._initials.join('');
    this._rank     = Leaderboard.addEntry(initials, this._score, this._level);
    AudioSynth.play('portal_open');

    // Flash
    this.cameras.main.flash(200, 0, 200, 100, true);

    // Update list then show exit prompt
    this.time.delayedCall(400, () => {
      this._drawViewMode(AXIOM.WIDTH, AXIOM.HEIGHT, this._rank);
    });
  }

  // ── VIEW MODE ───────────────────────────────────────────────

  _drawViewMode(W, H, highlightRank = null) {
    // Clear entry UI if coming from submission
    if (highlightRank !== null) {
      // Already drawn in entry mode — full redraw would flicker
      // Instead layer on top
    }

    const startY = this._isEntry ? 310 : 100;

    if (!this._isEntry) {
      // Show run stats if coming from game but not a high score
      if (this._fromGame) {
        this.add.text(W/2, 100, `RUN SCORE: ${Utils.formatScore(this._score)}`, {
          fontFamily: 'Orbitron, monospace',
          fontSize: '14px', color: '#006688',
        }).setOrigin(0.5);
        this.add.text(W/2, 124, `SECTOR ${this._level + 1} REACHED`, {
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '10px', color: '#004455',
        }).setOrigin(0.5);
      }
    }

    this._drawTopList(W, startY, 10, highlightRank);

    const exitY = H - 36;
    const exitText = this.add.text(W/2, exitY, '[SPACE] MAIN MENU', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '10px', color: '#00f5ff', letterSpacing: 2,
    }).setOrigin(0.5);

    this.tweens.add({ targets: exitText, alpha: { from: 1, to: 0.2 }, yoyo: true, repeat: -1, duration: 800 });
    this.input.keyboard.once('keydown-SPACE', () => {
      AudioSynth.stopMusic();
      this.scene.start('Menu');
    });
  }

  _drawTopList(W, startY, maxEntries, highlightRank = null) {
    const entries = Leaderboard.getTop(maxEntries);
    const rowH    = 28;
    const cols    = { rank: 52, init: 120, score: 260, sector: 380, date: 480 };

    // Column headers
    this.add.text(cols.rank,  startY, 'RANK',   { ...this._headerStyle() }).setOrigin(0.5, 0);
    this.add.text(cols.init,  startY, 'PILOT',  { ...this._headerStyle() }).setOrigin(0, 0);
    this.add.text(cols.score, startY, 'SCORE',  { ...this._headerStyle() }).setOrigin(0, 0);
    this.add.text(cols.sector,startY, 'SECTOR', { ...this._headerStyle() }).setOrigin(0, 0);
    this.add.text(cols.date,  startY, 'DATE',   { ...this._headerStyle() }).setOrigin(0, 0);

    this.add.graphics()
      .lineStyle(1, AXIOM.COLORS.WALL_EDGE, 0.25)
      .strokeLineShape({ x1: 32, y1: startY + 16, x2: W-32, y2: startY + 16 });

    entries.forEach((entry, i) => {
      const rowY     = startY + 22 + i * rowH;
      const isHighlight = (i + 1) === highlightRank;
      const rowColor = isHighlight ? '#00f5ff' : (i < 3 ? '#aabbcc' : '#445566');
      const style    = { fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', color: rowColor };

      if (isHighlight) {
        this.add.graphics()
          .fillStyle(0x001a2a, 0.8)
          .fillRect(32, rowY - 2, W - 64, rowH - 4);
      }

      this.add.text(cols.rank,   rowY, `${String(i+1).padStart(2,'0')}.`, style).setOrigin(0.5, 0);
      this.add.text(cols.init,   rowY, entry.initials,                    style).setOrigin(0, 0);
      this.add.text(cols.score,  rowY, Utils.formatScore(entry.score),    style).setOrigin(0, 0);
      this.add.text(cols.sector, rowY, `SEC ${String(entry.level||0).padStart(2,'0')}`, style).setOrigin(0, 0);
      this.add.text(cols.date,   rowY, entry.date || '----',              { ...style, fontSize: '9px', color: '#334455' }).setOrigin(0, 0);
    });

    if (entries.length === 0) {
      this.add.text(W/2, startY + 40, 'NO ENTRIES YET', {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '11px', color: '#334455',
      }).setOrigin(0.5);
    }
  }

  _headerStyle() {
    return {
      fontFamily: "'Share Tech Mono', monospace",
      fontSize: '8px', color: '#003344', letterSpacing: 2,
    };
  }
}
