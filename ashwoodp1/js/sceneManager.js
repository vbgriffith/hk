// ============================================================
//  THE ASHWOOD INHERITANCE - Scene Manager
//  Coordinates location changes, Phaser scenes, and game flow
//  Phase 1: Stub / framework — Phaser scenes added in Phase 2
// ============================================================

class SceneManager {
  constructor() {
    this.phaserGame = null;
    this.currentSceneKey = null;
    this.pendingTransition = null;
  }

  // ============================================================
  //  PHASER INITIALIZATION
  // ============================================================
  initPhaser() {
    const config = {
      type: Phaser.AUTO,
      width: 960,
      height: 540,
      parent: 'game-container',
      canvas: document.getElementById('game-canvas'),
      backgroundColor: '#0a0806',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [
        BootScene,
        PreloadScene,
        ManorExteriorScene,
        // Additional scenes added in Phase 2
      ]
    };

    this.phaserGame = new Phaser.Game(config);
    return this.phaserGame;
  }

  // ============================================================
  //  LOCATION TRANSITIONS
  // ============================================================
  async goToLocation(locationId) {
    const result = gameState.moveTo(locationId);

    if (!result.success) {
      this.handleLockedLocation(result);
      return;
    }

    // Fade out
    await uiManager.fadeOut(500);

    // Show location banner
    uiManager.showLocationBanner(locationId);

    // Trigger Phaser scene change (Phase 2)
    this.transitionPhaserScene(locationId);

    // Fade in
    await uiManager.fadeIn(500);

    // Auto-trigger any immediate dialogue for this location
    this.checkLocationEvents(locationId);
  }

  handleLockedLocation(result) {
    const location = result.location;
    let message = `${location.name} is locked.`;

    if (location.unlockCondition) {
      // Parse condition to give helpful hint
      if (location.unlockCondition.includes('hester_permission')) {
        message = 'Hester keeps the study locked. You\'ll need her permission.';
      } else if (location.unlockCondition.includes('safety_deposit_key')) {
        message = 'You need the safety deposit box key.';
      } else if (location.unlockCondition.includes('groundskeeper_shed_key')) {
        message = 'The shed is padlocked. You need a key.';
      }
    }

    dialogueEngine.narrate([message]);
  }

  transitionPhaserScene(locationId) {
    // Map location IDs to Phaser scene keys (Phase 2)
    const sceneMap = {
      manor_exterior:    'ManorExteriorScene',
      foyer:             'FoyerScene',
      drawing_room:      'DrawingRoomScene',
      study:             'StudyScene',
      library_east:      'LibraryScene',
      dining_room:       'DiningRoomScene',
      kitchen:           'KitchenScene',
      nathaniel_room:    'NathanielRoomScene',
      carriage_house:    'CarriageHouseScene',
      groundskeeper_shed:'ShedScene',
      whitmore_bank:     'BankScene',
      dr_crane_office:   'CraneOfficeScene'
    };

    const sceneKey = sceneMap[locationId];
    if (sceneKey && this.phaserGame) {
      // Stop current scene, start new one
      if (this.currentSceneKey) {
        this.phaserGame.scene.stop(this.currentSceneKey);
      }
      this.phaserGame.scene.start(sceneKey);
      this.currentSceneKey = sceneKey;
    }
  }

  checkLocationEvents(locationId) {
    // Auto-trigger character encounters based on location
    const location = STORY.locations[locationId];
    if (!location) return;

    // First visit narration
    if (location.firstVisit && !gameState.hasSeenDialogue(`first_visit_${locationId}`)) {
      gameState.markDialogueSeen(`first_visit_${locationId}`);
      dialogueEngine.narrate([location.firstVisit]);
    }

    // Auto-present characters in location
    if (location.characters && location.characters.length > 0) {
      const char = location.characters[0];
      if (!gameState.hasSeenDialogue(`${char}_intro`)) {
        setTimeout(() => {
          if (!dialogueEngine.isActive) {
            dialogueEngine.startConversation(char);
          }
        }, 1500);
      }
    }
  }

  // ============================================================
  //  CALLBACK FROM DIALOGUE ENGINE
  // ============================================================
  onDialogueEnd() {
    // Check for act advancement
    if (gameState.checkActCompletion()) {
      const newAct = gameState.advanceAct();
      this.onActAdvance(newAct);
    }
  }

  onActAdvance(actNumber) {
    const act = STORY.acts[`act${actNumber}`];
    if (!act) return;

    uiManager.updateAct(actNumber);

    // Narrate act title
    setTimeout(() => {
      dialogueEngine.narrate([
        `— ${act.title} —`,
        act.subtitle
      ]);
    }, 500);
  }

  // ============================================================
  //  ENDING
  // ============================================================
  triggerEnding() {
    const endingId = gameState.determineEnding();
    const ending = STORY.endings[endingId];
    if (!ending) return;

    this.showEnding(ending);
  }

