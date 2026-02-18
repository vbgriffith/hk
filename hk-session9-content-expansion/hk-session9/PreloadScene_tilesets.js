/* js/scenes/PreloadScene_tilesets.js — Session 9: Enhanced Tilesets
 * 
 * Generates detailed, area-specific tilesets with unique visual styles
 */
'use strict';

// ══════════════════════════════════════════════════════════════════════════
// TILESET GENERATION — Area-specific visual styles
// ══════════════════════════════════════════════════════════════════════════

function _genTiles_ENHANCED() {
  // Base tiles (Crossroads style)
  this._genCrossroadsTiles();
  
  // Area-specific tilesets
  this._genGreenpathTiles();
  this._genFungalTiles();
  this._genCityTiles();
  this._genCrystalTiles();
  this._genBasinTiles();
  this._genAbyssTiles();
  this._genFogCanyonTiles();
  this._genGardensTiles();
}

// ── Forgotten Crossroads ──────────────────────────────────────────────────
function _genCrossroadsTiles() {
  const TS = C.TILE_SIZE;
  
  // Floor tiles (stone with cracks)
  const floorCanvas = this.textures.createCanvas('tile_crossroads_floor', TS * 4, TS);
  const fctx = floorCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Base stone
    fctx.fillStyle = '#3a3a2a';
    fctx.fillRect(x, 0, TS, TS);
    
    // Texture variation
    fctx.fillStyle = '#4a4a3a';
    for (let j = 0; j < 8; j++) {
      const rx = x + Math.random() * TS;
      const ry = Math.random() * TS;
      fctx.fillRect(rx, ry, 2, 2);
    }
    
    // Cracks
    fctx.strokeStyle = '#2a2a1a';
    fctx.lineWidth = 1;
    fctx.beginPath();
    fctx.moveTo(x + Math.random() * TS, TS * 0.3);
    fctx.lineTo(x + Math.random() * TS, TS * 0.7);
    fctx.stroke();
    
    // Moss patches
    if (Math.random() > 0.5) {
      fctx.fillStyle = 'rgba(50, 80, 40, 0.3)';
      fctx.fillRect(x + Math.random() * (TS - 4), Math.random() * (TS - 4), 4, 4);
    }
  }
  
  floorCanvas.refresh();
  
  // Wall tiles (vertical stone)
  const wallCanvas = this.textures.createCanvas('tile_crossroads_wall', TS * 4, TS);
  const wctx = wallCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Base darker stone
    wctx.fillStyle = '#2a2a1a';
    wctx.fillRect(x, 0, TS, TS);
    
    // Vertical striations
    wctx.strokeStyle = '#3a3a2a';
    wctx.lineWidth = 1;
    for (let j = 0; j < 3; j++) {
      wctx.beginPath();
      wctx.moveTo(x + j * (TS / 3), 0);
      wctx.lineTo(x + j * (TS / 3), TS);
      wctx.stroke();
    }
    
    // Shadow edge
    wctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    wctx.fillRect(x, 0, 2, TS);
  }
  
  wallCanvas.refresh();
}

