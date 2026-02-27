/**
 * data/components.js
 * Modular components for mix-and-match campaign generation.
 * PF2e Remaster compatible — uses updated terminology.
 */

const COMPONENTS = {

  // ── VILLAIN ARCHETYPES ──────────────────────────────────────────────────
  villainArchetypes: [
    { type: "Ancient Lich", cr: "20+", motivation: "Achieve perfect magical stasis and impose it upon the world", tactics: "Magical dominance, undead armies, phylactery protection" },
    { type: "Fallen Champion", cr: "16-18", motivation: "Prove that justice failed and therefore everything must burn", tactics: "Martial excellence, tragic charisma, exploits heroes' mercy" },
    { type: "Corporate Tyrant", cr: "14-16", motivation: "Eliminate competition through total economic domination", tactics: "Hired mercenaries, legal maneuvering, information monopoly" },
    { type: "Desperate Revolutionary", cr: "12-15", motivation: "Tear down a corrupt system regardless of collateral damage", tactics: "Popular support, guerrilla tactics, ideological conviction" },
    { type: "Planar Invader", cr: "18-22", motivation: "Reshape the material plane in the image of its home plane", tactics: "Extraplanar powers, spatial distortion, reality-bending magic" },
    { type: "Cult Leader Oracle", cr: "14-17", motivation: "Guide followers toward a divine apocalypse they believe is salvation", tactics: "Fanatical followers, divine magic, genuine charisma" },
    { type: "Wounded Demigod", cr: "19-22", motivation: "Recover divine power by consuming mortal worship, any way possible", tactics: "Divine aspects, reality-altering auras, commands divine servants" },
    { type: "Grief-Maddened Archmage", cr: "15-18", motivation: "Rewrite history to prevent a personal loss, consequences be damned", tactics: "Time magic, summoned constructs, vast accumulated arcane knowledge" },
    { type: "Undead Warlord", cr: "15-19", motivation: "Build an empire where death is strength rather than weakness", tactics: "Undead legions, death-touch, necromantic plague vectors" },
    { type: "Possessed Innocent", cr: "13-16", motivation: "(Host: none; Entity: consume living essence)", tactics: "Exploits the heroes' reluctance to harm the host; unpredictable possession-switching" },
    { type: "Dragon Ascendant", cr: "20+", motivation: "Achieve draconic divinity through accumulated power and terror", tactics: "Breath weapons, legendary actions, dragon flight, hoarded magic items" },
    { type: "Fey Court Exile", cr: "15-18", motivation: "Reclaim a stolen court title by remaking the mortal world into the First World", tactics: "Reality-adjacent powers, contracts and oaths, irresistible compulsions" }
  ],

  // ── LOCATIONS ───────────────────────────────────────────────────────────
  locations: {
    urban: [
      "A city built on the bones of an older, buried civilization",
      "A floating sky-city accessible only by magical lifts",
      "A port city that switches allegiance with the tides",
      "A city where magic is illegal but omnipresent",
      "A necropolis where the dead outnumber the living and both have rights",
      "An underground city that has never seen the sun",
      "A city ruled by a merchant council where everything has a price",
      "A city that exists in two time periods simultaneously"
    ],
    wilderness: [
      "A forest that rearranges itself to prevent anyone from leaving",
      "A mountain range with a fire giant civilization inside",
      "An ocean that connects to the Plane of Water at random intervals",
      "A desert where the sand is ground-up glass from shattered mirrors",
      "A jungle that's alive and doesn't want visitors",
      "A frozen tundra with a warm, thriving ecosystem underneath the ice",
      "Rolling hills that are actually the back of an ancient sleeping entity",
      "A canyon system that echoes every sound ever made within it"
    ],
    dungeon: [
      "A wizard's tower turned inside-out by a magical catastrophe",
      "Ancient vaults beneath a capital city that the government denies exist",
      "A dungeon that is also a functioning pocket dimension",
      "The hollowed-out skeleton of a divine creature",
      "An elven ruin that predates the creation of the elven race",
      "A former god's sanctum now used as a tomb by a successor cult",
      "A labyrinthine prison designed to hold something the builders were afraid to kill",
      "The ruins of a city that was teleported underground and forgotten"
    ],
    planar: [
      "A demiplane created by a wish spell that went partially wrong",
      "A section of the Astral Sea that has crystallized into a navigable landmass",
      "The border between the Positive and Negative Energy Planes",
      "A first-world location that has been slowly bleeding into the material plane",
      "A heaven that has been invaded and is under siege",
      "A hell that is actively suing for independence from Asmodeus",
      "A pocket of the Shadow Plane that has developed its own ecosystem",
      "An abandoned divine realm whose deity went missing"
    ]
  },

  // ── FACTIONS ────────────────────────────────────────────────────────────
  factions: [
    { name: "The Verdant Compact", alignment: "Neutral Good", ideology: "Nature above civilization", resource: "Druids, rangers, and beast companions", hook: "They will ally with the heroes if the campaign's villain threatens the natural order" },
    { name: "Iron Covenant", alignment: "Lawful Neutral", ideology: "Law above morality; contracts are sacred", resource: "Mercenary armies, legal authority, treasury", hook: "They will ally with whoever provides the best contract — but never break one" },
    { name: "The Wandering Archive", alignment: "True Neutral", ideology: "Knowledge must be gathered and preserved", resource: "Information, magical research, ancient maps", hook: "Will exchange information for information; have records that can unlock key plot points" },
    { name: "Shattered Crown", alignment: "Chaotic Good", ideology: "Legitimate rulership is dead; people must govern themselves", resource: "Popular support, guerrilla networks, safe houses", hook: "Distrust institutions; will work with the heroes if they prove uncorrupted by authority" },
    { name: "The Alabaster Eye", alignment: "Lawful Good", ideology: "Divine law must be enforced in the material world", resource: "Paladins, inquisitors, divine magic", hook: "Will ally immediately but expect strict adherence to their ethical code" },
    { name: "Duskhollow Compact", alignment: "Neutral Evil", ideology: "Survival is the only morality", resource: "Assassins, blackmail information, poison networks", hook: "Will betray the heroes if it becomes advantageous; can be kept loyal through ongoing mutual benefit" },
    { name: "The Brass Parliament", alignment: "Lawful Evil", ideology: "Wealth is virtue; poverty is a moral failure", resource: "Massive treasury, merchant fleets, political influence", hook: "Oppose the villain if the villain threatens commerce; will sacrifice the heroes for a profitable deal" },
    { name: "Orphaned Pantheon", alignment: "Chaotic Neutral", ideology: "Gods failed us; we will ascend without them", resource: "Anti-divine magic, null-faith abilities, former clergy", hook: "Useful against divine villains; volatile ally who may decide the heroes are also too powerful" },
    { name: "The Unbroken Chain", alignment: "Chaotic Good", ideology: "All enslaved beings deserve freedom", resource: "Liberation networks, knowledge of underground passages, fierce loyalty", hook: "Will give everything for the cause; may ask the heroes to make moral compromises for tactical gains" },
    { name: "Midnight Society", alignment: "Neutral", ideology: "Secrecy is safety; the public cannot handle truth", resource: "Ancient secrets, planar access, impossible resources", hook: "Know the truth about the villain; won't share it until the heroes prove they can handle it" }
  ],

  // ── SIDE QUESTS ─────────────────────────────────────────────────────────
  sideQuestTemplates: [
    {
      type: "Rescue",
      templates: [
        "A prominent NPC has been abducted by {enemy} who demands {demand} for their safe return",
        "A village is being held hostage by {enemy} occupying their water supply",
        "A scholar who holds key information about the main villain has been imprisoned for unrelated crimes",
        "A faction ally's heir has been captured and is being used as leverage against the faction",
        "Heroes discover captives being prepared as sacrifices for a cult's next ritual"
      ]
    },
    {
      type: "Investigation",
      templates: [
        "A series of murders share no obvious connection — except all victims met the main villain years ago",
        "A magical disease is spreading through a community; its source is connected to the main plot",
        "Three different witnesses claim to have seen the villain in three different locations simultaneously",
        "An ancient text has been stolen from a library; the thief left behind evidence that implicates an innocent",
        "A faction ally is acting strangely; investigation reveals they've been replaced by a doppelganger"
      ]
    },
    {
      type: "Escort",
      templates: [
        "A witness who can identify a key villain agent must be escorted safely to the capital",
        "A sacred artifact must be moved before the villain can corrupt it",
        "A group of refugees from a destroyed village carry evidence of the villain's true identity",
        "A mage who can identify the villain's weakness must complete a dangerous journey to their laboratory",
        "A diplomatic envoy carrying a treaty that could unite two factions against the villain needs protection"
      ]
    },
    {
      type: "Heist",
      templates: [
        "The heroes must steal a key component from a villain-controlled facility without being detected",
        "A villain's private archives contain proof that could bring down their political support — it needs to be acquired",
        "A magical seal keeping an old threat contained is in a vault the villain now controls",
        "The heroes must infiltrate a gala to copy a document without the original being moved",
        "A shipment of weapons bound for the villain's army must be intercepted and rerouted"
      ]
    },
    {
      type: "Diplomacy",
      templates: [
        "Two factions are on the brink of open war; both are needed against the main villain",
        "A neutral nation holds a key resource; convince them to support the heroes' cause",
        "A grudge between two faction leaders threatens to unravel a crucial alliance",
        "A peaceful community is being radicalized by the villain's agents; the heroes must counter the propaganda",
        "An ancient treaty has a provision the villain is exploiting; renegotiating requires delicate politics"
      ]
    },
    {
      type: "Dungeon",
      templates: [
        "An ancient ruin holds evidence of the villain's true origins — and a weapon attuned to their weakness",
        "A section of the main dungeon has been sealed for centuries; opening it reveals an unexpected complication",
        "A labyrinth built by a long-dead wizard contains the only copy of a spell the heroes need",
        "The villain is trying to excavate a ruin before the heroes can; it's a race through dangerous terrain",
        "A collapsed section of a key location must be cleared and secured before the next story beat"
      ]
    },
    {
      type: "Mystery",
      templates: [
        "A faction ally's ship disappeared three weeks ago; its wreck has just been found with no survivors and the cargo untouched",
        "Every oracle in a hundred-mile radius has gone suddenly and specifically blind to future events",
        "A town near the villain's territory is sending tribute willingly — but terrifiedly — to a third party no one has identified",
        "A divine spell that shouldn't exist has been cast; tracing its origin leads somewhere unexpected",
        "Historical records about a key location have been magically altered — but imperfectly, leaving traces"
      ]
    },
    {
      type: "Combat",
      templates: [
        "A bounty hunter has been hired to eliminate the heroes; they're formidable and professional",
        "The villain's advance army is moving on a civilian location ahead of schedule",
        "A faction ally is under simultaneous attack from two directions; the heroes must choose which to defend",
        "A monster that has been terrorizing a road the heroes need to use must be dealt with permanently",
        "The villain's lieutenants have been assigned to neutralize each faction ally; the heroes must stop them all"
      ]
    }
  ],

  // ── PLOT TWISTS ─────────────────────────────────────────────────────────
  plotTwists: [
    { twist: "A faction ally has been working for the villain from the beginning — but reluctantly, under duress", timing: "End of Act 2" },
    { twist: "The villain's stated motivation is real, but their method is catastrophically misguided", timing: "Mid Act 3" },
    { twist: "One of the heroes' actions in Act 1 inadvertently empowered the villain", timing: "Act 2 revelation" },
    { twist: "The object the heroes have been trying to protect is actually the villain's phylactery/power source", timing: "Act 2 climax" },
    { twist: "The villain is dying anyway — their plan is to ensure their legacy destroys the world rather than let their enemies win", timing: "Act 3 revelation" },
    { twist: "There is no single villain — the threat is a collective of three factions that have been manipulating all parties", timing: "Mid campaign" },
    { twist: "A dead mentor/ally is revealed to have been a villain agent — but their love for the heroes was genuine", timing: "Act 3" },
    { twist: "Defeating the villain will trigger a magical catastrophe that was only being suppressed by the villain's power", timing: "Pre-final act" },
    { twist: "The heroes are in a time loop — they have attempted this campaign before and failed; some have memories of it", timing: "Act 2" },
    { twist: "The villain's ultimate weapon/ritual requires willing sacrifice — and the heroes will discover someone intends to volunteer", timing: "Final act" },
    { twist: "The heroes' organization/patron has been profiting from the villain's activities and doesn't actually want them stopped", timing: "Act 2-3" },
    { twist: "The 'ancient evil' the villain is awakening is not a monster but a sleeping deity — who might be sympathetic to the heroes", timing: "Final act" }
  ],

  // ── ADVENTURE HOOKS ─────────────────────────────────────────────────────
  adventureHooks: [
    "A letter from a dying relative left specific coordinates and no other explanation",
    "Every member of the party had the exact same dream last night — independently",
    "A job posting in a city tavern has their individual names already written on it",
    "The Pathfinder Society has hired them specifically — they match a prophecy description",
    "Their hometown/origin is under imminent threat that only they have the context to address",
    "A magical item one of them owns spontaneously activated and led them to the same location",
    "Each hero separately witnessed a different piece of the same impossible event",
    "They're all on the same wanted list — for different things — and sharing a prison cell",
    "A notable NPC died in front of each of them separately, giving each a different last message",
    "They've all been framed for the same crime and are the only witnesses that the other is innocent",
    "An oracle specifically hired the group after refusing to hire any other adventuring party in the city",
    "A merchant hired them for what sounds like a simple delivery — the package is trying to speak"
  ],

  // ── NPC ARCHETYPES ──────────────────────────────────────────────────────
  npcArchetypes: [
    { role: "Reluctant Ally", desc: "Holds crucial information but deeply distrusts adventurers; must be earned", personality: "Bitter, cautious, secretly hopeful" },
    { role: "Loyal Mentor Figure", desc: "Experienced and helpful; has a hidden cost the heroes won't discover until too late", personality: "Warm, knowledgeable, carrying a burden they haven't shared" },
    { role: "Tragic Villain Sympathizer", desc: "Supports the villain's original goals but is horrified by current methods", personality: "Conflicted, intelligent, desperate for a third option" },
    { role: "Comic Relief (With Depth)", desc: "Provides humor; reveals at a key moment they have suffered more than anyone", personality: "Irreverent, deflective, hiding devastation behind jokes" },
    { role: "Bureaucratic Obstacle", desc: "A minor official whose procedural obstructions become the heroes' most annoying recurring problem", personality: "Humorless, thorough, actually trying to do their job honestly" },
    { role: "Redeemable Enemy", desc: "A villain agent who begins to doubt their allegiance around Act 2", personality: "Capable, principled, increasingly uncomfortable" },
    { role: "The Unexpected Expert", desc: "Appears unremarkable; is in fact the most qualified person alive for the campaign's specific problem", personality: "Modest, precise, deeply uncomfortable with heroics" },
    { role: "The Local Legend", desc: "Everyone in the region knows them; their reputation is either wildly inflated or inexplicably modest", personality: "Character is a mystery until the heroes earn their trust" },
    { role: "The Child Who Knows Too Much", desc: "Has seen something or learned something they shouldn't have; endangered by this knowledge", personality: "Brave, resourceful, terrified but hiding it" },
    { role: "The Corrupted Official", desc: "Once a genuine public servant; now compromised by the villain; wants the heroes to find out and stop them", personality: "Formal exterior, desperate subtext, leaves deliberate clues" }
  ],

  // ── REWARDS / TREASURE ──────────────────────────────────────────────────
  rewards: {
    level1_5: [
      "A weapon with a minor resonance to the campaign's primary damage type (+1 weapon, specific rune)",
      "A locket containing a preserved memory that serves as a clue to the villain's origin",
      "A faction's signet ring — opens doors and creates enemies simultaneously",
      "A pocket watch that always shows a different time from actual time (and it's always right about something)",
      "A spellbook written in a language no one recognizes — but can be partially read with effort",
      "Enough gold to upgrade the party's base of operations meaningfully",
      "A trained animal companion with an unusual history tied to the main villain",
      "Formulae for a level-appropriate alchemical item with a narrative connection"
    ],
    level6_10: [
      "A +2 striking weapon that whispers warnings in combat (grants the Reactive Strike reaction once per day)",
      "Ancestral armor belonging to a key NPC's family — wearing it creates connection and complication",
      "A map to a cache of pre-Earthfall artifacts — three of which are useful, one of which is dangerous",
      "A sending stone already attuned to a key plot-relevant contact",
      "A manual of the planes annotated by someone who visited each one and didn't enjoy it",
      "A commission from a major city's lord — legally grants the party investigative authority",
      "A magical gem containing a dormant personality fragment of a historical figure"
    ],
    level11_15: [
      "A +2 weapon with a powerful specific property tied to the campaign's main villain type",
      "A wondrous item that was specifically designed to counter the villain's primary power",
      "Deeds to a location the heroes have cleared — theirs to develop into a base",
      "A contact with a deity's direct herald who owes the party a significant favor",
      "Access to a spellcaster of level 15+ as an occasional resource (not a companion)",
      "A relic with three charges of a 7th-rank spell relevant to the campaign's themes"
    ],
    level16_20: [
      "A legendary weapon attuned to the heroes' cause — grows more powerful as they do",
      "An ally who is a demigod or equivalent power — willing to assist once in the final act",
      "A fortress or stronghold that comes with its garrison and ongoing income",
      "A divine boon from a patron deity — one use of a 9th-rank miracle effect",
      "A permanent modification to the heroes' abilities reflecting their growth (campaign-specific boon)"
    ]
  },

  // ── ENCOUNTER TYPES ────────────────────────────────────────────────────
  encounterTypes: [
    { type: "Setpiece Combat", desc: "A dramatic battle in an interesting environment with mechanical terrain features" },
    { type: "Social Challenge", desc: "A high-stakes conversation or negotiation with significant mechanical and narrative consequences" },
    { type: "Skill Exploration", desc: "An area or puzzle that rewards creative use of skills; combat is optional" },
    { type: "Chase Sequence", desc: "Dynamic movement encounter with shifting terrain and time pressure" },
    { type: "Siege Defense", desc: "The heroes must hold a location against overwhelming numbers for a specific number of rounds" },
    { type: "Stealth Infiltration", desc: "Getting in and out without being seen; failure triggers a combat encounter" },
    { type: "Race Against Time", desc: "An objective must be completed while another threat escalates simultaneously" },
    { type: "Moral Dilemma", desc: "No mechanically correct answer; heroes must choose between two harmful options" },
    { type: "Revelation Scene", desc: "A combat or exploration that ends with a major plot revelation changing heroes' understanding" },
    { type: "Recurring Enemy Return", desc: "A villain previously defeated or escaped returns with new abilities and a grudge" }
  ],

  // ── BOSS ENCOUNTER TEMPLATES ────────────────────────────────────────────
  bossEncounters: [
    { name: "The Throne Room", setup: "Boss is enthroned in a room designed to amplify their power", phase2: "The throne is damaged; boss abandons it and fights personally with enhanced aggression", environment: "Mechanical floor traps, servant alcoves, the throne itself as a weapon" },
    { name: "The Collapsing Sanctum", setup: "Boss's lair is catastrophically failing; both sides are racing against structural collapse", phase2: "Boss sacrifices part of their power to trigger a partial collapse, creating obstacles", environment: "Falling debris (2d6 bludgeoning), unstable floors (flat-footed), escape hatches" },
    { name: "The Ritual Circle", setup: "Boss is completing a ritual; interrupting it changes what they become in phase 2", phase2: "Ritual is either completed (boss is empowered) or disrupted (boss is weakened but desperate)", environment: "Active ritual energy (persistent fire/electricity), summoned guardians, circle segments to destroy" },
    { name: "The Ship Battle", setup: "Fight occurs on a ship at sea; multiple elevation levels and the sea itself as hazard", phase2: "Ship catches fire; everyone is racing against time while fighting", environment: "Cannons (can be turned), rigging (Athletics for grapple), falling mast trap" },
    { name: "The Populated Location", setup: "Boss has taken civilians hostage; heroes must balance combat with protection", phase2: "Boss threatens to harm hostages; heroes must split attention or accept a cost", environment: "Civilians in danger (reduce AoE radius or lose Reputation), escape routes, the hostage's location" },
    { name: "The Mirror Chamber", setup: "Room of infinite mirrors; boss uses them to divide their presence across reflections", phase2: "Heroes must identify and destroy the true boss while reflections can deal real damage", environment: "Reflections as separate attackers (half boss stats), shattered mirrors as difficult terrain" }
  ],

  // ── PF2E REMASTER MECHANICS NOTES ──────────────────────────────────────
  pf2eNotes: {
    version: "PF2e Remaster (Player Core, GM Core, Monster Core)",
    keyChanges: [
      "Alignment removed; replaced with deity edicts/anathema and personal ethics",
      "'Evil' creatures now tagged as 'unholy'; 'good' as 'holy' for damage typing",
      "Spell traditions streamlined; arcane/divine/primal/occult remain",
      "Many iconic spells renamed or consolidated (Magic Missile unchanged; Fireball unchanged)",
      "Recall Knowledge more structured; specific DCs per creature type",
      "Exploration activities expanded with more specific outcomes",
      "Hero Points remain; Fortune/Misfortune terminology standardized"
    ],
    encounterBudget: {
      trivial: "40 XP — no meaningful resource drain",
      low: "60 XP — minor resource expenditure",
      moderate: "80 XP — standard encounter; some resources used",
      severe: "120 XP — major resources; someone may fall",
      extreme: "160 XP — real risk of death; use sparingly",
      note: "XP values based on party of 4; adjust by ±10 XP per player above/below 4"
    },
    levelingNote: "Milestone XP recommended for campaign play; award at natural story beats rather than per encounter"
  }
};

if (typeof module !== 'undefined') module.exports = COMPONENTS;
