// ════════════════════════════════════════════════════════════
//  THE ASHWOOD INHERITANCE — Dialogue Engine (Phase 2)
//  Typewriter rendering, portrait integration, response flow
// ════════════════════════════════════════════════════════════

class DialogueEngine {
  constructor() {
    this.isActive = false;
    this.currentNode = null;
    this.currentCharacter = null;
    this.lineQueue = [];
    this.lineIndex = 0;
    this.isTyping = false;
    this.typeInterval = null;
    this.typingSpeed = 24; // ms per char
    this.onCompleteCallback = null;

    // DOM
    this.box          = document.getElementById('dialogue-box');
    this.portraitCanvas = document.getElementById('dialogue-portrait-canvas');
    this.phoneIndicator = document.getElementById('dialogue-phone-indicator');
    this.speakerName  = document.getElementById('dialogue-speaker-name');
    this.speakerTitle = document.getElementById('dialogue-speaker-title');
    this.textEl       = document.getElementById('dialogue-text');
    this.responses    = document.getElementById('dialogue-responses');
    this.skipHint     = document.getElementById('dialogue-skip-hint');

    this.speakerTitles = {
      maren:     { name: 'Maren Cole',         title: 'Detective' },
      hester:    { name: 'Hester Drum',         title: 'Housekeeper, 28 years' },
      dorothea:  { name: 'Dorothea Ashwood',    title: 'Widow' },
      nathaniel: { name: 'Nathaniel Ashwood',   title: 'Eldest Son, Operations Director' },
      sylvie:    { name: 'Sylvie Ashwood',      title: 'Artist — Carriage House Studio' },
      dr_crane:  { name: 'Dr. Aubrey Crane',    title: 'Family Physician' },
      declan:    { name: 'Declan Fairweather',  title: 'Whitmore — Retired' },
      narrator:  { name: '',                    title: '' }
    };

    this.bindEvents();
  }

  bindEvents() {
    this.textEl?.addEventListener('click', () => {
      if (this.isTyping) this.skipTyping();
    });
    this.box?.addEventListener('click', (e) => {
      if (e.target === this.box && this.isTyping) this.skipTyping();
    });
  }

  // ──────────────────────────────────────────
  //  START CONVERSATION
  // ──────────────────────────────────────────
  startConversation(characterId, nodeId = null, _unused = null, onComplete = null) {
    if (onComplete) this.onCompleteCallback = onComplete;
    const charDialogue = DIALOGUE[characterId];
    if (!charDialogue) return;

    this.currentCharacter = characterId;
    this.isActive = true;

    audioManager.ensureInit();

    let node;
    if (nodeId && charDialogue[nodeId]) {
      node = charDialogue[nodeId];
    } else {
      node = this.findEntryNode(characterId, charDialogue);
    }

    if (!node) {
      // No new dialogue — use a generic "nothing new" message
      this.narrate(['I\'ve already learned what I can here.']);
      return;
    }

    this.showBox();
    this.playNode(node);
  }

  findEntryNode(characterId, charDialogue) {
    const introKey = `${characterId}_intro`;
    if (charDialogue[introKey] && !gameState.hasSeenDialogue(introKey)) {
      if (gameState.checkCondition(charDialogue[introKey].condition)) {
        return charDialogue[introKey];
      }
    }
    // Find next available unseen node with met conditions
    for (const [key, node] of Object.entries(charDialogue)) {
      if (!gameState.hasSeenDialogue(key) && gameState.checkCondition(node.condition)) {
        return node;
      }
    }
    return null;
  }

