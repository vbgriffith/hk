/**
 * data/loot.js -- Build 7
 * PF2e Remaster Treasure & Loot Generator Data
 * Based on GM Core treasure-by-level guidelines (Table 10-9 / 10-10)
 */

const LOOT_DATA = (function() {
  'use strict';

  // ── Currency parcels by level (gold pieces, per PC per level) ────────────
  // Source: GM Core p.508 -- total wealth per level, split into parcels
  const CURRENCY_BY_LEVEL = {
    1:  { total: 175,  parcels: [40, 35, 50, 50] },
    2:  { total: 300,  parcels: [70, 60, 80, 90] },
    3:  { total: 500,  parcels: [120,100,130,150] },
    4:  { total: 860,  parcels: [200,175,225,260] },
    5:  { total: 1300, parcels: [300,275,350,375] },
    6:  { total: 2000, parcels: [450,400,550,600] },
    7:  { total: 2900, parcels: [650,600,800,850] },
    8:  { total: 4000, parcels: [900,850,1100,1150]},
    9:  { total: 5700, parcels: [1300,1200,1600,1600]},
    10: { total: 8000, parcels: [1800,1700,2200,2300]},
    11: { total: 11500,parcels: [2600,2500,3200,3200]},
    12: { total: 16500,parcels: [3700,3500,4600,4700]},
    13: { total: 25000,parcels: [5600,5200,7000,7200]},
    14: { total: 36500,parcels: [8200,7800,10200,10300]},
    15: { total: 54500,parcels: [12300,11500,15200,15500]},
    16: { total: 82500,parcels: [18500,17500,23000,23500]},
    17: { total: 128000,parcels:[28800,27200,35800,36200]},
    18: { total: 208000,parcels:[46800,44200,58000,59000]},
    19: { total: 355000,parcels:[80000,75000,99000,101000]},
    20: { total: 490000,parcels:[110000,105000,136000,139000]},
  };

  // ── Permanent item tables by level ───────────────────────────────────────
  // Structured as: { level, rarity, category, name, traits, description, price }
  const PERMANENT_ITEMS = {
    // Level 1-2
    low: [
      { level:1, rarity:'common', cat:'weapon',     name:'+1 Striking Handwraps',      traits:['invested','magical'],      desc:'Unarmed attacks gain the striking rune benefit (+1 damage die).',         price:'35 gp' },
      { level:1, rarity:'common', cat:'armor',      name:'Explorer\'s Clothing +1',    traits:['invested','magical'],      desc:'+1 item bonus to AC. Light armor. Comfortable for long travel.',          price:'160 gp' },
      { level:1, rarity:'common', cat:'accessory',  name:'Cloak of Elvenkind',         traits:['invested','magical'],      desc:'+1 circumstance bonus to Stealth; become invisible 1/day (1 min).',       price:'500 gp' },
      { level:1, rarity:'common', cat:'consumable',  name:'Healing Potion (Minor)',     traits:['consumable','healing','magical','potion'], desc:'Restore 1d8 HP.',                                             price:'4 gp' },
      { level:2, rarity:'common', cat:'weapon',     name:'Flaming Sword +1',           traits:['fire','magical'],          desc:'+1 weapon. +1d6 fire damage on a hit.',                                   price:'360 gp' },
      { level:2, rarity:'common', cat:'skill',      name:'Climbing Kit',               traits:['exploration'],             desc:'+2 circumstance bonus to Athletics checks to Climb.',                    price:'5 gp' },
      { level:2, rarity:'common', cat:'accessory',  name:'Ring of Feather Falling',    traits:['invested','magical'],      desc:'As the feather fall spell (1 min) when you start falling.',              price:'450 gp' },
      { level:2, rarity:'uncommon',cat:'weapon',    name:'Returning Dagger +1',        traits:['magical','thrown'],        desc:'+1 dagger. Returns to hand after a ranged Strike.',                       price:'360 gp' },
    ],
    // Level 3-5
    mid_low: [
      { level:3, rarity:'common', cat:'armor',      name:'Resilient Leather +1',       traits:['invested','magical'],      desc:'+1 item bonus to saving throws. Light armor.',                            price:'340 gp' },
      { level:3, rarity:'common', cat:'weapon',     name:'Frost Shortbow +1',          traits:['cold','magical'],          desc:'+1 shortbow. +1d6 cold damage on hit.',                                   price:'370 gp' },
      { level:3, rarity:'uncommon',cat:'accessory', name:'Boots of Elvenkind',         traits:['invested','magical'],      desc:'+1 circumstance to Acrobatics; ignore difficult terrain (forests).',      price:'450 gp' },
      { level:3, rarity:'common', cat:'wand',       name:'Wand of Heal (1st)',         traits:['healing','magical','wand'],desc:'Cast heal as a 1st-rank spell 1/day (regain on a roll of 1).',           price:'60 gp' },
      { level:4, rarity:'common', cat:'armor',      name:'Breastplate +1',             traits:['invested','magical'],      desc:'+1 item bonus to AC. Medium armor.',                                      price:'160 gp' },
      { level:4, rarity:'uncommon',cat:'weapon',    name:'Dancing Sword +1',           traits:['magical'],                 desc:'+1 longsword. Spend 2 actions to have it fight independently for 4 rds.', price:'500 gp' },
      { level:4, rarity:'common', cat:'accessory',  name:'Amulet of Natural Armor +1', traits:['invested','magical'],      desc:'+1 item bonus to AC.',                                                    price:'160 gp' },
      { level:5, rarity:'common', cat:'weapon',     name:'+2 Striking Dagger',         traits:['agile','finesse','magical'],desc:'Two damage dice (2d4). +2 item bonus to attack rolls.',                  price:'1000 gp'},
      { level:5, rarity:'common', cat:'armor',      name:'Resilient Full Plate +1',    traits:['invested','magical'],      desc:'+1 to attack rolls and saves. Heavy armor.',                              price:'1060 gp'},
      { level:5, rarity:'uncommon',cat:'accessory', name:'Bracers of Armor II',        traits:['invested','magical'],      desc:'+2 item bonus to AC while unarmored.',                                    price:'1000 gp'},
    ],
    // Level 6-9
    mid: [
      { level:6, rarity:'common', cat:'weapon',     name:'+2 Striking Rapier',         traits:['deadly d8','disarm','finesse','magical'], desc:'Two damage dice. +2 attack.',                               price:'1000 gp'},
      { level:6, rarity:'uncommon',cat:'wand',      name:'Wand of Heal (3rd)',          traits:['healing','magical','wand'],desc:'Cast heal as a 3rd-rank spell 1/day.',                                   price:'360 gp'},
      { level:6, rarity:'common', cat:'skill',      name:'Headband of Inspired Wisdom', traits:['invested','magical'],      desc:'+2 item bonus to Perception and Survival.',                              price:'1000 gp'},
      { level:7, rarity:'common', cat:'armor',      name:'Resilient Breastplate +2',   traits:['invested','magical'],      desc:'+2 item bonus to AC and saving throws.',                                  price:'1060 gp'},
      { level:7, rarity:'uncommon',cat:'weapon',    name:'Thundering Longbow +2',      traits:['magical','sonic'],         desc:'+2 longbow. Critical: target deafened (Fort DC 24).',                    price:'1100 gp'},
      { level:8, rarity:'common', cat:'weapon',     name:'+2 Greater Striking Sword',  traits:['magical','versatile p'], desc:'Three damage dice. +2 attack. Versatile (piercing).',                      price:'2000 gp'},
      { level:8, rarity:'uncommon',cat:'accessory', name:'Ring of Wizardry (Type II)', traits:['invested','magical'],      desc:'+1 extra spell slot at 4th rank or lower per day.',                      price:'2500 gp'},
      { level:9, rarity:'common', cat:'armor',      name:'Fortification Plate +2',     traits:['invested','magical'],      desc:'+2 to AC/saves. 25% chance to negate crits (fortification rune).',        price:'2460 gp'},
      { level:9, rarity:'uncommon',cat:'weapon',    name:'Vorpal Longsword +2',        traits:['deadly d12','magical'],    desc:'+2 longsword. Critical at 18-20 on death saves: decapitate.',             price:'8000 gp'},
    ],
    // Level 10-14
    high: [
      { level:10,rarity:'common', cat:'weapon',     name:'+3 Greater Striking Battleaxe',traits:['magical'],               desc:'Three damage dice. +3 attack. Sweep trait.',                              price:'9000 gp'},
      { level:10,rarity:'uncommon',cat:'accessory', name:'Boots of Speed',             traits:['invested','magical'],      desc:'+10 ft Speed; Haste 1/day (1 min).',                                     price:'9000 gp'},
      { level:11,rarity:'common', cat:'armor',      name:'Resilient Full Plate +3',    traits:['invested','magical'],      desc:'+3 item bonus to AC and saves. Heavy armor.',                             price:'10160 gp'},
      { level:11,rarity:'rare',   cat:'weapon',     name:'Oathbow +3',                 traits:['magical'],                 desc:'+3 longbow. Sworn enemy: +4d6 bonus, enemy can\'t benefit from concealment.', price:'18000 gp'},
      { level:12,rarity:'common', cat:'weapon',     name:'+3 Striking Staff of Fire',  traits:['fire','magical','staff'],  desc:'+3 staff. Cast burning hands (1st), fireball (3rd) using charges.',      price:'13500 gp'},
      { level:13,rarity:'uncommon',cat:'accessory', name:'Belt of Giant Strength',     traits:['invested','magical'],      desc:'+4 item bonus to Athletics checks; increase Bulk limit by 2.',            price:'25000 gp'},
      { level:14,rarity:'common', cat:'weapon',     name:'+3 Major Striking Sword',    traits:['magical'],                 desc:'Four damage dice. +3 attack.',                                            price:'35000 gp'},
      { level:14,rarity:'rare',   cat:'accessory',  name:'Mantle of the Magister',     traits:['invested','magical'],      desc:'+2 item bonus to spell DCs and spell attack rolls.',                     price:'45000 gp'},
    ],
    // Level 15-20
    legendary: [
      { level:15,rarity:'uncommon',cat:'weapon',    name:'+3 Major Striking Flaming Burst Bow',traits:['fire','magical'],  desc:'Four damage dice, +3. Critical: 2d10 persistent fire splash.',            price:'65000 gp'},
      { level:16,rarity:'uncommon',cat:'armor',     name:'Celestial Armor +3',         traits:['good','invested','light','magical'], desc:'+3 light armor. Fly 40 ft (wings) 1/day.',               price:'85000 gp'},
      { level:17,rarity:'rare',   cat:'weapon',     name:'Disrupting +3 Mace',         traits:['good','magical'],          desc:'+3 mace. Undead take 2d6 extra good damage; crit: DC 25 Fort or destroyed.',price:'150000 gp'},
      { level:18,rarity:'rare',   cat:'accessory',  name:'Scarab of Protection',       traits:['abjuration','invested','magical'], desc:'+5 resistance to negative energy; negate magic once per day.', price:'200000 gp'},
      { level:19,rarity:'rare',   cat:'weapon',     name:'Holy Avenger +3',            traits:['good','holy','magical'],   desc:'+3 major striking sword. Paladins gain lay on hands (7th rank) 1/day.',  price:'350000 gp'},
      { level:20,rarity:'rare',   cat:'armor',      name:'Armor of the Gods +4',       traits:['divine','invested','magical'], desc:'+4 AC/saves. Cast air walk and freedom of movement at will.',       price:'500000 gp'},
    ],
  };

  // ── Consumables by level ─────────────────────────────────────────────────
  const CONSUMABLES = {
    low: [
      { level:1, name:'Healing Potion (Minor)',    desc:'1d8 HP',               price:'4 gp',   type:'potion' },
      { level:1, name:'Antidote (Minor)',           desc:'Counteract poison (1st rank)',          price:'3 gp',   type:'elixir' },
      { level:1, name:'Alchemist\'s Fire (Lesser)', desc:'1d8 fire + 1 persistent fire',         price:'3 gp',   type:'bomb' },
      { level:2, name:'Healing Potion (Lesser)',   desc:'2d8+5 HP',             price:'12 gp',  type:'potion' },
      { level:2, name:'Bottled Lightning (Lesser)',desc:'1d8 electricity + flat-footed 1 rd',    price:'3 gp',   type:'bomb' },
      { level:2, name:'Oil of Potency',             desc:'+1 item bonus to attacks (1 min)',      price:'20 gp',  type:'oil' },
      { level:3, name:'Invisibility Potion',        desc:'Invisible for 5 min (disrupted on act)',price:'20 gp', type:'potion' },
      { level:3, name:'Darkvision Elixir (Lesser)',desc:'Darkvision for 1 hour',                 price:'12 gp',  type:'elixir' },
    ],
    mid: [
      { level:4, name:'Healing Potion (Moderate)', desc:'3d8+10 HP',            price:'50 gp',  type:'potion' },
      { level:5, name:'Potion of Flying',           desc:'Fly 25 ft for 5 min', price:'100 gp', type:'potion' },
      { level:5, name:'Antiplague (Moderate)',      desc:'Counteract disease (3rd rank)',         price:'50 gp',  type:'elixir' },
      { level:6, name:'Healing Potion (Greater)',  desc:'6d8+20 HP',            price:'200 gp', type:'potion' },
      { level:7, name:'Potion of Heroism',          desc:'+1 status to attacks/saves/skills (10 min)',price:'300 gp',type:'potion'},
      { level:8, name:'Bottled Lightning (Greater)',desc:'3d8 electricity + flat-footed 2 rds',  price:'40 gp',  type:'bomb' },
    ],
    high: [
      { level:9, name:'Healing Potion (Major)',    desc:'8d8+30 HP',            price:'600 gp', type:'potion' },
      { level:10,name:'Elixir of Life (Major)',    desc:'8d6+30 HP + counteract disease/poison (7th)', price:'600 gp',type:'elixir'},
      { level:11,name:'Potion of True Seeing',     desc:'True seeing for 1 min',price:'2000 gp',type:'potion' },
      { level:12,name:'Healing Potion (True)',     desc:'10d8+40 HP',           price:'2000 gp',type:'potion' },
      { level:14,name:'Potion of Extraordinary Healing',desc:'6d8+50 HP',      price:'4500 gp',type:'potion' },
      { level:16,name:'Potion of Godhood',         desc:'+3 status all checks, flight 40 ft (1 hr)',price:'30000 gp',type:'potion'},
    ],
  };

  // ── Themed item pools (supplement by campaign theme) ─────────────────────
  const THEME_ITEMS = {
    undead: [
      { level:3, rarity:'uncommon', cat:'accessory', name:'Amulet of Protection vs. Undead', traits:['abjuration','invested'], desc:'+2 circumstance bonus to saves vs. undead abilities.', price:'400 gp' },
      { level:5, rarity:'uncommon', cat:'weapon',    name:'Ghost Touch Sword +1',   traits:['magical'],   desc:'+1 sword. Affects incorporeal creatures as if they were corporeal.',    price:'500 gp' },
      { level:7, rarity:'rare',     cat:'accessory', name:'Phylactery of Faithfulness', traits:['divine','invested'], desc:'Warn wearer before any evil act; +1 to resist fear/undead effects.',price:'2500 gp'},
    ],
    arcane: [
      { level:4, rarity:'uncommon', cat:'accessory', name:'Goggles of Night',        traits:['invested','magical'],  desc:'+2 item bonus to Perception in darkness; darkvision.',              price:'900 gp' },
      { level:6, rarity:'uncommon', cat:'wand',      name:'Wand of Magic Missile (5th)',traits:['magical','wand'],   desc:'Cast magic missile as 5th-rank spell 1/day (five missiles).',       price:'640 gp' },
      { level:8, rarity:'rare',     cat:'accessory', name:'Arcane Grimoire',          traits:['invested','magical'], desc:'Store 10 extra spells; once per day, cast one without expending a spell slot.',price:'5000 gp'},
    ],
    divine: [
      { level:3, rarity:'common',   cat:'accessory', name:'Holy Symbol (Silver)',     traits:['divine'],              desc:'+1 bonus to Religion checks; focus point for divine casters.',       price:'20 gp' },
      { level:5, rarity:'uncommon', cat:'weapon',    name:'Disrupting Mace +1',       traits:['good','magical'],      desc:'+1 mace. Undead take 2d6 extra good damage; crit: DC 19 Fort or destroyed.',price:'900 gp'},
      { level:8, rarity:'rare',     cat:'armor',     name:'Sanctified Plate +2',      traits:['divine','invested'],   desc:'+2 plate. Heal 1d6 HP at start of each turn when you have temp HP.',  price:'3500 gp'},
    ],
    nature: [
      { level:3, rarity:'common',   cat:'accessory', name:'Feather Token (Bird)',     traits:['conjuration'],         desc:'Summon a Tiny bird that serves as a familiar for 24 hours.',         price:'60 gp' },
      { level:5, rarity:'uncommon', cat:'armor',     name:'Wild Druid\'s Vestments',  traits:['invested','primal'],   desc:'+1 armor bonus in wild shape; maintain equipment during transformation.',price:'1000 gp'},
      { level:7, rarity:'uncommon', cat:'weapon',    name:'Vine Staff +2',            traits:['magical','plant'],     desc:'+2 staff. Cast entangle and wall of thorns using charges.',           price:'1300 gp'},
    ],
    urban: [
      { level:2, rarity:'uncommon', cat:'accessory', name:'Hat of Disguise',          traits:['illusion','invested'], desc:'Change appearance to any humanoid 1/day (lasts until dismissed).',    price:'360 gp' },
      { level:4, rarity:'uncommon', cat:'accessory', name:'Thieves\' Tools (Infiltrator)', traits:['exploration'],   desc:'+2 item bonus to Thievery. Open locks and disarm traps without a crit fail on ordinary locks.',price:'750 gp'},
      { level:6, rarity:'rare',     cat:'accessory', name:'Circlet of Persuasion',    traits:['enchantment','invested'], desc:'+3 item bonus to Deception, Diplomacy, Intimidation.',             price:'2000 gp'},
    ],
    planar: [
      { level:5, rarity:'rare',     cat:'accessory', name:'Cube of Force',            traits:['abjuration','invested'], desc:'Create a cube of force in any of 5 configurations; 36 charges.',    price:'2000 gp'},
      { level:8, rarity:'rare',     cat:'weapon',    name:'Planar Ribbon +2',         traits:['conjuration','magical'], desc:'+2 sword. On crit: target plane shifted (Will DC 26 negates).',    price:'5000 gp'},
      { level:10,rarity:'rare',     cat:'accessory', name:'Amulet of the Planes',     traits:['conjuration','invested'], desc:'Plane shift 1/day to a random plane (no destination control).',    price:'9000 gp'},
    ],
    political: [
      { level:3, rarity:'uncommon', cat:'accessory', name:'Brooch of Shielding',      traits:['abjuration','invested'], desc:'Absorb up to 50 HP from magic missiles before being destroyed.',    price:'400 gp' },
      { level:5, rarity:'uncommon', cat:'accessory', name:'Signet Ring (Faction)',     traits:['invested'],              desc:'Mark of authority; +2 circumstance to Intimidation vs. faction enemies.', price:'100 gp'},
      { level:7, rarity:'rare',     cat:'accessory', name:'Robe of Scintillating Colors', traits:['illusion','invested'],desc:'Once activated: dazzle everyone within 30 ft (1 rnd). Blinded on crit fail.', price:'2500 gp'},
    ],
    ancient: [
      { level:4, rarity:'uncommon', cat:'accessory', name:'Deciphering Lens',         traits:['divination','invested'], desc:'+3 item bonus to Decipher Writing; read any written language 1/day.', price:'900 gp'},
      { level:6, rarity:'rare',     cat:'accessory', name:'Ioun Stone (Dusty Rose Prism)',traits:['invested','magical'],'desc':'See in magical darkness; +2 bonus to Perception checks.', price:'2000 gp'},
      { level:9, rarity:'rare',     cat:'weapon',    name:'Sword of the Ancients +3', traits:['magical'],              desc:'+3 longsword. Holds one spell up to 5th rank; discharge on a hit.',   price:'9000 gp'},
    ],
  };

  // ── Magic item flavor descriptions (campaign-specific) ───────────────────
  const ITEM_FINDS = [
    'Found in a locked chest, buried under rubble.',
    'Stripped from the body of a defeated lieutenant.',
    'Reward from a grateful noble family.',
    'Discovered in a hidden cache behind a false wall.',
    'Won in a high-stakes wager with a mysterious merchant.',
    'Recovered from an ancient vault that hadn\'t been opened in decades.',
    'Left behind by a previous adventuring party that didn\'t survive.',
    'Gifted by a faction leader as proof of their trust.',
    'Pulled from the wreckage of a destroyed arcane laboratory.',
    'Acquired by trading information the party uniquely possessed.',
    'Found on an altar, left as an offering generations ago.',
    'Salvaged from a sunken vessel in an underground river.',
  ];

  // ── Hoard contents by party level ────────────────────────────────────────
  // "Act hoard" = what a party should find across one act (all encounters + boss)
  function generateActHoard(actLevelStart, actLevelEnd, partySize, theme) {
    var avgLevel  = Math.round((actLevelStart + actLevelEnd) / 2);
    var currency  = CURRENCY_BY_LEVEL[Math.min(Math.max(avgLevel, 1), 20)];
    var parcels   = currency ? currency.parcels.slice() : [100, 100, 100, 100];

    // Pick 2 permanent items: one at act level, one 1-2 below
    var permItems = selectPermanentItems(avgLevel, theme, 2);

    // Pick 3-4 consumables appropriate to the level range
    var consums   = selectConsumables(avgLevel, 3 + Math.floor(Math.random() * 2));

    // Theme-specific bonus item (30% chance)
    var themeItem = null;
    if (Math.random() < 0.3 && THEME_ITEMS[theme]) {
      var pool = THEME_ITEMS[theme].filter(function(i) { return i.level <= avgLevel + 2; });
      if (pool.length) themeItem = pool[Math.floor(Math.random() * pool.length)];
    }

    // Currency split across 3-4 encounters + boss
    var coinSplits = parcels.map(function(p) {
      var gp = Math.round(p / 10) * 10;
      var sp = Math.round((p % 10) * 10);
      return { gp: gp, sp: sp };
    });

    return {
      actLevel:     avgLevel,
      theme:        theme,
      totalValue:   currency ? currency.total : 0,
      coinParcels:  coinSplits,
      permanentItems: permItems,
      consumables:  consums,
      themeBonus:   themeItem,
      itemFinds:    permItems.map(function() { return pickRand(ITEM_FINDS); }),
    };
  }

  function selectPermanentItems(level, theme, count) {
    // Build pool from all tiers
    var allItems = [].concat(
      PERMANENT_ITEMS.low,
      PERMANENT_ITEMS.mid_low,
      PERMANENT_ITEMS.mid,
      PERMANENT_ITEMS.high,
      PERMANENT_ITEMS.legendary
    );
    var pool = allItems.filter(function(i) {
      return i.level >= level - 2 && i.level <= level + 1;
    });
    if (!pool.length) pool = allItems.filter(function(i) { return i.level <= level; });
    if (!pool.length) pool = allItems;
    return pickN(pool, count);
  }

  function selectConsumables(level, count) {
    var allCons = [].concat(
      CONSUMABLES.low, CONSUMABLES.mid, CONSUMABLES.high
    );
    var pool = allCons.filter(function(c) {
      return c.level >= level - 3 && c.level <= level + 1;
    });
    if (!pool.length) pool = allCons;
    return pickN(pool, count);
  }

  function pickRand(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pickN(arr, n) {
    var copy = arr.slice();
    var result = [];
    while (result.length < n && copy.length > 0) {
      var i = Math.floor(Math.random() * copy.length);
      result.push(copy.splice(i, 1)[0]);
    }
    return result;
  }

  return {
    CURRENCY_BY_LEVEL: CURRENCY_BY_LEVEL,
    PERMANENT_ITEMS:   PERMANENT_ITEMS,
    CONSUMABLES:       CONSUMABLES,
    THEME_ITEMS:       THEME_ITEMS,
    generateActHoard:  generateActHoard,
  };
})();
