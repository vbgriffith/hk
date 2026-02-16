/* js/scenes/MainMenuScene.js — Title screen */
'use strict';

class MainMenuScene extends Phaser.Scene {
  constructor() { super(C.SCENE_MENU); }

  create() {
    const W = C.WIDTH, H = C.HEIGHT;
    const save = SaveSystem.load();

    // ── Background ───────────────────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x000008, 0x000008, 0x050512, 0x050512, 1);
    bg.fillRect(0, 0, W, H);

    // Distant pillars
    this._drawPillars(bg, W, H);

    // Particles — fireflies
    this._spawnFireflies(W, H);

    // ── Title ────────────────────────────────────────────────────────────
    this.add.text(W / 2, H * 0.22, 'HOLLOW', {
      fontFamily: 'Cinzel',
      fontSize: 28,
      fontStyle:  'bold',
      color:      '#d4cfc9',
      letterSpacing: 14,
    }).setOrigin(0.5).setAlpha(0);

    this.add.text(W / 2, H * 0.37, 'KNIGHT', {
      fontFamily: 'Cinzel',
      fontSize: 28,
      fontStyle:  'bold',
      color:      '#d4cfc9',
      letterSpacing: 14,
    }).setOrigin(0.5).setAlpha(0);

    // Subtitle
    this.add.text(W / 2, H * 0.50, 'Web Edition — Complete', {
      fontFamily: 'IM Fell English',
      fontStyle:  'italic',
      fontSize: 7,
      color:      '#5a5a6a',
    }).setOrigin(0.5).setAlpha(0);

    // Fade in all text
    this.children.getAll().forEach((obj, i) => {
      if (obj.type === 'Text') {
        this.tweens.add({ targets: obj, alpha: 1, duration: 1200,
                          delay: 400 + i * 200, ease: 'Sine.easeOut' });
      }
    });

    // ── Menu items ───────────────────────────────────────────────────────
    const menuY = H * 0.65;
    const items = save
      ? [{ label: 'Continue',   action: () => this._startGame(save) },
         { label: 'New Journey',action: () => this._newGame() },
         { label: 'Credits',    action: () => this._showCredits() }]
      : [{ label: 'Begin',      action: () => this._newGame() },
         { label: 'Credits',    action: () => this._showCredits() }];

    this._menuSel = 0;
    this._menuTexts = items.map((item, i) => {
      const t = this.add.text(W / 2, menuY + i * 18, item.label, {
        fontFamily: 'Cinzel',
        fontSize: 9,
        color:    '#888888',
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({ targets: t, alpha: 1, duration: 600,
                        delay: 1200 + i * 150 });
      return { text: t, action: item.action };
    });

    // Soul vessel decoration
    this._drawSoulVessel(W / 2 - 80, menuY - 8);

    // ── Input ────────────────────────────────────────────────────────────
    this._cursor = 0;
    this._items  = items;

    this.input.keyboard.on('keydown', (e) => {
      if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.UP ||
          e.keyCode === Phaser.Input.Keyboard.KeyCodes.W) {
        this._navigate(-1);
      } else if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.DOWN ||
                 e.keyCode === Phaser.Input.Keyboard.KeyCodes.S) {
        this._navigate(1);
      } else if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.Z ||
                 e.keyCode === Phaser.Input.Keyboard.KeyCodes.ENTER ||
                 e.keyCode === Phaser.Input.Keyboard.KeyCodes.SPACE) {
        this._select();
      }
    });

