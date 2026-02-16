/* js/scenes/GameScene_p3.js — Phase III–V GameScene extensions */
'use strict';

// ── Boot Phase III systems alongside the game ─────────────────────────────
const _origGameCreateP2 = GameScene.prototype.create;
GameScene.prototype.create = function() {
  _origGameCreateP2.call(this);

  // Dreamer system
  this._dreamers = new DreamerSystem(this, this._save);

  // Shop screen
  this._shop = new ShopScreen(this);

  // Rain (starts if current room has rain:true)
  this._rain = new RainSystem(this);

  // Check if current room needs rain
  const rDef = WORLD_MAP[this._currentRoom];
  if (rDef?.rain) this._rain.start();
};

// ── Extend _loadRoom for new features ─────────────────────────────────────
const _origLoadRoomP2 = GameScene.prototype._loadRoom;
GameScene.prototype._loadRoom = function(roomKey, spawnPoint) {
  // Stop previous rain
  this._rain?.stop();

  _origLoadRoomP2.call(this, roomKey, spawnPoint);

  const def = WORLD_MAP[roomKey];
  if (!def) return;

  // Start rain if this room has it
  if (def.rain && this._rain) this._rain.start();

  // Spore fog hazard (fungal wastes)
  for (const hz of def.hazards ?? []) {
    if (hz.type === 'spore_fog') this._buildSporeFog(hz);
    if (hz.type === 'void_tide') this._buildVoidTide(hz);
  }

  // Build dreamer seals
  for (const item of def.items ?? []) {
    if (item.type === 'dreamer_seal')        this._buildDreamerSeal(item);
    if (item.type === 'ability')             this._buildAbilityPickup(item);
    if (item.type === 'toll_gate')           this._buildTollGate(item);
    if (item.type === 'black_egg_door')      this._buildBlackEggDoor(item);
    if (item.type === 'void_heart_altar')    this._buildVoidHeartAltar(item);
    if (item.type === 'charm')               this._buildGroundCharm(item);
  }
};

// ── Spore fog (Fungal Wastes) ─────────────────────────────────────────────
GameScene.prototype._buildSporeFog = function(hz) {
  const g = this.add.graphics().setDepth(C.LAYER_FG);
  g.fillStyle(0x88bb44, 0.12);
  g.fillRect(hz.x, hz.y, hz.w, hz.h);

  this.tweens.add({
    targets:{t:0}, t:1, duration:2000, yoyo:true, repeat:-1,
    onUpdate:(tw)=>{
      g.clear();
      g.fillStyle(0x88bb44, 0.08 + tw.getValue()*0.1);
      g.fillRect(hz.x, hz.y, hz.w, hz.h);
    }
  });

  // Damage zone for extended contact
  const zone = this.physics.add.staticImage(hz.x+hz.w/2, hz.y+hz.h/2,'__DEFAULT');
  zone.setSize(hz.w, hz.h).setVisible(false);
  this._sporeFogTimer = 0;
  this.physics.add.overlap(this.knight.sprite, zone, () => {
    this._sporeFogTimer = (this._sporeFogTimer||0) + 1/60;
    if(this._sporeFogTimer >= 2.0) {
      this.knight.onHit(5, {x:this.knight.x});
      this._sporeFogTimer = 0;
    }
  });
};

// ── Void tide (Abyss) ─────────────────────────────────────────────────────
GameScene.prototype._buildVoidTide = function(hz) {
  const g = this.add.graphics().setDepth(C.LAYER_FG + 1);
  let waveT = 0;
  this.events.on('update', (_, delta) => {
    waveT += delta * 0.001;
    g.clear();
    g.fillStyle(0x000000, 0.85);
    g.fillRect(hz.x, hz.y + Math.sin(waveT)*3, hz.w, hz.h);
    for(let x=hz.x;x<hz.x+hz.w;x+=8){
      g.fillStyle(0x222244, 0.4);
      g.fillRect(x, hz.y + Math.sin(waveT*1.5+x*0.05)*2, 6, 4);
    }
  });

  // Instant death on contact
  const zone = this.physics.add.staticImage(hz.x+hz.w/2, hz.y+hz.h/2,'__DEFAULT');
  zone.setSize(hz.w, hz.h).setVisible(false);
  this.physics.add.overlap(this.knight.sprite, zone, () => {
    this.knight.masks = 0;
    this.knight.onHit(999, {x:this.knight.x});
  });
};

