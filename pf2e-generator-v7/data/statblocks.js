/**
 * data/statblocks.js
 * Full PF2e Remaster stat blocks for every creature in the encounter library.
 * Format follows PF2e Monster Core / Bestiary conventions.
 * Source references: MC = Monster Core, B1 = Bestiary 1, B2 = Bestiary 2, B3 = Bestiary 3
 * Pathfinder Adventure Path creatures noted where applicable.
 *
 * Stat block fields:
 *   name, level, traits[], perception, languages[], skills{}, abilityMods{},
 *   ac, saves{fort,ref,will}, hp, immunities[], resistances[], weaknesses[],
 *   speeds{land,fly,swim,climb,burrow}, actions[], reactions[], passives[],
 *   attacks[], source{book,page,note}
 *
 * Attacks format: { name, bonus, damage, traits[], effects[] }
 * Actions format: { name, actions, type, description }
 */

const STAT_BLOCKS = {};

// ─── Helper to register ───────────────────────────────────────────────────
function _sb(name, data) { STAT_BLOCKS[name] = data; }

// ═══════════════════════════════════════════════════════════════════════════
// LEVEL -1 to 1
// ═══════════════════════════════════════════════════════════════════════════

_sb('Goblin Commoner', {
  level: -1, traits: ['goblin','humanoid','small'],
  perception: 2, senses: ['darkvision'],
  languages: ['Goblin'],
  skills: { Acrobatics: 5, Stealth: 5, Thievery: 3 },
  abilityMods: { str: -1, dex: 4, con: 0, int: -1, wis: 0, cha: 1 },
  ac: 15, saves: { fort: 2, ref: 7, will: 2 }, hp: 6,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 25 },
  attacks: [
    { name: 'Jaws', bonus: 5, damage: '1d4−1 piercing', traits: ['finesse'] },
    { name: 'Sling', bonus: 5, damage: '1d4−1 bludgeoning', traits: ['propulsive','range 50 ft'] }
  ],
  actions: [
    { name: 'Goblin Scuttle', actions: 'R', type: 'reaction', description: 'Trigger: An ally ends a move adjacent to you. Effect: Step.' }
  ],
  passives: ['Unsteady (−1 to attacks if moved 10+ ft this turn)'],
  source: { book: 'Monster Core', page: 185, note: 'Standard goblin stat block' }
});

_sb('Giant Rat', {
  level: -1, traits: ['animal','small'],
  perception: 3, senses: ['low-light vision','scent (imprecise) 30 ft'],
  languages: [],
  skills: { Acrobatics: 5, Athletics: 1, Stealth: 5 },
  abilityMods: { str: 0, dex: 4, con: 1, int: -4, wis: 2, cha: -3 },
  ac: 14, saves: { fort: 5, ref: 7, will: 4 }, hp: 8,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 30, climb: 10, swim: 10 },
  attacks: [
    { name: 'Jaws', bonus: 5, damage: '1d4 piercing', traits: ['agile','finesse'], effects: ['Filth Fever DC 12 Fortitude on crit'] }
  ],
  actions: [],
  passives: ['Filth Fever: Stage 1 Fatigued (1 day); Stage 2 Enfeebled 1 and Fatigued (1 day); Stage 3 Enfeebled 2, Fatigued, cannot recover HP naturally (1 day)'],
  source: { book: 'Monster Core', page: 275, note: 'See also Rat entry' }
});

_sb('Goblin Warrior', {
  level: 1, traits: ['goblin','humanoid','small'],
  perception: 6, senses: ['darkvision'],
  languages: ['Common','Goblin'],
  skills: { Acrobatics: 7, Athletics: 3, Stealth: 7 },
  abilityMods: { str: 0, dex: 4, con: 1, int: 0, wis: 1, cha: 2 },
  ac: 17, saves: { fort: 4, ref: 9, will: 4 }, hp: 16,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 25 },
  attacks: [
    { name: 'Dogslicer', bonus: 7, damage: '1d6 slashing', traits: ['agile','backstabber','finesse'] },
    { name: 'Shortbow', bonus: 7, damage: '1d6 piercing', traits: ['range 60 ft','reload 0'] }
  ],
  actions: [
    { name: 'Goblin Scuttle', actions: 'R', type: 'reaction', description: 'Trigger: An ally ends a move adjacent to you. Effect: Step.' },
    { name: 'Goblin Song', actions: '1', type: 'action', description: 'Attempt Demoralize on up to 2 targets in 30 ft simultaneously. Uses Intimidation.' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 185 }
});

_sb('Skeleton Guard', {
  level: 1, traits: ['mindless','skeleton','undead'],
  perception: 5, senses: ['darkvision'],
  languages: [],
  skills: { Acrobatics: 7, Athletics: 5 },
  abilityMods: { str: 2, dex: 4, con: 0, int: -5, wis: 0, cha: 0 },
  ac: 17, saves: { fort: 3, ref: 7, will: 3 }, hp: 16,
  immunities: ['death effects','disease','mental','paralyzed','poison','unconscious'],
  resistances: ['cold 5','electricity 5','fire 5','piercing 5','slashing 5'],
  weaknesses: ['bludgeoning 5','positive 5'],
  speeds: { land: 25 },
  attacks: [
    { name: 'Scimitar', bonus: 7, damage: '1d6+2 slashing', traits: ['forceful','sweep'] },
    { name: 'Claw', bonus: 7, damage: '1d4+2 slashing', traits: ['agile','finesse'] }
  ],
  actions: [],
  passives: ['Undead Resistance (see immunities)'],
  source: { book: 'Monster Core', page: 305 }
});

_sb('Zombie Shambler', {
  level: 1, traits: ['mindless','undead','zombie'],
  perception: 3, senses: ['darkvision'],
  languages: [],
  skills: { Athletics: 7 },
  abilityMods: { str: 4, dex: -2, con: 2, int: -5, wis: 0, cha: -2 },
  ac: 13, saves: { fort: 7, ref: 1, will: 3 }, hp: 20,
  immunities: ['death effects','disease','mental','paralyzed','poison','unconscious'],
  resistances: [],
  weaknesses: ['positive 5','slashing 5'],
  speeds: { land: 25 },
  attacks: [
    { name: 'Fist', bonus: 7, damage: '1d6+4 bludgeoning', traits: [], effects: ['Grab'] }
  ],
  actions: [
    { name: 'Shamble', actions: '1', type: 'action', description: 'Zombie Stride: Move up to Speed. May move through difficult terrain.' }
  ],
  passives: ['Slow: −10 ft Speed; 3-action turns instead of standard turn structure'],
  source: { book: 'Monster Core', page: 345 }
});

