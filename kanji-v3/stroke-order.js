// ============================================================
// STROKE ORDER ENGINE — stroke-order.js
//
// Fetches KanjiVG SVGs from jsDelivr CDN on demand,
// parses stroke paths, and renders an animated step-through
// diagram with numbered strokes, direction arrows, and
// start-point dots.
//
// KanjiVG is © Ulrich Apel, CC BY-SA 3.0
// https://kanjivg.tagaini.net/
// ============================================================

const KVG_BASE = 'https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/';
const kvgCache = {};   // char → [pathD, ...] array
const kvgPending = {}; // char → Promise (deduplicate in-flight requests)

// ── FETCH & PARSE ────────────────────────────────────────────
function kanjiToHex(char) {
  return char.codePointAt(0).toString(16).padStart(5, '0');
}

async function fetchStrokePaths(char) {
  if (kvgCache[char]) return kvgCache[char];
  if (kvgPending[char]) return kvgPending[char];

  kvgPending[char] = (async () => {
    const hex = kanjiToHex(char);
    const url = `${KVG_BASE}${hex}.svg`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'image/svg+xml');

      // Find StrokePaths group, extract <path> elements in order
      const paths = [];
      // KanjiVG structure: <g id="kvg:StrokePaths_XXXXX">...<path d="..."/>
      // Fall back to all <path> elements if group not found
      const strokeGroup = doc.querySelector('[id*="StrokePaths"]') || doc.documentElement;
      const pathEls = strokeGroup.querySelectorAll('path');
      pathEls.forEach(p => {
        const d = p.getAttribute('d');
        if (d) paths.push(d);
      });

      kvgCache[char] = paths;
      return paths;
    } catch (e) {
      kvgCache[char] = null; // mark as failed
      return null;
    }
  })();
  return kvgPending[char];
}

