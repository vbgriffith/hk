// ============================================================
//  AXIOM BREAK — BootScene.js
//  Generates all graphical assets procedurally using canvas
// ============================================================

class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'Boot' }); }

  preload() {
    // We generate everything procedurally, no external assets needed
    // Just create a loading bar
    const W = AXIOM.WIDTH, H = AXIOM.HEIGHT;
    const bar = this.add.graphics();

    this.load.on('progress', (v) => {
      bar.clear();
      bar.fillStyle(0x000000, 1);
      bar.fillRect(0, 0, W, H);
      bar.fillStyle(0x00f5ff, 0.15);
      bar.fillRect(W * 0.1, H * 0.49, W * 0.8, 12);
      bar.fillStyle(0x00f5ff, 1);
      bar.fillRect(W * 0.1, H * 0.49, W * 0.8 * v, 12);
    });
  }

  create() {
    this._generateTextures();
    this.scene.start('Menu');
  }

  _generateTextures() {
    // ── Floor tile
    const floorGfx = this.make.graphics({ x: 0, y: 0, add: false });
    floorGfx.fillStyle(AXIOM.COLORS.FLOOR, 1);
    floorGfx.fillRect(0, 0, 64, 64);
    floorGfx.lineStyle(1, 0x112233, 0.6);
    floorGfx.strokeRect(0, 0, 64, 64);
    // Grid detail
    floorGfx.lineStyle(1, 0x0d2035, 0.4);
    floorGfx.strokeRect(2, 2, 60, 60);
    // Corner dots
    for (const [cx, cy] of [[4,4],[60,4],[4,60],[60,60]]) {
      floorGfx.fillStyle(0x00aabb, 0.3);
      floorGfx.fillCircle(cx, cy, 2);
    }
    floorGfx.generateTexture('floor', 64, 64);
    floorGfx.destroy();

    // ── Wall tile
    const wallGfx = this.make.graphics({ x: 0, y: 0, add: false });
    wallGfx.fillStyle(AXIOM.COLORS.WALL, 1);
    wallGfx.fillRect(0, 0, 64, 64);
    wallGfx.lineStyle(2, AXIOM.COLORS.WALL_EDGE, 0.5);
    wallGfx.strokeRect(0, 0, 64, 64);
    wallGfx.lineStyle(1, AXIOM.COLORS.WALL_EDGE, 0.2);
    wallGfx.strokeRect(4, 4, 56, 56);
    // Hazard stripes on edge
    for (let i = 0; i < 8; i++) {
      const shade = i % 2 === 0 ? 0x00aabb : 0x0d2035;
      wallGfx.fillStyle(shade, 0.18);
      wallGfx.fillRect(0, i * 8, 64, 8);
    }
    wallGfx.generateTexture('wall', 64, 64);
    wallGfx.destroy();

    // ── Portal
    const portGfx = this.make.graphics({ x: 0, y: 0, add: false });
    portGfx.fillStyle(0x000000, 0);
    portGfx.fillRect(0, 0, 48, 48);
    portGfx.lineStyle(3, AXIOM.COLORS.PORTAL, 1);
    portGfx.strokeCircle(24, 24, 20);
    portGfx.lineStyle(1, AXIOM.COLORS.PORTAL, 0.5);
    portGfx.strokeCircle(24, 24, 14);
    portGfx.fillStyle(AXIOM.COLORS.PORTAL, 0.3);
    portGfx.fillCircle(24, 24, 10);
    portGfx.generateTexture('portal', 48, 48);
    portGfx.destroy();
  }
}
