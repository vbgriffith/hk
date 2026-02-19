/**
 * Geometry — shared procedural drawing utilities for all layers.
 * All methods take a Phaser.GameObjects.Graphics instance.
 */
const Geometry = (function () {

  return {

    // Draw a rounded rectangle (Phaser doesn't make this easy procedurally)
    roundRect(g, x, y, w, h, r, fillColor, fillAlpha, strokeColor, strokeWidth) {
      if (fillColor !== undefined && fillColor !== null) {
        g.fillStyle(fillColor, fillAlpha !== undefined ? fillAlpha : 1);
      }
      if (strokeColor !== undefined && strokeWidth) {
        g.lineStyle(strokeWidth, strokeColor, 1);
      }
      r = Math.min(r, w / 2, h / 2);
      g.beginPath();
      g.moveTo(x + r, y);
      g.lineTo(x + w - r, y);
      g.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
      g.lineTo(x + w, y + h - r);
      g.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
      g.lineTo(x + r, y + h);
      g.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
      g.lineTo(x, y + r);
      g.arc(x + r, y + r, r, Math.PI, -Math.PI / 2);
      g.closePath();
      if (fillColor !== undefined && fillColor !== null) g.fillPath();
      if (strokeColor !== undefined && strokeWidth) g.strokePath();
    },

    // Draw a grid of lines (used in Layer 3 city floor)
    grid(g, x, y, w, h, cellW, cellH, color, alpha) {
      g.lineStyle(1, color, alpha || 0.3);
      for (let cx = x; cx <= x + w; cx += cellW) {
        g.beginPath(); g.moveTo(cx, y); g.lineTo(cx, y + h); g.strokePath();
      }
      for (let cy = y; cy <= y + h; cy += cellH) {
        g.beginPath(); g.moveTo(x, cy); g.lineTo(x + w, cy); g.strokePath();
      }
    },

    // Isometric tile footprint (2.5D)
    isoTile(g, cx, cy, tileW, tileH, fillTop, fillLeft, fillRight) {
      const hw = tileW / 2, hh = tileH / 2;
      // Top face
      if (fillTop !== null) {
        g.fillStyle(fillTop, 1);
        g.beginPath();
        g.moveTo(cx, cy - hh);
        g.lineTo(cx + hw, cy);
        g.lineTo(cx, cy + hh);
        g.lineTo(cx - hw, cy);
        g.closePath();
        g.fillPath();
      }
      // Left face
      if (fillLeft !== null) {
        g.fillStyle(fillLeft, 1);
        g.beginPath();
        g.moveTo(cx - hw, cy);
        g.lineTo(cx, cy + hh);
        g.lineTo(cx, cy + hh + tileH * 0.5);
        g.lineTo(cx - hw, cy + tileH * 0.5);
        g.closePath();
        g.fillPath();
      }
      // Right face
      if (fillRight !== null) {
        g.fillStyle(fillRight, 1);
        g.beginPath();
        g.moveTo(cx + hw, cy);
        g.lineTo(cx, cy + hh);
        g.lineTo(cx, cy + hh + tileH * 0.5);
        g.lineTo(cx + hw, cy + tileH * 0.5);
        g.closePath();
        g.fillPath();
      }
    },

    // Draw an isometric building (Layer 3 city)
    isoBuilding(g, cx, cy, tileW, tileH, floors, colorTop, colorLeft, colorRight) {
      const totalHeight = floors * tileH * 0.5;
      // Front left face
      g.fillStyle(colorLeft, 1);
      g.beginPath();
      g.moveTo(cx - tileW/2, cy);
      g.lineTo(cx, cy + tileH/2);
      g.lineTo(cx, cy + tileH/2 + totalHeight);
      g.lineTo(cx - tileW/2, cy + totalHeight);
      g.closePath();
      g.fillPath();
      // Front right face
      g.fillStyle(colorRight, 1);
      g.beginPath();
      g.moveTo(cx + tileW/2, cy);
      g.lineTo(cx, cy + tileH/2);
      g.lineTo(cx, cy + tileH/2 + totalHeight);
      g.lineTo(cx + tileW/2, cy + totalHeight);
      g.closePath();
      g.fillPath();
      // Top face
      g.fillStyle(colorTop, 1);
      g.beginPath();
      g.moveTo(cx, cy - tileH/2);
      g.lineTo(cx + tileW/2, cy);
      g.lineTo(cx, cy + tileH/2);
      g.lineTo(cx - tileW/2, cy);
      g.closePath();
      g.fillPath();
    },

    // Draw a scanline texture overlay
    scanlines(g, x, y, w, h, color, alpha, spacing) {
      spacing = spacing || 3;
      g.lineStyle(1, color, alpha || 0.04);
      for (let sy = y; sy < y + h; sy += spacing) {
        g.beginPath(); g.moveTo(x, sy); g.lineTo(x + w, sy); g.strokePath();
      }
    },

    // CRT vignette effect (darkens edges)
    vignette(g, x, y, w, h, strength) {
      strength = strength || 0.4;
      const steps = 12;
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const alpha = t * t * strength;
        const inset = t * Math.min(w, h) * 0.5;
        g.lineStyle(inset * 2 / steps, 0x000000, alpha);
        g.strokeRect(x + inset, y + inset, w - inset * 2, h - inset * 2);
      }
    },

    // Draw a dashed line
    dashedLine(g, x1, y1, x2, y2, dashLen, gapLen, color, alpha) {
      dashLen = dashLen || 8; gapLen = gapLen || 4;
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / len, ny = dy / len;
      let pos = 0; let drawing = true;
      g.lineStyle(1, color, alpha || 1);
      while (pos < len) {
        const seg = drawing ? dashLen : gapLen;
        const end = Math.min(pos + seg, len);
        if (drawing) {
          g.beginPath();
          g.moveTo(x1 + nx * pos, y1 + ny * pos);
          g.lineTo(x1 + nx * end, y1 + ny * end);
          g.strokePath();
        }
        pos = end;
        drawing = !drawing;
      }
    },

    // Noise-distorted horizontal line (for glitchy effects)
    noiseLine(g, x, y, w, color, alpha, noiseScale, noiseAmp, time) {
      noiseScale = noiseScale || 0.05; noiseAmp = noiseAmp || 4;
      g.lineStyle(1, color, alpha || 1);
      g.beginPath();
      for (let px = x; px < x + w; px += 2) {
        const n = Noise.simplex2(px * noiseScale, time * 0.001);
        const ny = y + n * noiseAmp;
        if (px === x) g.moveTo(px, ny); else g.lineTo(px, ny);
      }
      g.strokePath();
    },

    // A procedural "pixel font" character using rects (5×7 grid)
    // Used for Layer 4 where real fonts feel too intact
    pixelChar(g, char, x, y, size, color) {
      const maps = {
        '?': [[0,1,1,0,0],[1,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,0,0,0,0],[0,1,0,0,0]],
        '!': [[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,1,0,0,0]],
        '■': [[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]],
        '░': [[1,0,1,0,1],[0,1,0,1,0],[1,0,1,0,1],[0,1,0,1,0],[1,0,1,0,1],[0,1,0,1,0],[1,0,1,0,1]],
      };
      const map = maps[char] || maps['?'];
      g.fillStyle(color, 1);
      for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
          if (map[row][col]) {
            g.fillRect(x + col * size, y + row * size, size - 1, size - 1);
          }
        }
      }
    },

    // Window chrome for CadenceOS
    windowChrome(g, x, y, w, h, title, scene, focused) {
      const titleH = 28;
      const P = Palette.L0;

      // Shadow
      g.fillStyle(0x000000, 0.35);
      g.fillRect(x + 4, y + 4, w, h);

      // Background
      this.roundRect(g, x, y, w, h, 6, P.surface, 1);

      // Title bar
      this.roundRect(g, x, y, w, titleH, 6, focused ? P.surfaceAlt : P.surface, 1);
      g.fillStyle(P.surface, 1);
      g.fillRect(x, y + titleH - 6, w, 6);

      // Border
      this.roundRect(g, x, y, w, h, 6, null, null, focused ? P.border : 0x333335, 1);

      // Traffic lights
      const lights = [
        { cx: x + 12, color: 0xed6a5a },
        { cx: x + 28, color: 0xf5bf4f },
        { cx: x + 44, color: 0x68c65a },
      ];
      lights.forEach(l => {
        g.fillStyle(l.color, focused ? 1 : 0.35);
        g.fillCircle(l.cx, y + titleH / 2, 6);
      });

      // Title text rendered via scene
      if (scene && title) {
        const existing = scene.children.getByName('win_title_' + title);
        if (!existing) {
          scene.add.text(x + w / 2, y + titleH / 2, title, {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: Palette.toCSS(focused ? P.text : P.textDim),
            align: 'center',
          }).setOrigin(0.5, 0.5).setName('win_title_' + title).setDepth(100);
        }
      }
    },
  };
})();
