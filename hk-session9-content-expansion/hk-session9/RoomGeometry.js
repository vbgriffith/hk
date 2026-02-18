/* js/data/RoomGeometry.js — Session 9: Detailed Room Layouts
 * 
 * Enhanced room geometry with detailed platforms, decorations, and features
 */
'use strict';

// ══════════════════════════════════════════════════════════════════════════
// ENHANCED ROOM GEOMETRY
// ══════════════════════════════════════════════════════════════════════════

const ENHANCED_ROOMS = {
  
  // ── GREENPATH ───────────────────────────────────────────────────────────
  
  greenpath_main_enhanced: {
    key: 'greenpath_main',
    _w: 640, _h: 380,
    
    // Detailed platform layout
    platforms: [
      // Floor
      { x: 0, y: 330, w: 640, h: 50 },
      
      // Left side - ascending platforms
      { x: 20, y: 280, w: 80, h: 12 },
      { x: 60, y: 230, w: 90, h: 12 },
      { x: 30, y: 180, w: 70, h: 12 },
      { x: 80, y: 130, w: 80, h: 12 },
      
      // Center - main platform
      { x: 200, y: 250, w: 240, h: 15 },
      { x: 240, y: 200, w: 160, h: 12 },
      
      // Right side - descending
      { x: 480, y: 280, w: 90, h: 12 },
      { x: 520, y: 230, w: 80, h: 12 },
      { x: 490, y: 180, w: 70, h: 12 },
      
      // Upper area
      { x: 180, y: 120, w: 120, h: 12 },
      { x: 340, y: 120, w: 120, h: 12 },
      
      // Boundaries
      { x: 0, y: 0, w: 10, h: 380 },
      { x: 630, y: 0, w: 10, h: 380 },
      { x: 0, y: 0, w: 640, h: 10 },
    ],
    
    // Environmental hazards
    hazards: [
      { type: 'thorns', x: 150, y: 320, w: 40, h: 10 },
      { type: 'thorns', x: 450, y: 320, w: 40, h: 10 },
    ],
    
    // Decorative elements (non-collision)
    decorations: [
      { type: 'vine', x: 100, y: 50, length: 80 },
      { type: 'vine', x: 300, y: 30, length: 120 },
      { type: 'vine', x: 500, y: 60, length: 100 },
      { type: 'mushroom', x: 220, y: 245, size: 'large' },
      { type: 'mushroom', x: 380, y: 245, size: 'large' },
      { type: 'grass_tuft', x: 50, y: 325, density: 'high' },
      { type: 'grass_tuft', x: 250, y: 325, density: 'medium' },
      { type: 'glowing_plant', x: 150, y: 275, color: 0x80ff80 },
      { type: 'glowing_plant', x: 450, y: 275, color: 0x80ff80 },
    ],
    
    // Background layers
    background: [
      { type: 'roots', x: 0, y: 100, parallax: 0.3 },
      { type: 'deep_forest', x: 0, y: 0, parallax: 0.2 },
    ],
  },
  
  // ── FUNGAL WASTES ───────────────────────────────────────────────────────
  
  fungal_main_enhanced: {
    key: 'fungal_main',
    _w: 640, _h: 380,
    
    platforms: [
      // Main floor
      { x: 0, y: 330, w: 640, h: 50 },
      
      // Mushroom platforms (organic shapes)
      { x: 80, y: 270, w: 100, h: 10, rounded: true },
      { x: 240, y: 220, w: 120, h: 10, rounded: true },
      { x: 420, y: 190, w: 100, h: 10, rounded: true },
      
      // Upper fungal shelves
      { x: 100, y: 150, w: 80, h: 10, rounded: true },
      { x: 300, y: 110, w: 100, h: 10, rounded: true },
      { x: 500, y: 130, w: 80, h: 10, rounded: true },
      
      // Boundaries
      { x: 0, y: 0, w: 10, h: 380 },
      { x: 630, y: 0, w: 10, h: 380 },
      { x: 0, y: 0, w: 640, h: 10 },
    ],
    
    hazards: [
      { type: 'acid', x: 0, y: 355, w: 100, h: 25 },
      { type: 'acid', x: 540, y: 355, w: 100, h: 25 },
      { type: 'spore_fog', x: 200, y: 200, w: 100, h: 120 },
    ],
    
    decorations: [
      { type: 'giant_mushroom', x: 150, y: 270, size: 'xl' },
      { type: 'giant_mushroom', x: 400, y: 190, size: 'large' },
      { type: 'spore_particles', x: 250, y: 250, density: 'medium' },
      { type: 'fungal_growth', x: 50, y: 325, pattern: 'cluster' },
      { type: 'glowing_shroom', x: 180, y: 265, color: 0x9a6aaa },
      { type: 'glowing_shroom', x: 460, y: 185, color: 0x9a6aaa },
    ],
    
    background: [
      { type: 'spore_clouds', x: 0, y: 100, parallax: 0.4 },
      { type: 'fungal_cavern', x: 0, y: 0, parallax: 0.2 },
    ],
  },
  
  // ── CITY OF TEARS ───────────────────────────────────────────────────────
  
  city_main_enhanced: {
    key: 'city_main',
    _w: 640, _h: 380,
    
    platforms: [
      // Main floor (polished stone)
      { x: 0, y: 330, w: 640, h: 50 },
      
      // Architectural platforms
      { x: 80, y: 270, w: 100, h: 10 },
      { x: 240, y: 230, w: 120, h: 10 },
      { x: 420, y: 190, w: 100, h: 10 },
      
      // Building ledges
      { x: 100, y: 150, w: 80, h: 10 },
      { x: 300, y: 110, w: 100, h: 10 },
      { x: 500, y: 130, w: 80, h: 10 },
      
      // Upper architecture
      { x: 200, y: 80, w: 240, h: 12 },
      
      // Boundaries
      { x: 0, y: 0, w: 10, h: 380 },
      { x: 630, y: 0, w: 10, h: 380 },
      { x: 0, y: 0, w: 640, h: 10 },
    ],
    
    hazards: [
      { type: 'water', x: 0, y: 360, w: 640, h: 20 }, // Shallow water floor
    ],
    
    decorations: [
      { type: 'statue', x: 320, y: 200, style: 'king' },
      { type: 'pillar', x: 120, y: 150, height: 'tall' },
      { type: 'pillar', x: 520, y: 150, height: 'tall' },
      { type: 'lantern', x: 200, y: 65, lit: true },
      { type: 'lantern', x: 440, y: 65, lit: true },
      { type: 'water_drip', x: 150, y: 0, frequency: 'slow' },
      { type: 'water_drip', x: 350, y: 0, frequency: 'slow' },
      { type: 'water_drip', x: 500, y: 0, frequency: 'medium' },
      { type: 'building_facade', x: 100, y: 80, style: 'ornate' },
      { type: 'building_facade', x: 480, y: 100, style: 'weathered' },
    ],
    
    background: [
      { type: 'city_towers', x: 0, y: 50, parallax: 0.3 },
      { type: 'rain_curtain', x: 0, y: 0, parallax: 0.5 },
      { type: 'distant_buildings', x: 0, y: 0, parallax: 0.15 },
    ],
  },
  
  // ── CRYSTAL PEAK ────────────────────────────────────────────────────────
  
  crystal_peak_main_enhanced: {
    key: 'crystal_peak_main',
    _w: 480, _h: 320,
    
    platforms: [
      // Floor
      { x: 0, y: 295, w: 480, h: 25 },
      
      // Crystalline platforms
      { x: 100, y: 230, w: 100, h: 10 },
      { x: 280, y: 230, w: 100, h: 10 },
      { x: 200, y: 170, w: 80, h: 10 },
      
      // Upper crystals
      { x: 80, y: 120, w: 90, h: 10 },
      { x: 310, y: 120, w: 90, h: 10 },
      
      // Boundaries
      { x: 0, y: 0, w: 10, h: 320 },
      { x: 470, y: 0, w: 10, h: 320 },
      { x: 0, y: 0, w: 480, h: 10 },
    ],
    
    hazards: [
      { type: 'crystal_spikes', x: 50, y: 290, w: 30, h: 10 },
      { type: 'crystal_spikes', x: 400, y: 290, w: 30, h: 10 },
    ],
    
    decorations: [
      { type: 'crystal_cluster', x: 120, y: 220, size: 'large', color: 0xaae8ff },
      { type: 'crystal_cluster', x: 340, y: 220, size: 'medium', color: 0x88d0ff },
      { type: 'crystal_beam', x: 150, y: 0, length: 180, angle: 75 },
      { type: 'crystal_beam', x: 330, y: 0, length: 200, angle: 105 },
      { type: 'glow_particle', x: 240, y: 150, radius: 80, color: 0xaae8ff },
      { type: 'crystal_shard', x: 60, y: 100, size: 'small' },
      { type: 'crystal_shard', x: 420, y: 110, size: 'small' },
    ],
    
    background: [
      { type: 'crystal_veins', x: 0, y: 0, parallax: 0.3 },
      { type: 'glowing_cavern', x: 0, y: 0, parallax: 0.2 },
    ],
  },
  
  // ── ANCIENT BASIN ───────────────────────────────────────────────────────
  
  basin_depths_enhanced: {
    key: 'basin_depths',
    _w: 480, _h: 320,
    
    platforms: [
      // Main platforms
      { x: 0, y: 295, w: 480, h: 25 },
      { x: 100, y: 230, w: 80, h: 10 },
      { x: 300, y: 230, w: 80, h: 10 },
      { x: 200, y: 160, w: 80, h: 10 },
      
      // Upper area
      { x: 150, y: 100, w: 180, h: 10 },
      
      // Boundaries
      { x: 0, y: 0, w: 10, h: 320 },
      { x: 470, y: 0, w: 10, h: 320 },
      { x: 0, y: 0, w: 480, h: 10 },
    ],
    
    hazards: [
      { type: 'void_tide', x: 0, y: 305, w: 480, h: 15 },
      { type: 'void_tendril', x: 120, y: 200, w: 40, h: 80 },
      { type: 'void_tendril', x: 320, y: 200, w: 40, h: 80 },
    ],
    
    decorations: [
      { type: 'ancient_pillar', x: 100, y: 100, height: 195, broken: true },
      { type: 'ancient_pillar', x: 380, y: 120, height: 175, broken: true },
      { type: 'void_particle', x: 240, y: 160, radius: 100, density: 'high' },
      { type: 'rune_stone', x: 200, y: 285, glow: 0x5050aa },
      { type: 'rune_stone', x: 280, y: 285, glow: 0x5050aa },
      { type: 'ancient_statue', x: 240, y: 80, style: 'king_fragment' },
    ],
    
    background: [
      { type: 'void_abyss', x: 0, y: 0, parallax: 0.1 },
      { type: 'ancient_architecture', x: 0, y: 0, parallax: 0.25 },
    ],
  },
  
  // ── THE ABYSS ───────────────────────────────────────────────────────────
  
  abyss_depths_enhanced: {
    key: 'abyss_depths',
    _w: 480, _h: 320,
    
    platforms: [
      // Minimal platforms
      { x: 0, y: 295, w: 480, h: 25 },
      { x: 150, y: 220, w: 180, h: 10 },
      { x: 100, y: 150, w: 80, h: 10 },
      { x: 300, y: 150, w: 80, h: 10 },
      { x: 200, y: 100, w: 80, h: 10 },
      
      // Boundaries
      { x: 0, y: 0, w: 10, h: 320 },
      { x: 470, y: 0, w: 10, h: 320 },
      { x: 0, y: 0, w: 480, h: 10 },
    ],
    
    hazards: [
      { type: 'void_tide', x: 0, y: 305, w: 480, h: 15 },
      { type: 'void_tendril', x: 240, y: 0, w: 60, h: 100 },
    ],
    
    decorations: [
      { type: 'void_sibling', x: 120, y: 285, state: 'dormant' },
      { type: 'void_sibling', x: 360, y: 285, state: 'dormant' },
      { type: 'void_particle', x: 240, y: 160, radius: 120, density: 'extreme' },
      { type: 'shade_gate', x: 240, y: 50, active: false },
      { type: 'ancient_seal', x: 150, y: 210, broken: true },
      { type: 'ancient_seal', x: 310, y: 210, broken: true },
    ],
    
    background: [
      { type: 'pure_void', x: 0, y: 0, parallax: 0 },
      { type: 'void_eyes', x: 0, y: 0, parallax: 0.05 },
    ],
  },
  
  // ── QUEEN'S GARDENS ─────────────────────────────────────────────────────
  
  queens_gardens_main_enhanced: {
    key: 'queens_gardens_main',
    _w: 480, _h: 320,
    
    platforms: [
      // Floor
      { x: 0, y: 295, w: 480, h: 25 },
      
      // Garden platforms
      { x: 120, y: 220, w: 240, h: 10 },
      { x: 80, y: 160, w: 120, h: 10 },
      { x: 280, y: 160, w: 120, h: 10 },
      { x: 200, y: 100, w: 80, h: 10 },
      
      // Boundaries
      { x: 0, y: 0, w: 10, h: 320 },
      { x: 470, y: 0, w: 10, h: 320 },
      { x: 0, y: 0, w: 480, h: 10 },
    ],
    
    hazards: [
      { type: 'thorns', x: 30, y: 290, w: 40, h: 10 },
      { type: 'thorns', x: 410, y: 290, w: 40, h: 10 },
    ],
    
    decorations: [
      { type: 'royal_flower', x: 240, y: 210, size: 'large', color: 0xff88cc },
      { type: 'ornate_vine', x: 100, y: 0, length: 160, pattern: 'spiral' },
      { type: 'ornate_vine', x: 380, y: 0, length: 160, pattern: 'spiral' },
      { type: 'flower_patch', x: 150, y: 285, variety: 'mixed' },
      { type: 'flower_patch', x: 330, y: 285, variety: 'mixed' },
      { type: 'garden_statue', x: 120, y: 150, style: 'queen' },
      { type: 'garden_statue', x: 360, y: 150, style: 'root' },
      { type: 'butterfly', x: 200, y: 180, pattern: 'figure_8' },
      { type: 'butterfly', x: 280, y: 140, pattern: 'circle' },
    ],
    
    background: [
      { type: 'white_palace', x: 0, y: 0, parallax: 0.15 },
      { type: 'royal_gardens_depth', x: 0, y: 0, parallax: 0.3 },
    ],
  },
};

