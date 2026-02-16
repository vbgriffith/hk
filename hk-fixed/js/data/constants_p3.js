/* js/data/constants_p3.js — Phase III–V constant additions */
'use strict';

// Extend C by re-defining (we use a mutable object approach)
const C_EXTRA = {
  // ── City of Tears enemies ─────────────────────────────────────────────────
  GREAT_HOPPER_HP:     28,  GREAT_HOPPER_DMG:    12,  GREAT_HOPPER_SPEED:  80,
  WINGED_FOOL_HP:      16,  WINGED_FOOL_DMG:     10,  WINGED_FOOL_SPEED:   90,
  SOUL_TWISTER_HP:     24,  SOUL_TWISTER_DMG:    15,
  FUNGOON_HP:          20,  FUNGOON_DMG:         10,  FUNGOON_SPEED:       55,
  SHRUMAL_OGRE_HP:     80,  SHRUMAL_OGRE_DMG:    18,  SHRUMAL_OGRE_SPEED:  40,
  MANTIS_WARRIOR_HP:   30,  MANTIS_WARRIOR_DMG:  15,  MANTIS_WARRIOR_SPEED:80,
  PALE_LURKER_HP:      25,  PALE_LURKER_DMG:     12,
  UUMUU_HP:            250, UUMUU_DMG:           20,
  DUNG_DEFENDER_HP:    600, DUNG_DEFENDER_DMG:   20,
  LURIEN_WATCHER_HP:   350, LURIEN_WATCHER_DMG:  18,

  // ── Soul Master ────────────────────────────────────────────────────────────
  SOUL_MASTER_HP:      300, SOUL_MASTER_DMG:     20,
  SOUL_MASTER_ORB_SPD: 180, SOUL_MASTER_TELEPORT_CD: 3.0,

  // ── Mantis Lords ──────────────────────────────────────────────────────────
  MANTIS_LORDS_HP_EACH: 140, MANTIS_LORDS_DMG:   18,
  MANTIS_LORDS_DASH_SPD:260, MANTIS_LORDS_THROW_SPD:200,

  // ── Hollow Knight Final Boss ───────────────────────────────────────────────
  HK_BOSS_HP:          1000, HK_BOSS_DMG:        25,
  HK_BOSS_STAGGER:     200,
  RADIANCE_HP:         600,  RADIANCE_DMG:        20,

  // ── Dreamer system ────────────────────────────────────────────────────────
  DREAMERS_NEEDED:     3,

  // ── Rain ──────────────────────────────────────────────────────────────────
  RAIN_DROP_COUNT:     80,
  RAIN_SPEED_MIN:      200, RAIN_SPEED_MAX:      360,

  // ── Shade Cloak ───────────────────────────────────────────────────────────
  SHADE_CLOAK_CD:      1.2,
  SHADE_CLOAK_IFRAMES: 0.6,

  // ── Void Tendril ──────────────────────────────────────────────────────────
  VOID_TENDRIL_DMG:    20,

  // ── Scene ─────────────────────────────────────────────────────────────────
  SCENE_CREDITS:       'Credits',
  SCENE_ENDING:        'Ending',
};

// Merge into C (bypass freeze by re-assigning to window.C)
window.C = Object.assign({}, C, C_EXTRA);
