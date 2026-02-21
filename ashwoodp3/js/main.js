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
        CarriageHouseScene,
        // Phase 3 scenes
        NathanielRoomScene,
        LibraryEastScene,
        GroundskeeperShedScene,
        CraneOfficeScene,
        WhitmoreBankScene,
        DeclanStudyScene
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
      manor_exterior:       'ManorExteriorScene',
      foyer:                'FoyerScene',
      study:                'StudyScene',
      drawing_room:         'DrawingRoomScene',
      kitchen:              'KitchenScene',
      carriage_house:       'CarriageHouseScene',
      nathaniel_room:       'NathanielRoomScene',
      library_east:         'LibraryEastScene',
      groundskeeper_shed:   'GroundskeeperShedScene',
      dr_crane_office:      'CraneOfficeScene',
      whitmore_bank:        'WhitmoreBankScene',
      declan_study:         'DeclanStudyScene',
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

    // Act 4: inject confrontation hotspot in foyer
    if (locationId === 'foyer' && gameState.currentAct >= 4) {
      setTimeout(() => {
        const scene = this.phaserGame?.scene.getScene('FoyerScene');
        if (scene && typeof injectConfrontationHotspot === 'function') {
          const W = scene.scale.width;
          const H = scene.scale.height;
          injectConfrontationHotspot(scene, W, H);
        }
      }, 500);
    }

    // Act 4: offer Dorothea bribe if conditions met
    if (locationId === 'drawing_room' && gameState.currentAct >= 4) {
      if (gameState.hasClue('blackmail_letters') && !gameState.getFlag('bribe_offered')) {
        setTimeout(() => {
          if (!dialogueEngine.isActive) {
            dialogueEngine.startConversation('dorothea', 'dorothea_bribe_moment');
          }
        }, 2500);
      }
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
    actProgressionManager.start();
    actProgressionManager.syncHudClock();

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
    actProgressionManager.start();
    actProgressionManager.syncHudClock();

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
      state:           () => console.table(gameState.getSummary()),
      giveClue:        (id) => { gameState.addClue(id); uiManager.updateBadges(); },
      addItem:         (id) => { gameState.addItem(id); uiManager.updateBadges(); },
      setFlag:         (k, v=true) => gameState.setFlag(k, v),
      goto:            (id) => sceneManager.goToLocation(id),
      talk:            (char, node) => dialogueEngine.startConversation(char, node),
      skipToAct:       (n) => { gameState.currentAct = n; uiManager.updateAct(n); actProgressionManager.syncHudClock(); },
      triggerEnding:   (id) => uiManager.showEnding(id),
      confront:        (char) => confrontationSystem.startConfrontation(char),
      allClues:        () => console.log(Object.keys(STORY.clues)),
      allEndings:      () => console.log(Object.keys(STORY.endings)),
      allLocations:    () => console.log(Object.keys(STORY.locations)),
      allFlags:        () => console.log(Object.keys(gameState.flags).filter(k => gameState.flags[k])),
      fullEvidence:    () => {
        Object.keys(STORY.clues).forEach(id => gameState.addClue(id));
        uiManager.updateBadges();
        console.log('All clues added');
      },
      act3Ready: () => {
        ['brandy_glass','crane_appointment','new_will_draft','washed_decanter'].forEach(c => gameState.addClue(c));
        gameState.setFlag('met_dorothea',true); gameState.setFlag('met_sylvie',true);
        gameState.setFlag('sylvie_trust_gained',true); gameState.currentAct = 3;
        uiManager.updateAct(3); uiManager.updateBadges();
        console.log('Ready for Act 3');
      },
      act4Ready: () => {
        ['brandy_glass','crane_appointment','new_will_draft','washed_decanter',
         'pharmacy_receipt','toxicology_results','sylvie_camera_photos','jonas_letter_1972'].forEach(c => gameState.addClue(c));
        gameState.setFlag('met_dorothea',true); gameState.setFlag('met_nathaniel',true);
        gameState.setFlag('crane_confronted',true); gameState.setFlag('nathaniel_dismissed',true);
        gameState.setFlag('sylvie_trust_gained',true); gameState.setFlag('hester_alibi_broken',true);
        gameState.currentAct = 4; uiManager.updateAct(4); uiManager.updateBadges();
        console.log('Ready for Act 4 — confrontation. DEBUG.confront("nathaniel") to begin.');
      },
      winGame: () => {
        ['toxicology_results','pharmacy_receipt','sylvie_camera_photos','jonas_letter_1972'].forEach(id => gameState.addClue(id));
        gameState.setFlag('nathaniel_confessed',true);
        gameState.setFlag('path_chosen', 'path_justice');
        uiManager.showEnding('ending_justice');
      }
    };
    console.log('%c🔍 Ashwood Debug Tools: window.DEBUG', 'color:#c8882a;font-style:italic;font-size:13px');
    console.log('DEBUG.act3Ready() | DEBUG.act4Ready() | DEBUG.confront("nathaniel") | DEBUG.winGame()');
  }

})();
