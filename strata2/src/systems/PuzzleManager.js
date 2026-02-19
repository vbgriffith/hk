/**
 * PuzzleManager — tracks puzzle state, canary triggers, and solution logic.
 *
 * The canary: Ida's hidden puzzle in Layer 2.
 * If solved, it posts to the Veldenmoor forum: "the drafts are not a bonus. be careful in there."
 * It was solved once in 2019 (by veldenmoor_forever's extension) and once 3 days before Maren arrived.
 */
const PuzzleManager = (function () {

  // Puzzle definitions
  const PUZZLES = {

    // Layer 0: figure out the zip file password
    'zip_password': {
      layer: 0,
      hint: 'The password is the name of the street Callum\'s dog was named after.',
      solution: 'HALVERSTROM',
      solved: false,
      attempts: 0,
    },

    // Layer 0: find the hidden privacy policy line
    'privacy_policy_line': {
      layer: 0,
      hint: null, // No hint — discovery only
      autoSolves: true, // Solved by reading the page
      solved: false,
    },

    // Layer 0: unlock the _deep/ folder inside the archive
    // Password: PILGRIM1887 — year from Halverstrom Wikipedia article
    'deep_folder': {
      layer: 0,
      hint: null, // no hint — must be discovered via halverstrom.org
      solution: 'PILGRIM1887',
      solved: false,
      attempts: 0,
    },

    // Layer 1: Oswin's first puzzle — the coin riddle
    'oswin_coin_riddle': {
      layer: 1,
      hint: 'I have a face but cannot smile. I pass through hands but have no arms. What am I?',
      solution: 'COIN',
      solved: false,
      attempts: 0,
    },

    // Layer 1: The sequence puzzle (unlock Layer 2 door)
    'veldenmoor_sequence': {
      layer: 1,
      hint: 'The ravens know the order. Watch where they land.',
      solution: [3, 1, 4, 1, 5], // Pi digits — Ida's quiet joke
      inputBuffer: [],
      solved: false,
    },

    // Layer 2: Ida's canary puzzle — THE central mystery puzzle
    'ida_canary': {
      layer: 2,
      hint: null,
      // Solution: navigate to three specific files in order, read comments in order
      // The files are: sound_loop_03.js, entities/oswin.js, README_INTERNAL.md
      steps: ['opened_sound_loop_03', 'opened_oswin_entity', 'opened_readme_internal'],
      completedSteps: [],
      solved: false,
      isCanaray: true,
    },

    // Layer 2: find Ida's shutdown sequence
    'ida_shutdown': {
      layer: 2,
      hint: null,
      autoSolves: true, // Solved by reading the shutdown file
      solved: false,
    },

    // Layer 3: Cartographer patience puzzle
    // Don't interfere with his route for 40 in-game days
    'cartographer_patience': {
      layer: 3,
      hint: null,
      solved: false,
      dayTarget: 40,
    },

    // Layer 3: Find the Halverstrom coordinates
    'halverstrom_coordinates': {
      layer: 3,
      hint: null,
      autoSolves: true,
      solved: false,
    },
  };

  return {
    init() {
      // Restore solved states from save
      const saved = StateManager.get('puzzleStates') || {};
      Object.keys(saved).forEach(id => {
        if (PUZZLES[id]) {
          PUZZLES[id].solved = saved[id].solved;
          if (saved[id].completedSteps) PUZZLES[id].completedSteps = saved[id].completedSteps;
        }
      });
      return this;
    },

    // Attempt a text solution
    attempt(id, input) {
      const p = PUZZLES[id];
      if (!p || p.solved) return { success: false, reason: 'already_solved' };

      p.attempts = (p.attempts || 0) + 1;

      const normalized = (typeof input === 'string')
        ? input.trim().toUpperCase()
        : input;
      const solution = (typeof p.solution === 'string')
        ? p.solution.toUpperCase()
        : p.solution;

      if (JSON.stringify(normalized) === JSON.stringify(solution)) {
        return this.solve(id);
      }

      EventBus.emit('puzzle:failed', { id, attempts: p.attempts });
      return { success: false, reason: 'wrong_answer', attempts: p.attempts };
    },

    // Push a sequence entry
    pushSequence(id, value) {
      const p = PUZZLES[id];
      if (!p || p.solved) return false;
      p.inputBuffer.push(value);
      // Check partial match
      const partial = p.inputBuffer;
      const solution = p.solution;
      for (let i = 0; i < partial.length; i++) {
        if (partial[i] !== solution[i]) {
          p.inputBuffer = [];
          EventBus.emit('puzzle:sequence_broken', { id });
          return false;
        }
      }
      if (partial.length === solution.length) {
        this.solve(id);
        return true;
      }
      EventBus.emit('puzzle:sequence_progress', { id, step: partial.length });
      return false;
    },

    // Complete a canary step
    completeCanarayStep(stepName) {
      const p = PUZZLES['ida_canary'];
      if (p.solved) return;
      if (!p.completedSteps.includes(stepName)) {
        p.completedSteps.push(stepName);
        EventBus.emit('puzzle:canary_step', { step: stepName, total: p.completedSteps.length });
      }
      // Check if all steps done
      const allDone = p.steps.every(s => p.completedSteps.includes(s));
      if (allDone) this.solve('ida_canary');
    },

    // Auto-solve (for discovery puzzles)
    autoSolve(id) {
      return this.solve(id);
    },

    solve(id) {
      const p = PUZZLES[id];
      if (!p || p.solved) return { success: true, reason: 'already' };
      p.solved = true;

      // Persist
      const states = StateManager.get('puzzleStates') || {};
      states[id] = { solved: true, completedSteps: p.completedSteps };
      StateManager.set('puzzleStates', states);

      EventBus.emit('puzzle:solved', { id });

      // Special consequence logic
      this._onSolve(id);

      return { success: true, id };
    },

    _onSolve(id) {
      switch (id) {
        case 'zip_password':
          StateManager.flag('zip_opened');
          EventBus.emit('os:file_unlocked', { file: 'PILGRIM_backup.zip' });
          break;

        case 'privacy_policy_line':
          StateManager.flag('callum_participant_found');
          Maren_addNote('Found something in the Lumen privacy policy. "Data subjects who predate the 2009 restructuring." That\'s not legal boilerplate. That\'s a person.');
          break;

        case 'ida_canary':
          StateManager.set('canarySolved', true);
          StateManager.set('canaryTriggeredBy', 'player');
          // Forum post appears
          EventBus.emit('forum:new_post', {
            user: 'veldenmoor_forever',
            subject: '',
            body: 'the drafts are not a bonus. be careful in there.',
            timestamp: Date.now(),
          });
          Maren_addNote('The forum post. It\'s automated. Ida wired this. Someone else triggered it before me — three days before I started this job.');
          break;

        case 'ida_shutdown':
          StateManager.set('idaShutdownFound', true);
          EventBus.emit('os:file_unlocked', { file: 'shutdown_sequence.js' });
          Maren_addNote('There\'s a shutdown sequence buried in the Workshop. Ida built a fire alarm. I don\'t think she knew exactly what she was pulling the alarm on.');
          break;

        case 'cartographer_patience':
          StateManager.set('cartographerRevealTriggered', true);
          EventBus.emit('cartographer:reveal');
          break;

        case 'halverstrom_coordinates':
          StateManager.set('callumCoordinatesFound', true);
          Maren_addNote('The coordinates at the bottom of callumwrest.com. They\'re exact. I pulled them up against the Halverstrom city center. Perfect match. He knows. He just doesn\'t know that he knows.');
          break;
      }
    },

    isSolved(id) {
      return PUZZLES[id] ? PUZZLES[id].solved : false;
    },

    get(id) {
      return PUZZLES[id] || null;
    },

    onSceneReady(sceneName) {
      // Hook for scenes to notify PuzzleManager they're loaded
      // Used to trigger time-sensitive puzzle state checks
      if (sceneName === 'Layer0Scene') {
        // Check if zip already solved from a previous session
        if (this.isSolved('zip_password')) {
          StateManager.flag('zip_opened');
        }
      }
    },
  };

  // Helper — avoids circular ref, just emits
  function Maren_addNote(text) {
    StateManager.addMarenNote(text);
  }

})();
