/**
 * scenes/MenuScene.js
 * Phase 1: Title / menu screen with animated starfield and instructions.
 */

class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    const { width, height } = this.scale;

    // Starfield background
    this.stars = this.buildStarfield(120);

    // Animated title
    this.add.text(width / 2, 90, 'MATH', {
      fontFamily: CONFIG.FONT_PIXEL,
      fontSize:   '52px',
      color:      CONFIG.COLORS.TEXT_YELLOW,
      stroke:     '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(width / 2, 148, 'INVADERS', {
      fontFamily: CONFIG.FONT_PIXEL,
      fontSize:   '52px',
      color:      CONFIG.COLORS.TEXT_CYAN,
      stroke:     '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 200, 'DEFEND EARTH — SOLVE MATH', {
      fontFamily: CONFIG.FONT_PIXEL,
      fontSize:   '10px',
      color:      CONFIG.COLORS.TEXT_MAIN,
      alpha:      0.8,
    }).setOrigin(0.5);

    // Alien showcase row
    this.buildAlienShowcase(width, 255);

    // Instructions
    this.buildInstructions(width, height);

    // Hi-score
    const hi = ScoreTracker.loadHiScore();
    this.add.text(width / 2, height - 80, `HI-SCORE: ${String(hi).padStart(6, '0')}`, {
      fontFamily: CONFIG.FONT_PIXEL,
      fontSize:   '12px',
      color:      CONFIG.COLORS.TEXT_YELLOW,
    }).setOrigin(0.5);

    // Press ENTER prompt (blinking)
    const startTxt = this.add.text(width / 2, height - 48, 'PRESS  ENTER  TO  PLAY', {
      fontFamily: CONFIG.FONT_PIXEL,
      fontSize:   '13px',
      color:      CONFIG.COLORS.TEXT_MAIN,
    }).setOrigin(0.5);

    this.tweens.add({
      targets:  startTxt,
      alpha:    0,
      duration: 600,
      ease:     'Sine.easeInOut',
      yoyo:     true,
      repeat:   -1,
    });

    // Also show stats button hint
    this.add.text(width / 2, height - 22, 'S = STATS    ESC = QUIT', {
      fontFamily: CONFIG.FONT_PIXEL,
      fontSize:   '8px',
      color:      'rgba(0,229,255,0.5)',
    }).setOrigin(0.5);

    // Input
    this.input.keyboard.on('keydown-ENTER', () => {
      ScoreTracker.start();
      this.scene.start('GameScene', { level: 1 });
    });
    this.input.keyboard.on('keydown-S', () => {
      this.scene.start('StatsScene');
    });

    ScoreTracker.hideHUD();
  }

  buildStarfield(count) {
    const { width, height } = this.scale;
    const stars = [];
    for (let i = 0; i < count; i++) {
      const x    = Phaser.Math.Between(0, width);
      const y    = Phaser.Math.Between(0, height);
      const size = Math.random() < 0.8 ? 1 : 2;
      const s    = this.add.rectangle(x, y, size, size, 0xffffff, Math.random() * 0.8 + 0.2);
      s.speed    = Math.random() * 0.4 + 0.1;
      stars.push(s);
    }
    this.starData = stars;
    return stars;
  }

  buildAlienShowcase(width, y) {
    const types  = ['alien_0', 'alien_1', 'alien_2'];
    const labels = ['TOP ROW', 'MID ROW', 'BOT ROW'];
    const pts    = ['= 30 PTS', '= 20 PTS', '= 10 PTS'];
    const cols   = [CONFIG.COLORS.TEXT_MAIN, CONFIG.COLORS.TEXT_CYAN, CONFIG.COLORS.TEXT_PINK];
    const gap    = 200;
    const startX = width / 2 - gap;

    for (let i = 0; i < 3; i++) {
      const x = startX + i * gap;
      this.add.image(x - 50, y, types[i]).setScale(1.2);
      this.add.text(x - 28, y - 8, pts[i], {
        fontFamily: CONFIG.FONT_PIXEL,
        fontSize:   '9px',
        color:      Phaser.Display.Color.IntegerToColor(cols[i]).rgba,
      });
    }
  }

  buildInstructions(width, height) {
    const cx = width / 2;
    const y0 = 310;

    const lines = [
      { text: '── HOW TO PLAY ──',   color: CONFIG.COLORS.TEXT_YELLOW, size: '10px' },
      { text: '← → MOVE SHIP',       color: CONFIG.COLORS.TEXT_CYAN,   size: '9px'  },
      { text: 'SPACE = FIRE',        color: CONFIG.COLORS.TEXT_CYAN,   size: '9px'  },
      { text: 'TYPE ANSWER + ENTER', color: CONFIG.COLORS.TEXT_CYAN,   size: '9px'  },
      { text: '',                     color: '',                         size: '9px'  },
      { text: 'SHOOT THE ALIEN',     color: CONFIG.COLORS.TEXT_MAIN,   size: '9px'  },
      { text: 'WITH THE CORRECT ANSWER!', color: CONFIG.COLORS.TEXT_MAIN, size: '9px' },
    ];

    lines.forEach((line, i) => {
      if (!line.text) return;
      this.add.text(cx, y0 + i * 22, line.text, {
        fontFamily: CONFIG.FONT_PIXEL,
        fontSize:   line.size,
        color:      line.color,
      }).setOrigin(0.5);
    });
  }

  update() {
    // Scroll stars
    if (this.starData) {
      for (const s of this.starData) {
        s.y += s.speed;
        if (s.y > this.scale.height) s.y = 0;
      }
    }
  }
}
