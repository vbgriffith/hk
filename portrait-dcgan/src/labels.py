"""
labels.py — Condition vocabulary and prompt-to-vector mapping for PortraitGAN.

Every image in the training set is assigned a condition vector built from
7 independent categorical dimensions. At inference time, a text prompt is
parsed into the same structure and converted to condition indices.

The generator is conditioned via concatenated learned embeddings — one
embedding table per dimension. No CLIP or transformer required.
"""

# ─────────────────────────────────────────────────────────────────────────────
# CONDITION DIMENSIONS & VOCABULARY
# ─────────────────────────────────────────────────────────────────────────────
# Index 0 is always the "unknown/wildcard" token for each dimension.
# During training, unlabeled images receive index 0 for that dimension.
# At inference, omitting a dimension uses index 0 (model picks freely).

CONDITION_VOCAB = {

    # DIM 0 — Subject composition
    "subject": {
        0: "unknown",
        1: "individual",        # single person
        2: "couple",            # two people (romantic or friendly)
        3: "family",            # family unit (mixed ages)
        4: "group",             # 3+ people, non-family
        5: "portrait",          # tight face/headshot (no body context)
        6: "siblings",          # two children/teens together
        7: "parent_child",      # one adult + one child
    },

    # DIM 1 — Age range of primary subject
    "age": {
        0: "unknown",
        1: "baby",              # 0–2 years
        2: "toddler",           # 2–5 years
        3: "child",             # 5–12 years
        4: "teen",              # 13–19 years
        5: "young_adult",       # 20–30 years
        6: "adult",             # 30–45 years (hard cutoff at ~40)
        7: "mixed_ages",        # group with multiple age ranges
    },

    # DIM 2 — Perceived ethnicity / cultural context
    # Note: these are dataset labels, not ground truth racial categories.
    # Used to condition diversity in generation, not for classification.
    "ethnicity": {
        0: "unknown",
        1: "american",          # broadly Western/Caucasian appearance
        2: "east_asian",        # East Asian appearance
        3: "south_asian",       # South Asian appearance
        4: "latin",             # Latin American appearance
        5: "black",             # Black/African American appearance
        6: "middle_eastern",    # Middle Eastern appearance
        7: "diverse",           # mixed-ethnicity group
        8: "asian",             # alias → maps to east_asian internally
    },

    # DIM 3 — Framing / crop type
    "framing": {
        0: "unknown",
        1: "headshot",          # head and shoulders only
        2: "bust",              # head to mid-chest
        3: "waist_up",          # head to waist
        4: "three_quarter",     # head to knees
        5: "full_body",         # entire body visible
        6: "wide_group",        # wide shot showing all group members
        7: "close_candid",      # candid tight crop, informal
    },

    # DIM 4 — Photography style
    "style": {
        0: "unknown",
        1: "candid",            # natural, unposed, spontaneous
        2: "posed",             # deliberately arranged
        3: "formal",            # professional setting, formal clothing
        4: "casual",            # everyday clothing and setting
        5: "outdoor",           # natural/outdoor environment
        6: "indoor",            # interior setting
        7: "studio",            # studio/clean background
        8: "event",             # birthday, holiday, party context
    },

    # DIM 5 — Hair color / appearance
    "hair": {
        0: "unknown",
        1: "black_hair",
        2: "brunette",          # dark brown
        3: "light_brown",
        4: "blonde",
        5: "red_hair",
        6: "gray_hair",         # older adults
        7: "no_hair",           # bald, or baby (no visible hair)
        8: "dark_hair",         # alias → maps to black_hair
    },

    # DIM 6 — Special extras / context
    "extras": {
        0: "none",
        1: "with_dog",
        2: "with_cat",
        3: "with_pet",          # unspecified pet
        4: "smiling",
        5: "laughing",
        6: "serious",
        7: "glasses",
        8: "hat",
        9: "holding_child",
        10: "newborn",          # newborn context
        11: "holiday",          # holiday/seasonal context
    },
}

# ─────────────────────────────────────────────────────────────────────────────
# DIMENSION SIZES (for embedding table construction)
# ─────────────────────────────────────────────────────────────────────────────

DIM_SIZES = {dim: len(vocab) for dim, vocab in CONDITION_VOCAB.items()}
# subject: 8, age: 8, ethnicity: 9, framing: 8, style: 9, hair: 9, extras: 12

NUM_DIMS = len(CONDITION_VOCAB)  # 7
EMBED_DIM_PER_DIM = 16           # each dimension gets a 16-d learned embedding
CONDITION_DIM = NUM_DIMS * EMBED_DIM_PER_DIM  # = 112 total condition dims

# ─────────────────────────────────────────────────────────────────────────────
# KEYWORD ALIASES (for prompt parsing)
# ─────────────────────────────────────────────────────────────────────────────
# Maps arbitrary user-typed keywords → (dimension, index) pairs.

