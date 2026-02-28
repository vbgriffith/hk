/**
 * js/generator.js  — Build 5 Complete Rewrite
 * Adds:
 *   - generateEnvironment(): terrain, atmosphere, hazards, landmarks per act
 *   - buildEncounter(): selects creatures from library, attaches full stat blocks
 *   - generateSideQuestEncounter(): encounter per side quest with stat block
 *   - generateBossStatBlock(): synthesises a full boss stat block from campaign data
 */

const Generator = (() => {
  'use strict';

  let _current = null;
  let _config   = null;

  // ── Utilities ─────────────────────────────────────────────────────────────
  function pick(arr)      { return arr[Math.floor(Math.random() * arr.length)]; }
  function pickN(arr, n)  { return _.sampleSize(arr, n); }
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function interpolate(tpl, vars) {
    return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] || '[' + k + ']');
  }

  // ── Config ────────────────────────────────────────────────────────────────
  function readConfig() {
    const v = id => document.getElementById(id);
    return {
      players:      parseInt(v('playerCount').textContent),
      startLevel:   parseInt(v('startLevel').textContent),
      endLevel:     parseInt(v('endLevel').textContent),
      tone:         v('toneSelect').value,
      theme:        v('themeSelect').value,
      source:       v('sourceSelect').value,
      acts:         parseInt(v('actCount').textContent),
      sideQuests:   parseInt(v('sideQuestCount').textContent),
      mixVillains:  v('mixVillains').checked,
      mixLocations: v('mixLocations').checked,
      mixFactions:  v('mixFactions').checked,
      mixTwists:    v('mixTwists').checked,
      mixNPCs:      v('mixNPCs').checked,
      mixRewards:   v('mixRewards').checked,
      mixHooks:     v('mixHooks').checked,
      mixBosses:    v('mixBosses').checked,
    };
  }

  // ── Campaign selection ────────────────────────────────────────────────────
  function selectCampaign(config) {
    let pool = CAMPAIGNS;
    if (config.source !== 'any') {
      const match = CAMPAIGNS.find(c => c.id === config.source);
      if (match) return match;
    }
    if (config.tone  !== 'any') { const f = pool.filter(c => c.tones.includes(config.tone));  if (f.length) pool = f; }
    if (config.theme !== 'any') { const f = pool.filter(c => c.themes.includes(config.theme)); if (f.length) pool = f; }
    if (!pool.length) pool = CAMPAIGNS;
    return pick(pool);
  }

  // ── Villain ───────────────────────────────────────────────────────────────
  function generateVillain(base, config, mixOverride) {
    if (!config.mixVillains && !mixOverride) return Object.assign({}, base.defaultVillain);
    const arch = pick(COMPONENTS.villainArchetypes);
    const src  = base.defaultVillain;
    return {
      name: src.name, title: src.title,
      race: arch.type,
      alignment: 'See Belief/Edict (Remaster)',
      motivation:   Math.random() < 0.5 ? src.motivation   : arch.motivation,
      tactics:      Math.random() < 0.5 ? src.tactics      : arch.tactics,
      weakness:     src.weakness,
      secretReveal: src.secretReveal,
      cr:           arch.cr,
    };
  }

  // ── Locations ─────────────────────────────────────────────────────────────
  function generateLocations(base, config, mixOverride) {
    if (!config.mixLocations && !mixOverride) return base.locations;
    const locPool = [].concat(
      COMPONENTS.locations.urban,
      COMPONENTS.locations.wilderness,
      COMPONENTS.locations.dungeon,
      COMPONENTS.locations.planar
    );
    const canonical = base.locations.slice(0, 2);
    const extras    = pickN(locPool, Math.max(0, base.locations.length - 2));
    return canonical.concat(extras);
  }

  // ── Factions ──────────────────────────────────────────────────────────────
  function generateFactions(base, config, mixOverride) {
    if (!config.mixFactions && !mixOverride) return base.factions;
    const base2  = base.factions.slice(0, 1);
    const extras = pickN(COMPONENTS.factions, 2).map(function(f) {
      return { name: f.name, alignment: f.alignment, role: pick(['Ally','Villain (secondary)','Wildcard']), desc: f.hook };
    });
    return base2.concat(extras);
  }

  // ── Twists ────────────────────────────────────────────────────────────────
  function generateTwists(config) {
    if (!config.mixTwists) return [];
    return pickN(COMPONENTS.plotTwists, Math.min(config.acts, 3));
  }

  // ── NPCs ──────────────────────────────────────────────────────────────────
  function generateNPCs(base, config) {
    if (!config.mixNPCs) return [];
    const archetypes = pickN(COMPONENTS.npcArchetypes, Math.min(5, config.players + 1));
    const firstNames = COMPONENTS.npcFirstNames || ['Aldara','Caius','Mirela','Thorvald','Zephyrine','Kasimir','Lirien','Ozren','Fennick','Tarasha'];
    const lastNames  = COMPONENTS.npcLastNames  || ['Voss','Kast','Vex','Brightmantle','the Unbroken','Dunmore','Ashcroft','Silversong','Rein','Coldwater'];
    return archetypes.map(function(arch) {
      return { name: pick(firstNames)+' '+pick(lastNames), role: arch.role, desc: arch.desc, personality: arch.personality };
    });
  }

  // ── Hook ──────────────────────────────────────────────────────────────────
  function generateHook(config) {
    if (!config.mixHooks) return null;
    return pick(COMPONENTS.adventureHooks);
  }

  // ── Level ranges ──────────────────────────────────────────────────────────
  function calcActLevels(startLevel, endLevel, acts) {
    const range  = endLevel - startLevel;
    const perAct = range / acts;
    const ranges = [];
    for (var i = 0; i < acts; i++) {
      const start = Math.round(startLevel + i * perAct);
      const end   = i === acts - 1 ? endLevel : Math.round(startLevel + (i + 1) * perAct);
      ranges.push({ start: start, end: end });
    }
    return ranges;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ENVIRONMENT GENERATION
  // ─────────────────────────────────────────────────────────────────────────

  var ENV_DATA = {
    terrainTypes: {
      urban:      ['cobblestone streets','cramped alleyways','rooftop walkways','market squares','dock warehouses','sewer tunnels','castle battlements','collapsed building interiors'],
      wilderness: ['dense forest undergrowth','open grassland','rocky mountain passes','swamp and bog terrain','desert dunes','coastal cliffs','river deltas','volcanic fields'],
      dungeon:    ['stone corridors (10 ft wide)','collapsed halls','flooded lower chambers','rubble-strewn vaults','iron-grated cells','spiral staircases','carved ritual passages','underground caverns'],
      planar:     ['crystalline formations','floating obsidian platforms','rivers of liquid memory','bone-white salt flats','perpetual storm bands','divine architecture ruins','void between platforms','solidified lightning fields'],
    },
    lightingConditions: [
      'Bright daylight / magical illumination',
      'Dim lantern light (concealed zones)',
      'Intermittent magical lighting (flickering)',
      'Darkness — darkvision required',
      'Blinding radiance — glare effects active',
      'Shifting light/dark zones (changes each round)',
      'Bioluminescent ambient glow (dim light throughout)',
      'Torchlight only — shadows at every edge',
    ],
    weatherAndAtmosphere: [
      'Clear and calm — no environmental effects',
      'Heavy rain: −2 to Perception; −2 to Ranged attacks',
      'Thick supernatural fog: visibility 15 ft; Stealth DCs reduced by 2',
      'Howling wind: −2 to Ranged attacks; DC 15 Acrobatics or pushed 5 ft on crit fail',
      'Supernatural cold: 5 cold damage/minute without protection',
      'Magical dead calm: sound suppressed; no auditory Perception beyond 30 ft',
      'Oppressive heat: Fortitude DC 14/10 minutes or gain Fatigued',
      'Electrical interference: Metal armour grants −1 AC; lightning spells gain +1 die',
    ],
    hazardTemplates: [
      { name:'Unstable Footing',    type:'Environmental', dcBase:14, desc:'Difficult terrain zone. DC {DC} Acrobatics to Run or Sprint; fail = prone.' },
      { name:'Collapsing Ceiling',  type:'Trap (Complex)', dcBase:16, desc:'Triggered by heavy impact or sound. DC {DC} Reflex or 3d6 bludgeoning + prone. Perception DC {DC} to spot cracks.' },
      { name:'Poison Spore Cloud',  type:'Environmental', dcBase:15, desc:'Inhaled poison in area. DC {DC} Fort: fail = Sickened 2; crit fail = Nauseated 1 minute.' },
      { name:'Magical Glyph',       type:'Trap',          dcBase:18, desc:'Arcana or Thievery DC {DC} to detect/disarm. Trigger: 4d6 typed damage, 10-ft burst.' },
      { name:'Pit Trap',            type:'Trap',          dcBase:16, desc:'Perception DC {DC} to spot. Reflex DC {DC}: fall 20 ft (2d6 bludgeoning).' },
      { name:'Arcane Static Field', type:'Magical Hazard', dcBase:17, desc:'Spell DCs +2 in zone. Casters: DC {DC} Arcana or lose 1 action per spell cast.' },
      { name:'Flooded Chamber',     type:'Environmental', dcBase:14, desc:'Waist-deep: Speed halved, −2 attacks. Head-deep: DC {DC} Athletics/round or begin drowning.' },
      { name:'Darkness Curse',      type:'Magical Hazard', dcBase:0,  desc:'Permanent magical darkness. Light spells below 3rd rank suppressed. No-darkvision creatures blinded.' },
      { name:'Crumbling Bridge',    type:'Environmental', dcBase:17, desc:'Collapses after 3rd Medium+ creature crosses. DC {DC} Reflex or fall.' },
      { name:'Necrotic Miasma',     type:'Magical Hazard', dcBase:0,  desc:'1d6 negative damage/round to living. Undead heal 1d6/round. Emanates from ritual site.' },
      { name:'Summoning Vortex',    type:'Magical Hazard', dcBase:18, desc:'Unstable portal. At initiative 0 each round: DC {DC} Will or drawn 10 ft toward it.' },
      { name:'Pressure Plates',     type:'Trap',          dcBase:19, desc:'Thievery DC {DC} to find and disable. Trigger: 2d8 piercing from wall spikes, 15-ft line.' },
    ],
    landmarks: {
      urban:     ['the old execution square','the broken clocktower','the sealed temple district','the thieves\' market','the abandoned palace','the contested harbor gate','the burned library','the underground cistern network'],
      wilderness:['the standing stones circle','the ancient battlefield','the corrupted wellspring','the overgrown shrine','the dragon\'s landing scar','the sunken old road','the hermit\'s watchtower','the old border wall'],
      dungeon:   ['the sealed vault door (still locked)','the collapsed throne room','the flooded ritual chamber','the mass grave site','the still-functional golem workshop','the intact boss quarters','the escape tunnel entrance','the first-builders\' inscription wall'],
      planar:    ['the anchor stone (holds this plane stable)','the planar rift (visible, active)','the crystallized time-stop zone','the dead god\'s footprint','the impossibly old structure','the echo chamber (all sounds repeat)','the gateway arch (destination unknown)','the colour out of space site'],
    },
    sensoryDetails: [
      'Smell: old stone and torch smoke','Smell: damp earth and rot',
      'Smell: ozone and active magic','Smell: brine and old blood',
      'Sound: distant dripping water','Sound: echoing voices of long-dead occupants',
      'Feel: unnaturally still and silent','Feel: watched despite appearing empty',
      'Sight: faint phosphorescent glow on walls','Feel: gravity slightly wrong',
      'Sound: wind through impossible spaces','Feel: contained arcane energy humming',
      'Taste: copper and old magic in the air','Sound: geological movement far below',
    ],
    tacticalNotesByTerrain: {
      urban:     ['Multiple elevation levels; rooftops and alleys enable flanking. Civilians may be present — AoE requires care.','Buildings can be entered; interior/exterior movement creates tactical options.','Sound carries between buildings; failed Stealth by 5+ alerts adjacent guards.'],
      wilderness:['Difficult terrain affects movement; positioning before engagement matters significantly.','Natural cover available at range; open areas impose −2 to Stealth checks.','Weather conditions apply ongoing effects per environment above.'],
      dungeon:   ['Narrow corridors limit AoE; line-of-effect is critical for spells.','Lighting significantly affects Perception and Stealth — darkness is a weapon.','Sound carries in stone halls; failed Stealth by 5+ alerts adjacent rooms.'],
      planar:    ['Plane-specific traits may apply; review GM Core planar rules.','Native-type damage often resisted; adjust spells accordingly.','Teleportation and flight may work differently; check planar traits.'],
    },
  };

  function inferTerrainType(locationStr) {
    var l = (locationStr || '').toLowerCase();
    if (/city|town|port|market|castle|palace|district|guild|quarter|street|capital/.test(l)) return 'urban';
    if (/forest|mountain|ocean|desert|jungle|tundra|plain|river|coast|wilderness|swamp|bog|valley|field/.test(l)) return 'wilderness';
    if (/dungeon|vault|ruin|tomb|cave|crypt|sanctum|underground|sewer|labyrinth|ruin|archive/.test(l)) return 'dungeon';
    if (/plane|planar|astral|ethereal|shadow|elemental|demi|abyss|hell|heaven|realm|void/.test(l)) return 'planar';
    return pick(['urban','wilderness','dungeon','planar']);
  }

  function generateEnvironment(locationStr, levelRange) {
    var terrainType = inferTerrainType(locationStr);
    var avgLevel    = Math.round((levelRange.start + levelRange.end) / 2);
    var dcMod       = avgLevel;
    var numHazards  = rand(1, 2);

    var hazards = pickN(ENV_DATA.hazardTemplates, numHazards).map(function(h) {
      var dc = h.dcBase > 0 ? (h.dcBase + Math.floor(dcMod / 2)).toString() : '—';
      return Object.assign({}, h, {
        dc:   dc,
        desc: h.desc.replace(/\{DC\}/g, dc),
      });
    });

    return {
      terrainType:   terrainType,
      terrain:       pickN(ENV_DATA.terrainTypes[terrainType], 2),
      lighting:      pick(ENV_DATA.lightingConditions),
      weather:       pick(ENV_DATA.weatherAndAtmosphere),
      hazards:       hazards,
      landmark:      pick(ENV_DATA.landmarks[terrainType]),
      sensory:       pickN(ENV_DATA.sensoryDetails, 2),
      tacticalNotes: pick(ENV_DATA.tacticalNotesByTerrain[terrainType] || ENV_DATA.tacticalNotesByTerrain.dungeon),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STAT BLOCK SCALING (PF2e Monster Core table approximations)
  // ─────────────────────────────────────────────────────────────────────────

  // [level, AC, HP,  fort, ref, will, atkBonus, dmgDice,      perception, dc]
  var SCALE_TABLE = [
    [-1, 14,  9,  2,  4,  1,  4, '1d4',        2,  13],
    [ 0, 15, 14,  4,  6,  3,  5, '1d6',        3,  14],
    [ 1, 15, 19,  5,  7,  4,  6, '1d6+2',      4,  15],
    [ 2, 16, 25,  6,  8,  5,  7, '1d8+2',      5,  16],
    [ 3, 17, 35,  9,  9,  7,  9, '1d8+4',      6,  17],
    [ 4, 18, 45, 10, 10,  8, 10, '1d8+5',      7,  18],
    [ 5, 20, 55, 12, 12, 10, 12, '2d6+4',      8,  19],
    [ 6, 21, 65, 13, 13, 11, 13, '2d6+5',      9,  20],
    [ 7, 22, 80, 14, 14, 12, 15, '2d6+6',     10,  22],
    [ 8, 24, 95, 15, 15, 13, 16, '2d8+6',     11,  23],
    [ 9, 25,110, 17, 17, 15, 18, '2d8+7',     12,  24],
    [10, 27,130, 19, 19, 17, 20, '2d10+7',    13,  26],
    [11, 28,145, 20, 20, 18, 21, '2d10+8',    14,  27],
    [12, 29,160, 21, 21, 19, 22, '2d10+9',    15,  28],
    [13, 31,180, 23, 23, 21, 24, '3d8+9',     16,  30],
    [14, 32,200, 24, 24, 22, 25, '3d8+10',    17,  31],
    [15, 34,220, 26, 26, 24, 27, '3d10+10',   18,  32],
    [16, 35,240, 27, 27, 25, 28, '3d10+11',   19,  34],
    [17, 37,265, 29, 29, 27, 30, '4d8+11',    20,  35],
    [18, 38,285, 30, 30, 28, 31, '4d8+12',    21,  36],
    [19, 40,310, 32, 32, 30, 33, '4d10+12',   22,  38],
    [20, 41,330, 33, 33, 31, 34, '4d10+13',   23,  40],
  ];

  function getScale(level) {
    var clamped = Math.max(-1, Math.min(20, level));
    return SCALE_TABLE.find(function(r) { return r[0] === clamped; }) || SCALE_TABLE[SCALE_TABLE.length - 1];
  }

  function generateScaledStatBlock(creature, partyLevel) {
    var lvl = creature.level;
    var row = getScale(lvl);
    var ac = row[1], hp = row[2], fort = row[3], ref = row[4], will = row[5];
    var atkBonus = row[6], dmgDice = row[7], percMod = row[8], dc = row[9];

    // Adjust attack damage label for creature type
    var dmgTypes = { Soldier:'slashing', Archer:'piercing', Brute:'bludgeoning', Drainer:'negative',
                     Caster:'fire or cold', Controller:'mental', Ambusher:'piercing', Flyer:'slashing',
                     Guardian:'bludgeoning', Skirmisher:'slashing' };
    var dmgType = dmgTypes[creature.role] || 'slashing';

    return {
      level:       lvl,
      traits:      creature.traits || [],
      perception:  percMod,
      senses:      ['darkvision'],
      languages:   creature.traits && creature.traits.includes('humanoid') ? ['Common'] : [],
      skills:      { Athletics: atkBonus, Stealth: ref - 2 },
      abilityMods: { str: Math.floor((atkBonus - 10)/2), dex: Math.floor((ref - 10)/2), con: Math.floor((fort - 10)/2), int: 0, wis: Math.floor((will - 10)/2), cha: 0 },
      ac:    ac,
      saves: { fort: fort, ref: ref, will: will },
      hp:    hp,
      immunities:  deriveImmunities(creature),
      resistances: [],
      weaknesses:  deriveWeaknesses(creature),
      speeds:      { land: 25 },
      attacks: [{
        name:   creature.role === 'Archer' ? 'Ranged Strike' : 'Strike',
        bonus:  atkBonus,
        damage: dmgDice + ' ' + dmgType,
        traits: creature.role === 'Archer' ? ['range 60 ft'] : [],
        effects: [],
      }],
      actions: [{
        name:        creature.specialAbility ? creature.specialAbility.split(':')[0].trim() : 'Special Ability',
        actions:     '2',
        type:        'action',
        description: creature.specialAbility || 'See creature description.',
      }],
      passives: ['Tactics: ' + (creature.tactics || 'Standard combat behavior.')],
      source:   { book: 'Monster Core', page: '—', note: '⚠ Scaled approximation — use official stat block for accuracy' },
      isScaled: true,
    };
  }

  function deriveImmunities(creature) {
    var t = creature.traits || [];
    if (t.includes('undead'))    return ['death effects','disease','paralyzed','poison','unconscious'];
    if (t.includes('construct')) return ['bleed','death effects','disease','doomed','drained','fatigued','healing','mental','poison','sickened','unconscious'];
    if (t.includes('mindless'))  return ['mental','confused'];
    return [];
  }

  function deriveWeaknesses(creature) {
    var t = creature.traits || [];
    if (t.includes('undead'))    return ['positive 5'];
    if (t.includes('vampire'))   return ['positive 5 (sunlight: 3/round)'];
    if (t.includes('skeleton'))  return ['bludgeoning 5','positive 5'];
    if (t.includes('zombie'))    return ['slashing 5','positive 5'];
    if (t.includes('fire'))      return ['cold 5'];
    if (t.includes('cold'))      return ['fire 5'];
    return [];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ENCOUNTER BUILDING
  // ─────────────────────────────────────────────────────────────────────────

  function creatureXP(creatureLevel, partyLevel) {
    var diff  = creatureLevel - partyLevel;
    var clamped = Math.max(-4, Math.min(4, diff));
    var table = { '-4':10,'-3':15,'-2':20,'-1':30,'0':40,'1':60,'2':80,'3':120,'4':160 };
    return table[clamped.toString()] || (diff < -4 ? 9 : 200);
  }

  function getCreatureLib() {
    // Access the creature library from EncounterBuilder if available
    if (typeof EncounterBuilder !== 'undefined' && typeof EncounterBuilder._lib !== 'undefined') {
      return EncounterBuilder._lib;
    }
    return MINIMAL_CREATURES;
  }

  function attachStatBlock(creature, partyLevel) {
    var sb = null;
    if (typeof STAT_BLOCKS !== 'undefined') {
      sb = STAT_BLOCKS[creature.name];
      if (!sb) {
        var lower = creature.name.toLowerCase();
        var keys  = Object.keys(STAT_BLOCKS);
        for (var k = 0; k < keys.length; k++) {
          if (keys[k].toLowerCase() === lower) { sb = STAT_BLOCKS[keys[k]]; break; }
        }
      }
    }
    if (!sb) sb = generateScaledStatBlock(creature, partyLevel);
    return Object.assign({}, creature, { statBlock: sb });
  }

  function buildEncounter(difficulty, partyLevel, players, themeFilter) {
    var adj     = (players - 4) * 10;
    var budgetMap = { trivial: 40+adj, low: 60+adj, moderate: 80+adj, severe: 120+adj, extreme: 160+adj };
    var budget  = budgetMap[difficulty] || budgetMap.moderate;
    var lib     = getCreatureLib();

    // Filter to creatures within ±4 levels
    var pool = lib.filter(function(c) { return Math.abs(c.level - partyLevel) <= 4; });
    if (!pool.length) pool = lib;

    // Prefer thematic match
    if (themeFilter && themeFilter !== 'any') {
      var themed = pool.filter(function(c) { return c.theme && c.theme.includes(themeFilter); });
      if (themed.length >= 2) pool = themed;
    }

    // Build encounter via greedy budget fill
    var selected = [];
    var xpSpent  = 0;
    var maxLoop  = 40;
    while (xpSpent < budget * 0.75 && selected.length < 6 && maxLoop-- > 0) {
      var remaining   = budget - xpSpent;
      var affordable  = pool.filter(function(c) {
        var xp = creatureXP(c.level, partyLevel);
        return xp <= remaining * 1.25 && xp >= 9;
      });
      if (!affordable.length) break;
      var candidate = pick(affordable);
      // Don't stack bosses
      if (candidate.role === 'Boss' && selected.some(function(s) { return s.role === 'Boss'; })) {
        maxLoop--;
        continue;
      }
      selected.push(candidate);
      xpSpent += creatureXP(candidate.level, partyLevel);
    }

    // Fallback: just pick closest creature
    if (!selected.length) {
      var sorted = pool.slice().sort(function(a,b) { return Math.abs(a.level-partyLevel) - Math.abs(b.level-partyLevel); });
      if (sorted[0]) selected.push(sorted[0]);
    }

    var creaturesWithStats = selected.map(function(c) { return attachStatBlock(c, partyLevel); });
    var actualXP   = selected.reduce(function(s,c) { return s + creatureXP(c.level, partyLevel); }, 0);
    var diffLabels = [['trivial',40+adj],['low',60+adj],['moderate',80+adj],['severe',120+adj],['extreme',160+adj]];
    var actualDiff = 'Trivial';
    for (var d = diffLabels.length - 1; d >= 0; d--) {
      if (actualXP >= diffLabels[d][1]) { actualDiff = diffLabels[d][0]; break; }
    }
    // Capitalise
    actualDiff = actualDiff.charAt(0).toUpperCase() + actualDiff.slice(1);

    return { difficulty: actualDiff, totalXP: actualXP, budget: budget, creatures: creaturesWithStats };
  }

  // ── Boss stat block ───────────────────────────────────────────────────────
  function generateBossStatBlock(villain, levelRange, players) {
    var bossLevel = Math.min(levelRange.end + 1, 20);
    var fakeCr    = { level: bossLevel, name: villain.name, role: 'Boss', traits: ['unique','humanoid'], tactics: villain.tactics, specialAbility: villain.tactics };
    var sb        = generateScaledStatBlock(fakeCr, levelRange.end);

    // Override key fields
    sb.traits     = ['boss','humanoid','unique'];
    sb.languages  = ['Common','plus campaign-relevant languages'];
    sb.isScaled   = false;
    sb.source     = { book: 'Campaign Forge — Generated Boss', page: '—', note: 'Custom-scaled. Adjust to taste.' };

    // Phase 2
    sb.phase2 = {
      trigger:  villain.name + ' is reduced to ' + Math.floor(sb.hp * 0.4) + ' HP',
      changes: [
        'Gains 20 temporary HP and enters a rage-like state',
        'Gains 1 additional action per round',
        villain.weakness ? ('Weakness activates: ' + villain.weakness) : 'Becomes Quickened 1 (extra Strike only)',
      ],
    };

    // Additional villain actions
    sb.actions.push(
      { name: "Villain's Gambit", actions:'2', type:'action',
        description: 'Signature villain manoeuvre. ' + (villain.motivation || 'Pursues core objective at all costs.') },
      { name: 'Legendary Resistance', actions:'R', type:'reaction',
        description: pick(['3/day — Succeed on a failed save as a free action','3/day — Halve incoming damage as a reaction','2/day — Negate a critical hit, treat as normal hit']) }
    );

    sb.passives.unshift('Tactics: ' + (villain.tactics || ''));
    if (villain.secretReveal) sb.passives.push('Secret (Act 3 reveal): ' + villain.secretReveal);

    return sb;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ACT GENERATION
  // ─────────────────────────────────────────────────────────────────────────

  function generateActs(base, config, locations, twists) {
    var titleBank = [
      ['The Call to Adventure','Spark in the Dark','Into the Unknown','The First Blood','Seeds of Conflict','The Opening Move'],
      ['Rising Tensions','The Shadow Grows','Truth Behind the Lies','Crossing the Threshold','Allies and Enemies','The Long Game'],
      ['The Point of No Return','When Allies Fall','Ashes and Ember','The Long Descent','What Cannot Be Undone','The Weight of Choice'],
      ['Storm Before the Silence','All Cards on the Table','The World Tilts','Convergence','The Final Pieces','No Safe Ground'],
      ['The Final Reckoning','The Last Mile','When Hope Runs Out','Into the Fire','The Long Goodbye','One Final Dawn'],
      ['Epilogue and Echoes','What Was Won','The World After','Legacy','Aftermath','The Cost Counted'],
    ];

    var levelRanges   = calcActLevels(config.startLevel, config.endLevel, config.acts);
    var plotBeats     = base.mainPlot;
    var acts          = [];
    var campaignTheme = (base.themes && base.themes[0]) ? base.themes[0] : 'any';

    for (var i = 0; i < config.acts; i++) {
      var lvl     = levelRanges[i];
      var beatIdx = Math.round(i * (plotBeats.length - 1) / Math.max(config.acts - 1, 1));
      var beat    = plotBeats[Math.min(beatIdx, plotBeats.length - 1)];
      var locIdx  = i % locations.length;
      var locStr  = locations[locIdx] || 'Unknown Territory';
      var titles  = titleBank[Math.min(i, titleBank.length - 1)];

      // Environment
      var environment = generateEnvironment(locStr, lvl);

      // Narrative encounter types (3 types)
      var encTypes   = pickN(COMPONENTS.encounterTypes, 3);
      var encounters = encTypes.map(function(e) { return Object.assign({}, e); });

      // Full generated encounters (with stat blocks)
      var partyLevel   = Math.round((lvl.start + lvl.end) / 2);
      var actEncounters = [
        Object.assign({ label: 'Opening Encounter (Low Difficulty)' },    buildEncounter('low',      partyLevel, config.players, campaignTheme)),
        Object.assign({ label: 'Midpoint Encounter (Moderate Difficulty)'},buildEncounter('moderate', partyLevel, config.players, campaignTheme)),
        Object.assign({ label: 'Climax Encounter (Severe Difficulty)' },   buildEncounter('severe',   partyLevel, config.players, campaignTheme)),
      ];

      // Boss
      var boss = null;
      if (config.mixBosses) {
        var bossT  = pick(COMPONENTS.bossEncounters);
        var bossC  = pick(COMPONENTS.villainArchetypes);
        var prefix = pick(['Champion of','Herald of','Agent of','Enforcer of','Voice of','Blade of','Chosen of']);
        var bossVillainData = {
          name:        base.defaultVillain.name,
          motivation:  base.defaultVillain.motivation,
          tactics:     bossC.tactics,
          weakness:    base.defaultVillain.weakness,
          secretReveal:base.defaultVillain.secretReveal,
        };
        var bossStatBlock = generateBossStatBlock(bossVillainData, lvl, config.players);
        boss = {
          name:        prefix + ' ' + base.defaultVillain.name,
          creature:    bossC.type + ', Level ' + Math.max(lvl.end, lvl.end + 1) + ' (Severe Encounter)',
          setup:       bossT.setup,
          phase2:      bossT.phase2,
          env:         bossT.environment,
          tactics:     bossC.tactics,
          statBlock:   bossStatBlock,
          environment: generateEnvironment(locStr, { start: lvl.end, end: lvl.end + 1 }),
          xp:          creatureXP(lvl.end + 1, partyLevel) + adj(config.players),
        };
      }

      // Side quests with encounters
      var sideQuests = generateSideQuests(config, lvl, i, campaignTheme);

      // Milestones
      var milestones = [
        'Heroes arrive in ' + locStr,
        beat,
        'Faction dynamics shift — new ally or betrayal revealed',
        'Act climax at level ' + lvl.end + ' — the stakes escalate',
      ];

      // Twist mapping
      var actTwist = null;
      twists.forEach(function(t) {
        var tMap = { 'End of Act 2':1,'Mid Act 3':2,'Act 2 revelation':1,'Act 2 climax':1,
                     'Act 3 revelation':2,'Act 3':2,'Pre-final act':config.acts-2,
                     'Final act':config.acts-1,'Act 2 opening':1,'Act 3 opening':2,
                     'Pre-final':config.acts-2,'Final act opening':config.acts-1 };
        if (tMap[t.timing] === i) actTwist = t;
        if ((t.timing === 'Act 2-3') && (i === 1 || i === 2)) actTwist = t;
        if ((t.timing === 'Mid campaign') && i === Math.floor(config.acts/2)) actTwist = t;
      });

      acts.push({
        number:       i + 1,
        title:        pick(titles),
        levelStart:   lvl.start,
        levelEnd:     lvl.end,
        location:     locStr,
        summary:      generateActSummary(i, config, base, beat),
        environment:  environment,
        milestones:   milestones,
        encounters:   encounters,
        actEncounters:actEncounters,
        boss:         boss,
        sideQuests:   sideQuests,
        twist:        actTwist,
      });
    }
    return acts;
  }

  function adj(players) { return (players - 4) * 10; }

  // ─────────────────────────────────────────────────────────────────────────
  // SIDE QUESTS
  // ─────────────────────────────────────────────────────────────────────────

  function generateSideQuests(config, levelRange, actIndex, campaignTheme) {
    var quests = [];
    var diffMap = { Rescue:'moderate', Investigation:'low', Escort:'moderate', Heist:'low',
                    Diplomacy:'trivial', Dungeon:'severe', Mystery:'low', Combat:'severe',
                    Sabotage:'moderate', Recruitment:'trivial', Containment:'moderate',
                    Deception:'low', Recovery:'moderate', Revelation:'low',
                    Archaeological:'low', Environmental:'moderate', Criminal:'moderate',
                    Ethical:'trivial', Haunting:'moderate', Personal:'low' };

    for (var i = 0; i < config.sideQuests; i++) {
      var qType  = pick(COMPONENTS.sideQuestTemplates);
      var rawTpl = pick(qType.templates);
      var vars   = {
        enemy:  pick(['a local crime boss',"the villain's agents",'a mercenary band','a transformed ally','a rival faction','a rogue construct']),
        demand: pick(['information about the party','a specific magical artifact','safe passage through their territory','the release of one of their own prisoners']),
      };
      var desc = interpolate(rawTpl, vars);

      var rewardTier = levelRange.end <= 5  ? 'level1_5'  :
                       levelRange.end <= 10 ? 'level6_10' :
                       levelRange.end <= 15 ? 'level11_15': 'level16_20';

      var partyLevel = Math.round((levelRange.start + levelRange.end) / 2);
      var diff       = diffMap[qType.type] || 'moderate';
      var sqEncounter = buildEncounter(diff, partyLevel, config.players, campaignTheme);
      var sqEnv       = generateEnvironment('dungeon', levelRange);

      quests.push({
        title:       generateQuestTitle(qType.type, actIndex, i),
        type:        qType.type,
        level:       levelRange.start + '–' + levelRange.end,
        desc:        desc,
        reward:      pick(COMPONENTS.rewards[rewardTier]),
        optional:    Math.random() < 0.3,
        dc:          10 + Math.round((levelRange.start + levelRange.end) / 2),
        encounter:   sqEncounter,
        environment: sqEnv,
      });
    }
    return quests;
  }

  function generateQuestTitle(type, act, idx) {
    var prefixes = {
      Rescue:       ['The Lost','Captive in the Dark','No One Left Behind','Worth Saving'],
      Investigation:['Who Killed','The Truth of','What They Found','Unraveling'],
      Escort:       ['Safe Passage','The Long Road','Getting There','Protecting'],
      Heist:        ['Stealing Back','The Inside Job','One Quiet Night',"Taking What's Owed"],
      Diplomacy:    ['Bridge the Divide','Words Before War','The Reluctant Alliance','Making Peace'],
      Dungeon:      ['The Sealed Level','What Waits Below','Old Bones','Into the Dark'],
      Mystery:      ['The Missing','What Everyone Forgot','No Explanation Given','Strange Signs'],
      Combat:       ['The Coming Storm','Clear the Road','No Survivors','Stop Them Here'],
      Sabotage:     ['Cutting the Thread','Undetected','Before They Notice'],
      Recruitment:  ['Bringing Them In','The Case For','One More Ally'],
      Containment:  ['Holding the Line','Before It Spreads','Damage Control'],
      Deception:    ['The False Trail','What They Believed','Acting the Part'],
      Recovery:     ['Getting It Back','What Was Lost','Second Chance'],
      Revelation:   ['The Hidden Truth','What Was Buried','The Real Story'],
    };
    var locWords = ['Ruins','Forest','Tower','Keep','Harbor','Mountain','Gate','Valley','Temple','Archive'];
    var seasons  = ['the Harvest','Midsummer','the Long Dark','the Thaw','Solstice'];
    var events   = ['the Festival','the Siege','the Trial','the Summit','the Eclipse'];
    var persons  = ['the Innocent','the Fallen','the Living','the Lost','the Remembered'];
    var suffixes = ['of the {loc}','at {season}','before {event}','in the Shadow of the Enemy','for the sake of {person}'];

    var pArr   = prefixes[type] || ['The'];
    var suffix = pick(suffixes)
      .replace('{loc}',    pick(locWords))
      .replace('{season}', pick(seasons))
      .replace('{event}',  pick(events))
      .replace('{person}', pick(persons));
    return pick(pArr) + ' ' + suffix;
  }

  function generateActSummary(actIdx, config, base, beat) {
    var phases = [
      "The heroes are drawn into the campaign's central conflict. Their first steps bring them to " + (base.locations[0]||'the starting region') + ", where they encounter the opening salvo of " + base.defaultVillain.name + "'s machinations. " + beat + " The party establishes initial alliances and begins to understand the true scope of what they face.",
      "The conspiracy deepens. Evidence gathered points to increasingly powerful forces at work. The heroes discover that the villain's reach extends further than they imagined, and some trusted figures may have divided loyalties. " + beat + " A significant faction event changes the political landscape permanently.",
      "The point of no return. The heroes have accumulated enough knowledge and power to strike at the villain's core operations — but doing so exposes them to full wrath. " + beat + " Everything built over the campaign is tested as the villain goes on the offensive.",
      "The penultimate confrontation. The villain's master plan enters its final phase. Heroes must navigate both physical dangers and the moral weight of their choices throughout the campaign. " + beat + " Former enemies may become desperate allies.",
      "The final act. Everything converges. The heroes stand between the villain's completion of their plan and whatever world remains afterward. " + beat + " The ending is determined by the choices made in every act that preceded it.",
      "Epilogue. What remains after the campaign's resolution. The consequences ripple outward, and the heroes must decide who they are now that the crisis has passed.",
    ];
    return phases[Math.min(actIdx, phases.length - 1)];
  }

  // ── Rewards ───────────────────────────────────────────────────────────────
  function generateRewards(config, acts) {
    if (!config.mixRewards) return null;
    return acts.map(function(act) {
      var tier = act.levelEnd <= 5  ? 'level1_5'  :
                 act.levelEnd <= 10 ? 'level6_10' :
                 act.levelEnd <= 15 ? 'level11_15': 'level16_20';
      return { act: act.number, items: pickN(COMPONENTS.rewards[tier], 2) };
    });
  }

  // ── Main forge ────────────────────────────────────────────────────────────
  async function forge(overrides) {
    var config = overrides ? Object.assign({}, _config, overrides) : readConfig();
    _config = config;

    UI.showLoading();
    await UI.animateLoading([
      'Selecting campaign seed…','Building the villain…',
      'Generating environments…','Building encounter tables…',
      'Attaching stat blocks…','Weaving side quests…',
      'Finishing the manuscript…',
    ]);

    var base      = selectCampaign(config);
    var villain   = generateVillain(base, config, overrides && overrides.villainOverride);
    var locations = generateLocations(base, config, overrides && overrides.locationOverride);
    var factions  = generateFactions(base, config, overrides && overrides.factionOverride);
    var twists    = generateTwists(config);
    var npcs      = generateNPCs(base, config);
    var hook      = generateHook(config);
    var acts      = generateActs(base, config, locations, twists);
    var rewards   = generateRewards(config, acts);

    _current = {
      config: config, base: base, villain: villain, locations: locations,
      factions: factions, twists: twists, npcs: npcs, hook: hook,
      acts: acts, rewards: rewards,
      generated:   new Date().toISOString(),
      pf2eVersion: COMPONENTS.pf2eNotes.version,
    };

    UI.hideLoading();
    Renderer.render(_current);
    return _current;
  }

  function reforge() { return forge(_config); }
  function getCurrent() { return _current; }
  function getConfig()  { return _config; }

  function applyMixChanges(changes) {
    if (!_current) return;
    if (changes.villain)   _current.villain   = generateVillain(_current.base, _config, true);
    if (changes.locations) _current.locations = generateLocations(_current.base, _config, true);
    if (changes.factions)  _current.factions  = generateFactions(_current.base, _config, true);
    if (changes.twists)    _current.twists    = generateTwists(_config);
    if (changes.npcs)      _current.npcs      = generateNPCs(_current.base, _config);
    if (changes.hook)      _current.hook      = generateHook(_config);
    Renderer.render(_current);
  }

  // Minimal fallback creature lib
  var MINIMAL_CREATURES = [
    { name:'Goblin Warrior', level:1, traits:['goblin','humanoid'], role:'Skirmisher', theme:['any'],    tactics:'Flanks; Goblin Song', specialAbility:'Goblin Song: Demoralize two targets' },
    { name:'Skeleton Guard', level:1, traits:['undead','skeleton'], role:'Soldier',    theme:['undead'], tactics:'Mindless advance',    specialAbility:'Undead Resistance' },
    { name:'Zombie Shambler',level:1, traits:['undead','zombie'],   role:'Brute',      theme:['undead'], tactics:'Slow; grabs',         specialAbility:'Slow (−10 Speed)' },
    { name:'Giant Spider',   level:1, traits:['animal','spider'],   role:'Ambusher',   theme:['nature'], tactics:'Web then bite',       specialAbility:'Web Ranged 30 ft' },
    { name:'Dire Wolf',      level:3, traits:['animal','wolf'],     role:'Brute',      theme:['nature'], tactics:'Pack; trip',          specialAbility:'Knockdown on crit' },
    { name:'Ghoul',          level:2, traits:['undead','ghoul'],    role:'Stalker',    theme:['undead'], tactics:'Paralyzes; feasts',   specialAbility:'Paralysis DC 15 Fort' },
    { name:'Troll',          level:5, traits:['giant','troll'],     role:'Brute',      theme:['nature'], tactics:'Regen; aggressive',   specialAbility:'Regeneration 15 (fire/acid)' },
    { name:'Wraith',         level:5, traits:['undead','wraith'],   role:'Drainer',    theme:['undead'], tactics:'Drains; phasing',     specialAbility:'Drain Life DC 22 Fort' },
  ];

  return { forge: forge, reforge: reforge, getCurrent: getCurrent, getConfig: getConfig, applyMixChanges: applyMixChanges };
})();
