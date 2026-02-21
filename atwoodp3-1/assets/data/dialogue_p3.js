// ════════════════════════════════════════════════════════════
//  THE ASHWOOD INHERITANCE — Phase 3 Dialogue Extensions
//  Adds confrontation nodes, Act 3-4 conversations,
//  and the Nathaniel climax to the existing DIALOGUE object.
//  Load AFTER dialogue.js
// ════════════════════════════════════════════════════════════

// Extend the existing DIALOGUE object from Phase 1
Object.assign(DIALOGUE, {

  // ──────────────────────────────────────────
  //  DR. CRANE
  // ──────────────────────────────────────────
  dr_crane: {

    crane_intro: {
      id: 'crane_intro',
      speaker: 'dr_crane',
      text: [
        'Miss Cole. I was told you might visit.',
        'I want to say immediately — I followed all proper procedures with Mr. Ashwood.'
      ],
      responses: [
        {
          text: '"Mr. Ashwood\'s death was October 14th. Your last visit was October 12th."',
          leadsTo: 'crane_last_visit',
        },
        {
          text: '"What was the private matter he came to see you about?"',
          leadsTo: 'crane_private_matter',
        },
        {
          text: '[Leave for now.]',
          endsConversation: true
        }
      ]
    },

    crane_last_visit: {
      id: 'crane_last_visit',
      speaker: 'dr_crane',
      text: [
        'That\'s correct. A routine check.',
        'His heart was — the condition was consistent with his history.',
        'There was nothing to indicate a departure from natural causes.'
      ],
      responses: [
        {
          text: '"Is that why you ran a private toxicology screen three days after his death?"',
          condition: 'crane_confronted',
          leadsTo: 'crane_breaks',
        },
        {
          text: '"His appointment calendar says \'private matter.\' Not routine."',
          leadsTo: 'crane_private_matter',
        },
        {
          text: '[Leave.]',
          endsConversation: true
        }
      ]
    },

    crane_private_matter: {
      id: 'crane_private_matter',
      speaker: 'dr_crane',
      text: [
        'That\'s — a misreading. He often used informal language in his calendar.',
        'It was a routine follow-up.'
      ],
      responses: [
        {
          text: '"There\'s a torn page in your prescription log. October 7th through 9th."',
          condition: 'torn_log_page',
          leadsTo: 'crane_torn_page',
        },
        {
          text: '"I have a pharmacy receipt. Greystone Compounding. October 9th."',
          condition: 'pharmacy_receipt',
          leadsTo: 'crane_confrontation',
        },
        {
          text: '"I\'ll come back when I know more."',
          endsConversation: true
        }
      ]
    },

    crane_torn_page: {
      id: 'crane_torn_page',
      speaker: 'dr_crane',
      text: [
        '...',
        'I removed it. For privacy purposes.',
        'Certain prescriptions are sensitive.'
      ],
      responses: [
        {
          text: '"Sensitive enough to obstruct a murder investigation?"',
          leadsTo: 'crane_confrontation',
          setsFlag: 'crane_confronted'
        }
      ]
    },

    crane_confrontation: {
      id: 'crane_confrontation',
      speaker: 'dr_crane',
      text: [
        'I need you to understand the position I was put in.',
        'Nathaniel came to me three weeks before his father died.',
        'He told me that Elias had asked him — asked his own son — to help him end his life.',
        'He said his father was in pain. That he wanted to die with dignity.',
        'I was... I was manipulated. I see that now.'
      ],
      setsFlag: 'crane_confronted',
      responses: [
        {
          text: '"You wrote a prescription for digitalis compound."',
          leadsTo: 'crane_prescription_confession',
        }
      ]
    },

    crane_prescription_confession: {
      id: 'crane_prescription_confession',
      speaker: 'dr_crane',
      text: [
        'A dose that would — yes.',
        'I told myself it was mercy.',
        'Then Elias died and I... I ran the test. To know.',
        'When it came back positive I understood what I\'d done.',
        'I signed the certificate. I was afraid.'
      ],
      responses: [
        {
          text: '"Open the safe. Give me the toxicology report."',
          leadsTo: 'crane_opens_safe',
          setsFlag: 'crane_cooperating'
        },
        {
          text: '"If you cooperate fully, I\'ll tell the prosecutor."',
          leadsTo: 'crane_opens_safe',
          setsFlag: 'crane_cooperating'
        }
      ]
    },

    crane_opens_safe: {
      id: 'crane_opens_safe',
      speaker: 'dr_crane',
      text: [
        'The combination is 1981. The year I graduated.',
        'I\'ve been waiting for someone to come.',
        'I think part of me left the safe in case they did.'
      ],
      endsConversation: true
    },

    crane_soft_approach: {
      id: 'crane_soft_approach',
      speaker: 'dr_crane',
      text: [
        'I can\'t discuss patient records without proper authorization.',
        'I think you understand that.'
      ],
      responses: [
        { text: '[I need more evidence before pushing him.]', endsConversation: true }
      ]
    }
  },

  // ──────────────────────────────────────────
  //  DECLAN FAIRWEATHER
  // ──────────────────────────────────────────
  declan: {

    declan_intro: {
      id: 'declan_intro',
      speaker: 'declan',
      text: [
        'I wondered when someone would come.',
        'Twenty-nine years since Elias pushed me out.',
        'And now someone\'s asking questions.',
        'Sit down. I\'ve been carrying this long enough.'
      ],
      responses: [
        {
          text: '"You knew him before he was Elias Ashwood."',
          condition: 'true_identity_known',
          leadsTo: 'declan_tomas',
        },
        {
          text: '"Tell me what happened between you and Elias in 1995."',
          leadsTo: 'declan_1995',
        },
        {
          text: '"Sylvie is your daughter."',
          condition: 'fairweather_research',
          leadsTo: 'declan_sylvie',
        }
      ]
    },

    declan_tomas: {
      id: 'declan_tomas',
      speaker: 'declan',
      text: [
        'Tomas Vey. Yes.',
        'I met him in 1985. He was already Elias by then — ten years in.',
        'I didn\'t know the full truth until much later.',
        'I knew something was constructed. The way he tensed when certain places came up.',
        'In 1993 he told me. After a bad night. Too much whisky, probably.',
        'He wept. Actual tears.',
        'I forgave him.',
        'That was my mistake.'
      ],
      responses: [
        {
          text: '"What happened in 1995?"',
          leadsTo: 'declan_1995',
        }
      ]
    },

    declan_1995: {
      id: 'declan_1995',
      speaker: 'declan',
      text: [
        'We built the company together. Ashwood Industries was as much mine as his.',
        'When the first fraud investigation came — not the land fraud, a different matter — he needed a name to give.',
        'He gave mine.',
        'The charges were fabricated. His lawyers made it stick.',
        'I lost my license. My business. My wife left. Everything.',
        'And Elias — Tomas — went back to his manor and his legacy.',
      ],
      responses: [
        {
          text: '"Sylvie knows you\'re her father."',
          condition: 'fairweather_research',
          leadsTo: 'declan_sylvie',
          givesClue: 'fairweather_research'
        },
        {
          text: '"Do you know who killed him?"',
          leadsTo: 'declan_knows',
        }
      ]
    },

    declan_sylvie: {
      id: 'declan_sylvie',
      speaker: 'declan',
      text: [
        '...',
        'I knew about her.',
        'Elias used that too. He knew about the affair. He used it to keep me quiet for years.',
        'I never — I didn\'t know how to reach her without making her life worse.',
        'She reached me first. Six months ago.',
        'She wrote to me.',
        'She said: "I know who you are. You don\'t have to explain."',
      ],
      setsFlag: 'declan_sylvie_known',
      responses: [
        {
          text: '"Do you know who killed Elias?"',
          leadsTo: 'declan_knows',
        }
      ]
    },

    declan_knows: {
      id: 'declan_knows',
      speaker: 'declan',
      text: [
        'I don\'t know for certain.',
        'But the man Tomas was — the sins he was carrying.',
        'If he told his children the truth before he died, I\'d look at Nathaniel.',
        'Nathaniel\'s whole identity was built on a name that wasn\'t real.',
        'Finding that out — that\'s not just losing money.',
        'That\'s finding out you don\'t exist.'
      ],
      setsFlag: 'visited_declan',
      responses: [
        {
          text: '"Thank you. For telling me all of this."',
          endsConversation: true
        }
      ]
    }
  },

  // ──────────────────────────────────────────
  //  HESTER — Alibi confrontation
  // ──────────────────────────────────────────
  hester_extended: {

    hester_alibi_confrontation: {
      id: 'hester_alibi_confrontation',
      speaker: 'hester',
      text: [
        'I told you. Mrs. Ashwood was in the library all evening.',
        'I checked on her at ten o\'clock.'
      ],
      responses: [
        {
          text: '"There\'s chamomile tea in that library. Forty pages into a four-hundred-page book."',
          condition: 'teacup_chamomile',
          leadsTo: 'hester_chamomile',
        },
        {
          text: '"The window in that library looks directly into the study."',
          condition: 'library_window_view',
          leadsTo: 'hester_window',
        }
      ]
    },

    hester_chamomile: {
      id: 'hester_chamomile',
      speaker: 'hester',
      text: [
        '...',
        'She was there for part of the evening.',
        'But not — not all of it.',
        'She asked me to say she was. She was frightened.',
        'I didn\'t know about Nathaniel then. I thought — I thought she might have done something herself.'
      ],
      setsFlag: 'hester_alibi_broken',
      responses: [
        {
          text: '"What time did she leave the library?"',
          leadsTo: 'hester_timeline',
        }
      ]
    },

    hester_window: {
      id: 'hester_window',
      speaker: 'hester',
      text: [
        'She was watching the study.',
        'She told me later. She saw the light in the study window.',
        'She saw it go out at half past midnight.',
        'She didn\'t know what that meant.',
        'But she was frightened enough to want an alibi.'
      ],
      setsFlag: 'hester_alibi_broken',
      responses: [
        {
          text: '"Then where was she between ten and midnight?"',
          leadsTo: 'hester_timeline',
        }
      ]
    },

    hester_timeline: {
      id: 'hester_timeline',
      speaker: 'hester',
      text: [
        'In her room. She went to her room at ten-fifteen.',
        'She saw Nathaniel\'s car return from her window at around midnight.',
        'She didn\'t hear anything.',
        'She told me the next morning. I should have — I should have said something.'
      ],
      setsFlag: 'hester_alibi_broken',
      endsConversation: true
    },

    hester_alibi_soft: {
      id: 'hester_alibi_soft',
      speaker: 'hester',
      text: ['Mrs. Ashwood was in the east library. I\'ve told you what I know.'],
      responses: [
        { text: '[I need more evidence to press her.]', endsConversation: true }
      ]
    }
  },

  // ──────────────────────────────────────────
  //  DOROTHEA — Extended confrontation
  // ──────────────────────────────────────────
  dorothea_extended: {

    dorothea_identity_confrontation: {
      id: 'dorothea_identity_confrontation',
      speaker: 'dorothea',
      text: [
        'You\'ve been to the bank.',
        'I can tell. You have that particular look.',
        'The one people get when they find out the whole architecture was wrong.'
      ],
      responses: [
        {
          text: '"You knew. You\'ve known for eleven years."',
          leadsTo: 'dorothea_admits_knowledge',
        }
      ]
    },

    dorothea_admits_knowledge: {
      id: 'dorothea_admits_knowledge',
      speaker: 'dorothea',
      text: [
        'I found a letter. His real Czech passport, hidden in the study.',
        'I confronted him. He was... grateful, in a way.',
        'He said it was a relief.',
        'We had an arrangement. I knew, and I stayed. And he rewrote the will to guarantee my security.',
        'It was a marriage. Just a different kind than people assume.'
      ],
      responses: [
        {
          text: '"He was going to confess. Your arrangement was ending."',
          leadsTo: 'dorothea_bribe_moment',
        },
        {
          text: '"Did you kill him?"',
          leadsTo: 'dorothea_denial',
        }
      ]
    },

    dorothea_denial: {
      id: 'dorothea_denial',
      speaker: 'dorothea',
      text: [
        'No.',
        'Whatever I am — and I\'m not asking for your absolution —',
        'I am not that.',
        'I was in the library. I was watching the study light.',
        'And I watched it go out.',
        'And I understood what that probably meant.',
        'And I did nothing.',
        'That\'s what I have to carry.'
      ],
      responses: [
        {
          text: '"Then help me. Give me the shed key."',
          leadsTo: 'dorothea_gives_key',
          condition: 'NOT shed_accessed'
        },
        {
          text: '"I believe you."',
          endsConversation: true,
          setsFlag: 'dorothea_cleared'
        }
      ]
    },

    dorothea_gives_key: {
      id: 'dorothea_gives_key',
      speaker: 'dorothea',
      text: [
        'The groundskeeper\'s shed.',
        'Elias hid something there. I found it years ago but never opened it.',
        'I didn\'t want to know any more than I already did.',
        'The key is under the third porch step. On the left side.',
        'Take it. Do what I couldn\'t.'
      ],
      setsFlag: 'dorothea_gave_key',
      endsConversation: true
    },

    dorothea_bribe_moment: {
      id: 'dorothea_bribe_moment',
      speaker: 'dorothea',
      text: [
        'He was going to confess everything. All of it.',
        'His name, the land, the deeds.',
        'The will would have been invalidated. My arrangement would have been void.',
        'Twenty-two years I\'ve been in this house.',
        '...',
        'I have an offer for you, Miss Cole.'
      ],
      setsFlag: 'bribe_offered',
      responses: [
        {
          text: '[Listen to the offer.]',
          leadsTo: 'dorothea_bribe_offer',
        },
        {
          text: '"Don\'t."',
          leadsTo: 'dorothea_bribe_refused',
        }
      ]
    },

    dorothea_bribe_offer: {
      id: 'dorothea_bribe_offer',
      speaker: 'dorothea',
      text: [
        'The estate is valued at approximately four million.',
        'I\'m prepared to offer you two hundred thousand. In cash.',
        'You file a report confirming natural death.',
        'You walk away.',
        'Everyone walks away.'
      ],
      responses: [
        {
          text: '[Accept.]',
          leadsTo: 'dorothea_bribe_accepted',
          setsFlag: 'bribe_accepted',
        },
        {
          text: '[Refuse.]',
          leadsTo: 'dorothea_bribe_refused',
        }
      ]
    },

    dorothea_bribe_accepted: {
      id: 'dorothea_bribe_accepted',
      speaker: 'dorothea',
      text: [
        'I thought you might be reasonable.',
        'I\'ll have it arranged by morning.',
        'I\'d suggest you leave before then.'
      ],
      setsFlag: 'bribe_accepted',
      endsConversation: true
    },

    dorothea_bribe_refused: {
      id: 'dorothea_bribe_refused',
      speaker: 'dorothea',
      text: [
        '...',
        'Then we are where we are.',
        'Do what you have to do, Miss Cole.',
        'So will I.'
      ],
      endsConversation: true
    },

    dorothea_pressure: {
      id: 'dorothea_pressure',
      speaker: 'dorothea',
      text: [
        'I\'ve told you everything I know about that night.',
        'Which is: very little.',
      ],
      responses: [
        { text: '[I need more evidence before pressing her.]', endsConversation: true }
      ]
    }
  },

  // ──────────────────────────────────────────
  //  NATHANIEL — Confrontation nodes
  // ──────────────────────────────────────────
  nathaniel_extended: {

    nathaniel_confrontation_weak: {
      id: 'nathaniel_confrontation_weak',
      speaker: 'nathaniel',
      text: [
        'You don\'t have enough.',
        'I can tell, Miss Cole. It\'s in how you\'re holding the conversation.',
        'You have circumstance. Suggestion.',
        'But you don\'t have what a prosecutor needs.',
        'I was at dinner. My reservation is documented. My witnesses are credible.',
        'I think we\'re done here.'
      ],
      endsConversation: true
    },

    nathaniel_confrontation_strong: {
      id: 'nathaniel_confrontation_strong',
      speaker: 'nathaniel',
      text: [
        'Whatever you think you know—',
      ],
      responses: [
        {
          text: '"October 9th. Greystone Compounding. You had Dr. Crane write the script."',
          condition: 'pharmacy_receipt',
          leadsTo: 'nathaniel_receipt_revealed',
        },
        {
          text: '"Sylvie\'s camera. Your car left at 9:43. Back at 11:58."',
          condition: 'sylvie_camera_photos',
          leadsTo: 'nathaniel_camera_revealed',
        },
        {
          text: '"The toxicology report shows digitalis in his blood."',
          condition: 'toxicology_results',
          leadsTo: 'nathaniel_toxicology_revealed',
        }
      ]
    },

    nathaniel_receipt_revealed: {
      id: 'nathaniel_receipt_revealed',
      speaker: 'nathaniel',
      text: [
        '...',
        'Crane talked.'
      ],
      responses: [
        {
          text: '"His car. The camera. The toxicology. I have all of it."',
          condition: 'sylvie_camera_photos AND toxicology_results',
          leadsTo: 'nathaniel_breaks',
        },
        {
          text: '"The camera photos confirm your car\'s timeline."',
          condition: 'sylvie_camera_photos',
          leadsTo: 'nathaniel_camera_revealed',
        }
      ]
    },

    nathaniel_camera_revealed: {
      id: 'nathaniel_camera_revealed',
      speaker: 'nathaniel',
      text: [
        'Sylvie\'s little project.',
        '...I didn\'t know about the camera.'
      ],
      responses: [
        {
          text: '"The receipt. The toxicology. The camera. It\'s over, Nathaniel."',
          leadsTo: 'nathaniel_breaks',
        }
      ]
    },

    nathaniel_toxicology_revealed: {
      id: 'nathaniel_toxicology_revealed',
      speaker: 'nathaniel',
      text: [
        'Crane had no right—',
        'That was supposed to—',
        '...'
      ],
      responses: [
        {
          text: '"I have the pharmacy receipt. The camera photos. The report. All of it."',
          leadsTo: 'nathaniel_breaks',
        }
      ]
    },

    nathaniel_breaks: {
      id: 'nathaniel_breaks',
      speaker: 'nathaniel',
      text: [
        '...',
        'He told me.',
        'Three weeks before he died.',
        'He sat me down and told me who he really was.',
        'All of it.',
        'Tomas Vey. The dead man\'s name. The stolen land.',
        'He said he wanted to confess publicly before he died.',
        'He said he wanted to meet the Calwells.',
        '...',
        '"I\'m going to tell the world who you are, Nathaniel. I\'m sorry it\'s cost you this much."',
        'He said that to me.',
        'To my face.',
        '"I\'m sorry it\'s cost you this much."',
      ],
      responses: [
        {
          text: '[Let him finish.]',
          leadsTo: 'nathaniel_confession_full',
        }
      ]
    },

    nathaniel_confession_full: {
      id: 'nathaniel_confession_full',
      speaker: 'nathaniel',
      text: [
        'My name doesn\'t exist.',
        'My MBA is in a name that isn\'t mine.',
        'Every contract I\'ve ever signed.',
        'Every handshake.',
        'All of it — built on something that never happened.',
        '...',
        'I put it in his drink that evening.',
        'The compound.',
        'He was asleep in his chair.',
        'I washed the decanter.',
        'Then I drove to the city dinner.',
        'I smiled at the people at the table.',
        'I ate the entrée.',
        'I drove home.',
        '...',
        'I knew what I\'d find.',
      ],
      setsFlag: 'nathaniel_confessed',
      endsConversation: true
    }
  }
});

// Merge the extended dialogue into the main character keys
if (DIALOGUE.hester) {
  Object.assign(DIALOGUE.hester, DIALOGUE.hester_extended);
}
if (DIALOGUE.dorothea) {
  Object.assign(DIALOGUE.dorothea, DIALOGUE.dorothea_extended);
}
if (DIALOGUE.nathaniel) {
  Object.assign(DIALOGUE.nathaniel, DIALOGUE.nathaniel_extended);
}
delete DIALOGUE.hester_extended;
delete DIALOGUE.dorothea_extended;
delete DIALOGUE.nathaniel_extended;
