/* js/data/dialogueData.js — NPC dialogue trees */
'use strict';

const DIALOGUE = {

  // ─────────────────────────────────────────────────────────────────────────
  //  Elderbug — old bug at Dirtmouth entrance
  // ─────────────────────────────────────────────────────────────────────────
  elderbug: {
    first_meeting: [
      { speaker: 'Elderbug', text: "Hm? A traveller? Haven't seen one of your kind in many seasons, little ghost." },
      { speaker: 'Elderbug', text: "You've come to Hallownest, have you? Seeking... something. They all seek something." },
      { speaker: 'Elderbug', text: "This is Dirtmouth, last settlement above the ruins below. Most folk left long ago. Only old Elderbug remains." },
      { speaker: 'Elderbug', text: "If you mean to descend into Hallownest... take care. The infection has spread far. Hollowed husks wander the dark, mindless and hungry." },
      { speaker: 'Elderbug', text: "What drove you to such a forsaken place, little one? ...Ah. Forgive an old bug his curiosity. Safe travels." },
    ],
    generic: [
      { speaker: 'Elderbug', text: "Still here, little ghost. Still waiting for the others to return, I suppose." },
      { speaker: 'Elderbug', text: "Strange dreams I've been having. Orange and warm. Not unpleasant... but wrong, somehow." },
    ],
    after_false_king: [
      { speaker: 'Elderbug', text: "Something has changed below. I can feel it, even from up here. Whatever you've done, little ghost..." },
      { speaker: 'Elderbug', text: "I hope it was enough. Go on, then. Finish it." },
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  Quirrel — travelling scholar
  // ─────────────────────────────────────────────────────────────────────────
  quirrel: {
    forgotten_crossroads: [
      { speaker: 'Quirrel', text: "Ah! Another traveller! You gave me quite a start." },
      { speaker: 'Quirrel', text: "My name is Quirrel. Wandering scholar, of a sort. I've come to study the ruins of Hallownest — though 'ruin' may be too gentle a word for what I've found." },
      { speaker: 'Quirrel', text: "The Infection spreads further than the old maps show. And the hollowed... they were people once. Bugs, going about their lives." },
      { speaker: 'Quirrel', text: "Forgive me, I grow melancholy. Where are you headed, friend? Perhaps our roads cross." },
    ],
    greenpath: [
      { speaker: 'Quirrel', text: "We meet again! Small world — or perhaps just inevitable, given we're both drawn deeper." },
      { speaker: 'Quirrel', text: "These ruins... Hallownest was magnificent once. I've read accounts. A kingdom of light in the darkness below the world." },
      { speaker: 'Quirrel', text: "Ah, but I've kept you long enough. Take care on the paths ahead." },
    ],
    blue_lake: [
      { speaker: 'Quirrel', text: "..." },
      { speaker: 'Quirrel', text: "I have been sitting here for some time. The lake is... peaceful. After everything we've seen." },
      { speaker: 'Quirrel', text: "I think I am done travelling, friend. My purpose is complete. Whatever that purpose was." },
      { speaker: 'Quirrel', text: "Thank you. For the company, even from a distance. Safe travels, little ghost." },
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  Bench interactions
  // ─────────────────────────────────────────────────────────────────────────
  bench: {
    rest: [
      { speaker: '', text: "You sit and rest. Your shell is renewed. The warmth is brief but true." },
    ],
    already_rested: [
      { speaker: '', text: "A place to rest. The shell feels whole." },
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  Lore tablets
  // ─────────────────────────────────────────────────────────────────────────
  lore: {
    crossroads_tablet_1: [
      { speaker: 'Tablet', text: '"HALLOWNEST FOREVER"' },
      { speaker: 'Tablet', text: 'The stone is old and worn, carved by a devoted hand in simpler times.' },
    ],
    crossroads_tablet_2: [
      { speaker: 'Tablet', text: '"By the grace of the Pale King, we dwell in light."' },
      { speaker: 'Tablet', text: '"By the strength of the Pale King, we are kept safe from the dark."' },
      { speaker: 'Tablet', text: '"In the Kingdom of Hallownest, all bugs are free."' },
    ],
    ancient_basin_seal: [
      { speaker: 'Ancient Inscription', text: "Here lies the heart of the old kingdom. The Vessels were born here in silence and shadow." },
      { speaker: 'Ancient Inscription', text: "Empty. Purposeless. Perfect." },
    ]
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  Sign posts / environmental signs
  // ─────────────────────────────────────────────────────────────────────────
  signs: {
    dirtmouth_entrance: [
      { speaker: '', text: 'DIRTMOUTH\n—\nLast settlement before the deep.' }
    ],
    crossroads_sign: [
      { speaker: '', text: 'FORGOTTEN CROSSROADS\n—\nAll roads below begin here.' }
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  //  Dream nail dialogue (enemy / spirit thoughts)
  // ─────────────────────────────────────────────────────────────────────────
  dream: {
    crawler: [
      "...hungry...dark...move...",
      "...light hurts...keep moving...",
      "...what am I...what was I...",
    ],
    spitter: [
      "...defend...this place is mine...",
      "...away...away...",
    ],
    elderbug_dream: [
      "...the children went below and did not return...",
      "...I wait...I will always wait...",
    ]
  },
};

// ── Phase II additions ────────────────────────────────────────────────────

DIALOGUE.false_knight_intro = [
  { speaker: '', text: "A massive armoured shape stirs in the darkness ahead. The stolen armour scrapes stone. Two hollow eyes burn orange with infection." },
  { speaker: '', text: "The False Knight." },
];

DIALOGUE.false_knight_defeat = [
  { speaker: '', text: "The stolen shell cracks open. Inside, a tiny maggot spills out — small, trembling, its infection fading." },
  { speaker: '', text: "It wanted only to protect its siblings. To be strong. The armour promised that." },
  { speaker: '', text: "The infection offers many promises." },
];

DIALOGUE.gruz_mother_intro = [
  { speaker: '', text: "A vast, lumbering shape fills the chamber. Gruz Mother, guardian of her clutch." },
];

DIALOGUE.dream_nail_acquire = [
  { speaker: '', text: "A weapon forged of dream, able to pierce the veil between waking and sleep." },
  { speaker: '', text: "Strike the dreaming minds of others to read their thoughts. Strike the deceased to draw out their lingering essence." },
  { speaker: '', text: "Essence gained: Vessel of Dreams opened." },
];

DIALOGUE.essence_vessel = [
  { speaker: '', text: "The dream essence thrums within the Dream Nail. A vessel of sleeping memories." },
];

DIALOGUE.seer = {
  first_meeting: [
    { speaker: 'Seer', text: "You carry the Dream Nail. Then you are... one of us. One who walks between worlds." },
    { speaker: 'Seer', text: "I am the last of the Moth Tribe. We tended the Radiance — the light that burns in the old dreams." },
    { speaker: 'Seer', text: "We were wrong to worship that light. It consumed Hallownest. It consumes everything." },
    { speaker: 'Seer', text: "Gather essence from the dreaming dead. From the Warriors who linger. Bring it back to me." },
    { speaker: 'Seer', text: "With enough... perhaps a door may open." },
  ],
  essence_collected: [
    { speaker: 'Seer', text: "More essence. The Dream Nail grows stronger. The veil between worlds thins." },
    { speaker: 'Seer', text: "The Dreamers stir in their slumber. They hold the seals. Only through dreams may you pass." },
  ],
};

DIALOGUE.iselda = {
  first_meeting: [
    { speaker: 'Iselda', text: "Hello, traveller. Come to buy a map? My husband Cornifer charts these ruins, but he wanders too far ahead." },
    { speaker: 'Iselda', text: "I wait here and sell what he sends back. It's a living." },
    { speaker: 'Iselda', text: "If you find him out there — and you will, he leaves chalk trails — tell him I'm not worried. Don't tell him I'm worried." },
  ],
  generic: [
    { speaker: 'Iselda', text: "Pins, maps, quill. All here." },
    { speaker: 'Iselda', text: "Cornifer's latest map just arrived. Somewhere he shouldn't have gone, by the look of it." },
  ],
};

DIALOGUE.cornifer = {
  crossroads: [
    { speaker: 'Cornifer', text: "Hm? Oh! A visitor — careful where you step, I've paper everywhere." },
    { speaker: 'Cornifer', text: "I'm Cornifer, cartographer. Mapping these ruins before they're lost entirely." },
    { speaker: 'Cornifer', text: "Here — take a map of the Crossroads. Only a few geo. Consider it encouragement to explore!" },
  ],
  greenpath: [
    { speaker: 'Cornifer', text: "Ah, you followed my chalk marks! Good instincts." },
    { speaker: 'Cornifer', text: "Greenpath is... verdant. Alive. Rather rare down here. Something about the acid lake keeps things growing." },
  ],
};

DIALOGUE.charms = {
  wayward_compass: [
    { speaker: '', text: "Wayward Compass acquired." },
    { speaker: '', text: "\"It indicates the cartographer's location on the map.\"" },
  ],
  gathering_swarm: [
    { speaker: '', text: "Gathering Swarm acquired." },
    { speaker: '', text: "\"A swarm of tiny creatures that collect loose geo.\"" },
  ],
  fragile_heart: [
    { speaker: '', text: "Fragile Heart acquired." },
    { speaker: '', text: "\"Increases the bearer's health by adding two full mask containers.\"" },
  ],
  quick_slash: [
    { speaker: '', text: "Quick Slash acquired." },
    { speaker: '', text: "\"Speeds up nail attacks considerably.\"" },
  ],
  mark_of_pride: [
    { speaker: '', text: "Mark of Pride acquired." },
    { speaker: '', text: "\"Increases the range of the nail's slash.\"" },
  ],
  spell_twister: [
    { speaker: '', text: "Spell Twister acquired." },
    { speaker: '', text: "\"Reduces the soul cost of spells.\"" },
  ],
};

// Lore tablet additions
DIALOGUE.lore.greenpath_tablet_1 = [
  { speaker: 'Tablet', text: '"The Mantis Tribe holds their ancestral home against all intruders. They do not serve the Pale King."' },
  { speaker: 'Tablet', text: '"Their warriors are proud. But they respect strength. Prove yourself worthy."' },
];

DIALOGUE.lore.boss_door_false_knight = [
  { speaker: '', text: "A battered gate. The ground before it is churned — something large has passed through here repeatedly." },
  { speaker: '', text: "Something angry." },
];

DIALOGUE.dream.false_knight = [
  "...protect...must protect...",
  "...they took everything...the armour will make me strong...",
  "...brothers...sisters...I'm sorry...",
];

DIALOGUE.dream.mosscreep = [
  "...grow...roots...still...",
  "...green...quiet...stay...",
];

// ══════════════════════════════════════════════════════════════════════════
// Session 7 Expansion — New area dialogue
// ══════════════════════════════════════════════════════════════════════════

DIALOGUE.lore.archives_tablet = [
  { speaker: '', text: "The archives of the Teacher. Here, knowledge was collected and preserved." },
  { speaker: '', text: "Now silent. The Teacher sleeps." },
];

DIALOGUE.lore.resting_tablet = [
  { speaker: '', text: "Here lie the dreamers, those who sleep eternal." },
  { speaker: '', text: "Their rest binds the Vessel. Their dreams seal the light." },
];

DIALOGUE.npcs.quirrel_archives = [
  { speaker: 'Quirrel', text: "Again we cross paths. How curious that we both should find ourselves here, in this place of memory." },
  { speaker: 'Quirrel', text: "I feel as though I know this place... but the feeling is distant, like a half-remembered dream." },
  { speaker: 'Quirrel', text: "Perhaps the answers I seek lie deeper still." },
];

DIALOGUE.dream.uumuu = [
  "...protect...the Teacher...",
  "...preserve...seal...",
  "...must not wake...",
];

// Generic NPC dialogue (reused for placeholder NPCs)
if (!DIALOGUE.npcs.generic) {
  DIALOGUE.npcs.generic = [
    { speaker: '...', text: "..." },
  ];
}

DIALOGUE.lore.mantis_history = [
  { speaker: '', text: "The Mantis tribe. Warriors bound by honor and ritual." },
  { speaker: '', text: "They alone held back the infection through strength and discipline." },
];

DIALOGUE.lore.abyss_depths = [
  { speaker: '', text: "The birthplace of the Vessel. Here, in darkness absolute." },
  { speaker: '', text: "Countless shells cast aside. Only one was deemed hollow." },
];

DIALOGUE.lore.void_heart_lore = [
  { speaker: '', text: "Born of God and Void." },
  { speaker: '', text: "The heart that cannot feel. The mind that cannot waver." },
  { speaker: '', text: "To contain the light, one must be truly hollow." },
];