  // ──────────────────────────────────────────
  //  PLAY NODE
  // ──────────────────────────────────────────
  playNode(node) {
    if (!node) { this.endConversation(); return; }

    this.currentNode = node;
    gameState.markDialogueSeen(node.id);

    // Apply entry flags/clues
    if (node.setsFlag) gameState.setFlag(node.setsFlag);
    if (node.givesClue) this.giveClue(node.givesClue);

    // Update speaker UI
    const speakerData = this.speakerTitles[node.speaker] || { name: node.speaker, title: '' };
    if (this.speakerName) this.speakerName.textContent = node.isPhone
      ? `${speakerData.name} — via telephone`
      : speakerData.name;
    if (this.speakerTitle) this.speakerTitle.textContent = speakerData.title;

    // Phone indicator
    if (this.phoneIndicator) {
      node.isPhone
        ? this.phoneIndicator.classList.remove('hidden')
        : this.phoneIndicator.classList.add('hidden');
    }

    // Draw portrait
    if (this.portraitCanvas) {
      const charId = node.portrait || node.speaker;
      PortraitRenderer.draw(this.portraitCanvas, charId);
    }

    // Queue lines
    this.lineQueue = Array.isArray(node.text) ? [...node.text] : [node.text];
    this.lineIndex = 0;
    this.responses.innerHTML = '';

    this.displayLines();
  }

  // ──────────────────────────────────────────
  //  LINE DISPLAY
  // ──────────────────────────────────────────
  displayLines() {
    this.textEl.innerHTML = '';

    const showLine = (index) => {
      if (index >= this.lineQueue.length) {
        // Show skip hint briefly, then responses
        setTimeout(() => {
          if (this.skipHint) this.skipHint.style.display = 'none';
          this.displayResponses(this.currentNode.responses || []);
        }, 150);
        return;
      }

      const line = this.lineQueue[index];
      const p = document.createElement('p');
      this.textEl.appendChild(p);

      // Reveal paragraph element
      requestAnimationFrame(() => p.classList.add('revealed'));

      this.isTyping = true;
      if (this.skipHint) this.skipHint.style.display = 'block';

      this.typewriterLine(p, line, () => {
        this.lineIndex = index + 1;
        this.isTyping = false;

        if (index + 1 < this.lineQueue.length) {
          setTimeout(() => showLine(index + 1), 500);
        } else {
          setTimeout(() => {
            if (this.skipHint) this.skipHint.style.display = 'none';
            this.displayResponses(this.currentNode.responses || []);
          }, 200);
        }
      });
    };

    showLine(0);
  }

  typewriterLine(element, text, callback) {
    let i = 0;
    const typeChar = () => {
      if (i >= text.length) {
        clearInterval(this.typeInterval);
        this.typeInterval = null;
        if (callback) callback();
        return;
      }
      element.textContent += text[i];
      i++;
      // Vary speed slightly for natural feel; slow on punctuation
      const char = text[i - 1];
      if (['.', '!', '?', '…'].includes(char)) {
        clearInterval(this.typeInterval);
        setTimeout(() => {
          this.typeInterval = setInterval(typeChar, this.typingSpeed);
        }, 180);
      }
    };
    // Play subtle type sound every few chars
    let typeSoundCounter = 0;
    const withSound = () => {
      typeChar();
      typeSoundCounter++;
      if (typeSoundCounter % 4 === 0) audioManager.playTypeFX();
    };
    this.typeInterval = setInterval(withSound, this.typingSpeed);
  }

  skipTyping() {
    if (this.typeInterval) {
      clearInterval(this.typeInterval);
      this.typeInterval = null;
    }
    this.isTyping = false;

    // Fill all lines immediately
    this.textEl.innerHTML = '';
    this.lineQueue.forEach(line => {
      const p = document.createElement('p');
      p.textContent = line;
      p.classList.add('revealed');
      this.textEl.appendChild(p);
    });

    if (this.skipHint) this.skipHint.style.display = 'none';
    this.displayResponses(this.currentNode.responses || []);
  }

