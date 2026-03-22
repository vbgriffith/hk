/* ═══════════════════════════════════════════════════════
   SCRIPTURE — Offline Bible App  ·  app.js
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ── State ── */
const App = {
  version: 'KJV',
  bookIdx: 0,
  chapterIdx: 0,
  data: {},           // { KJV: {...}, ASV: {...}, ... }
  loaded: {},         // which translations are loaded
  prefs: {},          // persisted preferences
  bookmarks: [],
  highlights: {},     // { 'KJV-0-0-4': 'hl-yellow', ... }
  notes: {},          // { 'KJV-0-0-4': 'text', ... }
  planProgress: {},   // { planId: { day: N, done: [dayIdx,...] } }
  activePanel: null,
  selectedVerse: null,
  searchTimeout: null,
  readingMode: 'verse',   // 'verse' | 'para'
  sidebarOpen: true,
  currentTribe: 'OT',     // 'OT' | 'NT'
  bookGridVisible: false,
};

/* ── Daily verse pool (KJV references) ── */
const DAILY_VERSE_POOL = [
  [18,22,0],[18,22,1],[18,22,5],[18,22,6],   // Ps 23
  [42,3,15],[42,3,16],                        // John 3
  [5,31,7],[5,31,8],                          // Deut 31
  [22,40,27],[22,40,28],[22,40,30],[22,40,31],// Isa 40
  [45,8,37],[45,8,38],[45,8,39],              // Rom 8
  [49,4,12],[49,4,13],                        // Phil 4
  [19,45,0],[19,45,1],                        // Ps 46
  [19,90,0],[19,90,1],                        // Ps 91
  [19,118,24],                                // Ps 119
  [41,11,27],[41,11,28],                      // Matt 11
  [6,1,8],[6,1,9],                            // Josh 1
  [19,27,0],[19,27,3],[19,27,13],             // Ps 27
];

/* ── Reading Plans ── */
const READING_PLANS = [
  {
    id: 'nt-30',
    name: 'New Testament in 30 Days',
    desc: '30 days · NT overview',
    days: [
      ['Matt 1-4'],['Matt 5-7'],['Matt 8-11'],['Matt 12-14'],['Matt 15-18'],
      ['Matt 19-22'],['Matt 23-25'],['Matt 26-28'],['Mark 1-4'],['Mark 5-8'],
      ['Mark 9-12'],['Mark 13-16'],['Luke 1-3'],['Luke 4-6'],['Luke 7-9'],
      ['Luke 10-12'],['Luke 13-16'],['Luke 17-19'],['Luke 20-22'],['Luke 23-24'],
      ['John 1-3'],['John 4-6'],['John 7-9'],['John 10-12'],['John 13-15'],
      ['John 16-18'],['John 19-21'],['Acts 1-3'],['Acts 4-6'],['Acts 7-9'],
    ]
  },
  {
    id: 'psalms-30',
    name: 'Psalms in 30 Days',
    desc: '30 days · 5 Psalms per day',
    days: Array.from({length:30}, (_,i) => [
      `Ps ${i*5+1}-${i*5+5}`
    ])
  },
  {
    id: 'wisdom-21',
    name: 'Wisdom Literature',
    desc: '21 days · Job, Proverbs, Ecclesiastes',
    days: [
      ['Job 1-2'],['Job 3-5'],['Job 6-8'],['Job 9-11'],['Job 12-14'],
      ['Job 15-17'],['Job 18-20'],['Job 38-42'],['Prov 1-3'],['Prov 4-6'],
      ['Prov 7-9'],['Prov 10-12'],['Prov 13-15'],['Prov 16-18'],['Prov 19-21'],
      ['Prov 22-24'],['Prov 25-27'],['Prov 28-31'],['Eccl 1-4'],['Eccl 5-8'],
      ['Eccl 9-12'],
    ]
  },
  {
    id: 'bible-365',
    name: 'Bible in a Year',
    desc: '365 days · Whole Bible',
    days: (() => {
      // Abbreviated — first 30 days shown
      const d = [];
      const otSeq = [
        ['Gen 1-3'],['Gen 4-7'],['Gen 8-11'],['Gen 12-15'],['Gen 16-19'],
        ['Gen 20-23'],['Gen 24-26'],['Gen 27-30'],['Gen 31-34'],['Gen 35-38'],
        ['Gen 39-41'],['Gen 42-45'],['Gen 46-50'],['Exod 1-4'],['Exod 5-8'],
        ['Exod 9-12'],['Exod 13-16'],['Exod 17-20'],['Exod 21-24'],['Exod 25-28'],
        ['Exod 29-32'],['Exod 33-36'],['Exod 37-40'],['Lev 1-4'],['Lev 5-8'],
        ['Lev 9-12'],['Lev 13-16'],['Lev 17-20'],['Lev 21-24'],['Lev 25-27'],
      ];
      return otSeq;
    })()
  },
];

/* ── Book name helpers ── */
const DISPLAY_NAMES = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
  'Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon',
  'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos',
  'Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah',
  'Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians',
  '2 Corinthians','Galatians','Ephesians','Philippians','Colossians',
  '1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon',
  'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
];

/* ── Abbreviation → index lookup ── */
const ABBREV_INDEX = {};
const FULL_INDEX   = {};

