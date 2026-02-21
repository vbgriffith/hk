// ════════════════════════════════════════════════════════════
//  THE ASHWOOD INHERITANCE — Confrontation System
//  Act 4: The Reckoning. Confronting each character with evidence.
//  Manages confrontation state, evidence presentation, 
//  path branching, and the six endings.
// ════════════════════════════════════════════════════════════

class ConfrontationSystem {
  constructor() {
    this.active = false;
    this.currentTarget = null;
    this.evidencePresented = new Set();
  }

  // ──────────────────────────────────────────
  //  START A CONFRONTATION
  // ──────────────────────────────────────────
  startConfrontation(characterId) {
    this.active = true;
    this.currentTarget = characterId;

    // Check if we have enough evidence
    const strength = gameState.evidenceWeight;
    const hasCritical = gameState.hasClue('toxicology_results') ||
                        gameState.hasClue('pharmacy_receipt');

    if (characterId === 'nathaniel') {
      this.confrontNathaniel(strength, hasCritical);
    } else if (characterId === 'dorothea') {
      this.confrontDorothea();
    } else if (characterId === 'hester') {
      this.confrontHester();
    } else if (characterId === 'dr_crane') {
      this.confrontCrane();
    }
  }

  // ──────────────────────────────────────────
  //  CONFRONT: HESTER (break the false alibi)
  // ──────────────────────────────────────────
  confrontHester() {
    const hasEvidence = gameState.hasClue('washed_decanter') ||
                        gameState.hasClue('library_window_view');

    const node = hasEvidence ? 'hester_alibi_confrontation' : 'hester_alibi_soft';
    dialogueEngine.startConversation('hester', node);
  }

  // ──────────────────────────────────────────
  //  CONFRONT: DOROTHEA (blackmail, knowledge)
  // ──────────────────────────────────────────
  confrontDorothea() {
    const knowsAboutIdentity = gameState.hasClue('desk_hidden_compartment') ||
                               gameState.hasClue('jonas_letter_1972');
    const node = knowsAboutIdentity
      ? 'dorothea_identity_confrontation'
      : 'dorothea_pressure';
    dialogueEngine.startConversation('dorothea', node);
  }

  // ──────────────────────────────────────────
  //  CONFRONT: DR. CRANE (prescription, silence)
  // ──────────────────────────────────────────
  confrontCrane() {
    const hasReceipt = gameState.hasClue('pharmacy_receipt');
    const hasTornPage = gameState.hasClue('torn_log_page');
    const node = (hasReceipt || hasTornPage)
      ? 'crane_confrontation'
      : 'crane_soft_approach';
    gameState.setFlag('crane_confronted', true);
    dialogueEngine.startConversation('dr_crane', node);
  }

  // ──────────────────────────────────────────
  //  CONFRONT: NATHANIEL — the climax
  // ──────────────────────────────────────────
  confrontNathaniel(strength, hasCritical) {
    gameState.setFlag('nathaniel_confronted', true);

    if (!hasCritical || strength < 6) {
      // Insufficient evidence — bad ending track
      dialogueEngine.startConversation('nathaniel', 'nathaniel_confrontation_weak');
      setTimeout(() => {
        if (!gameState.getFlag('nathaniel_confessed')) {
          gameState.setFlag('path_chosen', 'incomplete');
        }
      }, 500);
      return;
    }

    // Full confrontation
    dialogueEngine.startConversation('nathaniel', 'nathaniel_confrontation_strong',
      null,
      () => this.onNathanielBreaks()
    );
  }

  onNathanielBreaks() {
    gameState.setFlag('nathaniel_confessed', true);
    this.showEndingChoice();
  }

