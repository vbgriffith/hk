/* js/systems/InputHandler.js — Centralised input with buffering and gamepad */
'use strict';

class InputHandler {
  constructor(scene) {
    this.scene = scene;
    this.keys  = {};
    this._prev = {};
    this._buf  = {};     // buffered presses (cleared next frame after reading)
    this._pad  = null;

    this._setupKeyboard();
    this._setupGamepad();
  }

  _setupKeyboard() {
    const kb = this.scene.input.keyboard;
    const map = C.INPUT;

    for (const [action, codes] of Object.entries(map)) {
      this.keys[action] = codes
        .filter(k => k && k !== 'NONE')                // skip invalid entries
        .map(k => {
          const code = Phaser.Input.Keyboard.KeyCodes[k];
          return code != null ? kb.addKey(code) : null;
        })
        .filter(Boolean);
    }
  }

  _setupGamepad() {
    if (!this.scene.input.gamepad) return;
    this.scene.input.gamepad.once('connected', pad => {
      this._pad = pad;
    });
  }

  update() {
    const prev = { ...this._prev };

    for (const action of Object.keys(this.keys)) {
      const down = this.isDown(action);
      this._prev[action] = down;

      // Rising edge → buffer for one frame so no fast input is missed
      if (down && !prev[action]) {
        this._buf[action] = 2;   // persist 2 frames
      }
      if (this._buf[action] > 0) this._buf[action]--;
    }
  }

  /** Is this action held right now? */
  isDown(action) {
    const keys = this.keys[action] || [];
    for (const k of keys) {
      if (k.isDown) return true;
    }
    // Gamepad
    if (this._pad) {
      return this._padDown(action);
    }
    return false;
  }

  /** Was this action just pressed this frame (rising edge)? */
  justPressed(action) {
    return this._buf[action] > 0;
  }

  /** Was this action just released? */
  justReleased(action) {
    return !this.isDown(action) && (this._prev[action] ?? false);
  }

  _padDown(action) {
    const p = this._pad;
    switch (action) {
      case 'LEFT':    return p.left || p.leftStick.x < -0.4;
      case 'RIGHT':   return p.right || p.leftStick.x > 0.4;
      case 'UP':      return p.up || p.leftStick.y < -0.4;
      case 'DOWN':    return p.down || p.leftStick.y > 0.4;
      case 'JUMP':    return p.A;
      case 'ATTACK':  return p.X;
      case 'DASH':    return p.B || p.R2 > 0.5;
      case 'FOCUS':   return p.L1;
      case 'CAST':    return p.Y;
      case 'MAP':     return p.select;
      case 'PAUSE':   return p.start;
      case 'INTERACT':return p.A;
    }
    return false;
  }

  // Convenience helpers
  get left()     { return this.isDown('LEFT');  }
  get right()    { return this.isDown('RIGHT'); }
  get up()       { return this.isDown('UP');    }
  get down()     { return this.isDown('DOWN');  }
  get jump()     { return this.justPressed('JUMP');    }
  get jumpHeld() { return this.isDown('JUMP');         }
  get attack()   { return this.justPressed('ATTACK');  }
  get attackHeld(){ return this.isDown('ATTACK');      }
  get dash()     { return this.justPressed('DASH');    }
  get focus()    { return this.isDown('FOCUS');        }
  get cast()     { return this.justPressed('CAST');    }
  get map()      { return this.justPressed('MAP');     }
  get pause()    { return this.justPressed('PAUSE');   }
  get interact() { return this.justPressed('INTERACT');}
  get xAxis()    {
    return (this.isDown('RIGHT') ? 1 : 0) - (this.isDown('LEFT') ? 1 : 0);
  }

  destroy() {
    for (const keys of Object.values(this.keys)) {
      for (const k of keys) {
        this.scene.input.keyboard.removeKey(k);
      }
    }
  }
}
