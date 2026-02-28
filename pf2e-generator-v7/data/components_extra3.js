/**
 * data/components_extra3.js  —  Massive Data Expansion, Batch 3
 * Adds hundreds of new entries across every generation pool,
 * plus entirely new data categories the generator and tools can draw from.
 */

const COMPONENTS_EXTRA3 = {

  // ─────────────────────────────────────────────────────────────────────────
  // VILLAIN ARCHETYPES — 30 more (running total: 90+)
  // ─────────────────────────────────────────────────────────────────────────
  villainArchetypes: [
    { type:"The Accountant of Atrocities",    cr:"12-15", motivation:"Keeps meticulous records of every harm done to their people; intends to make the responsible parties balance the ledger", tactics:"Information as a weapon, exposing allies' secrets, making the heroes' own past choices into obstacles" },
    { type:"Plague Bearer (Unwilling)",        cr:"13-16", motivation:"Wants to be stopped — is trying to communicate this; the plague they carry will kill them eventually but everything nearby first", tactics:"Proximity as a weapon, self-preservation instinct fighting against cooperation, desperately intelligent improvisation" },
    { type:"The Architect of Joy",             cr:"14-17", motivation:"Engineering the conditions for a perfect society — by removing everyone who makes imperfection", tactics:"Euphemism and bureaucracy, public support from those benefiting, genuine good outcomes that make the harm invisible" },
    { type:"The First One",                    cr:"16-20", motivation:"Was the first of its kind and resents every subsequent iteration that failed to be as pure", tactics:"Knowledge of every variant's weakness because it was the template, contempt that reads as condescension until it's too late" },
    { type:"The Returned Exile",               cr:"13-17", motivation:"Was cast out unjustly and has spent decades building the capacity to prove it didn't matter", tactics:"Allies in unexpected places, knowledge of the institution that exiled them, patience calibrated in years" },
    { type:"The Loving Destroyer",             cr:"15-19", motivation:"Loves someone or something so completely that protecting them requires destroying everything that could threaten them — which is everything", tactics:"Overwhelming force in service of protection, exploiting heroes' attachment to things they love" },
    { type:"The Ideology Made Flesh",          cr:"14-18", motivation:"Embodies a philosophical position taken to its logical extreme; is correct about the premises and catastrophically wrong about the conclusions", tactics:"Argument that cannot be refuted with logic alone, genuine followers who share the belief, actions that are consistent with their stated values" },
    { type:"The Institutional Inertia",        cr:"12-16", motivation:"Is doing terrible things because the institution requires it; there is no individual to stop, only a system to dismantle", tactics:"Legal protection, distributed responsibility, the villain is everyone and no one" },
    { type:"The Children's Crusade",           cr:"11-15", motivation:"Young, idealistic, and wrong about something foundational in a way that makes everything they do harmful despite their genuine virtue", tactics:"Moral authority of youth, genuine belief, the heroes cannot simply oppose them without becoming the villain of their narrative" },
    { type:"The Mirror Image",                 cr:"15-18", motivation:"Made every choice the heroes would have made under slightly different circumstances; their existence is a question the heroes must answer", tactics:"Reads hero tactics because they think identically; exploits every mercy the heroes offer because they would offer the same" },
    { type:"The Long-Dead Author",             cr:"16-20", motivation:"Has been dead for centuries; their writings, laws, or creations continue to cause harm; someone is faithfully executing their design", tactics:"Harm distributed across a system rather than concentrated in a person; stopping the plan requires dismantling beloved institutions" },
    { type:"The Reluctant Sovereign",          cr:"14-17", motivation:"Gained power they didn't want; is terrible at ruling; is surrounded by people who benefit from their incompetence", tactics:"Inadvertent harm, easily manipulated by actual villains, the heroes must manage them without removing them" },
    { type:"The Consumed Artist",              cr:"13-16", motivation:"Creating a masterwork at any cost; the work is genuinely transcendent; the cost is other people's lives and autonomy", tactics:"The work itself as a weapon (it affects all who experience it), loyal patrons, the argument that great art justifies great sacrifice" },
    { type:"The Volunteer Martyr",             cr:"12-15", motivation:"Intends to be the villain the world needs to unite against; their plan requires being defeated; being too helpful to the heroes is the trap", tactics:"Calculatedly losing specific encounters, providing clues to their weakness, making sure the heroes are as strong as possible" },
    { type:"The Forgotten Promise",            cr:"11-14", motivation:"Someone made them a promise and broke it; they have built an entire life and power structure around extracting that promise's fulfillment", tactics:"Moral clarity on a specific grievance, allies who share the grievance, indifference to everything outside the promise" },
    { type:"The Optimistic Nihilist",          cr:"15-18", motivation:"Believes nothing matters and finds this liberating; acts on every desire with perfect serenity; is wrong in a way the heroes must demonstrate", tactics:"Freedom from consequence-based reasoning, complete unpredictability, genuine enjoyment of everything including defeat" },
    { type:"The Institutional Reformer (Wrong Method)", cr:"13-16", motivation:"Correctly diagnoses a harmful institution and wants to fix it; the fix requires the same harms as the institution used", tactics:"Popular support for the diagnosis, political cover from the reformist agenda, the heroes must address the underlying problem to undercut them" },
    { type:"The Dimensional Refugee",          cr:"14-17", motivation:"Their home plane was destroyed; they're trying to rebuild it here; the rebuilding process destroys the existing world", tactics:"Planar powers, nothing left to lose, the tragedy of their situation makes opponents hesitate" },
    { type:"The Self-Fulfilling Prophecy",     cr:"13-16", motivation:"Was told they would become a great evil; has been acting as though this is inevitable; it only becomes true if everyone keeps treating it as such", tactics:"The prophecy provides tactical foreknowledge and emotional armor; the heroes must convince them the future isn't written" },
    { type:"The Delegation Chain",             cr:"12-16", motivation:"Ordered harm that was delegated down a chain of command until someone with no authority executed it; accountability exists nowhere", tactics:"Diffused responsibility, institutional protection, no single point the heroes can confront" },
    { type:"The Grief-Shaped Hole",            cr:"15-19", motivation:"Something essential was lost; they've been trying to fill the absence ever since; everything they do is an attempt to not feel the absence", tactics:"Vulnerability disguised as strength, strikes at what the heroes love because they understand that loss" },
    { type:"The Necessary Infrastructure",     cr:"13-17", motivation:"Provides something everyone depends on; has been charging an increasingly horrible price for it; everyone pays because no one can afford not to", tactics:"Indispensability as leverage, the heroes' allies as customers who can't support confrontation" },
    { type:"The Cautionary Tale",              cr:"14-18", motivation:"Was once a hero; the specific moment their approach became harmful is documentable; they are what happens when heroism isn't re-examined", tactics:"All the abilities of a hero used with none of the restraint, institutional support from those who still see them as heroic" },
    { type:"The Beloved Monster",              cr:"16-20", motivation:"Is genuinely beloved by a community that they protect effectively; the harm they do is to everyone outside that community", tactics:"Community as shield and weapon, genuine good works that make opposition politically costly, the heroes' allies may be among the protected" },
    { type:"The Underfunded Solution",         cr:"11-14", motivation:"Has the right answer and insufficient resources; is taking what they need from people who have it; the math is horrifying but correct", tactics:"Desperation that makes them unpredictable, genuine competence at the thing they're trying to do, the uncomfortable truth that they might succeed" },
    { type:"The Observer",                     cr:"15-18", motivation:"Has been watching mortal civilization for millennia; has finally formed an opinion; the opinion is negative; they've decided to act", tactics:"Complete information advantage from centuries of observation, patience that makes any tactical response look like a toy" },
    { type:"The System Administrator",        cr:"13-16", motivation:"Controls the underlying infrastructure of something everyone depends on; has decided the users are the problem", tactics:"Complete leverage over the system, can degrade or deny access to any connected party, operates through proxies and technical mechanisms" },
    { type:"The Historical Revisionist",       cr:"12-15", motivation:"The accepted version of history benefits specific people and harms others; they're correcting the record; the correction method is violence", tactics:"The truth of their historical claims as political cover, the discomfort of beneficiaries being asked to acknowledge harm" },
    { type:"The Dying Star",                   cr:"17-21", motivation:"Is ending regardless; has chosen what their ending means; would prefer to take the world with them but will accept a worthy monument", tactics:"Nothing to lose, enormous accumulated power, can be redirected toward a different legacy but not stopped from ending" },
    { type:"The Kindness Trap",                cr:"13-17", motivation:"Provides genuine help at a price that compounds over time; everyone who accepted help is now beholden; calling in the debt now", tactics:"The moral weight of help given, allies compromised by past acceptance, the heroes themselves may owe something" }
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // LOCATIONS — 20 more per category (40 new urban, 40 new wilderness, etc.)
  // ─────────────────────────────────────────────────────────────────────────
  locations: {
    urban: [
      // Set A: Strange city concepts
      "A city where all construction must be approved by a committee of architectural ghosts from the previous three eras",
      "A city-state that rents its population to other nations as laborers, then buys them back — the economics have created a unique culture",
      "A settlement built inside a colossal hollow statue of a forgotten deity; the statue is slowly waking",
      "A city where the street layout is also a functional ritual circle; the city IS the ritual",
      "A neutral meeting ground maintained by all neighboring nations simultaneously; has no permanent residents, only diplomats",
      "A city that was built inside a monster's territory as a bargaining chip; the monster's mood affects the weather",
      "A settlement founded by deserters from three different armies who decided to build something instead; they have no legal status",
      "A city where criminal and legitimate governance merged so long ago that no one can identify the original legal structure",
      "A settlement on the back of a river barge flotilla that has been moving for so long it has forgotten where it started",
      "A city that operates two identical governments simultaneously — one for residents, one for visitors — with different laws for each",
      // Set B: Economically distinctive
      "A city built around a single resource that is now running out; the city has twenty years left and knows it",
      "A settlement that has commodified access to dreams; the infrastructure runs on harvested sleep",
      "A city where every resident is technically employed by the government and the government is technically a corporation",
      "A free port city that has been free for so long that it has developed multiple competing definitions of freedom",
      "A settlement that exists to process the dead — physically, administratively, and spiritually — from the surrounding region",
      "A city built at the intersection of four major trade routes; exists entirely to extract tax from movement",
      "A settlement that produces one luxury good that all surrounding nations consider essential; knows exactly what leverage this gives them",
      "A city where the concept of private property was abolished two generations ago; the experiment has had mixed results",
      "A settlement founded as a research station that grew; the original research purpose still technically governs it",
      "A city where time moves demonstrably faster inside the walls; residents age quicker but accomplish more"
    ],
    wilderness: [
      // Set A: Strange natural phenomena
      "A valley where sound travels in the wrong direction — you hear things before they happen",
      "A coastal region where the tide comes in twice as far as it goes out; the exposed land between tides is a civilization",
      "A mountain range that produces a specific musical tone in strong winds; the music has hypnotic properties",
      "A forest where all trees are the same age — exactly 400 years — as though they all started growing simultaneously",
      "A plain where gravity is slightly lower than normal; the local fauna has evolved for a different physics",
      "A river system that connects to three separate regional rivers but flows uphill for the final two miles to reach them",
      "A desert where the sand forms geometric crystalline structures at night and dissolves at sunrise",
      "A stretch of coastline where the sea is warm enough to bathe in year-round regardless of season; the warmth comes from below",
      "A tundra region where the permafrost emits a faint light; the light is brightest where people have died",
      "A rainforest where it has not rained in a century; the forest sustains itself through condensation and groundwater",
      // Set B: Inhabited strange wilderness
      "A wilderness region with no permanent settlements; has had a continuous nomadic population for 3000 years who considers permanence immoral",
      "A wetland region that is politically ungovernable; fourteen factions have claimed it; none have been able to hold it",
      "A forest managed by a non-human civilization as their agricultural land; trespassers are not harmed, but they are employed",
      "A mountain range where the passes are controlled by a single extended family who have been collecting tolls for 600 years",
      "A wilderness region that has been magically protected by a druid order for 200 years; the druid order dissolved 50 years ago and something is changing",
      "An island chain connected at low tide; each island has a distinct culture that shifts dramatically when the tide comes in and connections are severed",
      "A wilderness region that is actually the interior of a pocket plane; the 'horizon' is a visual artifact of the boundary",
      "A jungle that has been fought over for a specific resource for 400 years; the resource replenishes based on the stability of the surrounding population",
      "A grassland that was the site of a battle between two divine entities; the grass is made of something that isn't grass",
      "A wilderness region where every body of water is a gate to a different body of water elsewhere in the world; navigation is chaotic"
    ],
    dungeon: [
      // Set A: Living/organic dungeons
      "The interior of a creature too large to be killed, which the heroes must navigate while the creature goes about its life",
      "A dungeon that grows — new rooms appear based on what the occupants fear most",
      "A prison designed by its inmates, who had very strong opinions about what made an effective prison",
      "The research facilities of a wizard who specialized in making the impossible merely difficult; everything is theoretically possible here",
      "A dungeon that is also a school; the challenges are educational; passing means learning something real",
      "The body of a god, accessed through a wound; each organ is a different ecosystem",
      "A dungeon built to house an object rather than confine a being; the object is still there; its effects have transformed the space",
      "An ancient sewer system so old that it has developed multiple distinct civilizations in different sections",
      "A dungeon designed as a test of moral worth rather than combat ability; violence fails every test",
      "The memories of a specific person, externalized into a walkable space",
      // Set B: Structurally strange dungeons
      "A dungeon that is correctly described by its map, but the map's compass is rotated 90 degrees from magnetic north",
      "A dungeon where the rooms are in the right places but the doors connect rooms non-adjacently",
      "An archive designed so that the location of information encodes additional information about it",
      "A dungeon designed to be explored backwards; the entrance is the final challenge and the boss is in the first room",
      "A dungeon that exists simultaneously in two planes; some sections are material, some are planar, and the border is invisible",
      "A magical workshop where every failed experiment is still running; the failures are now the inhabitants",
      "A dungeon that was designed by three different architects with three different philosophies who each thought the others were wrong",
      "A naturally-formed cave system that happens to perfectly replicate a specific well-known dungeon that was built 200 years later",
      "A dungeon designed to be fully explored in exactly one day; the challenges are calibrated to that timeline",
      "The physical manifestation of a dying wizard's unfinished business — each room is something they never resolved"
    ],
    planar: [
      "A stable piece of the Positive Energy Plane that has developed a fragile ecosystem capable of surviving the ambient energy",
      "The memory of a plane that was destroyed; exists only as a psychic echo; the things that live there are memories too",
      "A plane that operates on inverse logic — cause follows effect, questions contain their answers, time runs sideways",
      "The space between two planes that are in philosophical opposition; the border itself is a distinct location with unique properties",
      "A miniature plane the size of a large city, created as a private retreat by someone who then lost the key",
      "The interior of a planar entity — a plane-as-creature — that has swallowed something the heroes need",
      "A demiplane that was created by accident when a god sneezed; it is embarrassed about this and tries to be impressive",
      "The plane where concepts go when mortals stop believing in them; full of ideas that used to matter",
      "A stable bridge between the Material Plane and the Plane of Shadow that has developed its own light sources and ecosystem",
      "The afterlife of a religion that turned out to be incorrect in most particulars; the afterlife is real but nothing like advertised",
      "A planar space created from the combined imagination of a hundred children; it follows the logic of childhood games",
      "The physical manifestation of a god's doubt — a plane that exists because even the divine are uncertain sometimes",
      "A plane of elemental Fire that has cooled to room temperature after a prolonged war of attrition; ash and memory",
      "The space created by the absence of a deity who was killed; the space maintains the deity's portfolio without the deity",
      "A planar crossroads that charges a toll in memories rather than currency; the accumulated memories have formed a civilization",
      "A stable pocket of Wild Magic that has developed internal rules over millennia; the rules make no sense but are consistent",
      "The plane where divine mistakes are filed; organized by deity, era, and type; completely accessible to anyone who can get there",
      "A demiplane created from the beliefs of a specific community; accurate to their beliefs in every detail including the incorrect ones",
      "The physical space between sleep and waking; has geography, inhabitants, and laws that apply only to those in transition",
      "A plane of Lawful Magic where every spell requires paperwork filed in triplicate before it can be cast; the bureaucracy is sentient"
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SIDE QUEST TEMPLATES — 6 entirely new types, 5 templates each
  // ─────────────────────────────────────────────────────────────────────────
  sideQuestTemplates: [
    {
      type: "Sabotage",
      templates: [
        "The villain's supply chain runs through a specific facility; disrupting it without leaving evidence requires precision",
        "A propaganda apparatus is manufacturing consent for the villain's agenda; the heroes must undercut it without becoming censors",
        "The villain's communication network uses a relay station the heroes can corrupt without destroying",
        "A construction project the villain is funding will give them a strategic advantage; it must be delayed or redirected",
        "A financial instrument the villain controls can be made useless through a specific sequence of market actions the heroes must execute"
      ]
    },
    {
      type: "Recruitment",
      templates: [
        "A powerful independent faction hasn't chosen sides; the heroes must make the case before the villain's agents do",
        "A former ally who broke with the heroes can be brought back if the specific grievance that drove them away is addressed",
        "A neutral expert whose knowledge is critical to the final confrontation needs a reason to get involved",
        "A community that has suffered from both sides needs to see something specific before they'll open their territory",
        "A rival adventuring party has been working toward the same goal; merging efforts requires negotiating whose approach takes precedence"
      ]
    },
    {
      type: "Containment",
      templates: [
        "A consequence of an earlier hero action is spreading beyond acceptable bounds and must be managed without making it worse",
        "A secondary threat the heroes uncovered is growing while they focus on the primary villain; it needs to be contained not destroyed",
        "Information the heroes possess is being actively sought by multiple parties; protecting it requires understanding who knows what",
        "A faction ally's mistake is going to become public; the heroes must manage the revelation to minimize damage",
        "A magical effect the heroes triggered accidentally is producing escalating consequences; the fix is more complex than the cause"
      ]
    },
    {
      type: "Deception",
      templates: [
        "The heroes must convince the villain they have failed when they have succeeded, to buy time for the next phase",
        "A false rumor planted in the right place will draw villain resources away from a critical location",
        "The heroes must impersonate someone with authority to extract information that cannot be taken by force",
        "A villain agent must be allowed to believe they've turned a hero to buy access to villain planning",
        "The heroes must make it appear that a faction ally has betrayed them to protect that ally's cover inside the villain's organization"
      ]
    },
    {
      type: "Recovery",
      templates: [
        "Something essential was lost in a previous act's failure; recovering it requires going back to a location that has changed",
        "A hero's ability, possession, or relationship was damaged by villain action; restoring it is both personal and strategic",
        "A faction ally was significantly weakened by villain action; helping them recover before the climax is time-sensitive",
        "Evidence that would change the political situation was destroyed; witnesses who remember it must be found and secured",
        "A strategic resource the heroes destroyed to prevent villain use can be partially recovered if they act immediately"
      ]
    },
    {
      type: "Revelation",
      templates: [
        "Someone the heroes trust is not who they say they are; confirming this requires evidence they can get without alerting the person",
        "The villain's plan has a second layer the heroes haven't seen; finding evidence of it requires getting inside the villain's confidence",
        "A historical event is directly relevant to the current campaign; records have been suppressed; surviving witnesses must be found",
        "The thing the heroes have been trying to protect is not what they were told it was; determining the truth changes everything",
        "A faction that appears neutral is playing both sides; exposing this requires evidence without triggering their defensive protocols"
      ]
    }
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // PLOT TWISTS — 24 more (running total: 60+)
  // ─────────────────────────────────────────────────────────────────────────
  plotTwists: [
    { twist:"The villain's organization has a succession plan; defeating the villain activates it, producing something worse", timing:"Pre-final act" },
    { twist:"The heroes have been leaving a trail the villain has used to locate every faction ally; the trail continues", timing:"Act 2-3" },
    { twist:"A divine entity has been subtly steering both the heroes and the villain toward a specific outcome; neither side was acting freely", timing:"Act 3 revelation" },
    { twist:"The campaign's central conflict is a proxy war; the actual combatants are watching from a distance and will enter when the winner is clear", timing:"Act 2" },
    { twist:"Something the heroes did in the campaign's first hour permanently changed a faction's trajectory; that faction's current position is the heroes' responsibility", timing:"Mid Act 2" },
    { twist:"The information broker the heroes have been using has been editing what they pass along; the heroes know less than they think", timing:"Act 2" },
    { twist:"The villain has a legitimate argument that they have not made — they are choosing not to, for reasons that become clear", timing:"Pre-final act" },
    { twist:"An NPC the heroes thought was dead has been working against them from a position of assumed death", timing:"Act 3" },
    { twist:"The magical seal, ward, or protection the heroes have been maintaining was unnecessary; it was imprisoning something benign", timing:"Act 2-3" },
    { twist:"The heroes' faction patron has been conducting a parallel campaign with different heroes using the same resources", timing:"Act 2" },
    { twist:"The villain's weakness was fabricated; the heroes have been preparing to exploit something that doesn't exist", timing:"Final act" },
    { twist:"A hero's personal backstory intersects with the villain's in a way that makes the final confrontation a family matter", timing:"Act 3" },
    { twist:"The world the heroes are protecting has a fundamental flaw that the villain correctly identified; they're fighting to preserve something imperfect", timing:"Pre-final act" },
    { twist:"The 'villain' is a narrative created by the actual villain to give the heroes something to fight while the real plan proceeds", timing:"Act 3 opening" },
    { twist:"Every faction ally has independently decided to sacrifice the heroes for a good reason; none of them knows the others have the same plan", timing:"Act 3" },
    { twist:"The heroes are not the first group to face this threat; they're the fifth; the previous four left resources and information the heroes haven't found", timing:"Act 2" },
    { twist:"The thing the heroes destroyed in Act 1 was the only thing containing a secondary threat that is now free", timing:"Act 2" },
    { twist:"A hero's most trusted personal relationship has been a villain plant since before the campaign began", timing:"Act 3 climax" },
    { twist:"The campaign's resolution requires knowledge the heroes obtained but discarded as irrelevant in Act 1", timing:"Final act" },
    { twist:"The villain's plan has already succeeded in a different region; what the heroes are experiencing is the second iteration", timing:"Act 3" },
    { twist:"A hero's greatest victory from a previous campaign created the conditions for this villain's rise", timing:"Act 2 revelation" },
    { twist:"The entity the heroes believe is their patron deity is not; something else has been receiving their prayers and acting on them", timing:"Act 3" },
    { twist:"The heroes have been protecting something that was always going to betray them; it has been waiting for the right moment", timing:"Act 3 climax" },
    { twist:"The villain's secret is not that they're evil — it's that they're right about one specific thing and know the heroes can't accept it", timing:"Final act" }
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // ADVENTURE HOOKS — 30 more (running total: 90+)
  // ─────────────────────────────────────────────────────────────────────────
  adventureHooks: [
    "The heroes each received a package containing a personal memento they lost years ago, a map, and no other explanation",
    "A newspaper/broadsheet carries a story about themselves doing something they haven't done yet",
    "A child approaches them separately over the course of a week, asks the same question, and runs before they can respond",
    "They all independently received job offers from the same employer for positions that don't require their specific skill sets",
    "A merchant guild has placed a bounty on someone matching each hero's description — for completely different crimes",
    "A building they need to enter doesn't exist when they approach from certain directions but exists from others",
    "Three separate oracles have gone out of business this month; the fourth gives them an appointment before they ask",
    "An item each hero owns has spontaneously gained the same magical property: it points toward the same location",
    "A dignitary they've never met includes them by name in a public speech as people who 'will understand what must be done'",
    "Every animal in their current city has been watching them specifically; they can tell because when they separate, each animal follows a different hero",
    "They find a complete dossier on themselves in a location that has been abandoned for years; it includes things not yet in their own memories",
    "A city they've never visited has named a street after each of them; the streets, on a map, form a shape",
    "Someone has been paying their debts, taxes, and fines — accurately and on time — from an untraceable account",
    "An auction house is selling items they owned that they did not sell; the items have been 'acquired from the estate of' each hero",
    "A dying stranger uses their last breath to say one word to each hero separately; the words, combined, form a sentence",
    "Their home base / headquarters has been renovated and improved while they were away; no one saw who did it",
    "A faction they've never worked with sends word that they're 'ready when the heroes are' — for an operation the heroes haven't planned",
    "Each hero receives a challenge to a formal duel from someone with their own face and name but slightly different history",
    "A reliable divination source produces the same result every time it's consulted about the heroes: 'Not yet'",
    "Three separate cities are holding festivals in their honor simultaneously for events that haven't happened",
    "An ancient institution contacts them to collect on a membership fee owed by their family for seven generations",
    "Something they buried, destroyed, or released is back — but improved, as though it has been developing in their absence",
    "An island that appears on a map they're using is not on any other map; it is, however, sending them letters",
    "A guild of professionals they've never contracted declares them in violation of an exclusive services agreement",
    "Their reflection in a specific type of mirror shows them older, wearing different clothes, looking satisfied — and showing them a gesture",
    "A courier delivers a package from themselves — their own handwriting, their own seal, sent from a location they've never been",
    "Every door in a city they enter has their names carved into the lintel in a language that postdates the building's construction",
    "A theater company is performing a play about their lives — accurately — that was written before they were born",
    "They each receive a different piece of a larger document that, assembled, describes an event one week in the future",
    "A sage presents them with a research paper arguing that they are a recurring historical pattern — this is their seventh iteration"
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // NPC ARCHETYPES — 20 more (running total: 50+)
  // ─────────────────────────────────────────────────────────────────────────
  npcArchetypes: [
    { role:"The Living Consequence", desc:"The direct result of a previous hero decision, walking around and having opinions about it", personality:"Neither grateful nor resentful — just there, a reminder, complicated" },
    { role:"The Perfectly Reasonable Obstacle", desc:"Has completely valid objections to everything the heroes are trying to do; is not wrong about any of them", personality:"Patient, thorough, genuinely trying to help by preventing a mistake" },
    { role:"The Voluntary Hostage", desc:"Has placed themselves in danger to force a negotiation; knows exactly what they're doing; needs the heroes to play their part", personality:"Calm, calculating, trusts the heroes more than they've earned" },
    { role:"The Walking Warning", desc:"Has survived exactly the thing the heroes are about to attempt; will not try to stop them; will watch", personality:"Eerily peaceful, past panic, ready to help if asked but not if not" },
    { role:"The Principled Traitor", desc:"Betrays a faction ally on principle, not profit; the principle is sound; the timing is catastrophic", personality:"Certain, articulate, genuinely regrets the collateral damage but not the action" },
    { role:"The Outsider Who Understands", desc:"Has no stake in the conflict; sees it with perfect clarity; cannot make anyone listen because they have no stake", personality:"Frustrated patience, accurate, not cynical about being ignored because they expected it" },
    { role:"The Guardian of the Wrong Thing", desc:"Protects something that doesn't need protecting at the cost of something that does; not stupid, just misinformed", personality:"Devoted, capable, will redirect immediately and completely when corrected" },
    { role:"The Necessary Liar", desc:"Keeps a secret the heroes need; the secret would cause genuine harm if revealed carelessly; will share it if the heroes demonstrate they understand the stakes", personality:"Careful, honest about everything except the one thing, watches the heroes for readiness" },
    { role:"The Person At Their Limit", desc:"Has been holding a situation together through sheer will; is at the absolute edge of their capacity; needs help now or fails", personality:"Controlled desperation, pride fighting against need, enormous relief when help comes" },
    { role:"The Witness", desc:"Saw what happened and will tell the heroes exactly what, with complete accuracy, at personal risk", personality:"Frightened but resolute, needs protection they'll ask for directly, doesn't exaggerate" },
    { role:"The Former Self", desc:"Was the person the hero used to be or is in danger of becoming; reflects something specific back at one party member", personality:"Variable — could be cautionary or aspirational; the story determines which" },
    { role:"The Caretaker", desc:"Has been maintaining something — a location, a person, a secret — for longer than seems possible; needs someone to take over", personality:"Tired, attached, relieved to find someone qualified, sad to let go" },
    { role:"The Underestimated Threat", desc:"Everyone, including the heroes, is not taking them seriously; this is the correct tactical choice on their part", personality:"Content to be dismissed, quietly prepared, genuinely friendly until the moment they aren't" },
    { role:"The Second Opinion", desc:"Disagrees with every plan the heroes have made; has been right about seventy percent of them; presents this information unprompted", personality:"Blunt, accurate, not malicious, would genuinely prefer to be wrong for once" },
    { role:"The Person Who Just Wants to Help", desc:"Has no agenda, no secret, no catch; wants to contribute and is more capable than they look", personality:"Earnest, reliable, occasionally surprising, grateful to be useful" },
    { role:"The Keeper of Old Grudges", desc:"Has a list; the heroes are not on it; an enemy of the heroes is at the top of it; this creates a complicated alliance", personality:"Specific, patient, professional about the grudge, oddly pleasant to spend time with" },
    { role:"The Accidental Expert", desc:"Knows something crucial about the campaign's central problem through a completely unrelated path", personality:"Surprised by their own relevance, eager to be useful, not sure they understand why they matter" },
    { role:"The Person Being Managed", desc:"Is dangerous if unsupported; has been managed by a faction ally; that ally is gone; someone must take over", personality:"Aware of their own volatility, trying to hold it together, deeply grateful for competent handling" },
    { role:"The Idealist Late Stage", desc:"Has been fighting for something good for thirty years; has outlasted all their contemporaries; is tired; needs to know it mattered", personality:"Quieter than they used to be, still sharp, needs acknowledgment not validation" },
    { role:"The Question Mark", desc:"Every indication points to them being important in ways no analysis can pin down; they may know; they aren't saying", personality:"Genuinely opaque, not performing mystery, watching everything with interest" }
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // FACTION ARCHETYPES — 20 new named factions
  // ─────────────────────────────────────────────────────────────────────────
  factions: [
    { name:"The Pale Accord",             alignment:"Lawful Neutral",  ideology:"Undead and living must coexist under formal legal frameworks", resource:"Legal precedent, mixed membership, courts of mixed jurisdiction",  hook:"Will represent any case, hero or villain, as long as proper procedure is followed" },
    { name:"The Burning Question",        alignment:"Chaotic Good",    ideology:"Every authority must justify itself continuously or be replaced", resource:"Revolutionary networks, the loyalty of the young and disenfranchised", hook:"Will ally with anyone attacking an unjust authority; will oppose the heroes if they become that authority" },
    { name:"Covenant of the Exact Word",  alignment:"Lawful Good",    ideology:"Precision in language prevents most injustice; words matter absolutely", resource:"Lawyers, translators, contract experts, historical record specialists", hook:"Can find the specific legal or contractual vulnerability in any arrangement" },
    { name:"The Useful Forgotten",        alignment:"Neutral Good",    ideology:"The marginalized see what the powerful cannot; this is a strategic advantage", resource:"Intelligence from everywhere powerful people don't look", hook:"Know something about everyone; ask in a way that respects their dignity" },
    { name:"Stormwrights' Society",       alignment:"Chaotic Neutral", ideology:"Weather is power; those who can shape it should", resource:"Weather magic, coastal influence, leverage over agricultural regions", hook:"Will help anyone who will help them expand their weather-shaping authority" },
    { name:"The Reconstructed",           alignment:"Neutral Good",    ideology:"People change; past actions should not define future possibilities", resource:"Rehabilitation infrastructure, second chances for villain agents who turn", hook:"Can turn enemy agents into allies if given access and protection" },
    { name:"The Ink Brotherhood",         alignment:"True Neutral",    ideology:"Information is the only true currency; they deal in all of it equally", resource:"Complete information network, no permanent loyalties, sell to all sides", hook:"Will share anything for the right price; the price is always different" },
    { name:"Last Light Compact",          alignment:"Lawful Good",    ideology:"Someone has to hold the line even when holding it is losing", resource:"Elite soldiers, defensive fortifications, the will to die for their position", hook:"Will hold any line the heroes establish; will not advance; will need to be relieved" },
    { name:"The Unnamed Council",         alignment:"Lawful Evil",    ideology:"Effective governance requires that those who govern never be identified", resource:"Political control of multiple governments through anonymous intermediaries", hook:"Has been shaping events for decades; will reveal themselves if they need the heroes specifically" },
    { name:"The Necessary Cruelty",       alignment:"Neutral Evil",   ideology:"Compassion without power is performance; power without cruelty is fantasy", resource:"Enforcers, blackmail infrastructure, the willingness to do what others won't", hook:"Will do anything the heroes need done that the heroes won't do themselves; the price is legitimacy" },
    { name:"Daughters of the Watershed",  alignment:"Chaotic Good",   ideology:"Water belongs to everyone; those who privatize it steal from the future", resource:"Control of multiple water sources, engineering knowledge, rural community support", hook:"Will ally in exchange for water rights commitments; this sounds minor until it isn't" },
    { name:"The Pattern Readers",         alignment:"True Neutral",   ideology:"History repeats; those who can read the pattern can predict and profit", resource:"Historical analysis, predictive modeling, investments in multiple outcomes", hook:"Know what's going to happen and have prepared for it; their preparation benefits the heroes if aligned" },
    { name:"Fellowship of the Impure",    alignment:"Chaotic Neutral", ideology:"Those who don't fit any category are the only ones not beholden to category logic", resource:"Liminal beings, boundary-walkers, people who exist in multiple states", hook:"Can go places and be things no pure-category entity can; useful for the impossible task" },
    { name:"The Archive of Tomorrow",     alignment:"Lawful Neutral", ideology:"What comes next must be documented now, before it happens, to hold it accountable", resource:"Precognitive records, legal documentation of future events, prophecy as legal precedent", hook:"Have already documented what the heroes will do; willing to share their file if it helps" },
    { name:"The Honored Opposition",      alignment:"Lawful Good",    ideology:"Every position deserves the strongest possible advocate; they argue for whatever side needs arguing", resource:"Rhetorical excellence, the ability to find merit in any position, respected by all parties", hook:"Will argue against the heroes' position to strengthen it; will argue for the villain if no one else will" },
    { name:"Earthmover Compact",          alignment:"Neutral Good",   ideology:"The physical world shapes society; reshaping the physical world reshapes society", resource:"Engineering capacity, geomantic magic, the ability to literally change the terrain of a conflict", hook:"Will reshape any battlefield, city, or landscape to advantage if given reason to care about the outcome" },
    { name:"The Returned",               alignment:"Chaotic Good",   ideology:"Those who came back from death have a perspective the living lack; this should be governed by those who have lived both states", resource:"Undead and returned-to-life individuals with unique capabilities, death-knowledge", hook:"Know things about the afterlife, the villain's forces, and death magic that no living source can provide" },
    { name:"House of Reasonable Doubt",   alignment:"True Neutral",   ideology:"Certainty is the enemy of justice; every conclusion must be challenged", resource:"Investigators, forensic magic, the institutional legitimacy to question any verdict", hook:"Can disprove anything the heroes are certain about; also the only people who can prove what the villain did" },
    { name:"The Long Memory",             alignment:"Neutral Good",   ideology:"Forgetting allows repetition; remember everything, forgive selectively, repeat nothing", resource:"Oral history traditions, living witnesses to events two centuries old, emotional intelligence", hook:"Remember the last time this happened; know what worked and what didn't; will share for an honest acknowledgment" },
    { name:"Children of the Compact",     alignment:"Lawful Good",   ideology:"Treaties are sacred; their children have inherited their obligations and their protections", resource:"Legal continuity of ancient agreements, claims that predate current governments", hook:"Have a treaty right that applies to this situation; invoking it changes everything if someone can find the original document" }
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // BOSS ENCOUNTER TEMPLATES — 9 more (running total: 24)
  // ─────────────────────────────────────────────────────────────────────────
  bossEncounters: [
    { name:"The Long Fall",           setup:"Combat on a structure that is actively collapsing downward; the boss knows which sections are stable and which aren't", phase2:"Boss destroys the last stable section, forcing everyone onto falling debris; movement becomes the primary challenge", environment:"Falling sections (Reflex DC every other round), variable elevation, sections that briefly stabilize before going" },
    { name:"The Divided Self",        setup:"Boss has split themselves into multiple aspects; each aspect fights independently and has a different power", phase2:"Heroes defeat enough aspects that the boss must recombine; the recombined form is more powerful but has the weaknesses of all individual aspects", environment:"Multiple simultaneous engagement points, aspects that can merge/split strategically, the recombination itself as an AoE event" },
    { name:"The Fair Witness",        setup:"Combat is being recorded and will be publicly shown; the boss knows and is performing for the audience", phase2:"The boss drops the performance when they realize they're losing; becomes genuinely dangerous rather than theatrically dangerous", environment:"Recording constructs (can be destroyed or turned), an audience the heroes must not endanger, the boss's reputation as a weapon" },
    { name:"The Frozen Lake",         setup:"Combat on ice; the ice breaks under sustained weight or area effects; the water is dangerous", phase2:"Boss shatters the central ice, creating islands; movement requires Athletics; falling in is the main hazard", environment:"Ice terrain (Acrobatics to move quickly), fracture points, depth below (submersion rules), cold water damage" },
    { name:"The Final Testament",     setup:"Boss is dying regardless of the fight; this encounter is what they chose to do with their last hour", phase2:"As the boss weakens, their power becomes less controlled and more dangerous to everyone, including themselves", environment:"Uncontrolled power discharge (random AoE), the emotional weight of fighting someone who is already dying, their final words" },
    { name:"The Audience Chamber",    setup:"Combat in front of an audience that changes allegiance based on how the combat looks; politics and violence simultaneously", phase2:"Boss appeals to the audience; heroes must manage public perception while fighting", environment:"Seated observers (can be moved, targeted, or won over), performance aspect of combat, boss gaining or losing power based on crowd reaction" },
    { name:"The Living City",         setup:"The environment itself is the boss's body; they feel everything that happens to the city and can move city elements as attacks", phase2:"Heroes damage the city enough to limit the boss's power; the city begins actively trying to expel them", environment:"Street-as-weapon, buildings as reach attacks, the cost of destroying city infrastructure, innocent bystanders in 'the body'" },
    { name:"The Echo Fight",          setup:"Everything that happens in combat is repeated exactly 6 seconds later; attacks, movement, spells — all echoed", phase2:"The echo accelerates; 3 seconds; 1 second; simultaneously; everything happening twice at once", environment:"Temporal echo zone, the tactical puzzle of using echoes offensively, environmental hazards that echo dangerously" },
    { name:"The Negotiation Position",setup:"Boss won't fight; has a position that must be addressed through argument, evidence, or creative problem-solving", phase2:"If heroes resort to combat, boss reveals a prepared contingency that is significantly worse than the original situation", environment:"The negotiating table as a battlefield of its own, third-party adjudicators, the weight of not having the option to simply win" }
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // DUNGEON ROOMS — 60 named room types with descriptions for map generators
  // ─────────────────────────────────────────────────────────────────────────
  dungeonRooms: [
    { type:"Antechamber",         desc:"Entry room; usually contains a warning, a guardian, or a test of intent",        features:["alert mechanism","single guarded door","deliberate pause before the real dungeon begins"] },
    { type:"Trophy Hall",         desc:"The occupant's accomplishments displayed; each trophy is a story and possibly a clue", features:["trophies with tales","locked cases","the absence where something was removed"] },
    { type:"Scriptorium",         desc:"Writing room; records, copies, correspondence, and at least one thing that shouldn't be here", features:["organized chaos","irreplaceable documents","something that was being written when interrupted"] },
    { type:"Barracks",            desc:"Where guards sleep, eat, and complain; gives heroes a window into the enemy's daily life", features:["personal effects","duty rosters","off-duty guard social dynamics"] },
    { type:"Kitchen",             desc:"Functional or abandoned; tells you about the dungeon's diet, supply chain, and culture", features:["perishables tell how long ago","equipment quality tells resources","the menu tells intentions"] },
    { type:"Cistern",             desc:"Water storage; often connects to the outside; always has something living in it by now", features:["connections to sewers/outside","evolved aquatic ecosystem","structural importance to the dungeon"] },
    { type:"Shrine",              desc:"To something; not necessarily a god; the devotion is more revealing than the deity",  features:["offerings tell you what they fear/want","active or dormant","the deity responds to devotion"] },
    { type:"Armory",              desc:"Contains weapons and armor; some still functional; the selection reveals the dungeon's combat doctrine", features:["specialized weapons hint at specific threats","maintenance state indicates usage","locked rack with something special"] },
    { type:"Prison",              desc:"Cells; possibly occupied; the architecture reveals what the designers feared being imprisoned", features:["occupied or vacated cells","the one who knows something","the one who shouldn't be released"] },
    { type:"Laboratory",          desc:"Something was being studied or created here; the experiment is either complete, failed, or ongoing", features:["the experiment itself","notes that explain context","equipment that still works"] },
    { type:"Audience Chamber",    desc:"Where the important person received visitors; the staging tells you about their self-image", features:["throne/chair positioning","supplicant positioning","the private door the visitors weren't supposed to notice"] },
    { type:"Archive",             desc:"Records, maps, and histories; the organization reveals priorities; the gaps reveal secrets", features:["obvious records","the deliberately difficult to find","the thing that was removed and left a trace"] },
    { type:"Ritual Chamber",      desc:"For magic, religion, or both; may still be active; the circle is always the most important part", features:["active/inactive circle","residue of the last working","the thing that was summoned and wasn't sent back"] },
    { type:"Secret Passage",      desc:"Hidden connection between non-adjacent rooms; reveals who didn't trust whom", features:["triggers at both ends","used recently (dust displaced)","who uses it and why"] },
    { type:"Crypt",               desc:"The honored dead; or what was honored once; or what wants to be honored and isn't dead", features:["family/institutional organization","the occupied crypt that shouldn't be","the marker for someone not yet dead"] },
    { type:"Forge",               desc:"Where things were made; the current project is always interesting; so is what was made last", features:["last project still on the anvil","raw materials hint at resources","the thing made here that the dungeon runs on"] },
    { type:"Garden",              desc:"Internal green space; something grows here that needs to; may be deadly, may be beautiful, may be both", features:["cultivated or feral","what grows here (magical? mundane? illegal?)","the thing living in the garden"] },
    { type:"Observatory",         desc:"For watching something; not always the sky; the viewing direction matters",        features:["what they watch","notes on observations","the current target of observation"] },
    { type:"Library",             desc:"Books, scrolls, or their equivalent; the most dangerous information is never well-organized", features:["accessible section","restricted section","the section everyone pretends doesn't exist"] },
    { type:"Throne Room",         desc:"Power display; always bigger than necessary; the back doors are the real entrance for the person who lives here", features:["staging for intimidation","the actual power seat vs the ceremonial one","the thing everyone has to walk past"] },
    { type:"Hall of Mirrors",     desc:"Reflective surfaces everywhere; reveals, distorts, or multiplies; something in here always hides behind a reflection", features:["navigation difficulty","the creature that uses it","the one mirror that shows something true"] },
    { type:"Summoning Chamber",   desc:"Specifically designed to bring something through; what was brought last is the important question", features:["permanent or temporary circle","the thing that came through and stayed","residue of multiple summonings"] },
    { type:"Pit Room",            desc:"A room with a large pit in it; usually not empty; sometimes the pit is the point", features:["what's at the bottom","whether it can get out","the mechanism that opens it"] },
    { type:"Flooding Chamber",    desc:"Designed to fill with water; a trap, a test, or a feature; the drain matters",   features:["flood trigger","drainage control","what lives in it when flooded"] },
    { type:"Hall of Statues",     desc:"Stone figures in a long hall; some are decorative; some are warnings; at least one is not stone", features:["the one that moves","what the statues represent","the gaps where statues were removed"] },
    { type:"Map Room",            desc:"Contains maps of something; the dungeon, the region, the campaign, or something else entirely", features:["the main display map","the hidden update","the map nobody put away after the last use"] },
    { type:"Animal Den",          desc:"Where the dungeon's non-sapient inhabitants live; reveals what the inhabitants value and fear", features:["nesting behavior","what they eat","the unusual pet that clearly isn't theirs"] },
    { type:"Collapsed Section",   desc:"Impassable normally; has a way through for those who look; what collapsed reveals",  features:["the cause of collapse","the way through","what was hidden by the collapse"] },
    { type:"Fungal Garden",       desc:"Something grows here in the dark; the varieties matter; at least one variety shouldn't exist", features:["edible/toxic/magical varieties","the one that reacts to people","the colony that has a rudimentary opinion"] },
    { type:"Control Room",        desc:"Mechanism control; levers, switches, or magical interfaces for the dungeon's systems", features:["the thing it controls","the thing it ALSO controls that nobody mentions","the mechanism that doesn't correspond to any known system"] },
    { type:"Alchemy Workshop",    desc:"Chemicals, equipment, and a very interesting current project; something is always simmering", features:["the main project","the earlier failed project still in a flask","the component that's missing"] },
    { type:"Dining Hall",         desc:"For eating; scale and furnishing reveal the social order; the table still has one plate set", features:["social hierarchy in seating","the meal interrupted","the private table the leader used"] },
    { type:"Vault",               desc:"Secure storage; the security itself tells you what's valuable; multiple layers for important contents", features:["primary lock system","secondary trap","what's actually inside vs what everyone thinks is inside"] },
    { type:"Trophy Room (Live)",  desc:"The occupant keeps their prizes alive; the collection is organized, implying a system", features:["cages of different sizes","the newest acquisition","the one that's figured out the lock"] },
    { type:"Bathhouse",           desc:"Surprisingly common; personal hygiene reflects culture; this one has seen many conversations", features:["hot spring or heated water mechanism","the private compartment","the conversation that was being had when interrupted"] },
    { type:"Theater",             desc:"Performance space; never just for entertainment; the current production is the clue", features:["the stage and its mechanisms","the last performance's props","the trapdoor"] },
    { type:"Greenhouse",          desc:"Climate-controlled growing space; something here doesn't grow anywhere else; deliberately so", features:["controlled conditions (heat, moisture)","the primary cultivar","the thing grown for a specific and narrow purpose"] },
    { type:"Ossuary",             desc:"Bones as architecture and decoration; organization reveals the culture's relationship with death", features:["whose bones (enemy? honored dead?)","the pattern in arrangement","the one set of bones that's too fresh"] },
    { type:"War Room",            desc:"Planning space; maps, intelligence, and a current campaign; everything here is information", features:["the current plan on the table","intelligence reports","the private annotation in someone's handwriting"] },
    { type:"Generator Room",      desc:"The mechanism that powers everything; understanding it is understanding the dungeon", features:["the power source","the safety interlock","what happens when it's turned off"] },
    { type:"Trophy Garden",       desc:"Outdoor or indoor space with petrified/preserved beings; landscaped monstrosity", features:["the arrangement (chronological? thematic?)","the one that isn't entirely stone","the newest addition"] },
    { type:"Testing Chamber",     desc:"Built to test something — candidates, weapons, prisoners, magic; still functional", features:["the test itself","the record of previous tests","the result of the last test still in progress"] },
    { type:"Throne Room (Hidden)",desc:"The actual seat of power, not the public-facing one; where decisions happen privately", features:["smaller and more practical than the public version","the real documentation","the private exit"] },
    { type:"Communication Hub",   desc:"Magical message routing; messages from everywhere; some of them the heroes need", features:["active message queue","the messages that aren't going out because someone knows about them","the address directory"] },
    { type:"Menagerie",           desc:"Creature collection; some for study, some for use, some for company; none are happy", features:["classification system","the asset being studied vs the pet","the thing that shouldn't be in a cage but is"] },
    { type:"Infirmary",           desc:"Medical space; who is being treated tells you about the dungeon's current state", features:["current patients (wounded from the heroes?)","the supply of specific medications","the records of what's been treated"] },
    { type:"Chapel (Opposed)",    desc:"Dedicated to something the dungeon opposes; repurposed, damaged, or used for mockery", features:["the original dedication","what it's been converted into","the one element the new owners couldn't bring themselves to remove"] },
    { type:"Escape Route",        desc:"Not labeled as such; someone planned to leave fast; the route reveals what they knew about the outside", features:["concealed entrance","the supplies staged for departure","the document they were going to take"] },
    { type:"Kitchen Garden",      desc:"Where food grows for the dungeon's inhabitants; agricultural details reveal population size", features:["crop selection (dietary needs)","the extent of cultivation (population size estimate)","the thing growing that isn't food"] },
    { type:"Audience Hall",       desc:"For public gatherings; different from the throne room; this is where announcements are made", features:["acoustics (designed to project or to eavesdrop)","crowd control features","the back entrance for the speaker"] },
    { type:"Preparation Room",    desc:"Where someone got ready for something specific; the something is important", features:["the costume/equipment prepared","the ritual preparation evidence","the note written before departure"] },
    { type:"Repository",          desc:"Long-term storage of specific items; organized by a system that requires understanding the creator's mind", features:["the organizational logic","the index (if it exists)","the item that doesn't fit the system"] },
    { type:"Gallery",             desc:"Art and artifacts; each piece a choice; the absence of expected pieces is as interesting as their presence", features:["the collection's theme","the commissioned works vs the acquired","the piece that was removed and why"] },
    { type:"Sleeping Quarters (Singular)", desc:"One person's room; the most personal space; character is revealed in private spaces", features:["the book they were reading","the correspondence they kept","the thing they hid even from themselves"] },
    { type:"Training Hall",       desc:"Where skills are practiced; the equipment tells you the discipline; the wear tells you the dedication", features:["the primary combat style","the equipment in heaviest use","the thing practiced alone vs in group"] },
    { type:"Projection Room",     desc:"Where images, illusions, or memories are displayed; currently showing something", features:["what's currently displaying","the archive of previous displays","the live feed from somewhere in the dungeon"] },
    { type:"Dead End (Deliberate)", desc:"Looks like a dead end; is a dead end; that's the entire point; what happens to people who come here", features:["the trap that isn't obvious","the remains of the previous arrivals","the one thing left that explains why people keep coming"] },
    { type:"Crossing",            desc:"Where paths intersect; the traffic tells you about movement patterns; the wear tells you about frequency", features:["high vs low traffic directions","the hidden observation position","what people stop to do here"] },
    { type:"The Last Room",       desc:"Whatever was here last; the most recently used room in a dungeon tells you the most about what's currently happening", features:["the interruption evidence","the thing still active","the person who was here an hour ago"] }
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // MAGIC ITEMS — 80 unique items across level ranges, PF2e flavored
  // ─────────────────────────────────────────────────────────────────────────
  magicItems: {
    level1_4: [
      { name:"Compass of Ill Intent", desc:"Points toward the nearest creature within 500 feet that currently wants to harm you. Lies if you're the most dangerous person present.", activation:"Inspect (single action)", quirk:"Occasionally points at mirrors" },
      { name:"Ledger of True Weight", desc:"When a price is written in it, a marginal note appears in different handwriting stating the item's actual value and where a lower price can be found.", activation:"Write in it", quirk:"Occasionally adds editorial commentary about the negotiator's technique" },
      { name:"Hollow Coin", desc:"Appears as currency of any denomination; contains a small pocket space holding up to 1 cubic inch. Detectable only by physically checking.", activation:"Twist the edges", quirk:"Gets warm when something valuable is nearby" },
      { name:"Remembering Quill", desc:"Writes exactly what the user heard, not what they think they heard. Useful for transcription; uncomfortable for self-deception.", activation:"Write normally", quirk:"Occasionally corrects the user's grammar" },
      { name:"Traveling Cloak", desc:"Keeps the wearer comfortable in any weather. As a secondary function, anyone who borrows it feels vaguely that they should return it promptly.", activation:"Wear it", quirk:"Smells faintly of whoever wore it last" },
      { name:"Bread That Doesn't Stale", desc:"Travels well; tastes mediocre; keeps indefinitely; never gets better. The reliability is the virtue.", activation:"Eat it", quirk:"Tastes slightly worse each day the user hasn't done something useful" },
      { name:"Knot-Proof Rope", desc:"Cannot be cut, untied by an unfriendly hand, or frayed. Can be untied easily by the person who tied it. Cannot be retied to do something evil.", activation:"Tie a knot", quirk:"Occasionally ties itself to things it considers worth securing" },
      { name:"Truthful Mirror, Hand-Size", desc:"Reflects what you look like to others rather than to yourself. The difference is informative. Occasionally depressing.", activation:"Look into it", quirk:"Won't show you at your worst if you've had a hard day" },
      { name:"Silence Marble", desc:"Swallow it and you become perfectly silent for 1 minute. It returns to your hand afterward. You can feel it in your stomach, which is unpleasant.", activation:"Swallow it", quirk:"Gets slightly heavier each use until cleansed by holy water" },
      { name:"Map That Adds Details", desc:"Accurate base map; adds penciled notations of hazards and points of interest as the holder travels. Notations from previous owners remain.", activation:"Use normally", quirk:"Draws small editorial cartoons in the margins when the owner makes a bad decision" }
    ],
    level5_8: [
      { name:"Blade of Honest Violence", desc:"Strikes true against those who use words to harm. +2 weapon. Deals an extra 1d6 damage to creatures currently engaged in active deception.", activation:"Wield normally", quirk:"Vibrates in the presence of propaganda" },
      { name:"Boots of Consistent Character", desc:"Wearers gain +2 to Will saves against compulsion and charm effects. Secondary: they can't take actions wildly inconsistent with their established character.", activation:"Wear them", quirk:"The boots get harder to put on each time the wearer acts out of character" },
      { name:"Lantern of Fair Witness", desc:"Light reveals things as they are rather than as they appear. Illusions fail within its radius. Everyone looks exactly their age. Teeth and eyes show their true condition.", activation:"Light it", quirk:"The flame turns blue near someone performing an unkindness" },
      { name:"Sending Locket", desc:"Paired set. The holder can send a 25-word message once per day; the other holder receives it as an audible whisper. Messages can be stored for up to 24 hours.", activation:"Whisper into it", quirk:"Transmits ambient emotion as well as words; both parties know if the sender is lying" },
      { name:"Tome of Adjacent Knowledge", desc:"Contains no information itself. When placed on a shelf of books, it absorbs the index of every book it touches and can be queried about their contents.", activation:"Ask a question", quirk:"Develops opinions about the books it's read and will share them unprompted" },
      { name:"Last Testament Pendant", desc:"Records the last 3 minutes of the wearer's life at the moment of death. Can be replayed once by any caster of 3rd rank. Records nothing in the presence of certain antimagic.", activation:"Wear it", quirk:"Occasionally warms as though recording something the wearer hasn't done yet" },
      { name:"Agreement Seal", desc:"Pressed into wax at the bottom of a document, it glows red if any signatory to the document is currently violating its terms.", activation:"Press into wax", quirk:"Gets hotter proportional to the severity of the violation" },
      { name:"Compass of History", desc:"Points toward the nearest location where a significant historical event occurred within 1 mile. Switches to the most historically significant location if asked.", activation:"Ask it to search", quirk:"Sulks when pointed at deliberately unimportant locations" },
      { name:"The Neutral Ground", desc:"A physical marker; when placed between two parties, neither party can attack the other while both are visible from the marker. Works until moved.", activation:"Place it", quirk:"Slowly slides toward whoever is being more aggressive" },
      { name:"Scribe of the Dead", desc:"Pressed against any writing surface touched by someone now dead, it reproduces what that person wrote most recently before dying. Usually their last correspondence.", activation:"Press against surface", quirk:"Sometimes reproduces writing from people who aren't dead yet" }
    ],
    level9_12: [
      { name:"The Unbreakable Contract", desc:"Any agreement made on this parchment and signed by all parties becomes magically binding. Signatories feel physical discomfort when about to violate it.", activation:"Write on it", quirk:"Occasionally adds a clause that is both obviously correct and deeply inconvenient" },
      { name:"Armor of the Comfortable Target", desc:"+2 armor. Enemies targeting the wearer have their movement speeds halved toward the wearer. They still want to attack; they just get there slowly.", activation:"Wear it", quirk:"Occasionally makes the wearer inexplicably difficult to notice unless they're the most obvious person in the room" },
      { name:"The Borrowed Moment", desc:"Once per day, pause the current initiative count for 3 rounds. Everyone freezes; only the user acts. When the pause ends, play resumes from the same point.", activation:"Speak the command word", quirk:"Cannot be used twice in 24 hours; complains audibly if you try" },
      { name:"Cartographer's Memory", desc:"After visiting a location, the holder can perfectly reproduce a map of it from any perspective. Can be used to share the map with anyone who holds the item.", activation:"Concentrate while in a location", quirk:"Adds the cartographer's editorial opinions in tiny footnotes" },
      { name:"Weight of Accumulated Choices", desc:"Shows the user a brief vision of how a specific decision appears to have affected the future. Uses per day based on wisdom modifier. Sometimes refuses to show.", activation:"Hold and concentrate on a specific decision", quirk:"Refuses to show consequences of decisions that were already good" },
      { name:"The Honest Assessment", desc:"When used on any creature, provides a one-sentence accurate characterization of that creature's primary motivation. Cannot be used on the holder.", activation:"Touch target and concentrate", quirk:"Sometimes adds a second sentence that is accurate but uncomfortable" },
      { name:"Standard of the Committed", desc:"When planted, all allies who have made a specific oath and can see it gain the effects of Haste once per day. Requires a specific, witnessed oath to activate for each ally.", activation:"Plant it and call allies to oath", quirk:"Refuses to respond if the oath is made insincerely" },
      { name:"The Reckoning Stone", desc:"Records every promise made in its presence and glows proportional to how many remain unfulfilled. Can identify which promise belongs to whom.", activation:"Hold while promises are made", quirk:"Gets noticeably heavier with each unfulfilled promise" },
      { name:"Traitor's Brand", desc:"Applied to a willing recipient, makes all their deceptions visible to one specific designated person. The branded person feels it when they lie and can choose not to.", activation:"Apply with both parties' consent", quirk:"The brand has never, once, been applied to someone who didn't deserve it" },
      { name:"The Last Option", desc:"Single use. Does the one thing the user most needs done that they physically cannot do themselves. Destroyed in use. What it does is never exactly what was expected.", activation:"Name what you need", quirk:"Has a 30% chance of also doing something the user needed but didn't know they needed" }
    ],
    level13_16: [
      { name:"The Answer", desc:"Answers one yes/no question with absolute accuracy once per lunar cycle. Cannot be asked the same question twice. Will not answer questions about itself.", activation:"Ask it", quirk:"Sometimes adds 'but' to a yes or no and then goes silent" },
      { name:"All Debts Cancelled", desc:"Single use. Nullifies all financial, legal, and informal obligations currently held against the user. The obligations are cancelled, not transferred. Side effects include awkward social situations with creditors.", activation:"Invoke it", quirk:"Cannot be used to cancel debts owed to the deceased without their ghost's permission" },
      { name:"Armor of the Unavoidable Conversation", desc:"+3 armor. Creatures that defeat the wearer in combat are compelled to explain themselves before leaving. The explanation is honest. The wearer must survive for this to trigger.", activation:"Wear it", quirk:"Occasionally compels passersby to explain themselves unprompted" },
      { name:"The Impossible Standard", desc:"A measuring tool that measures worth rather than length. What it measures changes based on the holder's definition of worth, which it extracts and records.", activation:"Use it to measure", quirk:"Refuses to measure things the holder secretly knows are worthless" },
      { name:"The Weight of History", desc:"A weapon that deals damage equal to the target's most significant historical crimes, if any. Ineffective against those with no meaningful historical record. Variable damage, all types.", activation:"Strike", quirk:"Refuses to strike anyone who has genuinely atoned" }
    ],
    level17_20: [
      { name:"Name of the World", desc:"A single word that, spoken aloud, causes every sentient being within 1 mile to hear their own name in their native language simultaneously. Mass psychic contact. Once per year.", activation:"Speak it", quirk:"The word is different for every wielder and must be discovered" },
      { name:"The Final Argument", desc:"Presents a logical argument so complete that any being who hears it and can understand it must acknowledge its premises as valid. Does not compel agreement with the conclusion.", activation:"Speak it (3-action activity)", quirk:"Has never once been used to argue for something false; the item refuses" },
      { name:"Proof Against Inevitability", desc:"Once in its existence, this item can reverse one event that was considered inevitable. Determined by the DM. Cannot reverse deaths of party members. Can reverse campaign-ending events.", activation:"The DM determines when this becomes available", quirk:"The reversal always has one small, unexpected consequence that is better than expected" },
      { name:"The Correct Answer", desc:"Whatever question the campaign is trying to answer, this item contains the answer. Cannot be read until the holder has genuinely tried every other approach.", activation:"Open it", quirk:"The answer is always correct but never simple" },
      { name:"Legacy", desc:"Records everything the holder did during the campaign. At the campaign's end, becomes a primary historical document. Translates itself into any language. Cannot be destroyed.", activation:"Carry it", quirk:"Occasionally reads back choice moments to the holder when they need the reminder" }
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CITY/SETTLEMENT EVENTS — 60 events for hex exploration / downtime
  // ─────────────────────────────────────────────────────────────────────────
  settlementEvents: [
    // Festivals and celebrations
    "The Festival of the First Harvest — free food, competitions, a parade, and the traditional argument about the parade route",
    "Anniversary of the city's founding — speeches by officials, counter-speeches by dissidents, fireworks that are always slightly off",
    "The Remembrance — three days of mourning for a historical loss; business suspends; the mood is complex",
    "The Lottery — something is being given away by chance; the prize is genuinely valuable; the conditions are genuinely strange",
    "The Grand Tournament — combat, skill, and social competitions; heroes can enter; winning has political implications",
    "The Night Market — a market that operates only between dusk and dawn for three days; what's sold is unique to this event",
    "The Reunion — a recurring event bringing back former residents; gossip, money, and old business surface",
    "The Graduation Ceremony — for the local academy/guild; new practitioners enter; someone in this class is going to matter",
    "The Election — the settlement is choosing something; every faction is involved; the heroes' presence affects the outcome",
    "The Anniversary (Political) — of a treaty, a war's end, or a founding compact; celebrated differently by different factions",
    // Criminal and underground events
    "The Auction (Underground) — items that shouldn't be for sale are being sold to people who shouldn't have them",
    "The Meeting — criminal leadership is gathering; more careful about location than usual; something significant was decided at the last one",
    "The Heist — someone is robbing something right now; the heroes notice because of the distraction, not the actual crime",
    "The Trial (Parallel) — a criminal court is holding its own proceedings on the same matter as the official court",
    "The Recruitment — a faction is actively expanding; their pitch is being made in three separate locations simultaneously",
    "The Border Exchange — contraband crosses into/out of the settlement at a specific time and place; reliably",
    "The Debt Collection — a notable debt is being called in today; someone is about to lose something publicly",
    "The Takeover Attempt — a criminal organization is making a move on a competitor's territory; the collateral damage affects civilians",
    "The Frame — someone is about to be blamed for something they didn't do; the framing is professional",
    "The Informant Meeting — someone is going to talk to authorities tonight; the organization they're informing on knows",
    // Political events
    "The Summit — representatives of multiple factions are in the settlement; everyone is watching everyone",
    "The Proclamation — an official announcement is being made that changes something significant",
    "The Protest — a community objection is being expressed publicly; scale and response both matter",
    "The Negotiation — two parties are in private talks; what they agree on will not be announced publicly",
    "The Scandal — something is coming out today; which version of the story wins depends on who moves faster",
    "The Appointment — a position is being filled; the candidates are in the settlement; someone already knows the outcome",
    "The Investigation (Official) — authorities are looking into something; their methods are generating as many problems as solutions",
    "The Embargo — trade with somewhere has been suspended; the economic consequences are hitting now",
    "The Alliance Announcement — two factions have agreed to something; the announcement changes everyone else's calculus",
    "The Defection — someone is publicly switching sides today; they've prepared; their old faction hasn't been told yet",
    // Social and cultural events
    "The Debate — a public intellectual disagreement with genuine stakes; the outcome affects policy",
    "The Exhibition — something new is being shown publicly for the first time; its reception will determine its future",
    "The Competition (Economic) — two businesses are in direct public competition; one will survive; the other will not",
    "The Wedding — a significant union with political implications; attendance is mandatory for some, forbidden for others",
    "The Funeral — a notable death; who attends tells more than the eulogy; the will is being contested",
    "The Reunion (Complicated) — people who shouldn't be in the same room are in the same room",
    "The Discovery — something found that changes an ongoing situation; the finder doesn't yet understand what they have",
    "The Teaching — a public lecture or demonstration by someone whose knowledge is significant",
    "The Competition (Social) — status is being determined in a public setting; the stakes are real even if the event seems trivial",
    "The Crisis (Minor, Escalating) — something small is going wrong in a way that will be significant tomorrow",
    // Economic events
    "The Price Spike — a commodity has become significantly more expensive overnight; the reason is unclear",
    "The Market Crash (Local) — a specific sector of the settlement's economy has collapsed; the ripple effects are beginning",
    "The Contract Signing — a major agreement that restructures relationships between two economic powers",
    "The Cargo Arrival — a shipment of something significant has arrived; more interested parties than expected showed up",
    "The Bankruptcy — a notable institution or person has defaulted; assets are being liquidated; vultures are circling",
    "The New Business — something is opening that will change how a specific need is met; existing providers are not pleased",
    "The Shortage — something necessary is not available; multiple parties are competing for limited supply",
    "The Windfall — unexpected prosperity has come to part of the settlement; the reasons and distribution are contested",
    "The Investment — a significant amount of money is moving into a specific area; someone believes something the market doesn't yet",
    "The Strike — workers are refusing to work; the demands are reasonable; the timing is terrible",
    // Magical and unusual events
    "The Anomaly — something magical is happening that nobody caused and nobody knows how to stop",
    "The Visitation — a significant supernatural entity is present in the settlement; their purpose is unclear",
    "The Ritual (Public) — a large-scale magical working is being performed openly; participation is optional but beneficial",
    "The Convergence — multiple magical phenomena are occurring simultaneously at a single location",
    "The Silence — magic has stopped working in a specific area with no explanation; the area is expanding",
    "The Echo — a historical event is replaying in a specific location; participants can interact with it",
    "The Sign — an unambiguous omen has appeared; multiple factions interpret it differently",
    "The Manifestation — someone's strong emotion or strong will has created a temporary physical effect",
    "The Opening — a connection to somewhere else has spontaneously appeared; it wasn't there yesterday",
    "The Convergence (Planar) — the boundary between the material plane and somewhere else is thin here today"
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // MONSTER MOTIVATIONS — 40 reasons a monster is doing what it's doing
  // (Beyond 'it's hungry' and 'it's evil')
  // ─────────────────────────────────────────────────────────────────────────
  monsterMotivations: [
    "Protecting its young, who are hidden somewhere in the dungeon and need to be kept safe from the interlopers",
    "Acting on the last command it was given before its master died; the command was 'guard this' and it has been guarding for 300 years",
    "Sick and in pain; the aggression is defensive; it will stop attacking if the pain source is removed",
    "Defending a territory it has held for decades against what it perceives as yet another intrusion",
    "Looking for something specific — a smell, a sound, an object — and the heroes are between it and the search",
    "Confused; was in a different place a moment ago; doesn't know where it is; reacting from fear",
    "Bound by a magical compulsion it cannot resist; hates what it's doing; cannot stop",
    "Obeying a social hierarchy; the alpha in the group is directing it; taking out the alpha changes the dynamic",
    "Reproducing; the heroes are raw material for a biological process; it's not personal",
    "Genuinely believes the heroes are the threat that was prophesied and it must stop them for the good of its kind",
    "Responding to a magical signal the heroes are unknowingly broadcasting; turning off the signal stops the attacks",
    "Has established a mutualistic relationship with the dungeon's ecosystem that requires regular 'offerings'",
    "Is being driven out of its usual territory by something further in the dungeon; the heroes are collateral",
    "Maintains a specific behavior pattern enforced by the dungeon's magical systems; resists because it always resists",
    "Protecting a member of its group that was injured by the heroes' entry trap",
    "Part of a controlled population maintained to prevent something worse from filling the niche",
    "Exhibiting mating behavior; the aggression is territorial display, not predation",
    "Acting as a warning system; the attack is meant to drive intruders away, not kill them, unless pressed",
    "Drawn by a specific scent — a spell component, a food item, an alchemical reagent — in the heroes' possession",
    "The last survivor of a population; behavioral norms that made sense in a group don't make sense alone",
    "In a territory dispute with another creature in the dungeon; the heroes walked into the middle of it",
    "Part of a domesticated population that has gone feral; still responds to specific commands from its era",
    "Executing a complex hunting strategy that requires driving prey into a specific location",
    "Reacting to a visual cue — color, shape, movement pattern — that the heroes are accidentally producing",
    "Under a magical influence from an item in the dungeon that has been controlling local creatures",
    "Building something; the heroes have materials it needs; it will take them if it can",
    "Testing the heroes; will stop attacking if they demonstrate a specific quality it recognizes as worthy",
    "Has been conditioned by repeated exposure to associate specific hero behaviors with food reward",
    "Carrying out a duty assigned by a dead civilizations's spell; doesn't know the civilization is gone",
    "Grieving; lost a companion recently; not functional in its grief; not reasoning; just pain",
    "The ecosystem here requires this creature to behave this way; it's not an individual choice",
    "Intelligent enough to have formed an opinion about the heroes specifically, based on what it's witnessed",
    "Acting on behalf of a creature further in the dungeon that has established dominance over local populations",
    "Performing a seasonal behavior that happens to overlap with the heroes' presence; they're interference, not targets",
    "Has made a deal with a dungeon faction; this attack is fulfilling the terms",
    "Responding to a pheromone/magical signal released by the last creature the heroes fought",
    "Has learned that the specific type of intruder the heroes represent always leaves behind useful materials",
    "Is actually trying to get the heroes to follow it to something it cannot communicate directly",
    "Part of a predator-prey dynamic where the heroes replaced the prey; the predator had nothing to do with this choice",
    "Genuinely curious; the attacks are investigative; it will stop if the heroes provide something more interesting to examine"
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // ENCOUNTER COMPLICATIONS — 40 things that make a fight more interesting
  // ─────────────────────────────────────────────────────────────────────────
  encounterComplications: [
    "One of the enemies is clearly trying to lose without making it obvious they're trying to lose",
    "A neutral third party arrives mid-combat and begins fighting the side currently winning",
    "The environment the heroes have been using as cover turns out to be a creature",
    "A faction ally appears unexpectedly and asks the heroes to stop — they owe this enemy a favor",
    "One enemy is controlling the others; the others will scatter if the controller is incapacitated",
    "The enemies are protecting something the heroes want; the heroes realize this mid-combat",
    "A timer is counting down that both sides are aware of; the fight becomes about who stalls whom",
    "Rain/fire/magic has obscured vision; everyone is navigating by sound and intuition",
    "The ground is the real enemy; both sides are managing the terrain more than each other",
    "An innocent person is caught in the middle and both sides are maneuvering around them",
    "The enemies have a legitimate grievance against the heroes; the heroes realize this when the enemies say so",
    "The fight is being recorded or witnessed by someone whose account will matter later",
    "One of the 'enemies' is the heroes' contact in disguise; harming them has consequences",
    "The objective isn't to win the fight; it's to survive long enough for something else to happen",
    "The enemies are between the heroes and a thing that is more dangerous than the enemies",
    "Defeating the enemies will trigger an alarm; the heroes didn't know this until the first enemy went down",
    "The combat is a distraction; the real event is happening somewhere else; the heroes may or may not realize in time",
    "The enemies are deliberately allowing heroes to get through to something they want the heroes to encounter",
    "A magical effect is causing both sides to perceive the combat differently; neither side knows this",
    "The enemies have information the heroes need; defeating them before extracting it is a mistake",
    "One hero is being controlled by an effect that the other heroes don't know about yet",
    "The fight attracts additional enemies from further away; the longer it takes, the worse it gets",
    "One enemy is trying to defect; the others will attack them if they notice; the heroes must manage this",
    "The terrain is being actively used against both sides by a third entity that neither side knows is present",
    "Victory conditions change mid-combat because of something that happens in the world outside the fight",
    "The enemies are from a faction the heroes might need later; every enemy killed narrows a future option",
    "An exit that the heroes needed closes during the fight; now they must win to create a new one",
    "A resource the heroes were saving for later becomes necessary in this fight at the worst possible moment",
    "The enemies are under a compulsion they cannot override; winning means breaking the compulsion, not defeating the enemies",
    "A hero's action early in the fight created a consequence that manifests at the worst possible moment",
    "The fight would be straightforward except for one extremely effective enemy ability that changes all calculations",
    "One enemy is significantly more dangerous than their level suggests because of one specific circumstance",
    "The enemies are defending a goal rather than trying to defeat the heroes; their behavior is non-intuitive as a result",
    "Something the heroes carry is interfering with their own abilities in this specific location",
    "The enemies recognize one of the heroes from a previous encounter and have specifically prepared for them",
    "A promise one hero made earlier becomes relevant in this fight in a way they didn't anticipate",
    "The enemy leader communicates in a way only one hero can understand, and that hero is now receiving offers",
    "The fight ends only when a specific condition is met that neither side initially knows about",
    "Both sides entered this fight expecting different enemies and must recalibrate quickly",
    "One of the enemies is not an enemy — is a victim acting from fear — and identifying this mid-combat requires attention"
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // WEATHER / ATMOSPHERE — 30 more (running total: 50+)
  // ─────────────────────────────────────────────────────────────────────────
  atmosphericEvents: [
    "A wind that smells of the sea despite being 500 miles inland",
    "Hail that falls upward for exactly three minutes at noon",
    "A sunset that takes four hours instead of twenty minutes and produces a unique color not otherwise observed in nature",
    "Frost patterns on window glass that form the same image every night for a week",
    "A morning fog that carries whispered arguments — not intelligible, but clearly arguments",
    "Rain that is warm — body temperature — for six hours before becoming cold",
    "A lightning storm that produces no thunder; the lightning strikes in a grid pattern",
    "Snow that falls in categories — some lands, some dissolves before hitting ground, some hangs suspended — in distinct zones",
    "A day where shadows fall in the wrong direction, which no one can explain and everyone finds mildly distressing",
    "Winds that perfectly cancel each other out, producing absolute stillness inside a region of active storm",
    "Dew that forms on objects rather than ground, as though moisture condenses in the air and chooses surfaces",
    "A week of perfect weather followed by an hour of every kind of weather simultaneously",
    "Clouds that move against the wind at the same speed the wind blows, appearing stationary while everything else moves",
    "Temperature inversions: cold near the ground, progressively warmer above, until hot at the heights normally touched by weather",
    "A specific color of light at sunset that causes everyone who sees it to remember their earliest clear memory",
    "Ground fog that collects only in building interiors, not in streets or open spaces",
    "Rain that forms words on flat surfaces before evaporating — different words in different places; no language identified",
    "A week of storms that maintain constant intensity, as though calibrated to prevent travel without causing damage",
    "An unusual stillness before a storm that extends for twelve hours instead of the usual hour",
    "Weather that seems to be responding to emotional conditions in the settlement — happy events produce clear skies",
    "A sunrise that is accompanied by a low, sustained note audible to all beings within two miles",
    "Ice that forms in enclosed spaces without freezing temperatures, melts in open air without warming",
    "Lightning that illuminates specific objects rather than areas — choosing rather than striking randomly",
    "A mist that reduces visibility to ten feet but carries sounds from up to a mile away with perfect clarity",
    "Snow that falls and then falls upward — the same snow, bouncing between ground and sky — for one hour",
    "A double moon on a night when only one moon should be visible; the second moon is in the wrong phase",
    "Starlight that casts actual shadows despite being too dim to normally do so — and the shadows don't match the objects",
    "Rain that lasts exactly one hour regardless of cloud conditions or season — always one hour, then stops",
    "A wind that reverses direction exactly once per hour, producing cycling gusts that sailors and farmers account for",
    "Air pressure changes that cause everyone in a region to develop identical headaches at identical times — briefly"
  ],

  // ─────────────────────────────────────────────────────────────────────────
  // NPC RELATIONSHIP DYNAMICS — 30 templates for NPC group dynamics
  // ─────────────────────────────────────────────────────────────────────────
  npcRelationships: [
    { dynamic:"Mentor Betrayed", desc:"A former student has surpassed and rejected their mentor; the mentor doesn't understand where they failed; the student has moved beyond explaining", tension:"The mentor sees the rejection as the student's flaw; the student sees the mentor as the obstacle they had to remove" },
    { dynamic:"Siblings, Opposite Paths", desc:"Two people from the same background who made opposite choices; neither is entirely wrong; both are convinced the other wasted something precious", tension:"Family loyalty fighting with ideological opposition; each one is the other's reminder of the road not taken" },
    { dynamic:"Rivals Who Respect Each Other", desc:"Two people who've been competing for so long they understand each other better than their allies do; the competition is real; so is the regard", tension:"The respect makes betrayal impossible; the rivalry makes cooperation feel like surrender" },
    { dynamic:"Partners, Unequal Investment", desc:"Two people who built something together; one built more; the other doesn't acknowledge this; the resentment is real even if unstated", tension:"The less invested partner often gets credit; the more invested partner is running out of patience for not getting it" },
    { dynamic:"Former Enemies, Current Allies", desc:"People who fought each other and now work together; neither entirely trusts the other; neither regrets the arrangement", tension:"Old patterns activate under stress; the alliance is strategic but the wariness is genuine" },
    { dynamic:"The Debt", desc:"One person owes another something they haven't paid; both remember; neither has addressed it directly", tension:"The debtor avoids the creditor; the creditor wonders why it hasn't been offered" },
    { dynamic:"The Shared Secret", desc:"Two people know something no one else does; it binds them even if they don't like each other", tension:"The secret is the relationship; if it came out, they wouldn't need each other; neither is sure that's what they want" },
    { dynamic:"Parent and Child, Wrong Roles", desc:"An older person who became a parent figure for a younger one in a context that should have been peer-to-peer; neither fully adjusted", tension:"The younger resents the paternalism; the older can't stop projecting concern; both know it and can't change" },
    { dynamic:"The Better Offer", desc:"One person is being recruited by a competing faction; the other person knows and hasn't said anything", tension:"The one being recruited is waiting to see if anyone will fight for them; the one who knows is waiting to see if they'll stay" },
    { dynamic:"Unacknowledged Love (Passed)", desc:"One person loved the other; the other never knew; the feeling has resolved into something more manageable but still present", tension:"The former feeling has become protectiveness; the other person doesn't understand why they get extra consideration" },
    { dynamic:"The Cover-Up", desc:"One person helped the other hide something; the thing being hidden is gone but the knowledge of it remains", tension:"The helper has leverage they've never used; the helped person has never offered acknowledgment; both avoid the subject" },
    { dynamic:"The One Who Got Out", desc:"One person from a shared background escaped a situation the other is still in; the one still in has feelings about this", tension:"Resentment and pride fight in the one still in; the one who got out carries guilt and relief in equal measure" },
    { dynamic:"Professional Admiration, Personal Incompatibility", desc:"Two people who excel at similar things and recognize each other's excellence and cannot spend more than an hour together", tension:"They agree on everything professional and nothing personal; the professional context is the only place they function together" },
    { dynamic:"The Complicated Teacher", desc:"One taught the other something crucial, and the teaching was necessary, and the teacher was also harmful, and both things are true", tension:"Gratitude and resentment fighting for the same space; the student's success is something the teacher points to while the harm is something the student points to" },
    { dynamic:"Partners in Something Shameful", desc:"Two people who did something neither is proud of; they're connected by the doing of it", tension:"Neither can bring it up; neither can entirely forget; they manage each other carefully to avoid the subject" },
    { dynamic:"The Saved Life, Complicated", desc:"One person saved the other's life; the saved person didn't want to be saved in that moment; feels guilty about not feeling grateful", tension:"The saver expects gratitude; the saved person offers it inadequately; neither explains the gap" },
    { dynamic:"Parallel Development", desc:"Two people who came to the same place independently and discovered each other there; the parallel paths create uncanny resonance", tension:"Each one wonders if the other is actually independent or if there's a hidden connection; neither is sure how much to trust the resonance" },
    { dynamic:"The One Who Knew First", desc:"One person knew something important before the other; has been waiting for the other to figure it out; hasn't helped", tension:"The late-knower discovers the gap and has feelings about not being told; the early-knower has a reason for waiting that is either good or not" },
    { dynamic:"Competitive Protectiveness", desc:"Two people both protecting the same third party in ways that compete and occasionally conflict", tension:"Both think the other is doing it wrong; both might be right; the third party is beginning to notice the competition" },
    { dynamic:"The Renegotiated Contract", desc:"Two people who agreed to something that used to make sense and now doesn't; neither has said this out loud", tension:"Both performing a relationship they've outgrown; both waiting to see if the other notices; neither wanting to be the one who breaks it" },
    { dynamic:"The Missing Third", desc:"Two people in a relationship of two who used to be three; the dynamic was set by the three of them and doesn't quite work as two", tension:"Both reference the third constantly; both manage the absence differently; neither has made peace with it" },
    { dynamic:"Underestimation (Mutual)", desc:"Two people who consistently underestimate each other and are consistently surprised", tension:"Each has a blind spot for the other's specific kind of competence; each has a blind spot for the other's specific kind of danger" },
    { dynamic:"The Investment", desc:"One person has invested significantly in the other's development; the other is beginning to outgrow what the investment was for", tension:"The investor wants to keep directing the investment; the invested-in wants to direct themselves; the language of gratitude makes this complicated" },
    { dynamic:"Former Leadership", desc:"One person led the other; the leadership ended; neither is sure which role they're in now", tension:"Old deference instincts activate at unexpected moments; old leadership instincts activate at other moments; both people find this annoying" },
    { dynamic:"The Gap in Understanding", desc:"Two people who care about each other and cannot understand what the other is talking about in one specific domain", tension:"The gap is in a domain that matters to both of them; both have tried to explain; the explaining has made it worse" },
    { dynamic:"Shared Grief, Different Processing", desc:"Two people grieving the same loss in incompatible ways", tension:"Each processes through contact; the other processes through distance; they keep colliding" },
    { dynamic:"The Favor Economy", desc:"Two people who have maintained a careful accounting of favors for so long that the original reason has been forgotten", tension:"The accounting is now self-sustaining; both would be embarrassed to admit they've lost track of the original debt direction" },
    { dynamic:"Competition for a Third", desc:"Two people competing for the attention, affection, or approval of a third who may not be aware of the competition", tension:"The competition is real; the third party's preferences are unclear; the two competitors haven't acknowledged the competition to each other" },
    { dynamic:"The Returning Stranger", desc:"Two people who knew each other well, were separated for a long time, and are now together again having both changed", tension:"Old patterns of familiarity fighting with the reality that these are now different people; both finding the gap between memory and present disorienting" },
    { dynamic:"Loyalty to Incompatible Causes", desc:"Two people loyal to each other and to competing causes; they haven't had to choose yet; they're both aware that they will", tension:"Every interaction is shadowed by the knowledge that a choice is coming; neither wants to be the one who forces it" }
  ]
};

// ─────────────────────────────────────────────────────────────────────────
// Runtime merge into COMPONENTS
// ─────────────────────────────────────────────────────────────────────────
(function mergeCE3() {
  if (typeof COMPONENTS === 'undefined') return;

  // Villain archetypes
  COMPONENTS_EXTRA3.villainArchetypes.forEach(v => COMPONENTS.villainArchetypes.push(v));

  // Locations
  ['urban','wilderness','dungeon','planar'].forEach(k => {
    if (COMPONENTS_EXTRA3.locations[k]) {
      COMPONENTS_EXTRA3.locations[k].forEach(l => COMPONENTS.locations[k].push(l));
    }
  });

  // Side quest templates
  COMPONENTS_EXTRA3.sideQuestTemplates.forEach(s => COMPONENTS.sideQuestTemplates.push(s));

  // Plot twists
  COMPONENTS_EXTRA3.plotTwists.forEach(t => COMPONENTS.plotTwists.push(t));

  // Adventure hooks
  COMPONENTS_EXTRA3.adventureHooks.forEach(h => COMPONENTS.adventureHooks.push(h));

  // NPC archetypes
  COMPONENTS_EXTRA3.npcArchetypes.forEach(n => COMPONENTS.npcArchetypes.push(n));

  // Factions
  COMPONENTS_EXTRA3.factions.forEach(f => COMPONENTS.factions.push(f));

  // Boss encounters
  COMPONENTS_EXTRA3.bossEncounters.forEach(b => COMPONENTS.bossEncounters.push(b));

  // New pools — add wholesale
  COMPONENTS.dungeonRooms           = COMPONENTS_EXTRA3.dungeonRooms;
  COMPONENTS.magicItems             = COMPONENTS_EXTRA3.magicItems;
  COMPONENTS.settlementEvents       = COMPONENTS_EXTRA3.settlementEvents;
  COMPONENTS.monsterMotivations     = COMPONENTS_EXTRA3.monsterMotivations;
  COMPONENTS.encounterComplications = COMPONENTS_EXTRA3.encounterComplications;
  COMPONENTS.npcRelationships       = COMPONENTS_EXTRA3.npcRelationships;

  // Append to existing atmosphere events
  if (COMPONENTS.atmosphericEvents) {
    COMPONENTS_EXTRA3.atmosphericEvents.forEach(a => COMPONENTS.atmosphericEvents.push(a));
  } else {
    COMPONENTS.atmosphericEvents = [...COMPONENTS_EXTRA3.atmosphericEvents];
  }
})();

if (typeof module !== 'undefined') module.exports = COMPONENTS_EXTRA3;
