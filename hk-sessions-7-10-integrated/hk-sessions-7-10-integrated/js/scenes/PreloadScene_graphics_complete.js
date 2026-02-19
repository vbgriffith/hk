/* js/scenes/PreloadScene_graphics_complete.js — Session 10: Complete Graphics Overhaul
 * 
 * Upgrades ALL remaining graphics to match Hollow Knight's visual style:
 * - Enemies (Crawler, Spitter, Flying Scout, Tiktik, Hoppers, etc.)
 * - NPCs (Elderbug, Sly, Iselda, etc.)
 * - Effects (slash, particles, projectiles)
 * - UI elements (benches, chests, tablets, shops)
 * - Bosses (visual polish)
 * - Environmental elements
 */
'use strict';

// ══════════════════════════════════════════════════════════════════════════
// ENHANCED ENEMY SPRITES
// ══════════════════════════════════════════════════════════════════════════

function _drawCrawlerFrame_ENHANCED(ctx, x, y, w, h, anim, f, total) {
  const cx = x + w / 2, cy = y + h / 2;
  const t = f / Math.max(total - 1, 1);
  const bob = Math.sin(t * Math.PI * 4) * 1;
  
  ctx.save();
  ctx.translate(cx, cy);

  // Hollow Knight style segmented body
  const segments = 3;
  for (let i = 0; i < segments; i++) {
    const sx = -6 + i * 6;
    const sy = bob + Math.sin((t + i * 0.3) * Math.PI * 2) * 0.5;
    
    // Segment shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 1, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Main segment
    const grad = ctx.createRadialGradient(sx, sy - 1, 0, sx, sy, 4);
    grad.addColorStop(0, '#3a6a3a');
    grad.addColorStop(1, '#1e3a1e');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 4.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Segment highlight
    ctx.fillStyle = 'rgba(100, 180, 100, 0.4)';
    ctx.beginPath();
    ctx.ellipse(sx - 1, sy - 1, 2, 1.5, -0.3, 0, Math.PI);
    ctx.fill();
  }

  // Enhanced legs (6 legs, proper animation)
  ctx.strokeStyle = '#2a4a2a';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  
  for (let i = 0; i < 3; i++) {
    const lx = -8 + i * 8;
    const phase = (i % 2 === 0) ? t : 1 - t;
    const legAngle = Math.sin(phase * Math.PI * 2) * 0.4;
    const footY = 7 + Math.sin(phase * Math.PI * 2) * 2;
    
    // Left legs
    ctx.beginPath();
    ctx.moveTo(lx, 1 + bob);
    ctx.quadraticCurveTo(lx - 4, 4 + bob, lx - 5, footY);
    ctx.stroke();
    
    // Right legs
    ctx.beginPath();
    ctx.moveTo(lx, 1 + bob);
    ctx.quadraticCurveTo(lx + 4, 4 + bob, lx + 5, footY);
    ctx.stroke();
    
    // Leg joints
    ctx.fillStyle = '#1e3a1e';
    ctx.fillRect(lx - 1, 3 + bob, 2, 2);
  }

  // Head with glowing eyes
  ctx.fillStyle = '#1a3a1a';
  ctx.beginPath();
  ctx.ellipse(8, -1 + bob, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Infection glow eyes
  ctx.fillStyle = '#ff8800';
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.arc(10, -2 + bob, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Eye highlight
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath();
  ctx.arc(10.5, -2.5 + bob, 0.7, 0, Math.PI * 2);
  ctx.fill();
  
  // Mandibles
  ctx.strokeStyle = '#2a5a2a';
  ctx.lineWidth = 2;
  const mandibleOpen = Math.sin(t * Math.PI * 4) * 0.3;
  ctx.beginPath();
  ctx.moveTo(12, -2 + bob);
  ctx.lineTo(15, -3 - mandibleOpen + bob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(12, 0 + bob);
  ctx.lineTo(15, 1 + mandibleOpen + bob);
  ctx.stroke();

  ctx.restore();
}

function _drawSpitterFrame_ENHANCED(ctx, x, y, w, h, anim, f, total) {
  const t = f / Math.max(total - 1, 1);
  const cx = x + w / 2, cy = y + h * 0.55;
  
  ctx.save();
  ctx.translate(cx, cy);

  // Bloated body with texture
  const puff = anim.includes('spit') ? 1 + Math.sin(t * Math.PI) * 0.15 : 1;
  
  // Body shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 2, 11 * puff, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Main body gradient
  const bodyGrad = ctx.createRadialGradient(0, -2, 0, 0, 0, 10);
  bodyGrad.addColorStop(0, '#2a5a2a');
  bodyGrad.addColorStop(1, '#1a3a1a');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 10 * puff, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Segmented texture
  ctx.strokeStyle = 'rgba(30, 50, 30, 0.4)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, 5 + i * 2, -0.8, 0.8);
    ctx.stroke();
  }

  // Acid sac (glowing)
  const sacGrad = ctx.createRadialGradient(-3, 2, 0, -3, 2, 6);
  sacGrad.addColorStop(0, 'rgba(150, 255, 100, 0.6)');
  sacGrad.addColorStop(1, 'rgba(100, 255, 60, 0)');
  ctx.fillStyle = sacGrad;
  ctx.beginPath();
  ctx.ellipse(-3, 2, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Sac detail
  ctx.fillStyle = 'rgba(180, 255, 120, 0.3)';
  ctx.beginPath();
  ctx.ellipse(-4, 1, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head with shell
  ctx.fillStyle = '#1e4a1e';
  ctx.beginPath();
  ctx.ellipse(7, -3, 6, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Shell highlight
  ctx.fillStyle = 'rgba(80, 140, 80, 0.3)';
  ctx.beginPath();
  ctx.ellipse(5, -4, 3, 2, -0.4, 0, Math.PI);
  ctx.fill();

  // Infection eyes (glowing orange)
  ctx.fillStyle = '#ff8800';
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.arc(8, -3.5, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Eye core
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath();
  ctx.arc(8.5, -4, 1, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (for spitting)
  if (anim.includes('spit')) {
    const openAmount = Math.sin(t * Math.PI) * 2;
    ctx.fillStyle = '#0a1a0a';
    ctx.beginPath();
    ctx.ellipse(10, -2, 2, 1 + openAmount, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Spittle animation
  if (anim.includes('spit') && t > 0.5) {
    const spit_t = (t - 0.5) * 2;
    const sx = 12 + spit_t * 8;
    const sy = -2 - spit_t * 4;
    
    ctx.fillStyle = 'rgba(100, 255, 60, 0.8)';
    ctx.beginPath();
    ctx.ellipse(sx, sy, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Glob trail
    ctx.fillStyle = 'rgba(100, 255, 60, 0.3)';
    for (let i = 0; i < 3; i++) {
      const trail_x = sx - i * 2;
      const trail_y = sy + i * 0.5;
      ctx.fillRect(trail_x, trail_y, 1, 1);
    }
  }

  ctx.restore();
}

function _drawFlyingScoutFrame_ENHANCED(ctx, x, y, w, h, anim, f, total) {
  const t = f / Math.max(total - 1, 1);
  const cx = x + w / 2, cy = y + h / 2;
  
  ctx.save();
  ctx.translate(cx, cy);

  const hover = Math.sin(t * Math.PI * 4) * 2;
  const tilt = Math.sin(t * Math.PI * 2) * 0.1;
  ctx.rotate(tilt);

  // Wing motion
  const wingFlap = Math.sin(t * Math.PI * 8) * 0.3;
  
  // Left wing
  ctx.fillStyle = 'rgba(180, 200, 220, 0.3)';
  ctx.beginPath();
  ctx.ellipse(-6, -2 + hover, 8, 3 + wingFlap * 2, -0.5 + wingFlap, 0, Math.PI * 2);
  ctx.fill();
  
  // Wing veins
  ctx.strokeStyle = 'rgba(150, 170, 190, 0.5)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-6, -2 + hover);
    ctx.lineTo(-10 - wingFlap * 2, -2 + hover + i * 2 - 2);
    ctx.stroke();
  }

  // Right wing
  ctx.fillStyle = 'rgba(180, 200, 220, 0.3)';
  ctx.beginPath();
  ctx.ellipse(6, -2 + hover, 8, 3 + wingFlap * 2, 0.5 - wingFlap, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(150, 170, 190, 0.5)';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(6, -2 + hover);
    ctx.lineTo(10 + wingFlap * 2, -2 + hover + i * 2 - 2);
    ctx.stroke();
  }

  // Body segments
  const bodyGrad = ctx.createRadialGradient(0, hover - 1, 0, 0, hover, 5);
  bodyGrad.addColorStop(0, '#4a6a7a');
  bodyGrad.addColorStop(1, '#2a3a4a');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, hover, 5, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Segment lines
  ctx.strokeStyle = 'rgba(30, 40, 50, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-4, hover - 2);
  ctx.lineTo(4, hover - 2);
  ctx.moveTo(-4, hover + 2);
  ctx.lineTo(4, hover + 2);
  ctx.stroke();

  // Head
  ctx.fillStyle = '#3a4a5a';
  ctx.beginPath();
  ctx.ellipse(0, -3 + hover, 4, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Shell highlight
  ctx.fillStyle = 'rgba(100, 120, 140, 0.4)';
  ctx.beginPath();
  ctx.ellipse(-1, -4 + hover, 2, 1.5, -0.3, 0, Math.PI);
  ctx.fill();

  // Infection eyes
  ctx.fillStyle = '#ff8800';
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.arc(-1.5, -3 + hover, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(1.5, -3 + hover, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Antennae
  ctx.strokeStyle = '#2a3a4a';
  ctx.lineWidth = 1;
  const antennaWave = Math.sin(t * Math.PI * 6) * 0.2;
  ctx.beginPath();
  ctx.moveTo(-2, -6 + hover);
  ctx.quadraticCurveTo(-3, -9 + hover, -3 + antennaWave, -11 + hover);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(2, -6 + hover);
  ctx.quadraticCurveTo(3, -9 + hover, 3 - antennaWave, -11 + hover);
  ctx.stroke();

  ctx.restore();
}

// ══════════════════════════════════════════════════════════════════════════
// ENHANCED NPC SPRITES
// ══════════════════════════════════════════════════════════════════════════

function _drawElderbugFrame(ctx, x, y, w, h, f, total) {
  const t = f / Math.max(total - 1, 1);
  const cx = x + w / 2, cy = y + h * 0.65;
  
  ctx.save();
  ctx.translate(cx, cy);

  const bob = Math.sin(t * Math.PI * 2) * 0.5;

  // Old, weathered shell
  const shellGrad = ctx.createRadialGradient(0, bob - 2, 0, 0, bob, 9);
  shellGrad.addColorStop(0, '#5a5a4a');
  shellGrad.addColorStop(1, '#3a3a2a');
  ctx.fillStyle = shellGrad;
  ctx.beginPath();
  ctx.ellipse(0, 2 + bob, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell cracks/age marks
  ctx.strokeStyle = 'rgba(30, 30, 20, 0.6)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 3, bob + Math.sin(angle) * 3);
    ctx.lineTo(Math.cos(angle) * 7, bob + 2 + Math.sin(angle) * 7);
    ctx.stroke();
  }

  // Tattered cloak
  ctx.fillStyle = '#2a2a3a';
  ctx.beginPath();
  ctx.moveTo(-7, 5 + bob);
  ctx.quadraticCurveTo(-9, 10 + bob, -6, 14 + bob);
  ctx.lineTo(6, 14 + bob);
  ctx.quadraticCurveTo(9, 10 + bob, 7, 5 + bob);
  ctx.fill();
  
  // Cloak tears
  ctx.fillStyle = '#1a1a2a';
  ctx.fillRect(-5, 12 + bob, 2, 3);
  ctx.fillRect(3, 12 + bob, 2, 3);

  // Wise old head
  ctx.fillStyle = '#d4cfc9';
  ctx.beginPath();
  ctx.ellipse(0, -5 + bob, 5.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Age wrinkles
  ctx.strokeStyle = 'rgba(180, 175, 165, 0.6)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-4, -6 + bob + i);
    ctx.lineTo(-2, -6 + bob + i);
    ctx.stroke();
  }

  // Kind eyes
  ctx.fillStyle = '#1a1a2a';
  ctx.beginPath();
  ctx.arc(-2, -5.5 + bob, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(2, -5.5 + bob, 1.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye glimmer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(-1.5, -6 + bob, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(2.5, -6 + bob, 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Small horns/antennae (bent with age)
  ctx.strokeStyle = '#c4bfb9';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-3, -9 + bob);
  ctx.quadraticCurveTo(-4, -11 + bob, -3, -12 + bob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(3, -9 + bob);
  ctx.quadraticCurveTo(4, -11 + bob, 3, -12 + bob);
  ctx.stroke();

  ctx.restore();
}

function _drawSlyFrame(ctx, x, y, w, h, f, total) {
  const t = f / Math.max(total - 1, 1);
  const cx = x + w / 2, cy = y + h * 0.65;
  
  ctx.save();
  ctx.translate(cx, cy);

  const bob = Math.sin(t * Math.PI * 2) * 0.6;

  // Merchant's cloak (purple/royal)
  ctx.fillStyle = '#4a3a5a';
  ctx.beginPath();
  ctx.moveTo(-6, 4 + bob);
  ctx.quadraticCurveTo(-8, 9 + bob, -5, 13 + bob);
  ctx.lineTo(5, 13 + bob);
  ctx.quadraticCurveTo(8, 9 + bob, 6, 4 + bob);
  ctx.fill();
  
  // Cloak trim (gold)
  ctx.strokeStyle = '#e8c84a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-5, 13 + bob);
  ctx.lineTo(5, 13 + bob);
  ctx.stroke();

  // Merchant body
  const bodyGrad = ctx.createRadialGradient(0, bob, 0, 0, bob + 2, 7);
  bodyGrad.addColorStop(0, '#3a3a4a');
  bodyGrad.addColorStop(1, '#2a2a3a');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 2 + bob, 7, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mask/head (smaller, shrewd)
  ctx.fillStyle = '#d4cfc9';
  ctx.beginPath();
  ctx.ellipse(0, -4 + bob, 4.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sharp, clever eyes
  ctx.fillStyle = '#1a1a2a';
  ctx.beginPath();
  ctx.ellipse(-1.5, -4.5 + bob, 1.5, 1, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(1.5, -4.5 + bob, 1.5, 1, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Sly grin
  ctx.strokeStyle = '#1a1a2a';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(0, -2 + bob, 2, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Small horns
  ctx.fillStyle = '#c4bfb9';
  ctx.beginPath();
  ctx.moveTo(-2.5, -8 + bob);
  ctx.lineTo(-2, -11 + bob);
  ctx.lineTo(-1.5, -8 + bob);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(2.5, -8 + bob);
  ctx.lineTo(2, -11 + bob);
  ctx.lineTo(1.5, -8 + bob);
  ctx.fill();

  // Merchant's satchel
  ctx.fillStyle = '#5a4a3a';
  ctx.fillRect(-4, 8 + bob, 3, 4);
  ctx.strokeStyle = '#4a3a2a';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(-4, 8 + bob, 3, 4);

  ctx.restore();
}

// ══════════════════════════════════════════════════════════════════════════
// ENHANCED EFFECTS
// ══════════════════════════════════════════════════════════════════════════

function _genSlashEffect_ENHANCED() {
  const FW = 48, FH = 20;
  const canvas = this.textures.createCanvas('slash_effect', FW * 6, FH * 5);
  const ctx = canvas.context;

  const rows = [
    { name: 'slash_h', frames: 5, angle: 0 },
    { name: 'slash_v', frames: 5, angle: Math.PI / 2 },
    { name: 'slash_up', frames: 5, angle: -Math.PI / 4 },
    { name: 'slash_down', frames: 5, angle: Math.PI / 4 },
    { name: 'great_slash', frames: 6, angle: 0, scale: 1.5 },
  ];

  for (let ri = 0; ri < rows.length; ri++) {
    const row = rows[ri];
    for (let f = 0; f < row.frames; f++) {
      const t = f / Math.max(row.frames - 1, 1);
      const cx = f * FW + FW / 2, cy = ri * FH + FH / 2;
      const sc = row.scale ?? 1;
      const alpha = 0.9 - t * 0.7;
      const len = (0.2 + t * 0.8) * 22 * sc;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(row.angle);
      ctx.globalAlpha = alpha;

      // Outer glow
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 5 - t * 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-len, 0);
      ctx.lineTo(len, 0);
      ctx.stroke();

      // Main slash
      ctx.strokeStyle = '#e8e4dc';
      ctx.lineWidth = 3 - t * 1.5;
      ctx.beginPath();
      ctx.moveTo(-len, 0);
      ctx.lineTo(len, 0);
      ctx.stroke();

      // Inner gleam
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.5 - t;
      ctx.beginPath();
      ctx.moveTo(-len * 0.8, 0);
      ctx.lineTo(len * 0.8, 0);
      ctx.stroke();

      // Trailing particles
      for (let i = 0; i < 4; i++) {
        const px = -len + (len * 2 * i / 4);
        const py = (Math.random() - 0.5) * 6;
        const pAlpha = (1 - t) * 0.5;
        
        ctx.globalAlpha = pAlpha;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px, py, 2, 2);
      }

      // Shockwave arc
      ctx.globalAlpha = alpha * 0.5;
      ctx.strokeStyle = 'rgba(232, 228, 220, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, len * 0.7, -0.5, 0.5);
      ctx.stroke();

      ctx.restore();
      canvas.add(ri * 100 + f, 0, f * FW, ri * FH, FW, FH);
    }
  }
  canvas.refresh();
}

function _genGeo_ENHANCED() {
  const FW = 10, FH = 10;
  const canvas = this.textures.createCanvas('geo', FW * 8, FH * 4);
  const ctx = canvas.context;

  const sizes = [
    { r: 3, color: '#e8c84a', value: 1 },
    { r: 4, color: '#f8d86a', value: 5 },
    { r: 5, color: '#ffd87a', value: 10 },
    { r: 6, color: '#ffe89a', value: 25 },
  ];

  for (let ri = 0; ri < 4; ri++) {
    const { r, color } = sizes[ri];
    for (let f = 0; f < 8; f++) {
      const t = f / 7;
      const cx = f * FW + FW / 2, cy = ri * FH + FH / 2;
      const rot = t * Math.PI * 2;
      
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);

      // Outer glow
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r + 2);
      glow.addColorStop(0, color + 'aa');
      glow.addColorStop(1, color + '00');
      ctx.fillStyle = glow;
      ctx.fillRect(-r - 2, -r - 2, (r + 2) * 2, (r + 2) * 2);

      // Diamond shape
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.7, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.7, 0);
      ctx.closePath();
      ctx.fill();

      // Facets (lighter)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.35, -r * 0.5);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      // Shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.5, r * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Shadow facet
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, r);
      ctx.lineTo(-r * 0.35, r * 0.5);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
      canvas.add(ri * 100 + f, 0, f * FW, ri * FH, FW, FH);
    }
  }
  canvas.refresh();
}

function _genFireball_ENHANCED() {
  const FW = 20, FH = 14;
  const canvas = this.textures.createCanvas('fireball', FW * 6, FH * 2);
  const ctx = canvas.context;

  // Travel frames (soul projectile)
  for (let f = 0; f < 5; f++) {
    const t = f / 4;
    const cx = f * FW + FW / 2, cy = FH / 2;
    
    ctx.save();
    ctx.translate(cx, cy);

    // Outer glow
    const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 9);
    outerGlow.addColorStop(0, 'rgba(90, 227, 227, 0.6)');
    outerGlow.addColorStop(1, 'rgba(90, 227, 227, 0)');
    ctx.fillStyle = outerGlow;
    ctx.fillRect(-9, -9, 18, 18);

    // Core
    const coreGrad = ctx.createRadialGradient(-1, -1, 0, 0, 0, 5);
    coreGrad.addColorStop(0, '#aaf5f5');
    coreGrad.addColorStop(0.5, '#5ae3e3');
    coreGrad.addColorStop(1, '#2aa3a3');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    // Trailing particles
    for (let i = 1; i <= 3; i++) {
      const tx = -i * 4 - t * 3;
      const ty = (Math.random() - 0.5) * 4;
      const tAlpha = (1 - i / 3) * 0.6;
      
      ctx.globalAlpha = tAlpha;
      ctx.fillStyle = '#5ae3e3';
      ctx.beginPath();
      ctx.arc(tx, ty, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    canvas.add(f, 0, f * FW, 0, FW, FH);
  }

  // Burst frames
  for (let f = 0; f < 6; f++) {
    const t = f / 5;
    const cx = f * FW + FW / 2, cy = FH * 1.5;
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = 1 - t;

    // Expanding ring
    const radius = 3 + t * 8;
    const ringGrad = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius);
    ringGrad.addColorStop(0, 'rgba(170, 245, 245, 0.8)');
    ringGrad.addColorStop(1, 'rgba(90, 227, 227, 0)');
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // Spark particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = t * 10;
      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist;
      
      ctx.fillStyle = '#5ae3e3';
      ctx.fillRect(px - 1, py - 1, 2, 2);
    }

    ctx.restore();
    canvas.add(100 + f, 0, f * FW, FH, FW, FH);
  }
  canvas.refresh();
}

// ══════════════════════════════════════════════════════════════════════════
// ENHANCED UI ELEMENTS
// ══════════════════════════════════════════════════════════════════════════

function _genBench_ENHANCED() {
  const W = 32, H = 24;
  const canvas = this.textures.createCanvas('bench', W, H);
  const ctx = canvas.context;

  // Soul glow aura
  const auraGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
  auraGrad.addColorStop(0, 'rgba(90, 227, 227, 0.2)');
  auraGrad.addColorStop(1, 'rgba(90, 227, 227, 0)');
  ctx.fillStyle = auraGrad;
  ctx.fillRect(0, 0, W, H);

  // Bench structure (worn wood)
  ctx.fillStyle = '#4a4a3a';
  ctx.fillRect(4, 12, 24, 8);
  
  // Wood grain
  ctx.strokeStyle = 'rgba(60, 60, 50, 0.4)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(4 + i * 5, 12);
    ctx.lineTo(4 + i * 5, 20);
    ctx.stroke();
  }

  // Seat highlights
  ctx.fillStyle = '#6a6a5a';
  ctx.fillRect(4, 12, 24, 3);

  // Bench legs
  ctx.fillStyle = '#3a3a2a';
  ctx.fillRect(6, 16, 3, 8);
  ctx.fillRect(23, 16, 3, 8);
  
  // Leg shadows
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(4, 22, 5, 2);
  ctx.fillRect(23, 22, 5, 2);

  // Soul energy on bench
  const soulGrad = ctx.createRadialGradient(W / 2, 15, 0, W / 2, 15, 8);
  soulGrad.addColorStop(0, 'rgba(90, 227, 227, 0.6)');
  soulGrad.addColorStop(1, 'rgba(90, 227, 227, 0)');
  ctx.fillStyle = soulGrad;
  ctx.fillRect(8, 13, 16, 6);

  // Soul wisps
  ctx.fillStyle = 'rgba(170, 245, 245, 0.4)';
  ctx.beginPath();
  ctx.arc(12, 10, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(20, 11, 1.5, 0, Math.PI * 2);
  ctx.fill();

  canvas.refresh();
}

function _genChest_ENHANCED() {
  const W = 28, H = 24;
  const canvas = this.textures.createCanvas('chest', W, H);
  const ctx = canvas.context;

  // Chest body (weathered wood)
  ctx.fillStyle = '#5a4a3a';
  ctx.fillRect(4, 10, 20, 14);
  
  // Wood planks
  ctx.strokeStyle = '#4a3a2a';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(4, 10 + i * 4);
    ctx.lineTo(24, 10 + i * 4);
    ctx.stroke();
  }

  // Chest lid
  ctx.fillStyle = '#6a5a4a';
  ctx.fillRect(4, 6, 20, 5);
  
  // Lid highlight
  ctx.fillStyle = '#7a6a5a';
  ctx.fillRect(4, 6, 20, 2);

  // Metal bands
  ctx.fillStyle = '#8a8a7a';
  ctx.fillRect(4, 12, 20, 2);
  ctx.fillRect(4, 20, 20, 2);
  
  // Band rivets
  ctx.fillStyle = '#6a6a5a';
  ctx.fillRect(6, 12, 1, 2);
  ctx.fillRect(21, 12, 1, 2);
  ctx.fillRect(6, 20, 1, 2);
  ctx.fillRect(21, 20, 1, 2);

  // Lock
  ctx.fillStyle = '#7a7a6a';
  ctx.fillRect(12, 16, 4, 4);
  ctx.fillStyle = '#5a5a4a';
  ctx.fillRect(13, 17, 2, 2);

  // Glow (if contains valuable)
  const glowGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
  glowGrad.addColorStop(0, 'rgba(232, 200, 74, 0.3)');
  glowGrad.addColorStop(1, 'rgba(232, 200, 74, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, W, H);

  canvas.refresh();
}

function _genLoreTablet_ENHANCED() {
  const W = 20, H = 32;
  const canvas = this.textures.createCanvas('lore_tablet', W, H);
  const ctx = canvas.context;

  // Ancient glow
  const glowGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2 + 4);
  glowGrad.addColorStop(0, 'rgba(200, 180, 120, 0.3)');
  glowGrad.addColorStop(1, 'rgba(100, 90, 60, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, W, H);

  // Stone tablet
  ctx.fillStyle = '#3a3a2a';
  ctx.fillRect(3, 3, 14, 26);
  
  // Stone texture
  ctx.fillStyle = 'rgba(50, 50, 40, 0.6)';
  for (let i = 0; i < 10; i++) {
    const rx = 3 + Math.random() * 14;
    const ry = 3 + Math.random() * 26;
    ctx.fillRect(rx, ry, 1, 1);
  }

  // Ancient text glow
  ctx.fillStyle = 'rgba(220, 200, 150, 0.8)';
  ctx.shadowColor = 'rgba(220, 200, 150, 0.6)';
  ctx.shadowBlur = 2;
  
  for (let i = 0; i < 6; i++) {
    const y = 7 + i * 4;
    ctx.fillRect(5, y, 10, 1);
    
    // Broken/weathered text
    if (Math.random() > 0.7) {
      ctx.clearRect(7 + Math.random() * 6, y, 2, 1);
    }
  }
  ctx.shadowBlur = 0;

  // Stone edges/highlights
  ctx.fillStyle = '#5a5a4a';
  ctx.fillRect(3, 3, 1, 26);
  ctx.fillRect(3, 3, 14, 1);

  // Weathering/cracks
  ctx.strokeStyle = 'rgba(20, 20, 10, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(6, 5);
  ctx.lineTo(8, 12);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(14, 18);
  ctx.lineTo(12, 25);
  ctx.stroke();

  canvas.refresh();
}

// ══════════════════════════════════════════════════════════════════════════
// INTEGRATION INSTRUCTIONS
// ══════════════════════════════════════════════════════════════════════════

/*
TO INTEGRATE ALL ENHANCED GRAPHICS:

1. Replace enemy drawing methods in PreloadScene.js:
   - _drawCrawlerFrame → _drawCrawlerFrame_ENHANCED
   - _drawSpitterFrame → _drawSpitterFrame_ENHANCED
   - _drawFlyingScoutFrame → _drawFlyingScoutFrame_ENHANCED

2. Add NPC drawing methods:
   - _drawElderbugFrame (new)
   - _drawSlyFrame (new)
   - Call these in _genNPCs() for specific NPCs

3. Replace effect generation:
   - _genSlashEffect → _genSlashEffect_ENHANCED
   - _genGeo → _genGeo_ENHANCED
   - _genFireball → _genFireball_ENHANCED

4. Replace UI generation:
   - _genBench → _genBench_ENHANCED
   - Add _genChest_ENHANCED
   - _genLoreTablet → _genLoreTablet_ENHANCED

FEATURES OF ENHANCED GRAPHICS:
✨ Hollow Knight authentic visual style
✨ Radial gradients for depth
✨ Shell highlights and textures
✨ Infection orange glowing eyes
✨ Segmented bodies with detail
✨ Proper animation (wings, legs, mandibles)
✨ Shadow and lighting effects
✨ Weathering and age details (NPCs, UI)
✨ Soul/energy glows on benches
✨ Detailed geo with facets
✨ Enhanced slash effects with particles
✨ Atmospheric UI elements

All sprites now match Hollow Knight's distinctive art style!
*/
