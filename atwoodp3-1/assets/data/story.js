// ============================================================
//  THE ASHWOOD INHERITANCE - Complete Story Data
//  A Mystery in Five Acts
// ============================================================
//
//  PREMISE:
//  You are Detective Maren Cole, called to Ashwood Manor on
//  a stormy October night. Elias Ashwood, the family patriarch,
//  has been found dead in his locked study. The official verdict
//  is heart failure — but a cryptic letter delivered to your
//  office tells you otherwise. What begins as a simple inquiry
//  unravels into a decades-long conspiracy of stolen identities,
//  buried secrets, and a fortune built on blood.
//
//  PLAY TIME: ~3-4 hours
//  ENDINGS: 6 unique endings based on choices and clues found
// ============================================================

const STORY = {

  meta: {
    title: "The Ashwood Inheritance",
    subtitle: "A Mystery in Five Acts",
    version: "1.0.0",
    totalActs: 5,
    estimatedPlaytime: "3-4 hours",
    endingCount: 6,
    author: "Phase 1 Build"
  },

  // ============================================================
  //  CHARACTERS
  // ============================================================
  characters: {

    maren: {
      id: "maren",
      name: "Maren Cole",
      role: "player",
      title: "Private Detective",
      age: 38,
      portrait: "maren.png",
      bio: "Former homicide detective, forced out of the force after exposing a corrupt captain. Now works private cases. Quiet, perceptive, carries the weight of cases she couldn't close.",
      traits: ["perceptive", "tenacious", "haunted"],
      inventory: [],
      notes: []
    },

    elias: {
      id: "elias",
      name: "Elias Ashwood",
      role: "victim",
      title: "Patriarch / Industrialist",
      age: 74,
      portrait: "elias.png",
      bio: "Founder of Ashwood Industries, a mining and land development empire. Reclusive in his final years. Died on October 14th. Official cause: cardiac arrest.",
      traits: ["secretive", "controlling", "guilt-ridden"],
      alive: false,
      deathDate: "October 14th",
      secrets: [
        "Was not the real Elias Ashwood — stole the identity of a dead man in 1972",
        "The real Elias Ashwood was Jonas Merrill, a drifter who helped him escape a fire",
        "Built his empire on land stolen from the Calwell family through forged deeds",
        "Has been paying blackmail to someone for 11 years",
        "Left a confession in a hidden compartment of his desk",
        "His 'heart attack' was induced with a rare compound derived from foxglove — nearly undetectable"
      ]
    },

    dorothea: {
      id: "dorothea",
      name: "Dorothea Ashwood",
      role: "suspect",
      title: "Wife / Former Stage Actress",
      age: 68,
      portrait: "dorothea.png",
      bio: "Married Elias in 1981. Cultured, charming, and intensely private about her past. Maintains perfect composure even in grief. Has been sleeping in a separate wing of the manor for six years.",
      traits: ["composed", "theatrical", "calculating"],
      motive: "Discovered Elias's false identity 11 years ago. Has been the blackmailer. Was about to be cut out of the will entirely.",
      guilty: false, // not the killer — but complicit in cover-up
      alibi: "Claims to have been in the east wing library all evening. Alibi confirmed by housekeeper, but housekeeper is lying.",
      cluesAgainst: ["blackmail_letters", "forged_will", "dorothea_locket"],
      cluesFor: ["dorothea_alibi_book", "phone_record_eastcity"],
      dialogue: {
        first_meeting: [
          "Detective Cole. I've heard of you. The woman who brings ruin to powerful men.",
          "My husband died of a heart attack. The doctor said so. Why are you here?",
          "I suppose I should cooperate. Ask what you must, then leave us to our grief."
        ],
        confronted_blackmail: [
          "...",
          "You're more dangerous than I gave you credit for.",
          "Fine. Yes. I knew who he really was. Has known for a decade. But I didn't kill him.",
          "I needed him alive. A dead husband can't be bled. A dead husband can't be shamed.",
          "Someone else wanted him dead. And I think I know who."
        ],
        final_revelation: [
          "His name was Tomas Vey. Born in Bratislava, emigrated at nineteen.",
          "He was a coward and a thief, but he built something. I respected that, once.",
          "The man who killed him — he's been in this house before. Look to the groundskeeper's shed.",
          "There's a key there. You'll understand when you find it."
        ]
      }
    },

    nathaniel: {
      id: "nathaniel",
      name: "Nathaniel Ashwood",
      role: "suspect",
      title: "Eldest Son / Heir Apparent",
      age: 41,
      portrait: "nathaniel.png",
      bio: "Elias's son from a first marriage. Runs the day-to-day operations of Ashwood Industries. Charming, ambitious, and deeply in debt from private gambling.",
      traits: ["charming", "reckless", "desperate"],
      motive: "Believed he would inherit everything. Discovered two weeks before Elias's death that a new will cut his share from 70% to 8%. Also discovered that Elias planned to publicly confess his identity fraud — which would invalidate Nathaniel's own legal surname and inheritance.",
      guilty: true, // THE KILLER
      method: "Obtained digitalis compound through Dr. Crane. Administered it in Elias's evening brandy. Staged the body to support heart attack narrative.",
      alibi: "Claims he was in the city at a client dinner. Three witnesses confirm he arrived — but the dinner was 40 minutes from the manor. Window exists.",
      cluesAgainst: ["brandy_glass", "pharmacy_receipt", "crane_appointment", "new_will_draft", "nathaniel_debt_records", "tire_tracks"],
      cluesFor: ["dinner_reservation", "witness_statements"],
      dialogue: {
        first_meeting: [
          "Detective. I didn't realize Father had retained you.",
          "He was ill. His heart was bad for years. Dr. Crane will tell you the same.",
          "I hope this isn't going to become some... spectacle. The family has been through enough."
        ],
        pressure_applied: [
          "You're fishing. There's nothing to find.",
          "I loved my father.",
          "...What did Dorothea tell you? She's unstable, you know. Has been for years."
        ],
        confronted_directly: [
          "I want my lawyer.",
          "You can't prove anything.",
          "...",
          "He was going to destroy everything. Everything he built. Everything I built.",
          "A confession? At his age? For what? Absolution? He didn't deserve absolution.",
          "I gave him a peaceful death. Better than he gave Jonas Merrill."
        ]
      }
    },

    sylvie: {
      id: "sylvie",
      name: "Sylvie Ashwood",
      role: "suspect",
      title: "Youngest Child / Artist",
      age: 29,
      portrait: "sylvie.png",
      bio: "Dorothea's daughter from her previous marriage, adopted by Elias. A printmaker and painter living in the manor's converted carriage house. Quiet, watchful, has never fit into the Ashwood family.",
      traits: ["perceptive", "detached", "searching"],
      motive: "None for murder. But she has been secretly investigating her own origins — and discovered that Elias knew who her biological father was and kept it from her deliberately.",
      guilty: false,
      alibi: "Was in her studio all night — confirmed by datestamped photos from her digital camera (automatic interval shots).",
      secretKnows: "Saw Nathaniel's car leave and return the night of the murder. Was afraid to say anything.",
      cluesProvided: ["sylvie_testimony", "car_sighting", "carriage_house_notes"],
      dialogue: {
        first_meeting: [
          "I heard another detective was coming. Are you different from the last one?",
          "The last one barely looked around before declaring it a natural death.",
          "I've been waiting for someone to actually ask questions."
        ],
        trust_built: [
          "I didn't want to say anything. Nathaniel frightens me.",
          "But I saw his car. Black Mercedes. Left at 9:40. Back by midnight.",
          "Father's study light was still on when Nathaniel returned. Twenty minutes later it went dark.",
          "I drew it. Time and everything. I didn't know what to do with it."
        ],
        about_herself: [
          "Elias kept a file on me. I found it by accident, in the third floor archive.",
          "My real father is a man named Declan Fairweather. He was Elias's old business partner.",
          "Elias drove him out in 1995. Ruined him. He's been living in Whitmore ever since.",
          "I think that's why Elias never liked me. I had my father's face."
        ]
      }
    },

    dr_crane: {
      id: "dr_crane",
      name: "Dr. Aubrey Crane",
      role: "suspect",
      title: "Family Physician",
      age: 55,
      portrait: "crane.png",
      bio: "The Ashwood family doctor for 18 years. Quiet, precise, and deeply loyal to Elias. Signed the death certificate without ordering a toxicology screen.",
      traits: ["loyal", "secretive", "conflicted"],
      motive: "Nathaniel threatened to expose that Crane had falsified a previous patient's records (a favor to Elias that got someone institutionalized). Crane signed off on the death to protect himself.",
      guilty: false, // accessory, not killer
      knewAbout: "Did not know Nathaniel poisoned Elias. Genuinely believed it was heart failure — until he ran his own toxicology test two days later.",
      secretHolds: "Has the toxicology results locked in his office safe. Has been paralyzed about what to do.",
      cluesProvided: ["toxicology_results", "prescription_log"],
      dialogue: {
        first_meeting: [
          "Elias was my patient and my friend. His heart had been failing for two years.",
          "I stand by my assessment. There is nothing unusual here.",
          "Please — don't dig up this family's pain for nothing."
        ],
        after_finding_receipt: [
          "...",
          "I didn't... I didn't prescribe that.",
          "Someone used my prescription pad. I suspected — but I had no proof.",
          "I ran a private screen, three days after. The compound was there. In trace amounts, but it was there.",
          "I have the report. I've had it for two weeks. I didn't know what to do."
        ],
        final_testimony: [
          "I was a coward. I let fear close my eyes.",
          "Take the results. Take everything. I'll testify to whatever you need.",
          "Just — tell me Elias is at peace. Whoever he really was."
        ]
      }
    },

    hester: {
      id: "hester",
      name: "Hester Drum",
      role: "witness",
      title: "Housekeeper (28 years of service)",
      age: 62,
      portrait: "hester.png",
      bio: "Has worked at Ashwood Manor since 1996. Fiercely loyal to the family. Knows every secret the walls hold. Has been lying about Dorothea's alibi.",
      traits: ["loyal", "protective", "observant"],
      motive: "Covered for Dorothea because she genuinely believes Dorothea didn't commit murder — just wanted to protect her from scrutiny.",
      guilty: false,
      lyingAbout: "Dorothea's alibi. Dorothea was not in the library — she was in the study wing, near Elias's room.",
      truthTells: [
        "Saw Nathaniel's car leave",
        "Noticed the brandy decanter was washed — unusually — that morning",
        "Heard raised voices between Nathaniel and Elias three days prior"
      ],
      dialogue: {
        first_meeting: [
          "I'll answer what I'm able to, Detective.",
          "Mrs. Ashwood was in the library all evening. I brought her chamomile at quarter past nine.",
          "I've nothing more to add about that night."
        ],
        pressed_on_alibi: [
          "I told you what I saw.",
          "...",
          "She's a good woman. She didn't do anything wrong.",
          "But if you're asking whether she was in that library the whole night — I... I can't say that with certainty.",
          "She was gone for a stretch. An hour, perhaps. I don't know where."
        ],
        brandy_detail: [
          "I noticed because I'm the one who usually washes it. Mr. Nathaniel was in the kitchen before I was up.",
          "Seven in the morning, still in his dinner clothes. I didn't think of it then.",
          "But now — yes. He washed it himself. The brandy decanter and the glass."
        ]
      }
    },

    jonas_ghost: {
      id: "jonas_ghost",
      name: "The Ghost of Jonas Merrill",
      role: "spectral_witness",
      title: "The Real Victim",
      age: null,
      portrait: "ghost.png",
      bio: "Jonas Merrill. Born 1948, died 1972 in a fire that destroyed the Harwick warehouse. Except — he didn't die in that fire. He survived, found a burned stranger's body, helped a young con man named Tomas Vey assume the dead man's identity. And then Tomas Vey — now 'Elias Ashwood' — paid Jonas with silence and exile. Jonas died genuinely in 1989, impoverished and alone.",
      role_in_story: "Manifests in the manor as environmental clues, whispers, and ultimately a hidden journal. Not a literal ghost — but the story treats his presence metaphorically through recurring imagery.",
      cluesProvided: ["jonas_journal", "warehouse_photo", "exile_letter"]
    },

    declan: {
      id: "declan",
      name: "Declan Fairweather",
      role: "secondary",
      title: "Ruined Business Partner",
      age: 64,
      portrait: "declan.png",
      bio: "Elias's original business partner, pushed out in 1995 via fabricated fraud allegations. Has lived quietly in Whitmore for 29 years. Sylvie's biological father.",
      motive: "Has every reason to hate Elias — but was 300 miles away the night of the murder.",
      guilty: false,
      relevance: "His existence proves Elias's pattern of destroying people. Also serves as a red herring if Maren follows the wrong thread.",
      dialogue: {
        if_visited: [
          "Elias Ashwood. Dead at last.",
          "Don't look at me like that. I didn't touch him.",
          "I gave up on revenge twenty years ago. It eats you from the inside.",
          "You want to know about Tomas Vey? That's what you're really asking.",
          "I knew, eventually. Figured it out around 2005. By then... what was the point?",
          "The point is now, I suppose. Ask what you need."
        ]
      }
    }
  },

  // ============================================================
  //  LOCATIONS
  // ============================================================
  locations: {

    manor_exterior: {
      id: "manor_exterior",
      name: "Ashwood Manor — Exterior",
      description: "The manor rises from the hill like a dark crown. Victorian architecture, four stories, east and west wings extending from the main body. The grounds are immaculate despite the October wind stripping the last leaves from the oaks. A long gravel driveway. A detached carriage house converted to an artist's studio. A groundskeeper's shed near the northern hedge.",
      atmosphere: "The rain has stopped but the air smells electric, as though the storm hasn't decided whether to leave.",
      clues: ["tire_tracks", "groundskeeper_shed_key"],
      exits: ["foyer", "carriage_house", "groundskeeper_shed"],
      firstVisit: "It's larger than I expected. Or maybe it's just that wealth always makes things seem bigger than they need to be."
    },

    foyer: {
      id: "foyer",
      name: "The Foyer",
      description: "High ceilings with a chandelier that hasn't been fully lit — half the bulbs are dark. A grand staircase sweeps upward. Oil portraits line the wall: four generations of 'Ashwoods.' Something is slightly wrong about the oldest portrait — a man who looks nothing like the others.",
      clues: ["portrait_anomaly", "guest_registry"],
      exits: ["manor_exterior", "drawing_room", "dining_room", "study_corridor", "kitchen"],
      characters: ["hester"],
      note: "The oldest portrait is not of an Ashwood at all — it's a placeholder Elias had commissioned using a fictional composite. A detail only apparent if the player examines the canvas closely — the brushwork is newer than the gilt frame."
    },

    drawing_room: {
      id: "drawing_room",
      name: "The Drawing Room",
      description: "Formal and slightly cold. Unused in feel despite being maintained. A baby grand piano no one plays. A drinks cabinet with crystal decanters — one is obviously newer than the others, purchased as a replacement. A framed playbill from a 1979 London production: 'The Glass Meridian.' Leading actress: Dorothea Marsh.",
      clues: ["drinks_cabinet", "playbill_dorothea", "piano_sheet_music"],
      exits: ["foyer", "east_wing_corridor"],
      characters: [],
      note: "The piano has sheet music for a piece called 'Variations on a Departure.' Elias had it commissioned from a local composer in 2019 — after his first heart episode. The title means something to those who understand his guilt."
    },

    study: {
      id: "study",
      name: "Elias's Study",
      description: "The room where he died. A massive oak desk dominates the space. Bookshelves floor to ceiling. A cold fireplace. The leather chair behind the desk is stained — a faint discoloration that wasn't fully cleaned. The room smells of old paper and brandy and, faintly, something medicinal.",
      clues: ["brandy_glass", "desk_hidden_compartment", "appointment_calendar", "trash_bin_note", "medicinal_smell"],
      exits: ["study_corridor"],
      characters: [],
      locked: true,
      unlockCondition: "hester_permission OR lockpick",
      note: "The hidden compartment in the desk requires either finding the release mechanism (a specific book on the shelf acts as a lever) or obtaining the key from Dorothea after gaining her trust. Inside: Elias's confession, the original Jonas Merrill photograph, and the name 'Tomas Vey.'"
    },

    library_east: {
      id: "library_east",
      name: "East Wing Library",
      description: "Floor-to-ceiling shelves of leather-bound volumes, most for show. A reading chaise. A side table with a cold teacup — chamomile. The windows face the formal garden. From here you can see the study window in the main body of the house.",
      clues: ["teacup_chamomile", "library_window_view", "dorothea_bookmark"],
      exits: ["east_wing_corridor"],
      characters: ["dorothea"],
      note: "The window view is crucial — you can see directly into the study. Whoever was in this library could see what was happening in the study that night. The bookmark in Dorothea's book is on page 12 of a 400-page novel — she wasn't actually reading."
    },

    dining_room: {
      id: "dining_room",
      name: "The Dining Room",
      description: "A long mahogany table set for eight, though only three people live here. Silver candlesticks. A sideboard with family photos: Nathaniel at 16, stern even then. Sylvie at various ages, always slightly apart from the group. A gap on the wall where a painting was removed — the ghostly outline visible.",
      clues: ["family_photos", "removed_painting_outline"],
      exits: ["foyer", "kitchen"],
      characters: [],
      note: "The removed painting was a landscape of Harwick County — where the 1972 fire occurred. Elias had it removed a month before his death, around the same time he began writing his confession."
    },

    kitchen: {
      id: "kitchen",
      name: "The Kitchen",
      description: "A large working kitchen, warm and lived-in compared to the rest of the manor. Hester's domain. A drying rack. A coffee maker. And — if you know to look — a brandy decanter on the drying rack that shouldn't have been washed.",
      clues: ["washed_decanter", "kitchen_log"],
      exits: ["foyer", "dining_room", "pantry"],
      characters: ["hester"],
      note: "The decanter is the key physical evidence. It was washed by Nathaniel at 7 AM. Hester saw him do it but didn't connect it at the time."
    },

    nathaniel_room: {
      id: "nathaniel_room",
      name: "Nathaniel's Room",
      description: "Immaculate to the point of sterility. Expensive clothing. A laptop on the desk. A locked drawer in the nightstand. Framed accolades on the wall — but the most recent is from six years ago, as though success stopped arriving.",
      clues: ["debt_correspondence", "locked_nightstand", "new_will_draft"],
      exits: ["west_wing_corridor"],
      characters: ["nathaniel"],
      locked_drawer_contents: "pharmacy_receipt, a torn page from a botanical reference book describing digitalis compounds, and a burner phone with one contact: 'R.C.' (Dr. Crane's initials)"
    },

    carriage_house: {
      id: "carriage_house",
      name: "Sylvie's Studio",
      description: "A converted carriage house, warm from a space heater, smelling of linseed oil and turpentine. Prints hang everywhere — abstract and figurative. A digital camera on a tripod (set to automatic interval shots). Her observation journal on the worktable, open.",
      clues: ["sylvie_camera_photos", "observation_journal", "fairweather_research"],
      exits: ["manor_exterior"],
      characters: ["sylvie"],
      note: "The camera photos provide Nathaniel's alibi hole — timestamped images captured his car leaving and returning. The observation journal contains Sylvie's careful notes about the night, written in a detached, almost clinical style."
    },

    groundskeeper_shed: {
      id: "groundskeeper_shed",
      name: "Groundskeeper's Shed",
      description: "Smells of earth and motor oil. Tools, fertilizer bags, a workbench. And on the workbench, hidden under a loose floorboard — a tin box.",
      clues: ["tin_box"],
      exits: ["manor_exterior"],
      locked: true,
      unlockCondition: "groundskeeper_shed_key",
      note: "The tin box contains: a key to a safety deposit box at Whitmore National Bank, and a photograph of a young Tomas Vey before he became Elias Ashwood. The safety deposit box (if visited) contains the original stolen deeds and a letter from Jonas Merrill dated 1972."
    },

    whitmore_bank: {
      id: "whitmore_bank",
      name: "Whitmore National Bank",
      description: "A small-town bank that has occupied the same building since 1951. The safety deposit section is in the basement. Vault No. 114.",
      clues: ["stolen_deeds", "jonas_letter_1972"],
      exits: ["whitmore_town"],
      unlockCondition: "safety_deposit_key",
      note: "This is the deepest layer of the mystery — the proof that Elias was not who he claimed to be, and that the land Ashwood Industries was built on was stolen through identity fraud."
    },

    dr_crane_office: {
      id: "dr_crane_office",
      name: "Dr. Crane's Office",
      description: "A small private practice in Whitmore. Framed diplomas. A locked safe behind a Monet reproduction. The prescription log book sits on the desk — and a page has been neatly torn out.",
      clues: ["prescription_log", "torn_log_page", "safe_toxicology"],
      exits: ["whitmore_town"],
      characters: ["dr_crane"],
      note: "The safe contains the toxicology results Crane ran privately. The torn page from the prescription log is in Nathaniel's locked nightstand drawer."
    }
  },

  // ============================================================
  //  CLUES
  // ============================================================
  clues: {

    brandy_glass: {
      id: "brandy_glass",
      name: "The Brandy Glass (Trace)",
      location: "study",
      description: "The glass from which Elias drank his final brandy. It was cleaned — but not well enough. A chemical residue test would find traces of the compound.",
      revealedBy: "examining the study carefully",
      connectsTo: ["washed_decanter", "pharmacy_receipt", "toxicology_results"],
      weight: "critical"
    },

    washed_decanter: {
      id: "washed_decanter",
      name: "The Washed Decanter",
      location: "kitchen",
      description: "On the drying rack. Hester confirms she did not wash it — Nathaniel was in the kitchen at 7 AM, still in his dinner clothes, washing it himself.",
      revealedBy: "talking to Hester about morning routine",
      connectsTo: ["brandy_glass", "nathaniel_presence"],
      weight: "significant"
    },

    pharmacy_receipt: {
      id: "pharmacy_receipt",
      name: "Pharmacy Receipt",
      location: "nathaniel_room",
      description: "A receipt from a compounding pharmacy in the city, dated October 9th — five days before the murder. The compound listed is obscured, but the pharmacy name is legible: 'Greystone Compounding, Ltd.'",
      revealedBy: "searching Nathaniel's locked nightstand drawer",
      connectsTo: ["crane_appointment", "toxicology_results"],
      weight: "critical",
      requiresLock: true
    },

    toxicology_results: {
      id: "toxicology_results",
      name: "Dr. Crane's Private Toxicology Report",
      location: "dr_crane_office",
      description: "A private toxicology screen Crane ran after signing the death certificate. Shows trace quantities of a digitalis-derived compound in Elias's preserved blood sample. Crane had taken a sample as routine practice.",
      revealedBy: "confronting Crane after finding pharmacy receipt, or finding safe combination",
      connectsTo: ["pharmacy_receipt", "brandy_glass"],
      weight: "critical",
      requiresSafe: true
    },

    desk_hidden_compartment: {
      id: "desk_hidden_compartment",
      name: "Elias's Hidden Confession",
      location: "study",
      description: "A sealed envelope inside a hidden compartment. Contains: a handwritten confession admitting he is Tomas Vey, that he assumed Elias Ashwood's identity in 1972, and that he stole the Calwell family's land using forged deeds. Also names the safety deposit box in Whitmore.",
      revealedBy: "finding the release mechanism (the book 'The Life of Elias Marsh' acts as a lever)",
      connectsTo: ["jonas_journal", "stolen_deeds", "groundskeeper_shed_key"],
      weight: "revelatory",
      requiresMechanism: true
    },

    new_will_draft: {
      id: "new_will_draft",
      name: "Draft of New Will",
      location: "nathaniel_room",
      description: "A printed draft with handwritten notations from Elias. Nathaniel's share: reduced from 70% to 8%. A note in the margin: 'Pending my disclosure.' The disclosure referenced is clearly Elias's plan to reveal his true identity.",
      revealedBy: "searching Nathaniel's room",
      connectsTo: ["nathaniel_motive"],
      weight: "significant"
    },

    sylvie_camera_photos: {
      id: "sylvie_camera_photos",
      name: "Sylvie's Interval Camera Photos",
      location: "carriage_house",
      description: "Automatic interval photographs taken every 15 minutes from the studio. Several show the driveway. Clear timestamped evidence: Nathaniel's Mercedes left at 9:43 PM and returned at 11:58 PM. The dinner reservation was in the city — 40 minutes away.",
      revealedBy: "reviewing the camera in Sylvie's studio (Sylvie must be trusted first)",
      connectsTo: ["nathaniel_alibi_gap", "tire_tracks"],
      weight: "critical"
    },

    observation_journal: {
      id: "observation_journal",
      name: "Sylvie's Observation Journal",
      location: "carriage_house",
      description: "Dates, times, notes. October 14th: 'N.'s car left 9:43. Study light still on. N. back 11:58. Light out at 12:17. No sounds. Rain.' Written in her precise, detached hand.",
      revealedBy: "gaining Sylvie's trust",
      connectsTo: ["sylvie_camera_photos", "nathaniel_motive"],
      weight: "significant"
    },

    tire_tracks: {
      id: "tire_tracks",
      name: "Tire Tracks (Driveway)",
      location: "manor_exterior",
      description: "Fresh tire tracks in the gravel. A distinctive pattern from high-performance tires — the kind used on a Mercedes S-Class. The tracks show the car left and returned during the night.",
      revealedBy: "examining the driveway on first arrival",
      connectsTo: ["sylvie_camera_photos", "nathaniel_car"],
      weight: "minor"
    },

    blackmail_letters: {
      id: "blackmail_letters",
      name: "Blackmail Correspondence",
      location: "dorothea_room",
      description: "Eleven years of correspondence between Dorothea and Elias. She discovered his identity. He paid her silence — not in money but in maintaining the marriage and including her in the will. The letters reveal their arrangement.",
      revealedBy: "searching Dorothea's room with her permission (after confrontation)",
      connectsTo: ["dorothea_motive", "elias_identity"],
      weight: "significant"
    },

    jonas_letter_1972: {
      id: "jonas_letter_1972",
      name: "Jonas Merrill's Letter (1972)",
      location: "whitmore_bank",
      description: "A letter Jonas wrote to himself, never sent, placed in the safety deposit box. Documents the fire, the dead stranger, how he helped Tomas Vey construct his new identity. 'I thought I was helping him survive. I didn't know I was building his throne.'",
      revealedBy: "opening safety deposit box",
      connectsTo: ["elias_true_identity", "stolen_deeds"],
      weight: "revelatory"
    },

    stolen_deeds: {
      id: "stolen_deeds",
      name: "Forged Land Deeds",
      location: "whitmore_bank",
      description: "The original Calwell family deeds and Elias's forged versions side by side. The foundation of Ashwood Industries — built on land that was never his.",
      revealedBy: "opening safety deposit box",
      connectsTo: ["elias_true_identity", "calwell_family"],
      weight: "significant"
    },

    crane_appointment: {
      id: "crane_appointment",
      name: "Appointment Calendar Entry",
      location: "study",
      description: "October 7th in Elias's calendar: 'Crane — private matter.' This was not a medical visit — it was Nathaniel using Crane's prescription authority.",
      revealedBy: "examining the appointment calendar in the study",
      connectsTo: ["pharmacy_receipt", "crane_coercion"],
      weight: "significant"
    },

    portrait_anomaly: {
      id: "portrait_anomaly",
      name: "The Anomalous Portrait",
      location: "foyer",
      description: "The oldest portrait in the row doesn't match the family aesthetics. The face is a composite — no real person. The brushwork is newer than it appears. A detail that, once noticed, suggests the Ashwood family history was constructed.",
      revealedBy: "examining the foyer portraits carefully",
      connectsTo: ["elias_false_identity"],
      weight: "atmospheric"
    },

    forged_will: {
      id: "forged_will",
      name: "A Forged Earlier Will",
      location: "dorothea_room",
      description: "A will that appears to date from 2015, signed by 'Elias Ashwood.' Dorothea had it prepared as insurance. It's a forgery — but a good one. She never used it.",
      revealedBy: "deep search of Dorothea's room",
      connectsTo: ["dorothea_desperation"],
      weight: "significant"
    },

    groundskeeper_shed_key: {
      id: "groundskeeper_shed_key",
      name: "Groundskeeper's Shed Key",
      location: "manor_exterior (hidden under porch step)",
      description: "A small brass key hidden under the third porch step. Dorothea mentions it in her final dialogue if Maren earns her full trust.",
      revealedBy: "Dorothea's final revelation dialogue, or finding manually",
      connectsTo: ["tin_box", "safety_deposit_key"],
      weight: "key_item"
    },

    safety_deposit_key: {
      id: "safety_deposit_key",
      name: "Safety Deposit Box Key",
      location: "groundskeeper_shed",
      description: "Key to Vault No. 114, Whitmore National Bank. The tin box also contains a photograph of a young man — Tomas Vey before he became Elias Ashwood.",
      revealedBy: "opening the tin box in the groundskeeper's shed",
      connectsTo: ["whitmore_bank", "elias_identity_proof"],
      weight: "key_item"
    }
  },

  // ============================================================
  //  ACTS
  // ============================================================
  acts: {

    act1: {
      id: "act1",
      title: "The Call",
      subtitle: "Arriving at Ashwood Manor",
      summary: "Maren arrives at Ashwood Manor the morning after Elias's death. The official story is heart failure. A letter sent to her office says otherwise — signed only with an ink-smudged handprint.",
      objectives: [
        "Arrive at the manor",
        "Meet the family (Dorothea, Nathaniel, Sylvie)",
        "Survey the exterior and foyer",
        "Gain access to the study",
        "Find the first physical clue"
      ],
      openingNarration: [
        "The letter arrived three days ago. No return address. No signature. Just twelve words and a handprint in ink:",
        "'He did not die by his heart. Come to Ashwood.'",
        "I drove up in the rain.",
        "Ashwood Manor looked like a place that had spent decades deciding whether to collapse or endure.",
        "It had chosen endurance.",
        "I wasn't sure that was the better option."
      ],
      keyEvents: [
        "Maren arrives at manor exterior",
        "Hester opens the door — guarded",
        "First meeting with Dorothea in the drawing room",
        "Nathaniel arrives from the city — suspicious of Maren's presence",
        "Sylvie is glimpsed through the window of the carriage house",
        "Maren gains access to the study",
        "Discovery of the anomalous portrait",
        "Discovery of tire tracks"
      ],
      endCondition: "Finding the first critical clue (brandy glass trace OR appointment calendar)"
    },

    act2: {
      id: "act2",
      title: "The House",
      subtitle: "Reading the Rooms",
      summary: "Maren investigates the manor room by room. Each location reveals a piece of the family's dysfunction. Conversations deepen. The first major suspects emerge.",
      objectives: [
        "Search all main floor rooms",
        "Build rapport with at least one character (Sylvie or Hester)",
        "Discover Dorothea's secret (blackmail)",
        "Find the new will draft",
        "Speak to Dr. Crane by phone"
      ],
      keyEvents: [
        "Deep conversation with Hester — she lies about alibi but reveals brandy detail",
        "Sylvie begins to open up — mentions seeing a car",
        "Nathaniel becomes hostile when Maren examines his room",
        "Dorothea, when pressed, admits to knowing about Elias's identity — but not to murder",
        "The appointment calendar connects to Dr. Crane",
        "First phone call with Crane — he's evasive"
      ],
      endCondition: "Discovering the hidden will draft AND receiving Sylvie's testimony about the car"
    },

    act3: {
      id: "act3",
      title: "The Depth",
      subtitle: "What Lies Beneath",
      summary: "Maren leaves the manor to follow leads in Whitmore. Dr. Crane is confronted. The groundskeeper's shed is accessed. The safety deposit box is opened. The true scope of Elias's identity fraud is revealed.",
      objectives: [
        "Visit Dr. Crane's office",
        "Obtain toxicology results",
        "Access the groundskeeper's shed",
        "Open the safety deposit box",
        "Discover who Elias really was"
      ],
      keyEvents: [
        "Dr. Crane breaks when confronted with the pharmacy receipt",
        "Crane reveals the toxicology results — murder confirmed",
        "The tin box in the groundskeeper's shed reveals the safety deposit key",
        "Whitmore Bank — Vault 114 opened",
        "Jonas Merrill's letter read — Tomas Vey's story revealed",
        "Maren returns to the manor with the truth"
      ],
      playerChoice_1: {
        prompt: "Before confronting Nathaniel, do you:",
        options: [
          { text: "Go to Declan Fairweather in Whitmore first", leadsTo: "fairweather_detour" },
          { text: "Return directly to the manor", leadsTo: "direct_confrontation" }
        ],
        note: "Taking the detour adds depth — Declan provides Elias's earliest history and serves as emotional counterpoint — but delays the confrontation and changes its dynamic."
      },
      endCondition: "Obtaining the toxicology report AND the Jonas Merrill letter"
    },

    act4: {
      id: "act4",
      title: "The Reckoning",
      subtitle: "The Truth Comes Apart",
      summary: "Maren returns to Ashwood Manor with the full picture. Every character is confronted. Loyalties are tested. Nathaniel's guilt is established — but the question of what to do with it is left to Maren.",
      objectives: [
        "Confront Dorothea with the blackmail evidence",
        "Confront Hester with her false alibi",
        "Confront Dr. Crane (if not done in Act 3)",
        "Confront Nathaniel directly",
        "Make the first ending-shaping choice"
      ],
      keyEvents: [
        "Dorothea, confronted, reveals everything — gives Maren the groundskeeper key (if not found)",
        "Hester admits the alibi was false — emotional breakdown",
        "Sylvie provides the camera photos as formal evidence",
        "Nathaniel confrontation — he eventually breaks and confesses"
      ],
      playerChoice_2: {
        prompt: "Nathaniel has confessed privately. The evidence is solid. You have options:",
        options: [
          { text: "Call the police immediately", leadsTo: "path_justice" },
          { text: "Give Nathaniel 24 hours to turn himself in", leadsTo: "path_honor" },
          { text: "Bring the evidence to the family first", leadsTo: "path_family" },
          { text: "Ask Nathaniel why — hear him out fully", leadsTo: "path_understanding" }
        ]
      },
      endCondition: "Nathaniel confesses"
    },

    act5: {
      id: "act5",
      title: "The Inheritance",
      subtitle: "What Is Left",
      summary: "The aftermath. Different depending on choices made throughout. The Ashwood legacy is reckoned with — legally, emotionally, and morally.",
      objectives: [
        "Reach one of the six endings"
      ],
      note: "Each ending reflects not just who is punished, but what Maren decides to do with the larger story — Elias's identity fraud, the Calwell family's stolen land, Sylvie's heritage."
    }
  },

  // ============================================================
  //  ENDINGS
  // ============================================================
  endings: {

    ending_justice: {
      id: "ending_justice",
      title: "The Weight of Evidence",
      type: "good",
      unlockCondition: "path_justice AND found_all_critical_clues",
      summary: "Maren calls the police. Nathaniel is arrested. The full investigation — including Elias's identity fraud and the stolen Calwell deeds — becomes public record. The Ashwood empire unravels. Sylvie finds her father. Dorothea faces accessory charges for the blackmail. Dr. Crane loses his license but avoids prison. The Calwell family heirs begin land reclamation proceedings.",
      marenFinalThought: [
        "Justice is a complicated word in a case like this.",
        "Nathaniel killed a man — but the man he killed had built his life on another crime.",
        "Dorothea knew and stayed silent for profit. Crane knew and stayed silent from fear.",
        "And somewhere in Whitmore, a woman named Iris Calwell is looking at papers that prove her grandmother wasn't wrong.",
        "The Ashwood name will be gone within a year.",
        "I drove home in the morning light.",
        "Some cases close cleanly. This wasn't one of them.",
        "But it closed."
      ],
      epilogues: {
        nathaniel: "Convicted of first-degree murder. Sentenced to 22 years.",
        dorothea: "Charged with accessory after the fact. Settled for probation and significant restitution.",
        sylvie: "Met her father, Declan, for the first time. They are still in contact.",
        crane: "License revoked. Moved out of Whitmore.",
        hester: "Retired. Lives with her sister in the countryside.",
        calwells: "Land reclamation case ongoing."
      }
    },

    ending_honor: {
      id: "ending_honor",
      title: "One More Day",
      type: "bittersweet",
      unlockCondition: "path_honor",
      summary: "Maren gives Nathaniel 24 hours. He doesn't run — he turns himself in the next morning, with a written full confession. The process is cleaner, the family less destroyed. But Nathaniel's lawyer frames the confession as voluntary surrender and achieves a lesser sentence.",
      marenFinalThought: [
        "I wondered if I'd made a mistake.",
        "He came in exactly on time. His lawyer was already there.",
        "The confession was complete. Everything.",
        "I don't know if giving him that night was mercy or mistake.",
        "Maybe both."
      ],
      epilogues: {
        nathaniel: "Pleads guilty. Sentenced to 14 years. Eligible for parole in 9.",
        dorothea: "Not charged. Uses remaining resources to fund the Calwell restitution.",
        sylvie: "Inherits the carriage house studio. Continues her work.",
        crane: "Retires voluntarily. License not formally revoked.",
        calwells: "Receive partial restitution. Case settled."
      }
    },

    ending_family: {
      id: "ending_family",
      title: "The House Decides",
      type: "complex",
      unlockCondition: "path_family AND sylvie_trusted",
      summary: "Maren brings the evidence to the family before the police. Dorothea, Sylvie, and Hester sit in the drawing room while Maren lays everything out. They vote — unanimously — to call the police themselves, presenting a unified front. The family turns in Nathaniel together.",
      marenFinalThought: [
        "I've seen families close ranks to protect a monster.",
        "I didn't expect them to choose otherwise.",
        "But they did.",
        "Dorothea picked up the phone herself.",
        "Sylvie held Hester's hand.",
        "I sat in the corner and watched three women decide what kind of people they wanted to be."
      ],
      epilogues: {
        nathaniel: "Arrested. Convicted. 18 years.",
        dorothea: "Cooperates fully. No charges filed. Donates manor to historical trust.",
        sylvie: "Reconnects with Declan. Moves to Whitmore to be closer to him.",
        crane: "Cooperates. Receives immunity for testimony.",
        calwells: "Full restitution awarded in subsequent civil proceedings."
      }
    },

    ending_understanding: {
      id: "ending_understanding",
      title: "The Full Measure",
      type: "melancholy",
      unlockCondition: "path_understanding AND visited_declan AND found_jonas_letter",
      summary: "Maren hears Nathaniel out completely. He tells her everything — including that Elias, in his last months, had begun confessing to Nathaniel and asking forgiveness. Nathaniel had learned the full scope of his father's fraud — and had snapped. The murder wasn't cold and calculated: it was the end of a long collapse. This doesn't change what Maren does. She calls the police. But she understands.",
      marenFinalThought: [
        "He sat across from me and told me about the night his father told him the truth.",
        "All of it. Jonas Merrill. Tomas Vey. The forged deeds. The years of lies.",
        "'He said he wanted to come clean before he died,' Nathaniel told me. 'He said he'd been waiting for courage.'",
        "'I told him the courage came forty years too late.'",
        "'Then I put something in his drink.'",
        "I don't have forgiveness for him. I don't have contempt either.",
        "I have — a clearer picture of how people become the worst versions of themselves.",
        "I made the call."
      ],
      epilogues: {
        nathaniel: "Convicted. 20 years. Writes a memoir from prison that becomes significant in ethics discussions.",
        dorothea: "Moves to London. Never speaks to the press.",
        sylvie: "Inherits nothing material. Gains everything else.",
        crane: "Retires. Returns toxicology report as evidence. Cooperates fully.",
        calwells: "Landmark restitution case — sets legal precedent."
      }
    },

    ending_incomplete: {
      id: "ending_incomplete",
      title: "The Open File",
      type: "bad",
      unlockCondition: "fewer than 5 critical clues found AND confronted Nathaniel without evidence",
      summary: "Maren confronts Nathaniel without sufficient evidence. He denies everything convincingly. Without the toxicology report or camera photos or pharmacy receipt, there's nothing to hold him on. The case closes officially as natural death. Nathaniel goes free. Maren leaves the manor knowing she's missed something — but unable to prove it.",
      marenFinalThought: [
        "I sat in the car at the bottom of the drive for twenty minutes.",
        "I knew. But knowing isn't the same as proving.",
        "The case would stay open in my files.",
        "Open cases are the ones that follow you home."
      ],
      unlockHint: "Find more evidence before confronting Nathaniel directly. Sylvie's studio, Dr. Crane's office, and the groundskeeper's shed each hold critical pieces.",
      replayEncouraged: true
    },

    ending_coverup: {
      id: "ending_coverup",
      title: "What the House Keeps",
      type: "dark",
      unlockCondition: "accepted_dorothea_bribe OR chose_silence",
      summary: "If Maren accepts Dorothea's offer (a significant payment to close the investigation and report natural death), the Ashwood story ends quietly. Nathaniel lives free. The Calwell family never gets justice. Elias's name survives. Maren deposits the money. She tells herself she'll give it away eventually.",
      marenFinalThought: [
        "I told myself the money was only temporary.",
        "That's what everyone tells themselves.",
        "I don't know if Nathaniel ever thinks about it.",
        "I do."
      ],
      isHidden: true,
      unlockNote: "This ending is only accessible if the player accepts Dorothea's bribe offer in Act 4 — a choice that requires having found the blackmail letters (making Dorothea desperate) but NOT having found the full toxicology report (making her feel she has leverage)."
    }
  },

  // ============================================================
  //  PROGRESSION FLAGS
  // ============================================================
  flags: {
    // These are set as the player discovers things
    met_dorothea: false,
    met_nathaniel: false,
    met_sylvie: false,
    met_hester: false,
    met_crane: false,
    crane_confronted: false,
    dorothea_trust_gained: false,
    dorothea_confronted_blackmail: false,
    sylvie_trust_gained: false,
    sylvie_testimony_given: false,
    hester_alibi_broken: false,
    nathaniel_confronted: false,
    nathaniel_confessed: false,
    study_accessed: false,
    hidden_compartment_found: false,
    shed_accessed: false,
    bank_visited: false,
    declan_visited: false,
    bribe_offered: false,
    bribe_accepted: false,

    // Clue flags
    found_brandy_glass: false,
    found_washed_decanter: false,
    found_pharmacy_receipt: false,
    found_toxicology: false,
    found_confession: false,
    found_new_will: false,
    found_camera_photos: false,
    found_jonas_letter: false,
    found_stolen_deeds: false,
    found_tire_tracks: false,
    found_blackmail_letters: false,
    found_crane_appointment: false,

    // Path flags
    path_chosen: null, // "justice" | "honor" | "family" | "understanding" | "coverup"
    act_current: 1
  },

  // ============================================================
  //  GAME RULES / LOGIC NOTES FOR DEVELOPERS
  // ============================================================
  systemNotes: {
    criticalCluesForConviction: [
      "toxicology_results",
      "pharmacy_receipt",
      "sylvie_camera_photos",
      "nathaniel_confession"
    ],
    minimumCluesForGoodEnding: 5,
    clueWeightings: {
      critical: 3,
      significant: 2,
      minor: 1,
      atmospheric: 0,
      revelatory: 2,
      key_item: 0
    },
    endingDetermination: `
      1. Count weighted clues found
      2. Check path_chosen flag
      3. Check special conditions (declan_visited, bribe_accepted, etc.)
      4. Apply ending in priority order:
         - coverup (if bribe_accepted)
         - incomplete (if weighted < 8 AND nathaniel_confronted)
         - understanding (if path_understanding AND declan_visited AND found_jonas_letter)
         - family (if path_family AND sylvie_trusted)
         - honor (if path_honor)
         - justice (default if sufficient evidence found)
    `,
    redHerrings: [
      "Declan Fairweather — seems like a revenge suspect, is actually Sylvie's father",
      "Dorothea's forged will — seems like murder motive, is actually insurance never used",
      "The removed painting in the dining room — atmospheric, connects to Harwick but not to the murder",
      "The playbill in the drawing room — deepens Dorothea's character but isn't a clue"
    ],
    pacing: {
      act1: "Discovery and unease",
      act2: "Investigation and suspicion",
      act3: "Revelation and confirmation",
      act4: "Confrontation and choice",
      act5: "Resolution and reflection"
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = STORY;
}