  showEnding(ending) {
    uiManager.fadeOut(1000).then(() => {
      // Create ending screen
      const screen = document.createElement('div');
      screen.style.cssText = `
        position: fixed;
        inset: 0;
        background: var(--ink);
        z-index: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        padding: 2rem;
      `;

      const content = `
        <div style="max-width: 600px; text-align: center;">
          <div style="font-family:var(--font-type);font-size:0.65rem;letter-spacing:0.3em;text-transform:uppercase;color:var(--amber);margin-bottom:1.5rem;">Ending</div>
          <h2 style="font-family:var(--font-display);font-size:2.2rem;font-style:italic;color:var(--parchment);margin-bottom:1rem;">${ending.title}</h2>
          <div style="width:60px;height:1px;background:linear-gradient(90deg,transparent,var(--amber),transparent);margin:0 auto 1.5rem;"></div>
          ${ending.marenFinalThought.map(line =>
            `<p style="font-family:var(--font-body);font-size:0.95rem;font-style:italic;color:var(--parchment-dark);line-height:1.8;margin-bottom:0.5rem;">${line}</p>`
          ).join('')}
          ${ending.epilogues ? `
            <div style="margin-top:2rem;text-align:left;border-top:1px solid rgba(200,136,42,0.2);padding-top:1.5rem;">
              <div style="font-family:var(--font-type);font-size:0.6rem;letter-spacing:0.25em;color:var(--amber);text-transform:uppercase;margin-bottom:1rem;">Epilogue</div>
              ${Object.entries(ending.epilogues).map(([char, text]) =>
                `<p style="font-family:var(--font-body);font-size:0.82rem;color:var(--parchment-dark);line-height:1.6;margin-bottom:0.5rem;"><strong style="font-style:normal;color:var(--amber-soft);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.1em;">${char}</strong> — ${text}</p>`
              ).join('')}
            </div>
          ` : ''}
          <button onclick="location.reload();" style="margin-top:2rem;font-family:var(--font-type);font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;background:transparent;border:1px solid rgba(200,136,42,0.4);color:var(--parchment-dark);padding:0.75rem 2rem;cursor:pointer;">Play Again</button>
        </div>`;

      screen.innerHTML = content;
      document.body.appendChild(screen);

      uiManager.fadeIn(1200);
    });
  }
}

// ============================================================
//  PHASER SCENE STUBS (Phase 1)
//  These will be fully implemented in Phase 2
// ============================================================

class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  create() {
    // Set up game scale, font loading, etc.
    this.scene.start('PreloadScene');
  }
}

class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: 'PreloadScene' }); }

  preload() {
    // Phase 2: Load all actual assets here
    // For now, create placeholder graphics

    // Progress bar
    const progress = this.add.graphics();
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.load.on('progress', (value) => {
      progress.clear();
      progress.fillStyle(0x1c1510);
      progress.fillRect(0, 0, width, height);
      progress.fillStyle(0xc8882a);
      progress.fillRect(width * 0.3, height * 0.5 - 2, width * 0.4 * value, 4);
    });
  }

  create() {
    // Show title screen, transition to ManorExteriorScene
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(600, () => {
      this.scene.start('ManorExteriorScene');
    });
  }
}

class ManorExteriorScene extends Phaser.Scene {
  constructor() { super({ key: 'ManorExteriorScene' }); }

  create() {
    const { width, height } = this.cameras.main;

    // Phase 1: Atmospheric placeholder background
    // Phase 2: Replace with actual tilemap/artwork

    // Sky gradient
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x0a0806, 0x0a0806, 0x1a1020, 0x1a1020, 1);
    sky.fillRect(0, 0, width, height * 0.6);

    // Ground
    const ground = this.add.graphics();
    ground.fillStyle(0x0d0f08);
    ground.fillRect(0, height * 0.6, width, height * 0.4);

    // Manor silhouette (placeholder)
    const manor = this.add.graphics();
    manor.fillStyle(0x0f0c0a);
    // Main body
    manor.fillRect(width * 0.3, height * 0.15, width * 0.4, height * 0.45);
    // West wing
    manor.fillRect(width * 0.15, height * 0.25, width * 0.18, height * 0.35);
    // East wing
    manor.fillRect(width * 0.67, height * 0.25, width * 0.18, height * 0.35);
    // Roof
    manor.fillTriangle(
      width * 0.3, height * 0.15,
      width * 0.5, height * 0.03,
      width * 0.7, height * 0.15
    );

    // Windows (lit amber)
    const windowLight = this.add.graphics();
    windowLight.fillStyle(0xc8882a, 0.4);
    // Scatter some lit windows
    [[0.37, 0.28], [0.45, 0.28], [0.55, 0.28],
     [0.37, 0.38], [0.55, 0.38], [0.45, 0.45]].forEach(([x, y]) => {
      windowLight.fillRect(width * x, height * y, 16, 22);
    });

    // Study window — slightly brighter
    windowLight.fillStyle(0xe8a84a, 0.6);
    windowLight.fillRect(width * 0.45, height * 0.38, 16, 22);

    // Rain effect (simple particles)
    this.time.addEvent({
      delay: 50,
      callback: () => this.addRainDrop(),
      loop: true
    });

    // Fog / atmosphere overlay
    const fog = this.add.graphics();
    fog.fillStyle(0x0d0c10, 0.25);
    fog.fillRect(0, height * 0.5, width, height * 0.1);

    // Title screen (shown on top in HTML)
    // Phaser is just the background during title

    // Click anywhere to dismiss title
    this.input.once('pointerdown', () => {
      if (document.getElementById('title-screen')) {
        // handled by UIManager
      }
    });
  }

  addRainDrop() {
    if (!this.sys.isActive()) return;
    const x = Phaser.Math.Between(0, this.cameras.main.width);
    const y = Phaser.Math.Between(-20, 0);
    const line = this.add.graphics();
    line.lineStyle(1, 0x4a6080, 0.2);
    line.lineBetween(x, y, x - 2, y + 15);

    this.tweens.add({
      targets: line,
      y: this.cameras.main.height + 20,
      duration: 800,
      ease: 'Linear',
      onComplete: () => line.destroy()
    });
  }
}

// Global instance
const sceneManager = new SceneManager();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SceneManager;
}