/* ── Utility ── */
const $ = id => document.getElementById(id);
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function verseKey(v, b, c, vs) { return `${v}-${b}-${c}-${vs}`; }
function todayStr() { return new Date().toISOString().slice(0,10); }
function fmtDate(iso) {
  const d = new Date(iso); return d.toLocaleDateString(undefined, {month:'short',day:'numeric'});
}

/* ── LocalStorage persistence ── */
function save() {
  try {
    localStorage.setItem('scripture_prefs',      JSON.stringify(App.prefs));
    localStorage.setItem('scripture_bookmarks',   JSON.stringify(App.bookmarks));
    localStorage.setItem('scripture_highlights',  JSON.stringify(App.highlights));
    localStorage.setItem('scripture_notes',       JSON.stringify(App.notes));
    localStorage.setItem('scripture_planprogress',JSON.stringify(App.planProgress));
    localStorage.setItem('scripture_position',    JSON.stringify({
      version: App.version, bookIdx: App.bookIdx, chapterIdx: App.chapterIdx
    }));
  } catch(e) {}
}

function loadStorage() {
  try {
    App.prefs         = JSON.parse(localStorage.getItem('scripture_prefs') || '{}');
    App.bookmarks     = JSON.parse(localStorage.getItem('scripture_bookmarks') || '[]');
    App.highlights    = JSON.parse(localStorage.getItem('scripture_highlights') || '{}');
    App.notes         = JSON.parse(localStorage.getItem('scripture_notes') || '{}');
    App.planProgress  = JSON.parse(localStorage.getItem('scripture_planprogress') || '{}');
    const pos = JSON.parse(localStorage.getItem('scripture_position') || '{}');
    if (pos.version) App.version = pos.version;
    if (pos.bookIdx !== undefined) App.bookIdx = pos.bookIdx;
    if (pos.chapterIdx !== undefined) App.chapterIdx = pos.chapterIdx;
  } catch(e) {}
}

/* ── Loading Bible data ── */
const VERSIONS = {
  KJV: { name: 'King James Version',        year: '1769', file: 'data/kjv.js', global: 'BIBLE_KJV' },
  ASV: { name: 'American Standard Version', year: '1901', file: 'data/asv.js', global: 'BIBLE_ASV' },
  YLT: { name: "Young's Literal Translation",year:'1898', file: 'data/ylt.js', global: 'BIBLE_YLT' },
  BBE: { name: 'Bible in Basic English',    year: '1949', file: 'data/bbe.js', global: 'BIBLE_BBE' },
};

function setLoadingStatus(msg, pct) {
  const st = $('loading-status'); if (st) st.textContent = msg;
  const bar = $('loading-bar'); if (bar) bar.style.width = pct + '%';
}

function loadVersionScript(vkey) {
  return new Promise((resolve, reject) => {
    if (App.loaded[vkey]) { resolve(); return; }
    const info = VERSIONS[vkey];
    const s = document.createElement('script');
    s.src = info.file;
    s.onload = () => {
      const raw = window['BIBLE_' + vkey];
      if (!raw) { reject(new Error('No data for ' + vkey)); return; }
      App.data[vkey] = raw;
      App.loaded[vkey] = true;
      // Build lookup on first version loaded
      if (Object.keys(App.loaded).length === 1) buildLookup(raw);
      resolve();
    };
    s.onerror = () => reject(new Error('Failed to load ' + info.file));
    document.head.appendChild(s);
  });
}

function buildLookup(data) {
  data.books.forEach((b, i) => {
    ABBREV_INDEX[b.a.toLowerCase()] = i;
    ABBREV_INDEX[b.a] = i;
    FULL_INDEX[b.n.toLowerCase()] = i;
    FULL_INDEX[DISPLAY_NAMES[i].toLowerCase()] = i;
  });
}

async function loadAllVersions() {
  const keys = Object.keys(VERSIONS);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    setLoadingStatus(`Loading ${VERSIONS[k].name}…`, 10 + (i / keys.length) * 80);
    try { await loadVersionScript(k); }
    catch(e) { console.warn('Failed to load', k, e); }
  }
  setLoadingStatus('Ready', 100);
}

/* ── DOM references ── */
let DOM = {};

function cacheDOM() {
  DOM = {
    loading:     $('loading-screen'),
    app:         $('app'),
    passagePill: $('passage-pill'),
    pillText:    qs('#passage-pill .pill-text'),
    versionPill: $('version-pill'),
    versionText: qs('#version-pill span'),
    sidebar:     $('sidebar'),
    bookList:    $('book-list'),
    chapterGrid: $('chapter-grid'),
    chGridWrap:  $('chapter-grid-wrap'),
    chGridTitle: qs('#chapter-grid-wrap .chapter-book-title'),
    verseContainer: $('verse-container'),
    chNavTitle:  qs('#chapter-nav .ch-nav-title'),
    chNavSub:    qs('#chapter-nav .ch-nav-subtitle'),
    btnPrev:     $('btn-prev-ch'),
    btnNext:     $('btn-next-ch'),
    dailyBanner: $('daily-verse-banner'),
    versePopup:  $('verse-popup'),
  };
}

/* ── Initialization ── */
async function init() {
  cacheDOM();
  loadStorage();
  applyPrefs();

  // Load all 4 versions (they're pre-bundled, loading is fast)
  await loadAllVersions();

  // Fade out loading screen
  DOM.loading.classList.add('hidden');
  setTimeout(() => { DOM.loading.style.display = 'none'; }, 500);

  // Build navigation
  buildBookList();
  setDailyVerse();
  renderChapter();
  initEventListeners();
  initPlans();
}

