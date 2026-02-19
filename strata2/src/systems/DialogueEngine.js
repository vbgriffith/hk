/**
 * DialogueEngine — manages conversation trees, typewriter display,
 * choice prompts, and dialogue state tracking.
 *
 * Dialogue nodes: { id, speaker, text, choices: [{label, next, action}], onComplete }
 */
const DialogueEngine = (function () {

  let activeScene = null;
  let container = null;
  let boxGraphics = null;
  let nameText = null;
  let bodyText = null;
  let continueIndicator = null;
  let choiceTexts = [];
  let typewriteTimer = null;
  let currentNode = null;
  let currentTree = null;
  let isTyping = false;
  let fullText = '';
  let selectedChoice = 0;
  let onDismiss = null;

  const PADDING = 20;
  const BOX_H = 130;
  const NAME_H = 22;

  // Speaker name colors
  const SPEAKER_COLORS = {
    'OSWIN':        Palette.toCSS(Palette.L1.accentAlt),
    'MAREN':        Palette.toCSS(Palette.L0.accent),
    'IDA':          Palette.toCSS(Palette.L2.string),
    'CARTOGRAPHER': Palette.toCSS(Palette.L3.accent),
    'SYSTEM':       Palette.toCSS(Palette.L3.textDim),
    'UNKNOWN':      Palette.toCSS(Palette.L4.pulse),
  };

  function getWidth(scene) {
    return scene.scale.width - PADDING * 4;
  }

  function getBoxY(scene) {
    return scene.scale.height - BOX_H - PADDING * 2;
  }

  function buildUI(scene) {
    activeScene = scene;
    const { width } = scene.scale;
    const bw = getWidth(scene);
    const bx = PADDING * 2;
    const by = getBoxY(scene);
    const layer = StateManager.get('currentLayer');
    const P = Palette.layer(layer);

    // Box background
    boxGraphics = scene.add.graphics().setDepth(500);
    boxGraphics.fillStyle(layer <= 1 ? P.ui || Palette.L0.surface : Palette.L0.surface, 0.97);
    boxGraphics.fillRoundedRect(bx, by, bw, BOX_H, 6);
    boxGraphics.lineStyle(1, P.border || Palette.L0.border, 0.8);
    boxGraphics.strokeRoundedRect(bx, by, bw, BOX_H, 6);

    // Name tag
    nameText = scene.add.text(bx + 14, by + 10, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setDepth(501);

    // Body text
    bodyText = scene.add.text(bx + 14, by + NAME_H + 14, '', {
      fontFamily: '"Courier New", monospace',
      fontSize: '13px',
      color: Palette.toCSS(Palette.L0.text),
      lineSpacing: 5,
      wordWrap: { width: bw - 28 }
    }).setDepth(501);

    // Continue indicator (blinking ▶)
    continueIndicator = scene.add.text(
      bx + bw - 20,
      by + BOX_H - 20,
      '▶', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: Palette.toCSS(Palette.L0.accent)
      }
    ).setDepth(501).setAlpha(0);

    scene.tweens.add({
      targets: continueIndicator,
      alpha: { from: 0, to: 1 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    container = { boxGraphics, nameText, bodyText, continueIndicator };
  }

  function destroyUI() {
    if (boxGraphics)         { boxGraphics.destroy(); boxGraphics = null; }
    if (nameText)            { nameText.destroy(); nameText = null; }
    if (bodyText)            { bodyText.destroy(); bodyText = null; }
    if (continueIndicator)   { continueIndicator.destroy(); continueIndicator = null; }
    choiceTexts.forEach(t => t.destroy());
    choiceTexts = [];
    container = null;
    isTyping = false;
    currentNode = null;
    if (typewriteTimer) { typewriteTimer.remove(); typewriteTimer = null; }
  }

  function showNode(node) {
    currentNode = node;
    if (!nameText) return;

    const speaker = node.speaker || 'SYSTEM';
    nameText.setText(speaker);
    nameText.setColor(SPEAKER_COLORS[speaker] || '#ffffff');

    fullText = node.text || '';
    isTyping = true;
    continueIndicator.setAlpha(0);
    choiceTexts.forEach(t => t.destroy());
    choiceTexts = [];

    typewriteTimer = Typography.typewrite(
      activeScene,
      bodyText,
      fullText,
      node.speed || 30,
      () => {
        isTyping = false;
        // Show choices or continue prompt
        if (node.choices && node.choices.length) {
          showChoices(node.choices);
        } else {
          continueIndicator.setAlpha(1);
        }
      }
    );
  }

  function showChoices(choices) {
    const bx = PADDING * 2 + 14;
    const by = getBoxY(activeScene);
    continueIndicator.setAlpha(0);
    selectedChoice = 0;

    choices.forEach((choice, i) => {
      const cy = by + BOX_H - (choices.length - i) * 22;
      const t = activeScene.add.text(bx, cy, `${i === 0 ? '▶' : ' '} ${choice.label}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '12px',
        color: i === 0
          ? Palette.toCSS(Palette.L0.accent)
          : Palette.toCSS(Palette.L0.textDim),
      }).setDepth(502).setInteractive();

      t.on('pointerover', () => {
        selectedChoice = i;
        refreshChoices(choices);
      });

      t.on('pointerdown', () => {
        selectChoice(choices[i]);
      });

      choiceTexts.push(t);
    });
  }

  function refreshChoices(choices) {
    choiceTexts.forEach((t, i) => {
      t.setText(`${i === selectedChoice ? '▶' : ' '} ${choices[i].label}`);
      t.setColor(i === selectedChoice
        ? Palette.toCSS(Palette.L0.accent)
        : Palette.toCSS(Palette.L0.textDim));
    });
  }

  function selectChoice(choice) {
    if (choice.action) choice.action();
    if (choice.next) {
      const next = currentTree[choice.next];
      if (next) {
        showNode(next);
        return;
      }
    }
    // End of dialogue
    dismiss();
  }

  function dismiss() {
    if (currentNode && currentNode.onComplete) currentNode.onComplete();
    if (onDismiss) { onDismiss(); onDismiss = null; }
    destroyUI();
    EventBus.emit('dialogue:ended');
  }

  return {
    /**
     * Start a dialogue tree.
     * @param {Phaser.Scene} scene
     * @param {Object} tree  — { startNode: 'id', nodes: { id: { speaker, text, choices } } }
     * @param {Function} callback — called when dialogue ends
     */
    start(scene, tree, callback) {
      destroyUI();
      currentTree = tree.nodes;
      onDismiss = callback || null;
      buildUI(scene);
      showNode(currentTree[tree.startNode]);
      EventBus.emit('dialogue:started');
    },

    // Advance dialogue (call on click / space)
    advance() {
      if (!currentNode) return;
      if (isTyping) {
        // Skip typewriter
        Typography.skipTypewrite(typewriteTimer, bodyText, fullText);
        isTyping = false;
        if (currentNode.choices && currentNode.choices.length) {
          showChoices(currentNode.choices);
        } else {
          continueIndicator.setAlpha(1);
        }
        return;
      }
      if (currentNode.choices && currentNode.choices.length) {
        // Select currently highlighted choice
        selectChoice(currentNode.choices[selectedChoice]);
        return;
      }
      // No choices — advance to next node or dismiss
      if (currentNode.next) {
        const next = currentTree[currentNode.next];
        if (next) { showNode(next); return; }
      }
      dismiss();
    },

    navigateChoice(dir) {
      if (!currentNode || !currentNode.choices) return;
      selectedChoice = (selectedChoice + dir + currentNode.choices.length) % currentNode.choices.length;
      refreshChoices(currentNode.choices);
    },

    isActive() { return !!container; },

    destroy: destroyUI,
  };
})();
