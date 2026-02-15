/* js/ui/DialogueBox.js — NPC/lore dialogue display */
'use strict';

class DialogueBox {
  constructor(scene) {
    this.scene    = scene;
    this._visible = false;
    this._lines   = [];
    this._index   = 0;
    this._callback= null;
    this._typing  = false;
    this._typeTimer = null;

    this._build();
  }

  _build() {
    const s = this.scene;
    const W = C.WIDTH, H = C.HEIGHT;
    const BH = 52, BY = H - BH - 4, BX = 8;

    // Background panel
    this._panel = s.add.graphics();
    this._panel.setScrollFactor(0).setDepth(C.LAYER_UI + 2);
    this._panel.fillStyle(0x000000, 0.82);
    this._panel.fillRoundedRect(BX, BY, W - BX * 2, BH, 3);
    this._panel.lineStyle(1, 0x5a5a6a, 0.8);
    this._panel.strokeRoundedRect(BX, BY, W - BX * 2, BH, 3);
    this._panel.setVisible(false);

    // Speaker name
    this._speakerText = s.add.text(BX + 8, BY + 5, '', {
      fontFamily: 'Cinzel',
      fontSize: 6,
      color: '#5ae3e3',
    }).setScrollFactor(0).setDepth(C.LAYER_UI + 3).setVisible(false);

    // Body text
    this._bodyText = s.add.text(BX + 8, BY + 15, '', {
      fontFamily: 'IM Fell English',
      fontStyle: 'italic',
      fontSize: 7,
      color: '#d4cfc9',
      wordWrap: { width: W - BX * 2 - 20 },
      lineSpacing: 2,
    }).setScrollFactor(0).setDepth(C.LAYER_UI + 3).setVisible(false);

    // Continue arrow
    this._arrow = s.add.text(W - BX - 10, BY + BH - 10, '▼', {
      fontFamily: 'Arial',
      fontSize: 6,
      color: '#888888',
    }).setScrollFactor(0).setDepth(C.LAYER_UI + 3)
      .setOrigin(1, 1).setVisible(false);

    s.tweens.add({
      targets: this._arrow, y: BY + BH - 8,
      duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  show(lines, onComplete) {
    this._lines    = lines;
    this._index    = 0;
    this._callback = onComplete;
    this._visible  = true;

    this._panel.setVisible(true);
    this._speakerText.setVisible(true);
    this._bodyText.setVisible(true);
    this._arrow.setVisible(true);

    // Pause game physics while talking
    this.scene.physics.pause();

    this._showLine(0);
  }

  _showLine(idx) {
    const line = this._lines[idx];
    if (!line) { this.hide(); return; }

    this._speakerText.setText(line.speaker || '');
    this._typeText(line.text || '');
  }

  _typeText(text) {
    if (this._typeTimer) this._typeTimer.remove();
    this._bodyText.setText('');
    this._typing = true;
    this._arrow.setVisible(false);

    let i = 0;
    const typeNext = () => {
      if (i < text.length) {
        this._bodyText.setText(text.substring(0, i + 1));
        i++;
        const char = text[i - 1];
        const delay = (char === '.' || char === ',' || char === '!') ? 80 : 25;
        this._typeTimer = this.scene.time.delayedCall(delay, typeNext);
      } else {
        this._typing = false;
        this._arrow.setVisible(true);
      }
    };
    typeNext();
  }

  advance() {
    if (!this._visible) return false;

    if (this._typing) {
      // Skip to end of current line
      if (this._typeTimer) this._typeTimer.remove();
      this._bodyText.setText(this._lines[this._index]?.text || '');
      this._typing = false;
      this._arrow.setVisible(true);
      return true;
    }

    this._index++;
    if (this._index >= this._lines.length) {
      this.hide();
    } else {
      this._showLine(this._index);
    }
    return true;
  }

  hide() {
    this._visible = false;
    this._panel.setVisible(false);
    this._speakerText.setVisible(false);
    this._bodyText.setVisible(false);
    this._arrow.setVisible(false);

    // Resume physics
    this.scene.physics.resume();

    if (this._callback) {
      const cb = this._callback;
      this._callback = null;
      cb();
    }
  }

  get isVisible() { return this._visible; }
}


/* ── Pause Menu ─────────────────────────────────────────────────────────── */
class PauseMenu {
  constructor(scene) {
    this.scene   = scene;
    this._visible= false;
    this._sel    = 0;
    this._items  = ['Resume', 'Map', 'Inventory', 'Options', 'Quit'];
    this._build();
  }

  _build() {
    const W = C.WIDTH, H = C.HEIGHT;

    this._bg = this.scene.add.graphics()
      .setScrollFactor(0).setDepth(C.LAYER_UI + 10).setVisible(false);
    this._bg.fillStyle(0x000000, 0.88);
    this._bg.fillRect(0, 0, W, H);

    this._title = this.scene.add.text(W / 2, H * 0.2, 'PAUSED', {
      fontFamily: 'Cinzel',
      fontSize: 14,
      color: '#d4cfc9',
      letterSpacing: 8,
    }).setScrollFactor(0).setDepth(C.LAYER_UI + 11)
      .setOrigin(0.5).setVisible(false);

    this._menuItems = this._items.map((label, i) =>
      this.scene.add.text(W / 2, H * 0.4 + i * 18, label, {
        fontFamily: 'Cinzel',
        fontSize: 8,
        color: '#888888',
      }).setScrollFactor(0).setDepth(C.LAYER_UI + 11)
        .setOrigin(0.5).setVisible(false)
    );
  }

  show() {
    this._visible = true;
    this._sel = 0;
    this._bg.setVisible(true);
    this._title.setVisible(true);
    this._menuItems.forEach(t => t.setVisible(true));
    this._updateSelection();
    this.scene.physics.pause();
  }

  hide() {
    this._visible = false;
    this._bg.setVisible(false);
    this._title.setVisible(false);
    this._menuItems.forEach(t => t.setVisible(false));
    this.scene.physics.resume();
  }

  _updateSelection() {
    this._menuItems.forEach((t, i) => {
      t.setColor(i === this._sel ? '#d4cfc9' : '#555555');
      t.setStyle({ fontSize: i === this._sel ? '9px' : '8px' });
    });
  }

  navigate(dir) {
    this._sel = (this._sel + dir + this._items.length) % this._items.length;
    this._updateSelection();
  }

  select() {
    const item = this._items[this._sel];
    switch (item) {
      case 'Resume':    this.scene.togglePause(); break;
      case 'Map':       this.scene._mapScreen?.show(); break;
      case 'Inventory': break; // TODO
      case 'Options':   break; // TODO
      case 'Quit':      this.scene.scene.start(C.SCENE_MENU); break;
    }
  }

  get isVisible() { return this._visible; }
}


/* ── Map Screen ─────────────────────────────────────────────────────────── */
class MapScreen {
  constructor(scene) {
    this.scene    = scene;
    this._visible = false;
    this._build();
  }

  _build() {
    const W = C.WIDTH, H = C.HEIGHT;

    this._bg = this.scene.add.graphics()
      .setScrollFactor(0).setDepth(C.LAYER_UI + 10).setVisible(false);
    this._bg.fillStyle(0x000000, 0.92);
    this._bg.fillRect(0, 0, W, H);

    this._title = this.scene.add.text(W / 2, 14, 'MAP OF HALLOWNEST', {
      fontFamily: 'Cinzel', fontSize: 10, color: '#d4cfc9', letterSpacing: 4,
    }).setScrollFactor(0).setDepth(C.LAYER_UI + 11).setOrigin(0.5).setVisible(false);

    // Map graphics placeholder
    this._mapGraphics = this.scene.add.graphics()
      .setScrollFactor(0).setDepth(C.LAYER_UI + 11);
    this._mapGraphics.setVisible(false);

    this._closeHint = this.scene.add.text(W / 2, H - 10, '[TAB / M] Close', {
      fontFamily: 'Cinzel', fontSize: 6, color: '#555555',
    }).setScrollFactor(0).setDepth(C.LAYER_UI + 11).setOrigin(0.5).setVisible(false);
  }

  show() {
    this._visible = true;
    this._bg.setVisible(true);
    this._title.setVisible(true);
    this._mapGraphics.setVisible(true);
    this._closeHint.setVisible(true);
    this._drawMap();
    this.scene.physics.pause();
  }

  hide() {
    this._visible = false;
    this._bg.setVisible(false);
    this._title.setVisible(false);
    this._mapGraphics.setVisible(false);
    this._closeHint.setVisible(false);
    this.scene.physics.resume();
  }

  _drawMap() {
    const g = this._mapGraphics;
    g.clear();

    const saveData = this.scene._save;
    const visited  = saveData?.visitedRooms ?? [];
    const CX = C.WIDTH / 2, CY = C.HEIGHT / 2;

    // Room layout positions on the map
    const layout = {
      dirtmouth:            { mx: CX,      my: CY - 60 },
      crossroads_entrance:  { mx: CX,      my: CY - 20 },
      crossroads_main:      { mx: CX + 50, my: CY - 20 },
      crossroads_below:     { mx: CX + 50, my: CY + 20 },
      crossroads_chest:     { mx: CX + 100,my: CY - 20 },
    };

    for (const [key, pos] of Object.entries(layout)) {
      const known = visited.includes(key);
      g.lineStyle(1, known ? 0x888888 : 0x333333);
      g.strokeRect(pos.mx - 10, pos.my - 6, 20, 12);

      if (known) {
        g.fillStyle(0x3a5a3a, 0.7);
        g.fillRect(pos.mx - 9, pos.my - 5, 18, 10);
      }

      // Player marker
      const curRoom = this.scene._currentRoom;
      if (curRoom === key) {
        g.fillStyle(0x5ae3e3, 1);
        g.fillCircle(pos.mx, pos.my, 2);
      }
    }
  }

  get isVisible() { return this._visible; }
}
