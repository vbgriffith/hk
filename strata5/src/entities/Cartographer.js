/**
 * STRATA — CartographerEntity  (Phase 5)
 * Pieter Holm's methodology made ambulatory.
 *
 * Phase 5 additions:
 *  - interact() method — one-line dialogue per day range
 *  - Day-40 reveal draws a real map with Layer 4 annotations
 *  - After first intercept: logs continue but doesn't reset patience
 *    (interrupting once does NOT void the day-40 ending;
 *     it just changes what he says when the map appears)
 *  - Proper flag setting for endings
 */
class CartographerEntity {
  constructor(scene, W, H, city) {
    this._scene   = scene;
    this._W = W; this._H = H;
    this._city    = city;
    this._route   = [];
    this._routeIndex = 0;
    this._x = city.centralPlaza.x;
    this._y = city.centralPlaza.y;
    this._waiting  = false;
    this._waitTime = 0;
    this._speed    = 38;
    this._sprite          = scene.add.graphics().setDepth(35);
    this._measureGraphics = scene.add.graphics().setDepth(32);
    this._revealGraphics  = scene.add.graphics().setDepth(33);
    this._labelText       = scene.add.text(0, 0, '', {
      fontFamily:'monospace', fontSize:'9px', color:'#1e3a5a'
    }).setDepth(36).setAlpha(0);
    this._interacted = false;

    this._generateRoute();
    this._draw();
  }

  _generateRoute() {
    const cx = this._city.centralPlaza.x;
    const cy = this._city.centralPlaza.y;
    this._route = [
      {x:cx,       y:cy},
      {x:cx-160,   y:cy},
      {x:cx-160,   y:cy-100},
      {x:cx-80,    y:cy-100},
      {x:cx-80,    y:cy-180},
      {x:cx+80,    y:cy-180},
      {x:cx+80,    y:cy-100},
      {x:cx+160,   y:cy-100},
      {x:cx+160,   y:cy},
      {x:cx+160,   y:cy+100},
      {x:cx+80,    y:cy+100},
      {x:cx+80,    y:cy+180},
      {x:cx-80,    y:cy+180},
      {x:cx-80,    y:cy+100},
      {x:cx-160,   y:cy+100},
      {x:cx-160,   y:cy},
      {x:cx,       y:cy},
    ];
  }

  _draw() {
    const x = this._x, y = this._y;
    const g = this._sprite;
    g.clear();
    if (this._waiting) {
      const pulse = Math.sin(Date.now() * 0.004) * 0.3 + 0.7;
      g.lineStyle(1, 0x3a6a9a, pulse * 0.6).strokeCircle(x, y, 14);
      g.fillStyle(0x1a3a5a, 0.8).fillCircle(x, y, 6);
      g.fillStyle(0x3a6a9a, 0.9).fillCircle(x, y, 3);
    } else {
      g.fillStyle(0x1a3050, 0.7).fillCircle(x, y, 5);
      g.fillStyle(0x2a5080, 0.9).fillCircle(x, y, 2.5);
      const target = this._route[this._routeIndex];
      if (target) {
        const angle = Math.atan2(target.y - y, target.x - x);
        g.lineStyle(0.8, 0x2a5080, 0.5)
         .lineBetween(x, y, x + Math.cos(angle) * 8, y + Math.sin(angle) * 8);
      }
    }
  }

  _drawMeasurement(x1, y1, x2, y2) {
    const g = this._measureGraphics;
    g.lineStyle(0.3, 0x1a2a3a, 0.25).lineBetween(x1, y1, x2, y2);
    const angle = Math.atan2(y2 - y1, x2 - x1), perp = angle + Math.PI / 2;
    [{x:x1,y:y1},{x:x2,y:y2}].forEach(p => {
      g.lineBetween(p.x+Math.cos(perp)*3, p.y+Math.sin(perp)*3,
                    p.x-Math.cos(perp)*3, p.y-Math.sin(perp)*3);
    });
  }

  // Called by Layer3Scene when E is pressed near the Cartographer
  interact(parentScene) {
    if (this._interacted) return;
    this._interacted = true;
    this._waiting = true;
    this._waitTime = 0;

    const days = StateManager.get('cartographerDays') || 0;

    // One line of dialogue — varies by day
    let line;
    if (days < 5)       line = '...';
    else if (days < 15) line = 'You are new here.';
    else if (days < 25) line = 'Still here.\n\nSo am I.';
    else if (days < 35) line = 'I am nearly finished.\n\nSo are you, I think.';
    else                line = 'Tomorrow.\n\nWait at the plaza.';

    const tree = {
      startNode: 'only',
      nodes: {
        only: {
          speaker: 'CARTOGRAPHER',
          text: line,
          onComplete: () => {
            StateManager.flag('cartographer_spoken_to');
            StateManager.addMarenNote(
              `I stopped him.\n` +
              `he said: "${line.replace(/\n\n/g, ' ')}"\n` +
              `then he waited. then he continued.\n` +
              `day ${days}.`
            );
          }
        }
      }
    };
    DialogueEngine.start(parentScene, tree, () => {
      this._waiting = false;
      this._interacted = false; // allow next interaction
    });
  }

