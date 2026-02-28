/**
 * data/social.js — Build 6
 * PF2e Social Interaction Generator Data
 * Covers: Influence encounters, attitude tracks, skill challenges,
 *         NPC dialogue hooks, negotiation scenes, group influence events
 */

const SOCIAL_DATA = {

  // ── PF2e Attitude Track ──────────────────────────────────────────────────
  attitudeTrack: ['Hostile','Unfriendly','Indifferent','Friendly','Helpful'],

  // ── Influence DC by level ────────────────────────────────────────────────
  // Per GM Core influence rules: DC = 14 + NPC level (approx)
  influenceDCByLevel: function(npcLevel) {
    return 14 + Math.max(0, npcLevel);
  },

  // ── Social skill applications (PF2e Remaster) ────────────────────────────
  socialSkills: {
    Diplomacy: {
      actions: ['Make an Impression (1 min)', 'Request (1 action)', 'Gather Information (1 hr)'],
      critSuccess: 'Attitude improves by 2 steps',
      success:     'Attitude improves by 1 step',
      failure:     'No change; may retry after 1 hour',
      critFailure: 'Attitude worsens by 1 step; can\'t retry this scene',
    },
    Deception: {
      actions: ['Create a Diversion (1 action)', 'Impersonate', 'Lie'],
      critSuccess: 'Target believes lie completely; +2 to follow-up Deception',
      success:     'Target believes lie; Deception check secret',
      failure:     'Target doesn\'t believe; may become suspicious',
      critFailure: 'Target knows you lied; attitude worsens 1 step',
    },
    Intimidation: {
      actions: ['Coerce (1 min)', 'Demoralize (1 action)'],
      critSuccess: 'Target Coerced; cooperates for 1 week without resentment',
      success:     'Target Coerced; cooperates but becomes unfriendly afterward',
      failure:     'Target refuses; becomes Unfriendly if not already',
      critFailure: 'Target refuses; becomes Hostile; may retaliate',
    },
    Performance: {
      actions: ['Perform (1 action to 10 min)'],
      critSuccess: 'Audience thoroughly impressed; attitude improves 1 step + Reputation boost',
      success:     'Acceptable performance; fits social expectation',
      failure:     'Awkward; no social benefit',
      critFailure: 'Embarrassing; attitude worsens 1 step',
    },
    Society: {
      actions: ['Recall Knowledge (1 action)', 'Subsist in society'],
      critSuccess: 'Recall obscure detail + bonus information about NPC weakness',
      success:     'Recall accurate information; know NPC\'s formal title/background',
      failure:     'No useful information recalled',
      critFailure: 'Recall wrong information; may act on false belief',
    },
    Lore: {
      actions: ['Recall Knowledge (1 action)', 'Relevant lore checks'],
      critSuccess: 'Expert knowledge gives +1 circumstance to all checks with this NPC this scene',
      success:     'Knowledgeable approach acknowledged; NPC more receptive',
      failure:     'No advantage gained',
      critFailure: 'Demonstrated ignorance; NPC loses respect',
    },
  },

  // ── NPC Personality Matrices ─────────────────────────────────────────────
  // Each archetype has: weak points (lower DC by 2), resistances (+2 DC),
  // preferred approach, and a secret that shifts everything if revealed
  npcPersonalityMatrices: [
    {
      archetype:  'The Power Broker',
      weakPoints: ['demonstrating competence','offering something they can\'t get elsewhere','name-dropping the right contacts'],
      resistances:['emotional appeals','moral arguments','showing weakness'],
      preferred:  'Diplomacy or Society (formal channels)',
      secret:     'They owe a debt to someone the heroes know; revealing this makes them Helpful instantly',
      dialogueHook: '"I don\'t do favors. I do exchanges. What are you offering that I don\'t already have?"',
    },
    {
      archetype:  'The True Believer',
      weakPoints: ['aligning with their ideology','showing personal sacrifice','questioning the villain\'s loyalty to the cause'],
      resistances:['pragmatic arguments','appeals to self-interest','threats'],
      preferred:  'Deception (pretend to share beliefs) or Diplomacy (genuine philosophical engagement)',
      secret:     'They privately doubt a core tenet; a successful DC+5 Perception check spots it, then Diplomacy DC drops by 4',
      dialogueHook: '"You think this is about him? This is about what the world could be. That doesn\'t end with any one person."',
    },
    {
      archetype:  'The Grieving Parent / Lost One',
      weakPoints: ['acknowledging their loss without minimizing it','offering genuine help','sharing your own loss'],
      resistances:['logic and reason','time pressure','anything that dismisses the emotional reality'],
      preferred:  'Medicine (show you care for life) or Diplomacy (genuine empathy)',
      secret:     'They believe the heroes caused or could have prevented the loss; revealed = Hostile until addressed',
      dialogueHook: '"You want my help? Do you even know what I\'ve lost? Do you have any idea what it costs to get up in the morning?"',
    },
    {
      archetype:  'The Exhausted Official',
      weakPoints: ['doing the paperwork for them','demonstrating the least-effort path to compliance','offering plausible deniability'],
      resistances:['idealism','urgency','anything that creates more work'],
      preferred:  'Society (understand bureaucratic process) or Deception (create paper trail)',
      secret:     'They\'ve been covering up something for years and desperately need absolution; finding this gives permanent Helpful',
      dialogueHook: '"File the form. Come back in three days. That\'s the process. I don\'t make the process."',
    },
    {
      archetype:  'The Proud Warrior',
      weakPoints: ['demonstrating martial skill or honor','acknowledging their reputation','formal challenge'],
      resistances:['social manipulation','appeals to fear','anything perceived as disrespect'],
      preferred:  'Athletics or Intimidation (show capability) rather than social finesse',
      secret:     'They consider themselves already defeated by something; a hero who acknowledges this gains automatic Friendly',
      dialogueHook: '"I\'ve heard of you. Now I\'ll see for myself whether what I\'ve heard is worth anything."',
    },
    {
      archetype:  'The Merchant',
      weakPoints: ['profit motive','exclusive information with value','debt forgiveness or future business'],
      resistances:['moral appeals','non-transactional approaches','anything that costs them money'],
      preferred:  'Diplomacy (deal-making) or Deception (overvaluing what you offer)',
      secret:     'They\'re deeply in debt to the villain; help them out and gain absolute loyalty',
      dialogueHook: '"I like you. I\'m going to give you my second-best price. That\'s practically a gift."',
    },
    {
      archetype:  'The Scholarly Recluse',
      weakPoints: ['demonstrating genuine intellectual curiosity','sharing rare knowledge they don\'t have','patience and respect for their work'],
      resistances:['social pressure','emotional appeals','interrupting them'],
      preferred:  'Arcana/Lore (demonstrate knowledge) or Society (academic courtesy)',
      secret:     'Their research accidentally created part of the problem; they\'ll do anything to fix it quietly',
      dialogueHook: '"Yes, yes, come in. Don\'t touch anything. What do you know about apocryphal 4th-century Thassilonian numerology? No? Then this may take a while."',
    },
    {
      archetype:  'The Street Informant',
      weakPoints: ['coin','protection from someone who\'s threatened them','information they want in return'],
      resistances:['authority figures nearby','being seen talking to adventurers','abstract promises'],
      preferred:  'Thievery (demonstrate underworld credibility) or Deception (play dumb)',
      secret:     'They\'re working for the villain already but hate it; right offer = doubles as your agent',
      dialogueHook: '"I don\'t know nothing. Even if I did, knowing things is dangerous around here. You understand what I\'m saying?"',
    },
  ],

  // ── Social Encounter Templates ────────────────────────────────────────────
  socialEncounterTemplates: [
    {
      name:      'The Negotiation',
      type:      'Influence',
      structure: 'Two sides with competing interests. 3 rounds. Each round: one primary skill check and one supporting skill check.',
      stakes:    'Success: alliance or information gained. Failure: deal falls through; relationship sours.',
      terrain:   'Neutral ground chosen by NPC — a tavern private room, open market, or formal hall',
      complication: 'A third party interrupts mid-negotiation with competing interest',
      skillChecks: [
        { skill:'Diplomacy', dc_mod: 0,  purpose:'Primary persuasion attempt' },
        { skill:'Society',   dc_mod:-2,  purpose:'Recall NPC background to gain advantage' },
        { skill:'Deception', dc_mod:+2,  purpose:'Bluff about your actual position' },
        { skill:'Insight',   dc_mod: 0,  purpose:'Sense Motive to detect when they\'re softening' },
      ],
    },
    {
      name:      'The Public Confrontation',
      type:      'Challenge',
      structure: 'Heroes must make their case before an audience. NPC\'s attitude shaped by crowd reaction. 5 skill checks, audience present.',
      stakes:    'Success: public opinion shifts, NPC reputation tied to heroes. Failure: public humiliation, permanent Unfriendly.',
      terrain:   'Town square, courtroom, market stage, noble hall with attendees',
      complication: 'Villain\'s agent in the crowd actively works to undermine the heroes (opposed Deception)',
      skillChecks: [
        { skill:'Diplomacy',    dc_mod:+2, purpose:'Formal argument to audience and NPC simultaneously' },
        { skill:'Performance',  dc_mod: 0, purpose:'Delivery and presentation' },
        { skill:'Society',      dc_mod: 0, purpose:'Know the right forms and honorifics' },
        { skill:'Perception',   dc_mod: 0, purpose:'Spot the plant in the crowd before they act' },
        { skill:'Intimidation', dc_mod:+4, purpose:'Silence a heckler — risky but effective' },
      ],
    },
    {
      name:      'The Private Interview',
      type:      'Influence',
      structure: 'One-on-one. NPC tests the heroes before revealing anything. 3 rounds of escalating personal questions.',
      stakes:    'Success: NPC becomes trusted contact + reveals crucial plot information. Failure: NPC clams up permanently.',
      terrain:   'NPC\'s private space — reveals their character (sparse monk\'s cell, cluttered scholar\'s study, suspicious merchant\'s back room)',
      complication: 'An unexpected item in the room reveals a secret; using it changes everything',
      skillChecks: [
        { skill:'Diplomacy',  dc_mod: 0, purpose:'Answer their questions honestly (or apparently so)' },
        { skill:'Deception',  dc_mod: 0, purpose:'Lie convincingly when the truth is too dangerous' },
        { skill:'Perception', dc_mod:-2, purpose:'Notice the clue in the room' },
        { skill:'Society',    dc_mod:-2, purpose:'Understand the subtext of what they\'re really asking' },
      ],
    },
    {
      name:      'The Timed Extraction',
      type:      'Chase/Social Hybrid',
      structure: 'Heroes must obtain information or cooperation before an event occurs (guards arrive, meeting ends, ship leaves). 4 checks, escalating pressure.',
      stakes:    'Success: information + clean exit. Failure: incomplete information + combat or exposure.',
      terrain:   'A restricted location — noble\'s estate during a party, military camp, rival faction HQ',
      complication: 'The NPC isn\'t who they claimed to be',
      skillChecks: [
        { skill:'Deception',   dc_mod: 0, purpose:'Maintain cover while extracting info' },
        { skill:'Diplomacy',   dc_mod:+2, purpose:'Convince NPC to speed up cooperation' },
        { skill:'Thievery',    dc_mod: 0, purpose:'Access locked room or document' },
        { skill:'Athletics',   dc_mod: 0, purpose:'Quick exit if things go sideways' },
      ],
    },
    {
      name:      'The Redemption Offer',
      type:      'Influence (Villain Adjacent)',
      structure: 'Heroes attempt to turn a villain\'s lieutenant or agent. Requires 3 successes before 2 failures. Each success shifts attitude by 1 step.',
      stakes:    'Success: new ally who knows villain\'s plans. Failure: agent reports back — villain is warned.',
      terrain:   'Clandestine meeting away from villain\'s eyes — abandoned building, wilderness camp, coded letters',
      complication: 'Agent wants to turn but a loved one is being held by the villain as insurance',
      skillChecks: [
        { skill:'Diplomacy',    dc_mod: 0, purpose:'Make the case that there\'s a better path' },
        { skill:'Insight',      dc_mod:-2, purpose:'Understand what they truly want' },
        { skill:'Deception',    dc_mod:+2, purpose:'Pretend you can guarantee safety (you can\'t)' },
        { skill:'Intimidation', dc_mod:+4, purpose:'Threaten consequences — works short term, damages trust' },
        { skill:'Society',      dc_mod:-2, purpose:'Know what the villain has over them' },
      ],
    },
    {
      name:      'The Group Audience',
      type:      'Influence (Group)',
      structure: 'Heroes address a faction council, village leaders, or noble court. Each member has individual attitude. Need majority Friendly to succeed.',
      stakes:    'Majority Friendly: faction support unlocked. Majority Hostile: faction becomes active obstacle.',
      terrain:   'Formal hall or council chamber. Seating arrangement matters — some members influence others.',
      complication: 'One council member is the villain\'s agent and actively opposes every point',
      skillChecks: [
        { skill:'Diplomacy',  dc_mod:+2, purpose:'Address the group as a whole' },
        { skill:'Society',    dc_mod: 0, purpose:'Address each member by correct title and concern' },
        { skill:'Perception', dc_mod: 0, purpose:'Identify the most influential and the most hostile member' },
        { skill:'Performance',dc_mod: 0, purpose:'Maintain composure under hostile questioning' },
        { skill:'Lore',       dc_mod:-2, purpose:'Reference faction history to establish credibility' },
      ],
    },
    {
      name:      'The Interrogation',
      type:      'Challenge',
      structure: 'Heroes question a reluctant prisoner or captive. 4 checks. Each failure makes subsequent checks harder (+2 DC).',
      stakes:    'Full success: complete truthful information. Partial: some truth, some lies. Failure: information withheld or false.',
      terrain:   'Secure location. Time pressure implicit — prisoner may be found or rescued.',
      complication: 'Prisoner is protected by a Silence or Zone of Truth spell that cuts both ways',
      skillChecks: [
        { skill:'Intimidation', dc_mod: 0, purpose:'Break down psychological resistance' },
        { skill:'Insight',      dc_mod: 0, purpose:'Detect lies in real time' },
        { skill:'Diplomacy',    dc_mod:-2, purpose:'Offer genuine deal in exchange for cooperation' },
        { skill:'Deception',    dc_mod: 0, purpose:'Pretend you already know the answer to test truth' },
      ],
    },
    {
      name:      'The Social Ambush',
      type:      'Surprise Social',
      structure: 'Heroes unexpectedly encounter a key NPC in a social setting (party, market, tavern). 1 round to make an impression before NPC leaves or situation changes.',
      stakes:    'Success: future meeting arranged; NPC remembers heroes favorably. Failure: NPC departs with negative impression.',
      terrain:   'A public social event where combat is impossible and observation likely',
      complication: 'The villain is also present at the event and is watching',
      skillChecks: [
        { skill:'Diplomacy',  dc_mod: 0, purpose:'Make an Impression (PF2e action)' },
        { skill:'Performance',dc_mod:-2, purpose:'Stand out memorably in a crowd' },
        { skill:'Deception',  dc_mod: 0, purpose:'Conceal your true purpose from villain\'s observation' },
        { skill:'Perception', dc_mod: 0, purpose:'Notice the villain watching before acting' },
      ],
    },
  ],

  // ── Dialogue Hook Banks ───────────────────────────────────────────────────
  openingLines: [
    'We\'ve been expecting someone like you. The question is whether you\'re the right someone.',
    'I know why you\'re here. The more interesting question is why I should care.',
    'You have thirty seconds. Make them matter.',
    'Before you say anything — I\'ve already heard the pitch. What I haven\'t heard is the truth.',
    'Sit down. You look like you\'ve been running. People who are running usually have something chasing them.',
    'I don\'t talk to strangers. Tell me something that makes you not a stranger.',
    'Interesting timing. Either you planned this, or fate has a sense of humor. Which worries me more depends on the answer.',
    'My people say you\'re trustworthy. My experience says no one is. Let\'s see who\'s right.',
    'I\'ve been offered better deals by worse people. Start with why yours is different.',
    'You\'re not what I expected. That\'s either very good or very bad.',
  ],

  revealLines: [
    'All right. There\'s something you need to know — and something I need you to not repeat.',
    'I\'ve been carrying this for years. If I tell you, I can\'t take it back.',
    'What I\'m about to say ends my career if it leaves this room. Are you willing to carry that?',
    'The truth is uglier than you\'re ready for. But you need it anyway.',
    'Ask me the question you\'re afraid to ask. I\'ll answer it.',
    'You\'ve earned this much: the real reason I haven\'t helped anyone before now.',
    'I know something about your villain that even they don\'t know you know.',
    'Stop. Before you ask anything else — let me show you something.',
  ],

  conditionLines: [
    'I\'ll help. But I need something first — something only you can provide.',
    'There\'s a price. Not gold. Something harder.',
    'My cooperation comes with one condition. You won\'t like it.',
    'Help me, and I help you. Simple. Except the help I need isn\'t simple at all.',
    'I need you to leave someone alone. Someone you\'re probably planning to hurt.',
    'Promise me — and mean it — that when this is over, you\'ll do one thing.',
    'I\'ll give you what you need. After you tell me why I should trust you with it.',
    'Before this goes further: do you understand what you\'re actually asking me to risk?',
  ],

  refusalLines: [
    'No. And if you push this, the answer becomes a warning.',
    'I\'ve survived by knowing when to stay uninvolved. This is that moment.',
    'You\'re asking me to step into a war I didn\'t start. The answer is no.',
    'Come back with something that changes my math. Right now the math says no.',
    'I appreciate the candor. The answer\'s still no. Don\'t make me repeat it.',
    'I like you. I liked the last people who made this request too, before they disappeared.',
    'What you\'re offering doesn\'t cover what you\'re asking me to risk. Come back when the math works.',
    'No. But I\'ll tell you who might say yes — and why they\'re more desperate than I am.',
  ],

  // ── Skill Challenge Frameworks ────────────────────────────────────────────
  skillChallenges: [
    {
      name:      'Crossing the Political Divide',
      context:   'Heroes need two rival factions to work together. Each faction requires separate persuasion, then a joint meeting.',
      rounds:    5,
      successes: 4,
      failures:  2,
      skills:    ['Diplomacy','Society','Deception','Insight','Performance'],
      stakes:    { success:'Both factions ally — heroes gain combined resources', failure:'Factions remain divided; heroes must choose one', critSuccess:'Factions form lasting alliance independent of heroes' },
    },
    {
      name:      'The Cover Story',
      context:   'Heroes must maintain a false identity through a formal event (banquet, ceremony, inspection). Each interaction is a check.',
      rounds:    6,
      successes: 4,
      failures:  2,
      skills:    ['Deception','Society','Perception','Performance','Stealth'],
      stakes:    { success:'Cover maintained; objective achieved', failure:'Exposed; combat or chase scene', critSuccess:'Cover maintained AND a useful contact made' },
    },
    {
      name:      'Swaying the Council',
      context:   'Heroes petition a ruling body. Each council member is a separate challenge; one influences others.',
      rounds:    7,
      successes: 5,
      failures:  3,
      skills:    ['Diplomacy','Society','Intimidation','Lore','Insight'],
      stakes:    { success:'Council votes in heroes\' favor', failure:'Petition denied; heroes lose standing with faction', critSuccess:'Council votes favorably AND provides unexpected resource' },
    },
    {
      name:      'The Manhunt (Social)',
      context:   'Heroes must locate someone hidden in a city through social network. Each check gathers information or trust.',
      rounds:    5,
      successes: 3,
      failures:  2,
      skills:    ['Diplomacy','Deception','Intimidation','Society','Perception'],
      stakes:    { success:'Target located', failure:'Target warned and flees; harder to find', critSuccess:'Target located + learn why they\'re hiding (bonus plot info)' },
    },
    {
      name:      'The Trial',
      context:   'Heroes or an ally face a formal accusation. Must gather evidence, examine witnesses, and make final argument.',
      rounds:    8,
      successes: 5,
      failures:  3,
      skills:    ['Diplomacy','Society','Insight','Deception','Intimidation','Lore'],
      stakes:    { success:'Acquittal; heroes gain Reputation', failure:'Conviction; ally imprisoned or heroes fined', critSuccess:'Acquittal + accuser exposed; villain loses agent' },
    },
  ],

  // ── Social Encounter Complications ───────────────────────────────────────
  complications: [
    'A former enemy of one hero walks in mid-conversation',
    'The NPC receives urgent news that changes their priorities during the scene',
    'Another party is also attempting to influence this NPC simultaneously',
    'A Zone of Truth is active; both sides know both sides can\'t lie',
    'One hero\'s past action (good or bad) is brought up unexpectedly',
    'The NPC\'s subordinate objects loudly and must be managed',
    'The meeting location is suddenly unsafe — continue, flee, or fight',
    'The NPC reveals they already know about the party\'s mission',
    'A third-party observer is identified — will they report back to someone?',
    'The NPC\'s terms change mid-negotiation based on a message they receive',
    'One party member\'s true identity or background is revealed',
    'The NPC tests heroes with a deliberate lie to see if they catch it',
  ],

  // ── Reputation System (PF2e Remaster) ────────────────────────────────────
  reputationTiers: [
    { tier: 'Revered',    threshold: 30, effect: 'Attitude starts Helpful; NPCs seek heroes out; free services in faction territory' },
    { tier: 'Admired',    threshold: 15, effect: 'Attitude starts Friendly; −2 to all social DCs with faction members' },
    { tier: 'Liked',      threshold:  5, effect: 'Attitude starts Friendly; modest discounts and information access' },
    { tier: 'Ignored',    threshold:  0, effect: 'Attitude starts Indifferent; standard rules apply' },
    { tier: 'Disliked',   threshold:-5,  effect: 'Attitude starts Unfriendly; +2 to all social DCs with faction members' },
    { tier: 'Hated',      threshold:-15, effect: 'Attitude starts Hostile; faction actively opposes heroes in their territory' },
    { tier: 'Hunted',     threshold:-30, effect: 'Faction sends agents to capture or kill heroes on sight' },
  ],

  reputationEvents: {
    positive: [
      { points:+2, event:'Completed a public service for the faction' },
      { points:+3, event:'Recovered a significant faction asset' },
      { points:+5, event:'Defeated a major enemy of the faction in public' },
      { points:+1, event:'Upheld a faction principle when not required to' },
      { points:+4, event:'Kept a promise under significant pressure not to' },
      { points:+6, event:'Sacrificed significant personal gain for faction benefit' },
    ],
    negative: [
      { points:-2, event:'Broke a promise to a faction member' },
      { points:-3, event:'Destroyed faction property (even accidentally)' },
      { points:-4, event:'Embarrassed a faction leader publicly' },
      { points:-5, event:'Worked with a faction enemy against faction interests' },
      { points:-1, event:'Failed a faction mission through negligence' },
      { points:-6, event:'Betrayed faction secret to an enemy' },
    ],
  },
};

if (typeof module !== 'undefined') module.exports = SOCIAL_DATA;
