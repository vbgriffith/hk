/**
 * Maren — player character. Mostly represented through terminal notes and behavior.
 * In Layer 1 she has a simple avatar; in Layer 3 she is a dot moving through the city.
 */
const Maren = (function () {
  let sprite = null; // Phaser Graphics object used as avatar

  return {
    create(scene, x, y, layer) {
      if (sprite) sprite.destroy();
      sprite = scene.add.graphics().setDepth(10);
      this.draw(x, y, layer);
      return sprite;
    },

    draw(x, y, layer) {
      if (!sprite) return;
      sprite.clear();
      switch (layer) {
        case 1:
          // Small warm-toned figure
          sprite.fillStyle(Palette.L1.ui, 1);
          sprite.fillCircle(x, y - 8, 5);    // head
          sprite.fillStyle(Palette.L1.accentAlt, 1);
          sprite.fillRect(x - 4, y - 3, 8, 10); // body
          break;
        case 3:
          // Single bright dot — Maren as observer
          sprite.fillStyle(Palette.L3.accent, 1);
          sprite.fillCircle(x, y, 3);
          sprite.lineStyle(1, Palette.L3.accent, 0.3);
          sprite.strokeCircle(x, y, 8);
          break;
      }
    },

    moveTo(x, y, scene, onComplete) {
      if (!sprite) return;
      scene.tweens.add({
        targets: sprite,
        x: x - (sprite.x || 0),
        y: y - (sprite.y || 0),
        duration: 300,
        ease: 'Sine.easeInOut',
        onComplete
      });
    },

    destroy() {
      if (sprite) { sprite.destroy(); sprite = null; }
    }
  };
})();
