/**
 * STRATA — Layer2Scene
 * The Workshop — Ida Crane's development environment, preserved mid-construction.
 * IDE / file browser aesthetic. Quiet revelation.
 * Maren's notes begin appearing here as found documents.
 */
class Layer2Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Layer2Scene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    StateManager.enterLayer(2);
    TransitionEngine.init(this);

    const g = this.add.graphics();

    // Dark IDE background
    g.fillStyle(0x1a1e26, 1);
    g.fillRect(0, 0, W, H);

    // Left sidebar — file tree
    g.fillStyle(0x141720, 1);
    g.fillRect(0, 0, 240, H);
    g.lineStyle(1, 0x2a3040, 1);
    g.lineBetween(240, 0, 240, H);

    // Bottom panel
    g.fillStyle(0x111418, 1);
    g.fillRect(0, H - 140, W, 140);
    g.lineStyle(1, 0x2a3040, 1);
    g.lineBetween(0, H - 140, W, H - 140);

    // Top tab bar
    g.fillStyle(0x141720, 1);
    g.fillRect(240, 0, W - 240, 32);
    g.lineStyle(1, 0x2a3040, 1);
    g.lineBetween(240, 32, W, 32);

    // Draw file tree
    this._drawFileTree(g, W, H);

    // Active file — Ida's notes
    this._drawActiveFile(W, H);

    // Bottom terminal / log panel
    this._drawLogPanel(W, H);

    // Title bar
    this.add.text(W / 2, 16, 'WORKSHOP — PILGRIM SOURCE ARCHIVE (READ-ONLY)', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#4a5568'
    }).setOrigin(0.5, 0.5);

    // HUD
    this._hud = new HUD(this, W, H);
    this._hud.init();

    // ESC returns to Layer 1 (or Layer 0 if came from there)
    this.input.keyboard.on('keydown-ESC', () => this._return());

    this._fadeIn(W, H);
    StateManager.save();
  }

  _drawFileTree(g, W, H) {
    const files = [
      { name: 'PILGRIM_src/', indent: 0, type: 'folder', open: true },
      { name: 'assets/', indent: 1, type: 'folder', open: true },
      { name: 'oswin_sprites/', indent: 2, type: 'folder' },
      { name: 'veldenmoor_tiles/', indent: 2, type: 'folder' },
      { name: 'audio/', indent: 2, type: 'folder' },
      { name: 'scripts/', indent: 1, type: 'folder', open: true },
      { name: 'oswin.as', indent: 2, type: 'file', ext: 'as' },
      { name: 'world_gen.as', indent: 2, type: 'file', ext: 'as' },
      { name: 'puzzle_logic.as', indent: 2, type: 'file', ext: 'as' },
      { name: 'canary.as', indent: 2, type: 'file', ext: 'as', anomaly: true },
      { name: 'notes/', indent: 1, type: 'folder', open: true },
      { name: 'ida_log_01.txt', indent: 2, type: 'file', ext: 'txt', active: true },
      { name: 'ida_log_02.txt', indent: 2, type: 'file', ext: 'txt' },
      { name: 'ida_log_03.txt', indent: 2, type: 'file', ext: 'txt' },
      { name: 'TODO.txt', indent: 2, type: 'file', ext: 'txt' },
      { name: 'client_brief.txt', indent: 2, type: 'file', ext: 'txt' },
      { name: 'DO_NOT_OPEN.txt', indent: 2, type: 'file', ext: 'txt', anomaly: true },
      { name: 'build/', indent: 1, type: 'folder' },
      { name: 'README.txt', indent: 0, type: 'file', ext: 'txt' },
      { name: '..hidden/', indent: 0, type: 'folder', anomaly: true },
    ];

    const fileColors = { as: 0x61afef, txt: 0x98c379, folder: 0xe5c07b };
    const anomalyColor = 0xe06c75;

    this.add.text(16, 12, 'EXPLORER', {
      fontFamily: 'monospace', fontSize: '10px', color: '#4a5568'
    });

    files.forEach((f, i) => {
      const fy = 36 + i * 22;
      const fx = 16 + f.indent * 16;
      const color = f.anomaly ? '#e06c75' : (f.active ? '#abb2bf' : '#5a6577');
      const prefix = f.type === 'folder' ? (f.open ? '▼ ' : '▶ ') : '  ';
      const icon = f.type === 'folder' ? '📁' : '';

      // Active file highlight
      if (f.active) {
        g.fillStyle(0x2c313a, 1);
        g.fillRect(0, fy - 2, 240, 20);
      }

      this.add.text(fx, fy, prefix + f.name, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: f.anomaly ? '#e06c75' : (f.active ? '#abb2bf' : '#5a6577')
      }).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        this._openFile(f.name);
      });
    });
  }

  _drawActiveFile(W, H) {
    const editorX = 260;
    const editorY = 50;
    const editorW = W - editorX - 20;

    // Tab
    const tab = this.add.graphics();
    tab.fillStyle(0x1a1e26, 1);
    tab.fillRect(240, 0, 160, 32);
    tab.lineStyle(1, 0x61afef, 0.5);
    tab.lineBetween(240, 31, 400, 31);
    this.add.text(258, 10, '● ida_log_01.txt', {
      fontFamily: 'monospace', fontSize: '11px', color: '#abb2bf'
    });

    // Line numbers + content
    const lines = [
      { num: 1,  text: '// ida_log_01.txt — personal notes, not for client', color: '#5c6370' },
      { num: 2,  text: '// started: march 2007', color: '#5c6370' },
      { num: 3,  text: '', color: '#abb2bf' },
      { num: 4,  text: "day 1. lumen gave me a brief that doesn't quite add up.", color: '#abb2bf' },
      { num: 5,  text: "they want a charming ARG. casual puzzles. a merchant character.", color: '#abb2bf' },
      { num: 6,  text: "something the community can sink their teeth into for years.", color: '#abb2bf' },
      { num: 7,  text: "that part I understand. the tech stack is what's strange.", color: '#abb2bf' },
      { num: 8,  text: '', color: '#abb2bf' },
      { num: 9,  text: "they want the game to run on 'existing infrastructure.'", color: '#abb2bf' },
      { num: 10, text: "I asked what that meant. Dr. Fenn said: 'a distributed archive.", color: '#abb2bf' },
      { num: 11, text: "very stable. been running a long time. treat it like a server.'", color: '#abb2bf' },
      { num: 12, text: '', color: '#abb2bf' },
      { num: 13, text: "I asked if I could see the server specs. Fenn said not necessary.", color: '#98c379' },
      { num: 14, text: "Ros said 'it's a legacy system, just build on top, don't look down.'", color: '#98c379' },
      { num: 15, text: '', color: '#abb2bf' },
      { num: 16, text: "don't look down.", color: '#e5c07b' },
      { num: 17, text: "interesting choice of words.", color: '#e5c07b' },
      { num: 18, text: '', color: '#abb2bf' },
      { num: 19, text: "starting on Oswin today. they gave me a 'personality brief'", color: '#abb2bf' },
      { num: 20, text: "for the character. which is unusual. it reads less like", color: '#abb2bf' },
      { num: 21, text: "a game character and more like... a diplomatic protocol.", color: '#abb2bf' },
      { num: 22, text: "how to approach. what to acknowledge. what NOT to acknowledge.", color: '#e06c75' },
      { num: 23, text: '', color: '#abb2bf' },
      { num: 24, text: "// TODO: ask Fenn what 'memory persistence layer' means", color: '#5c6370' },
      { num: 25, text: "// in the context of a Flash game", color: '#5c6370' },
    ];

    // Scrollable text — for now static first page
    lines.forEach((line, i) => {
      // Line number
      this.add.text(editorX - 30, editorY + i * 18, String(line.num).padStart(3), {
        fontFamily: 'monospace', fontSize: '11px', color: '#3a4050'
      });
      // Content
      this.add.text(editorX, editorY + i * 18, line.text, {
        fontFamily: 'monospace', fontSize: '11px', color: line.color
      });
    });

    // Cursor blink at end
    const cursor = this.add.rectangle(editorX, editorY + lines.length * 18, 7, 14, 0xabb2bf, 0.8);
    this.tweens.add({
      targets: cursor, alpha: 0, duration: 530,
      yoyo: true, repeat: -1, ease: 'Stepped'
    });
  }

  _drawLogPanel(W, H) {
    const py = H - 138;
    this.add.text(16, py + 8, 'TERMINAL', {
      fontFamily: 'monospace', fontSize: '10px', color: '#4a5568'
    });
    this.add.text(80, py + 8, 'PROBLEMS  0', {
      fontFamily: 'monospace', fontSize: '10px', color: '#4a5568'
    });
    this.add.text(180, py + 8, 'OUTPUT', {
      fontFamily: 'monospace', fontSize: '10px', color: '#4a5568'
    });

    const logLines = [
      { text: "$ archive_mount PILGRIM_src/ --read-only", color: '#abb2bf' },
      { text: "  → mounted. 847 files indexed.", color: '#98c379' },
      { text: "$ scan --depth 1", color: '#abb2bf' },
      { text: "  → layer 1 (PILGRIM surface): intact", color: '#98c379' },
      { text: "  → layer 2 (workshop): partially intact (87%)", color: '#e5c07b' },
      { text: "  → layer 3 (meridian): READ ERROR — access requires depth clearance", color: '#e06c75' },
      { text: "  → layer 4: NOT INDEXED", color: '#e06c75' },
      { text: "$ _", color: '#61afef' },
    ];

    logLines.forEach((l, i) => {
      this.add.text(16, py + 28 + i * 14, l.text, {
        fontFamily: 'monospace', fontSize: '10px', color: l.color
      });
    });
  }

  _openFile(name) {
    // Future: open different files. For now just log
    StateManager.addMarenNote(`opened: ${name} in the Workshop.`);
    if (name === 'canary.as') {
      StateManager.flag('canary_script_found');
      EventBus.emit('puzzle:canary_seen');
    }
    if (name === 'DO_NOT_OPEN.txt') {
      StateManager.flag('do_not_open_found');
    }
  }

  _fadeIn(W, H) {
    const overlay = this.add.graphics().setDepth(1000);
    overlay.fillStyle(0x1a1e26, 1);
    overlay.fillRect(0, 0, W, H);
    this.tweens.addCounter({
      from: 1, to: 0, duration: 900, ease: 'Sine.easeOut',
      onUpdate: (tween) => {
        overlay.clear();
        overlay.fillStyle(0x1a1e26, tween.getValue());
        overlay.fillRect(0, 0, W, H);
      },
      onComplete: () => overlay.clear()
    });
  }

  _return() {
    this.input.keyboard.enabled = false;
    const from = StateManager.get('deepestLayer') >= 3 ? 3 : 1;
    TransitionEngine.transition(this, 2, from,
      () => this.scene.start(from === 3 ? 'Layer3Scene' : 'Layer1Scene'),
      null
    );
  }

  update(time, delta) {
    StateManager.tickPlayTime(delta);
  }

  shutdown() {
    StateManager.save();
  }
}
