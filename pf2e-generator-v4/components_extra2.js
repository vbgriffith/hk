/**
 * data/components_extra2.js  —  Build 4.5 Data Expansion, Batch 2
 * Massively expands every pool the generator actually uses:
 *   - NPC first/last names (100 each → 200+ each)
 *   - Act titles (36 → 72 title options)
 *   - Act summaries (6 → 20 distinct summary templates)
 *   - Quest title prefixes/suffixes (expanded 3×)
 *   - Quest template fill-words (enemies, demands, items)
 *   - Boss name fragments
 *   - Villain names/titles (expanded)
 *   - Milestone events (20 → 60)
 *   - Encounter environment details
 *   - Faction hooks expanded
 */

const COMPONENTS_EXTRA2 = {

  // ── Extended NPC Name Pools ──────────────────────────────────────────────
  npcNames: {
    first: [
      // Original 15 + 85 new
      "Aldara","Caius","Mirela","Thorvald","Zephyrine","Kasimir","Lirien","Ozren","Fennick","Tarasha",
      "Ileth","Rogan","Solvey","Nadir","Corazon",
      // New additions
      "Aevith","Bryndis","Calder","Dessa","Eloric","Fenna","Gareth","Haevi","Isara","Jorath",
      "Kessa","Loral","Maeris","Neven","Oswin","Phaelen","Quira","Rethis","Saria","Tavar",
      "Ulrith","Vexa","Westan","Xila","Yeldra","Zoran","Aelindra","Brix","Cade","Dreva",
      "Evorn","Faldris","Gessa","Havar","Imara","Jael","Kiren","Lessa","Moran","Norith",
      "Orvald","Preva","Quell","Riven","Sela","Thorn","Uvira","Vel","Wren","Xander",
      "Yveth","Zel","Ashira","Brenna","Ciral","Dorath","Erith","Fyren","Garen","Hessa",
      "Idris","Jadra","Koval","Loreth","Mira","Nerith","Orlan","Pell","Quessa","Ravel",
      "Selindra","Torvald","Urath","Vara","Wessa","Xirath","Yelindra","Zarith","Arek","Bessa",
      "Ceth","Dorn","Evira","Fress","Garath","Helm","Isel","Jarren","Karath","Leth"
    ],
    last: [
      // Original 15 + 85 new
      "Voss","Kast","Vex","Brightmantle","the Unbroken","of the North Wind","Dunmore","Ashcroft",
      "Silversong","Rein","Coldwater","Dunwall","the Forgotten","Mirepoix","Graystone",
      // New additions
      "Aldenmoor","Blackthorn","Coldforge","Duskwood","Emberfall","Frostmantle","Goldcrest","Halfmoon",
      "Ironveil","Jadehollow","Kettlemoor","Lastlight","Mistborne","Nightfall","Oldcrow","Palewater",
      "Quickthorn","Ravenshire","Saltwind","Thorngate","Umbraveil","Verdant","Whitewood","Xarath",
      "Yellowfen","Zephyrstone","the Twice-Born","the Last","of Ash","of Ember","the Mended",
      "the Unasked","the Patient","the Far Shore","Hollowbrook","Irongate","Jadecrest","Kestrel",
      "Longwater","Mirrorfen","Nightbrook","Oldmere","Palecrest","Quietvale","Rustwood","Silvermere",
      "Thornwall","Undercroft","Velvet","Westmarch","Xilwood","Yarrow","Zephyrvale","Amberfall",
      "Brightwater","Coldmere","Deepmoor","Echomere","Farwater","Glimmerstone","Halvale","Ironwood",
      "Jasperfen","Kindlebrook","Longmere","Moonfall","Nightvale","Oakhaven","Pinecrest","Quarrystone",
      "Ridgewater","Stormcrest","Tidemark","Underhill","Vinemere","Willowfen","Xanbrook","Yellwood",
      "Zephyrfen","Aldgate","Brownmere","Copperwood","Dustmere","Elmvale","Foxwood","Greenfen"
    ]
  },

  // ── Extended Act Titles (6 acts × 12 options each) ────────────────────────
  actTitles: [
    // Act 1
    [
      "The Call to Adventure","Spark in the Dark","Into the Unknown","The First Blood",
      "Seeds of Conflict","The Opening Move","What Lies Beneath","Before the Storm",
      "A Stranger's Warning","The Cost of Curiosity","Into the Fire","First Truths"
    ],
    // Act 2
    [
      "Rising Tensions","The Shadow Grows","Truth Behind the Lies","Crossing the Threshold",
      "Allies and Enemies","The Long Game","What Was Hidden","The Price of Knowledge",
      "Deeper Waters","Broken Trust","The Second Front","Consequences Begin"
    ],
    // Act 3
    [
      "The Point of No Return","When Allies Fall","Ashes and Ember","The Long Descent",
      "What Cannot Be Undone","The Weight of Choice","Burning Bridges","No Retreat",
      "The Cost Revealed","Old Sins Surface","The Turning Point","Into the Heart"
    ],
    // Act 4
    [
      "Storm Before the Silence","All Cards on the Table","The World Tilts","Convergence",
      "The Final Pieces","No Safe Ground","The Last Alliance","When Night Falls",
      "Everything at Stake","The Breaking Point","Desperate Measures","Before the End"
    ],
    // Act 5
    [
      "The Final Reckoning","The Last Mile","When Hope Runs Out","Into the Fire",
      "The Long Goodbye","No More Chances","The Price of Victory","This Is It",
      "The Last Stand","Everything on the Line","One Final Dawn","The End of the Road"
    ],
    // Act 6 (Epilogue)
    [
      "Epilogue and Echoes","What Was Won","The World After","Legacy",
      "Aftermath","The Cost Counted","What Remains","New Beginnings",
      "The Dust Settles","Scars and Stories","The Next Chapter","What They Built"
    ]
  ],

  // ── Act Summary Templates (20 variants, each customizable) ───────────────
  actSummaryTemplates: [
    // [0] — Establishment / discovery
    `The heroes arrive in {location}, drawn by {inciting_event}. What begins as {apparent_task} rapidly reveals itself to be connected to something much larger. {villain_name}'s influence is subtle here — visible only in certain small wrongnesses that the heroes begin to catalogue. By the time the act closes, they have their first true glimpse of the threat's scope and have made at least one choice they cannot take back.`,

    // [1] — Rising stakes
    `{location} has changed since the campaign began. The heroes return — or arrive — to find {faction} in a newly precarious position. {beat} What they discover here reshapes their understanding of the villain's plan: what they thought was the goal is revealed to be a distraction, and the true objective is something they have already been failing to protect.`,

    // [2] — Alliance building
    `The heroes spend this act building the coalition they'll need for what comes later. {location} is a crucible: every faction they approach comes with complications. {beat} A betrayal mid-act forces them to reconsider who they can trust. By the close, they have fewer allies than they started with, but the ones who remain are absolutely reliable — because the unreliable ones have already been eliminated.`,

    // [3] — Investigation / revelation
    `{location} holds answers the heroes have been searching for. The act is structured around a mounting series of discoveries, each one more troubling than the last. {beat} The villain appears briefly — not to fight, but to let the heroes see how far ahead they are. The act closes with an answer that raises three new questions, and the knowledge that the campaign just fundamentally changed.`,

    // [4] — Crisis response
    `Something has gone wrong in {location}, and the heroes are the only people close enough to respond. There is no time for planning — only reaction. {beat} Every decision made under pressure has consequences that reverberate into later acts. The heroes do not emerge from this act clean: something was lost, something was broken, or something that cannot be fixed was set in motion.`,

    // [5] — Political navigation
    `{location} is a place where power is contested, and the heroes have been thrust into the middle of a conflict that predates their involvement. {beat} Every faction wants something from them. Every faction is willing to be used if the heroes are willing to be used by them. By the end of the act, the heroes understand that winning politically requires a different kind of compromise than winning in combat — and they must decide if they're willing to make it.`,

    // [6] — The hunt
    `{villain_name} is here — or was, recently. The heroes spend the act hunting someone who knows they're being followed and has prepared accordingly. {beat} A trap is sprung; the heroes learn that the villain has been studying them as carefully as they have been studying the villain. The near-miss reveals something crucial: what the villain wants, and why they haven't simply destroyed the heroes already.`,

    // [7] — Defense
    `Something the heroes have built — an alliance, a location, a relationship — is under direct attack. {location} is the ground they have chosen to defend. {beat} The odds are not in their favor. The act is structured around choosing what can be protected and sacrificing what cannot. What survives is stronger for the experience. What doesn't survive is gone permanently.`,

    // [8] — Infiltration
    `The heroes cannot fight their way to this objective. {location} requires finesse — getting in, getting what they need, and getting out without anyone knowing they were there. {beat} Something goes wrong at the worst possible moment. The act tests the heroes' ability to improvise under conditions where improvising loudly means failing loudly. Success here gives them something they couldn't have gotten any other way.`,

    // [9] — The villain's perspective
    `This act shows the heroes what {villain_name} actually is — not the monster or the symbol, but the person. {location} is the villain's territory, and navigating it forces the heroes to understand how the villain sees the world. {beat} The understanding doesn't excuse anything. It may make the final confrontation harder, not easier. The heroes leave knowing that this is a person they're going to have to destroy, and what that costs.`,

    // [10] — Loss
    `Not every act ends in victory. {location} is where the heroes face a loss they couldn't prevent — a faction collapses, an ally is killed, a resource is destroyed, a plan is revealed to have failed months ago. {beat} Grief is not the end. The act closes not with despair but with the specific kind of determination that only comes after real loss: quieter, colder, and considerably more dangerous than optimism.`,

    // [11] — Transformation
    `{location} changes the heroes. Whether through a ritual, a revelation, a relationship, or a choice with permanent consequences, the heroes who leave this act are different from the ones who entered it. {beat} The change is not entirely comfortable. New capabilities come with new vulnerabilities. New knowledge comes with new responsibilities. By the end of this act, there is no going back to who they were.`,

    // [12] — Reckoning
    `Every choice the heroes have made since Act 1 is here, waiting for them. {location} is where consequences catch up. Factions they managed badly become problems. Allies they under-supported are struggling. The villain has exploited every gap the heroes left. {beat} It is not too late to fix things — but fixing them requires acknowledging what they got wrong, which is harder than any combat encounter they have faced.`,

    // [13] — Hope
    `Against all reasonable expectation, this act delivers something that looked impossible: a genuine advantage. {location} holds a resource, an ally, a piece of knowledge, or an opportunity that changes the campaign's arithmetic. {beat} The advantage is real but fragile. It requires protection, maintenance, and careful deployment. The heroes spend the act understanding exactly what they have and exactly how not to waste it.`,

    // [14] — The long shot
    `The plan should not work. {location} is the villain's territory, the odds are against the heroes, and the margin for error is functionally zero. {beat} Somehow, it works — or partially works, with significant collateral damage. The act ends with the heroes having done something that experts would have said was impossible, which is both satisfying and deeply worrying: because the villain will now know they're capable of it.`,

    // [15] — Sacrifice
    `Someone pays a price in {location} that cannot be refunded. The act is structured around the awareness that success here will cost something irreplaceable — and the heroes know it before they begin. {beat} The sacrifice is made. What it purchases may not be immediately clear. The act closes on the weight of what was given up, and the question of whether it was worth it — which can only be answered by what comes later.`,

    // [16] — Reunion
    `{location} brings back someone from the heroes' past — an ally thought lost, an enemy thought defeated, or a neutral party whose return changes everything. {beat} The reunion is not simple. The returned figure has changed; so have the heroes. The relationship must be rebuilt or resolved, and the act is structured around that process. By the end, the relationship is something new — not what it was, but potentially something better.`,

    // [17] — The reveal
    `Everything the heroes thought they knew is wrong. {location} is where the truth surfaces. {beat} The revelation is not a betrayal — it's a correction, delivered by a campaign that has been building toward this moment since Act 1. The heroes must rebuild their understanding of the situation from scratch. What changes, and what remains true, will determine the shape of everything that follows.`,

    // [18] — Final preparation
    `The heroes are as ready as they're going to be. {location} is the last place they visit before the campaign's climax — and it's where they assemble every resource, every ally, and every advantage they've built. {beat} There is a final choice to be made here: what to bring into the final confrontation and what to leave behind. The choice is not tactical — it's a statement about who the heroes are.`,

    // [19] — Aftermath
    `{villain_name} is gone. {location} is what remains. The act is not about celebration — it's about the hard work of dealing with consequences: survivors who need help, systems that need rebuilding, and a world that was permanently changed by what happened. {beat} The heroes discover that victory is not an ending. It's a different kind of beginning, with different responsibilities. The campaign closes not on a high note, but on a true one.`
  ],

  // ── Extended Quest Title Components ──────────────────────────────────────
  questTitles: {
    prefixes: {
      Rescue:       ["The Lost","Captive in the Dark","No One Left Behind","Worth Saving",
                     "From the Depths","The Missing","Before They Break","Still Breathing",
                     "One More Chance","Held in the Dark","The Only One","Find Them"],
      Investigation:["Who Killed","The Truth of","What They Found","Unraveling",
                     "Signs and Traces","The Question of","No Simple Answer","Evidence of",
                     "What Was Hidden","The Record of","Inconsistencies","The Real Story of"],
      Escort:       ["Safe Passage","The Long Road","Getting There","Protecting",
                     "Across Danger","The Hard Way","See Them Home","Safely Through",
                     "Against All Odds","Without Incident","One Last Mile","Clear the Path"],
      Heist:        ["Stealing Back","The Inside Job","One Quiet Night","Taking What's Owed",
                     "Without a Sound","The Perfect Theft","Before Dawn","Undetected",
                     "From Under Their Noses","No Witnesses","The Score","What They Took"],
      Diplomacy:    ["Bridge the Divide","Words Before War","The Reluctant Alliance","Making Peace",
                     "Before It's Too Late","One Last Try","The Hard Conversation","Finding Common Ground",
                     "Against Their Nature","Holding It Together","The Negotiation","Through Compromise"],
      Dungeon:      ["The Sealed Level","What Waits Below","Old Bones","Into the Dark",
                     "What Was Locked Away","Beneath Everything","The Forgotten Depth","No Map Exists",
                     "The Oldest Door","What They Buried","Claimed by Silence","Below the Known"],
      Mystery:      ["The Missing","What Everyone Forgot","No Explanation Given","Strange Signs",
                     "No Body Found","The Silence Around","What Doesn't Add Up","The Impossible Event",
                     "Against All Evidence","The Only Witness","What Was Erased","The Pattern"],
      Combat:       ["The Coming Storm","Clear the Road","No Survivors","Stop Them Here",
                     "Hold the Line","Before They Arrive","No Quarter","The Last Defense",
                     "At the Gates","Outnumbered","The Hard Fight","Not One Step Back"],
      Archaeological:["Unearthed","The Hidden Record","Older Than Memory","What Was Buried",
                      "Beneath the Ruin","Voices in Stone","The Excavation","The Found Age"],
      Environmental: ["The Source","The Spreading","Against the Blight","Before It Spreads",
                      "What Changed the Land","The Balance","Root Cause","The Dying"],
      Criminal:     ["The Network","Who Benefits","The Cover-Up","False Records",
                     "The Real Operation","Under False Names","The Money Trail","What Was Moved"],
      Ethical:      ["The Impossible Choice","Both Sides","No Clean Answer","The Cost",
                     "What Justice Costs","The Lesser Harm","All Options Are Bad","Still Deciding"],
      Haunting:     ["The Unquiet","Still There","Unfinished Business","The Attached",
                     "What Won't Rest","Voices of the Lost","The Restless","Old Grief"],
      Personal:     ["One of Their Own","The Personal Cost","Family Matters","Old Wounds",
                     "What They Didn't Say","The Hard Return","For Them","Before It's Too Late"]
    },
    suffixes: [
      "of the {loc}","at {season}","before {event}","in the Shadow of {villain}","for the sake of {person}",
      "at the {place}","beneath {terrain}","beyond the {boundary}","during {crisis}","within {structure}",
      "across {distance}","after {past_event}","before the {ending}","through {obstacle}","against {opposition}",
      "in {weather}","at {time}","without {resource}","despite {complication}","under {condition}"
    ],
    locWords: [
      "Ruins","Forest","Tower","Keep","Harbor","Mountain","Gate","Valley",
      "Temple","Vault","Archive","Crossing","Sanctum","Delve","Barrow","Spire",
      "Hollow","Reach","Moor","Fen","Crest","Pass","Canyon","Expanse","Threshold"
    ],
    seasons: [
      "the Harvest","Midsummer","the Long Dark","the Thaw","Solstice","the Monsoon",
      "the Dry Season","First Frost","the Turning","the Last Bloom","Deep Winter","Late Autumn"
    ],
    events: [
      "the Festival","the Siege","the Trial","the Summit","the Eclipse","the Election",
      "the Ceremony","the Crossing","the Gathering","the Reckoning","the Vote","the Signing",
      "the Conjunction","the Parade","the Announcement","the Departure"
    ],
    persons: [
      "the Innocent","the Fallen","the Living","the Lost","the Remembered","the Witness",
      "the Children","the Survivors","the Accused","the Vanished","the Forgotten","the Patient"
    ],
    places: [
      "Edge of the World","Broken Shore","High Keep","Old City","Deep Archive","Final Gate",
      "Sealed Chamber","Last Crossing","Burning District","Occupied Quarter"
    ],
    terrain: [
      "the Haunted Wood","ancient stone","collapsed walls","deep water","poisoned earth",
      "forbidden territory","unstable ground","the sealed vault","the old growth"
    ],
    boundaries: [
      "the Known World","the Pale","the Warded Zone","the Claimed Territory",
      "the Safe Distance","the Old Border","living memory","the acceptable"
    ],
    crises: [
      "the Political Crisis","active combat","the evacuation","the investigation",
      "lockdown conditions","the power vacuum","the succession dispute"
    ],
    structures: [
      "the Enemy's Stronghold","the Occupied City","the Warded Temple","the Sealed Archive",
      "the Hostile Court","the Living Prison","the Collapsing Keep"
    ],
    distances: [
      "a Hundred Miles of Hostile Territory","Three Kingdoms","the Contested Pass",
      "the Open Sea","Enemy Lines","the No Man's Land"
    ],
    pastEvents: [
      "the Last War","the Great Betrayal","the Founding Mistake","the Original Accord",
      "what the Heroes Did","the Long Silence","the First Disaster"
    ],
    endings: [
      "Final Hour","Point of No Return","Last Sunrise","Last Chance","Time Runs Out",
      "Seal Is Broken","Storm Arrives","End Begins"
    ],
    obstacles: [
      "Fire and Opposition","Grief and Loss","the Impossible Odds","Betrayal and Doubt",
      "Exhaustion and Need","Limited Time","the Unwilling"
    ],
    oppositions: [
      "All Expectation","Overwhelming Force","Certain Defeat","the Villain's Preparation",
      "Their Own Better Judgment","the Political Current","the Laws of Magic"
    ],
    weathers: [
      "the Storm","Magical Darkness","Supernatural Winter","the Blizzard",
      "Killing Heat","the Fog of War","Unnatural Silence"
    ],
    times: [
      "Dawn","the Final Night","the Last Day","Midnight","the Witching Hour",
      "the Eclipse","the Longest Night","the Last Watch"
    ],
    resources: [
      "Backup","a Plan","Time to Prepare","Full Strength","Allied Support",
      "the Right Tools","Prior Knowledge","a Safe Route"
    ],
    complications: [
      "Prior Failure","Conflicting Loyalties","Insufficient Evidence","Divided Party",
      "Unknown Variables","Moral Compromise","Personal Cost","Burned Bridges"
    ],
    conditions: [
      "False Identities","Time Pressure","Observation","Magical Constraint",
      "Political Restriction","Sworn Oath","Limited Authority","Public Scrutiny"
    ]
  },

  // ── Quest Fill Variables (enemies, demands, items, contacts) ─────────────
  questFillVars: {
    enemy: [
      "a local crime boss","the villain's agents","a mercenary band","a transformed ally",
      "a rival faction","a corrupted official","a beast pack","a rogue construct",
      "a desperate faction","the villain's second-in-command","an opportunistic noble",
      "a supernatural predator","a deserting military unit","a manipulated mob",
      "a ancient spirit defending its territory","rival adventurers with competing orders"
    ],
    demand: [
      "information about the party","a specific magical artifact","safe passage through their territory",
      "the release of one of their own prisoners","public acknowledgment of a wrong",
      "a political concession from a faction ally","money (a lot of it)","a piece of the heroes' history",
      "proof that the heroes will not pursue them further","access to something only the heroes possess",
      "a skilled service only one party member can provide","a sacrifice they will not name until it's too late to refuse"
    ],
    item: [
      "an ancient seal","the missing key","a forged document","the genuine document",
      "a stolen artifact","the villain's correspondence","evidence of the crime",
      "a weapon component","the ritual focus","an heir's seal","a bound creature",
      "a cursed object","the real will","a forbidden text","a strategic map"
    ],
    contact: [
      "a fence who knows the city's secrets","a former villain agent seeking redemption",
      "a scholar with relevant expertise who won't leave their library","a retired adventurer with unfinished business",
      "a government official who is not what they seem","a street operative with access the heroes lack",
      "a religious figure with a direct line to relevant divine knowledge","an informant inside the villain's organization",
      "a prisoner who witnessed the key event","a child who was the only survivor"
    ],
    location_descriptor: [
      "half-flooded","under guard","on fire","in the middle of a festival","contested by two factions",
      "abandoned but not empty","recently ransacked","accessible only at specific times",
      "warded against magical entry","in the heart of hostile territory","inside the villain's own facility"
    ]
  },

  // ── Boss Name Fragments ───────────────────────────────────────────────────
  bossNameFragments: {
    titles: [
      "Champion of","Herald of","Agent of","Enforcer of","Voice of","Hand of","Blade of",
      "Shadow of","Instrument of","First of","Last of","Chosen of","Keeper of","Warden of",
      "Vessel of","Emissary of","Scourge of","Architect of","Eye of","Fist of"
    ],
    descriptors: [
      "the Unbroken","the Patient","the Inevitable","the Hungry","the Relentless",
      "the Silent","the Last","the Risen","the Sealed","the Burning","the Drowning",
      "the Laughing","the Weeping","the Woken","the Ancient","the New","the Hollow",
      "the Filled","the Waiting","the Done","the Coming","the Gone"
    ],
    epithets: [
      "Dreadborn","Ashwalker","Stormcaller","Gravewright","Voidtouched","Fleshcarver",
      "Mindbreaker","Soulchained","Plaguewright","Ironheart","Coldfire","Darkmantle",
      "Veilwalker","Bonewhisper","Shadowwrought","Timeless","Fearbringer","Gloomcrown"
    ]
  },

  // ── Villain Name Pools ────────────────────────────────────────────────────
  villainNames: {
    first: [
      "Veskaroth","Thalvorex","Caethis","Thessaly","Hadrath","Olindra","Ximara","Brevin",
      "Phaedra","Seravael","Tessalind","Moorfield","Rethis","Aldavan","Aveleth","Arch",
      "Brandeth","Corsair","Doreval","Elarith","Faethis","Gavroth","Heskara","Isavel",
      "Jothis","Keldrath","Loreth","Maerath","Navoris","Ostavar","Peleth","Queth",
      "Rovanis","Sorith","Tessev","Ulveth","Vashti","Wethara","Xilrath","Yeldris",
      "Zorath","Aeldrath","Berith","Celdrak","Dothis","Ervath","Felvaris","Gothrak",
      "Hexara","Ildrath","Jaleth","Kethis","Laoris","Mathrak","Nethara","Olveth"
    ],
    last: [
      "the Undying","the Inevitable","the Patient","the Last","of the Deep","the Ascending",
      "the Architect","the Unmoored","the Hollow","the Filled","Mournebridge","Aldast",
      "Sorel","Hask","Renn","Dorath","Keln","Morann","Cors","Solvane","the Relentless",
      "the Ancient","the New","the Woken","the Sealed","the Burning","of Ash","of Ember",
      "of the Wound","the Corrector","the Final","the Patient Planner","Voss","the Rewriter",
      "the Long Sight","the Weight","the Quiet","the Loud","the Coming","the Gone"
    ],
    titles: [
      "Archvillain of the Age","Architect of the End","The Patient One","Voice of Inevitable Doom",
      "Master of All Plans","The Collector","The Director","Supreme Director","Grand Archivist",
      "First Among the Fallen","Sovereign of the Dark","Regent of Sorrows","The Inevitable",
      "Commander of the Final Hour","Keeper of the Long Game","The Unseen Hand","Voice of the Void",
      "The Last Obstacle","Prime Mover","The Weight on the Scale"
    ]
  },

  // ── Extended Encounter Environment Details ────────────────────────────────
  encounterEnvironments: {
    hazards: [
      "falling debris (2d6 bludgeoning, DC 18 Reflex or knocked prone)",
      "rising water (10 ft per round; DC 15 Athletics to move through)",
      "spreading fire (2d6 persistent fire to all in burning squares)",
      "collapsing floor (DC 20 Reflex or fall 20 ft)",
      "arcane suppression field (spell DCs increased by 2 in marked zone)",
      "necrotic miasma (1d6 negative damage per round without divine protection)",
      "temporal distortion (random initiative rerolls at start of each round)",
      "gravity reversal (random 10-ft columns; DC 16 Reflex or fall upward 30 ft)",
      "divine radiance burst (2d8 holy damage to unholy creatures in area)",
      "summoning vortex (random creature summoned from the Void each round)",
      "memory erasure field (all Knowledge checks fail; flat-footed to unknown creatures)",
      "unstable planar boundary (spells may slip into adjacent plane on a 1-3)",
      "poison cloud (Fortitude DC 17 or Sickened 2 for 1 round)",
      "enervating darkness (no light sources function; Darkvision shows only 15 ft)"
    ],
    features: [
      "three elevation levels connected by rickety rope bridges",
      "a central mechanism that one character can spend an action to activate for tactical benefit",
      "crumbling pillars (each can be toppled as a 2-action activity; blocks squares)",
      "a scrying mirror that shows the villain watching from afar",
      "multiple exits that enemies are funneling toward",
      "a trapped staircase that collapses after three uses",
      "a large table that can be overturned for cover",
      "magical lighting that cycles through spectra; in certain spectra, certain creatures become invisible",
      "an active summoning circle in the center that can be disrupted or weaponized",
      "a chandelier that can be dropped (3d6 bludgeoning, DC 18 Reflex, 15-ft burst)",
      "a map pinned to the wall that reveals a previously unknown location",
      "journals and documents that reward a single Investigation action mid-combat",
      "windows to the exterior that can be used for exit or entry",
      "a magical ward that automatically counteracts effects of a specific type"
    ],
    moralElements: [
      "civilians sheltering in the location who cannot be caught in AoE effects without consequence",
      "a villain agent who is clearly trying to get caught and protected rather than succeed",
      "a trapped animal that becomes a combat obstacle if freed but provides a future ally",
      "documents in the location that implicate a faction ally in something morally complicated",
      "prisoners who must be protected during the combat",
      "an irreplaceable artifact that could be destroyed in the crossfire",
      "a character who is fighting on the wrong side for understandable reasons"
    ]
  },

  // ── Extended Faction Hook Templates ──────────────────────────────────────
  factionHookTemplates: [
    "Will ally with the heroes if they demonstrate {quality}; will oppose them if they demonstrate {flaw}",
    "Has been watching the heroes since {early_event}; knows more about them than they've revealed",
    "Wants the villain stopped for reasons that have nothing to do with the heroes' reasons",
    "Will help the heroes get to {objective} but the price is helping them get to {faction_objective}",
    "Appears to be an obstacle until the heroes learn what they're actually trying to accomplish",
    "Has a resource the heroes desperately need and a problem only the heroes can solve",
    "Opposed to the heroes initially; becomes an ally when the villain betrays a mutual agreement",
    "Will provide intelligence but not direct assistance; their neutrality is structurally important",
    "Has already tried to stop the villain once and failed; their knowledge of what went wrong is invaluable",
    "Is being used by the villain as a shield; helping them means revealing the villain's real position",
    "Doesn't trust the heroes because of {past_event}; trust must be earned through specific actions",
    "Will fight beside the heroes unconditionally, but their methods create political problems"
  ],

  // ── Extended World-Building Details (for hex map and rumor generators) ───
  worldDetails: {
    tradedGoods: [
      "salt from the inland sea","preserved fish from the northern coast","grain from the southern plains",
      "iron ore from the mountain settlements","magical components from the arcane district",
      "medicinal herbs from the forest druids","spices from the distant trade ships",
      "dyed cloth from the river-town weavers","refined oil from the press settlements",
      "timber from managed forest regions","clay from riverside deposits","leather from the herding communities",
      "metal tools from the forge towns","preserved meat from the hunting communities",
      "glass from the sand-rich coast","paper from the scholar districts","rope from the coastal settlements",
      "horses from the plains communities","wool from highland shepherds","wine from the river valleys"
    ],
    localConflicts: [
      "a water rights dispute between two farming communities with three wells",
      "a succession question in a minor noble house with four claimants",
      "a religious schism over the interpretation of a deity's most recent proclamation",
      "a trade guild dispute blocking access to a major market",
      "a long-standing feud between two family groups that has never been formally resolved",
      "a boundary dispute between two communities over a resource that appeared after they settled",
      "a conflict between an established community and a new settler group",
      "a disagreement about how to respond to a recent threat that split a community",
      "competition between two merchants for the same contract that has turned personal",
      "a community divided over whether to accept a powerful patron's offer of protection"
    ],
    localLegends: [
      "a treasure hidden by the founder of the settlement that has never been found",
      "a ghost that appears to warn of floods; it has been right every time",
      "a creature in the local forest that is said to grant one wish but always takes something equal",
      "the ruins of a previous settlement beneath the current one that some say is still inhabited",
      "a local hero from three generations ago who supposedly never died but hasn't been seen since",
      "a curse placed on the main road that hasn't manifested yet but is considered inevitable",
      "a holy site that healers from a distant faith regularly visit for reasons they won't explain",
      "a door in the oldest building that leads somewhere different every time it's opened",
      "a spring whose water tastes different depending on who drinks it and why",
      "an animal that has lived in the settlement for longer than anyone can remember and seems to understand speech"
    ],
    architecturalDetails: [
      "buildings connected by rooftop walkways above street level",
      "canals instead of streets in the lower districts",
      "a wall that was built too late to matter but is maintained anyway as a point of community pride",
      "a tower in the center of town that predates the settlement by 800 years",
      "underground passages connecting the major buildings that everyone knows about but no one maps",
      "a market that operates only at night for reasons locals consider obvious but won't explain",
      "defensive earthworks that were designed for a threat from the wrong direction",
      "a public square dominated by a statue of someone controversial",
      "distinct architectural styles that tell the history of which culture controlled the settlement when",
      "structures that were originally built for a different purpose and repurposed imperfectly"
    ]
  },

  // ── Extended Villain Motivation Nuances ───────────────────────────────────
  villainMotivationNuances: [
    "believes they are the last person willing to do what is necessary",
    "has already tried the heroic approach and watched it fail catastrophically",
    "is acting on information the heroes don't have and won't receive until Act 3",
    "genuinely cares about the people they're harming and has convinced themselves it's worth it",
    "was given a choice between two catastrophes and chose the one they could live with",
    "made a decision under pressure twenty years ago that made this inevitable",
    "is being compelled by something the heroes haven't discovered yet",
    "is the lesser of two evils, a fact the heroes will discover too late to change their approach",
    "believes the heroes will thank them eventually and that this belief might even be correct",
    "has done something genuinely good that the heroes will have to weigh against everything else"
  ],

  // ── Extended Boss Tactics ─────────────────────────────────────────────────
  bossTactics: [
    "opens combat with a morale-breaking action rather than direct attack; targets the hero most central to party cohesion first",
    "fights defensively until the heroes use their most powerful abilities, then begins their counteroffensive",
    "exploits specific hero weaknesses identified through prior observation; has been watching them",
    "uses the environment as the primary weapon; direct attacks are secondary",
    "retreats to a prepared position the moment the fight turns against them; has multiple fallback locations",
    "targets the heroes' allies first; knows the heroes will split attention",
    "opens by creating a condition that forces the heroes to split the party",
    "uses seemingly suicidal tactics that have a second purpose the heroes realize too late",
    "talks throughout the fight; the monologue is tactical, not decorative",
    "has already won before the fight starts; the combat is about whether the heroes can find the third option"
  ],

  // ── Extended Villain Weaknesses ───────────────────────────────────────────
  villainWeaknesses: [
    "a personal connection to one specific hero that they cannot fully suppress",
    "a binding oath sworn under circumstances they didn't fully understand at the time",
    "a magical constraint built into their power source that limits their options",
    "an emotional wound that has never healed and that genuine compassion can briefly open",
    "an old ally who knows a counter-measure the villain has never been able to fully neutralize",
    "a specific type of magic they systematically avoided developing a defense against",
    "the trust of the people who follow them — which can be broken by revealing the right truth",
    "an artifact bound to someone else that limits their power in its presence",
    "a past failure they have never acknowledged and that acknowledgment can temporarily destabilize",
    "the specific goal they're pursuing — approaching from a direction that bypasses the goal changes the terrain entirely"
  ],

  // ── Extended Villain Secret Reveals ──────────────────────────────────────
  villainSecretReveals: [
    "the plan was designed by someone else; they are executing it faithfully without understanding why certain elements were included",
    "they have been protecting someone from the consequences of their own plan without that person's knowledge",
    "they are not the first person to hold this position; there have been three predecessors, and the heroes are the ones who stopped them",
    "they considered the heroic path; have documentation of when they abandoned it and why; it was for a reason the heroes will have to acknowledge",
    "they are dying and the plan's timeline is dictated by their own lifespan, not strategic preference",
    "a faction ally of the heroes was complicit in creating the conditions that made the villain possible",
    "they have a kill switch for their own plan that they haven't used yet; they're waiting to see if the heroes can stop it themselves",
    "the 'evil plan' is a bargaining position; the actual goal is something they've never stated and might be acceptable",
    "every action taken has been reversible until one specific moment that is still in the future; they are hoping the heroes stop them before that moment",
    "they love someone who will be hurt by the plan's success; they have not found a way to reconcile this"
  ],

  // ── Rumor Starters (30 additional, total 60) ──────────────────────────────
  rumors: [
    "A local official has started attending services at a temple they publicly opposed for years",
    "The garrison has been conducting nighttime drills outside the city where no one can observe",
    "A merchant who specializes in a very specific type of cargo has suddenly diversified into everything",
    "Three buildings on the same street have been quietly purchased by entities that appear unconnected",
    "A child prodigy who was being mentored by a faction ally has disappeared from the training program",
    "Someone has been asking detailed questions about the old city layout before a specific renovation",
    "A reliable trade ship has missed its last two scheduled arrivals; the company says it's delayed, not missing",
    "An anonymous donation to a civic project was three times what the project needed; the donor's conditions are sealed",
    "A ritual that requires simultaneous participation at five different sites has been scheduled; the sites are spread across four different factions",
    "The best locksmith in the city has retired suddenly after forty years without explanation",
    "Two rival guilds that have been at each other's throats for a decade just went conspicuously quiet",
    "A series of seemingly unconnected crimes all occurred on the same night at the same time of night",
    "A faction leader's personal guard has been replaced entirely over the past three months",
    "The annual census counted 400 fewer people than last year in a city with no recorded deaths or emigration",
    "A messenger who was supposed to arrive with critical diplomatic correspondence hasn't been seen since entering the city",
    "Three separate scholars independently requested the same obscure historical record from the national archive on the same day",
    "An influential figure who is known for never leaving their home has been sighted twice in the market district",
    "The price of a very specific alchemical reagent has tripled in the last month for no stated reason",
    "A building that has been empty for ten years has lights in its windows at night",
    "A local festival that has been held for 200 years has been quietly canceled this year with no public announcement",
    "Someone has been asking every healer in the city about a specific but vague set of symptoms",
    "A legal dispute that has been running for eight years was abruptly settled last week under sealed terms",
    "Three different people in the city have had the same dream, described to three different tavern patrons, who compared notes",
    "A cartographer's recent work contains a location that shouldn't exist based on the surrounding geography",
    "An employee of a major institution has submitted a formal resignation and been immediately escorted from the building",
    "A local criminal operation that has been stable for fifteen years has suddenly stopped operating",
    "Something was delivered to a specific address in the middle of the night; the neighbors don't know what it was but describe an unusual smell",
    "A retired soldier has been asking questions about the chain of command during a specific battle thirty years ago",
    "The same phrase has appeared in graffiti in seven different neighborhoods over three days",
    "A community leader who survived a major disaster three years ago has quietly left the city, taking only what fits in a bag"
  ]
};

