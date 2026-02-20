/**
 * Typography — text style factories for each layer.
 * Returns Phaser text style objects.
 * All fonts: system monospace or Google Fonts via CDN (loaded in index.html if needed).
 * For zero-asset approach: we rely entirely on system monospace + CSS fallbacks.
 */
const Typography = (function () {
  // Base text configs per layer
  return {

    // Layer 0: CadenceOS — clean system monospace
    L0: {
      body(size, color) {
        return {
          fontFamily: '"Courier New", "Lucida Console", monospace',
          fontSize: `${size || 13}px`,
          color: color || Palette.toCSS(Palette.L0.text),
          lineSpacing: 4,
        };
      },
      ui(size) {
        return {
          fontFamily: '"Courier New", "Lucida Console", monospace',
          fontSize: `${size || 12}px`,
          color: Palette.toCSS(Palette.L0.textDim),
        };
      },
      title(size) {
        return {
          fontFamily: '"Courier New", "Lucida Console", monospace',
          fontSize: `${size || 14}px`,
          color: Palette.toCSS(Palette.L0.text),
          fontStyle: 'bold',
        };
      },
      accent(size) {
        return {
          fontFamily: '"Courier New", "Lucida Console", monospace',
          fontSize: `${size || 12}px`,
          color: Palette.toCSS(Palette.L0.accent),
        };
      },
      terminal(size) {
        return {
          fontFamily: '"Courier New", "Lucida Console", monospace',
          fontSize: `${size || 13}px`,
          color: Palette.toCSS(Palette.L0.accent),
          lineSpacing: 6,
          wordWrap: { width: 560 },
        };
      }
    },

    // Layer 1: PILGRIM — chunky, warm, slightly too cheerful
    L1: {
      body(size) {
        return {
          fontFamily: '"Courier New", monospace',
          fontSize: `${size || 14}px`,
          color: Palette.toCSS(Palette.L1.text),
          lineSpacing: 5,
          stroke: Palette.toCSS(Palette.L1.shadow),
          strokeThickness: 1,
        };
      },
      title(size) {
        return {
          fontFamily: '"Courier New", monospace',
          fontSize: `${size || 20}px`,
          color: Palette.toCSS(Palette.L1.accent),
          stroke: Palette.toCSS(Palette.L1.wood),
          strokeThickness: 3,
          fontStyle: 'bold',
        };
      },
      dialogue(size) {
        return {
          fontFamily: '"Courier New", monospace',
          fontSize: `${size || 13}px`,
          color: Palette.toCSS(Palette.L1.text),
          backgroundColor: Palette.toCSS(Palette.L1.ui),
          padding: { x: 8, y: 5 },
          lineSpacing: 5,
          wordWrap: { width: 360 },
        };
      }
    },

    // Layer 2: IDE — syntax-colored, slightly too comfortable
    L2: {
      code(size, color) {
        return {
          fontFamily: '"Courier New", "Lucida Console", monospace',
          fontSize: `${size || 12}px`,
          color: color || Palette.toCSS(Palette.L2.text),
          lineSpacing: 6,
        };
      },
      comment(size) {
        return {
          fontFamily: '"Courier New", "Lucida Console", monospace',
          fontSize: `${size || 12}px`,
          color: Palette.toCSS(Palette.L2.comment),
          lineSpacing: 6,
          fontStyle: 'italic',
        };
      },
      lineNum(size) {
        return {
          fontFamily: '"Courier New", "Lucida Console", monospace',
          fontSize: `${size || 11}px`,
          color: Palette.toCSS(Palette.L2.comment),
        };
      },
      filename(size) {
        return {
          fontFamily: '"Courier New", monospace',
          fontSize: `${size || 12}px`,
          color: Palette.toCSS(Palette.L2.function_),
        };
      }
    },

    // Layer 3: Meridian — sparse, architectural, cold
    L3: {
      body(size) {
        return {
          fontFamily: '"Courier New", monospace',
          fontSize: `${size || 11}px`,
          color: Palette.toCSS(Palette.L3.textDim),
          lineSpacing: 8,
          letterSpacing: 3,
        };
      },
      label(size) {
        return {
          fontFamily: '"Courier New", monospace',
          fontSize: `${size || 10}px`,
          color: Palette.toCSS(Palette.L3.text),
          letterSpacing: 4,
          alpha: 0.6,
        };
      },
      accent(size) {
        return {
          fontFamily: '"Courier New", monospace',
          fontSize: `${size || 12}px`,
          color: Palette.toCSS(Palette.L3.accent),
          letterSpacing: 2,
        };
      }
    },

    // Layer 4: Substrate — barely legible, degraded
    L4: {
      fragment(size) {
        return {
          fontFamily: '"Courier New", monospace',
          fontSize: `${size || 10}px`,
          color: Palette.toCSS(Palette.L4.text),
          lineSpacing: 10,
          alpha: 0.4,
        };
      },
      pulse(size) {
        return {
          fontFamily: '"Courier New", monospace',
          fontSize: `${size || 14}px`,
          color: Palette.toCSS(Palette.L4.pulse),
          letterSpacing: 6,
        };
      }
    },

    // Typewriter effect: reveals text character by character
    // Returns a Phaser TimerEvent handle
    typewrite(scene, textObj, fullText, speed, onComplete) {
      speed = speed || 35; // ms per character
      let i = 0;
      textObj.setText('');
      const timer = scene.time.addEvent({
        delay: speed,
        repeat: fullText.length - 1,
        callback: () => {
          i++;
          textObj.setText(fullText.substring(0, i));
          if (i >= fullText.length && onComplete) {
            onComplete();
          }
        }
      });
      return timer;
    },

    // Skip typewrite and show full text immediately
    skipTypewrite(timer, textObj, fullText) {
      if (timer) timer.remove();
      textObj.setText(fullText);
    }
  };
})();
