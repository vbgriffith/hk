/* js/data/animationDefs.js — All sprite animation configurations */
'use strict';

const ANIM_DEFS = {

  // ── The Knight ────────────────────────────────────────────────────────────
  knight: {
    texture: 'knight',
    anims: {
      idle:          { row: 0, frames: 8,  fps: 8,  repeat: -1 },
      walk:          { row: 1, frames: 8,  fps: 12, repeat: -1 },
      run:           { row: 2, frames: 6,  fps: 14, repeat: -1 },
      jump_rise:     { row: 3, frames: 4,  fps: 10, repeat: 0  },
      jump_fall:     { row: 4, frames: 4,  fps: 8,  repeat: -1 },
      jump_land:     { row: 5, frames: 3,  fps: 18, repeat: 0  },
      attack_1:      { row: 6, frames: 6,  fps: 22, repeat: 0  },
      attack_2:      { row: 7, frames: 6,  fps: 22, repeat: 0  },
      attack_3:      { row: 8, frames: 7,  fps: 22, repeat: 0  },
      attack_up:     { row: 9, frames: 6,  fps: 22, repeat: 0  },
      attack_down:   { row:10, frames: 6,  fps: 22, repeat: 0  },
      attack_air:    { row:11, frames: 5,  fps: 22, repeat: 0  },
      dash:          { row:12, frames: 4,  fps: 20, repeat: 0  },
      wall_cling:    { row:13, frames: 2,  fps: 4,  repeat: -1 },
      wall_slide:    { row:14, frames: 3,  fps: 8,  repeat: -1 },
      take_hit:      { row:15, frames: 4,  fps: 18, repeat: 0  },
      death:         { row:16, frames: 8,  fps: 10, repeat: 0  },
      focus:         { row:17, frames: 6,  fps: 8,  repeat: 0  },
      focus_loop:    { row:18, frames: 4,  fps: 8,  repeat: -1 },
      cast_fireball: { row:19, frames: 5,  fps: 18, repeat: 0  },
      cast_dive:     { row:20, frames: 5,  fps: 20, repeat: 0  },
      great_slash:   { row:21, frames: 8,  fps: 24, repeat: 0  },
      cyclone_slash: { row:22, frames: 8,  fps: 24, repeat: -1 },
      nail_charge:   { row:23, frames: 3,  fps: 6,  repeat: -1 },
      sit:           { row:24, frames: 4,  fps: 5,  repeat: -1 },
      bench_rest:    { row:25, frames: 6,  fps: 6,  repeat: -1 },
      swim:          { row:26, frames: 6,  fps: 10, repeat: -1 },
      look_up:       { row:27, frames: 2,  fps: 6,  repeat: -1 },
      look_down:     { row:28, frames: 2,  fps: 6,  repeat: -1 },
    }
  },

  // ── Shade (shade/shadow of the knight) ───────────────────────────────────
  shade: {
    texture: 'shade',
    anims: {
      idle:    { row: 0, frames: 6, fps: 8, repeat: -1 },
      attack:  { row: 1, frames: 5, fps: 18, repeat: 0 },
      death:   { row: 2, frames: 7, fps: 10, repeat: 0 },
    }
  },

  // ── Crawler ───────────────────────────────────────────────────────────────
  crawler: {
    texture: 'crawler',
    anims: {
      walk:     { row: 0, frames: 8, fps: 10, repeat: -1 },
      turn:     { row: 1, frames: 4, fps: 10, repeat: 0  },
      attack:   { row: 2, frames: 5, fps: 14, repeat: 0  },
      stun:     { row: 3, frames: 3, fps: 6,  repeat: -1 },
      death:    { row: 4, frames: 7, fps: 12, repeat: 0  },
      emerge:   { row: 5, frames: 6, fps: 10, repeat: 0  },
    }
  },

  // ── Spitter ───────────────────────────────────────────────────────────────
  spitter: {
    texture: 'spitter',
    anims: {
      idle:     { row: 0, frames: 4, fps: 6,  repeat: -1 },
      walk:     { row: 1, frames: 8, fps: 10, repeat: -1 },
      spit_up:  { row: 2, frames: 6, fps: 14, repeat: 0  },
      spit_fwd: { row: 3, frames: 6, fps: 14, repeat: 0  },
      hit:      { row: 4, frames: 3, fps: 12, repeat: 0  },
      death:    { row: 5, frames: 8, fps: 12, repeat: 0  },
    }
  },

  // ── Flying Scout ──────────────────────────────────────────────────────────
  flying_scout: {
    texture: 'flying_scout',
    anims: {
      fly:      { row: 0, frames: 6, fps: 12, repeat: -1 },
      dive:     { row: 1, frames: 5, fps: 16, repeat: 0  },
      recover:  { row: 2, frames: 4, fps: 10, repeat: 0  },
      hit:      { row: 3, frames: 3, fps: 14, repeat: 0  },
      death:    { row: 4, frames: 7, fps: 12, repeat: 0  },
    }
  },

  // ── NPCs ──────────────────────────────────────────────────────────────────
  quirrel: {
    texture: 'quirrel',
    anims: {
      idle:  { row: 0, frames: 6, fps: 8, repeat: -1 },
      talk:  { row: 1, frames: 4, fps: 10, repeat: -1 },
      walk:  { row: 2, frames: 6, fps: 10, repeat: -1 },
      sit:   { row: 3, frames: 4, fps: 6,  repeat: -1 },
    }
  },

  elderbug: {
    texture: 'elderbug',
    anims: {
      idle:  { row: 0, frames: 5, fps: 5,  repeat: -1 },
      talk:  { row: 1, frames: 4, fps: 8,  repeat: -1 },
      blink: { row: 2, frames: 3, fps: 10, repeat: 0  },
    }
  },

  // ── Geo / collectibles ────────────────────────────────────────────────────
  geo: {
    texture: 'geo',
    anims: {
      spin_s: { row: 0, frames: 6, fps: 12, repeat: -1 },
      spin_m: { row: 1, frames: 6, fps: 12, repeat: -1 },
      spin_l: { row: 2, frames: 6, fps: 12, repeat: -1 },
    }
  },

  // ── Effects ───────────────────────────────────────────────────────────────
  slash_effect: {
    texture: 'slash_effect',
    anims: {
      slash_h:    { row: 0, frames: 5, fps: 30, repeat: 0 },
      slash_v:    { row: 1, frames: 5, fps: 30, repeat: 0 },
      slash_up:   { row: 2, frames: 5, fps: 30, repeat: 0 },
      slash_down: { row: 3, frames: 5, fps: 30, repeat: 0 },
      great_slash:{ row: 4, frames: 6, fps: 28, repeat: 0 },
    }
  },

  fireball: {
    texture: 'fireball',
    anims: {
      travel: { row: 0, frames: 4, fps: 14, repeat: -1 },
      burst:  { row: 1, frames: 6, fps: 20, repeat: 0  },
    }
  },

  focus_ring: {
    texture: 'focus_ring',
    anims: {
      pulse: { row: 0, frames: 6, fps: 12, repeat: -1 },
      burst: { row: 1, frames: 7, fps: 20, repeat: 0  },
    }
  },

  soul_orb: {
    texture: 'soul_orb',
    anims: {
      float: { row: 0, frames: 4, fps: 8, repeat: -1 },
    }
  },
};