/* ── Apply saved preferences ── */
function applyPrefs() {
  const p = App.prefs;
  if (p.theme) document.body.setAttribute('data-theme', p.theme);
  if (p.fontSize) {
    document.documentElement.style.setProperty('--verse-size', p.fontSize + 'rem');
  }
  if (p.readingMode) App.readingMode = p.readingMode;
  if (p.version) App.version = p.version;
  if (p.redLetter) document.body.setAttribute('data-redletter', 'on');
  App.sidebarOpen = p.sidebarOpen !== false;
}

/* ── Book List ── */
function buildBookList(testament = App.currentTribe) {
  App.currentTribe = testament;
  const books = currentData().books;
  let html = '';
  books.forEach((b, i) => {
    if (b.t !== testament) return;
    const active = i === App.bookIdx ? 'active' : '';
    html += `<div class="book-item ${active}" data-idx="${i}">
      <span class="book-abbr">${esc(b.a)}</span>
      <span class="book-name">${esc(DISPLAY_NAMES[i])}</span>
      <span class="book-chapters">${b.c.length}</span>
    </div>`;
  });
  DOM.bookList.innerHTML = html;

  qsa('.book-item', DOM.bookList).forEach(el => {
    el.addEventListener('click', () => {
      const idx = +el.dataset.idx;
      showChapterGrid(idx);
    });
  });

  // Update testament buttons
  qsa('.testament-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.t === testament);
  });
}

function showChapterGrid(bookIdx) {
  App.bookIdx = bookIdx;
  const book = currentData().books[bookIdx];
  DOM.chGridTitle.textContent = DISPLAY_NAMES[bookIdx];
  DOM.chGridWrap.classList.add('visible');

  let html = '';
  book.c.forEach((_, i) => {
    const active = (i === App.chapterIdx && bookIdx === App.bookIdx) ? 'active' : '';
    html += `<button class="ch-btn ${active}" data-ch="${i}">${i + 1}</button>`;
  });
  DOM.chapterGrid.innerHTML = html;

  qsa('.ch-btn', DOM.chapterGrid).forEach(btn => {
    btn.addEventListener('click', () => {
      App.chapterIdx = +btn.dataset.ch;
      closeChapterGrid();
      if (window.innerWidth < 700) closeSidebar();
      renderChapter();
      save();
    });
  });
}

function closeChapterGrid() {
  DOM.chGridWrap.classList.remove('visible');
}

/* ── Chapter Render ── */
function currentData() {
  return App.data[App.version] || App.data[Object.keys(App.data)[0]] || { books: [] };
}

function renderChapter() {
  const data  = currentData();
  if (!data.books.length) return;
  const book  = data.books[App.bookIdx];
  if (!book) return;
  const verses = book.c[App.chapterIdx];
  if (!verses) return;

  const bookName = DISPLAY_NAMES[App.bookIdx];
  const chNum    = App.chapterIdx + 1;
  const ref      = `${bookName} ${chNum}`;

  // Update topbar
  DOM.pillText.textContent = ref;
  DOM.versionText.textContent = App.version;
  DOM.chNavTitle.textContent  = ref;
  DOM.chNavSub.textContent    = VERSIONS[App.version]?.name || App.version;

  // Prev / Next
  DOM.btnPrev.disabled = App.bookIdx === 0 && App.chapterIdx === 0;
  DOM.btnNext.disabled = (
    App.bookIdx === data.books.length - 1 &&
    App.chapterIdx === data.books[App.bookIdx].c.length - 1
  );

  // Render verses
  const isPara = App.readingMode === 'para';
  let html = `<div class="chapter-heading">${esc(bookName)} ${chNum}</div>`;

  if (isPara) {
    html += '<div class="para-mode">';
    verses.forEach((text, vi) => {
      const key = verseKey(App.version, App.bookIdx, App.chapterIdx, vi);
      const hl  = App.highlights[key] || '';
      const bm  = App.bookmarks.some(b => b.key === key) ? 'bookmarked' : '';
      html += `<span class="verse-row ${hl} ${bm}" data-vi="${vi}">` +
        `<span class="verse-num">${vi + 1}</span>` +
        `<span class="verse-text">${esc(text)} </span>` +
        `</span>`;
    });
    html += '</div>';
  } else {
    verses.forEach((text, vi) => {
      const key = verseKey(App.version, App.bookIdx, App.chapterIdx, vi);
      const hl  = App.highlights[key] || '';
      const bm  = App.bookmarks.some(b => b.key === key) ? 'bookmarked' : '';
      html += `<div class="verse-row ${hl} ${bm}" data-vi="${vi}">` +
        `<span class="verse-num">${vi + 1}</span>` +
        `<div class="verse-text">${esc(text)}</div>` +
        `</div>`;
    });
  }

  DOM.verseContainer.innerHTML = html;
  DOM.verseContainer.scrollTop = 0;

  // Attach verse click listeners
  qsa('.verse-row', DOM.verseContainer).forEach(row => {
    row.addEventListener('click', e => {
      e.stopPropagation();
      selectVerse(+row.dataset.vi, row);
    });
  });

  // Update sidebar active state
  updateSidebarActive();
  updateBookListActive();
  save();
}

