/* js/scenes/PreloadScene_p3.js — Phase III–V procedural textures */
'use strict';

// Patch into PreloadScene after all other patches
const _origP2Textures = PreloadScene.prototype._genPhase2Textures;
PreloadScene.prototype._genPhase2Textures = function() {
  _origP2Textures.call(this);
  this._genPhase3Textures();
};

PreloadScene.prototype._genPhase3Textures = function() {
  this._genGreatHopper();
  this._genWingedFool();
  this._genSoulTwister();
  this._genFungoon();
  this._genShrumalOgre();
  this._genMantisWarrior();
  this._genMantisLords();
  this._genPaleLurker();
  this._genUumuu();
  this._genDungDefender();
  this._genLurienWatcher();
  this._genSoulMaster();
  this._genHKBoss();
  this._genRadiance();
  this._genCityTiles();
  this._genFungalTiles();
  this._genBasinTiles();
  this._genSoulOrb();
  this._genSporeBlob();
  this._genDungBall();
  this._genBgCity();
  this._genBgFungal();
  this._genBgBasin();
  this._genBgAbyss();
  this._genNPCVariants();
};

// ── Helper: make simple enemy spritesheet ─────────────────────────────────
PreloadScene.prototype._simpleEnemySheet = function(key, fw, fh, rowCount, drawFn) {
  const canvas = this.textures.createCanvas(key, fw * 8, fh * rowCount);
  const ctx    = canvas.context;
  for (let r = 0; r < rowCount; r++) {
    const frames = 6;
    for (let f = 0; f < frames; f++) {
      const t = f / Math.max(frames - 1, 1);
      ctx.save(); ctx.translate(f * fw, r * fh);
      drawFn(ctx, fw, fh, r, f, t);
      ctx.restore();
      canvas.add(r * 100 + f, 0, f * fw, r * fh, fw, fh);
    }
  }
  canvas.refresh();
};