// ── Phase II additions ────────────────────────────────────────────────────

ANIM_DEFS.false_knight = {
  texture: 'false_knight',
  anims: {
    idle:       { row: 0, frames: 6,  fps: 6,  repeat: -1 },
    walk:       { row: 1, frames: 8,  fps: 10, repeat: -1 },
    jump:       { row: 2, frames: 5,  fps: 12, repeat: 0  },
    slam:       { row: 3, frames: 8,  fps: 16, repeat: 0  },
    slam_land:  { row: 4, frames: 6,  fps: 18, repeat: 0  },
    charge:     { row: 5, frames: 6,  fps: 14, repeat: -1 },
    stagger:    { row: 6, frames: 7,  fps: 10, repeat: 0  },
    roar:       { row: 7, frames: 8,  fps: 10, repeat: 0  },
    death:      { row: 8, frames: 10, fps: 10, repeat: 0  },
    rage_idle:  { row: 9, frames: 6,  fps: 8,  repeat: -1 },
  }
};

ANIM_DEFS.gruz_mother = {
  texture: 'gruz_mother',
  anims: {
    idle:    { row: 0, frames: 5,  fps: 6,  repeat: -1 },
    fly:     { row: 1, frames: 6,  fps: 10, repeat: -1 },
    charge:  { row: 2, frames: 6,  fps: 14, repeat: 0  },
    hit:     { row: 3, frames: 3,  fps: 12, repeat: 0  },
    death:   { row: 4, frames: 9,  fps: 10, repeat: 0  },
    baby:    { row: 5, frames: 4,  fps: 10, repeat: -1 },
  }
};

ANIM_DEFS.vengefly_king = {
  texture: 'vengefly_king',
  anims: {
    fly:     { row: 0, frames: 6, fps: 12, repeat: -1 },
    charge:  { row: 1, frames: 5, fps: 16, repeat: 0  },
    summon:  { row: 2, frames: 7, fps: 10, repeat: 0  },
    hit:     { row: 3, frames: 3, fps: 14, repeat: 0  },
    death:   { row: 4, frames: 8, fps: 10, repeat: 0  },
  }
};

ANIM_DEFS.mosscreep = {
  texture: 'mosscreep',
  anims: {
    walk:    { row: 0, frames: 7, fps: 10, repeat: -1 },
    turn:    { row: 1, frames: 4, fps: 10, repeat: 0  },
    attack:  { row: 2, frames: 5, fps: 14, repeat: 0  },
    death:   { row: 3, frames: 7, fps: 12, repeat: 0  },
  }
};

ANIM_DEFS.vengefly = {
  texture: 'vengefly',
  anims: {
    fly:     { row: 0, frames: 5, fps: 12, repeat: -1 },
    dive:    { row: 1, frames: 4, fps: 16, repeat: 0  },
    death:   { row: 2, frames: 6, fps: 12, repeat: 0  },
  }
};

ANIM_DEFS.aspid = {
  texture: 'aspid',
  anims: {
    idle:    { row: 0, frames: 4, fps: 5,  repeat: -1 },
    walk:    { row: 1, frames: 6, fps: 10, repeat: -1 },
    shoot:   { row: 2, frames: 5, fps: 14, repeat: 0  },
    death:   { row: 3, frames: 7, fps: 12, repeat: 0  },
  }
};

// Dream nail effect
ANIM_DEFS.dream_nail = {
  texture: 'dream_nail',
  anims: {
    swing:   { row: 0, frames: 7, fps: 20, repeat: 0  },
    charge:  { row: 1, frames: 4, fps: 8,  repeat: -1 },
    essence: { row: 2, frames: 5, fps: 16, repeat: 0  },
  }
};

// Dive shockwave
ANIM_DEFS.shockwave = {
  texture: 'shockwave',
  anims: {
    expand: { row: 0, frames: 6, fps: 22, repeat: 0 },
  }
};
