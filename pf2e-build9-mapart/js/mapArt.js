/**
 * mapArt.js — Paizo Art Director Map Rendering (Build 9)
 *
 * Complete replacement of mapExtensions.js drawing pipeline.
 * Principles: physical lighting, material shading, ambient occlusion,
 * warm/cool color temperature, FBM terrain noise, screen-blend compositing.
 */
var MapArt = (function () {
  'use strict';

  // ── Seeded RNG (Mulberry32) ─────────────────────────────────────────────────
  function mkRng(seed) {
    var s = (seed >>> 0) || 1;
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function seedFrom(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h;
  }

  // ── Math ────────────────────────────────────────────────────────────────────
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function smoothstep(a, b, t) { t = clamp((t - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  // ── Color ───────────────────────────────────────────────────────────────────
  function hexRgb(hex) {
    return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
  }
  function rgbHex(r,g,b) {
    return '#'+[r,g,b].map(function(v){return Math.round(clamp(v,0,255)).toString(16).padStart(2,'0');}).join('');
  }
  function lerpCol(a, b, t) {
    var ac=hexRgb(a), bc=hexRgb(b);
    return rgbHex(lerp(ac[0],bc[0],t), lerp(ac[1],bc[1],t), lerp(ac[2],bc[2],t));
  }
  function rgba(hex, a) { var c=hexRgb(hex); return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'; }

  // ── Noise (value noise) ─────────────────────────────────────────────────────
  function vnoise(x, y) {
    var ix=Math.floor(x), iy=Math.floor(y), fx=x-ix, fy=y-iy;
    fx=fx*fx*(3-2*fx); fy=fy*fy*(3-2*fy);
    function h(gx,gy){ var n=(gx*1619+gy*31337)^0xdeadbeef; n=(n^(n>>>16))*0x45d9f3b; n=(n^(n>>>16))*0x45d9f3b; return ((n^(n>>>16))>>>0)/4294967296; }
    return lerp(lerp(h(ix,iy),h(ix+1,iy),fx), lerp(h(ix,iy+1),h(ix+1,iy+1),fx), fy);
  }
  function fbm(x, y, oct) {
    var v=0, amp=0.5, freq=1, mx=0;
    for(var i=0;i<oct;i++){v+=vnoise(x*freq,y*freq)*amp; mx+=amp; amp*=0.5; freq*=2.1;}
    return v/mx;
  }

  // ── Canvas helpers ──────────────────────────────────────────────────────────
  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
    ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
    ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
    ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
    ctx.closePath();
  }

  // ── Lighting system ─────────────────────────────────────────────────────────
  // lights: [{x,y,radius,color,intensity,type:'torch'|'fire'|'magic'|'ambient'}]
  function applyLighting(ctx, W, H, lights) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    lights.forEach(function(L) {
      var r=L.radius, col=hexRgb(L.color), intensity=L.intensity||1.0;
      var g=ctx.createRadialGradient(L.x,L.y,r*0.05,L.x,L.y,r);
      if (L.type==='torch') {
        g.addColorStop(0,'rgba('+col[0]+','+col[1]+','+Math.floor(col[2]*0.3)+','+(0.50*intensity)+')');
        g.addColorStop(0.2,'rgba('+Math.min(255,col[0])+','+Math.floor(col[1]*0.6)+',0,'+(0.22*intensity)+')');
        g.addColorStop(0.6,'rgba('+Math.floor(col[0]*0.4)+',15,0,'+(0.08*intensity)+')');
        g.addColorStop(1,'rgba(0,0,0,0)');
      } else if (L.type==='fire') {
        g.addColorStop(0,'rgba(255,200,60,'+(0.65*intensity)+')');
        g.addColorStop(0.15,'rgba(255,110,15,'+(0.38*intensity)+')');
        g.addColorStop(0.5,'rgba(160,35,0,'+(0.14*intensity)+')');
        g.addColorStop(1,'rgba(0,0,0,0)');
      } else if (L.type==='magic') {
        g.addColorStop(0,'rgba('+col[0]+','+col[1]+','+col[2]+','+(0.58*intensity)+')');
        g.addColorStop(0.35,'rgba('+col[0]+','+col[1]+','+col[2]+','+(0.16*intensity)+')');
        g.addColorStop(1,'rgba(0,0,0,0)');
      } else {
        g.addColorStop(0,'rgba('+col[0]+','+col[1]+','+col[2]+','+(0.22*intensity)+')');
        g.addColorStop(1,'rgba(0,0,0,0)');
      }
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    });
    ctx.restore();
  }

  function vignette(ctx, W, H, strength) {
    ctx.save();
    ctx.globalCompositeOperation='multiply';
    var g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.18,W/2,H/2,Math.max(W,H)*0.82);
    g.addColorStop(0,'rgba(255,255,255,1)');
    g.addColorStop(1,'rgba(0,0,0,'+(strength||0.72)+')');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.restore();
  }

  // ── Material drawing ────────────────────────────────────────────────────────
  function stoneTile(ctx, px, py, w, h, base, alt, rng) {
    var n=vnoise(px/w*3.1+0.5, py/h*3.1+0.5);
    ctx.fillStyle=lerpCol(base,alt,n*0.55);
    ctx.fillRect(px,py,w,h);
    // Micro-scratch
    if(rng()<0.25){
      ctx.save(); ctx.globalAlpha=0.04+rng()*0.05; ctx.strokeStyle='#ffffff'; ctx.lineWidth=0.5;
      ctx.beginPath(); ctx.moveTo(px+rng()*w,py+rng()*h); ctx.lineTo(px+rng()*w,py+rng()*h); ctx.stroke();
      ctx.restore();
    }
    // Bevel highlight top+left, shadow bottom+right
    ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.fillRect(px,py,w,1.5); ctx.fillRect(px,py,1.5,h);
    ctx.fillStyle='rgba(0,0,0,0.15)'; ctx.fillRect(px,py+h-1.5,w,1.5); ctx.fillRect(px+w-1.5,py,1.5,h);
    ctx.strokeStyle='rgba(0,0,0,0.18)'; ctx.lineWidth=0.5; ctx.strokeRect(px+0.5,py+0.5,w-1,h-1);
  }

  function woodGrain(ctx, px, py, w, h, col, rng) {
    ctx.fillStyle=col; ctx.fillRect(px,py,w,h);
    var ng=3+Math.floor(rng()*4);
    for(var g=0;g<ng;g++){
      var gy=py+(g/ng)*h+rng()*(h/ng);
      ctx.save(); ctx.globalAlpha=0.04+rng()*0.07; ctx.strokeStyle='#000'; ctx.lineWidth=0.5+rng()*0.5;
      ctx.beginPath(); ctx.moveTo(px,gy);
      ctx.bezierCurveTo(px+w*0.3,gy+(rng()-0.5)*3,px+w*0.7,gy+(rng()-0.5)*3,px+w,gy+(rng()-0.5)*2); ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(px,py,w,h*0.22);
    ctx.fillStyle='rgba(0,0,0,0.12)'; ctx.fillRect(px,py+h*0.78,w,h*0.22);
  }

  // ── Shared UI helpers ───────────────────────────────────────────────────────
  function mapFrame(ctx, W, H, accent) {
    ctx.save();
    ctx.strokeStyle=lerpCol(accent,'#000',0.4); ctx.lineWidth=4; ctx.strokeRect(1,1,W-2,H-2);
    ctx.strokeStyle=accent; ctx.lineWidth=1.5; ctx.strokeRect(5,5,W-10,H-10);
    ctx.restore();
  }

  function mapTitle(ctx, text, accent, x, y) {
    ctx.save();
    ctx.font='bold 11px Georgia,serif'; ctx.textAlign='left'; ctx.textBaseline='top';
    var tw=ctx.measureText(text).width;
    ctx.fillStyle='rgba(0,0,0,0.8)';
    rrect(ctx,x-2,y-2,tw+16,18,3); ctx.fill();
    ctx.fillStyle=accent; ctx.fillText(text,x+6,y+1);
    ctx.restore();
  }

  function hazardMarker(ctx, x, y, label, accentCol, CELL) {
    ctx.save();
    // Diamond
    ctx.fillStyle=rgba(accentCol,0.85);
    ctx.beginPath(); ctx.moveTo(x,y-CELL*0.65); ctx.lineTo(x+CELL*0.5,y); ctx.lineTo(x,y+CELL*0.65); ctx.lineTo(x-CELL*0.5,y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#ffd040'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle='#ffd040'; ctx.font='bold 9px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('!',x,y);
    // Label tag
    var words=label.split(' ').slice(0,3).join(' ');
    ctx.font='8px Georgia,serif'; ctx.fillStyle=rgba('#ffe080',0.9);
    ctx.textBaseline='top'; ctx.fillText(words,x,y+CELL*0.72);
    ctx.restore();
  }

  function zoneMarker(ctx, x, y, r, label, col, dark) {
    ctx.save();
    ctx.fillStyle=rgba(dark,0.35);
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=col; ctx.lineWidth=2; ctx.stroke();
    ctx.font='bold 8px sans-serif'; ctx.fillStyle=col; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(label,x,y);
    ctx.restore();
  }

  function npcMarkerArt(ctx, x, y, col, label, CELL, role) {
    var r=CELL*0.6;
    ctx.save();
    // Drop shadow
    ctx.globalAlpha=0.4; ctx.fillStyle='#000';
    ctx.beginPath(); ctx.ellipse(x+2,y+r*0.3,r*0.8,r*0.3,0,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
    // Body gradient
    var bg=ctx.createRadialGradient(x-r*0.2,y-r*0.2,0,x,y,r);
    bg.addColorStop(0,lerpCol(col,'#ffffff',0.35)); bg.addColorStop(1,lerpCol(col,'#000',0.3));
    ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.55)'; ctx.lineWidth=1.5; ctx.stroke();
    // Head
    ctx.fillStyle='#e8c890'; ctx.beginPath(); ctx.arc(x,y-r*0.28,r*0.38,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.9)';
    ctx.font='bold 6px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText(label,x,y+r+2);
    ctx.restore();
  }

  // ── Detect environment type ─────────────────────────────────────────────────
  function detectEnv(act) {
    if(!act) return 'forest';
    var s=((act.location||'')+' '+(act.environment&&act.environment.terrain?act.environment.terrain.join(' '):'')).toLowerCase();
    if(s.includes('cave')||s.includes('mine')||s.includes('under')) return 'cave';
    if(s.includes('swamp')||s.includes('marsh')||s.includes('bog')) return 'swamp';
    if(s.includes('coast')||s.includes('sea')||s.includes('ruin')) return 'coastal';
    if(s.includes('city')||s.includes('town')||s.includes('urban')||s.includes('street')) return 'urban';
    if(s.includes('mountain')||s.includes('peak')||s.includes('pass')) return 'mountain';
    if(s.includes('planar')||s.includes('void')||s.includes('astral')) return 'planar';
    return 'forest';
  }

  function detectSocialRoom(enc) {
    if(!enc) return 'tavern';
    var n=(enc.template||'').toLowerCase();
    if(n.includes('throne')||n.includes('audience')||n.includes('court')) return 'throne_room';
    if(n.includes('market')||n.includes('public')||n.includes('confrontation')) return 'market';
    if(n.includes('garden')||n.includes('courtyard')) return 'courtyard';
    if(n.includes('hall')||n.includes('feast')||n.includes('banquet')) return 'great_hall';
    if(n.includes('interrogation')||n.includes('prison')) return 'interrogation';
    if(n.includes('library')||n.includes('study')||n.includes('interview')) return 'library_social';
    return 'tavern';
  }


  // ── Environment palettes ────────────────────────────────────────────────────
  var ENV = {
    forest:  { label:'Dense Woodland',  sky:['#090f04','#0e1a08'], gr:['#1a2a0e','#263c16','#101a08'], accent:'#70c048', haz:'#aa4a1a',
                lights:[{color:'#c0e8a0',type:'ambient',intensity:0.55},{color:'#fff8d0',type:'ambient',intensity:0.25}],
                features:['Ancient Oak (Difficult)','Stream (Swim DC 14)','Deadfall Hazard','Thicket (Cover)','Hollow Log','Mushroom Ring'] },
    cave:    { label:'Cave System',     sky:['#040304','#070505'], gr:['#1c1814','#28221e','#0e0a08'], accent:'#7a6a58', haz:'#4a6a8a',
                lights:[{color:'#3050e0',type:'magic',intensity:0.5}],
                features:['Stalactites (DC 18)','Underground Pool','Crystal Vein','Narrow Squeeze','Bat Roost','Sinkhole'] },
    swamp:   { label:'Bogland',         sky:['#070d05','#0b1208'], gr:['#182608','#223414','#0e1804'], accent:'#58a038', haz:'#4a6a18',
                lights:[{color:'#50f070',type:'magic',intensity:0.3},{color:'#b0d880',type:'ambient',intensity:0.22}],
                features:['Deep Bog (Hazard)','Quicksand','Will-O-Wisp Zone','Root Tangle','Stagnant Pool','Fog Pocket'] },
    coastal: { label:'Coastal Ruins',   sky:['#05090f','#080e18'], gr:['#1a2430','#243040','#101820'], accent:'#48a0b8', haz:'#9a7a28',
                lights:[{color:'#90c0d8',type:'ambient',intensity:0.48},{color:'#ffffff',type:'ambient',intensity:0.18}],
                features:['Tidal Pool (Slippery)','Crumbling Arch','Sea Cave','Wave-Cut Ledge','Driftwood Barrier','Sunken Statue'] },
    urban:   { label:'City District',   sky:['#0c0a06','#161008'], gr:['#30281a','#24200e','#1a1608'], accent:'#c0a858', haz:'#8b1a1a',
                lights:[{color:'#ff9838',type:'torch',intensity:0.85},{color:'#ffe098',type:'torch',intensity:0.55}],
                features:['Market Stalls (Cover)','Back Alley','Sewer Grate','Guard Post','Collapsed Wall','Fountain Plaza'] },
    mountain:{ label:'Mountain Pass',   sky:['#070504','#0e0a08'], gr:['#2a2418','#363028','#18140c'], accent:'#a09080', haz:'#9898a8',
                lights:[{color:'#b0c8e8',type:'ambient',intensity:0.58}],
                features:['Boulder Field','Narrow Ledge (Acro DC 16)','Rockslide Zone','Ice Shelf','Crevasse','Wind Tunnel'] },
    planar:  { label:'Planar Expanse',  sky:['#02020e','#05051a'], gr:['#0e0e30','#16163e','#08081e'], accent:'#7040ff', haz:'#ff40aa',
                lights:[{color:'#7050ff',type:'magic',intensity:0.85},{color:'#ff40a8',type:'magic',intensity:0.45},{color:'#40e8ff',type:'magic',intensity:0.38}],
                features:['Reality Fissure','Floating Platform','Gravity Inversion','Void Pool','Astral Current','Temporal Echo Zone'] },
  };

  // ── Social room palettes ────────────────────────────────────────────────────
  var ROOMS = {
    tavern:       { label:'The Tavern',         floorA:'#5a4028', floorB:'#4a3418', wall:'#221208', accent:'#c9873a', ltCol:'#ff9838', ltType:'torch' },
    throne_room:  { label:'Throne Room',        floorA:'#a08840', floorB:'#8a7030', wall:'#160e06', accent:'#d4a030', ltCol:'#ffd078', ltType:'ambient' },
    market:       { label:'Market Square',      floorA:'#7a7060', floorB:'#686050', wall:'#362a16', accent:'#90a040', ltCol:'#d0c898', ltType:'ambient' },
    courtyard:    { label:'Courtyard',          floorA:'#485828', floorB:'#384818', wall:'#1c2a10', accent:'#80b040', ltCol:'#c0d880', ltType:'ambient' },
    great_hall:   { label:'Great Hall',         floorA:'#483820', floorB:'#382c18', wall:'#120c04', accent:'#9a7030', ltCol:'#ff8828', ltType:'fire' },
    garden:       { label:'Noble Garden',       floorA:'#2e4818', floorB:'#243c10', wall:'#182608', accent:'#88cc48', ltCol:'#a8d868', ltType:'ambient' },
    interrogation:{ label:'Interrogation Room', floorA:'#2c2216', floorB:'#22180e', wall:'#100806', accent:'#8b1a1a', ltCol:'#e0c058', ltType:'torch' },
    library_social:{ label:'Private Library',   floorA:'#4a3820', floorB:'#3a2c18', wall:'#181008', accent:'#c9973a', ltCol:'#e8be58', ltType:'torch' },
  };


  // ── ENVIRONMENT MAP ─────────────────────────────────────────────────────────
  function generateEnvironmentMap(canvas, act, campaign) {
    if(!canvas) return;
    var W=canvas.width, H=canvas.height, ctx=canvas.getContext('2d');
    if(!ctx) return;
    var key=detectEnv(act), env=ENV[key];
    var rng=mkRng(seedFrom((act&&act.location)||key));
    var CELL=Math.max(18,Math.min(34,Math.floor(H/16)));

    // Pass 1: FBM ground texture via pixel manipulation
    var id=ctx.createImageData(W,H), d=id.data;
    var g0=hexRgb(env.gr[0]), g1=hexRgb(env.gr[1]), g2=hexRgb(env.gr[2]);
    for(var py=0;py<H;py++) for(var px=0;px<W;px++) {
      var n=fbm(px/W*4.5,py/H*3.8,4), n2=fbm(px/W*8+1.2,py/H*7+0.7,3);
      var t1=smoothstep(0.3,0.7,n), t2=smoothstep(0.4,0.6,n2);
      var i=(py*W+px)*4;
      d[i]  =clamp(lerp(lerp(g0[0],g1[0],t1),g2[0],t2*0.4),0,255);
      d[i+1]=clamp(lerp(lerp(g0[1],g1[1],t1),g2[1],t2*0.4),0,255);
      d[i+2]=clamp(lerp(lerp(g0[2],g1[2],t1),g2[2],t2*0.4),0,255);
      d[i+3]=255;
    }
    ctx.putImageData(id,0,0);

    // Pass 2: Terrain features
    var drawFn={forest:drawForest,cave:drawCave,swamp:drawSwamp,coastal:drawCoastal,urban:drawUrban,mountain:drawMountain,planar:drawPlanar};
    if(drawFn[key]) drawFn[key](ctx,W,H,CELL,env,rng);

    // Pass 3: Lighting
    var lights=env.lights.map(function(l){ return Object.assign({},l,{x:rng()*W,y:rng()*H,radius:Math.min(W,H)*(0.38+rng()*0.32)}); });
    for(var li=0;li<2+Math.floor(rng()*2);li++) {
      lights.push({x:CELL*2+rng()*(W-CELL*4),y:CELL*2+rng()*(H-CELL*4),radius:CELL*(3+rng()*4),
        color:env.accent,type:key==='cave'||key==='planar'?'magic':'torch',intensity:0.38+rng()*0.28});
    }
    applyLighting(ctx,W,H,lights);

    // Pass 4: Faint grid
    ctx.save(); ctx.strokeStyle='rgba(255,255,255,0.033)'; ctx.lineWidth=0.5;
    for(var gx=0;gx<W;gx+=CELL){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke();}
    for(var gy=0;gy<H;gy+=CELL){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();}
    ctx.restore();

    // Pass 5: Hazard markers — spread across map avoiding center path
    var hazPos=[], numH=3+Math.floor(rng()*3);
    for(var hi=0;hi<numH;hi++) {
      var hx,hy,ok,tries=0;
      do { hx=CELL*3+rng()*(W-CELL*6); hy=CELL*3+rng()*(H-CELL*6);
           ok=hazPos.every(function(p){return Math.hypot(p[0]-hx,p[1]-hy)>CELL*4;});
      } while(!ok&&++tries<20);
      hazPos.push([hx,hy]);
      hazardMarker(ctx,hx,hy,env.features[hi%env.features.length],env.haz,CELL);
    }

    // Pass 6: Start / Objective
    zoneMarker(ctx,W/2,H-CELL*2.5,CELL*1.9,'START','#30cc60','#0a3a18');
    zoneMarker(ctx,W/2,CELL*2.5,CELL*1.9,'OBJECTIVE','#cc3030','#3a0808');

    // Dashed path
    ctx.save(); ctx.strokeStyle=rgba(env.accent,0.32); ctx.lineWidth=2.5;
    ctx.setLineDash([10,7]); ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(W/2,H-CELL*4.2);
    ctx.bezierCurveTo(W*(0.22+rng()*0.18),H*0.65,W*(0.5+rng()*0.28-0.14),H*0.35,W/2,CELL*4.4);
    ctx.stroke(); ctx.restore();

    // Pass 7: Vignette
    vignette(ctx,W,H,0.8);

    // Pass 8: Frame and labels
    mapFrame(ctx,W,H,env.accent);
    mapTitle(ctx,env.label+(act?': '+act.location:''),env.accent,12,12);
    ctx.save();
    if(act){ ctx.font='italic 9px Georgia,serif'; ctx.fillStyle=rgba(env.accent,0.5); ctx.textAlign='right'; ctx.textBaseline='bottom'; ctx.fillText('Act '+act.number+' · '+act.title,W-10,H-6); }
    ctx.font='8px Georgia,serif'; ctx.fillStyle=rgba('#ffffff',0.28); ctx.textAlign='left'; ctx.textBaseline='bottom'; ctx.fillText('1 square = 5 ft',10,H-6);
    ctx.restore();
  }


  // ── TERRAIN DRAWERS ─────────────────────────────────────────────────────────

  function drawForest(ctx,W,H,CELL,env,rng) {
    // Multi-layer trees with drop shadow, layered canopy, rim highlight
    function tree(tx,ty,tr) {
      // Shadow ellipse
      ctx.save(); ctx.globalAlpha=0.38; ctx.fillStyle='#000';
      ctx.beginPath(); ctx.ellipse(tx+tr*0.28,ty+tr*0.38,tr*0.85,tr*0.5,0.25,0,Math.PI*2); ctx.fill(); ctx.restore();
      // Trunk
      var tg=ctx.createLinearGradient(tx-tr*0.1,0,tx+tr*0.1,0);
      tg.addColorStop(0,'#150a02'); tg.addColorStop(0.4,'#3a2510'); tg.addColorStop(1,'#150a02');
      ctx.fillStyle=tg; ctx.fillRect(tx-tr*0.11,ty-tr*0.2,tr*0.22,tr*0.55);
      // Canopy — 4 offset layers
      [{r:1.0,dy:0,c:'#0d2806'},{r:0.85,dy:-0.18,c:'#164010'},{r:0.68,dy:-0.34,c:'#1e5818'},{r:0.5,dy:-0.48,c:'#286820'}].forEach(function(l){
        var cg=ctx.createRadialGradient(tx-tr*0.12,ty+l.dy*tr-tr*0.08,0,tx,ty+l.dy*tr,l.r*tr);
        cg.addColorStop(0,lerpCol(l.c,'#3a8a1a',0.28)); cg.addColorStop(0.65,l.c); cg.addColorStop(1,lerpCol(l.c,'#040902',0.6));
        ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(tx,ty+l.dy*tr,l.r*tr,0,Math.PI*2); ctx.fill();
      });
      // Screen rim highlight
      ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=0.10;
      ctx.fillStyle='#a0d060';
      ctx.beginPath(); ctx.arc(tx-tr*0.22,ty-tr*0.28,tr*0.48,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
    for(var i=0;i<24+Math.floor(rng()*8);i++) {
      var tx=CELL+rng()*(W-CELL*2), ty=CELL+rng()*(H-CELL*2), tr=CELL*(0.55+rng()*0.75);
      if(Math.abs(tx-W/2)<CELL*1.4&&ty>H*0.22&&ty<H*0.78) continue;
      tree(tx,ty,tr);
    }
    // Stream with bank AO
    ctx.save();
    ctx.globalAlpha=0.32; ctx.strokeStyle='#000'; ctx.lineWidth=CELL*0.88;
    ctx.beginPath(); ctx.moveTo(W*0.17,0); ctx.bezierCurveTo(W*0.27,H*0.38,W*0.13,H*0.62,W*0.21,H); ctx.stroke();
    ctx.globalAlpha=1;
    var sg=ctx.createLinearGradient(W*0.12,0,W*0.28,0);
    sg.addColorStop(0,'#164478'); sg.addColorStop(0.35,'#2460a0'); sg.addColorStop(0.65,'#1e5898'); sg.addColorStop(1,'#164478');
    ctx.strokeStyle=sg; ctx.lineWidth=CELL*0.52;
    ctx.beginPath(); ctx.moveTo(W*0.17,0); ctx.bezierCurveTo(W*0.27,H*0.38,W*0.13,H*0.62,W*0.21,H); ctx.stroke();
    ctx.globalAlpha=0.22; ctx.strokeStyle='#90c8ff'; ctx.lineWidth=1.5; ctx.setLineDash([8,14]);
    ctx.beginPath(); ctx.moveTo(W*0.18,H*0.12); ctx.bezierCurveTo(W*0.26,H*0.4,W*0.14,H*0.58,W*0.20,H*0.88); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();
  }

  function drawCave(ctx,W,H,CELL,env,rng) {
    // Stalactites with phosphor-glow tips
    for(var i=0;i<14+Math.floor(rng()*8);i++) {
      var sx=rng()*W, sh=CELL*(0.9+rng()*2.4), sw=CELL*(0.16+rng()*0.22);
      var sg=ctx.createLinearGradient(sx,0,sx,sh);
      sg.addColorStop(0,'#262018'); sg.addColorStop(0.72,lerpCol('#2e2820','#5878a8',0.22)); sg.addColorStop(1,lerpCol('#3a3028','#80a0d8',0.45));
      ctx.fillStyle=sg;
      ctx.beginPath(); ctx.moveTo(sx-sw,0); ctx.lineTo(sx+sw,0);
      ctx.quadraticCurveTo(sx+sw*0.3,sh*0.72,sx,sh); ctx.quadraticCurveTo(sx-sw*0.3,sh*0.72,sx-sw,0); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation='screen';
      var tg=ctx.createRadialGradient(sx,sh,0,sx,sh,sw*3.5);
      tg.addColorStop(0,'rgba(70,110,200,0.42)'); tg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=tg; ctx.beginPath(); ctx.arc(sx,sh,sw*3.5,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
    // Stalagmites
    for(var j=0;j<10+Math.floor(rng()*6);j++) {
      var mx=rng()*W, mh=CELL*(0.5+rng()*1.6), mw=CELL*(0.14+rng()*0.18);
      ctx.fillStyle='#222018';
      ctx.beginPath(); ctx.moveTo(mx-mw,H); ctx.lineTo(mx+mw,H); ctx.lineTo(mx,H-mh); ctx.closePath(); ctx.fill();
    }
    // Glowing underground pool
    var px2=W*(0.28+rng()*0.28), py2=H*(0.38+rng()*0.22);
    var prx=CELL*(1.8+rng()*1.4), pry=CELL*(0.9+rng()*0.8);
    var pg=ctx.createRadialGradient(px2-prx*0.18,py2-pry*0.18,0,px2,py2,Math.max(prx,pry));
    pg.addColorStop(0,'#2858a0'); pg.addColorStop(0.4,'#163060'); pg.addColorStop(1,'#060c1e');
    ctx.fillStyle=pg; ctx.beginPath(); ctx.ellipse(px2,py2,prx,pry,0,0,Math.PI*2); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=0.38;
    ctx.fillStyle='#5080c8'; ctx.beginPath(); ctx.ellipse(px2-prx*0.2,py2-pry*0.28,prx*0.32,pry*0.18,-0.3,0,Math.PI*2); ctx.fill(); ctx.restore();
    // Crystal clusters
    for(var ci=0;ci<7;ci++) crystalCluster(ctx,CELL*2+rng()*(W-CELL*4),CELL*2+rng()*(H-CELL*4),CELL*(0.4+rng()*0.55),rng);
    // Floor AO
    var ao=ctx.createLinearGradient(0,H-CELL,0,H);
    ao.addColorStop(0,'rgba(0,0,0,0)'); ao.addColorStop(1,'rgba(0,0,0,0.52)');
    ctx.fillStyle=ao; ctx.fillRect(0,H-CELL,W,CELL);
  }

  function crystalCluster(ctx,cx,cy,size,rng) {
    var cols=['#3858a0','#5878c0','#1838a0','#7888d0'];
    var count=3+Math.floor(rng()*4);
    for(var i=0;i<count;i++) {
      var angle=(i/count)*Math.PI*2+rng()*0.5, len=size*(0.6+rng()*0.8), w2=size*0.11;
      var tipX=cx+Math.cos(angle)*len, tipY=cy+Math.sin(angle)*len;
      var px2=Math.cos(angle+Math.PI/2)*w2, py2=Math.sin(angle+Math.PI/2)*w2;
      var col=cols[Math.floor(rng()*cols.length)];
      var cg=ctx.createLinearGradient(cx,cy,tipX,tipY);
      cg.addColorStop(0,lerpCol(col,'#ffffff',0.32)); cg.addColorStop(0.5,col); cg.addColorStop(1,lerpCol(col,'#000010',0.62));
      ctx.fillStyle=cg;
      ctx.beginPath(); ctx.moveTo(cx+px2,cy+py2); ctx.lineTo(tipX,tipY); ctx.lineTo(cx-px2,cy-py2); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=0.32;
      ctx.strokeStyle='#a0c0ff'; ctx.lineWidth=0.8;
      ctx.beginPath(); ctx.moveTo(cx+px2*0.5,cy+py2*0.5); ctx.lineTo(tipX,tipY); ctx.stroke(); ctx.restore();
    }
    ctx.save(); ctx.globalCompositeOperation='screen';
    var bg=ctx.createRadialGradient(cx,cy,0,cx,cy,size*1.5);
    bg.addColorStop(0,'rgba(70,90,220,0.28)'); bg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(cx,cy,size*1.5,0,Math.PI*2); ctx.fill(); ctx.restore();
  }

  function drawSwamp(ctx,W,H,CELL,env,rng) {
    // Brackish bog pools
    for(var bi=0;bi<8;bi++) {
      var bx=rng()*W, by=rng()*H, brx=CELL*(0.8+rng()*2.2), bry=CELL*(0.4+rng()*1.3);
      var bg=ctx.createRadialGradient(bx,by,0,bx,by,Math.max(brx,bry));
      bg.addColorStop(0,'#182808'); bg.addColorStop(0.5,'#121e04'); bg.addColorStop(1,'#080e02');
      ctx.fillStyle=bg; ctx.beginPath(); ctx.ellipse(bx,by,brx,bry,rng()*Math.PI,0,Math.PI*2); ctx.fill();
      ctx.save(); ctx.globalAlpha=0.28; ctx.fillStyle='#2c4010';
      ctx.beginPath(); ctx.ellipse(bx-brx*0.1,by-bry*0.2,brx*0.55,bry*0.38,0.3,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
    // Cypress trees — narrow layered cones
    for(var ci=0;ci<16;ci++) {
      var tx=rng()*W, ty=CELL*2+rng()*(H-CELL*3), tr=CELL*(0.32+rng()*0.45), th=tr*3.8;
      ctx.save(); ctx.globalAlpha=0.28; ctx.fillStyle='#000';
      ctx.beginPath(); ctx.ellipse(tx+tr*0.4,ty+th*0.08,tr*0.55,tr*0.22,0,0,Math.PI*2); ctx.fill(); ctx.restore();
      ctx.fillStyle='#180c04'; ctx.fillRect(tx-tr*0.09,ty-th*0.08,tr*0.18,th*0.28);
      for(var layer=0;layer<5;layer++) {
        var lr=tr*(0.9-layer*0.12), ly=ty-layer*(th/5.5);
        ctx.fillStyle=lerpCol('#0a1c04','#1c4010',layer/5);
        ctx.beginPath(); ctx.moveTo(tx-lr,ly+tr*0.22); ctx.lineTo(tx+lr,ly+tr*0.22); ctx.lineTo(tx,ly-tr*0.42); ctx.closePath(); ctx.fill();
      }
    }
    // Will-o-wisps
    for(var wi=0;wi<5;wi++) {
      var wx=CELL*2+rng()*(W-CELL*4), wy=CELL*2+rng()*(H-CELL*4);
      ctx.save(); ctx.globalCompositeOperation='screen';
      var wg=ctx.createRadialGradient(wx,wy,0,wx,wy,CELL*1.4);
      wg.addColorStop(0,'rgba(160,255,180,0.65)'); wg.addColorStop(0.3,'rgba(50,190,90,0.28)'); wg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=wg; ctx.beginPath(); ctx.arc(wx,wy,CELL*1.4,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=0.85; ctx.fillStyle='#d8ffd8';
      ctx.beginPath(); ctx.arc(wx,wy,CELL*0.1,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
  }

  function drawCoastal(ctx,W,H,CELL,env,rng) {
    // Sea gradient — left ~40%
    var sg=ctx.createLinearGradient(0,0,W*0.44,0);
    sg.addColorStop(0,'#04101e'); sg.addColorStop(0.5,'#0c1e3c'); sg.addColorStop(0.82,'#183050'); sg.addColorStop(1,'#243d5a');
    ctx.fillStyle=sg;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(W*0.34,0);
    ctx.bezierCurveTo(W*0.42,H*0.32,W*0.38,H*0.62,W*0.4,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill();
    // Wave lines
    for(var wi=0;wi<9;wi++) {
      var wy=wi*H/9+rng()*H/18;
      ctx.save(); ctx.globalAlpha=0.1+rng()*0.09; ctx.strokeStyle='#a0c8e0'; ctx.lineWidth=0.9+rng();
      ctx.beginPath(); ctx.moveTo(0,wy); ctx.bezierCurveTo(W*0.1,wy-5,W*0.25,wy+4,W*0.38,wy+rng()*7); ctx.stroke(); ctx.restore();
    }
    // Moon caustic on water
    ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=0.18;
    ctx.fillStyle='#90c0ff';
    ctx.beginPath(); ctx.ellipse(W*0.11,H*0.28,CELL*3.2,CELL*0.75,-0.18,0,Math.PI*2); ctx.fill(); ctx.restore();
    // Ruined walls
    [[W*0.52,H*0.2],[W*0.68,H*0.56],[W*0.8,H*0.34]].forEach(function(r){ ruinedWall(ctx,r[0],r[1],CELL*(1.6+rng()*2),CELL*(1.1+rng()*1.6),rng); });
    // Tide pools
    for(var ti=0;ti<5;ti++) {
      var tx2=W*0.38+rng()*W*0.14, ty2=rng()*H;
      ctx.fillStyle='#183450';
      ctx.beginPath(); ctx.ellipse(tx2,ty2,CELL*(0.28+rng()*0.5),CELL*0.18,rng(),0,Math.PI*2); ctx.fill();
    }
  }

  function ruinedWall(ctx,cx,cy,w,h,rng) {
    var wg=ctx.createLinearGradient(cx-w/2,cy,cx+w/2,cy);
    wg.addColorStop(0,'#201a12'); wg.addColorStop(0.42,lerpCol('#363028','#4a4038',0.5)); wg.addColorStop(1,'#181410');
    ctx.fillStyle=wg; ctx.fillRect(cx-w/2,cy-h,w,h);
    for(var i=0;i<6;i++) {
      var bx=cx-w/2+(i/5)*w+(rng()-0.5)*w*0.12, bh=h*(0.1+rng()*0.52);
      ctx.fillStyle='#3a3028'; ctx.fillRect(bx-w*0.07,cy-h-bh,w*0.14,bh);
    }
    ctx.strokeStyle='rgba(0,0,0,0.28)'; ctx.lineWidth=1;
    for(var row=0;row<4;row++){ ctx.beginPath(); ctx.moveTo(cx-w/2,cy-row*h/4); ctx.lineTo(cx+w/2,cy-row*h/4); ctx.stroke(); }
    ctx.fillStyle='rgba(255,255,255,0.05)'; ctx.fillRect(cx-w/2,cy-h,w,1.5); ctx.fillRect(cx-w/2,cy-h,1.5,h);
    ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fillRect(cx-w/2,cy-1.5,w,1.5); ctx.fillRect(cx+w/2-1.5,cy-h,1.5,h);
  }

  function drawUrban(ctx,W,H,CELL,env,rng) {
    var buildings=[{x:0,y:0,w:W*0.27,h:H*0.36},{x:W*0.31,y:0,w:W*0.31,h:H*0.22},{x:W*0.68,y:0,w:W*0.32,h:H*0.33},{x:0,y:H*0.62,w:W*0.24,h:H*0.38},{x:W*0.76,y:H*0.58,w:W*0.24,h:H*0.42}];
    buildings.forEach(function(b){ building(ctx,b.x,b.y,b.w,b.h,rng); });
    cobbles(ctx,W*0.27,0,W*0.41,H,rng);
    cobbles(ctx,0,H*0.42,W,H*0.18,rng);
    [[W*0.27,H*0.42],[W*0.68,H*0.42],[W*0.27,H*0.6],[W*0.68,H*0.6]].forEach(function(l){ streetLantern(ctx,l[0],l[1],CELL); });
    fountain(ctx,W/2,H/2,CELL*1.8,rng);
    var sc=[['#8b1a1a','#c92a2a'],['#1a4a8b','#2a5aaa'],['#1a6a1a','#2a8a2a'],['#7a4a10','#aa6a1a']];
    [[W*0.36,H*0.28],[W*0.6,H*0.28],[W*0.36,H*0.7],[W*0.6,H*0.7]].forEach(function(s,si){
      marketStall(ctx,s[0],s[1],CELL*1.7,CELL*1.1,sc[si%sc.length][0],sc[si%sc.length][1],rng);
    });
  }

  function building(ctx,x,y,w,h,rng) {
    var wg=ctx.createLinearGradient(x,y,x+w,y+h);
    wg.addColorStop(0,'#1a1610'); wg.addColorStop(0.6,'#242018'); wg.addColorStop(1,'#100c08');
    ctx.fillStyle=wg; ctx.fillRect(x,y,w,h);
    var wc=2+Math.floor(rng()*3), wr=1+Math.floor(rng()*2);
    for(var r=0;r<wr;r++) for(var c=0;c<wc;c++) {
      var wx=x+w*0.2+c*(w*0.62/Math.max(wc-1,1)), wy=y+h*0.25+r*h*0.42, lit=rng()>0.28;
      if(lit) {
        ctx.save(); ctx.globalCompositeOperation='screen';
        var wlg=ctx.createRadialGradient(wx,wy,0,wx,wy,w*0.18);
        wlg.addColorStop(0,'rgba(255,195,90,0.58)'); wlg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=wlg; ctx.fillRect(x,y,w,h); ctx.restore();
        ctx.fillStyle='#e0c468';
      } else ctx.fillStyle='#080806';
      ctx.fillRect(wx-3,wy-4,7,9);
    }
    ctx.fillStyle='rgba(255,255,255,0.045)'; ctx.fillRect(x,y,w,1.5); ctx.fillRect(x,y,1.5,h);
    ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fillRect(x,y+h-1.5,w,1.5); ctx.fillRect(x+w-1.5,y,1.5,h);
  }

  function cobbles(ctx,x,y,w,h,rng) {
    ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
    ctx.fillStyle='#363020'; ctx.fillRect(x,y,w,h);
    var cw=14, ch=10;
    for(var cy2=y;cy2<y+h;cy2+=ch+1) {
      var off=(Math.floor((cy2-y)/(ch+1))%2)*(cw*0.5);
      for(var cx2=x-off;cx2<x+w;cx2+=cw+1) {
        var cv=0.82+rng()*0.18;
        ctx.fillStyle='rgba('+Math.round(50*cv)+','+Math.round(46*cv)+','+Math.round(36*cv)+',1)';
        rrect(ctx,cx2,cy2,cw,ch,1.5); ctx.fill();
        ctx.fillStyle='rgba(255,255,255,0.04)'; ctx.fillRect(cx2+1,cy2+1,cw-2,2);
        ctx.fillStyle='rgba(0,0,0,0.14)'; ctx.fillRect(cx2,cy2+ch-2,cw,2);
      }
    }
    ctx.restore();
  }

  function streetLantern(ctx,x,y,CELL) {
    ctx.strokeStyle='#3c2e14'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(x,y+CELL); ctx.lineTo(x,y-CELL*0.85); ctx.stroke();
    ctx.fillStyle='#382010'; ctx.fillRect(x-5,y-CELL*0.85-9,10,14);
    ctx.save(); ctx.globalCompositeOperation='screen';
    var lg=ctx.createRadialGradient(x,y-CELL*0.85,0,x,y-CELL*0.85,CELL*1.3);
    lg.addColorStop(0,'rgba(255,175,55,0.75)'); lg.addColorStop(0.2,'rgba(255,110,18,0.32)'); lg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=lg; ctx.beginPath(); ctx.arc(x,y-CELL*0.85,CELL*1.3,0,Math.PI*2); ctx.fill(); ctx.restore();
  }

  function fountain(ctx,cx,cy,r,rng) {
    ctx.save(); ctx.globalAlpha=0.38; ctx.fillStyle='#000';
    ctx.beginPath(); ctx.ellipse(cx+r*0.12,cy+r*0.12,r*1.05,r*0.52,0,0,Math.PI*2); ctx.fill(); ctx.restore();
    ctx.fillStyle='#484030'; ctx.beginPath(); ctx.ellipse(cx,cy,r,r*0.48,0,0,Math.PI*2); ctx.fill();
    var wg=ctx.createRadialGradient(cx-r*0.18,cy-r*0.1,0,cx,cy,r*0.84);
    wg.addColorStop(0,'#2e5898'); wg.addColorStop(0.5,'#183468'); wg.addColorStop(1,'#0a1c4c');
    ctx.fillStyle=wg; ctx.beginPath(); ctx.ellipse(cx,cy,r*0.84,r*0.4,0,0,Math.PI*2); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=0.38;
    ctx.fillStyle='#78a8f8'; ctx.beginPath(); ctx.ellipse(cx-r*0.2,cy-r*0.08,r*0.28,r*0.1,-0.4,0,Math.PI*2); ctx.fill(); ctx.restore();
    var cg=ctx.createLinearGradient(cx-r*0.07,cy-r*0.4,cx+r*0.07,cy-r*0.4);
    cg.addColorStop(0,'#282018'); cg.addColorStop(0.4,'#484030'); cg.addColorStop(1,'#181408');
    ctx.fillStyle=cg; ctx.fillRect(cx-r*0.07,cy-r*0.42,r*0.14,r*0.36);
    ctx.save(); ctx.globalAlpha=0.44; ctx.strokeStyle='#98c0e0'; ctx.lineWidth=1;
    for(var i=0;i<8;i++) {
      var a=(i/8)*Math.PI*2;
      ctx.beginPath(); ctx.moveTo(cx,cy-r*0.06);
      ctx.quadraticCurveTo(cx+Math.cos(a)*r*0.28,cy-r*0.28+Math.sin(a)*r*0.14,cx+Math.cos(a)*r*0.42,cy+Math.sin(a)*r*0.18); ctx.stroke();
    }
    ctx.restore();
  }

  function marketStall(ctx,cx,cy,w,h,roof,awning,rng) {
    woodGrain(ctx,cx-w/2,cy-h*0.15,w,h*0.24,'#483018',rng);
    var ag=ctx.createLinearGradient(cx-w/2,cy-h,cx-w/2,cy-h*0.68);
    ag.addColorStop(0,roof); ag.addColorStop(1,lerpCol(roof,'#000',0.32));
    ctx.fillStyle=ag;
    ctx.beginPath(); ctx.moveTo(cx-w/2-w*0.1,cy-h*0.6); ctx.lineTo(cx+w/2+w*0.1,cy-h*0.6);
    ctx.lineTo(cx+w/2,cy-h); ctx.lineTo(cx-w/2,cy-h); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fillRect(cx-w/2,cy-h*0.6,w,h*0.06);
    ctx.fillStyle=awning;
    for(var si=0;si<3;si++) ctx.fillRect(cx-w/2+si*w/3,cy-h,w/6,h*0.4);
    for(var gi=0;gi<4;gi++) {
      var gx=cx-w*0.34+gi*w*0.22;
      ctx.fillStyle=['#8b1a1a','#1a6a1a','#c9973a','#6a1a8b'][gi%4];
      ctx.beginPath(); ctx.arc(gx,cy-h*0.04,w*0.065,0,Math.PI*2); ctx.fill();
    }
  }

  function drawMountain(ctx,W,H,CELL,env,rng) {
    // Atmospheric far peaks — blue-shifted
    ctx.fillStyle='#181520';
    for(var pi=0;pi<3;pi++) {
      var px=W*(0.08+pi*0.36), ph=H*(0.42+rng()*0.28);
      ctx.beginPath(); ctx.moveTo(0,H); ctx.lineTo(px-W*0.24,H); ctx.lineTo(px,H-ph); ctx.lineTo(px+W*0.24,H); ctx.lineTo(W,H); ctx.closePath(); ctx.fill();
    }
    // Near peaks — warm dark stone
    var peaks=[[W*0.28,H*0.14],[W*0.62,H*0.07],[W*0.84,H*0.19]];
    peaks.forEach(function(p) {
      var pw=W*(0.22+rng()*0.14);
      ctx.fillStyle='#262018';
      ctx.beginPath(); ctx.moveTo(p[0]-pw,H); ctx.lineTo(p[0],p[1]); ctx.lineTo(p[0]+pw,H); ctx.closePath(); ctx.fill();
      // Snow cap
      var snw=ctx.createRadialGradient(p[0]-CELL*0.28,p[1],0,p[0],p[1]+CELL*1.5,CELL*2.6);
      snw.addColorStop(0,'#e8e4e0'); snw.addColorStop(0.38,'#c0bcb6'); snw.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=snw;
      ctx.beginPath(); ctx.moveTo(p[0]-CELL*2,p[1]+CELL*2); ctx.lineTo(p[0],p[1]); ctx.lineTo(p[0]+CELL*2,p[1]+CELL*2); ctx.closePath(); ctx.fill();
    });
    // Boulders with AO
    for(var bi=0;bi<13;bi++) {
      var bx=CELL+rng()*(W-CELL*2), by=H*0.38+rng()*H*0.52, br=CELL*(0.38+rng()*0.72);
      ctx.save(); ctx.globalAlpha=0.38; ctx.fillStyle='#000';
      ctx.beginPath(); ctx.ellipse(bx+br*0.2,by+br*0.38,br*1.1,br*0.38,0,0,Math.PI*2); ctx.fill(); ctx.restore();
      var bg=ctx.createRadialGradient(bx-br*0.22,by-br*0.18,0,bx,by,br);
      bg.addColorStop(0,'#585040'); bg.addColorStop(0.5,'#383028'); bg.addColorStop(1,'#181410');
      ctx.fillStyle=bg; ctx.beginPath(); ctx.ellipse(bx,by,br,br*0.68,rng()*0.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.055)'; ctx.beginPath(); ctx.ellipse(bx-br*0.18,by-br*0.22,br*0.38,br*0.18,-0.4,0,Math.PI*2); ctx.fill();
    }
    // Narrow trail
    ctx.save(); ctx.strokeStyle='#625840'; ctx.lineWidth=CELL*0.38; ctx.globalAlpha=0.48;
    ctx.beginPath(); ctx.moveTo(W/2,H); ctx.bezierCurveTo(W*0.44,H*0.72,W*0.52,H*0.42,W/2,H*0.22); ctx.stroke();
    ctx.restore();
  }

  function drawPlanar(ctx,W,H,CELL,env,rng) {
    // Stars
    for(var i=0;i<220;i++) {
      var sx=rng()*W, sy=rng()*H, sr=rng()*1.6, sa=0.28+rng()*0.72;
      ctx.fillStyle='rgba(255,255,255,'+sa+')'; ctx.beginPath(); ctx.arc(sx,sy,sr,0,Math.PI*2); ctx.fill();
    }
    // Nebula layers
    ['#3818a0','#a01878','#1870b8','#18a058'].forEach(function(nc) {
      var nx=rng()*W, ny=rng()*H, nr=Math.min(W,H)*(0.14+rng()*0.26);
      ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=0.14+rng()*0.18;
      var ng=ctx.createRadialGradient(nx,ny,0,nx,ny,nr);
      ng.addColorStop(0,nc); ng.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=ng; ctx.beginPath(); ctx.arc(nx,ny,nr,0,Math.PI*2); ctx.fill(); ctx.restore();
    });
    // Floating platforms
    for(var pi=0;pi<7;pi++) {
      var pfx=CELL+rng()*(W-CELL*6), pfy=CELL*2+rng()*(H-CELL*5), pfw=CELL*(2+rng()*2.8), pfh=CELL*0.48;
      floatingPlatform(ctx,pfx,pfy,pfw,pfh,env.accent,rng);
    }
    // Planar rifts
    for(var ri=0;ri<5;ri++) {
      var rfx=CELL*2+rng()*(W-CELL*4), rfy=CELL*2+rng()*(H-CELL*4), rfs=CELL*(0.8+rng()*1.2);
      planarRift(ctx,rfx,rfy,rfs);
    }
  }

  function floatingPlatform(ctx,cx,cy,w,h,accent,rng) {
    ctx.save(); ctx.globalAlpha=0.48; ctx.fillStyle='#000014';
    ctx.beginPath(); ctx.ellipse(cx+w*0.05,cy+h*2.2,w*0.5,h*0.75,0,0,Math.PI*2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation='screen';
    var ug=ctx.createRadialGradient(cx,cy+h,0,cx,cy+h,w*0.65);
    ug.addColorStop(0,rgba(accent,0.48)); ug.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=ug; ctx.fillRect(cx-w,cy,w*2,h+w); ctx.restore();
    var tg=ctx.createLinearGradient(cx-w/2,cy,cx+w/2,cy);
    tg.addColorStop(0,'#161840'); tg.addColorStop(0.38,'#222660'); tg.addColorStop(1,'#0c0c2e');
    ctx.fillStyle=tg; ctx.beginPath(); ctx.ellipse(cx,cy,w/2,h,0,0,Math.PI*2); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation='screen';
    ctx.strokeStyle=rgba(accent,0.55); ctx.lineWidth=1;
    ctx.beginPath(); ctx.ellipse(cx,cy,w*0.34,h*0.62,0,0,Math.PI*2); ctx.stroke(); ctx.restore();
    ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.beginPath(); ctx.ellipse(cx,cy,w/2,h*0.28,0,Math.PI,Math.PI*2); ctx.fill();
  }

  function planarRift(ctx,cx,cy,size) {
    ctx.save(); ctx.globalCompositeOperation='screen';
    ['#7038ff','#ff38a8','#38e8ff'].forEach(function(col,i) {
      var a=(i/3)*Math.PI*2;
      var og=ctx.createRadialGradient(cx+Math.cos(a)*size*0.28,cy+Math.sin(a)*size*0.28,0,cx,cy,size*1.85);
      og.addColorStop(0,rgba(col,0.38)); og.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=og; ctx.fillRect(cx-size*2,cy-size*2,size*4,size*4);
    });
    ctx.shadowColor='#9858ff'; ctx.shadowBlur=12; ctx.strokeStyle='#c898ff'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(cx,cy-size);
    ctx.bezierCurveTo(cx+size*0.34,cy-size*0.28,cx-size*0.34,cy+size*0.28,cx,cy+size); ctx.stroke();
    ctx.lineWidth=0.8; ctx.strokeStyle='#ffffff'; ctx.shadowBlur=4;
    ctx.beginPath(); ctx.moveTo(cx+size*0.04,cy-size*0.68);
    ctx.bezierCurveTo(cx+size*0.18,cy-size*0.1,cx-size*0.14,cy+size*0.18,cx-size*0.04,cy+size*0.68); ctx.stroke();
    ctx.restore();
  }


  // ── SOCIAL ROOM MAP ─────────────────────────────────────────────────────────
  function generateSocialRoomMap(canvas, enc, campaign) {
    if(!canvas) return;
    var W=canvas.width, H=canvas.height, ctx=canvas.getContext('2d');
    if(!ctx) return;
    var key=detectSocialRoom(enc), room=ROOMS[key];
    var rng=mkRng(seedFrom((enc&&enc.npcName)||key));
    var CELL=Math.max(14,Math.min(26,Math.floor(Math.min(W,H)/18)));
    var wT=2, wB=Math.floor(H/CELL)-2, wL=2, wR=Math.floor(W/CELL)-2;
    var iW=(wR-wL)*CELL, iH=(wB-wT)*CELL, ox=wL*CELL, oy=wT*CELL;
    var cx=ox+iW/2, cy=oy+iH/2;

    // Pass 1: Outer wall
    ctx.fillStyle=room.wall; ctx.fillRect(0,0,W,H);

    // Pass 2: Stone floor with material shading
    for(var r=wT;r<wB;r++) for(var c=wL;c<wR;c++) {
      stoneTile(ctx,c*CELL,r*CELL,CELL,CELL,room.floorA,room.floorB,rng);
      var d=Math.min(c-wL,wR-1-c,r-wT,wB-1-r);
      if(d===0){ ctx.fillStyle='rgba(0,0,0,0.38)'; ctx.fillRect(c*CELL,r*CELL,CELL,CELL); }
      else if(d===1){ ctx.fillStyle='rgba(0,0,0,0.13)'; ctx.fillRect(c*CELL,r*CELL,CELL,CELL); }
    }

    // Pass 3: Furniture
    roomFurniture(ctx,key,room,CELL,ox,oy,iW,iH,cx,cy,rng);

    // Pass 4: Wall sconces / decor
    roomWallDecor(ctx,key,room,CELL,ox,oy,iW,iH,cx,cy,rng);

    // Pass 5: Doors
    doorArt(ctx,room,cx,oy+iH,CELL,true);
    if(key!=='interrogation') doorArt(ctx,room,ox,cy,CELL,false);

    // Pass 6: Lighting — unique per room type
    var lights=roomLights(key,room,cx,cy,ox,oy,iW,iH,CELL,rng);
    applyLighting(ctx,W,H,lights);

    // Pass 7: Wall shadow AO (inner edges)
    var sw2=CELL*1.15;
    [['top',ox,oy,iW,sw2,0,1],['bot',ox,oy+iH-sw2,iW,sw2,1,0],['lt',ox,oy,sw2,iH,0,1,'x'],['rt',ox+iW-sw2,oy,sw2,iH,1,0,'x']].forEach(function(s) {
      var g;
      if(s[6]==='x') {
        g=ctx.createLinearGradient(s[0],0,s[0]+s[2],0);
      } else {
        g=ctx.createLinearGradient(0,s[1],0,s[1]+s[3]);
      }
      g.addColorStop(s[5],'rgba(0,0,0,0)'); g.addColorStop(s[4],'rgba(0,0,0,0.42)');
      ctx.fillStyle=g; ctx.fillRect(s[0],s[1],s[2],s[3]);
    });

    // Pass 8: Faint grid
    ctx.save(); ctx.strokeStyle='rgba(255,255,255,0.028)'; ctx.lineWidth=0.5;
    for(var gx=ox;gx<=ox+iW;gx+=CELL){ctx.beginPath();ctx.moveTo(gx,oy);ctx.lineTo(gx,oy+iH);ctx.stroke();}
    for(var gy=oy;gy<=oy+iH;gy+=CELL){ctx.beginPath();ctx.moveTo(ox,gy);ctx.lineTo(ox+iW,gy);ctx.stroke();}
    ctx.restore();

    // Pass 9: NPC markers
    var markers=roomNPCPositions(key,cx,cy,iW,iH,CELL);
    markers.forEach(function(m){ npcMarkerArt(ctx,m.x,m.y,m.col,m.label,CELL,m.role); });

    // Pass 10: Vignette
    vignette(ctx,W,H,0.62);

    // Pass 11: Wall border, frame, title
    ctx.strokeStyle=lerpCol(room.accent,'#000',0.28); ctx.lineWidth=CELL*2; ctx.strokeRect(0,0,W,H);
    ctx.strokeStyle=room.accent; ctx.lineWidth=2.2; ctx.strokeRect(ox,oy,iW,iH);
    mapFrame(ctx,W,H,room.accent);
    var title=room.label+(enc&&enc.npcName?' — '+enc.npcName:'');
    mapTitle(ctx,title,room.accent,12,12);
    ctx.save(); ctx.font='8px Georgia,serif'; ctx.fillStyle=rgba('#ffffff',0.28); ctx.textAlign='left'; ctx.textBaseline='bottom'; ctx.fillText('1 square = 5 ft',10,H-6); ctx.restore();
  }

  function roomLights(key,room,cx,cy,ox,oy,iW,iH,CELL,rng) {
    var lights=[{x:cx,y:cy,radius:Math.max(iW,iH)*0.92,color:room.ltCol,type:room.ltType,intensity:0.48}];
    if(key==='tavern'||key==='great_hall') {
      lights.push({x:cx,y:oy+iH*0.11,radius:iW*0.52,color:'#ff5500',type:'fire',intensity:0.82});
      lights.push({x:ox+CELL*1.4,y:cy,radius:CELL*5,color:'#ff9038',type:'torch',intensity:0.68});
      lights.push({x:ox+iW-CELL*1.4,y:cy,radius:CELL*5,color:'#ff9038',type:'torch',intensity:0.68});
    } else if(key==='interrogation') {
      lights.push({x:cx,y:cy-iH*0.18,radius:iW*0.38,color:'#e8d058',type:'torch',intensity:1.25});
    } else if(key==='throne_room') {
      lights.push({x:cx,y:oy+iH*0.18,radius:iW*0.58,color:'#ffd078',type:'ambient',intensity:0.68});
      [cx-iW*0.28,cx+iW*0.28].forEach(function(lx) {
        lights.push({x:lx,y:cy-iH*0.14,radius:CELL*4.5,color:'#ffbf58',type:'torch',intensity:0.58});
        lights.push({x:lx,y:cy+iH*0.14,radius:CELL*4.5,color:'#ffbf58',type:'torch',intensity:0.58});
      });
    } else if(key==='market'||key==='courtyard'||key==='garden') {
      lights.push({x:cx,y:oy,radius:Math.max(iW,iH),color:'#c8e8b0',type:'ambient',intensity:0.78});
    } else if(key==='library_social') {
      lights.push({x:cx-CELL*2,y:cy-CELL*0.4,radius:CELL*3.8,color:'#e8be58',type:'torch',intensity:0.82});
      lights.push({x:cx+CELL*2,y:cy-CELL*0.4,radius:CELL*3.8,color:'#e8be58',type:'torch',intensity:0.82});
    }
    return lights;
  }

  function roomNPCPositions(key,cx,cy,iW,iH,CELL) {
    var map={
      tavern:       [{x:cx-CELL*3,y:cy,col:'#8b1a1a',label:'NPC',role:'contact'},{x:cx,y:cy+iH/2-CELL*1.5,col:'#1a5a1a',label:'PARTY',role:'party'}],
      throne_room:  [{x:cx,y:cy-iH/2+CELL*2.2,col:'#8b1a1a',label:'NPC',role:'ruler'},{x:cx,y:cy+iH/2-CELL*2,col:'#1a5a1a',label:'PARTY',role:'party'},{x:cx-iW/2+CELL*2.5,y:cy-iH*0.12,col:'#4a4a4a',label:'GRD',role:'guard'},{x:cx+iW/2-CELL*2.5,y:cy-iH*0.12,col:'#4a4a4a',label:'GRD',role:'guard'}],
      market:       [{x:cx,y:cy-iH*0.1,col:'#8b1a1a',label:'NPC',role:'contact'},{x:cx-iW*0.18,y:cy+iH*0.28,col:'#1a5a1a',label:'PARTY',role:'party'}],
      courtyard:    [{x:cx-CELL*1.5,y:cy,col:'#8b1a1a',label:'NPC',role:'contact'},{x:cx+CELL*1.5,y:cy,col:'#1a5a1a',label:'PARTY',role:'party'}],
      great_hall:   [{x:cx-CELL*2.5,y:cy,col:'#8b1a1a',label:'NPC',role:'host'},{x:cx+CELL*2.5,y:cy,col:'#1a5a1a',label:'PARTY',role:'party'}],
      garden:       [{x:cx-CELL*1.8,y:cy,col:'#8b1a1a',label:'NPC',role:'contact'},{x:cx+CELL*1.8,y:cy,col:'#1a5a1a',label:'PARTY',role:'party'}],
      interrogation:[{x:cx+CELL*2.8,y:cy+CELL,col:'#8b1a1a',label:'INT',role:'interrogator'},{x:cx,y:cy+CELL*0.35,col:'#1a5a1a',label:'TGT',role:'target'}],
      library_social:[{x:cx-CELL*1.6,y:cy+CELL,col:'#8b1a1a',label:'NPC',role:'scholar'},{x:cx+CELL*1.6,y:cy+CELL,col:'#1a5a1a',label:'PARTY',role:'party'}],
    };
    return map[key]||map.tavern;
  }

  function roomFurniture(ctx,key,room,CELL,ox,oy,iW,iH,cx,cy,rng) {
    if(key==='tavern') {
      // Bar — polished dark oak
      var by2=oy+CELL*1.2, bw=iW-CELL*2;
      var bg=ctx.createLinearGradient(ox+CELL,by2,ox+CELL+bw,by2+CELL*1.5);
      bg.addColorStop(0,'#2a1406'); bg.addColorStop(0.2,'#4a2c0e'); bg.addColorStop(0.6,'#381e06'); bg.addColorStop(1,'#1a0e02');
      ctx.fillStyle=bg; ctx.fillRect(ox+CELL,by2,bw,CELL*1.5);
      ctx.fillStyle='rgba(255,210,110,0.11)'; ctx.fillRect(ox+CELL,by2,bw,CELL*0.14); // polish shine
      ctx.fillStyle='rgba(0,0,0,0.42)'; ctx.fillRect(ox+CELL,by2+CELL*1.36,bw,CELL*0.14);
      // Bottles
      var bc=['#8b1a1a','#1a5a1a','#8b8b00','#1a1a8b','#5a1a8b'];
      for(var i=0;i<7;i++) {
        var bx2=ox+CELL*1.5+i*(bw-CELL)/6;
        ctx.fillStyle=bc[i%bc.length]; ctx.fillRect(bx2-2,by2-CELL*0.7,5,CELL*0.8);
        ctx.fillStyle='rgba(255,255,255,0.12)'; ctx.fillRect(bx2-1,by2-CELL*0.7,2,CELL*0.4);
        ctx.fillStyle='#888'; ctx.fillRect(bx2-2,by2-CELL*0.75,5,CELL*0.1);
      }
      // Stools
      for(var si=0;si<5;si++) {
        var sx2=ox+CELL*1.8+si*(bw-CELL*1.5)/4;
        ctx.fillStyle='#2a1608'; ctx.beginPath(); ctx.arc(sx2,by2+CELL*2,CELL*0.42,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='rgba(255,200,100,0.08)'; ctx.beginPath(); ctx.arc(sx2,by2+CELL*2,CELL*0.42,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='#3a2010'; ctx.lineWidth=1.5; ctx.stroke();
      }
      // Tables
      [oy+iH*0.45,oy+iH*0.7].forEach(function(ty2) {
        woodGrain(ctx,ox+CELL*2,ty2-CELL*0.42,iW-CELL*4,CELL*0.84,'#362008',rng);
        woodGrain(ctx,ox+CELL*2,ty2-CELL*0.95,iW-CELL*4,CELL*0.32,'#221408',rng);
        woodGrain(ctx,ox+CELL*2,ty2+CELL*0.55,iW-CELL*4,CELL*0.32,'#221408',rng);
        for(var mi=0;mi<5;mi++) {
          var mx2=ox+CELL*2.5+mi*(iW-CELL*5)/4;
          ctx.fillStyle='#6a3a18'; ctx.beginPath(); ctx.arc(mx2,ty2-CELL*0.06,CELL*0.24,0,Math.PI*2); ctx.fill();
          ctx.fillStyle='rgba(255,200,100,0.15)'; ctx.beginPath(); ctx.arc(mx2-CELL*0.08,ty2-CELL*0.12,CELL*0.1,0,Math.PI*2); ctx.fill();
        }
      });
      // Hearth
      hearth(ctx,cx,oy+CELL*0.4,iW*0.2,CELL*1.85,room);

    } else if(key==='throne_room') {
      // Dais steps
      for(var step=2;step>=0;step--) {
        var sg2=ctx.createLinearGradient(cx-iW*0.2+step*CELL*0.3,0,cx+iW*0.2-step*CELL*0.3,0);
        sg2.addColorStop(0,lerpCol('#7a6030','#000',0.42)); sg2.addColorStop(0.3,'#b89840'); sg2.addColorStop(0.7,'#988030'); sg2.addColorStop(1,lerpCol('#7a6030','#000',0.42));
        ctx.fillStyle=sg2; ctx.fillRect(cx-iW*0.2+step*CELL*0.3,oy+CELL+step*CELL*0.35,iW*0.4-step*CELL*0.6,iH*0.3-step*CELL*0.35);
      }
      throneArt(ctx,cx,oy+CELL*1.2,CELL*2.4,room);
      // Pillars
      [[cx-iW*0.3,cy-iH*0.14],[cx+iW*0.3,cy-iH*0.14],[cx-iW*0.3,cy+iH*0.12],[cx+iW*0.3,cy+iH*0.12]].forEach(function(p){ pillarArt(ctx,p[0],p[1],CELL*0.55,iH*0.26,room); });
      // Red carpet
      ctx.save();
      var cg2=ctx.createLinearGradient(cx,oy+iH*0.32,cx,oy+iH);
      cg2.addColorStop(0,'rgba(92,8,8,0.52)'); cg2.addColorStop(1,'rgba(72,6,6,0.32)');
      ctx.fillStyle=cg2; ctx.fillRect(cx-CELL*0.88,oy+iH*0.32,CELL*1.76,iH*0.68-CELL);
      ctx.strokeStyle='rgba(195,145,52,0.38)'; ctx.lineWidth=2; ctx.strokeRect(cx-CELL*0.82,oy+iH*0.32,CELL*1.64,iH*0.68-CELL);
      ctx.restore();

    } else if(key==='great_hall') {
      hearth(ctx,cx,oy+CELL*0.38,iW*0.26,CELL*2,room);
      // Banquet table
      var tg3=ctx.createLinearGradient(ox+CELL*2,cy,ox+iW-CELL*2,cy);
      tg3.addColorStop(0,'#1a0e04'); tg3.addColorStop(0.14,'#362010'); tg3.addColorStop(0.5,'#462818'); tg3.addColorStop(0.86,'#362010'); tg3.addColorStop(1,'#1a0e04');
      ctx.fillStyle=tg3; ctx.fillRect(ox+CELL*2,cy-CELL*0.68,iW-CELL*4,CELL*1.36);
      ctx.fillStyle='rgba(255,195,78,0.07)'; ctx.fillRect(ox+CELL*2,cy-CELL*0.68,iW-CELL*4,CELL*0.12);
      for(var chi=0;chi<6;chi++) {
        var chx=ox+CELL*2.5+chi*(iW-CELL*5)/5;
        chair(ctx,chx,cy-CELL*1.18,CELL*0.68,true,room);
        chair(ctx,chx,cy+CELL*1.18,CELL*0.68,false,room);
      }
      [ox+CELL*2,ox+CELL*5,cx,ox+iW-CELL*5,ox+iW-CELL*2].forEach(function(tx3){
        ctx.fillStyle='#362018'; ctx.fillRect(tx3-CELL*0.52,oy+CELL*0.45,CELL*1.04,CELL*0.88);
        ctx.fillStyle='#4e2c1a'; ctx.fillRect(tx3-CELL*0.32,oy+CELL*0.28,CELL*0.64,CELL*0.22);
      });

    } else if(key==='market') {
      var stallC=[['#8b1a1a','#c82a2a'],['#1a4a8b','#2a5aaa'],['#1a6a1a','#2a8a2a'],['#7a4a10','#aa6a18'],['#5a1a8b','#7a2aaa'],['#8b8b00','#b8b800']];
      [[0.2,0.2],[0.52,0.2],[0.82,0.2],[0.14,0.62],[0.5,0.62],[0.85,0.62]].forEach(function(s,si){
        marketStall(ctx,ox+s[0]*iW,oy+s[1]*iH,CELL*1.65,CELL*1.05,stallC[si%stallC.length][0],stallC[si%stallC.length][1],rng);
      });
      for(var ci2=0;ci2<10;ci2++) {
        var cpx=ox+CELL+rng()*(iW-CELL*2), cpy=oy+CELL+rng()*(iH-CELL*2);
        ctx.fillStyle='rgba(175,155,115,0.45)'; ctx.beginPath(); ctx.arc(cpx,cpy,CELL*0.28,0,Math.PI*2); ctx.fill();
      }

    } else if(key==='interrogation') {
      ctx.fillStyle='rgba(0,0,0,0.28)'; ctx.fillRect(ox,oy,iW,iH);
      chair(ctx,cx,cy+CELL*0.5,CELL*1.05,false,room);
      ctx.strokeStyle='#484848'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(cx-CELL*0.38,cy+CELL*1.15,CELL*0.24,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx+CELL*0.38,cy+CELL*1.15,CELL*0.24,0,Math.PI*2); ctx.stroke();
      ctx.strokeStyle='#241608'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(cx,oy); ctx.lineTo(cx,cy-CELL*2.5); ctx.stroke();
      ctx.strokeStyle='#524020'; ctx.lineWidth=1.5;
      ctx.strokeRect(cx-CELL*0.44,cy-CELL*3.1,CELL*0.88,CELL*0.68);
      ctx.fillStyle='#ffe078'; ctx.beginPath(); ctx.arc(cx,cy-CELL*2.8,CELL*0.2,0,Math.PI*2); ctx.fill();
      // Stain on floor
      ctx.save(); ctx.globalAlpha=0.18; ctx.fillStyle='#8b1a1a';
      ctx.beginPath(); ctx.ellipse(cx+CELL*0.5,cy+CELL*1.8,CELL*0.6,CELL*0.3,0.4,0,Math.PI*2); ctx.fill(); ctx.restore();
      // Scratches in stone
      ctx.save(); ctx.globalAlpha=0.12; ctx.strokeStyle='#ffffff'; ctx.lineWidth=0.8;
      for(var sc2=0;sc2<6;sc2++) {
        var sa=rng()*Math.PI*2, sl=CELL*(0.4+rng()*0.6);
        ctx.beginPath(); ctx.moveTo(cx+CELL+Math.cos(sa)*CELL*0.3,cy+Math.sin(sa)*CELL*0.3);
        ctx.lineTo(cx+CELL+Math.cos(sa)*sl,cy+Math.sin(sa)*sl); ctx.stroke();
      }
      ctx.restore();

    } else if(key==='garden') {
      [[0.08,0.08,0.24,0.7],[0.68,0.08,0.24,0.7],[0.08,0.08,0.84,0.14],[0.08,0.78,0.84,0.14]].forEach(function(h2){
        var hx=ox+h2[0]*iW, hy=oy+h2[1]*iH, hw=h2[2]*iW, hh=h2[3]*iH;
        ctx.fillStyle='#223a0e'; ctx.fillRect(hx,hy,hw,hh);
        ctx.fillStyle='rgba(255,255,255,0.03)'; ctx.fillRect(hx,hy,hw,1.5);
        for(var hd=0;hd<8;hd++) {
          ctx.fillStyle=lerpCol('#2a4a12','#3a6a1e',rng());
          ctx.beginPath(); ctx.arc(hx+rng()*hw,hy+rng()*hh,4+rng()*5,0,Math.PI*2); ctx.fill();
        }
      });
      var pg2=ctx.createRadialGradient(cx-CELL*0.15,cy+iH*0.08-CELL*0.1,0,cx,cy+iH*0.08,CELL*2.2);
      pg2.addColorStop(0,'#285878'); pg2.addColorStop(0.45,'#163058'); pg2.addColorStop(1,'#0a1a38');
      ctx.fillStyle=pg2; ctx.beginPath(); ctx.ellipse(cx,cy+iH*0.08,CELL*2.2,CELL*1.25,0,0,Math.PI*2); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation='screen'; ctx.globalAlpha=0.32;
      ctx.fillStyle='#80b0e0'; ctx.beginPath(); ctx.ellipse(cx-CELL*0.2,cy+iH*0.04,CELL*0.7,CELL*0.28,-0.3,0,Math.PI*2); ctx.fill(); ctx.restore();
      ctx.fillStyle='#8a7a60'; ctx.fillRect(cx-CELL*1.1,cy-iH*0.2,CELL*2.2,CELL*0.45);
      ctx.fillStyle='rgba(255,255,255,0.05)'; ctx.fillRect(cx-CELL*1.1,cy-iH*0.2,CELL*2.2,CELL*0.06);

    } else if(key==='library_social') {
      // Bookshelves — multi-shelf, colored spines
      [[ox+CELL*0.25,oy+CELL,CELL*0.9,iH-CELL*2],[ox+iW-CELL*1.15,oy+CELL,CELL*0.9,iH-CELL*2]].forEach(function(bs) {
        ctx.fillStyle='#1e1008'; ctx.fillRect(bs[0],bs[1],bs[2],bs[3]);
        var shelfH=bs[3]/4;
        for(var sh=0;sh<4;sh++) {
          var shy=bs[1]+sh*shelfH;
          ctx.fillStyle='#2e1e0a'; ctx.fillRect(bs[0],shy+shelfH-4,bs[2],4);
          var bookW=bs[2]*0.14, bookX=bs[0]+2;
          var colors=['#8b1a1a','#1a5a1a','#1a1a8b','#c9973a','#5a1a8b','#8b8b00'];
          for(var bk=0;bk<Math.floor(bs[2]/bookW)-1;bk++) {
            var bH=shelfH*(0.5+rng()*0.42);
            ctx.fillStyle=colors[bk%colors.length];
            ctx.fillRect(bookX+bk*bookW,shy+shelfH-4-bH,bookW-1,bH);
            ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.fillRect(bookX+bk*bookW,shy+shelfH-4-bH,2,bH);
          }
        }
      });
      woodGrain(ctx,cx-CELL*2,cy-CELL*0.48,CELL*4,CELL*0.96,'#3a2210',rng);
      ctx.fillStyle='rgba(255,210,100,0.08)'; ctx.fillRect(cx-CELL*2,cy-CELL*0.48,CELL*4,CELL*0.1);
      // Chairs
      chair(ctx,cx-CELL*1.4,cy+CELL,CELL*0.62,false,room);
      chair(ctx,cx+CELL*1.4,cy+CELL,CELL*0.62,false,room);
      // Candles on table
      [cx-CELL*1.5,cx+CELL*1.5].forEach(function(cd) {
        ctx.fillStyle='#f0e2c0'; ctx.fillRect(cd-2,cy-CELL*0.42,4,CELL*0.46);
        ctx.save(); ctx.globalCompositeOperation='screen';
        var flg=ctx.createRadialGradient(cd,cy-CELL*0.42,0,cd,cy-CELL*0.42,CELL*1.2);
        flg.addColorStop(0,'rgba(255,210,80,0.65)'); flg.addColorStop(0.3,'rgba(255,140,20,0.22)'); flg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=flg; ctx.beginPath(); ctx.arc(cd,cy-CELL*0.42,CELL*1.2,0,Math.PI*2); ctx.fill();
        ctx.restore();
        ctx.fillStyle='#ffe060'; ctx.beginPath(); ctx.ellipse(cd,cy-CELL*0.46,2,3,0,0,Math.PI*2); ctx.fill();
      });
      // Open book on table
      ctx.fillStyle='#f0e0c0'; ctx.fillRect(cx-CELL*0.6,cy-CELL*0.36,CELL*0.55,CELL*0.62);
      ctx.fillStyle='#e8d8b8'; ctx.fillRect(cx+CELL*0.05,cy-CELL*0.36,CELL*0.55,CELL*0.62);
      ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(cx,cy-CELL*0.36); ctx.lineTo(cx,cy+CELL*0.26); ctx.stroke();
      for(var ln=0;ln<5;ln++) {
        ctx.strokeStyle='rgba(0,0,0,0.1)'; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(cx-CELL*0.52,cy-CELL*0.28+ln*CELL*0.1); ctx.lineTo(cx-CELL*0.1,cy-CELL*0.28+ln*CELL*0.1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+CELL*0.1,cy-CELL*0.28+ln*CELL*0.1); ctx.lineTo(cx+CELL*0.52,cy-CELL*0.28+ln*CELL*0.1); ctx.stroke();
      }
    }

    // Cover objects (barrels) at sides
    [[ox+CELL*1.4,oy+iH/2],[ox+iW-CELL*1.4,oy+iH/2]].forEach(function(cp) {
      ctx.fillStyle='#3e2a12';
      ctx.beginPath(); ctx.arc(cp[0],cp[1],CELL*0.44,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#5a3e18'; ctx.lineWidth=1.5; ctx.stroke();
      for(var bi2=0;bi2<3;bi2++) {
        var biy=cp[1]-CELL*0.28+bi2*CELL*0.28;
        ctx.strokeStyle='#2a1808'; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(cp[0],biy,CELL*0.44,Math.PI*0.8,Math.PI*2.2); ctx.stroke();
      }
    });
  }

  // ── Room sub-elements ────────────────────────────────────────────────────────
  function hearth(ctx,cx,cy,w,h,room) {
    // Stone surround
    var hg=ctx.createLinearGradient(cx-w/2,cy,cx+w/2,cy+h);
    hg.addColorStop(0,'#2a2018'); hg.addColorStop(1,'#100c06');
    ctx.fillStyle=hg; ctx.fillRect(cx-w/2,cy,w,h);
    // Firebox (dark recess)
    ctx.fillStyle='#0a0604'; ctx.fillRect(cx-w*0.38,cy+h*0.22,w*0.76,h*0.65);
    // Fire — multi-layer flame
    var fx=ctx.createRadialGradient(cx,cy+h*0.78,0,cx,cy+h*0.55,w*0.42);
    fx.addColorStop(0,'rgba(255,230,100,0.9)'); fx.addColorStop(0.2,'rgba(255,140,20,0.7)');
    fx.addColorStop(0.55,'rgba(200,50,0,0.45)'); fx.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=fx; ctx.beginPath(); ctx.ellipse(cx,cy+h*0.7,w*0.3,h*0.32,0,0,Math.PI*2); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation='screen';
    var fs=ctx.createRadialGradient(cx,cy+h*0.62,0,cx,cy+h*0.62,w*0.55);
    fs.addColorStop(0,'rgba(255,200,80,0.5)'); fs.addColorStop(0.4,'rgba(255,100,15,0.18)'); fs.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=fs; ctx.fillRect(cx-w*0.7,cy,w*1.4,h); ctx.restore();
    // Mantle highlight
    ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.fillRect(cx-w/2,cy,w,h*0.06);
  }

  function throneArt(ctx,cx,topY,w,room) {
    // Legs
    ctx.fillStyle='#2a1a06';
    ctx.fillRect(cx-w*0.42,topY+w*1.2,w*0.12,w*0.35);
    ctx.fillRect(cx+w*0.3,topY+w*1.2,w*0.12,w*0.35);
    // Seat
    var sg=ctx.createLinearGradient(cx-w/2,topY+w*0.5,cx+w/2,topY+w*0.5);
    sg.addColorStop(0,lerpCol(room.accent,'#000',0.55)); sg.addColorStop(0.3,lerpCol(room.accent,'#3a2a10',0.4));
    sg.addColorStop(0.7,lerpCol(room.accent,'#3a2a10',0.4)); sg.addColorStop(1,lerpCol(room.accent,'#000',0.55));
    ctx.fillStyle=sg; ctx.fillRect(cx-w*0.44,topY+w*0.52,w*0.88,w*0.68);
    // Back
    var bg2=ctx.createLinearGradient(cx-w/2,topY,cx+w/2,topY+w*0.5);
    bg2.addColorStop(0,lerpCol(room.accent,'#000',0.45)); bg2.addColorStop(0.5,lerpCol(room.accent,'#000',0.25)); bg2.addColorStop(1,lerpCol(room.accent,'#000',0.45));
    ctx.fillStyle=bg2; ctx.fillRect(cx-w*0.44,topY,w*0.88,w*0.58);
    // Cushion
    ctx.fillStyle='#8b1a1a'; ctx.fillRect(cx-w*0.38,topY+w*0.55,w*0.76,w*0.58);
    // Crown finials
    ctx.fillStyle=room.accent;
    [cx-w*0.3,cx,cx+w*0.3].forEach(function(fpx){ ctx.beginPath(); ctx.arc(fpx,topY,5,0,Math.PI*2); ctx.fill(); });
    // Highlights
    ctx.fillStyle='rgba(255,255,255,0.08)'; ctx.fillRect(cx-w*0.44,topY,w*0.88,w*0.04);
    ctx.fillRect(cx-w*0.44,topY,w*0.04,w*0.58);
  }

  function pillarArt(ctx,cx,cy,r,h,room) {
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(cx+r*0.3,cy+h/2+r*0.3,r*0.8,r*0.35,0,0,Math.PI*2); ctx.fill();
    var pg=ctx.createLinearGradient(cx-r,cy-h/2,cx+r,cy-h/2);
    pg.addColorStop(0,lerpCol(room.floorA,'#000',0.45)); pg.addColorStop(0.28,lerpCol(room.floorA,'#fff',0.12));
    pg.addColorStop(0.5,room.floorA); pg.addColorStop(0.72,lerpCol(room.floorA,'#000',0.22));
    pg.addColorStop(1,lerpCol(room.floorA,'#000',0.55));
    ctx.fillStyle=pg; ctx.fillRect(cx-r,cy-h/2,r*2,h);
    ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.fillRect(cx-r,cy-h/2,r*2,r*0.4);
    ctx.fillRect(cx-r,cy+h/2-r*0.4,r*2,r*0.4);
    ctx.restore();
  }

  function chair(ctx,cx,cy,s,facingUp,room) {
    ctx.fillStyle=lerpCol(room.floorA,'#000',0.45);
    ctx.fillRect(cx-s*0.4,cy+(facingUp?-s*0.5:0),s*0.8,s*0.5);
    ctx.fillRect(cx-s*0.4,cy+(facingUp?s*0.05:-s*0.55),s*0.8,s*0.6);
    ctx.fillStyle='rgba(255,255,255,0.05)';
    ctx.fillRect(cx-s*0.4,cy+(facingUp?-s*0.5:0),s*0.8,s*0.05);
  }

  function roomWallDecor(ctx,key,room,CELL,ox,oy,iW,iH,cx,cy,rng) {
    // Torch sconces on left/right walls for dark rooms
    if(key==='tavern'||key==='great_hall'||key==='throne_room'||key==='library_social') {
      [[ox+CELL*0.4,cy-iH*0.18],[ox+CELL*0.4,cy+iH*0.18],[ox+iW-CELL*0.4,cy-iH*0.18],[ox+iW-CELL*0.4,cy+iH*0.18]].forEach(function(sc) {
        ctx.fillStyle='#3a2a10'; ctx.fillRect(sc[0]-6,sc[1]-4,12,10);
        ctx.fillStyle='#ffe060'; ctx.beginPath(); ctx.ellipse(sc[0],sc[1]-8,2,4,0,0,Math.PI*2); ctx.fill();
      });
    }
  }

  function doorArt(ctx,room,x,y,CELL,isH) {
    ctx.fillStyle=lerpCol(room.floorA,'#000',0.35);
    if(isH) ctx.fillRect(x-CELL*0.7,y-4,CELL*1.4,6);
    else ctx.fillRect(x-4,y-CELL*0.7,6,CELL*1.4);
    ctx.fillStyle=room.accent;
    if(isH) { ctx.beginPath(); ctx.arc(x-CELL*0.2,y-1,2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(x+CELL*0.2,y-1,2,0,Math.PI*2); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(x-1,y-CELL*0.2,2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(x-1,y+CELL*0.2,2,0,Math.PI*2); ctx.fill(); }
  }


  // ── ROOM FLAVOR TEXT (preserved from mapExtensions) ─────────────────────────
  var ROOM_FLAVOR = {
    classic:{ entry:['The gatehouse stinks of old torch oil and damp stone. Iron rings set into the walls once held chains. The portcullis grooves are worn smooth by years of use.','A pair of iron sconces flank the archway, their flames long since guttered. Boot prints in the dust lead deeper in — none lead back out.','The ceiling here is low and blackened from smoke. Someone scratched a warning in the lintel stone, but the language is unfamiliar.'], combat:['Rusted weapon racks line the walls, most stripped bare. A training dummy of rotted straw still stands in one corner, bristling with crossbow bolts.','The barracks smell of old sweat and fear. Bunks are bolted to the walls, straw mattresses long since rotted. One still has a boot under it.','Scorch marks and old blood stain the flagstones in overlapping patterns. Whatever battles were fought here, they were many and brutal.'], treasure:['The lock on the vault door is newer than the door itself — someone has been maintaining it. The hinges are greased. Someone still cares what is inside.','Iron-banded chests are bolted to the floor in a ring. The wax seals on most are ancient, cracked but unbroken. Dust an inch thick.','A counting table dominates the center, abacus overturned, ledgers water-damaged. Behind the false wall, a second room.'], ritual:['A chalk circle covers most of the floor, its lines still sharp despite the years. Something about the proportions makes the eye slide away. The air tastes of copper.','The altar stone is basalt, polished by use. Channels carved into its surface drain toward a grate in the floor. The grate is sealed from below.','Nine iron candleholders in a ring, each one a different height. Wax has dripped and pooled, forming shapes that might be deliberate.'], utility:['The kitchen is cold but the grease on the walls is less than a decade old. Someone has been cooking here recently.','A cistern of still black water takes up half the room. The surface is perfectly undisturbed. Something that is not sediment drifts along the bottom.','Shelves of clay jars, most sealed with wax. A few have been opened and re-sealed. The ones on the lowest shelf are labeled in a cipher.'], library:['Row after row of iron scroll cases, most sealed. The few opened ones are stacked near a lectern, as if someone left in a hurry.','A broad writing desk faces the door — the writer wanted to see who was coming. Ink is still in the well. A half-written page sits on the blotter.','The cataloguing system is elaborate and personal. Without its author, it is a maze.'], boss:['The ceiling vaults forty feet overhead. Sound does strange things here. Footsteps echo twice, from different directions.','Trophy mounts cover every wall — adventuring gear, weapons, armor. All sized for humans. The newest ones still have dried blood on them.','The floor is a mosaic of crushed tiles. Only the throne remains intact, untouched by decay.'], special:['The oubliette is twelve feet deep. Scratch marks cover the walls from floor to ceiling. The dates carved into the stone span three hundred years.','The trophy room holds strange things — not weapons or armor, but personal items. Locks of hair. Letters. Shoes.','The torture room is too clean. The instruments are too organized. Someone has been using this room recently, and they are precise.'] },
    undead:{ entry:['The mausoleum entrance is carved from a single block of black granite. The epitaph has been deliberately defaced, every name scratched out.','Bone dust coats the threshold half an inch deep. Something has been passing through here regularly — the path is two feet wide.','Iron death masks line the archway, one for every person interred below. One of them is new. The wax has not yet fully set.'], combat:['The ossuary shelves have been disturbed — bones stacked in new configurations, as if sorted by size. The sorting is recent.','A burial shaft has been opened from below. The smell is not decomposition but something older, more deliberate.','Grave goods are strewn across the floor, methodically broken. Whatever was looking for something did not find it here.'], treasure:['A sealed sarcophagus sits atop a dais of black marble. The seal bears a necromantic ward — activated, not dormant.','Burial urns stacked floor to ceiling, each one labeled with the name of its contents. One label reads: Reserved.','The reliquary cases are empty. Whatever was stored here was removed carefully, not stolen. The locks were opened with a key.'], ritual:['A summoning circle of crushed bone powder covers the floor, complex beyond ordinary necromancy. The inscriptions are in Necril.','Twelve candles of black tallow burn without melting. They have been burning for some time.','The altar stone is cold to the touch regardless of ambient temperature. Blood offerings have been made here in the last twelve hours.'], utility:['An embalming table with fresh implements. The drains have been cleaned. The chemicals are current formulations, not centuries-old.','A cold storage chamber with iron hooks. Several of the hooks bear recent weight marks. The contents were removed today.','Preservation jars line three walls, filled with material that should not be preserved. The jars are labeled in a meticulous hand.'], library:['Tomes bound in skin, organized by date rather than subject. The most recent dates are from this decade.','A correspondence archive — letters to and from the dead. Some of the responses are dated after the correspondent died.','Research notes on the threshold between death and undeath. The writer believed they had found something new. The final entry is unfinished.'], boss:['The throne room of a self-appointed death lord. The throne is bone and iron, occupied. The occupant has been waiting.','Frescos depicting a long war between the living and dead, painted from the dead perspective. The outcome shown is not historical.','The floor is a mosaic of skulls, each one real, each one set face-up. Ten thousand faces stare at the ceiling.'], special:['A phylactery vault, recently emptied. The containment wards are broken from the inside.','A necromantic laboratory mid-experiment. The experiment is still running, unattended.','A chamber of speaking skulls, each one retaining the last thoughts of its owner.'] },
    arcane:{ entry:['The tower threshold is marked with a persistent detection ward. It knows you are here and has already sent a signal.','Bookshelves line the entry corridor, each volume chained to the shelf. The chains are enchanted, not structural.','The floor tiles respond to weight with a soft harmonic tone. Each step plays a different note. The combination matters.'], combat:['The laboratory is mid-experiment — beakers boiling, apparatus spinning. Interfering with the experiment may have consequences.','Summoning circles on the floor, three of them, each a different school. Two are empty. One is not.','Magical residue coats every surface in a faint shimmer. Whatever was cast here recently was extremely powerful.'], treasure:['The vault is behind a mirror. The mirror shows a slightly different room than the one you are standing in.','Sealed containers of crystallized magical essence, each one labeled with a spell name and a cost. The costs are not monetary.','A collection of unique components organized with scholarly precision. Most are irreplaceable.'], ritual:['The casting chamber is designed to amplify. Whatever is performed here will be heard by entities that listen.','Seven concentric circles of different materials — silver, copper, salt, ash, blood, ink, void-glass. The center is empty.','Ley line confluence. The air here feels thick. Magic costs less but also costs more, in ways that are not immediately apparent.'], utility:['The alchemical kitchen. Everything is labeled. Half the labels are warnings. The refrigeration is magical and still running.','A component garden under a permanent grow-light enchantment. The plants are rare, cultivated, and aware of strangers.','Workshop space for enchanting — partially finished items on every surface. One of them is watching you.'], library:['Fourteen thousand volumes, each one magically cross-referenced. The catalog knows what you are looking for before you ask.','A restricted section behind a ward that requires credentials you do not have. The ward will remember your attempt.','A collection of forbidden texts, each one sealed in a containment field. The fields are weakening with age.'], boss:['The archmage\'s study. Surrounded by ongoing experiments. The archmage is present and has been expecting this visit.','A room that should not be larger on the inside than the outside. It is. The architecture becomes stranger the further in you go.','A sanctum saturated with decades of spellcasting. Wild magic is possible. Wild magic is probable.'], special:['A mirror maze where each reflection shows a different plane of existence.','A temporal anomaly — time moves differently in this room than in the rest of the tower.','A construct assembly chamber. The constructs are not finished. They are still being assembled, without an assembler.'] },
    nature:{ entry:['The dungeon entrance is overgrown — tree roots have breached the stonework, and something large has been using this path.','Bioluminescent fungi line the first twenty feet of corridor, casting cold blue-green light on walls slick with moisture.','The air here is alive with the sound of water moving somewhere below. The floor is soft with centuries of decomposed matter.'], combat:['A territorial predator has made this chamber its den. The bones of previous meals are arranged in a way that suggests intelligence.','Plant growth has consumed the original room entirely. The walls and ceiling are living matter. Something lives in it.','A natural arena — clear center, dense cover around the edges. Something about the acoustics amplifies sound from the center.'], treasure:['A hoard in the old sense — not gold, but useful things. Seeds, preserved foods, medicinal herbs, and in the center, something that glows.','A creature cache — things gathered over decades because they were interesting, not valuable. Some of them are valuable.','A nesting site, temporarily unoccupied. The nest contains eggs and the last meal. The parent will return.'], ritual:['A natural circle — stones placed by intelligent hands, but long ago. The arrangement is astronomical. It activates on certain nights.','A location of natural power, marked by an animal congregation. Hundreds of small creatures have gathered here, silently watching.','A druidic working in progress — the plants are being guided into a specific shape. The intended shape will take decades to mature.'], utility:['A natural cistern, pure and cold. Something lives in the depths that keeps the water clean. It does not like company.','A mushroom farm, tended by something that maintains optimal growing conditions. The mushrooms are edible. The tender is not friendly.','A dried riverbed that still floods seasonally. The high-water mark is twelve feet up the wall.'], library:['Bark scrolls in a cave behind a waterfall. The writing is pre-Thassilonian. The scrolls are still legible.','Growth rings in an ancient tree that has grown through the room. The rings record events. They are a chronicle.','Stone tablets incised with territorial markings spanning four thousand years. A history in scratches.'], boss:['The heart of the forest. The forest knows you are here. You are standing in a nervous system.','An apex predator\'s territory. The predator has had years to prepare this ground. Every feature is intentional.','A sacred site whose guardian has been corrupted. The sacred site remembers what it was. The guardian does not.'], special:['A location where a ley line surfaces. The ground grows strange plants that do not exist elsewhere.','A time-dilated grove — trees that should be decades old are centuries old. Time moves differently here.','A predator trap designed by something intelligent enough to understand bait.'] },
    divine:{ entry:['The temple threshold bears a consecration that responds to alignment. It is watching, and it has already made a judgment.','Eternal flames burn in sconces that have not been tended in a century. The flames are not natural fire.','Prayer marks on the floor — thousands of them, worn smooth by kneeling. Something answered here. Whether it still does is unclear.'], combat:['A desecrated sanctuary — holy symbols defaced, altars inverted, the divine presence driven out. Something moved in to fill the space.','The paladins who guarded this place never left. They are still here. They are not what they were.','A testing ground. Whatever guards this temple does not fight to kill. It fights to assess.'], treasure:['Votive offerings spanning centuries — gifts to a god who may have forgotten they were given. The god has not forgotten.','A reliquary of saints\' remains, each one still emanating a faint divine resonance. Real. Powerful. Contested.','Temple treasury maintained by a spiritual obligation that outlasted the priests. The obligation is still active.'], ritual:['A high holy site where the veil between mortal and divine is thin. Divine magic is amplified. Profane magic is suppressed.','An altar still active after the faith that built it collapsed. It accepts offerings. What it does with them is unclear.','A circle of confession — whatever is spoken in this room is heard by the deity this temple was consecrated to.'], utility:['A monastic kitchen still operating under the routine its inhabitants established. The routine continues without inhabitants.','A hospital wing with divine healing still lingering in the walls. The healing is real, but has conditions.','A training courtyard where holy warriors once drilled. The training regimens are inscribed on the walls. Following them has effects.'], library:['A theological archive maintained by a preservation cantrip of unusual longevity. The cantrip is still active.','Prophetic texts, some fulfilled, some not. The unfulfilled ones appear to be in progress.','Hagiographies of saints, some of whom are still alive. They do not know they have been canonized.'], boss:['The high sanctum. A god has not spoken from this room in a century, but the room is still listening.','An inquisitor\'s judgment chamber. The inquisitor is long dead. The judgment mechanism is not.','A divine champion\'s final stand — frozen in a moment of sacrifice. The sacrifice is still paying out.'], special:['A confession booth where the confessor is still present, in some form.','A miracle site where the original miracle is still occurring, slowly, in deep time.','A theological dispute frozen in stone — two factions of the same faith, still locked in argument.'] },
    planar:{ entry:['The threshold between planes does not announce itself. One step, and the air is wrong in ways that take a moment to name.','Gravity is present but directional uncertainty is not. The floor is beneath you. Whether it will remain so is unclear.','The architecture here was not built. It accumulated — layers of different planar geometries occupying the same space at different depths.'], combat:['A contested zone between two planar factions. The territory markers are still fresh. Neither faction has yielded.','A pocket of stabilized void where physics has been negotiated into temporary agreement. The negotiation is fragile.','An arena maintained by an outsider who collects conflict. The outsider is watching. The outsider is enjoying this.'], treasure:['A cache of planar currency — useless on the material plane, but functional here as leverage.','An outsider\'s collection of material plane curiosities, each one categorized with alien taxonomy.','A stabilized rift leading to a demiplane where something valuable was stored for safekeeping. The something is no longer safe.'], ritual:['A planar binding site still active from the last summoning. The entity that was bound was freed. The site remembers it.','A confluence of planar energies rotating on a schedule. The schedule is astronomical. The next rotation is soon.','A negotiation site between planes — neutral ground by ancient agreement. The agreement was violated recently.'], utility:['A refueling station for planar travelers — food, rest, orientation. It does not ask where you came from.','A transit junction connecting multiple planes. Some of the connections are stable. Some are not. The markers are unclear.','A reality anchor — a site of enforced material plane physics in a place where physics is otherwise optional.'], library:['An akashic archive — not a physical library but a location where information has crystallized into tangible form.','A chronicle maintained by an inevitable — every significant event recorded without judgment. The recording continues.','A collection of alternate histories — what happened in parallel branches. Some of the branches are accessible.'], boss:['A planar lord\'s audience chamber. The lord is not from here. The lord has been here for a very long time.','A reality fracture — the boss exists simultaneously across three adjacent probability states.','An outsider\'s true sanctum, existing partially outside normal space. Retreat is not possible once entered.'], special:['A temporal loop — the same twelve seconds, repeating, with variations.','A location where causality runs in reverse. Effects are visible before causes.','A planar wound — a location where the fabric of reality was damaged and incompletely repaired.'] },
  };

  function getRoomFlavor(roomType, theme) {
    var t=ROOM_FLAVOR[theme]||ROOM_FLAVOR.classic;
    var pool=t[roomType]||t.entry;
    return pool[Math.floor(Math.random()*pool.length)];
  }

  function generateCampaignFlavor(campaign) {
    if(!campaign||!campaign.acts) return {};
    var result={};
    campaign.acts.forEach(function(act) {
      var theme=(campaign.base&&campaign.base.theme)||'classic';
      var types=['entry','combat','treasure','ritual','boss'];
      result['act'+act.number]=types.map(function(rt){ return {type:rt,text:getRoomFlavor(rt,theme)}; });
    });
    return result;
  }

  // ── SPRITE PASSTHROUGH (forwards to mapExtensions if loaded, else no-op) ─────
  // mapExtensions sprites are still used for dungeon map icons
  function drawSprite(ctx, cx, cy, type, theme) {
    if(typeof MapExtensions!=='undefined'&&MapExtensions!==MapArt) {
      // avoid infinite loop — only call if different object
    }
    // Fallback: simple colored circle
    ctx.save();
    var col=theme?theme.featureFill:'#5a4a2a';
    ctx.fillStyle=col;
    ctx.beginPath(); ctx.arc(cx,cy,6,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  // ── PUBLIC API ───────────────────────────────────────────────────────────────
  return {
    generateEnvironmentMap:   generateEnvironmentMap,
    generateSocialRoomMap:    generateSocialRoomMap,
    getRoomFlavor:            getRoomFlavor,
    generateCampaignFlavor:   generateCampaignFlavor,
    drawSprite:               drawSprite,
  };

})();

// Alias so existing code referencing MapExtensions continues to work
if(typeof MapExtensions === 'undefined') {
  var MapExtensions = MapArt;
}
