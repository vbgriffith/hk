"""
build_html.py — Assemble the final single-file portrait_gan.html.

Inlines:
  - The model weights JS (from export_weights.py)
  - inference.js (forward pass engine)
  - prompt_parser.js (text → condition vector)
  - renderer.js (upscaling, color correction)
  - The full UI HTML/CSS/JS

Usage:
    python export/build_html.py \
        --weights inference/weights_b64.js \
        --output docs/portrait_gan.html

    # With custom title/branding:
    python export/build_html.py \
        --weights inference/weights_b64.js \
        --output docs/portrait_gan.html \
        --title "FamilyPixel AI"
"""

import argparse
import sys
import re
from pathlib import Path


def read_file(path: str) -> str:
    with open(path, "r") as f:
        return f.read()


def build_html(weights_path: str, output_path: str, title: str = "PortraitGAN"):
    base = Path(__file__).parent.parent / "inference"

    print(f"\nBuilding {output_path}...")
    print(f"  Weights:  {weights_path}")

    # Read all JS components
    weights_js       = read_file(weights_path)
    inference_js     = read_file(base / "inference.js")
    prompt_parser_js = read_file(base / "prompt_parser.js")
    renderer_js      = read_file(base / "renderer.js")

    weights_mb = len(weights_js) / (1024**2)
    print(f"  Weights size: {weights_mb:.1f} MB")

    # Detect quantization mode from weights file
    is_quantized = "WEIGHTS_INT8_B64" in weights_js
    quant_mode   = "int8" if is_quantized else "float32"
    print(f"  Weight dtype: {quant_mode}")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{title} — Offline Portrait Generator</title>
<style>
/* ─── RESET & BASE ─── */
*,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
:root{{
  --bg:#0f1117;--surface:#181b24;--card:#1e2230;--border:#252a3a;
  --accent:#60a5fa;--accent2:#a78bfa;--green:#34d399;--orange:#fb923c;
  --red:#f87171;--text:#d1d5db;--text-dim:#6b7280;--text-bright:#f3f4f6;
  --mono:'Courier New',monospace;
}}
html{{height:100%;scroll-behavior:smooth}}
body{{
  background:var(--bg);color:var(--text);
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  font-size:14px;line-height:1.6;min-height:100%;
}}

/* ─── LAYOUT ─── */
.app{{display:grid;grid-template-columns:320px 1fr;min-height:100vh;}}
@media(max-width:768px){{.app{{grid-template-columns:1fr;grid-template-rows:auto 1fr}}}}

/* ─── SIDEBAR ─── */
.sidebar{{
  background:var(--surface);border-right:1px solid var(--border);
  padding:24px 20px;display:flex;flex-direction:column;gap:20px;
  overflow-y:auto;
}}
.logo{{
  display:flex;align-items:center;gap:10px;padding-bottom:16px;
  border-bottom:1px solid var(--border);
}}
.logo-icon{{
  width:32px;height:32px;background:linear-gradient(135deg,var(--accent),var(--accent2));
  border-radius:8px;display:flex;align-items:center;justify-content:center;
  font-size:16px;
}}
.logo-text{{font-weight:700;font-size:15px;color:var(--text-bright)}}
.logo-sub{{font-size:10px;color:var(--text-dim);letter-spacing:.08em;text-transform:uppercase}}

/* ─── SECTION HEADERS ─── */
.section-label{{
  font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;
  color:var(--text-dim);margin-bottom:8px;
}}

/* ─── PROMPT INPUT ─── */
.prompt-wrap{{position:relative}}
textarea#prompt{{
  width:100%;background:var(--card);border:1px solid var(--border);
  color:var(--text-bright);font-family:var(--mono);font-size:12px;
  padding:10px 12px;border-radius:6px;resize:vertical;min-height:80px;
  line-height:1.5;outline:none;transition:border-color .15s;
}}
textarea#prompt:focus{{border-color:var(--accent)}}
.prompt-hint{{font-size:10px;color:var(--text-dim);margin-top:4px;line-height:1.5}}

/* ─── TAG BUTTONS ─── */
.tag-group{{margin-bottom:4px}}
.tag-grid{{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}}
.tag{{
  padding:3px 9px;border-radius:20px;font-size:11px;cursor:pointer;
  border:1px solid var(--border);color:var(--text-dim);background:var(--card);
  transition:all .12s;user-select:none;line-height:1.4;
}}
.tag:hover{{border-color:var(--accent);color:var(--accent)}}
.tag.active{{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600}}