function updateSidebarActive() {
  qsa('.ch-btn', DOM.chapterGrid).forEach(btn => {
    btn.classList.toggle('active', +btn.dataset.ch === App.chapterIdx);
  });
}

function updateBookListActive() {
  qsa('.book-item', DOM.bookList).forEach(el => {
    el.classList.toggle('active', +el.dataset.idx === App.bookIdx);
  });
}

/* ── Verse Selection & Popup ── */
function selectVerse(vi, rowEl) {
  // Deselect previous
  qsa('.verse-row.highlighted', DOM.verseContainer).forEach(r => {
    if (+r.dataset.vi !== vi) r.classList.remove('highlighted');
  });

  rowEl.classList.toggle('highlighted');
  App.selectedVerse = rowEl.classList.contains('highlighted') ? vi : null;

  if (App.selectedVerse !== null) {
    showVersePopup(rowEl);
  } else {
    hideVersePopup();
  }
}

function showVersePopup(rowEl) {
  const popup = DOM.versePopup;
  const rect  = rowEl.getBoundingClientRect();
  const popH  = 64;
  let top = rect.top - popH - 8;
  if (top < 60) top = rect.bottom + 8;
  popup.style.top  = top + 'px';
  popup.style.left = Math.max(8, rect.left) + 'px';
  popup.classList.add('visible');
}

function hideVersePopup() {
  DOM.versePopup.classList.remove('visible');
}

function getSelectedRef() {
  if (App.selectedVerse === null) return null;
  const bookName = DISPLAY_NAMES[App.bookIdx];
  const ch = App.chapterIdx + 1;
  const vs = App.selectedVerse + 1;
  return `${bookName} ${ch}:${vs}`;
}

function getSelectedText() {
  if (App.selectedVerse === null) return '';
  const verses = currentData().books[App.bookIdx]?.c[App.chapterIdx];
  return verses ? verses[App.selectedVerse] : '';
}

/* ── Popup Actions ── */
function popupBookmark() {
  const vi  = App.selectedVerse;
  if (vi === null) return;
  const key = verseKey(App.version, App.bookIdx, App.chapterIdx, vi);
  const ref = getSelectedRef();
  const existing = App.bookmarks.findIndex(b => b.key === key);
  if (existing >= 0) {
    App.bookmarks.splice(existing, 1);
    qs(`[data-vi="${vi}"]`, DOM.verseContainer)?.classList.remove('bookmarked');
  } else {
    App.bookmarks.unshift({ key, ref, text: getSelectedText(), date: todayStr() });
    qs(`[data-vi="${vi}"]`, DOM.verseContainer)?.classList.add('bookmarked');
  }
  hideVersePopup();
  save();
}

function popupHighlight(color) {
  const vi  = App.selectedVerse;
  if (vi === null) return;
  const key = verseKey(App.version, App.bookIdx, App.chapterIdx, vi);
  const row = qs(`[data-vi="${vi}"]`, DOM.verseContainer);
  const COLORS = ['hl-yellow','hl-green','hl-blue','hl-pink','hl-purple'];

  if (App.highlights[key] === color) {
    delete App.highlights[key];
    COLORS.forEach(c => row?.classList.remove(c));
  } else {
    App.highlights[key] = color;
    COLORS.forEach(c => row?.classList.remove(c));
    row?.classList.add(color);
  }
  hideVersePopup();
  save();
}

function popupNote() {
  const vi  = App.selectedVerse;
  if (vi === null) return;
  const key = verseKey(App.version, App.bookIdx, App.chapterIdx, vi);
  const ref = getSelectedRef();
  openPanel('notes');
  // Prefill note input
  setTimeout(() => {
    const inp = $('note-input');
    const refLabel = $('note-ref-label');
    if (refLabel) refLabel.textContent = ref;
    if (inp) {
      inp.value = App.notes[key] || '';
      inp.dataset.key = key;
      inp.dataset.ref = ref;
      inp.focus();
    }
  }, 100);
  hideVersePopup();
}

function popupShare() {
  const ref  = getSelectedRef();
  const text = getSelectedText();
  if (!ref) return;
  const shareText = `"${text}" — ${ref} (${App.version})`;
  if (navigator.share) {
    navigator.share({ text: shareText }).catch(() => {});
  } else {
    navigator.clipboard.writeText(shareText).then(() => {
      showToast('Copied to clipboard');
    }).catch(() => {
      showToast(shareText, 3000);
    });
  }
  hideVersePopup();
}

function popupCopy() {
  const ref  = getSelectedRef();
  const text = getSelectedText();
  if (!ref) return;
  const txt = `"${text}" — ${ref} (${App.version})`;
  navigator.clipboard.writeText(txt).then(() => showToast('Copied!')).catch(() => {});
  hideVersePopup();
}

/* ── Navigation ── */
function prevChapter() {
  const data = currentData();
  if (App.chapterIdx > 0) {
    App.chapterIdx--;
  } else if (App.bookIdx > 0) {
    App.bookIdx--;
    App.chapterIdx = data.books[App.bookIdx].c.length - 1;
    buildBookList(data.books[App.bookIdx].t);
    showChapterGrid(App.bookIdx);
  }
  renderChapter();
}

