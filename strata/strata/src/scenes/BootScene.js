/**
 * STRATA — BootScene
 * Zero-asset procedural loading screen.
 * Progress bar counts to 100% then pauses at 99% for exactly 2 seconds.
 * This is Maren's first joke, and the game's first warning.
 */
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const cx = W / 2;
    const cy = H / 2;

    const g = this.add.graphics();

    // Background — deep near-black with very subtle warm tint
    g.fillStyle(0x0a0906, 1);
    g.fillRect(0, 0, W, H);

    // Thin horizontal rule — top third
    g.lineStyle(1, 0x2a2520, 1);
    g.beginPath();
    g.moveTo(80, cy - 80);
    g.lineTo(W - 80, cy - 80);
    g.strokePath();

    // STRATA wordmark — procedural letterforms
    this._drawWordmark(g, cx, cy - 120, W);

    // Subtitle
    const subtitle = this.add.text(cx, cy - 75, 'a data archaeology tool', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#4a4540',
      letterSpacing: 4
    }).setOrigin(0.5, 0.5);

    // Version / build string
    this.add.text(W - 20, H - 20, 'build 0.1.0 — lumen collective internal', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#2a2520'
    }).setOrigin(1, 1);

    // Progress bar
    const barW = 340;
    const barH = 2;
    const barX = cx - barW / 2;
    const barY = cy + 40;

    // Bar background track
    g.lineStyle(1, 0x2a2520, 1);
    g.strokeRect(barX, barY, barW, barH);

    const barFill = this.add.graphics();

    // Status text
    const statusText = this.add.text(barX, barY + 14, 'initializing cadence environment...', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#3a3530'
    }).setOrigin(0, 0);

    const pctText = this.add.text(barX + barW, barY - 14, '0%', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#4a4540'
    }).setOrigin(1, 0);

    // Animate progress bar
    let progress = 0;
    let phase = 'loading'; // 'loading' | 'pause99' | 'complete'
    let pauseTimer = 0;
    let paused99 = false;

    const statusMessages = [
      { at: 0.05, msg: 'mounting archive volume...' },
      { at: 0.15, msg: 'scanning project: PILGRIM (2009)' },
      { at: 0.28, msg: 'indexing layer structure...' },
      { at: 0.42, msg: 'verifying data integrity...' },
      { at: 0.55, msg: 'loading cadenceos shell...' },
      { at: 0.67, msg: 'establishing lumen remote connection...' },
      { at: 0.78, msg: 'recovering workshop fragments...' },
      { at: 0.88, msg: 'deep archive: unlocked' },
      { at: 0.95, msg: 'preparing workspace for: voss, m.' },
      { at: 0.99, msg: 'almost there...' },
    ];

    let msgIndex = 0;

    // Cursor blink on the status line
    let cursorVisible = true;
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => { cursorVisible = !cursorVisible; }
    });

    this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (phase === 'complete') return;

        if (phase === 'pause99') {
          pauseTimer += 16;
          // Blinking pct text at 99%
          pctText.setText(cursorVisible ? '99%' : '   ');
          if (pauseTimer >= 2200) {
            phase = 'complete';
            pctText.setText('100%').setColor('#a09880');
            statusText.setText('ready.').setColor('#a09880');
            barFill.clear();
            barFill.fillStyle(0xa09880, 1);
            barFill.fillRect(barX + 1, barY, barW - 2, barH);
            this.time.delayedCall(600, () => this._launch());
          }
          return;
        }

        // Normal loading phase
        progress = Math.min(progress + 0.004, 0.99);

        // Update status messages
        while (msgIndex < statusMessages.length && progress >= statusMessages[msgIndex].at) {
          statusText.setText(statusMessages[msgIndex].msg + (cursorVisible ? '_' : ' '));
          msgIndex++;
        }

        pctText.setText(Math.floor(progress * 100) + '%');

        barFill.clear();
        barFill.fillStyle(0x6a6050, 1);
        barFill.fillRect(barX + 1, barY, (barW - 2) * progress, barH);

        if (progress >= 0.99 && !paused99) {
          paused99 = true;
          phase = 'pause99';
          statusText.setText('almost there...');
        }
      }
    });

    // Fade in from black
    const overlay = this.add.graphics();
    overlay.setDepth(100);
    overlay.fillStyle(0x000000, 1);
    overlay.fillRect(0, 0, W, H);
    this.tweens.addCounter({
      from: 1, to: 0, duration: 1200, ease: 'Sine.easeOut',
      onUpdate: (tween) => {
        overlay.clear();
        overlay.fillStyle(0x000000, tween.getValue());
        overlay.fillRect(0, 0, W, H);
      },
      onComplete: () => overlay.clear()
    });
  }

  _drawWordmark(g, cx, cy, W) {
    // STRATA in large procedural block letters using graphics primitives
    // Each letter is drawn as filled rectangles — zero fonts, pure geometry
    const lh = 42;   // letter height
    const lw = 26;   // letter width
    const thick = 5; // stroke thickness
    const gap = 10;  // gap between letters
    const color = 0x8a7e6e;
    const word = 'STRATA';
    const totalW = word.length * lw + (word.length - 1) * gap;
    let x = cx - totalW / 2;

    g.fillStyle(color, 1);

    const letters = {
      S: (x, y) => {
        g.fillRect(x, y, lw, thick);
        g.fillRect(x, y, thick, lh / 2);
        g.fillRect(x, y + lh / 2 - thick / 2, lw, thick);
        g.fillRect(x + lw - thick, y + lh / 2, thick, lh / 2);
        g.fillRect(x, y + lh - thick, lw, thick);
      },
      T: (x, y) => {
        g.fillRect(x, y, lw, thick);
        g.fillRect(x + lw / 2 - thick / 2, y, thick, lh);
      },
      R: (x, y) => {
        g.fillRect(x, y, thick, lh);
        g.fillRect(x, y, lw, thick);
        g.fillRect(x + lw - thick, y, thick, lh / 2);
        g.fillRect(x, y + lh / 2 - thick / 2, lw, thick);
        g.fillRect(x + lw / 2, y + lh / 2, lw / 2, lh / 2);
      },
      A: (x, y) => {
        g.fillRect(x, y, thick, lh);
        g.fillRect(x + lw - thick, y, thick, lh);
        g.fillRect(x, y, lw, thick);
        g.fillRect(x, y + lh / 2 - thick / 2, lw, thick);
      }
    };

    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if (letters[ch]) letters[ch](x + i * (lw + gap), cy - lh / 2);
    }
  }

  _launch() {
    // Fade to white then into Layer 0
    const W = this.scale.width;
    const H = this.scale.height;
    const overlay = this.add.graphics().setDepth(200);

    this.tweens.addCounter({
      from: 0, to: 1, duration: 600, ease: 'Sine.easeIn',
      onUpdate: (tween) => {
        overlay.clear();
        overlay.fillStyle(0xf5f0e8, tween.getValue());
        overlay.fillRect(0, 0, W, H);
      },
      onComplete: () => {
        this.scene.start('Layer0Scene');
      }
    });
  }
}