/* ─── SLIDERS ─── */
.slider-row{{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;margin:4px 0}}
.slider-label{{font-size:12px;color:var(--text-dim)}}
.slider-val{{font-family:var(--mono);font-size:11px;color:var(--accent);min-width:28px;text-align:right}}
input[type=range]{{
  width:100%;-webkit-appearance:none;height:4px;border-radius:2px;
  background:var(--border);outline:none;
}}
input[type=range]::-webkit-slider-thumb{{
  -webkit-appearance:none;width:14px;height:14px;border-radius:50%;
  background:var(--accent);cursor:pointer;
}}

/* ─── GENERATE BUTTON ─── */
.btn-generate{{
  width:100%;padding:12px;border:none;border-radius:8px;
  background:linear-gradient(135deg,var(--accent),var(--accent2));
  color:#fff;font-size:14px;font-weight:700;cursor:pointer;
  letter-spacing:.04em;transition:opacity .15s, transform .1s;
  margin-top:4px;
}}
.btn-generate:hover:not(:disabled){{opacity:.9;transform:translateY(-1px)}}
.btn-generate:active:not(:disabled){{transform:translateY(0)}}
.btn-generate:disabled{{opacity:.5;cursor:not-allowed}}

/* ─── PARSED CONDITION DISPLAY ─── */
.condition-display{{
  background:var(--card);border:1px solid var(--border);border-radius:6px;
  padding:8px 12px;font-size:10px;font-family:var(--mono);
  color:var(--text-dim);line-height:1.8;min-height:32px;
}}
.cond-match{{color:var(--green)}}
.cond-wild{{color:var(--text-dim)}}

/* ─── MAIN CANVAS AREA ─── */
.main{{padding:24px;display:flex;flex-direction:column;gap:20px;overflow-y:auto}}

/* ─── CURRENT OUTPUT ─── */
.output-card{{
  background:var(--surface);border:1px solid var(--border);border-radius:12px;
  padding:20px;display:flex;flex-direction:column;align-items:center;gap:16px;
}}
.canvas-wrap{{
  position:relative;width:256px;height:256px;background:var(--card);
  border-radius:8px;overflow:hidden;border:1px solid var(--border);
  display:flex;align-items:center;justify-content:center;
}}
canvas#output{{width:256px;height:256px;image-rendering:pixelated}}
.canvas-placeholder{{
  display:flex;flex-direction:column;align-items:center;gap:8px;
  color:var(--text-dim);font-size:12px;
}}
.canvas-placeholder svg{{opacity:.3}}

.output-meta{{text-align:center}}
.output-prompt-display{{
  font-size:12px;color:var(--text-dim);font-style:italic;max-width:300px;
  text-align:center;line-height:1.5;
}}
.output-time{{
  font-family:var(--mono);font-size:10px;color:var(--text-dim);margin-top:4px;
}}

.btn-row{{display:flex;gap:8px}}
.btn-sm{{
  padding:6px 14px;border-radius:6px;font-size:12px;font-weight:600;
  cursor:pointer;border:1px solid var(--border);
  background:var(--card);color:var(--text);transition:all .12s;
}}
.btn-sm:hover{{border-color:var(--accent);color:var(--accent)}}

/* ─── PROGRESS ─── */
.progress-bar{{
  width:256px;height:3px;background:var(--border);border-radius:2px;overflow:hidden;
}}
.progress-fill{{
  height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));
  width:0%;transition:width .1s;border-radius:2px;
}}
.status-text{{
  font-family:var(--mono);font-size:10px;color:var(--text-dim);
  letter-spacing:.06em;text-align:center;
}}

