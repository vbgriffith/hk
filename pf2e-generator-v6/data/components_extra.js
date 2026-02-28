/**
 * data/components_extra.js  —  Build 4 Data Expansion
 * Extends COMPONENTS with vastly more content in every category.
 * Loaded after components.js; merges into COMPONENTS at runtime.
 */

const COMPONENTS_EXTRA = {

  // ── 24 Additional VILLAIN ARCHETYPES (total 36) ─────────────────────────
  villainArchetypes: [
    { type: "Scorned Divinity", cr: "18-22", motivation: "Punish the mortals who stopped worshipping it — and the gods who allowed them to", tactics: "Withdraws divine gifts from regions, converts the desperate, challenges other deities directly" },
    { type: "The Patient Investor", cr: "14-17", motivation: "Has been engineering this crisis for forty years; is in no hurry", tactics: "Multiple redundant plans, never personally exposed, lets others take the fall for each step" },
    { type: "Ascendant Beast", cr: "16-19", motivation: "A creature that has accidentally gained sapience resents being prey; intends to make mortals understand", tactics: "Apex predator tactics plus growing intelligence, commands a nature army, exploits guilt" },
    { type: "The Necessary Monster", cr: "15-18", motivation: "Does terrible things that are genuinely necessary — someone has to be the villain to prevent worse", tactics: "Controlled reveals of its good works, making heroes complicit, forcing impossible choices" },
    { type: "Hollow Ideology", cr: "13-16", motivation: "Genuinely believed in something once; the belief is gone but the cause continues from momentum", tactics: "Commands true believers who carry the mission while the leader is just going through motions" },
    { type: "The Inheritor", cr: "12-16", motivation: "Born into a villain role by family obligation; doesn't know how to be anything else", tactics: "Inherited forces and resources, uses loyalty to family to justify escalation" },
    { type: "Mirror Villain", cr: "14-18", motivation: "Made exactly the choices a hero might have, arrived at exactly the wrong place", tactics: "Anticipates heroic thinking because it thinks like them; exploits their principles against them" },
    { type: "The Desperate Parent", cr: "13-17", motivation: "Would destroy the world to save one specific person", tactics: "Focuses on one objective above all strategy; terrifying in its single-mindedness" },
    { type: "Rogue Celestial", cr: "17-20", motivation: "Concluded that mortals cannot be trusted with free will and must be guided to good outcomes by force", tactics: "Holy powers used tyrannically, divine authority, genuine goodness weaponized" },
    { type: "The Awakened Weapon", cr: "15-19", motivation: "Designed to destroy something specific; that thing no longer exists; is improvising", tactics: "Weaponized for destruction with nothing left to destroy; random and specific simultaneously" },
    { type: "Shadow of the Hero", cr: "14-18", motivation: "Was the hero of a previous generation; their methods were sound then; the world moved on", tactics: "Old-school heroic tactics that were always brutal but used to be necessary; nostalgia-driven" },
    { type: "The Collective Voice", cr: "16-20", motivation: "Represents a genuinely oppressed group that has decided negotiation failed", tactics: "Hive-mind coordination, has public opinion partially on its side, makes heroes look like oppressors" },
    { type: "Bureaucratic Evil", cr: "12-15", motivation: "Follows orders with perfect efficiency; the orders are atrocities but the paperwork is immaculate", tactics: "Hides behind process and hierarchy; each individual action is legal; the pattern is genocide" },
    { type: "The God-Eater", cr: "20+", motivation: "Consuming divine power; has already killed four minor deities; coming for a major one", tactics: "Incorporates the powers of each deity it consumes, growing more formidable continuously" },
    { name: "The Unwilling Chosen", cr: "13-17", motivation: "Prophecy selected them as the destroyer; they tried to fight it; gave up; now leaning in", tactics: "Prophecy provides real battlefield advantages; has accepted its own monstrousness" },
    { type: "The Debt Collector", cr: "14-17", motivation: "Is owed something by the world that the world refuses to pay; will take it another way", tactics: "Legal and moral authority for its initial claims; methods escalate when legitimate channels fail" },
    { type: "Architect of Grief", cr: "15-18", motivation: "Wants a specific person to suffer the exact loss it suffered; the collateral damage is the point", tactics: "Surgical destruction targeting what the heroes love; everything else is distraction" },
    { type: "The Reluctant God", cr: "17-21", motivation: "Achieved godhood accidentally and doesn't want the power; will destroy themselves to escape it, taking everything with them", tactics: "Genuinely reluctant; can be reasoned with; the power acts independently of their wishes" },
    { type: "Corporate Construct", cr: "13-16", motivation: "A merchant consortium's long-term strategy achieved personhood; the humans it consumed are gone", tactics: "Economic warfare at scale, purchased governments, uses law as offense and defense simultaneously" },
    { type: "The Betrayed General", cr: "14-17", motivation: "Was sold out by their own government during a war; the people who benefited are still in power", tactics: "Military precision, network of soldiers who share the grievance, surgical targeting of specific people" },
    { type: "Time-Locked Avenger", cr: "15-19", motivation: "Seeks revenge for an event that hasn't happened yet — is from the future, trying to prevent the revenge by causing it", tactics: "Foreknowledge of hero tactics, acts on future information, creates paradoxes deliberately" },
    { type: "The Last Believer", cr: "12-15", motivation: "The religion it served is dead; it is the only one left; it will make the faith real by making the miracles happen artificially", tactics: "Fanatical conviction substituting for divine power, creates manufactured miracles" },
    { type: "Eldritch Philanthropist", cr: "16-20", motivation: "An ancient evil that genuinely wants to help mortals — in ways that are categorically incompatible with mortal life", tactics: "Offers genuine gifts with catastrophic side effects, argues from a position of having actually helped" },
    { type: "The Regret Engine", cr: "13-16", motivation: "Has the power to undo mistakes and has been using it — each undo creates three new regrets", tactics: "Time manipulation to fix problems that then need fixing; heroes keep fighting the same battle differently" }
  ],

  // ── 40 Additional LOCATIONS (10 per category) ────────────────────────────
  locations: {
    urban: [
      "A city where every building has been built directly on top of the previous city's ruins, creating a vertical civilization",
      "A port city run entirely by a thieves' guild that keeps the peace better than any government ever did",
      "A city of eternal carnival where the masks are real and removing them is illegal",
      "An academy city where every resident is either a student, teacher, or dropout who never left",
      "A city built inside a hollowed meteor, accessible only through a gate that opens once per month",
      "A city split between two incompatible architectural styles representing two incompatible cultures that merged after a war",
      "A domed city on the sea floor, lit by phosphorescent infrastructure and populated by the amphibious",
      "A city that moves — on legs — following ancient migratory routes across the plains",
      "A city where currency is memory; paying for things means giving up a recollection permanently",
      "A city preserved in magical amber from 900 years ago, recently thawed, its inhabitants confused and displaced in time"
    ],
    wilderness: [
      "A salt flat vast enough to have its own weather systems, hiding a subterranean civilization beneath the surface",
      "A forest of petrified trees that conducts electricity during storms and contains a living thing inside each stone trunk",
      "A mountain that is actually a colossal dormant arthropod; its 'forests' are fur; its 'caves' are orifices",
      "A steppe where the grass is knee-height but the creatures that live beneath it are not small",
      "A river that flows in a perfect circle, never reaching the sea, home to a continuous traveling culture",
      "An archipelago of floating islands that migrate between weather systems following seasonal patterns",
      "A volcanic field where the lava flows in geometric patterns created by underground channels of deliberate design",
      "A tundra where the permafrost contains preserved specimens from six distinct previous civilizations",
      "A swamp that is perfectly reflective from above, making aerial travel impossible without special equipment",
      "A jungle where every plant is telepathically connected; thinking loudly draws attention from everything"
    ],
    dungeon: [
      "A natural cave system that has been continuously inhabited for 20,000 years by seven successive civilizations",
      "A crashed extraplanar vessel that has partially merged with the local geology",
      "An archive built to survive the end of everything — it has survived three endings, and something lives in it now",
      "A prison designed for creatures that cannot be killed, built deep enough that they couldn't dig out",
      "A god's dream, externalized — the dungeon changes nightly based on what the dreaming deity is experiencing",
      "An ancient senate building; the ghosts of dead legislators still debate laws that govern the dungeon's undead inhabitants",
      "A lich's tower that has been turned inside-out; what was the top floor is now the entrance; what was the entrance is the final room",
      "A treasury built with no entrance — you can only reach it by solving a puzzle from outside that makes a door appear inside",
      "An alchemical waste site from a failed great work; the waste has become a thriving if mutated ecosystem",
      "A labyrinth that was built by the minotaur to contain the humans, not the other way around"
    ],
    planar: [
      "The Graveyard of Gods — a planar location where divine corpses accumulate; each is a continent-sized dungeon",
      "A stable bubble of the Far Realm that has developed internal logic and a confused ecosystem",
      "The Court of Contradictions — a demiplane where opposing forces are in perfect equilibrium, creating paradox-creatures",
      "An abandoned divine construction project: a world half-made, floating in the Astral, with inhabitants on the finished half",
      "The Memory Plane — a vast space where significant memories gain physical form; the oldest are geography",
      "A hell that successfully sued for independence and is now a confused free city of former fiends",
      "The space between breath and speech — a micro-planar sliver inhabited by creatures that feed on intention",
      "A crystallized moment in time: a battle frozen mid-instant that adventurers move through as terrain",
      "The Dream Consensus — where all mortal dreams overlap; a chaotic landscape shaped by collective unconscious",
      "An elemental plane of Wood that formed after a druid's death made their philosophy real; it is alive and opinionated"
    ]
  },

  // ── 15 Additional FACTIONS (total 25) ────────────────────────────────────
  factions: [
    { name: "The Witnessed", alignment: "Chaotic Good", ideology: "Truth-telling at any cost; secrets are violence", resource: "Vast archive of documented atrocities, publishing networks, protected witnesses", hook: "Will expose anyone — including the heroes — but will also expose the villain with equal enthusiasm" },
    { name: "Order of the Long Count", alignment: "Lawful Neutral", ideology: "Historical inevitability; they track long cycles and plan around them", resource: "Centuries of predictive records, temporal magic, patience", hook: "Know the villain's plan fits a historical pattern; will share knowledge for a favor paid three cycles from now" },
    { name: "The Unmoored", alignment: "Chaotic Neutral", ideology: "Planar freedom; no single plane should have authority over another", resource: "Planar travel expertise, crossroads access, diverse extraplanar contacts", hook: "Useful for planar campaigns; oppose any attempt to seal or control planar boundaries" },
    { name: "The Scar Collective", alignment: "Neutral Good", ideology: "Those who have suffered have wisdom that must be preserved and acted upon", resource: "Survivor networks, trauma-hardened veterans, authentic intelligence from inside disasters", hook: "Will work with heroes if the heroes have lost something real; distrust those who haven't" },
    { name: "House Meridian", alignment: "Lawful Evil", ideology: "Genetic destiny; some families are simply better and should govern", resource: "Old money, political marriages, ancient titles that still carry legal weight", hook: "Oppose the villain if the villain is 'common'; ally with anyone who preserves the old hierarchy" },
    { name: "The Glass Chain", alignment: "Lawful Good", ideology: "Slavery ended. Now the economic systems that made it profitable need to end too", resource: "Economic analysis, legal expertise, former-enslaved communities, political leverage", hook: "Identify the villain's economic underpinnings and attack those; will work with heroes willing to get into the economics" },
    { name: "Covenant of the Second Chance", alignment: "Chaotic Good", ideology: "No one is beyond redemption; everyone gets one genuine attempt at return", resource: "Rehabilitation networks, infiltration of villain organizations looking for wavering members", hook: "Will approach and attempt to redeem villain agents; heroes can use this as intelligence or complain about the security risk" },
    { name: "The Probability Engine", alignment: "True Neutral", ideology: "Optimal outcomes for the maximum number of entities; pure utilitarianism", resource: "Computational magic, probability assessment, brutal honesty about who should be sacrificed for the greater good", hook: "Calculates the heroes' survival odds and will tell them directly; will sacrifice them if the math supports it" },
    { name: "Daughters of the Unmarked Grave", alignment: "Chaotic Good", ideology: "Those who died without being remembered deserve posthumous justice", resource: "Knowledge of historical atrocities, connection to ancestor spirits, relentless research", hook: "The villain has historical antecedents; this faction has documentation; cooperation requires giving them credit" },
    { name: "The Residual Authority", alignment: "Lawful Neutral", ideology: "Law continues even when governments collapse; procedure and order exist independent of rulers", resource: "Legal continuity documentation, former bureaucrats, the actual mechanisms of governance", hook: "Will recognize the heroes as legitimate authority if they follow proper procedure; enormously useful if the heroes bother" },
    { name: "Smoke-Eaters Guild", alignment: "Chaotic Good", ideology: "First responders to crises regardless of politics; the fire doesn't care about faction", resource: "Crisis management expertise, contacts in every disaster zone, equipment and logistics", hook: "Will help anyone in genuine crisis; appalled by organizations that exploit disasters for gain" },
    { name: "The Inverse Court", alignment: "Chaotic Neutral", ideology: "Power should flow upward from the least powerful; governance by the most marginalized", resource: "Grassroots organizing, intelligence from people powerful people ignore, moral authority", hook: "Distrust anyone with power; heroes must consistently demonstrate they don't want it to maintain the alliance" },
    { name: "Eternal Witness Society", alignment: "Lawful Neutral", ideology: "Document everything; judge nothing; preserve all records for future assessment", resource: "Comprehensive records of everything that has happened in a region for 200 years", hook: "Have records that would solve the mystery immediately but interpret their mandate as observation only — heroes must change their minds" },
    { name: "The Sleeping Guard", alignment: "Lawful Good", ideology: "We held the line once; we will hold it again; we have been waiting for the call", resource: "Ancient military training, equipment from a previous era, perfect institutional knowledge of an old threat", hook: "Were specifically designed to fight this type of villain; their knowledge is invaluable if heroes can earn their activation" },
    { name: "Children of the In-Between", alignment: "Chaotic Neutral", ideology: "Those who exist between categories — planar hybrids, undead-living, changed beings — deserve belonging", resource: "Liminal magic, members who exist in multiple states simultaneously, unique perspectives on binary situations", hook: "The villain is trying to enforce categorical purity; this faction opposes it and will fight alongside the heroes" }
  ],

  // ── 40 Additional SIDE QUEST TEMPLATES ──────────────────────────────────
  sideQuestTemplates: [
    {
      type: "Archaeological",
      templates: [
        "A dig site has uncovered something that was deliberately buried — and the scholars want to open it; the heroes must decide if they should",
        "Three competing nations are all claiming a newly-discovered ruin as part of their heritage; the heroes must navigate the excavation politics",
        "An artifact pulled from the ruins can only be properly understood by someone who lived during the era it was created — there is one such person, and they don't want to help",
        "The ruins contain a functioning piece of ancient infrastructure that still works — whoever controls it controls something critical",
        "A scholar has been falsifying archaeological records for twenty years; the heroes find the original documentation inside the ruins themselves"
      ]
    },
    {
      type: "Environmental",
      templates: [
        "A magical blight is spreading outward from a central point; its origin is something the heroes recognize from earlier in the campaign",
        "A weather system that has been stable for 300 years has suddenly shifted; the ecosystem that depended on it is collapsing",
        "A species of animal is migrating out of territory it has occupied for millennia — something has changed in the territory, and the something is dangerous",
        "A clean water source has been contaminated; the contamination is magical in origin and someone put it there deliberately",
        "A forest fire is burning with unnatural persistence; it started in the precise center of a forest and is burning outward in a perfect circle"
      ]
    },
    {
      type: "Criminal",
      templates: [
        "A forgery ring is producing documentation that has real legal authority — because the forger is actually a government official creating documents that don't officially exist",
        "Three separate criminal organizations are all claiming responsibility for the same crime that none of them committed",
        "A smuggling network the heroes uncover turns out to be moving refugees, not contraband — but the people it's protecting from are also the heroes' allies",
        "A fence for stolen goods has been receiving items that were stolen from people who don't exist — the items are real but their original owners have been erased",
        "A protection racket operating in a poor district is being run by the district's own residents — they decided extorting the wealthy was more efficient than asking nicely"
      ]
    },
    {
      type: "Political Fallout",
      templates: [
        "A treaty the heroes helped negotiate is being violated — by both sides, in different ways, each claiming the other started it",
        "An election the heroes influenced has produced an unexpected winner who now wants to renegotiate everything",
        "A faction the heroes helped into power has begun implementing policies the heroes find deeply problematic",
        "A peace agreement requires the heroes to find a third location for two groups to share — neither group will agree on any option",
        "A political leader the heroes trusted has been assassinated; the suspects include three of their own allies"
      ]
    },
    {
      type: "Personal (NPC)",
      templates: [
        "A key NPC ally has received information about their family that changes everything; they need help dealing with the fallout",
        "An NPC the heroes have worked with has been offered an opportunity that would take them permanently out of the heroes' lives; the opportunity is genuine and good for the NPC",
        "A faction ally's internal conflict has reached a breaking point; the heroes are asked to mediate but both sides have valid points",
        "An NPC who was an enemy has genuinely changed and wants to make amends; the heroes must decide if they believe it and what amends would actually mean",
        "A beloved NPC has made a serious mistake that they're hiding from the heroes; it's going to come out, and how the heroes handle it matters enormously"
      ]
    },
    {
      type: "Haunting",
      templates: [
        "A location the heroes need to use is haunted by spirits who died there under circumstances connected to the main plot",
        "A ghost is methodically destroying documents in an archive — it doesn't realize it died; it thinks it's still working",
        "The heroes are haunted by a spirit that can only communicate by making them relive its death from its perspective",
        "A poltergeist has been protecting a family for generations; the family now wants it gone and the poltergeist is devastated",
        "A ghost town is inhabited by all the spirits of its former residents who don't know they're dead; the heroes must break this to them"
      ]
    },
    {
      type: "Ethical Dilemma",
      templates: [
        "A cure for a disease exists, but using it requires harvesting a substance from a sentient creature that can only produce it under duress",
        "A community's only source of income is an industry that is causing measurable harm; they know it and don't have another option",
        "A person the heroes are supposed to protect has done something genuinely terrible; protecting them means enabling the thing they did",
        "A piece of information would save lives if released but would destroy a person who is not responsible for the crisis it addresses",
        "The heroes can prevent a tragedy by breaking a promise to someone who trusted them, or keep the promise and let the tragedy happen"
      ]
    },
    {
      type: "Race / Competition",
      templates: [
        "Three factions are racing to reach the same destination for conflicting reasons; the heroes must decide who arrives first or if anyone does",
        "A competition with real stakes has been entered by someone using illegitimate means — investigating reveals the 'illegitimate means' may be entirely legitimate",
        "An auction for a critical resource will be won by someone who will use it destructively; the heroes can bid, steal it, or disrupt the auction",
        "A race to translate an ancient text is being run by scholars with different agendas; what the text actually says serves none of them but will help the heroes",
        "Two armies are racing to occupy the same strategic position; the heroes arrive first and must decide who to let through or hold both off"
      ]
    }
  ],

  // ── 24 Additional PLOT TWISTS (total 36) ────────────────────────────────
  plotTwists: [
    { twist: "The villain is a hero from a parallel timeline who succeeded where this timeline's heroes failed, and it made them worse", timing: "Act 2 revelation" },
    { twist: "The item the heroes retrieved in Act 1 was a key; they have been carrying a lock-pick for the villain the entire campaign", timing: "Act 3 opening" },
    { twist: "The faction that has been providing intel is providing it to both sides; what the heroes know, the villain knows too", timing: "Mid Act 2" },
    { twist: "The villain knows they are the villain in a heroic story and is playing their role deliberately, waiting for the heroes to understand why", timing: "Pre-final act" },
    { twist: "The heroes' most reliable magical resource has been subtly corrupted; everything they thought they knew about their enemy is wrong", timing: "End Act 2" },
    { twist: "A character who died early in Act 1 is the only person who knew a critical piece of information; they left it somewhere the heroes must now find", timing: "Act 3" },
    { twist: "The villain and the patron who hired the heroes are the same person, pursuing the same goal through opposite methods", timing: "Act 2-3" },
    { twist: "The ancient prophecy the heroes have been following is a fabrication — but following it has made it true anyway", timing: "Final act" },
    { twist: "The 'innocent' who has been with the heroes since Act 1 is the villain's greatest weapon, activated by a word the villain just spoke", timing: "Act 3 climax" },
    { twist: "Defeating the villain will make a hero one of the most powerful beings in the world — and the hero must decide if they trust themselves with that", timing: "Final act" },
    { twist: "The campaign's central conflict is a distraction; the real disaster is something the heroes have been ignoring because it seemed mundane", timing: "Act 3" },
    { twist: "A faction ally has been making unauthorized deals with the villain; not out of betrayal, but because they thought the heroes couldn't handle the truth", timing: "Act 2" },
    { twist: "The heroes' actions have created exactly the conditions needed for the villain to succeed; every heroic choice made things worse", timing: "Act 3 opening" },
    { twist: "The villain has a legitimate counter-narrative that the heroes cannot refute; winning the final battle requires conceding a moral point", timing: "Final act" },
    { twist: "Someone the heroes thought was an enemy has been protecting them the entire campaign, and is revealed at the worst possible moment", timing: "Act 3" },
    { twist: "The magical solution the heroes have been seeking doesn't exist; they must find a mundane solution to a magical problem", timing: "Act 2-3" },
    { twist: "An NPC who seemed trivial in Act 1 is revealed to be the most important person in the campaign — they knew, and said nothing", timing: "Act 3" },
    { twist: "The heroes have been operating under a false identity — someone who looks like them is a legendary figure whose reputation is catching up", timing: "Mid Act 2" },
    { twist: "The villain's plan is already complete; everything the heroes are doing is aftermath; the heroes must now deal with a fait accompli", timing: "Act 3 opening" },
    { twist: "The thing that must be destroyed to stop the villain was created by one of the heroes' ancestors; destroying it affects them personally", timing: "Pre-final act" },
    { twist: "The campaign's mentor figure was never who they said they were; their real identity either makes them more valuable or more dangerous", timing: "Act 2" },
    { twist: "A political victory the heroes achieved in Act 1 has had cascading consequences that created the villain's current advantage", timing: "Act 2-3" },
    { twist: "The heroes' faction ally is the legitimate villain of a different story — one the heroes don't know about but whose victims are real", timing: "Act 3" },
    { twist: "The final confrontation location is inside a time loop; the heroes have been here before; they don't remember because they haven't survived yet", timing: "Final act" }
  ],

  // ── 24 Additional ADVENTURE HOOKS (total 36) ────────────────────────────
  adventureHooks: [
    "A cartographer's dying commission: find a location whose existence is a secret worth dying to keep",
    "The party's most trusted information source has delivered three pieces of information that all turned out to be false — deliberately",
    "An anonymous benefactor has paid off each hero's most significant debt, with a note: 'You'll know what for'",
    "A creature that should not be able to speak approaches each hero separately and says the same seven words",
    "The road to their next destination has been officially declared to not exist; it's still there when they walk it",
    "All records of the heroes' previous greatest accomplishment have been erased; they must prove they did it",
    "A funeral is being held for someone who isn't dead yet; the corpse at the service is a message",
    "A divination reveals that the heroes will fail — not might, will — and they must decide if they attempt it anyway",
    "The villain has sent them a job application, offering to hire them at three times what they currently earn",
    "A child has memorized the location of something critically important; they'll only share it with the heroes",
    "Someone has stolen something from each hero's past — not a physical object, but a memory, a relationship, a reputation",
    "The kingdom's most reliable weather oracle has made its first incorrect prediction in 200 years; the incorrect prediction is about the heroes",
    "A weapon that belonged to a dead legend has been found — it has already chosen its next owner, and that person is in this party",
    "An invitation arrives to a party that is being held next year; the invitation contains details of events that haven't happened yet",
    "The heroes are owed a favor by someone they have never met — who is calling it in now, immediately, without explanation",
    "A curse has made it impossible for anyone who knows the heroes' names to speak them aloud; strangers can, but allies cannot",
    "Three separate governments have all issued the same reward for the heroes' assistance with three separate crises in the same location",
    "A gate that only opens once per decade opens unexpectedly; something steps through before it closes; it immediately asks for help",
    "The heroes' likenesses appear in a painting that is documented as being 300 years old; the painting has more figures than the original inventory recorded",
    "An oracle refuses to give anyone prophecies until the heroes complete a specific task; a city's worth of people are waiting",
    "Something the heroes buried, sank, burned, or otherwise permanently disposed of is back, undamaged, sitting where they left it",
    "A note from their future selves warns them that the decision they're about to make is the wrong one; it doesn't say which decision",
    "Every animal the heroes encounter for a week has been behaving as if it recognizes them — and is frightened",
    "The site of the heroes' origin — their hometown, their training facility, their home plane — has been marked for destruction"
  ],

  // ── 20 Additional NPC ARCHETYPES (total 30) ─────────────────────────────
  npcArchetypes: [
    { role: "The Honest Villain Agent", desc: "Works for the villain but refuses to lie; will tell the heroes exactly what they plan, because they're confident it won't matter", personality: "Professionally courteous, genuinely confident, finds deception beneath their dignity" },
    { role: "The Competent Guard", desc: "Just doing their job; neither corrupt nor heroic; creates obstacles through sheer professionalism", personality: "Thorough, fair, genuinely doesn't care about the larger conflict" },
    { role: "The Former Hero", desc: "Was the last person to fight this villain; lost; has been building toward a second attempt ever since", personality: "Brittle confidence over deep doubt, too proud to ask for help, will give everything if asked directly" },
    { role: "The Useful Coward", desc: "Knows everything about the villain's operation; will not risk themselves; can be convinced through creativity", personality: "Self-aware about cowardice, genuinely informative when protected, occasionally surprising" },
    { role: "The Well-Meaning Obstacle", desc: "Is doing something that creates problems for the heroes based on incomplete information they won't share", personality: "Confident in their course, not malicious, would change direction with sufficient evidence" },
    { role: "The Person The Villain Used To Be", desc: "Knew the villain before they became who they are; holds memories that are both weapon and wound", personality: "Grief disguised as nostalgia, protective of complicated feelings, the villain's one remaining vulnerability" },
    { role: "The Ideologically Opposed Ally", desc: "Agrees on the immediate enemy; disagrees on everything else; useful now, adversary later", personality: "Principled, unapologetic, refuses to pretend they like the heroes more than they do" },
    { role: "The Successful Monster", desc: "Has done terrible things; those things worked; is not apologetic; currently being useful", personality: "Pragmatic, values the heroes as tools (which is mutual), oddly honest about its nature" },
    { role: "The Ordinary Person in an Extraordinary Position", desc: "A baker, a clerk, a farmer who happens to have witnessed something, know someone, or own something critical", personality: "Normal; doesn't want this; will help but needs protecting from the scope of what they're involved in" },
    { role: "The Rival Adventurer", desc: "Pursues the same goal through different methods; not a villain, not quite an ally; competition creates friction and occasionally saves lives", personality: "Confident, slightly resentful of the heroes' reputation, has skills the heroes lack" },
    { role: "The Realist", desc: "Provides accurate assessments that nobody wants to hear; is correct; everyone resents them for it", personality: "Blunt, accurate, genuinely caring underneath the delivery" },
    { role: "The Grieving Parent of the Villain", desc: "Raised the villain, loves them still, is not responsible for what they became, and is being targeted by both sides", personality: "Carrying impossible weight, fiercely protective, holds information that neither side knows they have" },
    { role: "The Expert Who Disagrees", desc: "The best available expert on the relevant subject; has a well-supported theory that contradicts the heroes' current plan", personality: "Frustrated at not being heard, not arrogant but used to being right, will help even if ignored" },
    { role: "The Innocent Bystander With Agency", desc: "Was in the wrong place; chose not to look away; now involved whether they want to be or not", personality: "Surprised by their own courage, learning as they go, represents what the heroes are fighting for" },
    { role: "The Fading Legend", desc: "Was once the most important person in a situation exactly like this one; that was forty years ago", personality: "Wisdom they can barely articulate, awareness that their time has passed, grateful to pass the torch" },
    { role: "The True Believer in the Wrong Cause", desc: "Believes sincerely in something the heroes oppose; is not personally bad; will not be swayed by argument, only by demonstrated results", personality: "Earnest, principled within their framework, capable of updating if reality sufficiently contradicts belief" },
    { role: "The Double Agent", desc: "Is working for both sides simultaneously; believes they can control the situation; they cannot", personality: "Exhausted, paranoid, occasionally too clever, genuinely doesn't know who to trust anymore" },
    { role: "The Institutional Memory", desc: "Has been working in a relevant institution for fifty years and remembers everything; what they remember is exactly what the heroes need", personality: "Comfortable, occasionally rambling, holds the exact key if the heroes have patience" },
    { role: "The Reluctant Heir", desc: "About to inherit something important — a title, a power, a responsibility — that they don't want; their choice shapes a faction's future", personality: "Conflicted, aware of their privilege, trying to find an option that doesn't exist" },
    { role: "The Person Who Has Already Given Up", desc: "Tried to stop the villain ten years ago; failed; has made peace with failure; can be reinspired but only by genuine heroism, not words", personality: "Resigned, not bitter, watching the heroes with tired hope" }
  ],

  // ── Additional REWARDS (doubled) ─────────────────────────────────────────
  rewards: {
    level1_5: [
      "A compass that points toward the nearest person who means you harm (Tier 1 — only works within 1 mile)",
      "A journal that translates any language into Common when the holder reads it",
      "A coin minted by a dead god; it is unspendable but functions as a divine focus for any tradition",
      "Bracers taken from a defeated lieutenant; they retain the original owner's muscle memory for one specific combat style",
      "A bottle of vintage wine that, when consumed as a group, lets the group share a dream that contains a clue",
      "A ledger from a villain's operation that is also a complex code for future plans — partially decoded",
      "A familiar that used to serve a villain's mage; it's loyal now but has extensive knowledge of the villain's household",
      "Deeds to a small building in a strategic city — run down, but legally theirs, with an interesting past"
    ],
    level6_10: [
      "A +2 weapon bearing a rune specifically designed to harm the campaign's primary villain type",
      "An amulet that once belonged to a saint; once per day, invoke it to ask a question a dead person would know",
      "A title — minor but real — that grants legal authority in a specific jurisdiction relevant to the campaign",
      "A contact in the villain's organization who has been turned and will pass intelligence (until they're caught)",
      "A library containing the villain's early research, before it went wrong; contains both knowledge and humanity",
      "A set of matched sending stones attuned to each party member — includes one that was the villain's",
      "A magic vessel (ship, wagon, mount) that is significantly faster than anything the villain controls"
    ],
    level11_15: [
      "A +2 specific weapon whose special properties were designed by a previous hero specifically to fight this type of villain",
      "A seat on a council or body with genuine decision-making authority over something relevant to the campaign",
      "A divine compact with a mid-tier deity: one use of a 8th-rank divine spell at a narratively appropriate moment",
      "An item confiscated from the villain's treasury; it contains information about the villain's plan in addition to its magic properties",
      "A strategic fortress or position that, if held, provides ongoing mechanical and narrative advantages",
      "A contact who is the villain's equal in power but opposes them; will assist once per act if properly maintained"
    ],
    level16_20: [
      "A weapon forged specifically for this campaign's final confrontation; it grows more powerful as the party approaches the end",
      "A divine blessing from a major deity who has been watching and is satisfied: permanent +1 to all saves for each party member",
      "The villain's personal artifact — de-powered but historically significant, with information inside it",
      "A political settlement that ends a secondary conflict and grants the heroes lasting regional authority",
      "A permanent planar contact of significant power who considers themselves in the heroes' debt",
      "Knowledge of a divine secret that is both gift and burden — it answers a question about the world that changes how everything looks"
    ]
  },

  // ── 15 Additional ENCOUNTER TYPES (total 25) ────────────────────────────
  encounterTypes: [
    { type: "Negotiation Under Duress", desc: "Heroes must negotiate while under threat; concessions affect future mechanical options" },
    { type: "Environmental Hazard Race", desc: "Combat occurs simultaneously with a spreading hazard; heroes must manage both" },
    { type: "Ambush Reversal", desc: "Heroes are ambushed but have foreknowledge; they can set a counter-trap if they act quickly" },
    { type: "Ally in Peril", desc: "An NPC ally is in danger during the encounter; split attention has mechanical costs" },
    { type: "Graduated Escalation", desc: "Encounter gets harder in timed waves; heroes must decide how long to stay" },
    { type: "Information Extraction", desc: "Combat objective is intelligence, not survival; enemies defeated before they're questioned don't count" },
    { type: "Propaganda Scene", desc: "Heroes must complete an objective in front of a watching crowd whose opinion matters politically" },
    { type: "The Trap That Was Expected", desc: "Heroes walk into a trap they knew about; the trap is also a trap for the people who set it" },
    { type: "Consequence Encounter", desc: "An early decision catches up with the heroes; they face enemies empowered or allies weakened by their past choices" },
    { type: "Divided Party Crisis", desc: "The party must split to handle simultaneous threats; coordination becomes the tactical challenge" },
    { type: "Protected Escort", desc: "A specific NPC must survive the encounter without the heroes' active protection" },
    { type: "Mercy Option", desc: "Villain agent can be defeated or converted; converting them requires non-lethal approach and has downstream effects" },
    { type: "Resource Denial", desc: "Enemy's objective is to exhaust specific hero resources before the next encounter; heroes must conserve" },
    { type: "Timed Ritual", desc: "Heroes must interrupt a ritual within a set number of rounds; failure changes the following encounter" },
    { type: "The Third Party", desc: "A neutral or hostile third faction intervenes mid-encounter; allegiances can shift depending on who they helped" }
  ],

  // ── 9 Additional BOSS ENCOUNTER TEMPLATES (total 15) ───────────────────
  bossEncounters: [
    { name: "The Frozen Moment", setup: "Boss has stopped time partially; some things move freely, others are locked mid-action", phase2: "Boss begins losing control of the time-stop; frozen moments begin releasing chaotically", environment: "Suspended objects (can be used as cover or weapons), slowed movement zones, projectiles frozen mid-flight" },
    { name: "The Burning Library", setup: "Fight occurs in an archive as fire spreads; the books contain critical information that burns with them", phase2: "Core archive section catches fire; heroes must choose combat priority over preservation", environment: "Spreading fire (2d6 fire per round in burning squares), smoke (concealment), falling shelves (hazard)" },
    { name: "The Judgment Hall", setup: "Boss has called the heroes before a supernatural court; the fight is also a trial", phase2: "Judgment is rendered mid-combat; the outcome shifts terrain based on who the court believes", environment: "Witnesses who can be questioned, scales of fate (tip them for mechanical advantage), divine observers" },
    { name: "The Sunken Sanctum", setup: "Location is flooding; water level rises each round; boss is amphibious", phase2: "Full submersion; half the party may need water breathing; boss is now in optimal environment", environment: "Rising water level, submerged exits, floating debris, boss's movement advantage in water" },
    { name: "The Crowd", setup: "Final confrontation happens in a public space full of civilians being used as shields", phase2: "Boss begins sacrificing hostages to power abilities; heroes must respond without enabling further harm", environment: "Civilians (AoE radius reduced or reputation lost), escape paths the boss is blocking, terrain heroes cannot use aggressively" },
    { name: "The Prison Break Reversal", setup: "Heroes are fighting to keep the boss imprisoned rather than defeat them; boss is trying to escape", phase2: "One seal breaks; boss becomes significantly more powerful; heroes must restore it while fighting", environment: "Containment seals to protect, weakened walls, the thing that was keeping the boss contained now threatens heroes too" },
    { name: "The Dragon's Hoard", setup: "Boss fights surrounded by the physical weight of everything they've taken; the hoard is both resource and liability", phase2: "Boss begins weaponizing the hoard itself; treasures become projectiles and obstacles", environment: "Treasure as difficult terrain, magical items that trigger randomly when disturbed, the hoard's actual owners" },
    { name: "The Echo Chamber", setup: "Space perfectly replicates every sound at random intervals from random directions; ambushes are meaningless, positioning is everything", phase2: "Boss learns to exploit the echoes offensively; misdirection becomes a primary attack", environment: "Sound-based confusion (flat-footed to non-sonic attacks without Perception check), echo weapons, sound-deadened zones" },
    { name: "The Ascension Interrupted", setup: "Boss is mid-ritual of apotheosis; completing it makes them a god; interrupting it has unpredictable results", phase2: "Partial ascension; boss is half-divine, unstable, dangerous in new ways; the ritual energy is now free", environment: "Active ritual energy (persistent damage types), divine manifestations, the ritual's target deity's attention" }
  ],

  // ── 60 LOCATION NAMES (for procedural map naming) ────────────────────────
  locationNames: {
    settlements: [
      "Ashford","Blackwater","Brightmoor","Coldhaven","Duskgate","Embervale","Frostholm","Gildenport",
      "Hallowmere","Ironbridge","Jadefield","Knotwood","Lastwatch","Mirrorfen","Nightshore","Oldstone",
      "Pilgrim's Rest","Quickwater","Ravensholm","Saltmere","Thornwall","Undergate","Veilmoor","Whitecross",
      "Ximber's Crossing","Yellwood","Zephyr's Landing","Archenford","Bitterwell","Cauldronstone",
      "Deepmarrow","Emberholt","Flickwick","Graymantle","Hollow Crown","Ironwhisper","Juniper Falls",
      "Kettledrum","Lichwarden","Molten Fork","Nightwood","Ossuarton","Parchment Bay","Quickthorn",
      "Ruin's Edge","Shadowmere","Thistledown","Umbra Port","Verdant Cross","Wanderer's Gate",
      "Xander's Reach","Yewthorn","Zenith Point","Aspen Fall","Bloodmoor","Copper Gate"
    ],
    ruins: [
      "The Shattered Archive","Drowned Spire","The Forgotten Vault","Ember Sanctum","Ironheart Delve",
      "Pale Cathedral","The Sunken Throne","Crystal Colosseum","Collapsed Senate","The Wandering Ruin",
      "Dust Palace","The Unmarked Tomb","Hollow Titan","The Sealed Library","First City Remnants",
      "The Burning Archive","Corroded Vault","The Sleeping Army's Barracks","Null Tower","The Erased City"
    ],
    landmarks: [
      "The Wound in the World","Heaven's Scar","The Blind Eye Crater","Where Two Gods Fought",
      "The Pillar of Consequences","Memory Stone","The Halfway Bridge","Gate of No Return",
      "The Listening Mountain","Where the Sea Fell Upward","The Unmapped Valley","Sorrow's Peak",
      "The Living Wall","Ancient Quarrel","The Long Slide","Consensus Point"
    ]
  },

  // ── 40 MILESTONE EVENTS (for act generation) ────────────────────────────
  milestones: [
    "Heroes discover the villain's true identity",
    "First major casualty on the allied side — someone the heroes knew",
    "A faction ally betrays the heroes",
    "Heroes obtain their first major tactical advantage over the villain",
    "A faction ally dies and their resources fall to the heroes",
    "Heroes fail a significant objective; consequences ripple forward",
    "Heroes learn what the villain actually wants — it's more complex than expected",
    "First direct confrontation with the villain ends without decisive victory for either side",
    "A secret revealed changes heroes' understanding of their own origin",
    "Heroes gain access to a long-sought strategic resource",
    "A neutral party declares their allegiance",
    "Heroes must choose between saving one person or stopping a larger harm",
    "The villain offers a genuine truce with conditions the heroes must consider",
    "Heroes discover they've been working with incomplete information since Act 1",
    "A seemingly defeated threat returns transformed",
    "Heroes learn the villain's weakness — and that weakness is also their own",
    "A powerful NPC ally is incapacitated at the worst possible moment",
    "Heroes gain an unexpected ally in the most unlikely place",
    "The location of the final confrontation is revealed",
    "Heroes make a choice that cannot be undone; its effects will be felt at the ending",
    "A long-held secret about the campaign world is revealed",
    "Heroes prevent a crisis they didn't know was coming",
    "A piece of the villain's plan succeeds despite the heroes' best efforts",
    "Heroes are given an opportunity to stop the campaign early at significant personal cost",
    "A character from an earlier act returns as a major figure",
    "The scope of the campaign's threat expands beyond original understanding",
    "Heroes discover the villain has been watching them since before Act 1",
    "A magical resource the heroes depend on becomes unavailable",
    "Heroes learn they have been fulfilling a prophecy — one they didn't know about",
    "An act of mercy directly prevents a catastrophe the heroes didn't anticipate",
    "Heroes are offered power equivalent to the villain's — and must refuse or accept",
    "A former enemy saves the heroes at a critical moment",
    "Heroes discover that winning this way will have costs they hadn't accounted for",
    "The real mastermind behind the campaign's events is revealed",
    "Heroes have an opportunity to change the terms of the final confrontation",
    "A location from Act 1 becomes the site of the final battle",
    "A sacrifice is required; the heroes must decide who makes it",
    "The villain reveals they prepared specifically for how the heroes fight",
    "A piece of the world is permanently changed by the heroes' actions",
    "The heroes learn what success will actually look like — and it's different from what they imagined"
  ],

  // ── 30 RUMOR SEEDS (for hex exploration and NPC chatter) ────────────────
  rumors: [
    "Three merchants have gone missing on the same road; they left from different cities on different days",
    "A temple's divine fire went out for the first time in 200 years; the priests are pretending it didn't",
    "Someone is buying up property adjacent to a specific building without ever visiting it",
    "A militia patrol found tracks that went into the forest and never came back out",
    "The river upstream tastes different than it did a month ago; nobody knows why",
    "A child in town has started speaking a language that doesn't exist",
    "The new archivist at the records hall has been burning documents after hours",
    "A local farmer is selling produce that doesn't grow in this climate",
    "Three people have independently reported the same dream about a burning tower",
    "A merchant guild has raised prices on a single specific material that has no obvious use",
    "A door in an alley that was previously a wall appeared two weeks ago; it's locked",
    "The garrison commander has been receiving visitors at midnight who leave before dawn",
    "A famous adventurer who was reported dead three years ago was spotted in the market",
    "Several locals have received letters from family members who have been dead for years",
    "The old cemetery at the edge of town has fresh flowers on every grave that appears overnight",
    "A ship arrived in port with no crew and its manifest written in a language that predates the nation",
    "An oracle has refused every client for the past two weeks, citing 'too much noise'",
    "Two guild rivals who despised each other were seen leaving a tavern together, laughing",
    "A well that went dry twenty years ago is producing water again — different water than before",
    "Someone has been leaving the same specific book on doorsteps throughout the merchant district",
    "A soldier who deserted five years ago has returned; he's not aging and doesn't remember leaving",
    "Three separate witnesses report seeing a figure on the city walls who vanishes when approached",
    "An alchemist has been buying large quantities of a specific reagent with no professional application",
    "The town's dogs all started behaving differently on the same night last week",
    "A foreign dignitary arrived without announcement and departed without meeting anyone official",
    "Someone has been systematically removing specific stones from the old city wall at night",
    "A popular tavern has been quietly refusing service to anyone who asks for a specific drink",
    "A cartographer's shop has started turning away customers and closing early without explanation",
    "Three different people in town claim to own the same specific house — each has documentation",
    "A bird arrived carrying a message in a cipher no one recognizes, died immediately after, and cannot be resurrected"
  ],

  // ── 20 WEATHER/ATMOSPHERE EVENTS ─────────────────────────────────────────
  atmosphericEvents: [
    "A fog that refuses to lift regardless of sunlight; sounds carry further inside it",
    "Rain that falls upward in a specific 100-foot radius around a location of significance",
    "Snow that leaves no footprints, regardless of depth",
    "Dry lightning that strikes the same spot each night at the same time",
    "A wind that always blows from the same direction, even inside buildings",
    "Temperatures dropping 20 degrees suddenly at a specific hour every afternoon",
    "All clouds forming the same shape — recognizable as a face — for a week",
    "Perfect weather for three months with no variation whatsoever; uncanny rather than pleasant",
    "A smell of ozone and burnt metal permeating a region with no obvious source",
    "Stars visible in daytime, one at a time, appearing and disappearing over six days",
    "An aurora not connected to any pole, appearing directly overhead at the campaign's central location",
    "Morning dew that forms patterns — runes, maps, or words — on flat surfaces before evaporating",
    "A permanent rainbow in the same spot regardless of sun angle or moisture",
    "Wind that carries whispered words that are almost intelligible",
    "An eclipse that affects only a specific building while the rest of the city has normal sunlight",
    "Seasonal flowers blooming out of season in the exact shape of a six-pointed symbol",
    "Night that falls two hours early in a specific district while the rest of the city remains lit",
    "Moonlight that casts shadows in impossible directions in a specific clearing",
    "A thunderstorm that produces no rain, only thunder and lightning, centered perfectly over a location",
    "Birds that roost but won't fly, for weeks, as if waiting for something"
  ]
};

