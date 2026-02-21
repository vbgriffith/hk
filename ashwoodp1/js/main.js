// ============================================================
//  THE ASHWOOD INHERITANCE - Main Entry Point
//  Initializes game, binds title screen, starts first act
// ============================================================

(function() {
  'use strict';

  // ============================================================
  //  WAIT FOR DOM
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    initGame();
  });

  function initGame() {
    // Initialize Phaser (renders atmospheric background)
    sceneManager.initPhaser();

    // Bind title screen buttons
    bindTitleScreen();

    // Try to show continue button if save exists
    const hasSave = !!localStorage.getItem('ashwood_save');
    const continueBtn = document.getElementById('btn-continue');
    if (continueBtn) {
      continueBtn.style.opacity = hasSave ? '1' : '0.3';
      continueBtn.disabled = !hasSave;
    }

    // Animate title in
    animateTitleIn();
  }

  // ============================================================
  //  TITLE SCREEN
  // ============================================================
  function bindTitleScreen() {
    document.getElementById('btn-new-game')?.addEventListener('click', () => {
      startNewGame();
    });

    document.getElementById('btn-continue')?.addEventListener('click', () => {
      continueGame();
    });

    document.getElementById('btn-about')?.addEventListener('click', () => {
      showAbout();
    });
  }

  function animateTitleIn() {
    const titleCard = document.getElementById('title-card');
    if (!titleCard) return;

    titleCard.style.opacity = '0';
    titleCard.style.transform = 'translateY(20px)';

    setTimeout(() => {
      titleCard.style.transition = 'opacity 1.2s ease, transform 1.2s ease';
      titleCard.style.opacity = '1';
      titleCard.style.transform = 'translateY(0)';
    }, 300);
  }

  async function startNewGame() {
    gameState.reset();

    // Dismiss title
    await dismissTitleScreen();

    // Opening narration
    const openingLines = STORY.acts.act1.openingNarration;

    dialogueEngine.narrate(openingLines, () => {
      // After opening, show manor exterior and begin Act 1
      beginAct1();
    });

    uiManager.updateAct(1);
  }

  async function continueGame() {
    const saved = localStorage.getItem('ashwood_save');
    if (!saved) return;

    if (gameState.deserialize(saved)) {
      await dismissTitleScreen();
      uiManager.updateAct(gameState.currentAct);
      uiManager.showLocationBanner(gameState.currentLocation);
      uiManager.showToast('Investigation resumed.');
    }
  }

  async function dismissTitleScreen() {
    const titleScreen = document.getElementById('title-screen');
    if (!titleScreen) return;

    await new Promise(resolve => {
      titleScreen.style.transition = 'opacity 0.8s ease';
      titleScreen.style.opacity = '0';
      setTimeout(() => {
        titleScreen.style.display = 'none';
        resolve();
      }, 800);
    });
  }

  // ============================================================
  //  ACT 1 STARTUP
  // ============================================================
  function beginAct1() {
    // Show manor exterior
    uiManager.showLocationBanner('manor_exterior');

    // Set initial flags
    gameState.setFlag('act_current', 1);

    // After a moment, prompt first interaction
    setTimeout(() => {
      showExteriorPrompt();
    }, 2000);
  }

  function showExteriorPrompt() {
    // First interaction node — approaching the door
    dialogueEngine.narrate(
      [
        "The gravel drive is wet. Tire tracks. Someone was here last night, came and went.",
        "The front door is dark oak, brass knocker shaped like a hawk.",
        "Three steps. I count them. Old habit."
      ],
      () => {
        // Set met flag
        gameState.setFlag('met_hester', true);
        // Begin hester intro dialogue
        setTimeout(() => {
          dialogueEngine.startConversation('hester', 'hester_intro');
        }, 500);
      }
    );

    // Auto-give tire tracks clue
    gameState.addClue('tire_tracks');
  }

  // ============================================================
  //  ABOUT SCREEN
  // ============================================================
  function showAbout() {
    const about = document.createElement('div');
    about.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      z-index: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    `;

    about.innerHTML = `
      <div style="max-width:500px;padding:2.5rem;background:var(--ink-soft);border:1px solid rgba(200,136,42,0.3);" onclick="event.stopPropagation()">
        <div style="font-family:var(--font-display);font-size:1.6rem;font-style:italic;color:var(--parchment);margin-bottom:1rem;">The Ashwood Inheritance</div>
        <div style="font-family:var(--font-type);font-size:0.62rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--amber);margin-bottom:1.5rem;">A Mystery in Five Acts</div>
        <p style="font-family:var(--font-body);font-size:0.85rem;color:var(--parchment-dark);line-height:1.7;font-style:italic;margin-bottom:1rem;">
          A 2D mystery game with a deep, branching narrative. Investigate the death of Elias Ashwood,
          uncover buried secrets, and choose how justice is served.
        </p>
        <p style="font-family:var(--font-body);font-size:0.82rem;color:var(--parchment-dark);line-height:1.7;font-style:italic;margin-bottom:1.5rem;">
          Estimated play time: 3–4 hours<br>
          Endings: 6 (including one hidden)<br>
          Acts: 5
        </p>
        <div style="font-family:var(--font-type);font-size:0.6rem;letter-spacing:0.15em;color:var(--mist);margin-bottom:1rem;">
          Built with Phaser 3 · Howler.js · Anime.js<br>
          Phase 1 Build — Story Foundation
        </div>
        <button onclick="this.closest('div[style]').parentElement.remove()" style="font-family:var(--font-type);font-size:0.68rem;letter-spacing:0.15em;text-transform:uppercase;background:transparent;border:1px solid rgba(200,136,42,0.3);color:var(--parchment-dark);padding:0.6rem 1.5rem;cursor:pointer;">Close</button>
      </div>`;

    about.addEventListener('click', () => about.remove());
    document.body.appendChild(about);
  }

  // ============================================================
  //  GLOBAL KEYBOARD SHORTCUTS
  // ============================================================
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'j':
      case 'J':
        if (!dialogueEngine.isActive) uiManager.toggleJournal();
        break;
      case 'Escape':
        if (uiManager.journalOpen) uiManager.closeJournal();
        break;
      case 's':
      case 'S':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          uiManager.saveGame();
        }
        break;
    }
  });

  // ============================================================
  //  EXPOSE DEBUG HELPERS (development only)
  // ============================================================
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.DEBUG = {
      state: () => console.log(gameState.getSummary()),
      giveClue: (id) => gameState.addClue(id),
      setFlag: (k, v) => gameState.setFlag(k, v),
      testDialogue: (char, node) => dialogueEngine.startConversation(char, node),
      skipToAct: (n) => {
        gameState.currentAct = n;
        uiManager.updateAct(n);
      },
      triggerEnding: (id) => {
        const ending = STORY.endings[id];
        if (ending) sceneManager.showEnding(ending);
      },
      allClues: () => Object.keys(STORY.clues),
      allEndings: () => Object.keys(STORY.endings)
    };
    console.log('%cAshwood Debug Tools Available: window.DEBUG', 'color: #c8882a; font-style: italic;');
    console.log('Commands: DEBUG.state(), DEBUG.giveClue(id), DEBUG.testDialogue(char, node), DEBUG.skipToAct(n), DEBUG.triggerEnding(id)');
  }

})();
