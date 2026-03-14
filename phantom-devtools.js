/*!
 * phantom-devtools.js  v2.0.0
 * Drop-in DevTools panel for any web project.
 * No build step, no npm, no imports required.
 *
 * Usage:
 *   <script src="phantom-devtools.js"></script>
 *   <script>PhantomDevTools.init();</script>
 *
 * Options (all optional):
 *   PhantomDevTools.init({
 *     position : 'bottom',   // 'bottom' | 'right'  (default: 'bottom')
 *     height   : 320,        // panel height in px when position='bottom'
 *     width    : 480,        // panel width  in px when position='right'
 *     theme    : 'dark',     // 'dark' | 'light'    (default: 'dark')
 *     open     : true,       // start open?          (default: false)
 *     intercept: true,       // intercept console?   (default: true)
 *   });
 *
 * API:
 *   PhantomDevTools.open()   – show panel
 *   PhantomDevTools.close()  – hide panel
 *   PhantomDevTools.toggle() – toggle panel
 *   PhantomDevTools.clear()  – clear console log
 *   PhantomDevTools.destroy()– remove completely
 */

(function (root) {
  'use strict';

  // ─── Guard against double-init ──────────────────────────────────────────────
  if (root.PhantomDevTools) return;

  // ─── CSS (scoped entirely to #phantom-dt-host shadow root) ─────────────────
  const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :host {
      --bg0: #17171b;
      --bg1: #1e1e23;
      --bg2: #25252c;
      --bg3: #2c2c35;
      --bg4: #33333e;
      --bg-hover: #3a3a47;
      --border: #3c3c4a;
      --border-hi: #4e4e60;
      --text0: #eaeaf2;
      --text1: #b4b4c8;
      --text2: #82829a;
      --text3: #50505f;
      --accent: #0088ff;
      --accent2: #00c8d4;
      --green: #57c47a;
      --tag: #e3694e;
      --attr: #6db4d4;
      --val: #a5c261;
      --num: #d19a66;
      --bool: #c678dd;
      --fn: #e5c07b;
      --warn-bg: #282200;
      --warn-fg: #e8c56a;
      --warn-bd: #4a3c00;
      --err-bg:  #281010;
      --err-fg:  #f47070;
      --err-bd:  #4a1818;
      --info-bg: #001828;
      --info-fg: #6ab4d6;
      --info-bd: #003050;
      --sel-bg: #18395c;
      --match-bg: rgba(255,200,0,0.14);
      --match-bd: rgba(255,200,0,0.75);
      --r: 3px;
      --mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
      --ui: 'IBM Plex Sans', system-ui, sans-serif;
      all: initial;
      display: block;
      position: fixed;
      z-index: 2147483647;
      font-family: var(--ui);
      font-size: 13px;
      color: var(--text0);
    }

    /* ── TOGGLE BUTTON (always visible) ── */
    #toggle-fab {
      position: fixed;
      bottom: 12px;
      right: 14px;
      width: 38px;
      height: 38px;
      background: var(--bg1);
      border: 1px solid var(--border-hi);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
      transition: background 0.15s, border-color 0.15s, transform 0.15s;
      box-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }
    #toggle-fab:hover { background: var(--bg4); border-color: var(--accent); transform: scale(1.07); }
    #toggle-fab.has-error { border-color: var(--err-fg); }
    #toggle-fab svg { width: 17px; height: 17px; }
    #err-pip {
      position: absolute;
      top: -2px; right: -2px;
      background: var(--err-fg);
      color: #fff;
      border-radius: 8px;
      font-size: 9px;
      font-family: var(--mono);
      padding: 1px 4px;
      min-width: 14px;
      text-align: center;
      display: none;
    }

    /* ── PANEL SHELL ── */
    #panel {
      position: fixed;
      background: var(--bg0);
      border-top: 2px solid var(--accent);
      display: grid;
      grid-template-rows: 34px 1fr;
      overflow: hidden;
      transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), opacity 0.15s;
      font-family: var(--ui);
    }
    #panel.pos-bottom {
      left: 0; right: 0; bottom: 0;
      border-left: none; border-right: none;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.55);
    }
    #panel.pos-right {
      top: 0; right: 0; bottom: 0;
      border-top: none; border-left: 2px solid var(--accent);
      box-shadow: -4px 0 24px rgba(0,0,0,0.55);
    }
    #panel.hidden {
      transform: translateY(100%);
      opacity: 0;
      pointer-events: none;
    }
    #panel.pos-right.hidden { transform: translateX(100%); }

    /* ── RESIZE HANDLE ── */
    #resize-handle {
      position: absolute;
      background: transparent;
      z-index: 10;
      transition: background 0.1s;
    }
    #resize-handle:hover { background: rgba(0,136,255,0.3); }
    #panel.pos-bottom  #resize-handle { top: 0; left: 0; right: 0; height: 4px; cursor: ns-resize; }
    #panel.pos-right   #resize-handle { top: 0; left: 0; bottom: 0; width: 4px; cursor: ew-resize; }

    /* ── TABS ── */
    #tabs {
      display: flex;
      align-items: stretch;
      background: var(--bg1);
      border-bottom: 1px solid var(--border);
      padding: 0 6px;
      gap: 0;
      flex-shrink: 0;
    }
    .tab {
      font-family: var(--ui);
      font-size: 12px;
      color: var(--text2);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 0 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: color 0.1s;
      margin-bottom: -1px;
    }
    .tab:hover { color: var(--text0); }
    .tab.active { color: var(--text0); border-bottom-color: var(--accent); background: var(--bg0); }
    .tab-badge {
      background: var(--err-bg);
      color: var(--err-fg);
      border-radius: 8px;
      font-size: 9px;
      font-family: var(--mono);
      padding: 1px 5px;
      min-width: 16px;
      text-align: center;
      display: none;
    }
    .tab-badge.warn { background: var(--warn-bg); color: var(--warn-fg); }
    #tabs-right { margin-left: auto; display: flex; align-items: center; gap: 4px; }
    .icon-btn {
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--r);
      color: var(--text2);
      cursor: pointer;
      font-size: 11px;
      font-family: var(--ui);
      padding: 3px 7px;
      display: flex; align-items: center; gap: 4px;
      transition: all 0.1s;
    }
    .icon-btn:hover { background: var(--bg4); color: var(--text0); border-color: var(--border); }
    .icon-btn.active { background: rgba(0,136,255,0.15); color: var(--accent); border-color: rgba(0,136,255,0.35); }
    .icon-btn svg { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; }

    /* ── PANELS ── */
    #panels { overflow: hidden; display: flex; flex-direction: column; }
    .panel { display: none; flex: 1; overflow: hidden; flex-direction: column; }
    .panel.active { display: flex; }

    /* ══ INSPECTOR ══════════════════════════════════════════════════ */
    #selector-bar {
      background: var(--bg2);
      border-bottom: 1px solid var(--border);
      padding: 5px 8px;
      display: flex; gap: 6px; align-items: center;
      flex-shrink: 0;
    }
    #css-sel-input {
      flex: 1;
      background: var(--bg3);
      border: 1px solid var(--border);
      border-radius: var(--r);
      color: var(--text0);
      font-family: var(--mono);
      font-size: 12px;
      padding: 4px 7px;
      outline: none;
      transition: border-color 0.15s;
    }
    #css-sel-input:focus  { border-color: var(--accent); }
    #css-sel-input.valid  { border-color: var(--val); }
    #css-sel-input.bad    { border-color: var(--err-fg); color: var(--err-fg); }
    #sel-count { font-family: var(--mono); font-size: 11px; color: var(--text2); white-space: nowrap; min-width: 68px; }

    #insp-body { display: grid; grid-template-rows: 1fr 3px 200px; flex: 1; overflow: hidden; }
    #dom-pane {
      overflow: auto; padding: 4px 0;
      scrollbar-width: thin; scrollbar-color: var(--border) transparent;
      font-family: var(--mono); font-size: 12px; line-height: 1.65;
    }
    #insp-divider { background: var(--border); cursor: row-resize; }
    #insp-divider:hover { background: var(--accent); }
    #styles-split { display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; }
    #computed-pane { border-right: 1px solid var(--border); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
    #boxmodel-pane { padding: 10px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }

    .pane-hdr {
      font-family: var(--ui);
      font-size: 10px; font-weight: 500;
      text-transform: uppercase; letter-spacing: 0.07em;
      color: var(--text2);
      padding: 5px 10px 4px;
      border-bottom: 1px solid var(--border);
      background: var(--bg2);
      position: sticky; top: 0; z-index: 1;
    }
    .style-row {
      display: flex; gap: 6px; padding: 2px 10px;
      font-family: var(--mono); font-size: 11px; line-height: 1.7;
      border-bottom: 1px solid rgba(255,255,255,0.025);
      transition: background 0.06s;
    }
    .style-row:hover { background: var(--bg-hover); }
    .sp { color: var(--attr); flex-shrink: 0; }
    .sv { color: var(--val); word-break: break-all; }
    .sv.swatch::before {
      content: ''; display: inline-block;
      width: 9px; height: 9px; border-radius: 2px;
      margin-right: 4px; vertical-align: middle;
      border: 1px solid rgba(255,255,255,0.18);
      background: var(--_sw);
    }

    /* DOM tree */
    .dr {
      display: flex; align-items: baseline; padding: 1px 0;
      cursor: pointer; white-space: nowrap;
      border: 1px solid transparent; border-radius: 2px;
      transition: background 0.05s;
    }
    .dr:hover { background: var(--bg4); }
    .dr.sel { background: var(--sel-bg); border-color: rgba(0,136,255,0.5); }
    .dr.hl  { outline: 1px solid var(--match-bd); background: var(--match-bg); }
    .dt { display: inline-block; width: 14px; text-align: center; color: var(--text3); font-size: 9px; cursor: pointer; flex-shrink: 0; transition: transform 0.1s; user-select: none; }
    .dt.o { transform: rotate(90deg); }
    .tn { color: var(--tag); }
    .tc { color: var(--tag); opacity: 0.6; }
    .an { color: var(--attr); }
    .av { color: var(--val); }
    .tx { color: var(--text2); font-style: italic; }
    .cm { color: var(--text3); font-style: italic; }
    .dc { display: none; }
    .dc.o { display: block; }

    #breadcrumb {
      background: var(--bg1); border-top: 1px solid var(--border);
      padding: 4px 8px; font-family: var(--mono); font-size: 11px;
      color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      flex-shrink: 0;
    }
    #breadcrumb .bt { color: var(--tag); }
    #breadcrumb .bs { color: var(--text3); margin: 0 3px; }

    /* Box model */
    .bx { border: 1px solid; position: relative; display: flex; align-items: center; justify-content: center; }
    .bx-lbl { position: absolute; top: 3px; left: 5px; font-family: var(--mono); font-size: 9px; opacity: 0.65; }
    .bx-m { border-color: #9e7b52; background: rgba(158,123,82,0.1); color: #c9a87a; padding: 12px; }
    .bx-b { border-color: #6b8e6b; background: rgba(107,142,107,0.1); color: #8ab88a; padding: 12px; }
    .bx-p { border-color: #5b8a9e; background: rgba(91,138,158,0.1); color: #7ab4d0; padding: 12px; }
    .bx-c { border-color: var(--accent); background: rgba(0,136,255,0.08); color: var(--accent); padding: 10px; min-height: 38px; }
    .bx-val { font-family: var(--mono); font-size: 10px; position: absolute; }
    .bx-t { top: 3px; left: 50%; transform: translateX(-50%); }
    .bx-r { right: 4px; top: 50%; transform: translateY(-50%); }
    .bx-b2{ bottom: 3px; left: 50%; transform: translateX(-50%); }
    .bx-l { left: 4px; top: 50%; transform: translateY(-50%); }
    .bx-dim { font-family: var(--mono); font-size: 11px; color: var(--accent); text-align: center; }

    /* ══ CONSOLE ════════════════════════════════════════════════════ */
    #con-toolbar {
      background: var(--bg2); border-bottom: 1px solid var(--border);
      display: flex; align-items: center; gap: 4px;
      padding: 4px 8px; flex-shrink: 0; flex-wrap: wrap;
    }
    .fb {
      background: transparent; border: 1px solid transparent; border-radius: var(--r);
      color: var(--text2); cursor: pointer; font-size: 11px; font-family: var(--ui);
      padding: 2px 8px; transition: all 0.1s;
    }
    .fb:hover { background: var(--bg4); color: var(--text0); }
    .fb.on { border-color: var(--border-hi); background: var(--bg4); color: var(--text0); }
    .fb.warn.on { border-color: var(--warn-bd); color: var(--warn-fg); background: var(--warn-bg); }
    .fb.error.on { border-color: var(--err-bd); color: var(--err-fg); background: var(--err-bg); }
    .fb.info.on  { border-color: var(--info-bd); color: var(--info-fg); background: var(--info-bg); }
    #con-filter {
      background: var(--bg3); border: 1px solid var(--border); border-radius: var(--r);
      color: var(--text0); font-family: var(--mono); font-size: 11px;
      padding: 3px 7px; outline: none; width: 130px; transition: border-color 0.15s;
    }
    #con-filter:focus { border-color: var(--accent); }
    .tsep { width: 1px; background: var(--border); height: 16px; flex-shrink: 0; }
    #msg-count { font-size: 11px; color: var(--text3); margin-left: auto; font-family: var(--mono); }

    #log-area {
      flex: 1; overflow-y: auto; overflow-x: hidden;
      scrollbar-width: thin; scrollbar-color: var(--border) transparent;
    }
    .le {
      display: grid; grid-template-columns: 18px 1fr auto;
      grid-template-rows: auto auto;
      border-bottom: 1px solid rgba(255,255,255,0.03);
      font-family: var(--mono); font-size: 12px; line-height: 1.55;
      cursor: pointer; transition: background 0.05s;
    }
    .le:hover { background: var(--bg4); }
    .le.warn  { background: var(--warn-bg); border-color: var(--warn-bd); }
    .le.error { background: var(--err-bg);  border-color: var(--err-bd); }
    .le.info  { background: var(--info-bg); border-color: var(--info-bd); }
    .le.debug { opacity: 0.65; }
    .le-exp {
      grid-column: 1; grid-row: 1;
      cursor: pointer; color: var(--text3); font-size: 9px;
      padding: 5px 0 0 5px; transition: transform 0.12s; user-select: none;
    }
    .le-exp.o { transform: rotate(90deg); color: var(--text1); }
    .le-body { grid-column: 2; grid-row: 1; padding: 4px 6px 4px 2px; word-break: break-word; overflow-wrap: anywhere; }
    .le-time { grid-column: 3; grid-row: 1; padding: 5px 8px 0 0; font-size: 10px; color: var(--text3); white-space: nowrap; }
    .le-stack {
      grid-column: 1 / -1; grid-row: 2;
      display: none; padding: 0 8px 6px 20px;
      border-top: 1px solid rgba(255,255,255,0.04);
      background: rgba(0,0,0,0.18);
    }
    .le-stack.o { display: block; }
    .sf { display: flex; gap: 8px; padding: 2px 0; font-size: 11px; line-height: 1.5; }
    .sf-at { color: var(--text3); }
    .sf-fn { color: var(--fn); }
    .sf-loc { color: var(--accent); text-decoration: underline dotted; cursor: pointer; }
    .sf-loc:hover { color: var(--accent2); }

    /* Value colours */
    .vs  { color: var(--val); }
    .vs::before { content: '"'; }
    .vs::after  { content: '"'; }
    .vn  { color: var(--num); }
    .vb  { color: var(--bool); }
    .vnl { color: var(--text2); font-style: italic; }
    .vf  { color: var(--fn); }
    .vt  { color: var(--tag); }
    .ve  { color: var(--err-fg); }
    .vk  { color: var(--attr); }
    .vp  { color: var(--text3); }

    /* REPL */
    #repl-bar {
      background: var(--bg2); border-top: 1px solid var(--border);
      display: flex; align-items: center; padding: 0 8px; gap: 6px;
      flex-shrink: 0; min-height: 34px;
    }
    #repl-pfx { color: var(--text3); font-family: var(--mono); font-size: 13px; flex-shrink: 0; user-select: none; }
    #repl-in {
      flex: 1; background: transparent; border: none;
      color: var(--text0); font-family: var(--mono); font-size: 12px;
      outline: none; padding: 6px 0;
    }
    #repl-run {
      background: var(--accent); border: none; border-radius: var(--r);
      color: #fff; cursor: pointer; font-size: 11px; font-family: var(--ui);
      padding: 3px 10px; font-weight: 500; transition: background 0.1s;
    }
    #repl-run:hover { background: #006ee0; }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--border-hi); }

    /* Muted helper */
    .muted { color: var(--text2); padding: 12px 10px; font-size: 11px; }
  `;

  // ─── HTML template ──────────────────────────────────────────────────────────
  const ICONS = {
    cursor: `<svg viewBox="0 0 14 14"><path d="M2 2 L12 7 L8 8.5 L6 12 Z" stroke="currentColor" fill="none" stroke-width="1.2" stroke-linejoin="round"/></svg>`,
    clear:  `<svg viewBox="0 0 14 14"><line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/></svg>`,
    logo:   `<svg viewBox="0 0 14 14" fill="none"><polygon points="7,1 13,4.5 13,9.5 7,13 1,9.5 1,4.5" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="7" r="2" fill="currentColor" opacity="0.6"/></svg>`,
    insp:   `<svg viewBox="0 0 14 14"><rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" stroke-width="1.1" fill="none"/><line x1="3" y1="5.5" x2="11" y2="5.5" stroke="currentColor" stroke-width="1"/><line x1="3" y1="8" x2="8" y2="8" stroke="currentColor" stroke-width="1"/></svg>`,
    con:    `<svg viewBox="0 0 14 14"><polyline points="2,4.5 5.5,8 2,11.5" stroke="currentColor" stroke-width="1.2" fill="none"/><line x1="7" y1="11" x2="12" y2="11" stroke="currentColor" stroke-width="1.2"/></svg>`,
    close:  `<svg viewBox="0 0 14 14"><line x1="2" y1="2" x2="12" y2="12"/><line x1="12" y1="2" x2="2" y2="12"/></svg>`,
  };

  function buildHTML() {
    return `
<div id="toggle-fab" title="Toggle DevTools (Alt+D)">
  ${ICONS.logo}
  <span id="err-pip"></span>
</div>

<div id="panel" class="pos-bottom hidden">
  <div id="resize-handle"></div>
  <div id="tabs">
    <button class="tab active" data-tab="inspector">${ICONS.insp} Inspector</button>
    <button class="tab" data-tab="console">${ICONS.con} Console
      <span class="tab-badge error" id="err-badge">0</span>
      <span class="tab-badge warn"  id="warn-badge">0</span>
    </button>
    <div id="tabs-right">
      <button class="icon-btn" id="pick-btn" title="Pick element">${ICONS.cursor} Pick</button>
      <button class="icon-btn" id="clear-btn" title="Clear console">${ICONS.clear}</button>
      <button class="icon-btn" id="close-btn" title="Close DevTools">${ICONS.close}</button>
    </div>
  </div>

  <div id="panels">

    <!-- INSPECTOR -->
    <div class="panel active" data-panel="inspector">
      <div id="selector-bar">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="color:var(--text2);flex-shrink:0;stroke:currentColor;stroke-width:1.2"><circle cx="5" cy="5" r="3.5"/><line x1="8" y1="8" x2="11" y2="11"/></svg>
        <input id="css-sel-input" type="text" placeholder="CSS selector — div.class, #id, [attr=val], :hover …" autocomplete="off" />
        <span id="sel-count">—</span>
        <button class="icon-btn" id="pick-btn2" title="Pick element">${ICONS.cursor} Pick</button>
      </div>
      <div id="insp-body">
        <div id="dom-pane"><div class="muted">Loading…</div></div>
        <div id="insp-divider"></div>
        <div id="styles-split">
          <div id="computed-pane">
            <div class="pane-hdr">Computed Styles</div>
            <div class="muted">Select an element</div>
          </div>
          <div id="boxmodel-pane">
            <div class="pane-hdr" style="margin:-10px -10px 10px;padding:5px 10px 4px">Box Model</div>
            <div id="box-diagram"><div class="muted" style="padding:0">No element selected</div></div>
          </div>
        </div>
      </div>
      <div id="breadcrumb">No element selected</div>
    </div>

    <!-- CONSOLE -->
    <div class="panel" data-panel="console">
      <div id="con-toolbar">
        <button class="fb on" data-f="all">All</button>
        <button class="fb" data-f="log">Log</button>
        <button class="fb info" data-f="info">Info</button>
        <button class="fb warn" data-f="warn">Warn</button>
        <button class="fb error" data-f="error">Error</button>
        <button class="fb" data-f="debug">Debug</button>
        <div class="tsep"></div>
        <input id="con-filter" type="text" placeholder="Filter output…" />
        <span id="msg-count">0 messages</span>
      </div>
      <div id="log-area"></div>
      <div id="repl-bar">
        <span id="repl-pfx">&gt;&gt;&gt;</span>
        <input id="repl-in" type="text" placeholder="JavaScript expression…" autocomplete="off" spellcheck="false" />
        <button id="repl-run">Run</button>
      </div>
    </div>

  </div><!-- /panels -->
</div><!-- /panel -->

<!-- Picker overlay (lives in light DOM) -->
<div id="phantom-pick-overlay"></div>
    `;
  }

  // ─── PICKER OVERLAY STYLES (must be in light DOM, not shadow) ───────────────
  const OVERLAY_STYLE = `
    #phantom-pick-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      cursor: crosshair;
    }
    .phantom-pick-highlight {
      position: fixed;
      pointer-events: none;
      z-index: 2147483645;
      background: rgba(0,136,255,0.08);
      outline: 2px dashed rgba(0,200,255,0.8);
      transition: none;
    }
  `;

  // ─── MAIN FACTORY ───────────────────────────────────────────────────────────
  function PhantomDevTools() {}

  PhantomDevTools.prototype.init = function (opts) {
    opts = opts || {};
    var self = this;
    self._opts = {
      position:  opts.position  || 'bottom',
      height:    opts.height    || 320,
      width:     opts.width     || 480,
      theme:     opts.theme     || 'dark',
      open:      opts.open      !== undefined ? opts.open : false,
      intercept: opts.intercept !== undefined ? opts.intercept : true,
    };
    self._state = {
      logs: [], filter: 'all', textFilter: '',
      errCount: 0, warnCount: 0,
      picking: false, selectedNode: null, selectorMatches: [],
      replHistory: [], replIdx: -1,
      isOpen: false,
    };

    self._buildDOM();
    self._bindEvents();
    self._interceptConsole();
    self._buildDOMTree();

    if (self._opts.open) self.open();
    self._log('info', [{t:'string',v:'Phantom DevTools v2 ready — select an element or type an expression below'}], []);
    return self;
  };

  // ─── DOM Construction ───────────────────────────────────────────────────────
  PhantomDevTools.prototype._buildDOM = function () {
    var self = this;
    // Shadow host
    var host = document.createElement('div');
    host.id = 'phantom-dt-host';
    host.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;top:0;left:0;';
    document.body.appendChild(host);
    self._host = host;

    var shadow = host.attachShadow({ mode: 'open' });
    self._shadow = shadow;

    // Inject style
    var styleEl = document.createElement('style');
    styleEl.textContent = STYLES;
    shadow.appendChild(styleEl);

    // Inject content
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'pointer-events:auto;';
    wrapper.innerHTML = buildHTML();
    shadow.appendChild(wrapper);
    self._root = wrapper;

    // Overlay + highlight span in light DOM
    var overStyle = document.createElement('style');
    overStyle.textContent = OVERLAY_STYLE;
    document.head.appendChild(overStyle);
    self._overStyle = overStyle;

    self._overlay = wrapper.querySelector('#phantom-pick-overlay') || (() => {
      var o = document.createElement('div');
      o.id = 'phantom-pick-overlay';
      document.body.appendChild(o);
      return o;
    })();
    // Move overlay to body (it needs to be in light DOM)
    document.body.appendChild(self._overlay);

    self._hl = document.createElement('div');
    self._hl.className = 'phantom-pick-highlight';
    self._hl.style.display = 'none';
    document.body.appendChild(self._hl);

    // Cache refs
    var q = function (sel) { return shadow.querySelector(sel); };
    self.$ = q;
    self._panel      = q('#panel');
    self._tabs       = q('#tabs');
    self._fab        = q('#toggle-fab');
    self._errBadge   = q('#err-badge');
    self._warnBadge  = q('#warn-badge');
    self._errPip     = q('#err-pip');
    self._logArea    = q('#log-area');
    self._domPane    = q('#dom-pane');
    self._csInput    = q('#css-sel-input');
    self._selCount   = q('#sel-count');
    self._computed   = q('#computed-pane');
    self._boxDiagram = q('#box-diagram');
    self._breadcrumb = q('#breadcrumb');
    self._replIn     = q('#repl-in');
    self._msgCount   = q('#msg-count');
    self._conFilter  = q('#con-filter');
    self._inspBody   = q('#insp-body');

    // Apply position + size
    self._applyLayout();
  };

  PhantomDevTools.prototype._applyLayout = function () {
    var self = this, p = self._panel, opts = self._opts;
    p.classList.remove('pos-bottom','pos-right');
    p.classList.add('pos-' + opts.position);
    if (opts.position === 'bottom') {
      p.style.height = opts.height + 'px';
      p.style.width  = '';
    } else {
      p.style.width  = opts.width + 'px';
      p.style.height = '';
    }
    // Move fab out of the way
    self._fab.style.bottom = (opts.position === 'bottom' && self._state.isOpen) ? (opts.height + 16) + 'px' : '12px';
  };

  // ─── Event Binding ──────────────────────────────────────────────────────────
  PhantomDevTools.prototype._bindEvents = function () {
    var self = this, s = self._shadow;

    // FAB toggle
    self._fab.addEventListener('click', function () { self.toggle(); });

    // Close button
    s.querySelector('#close-btn').addEventListener('click', function () { self.close(); });

    // Tabs
    s.querySelectorAll('.tab').forEach(function (btn) {
      btn.addEventListener('click', function () { self._switchTab(btn.dataset.tab); });
    });

    // Filter buttons
    s.querySelectorAll('.fb').forEach(function (btn) {
      btn.addEventListener('click', function () { self._setFilter(btn); });
    });

    // Text filter
    self._conFilter.addEventListener('input', function () {
      self._state.textFilter = self._conFilter.value;
      self._rebuildLog();
    });

    // Clear button
    s.querySelector('#clear-btn').addEventListener('click', function () { self.clear(); });

    // Pick buttons
    s.querySelector('#pick-btn').addEventListener('click', function () { self._togglePicker(); });
    s.querySelector('#pick-btn2').addEventListener('click', function () { self._togglePicker(); });

    // REPL
    self._replIn.addEventListener('keydown', function (e) { self._replKey(e); });
    s.querySelector('#repl-run').addEventListener('click', function () { self._runRepl(); });

    // CSS selector
    var _csDebounce = null;
    self._csInput.addEventListener('input', function () {
      clearTimeout(_csDebounce);
      _csDebounce = setTimeout(function () { self._runSelector(self._csInput.value); }, 200);
    });
    self._csInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { self._csInput.value = ''; self._clearSelectorHL(); self._selCount.textContent = '—'; self._csInput.className = ''; }
      if (e.key === 'Enter')  { self._runSelector(self._csInput.value); }
    });

    // Inspector divider drag
    var div = s.querySelector('#insp-divider');
    div.addEventListener('mousedown', function (e) {
      e.preventDefault();
      var startY = e.clientY;
      var startH = self._inspBody.offsetHeight;
      var onMove = function (me) {
        var delta = me.clientY - startY;
        var rows = self._inspBody.style.gridTemplateRows || '1fr 3px 200px';
        var parts = rows.split(' ');
        var botH = Math.max(100, Math.min(400, 200 - delta));
        self._inspBody.style.gridTemplateRows = '1fr 3px ' + botH + 'px';
      };
      var onUp = function () { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // Panel resize handle
    var rh = s.querySelector('#resize-handle');
    rh.addEventListener('mousedown', function (e) {
      e.preventDefault();
      var isBottom = self._opts.position === 'bottom';
      var startCoord = isBottom ? e.clientY : e.clientX;
      var startSize  = isBottom ? self._opts.height : self._opts.width;
      var onMove = function (me) {
        var coord = isBottom ? me.clientY : me.clientX;
        var delta = startCoord - coord;
        if (isBottom) {
          self._opts.height = Math.max(200, Math.min(window.innerHeight - 60, startSize + delta));
          self._panel.style.height = self._opts.height + 'px';
        } else {
          self._opts.width = Math.max(320, Math.min(window.innerWidth - 60, startSize - delta));
          self._panel.style.width = self._opts.width + 'px';
        }
        self._applyLayout();
      };
      var onUp = function () { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // Overlay (picker)
    self._overlay.addEventListener('mousemove', function (e) {
      if (!self._state.picking) return;
      var el = self._elAtPoint(e.clientX, e.clientY);
      if (el) {
        var r = el.getBoundingClientRect();
        self._hl.style.cssText = 'display:block;position:fixed;left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px;pointer-events:none;z-index:2147483645;background:rgba(0,136,255,0.08);outline:2px dashed rgba(0,200,255,0.8);';
      }
    });
    self._overlay.addEventListener('click', function (e) {
      var el = self._elAtPoint(e.clientX, e.clientY);
      if (el) { self._togglePicker(); self._switchTab('inspector'); self._buildDOMTree(); setTimeout(function () { self._expandToNode(el); }, 80); }
    });

    // Keyboard shortcut Alt+D
    document.addEventListener('keydown', function (e) {
      if (e.altKey && e.key === 'd') { e.preventDefault(); self.toggle(); }
    });

    // postMessage bridge (for iframes if needed)
    window.addEventListener('message', function (e) {
      if (!e.data || !e.data.__phantom) return;
      var d = e.data;
      if (d.method === '__net') {
        if (d.event === 'req') self._log('info', [{t:'string',v:'→ '+d.netMethod+' '+d.url}], []);
        if (d.event === 'res') self._log('info', [{t:'string',v:'← '+d.status+' '+d.url+' ('+d.duration+'ms)'}], []);
        if (d.event === 'err') self._log('error', [{t:'error',v:'fetch failed: '+d.error+' '+d.url}], []);
        return;
      }
      if (d.method === 'clear') { self.clear(); return; }
      self._log(d.method, d.args, d.stack || []);
    });
  };

  // ─── Panel open / close / toggle ────────────────────────────────────────────
  PhantomDevTools.prototype.open = function () {
    this._panel.classList.remove('hidden');
    this._state.isOpen = true;
    this._applyLayout();
  };
  PhantomDevTools.prototype.close = function () {
    this._panel.classList.add('hidden');
    this._state.isOpen = false;
    this._applyLayout();
  };
  PhantomDevTools.prototype.toggle = function () {
    this._state.isOpen ? this.close() : this.open();
  };

  // ─── Tab switching ───────────────────────────────────────────────────────────
  PhantomDevTools.prototype._switchTab = function (name) {
    var s = this._shadow;
    s.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('active', t.dataset.tab === name); });
    s.querySelectorAll('.panel[data-panel]').forEach(function (p) { p.classList.toggle('active', p.dataset.panel === name); });
    if (name === 'inspector') this._buildDOMTree();
  };

  // ─── Console interception ────────────────────────────────────────────────────
  PhantomDevTools.prototype._interceptConsole = function () {
    var self = this;
    if (!self._opts.intercept) return;
    var METHODS = ['log','warn','error','info','debug','table','dir','assert','count','clear','group','groupEnd'];
    self._origConsole = {};
    METHODS.forEach(function (m) {
      self._origConsole[m] = console[m] ? console[m].bind(console) : function () {};
      console[m] = function () {
        var args = Array.prototype.slice.call(arguments);
        self._origConsole[m].apply(console, args);
        if (m === 'clear') { self.clear(); return; }
        if (m === 'assert') { if (args[0]) return; args = ['Assertion failed:'].concat(args.slice(1)); }
        self._log(m, args.map(function (a) { return self._ser(a, 0); }), self._getStack(3));
      };
    });
    window.addEventListener('error', function (e) {
      self._log('error', [{t:'error',v:(e.error ? e.error.message : e.message)}],
        [{fn:'(global)', file: (e.filename||'').split('/').slice(-1)[0], line: String(e.lineno), col: String(e.colno)}]);
    }, true);
    window.addEventListener('unhandledrejection', function (e) {
      self._log('error', [{t:'error',v:'Unhandled Promise Rejection: '+(e.reason&&e.reason.message||String(e.reason))}], self._getStack(2));
    }, true);
    // Fetch intercept
    if (typeof window.fetch === 'function' && !window.__phantomFetchWrapped) {
      window.__phantomFetchWrapped = true;
      var origFetch = window.fetch;
      window.fetch = function () {
        var args = Array.prototype.slice.call(arguments);
        var url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || String(args[0]);
        var method = (args[1] && args[1].method) || 'GET';
        var t0 = performance.now();
        self._log('info', [{t:'string',v:'→ fetch '+method+' '+url}], []);
        return origFetch.apply(this, args).then(function (r) {
          self._log('info', [{t:'string',v:'← '+r.status+' '+url+' ('+Math.round(performance.now()-t0)+'ms)'}], []);
          return r;
        }, function (err) {
          self._log('error', [{t:'error',v:'fetch failed: '+err.message+' '+url}], []);
          throw err;
        });
      };
    }
  };

  // ─── Stack capture ───────────────────────────────────────────────────────────
  PhantomDevTools.prototype._getStack = function (skip) {
    try {
      throw new Error();
    } catch (e) {
      return (e.stack || '').split('\n').slice(skip || 3).filter(function (l) {
        return l.trim() && l.indexOf('phantom-devtools') < 0;
      }).slice(0, 8).map(function (line) {
        var m = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/) ||
                line.match(/at\s+(.+?):(\d+):(\d+)/) ||
                line.match(/(.+?)@(.+?):(\d+):(\d+)/);
        if (!m) return {fn: line.trim(), file: '', line: '', col: ''};
        if (m.length === 5) return {fn: m[1], file: m[2].split('/').slice(-2).join('/'), line: m[3], col: m[4]};
        return {fn: m[1], file: m[1].split('/').slice(-1)[0], line: m[2], col: m[3]};
      });
    }
  };

  // ─── Value serializer ────────────────────────────────────────────────────────
  PhantomDevTools.prototype._ser = function (v, d) {
    if (d === undefined) d = 0;
    if (v === null)      return {t:'null',      v:'null'};
    if (v === undefined) return {t:'undefined', v:'undefined'};
    if (typeof v === 'string')  return {t:'string',  v: v.slice(0, 800)};
    if (typeof v === 'number')  return {t:'number',  v: v};
    if (typeof v === 'boolean') return {t:'boolean', v: v};
    if (typeof v === 'function') return {t:'function', v:'ƒ '+(v.name||'anonymous')+'()'};
    if (v instanceof Error) return {t:'error', v: v.message};
    if (v instanceof Element) return {t:'element', v:'<'+v.tagName.toLowerCase()+(v.id?'#'+v.id:'')+'>'};
    if (Array.isArray(v)) {
      if (d > 1) return {t:'array', v:'Array('+v.length+')', len: v.length};
      var self = this;
      return {t:'array', v: v.slice(0,30).map(function (x) { return self._ser(x, d+1); }), len: v.length};
    }
    if (typeof v === 'object') {
      if (d > 1) return {t:'object', v:'[Object]'};
      try {
        var self = this, keys = Object.keys(v).slice(0,30), e = {};
        keys.forEach(function (k) { e[k] = self._ser(v[k], d+1); });
        return {t:'object', v: e, len: Object.keys(v).length};
      } catch (_) { return {t:'object', v:'[Object]'}; }
    }
    return {t:'primitive', v: String(v)};
  };

  // ─── Log entry ───────────────────────────────────────────────────────────────
  PhantomDevTools.prototype._log = function (method, args, stack) {
    var NORM = {warn:'warn', error:'error', info:'info', debug:'debug'};
    var type = NORM[method] || 'log';
    var entry = {id: Math.random().toString(36).slice(2), type: type, args: args, stack: stack || [], time: Date.now()};
    this._state.logs.push(entry);
    if (type === 'error') { this._state.errCount++; this._errBadge.style.display=''; this._errBadge.textContent = this._state.errCount; this._errPip.style.display=''; this._errPip.textContent = this._state.errCount; this._fab.classList.add('has-error'); }
    if (type === 'warn')  { this._state.warnCount++; this._warnBadge.style.display=''; this._warnBadge.textContent = this._state.warnCount; }
    this._renderEntry(entry, true);
    this._updateCount();
  };

  PhantomDevTools.prototype._renderEntry = function (entry, scroll) {
    var self = this, st = self._state;
    if (st.filter !== 'all' && st.filter !== entry.type) return;
    if (st.textFilter && self._argsText(entry.args).toLowerCase().indexOf(st.textFilter.toLowerCase()) < 0) return;

    var div = document.createElement('div');
    div.className = 'le ' + entry.type;

    var exp = document.createElement('div');
    exp.className = 'le-exp';
    exp.textContent = entry.stack && entry.stack.length ? '▶' : ' ';
    if (entry.stack && entry.stack.length) {
      exp.addEventListener('click', function (e) { e.stopPropagation(); exp.classList.toggle('o'); var st = div.querySelector('.le-stack'); if (st) st.classList.toggle('o'); });
    }
    div.appendChild(exp);

    var body = document.createElement('div');
    body.className = 'le-body';
    body.innerHTML = self._renderArgs(entry.args);
    div.appendChild(body);

    var timeEl = document.createElement('div');
    timeEl.className = 'le-time';
    var d = new Date(entry.time);
    timeEl.textContent = d.toTimeString().slice(0,8)+'.'+String(d.getMilliseconds()).padStart(3,'0');
    div.appendChild(timeEl);

    if (entry.stack && entry.stack.length) {
      var stackDiv = document.createElement('div');
      stackDiv.className = 'le-stack';
      stackDiv.innerHTML = entry.stack.map(function (f) {
        return '<div class="sf"><span class="sf-at">at</span> <span class="sf-fn">'+self._esc(f.fn||'(anonymous)')+'</span>'+(f.file ? ' <span class="sf-loc">'+self._esc(f.file)+(f.line?':'+f.line:'')+(f.col?':'+f.col:'')+'</span>' : '')+'</div>';
      }).join('');
      div.appendChild(stackDiv);
    }

    self._logArea.appendChild(div);
    if (scroll) self._logArea.scrollTop = self._logArea.scrollHeight;
  };

  PhantomDevTools.prototype._argsText = function (args) {
    return (args||[]).map(function (a) {
      if (!a || typeof a !== 'object') return String(a);
      if (a.t === 'string') return a.v;
      if (a.t === 'object' || a.t === 'array') { try { return JSON.stringify(a.v); } catch(_){} }
      return String(a.v);
    }).join(' ');
  };

  PhantomDevTools.prototype._renderArgs = function (args) {
    var self = this;
    return (args||[]).map(function (a) { return self._renderVal(a, 0); }).join('<span class="vp"> </span>');
  };

  PhantomDevTools.prototype._renderVal = function (v, d) {
    var self = this;
    if (!v || typeof v !== 'object') return self._esc(String(v));
    var t = v.t, val = v.v, len = v.len;
    if (t === 'null')      return '<span class="vnl">null</span>';
    if (t === 'undefined') return '<span class="vnl">undefined</span>';
    if (t === 'string')    return '<span class="vs">'+self._esc(val)+'</span>';
    if (t === 'number')    return '<span class="vn">'+self._esc(String(val))+'</span>';
    if (t === 'boolean')   return '<span class="vb">'+val+'</span>';
    if (t === 'function')  return '<span class="vf">'+self._esc(val)+'</span>';
    if (t === 'element')   return '<span class="vt">'+self._esc(val)+'</span>';
    if (t === 'error')     return '<span class="ve">'+self._esc(val)+'</span>';
    if (t === 'array') {
      if (d > 1) return '<span class="vp">[</span><span class="vnl">Array('+len+')</span><span class="vp">]</span>';
      if (Array.isArray(val)) {
        var items = val.slice(0,10).map(function (i) { return self._renderVal(i, d+1); });
        var more  = len > 10 ? '<span class="vnl">, …'+(len-10)+' more</span>' : '';
        return '<span class="vp">[</span>'+items.join('<span class="vp">, </span>')+more+'<span class="vp">]</span>';
      }
      return '<span class="vnl">'+self._esc(String(val))+'</span>';
    }
    if (t === 'object') {
      if (d > 1) return '<span class="vp">{…}</span>';
      if (typeof val === 'object' && val !== null) {
        var entries = Object.entries(val).slice(0,6);
        var more2 = len > 6 ? '<span class="vnl">, …'+(len-6)+' more</span>' : '';
        var parts = entries.map(function (kv) { return '<span class="vk">'+self._esc(kv[0])+'</span><span class="vp">: </span>'+self._renderVal(kv[1], d+1); });
        return '<span class="vp">{</span>'+parts.join('<span class="vp">, </span>')+more2+'<span class="vp">}</span>';
      }
      return '<span class="vnl">'+self._esc(String(val))+'</span>';
    }
    return '<span class="vnl">'+self._esc(String(val))+'</span>';
  };

  PhantomDevTools.prototype._esc = function (s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };

  PhantomDevTools.prototype._setFilter = function (btn) {
    this._shadow.querySelectorAll('.fb').forEach(function (b) { b.classList.remove('on'); });
    btn.classList.add('on');
    this._state.filter = btn.dataset.f;
    this._rebuildLog();
  };

  PhantomDevTools.prototype._rebuildLog = function () {
    this._logArea.innerHTML = '';
    var self = this;
    this._state.logs.forEach(function (e) { self._renderEntry(e, false); });
    this._updateCount();
  };

  PhantomDevTools.prototype._updateCount = function () {
    this._msgCount.textContent = this._state.logs.length + ' message' + (this._state.logs.length !== 1 ? 's' : '');
  };

  PhantomDevTools.prototype.clear = function () {
    this._state.logs = [];
    this._state.errCount = 0;
    this._state.warnCount = 0;
    this._errBadge.style.display  = 'none';
    this._warnBadge.style.display = 'none';
    this._errPip.style.display    = 'none';
    this._fab.classList.remove('has-error');
    this._logArea.innerHTML = '';
    this._updateCount();
  };

  // ─── REPL ────────────────────────────────────────────────────────────────────
  PhantomDevTools.prototype._runRepl = function () {
    var self = this, code = self._replIn.value.trim();
    if (!code) return;
    self._state.replHistory.unshift(code);
    self._state.replIdx = -1;
    self._log('log', [{t:'string', v:'> '+code}], []);
    try {
      var result = (new Function('return (' + code + ')'))();
      self._log('log', [self._ser(result, 0)], []);
    } catch (e) {
      self._log('error', [{t:'error',v:e.message}], (e.stack||'').split('\n').slice(1,5).map(function(l){return{fn:l.trim(),file:'',line:'',col:''}}));
    }
    self._replIn.value = '';
  };

  PhantomDevTools.prototype._replKey = function (e) {
    var self = this, hist = self._state.replHistory;
    if (e.key === 'Enter') { self._runRepl(); return; }
    if (e.key === 'ArrowUp') {
      self._state.replIdx = Math.min(self._state.replIdx + 1, hist.length - 1);
      self._replIn.value = hist[self._state.replIdx] || '';
      e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
      self._state.replIdx = Math.max(self._state.replIdx - 1, -1);
      self._replIn.value = self._state.replIdx >= 0 ? hist[self._state.replIdx] : '';
      e.preventDefault();
    }
  };

  // ─── DOM Tree ────────────────────────────────────────────────────────────────
  PhantomDevTools.prototype._buildDOMTree = function () {
    var self = this;
    self._domPane.innerHTML = '';
    self._renderDOMNode(document.documentElement, self._domPane, 0);
  };

  PhantomDevTools.prototype._renderDOMNode = function (node, container, depth) {
    var self = this;
    if (!node) return;

    if (node.nodeType === Node.TEXT_NODE) {
      var text = node.textContent.trim();
      if (!text || text.length < 2) return;
      var row = document.createElement('div');
      row.className = 'dr';
      row.style.paddingLeft = (depth * 14 + 6) + 'px';
      row.innerHTML = '<span class="dt"> </span><span class="tx">"'+self._esc(text.slice(0,80))+(text.length>80?'…':'')+'"</span>';
      row.addEventListener('click', function () { self._selectNode(node, row); });
      container.appendChild(row);
      return;
    }
    if (node.nodeType === Node.COMMENT_NODE) {
      var row = document.createElement('div');
      row.className = 'dr';
      row.style.paddingLeft = (depth * 14 + 6) + 'px';
      row.innerHTML = '<span class="dt"> </span><span class="cm">&lt;!-- '+self._esc(node.textContent.trim().slice(0,60))+' --&gt;</span>';
      container.appendChild(row);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    // Skip our own host element
    if (node.id === 'phantom-dt-host' || node.id === 'phantom-pick-overlay') return;

    var tag = node.tagName.toLowerCase();
    var kids = Array.from(node.childNodes).filter(function (n) {
      if (n.nodeType === Node.TEXT_NODE) return n.textContent.trim().length > 1;
      return (n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.COMMENT_NODE) && n.id !== 'phantom-dt-host';
    });
    var hasKids = kids.length > 0;

    var attrs = Array.from(node.attributes || []).slice(0, 6).map(function (a) {
      return ' <span class="an">'+self._esc(a.name)+'</span>=<span class="av">"'+self._esc(a.value.slice(0,60))+'"</span>';
    }).join('');

    var row = document.createElement('div');
    row.className = 'dr';
    row.style.paddingLeft = (depth * 14 + 6) + 'px';
    row._node = node;

    var toggle = document.createElement('span');
    toggle.className = 'dt';
    toggle.textContent = hasKids ? '▶' : ' ';

    var label = document.createElement('span');
    label.innerHTML = '<span class="tn">&lt;'+tag+'&gt;</span>'+attrs;
    if (!hasKids) label.innerHTML += '<span class="tc">&lt;/'+tag+'&gt;</span>';

    row.appendChild(toggle);
    row.appendChild(label);
    container.appendChild(row);

    if (hasKids) {
      var cc = document.createElement('div');
      cc.className = 'dc';
      container.appendChild(cc);
      var built = false;

      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = toggle.classList.toggle('o');
        cc.classList.toggle('o', open);
        if (open && !built) {
          built = true;
          kids.forEach(function (c) { self._renderDOMNode(c, cc, depth + 1); });
          var cl = document.createElement('div');
          cl.style.cssText = 'padding-left:'+(depth*14+20)+'px;font-family:var(--mono);font-size:12px;';
          cl.innerHTML = '<span class="tc">&lt;/'+tag+'&gt;</span>';
          cc.appendChild(cl);
        }
      });
      row.addEventListener('click', function (e) {
        if (e.target === toggle) return;
        toggle.click();
        self._selectNode(node, row);
      });
    } else {
      row.addEventListener('click', function () { self._selectNode(node, row); });
    }
  };

  PhantomDevTools.prototype._selectNode = function (node, rowEl) {
    var self = this;
    self._shadow.querySelectorAll('.dr.sel').forEach(function (r) { r.classList.remove('sel'); });
    if (rowEl) rowEl.classList.add('sel');
    self._state.selectedNode = node;

    if (node.nodeType !== Node.ELEMENT_NODE) {
      self._breadcrumb.innerHTML = '<span style="color:var(--text2)">Text node</span>';
      self._renderComputedStyles(null);
      self._renderBoxModel(null);
      return;
    }

    // Breadcrumb
    var path = [], cur = node;
    while (cur && cur.tagName) {
      var id = cur.id ? '#'+cur.id : '';
      var cl = cur.className && typeof cur.className === 'string' ? '.'+cur.className.trim().split(/\s+/).slice(0,2).join('.') : '';
      path.unshift('<span class="bt">'+cur.tagName.toLowerCase()+self._esc(id+cl)+'</span>');
      cur = cur.parentElement;
    }
    self._breadcrumb.innerHTML = path.join('<span class="bs"> › </span>');

    // Highlight element
    try {
      var prev = document.querySelector('.__pdt_sel');
      if (prev) { prev.style.outline = prev.__pdt_orig_outline || ''; prev.classList.remove('__pdt_sel'); }
      node.__pdt_orig_outline = node.style.outline;
      node.style.outline = '2px solid #0088ff';
      node.classList.add('__pdt_sel');
      node.scrollIntoView({block:'nearest', behavior:'smooth'});
    } catch(_) {}

    self._renderComputedStyles(node);
    self._renderBoxModel(node);
  };

  // ─── Computed Styles ─────────────────────────────────────────────────────────
  var CSS_PROPS = [
    'display','position','width','height','min-width','max-width','min-height','max-height',
    'margin','margin-top','margin-right','margin-bottom','margin-left',
    'padding','padding-top','padding-right','padding-bottom','padding-left',
    'border','border-width','border-color','border-style','border-radius',
    'background','background-color','background-image',
    'color','font-family','font-size','font-weight','font-style','line-height','letter-spacing','text-align',
    'flex','flex-direction','flex-wrap','justify-content','align-items','align-self','gap',
    'grid','grid-template-columns','grid-template-rows',
    'overflow','overflow-x','overflow-y','z-index','opacity','transform','transition','box-shadow',
    'cursor','pointer-events','visibility','white-space','text-overflow'
  ];

  PhantomDevTools.prototype._renderComputedStyles = function (node) {
    var self = this, hdr = '<div class="pane-hdr">Computed Styles</div>';
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
      self._computed.innerHTML = hdr + '<div class="muted">Select an element</div>';
      return;
    }
    var cs;
    try { cs = window.getComputedStyle(node); } catch(_) { return; }
    var colorRx = /^(#|rgb|hsl|rgba|hsla|oklch)/i;
    var rows = CSS_PROPS.map(function (prop) {
      var val = cs.getPropertyValue(prop);
      if (!val || val === 'none' || val === 'normal') return null;
      var isColor = colorRx.test(val.trim());
      var valHtml = isColor
        ? '<span class="sv swatch" style="--_sw:'+val+'">'+self._esc(val)+'</span>'
        : '<span class="sv">'+self._esc(val)+'</span>';
      return '<div class="style-row"><span class="sp">'+prop+'</span>'+valHtml+'</div>';
    }).filter(Boolean);
    self._computed.innerHTML = hdr + rows.join('');
  };

  // ─── Box Model ────────────────────────────────────────────────────────────────
  PhantomDevTools.prototype._renderBoxModel = function (node) {
    var self = this;
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
      self._boxDiagram.innerHTML = '<div class="muted" style="padding:0">No element selected</div>';
      return;
    }
    var cs, rect;
    try { cs = window.getComputedStyle(node); rect = node.getBoundingClientRect(); } catch(_) { return; }

    var mt=cs.marginTop,      mr=cs.marginRight,      mb=cs.marginBottom,      ml=cs.marginLeft;
    var pt=cs.paddingTop,     pr=cs.paddingRight,      pb=cs.paddingBottom,     pl=cs.paddingLeft;
    var bt=cs.borderTopWidth, br=cs.borderRightWidth,  bb=cs.borderBottomWidth, bl2=cs.borderLeftWidth;
    var w=Math.round(rect.width), h=Math.round(rect.height);

    function vals(t,r,b,l,cls) {
      return '<div class="bx-val bx-t '+cls+'">'+t+'</div>'
           + '<div class="bx-val bx-r '+cls+'">'+r+'</div>'
           + '<div class="bx-val bx-b2 '+cls+'">'+b+'</div>'
           + '<div class="bx-val bx-l '+cls+'">'+l+'</div>';
    }

    self._boxDiagram.innerHTML =
      '<div class="bx bx-m"><span class="bx-lbl">margin</span>'+vals(mt,mr,mb,ml,'')+
        '<div class="bx bx-b"><span class="bx-lbl">border</span>'+vals(bt,br,bb,bl2,'')+
          '<div class="bx bx-p"><span class="bx-lbl">padding</span>'+vals(pt,pr,pb,pl,'')+
            '<div class="bx bx-c"><div class="bx-dim">'+w+' × '+h+'</div></div>'+
          '</div>'+
        '</div>'+
      '</div>';
  };

  // ─── CSS Selector ────────────────────────────────────────────────────────────
  PhantomDevTools.prototype._runSelector = function (val) {
    var self = this;
    self._clearSelectorHL();
    if (!val.trim()) { self._csInput.className = ''; self._selCount.textContent = '—'; return; }
    try {
      var matches = Array.from(document.querySelectorAll(val)).filter(function (el) {
        return el.id !== 'phantom-dt-host' && !el.closest('#phantom-dt-host');
      });
      self._state.selectorMatches = matches;
      self._csInput.classList.remove('bad');
      self._csInput.classList.toggle('valid', matches.length > 0);
      self._selCount.textContent = matches.length + ' match' + (matches.length !== 1 ? 'es' : '');

      matches.forEach(function (el) {
        el.__pdt_selOutline = el.style.outline;
        el.style.outline = '2px solid rgba(255,200,0,0.9)';
        el.classList.add('__pdt_match');
      });

      // Highlight matching rows in DOM tree
      self._shadow.querySelectorAll('.dr').forEach(function (row) {
        if (row._node && matches.indexOf(row._node) > -1) row.classList.add('hl');
      });

      if (matches[0]) { try { matches[0].scrollIntoView({block:'nearest', behavior:'smooth'}); } catch(_){} }
    } catch (_) {
      self._csInput.classList.remove('valid');
      self._csInput.classList.add('bad');
      self._selCount.textContent = 'invalid';
      self._state.selectorMatches = [];
    }
  };

  PhantomDevTools.prototype._clearSelectorHL = function () {
    document.querySelectorAll('.__pdt_match').forEach(function (el) {
      el.style.outline = el.__pdt_selOutline || '';
      el.classList.remove('__pdt_match');
    });
    this._shadow.querySelectorAll('.dr.hl').forEach(function (r) { r.classList.remove('hl'); });
  };

  // ─── Element Picker ───────────────────────────────────────────────────────────
  PhantomDevTools.prototype._togglePicker = function () {
    var self = this;
    self._state.picking = !self._state.picking;
    self._shadow.querySelector('#pick-btn').classList.toggle('active', self._state.picking);
    self._shadow.querySelector('#pick-btn2').classList.toggle('active', self._state.picking);
    self._overlay.style.display = self._state.picking ? 'block' : 'none';
    if (!self._state.picking) { self._hl.style.display = 'none'; }
  };

  PhantomDevTools.prototype._elAtPoint = function (x, y) {
    // Temporarily hide overlay to hit-test beneath it
    this._overlay.style.pointerEvents = 'none';
    var el = document.elementFromPoint(x, y);
    this._overlay.style.pointerEvents = '';
    if (!el || el.id === 'phantom-dt-host' || (el.closest && el.closest('#phantom-dt-host'))) return null;
    return el;
  };

  PhantomDevTools.prototype._expandToNode = function (targetEl) {
    var self = this;
    // Build ancestor chain
    var path = [], cur = targetEl;
    while (cur && cur.tagName) { path.unshift(cur); cur = cur.parentElement; }

    // Expand each ancestor in tree
    path.forEach(function (ancestor) {
      self._shadow.querySelectorAll('.dr').forEach(function (row) {
        if (row._node === ancestor) {
          var t = row.querySelector('.dt');
          if (t && !t.classList.contains('o')) t.click();
        }
      });
    });

    // Select target
    setTimeout(function () {
      self._shadow.querySelectorAll('.dr').forEach(function (row) {
        if (row._node === targetEl) { row.scrollIntoView({block:'center'}); self._selectNode(targetEl, row); }
      });
    }, 60);
  };

  // ─── Cleanup ─────────────────────────────────────────────────────────────────
  PhantomDevTools.prototype.destroy = function () {
    var self = this;
    // Restore console
    if (self._origConsole) {
      var METHODS = ['log','warn','error','info','debug','table','dir','assert','count','clear','group','groupEnd'];
      METHODS.forEach(function (m) { if (self._origConsole[m]) console[m] = self._origConsole[m]; });
    }
    if (self._host)      self._host.remove();
    if (self._overStyle) self._overStyle.remove();
    if (self._overlay)   self._overlay.remove();
    if (self._hl)        self._hl.remove();
    root.PhantomDevTools = null;
  };

  // ─── Export ──────────────────────────────────────────────────────────────────
  var instance = new PhantomDevTools();
  root.PhantomDevTools = {
    init:    function (opts) { return instance.init(opts); },
    open:    function ()     { return instance.open();     },
    close:   function ()     { return instance.close();    },
    toggle:  function ()     { return instance.toggle();   },
    clear:   function ()     { return instance.clear();    },
    destroy: function ()     { return instance.destroy();  },
  };

  // Auto-init if data-autoload attribute present on the script tag
  var scripts = document.querySelectorAll('script[src*="phantom-devtools"]');
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].hasAttribute('data-autoload')) {
      var attr = function(k, def) { var v = scripts[i].getAttribute(k); return v !== null ? v : def; };
      root.PhantomDevTools.init({
        position:  attr('data-position', 'bottom'),
        height:    parseInt(attr('data-height', '320')),
        width:     parseInt(attr('data-width',  '480')),
        open:      attr('data-open', 'false') === 'true',
        intercept: attr('data-intercept', 'true') === 'true',
      });
      break;
    }
  }

}(window));
