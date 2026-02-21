// ════════════════════════════════════════════════════════════
//  THE ASHWOOD INHERITANCE — Act Progression Manager
//  Watches game state and triggers act advances,
//  unlocks locations, schedules NPC arrivals.
// ════════════════════════════════════════════════════════════

class ActProgressionManager {
  constructor() {
    this.checkInterval = null;
    this.lastAct = 1;
  }

  // ──────────────────────────────────────────
  //  START WATCHING
  // ──────────────────────────────────────────
  start() {
    this.checkInterval = setInterval(() => this.tick(), 2000);
  }

  stop() {
    clearInterval(this.checkInterval);
  }

  tick() {
    const act = gameState.currentAct;
    if (act !== this.lastAct) {
      this.lastAct = act;
      this.onActChange(act);
    }
    this.checkPassiveUnlocks();
    this.checkBribeEnding();
  }

  // ──────────────────────────────────────────
  //  ACT CHANGE HANDLER
  // ──────────────────────────────────────────
  onActChange(act) {
    switch(act) {
      case 2: this.setupAct2(); break;
      case 3: this.setupAct3(); break;
      case 4: this.setupAct4(); break;
      case 5: this.setupAct5(); break;
    }
  }

  setupAct2() {
    // Nathaniel arrives at manor
    gameState.setFlag('nathaniel_arrived', true);
    // Upper floor now accessible
    uiManager.toast('Nathaniel Ashwood has arrived from the city.');
    // Auto-unlock library after meeting dorothea
    if (gameState.getFlag('met_dorothea')) {
      gameState.setFlag('library_east_accessible', true);
    }
  }

  setupAct3() {
    // Whitmore locations become accessible after Crane appointment confirmed
    if (gameState.hasClue('crane_appointment')) {
      uiManager.toast('Dr. Crane\'s office and Whitmore Bank are now accessible.');
    }
    // Shed key route via Dorothea
    if (gameState.getFlag('dorothea_trust_gained')) {
      uiManager.toast('Dorothea has offered to share what she knows.');
    }
  }

  setupAct4() {
    uiManager.toast('Act IV: The Reckoning. Return to Ashwood Manor.');
    // All confrontation dialogue now available
    gameState.setFlag('confrontation_mode', true);
    // Declan in Whitmore can be visited for extra depth
    gameState.setFlag('declan_accessible', true);
    // Nathaniel is in the manor but no longer guarding his room
    gameState.setFlag('nathaniel_dismissed', true);
  }

  setupAct5() {
    // This is triggered by the confrontation system — no separate setup needed
  }

  // ──────────────────────────────────────────
  //  PASSIVE UNLOCKS
  // ──────────────────────────────────────────
  checkPassiveUnlocks() {
    // Library unlocks after meeting Dorothea
    if (gameState.getFlag('met_dorothea') && !gameState.getFlag('library_accessible')) {
      gameState.setFlag('library_accessible', true);
    }

    // Nathaniel's room unlocks after Act 2 starts
    if (gameState.currentAct >= 2 && !gameState.getFlag('upper_floor_accessible')) {
      gameState.setFlag('upper_floor_accessible', true);
    }

    // Crane office accessible once we know about his appointment
    if (gameState.hasClue('crane_appointment') && !gameState.getFlag('crane_office_accessible')) {
      gameState.setFlag('crane_office_accessible', true);
    }

    // Bank accessible once we have the safety deposit key
    if (gameState.hasClue('safety_deposit_key') && !gameState.getFlag('bank_accessible')) {
      gameState.setFlag('bank_accessible', true);
    }

    // Check act advancement conditions
    this.checkActAdvancement();
  }

  // ──────────────────────────────────────────
  //  ACT ADVANCEMENT CONDITIONS
  // ──────────────────────────────────────────
  checkActAdvancement() {
    const act = gameState.currentAct;

    // Act 1 → 2: Found a critical clue in the manor
    if (act === 1) {
      const act1Complete = gameState.hasClue('brandy_glass') ||
                           gameState.hasClue('crane_appointment') ||
                           gameState.hasClue('portrait_anomaly');
      if (act1Complete && gameState.getFlag('met_dorothea')) {
        this.advanceAct(2);
      }
    }

    // Act 2 → 3: Found the hidden will AND have Sylvie's testimony
    if (act === 2) {
      const act2Complete = gameState.hasClue('new_will_draft') &&
                           gameState.getFlag('sylvie_trust_gained');
      if (act2Complete) {
        this.advanceAct(3);
      }
    }

    // Act 3 → 4: Toxicology + Jonas letter
    if (act === 3) {
      const act3Complete = gameState.hasClue('toxicology_results') &&
                           gameState.hasClue('jonas_letter_1972');
      if (act3Complete) {
        this.advanceAct(4);
      }
    }

    // Act 4 → 5: Nathaniel confessed
    if (act === 4) {
      if (gameState.getFlag('nathaniel_confessed') ||
          gameState.getFlag('bribe_accepted') ||
          gameState.getFlag('path_chosen') === 'incomplete') {
        this.advanceAct(5);
      }
    }
  }

  advanceAct(newAct) {
    if (gameState.currentAct >= newAct) return;
    gameState.currentAct = newAct;
    uiManager.showActTransition(newAct);
    audioManager.setScene(gameState.currentLocation);
  }

  // ──────────────────────────────────────────
  //  SPECIAL: BRIBE ENDING CHECK
  // ──────────────────────────────────────────
  checkBribeEnding() {
    if (gameState.getFlag('bribe_accepted') && gameState.currentAct < 5) {
      gameState.currentAct = 5;
      setTimeout(() => {
        confrontationSystem.executeEnding('path_coverup');
      }, 1000);
    }
  }

  // ──────────────────────────────────────────
  //  HUD CLOCK — advance in-game time with acts
  // ──────────────────────────────────════════
  getActTime(act) {
    const times = {
      1: { hour: 22, minute: 41, date: 'October 15th' },
      2: { hour: 10, minute: 15, date: 'October 16th' },
      3: { hour: 14, minute: 30, date: 'October 16th' },
      4: { hour: 19, minute: 0,  date: 'October 16th' },
      5: { hour: 23, minute: 15, date: 'October 16th' }
    };
    return times[act] || times[1];
  }

  syncHudClock() {
    const t = this.getActTime(gameState.currentAct);
    if (uiManager.clock) {
      uiManager.clock.hour = t.hour;
      uiManager.clock.minute = t.minute;
      uiManager.renderClock();
    }
    const dateEl = document.getElementById('hud-date');
    if (dateEl) dateEl.textContent = t.date;
  }
}

const actProgressionManager = new ActProgressionManager();
