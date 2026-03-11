// ============================================================
// KANJI DOJO — app.js
// All UI logic, quiz engine, canvas drawing, persistence
// ============================================================

/* ── STATE ─────────────────────────────────────────────── */
const state = {
  activeLevels: new Set(),
  quizType: 'kanji',
  currentQuiz: null,
  qCorrect: 0,
  qTotal: 0,
  activity: [],        // [{kanji/word, correct, timestamp}]
  mastered: {},        // {kanji: correctCount}
  writeIndex: 0,
  strokeWidth: 4,
  gridVisible: true,
  drawing: false,
  lastX: 0,
  lastY: 0,
};

/* ── PERSISTENCE ────────────────────────────────────────── */
function saveState() {
  try {
    localStorage.setItem('kanji_dojo_mastered', JSON.stringify(state.mastered));
    localStorage.setItem('kanji_dojo_activity', JSON.stringify(state.activity.slice(-30)));
    localStorage.setItem('kanji_dojo_score', JSON.stringify({c: state.qCorrect, t: state.qTotal}));
  } catch(e) {}
}
function loadState() {
  try {
    const m = localStorage.getItem('kanji_dojo_mastered');
    if (m) state.mastered = JSON.parse(m);
    const a = localStorage.getItem('kanji_dojo_activity');
    if (a) state.activity = JSON.parse(a);
    const s = localStorage.getItem('kanji_dojo_score');
    if (s) { const sc = JSON.parse(s); state.qCorrect = sc.c; state.qTotal = sc.t; }
  } catch(e) {}
}

/* ── PANEL NAVIGATION ───────────────────────────────────── */
const PANELS = ['dash','kanji','vocab','phrases','sentences','quiz','write'];
function showPanel(id) {
  PANELS.forEach(p => {
    document.getElementById('panel-'+p).classList.toggle('active', p === id);
  });
  document.querySelectorAll('nav button').forEach((b,i) => {
    b.classList.toggle('active', i === PANELS.indexOf(id));
  });
  if (id === 'dash') renderDashboard();
  if (id === 'quiz') nextQuestion();
}

/* ── TOAST ──────────────────────────────────────────────── */
function showToast(msg, dur=2200) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

/* ── KANJI PANEL ────────────────────────────────────────── */
function toggleLevel(lvl) {
  if (state.activeLevels.has(lvl)) state.activeLevels.delete(lvl);
  else state.activeLevels.add(lvl);
  document.getElementById('btn-'+lvl.toLowerCase()).classList.toggle('on', state.activeLevels.has(lvl));
  renderKanji();
}