// ── Dreamer seal pickup ───────────────────────────────────────────────────
GameScene.prototype._buildDreamerSeal = function(item) {
  if (this._save.itemsCollected?.includes(item.id)) return;

  // Visual: glowing floating seal
  const s = this.add.sprite(item.x, item.y, 'dreamer_seal', 0).setDepth(C.LAYER_ENTITY+1);
  if (this.anims.exists('dreamer_seal_idle')) s.play('dreamer_seal_idle');
  this.tweens.add({ targets:s, y: item.y-6, duration:1200, yoyo:true, repeat:-1, ease:'Sine.easeInOut' });

  const zone = this.physics.add.staticImage(item.x, item.y,'__DEFAULT');
  zone.setSize(30,30).setVisible(false);

  this.physics.add.overlap(this.knight.sprite, zone, () => {
    if (!this._input.interact) return;
    if (this._save.itemsCollected?.includes(item.id)) return;

    this._dreamers.breakSeal(item.dreamer, () => {
      this._save.itemsCollected.push(item.id);
      s.destroy(); zone.destroy();
      SaveSystem.save(this._buildSaveData());
    });
  });
};

// ── Ability pickup (dive tome, shade cloak altar, etc.) ───────────────────
GameScene.prototype._buildAbilityPickup = function(item) {
  if (this._save.itemsCollected?.includes(item.id)) return;
  if (this._save.abilities?.[item.abilityId]) return;

  const g = this.add.graphics().setDepth(C.LAYER_TILES+2);
  g.fillStyle(0x3a3a5a,0.9); g.fillRoundedRect(item.x-14,item.y-4,28,10,2);

  const glow = this.add.graphics().setDepth(C.LAYER_TILES+3);
  const glowCol = item.abilityId==='dive'?0x3355ff : item.abilityId==='shade_cloak'?0x220044 : 0xaaaaff;

  this.tweens.add({
    targets:{t:0}, t:1, duration:1400, yoyo:true, repeat:-1,
    onUpdate:(tw)=>{
      glow.clear();
      glow.fillStyle(glowCol, 0.1+tw.getValue()*0.3);
      glow.fillCircle(item.x, item.y-8, 10+tw.getValue()*8);
    }
  });

  const zone = this.physics.add.staticImage(item.x, item.y,'__DEFAULT');
  zone.setSize(28,16).setVisible(false);

  this.physics.add.overlap(this.knight.sprite, zone, () => {
    if (!this._input.interact) return;
    if (this._save.abilities?.[item.abilityId]) return;

    this.knight.abilities[item.abilityId] = true;
    if (this._save.abilities) this._save.abilities[item.abilityId] = true;
    this._save.itemsCollected.push(item.id);
    SaveSystem.save(this._buildSaveData());

    g.destroy(); glow.destroy(); zone.destroy();
    this._particles?.burst({x:item.x,y:item.y-8,count:16,tint:glowCol});
    this._camera?.flash(glowCol,400);

    // Ability-specific dialogue
    const key = `ability_${item.abilityId}`;
    const lines = DIALOGUE[key] ?? [
      { speaker:'', text:`Ability acquired: ${item.abilityId.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}` }
    ];
    this._dialogue.show(lines, ()=>{});
  });
};

// ── Toll gate ─────────────────────────────────────────────────────────────
GameScene.prototype._buildTollGate = function(item) {
  if (this._save.itemsCollected?.includes(item.id)) return;

  const g = this.add.graphics().setDepth(C.LAYER_TILES+1);
  g.fillStyle(0x4a4a3a,0.9); g.fillRect(item.x-4,item.y-30,8,32);
  g.lineStyle(1,0x8a8a6a); g.strokeRect(item.x-4,item.y-30,8,32);

  // Cost label
  const lbl = this.add.text(item.x, item.y-36, `${item.cost} Geo`, {
    fontFamily:'Cinzel', fontSize: 6, color:'#e8c84a',
  }).setOrigin(0.5,1).setDepth(C.LAYER_ENTITY);

  // Collision blocker
  const blocker = this.physics.add.staticImage(item.x, item.y-14,'__DEFAULT');
  blocker.setSize(10,32).setVisible(false);
  this._platforms.add(blocker);

  const zone = this.physics.add.staticImage(item.x, item.y-14,'__DEFAULT');
  zone.setSize(24,36).setVisible(false);

  this.physics.add.overlap(this.knight.sprite, zone, () => {
    if (!this._input.interact) return;
    if (this.knight.geo < item.cost) {
      this._dialogue.show([{speaker:'',text:`You need ${item.cost} Geo to pass.`}],()=>{});
      return;
    }
    this.knight.geo -= item.cost;
    this._hud.update();
    this._save.itemsCollected.push(item.id);
    g.destroy(); lbl.destroy(); zone.destroy();
    this._platforms.remove(blocker,true,true);
    this._particles?.burst({x:item.x,y:item.y-14,count:8,tint:0xe8c84a});
    SaveSystem.save(this._buildSaveData());
  });
};

