/**
 * scoreTracker.js
 * Tracks score, streak, answer history, and per-operation accuracy.
 * Persists high scores and stats to localStorage.
 */

const ScoreTracker = (() => {

  const STORAGE_KEY_HISCORE = 'mathInvaders_hiScore';
  const STORAGE_KEY_STATS   = 'mathInvaders_stats';

  // ── Session state ──────────────────────────────────
  let session = resetSession();

  function resetSession() {
    return {
      score:        0,
      level:        1,
      lives:        CONFIG.PLAYER_LIVES,
      streak:       0,
      maxStreak:    0,
      totalAnswers: 0,
      correctCount: 0,
      wrongCount:   0,
      startTime:    Date.now(),
      elapsed:      0,

      // Per-operation stats
      opStats: {
        '+': { correct: 0, wrong: 0 },
        '-': { correct: 0, wrong: 0 },
        '×': { correct: 0, wrong: 0 },
        '÷': { correct: 0, wrong: 0 },
      },

      // Answer history: array of { question, correct, given, wasCorrect, op, time }
      history: [],
    };
  }

  // ── Persistence ────────────────────────────────────
  function loadHiScore() {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY_HISCORE) || '0', 10);
    } catch { return 0; }
  }

  function saveHiScore(score) {
    try { localStorage.setItem(STORAGE_KEY_HISCORE, String(score)); } catch {}
  }

  function loadAllTimeStats() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_STATS) || 'null') || {
        gamesPlayed: 0,
        totalCorrect: 0,
        totalWrong: 0,
        opStats: { '+': {correct:0,wrong:0}, '-': {correct:0,wrong:0}, '×': {correct:0,wrong:0}, '÷': {correct:0,wrong:0} },
      };
    } catch { return { gamesPlayed:0, totalCorrect:0, totalWrong:0, opStats:{'+': {correct:0,wrong:0}, '-': {correct:0,wrong:0}, '×': {correct:0,wrong:0}, '÷': {correct:0,wrong:0}} }; }
  }

  function saveAllTimeStats(stats) {
    try { localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats)); } catch {}
  }

  // ── Public API ─────────────────────────────────────

  function start() {
    session = resetSession();
    session.startTime = Date.now();
  }

  function recordAnswer({ question, answer, given, operation, wasCorrect }) {
    session.totalAnswers++;
    session.history.push({
      question,
      correct:   answer,
      given,
      wasCorrect,
      operation,
      time:      Date.now() - session.startTime,
    });

    if (wasCorrect) {
      session.correctCount++;
      session.streak++;
      if (session.streak > session.maxStreak) session.maxStreak = session.streak;

      const base    = CONFIG.SCORE_CORRECT;
      const streakB = Math.floor(session.streak * CONFIG.SCORE_STREAK_MUL * base / 100) * 10;
      session.score += base + streakB;
      session.opStats[operation].correct++;
    } else {
      session.wrongCount++;
      session.streak = 0;
      session.score  = Math.max(0, session.score + CONFIG.SCORE_WRONG);
      session.opStats[operation].wrong++;
    }

    updateHUD();
    return session.score;
  }

  function recordBombHit() {
    session.lives = Math.max(0, session.lives - 1);
    session.score = Math.max(0, session.score + CONFIG.SCORE_BOMB_HIT);
    updateHUD();
  }

  function setLevel(lvl) {
    session.level = lvl;
    updateHUD();
  }

  function end() {
    session.elapsed = Date.now() - session.startTime;

    // Update high score
    const prev = loadHiScore();
    if (session.score > prev) saveHiScore(session.score);

    // Merge all-time stats
    const allTime = loadAllTimeStats();
    allTime.gamesPlayed++;
    allTime.totalCorrect += session.correctCount;
    allTime.totalWrong   += session.wrongCount;
    for (const op of Object.keys(session.opStats)) {
      allTime.opStats[op].correct += session.opStats[op].correct;
      allTime.opStats[op].wrong   += session.opStats[op].wrong;
    }
    saveAllTimeStats(allTime);

    return getSummary();
  }

  function getSummary() {
    const accuracy = session.totalAnswers > 0
      ? Math.round((session.correctCount / session.totalAnswers) * 100)
      : 0;
    return {
      score:       session.score,
      level:       session.level,
      lives:       session.lives,
      streak:      session.streak,
      maxStreak:   session.maxStreak,
      totalAnswers:session.totalAnswers,
      correctCount:session.correctCount,
      wrongCount:  session.wrongCount,
      accuracy,
      elapsed:     session.elapsed || (Date.now() - session.startTime),
      opStats:     { ...session.opStats },
      history:     [...session.history],
      hiScore:     loadHiScore(),
      allTime:     loadAllTimeStats(),
    };
  }

  function getScore()  { return session.score; }
  function getLives()  { return session.lives; }
  function getLevel()  { return session.level; }
  function getStreak() { return session.streak; }

  // ── HUD DOM updates ────────────────────────────────
  function updateHUD() {
    const el = (id) => document.getElementById(id);
    if (el('score-value'))  el('score-value').textContent  = String(session.score).padStart(6, '0');
    if (el('level-value'))  el('level-value').textContent  = session.level;
    if (el('streak-value')) el('streak-value').textContent = session.streak;
    if (el('lives-value'))  {
      el('lives-value').textContent = '♥ '.repeat(session.lives).trim() || '—';
    }
  }

  function updateQuestion(text) {
    const panel = document.getElementById('question-panel');
    const qt    = document.getElementById('question-text');
    if (qt && text) {
      qt.textContent = text;
      if (panel) panel.classList.add('visible');
    }
  }

  function updateInput(val) {
    const el = document.getElementById('input-display');
    if (el) el.textContent = val === '' ? '_' : val;
  }

  function flashScreen(correct) {
    const wrapper = document.getElementById('game-wrapper');
    if (!wrapper) return;
    const cls = correct ? 'flash-correct' : 'flash-wrong';
    wrapper.classList.remove('flash-correct', 'flash-wrong');
    void wrapper.offsetWidth; // reflow
    wrapper.classList.add(cls);
    setTimeout(() => wrapper.classList.remove(cls), 400);
  }

  function showHUD() {
    document.getElementById('question-panel')?.classList.add('visible');
    document.getElementById('input-row')?.classList.add('visible');
  }

  function hideHUD() {
    document.getElementById('question-panel')?.classList.remove('visible');
    document.getElementById('input-row')?.classList.remove('visible');
  }

  return {
    start,
    recordAnswer,
    recordBombHit,
    setLevel,
    end,
    getSummary,
    getScore,
    getLives,
    getLevel,
    getStreak,
    updateHUD,
    updateQuestion,
    updateInput,
    flashScreen,
    showHUD,
    hideHUD,
    loadHiScore,
  };

})();
