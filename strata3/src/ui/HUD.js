/**
 * HUD — minimal depth/layer indicator shown in non-Layer-0 scenes.
 * Very subtle. Just a small indicator in a corner.
 * In Layer 4 it shows the wrong depth. Then no depth at all.
 */
const HUD = (function () {
  let hudText = null;
  let hudGraphics = null;
  let scene = null;

  const LAYER_LABELS = ['LAYER 0', 'LAYER 1', 'LAYER 2', 'LAYER 3', 'LAYER 4'];

  return {
    show(parentScene, depth) {
      scene = parentScene;
      const { width } = scene.scale;

      if (hudGraphics) hudGraphics.destroy();
      if (hudText) hudText.destroy();

      // In Layer 4 at high corruption: show wrong depth
      let label = LAYER_LABELS[depth] || `LAYER ${depth}`;
      const corruption = StateManager.get('corruption') || 0;
      if (depth === 4 && corruption > 0.6) {
        label = 'LAYER ' + Phaser.Math.Between(0, 9);
      }
      if (depth === 4 && corruption > 0.85) {
        label = '——';
      }

      hudGraphics = scene.add.graphics().setDepth(998);
      hudGraphics.fillStyle(0x000000, 0.5);
      hudGraphics.fillRoundedRect(width - 90, 8, 82, 18, 3);

      hudText = scene.add.text(width - 49, 9, label, {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: depth < 3 ? Palette.toCSS(Palette.L0.textDim) : Palette.toCSS(Palette.L3.textDim),
        letterSpacing: 3,
        alpha: depth >= 3 ? 0.5 : 0.7,
      }).setOrigin(0.5, 0).setDepth(999);
    },

    hide() {
      if (hudText) { hudText.destroy(); hudText = null; }
      if (hudGraphics) { hudGraphics.destroy(); hudGraphics = null; }
    },

    update(depth) {
      if (hudText) {
        const corruption = StateManager.get('corruption') || 0;
        if (depth === 4 && corruption > 0.85 && Math.random() < 0.005) {
          hudText.setText('——');
          scene.time.delayedCall(400, () => {
            if (hudText) hudText.setText(LAYER_LABELS[depth] || '——');
          });
        }
      }
    }
  };
})();

/**
 * CodeViewer — Layer 2 IDE aesthetic file viewer (stub for Phase 2)
 */
const CodeViewer = (function () {
  return {
    open(scene, filePath, content) {
      // Phase 2 implementation
      EventBus.emit('codeviewer:open', { filePath, content });
    },
    close() {}
  };
})();
