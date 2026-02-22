// ============================================================
//  AXIOM BREAK — audio.js  [PHASE 2]
//  Procedural Web Audio API synthesizer.
//  Zero external files — all sounds generated mathematically.
//
//  Usage:
//    AudioSynth.init();          // call once after user interaction
//    AudioSynth.play('shoot');
//    AudioSynth.play('hit');
//    AudioSynth.play('explode');
//    AudioSynth.play('dash');
//    AudioSynth.play('splice_rec');
//    AudioSynth.play('splice_deploy');
//    AudioSynth.play('portal_open');
//    AudioSynth.play('boss_alert');
//    AudioSynth.play('powerup');
//    AudioSynth.play('player_hurt');
//    AudioSynth.play('player_die');
//    AudioSynth.playMusic('ambient');  // looping ambient drone
//    AudioSynth.stopMusic();
//    AudioSynth.setVolume(0.0 – 1.0);
// ============================================================

const AudioSynth = (() => {

  let ctx    = null;
  let master = null;
  let musicNode = null;
  let musicGain = null;
  let _muted = false;
  let _volume = 0.55;

  // ── Init ────────────────────────────────────────────────────
  function init() {
    if (ctx) return;
    try {
      ctx    = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = _volume;
      master.connect(ctx.destination);
    } catch (e) {
      console.warn('AudioSynth: Web Audio not supported', e);
    }
  }

  function _ensureCtx() {
    if (!ctx) init();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return !!ctx;
  }

  // ── Volume / mute ────────────────────────────────────────────
  function setVolume(v) {
    _volume = Utils.clamp(v, 0, 1);
    if (master) master.gain.value = _muted ? 0 : _volume;
  }

  function toggleMute() {
    _muted = !_muted;
    if (master) master.gain.value = _muted ? 0 : _volume;
    return _muted;
  }

  // ── Core building blocks ─────────────────────────────────────

  function _osc(type, freq, startTime, duration, gainVal = 0.3, detune = 0) {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type            = type;
    osc.frequency.value = freq;
    osc.detune.value    = detune;
    osc.connect(g);
    g.connect(master);
    g.gain.setValueAtTime(gainVal, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
    return { osc, gain: g };
  }

  function _noise(startTime, duration, gainVal = 0.15, lpFreq = 4000) {
    const bufSize = ctx.sampleRate * duration;
    const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data    = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const lp = ctx.createBiquadFilter();
    lp.type            = 'lowpass';
    lp.frequency.value = lpFreq;

    const g = ctx.createGain();
    g.gain.setValueAtTime(gainVal, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    src.connect(lp);
    lp.connect(g);
    g.connect(master);
    src.start(startTime);
    src.stop(startTime + duration);
    return src;
  }

  function _sweep(type, freqStart, freqEnd, startTime, duration, gainVal = 0.25) {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, startTime);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);
    osc.connect(g);
    g.connect(master);
    g.gain.setValueAtTime(gainVal, startTime);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
    return { osc, gain: g };
  }

  // ── Sound definitions ─────────────────────────────────────────

  const SOUNDS = {

    shoot() {
      const t = ctx.currentTime;
      _sweep('sawtooth', 880, 220, t, 0.08, 0.18);
      _sweep('square',   660, 180, t, 0.06, 0.08);
      _noise(t, 0.05, 0.06, 3000);
    },

    hit() {
      const t = ctx.currentTime;
      _sweep('sawtooth', 400, 80, t, 0.12, 0.2);
      _noise(t, 0.1, 0.12, 2000);
    },

    explode() {
      const t = ctx.currentTime;
      _noise(t, 0.35, 0.3, 800);
      _noise(t, 0.2,  0.2, 200);
      _sweep('sine', 180, 30, t, 0.4, 0.25);
      _osc('sine', 60, t, 0.5, 0.35);
    },

    dash() {
      const t = ctx.currentTime;
      _sweep('sawtooth', 200, 900, t, 0.07, 0.15);
      _sweep('sine',     150, 600, t + 0.02, 0.07, 0.12);
      _noise(t, 0.06, 0.08, 5000);
    },

    splice_rec() {
      // Rising warble — recording start
      const t = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        _osc('sine', 440 + i * 220, t + i * 0.07, 0.15, 0.15, i * 10);
      }
      _sweep('triangle', 300, 1200, t, 0.25, 0.12);
    },

    splice_deploy() {
      // Spatial whoosh — clone materializes
      const t = ctx.currentTime;
      _sweep('sawtooth', 80, 1600, t, 0.18, 0.2);
      _noise(t, 0.2, 0.1, 6000);
      _osc('sine', 880, t + 0.05, 0.3, 0.25);
      _osc('sine', 1320, t + 0.1, 0.2, 0.15);
    },

    portal_open() {
      const t = ctx.currentTime;
      for (let i = 0; i < 5; i++) {
        const freq = 220 * Math.pow(1.3, i);
        _osc('sine', freq, t + i * 0.06, 0.4 - i * 0.05, 0.12 - i * 0.015, i * 5);
      }
      _sweep('triangle', 440, 1760, t, 0.5, 0.08);
    },

    boss_alert() {
      const t = ctx.currentTime;
      // Three descending horror tones
      _osc('sawtooth', 110, t,       0.5, 0.25);
      _osc('sawtooth', 82,  t + 0.2, 0.5, 0.25);
      _osc('sawtooth', 55,  t + 0.4, 0.8, 0.3);
      _noise(t + 0.4, 0.5, 0.1, 400);
    },

    powerup() {
      const t = ctx.currentTime;
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => {
        _osc('sine', f, t + i * 0.06, 0.2, 0.18);
        _osc('triangle', f * 2, t + i * 0.06, 0.12, 0.08);
      });
    },

    player_hurt() {
      const t = ctx.currentTime;
      _sweep('sawtooth', 300, 100, t, 0.15, 0.3);
      _noise(t, 0.12, 0.15, 1500);
    },

    player_die() {
      const t = ctx.currentTime;
      _noise(t, 0.6, 0.25, 600);
      _sweep('sawtooth', 220, 20, t, 0.8, 0.3);
      _sweep('sine', 110, 8, t + 0.1, 0.9, 0.2);
      for (let i = 0; i < 4; i++) {
        _osc('sawtooth', 440 / (i + 1), t + i * 0.12, 0.3, 0.1 + i * 0.03);
      }
    },

    boss_shoot() {
      const t = ctx.currentTime;
      _sweep('square', 440, 110, t, 0.1, 0.22);
      _noise(t, 0.08, 0.08, 2500);
    },

    shield_hit() {
      const t = ctx.currentTime;
      _sweep('sine', 1200, 400, t, 0.15, 0.2);
      _osc('triangle', 800, t, 0.15, 0.15);
    },

    emp_burst() {
      const t = ctx.currentTime;
      _noise(t, 0.08, 0.3, 8000);
      _sweep('sawtooth', 2000, 100, t, 0.25, 0.25);
      _osc('square', 60, t, 0.3, 0.2);
    },
  };

  // ── Ambient music (layered drones) ────────────────────────────

  function playMusic(type = 'ambient') {
    if (!_ensureCtx()) return;
    stopMusic();

    musicGain = ctx.createGain();
    musicGain.gain.value = 0;
    musicGain.connect(master);

    const nodes = [];

    if (type === 'ambient') {
      // Deep space drone — three detuned oscillators + LFO tremolo
      const freqs = [55, 55.3, 110.1];
      for (const f of freqs) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        osc.connect(musicGain);
        osc.start();
        nodes.push(osc);
      }

      // Sub bass pulse
      const bass = ctx.createOscillator();
      bass.type = 'triangle';
      bass.frequency.value = 27.5;
      const bassGain = ctx.createGain();
      bassGain.gain.value = 0.4;
      bass.connect(bassGain);
      bassGain.connect(musicGain);
      bass.start();
      nodes.push(bass);

      // LFO tremolo
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.15;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.3;
      lfo.connect(lfoGain);
      lfoGain.connect(musicGain.gain);
      lfo.start();
      nodes.push(lfo);

      // Pad noise layer
      _buildAmbientNoisePad(musicGain, nodes);

    } else if (type === 'combat') {
      // Faster, more rhythmic drone for combat
      const freqs = [110, 165, 220, 275];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
        osc.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = 0.04;
        osc.connect(g);
        g.connect(musicGain);
        osc.start();
        nodes.push(osc);
      });

      // Rhythmic click pulse
      _startRhythm(musicGain, nodes);

    } else if (type === 'boss') {
      // Tense, dissonant boss theme
      const intervals = [55, 58.27, 82.41, 87.31]; // minor 2nd / tritone
      for (const f of intervals) {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = 0.07;
        osc.connect(g);
        g.connect(musicGain);
        osc.start();
        nodes.push(osc);
      }
      _startRhythm(musicGain, nodes, 0.22);
    }

    musicNode = nodes;

    // Fade in
    musicGain.gain.setValueAtTime(0, ctx.currentTime);
    musicGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 2.5);
  }

  function _buildAmbientNoisePad(target, nodes) {
    const bufSize = ctx.sampleRate * 4;
    const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data    = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.02;

    // Smooth it
    for (let i = 1; i < bufSize; i++) data[i] = data[i] * 0.1 + data[i-1] * 0.9;

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop   = true;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 200;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1800;

    const g = ctx.createGain(); g.gain.value = 0.15;

    src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(target);
    src.start();
    nodes.push(src);
  }

  function _startRhythm(target, nodes, vol = 0.15) {
    // Schedule repeating kick pattern using AudioContext clock
    let nextBeat = ctx.currentTime + 0.1;
    const bpm    = 120;
    const beatDur = 60 / bpm;
    let beat = 0;

    function scheduleBeat() {
      if (!musicNode) return; // stopped

      const pattern = [1, 0, 0, 0.5, 0, 0, 1, 0]; // kick pattern
      const velocity = pattern[beat % pattern.length];

      if (velocity > 0) {
        // Mini kick
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, nextBeat);
        osc.frequency.exponentialRampToValueAtTime(30, nextBeat + 0.08);
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol * velocity, nextBeat);
        g.gain.exponentialRampToValueAtTime(0.001, nextBeat + 0.12);
        osc.connect(g); g.connect(target);
        osc.start(nextBeat); osc.stop(nextBeat + 0.15);
      }

      nextBeat += beatDur / 2; // 8th notes
      beat++;

      // Schedule next
      const delay = (nextBeat - ctx.currentTime) * 1000 - 50;
      setTimeout(scheduleBeat, Math.max(0, delay));
    }

    scheduleBeat();
  }

  function stopMusic() {
    if (!ctx) return;
    if (musicGain) {
      musicGain.gain.setValueAtTime(musicGain.gain.value, ctx.currentTime);
      musicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      setTimeout(() => {
        try {
          if (musicNode) {
            for (const n of musicNode) { try { n.stop(); } catch(e){} }
          }
          musicNode = null;
          musicGain = null;
        } catch(e) {}
      }, 900);
    }
  }

  // ── Public play() ─────────────────────────────────────────────

  function play(name) {
    if (!_ensureCtx() || _muted) return;
    if (SOUNDS[name]) {
      try { SOUNDS[name](); }
      catch(e) { console.warn('AudioSynth: error playing', name, e); }
    }
  }

  // ── Fire-rate limiting for high-frequency sounds ──────────────
  const _lastPlayed = {};
  const _minInterval = { shoot: 60, hit: 40, player_hurt: 200 };

  function playThrottled(name) {
    const now = performance.now();
    const min = _minInterval[name] || 0;
    if (now - (_lastPlayed[name] || 0) < min) return;
    _lastPlayed[name] = now;
    play(name);
  }

  // ── Expose ────────────────────────────────────────────────────
  return {
    init,
    play,
    playThrottled,
    playMusic,
    stopMusic,
    setVolume,
    toggleMute,
    get muted() { return _muted; },
    get context() { return ctx; },
  };

})();
