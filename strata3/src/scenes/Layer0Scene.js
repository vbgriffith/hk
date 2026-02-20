/**
 * STRATA — Layer0Scene
 * CadenceOS — the player's desktop environment.
 * Phase 2: fully interactive email client, browser, file manager, terminal.
 */
class Layer0Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Layer0Scene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    StateManager.enterLayer(0);
    TransitionEngine.init(this);

    // CadenceOS singleton — pass scene reference
    CadenceOS.init(this);

    // HUD (singleton) — show for layer 0
    HUD.show(this, 0);

    // Register all websites into BrowserEngine
    BrowserEngine.registerSite('lumencollective.com', LumenCollective);
    BrowserEngine.registerSite('veldenmoor.net', VeldenmoorSite);
    BrowserEngine.registerSite('idacrane.net', IdaCraneWebsite);
    BrowserEngine.registerSite('halverstrom.org', HalverstromWebsite);
    BrowserEngine.registerSite('substrate-archive.net', SubstrateArchiveWebsite);
    BrowserEngine.registerSite('callumwrest.com', CallumWrestWebsite);

    // Init forum data
    ForumRenderer.getThreadList(); // seeds the recent post date

    // Wire up layer transition events
    EventBus.on('layer:transition_start', this._handleLayerRequest, this);
    EventBus.on('layer1:open', () => this._transitionToLayer(1), this);

    // Wire up anomaly events
    EventBus.on('desktop:anomaly', ({ id }) => {
      CadenceOS.spawnAnomalyFile(id);
      const notes = {
        anomaly_file_1: `there's a file on my desktop I didn't put there. modification date: "—". not a date. a dash.`,
        anomaly_file_2: `another one. the filename is "847.txt". I know what 847 means now. something is counting with me.`,
        anomaly_file_3: `the third file. it's about Callum. it has his dog's name in it. and it says to call him.`
      };
      if (notes[id]) {
        this.time.delayedCall(1400, () => StateManager.addMarenNote(notes[id]));
      }
    }, this);

    // Trigger initial email on first visit only
    if ((StateManager.get('layerVisits')[0] || 0) <= 1) {
      this.time.delayedCall(1600, () => this._sendWelcomeEmail());
    }

    // Notify PuzzleManager the OS is ready
    PuzzleManager.onSceneReady('Layer0Scene');

    // Fade in
    this._fadeIn(W, H);
    StateManager.save();
  }

  _sendWelcomeEmail() {
    // The first email is already in CadenceOS.EMAILS as ros_initial
    // Just ensure the badge refreshes and Maren writes her note
    this.time.delayedCall(2200, () => {
      StateManager.addMarenNote(
        `new client. data archaeology. "don't go below the Workshop" — ` +
        `that's the first thing Ros said after hello. ` +
        `the zip password is in the email in plaintext. ` +
        `847 MB is a lot for a Flash game from 2009.`
      );
    });
  }

  _handleLayerRequest({ to }) {
    if (to !== undefined) this._transitionToLayer(to);
  }

  _transitionToLayer(layer) {
    const keys = { 1: 'Layer1Scene', 2: 'Layer2Scene', 3: 'Layer3Scene', 4: 'Layer4Scene' };
    const key = keys[layer];
    if (!key) return;
    this.input.enabled = false;
    BrowserEngine.close();
    if (Terminal.isOpen()) Terminal.close();
    TransitionEngine.transition(this, 0, layer, () => this.scene.start(key), null);
  }

  _fadeIn(W, H) {
    const overlay = this.add.graphics().setDepth(500);
    overlay.fillStyle(0xf5f0e8, 1);
    overlay.fillRect(0, 0, W, H);
    this.tweens.addCounter({
      from: 1, to: 0, duration: 900, ease: 'Sine.easeOut',
      onUpdate: t => {
        overlay.clear();
        overlay.fillStyle(0xf5f0e8, t.getValue());
        overlay.fillRect(0, 0, W, H);
      },
      onComplete: () => overlay.clear()
    });
  }

  update(time, delta) {
    CadenceOS.update(time, delta);
    HUD.update(0);
    StateManager.tickPlayTime(delta);
  }

  shutdown() {
    EventBus.off('layer:transition_start', this._handleLayerRequest);
    EventBus.off('layer1:open');
    EventBus.off('desktop:anomaly');
    BrowserEngine.close();
    if (Terminal.isOpen()) Terminal.close();
    CadenceOS.destroy();
    HUD.hide();
    StateManager.save();
  }
}