function renderKanji() {
  const q = document.getElementById('kanji-search').value.toLowerCase().trim();
  const cat = document.getElementById('kanji-cat').value;
  let list = KANJI_DB.filter(k => {
    if (state.activeLevels.size > 0 && !state.activeLevels.has(k.level)) return false;
    if (cat && k.category !== cat) return false;
    if (q) {
      return k.kanji.includes(q) || k.meaning.toLowerCase().includes(q) || k.readings.some(r => r.includes(q));
    }
    return true;
  });
  const grid = document.getElementById('kanji-grid');
  if (list.length === 0) {
    grid.innerHTML = '<div style="color:var(--sepia);padding:2rem;grid-column:1/-1">No kanji found for that search.</div>';
    return;
  }
  grid.innerHTML = list.map(k => {
    const isMastered = (state.mastered[k.kanji] || 0) >= 3;
    const hasStrokes = k.strokes > 0;
    return `<div class="kanji-card" onclick="openKanjiModal('${k.kanji.replace(/'/g,"\\'")}')">
      ${isMastered ? '<div class="mastered-badge">★ Known</div>' : ''}
      <span class="kanji-big">${k.kanji}</span>
      <div class="kanji-meaning">${k.meaning}</div>
      <div class="kanji-reading">${k.readings.join(' · ')}</div>
      <div class="kanji-meta">
        <span class="tag ${k.level.toLowerCase()}">${k.level}</span>
        <span class="tag">${k.category}</span>
      </div>
      ${hasStrokes ? `<button class="kanji-stroke-btn" onclick="event.stopPropagation();openStrokePopup('${k.kanji.replace(/'/g,"\\'")}')">✍ Strokes (${k.strokes})</button>` : ''}
    </div>`;
  }).join('');
}

function populateKanjiCats() {
  const cats = [...new Set(KANJI_DB.map(k => k.category))].sort();
  const sel = document.getElementById('kanji-cat');
  cats.forEach(c => { const o = document.createElement('option'); o.value=c; o.textContent=c; sel.appendChild(o); });
}

/* ── KANJI MODAL ─────────────────────────────────────────── */
function openKanjiModal(kanjiChar) {
  const k = KANJI_DB.find(x => x.kanji === kanjiChar);
  if (!k) return;
  document.getElementById('modal-kanji-char').textContent = k.kanji;

  // related vocabulary
  const relVocab = VOCABULARY.filter(v => v.word.includes(k.kanji) || (v.example && v.example.includes(k.kanji)));

  document.getElementById('modal-info').innerHTML = `
    <div class="info-block"><label>Meaning</label><span>${k.meaning}</span></div>
    <div class="info-block"><label>Readings</label><span>${k.readings.join(', ')}</span></div>
    <div class="info-block"><label>Category</label><span>${k.category}</span></div>
    <div class="info-block"><label>JLPT / Strokes</label><span class="tag ${k.level.toLowerCase()}" style="font-size:.85rem">${k.level}</span> <span class="tag">${k.strokes || '?'} strokes</span></div>
  `;

  const relSentences = SENTENCES.filter(s => s.japanese.includes(k.kanji)).slice(0, 3);

  document.getElementById('modal-examples').innerHTML = `
    <div class="modal-stroke-section">
      <h4>✍ Stroke Order</h4>
      <div id="modal-stroke-diagram" style="text-align:center"></div>
    </div>
    <h4 style="margin-top:1.2rem">Vocabulary using 「${k.kanji}」</h4>
    ${relVocab.length ? relVocab.slice(0,4).map(v => `
      <div class="example-item">
        <div class="ex-word">${v.word}</div>
        <div class="ex-reading">${v.reading}</div>
        <div class="ex-meaning">${v.meaning}</div>
        <div class="ex-sentence">${v.example}</div>
        <div class="ex-sentence-tr">${v.exampleMeaning}</div>
      </div>`).join('') : '<div style="color:var(--sepia);font-size:.82rem">No example vocabulary found.</div>'}
    ${relSentences.length ? `<h4 style="margin-top:1rem">Example Sentences</h4>` + relSentences.map(s => `
      <div class="example-item">
        <div class="ex-sentence" style="border:none;padding:0">${s.japanese}</div>
        <div class="ex-sentence-tr">${s.reading}</div>
        <div class="ex-sentence-tr" style="margin-top:.2rem;font-style:normal">${s.english}</div>
      </div>`).join('') : ''}
  `;

  document.getElementById('modal-overlay').classList.add('open');

  // Load stroke order after modal opens (async)
  if (k.strokes > 0) {
    renderStrokeOrder(k.kanji, document.getElementById('modal-stroke-diagram'), 200);
  } else {
    document.getElementById('modal-stroke-diagram').innerHTML =
      '<div style="color:var(--sepia);font-size:.78rem;font-style:italic">Stroke data only available for single kanji characters.</div>';
  }
}

function closeModal(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModalDirect();
}
function closeModalDirect() {
  document.getElementById('modal-overlay').classList.remove('open');
}

/* ── VOCABULARY PANEL ────────────────────────────────────── */
function populateVocabCats() {
  const cats = [...new Set(VOCABULARY.map(v => v.category))].sort();
  const sel = document.getElementById('vocab-cat');
  cats.forEach(c => { const o = document.createElement('option'); o.value=c; o.textContent=c; sel.appendChild(o); });
}

function renderVocab() {
  const q = document.getElementById('vocab-search').value.toLowerCase().trim();
  const cat = document.getElementById('vocab-cat').value;
  let list = VOCABULARY.filter(v => {
    if (cat && v.category !== cat) return false;
    if (q) return v.word.includes(q) || v.meaning.toLowerCase().includes(q) || v.reading.includes(q) || v.example.includes(q);
    return true;
  });
  const el = document.getElementById('vocab-list');
  if (!list.length) { el.innerHTML='<div style="color:var(--sepia);padding:1rem">No vocabulary found.</div>'; return; }
  el.innerHTML = list.map(v => `
    <div class="vocab-item">
      <div>
        <div class="vocab-word">${v.word}</div>
        <div class="vocab-reading">${v.reading}</div>
        <div class="vocab-meaning">${v.meaning}</div>
        <span class="tag">${v.category}</span>
      </div>
      <div>
        <div class="vocab-example">${v.example}</div>
        <div class="vocab-reading" style="margin-top:.2rem">${v.exampleReading}</div>
      </div>
      <div>
        <div class="vocab-example-tr" style="font-size:.88rem;color:var(--ink-light)">${v.exampleMeaning}</div>
      </div>
    </div>`).join('');
}

/* ── PHRASES PANEL ────────────────────────────────────────── */
function populatePhraseCats() {
  const cats = [...new Set(PHRASES.map(p => p.category))].sort();
  const sel = document.getElementById('phrase-cat');
  cats.forEach(c => { const o = document.createElement('option'); o.value=c; o.textContent=c; sel.appendChild(o); });
}

function renderPhrases() {
  const q = document.getElementById('phrase-search').value.toLowerCase().trim();
  const cat = document.getElementById('phrase-cat').value;
  let list = PHRASES.filter(p => {
    if (cat && p.category !== cat) return false;
    if (q) return p.phrase.includes(q) || p.meaning.toLowerCase().includes(q) || p.romaji.toLowerCase().includes(q);
    return true;
  });
  const el = document.getElementById('phrase-list');
  if (!list.length) { el.innerHTML='<div style="color:var(--sepia);padding:1rem">No phrases found.</div>'; return; }
  el.innerHTML = list.map((p, i) => `
    <div class="phrase-card" id="pc-${i}" onclick="togglePhrase(${i})">
      <div class="phrase-jp">${p.phrase}</div>
      <div class="phrase-romaji">${p.romaji}</div>
      <div class="phrase-en">${p.meaning}</div>
      <div class="phrase-notes">${p.notes}</div>
      <div class="phrase-toggle">▶ Usage note</div>
    </div>`).join('');
}

function togglePhrase(i) {
  document.getElementById('pc-'+i).classList.toggle('expanded');
}

/* ── SENTENCES PANEL ──────────────────────────────────────── */
function renderSentences() {
  const q = document.getElementById('sentence-search').value.toLowerCase().trim();
  const lvl = document.getElementById('sentence-level').value;
  let list = SENTENCES.filter(s => {
    if (lvl && s.level !== lvl) return false;
    if (q) return s.japanese.includes(q) || s.english.toLowerCase().includes(q) || s.reading.includes(q);
    return true;
  });
  const el = document.getElementById('sentence-list');
  if (!list.length) { el.innerHTML='<div style="color:var(--sepia);padding:1rem">No sentences found.</div>'; return; }
  el.innerHTML = list.map((s, i) => `
    <div class="sentence-card" id="sc-${i}">
      <div class="sentence-jp">${s.japanese}</div>
      <div class="sentence-reading">${s.reading}</div>
      <div class="sentence-en">${s.english}</div>
      <div class="sentence-tags">
        <span class="tag">${s.level}</span>
        <span class="tag">${s.category}</span>
      </div>
      <div class="sentence-actions">
        <button class="btn-reveal" onclick="toggleReading(${i})">Reading</button>
        <button class="btn-reveal" onclick="toggleTranslation(${i})">Translation</button>
      </div>
    </div>`).join('');
}

function toggleReading(i) {
  document.getElementById('sc-'+i).classList.toggle('show-reading');
}
function toggleTranslation(i) {
  document.getElementById('sc-'+i).classList.toggle('show-en');
}
function revealAll() {
  document.querySelectorAll('.sentence-card').forEach(c => {
    c.classList.add('show-reading','show-en');
  });
}
function hideAll() {
  document.querySelectorAll('.sentence-card').forEach(c => {
    c.classList.remove('show-reading','show-en');
  });
}

/* ── QUIZ ENGINE ─────────────────────────────────────────── */
function setQuizType(type) {
  state.quizType = type;
  document.getElementById('qtype-kanji').classList.toggle('active', type==='kanji');
  document.getElementById('qtype-vocab').classList.toggle('active', type==='vocab');
  nextQuestion();
}

function nextQuestion() {
  const q = state.quizType === 'kanji'
    ? generateKanjiQuiz(
        KANJI_DB[Math.floor(Math.random()*KANJI_DB.length)],
        KANJI_DB
      )
    : generateVocabQuiz(
        VOCABULARY[Math.floor(Math.random()*VOCABULARY.length)],
        VOCABULARY
      );
  state.currentQuiz = q;

  document.getElementById('q-label').textContent = state.quizType === 'kanji' ? 'Kanji Question' : 'Vocabulary Question';
  document.getElementById('q-char').textContent = state.quizType === 'kanji' ? q.item.kanji : q.item.word;
  document.getElementById('q-question').textContent = q.question;

  const hintEl = document.getElementById('q-hint');
  hintEl.classList.remove('revealed');
  document.getElementById('hint-text').textContent = q.hint;

  document.getElementById('q-result').textContent = '';
  document.getElementById('q-result').className = 'quiz-result';
  document.getElementById('q-next').style.display = 'none';

  const opts = document.getElementById('q-options');
  opts.innerHTML = q.options.map((opt, i) => `
    <button class="quiz-opt" id="qo-${i}" onclick="answerQuiz(${i},'${escQ(opt)}')">${opt}</button>
  `).join('');
}

function escQ(s) { return s.replace(/'/g,"\\'").replace(/"/g,'&quot;'); }

function revealHint() {
  document.getElementById('q-hint').classList.add('revealed');
}

function answerQuiz(idx, answer) {
  const q = state.currentQuiz;
  const correct = answer === q.correct;
  state.qTotal++;
  if (correct) {
    state.qCorrect++;
    const key = state.quizType === 'kanji' ? q.item.kanji : q.item.word;
    state.mastered[key] = (state.mastered[key] || 0) + 1;
  }

  // record activity
  const key = state.quizType === 'kanji' ? q.item.kanji : q.item.word;
  state.activity.unshift({ key, correct, ts: Date.now() });
  state.activity = state.activity.slice(0, 30);

  // style options
  document.querySelectorAll('.quiz-opt').forEach((btn, i) => {
    btn.disabled = true;
    if (btn.textContent === q.correct) btn.classList.add('correct');
    else if (i === idx && !correct) btn.classList.add('wrong');
  });

  const res = document.getElementById('q-result');
  res.textContent = correct ? '✓ Correct!' : `✗ The answer was: ${q.correct}`;
  res.className = 'quiz-result ' + (correct ? 'correct' : 'wrong');
  document.getElementById('q-next').style.display = 'inline-block';

  updateScoreUI();
  saveState();
}

function updateScoreUI() {
  document.getElementById('q-correct').textContent = state.qCorrect;
  document.getElementById('q-total').textContent = state.qTotal;
  document.getElementById('stat-quiz').textContent = state.qCorrect;
  // ring
  const pct = state.qTotal > 0 ? state.qCorrect / state.qTotal : 0;
  const circ = 150.8;
  document.getElementById('ring-fill').setAttribute('stroke-dashoffset', circ - pct*circ);
  document.getElementById('ring-fill').setAttribute('stroke', pct >= 0.7 ? 'var(--sage)' : pct >= 0.5 ? 'var(--gold)' : 'var(--vermillion)');
}

/* ── WRITING PANEL ─────────────────────────────────────────── */
let writableKanji = [];   // full list (single chars only)
let filteredWriteKanji = []; // current filtered view
let writeActiveCat = '';  // currently active category filter

function buildWritableList() {
  writableKanji = KANJI_DB.filter(k => k.strokes > 0);
  filteredWriteKanji = [...writableKanji];
}

/* Build the category pill buttons */
function buildWriteCats() {
  const cats = [...new Set(writableKanji.map(k => k.category))].sort();
  const wrap = document.getElementById('write-cats');
  wrap.innerHTML = cats.map(c =>
    `<button class="write-picker-cat" id="wcat-${cssId(c)}" onclick="toggleWriteCat('${c}')">${c}</button>`
  ).join('');
}

function cssId(s) { return s.replace(/\s+/g,'_'); }

function toggleWriteCat(cat) {
  writeActiveCat = (writeActiveCat === cat) ? '' : cat;
  document.querySelectorAll('.write-picker-cat').forEach(b => b.classList.remove('on'));
  if (writeActiveCat) {
    const el = document.getElementById('wcat-'+cssId(writeActiveCat));
    if (el) el.classList.add('on');
  }
  renderWritePicker();
}

/* Render the scrollable kanji picker grid */
function renderWritePicker() {
  const q = document.getElementById('write-search').value.trim().toLowerCase();
  filteredWriteKanji = writableKanji.filter(k => {
    if (writeActiveCat && k.category !== writeActiveCat) return false;
    if (q) {
      return k.kanji.includes(q)
        || k.meaning.toLowerCase().includes(q)
        || k.readings.some(r => r.includes(q))
        || k.level.toLowerCase() === q
        || k.category.toLowerCase().includes(q);
    }
    return true;
  });

  const grid = document.getElementById('write-picker-grid');
  document.getElementById('write-pick-count').textContent =
    `${filteredWriteKanji.length} kanji`;

  if (!filteredWriteKanji.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;color:var(--sepia);font-size:.8rem;padding:.5rem">No results</div>`;
    return;
  }

  grid.innerHTML = filteredWriteKanji.map((k, i) => {
    const isActive = state.writeIndex === writableKanji.indexOf(k);
    return `<button class="write-pick-btn${isActive?' active':''}"
      title="${k.meaning} · ${k.readings[0]}"
      onclick="selectWriteKanji('${k.kanji.replace(/'/g,"\\'")}')">
      ${k.kanji}
    </button>`;
  }).join('');
}

