// ════════════════════════════════════════════════════════════
//  THE ASHWOOD INHERITANCE — UI Manager (Phase 2)
// ════════════════════════════════════════════════════════════

class UIManager {
  constructor() {
    this.actLabels = {
      1: { label: 'Act I',   subtitle: 'The Call' },
      2: { label: 'Act II',  subtitle: 'The House' },
      3: { label: 'Act III', subtitle: 'The Depth' },
      4: { label: 'Act IV',  subtitle: 'The Reckoning' },
      5: { label: 'Act V',   subtitle: 'The Inheritance' }
    };

    this.clock = { hour: 22, minute: 41 };
    this.clockInterval = null;

    this.bindEvents();
    this.startClock();
  }

  bindEvents() {
    // HUD buttons
    document.getElementById('btn-inventory')?.addEventListener('click', () => inventoryUI?.toggle());
    document.getElementById('btn-evidence')?.addEventListener('click', () => evidenceBoardUI?.toggle());
    document.getElementById('btn-map')?.addEventListener('click', () => mapUI?.toggle());
    document.getElementById('btn-menu')?.addEventListener('click', () => this.showMenu());

    // Menu buttons
    document.getElementById('menu-save')?.addEventListener('click', () => { this.saveGame(); this.hideMenu(); });
    document.getElementById('menu-load')?.addEventListener('click', () => { this.loadGame(); this.hideMenu(); });
    document.getElementById('menu-resume')?.addEventListener('click', () => this.hideMenu());
    document.getElementById('menu-settings')?.addEventListener('click', () => this.showSettings());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (dialogueEngine?.isActive) return;
      switch(e.key) {
        case 'e': case 'E': window.sceneManager?.triggerHotspot(); break;
        case 'i': case 'I': inventoryUI?.toggle(); break;
        case 'b': case 'B': evidenceBoardUI?.toggle(); break;
        case 'm': case 'M': mapUI?.toggle(); break;
        case 'Escape':
          inventoryUI?.hide();
          evidenceBoardUI?.hide();
          mapUI?.hide();
          this.hideMenu();
          break;
        case 's': if (e.ctrlKey) { e.preventDefault(); this.saveGame(); } break;
      }
    });
  }

  // ── ACT ─────────────────────────────────────────────────────
  updateAct(actNumber) {
    const data = this.actLabels[actNumber];
    if (!data) return;
    const label = document.getElementById('hud-act-label');
    const sub = document.getElementById('hud-act-subtitle');
    if (label) label.textContent = data.label;
    if (sub) sub.textContent = data.subtitle;
  }

  // ── CLOCK ────────────────────────────────────────────────────
  startClock() {
    this.renderClock();
    this.clockInterval = setInterval(() => {
      this.clock.minute++;
      if (this.clock.minute >= 60) { this.clock.minute = 0; this.clock.hour++; }
      if (this.clock.hour >= 24) this.clock.hour = 0;
      this.renderClock();
    }, 12000); // in-game min = 12 real seconds
  }

  renderClock() {
    const el = document.getElementById('hud-clock');
    if (el) {
      const h = String(this.clock.hour).padStart(2, '0');
      const m = String(this.clock.minute).padStart(2, '0');
      el.textContent = `${h}:${m}`;
    }
  }

  // ── LOCATION BANNER ──────────────────────────────────────────
  showLocationBanner(locationId, duration = 3200) {
    const location = STORY.locations[locationId];
    if (!location) return;

    const banner = document.getElementById('location-banner');
    const name = document.getElementById('location-banner-name');
    const sub = document.getElementById('location-banner-sub');

    if (!banner) return;

    const subLabels = {
      manor_exterior:    'Ashwood Estate — October 15th, 10:41 PM',
      foyer:             'Ground Floor — Main Entrance',
      drawing_room:      'Ground Floor — West Wing',
      study:             'Ground Floor — Main Wing (Locked)',
      library_east:      'First Floor — East Wing',
      dining_room:       'Ground Floor — Main Wing',
      kitchen:           'Ground Floor — Service Area',
      nathaniel_room:    'Second Floor — West Wing',
      carriage_house:    'North Grounds — Converted Studio',
      groundskeeper_shed:'North Grounds',
      whitmore_bank:     'Whitmore — Meridian Street',
      dr_crane_office:   'Whitmore — Medical District'
    };

    if (name) name.textContent = location.name;
    if (sub) sub.textContent = subLabels[locationId] || '';

    banner.classList.remove('hidden');
    clearTimeout(this._bannerTimer);
    this._bannerTimer = setTimeout(() => {
      banner.classList.add('hidden');
    }, duration);
  }

  // ── BADGES ───────────────────────────────────────────────────
  updateBadges() {
    const clueCount = gameState.clues.size;
    const invCount = gameState.inventory?.size || 0;

    const evBadge = document.getElementById('evidence-badge');
    if (evBadge) {
      if (clueCount > 0) {
        evBadge.textContent = clueCount;
        evBadge.classList.remove('hidden');
      }
    }
    const invBadge = document.getElementById('inventory-badge');
    if (invBadge) {
      if (invCount > 0) {
        invBadge.textContent = invCount;
        invBadge.classList.remove('hidden');
      } else {
        invBadge.classList.add('hidden');
      }
    }
  }

  // ── INTERACTION PROMPT ────────────────────────────────────────
  showInteractionPrompt(label = 'Examine') {
    const prompt = document.getElementById('interaction-prompt');
    const labelEl = document.getElementById('interaction-label');
    if (prompt) prompt.classList.remove('hidden');
    if (labelEl) labelEl.textContent = label;
  }

  hideInteractionPrompt() {
    document.getElementById('interaction-prompt')?.classList.add('hidden');
  }

  // ── TOAST ────────────────────────────────────────────────────
  toast(message, duration = 2400) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    container.appendChild(t);

    setTimeout(() => {
      t.style.transition = 'opacity 0.4s ease';
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 450);
    }, duration);
  }

  // ── FADE ─────────────────────────────────────────────────────
  fadeOut(ms = 600) {
    return new Promise(resolve => {
      const el = document.getElementById('scene-fade');
      if (!el) { resolve(); return; }
      el.style.transitionDuration = `${ms}ms`;
      el.classList.add('active');
      setTimeout(resolve, ms);
    });
  }

  fadeIn(ms = 600) {
    return new Promise(resolve => {
      const el = document.getElementById('scene-fade');
      if (!el) { resolve(); return; }
      el.style.transitionDuration = `${ms}ms`;
      el.classList.remove('active');
      setTimeout(resolve, ms);
    });
  }

  // ── MENU ─────────────────────────────────────────────────────
  showMenu() {
    document.getElementById('game-menu')?.classList.remove('hidden');
  }
  hideMenu() {
    document.getElementById('game-menu')?.classList.add('hidden');
  }

  showSettings() {
    const muted = audioManager.muted;
    this.toast(muted ? 'Audio: Muted' : 'Audio: On');
    audioManager.toggleMute();
  }

  // ── SAVE / LOAD ──────────────────────────────────────────────
  saveGame() {
    try {
      localStorage.setItem('ashwood_save_v2', gameState.serialize());
      this.toast('Game saved.');
    } catch(e) {
      this.toast('Save failed.');
    }
  }

  loadGame() {
    const saved = localStorage.getItem('ashwood_save_v2');
    if (saved && gameState.deserialize(saved)) {
      this.updateAct(gameState.currentAct);
      this.updateBadges();
      this.toast('Game loaded.');
      return true;
    }
    this.toast('No save found.');
    return false;
  }

  // ── ENDING SCREEN ─────────────────────────────────────────────
  async showEnding(endingId) {
    const ending = STORY.endings[endingId];
    if (!ending) return;

    audioManager.stopAll();

    await this.fadeOut(1200);

    const screen = document.createElement('div');
    screen.id = 'ending-screen';

    const card = document.createElement('div');
    card.className = 'ending-card';

    const epilogueHTML = ending.epilogues
      ? `<div class="ending-epilogue">
          <div class="ending-epilogue-heading">Epilogue</div>
          ${Object.entries(ending.epilogues).map(([k, v]) =>
            `<div class="epilogue-entry">
              <div class="epilogue-name">${k}</div>
              <div class="epilogue-text">${v}</div>
            </div>`
          ).join('')}
        </div>`
      : '';

    card.innerHTML = `
      <div class="ending-type-label">${ending.type === 'good' ? '✦ ' : ''}Ending — ${ending.title}</div>
      <h2 class="ending-title">${ending.title}</h2>
      <div class="ending-divider"></div>
      <div class="ending-narration">
        ${ending.marenFinalThought.map(l => `<p>${l}</p>`).join('')}
      </div>
      ${epilogueHTML}
      <button class="ending-replay" onclick="location.reload()">Begin Again</button>
    `;

    screen.appendChild(card);
    document.body.appendChild(screen);

    await this.fadeIn(1500);

    // Melancholy music for ending
    audioManager.startAmbientMusic('melancholy');
  }

  // ── ACT TRANSITION CARD ───────────────────────────────────────
  async showActTransition(actNumber) {
    const act = STORY.acts[`act${actNumber}`];
    if (!act) return;

    await this.fadeOut(600);
    this.updateAct(actNumber);

    const card = document.createElement('div');
    card.style.cssText = `
      position:fixed;inset:0;background:var(--ink);z-index:9600;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      gap:0.75rem;
    `;
    card.innerHTML = `
      <div style="font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.35em;text-transform:uppercase;color:var(--amber-dim);">
        ${this.actLabels[actNumber]?.label || ''}
      </div>
      <div style="font-family:var(--font-display);font-size:2.2rem;font-style:italic;color:var(--parchment);text-shadow:var(--shadow-text);">
        ${act.title}
      </div>
      <div style="font-family:var(--font-body);font-size:0.9rem;font-style:italic;color:var(--parchment-dim);opacity:0.65;">
        ${act.subtitle}
      </div>
    `;
    document.body.appendChild(card);

    await this.fadeIn(600);
    await new Promise(r => setTimeout(r, 2200));
    await this.fadeOut(500);

    card.remove();
    await this.fadeIn(500);
  }
}

const uiManager = new UIManager();
