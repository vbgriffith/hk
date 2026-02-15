/* js/scenes/BootScene.js — Initial boot, show loading screen */
'use strict';

class BootScene extends Phaser.Scene {
  constructor() { super(C.SCENE_BOOT); }

  preload() {
    // Create loading screen in DOM
    const div = document.createElement('div');
    div.id = 'loading-screen';
    div.innerHTML = `
      <div id="loading-logo">HALLOWNEST</div>
      <div id="loading-bar-wrap"><div id="loading-bar"></div></div>
      <div id="loading-tip">"All dreams must end. But a dreamer may persist..."</div>
    `;
    document.body.appendChild(div);
  }

  create() {
    this.scene.start(C.SCENE_PRELOAD);
  }
}


/* ── Preload Scene ───────────────────────────────────────────────────────── */
class PreloadScene extends Phaser.Scene {
  constructor() { super(C.SCENE_PRELOAD); }

  preload() {
    const bar = document.getElementById('loading-bar');

    this.load.on('progress', pct => {
      if (bar) bar.style.width = `${pct * 100}%`;
    });

    this.load.on('complete', () => {
      const screen = document.getElementById('loading-screen');
      if (screen) {
        screen.classList.add('fade-out');
        setTimeout(() => screen.remove(), 900);
      }
    });

    // ── All assets are procedurally generated ─────────────────────────────
    // In a real build, you'd load PNGs from /assets.
    // Here we'll generate spritesheet textures in create().
    // We still need to "load" something so progress fires.
    this.load.json('dummy', 'data:application/json,{}');
  }

  create() {
    this._generateAllTextures();
    AnimationManager.registerAll(this);
    this.scene.start(C.SCENE_MENU);
  }

  // ── Procedural sprite generation ──────────────────────────────────────────
  _generateAllTextures() {
    // Each texture is a spritesheet where frame index = row*100 + col
    // We draw each row as an animation strip

    this._genKnight();
    this._genCrawler();
    this._genSpitter();
    this._genFlyingScout();
    this._genNPCs();
    this._genEffects();
    this._genUI();
    this._genTiles();
  }

  _makeSheet(key, frameW, frameH, rows) {
    const cols   = Math.max(...rows.map(r => r.frames));
    const gfxW   = frameW * cols;
    const gfxH   = frameH * rows.length;

    const rt = this.add.renderTexture(0, 0, gfxW, gfxH);
    rt.setVisible(false);

    const gfx = this.add.graphics();

    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const rowDef = rows[rowIdx];
      for (let f = 0; f < rowDef.frames; f++) {
        const fx = f * frameW, fy = rowIdx * frameH;
        gfx.clear();
        rowDef.draw(gfx, fx, fy, frameW, frameH, f, rowDef.frames);
        rt.draw(gfx, 0, 0);
      }
    }

    gfx.destroy();

    // Convert to texture with frame data
    rt.snapshot(img => {
      const tex = this.textures.addImage(key, img);
      // Register frames: frame index = row*100 + col
      for (let r = 0; r < rows.length; r++) {
        for (let c = 0; c < rows[r].frames; c++) {
          tex.add(r * 100 + c, 0, c * frameW, r * frameH, frameW, frameH);
        }
      }
    });