function nextChapter() {
  const data = currentData();
  const book = data.books[App.bookIdx];
  if (App.chapterIdx < book.c.length - 1) {
    App.chapterIdx++;
  } else if (App.bookIdx < data.books.length - 1) {
    App.bookIdx++;
    App.chapterIdx = 0;
    buildBookList(data.books[App.bookIdx].t);
    showChapterGrid(App.bookIdx);
  }
  renderChapter();
}

/* ── Daily Verse ── */
function setDailyVerse() {
  try {
    const data = currentData();
    if (!data.books.length) return;
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000);
    const ref = DAILY_VERSE_POOL[dayOfYear % DAILY_VERSE_POOL.length];
    const [bookI, chI, vsI] = ref;
    const book   = data.books[bookI];
    if (!book) return;
    const verseText = book.c[chI]?.[vsI];
    if (!verseText) return;
    const refStr = `${DISPLAY_NAMES[bookI]} ${chI+1}:${vsI+1} (${App.version})`;

    qs('#daily-verse-banner .dv-text').textContent = '"' + verseText + '"';
    qs('#daily-verse-banner .dv-ref').textContent  = '— ' + refStr;
    DOM.dailyBanner.classList.add('visible');

    DOM.dailyBanner.onclick = () => {
      App.bookIdx    = bookI;
      App.chapterIdx = chI;
      buildBookList(book.t);
      showChapterGrid(bookI);
      renderChapter();
      setTimeout(() => {
        const row = qs(`[data-vi="${vsI}"]`, DOM.verseContainer);
        if (row) { row.scrollIntoView({behavior:'smooth',block:'center'}); row.classList.add('highlighted'); }
      }, 300);
    };
  } catch(e) {}
}

/* ── Version Switching ── */
function switchVersion(vkey) {
  if (!App.data[vkey]) {
    showToast('Loading ' + vkey + '…');
    loadVersionScript(vkey).then(() => { App.version = vkey; renderChapter(); save(); });
  } else {
    App.version = vkey;
  }
  App.prefs.version = vkey;
  renderChapter();
  closePanel();
  save();
}

/* ── Search ── */
let searchFilter = 'all';

function doSearch(q) {
  q = q.trim().toLowerCase();
  const results = $('search-results');
  const data = currentData();
  if (!data.books.length || q.length < 2) {
    results.innerHTML = `<div class="search-empty"><div class="search-icon">🔍</div>Type at least 2 characters</div>`;
    return;
  }

  const hits = [];
  const qWords = q.split(/\s+/).filter(Boolean);

  data.books.forEach((book, bi) => {
    if (searchFilter === 'ot' && book.t !== 'OT') return;
    if (searchFilter === 'nt' && book.t !== 'NT') return;
    book.c.forEach((chVerses, ci) => {
      chVerses.forEach((text, vi) => {
        const low = text.toLowerCase();
        if (qWords.every(w => low.includes(w))) {
          hits.push({ bi, ci, vi, text });
          if (hits.length >= 150) return;
        }
      });
      if (hits.length >= 150) return;
    });
    if (hits.length >= 150) return;
  });

  if (!hits.length) {
    results.innerHTML = `<div class="search-empty"><div class="search-icon">📖</div>No results for "<strong>${esc(q)}</strong>"</div>`;
    return;
  }

  // Highlight matches
  function highlight(text, words) {
    let esc_text = esc(text);
    words.forEach(w => {
      const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi');
      esc_text = esc_text.replace(re, m => `<mark>${m}</mark>`);
    });
    return esc_text;
  }

  const cap = hits.length >= 150 ? `<div style="color:var(--text4);font-size:0.8rem;padding:8px 0">Showing first 150 of many results. Refine your search.</div>` : '';
  results.innerHTML = cap + hits.map(h => {
    const ref = `${DISPLAY_NAMES[h.bi]} ${h.ci+1}:${h.vi+1}`;
    return `<div class="search-result" data-bi="${h.bi}" data-ci="${h.ci}" data-vi="${h.vi}">
      <div class="result-ref">${esc(ref)} · ${esc(App.version)}</div>
      <div class="result-text">${highlight(h.text, qWords)}</div>
    </div>`;
  }).join('');

  qsa('.search-result', results).forEach(el => {
    el.addEventListener('click', () => {
      App.bookIdx    = +el.dataset.bi;
      App.chapterIdx = +el.dataset.ci;
      const vi = +el.dataset.vi;
      buildBookList(currentData().books[App.bookIdx].t);
      showChapterGrid(App.bookIdx);
      renderChapter();
      setTimeout(() => {
        const row = qs(`[data-vi="${vi}"]`, DOM.verseContainer);
        if (row) { row.scrollIntoView({behavior:'smooth',block:'center'}); row.classList.add('highlighted'); }
      }, 200);
      closePanel();
    });
  });
}

/* ── Panels ── */
function openPanel(name) {
  closePanel();
  App.activePanel = name;
  const panel = $('panel-' + name);
  if (!panel) return;
  panel.classList.add('visible');

  if (name === 'bookmarks') renderBookmarks();
  if (name === 'notes')     renderNotes();
  if (name === 'settings')  renderSettings();
  if (name === 'versions')  renderVersions();
  if (name === 'plans')     { renderPlans(); }
}

function closePanel() {
  if (App.activePanel) {
    const p = $('panel-' + App.activePanel);
    if (p) p.classList.remove('visible');
    App.activePanel = null;
  }
  hideVersePopup();
}

