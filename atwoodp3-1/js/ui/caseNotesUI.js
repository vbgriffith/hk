// ════════════════════════════════════════════════════════════
//  THE ASHWOOD INHERITANCE — Case Notes UI (Phase 3)
//  Maren's handwritten-style running case notebook.
//  Updates automatically as clues and flags change.
// ════════════════════════════════════════════════════════════

class CaseNotesUI {
  constructor() {
    this.visible = false;
    this.panel = null;
    this.createPanel();
    this.entries = [];
    this.bindHotkey();
  }

  createPanel() {
    const panel = document.createElement('div');
    panel.id = 'case-notes-panel';
    panel.style.cssText = `
      position:fixed;top:56px;left:0;bottom:0;width:320px;
      background:#0a0806;
      border-right:1px solid rgba(200,136,42,0.18);
      display:flex;flex-direction:column;
      z-index:700;
      transform:translateX(-100%);
      transition:transform 0.35s cubic-bezier(0.16,1,0.3,1);
      font-family:'Libre Baskerville',serif;
    `;

    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;
        padding:0.9rem 1.1rem;border-bottom:1px solid rgba(200,136,42,0.1);">
        <div>
          <div style="font-family:'Special Elite',monospace;font-size:0.6rem;
            letter-spacing:0.25em;text-transform:uppercase;color:#c8882a;margin-bottom:2px;">
            Case Notes
          </div>
          <div style="font-family:'IM Fell English',serif;font-size:0.72rem;
            font-style:italic;color:rgba(200,192,160,0.5);">
            Maren Cole — Private
          </div>
        </div>
        <button id="case-notes-close" style="
          color:#6a7880;font-size:1.3rem;width:30px;height:30px;
          display:flex;align-items:center;justify-content:center;
          border:1px solid rgba(200,136,42,0.18);background:none;cursor:pointer;">×</button>
      </div>
      <div id="case-notes-list" style="flex:1;overflow-y:auto;padding:1rem 1.1rem;
        display:flex;flex-direction:column;gap:1rem;"></div>
    `;

    document.getElementById('ui-overlay').appendChild(panel);
    this.panel = panel;

    document.getElementById('case-notes-close')?.addEventListener('click', () => this.hide());

    // Add Notes button to HUD
    const hudRight = document.getElementById('hud-right');
    if (hudRight) {
      const btn = document.createElement('button');
      btn.className = 'hud-btn';
      btn.title = 'Case Notes';
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>`;
      btn.addEventListener('click', () => this.toggle());
      hudRight.insertBefore(btn, hudRight.firstChild);
    }
  }

  bindHotkey() {
    document.addEventListener('keydown', e => {
      if ((e.key === 'n' || e.key === 'N') && !dialogueEngine?.isActive) {
        this.toggle();
      }
    });
  }

  toggle() { this.visible ? this.hide() : this.show(); }
  show() {
    this.visible = true;
    this.render();
    this.panel.style.transform = 'translateX(0)';
  }
  hide() {
    this.visible = false;
    this.panel.style.transform = 'translateX(-100%)';
  }

  // ──────────────────────────────────────────
  //  AUTO-GENERATE ENTRIES FROM GAME STATE
  // ──────────────────────────────────────────
  generateEntries() {
    const entries = [];

    // Act header
    const actNames = {1:'The Call',2:'The House',3:'The Depth',4:'The Reckoning',5:'The Inheritance'};
    entries.push({
      type: 'act',
      text: `Act ${gameState.currentAct}: ${actNames[gameState.currentAct] || ''}`
    });

    // Key deductions from flags + clues
    if (gameState.hasClue('brandy_glass')) {
      entries.push({ type: 'deduction', text: 'The brandy glass was rinsed. Someone was in a hurry to remove evidence before morning.' });
    }
    if (gameState.hasClue('washed_decanter')) {
      entries.push({ type: 'deduction', text: 'Nathaniel was in the kitchen at 7 AM washing the decanter himself. In his dinner clothes.' });
    }
    if (gameState.hasClue('crane_appointment')) {
      entries.push({ type: 'deduction', text: '"Private matter" in the calendar. Not a medical visit. Something Elias didn\'t want documented normally.' });
    }
    if (gameState.hasClue('portrait_anomaly')) {
      entries.push({ type: 'observation', text: 'The oldest portrait is constructed. A fake family history hung in the entryway.' });
    }
    if (gameState.hasClue('pharmacy_receipt')) {
      entries.push({ type: 'critical', text: 'Greystone Compounding. October 9th. Five days before the death. Nathaniel obtained the compound.' });
    }
    if (gameState.hasClue('new_will_draft')) {
      entries.push({ type: 'critical', text: 'New will: Nathaniel\'s share cut to 8%. "Pending my disclosure." He knew what the disclosure meant.' });
    }
    if (gameState.hasClue('sylvie_camera_photos')) {
      entries.push({ type: 'critical', text: 'Nathaniel\'s car: departed 9:43 PM, returned 11:58 PM. The dinner alibi has a 2-hour gap.' });
    }
    if (gameState.hasClue('desk_hidden_compartment')) {
      entries.push({ type: 'revelation', text: 'Elias was Tomas Vey. He admitted it — in his own hand. He was going to confess.' });
    }
    if (gameState.hasClue('toxicology_results')) {
      entries.push({ type: 'critical', text: 'Digitalis derivative confirmed in blood. Crane ran it privately. He knew it was murder and signed the certificate anyway.' });
    }
    if (gameState.hasClue('jonas_letter_1972')) {
      entries.push({ type: 'revelation', text: 'Jonas Merrill\'s letter: Tomas Vey survived a fire, took a dead man\'s name, forged the Calwell deeds.' });
    }
    if (gameState.getFlag('hester_alibi_broken')) {
      entries.push({ type: 'deduction', text: 'Hester lied. Dorothea wasn\'t in the library all evening. She went to her room at 10:15.' });
    }
    if (gameState.getFlag('crane_cooperating')) {
      entries.push({ type: 'observation', text: 'Crane is cooperating. He was manipulated — but he knew. That\'s on him too.' });
    }
    if (gameState.getFlag('nathaniel_confessed')) {
      entries.push({ type: 'revelation', text: 'Nathaniel confessed. All of it. Three weeks before the murder, Elias told him the truth.' });
    }

    // Suspicion tracking
    if (gameState.currentAct >= 2 && !gameState.hasClue('toxicology_results')) {
      entries.push({ type: 'todo', text: 'Still need: formal confirmation of poison. Crane\'s office.' });
    }
    if (!gameState.hasClue('sylvie_camera_photos') && gameState.getFlag('met_sylvie')) {
      entries.push({ type: 'todo', text: 'Sylvie\'s camera — still haven\'t looked at the memory card. Build her trust first.' });
    }
    if (!gameState.getFlag('nathaniel_confronted') && gameState.currentAct >= 4) {
      entries.push({ type: 'todo', text: 'Nathaniel. It\'s time.' });
    }

    return entries;
  }

  // ──────────────────────────────────────────
  //  RENDER
  // ──────────────────────────────────────────
  render() {
    const list = document.getElementById('case-notes-list');
    if (!list) return;

    const entries = this.generateEntries();
    list.innerHTML = '';

    if (entries.length === 0) {
      list.innerHTML = `<div style="font-style:italic;font-size:0.8rem;
        color:rgba(176,160,128,0.45);text-align:center;padding:2rem 0;">
        No notes yet. Begin the investigation.
      </div>`;
      return;
    }

    const typeStyles = {
      act:         { color: '#c8882a', prefix: '— ', mono: true, size: '0.65rem', spacing: '0.2em' },
      critical:    { color: '#b04040', prefix: '⚠ ', mono: false, size: '0.82rem' },
      revelation:  { color: '#8060a8', prefix: '✦ ', mono: false, size: '0.82rem' },
      deduction:   { color: '#c8b880', prefix: '',   mono: false, size: '0.8rem' },
      observation: { color: '#a09880', prefix: '',   mono: false, size: '0.78rem' },
      todo:        { color: '#607080', prefix: '□ ', mono: true,  size: '0.7rem' }
    };

    entries.forEach((entry, i) => {
      const s = typeStyles[entry.type] || typeStyles.observation;
      const div = document.createElement('div');
      div.style.cssText = `
        color:${s.color};
        font-size:${s.size};
        font-family:${s.mono ? "'Special Elite',monospace" : "'Libre Baskerville',serif"};
        line-height:1.65;
        font-style:${entry.type === 'observation' || entry.type === 'deduction' ? 'italic' : 'normal'};
        letter-spacing:${s.spacing || '0'};
        ${entry.type === 'act' ? 'text-transform:uppercase;margin-bottom:0.25rem;border-bottom:1px solid rgba(200,136,42,0.12);padding-bottom:0.4rem;' : ''}
        opacity:0;transform:translateY(4px);
        transition:opacity 0.3s ease ${i * 40}ms, transform 0.3s ease ${i * 40}ms;
      `;
      div.textContent = s.prefix + entry.text;
      list.appendChild(div);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        div.style.opacity = '1';
        div.style.transform = 'translateY(0)';
      }));
    });
  }
}

const caseNotesUI = new CaseNotesUI();