// ── Black Egg door ────────────────────────────────────────────────────────
GameScene.prototype._buildBlackEggDoor = function(item) {
  const unlocked = this._dreamers?.allBroken;

  const g = this.add.graphics().setDepth(C.LAYER_TILES+2);
  const col = unlocked ? 0x221133 : 0x050508;
  g.fillStyle(col,1); g.fillRoundedRect(item.x-20,item.y-40,40,50,3);
  g.lineStyle(1, unlocked?0xaaaaff:0x222233); g.strokeRoundedRect(item.x-20,item.y-40,40,50,3);

  if (unlocked) {
    this.tweens.add({
      targets:{t:0},t:1,duration:1800,yoyo:true,repeat:-1,
      onUpdate:(tw)=>{
        g.clear();
        g.fillStyle(0x221133,1); g.fillRoundedRect(item.x-20,item.y-40,40,50,3);
        g.lineStyle(1+tw.getValue(),0xaaaaff,0.5+tw.getValue()*0.4);
        g.strokeRoundedRect(item.x-20,item.y-40,40,50,3);
      }
    });
  }

  const zone = this.physics.add.staticImage(item.x, item.y-15,'__DEFAULT');
  zone.setSize(44,54).setVisible(false);

  if (!unlocked) {
    const blocker = this.physics.add.staticImage(item.x, item.y-15,'__DEFAULT');
    blocker.setSize(40,50).setVisible(false);
    this._platforms.add(blocker);
  }

  this.physics.add.overlap(this.knight.sprite, zone, () => {
    if (!this._input.interact) return;
    if (unlocked) {
      this._dialogue.show(DIALOGUE.black_egg_door_open, () => {
        this._transitionRoom('hollow_knight_arena','default');
      });
    } else {
      this._dreamers?.checkDoor(null, null);
    }
  });
};

// ── Void Heart altar ──────────────────────────────────────────────────────
GameScene.prototype._buildVoidHeartAltar = function(item) {
  if (this._save.itemsCollected?.includes(item.id)) return;
  if (!this._dreamers?.allBroken) return; // not yet available

  const g = this.add.graphics().setDepth(C.LAYER_TILES+2);
  g.fillStyle(0x000000,1); g.fillRoundedRect(item.x-12,item.y-10,24,12,2);
  g.lineStyle(1,0x4422aa,0.8); g.strokeRoundedRect(item.x-12,item.y-10,24,12,2);

  this.tweens.add({
    targets:{t:0},t:1,duration:1600,yoyo:true,repeat:-1,
    onUpdate:(tw)=>{
      g.clear();
      g.fillStyle(0x000000,1); g.fillRoundedRect(item.x-12,item.y-10,24,12,2);
      g.lineStyle(1,0x4422aa,0.4+tw.getValue()*0.5);
      g.strokeRoundedRect(item.x-12,item.y-10,24,12,2);
      g.fillStyle(0x220044,tw.getValue()*0.3);
      g.fillCircle(item.x,item.y-4,8+tw.getValue()*6);
    }
  });

  const zone = this.physics.add.staticImage(item.x,item.y,'__DEFAULT');
  zone.setSize(24,14).setVisible(false);

  this.physics.add.overlap(this.knight.sprite, zone, () => {
    if (!this._input.interact) return;
    this._save.itemsCollected.push(item.id);
    this._save.abilities.void_heart = true;
    this.knight.abilities.void_heart = true;
    g.destroy(); zone.destroy();
    this._camera?.flash(0x000000,600);
    this._particles?.burst({x:item.x,y:item.y,count:20,tint:0x4422aa});
    SaveSystem.save(this._buildSaveData());
    this._dialogue.show([{speaker:'',text:'Void Heart — The truth of your origin, accepted.'}],()=>{});
  });
};

