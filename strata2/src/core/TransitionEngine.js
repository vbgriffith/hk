/**
 * TransitionEngine — handles the visual transition between layers.
 *
 * Transitions degrade as you go deeper.
 * Returning transitions are always 3-5 frames slower than entry — something is being left behind.
 *
 * Layer 0→1: Clean white fade (like opening a file)
 * Layer 1→2: Geometric panel peel — world folds back revealing wireframe
 * Layer 2→3: Scanline dissolve — text reflows into architectural lines
 * Layer 3→4: No transition. Floor simply isn't there. Already somewhere else.
 * Layer N→0: Reverse of entry, but slower.
 */
const TransitionEngine = (function () {
  const TRANSITION_DURATION = {
    '0_1': 800,   '1_0': 1000,
    '1_2': 1200,  '2_1': 1500,
    '2_3': 1600,  '3_2': 2000,
    '3_4': 0,     '4_3': 400,   // 4→3 is abrupt snap back, disorienting
  };

  // Active transition state
  let active = null;
  let graphics = null;    // Phaser Graphics object, set per-scene

  function getKey(from, to) {
    return `${from}_${to}`;
  }

  function getDuration(from, to) {
    const key = getKey(from, to);
    return TRANSITION_DURATION[key] !== undefined ? TRANSITION_DURATION[key] : 1000;
  }

  return {
    /**
     * Called once per scene that needs transitions.
     * scene: the Phaser scene, used to create the overlay graphics.
     */
    init(scene) {
      graphics = scene.add.graphics();
      graphics.setDepth(9999);
      return this;
    },

    /**
     * Execute a transition from one layer to another.
     * onMidpoint: callback fired halfway through (swap scene here)
     * onComplete: callback fired when transition is fully done
     */
    transition(scene, fromLayer, toLayer, onMidpoint, onComplete) {
      const duration = getDuration(fromLayer, toLayer);

      if (duration === 0) {
        // Instant — Layer 3→4
        this._flashWhite(scene, () => {
          if (onMidpoint) onMidpoint();
          if (onComplete) onComplete();
        });
        return;
      }

      const type = this._getType(fromLayer, toLayer);
      this._execute(scene, type, duration, fromLayer, toLayer, onMidpoint, onComplete);
    },

    _getType(from, to) {
      if (to === 0 || from === 0 && to === 1) return 'fade_white';
      if ((from === 1 && to === 2) || (from === 2 && to === 1)) return 'panel_peel';
      if ((from === 2 && to === 3) || (from === 3 && to === 2)) return 'scanline';
      if (from === 4 || to === 4) return 'snap';
      return 'fade_black';
    },

    _execute(scene, type, duration, from, to, onMidpoint, onComplete) {
      // Determine if returning (going to lower layer number = returning up)
      const returning = to < from;
      const actualDuration = returning ? Math.floor(duration * 1.3) : duration;
      const half = actualDuration / 2;

      switch (type) {
        case 'fade_white':
          this._fadeWhite(scene, half, onMidpoint, half, onComplete);
          break;
        case 'panel_peel':
          this._panelPeel(scene, half, onMidpoint, half, onComplete, returning);
          break;
        case 'scanline':
          this._scanlineDissolve(scene, half, onMidpoint, half, onComplete, returning);
          break;
        case 'snap':
          this._snapCut(scene, onMidpoint, onComplete);
          break;
        default:
          this._fadeBlack(scene, half, onMidpoint, half, onComplete);
      }
    },

    // ─── Transition implementations ─────────────────────────────

    _fadeWhite(scene, inDur, onMid, outDur, onComplete) {
      const { width, height } = scene.scale;
      if (!graphics) this.init(scene);
      graphics.clear();
      graphics.fillStyle(0xf5f0e8, 0);
      graphics.fillRect(0, 0, width, height);

      scene.tweens.add({
        targets: graphics,
        alpha: 1,
        duration: inDur,
        ease: 'Sine.easeIn',
        onUpdate: (tween) => {
          graphics.clear();
          graphics.fillStyle(0xf5f0e8, tween.progress);
          graphics.fillRect(0, 0, width, height);
        },
        onComplete: () => {
          if (onMid) onMid();
          scene.tweens.add({
            targets: graphics,
            alpha: 0,
            duration: outDur,
            delay: 100,
            ease: 'Sine.easeOut',
            onUpdate: (tween) => {
              graphics.clear();
              graphics.fillStyle(0xf5f0e8, 1 - tween.progress);
              graphics.fillRect(0, 0, width, height);
            },
            onComplete: () => {
              graphics.clear();
              if (onComplete) onComplete();
            }
          });
        }
      });
    },

    _fadeBlack(scene, inDur, onMid, outDur, onComplete) {
      const { width, height } = scene.scale;
      if (!graphics) this.init(scene);
      let progress = 0;
      scene.tweens.addCounter({
        from: 0, to: 1, duration: inDur, ease: 'Sine.easeIn',
        onUpdate: (tween) => {
          progress = tween.getValue();
          graphics.clear();
          graphics.fillStyle(0x000000, progress);
          graphics.fillRect(0, 0, width, height);
        },
        onComplete: () => {
          if (onMid) onMid();
          scene.tweens.addCounter({
            from: 1, to: 0, duration: outDur, delay: 80,
            onUpdate: (tween) => {
              graphics.clear();
              graphics.fillStyle(0x000000, tween.getValue());
              graphics.fillRect(0, 0, width, height);
            },
            onComplete: () => { graphics.clear(); if (onComplete) onComplete(); }
          });
        }
      });
    },

    _panelPeel(scene, inDur, onMid, outDur, onComplete, returning) {
      const { width, height } = scene.scale;
      if (!graphics) this.init(scene);
      const panels = 6;
      const pw = width / panels;
      let t = 0;

      const timer = scene.time.addEvent({
        delay: 16, repeat: Math.ceil(inDur / 16),
        callback: () => {
          t = Math.min(1, t + 16 / inDur);
          graphics.clear();
          for (let i = 0; i < panels; i++) {
            const delay = returning ? (panels - 1 - i) / panels : i / panels;
            const localT = Math.max(0, Math.min(1, (t - delay * 0.3) / 0.7));
            const eased = localT * localT * (3 - 2 * localT); // smoothstep
            const x = i * pw;
            // Each panel slides up, revealing white
            graphics.fillStyle(0xf5f0e8, 1);
            graphics.fillRect(x, 0, pw, height * eased);
            // Panel shadow edge
            graphics.fillStyle(0xc8bfa8, 0.4);
            graphics.fillRect(x + pw - 2, 0, 2, height * eased);
          }
          if (t >= 1) {
            timer.remove();
            if (onMid) onMid();
            // reverse panels
            let t2 = 0;
            const timer2 = scene.time.addEvent({
              delay: 16, repeat: Math.ceil(outDur / 16),
              callback: () => {
                t2 = Math.min(1, t2 + 16 / outDur);
                graphics.clear();
                for (let i = 0; i < panels; i++) {
                  const delay = returning ? i / panels : (panels - 1 - i) / panels;
                  const localT = Math.max(0, Math.min(1, (t2 - delay * 0.3) / 0.7));
                  const eased = 1 - localT * localT * (3 - 2 * localT);
                  const x = i * pw;
                  graphics.fillStyle(0xf5f0e8, 1);
                  graphics.fillRect(x, 0, pw, height * eased);
                  graphics.fillStyle(0xc8bfa8, 0.4);
                  graphics.fillRect(x + pw - 2, 0, 2, height * eased);
                }
                if (t2 >= 1) {
                  timer2.remove();
                  graphics.clear();
                  if (onComplete) onComplete();
                }
              }
            });
          }
        }
      });
    },

    _scanlineDissolve(scene, inDur, onMid, outDur, onComplete, returning) {
      const { width, height } = scene.scale;
      if (!graphics) this.init(scene);
      const lineH = 3;
      const lines = Math.ceil(height / lineH);
      let t = 0;

      const drawScanlines = (progress, color) => {
        graphics.clear();
        for (let i = 0; i < lines; i++) {
          const offset = returning ? (lines - i) / lines : i / lines;
          const alpha = Math.max(0, Math.min(1, (progress - offset * 0.5) / 0.5));
          if (alpha > 0) {
            graphics.fillStyle(color, alpha);
            graphics.fillRect(0, i * lineH, width, lineH);
          }
        }
      };

      scene.tweens.addCounter({
        from: 0, to: 1, duration: inDur, ease: 'Linear',
        onUpdate: (tween) => drawScanlines(tween.getValue(), 0x1a1a2e),
        onComplete: () => {
          if (onMid) onMid();
          scene.tweens.addCounter({
            from: 1, to: 0, duration: outDur, delay: 60, ease: 'Linear',
            onUpdate: (tween) => drawScanlines(tween.getValue(), 0x1a1a2e),
            onComplete: () => { graphics.clear(); if (onComplete) onComplete(); }
          });
        }
      });
    },

    _snapCut(scene, onMid, onComplete) {
      // No transition — reality just changes
      if (!graphics) this.init(scene);
      const { width, height } = scene.scale;
      graphics.clear();
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRect(0, 0, width, height);
      if (onMid) onMid();
      scene.time.delayedCall(16, () => {
        graphics.clear();
        if (onComplete) onComplete();
      });
    },

    _flashWhite(scene, onComplete) {
      this._snapCut(scene, null, onComplete);
    }
  };
})();