// ── DIAGRAM RENDERER ─────────────────────────────────────────
// Returns an HTMLElement with the full interactive diagram
// containerSize: pixel size of the SVG viewport (default 200)
function createStrokeDiagram(char, paths, containerSize = 200) {
  // KanjiVG viewBox is 0 0 109 109
  const VB = 109;
  const scale = containerSize / VB;

  const wrap = document.createElement('div');

  // ── State
  let currentStep = 0;        // which stroke is "active" (0-based)
  let animTimer = null;
  let isPlaying = false;
  let speedMs = 800;          // ms per stroke in auto-play
  let showNumbers = true;

  // ── Build SVG
  const svgNS = 'http://www.w3.org/2000/svg';
  const svgWrap = document.createElement('div');
  svgWrap.className = 'stroke-svg-wrap';
  svgWrap.style.width = containerSize + 'px';
  svgWrap.style.height = containerSize + 'px';

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${VB} ${VB}`);
  svg.setAttribute('width', containerSize);
  svg.setAttribute('height', containerSize);
  svg.style.display = 'block';

  // Grid guide lines (faint)
  const grid = document.createElementNS(svgNS, 'g');
  grid.style.opacity = '0.08';
  [[VB/2,0,VB/2,VB],[0,VB/2,VB,VB/2]].forEach(([x1,y1,x2,y2])=>{
    const l = document.createElementNS(svgNS,'line');
    l.setAttribute('x1',x1);l.setAttribute('y1',y1);
    l.setAttribute('x2',x2);l.setAttribute('y2',y2);
    l.setAttribute('stroke','#888');l.setAttribute('stroke-width','0.5');
    grid.appendChild(l);
  });
  svg.appendChild(grid);

  // Stroke path elements + number text elements
  const strokeEls = [];
  const numEls = [];
  const dotEls = [];
  const arrowEls = [];

  paths.forEach((d, i) => {
    // Path
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'kvg-stroke-future');
    svg.appendChild(path);
    strokeEls.push(path);

    // Get approximate start point for number and dot
    const startPt = getPathStartPoint(d);
    const midPt = getPathMidPoint(d);

    // Stroke number text
    const txt = document.createElementNS(svgNS, 'text');
    txt.setAttribute('x', startPt.x);
    txt.setAttribute('y', startPt.y - 1.5);
    txt.setAttribute('class', 'kvg-num kvg-num-future');
    txt.setAttribute('text-anchor', 'middle');
    txt.textContent = i + 1;
    svg.appendChild(txt);
    numEls.push(txt);

    // Start dot
    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('cx', startPt.x);
    dot.setAttribute('cy', startPt.y);
    dot.setAttribute('r', '1.8');
    dot.setAttribute('class', 'kvg-start-dot');
    svg.appendChild(dot);
    dotEls.push(dot);

    // Direction arrow (small triangle near start)
    const endPt = getPathEndPoint(d);
    const arrowGroup = buildArrow(svgNS, startPt, midPt);
    svg.appendChild(arrowGroup);
    arrowEls.push(arrowGroup);
  });

  svgWrap.appendChild(svg);
  wrap.appendChild(svgWrap);

  // ── Controls
  const controls = document.createElement('div');
  controls.className = 'stroke-controls';

  const btnPrev = makeCtrlBtn('‹ Prev', () => { stopAnim(); setStep(currentStep - 1); });
  const btnPlay = makeCtrlBtn('▶ Play', () => togglePlay());
  btnPlay.classList.add('play');
  const btnNext = makeCtrlBtn('Next ›', () => { stopAnim(); setStep(currentStep + 1); });
  const btnReset = makeCtrlBtn('↺', () => { stopAnim(); setStep(-1); });
  btnReset.title = 'Reset';
  const btnAll = makeCtrlBtn('All', () => { stopAnim(); setStep(paths.length - 1); });
  const stepLbl = document.createElement('span');
  stepLbl.className = 'sc-step';

  // Number toggle
  const btnNums = makeCtrlBtn('#', () => {
    showNumbers = !showNumbers;
    numEls.forEach(n => { n.style.display = showNumbers ? '' : 'none'; });
    dotEls.forEach(d => { d.style.display = showNumbers ? '' : 'none'; });
    btnNums.style.background = showNumbers ? 'var(--indigo)' : '';
    btnNums.style.color = showNumbers ? '#fff' : '';
  });
  btnNums.title = 'Toggle stroke numbers';
  btnNums.style.background = 'var(--indigo)';
  btnNums.style.color = '#fff';

  // Speed slider
  const speedWrap = document.createElement('div');
  speedWrap.className = 'stroke-speed';
  speedWrap.innerHTML = `<span>Speed</span><input type="range" min="200" max="2000" step="100" value="${speedMs}" title="Animation speed"/>`;
  speedWrap.querySelector('input').addEventListener('input', e => { speedMs = +e.target.value; });

  [btnPrev, btnPlay, btnNext, btnReset, btnAll, stepLbl, btnNums].forEach(b => controls.appendChild(b));
  controls.appendChild(speedWrap);
  wrap.appendChild(controls);

  // ── Render function
  function setStep(n) {
    currentStep = Math.max(-1, Math.min(paths.length - 1, n));
    strokeEls.forEach((el, i) => {
      const cls = i < currentStep ? 'kvg-stroke-done'
                : i === currentStep ? 'kvg-stroke-active'
                : 'kvg-stroke-future';
      el.setAttribute('class', cls);

      const numCls = i < currentStep ? 'kvg-num'
                   : i === currentStep ? 'kvg-num kvg-num-active'
                   : 'kvg-num kvg-num-future';
      numEls[i].setAttribute('class', numCls);

      const isActive = i === currentStep;
      dotEls[i].classList.toggle('show', isActive);
      arrowEls[i].classList.toggle('show', isActive);
    });
    const label = currentStep < 0
      ? `0 / ${paths.length}`
      : `${currentStep + 1} / ${paths.length}`;
    stepLbl.textContent = label;

    // Animate the active stroke using dash-offset
    if (currentStep >= 0) {
      const activePath = strokeEls[currentStep];
      animateStrokeDraw(activePath, 350);
    }
  }

  function togglePlay() {
    if (isPlaying) {
      stopAnim();
    } else {
      isPlaying = true;
      btnPlay.textContent = '⏸ Pause';
      if (currentStep >= paths.length - 1) setStep(-1);
      function step() {
        const next = currentStep + 1;
        if (next >= paths.length) { stopAnim(); return; }
        setStep(next);
        animTimer = setTimeout(step, speedMs);
      }
      animTimer = setTimeout(step, 120);
    }
  }

  function stopAnim() {
    isPlaying = false;
    clearTimeout(animTimer);
    btnPlay.textContent = '▶ Play';
  }

  // Initial render: show all strokes faint
  setStep(-1);

  wrap._setStep = setStep;
  wrap._stopAnim = stopAnim;
  return wrap;
}

// ── PATH GEOMETRY HELPERS ────────────────────────────────────

function parsePathStart(d) {
  // Extract first M/m command coords
  const m = d.match(/^[Mm]\s*([\d.+-]+)[,\s]+([\d.+-]+)/);
  if (m) return { x: parseFloat(m[1]), y: parseFloat(m[2]) };
  return { x: 54, y: 54 };
}

function getPathStartPoint(d) {
  return parsePathStart(d);
}

function getPathEndPoint(d) {
  // Find last pair of numbers before end of string (crude but works for KanjiVG paths)
  const nums = [...d.matchAll(/([\d.]+)[,\s]+([\d.]+)/g)];
  if (nums.length > 0) {
    const last = nums[nums.length - 1];
    return { x: parseFloat(last[1]), y: parseFloat(last[2]) };
  }
  return getPathStartPoint(d);
}

function getPathMidPoint(d) {
  // Grab roughly the middle number pair
  const nums = [...d.matchAll(/([\d.]+)[,\s]+([\d.]+)/g)];
  if (nums.length >= 2) {
    const mid = nums[Math.floor(nums.length / 2)];
    return { x: parseFloat(mid[1]), y: parseFloat(mid[2]) };
  }
  return getPathStartPoint(d);
}

function buildArrow(svgNS, startPt, midPt) {
  // Small directional arrowhead near start pointing toward midpoint
  const g = document.createElementNS(svgNS, 'g');
  g.setAttribute('class', 'kvg-arrow');

  const dx = midPt.x - startPt.x;
  const dy = midPt.y - startPt.y;
  const len = Math.sqrt(dx*dx + dy*dy) || 1;
  const nx = dx/len, ny = dy/len; // unit vector

  const ax = startPt.x + nx*5;
  const ay = startPt.y + ny*5;
  // arrowhead: triangle
  const size = 2.5;
  const px1 = ax - ny*size, py1 = ay + nx*size;
  const px2 = ax + ny*size, py2 = ay - nx*size;
  const tx  = ax + nx*size*2, ty  = ay + ny*size*2;

  const poly = document.createElementNS(svgNS, 'polygon');
  poly.setAttribute('points', `${px1},${py1} ${px2},${py2} ${tx},${ty}`);
  poly.setAttribute('fill', 'var(--vermillion)');
  g.appendChild(poly);
  return g;
}

function animateStrokeDraw(pathEl, durationMs) {
  try {
    const len = pathEl.getTotalLength ? pathEl.getTotalLength() : 100;
    pathEl.style.strokeDasharray = len;
    pathEl.style.strokeDashoffset = len;
    pathEl.style.transition = 'none';
    // Force reflow
    void pathEl.getBoundingClientRect();
    pathEl.style.transition = `stroke-dashoffset ${durationMs}ms ease`;
    pathEl.style.strokeDashoffset = '0';
  } catch(e) {
    // getTotalLength not available in some contexts — skip animation
  }
}

function makeCtrlBtn(label, onClick) {
  const b = document.createElement('button');
  b.className = 'sc-btn';
  b.textContent = label;
  b.onclick = onClick;
  return b;
}

// ── PUBLIC API ───────────────────────────────────────────────

/**
 * Render stroke order into a container element.
 * @param {string} char - The kanji character
 * @param {HTMLElement} container - Where to render
 * @param {number} size - SVG size in px
 */
async function renderStrokeOrder(char, container, size = 200) {
  container.innerHTML = `<div style="color:var(--sepia);font-size:.8rem;padding:.8rem">Loading strokes…</div>`;
  const paths = await fetchStrokePaths(char);
  if (!paths || paths.length === 0) {
    container.innerHTML = `<div style="color:var(--sepia);font-size:.78rem;padding:.6rem;font-style:italic">
      Stroke data unavailable for this character.<br>
      <span style="font-size:.7rem">Requires internet connection on first load.</span>
    </div>`;
    return;
  }
  container.innerHTML = '';
  const diagram = createStrokeDiagram(char, paths, size);
  container.appendChild(diagram);
}

/**
 * Open the fullscreen stroke popup for a kanji.
 * Called from kanji cards, modal button, etc.
 */
async function openStrokePopup(char) {
  const k = KANJI_DB.find(x => x.kanji === char);
  document.getElementById('sp-char').textContent = char + (k ? `  ${k.meaning}` : '');
  document.getElementById('sp-meta').textContent = k
    ? `${k.readings.join(' · ')}  ·  ${k.strokes} strokes  ·  ${k.level}`
    : '';
  document.getElementById('stroke-overlay').classList.add('open');
  await renderStrokeOrder(char, document.getElementById('sp-diagram'), 240);
}

function closeStrokePopup(e) {
  if (e.target === document.getElementById('stroke-overlay')) closeStrokeOverlay();
}
function closeStrokeOverlay() {
  document.getElementById('stroke-overlay').classList.remove('open');
  document.getElementById('sp-diagram').innerHTML = '';
}

// Also close on Escape (hook into existing keydown in app.js)
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeStrokeOverlay();
});
