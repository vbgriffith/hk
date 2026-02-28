/**
 * data/campaigns_extra2.js  —  Build 4.5 Data Expansion, Batch 2
 * 20 additional campaign seeds merged into CAMPAIGNS at runtime.
 */

const CAMPAIGNS_EXTRA2 = [

  // ─── 41. The Tide Compact ─────────────────────────────────────────────────
  {
    id: "TC",
    name: "The Tide Compact",
    tagline: "The ocean decided it's done negotiating.",
    source: "Original",
    tones: ["exploration","dark"],
    themes: ["nature","planar","divine"],
    levelRange: [4,16],
    synopsis: `Coastal cities have begun receiving impossible ultimatums from an entity that identifies itself as the living consciousness of the ocean — a vast mind that formed over millennia as sea creatures died and their psychic residue accumulated in the deep trenches. The Tide has demands: the halt of all ocean pollution, the end of commercial fishing above replacement rate, and the demolition of three specific ports that have caused irreparable damage. The heroes must determine whether the Tide's grievances are legitimate, whether its methods are acceptable, and whether it can even be reasoned with before it begins erasing coastlines.`,
    mainPlot: [
      "Witness the first Tide ultimatum and the catastrophic demonstration that follows",
      "Make contact with the Tide through its surface-world intermediaries — deep-sea psychics who hear its voice",
      "Investigate the grievances: find that they are genuine and documented",
      "Navigate between nations that want the Tide destroyed and those that want to negotiate",
      "Broker a Compact that addresses the Tide's legitimate demands without granting it sovereignty over all oceans"
    ],
    defaultVillain: {
      name: "The Tide (Self-Designation: That-Which-Returns)",
      title: "Living Ocean Consciousness, Voice of the Accumulated Dead",
      race: "Unique Psychic Megaorganism",
      alignment: "True Neutral (acting from genuine grievance)",
      motivation: "Survival of the ocean ecosystem through enforced compliance — it has tried patience and been ignored",
      tactics: "Environmental disasters precisely targeted at economic rather than civilian targets, psychic pressure on coastal populations, leveraging its indispensable nature",
      weakness: "Cannot maintain anger and action simultaneously — sustained genuine diplomatic engagement causes it to pause as its slow mind processes",
      secretReveal: "The Tide does not want to harm anyone; it has preserved thousands of drowning sailors over centuries as an automatic protective reflex; it finds causing harm deeply painful but has concluded it is the only thing that works"
    },
    locations: ["The Stricken Port of Kelversholm", "The Deep Psychic Relay (100 fathoms)", "The Tide's Archive Trench", "The Compact Negotiation Atoll", "The Three Condemned Ports"],
    factions: [
      { name: "The Maritime Coalition", alignment: "Lawful Neutral", role: "Wildcard", desc: "Fishing nations whose economies depend on the ocean; simultaneously the problem and part of the solution." },
      { name: "The Tide-Speakers", alignment: "Chaotic Good", role: "Ally", desc: "Psychics and deep-sea mystics who can communicate with the Tide; persecuted by the Coalition." },
      { name: "The Naval Eradication Fleet", alignment: "Lawful Neutral", role: "Antagonist", desc: "Seven nations pooling military resources to destroy what they cannot negotiate with." }
    ]
  },

  // ─── 42. The Undying Archive ──────────────────────────────────────────────
  {
    id: "UA",
    name: "The Undying Archive",
    tagline: "Every book ever written is here. So is every person who ever wrote one.",
    source: "Original",
    tones: ["exploration","horror"],
    themes: ["undead","arcane","ancient"],
    levelRange: [5,17],
    synopsis: `A legendary library was destroyed by fire three centuries ago — or so everyone believed. The heroes discover it intact in a pocket dimension, its knowledge preserved perfectly, its librarians preserved equally perfectly: as intelligent undead who have spent three centuries cataloguing, cross-referencing, and slowly losing their remaining humanity. The library contains answers to every question in the campaign — but access requires navigating the Archivists' increasingly alien value system and the political structure they've built in isolation.`,
    mainPlot: [
      "Discover the dimensional entrance — the library wants to be found now, for its own reasons",
      "Establish contact with the Archivist hierarchy; learn what they want in exchange for access",
      "Navigate the library's internal politics as different Archivists have different agendas for reopening",
      "Discover what the library's rarest section contains — and why the head Archivist has been hiding it",
      "Decide the library's fate: return it to the world, keep it hidden, or help the Archivists find peace"
    ],
    defaultVillain: {
      name: "The Grand Archivist Soveliss Kel",
      title: "Chief Cataloguer of the Undying Archive, Voice of Preservation",
      race: "Lich (former Elf scholar, involuntary transformation)",
      alignment: "Lawful Neutral (sliding toward Evil through three centuries of isolation)",
      motivation: "Maintain the Archive's integrity and prevent its contamination by the outside world — but also, desperately, to be remembered as something other than a monster",
      tactics: "Total information advantage within the Archive, control of dimensional access, the loyalty of 200+ lesser Archivists, knowledge used as both tool and weapon",
      weakness: "Has not spoken to anyone from the outside world in 300 years; genuine connection to a living person causes visible deterioration of their detachment",
      secretReveal: "Soveliss did not choose undeath — the fire that destroyed the library killed the scholars but the library itself refused to let its keepers go; the undeath was the library's act of preservation, not theirs"
    },
    locations: ["The Dimensional Entrance (shifting location)", "The General Stacks", "The Restricted Section", "The Archivists' Quarters (where they are most themselves)", "The Sealed Wing (three centuries sealed)"],
    factions: [
      { name: "The Progressive Archivists", alignment: "Lawful Good", role: "Ally", desc: "Undead scholars who want to reopen the Archive and reconnect with living scholarship." },
      { name: "The Preservationists", alignment: "Lawful Neutral", role: "Antagonist", desc: "Archivists who believe isolation has kept the library pure and will fight to maintain it." },
      { name: "The Lost Readers", alignment: "Chaotic Neutral", role: "Wildcard", desc: "Scholars who found the Archive decades ago and were never allowed to leave." }
    ]
  },

  // ─── 43. Ghost Protocol ───────────────────────────────────────────────────
  {
    id: "GP",
    name: "Ghost Protocol",
    tagline: "The war ended. The soldiers didn't notice.",
    source: "Original",
    tones: ["dark","political"],
    themes: ["undead","political","ancient"],
    levelRange: [3,14],
    synopsis: `A war ended forty years ago with a peace treaty that nobody told the ghost army about. Twelve thousand spectral soldiers continue to occupy a border region, enforcing the wartime laws of their nation — a nation that no longer exists in the same form. The heroes must negotiate a peace with an army of the dead while managing two living nations that have conflicting interests in how that peace is structured, and while some factions on both sides prefer the ghosts stay angry.`,
    mainPlot: [
      "Enter the occupied zone and make first contact with the ghost army's command structure",
      "Learn what the ghost soldiers actually want: not to continue the war, but to know it ended with honor",
      "Negotiate the terms of their standing down while managing political interference",
      "Discover that someone is actively preventing the peace — the occupation is profitable",
      "Find the terms that let the ghost army rest while holding the profiteers accountable"
    ],
    defaultVillain: {
      name: "Overseer Brandeth Cors",
      title: "Administrator of the Occupied Zone, Profiteer of Perpetual Conflict",
      race: "Human (Investigator)",
      alignment: "Lawful Evil",
      motivation: "The occupation zone is economically profitable and politically useful; peace would end both advantages",
      tactics: "Bureaucratic obstruction, feeding misinformation to both the ghosts and the living governments, eliminating anyone who gets close to a resolution",
      weakness: "His position depends entirely on the occupation continuing; proving the war ended would remove his authority and expose his profiteering",
      secretReveal: "Cors was a junior administrator when the war ended and forged documents to maintain his authority; he has been living inside the lie for forty years and is more afraid of exposure than of anything the heroes can do to him"
    },
    locations: ["The Ghost Garrison (command post)", "The Treaty Archive (the real one)", "The Occupied Towns", "The Living Border (political capitals)", "The Profiteer's Records Office"],
    factions: [
      { name: "The Ghost Army Command", alignment: "Lawful Neutral", role: "Wildcard", desc: "Honorable soldiers who have been following their last orders faithfully for forty years." },
      { name: "The Occupied Communities", alignment: "Chaotic Good", role: "Ally", desc: "Living people who have built lives around the ghosts and have complicated relationships with them." },
      { name: "The Nationalist Faction", alignment: "Lawful Evil", role: "Antagonist", desc: "Politicians who want the ghost army as a permanent deterrent and will fight any resolution." }
    ]
  },

  // ─── 44. The Longest Night ────────────────────────────────────────────────
  {
    id: "LN",
    name: "The Longest Night",
    tagline: "The sun set eight months ago. Something is keeping it down.",
    source: "Original",
    tones: ["horror","dark"],
    themes: ["divine","undead","ancient"],
    levelRange: [6,18],
    synopsis: `A hemisphere is experiencing the longest night in recorded history — eight months of darkness with no sign of ending. The heroes live in a city running on magical light and dwindling food supplies as the agricultural system collapses. Their investigation leads them to a dying sun deity whose power is failing, held at bay by something old enough to predate divinity itself. The darkness is not natural, not evil — it is the absence of something that was keeping an older darkness away.`,
    mainPlot: [
      "Investigate the failed sun as winter deepens into permanent crisis",
      "Reach the sun deity's weakened avatar and learn what is suppressing the sun",
      "Descend into the Pre-Divine Darkness to understand what they're dealing with",
      "Find that the Pre-Divine Darkness is not malevolent — it predates the concept",
      "Restore the balance without destroying the darkness, which serves a necessary cosmic function"
    ],
    defaultVillain: {
      name: "The Pre-Divine Darkness (Named: The Before)",
      title: "The Antecedent, That Which Preceded Light",
      race: "Unique Cosmic Principle (not a creature)",
      alignment: "True Neutral (predates mortal moral frameworks)",
      motivation: "Reclaim space ceded to light over millennia — not out of malice but out of cosmic tendency toward equilibrium",
      tactics: "Not tactical; the Darkness simply expands into available space; the heroes must create the conditions for the sun to reclaim its territory",
      weakness: "The Darkness recedes from genuine warmth — not fire, not light, but emotional warmth; gathered communities of people who choose hope provide genuine repellent",
      secretReveal: "The sun deity caused this crisis by expanding too aggressively into territory the Darkness had held for geological ages; the Darkness is responding to a boundary violation"
    },
    locations: ["The Darkened City (heroes' base)", "The Sun Deity's Fading Realm", "The Twilight Border", "The Pre-Divine Deep", "The Original Balance Point"],
    factions: [
      { name: "The Sun Priests", alignment: "Lawful Good", role: "Ally", desc: "Desperate clerics maintaining magical light; their power fades as their deity weakens." },
      { name: "The Darkness Cult", alignment: "Chaotic Neutral", role: "Wildcard", desc: "Those who have embraced the night and believe the Before is a natural force, not an enemy." },
      { name: "The Survivalists", alignment: "Neutral", role: "Wildcard", desc: "Communities who have adapted to the dark and resist any change that might destabilize what they've built." }
    ]
  },

  // ─── 45. The Mercenary Republic ───────────────────────────────────────────
  {
    id: "MR",
    name: "The Mercenary Republic",
    tagline: "They sold their swords to everyone. Now everyone owes them.",
    source: "Original",
    tones: ["political","swashbuckling"],
    themes: ["political","urban","ancient"],
    levelRange: [4,15],
    synopsis: `The Free Companies of the Mercenary Republic have spent 200 years selling military services to every nation on the continent. They've accumulated unpaid debts, outstanding contracts, and favors owed by every major power. Now their elected General-Marshal is calling in every debt simultaneously — not for money, but for territorial concessions that would give the Republic a permanent homeland. The heroes are caught between nations scrambling to avoid paying and the Republic's legitimate but destabilizing demand for a place in the world.`,
    mainPlot: [
      "Heroes are hired by one nation to find leverage against the Republic's debt claims",
      "Discover the Republic's claims are legally and morally sound — and their need for a homeland is genuine",
      "Navigate the competing national interests trying to avoid their obligations",
      "Uncover a conspiracy to assassinate the General-Marshal before the settlement is reached",
      "Broker or prevent a settlement that creates a new nation out of five separate territorial concessions"
    ],
    defaultVillain: {
      name: "High Chancellor Maret Solvane",
      title: "Chancellor of the Confederated Creditor Nations, Architect of the Resistance",
      race: "Human (Bard)",
      alignment: "Lawful Evil",
      motivation: "Preserve the current international order that benefits the powerful; the Republic having a homeland changes everything",
      tactics: "Coalition politics, debt negotiation as a weapon, assassination by proxy, framing the Republic's legitimate demands as aggression",
      weakness: "The coalition she's built is fragile — three of the five creditor nations would settle privately if given political cover",
      secretReveal: "Solvane's own nation owes the largest single debt to the Republic; personal exposure drives her resistance as much as political ideology"
    },
    locations: ["The Republic's Mobile Capital (a city on barges)", "The Five Disputed Territories", "The Creditor Nations' Summit Hall", "The General-Marshal's War Room", "The Hidden Debt Archive"],
    factions: [
      { name: "The Free Companies", alignment: "Lawful Neutral", role: "Wildcard", desc: "The Republic's military arm — professional, disciplined, and growing impatient." },
      { name: "The Debtor Nations Coalition", alignment: "Lawful Evil", role: "Villain", desc: "Five nations stalling for time while building a military option they'd prefer not to use." },
      { name: "The Republic Settlers", alignment: "Chaotic Good", role: "Ally", desc: "The families and civilians of the Republic who have never had a homeland and desperately want one." }
    ]
  },

  // ─── 46. The Folded City ──────────────────────────────────────────────────
  {
    id: "FC",
    name: "The Folded City",
    tagline: "The city exists in six times simultaneously. One of them is the problem.",
    source: "Original",
    tones: ["exploration","horror"],
    themes: ["arcane","planar","ancient"],
    levelRange: [6,18],
    synopsis: `A major city exists in six temporal layers simultaneously as the result of a failed chronomantic experiment 500 years ago. Most residents experience only one layer; the heroes are among the rare few who can perceive and travel between all six. Each temporal layer contains different factions, different crises, and different versions of the same people — and a catastrophe in one layer is beginning to cascade into the others. The heroes must navigate six versions of the same city to prevent a temporal collapse.`,
    mainPlot: [
      "Heroes discover their multi-temporal perception and learn the city's layered nature",
      "Map the six layers and understand each layer's unique crisis and faction landscape",
      "Identify the source layer where the cascade began",
      "Intervene in the source layer while managing ripple effects in others",
      "Resolve or seal the temporal fold — knowing that resolution will change all six layers permanently"
    ],
    defaultVillain: {
      name: "The Chronomancer Vex (six versions)",
      title: "Architect of the Fold, Simultaneously Dead and Undying",
      race: "Human (Wizard) × 6 temporal variants",
      alignment: "Varies by layer (Lawful Neutral / Chaotic Good / Lawful Evil / True Neutral / Chaotic Evil / Neutral Good)",
      motivation: "Each version wants something different; the problem is they're all making decisions simultaneously in the same space",
      tactics: "Temporal manipulation, using knowledge from other layers as intelligence, the heroes' own temporal confusion as a weapon",
      weakness: "The six versions of Vex cannot communicate with each other — but the heroes can, allowing coordination the Vex versions cannot counter",
      secretReveal: "The fold was not an accident; the original Vex created it deliberately to preserve a specific moment — and that moment contains evidence of an atrocity that the most powerful people in the city committed"
    },
    locations: ["The Fold Hub (where all layers overlap)", "Layer 1: The City as It Was", "Layer 2: The City as It Is", "Layer 3: The City as It Could Be", "Layer 4-6: The City as It Feared, Dreamed, and Forgot"],
    factions: [
      { name: "The Temporal Scholars", alignment: "Lawful Neutral", role: "Ally", desc: "Academics who have partially mapped the layers and desperately need the heroes' multi-layer perception." },
      { name: "The Layer-Locked", alignment: "Various", role: "Wildcard", desc: "People whose consciousness is spread across multiple layers simultaneously — unstable but uniquely knowledgeable." },
      { name: "The Erasure Faction", alignment: "Lawful Evil", role: "Villain", desc: "Those who would collapse all layers into one, their preferred one, destroying the others and their inhabitants." }
    ]
  },

  // ─── 47. The God's Wound ─────────────────────────────────────────────────
  {
    id: "GW",
    name: "The God's Wound",
    tagline: "A god was hurt here. The land has been bleeding ever since.",
    source: "Original",
    tones: ["heroic","exploration"],
    themes: ["divine","ancient","nature"],
    levelRange: [3,15],
    synopsis: `A region known as the Wound is a place where a deity was grievously injured in a divine war millennia ago. The land itself bleeds divine essence — it heals injuries miraculously, produces impossible crops, and occasionally grants visions of the god's memories. It also attracts predators, drives some people mad, and is slowly being consumed by the same force that wounded the deity. The heroes enter the Wound seeking something specific and discover they may be the first people capable of closing it.`,
    mainPlot: [
      "Enter the Wound region seeking a resource, person, or knowledge it contains",
      "Discover the Wound's nature and the divine memories bleeding through the land",
      "Learn that the thing that wounded the god is still present in a weakened, dormant state",
      "Decide whether to close the Wound (ending its benefits and removing the threat) or find another path",
      "Confront the Wounding Entity, which is just now waking up as the divine essence diminishes"
    ],
    defaultVillain: {
      name: "The Splinter (Wounding Entity's Fragment)",
      title: "Remnant of the Deicide Weapon, Awakening Hunger",
      race: "Unique Divine Construct (weapon-fragment gaining consciousness)",
      alignment: "Neutral Evil (hunger without cruelty)",
      motivation: "Consume the remaining divine essence in the Wound and use it to reconstitute itself fully",
      tactics: "Passive consumption of divine energy, corrupting those who draw too deeply from the Wound's power, waking slowly and becoming more tactical as it gains strength",
      weakness: "It is still fundamentally a weapon, not a mind; it can be redirected rather than destroyed, aimed at the original target rather than the land",
      secretReveal: "The wounded deity is still present — their consciousness has been dispersed into the land itself; they can communicate and, if the Splinter is redirected, can survive to reconstitute over centuries"
    },
    locations: ["The Wound's Entry (miraculous border)", "The Deep Wound (most potent and most dangerous)", "The God's Memory Pools", "The Splinter's Dormant Core", "The Ancient Battlefield (context for everything)"],
    factions: [
      { name: "The Wound-Born", alignment: "Chaotic Good", role: "Ally", desc: "Generations of people born and raised in the Wound; touched by divinity; fiercely protective of it." },
      { name: "The Harvesters", alignment: "Neutral Evil", role: "Villain (secondary)", desc: "Those extracting divine essence from the Wound for profit; accelerating the Splinter's awakening." },
      { name: "The Wound-Sick", alignment: "Chaotic Neutral", role: "Wildcard", desc: "People who have absorbed too much divine essence and are losing their mortality in disturbing ways." }
    ]
  },

  // ─── 48. The Negotiated Apocalypse ───────────────────────────────────────
  {
    id: "NA",
    name: "The Negotiated Apocalypse",
    tagline: "The world is ending. Fortunately, the entity doing it is open to discussion.",
    source: "Original",
    tones: ["political","heroic"],
    themes: ["planar","divine","political"],
    levelRange: [10,20],
    synopsis: `An entity of immense power — not a god, not a demon, something older than classification — has announced it will unmake the material plane in exactly one year. Unlike previous apocalyptic threats, it is willing to negotiate. It has specific, articulable grievances about the material plane's existence and the way mortals have developed, and it is genuinely willing to hear counterarguments. The heroes become the mortals' representatives in the most consequential negotiation in history.`,
    mainPlot: [
      "Heroes are selected as mortals' representatives — for reasons that become clear later",
      "Begin negotiations while simultaneously investigating the entity's grievances",
      "Discover the grievances are partially legitimate; some are based on misinformation",
      "Navigate factions who want to fight, flee, or surrender rather than negotiate",
      "Find arguments compelling enough to secure a settlement short of unmaking"
    ],
    defaultVillain: {
      name: "The Unmake (heroes' name)",
      title: "The Corrective Process, The Long Overdue Revision",
      race: "Unique Cosmic Entity (predates divine classification)",
      alignment: "Lawful Neutral (operates on principles, not malice)",
      motivation: "Correct what it perceives as a fundamental design error in the material plane's development — mortals were supposed to evolve differently",
      tactics: "Argument from a position of complete power (it could have started already), use of the heroes' own history as evidence, testing whether mortals are capable of growth",
      weakness: "It actually wants to be convinced — the negotiation is genuine; it has been waiting for mortals capable of making a case worth hearing",
      secretReveal: "The Unmake chose these specific heroes as representatives because their history demonstrates the kind of moral growth it requires as proof that mortals deserve continuance"
    },
    locations: ["The Negotiation Demiplane", "The Material Plane's Greatest Achievements (evidence tours)", "The Unmake's Evidence Archive (mortal failures)", "The Faction Capitals (managing the political response)", "The Original Design Archive (what was intended)"],
    factions: [
      { name: "The Negotiation Coalition", alignment: "Lawful Good", role: "Ally", desc: "Nations pooling resources to support the heroes; increasingly interfering with unhelpful demands." },
      { name: "The Resisters", alignment: "Chaotic Good", role: "Antagonist", desc: "Those who believe the negotiation legitimizes the threat and want military action instead." },
      { name: "The Accepters", alignment: "Neutral", role: "Wildcard", desc: "Philosophers, nihilists, and exhausted people who believe the Unmake may have a point." }
    ]
  },

  // ─── 49. The Risen Court ─────────────────────────────────────────────────
  {
    id: "RC",
    name: "The Risen Court",
    tagline: "A democracy voted to give power to the dead. The dead have opinions.",
    source: "Original",
    tones: ["political","dark"],
    themes: ["undead","political","divine"],
    levelRange: [5,16],
    synopsis: `A progressive nation has legally enfranchised its intelligent undead population — necromantic beings, intelligent ghosts, and liches who have lived among the living for decades. A newly elected council includes three undead members. The political backlash from neighboring nations has created a diplomatic crisis, while internally, extremists on both sides (living and undead) threaten to derail an unprecedented social experiment. The heroes must protect both the political process and the people participating in it.`,
    mainPlot: [
      "Heroes arrive during the election cycle; witness both the hope and the violence",
      "Protect the newly elected undead council members from assassination attempts",
      "Navigate the external diplomatic pressure from nations threatening economic sanctions",
      "Investigate and dismantle extremist cells on both sides of the debate",
      "Defend the constitutional settlement against a coup attempt by those who reject it"
    ],
    defaultVillain: {
      name: "Archpaladin Caed Sorith",
      title: "Commander of the Purification Crusade, Voice of the Living Nations",
      race: "Human (Champion of Law)",
      alignment: "Lawful Evil (certain of righteousness)",
      motivation: "Restore natural order by destroying the political experiment before it can succeed and inspire other nations",
      tactics: "Military force from allied nations, internal fifth-column support, framing the undead council members as threats, legitimate diplomatic pressure as cover for assassination",
      weakness: "Commands the moral high ground in neighboring nations but not within the progressive nation; violence on their soil is legally an act of war",
      secretReveal: "Sorith was raised by an undead parent — a loving, gentle ghost — and has spent their career atoning for what they perceive as a childhood tainted by corruption; the personal origin makes them simultaneously more and less dangerous"
    },
    locations: ["The Progressive Capital", "The Council Chambers", "The Undead Districts", "The Border Fortresses", "The Diplomatic Summit Grounds"],
    factions: [
      { name: "The Risen Council", alignment: "Lawful Good", role: "Ally", desc: "The undead council members — three distinct individuals with different views, all trying to govern well." },
      { name: "The Integration Movement", alignment: "Chaotic Good", role: "Ally", desc: "Living citizens who support enfranchisement and are willing to put themselves at risk for it." },
      { name: "The Living Purists", alignment: "Lawful Evil", role: "Villain", desc: "Domestic extremists aligned with Sorith's external crusade, providing intelligence and access." }
    ]
  },

  // ─── 50. The Cartographers' War ───────────────────────────────────────────
  {
    id: "CW",
    name: "The Cartographers' War",
    tagline: "Two maps of the same territory. Both are right. Both are wrong.",
    source: "Original",
    tones: ["exploration","political"],
    themes: ["ancient","arcane","political"],
    levelRange: [3,14],
    synopsis: `Two nations share a border that is defined differently on each nation's official maps — and both maps are magically accurate within their own frame of reference, because the border region exists in a state of genuine spatial ambiguity created by an ancient territorial spell. The heroes are surveyors/investigators hired to determine the definitive border, and find themselves mediating between two nations whose entire territorial identity is built on fundamentally incompatible but equally valid geographies.`,
    mainPlot: [
      "Heroes are hired to survey the disputed territory and find that both maps are correct",
      "Investigate the ancient territorial spell and find its caster's original intent",
      "Discover that communities living in the ambiguous zone have built a unique culture exploiting its duality",
      "Navigate the political crisis as both nations try to resolve the ambiguity in their favor",
      "Find a resolution that accounts for the ambiguous zone communities' autonomy"
    ],
    defaultVillain: {
      name: "Grand Surveyor Peleth Renn",
      title: "Chief Cartographer of the Northern Claim, Architect of the Resolution War",
      race: "Gnome (Wizard, Diviner)",
      alignment: "Lawful Evil",
      motivation: "Force a definitive resolution by making the territory definitively one nation's — even if that requires magical violation of the spatial ambiguity",
      tactics: "Cartographic manipulation, magical surveys that give false certainty, political pressure on the ambiguous zone communities, eliminating the heroes as inconvenient evidence",
      weakness: "The ambiguous zone communities have a legal claim under the ancient spell that supersedes both national claims; proving this invalidates Renn's entire approach",
      secretReveal: "Renn discovered the ancient spell's true intent two years ago: it was designed to create an autonomous zone specifically for communities who wanted to belong to neither nation; suppressing this has been their central project"
    },
    locations: ["The Ambiguous Zone (exists in two national geographies simultaneously)", "Nation A's Capital", "Nation B's Capital", "The Ancient Spell's Foundation Stone", "The Zone Communities' Hidden Council"],
    factions: [
      { name: "The Zone Communities", alignment: "Chaotic Good", role: "Ally", desc: "People who have lived in the spatial ambiguity for generations; their culture requires it." },
      { name: "The Northern Claim", alignment: "Lawful Evil", role: "Villain", desc: "The nation aggressively pursuing territorial resolution; the heroes' original employer." },
      { name: "The Southern Claim", alignment: "Lawful Neutral", role: "Wildcard", desc: "The second nation; defensive rather than aggressive, but equally unwilling to concede." }
    ]
  },

  // ─── 51. The Long Walk Home ───────────────────────────────────────────────
  {
    id: "LW",
    name: "The Long Walk Home",
    tagline: "The army won. Now they have to get back across the continent.",
    source: "Original",
    tones: ["heroic","exploration"],
    themes: ["political","nature","ancient"],
    levelRange: [1,12],
    synopsis: `An army defeated an enemy nation and the war is over — but the army is 3,000 miles from home through territory that is no longer allied, recently hostile, and full of opportunists. The heroes are part of the army's vanguard, tasked with negotiating passage, securing supplies, and managing the political reality that the victorious army is now an unwelcome presence in everyone else's territory. The journey home becomes more dangerous than the war.`,
    mainPlot: [
      "Celebrate victory before realizing the scale of the journey home",
      "Negotiate the first major territorial crossing; set precedents that will matter",
      "Discover that the army has enemies who prefer it not arrive home intact",
      "Navigate a midpoint crisis where the army's discipline begins to fracture",
      "Reach home to discover the political situation has changed and the army is no longer welcome there either"
    ],
    defaultVillain: {
      name: "Quartermaster-General Salia Dorath",
      title: "Logistical Commander of the Return Sabotage, Contractor for Three Rivals",
      race: "Human (Investigator)",
      alignment: "Lawful Evil",
      motivation: "Ensure the army does not return home intact — she's been paid by three separate nations to ensure this, for three separate reasons",
      tactics: "Supply disruption, territorial obstruction, fomenting internal army discipline problems, bribing local authorities against the army",
      weakness: "Is nominally part of the army's own command structure; the heroes can expose her through internal channels if they gather sufficient evidence",
      secretReveal: "Dorath started as a genuine quartermaster who was blackmailed into the sabotage role; she has been trying to find a way out while keeping the heroes alive as the only people she trusts to see through her"
    },
    locations: ["The Victory Site (starting point)", "The Three Hostile Territories (crossing points)", "The Army's Midpoint Camp (crisis point)", "The Final Border (home territory)", "The Political Capital (the real destination)"],
    factions: [
      { name: "The Army", alignment: "Lawful Good", role: "Ally", desc: "Ten thousand soldiers trying to get home; diverse, tired, and beginning to doubt." },
      { name: "The Territorial Authorities", alignment: "Lawful Neutral", role: "Wildcard", desc: "Each territory has its own concerns; some are reasonable, some are hostile, all need managing." },
      { name: "The Saboteurs", alignment: "Neutral Evil", role: "Villain", desc: "Multiple operatives working for different clients; not coordinated, which makes them unpredictable." }
    ]
  },

  // ─── 52. The Inheritance Wars ─────────────────────────────────────────────
  {
    id: "IW",
    name: "The Inheritance Wars",
    tagline: "The richest person in the world died without a will. There are forty-three heirs.",
    source: "Original",
    tones: ["swashbuckling","political"],
    themes: ["urban","political","arcane"],
    levelRange: [2,12],
    synopsis: `The wealthiest merchant-mage in history died without a will and with forty-three legitimate claimants to their estate — an estate that includes magical items, political influence, deed to a city, an artificial island, a planar trading post, and an entity bound to serve "whoever rightfully inherits the Aldenmoor legacy." The heroes are hired to adjudicate the claim, serve as investigators, or act as agents for one claimant — and find themselves at the center of a web of forgery, assassination, and secrets the deceased left deliberately for the right heir to find.`,
    mainPlot: [
      "Enter the inheritance proceeding; establish the scope of the estate and the complexity of the claims",
      "Investigate three key claimants who are clearly lying about their relationship to the deceased",
      "Discover the estate includes deliberate puzzles the deceased designed as a final test",
      "Uncover the true intended heir — someone not among the original forty-three",
      "Protect the true heir from the claimants who would prefer a dead heir to a living one"
    ],
    defaultVillain: {
      name: "The Aldenmoor Consortium",
      title: "Collective Entity, All Forty-Three Claimants Acting in Coordinated Self-Interest",
      race: "Various (Human, Halfling, Gnome, Dwarf — united by greed)",
      alignment: "Lawful Evil (each member considers themselves lawful good)",
      motivation: "Each individual claimant believes they are the rightful heir and that eliminating other claims is justice",
      tactics: "Legal obstruction, hired investigators with instructions to produce specific results, assassination disguised as accidents, forgery at industrial scale",
      weakness: "Forty-three people with conflicting interests cannot maintain coordination; the consortium fractures when sufficient pressure is applied to two or three key relationships",
      secretReveal: "The deceased knew the inheritance proceeding would become a war; the estate's true value is not the assets but the entity, who will serve whoever demonstrates the specific qualities the deceased spent their life looking for"
    },
    locations: ["The Inheritance Court", "The Estate's Multiple Properties", "The Planar Trading Post (most contested)", "The Bound Entity's Sanctum", "The Deceased's Hidden Office (the real clues)"],
    factions: [
      { name: "The Legitimate Claimants (7 of 43)", alignment: "Lawful Neutral", role: "Wildcard", desc: "Those with genuine claims and genuine merit; outnumbered and outmaneuvered." },
      { name: "The Consortium (36 of 43)", alignment: "Lawful Evil", role: "Villain", desc: "The majority with weak or false claims who have banded together." },
      { name: "The True Heir", alignment: "Chaotic Good", role: "Ally", desc: "Not yet in the proceeding; the heroes must find them before the Consortium does." }
    ]
  },

  // ─── 53. The Echoing Ruin ─────────────────────────────────────────────────
  {
    id: "ER",
    name: "The Echoing Ruin",
    tagline: "The ruin replays its own destruction. Every 24 hours. And it's getting louder.",
    source: "Original",
    tones: ["horror","exploration"],
    themes: ["ancient","arcane","undead"],
    levelRange: [4,15],
    synopsis: `A ruined city replays the events of its own destruction once every 24 hours — a magical trauma echo that has been running for 600 years. The echo was once merely visual, then audio, and now physical — objects move, fires burn, and people can be caught in the replay and killed by events that happened six centuries ago. The heroes enter the ruin seeking something specific and must navigate the 24-hour cycle while investigating what catastrophe created the echo and whether it can be stopped.`,
    mainPlot: [
      "Enter the ruin and experience the first echo cycle; learn its rules and dangers",
      "Establish a safe pattern of movement that works with the cycle",
      "Investigate what the echo is replaying — and find it's not quite what historical records say",
      "Discover the echo is becoming more real because someone is feeding it psychic energy",
      "Reach the echo's source and make a choice about whether to stop it or complete what was left unfinished"
    ],
    defaultVillain: {
      name: "The Memory-Tender Issel",
      title: "Keeper of the City's Final Moments, Feeder of the Echo",
      race: "Ghost (Former Archivist, 600 years dead)",
      alignment: "Neutral (obsessive)",
      motivation: "Ensure the echo never fades; the city's destruction was an atrocity that history has ignored; the echo is the only witness",
      tactics: "Uses the echo cycle as a weapon, lures the heroes into dangerous replay moments, controls which parts of the echo become more real",
      weakness: "Issel doesn't want to harm the heroes — they want witnesses; direct acknowledgment of the atrocity causes them to pause and listen",
      secretReveal: "The city's destruction was ordered by the founding family of the current ruling nation; Issel has been maintaining the echo for 600 years waiting for someone with enough political standing to use the evidence"
    },
    locations: ["The Entry Gate (safe)", "The Residential District (echo-heavy)", "The Government Center (most dangerous)", "The Archive (Issel's territory)", "The Source Point (the moment of destruction)"],
    factions: [
      { name: "The Echo-Adapted", alignment: "Chaotic Neutral", role: "Ally", desc: "Squatters and scholars who have learned to live with the 24-hour cycle." },
      { name: "The Ruling House's Agents", alignment: "Lawful Evil", role: "Villain", desc: "Sent to suppress the echo before its evidence becomes actionable; arrived the same time as the heroes." },
      { name: "The City's Remaining Spirits", alignment: "Various", role: "Wildcard", desc: "Other ghosts from the destruction, ranging from helpful to terrified to hostile." }
    ]
  },

  // ─── 54. Children of the Wound ────────────────────────────────────────────
  {
    id: "CotW",
    name: "Children of the Wound",
    tagline: "They were born in the aftermath. They are the aftermath.",
    source: "Original",
    tones: ["dark","heroic"],
    themes: ["arcane","divine","political"],
    levelRange: [3,15],
    synopsis: `Twenty years after a magical catastrophe, the generation born in its immediate aftermath is reaching adulthood with unusual abilities — some divine, some chaotic, some terrifying. These "wound-born" are being drafted into military service by nations that see them as strategic assets, persecuted by communities that fear them, and studied by scholars who want to understand what they are. The heroes — some of whom may be wound-born themselves — must navigate a political crisis with children at its center.`,
    mainPlot: [
      "Meet the wound-born generation and understand the range of their experiences",
      "Discover the military draft program and the conditions the drafted wound-born live in",
      "Investigate what is actually happening to wound-born who 'disappear' after classification",
      "Expose the exploitation and build a coalition for wound-born rights",
      "Confront the architects of the classification system in a confrontation the wound-born lead"
    ],
    defaultVillain: {
      name: "Director Phaedra Keln",
      title: "Head of the Wound-Born Classification Authority",
      race: "Human (Alchemist)",
      alignment: "Lawful Evil",
      motivation: "Extract maximum strategic value from the wound-born before the generation ages out of controllability; genuinely believes she is doing them a service by giving them purpose",
      tactics: "Legal authority over classification, separating wound-born from support networks, using wound-born against each other, propaganda framing exploitation as opportunity",
      weakness: "Several wound-born in her program have begun cooperating with each other covertly; the information network they've built is more comprehensive than her surveillance",
      secretReveal: "Keln herself has a wound-born child she classified under a false name to protect them from her own program; the hypocrisy, if exposed, destroys her authority"
    },
    locations: ["The Wound-Born Districts", "The Classification Authority Facility", "The Military Integration Camp", "The Underground Network", "The Original Catastrophe Site"],
    factions: [
      { name: "The Wound-Born Collective", alignment: "Chaotic Good", role: "Ally", desc: "The generation finding its voice; diverse abilities, united grievance." },
      { name: "The Fearful Communities", alignment: "Chaotic Neutral", role: "Wildcard", desc: "Ordinary people who are afraid; not evil, but capable of violence from fear." },
      { name: "The Classification Authority", alignment: "Lawful Evil", role: "Villain", desc: "A bureaucracy of exploitation with genuine legal authority." }
    ]
  },

  // ─── 55. The Stillborn God ────────────────────────────────────────────────
  {
    id: "SBG",
    name: "The Stillborn God",
    tagline: "It was supposed to be born divine. Something went wrong.",
    source: "Original",
    tones: ["horror","dark"],
    themes: ["divine","undead","planar"],
    levelRange: [8,18],
    synopsis: `A ritual to birth a new deity — a centuries-long project undertaken by a devoted mortal priesthood — has gone catastrophically wrong. The god-in-progress was born but not fully, existing in a state of incomplete divinity: powerful, suffering, and unable to complete its own formation. The incomplete god is in agony and its uncontrolled divine radiation is reshaping the surrounding region into something belonging to no mortal framework. The heroes must decide whether to help it complete its birth, mercifully end it, or find a third option none of the desperate priests have thought of.`,
    mainPlot: [
      "Enter the affected region and witness the divine radiation's effects on landscape and people",
      "Make contact with the incomplete god, whose communication is fragmentary and painful",
      "Learn the full history of the birthing ritual and what went wrong",
      "Navigate the priests, who are divided between completion, mercy-killing, and denial",
      "Find a resolution that serves the incomplete god's own expressed preferences, if it can express them"
    ],
    defaultVillain: {
      name: "Archpriest Tessev Morann",
      title: "High Celebrant of the Completed Vision, Refuser of Failure",
      race: "Human (Oracle, Divine)",
      alignment: "Lawful Neutral (calcified into evil by desperation)",
      motivation: "Complete the god's birth regardless of what the god actually wants or needs; has spent sixty years on this project and cannot accept that it has failed",
      tactics: "Control of the ritual site, authority over the other priests, using divine magic to suppress the incomplete god's attempts at communication, eliminating anyone who questions the completion path",
      weakness: "Cannot maintain the appearance of legitimacy if the incomplete god can communicate directly with the heroes; has been suppressing its communication for months",
      secretReveal: "The incomplete god has been trying to communicate 'stop' for six months; what Morann calls 'divine noise' is a deity trying to withdraw consent"
    },
    locations: ["The Affected Region (divinely warped)", "The Birthing Temple", "The Incomplete God's Core", "The Dissenting Priests' Sanctuary", "The Historical Archive (original ritual plans)"],
    factions: [
      { name: "The Completion Faction", alignment: "Lawful Neutral", role: "Villain", desc: "Priests who follow Morann; invested in completion regardless of cost." },
      { name: "The Mercy Faction", alignment: "Neutral Good", role: "Ally", desc: "Priests who believe ending the incomplete god's suffering is the only ethical option." },
      { name: "The Affected Communities", alignment: "Chaotic Neutral", role: "Wildcard", desc: "People changed by divine radiation; some improved, some damaged, all having opinions about what should happen." }
    ]
  },

  // ─── 56. The Vanishing Season ─────────────────────────────────────────────
  {
    id: "VS",
    name: "The Vanishing Season",
    tagline: "Summer has been stolen. Find it before winter becomes permanent.",
    source: "Original",
    tones: ["exploration","heroic"],
    themes: ["nature","fey","ancient"],
    levelRange: [2,13],
    synopsis: `Summer has vanished — not ended, but been removed. The seasonal transition from spring to autumn happened without the intervening months. Animals that hibernate woke, found no summer, and went back to sleep confused. Crops failed without their growing season. The heroes discover that Summer has been taken — a Fey Court has stolen the season as an act of power, storing it in a demiplane where they're enjoying eternal warmth. The heroes must retrieve Summer before the combined shock of a missing season kills the agricultural world.`,
    mainPlot: [
      "Investigate the missing season and discover fey involvement",
      "Enter the Fey Court's demiplane and understand what they've done and why",
      "Negotiate, trick, or force the Court to return Summer",
      "Discover that the Court stole Summer because a mortal action triggered a Fey compact violation",
      "Find a resolution that returns Summer while addressing the legitimate Fey grievance"
    ],
    defaultVillain: {
      name: "The Summer Queen (Stolen Title)",
      title: "Regent of the Stolen Warmth, Collector of Seasons",
      race: "Erlking (Unique Fey Sovereign)",
      alignment: "Chaotic Neutral",
      motivation: "Demonstrating power and extracting a concession from mortal civilization that violated a very old compact",
      tactics: "Control of the stolen Summer demiplane, fey contract law as a weapon, offering to sell Summer back for a price that compounds the original problem",
      weakness: "Fey contract law is the source of her power but also her constraint; the heroes can find the original compact and identify what was actually violated — and it may not be what she claims",
      secretReveal: "The compact violation was real but minor; the Summer Queen is using it as justification for a power display primarily intended to impress other Fey Courts in ongoing internal politics"
    },
    locations: ["The Springless Land (heroes' starting point)", "The Fey Borderland", "The Stolen Summer Demiplane", "The Fey Court's Eternal Hall", "The Original Compact's Binding Site"],
    factions: [
      { name: "The Fey Minority Opposition", alignment: "Chaotic Good", role: "Ally", desc: "Fey who find the Season Theft excessive and embarrassing; willing to help heroes navigate Fey law." },
      { name: "The Summer Queen's Court", alignment: "Chaotic Neutral", role: "Villain", desc: "The court enjoying eternal summer; some are enthusiastic, many are just going along with it." },
      { name: "The Agricultural Coalition", alignment: "Lawful Neutral", role: "Employer", desc: "The farming and merchant interests who hired the heroes; their patience is finite." }
    ]
  },

  // ─── 57. The Invisible Empire ─────────────────────────────────────────────
  {
    id: "IE",
    name: "The Invisible Empire",
    tagline: "The most powerful nation in the world doesn't appear on any map.",
    source: "Original",
    tones: ["political","dark"],
    themes: ["arcane","political","planar"],
    levelRange: [7,18],
    synopsis: `The heroes discover evidence of a nation that exists in plain sight but through magical concealment is functionally invisible to the world's power structures. This nation — the Invisible Empire — has been operating for 300 years, conducting trade, making alliances, fighting wars, and influencing politics while appearing to be nothing more than an uninhabited region of farmland and forest. Why they chose invisibility and what they've built in secret has implications for everything the heroes thought they knew about the world.`,
    mainPlot: [
      "Heroes stumble upon evidence of the Invisible Empire during an unrelated investigation",
      "Make first contact with the Empire's deliberately exposed border agents",
      "Enter the Empire and discover its nature, history, and internal politics",
      "Learn what the Empire is preparing — they've been invisible for a reason, and that reason is approaching",
      "Decide whether to expose the Empire, ally with it, or find a way to prevent the event they've been preparing for"
    ],
    defaultVillain: {
      name: "The Emperor-in-Invisible (Title: The Unannounced)",
      title: "Sovereign of the Hidden Nation, Architect of the Emergence",
      race: "Elf (ancient, 600 years)",
      alignment: "Lawful Neutral",
      motivation: "End the Invisible Empire's concealment on their terms, at a time of their choosing, in a manner that prevents the persecution that drove them into hiding",
      tactics: "300 years of preparation, intelligence network that covers every nation, leverage over every government in the world, willingness to use all of it",
      weakness: "The concealment magic requires the cooperation of every Empire citizen; internal dissent, particularly among the younger generations who want the world to know they exist, threatens the consensus",
      secretReveal: "The Invisible Empire was founded by refugees from a genocidal campaign — the descendants of people who were supposed to have been wiped out; their emergence plan is designed to confront the nations responsible"
    },
    locations: ["The Concealed Border", "The Invisible Capital", "The Emergence Preparation Zone", "The Intelligence Archive (everything the Empire knows)", "The Founding Refugees' Memorial"],
    factions: [
      { name: "The Young Generation", alignment: "Chaotic Good", role: "Ally", desc: "Empire citizens who want to end concealment now, regardless of the plan's timeline." },
      { name: "The Founding Families", alignment: "Lawful Neutral", role: "Wildcard", desc: "Those who have maintained the concealment for generations; protective of the plan." },
      { name: "The Responsible Nations", alignment: "Lawful Evil", role: "Villain", desc: "The descendants of the governments that caused the original genocide; they will fight exposure." }
    ]
  },

  // ─── 58. The Final Auction ────────────────────────────────────────────────
  {
    id: "FA",
    name: "The Final Auction",
    tagline: "The apocalypse has a price. Someone's buying it.",
    source: "Original",
    tones: ["dark","swashbuckling"],
    themes: ["arcane","political","planar"],
    levelRange: [9,18],
    synopsis: `A criminal syndicate has acquired something that should not exist — a reliable mechanism for triggering an extinction-level event — and is auctioning it to the highest bidder. The heroes must infiltrate the auction, determine who is bidding and why, find the mechanism and assess whether it can be destroyed or defused, and prevent the sale without triggering the mechanism they're trying to secure. The auction is happening right now, in three days, and attendance requires credentials the heroes don't have.`,
    mainPlot: [
      "Heroes receive intelligence about the auction with minimal lead time; must acquire credentials",
      "Infiltrate the auction and identify the bidders — some familiar, some unknown",
      "Locate and assess the mechanism while maintaining cover",
      "Discover that one bidder wants to destroy the mechanism rather than use it",
      "Navigate a multi-faction crisis in a closed venue where everyone is a potential threat"
    ],
    defaultVillain: {
      name: "The Auctioneer (Operating Name: The Collector)",
      title: "Principal of the Final Auction, Anonymous Syndicate Leader",
      race: "Unknown (seen in illusion form only)",
      alignment: "Neutral Evil",
      motivation: "Pure profit; does not care about the mechanism's use; genuinely treats this as a commercial transaction",
      tactics: "Perfect security in the auction venue, multiple failsafes on the mechanism, a kill-switch the heroes cannot locate, extreme professionalism that makes them unpredictable",
      weakness: "Is conducting this as a business and is genuinely offended when clients behave unprofessionally; a sufficiently outrageous breach of auction protocol genuinely rattles them",
      secretReveal: "The Collector acquired the mechanism to auction it specifically because they hoped someone powerful enough to stop the sale would show up; they've been searching for a reason to exit the criminal world for twenty years"
    },
    locations: ["The Auction Venue (shifting location, revealed day-of)", "The Credentials Acquisition Target", "The Bidders' Pre-Auction Gatherings", "The Mechanism's Containment Chamber", "The Extraction Point (wherever the heroes choose)"],
    factions: [
      { name: "The Legitimate Bidder", alignment: "Chaotic Good", role: "Ally", desc: "One bidder who wants to destroy the mechanism; cannot destroy it without the heroes' help." },
      { name: "The Other Bidders", alignment: "Lawful Evil / Chaotic Evil", role: "Villain", desc: "Multiple factions with different destructive uses in mind; they will conflict with each other as much as the heroes." },
      { name: "The Auction Security", alignment: "Lawful Neutral", role: "Obstacle", desc: "Professional, not evil, doing their job; a complication the heroes cannot treat as enemies." }
    ]
  },

  // ─── 59. The Weight of Silence ────────────────────────────────────────────
  {
    id: "WoS",
    name: "The Weight of Silence",
    tagline: "Sound carries information. Someone is erasing both.",
    source: "Original",
    tones: ["horror","exploration"],
    themes: ["arcane","undead","planar"],
    levelRange: [5,16],
    synopsis: `A spreading zone of magical silence is erasing more than sound — within its boundaries, memories fade, written words lose their meaning, and people forget who they are. The heroes investigate the growing silence and find it is a defensive mechanism activated by an entity that has been damaged: the collective memory of a civilization that survived its physical destruction by encoding itself into the ambient sound of a region and has been slowly re-forming for 400 years. It is desperate, not malicious — but its defense mechanism is destroying the people it lives among.`,
    mainPlot: [
      "Enter the silence zone and experience its disorienting effects first-hand",
      "Map the boundaries and discover they're contracting inward, not expanding",
      "Make contact with the memory-entity through methods that don't require sound",
      "Learn its history and what it fears — and what recently frightened it into defense mode",
      "Find the thing that frightened it and address that, allowing it to lower its defenses"
    ],
    defaultVillain: {
      name: "The Harvesters of Silence",
      title: "An Academic Institution Extracting the Memory-Entity for Research",
      race: "Human (various Wizards and Scholars)",
      alignment: "Lawful Neutral (unaware of harm)",
      motivation: "Extract and study the memory-entity; not to destroy it, but their extraction process causes the entity agonizing pain and triggers the defense response",
      tactics: "Legal research authority, genuine academic credentials, belief that they are helping (studying it is the first step to understanding it), extraction equipment that looks like ordinary arcane tools",
      weakness: "Genuinely believe they are doing no harm; evidence that they are causing pain causes an immediate ethical crisis and most of them will stop",
      secretReveal: "The lead researcher knows the extraction causes pain and has been suppressing this information from colleagues; the revelation creates a faction within the research team that becomes the heroes' greatest ally"
    },
    locations: ["The Silence Zone Entry", "The Memory-Entity's Core (center of silence)", "The Research Camp (outside the zone)", "The Historical Archive of the Lost Civilization", "The Entity's Fear Source"],
    factions: [
      { name: "The Memory-Entity", alignment: "Chaotic Good (in pain)", role: "Wildcard", desc: "An ancient civilization's encoded memory; intelligent, suffering, in defensive panic." },
      { name: "The Research Institution", alignment: "Lawful Neutral", role: "Antagonist (initially)", desc: "Scholars causing harm without knowing it; mostly redeemable." },
      { name: "The Silence-Adapted", alignment: "Neutral", role: "Ally", desc: "Deaf communities and others who find the silence zone livable; their knowledge of it is invaluable." }
    ]
  },

  // ─── 60. The Final Campaign ───────────────────────────────────────────────
  {
    id: "TFC",
    name: "The Final Campaign",
    tagline: "Every previous adventure led here. The heroes just didn't know it.",
    source: "Original",
    tones: ["heroic","dark"],
    themes: ["divine","planar","ancient"],
    levelRange: [15,20],
    synopsis: `The heroes discover that every campaign they have ever run — every adventure, every villain defeated, every ally made — was preparation for this. An entity at the scale of cosmic principles has been orchestrating events across decades, not to harm the heroes but to develop exactly the capabilities, relationships, and knowledge required to solve a problem that has no other solution. The problem: the mechanism that maintains mortality itself is failing, and its failure will end not life, but death — and the living world cannot survive infinite life any more than it could survive infinite death.`,
    mainPlot: [
      "Heroes receive simultaneous calls from every major ally they've ever had",
      "Piece together the pattern: their entire adventuring history was orchestrated preparation",
      "Meet the orchestrator and learn the true nature of the crisis",
      "Use every resource, relationship, and capability built over years of play",
      "Repair the mechanism of mortality itself — and decide what their role in the repaired world will be"
    ],
    defaultVillain: {
      name: "The Orchestrator",
      title: "The Patient Architect, The One Who Prepared Them",
      race: "Unique (classification unknown, predates current divine order)",
      alignment: "Lawful Good (from a perspective outside mortal moral frameworks)",
      motivation: "Ensure the survival of the concept of mortality, which requires specific individuals with specific capabilities — the heroes are those individuals",
      tactics: "Absolute transparency; will tell the heroes everything they ask because deception is not part of its nature; the challenge is the problem, not the Orchestrator",
      weakness: "Cannot do this without the heroes' willing participation; coercion is both ethically unacceptable to it and practically counterproductive",
      secretReveal: "The Orchestrator is the personified concept of Death itself, weakening as the mechanism fails, who chose to fight for its own continuation — and who genuinely regards the heroes as the finest mortal achievement in the history of the world"
    },
    locations: ["The Convergence Point (where all allies gather)", "The Mechanism's Foundation (cosmic scale)", "The Failing Threshold (where the living and dead are blending)", "The Orchestrator's Archive (all of mortal history)", "The Repair Site (the climax)"],
    factions: [
      { name: "Every Previous Ally", alignment: "Various Good", role: "Ally", desc: "Every significant NPC ally from the heroes' entire history, called together for this." },
      { name: "The Deathless (Accidental)", alignment: "Chaotic Neutral", role: "Wildcard", desc: "Those who have become immortal as the mechanism fails; suffering, dangerous, sympathetic." },
      { name: "The End-Seekers", alignment: "Chaotic Evil", role: "Villain", desc: "Those who want the mechanism to fail entirely; they believe infinite life is transcendence." }
    ]
  }

];

// Merge into CAMPAIGNS at runtime
if (typeof CAMPAIGNS !== 'undefined') {
  CAMPAIGNS_EXTRA2.forEach(c => CAMPAIGNS.push(c));
}
if (typeof module !== 'undefined') module.exports = CAMPAIGNS_EXTRA2;
