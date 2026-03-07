/**
 * prompt_parser.js — Text prompt → condition index vector
 *
 * Mirrors the logic in src/labels.py exactly.
 * No dependencies. Works in any browser.
 *
 * Main exports:
 *   parsePrompt(prompt)         → { subject, age, ethnicity, framing, style, hair, extras }
 *   parsePromptToIndices(prompt) → [7 integers]
 *   getConditionLabel(dim, idx) → human-readable string
 */

// ── Vocabulary (mirrors labels.py CONDITION_VOCAB) ──
const CONDITION_VOCAB = {
  subject: {
    0:'unknown', 1:'individual', 2:'couple', 3:'family',
    4:'group', 5:'portrait', 6:'siblings', 7:'parent_child'
  },
  age: {
    0:'unknown', 1:'baby', 2:'toddler', 3:'child',
    4:'teen', 5:'young_adult', 6:'adult', 7:'mixed_ages'
  },
  ethnicity: {
    0:'unknown', 1:'american', 2:'east_asian', 3:'south_asian',
    4:'latin', 5:'black', 6:'middle_eastern', 7:'diverse', 8:'asian'
  },
  framing: {
    0:'unknown', 1:'headshot', 2:'bust', 3:'waist_up',
    4:'three_quarter', 5:'full_body', 6:'wide_group', 7:'close_candid'
  },
  style: {
    0:'unknown', 1:'candid', 2:'posed', 3:'formal',
    4:'casual', 5:'outdoor', 6:'indoor', 7:'studio', 8:'event'
  },
  hair: {
    0:'unknown', 1:'black_hair', 2:'brunette', 3:'light_brown',
    4:'blonde', 5:'red_hair', 6:'gray_hair', 7:'no_hair', 8:'dark_hair'
  },
  extras: {
    0:'none', 1:'with_dog', 2:'with_cat', 3:'with_pet',
    4:'smiling', 5:'laughing', 6:'serious', 7:'glasses',
    8:'hat', 9:'holding_child', 10:'newborn', 11:'holiday'
  }
};

const DIM_NAMES = ['subject','age','ethnicity','framing','style','hair','extras'];
const DIM_SIZES = DIM_NAMES.map(d => Object.keys(CONDITION_VOCAB[d]).length);

