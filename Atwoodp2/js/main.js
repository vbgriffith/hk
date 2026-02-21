// ════════════════════════════════════════════════════════════
//  THE ASHWOOD INHERITANCE — Scene Manager (Phase 2)
// ════════════════════════════════════════════════════════════

class SceneManager {
  constructor() {
    this.phaserGame = null;
    this.currentSceneKey = null;
    this.transitioning = false;
  }

  initPhaser() {
    const config = {
      type: Phaser.AUTO,
      width: 960,
      height: 540,
      parent: 'game-container',
      canvas: document.getElementById('game-canvas'),
      backgroundColor: '#080604',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [
        BootScene,
        PreloadScene,
        TitleBgScene,
        ManorExteriorScene,
        FoyerScene,
        StudyScene,
        DrawingRoomScene,
        KitchenScene,
        CarriageHouseScene
      ]
    };
    this.phaserGame = new Phaser.Game(config);
    return this.phaserGame;
  }

  // ──────────────────────────────────────────
  //  LOCATION NAVIGATION
  // ──────────────────────────────────────────
  async goToLocation(locationId) {
    if (this.transitioning) return;

    const result = gameState.moveTo(locationId);
    if (!result.success) {
      this.handleLocked(result);
      return;
    }

    this.transitioning = true;
    audioManager.playDoorFX();

    await uiManager.fadeOut(450);
    uiManager.showLocationBanner(locationId);

    // Transition Phaser scene
    const sceneKey = this.getSceneKey(locationId);
    if (sceneKey && this.phaserGame) {
      if (this.currentSceneKey) {
        this.phaserGame.scene.stop(this.currentSceneKey);
      }
      this.phaserGame.scene.start(sceneKey);
      this.currentSceneKey = sceneKey;
    }

    await uiManager.fadeIn(450);
    this.transitioning = false;

    // Auto-trigger location events
    this.checkLocationEvents(locationId);
    audioManager.setScene(locationId);
  }

  getSceneKey(locationId) {
    const map = {
      manor_exterior:    'ManorExteriorScene',
      foyer:             'FoyerScene',
      study:             'StudyScene',
      drawing_room:      'DrawingRoomScene',
      kitchen:           'KitchenScene',
      carriage_house:    'CarriageHouseScene',
    };
    return map[locationId] || null;
  }

  handleLocked(result) {
    const loc = result.location;
    let msg = `${loc.name} is locked.`;
    if (loc.unlockCondition?.includes('hester_permission') || loc.unlockCondition?.includes('study')) {
      msg = 'The study is locked. Hester keeps the key.';
    } else if (loc.unlockCondition?.includes('groundskeeper')) {
      msg = 'The shed is padlocked. You need a key.';
    } else if (loc.unlockCondition?.includes('safety_deposit')) {
      msg = 'You need the safety deposit box key.';
    }
    dialogueEngine.narrate([msg]);
  }

  checkLocationEvents(locationId) {
    const loc = STORY.locations[locationId];
    if (!loc) return;
    if (loc.firstVisit && !gameState.hasSeenDialogue(`first_visit_${locationId}`)) {
      gameState.markDialogueSeen(`first_visit_${locationId}`);
      setTimeout(() => {
        if (!dialogueEngine.isActive) dialogueEngine.narrate([loc.firstVisit]);
      }, 1000);
    }
  }

  // ──────────────────────────────────────────
  //  CALLED BY SCENES
  // ──────────────────────────────────────────
  triggerHotspot() {
    const scene = this.phaserGame?.scene.getScene(this.currentSceneKey);
    if (scene?.triggerHotspot) scene.triggerHotspot();
  }

  // ──────────────────────────────────────────
  //  FROM DIALOGUE ENGINE
  // ──────────────────────────────────────────
  onDialogueEnd() {
    if (gameState.checkActCompletion()) {
      const newAct = gameState.advanceAct();
      this.onActAdvance(newAct);
    }
  }

  onActAdvance(actNumber) {
    uiManager.showActTransition(actNumber);
  }

  // ──────────────────────────────────────────
  //  ENDING
  // ──────────────────────────────────────────
  triggerEnding() {
    const endingId = gameState.determineEnding();
    uiManager.showEnding(endingId);
  }
}

