/**
 * scenes/StatsScene.js
 * Phase 3: All-time statistics and answer history viewer.
 */

class StatsScene extends Phaser.Scene {
  constructor() { super({ key: 'StatsScene' }); }

  create() {
    const { width, height } = this.scale;
    const allTime = ScoreTracker.loadHiScore ? {
      hiScore:   ScoreTracker.loadHiScore(),
      ...this.loadStats(),
    } : {};

    ScoreTracker.hideHUD();

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x050a14);

    // Title
    this.add.text(width / 2, 36, 'ALL-TIME STATS', {
      fontFamily: CONFIG.FONT_PIXEL, fontSize: '18px', color: CONFIG.COLORS.TEXT_YELLOW,
    }).setOrigin(0.5);

    this.add.text(width / 2, 62, `HI-SCORE: ${String(allTime.hiScore || 0).padStart(6, '0')}`, {
      fontFamily: CONFIG.FONT_HUD, fontSize: '22px', fontStyle: 'bold', color: CONFIG.COLORS.TEXT_YELLOW,
    }).setOrigin(0.5);

    // Overall stats
    const at   = allTime.data || {};
    const tc   = at.totalCorrect || 0;
    const tw   = at.totalWrong   || 0;
    const tt   = tc + tw;
    const pct  = tt > 0 ? Math.round((tc / tt) * 100) : 0;

    const rows = [
      ['GAMES PLAYED',    at.gamesPlayed || 0],
      ['TOTAL CORRECT',   tc],
      ['TOTAL WRONG',     tw],
      ['OVERALL ACCURACY',`${pct}%`],
    ];

    const cx  = width / 2;
    const c1  = cx - 150;
    const c2  = cx + 50;
    let   sy  = 100;

    this.add.text(cx, sy, '── OVERALL ──', {
      fontFamily: CONFIG.FONT_PIXEL, fontSize: '8px', color: CONFIG.COLORS.TEXT_CYAN,
    }).setOrigin(0.5);
    sy += 22;

    for (const [label, val] of rows) {
      this.add.text(c1, sy, label + ':', {
        fontFamily: CONFIG.FONT_PIXEL, fontSize: '8px', color: 'rgba(0,229,255,0.7)',
      }).setOrigin(0, 0.5);
      this.add.text(c2, sy, String(val), {
        fontFamily: CONFIG.FONT_PIXEL, fontSize: '8px', color: '#fff',
      }).setOrigin(0, 0.5);
      sy += 20;
    }

    // Per-op breakdown
    sy += 14;
    this.add.text(cx, sy, '── BY OPERATION ──', {
      fontFamily: CONFIG.FONT_PIXEL, fontSize: '8px', color: CONFIG.COLORS.TEXT_CYAN,
    }).setOrigin(0.5);
    sy += 22;

    const opData = at.opStats || { '+': {correct:0,wrong:0}, '-': {correct:0,wrong:0}, '×': {correct:0,wrong:0}, '÷': {correct:0,wrong:0} };
    const opColors = {
      '+': CONFIG.COLORS.ALIEN_ROW0,
      '-': CONFIG.COLORS.ALIEN_ROW1,
      '×': CONFIG.COLORS.TEXT_YELLOW,
      '÷': CONFIG.COLORS.TEXT_PINK,
    };

    for (const [op, data] of Object.entries(opData)) {
      const tot = data.correct + data.wrong;
      const p   = tot > 0 ? Math.round((data.correct / tot) * 100) : 0;
      const bW  = tot > 0 ? Math.floor((data.correct / tot) * 160) : 0;
      const opColor = opColors[op] || 0xffffff;

      this.add.text(c1, sy, op, {
        fontFamily: CONFIG.FONT_PIXEL, fontSize: '14px',
        color: Phaser.Display.Color.IntegerToColor(opColor).rgba,
      }).setOrigin(0, 0.5);

      this.add.text(c1 + 28, sy, `${data.correct}/${tot}`, {
        fontFamily: CONFIG.FONT_PIXEL, fontSize: '8px', color: '#aaa',
      }).setOrigin(0, 0.5);

      // Bar
      this.add.rectangle(c1 + 90, sy, 160, 10, 0x1a2a3a).setOrigin(0, 0.5);
      if (bW > 0) this.add.rectangle(c1 + 90, sy, bW, 10, opColor).setOrigin(0, 0.5);
      this.add.text(c1 + 258, sy, `${p}%`, {
        fontFamily: CONFIG.FONT_PIXEL, fontSize: '7px', color: '#fff',
      }).setOrigin(0, 0.5);

      sy += 26;
    }

    // Weakness analysis
    sy += 10;
    const weakest = this.findWeakestOp(opData);
    if (weakest) {
      this.add.text(cx, sy, `PRACTICE MORE: ${weakest}`, {
        fontFamily: CONFIG.FONT_PIXEL, fontSize: '9px', color: CONFIG.COLORS.TEXT_PINK,
      }).setOrigin(0.5);
      sy += 20;
      this.add.text(cx, sy, 'You struggle most with this operation!', {
        fontFamily: CONFIG.FONT_PIXEL, fontSize: '7px', color: 'rgba(255,45,120,0.7)',
      }).setOrigin(0.5);
    }

    // Navigation
    const back = this.add.text(cx, height - 36, '[ BACK TO MENU ]', {
      fontFamily: CONFIG.FONT_PIXEL, fontSize: '11px', color: CONFIG.COLORS.TEXT_MAIN,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    back.on('pointerover', () => back.setColor(CONFIG.COLORS.TEXT_YELLOW));
    back.on('pointerout',  () => back.setColor(CONFIG.COLORS.TEXT_MAIN));
    back.on('pointerdown', () => this.scene.start('MenuScene'));

    this.input.keyboard.on('keydown-ESCAPE', () => this.scene.start('MenuScene'));
    this.input.keyboard.on('keydown-ENTER',  () => this.scene.start('MenuScene'));

    const clearBtn = this.add.text(cx, height - 16, 'C = CLEAR ALL STATS', {
      fontFamily: CONFIG.FONT_PIXEL, fontSize: '7px', color: 'rgba(255,45,120,0.4)',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.input.keyboard.on('keydown-C', () => {
      try {
        localStorage.removeItem('mathInvaders_hiScore');
        localStorage.removeItem('mathInvaders_stats');
      } catch {}
      this.scene.restart();
    });
  }

  loadStats() {
    try {
      return { data: JSON.parse(localStorage.getItem('mathInvaders_stats') || 'null') || {} };
    } catch { return { data: {} }; }
  }

  findWeakestOp(opData) {
    let worst = null, worstPct = Infinity;
    for (const [op, d] of Object.entries(opData)) {
      const tot = d.correct + d.wrong;
      if (tot < 3) continue;
      const pct = d.correct / tot;
      if (pct < worstPct) { worstPct = pct; worst = op; }
    }
    return worst;
  }
}
