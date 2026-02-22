// ============================================================
//  AXIOM BREAK — TransmissionScene.js
//  (Transmissions are handled via DOM overlay in hud.js)
//  This scene exists as a placeholder / future cinematic scene
// ============================================================

class TransmissionScene extends Phaser.Scene {
  constructor() { super({ key: 'Transmission' }); }
  create() { /* Handled by HUD.showTransmission */ }
}


// ============================================================
//  AXIOM BREAK — UIScene.js
//  Persistent UI overlay scene (runs on top of Game)
//  Currently used for boss health bar, wave counter
// ============================================================

class UIScene extends Phaser.Scene {
  constructor() { super({ key: 'UI' }); }

  create() {
    // This scene is reserved for future phase 2 UI elements:
    // - Mini-map
    // - Boss health bar rendered in Phaser canvas
    // - Ability wheel
  }
}
