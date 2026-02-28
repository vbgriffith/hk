/**
 * js/mapGenerator.js
 * Procedural map generation engine using HTML5 Canvas.
 * Generates two map types:
 *   1. Regional overworld map (hex-based terrain with named locations)
 *   2. Dungeon / location map (room-and-corridor grid)
 *
 * No external dependencies beyond the Canvas API.
 */

const MapGenerator = (() => {
  'use strict';

  // ── Seeded PRNG (Mulberry32) ──────────────────────────
  function seededRandom(seed) {
    let s = seed >>> 0;
    return function () {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // ── Colour palettes ───────────────────────────────────
  const PALETTES = {
    parchment: {
      bg:          '#e8d9b0',
      water:       '#7aadcc',
      waterDeep:   '#4a7d9a',
      forest:      '#4a7a4a',
      forestLight: '#6aaa5a',
      mountain:    '#8a7a6a',
      mountainSnow:'#ccc4bc',
      plains:      '#bfb060',
      plains2:     '#d4c870',
      desert:      '#c8a85a',
      swamp:       '#5a7a4a',
      tundra:      '#9ab0b0',
      road:        '#9a7a4a',
      border:      '#5a3a1a',
      cityDot:     '#8b1a1a',
      cityRing:    '#5a1010',
      dungeonDot:  '#1a1a5a',
      label:       '#2a1a0a',
      labelShadow: 'rgba(232,217,176,0.8)',
      grid:        'rgba(90,58,26,0.08)',
      coastLine:   '#5a8aaa',
      ink:         '#2a1a0a',
      compassRose: '#8b1a1a',
    },
    night: {
      bg:          '#0d1520',
      water:       '#0a2a40',
      waterDeep:   '#051520',
      forest:      '#0a2a15',
      forestLight: '#0d3520',
      mountain:    '#2a2535',
      mountainSnow:'#4a4560',
      plains:      '#1a2510',
      plains2:     '#202e14',
      desert:      '#2a2010',
      swamp:       '#0a1a10',
      tundra:      '#151f2a',
      road:        '#3a2a15',
      border:      '#c9973a',
      cityDot:     '#e8b84b',
      cityRing:    '#a07030',
      dungeonDot:  '#4a60c0',
      label:       '#c9b68a',
      labelShadow: 'rgba(13,21,32,0.9)',
      grid:        'rgba(201,151,58,0.06)',
      coastLine:   '#1a4060',
      ink:         '#c9b68a',
      compassRose: '#c9973a',
    },
  };

  // ── Terrain weights by campaign theme ─────────────────
  const THEME_TERRAIN = {
    undead:    { water:0.08, forest:0.10, mountain:0.15, plains:0.25, swamp:0.30, desert:0.08, tundra:0.04 },
    arcane:    { water:0.12, forest:0.18, mountain:0.20, plains:0.30, swamp:0.10, desert:0.06, tundra:0.04 },
    divine:    { water:0.15, forest:0.15, mountain:0.25, plains:0.35, swamp:0.05, desert:0.03, tundra:0.02 },
    nature:    { water:0.18, forest:0.35, mountain:0.15, plains:0.20, swamp:0.08, desert:0.02, tundra:0.02 },
    urban:     { water:0.15, forest:0.10, mountain:0.10, plains:0.45, swamp:0.05, desert:0.08, tundra:0.07 },
    planar:    { water:0.05, forest:0.10, mountain:0.30, plains:0.20, swamp:0.15, desert:0.12, tundra:0.08 },
    ancient:   { water:0.10, forest:0.15, mountain:0.25, plains:0.20, swamp:0.10, desert:0.15, tundra:0.05 },
    political: { water:0.20, forest:0.12, mountain:0.12, plains:0.40, swamp:0.06, desert:0.06, tundra:0.04 },
    any:       { water:0.15, forest:0.20, mountain:0.18, plains:0.30, swamp:0.08, desert:0.06, tundra:0.03 },
  };

  // ── Location name pools ───────────────────────────────
  const NAME_PARTS = {
    prefix: ['Ash','Black','Bright','Broken','Cold','Dark','Deep','Dusk','Elder','Ever','Fading','Far','Fell','Frost','Ghost','Grim','High','Hollow','Iron','Jade','Last','Lost','Moon','Mist','Night','Old','Red','Rune','Shadow','Silver','Storm','Stone','Thorn','Thunder','Twilight','White','Wild','Winter','Wither'],
    mid:    ['bridge','brook','cliff','crest','cross','dale','den','drift','edge','end','fall','field','ford','gate','glen','grove','haven','helm','hill','holm','keep','lake','moor','peak','port','reach','ridge','run','shore','spire','stead','vale','wall','ward','watch','well','wood'],
    suffix: ['\'s Folly','\'s Rest','\'s Watch','burg','dale','fell','ford','gate','haven','hold','holm','keep','moor','port','reach','ridge','shire','stead','ton','vale','ville','ward','watch','well','wood','worth'],
  };

  function rndName(rng) {
    const r = rng();
    if (r < 0.4) return pick(NAME_PARTS.prefix, rng) + pick(NAME_PARTS.mid, rng);
    if (r < 0.7) return pick(NAME_PARTS.prefix, rng) + pick(NAME_PARTS.suffix, rng);
    return pick(NAME_PARTS.prefix, rng) + pick(NAME_PARTS.mid, rng) + pick(NAME_PARTS.suffix, rng).replace('\'s Folly','');
  }

  function pick(arr, rng) {
    return arr[Math.floor(rng() * arr.length)];
  }

  // ── Weighted terrain picker ────────────────────────────
  function pickTerrain(weights, rng) {
    const r = rng();
    let sum = 0;
    for (const [k, v] of Object.entries(weights)) {
      sum += v;
      if (r <= sum) return k;
    }
    return 'plains';
  }

  // ── Noise helpers (value noise) ────────────────────────
  function valueNoise(grid, gw, gh, x, y) {
    const xi = Math.floor(x) & (gw - 1);
    const yi = Math.floor(y) & (gh - 1);
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const v00 = grid[yi * gw + xi];
    const v10 = grid[yi * gw + ((xi + 1) & (gw - 1))];
    const v01 = grid[((yi + 1) & (gh - 1)) * gw + xi];
    const v11 = grid[((yi + 1) & (gh - 1)) * gw + ((xi + 1) & (gw - 1))];
    const fx = xf * xf * (3 - 2 * xf);
    const fy = yf * yf * (3 - 2 * yf);
    return v00 + (v10 - v00) * fx + (v01 - v00) * fy + (v00 - v10 - v01 + v11) * fx * fy;
  }

  function buildNoiseGrid(gw, gh, rng) {
    const g = new Float32Array(gw * gh);
    for (let i = 0; i < g.length; i++) g[i] = rng();
    return g;
  }

  function fractalNoise(nGrid, gw, gh, x, y, octaves, persistence) {
    let val = 0, amp = 1, freq = 1, max = 0;
    for (let o = 0; o < octaves; o++) {
      val += valueNoise(nGrid, gw, gh, x * freq, y * freq) * amp;
      max += amp;
      amp *= persistence;
      freq *= 2;
    }
    return val / max;
  }

  // ════════════════════════════════════════════════════
  //  REGIONAL MAP
  // ════════════════════════════════════════════════════

  function generateRegionalMap(canvas, campaign, opts = {}) {
    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext('2d');
    const pal = PALETTES[opts.palette || 'parchment'];
    const theme = campaign?.config?.theme || 'any';
    const weights = THEME_TERRAIN[theme] || THEME_TERRAIN.any;
    const seedStr = campaign?.base?.name || 'default';
    const seed = seedStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const rng = seededRandom(seed + (opts.variation || 0));

    // ── Build terrain heightmap ──────────────────────────
    const COLS = 64, ROWS = 48;
    const nGrid = buildNoiseGrid(COLS, ROWS, rng);
    const cellW = W / COLS, cellH = H / ROWS;

    // Draw terrain cells
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const nx = col / COLS;
        const ny = row / ROWS;
        // Multi-octave noise for elevation
        const elev = fractalNoise(nGrid, COLS, ROWS, nx * 8, ny * 8, 5, 0.55);
        // Moisture for biome selection
        const moist = fractalNoise(nGrid, COLS, ROWS, nx * 6 + 100, ny * 6 + 100, 4, 0.6);

        // Edge fade for coastlines
        const edgeFade = Math.min(nx, 1 - nx, ny, 1 - ny) * 8;
        const elevF = elev * Math.min(edgeFade, 1);

        let terrain;
        if (elevF < 0.15) terrain = 'water';
        else if (elevF < 0.20) terrain = 'water'; // coastal
        else if (elev > 0.78) terrain = elev > 0.88 ? 'mountainSnow' : 'mountain';
        else if (moist > 0.65 && elev < 0.55) terrain = moist > 0.80 ? 'swamp' : 'forest';
        else if (moist < 0.28 && elev < 0.60) terrain = 'desert';
        else if (elev < 0.35 && moist < 0.45) terrain = 'tundra';
        else terrain = moist > 0.5 ? 'forestLight' : (rng() > 0.5 ? 'plains' : 'plains2');

        ctx.fillStyle = pal[terrain] || pal.plains;
        ctx.fillRect(col * cellW, row * cellH, cellW + 1, cellH + 1);
      }
    }

    // ── Water shimmer / coast lines ──────────────────────
    ctx.strokeStyle = pal.coastLine;
    ctx.lineWidth = 0.6;
    ctx.globalAlpha = 0.3;
    for (let row = 1; row < ROWS - 1; row++) {
      for (let col = 1; col < COLS - 1; col++) {
        const nx = col / COLS, ny = row / ROWS;
        const edgeFade = Math.min(nx, 1 - nx, ny, 1 - ny) * 8;
        const elev = fractalNoise(nGrid, COLS, ROWS, nx * 8, ny * 8, 5, 0.55) * Math.min(edgeFade, 1);
        if (elev > 0.18 && elev < 0.22) {
          ctx.beginPath();
          ctx.rect(col * cellW, row * cellH, cellW, cellH);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    // ── Parchment texture overlay ─────────────────────────
    const grad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, pal === PALETTES.parchment ? 'rgba(90,58,26,0.18)' : 'rgba(0,0,0,0.3)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // ── Roads / trade routes ─────────────────────────────
    const numRoutes = 3 + Math.floor(rng() * 3);
    const routePoints = [];
    for (let i = 0; i < numRoutes; i++) {
      const pts = generateRoadPath(rng, W, H, nGrid, COLS, ROWS);
      routePoints.push(pts);
    }
    ctx.save();
    ctx.strokeStyle = pal.road;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.globalAlpha = 0.65;
    for (const pts of routePoints) drawSmoothPath(ctx, pts);
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.restore();

    // ── Settlements ───────────────────────────────────────
    const locations = campaign?.locations || [];
    const numSettlements = 6 + Math.floor(rng() * 5);
    const settlements = [];
    const minDist = 60;

    // Place campaign locations first, then random fills
    const allNames = [...locations];
    while (allNames.length < numSettlements) allNames.push(rndName(rng));

    for (let i = 0; i < numSettlements; i++) {
      let attempts = 0, placed = false;
      while (attempts < 80 && !placed) {
        attempts++;
        const sx = 40 + rng() * (W - 80);
        const sy = 40 + rng() * (H - 80);
        // Check not on deep water
        const col = Math.floor(sx / cellW), row = Math.floor(sy / cellH);
        const nx = col / COLS, ny = row / ROWS;
        const edgeFade = Math.min(nx, 1 - nx, ny, 1 - ny) * 8;
        const elev = fractalNoise(nGrid, COLS, ROWS, nx * 8, ny * 8, 5, 0.55) * Math.min(edgeFade, 1);
        if (elev < 0.22) continue;
        // Check distance from others
        if (settlements.some(s => Math.hypot(s.x - sx, s.y - sy) < minDist)) continue;
        const isCampaign = i < locations.length;
        const isCity = isCampaign || rng() < 0.35;
        settlements.push({ x: sx, y: sy, name: allNames[i], isCity, isCampaign });
        placed = true;
      }
    }

    // Draw settlements
    for (const s of settlements) {
      const r = s.isCity ? 7 : 4;
      // Glow
      const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 3);
      grd.addColorStop(0, s.isCampaign ? 'rgba(200,50,50,0.3)' : 'rgba(200,160,60,0.2)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r * 3, 0, Math.PI * 2);
      ctx.fill();
      // Ring
      ctx.strokeStyle = pal.cityRing;
      ctx.lineWidth = 1.5;
      ctx.fillStyle = s.isCampaign ? pal.cityDot : '#c9973a';
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (s.isCity) {
        ctx.fillStyle = pal.label;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Label
      drawMapLabel(ctx, s.name, s.x, s.y + r + 11, pal, s.isCampaign ? 13 : 11, s.isCampaign);
    }

    // ── Dungeon markers ────────────────────────────────────
    const numDungeons = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < numDungeons; i++) {
      let attempts = 0;
      while (attempts < 40) {
        attempts++;
        const dx = 30 + rng() * (W - 60);
        const dy = 30 + rng() * (H - 60);
        if (settlements.some(s => Math.hypot(s.x - dx, s.y - dy) < 35)) continue;
        const col = Math.floor(dx / cellW), row = Math.floor(dy / cellH);
        const nx = col / COLS, ny = row / ROWS;
        const edgeFade = Math.min(nx, 1 - nx, ny, 1 - ny) * 8;
        const elev = fractalNoise(nGrid, COLS, ROWS, nx * 8, ny * 8, 5, 0.55) * Math.min(edgeFade, 1);
        if (elev < 0.22) continue;
        drawDungeonMarker(ctx, dx, dy, pal);
        const dname = rng() < 0.5 ? pick(NAME_PARTS.prefix, rng) + ' Ruins' : 'The ' + pick(NAME_PARTS.mid, rng).replace(/^\w/, c => c.toUpperCase()) + ' Delve';
        drawMapLabel(ctx, dname, dx, dy + 14, pal, 10, false);
        break;
      }
    }

    // ── Map border / frame ────────────────────────────────
    drawMapFrame(ctx, W, H, pal);

    // ── Compass rose ──────────────────────────────────────
    drawCompassRose(ctx, W - 65, H - 65, 45, pal);

    // ── Map title ─────────────────────────────────────────
    const mapTitle = campaign?.base?.name ? `${campaign.base.name} — Regional Map` : 'Campaign Region';
    ctx.font = `bold 15px Georgia, serif`;
    ctx.textAlign = 'center';
    const tw = ctx.measureText(mapTitle).width;
    ctx.fillStyle = pal.labelShadow;
    ctx.fillRect(W / 2 - tw / 2 - 8, 10, tw + 16, 22);
    ctx.fillStyle = pal.ink;
    ctx.fillText(mapTitle, W / 2, 26);

    // ── Scale bar ─────────────────────────────────────────
    drawScaleBar(ctx, 20, H - 22, 100, pal);

    return { settlements, seed };
  }

  // ── Road path generation ──────────────────────────────
  function generateRoadPath(rng, W, H, nGrid, COLS, ROWS) {
    const pts = [];
    const numPts = 3 + Math.floor(rng() * 4);
    for (let i = 0; i < numPts; i++) {
      pts.push({ x: 30 + rng() * (W - 60), y: 30 + rng() * (H - 60) });
    }
    return pts;
  }

  function drawSmoothPath(ctx, pts) {
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const cpx = (pts[i].x + pts[i + 1].x) / 2;
      const cpy = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, cpx, cpy);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();
  }

  // ── Map label ─────────────────────────────────────────
  function drawMapLabel(ctx, text, x, y, pal, size = 11, bold = false) {
    ctx.save();
    ctx.font = `${bold ? 'bold ' : ''}${size}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const w = ctx.measureText(text).width;
    ctx.fillStyle = pal.labelShadow;
    ctx.fillRect(x - w / 2 - 3, y - 1, w + 6, size + 4);
    ctx.fillStyle = pal.label;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  // ── Dungeon marker ─────────────────────────────────────
  function drawDungeonMarker(ctx, x, y, pal) {
    ctx.save();
    ctx.strokeStyle = pal.dungeonDot;
    ctx.fillStyle = pal.dungeonDot;
    ctx.lineWidth = 1.5;
    // Small skull-like X
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5);
    ctx.moveTo(x + 5, y - 5); ctx.lineTo(x - 5, y + 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ── Map frame ──────────────────────────────────────────
  function drawMapFrame(ctx, W, H, pal) {
    ctx.save();
    // Outer border
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, W - 8, H - 8);
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, W - 20, H - 20);
    // Corner decorations
    const corners = [[10,10],[W-10,10],[10,H-10],[W-10,H-10]];
    ctx.fillStyle = pal.border;
    for (const [cx,cy] of corners) {
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Compass rose ───────────────────────────────────────
  function drawCompassRose(ctx, cx, cy, r, pal) {
    ctx.save();
    ctx.translate(cx, cy);
    const c = pal.compassRose;
    // Outer ring
    ctx.strokeStyle = c; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    // Cardinal points
    const dirs = [
      { a: -Math.PI/2, label: 'N', big: true },
      { a:  Math.PI/2, label: 'S', big: false },
      { a:  0,         label: 'E', big: false },
      { a:  Math.PI,   label: 'W', big: false },
    ];
    for (const d of dirs) {
      const x1 = Math.cos(d.a) * (r * 0.25);
      const y1 = Math.sin(d.a) * (r * 0.25);
      const x2 = Math.cos(d.a) * r;
      const y2 = Math.sin(d.a) * r;
      ctx.strokeStyle = c; ctx.lineWidth = d.big ? 2.5 : 1.5;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      // Point
      ctx.fillStyle = c;
      ctx.save(); ctx.rotate(d.a);
      ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(r * 0.75, -5); ctx.lineTo(r * 0.75, 5); ctx.closePath();
      ctx.fill(); ctx.restore();
      // Label
      const lx = Math.cos(d.a) * (r + 10);
      const ly = Math.sin(d.a) * (r + 10);
      ctx.font = `bold ${d.big ? 12 : 10}px Georgia, serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = pal.ink; ctx.fillText(d.label, lx, ly);
    }
    // Diagonal cross
    ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.globalAlpha = 0.5;
    for (const a of [Math.PI/4, -Math.PI/4, 3*Math.PI/4, -3*Math.PI/4]) {
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*r*0.3, Math.sin(a)*r*0.3);
      ctx.lineTo(Math.cos(a)*r*0.75, Math.sin(a)*r*0.75);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Centre dot
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ── Scale bar ─────────────────────────────────────────
  function drawScaleBar(ctx, x, y, len, pal) {
    ctx.save();
    ctx.fillStyle = pal.ink; ctx.strokeStyle = pal.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + len, y - 4); ctx.lineTo(x + len, y + 4); ctx.stroke();
    ctx.font = '9px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('100 miles', x + len / 2, y - 2);
    ctx.restore();
  }

  // ════════════════════════════════════════════════════
  //  DUNGEON MAP
  // ════════════════════════════════════════════════════

  const DUNGEON_STYLES = {
    classic:  { floorColor: '#d4c89a', wallColor: '#8a7a5a', doorColor: '#7a5a2a', featureColor: '#6a4a2a', secretColor: '#8b1a1a' },
    undead:   { floorColor: '#b0a888', wallColor: '#6a5a4a', doorColor: '#5a3a1a', featureColor: '#4a3010', secretColor: '#6a1010' },
    arcane:   { floorColor: '#c0b8d8', wallColor: '#6a6a8a', doorColor: '#4a4a6a', featureColor: '#3a2a5a', secretColor: '#1a0a3a' },
    natural:  { floorColor: '#b8c8a8', wallColor: '#6a7a5a', doorColor: '#4a5a2a', featureColor: '#3a4a1a', secretColor: '#2a5a1a' },
    divine:   { floorColor: '#d8d0b0', wallColor: '#9a8a6a', doorColor: '#7a6a3a', featureColor: '#5a4a1a', secretColor: '#8b6a00' },
  };

  function dungeonStyleForTheme(theme) {
    const map = { undead:'undead', arcane:'arcane', divine:'divine', nature:'natural', planar:'arcane' };
    return DUNGEON_STYLES[map[theme]] || DUNGEON_STYLES.classic;
  }

  function generateDungeonMap(canvas, campaign, locationName, opts = {}) {
    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext('2d');
    const theme = campaign?.config?.theme || 'any';
    const style = dungeonStyleForTheme(theme);
    const seedStr = (campaign?.base?.name || 'dungeon') + (locationName || '') + (opts.variation || 0);
    const seed = seedStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const rng = seededRandom(seed);

    const CELL = 28; // pixels per grid cell
    const COLS = Math.floor(W / CELL);
    const ROWS = Math.floor(H / CELL);

    // ── Grid (0=wall, 1=floor, 2=door, 3=secret, 4=stairs) ──
    const grid = new Uint8Array(COLS * ROWS);
    const idx = (c, r) => r * COLS + c;

    // ── BSP Room generation ───────────────────────────────
    const rooms = [];
    const MIN_ROOM = 3, MAX_ROOM = 8, MARGIN = 1;

    function splitPartition(x, y, w, h, depth) {
      const minSplit = 7;
      if (depth <= 0 || w < minSplit || h < minSplit) {
        // Leaf — try to place a room
        const rw = MIN_ROOM + Math.floor(rng() * (Math.min(MAX_ROOM, w - 2) - MIN_ROOM + 1));
        const rh = MIN_ROOM + Math.floor(rng() * (Math.min(MAX_ROOM, h - 2) - MIN_ROOM + 1));
        const rx = x + 1 + Math.floor(rng() * (w - rw - 1));
        const ry = y + 1 + Math.floor(rng() * (h - rh - 1));
        if (rw >= MIN_ROOM && rh >= MIN_ROOM) {
          rooms.push({ x: rx, y: ry, w: rw, h: rh });
          // Carve floor
          for (let r = ry; r < ry + rh; r++)
            for (let c = rx; c < rx + rw; c++)
              if (r >= 0 && r < ROWS && c >= 0 && c < COLS)
                grid[idx(c, r)] = 1;
        }
        return;
      }
      // Split horizontally or vertically
      if (w > h || (w === h && rng() < 0.5)) {
        const split = Math.floor(w * 0.3 + rng() * w * 0.4);
        splitPartition(x, y, split, h, depth - 1);
        splitPartition(x + split, y, w - split, h, depth - 1);
      } else {
        const split = Math.floor(h * 0.3 + rng() * h * 0.4);
        splitPartition(x, y, w, split, depth - 1);
        splitPartition(x, y + split, w, h - split, depth - 1);
      }
    }

    splitPartition(1, 1, COLS - 2, ROWS - 2, 4);

    // ── Connect rooms with corridors ──────────────────────
    function roomCenter(room) {
      return { x: Math.floor(room.x + room.w / 2), y: Math.floor(room.y + room.h / 2) };
    }

    function carveLine(x1, y1, x2, y2) {
      let cx = x1, cy = y1;
      const steps = Math.abs(x2 - x1) + Math.abs(y2 - y1);
      for (let s = 0; s <= steps; s++) {
        if (cx >= 0 && cx < COLS && cy >= 0 && cy < ROWS) grid[idx(cx, cy)] = 1;
        if (cx !== x2) cx += cx < x2 ? 1 : -1;
        else if (cy !== y2) cy += cy < y2 ? 1 : -1;
      }
    }

    for (let i = 1; i < rooms.length; i++) {
      const a = roomCenter(rooms[i - 1]);
      const b = roomCenter(rooms[i]);
      if (rng() < 0.5) { carveLine(a.x, a.y, b.x, a.y); carveLine(b.x, a.y, b.x, b.y); }
      else { carveLine(a.x, a.y, a.x, b.y); carveLine(a.x, b.y, b.x, b.y); }
    }

    // ── Place doors ───────────────────────────────────────
    for (const room of rooms) {
      const edges = [];
      // Check room edges for corridor-adjacent cells
      for (let c = room.x; c < room.x + room.w; c++) {
        if (room.y > 0 && grid[idx(c, room.y - 1)] === 1) edges.push([c, room.y]);
        if (room.y + room.h < ROWS && grid[idx(c, room.y + room.h)] === 1) edges.push([c, room.y + room.h - 1]);
      }
      for (let r = room.y; r < room.y + room.h; r++) {
        if (room.x > 0 && grid[idx(room.x - 1, r)] === 1) edges.push([room.x, r]);
        if (room.x + room.w < COLS && grid[idx(room.x + room.w, r)] === 1) edges.push([room.x + room.w - 1, r]);
      }
      if (edges.length > 0 && rng() < 0.7) {
        const e = edges[Math.floor(rng() * edges.length)];
        grid[idx(e[0], e[1])] = rng() < 0.12 ? 3 : 2; // 3=secret
      }
    }

    // ── Stairs ────────────────────────────────────────────
    if (rooms.length >= 2) {
      const upRoom  = rooms[0];
      const dnRoom  = rooms[rooms.length - 1];
      const uc = roomCenter(upRoom);
      const dc = roomCenter(dnRoom);
      grid[idx(uc.x, uc.y)] = 4;
      grid[idx(dc.x, dc.y)] = 4;
    }

    // ── Features ──────────────────────────────────────────
    const features = [];
    const featureTypes = ['Altar', 'Fountain', 'Statue', 'Chest', 'Throne', 'Bookshelf', 'Pit', 'Portcullis', 'Brazier', 'Sarcophagus', 'Well', 'Forge', 'Cauldron', 'Mirror'];
    for (const room of rooms) {
      if (room.w >= 4 && room.h >= 4 && rng() < 0.55) {
        const fx = room.x + 1 + Math.floor(rng() * (room.w - 2));
        const fy = room.y + 1 + Math.floor(rng() * (room.h - 2));
        const type = featureTypes[Math.floor(rng() * featureTypes.length)];
        features.push({ x: fx, y: fy, type });
      }
    }

    // ════════════ RENDER ════════════

    // Background
    ctx.fillStyle = style.wallColor;
    ctx.fillRect(0, 0, W, H);

    // ── Draw floor, walls, doors ──────────────────────────
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const v = grid[idx(c, r)];
        const px = c * CELL, py = r * CELL;
        if (v === 0) continue; // wall stays dark

        ctx.fillStyle = style.floorColor;
        ctx.fillRect(px, py, CELL, CELL);
        // Subtle grid line
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px, py, CELL, CELL);
      }
    }

    // Wall outlines (wherever floor meets wall)
    ctx.strokeStyle = style.wallColor;
    ctx.lineWidth = 2.5;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[idx(c, r)] < 1) continue;
        const px = c * CELL, py = r * CELL;
        const nb = [
          [c, r-1], [c+1, r], [c, r+1], [c-1, r]
        ];
        for (const [nc, nr] of nb) {
          if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS || grid[idx(nc, nr)] === 0) {
            ctx.strokeStyle = 'rgba(0,0,0,0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (nc === c && nr === r - 1) { ctx.moveTo(px, py); ctx.lineTo(px + CELL, py); }
            if (nc === c + 1 && nr === r) { ctx.moveTo(px + CELL, py); ctx.lineTo(px + CELL, py + CELL); }
            if (nc === c && nr === r + 1) { ctx.moveTo(px, py + CELL); ctx.lineTo(px + CELL, py + CELL); }
            if (nc === c - 1 && nr === r) { ctx.moveTo(px, py); ctx.lineTo(px, py + CELL); }
            ctx.stroke();
          }
        }
      }
    }

    // ── Doors ─────────────────────────────────────────────
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const v = grid[idx(c, r)];
        const px = c * CELL + CELL/2, py = r * CELL + CELL/2;
        if (v === 2) {
          // Normal door: filled rect across corridor
          ctx.fillStyle = style.doorColor;
          ctx.strokeStyle = '#3a2a10';
          ctx.lineWidth = 1;
          ctx.fillRect(px - 4, py - CELL/2 + 4, 8, CELL - 8);
          ctx.strokeRect(px - 4, py - CELL/2 + 4, 8, CELL - 8);
        } else if (v === 3) {
          // Secret door: dashed outline
          ctx.strokeStyle = style.secretColor;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(c * CELL + 2, r * CELL + 2, CELL - 4, CELL - 4);
          ctx.setLineDash([]);
          ctx.fillStyle = style.secretColor;
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('S', px, py);
        } else if (v === 4) {
          // Stairs
          const sx = c * CELL + 3, sy = r * CELL + 3;
          ctx.fillStyle = style.featureColor;
          for (let si = 0; si < 4; si++) {
            ctx.fillRect(sx + si * 3, sy + si * 3, CELL - 6 - si * 6, 3);
          }
        }
      }
    }

    // ── Features ──────────────────────────────────────────
    ctx.fillStyle = style.featureColor;
    ctx.strokeStyle = style.featureColor;
    for (const f of features) {
      const px = f.x * CELL + CELL/2, py = f.y * CELL + CELL/2;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '7px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillStyle = style.featureColor;
      ctx.fillText(f.type, px, py + 6);
      ctx.fillStyle = style.featureColor;
    }

    // ── Room labels (Act-tied) ────────────────────────────
    const roomLabels = generateRoomLabels(rooms, campaign, rng);
    ctx.font = 'bold 8px Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let i = 0; i < Math.min(roomLabels.length, rooms.length); i++) {
      const room = rooms[i];
      const px = (room.x + room.w / 2) * CELL;
      const py = room.y * CELL + 3;
      ctx.fillStyle = 'rgba(232,217,176,0.75)';
      const tw = ctx.measureText(roomLabels[i]).width;
      ctx.fillRect(px - tw / 2 - 2, py, tw + 4, 10);
      ctx.fillStyle = style.featureColor;
      ctx.fillText(roomLabels[i], px, py + 1);
    }

    // ── Border ────────────────────────────────────────────
    ctx.strokeStyle = style.featureColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, W - 4, H - 4);

    // ── Title ─────────────────────────────────────────────
    const title = locationName || (campaign?.locations?.[1]) || 'Dungeon Level 1';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(232,217,176,0.85)';
    const ttw = ctx.measureText(title).width;
    ctx.fillRect(6, 6, ttw + 12, 20);
    ctx.fillStyle = style.featureColor;
    ctx.fillText(title, 12, 9);

    // ── Legend ─────────────────────────────────────────────
    drawDungeonLegend(ctx, W - 130, H - 90, style);

    return { rooms, features };
  }

  function generateRoomLabels(rooms, campaign, rng) {
    const generic = ['Entry Hall', 'Guard Post', 'Barracks', 'Armory', 'Store Room', 'Torture Chamber', 'Throne Room', 'Laboratory', 'Library', 'Shrine', 'Crypt', 'Vault', 'Kitchen', 'Cistern', 'Summoning Circle', 'Boss Chamber', 'Secret Archive', 'Trophy Room'];
    const labels = [];
    for (let i = 0; i < rooms.length; i++) {
      labels.push(i === 0 ? 'Entry' : (i === rooms.length - 1 ? 'Boss Chamber' : generic[Math.floor(rng() * generic.length)]));
    }
    return labels;
  }

  function drawDungeonLegend(ctx, x, y, style) {
    ctx.save();
    ctx.fillStyle = 'rgba(232,217,176,0.85)';
    ctx.fillRect(x, y, 120, 82);
    ctx.strokeStyle = style.featureColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 120, 82);
    ctx.font = 'bold 8px Georgia, serif';
    ctx.fillStyle = style.featureColor;
    ctx.textAlign = 'left';
    ctx.fillText('LEGEND', x + 6, y + 5);
    const items = [
      { sym: '▪', color: style.doorColor, label: 'Door' },
      { sym: 'S', color: style.secretColor, label: 'Secret Door' },
      { sym: '≡', color: style.featureColor, label: 'Stairs' },
      { sym: '●', color: style.featureColor, label: 'Feature' },
    ];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const ly = y + 20 + i * 14;
      ctx.font = '10px sans-serif';
      ctx.fillStyle = item.color;
      ctx.fillText(item.sym, x + 8, ly);
      ctx.font = '8px Georgia, serif';
      ctx.fillStyle = style.featureColor;
      ctx.fillText(item.label, x + 22, ly);
    }
    ctx.restore();
  }

  // ════════════════════════════════════════════════════
  //  PUBLIC API
  // ════════════════════════════════════════════════════

  return {
    generateRegionalMap,
    generateDungeonMap,
  };

})();
