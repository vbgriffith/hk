/* js/entities/enemies/PhaseIIIEnemies.js — All Phase III–V enemies */
'use strict';

/* ─────────────────────────── GREAT HOPPER ──────────────────────────────── */
class GreatHopper extends Entity {
  constructor(scene, x, y, data = {}) {
    super(scene, x, y, 'great_hopper', 0);
    this.hp = 35; this.dmg = 15; this.geoReward = 6;
    this._aiState = 'idle'; this._aiTimer = 0; this._hitPlayer = false;
    this.setSize(20, 20, 6, 12); this.sprite.setGravityY(C.GRAVITY);
    this._play('idle');
  }
  update(dt) {
    if (!this.alive) return;
    this._aiTimer -= dt;
    const p = this.scene.knight;
    if (!p) return;
    this.sprite.setFlipX(p.x < this.x);
    if (this._aiState === 'idle') {
      this.body.setVelocityX(0);
      if (this._aiTimer <= 0) {
        const dx = Math.abs(p.x - this.x);
        if (dx < 200) this._hop(p);
        else          this._aiTimer = 0.8;
      }
    } else if (this._aiState === 'hop') {
      if (!this._hitPlayer) {
        const dx = Math.abs(p.x-this.x), dy=Math.abs(p.y-this.y);
        if (dx < 22 && dy < 22) { p.onHit(this.dmg, this); this._hitPlayer = true; }
      }
      if (this.body.blocked.down) { this._hitPlayer=false; this._setState('idle'); }
      if (this._aiTimer <= 0)     { this._setState('idle'); }
    }
  }
  _hop(p) {
    this._aiState = 'hop'; this._aiTimer = 1.2;
    const dir = Math.sign(p.x - this.x);
    this.body.setVelocity(dir * 160, -360);
    this._play('jump');
  }
  _setState(n) {
    this._aiState = n;
    if (n==='idle') { this._aiTimer = Phaser.Math.Between(4,8)/10; this._play('idle'); }
  }
  onHit(d, src) {
    if (!this.alive) return; this.hp -= d;
    this.sprite.setTint(0xffffff); this.later(80, ()=>this.sprite.clearTint());
    if (this.hp <= 0) { this.alive=false; this.body.setEnable(false);
      AnimationManager.playThen(this.sprite,'great_hopper_death',()=>{this.scene.spawnGeo(this.x,this.y,this.geoReward);this.destroy();}); }
  }
  _play(n) { AnimationManager.safePlay(this.sprite,`great_hopper_${n}`); }
}

/* ─────────────────────────── WINGED FOOL ───────────────────────────────── */
class WingedFool extends Entity {
  constructor(scene, x, y, data = {}) {
    super(scene, x, y, 'winged_fool', 0);
    this.hp = 28; this.dmg = 12; this.geoReward = 4;
    this._homeX = x; this._homeY = y; this._aiState = 'patrol';
    this._aiTimer = 0; this._hoverT = Math.random()*Math.PI*2;
    this._diveTarget = null; this._retreatCd = 0; this._diveHit = false;
    this.setSize(14,14,7,7); this.body.setAllowGravity(false);
    this._play('fly');
  }
  update(dt) {
    if (!this.alive) return;
    this._aiTimer -= dt; this._retreatCd -= dt;
    this._hoverT += dt * 1.6;
    const p = this.scene.knight;
    if (!p) return;
    this.sprite.setFlipX(p.x < this.x);
    if (this._aiState === 'patrol') {
      const tx = this._homeX + Math.cos(this._hoverT*0.4)*40;
      const ty = this._homeY + Math.sin(this._hoverT*0.6)*15;
      this.body.setVelocity((tx-this.x)*1.5, (ty-this.y)*1.5);
      const pdist = Math.hypot(p.x-this.x, p.y-this.y);
      if (pdist<130 && this._retreatCd<=0 && Math.abs(p.x-this.x)<35) {
        this._diveTarget = {x:p.x,y:p.y}; this._aiState='dive'; this._aiTimer=0.6; this._play('dive');
      }
    } else if (this._aiState === 'dive') {
      if (!this._diveTarget) { this._aiState='patrol'; return; }
      const dx=this._diveTarget.x-this.x, dy=this._diveTarget.y-this.y;
      const dist=Math.hypot(dx,dy)||1;
      this.body.setVelocity((dx/dist)*180, (dy/dist)*180);
      if (!this._diveHit && Math.abs(p.x-this.x)<16 && Math.abs(p.y-this.y)<16) {
        p.onHit(this.dmg,this); this._diveHit=true;
      }
      if (dist<18 || this._aiTimer<=0) {
        this._diveHit=false; this._retreatCd=1.6; this._aiState='retreat'; this._aiTimer=1.0; this._play('fly');
      }
    } else if (this._aiState === 'retreat') {
      const dx=this._homeX-this.x, dy=this._homeY-this.y;
      const dist=Math.hypot(dx,dy)||1;
      this.body.setVelocity((dx/dist)*120,(dy/dist)*120);
      if (dist<20||this._aiTimer<=0) { this._diveTarget=null; this._aiState='patrol'; }
    }
  }
  onHit(d,src) {
    if (!this.alive) return; this.hp-=d;
    this.sprite.setTint(0xffffff); this.later(80,()=>this.sprite.clearTint());
    if (this.hp<=0){this.alive=false;this.body.setEnable(false);this.body.setAllowGravity(true);
      AnimationManager.playThen(this.sprite,'winged_fool_death',()=>{this.scene.spawnGeo(this.x,this.y,this.geoReward);this.destroy();}); }
  }
  _play(n){AnimationManager.safePlay(this.sprite,`winged_fool_${n}`);}
}

