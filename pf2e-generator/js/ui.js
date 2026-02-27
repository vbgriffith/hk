/**
 * js/ui.js
 * UI controller — handles DOM interactions, steppers,
 * loading animation, mix-and-match modal, export functions.
 */

const UI = (() => {
  'use strict';

  // ── State ─────────────────────────────────────────────
  const _state = {
    players:    4,
    startLevel: 1,
    endLevel:   10,
    acts:       3,
    sideQuests: 3,
  };

  const _limits = {
    players:    { min: 2, max: 6 },
    startLevel: { min: 1, max: 19 },
    endLevel:   { min: 2, max: 20 },
    acts:       { min: 1, max: 6 },
    sideQuests: { min: 1, max: 5 },
  };

  const _ids = {
    players:    'playerCount',
    startLevel: 'startLevel',
    endLevel:   'endLevel',
    acts:       'actCount',
    sideQuests: 'sideQuestCount',
  };

  function step(key, delta) {
    const lim = _limits[key];
    _state[key] = Math.max(lim.min, Math.min(lim.max, _state[key] + delta));
    document.getElementById(_ids[key]).textContent = _state[key];

    // Enforce startLevel < endLevel
    if (key === 'startLevel' && _state.startLevel >= _state.endLevel) {
      _state.endLevel = Math.min(_state.startLevel + 1, 20);
      document.getElementById(_ids.endLevel).textContent = _state.endLevel;
    }
    if (key === 'endLevel' && _state.endLevel <= _state.startLevel) {
      _state.startLevel = Math.max(_state.endLevel - 1, 1);
      document.getElementById(_ids.startLevel).textContent = _state.startLevel;
    }
  }

  // ── Loading Overlay ────────────────────────────────────
  async function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'block';
    document.getElementById('configPanel').style.opacity = '0.4';
    document.getElementById('configPanel').style.pointerEvents = 'none';
    document.getElementById('forgeBtn').disabled = true;
    document.getElementById('outputPanel').style.display = 'none';
  }

  async function animateLoading(steps) {
    const fill = document.getElementById('loadingFill');
    const step = document.getElementById('loadingStep');
    for (let i = 0; i < steps.length; i++) {
      step.textContent = steps[i];
      fill.style.width = `${((i + 1) / steps.length) * 100}%`;
      await new Promise(r => setTimeout(r, 320));
    }
  }

  function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
    document.getElementById('configPanel').style.opacity = '1';
    document.getElementById('configPanel').style.pointerEvents = 'auto';
    document.getElementById('forgeBtn').disabled = false;
  }

  // ── Reset ──────────────────────────────────────────────
  function reset() {
    document.getElementById('outputPanel').style.display = 'none';
    document.getElementById('configPanel').style.display = 'block';
    document.getElementById('configPanel').style.opacity = '1';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Mix & Match Modal ──────────────────────────────────
  function openMixModal() {
    const c = Generator.getCurrent();
    if (!c) return;
    const content = document.getElementById('mixModalContent');
    content.innerHTML = buildMixModal(c);
    document.getElementById('mixModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function buildMixModal(c) {
    return `
    <div class="mix-section">
      <div class="mix-section-title">Campaign Base</div>
      <select class="mix-select" id="mixSource">
        ${CAMPAIGNS.map(camp => `<option value="${camp.id}" ${camp.id === c.base.id ? 'selected' : ''}>${camp.name} (${camp.source})</option>`).join('')}
      </select>
    </div>

    <div class="mix-section">
      <div class="mix-section-title">Villain Archetype</div>
      <select class="mix-select" id="mixVillainType">
        <option value="keep">Keep Current: ${c.villain.race}</option>
        <option value="random">Randomize</option>
        ${COMPONENTS.villainArchetypes.map(v => `<option value="${v.type}">${v.type} (CR ${v.cr})</option>`).join('')}
      </select>
    </div>

    <div class="mix-section">
      <div class="mix-section-title">Faction Pack</div>
      <select class="mix-select" id="mixFactionPack">
        <option value="keep">Keep Current Factions</option>
        <option value="random">Fully Randomize</option>
        <option value="base">Restore Campaign Defaults</option>
      </select>
    </div>

    <div class="mix-section">
      <div class="mix-section-title">Campaign Tone</div>
      <select class="mix-select" id="mixTone">
        <option value="any">Any</option>
        <option value="heroic">Heroic Adventure</option>
        <option value="dark">Dark &amp; Gritty</option>
        <option value="political">Political Intrigue</option>
        <option value="exploration">Exploration</option>
        <option value="horror">Cosmic Horror</option>
        <option value="swashbuckling">Swashbuckling</option>
      </select>
    </div>

    <div class="mix-section">
      <div class="mix-section-title">Randomize Components</div>
      <label class="toggle-item"><input type="checkbox" id="mixRandLocations"/> <span class="toggle-label">Randomize Locations</span></label><br/>
      <label class="toggle-item mt-sm"><input type="checkbox" id="mixRandTwists"/> <span class="toggle-label">New Plot Twists</span></label><br/>
      <label class="toggle-item mt-sm"><input type="checkbox" id="mixRandNPCs"/> <span class="toggle-label">New NPCs</span></label><br/>
      <label class="toggle-item mt-sm"><input type="checkbox" id="mixRandHook"/> <span class="toggle-label">New Adventure Hook</span></label>
    </div>`;
  }

  function closeMixModal(evt) {
    if (evt && evt.target !== document.getElementById('mixModal')) return;
    document.getElementById('mixModal').style.display = 'none';
    document.body.style.overflow = '';
  }

  function applyMix() {
    const changes = {
      villain:   document.getElementById('mixVillainType')?.value !== 'keep',
      locations: document.getElementById('mixRandLocations')?.checked,
      factions:  document.getElementById('mixFactionPack')?.value !== 'keep',
      twists:    document.getElementById('mixRandTwists')?.checked,
      npcs:      document.getElementById('mixRandNPCs')?.checked,
      hook:      document.getElementById('mixRandHook')?.checked,
    };

    // Source change — full reforge with new source
    const newSource = document.getElementById('mixSource')?.value;
    const newTone   = document.getElementById('mixTone')?.value;
    const config    = Generator.getConfig();

    if (newSource !== config.source || newTone !== config.tone) {
      const updated = { ...config, source: newSource, tone: newTone };
      closeMixModal();
      Generator.forge(updated);
      return;
    }

    closeMixModal();
    Generator.applyMixChanges(changes);
  }

  // ── Export: JSON ──────────────────────────────────────
  function exportJSON() {
    const c = Generator.getCurrent();
    if (!c) return;
    const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${slugify(c.base.name)}_campaign.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Load: JSON ────────────────────────────────────────
  function loadJSON() {
    document.getElementById('jsonFileInput').click();
  }

  function handleJSONLoad(evt) {
    const file = evt.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const c = JSON.parse(e.target.result);
        Renderer.render(c);
        document.getElementById('configPanel').style.display = 'none';
      } catch (err) {
        alert('Invalid campaign JSON file.');
      }
    };
    reader.readAsText(file);
    evt.target.value = '';
  }

  // ── Copy Markdown ─────────────────────────────────────
  function copyMarkdown() {
    const c = Generator.getCurrent();
    if (!c) return;
    const md = Renderer.toMarkdown(c);
    navigator.clipboard.writeText(md).then(() => {
      const btn = document.querySelector('[onclick="UI.copyMarkdown()"]');
      if (btn) { const orig = btn.textContent; btn.textContent = '✓ Copied!'; setTimeout(() => btn.textContent = orig, 2000); }
    });
  }

  // ── Print ─────────────────────────────────────────────
  function printCampaign() {
    window.print();
  }

  // ── Utility ───────────────────────────────────────────
  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }

  return {
    step,
    showLoading,
    animateLoading,
    hideLoading,
    reset,
    openMixModal,
    closeMixModal,
    applyMix,
    exportJSON,
    loadJSON,
    handleJSONLoad,
    copyMarkdown,
    printCampaign,
    mixAndMatch: openMixModal,
  };

})();
