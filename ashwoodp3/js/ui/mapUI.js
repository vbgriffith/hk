// ════════════════════════════════════════════════════════════
//  THE ASHWOOD INHERITANCE — Map UI
//  Illustrated map drawn on canvas, clickable rooms
// ════════════════════════════════════════════════════════════

class MapUI {
  constructor() {
    this.visible = false;
    this.overlay = document.getElementById('map-overlay');
    this.canvas = document.getElementById('map-canvas');
    this.roomsDiv = document.getElementById('map-rooms');

    document.getElementById('map-close')?.addEventListener('click', () => this.hide());

    // Room layout data (x%, y% on 800x500 map canvas)
    this.rooms = [
      // Manor grounds
      { id: 'manor_exterior',     label: 'Exterior',        x: 400, y: 390, accessible: true },
      // Main building
      { id: 'foyer',              label: 'Foyer',           x: 400, y: 295, accessible: true },
      { id: 'drawing_room',       label: 'Drawing Room',    x: 250, y: 245, accessible: true },
      { id: 'dining_room',        label: 'Dining Room',     x: 550, y: 245, accessible: true },
      { id: 'kitchen',            label: 'Kitchen',         x: 600, y: 295, accessible: true },
      { id: 'study',              label: 'Study',           x: 400, y: 210, accessible: false, lockedFlag: 'study_accessed' },
      // Upper floors
      { id: 'library_east',       label: 'East Library',    x: 580, y: 155, accessible: false, lockedFlag: 'library_accessible' },
      { id: 'nathaniel_room',     label: "Nathaniel's Room", x: 240, y: 155, accessible: false, lockedFlag: 'upper_floor_accessible' },
      // Grounds
      { id: 'carriage_house',     label: 'Carriage House',  x: 155, y: 390, accessible: true },
      { id: 'groundskeeper_shed', label: "Grdskpr's Shed",  x: 620, y: 405, accessible: false, lockedFlag: 'dorothea_gave_key OR shed_accessed' },
      // Off-estate — Whitmore
      { id: 'dr_crane_office',    label: "Dr. Crane's Office", x: 680, y: 455, accessible: false, lockedFlag: 'crane_office_accessible' },
      { id: 'whitmore_bank',      label: 'Whitmore Bank',   x: 755, y: 445, accessible: false, lockedFlag: 'bank_accessible' },
      { id: 'declan_study',       label: "Declan's Study",  x: 730, y: 468, accessible: false, lockedFlag: 'declan_accessible' },
    ];
  }

  toggle() { this.visible ? this.hide() : this.show(); }

  show() {
    this.visible = true;
    this.overlay?.classList.remove('hidden');
    requestAnimationFrame(() => {
      this.drawMap();
      this.renderRoomLabels();
    });
  }

  hide() {
    this.visible = false;
    this.overlay?.classList.add('hidden');
  }

