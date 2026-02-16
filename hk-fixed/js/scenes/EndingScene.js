/* js/scenes/EndingScene.js — Two endings: Sealed and Dream No More */
'use strict';

class EndingScene extends Phaser.Scene {
  constructor() { super('Ending'); }

  init(data) {
    this._type = data.type ?? 'sealed'; // 'sealed' | 'dream_no_more'
  }

  create() {
    const W = C.WIDTH, H = C.HEIGHT;
    AUDIO_ENGINE.resume();

    // Full black
    this.add.rectangle(0, 0, W*C.SCALE, H*C.SCALE, 0x000000).setOrigin(0);

    if (this._type === 'dream_no_more') {
      this._buildDreamNoMore();
    } else {
      this._buildSealed();
    }
  }

  _buildSealed() {
    const W = C.WIDTH, H = C.HEIGHT;
    // Fade in darkness with small void glow
    const g = this.add.graphics().setScrollFactor(0);
    g.fillStyle(0x000000); g.fillRect(0,0,W,H);

    const glow = this.add.graphics().setScrollFactor(0);
    this.tweens.add({
      targets:{t:0}, t:1, duration:3000, yoyo:true, repeat:-1,
      onUpdate:(tw)=>{
        glow.clear();
        const t=tw.getValue();
        glow.fillStyle(0x4400aa, t*0.3);
        glow.fillCircle(W/2, H*0.55, 20+t*15);
      }
    });

    this.add.text(W/2, H*0.3, 'THE HOLLOW KNIGHT', {
      fontFamily:'Cinzel',fontSize: 33,color:'#888888',letterSpacing:8,
    }).setScrollFactor(0).setOrigin(0.5).setAlpha(0);

    this.add.text(W/2, H*0.45, 'A new seal is made.', {
      fontFamily:'IM Fell English',fontStyle:'italic',fontSize: 24,color:'#666666',
    }).setScrollFactor(0).setOrigin(0.5).setAlpha(0);

    this.add.text(W/2, H*0.55, 'Hallownest endures.', {
      fontFamily:'IM Fell English',fontStyle:'italic',fontSize: 24,color:'#555555',
    }).setScrollFactor(0).setOrigin(0.5).setAlpha(0);

    this.add.text(W/2, H*0.68, 'SEALED', {
      fontFamily:'Cinzel',fontSize: 27,color:'#4400aa',letterSpacing:12,
    }).setScrollFactor(0).setOrigin(0.5).setAlpha(0);

    const allText = this.children.list.filter(c => c.type==='Text');
    this.tweens.add({
      targets: allText, alpha:1, duration:2000, delay:1500, ease:'Sine.easeIn',
    });

    this.time.delayedCall(7000, () => this._toCredits());
  }

  _buildDreamNoMore() {
    const W = C.WIDTH, H = C.HEIGHT;
    // Bright white flash → fades to peaceful
    const flashRect = this.add.rectangle(W/2, H/2, W, H, 0xffffff).setScrollFactor(0);
    this.tweens.add({
      targets: flashRect, alpha:0, duration:3000, delay:500, ease:'Sine.easeOut',
    });

    // Soft dawn colour
    const dawn = this.add.graphics().setScrollFactor(0);
    dawn.setAlpha(0);
    dawn.fillGradientStyle(0x220a00,0x220a00,0x0a0008,0x0a0008,1);
    dawn.fillRect(0,0,W,H);
    this.tweens.add({ targets:dawn, alpha:1, duration:3000, delay:2000 });

    // Stars slowly appearing
    this.time.delayedCall(3000, () => {
      for(let i=0;i<30;i++){
        const star = this.add.graphics().setScrollFactor(0);
        star.fillStyle(0xffffff,0.6); star.fillCircle(0,0,0.5);
        star.setPosition(Math.random()*W, Math.random()*H*0.7);
        star.setAlpha(0);
        this.tweens.add({
          targets:star, alpha:{from:0,to:0.6}, duration:1200,
          delay: i*80, yoyo:true, repeat:-1,
        });
      }
    });

    const lines = [
      { y:0.25, text:'The light is gone.', size:30, color:'#ccbbaa', delay:3500 },
      { y:0.38, text:'For the first time in an age,', size:21, color:'#998877', delay:4500 },
      { y:0.47, text:'Hallownest is quiet.', size:21, color:'#998877', delay:5200 },
      { y:0.62, text:'DREAM NO MORE', size:30, color:'#e8d090', delay:6500, spacing:10 },
    ];

    for (const l of lines) {
      const t = this.add.text(W/2, H*l.y, l.text, {
        fontFamily: l.size>8?'Cinzel':'IM Fell English',
        fontStyle: l.size<=8?'italic':'normal',
        fontSize: l.size, color: l.color,
        letterSpacing: l.spacing??2,
      }).setScrollFactor(0).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets:t, alpha:1, duration:1800, delay:l.delay, ease:'Sine.easeIn' });
    }

    this.time.delayedCall(10000, () => this._toCredits());
  }

  _toCredits() {
    this.cameras.main.fade(1200, 0,0,0, false, (cam, progress) => {
      if(progress===1) this.scene.start('Credits');
    });
  }
}


