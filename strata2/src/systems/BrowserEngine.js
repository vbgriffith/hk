/**
 * BrowserEngine — in-game browser window within CadenceOS.
 * Renders fake websites on the Phaser canvas using DOM elements for rich content.
 * URL bar, history, back/forward — all tracked through StateManager.
 *
 * History becomes anomalous after Layer 3: URLs appear you didn't type.
 */
const BrowserEngine = (function () {

  // Website registry
  const SITES = {};
  let browserScene = null;
  let browserContainer = null; // Phaser Container
  let contentDiv = null;       // HTML div overlay for rich web content
  let isOpen = false;

  // Browser dimensions
  const BW = 900;
  const BH = 560;
  const TOOLBAR_H = 36;
  const STATUSBAR_H = 20;

  // Available URLs and their unlock conditions
  const URL_REGISTRY = {
    'lumencollective.com':   { site: 'LumenCollective', alwaysAvailable: true },
    'veldenmoor.net':        { site: 'Veldenmoor',      alwaysAvailable: true },
    'idacrane.net':          { site: 'IdaCrane',        requiresFlag: 'zip_opened' },
    'halverstrom.org':       { site: 'Halverstrom',     requiresFlag: 'visited_layer3', anomalous: true },
    'substrate-archive.net': { site: 'SubstrateArchive',requiresFlag: 'visited_layer4', anomalous: true },
    'callumwrest.com':       { site: 'CallumWrest',     requiresFlag: 'zip_opened' },
  };

  // Inject anomalous URLs into history after deep layer visits
  function injectAnomalousHistory() {
    const depth = StateManager.get('deepestLayer');
    const history = StateManager.get('browserHistory') || [];

    if (depth >= 3 && !StateManager.hasFlag('halverstrom_injected')) {
      StateManager.flag('halverstrom_injected');
      history.push({ url: 'halverstrom.org', timestamp: Date.now() - 3600000, anomalous: true });
      StateManager.set('browserHistory', history);
      EventBus.emit('browser:anomalous_url', { url: 'halverstrom.org' });
    }
    if (depth >= 4 && !StateManager.hasFlag('substrate_injected')) {
      StateManager.flag('substrate_injected');
      history.push({ url: 'substrate-archive.net', timestamp: Date.now() - 7200000, anomalous: true });
      StateManager.set('browserHistory', history);
      EventBus.emit('browser:anomalous_url', { url: 'substrate-archive.net' });
    }
  }

  function registerSite(hostname, renderer) {
    SITES[hostname] = renderer;
  }

  function navigate(url) {
    // Normalize
    url = url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();

    const entry = URL_REGISTRY[url];
    if (!entry) {
      renderNotFound(url);
      return;
    }

    // Check unlock
    if (entry.requiresFlag && !StateManager.hasFlag(entry.requiresFlag)) {
      renderBlocked(url);
      return;
    }

    StateManager.addBrowserHistory(url);
    StateManager.set('browserCurrentUrl', url);

    const renderer = SITES[url];
    if (renderer) {
      renderSite(renderer, url);
    } else {
      renderNotFound(url);
    }

    EventBus.emit('browser:navigated', { url });
  }

  function renderSite(renderer, url) {
    if (!contentDiv) return;
    contentDiv.innerHTML = '';
    const html = renderer.render(StateManager.getSnapshot());
    contentDiv.innerHTML = html;

    // Run any post-render logic
    if (renderer.postRender) renderer.postRender(contentDiv, url);
  }

  function renderNotFound(url) {
    if (!contentDiv) return;
    contentDiv.innerHTML = `
      <div style="padding:40px;font-family:monospace;color:#8e8e93;">
        <p style="font-size:32px;color:#3a3a3c;margin-bottom:16px;">404</p>
        <p>The address <strong style="color:#d4a853;">${url}</strong> could not be found.</p>
        <p style="margin-top:20px;color:#555;">DNS resolution failed or the server is not responding.</p>
      </div>`;
  }

  function renderBlocked(url) {
    if (!contentDiv) return;
    contentDiv.innerHTML = `
      <div style="padding:40px;font-family:monospace;color:#8e8e93;">
        <p style="font-size:32px;color:#3a3a3c;margin-bottom:16px;">—</p>
        <p>Unable to connect to <strong style="color:#5e9e8a;">${url}</strong>.</p>
        <p style="margin-top:12px;color:#555;font-size:12px;">This may become available later.</p>
      </div>`;
  }

  return {
    /**
     * Initialize the browser.
     * @param {Phaser.Scene} scene — the CadenceOS scene
     * @param {number} x, y — top-left position
     */
    open(scene, x, y) {
      if (isOpen) this.close();
      browserScene = scene;
      isOpen = true;

      const { width, height } = scene.scale;
      const bx = x !== undefined ? x : (width - BW) / 2;
      const by = y !== undefined ? y : (height - BH) / 2;

      // Check for anomalous history injections
      injectAnomalousHistory();

      // Browser chrome (Phaser graphics)
      const g = scene.add.graphics().setDepth(200);
      // Shadow
      g.fillStyle(0x000000, 0.4);
      g.fillRect(bx + 5, by + 5, BW, BH);
      // Window
      Geometry.roundRect(g, bx, by, BW, BH, 8, Palette.L0.surface, 1);
      // Titlebar
      g.fillStyle(Palette.L0.taskbar, 1);
      g.fillRect(bx, by, BW, TOOLBAR_H);
      g.fillRect(bx, by + TOOLBAR_H - 1, BW, 1); // separator
      // Status bar
      g.fillStyle(Palette.L0.taskbar, 1);
      g.fillRect(bx, by + BH - STATUSBAR_H, BW, STATUSBAR_H);
      // Border
      Geometry.roundRect(g, bx, by, BW, BH, 8, null, null, Palette.L0.border, 1);

      // Traffic lights
      [[bx+14, 0xed6a5a], [bx+32, 0xf5bf4f], [bx+50, 0x68c65a]].forEach(([cx, c]) => {
        g.fillStyle(c, 1); g.fillCircle(cx, by + TOOLBAR_H/2, 7);
      });

      // URL bar (DOM input)
      const inputEl = document.createElement('input');
      inputEl.type = 'text';
      inputEl.id = 'cadence-url-bar';
      inputEl.style.cssText = `
        position: absolute;
        left: ${bx + 74}px;
        top: ${by + 6}px;
        width: ${BW - 120}px;
        height: 24px;
        background: #111113;
        border: 1px solid #48484a;
        border-radius: 4px;
        color: #5e9e8a;
        font-family: monospace;
        font-size: 12px;
        padding: 0 8px;
        outline: none;
        z-index: 1000;
      `;
      inputEl.value = StateManager.get('browserCurrentUrl') || '';
      document.body.appendChild(inputEl);
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') navigate(inputEl.value);
      });

      // History display (small dropdown area)
      const histBtn = document.createElement('div');
      histBtn.id = 'cadence-history-btn';
      histBtn.innerHTML = '⏷';
      histBtn.style.cssText = `
        position: absolute;
        left: ${bx + BW - 36}px;
        top: ${by + 8}px;
        color: #8e8e93;
        font-family: monospace;
        font-size: 12px;
        cursor: pointer;
        z-index: 1000;
        padding: 2px 6px;
        border-radius: 3px;
        background: #2c2c2e;
        border: 1px solid #48484a;
      `;
      document.body.appendChild(histBtn);
      histBtn.addEventListener('click', () => this.showHistory());

      // Close button
      const closeBtn = document.createElement('div');
      closeBtn.id = 'cadence-browser-close';
      closeBtn.innerHTML = '✕';
      closeBtn.style.cssText = `
        position: absolute;
        left: ${bx + BW - 16}px;
        top: ${by + 8}px;
        color: #ed6a5a;
        font-family: monospace;
        font-size: 14px;
        cursor: pointer;
        z-index: 1001;
        line-height: 1;
      `;
      document.body.appendChild(closeBtn);
      closeBtn.addEventListener('click', () => this.close());

      // Content div
      contentDiv = document.createElement('div');
      contentDiv.id = 'cadence-browser-content';
      contentDiv.style.cssText = `
        position: absolute;
        left: ${bx}px;
        top: ${by + TOOLBAR_H}px;
        width: ${BW}px;
        height: ${BH - TOOLBAR_H - STATUSBAR_H}px;
        background: #f5f0e8;
        overflow-y: auto;
        z-index: 999;
        font-family: monospace;
      `;
      document.body.appendChild(contentDiv);

      // Status bar text
      const statusEl = document.createElement('div');
      statusEl.id = 'cadence-status-bar';
      statusEl.style.cssText = `
        position: absolute;
        left: ${bx + 8}px;
        top: ${by + BH - STATUSBAR_H + 3}px;
        color: #5a6070;
        font-family: monospace;
        font-size: 10px;
        z-index: 1000;
      `;
      statusEl.textContent = 'CadenceOS Browser v2.1 — Secure Connection';
      document.body.appendChild(statusEl);

      browserContainer = g;

      // Navigate to last URL or default
      const lastUrl = StateManager.get('browserCurrentUrl');
      if (lastUrl) navigate(lastUrl);
      else renderNotFound('(no page loaded)');
    },

    navigate(url) { navigate(url); },

    showHistory() {
      const history = StateManager.get('browserHistory') || [];
      if (!contentDiv) return;
      let html = `<div style="padding:20px;background:#1c1c1e;min-height:100%;">
        <p style="color:#d4a853;font-family:monospace;font-size:13px;margin-bottom:16px;border-bottom:1px solid #48484a;padding-bottom:8px;">BROWSER HISTORY</p>`;

      // Inject: anomalous entries look slightly different
      const allHistory = [...history].reverse();
      allHistory.forEach(entry => {
        const isAnomalous = entry.anomalous;
        const d = new Date(entry.timestamp);
        const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        html += `<div style="margin-bottom:8px;cursor:pointer;padding:4px 8px;border-radius:3px;background:${isAnomalous ? '#1a1a0a' : '#2c2c2e'};border:1px solid ${isAnomalous ? '#4a4a20' : 'transparent'};"
          onclick="BrowserEngine.navigate('${entry.url}')">
          <span style="color:${isAnomalous ? '#d4a853' : '#5e9e8a'};font-size:12px;">${entry.url}</span>
          <span style="color:#48484a;font-size:10px;margin-left:12px;">${ds}${isAnomalous ? ' ⚠' : ''}</span>
        </div>`;
      });

      html += '</div>';
      contentDiv.innerHTML = html;
    },

    close() {
      isOpen = false;
      if (browserContainer) { browserContainer.destroy(); browserContainer = null; }
      ['cadence-url-bar', 'cadence-history-btn', 'cadence-browser-close',
       'cadence-browser-content', 'cadence-status-bar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
      contentDiv = null;
      EventBus.emit('browser:closed');
    },

    isOpen() { return isOpen; },

    registerSite,
  };
})();
