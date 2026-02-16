/* js/systems/ShopSystem.js — Sly's shop, Iselda's shop, Geo purchases */
'use strict';

const SHOP_ITEMS = {
  sly: [
    { id: 'shop_lantern',    name: 'Lumafly Lantern',  cost: 1800, type: 'key_item',  desc: 'Illuminates darkness. Essential in unlit areas.' },
    { id: 'shop_simple_key', name: 'Simple Key',       cost: 950,  type: 'key_item',  desc: 'Opens simple locks scattered through the ruins.' },
    { id: 'shop_geo_1',      name: '1 Mask Shard',     cost: 200,  type: 'mask_shard',desc: 'A piece of a Vessel Mask. Four shards make one mask.' },
    { id: 'shop_geo_2',      name: '1 Mask Shard',     cost: 200,  type: 'mask_shard',desc: 'Another shard. Two of four.' },
    { id: 'shop_charm_quick',name: 'Quick Slash',      cost: 800,  type: 'charm',     charmId: 'quick_slash', desc: 'Speeds up nail attacks considerably.' },
    { id: 'shop_charm_long', name: 'Long Nail',        cost: 600,  type: 'charm',     charmId: 'long_nail',   desc: 'Increases nail reach.' },
  ],
  iselda: [
    { id: 'shop_map_city',   name: 'City Map',         cost: 100,  type: 'map',       area: 'city_of_tears',  desc: 'A map of the City of Tears.' },
    { id: 'shop_map_fungal', name: 'Fungal Wastes Map',cost: 80,   type: 'map',       area: 'fungal_wastes',  desc: 'A map of the Fungal Wastes.' },
    { id: 'shop_map_basin',  name: 'Ancient Basin Map',cost: 120,  type: 'map',       area: 'ancient_basin',  desc: 'A map of the Ancient Basin.' },
    { id: 'shop_charm_comp', name: 'Wayward Compass',  cost: 220,  type: 'charm',     charmId: 'wayward_compass', desc: 'Shows your location on the map.' },
    { id: 'shop_pin_bench',  name: 'Bench Pin',        cost: 100,  type: 'pin',       desc: 'Marks all benches on the map.' },
    { id: 'shop_pin_transit',name: 'Transit Pin',      cost: 150,  type: 'pin',       desc: 'Marks stag stations on the map.' },
  ],
};

class ShopScreen {
  constructor(scene) {
    this.scene    = scene;
    this._visible = false;
    this._shopKey = null;
    this._items   = [];
    this._selIdx  = 0;
    this._build();
  }

  _build() {
    const W = C.WIDTH, H = C.HEIGHT;
    this._bg = this.scene.add.graphics().setScrollFactor(0).setDepth(C.LAYER_UI+10).setVisible(false);
    this._bg.fillStyle(0x050510, 0.95); this._bg.fillRect(0,0,W,H);

    this._shopkeeper = this.scene.add.text(W/2, 14, '', {
      fontFamily:'Cinzel',fontSize: 27,color:'#e8c84a',letterSpacing:4,
    }).setScrollFactor(0).setDepth(C.LAYER_UI+11).setOrigin(0.5).setVisible(false);

    this._geoText = this.scene.add.text(W-12, 14, '', {
      fontFamily:'Cinzel',fontSize: 21,color:'#e8c84a',
    }).setScrollFactor(0).setDepth(C.LAYER_UI+11).setOrigin(1,0.5).setVisible(false);

    this._listG = this.scene.add.graphics().setScrollFactor(0).setDepth(C.LAYER_UI+11).setVisible(false);

    this._descBg = this.scene.add.graphics().setScrollFactor(0).setDepth(C.LAYER_UI+11).setVisible(false);
    this._descBg.fillStyle(0x0a0a20,0.9); this._descBg.fillRoundedRect(6,H-58,W-12,52,3);

    this._descName = this.scene.add.text(W/2,H-50,'',{fontFamily:'Cinzel',fontSize: 24,color:'#d4cfc9'})
      .setScrollFactor(0).setDepth(C.LAYER_UI+12).setOrigin(0.5).setVisible(false);
    this._descText = this.scene.add.text(W/2,H-36,'',{fontFamily:'IM Fell English',fontStyle:'italic',fontSize: 18,color:'#888888',wordWrap:{width:W-30},align:'center'})
      .setScrollFactor(0).setDepth(C.LAYER_UI+12).setOrigin(0.5).setVisible(false);
    this._costText = this.scene.add.text(W/2,H-16,'',{fontFamily:'Cinzel',fontSize: 21,color:'#e8c84a'})
      .setScrollFactor(0).setDepth(C.LAYER_UI+12).setOrigin(0.5).setVisible(false);
    this._hint = this.scene.add.text(W/2,H-4,'[Z] Buy  [ESC] Close',{fontFamily:'Cinzel',fontSize: 15,color:'#444444'})
      .setScrollFactor(0).setDepth(C.LAYER_UI+11).setOrigin(0.5).setVisible(false);
  }

