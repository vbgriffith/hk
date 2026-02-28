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
  //  DUNGEON MAP  — Build 6 Complete Rewrite
  //  Campaign-specific themes, textured tiles, atmospheric glows,
  //  themed room labels, encounter badges, improved icons, water/lava
  // ════════════════════════════════════════════════════

  // ── Dungeon Theme Definitions ─────────────────────────────────────────────
  const DUNGEON_THEMES = {
    classic: {
      name: 'Stone Dungeon',
      wallFill:    '#3a3228', wallStroke: '#1a1510',
      floorBase:   '#c8b88a', floorAlt:   '#bfaf82',
      floorGrit:   'rgba(80,60,30,0.07)',
      doorFill:    '#6a4820', doorStroke: '#3a2810',
      secretFill:  '#8b1a1a', stairFill:  '#7a6a4a',
      featureFill: '#5a4a2a',
      waterFill:   '#4a7aaa', waterGlow:  'rgba(74,122,170,0.3)',
      glowColor:   'rgba(255,200,80,0.18)', // torchlight warm
      accentColor: '#c9973a',
      gridColor:   'rgba(0,0,0,0.12)',
      rooms: {
        entry:    ['Entry Hall','Guard Chamber','Gatehouse','Antechamber'],
        combat:   ['Barracks','Armory','Training Hall','Guard Post','Garrison'],
        treasure: ['Vault','Treasury','Hidden Cache','Strongbox Chamber'],
        ritual:   ['Shrine','Altar Chamber','Ritual Circle','Summoning Room'],
        utility:  ['Kitchen','Cistern','Store Room','Forge','Stable'],
        library:  ['Archive','Library','Scriptorium','Map Room'],
        boss:     ['Boss Chamber','Throne Room','Inner Sanctum','War Room'],
        special:  ['Torture Chamber','Oubliette','Trophy Room','Kennel'],
      },
      features: ['Stone Altar','Iron Portcullis','Weapon Rack','Iron Brazier','Bone Pile','Torture Rack','Trophy Wall','Coin Pile'],
    },
    undead: {
      name: 'Necromantic Crypt',
      wallFill:    '#2a2a2a', wallStroke: '#0a0a0a',
      floorBase:   '#4a4238', floorAlt:   '#423a30',
      floorGrit:   'rgba(0,0,0,0.15)',
      doorFill:    '#3a2820', doorStroke: '#1a1008',
      secretFill:  '#6a0000', stairFill:  '#3a3228',
      featureFill: '#3a2a20',
      waterFill:   '#2a4a2a', waterGlow:  'rgba(20,80,20,0.3)', // sickly green
      glowColor:   'rgba(40,180,40,0.12)', // necromantic green glow
      accentColor: '#4a8a4a',
      gridColor:   'rgba(0,0,0,0.2)',
      rooms: {
        entry:    ['Mausoleum Entrance','Charnel Gate','Bone Arch','Death\'s Threshold'],
        combat:   ['Guard Crypt','Skeleton Barracks','Wight Quarters','Ghoul Den'],
        treasure: ['Burial Vault','Sarcophagus Chamber','Lich\'s Hoard','Grave Goods'],
        ritual:   ['Necromancy Circle','Soul Binding Chamber','Undeath Altar','Black Shrine'],
        utility:  ['Embalming Chamber','Bone Mill','Corpse Storage','Preparation Room'],
        library:  ['Tome of the Dead','Necromancer\'s Study','Death Liturgy Hall','Forbidden Archive'],
        boss:     ['Lich\'s Sanctum','Undead Overlord\'s Throne','Death Knight\'s Hall','Vampire\'s Lair'],
        special:  ['Mass Grave','Ossuary','Plague Pit','Reliquary of Suffering'],
      },
      features: ['Stone Sarcophagus','Necrotic Altar','Bone Throne','Soul Cage','Funeral Pyre','Corpse Pile','Black Candles','Death Mask'],
    },
    arcane: {
      name: 'Arcane Tower',
      wallFill:    '#1a1a2a', wallStroke: '#0a0a1a',
      floorBase:   '#2a2a4a', floorAlt:   '#252538',
      floorGrit:   'rgba(100,100,200,0.08)',
      doorFill:    '#3a2a5a', doorStroke: '#1a1030',
      secretFill:  '#5a0a8a', stairFill:  '#3a2a5a',
      featureFill: '#4a3a7a',
      waterFill:   '#3a3a8a', waterGlow:  'rgba(80,80,200,0.4)',
      glowColor:   'rgba(120,80,255,0.20)', // arcane purple glow
      accentColor: '#8a60d0',
      gridColor:   'rgba(100,80,200,0.12)',
      rooms: {
        entry:    ['Foyer of Wonders','Sigil Gate','Warded Entrance','Arcane Threshold'],
        combat:   ['Construct Lab','Guardian Chamber','Golem Staging Area','Familiar Kennels'],
        treasure: ['Vault of Artifacts','Spellbook Archive','Material Component Store','Focus Vault'],
        ritual:   ['Summoning Circle','Binding Chamber','Transmutation Lab','Divination Observatory'],
        utility:  ['Alchemical Workshop','Arcane Forge','Component Laboratory','Distillation Chamber'],
        library:  ['Grand Library','Forbidden Research Wing','Thesis Repository','Scroll Archive'],
        boss:     ['Archmage\'s Sanctum','Master Laboratory','Tower Apex','Final Seal Chamber'],
        special:  ['Failed Experiment Chamber','Reality Fracture Room','Spell Prison','Rift Observatory'],
      },
      features: ['Floating Orb','Arcane Circle','Magical Apparatus','Spell Mirror','Binding Rune','Crystal Pillar','Ley Line Node','Failed Experiment'],
    },
    nature: {
      name: 'Ancient Grove / Cave',
      wallFill:    '#1a2a1a', wallStroke: '#0a1a0a',
      floorBase:   '#3a5a2a', floorAlt:   '#324e24',
      floorGrit:   'rgba(30,80,20,0.1)',
      doorFill:    '#3a5a1a', doorStroke: '#1a3a0a',
      secretFill:  '#2a6a2a', stairFill:  '#4a5a3a',
      featureFill: '#2a4a1a',
      waterFill:   '#2a6a6a', waterGlow:  'rgba(30,120,120,0.35)',
      glowColor:   'rgba(60,200,60,0.12)', // bioluminescent green
      accentColor: '#6aaa4a',
      gridColor:   'rgba(20,60,10,0.15)',
      rooms: {
        entry:    ['Grove Entrance','Ancient Threshold','Living Gate','Root Archway'],
        combat:   ['Predator Den','Beast Lair','Territorial Zone','Hunting Ground'],
        treasure: ['Ancient Cache','Druidic Vault','Nature\'s Hoard','Blessed Spring'],
        ritual:   ['Sacred Grove','Moon Circle','Druidic Ring','Nature Shrine'],
        utility:  ['Mushroom Farm','Herb Cache','Water Source','Spawn Pool'],
        library:  ['Carved Stone Records','Bark Archive','Ancient Inscription Wall','Memory Grove'],
        boss:     ['Elder\'s Chamber','Ancient\'s Heart','Nature\'s Throne','Primal Core'],
        special:  ['Corrupted Glade','Poison Garden','Predator\'s Trophy Cave','Abandoned Den'],
      },
      features: ['Ancient Stone','Living Roots','Mushroom Cluster','Underground Spring','Bone Pile','Cave Crystal','Glowing Moss','Predator\'s Kill'],
    },
    divine: {
      name: 'Sacred Temple',
      wallFill:    '#2a2218', wallStroke: '#1a1508',
      floorBase:   '#d4c090', floorAlt:   '#c8b480',
      floorGrit:   'rgba(180,140,60,0.08)',
      doorFill:    '#8a6a30', doorStroke: '#5a4018',
      secretFill:  '#8b7a00', stairFill:  '#a08040',
      featureFill: '#7a6030',
      waterFill:   '#4a7a9a', waterGlow:  'rgba(74,122,154,0.3)',
      glowColor:   'rgba(255,220,100,0.22)', // divine golden glow
      accentColor: '#d4a030',
      gridColor:   'rgba(160,120,40,0.1)',
      rooms: {
        entry:    ['Narthex','Outer Sanctuary','Pilgrim\'s Hall','Blessed Threshold'],
        combat:   ['Inquisitor\'s Chamber','Guardian Barracks','Holy Knight\'s Hall','Blessed Armory'],
        treasure: ['Relic Vault','Sacred Treasury','Offering Room','Holy Repository'],
        ritual:   ['Inner Sanctum','High Altar','Consecration Chamber','Oracle\'s Room'],
        utility:  ['Vestibule','Clergy Quarters','Preparation Hall','Censer Chamber'],
        library:  ['Sacred Texts Archive','Prophecy Hall','Theological Library','Canon Repository'],
        boss:     ['High Priest\'s Chamber','Unholy Corruption Core','False God\'s Throne','Desecrated Sanctum'],
        special:  ['Confessional','Ossuary Chapel','Saint\'s Reliquary','Miracle Site'],
      },
      features: ['Grand Altar','Holy Font','Sacred Flame','Reliquary','Prayer Kneeler','Divine Mosaic','Bell Tower','Incense Burner'],
    },
    planar: {
      name: 'Planar Rift Site',
      wallFill:    '#0a0a1a', wallStroke: '#000008',
      floorBase:   '#1a1a3a', floorAlt:   '#151530',
      floorGrit:   'rgba(80,40,180,0.1)',
      doorFill:    '#2a0a4a', doorStroke: '#10002a',
      secretFill:  '#4a008a', stairFill:  '#2a1a4a',
      featureFill: '#3a1a6a',
      waterFill:   '#1a3a6a', waterGlow:  'rgba(30,60,180,0.5)', // void blue
      glowColor:   'rgba(160,60,255,0.25)', // planar void glow
      accentColor: '#9a40ff',
      gridColor:   'rgba(80,40,160,0.15)',
      rooms: {
        entry:    ['Planar Gate','Reality Threshold','Anchor Point','Void Entrance'],
        combat:   ['Planar Guardian Post','Demon Barracks','Elemental Holding','Outsider Barracks'],
        treasure: ['Void Cache','Planar Artifact Vault','Reality Fragment Store','Astral Hoard'],
        ritual:   ['Summoning Nexus','Planar Binding Circle','Reality Anchor Chamber','Rift Stabilizer'],
        utility:  ['Planar Transit Hub','Anchor Node','Reality Calibration Room','Dimensional Store'],
        library:  ['Planar Almanac','Void Cartography Room','Outsider Taxonomy Archive','Reality Index'],
        boss:     ['Planar Overlord\'s Throne','Reality Core','Rift Heart','Void Sovereign\'s Chamber'],
        special:  ['Reality Fracture Zone','Temporal Anomaly Room','Plane-Bleed Chamber','Dead Zone'],
      },
      features: ['Planar Rift','Reality Crystal','Void Obelisk','Dimensional Anchor','Astral Web','Outsider Effigy','Planar Map','Energy Node'],
    },
  };

  function getDungeonTheme(campaign) {
    var theme = (campaign && campaign.config && campaign.config.theme) || 'any';
    var map = { undead:'undead', arcane:'arcane', divine:'divine', nature:'nature', planar:'planar' };
    return DUNGEON_THEMES[map[theme]] || DUNGEON_THEMES.classic;
  }

  // ── Themed room label generator ───────────────────────────────────────────
  function generateThemedRoomLabels(rooms, campaign, rng, theme) {
    var pools = theme.rooms;
    var allGeneric = [].concat(pools.combat, pools.utility, pools.ritual, pools.special);
    var labels = [];
    for (var i = 0; i < rooms.length; i++) {
      if (i === 0)                 labels.push(pick(pools.entry, rng));
      else if (i === rooms.length-1) labels.push(pick(pools.boss, rng));
      else if (i % 4 === 1)        labels.push(pick(pools.treasure, rng));
      else if (i % 4 === 2)        labels.push(pick(pools.ritual, rng));
      else if (i % 3 === 0)        labels.push(pick(pools.library, rng));
      else                         labels.push(pick(allGeneric, rng));
    }
    return labels;
  }

  // ── Canvas helpers ────────────────────────────────────────────────────────
  function fillRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y); ctx.arcTo(x+w, y, x+w, y+r, r);
    ctx.lineTo(x+w, y+h-r); ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
    ctx.lineTo(x+r, y+h); ctx.arcTo(x, y+h, x, y+h-r, r);
    ctx.lineTo(x, y+r); ctx.arcTo(x, y, x+r, y, r);
    ctx.closePath();
  }

  // ── Draw textured floor tile ───────────────────────────────────────────────
  function drawFloorTile(ctx, px, py, CELL, theme, rng, isWater) {
    if (isWater) {
      // Water / special floor
      var wg = ctx.createLinearGradient(px, py, px+CELL, py+CELL);
      wg.addColorStop(0,   theme.waterFill);
      wg.addColorStop(0.5, theme.waterFill + 'cc');
      wg.addColorStop(1,   theme.waterFill + '88');
      ctx.fillStyle = wg;
      ctx.fillRect(px, py, CELL, CELL);
      // Ripple lines
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 0.5;
      for (var ri = 1; ri <= 2; ri++) {
        var wy = py + ri * (CELL/3);
        ctx.beginPath();
        ctx.moveTo(px+2, wy);
        ctx.bezierCurveTo(px+CELL*0.3, wy-2, px+CELL*0.7, wy+2, px+CELL-2, wy);
        ctx.stroke();
      }
    } else {
      // Stone/dirt floor with subtle variation
      var v = rng() * 0.06;
      ctx.fillStyle = theme.floorBase;
      ctx.fillRect(px, py, CELL, CELL);
      // Alternate lighter tile
      if ((Math.floor(px/CELL) + Math.floor(py/CELL)) % 2 === 0) {
        ctx.fillStyle = theme.floorAlt;
        ctx.fillRect(px, py, CELL, CELL);
      }
      // Grit / wear marks
      ctx.fillStyle = theme.floorGrit;
      ctx.fillRect(px, py, CELL, CELL);
      // Occasional crack
      if (rng() < 0.08) {
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(px + rng()*CELL, py + rng()*CELL);
        ctx.lineTo(px + rng()*CELL, py + rng()*CELL);
        ctx.stroke();
      }
    }
  }

  // ── Draw wall with thickness and shading ──────────────────────────────────
  function drawWallEdge(ctx, px, py, CELL, side, theme) {
    var thickness = 3;
    ctx.fillStyle = theme.wallStroke;
    ctx.strokeStyle = theme.wallStroke;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    if (side === 'top')    { ctx.moveTo(px, py+0.5);         ctx.lineTo(px+CELL, py+0.5); }
    if (side === 'right')  { ctx.moveTo(px+CELL-0.5, py);    ctx.lineTo(px+CELL-0.5, py+CELL); }
    if (side === 'bottom') { ctx.moveTo(px, py+CELL-0.5);    ctx.lineTo(px+CELL, py+CELL-0.5); }
    if (side === 'left')   { ctx.moveTo(px+0.5, py);         ctx.lineTo(px+0.5, py+CELL); }
    ctx.stroke();
  }

  // ── Draw door (proper PF2e style) ─────────────────────────────────────────
  function drawDoor(ctx, cx, cy, CELL, theme, isHorizontal, isSecret) {
    ctx.save();
    if (isSecret) {
      // Dashed secret door mark
      ctx.strokeStyle = theme.secretFill;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3,3]);
      ctx.strokeRect(cx - CELL/2 + 2, cy - CELL/2 + 2, CELL-4, CELL-4);
      ctx.setLineDash([]);
      ctx.font = 'bold 9px Georgia, serif';
      ctx.fillStyle = theme.secretFill;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('S', cx, cy);
    } else {
      // Normal door: rectangle across opening with handles
      var dw = isHorizontal ? CELL-6 : 5;
      var dh = isHorizontal ? 5 : CELL-6;
      var dx = cx - dw/2;
      var dy = cy - dh/2;
      // Door panel
      ctx.fillStyle = theme.doorFill;
      ctx.strokeStyle = theme.doorStroke;
      ctx.lineWidth = 1;
      fillRoundRect(ctx, dx, dy, dw, dh, 1);
      ctx.fill(); ctx.stroke();
      // Door hinge dots
      ctx.fillStyle = theme.doorStroke;
      if (isHorizontal) {
        ctx.beginPath(); ctx.arc(dx+3, cy, 1.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(dx+dw-3, cy, 1.5, 0, Math.PI*2); ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(cx, dy+3, 1.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx, dy+dh-3, 1.5, 0, Math.PI*2); ctx.fill();
      }
    }
    ctx.restore();
  }

  // ── Draw stairs ───────────────────────────────────────────────────────────
  function drawStairs(ctx, px, py, CELL, theme, isUp) {
    ctx.save();
    var steps = 5;
    var sw = CELL - 6;
    var sh = (CELL - 6) / steps;
    ctx.fillStyle = theme.stairFill;
    for (var si = 0; si < steps; si++) {
      var alpha = 0.4 + si * 0.12;
      ctx.globalAlpha = isUp ? alpha : (1 - alpha * 0.5 + 0.2);
      ctx.fillRect(px+3 + si*1.5, py+3 + si*sh, sw - si*3, sh-1);
    }
    ctx.globalAlpha = 1;
    // Arrow
    ctx.strokeStyle = theme.accentColor;
    ctx.fillStyle   = theme.accentColor;
    ctx.lineWidth   = 1.2;
    var ax = px + CELL/2, ay = py + CELL/2;
    var dir = isUp ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(ax, ay - dir*4);
    ctx.lineTo(ax, ay + dir*4);
    ctx.moveTo(ax-3, ay + dir*1);
    ctx.lineTo(ax, ay + dir*4);
    ctx.lineTo(ax+3, ay + dir*1);
    ctx.stroke();
    ctx.font = 'bold 6px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(isUp ? '▲' : '▼', ax, ay + dir*6);
    ctx.restore();
  }

  // ── Draw feature icon ─────────────────────────────────────────────────────
  function drawFeatureIcon(ctx, cx, cy, type, theme) {
    ctx.save();
    ctx.fillStyle   = theme.featureFill;
    ctx.strokeStyle = theme.featureFill;
    ctx.font        = '10px serif';
    ctx.textAlign   = 'center';
    ctx.textBaseline= 'middle';
    var iconMap = {
      'Stone Altar':'⛩','Iron Portcullis':'|','Weapon Rack':'⚔','Iron Brazier':'🔥',
      'Bone Pile':'☠','Torture Rack':'✝','Trophy Wall':'🏆','Coin Pile':'💰',
      'Stone Sarcophagus':'⚰','Necrotic Altar':'☠','Bone Throne':'💀','Soul Cage':'🔮',
      'Funeral Pyre':'🔥','Corpse Pile':'☠','Black Candles':'🕯','Death Mask':'😐',
      'Floating Orb':'◉','Arcane Circle':'⊕','Magical Apparatus':'⚗','Spell Mirror':'▣',
      'Binding Rune':'ᚱ','Crystal Pillar':'◈','Ley Line Node':'✦','Failed Experiment':'⚠',
      'Ancient Stone':'🗿','Living Roots':'🌿','Mushroom Cluster':'🍄','Underground Spring':'💧',
      'Cave Crystal':'💎','Glowing Moss':'✨','Predator\'s Kill':'🦴','Bone Pile ':'☠',
      'Grand Altar':'⛩','Holy Font':'🫙','Sacred Flame':'🔥','Reliquary':'📿',
      'Prayer Kneeler':'🙏','Divine Mosaic':'✦','Bell Tower':'🔔','Incense Burner':'🌫',
      'Planar Rift':'🌀','Reality Crystal':'💎','Void Obelisk':'▲','Dimensional Anchor':'⚓',
      'Astral Web':'🕸','Outsider Effigy':'👹','Planar Map':'🗺','Energy Node':'⚡',
    };
    var icon = iconMap[type] || '●';
    // Shadow
    ctx.shadowColor   = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur    = 3;
    ctx.fillText(icon, cx, cy);
    ctx.shadowBlur    = 0;
    ctx.restore();
  }

  // ── Draw torchlight / ambient glow ────────────────────────────────────────
  function drawTorchGlow(ctx, cx, cy, radius, glowColor) {
    var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0,   glowColor);
    grad.addColorStop(0.5, glowColor.replace('0.', '0.0'));
    grad.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI*2);
    ctx.fill();
  }

  // ── Encounter badge on boss room ──────────────────────────────────────────
  function drawEncounterBadge(ctx, px, py, CELL, label, theme) {
    ctx.save();
    var badgeW = Math.min(CELL * 2.5, 70);
    var badgeH = 12;
    var bx = px + (CELL - badgeW) / 2;
    var by = py + CELL - badgeH - 1;
    ctx.fillStyle = 'rgba(139,26,26,0.85)';
    fillRoundRect(ctx, bx, by, badgeW, badgeH, 2);
    ctx.fill();
    ctx.font = 'bold 7px Georgia, serif';
    ctx.fillStyle = '#f5e6c8';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, bx + badgeW/2, by + badgeH/2);
    ctx.restore();
  }

  // ── Main dungeon map generator ─────────────────────────────────────────────
  function generateDungeonMap(canvas, campaign, locationName, opts) {
    opts = opts || {};
    var W   = canvas.width;
    var H   = canvas.height;
    var ctx = canvas.getContext('2d');
    var theme = getDungeonTheme(campaign);

    var seedStr = ((campaign && campaign.base && campaign.base.name) || 'dungeon') +
                  (locationName || '') + (opts.variation || 0);
    var seed = seedStr.split('').reduce(function(a,c){ return a + c.charCodeAt(0); }, 0);
    var rng  = seededRandom(seed);

    var CELL = 30;
    var COLS = Math.floor(W / CELL);
    var ROWS = Math.floor(H / CELL);

    // Grid values: 0=wall, 1=floor, 2=door, 3=secret, 4=stairsUp, 5=stairsDown, 6=water
    var grid = new Uint8Array(COLS * ROWS);
    var idx  = function(c, r) { return r * COLS + c; };

    // ── BSP room generation ───────────────────────────────────────────────
    var rooms = [];
    var MIN_ROOM = 4, MAX_ROOM = 9;

    function splitPartition(x, y, w, h, depth) {
      if (depth <= 0 || w < 8 || h < 8) {
        var rw = Math.max(MIN_ROOM, Math.floor(MIN_ROOM + rng() * Math.min(MAX_ROOM-MIN_ROOM, w-3)));
        var rh = Math.max(MIN_ROOM, Math.floor(MIN_ROOM + rng() * Math.min(MAX_ROOM-MIN_ROOM, h-3)));
        if (rw > w-2) rw = w-2;
        if (rh > h-2) rh = h-2;
        if (rw < MIN_ROOM || rh < MIN_ROOM) return;
        var rx = x + 1 + Math.floor(rng() * Math.max(1, w-rw-1));
        var ry = y + 1 + Math.floor(rng() * Math.max(1, h-rh-1));
        rooms.push({ x:rx, y:ry, w:rw, h:rh });
        for (var r=ry; r<ry+rh; r++)
          for (var c=rx; c<rx+rw; c++)
            if (r>=0&&r<ROWS&&c>=0&&c<COLS) grid[idx(c,r)]=1;
        return;
      }
      if (w > h || (w===h && rng()<0.5)) {
        var split = Math.floor(w*0.35 + rng()*w*0.3);
        splitPartition(x,y,split,h,depth-1);
        splitPartition(x+split,y,w-split,h,depth-1);
      } else {
        var split = Math.floor(h*0.35 + rng()*h*0.3);
        splitPartition(x,y,w,split,depth-1);
        splitPartition(x,y+split,w,h-split,depth-1);
      }
    }

    splitPartition(1, 1, COLS-2, ROWS-2, 4);

    // ── Connect rooms ─────────────────────────────────────────────────────
    function roomCenter(rm) {
      return { x: Math.floor(rm.x+rm.w/2), y: Math.floor(rm.y+rm.h/2) };
    }
    function carveLine(x1,y1,x2,y2) {
      var cx=x1, cy=y1;
      var steps=Math.abs(x2-x1)+Math.abs(y2-y1);
      for (var s=0;s<=steps;s++) {
        if (cx>=0&&cx<COLS&&cy>=0&&cy<ROWS) grid[idx(cx,cy)]=1;
        if (cx!==x2) cx+=cx<x2?1:-1;
        else if (cy!==y2) cy+=cy<y2?1:-1;
      }
    }
    for (var i=1; i<rooms.length; i++) {
      var a=roomCenter(rooms[i-1]), b=roomCenter(rooms[i]);
      if (rng()<0.5) { carveLine(a.x,a.y,b.x,a.y); carveLine(b.x,a.y,b.x,b.y); }
      else           { carveLine(a.x,a.y,a.x,b.y); carveLine(a.x,b.y,b.x,b.y); }
    }

    // ── Doors ─────────────────────────────────────────────────────────────
    for (var ri=0; ri<rooms.length; ri++) {
      var room = rooms[ri];
      var edges = [];
      for (var c=room.x; c<room.x+room.w; c++) {
        if (room.y>0 && grid[idx(c,room.y-1)]===1) edges.push([c,room.y,true]);
        if (room.y+room.h<ROWS && grid[idx(c,room.y+room.h)]===1) edges.push([c,room.y+room.h-1,true]);
      }
      for (var r=room.y; r<room.y+room.h; r++) {
        if (room.x>0 && grid[idx(room.x-1,r)]===1) edges.push([room.x,r,false]);
        if (room.x+room.w<COLS && grid[idx(room.x+room.w,r)]===1) edges.push([room.x+room.w-1,r,false]);
      }
      if (edges.length>0 && rng()<0.72) {
        var e=edges[Math.floor(rng()*edges.length)];
        grid[idx(e[0],e[1])] = rng()<0.12 ? 3 : 2;
      }
    }

    // ── Stairs ────────────────────────────────────────────────────────────
    if (rooms.length>=2) {
      var uc=roomCenter(rooms[0]), dc=roomCenter(rooms[rooms.length-1]);
      grid[idx(uc.x,uc.y)]=4;
      grid[idx(dc.x,dc.y)]=5;
    }

    // ── Water rooms (2-3 rooms get water floors) ──────────────────────────
    var waterRooms = new Set();
    var numWater = Math.floor(rooms.length * 0.15);
    for (var wi=0; wi<numWater; wi++) {
      var wroom = rooms[1 + Math.floor(rng()*(rooms.length-2))];
      if (wroom) {
        waterRooms.add(wroom);
        for (var wr=wroom.y; wr<wroom.y+wroom.h; wr++)
          for (var wc=wroom.x; wc<wroom.x+wroom.w; wc++)
            if (grid[idx(wc,wr)]===1) grid[idx(wc,wr)]=6;
      }
    }

    // ── Features ──────────────────────────────────────────────────────────
    var featurePool = theme.features;
    var features    = [];
    for (var fi=0; fi<rooms.length; fi++) {
      var froom = rooms[fi];
      if (froom.w>=4 && froom.h>=4 && rng()<0.6) {
        var fx = froom.x+1+Math.floor(rng()*(froom.w-2));
        var fy = froom.y+1+Math.floor(rng()*(froom.h-2));
        if (grid[idx(fx,fy)]>=1) {
          features.push({ x:fx, y:fy, type:pick(featurePool, rng) });
        }
      }
    }

    // ════ RENDER ════

    // ── Background (wall fill) ────────────────────────────────────────────
    ctx.fillStyle = theme.wallFill;
    ctx.fillRect(0, 0, W, H);

    // Add subtle wall texture
    for (var tx=0; tx<COLS; tx++) {
      for (var ty=0; ty<ROWS; ty++) {
        if (grid[idx(tx,ty)]===0) {
          if (rng()<0.03) {
            ctx.fillStyle='rgba(255,255,255,0.03)';
            ctx.fillRect(tx*CELL+rng()*CELL, ty*CELL+rng()*CELL, 4, 4);
          }
        }
      }
    }

    // ── Draw floor tiles ──────────────────────────────────────────────────
    for (var tr=0; tr<ROWS; tr++) {
      for (var tc=0; tc<COLS; tc++) {
        var v = grid[idx(tc,tr)];
        var px = tc*CELL, py = tr*CELL;
        if (v===0) continue;
        drawFloorTile(ctx, px, py, CELL, theme, rng, v===6);
        // Grid lines
        ctx.strokeStyle = theme.gridColor;
        ctx.lineWidth   = 0.5;
        ctx.strokeRect(px, py, CELL, CELL);
      }
    }

    // ── Draw wall edges (thick lines on floor/wall boundaries) ────────────
    for (var wr2=0; wr2<ROWS; wr2++) {
      for (var wc2=0; wc2<COLS; wc2++) {
        if (grid[idx(wc2,wr2)]<1) continue;
        var px2 = wc2*CELL, py2 = wr2*CELL;
        var nb = [[wc2,wr2-1,'top'],[wc2+1,wr2,'right'],[wc2,wr2+1,'bottom'],[wc2-1,wr2,'left']];
        for (var ni=0; ni<nb.length; ni++) {
          var nc=nb[ni][0], nr=nb[ni][1], side=nb[ni][2];
          if (nc<0||nc>=COLS||nr<0||nr>=ROWS||grid[idx(nc,nr)]===0) {
            drawWallEdge(ctx, px2, py2, CELL, side, theme);
          }
        }
      }
    }

    // ── Torchlight / glow pass ────────────────────────────────────────────
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.7;
    for (var gi=0; gi<rooms.length; gi++) {
      var groom = rooms[gi];
      var gc = roomCenter(groom);
      drawTorchGlow(ctx, gc.x*CELL+CELL/2, gc.y*CELL+CELL/2, CELL*2.5, theme.glowColor);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    // ── Draw doors ────────────────────────────────────────────────────────
    for (var dr=0; dr<ROWS; dr++) {
      for (var dc2=0; dc2<COLS; dc2++) {
        var dv=grid[idx(dc2,dr)];
        if (dv!==2 && dv!==3) continue;
        var dcx=dc2*CELL+CELL/2, dcy=dr*CELL+CELL/2;
        // Determine orientation by checking neighbors
        var horizNeighbors = (dc2>0&&grid[idx(dc2-1,dr)]>=1) || (dc2<COLS-1&&grid[idx(dc2+1,dr)]>=1);
        drawDoor(ctx, dcx, dcy, CELL, theme, horizNeighbors, dv===3);
      }
    }

    // ── Draw stairs ───────────────────────────────────────────────────────
    for (var sr=0; sr<ROWS; sr++) {
      for (var sc2=0; sc2<COLS; sc2++) {
        var sv=grid[idx(sc2,sr)];
        if (sv!==4&&sv!==5) continue;
        drawStairs(ctx, sc2*CELL, sr*CELL, CELL, theme, sv===4);
      }
    }

    // ── Draw features ─────────────────────────────────────────────────────
    for (var fj=0; fj<features.length; fj++) {
      var f=features[fj];
      var fcx=f.x*CELL+CELL/2, fcy=f.y*CELL+CELL/2;
      drawFeatureIcon(ctx, fcx, fcy, f.type, theme);
    }

    // ── Room labels ───────────────────────────────────────────────────────
    var labels = generateThemedRoomLabels(rooms, campaign, rng, theme);
    ctx.font        = 'bold 7px Georgia,serif';
    ctx.textAlign   = 'center';
    ctx.textBaseline= 'top';
    for (var li=0; li<Math.min(labels.length,rooms.length); li++) {
      var lroom=rooms[li];
      var lpx=(lroom.x+lroom.w/2)*CELL;
      var lpy=lroom.y*CELL+2;
      var tw=ctx.measureText(labels[li]).width;
      var isBoss=(li===rooms.length-1);
      // Label background
      ctx.fillStyle=isBoss?'rgba(100,10,10,0.82)':'rgba(0,0,0,0.55)';
      fillRoundRect(ctx, lpx-tw/2-3, lpy, tw+6, 10, 2);
      ctx.fill();
      ctx.fillStyle=isBoss?'#f5e6c8':theme.accentColor;
      ctx.fillText(labels[li], lpx, lpy+1);
      // Boss badge
      if (isBoss) {
        drawEncounterBadge(ctx, lroom.x*CELL, lroom.y*CELL, CELL, '⚔ BOSS');
      } else if (li===0) {
        drawEncounterBadge(ctx, lroom.x*CELL, lroom.y*CELL, CELL, '▲ ENTRY');
      }
    }

    // ── Water labels ──────────────────────────────────────────────────────
    ctx.font='bold 6px Georgia,serif';
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    waterRooms.forEach(function(wroom) {
      var wlx=(wroom.x+wroom.w/2)*CELL;
      var wly=(wroom.y+wroom.h/2)*CELL;
      ctx.fillText('~ WATER ~', wlx, wly);
    });

    // ── Border ────────────────────────────────────────────────────────────
    ctx.strokeStyle=theme.accentColor;
    ctx.lineWidth=3;
    ctx.strokeRect(2,2,W-4,H-4);
    ctx.strokeStyle=theme.featureFill;
    ctx.lineWidth=1;
    ctx.strokeRect(5,5,W-10,H-10);

    // ── Title banner ──────────────────────────────────────────────────────
    var mapTitle = locationName || (campaign&&campaign.locations&&campaign.locations[1]) || 'Dungeon Level 1';
    var fullTitle = theme.name + ': ' + mapTitle;
    ctx.font='bold 11px Georgia,serif';
    ctx.textAlign='left'; ctx.textBaseline='top';
    var ttw=ctx.measureText(fullTitle).width;
    ctx.fillStyle='rgba(0,0,0,0.75)';
    fillRoundRect(ctx,6,6,ttw+16,18,3);
    ctx.fill();
    ctx.fillStyle=theme.accentColor;
    ctx.fillText(fullTitle,14,9);

    // ── Legend ────────────────────────────────────────────────────────────
    drawDungeonLegend(ctx, W-145, H-100, theme);

    // ── Grid scale ────────────────────────────────────────────────────────
    ctx.font='9px Georgia,serif';
    ctx.fillStyle='rgba(255,255,255,0.4)';
    ctx.textAlign='left'; ctx.textBaseline='top';
    ctx.fillText('1 square = 5 ft', 10, H-20);

    return { rooms:rooms, features:features, theme:theme.name };
  }

  function drawDungeonLegend(ctx, x, y, theme) {
    ctx.save();
    var h=100, w=137;
    ctx.fillStyle='rgba(0,0,0,0.72)';
    fillRoundRect(ctx,x,y,w,h,4);
    ctx.fill();
    ctx.strokeStyle=theme.accentColor;
    ctx.lineWidth=1;
    fillRoundRect(ctx,x,y,w,h,4);
    ctx.stroke();
    ctx.font='bold 8px Georgia,serif';
    ctx.fillStyle=theme.accentColor;
    ctx.textAlign='left';
    ctx.fillText('LEGEND', x+6, y+5);
    var items=[
      { sym:'▪', col:theme.doorFill,    label:'Door' },
      { sym:'S', col:theme.secretFill,  label:'Secret Door' },
      { sym:'▲', col:theme.stairFill,   label:'Stairs Up' },
      { sym:'▼', col:theme.stairFill,   label:'Stairs Down' },
      { sym:'~', col:theme.waterFill,   label:'Water / Hazard' },
      { sym:'●', col:theme.featureFill, label:'Feature / Object' },
      { sym:'⚔', col:'#8b1a1a',         label:'Boss Chamber' },
    ];
    for (var i=0; i<items.length; i++) {
      var it=items[i];
      var ly=y+18+i*12;
      ctx.font='10px sans-serif';
      ctx.fillStyle=it.col;
      ctx.fillText(it.sym, x+7, ly);
      ctx.font='7px Georgia,serif';
      ctx.fillStyle='rgba(255,255,255,0.75)';
      ctx.fillText(it.label, x+22, ly);
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