// ── Greenpath ─────────────────────────────────────────────────────────────
function _genGreenpathTiles() {
  const TS = C.TILE_SIZE;
  
  // Lush floor tiles (grass and vines)
  const floorCanvas = this.textures.createCanvas('tile_greenpath_floor', TS * 4, TS);
  const fctx = floorCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Organic base
    fctx.fillStyle = '#2a4a2a';
    fctx.fillRect(x, 0, TS, TS);
    
    // Grass tufts
    fctx.fillStyle = '#3a6a3a';
    for (let j = 0; j < 12; j++) {
      const gx = x + Math.random() * TS;
      const gy = Math.random() * TS;
      fctx.fillRect(gx, gy, 1, 3);
    }
    
    // Bright moss spots
    fctx.fillStyle = '#4a8a4a';
    for (let j = 0; j < 5; j++) {
      const mx = x + Math.random() * (TS - 3);
      const my = Math.random() * (TS - 3);
      fctx.fillRect(mx, my, 3, 2);
    }
    
    // Bioluminescent spots
    fctx.fillStyle = 'rgba(100, 200, 150, 0.4)';
    if (Math.random() > 0.6) {
      const bx = x + Math.random() * (TS - 4);
      const by = Math.random() * (TS - 4);
      fctx.fillRect(bx, by, 4, 4);
    }
  }
  
  floorCanvas.refresh();
  
  // Wall tiles (vines and roots)
  const wallCanvas = this.textures.createCanvas('tile_greenpath_wall', TS * 4, TS);
  const wctx = wallCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Dark organic wall
    wctx.fillStyle = '#1a3a1a';
    wctx.fillRect(x, 0, TS, TS);
    
    // Root texture
    wctx.strokeStyle = '#2a4a2a';
    wctx.lineWidth = 2;
    wctx.beginPath();
    wctx.moveTo(x, 0);
    wctx.quadraticCurveTo(x + TS / 2, TS / 2, x + TS, TS);
    wctx.stroke();
    
    // Vine tendrils
    wctx.strokeStyle = '#3a6a3a';
    wctx.lineWidth = 1;
    for (let j = 0; j < 2; j++) {
      wctx.beginPath();
      wctx.moveTo(x + Math.random() * TS, 0);
      wctx.lineTo(x + Math.random() * TS, TS);
      wctx.stroke();
    }
  }
  
  wallCanvas.refresh();
}

// ── Fungal Wastes ─────────────────────────────────────────────────────────
function _genFungalTiles() {
  const TS = C.TILE_SIZE;
  
  // Mushroom-covered floor
  const floorCanvas = this.textures.createCanvas('tile_fungal_floor', TS * 4, TS);
  const fctx = floorCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Purple-tinted base
    fctx.fillStyle = '#4a3a5a';
    fctx.fillRect(x, 0, TS, TS);
    
    // Fungal growth spots
    fctx.fillStyle = '#6a4a7a';
    for (let j = 0; j < 6; j++) {
      const fx = x + Math.random() * (TS - 4);
      const fy = Math.random() * (TS - 4);
      fctx.beginPath();
      fctx.arc(fx + 2, fy + 2, 3, 0, Math.PI * 2);
      fctx.fill();
    }
    
    // Spore particles
    fctx.fillStyle = 'rgba(150, 100, 180, 0.3)';
    for (let j = 0; j < 8; j++) {
      const sx = x + Math.random() * TS;
      const sy = Math.random() * TS;
      fctx.fillRect(sx, sy, 1, 1);
    }
    
    // Dark veins
    fctx.strokeStyle = '#2a1a3a';
    fctx.lineWidth = 1;
    for (let j = 0; j < 3; j++) {
      fctx.beginPath();
      fctx.moveTo(x + Math.random() * TS, 0);
      fctx.lineTo(x + Math.random() * TS, TS);
      fctx.stroke();
    }
  }
  
  floorCanvas.refresh();
  
  // Wall tiles (mushroom colonies)
  const wallCanvas = this.textures.createCanvas('tile_fungal_wall', TS * 4, TS);
  const wctx = wallCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Dark purple wall
    wctx.fillStyle = '#3a2a4a';
    wctx.fillRect(x, 0, TS, TS);
    
    // Large mushroom caps
    wctx.fillStyle = '#8a6a9a';
    for (let j = 0; j < 2; j++) {
      const mx = x + Math.random() * (TS - 6);
      const my = Math.random() * (TS - 6);
      wctx.beginPath();
      wctx.ellipse(mx + 3, my + 3, 4, 3, 0, 0, Math.PI * 2);
      wctx.fill();
    }
  }
  
  wallCanvas.refresh();
}