// ══════════════════════════════════════════════════════════════════════════
// DECORATION RENDERING
// ══════════════════════════════════════════════════════════════════════════

class RoomDecorator {
  constructor(scene) {
    this.scene = scene;
    this.decorations = [];
  }
  
  renderDecorations(roomData) {
    if (!roomData.decorations) return;
    
    roomData.decorations.forEach(dec => {
      const sprite = this._createDecoration(dec);
      if (sprite) {
        this.decorations.push(sprite);
      }
    });
  }
  
  _createDecoration(dec) {
    const s = this.scene;
    
    switch(dec.type) {
      case 'vine':
        return this._drawVine(dec);
      case 'mushroom':
        return this._drawMushroom(dec);
      case 'grass_tuft':
        return this._drawGrass(dec);
      case 'glowing_plant':
        return this._drawGlowingPlant(dec);
      case 'crystal_cluster':
        return this._drawCrystalCluster(dec);
      case 'statue':
        return this._drawStatue(dec);
      case 'pillar':
        return this._drawPillar(dec);
      case 'lantern':
        return this._drawLantern(dec);
      default:
        return null;
    }
  }
  
  _drawVine(dec) {
    const g = this.scene.add.graphics();
    g.lineStyle(2, 0x2a5a2a, 0.8);
    g.beginPath();
    g.moveTo(dec.x, dec.y);
    
    // Wavy vine
    for (let i = 0; i < dec.length; i += 10) {
      const wave = Math.sin(i / 20) * 5;
      g.lineTo(dec.x + wave, dec.y + i);
    }
    g.stroke();
    
    // Add leaves
    g.fillStyle(0x3a7a3a, 0.7);
    for (let i = 0; i < dec.length; i += 25) {
      const side = i % 50 < 25 ? -1 : 1;
      g.fillEllipse(dec.x + side * 5, dec.y + i, 6, 4);
    }
    
    return g;
  }
  
