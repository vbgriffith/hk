/* js/scenes/PreloadScene_graphics_upgrade.js — Session 8: Graphics Enhancement
 * 
 * This file contains upgraded sprite generation for the Knight and UI elements.
 * Replace the corresponding functions in PreloadScene.js
 */
'use strict';

// ══════════════════════════════════════════════════════════════════════════
// ENHANCED KNIGHT SPRITE — Hollow Knight visual style
// ══════════════════════════════════════════════════════════════════════════

function _genKnight_UPGRADED() {
  const FW = 32, FH = 32;
  const canvas = this.textures.createCanvas('knight', FW * 30, FH * 29);
  const ctx    = canvas.context;

  const rows = ANIM_DEFS.knight.anims;
  let rowIdx  = 0;

  for (const [name, cfg] of Object.entries(rows)) {
    for (let f = 0; f < cfg.frames; f++) {
      this._drawKnightFrame_UPGRADED(ctx, f * FW, rowIdx * FH, FW, FH, name, f, cfg.frames);
      canvas.add(rowIdx * 100 + f, 0, f * FW, rowIdx * FH, FW, FH);
    }
    rowIdx++;
  }

  canvas.refresh();
}

function _drawKnightFrame_UPGRADED(ctx, x, y, w, h, animName, frame, totalFrames) {
  const cx = x + w / 2, cy = y + h / 2;
  const t  = frame / Math.max(totalFrames - 1, 1);

  ctx.save();
  ctx.translate(cx, cy);

  // Animation-specific movement
  const bob = this._getKnightBob(animName, t);
  const lean = this._getKnightLean(animName, t);
  const squash = this._getKnightSquash(animName, t);

  // === Cloak (behind) ===
  this._drawEnhancedCloak(ctx, animName, t, bob, lean);

  // === Main body (detailed shell) ===
  this._drawEnhancedBody(ctx, animName, bob, squash);

  // === Head / mask (iconic Hollow Knight design) ===
  this._drawEnhancedHead(ctx, animName, bob);

  // === Nail (with trail effects) ===
  if (animName.includes('attack')) {
    this._drawEnhancedNail(ctx, animName, t);
  }

  // === Soul effects ===
  if (animName.includes('focus')) {
    this._drawSoulEffects(ctx, t);
  }

  // === Dash trail ===
  if (animName === 'dash') {
    this._drawDashTrail(ctx, t);
  }

  ctx.restore();
}

// ── Animation helpers ─────────────────────────────────────────────────────

function _getKnightBob(animName, t) {
  if (animName === 'idle') {
    return Math.sin(t * Math.PI * 2) * 1;
  }
  if (animName === 'run') {
    return Math.sin(t * Math.PI * 4) * 2;
  }
  if (animName === 'jump' || animName === 'fall') {
    return 0;
  }
  return 0;
}

function _getKnightLean(animName, t) {
  if (animName === 'run') {
    return 0.1;
  }
  if (animName === 'dash') {
    return 0.15;
  }
  if (animName.includes('attack')) {
    return Math.sin(t * Math.PI) * 0.08;
  }
  return 0;
}

function _getKnightSquash(animName, t) {
  if (animName === 'land') {
    return 1.15 - t * 0.15;
  }
  if (animName === 'jump') {
    return 0.95 + t * 0.05;
  }
  return 1.0;
}

// ── Enhanced body rendering ───────────────────────────────────────────────

function _drawEnhancedBody(ctx, animName, bob, squash) {
  ctx.save();
  ctx.scale(1, squash);

  // Main shell (dark void-black with subtle gradient)
  const grad = ctx.createRadialGradient(0, 2 + bob, 0, 0, 2 + bob, 8);
  grad.addColorStop(0, '#2a2a40');
  grad.addColorStop(1, '#0a0a15');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 2 + bob, 6, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell highlight (crescent)
  ctx.fillStyle = 'rgba(80, 80, 120, 0.4)';
  ctx.beginPath();
  ctx.ellipse(-2, -1 + bob, 2.5, 4, -0.4, 0, Math.PI);
  ctx.fill();

  // Shell shine
  ctx.fillStyle = 'rgba(200, 200, 220, 0.15)';
  ctx.beginPath();
  ctx.ellipse(-1.5, -2 + bob, 1.5, 2.5, -0.3, 0, Math.PI);
  ctx.fill();

  ctx.restore();
}

