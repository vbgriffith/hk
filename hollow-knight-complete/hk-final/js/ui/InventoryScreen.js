/* js/ui/InventoryScreen.js — Full charm equip + inventory screen */
'use strict';

class InventoryScreen {
  constructor(scene) {
    this.scene    = scene;
    this._visible = false;
    this._selIdx  = 0;
    this._allCharms = [];
    this._build();
  }

  _build() {
    const W = C.WIDTH, H = C.HEIGHT;

    this._bg = this.scene.add.graphics().setScrollFactor(0).setDepth(C.LAYER_UI + 10).setVisible(false);
    this._bg.fillStyle(0x000000, 0.93);
    this._bg.fillRect(0, 0, W, H);

    this._title = this.scene.add.text(W / 2, 10, 'CHARMS', {
      fontFamily: 'Cinzel', fontSize: 10, color: '#d4cfc9', letterSpacing: 6,
    }).setScrollFactor(0).setDepth(C.LAYER_UI + 11).setOrigin(0.5).setVisible(false);

    this._notchText = this.scene.add.text(W / 2, 22, '', {
      fontFamily: 'Cinzel', fontSize: 6, color: '#888888',
    }).setScrollFactor(0).setDepth(C.LAYER_UI + 11).setOrigin(0.5).setVisible(false);

    this._charmGraphics = this.scene.add.graphics().setScrollFactor(0).setDepth(C.LAYER_UI + 11).setVisible(false);

    this._descPanel = this.scene.add.graphics().setScrollFactor(0).setDepth(C.LAYER_UI + 11).setVisible(false);
    this._descPanel.fillStyle(0x111122, 0.9);
    this._descPanel.fillRoundedRect(6, H - 56, W - 12, 50, 3);

    this._descTitle = this.scene.add.text(W / 2, H - 50, '', {
      fontFamily: 'Cinzel', fontSize: 7, color: '#5ae3e3',
    }).setScrollFactor(0).setDepth(C.LAYER_UI + 12).setOrigin(0.5).setVisible(false);

    this._descBody = this.scene.add.text(W / 2, H - 36, '', {
      fontFamily: 'IM Fell English', fontStyle: 'italic', fontSize: 6, color: '#aaaaaa',
      wordWrap: { width: W - 30 }, align: 'center',
    }).setScrollFactor(0).setDepth(C.LAYER_UI + 12).setOrigin(0.5).setVisible(false);

    this._descStatus = this.scene.add.text(W / 2, H - 15, '', {
      fontFamily: 'Cinzel', fontSize: 5, color: '#5ae3e3',
    }).setScrollFactor(0).setDepth(C.LAYER_UI + 12).setOrigin(0.5).setVisible(false);

    this._hint = this.scene.add.text(W / 2, H - 4, '[Z/X] Equip/Unequip  [I/ESC] Close', {
      fontFamily: 'Cinzel', fontSize: 5, color: '#444444',
    }).setScrollFactor(0).setDepth(C.LAYER_UI + 11).setOrigin(0.5).setVisible(false);
  }

  show() {
    if (this._visible) return;
    this._visible = true;
    this.scene.physics.pause();
    this._allCharms = this.scene._save?.ownedCharms ?? [];
    [this._bg, this._title, this._notchText, this._charmGraphics,
     this._descPanel, this._descTitle, this._descBody, this._descStatus, this._hint]
      .forEach(o => o.setVisible(true));
    this._selIdx = 0;
    this._redraw();
  }

  hide() {
    if (!this._visible) return;
    this._visible = false;
    this.scene.physics.resume();
    [this._bg, this._title, this._notchText, this._charmGraphics,
     this._descPanel, this._descTitle, this._descBody, this._descStatus, this._hint]
      .forEach(o => o.setVisible(false));
  }

  navigate(dx, dy) {
    const cols = 8;
    this._selIdx = Phaser.Math.Clamp(
      this._selIdx + dx + dy * cols, 0, Math.max(0, this._allCharms.length - 1)
    );
    this._redraw();
  }

  toggleSelected() {
    const id = this._allCharms[this._selIdx];
    if (!id) return;
    const cs = this.scene.knight?._charms;
    if (!cs) return;
    if (!cs.toggle(id)) {
      this._descStatus.setText('Not enough notch space!').setColor('#ff4444');
      this.scene.time.delayedCall(1000, () => this._redraw());
    } else {
      this._redraw();
    }
  }