  _drawMushroom(dec) {
    const g = this.scene.add.graphics();
    const size = dec.size === 'large' ? 20 : 12;
    
    // Cap
    g.fillStyle(0x8a6a9a, 0.9);
    g.fillEllipse(dec.x, dec.y, size, size * 0.6);
    
    // Spots
    g.fillStyle(0xaa8aba, 0.7);
    g.fillCircle(dec.x - size * 0.3, dec.y - size * 0.1, size * 0.15);
    g.fillCircle(dec.x + size * 0.3, dec.y - size * 0.1, size * 0.15);
    
    // Stem
    g.fillStyle(0x6a5a7a, 0.9);
    g.fillRect(dec.x - size * 0.15, dec.y, size * 0.3, size * 0.8);
    
    return g;
  }
  
  _drawGrass(dec) {
    const g = this.scene.add.graphics();
    const count = dec.density === 'high' ? 15 : 8;
    
    g.lineStyle(1, 0x3a7a3a, 0.7);
    
    for (let i = 0; i < count; i++) {
      const gx = dec.x + (Math.random() - 0.5) * 40;
      const height = 8 + Math.random() * 8;
      
      g.beginPath();
      g.moveTo(gx, dec.y);
      g.lineTo(gx + (Math.random() - 0.5) * 3, dec.y - height);
      g.stroke();
    }
    
    return g;
  }
  