  show(shopKey, npcName) {
    if (this._visible) return;
    this._visible = true;
    this._shopKey = shopKey;
    this.scene.physics.pause();
    this._items  = SHOP_ITEMS[shopKey] ?? [];
    this._selIdx = 0;
    const objs = [this._bg,this._shopkeeper,this._geoText,this._listG,
                  this._descBg,this._descName,this._descText,this._costText,this._hint];
    objs.forEach(o=>o.setVisible(true));
    this._shopkeeper.setText(npcName);
    this._redraw();
  }

  hide() {
    if (!this._visible) return;
    this._visible = false;
    this.scene.physics.resume();
    [this._bg,this._shopkeeper,this._geoText,this._listG,
     this._descBg,this._descName,this._descText,this._costText,this._hint]
      .forEach(o=>o.setVisible(false));
  }

  navigate(dy) {
    this._selIdx = Phaser.Math.Clamp(this._selIdx + dy, 0, this._items.length - 1);
    this._redraw();
  }

  tryBuy() {
    const item = this._items[this._selIdx];
    if (!item) return;
    const save = this.scene._save;
    if (save.itemsCollected.includes(item.id)) return;
    if (save.geo < item.cost) {
      this._costText.setText('Not enough Geo!').setColor('#ff4444');
      this.scene.time.delayedCall(900, () => this._redraw());
      return;
    }
    save.geo -= item.cost;
    save.itemsCollected.push(item.id);
    if (item.type === 'charm') {
      if (!save.ownedCharms) save.ownedCharms = [];
      if (!save.ownedCharms.includes(item.charmId)) save.ownedCharms.push(item.charmId);
    } else if (item.type === 'mask_shard') {
      save.maskShards = (save.maskShards || 0) + 1;
      if (save.maskShards >= 4) {
        save.maskShards = 0;
        this.scene.knight.masksMax++;
        this.scene.knight.masks++;
      }
    } else if (item.type === 'map') {
      if (!save.maps) save.maps = [];
      if (!save.maps.includes(item.area)) save.maps.push(item.area);
    }
    SaveSystem.save(this.scene._buildSaveData());
    this.scene._hud?.update();
    this.scene._audio?.playSfx('sfx_collect');
    this._redraw();
  }