  update(time, delta, playerX, playerY) {
    const dt   = delta / 1000;
    const days = StateManager.get('cartographerDays') || 0;

    // Day 40 reveal
    if (days >= 40 && !StateManager.get('cartographerRevealTriggered')) {
      this._triggerReveal();
      return;
    }

    if (this._waiting) {
      this._waitTime += delta;
      if (this._waitTime > 8000 && !DialogueEngine?.isActive()) {
        this._waiting = false;
      }
      this._draw();
      return;
    }

    // Move toward route target
    const target = this._route[this._routeIndex];
    if (!target) { this._routeIndex = 0; return; }

    const tdx = target.x - this._x;
    const tdy = target.y - this._y;
    const td  = Math.sqrt(tdx * tdx + tdy * tdy);

    if (td < 2) {
      if (this._routeIndex > 0) {
        this._drawMeasurement(
          this._route[this._routeIndex - 1].x, this._route[this._routeIndex - 1].y,
          target.x, target.y
        );
      }
      this._routeIndex = (this._routeIndex + 1) % this._route.length;
    } else {
      const spd = this._speed * dt;
      this._x += (tdx / td) * spd;
      this._y += (tdy / td) * spd;
    }

    this._draw();
  }

  _triggerReveal() {
    StateManager.set('cartographerRevealTriggered', true);
    StateManager.flag('ending_cartographer_unlocked');

    this._x = this._city.centralPlaza.x;
    this._y = this._city.centralPlaza.y;
    this._waiting = true;

    const g   = this._revealGraphics;
    const mx  = this._x - 50;
    const my  = this._y + 24;

    // Map outline
    g.lineStyle(1, 0x3a6a9a, 0.9).strokeRect(mx, my, 100, 66);

    // Layer 4 grid — 5 columns x 3 rows
    g.lineStyle(0.4, 0x2a5080, 0.5);
    for (let i = 1; i < 5; i++) g.lineBetween(mx + i*20, my, mx + i*20, my + 66);
    for (let i = 1; i < 3; i++) g.lineBetween(mx, my + i*22, mx + 100, my + i*22);

    // Fragment markers — 8 dots for the 8 data fragments
    const markers = [
      {r:0,c:0},{r:0,c:2},{r:0,c:4},
      {r:1,c:1},{r:1,c:3},
      {r:2,c:0},{r:2,c:2},{r:2,c:4}
    ];
    markers.forEach(m => {
      const fx = mx + m.c * 20 + 10;
      const fy = my + m.r * 22 + 11;
      g.fillStyle(0x3a6a9a, 0.8).fillCircle(fx, fy, 2.5);
      g.lineStyle(0.3, 0x2a5080, 0.4).strokeCircle(fx, fy, 5);
    });

    // Path through the grid
    g.lineStyle(0.6, 0x4a8aba, 0.6);
    const path = markers.map(m => ({x: mx + m.c*20+10, y: my + m.r*22+11}));
    g.beginPath(); g.moveTo(path[0].x, path[0].y);
    path.forEach(p => g.lineTo(p.x, p.y));
    g.strokePath();

    // Label below map
    this._scene.add.text(mx + 50, my + 74, 'layer 4 — complete', {
      fontFamily:'monospace', fontSize:'8px', color:'#2a5080', align:'center'
    }).setOrigin(0.5, 0).setDepth(36);

    const spoken = StateManager.hasFlag('cartographer_spoken_to');
    StateManager.addMarenNote(
      `day 40.\n` +
      `he stopped at the central plaza.\n` +
      `he placed a map on the ground.\n` +
      `it shows layer 4. every path. every fragment. every filing node.\n` +
      (spoken
        ? `he told me to wait here. I waited.\n`
        : `he never said a word to me.\n`) +
      `he has been down there.\n` +
      `he knew the whole time.\n` +
      `he was just waiting for someone patient enough to let him finish.`
    );

    EventBus.emit('ending:cartographer');
    StateManager.set('endingUnlocked', 'cartographer');
  }
}
