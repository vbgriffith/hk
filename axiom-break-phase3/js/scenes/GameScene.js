// ============================================================
//  AXIOM BREAK — GameScene.js  [PHASE 3 REPLACEMENT]
//  New in Phase 3:
//   - Procedural map generation (levelData.procedural flag)
//   - Routes to UpgradeScene between sectors
//   - Score multiplier (kill streak) displayed in HUD
//   - No-hit bonus on sector clear
//   - REGEN powerup support
//   - Phantom enemy type
//   - Player.onKill() notified for streak tracking
// ============================================================

// ── WallSystem (unchanged from P2) ──────────────────────────
class WallSystem {
  constructor(scene, layout) {
    this.tileSize = 64;
    this.layout   = layout;
    this._gfx     = scene.add.graphics();
    this._drawMap();
  }
  _drawMap() {
    const g=this._gfx, ts=this.tileSize;
    g.clear();
    for (let row=0;row<this.layout.length;row++) {
      for (let col=0;col<this.layout[row].length;col++) {
        const isWall=this.layout[row][col]===1, x=col*ts, y=row*ts;
        if (isWall) {
          g.fillStyle(AXIOM.COLORS.WALL,1).fillRect(x,y,ts,ts);
          g.lineStyle(1,AXIOM.COLORS.WALL_EDGE,0.4).strokeRect(x,y,ts,ts);
          g.fillStyle(AXIOM.COLORS.WALL_EDGE,0.12).fillRect(x,y,ts,4);
        } else {
          g.fillStyle(AXIOM.COLORS.FLOOR,1).fillRect(x,y,ts,ts);
          g.lineStyle(1,0x0d2035,0.35).strokeRect(x,y,ts,ts);
          g.fillStyle(0x00aabb,0.08).fillCircle(x+ts/2,y+ts/2,2);
        }
      }
    }
  }
  hitsWall(x,y,radius=8) {
    const ts=this.tileSize;
    for (const [px,py] of [[x-radius,y-radius],[x+radius,y-radius],[x-radius,y+radius],[x+radius,y+radius]]) {
      const col=Math.floor(px/ts), row=Math.floor(py/ts);
      if (row<0||row>=this.layout.length||col<0||col>=this.layout[0].length) return true;
      if (this.layout[row][col]===1) return true;
    }
    return false;
  }
}

// ── ParticleSystem (unchanged) ────────────────────────────────
class ParticleSystem {
  constructor(scene) { this.scene=scene; this.particles=[]; }
  spawn(x,y,color,count=5) {
    for (let i=0;i<count;i++) {
      const angle=Math.random()*Math.PI*2, speed=Utils.randFloat(40,140), life=Utils.randFloat(300,700), size=Utils.randFloat(1.5,4);
      this.particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life,maxLife:life,size,color});
    }
  }
  update(delta) {
    const dt=delta/1000;
    this.particles=this.particles.filter(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=0.92;p.vy*=0.92;p.life-=delta;return p.life>0;});
  }
  draw(gfx) {
    gfx.clear();
    for (const p of this.particles){const a=Utils.clamp(p.life/p.maxLife,0,1);gfx.fillStyle(p.color,a);gfx.fillCircle(p.x,p.y,p.size*a);}
  }
}