KEYWORD_MAP = {
    # subject
    "individual":       ("subject", 1),
    "single":           ("subject", 1),
    "person":           ("subject", 1),
    "solo":             ("subject", 1),
    "couple":           ("subject", 2),
    "two people":       ("subject", 2),
    "family":           ("subject", 3),
    "family portrait":  ("subject", 3),
    "group":            ("subject", 4),
    "friends":          ("subject", 4),
    "siblings":         ("subject", 6),
    "brothers":         ("subject", 6),
    "sisters":          ("subject", 6),
    "parent child":     ("subject", 7),
    "mom and kid":      ("subject", 7),
    "dad and kid":      ("subject", 7),
    "mother daughter":  ("subject", 7),
    "father son":       ("subject", 7),

    # age
    "baby":             ("age", 1),
    "infant":           ("age", 1),
    "newborn":          ("age", 1),
    "toddler":          ("age", 2),
    "young child":      ("age", 3),
    "child":            ("age", 3),
    "kid":              ("age", 3),
    "children":         ("age", 3),
    "teen":             ("age", 4),
    "teenager":         ("age", 4),
    "teenage":          ("age", 4),
    "adolescent":       ("age", 4),
    "young adult":      ("age", 5),
    "twenties":         ("age", 5),
    "millennial":       ("age", 5),
    "adult":            ("age", 6),
    "thirties":         ("age", 6),
    "parent":           ("age", 6),
    "mixed ages":       ("age", 7),
    "all ages":         ("age", 7),
    "ages 0-40":        ("age", 7),

    # ethnicity
    "american":         ("ethnicity", 1),
    "caucasian":        ("ethnicity", 1),
    "white":            ("ethnicity", 1),
    "western":          ("ethnicity", 1),
    "asian":            ("ethnicity", 2),
    "east asian":       ("ethnicity", 2),
    "chinese":          ("ethnicity", 2),
    "japanese":         ("ethnicity", 2),
    "korean":           ("ethnicity", 2),
    "south asian":      ("ethnicity", 3),
    "indian":           ("ethnicity", 3),
    "latin":            ("ethnicity", 4),
    "hispanic":         ("ethnicity", 4),
    "latino":           ("ethnicity", 4),
    "latina":           ("ethnicity", 4),
    "black":            ("ethnicity", 5),
    "african american": ("ethnicity", 5),
    "middle eastern":   ("ethnicity", 6),
    "diverse":          ("ethnicity", 7),
    "multiracial":      ("ethnicity", 7),

    # framing
    "headshot":         ("framing", 1),
    "head shot":        ("framing", 1),
    "head and shoulders":("framing", 2),
    "bust":             ("framing", 2),
    "waist up":         ("framing", 3),
    "half body":        ("framing", 3),
    "three quarter":    ("framing", 4),
    "full body":        ("framing", 5),
    "full-body":        ("framing", 5),
    "whole body":       ("framing", 5),
    "standing":         ("framing", 5),
    "group shot":       ("framing", 6),
    "wide shot":        ("framing", 6),
    "portrait":         ("framing", 1),  # portrait = headshot framing
    "portraits":        ("framing", 1),

    # style
    "candid":           ("style", 1),
    "natural":          ("style", 1),
    "spontaneous":      ("style", 1),
    "posed":            ("style", 2),
    "posing":           ("style", 2),
    "formal":           ("style", 3),
    "professional":     ("style", 3),
    "business":         ("style", 3),
    "casual":           ("style", 4),
    "everyday":         ("style", 4),
    "outdoor":          ("style", 5),
    "outside":          ("style", 5),
    "park":             ("style", 5),
    "beach":            ("style", 5),
    "indoor":           ("style", 6),
    "inside":           ("style", 6),
    "home":             ("style", 6),
    "studio":           ("style", 7),
    "white background": ("style", 7),
    "event":            ("style", 8),
    "birthday":         ("style", 8),
    "holiday":          ("style", 8),
    "christmas":        ("style", 8),

    # hair
    "black hair":       ("hair", 1),
    "dark hair":        ("hair", 1),
    "brunette":         ("hair", 2),
    "brown hair":       ("hair", 3),
    "light brown":      ("hair", 3),
    "blonde":           ("hair", 4),
    "blond":            ("hair", 4),
    "fair hair":        ("hair", 4),
    "red hair":         ("hair", 5),
    "redhead":          ("hair", 5),
    "auburn":           ("hair", 5),
    "gray hair":        ("hair", 6),
    "grey hair":        ("hair", 6),
    "silver hair":      ("hair", 6),
    "bald":             ("hair", 7),
    "no hair":          ("hair", 7),

    # extras
    "with dog":         ("extras", 1),
    "dog":              ("extras", 1),
    "with cat":         ("extras", 2),
    "cat":              ("extras", 2),
    "with pet":         ("extras", 3),
    "pet":              ("extras", 3),
    "pets":             ("extras", 3),
    "smiling":          ("extras", 4),
    "smile":            ("extras", 4),
    "happy":            ("extras", 4),
    "laughing":         ("extras", 5),
    "laughs":           ("extras", 5),
    "serious":          ("extras", 6),
    "glasses":          ("extras", 7),
    "sunglasses":       ("extras", 7),
    "hat":              ("extras", 8),
    "cap":              ("extras", 8),
    "holding baby":     ("extras", 9),
    "holding child":    ("extras", 9),
    "newborn baby":     ("extras", 10),
    "holiday photo":    ("extras", 11),
    "christmas photo":  ("extras", 11),
}