/* ── Bookmarks Panel ── */
function renderBookmarks() {
  const body = $('bookmarks-body') || qs('#panel-bookmarks .sheet-body');
  if (!App.bookmarks.length) {
    body.innerHTML = `<div class="empty-state"><div class="empty-icon">🔖</div><p>No bookmarks yet.<br>Tap a verse and press Bookmark.</p></div>`;
    return;
  }
  body.innerHTML = App.bookmarks.map((bm, i) =>
    `<div class="bookmark-item" data-i="${i}">
      <div class="bookmark-icon">🔖</div>
      <div style="flex:1">
        <div class="bookmark-ref">${esc(bm.ref)} · ${esc(bm.key.split('-')[0])}</div>
        <div class="bookmark-preview">${esc(bm.text)}</div>
        <div style="font-size:0.72rem;color:var(--text5);margin-top:4px">${fmtDate(bm.date)}</div>
      </div>
      <button class="bookmark-del" data-i="${i}" title="Remove">✕</button>
    </div>`
  ).join('');

  qsa('.bookmark-item', body).forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.closest('.bookmark-del')) return;
      const bm   = App.bookmarks[+el.dataset.i];
      const [v, bi, ci, vi] = bm.key.split('-');
      App.version    = v;
      App.bookIdx    = +bi;
      App.chapterIdx = +ci;
      buildBookList(currentData().books[+bi].t);
      showChapterGrid(+bi);
      renderChapter();
      setTimeout(() => {
        const row = qs(`[data-vi="${vi}"]`, DOM.verseContainer);
        if (row) { row.scrollIntoView({behavior:'smooth',block:'center'}); row.classList.add('highlighted'); }
      }, 200);
      closePanel();
    });
  });
  qsa('.bookmark-del', body).forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      App.bookmarks.splice(+btn.dataset.i, 1);
      save(); renderBookmarks();
    });
  });
}

/* ── Notes Panel ── */
function renderNotes() {
  const body = $('notes-body') || qs('#panel-notes .sheet-body');
  const entries = Object.entries(App.notes);

  let html = `<div id="note-ref-label" style="font-size:0.8rem;color:var(--gold);margin-bottom:4px;font-weight:600"></div>
    <textarea class="note-input-area" id="note-input" placeholder="Write a note about this verse…" rows="3"></textarea>
    <button class="note-save-btn" id="note-save-btn">Save Note</button>
    <hr style="border:none;border-top:1px solid var(--bdr);margin:16px 0">`;

  if (!entries.length) {
    html += `<div class="empty-state"><div class="empty-icon">📝</div><p>No notes yet.<br>Tap a verse and press Note to begin.</p></div>`;
  } else {
    html += entries.reverse().map(([key, text]) => {
      const [v, bi, ci, vi] = key.split('-');
      const ref = `${DISPLAY_NAMES[+bi]} ${+ci+1}:${+vi+1} · ${v}`;
      return `<div class="note-item" data-key="${esc(key)}">
        <div class="note-ref">${esc(ref)}</div>
        <div class="note-text">${esc(text)}</div>
        <div style="display:flex;justify-content:flex-end;margin-top:6px">
          <button class="bookmark-del note-del" data-key="${esc(key)}" title="Delete">✕</button>
        </div>
      </div>`;
    }).join('');
  }

  body.innerHTML = html;

  $('note-save-btn').addEventListener('click', () => {
    const inp = $('note-input');
    const key = inp.dataset.key;
    const val = inp.value.trim();
    if (!key || !val) return;
    App.notes[key] = val;
    save();
    showToast('Note saved');
    renderNotes();
  });

  qsa('.note-del', body).forEach(btn => {
    btn.addEventListener('click', () => {
      delete App.notes[btn.dataset.key];
      save(); renderNotes();
    });
  });
}

/* ── Settings Panel ── */
function renderSettings() {
  // Font size
  const curSize = parseFloat(App.prefs.fontSize || 1.25);
  if ($('font-size-display')) $('font-size-display').textContent = curSize.toFixed(2) + 'rem';
  // Re-sync version pill
  if (DOM.versionText) DOM.versionText.textContent = App.version;

  // Reading mode buttons
  qsa('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === App.readingMode);
  });

  // Theme buttons
  const curTheme = document.body.getAttribute('data-theme') || 'light';
  qsa('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === curTheme);
  });

  // Red letter toggle
  const rlInp = $('redletter-toggle');
  if (rlInp) rlInp.checked = document.body.hasAttribute('data-redletter');
}

function changeFontSize(delta) {
  const cur = parseFloat(App.prefs.fontSize || 1.25);
  const nxt = Math.min(2.2, Math.max(0.85, +(cur + delta).toFixed(2)));
  App.prefs.fontSize = nxt;
  document.documentElement.style.setProperty('--verse-size', nxt + 'rem');
  if ($('font-size-display')) $('font-size-display').textContent = nxt.toFixed(2) + 'rem';
  save();
}

function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  App.prefs.theme = theme;
  qsa('.theme-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.theme === theme));
  save();
}

