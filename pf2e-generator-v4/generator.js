/**
 * js/generator.js
 * Core campaign generation engine.
 * Produces complete, fully-articulated PF2e campaign documents.
 */

const Generator = (() => {
  'use strict';

  // ── Stored campaign state for mix-and-match ──────────
  let _current = null;
  let _config   = null;

  // ── Utilities ───────────────────────────────────────
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function pickN(arr, n) { return _.sampleSize(arr, n); }
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function interpolate(tpl, vars) {
    return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] || `[${k}]`);
  }

  // ── Read config from DOM ─────────────────────────────
  function readConfig() {
    const v = id => document.getElementById(id);
    return {
      players:     parseInt(v('playerCount').textContent),
      startLevel:  parseInt(v('startLevel').textContent),
      endLevel:    parseInt(v('endLevel').textContent),
      tone:        v('toneSelect').value,
      theme:       v('themeSelect').value,
      source:      v('sourceSelect').value,
      acts:        parseInt(v('actCount').textContent),
      sideQuests:  parseInt(v('sideQuestCount').textContent),
      mixVillains: v('mixVillains').checked,
      mixLocations:v('mixLocations').checked,
      mixFactions: v('mixFactions').checked,
      mixTwists:   v('mixTwists').checked,
      mixNPCs:     v('mixNPCs').checked,
      mixRewards:  v('mixRewards').checked,
      mixHooks:    v('mixHooks').checked,
      mixBosses:   v('mixBosses').checked,
    };
  }

  // ── Select base campaign ─────────────────────────────
  function selectCampaign(config) {
    let pool = CAMPAIGNS;
    if (config.source !== 'any') {
      const match = CAMPAIGNS.find(c => c.id === config.source);
      if (match) return match;
    }
    if (config.tone !== 'any') pool = pool.filter(c => c.tones.includes(config.tone)) || pool;
    if (config.theme !== 'any') pool = pool.filter(c => c.themes.includes(config.theme)) || pool;
    if (pool.length === 0) pool = CAMPAIGNS;
    return pick(pool);
  }

  // ── Generate villain ─────────────────────────────────
  function generateVillain(base, config, mixOverride) {
    if (!config.mixVillains && !mixOverride) return { ...base.defaultVillain };
    const arch = pick(COMPONENTS.villainArchetypes);
    const src  = base.defaultVillain;
    return {
      name:          src.name,
      title:         src.title,
      race:          arch.type,
      alignment:     'See Belief/Edict (Remaster)',
      motivation:    Math.random() < 0.5 ? src.motivation : arch.motivation,
      tactics:       Math.random() < 0.5 ? src.tactics : arch.tactics,
      weakness:      src.weakness,
      secretReveal:  src.secretReveal,
      cr:            arch.cr,
    };
  }

  // ── Generate locations ────────────────────────────────
  function generateLocations(base, config, mixOverride) {
    if (!config.mixLocations && !mixOverride) return base.locations;
    const locPool = [
      ...COMPONENTS.locations.urban,
      ...COMPONENTS.locations.wilderness,
      ...COMPONENTS.locations.dungeon,
      ...COMPONENTS.locations.planar,
    ];
    // Keep 2 canonical locations, fill the rest from the pool
    const canonical = base.locations.slice(0, 2);
    const extras    = pickN(locPool, Math.max(0, base.locations.length - 2));
    return [...canonical, ...extras];
  }

  // ── Generate factions ─────────────────────────────────
  function generateFactions(base, config, mixOverride) {
    if (!config.mixFactions && !mixOverride) return base.factions;
    const base2   = base.factions.slice(0, 1); // Keep main faction
    const extras  = pickN(COMPONENTS.factions, 2).map(f => ({
      name:      f.name,
      alignment: f.alignment,
      role:      pick(['Ally', 'Villain (secondary)', 'Wildcard']),
      desc:      f.hook,
    }));
    return [...base2, ...extras];
  }

  // ── Generate plot twists ──────────────────────────────
  function generateTwists(config) {
    if (!config.mixTwists) return [];
    return pickN(COMPONENTS.plotTwists, Math.min(config.acts, 3));
  }

  // ── Generate NPCs ─────────────────────────────────────
  function generateNPCs(base, config) {
    if (!config.mixNPCs) return [];
    const archetypes = pickN(COMPONENTS.npcArchetypes, Math.min(5, config.players + 1));
    const firstNames = COMPONENTS.npcFirstNames || ["Aldara","Caius","Mirela","Thorvald","Zephyrine","Kasimir","Lirien","Ozren","Fennick","Tarasha","Ileth","Rogan","Solvey","Nadir","Corazon"];
    const lastNames  = COMPONENTS.npcLastNames  || ["Voss","Kast","Vex","Brightmantle","the Unbroken","of the North Wind","Dunmore","Ashcroft","Silversong","Rein","Coldwater","Dunwall","the Forgotten","Mirepoix","Graystone"];
    return archetypes.map(arch => ({
      name:        `${pick(firstNames)} ${pick(lastNames)}`,
      role:        arch.role,
      desc:        arch.desc,
      personality: arch.personality,
    }));
  }

  // ── Generate adventure hook ───────────────────────────
  function generateHook(config) {
    if (!config.mixHooks) return null;
    return pick(COMPONENTS.adventureHooks);
  }

  // ── Calculate level ranges for acts ──────────────────
  function calcActLevels(startLevel, endLevel, acts) {
    const range  = endLevel - startLevel;
    const perAct = range / acts;
    const ranges = [];
    for (let i = 0; i < acts; i++) {
      const start = Math.round(startLevel + i * perAct);
      const end   = i === acts - 1 ? endLevel : Math.round(startLevel + (i + 1) * perAct);
      ranges.push({ start, end });
    }
    return ranges;
  }

  // ── Generate act content ──────────────────────────────
  function generateActs(base, config, locations, twists) {
    const actTitles = [
      ["The Call to Adventure","Spark in the Dark","Into the Unknown","The First Blood"],
      ["Rising Tensions","The Shadow Grows","Truth Behind the Lies","Crossing the Threshold"],
      ["The Point of No Return","When Allies Fall","Ashes and Ember","The Long Descent"],
      ["Storm Before the Silence","All Cards on the Table","The World Tilts","Convergence"],
      ["The Final Reckoning","The Last Mile","When Hope Runs Out","Into the Fire"],
      ["Epilogue and Echoes","What Was Won","The World After","Legacy"]
    ];

    const levelRanges = calcActLevels(config.startLevel, config.endLevel, config.acts);
    const plotBeats   = base.mainPlot;
    const acts        = [];

    for (let i = 0; i < config.acts; i++) {
      const lvl     = levelRanges[i];
      const beatIdx = Math.round(i * (plotBeats.length - 1) / Math.max(config.acts - 1, 1));
      const beat    = plotBeats[Math.min(beatIdx, plotBeats.length - 1)];
      const locIdx  = i % locations.length;
      const title   = actTitles[Math.min(i, actTitles.length - 1)];

      // Encounter budget
      const encTypes  = pickN(COMPONENTS.encounterTypes, 4);
      const encounters = encTypes.map(e => ({ ...e }));

      // Boss
      let boss = null;
      if (config.mixBosses) {
        const bossT = pick(COMPONENTS.bossEncounters);
        const bossC = pick(COMPONENTS.villainArchetypes);
        boss = {
          name:      `${pick(['Champion of','Herald of','Agent of','Enforcer of','Voice of'])} ${base.defaultVillain.name}`,
          creature:  `${bossC.type}, Level ${Math.max(lvl.end, lvl.end + 1)} (Severe Encounter)`,
          setup:     bossT.setup,
          phase2:    bossT.phase2,
          env:       bossT.environment,
          tactics:   bossC.tactics,
        };
      }

      // Side quests for this act
      const sideQuests = generateSideQuests(config, lvl, i);

      // Milestones
      const milestones = [
        `Heroes arrive in ${locations[locIdx] || 'the region'}`,
        beat,
        `Faction dynamics shift: new ally or betrayal revealed`,
        `Act climax at ${lvl.end - 1}th level — the stakes escalate`,
      ];

      // Check for twist in this act
      const actTwist = twists.find(t => {
        const tActMap = { 'End of Act 2': 1, 'Mid Act 3': 2, 'Act 2 revelation': 1, 'Act 2 climax': 1, 'Act 3 revelation': 2, 'Mid campaign': Math.floor(config.acts / 2), 'Act 3': 2, 'Pre-final act': config.acts - 2, 'Final act': config.acts - 1, 'Act 2-3': i === 1 || i === 2 };
        return tActMap[t.timing] === i || (typeof tActMap[t.timing] === 'string' && false);
      });

      acts.push({
        number:     i + 1,
        title:      pick(title),
        levelStart: lvl.start,
        levelEnd:   lvl.end,
        location:   locations[locIdx] || 'Unknown Territory',
        summary:    generateActSummary(i, config, base, beat),
        milestones,
        encounters,
        boss,
        sideQuests,
        twist:      actTwist || null,
      });
    }
    return acts;
  }

  // ── Generate side quests ──────────────────────────────
  function generateSideQuests(config, levelRange, actIndex) {
    const quests = [];
    const usedTemplates = new Set();

    for (let i = 0; i < config.sideQuests; i++) {
      const qType = pick(COMPONENTS.sideQuestTemplates);
      const rawTpl = pick(qType.templates);
      const vars  = {
        enemy: pick(['a local crime boss', 'the villain\'s agents', 'a mercenary band', 'a transformed ally', 'a rival faction']),
        demand: pick(['information about the party', 'a specific magical artifact', 'safe passage through their territory', 'the release of one of their own prisoners']),
      };
      const desc = interpolate(rawTpl, vars);

      const rewardTier = levelRange.end <= 5  ? 'level1_5'  :
                         levelRange.end <= 10 ? 'level6_10' :
                         levelRange.end <= 15 ? 'level11_15': 'level16_20';

      quests.push({
        title:    generateQuestTitle(qType.type, actIndex, i),
        type:     qType.type,
        level:    `${levelRange.start}–${levelRange.end}`,
        desc,
        reward:   pick(COMPONENTS.rewards[rewardTier]),
        optional: Math.random() < 0.3,
        dc:       10 + Math.round((levelRange.start + levelRange.end) / 2),
      });
    }
    return quests;
  }

  function generateQuestTitle(type, act, idx) {
    const prefixes = {
      Rescue:      ["The Lost","Captive in the Dark","No One Left Behind","Worth Saving"],
      Investigation:["Who Killed","The Truth of","What They Found","Unraveling"],
      Escort:      ["Safe Passage","The Long Road","Getting There","Protecting"],
      Heist:       ["Stealing Back","The Inside Job","One Quiet Night","Taking What's Owed"],
      Diplomacy:   ["Bridge the Divide","Words Before War","The Reluctant Alliance","Making Peace"],
      Dungeon:     ["The Sealed Level","What Waits Below","Old Bones","Into the Dark"],
      Mystery:     ["The Missing","What Everyone Forgot","No Explanation Given","Strange Signs"],
      Combat:      ["The Coming Storm","Clear the Road","No Survivors","Stop Them Here"],
    };
    const suffixes = ["of the {loc}","at {season}","before {event}","in the Shadow of {villain}","for the sake of {person}"];
    const locWords = ["Ruins","Forest","Tower","Keep","Harbor","Mountain","Gate","Valley"];
    const seasons  = ["the Harvest","Midsummer","the Long Dark","the Thaw","Solstice"];
    const events   = ["the Festival","the Siege","the Trial","the Summit","the Eclipse"];
    const persons  = ["the Innocent","the Fallen","the Living","the Lost","the Remembered"];

    const pArr = prefixes[type] || ["The"];
    const suffix = pick(suffixes)
      .replace('{loc}',    pick(locWords))
      .replace('{season}', pick(seasons))
      .replace('{event}',  pick(events))
      .replace('{villain}','the Enemy')
      .replace('{person}', pick(persons));

    return `${pick(pArr)} ${suffix}`;
  }

  function generateActSummary(actIdx, config, base, beat) {
    const phases = [
      `The heroes are drawn into the campaign's central conflict. Their first steps bring them to ${base.locations[0] || 'the starting region'}, where they encounter the opening salvo of ${base.defaultVillain.name}'s machinations. ${beat} The party establishes their initial alliances and begins to understand the true scope of what they face.`,
      `The conspiracy deepens. Evidence gathered points to increasingly powerful forces at work. The heroes discover that the villain's reach extends further than they imagined, and that some of the people they trusted may have divided loyalties. ${beat} A significant faction event changes the political landscape permanently.`,
      `The point of no return. The heroes have accumulated enough knowledge and power to strike at the villain's core operations — but doing so will expose them to their full wrath. ${beat} Everything that has been built over the campaign is tested as the villain goes on the offensive.`,
      `The penultimate confrontation. The villain's master plan enters its final phase. The heroes must navigate both the physical dangers and the moral weight of their choices throughout the campaign. ${beat} Former enemies may become desperate allies.`,
      `The final act. Everything converges. The heroes stand between the villain's completion of their plan and whatever world remains afterward. ${beat} The ending is determined by the choices made in every act that preceded it.`,
      `Epilogue. What remains after the campaign's resolution. The consequences ripple outward, and the heroes must decide who they are now that the crisis has passed.`
    ];
    return phases[Math.min(actIdx, phases.length - 1)];
  }

  // ── Generate complete rewards by act ─────────────────
  function generateRewards(config, acts) {
    if (!config.mixRewards) return null;
    return acts.map((act) => {
      const tier = act.levelEnd <= 5  ? 'level1_5'  :
                   act.levelEnd <= 10 ? 'level6_10' :
                   act.levelEnd <= 15 ? 'level11_15': 'level16_20';
      return {
        act:   act.number,
        items: pickN(COMPONENTS.rewards[tier], 2),
      };
    });
  }

  // ── XP budget note ────────────────────────────────────
  function xpNote(config) {
    const adj = config.players === 4 ? 0 : (config.players - 4) * 10;
    const sign = adj >= 0 ? '+' : '';
    return `Base XP budgets adjusted ${sign}${adj} XP per encounter for ${config.players} players. Moderate encounters: ${80 + adj} XP. Severe (boss): ${120 + adj} XP.`;
  }

  // ── Main forge function ───────────────────────────────
  async function forge(overrides) {
    const config  = overrides ? { ..._config, ...overrides } : readConfig();
    _config = config;

    UI.showLoading();
    await UI.animateLoading(['Selecting campaign seed…', 'Building the villain…', 'Populating the world…', 'Weaving side quests…', 'Finishing the manuscript…']);

    const base      = selectCampaign(config);
    const villain   = generateVillain(base, config, overrides?.villainOverride);
    const locations = generateLocations(base, config, overrides?.locationOverride);
    const factions  = generateFactions(base, config, overrides?.factionOverride);
    const twists    = generateTwists(config);
    const npcs      = generateNPCs(base, config);
    const hook      = generateHook(config);
    const acts      = generateActs(base, config, locations, twists);
    const rewards   = generateRewards(config, acts);

    _current = {
      config,
      base,
      villain,
      locations,
      factions,
      twists,
      npcs,
      hook,
      acts,
      rewards,
      generated: new Date().toISOString(),
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

  return { forge, reforge, getCurrent, getConfig, applyMixChanges };

})();