/* Select a kanji by character value */
function selectWriteKanji(char) {
  const idx = writableKanji.findIndex(k => k.kanji === char);
  if (idx === -1) return;
  setWriteKanji(idx);
  // re-render picker so active state updates
  renderWritePicker();
}

function setWriteKanji(idx) {
  state.writeIndex = ((idx % writableKanji.length) + writableKanji.length) % writableKanji.length;
  const k = writableKanji[state.writeIndex];
  document.getElementById('write-kanji-char').textContent = k.kanji;
  document.getElementById('write-kanji-info').innerHTML = `
    <strong>${k.meaning}</strong><br>
    <span style="color:var(--indigo);font-family:'IBM Plex Mono',monospace">${k.readings.join(' · ')}</span><br>
    <div style="margin-top:.4rem;display:flex;gap:.3rem;justify-content:center;flex-wrap:wrap">
      <span class="tag ${k.level.toLowerCase()}">${k.level}</span>
      <span class="tag">${k.category}</span>
      ${k.strokes ? `<span class="tag">${k.strokes} strokes</span>` : ''}
    </div>
  `;
  // position in the full list
  const pos = filteredWriteKanji.indexOf(k);
  const posLabel = pos >= 0 ? `${pos+1} / ${filteredWriteKanji.length}` : `${state.writeIndex+1} / ${writableKanji.length}`;
  document.getElementById('write-counter').textContent = posLabel;
  clearCanvas();

  // Render stroke order into writing panel diagram
  const diagContainer = document.getElementById('write-stroke-content');
  if (diagContainer) {
    renderStrokeOrder(k.kanji, diagContainer, 185);
  }

  // scroll selected button into view
  setTimeout(() => {
    const active = document.querySelector('.write-pick-btn.active');
    if (active) active.scrollIntoView({block:'nearest', behavior:'smooth'});
  }, 50);
}

