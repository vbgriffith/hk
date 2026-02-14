/* js/systems/CharmSystem.js — Charm equip/effects system */
'use strict';

/**
 * All charms defined with:
 *  id, name, description, cost (notch slots), effect function
 */
const CHARM_DEFS = [
  {
    id: 'gathering_swarm',
    name: 'Gathering Swarm',
    notches: 1,
    desc: 'A swarm of tiny creatures will follow you and collect any loose Geo.',
    onEquip(knight)  { knight._charmAutoGeo = true; },
    onUnequip(knight){ knight._charmAutoGeo = false; },
    onUpdate(knight, dt) {
      if (!knight._charmAutoGeo) return;
      const scene = knight.scene;
      for (const s of scene._shards ?? []) {
        if (!s.alive) continue;
        // Increase magnet range
        s._magnetDist = 160;
      }
    },
  },
  {
    id: 'wayward_compass',
    name: 'Wayward Compass',
    notches: 1,
    desc: 'Resonates with a cartographer\'s maps, showing your location.',
    onEquip(knight)  { knight.scene?._mapScreen?._showCompass(true); },
    onUnequip(knight){ knight.scene?._mapScreen?._showCompass(false); },
    onUpdate() {},
  },
  {
    id: 'fragile_heart',
    name: 'Fragile Heart',
    notches: 2,
    desc: 'Increases the bearer\'s health by adding two full Mask Containers.',
    onEquip(knight) {
      knight.masksMax = Math.min(knight.masksMax + 2, C.MASK_MAX + 4);
      knight.masks    = Math.min(knight.masks + 2, knight.masksMax);
      knight._hud?.update();
    },
    onUnequip(knight) {
      knight.masksMax = Math.max(knight.masksMax - 2, C.MASK_MAX);
      knight.masks    = Math.min(knight.masks, knight.masksMax);
      knight._hud?.update();
    },
    onUpdate() {},
  },
  {
    id: 'quick_slash',
    name: 'Quick Slash',
    notches: 3,
    desc: 'Speeds up nail attacks considerably.',
    onEquip(knight) {
      knight._attackCdMult = 0.55;
      knight._attackDurMult = 0.65;
    },
    onUnequip(knight) {
      knight._attackCdMult  = 1;
      knight._attackDurMult = 1;
    },
    onUpdate() {},
  },
  {
    id: 'mark_of_pride',
    name: 'Mark of Pride',
    notches: 3,
    desc: 'Increases the range of the nail\'s slash.',
    onEquip(knight)  { knight._nailRangeMult = 1.35; },
    onUnequip(knight){ knight._nailRangeMult = 1.0;  },
    onUpdate() {},
  },
  {
    id: 'long_nail',
    name: 'Long Nail',
    notches: 2,
    desc: 'Worn by nail masters to increase their reach.',
    onEquip(knight)  { knight._nailRangeMult = (knight._nailRangeMult || 1) * 1.2; },
    onUnequip(knight){ knight._nailRangeMult = 1.0; },
    onUpdate() {},
  },
  {
    id: 'spell_twister',
    name: 'Spell Twister',
    notches: 2,
    desc: 'Reduces the soul cost of spells.',
    onEquip(knight)  { knight._spellCostMult = 0.67; },
    onUnequip(knight){ knight._spellCostMult = 1.0;  },
    onUpdate() {},
  },
  {
    id: 'soul_catcher',
    name: 'Soul Catcher',
    notches: 2,
    desc: 'Gain more SOUL when striking enemies.',
    onEquip(knight)  { knight._soulPerHitBonus = 8; },
    onUnequip(knight){ knight._soulPerHitBonus = 0; },
    onUpdate() {},
  },
  {
    id: 'shaman_stone',
    name: 'Shaman Stone',
    notches: 3,
    desc: 'Increases the damage dealt by spells.',
    onEquip(knight)  { knight._spellDmgMult = 1.33; },
    onUnequip(knight){ knight._spellDmgMult = 1.0;  },
    onUpdate() {},
  },
  {
    id: 'steady_body',
    name: 'Steady Body',
    notches: 2,
    desc: 'Prevents knockback from nail hits.',
    onEquip(knight)  { knight._noNailKnockback = true; },
    onUnequip(knight){ knight._noNailKnockback = false; },
    onUpdate() {},
  },
  {
    id: 'stalwart_shell',
    name: 'Stalwart Shell',
    notches: 3,
    desc: 'Extends the invincibility period after taking damage.',
    onEquip(knight)  { knight._iframeMult = 1.6; },
    onUnequip(knight){ knight._iframeMult = 1.0; },
    onUpdate() {},
  },
];

const CHARM_BY_ID = Object.fromEntries(CHARM_DEFS.map(c => [c.id, c]));

/* ── CharmSystem ──────────────────────────────────────────────────────────── */
class CharmSystem {
  constructor(knight, saveData) {
    this.knight    = knight;
    this._equipped = new Set(saveData?.charms ?? []);
    this._slots    = saveData?.charmSlots ?? 3;
    this._usedSlots= 0;

    // Initialise multiplier defaults
    knight._attackCdMult   = 1;
    knight._attackDurMult  = 1;
    knight._nailRangeMult  = 1;
    knight._spellCostMult  = 1;
    knight._spellDmgMult   = 1;
    knight._soulPerHitBonus= 0;
    knight._noNailKnockback= false;
    knight._iframeMult     = 1;
    knight._charmAutoGeo   = false;

    // Apply all saved charms on load
    for (const id of this._equipped) {
      const def = CHARM_BY_ID[id];
      if (def) def.onEquip(knight);
    }

    this._recalcSlots();
  }

  equip(id) {
    const def = CHARM_BY_ID[id];
    if (!def) return false;
    if (this._equipped.has(id)) return false;
    if (this._usedSlots + def.notches > this._slots) return false;

    this._equipped.add(id);
    def.onEquip(this.knight);
    this._recalcSlots();
    return true;
  }

  unequip(id) {
    if (!this._equipped.has(id)) return false;
    const def = CHARM_BY_ID[id];
    if (def) def.onUnequip(this.knight);
    this._equipped.delete(id);
    this._recalcSlots();
    return true;
  }

  toggle(id) {
    return this._equipped.has(id) ? this.unequip(id) : this.equip(id);
  }

  isEquipped(id) { return this._equipped.has(id); }

  _recalcSlots() {
    this._usedSlots = 0;
    for (const id of this._equipped) {
      const def = CHARM_BY_ID[id];
      if (def) this._usedSlots += def.notches;
    }
  }

  update(dt) {
    for (const id of this._equipped) {
      const def = CHARM_BY_ID[id];
      if (def) def.onUpdate(this.knight, dt);
    }
  }

  toSaveData() {
    return {
      charms:     [...this._equipped],
      charmSlots: this._slots,
    };
  }

  get slotsUsed()  { return this._usedSlots; }
  get slotsTotal() { return this._slots; }
  get equipped()   { return [...this._equipped]; }
}
