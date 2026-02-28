/**
 * js/sessionZero.js  —  Phase 3
 *
 * Session Zero Builder:
 *   • Per-player character questionnaires (backstory, motivations, fears)
 *   • Party composition analyser (roles, ability coverage, balance warnings)
 *   • Safety & Lines/Veils tool (X-Card, Lines, Veils, CATS framework)
 *   • Session notes / campaign contract template
 *   • Exportable as formatted HTML or plain text
 */

const SessionZero = (() => {
  'use strict';

  // ─── Data ───────────────────────────────────────────────────────────────

  const ANCESTRIES = [
    'Human','Elf','Dwarf','Gnome','Halfling','Goblin','Leshy','Catfolk',
    'Ratfolk','Tengu','Kobold','Orc','Half-Elf','Half-Orc','Fetchling',
    'Fleshwarp','Grippli','Kitsune','Nagaji','Sprite','Strix','Vishkanya',
    'Azarketi','Anadi','Automaton','Conrasu','Goloma','Shisk','Ghoran',
    'Poppet','Skeleton','Gnoll','Hobgoblin','Lizardfolk','Shoony','Custom',
  ];

  const CLASSES = [
    'Alchemist','Barbarian','Bard','Champion','Cleric','Druid',
    'Fighter','Gunslinger','Inventor','Investigator','Kineticist',
    'Magus','Monk','Oracle','Psychic','Ranger','Rogue','Sorcerer',
    'Summoner','Swashbuckler','Thaumaturge','Witch','Wizard',
    'Animist','Commander','Exemplar',  // Remaster additions
  ];

  const PARTY_ROLES = {
    'Striker':    { classes: ['Barbarian','Rogue','Ranger','Fighter','Gunslinger','Swashbuckler','Magus','Kineticist'], color: '#8a1a1a', icon: '⚔' },
    'Healer':     { classes: ['Cleric','Champion','Oracle','Druid','Animist'], color: '#1a5a1a', icon: '✚' },
    'Controller': { classes: ['Druid','Wizard','Sorcerer','Witch','Oracle','Psychic','Kineticist'], color: '#1a1a6a', icon: '🌀' },
    'Support':    { classes: ['Bard','Cleric','Champion','Thaumaturge','Summoner','Commander'], color: '#5a3a10', icon: '★' },
    'Scout':      { classes: ['Ranger','Rogue','Investigator','Monk','Druid'], color: '#2a4a2a', icon: '👁' },
    'Skill Monkey':{ classes: ['Rogue','Investigator','Bard','Ranger','Alchemist'], color: '#4a2a5a', icon: '🔑' },
    'Face':       { classes: ['Bard','Rogue','Oracle','Swashbuckler','Investigator','Psychic'], color: '#4a1a2a', icon: '🎭' },
  };

  const ABILITY_SCORES = ['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma'];

  const KEY_SKILLS = {
    'Athletics':    'Strength',
    'Acrobatics':   'Dexterity',
    'Stealth':      'Dexterity',
    'Perception':   'Wisdom',
    'Medicine':     'Wisdom',
    'Nature':       'Wisdom',
    'Religion':     'Wisdom',
    'Arcana':       'Intelligence',
    'Occultism':    'Intelligence',
    'Crafting':     'Intelligence',
    'Society':      'Intelligence',
    'Lore (Dungeon)':'Intelligence',
    'Diplomacy':    'Charisma',
    'Intimidation': 'Charisma',
    'Deception':    'Charisma',
    'Performance':  'Charisma',
    'Thievery':     'Dexterity',
    'Survival':     'Wisdom',
  };

  const BACKSTORY_PROMPTS = [
    'Where were you born, and how has that place shaped who you are today?',
    'Who is the most important person in your life, and where are they now?',
    'What is the one thing you want most in the world — and what would you sacrifice to get it?',
    'Describe a moment of failure that still haunts you.',
    'What does your character believe about the gods — worship, indifference, or active opposition?',
    'What is your relationship with authority figures (nobles, guards, clergy)?',
    'What event or choice forced you into the life of an adventurer?',
    'What is the one thing you would never do, no matter the circumstances?',
    'What does your character look like — and what detail about their appearance tells a story?',
    'What is your character afraid of? (Not just scared — terrified.)',
    'Describe your character\'s worst character flaw and how it manifests under pressure.',
    'What does your character do to relax, and when did they last have the chance?',
  ];

  const CAMPAIGN_CONTRACT_SECTIONS = [
    {
      title: 'Session Logistics',
      fields: [
        { id: 'sessionDay',      label: 'Regular Session Day',    type: 'text', placeholder: 'e.g. Every other Saturday' },
        { id: 'sessionTime',     label: 'Start / End Time',       type: 'text', placeholder: 'e.g. 6:00 PM – 10:00 PM' },
        { id: 'sessionLocation', label: 'Location / Platform',    type: 'text', placeholder: 'e.g. Discord + Roll20 / In person at...' },
        { id: 'absenteePolicy',  label: 'Absent Player Policy',   type: 'textarea', placeholder: 'e.g. Game continues if 3/4 players present; absent character becomes NPC' },
        { id: 'cancelPolicy',    label: 'Cancellation Notice',    type: 'text', placeholder: 'e.g. 48 hours notice required' },
      ],
    },
    {
      title: 'Table Rules',
      fields: [
        { id: 'phonePolicy',    label: 'Phone / Device Policy',  type: 'textarea', placeholder: 'e.g. Phones away during combat; Rulebook lookups ok; no social media at table' },
        { id: 'pvpPolicy',      label: 'PvP Policy',             type: 'textarea', placeholder: 'e.g. No PvP without mutual OOC consent; character conflict ok; character harm not ok' },
        { id: 'metaPolicy',     label: 'Metagaming Policy',      type: 'textarea', placeholder: 'e.g. Know the difference between player knowledge and character knowledge' },
        { id: 'spotlightPolicy',label: 'Spotlight & Inclusion',  type: 'textarea', placeholder: 'e.g. Every player should have at least one scene per session focused on their character' },
      ],
    },
    {
      title: 'Tone & Content',
      fields: [
        { id: 'toneStatement',  label: 'Campaign Tone Statement',type: 'textarea', placeholder: 'e.g. Heroic fantasy with serious consequences; comedic moments welcome but stakes are real' },
        { id: 'contentRating',  label: 'Content Rating',         type: 'select',   options: ['PG — Family Friendly','PG-13 — Some Violence, No Explicit Content','R — Mature Themes OK, Nothing Gratuitous','Custom (see Safety Tools)'] },
        { id: 'homebrewRules',  label: 'House Rules Summary',    type: 'textarea', placeholder: 'List any variant rules, custom rules, or modified RAW' },
      ],
    },
  ];

  const SAFETY_TOOLS = [
    {
      name: 'X-Card',
      desc: 'Any player can tap the X-Card (or type "X" in chat) at any time to skip or edit content without explanation. No questions asked.',
      howTo: 'Keep an index card with a large X on the table. When tapped, the GM immediately moves past or retcons the content.',
    },
    {
      name: 'Lines & Veils',
      desc: 'Lines are content that will never appear in this campaign. Veils are content that happens "off-screen" or is referenced but not detailed.',
      howTo: 'Complete the Lines/Veils worksheet before play. Review and update at the start of each new story arc.',
    },
    {
      name: 'Open Door Policy',
      desc: 'Any player can step away from the table at any time for any reason without explanation or judgment.',
      howTo: 'State this explicitly at Session Zero. Do not ask why someone stepped away.',
    },
    {
      name: 'Script Change',
      desc: 'Rewind (retcon a scene), Fast Forward (skip ahead), or Pause (take a break) — any player can call any of these.',
      howTo: 'Use hand signals or chat commands. Rewind = thumb down + backward gesture; Fast Forward = two thumbs up; Pause = T-sign.',
    },
    {
      name: 'Roses & Thorns / Stars & Wishes',
      desc: 'End-of-session reflection: each player shares one thing they loved (Rose/Star) and one thing they\'d change (Thorn/Wish).',
      howTo: 'Reserve 5–10 minutes at the end of each session. GM goes last.',
    },
  ];

  const DEFAULT_LINES = [
    'Sexual content involving minors',
    'Gratuitous torture presented approvingly',
    'Real-world politics or religion used mockingly',
    'Content targeting a specific player\'s real-world trauma',
  ];

  const COMMON_VEILS = [
    'Detailed descriptions of sexual content between adults',
    'Graphic torture that serves no narrative purpose',
    'On-screen death of children or animals',
    'Extended suffering without narrative payoff',
  ];

  // ─── State ──────────────────────────────────────────────────────────────

  let _players = [];
  let _contract = {};
  let _safety = {
    tools: { xcard: true, linesVeils: true, openDoor: true, scriptChange: false, starsWishes: true },
    lines: [...DEFAULT_LINES],
    veils: [...COMMON_VEILS],
    customLine: '',
    customVeil: '',
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  function render(container, campaign) {
    const playerCount = campaign?.config?.players || 4;

    // Sync player array to current count
    while (_players.length < playerCount) {
      _players.push(makeBlankPlayer(_players.length + 1));
    }
    _players = _players.slice(0, playerCount);

    container.innerHTML = buildHTML(campaign);
    _attachListeners(container, campaign);
  }

  function makeBlankPlayer(n) {
    return {
      num: n,
      playerName: '',
      charName: '',
      ancestry: '',
      pf2eClass: '',
      level: 1,
      background: '',
      keyAbility: '',
      skills: [],
      backstory: '',
      motivation: '',
      fear: '',
      secret: '',
      connection: '',
      goal: '',
      flaw: '',
      questPrompts: [],
    };
  }

  function buildHTML(campaign) {
    const campaignName = campaign?.base?.name || 'Your Campaign';
    return `
    <div class="sz-root">

      <!-- Header -->
      <div class="sz-header">
        <h2 class="sz-title">Session Zero Builder</h2>
        <p class="sz-subtitle">${campaignName} · ${_players.length} Players · PF2e Remaster</p>
        <div class="sz-actions-top">
          <button class="tool-btn" onclick="SessionZero.exportHTML()">📄 Export HTML</button>
          <button class="tool-btn" onclick="SessionZero.exportText()">📋 Copy Text</button>
          <button class="tool-btn" onclick="SessionZero.printSZ()">🖨 Print</button>
        </div>
      </div>

      <!-- Section nav -->
      <div class="sz-nav">
        <button class="sz-nav-btn active" onclick="SessionZero.szTab('players',this)">👥 Player Characters</button>
        <button class="sz-nav-btn" onclick="SessionZero.szTab('party',this)">⚖ Party Analysis</button>
        <button class="sz-nav-btn" onclick="SessionZero.szTab('safety',this)">🛡 Safety Tools</button>
        <button class="sz-nav-btn" onclick="SessionZero.szTab('contract',this)">📜 Campaign Contract</button>
      </div>

      <!-- Pane: Player Characters -->
      <div class="sz-pane active" id="sz-players">
        <div class="sz-player-tabs">
          ${_players.map((p, i) =>
            `<button class="sz-ptab ${i === 0 ? 'active' : ''}"
              onclick="SessionZero.playerTab(${i},this)"
              id="sz-ptab-${i}">Player ${p.num}</button>`
          ).join('')}
        </div>
        ${_players.map((p, i) => buildPlayerForm(p, i, campaign)).join('')}
      </div>

      <!-- Pane: Party Analysis -->
      <div class="sz-pane" id="sz-party">
        <div id="partyAnalysis">${buildPartyAnalysis()}</div>
      </div>

      <!-- Pane: Safety Tools -->
      <div class="sz-pane" id="sz-safety">
        ${buildSafetyPanel()}
      </div>

      <!-- Pane: Campaign Contract -->
      <div class="sz-pane" id="sz-contract">
        ${buildContractPanel(campaign)}
      </div>

    </div>`;
  }

  // ─── Player Form ─────────────────────────────────────────────────────────

  function buildPlayerForm(p, i, campaign) {
    const prompts = BACKSTORY_PROMPTS.slice(0, 5);
    return `
    <div class="sz-player-pane ${i === 0 ? 'active' : ''}" id="sz-pp-${i}">
      <div class="sz-player-form">

        <div class="sz-form-grid">
          <div class="sz-form-group">
            <label class="sz-label">Player Name</label>
            <input class="sz-input" type="text" placeholder="Real name" value="${p.playerName}"
              oninput="SessionZero.updatePlayer(${i},'playerName',this.value)"/>
          </div>
          <div class="sz-form-group">
            <label class="sz-label">Character Name</label>
            <input class="sz-input" type="text" placeholder="Character name" value="${p.charName}"
              oninput="SessionZero.updatePlayer(${i},'charName',this.value)"/>
          </div>
          <div class="sz-form-group">
            <label class="sz-label">Ancestry</label>
            <select class="sz-select" onchange="SessionZero.updatePlayer(${i},'ancestry',this.value)">
              <option value="">— Select —</option>
              ${ANCESTRIES.map(a => `<option value="${a}" ${p.ancestry===a?'selected':''}>${a}</option>`).join('')}
            </select>
          </div>
          <div class="sz-form-group">
            <label class="sz-label">Class</label>
            <select class="sz-select" onchange="SessionZero.updatePlayer(${i},'pf2eClass',this.value)">
              <option value="">— Select —</option>
              ${CLASSES.map(c => `<option value="${c}" ${p.pf2eClass===c?'selected':''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="sz-form-group">
            <label class="sz-label">Starting Level</label>
            <select class="sz-select" onchange="SessionZero.updatePlayer(${i},'level',parseInt(this.value))">
              ${Array.from({length:20},(_,n)=>`<option value="${n+1}" ${p.level===n+1?'selected':''}>${n+1}</option>`).join('')}
            </select>
          </div>
          <div class="sz-form-group">
            <label class="sz-label">Key Ability</label>
            <select class="sz-select" onchange="SessionZero.updatePlayer(${i},'keyAbility',this.value)">
              <option value="">— Select —</option>
              ${ABILITY_SCORES.map(a => `<option value="${a}" ${p.keyAbility===a?'selected':''}>${a}</option>`).join('')}
            </select>
          </div>
          <div class="sz-form-group sz-span2">
            <label class="sz-label">Background</label>
            <input class="sz-input" type="text" placeholder="e.g. Merchant, Soldier, Acolyte…" value="${p.background}"
              oninput="SessionZero.updatePlayer(${i},'background',this.value)"/>
          </div>
          <div class="sz-form-group sz-span2">
            <label class="sz-label">Trained Skills (comma-separated)</label>
            <input class="sz-input" type="text" placeholder="e.g. Stealth, Athletics, Arcana"
              value="${Array.isArray(p.skills)?p.skills.join(', '):''}"
              oninput="SessionZero.updatePlayer(${i},'skills',this.value.split(',').map(s=>s.trim()).filter(Boolean))"/>
          </div>
        </div>

        <div class="sz-section-divider">Character Questionnaire</div>

        <div class="sz-q-grid">
          <div class="sz-form-group sz-span2">
            <label class="sz-label">Character Goal (What do they want most?)</label>
            <input class="sz-input" type="text" placeholder="Short-term goal · Long-term ambition" value="${p.goal}"
              oninput="SessionZero.updatePlayer(${i},'goal',this.value)"/>
          </div>
          <div class="sz-form-group sz-span2">
            <label class="sz-label">Core Motivation (Why do they adventure?)</label>
            <input class="sz-input" type="text" placeholder="What drives this character forward?" value="${p.motivation}"
              oninput="SessionZero.updatePlayer(${i},'motivation',this.value)"/>
          </div>
          <div class="sz-form-group">
            <label class="sz-label">Greatest Fear</label>
            <input class="sz-input" type="text" placeholder="Specific, personal, visceral" value="${p.fear}"
              oninput="SessionZero.updatePlayer(${i},'fear',this.value)"/>
          </div>
          <div class="sz-form-group">
            <label class="sz-label">Defining Flaw</label>
            <input class="sz-input" type="text" placeholder="Comes out under pressure" value="${p.flaw}"
              oninput="SessionZero.updatePlayer(${i},'flaw',this.value)"/>
          </div>
          <div class="sz-form-group sz-span2">
            <label class="sz-label">Connection to Campaign<br><span class="sz-hint">Why does this character care about ${campaign?.base?.name || 'this adventure'}?</span></label>
            <textarea class="sz-textarea" rows="2" placeholder="Hook this character into the campaign premise…"
              oninput="SessionZero.updatePlayer(${i},'connection',this.value)">${p.connection}</textarea>
          </div>
          <div class="sz-form-group sz-span2">
            <label class="sz-label">Character Secret <span class="sz-hint">(For GM eyes only)</span></label>
            <textarea class="sz-textarea" rows="2" placeholder="Something only the GM knows about this character's past or nature…"
              oninput="SessionZero.updatePlayer(${i},'secret',this.value)">${p.secret}</textarea>
          </div>
          <div class="sz-form-group sz-span2">
            <label class="sz-label">Backstory Summary</label>
            <textarea class="sz-textarea" rows="4" placeholder="${prompts[0]}"
              oninput="SessionZero.updatePlayer(${i},'backstory',this.value)">${p.backstory}</textarea>
          </div>
        </div>

        <div class="sz-section-divider">Prompt Suggestions</div>
        <ul class="sz-prompt-list">
          ${BACKSTORY_PROMPTS.map(q => `<li>${q}</li>`).join('')}
        </ul>

      </div>
    </div>`;
  }

  // ─── Party Analysis ──────────────────────────────────────────────────────

  function buildPartyAnalysis() {
    if (_players.every(p => !p.pf2eClass)) {
      return `<div class="sz-empty">Fill in character classes on the Player Characters tab to see party analysis.</div>`;
    }

    // Role coverage
    const roleCoverage = {};
    for (const [role, data] of Object.entries(PARTY_ROLES)) roleCoverage[role] = [];
    for (const p of _players) {
      if (!p.pf2eClass) continue;
      for (const [role, data] of Object.entries(PARTY_ROLES)) {
        if (data.classes.includes(p.pf2eClass)) {
          roleCoverage[role].push(p.charName || `Player ${p.num}`);
        }
      }
    }

    // Skill coverage
    const coveredSkills = new Set();
    for (const p of _players) {
      if (Array.isArray(p.skills)) p.skills.forEach(s => coveredSkills.add(s));
    }
    const criticalSkills = ['Perception','Medicine','Athletics','Stealth','Arcana','Diplomacy','Society','Thievery','Survival','Nature'];
    const missing = criticalSkills.filter(s => !coveredSkills.has(s));

    // Warnings
    const warnings = [];
    if (!roleCoverage['Healer']?.length) warnings.push({ level:'danger', msg:'No dedicated healer. Consider Medicine proficiency or healing items as backup.' });
    if (!roleCoverage['Striker']?.length) warnings.push({ level:'danger', msg:'No dedicated striker. Combat may drag significantly.' });
    if (!roleCoverage['Support']?.length) warnings.push({ level:'warn', msg:'No support/buffer. The party may lack action economy advantages.' });
    if (!roleCoverage['Scout']?.length) warnings.push({ level:'warn', msg:'No scout. The party may be surprised frequently.' });
    if (!roleCoverage['Face']?.length) warnings.push({ level:'info', msg:'No social face. Social encounters may be more challenging.' });
    if (missing.includes('Medicine')) warnings.push({ level:'warn', msg:'Medicine not covered — no in-combat healing without items.' });
    if (missing.includes('Perception')) warnings.push({ level:'info', msg:'Perception not listed — ensure someone has high Perception.' });

    const roleHTML = Object.entries(roleCoverage).map(([role, chars]) => {
      const d = PARTY_ROLES[role];
      const covered = chars.length > 0;
      return `
      <div class="party-role-card ${covered?'covered':'uncovered'}">
        <div class="prc-icon" style="color:${d.color}">${d.icon}</div>
        <div class="prc-name">${role}</div>
        <div class="prc-chars">${chars.length ? chars.join(', ') : '—'}</div>
        <div class="prc-classes">${d.classes.slice(0,5).join(' · ')}</div>
      </div>`;
    }).join('');

    const warnHTML = warnings.map(w => `
      <div class="party-warn ${w.level}">
        <span class="warn-icon">${w.level==='danger'?'⚠':w.level==='warn'?'⚡':'ℹ'}</span>
        ${w.msg}
      </div>`).join('') || '<div class="party-warn info"><span class="warn-icon">✓</span>Party composition looks well-balanced.</div>';

    const skillHTML = criticalSkills.map(s => {
      const has = coveredSkills.has(s);
      return `<span class="skill-pill ${has?'covered':'missing'}">${s}</span>`;
    }).join('');

    // Stat block summary table
    const charTable = _players.filter(p=>p.pf2eClass).map(p => `
      <tr>
        <td><strong>${p.charName||`Player ${p.num}`}</strong></td>
        <td>${p.ancestry||'—'}</td>
        <td>${p.pf2eClass||'—'}</td>
        <td>${p.level}</td>
        <td>${p.keyAbility||'—'}</td>
        <td class="text-sm">${Array.isArray(p.skills)?p.skills.slice(0,4).join(', '):'—'}</td>
      </tr>`).join('');

    return `
    <div class="party-analysis">
      <h3 class="sz-section-title">Party Composition</h3>
      <table class="party-table">
        <thead><tr><th>Character</th><th>Ancestry</th><th>Class</th><th>Lvl</th><th>Key Ability</th><th>Skills</th></tr></thead>
        <tbody>${charTable || '<tr><td colspan="6" style="text-align:center;color:var(--text-dim)">No characters entered yet</td></tr>'}</tbody>
      </table>

      <h3 class="sz-section-title mt-md">Role Coverage</h3>
      <div class="party-roles">${roleHTML}</div>

      <h3 class="sz-section-title mt-md">Warnings &amp; Suggestions</h3>
      <div class="party-warnings">${warnHTML}</div>

      <h3 class="sz-section-title mt-md">Critical Skill Coverage</h3>
      <p class="text-sm text-muted mb-sm">Green = at least one character has this trained. Red = gap in party skills.</p>
      <div class="skill-pills">${skillHTML}</div>

      <h3 class="sz-section-title mt-md">Action Economy Note</h3>
      <p class="text-sm">With <strong>${_players.length} players</strong>, the party has
        <strong>${_players.length * 3} actions</strong> and
        <strong>${_players.length} reactions</strong> per round.
        PF2e encounter budgets are calibrated for 4 players; ${_players.length !== 4 ? `adjust encounter XP by <strong>${(_players.length-4)*10 >= 0 ? '+' : ''}${(_players.length-4)*10} XP</strong> per encounter.` : 'your budget is at baseline.'}
      </p>
    </div>`;
  }

  // ─── Safety Panel ────────────────────────────────────────────────────────

  function buildSafetyPanel() {
    const toolsHTML = SAFETY_TOOLS.map(t => `
      <div class="safety-tool-card">
        <div class="stc-name">${t.name}</div>
        <p class="stc-desc">${t.desc}</p>
        <div class="stc-how"><strong>How to use:</strong> ${t.howTo}</div>
      </div>`).join('');

    const linesHTML = _safety.lines.map((l,i) => `
      <div class="lv-item">
        <span>${l}</span>
        <button class="lv-remove" onclick="SessionZero.removeLine(${i})">✕</button>
      </div>`).join('');

    const veilsHTML = _safety.veils.map((v,i) => `
      <div class="lv-item">
        <span>${v}</span>
        <button class="lv-remove" onclick="SessionZero.removeVeil(${i})">✕</button>
      </div>`).join('');

    const toolChecks = Object.entries(_safety.tools).map(([key, checked]) => {
      const labels = { xcard:'X-Card', linesVeils:'Lines & Veils', openDoor:'Open Door Policy', scriptChange:'Script Change', starsWishes:'Stars & Wishes' };
      return `<label class="toggle-item">
        <input type="checkbox" ${checked?'checked':''} onchange="SessionZero.toggleTool('${key}',this.checked)"/>
        <span class="toggle-label">${labels[key]||key}</span>
      </label>`;
    }).join('');

    return `
    <div class="safety-panel">
      <div class="sz-section-title">Safety Tools Reference</div>
      <div class="safety-tools-grid">${toolsHTML}</div>

      <div class="sz-section-title mt-md">Tools for This Campaign</div>
      <div class="toggle-grid" style="margin-bottom:1.5rem;">${toolChecks}</div>

      <div class="lv-section">
        <div class="lv-col">
          <div class="sz-section-title">Lines <span class="sz-hint">(Never appear in play)</span></div>
          <div id="lines-list">${linesHTML}</div>
          <div class="lv-add-row">
            <input class="sz-input" id="lineInput" type="text" placeholder="Add a Line…"/>
            <button class="tool-btn" onclick="SessionZero.addLine()">Add</button>
          </div>
        </div>
        <div class="lv-col">
          <div class="sz-section-title">Veils <span class="sz-hint">(Happen off-screen)</span></div>
          <div id="veils-list">${veilsHTML}</div>
          <div class="lv-add-row">
            <input class="sz-input" id="veilInput" type="text" placeholder="Add a Veil…"/>
            <button class="tool-btn" onclick="SessionZero.addVeil()">Add</button>
          </div>
        </div>
      </div>

      <div class="sz-section-title mt-md">CATS Framework Summary</div>
      <div class="cats-grid">
        <div class="cats-card"><div class="cats-letter">C</div><div class="cats-word">Concept</div><div class="cats-desc">What kind of game is this? Genre, setting, premise in 2–3 sentences.</div></div>
        <div class="cats-card"><div class="cats-letter">A</div><div class="cats-word">Aim</div><div class="cats-desc">What are we trying to achieve together? The goal of the campaign.</div></div>
        <div class="cats-card"><div class="cats-letter">T</div><div class="cats-word">Tone</div><div class="cats-desc">How serious, dark, comedic, or dramatic is this game?</div></div>
        <div class="cats-card"><div class="cats-letter">S</div><div class="cats-word">Subject Matter</div><div class="cats-desc">What topics, themes, and content will appear — or won't?</div></div>
      </div>
    </div>`;
  }

  // ─── Campaign Contract Panel ─────────────────────────────────────────────

  function buildContractPanel(campaign) {
    const sections = CAMPAIGN_CONTRACT_SECTIONS.map(sec => {
      const fields = sec.fields.map(f => {
        if (f.type === 'select') {
          return `<div class="sz-form-group sz-span2">
            <label class="sz-label">${f.label}</label>
            <select class="sz-select" onchange="SessionZero.updateContract('${f.id}',this.value)">
              ${f.options.map(o=>`<option value="${o}" ${_contract[f.id]===o?'selected':''}>${o}</option>`).join('')}
            </select>
          </div>`;
        }
        if (f.type === 'textarea') {
          return `<div class="sz-form-group sz-span2">
            <label class="sz-label">${f.label}</label>
            <textarea class="sz-textarea" rows="3" placeholder="${f.placeholder||''}"
              oninput="SessionZero.updateContract('${f.id}',this.value)">${_contract[f.id]||''}</textarea>
          </div>`;
        }
        return `<div class="sz-form-group">
          <label class="sz-label">${f.label}</label>
          <input class="sz-input" type="text" placeholder="${f.placeholder||''}" value="${_contract[f.id]||''}"
            oninput="SessionZero.updateContract('${f.id}',this.value)"/>
        </div>`;
      }).join('');
      return `
      <div class="contract-section">
        <div class="sz-section-title">${sec.title}</div>
        <div class="sz-form-grid">${fields}</div>
      </div>`;
    }).join('');

    return `
    <div class="contract-panel">
      <p class="text-sm text-muted" style="margin-bottom:1.5rem;">
        A campaign contract sets expectations before the first session. Fill out, share with all players, and revisit at major campaign milestones.
        Campaign: <strong>${campaign?.base?.name||'Unnamed Campaign'}</strong>
      </p>
      ${sections}
      <div class="contract-section">
        <div class="sz-section-title">Player Acknowledgement</div>
        <p class="text-sm text-muted">Export this document and have each player sign/initial the printed or digital copy.</p>
        <div class="sig-grid">
          ${_players.map(p=>`
          <div class="sig-block">
            <div class="sig-name">${p.playerName||`Player ${p.num}`} (${p.charName||'Character TBD'})</div>
            <div class="sig-line">Signature: ___________________________  Date: __________</div>
          </div>`).join('')}
          <div class="sig-block">
            <div class="sig-name">Game Master</div>
            <div class="sig-line">Signature: ___________________________  Date: __________</div>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ─── Event Listeners ─────────────────────────────────────────────────────

  function _attachListeners(container, campaign) {
    // Listeners are all inline via oninput/onchange — no additional wiring needed
  }

  // ─── Public mutation methods (called from inline HTML) ────────────────────

  function szTab(name, btn) {
    document.querySelectorAll('.sz-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sz-nav-btn').forEach(b => b.classList.remove('active'));
    const pane = document.getElementById(`sz-${name}`);
    if (pane) pane.classList.add('active');
    if (btn) btn.classList.add('active');
    if (name === 'party') {
      const pa = document.getElementById('partyAnalysis');
      if (pa) pa.innerHTML = buildPartyAnalysis();
    }
  }

  function playerTab(idx, btn) {
    document.querySelectorAll('.sz-player-pane').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sz-ptab').forEach(b => b.classList.remove('active'));
    const pane = document.getElementById(`sz-pp-${idx}`);
    if (pane) pane.classList.add('active');
    if (btn) btn.classList.add('active');
  }

  function updatePlayer(idx, field, value) {
    if (_players[idx]) _players[idx][field] = value;
    // Live-update the player tab label
    const tab = document.getElementById(`sz-ptab-${idx}`);
    if (tab && _players[idx]) {
      const p = _players[idx];
      tab.textContent = p.charName || p.playerName || `Player ${p.num}`;
    }
  }

  function updateContract(field, value) { _contract[field] = value; }

  function toggleTool(key, checked) { _safety.tools[key] = checked; }

  function addLine() {
    const input = document.getElementById('lineInput');
    const val = input?.value?.trim();
    if (!val) return;
    _safety.lines.push(val);
    input.value = '';
    _refreshLV();
  }

  function addVeil() {
    const input = document.getElementById('veilInput');
    const val = input?.value?.trim();
    if (!val) return;
    _safety.veils.push(val);
    input.value = '';
    _refreshLV();
  }

  function removeLine(i) { _safety.lines.splice(i, 1); _refreshLV(); }
  function removeVeil(i) { _safety.veils.splice(i, 1); _refreshLV(); }

  function _refreshLV() {
    const ll = document.getElementById('lines-list');
    const vl = document.getElementById('veils-list');
    if (ll) ll.innerHTML = _safety.lines.map((l,i)=>`<div class="lv-item"><span>${l}</span><button class="lv-remove" onclick="SessionZero.removeLine(${i})">✕</button></div>`).join('');
    if (vl) vl.innerHTML = _safety.veils.map((v,i)=>`<div class="lv-item"><span>${v}</span><button class="lv-remove" onclick="SessionZero.removeVeil(${i})">✕</button></div>`).join('');
  }

  // ─── Export ──────────────────────────────────────────────────────────────

  function exportHTML() {
    const container = document.querySelector('.sz-root');
    if (!container) return;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Session Zero Document</title>
<style>
  body { font-family: Georgia, serif; max-width: 900px; margin: 2rem auto; color: #2a1a0a; line-height: 1.6; }
  h2,h3 { color: #8b1a1a; } table { border-collapse:collapse; width:100%; }
  th,td { border:1px solid #ccc; padding:0.4rem 0.6rem; text-align:left; font-size:0.9rem; }
  th { background:#f0e8d8; } .warn { background:#fff8e8; border-left:4px solid #c9973a; padding:0.4rem 0.6rem; margin:0.3rem 0; }
  .lv-item { border-left:3px solid #8b1a1a; padding:0.3rem 0.6rem; margin:0.3rem 0; }
  .sig-block { margin:1rem 0; } .sig-line { border-bottom:1px solid #666; width:80%; margin-top:0.3rem; }
</style>
</head>
<body>
${container.innerHTML.replace(/<button[^>]*>.*?<\/button>/g,'').replace(/<input[^>]*/g, s => s)}
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'session-zero.html';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportText() {
    const lines = ['SESSION ZERO DOCUMENT', '='.repeat(40), ''];
    for (const p of _players) {
      lines.push(`PLAYER ${p.num}: ${p.playerName||'TBD'}`);
      lines.push(`Character: ${p.charName||'TBD'} · ${p.ancestry||'?'} ${p.pf2eClass||'?'} ${p.level}`);
      lines.push(`Goal: ${p.goal||'—'}`);
      lines.push(`Motivation: ${p.motivation||'—'}`);
      lines.push(`Fear: ${p.fear||'—'}`);
      lines.push(`Flaw: ${p.flaw||'—'}`);
      lines.push(`Campaign Connection: ${p.connection||'—'}`);
      lines.push(`Backstory: ${p.backstory||'—'}`);
      lines.push('');
    }
    lines.push('SAFETY TOOLS', '-'.repeat(30));
    const activeTools = Object.entries(_safety.tools).filter(([,v])=>v).map(([k])=>k);
    lines.push(`Active: ${activeTools.join(', ')}`);
    lines.push('Lines: ' + _safety.lines.join(' | '));
    lines.push('Veils: ' + _safety.veils.join(' | '));
    lines.push('');
    lines.push('CAMPAIGN CONTRACT', '-'.repeat(30));
    for (const [k,v] of Object.entries(_contract)) lines.push(`${k}: ${v}`);
    navigator.clipboard.writeText(lines.join('\n'))
      .then(() => alert('Session Zero text copied to clipboard!'));
  }

  function printSZ() { window.print(); }

  // ─── Public API ──────────────────────────────────────────────────────────

  return {
    render,
    szTab,
    playerTab,
    updatePlayer,
    updateContract,
    toggleTool,
    addLine, addVeil, removeLine, removeVeil,
    exportHTML, exportText, printSZ,
    getPlayers: () => _players,
    getSafety:  () => _safety,
    getContract:() => _contract,
  };

})();