    this._updateMenuDisplay();
    this.cameras.main.setZoom(C.SCALE);
    this.cameras.main.centerOn(W / 2, H / 2);
  }

  _drawPillars(g, W, H) {
    g.fillStyle(0x0d0d1a, 0.8);
    // Left pillar
    g.fillRect(20, H * 0.3, 18, H * 0.7);
    g.fillRect(16, H * 0.3, 26, 4);
    // Right pillar
    g.fillRect(W - 38, H * 0.3, 18, H * 0.7);
    g.fillRect(W - 42, H * 0.3, 26, 4);
    // Distant arch
    g.strokeStyle = 0x1a1a2a; g.lineWidth = 2;
    g.strokeRect(60, H * 0.1, W - 120, H * 0.6);
  }

  _spawnFireflies(W, H) {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const g = this.add.graphics();
      g.setPosition(
        Phaser.Math.Between(10, W - 10),
        Phaser.Math.Between(H * 0.15, H * 0.7)
      );
      g.fillStyle(0x5ae3e3, 0.6);
      g.fillCircle(0, 0, 0.8);

      this.tweens.add({
        targets: g,
        x: g.x + Phaser.Math.Between(-30, 30),
        y: g.y + Phaser.Math.Between(-20, 20),
        alpha: { from: 0, to: 0.7 },
        duration: Phaser.Math.Between(2000, 5000),
        delay: Phaser.Math.Between(0, 3000),
        yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  _drawSoulVessel(x, y) {
    const g = this.add.graphics();
    g.lineStyle(1, 0x5ae3e3, 0.3);
    g.strokeRect(x, y, 4, 22);
    g.fillStyle(0x5ae3e3, 0.15);
    g.fillRect(x + 1, y + 1, 2, 20);
  }

  _navigate(dir) {
    this._cursor = (this._cursor + dir + this._items.length) % this._items.length;
    this._updateMenuDisplay();
    // Soft audio cue
  }

  _updateMenuDisplay() {
    this._menuTexts?.forEach((item, i) => {
      if (i === this._cursor) {
        item.text.setColor('#d4cfc9');
        item.text.setFontSize(10);
      } else {
        item.text.setColor('#555566');
        item.text.setFontSize(9);
      }
    });
  }

  _select() {
    this._items[this._cursor]?.action();
  }

  _startGame(save) {
    this.cameras.main.fadeOut(500, 0, 0, 0, () => {
      this.scene.start(C.SCENE_GAME, { save });
    });
  }

  _newGame() {
    SaveSystem.clear();
    const save = SaveSystem.defaultSave();
    // Starting abilities for complete edition
    save.abilities.dash       = true;
    save.abilities.walljump   = true;
    save.abilities.fireball   = true;
    save.abilities.doublejump = false; // earned in Greenpath
    save.abilities.dreamnail  = false; // earned at Blue Lake
    save.abilities.dive       = false; // earned after Soul Master
    // Starting charms
    save.ownedCharms  = ['wayward_compass', 'gathering_swarm'];
    save.charmSlots   = 3;
    save.benchRoom    = 'crossroads_entrance';
    save.benchSpawn   = 'default';
    this._startGame(save);
  }

  _showCredits() {
    const W = C.WIDTH, H = C.HEIGHT;
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.9);
    panel.fillRect(20, 20, W - 40, H - 40);

    const lines = [
      { text: 'HOLLOW KNIGHT — Web Clone', style: { fontFamily: 'Cinzel', fontSize: 9, color: '#d4cfc9' } },
      { text: '', style: {} },
      { text: 'Original game by Team Cherry', style: { fontFamily: 'IM Fell English', fontStyle: 'italic', fontSize: 7, color: '#888888' } },
      { text: '', style: {} },
      { text: 'Phase I — Forgotten Crossroads', style: { fontFamily: 'Cinzel', fontSize: 7, color: '#5ae3e3' } },
      { text: 'Powered by Phaser 3', style: { fontFamily: 'IM Fell English', fontSize: 6, color: '#555566' } },
      { text: '', style: {} },
      { text: '[ESC] to close', style: { fontFamily: 'Cinzel', fontSize: 6, color: '#555555' } },
    ];

    const texts = lines.map((l, i) => {
      if (!l.text) return null;
      return this.add.text(W / 2, 40 + i * 16, l.text, l.style).setOrigin(0.5);
    }).filter(Boolean);

    const close = () => {
      panel.destroy();
      texts.forEach(t => t.destroy());
      this.input.keyboard.off('keydown', onKey);
    };

    const onKey = (e) => {
      if (e.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) close();
    };
    this.input.keyboard.on('keydown', onKey);
  }
}
