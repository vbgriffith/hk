// ════════════════════════════════════════════════════════════
//  THE ASHWOOD INHERITANCE — Evidence Board UI
//  Canvas-based cork board with clue nodes and connections
// ════════════════════════════════════════════════════════════

class EvidenceBoardUI {
  constructor() {
    this.visible = false;
    this.board = document.getElementById('evidence-board');
    this.canvas = document.getElementById('evidence-canvas');
    this.clueList = document.getElementById('evidence-clue-list');
    this.strengthBar = document.getElementById('evidence-strength-bar');
    this.strengthText = document.getElementById('evidence-strength-text');

    this.nodes = {}; // id -> { x, y, clue }
    this.connections = []; // pairs

    document.getElementById('evidence-board-close')?.addEventListener('click', () => this.hide());
  }

  toggle() { this.visible ? this.hide() : this.show(); }

  show() {
    this.visible = true;
    this.board?.classList.remove('hidden');
    requestAnimationFrame(() => {
      this.buildBoard();
      this.renderCanvas();
      this.renderSidebar();
    });
  }

  hide() {
    this.visible = false;
    this.board?.classList.add('hidden');
  }

  // ──────────────────────────────────────────
  //  BUILD / LAYOUT NODES
  // ──────────────────────────────────────────
  buildBoard() {
    if (!this.canvas) return;

    const clues = gameState.getClueList();
    const boardW = Math.max(900, clues.length * 160);
    const boardH = 520;

    this.canvas.width = boardW;
    this.canvas.height = boardH;

    // Arrange by weight groups
    const groups = {
      critical:    clues.filter(c => c.weight === 'critical'),
      revelatory:  clues.filter(c => c.weight === 'revelatory'),
      significant: clues.filter(c => c.weight === 'significant'),
      minor:       clues.filter(c => c.weight === 'minor' || c.weight === 'atmospheric'),
      key_item:    clues.filter(c => c.weight === 'key_item')
    };

    const cols = [
      { group: 'critical',    x: 0.12, yRange: [0.15, 0.85], color: '#7c1a1a' },
      { group: 'revelatory',  x: 0.35, yRange: [0.1, 0.9],   color: '#5a3a80' },
      { group: 'significant', x: 0.58, yRange: [0.12, 0.88], color: '#7a5218' },
      { group: 'minor',       x: 0.78, yRange: [0.15, 0.85], color: '#2a3a48' },
      { group: 'key_item',    x: 0.92, yRange: [0.2, 0.8],   color: '#2a4830' }
    ];

    this.nodes = {};
    this.connections = [];

    cols.forEach(col => {
      const group = groups[col.group] || [];
      group.forEach((clue, i) => {
        const spread = col.yRange[1] - col.yRange[0];
        const y = group.length === 1
          ? (col.yRange[0] + col.yRange[1]) / 2
          : col.yRange[0] + (spread / Math.max(1, group.length - 1)) * i;

        this.nodes[clue.id] = {
          x: boardW * col.x,
          y: boardH * y,
          clue,
          color: col.color
        };
      });
    });

    // Build connections from clue.connectsTo
    clues.forEach(clue => {
      if (!clue.connectsTo) return;
      clue.connectsTo.forEach(targetId => {
        if (this.nodes[targetId]) {
          // Avoid duplicate connections
          const exists = this.connections.some(c =>
            (c[0] === clue.id && c[1] === targetId) ||
            (c[0] === targetId && c[1] === clue.id)
          );
          if (!exists) {
            this.connections.push([clue.id, targetId]);
          }
        }
      });
    });
  }

  // ──────────────────────────────────────────
  //  RENDER CANVAS
  // ──────────────────────────────────────────
  renderCanvas() {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background — cork board texture
    ctx.fillStyle = '#0d0a06';
    ctx.fillRect(0, 0, w, h);

    // Cork texture (dots)
    ctx.fillStyle = 'rgba(200,140,60,0.03)';
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 2 + 0.5;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    }