// ── Ground charm pickup (reward after boss) ───────────────────────────────
GameScene.prototype._buildGroundCharm = function(item) {
  if (this._save.itemsCollected?.includes(item.id)) return;

  const s = this.add.graphics().setDepth(C.LAYER_ENTITY);
  s.fillStyle(0x5ae3e3,0.8); s.fillCircle(item.x,item.y,5);
  this.tweens.add({targets:s,y:'+=4',duration:900,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});

  const zone = this.physics.add.staticImage(item.x,item.y,'__DEFAULT');
  zone.setSize(14,14).setVisible(false);

  this.physics.add.overlap(this.knight.sprite, zone, () => {
    if (this._save.itemsCollected.includes(item.id)) return;
    this._save.itemsCollected.push(item.id);
    if (!this._save.ownedCharms) this._save.ownedCharms=[];
    if (!this._save.ownedCharms.includes(item.charmId)) this._save.ownedCharms.push(item.charmId);
    s.destroy(); zone.destroy();
    this._particles?.burst({x:item.x,y:item.y,count:10,tint:0x5ae3e3});
    const lines=DIALOGUE.charms?.[item.charmId]??[{speaker:'',text:`Charm acquired.`}];
    this._dialogue.show(lines,()=>{});
    SaveSystem.save(this._buildSaveData());
  });
};

// ── Extend _spawnEnemy for Phase III enemies ──────────────────────────────
const _origSpawnEnemyP2 = GameScene.prototype._spawnEnemy;
GameScene.prototype._spawnEnemy = function(eData) {
  const P3_TYPES = {
    great_hopper:   GreatHopper,
    winged_fool:    WingedFool,
    soul_twister:   SoulTwister,
    fungoon:        Fungoon,
    shrumal_ogre:   ShrumalOgre,
    mantis_warrior: MantisWarrior,
    pale_lurker:    PaleLurker,
    uumuu:          Uumuu,
    dung_defender:  DungDefender,
    lurien_watcher: LurienWatcher,
  };
  const Cls = P3_TYPES[eData.type];
  if (Cls) {
    const e = new Cls(this, eData.x, eData.y, eData.data??{});
    this._enemies.push(e);
    this.physics.add.collider(e.sprite, this._platforms);
    return;
  }
  _origSpawnEnemyP2.call(this, eData);
};

// ── Extend _spawnBoss for Phase III bosses ────────────────────────────────
const _origSpawnBossP2 = GameScene.prototype._spawnBoss;
GameScene.prototype._spawnBoss = function(bData) {
  const P3_BOSSES = {
    soul_master:  SoulMaster,
    mantis_lords: MantisLords,
    hollow_knight:HollowKnightBoss,
  };
  const Cls = P3_BOSSES[bData.type];
  if (Cls) {
    const b = new Cls(this, bData.x, bData.y, bData);
    if (!this._bosses) this._bosses=[];
    this._bosses.push(b);
    this.physics.add.collider(b.sprite, this._platforms);
    return;
  }
  _origSpawnBossP2.call(this, bData);
};

// ── Extend background for new areas ───────────────────────────────────────
const _origBuildBgP2 = GameScene.prototype._buildBackground;
GameScene.prototype._buildBackground = function(def) {
  const key = def.key ?? '';

  if (key.startsWith('city') || key.startsWith('soul')) {
    this._buildCityBackground(def);
  } else if (key.startsWith('fungal') || key.startsWith('mantis')) {
    this._buildFungalBackground(def);
  } else if (key.startsWith('ancient') || key.startsWith('basin') || key.startsWith('abyss') || key.startsWith('hollow') || key.startsWith('black')) {
    this._buildBasinBackground(def);
  } else if (key.startsWith('dreamer') || key.startsWith('soul_master')) {
    this._buildSanctumBackground(def);
  } else {
    _origBuildBgP2.call(this, def);
  }
};

