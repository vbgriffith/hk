/**
 * Palette — color systems per layer, degrading toward monochrome as depth increases.
 * Corruption value (0–1) further desaturates and shifts colors.
 */
const Palette = (function () {
  // Layer 0: CadenceOS — warm off-white, slate, amber accent, muted teal
  const LAYER_0 = {
    bg:         0x1c1c1e,   // near-black OS desktop
    surface:    0x2c2c2e,   // window chrome
    surfaceAlt: 0x3a3a3c,   // hover/active
    border:     0x48484a,   // dividers
    text:       0xe5e0d5,   // warm white text
    textDim:    0x8e8e93,   // secondary text
    accent:     0xd4a853,   // amber — Maren's highlight color
    accentAlt:  0x5e9e8a,   // muted teal — links
    error:      0xc0392b,
    success:    0x27ae60,
    cursor:     0xd4a853,
    taskbar:    0x111113,
    shadow:     0x00000066,
  };

  // Layer 1: PILGRIM — bright, slightly overripe Flash-era palette
  const LAYER_1 = {
    sky:        0x6ec6e8,
    skyDark:    0x3a8fbf,
    ground:     0x7bc67e,
    groundDark: 0x4a9e50,
    stone:      0xc8b89a,
    stoneDark:  0x9a8870,
    wood:       0x8b5e3c,
    accent:     0xe8c84a,   // golden
    accentAlt:  0xe05c3a,   // Oswin red
    text:       0x1a1208,
    textLight:  0xf5f0e0,
    ui:         0xf0e8cc,
    uiBorder:   0xb8a878,
    shadow:     0x1a1208,
    water:      0x4ab8e8,
  };

  // Layer 2: Workshop/IDE — dark IDE, amber text, muted highlights
  const LAYER_2 = {
    bg:         0x0d0d0f,
    gutter:     0x161618,
    line:       0x1e1e20,
    lineHover:  0x252528,
    text:       0xd4c9a8,   // warm code text
    comment:    0x6a7a6a,
    keyword:    0xc678dd,
    string:     0x98c379,
    number:     0xe5c07b,
    function_:  0x61afef,
    variable:   0xe06c75,
    accent:     0xd4a853,
    cursor:     0xd4a853,
    border:     0x2a2a2e,
    scrollbar:  0x3a3a3e,
  };

  // Layer 3: Meridian — near-monochrome, architectural, cold white on dark
  const LAYER_3 = {
    bg:         0x070810,
    grid:       0x0f1020,
    lineMain:   0xe8ecf0,   // crisp white structural lines
    lineDim:    0x3a3e50,
    lineFaint:  0x1a1e2a,
    accent:     0x7ab8d4,   // single cool blue accent
    accentGlow: 0x4a8aaa,
    text:       0xc8d0d8,
    textDim:    0x5a6070,
    cartographer: 0xe8ecf0,
    sky:        0x050608,
    fog:        0x0a0b12,
  };

  // Layer 4: Substrate — almost no color, noise, fragments
  const LAYER_4 = {
    bg:         0x040404,
    noise:      0x0a0a0a,
    fragment:   0x181818,
    accent:     0x282828,   // barely visible
    text:       0x404040,   // unreadable unless you look
    textGhost:  0x202020,
    grid:       0x0c0c0c,
    pulse:      0x505050,   // brief flashes
    white:      0xf0f0f0,   // rare, brief moments of clarity
  };

  // Corruption shift: lerps everything toward desaturated static
  function corruptColor(hex, corruption) {
    if (corruption <= 0) return hex;
    const r = (hex >> 16) & 0xff;
    const g = (hex >> 8)  & 0xff;
    const b =  hex        & 0xff;
    const grey = Math.floor(r * 0.299 + g * 0.587 + b * 0.114);
    const nr = Math.floor(r + (grey - r) * corruption * 0.6);
    const ng = Math.floor(g + (grey - g) * corruption * 0.6);
    const nb = Math.floor(b + (grey - b) * corruption * 0.6);
    return (nr << 16) | (ng << 8) | nb;
  }

  const LAYERS = [LAYER_0, LAYER_1, LAYER_2, LAYER_3, LAYER_4];

  return {
    layer(depth) {
      return LAYERS[Math.max(0, Math.min(4, depth))];
    },

    // Get a color with corruption applied
    get(depth, key) {
      const palette = this.layer(depth);
      const color = palette[key];
      if (color === undefined) return 0xffffff;
      if (depth < 3) return corruptColor(color, StateManager.get('corruption') * 0.3);
      return color;
    },

    corrupt: corruptColor,

    // For Phaser: returns 0xRRGGBB
    hex(depth, key) { return this.get(depth, key); },

    // Lerp between two hex colors by t (0..1)
    lerp(a, b, t) {
      const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
      const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
      const nr = Math.floor(ar + (br - ar) * t);
      const ng = Math.floor(ag + (bg - ag) * t);
      const nb = Math.floor(ab + (bb - ab) * t);
      return (nr << 16) | (ng << 8) | nb;
    },

    // Convert 0xRRGGBB to CSS string
    toCSS(hex) {
      return '#' + hex.toString(16).padStart(6, '0');
    },

    L0: LAYER_0,
    L1: LAYER_1,
    L2: LAYER_2,
    L3: LAYER_3,
    L4: LAYER_4,
  };
})();