  // ──────────────────────────────────────────
  //  RESPONSES
  // ──────────────────────────────────────────
  displayResponses(responses) {
    this.responses.innerHTML = '';

    const available = responses.filter(r =>
      !r.condition || gameState.checkCondition(r.condition)
    );

    if (available.length === 0) {
      const btn = this.createResponseBtn('[Continue]', null, true);
      btn.addEventListener('click', () => this.endConversation());
      this.responses.appendChild(btn);
      setTimeout(() => btn.classList.add('revealed'), 100);
      return;
    }

    available.forEach((r, idx) => {
      const btn = this.createResponseBtn(r.text, r, r.text.startsWith('['));
      btn.addEventListener('click', () => this.selectResponse(r));
      this.responses.appendChild(btn);
      setTimeout(() => btn.classList.add('revealed'), 80 + idx * 60);
    });
  }

  createResponseBtn(text, response, isAction = false) {
    const btn = document.createElement('button');
    btn.className = `response-btn${isAction ? ' action-line' : ''}`;
    btn.textContent = text;
    return btn;
  }

  selectResponse(response) {
    if (response.setsFlag) gameState.setFlag(response.setsFlag);
    if (response.givesClue) this.giveClue(response.givesClue);

    if (response.endsConversation || response.leadsTo === null) {
      this.endConversation();
      return;
    }

    if (response.leadsTo) {
      const charDialogue = DIALOGUE[this.currentCharacter];
      const next = charDialogue?.[response.leadsTo];
      if (next) {
        this.playNode(next);
      } else {
        this.endConversation();
      }
    }
  }

  // ──────────────────────────────────────────
  //  NARRATION (no character)
  // ──────────────────────────────────────────
  narrate(lines, onComplete = null) {
    this.onCompleteCallback = onComplete;
    this.currentCharacter = 'narrator';
    this.isActive = true;

    if (this.speakerName) this.speakerName.textContent = '';
    if (this.speakerTitle) this.speakerTitle.textContent = '';
    if (this.portraitCanvas) {
      const ctx = this.portraitCanvas.getContext('2d');
      ctx.clearRect(0, 0, this.portraitCanvas.width, this.portraitCanvas.height);
    }

    const node = {
      id: `narration_${Date.now()}`,
      speaker: 'narrator',
      text: Array.isArray(lines) ? lines : [lines],
      responses: []
    };

    this.showBox();
    this.playNode(node);
  }

  // ──────────────────────────────────────────
  //  CLUE HANDLING
  // ──────────────────────────────────────────
  giveClue(clueId) {
    const wasNew = gameState.addClue(clueId);
    if (wasNew) {
      const clue = STORY.clues[clueId];
      if (clue) {
        this.showClueNotification(clue);
        audioManager.playClueFX();
        if (clue.weight === 'critical' || clue.weight === 'revelatory') {
          setTimeout(() => audioManager.playStingerFX(), 300);
        }
        // Update badges
        uiManager?.updateBadges?.();
      }
    }
  }

  showClueNotification(clue) {
    const notif = document.getElementById('clue-notification');
    const name = document.getElementById('clue-notif-name');
    if (!notif || !name) return;

    name.textContent = clue.name;
    notif.classList.remove('hidden');
    notif.classList.add('show');

    clearTimeout(this._clueTimeout);
    this._clueTimeout = setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => notif.classList.add('hidden'), 400);
    }, 3500);
  }

  // ──────────────────────────────────────────
  //  SHOW / HIDE
  // ──────────────────────────────────────────
  showBox() {
    this.box?.classList.remove('hidden');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.box?.classList.add('visible'));
    });
  }

  hideBox() {
    this.box?.classList.remove('visible');
    setTimeout(() => this.box?.classList.add('hidden'), 400);
  }

  endConversation() {
    this.isActive = false;
    if (this.typeInterval) { clearInterval(this.typeInterval); this.typeInterval = null; }

    const cb = this.onCompleteCallback;
    this.onCompleteCallback = null;

    this.hideBox();

    // Notify main systems
    if (window.sceneManager) window.sceneManager.onDialogueEnd();
    if (cb) setTimeout(cb, 100);
  }
}

const dialogueEngine = new DialogueEngine();
