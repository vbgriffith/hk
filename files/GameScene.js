/* js/scenes/GameScene.js — Primary gameplay scene */
'use strict';

class GameScene extends Phaser.Scene {
  constructor() { super(C.SCENE_GAME); }

  init(data) {
    this._save        = data.save ?? SaveSystem.defaultSave();
    this._currentRoom = this._save.benchRoom ?? 'crossroads_entrance';
    this._spawnPoint  = this._save.benchSpawn ?? 'default';
    this._paused      = false;
    this._dying       = false;
  }

  create() {
    // ── Systems ───────────────────────────────────────────────────────────
    this._input     = new InputHandler(this);
    this._audio     = new AudioSystem(this);
    this._camera    = new CameraSystem(this);
    this._particles = new ParticleSystem(this);

    // ── UI (parallel scene) ────────────────────────────────────────────────
    this._hud       = new HUD(this);
    this._dialogue  = new DialogueBox(this);
    this._pauseMenu = new PauseMenu(this);
    this._mapScreen = new MapScreen(this);

    // ── Entity groups ─────────────────────────────────────────────────────
    this._enemies   = [];
    this._npcs      = [];
    this._projectiles= [];
    this._shards    = [];
    this._items     = [];

    // ── Load room ─────────────────────────────────────────────────────────
    this._loadRoom(this._currentRoom, this._spawnPoint);

    // ── Camera ────────────────────────────────────────────────────────────
    const rDef = WORLD_MAP[this._currentRoom];
    this._camera.follow(
      this.knight.sprite,
      rDef?._w ?? C.WIDTH,
      rDef?._h ?? C.HEIGHT
    );
    this._camera.fadeIn(600);

    // ── HUD link ──────────────────────────────────────────────────────────
    this.knight._hud = this._hud;
    this._hud.update();
    this._hud.showAreaName(rDef?.displayName ?? '');

    // ── Timer: periodic save ──────────────────────────────────────────────
    this.time.addEvent({
      delay: 30000, loop: true,
      callback: () => this._autoSave(),
    });
  }

  // ── Room loading ─────────────────────────────────────────────────────────
  _loadRoom(roomKey, spawnPoint = 'default') {
    const def = WORLD_MAP[roomKey];
    if (!def) { console.error('Room not found:', roomKey); return; }

    // Mark visited
    if (!this._save.visitedRooms.includes(roomKey)) {
      this._save.visitedRooms.push(roomKey);
    }

    // Clear previous room
    this._clearRoom();

    // ── Static platforms (fallback without tilemap) ────────────────────────
    this._platforms = this.physics.add.staticGroup();
    this._hazards   = this.physics.add.staticGroup();

    const worldW = def._w ?? C.WIDTH;
    const worldH = def._h ?? C.HEIGHT;
    this._worldBounds = { left: 0, right: worldW, top: 0, bottom: worldH };

    // Ceiling and floor walls
    this._buildPlatforms(def);
    this._buildHazards(def);
    this._buildBackground(def);
    this._buildRoomEdges(worldW, worldH);

    // ── Spawn player ──────────────────────────────────────────────────────
    const sp = def.spawns?.[spawnPoint] ?? def.spawns?.default ?? [80, 180];
    if (!this.knight) {
      this.knight = new Knight(this, sp[0], sp[1], this._save);
    } else {
      this.knight.sprite.setPosition(sp[0], sp[1]);
      this.knight.body.setVelocity(0, 0);
    }

    // ── Enemies ───────────────────────────────────────────────────────────
    for (const eData of def.enemies ?? []) {
      const collected = this._save.itemsCollected.includes(eData.id);
      if (collected) continue;
      this._spawnEnemy(eData);
    }

    // ── NPCs ──────────────────────────────────────────────────────────────
    for (const nData of def.npcs ?? []) {
      const npc = new NPC(this, nData.x, nData.y, nData.type,
                          nData.dialogueKey, nData.id);
      this._npcs.push(npc);
      this.physics.add.collider(npc.sprite, this._platforms);
    }

    // ── Items (benches, geo piles, etc) ───────────────────────────────────
    for (const item of def.items ?? []) {
      this._buildItem(item);
    }

    // ── Shade if in this room ─────────────────────────────────────────────
    if (this._save.shade && this._save.shade.room === roomKey) {
      this._shade = new Shade(this, this._save.shade.x, this._save.shade.y,
                              this._save.shade.geo);
      this.physics.add.collider(this._shade.sprite, this._platforms);
    }

    // ── Collisions ────────────────────────────────────────────────────────
    this.physics.add.collider(this.knight.sprite, this._platforms);
    this.physics.add.overlap(this.knight.sprite, this._hazards, (ks, hz) => {
      this.knight.onHit(C.CRAWLER_DMG, { x: hz.x });
    });

    // ── Room transition zones ──────────────────────────────────────────────
    this._buildTransitions(def, worldW, worldH);

    // ── Music ─────────────────────────────────────────────────────────────
    // this._audio.playMusic(def.music ?? 'music_crossroads');

    this.physics.world.setBounds(0, 0, worldW, worldH);
  }

