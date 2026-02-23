// ============================================================
//  AXIOM BREAK — MenuScene.js  [PHASE 3 REPLACEMENT]
//  Adds: Leaderboard button, high score preview, upgrade hint
// ============================================================

class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'Menu' }); }

  create() {
    HUD.hide();
    AudioSynth.stopMusic();
    AudioSynth.playMusic('ambient');

    const W = AXIOM.WIDTH, H = AXIOM.HEIGHT;
    const g = this.add.graphics();

    // Background
    g.fillStyle(AXIOM.COLORS.BG, 1);
    g.fillRect(0, 0, W, H);

    // Animated grid
    this._gridLines = [];
    for (let x = 0; x < W; x += 48) {
      const ln = this.add.graphics().lineStyle(1, 0x00f5ff, 0.05).strokeLineShape({x1:x,y1:0,x2:x,y2:H});
      this._gridLines.push(ln);
    }
    for (let y = 0; y < H; y += 48) {
      const ln = this.add.graphics().lineStyle(1, 0x00f5ff, 0.05).strokeLineShape({x1:0,y1:y,x2:W,y2:y});
      this._gridLines.push(ln);
    }

    // Center title box
    const boxG = this.add.graphics();
    boxG.lineStyle(1, 0x00f5ff, 0.4).strokeRect(W/2-220, H/2-150, 440, 200);
    boxG.lineStyle(1, 0x00f5ff, 0.12).strokeRect(W/2-214, H/2-144, 428, 188);

    // Corner marks
    const corners = [[W/2-220,H/2-150,1,1],[W/2+220,H/2-150,-1,1],[W/2-220,H/2+50,1,-1],[W/2+220,H/2+50,-1,-1]];
    for (const [cx,cy,ax,ay] of corners) {
      boxG.lineStyle(2,0x00f5ff,1);
      boxG.strokeLineShape({x1:cx,y1:cy,x2:cx+ax*20,y2:cy});
      boxG.strokeLineShape({x1:cx,y1:cy,x2:cx,y2:cy+ay*20});
    }

    // Title
    this.add.text(W/2, H/2-92, 'AXIOM', {
      fontFamily:'Orbitron, monospace', fontSize:'64px', fontStyle:'bold',
      color:'#00f5ff', stroke:'#003344', strokeThickness:4,
      shadow:{blur:30,color:'#00f5ff',fill:true},
    }).setOrigin(0.5);

    this.add.text(W/2, H/2-32, 'BREAK', {
      fontFamily:'Orbitron, monospace', fontSize:'32px', fontStyle:'bold',
      color:'#ffffff', stroke:'#003344', strokeThickness:3,
      shadow:{blur:15,color:'#00f5ff',fill:true},
    }).setOrigin(0.5);

    this.add.text(W/2, H/2+8, 'SIGNAL SPLICE PROTOCOL — PHASE 3', {
      fontFamily:"'Share Tech Mono', monospace", fontSize:'10px', color:'#006688', letterSpacing:3,
    }).setOrigin(0.5);

    // Start prompt
    const startText = this.add.text(W/2, H/2+70, '[  PRESS SPACE TO BEGIN NEW RUN  ]', {
      fontFamily:'Orbitron, monospace', fontSize:'13px', color:'#00f5ff',
    }).setOrigin(0.5);
    this.tweens.add({ targets:startText, alpha:{from:1,to:0.15}, duration:900, yoyo:true, repeat:-1 });

    // [P3] Leaderboard button
    const lbText = this.add.text(W/2, H/2+105, '[L]  VIEW LEADERBOARD', {
      fontFamily:"'Share Tech Mono', monospace", fontSize:'10px', color:'#005566', letterSpacing:2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    lbText.on('pointerover', () => lbText.setColor('#00f5ff'));
    lbText.on('pointerout',  () => lbText.setColor('#005566'));
    lbText.on('pointerdown', () => this._goLeaderboard());

    // [P3] Top score preview
    this._drawTopScorePreview(W, H);

    // Version
    this.add.text(W-10, H-10, 'v3.0 — PHASE 3', {
      fontFamily:"'Share Tech Mono', monospace", fontSize:'9px', color:'#002233',
    }).setOrigin(1,1);

    // Controls
    this.add.text(W/2, H-28,
      'WASD/MOVE · LMB/SHOOT · E/RECORD · R/DEPLOY · SHIFT/DASH · TAB/MAP · M/MUTE',
      { fontFamily:"'Share Tech Mono', monospace", fontSize:'8px', color:'#003344' }
    ).setOrigin(0.5);

    // Input
    this.input.keyboard.once('keydown-SPACE', () => {
      Progression.reset();
      this.scene.start('Game', { levelIndex: 0, score: 0 });
    });
    this.input.keyboard.once('keydown-L', () => this._goLeaderboard());

    // Ambient particles
    this._spawnAmbient();
  }

  _drawTopScorePreview(W, H) {
    const entries = Leaderboard.getTop(3);
    if (entries.length === 0) return;

    this.add.text(32, H - 70, 'TOP SCORES', {
      fontFamily:"'Share Tech Mono', monospace", fontSize:'8px', color:'#003344', letterSpacing:2,
    });

    entries.forEach((e, i) => {
      this.add.text(32, H - 55 + i * 14,
        `${String(i+1).padStart(2,'0')}.  ${e.initials}  ${Utils.formatScore(e.score)}  SEC ${e.level||0}`,
        { fontFamily:"'Share Tech Mono', monospace", fontSize:'9px', color: i===0 ? '#00aabb' : '#334455' }
      );
    });
  }

  _goLeaderboard() {
    this.scene.start('Leaderboard', { score: 0, level: 0, fromGame: false });
  }

  _spawnAmbient() {
    this.time.addEvent({
      delay: 120, loop: true,
      callback: () => {
        const x = Phaser.Math.Between(0, AXIOM.WIDTH);
        const dot = this.add.graphics();
        dot.fillStyle(0x00f5ff, Phaser.Math.FloatBetween(0.1, 0.5));
        dot.fillCircle(x, 0, Phaser.Math.Between(1,3));
        this.tweens.add({
          targets: dot, y: AXIOM.HEIGHT, alpha: 0,
          duration: Phaser.Math.Between(1500,3500), ease:'Linear',
          onComplete: ()=>dot.destroy(),
        });
      }
    });
  }
}
