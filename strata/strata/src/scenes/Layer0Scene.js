/**
 * STRATA — Layer0Scene
 * CadenceOS — the player's desktop environment.
 * Everything is drawn procedurally on canvas.
 * First email from Ros. The attached zip. The terminal.
 * The feeling that you are being watched by software that isn't supposed to be able to watch.
 */
class Layer0Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Layer0Scene' });
    this._os = null;
    this._hud = null;
    this._terminal = null;
    this._firstVisit = true;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    StateManager.enterLayer(0);

    // Initialize transition engine on this scene
    TransitionEngine.init(this);

    // Draw desktop background
    this._drawBackground(W, H);

    // Initialize CadenceOS shell (windows, taskbar, icons)
    this._os = new CadenceOS(this, W, H);
    this._os.init();

    // Initialize HUD (depth indicator, corruption tells)
    this._hud = new HUD(this, W, H);
    this._hud.init();

    // Initialize terminal (Maren's voice)
    this._terminal = new Terminal(this, W, H);

    // Trigger first email from Ros on first visit
    if (StateManager.get('layerVisits')[0] === 1) {
      this._triggerFirstEmail();
    }

    // Listen for desktop anomalies (corruption bleed from Layer 4)
    EventBus.on('desktop:anomaly', this._handleAnomaly, this);

    // Listen for layer transitions requested by OS
    EventBus.on('layer:request', this._handleLayerRequest, this);

    // Fade in from white (arriving from BootScene or returning from layers)
    this._fadeIn();

    // Auto-save on arrival
    StateManager.save();
  }

  _drawBackground(W, H) {
    const bg = this.add.graphics();

    // CadenceOS wallpaper: warm off-white with a very faint grid
    bg.fillStyle(0xe8e2d8, 1);
    bg.fillRect(0, 0, W, H);

    // Subtle grid — barely visible
    bg.lineStyle(1, 0xd8d0c4, 0.4);
    const gridSize = 40;
    for (let x = 0; x < W; x += gridSize) {
      bg.beginPath();
      bg.moveTo(x, 0);
      bg.lineTo(x, H);
      bg.strokePath();
    }
    for (let y = 0; y < W; y += gridSize) {
      bg.beginPath();
      bg.moveTo(0, y);
      bg.lineTo(W, y);
      bg.strokePath();
    }

    // Vignette — darkens edges slightly
    const vignette = this.add.graphics();
    const vigSize = 200;
    // Just four darkened corner rects — approximate vignette
    vignette.fillStyle(0xc8bfb0, 0.15);
    vignette.fillRect(0, 0, vigSize, H);
    vignette.fillRect(W - vigSize, 0, vigSize, H);
    vignette.fillRect(0, 0, W, vigSize / 2);
    vignette.fillRect(0, H - vigSize / 2, W, vigSize / 2);
  }

  _triggerFirstEmail() {
    // Queue Ros's first email with a short delay — feels like it just arrived
    this.time.delayedCall(1800, () => {
      const email = {
        id: 'ros_001',
        from: 'ros.harker@lumencollective.com',
        fromDisplay: 'Ros Harker',
        subject: 'Project PILGRIM — Recovery Brief',
        timestamp: this._fakeTimestamp(-3), // 3 minutes ago
        read: false,
        attachments: [{ name: 'PILGRIM_archive_v7.zip', size: '847 MB', locked: false }],
        body: `Hi Maren,

Welcome aboard. I know the brief was thin — we'll fix that.

Short version: PILGRIM was an ARG we published in 2009. Long story. The underlying data architecture has some... legacy dependencies we'd like to document before we make any structural decisions about the system.

Your job is recovery and documentation. Access the archive, map what's in there, and file a report. Standard NDA applies. You've got full read permissions on everything in the PILGRIM layer and one layer down (the development environment — we call it the Workshop internally).

The zip is password-protected: pilgrim2009

Don't go below the Workshop.

Let me know if you have questions. I'm usually around.

— Ros

P.S. The ARG community still plays it. Please be mindful. They don't know this is a recovery operation.`
      };

      StateManager.addEmail(email);
      this._os.showEmailNotification(email);

      // Maren's first terminal note appears a beat after the email
      this.time.delayedCall(3000, () => {
        StateManager.addMarenNote(
          `new client. data archaeology. "don't go below the Workshop." that's the third time someone has told me exactly where not to look in the first email. ` +
          `something about a password in plaintext in a corporate email. 847 MB is a lot for an ARG from 2009.`
        );
      });
    });
  }

  _fakeTimestamp(minutesAgo) {
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutesAgo);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `Today, ${h}:${m}`;
  }

  _handleLayerRequest(data) {
    const { targetLayer } = data;
    if (targetLayer === undefined) return;

    this._transitionToLayer(targetLayer);
  }

  _transitionToLayer(targetLayer) {
    const sceneKeys = {
      1: 'Layer1Scene',
      2: 'Layer2Scene',
      3: 'Layer3Scene',
      4: 'Layer4Scene'
    };

    const targetKey = sceneKeys[targetLayer];
    if (!targetKey) return;

    // Disable input during transition
    this.input.enabled = false;

    TransitionEngine.transition(
      this,
      0,
      targetLayer,
      () => {
        // Midpoint: switch scene
        this.scene.start(targetKey);
      },
      null
    );
  }

  _handleAnomaly(data) {
    const { id } = data;
    // Anomalous files appear on desktop — OS handles visual
    this._os.spawnAnomalyFile(id);

    // Maren notices
    const anomalyNotes = {
      anomaly_file_1: `there's a file on my desktop I didn't put there. it wasn't there when I started this session. the modification date is listed as "—". not a date. just a dash.`,
      anomaly_file_2: `another one. the filename is longer than it should be — it wraps around the icon. I don't think that's supposed to be possible in this OS. I'm going to open it.`,
      anomaly_file_3: `the third file. its icon is wrong. the thumbnail is a very small image of a city. I can't zoom in enough to tell if it's a real city.`
    };

    if (anomalyNotes[id]) {
      this.time.delayedCall(1200, () => {
        StateManager.addMarenNote(anomalyNotes[id]);
      });
    }
  }

  _fadeIn() {
    const W = this.scale.width;
    const H = this.scale.height;
    const overlay = this.add.graphics().setDepth(500);
    overlay.fillStyle(0xf5f0e8, 1);
    overlay.fillRect(0, 0, W, H);

    this.tweens.addCounter({
      from: 1, to: 0, duration: 800, ease: 'Sine.easeOut',
      onUpdate: (tween) => {
        overlay.clear();
        overlay.fillStyle(0xf5f0e8, tween.getValue());
        overlay.fillRect(0, 0, W, H);
      },
      onComplete: () => overlay.clear()
    });
  }

  update(time, delta) {
    if (this._os) this._os.update(time, delta);
    if (this._hud) this._hud.update(time, delta);
    StateManager.tickPlayTime(delta);
  }

  shutdown() {
    EventBus.off('desktop:anomaly', this._handleAnomaly);
    EventBus.off('layer:request', this._handleLayerRequest);
    StateManager.save();
  }
}
