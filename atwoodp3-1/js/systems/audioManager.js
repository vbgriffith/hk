// ════════════════════════════════════════════════════════════
//  THE ASHWOOD INHERITANCE — Audio Manager
//  Procedural ambient audio via Web Audio API
//  No external audio files needed — all synthesized
// ════════════════════════════════════════════════════════════

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientNodes = {};
    this.musicNodes = {};
    this.initialized = false;
    this.muted = false;
    this.musicVolume = 0.18;
    this.ambientVolume = 0.35;
    this.sfxVolume = 0.6;
    this.currentAmbient = null;
    this.currentMusic = null;
  }

  // ──────────────────────────────────────────
  //  INIT (requires user gesture)
  // ──────────────────────────────────────────
  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1.0;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not available:', e);
    }
  }

  ensureInit() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ──────────────────────────────────────────
  //  AMBIENT LAYERS
  // ──────────────────────────────────────────

  // Rain — white noise filtered to rain texture
  startRain(intensity = 0.6) {
    this.ensureInit();
    if (!this.ctx || this.ambientNodes.rain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Band-pass filter to make it sound like rain
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1200;
    bandpass.Q.value = 0.8;

    // High-pass to remove rumble
    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 800;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    source.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    // Fade in
    gain.gain.linearRampToValueAtTime(
      this.ambientVolume * intensity, this.ctx.currentTime + 2
    );

    this.ambientNodes.rain = { source, gain };
  }

  stopRain(fade = 2) {
    if (!this.ambientNodes.rain) return;
    const { gain, source } = this.ambientNodes.rain;
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + fade);
    setTimeout(() => { try { source.stop(); } catch(e){} }, (fade + 0.1) * 1000);
    delete this.ambientNodes.rain;
  }

  // Interior ambient — low hum, distant house sounds
  startInterior(scene = 'manor') {
    this.ensureInit();
    if (!this.ctx || this.ambientNodes.interior) return;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    gain.connect(this.masterGain);

    // Low-frequency hum (house settling)
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = scene === 'study' ? 38 : 42;

    const oscGain = this.ctx.createGain();
    oscGain.gain.value = 0.08;

    // LFO for subtle wavering
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.connect(oscGain);
    oscGain.connect(gain);
    osc.start();
    lfo.start();

    gain.gain.linearRampToValueAtTime(
      this.ambientVolume * 0.4, this.ctx.currentTime + 3
    );

    this.ambientNodes.interior = { osc, lfo, gain };
  }

  stopInterior(fade = 2) {
    if (!this.ambientNodes.interior) return;
    const { gain, osc, lfo } = this.ambientNodes.interior;
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + fade);
    setTimeout(() => {
      try { osc.stop(); lfo.stop(); } catch(e){}
    }, (fade + 0.1) * 1000);
    delete this.ambientNodes.interior;
  }

  // Fireplace / hearth sound
  startFireplace() {
    this.ensureInit();
    if (!this.ctx || this.ambientNodes.fire) return;

    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Crackle texture
      data[i] = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.random());
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const low = this.ctx.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 600;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;

    source.connect(low);
    low.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    gain.gain.linearRampToValueAtTime(
      this.ambientVolume * 0.3, this.ctx.currentTime + 2
    );

    this.ambientNodes.fire = { source, gain };
  }

  stopFireplace() {
    if (!this.ambientNodes.fire) return;
    const { gain, source } = this.ambientNodes.fire;
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
    setTimeout(() => { try { source.stop(); } catch(e){} }, 2500);
    delete this.ambientNodes.fire;
  }

  // ──────────────────────────────────────────
  //  SCENE MUSIC — minimal, generative
  // ──────────────────────────────────────────

  // Sparse piano tones — unsettling, atmospheric
  startAmbientMusic(theme = 'investigation') {
    this.ensureInit();
    if (!this.ctx) return;

    // Stop previous
    this.stopAmbientMusic();

    // Different note sets per theme
    const themes = {
      investigation: [220, 261.63, 293.66, 329.63, 392, 440],
      tension:       [174.61, 196, 220, 233.08, 261.63, 293.66],
      revelation:    [246.94, 277.18, 329.63, 369.99, 415.30, 493.88],
      melancholy:    [196, 220, 246.94, 261.63, 293.66, 329.63]
    };

    const notes = themes[theme] || themes.investigation;
    const gain = this.ctx.createGain();
    gain.gain.value = this.musicVolume;
    gain.connect(this.masterGain);

    const reverb = this.createReverb(3.5);
    const reverbGain = this.ctx.createGain();
    reverbGain.gain.value = 0.45;
    reverb.connect(reverbGain);
    reverbGain.connect(this.masterGain);

    let playing = true;
    const playNote = () => {
      if (!playing) return;
      const note = notes[Math.floor(Math.random() * notes.length)];
      // Sometimes an octave lower
      const freq = Math.random() < 0.3 ? note / 2 : note;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0, this.ctx.currentTime);
      env.gain.linearRampToValueAtTime(this.musicVolume * 0.5, this.ctx.currentTime + 0.05);
      env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.5);

      osc.connect(env);
      env.connect(gain);
      env.connect(reverb);
      osc.start();
      osc.stop(this.ctx.currentTime + 2.6);

      // Schedule next note — irregular intervals for unease
      const nextIn = 1800 + Math.random() * 4200;
      if (playing) {
        this.musicTimer = setTimeout(playNote, nextIn);
      }
    };

    playNote();
    this.currentMusic = { gain, reverb, reverbGain, playing };
    this.currentMusic.stop = () => { playing = false; clearTimeout(this.musicTimer); };
  }

  stopAmbientMusic() {
    if (this.currentMusic && this.currentMusic.stop) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
    clearTimeout(this.musicTimer);
  }

  // ──────────────────────────────────────────
  //  SFX
  // ──────────────────────────────────────────

  // Paper rustle (picking up clue)
  playClueFX() {
    this.ensureInit();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 1.5;

    const gain = this.ctx.createGain();
    gain.gain.value = this.sfxVolume * 0.4;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();
  }

  // Door creak
  playDoorFX() {
    this.ensureInit();
    if (!this.ctx) return;

    const duration = 0.8;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(120, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.sfxVolume * 0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Dialogue bleep (typewriter key)
  playTypeFX() {
    this.ensureInit();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 800 + Math.random() * 200;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.025, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  // Stinger — revelation moment
  playStingerFX() {
    this.ensureInit();
    if (!this.ctx) return;

    const notes = [293.66, 369.99, 440, 554.37];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.25, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 1.3);
    });
  }

  // ──────────────────────────────────────────
  //  SCENE TRANSITIONS
  // ──────────────────────────────────────────
  setScene(sceneId) {
    this.ensureInit();
    if (!this.ctx) return;

    // Stop all current ambient
    this.stopAll();

    switch(sceneId) {
      case 'manor_exterior':
        this.startRain(0.7);
        this.startAmbientMusic('investigation');
        break;
      case 'foyer':
      case 'dining_room':
        this.startRain(0.25);
        this.startInterior('manor');
        this.startAmbientMusic('investigation');
        break;
      case 'study':
        this.startInterior('study');
        this.startFireplace();
        this.startAmbientMusic('tension');
        break;
      case 'drawing_room':
        this.startInterior('manor');
        this.startAmbientMusic('melancholy');
        break;
      case 'library_east':
        this.startInterior('manor');
        this.startRain(0.15);
        this.startAmbientMusic('melancholy');
        break;
      case 'kitchen':
        this.startInterior('kitchen');
        break;
      case 'carriage_house':
        this.startRain(0.3);
        this.startAmbientMusic('investigation');
        break;
      case 'whitmore_bank':
      case 'dr_crane_office':
        this.startAmbientMusic('revelation');
        break;
      default:
        this.startAmbientMusic('investigation');
    }
  }

  stopAll() {
    this.stopRain(0.5);
    this.stopInterior(0.5);
    this.stopFireplace();
    this.stopAmbientMusic();
  }

  // ──────────────────────────────────────────
  //  UTILITY — Simple convolver reverb
  // ──────────────────────────────────────────
  createReverb(duration = 2) {
    const convolver = this.ctx.createConvolver();
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    convolver.buffer = impulse;
    return convolver;
  }

  // ──────────────────────────────────────────
  //  MUTE TOGGLE
  // ──────────────────────────────────────────
  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(
        this.muted ? 0 : 1.0,
        this.ctx.currentTime + 0.3
      );
    }
    return this.muted;
  }
}

const audioManager = new AudioManager();
