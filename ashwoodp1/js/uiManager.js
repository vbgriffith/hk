// ============================================================
//  THE ASHWOOD INHERITANCE - UI Manager
//  Handles journal, HUD, notifications, menus
// ============================================================

class UIManager {
  constructor() {
    this.journalOpen = false;
    this.currentJournalTab = 'clues';

    // DOM refs
    this.hudActLabel    = document.getElementById('hud-act-label');
    this.hudActSubtitle = document.getElementById('hud-act-subtitle');
    this.journalPanel   = document.getElementById('journal-panel');
    this.journalBody    = document.getElementById('journal-body');
    this.locationBanner = document.getElementById('location-banner');
    this.locationName   = document.getElementById('location-name');
    this.locationDesc   = document.getElementById('location-desc');

    this.actLabels = {
      1: { label: "Act I",   subtitle: "The Call" },
      2: { label: "Act II",  subtitle: "The House" },
      3: { label: "Act III", subtitle: "The Depth" },
      4: { label: "Act IV",  subtitle: "The Reckoning" },
      5: { label: "Act V",   subtitle: "The Inheritance" }
    };

    this.bindEvents();
  }

  bindEvents() {
    // Journal button
    document.getElementById('btn-journal')?.addEventListener('click', () => {
      this.toggleJournal();
    });

    // Journal close
    document.getElementById('journal-close')?.addEventListener('click', () => {
      this.closeJournal();
    });

    // Journal tabs
    document.querySelectorAll('.journal-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchJournalTab(e.target.dataset.tab);
      });
    });

    // Menu button
    document.getElementById('btn-menu')?.addEventListener('click', () => {
      this.showMenu();
    });
  }

  // ============================================================
  //  HUD
  // ============================================================
  updateAct(actNumber) {
    const actData = this.actLabels[actNumber];
    if (actData) {
      if (this.hudActLabel) this.hudActLabel.textContent = actData.label;
      if (this.hudActSubtitle) this.hudActSubtitle.textContent = actData.subtitle;
    }
  }

  // ============================================================
  //  LOCATION BANNER
  // ============================================================
  showLocationBanner(locationId, duration = 3000) {
    const location = STORY.locations[locationId];
    if (!location) return;

    this.locationName.textContent = location.name;

    // Atmospheric sub-label
    const subLabels = {
      manor_exterior:    "Ashwood Estate — Grounds",
      foyer:             "Ground Floor — Main Entrance",
      drawing_room:      "Ground Floor — West",
      study:             "Ground Floor — Main Wing",
      library_east:      "First Floor — East Wing",
      dining_room:       "Ground Floor — Main Wing",
      kitchen:           "Ground Floor — Service Area",
      nathaniel_room:    "Second Floor — West Wing",
      carriage_house:    "Converted Studio — North Grounds",
      groundskeeper_shed:"Northern Grounds",
      whitmore_bank:     "Whitmore Town — Meridian Street",
      dr_crane_office:   "Whitmore Town — Medical District"
    };

    this.locationDesc.textContent = subLabels[locationId] || '';

    this.locationBanner.classList.remove('hidden');

    clearTimeout(this._bannerTimeout);
    this._bannerTimeout = setTimeout(() => {
      this.locationBanner.classList.add('hidden');
    }, duration);
  }

  // ============================================================
  //  JOURNAL
  // ============================================================
  toggleJournal() {
    if (this.journalOpen) {
      this.closeJournal();
    } else {
      this.openJournal();
    }
  }

  openJournal() {
    this.journalOpen = true;
    this.journalPanel.classList.remove('hidden');
    this.renderJournalTab(this.currentJournalTab);
  }

  closeJournal() {
    this.journalOpen = false;
    this.journalPanel.classList.add('hidden');
  }

  switchJournalTab(tab) {
    this.currentJournalTab = tab;
    document.querySelectorAll('.journal-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    this.renderJournalTab(tab);
  }

  renderJournalTab(tab) {
    this.journalBody.innerHTML = '';

    switch (tab) {
      case 'clues':
        this.renderCluesTab();
        break;
      case 'characters':
        this.renderCharactersTab();
        break;
      case 'notes':
        this.renderNotesTab();
        break;
    }
  }

  renderCluesTab() {
    const clues = gameState.getClueList();

    if (clues.length === 0) {
      this.journalBody.innerHTML = `
        <div class="journal-entry">
          <div class="journal-entry-body">No evidence collected yet.</div>
        </div>`;
      return;
    }

    // Group by weight
    const critical = clues.filter(c => c.weight === 'critical');
    const significant = clues.filter(c => c.weight === 'significant' || c.weight === 'revelatory');
    const minor = clues.filter(c => c.weight === 'minor' || c.weight === 'atmospheric');
    const keyItems = clues.filter(c => c.weight === 'key_item');

    if (critical.length > 0) {
      this.renderClueSection('Critical Evidence', critical);
    }
    if (significant.length > 0) {
      this.renderClueSection('Significant Findings', significant);
    }
    if (keyItems.length > 0) {
      this.renderClueSection('Key Items', keyItems);
    }
    if (minor.length > 0) {
      this.renderClueSection('Other Observations', minor);
    }

    // Evidence weight meter
    const meter = document.createElement('div');
    meter.style.cssText = 'margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(200,136,42,0.15);';
    meter.innerHTML = `
      <div style="font-family: var(--font-type); font-size: 0.6rem; color: var(--mist); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.5rem;">
        Case Strength
      </div>
      <div style="background: rgba(255,255,255,0.05); height: 4px; border-radius: 2px;">
        <div style="background: var(--amber); height: 100%; width: ${Math.min(100, (gameState.evidenceWeight / 15) * 100)}%; border-radius: 2px; transition: width 0.5s;"></div>
      </div>
      <div style="font-family: var(--font-type); font-size: 0.58rem; color: var(--mist); margin-top: 0.4rem;">
        ${gameState.evidenceWeight} / 15 points
      </div>`;
    this.journalBody.appendChild(meter);
  }

  renderClueSection(title, clues) {
    const section = document.createElement('div');
    section.style.marginBottom = '1rem';

    const heading = document.createElement('div');
    heading.style.cssText = 'font-family: var(--font-type); font-size: 0.58rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--mist); padding: 0.5rem 0 0.4rem; border-bottom: 1px solid rgba(200,136,42,0.1); margin-bottom: 0.5rem;';
    heading.textContent = title;
    section.appendChild(heading);

    clues.forEach(clue => {
      const entry = document.createElement('div');
      entry.className = 'journal-entry';
      entry.innerHTML = `
        <div class="journal-entry-title">${clue.name}</div>
        <div class="journal-entry-body">${clue.description}</div>
        <div class="journal-entry-weight ${clue.weight}">${clue.weight}</div>`;
      section.appendChild(entry);
    });

    this.journalBody.appendChild(section);
  }

  renderCharactersTab() {
    const chars = STORY.characters;
    const metFlags = {
      dorothea:  gameState.flags.met_dorothea,
      nathaniel: gameState.flags.met_nathaniel,
      sylvie:    gameState.flags.met_sylvie,
      hester:    gameState.flags.met_hester,
      dr_crane:  gameState.flags.met_crane,
      declan:    gameState.flags.declan_visited,
      elias:     true // always known (victim)
    };

    Object.entries(chars).forEach(([id, char]) => {
      if (char.role === 'player') return; // skip Maren
      if (!metFlags[id]) return; // skip unmet characters

      const entry = document.createElement('div');
      entry.className = 'journal-entry';

      let status = '';
      if (char.alive === false) status = '<span style="color: var(--blood-soft); font-size: 0.65rem;">DECEASED</span>';

      entry.innerHTML = `
        <div class="journal-entry-title">${char.name} — <em>${char.title}</em> ${status}</div>
        <div class="journal-entry-body">${char.bio}</div>`;
      this.journalBody.appendChild(entry);
    });

    if (this.journalBody.children.length === 0) {
      this.journalBody.innerHTML = '<div class="journal-entry"><div class="journal-entry-body">No persons of interest identified yet.</div></div>';
    }
  }

  renderNotesTab() {
    if (gameState.notes.length === 0) {
      this.journalBody.innerHTML = '<div class="journal-entry"><div class="journal-entry-body">No notes yet.</div></div>';
      return;
    }

    // Show notes in reverse chronological order
    const notes = [...gameState.notes].reverse();
    notes.forEach(note => {
      const entry = document.createElement('div');
      entry.className = 'journal-entry';
      entry.innerHTML = `
        <div class="journal-entry-title">${note.title}</div>
        <div class="journal-entry-body">${note.content}</div>`;
      this.journalBody.appendChild(entry);
    });
  }

  // ============================================================
  //  MENU
  // ============================================================
  showMenu() {
    // Phase 2 will implement full menu
    // For now, simple confirm save
    const saved = localStorage.getItem('ashwood_save');
    const menuContent = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:400;display:flex;align-items:center;justify-content:center;">
        <div style="background:var(--ink-soft);border:1px solid rgba(200,136,42,0.3);padding:2rem;max-width:320px;width:90%;">
          <div style="font-family:var(--font-type);letter-spacing:0.2em;text-transform:uppercase;color:var(--amber);margin-bottom:1.5rem;font-size:0.7rem;">Menu</div>
          <button onclick="uiManager.saveGame();this.closest('div[style]').remove();" style="display:block;width:100%;background:transparent;border:1px solid rgba(200,136,42,0.3);color:var(--parchment-dark);font-family:var(--font-type);font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;padding:0.6rem;cursor:pointer;margin-bottom:0.5rem;">Save Game</button>
          <button onclick="uiManager.loadGame();this.closest('div[style]').remove();" style="display:block;width:100%;background:transparent;border:1px solid rgba(200,136,42,0.3);color:var(--parchment-dark);font-family:var(--font-type);font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;padding:0.6rem;cursor:pointer;margin-bottom:0.5rem;">${saved ? 'Load Last Save' : 'No Save Found'}</button>
          <button onclick="this.closest('div[style]').remove();" style="display:block;width:100%;background:transparent;border:none;color:var(--mist);font-family:var(--font-type);font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;padding:0.6rem;cursor:pointer;">Return to Game</button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', menuContent);
  }

  // ============================================================
  //  SAVE / LOAD
  // ============================================================
  saveGame() {
    try {
      localStorage.setItem('ashwood_save', gameState.serialize());
      this.showToast('Game saved.');
    } catch (e) {
      this.showToast('Save failed.');
    }
  }

  loadGame() {
    const saved = localStorage.getItem('ashwood_save');
    if (saved && gameState.deserialize(saved)) {
      this.showToast('Game loaded.');
      this.updateAct(gameState.currentAct);
    } else {
      this.showToast('No save found.');
    }
  }

  // ============================================================
  //  TOAST
  // ============================================================
  showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 220px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(10,8,6,0.95);
      border: 1px solid rgba(200,136,42,0.4);
      color: var(--parchment-dark);
      font-family: var(--font-type);
      font-size: 0.7rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: 0.5rem 1.25rem;
      z-index: 500;
      pointer-events: none;
      animation: fadeInDown 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  // ============================================================
  //  SCENE TRANSITION
  // ============================================================
  fadeOut(duration = 600) {
    return new Promise(resolve => {
      let fade = document.getElementById('scene-fade');
      if (!fade) {
        fade = document.createElement('div');
        fade.id = 'scene-fade';
        fade.style.cssText = 'position:fixed;inset:0;background:var(--ink);z-index:500;pointer-events:none;opacity:0;transition:opacity 0.6s;';
        document.body.appendChild(fade);
      }
      fade.style.transitionDuration = `${duration}ms`;
      fade.style.opacity = '1';
      setTimeout(resolve, duration);
    });
  }

  fadeIn(duration = 600) {
    return new Promise(resolve => {
      const fade = document.getElementById('scene-fade');
      if (!fade) { resolve(); return; }
      fade.style.transitionDuration = `${duration}ms`;
      fade.style.opacity = '0';
      setTimeout(resolve, duration);
    });
  }
}

// Global instance
const uiManager = new UIManager();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIManager;
}
