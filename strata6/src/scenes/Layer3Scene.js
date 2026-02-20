/**
 * STRATA — Layer3Scene  (Phase 5)
 * The Meridian — Halverstrom.
 * A vast, eerily calm city in architectural white lines on near-black.
 * No colour. The city is perfect. The city is empty.
 * Except for The Cartographer, who walks the same route every day.
 *
 * Phase 5 additions:
 *  - Proximity dialogue with Cartographer (E key)
 *  - Descent zone at central plaza -> Layer 4
 *  - visited_layer3 flag set on enter
 *  - Street name labels on hover
 *  - Corruption affects city rendering (lines fade, buildings darken)
 *  - Halverstrom coordinates easter egg at the plaza
 *  - Patience counter display (day X / 40)
 *  - First-visit note + return-visit notes
 */
class Layer3Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Layer3Scene' });
    this._camera    = { x: 0, y: 0 };
    this._player    = null;
    this._cartoRef  = null;
    this._city      = null;
    this._dayTimer  = 0;
    this._particles = [];
    this._interactables = [];
    this._nearestInteractable = null;
    this._promptText = null;
    this._cursors = null;
    this._wasd    = null;
    this._eKey    = null;
  }

  // ---------------------------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------------------------
  create() {
    const W = this.scale.width, H = this.scale.height;

    StateManager.enterLayer(3);
    StateManager.flag('visited_layer3');   // fixes BrowserEngine gate
    TransitionEngine.init(this);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x04060a, 1).fillRect(0, 0, W, H);

    // Generate + draw Halverstrom
    this._city = this._generateCity(W, H);
    this._drawCity(W, H);

    // Player — small point of light
    this._player = { x: W * 0.5, y: H * 0.55, speed: 110 };
    this._playerSprite = this.add.graphics().setDepth(40);
    this._drawPlayerLight();

    // Cartographer
    this._cartoRef = new CartographerEntity(this, W, H, this._city);

    // Descent zone at central plaza
    this._buildDescentZone(W, H);

    // Interaction prompt
    this._promptText = this.add.text(W / 2, H - 44, '', {
      fontFamily:'monospace', fontSize:'11px', color:'#2a5080',
      backgroundColor:'#04060add', padding:{x:10, y:4}
    }).setOrigin(0.5, 1).setDepth(60).setAlpha(0);

    // HUD
    HUD.show(this, 3);

    // Ambient particles
    this._spawnAmbientParticles(W, H);

    // Controls
    this._cursors = this.input.keyboard.createCursorKeys();
    this._wasd    = this.input.keyboard.addKeys('W,A,S,D');
    this._eKey    = this.input.keyboard.addKey('E');
    this.input.keyboard.on('keydown-ESC', () => this._return());
    this.input.keyboard.on('keydown-E',   () => this._tryInteract());

    // Day counter
    this._dayText = this.add.text(W - 16, 38, '', {
      fontFamily:'monospace', fontSize:'9px', color:'#1e2a3a'
    }).setOrigin(1, 0).setDepth(100);

    // Halverstrom coordinate label (barely visible, at plaza)
    const cx = this._city.centralPlaza.x, cy = this._city.centralPlaza.y;
    this._coordLabel = this.add.text(cx, cy + 28, '47\u00b022\'14.1"N  12\u00b008\'55.2"E', {
      fontFamily:'monospace', fontSize:'8px', color:'#0d1a28'
    }).setOrigin(0.5, 0).setDepth(6);

    this._fadeIn(W, H);

    // Cartographer ending — fires when day 40 triggers from Layer3
    EventBus.on('ending:cartographer', () => {
      this.time.delayedCall(3000, () => {
        // Give player time to read the map, then go to ending
        this.scene.start('EndingScene');
      });
    }, this);

    // Notes
    const visits = StateManager.get('layerVisits')[3] || 0;
    if (visits <= 1) {
      this.time.delayedCall(2200, () => {
        StateManager.addMarenNote(
          'below the workshop. this is a city.\n' +
          'it is rendered entirely in white lines on near-black.\n' +
          '847 streets. I counted the intersections.\n' +
          'something is walking one of them.\n' +
          'there are coordinates on the central plaza.\n' +
          '47\u00b022\'14.1"N, 12\u00b008\'55.2"E.\n' +
          'those match what Callum wrote in his final study note.'
        );
      });
    } else if (visits === 2) {
      this.time.delayedCall(1000, () => {
        const days = StateManager.get('cartographerDays') || 0;
        StateManager.addMarenNote(
          `back in Halverstrom. day ${days}.\n` +
          `the Cartographer is still walking the same route.\n` +
          `I don't think he's noticed me yet.`
        );
      });
    }

    StateManager.save();
  }

  // ---------------------------------------------------------------------------
  // CITY GENERATION
  // ---------------------------------------------------------------------------
  _generateCity(W, H) {
    const city = {
      streets: [], buildings: [], plazas: [],
      streetNames: [],
      centerX: W / 2, centerY: H / 2,
      centralPlaza: { x: W / 2, y: H / 2 }
    };

    const BW = 80, BH = 60;
    const COLS = 12, ROWS = 9;
    const ox = W / 2 - (COLS * BW) / 2;
    const oy = H / 2 - (ROWS * BH) / 2;

    // Named streets (horizontal)
    const hNames = [
      'Meridian Way','Pale Circuit','Archive Row','Crane Lane',
      'Holm Passage','The Substrate','Wrest Boulevard','Deep Well Street',
      'Callum\'s Approach','The Cartographer\'s Walk',
    ];
    for (let r = 0; r <= ROWS; r++) {
      const sy  = oy + r * BH;
      const w   = (r === 0 || r === ROWS) ? 1 : (r % 3 === 0 ? 1.5 : 0.8);
      const name = hNames[r % hNames.length];
      city.streets.push({ x1:ox-24, y1:sy, x2:ox+COLS*BW+24, y2:sy, w, name, axis:'h', labelX:ox-20, labelY:sy });
    }

    // Named streets (vertical)
    const vNames = [
      'North Trace','Ida\'s Close','Oswin Place','Survey Line',
      'Fenn Street','Substrate Walk','Plaza Approach',
    ];
    for (let c = 0; c <= COLS; c++) {
      const sx  = ox + c * BW;
      const w   = (c === 0 || c === COLS) ? 1 : (c % 4 === 0 ? 1.5 : 0.8);
      const name = vNames[c % vNames.length];
      city.streets.push({ x1:sx, y1:oy-24, x2:sx, y2:oy+ROWS*BH+24, w, name, axis:'v', labelX:sx, labelY:oy-20 });
    }

    // Buildings
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const bx = ox + c * BW + 6;
        const by = oy + r * BH + 6;
        const bw = BW - 12, bh = BH - 12;
        const isPlaza = (c === 5 && r === 4) || (c === 2 && r === 2) || (c === 9 && r === 6);
        if (isPlaza) { city.plazas.push({x:bx, y:by, w:bw, h:bh}); continue; }
        const sc = 1 + ((c * 7 + r * 3) % 3);
        const sr = 1 + ((c * 3 + r * 11) % 2);
        for (let i = 0; i < sc; i++) for (let j = 0; j < sr; j++) {
          const sw = bw / sc, sh = bh / sr;
          const bldH = 8 + ((c * 13 + r * 7 + i * 3) % 20);
          city.buildings.push({ x:bx+i*sw+1, y:by+j*sh+1, w:sw-2, h:sh-2, height:bldH });
        }
      }
    }

    return city;
  }

  _drawCity(W, H) {
    const corruption = StateManager.get('corruption') || 0;
    const cityAlpha  = Math.max(0.15, 1 - corruption * 0.7);
    const lineColor  = Palette.lerp(0x1a2535, 0x080c12, corruption * 0.8);
    const bldFront   = Palette.lerp(0x0d1520, 0x050810, corruption * 0.6);
    const bldTop     = Palette.lerp(0x1e2d40, 0x0a1020, corruption * 0.7);
    const bldOutline = Palette.lerp(0x2a3f55, 0x0e1828, corruption * 0.8);

    const g = this.add.graphics().setDepth(5);

    // Streets
    this._city.streets.forEach(s => {
      g.lineStyle(s.w, lineColor, cityAlpha);
      g.lineBetween(s.x1, s.y1, s.x2, s.y2);
    });

    // Buildings (2.5D)
    this._city.buildings.forEach(b => {
      const elev = b.height * 0.4;
      g.fillStyle(0x0a1018, cityAlpha * 0.9).fillPoints([
        {x:b.x+b.w, y:b.y}, {x:b.x+b.w+elev*0.5, y:b.y-elev},
        {x:b.x+b.w+elev*0.5, y:b.y-elev+b.h}, {x:b.x+b.w, y:b.y+b.h}
      ], true);
      g.fillStyle(bldFront, cityAlpha).fillRect(b.x, b.y, b.w, b.h);
      g.fillStyle(bldTop, cityAlpha).fillPoints([
        {x:b.x, y:b.y}, {x:b.x+elev*0.5, y:b.y-elev},
        {x:b.x+b.w+elev*0.5, y:b.y-elev}, {x:b.x+b.w, y:b.y}
      ], true);
      g.lineStyle(0.5, bldOutline, cityAlpha * 0.8).strokeRect(b.x, b.y, b.w, b.h);
      g.lineStyle(0.5, Palette.lerp(0x3a5070, 0x101820, corruption * 0.8), cityAlpha * 0.6);
      g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(b.x+elev*0.5, b.y-elev);
      g.lineTo(b.x+b.w+elev*0.5, b.y-elev); g.lineTo(b.x+b.w, b.y); g.strokePath();
      g.lineStyle(0.5, bldOutline, cityAlpha * 0.6)
       .lineBetween(b.x+b.w, b.y, b.x+b.w+elev*0.5, b.y-elev);
      if ((b.x * 7 + b.y * 3) % 5 === 0) {
        g.fillStyle(0x1e3a5a, cityAlpha * 0.8)
         .fillRect(b.x+b.w*0.25, b.y+b.h*0.2, b.w*0.2, b.h*0.15)
         .fillRect(b.x+b.w*0.55, b.y+b.h*0.2, b.w*0.2, b.h*0.15);
      }
    });

    // Plazas
    this._city.plazas.forEach(p => {
      g.lineStyle(0.5, Palette.lerp(0x1a2a3a, 0x080c14, corruption * 0.7), cityAlpha * 0.8);
      g.strokeRect(p.x, p.y, p.w, p.h);
      g.lineBetween(p.x+p.w/2, p.y, p.x+p.w/2, p.y+p.h);
      g.lineBetween(p.x, p.y+p.h/2, p.x+p.w, p.y+p.h/2);
    });

    // Hover street labels — created as interactive zones
    this._city.streets.forEach(s => {
      let hitX, hitY, hitW, hitH;
      if (s.axis === 'h') { hitX=s.x1; hitY=s.y1-4; hitW=s.x2-s.x1; hitH=8; }
      else                { hitX=s.x1-4; hitY=s.y1; hitW=8; hitH=s.y2-s.y1; }
      const zone = this.add.rectangle(hitX+hitW/2, hitY+hitH/2, hitW, hitH, 0,0)
        .setOrigin(0.5).setInteractive().setDepth(6);
      const lbl = this.add.text(s.labelX, s.labelY - 2, s.name, {
        fontFamily:'monospace', fontSize:'8px', color:'#1a3a5a'
      }).setOrigin(s.axis==='v'?0.5:0, 1).setDepth(7).setAlpha(0);
      zone.on('pointerover', () => {
        this.tweens.add({targets:lbl, alpha:1, duration:200});
        this._showPrompt(s.name);
      });
      zone.on('pointerout',  () => {
        this.tweens.add({targets:lbl, alpha:0, duration:400});
        this._hidePrompt();
      });
    });
  }

  // ---------------------------------------------------------------------------
  // DESCENT ZONE
  // ---------------------------------------------------------------------------
  _buildDescentZone(W, H) {
    const cx = this._city.centralPlaza.x;
    const cy = this._city.centralPlaza.y;

    // Visual marker — subtle pulsing ring at plaza center
    const ring = this.add.graphics().setDepth(8);
    const drawRing = (alpha) => {
      ring.clear();
      ring.lineStyle(0.8, 0x1a3a5a, alpha);
      ring.strokeCircle(cx, cy, 20);
      ring.lineStyle(0.4, 0x1a3a5a, alpha * 0.5);
      ring.strokeCircle(cx, cy, 28);
    };
    drawRing(0.3);
    this.tweens.addCounter({
      from:0.3, to:0.7, duration:2200, yoyo:true, repeat:-1, ease:'Sine.easeInOut',
      onUpdate: t => drawRing(t.getValue())
    });

    // Interactable
    this._registerInteractable(cx, cy, 32, 'Descend  [E]', () => {
      if (DialogueEngine && DialogueEngine.isActive()) return;
      this._descendToLayer4();
    });
  }

  // ---------------------------------------------------------------------------
  // INTERACTABLE SYSTEM
  // ---------------------------------------------------------------------------
  _registerInteractable(x, y, radius, label, onInteract) {
    this._interactables.push({x, y, radius, label, onInteract});
  }

  _updateNearestInteractable() {
    const px = this._player.x, py = this._player.y;
    let nearest = null, nearestDist = Infinity;
    this._interactables.forEach(item => {
      const d = Math.hypot(px - item.x, py - item.y);
      if (d < item.radius && d < nearestDist) { nearest = item; nearestDist = d; }
    });
    if (nearest !== this._nearestInteractable) {
      this._nearestInteractable = nearest;
      if (nearest) this._showPrompt(nearest.label);
      else         this._hidePrompt();
    }
  }

  _tryInteract() {
    if (this._nearestInteractable) this._nearestInteractable.onInteract();
  }

  _showPrompt(text) {
    this._promptText.setText(text);
    this.tweens.add({targets:this._promptText, alpha:1, duration:160});
  }

  _hidePrompt() {
    this.tweens.add({targets:this._promptText, alpha:0, duration:300});
  }

  // ---------------------------------------------------------------------------
  // PLAYER
  // ---------------------------------------------------------------------------
  _drawPlayerLight() {
    const p = this._player;
    const corruption = StateManager.get('corruption') || 0;
    const coreColor = Palette.lerp(0xacd8f0, 0x6080a0, corruption * 0.6);
    const midColor  = Palette.lerp(0x7ab4d8, 0x405870, corruption * 0.6);
    this._playerSprite.clear();
    this._playerSprite.fillStyle(Palette.lerp(0x4a7fa8, 0x1a2a3a, corruption * 0.5), 0.15)
      .fillCircle(p.x, p.y, 22);
    this._playerSprite.fillStyle(midColor, 0.4).fillCircle(p.x, p.y, 8);
    this._playerSprite.fillStyle(coreColor, 0.9).fillCircle(p.x, p.y, 3);
  }

  // ---------------------------------------------------------------------------
  // AMBIENT PARTICLES
  // ---------------------------------------------------------------------------
  _spawnAmbientParticles(W, H) {
    for (let i = 0; i < 28; i++) {
      this._particles.push({
        x: Math.random() * W, y: Math.random() * H,
        alpha: Math.random() * 0.35,
        speed: 0.15 + Math.random() * 0.25,
        size: 0.4 + Math.random() * 0.8
      });
    }
    this._particleGraphics = this.add.graphics().setDepth(3);
  }

  _updateParticles(W, H) {
    this._particleGraphics.clear();
    const corruption = StateManager.get('corruption') || 0;
    this._particles.forEach(p => {
      p.y -= p.speed;
      if (p.y < 0) { p.y = H; p.x = Math.random() * W; }
      const col = Palette.lerp(0x2a4060, 0x1a2030, corruption * 0.6);
      this._particleGraphics.fillStyle(col, p.alpha);
      this._particleGraphics.fillCircle(p.x, p.y, p.size);
    });
  }

  // ---------------------------------------------------------------------------
  // TRANSITIONS
  // ---------------------------------------------------------------------------
  _fadeIn(W, H) {
    const ov = this.add.graphics().setDepth(1000);
    ov.fillStyle(0x04060a, 1).fillRect(0, 0, W, H);
    this.tweens.addCounter({
      from:1, to:0, duration:1200, ease:'Sine.easeOut',
      onUpdate: t => { ov.clear(); ov.fillStyle(0x04060a, t.getValue()).fillRect(0,0,W,H); },
      onComplete: () => ov.clear()
    });
  }

  _return() {
    if (DialogueEngine && DialogueEngine.isActive()) return;
    this.input.keyboard.enabled = false;
    TransitionEngine.transition(this, 3, 2, () => this.scene.start('Layer2Scene'), null);
  }

  _descendToLayer4() {
    this.input.keyboard.enabled = false;
    StateManager.addMarenNote(
      'the central plaza. there is a way down from here.\n' +
      'I am choosing to go down.\n' +
      'I want to note that I am choosing to go down.'
    );
    TransitionEngine.transition(this, 3, 4, () => this.scene.start('Layer4Scene'), null);
  }

  // ---------------------------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------------------------
  update(time, delta) {
    if (!this.input.keyboard.enabled) return;
    StateManager.tickPlayTime(delta);

    const dt  = delta / 1000;
    const spd = this._player.speed;
    const W   = this.scale.width, H = this.scale.height;

    if (this._cursors.left.isDown  || this._wasd.A.isDown) this._player.x -= spd * dt;
    if (this._cursors.right.isDown || this._wasd.D.isDown) this._player.x += spd * dt;
    if (this._cursors.up.isDown    || this._wasd.W.isDown) this._player.y -= spd * dt;
    if (this._cursors.down.isDown  || this._wasd.S.isDown) this._player.y += spd * dt;

    this._player.x = Phaser.Math.Clamp(this._player.x, 10, W - 10);
    this._player.y = Phaser.Math.Clamp(this._player.y, 10, H - 10);
    this._drawPlayerLight();

    // Day counter
    this._dayTimer += delta;
    const dayDuration = 60000;
    if (this._dayTimer >= dayDuration) {
      this._dayTimer -= dayDuration;
      StateManager.increment('cartographerDays');
    }
    const days = StateManager.get('cartographerDays') || 0;
    const nearReveal = days >= 35;
    this._dayText.setText(`day ${days} / 40`)
      .setColor(nearReveal ? '#2a5080' : '#1e2a3a');

    // Proximity + interactables
    this._updateNearestInteractable();

    // Register Cartographer as interactable based on his current position
    if (this._cartoRef) {
      const cd = Math.hypot(this._player.x - this._cartoRef._x, this._player.y - this._cartoRef._y);
      if (cd < 40 && !this._cartoInteractableAdded) {
        this._cartoInteractableAdded = true;
        this._registerInteractable(
          this._cartoRef._x, this._cartoRef._y, 40,
          'Approach Cartographer  [E]',
          () => this._cartoRef.interact(this)
        );
      }
      // Update cartographer interactable position
      const cartoEntry = this._interactables.find(i => i.label.startsWith('Approach'));
      if (cartoEntry) { cartoEntry.x = this._cartoRef._x; cartoEntry.y = this._cartoRef._y; }

      this._cartoRef.update(time, delta, this._player.x, this._player.y);
    }

    HUD.update(3);
    this._updateParticles(W, H);
  }

  shutdown() {
    EventBus.off('ending:cartographer');
    StateManager.save();
  }
}