/* ─── HISTORY GRID ─── */
.history-section{{}}
.history-header{{
  display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;
}}
.history-header h3{{font-size:12px;font-weight:600;color:var(--text-dim);letter-spacing:.1em;text-transform:uppercase}}
.history-grid{{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:6px;
}}
.history-item{{
  position:relative;border-radius:6px;overflow:hidden;cursor:pointer;
  border:2px solid transparent;transition:border-color .12s;aspect-ratio:1;
  background:var(--card);
}}
.history-item:hover{{border-color:var(--accent)}}
.history-item img{{width:100%;height:100%;object-fit:cover;image-rendering:pixelated}}
.history-item .hist-label{{
  position:absolute;bottom:0;left:0;right:0;padding:2px 4px;
  background:rgba(0,0,0,.7);font-size:8px;color:#fff;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}}

/* ─── STATUS BAR ─── */
.status-bar{{
  background:var(--surface);border-top:1px solid var(--border);
  padding:6px 20px;font-family:var(--mono);font-size:10px;
  color:var(--text-dim);display:flex;gap:20px;align-items:center;
}}
.status-dot{{
  width:6px;height:6px;border-radius:50%;background:var(--green);
  animation:pulse 2s infinite;
}}
@keyframes pulse{{0%,100%{{opacity:1}}50%{{opacity:.4}}}}

/* ─── TOAST ─── */
.toast{{
  position:fixed;bottom:24px;right:24px;background:var(--card);
  border:1px solid var(--border);border-left:3px solid var(--green);
  padding:10px 16px;border-radius:6px;font-size:12px;color:var(--text-bright);
  opacity:0;transform:translateY(8px);transition:all .2s;pointer-events:none;
  z-index:100;
}}
.toast.show{{opacity:1;transform:translateY(0)}}

/* ─── LOADING SPINNER ─── */
@keyframes spin{{to{{transform:rotate(360deg)}}}}
.spinner{{
  width:24px;height:24px;border:2px solid var(--border);
  border-top-color:var(--accent);border-radius:50%;
  animation:spin .7s linear infinite;
}}
</style>
</head>
<body>

<div class="app">

  <!-- ─── SIDEBAR ─── -->
  <aside class="sidebar">

    <div class="logo">
      <div class="logo-icon">🎨</div>
      <div>
        <div class="logo-text">{title}</div>
        <div class="logo-sub">Offline · No server · No internet</div>
      </div>
    </div>

    <!-- Prompt -->
    <div>
      <div class="section-label">Prompt</div>
      <div class="prompt-wrap">
        <textarea id="prompt" placeholder="asian family portrait&#10;candid blonde toddler full body&#10;american adult formal headshot"></textarea>
      </div>
      <div class="prompt-hint">
        Combine keywords freely. Unrecognized words are ignored.
      </div>
    </div>

    <!-- Condition Display -->
    <div>
      <div class="section-label">Parsed Condition</div>
      <div class="condition-display" id="cond-display">
        type a prompt to see parsed conditions
      </div>
    </div>

    <!-- Quick Tags -->
    <div>
      <div class="section-label">Quick Tags</div>

      <div class="tag-group">
        <div class="section-label" style="font-size:9px;margin-bottom:3px">Subject</div>
        <div class="tag-grid">
          <span class="tag" data-key="subject" data-val="individual">individual</span>
          <span class="tag" data-key="subject" data-val="couple">couple</span>
          <span class="tag" data-key="subject" data-val="family">family</span>
          <span class="tag" data-key="subject" data-val="group">group</span>
          <span class="tag" data-key="subject" data-val="siblings">siblings</span>
          <span class="tag" data-key="subject" data-val="parent child">parent &amp; child</span>
        </div>
      </div>

      <div class="tag-group" style="margin-top:8px">
        <div class="section-label" style="font-size:9px;margin-bottom:3px">Age</div>
        <div class="tag-grid">
          <span class="tag" data-key="age" data-val="baby">baby</span>
          <span class="tag" data-key="age" data-val="toddler">toddler</span>
          <span class="tag" data-key="age" data-val="child">child</span>
          <span class="tag" data-key="age" data-val="teen">teen</span>
          <span class="tag" data-key="age" data-val="young adult">young adult</span>
          <span class="tag" data-key="age" data-val="adult">adult</span>
          <span class="tag" data-key="age" data-val="mixed ages">mixed ages</span>
        </div>
      </div>

      <div class="tag-group" style="margin-top:8px">
        <div class="section-label" style="font-size:9px;margin-bottom:3px">Ethnicity</div>
        <div class="tag-grid">
          <span class="tag" data-key="ethnicity" data-val="american">american</span>
          <span class="tag" data-key="ethnicity" data-val="asian">asian</span>
          <span class="tag" data-key="ethnicity" data-val="latin">latin</span>
          <span class="tag" data-key="ethnicity" data-val="black">black</span>
          <span class="tag" data-key="ethnicity" data-val="south asian">south asian</span>
          <span class="tag" data-key="ethnicity" data-val="diverse">diverse</span>
        </div>
      </div>

      <div class="tag-group" style="margin-top:8px">
        <div class="section-label" style="font-size:9px;margin-bottom:3px">Framing</div>
        <div class="tag-grid">
          <span class="tag" data-key="framing" data-val="headshot">headshot</span>
          <span class="tag" data-key="framing" data-val="portrait">portrait</span>
          <span class="tag" data-key="framing" data-val="waist up">waist up</span>
          <span class="tag" data-key="framing" data-val="full body">full body</span>
        </div>
      </div>

      <div class="tag-group" style="margin-top:8px">
        <div class="section-label" style="font-size:9px;margin-bottom:3px">Style</div>
        <div class="tag-grid">
          <span class="tag" data-key="style" data-val="candid">candid</span>
          <span class="tag" data-key="style" data-val="posed">posed</span>
          <span class="tag" data-key="style" data-val="formal">formal</span>
          <span class="tag" data-key="style" data-val="casual">casual</span>
          <span class="tag" data-key="style" data-val="outdoor">outdoor</span>
          <span class="tag" data-key="style" data-val="studio">studio</span>
        </div>
      </div>

      <div class="tag-group" style="margin-top:8px">
        <div class="section-label" style="font-size:9px;margin-bottom:3px">Hair Color</div>
        <div class="tag-grid">
          <span class="tag" data-key="hair" data-val="black hair">black</span>
          <span class="tag" data-key="hair" data-val="brunette">brunette</span>
          <span class="tag" data-key="hair" data-val="blonde">blonde</span>
          <span class="tag" data-key="hair" data-val="red hair">red</span>
          <span class="tag" data-key="hair" data-val="gray hair">gray</span>
        </div>
      </div>

      <div class="tag-group" style="margin-top:8px">
        <div class="section-label" style="font-size:9px;margin-bottom:3px">Extras</div>
        <div class="tag-grid">
          <span class="tag" data-key="extras" data-val="smiling">smiling</span>
          <span class="tag" data-key="extras" data-val="with pet">with pet</span>
          <span class="tag" data-key="extras" data-val="with dog">with dog</span>
          <span class="tag" data-key="extras" data-val="with cat">with cat</span>
          <span class="tag" data-key="extras" data-val="glasses">glasses</span>
          <span class="tag" data-key="extras" data-val="holiday">holiday</span>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div>
      <div class="section-label">Controls</div>

      <div class="slider-row">
        <span class="slider-label">Seed</span>
        <span class="slider-val" id="seed-val">42</span>
      </div>
      <input type="range" id="seed" min="0" max="9999" value="42" step="1"/>

      <div style="margin-top:8px">
        <div class="slider-row">
          <span class="slider-label">Variation strength</span>
          <span class="slider-val" id="temp-val">1.0</span>
        </div>
        <input type="range" id="temp" min="0.1" max="2.0" value="1.0" step="0.05"/>
        <div class="prompt-hint">Higher = more random, lower = more conservative</div>
      </div>
    </div>

    <!-- Generate -->
    <button class="btn-generate" id="btn-generate" onclick="generate()">
      ✦ Generate Portrait
    </button>

    <div style="text-align:center;font-size:10px;color:var(--text-dim)">
      Model: <span style="color:var(--accent)">{quant_mode}</span> ·
      100% offline · no data sent anywhere
    </div>

  </aside>

  <!-- ─── MAIN ─── -->
  <main class="main">

    <!-- Current Output -->
    <div class="output-card">
      <div class="canvas-wrap">
        <canvas id="output" width="64" height="64" style="display:none"></canvas>
        <div id="canvas-placeholder" class="canvas-placeholder">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="20" cy="20" r="4" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 32 L16 24 L24 30 L32 20 L40 28" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
          <span>Press Generate to create a portrait</span>
        </div>
        <div id="spinner-wrap" style="display:none;position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.4)">
          <div class="spinner"></div>
        </div>
      </div>

      <div class="progress-bar" id="progress-bar" style="display:none">
        <div class="progress-fill" id="progress-fill"></div>
      </div>
      <div class="status-text" id="status-text">ready</div>

      <div class="output-meta">
        <div class="output-prompt-display" id="output-prompt-display"></div>
        <div class="output-time" id="output-time"></div>
      </div>

      <div class="btn-row">
        <button class="btn-sm" onclick="downloadImage()">⬇ Download</button>
        <button class="btn-sm" onclick="randomSeed()">🎲 Random seed</button>
        <button class="btn-sm" onclick="clearHistory()">🗑 Clear history</button>
      </div>
    </div>

    <!-- History -->
    <div class="history-section">
      <div class="history-header">
        <h3>History</h3>
        <span style="font-size:10px;color:var(--text-dim)" id="history-count">0 images</span>
      </div>
      <div class="history-grid" id="history-grid"></div>
    </div>

  </main>
</div>

<!-- Status Bar -->
<div class="status-bar">
  <div class="status-dot" id="model-dot" style="background:var(--orange)"></div>
  <span id="model-status">Loading model...</span>
  <span style="margin-left:auto">PortraitGAN v1.0 · {title}</span>
</div>

<!-- Toast -->
<div class="toast" id="toast"></div>

<!-- ─────────────────────────────────────────── -->
<!-- INLINED JS COMPONENTS                       -->
<!-- ─────────────────────────────────────────── -->

<script>
// ══════════════════════════════════════════
// WEIGHTS (auto-generated)
// ══════════════════════════════════════════
{weights_js}
</script>

<script>
// ══════════════════════════════════════════
// PROMPT PARSER
// ══════════════════════════════════════════
{prompt_parser_js}
</script>

<script>
// ══════════════════════════════════════════
// INFERENCE ENGINE
// ══════════════════════════════════════════
{inference_js}
</script>

<script>
// ══════════════════════════════════════════
// RENDERER & UPSCALER
// ══════════════════════════════════════════
{renderer_js}
</script>

<script>
// ══════════════════════════════════════════
// UI CONTROLLER
// ══════════════════════════════════════════

const history = [];
let modelReady = false;
let isGenerating = false;
let activeTags = {{}};  // dim → value string

// ── Init ──
window.addEventListener('DOMContentLoaded', async () => {{
  setStatus('Loading model weights...', 'orange');
  try {{
    await initModel();
    modelReady = true;
    setStatus('Model ready ✓', 'green');
    document.getElementById('model-dot').style.background = 'var(--green)';
    document.getElementById('model-status').textContent = 'Model ready · ' + MODEL_METADATA.n_params.toLocaleString() + ' parameters';
  }} catch(e) {{
    setStatus('Model load failed: ' + e.message, 'red');
    document.getElementById('model-dot').style.background = 'var(--red)';
    console.error(e);
  }}

  // Prompt live parsing
  document.getElementById('prompt').addEventListener('input', updateCondDisplay);

  // Slider live display
  document.getElementById('seed').addEventListener('input', e => {{
    document.getElementById('seed-val').textContent = e.target.value;
  }});
  document.getElementById('temp').addEventListener('input', e => {{
    document.getElementById('temp-val').textContent = parseFloat(e.target.value).toFixed(2);
  }});

  // Tag buttons
  document.querySelectorAll('.tag').forEach(tag => {{
    tag.addEventListener('click', () => toggleTag(tag));
  }});
}});

// ── Tag toggle ──
function toggleTag(el) {{
  const dim = el.dataset.key;
  const val = el.dataset.val;
  const isActive = el.classList.contains('active');

  // Deactivate all tags in same dim
  document.querySelectorAll(`.tag[data-key="${{dim}}"]`).forEach(t => {{
    t.classList.remove('active');
  }});

  if (!isActive) {{
    el.classList.add('active');
    activeTags[dim] = val;
  }} else {{
    delete activeTags[dim];
  }}

  rebuildPromptFromTags();
  updateCondDisplay();
}}

function rebuildPromptFromTags() {{
  const parts = Object.values(activeTags);
  document.getElementById('prompt').value = parts.join(' ');
  updateCondDisplay();
}}

// ── Condition display ──
function updateCondDisplay() {{
  const prompt = document.getElementById('prompt').value;
  const cond = parsePrompt(prompt);
  const display = document.getElementById('cond-display');

  const DIM_NAMES = ['subject','age','ethnicity','framing','style','hair','extras'];
  const parts = DIM_NAMES.map(dim => {{
    const val = cond[dim];
    if (val === 0) return `<span class="cond-wild">${{dim}}:—</span>`;
    const label = getConditionLabel(dim, val);
    return `<span class="cond-match">${{dim}}:<b>${{label}}</b></span>`;
  }});
  display.innerHTML = parts.join('  ');
}}

// ── Generate ──
async function generate() {{
  if (!modelReady) {{ showToast('Model not ready yet'); return; }}
  if (isGenerating) return;
  isGenerating = true;

  const btn = document.getElementById('btn-generate');
  btn.disabled = true;
  btn.textContent = '⏳ Generating...';

  const prompt  = document.getElementById('prompt').value || 'individual adult';
  const seed    = parseInt(document.getElementById('seed').value);
  const temp    = parseFloat(document.getElementById('temp').value);

  const condIndices = parsePromptToIndices(prompt);

  showProgress(true);
  setStatusText('Running forward pass...');

  const t0 = performance.now();

  try {{
    const pixels = await runInference(condIndices, seed, temp, (pct) => {{
      setProgress(pct * 100);
    }});

    const ms = Math.round(performance.now() - t0);

    // Render to canvas
    const canvas = document.getElementById('output');
    canvas.style.display = 'block';
    document.getElementById('canvas-placeholder').style.display = 'none';

    renderToCanvas(canvas, pixels, 64, 64);

    // Update meta
    document.getElementById('output-prompt-display').textContent = `"${{prompt}}"`;
    document.getElementById('output-time').textContent = `Generated in ${{ms}}ms`;

    setStatusText(`Done in ${{ms}}ms`);

    // Add to history
    addToHistory(canvas, prompt, seed);

  }} catch(e) {{
    setStatusText('Error: ' + e.message);
    console.error(e);
  }}

  showProgress(false);
  btn.disabled = false;
  btn.textContent = '✦ Generate Portrait';
  isGenerating = false;
}}

// ── History ──
function addToHistory(canvas, prompt, seed) {{
  const dataUrl = canvas.toDataURL('image/png');
  history.unshift({{ dataUrl, prompt, seed, ts: Date.now() }});
  if (history.length > 48) history.pop();
  renderHistory();
}}

function renderHistory() {{
  const grid = document.getElementById('history-grid');
  document.getElementById('history-count').textContent = history.length + ' images';
  grid.innerHTML = history.map((item, i) =>
    `<div class="history-item" onclick="restoreHistory(${{i}})">
       <img src="${{item.dataUrl}}" title="${{item.prompt}}"/>
       <div class="hist-label">${{item.prompt.slice(0,20)}}</div>
     </div>`
  ).join('');
}}

function restoreHistory(i) {{
  const item = history[i];
  const canvas = document.getElementById('output');
  canvas.style.display = 'block';
  document.getElementById('canvas-placeholder').style.display = 'none';
  const img = new Image();
  img.onload = () => {{
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, 64, 64);
  }};
  img.src = item.dataUrl;
  document.getElementById('output-prompt-display').textContent = `"${{item.prompt}}"`;
  document.getElementById('seed').value = item.seed;
  document.getElementById('seed-val').textContent = item.seed;
}}

function clearHistory() {{
  history.length = 0;
  renderHistory();
}}

// ── Download ──
function downloadImage() {{
  const canvas = document.getElementById('output');
  if (canvas.style.display === 'none') {{ showToast('Generate an image first'); return; }}

  // Create a 256×256 version for download
  const big = document.createElement('canvas');
  big.width = big.height = 256;
  const ctx = big.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, 0, 256, 256);

  const a = document.createElement('a');
  a.download = 'portrait_' + Date.now() + '.png';
  a.href = big.toDataURL('image/png');
  a.click();
  showToast('Image downloaded ✓');
}}