// ── Keyword map (mirrors labels.py KEYWORD_MAP) ──
// Format: phrase → [dimName, index]
const KEYWORD_MAP = [
  // Subject
  ['individual',       ['subject', 1]],
  ['single person',    ['subject', 1]],
  ['single',           ['subject', 1]],
  ['person',           ['subject', 1]],
  ['solo',             ['subject', 1]],
  ['couple',           ['subject', 2]],
  ['two people',       ['subject', 2]],
  ['family portrait',  ['subject', 3]],
  ['family',           ['subject', 3]],
  ['group',            ['subject', 4]],
  ['friends',          ['subject', 4]],
  ['siblings',         ['subject', 6]],
  ['brothers',         ['subject', 6]],
  ['sisters',          ['subject', 6]],
  ['parent child',     ['subject', 7]],
  ['mother daughter',  ['subject', 7]],
  ['father son',       ['subject', 7]],
  ['mom and kid',      ['subject', 7]],
  ['dad and kid',      ['subject', 7]],

  // Age
  ['newborn baby',     ['age', 1]],
  ['newborn',          ['age', 1]],
  ['infant',           ['age', 1]],
  ['baby',             ['age', 1]],
  ['toddler',          ['age', 2]],
  ['young child',      ['age', 3]],
  ['children',         ['age', 3]],
  ['child',            ['age', 3]],
  ['kid',              ['age', 3]],
  ['teenager',         ['age', 4]],
  ['teenage',          ['age', 4]],
  ['teen',             ['age', 4]],
  ['adolescent',       ['age', 4]],
  ['young adult',      ['age', 5]],
  ['twenties',         ['age', 5]],
  ['millennial',       ['age', 5]],
  ['mixed ages',       ['age', 7]],
  ['all ages',         ['age', 7]],
  ['ages 0-40',        ['age', 7]],
  ['adult',            ['age', 6]],
  ['parent',           ['age', 6]],
  ['thirties',         ['age', 6]],

  // Ethnicity — longer matches first
  ['east asian',       ['ethnicity', 2]],
  ['south asian',      ['ethnicity', 3]],
  ['middle eastern',   ['ethnicity', 6]],
  ['african american', ['ethnicity', 5]],
  ['american',         ['ethnicity', 1]],
  ['caucasian',        ['ethnicity', 1]],
  ['western',          ['ethnicity', 1]],
  ['white',            ['ethnicity', 1]],
  ['asian',            ['ethnicity', 2]],
  ['chinese',          ['ethnicity', 2]],
  ['japanese',         ['ethnicity', 2]],
  ['korean',           ['ethnicity', 2]],
  ['indian',           ['ethnicity', 3]],
  ['latin',            ['ethnicity', 4]],
  ['hispanic',         ['ethnicity', 4]],
  ['latino',           ['ethnicity', 4]],
  ['latina',           ['ethnicity', 4]],
  ['black',            ['ethnicity', 5]],
  ['diverse',          ['ethnicity', 7]],
  ['multiracial',      ['ethnicity', 7]],

  // Framing
  ['head and shoulders',['framing', 2]],
  ['full-body',        ['framing', 5]],
  ['full body',        ['framing', 5]],
  ['whole body',       ['framing', 5]],
  ['waist up',         ['framing', 3]],
  ['half body',        ['framing', 3]],
  ['three quarter',    ['framing', 4]],
  ['group shot',       ['framing', 6]],
  ['wide shot',        ['framing', 6]],
  ['head shot',        ['framing', 1]],
  ['headshot',         ['framing', 1]],
  ['portraits',        ['framing', 1]],
  ['portrait',         ['framing', 1]],
  ['bust',             ['framing', 2]],
  ['standing',         ['framing', 5]],

  // Style
  ['candid',           ['style', 1]],
  ['natural',          ['style', 1]],
  ['spontaneous',      ['style', 1]],
  ['posed',            ['style', 2]],
  ['posing',           ['style', 2]],
  ['formal',           ['style', 3]],
  ['professional',     ['style', 3]],
  ['business',         ['style', 3]],
  ['casual',           ['style', 4]],
  ['everyday',         ['style', 4]],
  ['outdoor',          ['style', 5]],
  ['outside',          ['style', 5]],
  ['park',             ['style', 5]],
  ['beach',            ['style', 5]],
  ['indoor',           ['style', 6]],
  ['inside',           ['style', 6]],
  ['at home',          ['style', 6]],
  ['home',             ['style', 6]],
  ['studio',           ['style', 7]],
  ['white background', ['style', 7]],
  ['holiday photo',    ['style', 8]],
  ['christmas photo',  ['style', 8]],
  ['birthday',         ['style', 8]],
  ['christmas',        ['style', 8]],
  ['event',            ['style', 8]],

  // Hair — longer first to avoid partial matches
  ['light brown hair', ['hair', 3]],
  ['dark brown hair',  ['hair', 2]],
  ['black hair',       ['hair', 1]],
  ['dark hair',        ['hair', 1]],
  ['brown hair',       ['hair', 2]],
  ['light brown',      ['hair', 3]],
  ['red hair',         ['hair', 5]],
  ['gray hair',        ['hair', 6]],
  ['grey hair',        ['hair', 6]],
  ['silver hair',      ['hair', 6]],
  ['blonde hair',      ['hair', 4]],
  ['brunette',         ['hair', 2]],
  ['blonde',           ['hair', 4]],
  ['blond',            ['hair', 4]],
  ['redhead',          ['hair', 5]],
  ['auburn',           ['hair', 5]],
  ['bald',             ['hair', 7]],
  ['no hair',          ['hair', 7]],

  // Extras
  ['holding child',    ['extras', 9]],
  ['holding baby',     ['extras', 9]],
  ['holiday',          ['extras', 11]],
  ['christmas',        ['extras', 11]],
  ['with dog',         ['extras', 1]],
  ['with cat',         ['extras', 2]],
  ['with pet',         ['extras', 3]],
  ['with pets',        ['extras', 3]],
  ['laughing',         ['extras', 5]],
  ['smiling',          ['extras', 4]],
  ['smile',            ['extras', 4]],
  ['happy',            ['extras', 4]],
  ['serious',          ['extras', 6]],
  ['glasses',          ['extras', 7]],
  ['sunglasses',       ['extras', 7]],
  ['pets',             ['extras', 3]],
  ['dog',              ['extras', 1]],
  ['cat',              ['extras', 2]],
  ['pet',              ['extras', 3]],
  ['hat',              ['extras', 8]],
  ['cap',              ['extras', 8]],
];

// Sort longest-first for greedy matching
KEYWORD_MAP.sort((a, b) => b[0].length - a[0].length);

/**
 * Parse a text prompt into a condition dict.
 * @param {string} prompt
 * @returns {{ subject:number, age:number, ethnicity:number,
 *             framing:number, style:number, hair:number, extras:number }}
 */
function parsePrompt(prompt) {
  const result = { subject:0, age:0, ethnicity:0, framing:0, style:0, hair:0, extras:0 };
  const lower  = prompt.toLowerCase().trim();

  const matched = []; // track matched char spans to avoid overlapping

  for (const [phrase, [dim, idx]] of KEYWORD_MAP) {
    let pos = lower.indexOf(phrase);
    while (pos !== -1) {
      const span = [pos, pos + phrase.length];
      // Check no overlap with already-matched spans
      const overlaps = matched.some(([s,e]) => s < span[1] && span[0] < e);
      if (!overlaps) {
        if (result[dim] === 0) { // first match wins per dimension
          result[dim] = idx;
        }
        matched.push(span);
        break;
      }
      pos = lower.indexOf(phrase, pos + 1);
    }
  }

  return result;
}

/**
 * Convert a condition dict to a flat integer array [7 values].
 * @param {string} prompt
 * @returns {number[]} length-7 array of condition indices
 */
function parsePromptToIndices(prompt) {
  const cond = parsePrompt(prompt);
  return DIM_NAMES.map(d => cond[d] || 0);
}

/**
 * Get a human-readable label for a (dimension, index) pair.
 */
function getConditionLabel(dim, idx) {
  return (CONDITION_VOCAB[dim] && CONDITION_VOCAB[dim][idx]) || `${dim}[${idx}]`;
}
