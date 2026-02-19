/**
 * STRATA — CartographerEntity
 * Pieter Holm's methodology made ambulatory.
 * Walks the same route through Halverstrom every day.
 * Measures things. Leaves no marks.
 * If you intercept his path, he pauses and waits.
 * On day 40, if never interrupted, he places a map.
 */
class CartographerEntity {
  constructor(scene, W, H, city) {
    this._scene = scene;
    this._W = W;
    this._H = H;
    this._city = city;
    this._route = [];
    this._routeIndex = 0;
    this._x = city.centralPlaza.x;
    this._y = city.centralPlaza.y;
    this._waiting = false;
    this._waitTime = 0;
    this._speed = 40; // very slow, deliberate
    this._sprite = scene.add.graphics().setDepth(35);
    this._measureGraphics = scene.add.graphics().setDepth(32);
    this._labelText = scene.add.text(0, 0, '', {
      fontFamily: 'monospace', fontSize: '9px', color: '#1e3a5a'
    }).setDepth(36).setAlpha(0);

    this._generateRoute();
    this._draw();
  }

  _generateRoute() {
    // The Cartographer walks a deliberate figure-8 through the city
    // Deterministic — same route every day
    const cx = this._city.centralPlaza.x;
    const cy = this._city.centralPlaza.y;
    const W = this._W;
    const H = this._H;

    this._route = [
      { x: cx, y: cy },
      { x: cx - 160, y: cy },
      { x: cx - 160, y: cy - 100 },
      { x: cx - 80, y: cy - 100 },
      { x: cx - 80, y: cy - 180 },
      { x: cx + 80, y: cy - 180 },
      { x: cx + 80, y: cy - 100 },
      { x: cx + 160, y: cy - 100 },
      { x: cx + 160, y: cy },
      { x: cx + 160, y: cy + 100 },
      { x: cx + 80, y: cy + 100 },
      { x: cx + 80, y: cy + 180 },
      { x: cx - 80, y: cy + 180 },
      { x: cx - 80, y: cy + 100 },
      { x: cx - 160, y: cy + 100 },
      { x: cx - 160, y: cy },
      { x: cx, y: cy },   // return to center
    ];
  }

  _draw() {
    const x = this._x;
    const y = this._y;
    const g = this._sprite;
    g.clear();

    if (this._waiting) {
      // Waiting state — slightly larger, pulsing outline
      const pulse = Math.sin(Date.now() * 0.004) * 0.3 + 0.7;
      g.lineStyle(1, 0x3a6a9a, pulse * 0.6);
      g.strokeCircle(x, y, 14);
      g.fillStyle(0x1a3a5a, 0.8);
      g.fillCircle(x, y, 6);
      g.fillStyle(0x3a6a9a, 0.9);
      g.fillCircle(x, y, 3);
    } else {
      // Walking state — composed, small
      g.fillStyle(0x1a3050, 0.7);
      g.fillCircle(x, y, 5);
      g.fillStyle(0x2a5080, 0.9);
      g.fillCircle(x, y, 2.5);
      // Direction indicator — tiny line
      const target = this._route[this._routeIndex];
      if (target) {
        const angle = Math.atan2(target.y - y, target.x - x);
        g.lineStyle(0.8, 0x2a5080, 0.5);
        g.lineBetween(x, y, x + Math.cos(angle) * 8, y + Math.sin(angle) * 8);
      }
    }
  }

  _drawMeasurement(x1, y1, x2, y2) {
    // The Cartographer leaves faint measurement marks
    const g = this._measureGraphics;
    // Don't clear — measurements persist
    g.lineStyle(0.3, 0x1a2a3a, 0.3);
    g.lineBetween(x1, y1, x2, y2);
    // Endpoint ticks
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const perp = angle + Math.PI / 2;
    [{ x: x1, y: y1 }, { x: x2, y: y2 }].forEach(p => {
      g.lineBetween(
        p.x + Math.cos(perp) * 3, p.y + Math.sin(perp) * 3,
        p.x - Math.cos(perp) * 3, p.y - Math.sin(perp) * 3
      );
    });
  }

