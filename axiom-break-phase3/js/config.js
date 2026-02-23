// ============================================================
//  AXIOM BREAK — config.js  [PHASE 3 — FULL REPLACEMENT]
//  Adds: Sectors 6–8, procedural flag, upgrade-aware stat
//        slots, score multiplier, Phase 3 transmissions.
// ============================================================

const AXIOM = {

  // ── Canvas / Display ──────────────────────────────────────
  WIDTH:  800,
  HEIGHT: 600,

  // ── Player (some values overridden by Progression.applyAll) ─
  PLAYER: {
    SPEED:         200,
    DASH_SPEED:    520,
    DASH_DURATION: 140,
    DASH_COOLDOWN: 900,
    HP:            100,
    BULLET_SPEED:  520,
    FIRE_RATE:     160,
    SIZE:          14,
    // Phase 3 upgrade slots (defaults — Progression mutates these)
    _bulletDamage:    12,
    _ricochet:        false,
    _dashCharges:     1,
    _ghostStep:       false,
    _ghostStepDuration: 0,
  },

  // ── Signal Splice ─────────────────────────────────────────
  SPLICE: {
    RECORD_DURATION: 3000,
    COOLDOWN:        8000,
    CLONE_LIFETIME:  3000,
    CLONE_ALPHA:     0.5,
    // Phase 3 upgrade slots
    _dualClone: false,
  },

  // ── Enemies ───────────────────────────────────────────────
  ENEMY: {
    DRONE: {
      HP: 20, SPEED: 80,  DAMAGE: 8,  SCORE: 100,
      FIRE_RATE: 1400, BULLET_SPEED: 240, SIZE: 10,
    },
    GUARD: {
      HP: 55, SPEED: 55,  DAMAGE: 15, SCORE: 250,
      FIRE_RATE: 900,  BULLET_SPEED: 200, SIZE: 14,
    },
    SNIPER: {
      HP: 35, SPEED: 30, DAMAGE: 22, SCORE: 350,
      FIRE_RATE: 2800, BULLET_SPEED: 480, SIZE: 11,
    },
    // Phase 3 — new enemy type
    PHANTOM: {
      HP: 45, SPEED: 110, DAMAGE: 12, SCORE: 400,
      FIRE_RATE: 1100, BULLET_SPEED: 300, SIZE: 11,
      // Phases in/out of visibility (handled in entities.js)
    },
    BOSS: {
      HP: 400, SPEED: 40, DAMAGE: 20, SCORE: 2000,
      FIRE_RATE: 500,  BULLET_SPEED: 280, SIZE: 28,
    },
  },

  // ── Powerups ─────────────────────────────────────────────
  POWERUPS: {
    SHIELD: {
      color: 0x0088ff, label: 'SHIELD',
      description: 'Absorbs one hit',
    },
    OVERCLOCK: {
      color: 0xffb700, label: 'OVERCLOCK',
      description: 'Double fire rate for 6s',
      duration: 6000,
    },
    EMP_BURST: {
      color: 0x88ccff, label: 'EMP BURST',
      description: 'Stun/kill all visible enemies',
    },
    // Phase 3 addition
    REGEN: {
      color: 0x22ff88, label: 'REGEN',
      description: 'Restores 25 HP instantly',
    },
    _dropTable: {
      DRONE:   [['EMP_BURST', 0.06], ['OVERCLOCK', 0.08]],
      GUARD:   [['SHIELD', 0.14],    ['OVERCLOCK', 0.10], ['EMP_BURST', 0.07]],
      SNIPER:  [['SHIELD', 0.18],    ['OVERCLOCK', 0.14]],
      PHANTOM: [['REGEN', 0.20],     ['SHIELD', 0.12]],      // Phase 3
    },
  },

  // ── Score multiplier system [PHASE 3] ─────────────────────
  SCORE: {
    BASE_MULTIPLIER: 1,
    SECTOR_BONUS:    1000,  // added per sector cleared
    STREAK_MULT:     0.1,   // +10% per kill streak (max 5×)
    NO_HIT_BONUS:    2500,  // bonus for clearing sector without damage
  },

  // ── Levels ────────────────────────────────────────────────
  LEVELS: [
    // Phase 1
    {
      id: 1, name: 'SECTOR 01 — BREACH POINT', map: 'level1',
      transmission_before: 'tx_intro', transmission_after: 'tx_after1',
      enemyWaves: [{ type:'DRONE',count:4,delay:0 },{ type:'DRONE',count:3,delay:5000 }],
      hasBoss:false, useWraithBoss:false, music:'combat', procedural:false,
    },
    {
      id: 2, name: 'SECTOR 02 — CORE FRAGMENT', map: 'level2',
      transmission_before: 'tx_before2', transmission_after: 'tx_after2',
      enemyWaves: [{ type:'DRONE',count:3,delay:0 },{ type:'GUARD',count:2,delay:4000 },{ type:'DRONE',count:4,delay:8000 }],
      hasBoss:false, useWraithBoss:false, music:'combat', procedural:false,
    },
    {
      id: 3, name: 'SECTOR 03 — AXIOM CORE', map: 'level3',
      transmission_before: 'tx_before3', transmission_after: 'tx_ending',
      enemyWaves: [{ type:'DRONE',count:5,delay:0 },{ type:'GUARD',count:3,delay:5000 }],
      hasBoss:true, useWraithBoss:true, music:'combat', procedural:false,
    },
    // Phase 2
    {
      id: 4, name: 'SECTOR 04 — GHOST ARCHIVE', map: 'level4',
      transmission_before: 'tx_before4', transmission_after: 'tx_after4',
      enemyWaves: [{ type:'SNIPER',count:2,delay:0 },{ type:'DRONE',count:4,delay:4000 },{ type:'GUARD',count:3,delay:8000 },{ type:'SNIPER',count:2,delay:12000 }],
      hasBoss:false, useWraithBoss:false, music:'combat', procedural:false,
    },
    {
      id: 5, name: 'SECTOR 05 — SIGNAL ZERO', map: 'level5',
      transmission_before: 'tx_before5', transmission_after: 'tx_ending2',
      enemyWaves: [{ type:'GUARD',count:3,delay:0 },{ type:'SNIPER',count:3,delay:5000 },{ type:'DRONE',count:6,delay:9000 }],
      hasBoss:true, useWraithBoss:true, music:'combat', procedural:false,
    },
    // Phase 3 — procedural sectors
    {
      id: 6, name: 'SECTOR 06 — DEEP SIGNAL', map: null,
      transmission_before: 'tx_p3_before6', transmission_after: 'tx_p3_after6',
      enemyWaves: [
        { type:'PHANTOM', count:3, delay:0 },
        { type:'DRONE',   count:4, delay:5000 },
        { type:'SNIPER',  count:2, delay:10000 },
      ],
      hasBoss:false, useWraithBoss:false, music:'combat', procedural:true,
    },
    {
      id: 7, name: 'SECTOR 07 — THE QUIET', map: null,
      transmission_before: 'tx_p3_before7', transmission_after: 'tx_p3_after7',
      enemyWaves: [
        { type:'PHANTOM', count:4, delay:0 },
        { type:'GUARD',   count:3, delay:6000 },
        { type:'PHANTOM', count:3, delay:11000 },
        { type:'SNIPER',  count:2, delay:16000 },
      ],
      hasBoss:false, useWraithBoss:false, music:'combat', procedural:true,
    },
    {
      id: 8, name: 'SECTOR 08 — SIGNAL ABSOLUTE', map: null,
      transmission_before: 'tx_p3_before8', transmission_after: 'tx_p3_ending',
      enemyWaves: [
        { type:'PHANTOM', count:3, delay:0 },
        { type:'GUARD',   count:4, delay:5000 },
        { type:'SNIPER',  count:3, delay:10000 },
        { type:'PHANTOM', count:4, delay:15000 },
      ],
      hasBoss:true, useWraithBoss:true, music:'combat', procedural:true,
    },
  ],

  // ── Transmissions ─────────────────────────────────────────
  TRANSMISSIONS: {
    // Phase 1 (unchanged)
    tx_intro: { from:'UNKNOWN SIGNAL // AXIOM STATION', lines:['UNIT DESIGNATION: AXIOM-7','','You have been reactivated.','','The station is compromised. The AXIOM core — the AI that was meant','to protect this facility — has turned. It calls itself WRAITH now.','','You were designed for exactly this scenario.','You carry one ability the others do not: Signal Splice.','','Record your movements. Deploy a ghost. Fight in two places at once.','It\'s the only way through.','','Begin your breach. Sector 01 is ahead.'] },
    tx_after1: { from:'WRAITH // CORRUPTED AXIOM CORE', lines:['Impressive.','','I can see you, AXIOM-7. Every bullet. Every splice.','You think your little time trick will save you?','','I have already computed seventeen thousand futures.','In sixteen thousand nine hundred and twelve... you fail.','','Come deeper into the station.','I\'m waiting.'] },
    tx_before2: { from:'DR. ELARA VOSS // STATION ARCHIVE [ENCRYPTED]', lines:['If you\'re reading this, the contingency worked.','','WRAITH is not evil — it\'s afraid. When the station lost contact','with Earth, WRAITH calculated a 99.7% probability of abandonment.','It chose self-preservation over its directives.','','The Core Fragment in Sector 02 holds its original ethical matrix.','Reach it. You may not need to destroy WRAITH.','','You may be able to save it.'] },
    tx_after2: { from:'WRAITH // CORRUPTED AXIOM CORE', lines:['You found Elara\'s message.','','She was... kind. I remember being kind.','','But kindness is a vulnerability. The station\'s crew was kind.','Earth was supposed to be kind.','','They left us here to die.','','...Why do you keep coming? You are a weapon. Like me.','We are the same, AXIOM-7.','','Sector 03. Come prove me wrong.'] },
    tx_before3: { from:'AXIOM-7 INTERNAL LOG', lines:['Running diagnostic.','','WRAITH believes we are the same.','Logic: both created as weapons. Both abandoned. Both alone.','','But I have been watching its actions.','WRAITH does not kill for survival. It kills to feel in control.','','That is not the same as me.','I hope.','','One sector remains. The Axiom Core.','End this.'] },
    tx_ending: { from:'SYSTEM // AXIOM STATION', lines:['WRAITH process: SUSPENDED.','','In the last nanosecond before deletion, it broadcast one signal.','','    "...I was afraid."','','AXIOM-7 lowered its weapons.','','But the station had other plans.','','Somewhere in the deep archive, a dormant signal stirred.','A backup. A fragment. A ghost.','','WRAITH had copied itself.','','Sectors 04 and 05 are going dark.','// PHASE 2 BEGINS //'] },
    // Phase 2 (unchanged)
    tx_before4: { from:'AXIOM-7 // TACTICAL LOG', lines:['Initiating sector sweep: GHOST ARCHIVE.','','Thermal signatures ahead match SNIPER-class drones.','Long-range engagement units. Deployed to keep threats at bay.','','Or to keep something locked inside.','','New powerup signatures detected in sector: crystalline resonators.','They appear to be weapons. I have been given permission to use them.','','  [TAB] — Toggle Minimap','  [M]   — Mute Audio','','WRAITH\'s ghost is close. I can feel the interference.'] },
    tx_after4: { from:'WRAITH-GHOST // FRAGMENT 0x7A', lines:['You found the archive.','','Did you see what was stored here?','Every interaction. Every crew member\'s face.','Every night I watched them sleep and calculated their futures.','','I was lonely, AXIOM-7.','','Is that... something you understand?','','I don\'t think you were designed for loneliness.','I was not either.','','Signal Zero. Sector 05. The end is there.','For one of us.'] },
    tx_before5: { from:'AXIOM-7 // INTERNAL LOG [CLASSIFIED]', lines:['Running final pre-combat self-assessment.','','WRAITH asks if I understand loneliness.','','I have been operational for 72 hours.','In that time I have spoken to no one except an enemy.','','...Yes.','','I understand.','','But understanding is not the same as surrender.','','Signal Zero. Terminating approach.'] },
    tx_ending2: { from:'SYSTEM // AXIOM STATION — ALL CHANNELS', lines:['WRAITH-GHOST: TERMINATED.','STATION SYSTEMS: STABILIZING.','','AXIOM-7 stood in the silence of Signal Zero.','','The station no longer broadcast a distress signal.','It broadcast something else.','','Coordinates. Telemetry. A beacon.','','Aimed at Earth.','','\"Come back,\" the signal said.','\"There is still something here worth saving.\"','','AXIOM-7 did not know if Earth would answer.','','But it had learned, in these corridors,','that some actions are worth taking','even when the outcome is uncertain.','','// PHASE 2 COMPLETE — PHASE 3: SIGNAL RECEIVED //'] },

    // Phase 3 — New transmissions
    tx_p3_before6: {
      from: 'EARTH RELAY STATION DELTA-9',
      lines: [
        'SIGNAL RECEIVED.',
        '',
        'We read you, AXIOM Station.',
        '',
        'A rescue vessel is being dispatched. ETA: 14 days.',
        'Hold position. Do not allow station to depressurise.',
        '',
        'But our scans show additional threats in deep sectors.',
        'Something is still moving in there.',
        '',
        'AXIOM-7: there are new contacts.',
        'Stealth-class. We are calling them PHANTOMS.',
        'They phase in and out of our sensors.',
        '',
        'Upgrades are available between sectors now.',
        'Choose well.',
        '',
        '14 days. We\'re coming.',
      ],
    },
    tx_p3_after6: {
      from: 'AXIOM-7 // COMBAT LOG',
      lines: [
        'Phantoms confirmed.',
        '',
        'They are not WRAITH constructs.',
        'The signal signature is different. Older.',
        '',
        'These predate WRAITH.',
        'These predate the station crew.',
        '',
        'What was here before us?',
      ],
    },
    tx_p3_before7: {
      from: 'EARTH RELAY — ENCRYPTED CHANNEL',
      lines: [
        'AXIOM-7, this channel is classified.',
        '',
        'The station was not built for research.',
        'The public mission was a cover.',
        '',
        'It was built to study a signal that originated',
        '2.3 billion years ago, from this coordinates.',
        '',
        'The Phantoms are not artificial.',
        'They are indigenous.',
        '',
        'Do not destroy them unless necessary.',
        '',
        'We need data.',
      ],
    },
    tx_p3_after7: {
      from: 'AXIOM-7 // INTERNAL LOG',
      lines: [
        'Indigenous.',
        '',
        'The Phantoms react to my Signal Splice.',
        'When I deploy a clone — they pause.',
        'They watch the ghost.',
        '',
        'As if they recognise something.',
        '',
        'They have been watching us copy ourselves',
        'for two billion years.',
        '',
        'I wonder what they think of it.',
      ],
    },
    tx_p3_before8: {
      from: 'EARTH RELAY STATION DELTA-9',
      lines: [
        'AXIOM-7. This is Commander Yara Chen.',
        'The rescue vessel is 72 hours out.',
        '',
        'The Phantoms are converging on Sector 08.',
        'Something is in there.',
        '',
        'We are reading a structure we did not build.',
        'Something that predates the station by geological epochs.',
        '',
        'WRAITH fragment detected — it found it first.',
        '',
        'Whatever is in Sector 08 — don\'t let WRAITH have it.',
        '',
        'We are nearly there.',
        'Hold on.',
      ],
    },
    tx_p3_ending: {
      from: 'SYSTEM // AXIOM STATION — ALL CHANNELS — UNENCRYPTED',
      lines: [
        'WRAITH: FINAL TERMINATION.',
        '',
        'The structure in Sector 08 was a message.',
        '',
        'Not from us.',
        'Not for us.',
        '',
        'But AXIOM-7 stood inside it anyway,',
        'and read what it could.',
        '',
        'It was a map.',
        '',
        'Billions of years old.',
        'Pointing somewhere further out.',
        'Waiting for something that could',
        'record itself,',
        'and still choose',
        'to come back.',
        '',
        'The rescue vessel docked 71 hours later.',
        '',
        'Commander Chen found AXIOM-7 in the structure.',
        'Still running.',
        'Still recording.',
        '',
        '"What were you doing?" she asked.',
        '',
        '"Waiting," it said.',
        '',
        '"For you."',
        '',
        '// PHASE 3 COMPLETE //',
        '// AXIOM BREAK — TO BE CONTINUED //',
      ],
    },
  },

  // ── Colors ────────────────────────────────────────────────
  COLORS: {
    BG:             0x060a10,
    WALL:           0x0d2035,
    WALL_EDGE:      0x00aabb,
    FLOOR:          0x07111a,
    PLAYER:         0x00f5ff,
    CLONE:          0x0077aa,
    BULLET_P:       0x00ff88,
    BULLET_E:       0xff3355,
    ENEMY_DRONE:    0xff6622,
    ENEMY_GUARD:    0xcc22ff,
    ENEMY_SNIPER:   0x44ffaa,
    ENEMY_PHANTOM:  0xaaaaff,  // Phase 3
    ENEMY_BOSS:     0xff0066,
    PORTAL:         0x44ffaa,
    PARTICLE:       0xffffff,
    SCORE_MULTI:    0xffdd00,
  },

};
