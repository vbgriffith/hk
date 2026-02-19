/**
 * CorruptionTracker — monitors corruption value and triggers visual/narrative
 * bleed effects on higher layers as Layer 4 exposure accumulates.
 *
 * Corruption thresholds:
 * 0.0–0.15: Clean
 * 0.15–0.3: Subtle flicker on Layer 0 desktop, occasional wrong character in terminal
 * 0.3–0.5: Anomaly file 1 appears on desktop. Browser history entries shift timestamps.
 * 0.5–0.7: Anomaly file 2. Maren's notes start appearing in Workshop. Oswin's dialogue glitches.
 * 0.7–0.9: Anomaly file 3. The Lumen email timestamps become impossible.
 * 0.9–1.0: All layers feel wrong simultaneously. The game is being filed.
 */
const CorruptionTracker = (function () {

  let lastCorruption = 0;
  let glitchTimer = null;

  // Anomaly file definitions — files that appear on Maren's desktop
  const ANOMALY_FILES = {
    'anomaly_file_1': {
      name: 'untitled.txt',
      content: `[file created: unknown]\n[modified: unknown]\n\n.\n\nI don't know how this got here.\n— M`,
      note: 'A file appeared on my desktop. I didn\'t make it. It has no creation date.'
    },
    'anomaly_file_2': {
      name: '847.txt',
      content: `847\n\n(that is the number of streets)\n(I counted)\n(you should count too)`,
      note: 'Another file. The number 847 means something. I looked it up. Halverstrom has 847 streets in the simulation. The Halverstrom.org Wikipedia article lists 847 streets. Pieter Holm entered 847 named streets before he died. Something is counting along with me.'
    },
    'anomaly_file_3': {
      name: 'callum.txt',
      content: `His dog's name is Halverstrom.\n\nHe named his dog after a city that doesn't exist.\nA city he dreamed about for four years after a research project.\nA research project that he was told ended.\n\nCall him.\nThe number is in the substrate archive.\nHe would want to know.`,
      note: 'I don\'t know if I put this here. I don\'t know if that distinction matters anymore.'
    }
  };

  // Glitch effects that fire at various corruption levels
  const GLITCH_EFFECTS = [
    { threshold: 0.2, id: 'flicker_01', fired: false },
    { threshold: 0.35, id: 'wrong_char_01', fired: false },
    { threshold: 0.5, id: 'email_timestamp', fired: false },
    { threshold: 0.65, id: 'oswin_stutter', fired: false },
    { threshold: 0.8, id: 'terminal_echo', fired: false },
    { threshold: 0.92, id: 'full_bleed', fired: false },
  ];

  EventBus.on('corruption:changed', ({ value }) => {
    CorruptionTracker.check(value);
  });

  return {
    init() {
      lastCorruption = StateManager.get('corruption') || 0;
      // Restore fired states
      GLITCH_EFFECTS.forEach(e => {
        e.fired = StateManager.hasFlag('glitch_' + e.id);
      });
      return this;
    },

    check(value) {
      // Check threshold-based effects
      GLITCH_EFFECTS.forEach(effect => {
        if (!effect.fired && value >= effect.threshold) {
          effect.fired = true;
          StateManager.flag('glitch_' + effect.id);
          this.triggerGlitch(effect.id, value);
        }
      });
      lastCorruption = value;
    },

    triggerGlitch(id, corruption) {
      switch (id) {
        case 'flicker_01':
          EventBus.emit('os:flicker', { duration: 200, intensity: 0.3 });
          break;

        case 'wrong_char_01':
          // Next terminal character types itself wrong then corrects
          EventBus.emit('terminal:glitch_char');
          break;

        case 'email_timestamp':
          // A Lumen email's timestamp shifts to an impossible date
          EventBus.emit('email:timestamp_shift', {
            emailId: 'ros_initial',
            newTimestamp: Date.now() + 86400000 * 3, // 3 days in the future
          });
          StateManager.set('rosEmailsAutomated', true);
          break;

        case 'oswin_stutter':
          // Oswin repeats a word in his next dialogue
          StateManager.flag('oswin_stutter_pending');
          break;

        case 'terminal_echo':
          // Terminal echoes Maren's last note back to her, slightly wrong
          EventBus.emit('terminal:echo_note');
          break;

        case 'full_bleed':
          // Everything flickers simultaneously
          EventBus.emit('os:flicker', { duration: 800, intensity: 0.8 });
          EventBus.emit('corruption:full_bleed');
          StateManager.addMarenNote('Something just happened to everything at once. All my windows flickered. The clock showed the wrong year for half a second. 1991.\n\nThe array was installed in 1991.\n\nI need to stop going to the bottom.');
          break;
      }
    },

    getAnomalyFile(id) {
      return ANOMALY_FILES[id] || null;
    },

    // Visual corruption amount for rendering (0..1)
    getRenderAmount() {
      return StateManager.get('corruption') || 0;
    },

    // Per-frame subtle effect: random pixel drift, scanline brightening
    // Call from scene update, returns true if an effect should fire this frame
    shouldGlitchFrame() {
      const c = StateManager.get('corruption') || 0;
      if (c < 0.3) return false;
      return Math.random() < (c - 0.3) * 0.015;
    },
  };
})();