// ── City of Tears ─────────────────────────────────────────────────────────
function _genCityTiles() {
  const TS = C.TILE_SIZE;
  
  // Polished stone floor
  const floorCanvas = this.textures.createCanvas('tile_city_floor', TS * 4, TS);
  const fctx = floorCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Blue-tinted stone
    fctx.fillStyle = '#3a4a5a';
    fctx.fillRect(x, 0, TS, TS);
    
    // Tile grout lines
    fctx.strokeStyle = '#2a3a4a';
    fctx.lineWidth = 1;
    fctx.strokeRect(x, 0, TS, TS);
    
    // Water stains
    fctx.fillStyle = 'rgba(50, 100, 150, 0.2)';
    for (let j = 0; j < 4; j++) {
      const wx = x + Math.random() * (TS - 4);
      const wy = Math.random() * (TS - 4);
      fctx.fillRect(wx, wy, 4, 2);
    }
    
    // Shine
    fctx.fillStyle = 'rgba(150, 180, 200, 0.1)';
    fctx.fillRect(x, 0, TS, 3);
  }
  
  floorCanvas.refresh();
  
  // Wall tiles (carved stone)
  const wallCanvas = this.textures.createCanvas('tile_city_wall', TS * 4, TS);
  const wctx = wallCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Dark blue stone
    wctx.fillStyle = '#2a3a4a';
    wctx.fillRect(x, 0, TS, TS);
    
    // Carved patterns
    wctx.strokeStyle = '#3a4a5a';
    wctx.lineWidth = 1;
    wctx.beginPath();
    wctx.moveTo(x, TS / 3);
    wctx.lineTo(x + TS, TS / 3);
    wctx.moveTo(x, TS * 2 / 3);
    wctx.lineTo(x + TS, TS * 2 / 3);
    wctx.stroke();
    
    // Water drips
    wctx.fillStyle = 'rgba(90, 150, 200, 0.3)';
    for (let j = 0; j < 3; j++) {
      const dx = x + Math.random() * TS;
      wctx.fillRect(dx, Math.random() * TS, 1, 2);
    }
  }
  
  wallCanvas.refresh();
}

// ── Crystal Peak ──────────────────────────────────────────────────────────
function _genCrystalTiles() {
  const TS = C.TILE_SIZE;
  
  // Crystal-embedded floor
  const floorCanvas = this.textures.createCanvas('tile_crystal_floor', TS * 4, TS);
  const fctx = floorCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Rocky base
    fctx.fillStyle = '#5a5a6a';
    fctx.fillRect(x, 0, TS, TS);
    
    // Crystal shards
    fctx.fillStyle = '#aae8ff';
    for (let j = 0; j < 3; j++) {
      const cx = x + Math.random() * (TS - 4);
      const cy = Math.random() * (TS - 6);
      fctx.beginPath();
      fctx.moveTo(cx + 2, cy);
      fctx.lineTo(cx + 4, cy + 3);
      fctx.lineTo(cx + 2, cy + 6);
      fctx.lineTo(cx, cy + 3);
      fctx.closePath();
      fctx.fill();
    }
    
    // Crystal glow
    fctx.fillStyle = 'rgba(170, 232, 255, 0.2)';
    for (let j = 0; j < 3; j++) {
      const gx = x + Math.random() * TS;
      const gy = Math.random() * TS;
      fctx.beginPath();
      fctx.arc(gx, gy, 4, 0, Math.PI * 2);
      fctx.fill();
    }
  }
  
  floorCanvas.refresh();
  
  // Wall tiles (crystal veins)
  const wallCanvas = this.textures.createCanvas('tile_crystal_wall', TS * 4, TS);
  const wctx = wallCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Dark rock
    wctx.fillStyle = '#3a3a4a';
    wctx.fillRect(x, 0, TS, TS);
    
    // Crystal veins
    wctx.strokeStyle = '#88c0dd';
    wctx.lineWidth = 2;
    wctx.beginPath();
    wctx.moveTo(x, 0);
    wctx.lineTo(x + TS / 2, TS / 2);
    wctx.lineTo(x + TS, TS);
    wctx.stroke();
    
    // Glow along veins
    wctx.strokeStyle = 'rgba(170, 232, 255, 0.3)';
    wctx.lineWidth = 4;
    wctx.stroke();
  }
  
  wallCanvas.refresh();
}