function _drawEnhancedHead(ctx, animName, bob) {
  // Pale mask base
  ctx.fillStyle = '#f4efe6';
  ctx.beginPath();
  ctx.ellipse(0, -6 + bob, 5.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mask shadow/depth
  ctx.fillStyle = 'rgba(200, 195, 185, 0.5)';
  ctx.beginPath();
  ctx.ellipse(0, -4.5 + bob, 5, 1.5, 0, 0, Math.PI);
  ctx.fill();

  // Iconic void eye-holes (key Hollow Knight feature)
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(-2.2, -6.5 + bob, 1.7, 1.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(2.2, -6.5 + bob, 1.7, 1.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner eye shadows (depth)
  ctx.fillStyle = 'rgba(100, 100, 120, 0.3)';
  ctx.beginPath();
  ctx.ellipse(-2.2, -6 + bob, 1.2, 0.8, 0, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(2.2, -6 + bob, 1.2, 0.8, 0, 0, Math.PI);
  ctx.fill();

  // Horns (more pronounced)
  ctx.fillStyle = '#dcd8cd';
  ctx.beginPath();
  ctx.moveTo(-3.5, -9.5 + bob);
  ctx.lineTo(-2.5, -14.5 + bob);
  ctx.lineTo(-1, -9.5 + bob);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(3.5, -9.5 + bob);
  ctx.lineTo(2.5, -14.5 + bob);
  ctx.lineTo(1, -9.5 + bob);
  ctx.closePath();
  ctx.fill();

  // Horn highlights
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-2.8, -10.5 + bob);
  ctx.lineTo(-2.5, -13 + bob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(2.8, -10.5 + bob);
  ctx.lineTo(2.5, -13 + bob);
  ctx.stroke();
}

function _drawEnhancedCloak(ctx, animName, t, bob, lean) {
  const sway = Math.sin(t * Math.PI) * 3;
  const flutter = Math.sin(t * Math.PI * 3) * 1;

  ctx.save();
  ctx.rotate(lean);

  // Outer cloak (darker)
  ctx.fillStyle = '#0a0a15';
  ctx.beginPath();
  ctx.moveTo(-6, 3 + bob);
  ctx.quadraticCurveTo(-10 + sway, 10 + bob + flutter, -5, 16 + bob);
  ctx.lineTo(5, 16 + bob);
  ctx.quadraticCurveTo(10 - sway, 10 + bob + flutter, 6, 3 + bob);
  ctx.closePath();
  ctx.fill();

  // Inner cloak shadow
  ctx.fillStyle = 'rgba(30, 30, 50, 0.5)';
  ctx.beginPath();
  ctx.moveTo(-4, 5 + bob);
  ctx.quadraticCurveTo(-7 + sway * 0.5, 11 + bob, -3, 14 + bob);
  ctx.lineTo(3, 14 + bob);
  ctx.quadraticCurveTo(7 - sway * 0.5, 11 + bob, 4, 5 + bob);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function _drawEnhancedNail(ctx, animName, t) {
  ctx.save();

  const ext = animName === 'great_slash' ? 20 : 16;
  const swing = (t - 0.5) * Math.PI * 1.4;
  const trail = animName === 'great_slash' ? 5 : 3;

  // Nail swing trail (motion blur)
  for (let i = 0; i < trail; i++) {
    const alpha = (i + 1) / trail * 0.2;
    const offset = (i / trail - 0.5) * 0.3;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3 - i * 0.3;

    if (animName.includes('up')) {
      ctx.translate(3, -4);
      ctx.rotate(-Math.PI / 2 + (swing + offset) * 0.4);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -ext);
      ctx.stroke();
      ctx.resetTransform();
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    } else if (animName.includes('down')) {
      ctx.translate(3, 6);
      ctx.rotate(Math.PI / 2 + (swing + offset) * 0.4);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -ext);
      ctx.stroke();
      ctx.resetTransform();
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    } else {
      ctx.translate(5, 0);
      ctx.rotate(swing + offset);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(ext, 0);
      ctx.stroke();
      ctx.resetTransform();
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    }
  }

  ctx.globalAlpha = 1.0;

  // Main nail
  ctx.strokeStyle = '#e8e4dc';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  if (animName.includes('up')) {
    ctx.translate(3, -4);
    ctx.rotate(-Math.PI / 2 + swing * 0.4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -ext);
    ctx.stroke();

    // Nail tip glow
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -ext, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (animName.includes('down')) {
    ctx.translate(3, 6);
    ctx.rotate(Math.PI / 2 + swing * 0.4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -ext);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -ext, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.translate(5, 0);
    ctx.rotate(swing);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(ext, 0);
    ctx.stroke();

    // Nail tip
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ext, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Blade gleam
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ext * 0.3, 0);
    ctx.lineTo(ext * 0.7, 0);
    ctx.stroke();
  }

  ctx.restore();
}

function _drawSoulEffects(ctx, t) {
  // Orbiting soul particles
  for (let i = 0; i < 3; i++) {
    const angle = (t + i / 3) * Math.PI * 2;
    const r = 12 + Math.sin(t * Math.PI * 2 + i) * 2;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;

    ctx.fillStyle = 'rgba(90, 227, 227, 0.6)';
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();

    // Particle glow
    ctx.fillStyle = 'rgba(170, 245, 245, 0.3)';
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central soul ring
  const r = 10 + Math.sin(t * Math.PI * 2) * 3;
  ctx.strokeStyle = 'rgba(90, 227, 227, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  // Inner glow
  ctx.strokeStyle = 'rgba(170, 245, 245, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, r - 2, 0, Math.PI * 2);
  ctx.stroke();
}

function _drawDashTrail(ctx, t) {
  // Motion trail effect during dash
  for (let i = 0; i < 4; i++) {
    const alpha = (1 - i / 4) * 0.3 * (1 - t);
    const offset = -8 * i * t;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#2a2a4a';
    ctx.beginPath();
    ctx.ellipse(offset, 0, 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
}

// ══════════════════════════════════════════════════════════════════════════
// SPRITE FLIPPING — Enable Knight to face left/right
// ══════════════════════════════════════════════════════════════════════════

// In Knight.js update() method, add this to handle facing:
/*
  // Update sprite facing based on state.facing
  if (this.state.facing === -1 && !this.sprite.flipX) {
    this.sprite.setFlipX(true);
  } else if (this.state.facing === 1 && this.sprite.flipX) {
    this.sprite.setFlipX(false);
  }
*/

// ══════════════════════════════════════════════════════════════════════════
// ENHANCED UI ELEMENTS
// ══════════════════════════════════════════════════════════════════════════

function _genUI_UPGRADED() {
  // __DEFAULT sprite (for physics zones)
  this.textures.createCanvas('__DEFAULT', 1, 1).refresh();

  // Enhanced particle
  const particleCanvas = this.textures.createCanvas('particle', 8, 8);
  const pctx = particleCanvas.context;
  const grad = pctx.createRadialGradient(4, 4, 0, 4, 4, 4);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.5, 'rgba(200, 200, 255, 0.6)');
  grad.addColorStop(1, 'rgba(100, 100, 200, 0)');
  pctx.fillStyle = grad;
  pctx.fillRect(0, 0, 8, 8);
  particleCanvas.refresh();

  // Enhanced bench with glow
  const benchCanvas = this.textures.createCanvas('bench', 24, 16);
  const bctx = benchCanvas.context;

  // Bench glow
  bctx.fillStyle = 'rgba(90, 227, 227, 0.1)';
  bctx.fillRect(0, 0, 24, 16);

  // Bench structure
  bctx.fillStyle = '#4a4a3a';
  bctx.fillRect(3, 8, 18, 6);
  bctx.fillRect(4, 5, 2, 3);
  bctx.fillRect(18, 5, 2, 3);

  // Bench highlights
  bctx.fillStyle = '#6a6a5a';
  bctx.fillRect(3, 8, 18, 2);
  bctx.fillRect(4, 5, 1, 3);
  bctx.fillRect(18, 5, 1, 3);

  // Soul glow on bench
  bctx.fillStyle = 'rgba(90, 227, 227, 0.4)';
  bctx.fillRect(10, 9, 4, 4);

  benchCanvas.refresh();

  // Enhanced lore tablet with ancient glow
  const tabletCanvas = this.textures.createCanvas('lore_tablet', 16, 24);
  const tctx = tabletCanvas.context;

  // Tablet glow
  const tabletGrad = tctx.createRadialGradient(8, 12, 0, 8, 12, 12);
  tabletGrad.addColorStop(0, 'rgba(200, 180, 120, 0.2)');
  tabletGrad.addColorStop(1, 'rgba(100, 90, 60, 0)');
  tctx.fillStyle = tabletGrad;
  tctx.fillRect(0, 0, 16, 24);

  // Stone tablet
  tctx.fillStyle = '#3a3a2a';
  tctx.fillRect(2, 2, 12, 20);

  // Ancient text glow
  tctx.fillStyle = 'rgba(220, 200, 150, 0.6)';
  for (let i = 0; i < 4; i++) {
    tctx.fillRect(4, 5 + i * 4, 8, 1);
  }

  // Tablet highlights
  tctx.fillStyle = '#5a5a4a';
  tctx.fillRect(2, 2, 1, 20);
  tctx.fillRect(2, 2, 12, 1);

  tabletCanvas.refresh();
}

// ══════════════════════════════════════════════════════════════════════════
// INTEGRATION INSTRUCTIONS
// ══════════════════════════════════════════════════════════════════════════

/*
TO INTEGRATE THESE UPGRADES:

1. In PreloadScene.js, replace _genKnight() with _genKnight_UPGRADED()
2. In PreloadScene.js, replace _genUI() with _genUI_UPGRADED()
3. Add all helper functions (_drawEnhancedBody, _drawEnhancedHead, etc.)
4. In Knight.js update() method, add sprite flipping code (see comment above)
5. Update Knight.js setSize() to account for better proportions:
   this.setSize(12, 22, 10, 11);  // Slightly larger hitbox

RESULT:
- Knight looks much more like Hollow Knight character
- Proper facing direction with sprite flipping
- Enhanced nail attacks with motion blur
- Soul effects during focus
- Dash trails
- Better UI elements with glows and highlights
*/
