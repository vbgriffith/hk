# Hollow Knight Web Clone — Session 8: Graphics Upgrade Patch

## Overview
This session upgrades the Knight sprite to match Hollow Knight's iconic design, adds proper facing direction, and enhances UI elements.

---

## PATCH 1: Enhanced Knight Sprite

### File: `js/scenes/PreloadScene.js`

**REPLACE** the `_drawKnightFrame` method (lines 130-174) with this enhanced version:

```javascript
_drawKnightFrame(ctx, x, y, w, h, animName, frame, totalFrames) {
  const cx = x + w / 2, cy = y + h / 2;
  const t  = frame / Math.max(totalFrames - 1, 1);

  ctx.save();
  ctx.translate(cx, cy);

  // Enhanced animation
  const bob = this._getKnightBob(animName, t);
  const lean = this._getKnightLean(animName, t);
  const squash = this._getKnightSquash(animName, t);

  // === Cloak (behind) ===
  this._drawEnhancedCloak(ctx, animName, t, bob, lean);

  // === Main body ===
  this._drawEnhancedBody(ctx, animName, bob, squash);

  // === Head / mask ===
  this._drawEnhancedHead(ctx, animName, bob);

  // === Nail ===
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
```

### ADD these new helper methods after `_drawKnightFrame`:

```javascript
_getKnightBob(animName, t) {
  if (animName === 'idle') return Math.sin(t * Math.PI * 2) * 1;
  if (animName === 'run') return Math.sin(t * Math.PI * 4) * 2;
  return 0;
}

_getKnightLean(animName, t) {
  if (animName === 'run') return 0.1;
  if (animName === 'dash') return 0.15;
  if (animName.includes('attack')) return Math.sin(t * Math.PI) * 0.08;
  return 0;
}

_getKnightSquash(animName, t) {
  if (animName === 'land') return 1.15 - t * 0.15;
  if (animName === 'jump') return 0.95 + t * 0.05;
  return 1.0;
}

_drawEnhancedBody(ctx, animName, bob, squash) {
  ctx.save();
  ctx.scale(1, squash);

  // Main shell with gradient
  const grad = ctx.createRadialGradient(0, 2 + bob, 0, 0, 2 + bob, 8);
  grad.addColorStop(0, '#2a2a40');
  grad.addColorStop(1, '#0a0a15');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 2 + bob, 6, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell highlight
  ctx.fillStyle = 'rgba(80, 80, 120, 0.4)';
  ctx.beginPath();
  ctx.ellipse(-2, -1 + bob, 2.5, 4, -0.4, 0, Math.PI);
  ctx.fill();

  // Shine
  ctx.fillStyle = 'rgba(200, 200, 220, 0.15)';
  ctx.beginPath();
  ctx.ellipse(-1.5, -2 + bob, 1.5, 2.5, -0.3, 0, Math.PI);
  ctx.fill();

  ctx.restore();
}

_drawEnhancedHead(ctx, animName, bob) {
  // Pale mask
  ctx.fillStyle = '#f4efe6';
  ctx.beginPath();
  ctx.ellipse(0, -6 + bob, 5.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mask shadow
  ctx.fillStyle = 'rgba(200, 195, 185, 0.5)';
  ctx.beginPath();
  ctx.ellipse(0, -4.5 + bob, 5, 1.5, 0, 0, Math.PI);
  ctx.fill();

  // Void eye-holes (iconic!)
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.ellipse(-2.2, -6.5 + bob, 1.7, 1.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(2.2, -6.5 + bob, 1.7, 1.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye shadows (depth)
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

_drawEnhancedCloak(ctx, animName, t, bob, lean) {
  const sway = Math.sin(t * Math.PI) * 3;
  const flutter = Math.sin(t * Math.PI * 3) * 1;

  ctx.save();
  ctx.rotate(lean);

  // Outer cloak
  ctx.fillStyle = '#0a0a15';
  ctx.beginPath();
  ctx.moveTo(-6, 3 + bob);
  ctx.quadraticCurveTo(-10 + sway, 10 + bob + flutter, -5, 16 + bob);
  ctx.lineTo(5, 16 + bob);
  ctx.quadraticCurveTo(10 - sway, 10 + bob + flutter, 6, 3 + bob);
  ctx.closePath();
  ctx.fill();

  // Inner shadow
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

_drawEnhancedNail(ctx, animName, t) {
  ctx.save();

  const ext = animName === 'great_slash' ? 20 : 16;
  const swing = (t - 0.5) * Math.PI * 1.4;

  // Nail with enhanced styling
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
    
    // Tip glow
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
    
    // Tip
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ext, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Gleam
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ext * 0.3, 0);
    ctx.lineTo(ext * 0.7, 0);
    ctx.stroke();
  }

  ctx.restore();
}

_drawSoulEffects(ctx, t) {
  // Orbiting particles
  for (let i = 0; i < 3; i++) {
    const angle = (t + i / 3) * Math.PI * 2;
    const r = 12 + Math.sin(t * Math.PI * 2 + i) * 2;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;

    ctx.fillStyle = 'rgba(90, 227, 227, 0.6)';
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(170, 245, 245, 0.3)';
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central ring
  const r = 10 + Math.sin(t * Math.PI * 2) * 3;
  ctx.strokeStyle = 'rgba(90, 227, 227, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(170, 245, 245, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, r - 2, 0, Math.PI * 2);
  ctx.stroke();
}

_drawDashTrail(ctx, t) {
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
```