/* ─────────────────────────── SOUL TWISTER ──────────────────────────────── */
class SoulTwister extends Entity {
  constructor(scene, x, y, data={}) {
    super(scene, x, y, 'soul_twister', 0);
    this.hp=45; this.dmg=18; this.geoReward=8;
    this._aiState='idle'; this._aiTimer=0; this._shootCd=2.0;
    this.setSize(18,32,9,8); this.body.setAllowGravity(false);
    this._play('float');
  }
  update(dt) {
    if (!this.alive) return;
    this._aiTimer-=dt; this._shootCd-=dt;
    const p = this.scene.knight; if (!p) return;
    this._hoverT=(this._hoverT||0)+dt;
    this.sprite.y += Math.sin(this._hoverT*1.5)*0.35;
    this.sprite.setFlipX(p.x<this.x);
    const dist=Math.hypot(p.x-this.x,p.y-this.y);
    if (dist<180 && this._shootCd<=0) {
      const dx=p.x-this.x,dy=p.y-this.y,d=Math.hypot(dx,dy)||1,spd=120;
      this.scene.spawnProjectile({x:this.x,y:this.y,vx:(dx/d)*spd,vy:(dy/d)*spd,
        texture:'soul_orb',dmg:this.dmg,owner:'enemy',tint:0xeeeeff,lifespan:2200});
      this._shootCd=2.2; this._play('cast');
      this.later(400,()=>this._play('float'));
    }
    // Slow teleport away if player close
    if (dist<50 && this._aiTimer<=0) {
      this.sprite.x += Math.sign(this.x-p.x)*60;
      this._aiTimer=1.0;
    }
  }
  onHit(d,src) {
    if (!this.alive) return; this.hp-=d;
    this.sprite.setTint(0xffffff); this.later(80,()=>this.sprite.clearTint());
    if (this.hp<=0){this.alive=false;this.body.setEnable(false);
      AnimationManager.playThen(this.sprite,'soul_twister_death',()=>{this.scene.spawnGeo(this.x,this.y,this.geoReward);this.destroy();}); }
  }
  _play(n){AnimationManager.safePlay(this.sprite,`soul_twister_${n}`);}
}