_sb('Giant Spider', {
  level: 1, traits: ['animal','spider'],
  perception: 5, senses: ['darkvision','tremorsense (imprecise) 30 ft'],
  languages: [],
  skills: { Acrobatics: 5, Athletics: 5, Stealth: 7 },
  abilityMods: { str: 2, dex: 4, con: 0, int: -5, wis: 0, cha: -4 },
  ac: 16, saves: { fort: 5, ref: 8, will: 3 }, hp: 16,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 25, climb: 25 },
  attacks: [
    { name: 'Fangs', bonus: 7, damage: '1d6+2 piercing', traits: [], effects: ['Venom DC 15 Fort'] }
  ],
  actions: [
    { name: 'Web', actions: '2', type: 'action', description: 'Ranged 30 ft: +7 vs Reflex DC 17. On hit: target Grabbed. Web has AC 10, Hardness 3, HP 5.' }
  ],
  passives: ['Web Sense: Automatically detects vibrations through web'],
  source: { book: 'Monster Core', page: 320 }
});

_sb('Wolf', {
  level: 1, traits: ['animal'],
  perception: 7, senses: ['low-light vision','scent (imprecise) 30 ft'],
  languages: [],
  skills: { Acrobatics: 5, Athletics: 6, Stealth: 5, Survival: 5 },
  abilityMods: { str: 3, dex: 2, con: 2, int: -4, wis: 2, cha: -2 },
  ac: 15, saves: { fort: 7, ref: 5, will: 4 }, hp: 18,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 35 },
  attacks: [
    { name: 'Jaws', bonus: 6, damage: '1d6+3 piercing', traits: [], effects: ['Trip'] }
  ],
  actions: [
    { name: 'Pack Attack', actions: 'passive', type: 'passive', description: '+1d4 damage if an ally is also adjacent to target.' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 341 }
});

_sb('Giant Centipede', {
  level: 1, traits: ['animal','centipede'],
  perception: 5, senses: ['darkvision','tremorsense (imprecise) 30 ft'],
  languages: [],
  skills: { Acrobatics: 6, Athletics: 5, Stealth: 6 },
  abilityMods: { str: 2, dex: 3, con: 2, int: -5, wis: 2, cha: -4 },
  ac: 17, saves: { fort: 6, ref: 8, will: 5 }, hp: 18,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 30, climb: 30 },
  attacks: [
    { name: 'Mandibles', bonus: 7, damage: '1d6+2 piercing', traits: [], effects: ['Venom DC 15 Fort: Clumsy 1 for 1 round on fail'] }
  ],
  actions: [],
  passives: ['Clinging Legs: Difficult to knock prone'],
  source: { book: 'Monster Core', page: 62 }
});

// ═══════════════════════════════════════════════════════════════════════════
// LEVEL 2–4
// ═══════════════════════════════════════════════════════════════════════════

_sb('Hobgoblin Soldier', {
  level: 2, traits: ['goblin','humanoid'],
  perception: 7, senses: ['darkvision'],
  languages: ['Common','Goblin'],
  skills: { Athletics: 8, Intimidation: 6, Stealth: 5 },
  abilityMods: { str: 3, dex: 1, con: 2, int: 0, wis: 1, cha: 0 },
  ac: 18, saves: { fort: 8, ref: 7, will: 5 }, hp: 30,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 25 },
  attacks: [
    { name: 'Longsword', bonus: 8, damage: '1d8+3 slashing', traits: ['versatile P'] },
    { name: 'Javelin', bonus: 7, damage: '1d6+3 piercing', traits: ['thrown 30 ft'] }
  ],
  actions: [
    { name: 'Hobgoblin Discipline', actions: 'passive', type: 'passive', description: '+1 to all saves when adjacent to another hobgoblin ally.' },
    { name: 'Formation Training', actions: 'passive', type: 'passive', description: '+1 AC when adjacent to an ally with a shield raised.' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 191 }
});

_sb('Gnoll Hunter', {
  level: 2, traits: ['gnoll','humanoid'],
  perception: 9, senses: ['darkvision'],
  languages: ['Gnoll'],
  skills: { Athletics: 6, Intimidation: 5, Stealth: 7, Survival: 7 },
  abilityMods: { str: 2, dex: 3, con: 2, int: 0, wis: 3, cha: 0 },
  ac: 17, saves: { fort: 8, ref: 9, will: 7 }, hp: 30,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 25 },
  attacks: [
    { name: 'Shortbow', bonus: 9, damage: '1d6+2 piercing', traits: ['range 60 ft','deadly d10'] },
    { name: 'Jaws', bonus: 8, damage: '1d6+2 piercing', traits: [] }
  ],
  actions: [
    { name: 'Rugged Travel', actions: 'passive', type: 'passive', description: 'Ignore difficult terrain from sand, rubble, or undergrowth.' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 183 }
});

_sb('Ghoul', {
  level: 2, traits: ['ghoul','undead'],
  perception: 8, senses: ['darkvision'],
  languages: ['Necril'],
  skills: { Athletics: 7, Stealth: 8 },
  abilityMods: { str: 3, dex: 4, con: 1, int: -1, wis: 2, cha: -1 },
  ac: 18, saves: { fort: 5, ref: 9, will: 7 }, hp: 30,
  immunities: ['death effects','disease','paralyzed','poison','unconscious'],
  resistances: [],
  weaknesses: ['positive 5'],
  speeds: { land: 30, climb: 20 },
  attacks: [
    { name: 'Jaws', bonus: 10, damage: '1d6+3 piercing', traits: [], effects: ['Ghoul Fever DC 15 Fort','Paralysis DC 15 Fort'] },
    { name: 'Claw', bonus: 10, damage: '1d4+3 slashing', traits: ['agile'], effects: ['Paralysis DC 15 Fort'] }
  ],
  actions: [
    { name: 'Consume Flesh', actions: '1', type: 'action', description: 'Eat from adjacent corpse dead ≤1 min. Recover 3d6 HP. Can\'t use again until start of next turn.' }
  ],
  passives: ['Paralysis: DC 15 Fort or Paralyzed for 1 minute (re-save each round). Elves are immune.'],
  source: { book: 'Monster Core', page: 176 }
});

