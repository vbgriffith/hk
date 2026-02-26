/**
 * scenes/GameOverScene.js
 * Phase 3: Game over / victory screen with session stats.
 */

class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  init(data) {
    this.summary = data.summary || {};
    this.won     = data.won || false;
  }

  create() {
    const { width, height } = this.scale;
    const S = this.summary;

    ScoreTracker.hideHUD();

    // Background fade
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);

    // Title
    const title = this.won ? 'EARTH SAVED!' : 'GAME OVER';
    const tColor = this.won ? CONFIG.COLORS.TEXT_MAIN : CONFIG.COLORS.TEXT_PINK;
    this.add.text(width / 2, 50, title, {
      fontFamily: CONFIG.FONT_PIXEL,
      fontSize:   '28px',
      color:      tColor,
      stroke:     '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Score highlight
    const isHi = S.score >= (S.hiScore || 0);
    this.add.text(width / 2, 100, isHi ? '★ NEW HI-SCORE! ★' : 'SCORE', {
      fontFamily: CONFIG.FONT_PIXEL,
      fontSize:   '10px',
      color:      CONFIG.COLORS.TEXT_YELLOW,
    }).setOrigin(0.5);

    this.add.text(width / 2, 128, String(S.score).padStart(6, '0'), {
      fontFamily: CONFIG.FONT_HUD,
      fontSize:   '42px',
      fontStyle:  'bold',
      color:      CONFIG.COLORS.TEXT_YELLOW,
    }).setOrigin(0.5);

    // Stats grid
    const stats = [
      ['LEVEL REACHED',  S.level],
      ['ANSWERS',        S.totalAnswers],
      ['CORRECT',        `${S.correctCount}  (${S.accuracy}%)`],
      ['WRONG',          S.wrongCount],
      ['BEST STREAK',    S.maxStreak],
      ['TIME',           Utils.formatTime(S.elapsed)],
    ];

    const col1 = width / 2 - 140;
    const col2 = width / 2 + 60;
    let   sy   = 190;

    for (const [label, val] of stats) {
      this.add.text(col1, sy, label + ':', {
        fontFamily: CONFIG.FONT_PIXEL, fontSize: '8px', color: 'rgba(0,229,255,0.7)',
      }).setOrigin(0, 0.5);
      this.add.text(col2, sy, String(val), {
        fontFamily: CONFIG.FONT_PIXEL, fontSize: '8px', color: '#ffffff',
      }).setOrigin(0, 0.5);
      sy += 22;
    }

    // Per-operation accuracy
    this.add.text(width / 2, sy + 10, '── OPERATION ACCURACY ──', {
      fontFamily: CONFIG.FONT_PIXEL, fontSize: '8px', color: CONFIG.COLORS.TEXT_YELLOW,
    }).setOrigin(0.5);
    sy += 32;

    const ops = Object.entries(S.opStats || {});
    for (const [op, data] of ops) {
      const total  = data.correct + data.wrong;
      const pct    = total > 0 ? Math.round((data.correct / total) * 100) : '--';
      const barW   = total > 0 ? Math.floor((data.correct / total) * 120) : 0;
      const label  = `${op}  ${data.correct}/${total}`;

      this.add.text(col1, sy, label, {
        fontFamily: CONFIG.FONT_PIXEL, fontSize: '8px', color: '#aaa',
      }).setOrigin(0, 0.5);

      // Accuracy bar
      this.add.rectangle(col2, sy, 120, 8, 0x222222).setOrigin(0, 0.5);
      if (barW > 0) this.add.rectangle(col2, sy, barW, 8, CONFIG.COLORS.ALIEN_ROW0).setOrigin(0, 0.5);
      this.add.text(col2 + 128, sy, `${pct}%`, {
        fontFamily: CONFIG.FONT_PIXEL, fontSize: '7px', color: '#fff',
      }).setOrigin(0, 0.5);
      sy += 22;
    }

    // Answer history preview (last 5)
    sy += 10;
    this.add.text(width / 2, sy, '── LAST ANSWERS ──', {
      fontFamily: CONFIG.FONT_PIXEL, fontSize: '8px', color: CONFIG.COLORS.TEXT_CYAN,
    }).setOrigin(0.5);
    sy += 20;

    const history = (S.history || []).slice(-5);
    for (const h of history) {
      const color = h.wasCorrect ? CONFIG.COLORS.TEXT_MAIN : CONFIG.COLORS.TEXT_PINK;
      const mark  = h.wasCorrect ? '✓' : '✗';
      this.add.text(width / 2, sy, `${mark} ${h.question}  ANS:${h.given}`, {
        fontFamily: CONFIG.FONT_PIXEL, fontSize: '7px', color,
      }).setOrigin(0.5);
      sy += 16;
    }

    // Buttons
    const btnY = height - 55;
    const play = this.add.text(width / 2 - 100, btnY, '[ PLAY AGAIN ]', {
      fontFamily: CONFIG.FONT_PIXEL, fontSize: '10px', color: CONFIG.COLORS.TEXT_MAIN,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const menu = this.add.text(width / 2 + 100, btnY, '[ MENU ]', {
      fontFamily: CONFIG.FONT_PIXEL, fontSize: '10px', color: CONFIG.COLORS.TEXT_CYAN,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    play.on('pointerover',  () => play.setColor(CONFIG.COLORS.TEXT_YELLOW));
    play.on('pointerout',   () => play.setColor(CONFIG.COLORS.TEXT_MAIN));
    play.on('pointerdown',  () => { ScoreTracker.start(); this.scene.start('GameScene', { level: 1 }); });

    menu.on('pointerover',  () => menu.setColor(CONFIG.COLORS.TEXT_YELLOW));
    menu.on('pointerout',   () => menu.setColor(CONFIG.COLORS.TEXT_CYAN));
    menu.on('pointerdown',  () => this.scene.start('MenuScene'));

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-ENTER', () => { ScoreTracker.start(); this.scene.start('GameScene', { level: 1 }); });
    this.input.keyboard.on('keydown-ESCAPE', () => this.scene.start('MenuScene'));

    this.add.text(width / 2, height - 28, 'ENTER = PLAY AGAIN   ESC = MENU', {
      fontFamily: CONFIG.FONT_PIXEL, fontSize: '7px', color: 'rgba(255,255,255,0.3)',
    }).setOrigin(0.5);
  }
}
