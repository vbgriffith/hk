/**
 * js/renderer.js  — Build 5 Complete Rewrite
 *
 * New sections:
 *   renderEnvironment()      — terrain, lighting, weather, hazards, landmark, tactical notes
 *   renderStatBlock()        — full PF2e stat block with every field, source citation
 *   renderEncounterGroup()   — heading + XP budget + creature stat blocks
 *   renderActEncounters()    — 3 generated encounters per act (Low/Moderate/Severe)
 *   renderBossBlock()        — boss encounter with full stat block + phase 2
 *   renderSideQuestFull()    — side quest card + encounter + stat blocks
 */

const Renderer = (() => {
  'use strict';

  // ── tiny helpers ──────────────────────────────────────────────────────────
  function esc(s) {
    return String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function section(icon, title, content) {
    return '<div class="c-section"><h2 class="c-section-title"><span class="section-icon">' +
           icon + '</span>' + title + '</h2>' + content + '</div>';
  }
  function subhead(t) { return '<div class="act-subhead">' + t + '</div>'; }
  function sign(n) { return n >= 0 ? '+' + n : '' + n; }
  function mod(n) { n = parseInt(n)||0; return (n >= 0 ? '+' : '') + n; }

  // ─────────────────────────────────────────────────────────────────────────
  // STAT BLOCK RENDERER
  // ─────────────────────────────────────────────────────────────────────────

  function renderStatBlock(sb, creatureName) {
    if (!sb) return '<p class="text-sm text-muted"><em>Stat block unavailable.</em></p>';

    var name   = creatureName || sb.name || 'Creature';
    var lvl    = sb.level !== undefined ? sb.level : '?';
    var traits = (sb.traits || []).map(function(t) {
      return '<span class="sb-trait">' + esc(t) + '</span>';
    }).join('');

    // Source line
    var src = sb.source || {};
    var srcLine = '';
    if (src.book) {
      srcLine = '<div class="sb-source">' +
        '<span class="sb-source-label">Source:</span> ' +
        '<strong>' + esc(src.book) + '</strong>';
      if (src.page && src.page !== '—') srcLine += ' p.' + esc(src.page);
      if (src.note) srcLine += ' <span class="sb-source-note">— ' + esc(src.note) + '</span>';
      if (sb.isScaled) srcLine += ' <span class="sb-scaled-badge">⚠ Scaled</span>';
      srcLine += '</div>';
    }

    // Senses / perception
    var sensesStr = 'Perception ' + mod(sb.perception);
    if (sb.senses && sb.senses.length) sensesStr += '; ' + sb.senses.join(', ');

    // Languages
    var langStr = (sb.languages && sb.languages.length) ? sb.languages.join(', ') : '—';

    // Skills
    var skillsStr = '—';
    if (sb.skills && Object.keys(sb.skills).length) {
      skillsStr = Object.keys(sb.skills).map(function(k) {
        return k + ' ' + mod(sb.skills[k]);
      }).join(', ');
    }

    // Ability mods
    var am = sb.abilityMods || {};
    var abilityRow = ['str','dex','con','int','wis','cha'].map(function(a) {
      var val = am[a] !== undefined ? am[a] : '—';
      return '<div class="sb-ability"><span class="sb-ability-label">' + a.toUpperCase() +
             '</span><span class="sb-ability-val">' + (typeof val === 'number' ? mod(val) : val) + '</span></div>';
    }).join('');

    // Saves
    var sv = sb.saves || {};
    var savesStr = 'Fort ' + mod(sv.fort) + ', Ref ' + mod(sv.ref) + ', Will ' + mod(sv.will);

    // Immunities / resistances / weaknesses
    var immStr  = (sb.immunities  && sb.immunities.length)  ? sb.immunities.join('; ')  : '—';
    var resStr  = (sb.resistances && sb.resistances.length) ? sb.resistances.join('; ') : '—';
    var weakStr = (sb.weaknesses  && sb.weaknesses.length)  ? sb.weaknesses.join('; ')  : '—';

    // Speeds
    var sp = sb.speeds || { land: 25 };
    var speedStr = Object.keys(sp).map(function(k) {
      return (k === 'land' ? '' : k + ' ') + sp[k] + ' ft';
    }).join(', ');

    // Attacks
    var attackRows = '';
    if (sb.attacks && sb.attacks.length) {
      attackRows = sb.attacks.map(function(atk) {
        var traitTags = (atk.traits || []).map(function(t){ return '<span class="sb-atk-trait">' + esc(t) + '</span>'; }).join(' ');
        var effects = (atk.effects || []).length ? '<br><span class="sb-atk-effect">Effect: ' + atk.effects.join('; ') + '</span>' : '';
        return '<tr><td class="sb-atk-name"><strong>' + esc(atk.name) + '</strong>' + (traitTags ? ' ' + traitTags : '') + '</td>' +
               '<td class="sb-atk-bonus">' + mod(atk.bonus) + '</td>' +
               '<td class="sb-atk-dmg">' + esc(atk.damage) + effects + '</td></tr>';
      }).join('');
      attackRows = '<table class="sb-atk-table"><thead><tr><th>Strike</th><th>Bonus</th><th>Damage</th></tr></thead><tbody>' + attackRows + '</tbody></table>';
    }

    // Actions
    var actionHTML = '';
    if (sb.actions && sb.actions.length) {
      actionHTML = sb.actions.map(function(a) {
        var sym = { '1':'◆','2':'◆◆','3':'◆◆◆','R':'↺','F':'⬲','passive':'—' }[a.actions] || a.actions;
        var typeTag = a.type ? '<span class="sb-action-type">' + esc(a.type) + '</span>' : '';
        return '<div class="sb-action">' +
               '<span class="sb-action-sym">' + sym + '</span> ' +
               '<strong>' + esc(a.name) + '</strong> ' + typeTag +
               '<div class="sb-action-desc">' + esc(a.description) + '</div></div>';
      }).join('');
    }

    // Passives
    var passiveHTML = '';
    if (sb.passives && sb.passives.length) {
      passiveHTML = '<div class="sb-passives">' +
        sb.passives.map(function(p) { return '<div class="sb-passive">◈ ' + esc(p) + '</div>'; }).join('') +
        '</div>';
    }

    // Phase 2 (boss only)
    var phase2HTML = '';
    if (sb.phase2) {
      var p2 = sb.phase2;
      phase2HTML = '<div class="sb-phase2">' +
        '<div class="sb-phase2-head">⚡ Phase 2 Trigger: <em>' + esc(p2.trigger) + '</em></div>' +
        (p2.changes || []).map(function(c){ return '<div class="sb-phase2-change">→ ' + esc(c) + '</div>'; }).join('') +
        '</div>';
    }

    return '<div class="stat-block' + (sb.isScaled ? ' stat-block--scaled' : '') + '">' +
      '<div class="sb-header">' +
        '<div class="sb-name-line">' +
          '<span class="sb-name">' + esc(name) + '</span>' +
          '<span class="sb-level">Creature ' + lvl + '</span>' +
        '</div>' +
        '<div class="sb-traits">' + traits + '</div>' +
      '</div>' +
      srcLine +
      '<div class="sb-body">' +
        '<div class="sb-row"><span class="sb-field-label">Perception</span><span>' + sensesStr + '</span></div>' +
        '<div class="sb-row"><span class="sb-field-label">Languages</span><span>' + esc(langStr) + '</span></div>' +
        '<div class="sb-row"><span class="sb-field-label">Skills</span><span>' + esc(skillsStr) + '</span></div>' +
        '<div class="sb-ability-row">' + abilityRow + '</div>' +
        '<div class="sb-divider"></div>' +
        '<div class="sb-row sb-row--triple">' +
          '<span><span class="sb-field-label">AC</span> <strong>' + esc(sb.ac) + '</strong></span>' +
          '<span><span class="sb-field-label">HP</span> <strong>' + esc(sb.hp) + '</strong></span>' +
          '<span><span class="sb-field-label">Saves</span> ' + esc(savesStr) + '</span>' +
        '</div>' +
        (immStr !== '—'  ? '<div class="sb-row"><span class="sb-field-label">Immunities</span><span class="sb-immunity">' + esc(immStr) + '</span></div>' : '') +
        (resStr !== '—'  ? '<div class="sb-row"><span class="sb-field-label">Resistances</span><span class="sb-resistance">' + esc(resStr) + '</span></div>' : '') +
        (weakStr !== '—' ? '<div class="sb-row"><span class="sb-field-label">Weaknesses</span><span class="sb-weakness">' + esc(weakStr) + '</span></div>' : '') +
        '<div class="sb-row"><span class="sb-field-label">Speed</span><span>' + esc(speedStr) + '</span></div>' +
        '<div class="sb-divider"></div>' +
        attackRows +
        actionHTML +
        passiveHTML +
        phase2HTML +
      '</div>' +
    '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ENVIRONMENT RENDERER
  // ─────────────────────────────────────────────────────────────────────────

  function renderEnvironment(env) {
    if (!env) return '';
    var hazardHTML = (env.hazards || []).map(function(h) {
      return '<div class="env-hazard">' +
        '<span class="env-hazard-name">' + esc(h.name) + '</span>' +
        '<span class="env-hazard-type">' + esc(h.type) + '</span>' +
        (h.dc && h.dc !== '—' ? '<span class="env-hazard-dc">DC ' + esc(h.dc) + '</span>' : '') +
        '<p class="env-hazard-desc">' + esc(h.desc) + '</p>' +
      '</div>';
    }).join('');

    return '<div class="env-block">' +
      '<div class="env-header"><span class="env-icon">🌍</span> Environment — ' + esc((env.terrainType||'').toUpperCase()) + '</div>' +
      '<div class="env-grid">' +
        '<div class="env-item"><span class="env-label">Terrain</span><span>' + esc((env.terrain||[]).join(', ')) + '</span></div>' +
        '<div class="env-item"><span class="env-label">Lighting</span><span>' + esc(env.lighting||'') + '</span></div>' +
        '<div class="env-item"><span class="env-label">Atmosphere</span><span>' + esc(env.weather||'') + '</span></div>' +
        '<div class="env-item"><span class="env-label">Landmark</span><span>' + esc(env.landmark||'') + '</span></div>' +
      '</div>' +
      ((env.sensory||[]).length ? '<div class="env-sensory">Sensory details: ' + esc(env.sensory.join(' · ')) + '</div>' : '') +
      (env.tacticalNotes ? '<div class="env-tactical"><span class="env-label">Tactical:</span> ' + esc(env.tacticalNotes) + '</div>' : '') +
      (hazardHTML ? '<div class="env-hazards-head">Active Hazards</div>' + hazardHTML : '') +
    '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ENCOUNTER GROUP RENDERER (for act encounters)
  // ─────────────────────────────────────────────────────────────────────────

  function renderEncounterGroup(enc, partyLevel) {
    if (!enc || !enc.creatures || !enc.creatures.length) return '';
    var xpBadge = '<span class="enc-xp-badge ' + diffClass(enc.difficulty) + '">' +
                  esc(enc.difficulty) + ' · ' + esc(enc.totalXP) + ' XP</span>';
    var statBlocks = enc.creatures.map(function(c) {
      return '<div class="enc-creature">' +
        '<div class="enc-creature-header">' +
          '<span class="enc-creature-name">' + esc(c.name) + '</span>' +
          '<span class="enc-creature-role">' + esc(c.role || '') + '</span>' +
          '<span class="enc-creature-xp">+' + xpFor(c, partyLevel) + ' XP</span>' +
        '</div>' +
        renderStatBlock(c.statBlock, c.name) +
      '</div>';
    }).join('');

    return '<div class="encounter-group">' +
      '<div class="encounter-group-header">' +
        '<span class="enc-label">' + esc(enc.label || 'Encounter') + '</span>' +
        xpBadge +
      '</div>' +
      statBlocks +
    '</div>';
  }

  function diffClass(d) {
    var m = { Trivial:'diff-trivial', Low:'diff-low', Moderate:'diff-moderate', Severe:'diff-severe', Extreme:'diff-extreme' };
    return m[(d||'').trim()] || 'diff-moderate';
  }

  function xpFor(c, partyLevel) {
    var diff  = (c.level || 0) - (partyLevel || 1);
    var clamped = Math.max(-4, Math.min(4, diff));
    var table = { '-4':10,'-3':15,'-2':20,'-1':30,'0':40,'1':60,'2':80,'3':120,'4':160 };
    return table[clamped.toString()] || (diff < -4 ? 9 : 200);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BOSS BLOCK RENDERER
  // ─────────────────────────────────────────────────────────────────────────

  function renderBossBlock(boss, partyLevel) {
    if (!boss) return '';

    // Boss environment
    var bossEnvHTML = boss.environment ? renderEnvironment(boss.environment) : '';

    var sb = boss.statBlock;
    var sbHTML = sb ? renderStatBlock(sb, boss.name) : '';

    return '<div class="boss-encounter-block">' +
      '<div class="boss-enc-header">' +
        '<span class="boss-enc-crown">👑</span>' +
        '<span class="boss-enc-name">' + esc(boss.name) + '</span>' +
        '<span class="boss-enc-creature">' + esc(boss.creature) + '</span>' +
      '</div>' +
      '<div class="boss-enc-body">' +
        '<div class="boss-enc-row"><strong>Combat Setup:</strong> ' + esc(boss.setup) + '</div>' +
        '<div class="boss-enc-row"><strong>Phase 2 Trigger:</strong> ' + esc(boss.phase2) + '</div>' +
        '<div class="boss-enc-row"><strong>Environment Design:</strong> ' + esc(boss.env) + '</div>' +
        (boss.tactics ? '<div class="boss-enc-row"><strong>Tactics:</strong> ' + esc(boss.tactics) + '</div>' : '') +
        (boss.xp ? '<div class="boss-enc-row"><strong>XP Award:</strong> ' + esc(boss.xp) + ' XP (Severe difficulty)</div>' : '') +
      '</div>' +
      (bossEnvHTML ? '<div class="boss-enc-env">' + bossEnvHTML + '</div>' : '') +
      (sbHTML ? '<div class="boss-enc-statblock"><div class="act-subhead">Boss Stat Block</div>' + sbHTML + '</div>' : '') +
    '</div>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SIDE QUEST FULL RENDERER (card + encounter + stat blocks)
  // ─────────────────────────────────────────────────────────────────────────

  function renderSideQuestFull(sq, partyLevel) {
    var envHTML = sq.environment ? renderEnvironment(sq.environment) : '';
    var encHTML = sq.encounter   ? renderEncounterGroup(sq.encounter, partyLevel) : '';

    return '<div class="sq-card-full">' +
      '<div class="sq-header-full">' +
        '<div class="sq-title">' + esc(sq.title) + '</div>' +
        '<div class="sq-meta">' +
          '<span class="sq-tag type">' + esc(sq.type) + '</span>' +
          '<span class="sq-tag level">Lvl ' + esc(sq.level) + '</span>' +
          (sq.optional ? '<span class="sq-tag">Optional</span>' : '') +
        '</div>' +
      '</div>' +
      '<p class="text-sm">' + esc(sq.desc) + '</p>' +
      '<p class="text-sm mt-sm"><strong>Check DC:</strong> ' + esc(sq.dc) +
        ' · <strong>Reward:</strong> ' + esc(sq.reward) + '</p>' +
      (envHTML ? '<div class="sq-env">' + subhead('Quest Environment') + envHTML + '</div>' : '') +
      (encHTML ? '<div class="sq-enc">' + subhead('Quest Encounter') + encHTML + '</div>' : '') +
    '</div>';
  }


  // ─────────────────────────────────────────────────────────────────────────
  // SOCIAL INTERACTIONS RENDERER  — Build 6
  // ─────────────────────────────────────────────────────────────────────────

  function renderSocialEncounters(c) {
    if (!c.acts) return '';
    // Gather all social data from acts
    var allSocial = [];
    c.acts.forEach(function(act) {
      if (act.socialEncounters) allSocial.push({ act: act, social: act.socialEncounters });
    });
    if (!allSocial.length) return '';

    var actCards = allSocial.map(function(item) {
      var act = item.act, social = item.social;
      var scenes = (social.scenes || []).map(function(scene) {
        return scene.type === 'SkillChallenge'
          ? renderSkillChallenge(scene, act)
          : renderInfluenceScene(scene, act);
      }).join('');
      var rep = social.reputationSnapshot ? renderReputationSnapshot(social.reputationSnapshot) : '';
      return '<div class="soc-act-block">' +
        '<div class="soc-act-header">' +
          '<span class="soc-act-num">ACT ' + act.number + '</span>' +
          '<span class="soc-act-title">' + esc(act.title) + '</span>' +
          '<span class="soc-act-levels">Lvl ' + act.levelStart + '–' + act.levelEnd + '</span>' +
        '</div>' +
        scenes + rep +
      '</div>';
    }).join('');

    var rulesSummary = renderSocialRules();

    return section('🗣', 'Social Interactions &amp; Influence',
      '<p class="text-sm text-muted" style="margin-bottom:1rem;">Each act contains at least one Influence encounter (PF2e attitude track) and one Skill Challenge. Use NPC personality matrices to set DCs and guide roleplay.</p>' +
      rulesSummary +
      actCards
    );
  }

  function renderInfluenceScene(scene, act) {
    var matrix = scene.npcMatrix || {};
    // Skill checks table
    var checkRows = (scene.checks || []).map(function(chk) {
      var rules = chk.rules || {};
      return '<tr>' +
        '<td class="soc-skill">' + esc(chk.skill) + '</td>' +
        '<td class="soc-dc"><strong>DC ' + esc(chk.dc) + '</strong></td>' +
        '<td class="soc-purpose">' + esc(chk.purpose) + '</td>' +
        '<td class="soc-outcome">' +
          (rules.critSuccess ? '<span class="soc-crit-s">✦ ' + esc(rules.critSuccess) + '</span>' : '') +
        '</td>' +
      '</tr>';
    }).join('');

    // Attitude track visual
    var track    = ['Hostile','Unfriendly','Indifferent','Friendly','Helpful'];
    var startIdx = track.indexOf(scene.startAttitude);
    var targIdx  = track.indexOf(scene.targetAttitude);
    var trackHTML = track.map(function(t, i) {
      var cls = i < startIdx ? 'att-below' : i === startIdx ? 'att-start' : i <= targIdx ? 'att-range' : 'att-above';
      return '<span class="att-pip ' + cls + '">' + t + '</span>';
    }).join('<span class="att-arrow">→</span>');

    return '<div class="soc-scene">' +
      '<div class="soc-scene-header">' +
        '<span class="soc-scene-type-badge soc-type-influence">Influence</span>' +
        '<span class="soc-scene-name">' + esc(scene.templateName) + '</span>' +
      '</div>' +
      '<div class="soc-scene-body">' +
        // NPC block
        '<div class="soc-npc-row">' +
          '<div class="soc-npc-info">' +
            (scene.npc ? '<span class="soc-npc-name">' + esc(scene.npc.name) + '</span>' +
              '<span class="soc-npc-role"> — ' + esc(scene.npc.role) + '</span>' : '') +
          '</div>' +
          '<div class="soc-att-track">' + trackHTML + '</div>' +
        '</div>' +

        // Structure / terrain
        '<div class="soc-row"><span class="soc-label">Structure:</span> ' + esc(scene.structure) + '</div>' +
        '<div class="soc-row"><span class="soc-label">Setting:</span> ' + esc(scene.terrain) + '</div>' +
        '<div class="soc-row"><span class="soc-label">Stakes:</span> ' + esc(scene.stakes) + '</div>' +
        '<div class="soc-row soc-complication"><span class="soc-label">⚡ Complication:</span> ' + esc(scene.complication) + '</div>' +
        '<div class="soc-row soc-villain-tie"><span class="soc-label">🦹 Villain Tie:</span> ' + esc(scene.villainTie) + '</div>' +

        // NPC personality matrix
        (matrix.archetype ? '<div class="soc-matrix">' +
          '<div class="soc-matrix-head">' + esc(matrix.archetype) + ' — Personality Matrix</div>' +
          '<div class="soc-matrix-row"><span class="soc-label">✅ Weak Points:</span> ' + esc((matrix.weakPoints||[]).join('; ')) + '</div>' +
          '<div class="soc-matrix-row"><span class="soc-label">❌ Resistances:</span> ' + esc((matrix.resistances||[]).join('; ')) + '</div>' +
          '<div class="soc-matrix-row"><span class="soc-label">Preferred Approach:</span> ' + esc(matrix.preferred) + '</div>' +
          '<div class="soc-matrix-row soc-secret"><span class="soc-label">🔒 Secret:</span> ' + esc(matrix.secret) + '</div>' +
        '</div>' : '') +

        // Dialogue hooks
        '<div class="soc-dialogue-block">' +
          '<div class="soc-dialogue-head">Dialogue Hooks</div>' +
          '<div class="soc-line soc-open"><span class="soc-line-label">Opening:</span> ' + esc(scene.openingLine) + '</div>' +
          '<div class="soc-line soc-cond"><span class="soc-line-label">Condition:</span> ' + esc(scene.conditionLine) + '</div>' +
          '<div class="soc-line soc-refusal"><span class="soc-line-label">Refusal:</span> ' + esc(scene.refusalLine) + '</div>' +
          '<div class="soc-line soc-reveal"><span class="soc-line-label">Reveal:</span> ' + esc(scene.revealLine) + '</div>' +
        '</div>' +

        // Skill checks
        (checkRows ? '<div class="soc-checks-head">Skill Checks</div>' +
          '<table class="soc-checks-table"><thead><tr><th>Skill</th><th>DC</th><th>Purpose</th><th>Critical Success</th></tr></thead>' +
          '<tbody>' + checkRows + '</tbody></table>' : '') +
      '</div>' +
    '</div>';
  }

  function renderSkillChallenge(scene, act) {
    var skillPips = (scene.skills || []).map(function(s) {
      return '<span class="sc-skill-pip">' + esc(s.skill) + ' DC ' + esc(s.dc) + '</span>';
    }).join('');

    return '<div class="soc-scene soc-challenge">' +
      '<div class="soc-scene-header">' +
        '<span class="soc-scene-type-badge soc-type-challenge">Skill Challenge</span>' +
        '<span class="soc-scene-name">' + esc(scene.name) + '</span>' +
      '</div>' +
      '<div class="soc-scene-body">' +
        '<div class="soc-row">' + esc(scene.context) + '</div>' +
        '<div class="sc-progress">' +
          '<span class="sc-prog-item sc-success">✓ Need <strong>' + esc(scene.successes) + '</strong> successes</span>' +
          '<span class="sc-prog-item sc-fail">✗ Fail at <strong>' + esc(scene.failures) + '</strong> failures</span>' +
          '<span class="sc-prog-item sc-rounds">⏱ <strong>' + esc(scene.rounds) + '</strong> rounds</span>' +
        '</div>' +
        '<div class="soc-row"><span class="soc-label">Skills:</span><br>' + skillPips + '</div>' +
        '<div class="soc-row"><span class="soc-label">✅ Success:</span> ' + esc(scene.stakes && scene.stakes.success) + '</div>' +
        '<div class="soc-row"><span class="soc-label">❌ Failure:</span> ' + esc(scene.stakes && scene.stakes.failure) + '</div>' +
        (scene.stakes && scene.stakes.critSuccess ? '<div class="soc-row"><span class="soc-label">✦ Critical Success:</span> ' + esc(scene.stakes.critSuccess) + '</div>' : '') +
        '<div class="soc-row soc-complication"><span class="soc-label">⚡ Complication:</span> ' + esc(scene.complication) + '</div>' +
        (scene.actTie ? '<div class="soc-row soc-act-tie"><span class="soc-label">Act Tie:</span> ' + esc(scene.actTie) + '</div>' : '') +
      '</div>' +
    '</div>';
  }

  function renderReputationSnapshot(rep) {
    if (!rep) return '';
    var gainItems = (rep.potentialGains || []).map(function(g) {
      return '<li class="rep-gain">+' + g.points + ' — ' + esc(g.event) + '</li>';
    }).join('');
    var lossItems = (rep.potentialLoss || []).map(function(l) {
      return '<li class="rep-loss">' + l.points + ' — ' + esc(l.event) + '</li>';
    }).join('');
    return '<div class="soc-rep-block">' +
      '<div class="soc-rep-head">📊 Reputation — This Act</div>' +
      '<div class="soc-rep-note">' + esc(rep.note) + '</div>' +
      '<div class="soc-rep-grid">' +
        '<div>' +
          '<div class="soc-rep-col-head gain">Potential Gains</div>' +
          '<ul class="rep-list">' + gainItems + '</ul>' +
        '</div>' +
        '<div>' +
          '<div class="soc-rep-col-head loss">Potential Losses</div>' +
          '<ul class="rep-list">' + lossItems + '</ul>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function renderSocialRules() {
    var tiers = typeof SOCIAL_DATA !== 'undefined' && SOCIAL_DATA.reputationTiers ? SOCIAL_DATA.reputationTiers : [];
    var tierHTML = tiers.map(function(t) {
      return '<div class="rep-tier"><span class="rep-tier-name">' + esc(t.tier) + '</span>' +
        '<span class="rep-tier-pts">' + (t.threshold >= 0 ? '+' : '') + t.threshold + ' pts</span>' +
        '<span class="rep-tier-effect">' + esc(t.effect) + '</span></div>';
    }).join('');

    return '<details class="soc-rules-summary">' +
      '<summary class="soc-rules-toggle">📋 PF2e Social Rules Quick Reference</summary>' +
      '<div class="soc-rules-body">' +
        '<div class="soc-rules-grid">' +
          '<div class="soc-rules-col">' +
            '<div class="soc-rules-head">Attitude Track</div>' +
            '<div class="soc-att-full">Hostile → Unfriendly → Indifferent → Friendly → Helpful</div>' +
            '<p class="text-sm">Diplomacy: Make an Impression shifts attitude 1 step (2 on crit success). ' +
            'Attitude worsens on crit failure. Can attempt again after 1 hour.</p>' +
            '<p class="text-sm">Intimidation (Coerce): Forces cooperation for 1 week. Attitude becomes Unfriendly afterward unless crit success.</p>' +
          '</div>' +
          '<div class="soc-rules-col">' +
            '<div class="soc-rules-head">Reputation Tiers</div>' +
            tierHTML +
          '</div>' +
        '</div>' +
      '</div>' +
    '</details>';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CORE SECTION RENDERERS (carried forward + improved)
  // ─────────────────────────────────────────────────────────────────────────

  function renderTitle(c) {
    return '<div class="campaign-title-block">' +
      '<h1 class="c-title">' + esc(c.base.name) + '</h1>' +
      '<p class="c-tagline">' + esc(c.base.tagline) + '</p>' +
      '<div class="c-meta">' +
        '<div class="c-meta-item"><span class="meta-label">Source:</span> ' + esc(c.base.source) + ' <span class="source-badge">' + esc(c.base.id) + '</span></div>' +
        '<div class="c-meta-item"><span class="meta-label">Levels:</span> ' + c.config.startLevel + '–' + c.config.endLevel + '</div>' +
        '<div class="c-meta-item"><span class="meta-label">Players:</span> ' + c.config.players + '</div>' +
        '<div class="c-meta-item"><span class="meta-label">Acts:</span> ' + c.config.acts + '</div>' +
        '<div class="c-meta-item"><span class="meta-label">System:</span> ' + esc(c.pf2eVersion) + '</div>' +
      '</div>' +
    '</div>';
  }

  function renderSynopsis(c) {
    return section('📜','Campaign Synopsis','<p>' + esc(c.base.synopsis) + '</p>');
  }

  function renderHook(c) {
    if (!c.hook) return '';
    return section('🎣','Adventure Hook',
      '<p class="italic">"' + esc(c.hook) + '"</p>' +
      '<p class="text-sm text-muted mt-sm">Adapt this hook to draw all party members in from different starting contexts.</p>');
  }

  function renderVillain(c) {
    var v = c.villain;
    return section('👁','The Antagonist',
      '<div class="villain-block">' +
        '<div class="villain-name">' + esc(v.name) + '</div>' +
        '<div class="villain-title">' + esc(v.title) + '</div>' +
        '<div class="villain-stats">' +
          '<div class="vstat"><span class="vstat-label">Creature Type</span><span class="vstat-value">' + esc(v.race) + '</span></div>' +
          '<div class="vstat"><span class="vstat-label">Challenge</span><span class="vstat-value">CR ' + esc(v.cr || 'See Campaign Level') + '</span></div>' +
          '<div class="vstat"><span class="vstat-label">Ethics</span><span class="vstat-value">' + esc(v.alignment) + '</span></div>' +
        '</div>' +
        '<p><strong>Motivation:</strong> ' + esc(v.motivation) + '</p>' +
        '<p class="mt-sm"><strong>Combat Tactics:</strong> ' + esc(v.tactics) + '</p>' +
        '<p class="mt-sm"><strong>Exploitable Weakness:</strong> ' + esc(v.weakness) + '</p>' +
        '<p class="mt-sm"><strong>Act 3 Revelation:</strong> <em>' + esc(v.secretReveal) + '</em></p>' +
      '</div>');
  }

  function renderFactions(c) {
    var colors = { 'Ally':'#2a6040','Villain':'#5a1010','Villain (secondary)':'#8b3030','Wildcard':'#4a3a10','Employer/Ally':'#1a3060','Ally/Wildcard':'#2a4020','Ally (conditional)':'#1a4a30','Situational Ally':'#3a3a20','Antagonist (initially)':'#3a2010' };
    var cards = c.factions.map(function(f) {
      var bg = colors[f.role] || '#2a2420';
      return '<div class="faction-card">' +
        '<div class="faction-header" style="background:' + bg + ';color:#e8b84b;">' + esc(f.name) + '</div>' +
        '<div class="faction-body"><div class="faction-alignment">' + esc(f.alignment) + ' · ' + esc(f.role) + '</div>' +
        '<p class="text-sm mt-sm">' + esc(f.desc) + '</p></div>' +
      '</div>';
    }).join('');
    return section('⚖','Factions &amp; Power Groups','<div class="faction-grid">' + cards + '</div>');
  }

  function renderNPCs(c) {
    if (!c.npcs || !c.npcs.length) return '';
    var cards = c.npcs.map(function(n) {
      return '<div class="npc-card">' +
        '<div class="npc-name">' + esc(n.name) + '</div>' +
        '<div class="npc-role">' + esc(n.role) + '</div>' +
        '<p class="text-sm">' + esc(n.desc) + '</p>' +
        '<p class="text-sm text-muted mt-sm"><em>Personality:</em> ' + esc(n.personality) + '</p>' +
      '</div>';
    }).join('');
    return section('👥','Key NPCs','<div class="npc-grid">' + cards + '</div>');
  }

  function renderLocations(c) {
    var labels = ['Starting Region','Act 1 Hub','Midpoint Nexus','Penultimate Location','Final Dungeon'];
    var items = c.locations.map(function(loc, i) {
      return '<li><strong>' + (labels[i] || 'Location '+(i+1)) + ':</strong> ' + esc(loc) + '</li>';
    }).join('');
    return section('🗺','Key Locations',
      '<ul class="encounter-list">' + items + '</ul>' +
      '<p class="text-sm text-muted mt-sm">Each location should contain at least 3 distinct sub-areas. See GM Core for environment-building guidelines.</p>');
  }

  function renderTwists(c) {
    if (!c.twists || !c.twists.length) return '';
    var items = c.twists.map(function(t) {
      return '<li><strong>' + esc(t.timing) + ':</strong> ' + esc(t.twist) + '</li>';
    }).join('');
    return section('🌀','Major Plot Twists','<ul class="twist-list">' + items + '</ul>');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ACTS — the big one
  // ─────────────────────────────────────────────────────────────────────────

  function renderActs(c) {
    var actHTML = c.acts.map(function(act) {
      var partyLevel = Math.round((act.levelStart + act.levelEnd) / 2);

      // Milestones
      var mileList = act.milestones.map(function(m) { return '<li>' + esc(m) + '</li>'; }).join('');

      // Narrative encounter types
      var encList = act.encounters.map(function(e) {
        return '<li><strong>' + esc(e.type) + ':</strong> ' + esc(e.desc) + '</li>';
      }).join('');

      // Environment
      var envHTML = act.environment ? renderEnvironment(act.environment) : '';

      // Full generated encounters (act encounters)
      var fullEncHTML = '';
      if (act.actEncounters && act.actEncounters.length) {
        fullEncHTML = act.actEncounters.map(function(enc) {
          return renderEncounterGroup(enc, partyLevel);
        }).join('');
      }

      // Boss
      var bossHTML = act.boss ? renderBossBlock(act.boss, partyLevel) : '';

      // Twist
      var twistHTML = act.twist
        ? subhead('Plot Twist — ' + esc(act.twist.timing)) +
          '<ul class="twist-list"><li><strong>Revelation:</strong> ' + esc(act.twist.twist) + '</li></ul>'
        : '';

      // Side quests — full render with encounters
      var sqHTML = act.sideQuests.map(function(sq) {
        return renderSideQuestFull(sq, partyLevel);
      }).join('');

      return '<div class="act-card">' +
        '<div class="act-header">' +
          '<span class="act-number">ACT ' + act.number + '</span>' +
          '<span class="act-title">' + esc(act.title) + '</span>' +
          '<span class="act-levels">Levels ' + act.levelStart + '–' + act.levelEnd + '</span>' +
        '</div>' +
        '<p class="act-summary">' + esc(act.summary) + '</p>' +
        '<p class="text-sm"><strong>Primary Location:</strong> ' + esc(act.location) + '</p>' +

        subhead('Act Environment') + envHTML +

        subhead('Story Milestones') +
        '<ul class="milestone-list">' + mileList + '</ul>' +

        subhead('Encounter Narrative Types') +
        '<ul class="encounter-list">' + encList + '</ul>' +

        subhead('Generated Encounters (Full Stat Blocks)') +
        '<div class="act-encounters-block">' + fullEncHTML + '</div>' +

        (act.boss ? subhead('Act Boss Encounter') + bossHTML : '') +
        twistHTML +
        subhead('Side Quests') +
        '<div class="sq-full-grid">' + sqHTML + '</div>' +
      '</div>';
    }).join('');

    return section('📖','Acts &amp; Adventure Structure', actHTML);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REWARDS
  // ─────────────────────────────────────────────────────────────────────────

  function renderRewards(c) {
    if (!c.rewards) return '';
    var rows = c.rewards.map(function(r) {
      return '<tr><td><strong>Act ' + r.act + '</strong></td><td>' + esc(r.items[0]||'—') + '</td><td>' + esc(r.items[1]||'—') + '</td></tr>';
    }).join('');
    return section('💎','Treasure &amp; Rewards',
      '<table class="reward-table"><thead><tr><th>Act</th><th>Primary Reward</th><th>Secondary Reward</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p class="text-sm text-muted mt-sm">All rewards are guidelines. Adjust to PF2e Item Level recommendations. Consult the Treasure by Level table in GM Core.</p>');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PF2E NOTES
  // ─────────────────────────────────────────────────────────────────────────

  function renderPF2eNotes(c) {
    var notes   = COMPONENTS.pf2eNotes;
    var players = c.config.players;
    var adj     = (players - 4) * 10;
    var adjStr  = adj !== 0 ? ' (' + (adj>0?'+':'') + adj + ' XP adjusted)' : '';
    var keyItems = notes.keyChanges.map(function(n){ return '<li>' + esc(n) + '</li>'; }).join('');
    var budget   = notes.encounterBudget;

    return section('⚙','PF2e Remaster Notes',
      '<p><strong>Ruleset:</strong> ' + esc(notes.version) + '</p>' +
      subhead('Encounter Budget for ' + players + ' Players' + adjStr) +
      '<ul class="encounter-list">' +
        '<li><strong>Trivial:</strong> ' + (40+adj) + ' XP — ' + esc(budget.trivial) + '</li>' +
        '<li><strong>Low:</strong> '     + (60+adj) + ' XP — ' + esc(budget.low) + '</li>' +
        '<li><strong>Moderate:</strong> '+ (80+adj) + ' XP — ' + esc(budget.moderate) + '</li>' +
        '<li><strong>Severe:</strong> '  + (120+adj)+ ' XP — ' + esc(budget.severe) + '</li>' +
        '<li><strong>Extreme:</strong> ' + (160+adj)+ ' XP — ' + esc(budget.extreme) + '</li>' +
      '</ul>' +
      subhead('Remaster Key Changes') +
      '<ul class="encounter-list">' + keyItems + '</ul>' +
      '<p class="text-sm text-muted mt-sm">' + esc(notes.levelingNote) + '</p>');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────────────────

  function render(c) {
    var html = '<div class="campaign-doc" id="campaignDoc">' +
      renderTitle(c) +
      renderSynopsis(c) +
      renderHook(c) +
      renderVillain(c) +
      renderFactions(c) +
      renderNPCs(c) +
      renderLocations(c) +
      renderTwists(c) +
      renderSocialEncounters(c) +
      renderActs(c) +
      renderRewards(c) +
      renderPF2eNotes(c) +
      '<p class="text-sm text-muted" style="text-align:center;margin-top:3rem;border-top:1px solid var(--parchment);padding-top:1rem;">' +
        'Generated ' + new Date(c.generated).toLocaleString() + ' · Campaign Forge · PF2e Remaster Compatible' +
      '</p>' +
    '</div>';

    document.getElementById('campaignOutput').innerHTML = html;
    document.getElementById('outputPanel').style.display  = 'block';
    document.getElementById('configPanel').style.display  = 'none';

    if (typeof UI !== 'undefined' && UI.onForgeComplete) UI.onForgeComplete(c);
    setTimeout(function() {
      document.getElementById('outputPanel').scrollIntoView({ behavior:'smooth', block:'start' });
    }, 100);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MARKDOWN EXPORT (updated)
  // ─────────────────────────────────────────────────────────────────────────

  function toMarkdown(c) {
    var lines = [];
    lines.push('# ' + c.base.name);
    lines.push('> ' + c.base.tagline + '\n');
    lines.push('**Source:** ' + c.base.source + ' | **Levels:** ' + c.config.startLevel + '–' + c.config.endLevel + ' | **Players:** ' + c.config.players + ' | **Acts:** ' + c.config.acts);
    lines.push('\n## Synopsis\n' + c.base.synopsis);
    if (c.hook) lines.push('\n## Adventure Hook\n> ' + c.hook);
    lines.push('\n## The Antagonist\n**' + c.villain.name + '** — ' + c.villain.title);
    lines.push('- **Type:** ' + c.villain.race + '\n- **Motivation:** ' + c.villain.motivation + '\n- **Tactics:** ' + c.villain.tactics + '\n- **Weakness:** ' + c.villain.weakness + '\n- **Secret:** ' + c.villain.secretReveal);
    lines.push('\n## Factions');
    c.factions.forEach(function(f) { lines.push('- **' + f.name + '** (' + f.role + '): ' + f.desc); });
    c.acts.forEach(function(a) {
      lines.push('\n## Act ' + a.number + ': ' + a.title + ' (Levels ' + a.levelStart + '–' + a.levelEnd + ')');
      lines.push(a.summary);
      lines.push('\n**Location:** ' + a.location);
      if (a.environment) {
        lines.push('\n**Environment:** ' + (a.environment.terrain||[]).join(', ') + ' | ' + a.environment.lighting + ' | ' + a.environment.weather);
        (a.environment.hazards||[]).forEach(function(h){ lines.push('- Hazard: **' + h.name + '** (DC ' + h.dc + '): ' + h.desc); });
      }
      lines.push('\n**Milestones:**\n' + a.milestones.map(function(m){ return '- ' + m; }).join('\n'));
      if (a.actEncounters && a.actEncounters.length) {
        lines.push('\n**Generated Encounters:**');
        a.actEncounters.forEach(function(enc) {
          lines.push('- **' + enc.label + '** [' + enc.difficulty + ', ' + enc.totalXP + ' XP]: ' +
            (enc.creatures||[]).map(function(cr){ return cr.name + ' (Lvl ' + cr.level + ')'; }).join(', '));
        });
      }
      if (a.boss) {
        lines.push('\n**Boss Encounter:** ' + a.boss.name + ' (' + a.boss.creature + ')');
        lines.push('- Setup: ' + a.boss.setup);
        lines.push('- Phase 2: ' + a.boss.phase2);
        if (a.boss.statBlock && a.boss.statBlock.phase2) {
          var p2 = a.boss.statBlock.phase2;
          lines.push('- Phase 2 Trigger: ' + p2.trigger);
          (p2.changes||[]).forEach(function(ch){ lines.push('  → ' + ch); });
        }
      }
      if (a.sideQuests && a.sideQuests.length) {
        lines.push('\n**Side Quests:**');
        a.sideQuests.forEach(function(sq) {
          lines.push('- **' + sq.title + '** [' + sq.type + '] Lvl ' + sq.level + ': ' + sq.desc);
          if (sq.encounter && sq.encounter.creatures) {
            lines.push('  Encounter: ' + (sq.encounter.creatures||[]).map(function(cr){ return cr.name; }).join(', ') + ' [' + sq.encounter.difficulty + ']');
          }
        });
      }
    });
    return lines.join('\n');
  }

  return { render: render, toMarkdown: toMarkdown };
})();
