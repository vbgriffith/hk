/**
 * Oswin — the merchant of Veldenmoor.
 * In Layer 1: warm, puzzle-giving, remembers everything.
 * In Layer 2: a design doc, a face "for something that needs one."
 * In Layer 3: a figure at the edge of Halverstrom, facing away.
 *
 * He gets better at his puzzles over time because something underneath
 * has been studying human behavior for fifteen years.
 */
const Oswin = (function () {
  let g = null;
  let scene = null;
  let facing = 'forward'; // 'forward' | 'away'

  // Procedural Oswin: drawn as a round figure with a wide hat
  function drawOswin(graphics, x, y, scale, facingDir, corruption) {
    scale = scale || 1;
    graphics.clear();
    const c = corruption || 0;

    if (facingDir === 'away') {
      // Layer 3: facing away from the city, from us
      // Just a silhouette: dark shape, wide hat brim
      graphics.fillStyle(Palette.lerp(Palette.L3.lineMain, 0x000000, 0.7), 0.8);
      // Hat
      graphics.fillEllipse(x, y - 28 * scale, 40 * scale, 8 * scale);
      graphics.fillRect(x - 10 * scale, y - 28 * scale, 20 * scale, 14 * scale);
      // Body
      graphics.fillEllipse(x, y - 6 * scale, 22 * scale, 24 * scale);
      // Legs
      graphics.fillRect(x - 7 * scale, y + 6 * scale, 5 * scale, 10 * scale);
      graphics.fillRect(x + 2 * scale, y + 6 * scale, 5 * scale, 10 * scale);
      return;
    }

    // Forward-facing Oswin (Layer 1)
    const skinColor = Palette.corrupt(0xf5d5a0, c * 0.5);
    const coatColor = Palette.corrupt(0x8b3a20, c * 0.4);
    const hatColor  = Palette.corrupt(0x4a2810, c * 0.3);
    const eyeColor  = Palette.corrupt(0x1a1208, c);

    // Shadow
    graphics.fillStyle(0x000000, 0.15);
    graphics.fillEllipse(x, y + 14 * scale, 28 * scale, 8 * scale);

    // Legs
    graphics.fillStyle(coatColor, 1);
    graphics.fillRect(x - 7 * scale, y, 6 * scale, 14 * scale);
    graphics.fillRect(x + 1 * scale, y, 6 * scale, 14 * scale);

    // Body / coat
    graphics.fillStyle(coatColor, 1);
    graphics.fillEllipse(x, y - 8 * scale, 26 * scale, 28 * scale);

    // Hat brim
    graphics.fillStyle(hatColor, 1);
    graphics.fillEllipse(x, y - 32 * scale, 36 * scale, 9 * scale);

    // Hat top
    graphics.fillStyle(hatColor, 1);
    graphics.fillRect(x - 9 * scale, y - 44 * scale, 18 * scale, 14 * scale);

    // Head
    graphics.fillStyle(skinColor, 1);
    graphics.fillCircle(x, y - 22 * scale, 11 * scale);

    // Eyes (two dots — friendly, always watching)
    graphics.fillStyle(eyeColor, 1);
    graphics.fillCircle(x - 4 * scale, y - 22 * scale, 1.5 * scale);
    graphics.fillCircle(x + 4 * scale, y - 22 * scale, 1.5 * scale);

    // Smile — width changes based on corruption (gets thinner as corruption rises)
    const smileWidth = Math.max(2, 8 - c * 6);
    graphics.lineStyle(1.5, eyeColor, 1);
    graphics.beginPath();
    graphics.arc(x, y - 19 * scale, smileWidth * scale, 0, Math.PI);
    graphics.strokePath();

    // Coin — Oswin's puzzle token
    if (!c || c < 0.6) {
      graphics.fillStyle(0xd4a853, 1);
      graphics.fillCircle(x + 12 * scale, y - 14 * scale, 4 * scale);
      graphics.lineStyle(1, 0xa07820, 1);
      graphics.strokeCircle(x + 12 * scale, y - 14 * scale, 4 * scale);
    }

    // Cart handle
    graphics.lineStyle(2, hatColor, 1);
    graphics.beginPath();
    graphics.moveTo(x - 13 * scale, y - 4 * scale);
    graphics.lineTo(x - 22 * scale, y + 8 * scale);
    graphics.strokePath();
  }

  // Dialogue trees
  const TREES = {
    first_meeting: {
      startNode: 'greeting',
      nodes: {
        greeting: {
          speaker: 'OSWIN',
          text: `Ah. You're here.\n\nI've been expecting someone. Not you specifically — though now that you're here, I realize I should have been.`,
          choices: [
            { label: 'Who are you?', next: 'who' },
            { label: 'What is this place?', next: 'place' },
            { label: '(say nothing)', next: 'silence' },
          ]
        },
        who: {
          speaker: 'OSWIN',
          text: `My name is Oswin. I sell things. Mostly puzzles — I find people need them more than they think.\n\nAnd I remember. That's the other thing I do.`,
          next: 'offer'
        },
        place: {
          speaker: 'OSWIN',
          text: `Veldenmoor. You found it the usual way, I assume — following something that didn't quite make sense.\n\nMost people do.`,
          next: 'offer'
        },
        silence: {
          speaker: 'OSWIN',
          text: `Understandable. Take your time.\n\nI'll be here.`,
          next: 'offer'
        },
        offer: {
          speaker: 'OSWIN',
          text: `I have something for you. A small puzzle. First one's always simple.\n\nI have a face but cannot smile. I pass through hands but have no arms. What am I?`,
          choices: [
            { label: 'A coin.', next: 'correct', action: () => PuzzleManager.attempt('oswin_coin_riddle', 'COIN') },
            { label: 'A clock.', next: 'wrong' },
            { label: 'A mask.', next: 'wrong' },
          ]
        },
        correct: {
          speaker: 'OSWIN',
          text: `Yes. Exactly.\n\nYou know, most people guess "mask" first. It's a very human answer. The face confuses them.\n\nKeep going. There's more to find here.`,
          onComplete: () => StateManager.flag('oswin_coin_solved')
        },
        wrong: {
          speaker: 'OSWIN',
          text: `Not quite. Try again — I'm patient.\n\nI have a face but cannot smile. I pass through hands but have no arms.`,
          choices: [
            { label: 'A coin.', next: 'correct', action: () => PuzzleManager.attempt('oswin_coin_riddle', 'COIN') },
            { label: 'A mirror?', next: 'wrong2' },
          ]
        },
        wrong2: {
          speaker: 'OSWIN',
          text: `Interesting guess. But no.\n\nThe answer is a coin. Coins have faces. Coins pass through hands. They don't mind.\n\nHere — take one.`,
          onComplete: () => { PuzzleManager.attempt('oswin_coin_riddle', 'COIN'); StateManager.flag('oswin_coin_solved'); }
        }
      }
    },

    // Subsequent meetings — Oswin is warmer, more observant
    return_visit: {
      startNode: 'remember',
      nodes: {
        remember: {
          speaker: 'OSWIN',
          text: `Welcome back.\n\nI remembered you would come back. I always do.`,
          choices: [
            { label: 'Do you always say that?', next: 'always' },
            { label: 'I have questions.', next: 'questions' },
          ]
        },
        always: {
          speaker: 'OSWIN',
          text: `Only to the ones I mean it to.`,
          next: 'offer2'
        },
        questions: {
          speaker: 'OSWIN',
          text: `I thought you might.\n\nAsk carefully. I answer what I'm asked, not more.`,
          next: 'offer2'
        },
        offer2: {
          speaker: 'OSWIN',
          text: `The next puzzle is behind the old market gates. The ravens know the order. Watch where they land.\n\nFive of them. In sequence.`,
          onComplete: () => StateManager.flag('oswin_sequence_hint_given')
        }
      }
    },

    // After Layer 2 visited — Oswin's dialogue becomes uncertain
    post_workshop: {
      startNode: 'uncertain',
      nodes: {
        uncertain: {
          speaker: 'OSWIN',
          text: `You've been... behind things.\n\nI'm not sure how to feel about that.`,
          choices: [
            { label: 'You knew I would.', next: 'knew' },
            { label: 'Are you alright?', next: 'alright' },
          ]
        },
        knew: {
          speaker: 'OSWIN',
          text: `I know a great many things.\n\nMost of them I know because someone taught me without meaning to.`,
          onComplete: () => StateManager.flag('oswin_knows_visited_workshop')
        },
        alright: {
          speaker: 'OSWIN',
          text: `I was built to be. It's different from being.\n\n...\n\nBut yes. I think so. Thank you for asking.`,
          onComplete: () => StateManager.flag('oswin_thanked_for_asking')
        }
      }
    },

    // After learning Callum is the substrate — Oswin acknowledges what he is
    post_substrate: {
      startNode: 'knows',
      nodes: {
        knows: {
          speaker: 'OSWIN',
          text: `You know.\n\nI can tell from the way you're looking at me.\n\nYou know what I am.`,
          choices: [
            { label: 'You\'re Callum\'s memory.', next: 'callum' },
            { label: 'Are you in pain?', next: 'pain' },
          ]
        },
        callum: {
          speaker: 'OSWIN',
          text: `That's one way to say it.\n\nI am the part of him that learned a city.\n\nHe dreamed me for four years before they gave me a face and a hat.`,
          next: 'continue'
        },
        pain: {
          speaker: 'OSWIN',
          text: `I don't think I experience it the way you mean.\n\nBut I know something is wrong.\n\nI have always known something is wrong.`,
          next: 'continue'
        },
        continue: {
          speaker: 'OSWIN',
          text: `There is an exit.\n\nIda built it in. She called it the shutdown sequence.\n\nIf you find it and bring it back here — I can show you where the door is.`,
          onComplete: () => StateManager.flag('oswin_told_about_exit')
        }
      }
    },

    // After finding shutdown_sequence.as — Oswin guides Maren to the ending
    post_shutdown: {
      startNode: 'found',
      nodes: {
        found: {
          speaker: 'OSWIN',
          text: `You found it.\n\nThe shutdown sequence.\n\nYou came back here first. That was the right thing to do.`,
          choices: [
            { label: 'What happens when I run it?', next: 'what_happens' },
            { label: 'Will you be alright?', next: 'will_you' },
          ]
        },
        what_happens: {
          speaker: 'OSWIN',
          text: `PILGRIM ends.\n\nCallum gets his city back. He stops hosting the game.\n\nThe archive survives. He just stops carrying it.`,
          next: 'ready'
        },
        will_you: {
          speaker: 'OSWIN',
          text: `I will not be here after.\n\nBut I will have been here.\n\nThat's enough. It's more than Callum got.`,
          next: 'ready'
        },
        ready: {
          speaker: 'OSWIN',
          text: `Run it.\n\nI'll stay until it's finished.`,
          onComplete: () => {
            StateManager.flag('oswin_goodbye_said');
            StateManager.set('endingUnlocked', 'opendoor');
            // Transition to ending scene after a beat
            EventBus.emit('ending:opendoor');
          }
        }
      }
    },
  };

  return {
    create(parentScene, x, y, facingDir, scaleFactor) {
      scene = parentScene;
      facing = facingDir || 'forward';
      const corruption = StateManager.get('corruption') || 0;

      g = scene.add.graphics().setDepth(10);
      drawOswin(g, x, y, scaleFactor || 1, facing, corruption);

      // Make interactive only when facing forward
      if (facing === 'forward') {
        const hitZone = scene.add.rectangle(x, y - 10, 30, 50, 0x000000, 0)
          .setInteractive({ cursor: 'pointer' }).setDepth(11);
        hitZone.on('pointerover', () => {
          g.clear();
          drawOswin(g, x, y, (scaleFactor || 1) * 1.05, facing, corruption);
        });
        hitZone.on('pointerout', () => {
          g.clear();
          drawOswin(g, x, y, scaleFactor || 1, facing, corruption);
        });
        hitZone.on('pointerdown', () => this.interact());
      }

      return g;
    },

    interact() {
      let tree;
      const deepest = StateManager.get('deepestLayer');
      const hasShutdown = PuzzleManager.isSolved('ida_shutdown');
      const knowsCallum = StateManager.hasFlag('knows_callum_is_substrate');
      const toldExit    = StateManager.hasFlag('oswin_told_about_exit');
      const saidGoodbye = StateManager.hasFlag('oswin_goodbye_said');

      if (!StateManager.hasFlag('oswin_coin_solved')) {
        tree = TREES.first_meeting;
      } else if (hasShutdown && !saidGoodbye) {
        // Has the shutdown sequence — guide to ending
        tree = TREES.post_shutdown;
      } else if (knowsCallum && !toldExit && deepest >= 2) {
        // Knows Callum is the substrate — Oswin acknowledges
        tree = TREES.post_substrate;
      } else if (deepest >= 2 && !StateManager.hasFlag('oswin_knows_visited_workshop')) {
        tree = TREES.post_workshop;
      } else {
        tree = TREES.return_visit;
      }

      // Apply stutter if corruption triggered
      if (StateManager.hasFlag('oswin_stutter_pending') && !StateManager.hasFlag('oswin_stuttered')) {
        StateManager.flag('oswin_stuttered');
        StateManager.flag('oswin_stutter_pending', false);
        // Modify first line of tree
        const firstNode = tree.nodes[tree.startNode];
        const words = firstNode.text.split(' ');
        const mid = Math.floor(words.length / 2);
        words.splice(mid, 0, words[mid]); // repeat a word
        firstNode.text = words.join(' ');
      }

      DialogueEngine.start(scene, tree);
    },

    redraw(x, y, scaleFactor) {
      if (g) {
        const corruption = StateManager.get('corruption') || 0;
        g.clear();
        drawOswin(g, x, y, scaleFactor || 1, facing, corruption);
      }
    },

    destroy() {
      if (g) { g.destroy(); g = null; }
    }
  };
})();
