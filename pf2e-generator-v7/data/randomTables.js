/**
 * data/randomTables.js -- Build 7
 * Campaign-specific d20 random tables for GMs
 */

const RANDOM_TABLES = (function() {
  'use strict';

  // ── Urban Event Tables (d20) ─────────────────────────────────────────────
  const URBAN_EVENTS = {
    generic: [
      'A street brawl spills out of a tavern -- the loser has a message for the party.',
      'A merchant\'s cart overturns, scattering rare goods. Someone is already stealing.',
      'A public execution is announced for dawn. The condemned sends a plea through a child.',
      'City guards are shaking down a district. Bribes or a story are needed to pass.',
      'A fire breaks out in a craftsman\'s quarter. The cause is unclear.',
      'A traveling circus sets up. One of the performers is clearly not who they appear.',
      'A body is found in the canal with a faction sigil carved into the palm.',
      'A crier announces a bounty -- for someone the party has met.',
      'A food riot is forming at the granary gates.',
      'An inquisitor arrives from the capital, asking pointed questions about outsiders.',
      'Someone has been posting seditious broadsheets overnight. Guards are tearing them down.',
      'A wealthy noble\'s hound escapes into the market, trailing something in its teeth.',
      'Rain of fish in the market square. No one can explain it. Seers are alarmed.',
      'A guild master is found dead in his locked office. The lock was not forced.',
      'Street performers stage a play that\'s clearly based on the party\'s last adventure.',
      'A child tugs at a party member\'s cloak and hands them a folded note, then runs.',
      'The water in the fountain turns briefly red. Priests say it is an omen.',
      'A foreign dignitary\'s procession passes. An assassin is spotted in the crowd.',
      'Two rival guild factions are in a stand-off in the plaza. Violence is seconds away.',
      'A beggar whispers a name the party recognizes -- then pretends to know nothing.',
    ],
    political: [
      'A vote in the council was fixed. A clerk is trying to sell the proof.',
      'The governor\'s seal has been stolen. Every official document is now suspect.',
      'A noble house is being systematically ruined -- someone is calling in old debts.',
      'A secret meeting of faction leaders went very wrong. Survivors are scattered.',
      'The census taker never returned from the lower districts. His records are missing.',
      'A popular reformer is about to be arrested on fabricated charges.',
      'Two noble heirs claim the same title. Both have forged documents.',
      'A spy was caught -- but they\'re not sure which side he was really working for.',
      'The city\'s taxation records show a missing year. Someone is covering something up.',
      'An anonymous pamphlet is accusing a beloved figure of treason. It might be true.',
    ],
    undead: [
      'Graves in the city cemetery are being dug up from the inside.',
      'A funeral procession stops -- the corpse sits up. Mourners flee.',
      'Someone is selling "eternal candles" that burn cold and attract the dead at night.',
      'A district has gone quiet. Lights out. No guards will enter after dusk.',
      'A necromancer\'s former apprentice is seeking protection -- her master wants her back.',
      'The city\'s death records have been altered. People who died years ago have entries.',
      'Bone dust is showing up in the water supply. No one knows the source.',
      'A child has started sleepwalking to the cemetery every night and returning unharmed.',
      'A ghost is haunting the bathhouse. It keeps trying to warn someone.',
      'The body of a murdered noble won\'t stay buried. She has something to say.',
    ],
    arcane: [
      'A wizard\'s tower went silent two nights ago. The wards are still active.',
      'Magical items are malfunctioning across one district. No pattern anyone can explain.',
      'A spontaneous portal opened in a warehouse. Things are coming through.',
      'An apprentice is auctioning off her master\'s spellbooks. The master is not dead.',
      'A strange attractor is pulling all metal objects in the harbor district slightly eastward.',
      'Someone is selling counterfeit spell components. Three mages have already died.',
      'A diviner predicts a major event in 72 hours. She won\'t say what it is.',
      'A golem has gone rogue and is repairing a building that burned down 40 years ago.',
      'A ward on the mages\' quarter failed. Memories are bleeding between neighbors.',
      'The local Pathfinder lodge received a package that no one will open.',
    ],
  };

  // ── Wilderness Encounter Flavors (d20, by terrain) ───────────────────────
  const WILDERNESS_EVENTS = {
    forest: [
      'A trail of strange footprints -- each foot has seven toes.',
      'An abandoned campfire still smoldering. Three bedrolls. No people.',
      'A tree has been clawed at a height nothing natural could reach.',
      'A stream runs in the wrong direction for this terrain.',
      'Birdsong stops suddenly across a wide area.',
      'A scarecrow on the edge of a ruined farm is watching the road.',
      'A rope bridge over a gorge -- the far side has been cut.',
      'Fresh graves. No markers. Dug within the last day.',
      'A hunting horn sounds, but no hunter appears.',
      'A circle of mushrooms 30 feet wide. The ground inside is warm.',
      'A wounded deer runs past toward the party, not away.',
      'Smoke rising from a hollow that shouldn\'t have any buildings.',
      'A tree with dozens of personal items nailed to it -- offerings or warnings.',
      'The path ahead is covered in ash but there\'s no sign of fire.',
      'A child\'s shoe hanging from a branch. No child. No footprints.',
      'A stone statue in the middle of the trail. Recent. Not ancient.',
      'Insects swarm a specific boulder as if attending something within.',
      'A pack animal stands in the road, unattended, loaded with trade goods.',
      'The trees are older here. The light is wrong. Time feels slower.',
      'A ranger is trailing the party. She doesn\'t look hostile -- yet.',
    ],
    mountain: [
      'An avalanche scar fresh enough that the dust is still settling.',
      'A shrine to a forgotten god at the peak of a minor summit.',
      'Screaming from above -- a climber on a ledge, something else up there with them.',
      'A cave entrance sealed from the inside.',
      'Burned wagons in a pass. The attackers left in a hurry.',
      'A goat with a message tied to its horn, no owner in sight.',
      'Ice that shouldn\'t be there at this altitude and season.',
      'A carved stone marking a border that no current nation claims.',
    ],
    swamp: [
      'Will-o-wisps drifting ahead -- they\'re leading, not luring.',
      'A house on stilts with the ladder pulled up. Smoke from the chimney.',
      'A body pinned below the waterline by a stake driven through its clothing.',
      'Alligator skulls arranged in a deliberate pattern on the shore.',
      'A witch\'s market -- three stalls, no sellers visible, goods on offer.',
      'Fog that carries voices from what sounds like a crowded marketplace.',
      'A lone boat adrift, oars shipped, cargo intact, no one aboard.',
      'An island of dry land with a single ancient tree. A figure sits beneath it.',
    ],
    plains: [
      'A wagon train circled defensively. No attack in sight. Everyone is silent.',
      'Crop circles -- fresh, mathematical, and not made by any hand.',
      'A nomad camp abandoned mid-meal. Fires still burning.',
      'Three gallows on a hill. All three are occupied. None of them are dead.',
      'A dust cloud on the horizon moving against the wind.',
      'A road shrine with a dozen fresh candles and a name the party knows.',
      'Soldiers from a war that ended before any of them were born, still marching.',
      'A child flying a kite on a featureless plain, miles from any settlement.',
    ],
  };

  // ── Tavern / Inn Random Hooks (d12) ──────────────────────────────────────
  const TAVERN_HOOKS = [
    'A traveling merchant offers an unusual item at a suspiciously good price.',
    'A bard is performing a ballad that\'s clearly about local events. She knows too much.',
    'A patron in the corner booth is watching the door. Every arrival makes him flinch.',
    'A drunken guard captain is saying things she absolutely shouldn\'t be saying publicly.',
    'Someone has left a sealed letter at the bar addressed to "whoever needs it most."',
    'A card game in the back is getting intense. One player is definitely cheating. So is another.',
    'A pilgrim on a holy journey asks the party to escort her to the next wayshrine.',
    'The innkeeper whispers that she has a room the party needs to see. She\'s terrified.',
    'A young squire is bragging about his lord\'s plans. His lord would be furious.',
    'Two people at separate tables are reading the same coded letter, different copies.',
    'A collector offers to buy any unusual items the party has found. No questions asked.',
    'The night\'s special is something that shouldn\'t exist in this region. Where did it come from?',
  ];

  // ── NPC Name Tables (d20, by culture/region type) ────────────────────────
  const NPC_NAMES = {
    imperial: {
      first_m: ['Caelius','Maxen','Varro','Darian','Titus','Lucan','Aldric','Corvus','Seren','Bastian','Hadrian','Marcus'],
      first_f: ['Livia','Calla','Vesta','Mirena','Aurelia','Sabina','Cassia','Neria','Portia','Silvana','Lucia','Maris'],
      last: ['Voss','Kast','Aldren','Bright','Crane','Harrow','Mourne','Vane','Dusk','Fell','Greaves','Thorne'],
    },
    northern: {
      first_m: ['Bjorn','Halvard','Sigvard','Ulf','Ragnor','Grim','Thorsten','Leif','Eirik','Sven','Gunnar','Asger'],
      first_f: ['Astrid','Sigrid','Freya','Runa','Ingrid','Solveig','Thyra','Ylva','Brynhild','Hilda','Nanna','Revna'],
      last: ['Ironside','Stormcrow','Blackfell','Longstride','Wolfborn','Ashhand','Frostmane','Greyhelm','Stoneback','Quickblade'],
    },
    eastern: {
      first_m: ['Kazim','Dario','Roshan','Farid','Tariq','Emre','Bora','Cyrus','Navid','Soren','Reza','Jamal'],
      first_f: ['Zara','Leila','Yasmin','Nadia','Shirin','Aida','Mona','Parisa','Soraya','Kian','Dara','Nasrin'],
      last: ['al-Rashid','ibn Tariq','of the Silver Road','the Elder','of the Oasis','al-Fariq','ibn Soran','the Swift'],
    },
    halfling: {
      first_m: ['Pip','Corwin','Fenwick','Jasper','Merric','Cob','Tam','Bram','Hobson','Perkin','Milo','Tasso'],
      first_f: ['Rosie','Lila','Nessa','Bree','Calla','Fern','Poppy','Marigold','Willow','Tansy','Primrose','Nettle'],
      last: ['Goodbarrel','Underhill','Lightfoot','Thistledown','Burrows','Hayfoot','Greenleaf','Cloverfield','Ashwick','Brackenshire'],
    },
    gnome: {
      first_m: ['Zibbit','Quink','Fendrick','Wobble','Nix','Trix','Gadder','Sprocket','Fizwick','Brindle','Perch','Klick'],
      first_f: ['Lixxi','Vree','Pippi','Zanna','Twink','Sable','Mirrix','Daze','Flick','Sorra','Nenn','Quin'],
      last: ['Copperkettle','Twistgear','Flashbolt','Oddments','Brightstone','Clanksworth','Sparklewing','Fizzpot'],
    },
    elven: {
      first_m: ['Aelindra','Caladrel','Elegos','Tanaquil','Valandil','Erevan','Soveliss','Aliel','Fenian','Laucian','Ryld','Ahanu'],
      first_f: ['Sylvara','Menelwen','Aravis','Celebrindal','Nimriel','Talindra','Firavel','Lieselle','Anastriana','Quillathe','Rhowyn','Sariel'],
      last: ['Moonshadow','Dawnwhisper','Starweave','Silvermist','Brightglade','Swiftwind','Thornweald','Nightbloom','Icefall','Emberveil'],
    },
  };

  // ── Weather Tables (d12, by season/biome) ────────────────────────────────
  const WEATHER = {
    temperate_spring: [
      'Clear skies, mild breeze. Excellent travel.',
      'Overcast, threatening rain. Rolls to track at -1.',
      'Steady rain. Difficult terrain on unpaved roads.',
      'Fog in the morning valleys (burns off by midday).',
      'Unseasonal cold snap. Light frost at night.',
      'Sudden thunderstorm (1d4 hours). Lightning near hilltops.',
      'Perfect spring day. Morale bonus: reduce one fatigue.',
      'Hail for an hour. 1 bludgeoning damage per minute unprotected.',
      'Strong winds. Ranged attacks at -2. Flying is difficult.',
      'Flash flooding on low roads. Alternative route or Athletics (DC 18).',
      'Mud season in full force. Mounts move at half speed.',
      'Sunny and crisp. Best possible travel day.',
    ],
    temperate_summer: [
      'Blazing heat (95°F). Constitution check (DC 15) every 4 hrs or fatigued.',
      'Perfect summer day. Excellent visibility.',
      'Afternoon thunderheads build. Shelter by evening.',
      'Drought conditions. Water sources are unreliable.',
      'Haze and humidity. Perception at -1, discomfort.',
      'Wildfire smoke on the horizon. Direction unknown.',
      'Cool breeze breaks the heat. Comfortable travel.',
      'Dust storm (arid regions). Visibility 10 ft. Survival DC 16 to navigate.',
      'Swarms of biting insects at dusk. Camp is miserable.',
      'Sudden severe storm. Streams flood. Seek shelter.',
      'Oppressive muggy heat. Armor feels 5 lbs heavier.',
      'Clear skies, light breeze. Ideal conditions.',
    ],
    temperate_autumn: [
      'Crisp clear morning. Frost by midnight.',
      'Leaves obscure the trail. Tracking +2 DC.',
      'Grey drizzle all day. Miserable but passable.',
      'First hard frost overnight. Water sources may freeze.',
      'Gale-force winds. Impossible to make fire without shelter.',
      'Fog so thick visibility drops to 30 ft.',
      'Beautiful clear autumn day. Perfect light.',
      'Sleet storm. All terrain is difficult. Fires won\'t stay lit.',
      'Early snowfall (light). Tracks are easy to follow.',
      'Howling windstorm at night. Constitution DC 12 or poor sleep.',
      'Unexpectedly warm. Final gift before winter.',
      'Heavy storm. Impassable roads. One-day delay.',
    ],
    temperate_winter: [
      'Blizzard. Travel impossible. Shelter mandatory.',
      'Clear and brutally cold. Con DC 14 every 4 hrs or fatigued.',
      'Light snowfall. Slowed movement. Tracks are visible.',
      'Freezing fog. Visibility 20 ft. Surfaces are slippery.',
      'Sharp clear day. Cold but manageable.',
      'Ice storm overnight. Roads treacherous (Acrobatics DC 14).',
      'Snowdrifts block the pass. Alternative route needed.',
      'Unusually mild day. Snow is melting. Mud and slush.',
      'Wind chill makes -5°F feel like -30°F. Exposure risk.',
      'Clear starry night. Deadly cold. Fire is essential.',
      'Powder snow. Beautiful. Horses struggle, sleds thrive.',
      'The sky turns an eerie green before a major storm hits.',
    ],
  };

  // ── Rumor Mills (d20, campaign-theme-specific) ───────────────────────────
  const RUMORS = {
    generic: [
      { rumor: 'The old road east has been blocked for a month. Merchants are paying double to go around.', truth: 'true' },
      { rumor: 'A dragon was spotted flying north of the Thornwood.', truth: 'exaggerated' },
      { rumor: 'The Duke\'s second son has gone missing. Official story is illness.', truth: 'true' },
      { rumor: 'The silver mine ran dry. The company is hiding it.', truth: 'mostly_true' },
      { rumor: 'A hermit in the hills has been curing the sick. No payment. Won\'t say how.', truth: 'true' },
      { rumor: 'Those cultists in the valley were actually a traveling theater troupe.', truth: 'false' },
      { rumor: 'The new temple priest isn\'t who they claim to be. The real one died months ago.', truth: 'true' },
      { rumor: 'There\'s a map to the old king\'s treasure hidden in plain sight in the market.', truth: 'exaggerated' },
      { rumor: 'The garrison has been secretly reduced by half. Nobody knows where the soldiers went.', truth: 'true' },
      { rumor: 'Wolves have been acting strangely -- organizing, almost intelligently.', truth: 'true' },
    ],
    political: [
      { rumor: 'Three council members have been receiving payments from the same foreign source.', truth: 'true' },
      { rumor: 'The governor is dying. The succession hasn\'t been arranged.', truth: 'mostly_true' },
      { rumor: 'The peace treaty was a forgery. The real one was never signed.', truth: 'true' },
      { rumor: 'A faction of the city watch has declared neutrality in the coming conflict.', truth: 'exaggerated' },
      { rumor: 'The merchant\'s guild has been funding both sides of the border dispute.', truth: 'true' },
    ],
    undead: [
      { rumor: 'The graveyard keeper hasn\'t been seen in a week. His dog is still there, waiting.', truth: 'true' },
      { rumor: 'People who visit the northern mausoleum at night don\'t always come back.', truth: 'true' },
      { rumor: 'A necromancer has been buying fresh bodies from the undertaker.', truth: 'true' },
      { rumor: 'The old plague ward was sealed because something moved in, not because of plague.', truth: 'mostly_true' },
      { rumor: 'There\'s a lich underneath the city. Has been for two centuries. Leaves people alone.', truth: 'false' },
    ],
    arcane: [
      { rumor: 'The mages\' tower failed its annual inspection. All the wards are failing.', truth: 'mostly_true' },
      { rumor: 'Someone is harvesting ambient magic from the ley line under the market district.', truth: 'true' },
      { rumor: 'A spell went wrong in the academy. Three students are missing.', truth: 'true' },
      { rumor: 'The archmage hasn\'t been seen in public for months. She left a simulacrum in her place.', truth: 'true' },
      { rumor: 'There\'s a dead magic zone expanding slowly under the eastern quarter.', truth: 'exaggerated' },
    ],
  };

  // ── Mission Seed Hooks (d10, for when players go off-script) ────────────
  const MISSION_SEEDS = [
    'A stranger overpays for something trivial -- clearly a test, or bait.',
    'An NPC the party helped earlier turns up dead. Clues point back to the party\'s last job.',
    'A letter arrives for a party member. It\'s from someone who shouldn\'t know they\'re here.',
    'A faction ally asks a "small" favor that turns out to be deeply inconvenient.',
    'Someone is following the party. When confronted, they defect and ask for sanctuary.',
    'A treasure map is purchased, traded, or stolen -- and it leads somewhere the campaign already uses.',
    'An old enemy reappears -- but as an ally to a different side.',
    'The party witnesses a crime. Intervening creates enemies. Ignoring it creates guilt.',
    'A contact goes silent. Investigation reveals they were warned off -- about the party.',
    'A child asks for help finding a parent. The parent is somewhere in the current dungeon.',
  ];

  // ── Main roll function ───────────────────────────────────────────────────
  function roll(table) {
    return table[Math.floor(Math.random() * table.length)];
  }

  function rollMultiple(table, n) {
    var results = [];
    var copy = table.slice();
    while (results.length < n && copy.length > 0) {
      var i = Math.floor(Math.random() * copy.length);
      results.push(copy.splice(i, 1)[0]);
    }
    return results;
  }

  function generateSessionTables(campaign) {
    var theme = (campaign && campaign.theme) || 'generic';
    var season = (campaign && campaign.season) || 'temperate_spring';

    // Urban events: 5 themed + always has generic fallback
    var urbanPool = (URBAN_EVENTS[theme] || []).concat(URBAN_EVENTS.generic);
    var wildPool  = WILDERNESS_EVENTS.forest; // default
    if (campaign && campaign.environment) {
      var env = campaign.environment.toLowerCase();
      if (env.includes('mountain'))      wildPool = WILDERNESS_EVENTS.mountain;
      else if (env.includes('swamp') || env.includes('marsh')) wildPool = WILDERNESS_EVENTS.swamp;
      else if (env.includes('plain') || env.includes('grass')) wildPool = WILDERNESS_EVENTS.plains;
    }

    var rumorPool = (RUMORS[theme] || []).concat(RUMORS.generic);

    return {
      urban:        rollMultiple(urbanPool, 8),
      wilderness:   rollMultiple(wildPool, 8),
      tavern:       rollMultiple(TAVERN_HOOKS, 6),
      weather:      WEATHER[season] || WEATHER.temperate_spring,
      rumors:       rollMultiple(rumorPool, 6),
      missionSeeds: rollMultiple(MISSION_SEEDS, 4),
    };
  }

  function generateNPCName(culture) {
    culture = culture || 'imperial';
    var pool = NPC_NAMES[culture] || NPC_NAMES.imperial;
    var isFemale = Math.random() < 0.5;
    var firstName = roll(isFemale ? pool.first_f : pool.first_m);
    var lastName  = roll(pool.last);
    return firstName + ' ' + lastName;
  }

  return {
    URBAN_EVENTS:    URBAN_EVENTS,
    WILDERNESS_EVENTS: WILDERNESS_EVENTS,
    TAVERN_HOOKS:    TAVERN_HOOKS,
    NPC_NAMES:       NPC_NAMES,
    WEATHER:         WEATHER,
    RUMORS:          RUMORS,
    MISSION_SEEDS:   MISSION_SEEDS,
    roll:            roll,
    rollMultiple:    rollMultiple,
    generateSessionTables: generateSessionTables,
    generateNPCName:       generateNPCName,
  };
})();
