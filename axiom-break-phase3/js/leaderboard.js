// ============================================================
//  AXIOM BREAK — leaderboard.js  [PHASE 3]
//
//  Persistent high-score leaderboard using localStorage.
//  Top 10 entries. Each entry: { initials, score, level, date }
//
//  USAGE:
//    Leaderboard.init()
//    Leaderboard.isHighScore(score)          → boolean
//    Leaderboard.addEntry(initials, score, level)
//    Leaderboard.getTop(n)                   → sorted entries[]
//    Leaderboard.clear()
// ============================================================

const Leaderboard = (() => {

  const STORAGE_KEY = 'axiombreak_leaderboard_v1';
  const MAX_ENTRIES = 10;

  let _entries = [];

  function init() {
    _load();
  }

  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        _entries = Array.isArray(data) ? data : [];
      }
    } catch(e) {
      _entries = [];
    }
    // Seed with example entries on first run so the board isn't empty
    if (_entries.length === 0) {
      _entries = [
        { initials: 'AXM', score: 48200, level: 8, date: '2026-03-01' },
        { initials: 'WRT', score: 35100, level: 6, date: '2026-02-28' },
        { initials: 'ELV', score: 22800, level: 5, date: '2026-02-25' },
        { initials: '---', score: 11500, level: 3, date: '2026-02-20' },
      ];
      _save();
    }
  }

  function _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_entries));
    } catch(e) {}
  }

  function isHighScore(score) {
    if (_entries.length < MAX_ENTRIES) return true;
    return score > (_entries[_entries.length - 1]?.score ?? 0);
  }

  function addEntry(initials, score, level) {
    const clean = String(initials).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3).padEnd(3, '-');
    const date  = new Date().toISOString().slice(0, 10);
    _entries.push({ initials: clean, score, level, date });
    _entries.sort((a, b) => b.score - a.score);
    _entries = _entries.slice(0, MAX_ENTRIES);
    _save();
    // Return rank (1-based)
    return _entries.findIndex(e => e.initials === clean && e.score === score) + 1;
  }

  function getTop(n = MAX_ENTRIES) {
    return _entries.slice(0, n);
  }

  function clear() {
    _entries = [];
    _save();
  }

  function getRank(score) {
    const sorted = [..._entries, { score }].sort((a, b) => b.score - a.score);
    return sorted.findIndex(e => e.score === score) + 1;
  }

  return { init, isHighScore, addEntry, getTop, clear, getRank };

})();
