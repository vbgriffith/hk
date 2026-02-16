/* js/data/animationDefs_p3.js — Phase III–V animation definitions */
'use strict';

// ── City of Tears enemies ──────────────────────────────────────────────────
ANIM_DEFS.great_hopper = {
  texture:'great_hopper', anims:{
    idle:  {row:0,frames:4,fps:6,repeat:-1},
    hop:   {row:1,frames:5,fps:12,repeat:0},
    land:  {row:2,frames:3,fps:14,repeat:0},
    death: {row:3,frames:6,fps:10,repeat:0},
  }
};
ANIM_DEFS.winged_fool = {
  texture:'winged_fool', anims:{
    fly:   {row:0,frames:5,fps:12,repeat:-1},
    dive:  {row:1,frames:4,fps:16,repeat:0},
    death: {row:2,frames:6,fps:12,repeat:0},
  }
};
ANIM_DEFS.soul_twister = {
  texture:'soul_twister', anims:{
    idle:  {row:0,frames:4,fps:6, repeat:-1},
    cast:  {row:1,frames:6,fps:12,repeat:0},
    death: {row:2,frames:7,fps:10,repeat:0},
  }
};

// ── Fungal enemies ─────────────────────────────────────────────────────────
ANIM_DEFS.fungoon = {
  texture:'fungoon', anims:{
    idle:  {row:0,frames:4,fps:5,repeat:-1},
    walk:  {row:1,frames:6,fps:9,repeat:-1},
    burst: {row:2,frames:6,fps:14,repeat:0},
    death: {row:3,frames:6,fps:10,repeat:0},
  }
};
ANIM_DEFS.shrumal_ogre = {
  texture:'shrumal_ogre', anims:{
    idle:  {row:0,frames:4,fps:4,repeat:-1},
    walk:  {row:1,frames:7,fps:8,repeat:-1},
    slam:  {row:2,frames:7,fps:12,repeat:0},
    death: {row:3,frames:8,fps:10,repeat:0},
  }
};

// ── Mantis ─────────────────────────────────────────────────────────────────
ANIM_DEFS.mantis_warrior = {
  texture:'mantis_warrior', anims:{
    idle:  {row:0,frames:5,fps:8, repeat:-1},
    walk:  {row:1,frames:6,fps:12,repeat:-1},
    dash:  {row:2,frames:4,fps:16,repeat:0},
    slash: {row:3,frames:5,fps:14,repeat:0},
    jump:  {row:4,frames:4,fps:12,repeat:0},
    death: {row:5,frames:7,fps:10,repeat:0},
  }
};
ANIM_DEFS.mantis_lords = {
  texture:'mantis_lords', anims:{
    idle:    {row:0,frames:5,fps:6, repeat:-1},
    dash:    {row:1,frames:5,fps:14,repeat:0},
    slash:   {row:2,frames:6,fps:16,repeat:0},
    throw:   {row:3,frames:5,fps:12,repeat:0},
    jump:    {row:4,frames:4,fps:12,repeat:0},
    stagger: {row:5,frames:5,fps:10,repeat:0},
    death:   {row:6,frames:8,fps:10,repeat:0},
    bow:     {row:7,frames:5,fps:8, repeat:0},
  }
};

// ── Basin / Abyss ──────────────────────────────────────────────────────────
ANIM_DEFS.pale_lurker = {
  texture:'pale_lurker', anims:{
    idle:  {row:0,frames:4,fps:5, repeat:-1},
    walk:  {row:1,frames:6,fps:10,repeat:-1},
    lunge: {row:2,frames:5,fps:14,repeat:0},
    death: {row:3,frames:6,fps:10,repeat:0},
  }
};

// ── Dreamer guardians ──────────────────────────────────────────────────────
ANIM_DEFS.uumuu = {
  texture:'uumuu', anims:{
    idle:    {row:0,frames:5,fps:6, repeat:-1},
    charge:  {row:1,frames:4,fps:10,repeat:0},
    shock:   {row:2,frames:6,fps:14,repeat:0},
    death:   {row:3,frames:9,fps:10,repeat:0},
  }
};
ANIM_DEFS.dung_defender = {
  texture:'dung_defender', anims:{
    idle:    {row:0,frames:5,fps:5, repeat:-1},
    roll:    {row:1,frames:6,fps:12,repeat:-1},
    emerge:  {row:2,frames:5,fps:10,repeat:0},
    throw:   {row:3,frames:5,fps:12,repeat:0},
    stagger: {row:4,frames:4,fps:10,repeat:0},
    death:   {row:5,frames:9,fps:10,repeat:0},
  }
};
ANIM_DEFS.lurien_watcher = {
  texture:'lurien_watcher', anims:{
    idle:    {row:0,frames:4,fps:5, repeat:-1},
    shoot:   {row:1,frames:6,fps:12,repeat:0},
    circle:  {row:2,frames:8,fps:10,repeat:0},
    death:   {row:3,frames:9,fps:10,repeat:0},
  }
};