function setReadingMode(mode) {
  App.readingMode = mode;
  App.prefs.readingMode = mode;
  qsa('.mode-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
  renderChapter();
  save();
}

/* ── Versions Panel ── */
function renderVersions() {
  const body = qs('#panel-versions .sheet-body');
  body.innerHTML = Object.entries(VERSIONS).map(([k, v]) =>
    `<div class="version-option ${k === App.version ? 'active' : ''}" data-v="${k}">
      <div class="version-badge">${k}</div>
      <div class="version-details">
        <div class="version-name">${esc(v.name)}</div>
        <div class="version-year">${v.year} · Public Domain</div>
      </div>
      ${k === App.version ? '<span class="version-check">✓</span>' : ''}
    </div>`
  ).join('');

  qsa('.version-option', body).forEach(el => {
    el.addEventListener('click', () => switchVersion(el.dataset.v));
  });
}

/* ── Reading Plans ── */
function initPlans() {
  READING_PLANS.forEach(plan => {
    if (!App.planProgress[plan.id]) {
      App.planProgress[plan.id] = { day: 0, done: [] };
    }
  });
}

function renderPlans() {
  const body = qs('#panel-plans .sheet-body');
  if (!body) return;
  const activePlanId = App.prefs.activePlan;
  if (activePlanId) {
    renderPlanDetail(activePlanId, body);
    return;
  }
  body.innerHTML = READING_PLANS.map(plan => {
    const prog = App.planProgress[plan.id] || { done: [] };
    const pct  = Math.round((prog.done.length / plan.days.length) * 100);
    return `<div class="plan-card" data-plan="${plan.id}">
      <div class="plan-name">${esc(plan.name)}</div>
      <div class="plan-meta">${esc(plan.desc)}</div>
      <div class="plan-progress-track"><div class="plan-progress-fill" style="width:${pct}%"></div></div>
      <div class="plan-progress-label">${prog.done.length} / ${plan.days.length} days · ${pct}%</div>
    </div>`;
  }).join('');

  qsa('.plan-card', body).forEach(el => {
    el.addEventListener('click', () => {
      App.prefs.activePlan = el.dataset.plan;
      renderPlanDetail(el.dataset.plan, body);
      save();
    });
  });
}

function renderPlanDetail(planId, body) {
  const plan = READING_PLANS.find(p => p.id === planId);
  if (!plan) return;
  const prog = App.planProgress[planId] || { done: [] };

  let html = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
    <button class="ch-nav-btn" id="plan-back-btn">← Plans</button>
    <div style="font-family:var(--font-serif);font-size:1rem;font-weight:600;color:var(--text)">${esc(plan.name)}</div>
  </div>`;

  html += plan.days.map((day, i) => {
    const done = prog.done.includes(i);
    return `<div class="plan-day-item ${done ? 'done' : ''}" data-day="${i}" data-plan="${planId}">
      <div class="plan-day-check">${done ? '✓' : ''}</div>
      <div class="plan-day-ref">Day ${i+1}: ${esc(day.join(', '))}</div>
    </div>`;
  }).join('');

  body.innerHTML = html;

  $('plan-back-btn').addEventListener('click', () => {
    App.prefs.activePlan = null;
    save();
    renderPlans();
  });

  qsa('.plan-day-item', body).forEach(el => {
    el.addEventListener('click', () => {
      const di = +el.dataset.day;
      const pid = el.dataset.plan;
      const p2 = App.planProgress[pid];
      const idx = p2.done.indexOf(di);
      if (idx >= 0) p2.done.splice(idx, 1);
      else p2.done.push(di);
      save();
      renderPlanDetail(pid, body);
    });
  });
}

/* ── Sidebar toggle ── */
function toggleSidebar() {
  App.sidebarOpen = !App.sidebarOpen;
  DOM.sidebar.classList.toggle('collapsed', !App.sidebarOpen);
  App.prefs.sidebarOpen = App.sidebarOpen;
  save();
}

function closeSidebar() {
  App.sidebarOpen = false;
  DOM.sidebar.classList.add('collapsed');
}

function setTabLabel(tabIdx, label) {
  // No-op in this layout (tabs are fixed)
}

/* ── Tab bar ── */
function setAddr(str) {
  // Update address (passage pill) if called from image search or similar
  if (DOM.pillText) DOM.pillText.textContent = str;
}

function switchTab(tab) {
  qsa('.tab-item').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  if (tab === 'read') { closePanel(); }
  if (tab === 'search') openPanel('search');
  if (tab === 'bookmarks') openPanel('bookmarks');
  if (tab === 'plans') openPanel('plans');
  if (tab === 'settings') openPanel('settings');
}

/* ── Toast ── */
function showToast(msg, duration = 1800) {
  let toast = $('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
      background:var(--ink);color:#fff;padding:9px 18px;border-radius:20px;
      font-size:0.82rem;z-index:1000;opacity:0;transition:opacity 0.2s;
      white-space:nowrap;pointer-events:none;font-family:var(--font-ui)`;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, duration);
}

/* ── Ref parsing (for go-to-verse) ── */
function parseRef(str) {
  str = str.trim();
  // Match: "Gen 1:2" or "Genesis 1:2" or "Ps 23" etc.
  const m = str.match(/^([\w\s]+?)\s+(\d+)(?::(\d+))?$/i);
  if (!m) return null;
  const bookStr = m[1].trim().toLowerCase();
  const ch = parseInt(m[2]) - 1;
  const vs = m[3] ? parseInt(m[3]) - 1 : null;
  let bi = ABBREV_INDEX[bookStr] ?? FULL_INDEX[bookStr];
  if (bi === undefined) return null;
  return { bi, ch, vs };
}