def parse_prompt(prompt: str) -> dict:
    """
    Convert a free-text prompt into a condition dict.

    Returns:
        dict with keys = dimension names, values = integer indices
        Any unrecognized dimension defaults to 0 (wildcard).

    Examples:
        >>> parse_prompt("asian family portrait")
        {'subject': 3, 'age': 0, 'ethnicity': 2, 'framing': 1,
         'style': 0, 'hair': 0, 'extras': 0}

        >>> parse_prompt("candid blonde toddler full body outdoor")
        {'subject': 0, 'age': 2, 'ethnicity': 0, 'framing': 5,
         'style': 5, 'hair': 4, 'extras': 0}
    """
    result = {dim: 0 for dim in CONDITION_VOCAB}
    prompt_lower = prompt.lower().strip()

    # Try multi-word phrases first (longest match wins)
    phrases = sorted(KEYWORD_MAP.keys(), key=len, reverse=True)
    matched_spans = []

    for phrase in phrases:
        idx = prompt_lower.find(phrase)
        if idx >= 0:
            # Check it doesn't overlap an already-matched span
            span = (idx, idx + len(phrase))
            overlaps = any(s[0] < span[1] and span[0] < s[1] for s in matched_spans)
            if not overlaps:
                dim, val = KEYWORD_MAP[phrase]
                if result[dim] == 0:  # first match wins per dimension
                    result[dim] = val
                matched_spans.append(span)

    return result


def condition_to_indices(cond: dict) -> list:
    """Convert a condition dict to a list of 7 integers (one per dimension)."""
    return [cond.get(dim, 0) for dim in CONDITION_VOCAB]


def indices_to_label(indices: list) -> str:
    """Convert a list of condition indices to a human-readable label string."""
    parts = []
    for dim, idx in zip(CONDITION_VOCAB.keys(), indices):
        if idx != 0:
            parts.append(CONDITION_VOCAB[dim].get(idx, "?"))
    return " | ".join(parts) if parts else "unconditioned"


# ─────────────────────────────────────────────────────────────────────────────
# DATASET LABEL ASSIGNMENT RULES
# Used by data/prepare_splits.py to auto-label images from metadata.
# ─────────────────────────────────────────────────────────────────────────────

# CelebA attribute → condition mapping (CelebA has 40 binary attributes)
CELEBA_ATTR_MAP = {
    # CelebA attribute name → (dimension, index)
    "Blond_Hair":       ("hair", 4),
    "Black_Hair":       ("hair", 1),
    "Brown_Hair":       ("hair", 2),
    "Gray_Hair":        ("hair", 6),
    "Bald":             ("hair", 7),
    "Smiling":          ("extras", 4),
    "Eyeglasses":       ("extras", 7),
    "Wearing_Hat":      ("extras", 8),
    # Age not directly in CelebA — inferred from Young attribute:
    # Young=1 → age=young_adult(5), Young=0 → age=adult(6)
}

# UTKFace filename format: [age]_[gender]_[race]_[date].jpg
# race: 0=White, 1=Black, 2=Asian, 3=Indian, 4=Other
UTKFACE_RACE_MAP = {0: 1, 1: 5, 2: 2, 3: 3, 4: 0}  # → ethnicity index

def utkface_age_to_index(age: int) -> int:
    if age <= 2:   return 1   # baby
    if age <= 5:   return 2   # toddler
    if age <= 12:  return 3   # child
    if age <= 19:  return 4   # teen
    if age <= 30:  return 5   # young_adult
    if age <= 45:  return 6   # adult
    return 0                  # over 45 → skip or wildcard (outside our range)


if __name__ == "__main__":
    # Quick test
    test_prompts = [
        "asian family portrait",
        "candid blonde toddler full body outdoor",
        "american adult formal headshot",
        "group of teens smiling",
        "young adult couple with dog outdoor",
        "black hair child full body casual",
        "latin family holiday photo",
        "asian baby newborn",
        "formal portrait serious glasses",
        "redhead kid candid",
    ]
    print(f"{'Prompt':<45} {'Parsed Condition'}")
    print("-" * 90)
    for p in test_prompts:
        cond = parse_prompt(p)
        label = indices_to_label(condition_to_indices(cond))
        print(f"{p:<45} {label}")