_sb('Animated Armor', {
  level: 2, traits: ['construct','mindless'],
  perception: 6, senses: ['darkvision'],
  languages: [],
  skills: { Athletics: 8 },
  abilityMods: { str: 4, dex: 0, con: 3, int: -5, wis: 0, cha: -5 },
  ac: 18, saves: { fort: 9, ref: 5, will: 5 }, hp: 30,
  immunities: ['bleed','death effects','disease','doomed','drained','fatigued','healing','mental','necromancy','nonlethal attacks','paralyzed','poison','sickened','unconscious'],
  resistances: [],
  weaknesses: [],
  speeds: { land: 20 },
  attacks: [
    { name: 'Glaive', bonus: 10, damage: '1d8+4 slashing', traits: ['deadly d8','reach','forceful'] }
  ],
  actions: [],
  passives: ['Constructed: No need to breathe, eat, or sleep.'],
  source: { book: 'Monster Core', page: 25 }
});

_sb('Dire Wolf', {
  level: 3, traits: ['animal'],
  perception: 9, senses: ['low-light vision','scent (imprecise) 30 ft'],
  languages: [],
  skills: { Acrobatics: 7, Athletics: 11, Stealth: 7, Survival: 7 },
  abilityMods: { str: 5, dex: 2, con: 4, int: -4, wis: 2, cha: -2 },
  ac: 18, saves: { fort: 11, ref: 9, will: 7 }, hp: 44,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 35 },
  attacks: [
    { name: 'Jaws', bonus: 10, damage: '1d10+5 piercing', traits: [], effects: ['Knockdown'] }
  ],
  actions: [
    { name: 'Pack Attack', actions: 'passive', type: 'passive', description: '+1d6 damage against creature with adjacent wolf ally.' },
    { name: 'Knockdown', actions: 'passive', type: 'passive', description: 'On critical hit: target is knocked Prone.' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 341 }
});

_sb('Wight', {
  level: 3, traits: ['undead','wight'],
  perception: 10, senses: ['darkvision'],
  languages: ['Necril','plus one mortal language from life'],
  skills: { Athletics: 9, Intimidation: 7, Stealth: 9 },
  abilityMods: { str: 4, dex: 2, con: 2, int: 1, wis: 3, cha: 2 },
  ac: 18, saves: { fort: 9, ref: 7, will: 10 }, hp: 45,
  immunities: ['death effects','disease','paralyzed','poison','unconscious'],
  resistances: [],
  weaknesses: ['positive 5','silver 5'],
  speeds: { land: 25 },
  attacks: [
    { name: 'Longsword', bonus: 11, damage: '1d8+4 slashing', traits: ['versatile P'] },
    { name: 'Claw', bonus: 11, damage: '1d6+4 slashing', traits: ['agile'], effects: ['Drain Life DC 18 Fort'] }
  ],
  actions: [
    { name: 'Drain Life', actions: 'passive', type: 'passive', description: 'On claw hit: target makes DC 18 Fortitude save. Fail: target gains Drained 1; wight gains 5 HP.' }
  ],
  passives: ['Create Spawn: Humanoids slain by wight rise as wights in 1d4 rounds.'],
  source: { book: 'Monster Core', page: 336 }
});

_sb('Harpy', {
  level: 3, traits: ['humanoid','harpy'],
  perception: 9, senses: ['darkvision'],
  languages: ['Common'],
  skills: { Acrobatics: 10, Deception: 9, Intimidation: 9 },
  abilityMods: { str: 2, dex: 4, con: 0, int: -1, wis: 0, cha: 4 },
  ac: 18, saves: { fort: 7, ref: 11, will: 9 }, hp: 40,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 20, fly: 60 },
  attacks: [
    { name: 'Talon', bonus: 11, damage: '1d4+4 slashing', traits: ['agile','finesse'] },
    { name: 'Club', bonus: 11, damage: '1d6+4 bludgeoning', traits: ['thrown 10 ft'] }
  ],
  actions: [
    { name: 'Captivating Song', actions: '2', type: 'action', description: 'Concentrate. Range 300 ft. Each target must succeed DC 18 Will save or be Fascinated and Compelled to move toward harpy until at adjacent square. On critical failure: also Stunned 1. Re-save each turn.' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 195 }
});

_sb('Minotaur', {
  level: 3, traits: ['humanoid','minotaur'],
  perception: 9, senses: ['darkvision'],
  languages: ['Jotun'],
  skills: { Athletics: 11, Intimidation: 9, Survival: 7 },
  abilityMods: { str: 5, dex: 0, con: 3, int: -1, wis: 2, cha: 2 },
  ac: 18, saves: { fort: 10, ref: 7, will: 7 }, hp: 50,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 25 },
  attacks: [
    { name: 'Greataxe', bonus: 12, damage: '1d12+5 slashing', traits: ['sweep'] },
    { name: 'Gore', bonus: 12, damage: '1d8+5 piercing', traits: [] }
  ],
  actions: [
    { name: 'Powerful Charge', actions: '2', type: 'action', description: 'Stride twice then Strike with Gore. If moved 20+ ft, deal additional 2d8 piercing damage.' },
    { name: 'Inexorable', actions: 'passive', type: 'passive', description: 'Cannot be slowed or immobilized by difficult terrain.' }
  ],
  passives: ['Natural Cunning: Never becomes lost by supernatural means.'],
  source: { book: 'Monster Core', page: 249 }
});

_sb('Young Dragon (White)', {
  level: 3, traits: ['cold','dragon'],
  perception: 10, senses: ['darkvision','scent (imprecise) 30 ft'],
  languages: ['Draconic'],
  skills: { Acrobatics: 6, Athletics: 11, Intimidation: 9, Stealth: 6 },
  abilityMods: { str: 4, dex: 1, con: 4, int: 0, wis: 1, cha: 2 },
  ac: 19, saves: { fort: 11, ref: 8, will: 8 }, hp: 55,
  immunities: ['cold','paralyzed','sleep'],
  resistances: [],
  weaknesses: ['fire 5'],
  speeds: { land: 30, fly: 60, swim: 20 },
  attacks: [
    { name: 'Jaws', bonus: 12, damage: '1d10+4 piercing plus 1d4 cold', traits: ['reach 10 ft'] },
    { name: 'Claw', bonus: 12, damage: '1d6+4 slashing', traits: ['agile'] }
  ],
  actions: [
    { name: 'Breath Weapon', actions: '2', type: 'action', description: '30-ft cone of cold. DC 20 Reflex: 4d6 cold on failure, half on success. Recharge in 1d4 rounds.' },
    { name: 'Draconic Frenzy', actions: '2', type: 'action', description: 'Make two claw Strikes and one jaws Strike in any order.' }
  ],
  passives: ['Ice Walk: Move across icy surfaces without penalty.'],
  source: { book: 'Monster Core', page: 110 }
});