function prevWriteKanji() {
  // navigate within filtered list if there is one
  if (filteredWriteKanji.length > 0) {
    const cur = filteredWriteKanji.indexOf(writableKanji[state.writeIndex]);
    const next = (cur - 1 + filteredWriteKanji.length) % filteredWriteKanji.length;
    selectWriteKanji(filteredWriteKanji[next].kanji);
  } else {
    setWriteKanji(state.writeIndex - 1);
    renderWritePicker();
  }
}
function nextWriteKanji() {
  if (filteredWriteKanji.length > 0) {
    const cur = filteredWriteKanji.indexOf(writableKanji[state.writeIndex]);
    const next = (cur + 1) % filteredWriteKanji.length;
    selectWriteKanji(filteredWriteKanji[next].kanji);
  } else {
    setWriteKanji(state.writeIndex + 1);
    renderWritePicker();
  }
}
function randomWriteKanji() {
  const pool = filteredWriteKanji.length > 0 ? filteredWriteKanji : writableKanji;
  const pick = pool[Math.floor(Math.random()*pool.length)];
  selectWriteKanji(pick.kanji);
}

/* ── CANVAS DRAWING ─────────────────────────────────────────── */
function initCanvas() {
  const canvas = document.getElementById('draw-canvas');
  const ctx = canvas.getContext('2d');

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return [(src.clientX - r.left) * (canvas.width/r.width), (src.clientY - r.top) * (canvas.height/r.height)];
  }

  function startDraw(e) {
    e.preventDefault();
    state.drawing = true;
    const [x,y] = getPos(e);
    state.lastX = x; state.lastY = y;
    ctx.beginPath();
    ctx.arc(x, y, state.strokeWidth/2, 0, Math.PI*2);
    ctx.fillStyle = '#1a1008';
    ctx.fill();
  }
  function draw(e) {
    e.preventDefault();
    if (!state.drawing) return;
    const [x,y] = getPos(e);
    ctx.beginPath();
    ctx.moveTo(state.lastX, state.lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1a1008';
    ctx.lineWidth = state.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    state.lastX = x; state.lastY = y;
  }
  function endDraw(e) { e.preventDefault(); state.drawing = false; }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);
  canvas.addEventListener('touchstart', startDraw, {passive:false});
  canvas.addEventListener('touchmove', draw, {passive:false});
  canvas.addEventListener('touchend', endDraw, {passive:false});
}