// ── Soul Master ────────────────────────────────────────────────────────────
ANIM_DEFS.soul_master = {
  texture:'soul_master', anims:{
    float:   {row:0,frames:5,fps:6, repeat:-1},
    cast:    {row:1,frames:7,fps:14,repeat:0},
    teleport:{row:2,frames:4,fps:16,repeat:0},
    slam:    {row:3,frames:6,fps:14,repeat:0},
    stagger: {row:4,frames:5,fps:10,repeat:0},
    rage:    {row:5,frames:5,fps:8, repeat:-1},
    death:   {row:6,frames:9,fps:10,repeat:0},
  }
};

// ── Hollow Knight final boss ───────────────────────────────────────────────
ANIM_DEFS.hollow_knight_boss = {
  texture:'hollow_knight_boss', anims:{
    idle:     {row:0,frames:6,fps:6, repeat:-1},
    walk:     {row:1,frames:8,fps:10,repeat:-1},
    slash:    {row:2,frames:7,fps:16,repeat:0},
    jump:     {row:3,frames:5,fps:12,repeat:0},
    stab:     {row:4,frames:6,fps:14,repeat:0},
    scream:   {row:5,frames:8,fps:10,repeat:0},
    stagger:  {row:6,frames:6,fps:10,repeat:0},
    p2_lunge: {row:7,frames:6,fps:16,repeat:0},
    death:    {row:8,frames:12,fps:9,repeat:0},
  }
};

// ── Radiance (Phase V final) ───────────────────────────────────────────────
ANIM_DEFS.radiance = {
  texture:'radiance', anims:{
    appear:  {row:0,frames:10,fps:10,repeat:0},
    idle:    {row:1,frames:6, fps:6, repeat:-1},
    beam:    {row:2,frames:8, fps:12,repeat:0},
    orbs:    {row:3,frames:6, fps:10,repeat:0},
    platform:{row:4,frames:5, fps:10,repeat:0},
    spike:   {row:5,frames:6, fps:14,repeat:0},
    death:   {row:6,frames:14,fps:8, repeat:0},
  }
};

// ── NPC variants ───────────────────────────────────────────────────────────
ANIM_DEFS.sly = {
  texture:'sly', anims:{
    idle:  {row:0,frames:4,fps:5,repeat:-1},
    talk:  {row:1,frames:4,fps:8,repeat:-1},
  }
};
ANIM_DEFS.iselda_npc = {
  texture:'iselda_npc', anims:{
    idle:  {row:0,frames:4,fps:4,repeat:-1},
    talk:  {row:1,frames:4,fps:8,repeat:-1},
  }
};
ANIM_DEFS.monomon = {
  texture:'monomon', anims:{
    idle:  {row:0,frames:4,fps:5,repeat:-1},
    talk:  {row:1,frames:4,fps:8,repeat:-1},
  }
};
ANIM_DEFS.lurien_npc = {
  texture:'lurien_npc', anims:{
    idle:  {row:0,frames:4,fps:5,repeat:-1},
    talk:  {row:1,frames:4,fps:8,repeat:-1},
  }
};
ANIM_DEFS.herrah = {
  texture:'herrah', anims:{
    idle:  {row:0,frames:4,fps:5,repeat:-1},
    talk:  {row:1,frames:4,fps:8,repeat:-1},
  }
};

// ── Dream essence orb ─────────────────────────────────────────────────────
ANIM_DEFS.essence_orb = {
  texture:'essence_orb', anims:{
    float: {row:0,frames:6,fps:8,repeat:-1},
    burst: {row:1,frames:5,fps:16,repeat:0},
  }
};

// ── Void tendril ───────────────────────────────────────────────────────────
ANIM_DEFS.void_tendril = {
  texture:'void_tendril', anims:{
    rise:    {row:0,frames:5,fps:12,repeat:0},
    active:  {row:1,frames:4,fps:8, repeat:-1},
    retract: {row:2,frames:5,fps:12,repeat:0},
  }
};

// ── Dreamer seal / Black Egg ───────────────────────────────────────────────
ANIM_DEFS.dreamer_seal = {
  texture:'dreamer_seal', anims:{
    idle:  {row:0,frames:5,fps:6,repeat:-1},
    break: {row:1,frames:8,fps:12,repeat:0},
  }
};