/* ─────────────────────────── FUNGOON ───────────────────────────────────── */
class Fungoon extends Entity {
  constructor(scene, x, y, data={}) {
    super(scene, x, y, 'fungoon', 0);
    this.hp=26; this.dmg=12; this.geoReward=4;
    this.facingDir=data.dir??1; this.patrolLeft=x-80; this.patrolRight=x+80;
    this._aiState='walk'; this._aiTimer=0; this._spore=false;
    this.setSize(16,14,6,7); this.sprite.setGravityY(C.GRAVITY);
    this._play('walk');
  }
  update(dt) {
    if (!this.alive) return; this._aiTimer-=dt;
    const p=this.scene.knight; if (!p) return;
    this.sprite.setFlipX(this.facingDir<0);
    if (this._aiState==='walk') {
      this.body.setVelocityX(this.facingDir*45);
      if (this.x<=this.patrolLeft&&this.facingDir<0||this.x>=this.patrolRight&&this.facingDir>0) this.facingDir*=-1;
      if (Math.hypot(p.x-this.x,p.y-this.y)<90&&this._aiTimer<=0&&!this._spore) {
        this._aiState='spore'; this._aiTimer=0.6; this._play('spore'); this._spore=true;
      }
    } else if (this._aiState==='spore') {
      this.body.setVelocityX(0);
      if (this._aiTimer<=0) {
        if (!this._sporeFired) {
          this._sporeFired=true;
          for(let i=-1;i<=1;i++){
            this.scene.spawnProjectile({x:this.x,y:this.y-8,vx:i*40,vy:-100,
              texture:'spore_blob',dmg:this.dmg,owner:'enemy',tint:0x88ff44,lifespan:1400});
          }
          this._aiTimer=0.8;
        } else { this._sporeFired=false; this._spore=false; this._aiState='walk'; this._play('walk'); }
      }
    }
  }
  onHit(d,src) {
    if (!this.alive) return; this.hp-=d;
    this.sprite.setTint(0xffffff); this.later(80,()=>this.sprite.clearTint());
    if (this.hp<=0){this.alive=false;this.body.setEnable(false);
      this.scene.spawnGeo(this.x,this.y,this.geoReward); this.destroy(); }
  }
  _play(n){AnimationManager.safePlay(this.sprite,`fungoon_${n}`);}
}

/* ─────────────────────────── SHRUMAL OGRE ──────────────────────────────── */
class ShrumalOgre extends Entity {
  constructor(scene, x, y, data={}) {
    super(scene, x, y, 'shrumal_ogre', 0);
    this.hp=70; this.dmg=20; this.geoReward=12;
    this._aiState='idle'; this._aiTimer=0; this._hitPlayer=false;
    this.setSize(28,34,10,7); this.sprite.setGravityY(C.GRAVITY);
    this._play('idle');
  }
  update(dt) {
    if (!this.alive) return; this._aiTimer-=dt;
    const p=this.scene.knight; if (!p) return;
    this.sprite.setFlipX(p.x<this.x);
    const dx=Math.abs(p.x-this.x);
    if (this._aiState==='idle') {
      this.body.setVelocityX(0);
      if (this._aiTimer<=0) {
        if (dx<150) this._setState('charge');
        else        this._setState('walk');
      }
    } else if (this._aiState==='walk') {
      const dir=Math.sign(p.x-this.x);
      this.body.setVelocityX(dir*50);
      if (dx<90||this._aiTimer<=0) this._setState('idle');
    } else if (this._aiState==='charge') {
      if (!this._chargeStarted) { this._chargeStarted=true; this.body.setVelocityX(Math.sign(p.x-this.x)*220); }
      if (!this._hitPlayer&&Math.abs(p.x-this.x)<40) { p.onHit(this.dmg,this); this._hitPlayer=true; }
      if (this.body.blocked.left||this.body.blocked.right||this._aiTimer<=0) {
        this._chargeStarted=false;this._hitPlayer=false;this.body.setVelocityX(0);this._setState('idle');
      }
    }
  }
  _setState(n) {
    this._aiState=n; this._chargeStarted=false; this._hitPlayer=false;
    if (n==='idle') { this._aiTimer=0.7; this._play('idle'); }
    else if (n==='walk') { this._aiTimer=1.5; this._play('walk'); }
    else if (n==='charge') { this._aiTimer=0.4; this._play('charge'); }
  }
  onHit(d,src) {
    if (!this.alive) return; this.hp-=d;
    this.sprite.setTint(0xffffff); this.later(80,()=>this.sprite.clearTint());
    const kbDir=src?Math.sign(this.x-src.x):1; this.body.setVelocityX(kbDir*60);
    if (this.hp<=0){this.alive=false;this.body.setEnable(false);
      AnimationManager.playThen(this.sprite,'shrumal_ogre_death',()=>{this.scene.spawnGeo(this.x,this.y,this.geoReward);this.destroy();}); }
  }
  _play(n){AnimationManager.safePlay(this.sprite,`shrumal_ogre_${n}`);}
}

