/**
 * js/encounterBuilder.js  —  Phase 3
 *
 * PF2e Encounter Builder:
 *   • Creature library with 60+ creatures across levels 1-20
 *   • XP budget tracker with difficulty bars (Trivial/Low/Moderate/Severe/Extreme)
 *   • Party-level & player-count aware budgets
 *   • Filter by level, trait, role, theme
 *   • Save/load encounter slots per act
 *   • Export encounter cards as printable HTML
 */

const EncounterBuilder = (() => {
  'use strict';

  // ─── Creature Library ───────────────────────────────────────────────────
  // Each creature: { name, level, traits[], role, xp (relative to party level), source, tactics, specialAbility }
  // XP values: creature at party level = 40xp; each level above = +10xp; each below = -10xp (PF2e standard)

  const CREATURE_LIB = [
    // ── Level 0–1 Creatures ──
    { name: 'Goblin Commoner',        level: -1, traits: ['goblin','humanoid'],      role: 'Minion',    theme: ['any'],          tactics: 'Swarms in numbers. Attacks then retreats behind allies.',     specialAbility: 'Goblin Scuttle (Reaction): Step when an ally moves adjacent.' },
    { name: 'Giant Rat',              level: 0,  traits: ['animal'],                 role: 'Minion',    theme: ['any'],          tactics: 'Bites then runs; comes in packs of 4+.',                     specialAbility: 'Disease (DC 14 Fort): Filth Fever on a critical hit.' },
    { name: 'Skeleton Guard',         level: 1,  traits: ['undead','skeleton'],       role: 'Soldier',   theme: ['undead'],       tactics: 'Mindless; advances and attacks. Ignores flanked condition.', specialAbility: 'Undead Resistance: Immune to poison, disease, bleed, death.' },
    { name: 'Zombie Shambler',        level: 1,  traits: ['undead','zombie'],         role: 'Brute',     theme: ['undead'],       tactics: 'Slow but relentless. Grabs and chomps.',                     specialAbility: 'Slow (−10 speed); takes a 3-action turn.' },
    { name: 'Giant Spider',           level: 1,  traits: ['animal','spider'],         role: 'Ambusher',  theme: ['nature','any'], tactics: 'Hides in webbing; drops on targets; retreats to web.',       specialAbility: 'Web (Ranged): Restrained on failed DC 17 Reflex.' },
    { name: 'Goblin Warrior',         level: 1,  traits: ['goblin','humanoid'],       role: 'Skirmisher',theme: ['any'],          tactics: 'Moves every turn; flanks with allies.',                      specialAbility: 'Goblin Song: Demoralize as free action.' },
    { name: 'Giant Centipede',        level: 1,  traits: ['animal','centipede'],      role: 'Skirmisher',theme: ['nature'],       tactics: 'Attacks and poisons, retreats if bloodied.',                 specialAbility: 'Poison (DC 15 Fort): Clumsy 1 for 1 round.' },
    { name: 'Wolf',                   level: 1,  traits: ['animal','wolf'],           role: 'Flanker',   theme: ['nature'],       tactics: 'Trips prone targets; pack tactics.',                         specialAbility: 'Trip: Free trip attempt on hit.' },
    // ── Level 2–4 ──
    { name: 'Hobgoblin Soldier',      level: 2,  traits: ['goblin','humanoid'],       role: 'Soldier',   theme: ['any'],          tactics: 'Disciplined; holds formation; shields allies.',              specialAbility: 'Hobgoblin Discipline: +1 to Saving throws when adjacent to ally.' },
    { name: 'Gnoll Hunter',           level: 2,  traits: ['gnoll','humanoid'],        role: 'Archer',    theme: ['any'],          tactics: 'Attacks from range; moves when engaged.',                    specialAbility: 'Rugged Travel: Ignore difficult terrain from sand/rubble.' },
    { name: 'Ghoul',                  level: 2,  traits: ['undead','ghoul'],          role: 'Stalker',   theme: ['undead'],       tactics: 'Paralyzes key target; feasts on paralyzed foes.',            specialAbility: 'Paralysis (DC 15 Fort): Stunned on a failure.' },
    { name: 'Animated Armor',         level: 2,  traits: ['construct','animated'],    role: 'Guardian',  theme: ['arcane'],       tactics: 'Guards a fixed area; doesn\'t pursue far.',                  specialAbility: 'Construct Resistance: Immune to mental, disease, death, poison.' },
    { name: 'Dire Wolf',              level: 3,  traits: ['animal','wolf'],           role: 'Brute',     theme: ['nature'],       tactics: 'Alpha predator; charges and bites; pack tactics.',           specialAbility: 'Knockdown: Knock prone on critical hit.' },
    { name: 'Giant Wasp',             level: 3,  traits: ['animal','wasp'],           role: 'Flyer',     theme: ['nature'],       tactics: 'Fly-by stings; targets isolated characters.',                specialAbility: 'Sting Poison (DC 18 Fort): Clumsy 1, Drained 1.' },
    { name: 'Wight',                  level: 3,  traits: ['undead','wight'],          role: 'Drainer',   theme: ['undead'],       tactics: 'Targets casters first; drains negative energy.',             specialAbility: 'Drain Life: Drained 1 on hit; transfers HP to wight.' },
    { name: 'Young Dragon (White)',    level: 3,  traits: ['dragon'],                 role: 'Boss',      theme: ['ancient'],      tactics: 'Opens with breath weapon; melee when cooled.',               specialAbility: 'Breath Weapon (DC 20 Ref): 6d6 cold; recharge 1d4 rounds.' },
    { name: 'Merfolk Fighter',        level: 3,  traits: ['aquatic','humanoid'],      role: 'Skirmisher',theme: ['exploration'],  tactics: 'Fights in water; withdraws to deep water.',                  specialAbility: 'Amphibious. Trident +12; nets to Restrain.' },
    { name: 'Minotaur',               level: 3,  traits: ['fiend','humanoid'],        role: 'Brute',     theme: ['any'],          tactics: 'Charges and gores; rampages when bloodied.',                 specialAbility: 'Gore: On a Charge, add +1d6 piercing damage.' },
    { name: 'Harpy',                  level: 3,  traits: ['monster','humanoid'],      role: 'Controller',theme: ['any'],          tactics: 'Sings to charm; attacks distracted targets.',                specialAbility: 'Captivating Song (DC 18 Will): Compelled to approach.' },
    { name: 'Skeletal Champion',      level: 4,  traits: ['undead','skeleton'],       role: 'Soldier',   theme: ['undead'],       tactics: 'Commands lesser undead; fights with martial precision.',     specialAbility: 'Undead Command: Directs undead minions as part of its action.' },
    { name: 'Shadow',                 level: 4,  traits: ['undead','shadow'],         role: 'Stalker',   theme: ['undead'],       tactics: 'Stalks from darkness; hits and retreats into shadows.',      specialAbility: 'Shadow Spawn: Slain foes rise as shadows in 24 hours.' },
    { name: 'Gargoyle',               level: 4,  traits: ['aberration','gargoyle'],   role: 'Ambusher',  theme: ['ancient'],      tactics: 'Poses as statuary; activates when party passes.',            specialAbility: 'Stone Cloak: Blends into stonework; +4 Stealth in ruins.' },
    // ── Level 5–8 ──
    { name: 'Vampire Spawn',          level: 4,  traits: ['undead','vampire'],        role: 'Skirmisher',theme: ['undead','dark'],tactics: 'Charming feint; blood drain on grapple.',                    specialAbility: 'Blood Drain: On grapple, Drain Blood — +1 Drained.' },
    { name: 'Troll',                  level: 5,  traits: ['giant','troll'],           role: 'Brute',     theme: ['nature'],       tactics: 'Reckless aggression; regenerates until fire/acid used.',     specialAbility: 'Regeneration 15: Overcome by fire or acid damage.' },
    { name: 'Salamander',             level: 5,  traits: ['elemental','fire'],        role: 'Warrior',   theme: ['planar'],       tactics: 'Heat aura damages anyone nearby; spear and fire.',           specialAbility: 'Heat Aura: 1d6 fire to all adjacent at start of turn.' },
    { name: 'Wraith',                 level: 5,  traits: ['undead','wraith'],         role: 'Drainer',   theme: ['undead'],       tactics: 'Phases through walls; targets isolated characters.',          specialAbility: 'Negative Healing: Heals from negative energy; hurts from positive.' },
    { name: 'Manticore',              level: 5,  traits: ['beast','manticore'],       role: 'Archer',    theme: ['any'],          tactics: 'Keeps distance; launches tail spikes; closes when low.',     specialAbility: 'Tail Spikes (3/day): Three ranged attacks per Strike action.' },
    { name: 'Minotaur Maze-Tender',   level: 5,  traits: ['fiend','humanoid'],        role: 'Soldier',   theme: ['ancient'],      tactics: 'Guards a specific area; remembers every path.',              specialAbility: 'Maze Mastery: Immune to being lost; knows every tunnel.' },
    { name: 'Naiad Queen',            level: 5,  traits: ['fey','nymph'],             role: 'Caster',    theme: ['nature'],       tactics: 'Blinds with beauty; commands water; charming touch.',        specialAbility: 'Blinding Beauty (DC 22 Fort): Blinded 1 minute; immune undead.' },
    { name: 'Clockwork Soldier',      level: 6,  traits: ['construct','clockwork'],   role: 'Guardian',  theme: ['arcane'],       tactics: 'Methodical; executes programmed attack patterns.',            specialAbility: 'Efficient Winding: Gains extra action on even-numbered rounds.' },
    { name: 'Flesh Golem',            level: 6,  traits: ['construct','golem'],       role: 'Brute',     theme: ['arcane','undead'],tactics: 'Slow but immensely powerful; immune to spells.',            specialAbility: 'Electricity Galvanize: Electrical damage heals rather than harms.' },
    { name: 'Banshee',                level: 7,  traits: ['undead','ghost'],          role: 'Controller',theme: ['undead'],       tactics: 'Wail to weaken; incorporeal movement; unholy terror.',       specialAbility: 'Wail of the Banshee (DC 25 Fort): Drained 2d4 on failure.' },
    { name: 'Chimera',                level: 7,  traits: ['beast','chimera'],         role: 'Boss',      theme: ['ancient','any'],tactics: 'Multi-target; breath weapon; gores and claws simultaneously.',specialAbility: 'Three Heads: Can Strike with three different attacks per round.' },
    { name: 'Hezrou (Demon)',         level: 7,  traits: ['fiend','demon'],           role: 'Brute',     theme: ['planar'],       tactics: 'Disgusting stench aura; grabs and bites; summons demons.',   specialAbility: 'Stench Aura 15 ft: Sickened 1 (DC 22 Fort) to enter.' },
    { name: 'Sphinx',                 level: 8,  traits: ['beast','sphinx'],          role: 'Caster',    theme: ['ancient','divine'],tactics: 'Poses riddles; uses spells to test; attacks those who fail.',specialAbility: 'Ancient Wisdom: 4th-rank Dispel Magic, Comprehend Language at will.' },
    { name: 'Weretiger',              level: 8,  traits: ['beast','humanoid','lycanthrope'],role:'Shapeshifter',theme:['nature'], tactics: 'Uses humanoid form to get close; shifts for combat.',        specialAbility: 'Change Shape: Free action; gains +2d6 claw damage in tiger form.' },
    { name: 'Vampire Count',          level: 8,  traits: ['undead','vampire'],        role: 'Boss',      theme: ['undead','dark'],tactics: 'Charming and brutal; summons bats/wolves; mist escape.',      specialAbility: 'Mist Form: Can become gaseous mist as a free action (1/day).' },
    // ── Level 9–12 ──
    { name: 'Barbed Devil (Hamatula)',level: 8,  traits: ['fiend','devil'],           role: 'Soldier',   theme: ['planar'],       tactics: 'Impales grabbed targets; fear aura; calls reinforcements.',  specialAbility: 'Barbed Embrace: Grabbed creatures take piercing each round.' },
    { name: 'Stone Giant',            level: 9,  traits: ['giant','stone'],           role: 'Brute',     theme: ['ancient'],      tactics: 'Long-range boulder throw; melee devastation up close.',      specialAbility: 'Rock Catching: Can catch projectiles thrown at it.' },
    { name: 'Adult Black Dragon',     level: 9,  traits: ['dragon','acid'],           role: 'Boss',      theme: ['any'],          tactics: 'Hover-attacks; acid breath; dissolves terrain.',             specialAbility: 'Acid Breath (DC 27 Ref): 9d6 acid; 90-ft line; recharge.' },
    { name: 'Hydra',                  level: 9,  traits: ['beast','hydra'],           role: 'Brute',     theme: ['nature'],       tactics: 'Multiple heads each get an attack; regrows heads.',           specialAbility: 'Regenerate Head: Regrow 2 heads if not cauterized after severing.' },
    { name: 'Lich (Minor)',           level: 10, traits: ['undead','lich'],           role: 'Caster',    theme: ['undead','arcane'],tactics:'Opens with high-rank spells; phylactery means death is temporary.',specialAbility: 'Drain Spell: Use enemy spell slot charges to fuel its own magic.' },
    { name: 'Marilith (Demon)',       level: 10, traits: ['fiend','demon'],           role: 'Boss',      theme: ['planar'],       tactics: 'Six arms = six weapon strikes; tail to constrict.',           specialAbility: 'Six Arms: Makes 6 longsword Strikes per round as 3-action activity.' },
    { name: 'Storm Giant',            level: 11, traits: ['giant','electric'],        role: 'Boss',      theme: ['ancient','planar'],tactics:'Commands weather; throws lightning; devastating melee.',       specialAbility: 'Control Weather: Changes local conditions as a 1-minute ritual.' },
    { name: 'Adult Blue Dragon',      level: 11, traits: ['dragon','electricity'],    role: 'Boss',      theme: ['any'],          tactics: 'Hovering lightning breath; electrifies terrain.',            specialAbility: 'Lightning Breath (DC 30 Ref): 11d6 electricity; line.' },
    { name: 'Nalfeshnee (Demon)',     level: 11, traits: ['fiend','demon'],           role: 'Controller',theme: ['planar'],       tactics: 'Hamper and confuse; uses Unholy Aura; teleports.',           specialAbility: 'Unholy Aura: All demon allies gain +2 to AC and saves within 30 ft.' },
    { name: 'Planetar (Angel)',       level: 11, traits: ['celestial','angel'],       role: 'Soldier',   theme: ['divine'],       tactics: 'Sword + holy magic; heals allies; banishes fiends.',          specialAbility: 'Holy Sword +3: Deals extra 2d6 holy damage to unholy creatures.' },
    // ── Level 12–16 ──
    { name: 'Ancient Green Dragon',   level: 13, traits: ['dragon','poison'],         role: 'Boss',      theme: ['nature','ancient'],tactics:'Manipulative; poisons and charms; uses terrain advantage.',    specialAbility: 'Breath Weapon (DC 36 Fort): 13d8 poison; 50-ft cone; weakness.' },
    { name: 'Pit Fiend',              level: 13, traits: ['fiend','devil'],           role: 'Boss',      theme: ['planar'],       tactics: 'Commands devil armies; multiple powerful attacks; fireball.',  specialAbility: 'Pit Fiend Aura: Fiend allies gain +2; enemies are Frightened 1 on enter.' },
    { name: 'Balor (Demon Lord)',     level: 13, traits: ['fiend','demon'],           role: 'Boss',      theme: ['planar'],       tactics: 'Immolation aura; vorpal sword and flame whip; flies.',        specialAbility: 'Death Throes: Explodes on death for 10d10 fire to all within 100 ft.' },
    { name: 'Vampire Tyrant',         level: 13, traits: ['undead','vampire'],        role: 'Boss',      theme: ['undead','political'],tactics:'Dominates minds; commands undead legion; ancient cunning.',  specialAbility: 'Dominate (DC 35 Will): Controlled until next save; no limit on targets.' },
    { name: 'Guardian Naga',          level: 13, traits: ['aberration','naga'],       role: 'Caster',    theme: ['divine','ancient'],tactics:'Divine spells + physical attacks; spits venom.',              specialAbility: 'Divine Spells to 7th rank; healing 7th rank once per day.' },
    { name: 'Kraken',                 level: 14, traits: ['beast','kraken'],          role: 'Boss',      theme: ['exploration','nature'],tactics:'Multi-limb grapple; ink cloud blinds; drags into deep.',     specialAbility: 'Tentacles: Four tentacle Strikes per round; each can Grab.' },
    { name: 'Lich (Elder)',           level: 15, traits: ['undead','lich'],           role: 'Boss',      theme: ['undead','arcane'],tactics:'Ninth-rank magic; phylactery protection; paralyzing touch.',   specialAbility: 'Paralyzing Touch (DC 38 Fort): Paralyzed on failure until next save.' },
    { name: 'Ancient Red Dragon',     level: 16, traits: ['dragon','fire'],           role: 'Boss',      theme: ['any'],          tactics: 'Most feared of dragonkind; melts armor; controls minions.',   specialAbility: 'Breath Weapon (DC 42 Ref): 16d8+12 fire; 60-ft cone; 1d4 recharge.' },
    { name: 'Chelaxx (Demon Prince)', level: 16, traits: ['fiend','demon','unique'],  role: 'Boss',      theme: ['planar'],       tactics: 'Commands demon armies; reality-warping powers; ancient.',     specialAbility: 'Reality Rend: As an action, briefly tear a 10-ft hole to the Abyss.' },
    // ── Level 17–20 ──
    { name: 'Ancient Gold Dragon',    level: 17, traits: ['dragon','fire','good'],    role: 'Boss',      theme: ['divine'],       tactics: 'Usually allied; devastating if turned against party.',        specialAbility: 'Weakening Breath: Fort DC 44; Weakness 10 to physical for 1 min.' },
    { name: 'Kaiju (Mountain)',       level: 18, traits: ['beast','kaiju'],           role: 'Boss',      theme: ['ancient','nature'],tactics:'Simply enormous; attacks are AoE by default; can\'t be reasoned with.',specialAbility: 'Trample (5d10 + 20): All creatures in path save DC 44 Ref or full damage.' },
    { name: 'Apocalypse Dragon',      level: 18, traits: ['dragon','unique'],         role: 'Boss',      theme: ['ancient','planar'],tactics:'Reality-altering breath; destroys terrain; planar travel.',    specialAbility: 'Breath of Endings (DC 46 Fort): 18d10+20 negative + Drained 4.' },
    { name: 'God Caller Remnant',     level: 19, traits: ['undead','unique'],         role: 'Boss',      theme: ['divine'],       tactics: 'Channels dead deity energy; disrupts spellcasting.',          specialAbility: 'Divine Surge: As a free action, counterspell any divine or primal spell.' },
    { name: 'Demon Lord (Unique)',    level: 20, traits: ['fiend','demon','unique'],  role: 'Boss',      theme: ['planar'],       tactics: 'Reshapes surrounding terrain; multiple legendary actions.',    specialAbility: 'Mythic Resilience: Reduces all damage by 20; cannot be one-shot.' },
    { name: 'Runelord Ascendant',     level: 20, traits: ['humanoid','unique'],       role: 'Boss',      theme: ['arcane','ancient'],tactics:'Master of a magical school; shaped by one of the seven sins.',   specialAbility: 'Runic Empowerment: Deals +2 dice of their school\'s damage type.' },

    // ── Expanded Level -1 to 2: Common Threats ──
    { name: 'Kobold Scout',           level: -1, traits: ['kobold','humanoid'],       role: 'Skirmisher',theme: ['any'],          tactics: 'Retreats after each attack; triggers traps.',               specialAbility: 'Hurried Retreat: Step then Hide as one action.' },
    { name: 'Stirge',                 level: -1, traits: ['animal','stirge'],         role: 'Swarm',     theme: ['nature'],       tactics: 'Attaches and drains blood; hard to dislodge.',              specialAbility: 'Blood Drain: 1 Drained per round while attached.' },
    { name: 'Pony (Undead)',          level: 0,  traits: ['undead','animal'],         role: 'Mount',     theme: ['undead'],       tactics: 'Serves a rider; carries them into melee.',                  specialAbility: 'Undead: Immune to fear, mental; rider gains same immunity while mounted.' },
    { name: 'Boggart',                level: 0,  traits: ['fey','boggart'],           role: 'Trickster', theme: ['nature'],       tactics: 'Creates distractions; steals items; vanishes.',             specialAbility: 'Pilfering Hands: Steal unattended item as a free action on hit.' },
    { name: 'Giant Gecko',            level: 0,  traits: ['animal','lizard'],         role: 'Climber',   theme: ['nature'],       tactics: 'Fights from walls and ceilings; drops onto prey.',          specialAbility: 'Wall Climb: Treats vertical surfaces as normal ground.' },
    { name: 'Human Bandit',           level: 0,  traits: ['human','humanoid'],        role: 'Minion',    theme: ['any'],          tactics: 'Flanks with allies; surrenders if losing.',                 specialAbility: 'Sneak Attack 1d6: Extra damage when flanking.' },
    { name: 'Skeleton Archer',        level: 1,  traits: ['undead','skeleton'],       role: 'Archer',    theme: ['undead'],       tactics: 'Stays at max range; shoots until engaged.',                 specialAbility: 'Undead Resistance + Ranged: Immune to precision damage on a 1.' },
    { name: 'Vine Lasher',            level: 1,  traits: ['plant','vine'],            role: 'Controller',theme: ['nature'],       tactics: 'Grabs from a distance; immobilizes targets.',               specialAbility: 'Constrict: 1d8+2 on grappled target per round.' },
    { name: 'Dark Creeper',           level: 1,  traits: ['humanoid','dark'],         role: 'Rogue',     theme: ['any'],          tactics: 'Fights in shadows; death burst blinds.',                   specialAbility: 'Death Burst: Blinding light on death, DC 16 Fort or Blinded 1 min.' },

    // ── Expanded Level 3–5: Mid-Low Threats ──
    { name: 'Chuul',                  level: 4,  traits: ['aberration','aquatic'],    role: 'Grappler',  theme: ['ancient'],      tactics: 'Grabs prey and paralyzes; emerges from water.',             specialAbility: 'Paralytic Tentacles: Paralyzed 1 round on failed DC 20 Fort.' },
    { name: 'Doppelganger',           level: 4,  traits: ['aberration','shapeshifter'],role:'Infiltrator',theme: ['any'],         tactics: 'Impersonates party members; creates confusion.',             specialAbility: 'Change Shape: Free action; becomes any humanoid.' },
    { name: 'Tengu Swordmaster',      level: 4,  traits: ['tengu','humanoid'],        role: 'Duelist',   theme: ['any'],          tactics: 'Two-weapon flourishes; focuses one target.',                specialAbility: 'Swordtrained: +2 to attack with swords; Disarm as free action on crit.' },
    { name: 'Will-o-Wisp',            level: 4,  traits: ['aberration','wisp'],       role: 'Harasser',  theme: ['undead','nature'],tactics: 'Lures into danger; feeds on fear; invisible at will.',     specialAbility: 'Feed on Fear: Heals 1d6 when adjacent creature is frightened.' },
    { name: 'Xulgath Skulker',        level: 4,  traits: ['humanoid','xulgath'],      role: 'Skirmisher',theme: ['ancient'],      tactics: 'Stench aura disrupts melee; flanks with pack.',            specialAbility: 'Stench Aura 15ft: Sickened 1 (DC 19 Fort) on entry.' },
    { name: 'Ankheg',                 level: 3,  traits: ['animal','ankheg'],         role: 'Ambusher',  theme: ['nature'],       tactics: 'Burrows; surfaces under prey; spits acid.',                 specialAbility: 'Acid Spray (DC 20 Ref): 4d6 acid in 30-ft line; recharge 1d4.' },
    { name: 'Dryad',                  level: 3,  traits: ['fey','nymph'],             role: 'Caster',    theme: ['nature'],       tactics: 'Charms intruders; retreats into tree; calls allies.',       specialAbility: 'Tree Meld: Merge into any tree as an action; reemerge anywhere within 60 ft.' },
    { name: 'Lamia',                  level: 5,  traits: ['beast','humanoid','lamia'],role: 'Caster',    theme: ['divine','arcane'],tactics:'Charms; drains Wisdom; fights with scimitar.',              specialAbility: 'Wisdom Drain: -1d4 Wisdom on touch; recovers daily.' },
    { name: 'Kappa',                  level: 3,  traits: ['humanoid','aquatic'],      role: 'Guardian',  theme: ['nature'],       tactics: 'Guards waterway; polite challenges before fighting.',       specialAbility: 'Water Dish Head: Weakened if dish empties; +2 AC near water.' },
    { name: 'Phase Spider',           level: 4,  traits: ['aberration','spider'],     role: 'Ambusher',  theme: ['planar','nature'],tactics:'Phases out after each attack; bites from the Ethereal.',    specialAbility: 'Ethereal Jaunt: As an action, shift to Ethereal for 1 round.' },

    // ── Expanded Level 6–9: Significant Threats ──
    { name: 'Cyclops',                level: 6,  traits: ['giant','cyclops'],         role: 'Brute',     theme: ['ancient'],      tactics: 'Massive single strikes; prophetic vision.',                 specialAbility: 'Prophetic Charge: Reroll one attack roll per encounter; take better.' },
    { name: 'Medusa',                 level: 7,  traits: ['humanoid','medusa'],       role: 'Controller',theme: ['ancient','arcane'],tactics:'Petrifying gaze; snake hair attacks; lethal at range.',    specialAbility: 'Petrifying Gaze (DC 25 Fort): Slowed 1; two failures = Petrified.' },
    { name: 'Intellect Devourer',     level: 6,  traits: ['aberration'],             role: 'Controller',theme: ['arcane','planar'],tactics:'Body theft; psychic assault; hides in host.',              specialAbility: 'Body Thief: Inhabit a helpless creature; acts through host.' },
    { name: 'Night Hag',              level: 8,  traits: ['fiend','hag'],             role: 'Caster',    theme: ['planar','undead'],tactics:'Nightmare curse; soul gem; ethereal at will.',             specialAbility: 'Heartstone: Cast etherealness 3/day; focus on a soul gem.' },
    { name: 'Roc',                    level: 9,  traits: ['animal','bird'],           role: 'Boss',      theme: ['nature','exploration'],tactics:'Aerial dominance; grapples and drops prey from altitude.',specialAbility: 'Snatch: Grab and carry prey aloft; drop for 6d6 fall damage.' },
    { name: 'Ogrekin',                level: 6,  traits: ['giant','humanoid'],        role: 'Brute',     theme: ['any'],          tactics: 'Inbred ferocity; improvised weapons; rages.',              specialAbility: 'Toughness Mutation: Gains 30 HP max; specific damage vulnerability.' },
    { name: 'Dullahan',               level: 7,  traits: ['undead','dullahan'],       role: 'Hunter',    theme: ['undead'],       tactics: 'Hunts a specific named target; ignores all others.',        specialAbility: 'Death\'s Call: Name one creature; +2d6 damage against that target.' },
    { name: 'Redcap',                 level: 6,  traits: ['fey','redcap'],            role: 'Skirmisher',theme: ['nature','dark'], tactics: 'Extremely violent; boots of speed; cap absorbs blood.',    specialAbility: 'Iron Boots: Kick deals 2d8+6 bludgeoning plus 1d6 bleed.' },
    { name: 'Kirin',                  level: 7,  traits: ['beast','holy'],            role: 'Boss',      theme: ['divine','nature'],tactics:'Often allied; devastating if purification fails.',          specialAbility: 'Purity Aura: Allies within 30 ft gain +2 saves vs evil effects.' },
    { name: 'Stone Giant',            level: 8,  traits: ['giant','earth'],           role: 'Soldier',   theme: ['ancient','nature'],tactics:'Rock throwing at range; smashes in melee; cave expert.',   specialAbility: 'Rock Catching: Free action to catch thrown rocks; throw back next round.' },

    // ── Expanded Level 10–13: Elite Threats ──
    { name: 'Bebilith',               level: 10, traits: ['fiend','demon'],           role: 'Hunter',    theme: ['planar'],       tactics: 'Spider-demon that hunts other fiends; tears armor.',        specialAbility: 'Rend Armor: On crit, target\'s armor loses 2 Hardness permanently.' },
    { name: 'Alp',                    level: 10, traits: ['undead','dream'],          role: 'Stalker',   theme: ['undead','arcane'],tactics:'Haunts sleeping victims; psychic damage; difficult to kill.', specialAbility: 'Dream Form: Can only be permanently killed while target is awake.' },
    { name: 'Girtablilu',             level: 10, traits: ['humanoid','scorpion'],     role: 'Guardian',  theme: ['ancient','divine'],tactics:'Guardians of sacred sites; stinger and claws.',            specialAbility: 'Sacred Guardian: +4 AC and saves within sanctified ground.' },
    { name: 'Astral Deva',            level: 11, traits: ['celestial','angel'],       role: 'Boss',      theme: ['divine'],       tactics: 'Usually allied; overwhelming force if opposed.',            specialAbility: 'Stun (DC 30 Fort): Stunned 1 on hit with mace; 1/day.' },
    { name: 'Dragon Turtle',          level: 11, traits: ['dragon','aquatic'],        role: 'Boss',      theme: ['nature','ancient'],tactics:'Steam breath; bites ships; underwater advantage.',         specialAbility: 'Steam Breath (DC 32 Ref): 11d6 fire; only in water or humid.' },
    { name: 'Leukodaemon',            level: 11, traits: ['fiend','daemon'],          role: 'Caster',    theme: ['planar','undead'],tactics:'Spreads magical disease; summoned as plague vector.',        specialAbility: 'Pestilent Breath: 30-ft cone; Virulent Plague disease (DC 28 Fort).' },
    { name: 'Peryton',                level: 10, traits: ['beast','peryton'],         role: 'Flyer',     theme: ['any'],          tactics: 'Dive-attacks; rips out hearts; shadow betrays true form.',  specialAbility: 'Heart Harvest: +2d8 extra damage to humanoids; heals attacker.' },
    { name: 'Purple Worm',            level: 11, traits: ['animal','worm'],           role: 'Boss',      theme: ['ancient','nature'],tactics:'Swallows whole; burrows through stone; mindless rage.',    specialAbility: 'Swallow Whole: On crit grapple, target is Swallowed; 3d8 acid/round.' },
    { name: 'Sorrowsworn (Lost)',      level: 10, traits: ['aberration','shadow'],     role: 'Drainer',   theme: ['planar','undead'],tactics:'Feeds on despair; stronger when heroes are separated.',     specialAbility: 'Misery Aura: Creatures within 30 ft are Stupefied 1.' },
    { name: 'Androsphinx',            level: 12, traits: ['beast','sphinx'],          role: 'Boss',      theme: ['divine','ancient'],tactics:'Roar paralyzes; riddles; lethal claws; buff allies.',      specialAbility: 'Powerful Roar (DC 33 Will): Frightened 2; fail by 5 = Paralyzed 1 round.' },

    // ── Expanded Level 13–16: Greater Threats ──
    { name: 'Storm Giant',            level: 13, traits: ['giant','air'],             role: 'Boss',      theme: ['ancient','planar'],tactics:'Lightning mastery; calls storms; great reach.',            specialAbility: 'Lightning Rod: Immune to lightning; redirects as ranged attack on target.' },
    { name: 'Nightshade Nightwing',   level: 14, traits: ['undead','nightshade'],     role: 'Boss',      theme: ['undead'],       tactics: 'Flies; unholy damage; casts darkness; kills with gaze.',   specialAbility: 'Desecrating Aura 30ft: All undead within gain Regeneration 10.' },
    { name: 'Titan (Evil)',           level: 16, traits: ['giant','unique'],          role: 'Boss',      theme: ['planar','ancient'],tactics:'Ancient and massive; thrown boulders destroy buildings.',   specialAbility: 'Divine Thunderbolt: 80-ft line, 15d6 electricity, DC 40 Ref.' },
    { name: 'Gorgon',                 level: 13, traits: ['beast','gorgon'],          role: 'Boss',      theme: ['ancient'],      tactics: 'Petrifying breath; tramples; charges for massive damage.', specialAbility: 'Petrifying Breath (DC 35 Fort): Slowed → Petrified over 2 failures.' },
    { name: 'Crypsis Eel',            level: 13, traits: ['animal','aquatic'],        role: 'Ambusher',  theme: ['nature'],       tactics: 'Perfect camouflage; attacks from still water.',            specialAbility: 'Total Concealment: Invisible in water; Surprised on first round.' },
    { name: 'Leng Spider',            level: 14, traits: ['aberration','spider'],     role: 'Caster',    theme: ['planar','arcane'],tactics:'Planar silk traps; psychic venoms; casts from Leng.',      specialAbility: 'Leng Silk: Creatures struck are anchored to the Material Plane.' },
    { name: 'Veiled Master',          level: 15, traits: ['aberration','aboleths'],   role: 'Mastermind',theme: ['planar','ancient'],tactics:'Mind control; serves aboleth; rewrites memories.',         specialAbility: 'Memory Alteration: Change one memory on a failed DC 38 Will.' },
    { name: 'Lich (Wizard)',          level: 16, traits: ['undead','humanoid'],       role: 'Boss',      theme: ['undead','arcane'],tactics:'Phylactery; paralyzing touch; 8th-rank spells at will.',    specialAbility: 'Phylactery: Returns in 1d10 days unless phylactery also destroyed.' },
    { name: 'Brine Dragon (Adult)',    level: 14, traits: ['dragon','water'],          role: 'Boss',      theme: ['nature','ancient'],tactics:'Saltwater breath; tidal wave; fights near ocean.',         specialAbility: 'Brine Breath (DC 36 Fort): 13d6 acid; Sickened 2 on failure.' },
    { name: 'Charnel Colossus',        level: 15, traits: ['undead','construct'],      role: 'Boss',      theme: ['undead'],       tactics: 'Immense; built from thousands of bodies; aura of death.',  specialAbility: 'Death Aura 60ft: 3d6 negative per round; Frightened 2 DC 38 Will.' },

    // ── Expanded Level 17–20: Apex Threats ──
    { name: 'Norn',                   level: 17, traits: ['fey','giant'],             role: 'Caster',    theme: ['planar','ancient'],tactics:'Controls fate; can cut a life thread; brutal melee.',      specialAbility: 'Cut Threads: Force a reroll on any roll; choose which result stands.' },
    { name: 'Deathless Hierophant',    level: 17, traits: ['undead','unique'],         role: 'Boss',      theme: ['divine','undead'],tactics:'Commands divine undead; channeled divinity; antilife.',     specialAbility: 'Stolen Divinity: Counterspell divine spells as a reaction.' },
    { name: 'Shoggoth',               level: 18, traits: ['aberration','ooze'],       role: 'Boss',      theme: ['planar','ancient'],tactics:'Mindless horror; engulfs; speaks in all languages at once.', specialAbility: 'Engulf: DC 44 Ref or swallowed; 4d10 acid + 4d10 bludgeoning/round.' },
    { name: 'Elder Wendigo',          level: 18, traits: ['fiend','spirit'],          role: 'Boss',      theme: ['nature','dark'],  tactics:'Possesses hosts; causes cannibalism; cold immunity.',       specialAbility: 'Possession (DC 44 Will): Controls target; target acts against allies.' },
    { name: 'Planetar Angel',         level: 16, traits: ['celestial','angel'],       role: 'Boss',      theme: ['divine'],       tactics: 'Usually allied; divine sword; mass heals allies.',          specialAbility: 'Holy Sword: +3 holy bastard sword; +4d6 holy on hit.' },
    { name: 'Astral Leviathan',        level: 19, traits: ['beast','astral'],          role: 'Boss',      theme: ['planar','ancient'],tactics:'Whale-scale horror; crosses planes at will.',              specialAbility: 'Planar Surge: Forcibly eject all creatures to a random plane (DC 46 Will).' },
    { name: 'Terrasque (Weakened)',    level: 19, traits: ['beast','kaiju'],           role: 'Boss',      theme: ['ancient'],      tactics: 'Fully regenerating; 30-ft reach; swallows any size.',       specialAbility: 'Regeneration 50: Only 3 specific combined conditions stop regeneration.' },
    { name: 'Dread Wraith Sovereign',  level: 18, traits: ['undead','wraith'],         role: 'Boss',      theme: ['undead','planar'],tactics:'Commands wraith armies; drain that can\'t be healed normally.',specialAbility: 'Soul Rend: On kill, target rises as a Greater Shadow in 1 round.' },
    { name: 'Chaos Beast (Unique)',    level: 20, traits: ['aberration','chaos'],      role: 'Boss',      theme: ['planar'],       tactics: 'Constantly shifting form; random attack types; maddening.',  specialAbility: 'Corporeal Instability (DC 46 Fort): Target\'s body begins shifting; unable to use most actions.' },
    { name: 'The Undying Phoenix',     level: 19, traits: ['beast','fire','phoenix'],  role: 'Boss',      theme: ['divine','nature'],tactics:'Resurrects on death (first time); fire immunity; healing aura.', specialAbility: 'Reborn: On first death, returns at full HP after 1 round with all abilities reset.' },
  ];

  // XP values per level difference (creature level - party level)
  function creatureXP(creatureLevel, partyLevel) {
    const diff = creatureLevel - partyLevel;
    const table = { '-4':10, '-3':15, '-2':20, '-1':30, '0':40, '1':60, '2':80, '3':120, '4':160 };
    const key = Math.max(-4, Math.min(4, diff)).toString();
    return table[key] || (diff < -4 ? 9 : 200);
  }

  // Budget thresholds for a party of 4 (adjust per player)
  function budgets(playerCount) {
    const adj = (playerCount - 4) * 10;
    return {
      trivial:  40  + adj,
      low:      60  + adj,
      moderate: 80  + adj,
      severe:   120 + adj,
      extreme:  160 + adj,
    };
  }

  function difficultyLabel(xp, b) {
    if (xp < b.trivial)  return { label: 'Trivial',  css: 'trivial' };
    if (xp < b.low)      return { label: 'Low',      css: 'low' };
    if (xp < b.moderate) return { label: 'Low',      css: 'low' };
    if (xp < b.severe)   return { label: 'Moderate', css: 'moderate' };
    if (xp < b.extreme)  return { label: 'Severe',   css: 'severe' };
    return                      { label: 'Extreme',  css: 'extreme' };
  }

  // ─── State ──────────────────────────────────────────────────────────────

  let _encounter = [];   // { creature, count }
  let _partyLevel = 1;
  let _playerCount = 4;
  let _filter = { theme: 'any', role: 'any', search: '' };
  let _savedEncounters = {};  // keyed by act

  // ─── Render ─────────────────────────────────────────────────────────────

  function render(container, campaign) {
    _partyLevel  = campaign?.config?.startLevel  || 1;
    _playerCount = campaign?.config?.players     || 4;
    container.innerHTML = buildHTML(campaign);
  }

  function buildHTML(campaign) {
    const b = budgets(_playerCount);
    const themes = ['any','undead','arcane','divine','nature','urban','planar','ancient','political'];
    const roles  = ['any','Boss','Soldier','Brute','Skirmisher','Ambusher','Caster','Controller','Drainer','Flanker','Guardian','Minion','Archer','Flyer','Shapeshifter','Stalker'];

    return `
    <div class="eb-root">

      <div class="eb-header">
        <h2 class="eb-title">Encounter Builder</h2>
        <p class="eb-subtitle">PF2e Remaster · Party Level <span id="eb-party-level">${_partyLevel}</span> · ${_playerCount} Players</p>
      </div>

      <div class="eb-layout">

        <!-- Left: Creature Library -->
        <div class="eb-library">
          <div class="eb-lib-header">Creature Library</div>
          <div class="eb-filters">
            <input class="sz-input" id="ebSearch" type="text" placeholder="Search creatures…"
              oninput="EncounterBuilder.applyFilter()"/>
            <select class="sz-select" id="ebTheme" onchange="EncounterBuilder.applyFilter()">
              ${themes.map(t=>`<option value="${t}">${t==='any'?'Any Theme':t.charAt(0).toUpperCase()+t.slice(1)}</option>`).join('')}
            </select>
            <select class="sz-select" id="ebRole" onchange="EncounterBuilder.applyFilter()">
              ${roles.map(r=>`<option value="${r}">${r==='any'?'Any Role':r}</option>`).join('')}
            </select>
            <div class="eb-level-filter">
              <label class="sz-label">Level Range</label>
              <div style="display:flex;gap:4px;align-items:center;">
                <input class="sz-input" id="ebLvlMin" type="number" min="-1" max="20" value="${Math.max(-1,_partyLevel-3)}" style="width:56px"
                  oninput="EncounterBuilder.applyFilter()"/>
                <span>to</span>
                <input class="sz-input" id="ebLvlMax" type="number" min="-1" max="20" value="${Math.min(20,_partyLevel+4)}" style="width:56px"
                  oninput="EncounterBuilder.applyFilter()"/>
              </div>
            </div>
          </div>
          <div class="eb-creature-list" id="ebCreatureList">
            ${buildCreatureList()}
          </div>
        </div>

        <!-- Right: Current Encounter -->
        <div class="eb-encounter">
          <div class="eb-enc-header">
            Current Encounter
            <button class="tool-btn" onclick="EncounterBuilder.clearEncounter()" style="float:right;font-size:0.78rem;">✕ Clear</button>
          </div>

          <!-- XP Budget Bar -->
          <div class="eb-budget-section">
            <div class="eb-budget-labels">
              <span class="bud-label trivial">Trivial<br/>${b.trivial}</span>
              <span class="bud-label low">Low<br/>${b.low}</span>
              <span class="bud-label moderate">Moderate<br/>${b.moderate}</span>
              <span class="bud-label severe">Severe<br/>${b.severe}</span>
              <span class="bud-label extreme">Extreme<br/>${b.extreme}</span>
            </div>
            <div class="eb-budget-bar">
              <div class="eb-budget-fill" id="ebBudgetFill"></div>
            </div>
            <div class="eb-budget-status" id="ebBudgetStatus">
              <span id="ebTotalXP">0 XP</span> —
              <span id="ebDifficulty" class="diff-label">No creatures</span>
            </div>
          </div>

          <!-- Encounter Slots -->
          <div class="eb-slot-list" id="ebSlotList">
            <div class="eb-slot-empty">Add creatures from the library →</div>
          </div>

          <!-- Encounter Notes -->
          <div class="eb-enc-notes">
            <label class="sz-label">Encounter Setup Notes</label>
            <textarea class="sz-textarea" id="ebNotes" rows="3"
              placeholder="Terrain features, starting positions, tactics summary, environmental hazards…"></textarea>
          </div>

          <!-- Save / Export -->
          <div class="eb-enc-actions">
            <div class="eb-save-group">
              <label class="sz-label">Save to Act</label>
              <select class="sz-select" id="ebSaveAct">
                ${Array.from({length: campaign?.config?.acts||3}, (_,i)=>
                  `<option value="${i+1}">Act ${i+1}</option>`).join('')}
              </select>
              <button class="tool-btn primary" onclick="EncounterBuilder.saveEncounter()">💾 Save</button>
            </div>
            <button class="tool-btn" onclick="EncounterBuilder.exportCard()">📄 Export Card</button>
          </div>

          <!-- Saved Encounters -->
          <div id="ebSavedList">${buildSavedList(campaign)}</div>
        </div>

      </div>
    </div>`;
  }

  function buildCreatureList() {
    const search = _filter.search.toLowerCase();
    const minLvl = parseInt(document.getElementById('ebLvlMin')?.value ?? -1);
    const maxLvl = parseInt(document.getElementById('ebLvlMax')?.value ?? 24);

    let creatures = CREATURE_LIB.filter(c => {
      if (_filter.theme !== 'any' && !c.theme.includes(_filter.theme) && !c.theme.includes('any')) return false;
      if (_filter.role !== 'any'  && c.role !== _filter.role) return false;
      if (!isNaN(minLvl) && c.level < minLvl) return false;
      if (!isNaN(maxLvl) && c.level > maxLvl) return false;
      if (search && !c.name.toLowerCase().includes(search) &&
          !c.traits.some(t => t.toLowerCase().includes(search))) return false;
      return true;
    });

    creatures.sort((a,b) => a.level - b.level);

    if (!creatures.length) return '<div class="eb-empty">No creatures match filters.</div>';

    return creatures.map(c => {
      const xp = creatureXP(c.level, _partyLevel);
      return `
      <div class="eb-creature-row" onclick="EncounterBuilder.addCreature('${c.name.replace(/'/g,"\\'")}')">
        <div class="eb-cr-main">
          <span class="eb-cr-name">${c.name}</span>
          <span class="eb-cr-role" style="color:${roleColor(c.role)}">${c.role}</span>
        </div>
        <div class="eb-cr-sub">
          <span class="eb-cr-level">Lvl ${c.level}</span>
          <span class="eb-cr-xp">${xp} XP</span>
          <span class="eb-cr-traits">${c.traits.slice(0,3).join(' · ')}</span>
        </div>
      </div>`;
    }).join('');
  }

  function buildSavedList(campaign) {
    const acts = Object.keys(_savedEncounters);
    if (!acts.length) return '';
    return `
    <div class="eb-saved-section">
      <div class="sz-section-title mt-md">Saved Encounters</div>
      ${acts.map(act => {
        const encs = _savedEncounters[act];
        return encs.map((enc, i) => `
        <div class="eb-saved-row">
          <span class="eb-saved-act">Act ${act}</span>
          <span class="eb-saved-name">${enc.creatures.map(e=>`${e.count}× ${e.creature.name}`).join(', ')||'Empty'}</span>
          <span class="eb-saved-diff diff-${enc.difficulty.css}">${enc.difficulty.label}</span>
          <button class="lv-remove" onclick="EncounterBuilder.loadEncounter(${act},${i})">Load</button>
          <button class="lv-remove" onclick="EncounterBuilder.deleteEncounter(${act},${i})">✕</button>
        </div>`).join('');
      }).join('')}
    </div>`;
  }

  function roleColor(role) {
    const map = { Boss:'#8b1a1a', Soldier:'#5a3a10', Brute:'#5a1a5a', Skirmisher:'#1a5a3a',
      Ambusher:'#1a3a5a', Caster:'#1a1a6a', Controller:'#3a1a6a', Drainer:'#5a1a3a',
      Guardian:'#3a5a10', Minion:'#5a5a10', Archer:'#5a3a2a', Flyer:'#1a4a5a', Stalker:'#4a2a1a' };
    return map[role] || '#5a5a5a';
  }

  // ─── Encounter Slot Management ───────────────────────────────────────────

  function addCreature(name) {
    const creature = CREATURE_LIB.find(c => c.name === name);
    if (!creature) return;
    const existing = _encounter.find(e => e.creature.name === name);
    if (existing) { existing.count++; }
    else { _encounter.push({ creature, count: 1 }); }
    refreshEncounterUI();
  }

  function removeCreature(name) {
    const idx = _encounter.findIndex(e => e.creature.name === name);
    if (idx === -1) return;
    if (_encounter[idx].count > 1) { _encounter[idx].count--; }
    else { _encounter.splice(idx, 1); }
    refreshEncounterUI();
  }

  function clearEncounter() { _encounter = []; refreshEncounterUI(); }

  function refreshEncounterUI() {
    const list  = document.getElementById('ebSlotList');
    const fill  = document.getElementById('ebBudgetFill');
    const xpEl  = document.getElementById('ebTotalXP');
    const diffEl= document.getElementById('ebDifficulty');
    if (!list) return;

    const b = budgets(_playerCount);
    const totalXP = _encounter.reduce((s, e) => s + creatureXP(e.creature.level, _partyLevel) * e.count, 0);
    const diff = difficultyLabel(totalXP, b);
    const pct  = Math.min(100, (totalXP / b.extreme) * 100);

    if (_encounter.length === 0) {
      list.innerHTML = '<div class="eb-slot-empty">Add creatures from the library →</div>';
    } else {
      list.innerHTML = _encounter.map(e => {
        const xp = creatureXP(e.creature.level, _partyLevel) * e.count;
        return `
        <div class="eb-slot">
          <div class="eb-slot-main">
            <span class="eb-slot-count">${e.count}×</span>
            <div class="eb-slot-info">
              <span class="eb-slot-name">${e.creature.name}</span>
              <span class="eb-slot-level">Level ${e.creature.level} · ${e.creature.role}</span>
              <span class="eb-slot-ability">${e.creature.specialAbility}</span>
            </div>
          </div>
          <div class="eb-slot-right">
            <span class="eb-slot-xp">${xp} XP</span>
            <div class="eb-slot-btns">
              <button class="step-btn" onclick="EncounterBuilder.addCreature('${e.creature.name.replace(/'/g,"\\'")}')">+</button>
              <button class="step-btn" onclick="EncounterBuilder.removeCreature('${e.creature.name.replace(/'/g,"\\'")}')">−</button>
            </div>
          </div>
        </div>`;
      }).join('');
    }

    if (fill) { fill.style.width = pct + '%'; fill.className = `eb-budget-fill diff-${diff.css}`; }
    if (xpEl) xpEl.textContent = `${totalXP} XP`;
    if (diffEl) { diffEl.textContent = diff.label; diffEl.className = `diff-label diff-${diff.css}`; }
  }

  // ─── Save / Load ─────────────────────────────────────────────────────────

  function saveEncounter() {
    const act    = document.getElementById('ebSaveAct')?.value || 1;
    const notes  = document.getElementById('ebNotes')?.value || '';
    const b      = budgets(_playerCount);
    const totalXP= _encounter.reduce((s,e)=>s+creatureXP(e.creature.level,_partyLevel)*e.count,0);
    const diff   = difficultyLabel(totalXP, b);
    if (!_savedEncounters[act]) _savedEncounters[act] = [];
    _savedEncounters[act].push({ creatures: JSON.parse(JSON.stringify(_encounter)), notes, totalXP, difficulty: diff });
    refreshSavedUI();
  }

  function loadEncounter(act, idx) {
    const enc = _savedEncounters[act]?.[idx];
    if (!enc) return;
    _encounter = JSON.parse(JSON.stringify(enc.creatures));
    const notesEl = document.getElementById('ebNotes');
    if (notesEl) notesEl.value = enc.notes || '';
    refreshEncounterUI();
  }

  function deleteEncounter(act, idx) {
    _savedEncounters[act]?.splice(idx, 1);
    if (!_savedEncounters[act]?.length) delete _savedEncounters[act];
    refreshSavedUI();
  }

  function refreshSavedUI() {
    const el = document.getElementById('ebSavedList');
    if (el) el.innerHTML = buildSavedList();
  }

  function applyFilter() {
    _filter.search = document.getElementById('ebSearch')?.value || '';
    _filter.theme  = document.getElementById('ebTheme')?.value || 'any';
    _filter.role   = document.getElementById('ebRole')?.value  || 'any';
    const list = document.getElementById('ebCreatureList');
    if (list) list.innerHTML = buildCreatureList();
  }

  // ─── Export Card ──────────────────────────────────────────────────────────

  function exportCard() {
    const b      = budgets(_playerCount);
    const totalXP= _encounter.reduce((s,e)=>s+creatureXP(e.creature.level,_partyLevel)*e.count,0);
    const diff   = difficultyLabel(totalXP, b);
    const notes  = document.getElementById('ebNotes')?.value || '';

    const rows = _encounter.map(e => {
      const xp = creatureXP(e.creature.level, _partyLevel) * e.count;
      return `<tr>
        <td>${e.count}×</td>
        <td><strong>${e.creature.name}</strong></td>
        <td>${e.creature.level}</td>
        <td>${e.creature.role}</td>
        <td>${xp} XP</td>
        <td>${e.creature.traits.join(', ')}</td>
      </tr>
      <tr style="background:#f8f4ee"><td></td><td colspan="5" style="font-size:0.8em;color:#555"><em>Tactics:</em> ${e.creature.tactics}<br/><em>Special:</em> ${e.creature.specialAbility}</td></tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Encounter Card</title>
<style>
  body { font-family: Georgia,serif; max-width:800px; margin:2rem auto; color:#2a1a0a; }
  h2 { color:#8b1a1a; border-bottom:2px solid #c9973a; padding-bottom:0.3rem; }
  table { border-collapse:collapse; width:100%; margin:1rem 0; }
  th,td { border:1px solid #ccc; padding:0.4rem 0.6rem; font-size:0.9rem; text-align:left; }
  th { background:#f0e8d8; }
  .diff { font-weight:bold; padding:0.3rem 0.8rem; border-radius:4px; display:inline-block; margin:0.5rem 0; }
  .diff-trivial{background:#e8e8e8;color:#555}
  .diff-low{background:#e8f4e8;color:#1a5a1a}
  .diff-moderate{background:#e8f0ff;color:#1a1a6a}
  .diff-severe{background:#fff4e0;color:#7a4a00}
  .diff-extreme{background:#ffe8e8;color:#8b1a1a}
  .notes { border:1px solid #ccc; padding:0.75rem; margin-top:1rem; background:#fafaf5; }
</style>
</head>
<body>
<h2>Encounter Card</h2>
<p><strong>Party Level:</strong> ${_partyLevel} &nbsp;|&nbsp;
   <strong>Players:</strong> ${_playerCount} &nbsp;|&nbsp;
   <strong>Total XP:</strong> ${totalXP} &nbsp;|&nbsp;
   <strong>Difficulty:</strong> <span class="diff diff-${diff.css}">${diff.label}</span></p>
<table>
  <thead><tr><th>#</th><th>Creature</th><th>Level</th><th>Role</th><th>XP</th><th>Traits</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
${notes ? `<div class="notes"><strong>Setup Notes:</strong><br/>${notes}</div>` : ''}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'encounter-card.html';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  return {
    render,
    addCreature,
    removeCreature,
    clearEncounter,
    applyFilter,
    saveEncounter,
    loadEncounter,
    deleteEncounter,
    exportCard,
    getSaved: () => _savedEncounters,
  };

})();
