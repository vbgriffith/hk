/* js/systems/AudioEngine.js — Web Audio API procedural sound engine */
'use strict';

class AudioEngine {
  constructor() {
    this._ctx     = null;
    this._master  = null;
    this._musicGain = null;
    this._sfxGain   = null;
    this._muted     = false;
    this._currentMusic = null;
    this._musicNodes   = [];
  }

  _init() {
    if (this._ctx) return;
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._master    = this._ctx.createGain(); this._master.gain.value = 0.7;
      this._musicGain = this._ctx.createGain(); this._musicGain.gain.value = C.MUSIC_VOL;
      this._sfxGain   = this._ctx.createGain(); this._sfxGain.gain.value  = C.SFX_VOL;
      this._master.connect(this._ctx.destination);
      this._musicGain.connect(this._master);
      this._sfxGain.connect(this._master);
    } catch(e) {
      console.warn('Web Audio not available:', e);
    }
  }

  // ── Resume on user gesture ────────────────────────────────────────────────
  resume() {
    this._init();
    if (this._ctx?.state === 'suspended') this._ctx.resume();
  }

  // ── Master mute ───────────────────────────────────────────────────────────
  toggleMute() {
    this._muted = !this._muted;
    if (this._master) this._master.gain.value = this._muted ? 0 : 0.7;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SFX LIBRARY — all synthesized
  // ════════════════════════════════════════════════════════════════════════════

  playSfx(key) {
    if (!this._ctx || this._muted) return;
    if (this._ctx.state === 'suspended') this._ctx.resume();
    const t = this._ctx.currentTime;
    switch (key) {
      // ── Direct keys ──────────────────────────────────────────────────────
      case 'sfx_nail_hit':    this._hitImpact(t, 0.18, 180, 80);   break;
      case 'sfx_nail_swing':  this._swish(t, 0.10);                break;
      case 'sfx_jump':        this._jumpSound(t);                   break;
      case 'sfx_dash':        this._dashSound(t);                   break;
      case 'sfx_land':        this._landThud(t, 0.15);             break;
      case 'sfx_take_hit':    this._hitImpact(t, 0.3, 120, 60);    break;
      case 'sfx_death':       this._deathSound(t);                  break;
      case 'sfx_collect':     this._collectSound(t);                break;
      case 'sfx_focus':       this._focusHum(t);                    break;
      case 'sfx_fireball':    this._fireballSound(t);               break;
      case 'sfx_dive':        this._diveStartSound(t);              break;
      case 'sfx_dive_land':   this._diveLandSound(t);              break;
      case 'sfx_dream_nail':  this._dreamNailSound(t);             break;
      case 'sfx_spit':        this._spitSound(t);                   break;
      case 'sfx_slam':        this._heavySlam(t);                   break;
      case 'sfx_enemy_die':   this._enemyDie(t);                    break;
      case 'sfx_boss_intro':  this._bossIntro(t);                   break;
      case 'sfx_boss_rage':   this._bossRage(t);                    break;
      case 'sfx_boss_die':    this._bossDie(t);                     break;
      case 'sfx_bench':       this._benchSound(t);                  break;
      case 'sfx_geo_pickup':  this._geoPickup(t);                   break;
      case 'sfx_menu_move':   this._menuMove(t);                    break;
      case 'sfx_menu_select': this._menuSelect(t);                  break;
      case 'sfx_dreamer_break': this._dreamerBreak(t);             break;
      case 'sfx_void_surge':  this._voidSurge(t);                  break;
      // ── Aliases for legacy key names ──────────────────────────────────────
      case 'sfx_nail':         this._swish(t, 0.10);               break;
      case 'sfx_player_hit':   this._hitImpact(t, 0.3, 120, 60);   break;
      case 'sfx_player_death': this._deathSound(t);                 break;
      case 'sfx_doublejump':   this._jumpSound(t);                  break;
      case 'sfx_heal':         this._focusHum(t);                   break;
      case 'sfx_geo':          this._geoPickup(t);                  break;
      case 'sfx_shade_collect':this._collectSound(t);               break;
    }
  }

  // ── Individual SFX implementations ───────────────────────────────────────

  _hitImpact(t, dur, freq1, freq2) {
    const o = this._ctx.createOscillator();
    const g = this._ctx.createGain();
    const f = this._ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 800;
    o.connect(f); f.connect(g); g.connect(this._sfxGain);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(freq1, t);
    o.frequency.exponentialRampToValueAtTime(freq2, t + dur);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur);
  }

  _swish(t, dur) {
    const buf = this._ctx.createBuffer(1, this._ctx.sampleRate * dur, this._ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = this._ctx.createBufferSource();
    src.buffer = buf;
    const f = this._ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2000; f.Q.value = 0.5;
    const g = this._ctx.createGain(); g.gain.value = 0.15;
    src.connect(f); f.connect(g); g.connect(this._sfxGain);
    src.start(t);
  }

  _jumpSound(t) {
    const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
    o.connect(g); g.connect(this._sfxGain);
    o.type = 'sine'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(440, t + 0.12);
    g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.start(t); o.stop(t + 0.2);
  }

  _dashSound(t) {
    this._swish(t, 0.15);
    const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
    o.connect(g); g.connect(this._sfxGain);
    o.type = 'sine'; o.frequency.setValueAtTime(600, t); o.frequency.exponentialRampToValueAtTime(200, t + 0.14);
    g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.start(t); o.stop(t + 0.16);
  }

  _landThud(t, dur) {
    const buf = this._ctx.createBuffer(1, this._ctx.sampleRate * dur, this._ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.15));
    const src = this._ctx.createBufferSource(); src.buffer = buf;
    const f = this._ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 200;
    const g = this._ctx.createGain(); g.gain.value = 0.5;
    src.connect(f); f.connect(g); g.connect(this._sfxGain); src.start(t);
  }

  _deathSound(t) {
    for (let i = 0; i < 3; i++) {
      const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
      o.connect(g); g.connect(this._sfxGain);
      o.type = 'sine'; const base = 200 - i*40;
      o.frequency.setValueAtTime(base, t + i*0.12);
      o.frequency.exponentialRampToValueAtTime(base*0.4, t + i*0.12 + 0.4);
      g.gain.setValueAtTime(0.2, t + i*0.12); g.gain.exponentialRampToValueAtTime(0.001, t + i*0.12 + 0.4);
      o.start(t + i*0.12); o.stop(t + i*0.12 + 0.5);
    }
  }

  _collectSound(t) {
    const notes = [523, 659, 784]; // C E G
    notes.forEach((freq, i) => {
      const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
      o.connect(g); g.connect(this._sfxGain);
      o.type = 'sine'; o.frequency.value = freq;
      const st = t + i * 0.06;
      g.gain.setValueAtTime(0.15, st); g.gain.exponentialRampToValueAtTime(0.001, st + 0.25);
      o.start(st); o.stop(st + 0.3);
    });
  }

  _focusHum(t) {
    const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
    const lfo = this._ctx.createOscillator(); const lfoGain = this._ctx.createGain();
    lfo.frequency.value = 5; lfoGain.gain.value = 20;
    lfo.connect(lfoGain); lfoGain.connect(o.frequency);
    o.connect(g); g.connect(this._sfxGain);
    o.type = 'sine'; o.frequency.value = 180;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.15, t + 0.3);
    g.gain.setValueAtTime(0.15, t + 1.0); g.gain.exponentialRampToValueAtTime(0.001, t + 1.3);
    lfo.start(t); lfo.stop(t + 1.4); o.start(t); o.stop(t + 1.4);
  }

  _fireballSound(t) {
    const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
    const f = this._ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 800;
    o.connect(f); f.connect(g); g.connect(this._sfxGain);
    o.type = 'sawtooth'; o.frequency.setValueAtTime(400, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.3);
    g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    o.start(t); o.stop(t + 0.4);
  }

  _diveStartSound(t) {
    const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
    o.connect(g); g.connect(this._sfxGain);
    o.type = 'sawtooth'; o.frequency.setValueAtTime(80, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.4);
    g.gain.setValueAtTime(0.25, t); g.gain.linearRampToValueAtTime(0.35, t + 0.2); g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    o.start(t); o.stop(t + 0.6);
  }

  _diveLandSound(t) {
    this._landThud(t, 0.25);
    // Shockwave ring
    const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
    o.connect(g); g.connect(this._sfxGain);
    o.type = 'sine'; o.frequency.setValueAtTime(60, t); o.frequency.exponentialRampToValueAtTime(200, t + 0.2);
    g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.start(t); o.stop(t + 0.35);
  }

  _dreamNailSound(t) {
    const notes = [330, 415, 554, 740]; // Am arpeggio
    notes.forEach((f, i) => {
      const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
      const rev = this._createReverb(0.8);
      o.connect(g); g.connect(rev); rev.connect(this._sfxGain);
      o.type = 'sine'; o.frequency.value = f;
      const st = t + i * 0.08;
      g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(0.12, st + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, st + 0.7);
      o.start(st); o.stop(st + 0.8);
    });
  }

  _spitSound(t) {
    this._swish(t, 0.08);
    const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
    o.connect(g); g.connect(this._sfxGain);
    o.type = 'sine'; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.1);
    g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.start(t); o.stop(t + 0.15);
  }

  _heavySlam(t) {
    this._landThud(t, 0.35);
    const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
    o.connect(g); g.connect(this._sfxGain);
    o.type = 'sine'; o.frequency.setValueAtTime(50, t); o.frequency.exponentialRampToValueAtTime(25, t + 0.3);
    g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.start(t); o.stop(t + 0.45);
  }

  _enemyDie(t) {
    const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
    o.connect(g); g.connect(this._sfxGain);
    o.type = 'square'; o.frequency.setValueAtTime(440, t); o.frequency.exponentialRampToValueAtTime(110, t + 0.2);
    g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.start(t); o.stop(t + 0.25);
  }

  _bossIntro(t) {
    // Deep dramatic chord
    const freqs = [55, 82.5, 110, 165];
    freqs.forEach((f, i) => {
      const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
      o.connect(g); g.connect(this._sfxGain);
      o.type = i === 0 ? 'sawtooth' : 'sine';
      o.frequency.value = f;
      const delay = i * 0.08;
      g.gain.setValueAtTime(0, t + delay);
      g.gain.linearRampToValueAtTime(0.18, t + delay + 0.1);
      g.gain.setValueAtTime(0.18, t + delay + 0.5);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 1.5);
      o.start(t + delay); o.stop(t + delay + 2);
    });
  }

  _bossRage(t) {
    const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
    const dist = this._ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i * 2) / 256 - 1; curve[i] = (Math.PI + 300) * x / (Math.PI + 300 * Math.abs(x)); }
    dist.curve = curve;
    o.connect(dist); dist.connect(g); g.connect(this._sfxGain);
    o.type = 'sawtooth'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(180, t + 0.5);
    g.gain.setValueAtTime(0.15, t); g.gain.setValueAtTime(0.15, t + 0.5); g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    o.start(t); o.stop(t + 1);
  }

  _bossDie(t) {
    // Descending triumphant arpeggio
    const notes = [880, 740, 587, 494, 392, 294, 220, 147];
    notes.forEach((f, i) => {
      const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
      const rev = this._createReverb(1.5);
      o.connect(g); g.connect(rev); rev.connect(this._sfxGain);
      o.type = 'sine'; o.frequency.value = f;
      const st = t + i * 0.1;
      g.gain.setValueAtTime(0.18, st); g.gain.exponentialRampToValueAtTime(0.001, st + 0.6);
      o.start(st); o.stop(st + 0.7);
    });
  }

  _benchSound(t) {
    const notes = [261, 329, 392, 523]; // C major chord
    notes.forEach((f, i) => {
      const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
      o.connect(g); g.connect(this._sfxGain);
      o.type = 'sine'; o.frequency.value = f;
      const st = t + i * 0.1;
      g.gain.setValueAtTime(0.1, st); g.gain.exponentialRampToValueAtTime(0.001, st + 1.2);
      o.start(st); o.stop(st + 1.3);
    });
  }

  _geoPickup(t) {
    const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
    o.connect(g); g.connect(this._sfxGain);
    o.type = 'sine'; o.frequency.setValueAtTime(660, t); o.frequency.exponentialRampToValueAtTime(880, t + 0.06);
    g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.start(t); o.stop(t + 0.15);
  }

  _menuMove(t) {
    const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
    o.connect(g); g.connect(this._sfxGain);
    o.type = 'sine'; o.frequency.value = 440;
    g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    o.start(t); o.stop(t + 0.1);
  }

  _menuSelect(t) {
    [440, 550].forEach((f, i) => {
      const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
      o.connect(g); g.connect(this._sfxGain);
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.1, t + i*0.05); g.gain.exponentialRampToValueAtTime(0.001, t + i*0.05 + 0.15);
      o.start(t + i*0.05); o.stop(t + i*0.05 + 0.2);
    });
  }

  _dreamerBreak(t) {
    const rev = this._createReverb(2);
    const notes = [440, 554, 659, 880, 1108];
    notes.forEach((f, i) => {
      const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
      o.connect(g); g.connect(rev); rev.connect(this._sfxGain);
      o.type = 'sine'; o.frequency.value = f;
      const st = t + i * 0.15;
      g.gain.setValueAtTime(0.15, st); g.gain.exponentialRampToValueAtTime(0.001, st + 1.5);
      o.start(st); o.stop(st + 1.8);
    });
  }

  _voidSurge(t) {
    const buf = this._ctx.createBuffer(1, this._ctx.sampleRate * 0.6, this._ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) * 0.6;
    }
    const src = this._ctx.createBufferSource(); src.buffer = buf;
    const f = this._ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400;
    const g = this._ctx.createGain(); g.gain.value = 0.4;
    src.connect(f); f.connect(g); g.connect(this._sfxGain); src.start(t);
  }

  // ── Reverb helper ─────────────────────────────────────────────────────────
  _createReverb(duration) {
    const len  = this._ctx.sampleRate * duration;
    const buf  = this._ctx.createBuffer(2, len, this._ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    }
    const node = this._ctx.createConvolver(); node.buffer = buf;
    return node;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MUSIC — procedural ambient + melodic tracks
  // ════════════════════════════════════════════════════════════════════════════

  playMusic(key) {
    if (!this._ctx) return;
    if (this._currentMusic === key) return;
    this._stopMusic();
    this._currentMusic = key;

    switch (key) {
      case 'music_crossroads': this._musicCrossroads(); break;
      case 'music_greenpath':  this._musicGreenpath();  break;
      case 'music_city':       this._musicCity();       break;
      case 'music_fungal':     this._musicFungal();     break;
      case 'music_basin':      this._musicBasin();      break;
      case 'music_boss':       this._musicBoss();       break;
      case 'music_boss_final': this._musicBossFinal();  break;
      case 'music_abyss':      this._musicAbyss();      break;
      case 'music_menu':       this._musicMenu();       break;
    }
  }

  _stopMusic() {
    this._musicNodes.forEach(n => {
      try { n.stop?.(); n.disconnect?.(); } catch(e) {}
    });
    this._musicNodes = [];
    if (this._musicGain) {
      const t = this._ctx?.currentTime ?? 0;
      this._musicGain.gain.setValueAtTime(this._musicGain.gain.value, t);
      this._musicGain.gain.linearRampToValueAtTime(0, t + 0.5);
      setTimeout(() => { if (this._musicGain) this._musicGain.gain.value = C.MUSIC_VOL; }, 600);
    }
  }

  _makeOscLoop(freq, type, gainVal, detune = 0) {
    if (!this._ctx) return null;
    const t   = this._ctx.currentTime;
    const osc = this._ctx.createOscillator();
    const g   = this._ctx.createGain();
    osc.type = type; osc.frequency.value = freq; osc.detune.value = detune;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gainVal, t + 1.5);
    osc.connect(g); g.connect(this._musicGain);
    osc.start(t);
    this._musicNodes.push(osc, g);
    return { osc, g };
  }

  _musicCrossroads() {
    // Atmospheric drone in Dm
    this._makeOscLoop(36.7, 'sine', 0.12);       // D1 drone
    this._makeOscLoop(73.4, 'sine', 0.08);        // D2
    this._makeOscLoop(110,  'sine', 0.05, -8);    // slight detune
    this._makeOscLoop(146.8,'sine', 0.04);        // A2 fifth
    this._scheduleMelody([
      [293.7, 0.4], [220, 0.4], [261.6, 0.4], [220, 0.4],
      [174.6, 0.6], [196, 0.4], [220, 0.8], [0, 0.4],
    ], 0.04, 6.4, 'sine', 0.08);
  }

  _musicGreenpath() {
    // Lighter, more hopeful in G
    this._makeOscLoop(48.9, 'sine', 0.08);
    this._makeOscLoop(97.9, 'sine', 0.06);
    this._makeOscLoop(196,  'sine', 0.04);
    this._scheduleMelody([
      [392, 0.3], [440, 0.3], [392, 0.3], [349.2, 0.6],
      [329.6, 0.3], [392, 0.3], [440, 0.6], [0, 0.3],
      [523.3, 0.3], [493.9, 0.3], [440, 0.3], [392, 0.9], [0, 0.6],
    ], 0.03, 7.8, 'sine', 0.06);
  }

  _musicCity() {
    // Melancholic in Am, piano-like
    this._makeOscLoop(27.5, 'sine', 0.1);
    this._makeOscLoop(55, 'sine', 0.07);
    this._makeOscLoop(82.4, 'sine', 0.04);
    this._scheduleMelody([
      [220, 0.4], [246.9, 0.4], [261.6, 0.4], [220, 0.8],
      [174.6, 0.4], [196, 0.4], [220, 0.8], [0, 0.4],
      [261.6, 0.4], [293.7, 0.4], [329.6, 0.6], [246.9, 0.4], [220, 1.0],
    ], 0.04, 8.0, 'triangle', 0.06);
  }

  _musicFungal() {
    // Weird and organic in C minor
    this._makeOscLoop(32.7, 'sine', 0.1, 12);
    this._makeOscLoop(65.4, 'triangle', 0.06);
    this._makeOscLoop(98, 'sine', 0.04, -15);
    this._scheduleMelody([
      [130.8, 0.5], [155.6, 0.5], [130.8, 0.5], [116.5, 1.0],
      [98, 0.5], [116.5, 0.5], [130.8, 1.0], [0, 0.5],
    ], 0.04, 6.5, 'triangle', 0.05);
  }

  _musicBasin() {
    // Hollow and vast, minimal
    this._makeOscLoop(30, 'sine', 0.09, 5);
    this._makeOscLoop(45, 'sine', 0.05, -5);
    this._makeOscLoop(60, 'sine', 0.03);
    // Slow rising and falling pitch
    const lfo = this._ctx.createOscillator(); const lg = this._ctx.createGain();
    lfo.frequency.value = 0.05; lg.gain.value = 4;
    lfo.connect(lg);
    const baseOsc = this._ctx.createOscillator(); const bg = this._ctx.createGain();
    baseOsc.type = 'sine'; baseOsc.frequency.value = 55; bg.gain.value = 0.06;
    lg.connect(baseOsc.frequency);
    baseOsc.connect(bg); bg.connect(this._musicGain);
    lfo.start(); baseOsc.start();
    this._musicNodes.push(lfo, lg, baseOsc, bg);
  }

  _musicBoss() {
    // Driving rhythmic boss track
    const now = this._ctx.currentTime;
    const bpm = 140, beat = 60 / bpm;
    this._makeOscLoop(55, 'sawtooth', 0.04);
    this._makeOscLoop(110, 'square', 0.03);
    // Rhythmic pattern
    for (let b = 0; b < 32; b++) {
      const t = now + b * beat;
      const hit = (b % 4 === 0) ? 0.14 : (b % 2 === 0) ? 0.07 : 0;
      if (hit > 0) {
        const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
        o.connect(g); g.connect(this._musicGain);
        o.type = 'square'; o.frequency.value = b % 8 === 0 ? 110 : 82;
        g.gain.setValueAtTime(hit, t); g.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.4);
        o.start(t); o.stop(t + beat * 0.5);
        this._musicNodes.push(o, g);
      }
    }
    this._scheduleMelody([
      [220,0.2],[0,0.2],[196,0.2],[0,0.2],[174.6,0.4],
      [220,0.2],[0,0.2],[261.6,0.4],[0,0.4],
    ], 0.05, beat*16, 'sawtooth', 0.06);
  }

  _musicBossFinal() {
    this._musicBoss();
    // Add extra intensity layer
    this._makeOscLoop(27.5, 'sawtooth', 0.05);
    this._makeOscLoop(220, 'square', 0.03, 7);
  }

  _musicAbyss() {
    // Nearly silent void
    this._makeOscLoop(20, 'sine', 0.05);
    this._makeOscLoop(30, 'sine', 0.03, 8);
    // Occasional distant sounds
    const schedule = () => {
      if (this._currentMusic !== 'music_abyss') return;
      const t = this._ctx.currentTime + Phaser.Math.Between(3, 8);
      const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
      const rev = this._createReverb(3);
      o.connect(g); g.connect(rev); rev.connect(this._musicGain);
      o.type = 'sine'; o.frequency.setValueAtTime(40, t); o.frequency.exponentialRampToValueAtTime(20, t + 3);
      g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + 4);
      o.start(t); o.stop(t + 5);
      this._musicNodes.push(o, g, rev);
      setTimeout(schedule, Phaser.Math.Between(3000, 8000));
    };
    setTimeout(schedule, 2000);
  }

  _musicMenu() {
    // Gentle title screen atmosphere
    this._makeOscLoop(36.7, 'sine', 0.06);
    this._makeOscLoop(55, 'sine', 0.04);
    this._scheduleMelody([
      [293.7,0.6],[246.9,0.4],[220,0.6],[196,0.4],
      [174.6,0.8],[196,0.4],[220,1.0],[0,0.8],
      [261.6,0.5],[293.7,0.5],[329.6,0.5],[293.7,0.5],[261.6,1.2],
    ], 0.03, 9.0, 'sine', 0.05);
  }

  _scheduleMelody(notes, attack, loopDur, type, vol) {
    if (!this._ctx) return;
    const startTime = this._ctx.currentTime + 0.5;
    const playMelody = (offset) => {
      if (this._musicNodes.length === 0) return; // music stopped
      let t = startTime + offset;
      for (const [freq, dur] of notes) {
        if (freq > 0) {
          const o = this._ctx.createOscillator(); const g = this._ctx.createGain();
          const rev = this._createReverb(0.6);
          o.connect(g); g.connect(rev); rev.connect(this._musicGain);
          o.type = type; o.frequency.value = freq;
          g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack);
          g.gain.setValueAtTime(vol, t + dur * 0.7);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          o.start(t); o.stop(t + dur + 0.05);
          this._musicNodes.push(o, g, rev);
        }
        t += dur;
      }
    };
    // Loop
    const loopCount = 20;
    for (let i = 0; i < loopCount; i++) playMelody(i * loopDur);
  }
}

// Global singleton
const AUDIO_ENGINE = new AudioEngine();