  _redraw() {
    const cs = this.scene.knight?._charms;
    const W  = C.WIDTH;
    const g  = this._charmGraphics;
    g.clear();

    if (cs) {
      this._notchText.setText(`Notches: ${cs.slotsUsed} / ${cs.slotsTotal}`);
      const total = cs.slotsTotal, used = cs.slotsUsed;
      const pipX = W / 2 - (total * 7) / 2;
      for (let i = 0; i < total; i++) {
        g.fillStyle(i < used ? 0x5ae3e3 : 0x333344);
        g.fillRect(pipX + i * 7, 19, 5, 5);
        g.lineStyle(0.5, 0x5ae3e3, 0.4);
        g.strokeRect(pipX + i * 7, 19, 5, 5);
      }
    }

    const cols = 8, cell = 22, startX = (W - cols * cell) / 2, startY = 32;
    for (let i = 0; i < this._allCharms.length; i++) {
      const id  = this._allCharms[i];
      const def = CHARM_BY_ID[id];
      if (!def) continue;
      const cx = startX + (i % cols) * cell;
      const cy = startY + Math.floor(i / cols) * cell;
      const sel = i === this._selIdx, eq = cs?.isEquipped(id);

      g.fillStyle(sel ? 0x2a2a4a : 0x111122);
      g.fillRoundedRect(cx, cy, cell - 2, cell - 2, 2);
      g.lineStyle(sel || eq ? 1.5 : 0.5, sel ? 0xffffff : eq ? 0x5ae3e3 : 0x333355);
      g.strokeRoundedRect(cx, cy, cell - 2, cell - 2, 2);
      this._drawCharmIcon(g, cx + 3, cy + 3, cell - 8, id, eq);
    }

    const selDef = CHARM_BY_ID[this._allCharms[this._selIdx]];
    if (selDef) {
      this._descTitle.setText(selDef.name);
      this._descBody.setText(selDef.desc);
      const eq = cs?.isEquipped(selDef.id);
      this._descStatus.setText(eq ? '✓ Equipped' : `Cost: ${selDef.notches} notch${selDef.notches!==1?'es':''}`).setColor(eq?'#5ae3e3':'#888888');
    } else {
      this._descTitle.setText('');
      this._descBody.setText('No charms yet. Explore Hallownest.');
      this._descStatus.setText('');
    }
  }

  _drawCharmIcon(g, x, y, s, id, eq) {
    const cx = x + s/2, cy = y + s/2, col = eq ? 0x5ae3e3 : 0x888888;
    switch (id) {
      case 'gathering_swarm':
        for (let i=0;i<5;i++){const a=(i/5)*Math.PI*2;g.fillStyle(col,0.8);g.fillCircle(cx+Math.cos(a)*4,cy+Math.sin(a)*4,1.5);}
        break;
      case 'wayward_compass':
        g.fillStyle(col,0.7);g.fillCircle(cx,cy,4);g.fillStyle(0,1);g.fillCircle(cx,cy,1.5);g.fillStyle(0xff4444,1);g.fillTriangle(cx,cy-3,cx-1,cy,cx+1,cy);
        break;
      case 'fragile_heart':
        g.fillStyle(0xee4444,0.8);g.fillCircle(cx-1.5,cy-1,2.5);g.fillCircle(cx+1.5,cy-1,2.5);g.fillTriangle(cx-3,cy+1,cx+3,cy+1,cx,cy+5);
        break;
      case 'quick_slash':
        g.lineStyle(1.5,col);g.lineBetween(cx-4,cy+2,cx+4,cy-2);g.lineBetween(cx-2,cy+4,cx+2,cy);
        break;
      case 'spell_twister':
        g.fillStyle(0x4444ff,0.8);g.fillCircle(cx,cy,4);g.fillStyle(0xaaaaff,0.5);g.fillCircle(cx,cy-1.5,2);
        break;
      default:
        g.fillStyle(col,0.5);g.fillCircle(cx,cy,4);
        break;
    }
  }

  get isVisible() { return this._visible; }
}
