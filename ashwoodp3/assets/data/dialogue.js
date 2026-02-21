// ============================================================
//  THE ASHWOOD INHERITANCE - Dialogue Trees
//  All conversation branches, conditions, and outcomes
// ============================================================

const DIALOGUE = {

  // ============================================================
  //  SYSTEM
  // ============================================================
  _meta: {
    format: "Each node has: id, speaker, text (array of lines), responses (array), conditions (optional), outcomes (optional flags set)",
    responseFormat: "{ text, leadsTo, condition (optional), setsFlag (optional), givesClue (optional) }"
  },

  // ============================================================
  //  HESTER DRUM
  // ============================================================
  hester: {

    hester_intro: {
      id: "hester_intro",
      speaker: "hester",
      portrait: "hester",
      text: [
        "You must be the detective.",
        "I'm Hester. I run the house.",
        "Mrs. Ashwood is in the drawing room. She's expecting you, I suppose.",
        "The police have already come and gone. I don't know why you've been called."
      ],
      responses: [
        { text: "I received a letter. Someone thinks there's more to Mr. Ashwood's death.", leadsTo: "hester_letter_response" },
        { text: "I'd like to ask you a few questions, if I may.", leadsTo: "hester_questions_start" },
        { text: "I'll speak to Mrs. Ashwood first. Thank you.", leadsTo: null, endsConversation: true }
      ]
    },

    hester_letter_response: {
      id: "hester_letter_response",
      speaker: "hester",
      text: [
        "A letter.",
        "...",
        "Mr. Ashwood's heart was weak. Had been for two years. Dr. Crane will tell you the same.",
        "Some people can't accept a simple death."
      ],
      responses: [
        { text: "Were you here the night he died?", leadsTo: "hester_night_of" },
        { text: "Did anything seem unusual in the days before?", leadsTo: "hester_days_before" },
        { text: "Who has access to the study?", leadsTo: "hester_study_access" }
      ]
    },

    hester_questions_start: {
      id: "hester_questions_start",
      speaker: "hester",
      text: [
        "I'll answer what I'm able to.",
        "But I'll not have you upsetting the family. They've had enough."
      ],
      responses: [
        { text: "Were you here the night he died?", leadsTo: "hester_night_of" },
        { text: "Tell me about the family.", leadsTo: "hester_family_overview" },
        { text: "Did anything seem unusual recently?", leadsTo: "hester_days_before" }
      ]
    },

    hester_night_of: {
      id: "hester_night_of",
      speaker: "hester",
      text: [
        "Yes. I was in my room by ten. I sleep in the east service corridor.",
        "Mrs. Ashwood was in the library all evening. I brought her chamomile at quarter past nine.",
        "Mr. Nathaniel was at a dinner in the city. He arrived back around midnight, I believe. I heard the door.",
        "Miss Sylvie was in her studio — she keeps late hours."
      ],
      responses: [
        { text: "You're certain Mrs. Ashwood was in the library all night?", leadsTo: "hester_alibi_pressed_1" },
        { text: "What time did Nathaniel return exactly?", leadsTo: "hester_nathaniel_return" },
        { text: "Did you hear anything unusual that night?", leadsTo: "hester_night_sounds" }
      ],
      setsFlag: "hester_night_statement_given"
    },

    hester_alibi_pressed_1: {
      id: "hester_alibi_pressed_1",
      speaker: "hester",
      text: [
        "I brought her chamomile at quarter past nine. She was there.",
        "That's what I know."
      ],
      responses: [
        { text: "After nine-fifteen, did you check on her again?", leadsTo: "hester_alibi_pressed_2" },
        { text: "I see. What about the next morning?", leadsTo: "hester_morning" }
      ]
    },

    hester_alibi_pressed_2: {
      id: "hester_alibi_pressed_2",
      speaker: "hester",
      text: [
        "No. I... no.",
        "She's a grown woman. I brought her tea, not nursed her."
      ],
      responses: [
        { text: "So she could have left the library after nine-fifteen.", leadsTo: "hester_alibi_cracks" },
        { text: "Fair enough. What about the morning?", leadsTo: "hester_morning" }
      ]
    },

    hester_alibi_cracks: {
      id: "hester_alibi_cracks",
      speaker: "hester",
      text: [
        "...",
        "She's a good woman. Whatever you're thinking — she didn't do anything wrong.",
        "But if you're asking whether she was in that library the entire evening — I... I can't say that with certainty.",
        "She was gone for a stretch. An hour, perhaps. I don't know where she went."
      ],
      responses: [
        { text: "Thank you for telling me the truth.", leadsTo: "hester_alibi_aftermath_kind" },
        { text: "Why did you lie before?", leadsTo: "hester_alibi_why_lie" }
      ],
      setsFlag: "hester_alibi_broken",
      givesClue: "dorothea_alibi_broken"
    },

    hester_alibi_aftermath_kind: {
      id: "hester_alibi_aftermath_kind",
      speaker: "hester",
      text: [
        "Don't thank me. I should have said so from the start.",
        "I was protecting her. She's had a hard life in this house.",
        "But not telling the truth hasn't helped anyone."
      ],
      responses: [
        { text: "Tell me about the morning after.", leadsTo: "hester_morning" },
        { text: "One more question — about the brandy.", leadsTo: "hester_brandy_question" }
      ]
    },

    hester_alibi_why_lie: {
      id: "hester_alibi_why_lie",
      speaker: "hester",
      text: [
        "Because I know she didn't kill him.",
        "And I didn't want police thinking she had reason to.",
        "She had reasons. But she didn't act on them.",
        "There's a difference between having motive and being a murderer."
      ],
      responses: [
        { text: "What reasons did she have?", leadsTo: "hester_dorothea_reasons" },
        { text: "Let's talk about the morning.", leadsTo: "hester_morning" }
      ]
    },

    hester_dorothea_reasons: {
      id: "hester_dorothea_reasons",
      speaker: "hester",
      text: [
        "That's not for me to say.",
        "Ask her yourself. She's more forthcoming than she lets on.",
        "When pushed."
      ],
      responses: [
        { text: "Thank you. Tell me about the morning.", leadsTo: "hester_morning" }
      ]
    },

    hester_morning: {
      id: "hester_morning",
      speaker: "hester",
      text: [
        "I came down at six-thirty, as usual. Started coffee.",
        "Mr. Nathaniel was already up. Still in his dinner clothes from the night before.",
        "He was at the sink. Washing the brandy decanter."
      ],
      responses: [
        { text: "The brandy decanter? Is that unusual?", leadsTo: "hester_brandy_detail" },
        { text: "Did he say anything to you?", leadsTo: "hester_nathaniel_morning_words" },
        { text: "What time was this exactly?", leadsTo: "hester_morning_time" }
      ]
    },

    hester_brandy_detail: {
      id: "hester_brandy_detail",
      speaker: "hester",
      text: [
        "I'm the one who washes it. Always have been.",
        "He'd never done it before in twenty years.",
        "I didn't think to question it then. He was distressed, I thought — his father had just died.",
        "But now... yes. He washed it himself. The decanter and the glass."
      ],
      responses: [
        { text: "Do you still have the decanter?", leadsTo: "hester_decanter_location" },
        { text: "Did he seem nervous?", leadsTo: "hester_nathaniel_demeanor" }
      ],
      setsFlag: "hester_brandy_revealed",
      givesClue: "washed_decanter"
    },

    hester_decanter_location: {
      id: "hester_decanter_location",
      speaker: "hester",
      text: [
        "It's on the drying rack. Where it always goes.",
        "He washed it. But washing doesn't always get everything.",
        "I'm not a fool, Detective. I know what you're implying."
      ],
      responses: [
        { text: "Thank you, Hester. This helps.", leadsTo: "hester_close_warm" },
        { text: "Did you tell the police about this?", leadsTo: "hester_police_disclosure" }
      ]
    },

    hester_police_disclosure: {
      id: "hester_police_disclosure",
      speaker: "hester",
      text: [
        "They didn't ask.",
        "They came in, spoke to Nathaniel for twenty minutes, and left.",
        "I think they wanted it to be a heart attack."
      ],
      responses: [
        { text: "I don't.", leadsTo: "hester_close_warm" }
      ]
    },

    hester_nathaniel_return: {
      id: "hester_nathaniel_return",
      speaker: "hester",
      text: [
        "After midnight. I heard the front door at half twelve, perhaps.",
        "I didn't check the clock precisely.",
        "He went straight upstairs. Or I assumed so. I didn't see him."
      ],
      responses: [
        { text: "What about his car? Did you hear it in the drive?", leadsTo: "hester_car_noise" },
        { text: "The family seemed to expect him late?", leadsTo: "hester_dinner_confirmation" }
      ]
    },

    hester_night_sounds: {
      id: "hester_night_sounds",
      speaker: "hester",
      text: [
        "The house is old. It makes noise.",
        "...",
        "There were voices. Late — past eleven. From the study corridor.",
        "I thought it was the radio. Mr. Ashwood sometimes played the radio late.",
        "I didn't investigate."
      ],
      responses: [
        { text: "Voices — plural? More than one person?", leadsTo: "hester_voices_detail" },
        { text: "Did you recognize any words?", leadsTo: "hester_voices_words" }
      ]
    },

    hester_voices_detail: {
      id: "hester_voices_detail",
      speaker: "hester",
      text: [
        "I — I'm not sure.",
        "It could have been the radio. It could have been two people.",
        "The walls carry sound in strange ways in this house.",
        "I didn't think to note it then."
      ],
      responses: [
        { text: "Thank you, Hester.", leadsTo: "hester_close_warm" }
      ]
    },

    hester_family_overview: {
      id: "hester_family_overview",
      speaker: "hester",
      text: [
        "The family.",
        "They're complicated people in a complicated house.",
        "Mrs. Ashwood has held this household together for thirty years. For better or worse.",
        "Mr. Nathaniel is ambitious. He always wanted to be his father's son.",
        "Miss Sylvie is... quiet. Watchful. She sees more than people give her credit for."
      ],
      responses: [
        { text: "What was the relationship like between Elias and Nathaniel?", leadsTo: "hester_elias_nathaniel" },
        { text: "And between Elias and Sylvie?", leadsTo: "hester_elias_sylvie" },
        { text: "Were you fond of Mr. Ashwood?", leadsTo: "hester_fond_elias" }
      ]
    },

    hester_elias_nathaniel: {
      id: "hester_elias_nathaniel",
      speaker: "hester",
      text: [
        "Strained. These past two years especially.",
        "Mr. Elias had become... distant. Preoccupied.",
        "He and Nathaniel argued, three days before he died. I heard it from the kitchen.",
        "Raised voices. Nathaniel saying, 'You can't do this.' Mr. Ashwood saying nothing I could hear clearly.",
        "Nathaniel left slamming the door."
      ],
      responses: [
        { text: "Did this seem unusual?", leadsTo: "hester_argument_context" },
        { text: "What do you think they were arguing about?", leadsTo: "hester_argument_guess" }
      ],
      givesClue: "argument_witness"
    },

    hester_argument_context: {
      id: "hester_argument_context",
      speaker: "hester",
      text: [
        "They argued before. But not like this.",
        "Nathaniel was frightened, I think. Not angry. Frightened and angry.",
        "There's a difference."
      ],
      responses: [
        { text: "Thank you, Hester.", leadsTo: "hester_close_warm" }
      ]
    },

    hester_close_warm: {
      id: "hester_close_warm",
      speaker: "hester",
      text: [
        "I hope you find what you're looking for.",
        "And I hope what you find is something this family can survive."
      ],
      responses: [
        { text: "[End conversation]", leadsTo: null, endsConversation: true }
      ]
    }
  },

  // ============================================================
  //  DOROTHEA ASHWOOD
  // ============================================================
  dorothea: {

    dorothea_intro: {
      id: "dorothea_intro",
      speaker: "dorothea",
      portrait: "dorothea",
      text: [
        "Detective Cole.",
        "I've heard of you. The woman who unmakes powerful men.",
        "Sit down. I won't stand on ceremony — we're past that.",
        "My husband died three days ago. The doctor said it was his heart. Why are you here?"
      ],
      responses: [
        { text: "Someone sent me a letter suggesting otherwise.", leadsTo: "dorothea_letter_react" },
        { text: "I'm sorry for your loss. I'd like to ask a few questions.", leadsTo: "dorothea_condolence_brush" },
        { text: "I think you already know why.", leadsTo: "dorothea_know_why" }
      ]
    },

    dorothea_letter_react: {
      id: "dorothea_letter_react",
      speaker: "dorothea",
      text: [
        "A letter.",
        "...",
        "Do you know who sent it?",
        "No. Of course you don't. If you did, you wouldn't be here fishing."
      ],
      responses: [
        { text: "Tell me about the night your husband died.", leadsTo: "dorothea_night_of" },
        { text: "You don't seem particularly surprised.", leadsTo: "dorothea_not_surprised" }
      ]
    },

    dorothea_condolence_brush: {
      id: "dorothea_condolence_brush",
      speaker: "dorothea",
      text: [
        "Thank you for the condolences. They're noted.",
        "Ask your questions. I'd rather get this over with."
      ],
      responses: [
        { text: "Where were you the night your husband died?", leadsTo: "dorothea_night_of" },
        { text: "What was your husband's state of mind recently?", leadsTo: "dorothea_elias_state" }
      ]
    },

    dorothea_night_of: {
      id: "dorothea_night_of",
      speaker: "dorothea",
      text: [
        "In the east wing library. The entire evening.",
        "Hester brought me chamomile at nine-fifteen. I read until past midnight.",
        "I heard nothing unusual.",
        "I found him at six the next morning. I won't describe it further."
      ],
      responses: [
        { text: "What were you reading?", leadsTo: "dorothea_reading" },
        { text: "Did you hear Nathaniel return?", leadsTo: "dorothea_nathaniel_return" },
        { text: "You were separated from your husband. The different wing.", leadsTo: "dorothea_separation_question" }
      ]
    },

    dorothea_reading: {
      id: "dorothea_reading",
      speaker: "dorothea",
      text: [
        "Dickens. 'Bleak House.'",
        "...",
        "I'm aware of the irony."
      ],
      responses: [
        { text: "The bookmark was on page twelve.", leadsTo: "dorothea_bookmark_caught" },
        { text: "Did anything seem different about that evening?", leadsTo: "dorothea_evening_different" }
      ],
      condition: "found_library_bookmark"
    },

    dorothea_bookmark_caught: {
      id: "dorothea_bookmark_caught",
      speaker: "dorothea",
      text: [
        "...",
        "You're perceptive.",
        "Fine. I wasn't reading.",
        "I was waiting."
      ],
      responses: [
        { text: "Waiting for what?", leadsTo: "dorothea_waiting_what" }
      ],
      condition: "found_library_bookmark"
    },

    dorothea_waiting_what: {
      id: "dorothea_waiting_what",
      speaker: "dorothea",
      text: [
        "For my husband to make a decision he'd been postponing for years.",
        "He'd told me — weeks ago — that he was going to speak to a lawyer.",
        "That he was going to... tell the truth.",
        "About who he was.",
        "About everything.",
        "I was waiting to see if he actually would."
      ],
      responses: [
        { text: "What truth?", leadsTo: "dorothea_play_dumb_or_know", condition: "NOT found_elias_identity" },
        { text: "You knew he wasn't really Elias Ashwood.", leadsTo: "dorothea_confronted_identity", condition: "found_elias_identity_clue" }
      ]
    },

    dorothea_confronted_identity: {
      id: "dorothea_confronted_identity",
      speaker: "dorothea",
      text: [
        "...",
        "How much do you know?",
        "...",
        "Tomas Vey. Yes.",
        "I've known for eleven years.",
        "I found his papers — the originals, not the forgeries — in a box he'd mislabeled and left in the attic.",
        "Birth certificate. Photographs. Letters in a language that wasn't English.",
        "A name: Tomas Vey. Born 1948 in Bratislava."
      ],
      responses: [
        { text: "What did you do when you found out?", leadsTo: "dorothea_discovery_response" },
        { text: "Did you confront him?", leadsTo: "dorothea_confronted_him" }
      ],
      setsFlag: "dorothea_identity_confirmed",
      givesClue: "elias_tomas_vey_confirmed"
    },

    dorothea_discovery_response: {
      id: "dorothea_discovery_response",
      speaker: "dorothea",
      text: [
        "I sat with it for a week.",
        "Then I confronted him.",
        "He denied it for two days. Then he wept.",
        "I had never seen him weep.",
        "It didn't make me forgive him. But it changed something."
      ],
      responses: [
        { text: "You could have gone to the police.", leadsTo: "dorothea_why_not_police" },
        { text: "You used it as leverage.", leadsTo: "dorothea_leverage_accusation" }
      ]
    },

    dorothea_why_not_police: {
      id: "dorothea_why_not_police",
      speaker: "dorothea",
      text: [
        "I could have.",
        "And destroyed everything — myself included.",
        "I was sixty-three years old. Twenty years of marriage. This house. A name.",
        "What would I have been, outside of it?",
        "Call me what you like. I chose survival."
      ],
      responses: [
        { text: "Did you ever consider he might be dangerous?", leadsTo: "dorothea_dangerous_question" },
        { text: "So you made an arrangement.", leadsTo: "dorothea_arrangement" }
      ]
    },

    dorothea_arrangement: {
      id: "dorothea_arrangement",
      speaker: "dorothea",
      text: [
        "He maintained the marriage. Nominally.",
        "I was guaranteed my position in any future will.",
        "We lived our separate lives in this enormous house.",
        "For eleven years.",
        "...",
        "Two months ago, he told me he was going to confess anyway. That the will would be his last act.",
        "He said he needed to be honest before he died.",
        "I told him the timing was remarkably convenient for his conscience."
      ],
      responses: [
        { text: "Did you tell Nathaniel about any of this?", leadsTo: "dorothea_nathaniel_told" },
        { text: "Where were you when he died?", leadsTo: "dorothea_where_really" }
      ]
    },

    dorothea_where_really: {
      id: "dorothea_where_really",
      speaker: "dorothea",
      text: [
        "...",
        "Not in the library. Not the whole time.",
        "I was in the study corridor. Outside his door.",
        "I was going to knock. I was going to tell him — I don't know what I was going to tell him.",
        "I stood there for perhaps twenty minutes. Then I heard voices inside. His and — another.",
        "And I went back to the library."
      ],
      responses: [
        { text: "You heard two voices. One of them was Nathaniel's.", leadsTo: "dorothea_identifies_voice" },
        { text: "Did you recognize the second voice?", leadsTo: "dorothea_voice_recognition" }
      ],
      setsFlag: "dorothea_corridor_witness",
      givesClue: "dorothea_corridor_testimony"
    },

    dorothea_identifies_voice: {
      id: "dorothea_identifies_voice",
      speaker: "dorothea",
      text: [
        "...",
        "Yes.",
        "It was Nathaniel.",
        "I didn't want it to be. But it was.",
        "He was there. In that room. While his father died."
      ],
      responses: [
        { text: "Why didn't you say anything?", leadsTo: "dorothea_silence_reason" }
      ],
      setsFlag: "dorothea_identifies_nathaniel",
      givesClue: "nathaniel_in_study_night"
    },

    dorothea_silence_reason: {
      id: "dorothea_silence_reason",
      speaker: "dorothea",
      text: [
        "Because I didn't know what had happened.",
        "I still don't know. Not for certain.",
        "And because — God help me — I thought about what a confession would do.",
        "Everything would come out. Everything about Tomas, about me.",
        "I am not proud of this."
      ],
      responses: [
        { text: "You mentioned a key. Dorothea mentioned a key in the groundskeeper's shed.", leadsTo: "dorothea_key_reveal", condition: "dorothea_trust_high" },
        { text: "I need to know everything you know.", leadsTo: "dorothea_full_disclosure" }
      ]
    },

    dorothea_key_reveal: {
      id: "dorothea_key_reveal",
      speaker: "dorothea",
      text: [
        "He told me about it. Six months ago. One of his preparatory confessions.",
        "There's a tin box in the groundskeeper's shed, under the floorboard to the left of the door.",
        "The shed key is under the third step of the porch. Left side.",
        "The tin box has a key to a bank vault. And a photograph.",
        "You'll understand when you see the photograph."
      ],
      responses: [
        { text: "Thank you, Dorothea.", leadsTo: "dorothea_close_grateful" }
      ],
      setsFlag: "dorothea_shed_revealed",
      givesClue: "groundskeeper_shed_key"
    },

    dorothea_close_grateful: {
      id: "dorothea_close_grateful",
      speaker: "dorothea",
      text: [
        "Don't thank me. I'm doing what I should have done years ago.",
        "When this is over — whatever you find — I want to know.",
        "I've been living in the dark for a very long time."
      ],
      responses: [
        { text: "[End conversation]", leadsTo: null, endsConversation: true }
      ]
    }
  },

  // ============================================================
  //  NATHANIEL ASHWOOD
  // ============================================================
  nathaniel: {

    nathaniel_intro: {
      id: "nathaniel_intro",
      speaker: "nathaniel",
      portrait: "nathaniel",
      text: [
        "Detective Cole.",
        "I didn't realize Father had retained a private investigator.",
        "He didn't mention it.",
        "His heart had been failing for two years. Dr. Crane will confirm that.",
        "I'm not sure what you expect to find here."
      ],
      responses: [
        { text: "I received a letter suggesting his death wasn't natural.", leadsTo: "nathaniel_letter_react" },
        { text: "I'm just doing my due diligence. Routine.", leadsTo: "nathaniel_routine_response" },
        { text: "I'd like to ask where you were the night he died.", leadsTo: "nathaniel_alibi_ask" }
      ]
    },

    nathaniel_letter_react: {
      id: "nathaniel_letter_react",
      speaker: "nathaniel",
      text: [
        "A letter.",
        "From whom?",
        "...",
        "You know, anonymous accusations are a lawyer's playground.",
        "I hope you're being thorough about where this alleged letter originated."
      ],
      responses: [
        { text: "Where were you the night your father died?", leadsTo: "nathaniel_alibi_ask" },
        { text: "I'm thorough about everything. Tell me about your father's recent health.", leadsTo: "nathaniel_father_health" }
      ]
    },

    nathaniel_alibi_ask: {
      id: "nathaniel_alibi_ask",
      speaker: "nathaniel",
      text: [
        "In the city. Client dinner at Lacroix — a restaurant on Mercer Street.",
        "Reservation was eight PM. Three guests: Harlow, Benett, and myself.",
        "I left around eleven. Drove back. The roads were clear despite the weather.",
        "Got in around midnight. Went straight to bed.",
        "You can call the restaurant."
      ],
      responses: [
        { text: "What time did you leave the manor for the dinner?", leadsTo: "nathaniel_departure_time" },
        { text: "It's about a forty-minute drive from here.", leadsTo: "nathaniel_timing_pressed" },
        { text: "I'll check with the restaurant.", leadsTo: "nathaniel_alibi_accepted" }
      ]
    },

    nathaniel_timing_pressed: {
      id: "nathaniel_timing_pressed",
      speaker: "nathaniel",
      text: [
        "Forty minutes, yes, give or take.",
        "I left around seven-thirty. Arrived at eight. The timing is unremarkable."
      ],
      responses: [
        { text: "Sylvie's photos show your car leaving at 9:43.", leadsTo: "nathaniel_photos_confrontation", condition: "found_camera_photos" },
        { text: "Fine. What's the relationship like with your stepmother?", leadsTo: "nathaniel_dorothea_relation" }
      ]
    },

    nathaniel_photos_confrontation: {
      id: "nathaniel_photos_confrontation",
      speaker: "nathaniel",
      text: [
        "...",
        "Sylvie's photos.",
        "...",
        "Those cameras are on a timer. They could be wrong. The timestamp —",
        "That's — you can't trust those for accuracy."
      ],
      responses: [
        { text: "They're within two minutes of her wall clock. And her journal corroborates.", leadsTo: "nathaniel_evidence_mounting" },
        { text: "The dinner reservation at Lacroix was at eight, you said.", leadsTo: "nathaniel_alibi_collapse" }
      ],
      condition: "found_camera_photos"
    },

    nathaniel_alibi_collapse: {
      id: "nathaniel_alibi_collapse",
      speaker: "nathaniel",
      text: [
        "I...",
        "I went back. I forgot something.",
        "I — a document. For the meeting.",
        "I drove back for a document."
      ],
      responses: [
        { text: "And your father was alive when you returned?", leadsTo: "nathaniel_father_alive_question" },
        { text: "I have the pharmacy receipt from Greystone Compounding.", leadsTo: "nathaniel_pharmacy_confrontation", condition: "found_pharmacy_receipt" }
      ]
    },

    nathaniel_pharmacy_confrontation: {
      id: "nathaniel_pharmacy_confrontation",
      speaker: "nathaniel",
      text: [
        "...",
        "...",
        "I want my lawyer."
      ],
      responses: [
        { text: "And I have the toxicology results.", leadsTo: "nathaniel_full_confrontation", condition: "found_toxicology" }
      ],
      condition: "found_pharmacy_receipt"
    },

    nathaniel_full_confrontation: {
      id: "nathaniel_full_confrontation",
      speaker: "nathaniel",
      text: [
        "...",
        "You can't prove anything.",
        "...",
        "...",
        "You can't prove anything.",
        "...",
        "He was going to destroy everything.",
        "Everything. Not just his name — mine. The company. Forty years of what we built.",
        "He wanted absolution. At seventy-four. After all of it.",
        "He would have walked into a lawyer's office and detonated a bomb. And felt good about it.",
        "Good about it.",
        "I gave him a quiet death. Better than he gave Jonas Merrill."
      ],
      responses: [
        { text: "Jonas Merrill. Tell me what you know about that name.", leadsTo: "nathaniel_jonas_knowledge" },
        { text: "You're going to have to come with me.", leadsTo: "nathaniel_arrest_path" }
      ],
      setsFlag: "nathaniel_confessed",
      condition: "found_toxicology AND found_pharmacy_receipt AND found_camera_photos"
    },

    nathaniel_jonas_knowledge: {
      id: "nathaniel_jonas_knowledge",
      speaker: "nathaniel",
      text: [
        "He told me. Six weeks ago.",
        "Sat me down in that study and said: 'I need to tell you who I am.'",
        "An hour. He talked for an hour.",
        "Tomas Vey. The fire. The dead man's identity. The forged deeds.",
        "Everything he built — the company, the land, this house — all of it stolen.",
        "All of it fraud.",
        "And he wanted to confess. He actually wanted to confess.",
        "I'm supposed to — what? Applaud that? Respect the gesture?",
        "He destroyed a family to build his empire, and now he wants to go quietly into history as a man who told the truth at the end.",
        "He didn't deserve that peace."
      ],
      responses: [
        { text: "So you took it from him.", leadsTo: "nathaniel_took_peace" },
        { text: "He was your father.", leadsTo: "nathaniel_father_line" }
      ]
    },

    nathaniel_took_peace: {
      id: "nathaniel_took_peace",
      speaker: "nathaniel",
      text: [
        "...",
        "I suppose I did.",
        "...",
        "Call who you're going to call."
      ],
      responses: [
        { text: "[Call the police]", leadsTo: null, endsConversation: true, setsFlag: "path_justice" },
        { text: "I'll give you until tomorrow morning to turn yourself in.", leadsTo: null, endsConversation: true, setsFlag: "path_honor" },
        { text: "I need to speak to the family first.", leadsTo: null, endsConversation: true, setsFlag: "path_family" }
      ]
    }
  },

  // ============================================================
  //  SYLVIE ASHWOOD
  // ============================================================
  sylvie: {

    sylvie_intro: {
      id: "sylvie_intro",
      speaker: "sylvie",
      portrait: "sylvie",
      text: [
        "I heard another detective was coming.",
        "The first one barely stayed an hour.",
        "Are you different?"
      ],
      responses: [
        { text: "I try to be thorough.", leadsTo: "sylvie_thorough_response" },
        { text: "I've been told you're observant.", leadsTo: "sylvie_observant_compliment" },
        { text: "What did the first detective miss?", leadsTo: "sylvie_first_detective" }
      ]
    },

    sylvie_first_detective: {
      id: "sylvie_first_detective",
      speaker: "sylvie",
      text: [
        "He didn't talk to me at all.",
        "He spoke to Nathaniel and Dorothea and Dr. Crane and left.",
        "I've been out here the whole time. No one has asked me anything.",
        "I've been waiting."
      ],
      responses: [
        { text: "I'm asking. What do you know?", leadsTo: "sylvie_begins_to_open" },
        { text: "Were you here the night your father died?", leadsTo: "sylvie_night_of_question" }
      ]
    },

    sylvie_night_of_question: {
      id: "sylvie_night_of_question",
      speaker: "sylvie",
      text: [
        "Yes.",
        "In my studio all night. I was working on a series.",
        "I have proof. My camera runs on an interval timer — I set it when I work to document process.",
        "Every fifteen minutes. All night."
      ],
      responses: [
        { text: "Can I see those photographs?", leadsTo: "sylvie_camera_ask" },
        { text: "Did you see or hear anything?", leadsTo: "sylvie_saw_something" }
      ]
    },

    sylvie_camera_ask: {
      id: "sylvie_camera_ask",
      speaker: "sylvie",
      text: [
        "Yes.",
        "They show my studio — and the driveway.",
        "I have Nathaniel's car leaving at 9:43. Returning at 11:58.",
        "His dinner reservation was at eight. That's what he told the family."
      ],
      responses: [
        { text: "Why didn't you tell anyone this?", leadsTo: "sylvie_why_silent" },
        { text: "I need those photos as evidence.", leadsTo: "sylvie_photos_given" }
      ],
      givesClue: "sylvie_camera_photos"
    },

    sylvie_why_silent: {
      id: "sylvie_why_silent",
      speaker: "sylvie",
      text: [
        "Nathaniel frightens me.",
        "Not in a direct way. He's never been cruel to me exactly.",
        "But he looks at me like I don't belong here. Like I'm an inconvenience.",
        "I didn't want to be the person who accused him without being certain.",
        "And I needed someone else to see it first. Someone with — authority."
      ],
      responses: [
        { text: "You have it now. The photos — please.", leadsTo: "sylvie_photos_given" }
      ],
      setsFlag: "sylvie_trust_gained"
    },

    sylvie_photos_given: {
      id: "sylvie_photos_given",
      speaker: "sylvie",
      text: [
        "Take the memory card.",
        "There's also my journal — on the worktable.",
        "I wrote everything down that night. I think I knew, somewhere, that I'd need it."
      ],
      responses: [
        { text: "Thank you, Sylvie.", leadsTo: "sylvie_post_photos" }
      ],
      setsFlag: "sylvie_testimony_given",
      givesClue: "observation_journal"
    },

    sylvie_post_photos: {
      id: "sylvie_post_photos",
      speaker: "sylvie",
      text: [
        "There's something else.",
        "About Elias. About — my place in this family.",
        "You don't have to hear it now. It's not directly related to how he died.",
        "But it's related to who he was."
      ],
      responses: [
        { text: "Tell me.", leadsTo: "sylvie_biological_father" },
        { text: "Maybe later. I need to follow the evidence.", leadsTo: null, endsConversation: true }
      ]
    },

    sylvie_biological_father: {
      id: "sylvie_biological_father",
      speaker: "sylvie",
      text: [
        "Elias kept a file on me. I found it by accident last year, in the third floor archive.",
        "My biological father is Declan Fairweather.",
        "He was Elias's original business partner. Elias destroyed him in 1995. False fraud allegations.",
        "Declan lives in Whitmore. Has for twenty-nine years.",
        "Elias knew. He always knew. He kept the file to remind himself, I think.",
        "Why he adopted me — I don't know. Guilt, maybe.",
        "Or a kind of punishment for himself."
      ],
      responses: [
        { text: "Does Declan know about you?", leadsTo: "sylvie_declan_knows" }
      ],
      givesClue: "fairweather_research"
    },

    sylvie_declan_knows: {
      id: "sylvie_declan_knows",
      speaker: "sylvie",
      text: [
        "Not yet.",
        "I've been trying to work up the courage.",
        "It seems easier to let it wait until all of this is — resolved.",
        "One revelation at a time."
      ],
      responses: [
        { text: "[End conversation]", leadsTo: null, endsConversation: true }
      ]
    }
  },

  // ============================================================
  //  DR. CRANE
  // ============================================================
  crane: {

    crane_phone_first: {
      id: "crane_phone_first",
      speaker: "dr_crane",
      portrait: "crane",
      isPhone: true,
      text: [
        "Dr. Crane speaking.",
        "Yes, I've been expecting someone to call.",
        "Elias was my patient and my friend for eighteen years.",
        "His heart had been deteriorating. I stand by my assessment.",
        "There is nothing unusual about this death."
      ],
      responses: [
        { text: "I'd like to meet with you in person.", leadsTo: "crane_meeting_agree" },
        { text: "I found the appointment calendar. October 7th. Private matter.", leadsTo: "crane_phone_calendar_pressed" }
      ]
    },

    crane_meeting_agree: {
      id: "crane_meeting_agree",
      speaker: "dr_crane",
      isPhone: true,
      text: [
        "...",
        "I suppose that's fine.",
        "My office is on Meridian Street in Whitmore. Tomorrow, two o'clock."
      ],
      responses: [
        { text: "[Hang up]", leadsTo: null, endsConversation: true }
      ],
      setsFlag: "crane_meeting_scheduled"
    },

    crane_in_person: {
      id: "crane_in_person",
      speaker: "dr_crane",
      portrait: "crane",
      text: [
        "Detective Cole. Please, sit.",
        "I'll say again what I said on the phone: Elias's heart was failing.",
        "The official cause of death is accurate."
      ],
      responses: [
        { text: "I found a prescription receipt from Greystone Compounding.", leadsTo: "crane_receipt_confrontation", condition: "found_pharmacy_receipt" },
        { text: "A page was torn from your prescription log.", leadsTo: "crane_torn_log", condition: "found_torn_log" },
        { text: "Tell me about the October 7th appointment.", leadsTo: "crane_oct_7_ask" }
      ]
    },

    crane_receipt_confrontation: {
      id: "crane_receipt_confrontation",
      speaker: "dr_crane",
      text: [
        "...",
        "Where did you find that.",
        "...",
        "I didn't... I didn't prescribe that compound.",
        "Someone used my prescription pad.",
        "I suspected — afterward — but I had no proof. And I was afraid."
      ],
      responses: [
        { text: "You were afraid of what?", leadsTo: "crane_afraid_of" },
        { text: "You ran your own toxicology screen.", leadsTo: "crane_tox_reveal", condition: "found_crane_schedule" }
      ]
    },

    crane_afraid_of: {
      id: "crane_afraid_of",
      speaker: "dr_crane",
      text: [
        "Of what would come out.",
        "Years ago — I did Elias a favor. A patient was causing him problems. Threatening to expose something about the company.",
        "I... added a note to his medical record. Exaggerated a psychological concern.",
        "The man was institutionalized for six months.",
        "Nathaniel found out. Two years ago.",
        "He told me: 'You'll do what I need, when I need it.' And then he waited.",
        "This was what he needed."
      ],
      responses: [
        { text: "He coerced you into signing the death certificate.", leadsTo: "crane_coerced_confirm" }
      ],
      givesClue: "crane_coercion"
    },

    crane_tox_reveal: {
      id: "crane_tox_reveal",
      speaker: "dr_crane",
      text: [
        "...",
        "Yes.",
        "I ran a private screen three days after signing the certificate.",
        "I'd taken a blood sample — routine practice for patients his age.",
        "The compound was there. Trace levels, but unmistakable.",
        "Digitalis derivative. Not naturally occurring in those concentrations in cardiac failure.",
        "I've had the report for two weeks.",
        "I've been paralyzed."
      ],
      responses: [
        { text: "I need that report.", leadsTo: "crane_report_given" },
        { text: "You've known for two weeks and said nothing.", leadsTo: "crane_moral_reckoning" }
      ],
      setsFlag: "crane_tox_revealed"
    },

    crane_report_given: {
      id: "crane_report_given",
      speaker: "dr_crane",
      text: [
        "It's in my safe.",
        "Take it. Take everything.",
        "I'll testify to whatever you need. To everything.",
        "Tell me — tell me Elias is at peace. Whatever his name was.",
        "He was my patient. He was ill and frightened and — I failed him."
      ],
      responses: [
        { text: "[Take the toxicology report]", leadsTo: null, endsConversation: true, givesClue: "toxicology_results", setsFlag: "found_toxicology" }
      ]
    }
  },

  // ============================================================
  //  DECLAN FAIRWEATHER (optional)
  // ============================================================
  declan: {

    declan_intro: {
      id: "declan_intro",
      speaker: "declan",
      portrait: "declan",
      text: [
        "Elias Ashwood.",
        "Dead at last.",
        "Don't look at me like that. I'm not grieving and I won't pretend to.",
        "Sit. Tell me why you came all the way out here."
      ],
      responses: [
        { text: "I'm investigating his death. I think you know more about him than most.", leadsTo: "declan_know_more" },
        { text: "I know about Tomas Vey.", leadsTo: "declan_tomas_vey_mention", condition: "found_elias_identity_clue" }
      ]
    },

    declan_tomas_vey_mention: {
      id: "declan_tomas_vey_mention",
      speaker: "declan",
      text: [
        "...",
        "You found out.",
        "Good.",
        "I figured it out around 2005. Hired a man — like you — to look into some inconsistencies.",
        "Birth certificates don't always match people's stories.",
        "By then... what was the point? I was already ruined. My career, my reputation.",
        "What would I have done with it? More headlines? More hearings? For what?",
        "I let it go.",
        "But I kept the file."
      ],
      responses: [
        { text: "Do you have the file?", leadsTo: "declan_has_file" },
        { text: "There's someone who should know. Someone who shares your blood.", leadsTo: "declan_sylvie_reveal", condition: "sylvie_trust_gained" }
      ]
    },

    declan_sylvie_reveal: {
      id: "declan_sylvie_reveal",
      speaker: "declan",
      text: [
        "...",
        "What did you say?",
        "...",
        "Dorothea's daughter.",
        "...She had Dorothea's daughter?",
        "...",
        "I knew about Dorothea. We were — it was complicated.",
        "She disappeared after 1993. I assumed she'd moved on.",
        "I didn't know.",
        "God. I didn't know."
      ],
      responses: [
        { text: "She wants to meet you.", leadsTo: "declan_sylvie_aftermath" }
      ],
      setsFlag: "declan_knows_sylvie"
    },

    declan_sylvie_aftermath: {
      id: "declan_sylvie_aftermath",
      speaker: "declan",
      text: [
        "...",
        "Tell her — tell her I have time.",
        "Tell her I've had nothing but time for thirty years.",
        "...",
        "What's her name?"
      ],
      responses: [
        { text: "Sylvie.", leadsTo: "declan_close" }
      ]
    },

    declan_close: {
      id: "declan_close",
      speaker: "declan",
      text: [
        "Sylvie.",
        "...",
        "Thank you, Detective.",
        "Do what needs doing. Bring the whole story out.",
        "The Ashwood name shouldn't outlast the truth."
      ],
      responses: [
        { text: "[End conversation]", leadsTo: null, endsConversation: true }
      ]
    }
  }

};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DIALOGUE;
}