    // Draw connections (red string)
    this.connections.forEach(([aId, bId]) => {
      const a = this.nodes[aId];
      const b = this.nodes[bId];
      if (!a || !b) return;

      ctx.strokeStyle = 'rgba(160,40,40,0.55)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);

      // Slight curve
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2 - 20;
      ctx.quadraticCurveTo(mx, my, b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw nodes (paper cards pinned to board)
    Object.values(this.nodes).forEach(node => {
      const { x, y, clue, color } = node;
      const nw = 130, nh = 60;

      // Drop shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(x - nw/2 + 3, y - nh/2 + 4, nw, nh);

      // Card background
      ctx.fillStyle = '#1a1510';
      ctx.fillRect(x - nw/2, y - nh/2, nw, nh);

      // Left accent bar
      ctx.fillStyle = color;
      ctx.fillRect(x - nw/2, y - nh/2, 3, nh);

      // Border
      ctx.strokeStyle = `${color}80`;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(x - nw/2, y - nh/2, nw, nh);

      // Pin
      ctx.fillStyle = '#c8882a';
      ctx.beginPath(); ctx.arc(x, y - nh/2 - 2, 4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#e8a84a';
      ctx.beginPath(); ctx.arc(x - 1, y - nh/2 - 3, 2, 0, Math.PI*2); ctx.fill();

      // Text
      ctx.fillStyle = '#c8882a';
      ctx.font = '500 8px "Special Elite", monospace';
      ctx.textAlign = 'center';
      const weightLabel = clue.weight.toUpperCase();
      ctx.fillText(weightLabel, x, y - nh/2 + 12);

      ctx.fillStyle = '#c8c0b0';
      ctx.font = 'italic 10px "Libre Baskerville", Georgia, serif';
      ctx.textAlign = 'center';
      const words = clue.name.split(' ');
      let line = '', lineY = y - nh/2 + 26;
      words.forEach((word, wi) => {
        const test = line + word + ' ';
        if (ctx.measureText(test).width > nw - 16 && wi > 0) {
          ctx.fillText(line.trim(), x, lineY);
          line = word + ' ';
          lineY += 13;
        } else {
          line = test;
        }
      });
      if (line.trim()) ctx.fillText(line.trim(), x, lineY);
    });
  }

  // ──────────────────────────────────────────
  //  RENDER SIDEBAR
  // ──────────────────────────────────────────
  renderSidebar() {
    if (!this.clueList) return;
    this.clueList.innerHTML = '';

    const clues = gameState.getClueList();
    const order = ['critical', 'revelatory', 'significant', 'key_item', 'minor', 'atmospheric'];

    clues.sort((a, b) => order.indexOf(a.weight) - order.indexOf(b.weight));

    clues.forEach(clue => {
      const el = document.createElement('div');
      el.className = 'evidence-clue-item';
      el.innerHTML = `
        <span class="ecl-weight-dot ${clue.weight}"></span>
        <span class="ecl-name">${clue.name}</span>
      `;
      el.title = clue.description;
      el.addEventListener('click', () => this.highlightNode(clue.id));
      this.clueList.appendChild(el);
    });

    // Strength bar
    const maxWeight = 15;
    const pct = Math.min(100, (gameState.evidenceWeight / maxWeight) * 100);
    if (this.strengthBar) this.strengthBar.style.width = `${pct}%`;
    if (this.strengthText) {
      const label = pct < 25 ? 'Insufficient' : pct < 50 ? 'Building' : pct < 75 ? 'Solid' : 'Compelling';
      this.strengthText.textContent = `${gameState.evidenceWeight} pts — ${label}`;
    }
  }

  highlightNode(clueId) {
    if (!this.canvas) return;
    const node = this.nodes[clueId];
    if (!node) return;

    const ctx = this.canvas.getContext('2d');
    const nw = 130, nh = 60;

    // Flash highlight
    ctx.fillStyle = 'rgba(200,136,42,0.25)';
    ctx.fillRect(node.x - nw/2 - 4, node.y - nh/2 - 4, nw + 8, nh + 8);

    setTimeout(() => this.renderCanvas(), 400);
  }
}

const evidenceBoardUI = new EvidenceBoardUI();
