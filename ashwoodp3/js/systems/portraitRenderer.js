// ════════════════════════════════════════════════════════════
//  THE ASHWOOD INHERITANCE — Portrait Renderer
//  Draws character portraits procedurally using Canvas 2D
//  Noir illustration style — ink wash, high contrast
// ════════════════════════════════════════════════════════════

const PortraitRenderer = {

  // Colour palette per character
  palettes: {
    maren: {
      skin:    '#c8a880', skinShadow: '#8a6840',
      hair:    '#2a1e12', hairHl:    '#4a3020',
      coat:    '#1a1410', coatDetail:'#2a2018',
      eyes:    '#3a5030', eyeShine:  '#a0d070',
      accent:  '#8a6030'
    },
    hester: {
      skin:    '#c0a070', skinShadow: '#806840',
      hair:    '#888070', hairHl:    '#a89880',
      coat:    '#2a2820', coatDetail:'#3a3828',
      eyes:    '#504830', eyeShine:  '#a08050',
      accent:  '#6a5838'
    },
    dorothea: {
      skin:    '#d4b090', skinShadow: '#9a7858',
      hair:    '#1c1008', hairHl:    '#3a2010',
      coat:    '#380010', coatDetail:'#500020',
      eyes:    '#600020', eyeShine:  '#c06040',
      accent:  '#8a4020'
    },
    nathaniel: {
      skin:    '#c8a878', skinShadow: '#8a7050',
      hair:    '#0a0806', hairHl:    '#1a1208',
      coat:    '#101820', coatDetail:'#182838',
      eyes:    '#182838', eyeShine:  '#4a8098',
      accent:  '#283848'
    },
    sylvie: {
      skin:    '#e0c8a0', skinShadow: '#a08060',
      hair:    '#2a1a08', hairHl:    '#50300a',
      coat:    '#282010', coatDetail:'#38300a',
      eyes:    '#406030', eyeShine:  '#80c060',
      accent:  '#504018'
    },
    dr_crane: {
      skin:    '#c0a880', skinShadow: '#806848',
      hair:    '#909080', hairHl:    '#b0b0a0',
      coat:    '#e8e0d0', coatDetail:'#c0b8a8',
      eyes:    '#284060', eyeShine:  '#6090c0',
      accent:  '#608080'
    },
    declan: {
      skin:    '#b89068', skinShadow: '#786040',
      hair:    '#484038', hairHl:    '#685848',
      coat:    '#282010', coatDetail:'#3a3020',
      eyes:    '#384828', eyeShine:  '#6880a0',
      accent:  '#485028'
    },
    narrator: {
      skin:    '#000000', skinShadow: '#000000',
      hair:    '#000000', hairHl:    '#000000',
      coat:    '#000000', coatDetail:'#000000',
      eyes:    '#000000', eyeShine:  '#000000',
      accent:  '#000000'
    }
  },

  // ──────────────────────────────────────────
  //  Main draw function
  // ──────────────────────────────────────────
  draw(canvas, characterId) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;   // 140
    const h = canvas.height;  // 180

    ctx.clearRect(0, 0, w, h);

    const p = this.palettes[characterId] || this.palettes.hester;

    // Background wash
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0f0c08');
    bg.addColorStop(1, '#080604');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Draw based on character
    switch (characterId) {
      case 'maren':     this.drawMaren(ctx, w, h, p);     break;
      case 'hester':    this.drawHester(ctx, w, h, p);    break;
      case 'dorothea':  this.drawDorothea(ctx, w, h, p);  break;
      case 'nathaniel': this.drawNathaniel(ctx, w, h, p); break;
      case 'sylvie':    this.drawSylvie(ctx, w, h, p);    break;
      case 'dr_crane':  this.drawCrane(ctx, w, h, p);     break;
      case 'declan':    this.drawDeclan(ctx, w, h, p);    break;
      default:          this.drawGeneric(ctx, w, h, p);   break;
    }

    // Overlay vignette for portrait depth
    const vig = ctx.createRadialGradient(w/2, h/2, h*0.2, w/2, h/2, h*0.8);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);

    // Noise texture over portrait
    this.addNoise(ctx, w, h, 0.04);
  },

  // ──────────────────────────────────────────
  //  Shared drawing helpers
  // ──────────────────────────────────────────
  drawHead(ctx, cx, cy, rx, ry, skinColor, shadowColor) {
    // Main head shape (slightly oval)
    const grad = ctx.createRadialGradient(cx - rx*0.2, cy - ry*0.2, rx*0.1, cx, cy, Math.max(rx,ry)*1.1);
    grad.addColorStop(0, skinColor);
    grad.addColorStop(0.7, skinColor);
    grad.addColorStop(1, shadowColor);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2);
    ctx.fill();

    // Jaw shadow
    ctx.fillStyle = shadowColor;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(cx, cy + ry*0.5, rx*0.85, ry*0.35, 0, 0, Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;
  },

  drawEye(ctx, x, y, w, h, irisColor, shineColor) {
    // White
    ctx.fillStyle = '#e0d8c8';
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, 0, Math.PI*2);
    ctx.fill();
    // Iris
    ctx.fillStyle = irisColor;
    ctx.beginPath();
    ctx.ellipse(x, y, w*0.6, h*0.85, 0, 0, Math.PI*2);
    ctx.fill();
    // Pupil
    ctx.fillStyle = '#080604';
    ctx.beginPath();
    ctx.ellipse(x, y, w*0.3, h*0.5, 0, 0, Math.PI*2);
    ctx.fill();
    // Shine
    ctx.fillStyle = shineColor;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.ellipse(x - w*0.15, y - h*0.2, w*0.15, h*0.18, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
    // Lid line
    ctx.strokeStyle = '#080604';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, Math.PI, Math.PI*2);
    ctx.stroke();
  },

  drawHair(ctx, cx, headTop, headR, color, hlColor, style = 'short') {
    ctx.fillStyle = color;
    if (style === 'short') {
      ctx.beginPath();
      ctx.ellipse(cx, headTop, headR*1.05, headR*0.7, 0, Math.PI, Math.PI*2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = hlColor;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.ellipse(cx - headR*0.15, headTop + headR*0.1, headR*0.3, headR*0.2, -0.4, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (style === 'long') {
      ctx.beginPath();
      ctx.ellipse(cx, headTop, headR*1.08, headR*0.75, 0, Math.PI, Math.PI*2);
      ctx.fill();
      // Sides hanging down
      ctx.beginPath();
      ctx.rect(cx - headR*1.1, headTop, headR*0.4, headR*1.5);
      ctx.fill();
      ctx.beginPath();
      ctx.rect(cx + headR*0.7, headTop, headR*0.4, headR*1.5);
      ctx.fill();
    } else if (style === 'up') {
      // Hair up / bun
      ctx.beginPath();
      ctx.ellipse(cx, headTop - headR*0.1, headR*1.02, headR*0.5, 0, Math.PI, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + headR*0.3, headTop - headR*0.35, headR*0.35, headR*0.3, 0.5, 0, Math.PI*2);
      ctx.fill();
    }
  },

  addNoise(ctx, w, h, alpha) {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const strength = 255 * alpha;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * strength;
      data[i]   = Math.min(255, Math.max(0, data[i]   + n));
      data[i+1] = Math.min(255, Math.max(0, data[i+1] + n));
      data[i+2] = Math.min(255, Math.max(0, data[i+2] + n));
    }
    ctx.putImageData(imgData, 0, h - h);
  },

  // ──────────────────────────────────────────
  //  MAREN — The Detective
  //  Lean face, dark circles, watchful
  // ──────────────────────────────────────────
  drawMaren(ctx, w, h, p) {
    const cx = w/2, cy = h*0.42;
    // Collar / coat
    ctx.fillStyle = p.coat;
    ctx.beginPath();
    ctx.moveTo(cx - w*0.45, h);
    ctx.lineTo(cx - w*0.3, h*0.72);
    ctx.lineTo(cx - w*0.1, h*0.78);
    ctx.lineTo(cx, h*0.75);
    ctx.lineTo(cx + w*0.1, h*0.78);
    ctx.lineTo(cx + w*0.3, h*0.72);
    ctx.lineTo(cx + w*0.45, h);
    ctx.closePath();
    ctx.fill();
    // Collar V
    ctx.fillStyle = p.coatDetail;
    ctx.beginPath();
    ctx.moveTo(cx, h*0.75);
    ctx.lineTo(cx - w*0.08, h*0.68);
    ctx.lineTo(cx, h*0.78);
    ctx.lineTo(cx + w*0.08, h*0.68);
    ctx.closePath();
    ctx.fill();
    // Neck
    ctx.fillStyle = p.skin;
    ctx.fillRect(cx - 8, cy + 26, 16, 22);
    // Head
    this.drawHead(ctx, cx, cy, 26, 30, p.skin, p.skinShadow);
    // Hair
    this.drawHair(ctx, cx, cy - 28, 26, p.hair, p.hairHl, 'short');
    // Eyes — slightly tired, intense
    this.drawEye(ctx, cx - 11, cy - 2, 7, 5, p.eyes, p.eyeShine);
    this.drawEye(ctx, cx + 11, cy - 2, 7, 5, p.eyes, p.eyeShine);
    // Under-eye shadow
    ctx.fillStyle = p.skinShadow;
    ctx.globalAlpha = 0.35;
    ctx.beginPath(); ctx.ellipse(cx - 11, cy + 2, 8, 3, 0, 0, Math.PI); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 11, cy + 2, 8, 3, 0, 0, Math.PI); ctx.fill();
    ctx.globalAlpha = 1;
    // Nose
    ctx.strokeStyle = p.skinShadow; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, cy - 1); ctx.quadraticCurveTo(cx + 4, cy + 4, cx + 2, cy + 7); ctx.stroke();
    // Mouth — set, neutral
    ctx.strokeStyle = p.skinShadow; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx - 7, cy + 14); ctx.lineTo(cx + 7, cy + 14); ctx.stroke();
  },

  // ──────────────────────────────────────────
  //  HESTER — Housekeeper
  //  Round face, stern, reading glasses
  // ──────────────────────────────────────────
  drawHester(ctx, w, h, p) {
    const cx = w/2, cy = h*0.43;
    // Dark uniform
    ctx.fillStyle = p.coat;
    ctx.beginPath();
    ctx.moveTo(cx - w*0.48, h);
    ctx.lineTo(cx - w*0.3, h*0.7);
    ctx.lineTo(cx, h*0.73);
    ctx.lineTo(cx + w*0.3, h*0.7);
    ctx.lineTo(cx + w*0.48, h);
    ctx.closePath(); ctx.fill();
    // White collar
    ctx.fillStyle = '#e0d8c8';
    ctx.beginPath();
    ctx.moveTo(cx - 15, h*0.7);
    ctx.lineTo(cx, h*0.65);
    ctx.lineTo(cx + 15, h*0.7);
    ctx.lineTo(cx + 8, h*0.72);
    ctx.lineTo(cx - 8, h*0.72);
    ctx.closePath(); ctx.fill();
    // Neck
    ctx.fillStyle = p.skin;
    ctx.fillRect(cx - 9, cy + 27, 18, 20);
    // Head (rounder)
    this.drawHead(ctx, cx, cy, 29, 32, p.skin, p.skinShadow);
    // Hair (grey, up)
    this.drawHair(ctx, cx, cy - 30, 28, p.hair, p.hairHl, 'up');
    // Eyes
    this.drawEye(ctx, cx - 12, cy - 1, 7, 5, p.eyes, p.eyeShine);
    this.drawEye(ctx, cx + 12, cy - 1, 7, 5, p.eyes, p.eyeShine);
    // Glasses frames
    ctx.strokeStyle = '#806040'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx - 12, cy - 1, 9, 7, 0, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx + 12, cy - 1, 9, 7, 0, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 3, cy - 1); ctx.lineTo(cx + 3, cy - 1); ctx.stroke();
    // Nose
    ctx.strokeStyle = p.skinShadow; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(cx + 5, cy + 5, cx + 3, cy + 8); ctx.stroke();
    // Firm mouth
    ctx.strokeStyle = p.skinShadow; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - 8, cy + 15); ctx.quadraticCurveTo(cx, cy + 14, cx + 8, cy + 15); ctx.stroke();
  },

  // ──────────────────────────────────────────
  //  DOROTHEA — Elegant, composed, guarded
  // ──────────────────────────────────────────
  drawDorothea(ctx, w, h, p) {
    const cx = w/2, cy = h*0.41;
    // Dress / dark clothing
    ctx.fillStyle = p.coat;
    ctx.beginPath();
    ctx.moveTo(cx - w*0.48, h);
    ctx.lineTo(cx - w*0.28, h*0.7);
    ctx.lineTo(cx, h*0.73);
    ctx.lineTo(cx + w*0.28, h*0.7);
    ctx.lineTo(cx + w*0.48, h);
    ctx.closePath(); ctx.fill();
    // Pearl necklace
    for (let i = -4; i <= 4; i++) {
      ctx.fillStyle = '#d0c8b8';
      const px = cx + i * 6;
      const py = h*0.68 + Math.abs(i) * 0.8;
      ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI*2); ctx.fill();
    }
    // Neck
    ctx.fillStyle = p.skin;
    ctx.fillRect(cx - 9, cy + 26, 18, 24);
    // Head (oval, elegant)
    this.drawHead(ctx, cx, cy, 25, 32, p.skin, p.skinShadow);
    // Dark hair (dramatic)
    this.drawHair(ctx, cx, cy - 30, 25, p.hair, p.hairHl, 'long');
    // Eyes (defined, dramatic)
    this.drawEye(ctx, cx - 10, cy - 2, 8, 5.5, p.eyes, p.eyeShine);
    this.drawEye(ctx, cx + 10, cy - 2, 8, 5.5, p.eyes, p.eyeShine);
    // Dramatic eye liner
    ctx.strokeStyle = '#080604'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(cx - 18, cy - 4); ctx.lineTo(cx - 2, cy - 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 2, cy - 4); ctx.lineTo(cx + 18, cy - 4); ctx.stroke();
    // Nose (refined)
    ctx.strokeStyle = p.skinShadow; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx, cy - 2); ctx.quadraticCurveTo(cx + 3, cy + 4, cx + 2, cy + 7); ctx.stroke();
    // Lips (lips drawn, slight smile that isn't)
    ctx.fillStyle = '#8a3020';
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy + 14);
    ctx.quadraticCurveTo(cx, cy + 12, cx + 7, cy + 14);
    ctx.quadraticCurveTo(cx, cy + 17, cx - 7, cy + 14);
    ctx.fill();
  },

  // ──────────────────────────────────────────
  //  NATHANIEL — Polished, tense, dangerous
  // ──────────────────────────────────────────
  drawNathaniel(ctx, w, h, p) {
    const cx = w/2, cy = h*0.41;
    // Dark suit
    ctx.fillStyle = p.coat;
    ctx.beginPath();
    ctx.moveTo(cx - w*0.48, h);
    ctx.lineTo(cx - w*0.28, h*0.68);
    ctx.lineTo(cx - w*0.05, h*0.72);
    ctx.lineTo(cx, h*0.7);
    ctx.lineTo(cx + w*0.05, h*0.72);
    ctx.lineTo(cx + w*0.28, h*0.68);
    ctx.lineTo(cx + w*0.48, h);
    ctx.closePath(); ctx.fill();
    // Tie
    ctx.fillStyle = p.coatDetail;
    ctx.beginPath();
    ctx.moveTo(cx, h*0.7);
    ctx.lineTo(cx - 5, h*0.75);
    ctx.lineTo(cx, h*0.82);
    ctx.lineTo(cx + 5, h*0.75);
    ctx.closePath(); ctx.fill();
    // White shirt collar
    ctx.fillStyle = '#d8d0c0';
    ctx.beginPath();
    ctx.moveTo(cx - 14, h*0.68);
    ctx.lineTo(cx, h*0.65);
    ctx.lineTo(cx + 14, h*0.68);
    ctx.lineTo(cx + 9, h*0.71);
    ctx.lineTo(cx - 9, h*0.71);
    ctx.closePath(); ctx.fill();
    // Neck
    ctx.fillStyle = p.skin;
    ctx.fillRect(cx - 9, cy + 27, 18, 18);
    // Head
    this.drawHead(ctx, cx, cy, 27, 31, p.skin, p.skinShadow);
    // Dark hair, neat
    this.drawHair(ctx, cx, cy - 29, 27, p.hair, p.hairHl, 'short');
    // Eyes (cool, watchful, slightly narrow)
    this.drawEye(ctx, cx - 11, cy - 2, 7, 4.5, p.eyes, p.eyeShine);
    this.drawEye(ctx, cx + 11, cy - 2, 7, 4.5, p.eyes, p.eyeShine);
    // Brow furrow
    ctx.strokeStyle = p.skinShadow; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - 16, cy - 10); ctx.lineTo(cx - 7, cy - 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 7, cy - 8); ctx.lineTo(cx + 16, cy - 10); ctx.stroke();
    // Nose
    ctx.strokeStyle = p.skinShadow; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, cy - 1); ctx.quadraticCurveTo(cx + 4, cy + 5, cx + 2, cy + 8); ctx.stroke();
    // Thin lips, set
    ctx.strokeStyle = p.skinShadow; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - 6, cy + 14); ctx.lineTo(cx + 6, cy + 14); ctx.stroke();
  },

  // ──────────────────────────────────────────
  //  SYLVIE — Young, watchful, artistic
  // ──────────────────────────────────────────
  drawSylvie(ctx, w, h, p) {
    const cx = w/2, cy = h*0.42;
    // Paint-stained work jacket
    ctx.fillStyle = p.coat;
    ctx.beginPath();
    ctx.moveTo(cx - w*0.48, h);
    ctx.lineTo(cx - w*0.3, h*0.72);
    ctx.lineTo(cx, h*0.76);
    ctx.lineTo(cx + w*0.3, h*0.72);
    ctx.lineTo(cx + w*0.48, h);
    ctx.closePath(); ctx.fill();
    // Paint smudge
    ctx.fillStyle = '#487030';
    ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.ellipse(cx - 20, h*0.78, 8, 5, 0.8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#8a4020';
    ctx.beginPath(); ctx.ellipse(cx + 25, h*0.74, 5, 3, -0.5, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    // Neck
    ctx.fillStyle = p.skin;
    ctx.fillRect(cx - 8, cy + 26, 16, 22);
    // Head (slightly narrower, younger)
    this.drawHead(ctx, cx, cy, 24, 30, p.skin, p.skinShadow);
    // Dark hair, loose
    this.drawHair(ctx, cx, cy - 28, 24, p.hair, p.hairHl, 'long');
    // Eyes (large, attentive)
    this.drawEye(ctx, cx - 10, cy - 2, 8, 6, p.eyes, p.eyeShine);
    this.drawEye(ctx, cx + 10, cy - 2, 8, 6, p.eyes, p.eyeShine);
    // Nose
    ctx.strokeStyle = p.skinShadow; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx, cy - 1); ctx.quadraticCurveTo(cx + 3, cy + 4, cx + 2, cy + 7); ctx.stroke();
    // Mouth (slightly parted, curious)
    ctx.strokeStyle = p.skinShadow; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - 6, cy + 14); ctx.quadraticCurveTo(cx, cy + 16, cx + 6, cy + 14); ctx.stroke();
  },

  // ──────────────────────────────────────────
  //  DR. CRANE — Precise, conflicted
  // ──────────────────────────────────────────
  drawCrane(ctx, w, h, p) {
    const cx = w/2, cy = h*0.41;
    // White coat
    ctx.fillStyle = p.coat;
    ctx.beginPath();
    ctx.moveTo(cx - w*0.48, h);
    ctx.lineTo(cx - w*0.3, h*0.68);
    ctx.lineTo(cx, h*0.71);
    ctx.lineTo(cx + w*0.3, h*0.68);
    ctx.lineTo(cx + w*0.48, h);
    ctx.closePath(); ctx.fill();
    // Lapels
    ctx.fillStyle = p.coatDetail;
    ctx.beginPath();
    ctx.moveTo(cx - w*0.3, h*0.68);
    ctx.lineTo(cx - 5, h*0.7);
    ctx.lineTo(cx - 12, h*0.76);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + w*0.3, h*0.68);
    ctx.lineTo(cx + 5, h*0.7);
    ctx.lineTo(cx + 12, h*0.76);
    ctx.closePath(); ctx.fill();
    // Neck
    ctx.fillStyle = p.skin;
    ctx.fillRect(cx - 9, cy + 26, 18, 20);
    // Head
    this.drawHead(ctx, cx, cy, 26, 30, p.skin, p.skinShadow);
    // Grey hair
    this.drawHair(ctx, cx, cy - 28, 26, p.hair, p.hairHl, 'short');
    // Eyes (behind glasses, tired)
    this.drawEye(ctx, cx - 11, cy - 2, 7, 5, p.eyes, p.eyeShine);
    this.drawEye(ctx, cx + 11, cy - 2, 7, 5, p.eyes, p.eyeShine);
    // Glasses
    ctx.strokeStyle = '#a09080'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.rect(cx - 20, cy - 8, 17, 12); ctx.stroke();
    ctx.beginPath(); ctx.rect(cx + 3, cy - 8, 17, 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 3, cy - 4); ctx.lineTo(cx + 3, cy - 4); ctx.stroke();
    // Worry lines on forehead
    ctx.strokeStyle = p.skinShadow; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(cx - 12, cy - 16); ctx.lineTo(cx + 8, cy - 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 10, cy - 12); ctx.lineTo(cx + 6, cy - 13); ctx.stroke();
    ctx.globalAlpha = 1;
    // Nose
    ctx.strokeStyle = p.skinShadow; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(cx + 4, cy + 4, cx + 2, cy + 7); ctx.stroke();
    // Pursed, stressed mouth
    ctx.strokeStyle = p.skinShadow; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - 6, cy + 15); ctx.quadraticCurveTo(cx, cy + 13, cx + 6, cy + 15); ctx.stroke();
  },

  // ──────────────────────────────────────────
  //  DECLAN — Weathered, resigned
  // ──────────────────────────────────────────
  drawDeclan(ctx, w, h, p) {
    const cx = w/2, cy = h*0.42;
    // Worn jacket
    ctx.fillStyle = p.coat;
    ctx.beginPath();
    ctx.moveTo(cx - w*0.48, h);
    ctx.lineTo(cx - w*0.3, h*0.71);
    ctx.lineTo(cx, h*0.74);
    ctx.lineTo(cx + w*0.3, h*0.71);
    ctx.lineTo(cx + w*0.48, h);
    ctx.closePath(); ctx.fill();
    // Neck
    ctx.fillStyle = p.skin;
    ctx.fillRect(cx - 9, cy + 26, 18, 22);
    // Head (lined, weathered)
    this.drawHead(ctx, cx, cy, 28, 32, p.skin, p.skinShadow);
    // Salt-and-pepper hair
    this.drawHair(ctx, cx, cy - 30, 28, p.hair, p.hairHl, 'short');
    // Eyes (older, sad)
    this.drawEye(ctx, cx - 12, cy, 7, 5, p.eyes, p.eyeShine);
    this.drawEye(ctx, cx + 12, cy, 7, 5, p.eyes, p.eyeShine);
    // Many wrinkles
    ctx.strokeStyle = p.skinShadow; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy - 14 + i*3);
      ctx.lineTo(cx + 10, cy - 16 + i*3);
      ctx.stroke();
    }
    // Crow's feet
    ctx.beginPath(); ctx.moveTo(cx - 19, cy); ctx.lineTo(cx - 22, cy - 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 19, cy + 1); ctx.lineTo(cx - 23, cy + 2); ctx.stroke();
    ctx.globalAlpha = 1;
    // Nose
    ctx.strokeStyle = p.skinShadow; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, cy - 1); ctx.quadraticCurveTo(cx + 5, cy + 5, cx + 3, cy + 9); ctx.stroke();
    // Mouth — resigned
    ctx.strokeStyle = p.skinShadow; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - 8, cy + 16); ctx.quadraticCurveTo(cx, cy + 18, cx + 8, cy + 16); ctx.stroke();
  },

  // ──────────────────────────────────────────
  //  GENERIC fallback
  // ──────────────────────────────────────────
  drawGeneric(ctx, w, h, p) {
    const cx = w/2, cy = h*0.42;
    ctx.fillStyle = '#1a1410';
    ctx.beginPath();
    ctx.moveTo(cx - w*0.45, h);
    ctx.lineTo(cx - w*0.3, h*0.72);
    ctx.lineTo(cx + w*0.3, h*0.72);
    ctx.lineTo(cx + w*0.45, h);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = p.skin || '#c0a070';
    ctx.fillRect(cx - 8, cy + 26, 16, 20);
    this.drawHead(ctx, cx, cy, 26, 30, p.skin || '#c0a070', p.skinShadow || '#806040');

    // Question mark for unknown
    ctx.fillStyle = 'rgba(200,136,42,0.3)';
    ctx.font = 'bold 40px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('?', cx, cy);
  }
};