GameScene.prototype._buildCityBackground = function(def) {
  const W=def._w??C.WIDTH, H=def._h??C.HEIGHT;
  const far=this.add.graphics().setDepth(C.LAYER_BG).setScrollFactor(0.1);
  far.fillGradientStyle(0x060616,0x060616,0x0a0a22,0x0a0a22,1);
  far.fillRect(-W,-H,W*3,H*3);
  // Distant building silhouettes
  const mid=this.add.graphics().setDepth(C.LAYER_BG_DETAIL).setScrollFactor(0.25);
  mid.fillStyle(0x080820,0.8);
  for(let i=0;i<8;i++){
    const bx=(W/8)*i, bw=30+Math.random()*20, bh=60+Math.random()*80;
    mid.fillRect(bx, H-bh, bw, bh);
    // Windows
    mid.fillStyle(0x1a2a6a,0.4);
    for(let wy=H-bh+10;wy<H-10;wy+=12){
      for(let wx=bx+4;wx<bx+bw-4;wx+=8) mid.fillRect(wx,wy,4,6);
    }
    mid.fillStyle(0x080820,0.8);
  }
};

GameScene.prototype._buildFungalBackground = function(def) {
  const W=def._w??C.WIDTH, H=def._h??C.HEIGHT;
  const far=this.add.graphics().setDepth(C.LAYER_BG).setScrollFactor(0.1);
  far.fillGradientStyle(0x060a04,0x060a04,0x0a1208,0x0a1208,1);
  far.fillRect(-W,-H,W*3,H*3);
  // Giant mushroom caps in background
  const mid=this.add.graphics().setDepth(C.LAYER_BG_DETAIL).setScrollFactor(0.3);
  mid.fillStyle(0x2a3a12,0.5);
  for(let i=0;i<5;i++){
    const mx=(W/5)*i+20, my=H*0.3+Math.random()*H*0.4;
    const r=20+Math.random()*25;
    mid.fillEllipse(mx,my,r*2,r*0.7);
    mid.fillRect(mx-4,my,8,H-my);
  }
  // Spore particles
  for(let i=0;i<8;i++){
    const sp=this.add.graphics().setDepth(C.LAYER_BG_DETAIL+0.5).setScrollFactor(0.5);
    sp.setPosition(Math.random()*W,Math.random()*H);
    sp.fillStyle(0xaacc44,0.3); sp.fillCircle(0,0,1);
    this.tweens.add({targets:sp,y:'-='+Phaser.Math.Between(20,60),alpha:{from:0.1,to:0.4},
      duration:Phaser.Math.Between(2000,5000),repeat:-1,delay:Math.random()*3000,ease:'Sine.easeInOut'});
  }
};

GameScene.prototype._buildBasinBackground = function(def) {
  const W=def._w??C.WIDTH, H=def._h??C.HEIGHT;
  const far=this.add.graphics().setDepth(C.LAYER_BG).setScrollFactor(0.05);
  far.fillStyle(0x000000,1); far.fillRect(-W*2,-H*2,W*5,H*5);
  // Void wisps
  for(let i=0;i<12;i++){
    const vp=this.add.graphics().setDepth(C.LAYER_BG_DETAIL).setScrollFactor(0.2);
    vp.setPosition(Math.random()*W,Math.random()*H);
    vp.fillStyle(0x220044,0.4); vp.fillCircle(0,0,2);
    this.tweens.add({
      targets:vp,x:`+=${Phaser.Math.Between(-30,30)}`,y:`+=${Phaser.Math.Between(-20,20)}`,
      alpha:{from:0.1,to:0.5},duration:Phaser.Math.Between(2000,6000),
      yoyo:true,repeat:-1,delay:Math.random()*4000,
    });
  }
};

GameScene.prototype._buildSanctumBackground = function(def) {
  const W=def._w??C.WIDTH, H=def._h??C.HEIGHT;
  const far=this.add.graphics().setDepth(C.LAYER_BG).setScrollFactor(0.1);
  far.fillGradientStyle(0x0a0018,0x0a0018,0x140020,0x140020,1);
  far.fillRect(-W,-H,W*3,H*3);
  // Soul energy wisps
  for(let i=0;i<10;i++){
    const sp=this.add.graphics().setDepth(C.LAYER_BG_DETAIL).setScrollFactor(0.4);
    sp.setPosition(Math.random()*W,Math.random()*H);
    sp.fillStyle(0xddaaff,0.35); sp.fillCircle(0,0,1.2);
    this.tweens.add({targets:sp,y:'-='+Phaser.Math.Between(15,40),alpha:{from:0.1,to:0.5},
      duration:Phaser.Math.Between(1500,4000),repeat:-1,yoyo:true,delay:Math.random()*2500});
  }
};

