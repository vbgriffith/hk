// ============================================================
//  AXIOM BREAK — minimap.js  [PHASE 2]
//  Live minimap rendered in the UIScene overlay layer.
//
//  Shows: walls, floor, player position, enemies, portal.
//  Mounts at bottom-right of screen; toggles with [Tab].
// ============================================================

class Minimap {
  constructor(uiScene) {
    this.scene   = uiScene;
    this.visible = true;

    // ── Layout constants
    this.CELL = 7;           // px per tile on minimap
    this.PAD  = 10;          // padding from corner
    this.ALPHA_BG   = 0.75;
    this.ALPHA_WALL = 0.9;

    // Graphics object lives in UIScene
    this.gfx = uiScene.add.graphics();
    this.gfx.setDepth(100);

    // Player / enemy dot graphics
    this.dotGfx = uiScene.add.graphics();
    this.dotGfx.setDepth(101);

    // ── Baked map graphic (redrawn when level changes)
    this.mapGfx   = uiScene.add.graphics();
    this.mapGfx.setDepth(99);
    this._layout  = null;
    this._mapW    = 0;
    this._mapH    = 0;
    this._offsetX = 0;
    this._offsetY = 0;
  }

  // Call once per level with the tile layout
  buildMap(layout) {
    this._layout = layout;
    const cols = layout[0].length;
    const rows = layout.length;
    const c    = this.CELL;

    this._mapW = cols * c;
    this._mapH = rows * c;

    const W = AXIOM.WIDTH;
    const H = AXIOM.HEIGHT;
    this._offsetX = W - this._mapW - this.PAD;
    this._offsetY = H - this._mapH - this.PAD;

    this._drawStaticMap();
  }

  _drawStaticMap() {
    const g   = this.mapGfx;
    const c   = this.CELL;
    const ox  = this._offsetX;
    const oy  = this._offsetY;
    g.clear();

    // Background panel
    g.fillStyle(0x000000, this.ALPHA_BG);
    g.fillRect(ox - 4, oy - 4, this._mapW + 8, this._mapH + 8);

    // Border
    g.lineStyle(1, AXIOM.COLORS.WALL_EDGE, 0.6);
    g.strokeRect(ox - 4, oy - 4, this._mapW + 8, this._mapH + 8);

    // Corner accents
    const corners = [
      [ox-4, oy-4], [ox+this._mapW+4, oy-4],
      [ox-4, oy+this._mapH+4], [ox+this._mapW+4, oy+this._mapH+4]
    ];
    g.lineStyle(1.5, 0x00f5ff, 0.8);
    for (const [cx, cy] of corners) {
      const ax = cx < ox ? 1 : -1;
      const ay = cy < oy ? 1 : -1;
      g.strokeLineShape({ x1: cx, y1: cy, x2: cx + ax*5, y2: cy });
      g.strokeLineShape({ x1: cx, y1: cy, x2: cx, y2: cy + ay*5 });
    }

    // Tiles
    for (let row = 0; row < this._layout.length; row++) {
      for (let col = 0; col < this._layout[row].length; col++) {
        const tx = ox + col * c;
        const ty = oy + row * c;
        if (this._layout[row][col] === 1) {
          g.fillStyle(AXIOM.COLORS.WALL, this.ALPHA_WALL);
          g.fillRect(tx, ty, c, c);
        } else {
          g.fillStyle(AXIOM.COLORS.FLOOR, 0.6);
          g.fillRect(tx, ty, c, c);
        }
      }
    }

    // Label
    g.fillStyle(0x00f5ff, 0.0); // transparent (label drawn via text)
  }

  // Call every frame with live positions
  update(playerX, playerY, enemies, portalActive, portalX, portalY) {
    if (!this.visible || !this._layout) return;

    const g  = this.dotGfx;
    const c  = this.CELL;
    const ts = 64; // tile size in world
    const ox = this._offsetX;
    const oy = this._offsetY;

    g.clear();

    // Portal
    if (portalActive) {
      const mx = ox + (portalX / ts) * c;
      const my = oy + (portalY / ts) * c;
      g.lineStyle(1, AXIOM.COLORS.PORTAL, 0.9);
      g.strokeCircle(mx, my, 3.5);
      g.fillStyle(AXIOM.COLORS.PORTAL, 0.6);
      g.fillCircle(mx, my, 2);
    }

    // Enemies
    for (const e of enemies) {
      if (e.dead) continue;
      const mx = ox + (e.x / ts) * c;
      const my = oy + (e.y / ts) * c;
      const col = AXIOM.COLORS['ENEMY_' + e.type];
      g.fillStyle(col, 0.85);
      g.fillRect(mx - 1.5, my - 1.5, 3, 3);
    }

    // Player (blinking dot)
    const px = ox + (playerX / ts) * c;
    const py = oy + (playerY / ts) * c;
    const pulse = 0.65 + 0.35 * Math.sin(this.scene.time.now / 200);
    g.fillStyle(AXIOM.COLORS.PLAYER, pulse);
    g.fillCircle(px, py, 2.5);
    g.lineStyle(1, AXIOM.COLORS.PLAYER, pulse * 0.5);
    g.strokeCircle(px, py, 4);

    this.gfx.setVisible(this.visible);
    this.mapGfx.setVisible(this.visible);
    this.dotGfx.setVisible(this.visible);
  }

  toggle() {
    this.visible = !this.visible;
    this.mapGfx.setVisible(this.visible);
    this.dotGfx.setVisible(this.visible);
    this.gfx.setVisible(this.visible);
  }

  destroy() {
    this.gfx.destroy();
    this.dotGfx.destroy();
    this.mapGfx.destroy();
  }
}