function randomSeed() {{
  const seed = Math.floor(Math.random() * 10000);
  document.getElementById('seed').value = seed;
  document.getElementById('seed-val').textContent = seed;
}}

// ── UI helpers ──
function setStatus(msg, color) {{
  document.getElementById('model-status').textContent = msg;
  const colors = {{ green:'var(--green)', orange:'var(--orange)', red:'var(--red)' }};
  document.getElementById('model-dot').style.background = colors[color] || 'var(--text-dim)';
}}

function setStatusText(msg) {{
  document.getElementById('status-text').textContent = msg;
}}

function showProgress(show) {{
  const pb = document.getElementById('progress-bar');
  pb.style.display = show ? 'block' : 'none';
  if (!show) setProgress(0);
}}

function setProgress(pct) {{
  document.getElementById('progress-fill').style.width = pct + '%';
}}

function showToast(msg) {{
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}}
</script>

</body>
</html>"""

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    size_mb = Path(output_path).stat().st_size / (1024**2)
    print(f"\n✓ Built: {output_path}")
    print(f"  File size: {size_mb:.1f} MB")
    print(f"  Open in any modern browser — fully offline")


def main():
    p = argparse.ArgumentParser(description="Build single-file PortraitGAN HTML")
    p.add_argument("--weights",  required=True,  help="Path to weights_b64.js")
    p.add_argument("--output",   default="docs/portrait_gan.html")
    p.add_argument("--title",    default="PortraitGAN")
    args = p.parse_args()

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    build_html(args.weights, args.output, args.title)


if __name__ == "__main__":
    main()
