/**
 * js/renderer.js
 * Converts the generated campaign object into HTML for display.
 */

const Renderer = (() => {
  'use strict';

  function e(tag, cls, content) {
    return `<${tag}${cls ? ` class="${cls}"` : ''}>${content}</${tag}>`;
  }

  function section(icon, title, content) {
    return `
    <div class="c-section">
      <h2 class="c-section-title">
        <span class="section-icon">${icon}</span>
        ${title}
      </h2>
      ${content}
    </div>`;
  }

  // ── Title Block ───────────────────────────────────────
  function renderTitle(c) {
    const lvlRange = `Levels ${c.config.startLevel}–${c.config.endLevel}`;
    const players  = `${c.config.players} Players`;
    const acts     = `${c.config.acts} Acts`;
    return `
    <div class="campaign-title-block">
      <h1 class="c-title">${c.base.name}</h1>
      <p class="c-tagline">${c.base.tagline}</p>
      <div class="c-meta">
        <div class="c-meta-item"><span class="meta-label">Source:</span> ${c.base.source} <span class="source-badge">${c.base.id}</span></div>
        <div class="c-meta-item"><span class="meta-label">Levels:</span> ${lvlRange}</div>
        <div class="c-meta-item"><span class="meta-label">Players:</span> ${players}</div>
        <div class="c-meta-item"><span class="meta-label">Structure:</span> ${acts}</div>
        <div class="c-meta-item"><span class="meta-label">System:</span> ${c.pf2eVersion}</div>
      </div>
    </div>`;
  }

  // ── Synopsis ──────────────────────────────────────────
  function renderSynopsis(c) {
    return section('📜', 'Campaign Synopsis',
      `<p>${c.base.synopsis}</p>`
    );
  }

  // ── Hook ──────────────────────────────────────────────
  function renderHook(c) {
    if (!c.hook) return '';
    return section('🎣', 'Adventure Hook',
      `<p class="italic">"${c.hook}"</p>
       <p class="text-sm text-muted mt-sm">This hook draws all players into the campaign from different starting contexts. Adjust to fit individual backstories.</p>`
    );
  }

  // ── Villain ───────────────────────────────────────────
  function renderVillain(c) {
    const v = c.villain;
    return section('👁', 'The Antagonist',
      `<div class="villain-block">
        <div class="villain-name">${v.name}</div>
        <div class="villain-title">${v.title}</div>
        <div class="villain-stats">
          <div class="vstat"><span class="vstat-label">Creature Type</span><span class="vstat-value">${v.race}</span></div>
          <div class="vstat"><span class="vstat-label">Challenge</span><span class="vstat-value">CR ${v.cr || 'See Campaign Level'}</span></div>
          <div class="vstat"><span class="vstat-label">Ethics</span><span class="vstat-value">${v.alignment}</span></div>
        </div>
        <p><strong>Motivation:</strong> ${v.motivation}</p>
        <p class="mt-sm"><strong>Combat Tactics:</strong> ${v.tactics}</p>
        <p class="mt-sm"><strong>Exploitable Weakness:</strong> ${v.weakness}</p>
        <p class="mt-sm"><strong>Act 3 Revelation:</strong> <em>${v.secretReveal}</em></p>
      </div>`
    );
  }

  // ── Factions ──────────────────────────────────────────
  function renderFactions(c) {
    const colors = {
      'Ally': '#2a6040',
      'Villain': '#5a1010',
      'Villain (secondary)': '#8b3030',
      'Wildcard': '#4a3a10',
      'Employer/Ally': '#1a3060',
      'Ally/Wildcard': '#2a4020',
      'Ally (conditional)': '#1a4a30',
      'Situational Ally': '#3a3a20',
      'Antagonist (initially)': '#3a2010',
    };
    const cards = c.factions.map(f => {
      const bg = colors[f.role] || '#2a2420';
      return `
      <div class="faction-card">
        <div class="faction-header" style="background:${bg};color:#e8b84b;">
          ${f.name}
        </div>
        <div class="faction-body">
          <div class="faction-alignment">${f.alignment} · ${f.role}</div>
          <p class="text-sm mt-sm">${f.desc}</p>
        </div>
      </div>`;
    }).join('');
    return section('⚖', 'Factions &amp; Power Groups',
      `<div class="faction-grid">${cards}</div>`
    );
  }

  // ── NPCs ─────────────────────────────────────────────
  function renderNPCs(c) {
    if (!c.npcs || c.npcs.length === 0) return '';
    const cards = c.npcs.map(n => `
      <div class="npc-card">
        <div class="npc-name">${n.name}</div>
        <div class="npc-role">${n.role}</div>
        <p class="text-sm">${n.desc}</p>
        <p class="text-sm text-muted mt-sm"><em>Personality:</em> ${n.personality}</p>
      </div>`
    ).join('');
    return section('👥', 'Key NPCs',
      `<div class="npc-grid">${cards}</div>`
    );
  }

  // ── Acts ──────────────────────────────────────────────
  function renderActs(c) {
    const actHTML = c.acts.map(act => {
      // Side quests
      const sqCards = act.sideQuests.map(sq => `
        <div class="sq-card">
          <div class="sq-title">${sq.title}</div>
          <div class="sq-meta">
            <span class="sq-tag type">${sq.type}</span>
            <span class="sq-tag level">Lvl ${sq.level}</span>
            ${sq.optional ? '<span class="sq-tag">Optional</span>' : ''}
          </div>
          <p class="text-sm">${sq.desc}</p>
          <p class="text-sm mt-sm"><strong>DC:</strong> ${sq.dc} · <strong>Reward:</strong> ${sq.reward}</p>
        </div>`
      ).join('');

      // Boss
      const bossHTML = act.boss ? `
        <div class="act-subhead">Act Boss Encounter</div>
        <div class="boss-block">
          <div class="boss-name">${act.boss.name}</div>
          <div class="boss-creature">${act.boss.creature}</div>
          <div class="boss-tactics"><strong>Setup:</strong> ${act.boss.setup}</div>
          <div class="boss-tactics mt-sm"><strong>Phase 2:</strong> ${act.boss.phase2}</div>
          <div class="boss-tactics mt-sm"><strong>Environment:</strong> ${act.boss.env}</div>
        </div>` : '';

      // Encounters
      const encList = act.encounters.map(e =>
        `<li><strong>${e.type}:</strong> ${e.desc}</li>`
      ).join('');

      // Milestones
      const mileList = act.milestones.map(m => `<li>${m}</li>`).join('');

      // Twist
      const twistHTML = act.twist ? `
        <div class="act-subhead">Plot Twist — ${act.twist.timing}</div>
        <ul class="twist-list"><li><strong>Revelation:</strong> ${act.twist.twist}</li></ul>` : '';

      return `
      <div class="act-card">
        <div class="act-header">
          <span class="act-number">ACT ${act.number}</span>
          <span class="act-title">${act.title}</span>
          <span class="act-levels">Levels ${act.levelStart}–${act.levelEnd}</span>
        </div>
        <p class="act-summary">${act.summary}</p>
        <p class="text-sm"><strong>Primary Location:</strong> ${act.location}</p>

        <div class="act-subhead">Story Milestones</div>
        <ul class="milestone-list">${mileList}</ul>

        <div class="act-subhead">Encounter Types This Act</div>
        <ul class="encounter-list">${encList}</ul>

        ${bossHTML}
        ${twistHTML}

        <div class="act-subhead">Side Quests</div>
        <div class="sq-grid">${sqCards}</div>
      </div>`;
    }).join('');

    return section('📖', 'Acts &amp; Adventure Structure', actHTML);
  }

  // ── Rewards ──────────────────────────────────────────
  function renderRewards(c) {
    if (!c.rewards) return '';
    const rows = c.rewards.map(r =>
      `<tr>
        <td><strong>Act ${r.act}</strong></td>
        <td>${r.items[0] || '—'}</td>
        <td>${r.items[1] || '—'}</td>
      </tr>`
    ).join('');
    return section('💎', 'Treasure &amp; Rewards',
      `<table class="reward-table">
        <thead><tr><th>Act</th><th>Primary Reward</th><th>Secondary Reward</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="text-sm text-muted mt-sm">All rewards are guidelines. Adjust rarity and gold value to PF2e Item Level recommendations for the act's level range. Use the treasure by level table in GM Core.</p>`
    );
  }

  // ── Locations ─────────────────────────────────────────
  function renderLocations(c) {
    const items = c.locations.map((loc, i) =>
      `<li><strong>${['Starting Region', 'Act 1 Hub', 'Midpoint Nexus', 'Penultimate Location', 'Final Dungeon'][i] || `Location ${i+1}`}:</strong> ${loc}</li>`
    ).join('');
    return section('🗺', 'Key Locations',
      `<ul class="encounter-list">${items}</ul>
       <p class="text-sm text-muted mt-sm">Each location should contain at least 3 distinct sub-areas. Consult GM Core for environment building guidelines.</p>`
    );
  }

  // ── Twists Summary ────────────────────────────────────
  function renderTwists(c) {
    if (!c.twists || c.twists.length === 0) return '';
    const items = c.twists.map(t =>
      `<li><strong>${t.timing}:</strong> ${t.twist}</li>`
    ).join('');
    return section('🌀', 'Major Plot Twists',
      `<ul class="twist-list">${items}</ul>`
    );
  }

  // ── PF2e Notes ────────────────────────────────────────
  function renderPF2eNotes(c) {
    const notes = COMPONENTS.pf2eNotes;
    const players = c.config.players;
    const adj = (players - 4) * 10;
    const sign = adj >= 0 ? '+' : '';
    const items = notes.keyChanges.map(n => `<li>${n}</li>`).join('');
    const budget = notes.encounterBudget;

    return section('⚙', 'PF2e Remaster Notes',
      `<p><strong>Ruleset:</strong> ${notes.version}</p>
       <div class="act-subhead">Encounter Budget for ${players} Players${adj !== 0 ? ` (${sign}${adj} XP adjusted)` : ''}</div>
       <ul class="encounter-list">
         <li><strong>Trivial:</strong> ${40 + adj} XP — ${budget.trivial}</li>
         <li><strong>Low:</strong> ${60 + adj} XP — ${budget.low}</li>
         <li><strong>Moderate:</strong> ${80 + adj} XP — ${budget.moderate}</li>
         <li><strong>Severe:</strong> ${120 + adj} XP — ${budget.severe}</li>
         <li><strong>Extreme:</strong> ${160 + adj} XP — ${budget.extreme}</li>
       </ul>
       <div class="act-subhead">Remaster Key Changes</div>
       <ul class="encounter-list">${items}</ul>
       <p class="text-sm text-muted mt-sm">${notes.levelingNote}</p>`
    );
  }

  // ── Main Render ───────────────────────────────────────
  function render(c) {
    const html = `
    <div class="campaign-doc" id="campaignDoc">
      ${renderTitle(c)}
      ${renderSynopsis(c)}
      ${renderHook(c)}
      ${renderVillain(c)}
      ${renderFactions(c)}
      ${renderNPCs(c)}
      ${renderLocations(c)}
      ${renderTwists(c)}
      ${renderActs(c)}
      ${renderRewards(c)}
      ${renderPF2eNotes(c)}
      <p class="text-sm text-muted" style="text-align:center;margin-top:3rem;border-top:1px solid var(--parchment);padding-top:1rem;">
        Generated ${new Date(c.generated).toLocaleString()} · Campaign Forge · PF2e Remaster Compatible
      </p>
    </div>`;

    document.getElementById('campaignOutput').innerHTML = html;
    document.getElementById('outputPanel').style.display = 'block';
    document.getElementById('configPanel').style.display = 'none';

    // Smooth scroll to output
    setTimeout(() => document.getElementById('outputPanel').scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  // ── Plain Text Export ─────────────────────────────────
  function toMarkdown(c) {
    const lines = [];
    lines.push(`# ${c.base.name}`);
    lines.push(`> ${c.base.tagline}\n`);
    lines.push(`**Source:** ${c.base.source} | **Levels:** ${c.config.startLevel}–${c.config.endLevel} | **Players:** ${c.config.players} | **Acts:** ${c.config.acts}`);
    lines.push(`\n## Synopsis\n${c.base.synopsis}`);
    if (c.hook) lines.push(`\n## Adventure Hook\n> ${c.hook}`);
    lines.push(`\n## The Antagonist\n**${c.villain.name}** — ${c.villain.title}`);
    lines.push(`- **Type:** ${c.villain.race}\n- **Motivation:** ${c.villain.motivation}\n- **Tactics:** ${c.villain.tactics}\n- **Weakness:** ${c.villain.weakness}\n- **Secret:** ${c.villain.secretReveal}`);
    lines.push(`\n## Factions`);
    c.factions.forEach(f => lines.push(`- **${f.name}** (${f.role}): ${f.desc}`));
    c.acts.forEach(a => {
      lines.push(`\n## Act ${a.number}: ${a.title} (Levels ${a.levelStart}–${a.levelEnd})`);
      lines.push(a.summary);
      lines.push(`\n**Location:** ${a.location}`);
      lines.push(`\n**Milestones:**\n${a.milestones.map(m => `- ${m}`).join('\n')}`);
      if (a.boss) lines.push(`\n**Boss:** ${a.boss.name} (${a.boss.creature})\n- Setup: ${a.boss.setup}\n- Phase 2: ${a.boss.phase2}`);
      if (a.sideQuests.length > 0) {
        lines.push(`\n**Side Quests:**`);
        a.sideQuests.forEach(sq => lines.push(`- **${sq.title}** [${sq.type}] Lvl ${sq.level}: ${sq.desc}`));
      }
    });
    return lines.join('\n');
  }

  return { render, toMarkdown };

})();
