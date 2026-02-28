/**
 * js/timeline.js  —  Phase 3
 *
 * Campaign Timeline / Chronicle:
 *   • Scrollable canvas-based visual timeline
 *   • Acts as coloured bands with level ranges
 *   • Side quests shown as branching nodes
 *   • Key events / plot twists as milestone markers
 *   • Villain appearances and boss encounters marked
 *   • Click-to-expand detail panel for any node
 *   • Export as PNG
 */

const Timeline = (() => {
  'use strict';

  // ─── Layout constants ────────────────────────────────────────────────────
  const TRACK_H   = 56;   // height of each main track
  const SQ_H      = 36;   // height of side-quest tracks
  const PAD_LEFT  = 120;  // left margin for labels
  const PAD_TOP   = 48;
  const PAD_BOTTOM= 36;
  const NODE_R    = 10;
  const FONT_LABEL= '600 11px "Crimson Pro",Georgia,serif';
  const FONT_SMALL= '9px "Crimson Pro",Georgia,serif';
  const FONT_ACT  = 'bold 13px "Cinzel Decorative","Georgia",serif';

  // ─── Colour palette ───────────────────────────────────────────────────────
  const PAL = {
    bg:        '#0d0a08',
    grid:      'rgba(201,151,58,0.06)',
    gridLine:  'rgba(201,151,58,0.15)',
    actColors: [
      ['rgba(139,26,26,0.25)','#8b1a1a'],      // Act 1 — crimson
      ['rgba(26,48,96,0.25)','#2a5a9a'],        // Act 2 — sapphire
      ['rgba(42,96,64,0.25)','#2a7a40'],        // Act 3 — jade
      ['rgba(90,58,10,0.25)','#c9973a'],        // Act 4 — gold
      ['rgba(70,26,90,0.25)','#6a2a8a'],        // Act 5 — violet
      ['rgba(10,80,90,0.25)','#0a6070'],        // Act 6 — teal
    ],
    mainPlot:  '#c9973a',
    sideQuest: '#6a9a6a',
    boss:      '#8b1a1a',
    twist:     '#6a2a8a',
    milestone: '#5a8ab0',
    label:     '#c9b68a',
    labelBg:   'rgba(13,10,8,0.8)',
    levelNum:  '#9a8a6a',
    nodeStroke:'#0d0a08',
    connector: 'rgba(201,151,58,0.3)',
    tooltip:   'rgba(13,10,8,0.95)',
    tooltipBrd:'#c9973a',
  };

  // ─── State ───────────────────────────────────────────────────────────────
  let _campaign = null;
  let _canvas   = null;
  let _layout   = null;    // computed layout nodes for hit-testing
  let _selected = null;    // currently selected node
  let _detailEl = null;

  // ─── Main render entry ────────────────────────────────────────────────────
  function render(canvas, campaign, detailEl) {
    _canvas   = canvas;
    _campaign = campaign;
    _detailEl = detailEl;

    if (!campaign?.acts?.length) {
      _drawEmpty(canvas);
      return;
    }

    const acts       = campaign.acts;
    const totalActs  = acts.length;
    const maxSQ      = Math.max(...acts.map(a => a.sideQuests?.length || 0));

    // ── Compute canvas height ─────────────────────────────────────────────
    const rowsPerAct = 1 + maxSQ;
    const totalH = PAD_TOP + PAD_BOTTOM + totalActs * (TRACK_H + maxSQ * SQ_H + 20);
    canvas.height = Math.max(400, totalH);

    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext('2d');
    _layout = [];

    // ── Background ────────────────────────────────────────────────────────
    ctx.fillStyle = PAL.bg;
    ctx.fillRect(0, 0, W, H);

    // ── Level axis (top) ──────────────────────────────────────────────────
    _drawLevelAxis(ctx, campaign, W);

    // ── Acts ──────────────────────────────────────────────────────────────
    let y = PAD_TOP + 20;

    for (let ai = 0; ai < acts.length; ai++) {
      const act   = acts[ai];
      const color = PAL.actColors[ai % PAL.actColors.length];
      const actH  = TRACK_H + (act.sideQuests?.length || 0) * SQ_H + 10;

      // Act band
      const xStart = _levelToX(act.levelStart, campaign, W);
      const xEnd   = _levelToX(act.levelEnd,   campaign, W);

      ctx.fillStyle = color[0];
      ctx.fillRect(xStart, y, xEnd - xStart, actH);
      ctx.strokeStyle = color[1];
      ctx.lineWidth = 1.5;
      ctx.strokeRect(xStart, y, xEnd - xStart, actH);

      // Act label (left)
      ctx.font = FONT_ACT;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color[1];
      const actLabel = `ACT ${act.number}`;
      ctx.fillText(actLabel, 8, y + TRACK_H / 2);

      // Act title (truncated)
      ctx.font = FONT_SMALL;
      ctx.fillStyle = PAL.label;
      const shortTitle = act.title?.length > 18 ? act.title.slice(0,17) + '…' : act.title;
      ctx.fillText(shortTitle || '', 8, y + TRACK_H / 2 + 14);

      // Main plot node (centre of act band, main track)
      const mx = (xStart + xEnd) / 2;
      const my = y + TRACK_H / 2;
      _drawNode(ctx, mx, my, NODE_R, PAL.mainPlot, '⚔', 'main');
      _layout.push({ x: mx, y: my, r: NODE_R + 4, type: 'act', data: act, act: ai });

      // Horizontal connector through main track
      ctx.strokeStyle = PAL.connector;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(xStart + 5, my);
      ctx.lineTo(xEnd - 5, my);
      ctx.stroke();
      ctx.setLineDash([]);

      // Boss encounter node (at act end)
      if (act.boss) {
        const bx = xEnd - 16;
        const by = my;
        _drawNode(ctx, bx, by, NODE_R - 2, PAL.boss, '💀', 'boss');
        _layout.push({ x: bx, y: by, r: NODE_R + 2, type: 'boss', data: act.boss, act: ai });
      }

      // Twist node (at 75% of act)
      if (act.twist) {
        const tx = xStart + (xEnd - xStart) * 0.75;
        const ty = my - 18;
        _drawNode(ctx, tx, ty, 7, PAL.twist, '!', 'twist');
        _layout.push({ x: tx, y: ty, r: 10, type: 'twist', data: act.twist, act: ai });
      }

      // ── Side Quests ───────────────────────────────────────────────────
      const sqs = act.sideQuests || [];
      for (let si = 0; si < sqs.length; si++) {
        const sq = sqs[si];
        const sqY = y + TRACK_H + si * SQ_H + SQ_H / 2;

        // Dotted branch line from main track
        const sqX = xStart + (xEnd - xStart) * ((si + 1) / (sqs.length + 1));
        ctx.strokeStyle = PAL.sideQuest;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(sqX, my + NODE_R);
        ctx.lineTo(sqX, sqY);
        ctx.stroke();
        ctx.setLineDash([]);

        // SQ node
        _drawNode(ctx, sqX, sqY, 7, PAL.sideQuest, '◆', 'sq');

        // SQ label
        ctx.font = FONT_SMALL;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const sqLabel = sq.title?.length > 22 ? sq.title.slice(0,21) + '…' : sq.title;
        const lx = sqX + 11;
        // Label background
        const lw = ctx.measureText(sqLabel||'').width;
        ctx.fillStyle = PAL.labelBg;
        ctx.fillRect(lx - 2, sqY - 7, lw + 4, 14);
        ctx.fillStyle = PAL.sideQuest;
        ctx.fillText(sqLabel || '', lx, sqY);

        // Type badge
        ctx.font = '7px sans-serif';
        ctx.fillStyle = 'rgba(106,154,106,0.7)';
        ctx.fillText(`[${sq.type||''}]`, lx, sqY + 10);

        _layout.push({ x: sqX, y: sqY, r: 10, type: 'sidequest', data: sq, act: ai });
      }

      y += actH + 18;
    }

    // ── Milestones at level transitions ───────────────────────────────────
    for (let ai = 0; ai < acts.length - 1; ai++) {
      const act  = acts[ai];
      const x    = _levelToX(act.levelEnd, campaign, W);
      ctx.strokeStyle = PAL.gridLine;
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(x, PAD_TOP);
      ctx.lineTo(x, H - PAD_BOTTOM);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ── Legend ────────────────────────────────────────────────────────────
    _drawLegend(ctx, W, H);

    // ── Title ─────────────────────────────────────────────────────────────
    ctx.font = FONT_ACT;
    ctx.textAlign = 'center';
    ctx.fillStyle = PAL.mainPlot;
    ctx.fillText((campaign.base?.name || 'Campaign') + ' — Chronicle', W / 2, 18);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function _levelToX(level, campaign, W) {
    const minL = campaign.config?.startLevel || 1;
    const maxL = campaign.config?.endLevel   || 20;
    const t = (level - minL) / Math.max(1, maxL - minL);
    return PAD_LEFT + t * (W - PAD_LEFT - 24);
  }

  function _drawLevelAxis(ctx, campaign, W) {
    const minL = campaign.config?.startLevel || 1;
    const maxL = campaign.config?.endLevel   || 20;
    ctx.font = FONT_SMALL;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let l = minL; l <= maxL; l++) {
      const x = _levelToX(l, campaign, W);
      // tick
      ctx.strokeStyle = PAL.gridLine;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, PAD_TOP);
      ctx.lineTo(x, PAD_TOP + 8);
      ctx.stroke();
      // label
      ctx.fillStyle = PAL.levelNum;
      if ((maxL - minL) <= 12 || l % 2 === 0 || l === minL || l === maxL) {
        ctx.fillText(`${l}`, x, PAD_TOP + 10);
      }
      // faint vertical grid
      ctx.strokeStyle = PAL.grid;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(x, PAD_TOP + 20);
      ctx.lineTo(x, _canvas?.height - PAD_BOTTOM || 600);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Axis label
    ctx.font = FONT_SMALL;
    ctx.textAlign = 'center';
    ctx.fillStyle = PAL.levelNum;
    ctx.fillText('Character Level', W / 2, PAD_TOP + 22);
  }

  function _drawNode(ctx, x, y, r, color, icon, _type) {
    // Outer glow
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
    g.addColorStop(0, color + '55');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
    ctx.fill();
    // Circle
    ctx.fillStyle = color;
    ctx.strokeStyle = PAL.nodeStroke;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Icon
    ctx.font = `${r}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(icon, x, y + 1);
  }

  function _drawLegend(ctx, W, H) {
    const items = [
      { color: PAL.mainPlot, label: '⚔ Main Act', icon: '⚔' },
      { color: PAL.boss,     label: '💀 Boss',    icon: '💀' },
      { color: PAL.twist,    label: '! Plot Twist',icon: '!' },
      { color: PAL.sideQuest,label: '◆ Side Quest',icon:'◆' },
    ];
    const x = PAD_LEFT;
    const y = H - PAD_BOTTOM + 4;
    ctx.font = FONT_SMALL;
    ctx.textBaseline = 'middle';
    let cx = x;
    for (const item of items) {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(cx + 5, y + 6, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PAL.label;
      ctx.textAlign = 'left';
      ctx.fillText(item.label, cx + 13, y + 6);
      cx += ctx.measureText(item.label).width + 30;
    }
  }

  function _drawEmpty(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = PAL.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = PAL.label;
    ctx.font = '14px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Generate a campaign to view the timeline.', canvas.width / 2, canvas.height / 2);
  }

  // ─── Hit Testing & Detail Panel ──────────────────────────────────────────

  function handleClick(e) {
    if (!_canvas || !_layout) return;
    const rect = _canvas.getBoundingClientRect();
    const sx   = _canvas.width  / rect.width;
    const sy   = _canvas.height / rect.height;
    const px   = (e.clientX - rect.left) * sx;
    const py   = (e.clientY - rect.top)  * sy;

    const hit = _layout.find(n => Math.hypot(n.x - px, n.y - py) < n.r + 4);
    if (hit) {
      _selected = hit;
      showDetail(hit);
    }
  }

  function showDetail(node) {
    if (!_detailEl) return;
    let html = '';
    switch (node.type) {
      case 'act': {
        const a = node.data;
        html = `
          <div class="tl-detail-title">Act ${a.number}: ${a.title}</div>
          <div class="tl-detail-meta">Levels ${a.levelStart}–${a.levelEnd} · ${a.location}</div>
          <p>${a.summary}</p>
          <strong>Milestones:</strong>
          <ul>${(a.milestones||[]).map(m=>`<li>${m}</li>`).join('')}</ul>`;
        break;
      }
      case 'boss': {
        const b = node.data;
        html = `
          <div class="tl-detail-title">⚔ ${b.name}</div>
          <div class="tl-detail-meta">${b.creature}</div>
          <p><strong>Setup:</strong> ${b.setup}</p>
          <p><strong>Phase 2:</strong> ${b.phase2}</p>
          <p><strong>Environment:</strong> ${b.env}</p>`;
        break;
      }
      case 'twist': {
        const t = node.data;
        html = `
          <div class="tl-detail-title">🌀 Plot Twist</div>
          <div class="tl-detail-meta">${t.timing}</div>
          <p>${t.twist}</p>`;
        break;
      }
      case 'sidequest': {
        const sq = node.data;
        html = `
          <div class="tl-detail-title">◆ ${sq.title}</div>
          <div class="tl-detail-meta">[${sq.type}] · Level ${sq.level} · DC ${sq.dc}</div>
          <p>${sq.desc}</p>
          <p><strong>Reward:</strong> ${sq.reward}</p>
          ${sq.optional ? '<p><em>Optional side quest</em></p>' : ''}`;
        break;
      }
    }
    _detailEl.innerHTML = html;
    _detailEl.style.display = 'block';
  }

  function attachEvents(canvas, detailEl) {
    _canvas   = canvas;
    _detailEl = detailEl;
    // Remove previous listeners by cloning
    const newCanvas = canvas.cloneNode(true);
    canvas.parentNode.replaceChild(newCanvas, canvas);
    newCanvas.addEventListener('click', handleClick);
    newCanvas.addEventListener('mousemove', e => {
      const rect = newCanvas.getBoundingClientRect();
      const sx = newCanvas.width / rect.width;
      const sy = newCanvas.height / rect.height;
      const px = (e.clientX - rect.left) * sx;
      const py = (e.clientY - rect.top)  * sy;
      const hit = _layout?.find(n => Math.hypot(n.x - px, n.y - py) < n.r + 4);
      newCanvas.style.cursor = hit ? 'pointer' : 'default';
    });
    return newCanvas;
  }

  // ─── Public API ──────────────────────────────────────────────────────────
  return { render, attachEvents };

})();