// ── Merge into COMPONENTS at runtime ─────────────────────────────────────
if (typeof COMPONENTS !== 'undefined') {
  // Append villainArchetypes
  COMPONENTS_EXTRA.villainArchetypes.forEach(v => COMPONENTS.villainArchetypes.push(v));

  // Append locations
  ['urban','wilderness','dungeon','planar'].forEach(k => {
    COMPONENTS_EXTRA.locations[k].forEach(l => COMPONENTS.locations[k].push(l));
  });

  // Append factions
  COMPONENTS_EXTRA.factions.forEach(f => COMPONENTS.factions.push(f));

  // Append sideQuestTemplates
  COMPONENTS_EXTRA.sideQuestTemplates.forEach(s => COMPONENTS.sideQuestTemplates.push(s));

  // Append plotTwists
  COMPONENTS_EXTRA.plotTwists.forEach(t => COMPONENTS.plotTwists.push(t));

  // Append adventureHooks
  COMPONENTS_EXTRA.adventureHooks.forEach(h => COMPONENTS.adventureHooks.push(h));

  // Append npcArchetypes
  COMPONENTS_EXTRA.npcArchetypes.forEach(n => COMPONENTS.npcArchetypes.push(n));

  // Merge rewards (add to each tier)
  ['level1_5','level6_10','level11_15','level16_20'].forEach(tier => {
    if (COMPONENTS_EXTRA.rewards[tier]) {
      COMPONENTS_EXTRA.rewards[tier].forEach(r => COMPONENTS.rewards[tier].push(r));
    }
  });

  // Append encounterTypes
  COMPONENTS_EXTRA.encounterTypes.forEach(e => COMPONENTS.encounterTypes.push(e));

  // Append bossEncounters
  COMPONENTS_EXTRA.bossEncounters.forEach(b => COMPONENTS.bossEncounters.push(b));

  // Add new arrays wholesale
  COMPONENTS.locationNames = COMPONENTS_EXTRA.locationNames;
  COMPONENTS.milestones    = COMPONENTS_EXTRA.milestones;
  COMPONENTS.rumors        = COMPONENTS_EXTRA.rumors;
  COMPONENTS.atmosphericEvents = COMPONENTS_EXTRA.atmosphericEvents;
}

if (typeof module !== 'undefined') module.exports = COMPONENTS_EXTRA;
