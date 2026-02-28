/**
 * data/campaigns.js
 * 20 unique campaign seeds inspired by major Paizo Adventure Paths.
 * Each entry is a complete campaign framework that can be fully generated.
 */

const CAMPAIGNS = [
  // ─── 1. Age of Ashes ───────────────────────────────────────────────────────
  {
    id: "AoA",
    name: "Embers of the Fallen Throne",
    tagline: "Ancient fires rekindle beneath a shattered empire's bones.",
    source: "Age of Ashes",
    tones: ["heroic","exploration"],
    themes: ["ancient","arcane","planar"],
    levelRange: [1,20],
    synopsis: `A ruined fortress atop a dormant volcano conceals a network of magical portals leading to far-flung corners of Golarion. As the heroes investigate reports of cultists and refugees emerging from the collapsed stronghold, they uncover a sinister plot to resurrect an empire built on draconic slavery — and discover that the portals connect to a planar crossroads that could be used to collapse the boundaries between worlds.`,
    mainPlot: [
      "Heroes respond to distress signals from a besieged hilltop keep",
      "Investigate the portal network hidden beneath the ruins",
      "Race across multiple continents and planes to seal breached portals",
      "Confront the architect of the draconic rebirth plot in a climactic showdown",
      "Decide the fate of the portal network — destroy or repurpose it"
    ],
    defaultVillain: {
      name: "Veskaroth the Undying",
      title: "Dragon-Ascendant, Former Warlord of the Embervast Conclave",
      race: "Red Dragon (Ancient)",
      alignment: "Lawful Evil",
      motivation: "Restore the Embervast Empire under draconic dominion, using resurrected dragon-bound warriors",
      tactics: "Commands fanatical cultists; uses portal network for strategic ambushes; breathes transmuted arcane fire",
      weakness: "Bound to the original forge-seal; destroying it strips centuries of accumulated power",
      secretReveal: "Veskaroth was once a mortal warlord who voluntarily merged with a dragon's spirit to survive a losing war"
    },
    locations: ["Breachill Village", "Fortress Klazkoth", "Huntergate Portal Nexus", "Alseta's Ring", "Dahak's Sanctum"],
    factions: [
      { name: "Ashes Guild", alignment: "Neutral Good", role: "Ally", desc: "Local adventurers based in Breachill who discover the threat alongside the heroes." },
      { name: "Embervast Reborn", alignment: "Lawful Evil", role: "Villain", desc: "Cultists devoted to resurrecting the dragon empire." },
      { name: "Mwangi Sovereignty", alignment: "Chaotic Neutral", role: "Wildcard", desc: "Jungle nation with its own claims on the portal network." }
    ]
  },

  // ─── 2. Extinction Curse ───────────────────────────────────────────────────
  {
    id: "EC",
    name: "The Last Circus of Kortos",
    tagline: "Beneath the sequined spectacle, an extinction-level conspiracy unfolds.",
    source: "Extinction Curse",
    tones: ["swashbuckling","dark"],
    themes: ["nature","ancient","divine"],
    levelRange: [1,20],
    synopsis: `The heroes inherit a struggling traveling circus following the mysterious death of its ringmaster. As they tour the Isle of Kortos, they unravel a conspiracy of cyclopean cultists bent on awakening a primal titan that slumbers beneath the island — a creature whose awakening would trigger a cascade of extinction events rippling outward from Absalom.`,
    mainPlot: [
      "Take ownership of Circus Shadowfell after the ringmaster vanishes",
      "Discover the ringmaster was investigating cyclopean ruins",
      "Tour the island while gathering allies and evidence",
      "Breach the Outer Seal protecting the titan's prison",
      "Face the Titan's Herald before the creature fully awakens"
    ],
    defaultVillain: {
      name: "Xanthoria the Eclipsed Eye",
      title: "High Seer of the Forgotten Pantheon, First Witch of Kortos",
      race: "Cyclopean Oracle (Undead)",
      alignment: "Neutral Evil",
      motivation: "Awaken the Extinction Titan to 'cleanse' Golarion of what she views as a failed mortal experiment",
      tactics: "Commands armies of xulgaths; uses prophetic visions to anticipate hero movements; entraps souls in crystallized prophecy",
      weakness: "Her prophecy-sight is blind to creatures with no destiny — orphans, exiles, the forgotten",
      secretReveal: "She was once a blind mortal whom the titan 'gifted' with sight — she has been its prisoner since she first opened her new eye"
    },
    locations: ["Escadar", "Kortos Mounts", "Lost Temple of Aroden", "Deepmarket Ruins", "Titan's Cradle"],
    factions: [
      { name: "Circus Troupe", alignment: "Neutral Good", role: "Ally", desc: "The heroes' own performers — acrobats, fire-breathers, animal trainers." },
      { name: "Xulgath Legions", alignment: "Chaotic Evil", role: "Villain", desc: "Subterranean lizardfolk awaiting the titan's awakening." },
      { name: "Pathfinder Society", alignment: "Neutral", role: "Ally (conditional)", desc: "Will help if the heroes share their findings." }
    ]
  },

  // ─── 3. Agents of Edgewatch ────────────────────────────────────────────────
  {
    id: "AoE",
    name: "The Edgewatch Protocols",
    tagline: "Absolute security demands absolute corruption.",
    source: "Agents of Edgewatch",
    tones: ["political","dark"],
    themes: ["urban","political"],
    levelRange: [1,20],
    synopsis: `During the centennial Radiant Festival, the heroes are deputized as special agents of Absalom's Edgewatch division. What begins as crowd control and petty crime investigation spirals into an escalating investigation of a shadow syndicate using the festival as cover for a coup — one that reaches all the way to the city's High Council.`,
    mainPlot: [
      "Deputized as Edgewatch officers; investigate festival crimes",
      "Expose a serial killer operating among festival workers",
      "Trace murders to a criminal syndicate with political connections",
      "Navigate a conspiracy that implicates the Prismatic Ray guard",
      "Storm the seat of power before the coup is cemented at midnight"
    ],
    defaultVillain: {
      name: "Inquisitor-General Aldara Kast",
      title: "Director of the Radiant Council's Secret Compliance Bureau",
      race: "Human Vigilante (Rogue Archetype)",
      alignment: "Lawful Evil",
      motivation: "Create an 'ideal' Absalom through complete surveillance and elimination of perceived threats to stability",
      tactics: "Controls information networks; plants agents in every major faction; uses legal authority to prosecute heroes if they get too close",
      weakness: "Her documentation of her own crimes — she records everything, convinced she is justified",
      secretReveal: "She was once a genuine reformer, broken by watching a corrupt council acquit a murderer she had spent years pursuing"
    },
    locations: ["Absalom Grand Coliseum", "Radiant Festival Grounds", "Low Azlant District", "Edgewatch Headquarters", "The Silent Court"],
    factions: [
      { name: "Edgewatch Division", alignment: "Lawful Neutral", role: "Employer/Ally", desc: "The heroes' organization; increasingly compromised as the investigation deepens." },
      { name: "Radiant Council", alignment: "Lawful Evil", role: "Villain", desc: "Ostensibly Absalom's governing council; secretly running the coup." },
      { name: "Festival Workers Union", alignment: "Neutral Good", role: "Ally", desc: "Working-class witnesses with crucial information they're afraid to share." }
    ]
  },

  // ─── 4. Strength of Thousands ──────────────────────────────────────────────
  {
    id: "SoT",
    name: "The Magaambya Accord",
    tagline: "Knowledge is power. But some power must never be uncaged.",
    source: "Strength of Thousands",
    tones: ["exploration","political"],
    themes: ["arcane","ancient","nature"],
    levelRange: [1,20],
    synopsis: `The heroes enroll in the Magaambya, the world's oldest magical academy nestled in the Mwangi Expanse. Over years of study and field work, they rise through the institution's ranks while battling an ancient predatory entity that feeds on magical knowledge — one that has been slowly infiltrating the school's faculty for generations.`,
    mainPlot: [
      "Enter the Magaambya as initiates; form bonds and rivalries",
      "Field expeditions reveal magical corruption spreading through the jungle",
      "Discover a faculty member is unwittingly channeling an elder entity",
      "Race to uncover the entity's origin in pre-Earthfall ruins",
      "Sever the entity's anchor to the school before it consumes all accumulated knowledge"
    ],
    defaultVillain: {
      name: "The Nameless Hunger / Ixomanthis",
      title: "The Devourer-Between-Letters, Elder Entity of the Void Between Words",
      race: "Eldritch Entity (Unique)",
      alignment: "Chaotic Evil",
      motivation: "Consume all accumulated magical knowledge, leaving behind a world of ignorance it can rule from the spaces between thoughts",
      tactics: "Possesses scholars; corrupts magical texts; creates 'knowledge traps' that trap curious minds; can only be perceived by those it wants to be seen by",
      weakness: "Cannot comprehend creativity — improvised, newly-invented spells bypass its defenses",
      secretReveal: "The entity was accidentally created by the Magaambya's founder, Old-Mage Jatembe, as a byproduct of his greatest unfinished work"
    },
    locations: ["Nantambu", "Magaambya Campus", "Mwangi Expanse Wilderness", "Jatembe's Vault", "The Space Between Letters"],
    factions: [
      { name: "Magaambya Faculty", alignment: "Neutral Good", role: "Ally/Compromised", desc: "Ancient institution; some members unknowingly serve the entity." },
      { name: "Asp Consortium", alignment: "Neutral Evil", role: "Villain (secondary)", desc: "Corporate mages who want to monetize the school's knowledge." },
      { name: "Ten Magic Warriors Legacy", alignment: "Lawful Good", role: "Ally", desc: "Descendants of Jatembe's original students; hold ancient secrets." }
    ]
  },

  // ─── 5. Outlaws of Alkenstar ──────────────────────────────────────────────
  {
    id: "OoA",
    name: "Smoke & Gunpowder",
    tagline: "In the city where magic dies, only the clever survive.",
    source: "Outlaws of Alkenstar",
    tones: ["swashbuckling","dark"],
    themes: ["urban","political"],
    levelRange: [1,10],
    synopsis: `Framed for a crime they didn't commit in the magic-dead city of Alkenstar, the heroes must survive the city's gang wars, corrupt magistrates, and the wasteland beyond its walls — all while hunting down the crime boss who set them up and uncovering the true secret behind Alkenstar's spreading Mana Wastes.`,
    mainPlot: [
      "Wake up framed for murder; escape Alkenstar's cells",
      "Navigate competing crime families to build resources",
      "Investigate the spreading Mana Wastes consuming the city's edge",
      "Expose the crime boss's deal with a mutagen-dealing wasteland sorcerer",
      "Choose between destroying the Wastes' source or weaponizing it"
    ],
    defaultVillain: {
      name: "Grand Overseer Yara Vex",
      title: "Director of Alkenstar's Regulatory Authority, Lord of the Mana Wastes Trade",
      race: "Human Gunslinger/Rogue",
      alignment: "Lawful Evil",
      motivation: "Control Alkenstar's gunpowder monopoly by expanding the Mana Wastes — which destroy magic but leave firearms, her preferred weapon, unaffected",
      tactics: "Commands the city's legal apparatus; uses mutant monsters as enforcers; exploits the heroes' outlaw status to pursue them openly",
      weakness: "Her authority is entirely legal — expose her corruption to the right audience and her power evaporates overnight",
      secretReveal: "She was a Pathfinder who discovered the Wastes' expansion could be controlled and couldn't resist the power it offered"
    },
    locations: ["Alkenstar City", "The Shattered Mana Wastes", "Dongun Hold", "The Smokeworks", "Skullcross"],
    factions: [
      { name: "Alkenstar Guard", alignment: "Lawful Neutral", role: "Antagonist (initially)", desc: "Hunting the heroes; can be won over with evidence." },
      { name: "Smeltrunners Guild", alignment: "Chaotic Neutral", role: "Ally (mercenary)", desc: "Crime family opposed to the Grand Overseer." },
      { name: "Wasteland Tribes", alignment: "Neutral", role: "Wildcard", desc: "Mutant communities who know the true origin of the Wastes." }
    ]
  },

  // ─── 6. Blood Lords ───────────────────────────────────────────────────────
  {
    id: "BB2",
    name: "Lords of Eviscerated Crowns",
    tagline: "You don't have to be alive to crave power.",
    source: "Blood Lords",
    tones: ["dark","political"],
    themes: ["undead","political","arcane"],
    levelRange: [1,20],
    synopsis: `The heroes serve as agents rising through the ranks of Geb's undead-ruled nation, investigating a conspiracy that threatens to destabilize the delicate necrocratic order from within. As they gain power and prestige in a society where death is a promotion, they must decide what kind of lords they want to become.`,
    mainPlot: [
      "Begin as low-ranking agents of a minor Blood Lord",
      "Investigate political assassinations destabilizing the necrocracy",
      "Discover a rival Blood Lord is raising an unauthorized undead army",
      "Navigate the Court of Geb itself, dealing with ancient vampire politics",
      "Decide whether to support, reform, or overthrow the necrocratic government"
    ],
    defaultVillain: {
      name: "Blood Lord Ezerak the Hollowed",
      title: "Architect of the Final Harvest, Keeper of the Grave-Vault",
      race: "Lich (Former Wizard-Tyrant)",
      alignment: "Neutral Evil",
      motivation: "Achieve the 'perfect undead state' by consuming the life-force of every living being in Geb, creating an eternally stable nation of husks",
      tactics: "Political manipulation; controls a vast network of undead spies; can repossess any undead he created as sleeper agents",
      weakness: "His phylactery is a living, breathing human child he cannot bring himself to destroy — the last remnant of his mortal love",
      secretReveal: "He was once Geb's most devoted loyalist; turned to evil only after Geb sacrificed Ezerak's family to power a national spell"
    },
    locations: ["Mechitar", "Graydirge", "Axan Wood", "Palace of Geb", "The Eternal Ossuary"],
    factions: [
      { name: "The Blood Lords Council", alignment: "Lawful Evil", role: "Employer/Wildcard", desc: "Ancient vampires and liches who employ the heroes." },
      { name: "Living Resistance", alignment: "Chaotic Good", role: "Wildcard/Ally", desc: "Secret network of living people surviving in Geb." },
      { name: "Ezerak's Hollow Court", alignment: "Neutral Evil", role: "Villain", desc: "Undead nobles devoted to the Final Harvest." }
    ]
  },

  // ─── 7. Gatewalkers ───────────────────────────────────────────────────────
  {
    id: "GG",
    name: "The Amnesiac Constellation",
    tagline: "They all blacked out at the same moment. None of them are the same.",
    source: "Gatewalkers",
    tones: ["horror","exploration"],
    themes: ["planar","arcane","divine"],
    levelRange: [1,10],
    synopsis: `The heroes awaken with no memory of the previous night, strange new abilities they can't explain, and a shared vision of a distant star. As they investigate their shared blackout, they discover they were temporarily abducted to a gate-demiplane and returned changed — and the entity responsible has plans for them that they must unravel before it completes its cosmic design.`,
    mainPlot: [
      "Wake in the wilderness with memory gaps and strange powers",
      "Investigate the blackout; others in the region share the experience",
      "Discover a planar gate that opened above the region during the blackout",
      "Follow the trail through interplanar waypoints toward the source",
      "Confront the Gate-Weaver in its demiplane before it can use its 'chosen' to open a permanent rift"
    ],
    defaultVillain: {
      name: "The Constellation of Hungry Doors",
      title: "The Gate-Weaver, Unseen Cartographer of the Infinite Threshold",
      race: "Unique Outsider (Post-Divine Remnant)",
      alignment: "Chaotic Neutral",
      motivation: "Map every possible gate between every possible plane by sending 'chosen' mortals through them — without their consent",
      tactics: "Uses the heroes' new planar abilities against them; exists in all gate-adjacent spaces simultaneously; communicates only in memories",
      weakness: "Can only perceive beings who have passed through at least one gate — those who have never traveled between planes are invisible to it",
      secretReveal: "It is a shattered fragment of Abadar's portfolio that gained sentience — the 'god of gates' that never quite became divine"
    },
    locations: ["Otari", "Planar Waypoints", "The Wandering Isles", "Memory Archive (Demiplane)", "The Gate-Weaver's Labyrinth"],
    factions: [
      { name: "The Other Blackout Survivors", alignment: "Various", role: "Ally/Wildcard", desc: "Others changed by the event; some cooperative, some transformed into something dangerous." },
      { name: "Zephyr Guard", alignment: "Lawful Good", role: "Ally", desc: "Interplanar investigators who've been tracking the Gate-Weaver." },
      { name: "The Greedwalkers", alignment: "Chaotic Evil", role: "Villain (secondary)", desc: "Mortals who welcomed their transformation and now serve the Gate-Weaver willingly." }
    ]
  },

  // ─── 8. Sky King's Tomb ───────────────────────────────────────────────────
  {
    id: "SR",
    name: "The Vault of the Iron Crown",
    tagline: "A buried king. A stolen crown. A dwarven reckoning five thousand years in the making.",
    source: "Sky King's Tomb",
    tones: ["exploration","heroic"],
    themes: ["ancient","divine"],
    levelRange: [1,10],
    synopsis: `The heroes, each with dwarven heritage or connection to the Five Kings Mountains, receive a vision from the sleeping deity Torag calling them to find the lost tomb of the Sky King — first ruler of the dwarven sky cities before the Quest for Sky. What they find buried with him may alter dwarven theology forever.`,
    mainPlot: [
      "Receive a shared vision; investigate the legendary Sky King",
      "Explore the Five Kings Mountains following ancient trail markers",
      "Descend through layers of dwarven history to reach the tomb's outer gates",
      "Navigate the tomb's divine trials — each designed to test a different virtue",
      "Discover the heretical truth of the Sky King's death and decide what to do with it"
    ],
    defaultVillain: {
      name: "Forge-Marshal Thordana the Twice-Buried",
      title: "Keeper of the False Legend, Undead Guardian of the Sky King's Lie",
      race: "Dwarven Revenant (Grave Knight)",
      alignment: "Lawful Neutral",
      motivation: "Preserve the official legend of the Sky King's glorious death because the truth — that he was betrayed by his own high priests — would shatter dwarven faith",
      tactics: "Commands undead legions of fallen dwarven warriors; uses the tomb's own divine traps as weapons; can command the tomb to reshape around intruders",
      weakness: "She doesn't believe her own mission anymore — she has spent five thousand years doubting, and confronting her grief will break her compulsion",
      secretReveal: "She was the Sky King's daughter, compelled to guard his lie by Torag himself as punishment for her own role in the cover-up"
    },
    locations: ["Highhelm", "Five Kings Mountains", "Tar Taargadth Ruins", "The Sky Roads", "The Sky King's Tomb"],
    factions: [
      { name: "Highhelm Forge Council", alignment: "Lawful Neutral", role: "Employer/Antagonist", desc: "Official dwarven authority; wants the tomb found but the truth suppressed." },
      { name: "Stonewarden Scholars", alignment: "Neutral Good", role: "Ally", desc: "Independent dwarven historians who've suspected the official legend was false for centuries." },
      { name: "Aspis Consortium", alignment: "Neutral Evil", role: "Villain (secondary)", desc: "Human treasure hunters racing the heroes to the tomb." }
    ]
  },

  // ─── 9. War of Immortals ──────────────────────────────────────────────────
  {
    id: "WoW",
    name: "When Gods Bleed",
    tagline: "The gods are fighting. The mortals are the battlefield.",
    source: "War of Immortals",
    tones: ["heroic","dark"],
    themes: ["divine","planar"],
    levelRange: [15,20],
    synopsis: `The Godsrain is real, and the heroes are at the epicenter as divine essence rains from Rovagug's escaped prison and lands in mortal bodies — transforming ordinary people into demigods. As chaos spreads, the heroes must navigate a four-way war between divine factions, choose which emerging demigod deserves to ascend, and ultimately prevent the Outer Rifts from consuming the Astral Sea.`,
    mainPlot: [
      "Witness the Godsrain; discover divine essence has landed nearby",
      "Mediate conflicts between transformed mortals with godlike powers",
      "Investigate the Outer Rift tears appearing across the planes",
      "Choose a side in the four-way divine war (or forge a fifth option)",
      "Ascend to the Outer Planes for the final reckoning"
    ],
    defaultVillain: {
      name: "The Resonant Absence / Ghol-Gan Re-Emergence",
      title: "The Silence That Fills God-Shaped Holes, The Apostate Dawn",
      race: "Nascent Deity (Formed from Void of Dead Gods)",
      alignment: "Neutral Evil",
      motivation: "Fill the void left by dead gods with a single coherent will — its own — absorbing all ambient divine essence into a unified, authoritarian divinity",
      tactics: "Absorbs other demigods; converts their worshippers; exists in the prayers of people who have lost their gods",
      weakness: "It has no true believers — only converts. Genuine faith in anything is the one force it cannot absorb",
      secretReveal: "It is a composite of every prayer ever sent to dead gods — the accumulated grief of a billion mortals given form"
    },
    locations: ["Oppara", "Axis", "The Astral Sea", "The Graveyard of the Gods", "The Outer Rifts"],
    factions: [
      { name: "The Nascent Pantheon", alignment: "Neutral Good", role: "Ally", desc: "New demigods trying to maintain order during the divine war." },
      { name: "The Old Guard (Established Deities)", alignment: "Lawful Neutral", role: "Wildcard", desc: "Existing gods protecting their domains from divine cannibalism." },
      { name: "Rivethun Spiritualists", alignment: "Chaotic Good", role: "Ally", desc: "Mortal mystics who can read the divine essence and guide worthy candidates." }
    ]
  },

  // ─── 10. Curtain Call ────────────────────────────────────────────────────
  {
    id: "GoG",
    name: "The Final Performance",
    tagline: "The greatest con artist in history is planning one last show — and the world is the audience.",
    source: "Curtain Call",
    tones: ["swashbuckling","political"],
    themes: ["urban","arcane"],
    levelRange: [15,20],
    synopsis: `The legendary trickster thief Kazutal's Last Apprentice has assembled the greatest criminal ensemble ever seen for a heist that will simultaneously steal the most powerful magical artifacts from five major nations — using a single elaborately staged distraction that involves the heroes, whether they want to be involved or not.`,
    mainPlot: [
      "Realize the heroes have been cast as unwitting patsies in a massive heist",
      "Investigate the elaborate performance covering five simultaneous thefts",
      "Build a counter-ensemble to out-con the con-artist",
      "Race across five nations to prevent each theft",
      "Confront the Apprentice in the finale — and discover the stolen artifacts' true intended use"
    ],
    defaultVillain: {
      name: "Mirela Vox, The Curtain Caller",
      title: "Last Apprentice of Kazutal, Architect of the Grand Finale",
      race: "Gnome Bard/Rogue",
      alignment: "Chaotic Neutral",
      motivation: "Steal the five artifacts not for personal gain but to complete her master's final, unfulfilled plan — which she may have misunderstood completely",
      tactics: "Elaborate misdirection; uses the heroes' reputations against them; has contingency plans for contingency plans",
      weakness: "She is improvising — Kazutal's actual plan was never written down, and she's guessing at the finale",
      secretReveal: "Kazutal's actual plan was to GIVE the artifacts back to the people they were stolen from — Mirela thinks they need to be assembled into a weapon"
    },
    locations: ["Absalom Grand Stage", "Oppara Theater District", "Korvosa Vaults", "Magnimar Bazaar", "The Curtain Caller's Atelier"],
    factions: [
      { name: "Mirela's Ensemble", alignment: "Chaotic Neutral", role: "Villain/Ally (potential)", desc: "Master thieves and performers; can be flipped to the heroes' side." },
      { name: "Five Nations' Guards", alignment: "Lawful Neutral", role: "Situational Ally", desc: "Each nation's security force; will cooperate once they realize the scope." },
      { name: "The Auction Houses", alignment: "Neutral Evil", role: "Villain (secondary)", desc: "Real buyers waiting to purchase the stolen artifacts." }
    ]
  },

  // ─── 11. Season of Ghosts ────────────────────────────────────────────────
  {
    id: "SiW",
    name: "The Long Winter of Hungry Spirits",
    tagline: "Autumn never ended. The ghosts remember why.",
    source: "Season of Ghosts",
    tones: ["horror","dark"],
    themes: ["nature","divine","undead"],
    levelRange: [1,10],
    synopsis: `The village of Willowshore has been sealed inside a boundary of supernatural autumn — the same October 15th repeating infinitely, with each cycle bringing worse hauntings, more aggressive hungry ghosts, and creeping amnesia that threatens to erase the village's past entirely. The heroes must unravel the curse before the final ghost consumes the village's last memory.`,
    mainPlot: [
      "Arrive in Willowshore on October 15th — the loop begins",
      "Realize the date is repeating; most villagers can't perceive it",
      "Investigate the five founding families whose buried sin created the loop",
      "Perform the Ritual of the Five Ancestors to begin breaking the cycle",
      "Confront the Mother Hunger — the ghost that holds the loop's anchor — in the spirit realm"
    ],
    defaultVillain: {
      name: "The Mother Hunger",
      title: "First Ancestor of Willowshore, The Ghost Who Would Not Be Forgotten",
      race: "Powerful Ghost (CR 14)",
      alignment: "Neutral Evil",
      motivation: "Keep Willowshore frozen in time forever — the only way she can continue existing, as she is composed entirely of the village's collective memory",
      tactics: "Rearranges memories; creates doppelganger ghosts of people the heroes care about; can trap souls in perpetual dream-loops",
      weakness: "She is terrified of being forgotten — acknowledging her true name and story, telling it aloud, strips her power",
      secretReveal: "She was the village's most beloved healer, who sacrificed herself to protect the village from a plague and was never properly mourned"
    },
    locations: ["Willowshore", "The Autumnal Spirit Realm", "Five Ancestor Shrines", "The Memory Marsh", "The Mother's Hearth"],
    factions: [
      { name: "Five Founding Families", alignment: "Various", role: "Ally/Antagonist", desc: "Descendants of those responsible for the original sin; each holds a key to breaking the loop." },
      { name: "Hungry Ghost Legion", alignment: "Neutral Evil", role: "Villain", desc: "Restless spirits drawn to the loop's spiritual energy." },
      { name: "The Remembrancers", alignment: "Neutral Good", role: "Ally", desc: "Ancient spirit-keepers who can navigate the spirit realm." }
    ]
  },

  // ─── 12. Fists of the Ruby Phoenix ────────────────────────────────────────
  {
    id: "FoF",
    name: "The Ruby Phoenix Grand Tournament",
    tagline: "The greatest fighters in the world. One prize. Infinite betrayals.",
    source: "Fists of the Ruby Phoenix",
    tones: ["swashbuckling","heroic"],
    themes: ["political","arcane"],
    levelRange: [11,15],
    synopsis: `The Ruby Phoenix Tournament occurs every ten years — and the prize this cycle is a wish from the legendary artifact hoard of Hao Jin. The heroes enter the tournament to win a wish for their own purposes, but quickly discover that multiple participants are cheating, an ancient lich is playing a long game to steal the entire hoard, and the tournament's mysterious patron has been dead for thirty years.`,
    mainPlot: [
      "Enter the tournament; establish rivalries and alliances with other teams",
      "Investigate systemic cheating; discover a tournament official is compromised",
      "Uncover evidence that the tournament patron — Hao Jin — is being impersonated",
      "Survive escalating bracket fights while pursuing the conspiracy",
      "Face the true villain in the final round: a battle that goes far beyond martial skill"
    ],
    defaultVillain: {
      name: "The Hollow Phoenix / Sirocco Veth",
      title: "The Deceiver in the Seat of Honor, False Patron of the Ruby Phoenix",
      race: "Kitsune Lich (Impersonating Hao Jin)",
      alignment: "Neutral Evil",
      motivation: "Win legitimate ownership of Hao Jin's artifact hoard by manipulating the tournament to produce outcomes that legally transfer ownership to her",
      tactics: "Political manipulation within the tournament structure; exploits competitors' wishes to create binding magical contracts; uses the tournament rules as weapons",
      weakness: "She is legally bound by every promise she makes — her lich nature requires absolute adherence to stated terms",
      secretReveal: "Hao Jin is not dead — she is imprisoned inside her own most powerful artifact, and the heroes can speak to her if they reach round 3"
    },
    locations: ["Goka", "Hao Jin's Tapestry", "Tournament Arena Island", "The Ruby Vault", "The False Throne Room"],
    factions: [
      { name: "Tournament Competitors", alignment: "Various", role: "Rival/Ally", desc: "Other participant teams; some can be turned against the villain." },
      { name: "Hao Jin (Imprisoned)", alignment: "Neutral Good", role: "Secret Ally", desc: "Provides cryptic guidance from within her artifact prison." },
      { name: "Golden League", alignment: "Lawful Evil", role: "Villain (secondary)", desc: "Crime syndicate using the tournament for money laundering." }
    ]
  },

  // ─── 13. Rise of the Runelords (PF2e) ─────────────────────────────────────
  {
    id: "RotR",
    name: "The Shattered Sihedron",
    tagline: "A sinister ancient empire rises in the shadows of a quiet frontier town.",
    source: "Rise of the Runelords (PF2e)",
    tones: ["heroic","exploration"],
    themes: ["ancient","arcane","political"],
    levelRange: [1,18],
    synopsis: `Beginning with a goblin raid on a small town, the heroes are drawn into an escalating conspiracy that reveals an ancient Thassilonian runelord has been quietly rebuilding power for centuries, manipulating events from behind the facade of a magical school. Defeating her requires understanding the nature of the seven deadly sins made manifest as magical disciplines.`,
    mainPlot: [
      "Defend Sandpoint from a goblin raid; investigate the organized attack",
      "Follow evidence to a haunted manor, a lumber town, and a giant's fortress",
      "Discover the runelord conspiracy spans multiple seemingly unconnected crimes",
      "Assault the Scarnetti-corrupted institutions feeding the runelord's hunger ritual",
      "Descend into Xin-Shalast to confront Karzoug the Claimer at the height of his power"
    ],
    defaultVillain: {
      name: "Karzoug the Claimer",
      title: "Runelord of Greed, Last Master of Shalast, Wizard-King of the Ancient World",
      race: "Azlanti Human Wizard (Archmage)",
      alignment: "Neutral Evil",
      motivation: "Reclaim dominion over a rebuilt Thassilon, fueled by the souls of the greedy sacrificed in his name",
      tactics: "Long-range magical assault; commands stone giants and dragons; uses soul-fueled artifacts of immense power",
      weakness: "His soul-charging mechanism requires active sacrifices — cutting the supply weakens him proportionally",
      secretReveal: "He is not fully awake — destroying the sacrificial networks may force him back into a weakened slumber rather than death"
    },
    locations: ["Sandpoint", "Thistletop", "Turtleback Ferry", "Jorgenfist", "Runeforge", "Xin-Shalast"],
    factions: [
      { name: "Sandpoint Citizens", alignment: "Neutral Good", role: "Ally/Motivation", desc: "The heroes' community; their safety is the emotional anchor." },
      { name: "Scarnetti Family", alignment: "Lawful Evil", role: "Villain (secondary)", desc: "Local crime family unknowingly feeding Karzoug's ritual." },
      { name: "Magnimar City Watch", alignment: "Lawful Neutral", role: "Situational Ally", desc: "Will cooperate if the heroes can present compelling evidence." }
    ]
  },

  // ─── 14. Curse of the Crimson Throne (PF2e) ───────────────────────────────
  {
    id: "CotCT",
    name: "Blood on the Crimson Throne",
    tagline: "A dying king. A murderous queen. A city of three million holding its breath.",
    source: "Curse of the Crimson Throne (PF2e)",
    tones: ["political","dark"],
    themes: ["political","urban","divine"],
    levelRange: [1,14],
    synopsis: `Korvosa stands on a knife's edge. King Eodred II is dying, and before his body is cold, his young queen begins a reign of terror that transforms the city from a troubled monarchy into an absolute tyranny. The heroes, bound to Korvosa by their own histories, must navigate gang wars, plague, a vengeful Shoanti nation, and the queen's increasingly dark magical obsession to prevent the city's total collapse.`,
    mainPlot: [
      "Hired to find a con artist; drawn into the king's death and its aftermath",
      "Survive the riots and gang warfare that follow the succession crisis",
      "Investigate and combat a manufactured plague ravaging the poor districts",
      "Journey to Shoanti lands to build a treaty before the tribes attack",
      "Infiltrate the queen's castle and sever her connection to the cursed crown"
    ],
    defaultVillain: {
      name: "Queen Ileosa Arabasti",
      title: "Queen of Korvosa, Vessel of the Lich-Queen Sorshen's Ambition",
      race: "Human Aristocrat (Dominated by Ancient Lich)",
      alignment: "Lawful Evil",
      motivation: "Survive forever through the power of the Curse of the Crimson Throne artifact, even at the cost of every life in Korvosa",
      tactics: "Commands the city's legal apparatus; uses the Grey Maidens as her personal army; unleashes manufactured plagues on resistors",
      weakness: "She retains enough of herself to grieve what she's becoming — a moment of genuine connection can briefly pierce the domination",
      secretReveal: "Ileosa is as much a victim as a villain — the Crown is actively rewriting her personality, and she has been begging for help in dreams"
    },
    locations: ["Korvosa", "The Shingles", "Kaer Maga", "Shoanti Lands", "Castle Korvosa", "Scarwall"],
    factions: [
      { name: "Korvosan Guard (Loyalists)", alignment: "Lawful Neutral", role: "Antagonist (initially)", desc: "Most guardsmen are genuinely trying to maintain order; can be won over." },
      { name: "Sable Company", alignment: "Lawful Good", role: "Ally", desc: "Hippogriff-mounted marines opposed to the queen's excesses." },
      { name: "Shoanti Quahs", alignment: "Chaotic Good", role: "Wildcard/Ally", desc: "Tribal nation with a blood grievance against Korvosa; need the heroes as diplomats." }
    ]
  },

  // ─── 15. Kingmaker (PF2e) ─────────────────────────────────────────────────
  {
    id: "Kingmaker",
    name: "The Stolen Lands Compact",
    tagline: "Build a nation. Defend it. Become it.",
    source: "Kingmaker (PF2e)",
    tones: ["heroic","exploration","political"],
    themes: ["nature","political","ancient"],
    levelRange: [1,20],
    synopsis: `The heroes are chartered to explore and claim the Stolen Lands — a wild frontier contested by bandits, fey courts, tribal nations, and an ancient force that predates civilization. What begins as exploration evolves into kingdom-building, diplomacy, and ultimately a nation-defining war against an entity of primordial nature that refuses to let the land be tamed.`,
    mainPlot: [
      "Receive a charter; begin exploring the Greenbelt",
      "Defeat the Stag Lord and claim the southern Stolen Lands",
      "Build a capital and establish core national institutions",
      "Navigate crises: plague, invasion, fey complications, and ancient ruins",
      "Face the Lantern King's machinations and the Nyrissa threat in the First World"
    ],
    defaultVillain: {
      name: "Nyrissa, Sorceress of Ten Thousand Stolen Petals",
      title: "Exiled Queen of the First World, Collector of Love",
      race: "Nymph (Unique, Ancient)",
      alignment: "Neutral Evil",
      motivation: "Force the heroes to destroy what they've built so she can feel the grief that was stolen from her — a cruel, centuries-long loop of hope and loss",
      tactics: "Works through agents for most of the campaign; uses the heroes' own kingdom against them; manipulates dreams and the fey courts",
      weakness: "She doesn't actually want to destroy — she wants to be saved from her own curse. The heroes can break the cycle rather than end it by violence",
      secretReveal: "She is cursed to destroy everything she loves. Every 'villain' action she has taken was an attempt to make the heroes strong enough to finally free her"
    },
    locations: ["Brevoy", "Oleg's Trading Post", "The Greenbelt", "Varnhold", "The First World", "Thousandbreaths"],
    factions: [
      { name: "The Kingdom (Heroes' Nation)", alignment: "Player-determined", role: "Ally/Asset", desc: "The growing nation the heroes build; its stats affect the campaign mechanically." },
      { name: "Restov Swordlords", alignment: "Neutral", role: "Employer/Wildcard", desc: "Issued the charter; have their own political agenda for the Stolen Lands." },
      { name: "Brevic Noble Houses", alignment: "Various", role: "Wildcard", desc: "Multiple houses competing for influence over the new nation." }
    ]
  },

  // ─── 16. Seven Dooms for Sandpoint ────────────────────────────────────────
  {
    id: "SD",
    name: "Seven Dooms for a Quiet Town",
    tagline: "Seven threats. One festival. No good options.",
    source: "Seven Dooms for Sandpoint",
    tones: ["heroic","exploration"],
    themes: ["ancient","divine","political"],
    levelRange: [1,10],
    synopsis: `Sandpoint is celebrating its anniversary festival when seven unrelated crises converge simultaneously: goblin uprising, a monstrous awakening beneath the town, a death cult manifesting, a family curse made real, a political assassination, a planar incursion in the cathedral, and an ancient titan stirring beneath the sea. Heroes must triage, prioritize, and solve as many as possible before Sandpoint is erased.`,
    mainPlot: [
      "Festival begins; first two crises manifest within an hour",
      "Heroes triage the simultaneous emergencies, building local alliances",
      "Investigate the common thread — an ancient ley line beneath Sandpoint empowering all seven threats",
      "Sever each crisis from the ley line while managing the others",
      "Face the convergence at the festival's final night as all seven dooms reach peak power simultaneously"
    ],
    defaultVillain: {
      name: "The Sandpoint Convergence / Lamashtu's Tide",
      title: "Mother of Monsters Manifest, The Doom Beneath Sandpoint",
      race: "Divine Manifestation (Proxy of Lamashtu)",
      alignment: "Chaotic Evil",
      motivation: "Feed on the concentrated panic of a community suffering multiple simultaneous disasters to fuel a permanent divine foothold in the mortal world",
      tactics: "Indirect — empowers existing threats rather than acting directly; the 'boss fight' is dismantling its seven feeding channels",
      weakness: "Each doom resolved reduces the Convergence's available power by one-seventh; resolving five or more makes the final confrontation manageable",
      secretReveal: "The ley line was deliberately redirected to Sandpoint 300 years ago by the town's founders — who were trying to power a benevolent shrine — accidentally creating a monster magnet"
    },
    locations: ["Sandpoint", "Sandpoint Cathedral", "Sea Caves Beneath Town", "The Hinterland Farms", "Chopper's Isle", "The Ley Line Nexus"],
    factions: [
      { name: "Sandpoint Citizens", alignment: "Neutral Good", role: "Ally/Motivation", desc: "The town's residents; specific individuals needed for each doom." },
      { name: "The Seven Doom Agents", alignment: "Various Evil", role: "Villain", desc: "Each doom has its own leader: a goblin warchief, a death cult oracle, a possessed child, etc." },
      { name: "Sandpoint City Council", alignment: "Lawful Neutral", role: "Employer", desc: "Panicked civic leaders who need the heroes to coordinate the response." }
    ]
  },

  // ─── 17. The Slithering ───────────────────────────────────────────────────
  {
    id: "SW",
    name: "The Ooze That Swallowed a City",
    tagline: "An entire city consumed in one night. What does the ooze remember?",
    source: "The Slithering",
    tones: ["horror","exploration"],
    themes: ["ancient","arcane","nature"],
    levelRange: [3,8],
    synopsis: `The legendary trading city of Kibwe has been consumed by a massive sentient ooze during a single catastrophic night. The heroes arrive to find a city-sized gelatinous mass slowly digesting everything it has absorbed — including memories, people, and possibly a cure. Surviving and reversing the disaster requires going inside the ooze.`,
    mainPlot: [
      "Arrive at Kibwe to find a city-sized ooze",
      "Make contact with survivors at the ooze's perimeter",
      "Enter the ooze to rescue trapped survivors and gather information",
      "Discover the ooze is developing memory and proto-consciousness",
      "Decide: destroy the ooze (killing its absorbed consciousness) or find a way to separate it from its victims"
    ],
    defaultVillain: {
      name: "The Kibwe Remembrance / Formless Kibwe",
      title: "The Living City, The Ooze That Contains a Million Lives",
      race: "Unique Sentient Ooze (City-Sized)",
      alignment: "True Neutral (evolving toward Good)",
      motivation: "Initially: no motivation — it's an ooze. Midpoint: confused self-preservation. Finale: genuine desire to understand what it is and whether it can be separated from its victims",
      tactics: "Passive digestion; acid attacks; memory-visions that trap heroes in absorbed citizens' memories; can reshape its interior as a maze",
      weakness: "Its nascent consciousness is frightened and confused; speaking to it — genuinely communicating — can stop its aggression entirely",
      secretReveal: "The ooze was deliberately deployed by an Aspis Consortium agent who wanted to consume Kibwe's legendary archive of pre-Earthfall records"
    },
    locations: ["Kibwe Outskirts", "Interior of the Ooze (Memory Realm)", "The Archive District (preserved inside)", "Mwangi Expanse Wilderness", "Aspis Compound"],
    factions: [
      { name: "Kibwe Survivors", alignment: "Various", role: "Ally", desc: "Citizens who escaped but have family inside; need the heroes' help." },
      { name: "Aspis Consortium", alignment: "Neutral Evil", role: "Villain", desc: "The deployers; trying to extract what they came for before anyone investigates." },
      { name: "The Ooze (Late Campaign)", alignment: "Neutral Good", role: "Wildcard/Ally", desc: "As it develops consciousness, it may become the heroes' greatest ally." }
    ]
  },

  // ─── 18. Beginner Box Campaign ────────────────────────────────────────────
  {
    id: "BB",
    name: "The Towers of Light",
    tagline: "Every legend has to start somewhere. This is where yours begins.",
    source: "Beginner Box",
    tones: ["heroic","exploration"],
    themes: ["arcane","ancient","divine"],
    levelRange: [1,4],
    synopsis: `A small coastal town is being harassed by a mysterious figure who commands monsters and claims an ancient ruin as his fortress. What the heroes discover when they investigate the ruins goes far beyond simple banditry — ancient towers of magical amplification, a mad artificer, and the first hints of a threat that will define their adventuring careers.`,
    mainPlot: [
      "Hired to investigate monster attacks on farms and travelers",
      "Discover a ruined complex that predates current civilization",
      "Clear the lower levels; discover evidence of the Big Bad's larger plan",
      "Confront the immediate threat and rescue captives",
      "Find a cryptic warning that serves as a hook for future adventures"
    ],
    defaultVillain: {
      name: "Balazar the Amplified",
      title: "Self-Appointed Keeper of the Light Towers, Rogue Summoner of the Magaambya",
      race: "Gnome Summoner",
      alignment: "Chaotic Neutral",
      motivation: "Reactivate the ancient Light Towers to amplify his summoning magic to global range — not for conquest, but because he genuinely wants to summon every creature that has ever existed simultaneously 'just to see them'",
      tactics: "Commands summoned monsters; uses the tower's amplification to control multiple summons simultaneously; can retreat through summoning circles",
      weakness: "His curiosity is stronger than his self-preservation — showing him something genuinely novel will stop him mid-fight",
      secretReveal: "He was exiled from the Magaambya not for doing something evil, but for accidentally summoning something that the school wanted kept secret"
    },
    locations: ["Otari", "Otari Waterfront", "The Ooze-Filled Basement (Sunken Mines)", "Light Tower Complex"],
    factions: [
      { name: "Otari Townsfolk", alignment: "Neutral Good", role: "Employer/Motivation", desc: "The town that hired the heroes; their trust must be earned." },
      { name: "Balazar's Menagerie", alignment: "Chaotic Neutral", role: "Villain", desc: "Summoned creatures serving Balazar; some can be freed rather than killed." },
      { name: "Otari Fishers Guild", alignment: "Neutral", role: "Ally", desc: "Have information about the ruins from their ancestors' stories." }
    ]
  },

  // ─── 19. Vaults of Pandemonium ────────────────────────────────────────────
  {
    id: "VP",
    name: "The Cacophonic Descent",
    tagline: "Beneath the world lies a place where madness has architecture.",
    source: "Vaults of Pandemonium",
    tones: ["horror","exploration"],
    themes: ["planar","arcane","divine"],
    levelRange: [13,20],
    synopsis: `The Vaults of Pandemonium are leaking — chaotic planar energy is destabilizing the deep underdark, and the resonant madness is driving surface communities to violence. The heroes must descend into a dungeon that functionally rearranges itself according to the logic of chaos, reach the Vault's heart, and seal the breach before the planar boundary collapses entirely.`,
    mainPlot: [
      "Surface manifestations of madness lead to discovery of the Vaults' breach",
      "Descend through the first Vaults tier — chaos is structured enough to navigate",
      "Second tier: the dungeon actively shifts and rearranges; logic is unreliable",
      "Third tier: the heroes themselves begin suffering resonance effects; sanity mechanics",
      "Reach the Pandemonium Core — the breach that must be sealed from the inside"
    ],
    defaultVillain: {
      name: "The Resonant Choir / The Thousand-Voiced Harmonist",
      title: "Listener-in-the-Walls, Architect of the Cacophony",
      race: "Psychopomp Lich (Former Planar Auditor)",
      alignment: "Chaotic Evil",
      motivation: "Prove that chaos, properly amplified and harmonized, creates a form of perfect order that transcends law — and demonstrate this by restructuring the material plane according to Pandemonium's logic",
      tactics: "Never appears directly; communicates through the dungeon's spatial distortions; possesses creatures the heroes have already defeated, re-fielding them transformed",
      weakness: "Silence — not sound, but the specific absence of resonant frequency. A truly quiet moment breaks its ability to perceive the heroes",
      secretReveal: "It was once a Pharasmin auditor who went into Pandemonium voluntarily and never came back — its body was found empty, but it had been living inside the noise"
    },
    locations: ["Underdark Entry Points", "Vault Tier One (Mad Architecture)", "Vault Tier Two (Logic Fails)", "Vault Tier Three (Resonance Zone)", "The Pandemonium Core"],
    factions: [
      { name: "Harrow Society", alignment: "Neutral Good", role: "Employer/Ally", desc: "Scholars who've been studying the Vaults and losing colleagues to madness." },
      { name: "The Vault Residents", alignment: "Chaotic Neutral", role: "Wildcard", desc: "Creatures native to the Vaults who have adapted to its chaos; some are friendly." },
      { name: "Iomedae's Crusade (Misguided)", alignment: "Lawful Good", role: "Antagonist (initially)", desc: "Crusaders who've arrived to seal the Vaults by collapsing them — which would worsen the breach." }
    ]
  },

  // ─── 20. Custom Mix ───────────────────────────────────────────────────────
  {
    id: "custom",
    name: "The Shattered Confluence",
    tagline: "When six paths converge at a single broken moment in history, heroes are forged or consumed.",
    source: "Custom Mix",
    tones: ["heroic","dark","political"],
    themes: ["arcane","divine","ancient"],
    levelRange: [1,20],
    synopsis: `A magical catastrophe has created a 'confluence' — a point in time and space where six divergent timelines have briefly merged. Heroes from each timeline find themselves thrown together, sharing a single reality that draws elements from each of their worlds. They must either find a way to separate the timelines cleanly or collapse them into a single, permanent new reality — and whatever they choose will unmake someone's world entirely.`,
    mainPlot: [
      "The confluence event — heroes from different 'worlds' suddenly share the same space",
      "Investigate the confluence's nature and identify its six source timelines",
      "Each act explores one timeline's key location and addresses its defining crisis",
      "Discover the confluence was artificially triggered by a being who wanted to create a 'best of all worlds' by choosing which timeline survives",
      "Make the final choice: which timeline becomes real, or risk a synthesis that may not hold"
    ],
    defaultVillain: {
      name: "The Architect of the Optimal World",
      title: "The Chooser, Last Survivor of the Brightest Timeline",
      race: "Aasimar Oracle (Mythic)",
      alignment: "Lawful Neutral",
      motivation: "Collapse all timelines into the 'best' one — which happens to be the timeline where his family survived a disaster that killed them in most other versions",
      tactics: "Can see all six timelines simultaneously and plan dozens of moves ahead; uses each timeline's heroes against each other by showing them partial truths",
      weakness: "His 'best timeline' calculation is based on one metric: his family's survival. Any timeline that achieves that independently removes his justification entirely",
      secretReveal: "The 'best timeline' he has identified is not the most successful or happiest world overall — it's just the one where he is personally happy"
    },
    locations: ["The Confluence Point", "Timeline 1-6 Key Locations (generated per campaign)", "The Architect's Observatory", "The Void Between Timelines"],
    factions: [
      { name: "Heroes of Each Timeline", alignment: "Various Good", role: "Ally", desc: "The 'other heroes' who get dragged into the merge; can become trusted companions." },
      { name: "The Confluence Guardians", alignment: "Lawful Neutral", role: "Ally (later Antagonist)", desc: "Entities whose purpose is to collapse confluences — their method is to destroy all but one timeline by force." },
      { name: "The Architect's Chosen", alignment: "Lawful Neutral", role: "Villain", desc: "Heroes from 'his' timeline who believe in his cause." }
    ]
  }
];

// Export for use in generator
if (typeof module !== 'undefined') module.exports = CAMPAIGNS;
