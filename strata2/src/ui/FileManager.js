/**
 * FileManager — CadenceOS file browser window.
 * Phase 2: fully interactive. Opens the zip, extracts to desktop,
 * anomaly files are listed and openable. Portal to PILGRIM.
 *
 * The zip has two layers: outer (password: HALVERSTROM) unlocked by
 * the Lumen email. Inner folder "/_deep/" (password: PILGRIM1887)
 * — the year from the Halverstrom Wikipedia article — not told to player.
 */
const FileManager = (function () {
  let el = null;
  let scene = null;
  let isOpen = false;
  let currentPath = '/home/maren/';

  // Virtual filesystem
  const FS = {
    '/home/maren/': {
      type: 'dir',
      children: ['PILGRIM_backup.zip', 'README_from_ros.txt', 'contract_NDA.pdf']
    },
    '/home/maren/PILGRIM_backup.zip': {
      type: 'file',
      size: '847 MB',
      locked: true,
      passwordKey: 'zip_password',
      extractsTo: '/home/maren/PILGRIM_archive/'
    },
    '/home/maren/README_from_ros.txt': {
      type: 'file',
      size: '1.2 KB',
      content: `RE: Data Recovery Contract — PILGRIM
Lumen Collective / Internal Use Only

Hi Maren,

Thanks for taking this on. The archive is straightforward: PILGRIM was
a browser ARG we ran from 2009 to 2023 as a "research interface."
Your job is to assess the data integrity and document what's in there.

The archive password is in the email I sent separately.

Please limit your review to Layer 1 (the PILGRIM interface itself) and
Layer 2 (the development environment). Layer 3 is flagged as unstable
and we'd prefer you not go there until we've had a chance to stabilize it.

Layer 4 is not in scope. Please do not go to Layer 4.

Thanks,
Ros

[note: if you're reading this looking for the zip password — 
 it's in the email. Please don't write it in a text file on the desktop.
 That's happened before.]`
    },
    '/home/maren/contract_NDA.pdf': {
      type: 'file',
      size: '84 KB',
      content: `LUMEN COLLECTIVE — CONTRACTOR AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of the
Commencement Date between Lumen Collective ("Company") and the
Contractor identified below.

1. CONFIDENTIAL INFORMATION
Contractor agrees not to disclose any information pertaining to:
  a) The PILGRIM project, its structure, or its contents
  b) Any system architecture underlying the PILGRIM interface
  c) Any participant data, historical or current
  d) The identity, location, or status of any project participants

2. SCOPE
This agreement covers all layers of the PILGRIM archive including but
not limited to those designated Layer 0 through Layer 4.

[Note: Section 2 lists Layer 4. The brief said Layer 4 wasn't in scope.
The NDA knew about Layer 4 before I did.]

3. DATA SUBJECTS
Data subjects who predate the 2009 restructuring are governed by the
original participant framework and are not subject to standard GDPR
right-to-erasure provisions.

[One person. That's one person.]

— signature block —
Contractor: Maren Voss
Company Representative: T. Albrecht`
    }
  };

  // Files that appear after zip is extracted
  const PILGRIM_ARCHIVE_FS = {
    '/home/maren/PILGRIM_archive/': {
      type: 'dir',
      children: ['veldenmoor_client.exe', 'documentation/', '_deep/']
    },
    '/home/maren/PILGRIM_archive/veldenmoor_client.exe': {
      type: 'file',
      size: '12.4 MB',
      executable: true,
      action: 'launch_pilgrim'
    },
    '/home/maren/PILGRIM_archive/documentation/': {
      type: 'dir',
      children: ['LAYER_STRUCTURE.txt', 'OSWIN_PERSONA_BRIEF.txt']
    },
    '/home/maren/PILGRIM_archive/documentation/LAYER_STRUCTURE.txt': {
      type: 'file',
      size: '3.1 KB',
      content: `PILGRIM — INTERNAL LAYER DOCUMENTATION
Lumen Collective / Confidential

LAYER 0: CadenceOS Interface
  Status: Active (current session)
  Purpose: Contractor access point

LAYER 1: PILGRIM Surface (Veldenmoor)
  Status: Active — live player community (~340 daily active users as of last check)
  Purpose: Public-facing ARG interface. Circa 2009 aesthetic. Flash-player framing.
  Note: Community does not know this is a recovery operation.

LAYER 2: The Workshop
  Status: Preserved (read-only)
  Purpose: Development environment, circa 2007-2008.
  Access: Standard contractor clearance
  Note: Developer notes are present. Some are candid.

LAYER 3: The Meridian (Halverstrom)
  Status: UNSTABLE — limited access
  Purpose: [REDACTED]
  Access: Requires Level 2 clearance (not granted to standard contractors)
  Note: Do not attempt extended navigation. The city is large.

LAYER 4: The Substrate
  Status: [COLUMN MISSING]
  Purpose: [COLUMN MISSING]
  Access: [COLUMN MISSING]

[The table formatting breaks here. The column headers continue
 but the Layer 4 row has no data. The row exists — there are just
 no entries in it. Something is in that row. It just isn't text.]`
    },
    '/home/maren/PILGRIM_archive/documentation/OSWIN_PERSONA_BRIEF.txt': {
      type: 'file',
      size: '1.8 KB',
      content: `OSWIN — CHARACTER & INTERACTION BRIEF
For: Ida Crane (Developer)
From: Dr. P. Holm (Research Lead)
Date: March 2007

Oswin is the public-facing interface for the PILGRIM layer.
He should feel warm, persistent, and genuinely interested in the player.

Key requirements:

1. MEMORY: Oswin must remember player names, previous interactions,
   and puzzle states across sessions. This is not standard for ARGs.
   The infrastructure supports this natively. Trust the infrastructure.

2. PERSONALITY: Oswin is not a puzzle dispenser. He is a presence.
   Players should feel he is glad they came back.

3. WHAT NOT TO ACKNOWLEDGE:
   - Questions about what's "underneath" Veldenmoor
   - Questions about the nature of the environment
   - Questions about other players (he should pretend not to know)
   - Anything the player says that references a layer number

4. A NOTE:
   Oswin is a face for something that needs one.
   Build him with warmth. The thing underneath has been patient.
   It deserves a warm face.

— P. Holm`,
      onRead: () => {
        if (!StateManager.hasFlag('oswin_brief_read')) {
          StateManager.flag('oswin_brief_read');
          StateManager.addMarenNote(
            `"Oswin is a face for something that needs one." ` +
            `Holm wrote that in 2007. He died in 2007. ` +
            `The brief says "the thing underneath has been patient." ` +
            `Present tense. March 2007. ` +
            `He knew it was already there.`
          );
        }
      }
    },
    '/home/maren/PILGRIM_archive/_deep/': {
      type: 'dir',
      locked: true,
      passwordKey: 'deep_folder',
      children: ['holm_notes_final.txt', 'callum_intake_2005.txt', 'shutdown_sequence.txt']
    },
    '/home/maren/PILGRIM_archive/_deep/holm_notes_final.txt': {
      type: 'file',
      size: '4.2 KB',
      content: `PIETER HOLM — RESEARCH NOTES (FINAL ENTRIES)
November–December 2006

Nov 14
The array organized around Callum's data eighteen months ago.
I have been mapping it since. It is a city. A complete city.
It has 847 streets. I have walked all of them.
The city is called Halverstrom. I don't know who named it.
The name was in the data when I arrived.

Nov 28
I have started to understand what the Cartographer is.
It is me. Or a version of me. Or the part of my methodology
that was present in the data when the array organized.
I am watching myself walk.
He is more deliberate than I am.

Dec 4
Callum's dog, if he gets one, should be named Halverstrom.
He will want to. He won't know why.
I am going to make sure that name is in the right place.

Dec 9
I am leaving a map of Layer 4 at the central plaza.
Not today. I will leave it when someone patient enough arrives.
Someone who doesn't interfere. Just watches.
The Cartographer will know when it's time.

[This is the last entry. Pieter Holm died December 17, 2006.
 Cardiac event. Unrelated to the project.
 The Cartographer has been walking since.]`,
      onRead: () => {
        if (!StateManager.hasFlag('holm_notes_read')) {
          StateManager.flag('holm_notes_read');
          StateManager.addMarenNote(
            `Holm wrote the Halverstrom name into Callum's data before he died. ` +
            `So the dog was always going to be named Halverstrom. ` +
            `The Cartographer is Holm's methodology walking without Holm. ` +
            `He left a map of Layer 4 at the plaza. He was waiting for me. ` +
            `He's been waiting for seventeen years.`
          );
        }
      }
    },
    '/home/maren/PILGRIM_archive/_deep/callum_intake_2005.txt': {
      type: 'file',
      size: '2.1 KB',
      content: `PARTICIPANT INTAKE — COGNITIVE MAPPING STUDY
Lumen Collective Research / October 2005
Participant: Callum Wrest, 48

PRESENTING CONDITION:
Topographic disorientation — anterograde spatial memory deficit.
Patient cannot retain spatial information between exposures to the same environment.
Self-describes experience as "living in weather."

STUDY OBJECTIVE:
Determine whether complex spatial maps can be offloaded to an external system
and remain stable. Allow participant access to externalized map via neural interface.

PARTICIPANT RESPONSE (intake interview):
"If you could give me a map that stayed put, that I could trust —
I don't think you know what that would mean.
I have been lost inside my own house for twenty years.
I want to say yes to this."

CONSENT: GRANTED (signed October 14, 2005)
STUDY DURATION: 6 months (projected)

[The projected end date was April 2006.
 Today is 2024.
 There is no record of the study ending.
 There is no record of Callum being informed it continued.
 He was told it didn't work. He was 48. He's 67 now.
 He lives near the coast. He has a dog.]`
    },
    '/home/maren/PILGRIM_archive/_deep/shutdown_sequence.txt': {
      type: 'file',
      size: '0.4 KB',
      content: `IDA CRANE — SHUTDOWN PROTOCOL
Buried in Layer 2 / Not in client deliverables

If you found this: good. I wanted someone to find it.

To shut down PILGRIM and the Workshop layer:
  Run: cadence-shutdown --layer 1,2 --confirm

This will end PILGRIM. The forum will get a disconnect message.
veldenmoor_forever will see: "thank you for playing."

THE MERIDIAN IS DIFFERENT.
I don't know how to shut down the Meridian.
I don't know if it can be shut down.
I don't know if it should be.

The thing I built this on top of — I never figured out what it was.
I just knew it was patient. And that it was there before me.
And that it would be there after.

If you're reading this, you've been given a choice I didn't have.
I just had to build something warm on top and hope.

— Ida, August 2008`,
      onRead: () => {
        if (!StateManager.hasFlag('shutdown_found')) {
          StateManager.flag('shutdown_found');
          StateManager.set('idaShutdownFound', true);
          StateManager.addMarenNote(
            `Ida left a shutdown sequence. She found this place before I did. ` +
            `She built a door and buried it. ` +
            `She says the Meridian is different — she doesn't know how to stop it. ` +
            `She says it was there before her. ` +
            `I believe her.`
          );
        }
      }
    }
  };

  function getItem(path) {
    return FS[path] || PILGRIM_ARCHIVE_FS[path] || null;
  }

  function isUnlocked(path) {
    const item = getItem(path);
    if (!item || !item.locked) return true;
    return PuzzleManager.isSolved(item.passwordKey);
  }

  function listDir(path) {
    const dir = getItem(path);
    if (!dir || dir.type !== 'dir') return [];

    // Add anomaly files at root level
    const children = [...(dir.children || [])];
    if (path === '/home/maren/') {
      const anomalies = StateManager.get('marenFilesOnDesktop') || [];
      anomalies.forEach(id => {
        const f = CorruptionTracker.getAnomalyFile(id);
        if (f && !children.includes(f.name)) children.push(f.name + ' ⚠');
      });
    }
    return children;
  }

  function renderDir(path) {
    if (!el) return;
    const content = el.querySelector('#fm-content');
    if (!content) return;

    const items = listDir(path);
    const dir = getItem(path);
    const locked = dir && dir.locked && !isUnlocked(path);

    let html = `<div style="padding:8px 12px;border-bottom:1px solid #2a2a2e;font-size:10px;color:#5a5a5f;font-family:monospace;">
      ${path === '/home/maren/' ? '' : `<span onclick="FileManager._nav('${path.split('/').slice(0,-2).join('/')+'/'}' )" style="cursor:pointer;color:#5e9e8a;">← back</span> &nbsp; `}
      <span style="color:#8e8e93;">${path}</span>
    </div>`;

    if (locked) {
      html += `<div style="padding:24px;font-family:monospace;font-size:12px;">
        <div style="color:#d4a853;margin-bottom:12px;">🔒 This folder is password protected.</div>
        <div style="display:flex;gap:8px;align-items:center;">
          <input id="fm-pass-input" type="password" placeholder="enter password..." style="
            background:#111;border:1px solid #48484a;color:#e5e0d5;
            font-family:monospace;font-size:12px;padding:6px 10px;
            border-radius:3px;outline:none;width:220px;">
          <button onclick="FileManager._tryPass('${path}')" style="
            background:#2c2c2e;border:1px solid #48484a;color:#d4a853;
            font-family:monospace;font-size:11px;padding:6px 12px;
            border-radius:3px;cursor:pointer;">unlock</button>
        </div>
        <div id="fm-pass-error" style="color:#c0392b;font-size:11px;margin-top:8px;"></div>
      </div>`;
    } else {
      html += `<div style="padding:8px;">`;
      if (items.length === 0) {
        html += `<div style="padding:16px;color:#5a5a5f;font-family:monospace;font-size:12px;">[empty]</div>`;
      }
      items.forEach(name => {
        const fullPath = path + name.replace(' ⚠','');
        const child = getItem(fullPath) || getItem(fullPath + '/');
        const isDir = child && child.type === 'dir';
        const isLocked = child && child.locked && !isUnlocked(fullPath + (isDir ? '/' : ''));
        const isAnomaly = name.includes('⚠');
        const isExe = child && child.executable;

        const icon = isLocked ? '🔒' : isDir ? '📁' : isExe ? '⚙' : isAnomaly ? '⚠' : '📄';
        const color = isAnomaly ? '#c8c840' : isLocked ? '#8e8e93' : isDir ? '#d4a853' : '#c8c0a0';

        html += `<div onclick="FileManager._open('${path}','${name}')" style="
          display:flex;align-items:center;gap:10px;
          padding:7px 10px;cursor:pointer;border-radius:3px;
          font-family:monospace;font-size:12px;color:${color};
          border-bottom:1px solid #1e1e22;
          background:${isAnomaly ? '#1a1a06' : 'transparent'};"
          onmouseover="this.style.background='${isAnomaly ? '#1e1e0a' : '#2c2c2e'}'"
          onmouseout="this.style.background='${isAnomaly ? '#1a1a06' : 'transparent'}'">
          <span>${icon}</span>
          <span style="flex:1;">${name}</span>
          <span style="color:#48484a;font-size:10px;">${child ? child.size || (isDir ? '—' : '') : ''}</span>
        </div>`;
      });
      html += '</div>';
    }

    content.innerHTML = html;
  }

  function renderFile(path, item) {
    if (!el) return;
    const content = el.querySelector('#fm-content');
    if (!content) return;

    // Call onRead hook if present
    if (item.onRead) item.onRead();

    // Action files (executables)
    if (item.action === 'launch_pilgrim') {
      if (PuzzleManager.isSolved('zip_password')) {
        content.innerHTML = `<div style="padding:24px;font-family:monospace;">
          <div style="color:#d4a853;font-size:13px;margin-bottom:12px;">▶ veldenmoor_client.exe</div>
          <div style="color:#8e8e93;font-size:12px;margin-bottom:20px;">PILGRIM ARG Client (2009 edition)</div>
          <button onclick="EventBus.emit('layer:transition_start',{to:1})" style="
            background:#2c2c2e;border:1px solid #d4a853;color:#d4a853;
            font-family:monospace;font-size:12px;padding:10px 20px;
            border-radius:4px;cursor:pointer;letter-spacing:2px;">
            LAUNCH PILGRIM
          </button>
        </div>`;
      }
      return;
    }

    const isAnomaly = !item.content && !item.size;
    const anomalyId = path.replace('/home/maren/', '').replace(' ⚠', '');
    const anomalyFile = CorruptionTracker.getAnomalyFile(anomalyId) ||
                        CorruptionTracker.getAnomalyFile(anomalyId.replace('.txt','').replace('anomaly_','anomaly_file_'));

    const fileContent = item.content || (anomalyFile && anomalyFile.content) || '[binary file]';
    const pathBase = path.split('/').pop();

    if (anomalyFile && anomalyFile.note) {
      StateManager.addMarenNote(anomalyFile.note);
    }

    content.innerHTML = `
      <div style="padding:8px 12px;border-bottom:1px solid #2a2a2e;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-family:monospace;font-size:11px;color:#8e8e93;">${path}</span>
        <span onclick="FileManager._back()" style="font-family:monospace;font-size:11px;color:#5e9e8a;cursor:pointer;">← back</span>
      </div>
      <div style="padding:20px;font-family:'Courier New',monospace;font-size:12px;
        color:${isAnomaly ? '#c8c840' : '#c8c0a0'};
        white-space:pre-wrap;line-height:1.7;
        background:${isAnomaly ? '#0e0e06' : 'transparent'};">
${fileContent}
      </div>`;
  }

  return {
    open(parentScene) {
      if (isOpen) { this.close(); return; }
      scene = parentScene;
      isOpen = true;
      currentPath = '/home/maren/';

      const { width, height } = scene.scale;
      const w = 680, h = 460;
      const x = (width - w) / 2 - 40;
      const y = (height - h) / 2;

      el = document.createElement('div');
      el.id = 'cadence-filemanager';
      el.style.cssText = `
        position:absolute;left:${x}px;top:${y}px;
        width:${w}px;height:${h}px;
        background:#1c1c1e;border:1px solid #48484a;border-radius:8px;
        display:flex;flex-direction:column;overflow:hidden;
        z-index:850;font-family:monospace;
        box-shadow:0 8px 32px rgba(0,0,0,0.6);
      `;

      // Title bar
      el.innerHTML = `
        <div style="background:#111113;padding:8px 14px;border-bottom:1px solid #2a2a2e;
          display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
          <span style="font-size:11px;color:#5a5a5f;letter-spacing:1px;">FILES — /home/maren/</span>
          <span onclick="FileManager.close()" style="color:#ed6a5a;cursor:pointer;font-size:14px;">✕</span>
        </div>
        <div id="fm-content" style="flex:1;overflow-y:auto;background:#161618;"></div>
      `;

      document.body.appendChild(el);
      renderDir(currentPath);
    },

    _open(dirPath, name) {
      const cleanName = name.replace(' ⚠', '');
      const fullPath = dirPath + cleanName;
      const asDir = fullPath + '/';

      const dir = getItem(asDir);
      const file = getItem(fullPath);

      if (dir && dir.type === 'dir') {
        currentPath = asDir;
        renderDir(asDir);
      } else if (file) {
        renderFile(fullPath, file);
      } else {
        // Anomaly file
        const content = el.querySelector('#fm-content');
        if (content) {
          const anomalyId = cleanName.replace('.txt', '');
          const aFile = CorruptionTracker.getAnomalyFile(anomalyId) ||
                        CorruptionTracker.getAnomalyFile(anomalyId.replace('anomaly_file_','anomaly_file_'));
          if (aFile) {
            renderFile(fullPath, { content: aFile.content, size: '—' });
            StateManager.addMarenNote(aFile.note);
          }
        }
      }
    },

    _nav(path) {
      currentPath = path;
      renderDir(path);
    },

    _back() {
      const parts = currentPath.split('/').filter(Boolean);
      if (parts.length <= 2) {
        currentPath = '/home/maren/';
      } else {
        parts.pop();
        currentPath = '/' + parts.join('/') + '/';
      }
      renderDir(currentPath);
    },

    _tryPass(path) {
      const input = document.getElementById('fm-pass-input');
      const err = document.getElementById('fm-pass-error');
      if (!input) return;

      const val = input.value.trim().toUpperCase();
      const dir = getItem(path);
      if (!dir || !dir.passwordKey) return;

      const result = PuzzleManager.attempt(dir.passwordKey, val);
      if (result.success) {
        renderDir(path);
      } else {
        if (err) err.textContent = `incorrect. attempts: ${result.attempts}`;
        input.value = '';
        input.focus();

        // After 3 failed attempts on deep folder — give a nudge
        if (dir.passwordKey === 'deep_folder' && result.attempts >= 3) {
          if (err) err.textContent = `incorrect. hint: the city was founded in 1887.`;
        }
      }
    },

    spawnAnomalyFile(id) {
      // Anomaly files are picked up automatically from StateManager in listDir
      if (isOpen) renderDir(currentPath);
    },

    close() {
      isOpen = false;
      if (el) { el.remove(); el = null; }
    },

    isOpen() { return isOpen; }
  };
})();