  _redraw() {
    const W = C.WIDTH, g = this._listG;
    g.clear();
    const save = this.scene._save;
    this._geoText.setText(`${save.geo} Geo`);

    const rowH = 16, startY = 26;
    for (let i = 0; i < this._items.length; i++) {
      const item = this._items[i];
      const y    = startY + i * rowH;
      const sel  = i === this._selIdx;
      const owned= save.itemsCollected.includes(item.id);

      g.fillStyle(sel ? 0x1a1a3a : 0x0a0a1a);
      g.fillRoundedRect(8, y-1, W-16, rowH-2, 2);
      if (sel) { g.lineStyle(0.8, 0x5ae3e3, 0.5); g.strokeRoundedRect(8,y-1,W-16,rowH-2,2); }

      // Draw item row as graphics (no text objects per item to keep memory low)
      g.fillStyle(owned ? 0x446644 : sel ? 0xd4cfc9 : 0x888888);
      g.fillRect(16, y+4, Math.min(item.name.length*4, 200), 2);
      // Cost indicator
      if (!owned) {
        g.fillStyle(0xe8c84a, 0.8);
        g.fillRect(W-60, y+2, Math.min(item.cost/20, 40), 8);
      }
    }

    const sel = this._items[this._selIdx];
    if (sel) {
      this._descName.setText(sel.name).setColor(save.itemsCollected.includes(sel.id)?'#448844':'#d4cfc9');
      this._descText.setText(sel.desc);
      if (save.itemsCollected.includes(sel.id)) {
        this._costText.setText('Purchased').setColor('#448844');
      } else {
        const canAfford = save.geo >= sel.cost;
        this._costText.setText(`${sel.cost} Geo`).setColor(canAfford ? '#e8c84a' : '#884444');
      }
    }
  }

  get isVisible() { return this._visible; }
  _getDisplayObjects() {
    return [this._bg,this._shopkeeper,this._geoText,this._listG,
            this._descBg,this._descName,this._descText,this._costText,this._hint].filter(Boolean);
  }
}


/* ── RainSystem — City of Tears rain particles ───────────────────────────── */
class RainSystem {
  constructor(scene) {
    this.scene    = scene;
    this._active  = false;
    this._drops   = [];
    this._timer   = 0;
  }

  start() {
    this._active = true;
    // Ambient blue tint overlay
    if (!this._overlay) {
      this._overlay = this.scene.add.graphics()
        .setScrollFactor(0).setDepth(C.LAYER_BG + 0.5);
      this._overlay.fillStyle(0x0000aa, 0.06);
      this._overlay.fillRect(0, 0, C.WIDTH * 4, C.HEIGHT * 4);
    }
  }

  stop() {
    this._active = false;
    this._overlay?.destroy(); this._overlay = null;
    this._drops.forEach(d => d.destroy());
    this._drops = [];
  }

  update(dt) {
    if (!this._active) return;
    this._timer += dt;
    // Spawn new drops
    if (this._timer > 0.015) {
      this._timer = 0;
      const cam   = this.scene.cameras.main;
      const dropX = cam.scrollX + Phaser.Math.Between(0, C.WIDTH);
      const dropY = cam.scrollY - 10;
      const drop  = this.scene.add.graphics().setDepth(C.LAYER_FG);
      drop.lineStyle(0.7, 0xaaaaff, 0.4);
      drop.lineBetween(0, 0, -1, 8);
      drop.setPosition(dropX, dropY);
      this._drops.push(drop);
      drop._vy = Phaser.Math.Between(300, 450);
      drop._life = 0;
    }
    // Update drops
    this._drops.forEach(d => {
      d.y += d._vy * dt;
      d._life += dt;
      if (d._life > 0.8) d.setAlpha(1 - (d._life - 0.8) / 0.2);
    });
    this._drops = this._drops.filter(d => {
      if (d._life > 1.0) { d.destroy(); return false; }
      return true;
    });
  }
}


/* ── DreamerSystem — Track and break Dreamer seals ───────────────────────── */
class DreamerSystem {
  constructor(scene, save) {
    this.scene    = scene;
    this._save    = save;
    this._dreamers = ['monomon', 'lurien', 'herrah'];
  }

  get defeatedCount() {
    return this._dreamers.filter(d => this._save.flags?.[`dreamer_${d}`]).length;
  }

  get allDefeated() {
    return this.defeatedCount >= 3;
  }