function clearCanvas() {
  const canvas = document.getElementById('draw-canvas');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function toggleGrid() {
  state.gridVisible = !state.gridVisible;
  document.getElementById('canvas-grid').style.opacity = state.gridVisible ? '.15' : '0';
}

function changeStroke(delta) {
  state.strokeWidth = Math.max(2, Math.min(14, state.strokeWidth + delta*2));
  showToast(`Stroke width: ${state.strokeWidth}`);
}

/* ── DASHBOARD ───────────────────────────────────────────────── */
function renderDashboard() {
  document.getElementById('stat-kanji').textContent = KANJI_DB.length;
  document.getElementById('stat-vocab').textContent = VOCABULARY.length;
  document.getElementById('stat-phrases').textContent = PHRASES.length;
  document.getElementById('stat-quiz').textContent = state.qCorrect;
  const mastered = Object.values(state.mastered).filter(v => v >= 3).length;
  document.getElementById('stat-mastered').textContent = mastered;

  // level bars
  const levels = ['N5','N4','N3'];
  const colors = ['var(--sage)','var(--indigo)','var(--gold)'];
  const total = KANJI_DB.length;
  document.getElementById('level-bars').innerHTML = levels.map((lvl, i) => {
    const count = KANJI_DB.filter(k => k.level === lvl).length;
    const pct = Math.round(count/total*100);
    return `<div class="level-bar-row">
      <span class="level-bar-label">${lvl}</span>
      <div class="level-bar-bg"><div class="level-bar-fill" style="width:${pct}%;background:${colors[i]}"></div></div>
      <span style="font-size:.78rem;color:var(--sepia);width:30px;text-align:right">${count}</span>
    </div>`;
  }).join('');

  // activity list
  const al = document.getElementById('activity-list');
  if (!state.activity.length) {
    al.innerHTML = '<div style="color:var(--sepia);font-size:.85rem">No activity yet — take a quiz!</div>';
    return;
  }
  al.innerHTML = state.activity.slice(0,8).map(a => `
    <div class="activity-row">
      <div class="act-kanji">${a.key}</div>
      <div class="act-info">${a.correct ? 'Answered correctly' : 'Got it wrong'}</div>
      <div class="act-result ${a.correct?'c':'w'}">${a.correct?'✓':'✗'}</div>
    </div>`).join('');
}

/* ── KEYBOARD SHORTCUTS ──────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModalDirect();
  if (e.key === 'Enter' && document.getElementById('panel-quiz').classList.contains('active')) {
    const nxt = document.getElementById('q-next');
    if (nxt.style.display !== 'none') nextQuestion();
  }
  if (document.getElementById('panel-write').classList.contains('active')) {
    if (e.key === 'ArrowLeft') prevWriteKanji();
    if (e.key === 'ArrowRight') nextWriteKanji();
    if (e.key === 'Delete' || e.key === 'Backspace') clearCanvas();
  }
});

/* ── INIT ────────────────────────────────────────────────────── */
(function init() {
  loadState();
  populateKanjiCats();
  populateVocabCats();
  populatePhraseCats();
  renderKanji();
  renderVocab();
  renderPhrases();
  renderSentences();
  buildWritableList();
  buildWriteCats();
  renderWritePicker();
  setWriteKanji(0);
  initCanvas();
  renderDashboard();
  updateScoreUI();
  nextQuestion();
  // stagger level bar animation
  setTimeout(() => {
    document.querySelectorAll('.level-bar-fill').forEach(el => {
      const w = el.style.width;
      el.style.width = '0';
      setTimeout(() => el.style.width = w, 100);
    });
  }, 300);
})();
