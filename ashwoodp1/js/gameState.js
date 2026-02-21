// ============================================================
//  THE ASHWOOD INHERITANCE - Game State Manager
//  Tracks all player progress, flags, inventory, and choices
// ============================================================

class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    // Clues collected
    this.clues = new Set();

    // Flags (story progression)
    this.flags = { ...STORY.flags };

    // Dialogue nodes seen (prevent repetition)
    this.seenDialogue = new Set();

    // Current act
    this.currentAct = 1;

    // Current location
    this.currentLocation = "manor_exterior";

    // Player notes (collected narrative text)
    this.notes = [];

    // Conversation history per character
    this.conversationHistory = {};

    // Choices made
    this.choices = {};

    // Time elapsed (in-game hours, for atmosphere)
    this.timeElapsed = 0;

    // Evidence board (weighted clues for ending calculation)
    this.evidenceWeight = 0;

    // Save timestamp
    this.savedAt = null;
  }

  // ============================================================
  //  CLUE MANAGEMENT
  // ============================================================
  addClue(clueId) {
    if (!this.clues.has(clueId)) {
      this.clues.add(clueId);

      const clue = STORY.clues[clueId];
      if (clue) {
        // Set corresponding flag
        const flagName = `found_${clueId}`;
        if (this.flags.hasOwnProperty(flagName)) {
          this.flags[flagName] = true;
        }

        // Add to evidence weight
        const weightMap = { critical: 3, significant: 2, minor: 1, revelatory: 2, atmospheric: 0, key_item: 0 };
        this.evidenceWeight += weightMap[clue.weight] || 0;

        // Add note
        this.addNote(`CLUE FOUND: ${clue.name}`, clue.description);

        return true;
      }
    }
    return false;
  }

  hasClue(clueId) {
    return this.clues.has(clueId);
  }

  getClueList() {
    return Array.from(this.clues).map(id => STORY.clues[id]).filter(Boolean);
  }

  // ============================================================
  //  FLAG MANAGEMENT
  // ============================================================
  setFlag(flagName, value = true) {
    this.flags[flagName] = value;
  }

  getFlag(flagName) {
    return this.flags[flagName] || false;
  }

  // ============================================================
  //  DIALOGUE TRACKING
  // ============================================================
  markDialogueSeen(nodeId) {
    this.seenDialogue.add(nodeId);
  }

  hasSeenDialogue(nodeId) {
    return this.seenDialogue.has(nodeId);
  }

  getAvailableDialogue(characterId) {
    const charDialogue = DIALOGUE[characterId];
    if (!charDialogue) return null;

    // Return first appropriate node based on current state
    // Priority: unseen nodes first, then repeatable nodes
    for (const [key, node] of Object.entries(charDialogue)) {
      if (this.checkCondition(node.condition)) {
        return node;
      }
    }
    return null;
  }

  // ============================================================
  //  CONDITION CHECKING
  // ============================================================
  checkCondition(condition) {
    if (!condition) return true;

    // Simple condition parser
    // Supports: "flagName", "NOT flagName", "flagA AND flagB", "flagA OR flagB"
    if (condition.startsWith("NOT ")) {
      return !this.flags[condition.slice(4)];
    }
    if (condition.includes(" AND ")) {
      return condition.split(" AND ").every(c => this.checkCondition(c.trim()));
    }
    if (condition.includes(" OR ")) {
      return condition.split(" OR ").some(c => this.checkCondition(c.trim()));
    }

    // Check both flags and clues
    return this.flags[condition] || this.clues.has(condition) || false;
  }

  // ============================================================
  //  NOTES / JOURNAL
  // ============================================================
  addNote(title, content) {
    this.notes.push({
      title,
      content,
      timestamp: this.timeElapsed,
      act: this.currentAct
    });
  }

  // ============================================================
  //  ACT PROGRESSION
  // ============================================================
  advanceAct() {
    if (this.currentAct < 5) {
      this.currentAct++;
      this.flags.act_current = this.currentAct;
      return this.currentAct;
    }
    return this.currentAct;
  }

  checkActCompletion() {
    const act = STORY.acts[`act${this.currentAct}`];
    if (!act || !act.endCondition) return false;
    return this.checkCondition(act.endCondition);
  }

  // ============================================================
  //  ENDING DETERMINATION
  // ============================================================
  determineEnding() {
    const notes = STORY.systemNotes;

    // Priority order: special conditions first
    if (this.flags.bribe_accepted) {
      return "ending_coverup";
    }

    if (this.evidenceWeight < 8 && this.flags.nathaniel_confronted) {
      return "ending_incomplete";
    }

    if (this.flags.path_chosen === "understanding" &&
        this.flags.declan_visited &&
        this.hasClue("jonas_letter_1972")) {
      return "ending_understanding";
    }

    if (this.flags.path_chosen === "family" &&
        this.flags.sylvie_trust_gained) {
      return "ending_family";
    }

    if (this.flags.path_chosen === "honor") {
      return "ending_honor";
    }

    // Default good ending
    return "ending_justice";
  }

  // ============================================================
  //  LOCATION MANAGEMENT
  // ============================================================
  moveTo(locationId) {
    const location = STORY.locations[locationId];
    if (!location) return false;

    if (location.locked && !this.checkCondition(location.unlockCondition)) {
      return { success: false, reason: "locked", location };
    }

    this.currentLocation = locationId;
    this.timeElapsed += 0.5; // 30 min per location visit
    return { success: true, location };
  }

  getCurrentLocation() {
    return STORY.locations[this.currentLocation];
  }

  // ============================================================
  //  SAVE / LOAD
  // ============================================================
  serialize() {
    return JSON.stringify({
      clues: Array.from(this.clues),
      flags: this.flags,
      seenDialogue: Array.from(this.seenDialogue),
      currentAct: this.currentAct,
      currentLocation: this.currentLocation,
      notes: this.notes,
      choices: this.choices,
      timeElapsed: this.timeElapsed,
      evidenceWeight: this.evidenceWeight,
      savedAt: new Date().toISOString()
    });
  }

  deserialize(json) {
    try {
      const data = JSON.parse(json);
      this.clues = new Set(data.clues || []);
      this.flags = { ...STORY.flags, ...(data.flags || {}) };
      this.seenDialogue = new Set(data.seenDialogue || []);
      this.currentAct = data.currentAct || 1;
      this.currentLocation = data.currentLocation || "manor_exterior";
      this.notes = data.notes || [];
      this.choices = data.choices || {};
      this.timeElapsed = data.timeElapsed || 0;
      this.evidenceWeight = data.evidenceWeight || 0;
      this.savedAt = data.savedAt;
      return true;
    } catch (e) {
      console.error("Failed to load save:", e);
      return false;
    }
  }

  // ============================================================
  //  STATS / SUMMARY
  // ============================================================
  getSummary() {
    const criticalClues = ["toxicology_results", "pharmacy_receipt", "sylvie_camera_photos", "nathaniel_confession"];
    const criticalFound = criticalClues.filter(c => this.hasClue(c)).length;

    return {
      act: this.currentAct,
      cluesFound: this.clues.size,
      evidenceWeight: this.evidenceWeight,
      criticalCluesFound: criticalFound,
      criticalCluesTotal: criticalClues.length,
      timeElapsed: this.timeElapsed,
      charactersMet: [
        this.flags.met_dorothea,
        this.flags.met_nathaniel,
        this.flags.met_sylvie,
        this.flags.met_hester,
        this.flags.met_crane
      ].filter(Boolean).length,
      pathChosen: this.flags.path_chosen,
      projectedEnding: this.determineEnding()
    };
  }
}

// Global instance
const gameState = new GameState();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GameState, gameState };
}