  markDefeated(dreamerId) {
    if (!this._save.flags) this._save.flags = {};
    this._save.flags[`dreamer_${dreamerId}`] = true;
    SaveSystem.save(this.scene._buildSaveData());
    // Unlock black egg door if all three defeated
    if (this.allDefeated) {
      this._save.flags.all_dreamers = true;
      this.scene._camera?.flash(0xffffff, 600);
    }
  }

  buildSealItem(item, scene) {
    const dreamer  = item.dreamer;
    const defeated = this._save.flags?.[`dreamer_${dreamer}`];
    if (defeated) return;

    const g = scene.add.graphics().setDepth(C.LAYER_TILES + 2);
    g.fillStyle(0xaaaaff, 0.6);
    g.beginPath(); g.fillCircle(item.x, item.y, 8);
    scene.tweens.add({ targets: g, alpha: { from: 0.4, to: 0.8 }, duration: 1200, yoyo: true, repeat: -1 });

    const zone = scene.physics.add.staticImage(item.x, item.y, '__DEFAULT');
    zone.setSize(16, 16).setVisible(false);
    scene.physics.add.overlap(scene.knight.sprite, zone, () => {
      if (!scene._input.interact) return;
      const dialogueLine = DIALOGUE.dreamer_seal_break;
      scene._dialogue.show(dialogueLine, () => {
        this.markDefeated(dreamer);
        g.destroy(); zone.destroy();
        scene._particles?.burst({ x: item.x, y: item.y, count: 20, tint: 0xaaaaff });
      });
    });
  }
}


/* ── Credits scene ────────────────────────────────────────────────────────── */
GameScene.prototype._showCredits = function() {
  this.scene.pause();
  const W = C.WIDTH, H = C.HEIGHT;
  const cam = this.cameras.main;

  const overlay = this.add.graphics().setScrollFactor(0).setDepth(C.LAYER_UI + 20);
  overlay.fillStyle(0x000000, 0); overlay.fillRect(0, 0, W, H);
  this.tweens.add({ targets: overlay, fillAlpha: 1, duration: 1000 });

  const lines = [
    { text: 'HOLLOW KNIGHT',         style: { fontFamily:'Cinzel', fontSize: 48, color:'#d4cfc9', letterSpacing:8 } },
    { text: 'Web Clone',             style: { fontFamily:'Cinzel', fontSize: 24,  color:'#888888' } },
    { text: '',                      style: {} },
    { text: 'Built with Phaser 3',   style: { fontFamily:'IM Fell English', fontSize: 21, color:'#666666' } },
    { text: 'All content original',  style: { fontFamily:'IM Fell English', fontSize: 21, color:'#666666' } },
    { text: '',                      style: {} },
    { text: 'Original game by',      style: { fontFamily:'Cinzel', fontSize: 18, color:'#888888' } },
    { text: 'Team Cherry',           style: { fontFamily:'Cinzel', fontSize: 27, color:'#5ae3e3' } },
    { text: '',                      style: {} },
    { text: 'Thank you for playing', style: { fontFamily:'IM Fell English', fontStyle:'italic', fontSize: 24, color:'#d4cfc9' } },
  ];

  lines.forEach((line, i) => {
    if (!line.text) return;
    const t = this.add.text(W/2, H/2 + 80 + i * 18, line.text, line.style)
      .setScrollFactor(0).setDepth(C.LAYER_UI+21).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: t, alpha: 1, duration: 800, delay: 1200 + i * 600 });
  });

  // Return to menu
  const returnDelay = 1200 + lines.length * 600 + 3000;
  this.time.delayedCall(returnDelay, () => {
    this.tweens.add({
      targets: overlay, fillAlpha: 1, duration: 1500,
      onComplete: () => {
        SaveSystem.clear();
        this.scene.stop(); this.scene.start(C.SCENE_MENU);
      },
    });
  });
};