// ── Ancient Basin ─────────────────────────────────────────────────────────
function _genBasinTiles() {
  const TS = C.TILE_SIZE;
  
  // Ancient floor
  const floorCanvas = this.textures.createCanvas('tile_basin_floor', TS * 4, TS);
  const fctx = floorCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Deep blue-black stone
    fctx.fillStyle = '#1a1a2a';
    fctx.fillRect(x, 0, TS, TS);
    
    // Ancient runes
    fctx.fillStyle = 'rgba(80, 80, 100, 0.4)';
    for (let j = 0; j < 2; j++) {
      const rx = x + Math.random() * (TS - 6);
      const ry = Math.random() * (TS - 4);
      fctx.fillRect(rx, ry, 6, 1);
      fctx.fillRect(rx + 2, ry, 2, 4);
    }
    
    // Age cracks
    fctx.strokeStyle = '#0a0a15';
    fctx.lineWidth = 1;
    for (let j = 0; j < 2; j++) {
      fctx.beginPath();
      fctx.moveTo(x + Math.random() * TS, 0);
      fctx.lineTo(x + Math.random() * TS, TS);
      fctx.stroke();
    }
  }
  
  floorCanvas.refresh();
  
  // Wall tiles
  const wallCanvas = this.textures.createCanvas('tile_basin_wall', TS * 4, TS);
  const wctx = wallCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Darker stone
    wctx.fillStyle = '#0a0a15';
    wctx.fillRect(x, 0, TS, TS);
    
    // Depth gradient
    const grad = wctx.createLinearGradient(x, 0, x + TS, TS);
    grad.addColorStop(0, 'rgba(30, 30, 50, 0.3)');
    grad.addColorStop(1, 'rgba(10, 10, 20, 0)');
    wctx.fillStyle = grad;
    wctx.fillRect(x, 0, TS, TS);
  }
  
  wallCanvas.refresh();
}

// ── The Abyss ─────────────────────────────────────────────────────────────
function _genAbyssTiles() {
  const TS = C.TILE_SIZE;
  
  // Void-touched floor
  const floorCanvas = this.textures.createCanvas('tile_abyss_floor', TS * 4, TS);
  const fctx = floorCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Pure black with void particles
    fctx.fillStyle = '#000000';
    fctx.fillRect(x, 0, TS, TS);
    
    // Void particles
    fctx.fillStyle = 'rgba(20, 20, 30, 0.6)';
    for (let j = 0; j < 10; j++) {
      const vx = x + Math.random() * TS;
      const vy = Math.random() * TS;
      fctx.fillRect(vx, vy, 1, 1);
    }
    
    // Subtle edge glow
    fctx.fillStyle = 'rgba(50, 50, 80, 0.1)';
    fctx.fillRect(x, 0, TS, 2);
    fctx.fillRect(x, TS - 2, TS, 2);
  }
  
  floorCanvas.refresh();
  
  // Wall tiles (complete darkness)
  const wallCanvas = this.textures.createCanvas('tile_abyss_wall', TS * 4, TS);
  const wctx = wallCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Pure void
    wctx.fillStyle = '#000000';
    wctx.fillRect(x, 0, TS, TS);
    
    // Barely visible texture
    wctx.fillStyle = 'rgba(10, 10, 20, 0.3)';
    for (let j = 0; j < 5; j++) {
      wctx.fillRect(x + Math.random() * TS, Math.random() * TS, 2, 2);
    }
  }
  
  wallCanvas.refresh();
}

// ── Fog Canyon ────────────────────────────────────────────────────────────
function _genFogCanyonTiles() {
  const TS = C.TILE_SIZE;
  
  // Misty floor
  const floorCanvas = this.textures.createCanvas('tile_fog_floor', TS * 4, TS);
  const fctx = floorCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Pale stone
    fctx.fillStyle = '#6a7a8a';
    fctx.fillRect(x, 0, TS, TS);
    
    // Fog wisps
    fctx.fillStyle = 'rgba(200, 210, 220, 0.3)';
    for (let j = 0; j < 4; j++) {
      const fx = x + Math.random() * TS;
      const fy = Math.random() * TS;
      fctx.beginPath();
      fctx.arc(fx, fy, 3, 0, Math.PI * 2);
      fctx.fill();
    }
    
    // Ethereal glow
    fctx.fillStyle = 'rgba(150, 170, 200, 0.2)';
    fctx.fillRect(x, TS / 2 - 2, TS, 4);
  }
  
  floorCanvas.refresh();
  
  // Wall tiles (misty)
  const wallCanvas = this.textures.createCanvas('tile_fog_wall', TS * 4, TS);
  const wctx = wallCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Pale wall
    wctx.fillStyle = '#5a6a7a';
    wctx.fillRect(x, 0, TS, TS);
    
    // Mist layers
    const grad = wctx.createLinearGradient(x, 0, x, TS);
    grad.addColorStop(0, 'rgba(200, 210, 220, 0.4)');
    grad.addColorStop(0.5, 'rgba(200, 210, 220, 0)');
    grad.addColorStop(1, 'rgba(200, 210, 220, 0.4)');
    wctx.fillStyle = grad;
    wctx.fillRect(x, 0, TS, TS);
  }
  
  wallCanvas.refresh();
}