  update(time, delta, playerX, playerY) {
    const dt = delta / 1000;
    const days = StateManager.get('cartographerDays');

    // Check if player is intercepting
    const dx = playerX - this._x;
    const dy = playerY - this._y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 30 && !StateManager.get('cartographerInterrupted')) {
      // Player intercepts the route
      if (!this._waiting) {
        this._waiting = true;
        this._waitTime = 0;
        StateManager.set('cartographerInterrupted', true);

        // Show label
        this._labelText.setText('...').setPosition(this._x + 12, this._y - 20).setAlpha(0.6);

        // Maren's note
        StateManager.addMarenNote(
          `he stopped. he's just standing there. ` +
          `he's not looking at me — there's no facing direction in this renderer — but he stopped. ` +
          `and he's waiting.`
        );
      }
    }

    if (this._waiting) {
      this._waitTime += delta;
      // After 5 seconds of waiting, resume — but the interruption is logged
      if (this._waitTime > 5000) {
        this._waiting = false;
        this._labelText.setAlpha(0);
      }
      this._draw();
      return;
    }

    // Day 40 reveal — if never interrupted
    if (days >= 40 && !StateManager.get('cartographerInterrupted') && !StateManager.get('cartographerRevealTriggered')) {
      this._triggerReveal();
      return;
    }

    // Move toward current route target
    const target = this._route[this._routeIndex];
    if (!target) { this._routeIndex = 0; return; }

    const tdx = target.x - this._x;
    const tdy = target.y - this._y;
    const tdist = Math.sqrt(tdx * tdx + tdy * tdy);

    if (tdist < 2) {
      // Arrived at waypoint — draw measurement from previous
      if (this._routeIndex > 0) {
        const prev = this._route[this._routeIndex - 1];
        this._drawMeasurement(prev.x, prev.y, target.x, target.y);
      }
      this._routeIndex = (this._routeIndex + 1) % this._route.length;
    } else {
      const speed = this._speed * dt;
      this._x += (tdx / tdist) * speed;
      this._y += (tdy / tdist) * speed;
    }

    this._draw();
  }

  _triggerReveal() {
    StateManager.set('cartographerRevealTriggered', true);
    StateManager.flag('ending_cartographer_unlocked');

    // He stops at the central intersection
    this._x = this._city.centralPlaza.x;
    this._y = this._city.centralPlaza.y;
    this._waiting = true;

    // Draw the map he places — a tiny but perfect diagram
    const g = this._measureGraphics;
    const mx = this._x - 30;
    const my = this._y + 20;

    // Map outline
    g.lineStyle(1, 0x3a6a9a, 0.8);
    g.strokeRect(mx, my, 60, 40);
    // Grid lines on map
    g.lineStyle(0.5, 0x2a5080, 0.5);
    for (let i = 1; i < 4; i++) g.lineBetween(mx, my + i * 10, mx + 60, my + i * 10);
    for (let i = 1; i < 6; i++) g.lineBetween(mx + i * 10, my, mx + i * 10, my + 40);
    // Label
    const label = this._scene.add.text(mx + 30, my + 50, 'layer 4\n[all of it]', {
      fontFamily: 'monospace', fontSize: '8px', color: '#2a5080', align: 'center'
    }).setOrigin(0.5, 0).setDepth(36);

    StateManager.addMarenNote(
      `day 40. he stopped at the central plaza. he's placed something on the ground. ` +
      `it's a map. it's of Layer 4. every path, every fragment, every filing node. ` +
      `he's been down there. he knew the whole time. ` +
      `he was just waiting for someone patient enough to let him finish.`
    );

    EventBus.emit('ending:cartographer');
  }
}