/* ─────────────────────────── MANTIS WARRIOR ────────────────────────────── */
class MantisWarrior extends Entity {
  constructor(scene, x, y, data={}) {
    super(scene, x, y, 'mantis_warrior', 0);
    this.hp=40; this.dmg=18; this.geoReward=8;
    this._aiState='idle'; this._aiTimer=0; this._hitPlayer=false; this._jumped=false;
    this.setSize(16,32,8,8); this.sprite.setGravityY(C.GRAVITY);
    this._play('idle');
  }
  update(dt) {
    if (!this.alive) return; this._aiTimer-=dt;
    const p=this.scene.knight; if (!p) return;
    this.sprite.setFlipX(p.x<this.x);
    const dx=p.x-this.x, absDx=Math.abs(dx);
    if (this._aiState==='idle') {
      this.body.setVelocityX(0);
      if (this._aiTimer<=0) {
        if (absDx<200) { this._aiState='jump'; this._jumped=false; this._play('jump'); }
        else { this._aiState='walk'; this._aiTimer=1.2; this._play('walk'); }
      }
    } else if (this._aiState==='walk') {
      this.body.setVelocityX(Math.sign(dx)*70);
      if (this._aiTimer<=0) { this._aiState='idle'; this._aiTimer=0.4; this._play('idle'); }
    } else if (this._aiState==='jump') {
      if (!this._jumped) {
        this._jumped=true;
        this.body.setVelocity(Math.sign(dx)*160, -420);
      }
      if (!this._hitPlayer&&Math.abs(p.x-this.x)<24&&Math.abs(p.y-this.y)<32) {
        p.onHit(this.dmg,this); this._hitPlayer=true;
      }
      if (this.body.blocked.down) { this._jumped=false;this._hitPlayer=false; this._aiState='idle';this._aiTimer=0.5;this._play('idle'); }
    }
  }
  onHit(d,src) {
    if (!this.alive) return; this.hp-=d;
    this.sprite.setTint(0xffffff); this.later(80,()=>this.sprite.clearTint());
    if (this.hp<=0){this.alive=false;this.body.setEnable(false);
      AnimationManager.playThen(this.sprite,'mantis_warrior_death',()=>{this.scene.spawnGeo(this.x,this.y,this.geoReward);this.destroy();}); }
  }
  _play(n){AnimationManager.safePlay(this.sprite,`mantis_warrior_${n}`);}
}

/* ─────────────────────────── PALE LURKER ───────────────────────────────── */
class PaleLurker extends Entity {
  constructor(scene, x, y, data={}) {
    super(scene, x, y, 'pale_lurker', 0);
    this.hp=30; this.dmg=20; this.geoReward=10;
    this._aiState='wait'; this._aiTimer=0; this._triggered=false;
    this.setSize(18,18,9,9); this.body.setAllowGravity(false);
    this.sprite.setAlpha(0.15);
    this._play('idle');
  }
  update(dt) {
    if (!this.alive) return; this._aiTimer-=dt;
    const p=this.scene.knight; if (!p) return;
    const dist=Math.hypot(p.x-this.x,p.y-this.y);
    if (!this._triggered&&dist<100) {
      this._triggered=true;
      this.scene.tweens.add({targets:this.sprite,alpha:1,duration:400});
      this._aiState='chase';
    }
    if (this._aiState==='chase') {
      const dx=p.x-this.x,dy=p.y-this.y,d=Math.hypot(dx,dy)||1;
      this.body.setVelocity((dx/d)*110,(dy/d)*110);
      if (Math.abs(dx)<18&&Math.abs(dy)<18) { p.onHit(this.dmg,this); this._aiState='retreat'; this._aiTimer=1.2; }
    } else if (this._aiState==='retreat') {
      const dir=Math.sign(this.x-p.x)||1;
      this.body.setVelocity(dir*90,-80);
      if (this._aiTimer<=0) { this._triggered=false; this._aiState='wait'; this.scene.tweens.add({targets:this.sprite,alpha:0.15,duration:600}); }
    }
  }
  onHit(d,src) {
    if (!this.alive) return; this.hp-=d;
    this.sprite.setTint(0xffffff); this.later(80,()=>this.sprite.clearTint());
    if (this.hp<=0){this.alive=false;this.body.setEnable(false);
      this.scene.spawnGeo(this.x,this.y,this.geoReward); this.destroy(); }
  }
  _play(n){AnimationManager.safePlay(this.sprite,`pale_lurker_${n}`);}
}