// ── Extend tile drawing for new tilesets ──────────────────────────────────
const _origDrawTilesP2 = GameScene.prototype._drawPlatformTiles;
GameScene.prototype._drawPlatformTiles = function(plat) {
  const k = this._currentRoom ?? '';
  let floorKey='tile_floor', wallKey='tile_wall';

  if      (k.startsWith('city')||k.startsWith('soul')) { floorKey='tile_city_floor'; wallKey='tile_city_wall'; }
  else if (k.startsWith('fungal')||k.startsWith('mantis')) { floorKey='tile_fungal_floor'; wallKey='tile_fungal_wall'; }
  else if (k.startsWith('ancient')||k.startsWith('basin')||k.startsWith('abyss')||k.startsWith('hollow')||k.startsWith('black')) {
    floorKey='tile_basin_floor'; wallKey='tile_basin_wall';
  }
  else if (k.startsWith('greenpath')||k.startsWith('dreamer_monomon')) {
    floorKey='tile_green_floor'; wallKey='tile_green_wall';
  }

  const TS=C.TILE_SIZE;
  const cols=Math.ceil(plat.w/TS), rows=Math.ceil(plat.h/TS);
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const tx=plat.x+c*TS, ty=plat.y+r*TS, variant=(c+r)%4, isTop=r===0;
      const tex=isTop?floorKey:wallKey;
      const finalKey=this.textures.exists(tex)?tex:(isTop?'tile_floor':'tile_wall');
      this.add.image(tx,ty,finalKey,variant).setOrigin(0,0).setDepth(C.LAYER_TILES);
    }
  }
};

// ── Extend update for rain ─────────────────────────────────────────────────
const _origGameUpdateP2 = GameScene.prototype.update;
GameScene.prototype.update = function(time, delta) {
  _origGameUpdateP2.call(this, time, delta);
  if (!this._paused) {
    this._rain?.update(delta/1000);
  }
};

// ── Extend save data for dreamers ─────────────────────────────────────────
const _origBuildSaveP2 = GameScene.prototype._buildSaveData;
GameScene.prototype._buildSaveData = function() {
  const base = _origBuildSaveP2.call(this);
  if (this._dreamers) Object.assign(base, this._dreamers.toSaveData());
  return base;
};

// ── Extend clearRoom for rain ──────────────────────────────────────────────
const _origClearRoomP2 = GameScene.prototype._clearRoom;
GameScene.prototype._clearRoom = function() {
  _origClearRoomP2.call(this);
  this._rain?.stop();
};

// ── _showCredits called by Radiance death ─────────────────────────────────
GameScene.prototype._showCredits = function() {
  this.cameras.main.fade(1200,0,0,0,false,(cam,p)=>{
    if(p===1){
      this.scene.start('Ending', { type:'dream_no_more' });
    }
  });
};

// ── Sealed ending trigger (from pause menu "Offer Yourself") ──────────────
GameScene.prototype._triggerSealedEnding = function() {
  this.cameras.main.fade(1200,0,0,0,false,(cam,p)=>{
    if(p===1){
      this.scene.start('Ending', { type:'sealed' });
    }
  });
};

// ── Extend NPC building for shop NPCs ─────────────────────────────────────
const _origBuildNPCsInRoom = GameScene.prototype._loadRoom;
// (Shop NPCs are handled through NPC.js dialogue → triggers shop open)

// ── Shop open/close via game scene ───────────────────────────────────────
GameScene.prototype.openShop = function(shopKey) {
  this._shop?.open(shopKey, this._save, (save) => {
    Object.assign(this._save, save);
    this.knight.geo = save.geo;
    this.knight.masksMax = save.masks;
    this._hud.update();
    SaveSystem.save(this._buildSaveData());
  });
};

// ── Extend _buildSaveData to include new fields ───────────────────────────
const _origBuildSaveP3Final = GameScene.prototype._buildSaveData;
GameScene.prototype._buildSaveData = function() {
  const base = _origBuildSaveP3Final.call(this);
  // Also persist geo from knight
  if (this.knight) base.geo = this.knight.geo ?? base.geo;
  return base;
};
