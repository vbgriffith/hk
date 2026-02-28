/**
 * js/factionMap.js
 * Phase 2: Interactive faction relationship visualizer.
 * Renders factions as nodes on a canvas with relationship edges,
 * attitude indicators, and an interactive legend.
 */

const FactionMap = (() => {
  'use strict';

  // Relationship types between any two factions
  const REL_TYPES = [
    { key: 'allied',    label: 'Allied',       color: '#2a8a40', dash: [],      weight: 2.5  },
    { key: 'neutral',   label: 'Neutral',      color: '#8a8a4a', dash: [5,4],   weight: 1.5  },
    { key: 'hostile',   label: 'Hostile',      color: '#8a2a2a', dash: [],      weight: 2.5  },
    { key: 'secret',    label: 'Secret Deal',  color: '#4a2a7a', dash: [2,5],   weight: 1.5  },
    { key: 'proxy',     label: 'Proxy War',    color: '#8a5a10', dash: [8,3,2,3],weight:2    },
    { key: 'rival',     label: 'Rivals',       color: '#7a4a10', dash: [4,3],   weight: 2    },
  ];

  // Node colours by role
  const ROLE_COLORS = {
    'Ally':                   { fill: '#1a4a20', stroke: '#2a8a40', text: '#aaeaaa' },
    'Villain':                { fill: '#4a1010', stroke: '#8a2a2a', text: '#ffaaaa' },
    'Villain (secondary)':    { fill: '#5a2010', stroke: '#9a4a2a', text: '#ffccaa' },
    'Wildcard':               { fill: '#3a3a10', stroke: '#8a8a20', text: '#eeeeaa' },
    'Employer/Ally':          { fill: '#1a2a4a', stroke: '#2a5a8a', text: '#aaccff' },
    'Antagonist (initially)': { fill: '#4a2a10', stroke: '#8a5a20', text: '#ffddaa' },
    'Situational Ally':       { fill: '#2a3a20', stroke: '#5a7a40', text: '#bbffaa' },
    'default':                { fill: '#2a2a3a', stroke: '#6a6a8a', text: '#ccccee' },
  };

  // Seeded PRNG
  function rng(seed) {
    let s = seed >>> 0;
    return function() {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // Lay out nodes in a force-relaxed circle arrangement
  function layoutNodes(factions, W, H) {
    const n = factions.length;
    const cx = W / 2, cy = H / 2;
    const radius = Math.min(W, H) * 0.32;
    const nodes = factions.map((f, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      return {
        id:     i,
        faction: f,
        x:      cx + Math.cos(angle) * radius,
        y:      cy + Math.sin(angle) * radius,
        vx: 0, vy: 0,
        r:  42,
      };
    });
    // Simple force relaxation
    for (let iter = 0; iter < 80; iter++) {
      for (let a = 0; a < nodes.length; a++) {
        for (let b = a + 1; b < nodes.length; b++) {
          const dx = nodes[b].x - nodes[a].x;
          const dy = nodes[b].y - nodes[a].y;
          const dist = Math.hypot(dx, dy) || 1;
          const minDist = 110;
          if (dist < minDist) {
            const f = (minDist - dist) / dist * 0.3;
            nodes[a].x -= dx * f; nodes[a].y -= dy * f;
            nodes[b].x += dx * f; nodes[b].y += dy * f;
          }
        }
      }
      // Attract to centre
      for (const nd of nodes) {
        const dx = cx - nd.x, dy = cy - nd.y;
        nd.x += dx * 0.02;
        nd.y += dy * 0.02;
        // Clamp to canvas
        nd.x = Math.max(nd.r + 5, Math.min(W - nd.r - 5, nd.x));
        nd.y = Math.max(nd.r + 5, Math.min(H - nd.r - 5, nd.y));
      }
    }
    return nodes;
  }

  // Generate relationships deterministically from campaign data
  function buildRelationships(factions, rand) {
    const edges = [];
    for (let a = 0; a < factions.length; a++) {
      for (let b = a + 1; b < factions.length; b++) {
        const fa = factions[a];
        const fb = factions[b];
        // Determine relationship based on roles
        const bothGood = ['Ally','Employer/Ally','Situational Ally'].includes(fa.role) &&
                         ['Ally','Employer/Ally','Situational Ally'].includes(fb.role);
        const bothEvil = ['Villain','Villain (secondary)'].includes(fa.role) &&
                         ['Villain','Villain (secondary)'].includes(fb.role);
        const oneVillain = ['Villain','Villain (secondary)'].includes(fa.role) ||
                           ['Villain','Villain (secondary)'].includes(fb.role);

        let relKey;
        const r = rand();
        if (bothGood)       relKey = r < 0.7 ? 'allied'  : 'neutral';
        else if (bothEvil)  relKey = r < 0.5 ? 'rival'   : (r < 0.75 ? 'proxy' : 'secret');
        else if (oneVillain)relKey = r < 0.6 ? 'hostile' : (r < 0.8 ? 'rival' : 'secret');
        else                relKey = r < 0.4 ? 'neutral' : (r < 0.7 ? 'allied' : 'rival');

        const rel = REL_TYPES.find(rt => rt.key === relKey) || REL_TYPES[1];
        const notes = generateRelNote(fa, fb, relKey, rand);
        edges.push({ a, b, rel, notes });
      }
    }
    return edges;
  }

  function generateRelNote(fa, fb, relKey, rand) {
    const templates = {
      allied:  [`${fa.name} provides resources; ${fb.name} provides protection.`,
                `Shared enemy brought them together. The alliance is fragile.`,
                `Historical treaty — neither side fully trusts the other.`],
      neutral: [`${fa.name} and ${fb.name} avoid each other's territory.`,
                `Open communication; no formal agreement.`,
                `Mutual observers. Neither wants conflict.`],
      hostile: [`Active skirmishes along shared borders.`,
                `${fa.name} blames ${fb.name} for a past atrocity.`,
                `Competing directly for the same resource.`],
      secret:  [`Hidden correspondence that neither side has disclosed to allies.`,
                `A silent non-aggression pact that would scandalise both factions' allies.`,
                `${fa.name} secretly funds ${fb.name}'s rivals while negotiating.`],
      proxy:   [`Fighting through intermediary agents and hired mercenaries.`,
                `Each faction arms the other's enemies without direct confrontation.`,
                `The war is officially denied by both leaderships.`],
      rival:   [`Competing for political influence in the same region.`,
                `Ideological opposition — their goals are mutually exclusive.`,
                `A deep grudge from a betrayal two generations ago.`],
    };
    const pool = templates[relKey] || templates.neutral;
    return pool[Math.floor(rand() * pool.length)];
  }

  // ─── RENDER ──────────────────────────────────────────
  function render(canvas, campaign) {
    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext('2d');
    const factions = campaign?.factions || [];
    if (factions.length === 0) {
      ctx.fillStyle = '#2a2420';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#c9b68a';
      ctx.font = '14px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('No factions in this campaign.', W/2, H/2);
      return;
    }

    const seedStr = (campaign?.base?.name || '') + factions.map(f => f.name).join('');
    const seed = seedStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const rand = rng(seed);

    const nodes = layoutNodes(factions, W, H);
    const edges = buildRelationships(factions, rand);

    // ── Background ────────────────────────────────────────
    const bgGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.7);
    bgGrad.addColorStop(0, '#1a1510');
    bgGrad.addColorStop(1, '#0a0805');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Faint grid
    ctx.strokeStyle = 'rgba(201,151,58,0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // ── Edges ─────────────────────────────────────────────
    for (const edge of edges) {
      const na = nodes[edge.a], nb = nodes[edge.b];
      const rel = edge.rel;
      ctx.save();
      ctx.strokeStyle = rel.color;
      ctx.lineWidth = rel.weight;
      ctx.setLineDash(rel.dash);
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      // Slight curve for readability
      const mx = (na.x + nb.x) / 2 + (nb.y - na.y) * 0.1;
      const my = (na.y + nb.y) / 2 - (nb.x - na.x) * 0.1;
      ctx.quadraticCurveTo(mx, my, nb.x, nb.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label on edge midpoint
      const lx = (na.x + nb.x) / 2;
      const ly = (na.y + nb.y) / 2;
      ctx.globalAlpha = 0.9;
      ctx.font = '9px Georgia, serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tw = ctx.measureText(rel.label).width;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(lx - tw/2 - 3, ly - 7, tw + 6, 14);
      ctx.fillStyle = rel.color;
      ctx.fillText(rel.label, lx, ly);
      ctx.restore();
    }

    // ── Nodes ─────────────────────────────────────────────
    for (const nd of nodes) {
      const f = nd.faction;
      const roleKey = f.role || 'default';
      const cols = ROLE_COLORS[roleKey] || ROLE_COLORS.default;
      const r = nd.r;

      // Glow
      const grd = ctx.createRadialGradient(nd.x, nd.y, r * 0.4, nd.x, nd.y, r * 2);
      grd.addColorStop(0, cols.stroke + '44');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(nd.x, nd.y, r * 2, 0, Math.PI * 2);
      ctx.fill();

      // Node body (hexagon shape)
      ctx.save();
      ctx.translate(nd.x, nd.y);
      ctx.fillStyle = cols.fill;
      ctx.strokeStyle = cols.stroke;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI / 3) - Math.PI / 6;
        const px = Math.cos(a) * r, py = Math.sin(a) * r;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Role badge (small triangle at top)
      const isVillain = roleKey.includes('Villain');
      const isAlly = roleKey.includes('Ally') || roleKey === 'Employer/Ally';
      ctx.fillStyle = isVillain ? '#8a2a2a' : (isAlly ? '#2a7a40' : '#5a5a1a');
      ctx.beginPath();
      ctx.arc(r * 0.55, -r * 0.62, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(isVillain ? '✕' : (isAlly ? '✓' : '?'), r * 0.55, -r * 0.62);

      // Faction name (wrapped)
      const words = f.name.split(' ');
      const lines = [];
      let line = '';
      const maxW = r * 1.6;
      ctx.font = 'bold 9px Georgia, serif';
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxW && line) {
          lines.push(line); line = word;
        } else { line = test; }
      }
      if (line) lines.push(line);
      const totalH = lines.length * 12;
      ctx.fillStyle = cols.text;
      lines.forEach((l, i) => {
        ctx.fillText(l, 0, -totalH/2 + i * 12 + 6);
      });

      // Role sub-label
      ctx.font = '7px Georgia, serif';
      ctx.fillStyle = cols.stroke;
      ctx.fillText(f.role || '', 0, r * 0.62);

      ctx.restore();
    }

    // ── Title ─────────────────────────────────────────────
    ctx.font = 'bold 14px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(201,151,58,0.9)';
    ctx.fillText('Faction Relationship Map', W/2, 22);

    // ── Legend ────────────────────────────────────────────
    drawLegend(ctx, W, H);
  }

  function drawLegend(ctx, W, H) {
    const x = 10, y = H - (REL_TYPES.length * 14) - 20;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x - 4, y - 16, 160, REL_TYPES.length * 14 + 20);
    ctx.font = 'bold 9px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#c9973a';
    ctx.fillText('RELATIONSHIP KEY', x, y - 4);
    REL_TYPES.forEach((rel, i) => {
      const ly = y + i * 14 + 6;
      ctx.strokeStyle = rel.color; ctx.lineWidth = rel.weight;
      ctx.setLineDash(rel.dash);
      ctx.beginPath(); ctx.moveTo(x, ly); ctx.lineTo(x + 24, ly); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '9px Georgia, serif';
      ctx.fillStyle = rel.color;
      ctx.fillText(rel.label, x + 30, ly + 3);
    });
  }

  // ─── TOOLTIP DATA (for hover in UI) ──────────────────
  function getEdgeAt(nodes, edges, px, py, tol = 12) {
    for (const edge of edges) {
      const na = nodes[edge.a], nb = nodes[edge.b];
      // Distance from point to line segment
      const dx = nb.x - na.x, dy = nb.y - na.y;
      const len = Math.hypot(dx, dy);
      if (len === 0) continue;
      const t = Math.max(0, Math.min(1, ((px - na.x) * dx + (py - na.y) * dy) / (len * len)));
      const nx = na.x + t * dx - px, ny = na.y + t * dy - py;
      if (Math.hypot(nx, ny) < tol) return edge;
    }
    return null;
  }

  function getNodeAt(nodes, px, py) {
    for (const nd of nodes) {
      if (Math.hypot(nd.x - px, nd.y - py) < nd.r) return nd;
    }
    return null;
  }

  // Full render + return interactive state for UI tooltip layer
  function renderInteractive(canvas, campaign) {
    const W = canvas.width, H = canvas.height;
    const factions = campaign?.factions || [];
    const seedStr = (campaign?.base?.name || '') + factions.map(f => f.name).join('');
    const seed = seedStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const rand = rng(seed);
    const nodes = layoutNodes(factions, W, H);
    const edges = buildRelationships(factions, rand);
    render(canvas, campaign);
    return { nodes, edges, getNodeAt, getEdgeAt };
  }

  return { render, renderInteractive };

})();