/* ─────────────────────────── UUMUU (mini-boss) ─────────────────────────── */
class Uumuu extends Entity {
  constructor(scene, x, y, data={}) {
    super(scene, x, y, 'uumuu', 0);
    this.hp=180; this.maxHp=180; this.dmg=16; this.geoReward=60;
    this.id=data.id??'boss_uumuu';
    this._aiState='drift'; this._aiTimer=0; this._shockCd=0;
    this.setSize(36,36,12,12); this.body.setAllowGravity(false);
    this._immune=true; // immune until external hit (quirrel cuts the jelly)
    this._play('idle');
  }
  update(dt) {
    if (!this.alive) return; this._aiTimer-=dt; this._shockCd-=dt;
    const p=this.scene.knight; if (!p) return;
    this._hoverT=(this._hoverT||0)+dt;
    const tx=p.x+(Math.sin(this._hoverT*0.4))*80;
    const ty=p.y-60;
    const dx=tx-this.x,dy=ty-this.y,d=Math.hypot(dx,dy)||1;
    this.body.setVelocity((dx/d)*55,(dy/d)*55);
    // Contact damage
    if (Math.abs(p.x-this.x)<24&&Math.abs(p.y-this.y)<24) p.onHit(this.dmg,this);
    // Periodic shock discharge
    if (this._shockCd<=0&&!this._immune) {
      this._shockCd=2.5;
      this._play('shock');
      for(let i=0;i<4;i++){
        const a=(i/4)*Math.PI*2;
        this.scene.spawnProjectile({x:this.x,y:this.y,vx:Math.cos(a)*80,vy:Math.sin(a)*80,
          texture:'soul_orb',dmg:this.dmg,owner:'enemy',tint:0x88ffff,lifespan:2000});
      }
      this.later(500,()=>this._play('idle'));
    }
    // Remove immunity after 8s (quirrel helps)
    if (this._immune&&this._aiTimer<=0) this._immune=false;
  }
  onHit(d,src) {
    if (!this.alive||this._immune) return;
    this.hp-=d; this.sprite.setTint(0xffffff); this.later(80,()=>this.sprite.clearTint());
    this.scene._hud?.updateBossBar(this.hp,this.maxHp);
    if (this.hp<=0) {
      this.alive=false;this.body.setEnable(false);
      this.scene._hud?.hideBossBar();
      this.scene.spawnGeo(this.x,this.y,this.geoReward);
      (this.scene._save.flags || (this.scene._save.flags = {}))[this.id]=true;
      this.scene._save.itemsCollected.push(this.id);
      this.destroy();
    }
  }
  _play(n){AnimationManager.safePlay(this.sprite,`uumuu_${n}`);}
}

/* ─────────────────────────── DUNG DEFENDER (mini-boss) ─────────────────── */
class DungDefender extends Entity {
  constructor(scene, x, y, data={}) {
    super(scene, x, y, 'dung_defender', 0);
    this.hp=250; this.maxHp=250; this.dmg=22; this.geoReward=80;
    this.id=data.id??'boss_dung_defender';
    this._aiState='idle'; this._aiTimer=0; this._hitPlayer=false;
    this.setSize(32,32,8,8); this.sprite.setGravityY(C.GRAVITY);
    this._play('idle');
  }
  update(dt) {
    if (!this.alive) return; this._aiTimer-=dt;
    const p=this.scene.knight; if (!p) return;
    this.sprite.setFlipX(p.x<this.x);
    const dx=Math.abs(p.x-this.x);
    if (this._aiState==='idle') {
      this.body.setVelocityX(0);
      if (this._aiTimer<=0) {
        if (dx<220) this._roll(p);
        else { this._aiTimer=0.8; this._play('idle'); }
      }
    } else if (this._aiState==='roll') {
      if (!this._hitPlayer&&Math.abs(p.x-this.x)<36) { p.onHit(this.dmg,this); this._hitPlayer=true; }
      if (this.body.blocked.left||this.body.blocked.right||this._aiTimer<=0) {
        this._hitPlayer=false;this.body.setVelocityX(0);this._aiState='idle';this._aiTimer=0.7;this._play('idle');
      }
    } else if (this._aiState==='emerge') {
      if (this._aiTimer<=0) {
        if (!this._dungFired) {
          this._dungFired=true;
          const dir=Math.sign(p.x-this.x);
          this.scene.spawnProjectile({x:this.x,y:this.y-20,vx:dir*90,vy:-120,
            texture:'dung_ball',dmg:this.dmg*0.7,owner:'enemy',tint:0xaa7700,lifespan:2000});
          this._aiTimer=0.8;
        } else { this._dungFired=false; this._aiState='idle'; this._aiTimer=0.5; this._play('idle'); }
      }
    }
  }
  _roll(p) {
    const dir=Math.sign(p.x-this.x);
    this._aiState='roll'; this._aiTimer=0.6; this._play('roll');
    this.body.setVelocityX(dir*260);
    if (Math.random()<0.35) { this._aiState='emerge'; this._aiTimer=0.5; this._play('idle'); this.body.setVelocityX(0); }
  }
  onHit(d,src) {
    if (!this.alive) return; this.hp-=d;
    this.sprite.setTint(0xffffff); this.later(80,()=>this.sprite.clearTint());
    this.scene._hud?.updateBossBar(this.hp,this.maxHp);
    if (this.hp<=0) {
      this.alive=false;this.body.setEnable(false);
      this.scene._hud?.hideBossBar();
      this.scene.spawnGeo(this.x,this.y,this.geoReward);
      (this.scene._save.flags || (this.scene._save.flags = {}))[this.id]=true;
      this.scene._save.itemsCollected.push(this.id);
      this.destroy();
    }
  }
  _play(n){AnimationManager.safePlay(this.sprite,`dung_defender_${n}`);}
}

