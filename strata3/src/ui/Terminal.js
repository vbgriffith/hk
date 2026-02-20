/**
 * Terminal — Maren's in-game notepad and command input.
 * She types observations. They persist. They start appearing in Layer 2.
 * The terminal has a personality: dry, precise, occasionally funny.
 */
const Terminal = (function () {
  let termEl = null;
  let inputEl = null;
  let outputEl = null;
  let isOpen = false;
  let scene = null;
  let _waitingForPassword = false; // true after "open PILGRIM_backup.zip"
  let _waitingForDeepPass = false; // true if _deep/ password prompt active

  const PROMPT = 'maren@cadenceos:~$ ';

  // Command definitions
  const COMMANDS = {
    help: {
      desc: 'list commands',
      fn: () => `available commands:\n  notes      — review my notes\n  ls         — list current directory\n  open [file] — open a file\n  clear      — clear terminal\n  whoami     — ...\n  status     — system status\n  help       — you know what this does`
    },
    whoami: {
      fn: () => {
        StateManager.addMarenNote('ran whoami. terminal said: maren voss, data archaeologist, contract. the computer knows who I am. so does the substrate archive apparently. I should be more bothered by this.');
        return `maren voss\ndata archaeologist (contract)\nemployer: lumen collective\nclearance: standard\n\n[note: if you are not maren voss, please disregard this session]`;
      }
    },
    status: {
      fn: () => {
        const c = (StateManager.get('corruption') * 100).toFixed(1);
        const layer = StateManager.get('deepestLayer');
        const notes = StateManager.get('marenNotes').length;
        return `system: cadenceos v2.1\nproject: PILGRIM recovery (lumen collective)\ncurrent depth: layer ${StateManager.get('currentLayer')}\ndeepest reached: layer ${layer}\ncorruption index: ${c}%${c > 30 ? ' [elevated]' : ''}\nnotes written: ${notes}\n\n${c > 50 ? '[warning: system integrity degraded]\n[recommend reducing layer 4 exposure]' : 'all systems nominal'}`;
      }
    },
    notes: {
      fn: () => {
        const notes = StateManager.get('marenNotes');
        if (!notes.length) return '[no notes yet]';
        return notes.slice(-5).map((n, i) => {
          const d = new Date(n.timestamp);
          const ds = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
          return `[${ds}] ${n.text}`;
        }).join('\n\n---\n\n');
      }
    },
    clear: {
      fn: () => { if (outputEl) outputEl.innerHTML = ''; return null; }
    },
    ls: {
      fn: () => {
        const files = ['PILGRIM_backup.zip', 'README_from_ros.txt', 'contract_unsigned.pdf'];
        const anomalies = StateManager.get('marenFilesOnDesktop') || [];
        anomalies.forEach(id => {
          const f = CorruptionTracker.getAnomalyFile(id);
          if (f) files.push(f.name + ' [!]');
        });
        return files.join('\n');
      }
    },
  };

  // Handle open commands
  function handleOpen(arg) {
    if (!arg) return 'usage: open [filename]';
    if (arg === 'README_from_ros.txt') {
      StateManager.markEmailRead('ros_readme');
      return `RE: Data Recovery Contract — PILGRIM\n\nHi Maren,\n\nThanks for taking this on. The project is straightforward: we have an\narchive of a browser game called PILGRIM (2009) with suspected data\ncorruption. Your job is to assess, document, and recommend.\n\nAccess credentials attached. The archive is large. Take your time.\n\nBest,\nRos\n\n—\nRos Okafor, Project Lead\nLumen Collective`;
    }
    if (arg === 'PILGRIM_backup.zip') {
      if (!PuzzleManager.isSolved('zip_password')) {
        _waitingForPassword = true;
        if (inputEl) {
          inputEl.placeholder = 'enter password...';
          inputEl.style.color = '#d4a853';
        }
        return `archive: PILGRIM_backup.zip\nstatus: password protected\n\nenter password:`;
      }
      EventBus.emit('layer1:open');
      return `[extracting PILGRIM_backup.zip...]\n[done]\n[launching PILGRIM viewer...]`;
    }
    const anomalies = StateManager.get('marenFilesOnDesktop') || [];
    for (const id of anomalies) {
      const f = CorruptionTracker.getAnomalyFile(id);
      if (f && (arg === f.name || arg === f.name.replace(' [!]',''))) {
        StateManager.addMarenNote(`opened anomaly file: ${f.name}\n${f.note}`);
        return `[${f.name}]\n\n${f.content}`;
      }
    }
    return `file not found: ${arg}`;
  }

  function processCommand(raw) {
    const trimmed = raw.trim();

    // Password waiting states — any input is treated as the password
    if (_waitingForPassword) {
      _waitingForPassword = false;
      if (inputEl) { inputEl.placeholder = ''; inputEl.style.color = '#e5e0d5'; }
      const result = PuzzleManager.attempt('zip_password', trimmed);
      if (result.success) {
        StateManager.flag('zip_opened');
        return `[correct]\n[archive unlocked]\n[type: open PILGRIM_backup.zip  to launch]`;
      }
      const attempts = result.attempts || 1;
      const hint = attempts >= 3 ? '\n\nhint: the name of Callum\'s dog' : '';
      return `[incorrect]  attempts: ${attempts}${hint}\n\nenter password:` + (() => { _waitingForPassword = true; return ''; })();
    }

    const parts = trimmed.split(/\s+/);
    const cmd  = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    if (cmd === 'open') return handleOpen(args);

    const def = COMMANDS[cmd];
    if (def) return def.fn(args);

    // Maren adds a note for unknown commands
    if (cmd.length > 0) {
      StateManager.addMarenNote(`tried: "${raw}" — the computer doesn't know that one`);
      return `command not found: ${cmd}\ntype 'help' for available commands`;
    }
    return null;
  }

  function appendOutput(text, isCommand, isGlitch) {
    if (!outputEl) return;
    const line = document.createElement('div');
    line.style.cssText = `
      margin-bottom: 4px;
      color: ${isCommand ? '#d4a853' : isGlitch ? '#804020' : '#c8c0a0'};
      white-space: pre-wrap;
      word-break: break-word;
    `;
    line.textContent = text;
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  // Corruption glitch: echo last note back, slightly wrong
  EventBus.on('terminal:echo_note', () => {
    const notes = StateManager.get('marenNotes');
    if (!notes.length) return;
    const last = notes[notes.length - 1].text;
    const words = last.split(' ');
    const glitched = words.map((w, i) => {
      if (i === Math.floor(words.length / 2)) return w.split('').reverse().join('');
      return w;
    }).join(' ');
    setTimeout(() => {
      appendOutput('\n[system echo]', false, true);
      appendOutput(glitched, false, true);
      appendOutput('[end echo]\n', false, true);
    }, 500);
  });

  return {
    open(parentScene, x, y, w, h) {
      if (isOpen) this.close();
      scene = parentScene;
      isOpen = true;

      termEl = document.createElement('div');
      termEl.id = 'cadence-terminal';
      termEl.style.cssText = `
        position: absolute;
        left: ${x}px; top: ${y}px;
        width: ${w}px; height: ${h}px;
        background: #0d0d0f;
        border: 1px solid #48484a;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 900;
        font-family: "Courier New", monospace;
      `;

      // Title bar
      const titleBar = document.createElement('div');
      titleBar.style.cssText = `
        background: #111113;
        padding: 6px 12px;
        border-bottom: 1px solid #2a2a2e;
        font-size: 11px;
        color: #5a5a5f;
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;
      titleBar.innerHTML = `<span>terminal — maren@cadenceos</span>
        <span onclick="Terminal.close()" style="cursor:pointer;color:#ed6a5a;font-size:13px;">✕</span>`;

      // Output area
      outputEl = document.createElement('div');
      outputEl.style.cssText = `
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        font-size: 12px;
        color: #c8c0a0;
        background: #0a0a0c;
      `;

      // Welcome message
      const welcome = [
        'CadenceOS Terminal v2.1',
        `session started: ${new Date().toLocaleTimeString()}`,
        'type \'help\' for available commands',
        '',
        '[note: this terminal session is logged]',
        '',
      ].join('\n');
      appendOutput(welcome);

      // Input row
      const inputRow = document.createElement('div');
      inputRow.style.cssText = `
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border-top: 1px solid #1e1e22;
        background: #0d0d0f;
      `;
      const promptEl = document.createElement('span');
      promptEl.textContent = PROMPT;
      promptEl.style.cssText = 'color:#d4a853;font-size:12px;white-space:nowrap;';

      inputEl = document.createElement('input');
      inputEl.type = 'text';
      inputEl.style.cssText = `
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: #e5e0d5;
        font-family: "Courier New", monospace;
        font-size: 12px;
        caret-color: #d4a853;
      `;
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = inputEl.value;
          inputEl.value = '';
          appendOutput(PROMPT + val, true);
          const result = processCommand(val);
          if (result !== null && result !== undefined) appendOutput(result + '\n');
        }
      });

      inputRow.appendChild(promptEl);
      inputRow.appendChild(inputEl);
      termEl.appendChild(titleBar);
      termEl.appendChild(outputEl);
      termEl.appendChild(inputRow);
      document.body.appendChild(termEl);

      setTimeout(() => inputEl && inputEl.focus(), 100);
    },

    addLine(text, glitch) { appendOutput(text, false, glitch); },

    close() {
      isOpen = false;
      _waitingForPassword = false;
      _waitingForDeepPass = false;
      if (termEl) { termEl.remove(); termEl = null; outputEl = null; inputEl = null; }
    },

    isOpen() { return isOpen; },
  };
})();