PreloadScene.prototype._genGreatHopper = function() {
  this._simpleEnemySheet('great_hopper', 28, 22, 4, (ctx, w, h, row, f, t) => {
    const cx = w/2, cy = h*0.6;
    const bob = row===1 ? Math.sin(t*Math.PI)*-8 : 0; // jump row
    ctx.fillStyle = '#3a5a1a';
    ctx.beginPath(); ctx.ellipse(cx, cy+bob, 10, 8, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#5a8a2a';
    ctx.beginPath(); ctx.ellipse(cx, cy-3+bob, 8, 6, 0, 0, Math.PI*2); ctx.fill();
    // Legs
    ctx.strokeStyle = '#2a4a0a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx-6,cy+bob+4); ctx.lineTo(cx-12,cy+bob+10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+6,cy+bob+4); ctx.lineTo(cx+12,cy+bob+10); ctx.stroke();
    // Eyes
    ctx.fillStyle = '#ff8800'; ctx.fillCircle?.(cx-2,cy-5+bob,1.5); ctx.beginPath(); ctx.arc(cx-2,cy-5+bob,1.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+2,cy-5+bob,1.5,0,Math.PI*2); ctx.fill();
  });
};

PreloadScene.prototype._genWingedFool = function() {
  this._simpleEnemySheet('winged_fool', 22, 18, 3, (ctx, w, h, row, f, t) => {
    const cx = w/2, cy = h/2;
    const beat = Math.sin(t*Math.PI*2);
    ctx.fillStyle = 'rgba(200,180,120,0.35)';
    ctx.beginPath(); ctx.moveTo(cx-2,cy); ctx.quadraticCurveTo(cx-12,cy+beat*5-4,cx-14,beat*5); ctx.quadraticCurveTo(cx-9,beat*5+3,cx-2,cy+2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx+2,cy); ctx.quadraticCurveTo(cx+12,cy+beat*5-4,cx+14,beat*5); ctx.quadraticCurveTo(cx+9,beat*5+3,cx+2,cy+2); ctx.fill();
    ctx.fillStyle = '#8a6a2a';
    ctx.beginPath(); ctx.ellipse(cx, cy+1, 4, 5, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#aa8a3a';
    ctx.beginPath(); ctx.arc(cx, cy-3, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(cx-1,cy-4,1,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+1,cy-4,1,0,Math.PI*2); ctx.fill();
  });
};

PreloadScene.prototype._genSoulTwister = function() {
  this._simpleEnemySheet('soul_twister', 24, 40, 3, (ctx, w, h, row, f, t) => {
    const cx = w/2, cy = h*0.5;
    const bob = Math.sin(t*Math.PI*2)*2;
    // Robes
    ctx.fillStyle = '#2a2a4a';
    ctx.beginPath(); ctx.moveTo(cx-8,cy-10+bob); ctx.lineTo(cx+8,cy-10+bob); ctx.lineTo(cx+12,cy+16+bob); ctx.lineTo(cx-12,cy+16+bob); ctx.closePath(); ctx.fill();
    // Soul glow
    const col = row===1 ? '#ffffff' : '#aaaaff';
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(cx,cy-14+bob,5,0,Math.PI*2); ctx.fill();
    // Hood
    ctx.fillStyle = '#1a1a3a';
    ctx.beginPath(); ctx.ellipse(cx,cy-12+bob,6,6,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = col; ctx.globalAlpha=0.7;
    ctx.beginPath(); ctx.ellipse(cx,cy-12+bob,3,3,0,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  });
};

PreloadScene.prototype._genFungoon = function() {
  this._simpleEnemySheet('fungoon', 22, 18, 4, (ctx, w, h, row, f, t) => {
    const cx = w/2, cy = h*0.6;
    const puff = row===1 ? Math.sin(t*Math.PI)*3 : 0;
    ctx.fillStyle = '#1a3a0a';
    ctx.beginPath(); ctx.ellipse(cx,cy+1,9+puff,7+puff,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3a6a1a';
    ctx.beginPath(); ctx.ellipse(cx-2,cy-2,8,6,0,0,Math.PI*2); ctx.fill();
    // Spots
    ctx.fillStyle = '#8aff44'; ctx.globalAlpha=0.5;
    ctx.beginPath(); ctx.arc(cx-3,cy-1,2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+2,cy,1.5,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
    ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(cx+5,cy-2,1.5,0,Math.PI*2); ctx.fill();
    if (row===1) { // spore cloud
      ctx.fillStyle = 'rgba(138,255,68,0.3)';
      ctx.beginPath(); ctx.arc(cx, cy-10, 6+f, 0, Math.PI*2); ctx.fill();
    }
  });
};

PreloadScene.prototype._genShrumalOgre = function() {
  this._simpleEnemySheet('shrumal_ogre', 36, 38, 4, (ctx, w, h, row, f, t) => {
    const cx = w/2, cy = h*0.55;
    const sway = row===2 ? Math.sin(t*Math.PI)*4 : 0; // charge
    ctx.fillStyle = '#2a4a0a';
    ctx.beginPath(); ctx.ellipse(cx+sway,cy+4,14,16,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#4a7a1a';
    ctx.beginPath(); ctx.ellipse(cx+sway*0.5,cy-6,12,12,0,0,Math.PI*2); ctx.fill();
    // Giant cap
    ctx.fillStyle = '#5a9a2a';
    ctx.beginPath(); ctx.ellipse(cx,cy-12,18,8,-0.15,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3a7a0a';
    ctx.beginPath(); ctx.ellipse(cx,cy-10,16,6,-0.15,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(cx-4,cy-7,2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+4,cy-7,2,0,Math.PI*2); ctx.fill();
    // Arms
    ctx.strokeStyle='#2a4a0a'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(cx-12,cy-4); ctx.lineTo(cx-16+sway,cy+6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+12,cy-4); ctx.lineTo(cx+16+sway,cy+6); ctx.stroke();
  });
};

PreloadScene.prototype._genMantisWarrior = function() {
  this._simpleEnemySheet('mantis_warrior', 22, 36, 6, (ctx, w, h, row, f, t) => {
    const cx = w/2, cy = h*0.5;
    const jump = row===2 ? Math.sin(t*Math.PI)*-6 : 0;
    // Forelegs (claws)
    ctx.strokeStyle='#1a3a0a'; ctx.lineWidth=1.5;
    const claw = row===2 ? 0.6 : t*0.3;
    ctx.beginPath(); ctx.moveTo(cx-6,cy-4+jump); ctx.lineTo(cx-14,cy-8+claw*8+jump); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+6,cy-4+jump); ctx.lineTo(cx+14,cy-8+claw*8+jump); ctx.stroke();
    // Body
    ctx.fillStyle = '#1a3a0a';
    ctx.beginPath(); ctx.ellipse(cx,cy+4+jump,6,12,0,0,Math.PI*2); ctx.fill();
    // Head
    ctx.fillStyle = '#2a5a1a';
    ctx.beginPath(); ctx.arc(cx,cy-8+jump,7,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ff8800'; ctx.beginPath(); ctx.arc(cx-2.5,cy-9+jump,1.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+2.5,cy-9+jump,1.5,0,Math.PI*2); ctx.fill();
    // Antenna
    ctx.strokeStyle='#2a5a1a'; ctx.lineWidth=0.8;
    ctx.beginPath(); ctx.moveTo(cx-2,cy-15+jump); ctx.lineTo(cx-5,cy-20+jump); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+2,cy-15+jump); ctx.lineTo(cx+5,cy-20+jump); ctx.stroke();
  });
};

PreloadScene.prototype._genMantisLords = function() {
  this._simpleEnemySheet('mantis_lords', 28, 48, 8, (ctx, w, h, row, f, t) => {
    const cx = w/2, cy = h*0.5;
    const sway = (row===1||row===2) ? Math.sin(t*Math.PI*2)*2 : 0;
    ctx.strokeStyle='#0a2a0a'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(cx-8,cy-6+sway); ctx.lineTo(cx-18,cy-2+sway); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+8,cy-6+sway); ctx.lineTo(cx+18,cy-2+sway); ctx.stroke();
    ctx.fillStyle = '#0a2a0a';
    ctx.beginPath(); ctx.ellipse(cx,cy+5+sway,8,16,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#1a4a1a';
    ctx.beginPath(); ctx.arc(cx,cy-10+sway,9,0,Math.PI*2); ctx.fill();
    // Crown/crest
    ctx.fillStyle = '#3a7a2a';
    ctx.beginPath(); ctx.moveTo(cx-4,cy-18+sway); ctx.lineTo(cx,cy-22+sway); ctx.lineTo(cx+4,cy-18+sway); ctx.fill();
    ctx.fillStyle = '#00ff88'; ctx.globalAlpha=0.9;
    ctx.beginPath(); ctx.arc(cx-3,cy-12+sway,1.8,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx+3,cy-12+sway,1.8,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
    // Slash effect for attack rows
    if (row===2) { ctx.strokeStyle='rgba(0,255,100,0.5)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx+8,cy-8);ctx.lineTo(cx+22,cy-2);ctx.stroke(); }
  });
};

PreloadScene.prototype._genPaleLurker = function() {
  this._simpleEnemySheet('pale_lurker', 20, 20, 4, (ctx, w, h, row, f, t) => {
    const cx=w/2,cy=h/2,alpha=row===0?0.25:0.9;
    ctx.globalAlpha=alpha;
    ctx.fillStyle='#cccccc';
    ctx.beginPath();ctx.ellipse(cx,cy+2,6,8,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(cx,cy-5,5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(cx-1.5,cy-6,1.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(cx+1.5,cy-6,1.2,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(200,200,220,0.6)';ctx.lineWidth=0.8;
    for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(cx+(i-1)*4,cy+6);ctx.lineTo(cx+(i-1)*5,cy+11);ctx.stroke();}
    ctx.globalAlpha=1;
  });
};

PreloadScene.prototype._genUumuu = function() {
  this._simpleEnemySheet('uumuu', 46, 46, 4, (ctx, w, h, row, f, t) => {
    const cx=w/2,cy=h/2,pulse=Math.sin(t*Math.PI*2)*3;
    ctx.fillStyle='rgba(100,220,200,0.25)';
    ctx.beginPath();ctx.ellipse(cx,cy,20+pulse,18+pulse*0.5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(120,240,220,0.4)';
    ctx.beginPath();ctx.ellipse(cx,cy,14+pulse*0.5,12+pulse*0.3,0,0,Math.PI*2);ctx.fill();
    if(row===1){// shock
      ctx.strokeStyle='rgba(200,255,255,0.8)';ctx.lineWidth=1.5;
      for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*(18+pulse),cy+Math.sin(a)*(16+pulse));ctx.stroke();}
    }
    ctx.fillStyle='rgba(80,180,160,0.7)';
    ctx.beginPath();ctx.arc(cx-4,cy-2,3,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(cx+4,cy-2,3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(20,40,40,0.9)';
    ctx.beginPath();ctx.arc(cx-4,cy-2,1.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(cx+4,cy-2,1.2,0,Math.PI*2);ctx.fill();
  });
};

PreloadScene.prototype._genDungDefender = function() {
  this._simpleEnemySheet('dung_defender', 40, 36, 6, (ctx, w, h, row, f, t) => {
    const cx=w/2,cy=h*0.55;
    const roll=row===1?t*Math.PI*2:0;
    ctx.save();ctx.translate(cx,cy);if(row===1)ctx.rotate(roll);
    ctx.fillStyle='#5a3a0a';
    ctx.beginPath();ctx.ellipse(0,0,16,14,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#8a5a1a';
    ctx.beginPath();ctx.ellipse(0,-2,14,12,0,0,Math.PI*2);ctx.fill();
    // Shell segments
    ctx.strokeStyle='#4a2a0a';ctx.lineWidth=1;
    for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*6,-12);ctx.lineTo(i*5,12);ctx.stroke();}
    if(row!==1){
      ctx.fillStyle='#ff8800';ctx.beginPath();ctx.arc(-4,-8,2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(4,-8,2,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  });
};

PreloadScene.prototype._genLurienWatcher = function() {
  this._simpleEnemySheet('lurien_watcher', 30, 48, 4, (ctx, w, h, row, f, t) => {
    const cx=w/2,cy=h*0.45;const bob=Math.sin(t*Math.PI*2)*2;
    ctx.fillStyle='#1a1a2a';ctx.beginPath();ctx.ellipse(cx,cy+4+bob,8,16,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#2a2a4a';ctx.beginPath();ctx.arc(cx,cy-10+bob,9,0,Math.PI*2);ctx.fill();
    // Telescope
    ctx.fillStyle='#3a3a5a';ctx.fillRect(cx+5,cy-8+bob,12,4);
    ctx.fillStyle='#8888cc';ctx.globalAlpha=0.6;ctx.beginPath();ctx.arc(cx+17,cy-6+bob,3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle='#aaaaff';ctx.globalAlpha=0.8;ctx.beginPath();ctx.arc(cx,cy-11+bob,3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    if(row===1){ctx.strokeStyle='rgba(180,180,255,0.7)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(cx+18,cy-6+bob);ctx.lineTo(cx-14,cy-6+bob);ctx.stroke();}
  });
};

PreloadScene.prototype._genSoulMaster = function() {
  this._simpleEnemySheet('soul_master', 30, 52, 7, (ctx, w, h, row, f, t) => {
    const cx=w/2,cy=h*0.45;const bob=Math.sin(t*Math.PI*2)*2.5;
    const intensity=row===4?1:0.6; // cast row brighter
    ctx.fillStyle='#1a0a2a';ctx.beginPath();ctx.moveTo(cx-8,cy-8+bob);ctx.lineTo(cx+8,cy-8+bob);ctx.lineTo(cx+12,cy+18+bob);ctx.lineTo(cx-12,cy+18+bob);ctx.closePath();ctx.fill();
    ctx.fillStyle='#3a0a5a';ctx.beginPath();ctx.arc(cx,cy-13+bob,10,0,Math.PI*2);ctx.fill();
    // Soul aura
    ctx.fillStyle=`rgba(200,200,255,${0.3+intensity*0.4})`;ctx.beginPath();ctx.ellipse(cx,cy+bob,16,20,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=`rgba(255,255,255,${intensity*0.8})`;ctx.beginPath();ctx.arc(cx,cy-13+bob,5,0,Math.PI*2);ctx.fill();
    // Eye
    ctx.fillStyle=`rgba(180,180,255,${0.5+intensity*0.5})`;ctx.beginPath();ctx.ellipse(cx,cy-13+bob,4,3,0,0,Math.PI*2);ctx.fill();
    // Staff
    ctx.fillStyle='#3a1a4a';ctx.fillRect(cx+7,cy-20+bob,3,30);
    ctx.fillStyle='rgba(180,180,255,0.8)';ctx.beginPath();ctx.arc(cx+8.5,cy-22+bob,5,0,Math.PI*2);ctx.fill();
    if(row===3||row===4){
      ctx.strokeStyle='rgba(200,200,255,0.6)';ctx.lineWidth=1;
      for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2;ctx.beginPath();ctx.moveTo(cx+8.5,cy-22+bob);ctx.lineTo(cx+8.5+Math.cos(a)*10,cy-22+bob+Math.sin(a)*10);ctx.stroke();}
    }
  });
};

PreloadScene.prototype._genHKBoss = function() {
  this._simpleEnemySheet('hollow_knight_boss', 44, 58, 9, (ctx, w, h, row, f, t) => {
    const cx=w/2,cy=h*0.52;
    const sway=(row===1||row===4)?Math.sin(t*Math.PI*2)*3:0;
    const isP2=row>=5;
    const bodyCol=isP2?'#1a1a4a':'#0a0a0a';
    const shellCol=isP2?'#3a3a6a':'#2a2a2a';
    // Nail weapon
    ctx.fillStyle='#4a4a4a';ctx.fillRect(cx+20+sway*0.5,cy-30,4,40);
    ctx.fillStyle='#888888';ctx.fillRect(cx+20+sway*0.5,cy-32,6,6);
    // Body
    ctx.fillStyle=bodyCol;ctx.beginPath();ctx.ellipse(cx+sway*0.3,cy+4,16,22,0,0,Math.PI*2);ctx.fill();
    // Shell/cloak
    ctx.fillStyle=shellCol;ctx.beginPath();ctx.ellipse(cx+sway*0.2,cy-2,14,18,0,0,Math.PI*2);ctx.fill();
    // Helm
    ctx.fillStyle=shellCol;ctx.beginPath();ctx.ellipse(cx+sway*0.1,cy-18,13,12,0,0,Math.PI*2);ctx.fill();
    // Horns
    ctx.fillStyle='#3a3a5a';ctx.fillRect(cx-8+sway*0.1,cy-28,3,10);ctx.fillRect(cx+5+sway*0.1,cy-28,3,10);
    // Eyes — void black in p1, faint orange cracks in p2
    if(isP2){
      ctx.fillStyle='rgba(255,80,0,0.6)';ctx.beginPath();ctx.arc(cx-4,cy-20+sway*0.1,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(cx+4,cy-20+sway*0.1,3,0,Math.PI*2);ctx.fill();
    }
    // Void tendrils in p2
    if(isP2&&row===6){ctx.strokeStyle='rgba(80,80,200,0.5)';ctx.lineWidth=1;
      for(let i=0;i<4;i++){const a=(i/4)*Math.PI*2+t*Math.PI;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*16,cy+Math.sin(a)*16);ctx.stroke();}}
  });
};

PreloadScene.prototype._genRadiance = function() {
  this._simpleEnemySheet('radiance', 52, 52, 7, (ctx, w, h, row, f, t) => {
    const cx=w/2,cy=h/2;const pulse=Math.sin(t*Math.PI*2)*4;
    // Outer glow
    ctx.fillStyle=`rgba(255,240,100,${0.2+t*0.1})`;ctx.beginPath();ctx.ellipse(cx,cy,22+pulse,20+pulse,0,0,Math.PI*2);ctx.fill();
    // Inner light body
    ctx.fillStyle='rgba(255,255,180,0.85)';ctx.beginPath();ctx.ellipse(cx,cy,14+pulse*0.5,12+pulse*0.4,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.95)';ctx.beginPath();ctx.ellipse(cx,cy,8,7,0,0,Math.PI*2);ctx.fill();
    // Wing-like protrusions
    for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2+(row===1?t*0.5:0);const r=16+pulse;ctx.fillStyle=`rgba(255,220,50,${0.5-Math.abs(Math.sin(a))*0.3})`;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,a-0.3,a+0.3);ctx.closePath();ctx.fill();}
    // Core
    ctx.fillStyle='rgba(255,255,220,1)';ctx.beginPath();ctx.arc(cx,cy,4,0,Math.PI*2);ctx.fill();
  });
};

// ── Tile sets ─────────────────────────────────────────────────────────────
PreloadScene.prototype._genCityTiles = function() {
  const TS=C.TILE_SIZE;
  const cf=this.textures.createCanvas('tile_city_floor',TS*4,TS);
  const cc=cf.context;
  for(let i=0;i<4;i++){const x=i*TS;cc.fillStyle='#2a2a3a';cc.fillRect(x,0,TS,TS);cc.fillStyle='#3a3a4a';cc.fillRect(x,0,TS,3);cc.strokeStyle='#1a1a2a';cc.lineWidth=0.5;cc.strokeRect(x,0,TS,TS);cf.add(i,0,x,0,TS,TS);}
  cf.refresh();
  const cw=this.textures.createCanvas('tile_city_wall',TS*4,TS);
  const cvc=cw.context;
  for(let i=0;i<4;i++){const x=i*TS;cvc.fillStyle='#1e1e2e';cvc.fillRect(x,0,TS,TS);cvc.fillStyle='#2a2a3a';cvc.fillRect(x,0,1,TS);cvc.fillRect(x,0,TS,1);cw.add(i,0,x,0,TS,TS);}
  cw.refresh();
};

PreloadScene.prototype._genFungalTiles = function() {
  const TS=C.TILE_SIZE;
  const ff=this.textures.createCanvas('tile_fungal_floor',TS*4,TS);const fc=ff.context;
  for(let i=0;i<4;i++){const x=i*TS;fc.fillStyle='#1a2a0a';fc.fillRect(x,0,TS,TS);fc.fillStyle='#3a5a1a';fc.fillRect(x,0,TS,3);fc.fillStyle='rgba(138,255,68,0.3)';fc.beginPath();fc.arc(x+4+i*2,2,1.5,0,Math.PI*2);fc.fill();ff.add(i,0,x,0,TS,TS);}
  ff.refresh();
  const fw=this.textures.createCanvas('tile_fungal_wall',TS*4,TS);const fwc=fw.context;
  for(let i=0;i<4;i++){const x=i*TS;fwc.fillStyle='#111a08';fwc.fillRect(x,0,TS,TS);fwc.fillStyle='#1a2a0a';fwc.fillRect(x,0,1,TS);fwc.fillRect(x,0,TS,1);fw.add(i,0,x,0,TS,TS);}
  fw.refresh();
};

PreloadScene.prototype._genBasinTiles = function() {
  const TS=C.TILE_SIZE;
  const bf=this.textures.createCanvas('tile_basin_floor',TS*4,TS);const bc=bf.context;
  for(let i=0;i<4;i++){const x=i*TS;bc.fillStyle='#0a0a18';bc.fillRect(x,0,TS,TS);bc.fillStyle='#1a1a2a';bc.fillRect(x,0,TS,2);bc.fillStyle='rgba(80,80,200,0.2)';bc.beginPath();bc.arc(x+TS/2,TS/2,3,0,Math.PI*2);bc.fill();bf.add(i,0,x,0,TS,TS);}
  bf.refresh();
};

// ── Projectile types ──────────────────────────────────────────────────────
PreloadScene.prototype._genSoulOrb = function() {
  if(this.textures.exists('soul_orb'))return;
  const c=this.textures.createCanvas('soul_orb',12,12);const ctx=c.context;
  ctx.fillStyle='rgba(180,180,255,0.9)';ctx.beginPath();ctx.arc(6,6,5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.8)';ctx.beginPath();ctx.arc(4,4,2,0,Math.PI*2);ctx.fill();
  c.add(0,0,0,0,12,12);c.refresh();
};

PreloadScene.prototype._genSporeBlob = function() {
  if(this.textures.exists('spore_blob'))return;
  const c=this.textures.createCanvas('spore_blob',10,10);const ctx=c.context;
  ctx.fillStyle='rgba(100,220,50,0.8)';ctx.beginPath();ctx.arc(5,5,4,0,Math.PI*2);ctx.fill();
  c.add(0,0,0,0,10,10);c.refresh();
};

PreloadScene.prototype._genDungBall = function() {
  if(this.textures.exists('dung_ball'))return;
  const c=this.textures.createCanvas('dung_ball',10,10);const ctx=c.context;
  ctx.fillStyle='rgba(120,80,20,0.9)';ctx.beginPath();ctx.arc(5,5,4,0,Math.PI*2);ctx.fill();
  c.add(0,0,0,0,10,10);c.refresh();
};

// ── Background tiles ──────────────────────────────────────────────────────
PreloadScene.prototype._genBgCity = function() {
  const c=this.textures.createCanvas('bg_city',120,80);const ctx=c.context;
  ctx.fillStyle='#0a0a18';ctx.fillRect(0,0,120,80);
  ctx.fillStyle='rgba(80,80,180,0.3)';
  for(let i=0;i<3;i++){ctx.fillRect(15+i*35,5,22,75);}
  ctx.fillStyle='rgba(150,150,255,0.15)';
  for(let i=0;i<3;i++)for(let j=0;j<4;j++){ctx.fillRect(18+i*35,8+j*18,5,8);}
  c.refresh();
};

PreloadScene.prototype._genBgFungal = function() {
  const c=this.textures.createCanvas('bg_fungal',100,80);const ctx=c.context;
  ctx.fillStyle='#080f04';ctx.fillRect(0,0,100,80);
  ctx.fillStyle='rgba(60,100,20,0.4)';
  for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(20+i*30,70,12+i*4,30,0,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='rgba(100,200,50,0.15)';
  for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(10+i*25,40,6+i*2,0,Math.PI*2);ctx.fill();}
  c.refresh();
};

PreloadScene.prototype._genBgBasin = function() {
  const c=this.textures.createCanvas('bg_basin',100,80);const ctx=c.context;
  ctx.fillStyle='#050510';ctx.fillRect(0,0,100,80);
  ctx.fillStyle='rgba(30,30,100,0.3)';
  for(let i=0;i<2;i++){ctx.fillRect(10+i*50,10,8,60);}
  ctx.fillStyle='rgba(80,80,200,0.1)';ctx.fillRect(0,0,100,80);
  c.refresh();
};

PreloadScene.prototype._genBgAbyss = function() {
  const c=this.textures.createCanvas('bg_abyss',100,80);const ctx=c.context;
  ctx.fillStyle='#020205';ctx.fillRect(0,0,100,80);
  ctx.fillStyle='rgba(10,10,40,0.5)';
  for(let i=0;i<5;i++){ctx.fillRect(i*20,Phaser.Math.Between?.(20,60)??30,4,Phaser.Math.Between?.(10,40)??20);}
  c.refresh();
};

// ── NPC variant sprites ────────────────────────────────────────────────────
PreloadScene.prototype._genNPCVariants = function() {
  const makeNPC=(key,headCol,bodyCol,eyeCol)=>{
    const c=this.textures.createCanvas(key,20,28);const ctx=c.context;
    ctx.fillStyle=bodyCol;ctx.beginPath();ctx.ellipse(10,18,6,8,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=headCol;ctx.beginPath();ctx.arc(10,8,7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=eyeCol;ctx.beginPath();ctx.arc(7,7,1.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(13,7,1.5,0,Math.PI*2);ctx.fill();
    c.add(0,0,0,0,20,28);c.refresh();
  };
  if(!this.textures.exists('sly'))        makeNPC('sly',       '#3a2a1a','#2a1a0a','#ff8800');
  if(!this.textures.exists('iselda'))     makeNPC('iselda',    '#4a2a2a','#3a1a1a','#ffffff');
  if(!this.textures.exists('monomon'))    makeNPC('monomon',   '#2a3a4a','#1a2a3a','#88ccff');
  if(!this.textures.exists('lurien'))     makeNPC('lurien',    '#2a2a3a','#1a1a2a','#aaaaff');
  if(!this.textures.exists('herrah'))     makeNPC('herrah',    '#3a1a2a','#2a0a1a','#ff4488');
  if(!this.textures.exists('cornifer'))   makeNPC('cornifer',  '#4a3a1a','#3a2a0a','#ff8800');
  if(!this.textures.exists('seer'))       makeNPC('seer',      '#1a1a2a','#0a0a1a','#ffffff');
};

// ── Extra textures needed by Phase III-V systems ──────────────────────────
const _origGenP3 = PreloadScene.prototype._genPhase3Textures;
PreloadScene.prototype._genPhase3Textures = function() {
  _origGenP3.call(this);
  this._genDreamerSeal();
  this._genVoidTendril();
  this._genEssenceOrb();
  this._genSlyNPC();
  this._genHerrahNPC();
};

PreloadScene.prototype._genDreamerSeal = function() {
  const FW=24,FH=20, rows=ANIM_DEFS.dreamer_seal.anims;
  const canvas=this.textures.createCanvas('dreamer_seal',FW*10,FH*2);
  const ctx=canvas.context; let ri=0;
  for(const [name,cfg] of Object.entries(rows)){
    for(let f=0;f<cfg.frames;f++){
      const t=f/Math.max(cfg.frames-1,1);
      const cx=f*FW+FW/2, cy=ri*FH+FH/2;
      ctx.save(); ctx.translate(cx,cy);
      const pulse=Math.sin(t*Math.PI*2)*0.15;
      if(name==='break'){
        // Shattering — fade and scatter
        ctx.globalAlpha=1-t;
        ctx.fillStyle='rgba(200,180,255,0.8)';
        const pieces=5;
        for(let i=0;i<pieces;i++){
          const a=(i/pieces)*Math.PI*2, r=t*12;
          ctx.save(); ctx.translate(Math.cos(a)*r,Math.sin(a)*r);
          ctx.fillRect(-2,-2,4,4); ctx.restore();
        }
      } else {
        ctx.fillStyle=`rgba(${170+pulse*50},${160+pulse*50},255,0.85)`;
        ctx.beginPath(); ctx.moveTo(0,-8); ctx.lineTo(5,0); ctx.lineTo(0,8); ctx.lineTo(-5,0); ctx.closePath(); ctx.fill();
        ctx.strokeStyle='rgba(220,210,255,0.5)'; ctx.lineWidth=0.5; ctx.stroke();
      }
      ctx.restore();
      canvas.add(ri*100+f,0,f*FW,ri*FH,FW,FH);
    }
    ri++;
  }
  canvas.refresh();
};

PreloadScene.prototype._genVoidTendril = function() {
  const FW=16, FH=32;
  const canvas=this.textures.createCanvas('void_tendril',FW*5,FH*3);
  const ctx=canvas.context;
  const rows=[['rise',5],['active',4],['retract',5]];
  let ri=0;
  for(const [name,frames] of rows){
    for(let f=0;f<frames;f++){
      const t=f/Math.max(frames-1,1);
      const cx=f*FW+FW/2,cy=ri*FH+FH;
      ctx.save(); ctx.translate(cx,cy);
      const h=name==='rise'?t*20:name==='retract'?(1-t)*20:20;
      const alpha=name==='active'?0.7+Math.sin(t*Math.PI*2)*0.2:0.6;
      ctx.fillStyle=`rgba(30,0,60,${alpha})`;
      const wave=Math.sin(t*Math.PI*4)*2;
      ctx.beginPath();
      ctx.moveTo(-4,0);
      for(let y=0;y<=h;y+=2){
        ctx.lineTo(-3+Math.sin(y*0.5+wave)*2,  -y);
      }
      for(let y=h;y>=0;y-=2){
        ctx.lineTo(3+Math.sin(y*0.5+wave+1)*2, -y);
      }
      ctx.closePath(); ctx.fill();
      ctx.restore();
      canvas.add(ri*100+f,0,f*FW,ri*FH,FW,FH);
    }
    ri++;
  }
  canvas.refresh();
};

PreloadScene.prototype._genEssenceOrb = function() {
  const FW=14,FH=14;
  const canvas=this.textures.createCanvas('essence_orb',FW*6,FH*2);
  const ctx=canvas.context;
  const rows=[['float',6],['burst',5]];
  let ri=0;
  for(const [name,frames] of rows){
    for(let f=0;f<frames;f++){
      const t=f/Math.max(frames-1,1);
      const cx=f*FW+FW/2, cy=ri*FH+FH/2;
      ctx.save(); ctx.translate(cx,cy);
      if(name==='burst'){
        ctx.globalAlpha=1-t;
        ctx.strokeStyle='rgba(200,200,255,0.8)'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(0,0,2+t*8,0,Math.PI*2); ctx.stroke();
      } else {
        const r=3+Math.sin(t*Math.PI*2)*0.8;
        ctx.fillStyle='rgba(170,170,255,0.85)';
        ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(220,220,255,0.5)';
        ctx.beginPath(); ctx.arc(-r*0.3,-r*0.3,r*0.4,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
      canvas.add(ri*100+f,0,f*FW,ri*FH,FW,FH);
    }
    ri++;
  }
  canvas.refresh();
};

PreloadScene.prototype._genSlyNPC = function() {
  // Simple merchantcharacter sheet for Sly
  this._simpleNPCSheet('sly', '#3a2a1a', '#6a4a2a', '#cc9944');
  this._simpleNPCSheet('iselda_npc', '#2a1a3a', '#5a3a6a', '#cc66aa');
  this._simpleNPCSheet('monomon', '#1a2a3a', '#2a4a6a', '#44aacc');
  this._simpleNPCSheet('lurien_npc', '#1a1a2a', '#3a3a5a', '#8888cc');
  this._simpleNPCSheet('herrah', '#2a1a1a', '#5a2a2a', '#cc4444');
};

PreloadScene.prototype._simpleNPCSheet = function(key, bgCol, bodyCol, accentCol) {
  const FW=22,FH=28;
  const canvas=this.textures.createCanvas(key,FW*4,FH*2);
  const ctx=canvas.context;
  for(let ri=0;ri<2;ri++){
    for(let f=0;f<4;f++){
      const t=f/3;
      const cx=f*FW+FW/2, cy=ri*FH+FH*0.7;
      ctx.save(); ctx.translate(cx,cy);
      const bob=ri===1?Math.sin(t*Math.PI*2)*1.5:0; // talk anim bobs head
      // Body
      ctx.fillStyle=bodyCol; ctx.beginPath(); ctx.ellipse(0,4,6,10,0,0,Math.PI*2); ctx.fill();
      // Head
      ctx.fillStyle=bodyCol; ctx.beginPath(); ctx.arc(0,-8+bob,6,0,Math.PI*2); ctx.fill();
      // Eyes
      ctx.fillStyle=accentCol; ctx.beginPath(); ctx.arc(-2,-8+bob,1.2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(2,-8+bob,1.2,0,Math.PI*2); ctx.fill();
      // Accent detail
      ctx.fillStyle=accentCol; ctx.globalAlpha=0.4;
      ctx.fillRect(-3,0,6,2);
      ctx.restore();
      canvas.add(ri*100+f,0,f*FW,ri*FH,FW,FH);
    }
  }
  canvas.refresh();
};

PreloadScene.prototype._genHerrahNPC = function() {
  // Herrah is already handled in _genSlyNPC
};
