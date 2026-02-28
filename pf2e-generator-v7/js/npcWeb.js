/**
 * js/npcWeb.js -- Build 7
 * NPC Relationship Web: person-level diagram showing named NPCs, their
 * connections, leverage, trust, and roles relative to the villain.
 */

var NpcWeb = (function() {
  'use strict';

  // ── Relationship types ───────────────────────────────────────────────────
  var REL_TYPES = {
    trust:      { color: '#2a7a2a', dash: [],        label: 'Trusts',         width: 2.5 },
    ally:       { color: '#1a5a9a', dash: [],        label: 'Allied with',    width: 2 },
    loves:      { color: '#9a1a5a', dash: [],        label: 'Loves',          width: 3 },
    serves:     { color: '#5a3a1a', dash: [5,3],     label: 'Serves',         width: 2 },
    rivals:     { color: '#c9973a', dash: [8,4],     label: 'Rivals',         width: 2 },
    hostile:    { color: '#8b1a1a', dash: [4,4],     label: 'Hostile to',     width: 2.5 },
    leverage:   { color: '#6a1a9a', dash: [10,3,2,3],label: 'Has leverage on',width: 2 },
    secret:     { color: '#3a3a3a', dash: [2,6],     label: 'Secret tie to',  width: 1.5 },
    family:     { color: '#7a5a1a', dash: [],        label: 'Family of',      width: 2 },
    informant:  { color: '#1a7a7a', dash: [6,3],     label: 'Informs on',     width: 1.5 },
  };

  // ── NPC role colors ──────────────────────────────────────────────────────
  var ROLE_COLORS = {
    villain:   { bg: '#3a0a0a', border: '#8b1a1a', text: '#ffd0d0', icon: '💀' },
    ally:      { bg: '#0a2a0a', border: '#1a7a1a', text: '#d0ffd0', icon: '⚔' },
    neutral:   { bg: '#1a1a2a', border: '#5a5a9a', text: '#d0d0ff', icon: '⚖' },
    informant: { bg: '#0a2a2a', border: '#1a7a7a', text: '#d0ffff', icon: '🕵' },
    patron:    { bg: '#2a1a0a', border: '#8b6a1a', text: '#fff0d0', icon: '👑' },
    lieutenant:{ bg: '#2a0a2a', border: '#7a1a7a', text: '#ffd0ff', icon: '🗡' },
    bystander: { bg: '#1a1a1a', border: '#5a5a5a', text: '#e0e0e0', icon: '👤' },
    merchant:  { bg: '#1a2a0a', border: '#5a7a1a', text: '#e0f0d0', icon: '🪙' },
    priest:    { bg: '#1a1a3a', border: '#3a3a9a', text: '#d8d8ff', icon: '✦' },
    noble:     { bg: '#2a1a1a', border: '#9a7a1a', text: '#ffe8c0', icon: '🏰' },
  };

  // ── NPC generation from campaign data ───────────────────────────────────
  function buildNPCGraph(campaign) {
    if (!campaign) return null;

    var npcs  = [];
    var links = [];
    var id    = 0;

    function npc(name, role, note, group) {
      npcs.push({ id: id++, name: name, role: role, note: note, group: group || 'core', x: 0, y: 0, vx: 0, vy: 0 });
      return id - 1;
    }
    function link(a, b, type, label) {
      links.push({ a: a, b: b, type: type, label: label || '' });
    }

    // Always: villain at center
    var villain = npc(
      campaign.villain ? campaign.villain.name || 'The Villain' : 'Unknown Antagonist',
      'villain',
      campaign.villain ? (campaign.villain.motivation || 'Unknown motives') : '',
      'villain'
    );

    // Lieutenants (from villain lieutenants, or generate)
    var lts = campaign.villain && campaign.villain.lieutenants ? campaign.villain.lieutenants : [];
    var ltIds = lts.slice(0, 3).map(function(lt) {
      var ltId = npc(lt.name || 'Lieutenant', 'lieutenant', lt.role || 'Enforcer', 'villain');
      link(villain, ltId, 'serves', 'commands');
      return ltId;
    });

    // If no lieutenants in data, generate 2 generic ones
    if (ltIds.length === 0) {
      var lt1 = npc('The Enforcer', 'lieutenant', 'Carries out orders', 'villain');
      var lt2 = npc('The Spy', 'informant', 'Gathers intelligence', 'villain');
      link(villain, lt1, 'serves', 'commands');
      link(villain, lt2, 'serves', 'directs');
      ltIds = [lt1, lt2];
    }

    // Patron NPC (who hired / supports the party)
    var patronName = campaign.patronNPC || 'Lord Castellan Varro';
    var patron = npc(patronName, 'patron', 'Party\'s primary contact and employer', 'party');

    // Key allied NPCs from the campaign (session zero, act NPCs)
    var allyNames = extractAllyNames(campaign);
    var allyIds = allyNames.slice(0, 4).map(function(a) {
      var aId = npc(a.name, a.role || 'ally', a.note || 'Party contact', 'allies');
      link(patron, aId, 'trust', 'vouches for');
      return aId;
    });

    // Neutral / bystander NPCs (shopkeepers, priests, bystanders with info)
    var neutralNames = extractNeutralNames(campaign);
    var neutralIds = neutralNames.slice(0, 3).map(function(n) {
      var nId = npc(n.name, n.role || 'bystander', n.note || 'Uninvolved but observant', 'neutral');
      return nId;
    });

    // Cross-connections: add interesting relationships
    if (allyIds.length >= 2) {
      link(allyIds[0], allyIds[1], 'rivals', 'competes with');
    }
    if (allyIds.length >= 1 && neutralIds.length >= 1) {
      link(allyIds[0], neutralIds[0], 'trust', 'knows');
    }
    if (ltIds.length >= 1 && neutralIds.length >= 1) {
      link(ltIds[0], neutralIds[0], 'leverage', 'controls');
    }
    if (ltIds.length >= 2) {
      link(ltIds[0], ltIds[1], 'rivals', 'competes with');
    }
    if (allyIds.length >= 1) {
      // Secret tie: one ally has a hidden connection to the villain
      link(villain, allyIds[allyIds.length - 1], 'secret', 'hidden past with');
    }
    if (neutralIds.length >= 1) {
      link(neutralIds[0], patron, 'informant', 'reports to');
    }

    // Party node
    var party = npc('The Party', 'ally', 'Player characters', 'party');
    link(party, patron, 'trust', 'hired by');
    allyIds.forEach(function(aId) { link(party, aId, 'ally', 'works with'); });

    // Link villain to patron (hostile)
    link(villain, patron, 'hostile', 'opposes');

    return { npcs: npcs, links: links, villain: villain, party: party };
  }

  function extractAllyNames(campaign) {
    var result = [];
    // Try session zero player characters
    if (campaign.sessionZero && campaign.sessionZero.playerCharacters) {
      campaign.sessionZero.playerCharacters.forEach(function(pc) {
        if (pc.name) result.push({ name: pc.name, role: 'ally', note: 'Player character' });
      });
    }
    // Try key NPC list
    if (campaign.keyNPCs) {
      campaign.keyNPCs.forEach(function(n) {
        result.push({ name: n.name, role: n.alignment === 'evil' ? 'neutral' : 'ally', note: n.role || '' });
      });
    }
    // Fallback: generate named allies
    if (result.length < 3) {
      var fallbacks = [
        { name: 'Captain Serena Voss',   role: 'ally',    note: 'City watch captain, uneasy ally' },
        { name: 'Aldric the Fence',       role: 'merchant',note: 'Information broker with divided loyalties' },
        { name: 'Sister Callindra',       role: 'priest',  note: 'Healer with knowledge of the villain\'s history' },
        { name: 'Miran Dusk',             role: 'noble',   note: 'Noble heir caught in the middle' },
      ];
      fallbacks.forEach(function(f) { if (result.length < 4) result.push(f); });
    }
    return result;
  }

  function extractNeutralNames(campaign) {
    var result = [
      { name: 'Tavern Keeper Hobbs',  role: 'bystander', note: 'Sees everything, says little' },
      { name: 'The Fence',            role: 'merchant',  note: 'Deals in information and stolen goods' },
      { name: 'City Archivist Venn',  role: 'bystander', note: 'Holds records the villain wants buried' },
    ];
    return result;
  }

  // ── Layout: force-directed positions ────────────────────────────────────
  function layoutGraph(graph, width, height) {
    var npcs  = graph.npcs;
    var links = graph.links;
    var cx = width / 2, cy = height / 2;

    // Initial placement by group
    npcs.forEach(function(n) {
      if (n.group === 'villain') {
        n.x = cx + (Math.random() - 0.5) * 120;
        n.y = cy - 100 + (Math.random() - 0.5) * 80;
      } else if (n.role === 'villain') {
        n.x = cx; n.y = cy - 180;
      } else if (n.group === 'party') {
        n.x = cx + (Math.random() - 0.5) * 200;
        n.y = cy + 120 + (Math.random() - 0.5) * 80;
      } else if (n.group === 'allies') {
        var angle = (npcs.filter(function(x) { return x.group === 'allies'; }).indexOf(n) /
                     Math.max(1, npcs.filter(function(x) { return x.group === 'allies'; }).length)) * Math.PI + Math.PI;
        n.x = cx + Math.cos(angle) * 200;
        n.y = cy + Math.sin(angle) * 120;
      } else {
        n.x = cx + (Math.random() - 0.5) * 300;
        n.y = cy + (Math.random() - 0.5) * 200;
      }
    });

    // Simple force simulation
    for (var iter = 0; iter < 120; iter++) {
      // Repulsion
      for (var i = 0; i < npcs.length; i++) {
        for (var j = i + 1; j < npcs.length; j++) {
          var dx = npcs[j].x - npcs[i].x;
          var dy = npcs[j].y - npcs[i].y;
          var dist = Math.sqrt(dx * dx + dy * dy) || 1;
          var force = 6000 / (dist * dist);
          var fx = (dx / dist) * force;
          var fy = (dy / dist) * force;
          npcs[i].vx -= fx; npcs[i].vy -= fy;
          npcs[j].vx += fx; npcs[j].vy += fy;
        }
      }
      // Attraction along links
      links.forEach(function(lk) {
        var a = npcs[lk.a], b = npcs[lk.b];
        if (!a || !b) return;
        var dx = b.x - a.x, dy = b.y - a.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        var ideal = 160;
        var force = (dist - ideal) * 0.03;
        var fx = (dx / dist) * force, fy = (dy / dist) * force;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      });
      // Center gravity
      npcs.forEach(function(n) {
        n.vx += (cx - n.x) * 0.005;
        n.vy += (cy - n.y) * 0.005;
      });
      // Integrate + dampen
      npcs.forEach(function(n) {
        n.x += n.vx * 0.4; n.y += n.vy * 0.4;
        n.vx *= 0.7; n.vy *= 0.7;
        // Clamp to canvas
        var pad = 70;
        n.x = Math.max(pad, Math.min(width - pad, n.x));
        n.y = Math.max(pad, Math.min(height - pad, n.y));
      });
    }
  }

  // ── Drawing ──────────────────────────────────────────────────────────────
  function draw(canvas, campaign) {
    if (!canvas) return;
    var W = canvas.width  || 900;
    var H = canvas.height || 600;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var graph = buildNPCGraph(campaign);
    if (!graph) return;
    layoutGraph(graph, W, H);

    var npcs  = graph.npcs;
    var links = graph.links;

    // Background
    ctx.fillStyle = '#0f0a05';
    ctx.fillRect(0, 0, W, H);

    // Subtle grid
    ctx.strokeStyle = 'rgba(90,60,20,0.1)';
    ctx.lineWidth = 0.5;
    for (var gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke(); }
    for (var gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke(); }

    // Title
    ctx.font = 'bold 14px Georgia, serif';
    ctx.fillStyle = '#c9973a';
    ctx.textAlign = 'center';
    ctx.fillText('NPC Relationship Web', W/2, 22);
    ctx.font = '10px Georgia, serif';
    ctx.fillStyle = 'rgba(200,160,80,0.5)';
    ctx.fillText(campaign ? campaign.title || '' : '', W/2, 38);

    // Draw links
    links.forEach(function(lk) {
      var a = npcs[lk.a], b = npcs[lk.b];
      if (!a || !b) return;
      var rel = REL_TYPES[lk.type] || REL_TYPES.trust;

      ctx.save();
      ctx.strokeStyle = rel.color;
      ctx.lineWidth   = rel.width;
      ctx.setLineDash(rel.dash);
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      // Arrowhead
      var angle = Math.atan2(b.y - a.y, b.x - a.x);
      var dist  = Math.sqrt((b.x-a.x)**2 + (b.y-a.y)**2);
      var tip   = { x: a.x + (b.x-a.x) * (dist - 32) / dist, y: a.y + (b.y-a.y) * (dist - 32) / dist };
      ctx.globalAlpha = 0.9;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(tip.x, tip.y);
      ctx.lineTo(tip.x - 10 * Math.cos(angle - 0.4), tip.y - 10 * Math.sin(angle - 0.4));
      ctx.lineTo(tip.x - 10 * Math.cos(angle + 0.4), tip.y - 10 * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fillStyle = rel.color;
      ctx.fill();

      // Link label midpoint
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      ctx.globalAlpha = 0.85;
      ctx.font = 'italic 9px sans-serif';
      ctx.fillStyle = rel.color;
      ctx.textAlign = 'center';
      var labelText = lk.label || rel.label;
      // Small background pill
      var tw = ctx.measureText(labelText).width;
      ctx.fillStyle = 'rgba(10,6,2,0.75)';
      ctx.fillRect(mx - tw/2 - 3, my - 8, tw + 6, 11);
      ctx.fillStyle = rel.color;
      ctx.fillText(labelText, mx, my);
      ctx.restore();
    });

    // Draw NPC nodes
    npcs.forEach(function(n) {
      var rc = ROLE_COLORS[n.role] || ROLE_COLORS.bystander;
      var r  = n.role === 'villain' ? 36 : (n.group === 'party' ? 30 : 26);

      // Glow
      ctx.save();
      var grd = ctx.createRadialGradient(n.x, n.y, r*0.5, n.x, n.y, r*2);
      grd.addColorStop(0, rc.border + '44');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Node circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = rc.bg;
      ctx.fill();
      ctx.strokeStyle = rc.border;
      ctx.lineWidth = n.role === 'villain' ? 3 : 2;
      ctx.stroke();

      // Icon
      ctx.font = (n.role === 'villain' ? 18 : 14) + 'px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rc.icon, n.x, n.y - 5);

      // Name
      ctx.font = 'bold ' + (n.role === 'villain' ? 11 : 10) + 'px Georgia, serif';
      ctx.fillStyle = rc.text;
      ctx.textBaseline = 'alphabetic';

      // Word-wrap name
      var words = n.name.split(' ');
      var line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
      var line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
      ctx.fillText(line1, n.x, n.y + r + 13);
      if (line2) ctx.fillText(line2, n.x, n.y + r + 24);

      // Note (small italic below name)
      if (n.note && n.role !== 'villain') {
        ctx.font = 'italic 8px sans-serif';
        ctx.fillStyle = rc.text + 'aa';
        var noteText = n.note.length > 22 ? n.note.slice(0, 22) + '…' : n.note;
        ctx.fillText(noteText, n.x, n.y + r + 34);
      }
      ctx.restore();
    });

    // Legend
    drawLegend(ctx, W, H);
  }

  function drawLegend(ctx, W, H) {
    var legendX = 12, legendY = H - 12;
    var entries = [
      { type: 'trust',    label: 'Trusts' },
      { type: 'hostile',  label: 'Hostile' },
      { type: 'leverage', label: 'Leverage' },
      { type: 'secret',   label: 'Secret' },
      { type: 'serves',   label: 'Serves' },
    ];

    // Background
    ctx.fillStyle = 'rgba(10,6,2,0.8)';
    ctx.fillRect(legendX - 4, legendY - entries.length * 14 - 16, 110, entries.length * 14 + 20);

    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#c9973a';
    ctx.textAlign = 'left';
    ctx.fillText('RELATIONSHIP KEY', legendX, legendY - entries.length * 14 - 4);

    entries.forEach(function(e, i) {
      var rel = REL_TYPES[e.type];
      var ly  = legendY - (entries.length - i - 1) * 14;
      ctx.save();
      ctx.strokeStyle = rel.color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash(rel.dash);
      ctx.beginPath();
      ctx.moveTo(legendX, ly - 4);
      ctx.lineTo(legendX + 24, ly - 4);
      ctx.stroke();
      ctx.restore();
      ctx.font = '9px sans-serif';
      ctx.fillStyle = rel.color;
      ctx.fillText(e.label, legendX + 28, ly - 1);
    });
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return {
    draw:          draw,
    buildNPCGraph: buildNPCGraph,
    REL_TYPES:     REL_TYPES,
    ROLE_COLORS:   ROLE_COLORS,
  };
})();