  _drawGlowingPlant(dec) {
    const g = this.scene.add.graphics();
    
    // Glow
    g.fillStyle(dec.color, 0.2);
    g.fillCircle(dec.x, dec.y, 12);
    
    // Plant
    g.fillStyle(dec.color, 0.8);
    g.fillCircle(dec.x, dec.y, 4);
    
    // Pulse animation
    this.scene.tweens.add({
      targets: g,
      alpha: 0.6,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    return g;
  }
  
  _drawCrystalCluster(dec) {
    const g = this.scene.add.graphics();
    const count = dec.size === 'large' ? 5 : 3;
    
    for (let i = 0; i < count; i++) {
      const cx = dec.x + (Math.random() - 0.5) * 20;
      const cy = dec.y + (Math.random() - 0.5) * 10;
      const height = 15 + Math.random() * 15;
      
      // Crystal
      g.fillStyle(dec.color, 0.8);
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + 4, cy - height);
      g.lineTo(cx + 8, cy);
      g.lineTo(cx + 4, cy - height * 0.7);
      g.closePath();
      g.fill();
      
      // Highlight
      g.fillStyle(0xffffff, 0.3);
      g.beginPath();
      g.moveTo(cx + 2, cy - height * 0.8);
      g.lineTo(cx + 3, cy - height * 0.6);
      g.lineTo(cx + 2, cy - height * 0.4);
      g.fill();
    }
    
    return g;
  }
  
  _drawStatue(dec) {
    const g = this.scene.add.graphics();
    
    // Base
    g.fillStyle(0x4a4a5a, 0.9);
    g.fillRect(dec.x - 15, dec.y + 20, 30, 10);
    
    // Body
    g.fillRect(dec.x - 8, dec.y - 20, 16, 40);
    
    // Head
    g.fillCircle(dec.x, dec.y - 25, 10);
    
    // Crown (if king style)
    if (dec.style === 'king') {
      g.fillStyle(0x6a6a7a, 0.9);
      g.fillRect(dec.x - 8, dec.y - 35, 16, 4);
      g.fillRect(dec.x - 4, dec.y - 40, 8, 8);
    }
    
    return g;
  }
  
  _drawPillar(dec) {
    const g = this.scene.add.graphics();
    const h = dec.height === 'tall' ? 120 : 80;
    
    // Pillar body
    g.fillStyle(0x3a4a5a, 0.9);
    g.fillRect(dec.x - 8, dec.y - h, 16, h);
    
    // Capital
    g.fillRect(dec.x - 12, dec.y - h - 8, 24, 8);
    
    // Base
    g.fillRect(dec.x - 12, dec.y, 24, 8);
    
    // Highlights
    g.fillStyle(0x5a6a7a, 0.5);
    g.fillRect(dec.x - 8, dec.y - h, 2, h);
    
    return g;
  }
  
  _drawLantern(dec) {
    const g = this.scene.add.graphics();
    
    // Lantern body
    g.fillStyle(0x3a3a2a, 0.9);
    g.fillRect(dec.x - 4, dec.y, 8, 12);
    
    // Top
    g.fillRect(dec.x - 5, dec.y - 3, 10, 3);
    
    if (dec.lit) {
      // Light glow
      g.fillStyle(0xffaa66, 0.3);
      g.fillCircle(dec.x, dec.y + 6, 15);
      
      // Flame
      g.fillStyle(0xffaa66, 0.9);
      g.fillCircle(dec.x, dec.y + 6, 3);
      
      // Pulse
      this.scene.tweens.add({
        targets: g,
        alpha: 0.8,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
    
    return g;
  }
  
  clear() {
    this.decorations.forEach(d => d.destroy());
    this.decorations = [];
  }
}

// ══════════════════════════════════════════════════════════════════════════
// INTEGRATION
// ══════════════════════════════════════════════════════════════════════════

/*
TO USE:

1. Add RoomDecorator to GameScene:
   this._decorator = new RoomDecorator(this);

2. In _buildRoom(), render decorations:
   const enhanced = ENHANCED_ROOMS[roomData.key + '_enhanced'];
   if (enhanced) {
     this._decorator.renderDecorations(enhanced);
   }

3. In _clearRoom(), clear decorations:
   this._decorator?.clear();

4. Replace room definitions in mapData files with enhanced versions

FEATURES:
- Detailed platform layouts for navigation variety
- Environmental hazards (thorns, acid, void)
- Decorative elements (vines, mushrooms, crystals, statues)
- Background layers with parallax
- Animated elements (glows, pulses)
- Area-specific aesthetics
*/
