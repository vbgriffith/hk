/* ══════════════════════════════════════════════════════════════════
   PF2e Campaign Runner — State Management
   Handles campaign data, localStorage persistence, and runtime state
══════════════════════════════════════════════════════════════════ */
var RunnerState = (function() {
  var _campaign = null;
  var _runState = {
    factionRep: {},        // factionName -> rep number (-5 to +5)
    factionNotes: {},      // factionName -> string
    npcStatus: {},         // npcName -> 'ally'|'hostile'|'dead'|'unknown'
    npcNotes: {},          // npcName -> string
    milestones: {},        // 'actNum-milestoneIdx' -> bool
    lootClaimed: {},       // 'actNum-type-idx' -> bool
    sessions: [],          // array of session objects
    currentSession: null,  // current in-progress session
    globalNotes: '',
    villainNotes: '',
    actProgress: {},       // actNum -> 'not-started'|'in-progress'|'complete'
  };
  var STORAGE_KEY = 'pf2e_runner_state';
  var CAMPAIGN_KEY = 'pf2e_runner_campaign';

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_runState));
      if (_campaign) localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(_campaign));
    } catch(e) { console.warn('State save failed:', e); }
  }

  function load() {
    try {
      var s = localStorage.getItem(STORAGE_KEY);
      if (s) { var parsed = JSON.parse(s); Object.assign(_runState, parsed); }
      var c = localStorage.getItem(CAMPAIGN_KEY);
      if (c) { _campaign = JSON.parse(c); return true; }
    } catch(e) { console.warn('State load failed:', e); }
    return false;
  }

  function setCampaign(c) {
    _campaign = c;
    // Initialize faction reps from campaign
    if (c.factions) {
      c.factions.forEach(function(f) {
        if (_runState.factionRep[f.name] === undefined) {
          _runState.factionRep[f.name] = 0;
        }
      });
    }
    save();
  }

  function getCampaign() { return _campaign; }
  function getRunState() { return _runState; }

  function setFactionRep(name, val) {
    _runState.factionRep[name] = Math.max(-5, Math.min(5, val));
    save();
  }
  function setFactionNotes(name, text) { _runState.factionNotes[name] = text; save(); }
  function setNpcStatus(name, status) { _runState.npcStatus[name] = status; save(); }
  function setNpcNotes(name, text) { _runState.npcNotes[name] = text; save(); }
  function setMilestone(key, val) { _runState.milestones[key] = val; save(); }
  function setLootClaimed(key, val) { _runState.lootClaimed[key] = val; save(); }
  function setGlobalNotes(text) { _runState.globalNotes = text; save(); }
  function setVillainNotes(text) { _runState.villainNotes = text; save(); }
  function setActProgress(actNum, status) { _runState.actProgress[actNum] = status; save(); }

  function saveSession(session) {
    var idx = _runState.sessions.findIndex(function(s) { return s.id === session.id; });
    if (idx >= 0) { _runState.sessions[idx] = session; }
    else { _runState.sessions.push(session); }
    save();
  }

  function clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CAMPAIGN_KEY);
    } catch(e) {}
    _campaign = null;
    _runState = { factionRep:{}, factionNotes:{}, npcStatus:{}, npcNotes:{},
      milestones:{}, lootClaimed:{}, sessions:[], currentSession:null,
      globalNotes:'', villainNotes:'', actProgress:{} };
  }

  return {
    load: load, save: save, setCampaign: setCampaign, getCampaign: getCampaign,
    getRunState: getRunState,
    setFactionRep: setFactionRep, setFactionNotes: setFactionNotes,
    setNpcStatus: setNpcStatus, setNpcNotes: setNpcNotes,
    setMilestone: setMilestone, setLootClaimed: setLootClaimed,
    setGlobalNotes: setGlobalNotes, setVillainNotes: setVillainNotes,
    setActProgress: setActProgress, saveSession: saveSession,
    clearAll: clearAll
  };
})();
