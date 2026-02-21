// ============================================================
//  THE ASHWOOD INHERITANCE - Dialogue Engine
//  Handles conversation flow, typewriter rendering, choices
// ============================================================

class DialogueEngine {
  constructor() {
    this.isActive = false;
    this.currentNode = null;
    this.currentCharacter = null;
    this.lineQueue = [];
    this.lineIndex = 0;
    this.isTyping = false;
    this.typeInterval = null;
    this.typingSpeed = 28; // ms per character

    // DOM references
    this.box       = document.getElementById('dialogue-box');
    this.portrait  = document.getElementById('dialogue-portrait');
    this.speaker   = document.getElementById('dialogue-speaker');
    this.textEl    = document.getElementById('dialogue-text');
    this.responses = document.getElementById('dialogue-responses');

    // Character name display map
    this.speakerNames = {
      maren:     "Maren Cole",
      hester:    "Hester Drum",
      dorothea:  "Dorothea Ashwood",
      nathaniel: "Nathaniel Ashwood",
      sylvie:    "Sylvie Ashwood",
      dr_crane:  "Dr. Aubrey Crane",
      declan:    "Declan Fairweather",
      narrator:  ""
    };

    this.bindEvents();
  }

  bindEvents() {
    // Click anywhere on dialogue text to advance / skip typing
    this.textEl.addEventListener('click', () => {
      if (this.isTyping) {
        this.skipTyping();
      }
    });
  }

  // ============================================================
  //  START A CONVERSATION
  // ============================================================
  startConversation(characterId, nodeId = null) {
    const charDialogue = DIALOGUE[characterId];
    if (!charDialogue) {
      console.warn(`No dialogue found for character: ${characterId}`);
      return;
    }

    this.currentCharacter = characterId;
    this.isActive = true;

    // Determine starting node
    let startNode;
    if (nodeId && charDialogue[nodeId]) {
      startNode = charDialogue[nodeId];
    } else {
      startNode = this.findEntryNode(characterId, charDialogue);
    }

    if (!startNode) {
      console.warn(`No valid entry node for: ${characterId}`);
      return;
    }

    this.showBox();
    this.playNode(startNode);
  }

  findEntryNode(characterId, charDialogue) {
    // Try intro first
    const introKey = `${characterId}_intro`;
    if (charDialogue[introKey] && gameState.checkCondition(charDialogue[introKey].condition)) {
      // If already seen intro, find next appropriate node
      if (gameState.hasSeenDialogue(introKey)) {
        return this.findNextUnseenNode(charDialogue);
      }
      return charDialogue[introKey];
    }

    return this.findNextUnseenNode(charDialogue);
  }

  findNextUnseenNode(charDialogue) {
    for (const [key, node] of Object.entries(charDialogue)) {
      if (!gameState.hasSeenDialogue(key) && gameState.checkCondition(node.condition)) {
        return node;
      }
    }
    // All seen — return a fallback or null
    return null;
  }

  // ============================================================
  //  PLAY A NODE
  // ============================================================
  playNode(node) {
    if (!node) {
      this.endConversation();
      return;
    }

    this.currentNode = node;
    gameState.markDialogueSeen(node.id);

    // Apply any outcomes
    if (node.setsFlag) {
      gameState.setFlag(node.setsFlag);
    }

    // Update speaker
    const speakerName = this.speakerNames[node.speaker] || node.speaker;
    this.speaker.textContent = node.isPhone ? `${speakerName} (via telephone)` : speakerName;

    // Update portrait
    this.updatePortrait(node.portrait || node.speaker);

    // Queue lines for typewriter
    this.lineQueue = Array.isArray(node.text) ? [...node.text] : [node.text];
    this.lineIndex = 0;
    this.responses.innerHTML = '';

    this.displayNextLine();
  }

  // ============================================================
  //  LINE-BY-LINE DISPLAY
  // ============================================================
  displayNextLine() {
    if (this.lineIndex >= this.lineQueue.length) {
      // All lines shown — display responses
      this.displayResponses(this.currentNode.responses || []);
      return;
    }

    const line = this.lineQueue[this.lineIndex];
    this.lineIndex++;

    // Clear previous line if first, or add new line
    if (this.lineIndex === 1) {
      this.textEl.innerHTML = '';
    }

    const lineEl = document.createElement('p');
    lineEl.classList.add('dialogue-line');
    this.textEl.appendChild(lineEl);

    // Small pause between lines
    setTimeout(() => {
      lineEl.classList.add('visible');
      this.typewriterEffect(lineEl, line, () => {
        // After typing, pause before next line
        if (this.lineIndex < this.lineQueue.length) {
          setTimeout(() => this.displayNextLine(), 600);
        } else {
          this.displayResponses(this.currentNode.responses || []);
        }
      });
    }, this.lineIndex === 1 ? 100 : 200);
  }

  // ============================================================
  //  TYPEWRITER EFFECT
  // ============================================================
  typewriterEffect(element, text, callback) {
    if (!text) {
      if (callback) callback();
      return;
    }

    this.isTyping = true;
    let charIndex = 0;
    element.textContent = '';

    this.typeInterval = setInterval(() => {
      element.textContent += text[charIndex];
      charIndex++;

      if (charIndex >= text.length) {
        clearInterval(this.typeInterval);
        this.isTyping = false;
        if (callback) callback();
      }
    }, this.typingSpeed);
  }

