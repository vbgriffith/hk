/**
 * StateManager — single source of truth for all game state.
 *
 * Layer depth:  0 = CadenceOS  1 = PILGRIM  2 = Workshop  3 = Meridian  4 = Substrate
 * Corruption:   0.0 – 1.0  (increases with Layer 4 exposure, bleeds upward)
 * Cartographer patience: 0–40 days tracked
 */
const StateManager = (function () {
  const defaults = {
    // Progress
    currentLayer: 0,
    deepestLayer: 0,
    layerVisits: { 0: 1, 1: 0, 2: 0, 3: 0, 4: 0 },

    // Maren
    marenNotes: [],           // terminal entries Maren has written
    marenFilesOnDesktop: [],  // anomalous files that appeared without her

    // Corruption — Layer 4 bleed
    corruption: 0.0,
    substrateExposureTime: 0, // seconds spent in Layer 4 total
    desktopAnomalies: [],     // list of anomaly ids that have triggered

    // Cartographer patience system
    cartographerDays: 0,
    cartographerInterrupted: false,
    cartographerRevealTriggered: false,

    // Browser history (in-game browser)
    browserHistory: [],
    browserCurrentUrl: null,
    discoveredSites: [],      // which sites the player has found

    // Puzzle & canary state
    canarySolved: false,
    canaryTriggeredBy: null,  // 'player' | 'system' | null
    puzzleStates: {},

    // Forum
    veldenmoorForeverLastPost: null,
    forumPostsSeen: [],

    // Lumen emails
    emailsReceived: [],
    emailsRead: [],
    fennPersonPronounDropped: false,
    rosEmailsAutomated: false, // revealed late-game

    // Callum
    callumCoordinatesFound: false,
    callumDogNameNoticed: false,

    // Ida
    idaShutdownFound: false,
    idaBlogPostSevenFound: false,

    // Endings
    endingUnlocked: null,     // 'archivist' | 'exit' | 'opendoor' | 'cartographer'
    gameComplete: false,

    // Flags for subtle world changes
    flags: {},

    // Meta
    playTime: 0,              // total seconds
    sessionStart: null,
  };

  let state = {};

  return {
    init() {
      const saved = SaveSystem.load();
      state = saved ? Object.assign({}, defaults, saved) : Object.assign({}, defaults);
      state.sessionStart = Date.now();
      return this;
    },

    get(key) {
      return state[key];
    },

    set(key, value) {
      const old = state[key];
      state[key] = value;
      EventBus.emit('state:changed', { key, value, old });
      return this;
    },

    // Increment a numeric value
    increment(key, amount = 1) {
      state[key] = (state[key] || 0) + amount;
      EventBus.emit('state:changed', { key, value: state[key] });
      return this;
    },

    // Set a named flag
    flag(name, value = true) {
      state.flags[name] = value;
      EventBus.emit('state:flag', { name, value });
      return this;
    },

    hasFlag(name) {
      return !!state.flags[name];
    },

    // Layer transitions
    enterLayer(depth) {
      const prev = state.currentLayer;
      state.currentLayer = depth;
      state.deepestLayer = Math.max(state.deepestLayer, depth);
      state.layerVisits[depth] = (state.layerVisits[depth] || 0) + 1;
      EventBus.emit('layer:enter', { depth, from: prev });

      // corruption bleeds: each Layer 4 visit adds 0.08 base
      if (depth === 4) {
        this.addCorruption(0.08);
      }
      return this;
    },

    exitLayer(depth) {
      EventBus.emit('layer:exit', { depth });
      return this;
    },

    addCorruption(amount) {
      state.corruption = Math.min(1.0, state.corruption + amount);
      EventBus.emit('corruption:changed', { value: state.corruption });

      // Anomaly thresholds
      if (state.corruption > 0.2 && !state.flags['anomaly_file_1']) {
        this.triggerDesktopAnomaly('anomaly_file_1');
      }
      if (state.corruption > 0.45 && !state.flags['anomaly_file_2']) {
        this.triggerDesktopAnomaly('anomaly_file_2');
      }
      if (state.corruption > 0.7 && !state.flags['anomaly_file_3']) {
        this.triggerDesktopAnomaly('anomaly_file_3');
      }
      return this;
    },

    triggerDesktopAnomaly(id) {
      this.flag(id);
      state.desktopAnomalies.push(id);
      state.marenFilesOnDesktop.push(id);
      EventBus.emit('desktop:anomaly', { id });
    },

    addEmail(email) {
      state.emailsReceived.push(email);
      EventBus.emit('email:received', email);
    },

    markEmailRead(id) {
      if (!state.emailsRead.includes(id)) {
        state.emailsRead.push(id);
      }
    },

    addBrowserHistory(url) {
      state.browserHistory.push({ url, timestamp: Date.now() });
      if (!state.discoveredSites.includes(url)) {
        state.discoveredSites.push(url);
        EventBus.emit('site:discovered', { url });
      }
    },

    addMarenNote(note) {
      state.marenNotes.push({ text: note, timestamp: Date.now() });
      EventBus.emit('terminal:note', { note });

      // Maren's notes begin appearing in Layer 2 after deepestLayer >= 2
      if (state.deepestLayer >= 2) {
        EventBus.emit('workshop:note_leaked', { note });
      }
    },

    tickPlayTime(delta) {
      state.playTime += delta / 1000;
      if (state.currentLayer === 4) {
        state.substrateExposureTime += delta / 1000;
        // slow corruption drain from time in Layer 4
        if (state.substrateExposureTime % 30 < 0.1) {
          this.addCorruption(0.03);
        }
      }
    },

    save() {
      SaveSystem.save(state);
    },

    getSnapshot() {
      return Object.assign({}, state);
    }
  };
})();
