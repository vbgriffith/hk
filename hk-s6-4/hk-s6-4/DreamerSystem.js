/* js/systems/DreamerSystem.js — Dreamer seal tracking, Black Egg, endings */
'use strict';

class DreamerSystem {
  constructor(scene, save) {
    this.scene   = scene;
    this._save   = save;
    this._sealed = new Set(['monomon', 'lurien', 'herrah']);
    // Ensure brokenSeals is a valid array
    const seals = Array.isArray(save?.brokenSeals) ? save.brokenSeals : [];
    this._broken = new Set(seals);
  }

  // Call when player interacts with a dreamer_seal item
  breakSeal(dreamerKey, callback) {
    if (this._broken.has(dreamerKey)) { callback?.(); return; }
    this._broken.add(dreamerKey);

    // Update save
    if (!this._save.brokenSeals) this._save.brokenSeals = [];
    this._save.brokenSeals.push(dreamerKey);
    SaveSystem.save(this.scene._buildSaveData());

    // Visual sequence
    this.scene._camera?.flash(0xffffff, 600);
    this.scene._audio?.playSfx?.('sfx_dream_nail');
    this.scene._particles?.burst({ x: C.WIDTH/2, y: C.HEIGHT/2,
      count: 20, tint: 0xaaaaff, speedX:[-100,100], speedY:[-120,20] });

    this.scene._dialogue.show(DIALOGUE.dreamer_seal_break, () => {
      callback?.();
    });
  }

  get brokenCount()  { return this._broken.size; }
  get allBroken()    { return this._broken.size >= C.DREAMERS_NEEDED; }
  get broken()       { return [...this._broken]; }

  isSealed(key)      { return !this._broken.has(key); }

  // Called when player reaches Black Egg door
  checkDoor(onUnlock, onLocked) {
    if (this.allBroken) {
      onUnlock?.();
    } else {
      const remaining = C.DREAMERS_NEEDED - this._broken.size;
      this.scene._dialogue.show([
        ...DIALOGUE.black_egg_door_locked,
        { speaker:'', text: `${remaining} seal${remaining!==1?'s':''} remain${remaining===1?'s':''}.` }
      ], () => {});
      onLocked?.();
    }
  }

  toSaveData() {
    return { brokenSeals: [...this._broken] };
  }
}