// ── Queen's Gardens ───────────────────────────────────────────────────────
function _genGardensTiles() {
  const TS = C.TILE_SIZE;
  
  // Overgrown royal floor
  const floorCanvas = this.textures.createCanvas('tile_gardens_floor', TS * 4, TS);
  const fctx = floorCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Rich green
    fctx.fillStyle = '#2a5a3a';
    fctx.fillRect(x, 0, TS, TS);
    
    // Flowers
    const colors = ['#ff88cc', '#ffaa88', '#88ffaa'];
    for (let j = 0; j < 3; j++) {
      fctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      const fx = x + Math.random() * (TS - 3);
      const fy = Math.random() * (TS - 3);
      fctx.beginPath();
      fctx.arc(fx + 1.5, fy + 1.5, 2, 0, Math.PI * 2);
      fctx.fill();
    }
    
    // Thick vegetation
    fctx.fillStyle = '#3a7a4a';
    for (let j = 0; j < 15; j++) {
      const vx = x + Math.random() * TS;
      const vy = Math.random() * TS;
      fctx.fillRect(vx, vy, 1, 4);
    }
  }
  
  floorCanvas.refresh();
  
  // Wall tiles (royal vines)
  const wallCanvas = this.textures.createCanvas('tile_gardens_wall', TS * 4, TS);
  const wctx = wallCanvas.context;
  
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    
    // Stone base
    wctx.fillStyle = '#4a5a4a';
    wctx.fillRect(x, 0, TS, TS);
    
    // Ornate vines
    wctx.strokeStyle = '#2a5a3a';
    wctx.lineWidth = 3;
    wctx.beginPath();
    wctx.moveTo(x, 0);
    wctx.quadraticCurveTo(x + TS / 2, TS / 3, x, TS * 2 / 3);
    wctx.quadraticCurveTo(x + TS / 2, TS, x + TS, TS);
    wctx.stroke();
    
    // Vine highlights
    wctx.strokeStyle = '#4a8a5a';
    wctx.lineWidth = 1;
    wctx.stroke();
  }
  
  wallCanvas.refresh();
}

// ══════════════════════════════════════════════════════════════════════════
// INTEGRATION NOTES
// ══════════════════════════════════════════════════════════════════════════

/*
TO USE THESE TILESETS:

1. Replace _genTiles() in PreloadScene.js with _genTiles_ENHANCED()
2. Add all tileset generation functions
3. Update room definitions to use area-specific tiles:
   
   In mapData.js/mapData_p3.js:
   - Crossroads: tilemap: 'tile_crossroads'
   - Greenpath:  tilemap: 'tile_greenpath'
   - Fungal:     tilemap: 'tile_fungal'
   - City:       tilemap: 'tile_city'
   - Crystal:    tilemap: 'tile_crystal'
   - Basin:      tilemap: 'tile_basin'
   - Abyss:      tilemap: 'tile_abyss'
   - Fog Canyon: tilemap: 'tile_fog'
   - Gardens:    tilemap: 'tile_gardens'

FEATURES:
- Each area has unique floor + wall tiles
- Area-specific color palettes
- Environmental details (moss, cracks, crystals, etc.)
- 4 variants per tile type for visual variety
- Atmospheric elements (glows, mist, particles)
*/
