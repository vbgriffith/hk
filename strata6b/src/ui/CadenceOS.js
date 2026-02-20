/**
 * CadenceOS — the in-game operating system desktop.
 * Everything drawn procedurally in Phaser canvas except interactive elements (DOM overlays).
 * The OS is slightly wrong. That's intentional.
 */
const CadenceOS = (function () {

  const TASKBAR_H = 32;
  const ICON_SIZE = 52;
  const ICON_PAD = 16;

  // Desktop icons
  const ICONS = [
    { id: 'browser',  label: 'Browser',   symbol: '◈', x: 0, y: 0 },
    { id: 'terminal', label: 'Terminal',  symbol: '▶', x: 0, y: 1 },
    { id: 'files',    label: 'Files',     symbol: '⊟', x: 0, y: 2 },
    { id: 'email',    label: 'Email',     symbol: '✉', x: 0, y: 3 },
    { id: 'pilgrim',  label: 'PILGRIM',   symbol: '✦', x: 0, y: 4 },
  ];

  let scene = null;
  let gDesktop = null;
  let gTaskbar = null;
  let iconGraphics = [];
  let iconTexts = [];
  let clockText = null;
  let emailBadge = null;
  let anomalyIndicators = [];

  // Email window state
  let emailOpen = false;
  let emailDom = null;

  // Lumen emails (in-order, some pre-triggered)
  const EMAILS = [
    {
      id: 'ros_initial',
      from: 'ros@lumencollective.com',
      subject: 'PILGRIM Recovery — Getting Started',
      date: null, // set at runtime = 3 days ago
      body: `Hi Maren,

Welcome aboard. I've attached the project brief and your access credentials.

Quick summary: PILGRIM is a browser ARG that Lumen ran as a research interface from 2009–2023. We need a thorough archive review — assess data integrity, document the layer structure, and flag anything unusual.

The main archive is on your desktop as PILGRIM_backup.zip. Password is in the credential doc I sent to your personal email (you should have it — let me know if not).

Timeline is flexible. This one just needs careful eyes.

Best,
Ros`,
      read: false,
      anomalous: false,
    },
    {
      id: 'ros_checkin_1',
      from: 'ros@lumencollective.com',
      subject: 'Re: How\'s the archive?',
      date: null, // triggers after Layer 1 visit
      body: `Hi Maren,

Just checking in. How are you finding PILGRIM? The aesthetic is a bit much, I know. Oswin takes some getting used to.

The client has asked me to remind you that the scope is documentation only. No modifications to any layer, please. Just assessment.

Let us know if you hit anything you can't access.

Best,
Ros`,
      read: false,
      triggerFlag: 'visited_layer1',
      anomalous: false,
    },
    {
      id: 'fenn_access',
      from: 'drfenn@lumencollective.com',
      subject: 'deeper access granted',
      date: null,
      body: `maren voss,

deeper layer access has been provisioned. layer 2 should now be accessible through the PILGRIM interface.

proceed with documentation.

note: it is recommended that documentation depth not exceed layer 2 in the initial phase.

— fenn`,
      read: false,
      triggerFlag: 'layer1_puzzle_solved',
      anomalous: false,
    },
    {
      id: 'ros_checkin_2',
      from: 'ros@lumencollective.com',
      subject: 'Status update?',
      date: null,
      body: `Hi Maren,

Haven't heard from you in a bit. Are you doing okay? The archive can get a little... immersive.

The client has asked about timeline. If you've found anything notable, a brief status doc would be appreciated.

Also — if you've been into Layer 2, you may have seen some of Ida's notes. She was our developer. She left the project in 2008. Some of her notes are candid. Don't read too much into them — she was under deadline pressure.

Best,
Ros`,
      read: false,
      triggerFlag: 'visited_layer2',
      anomalous: false,
    },
    {
      id: 'albrecht_notice',
      from: 't.albrecht@lumencollective.com',
      subject: 'Re: documentation scope',
      date: null,
      body: `noted.`,
      read: false,
      triggerFlag: 'visited_layer3',
      anomalous: false,
    },
    {
      id: 'fenn_anomaly',
      from: 'drfenn@lumencollective.com',
      subject: '',
      date: null,
      body: `the subject has been informed that project conclusion is not within scope of current contract.

the subject should note that layer 4 exposure duration affects layer 0 integrity.

the subject is advised to conclude substrate visits.

[this message was not intended for the subject]`,
      read: false,
      triggerFlag: 'visited_layer4',
      anomalous: true,
    },
  ];

  // Check trigger flags and send pending emails
  EventBus.on('state:flag', ({ name }) => {
    EMAILS.forEach(email => {
      if (email.triggerFlag === name && !email.read && !email.date) {
        email.date = new Date().toLocaleString();
        StateManager.addEmail(email);
        if (emailBadge && scene) {
          refreshBadge();
        }
      }
    });
  });

  EventBus.on('state:changed', ({ key }) => {
    if (key === 'corruption' && scene) {
      // Repaint desktop with corruption effect
      drawDesktop();
    }
  });

  EventBus.on('desktop:anomaly', ({ id }) => {
    if (scene) {
      drawDesktop();
      spawnAnomalyFile(id);
    }
  });

  function spawnAnomalyFile(id) {
    const f = CorruptionTracker.getAnomalyFile(id);
    if (!f || !scene) return;
    // Add a new icon to the desktop
    const idx = ICONS.length;
    const icon = {
      id: 'anomaly_' + id,
      label: f.name,
      symbol: '?',
      x: 1,
      y: idx - 4,
      anomalous: true,
    };
    ICONS.push(icon);
    drawDesktop();
  }

  function getIconPos(icon, width, height) {
    const startX = width - ICON_SIZE - ICON_PAD * 2;
    const startY = ICON_PAD;
    return {
      x: startX - icon.x * (ICON_SIZE + ICON_PAD),
      y: startY + icon.y * (ICON_SIZE + ICON_PAD + 16)
    };
  }

  function drawDesktop() {
    if (!scene || !gDesktop) return;
    const { width, height } = scene.scale;
    const corruption = StateManager.get('corruption') || 0;
    const P = Palette.L0;

    gDesktop.clear();

    // Background — slightly corrupted wallpaper
    const bgColor = corruption > 0.5
      ? Palette.lerp(P.bg, 0x080808, (corruption - 0.5) * 2)
      : P.bg;
    gDesktop.fillStyle(bgColor, 1);
    gDesktop.fillRect(0, 0, width, height - TASKBAR_H);

    // Subtle grid overlay (like a monitor with very slight LCD pattern)
    if (corruption > 0.2) {
      const gridAlpha = Math.min(0.08, (corruption - 0.2) * 0.16);
      Geometry.grid(gDesktop, 0, 0, width, height, 4, 4, 0x404040, gridAlpha);
    }

    // Scan lines — always present, subtle
    Geometry.scanlines(gDesktop, 0, 0, width, height, 0x000000, 0.03 + corruption * 0.04);

    // Desktop icons
    ICONS.forEach((icon, idx) => {
      const pos = getIconPos(icon, width, height);
      const isAnom = icon.anomalous;

      // Icon background
      gDesktop.fillStyle(isAnom ? 0x1a1a0a : 0x2c2c2e, 0.7);
      Geometry.roundRect(gDesktop, pos.x, pos.y, ICON_SIZE, ICON_SIZE, 8,
        isAnom ? 0x1a1a0a : 0x2c2c2e, 0.7,
        isAnom ? 0x4a4a20 : 0x48484a, 1);

      // Icon symbol (drawn as text via scene — we need to redraw each frame or cache)
      // We manage these separately
    });

    // Corruption vignette
    if (corruption > 0.15) {
      Geometry.vignette(gDesktop, 0, 0, width, height, Math.min(0.7, corruption * 0.8));
    }
  }

  function drawTaskbar() {
    if (!scene || !gTaskbar) return;
    const { width, height } = scene.scale;
    const P = Palette.L0;

    gTaskbar.clear();
    gTaskbar.fillStyle(P.taskbar, 1);
    gTaskbar.fillRect(0, height - TASKBAR_H, width, TASKBAR_H);
    gTaskbar.lineStyle(1, P.border, 0.5);
    gTaskbar.beginPath();
    gTaskbar.moveTo(0, height - TASKBAR_H);
    gTaskbar.lineTo(width, height - TASKBAR_H);
    gTaskbar.strokePath();

    // OS label
    // (text handled by scene.add.text below)
  }

  function refreshBadge() {
    const unread = EMAILS.filter(e => !e.read && e.date).length;
    if (emailBadge) {
      emailBadge.setText(unread > 0 ? `${unread}` : '');
      emailBadge.setVisible(unread > 0);
    }
  }

  function openEmailDom() {
    if (emailOpen) return;
    emailOpen = true;
    const { width, height } = scene.scale;
    const w = 620, h = 440;
    const x = (width - w) / 2;
    const y = (height - h) / 2;

    const visibleEmails = EMAILS.filter(e => e.date);
    let selectedId = visibleEmails.length ? visibleEmails[0].id : null;

    emailDom = document.createElement('div');
    emailDom.id = 'cadence-email';
    emailDom.style.cssText = `
      position:absolute;left:${x}px;top:${y}px;
      width:${w}px;height:${h}px;
      background:#1c1c1e;border:1px solid #48484a;border-radius:8px;
      display:flex;overflow:hidden;z-index:800;
      font-family:"Courier New",monospace;
    `;

    // Sidebar
    const sidebar = document.createElement('div');
    sidebar.style.cssText = `width:200px;background:#111113;border-right:1px solid #2a2a2e;overflow-y:auto;`;
    sidebar.innerHTML = `<div style="padding:12px 14px;font-size:11px;color:#5a5a5f;border-bottom:1px solid #1e1e22;letter-spacing:2px;">INBOX</div>`;

    visibleEmails.forEach(email => {
      const row = document.createElement('div');
      row.style.cssText = `
        padding:10px 14px;cursor:pointer;border-bottom:1px solid #1e1e22;
        background:${email.anomalous ? '#1a1a0a' : '#111113'};
      `;
      row.innerHTML = `
        <div style="font-size:11px;color:${email.read ? '#5a5a5f' : '#d4a853'};font-weight:${email.read ? 'normal' : 'bold'};">${email.subject || '(no subject)'}</div>
        <div style="font-size:10px;color:#3a3a3f;margin-top:3px;">${email.from}</div>
      `;
      row.addEventListener('click', () => selectEmail(email));
      sidebar.appendChild(row);
    });

    // Content pane
    const contentPane = document.createElement('div');
    contentPane.id = 'email-content-pane';
    contentPane.style.cssText = `flex:1;padding:20px;overflow-y:auto;`;

    // Close button
    const closeBtn = document.createElement('div');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `position:absolute;right:12px;top:10px;color:#ed6a5a;cursor:pointer;font-size:13px;`;
    closeBtn.addEventListener('click', () => {
      emailOpen = false;
      if (emailDom) { emailDom.remove(); emailDom = null; }
      refreshBadge();
    });

    emailDom.appendChild(sidebar);
    emailDom.appendChild(contentPane);
    emailDom.appendChild(closeBtn);
    document.body.appendChild(emailDom);

    if (selectedId) selectEmail(visibleEmails[0]);

    function selectEmail(email) {
      email.read = true;
      StateManager.markEmailRead(email.id);
      refreshBadge();
      const pane = document.getElementById('email-content-pane');
      if (!pane) return;
      const anomStyle = email.anomalous ? 'background:#1a1a0a;border-left:2px solid #4a4a20;padding-left:14px;' : '';
      pane.innerHTML = `
        <div style="border-bottom:1px solid #2a2a2e;padding-bottom:12px;margin-bottom:16px;">
          <div style="font-size:13px;color:#d4a853;margin-bottom:6px;">${email.subject || '(no subject)'}</div>
          <div style="font-size:11px;color:#5a5a5f;">from: ${email.from}</div>
          <div style="font-size:11px;color:#5a5a5f;">date: ${email.date}</div>
        </div>
        <div style="font-size:12px;color:#c8c0a0;line-height:1.8;white-space:pre-wrap;${anomStyle}">${email.body}</div>
      `;
      // Fenn's anomalous email triggers note
      if (email.anomalous && !StateManager.hasFlag('fenn_email_noted')) {
        StateManager.flag('fenn_email_noted');
        StateManager.addMarenNote('Fenn\'s email refers to me as "the subject." Not my name. "The subject." The email also says it was not intended for me.\n\nI received it. It came to my inbox. How was it not intended for me?\n\nAlso: "layer 4 exposure duration affects layer 0 integrity." They know about the corruption. They haven\'t mentioned it until now.');
      }
      // Reveal Ros automated emails
      if (email.id === 'ros_checkin_2' && !StateManager.hasFlag('ros_timing_noticed')) {
        StateManager.flag('ros_timing_noticed');
        StateManager.addMarenNote('Ros\'s email arrived at 9:04am. I visited Layer 2 at 9:02am. The email is a check-in about Layer 2.\n\nShe either knew I was going to Layer 2 before I went, or this email was pre-written and auto-triggered.\n\nI\'m going to assume the second one. I\'m going to keep assuming that.');
      }
    }
  }

  return {
    init(parentScene) {
      scene = parentScene;
      const { width, height } = scene.scale;

      gDesktop = scene.add.graphics().setDepth(1);
      gTaskbar = scene.add.graphics().setDepth(2);

      drawDesktop();
      drawTaskbar();

      // OS label
      scene.add.text(14, height - TASKBAR_H + 9, '◈ CADENCEOS', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: Palette.toCSS(Palette.L0.textDim),
        letterSpacing: 2,
      }).setDepth(3);

      // Clock
      clockText = scene.add.text(width - 80, height - TASKBAR_H + 9, '', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: Palette.toCSS(Palette.L0.textDim),
      }).setDepth(3);

      // Icon texts
      ICONS.forEach((icon) => {
        const pos = getIconPos(icon, width, height);
        const sym = scene.add.text(pos.x + ICON_SIZE/2, pos.y + 14, icon.symbol, {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: icon.anomalous ? '#c8c840' : Palette.toCSS(Palette.L0.accent),
        }).setOrigin(0.5, 0).setDepth(3).setInteractive({ cursor: 'pointer' });

        const lbl = scene.add.text(pos.x + ICON_SIZE/2, pos.y + ICON_SIZE - 6, icon.label, {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: icon.anomalous ? '#9a9a30' : Palette.toCSS(Palette.L0.textDim),
        }).setOrigin(0.5, 0).setDepth(3);

        sym.on('pointerdown', () => this.handleIconClick(icon.id));
        sym.on('pointerover', () => sym.setStyle({ color: '#ffffff' }));
        sym.on('pointerout', () => sym.setStyle({ color: icon.anomalous ? '#c8c840' : Palette.toCSS(Palette.L0.accent) }));

        iconGraphics.push(sym);
        iconTexts.push(lbl);
      });

      // Email badge
      const firstIcon = ICONS.find(i => i.id === 'email');
      if (firstIcon) {
        const pos = getIconPos(firstIcon, width, height);
        emailBadge = scene.add.text(pos.x + ICON_SIZE - 4, pos.y + 2, '', {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: '#ffffff',
          backgroundColor: '#c0392b',
          padding: { x: 3, y: 1 },
        }).setDepth(4).setVisible(false);
      }

      // ── Rehydrate from saved state ─────────────────────────────────
      // Restore email read/date state from persisted records so the
      // inbox reflects what the player saw in previous sessions.

      // First email always has a date (arrived before the session)
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
      if (!EMAILS[0].date) EMAILS[0].date = threeDaysAgo.toLocaleString();

      // Restore date/read for trigger-flag emails
      const savedReceived = StateManager.get('emailsReceived') || [];
      const savedReadIds  = StateManager.get('emailsRead')     || [];

      savedReceived.forEach(saved => {
        const live = EMAILS.find(e => e.id === saved.id);
        if (live && saved.date && !live.date) live.date = saved.date;
      });
      savedReadIds.forEach(id => {
        const live = EMAILS.find(e => e.id === id);
        if (live) live.read = true;
      });

      // Re-spawn anomaly desktop icons that were triggered in a previous session
      ['anomaly_file_1', 'anomaly_file_2', 'anomaly_file_3'].forEach(aId => {
        if (StateManager.hasFlag(aId) && !ICONS.find(i => i.id === 'anomaly_' + aId)) {
          spawnAnomalyFile(aId);
        }
      });

      refreshBadge();

      // Start clock update
      scene.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => this.updateClock(),
      });
      this.updateClock();
    },

    handleIconClick(iconId) {
      switch (iconId) {
        case 'browser':
          if (BrowserEngine.isOpen()) BrowserEngine.close();
          else BrowserEngine.open(scene);
          break;
        case 'terminal':
          if (Terminal.isOpen()) Terminal.close();
          else Terminal.open(scene, 60, 60, 560, 380);
          break;
        case 'files':
          if (FileManager.isOpen()) FileManager.close();
          else FileManager.open(scene);
          break;
        case 'email':
          if (!emailOpen) openEmailDom();
          break;
        case 'pilgrim':
          if (PuzzleManager.isSolved('zip_password')) {
            EventBus.emit('layer:transition_start', { to: 1 });
          } else {
            Terminal.open(scene, 60, 60, 560, 380);
            setTimeout(() => Terminal.addLine('hint: open PILGRIM_backup.zip to launch PILGRIM'), 200);
          }
          break;
        default:
          if (iconId.startsWith('anomaly_')) {
            const id = iconId.replace('anomaly_', '');
            const f = CorruptionTracker.getAnomalyFile(id);
            if (f) {
              Terminal.open(scene, 60, 60, 560, 380);
              setTimeout(() => {
                Terminal.addLine(`[${f.name}]\n\n${f.content}\n`);
                StateManager.addMarenNote(f.note);
              }, 200);
            }
          }
      }
    },

    updateClock() {
      if (!clockText) return;
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      clockText.setText(`${h}:${m}`);

      // Corruption: clock shows wrong year at high corruption
      if (StateManager.get('corruption') > 0.7 && Math.random() < 0.02) {
        clockText.setText(`1991`);
        scene.time.delayedCall(200, () => {
          if (clockText) clockText.setText(`${h}:${m}`);
        });
      }
    },

    showEmailNotification(email) {
      // Flash the email badge and briefly show a toast notification
      refreshBadge();
      if (!scene) return;
      const { width, height } = scene.scale;

      const toast = document.createElement('div');
      toast.style.cssText = `
        position:absolute;right:20px;bottom:50px;
        background:#1c1c1e;border:1px solid #d4a853;border-radius:6px;
        padding:10px 16px;font-family:monospace;font-size:12px;
        color:#d4a853;z-index:2000;max-width:320px;
        box-shadow:0 4px 16px rgba(0,0,0,0.5);
        animation:fadeInUp 0.3s ease;
      `;
      toast.innerHTML = `
        <div style="font-size:10px;color:#5a5a5f;margin-bottom:4px;">NEW EMAIL</div>
        <div style="color:#e5e0d5;">${email.subject || '(no subject)'}</div>
        <div style="font-size:10px;color:#5a5a5f;margin-top:3px;">from: ${email.from}</div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        setTimeout(() => toast.remove(), 500);
      }, 4000);
    },

    update() {
      // Per-frame glitch
      if (CorruptionTracker.shouldGlitchFrame() && gDesktop && scene) {
        const { width, height } = scene.scale;
        const glitchY = Phaser.Math.Between(0, height);
        const glitchH = Phaser.Math.Between(1, 3);
        gDesktop.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.01, 0.05));
        gDesktop.fillRect(0, glitchY, width, glitchH);
      }
    },

    destroy() {
      scene = null;
      if (emailDom) { emailDom.remove(); emailDom = null; }
      emailOpen = false;
      iconGraphics = [];
      iconTexts = [];
      clockText = null;
      emailBadge = null;
    }
  };
})();