/* ─────────────────────────── LURIEN WATCHER ────────────────────────────── */
class LurienWatcher extends Entity {
  constructor(scene, x, y, data={}) {
    super(scene, x, y, 'lurien_watcher', 0);
    this.hp=220; this.maxHp=220; this.dmg=18; this.geoReward=0;
    this.id=data.id??'boss_lurien';
    this._aiState='idle'; this._aiTimer=0;
    this.setSize(24,40,12,8); this.body.setAllowGravity(false);
    this._play('idle');
  }
  update(dt) {
    if (!this.alive) return; this._aiTimer-=dt;
    const p=this.scene.knight; if (!p) return;
    this._hoverT=(this._hoverT||0)+dt;
    this.sprite.y=80+Math.sin(this._hoverT*0.6)*12;
    this.sprite.setFlipX(p.x<this.x);
    if (this._aiState==='idle'&&this._aiTimer<=0) this._chooseAttack(p);
    else if (this._aiState==='beam') {
      if (this._aiTimer<=0) {
        const beamW=this.scene.add.graphics().setDepth(C.LAYER_PARTICLES+1);
        beamW.fillStyle(0xaaaaff,0.7);
        const bx=this.sprite.x<p.x?this.sprite.x:p.x;
        beamW.fillRect(bx,this.sprite.y-4,Math.abs(p.x-this.sprite.x)+20,8);
        if (Math.abs(p.y-this.sprite.y)<30) p.onHit(this.dmg,this);
        this.scene.tweens.add({targets:beamW,alpha:0,duration:500,onComplete:()=>beamW.destroy()});
        this._aiState='idle'; this._aiTimer=1.4;
      }
    } else if (this._aiState==='orbs') {
      if (this._aiTimer<=0) {
        for(let i=0;i<4;i++){const a=(i/4)*Math.PI*2+0.4;
          this.scene.spawnProjectile({x:this.sprite.x,y:this.sprite.y,vx:Math.cos(a)*100,vy:Math.sin(a)*100,
            texture:'soul_orb',dmg:this.dmg,owner:'enemy',tint:0xaaaaff,lifespan:2400});}
        this._aiState='idle'; this._aiTimer=1.6;
      }
    }
  }
  _chooseAttack(p) {
    if (Math.random()<0.5) { this._aiState='beam'; this._aiTimer=0.5; }
    else { this._aiState='orbs'; this._aiTimer=0.4; }
  }
  onHit(d,src) {
    if (!this.alive) return; this.hp-=d;
    this.sprite.setTint(0xffffff); this.later(80,()=>this.sprite.clearTint());
    this.scene._hud?.updateBossBar(this.hp,this.maxHp);
    if (this.hp<=0){this.alive=false;this.body.setEnable(false);
      this.scene._hud?.hideBossBar();
      this.scene._dialogue.show(DIALOGUE.dreamer_seal_break,()=>{});
      (this.scene._save.flags || (this.scene._save.flags = {}))[this.id]=true; this.scene._save.flags.dreamer_lurien=true;
      this.scene._save.itemsCollected.push(this.id);
      SaveSystem.save(this.scene._buildSaveData());
      this.destroy();}
  }
  _play(n){AnimationManager.safePlay(this.sprite,`lurien_watcher_${n}`);}
}