  _buildPlatforms(def) {
    const TS = C.TILE_SIZE;
    for (const plat of def.platforms ?? []) {
      const img = this.physics.add.staticImage(
        plat.x + plat.w / 2,
        plat.y + plat.h / 2,
        '__DEFAULT'
      );
      img.setSize(plat.w, plat.h);
      img.setVisible(false);
      this._platforms.add(img);

      // Draw visual tile
      this._drawPlatformTiles(plat);
    }
  }

  _drawPlatformTiles(plat) {
    const TS = C.TILE_SIZE;
    const cols = Math.ceil(plat.w / TS);
    const rows = Math.ceil(plat.h / TS);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tx = plat.x + c * TS;
        const ty = plat.y + r * TS;

        // Pick tile variant
        const variant = (c + r) % 4;
        const isTop   = r === 0;

        const tile = this.add.image(tx, ty, isTop ? 'tile_floor' : 'tile_wall', variant);
        tile.setOrigin(0, 0).setDepth(C.LAYER_TILES);
      }
    }
  }

  _buildHazards(def) {
    for (const hz of def.hazards ?? []) {
      const img = this.physics.add.staticImage(
        hz.x + hz.w / 2,
        hz.y + hz.h / 2,
        '__DEFAULT'
      );
      img.setSize(hz.w, hz.h);
      img.setVisible(false);
      img.hazardType = hz.type;
      this._hazards.add(img);

      // Visuals
      if (hz.type === 'acid') {
        const cols = Math.ceil(hz.w / C.TILE_SIZE);
        for (let c = 0; c < cols; c++) {
          this.add.image(hz.x + c * C.TILE_SIZE, hz.y, 'tile_acid', c % 4)
            .setOrigin(0, 0).setDepth(C.LAYER_TILES);
        }
      } else if (hz.type === 'spikes') {
        const cols = Math.ceil(hz.w / C.TILE_SIZE);
        for (let c = 0; c < cols; c++) {
          this.add.image(hz.x + c * C.TILE_SIZE, hz.y, 'tile_spike', c % 4)
            .setOrigin(0, 0).setDepth(C.LAYER_TILES);
        }
      }
    }
  }

  _buildBackground(def) {
    // Parallax layers
    const W = def._w ?? C.WIDTH, H = def._h ?? C.HEIGHT;

    // Far BG — solid dark gradient
    const far = this.add.graphics().setDepth(C.LAYER_BG).setScrollFactor(0.1);
    far.fillGradientStyle(0x080810, 0x080810, 0x0a0a16, 0x0a0a16, 1);
    far.fillRect(-W, -H, W * 3, H * 3);

    // Cave BG sprites scattered
    const bgCount = 4;
    for (let i = 0; i < bgCount; i++) {
      const bx = (W / bgCount) * i + Phaser.Math.Between(0, W / bgCount);
      this.add.image(bx, -20, 'bg_cave')
        .setDepth(C.LAYER_BG_DETAIL)
        .setScrollFactor(0.3)
        .setAlpha(0.5);
    }

    // Ambient specks (tiny glowing dots for atmosphere)
    for (let i = 0; i < 15; i++) {
      const g = this.add.graphics();
      g.setPosition(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H));
      g.setDepth(C.LAYER_BG_DETAIL + 0.5);
      g.setScrollFactor(0.5);
      g.fillStyle(0x5ae3e3, 0.3);
      g.fillCircle(0, 0, 0.5);

      this.tweens.add({
        targets: g, alpha: { from: 0.1, to: 0.5 },
        duration: Phaser.Math.Between(1000, 4000),
        yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }

  _buildRoomEdges(W, H) {
    // Invisible walls at room edges
    const wallThick = 10;
    const makeWall = (x, y, w, h) => {
      const img = this.physics.add.staticImage(x + w/2, y + h/2, '__DEFAULT');
      img.setSize(w, h).setVisible(false);
      this._platforms.add(img);
    };
    makeWall(-wallThick, 0, wallThick, H);  // left
    makeWall(W, 0, wallThick, H);           // right
    // No top wall — allow vertical exits
    // Floor if room has no platforms at bottom
  }

  _buildTransitions(def, W, H) {
    this._transitions = [];
    const connections = def.connections ?? {};
    const TH = 20;

    for (const [dir, dest] of Object.entries(connections)) {
      let tx, ty, tw, th;
      switch (dir) {
        case 'left':  tx = -TH;    ty = 0; tw = TH;  th = H;  break;
        case 'right': tx = W;      ty = 0; tw = TH;  th = H;  break;
        case 'up':    tx = 0;     ty = -TH; tw = W; th = TH; break;
        case 'down':  tx = 0;     ty = H;  tw = W; th = TH; break;
        default:      continue;
      }

      const zone = this.physics.add.staticImage(tx + tw/2, ty + th/2, '__DEFAULT');
      zone.setSize(tw, th).setVisible(false);
      zone.destRoom   = dest.roomKey;
      zone.destSpawn  = dest.spawnPoint;
      zone.direction  = dir;

      this.physics.add.overlap(this.knight.sprite, zone, () => {
        this._transitionRoom(dest.roomKey, dest.spawnPoint);
      });
      this._transitions.push(zone);
    }
  }

  _buildItem(item) {
    if (item.type === 'bench') {
      const img = this.add.image(item.x, item.y, 'bench').setDepth(C.LAYER_TILES + 1);
      const zone = this.physics.add.staticImage(item.x, item.y, '__DEFAULT');
      zone.setSize(20, 10).setVisible(false);
      zone.itemData = item;
      this._items.push(zone);

      this.physics.add.overlap(this.knight.sprite, zone, () => {
        if (this._input.interact && !this._dialogue.isVisible) {
          this._useBench(item);
        }
      });
    }

    if (item.type === 'lore_tablet') {
      const img = this.add.image(item.x, item.y, 'lore_tablet').setDepth(C.LAYER_TILES + 1);
      const zone = this.physics.add.staticImage(item.x, item.y, '__DEFAULT');
      zone.setSize(12, 18).setVisible(false);
      zone.itemData = item;
      this._items.push(zone);

      this.physics.add.overlap(this.knight.sprite, zone, () => {
        if (this._input.interact && !this._dialogue.isVisible) {
          const lines = DIALOGUE.lore?.[item.dialogueKey] ?? [];
          this._dialogue.show(lines, () => {});
        }
      });
    }

    if (item.type === 'geo_pile') {
      const collected = this._save.itemsCollected.includes(item.id);
      if (!collected) {
        this.spawnGeo(item.x, item.y, item.value);
        this._save.itemsCollected.push(item.id);
      }
    }
  }

  _clearRoom() {
    // Destroy all dynamic entities
    for (const e of this._enemies)    e.alive && e.destroy();
    for (const n of this._npcs)       n.alive && n.destroy();
    for (const p of this._projectiles) p.alive && p.burst?.();
    for (const s of this._shards)     s.alive && s.sprite?.destroy();

    this._enemies    = [];
    this._npcs       = [];
    this._projectiles= [];
    this._shards     = [];
    this._items      = [];

    this._platforms?.clear(true, true);
    this._hazards?.clear(true, true);

    if (this._shade) { this._shade.destroy(); this._shade = null; }

    // Clear all children except player sprite
    this.children.list.slice().forEach(c => {
      if (c !== this.knight?.sprite) c.destroy();
    });
  }

  // ── Enemy spawning ────────────────────────────────────────────────────────
  _spawnEnemy(eData) {
    let enemy;
    switch (eData.type) {
      case 'crawler':
        enemy = new Crawler(this, eData.x, eData.y, eData.data ?? {});
        break;
      case 'spitter':
        enemy = new Spitter(this, eData.x, eData.y, eData.data ?? {});
        break;
      case 'flying_scout':
        enemy = new FlyingScout(this, eData.x, eData.y, eData.data ?? {});
        break;
      default:
        console.warn('Unknown enemy type:', eData.type);
        return;
    }

    this._enemies.push(enemy);
    this.physics.add.collider(enemy.sprite, this._platforms);
  }

  // ── Nail hit registration ─────────────────────────────────────────────────
  registerNailHit(nailBox) {
    for (const enemy of this._enemies) {
      if (!enemy.alive) continue;
      this.physics.add.overlap(nailBox, enemy.sprite, () => {
        if (!nailBox.active) return;
        enemy.onHit(nailBox.dmg, this.knight);
        this.knight.gainSoul();
        this._hud.update();

        // Slash direction pogo (attack down on enemy)
        if (nailBox.dir === 'down') {
          this.knight.body.setVelocityY(C.KNIGHT_JUMP_VEL * 0.7);
        }
      });
    }
  }

  // ── Entity spawning helpers ───────────────────────────────────────────────
  spawnGeo(x, y, total) {
    // Split into shards of varying sizes
    let remaining = total;
    while (remaining > 0) {
      const val = remaining >= 10
        ? (Phaser.Math.Between(0, 1) ? 10 : 5)
        : (remaining >= 5 ? 5 : 1);
      const shard = new Shard(this, x, y, Math.min(val, remaining));
      this._shards.push(shard);
      this.physics.add.collider(shard.sprite, this._platforms);
      remaining -= val;
      if (this._shards.length > 40) break; // safety cap
    }
  }

  spawnFireball(x, y, dir) {
    const p = new Projectile(this, {
      x, y,
      vx: dir * 160, vy: 0,
      texture: 'fireball',
      dmg: C.SOUL_FIREBALL_COST / 3,
      owner: 'player',
      tint: 0x5ae3e3,
      lifespan: 1800,
    });
    this._projectiles.push(p);

    // Collide fireball with enemies
    for (const enemy of this._enemies) {
      if (!enemy.alive) continue;
      this.physics.add.overlap(p.sprite, enemy.sprite, () => {
        if (!p.alive) return;
        enemy.onHit(15, this.knight);
        this.knight.gainSoul();
        p.burst();
      });
    }
    this.physics.add.collider(p.sprite, this._platforms, () => p.burst());
  }

  spawnProjectile(cfg) {
    const p = new Projectile(this, cfg);
    this._projectiles.push(p);

    if (cfg.owner === 'enemy') {
      this.physics.add.overlap(p.sprite, this.knight.sprite, () => {
        if (!p.alive) return;
        this.knight.onHit(cfg.dmg, p);
        p.burst();
      });
    }
    this.physics.add.collider(p.sprite, this._platforms, () => p.burst());
  }

  spawnShade(x, y, geo) {
    this._save.shade = { room: this._currentRoom, x, y, geo };
    this._shade = new Shade(this, x, y, geo);
    this.physics.add.collider(this._shade.sprite, this._platforms);
  }

  // ── Bench ─────────────────────────────────────────────────────────────────
  _useBench(item) {
    const alreadySame = this._save.benchRoom  === this._currentRoom &&
                        this._save.benchSpawn === item.id;

    // Heal
    const prevMasks = this.knight.masks;
    this.knight.masks = this.knight.masksMax;

    // Destroy shade on bench use
    if (this._save.shade) {
      this._save.shade = null;
      if (this._shade) { this._shade.destroy(); this._shade = null; }
    }

    // Save
    this._save.benchRoom  = this._currentRoom;
    this._save.benchSpawn = item.id;
    this.knight._hud.update();
    SaveSystem.save(this._buildSaveData());

    const dialogueKey = alreadySame ? 'already_rested' : 'rest';
    const lines = DIALOGUE.bench?.[dialogueKey] ?? DIALOGUE.bench?.rest ?? [];
    this._dialogue.show(lines, () => {});

    this._audio.playSfx?.('sfx_bench');
  }

  // ── Room transition ────────────────────────────────────────────────────────
  _transitionRoom(destRoom, destSpawn) {
    if (this._transitioning) return;
    this._transitioning = true;

    this._camera.fadeOut(300, () => {
      this._currentRoom = destRoom;
      const rDef = WORLD_MAP[destRoom];

      this._loadRoom(destRoom, destSpawn);

      this._camera.follow(
        this.knight.sprite,
        rDef?._w ?? C.WIDTH,
        rDef?._h ?? C.HEIGHT
      );

      this._hud.showAreaName(rDef?.displayName ?? '');
      this.knight._hud = this._hud;
      this._hud.update();

      this._camera.fadeIn(300);
      this.time.delayedCall(350, () => { this._transitioning = false; });
    });
  }

  // ── Pause ─────────────────────────────────────────────────────────────────
  togglePause() {
    this._paused = !this._paused;
    if (this._paused) this._pauseMenu.show();
    else             this._pauseMenu.hide();
  }

  // ── Player death ──────────────────────────────────────────────────────────
  onPlayerDeath() {
    if (this._dying) return;
    this._dying = true;

    this._save.deaths++;
    SaveSystem.save(this._buildSaveData());

    this._camera.fadeOut(800, () => {
      // Respawn at last bench
      this._currentRoom = this._save.benchRoom;
      this.knight.masks = this.knight.masksMax;
      this.knight.state.isDead = false;
      this.knight.state.action = 'idle';
      this.knight.sprite.setAlpha(1);
      this.knight.body.setAllowGravity(true);

      this._loadRoom(this._currentRoom, this._save.benchSpawn ?? 'bench');
      this._hud.update();
      this._camera.fadeIn(600);
      this._dying = false;
    });
  }

  // ── Ground check helper ───────────────────────────────────────────────────
  _checkGroundAt(x, y) {
    // Approximate tile check using platform rectangles
    const grp = this._platforms?.getChildren() ?? [];
    for (const img of grp) {
      const b = img.getBounds();
      if (x >= b.left && x <= b.right && y >= b.top && y <= b.bottom) {
        return true;
      }
    }
    return false;
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  _autoSave() {
    const data = this._buildSaveData();
    SaveSystem.save(data);
  }

  _buildSaveData() {
    const kData = this.knight?.toSaveData() ?? {};
    return Object.assign(this._save, kData, {
      benchRoom: this._save.benchRoom,
    });
  }

  // ── Main update loop ──────────────────────────────────────────────────────
  update(time, delta) {
    const dt = delta / 1000;

    this._input.update();

    // Global pause / map toggle
    if (this._input.pause && !this._dialogue.isVisible) {
      this.togglePause();
    }
    if (this._input.map && !this._pauseMenu.isVisible) {
      this._mapScreen.isVisible ? this._mapScreen.hide() : this._mapScreen.show();
    }

    // Pause menu navigation
    if (this._pauseMenu.isVisible) {
      if (this._input.justPressed('UP'))   this._pauseMenu.navigate(-1);
      if (this._input.justPressed('DOWN')) this._pauseMenu.navigate(1);
      if (this._input.justPressed('JUMP') || this._input.justPressed('ATTACK'))
        this._pauseMenu.select();
      return;
    }

    // Map screen
    if (this._mapScreen.isVisible) return;

    // Dialogue advance
    if (this._dialogue.isVisible) {
      if (this._input.interact || this._input.attack) this._dialogue.advance();
      return;
    }

    if (this._paused) return;

    // ── Entities update ────────────────────────────────────────────────────
    this.knight?.update(dt);

    for (const e of this._enemies)     e.alive && e.update(dt);
    for (const n of this._npcs)        n.alive && n.update(dt);
    for (const p of this._projectiles) p.alive && p.update(dt);
    for (const s of this._shards)      s.alive && s.update(dt);
    if (this._shade?.alive)             this._shade.update(dt);

    // NPC interaction
    if (this._input.interact) {
      for (const n of this._npcs) {
        if (n.tryInteract()) break;
      }
    }

    // HUD focus bar
    if (this.knight?.state.isFocusing) {
      const pct = this.knight.state.focusTimer / C.SOUL_FOCUS_DUR;
      this._hud.showFocusBar(pct);
    } else {
      this._hud.hideFocusBar();
    }

    // Remove dead entities
    this._enemies     = this._enemies.filter(e => e.alive);
    this._projectiles = this._projectiles.filter(p => p.alive);
    this._shards      = this._shards.filter(s => s.alive);
  }
}