function goToRef(str) {
  const r = parseRef(str);
  if (!r) { showToast('Reference not found'); return; }
  App.bookIdx = r.bi;
  App.chapterIdx = Math.max(0, r.ch);
  const book = currentData().books[r.bi];
  buildBookList(book.t);
  showChapterGrid(r.bi);
  renderChapter();
  if (r.vs !== null) {
    setTimeout(() => {
      const row = qs(`[data-vi="${r.vs}"]`, DOM.verseContainer);
      if (row) { row.scrollIntoView({behavior:'smooth',block:'center'}); row.classList.add('highlighted'); }
    }, 200);
  }
  closePanel();
}

/* ── Event listeners ── */
function initEventListeners() {
  // Passage pill → open book list
  DOM.passagePill.addEventListener('click', () => {
    if (!App.sidebarOpen) { App.sidebarOpen = true; DOM.sidebar.classList.remove('collapsed'); }
    closeChapterGrid();
  });

  // Version pill
  DOM.versionPill.addEventListener('click', () => openPanel('versions'));

  // Sidebar tabs
  qsa('.sidebar-tab[data-pane]').forEach(tab => {
    tab.addEventListener('click', () => {
      if (!tab.dataset.pane || tab.dataset.pane === 'books') {
        qsa('.sidebar-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      }
    });
  });

  // Sidebar "Books" tab
  const booksTab = qs('.sidebar-tab[data-pane="books"]');
  if (booksTab) {
    booksTab.addEventListener('click', () => {
      closeChapterGrid();
      buildBookList(App.currentTribe);
    });
  }

  // Testament toggle
  qsa('.testament-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      closeChapterGrid();
      buildBookList(btn.dataset.t);
    });
  });

  // Sidebar toggle button
  $('btn-sidebar-toggle').addEventListener('click', toggleSidebar);

  // Chapter back button
  qs('.chapter-back-btn').addEventListener('click', closeChapterGrid);

  // Prev / Next chapter
  DOM.btnPrev.addEventListener('click', prevChapter);
  DOM.btnNext.addEventListener('click', nextChapter);

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); prevChapter(); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  { e.preventDefault(); nextChapter(); }
    if (e.key === 'Escape') { closePanel(); hideVersePopup(); }
    if (e.key === 'f' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); openPanel('search'); }
  });

  // Close popup on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.verse-row') && !e.target.closest('#verse-popup')) {
      hideVersePopup();
      qsa('.verse-row.highlighted', DOM.verseContainer).forEach(r => r.classList.remove('highlighted'));
      App.selectedVerse = null;
    }
  });

  // Backdrop clicks close panels
  qsa('.overlay-backdrop').forEach(bd => {
    bd.addEventListener('click', closePanel);
  });

  // Tab bar
  qsa('.tab-item').forEach(t => {
    t.addEventListener('click', () => switchTab(t.dataset.tab));
  });

  // Search input
  const si = $('search-input');
  if (si) {
    si.addEventListener('input', () => {
      clearTimeout(App.searchTimeout);
      App.searchTimeout = setTimeout(() => doSearch(si.value), 250);
    });
    si.addEventListener('keydown', e => {
      if (e.key === 'Enter') doSearch(si.value);
    });
  }

  // Search filters
  qsa('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      qsa('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      searchFilter = chip.dataset.f;
      const si2 = $('search-input');
      if (si2 && si2.value) doSearch(si2.value);
    });
  });

  // Verse popup buttons
  $('popup-bookmark')?.addEventListener('click', popupBookmark);
  $('popup-copy')?.addEventListener('click', popupCopy);
  $('popup-share')?.addEventListener('click', popupShare);
  $('popup-note')?.addEventListener('click', popupNote);

  // Highlight buttons in popup
  qsa('.hl-color-btn').forEach(btn => {
    btn.addEventListener('click', () => popupHighlight(btn.dataset.color));
  });

  // Settings controls
  $('btn-font-smaller')?.addEventListener('click', () => changeFontSize(-0.1));
  $('btn-font-larger')?.addEventListener('click',  () => changeFontSize(+0.1));

  qsa('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => setReadingMode(btn.dataset.mode));
  });
  qsa('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme));
  });

  $('redletter-toggle')?.addEventListener('change', function() {
    if (this.checked) {
      document.body.setAttribute('data-redletter', 'on');
      App.prefs.redLetter = true;
    } else {
      document.body.removeAttribute('data-redletter');
      App.prefs.redLetter = false;
    }
    save();
  });

  // Go-to-ref input in search
  $('goto-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') goToRef(e.target.value);
  });
  $('goto-btn')?.addEventListener('click', () => {
    goToRef($('goto-input').value);
  });

  // Sidebar collapse at start if small screen
  if (window.innerWidth < 700) {
    closeSidebar();
  } else if (!App.sidebarOpen) {
    DOM.sidebar.classList.add('collapsed');
  }

  // Close chapter grid when clicking outside on mobile
  DOM.verseContainer.addEventListener('touchstart', () => {
    if (window.innerWidth < 700) closeChapterGrid();
  }, { passive: true });
}

/* ── Boot ── */
window.addEventListener('DOMContentLoaded', init);