    rt.destroy();
  }

  // ── Knight ────────────────────────────────────────────────────────────────
  _genKnight() {
    const FW = 32, FH = 32;
    const canvas = this.textures.createCanvas('knight', FW * 30, FH * 29);
    const ctx    = canvas.context;

    const rows = ANIM_DEFS.knight.anims;
    let rowIdx  = 0;

    for (const [name, cfg] of Object.entries(rows)) {
      for (let f = 0; f < cfg.frames; f++) {
        this._drawKnightFrame(ctx, f * FW, rowIdx * FH, FW, FH, name, f, cfg.frames);

        // Register frame
        canvas.add(rowIdx * 100 + f, 0, f * FW, rowIdx * FH, FW, FH);
      }
      rowIdx++;
    }

    canvas.refresh();
  }

  _drawKnightFrame(ctx, x, y, w, h, animName, frame, totalFrames) {
    const cx = x + w / 2, cy = y + h / 2;
    const t  = frame / Math.max(totalFrames - 1, 1);  // 0–1

    ctx.save();
    ctx.translate(cx, cy);

    // Body bob
    const bob = Math.sin(t * Math.PI * 2) * 1.5;

    // === Main body (void-black shell) ===
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.ellipse(0, 2 + bob, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shell highlight
    ctx.fillStyle = '#2a2a4a';
    ctx.beginPath();
    ctx.ellipse(-1.5, 0 + bob, 2, 3.5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // === Head / mask ===
    this._drawKnightHead(ctx, animName, bob);

    // === Cloak ===
    this._drawCloak(ctx, animName, frame, totalFrames, bob);

    // === Nail (horizontal anims) ===
    if (animName.includes('attack')) {
      this._drawNail(ctx, animName, t);
    }

    // === Soul orbs during focus ===
    if (animName.includes('focus')) {
      const r = 10 + Math.sin(t * Math.PI) * 3;
      ctx.strokeStyle = 'rgba(90,227,227,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  _drawKnightHead(ctx, animName, bob) {
    // Pale head
    ctx.fillStyle = '#e8e0d0';
    ctx.beginPath();
    ctx.ellipse(0, -6 + bob, 5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark eye-holes
    ctx.fillStyle = '#000010';
    ctx.beginPath();
    ctx.ellipse(-2, -6.5 + bob, 1.5, 1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(2, -6.5 + bob, 1.5, 1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Horns
    ctx.fillStyle = '#d0c8b8';
    ctx.beginPath();
    ctx.moveTo(-3, -9 + bob); ctx.lineTo(-2, -13 + bob); ctx.lineTo(-1, -9 + bob);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(3, -9 + bob);  ctx.lineTo(2, -13 + bob);  ctx.lineTo(1, -9 + bob);
    ctx.fill();
  }

  _drawCloak(ctx, animName, frame, total, bob) {
    const t = frame / Math.max(total - 1, 1);
    const sway = Math.sin(t * Math.PI) * 2;

    ctx.fillStyle = '#111122';
    ctx.beginPath();
    // Cloak drapes behind body
    ctx.moveTo(-5, 4 + bob);
    ctx.quadraticCurveTo(-8 + sway, 12 + bob, -4, 15 + bob);
    ctx.lineTo(4, 15 + bob);
    ctx.quadraticCurveTo(8 - sway, 12 + bob, 5, 4 + bob);
    ctx.fill();
  }

  _drawNail(ctx, animName, t) {
    ctx.save();
    ctx.strokeStyle = '#d4cfc9';
    ctx.lineWidth   = 2;
    ctx.lineCap     = 'round';

    const ext = animName === 'great_slash' ? 18 : 14;
    const swing = (t - 0.5) * Math.PI * 1.2;

    if (animName.includes('up')) {
      ctx.translate(3, -4);
      ctx.rotate(-Math.PI / 2 + swing * 0.3);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(0, -ext);
      ctx.stroke();
    } else if (animName.includes('down')) {
      ctx.translate(3, 6);
      ctx.rotate(Math.PI / 2 + swing * 0.3);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(0, -ext);
      ctx.stroke();
    } else {
      ctx.translate(4, 0);
      ctx.rotate(swing);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(ext, 0);
      ctx.stroke();
      // Nail tip
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ext - 2, -1, 3, 2);
    }
    ctx.restore();
  }

  // ── Crawler ───────────────────────────────────────────────────────────────
  _genCrawler() {
    const FW = 28, FH = 20;
    const rows = ANIM_DEFS.crawler.anims;
    const canvas = this.textures.createCanvas('crawler', FW * 10, FH * Object.keys(rows).length);
    const ctx = canvas.context;
    let ri = 0;
    for (const [name, cfg] of Object.entries(rows)) {
      for (let f = 0; f < cfg.frames; f++) {
        this._drawCrawlerFrame(ctx, f * FW, ri * FH, FW, FH, name, f, cfg.frames);
        canvas.add(ri * 100 + f, 0, f * FW, ri * FH, FW, FH);
      }
      ri++;
    }
    canvas.refresh();
  }

  _drawCrawlerFrame(ctx, x, y, w, h, anim, f, total) {
    const cx = x + w / 2, cy = y + h / 2;
    const t  = f / Math.max(total - 1, 1);
    const bob = Math.sin(t * Math.PI * 4) * 1;
    ctx.save(); ctx.translate(cx, cy);

    // Legs (6 legs, alternating)
    ctx.strokeStyle = '#2a4a2a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const lx = -8 + i * 8;
      const phase = (i % 2 === 0) ? t : 1 - t;
      const footY = 6 + Math.sin(phase * Math.PI * 2) * 2;
      ctx.beginPath(); ctx.moveTo(lx, 2 + bob); ctx.lineTo(lx - 3, footY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lx, 2 + bob); ctx.lineTo(lx + 3, footY); ctx.stroke();
    }

    // Body — segmented
    ctx.fillStyle = '#1e3a1e';
    ctx.beginPath(); ctx.ellipse(0, 0 + bob, 10, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a5a2a';
    ctx.beginPath(); ctx.ellipse(5, 0 + bob, 5, 5, 0, 0, Math.PI * 2); ctx.fill();

    // Head with mandibles
    ctx.fillStyle = '#1e3a1e';
    ctx.beginPath(); ctx.ellipse(10, 0 + bob, 5, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a8a3a';
    ctx.beginPath(); ctx.ellipse(12, -2 + bob, 1.5, 1.5, 0, 0, Math.PI * 2); ctx.fill();

    // Mandibles
    ctx.strokeStyle = '#2a5a2a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(14, -1 + bob); ctx.lineTo(17, -3 + bob); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14,  1 + bob); ctx.lineTo(17,  3 + bob); ctx.stroke();

    // Shell highlight
    ctx.fillStyle = 'rgba(80,160,80,0.15)';
    ctx.beginPath(); ctx.ellipse(-2, -2 + bob, 4, 2, -0.3, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  // ── Spitter ───────────────────────────────────────────────────────────────
  _genSpitter() {
    const FW = 28, FH = 24;
    const rows = ANIM_DEFS.spitter.anims;
    const canvas = this.textures.createCanvas('spitter', FW * 10, FH * Object.keys(rows).length);
    const ctx = canvas.context;
    let ri = 0;
    for (const [name, cfg] of Object.entries(rows)) {
      for (let f = 0; f < cfg.frames; f++) {
        this._drawSpitterFrame(ctx, f * FW, ri * FH, FW, FH, name, f, cfg.frames);
        canvas.add(ri * 100 + f, 0, f * FW, ri * FH, FW, FH);
      }
      ri++;
    }
    canvas.refresh();
  }

  _drawSpitterFrame(ctx, x, y, w, h, anim, f, total) {
    const t = f / Math.max(total - 1, 1);
    const cx = x + w / 2, cy = y + h * 0.55;
    ctx.save(); ctx.translate(cx, cy);

    // Fat body
    const puff = anim.includes('spit') ? 1 + Math.sin(t * Math.PI) * 0.15 : 1;
    ctx.fillStyle = '#1a3a1a';
    ctx.beginPath(); ctx.ellipse(0, 0, 10 * puff, 8, 0, 0, Math.PI * 2); ctx.fill();

    // Head
    ctx.fillStyle = '#1e4a1e';
    ctx.beginPath(); ctx.ellipse(8, -2, 6, 6, 0, 0, Math.PI * 2); ctx.fill();

    // Eyes (infection-orange glow)
    ctx.fillStyle = '#ff8800';
    ctx.beginPath(); ctx.arc(9, -3, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath(); ctx.arc(9, -3, 0.6, 0, Math.PI * 2); ctx.fill();

    // Acid sac
    ctx.fillStyle = 'rgba(100,255,60,0.25)';
    ctx.beginPath(); ctx.ellipse(-2, 1, 5, 4, 0, 0, Math.PI * 2); ctx.fill();

    // Spit arc
    if (anim.includes('spit') && t > 0.5) {
      ctx.fillStyle = '#88ff44';
      ctx.beginPath(); ctx.arc(13, -5 - (anim.includes('up') ? 4 : 0), 2.5, 0, Math.PI * 2); ctx.fill();
    }

    ctx.restore();
  }

  // ── Flying Scout ──────────────────────────────────────────────────────────
  _genFlyingScout() {
    const FW = 24, FH = 22;
    const rows = ANIM_DEFS.flying_scout.anims;
    const canvas = this.textures.createCanvas('flying_scout', FW * 8, FH * Object.keys(rows).length);
    const ctx = canvas.context;
    let ri = 0;
    for (const [name, cfg] of Object.entries(rows)) {
      for (let f = 0; f < cfg.frames; f++) {
        this._drawFlyingFrame(ctx, f * FW, ri * FH, FW, FH, name, f, cfg.frames);
        canvas.add(ri * 100 + f, 0, f * FW, ri * FH, FW, FH);
      }
      ri++;
    }
    canvas.refresh();
  }

  _drawFlyingFrame(ctx, x, y, w, h, anim, f, total) {
    const t = f / Math.max(total - 1, 1);
    const cx = x + w / 2, cy = y + h / 2;
    ctx.save(); ctx.translate(cx, cy);

    const wingBeat = Math.sin(t * Math.PI * 2);
    const isDiving = anim === 'dive';

    // Wings
    ctx.fillStyle = 'rgba(180,255,180,0.5)';
    const wy = isDiving ? 0 : wingBeat * 5;
    ctx.beginPath();
    ctx.moveTo(-2, 0); ctx.quadraticCurveTo(-10, wy - 4, -12, wy);
    ctx.quadraticCurveTo(-8, wy + 4, -2, 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2, 0); ctx.quadraticCurveTo(10, wy - 4, 12, wy);
    ctx.quadraticCurveTo(8, wy + 4, 2, 2); ctx.fill();

    // Body
    const lean = isDiving ? 0.5 : 0;
    ctx.save(); ctx.rotate(lean);
    ctx.fillStyle = '#1a2a1a';
    ctx.beginPath(); ctx.ellipse(0, 0, 5, 7, 0, 0, Math.PI * 2); ctx.fill();

    // Head
    ctx.fillStyle = '#2a4a2a';
    ctx.beginPath(); ctx.arc(0, -6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff8800';
    ctx.beginPath(); ctx.arc(-1.5, -6.5, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(1.5, -6.5, 1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // ── NPCs ──────────────────────────────────────────────────────────────────
  _genNPCs() {
    this._genNPC('quirrel',  '#2a3a5a', '#5a6a8a', 4, 26);
    this._genNPC('elderbug', '#3a3a2a', '#6a6a4a', 4, 24);
    this._genShade();
  }

  _genNPC(key, bodyColor, headColor, rows, fh) {
    const FW = 28, FH = fh;
    const canvas = this.textures.createCanvas(key, FW * 8, FH * rows);
    const ctx = canvas.context;

    for (let ri = 0; ri < rows; ri++) {
      const frames = 4 + ri * 2;
      for (let f = 0; f < 8; f++) {
        if (f >= frames) break;
        const t = f / Math.max(frames - 1, 1);
        const cx = f * FW + FW / 2, cy = ri * FH + FH * 0.6;
        ctx.save(); ctx.translate(cx, cy);

        const bob = Math.sin(t * Math.PI * 2) * 0.8;
        ctx.fillStyle = bodyColor;
        ctx.beginPath(); ctx.ellipse(0, 2 + bob, 7, 9, 0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = headColor;
        ctx.beginPath(); ctx.arc(0, -5 + bob, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(-2, -5.5 + bob, 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(2, -5.5 + bob, 1, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
        canvas.add(ri * 100 + f, 0, f * FW, ri * FH, FW, FH);
      }
    }
    canvas.refresh();
  }

  _genShade() {
    const FW = 32, FH = 32;
    const rows = ANIM_DEFS.shade.anims;
    const canvas = this.textures.createCanvas('shade', FW * 8, FH * Object.keys(rows).length);
    const ctx = canvas.context;
    let ri = 0;
    for (const [name, cfg] of Object.entries(rows)) {
      for (let f = 0; f < cfg.frames; f++) {
        const t = f / Math.max(cfg.frames - 1, 1);
        const cx = f * FW + FW / 2, cy = ri * FH + FH / 2;
        ctx.save(); ctx.translate(cx, cy);

        // Smoky void form
        const pulse = 1 + Math.sin(t * Math.PI * 2) * 0.05;
        const alpha = 0.7 + Math.sin(t * Math.PI * 4) * 0.15;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#050510';
        ctx.beginPath(); ctx.ellipse(0, 0, 8 * pulse, 10 * pulse, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(50,50,120,0.4)';
        ctx.beginPath(); ctx.ellipse(-2, -2, 3, 4, -0.3, 0, Math.PI * 2); ctx.fill();

        // Void-white eyes
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(-2, -2, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(2, -2, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(-2, -2, 0.7, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(2, -2, 0.7, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
        canvas.add(ri * 100 + f, 0, f * FW, ri * FH, FW, FH);
      }
      ri++;
    }
    canvas.refresh();
  }

  // ── Effects ───────────────────────────────────────────────────────────────
  _genEffects() {
    this._genSlashEffect();
    this._genGeo();
    this._genParticles();
    this._genFireball();
    this._genAcidBlob();
  }

  _genSlashEffect() {
    const FW = 48, FH = 20;
    const canvas = this.textures.createCanvas('slash_effect', FW * 6, FH * 5);
    const ctx = canvas.context;

    const rows = [
      { name: 'slash_h',    frames: 5, angle: 0 },
      { name: 'slash_v',    frames: 5, angle: Math.PI / 2 },
      { name: 'slash_up',   frames: 5, angle: -Math.PI / 4 },
      { name: 'slash_down', frames: 5, angle: Math.PI / 4 },
      { name: 'great_slash',frames: 6, angle: 0, scale: 1.4 },
    ];

    for (let ri = 0; ri < rows.length; ri++) {
      const row = rows[ri];
      for (let f = 0; f < row.frames; f++) {
        const t   = f / Math.max(row.frames - 1, 1);
        const cx  = f * FW + FW / 2, cy = ri * FH + FH / 2;
        const sc  = row.scale ?? 1;
        const alpha = 1 - t * 0.8;
        const len   = (0.3 + t * 0.7) * 20 * sc;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(row.angle);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#d4cfc9';
        ctx.lineWidth = 2.5 - t * 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-len, 0); ctx.lineTo(len, 0);
        ctx.stroke();

        // Shockwave arc
        ctx.strokeStyle = 'rgba(212,207,201,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, len * 0.6, -0.4, 0.4);
        ctx.stroke();
        ctx.restore();

        canvas.add(ri * 100 + f, 0, f * FW, ri * FH, FW, FH);
      }
    }
    canvas.refresh();
  }

  _genGeo() {
    const FW = 8, FH = 8;
    const canvas = this.textures.createCanvas('geo', FW * 6, FH * 3);
    const ctx = canvas.context;

    const sizes = [[3, '#e8c84a'], [4, '#e8c84a'], [5, '#f8d86a']];
    for (let ri = 0; ri < 3; ri++) {
      const [r, col] = sizes[ri];
      for (let f = 0; f < 6; f++) {
        const t  = f / 5;
        const cx = f * FW + FW / 2, cy = ri * FH + FH / 2;
        const rot = t * Math.PI * 2;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(0, -r); ctx.lineTo(r * 0.7, 0);
        ctx.lineTo(0, r);  ctx.lineTo(-r * 0.7, 0);
        ctx.closePath(); ctx.fill();
        ctx.restore();
        canvas.add(ri * 100 + f, 0, f * FW, ri * FH, FW, FH);
      }
    }
    canvas.refresh();
  }

  _genParticles() {
    const gen = (key, size, drawFn) => {
      const canvas = this.textures.createCanvas(key, size, size);
      const ctx = canvas.context;
      drawFn(ctx, size);
      canvas.refresh();
    };

    gen('particle', 8, (ctx, s) => {
      const g = ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0,0,s,s);
    });

    gen('particle_soul', 8, (ctx, s) => {
      const g = ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
      g.addColorStop(0, 'rgba(90,227,227,1)');
      g.addColorStop(1, 'rgba(90,227,227,0)');
      ctx.fillStyle = g; ctx.fillRect(0,0,s,s);
    });

    gen('particle_geo', 6, (ctx, s) => {
      const g = ctx.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
      g.addColorStop(0, 'rgba(232,200,74,1)');
      g.addColorStop(1, 'rgba(232,200,74,0)');
      ctx.fillStyle = g; ctx.fillRect(0,0,s,s);
    });
  }

  _genFireball() {
    const FW = 16, FH = 10;
    const canvas = this.textures.createCanvas('fireball', FW * 6, FH * 2);
    const ctx = canvas.context;

    // Travel
    for (let f = 0; f < 4; f++) {
      const t = f / 3;
      const cx = f * FW + FW / 2, cy = FH / 2;
      ctx.save(); ctx.translate(cx, cy);
      ctx.fillStyle = '#5ae3e3';
      ctx.beginPath(); ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(90,227,227,0.4)';
      ctx.beginPath(); ctx.ellipse(-3 - t * 2, 0, 3 + t * 2, 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      canvas.add(f, 0, f * FW, 0, FW, FH);
    }

    // Burst
    for (let f = 0; f < 6; f++) {
      const t = f / 5;
      const cx = f * FW + FW / 2, cy = FH * 1.5;
      ctx.save(); ctx.translate(cx, cy);
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = '#5ae3e3';
      ctx.beginPath(); ctx.arc(0, 0, 3 + t * 5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      canvas.add(100 + f, 0, f * FW, FH, FW, FH);
    }
    canvas.refresh();
  }

  _genAcidBlob() {
    const S = 10;
    const canvas = this.textures.createCanvas('acid_blob', S, S);
    const ctx = canvas.context;
    ctx.fillStyle = '#88ff44';
    ctx.beginPath(); ctx.arc(S/2, S/2, S/2 - 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(200,255,100,0.6)';
    ctx.beginPath(); ctx.arc(S/2 - 1.5, S/2 - 1.5, 2, 0, Math.PI * 2); ctx.fill();
    canvas.refresh();
  }

  // ── Tiles ─────────────────────────────────────────────────────────────────
  _genUI() {
    // Bench
    const bc = this.textures.createCanvas('bench', 24, 16);
    const bctx = bc.context;
    bctx.fillStyle = '#3a3a2a';
    bctx.fillRect(2, 6, 20, 8);
    bctx.fillStyle = '#5a5a3a';
    bctx.fillRect(2, 4, 20, 4);
    bctx.fillStyle = '#2a2a1a';
    bctx.fillRect(2, 12, 4, 4);
    bctx.fillRect(18, 12, 4, 4);
    bc.refresh();

    // Lore tablet
    const lt = this.textures.createCanvas('lore_tablet', 14, 20);
    const lctx = lt.context;
    lctx.fillStyle = '#3a3a4a';
    lctx.fillRect(1, 0, 12, 18);
    lctx.fillStyle = '#5a5a6a';
    lctx.fillRect(2, 1, 10, 1);
    lctx.fillRect(2, 3, 8, 1);
    lctx.fillRect(2, 5, 9, 1);
    lctx.fillRect(2, 7, 7, 1);
    lt.refresh();
  }

  _genTiles() {
    const TS = C.TILE_SIZE;

    // Stone floor tile
    const floor = this.textures.createCanvas('tile_floor', TS * 4, TS);
    const fctx = floor.context;
    for (let i = 0; i < 4; i++) {
      const x = i * TS;
      fctx.fillStyle = '#1a1a22';
      fctx.fillRect(x, 0, TS, TS);
      fctx.fillStyle = '#2a2a32';
      fctx.fillRect(x, 0, TS, 2);  // top edge highlight
      // Cracks
      fctx.strokeStyle = '#111118';
      fctx.lineWidth = 0.5;
      if (i % 2 === 0) {
        fctx.beginPath();
        fctx.moveTo(x + 3, 4); fctx.lineTo(x + 7, 10);
        fctx.stroke();
      }
      floor.add(i, 0, x, 0, TS, TS);
    }
    floor.refresh();

    // Stone wall tile
    const wall = this.textures.createCanvas('tile_wall', TS * 4, TS);
    const wctx = wall.context;
    for (let i = 0; i < 4; i++) {
      const x = i * TS;
      wctx.fillStyle = '#141420';
      wctx.fillRect(x, 0, TS, TS);
      wctx.fillStyle = '#1e1e2e';
      wctx.fillRect(x, 0, TS - 1, 1);
      wctx.fillRect(x, 0, 1, TS - 1);
      wall.add(i, 0, x, 0, TS, TS);
    }
    wall.refresh();

    // Background (parallax layer, darker)
    const bg = this.textures.createCanvas('bg_cave', 80, 60);
    const bgctx = bg.context;
    bgctx.fillStyle = '#0a0a12';
    bgctx.fillRect(0, 0, 80, 60);
    // Distant stalactites
    bgctx.fillStyle = '#111118';
    for (let i = 0; i < 5; i++) {
      const bx = i * 16 + 4;
      bgctx.beginPath();
      bgctx.moveTo(bx, 0); bgctx.lineTo(bx + 4, 0);
      bgctx.lineTo(bx + 2, 8 + i * 2);
      bgctx.fill();
    }
    bg.refresh();

    // Hazard tile — acid
    const acid = this.textures.createCanvas('tile_acid', TS * 4, TS);
    const actx = acid.context;
    for (let i = 0; i < 4; i++) {
      const ax = i * TS;
      actx.fillStyle = '#1a3a0a';
      actx.fillRect(ax, 0, TS, TS);
      actx.fillStyle = '#2a5a10';
      actx.fillRect(ax, 0, TS, 3);
      // Bubbles
      actx.fillStyle = 'rgba(80,200,40,0.4)';
      actx.beginPath();
      actx.arc(ax + 4 + (i * 3 % 8), 8, 1.5, 0, Math.PI * 2);
      actx.fill();
      acid.add(i, 0, ax, 0, TS, TS);
    }
    acid.refresh();

    // Spike tile
    const spikes = this.textures.createCanvas('tile_spike', TS * 4, TS);
    const sctx = spikes.context;
    for (let i = 0; i < 4; i++) {
      const sx = i * TS;
      sctx.fillStyle = '#2a2a2a';
      sctx.fillRect(sx, TS - 4, TS, 4);
      sctx.fillStyle = '#8a8a8a';
      for (let s = 0; s < 3; s++) {
        const bx = sx + s * 5 + 1;
        sctx.beginPath();
        sctx.moveTo(bx, TS - 3); sctx.lineTo(bx + 2.5, 0); sctx.lineTo(bx + 5, TS - 3);
        sctx.fill();
      }
      spikes.add(i, 0, sx, 0, TS, TS);
    }
    spikes.refresh();
  }
}

// ── Phase II texture generation (appended) ───────────────────────────────

const _origPreloadCreate = PreloadScene.prototype.create;
PreloadScene.prototype.create = function() {
  _origPreloadCreate.call(this);
  this._genPhase2Textures();
};

PreloadScene.prototype._genPhase2Textures = function() {
  this._genFalseKnight();
  this._genGruzMother();
  this._genVengeflyKing();
  this._genMosscreep();
  this._genVengefly();
  this._genAspid();
  this._genDreamNail();
  this._genShockwave();
  this._genGreenTiles();
};

PreloadScene.prototype._genFalseKnight = function() {
  const FW = 56, FH = 56;
  const rows = ANIM_DEFS.false_knight.anims;
  const canvas = this.textures.createCanvas('false_knight', FW * 10, FH * Object.keys(rows).length);
  const ctx = canvas.context;
  let ri = 0;
  for (const [name, cfg] of Object.entries(rows)) {
    for (let f = 0; f < cfg.frames; f++) {
      this._drawFKFrame(ctx, f * FW, ri * FH, FW, FH, name, f, cfg.frames);
      canvas.add(ri * 100 + f, 0, f * FW, ri * FH, FW, FH);
    }
    ri++;
  }
  canvas.refresh();
};

PreloadScene.prototype._drawFKFrame = function(ctx, x, y, w, h, anim, f, total) {
  const t  = f / Math.max(total - 1, 1);
  const cx = x + w / 2, cy = y + h * 0.55;
  ctx.save(); ctx.translate(cx, cy);

  const isRage = anim === 'rage_idle';
  const isStagger = anim === 'stagger';
  const bodyCol  = isRage ? '#8a3a0a' : '#4a3a2a';
  const shellCol = isRage ? '#cc6622' : '#7a6a5a';
  const sway = Math.sin(t * Math.PI * 2) * (anim.includes('walk') ? 2 : 0);

  // Mace weapon
  if (anim !== 'death') {
    ctx.fillStyle = '#5a5a5a';
    const maceX = 18 + sway;
    ctx.fillRect(maceX, -20, 5, 28);
    ctx.fillStyle = '#888';
    ctx.beginPath(); ctx.arc(maceX + 2, -22, 7, 0, Math.PI * 2); ctx.fill();
    // Spikes
    ctx.fillStyle = '#aaa';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.fillRect(maceX + 2 + Math.cos(a) * 6, -22 + Math.sin(a) * 6, 2, 2);
    }
  }

  // Massive armoured body
  ctx.fillStyle = bodyCol;
  ctx.beginPath(); ctx.ellipse(0, 2, 20, 22, 0, 0, Math.PI * 2); ctx.fill();

  // Shoulder plates
  ctx.fillStyle = shellCol;
  ctx.beginPath(); ctx.ellipse(-16, -8, 8, 5, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(16, -8, 8, 5, 0.4, 0, Math.PI * 2); ctx.fill();

  // Helm
  ctx.fillStyle = shellCol;
  ctx.beginPath(); ctx.ellipse(0, -14, 14, 12, 0, 0, Math.PI * 2); ctx.fill();
  // Dents
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(-5, -16, 3, 5); ctx.fillRect(3, -14, 3, 4);

  // Visor glow (infection orange)
  const glowAlpha = isRage ? 0.9 : (0.5 + Math.sin(t * Math.PI * 2) * 0.2);
  ctx.fillStyle = `rgba(255,140,0,${glowAlpha})`;
  ctx.beginPath(); ctx.ellipse(-4, -14, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4, -14, 3, 2, 0, 0, Math.PI * 2); ctx.fill();

  // Stagger — crack effect
  if (isStagger) {
    ctx.strokeStyle = 'rgba(200,100,0,0.6)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-5, -20); ctx.lineTo(0, -5); ctx.lineTo(5, -10); ctx.stroke();
  }

  ctx.restore();
};

PreloadScene.prototype._genGruzMother = function() {
  const FW = 50, FH = 50;
  const rows = ANIM_DEFS.gruz_mother.anims;
  const canvas = this.textures.createCanvas('gruz_mother', FW * 10, FH * Object.keys(rows).length);
  const ctx = canvas.context;
  let ri = 0;
  for (const [name, cfg] of Object.entries(rows)) {
    for (let f = 0; f < cfg.frames; f++) {
      const t = f / Math.max(cfg.frames - 1, 1);
      const cx = f * FW + FW / 2, cy = ri * FH + FH / 2;
      ctx.save(); ctx.translate(cx, cy);
      const wingBeat = Math.sin(t * Math.PI * 2);
      const isBaby = name === 'baby';
      const scale = isBaby ? 0.35 : 1;
      ctx.scale(scale, scale);

      // Wings
      ctx.fillStyle = 'rgba(100,200,80,0.4)';
      ctx.beginPath(); ctx.moveTo(-5,0); ctx.quadraticCurveTo(-22, wingBeat*8-8, -24, wingBeat*8); ctx.quadraticCurveTo(-16,wingBeat*8+6,-5,4); ctx.fill();
      ctx.beginPath(); ctx.moveTo(5,0); ctx.quadraticCurveTo(22, wingBeat*8-8, 24, wingBeat*8); ctx.quadraticCurveTo(16,wingBeat*8+6,5,4); ctx.fill();

      // Fat round body
      ctx.fillStyle = '#2a3a1a'; ctx.beginPath(); ctx.ellipse(0, 4, 16, 18, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#3a5a2a'; ctx.beginPath(); ctx.ellipse(0, 0, 14, 15, 0, 0, Math.PI*2); ctx.fill();

      // Head
      ctx.fillStyle = '#2a4a1a'; ctx.beginPath(); ctx.arc(0, -12, 10, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(-3,-13,2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(3,-13,2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.arc(-3,-13,0.8,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(3,-13,0.8,0,Math.PI*2); ctx.fill();

      ctx.restore();
      canvas.add(ri * 100 + f, 0, f * FW, ri * FH, FW, FH);
    }
    ri++;
  }
  canvas.refresh();
};

PreloadScene.prototype._genVengeflyKing = function() {
  const FW = 38, FH = 36;
  const rows = ANIM_DEFS.vengefly_king.anims;
  const canvas = this.textures.createCanvas('vengefly_king', FW * 8, FH * Object.keys(rows).length);
  const ctx = canvas.context;
  let ri = 0;
  for (const [name, cfg] of Object.entries(rows)) {
    for (let f = 0; f < cfg.frames; f++) {
      const t = f / Math.max(cfg.frames - 1, 1);
      const cx = f * FW + FW/2, cy = ri * FH + FH/2;
      ctx.save(); ctx.translate(cx, cy);
      const beat = Math.sin(t * Math.PI * 2);

      // Crown
      ctx.fillStyle = '#aa8800';
      ctx.beginPath(); ctx.moveTo(-8,-14); ctx.lineTo(-6,-8); ctx.lineTo(-3,-13); ctx.lineTo(0,-8); ctx.lineTo(3,-13); ctx.lineTo(6,-8); ctx.lineTo(8,-14); ctx.fill();

      // Wings
      ctx.fillStyle = 'rgba(150,220,150,0.5)';
      ctx.beginPath(); ctx.moveTo(-3,0); ctx.quadraticCurveTo(-16, beat*6-6, -18, beat*6); ctx.quadraticCurveTo(-12,beat*6+4,-3,3); ctx.fill();
      ctx.beginPath(); ctx.moveTo(3,0); ctx.quadraticCurveTo(16, beat*6-6, 18, beat*6); ctx.quadraticCurveTo(12,beat*6+4,3,3); ctx.fill();

      // Body
      ctx.fillStyle = '#1a3a1a'; ctx.beginPath(); ctx.ellipse(0, 1, 9, 12, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#2a5a2a'; ctx.beginPath(); ctx.arc(0,-7,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(-2.5,-7.5,1.8,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(2.5,-7.5,1.8,0,Math.PI*2); ctx.fill();

      ctx.restore();
      canvas.add(ri * 100 + f, 0, f * FW, ri * FH, FW, FH);
    }
    ri++;
  }
  canvas.refresh();
};

PreloadScene.prototype._genMosscreep = function() {
  const FW = 26, FH = 20;
  const rows = ANIM_DEFS.mosscreep.anims;
  const canvas = this.textures.createCanvas('mosscreep', FW * 8, FH * Object.keys(rows).length);
  const ctx = canvas.context;
  let ri = 0;
  for (const [name, cfg] of Object.entries(rows)) {
    for (let f = 0; f < cfg.frames; f++) {
      const t = f / Math.max(cfg.frames - 1, 1);
      const cx = f * FW + FW/2, cy = ri * FH + FH * 0.55;
      ctx.save(); ctx.translate(cx, cy);
      const bob = Math.sin(t * Math.PI * 4) * 1;

      // Legs
      ctx.strokeStyle = '#2a5a1a'; ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const lx = -6 + i * 6;
        const phase = i%2===0?t:1-t;
        const fy = 6 + Math.sin(phase*Math.PI*2)*2;
        ctx.beginPath(); ctx.moveTo(lx, 2+bob); ctx.lineTo(lx-2,fy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx, 2+bob); ctx.lineTo(lx+2,fy); ctx.stroke();
      }

      // Mossy shell
      ctx.fillStyle = '#1a3a0a'; ctx.beginPath(); ctx.ellipse(0,0+bob,10,6,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#3a7a1a'; ctx.beginPath(); ctx.ellipse(4,0+bob,5,5,0,0,Math.PI*2); ctx.fill();
      // Moss tufts
      ctx.fillStyle = '#4a9a2a';
      ctx.fillRect(-4,-3+bob,3,3); ctx.fillRect(1,-4+bob,3,3); ctx.fillRect(-1,-2+bob,2,2);
      // Head
      ctx.fillStyle = '#1a3a0a'; ctx.beginPath(); ctx.arc(9,0+bob,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(10,-1+bob,1,0,Math.PI*2); ctx.fill();

      ctx.restore();
      canvas.add(ri * 100 + f, 0, f * FW, ri * FH, FW, FH);
    }
    ri++;
  }
  canvas.refresh();
};

PreloadScene.prototype._genVengefly = function() {
  const FW = 20, FH = 18;
  const rows = ANIM_DEFS.vengefly.anims;
  const canvas = this.textures.createCanvas('vengefly', FW * 6, FH * Object.keys(rows).length);
  const ctx = canvas.context;
  let ri = 0;
  for (const [name, cfg] of Object.entries(rows)) {
    for (let f = 0; f < cfg.frames; f++) {
      const t = f / Math.max(cfg.frames - 1, 1);
      const cx = f * FW + FW/2, cy = ri * FH + FH/2;
      ctx.save(); ctx.translate(cx, cy);
      const beat = Math.sin(t * Math.PI * 2);

      ctx.fillStyle = 'rgba(150,220,120,0.45)';
      ctx.beginPath(); ctx.moveTo(-2,0); ctx.quadraticCurveTo(-10,beat*4-4,-12,beat*4); ctx.quadraticCurveTo(-8,beat*4+3,-2,2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(2,0); ctx.quadraticCurveTo(10,beat*4-4,12,beat*4); ctx.quadraticCurveTo(8,beat*4+3,2,2); ctx.fill();

      ctx.fillStyle = '#1a3a0a'; ctx.beginPath(); ctx.ellipse(0,1,5,6,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#2a5a1a'; ctx.beginPath(); ctx.arc(0,-4,4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(-1.5,-4.5,1,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(1.5,-4.5,1,0,Math.PI*2); ctx.fill();

      ctx.restore();
      canvas.add(ri * 100 + f, 0, f * FW, ri * FH, FW, FH);
    }
    ri++;
  }
  canvas.refresh();
};

PreloadScene.prototype._genAspid = function() {
  const FW = 24, FH = 20;
  const rows = ANIM_DEFS.aspid.anims;
  const canvas = this.textures.createCanvas('aspid', FW * 8, FH * Object.keys(rows).length);
  const ctx = canvas.context;
  let ri = 0;
  for (const [name, cfg] of Object.entries(rows)) {
    for (let f = 0; f < cfg.frames; f++) {
      const t = f / Math.max(cfg.frames - 1, 1);
      const cx = f * FW + FW/2, cy = ri * FH + FH * 0.55;
      ctx.save(); ctx.translate(cx, cy);

      ctx.fillStyle = '#2a1a3a'; ctx.beginPath(); ctx.ellipse(0,1,9,6,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#3a2a5a'; ctx.beginPath(); ctx.arc(7,0,6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#88ff44'; ctx.beginPath(); ctx.arc(9,-1,1.5,0,Math.PI*2); ctx.fill();

      if (name === 'shoot' && t > 0.4) {
        ctx.fillStyle = '#88ff44';
        ctx.beginPath(); ctx.arc(13, -2, 2, 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();
      canvas.add(ri * 100 + f, 0, f * FW, ri * FH, FW, FH);
    }
    ri++;
  }
  canvas.refresh();
};

PreloadScene.prototype._genDreamNail = function() {
  const FW = 48, FH = 24;
  const rows = ANIM_DEFS.dream_nail.anims;
  const canvas = this.textures.createCanvas('dream_nail', FW * 8, FH * Object.keys(rows).length);
  const ctx = canvas.context;
  let ri = 0;
  for (const [name, cfg] of Object.entries(rows)) {
    for (let f = 0; f < cfg.frames; f++) {
      const t = f / Math.max(cfg.frames - 1, 1);
      const cx = f * FW + FW/2, cy = ri * FH + FH/2;
      ctx.save(); ctx.translate(cx, cy);
      ctx.globalAlpha = 0.8 + Math.sin(t * Math.PI) * 0.2;

      if (name === 'swing') {
        const ext = 18 * (0.3 + t * 0.7);
        const swing = (t - 0.5) * Math.PI * 1.5;
        ctx.strokeStyle = '#aaaaff'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.save(); ctx.rotate(swing);
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(ext,0); ctx.stroke();
        ctx.fillStyle = 'rgba(170,170,255,0.4)';
        ctx.beginPath(); ctx.arc(ext,0,3,0,Math.PI*2); ctx.fill();
        ctx.restore();
      } else if (name === 'charge') {
        ctx.fillStyle = `rgba(170,170,255,${0.3+t*0.5})`;
        ctx.beginPath(); ctx.arc(0,0, 5+t*8, 0, Math.PI*2); ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(200,200,255,0.8)';
        ctx.beginPath(); ctx.arc(0,0, 4, 0, Math.PI*2); ctx.fill();
      }

      ctx.restore();
      canvas.add(ri * 100 + f, 0, f * FW, ri * FH, FW, FH);
    }
    ri++;
  }
  canvas.refresh();
};

PreloadScene.prototype._genShockwave = function() {
  const FW = 80, FH = 20;
  const canvas = this.textures.createCanvas('shockwave', FW * 6, FH);
  const ctx = canvas.context;
  for (let f = 0; f < 6; f++) {
    const t = f / 5;
    const cx = f * FW + FW/2, cy = FH/2;
    ctx.globalAlpha = 1 - t * 0.8;
    ctx.strokeStyle = '#5566ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(cx, cy, (t * 36) + 4, 4 + t*2, 0, 0, Math.PI*2); ctx.stroke();
    ctx.strokeStyle = 'rgba(150,170,255,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy, (t * 44) + 2, 2, 0, 0, Math.PI*2); ctx.stroke();
    canvas.add(f, 0, f * FW, 0, FW, FH);
  }
  ctx.globalAlpha = 1;
  canvas.refresh();
};

PreloadScene.prototype._genGreenTiles = function() {
  const TS = C.TILE_SIZE;

  // Greenpath floor — mossy green stone
  const gfloor = this.textures.createCanvas('tile_green_floor', TS * 4, TS);
  const gf = gfloor.context;
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    gf.fillStyle = '#1a2a0a'; gf.fillRect(x, 0, TS, TS);
    gf.fillStyle = '#2a4a0a'; gf.fillRect(x, 0, TS, 3);
    gf.fillStyle = 'rgba(60,120,20,0.4)';
    gf.fillRect(x+2, 1, 4, 2); gf.fillRect(x+9, 0, 3, 2);
    gfloor.add(i, 0, x, 0, TS, TS);
  }
  gfloor.refresh();

  // Greenpath wall
  const gwall = this.textures.createCanvas('tile_green_wall', TS * 4, TS);
  const gw = gwall.context;
  for (let i = 0; i < 4; i++) {
    const x = i * TS;
    gw.fillStyle = '#111a08'; gw.fillRect(x, 0, TS, TS);
    gw.fillStyle = '#1a2a0a'; gw.fillRect(x, 0, TS-1, 1); gw.fillRect(x, 0, 1, TS-1);
    gwall.add(i, 0, x, 0, TS, TS);
  }
  gwall.refresh();

  // Greenpath background (lush vines)
  const gbg = this.textures.createCanvas('bg_greenpath', 80, 60);
  const gb = gbg.context;
  gb.fillStyle = '#0a1208'; gb.fillRect(0, 0, 80, 60);
  gb.strokeStyle = '#1a3a08'; gb.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    gb.beginPath(); gb.moveTo(i*22+5, 0);
    gb.quadraticCurveTo(i*22+15, 30, i*22+5, 60); gb.stroke();
  }
  gbg.refresh();
};