// ── Static map layouts (P1+P2) ───────────────────────────────
const MAP_LAYOUTS = {
  level1:[[1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,1,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,1,0,0,1,0,0,1,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,1,1,0,1,1,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,1,0,0,1,0,0,1,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1]],
  level2:[[1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,1,0,0,0,1,0,0,0,1],[1,0,0,0,0,0,1,0,0,0,0,0,1],[1,1,0,1,0,0,0,0,0,1,0,1,1],[1,0,0,0,0,1,0,1,0,0,0,0,1],[1,0,1,0,0,0,0,0,0,0,1,0,1],[1,0,0,0,0,1,0,1,0,0,0,0,1],[1,1,0,1,0,0,0,0,0,1,0,1,1],[1,0,0,0,0,0,1,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1]],
  level3:[[1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,0,0,1,0,0,1,1,0,1],[1,0,1,0,0,0,0,0,0,0,1,0,1],[1,0,0,0,0,1,0,1,0,0,0,0,1],[1,0,0,1,0,0,0,0,0,1,0,0,1],[1,0,0,0,0,1,0,1,0,0,0,0,1],[1,0,1,0,0,0,0,0,0,0,1,0,1],[1,0,1,1,0,0,1,0,0,1,1,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1]],
  level4:[[1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,0,0,0,0,0,0,0,1,0,1],[1,0,0,0,1,0,0,0,1,0,0,0,1],[1,0,0,1,1,0,0,0,1,1,0,0,1],[1,0,0,0,0,0,1,0,0,0,0,0,1],[1,0,0,1,1,0,0,0,1,1,0,0,1],[1,0,0,0,1,0,0,0,1,0,0,0,1],[1,0,1,0,0,0,0,0,0,0,1,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1]],
  level5:[[1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,0,0,0,1,1,1,0,1],[1,0,1,0,0,0,0,0,0,0,1,0,1],[1,0,1,0,1,1,0,1,1,0,1,0,1],[1,0,0,0,1,0,0,0,1,0,0,0,1],[1,0,1,0,1,1,0,1,1,0,1,0,1],[1,0,1,0,0,0,0,0,0,0,1,0,1],[1,0,1,1,1,0,0,0,1,1,1,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1]],
};

// ── GameScene ────────────────────────────────────────────────

