/**
 * js/ui.js  (Build 2 — map tabs + faction web)
 * UI controller — DOM interactions, steppers, loading,
 * mix-and-match modal, export, tab switching, map drawing, tooltips.
 */

const UI = (() => {
  'use strict';

  // ── State ─────────────────────────────────────────────
  const _state = {
    players:       4,
    startLevel:    1,
    endLevel:      10,
    acts:          3,
    sideQuests:    3,
    mapVariant:    1,
    dungeonVariant:1,
    activeTab:     'campaign',
  };

  const _limits = {
    players:       { min: 2, max: 6 },
    startLevel:    { min: 1, max: 19 },
    endLevel:      { min: 2, max: 20 },
    acts:          { min: 1, max: 6 },
    sideQuests:    { min: 1, max: 5 },
    mapVariant:    { min: 1, max: 9 },
    dungeonVariant:{ min: 1, max: 9 },
  };

  const _ids = {
    players:       'playerCount',
    startLevel:    'startLevel',
    endLevel:      'endLevel',
    acts:          'actCount',
    sideQuests:    'sideQuestCount',
    mapVariant:    'mapVariant',
    dungeonVariant:'dungeonVariant',
  };

  // ── Stepper ───────────────────────────────────────────
  function step(key, delta) {
    const lim = _limits[key];
    _state[key] = Math.max(lim.min, Math.min(lim.max, _state[key] + delta));
    const el = document.getElementById(_ids[key]);
    if (el) el.textContent = _state[key];

    if (key === 'startLevel' && _state.startLevel >= _state.endLevel) {
      _state.endLevel = Math.min(_state.startLevel + 1, 20);
      document.getElementById(_ids.endLevel).textContent = _state.endLevel;
    }
    if (key === 'endLevel' && _state.endLevel <= _state.startLevel) {
      _state.startLevel = Math.max(_state.endLevel - 1, 1);
      document.getElementById(_ids.startLevel).textContent = _state.startLevel;
    }
  }

  function stepMapVariant(delta) {
    step('mapVariant', delta);
    redrawRegional();
  }

  function stepDungeonVariant(delta) {
    step('dungeonVariant', delta);
    redrawDungeon();
  }

  // ── Loading ───────────────────────────────────────────
  async function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'block';
    document.getElementById('configPanel').style.opacity = '0.4';
    document.getElementById('configPanel').style.pointerEvents = 'none';
    document.getElementById('forgeBtn').disabled = true;
    document.getElementById('outputPanel').style.display = 'none';
  }

  async function animateLoading(steps) {
    const fill   = document.getElementById('loadingFill');
    const stepEl = document.getElementById('loadingStep');
    for (let i = 0; i < steps.length; i++) {
      if (stepEl) stepEl.textContent = steps[i];
      if (fill)   fill.style.width = `${((i + 1) / steps.length) * 100}%`;
      await new Promise(r => setTimeout(r, 320));
    }
  }

  function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
    document.getElementById('configPanel').style.opacity = '1';
    document.getElementById('configPanel').style.pointerEvents = 'auto';
    document.getElementById('forgeBtn').disabled = false;
  }

  // ── Tab switching ─────────────────────────────────────
  function switchTab(name) {
    _state.activeTab = name;
    for (const t of ['campaign', 'region', 'dungeon', 'factions', 'npcweb', 'timeline', 'encounters', 'sessionzero']) {
      document.getElementById(`tab-${t}`)?.classList.toggle('active', t === name);
      document.getElementById(`pane-${t}`)?.classList.toggle('active', t === name);
    }
    // Lazy render maps on first visit
    if (name === 'region')      setTimeout(redrawRegional,  60);
    if (name === 'dungeon')     setTimeout(redrawDungeon,   60);
    if (name === 'factions')    setTimeout(redrawFactions,  60);
    if (name === 'npcweb')      setTimeout(redrawNpcWeb,    80);
    if (name === 'timeline')    setTimeout(redrawTimeline,  60);
    if (name === 'encounters')  setTimeout(redrawEncounters,60);
    if (name === 'sessionzero') setTimeout(redrawSessionZero,60);
  }

  // ── Map drawing ───────────────────────────────────────
  function redrawRegional() {
    const campaign = Generator.getCurrent();
    if (!campaign) return;
    const canvas  = document.getElementById('regionalCanvas');
    if (!canvas) return;
    const palette = document.getElementById('mapPalette')?.value || 'parchment';
    const info = MapGenerator.generateRegionalMap(canvas, campaign, {
      palette,
      variation: _state.mapVariant,
    });
    const leg = document.getElementById('regionalLegend');
    if (leg && info.settlements) {
      const named = info.settlements.filter(s => s.isCampaign).map(s => s.name);
      leg.innerHTML = named.length
        ? `<strong>Campaign Locations (red dots):</strong> ${named.join(' · ')}`
        : 'Campaign locations shown as larger red dots. Gold dots are towns and villages.';
    }
  }

  function redrawDungeon() {
    const campaign = Generator.getCurrent();
    if (!campaign) return;
    const canvas = document.getElementById('dungeonCanvas');
    if (!canvas) return;
    const sel = document.getElementById('dungeonLocation');
    const loc = sel?.value || campaign.locations?.[1] || 'The Dungeon';
    MapGenerator.generateDungeonMap(canvas, campaign, loc, {
      variation: _state.dungeonVariant,
    });
  }

  function redrawNpcWeb() {
    const campaign = Generator.getCurrent();
    if (!campaign) return;
    const canvas = document.getElementById('npcWebCanvas');
    if (!canvas) return;
    canvas.width  = canvas.parentElement ? Math.min(canvas.parentElement.offsetWidth - 16, 1100) : 960;
    canvas.height = Math.round(canvas.width * 0.67);
    if (typeof NpcWeb !== 'undefined') NpcWeb.draw(canvas, campaign);
  }

  function downloadNpcWeb() {
    const canvas = document.getElementById('npcWebCanvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = 'npc-relationship-web.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  }

  function redrawTimeline() {
    const campaign = Generator.getCurrent();
    if (!campaign) return;
    let canvas = document.getElementById('timelineCanvas');
    if (!canvas) return;
    const detailEl = document.getElementById('timelineDetail');

    // Compute needed height based on acts + side quests
    const acts = campaign.acts || [];
    const maxSQ = Math.max(...acts.map(a => a.sideQuests?.length || 0), 0);
    const neededH = 80 + acts.length * (76 + maxSQ * 36 + 20);
    canvas.height = Math.max(420, neededH);

    const newCanvas = Timeline.attachEvents(canvas, detailEl);
    newCanvas.id = 'timelineCanvas';
    newCanvas.width  = canvas.width  || 900;
    // Re-render on the returned (possibly replaced) canvas
    Timeline.render(newCanvas, campaign, detailEl);
  }

  function redrawEncounters() {
    const campaign = Generator.getCurrent();
    if (!campaign) return;
    const root = document.getElementById('encounterBuilderRoot');
    if (!root) return;
    EncounterBuilder.render(root, campaign);
  }

  function redrawSessionZero() {
    const campaign = Generator.getCurrent();
    if (!campaign) return;
    const root = document.getElementById('sessionZeroRoot');
    if (!root) return;
    SessionZero.render(root, campaign);
  }
    const campaign = Generator.getCurrent();
    if (!campaign) return;
    const canvas = document.getElementById('factionCanvas');
    if (!canvas) return;
    // Replace canvas node to cleanly remove old event listeners
    const parent     = canvas.parentNode;
    const newCanvas  = document.createElement('canvas');
    newCanvas.id     = 'factionCanvas';
    newCanvas.width  = canvas.width;
    newCanvas.height = canvas.height;
    parent.replaceChild(newCanvas, canvas);

    const state = FactionMap.renderInteractive(newCanvas, campaign);
    _setupFactionTooltip(newCanvas, state);
  }

  // ── Faction tooltip (hover) ───────────────────────────
  let _tooltipRAF = null;

  function _setupFactionTooltip(canvas, state) {
    const tooltip = document.getElementById('factionTooltip');
    if (!tooltip) return;

    canvas.addEventListener('mousemove', (e) => {
      if (_tooltipRAF) cancelAnimationFrame(_tooltipRAF);
      _tooltipRAF = requestAnimationFrame(() => {
        const rect  = canvas.getBoundingClientRect();
        const sx    = canvas.width  / rect.width;
        const sy    = canvas.height / rect.height;
        const px    = (e.clientX - rect.left) * sx;
        const py    = (e.clientY - rect.top)  * sy;
        const nd    = state.getNodeAt(state.nodes, px, py);
        const edge  = nd ? null : state.getEdgeAt(state.nodes, state.edges, px, py);

        if (nd) {
          const f = nd.faction;
          tooltip.innerHTML =
            `<strong>${f.name}</strong>` +
            (f.alignment ? `<br/><em>${f.alignment} · ${f.role}</em>` : '') +
            `<br/>${f.desc || ''}`;
          tooltip.style.display = 'block';
          tooltip.style.left = `${e.clientX - rect.left + 16}px`;
          tooltip.style.top  = `${e.clientY - rect.top  - 10}px`;
        } else if (edge) {
          const fa = state.nodes[edge.a].faction;
          const fb = state.nodes[edge.b].faction;
          tooltip.innerHTML =
            `<strong>${fa.name} ↔ ${fb.name}</strong>` +
            `<br/><em>${edge.rel.label}</em>` +
            `<br/>${edge.notes}`;
          tooltip.style.display = 'block';
          tooltip.style.left = `${e.clientX - rect.left + 16}px`;
          tooltip.style.top  = `${e.clientY - rect.top  - 10}px`;
        } else {
          tooltip.style.display = 'none';
        }
      });
    });

    canvas.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  }

  // ── Populate dungeon location dropdown ────────────────
  function populateDungeonSelect(campaign) {
    const sel = document.getElementById('dungeonLocation');
    if (!sel || !campaign) return;
    sel.innerHTML = '';
    const locs = [...(campaign.locations || [])];
    // Extra dungeon-flavoured fallbacks
    ['The Villain\'s Sanctum', 'The Forgotten Vault',
     'The Corrupted Shrine', 'The Final Dungeon'].forEach(l => {
      if (!locs.includes(l)) locs.push(l);
    });
    locs.forEach(loc => {
      const opt = document.createElement('option');
      opt.value = loc; opt.textContent = loc;
      sel.appendChild(opt);
    });
  }

  // ── Reset ──────────────────────────────────────────────
  function reset() {
    document.getElementById('outputPanel').style.display = 'none';
    document.getElementById('configPanel').style.display = 'block';
    document.getElementById('configPanel').style.opacity = '1';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Called by Renderer after a successful forge render
  function onForgeComplete(campaign) {
    populateDungeonSelect(campaign);
    switchTab('campaign');
    // Wire up collapsible stat block toggles after render settles
    setTimeout(initStatBlockToggles, 150);
  }

  function initStatBlockToggles() {
    document.querySelectorAll('.stat-block').forEach(function(sb) {
      if (sb.dataset.toggleInit) return;
      sb.dataset.toggleInit = '1';
      var nameEl = sb.querySelector('.sb-name');
      var label  = nameEl ? nameEl.textContent : 'Stat Block';
      var wrapper = document.createElement('div');
      wrapper.className = 'sb-wrapper';
      var btn = document.createElement('button');
      btn.className = 'sb-toggle-btn';
      btn.textContent = '▼ ' + label + ' — Full Stats';
      btn.setAttribute('aria-expanded','false');
      sb.classList.add('sb-collapsible','collapsed');
      btn.addEventListener('click', function() {
        var nowCollapsed = sb.classList.toggle('collapsed');
        btn.textContent = (nowCollapsed ? '▼ ' : '▲ ') + label + ' — Full Stats';
        btn.setAttribute('aria-expanded', String(!nowCollapsed));
      });
      sb.parentNode.insertBefore(wrapper, sb);
      wrapper.appendChild(btn);
      wrapper.appendChild(sb);
    });
  }

  // ── Mix & Match Modal ──────────────────────────────────
  function openMixModal() {
    const c = Generator.getCurrent();
    if (!c) return;
    document.getElementById('mixModalContent').innerHTML = _buildMixModal(c);
    document.getElementById('mixModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function _buildMixModal(c) {
    return `
    <div class="mix-section">
      <div class="mix-section-title">Campaign Base</div>
      <select class="mix-select" id="mixSource">
        ${CAMPAIGNS.map(camp =>
          `<option value="${camp.id}" ${camp.id === c.base.id ? 'selected' : ''}>${camp.name} (${camp.source})</option>`
        ).join('')}
      </select>
    </div>
    <div class="mix-section">
      <div class="mix-section-title">Villain Archetype</div>
      <select class="mix-select" id="mixVillainType">
        <option value="keep">Keep Current: ${c.villain.race}</option>
        <option value="random">Randomize</option>
        ${COMPONENTS.villainArchetypes.map(v =>
          `<option value="${v.type}">${v.type} (CR ${v.cr})</option>`
        ).join('')}
      </select>
    </div>
    <div class="mix-section">
      <div class="mix-section-title">Faction Pack</div>
      <select class="mix-select" id="mixFactionPack">
        <option value="keep">Keep Current</option>
        <option value="random">Fully Randomize</option>
        <option value="base">Restore Defaults</option>
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
      <label class="toggle-item"><input type="checkbox" id="mixRandLocations"/>
        <span class="toggle-label">Randomize Locations &amp; Maps</span></label><br/>
      <label class="toggle-item mt-sm"><input type="checkbox" id="mixRandTwists"/>
        <span class="toggle-label">New Plot Twists</span></label><br/>
      <label class="toggle-item mt-sm"><input type="checkbox" id="mixRandNPCs"/>
        <span class="toggle-label">New NPCs</span></label><br/>
      <label class="toggle-item mt-sm"><input type="checkbox" id="mixRandHook"/>
        <span class="toggle-label">New Adventure Hook</span></label>
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
      factions:  document.getElementById('mixFactionPack')?.value  !== 'keep',
      twists:    document.getElementById('mixRandTwists')?.checked,
      npcs:      document.getElementById('mixRandNPCs')?.checked,
      hook:      document.getElementById('mixRandHook')?.checked,
    };
    const newSource = document.getElementById('mixSource')?.value;
    const newTone   = document.getElementById('mixTone')?.value;
    const config    = Generator.getConfig();

    closeMixModal();

    if (newSource !== config.source || newTone !== config.tone) {
      Generator.forge({ ...config, source: newSource, tone: newTone });
      return;
    }
    Generator.applyMixChanges(changes);
    // Refresh whichever visual tab is active
    if (_state.activeTab === 'region')   setTimeout(redrawRegional,  60);
    if (_state.activeTab === 'factions') setTimeout(redrawFactions,  60);
    if (_state.activeTab === 'dungeon')  setTimeout(redrawDungeon,   60);
  }

  // ── Export / Import ────────────────────────────────────
  function exportJSON() {
    const c = Generator.getCurrent();
    if (!c) return;
    const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `${_slugify(c.base.name)}_campaign.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

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
        populateDungeonSelect(c);
        document.getElementById('configPanel').style.display = 'none';
      } catch {
        alert('Invalid campaign JSON file.');
      }
    };
    reader.readAsText(file);
    evt.target.value = '';
  }

  function copyMarkdown() {
    const c = Generator.getCurrent();
    if (!c) return;
    navigator.clipboard.writeText(Renderer.toMarkdown(c)).then(() => {
      const btn = document.querySelector('[onclick="UI.copyMarkdown()"]');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => (btn.textContent = orig), 2000);
      }
    });
  }

  function printCampaign() { window.print(); }

  // ── Canvas PNG download ────────────────────────────────
  function downloadCanvas(canvasId, filename) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const a = document.createElement('a');
    a.href     = canvas.toDataURL('image/png');
    a.download = `${filename}.png`;
    a.click();
  }

  // ── Util ──────────────────────────────────────────────
  function _slugify(str) {
    return (str || 'campaign').toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }

  // ── Public API ────────────────────────────────────────
  return {
    step,
    stepMapVariant,
    stepDungeonVariant,
    showLoading,
    animateLoading,
    hideLoading,
    switchTab,
    redrawNpcWeb,
    downloadNpcWeb,
    redrawRegional,
    redrawDungeon,
    redrawFactions,
    redrawTimeline,
    redrawEncounters,
    redrawSessionZero,
    onForgeComplete,
    populateDungeonSelect,
    reset,
    openMixModal,
    closeMixModal,
    applyMix,
    exportJSON,
    loadJSON,
    handleJSONLoad,
    copyMarkdown,
    printCampaign,
    downloadCanvas,
    mixAndMatch: openMixModal,
  };

})();
