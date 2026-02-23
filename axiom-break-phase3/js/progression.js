// ============================================================
//  AXIOM BREAK — progression.js  [PHASE 3]
//
//  Persistent upgrade tree across runs via localStorage.
//  Three trees with 2 upgrades each — choose one per sector clear.
//
//  FIREPOWER tree:
//    OVERDRIVE  — +35% bullet speed, +20% damage
//    RICOCHET   — bullets bounce once off walls
//
//  MOBILITY tree:
//    AFTERBURNER — dash cooldown -40%, +1 dash charge
//    GHOST_STEP  — brief invincibility after every dash
//
//  SPLICE tree:
//    ECHO_CLONE  — deploy 2 simultaneous clones
//    RESONANCE   — clone lifespan +2s, cooldown -2s
//
//  Between each sector: UpgradeScene shows 3 random unpurchased
//  upgrades — player picks one (free — earned by surviving).
//
//  USAGE:
//    Progression.init()            // load saved state
//    Progression.getChoices(3)     // returns 3 random available upgrades
//    Progression.unlock(id)        // unlock by id
//    Progression.has(id)           // boolean
//    Progression.applyAll()        // mutate AXIOM.PLAYER / AXIOM.SPLICE
//    Progression.reset()           // new run
//    Progression.save()            // write to localStorage
// ============================================================

const Progression = (() => {

  const STORAGE_KEY = 'axiombreak_progression_v1';

  // ── Upgrade catalogue ──────────────────────────────────────
  const CATALOGUE = [
    // Firepower
    {
      id: 'OVERDRIVE',
      tree: 'FIREPOWER',
      name: 'OVERDRIVE',
      desc: '+35% bullet velocity\n+20% damage per shot',
      color: 0xff6622,
      cssColor: '#ff6622',
      icon: '⚡',
      apply(cfg) {
        cfg.PLAYER.BULLET_SPEED = Math.round(cfg.PLAYER.BULLET_SPEED * 1.35);
        cfg.PLAYER._bulletDamage = (cfg.PLAYER._bulletDamage || 12) * 1.2;
      },
    },
    {
      id: 'RICOCHET',
      tree: 'FIREPOWER',
      name: 'RICOCHET',
      desc: 'Bullets bounce once\noff walls before dying',
      color: 0xff9933,
      cssColor: '#ff9933',
      icon: '↗',
      apply(cfg) {
        cfg.PLAYER._ricochet = true;
      },
    },

    // Mobility
    {
      id: 'AFTERBURNER',
      tree: 'MOBILITY',
      name: 'AFTERBURNER',
      desc: 'Dash cooldown -40%\nGain a second dash charge',
      color: 0x00f5ff,
      cssColor: '#00f5ff',
      icon: '▶▶',
      apply(cfg) {
        cfg.PLAYER.DASH_COOLDOWN = Math.round(cfg.PLAYER.DASH_COOLDOWN * 0.6);
        cfg.PLAYER._dashCharges  = 2;
      },
    },
    {
      id: 'GHOST_STEP',
      tree: 'MOBILITY',
      name: 'GHOST STEP',
      desc: '600ms invincibility\nafter every dash',
      color: 0x44ddff,
      cssColor: '#44ddff',
      icon: '👁',
      apply(cfg) {
        cfg.PLAYER._ghostStep = true;
        cfg.PLAYER._ghostStepDuration = 600;
      },
    },

    // Splice
    {
      id: 'ECHO_CLONE',
      tree: 'SPLICE',
      name: 'ECHO CLONE',
      desc: 'Deploy 2 simultaneous\nclones from one recording',
      color: 0x0077aa,
      cssColor: '#0077aa',
      icon: '◈◈',
      apply(cfg) {
        cfg.SPLICE._dualClone = true;
      },
    },
    {
      id: 'RESONANCE',
      tree: 'SPLICE',
      name: 'RESONANCE',
      desc: 'Clone lifespan +2s\nSplice cooldown -2s',
      color: 0x00aadd,
      cssColor: '#00aadd',
      icon: '∿',
      apply(cfg) {
        cfg.SPLICE.CLONE_LIFETIME += 2000;
        cfg.SPLICE.COOLDOWN = Math.max(2000, cfg.SPLICE.COOLDOWN - 2000);
      },
    },
  ];

  // ── State ──────────────────────────────────────────────────
  let _unlocked  = new Set();
  let _runScore  = 0;
  let _runLevel  = 0;

  // ── Public API ─────────────────────────────────────────────

  function init() {
    _load();
  }

  function reset() {
    _unlocked = new Set();
    _runScore = 0;
    _runLevel = 0;
    _restore();   // Reset AXIOM values to defaults
    _save();
  }

  function unlock(id) {
    _unlocked.add(id);
    const upg = CATALOGUE.find(u => u.id === id);
    if (upg) upg.apply(AXIOM);
    _save();
  }

  function has(id) {
    return _unlocked.has(id);
  }

  function getAll() {
    return CATALOGUE;
  }

  function getUnlocked() {
    return CATALOGUE.filter(u => _unlocked.has(u.id));
  }

  function getAvailable() {
    return CATALOGUE.filter(u => !_unlocked.has(u.id));
  }

  // Return `count` random available upgrades (or all if fewer)
  function getChoices(count = 3) {
    const avail = getAvailable();
    if (avail.length === 0) return [];
    const shuffled = avail.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  // Apply all unlocked upgrades to AXIOM config (call after reset or on load)
  function applyAll() {
    _restore();
    for (const id of _unlocked) {
      const upg = CATALOGUE.find(u => u.id === id);
      if (upg) upg.apply(AXIOM);
    }
  }

  function setRunStats(score, level) {
    _runScore = score;
    _runLevel = level;
  }

  function getRunStats() {
    return { score: _runScore, level: _runLevel, upgrades: [..._unlocked] };
  }

  // ── Persistence ────────────────────────────────────────────

  function _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        unlocked: [..._unlocked],
        version: 3,
      }));
    } catch(e) { /* storage unavailable */ }
  }

  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.version !== 3) { localStorage.removeItem(STORAGE_KEY); return; }
      _unlocked = new Set(data.unlocked || []);
      applyAll();
    } catch(e) {
      _unlocked = new Set();
    }
  }

  // ── Defaults snapshot ─────────────────────────────────────
  // Store originals on first call so reset can restore them
  let _defaults = null;

  function _snapshot() {
    if (_defaults) return;
    _defaults = {
      PLAYER: { ...AXIOM.PLAYER },
      SPLICE: { ...AXIOM.SPLICE },
    };
  }

  function _restore() {
    _snapshot();
    // Restore mutable values
    Object.assign(AXIOM.PLAYER, _defaults.PLAYER);
    Object.assign(AXIOM.SPLICE, _defaults.SPLICE);
    // Clear upgrade-specific flags
    delete AXIOM.PLAYER._ricochet;
    delete AXIOM.PLAYER._dashCharges;
    delete AXIOM.PLAYER._ghostStep;
    delete AXIOM.PLAYER._ghostStepDuration;
    delete AXIOM.PLAYER._bulletDamage;
    delete AXIOM.SPLICE._dualClone;
  }

  return {
    init,
    reset,
    unlock,
    has,
    getAll,
    getUnlocked,
    getAvailable,
    getChoices,
    applyAll,
    setRunStats,
    getRunStats,
    get unlocked() { return _unlocked; },
    // Expose snapshot for first-call initialisation
    _snapshot,
  };

})();
