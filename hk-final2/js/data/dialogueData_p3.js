/* js/data/dialogueData_p3.js — Phase III–V dialogue additions */
'use strict';

// ── Soul Master ────────────────────────────────────────────────────────────
DIALOGUE.soul_master_intro = [
  { speaker: '', text: "A robed figure hovers in the sanctum's heart. His eyes are full of light — the burning light of pure Soul." },
  { speaker: 'Soul Master', text: "A visitor to my Sanctum? Unexpected. Unwelcome." },
  { speaker: 'Soul Master', text: "This vessel seeks to hoard the Soul of Hallownest for himself — to ascend beyond death, beyond frailty." },
  { speaker: 'Soul Master', text: "You will not leave this place." },
];
DIALOGUE.soul_master_defeat = [
  { speaker: '', text: "The Soul shatters. The collection falls apart. What drives a being to such desperate accumulation?" },
  { speaker: '', text: "Fear, perhaps. Of the ending. Of the dark." },
  { speaker: '', text: "His research remains. His notes on the Dive technique — knowledge at least, survives." },
];

// ── Mantis Lords ──────────────────────────────────────────────────────────
DIALOGUE.mantis_lords_intro = [
  { speaker: '', text: "Three figures wait in the dark. Ancient warriors, proud as blades. They do not speak. They do not need to." },
  { speaker: '', text: "Prove yourself to the Mantis Tribe, or fall." },
];
DIALOGUE.mantis_lords_defeat = [
  { speaker: '', text: "The three lords bow. Slowly. Not submission — acknowledgement." },
  { speaker: '', text: "The Mantis Tribe respects strength. The village is open to you now." },
  { speaker: '', text: "They have kept their pride through plague and ruin. Perhaps that is its own kind of hope." },
];

// ── Shops ──────────────────────────────────────────────────────────────────
DIALOGUE.sly_shop = {
  first_meeting: [
    { speaker: 'Sly', text: "Oh! A customer. It's been... some time since I've had a customer." },
    { speaker: 'Sly', text: "I am Sly. Merchant. I have wares, and you appear to have need." },
    { speaker: 'Sly', text: "Let us trade. Take a look at what I carry — I assure you, every piece is of quality." },
  ],
  generic: [
    { speaker: 'Sly', text: "Something catches your eye? Good taste." },
    { speaker: 'Sly', text: "Geo is no good to you underground. Spend it while you can, I say." },
  ],
};

// ── Dreamers ──────────────────────────────────────────────────────────────
DIALOGUE.monomon = {
  first_meeting: [
    { speaker: 'Monomon', text: "So. The Pale King's last gambit has arrived." },
    { speaker: 'Monomon', text: "I am Monomon the Teacher. I chose to become a Dreamer. To hold the seal. To keep what sleeps from waking." },
    { speaker: 'Monomon', text: "I knew this day would come. I prepared for it. Take the seal. Break it. Do what must be done." },
    { speaker: 'Monomon', text: "Only... promise me the students here will be remembered. Even the small ones." },
  ],
};
DIALOGUE.lurien = {
  first_meeting: [
    { speaker: 'Lurien', text: "I watched Hallownest from my spire for years. I watched it flourish. I watched it fall." },
    { speaker: 'Lurien', text: "When the King offered to make me a Dreamer — I volunteered. I would watch forever if needed." },
    { speaker: 'Lurien', text: "But forever ends today, I think. You carry the Dream Nail. You are what the King hoped for." },
    { speaker: 'Lurien', text: "Go. Do not hesitate." },
  ],
};
DIALOGUE.herrah = {
  first_meeting: [
    { speaker: 'Herrah', text: "You come for my seal." },
    { speaker: 'Herrah', text: "I bargained with the King. My daughter — kept safe, kept hidden. In return, I sleep." },
    { speaker: 'Herrah', text: "My daughter is... Hornet. She knows." },
    { speaker: 'Herrah', text: "Take the seal. End this. She would want that." },
  ],
};
DIALOGUE.dreamer_seal_break = [
  { speaker: '', text: "The seal cracks. Light pours through, then darkness reclaims it." },
  { speaker: '', text: "The Dreamer's form dissolves. One seal broken." },
];

// ── Final confrontation ────────────────────────────────────────────────────
DIALOGUE.black_egg_door_locked = [
  { speaker: '', text: "A sealed door. Three locks, three seals. The Dreamers hold them closed." },
  { speaker: '', text: "All three must be freed before this path opens." },
];
DIALOGUE.black_egg_door_open = [
  { speaker: '', text: "The seals are broken. The door opens." },
  { speaker: '', text: "Beyond lies the Hollow Knight — the vessel that holds the Radiance. The bargain the Pale King made." },
  { speaker: '', text: "The dream that became a nightmare." },
];
DIALOGUE.hollow_knight_intro = [
  { speaker: '', text: "It waits at the centre of the world. Chained. Suffering." },
  { speaker: '', text: "The Hollow Knight — once pure void, now broken by the infection it was made to contain." },
  { speaker: '', text: "It cannot speak. It can only fight." },
];
DIALOGUE.ending_sealed = [
  { speaker: '', text: "The Knight seals themselves within the egg, replacing the Hollow Knight." },
  { speaker: '', text: "The cycle continues. The infection is contained — for now." },
  { speaker: '', text: "In the dark, a new Dreamer waits." },
  { speaker: '', text: "THE END — Sealed" },
];
DIALOGUE.ending_dream_no_more = [
  { speaker: '', text: "The Dream Nail strikes true. The Radiance manifests — burning, blinding." },
  { speaker: '', text: "In her own dream, she is not invincible." },
  { speaker: '', text: "Light recedes. The dream ends. For the first time in an age, Hallownest is quiet." },
  { speaker: '', text: "THE END — Dream No More" },
];

// ── City of Tears / general world ─────────────────────────────────────────
DIALOGUE.lore.abyss_tablet_01 = [
  { speaker: 'Ancient Seal', text: "The vessels were born here. Shaped from void, filled with intent. Or the absence of it." },
  { speaker: 'Ancient Seal', text: "To contain the light, the vessel must be empty. No thoughts, no feelings, no will." },
  { speaker: 'Ancient Seal', text: "We made so many. And one... walked out." },
];
DIALOGUE.elderbug_temple = [
  { speaker: 'Elderbug', text: "You've come so far, little ghost. Further than any of the others." },
  { speaker: 'Elderbug', text: "I don't know what waits beyond that door. I only know... it must be faced." },
  { speaker: 'Elderbug', text: "Whatever you are, whatever you choose... I believe in you." },
];
DIALOGUE.cornifer_fungal = [
  { speaker: 'Cornifer', text: "Ah, here you are! The wastes are strange — spore-heavy, disorienting." },
  { speaker: 'Cornifer', text: "But I've mapped what I can. Here — the Fungal Wastes. Mind the large orange ones." },
];
DIALOGUE.dream.soul_master = [
  "...mine...all mine...the soul is mine...",
  "...I will not die...cannot die...not while I have it...",
];
DIALOGUE.dream.mantis_lords = [
  "...hold fast...we remember the old ways...",
  "...the tribe endures...the tribe is proud...",
];
DIALOGUE.dream.hollow_knight = [
  "...",
  "...help...",
  "...father...",
  "...no mind to think...no will to break...",
];