/* ── CreditsScene ──────────────────────────────────────────────────────────── */
class CreditsScene extends Phaser.Scene {
  constructor() { super('Credits'); }

  create() {
    const W = C.WIDTH, H = C.HEIGHT;

    this.add.rectangle(0,0,W*C.SCALE,H*C.SCALE,0x000000).setOrigin(0);

    const creditsText = [
      { text:'HOLLOW KNIGHT',       size:42, color:'#d4cfc9', spacing:10, gap:20 },
      { text:'Web Clone',           size:24,  color:'#666666', gap:24 },
      { text:'DESIGN & CODE',       size:21,  color:'#5ae3e3', gap:6 },
      { text:'Built with Claude',   size:18,  color:'#888888', gap:18 },
      { text:'ENGINE',              size:21,  color:'#5ae3e3', gap:6 },
      { text:'Phaser 3.60',         size:18,  color:'#888888', gap:18 },
      { text:'ORIGINAL GAME',       size:21,  color:'#5ae3e3', gap:6 },
      { text:'Team Cherry',         size:18,  color:'#888888', gap:4 },
      { text:'Ari Gibson & William Pellen', size:18, color:'#666666', gap:18 },
      { text:'MUSIC',               size:21,  color:'#5ae3e3', gap:6 },
      { text:'Procedural Web Audio API',size:18,color:'#888888', gap:18 },
      { text:'AREAS IMPLEMENTED',   size:21,  color:'#5ae3e3', gap:6 },
      { text:'Forgotten Crossroads',size:18,  color:'#888888', gap:4 },
      { text:'Greenpath',           size:18,  color:'#888888', gap:4 },
      { text:'City of Tears',       size:18,  color:'#888888', gap:4 },
      { text:'Soul Sanctum',        size:18,  color:'#888888', gap:4 },
      { text:'Fungal Wastes',       size:18,  color:'#888888', gap:4 },
      { text:'Mantis Village',      size:18,  color:'#888888', gap:4 },
      { text:'Ancient Basin',       size:18,  color:'#888888', gap:4 },
      { text:'The Abyss',           size:18,  color:'#888888', gap:18 },
      { text:'BOSSES',              size:21,  color:'#5ae3e3', gap:6 },
      { text:'False Knight  ·  Gruz Mother  ·  Vengefly King', size:18, color:'#888888', gap:4 },
      { text:'Soul Master  ·  Mantis Lords', size:18, color:'#888888', gap:4 },
      { text:'Hollow Knight  ·  The Radiance', size:18, color:'#888888', gap:18 },
      { text:'Thank you for playing.', size:24, color:'#d4cfc9', gap:20 },
      { text:'— Press any key to return to menu —', size:15, color:'#444444', gap:0 },
    ];

    let totalH = H + 20;
    const objs = [];
    for (const l of creditsText) {
      const t = this.add.text(W/2, totalH, l.text, {
        fontFamily: l.size>=10?'Cinzel':'IM Fell English',
        fontSize: l.size, color: l.color,
        letterSpacing: l.spacing??1, align:'center',
      }).setScrollFactor(0).setOrigin(0.5);
      objs.push(t);
      totalH += l.size * 1.6 + l.gap;
    }

    // Scroll up
    const scrollDist = totalH + 20;
    this.tweens.add({
      targets: objs,
      y: `+=${-scrollDist - H}`,
      duration: scrollDist * 60,
      ease: 'Linear',
    });

    // Return to menu on any key
    this.input.keyboard.once('keydown', () => this._returnToMenu());
    this.input.once('pointerdown', () => this._returnToMenu());
    this.time.delayedCall(scrollDist * 60 + 1000, () => this._returnToMenu());
  }

  _returnToMenu() {
    SaveSystem.clear();
    this.cameras.main.fade(600,0,0,0,false,(cam,p)=>{
      if(p===1) this.scene.start('MainMenu');
    });
  }
}