  skipTyping() {
    if (this.typeInterval) {
      clearInterval(this.typeInterval);
      this.typeInterval = null;
    }
    this.isTyping = false;

    // Fill in all lines immediately
    const lines = this.textEl.querySelectorAll('.dialogue-line');
    const lineTexts = this.lineQueue;

    lines.forEach((el, i) => {
      if (lineTexts[i]) {
        el.textContent = lineTexts[i];
        el.classList.add('visible');
      }
    });

    // Show remaining lines
    for (let i = lines.length; i < lineTexts.length; i++) {
      const lineEl = document.createElement('p');
      lineEl.classList.add('dialogue-line', 'visible');
      lineEl.textContent = lineTexts[i];
      this.textEl.appendChild(lineEl);
    }

    this.lineIndex = this.lineQueue.length;
    this.displayResponses(this.currentNode.responses || []);
  }

  // ============================================================
  //  RESPONSE BUTTONS
  // ============================================================
  displayResponses(responses) {
    this.responses.innerHTML = '';

    if (!responses || responses.length === 0) {
      // Auto-advance or end
      const continueBtn = document.createElement('button');
      continueBtn.className = 'response-btn action';
      continueBtn.textContent = '[Continue]';
      continueBtn.addEventListener('click', () => this.endConversation());
      this.responses.appendChild(continueBtn);
      return;
    }

    // Filter responses by condition
    const availableResponses = responses.filter(r =>
      !r.condition || gameState.checkCondition(r.condition)
    );

    availableResponses.forEach(response => {
      const btn = document.createElement('button');
      btn.className = 'response-btn';
      btn.textContent = response.text;

      if (response.text.startsWith('[')) {
        btn.classList.add('action');
      }

      btn.addEventListener('click', () => this.selectResponse(response));
      this.responses.appendChild(btn);
    });
  }

  // ============================================================
  //  HANDLE RESPONSE SELECTION
  // ============================================================
  selectResponse(response) {
    // Apply outcomes
    if (response.setsFlag) {
      gameState.setFlag(response.setsFlag);
    }

    if (response.givesClue) {
      this.giveClue(response.givesClue);
    }

    // Check for conversation end
    if (response.endsConversation || response.leadsTo === null) {
      this.endConversation();
      return;
    }

    // Navigate to next node
    if (response.leadsTo) {
      const charDialogue = DIALOGUE[this.currentCharacter];
      const nextNode = charDialogue[response.leadsTo];

      if (nextNode) {
        this.playNode(nextNode);
      } else {
        console.warn(`Node not found: ${response.leadsTo}`);
        this.endConversation();
      }
    }
  }

  // ============================================================
  //  CLUE GIVING
  // ============================================================
  giveClue(clueId) {
    if (gameState.addClue(clueId)) {
      this.showClueNotification(clueId);
    }
  }

  showClueNotification(clueId) {
    const clue = STORY.clues[clueId];
    if (!clue) return;

    const notification = document.getElementById('clue-notification');
    const clueText = document.getElementById('clue-text');

    clueText.innerHTML = `<strong>Evidence: ${clue.name}</strong>${clue.description.slice(0, 80)}...`;
    notification.classList.remove('hidden');

    setTimeout(() => {
      notification.classList.add('hidden');
      setTimeout(() => {
        notification.classList.remove('hidden');
        notification.classList.add('hidden');
      }, 400);
    }, 3500);
  }

  // ============================================================
  //  SHOW / HIDE BOX
  // ============================================================
  showBox() {
    this.box.classList.remove('hidden');
    // Animate in
    this.box.style.transform = 'translateY(100%)';
    this.box.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.box.style.transform = 'translateY(0)';
      });
    });
  }

  hideBox() {
    this.box.style.transform = 'translateY(100%)';
    setTimeout(() => {
      this.box.classList.add('hidden');
      this.box.style.transform = '';
    }, 350);
  }

  updatePortrait(portraitId) {
    // In Phase 1, use placeholder. Phase 2 will add real portraits.
    const portraitMap = {
      hester:    'assets/portraits/hester.png',
      dorothea:  'assets/portraits/dorothea.png',
      nathaniel: 'assets/portraits/nathaniel.png',
      sylvie:    'assets/portraits/sylvie.png',
      dr_crane:  'assets/portraits/crane.png',
      declan:    'assets/portraits/declan.png',
      maren:     'assets/portraits/maren.png'
    };

    const src = portraitMap[portraitId];
    if (src) {
      this.portrait.src = src;
      this.portrait.style.display = 'block';
    } else {
      this.portrait.style.display = 'none';
    }
  }

  // ============================================================
  //  END CONVERSATION
  // ============================================================
  endConversation() {
    this.isActive = false;
    this.currentNode = null;
    this.lineQueue = [];

    if (this.typeInterval) {
      clearInterval(this.typeInterval);
      this.typeInterval = null;
    }

    this.hideBox();

    // Notify scene manager that dialogue ended
    if (window.sceneManager) {
      window.sceneManager.onDialogueEnd();
    }
  }

  // ============================================================
  //  NARRATION (no character, no portrait)
  // ============================================================
  narrate(lines, onComplete = null) {
    this.currentCharacter = 'narrator';
    this.isActive = true;

    const node = {
      id: `narration_${Date.now()}`,
      speaker: 'narrator',
      portrait: null,
      text: Array.isArray(lines) ? lines : [lines],
      responses: onComplete ? [{ text: '[Continue]', leadsTo: null, endsConversation: true }] : []
    };

    this.showBox();
    this.playNode(node);

    if (onComplete) {
      const originalEnd = this.endConversation.bind(this);
      this.endConversation = () => {
        originalEnd();
        onComplete();
        this.endConversation = originalEnd;
      };
    }
  }
}

// Global instance
const dialogueEngine = new DialogueEngine();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DialogueEngine;
}