const sceneManager = new SceneManager();


// ════════════════════════════════════════════════════════════
//  MAIN ENTRY POINT
// ════════════════════════════════════════════════════════════
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // Phaser on title background while title screen shows
    sceneManager.initPhaser();

    bindTitleScreen();
    checkSaveExists();
    animateTitleCard();
  });

  function bindTitleScreen() {
    document.getElementById('btn-new-game')?.addEventListener('click', () => {
      audioManager.init();
      startNewGame();
    });
    document.getElementById('btn-continue')?.addEventListener('click', () => {
      audioManager.init();
      continueGame();
    });
  }

  function checkSaveExists() {
    const hasSave = !!localStorage.getItem('ashwood_save_v2');
    const btn = document.getElementById('btn-continue');
    if (btn) {
      btn.disabled = !hasSave;
      btn.style.opacity = hasSave ? '1' : '0.3';
    }
  }

  function animateTitleCard() {
    const card = document.getElementById('title-card');
    if (!card) return;
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    setTimeout(() => {
      card.style.transition = 'opacity 1.4s ease, transform 1.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 400);
  }

  async function startNewGame() {
    gameState.reset();
    if (!gameState.inventory) gameState.inventory = new Set();

    await dismissTitle();

    uiManager.updateAct(1);
    audioManager.startRain(0.6);
    audioManager.startAmbientMusic('investigation');

    // Opening narration, then go to exterior
    dialogueEngine.narrate(
      STORY.acts.act1.openingNarration,
      () => {
        sceneManager.goToLocation('manor_exterior');
      }
    );
  }

  async function continueGame() {
    if (!uiManager.loadGame()) return;
    if (!gameState.inventory) gameState.inventory = new Set();

    await dismissTitle();
    uiManager.updateAct(gameState.currentAct);
    uiManager.updateBadges();

    audioManager.setScene(gameState.currentLocation);

    sceneManager.goToLocation(gameState.currentLocation);
    uiManager.toast('Investigation resumed.');
  }

  async function dismissTitle() {
    const ts = document.getElementById('title-screen');
    if (!ts) return;
    return new Promise(resolve => {
      ts.style.transition = 'opacity 0.9s ease';
      ts.style.opacity = '0';
      setTimeout(() => { ts.style.display = 'none'; resolve(); }, 950);
    });
  }

  // ──────────────────────────────────────────
  //  DEBUG TOOLS (localhost)
  // ──────────────────────────────────────────
  if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    window.DEBUG = {
      state:          () => console.table(gameState.getSummary()),
      giveClue:       (id) => { gameState.addClue(id); uiManager.updateBadges(); },
      addItem:        (id) => { gameState.addItem(id); uiManager.updateBadges(); },
      setFlag:        (k, v=true) => gameState.setFlag(k, v),
      goto:           (id) => sceneManager.goToLocation(id),
      talk:           (char, node) => dialogueEngine.startConversation(char, node),
      skipToAct:      (n) => { gameState.currentAct = n; uiManager.updateAct(n); },
      triggerEnding:  (id) => uiManager.showEnding(id),
      allClues:       () => console.log(Object.keys(STORY.clues)),
      allEndings:     () => console.log(Object.keys(STORY.endings)),
      allLocations:   () => console.log(Object.keys(STORY.locations)),
      fullEvidence:   () => {
        Object.keys(STORY.clues).forEach(id => gameState.addClue(id));
        uiManager.updateBadges();
        console.log('All clues added');
      },
      winGame:        () => {
        ['toxicology_results','pharmacy_receipt','sylvie_camera_photos'].forEach(id => gameState.addClue(id));
        gameState.setFlag('nathaniel_confessed');
        gameState.setFlag('path_chosen', 'justice');
        uiManager.showEnding('ending_justice');
      }
    };
    console.log('%c🔍 Ashwood Debug Tools: window.DEBUG', 'color:#c8882a;font-style:italic;font-size:13px');
    console.log('DEBUG.goto(id) | DEBUG.talk(char) | DEBUG.giveClue(id) | DEBUG.winGame()');
  }

})();