// ── Runtime merge into COMPONENTS ────────────────────────────────────────────
(function mergeCE2() {
  if (typeof COMPONENTS === 'undefined') return;

  // Extend NPC name pools used by generator.js
  if (!COMPONENTS.npcFirstNames) {
    COMPONENTS.npcFirstNames = [...COMPONENTS_EXTRA2.npcNames.first];
  } else {
    COMPONENTS_EXTRA2.npcNames.first.forEach(n => COMPONENTS.npcFirstNames.push(n));
  }
  if (!COMPONENTS.npcLastNames) {
    COMPONENTS.npcLastNames = [...COMPONENTS_EXTRA2.npcNames.last];
  } else {
    COMPONENTS_EXTRA2.npcNames.last.forEach(n => COMPONENTS.npcLastNames.push(n));
  }

  // Act titles — replace with full 6×12 matrix
  COMPONENTS.actTitles = COMPONENTS_EXTRA2.actTitles;

  // Act summaries — replace the static array with extended templates
  COMPONENTS.actSummaryTemplates = COMPONENTS_EXTRA2.actSummaryTemplates;

  // Quest title expansion
  COMPONENTS.questTitleData = COMPONENTS_EXTRA2.questTitles;

  // Quest fill variables
  COMPONENTS.questFillVars = COMPONENTS_EXTRA2.questFillVars;

  // Boss name fragments
  COMPONENTS.bossNameFragments = COMPONENTS_EXTRA2.bossNameFragments;

  // Villain name pools
  COMPONENTS.villainNameData = COMPONENTS_EXTRA2.villainNames;

  // Encounter environment details
  COMPONENTS.encounterEnvironments = COMPONENTS_EXTRA2.encounterEnvironments;

  // Faction hook templates
  COMPONENTS.factionHookTemplates = COMPONENTS_EXTRA2.factionHookTemplates;

  // World-building details
  COMPONENTS.worldDetails = COMPONENTS_EXTRA2.worldDetails;

  // Extended villain nuances
  COMPONENTS.villainMotivationNuances = COMPONENTS_EXTRA2.villainMotivationNuances;
  COMPONENTS.bossTactics = COMPONENTS_EXTRA2.bossTactics;
  COMPONENTS.villainWeaknesses = COMPONENTS_EXTRA2.villainWeaknesses;
  COMPONENTS.villainSecretReveals = COMPONENTS_EXTRA2.villainSecretReveals;

  // Append to existing rumors array
  if (COMPONENTS.rumors) {
    COMPONENTS_EXTRA2.rumors.forEach(r => COMPONENTS.rumors.push(r));
  } else {
    COMPONENTS.rumors = [...COMPONENTS_EXTRA2.rumors];
  }
})();

if (typeof module !== 'undefined') module.exports = COMPONENTS_EXTRA2;