_sb('Skeletal Champion', {
  level: 4, traits: ['skeleton','undead'],
  perception: 9, senses: ['darkvision'],
  languages: ['Necril','Common'],
  skills: { Athletics: 12, Intimidation: 9, Religion: 7 },
  abilityMods: { str: 4, dex: 3, con: 0, int: 1, wis: 2, cha: 1 },
  ac: 20, saves: { fort: 8, ref: 11, will: 9 }, hp: 55,
  immunities: ['death effects','disease','mental','paralyzed','poison','unconscious'],
  resistances: ['cold 5','electricity 5','fire 5','piercing 5','slashing 5'],
  weaknesses: ['bludgeoning 10','positive 10'],
  speeds: { land: 25 },
  attacks: [
    { name: 'Sword', bonus: 12, damage: '1d8+4 slashing', traits: ['versatile P'] },
    { name: 'Shield Bash', bonus: 12, damage: '1d4+4 bludgeoning', traits: [] }
  ],
  actions: [
    { name: 'Command Undead', actions: '1', type: 'action', description: 'Command one undead within 30 ft (no save). Mindless undead automatically obey.' },
    { name: 'Shield Block', actions: 'R', type: 'reaction', description: 'Trigger: Hit by attack while shield raised. Reduce damage by shield\'s Hardness (6).' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 305 }
});

_sb('Shadow', {
  level: 4, traits: ['shadow','undead'],
  perception: 10, senses: ['darkvision'],
  languages: ['Necril'],
  skills: { Athletics: 8, Stealth: 13 },
  abilityMods: { str: -2, dex: 5, con: 0, int: -2, wis: 2, cha: 3 },
  ac: 19, saves: { fort: 8, ref: 13, will: 10 }, hp: 35,
  immunities: ['death effects','disease','paralyzed','poison','unconscious'],
  resistances: ['all damage 5 (except force, ghost touch, or positive)'],
  weaknesses: ['positive 5','light vulnerability'],
  speeds: { land: 40, fly: 40 },
  attacks: [
    { name: 'Shadow Hand', bonus: 13, damage: '2d6 negative', traits: ['agile','finesse','incorporeal'], effects: ['Drain Shadow DC 20 Fort'] }
  ],
  actions: [
    { name: 'Drain Shadow', actions: 'passive', type: 'passive', description: 'On hit: DC 20 Fort or target becomes Drained 1. Creature reduced to Drained = shadow level gains -1 Str modifier permanently until Greater Restoration. Shadow gains 5 HP.' },
    { name: 'Hide in Shadows', actions: '1', type: 'action', description: 'Become invisible when in dim light or darker until end of next action.' }
  ],
  passives: ['Incorporeal: Only harmed by force/positive/ghost touch. Can pass through solid matter (costs extra movement).'],
  source: { book: 'Monster Core', page: 296 }
});

_sb('Gargoyle', {
  level: 4, traits: ['earth','elemental','gargoyle'],
  perception: 10, senses: ['darkvision'],
  languages: ['Terran'],
  skills: { Acrobatics: 8, Athletics: 11, Stealth: 11 },
  abilityMods: { str: 4, dex: 2, con: 4, int: -2, wis: 2, cha: 0 },
  ac: 21, saves: { fort: 12, ref: 10, will: 8 }, hp: 50,
  immunities: [],
  resistances: [],
  weaknesses: [],
  speeds: { land: 25, fly: 40 },
  attacks: [
    { name: 'Jaws', bonus: 12, damage: '2d6+4 piercing', traits: ['deadly d8'] },
    { name: 'Claw', bonus: 12, damage: '1d8+4 slashing', traits: ['agile'] }
  ],
  actions: [
    { name: 'Stone Skin', actions: 'passive', type: 'passive', description: '+4 circumstance bonus to Stealth when motionless among stone. Observers mistake for statue.' }
  ],
  passives: ['Clinging: Full Speed on vertical stone surfaces.'],
  source: { book: 'Monster Core', page: 169 }
});

_sb('Vampire Spawn', {
  level: 4, traits: ['undead','vampire'],
  perception: 12, senses: ['darkvision'],
  languages: ['Common','Necril'],
  skills: { Athletics: 10, Deception: 9, Intimidation: 9, Stealth: 10 },
  abilityMods: { str: 3, dex: 4, con: 1, int: 1, wis: 3, cha: 3 },
  ac: 21, saves: { fort: 9, ref: 12, will: 9 }, hp: 40,
  immunities: ['death effects','disease','paralyzed','poison','unconscious'],
  resistances: [],
  weaknesses: ['vampire weaknesses: sunlight 3/round, running water, holy symbols'],
  speeds: { land: 25, climb: 25 },
  attacks: [
    { name: 'Fangs', bonus: 12, damage: '1d8+3 piercing', traits: [], effects: ['Drink Blood on Grab'] },
    { name: 'Claw', bonus: 12, damage: '1d6+3 slashing', traits: ['agile'], effects: ['Grab'] }
  ],
  actions: [
    { name: 'Drink Blood', actions: '1', type: 'action', description: 'While creature is grabbed: automatic hit for 1d6 piercing + 1d6 negative damage. Target gains Drained 1.' },
    { name: 'Charming Gaze', actions: '2', type: 'action', description: 'DC 19 Will: Fascinated and attitude toward vampire improves by 1.' }
  ],
  passives: ['Mist Form: Can transform into mist as 2-action activity; reform as 2 actions.'],
  source: { book: 'Monster Core', page: 324, note: 'Vampire Spawn variant' }
});

// ═══════════════════════════════════════════════════════════════════════════
// LEVEL 5–8
// ═══════════════════════════════════════════════════════════════════════════

_sb('Troll', {
  level: 5, traits: ['giant','troll'],
  perception: 9, senses: ['darkvision'],
  languages: ['Jotun'],
  skills: { Athletics: 15, Intimidation: 9, Stealth: 9 },
  abilityMods: { str: 6, dex: 2, con: 6, int: -1, wis: 0, cha: 0 },
  ac: 21, saves: { fort: 15, ref: 11, will: 9 }, hp: 80,
  immunities: [],
  resistances: [],
  weaknesses: ['acid 10','fire 10'],
  speeds: { land: 30 },
  attacks: [
    { name: 'Claw', bonus: 15, damage: '2d6+6 slashing', traits: ['agile'] },
    { name: 'Jaws', bonus: 15, damage: '1d10+6 piercing', traits: [] }
  ],
  actions: [
    { name: 'Regeneration 15', actions: 'passive', type: 'passive', description: 'Troll regains 15 HP at start of each turn. Overcome by acid or fire damage; loses regen for 1 round.' },
    { name: 'Rend', actions: '1', type: 'action', description: 'Strike both claw attacks in sequence. On two hits: deal 2d8+6 additional slashing damage.' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 321 }
});

_sb('Wraith', {
  level: 5, traits: ['incorporeal','undead','wraith'],
  perception: 13, senses: ['darkvision','lifesense 60 ft'],
  languages: ['Necril','Common'],
  skills: { Intimidation: 13, Stealth: 13 },
  abilityMods: { str: -2, dex: 4, con: 0, int: 0, wis: 4, cha: 4 },
  ac: 20, saves: { fort: 9, ref: 13, will: 13 }, hp: 55,
  immunities: ['death effects','disease','paralyzed','poison','unconscious'],
  resistances: ['all damage 5 (except force, positive, or ghost touch)'],
  weaknesses: ['positive 10','sunlight'],
  speeds: { fly: 40 },
  attacks: [
    { name: 'Spectral Hand', bonus: 15, damage: '2d8+2 negative', traits: ['agile','finesse','incorporeal'], effects: ['Drain Life DC 22 Fort'] }
  ],
  actions: [
    { name: 'Drain Life', actions: 'passive', type: 'passive', description: 'On hit: DC 22 Fort or gain Drained 1 (stacks). At Drained 4: die and rise as wraith.' },
    { name: 'Create Spawn', actions: 'passive', type: 'passive', description: 'Humanoids killed by wraith rise as wraiths in 1 round.' }
  ],
  passives: ['Sunlight Powerlessness: Paralyzed in direct sunlight.','Phase Through: Move through solid obstacles at cost of 5 extra feet.'],
  source: { book: 'Monster Core', page: 337 }
});

_sb('Salamander', {
  level: 5, traits: ['elemental','fire'],
  perception: 12, senses: ['darkvision'],
  languages: ['Ignan'],
  skills: { Acrobatics: 11, Athletics: 13 },
  abilityMods: { str: 4, dex: 3, con: 4, int: 0, wis: 1, cha: 1 },
  ac: 22, saves: { fort: 15, ref: 12, will: 10 }, hp: 65,
  immunities: ['fire'],
  resistances: [],
  weaknesses: ['cold 5'],
  speeds: { land: 25 },
  attacks: [
    { name: 'Spear', bonus: 15, damage: '1d8+4 piercing plus 1d6 fire', traits: ['versatile S'] },
    { name: 'Tail', bonus: 15, damage: '1d6+4 fire', traits: ['agile','finesse'] }
  ],
  actions: [
    { name: 'Heat Aura', actions: 'passive', type: 'passive', description: 'All creatures adjacent at start of salamander\'s turn take 1d6 fire damage.' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 281 }
});

_sb('Manticore', {
  level: 5, traits: ['beast','manticore'],
  perception: 12, senses: ['darkvision','scent (imprecise) 30 ft'],
  languages: ['Common'],
  skills: { Acrobatics: 11, Athletics: 13, Intimidation: 13 },
  abilityMods: { str: 5, dex: 4, con: 3, int: 0, wis: 1, cha: 4 },
  ac: 22, saves: { fort: 14, ref: 13, will: 10 }, hp: 65,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 25, fly: 40 },
  attacks: [
    { name: 'Claw', bonus: 15, damage: '1d8+5 slashing', traits: ['agile'] },
    { name: 'Tail Spike', bonus: 15, damage: '1d8+5 piercing', traits: ['range 30 ft'] }
  ],
  actions: [
    { name: 'Spike Volley', actions: '2', type: 'action', description: 'Launch tail spikes at all creatures in a 10-ft burst within 30 ft. DC 22 Reflex or take 2d8+5 piercing. Usable 3/day.' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 239 }
});

_sb('Banshee', {
  level: 7, traits: ['ghost','incorporeal','spirit','undead'],
  perception: 17, senses: ['darkvision','lifesense 60 ft'],
  languages: ['Necril','Common'],
  skills: { Intimidation: 18, Stealth: 17 },
  abilityMods: { str: -3, dex: 6, con: 0, int: 1, wis: 4, cha: 8 },
  ac: 23, saves: { fort: 11, ref: 17, will: 17 }, hp: 100,
  immunities: ['death effects','disease','paralyzed','poison','unconscious'],
  resistances: ['all 5 (except force, positive, silver, ghost touch)'],
  weaknesses: ['positive 15','silver 10'],
  speeds: { fly: 40 },
  attacks: [
    { name: 'Ghostly Hand', bonus: 19, damage: '2d8+8 negative', traits: ['agile','finesse','incorporeal'] }
  ],
  actions: [
    { name: 'Wail', actions: '2', type: 'action', description: 'Ear-splitting shriek in 40-ft emanation. DC 25 Fort: fail = Drained 2d4; crit fail = immediately drops to dying 1.' },
    { name: 'Horrifying Visage', actions: '2', type: 'action', description: 'Reveal form. All non-undead in 60 ft: DC 25 Will or Frightened 2 (Paralyzed on crit fail).' }
  ],
  passives: ['Spiritual Bound: Tied to death location; can\'t travel more than 1 mile away.'],
  source: { book: 'Monster Core', page: 46, note: 'Banshee / Ghost variant' }
});

_sb('Chimera', {
  level: 7, traits: ['beast','chimera'],
  perception: 15, senses: ['darkvision','scent (imprecise) 30 ft'],
  languages: ['Draconic'],
  skills: { Athletics: 17, Intimidation: 13 },
  abilityMods: { str: 6, dex: 3, con: 5, int: -2, wis: 2, cha: 2 },
  ac: 24, saves: { fort: 16, ref: 14, will: 13 }, hp: 110,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 25, fly: 40 },
  attacks: [
    { name: 'Dragon Head', bonus: 18, damage: '2d6+6 piercing plus 1d6 type', traits: [] },
    { name: 'Lion Head', bonus: 18, damage: '2d8+6 piercing', traits: [] },
    { name: 'Goat Head', bonus: 18, damage: '2d6+6 piercing', traits: [] }
  ],
  actions: [
    { name: 'Three Heads', actions: '2', type: 'action', description: 'Make one attack with each of the three heads.' },
    { name: 'Breath Weapon', actions: '2', type: 'action', description: '30-ft cone. Type depends on dragon head variant: fire/cold/acid/lightning/poison. DC 25 Reflex: 7d6 typed damage.' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 66 }
});

_sb('Sphinx', {
  level: 8, traits: ['beast','sphinx'],
  perception: 17, senses: ['darkvision','true seeing'],
  languages: ['Common','Draconic','Ancient Osiriani'],
  skills: { Arcana: 19, Diplomacy: 17, Intimidation: 17, Occultism: 19 },
  abilityMods: { str: 5, dex: 3, con: 3, int: 6, wis: 3, cha: 5 },
  ac: 26, saves: { fort: 15, ref: 15, will: 19 }, hp: 115,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 30, fly: 50 },
  attacks: [
    { name: 'Claw', bonus: 18, damage: '2d8+5 slashing', traits: ['agile'] }
  ],
  actions: [
    { name: 'Riddling Question', actions: '1', type: 'action', description: 'Ask riddle. If creature fails DC 26 Will within 1 hour, they become Stupefied 2 for 24 hours.' },
    { name: 'Innate Spells', actions: 'passive', type: 'passive', description: 'Arcane: Clairvoyance (×1/day), Dispel Magic (×3/day), True Seeing (at will).' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 313 }
});

_sb('Vampire Count', {
  level: 8, traits: ['undead','vampire'],
  perception: 17, senses: ['darkvision'],
  languages: ['Common','Necril','Abyssal'],
  skills: { Athletics: 16, Deception: 17, Diplomacy: 15, Intimidation: 17, Society: 15, Stealth: 16 },
  abilityMods: { str: 5, dex: 6, con: 3, int: 3, wis: 5, cha: 7 },
  ac: 27, saves: { fort: 13, ref: 18, will: 17 }, hp: 120,
  immunities: ['death effects','disease','paralyzed','poison','unconscious'],
  resistances: [],
  weaknesses: ['sunlight 3/round','stake through heart','running water','positive 15'],
  speeds: { land: 35, climb: 35 },
  attacks: [
    { name: 'Fangs', bonus: 20, damage: '2d6+5 piercing', traits: [], effects: ['Drink Blood','Enfeebling Bite DC 25 Fort'] },
    { name: 'Claw', bonus: 20, damage: '2d4+5 slashing', traits: ['agile'], effects: ['Grab'] }
  ],
  actions: [
    { name: 'Drink Blood', actions: '1', type: 'action', description: 'Requirement: creature grabbed. Automatic hit: 2d4+5 piercing + 2d6 negative. Gained +1 Drained.' },
    { name: 'Dominate', actions: '2', type: 'action', description: 'Visual. Range 30 ft. DC 26 Will. Fail: under control (incapacitation). Lasts until dawn.' },
    { name: 'Mist Form', actions: '2', type: 'action', description: 'Transform to gaseous mist (Speed 25 ft fly). Cannot attack. 1/day.' }
  ],
  passives: ['Shapeshifting: Can turn into a wolf or swarm of bats as 2-action activity.'],
  source: { book: 'Monster Core', page: 324 }
});

// ═══════════════════════════════════════════════════════════════════════════
// LEVEL 9–12
// ═══════════════════════════════════════════════════════════════════════════

_sb('Roc', {
  level: 9, traits: ['animal','bird'],
  perception: 19, senses: ['low-light vision'],
  languages: [],
  skills: { Acrobatics: 16, Athletics: 22, Stealth: 11 },
  abilityMods: { str: 9, dex: 3, con: 5, int: -4, wis: 4, cha: 0 },
  ac: 28, saves: { fort: 22, ref: 18, will: 17 }, hp: 155,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 20, fly: 60 },
  attacks: [
    { name: 'Talon', bonus: 22, damage: '2d10+9 slashing', traits: [], effects: ['Grab'] },
    { name: 'Beak', bonus: 22, damage: '2d8+9 piercing', traits: ['deadly 2d10'] }
  ],
  actions: [
    { name: 'Snatch', actions: '1', type: 'action', description: 'Fly up to 25 ft carrying a grabbed Medium or smaller creature. Can drop creature to deal fall damage.' },
    { name: 'Knockdown', actions: 'passive', type: 'passive', description: 'Creature hit by Talon must succeed DC 28 Reflex or be knocked Prone.' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 275, note: 'Roc, Huge creature' }
});

_sb('Stone Giant', {
  level: 8, traits: ['earth','giant'],
  perception: 16, senses: ['darkvision'],
  languages: ['Common','Jotun'],
  skills: { Athletics: 22, Crafting: 16, Stealth: 13 },
  abilityMods: { str: 7, dex: 1, con: 5, int: 0, wis: 3, cha: 0 },
  ac: 25, saves: { fort: 19, ref: 13, will: 17 }, hp: 130,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 35 },
  attacks: [
    { name: 'Greatclub', bonus: 20, damage: '2d10+7 bludgeoning', traits: ['backswing','shove'] },
    { name: 'Rock', bonus: 20, damage: '2d6+7 bludgeoning', traits: ['range increment 40 ft'] }
  ],
  actions: [
    { name: 'Rock Catching', actions: 'R', type: 'reaction', description: 'Trigger: A rock or boulder is thrown at you. DC 21 Reflex: catch it. Next turn: throw it back.' },
    { name: 'Throw Rock', actions: '2', type: 'action', description: 'Throw boulder up to 80 ft: +20 to hit, 4d6+7 bludgeoning, Large rocks deal +2d6.' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 179 }
});

_sb('Purple Worm', {
  level: 11, traits: ['animal','worm'],
  perception: 17, senses: ['darkvision','tremorsense (precise) 100 ft'],
  languages: [],
  skills: { Athletics: 26 },
  abilityMods: { str: 9, dex: -2, con: 8, int: -5, wis: 0, cha: -4 },
  ac: 30, saves: { fort: 25, ref: 15, will: 19 }, hp: 200,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 35, burrow: 25, swim: 20 },
  attacks: [
    { name: 'Jaws', bonus: 26, damage: '3d8+9 piercing', traits: ['deadly 2d10'], effects: ['Swallow Whole'] },
    { name: 'Stinger', bonus: 26, damage: '2d6+9 piercing', traits: ['agile','poison'], effects: ['Venom DC 30 Fort: 4d6 poison on fail'] }
  ],
  actions: [
    { name: 'Swallow Whole', actions: '1', type: 'action', description: 'Large or smaller grabbed creature. DC 28 Reflex or swallowed. Inside: 3d6 bludgeoning + 3d6 acid per round. Break free: DC 28 Athletics.' },
    { name: 'Bore Through Stone', actions: '2', type: 'action', description: 'Burrow through solid stone at full burrow speed, leaving a 10-ft-wide tunnel.' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 271 }
});

_sb('Medusa', {
  level: 7, traits: ['humanoid','medusa'],
  perception: 15, senses: ['darkvision'],
  languages: ['Common','Undercommon'],
  skills: { Acrobatics: 15, Deception: 16, Stealth: 15 },
  abilityMods: { str: 3, dex: 5, con: 2, int: 2, wis: 3, cha: 6 },
  ac: 24, saves: { fort: 13, ref: 16, will: 14 }, hp: 95,
  immunities: ['petrified'],
  resistances: [],
  weaknesses: [],
  speeds: { land: 30 },
  attacks: [
    { name: 'Snake', bonus: 18, damage: '2d4+5 piercing', traits: ['agile','finesse'], effects: ['Venom DC 25 Fort'] },
    { name: 'Shortbow', bonus: 18, damage: '1d6+7 piercing', traits: ['range 60 ft','deadly d10'] }
  ],
  actions: [
    { name: 'Petrifying Gaze', actions: '1', type: 'action', description: 'Range 30 ft. Target that is looking at you: DC 25 Fortitude. Fail = Slowed 1 for 1 minute. Two failures in 24 hrs = Petrified.' },
    { name: 'Blinding Gaze', actions: '2', type: 'action', description: 'Target within 30 ft: DC 25 Fort or Blinded 1 round (Permanent Blinded on crit fail).' }
  ],
  passives: ['Snake Venom: DC 25 Fort. Fail = 2d6 poison + Clumsy 1 for 6 rounds.'],
  source: { book: 'Monster Core', page: 242 }
});

// ═══════════════════════════════════════════════════════════════════════════
// LEVEL 12–16
// ═══════════════════════════════════════════════════════════════════════════

_sb('Androsphinx', {
  level: 12, traits: ['beast','sphinx'],
  perception: 23, senses: ['darkvision','true seeing'],
  languages: ['Common','Draconic','Ancient Osiriani','Sphinx'],
  skills: { Arcana: 24, Diplomacy: 22, Intimidation: 22, Occultism: 24, Religion: 24 },
  abilityMods: { str: 6, dex: 3, con: 4, int: 7, wis: 5, cha: 7 },
  ac: 33, saves: { fort: 22, ref: 21, will: 27 }, hp: 200,
  immunities: [], resistances: [], weaknesses: [],
  speeds: { land: 35, fly: 60 },
  attacks: [
    { name: 'Claw', bonus: 25, damage: '2d10+6 slashing', traits: ['agile'] }
  ],
  actions: [
    { name: 'Roar', actions: '2', type: 'action', description: '60-ft emanation. DC 33 Will. Fail = Frightened 2; Crit Fail = Paralyzed 1 round then Frightened 3.' },
    { name: 'Innate Spells', actions: 'passive', type: 'passive', description: 'Divine: Dispel Magic (×3/day), True Seeing (at will), Restoration (×1/day), Heal (×3/day), Remove Curse (×1/day).' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 313, note: 'Androsphinx variant' }
});

_sb('Storm Giant', {
  level: 13, traits: ['air','giant'],
  perception: 25, senses: ['darkvision','storm sight'],
  languages: ['Common','Jotun','Auran'],
  skills: { Athletics: 28, Intimidation: 24, Nature: 24 },
  abilityMods: { str: 9, dex: 3, con: 6, int: 3, wis: 6, cha: 5 },
  ac: 33, saves: { fort: 25, ref: 22, will: 25 }, hp: 230,
  immunities: ['electricity'],
  resistances: [],
  weaknesses: [],
  speeds: { land: 40, fly: 60, swim: 40 },
  attacks: [
    { name: 'Greatsword', bonus: 28, damage: '4d6+9 slashing plus 2d6 electricity', traits: ['versatile P'] },
    { name: 'Lightning Bolt', bonus: 26, damage: '3d12 electricity', traits: ['range 120 ft'] }
  ],
  actions: [
    { name: 'Lightning Rod', actions: 'R', type: 'reaction', description: 'Trigger: Struck by lightning. Redirect bolt at any target in 120 ft: +28 to hit, 3d12 electricity.' },
    { name: 'Call Storm', actions: '3', type: 'action', description: 'Summon lightning storm in 120-ft radius. Lasts 1 hour. +2d6 electricity to all attacks; automatic lightning every 1d4 rounds in area.' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 179 }
});

_sb('Lich (Wizard)', {
  level: 16, traits: ['humanoid','lich','undead','wizard'],
  perception: 30, senses: ['darkvision','true seeing'],
  languages: ['Abyssal','Common','Draconic','Infernal','Necril','Thassilonian'],
  skills: { Arcana: 32, Deception: 26, Intimidation: 26, Occultism: 32, Stealth: 26 },
  abilityMods: { str: 0, dex: 4, con: 0, int: 9, wis: 6, cha: 6 },
  ac: 39, saves: { fort: 24, ref: 26, will: 32 }, hp: 200,
  immunities: ['death effects','disease','paralyzed','poison','unconscious'],
  resistances: ['cold 15','electricity 15'],
  weaknesses: ['positive 15'],
  speeds: { land: 25 },
  attacks: [
    { name: 'Hand', bonus: 26, damage: '3d8 negative', traits: [], effects: ['Paralyzing Touch DC 37 Fort: Paralyzed (save end of each turn)'] }
  ],
  actions: [
    { name: 'Phylactery', actions: 'passive', type: 'passive', description: 'If destroyed while phylactery intact, reform next to phylactery in 1d10 days at full HP.' },
    { name: 'Innate Spells (10th)', actions: 'passive', type: 'passive', description: 'Arcane: Up to 8th-rank. Typical: Disintegrate, Power Word Kill, Chain Lightning, Maze, Finger of Death, Time Stop.' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 225, note: 'Lich Wizard statblock' }
});

// ═══════════════════════════════════════════════════════════════════════════
// LEVEL 17–20
// ═══════════════════════════════════════════════════════════════════════════

_sb('Ancient Gold Dragon', {
  level: 17, traits: ['dragon','fire'],
  perception: 33, senses: ['darkvision','scent (imprecise) 60 ft','true seeing'],
  languages: ['Common','Draconic','Elven','Sylvan'],
  skills: { Arcana: 32, Athletics: 35, Diplomacy: 32, Intimidation: 32 },
  abilityMods: { str: 9, dex: 3, con: 8, int: 7, wis: 6, cha: 8 },
  ac: 40, saves: { fort: 33, ref: 30, will: 31 }, hp: 325,
  immunities: ['fire','paralyzed','sleep'],
  resistances: [],
  weaknesses: ['cold 15'],
  speeds: { land: 60, fly: 120 },
  attacks: [
    { name: 'Jaws', bonus: 35, damage: '4d10+9 piercing plus 3d6 fire', traits: ['reach 15 ft'] },
    { name: 'Claw', bonus: 35, damage: '4d6+9 slashing', traits: ['agile','reach 10 ft'] },
    { name: 'Tail', bonus: 33, damage: '4d8+9 bludgeoning', traits: ['reach 20 ft'] }
  ],
  actions: [
    { name: 'Breath Weapon (Fire)', actions: '2', type: 'action', description: '60-ft cone of fire. DC 43 Reflex: 18d6 fire on fail, half on success. Recharge 1d4 rounds.' },
    { name: 'Weakening Breath', actions: '2', type: 'action', description: 'Cone of weakness: DC 43 Fort or gain Weakness 10 to physical damage for 1 minute.' },
    { name: 'Draconic Momentum', actions: 'passive', type: 'passive', description: 'On any critical hit: recharge Breath Weapon immediately.' }
  ],
  passives: ['Dragon Abilities: Frightful Presence DC 38, Legendary Actions ×3/round.'],
  source: { book: 'Monster Core', page: 107 }
});

_sb('Demon Lord (Unique)', {
  level: 20, traits: ['demon','fiend','unique'],
  perception: 38, senses: ['darkvision','true seeing','truespeech'],
  languages: ['Abyssal','Common','Draconic','all languages via Truespeech'],
  skills: { Athletics: 40, Deception: 38, Intimidation: 40, Occultism: 34, Religion: 36 },
  abilityMods: { str: 10, dex: 7, con: 9, int: 6, wis: 8, cha: 10 },
  ac: 47, saves: { fort: 36, ref: 35, will: 38 }, hp: 400,
  immunities: ['death effects','disease','electricity','fire','poison'],
  resistances: ['cold 20','physical (except cold iron and silver) 20'],
  weaknesses: ['cold iron 20','holy 20'],
  speeds: { land: 50, fly: 80, teleport: 'at will' },
  attacks: [
    { name: 'Claw', bonus: 40, damage: '4d12+10 slashing plus 2d6 unholy', traits: ['agile','evil','magical'] },
    { name: 'Tail', bonus: 40, damage: '4d8+10 bludgeoning', traits: ['evil','magical','reach 20 ft'] }
  ],
  actions: [
    { name: 'Mythic Resilience', actions: 'passive', type: 'passive', description: 'Reduces all damage taken by 20. Cannot be reduced below 1 HP from any single hit.' },
    { name: 'Abyssal Command', actions: '1', type: 'action', description: 'Command any demon within 500 ft (no save). Legions obey.' },
    { name: 'Legendary Actions', actions: 'passive', type: 'passive', description: '3 additional actions per round that can be taken outside the Demon Lord\'s turn.' }
  ],
  passives: [],
  source: { book: 'Monster Core', page: 83, note: 'Generic Demon Lord framework; see specific lords in supplements' }
});

_sb('Runelord Ascendant', {
  level: 20, traits: ['human','humanoid','unique','wizard'],
  perception: 36, senses: ['true seeing'],
  languages: ['Common','Draconic','Ancient Thassilonian','Abyssal','Infernal'],
  skills: { Arcana: 40, Deception: 36, Intimidation: 36, Occultism: 38 },
  abilityMods: { str: 3, dex: 5, con: 4, int: 10, wis: 7, cha: 8 },
  ac: 43, saves: { fort: 30, ref: 33, will: 37 }, hp: 320,
  immunities: ['school-specific immunity (varies)'],
  resistances: ['all elemental damage 20 (based on rune school)'],
  weaknesses: [],
  speeds: { land: 30, fly: 'via spell' },
  attacks: [
    { name: 'Rune-Carved Staff', bonus: 36, damage: '3d6+3 bludgeoning plus 3d6 sin-typed', traits: ['magical','reach'] }
  ],
  actions: [
    { name: 'Runic Empowerment', actions: 'passive', type: 'passive', description: 'Deals extra +2 damage dice on all spells of school specialty.' },
    { name: 'Sin Spells (10th)', actions: 'passive', type: 'passive', description: 'Access to all spells of sin tradition. 3 10th-rank slots, 3 9th-rank slots per day.' }
  ],
  passives: ['School of Sin determines specific abilities: Greed (Transmutation), Lust (Enchantment), Sloth (Conjuration), etc.'],
  source: { book: 'Pathfinder Adventure Path: Rise of the Runelords', page: 'varies by Runelord', note: 'Original AP + Remaster stats from GM Core' }
});

// ─── Lookup function ──────────────────────────────────────────────────────
function getStatBlock(name) {
  return STAT_BLOCKS[name] || null;
}

function getStatBlockFuzzy(name) {
  if (STAT_BLOCKS[name]) return STAT_BLOCKS[name];
  const lower = name.toLowerCase();
  const key = Object.keys(STAT_BLOCKS).find(k => k.toLowerCase() === lower);
  return key ? STAT_BLOCKS[key] : null;
}

if (typeof module !== 'undefined') module.exports = { STAT_BLOCKS, getStatBlock, getStatBlockFuzzy };
