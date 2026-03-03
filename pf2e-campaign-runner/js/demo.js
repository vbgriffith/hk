/* ══════════════════════════════════════════════════════════════════
   PF2e Campaign Runner — Demo Campaign Data
   A complete sample campaign object matching Campaign Forge output
══════════════════════════════════════════════════════════════════ */
var DEMO_CAMPAIGN = {
  generated: new Date().toISOString(),
  pf2eVersion: '6.0',
  config: {
    theme: 'undead', acts: 3, startLevel: 1, endLevel: 10,
    players: 4, partySize: 4,
    mixVillains: true, mixFactions: true, mixNPCs: true,
    mixBosses: true, mixRewards: true, mixLocations: true
  },
  base: { title: 'The Ashen Crown', theme: 'undead' },
  hook: 'A plague of undead has consumed the eastern villages. The dead walk at the command of a masked figure seen at each massacre — and they left a survivor, just one, who whispered a name: Valdris Kael.',
  villain: {
    name: 'Valdris Kael',
    title: 'The Undying Sovereign',
    race: 'Lich (former court wizard)',
    motivation: 'Achieve true immortality by binding every soul in the region to his phylactery',
    tactics: 'Layers of undead minions; strikes only when victory is assured; uses hostages',
    weakness: 'The phylactery is hidden in his former study — a place he cannot bring himself to destroy',
    secretReveal: 'Valdris was once the kingdom\'s most beloved healer, driven mad by grief after losing his daughter to a plague he could have prevented with more power',
    cr: 17
  },
  factions: [
    { name: 'The Dawnwatch', alignment: 'LG', role: 'Ally', desc: 'Elite knights sworn to purge undeath. Desperate for allies who can move without their armor slowing them down.' },
    { name: 'The Hollow Court', alignment: 'NE', role: 'Villain (secondary)', desc: 'Valdris\'s inner circle of sentient undead nobles who enjoy their power and will do anything to keep it.' },
    { name: 'The Grey Accord', alignment: 'N', role: 'Wildcard', desc: 'Merchants who have struck deals with Valdris for safe passage. Informants, willing or not.' }
  ],
  npcs: [
    { name: 'Commander Sable Renwick', role: 'Military Commander', desc: 'Leads the Dawnwatch remnants; haunted by her failure to stop the initial outbreak.', personality: 'Gruff and self-critical, but fiercely protective of civilians. Respects competence above rank.' },
    { name: 'Pell Ashford', role: 'Informant / Guide', desc: 'The sole survivor of Havenfield. Knows the eastern roads better than anyone alive.', personality: 'Nervous, jumpy at shadows, but brave when it counts. Has a dark sense of humor about death.' },
    { name: 'Sister Vareth Omn', role: 'Cleric Contact', desc: 'Priestess of Pharasma running a hidden refuge for displaced villagers.', personality: 'Serene and methodical. Believes everyone deserves a proper death and is willing to fight for it.' },
    { name: 'Lord Castor Mael', role: 'Corrupt Noble', desc: 'Secretly deals with the Hollow Court for protection of his estate.', personality: 'Oily charm and plausible deniability. Will betray anyone if the price is right.' },
    { name: 'Zinara the Twice-Burned', role: 'Rival Adventurer', desc: 'A flame witch who\'s hunted Valdris for years and resents the party\'s involvement.', personality: 'Abrasive, brilliant, secretly lonely. Warms up if the party proves themselves.' }
  ],
  acts: [
    {
      number: 1,
      title: 'The Ashen Roads',
      levelStart: 1,
      levelEnd: 4,
      location: 'The Thornmarch (blighted farmland)',
      summary: 'The heroes are drawn into the eastern blight as refugees flee to the capital. Skeletal patrols move in organized formations — this is no mindless plague. The trail leads to the village of Havenfield, where the ground itself has been consecrated to undeath, and the Dawnwatch is making a last stand.',
      environment: { terrain: 'wilderness', biome: 'blighted farmland' },
      milestones: [
        'Heroes arrive at the Thornmarch refugee camps',
        'First encounter with organized undead patrols',
        'Discover Havenfield has been ritually desecrated',
        'Act climax at level 4 — the stakes escalate'
      ],
      encounters: [
        { name: 'Ambush on the Thornmarch Road', type: 'Combat' },
        { name: 'The Refugee Camp Panic', type: 'Social / Combat' },
        { name: 'Havenfield Last Stand', type: 'Combat / Exploration' }
      ],
      actEncounters: [
        {
          label: 'Opening Encounter (Low Difficulty)',
          difficulty: 'low', totalXP: 60, budget: 60,
          creatures: [
            { name: 'Skeleton Guard', level: 1, role: 'Soldier', count: 3, statBlock: { level:1,ac:16,hp:16,saves:{fort:'+7',ref:'+3',will:'+5'},perception:'+5',actions:[{name:'Strike',actions:'1',damage:'1d6+3 S',traits:['reach 5']},{name:'Shield Block',actions:'R',damage:'-',traits:['reaction']}],traits:['undead','skeleton'],tactics:'Advance in formation, shield block on first hit' } }
          ]
        },
        {
          label: 'Midpoint Encounter (Moderate Difficulty)',
          difficulty: 'moderate', totalXP: 80, budget: 80,
          creatures: [
            { name: 'Skeletal Champion', level: 2, role: 'Leader', count: 1, statBlock: { level:2,ac:18,hp:30,saves:{fort:'+9',ref:'+5',will:'+7'},perception:'+7',actions:[{name:'Strike',actions:'1',damage:'1d8+4 S',traits:['reach 5']},{name:'Command Undead',actions:'2',damage:'—',traits:['concentrate','enchantment','mental']}],traits:['undead','skeleton'],tactics:'Commands lesser undead while staying protected' } },
            { name: 'Zombie Shambler', level: 1, role: 'Brute', count: 4, statBlock: { level:1,ac:13,hp:20,saves:{fort:'+8',ref:'+1',will:'+3'},perception:'+2',actions:[{name:'Strike',actions:'1',damage:'1d6+4 B',traits:['reach 5']},{name:'Lurch',actions:'1',damage:'—',traits:['move']}],traits:['undead','zombie'],tactics:'Swarm the closest enemy' } }
          ]
        },
        {
          label: 'Climax Encounter (Severe Difficulty)',
          difficulty: 'severe', totalXP: 120, budget: 120,
          creatures: [
            { name: 'Hollow Inquisitor', level: 4, role: 'Spellcaster', count: 1, statBlock: { level:4,ac:20,hp:55,saves:{fort:'+10',ref:'+8',will:'+12'},perception:'+10',actions:[{name:'Chill Touch',actions:'2',damage:'2d6 negative (DC 20 Fort)',traits:['cantrip','necromancy','negative']},{name:'Harm',actions:'2',damage:'3d8 negative, 20-ft emanation (DC 22 Will)',traits:['necromancy','negative']}],traits:['undead','intelligent'],tactics:'Opens with Harm burst then targets spellcasters with Chill Touch' } },
            { name: 'Skeleton Guard', level: 1, role: 'Soldier', count: 6, statBlock: { level:1,ac:16,hp:16,saves:{fort:'+7',ref:'+3',will:'+5'},perception:'+5',actions:[{name:'Strike',actions:'1',damage:'1d6+3 S',traits:['reach 5']}],traits:['undead','skeleton'],tactics:'Shield the Inquisitor' } }
          ]
        }
      ],
      boss: {
        name: 'Champion of Valdris Kael',
        creature: 'Death Knight, Level 5 (Severe Encounter)',
        setup: 'The Death Knight arrives dramatically, riding a skeletal warhorse, as the heroes are at their most exhausted.',
        phase2: 'Below 50% HP, the Death Knight\'s armor cracks and tendrils of necrotic energy erupt — it gains a 20-ft aura of 1d6 negative damage.',
        env: 'Havenfield town square, mid-ceremony',
        tactics: 'Starts mounted for extra reach; dismounts when bloodied; uses Dreadful Strikes liberally',
        statBlock: { level:5,ac:23,hp:75,saves:{fort:'+14',ref:'+10',will:'+11'},perception:'+11',actions:[{name:'Dreadful Strike',actions:'2',damage:'2d8+8 S plus Frightened 1 (DC 21 Will)',traits:['emotion','enchantment','fear','mental']},{name:'Mount Charge',actions:'3',damage:'3d8+10 B+P (if mounted)',traits:['flourish']}],traits:['undead','humanoid'],tactics:'Uses Dreadful Strike to stack fear, then cleaves through frightened foes' },
        xp: 120
      },
      sideQuests: [
        { title: 'The Miller\'s Secret', reward: 'XP + recipe for alchemical anti-undead oil', desc: 'A miller in the refugee camp knows which farms were "marked" by Valdris\'s scouts — weeks before the outbreak.' },
        { title: 'Pell\'s Little Sister', reward: 'Pell as a loyal recurring NPC', desc: 'Pell believes his sister is still alive somewhere in Havenfield. He\'s right — but what she\'s become is another matter.' }
      ],
      twist: null,
      socialEncounters: {
        reputationSnapshot: [
          { faction: 'The Dawnwatch', rep: 2 },
          { faction: 'The Hollow Court', rep: -3 },
          { faction: 'The Grey Accord', rep: 0 }
        ]
      }
    },
    {
      number: 2,
      title: 'The Court Beneath the Ash',
      levelStart: 5,
      levelEnd: 7,
      location: 'Morkelspire (ruined city, now undead capital)',
      summary: 'Following the phylactery trail, the heroes enter the city of Morkelspire — once a thriving trade hub, now a nightmarish court of undead nobles who remember their living days. The Hollow Court holds balls. Makes appointments. Plays at civilization. And somewhere in the palace, the truth about Valdris\'s daughter is buried.',
      environment: { terrain: 'urban', biome: 'ruined city' },
      milestones: [
        'Heroes enter Morkelspire via the smuggler tunnels',
        'Infiltrate the Hollow Court\'s grand ball',
        'Discover the diary of Valdris\'s daughter',
        'Act climax at level 7 — the stakes escalate'
      ],
      encounters: [
        { name: 'The Smugglers\' Gambit', type: 'Social / Stealth' },
        { name: 'The Grand Ball of the Hollow Court', type: 'Social / Intrigue' },
        { name: 'Beneath the Palace', type: 'Dungeon / Combat' }
      ],
      actEncounters: [
        {
          label: 'Opening Encounter (Low Difficulty)',
          difficulty: 'low', totalXP: 60, budget: 60,
          creatures: [
            { name: 'Ghoul Stalker', level: 2, role: 'Ambusher', count: 3, statBlock: { level:2,ac:17,hp:30,saves:{fort:'+8',ref:'+10',will:'+6'},perception:'+8',actions:[{name:'Jaws',actions:'1',damage:'1d6+4 P plus Paralysis (DC 15 Fort)',traits:['disease']},{name:'Claws',actions:'1',damage:'1d4+4 S',traits:[]}],traits:['undead','ghoul'],tactics:'Paralyze and feast; retreat if 3+ allies down' } }
          ]
        },
        {
          label: 'Midpoint Encounter (Moderate Difficulty)',
          difficulty: 'moderate', totalXP: 100, budget: 100,
          creatures: [
            { name: 'Vampire Courtier', level: 5, role: 'Deceiver', count: 1, statBlock: { level:5,ac:22,hp:65,saves:{fort:'+11',ref:'+13',will:'+12'},perception:'+12',actions:[{name:'Fangs',actions:'1',damage:'2d6+6 P plus Drink Blood',traits:['finesse']},{name:'Dominate',actions:'2',damage:'Controlled (DC 23 Will, 1 hour)',traits:['enchantment','incapacitation','mental']}],traits:['undead','vampire'],tactics:'Opens with Dominate on the tankiest PC; fights defensively when bloodied' } },
            { name: 'Skeleton Guard', level: 1, role: 'Soldier', count: 4, statBlock: { level:1,ac:16,hp:16,saves:{fort:'+7',ref:'+3',will:'+5'},perception:'+5',actions:[{name:'Strike',actions:'1',damage:'1d6+3 S',traits:['reach 5']}],traits:['undead','skeleton'],tactics:'Guard the Vampire' } }
          ]
        },
        {
          label: 'Climax Encounter (Severe Difficulty)',
          difficulty: 'severe', totalXP: 140, budget: 140,
          creatures: [
            { name: 'Wraith Sovereign', level: 7, role: 'Drainer', count: 1, statBlock: { level:7,ac:25,hp:95,saves:{fort:'+14',ref:'+16',will:'+17'},perception:'+16',actions:[{name:'Drain Life',actions:'2',damage:'3d10 negative; heals Wraith for half (DC 26 Fort)',traits:['necromancy','negative']},{name:'Phase Through',actions:'1',damage:'—',traits:['move','incorporeal']}],traits:['undead','wraith','incorporeal'],tactics:'Phases through walls; drains life from multiple targets; retreats through solid objects' } }
          ]
        }
      ],
      boss: {
        name: 'Lady Vex of the Hollow Court',
        creature: 'Greater Vampire, Level 8 (Severe Encounter)',
        setup: 'Lady Vex has been watching the heroes since they entered Morkelspire. She confronts them in the palace vault, curious rather than immediately hostile — she respects them.',
        phase2: 'When reduced below 40 HP, Vex reveals her true form: a massive bat-winged nightmare. She gains a 30-ft fly speed and her Fangs deal 3d8+10.',
        env: 'Palace vault, surrounded by coffins of Hollow Court members',
        tactics: 'Talks while fighting; offers deals; genuinely might be turned to an ally if the party impresses her',
        statBlock: { level:8,ac:27,hp:120,saves:{fort:'+15',ref:'+17',will:'+16'},perception:'+17',actions:[{name:'Fangs',actions:'1',damage:'2d8+8 P plus Drink Blood (heals 10)',traits:['finesse']},{name:'Dominate',actions:'3',damage:'Controlled (DC 26 Will)',traits:['enchantment','incapacitation']},{name:'Mist Form',actions:'1',damage:'—',traits:['polymorph','transmutation']}],traits:['undead','vampire'],tactics:'Dominates a PC early; uses Mist Form to reposition; will parley if below 50 HP' },
        xp: 160
      },
      sideQuests: [
        { title: 'The Accord\'s Ledger', reward: 'Map to Valdris\'s former study', desc: 'A Grey Accord merchant carries encoded trade ledgers — within them, the location of every one of Valdris\'s supply lines, and one entry for a property he still owns in the capital.' },
        { title: 'The Last Living Noble', reward: 'Ally in the capital + noble house resources', desc: 'One of Morkelspire\'s noble families is still alive, hidden in a sealed wing. They have information about the phylactery\'s original creation — they were there.' }
      ],
      twist: {
        name: 'The Betrayal Revealed',
        timing: 'Act 2 climax',
        description: 'Commander Sable Renwick has been secretly reporting the party\'s movements to the Grey Accord, believing a negotiated peace with Valdris is possible. She isn\'t evil — she\'s desperate. But her intel led to the ambush in the palace.'
      },
      socialEncounters: {
        reputationSnapshot: [
          { faction: 'The Dawnwatch', rep: 3 },
          { faction: 'The Hollow Court', rep: -1 },
          { faction: 'The Grey Accord', rep: 1 }
        ]
      }
    },
    {
      number: 3,
      title: 'The Unburning Crown',
      levelStart: 8,
      levelEnd: 10,
      location: 'The Ossuary Spire (Valdris\'s sanctum)',
      summary: 'Armed with the location of the phylactery and the truth of Valdris\'s grief, the heroes storm the Ossuary Spire. But Valdris has prepared for them — and the final revelation is that destroying the phylactery will kill every soul bound to it, including thousands of innocents he\'s been "preserving" against death. The heroes must choose.',
      environment: { terrain: 'dungeon', biome: 'undead sanctum' },
      milestones: [
        'Heroes breach the Ossuary Spire\'s outer defenses',
        'Confront Valdris\'s memories in the study',
        'Discover the true nature of the phylactery',
        'Final confrontation with Valdris Kael'
      ],
      encounters: [
        { name: 'The Spire Ascent', type: 'Combat / Exploration' },
        { name: 'The Memory Vault', type: 'Puzzle / Roleplay' },
        { name: 'Valdris Kael — Final Battle', type: 'Boss Combat' }
      ],
      actEncounters: [
        {
          label: 'Opening Encounter (Low Difficulty)',
          difficulty: 'low', totalXP: 80, budget: 80,
          creatures: [
            { name: 'Bone Golem', level: 8, role: 'Soldier', count: 1, statBlock: { level:8,ac:26,hp:120,saves:{fort:'+18',ref:'+12',will:'+14'},perception:'+14',actions:[{name:'Slam',actions:'1',damage:'2d10+10 B',traits:['reach 10']},{name:'Bone Shard Spray',actions:'2',damage:'4d8 P, 30-ft cone (DC 26 Reflex)',traits:['evocation']}],traits:['construct','mindless'],tactics:'Attacks the largest cluster; uses Spray when 3+ targets are in cone' } }
          ]
        },
        {
          label: 'Midpoint Encounter (Moderate Difficulty)',
          difficulty: 'moderate', totalXP: 120, budget: 120,
          creatures: [
            { name: 'Lich Apprentice', level: 9, role: 'Caster', count: 1, statBlock: { level:9,ac:27,hp:115,saves:{fort:'+17',ref:'+16',will:'+20'},perception:'+18',actions:[{name:'Finger of Death',actions:'2',damage:'7d6+20 negative (DC 28 Fort, on fail 50 negative + Doomed 1)',traits:['death','necromancy','negative']},{name:'Paralyzing Touch',actions:'1',damage:'Paralyzed (DC 26 Fort)',traits:['incapacitation','necromancy']}],traits:['undead','lich'],tactics:'Opens with Finger of Death on the biggest threat; uses Paralyzing Touch as follow-up' } }
          ]
        },
        {
          label: 'Climax Encounter (Severe Difficulty)',
          difficulty: 'extreme', totalXP: 200, budget: 200,
          creatures: [
            { name: 'Valdris Kael', level: 10, role: 'Boss', count: 1, statBlock: { level:10,ac:30,hp:175,saves:{fort:'+18',ref:'+17',will:'+22'},perception:'+20',actions:[{name:"Villain's Gambit",actions:'2',damage:'5d8+15 negative in 30-ft burst (DC 30 Will)',traits:['necromancy','negative']},{name:'Legendary Resistance',actions:'R',damage:'Reroll one failed save',traits:['reaction']},{name:'Soul Binding',actions:'3',damage:'Target is Doomed 2 + under Valdris\'s control on crit fail (DC 30 Will)',traits:['enchantment','incapacitation','mental']}],traits:['undead','lich','unique'],tactics:'Phase 1: Tests the party with Soul Binding; Phase 2 (below 90 HP): reveals grief, may parley if addressed; Phase 3 (below 50 HP): full unleashing of necromantic power' } }
          ]
        }
      ],
      boss: {
        name: 'Valdris Kael, The Undying Sovereign',
        creature: 'Unique Lich, Level 12 (Extreme Encounter)',
        setup: 'Valdris confronts the heroes in his study, surrounded by portraits of his daughter. He knows they\'ve come to destroy the phylactery. He doesn\'t try to stop them immediately — he wants them to understand what that means first.',
        phase2: 'If the party chooses to hear Valdris out and succeeds on DC 28 Diplomacy, he reveals the phylactery also contains his daughter\'s soul, preserved by accident when she died during his first ritual. He can be convinced to seek a peaceful resolution — releasing the souls — if the party promises to give them proper funerary rites.',
        env: 'Valdris\'s study: books everywhere, a portrait of a young girl, the phylactery on the desk',
        tactics: 'Will fight to the death if attacked immediately. Can be talked down. Even if fought, leaves openings for a parley — he\'s tired',
        statBlock: { level:12,ac:32,hp:220,saves:{fort:'+21',ref:'+19',will:'+25'},perception:'+22',actions:[{name:"Villain's Gambit",actions:'2',damage:'5d8+15 negative, 30-ft burst (DC 32 Will)',traits:['necromancy','negative']},{name:'Paralyzing Touch',actions:'1',damage:'Paralyzed (DC 30 Fort)',traits:['incapacitation']},{name:'Soul Drain',actions:'3',damage:'8d10 negative + Doomed 2 (DC 32 Will, counteracted by positive energy)',traits:['necromancy','death']}],traits:['undead','lich','unique'],tactics:'Uses Villain\'s Gambit to create space; Paralyzing Touch on frontliners; may stop fighting if the party acknowledges his grief' },
        xp: 240
      },
      sideQuests: [
        { title: 'The Daughter\'s Locket', reward: 'Upgrade the phylactery\'s destruction into a peaceful release — all souls go to Pharasma properly', desc: 'The locket containing the daughter\'s portrait is the key to convincing Valdris. It was stolen by Lord Castor Mael in Act 2 — retrieve it before the final confrontation.' },
        { title: 'Sable\'s Redemption', reward: 'Commander Renwick sacrifices herself to protect the party in the final battle', desc: 'If the party chose to forgive Sable\'s betrayal rather than expose her, she follows them to the Spire. She can\'t undo her mistake — but she can make sure it doesn\'t cost the heroes their lives.' }
      ],
      twist: {
        name: 'The Phylactery\'s Secret',
        timing: 'Final act',
        description: 'Destroying the phylactery will release the thousands of souls bound to it — including Valdris\'s daughter, whose soul has been unconsciously sustaining the entire undead army. Without her, every bound undead in the region will collapse instantly. But she\'s been aware, screaming silently, for decades. Valdris doesn\'t know.'
      },
      socialEncounters: {
        reputationSnapshot: [
          { faction: 'The Dawnwatch', rep: 5 },
          { faction: 'The Hollow Court', rep: -4 },
          { faction: 'The Grey Accord', rep: 2 }
        ]
      }
    }
  ],
  rewards: [
    {
      act: 1,
      hoard: {
        currency: { gp: 45, sp: 80, cp: 0 },
        permanentItems: [
          { name: '+1 Striking Weapon (your choice)', level: 4, traits: ['magical'] },
          { name: 'Staff of Necromancy (Lesser)', level: 3, traits: ['magical','necromancy','staff'] }
        ],
        consumables: [
          { name: 'Healing Potion (Moderate) x3', level: 6, traits: ['consumable','healing','magical','potion'] },
          { name: 'Oil of Undeath Repulsion x2', level: 3, traits: ['consumable','magical','oil'] },
          { name: 'Scroll of Harm (2nd)', level: 3, traits: ['consumable','magical','scroll'] }
        ]
      }
    },
    {
      act: 2,
      hoard: {
        currency: { gp: 180, sp: 40, cp: 0 },
        permanentItems: [
          { name: '+1 Resilient Armor (your choice)', level: 8, traits: ['magical'] },
          { name: 'Amulet of Undead Command', level: 7, traits: ['magical','invested','necromancy'] },
          { name: 'Boots of Elvenkind', level: 5, traits: ['magical','invested'] }
        ],
        consumables: [
          { name: 'Healing Potion (Greater) x4', level: 10, traits: ['consumable','healing','magical','potion'] },
          { name: 'Wand of Fireball (4th) x1', level: 9, traits: ['consumable','magical','wand'] },
          { name: 'Elixir of Life (Major) x2', level: 12, traits: ['alchemical','consumable','elixir','healing'] }
        ]
      }
    },
    {
      act: 3,
      hoard: {
        currency: { gp: 500, sp: 0, cp: 0 },
        permanentItems: [
          { name: '+2 Striking Weapon of your choice', level: 10, traits: ['magical'] },
          { name: 'Cloak of Elvenkind', level: 10, traits: ['invested','magical'] },
          { name: 'Ring of Counterspells', level: 9, traits: ['invested','magical'] },
          { name: 'Staff of Impossible Visions', level: 10, traits: ['magical','staff'] }
        ],
        consumables: [
          { name: 'True Healing Potion x4', level: 15, traits: ['consumable','healing','magical','potion'] },
          { name: 'Scroll of Summon Celestial (6th) x1', level: 11, traits: ['consumable','magical','scroll'] }
        ]
      }
    }
  ],
  sessionTables: null
};