  // ──────────────────────────────────────────
  //  ENDING CHOICE — the pivotal moment
  // ──────────────────────────────────────────
  showEndingChoice() {
    uiManager.fadeOut(400).then(() => {
      const overlay = document.createElement('div');
      overlay.id = 'ending-choice-overlay';
      overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(4,3,2,0.97);
        z-index:9700;display:flex;align-items:center;justify-content:center;
        opacity:0;transition:opacity 0.8s ease;
      `;

      overlay.innerHTML = `
        <div style="max-width:560px;width:90%;text-align:center;padding:2rem;">
          <div style="font-family:var(--font-mono);font-size:0.58rem;letter-spacing:0.3em;
            text-transform:uppercase;color:var(--amber);margin-bottom:1.5rem;opacity:0.75;">
            Act IV — The Reckoning
          </div>
          <h2 style="font-family:var(--font-display);font-size:2rem;font-style:italic;
            color:var(--parchment);text-shadow:var(--shadow-text);margin-bottom:0.5rem;">
            Nathaniel Ashwood has confessed.
          </h2>
          <p style="font-family:var(--font-body);font-size:0.9rem;font-style:italic;
            color:var(--parchment-dim);line-height:1.8;margin-bottom:2.5rem;opacity:0.8;">
            The evidence is solid. The truth is in the room.<br>
            What Maren does next defines what this case means.
          </p>
          <div style="display:flex;flex-direction:column;gap:0.6rem;">
            ${this.buildChoiceBtn('path_justice',    '→ Call the police. Immediately.',         'The weight of evidence.',  'text-amber')}
            ${this.buildChoiceBtn('path_honor',     '→ Give him 24 hours to turn himself in.', 'One more night.',          '')}
            ${this.buildChoiceBtn('path_family',    '→ Bring the evidence to the family first.','Let the house decide.',    '')}
            ${this.buildChoiceBtn('path_understanding','→ Ask him why. Hear the whole story.',  'The full measure.',        '')}
          </div>
          ${gameState.getFlag('bribe_offered') ? `
            <div style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid rgba(200,136,42,0.15);">
              ${this.buildChoiceBtn('path_coverup', '→ Accept Dorothea\'s offer. Close the file.', 'What the house keeps.', 'text-blood')}
            </div>
          ` : ''}
        </div>
      `;

      document.body.appendChild(overlay);
      uiManager.fadeIn(800);

      setTimeout(() => { overlay.style.opacity = '1'; }, 50);

      // Bind choices
      overlay.querySelectorAll('[data-path]').forEach(btn => {
        btn.addEventListener('click', () => {
          const path = btn.dataset.path;
          overlay.style.opacity = '0';
          setTimeout(() => {
            overlay.remove();
            this.executeEnding(path);
          }, 600);
        });
      });
    });
  }

  buildChoiceBtn(path, text, subtitle, extraClass) {
    return `
      <button data-path="${path}" style="
        background:transparent;
        border:1px solid rgba(200,136,42,0.25);
        padding:0.85rem 1.25rem;text-align:left;
        font-family:var(--font-body);
        cursor:pointer;transition:all 0.2s;
        display:flex;align-items:baseline;gap:0.75rem;
      "
      onmouseover="this.style.background='rgba(200,136,42,0.08)';this.style.borderColor='rgba(200,136,42,0.55)'"
      onmouseout="this.style.background='transparent';this.style.borderColor='rgba(200,136,42,0.25)'">
        <span style="font-size:0.88rem;color:var(--parchment);font-style:italic;flex:1;">${text}</span>
        <span style="font-family:var(--font-mono);font-size:0.55rem;letter-spacing:0.15em;
          text-transform:uppercase;color:var(--amber-dim);opacity:0.7;white-space:nowrap;">${subtitle}</span>
      </button>
    `;
  }

  // ──────────────────────────────────────────
  //  EXECUTE ENDING PATH
  // ──────────────────────────────────────────
  async executeEnding(path) {
    gameState.setFlag('path_chosen', path);

    // Brief epilogue narration before final screen
    const narrations = {
      path_justice: [
        'I call Detective Rafe Aldous. He picks up on the second ring.',
        '"It\'s Cole. I\'ve got a confession and a stack of evidence on the Ashwood case."',
        '"Send it."',
        '"I\'m bringing it in person."',
        'I look at Nathaniel.',
        '"They\'ll be here in twenty minutes. Don\'t go anywhere."',
        'He nods. His hands are shaking slightly. I don\'t think it\'s fear.',
        'I think it\'s relief.'
      ],
      path_honor: [
        '"You have until six AM tomorrow,"',
        '"Walk into Whitmore Police Department. Tell them everything."',
        '"If you\'re not there by six, I\'ll be there at six-oh-one."',
        'He looks at me for a long time.',
        '"Why?"',
        '"Because your father was going to confess his own crimes. Maybe the courage skips a generation."',
        '"Or maybe it doesn\'t. We\'ll see."',
        'I leave him standing in the study.'
      ],
      path_family: [
        'I find Dorothea in the drawing room.',
        'Sylvie is already there — she knew something was happening.',
        'Hester makes tea nobody asks for.',
        'I lay the photographs, the report, the receipts on the table.',
        'I explain what each one means.',
        'Nobody speaks for a long time.',
        'Then Dorothea picks up the telephone.'
      ],
      path_understanding: [
        '"Tell me everything," I say.',
        '"From the beginning."',
        'He does.',
        'It takes two hours.',
        'By the end I understand how a man becomes a murderer without ever deciding to become one.',
        'I understand it.',
        'That doesn\'t change what I do next.'
      ],
      path_coverup: [
        'Dorothea sets the envelope on the table between us.',
        'I look at it for a long time.',
        'I\'ve walked away from more complicated things for less.',
        'I tell myself I\'ll figure out what to do with the money later.',
        'I pick up the envelope.'
      ],
      incomplete: [
        'He meets every piece I have with something that almost holds together.',
        'Almost.',
        'Without the toxicology report. Without the pharmacy name resolved.',
        'Without the camera photos.',
        'There\'s enough for suspicion. Not enough for prosecution.',
        '"I think we\'re done here, Miss Cole."',
        'His voice has changed. The charm is back.',
        'He knows he won.'
      ]
    };

    const lines = narrations[path] || narrations.incomplete;

    await uiManager.fadeOut(500);
    await uiManager.fadeIn(500);

    dialogueEngine.narrate(lines, () => {
      const endingMap = {
        path_justice:      'ending_justice',
        path_honor:        'ending_honor',
        path_family:       'ending_family',
        path_understanding:'ending_understanding',
        path_coverup:      'ending_coverup',
        incomplete:        'ending_incomplete'
      };
      const endingId = endingMap[path] || gameState.determineEnding();
      setTimeout(() => uiManager.showEnding(endingId), 1200);
    });
  }
}

const confrontationSystem = new ConfrontationSystem();