class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'Game' }); }

  init(data) {
    this.levelIndex  = data.levelIndex  || 0;
    this.score       = data.score       || 0;
    this._mapSeed    = data.mapSeed     || (Date.now() ^ (data.levelIndex * 0xA3B1));
  }

  create() {
    const levelData = AXIOM.LEVELS[this.levelIndex];
    HUD.show();
    HUD.setLevel(levelData.name);
    HUD.setScore(this.score);
    HUD.showBossBar(false);
    HUD.setMultiplier('1.0');

    // ── Map: procedural or static
    let layout, playerStart;
    if (levelData.procedural) {
      const result = ProceduralGen.generate(this._mapSeed);
      layout       = result.layout;
      playerStart  = result.playerStart;
      this._proceduralEnemySpawns = result.enemySpawns;
    } else {
      layout      = MAP_LAYOUTS[levelData.map];
      playerStart = this._findOpenTile(layout, 1, 1);
      this._proceduralEnemySpawns = null;
    }

    this.walls      = new WallSystem(this, layout);
    this._mapLayout = layout;

    // ── Portal
    this._portalGfx    = this.add.graphics();
    this._portalActive = false;
    this._portalX = this._portalY = 0;

    // ── Player
    this.player = new Player(this, playerStart.x, playerStart.y);

    // ── Splice
    this.splice = new SpliceSystem(this);

    // ── Bullets
    this.playerBullets = [];
    this.enemyBullets  = [];

    // ── Enemies / waves
    this.enemies       = [];
    this._waveQueue    = [...levelData.enemyWaves];
    this._waveTimer    = 0;
    this._waveIndex    = 0;
    this._allWavesDone = false;
    this._enemiesLeft  = 0;
    this._countEnemies();

    // ── Boss
    this._hasBoss       = levelData.hasBoss;
    this._useWraithBoss = levelData.useWraithBoss || false;
    this._bossSpawned   = false;

    // ── Powerups
    this.powerups = new PowerupManager(this, this.player);

    // ── Particles
    this.particles    = new ParticleSystem(this);
    this._particleGfx = this.add.graphics();

    // ── Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors.a     = this.input.keyboard.addKey('A');
    this.cursors.s     = this.input.keyboard.addKey('S');
    this.cursors.d     = this.input.keyboard.addKey('D');
    this.cursors.w     = this.input.keyboard.addKey('W');
    this.cursors.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this._eKey         = this.input.keyboard.addKey('E');
    this._rKey         = this.input.keyboard.addKey('R');

    // ── UIScene
    const uiScene = this.scene.get('UI');
    if (uiScene) {
      uiScene.buildMinimap(layout);
      uiScene.setWaveInfo(0, this._waveQueue.length);
    }

    // ── Audio
    AudioSynth.init();
    AudioSynth.playMusic(levelData.music || 'ambient');

    // ── Progression: apply upgrades at level start
    Progression.applyAll();

    // ── Transmission → start
    this._gameStarted = false;
    HUD.showTransmission(levelData.transmission_before, () => {
      this._gameStarted = true;
    });
  }

  _countEnemies() {
    let total = 0;
    for (const w of this._waveQueue) total += w.count;
    if (this._hasBoss) total += 1;
    this._enemiesLeft = total;
  }

  _findOpenTile(layout, preferRow = 1, preferCol = 1) {
    const ts = 64;
    for (let row = preferRow; row < layout.length-1; row++)
      for (let col = preferCol; col < layout[0].length-1; col++)
        if (layout[row][col] === 0) return { x: col*ts+ts/2, y: row*ts+ts/2 };
    return { x: 96, y: 96 };
  }

  _findOpenTileFar(layout, fromX, fromY) {
    const ts = 64;
    let best=null, bestDist=0;
    for (let row=1; row<layout.length-1; row++)
      for (let col=1; col<layout[0].length-1; col++)
        if (layout[row][col]===0) {
          const wx=col*ts+ts/2, wy=row*ts+ts/2, d=Utils.dist(fromX,fromY,wx,wy);
          if (d>bestDist) { bestDist=d; best={x:wx,y:wy}; }
        }
    return best || { x:400, y:300 };
  }

  spawnParticles(x, y, color, count) { this.particles.spawn(x, y, color, count); }

  onEnemyDead(enemy) {
    // [P3] Score multiplier from kill streak
    const mult  = parseFloat(this.player.getScoreMultiplier());
    const pts   = Math.round(enemy.cfg.SCORE * mult);
    this.score += pts;
    HUD.setScore(this.score);
    HUD.setMultiplier(mult.toFixed(1));
    this.player.onKill();

    this.spawnParticles(enemy.x, enemy.y, AXIOM.COLORS['ENEMY_' + enemy.type], 10);
    AudioSynth.play('explode');
    this._enemiesLeft--;
    this.powerups.tryDrop(enemy);

    if (this._enemiesLeft <= 0 && this._allWavesDone) {
      // [P3] No-hit bonus
      if (!this.player._tookHitThisSector) {
        this.score += AXIOM.SCORE.NO_HIT_BONUS;
        HUD.setScore(this.score);
        HUD.showSectorBonus('NO-HIT BONUS  +' + AXIOM.SCORE.NO_HIT_BONUS);
      }
      this._spawnPortal();
    }
  }

  _spawnWave(waveDef) {
    const ts   = 64;
    const spawns = this._proceduralEnemySpawns;
    for (let i = 0; i < waveDef.count; i++) {
      let ex, ey;
      if (spawns && spawns.length > 0) {
        // Use procedural spawn points (round-robin)
        const sp = spawns[(this._waveIndex * waveDef.count + i) % spawns.length];
        if (Utils.dist(sp.x, sp.y, this.player.x, this.player.y) > 120) { ex=sp.x; ey=sp.y; }
      }
      if (!ex) {
        let attempts = 0;
        do {
          const row=Utils.randInt(1,this._mapLayout.length-2), col=Utils.randInt(1,this._mapLayout[0].length-2);
          if (this._mapLayout[row][col]===0) { ex=col*ts+ts/2; ey=row*ts+ts/2; }
          attempts++;
        } while (attempts<30 && (!ex || Utils.dist(ex,ey,this.player.x,this.player.y)<180));
        if (!ex) { ex=100; ey=100; }
      }
      const e = new Enemy(this, ex, ey, waveDef.type);
      this.enemies.push(e);
      this.spawnParticles(ex, ey, AXIOM.COLORS['ENEMY_'+waveDef.type], 6);
    }
  }

  _spawnPortal() {
    const pos = this._findOpenTileFar(this._mapLayout, this.player.x, this.player.y);
    this._portalX = pos.x;
    this._portalY = pos.y;
    this._portalActive = true;
    const g = this._portalGfx;
    g.clear();
    g.lineStyle(3, AXIOM.COLORS.PORTAL, 1).strokeCircle(pos.x,pos.y,22);
    g.lineStyle(1, AXIOM.COLORS.PORTAL, 0.5).strokeCircle(pos.x,pos.y,15);
    g.fillStyle(AXIOM.COLORS.PORTAL, 0.25).fillCircle(pos.x,pos.y,13);
    this.tweens.add({ targets:g, alpha:{from:0.4,to:1}, duration:700, yoyo:true, repeat:-1 });
    this.spawnParticles(pos.x, pos.y, AXIOM.COLORS.PORTAL, 16);
    AudioSynth.play('portal_open');
  }

  _checkPortal() {
    if (!this._portalActive) return;
    if (Utils.dist(this.player.x, this.player.y, this._portalX, this._portalY) < 28) {
      this._portalActive = false;
      AudioSynth.stopMusic();
      this.splice.destroy();
      this.powerups.destroy();
      this.player.destroy();

      const levelData = AXIOM.LEVELS[this.levelIndex];
      HUD.showTransmission(levelData.transmission_after, () => {
        const next = this.levelIndex + 1;
        // [P3] Route through UpgradeScene between sectors
        if (next < AXIOM.LEVELS.length) {
          this.scene.start('Upgrade', {
            nextLevelIndex: next,
            score:          this.score,
            mapSeed:        this._mapSeed ^ (next * 0x1F3D7),
          });
        } else {
          Progression.setRunStats(this.score, this.levelIndex + 1);
          this._showCredits();
        }
      });
    }
  }

  _showCredits() {
    const W = AXIOM.WIDTH, H = AXIOM.HEIGHT;
    this.add.graphics().fillStyle(0x000000,0.9).fillRect(0,0,W,H);

    this.add.text(W/2, H/2-90, 'PHASE 3 COMPLETE', {
      fontFamily:'Orbitron, monospace', fontSize:'28px', color:'#00f5ff',
      shadow:{blur:20,color:'#00f5ff',fill:true},
    }).setOrigin(0.5);

    this.add.text(W/2, H/2-50, 'SIGNAL ABSOLUTE', {
      fontFamily:"'Share Tech Mono', monospace", fontSize:'11px', color:'#39ff14', letterSpacing:4,
    }).setOrigin(0.5);

    this.add.text(W/2, H/2-10, `FINAL SCORE: ${Utils.formatScore(this.score)}`, {
      fontFamily:"'Share Tech Mono', monospace", fontSize:'16px', color:'#ffffff',
    }).setOrigin(0.5);

    const upgText = Progression.getUnlocked().map(u=>u.name).join('  ·  ');
    if (upgText) this.add.text(W/2, H/2+22, upgText, {
      fontFamily:"'Share Tech Mono', monospace", fontSize:'9px', color:'#005566',
    }).setOrigin(0.5);

    this.add.text(W/2, H/2+60, '[SPACE] VIEW LEADERBOARD', {
      fontFamily:'Orbitron, monospace', fontSize:'11px', color:'#00f5ff',
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      Progression.reset();
      this.scene.start('Leaderboard', { score: this.score, level: this.levelIndex+1, fromGame: true });
    });
  }

  update(time, delta) {
    if (!this._gameStarted) return;
    if (this.player.dead) { this._handleDeath(); return; }

    // Wave spawning
    if (!this._allWavesDone) {
      this._waveTimer += delta;
      while (this._waveQueue.length > 0 && this._waveTimer >= this._waveQueue[0].delay) {
        const w = this._waveQueue.shift();
        this._waveIndex++;
        this._spawnWave(w);
        const ui = this.scene.get('UI');
        if (ui) ui.setWaveInfo(this._waveIndex, this._waveIndex + this._waveQueue.length);
        if (this._waveQueue.length === 0) {
          this._allWavesDone = true;
          if (this._hasBoss && !this._bossSpawned) {
            this._bossSpawned = true;
            const bpos = this._findOpenTileFar(this._mapLayout, this.player.x, this.player.y);
            if (this._useWraithBoss) {
              this.enemies.push(new WraithBoss(this, bpos.x, bpos.y));
            } else {
              this.enemies.push(new Enemy(this, bpos.x, bpos.y, 'BOSS'));
              this.cameras.main.flash(200, 255, 0, 60, true);
            }
          }
        }
      }
    }

    // Player
    this.player.update(delta, this.cursors, this.input.activePointer, this.splice);

    // Splice
    this.splice.update(delta, this._eKey, this._rKey,
      this.player.x, this.player.y, this.enemies.filter(e=>!e.dead));

    // Powerups
    this.powerups.update(delta);

    // Enemies
    for (const e of this.enemies) if (!e.dead) e.update(delta, this.player.x, this.player.y);
    this.enemies = this.enemies.filter(e=>!e.dead);

    // Bullets
    for (const b of this.playerBullets) b.update(delta);
    for (const b of this.enemyBullets)  b.update(delta);
    this.playerBullets = this.playerBullets.filter(b=>!b.dead);
    this.enemyBullets  = this.enemyBullets.filter(b=>!b.dead);

    // Collisions: player bullets → enemies
    for (const b of this.playerBullets) {
      for (const e of this.enemies) {
        if (e.dead) continue;
        if (Utils.dist(b.x,b.y,e.x,e.y) < e.cfg.SIZE+6) {
          e.damage(AXIOM.PLAYER._bulletDamage || 12);
          b.kill();
          AudioSynth.playThrottled('hit');
        }
      }
    }

    // Enemy bullets → player
    for (const b of this.enemyBullets) {
      if (Utils.dist(b.x,b.y,this.player.x,this.player.y) < AXIOM.PLAYER.SIZE+4) {
        const dmg = this.powerups.interceptDamage(10);
        if (dmg > 0) { this.player.damage(dmg); AudioSynth.playThrottled('player_hurt'); }
        b.kill();
      }
    }

    // Melee
    for (const e of this.enemies) {
      if (e.dead || (e.type==='PHANTOM' && e._phantomPhased)) continue;
      if (Utils.dist(e.x,e.y,this.player.x,this.player.y) < e.cfg.SIZE+AXIOM.PLAYER.SIZE) {
        const raw = e.cfg.DAMAGE*(delta/1000);
        const dmg = this.powerups.interceptDamage(raw);
        if (dmg > 0) this.player.damage(dmg);
      }
    }

    // Audio shoot / dash
    if (this.player._justFired) { AudioSynth.playThrottled('shoot'); this.player._justFired=false; }
    if (this.player._justDashed) { AudioSynth.play('dash'); this.player._justDashed=false; }

    // [P3] Score multiplier HUD update
    HUD.setMultiplier(this.player.getScoreMultiplier());

    // Particles
    this.particles.update(delta);
    this.particles.draw(this._particleGfx);

    // Portal
    this._checkPortal();

    // UIScene updates
    const uiScene = this.scene.get('UI');
    if (uiScene && uiScene.updateMinimap) {
      uiScene.updateMinimap(this.player.x,this.player.y,this.enemies,this._portalActive,this._portalX,this._portalY);
      uiScene.updatePowerups(this.player.activeEffects);
    }
  }

  _handleDeath() {
    if (this._dying) return;
    this._dying = true;
    AudioSynth.play('player_die');
    AudioSynth.stopMusic();
    this.cameras.main.flash(300,255,20,20,true);
    this.cameras.main.shake(400,0.015);

    const W=AXIOM.WIDTH, H=AXIOM.HEIGHT;
    this.time.delayedCall(600, () => {
      this.add.graphics().fillStyle(0x000000,0.8).fillRect(0,0,W,H);

      this.add.text(W/2,H/2-40,'SIGNAL LOST',{
        fontFamily:'Orbitron, monospace',fontSize:'36px',color:'#ff2244',
        shadow:{blur:20,color:'#ff2244',fill:true},
      }).setOrigin(0.5);

      this.add.text(W/2,H/2+10,`SCORE: ${Utils.formatScore(this.score)}`,{
        fontFamily:"'Share Tech Mono', monospace",fontSize:'14px',color:'#ffffff',
      }).setOrigin(0.5);

      this.add.text(W/2,H/2+40,`SECTOR ${this.levelIndex+1} — ${Progression.getUnlocked().map(u=>u.name).join(', ')||'NO UPGRADES'}`,{
        fontFamily:"'Share Tech Mono', monospace",fontSize:'9px',color:'#004455',
      }).setOrigin(0.5);

      this.add.text(W/2,H/2+68,'[SPACE] RESTART (NEW RUN)  |  [L] LEADERBOARD  |  [Q] MENU',{
        fontFamily:'Orbitron, monospace',fontSize:'10px',color:'#00f5ff',
      }).setOrigin(0.5);

      this.input.keyboard.once('keydown-SPACE', () => {
        Progression.reset();
        this.scene.restart({ levelIndex:0, score:0 });
      });
      this.input.keyboard.once('keydown-L', () => {
        Progression.reset();
        this.scene.start('Leaderboard', { score:this.score, level:this.levelIndex+1, fromGame:true });
      });
      this.input.keyboard.once('keydown-Q', () => {
        Progression.reset();
        this.scene.start('Menu');
      });
    });
  }
}