---

## PATCH 2: Sprite Facing Direction

### File: `js/entities/Knight.js`

**ADD** this code to the `update(dt)` method, right after the state machine logic (around line 120):

```javascript
  // Update sprite facing direction
  if (this.state.facing === -1 && !this.sprite.flipX) {
    this.sprite.setFlipX(true);
  } else if (this.state.facing === 1 && this.sprite.flipX) {
    this.sprite.setFlipX(false);
  }
```

**ALSO UPDATE** the hitbox size in constructor (line 29):

```javascript
this.setSize(12, 22, 10, 11);  // Better proportions for new sprite
```

---

## PATCH 3: Enhanced UI Elements

### File: `js/scenes/PreloadScene.js`

**REPLACE** the `_genUI` method with:

```javascript
_genUI() {
  // __DEFAULT sprite
  this.textures.createCanvas('__DEFAULT', 1, 1).refresh();

  // Enhanced particle with glow
  const particleCanvas = this.textures.createCanvas('particle', 8, 8);
  const pctx = particleCanvas.context;
  const grad = pctx.createRadialGradient(4, 4, 0, 4, 4, 4);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.5, 'rgba(200, 200, 255, 0.6)');
  grad.addColorStop(1, 'rgba(100, 100, 200, 0)');
  pctx.fillStyle = grad;
  pctx.fillRect(0, 0, 8, 8);
  particleCanvas.refresh();

  // Enhanced bench with soul glow
  const benchCanvas = this.textures.createCanvas('bench', 24, 16);
  const bctx = benchCanvas.context;

  // Glow
  bctx.fillStyle = 'rgba(90, 227, 227, 0.1)';
  bctx.fillRect(0, 0, 24, 16);

  // Structure
  bctx.fillStyle = '#4a4a3a';
  bctx.fillRect(3, 8, 18, 6);
  bctx.fillRect(4, 5, 2, 3);
  bctx.fillRect(18, 5, 2, 3);

  // Highlights
  bctx.fillStyle = '#6a6a5a';
  bctx.fillRect(3, 8, 18, 2);
  bctx.fillRect(4, 5, 1, 3);
  bctx.fillRect(18, 5, 1, 3);

  // Soul glow
  bctx.fillStyle = 'rgba(90, 227, 227, 0.4)';
  bctx.fillRect(10, 9, 4, 4);

  benchCanvas.refresh();

  // Enhanced lore tablet
  const tabletCanvas = this.textures.createCanvas('lore_tablet', 16, 24);
  const tctx = tabletCanvas.context;

  // Glow
  const tabletGrad = tctx.createRadialGradient(8, 12, 0, 8, 12, 12);
  tabletGrad.addColorStop(0, 'rgba(200, 180, 120, 0.2)');
  tabletGrad.addColorStop(1, 'rgba(100, 90, 60, 0)');
  tctx.fillStyle = tabletGrad;
  tctx.fillRect(0, 0, 16, 24);

  // Stone
  tctx.fillStyle = '#3a3a2a';
  tctx.fillRect(2, 2, 12, 20);

  // Ancient text
  tctx.fillStyle = 'rgba(220, 200, 150, 0.6)';
  for (let i = 0; i < 4; i++) {
    tctx.fillRect(4, 5 + i * 4, 8, 1);
  }

  // Highlights
  tctx.fillStyle = '#5a5a4a';
  tctx.fillRect(2, 2, 1, 20);
  tctx.fillRect(2, 2, 12, 1);

  tabletCanvas.refresh();
}
```

---

## Application Order

1. Apply PATCH 1 first (Enhanced Knight sprite methods)
2. Apply PATCH 2 second (Sprite facing in Knight.js)
3. Apply PATCH 3 third (Enhanced UI)
4. Test the game - Knight should now look like Hollow Knight and face correct direction

---

## Expected Results

✅ Knight has detailed Hollow Knight appearance:
  - Iconic pale mask with void eyes
  - Pronounced horns
  - Dark shell with highlights
  - Flowing cloak

✅ Knight faces correct direction:
  - Sprite flips when moving left
  - Always faces movement direction

✅ Enhanced animations:
  - Body bob during idle/run
  - Squash & stretch on jumps
  - Lean during dash
  - Soul particles during focus
  - Motion trails during dash

✅ Better nail attacks:
  - Enhanced gleam and glow
  - Proper swing arcs
  - Tip highlights

✅ Improved UI:
  - Benches have soul glow
  - Lore tablets have ancient glow
  - Particles have soft radial gradient

---

## Files Modified

- `js/scenes/PreloadScene.js` — Knight sprite + UI (9 new methods, ~300 lines)
- `js/entities/Knight.js` — Facing direction (3 lines)

---

## Troubleshooting

**Knight doesn't flip:**
→ Check that sprite flipping code is in Knight.js update() method

**Graphics look wrong:**
→ Verify all helper methods are added to PreloadScene.js
→ Clear browser cache and reload

**Performance issues:**
→ The enhanced graphics use more canvas operations
→ Should still run smoothly on modern browsers