  // ──────────────────────────────────────────
  //  DRAW MAP
  // ──────────────────────────────────────────
  drawMap() {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    const W = 800, H = 500;

    // Background — parchment map texture
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0f0c08');
    bg.addColorStop(1, '#080604');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Grid lines (blueprint style)
    ctx.strokeStyle = 'rgba(200,136,42,0.06)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // ─── MANOR GROUNDS ───────────────────────
    ctx.strokeStyle = 'rgba(200,136,42,0.25)';
    ctx.fillStyle = 'rgba(200,136,42,0.03)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    this.roundRect(ctx, 100, 60, 600, 400, 4);
    ctx.stroke(); ctx.fill();
    ctx.setLineDash([]);

    // ─── MAIN MANOR BUILDING ─────────────────
    ctx.fillStyle = 'rgba(30,22,14,0.9)';
    ctx.strokeStyle = 'rgba(200,136,42,0.5)';
    ctx.lineWidth = 1.5;
    // Main body
    this.drawRoom(ctx, 300, 130, 200, 200); // main
    // East wing
    this.drawRoom(ctx, 500, 130, 130, 160);
    // West wing
    this.drawRoom(ctx, 170, 130, 130, 160);

    // ─── OUTBUILDINGS ────────────────────────
    // Carriage house
    ctx.fillStyle = 'rgba(20,16,10,0.85)';
    ctx.strokeStyle = 'rgba(200,136,42,0.3)';
    this.drawRoom(ctx, 110, 355, 90, 70);

    // Groundskeeper's shed
    this.drawRoom(ctx, 590, 370, 70, 60);

    // ─── DRIVEWAY / PATHS ─────────────────────
    ctx.strokeStyle = 'rgba(200,136,42,0.15)';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(400, 460);
    ctx.lineTo(400, 330);
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(155, 355);
    ctx.lineTo(300, 330);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(625, 370);
    ctx.lineTo(500, 330);
    ctx.stroke();

    // ─── OFF-ESTATE ──────────────────────────
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = 'rgba(200,136,42,0.12)';
    ctx.lineWidth = 1;
    // Road leading off-map
    ctx.beginPath(); ctx.moveTo(400, 460); ctx.lineTo(400, 495); ctx.stroke();
    ctx.setLineDash([]);

    // Off-estate markers
    ['dr_crane_office', 'whitmore_bank'].forEach(id => {
      const r = this.rooms.find(r => r.id === id);
      if (!r) return;
      ctx.fillStyle = 'rgba(30,22,14,0.7)';
      ctx.strokeStyle = 'rgba(200,136,42,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.rect(r.x - 30, r.y - 15, 60, 30); ctx.fill(); ctx.stroke();
    });

    // ─── COMPASS ROSE ────────────────────────
    this.drawCompass(ctx, 55, 460, 30);

    // ─── TITLE ───────────────────────────────
    ctx.fillStyle = 'rgba(200,136,42,0.5)';
    ctx.font = 'italic 11px "Libre Baskerville", Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('Ashwood Estate', 110, 80);
    ctx.font = '7px "Special Elite", monospace';
    ctx.fillStyle = 'rgba(200,136,42,0.3)';
    ctx.fillText('OCTOBER · WHITMORE COUNTY', 110, 92);

    // ─── CURRENT LOCATION MARKER ──────────────
    const current = this.rooms.find(r => r.id === gameState.currentLocation);
    if (current) {
      ctx.fillStyle = '#c8882a';
      ctx.beginPath(); ctx.arc(current.x, current.y, 6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(200,136,42,0.3)';
      ctx.beginPath(); ctx.arc(current.x, current.y, 12, 0, Math.PI*2); ctx.fill();
    }
  }

  drawRoom(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill(); ctx.stroke();
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  drawCompass(ctx, cx, cy, size) {
    const dirs = [['N', 0, -1], ['S', 0, 1], ['E', 1, 0], ['W', -1, 0]];
    ctx.strokeStyle = 'rgba(200,136,42,0.4)';
    ctx.fillStyle = 'rgba(200,136,42,0.4)';
    ctx.lineWidth = 1;

    dirs.forEach(([label, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + dx * size * 0.8, cy + dy * size * 0.8);
      ctx.stroke();

      ctx.font = '8px "Special Elite", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, cx + dx * size, cy + dy * size);
    });

    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI*2); ctx.fill();
  }

  // ──────────────────────────────────────────
  //  ROOM LABELS (HTML overlay, clickable)
  // ──────────────────────────────────────────
  renderRoomLabels() {
    if (!this.roomsDiv || !this.canvas) return;
    this.roomsDiv.innerHTML = '';

    const scaleX = this.canvas.offsetWidth / this.canvas.width;
    const scaleY = this.canvas.offsetHeight / this.canvas.height;

    this.rooms.forEach(room => {
      const isAccessible = room.accessible || (room.lockedFlag && gameState.checkCondition(room.lockedFlag));
      const isCurrent = room.id === gameState.currentLocation;

      const lbl = document.createElement('div');
      lbl.className = `map-room-label${isCurrent ? ' current' : ''}${!isAccessible ? ' locked' : ''}`;
      lbl.textContent = room.label;
      lbl.style.left = `${room.x * scaleX}px`;
      lbl.style.top = `${room.y * scaleY}px`;

      if (isAccessible && !isCurrent) {
        lbl.title = `Go to ${room.label}`;
        lbl.addEventListener('click', () => {
          this.hide();
          window.sceneManager?.goToLocation(room.id);
        });
      } else if (!isAccessible) {
        lbl.title = 'Not yet accessible';
      }

      this.roomsDiv.appendChild(lbl);
    });
  }
}

const mapUI = new MapUI();
