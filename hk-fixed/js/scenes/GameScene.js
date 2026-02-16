/* js/scenes/GameScene.js — Primary gameplay scene */
'use strict';

class GameScene extends Phaser.Scene {
  constructor() { super(C.SCENE_GAME); }

  init(data) {
    this._save             = data.save ?? SaveSystem.defaultSave();
    this._currentRoom      = this._save.benchRoom ?? 'crossroads_entrance';
    this._spawnPoint       = this._save.benchSpawn ?? 'default';
    this._paused           = false;
    this._dying            = false;
    this._transitioning    = false;
    this._transitionCooldown = 0;
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
    // Only add solid walls on sides with NO exit connection
    const def   = WORLD_MAP[this._currentRoom] ?? {};
    const conns = def.connections ?? {};
    const wallThick = 10;
    const makeWall = (x, y, w, h) => {
      const img = this.physics.add.staticImage(x + w/2, y + h/2, '__DEFAULT');
      img.setSize(w, h).setVisible(false);
      this._platforms.add(img);
    };
    if (!conns.left)  makeWall(-wallThick, 0, wallThick, H);
    if (!conns.right) makeWall(W,          0, wallThick, H);
    // Top/bottom left open for vertical exits
  }

  _buildTransitions(def, W, H) {
    this._transitions = [];
    const connections = def.connections ?? {};

    // Zones extend INWARD from the edge so the player walks into them.
    // EDGE_DEPTH: how far inside the room the trigger reaches.
    const EDGE_DEPTH  = 28;
    const EDGE_OFFSET = 8;   // extends slightly past the wall into void

    for (const [dir, dest] of Object.entries(connections)) {
      let tx, ty, tw, th;
      switch (dir) {
        case 'left':
          tx = -EDGE_OFFSET;
          ty = 0;
          tw = EDGE_OFFSET + EDGE_DEPTH;
          th = H;
          break;
        case 'right':
          tx = W - EDGE_DEPTH;
          ty = 0;
          tw = EDGE_DEPTH + EDGE_OFFSET;
          th = H;
          break;
        case 'up':
          tx = 0;
          ty = -EDGE_OFFSET;
          tw = W;
          th = EDGE_OFFSET + EDGE_DEPTH;
          break;
        case 'down':
          tx = 0;
          ty = H - EDGE_DEPTH;
          tw = W;
          th = EDGE_DEPTH + EDGE_OFFSET;
          break;
        default:
          continue;
      }

      const zone = this.physics.add.staticImage(tx + tw/2, ty + th/2, '__DEFAULT');
      zone.setSize(tw, th).setVisible(false);
      zone.destRoom  = dest.roomKey;
      zone.destSpawn = dest.spawnPoint;
      zone.direction = dir;

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
    // ── Collect protected UI objects (must survive room transitions) ──────────
    const hudObjects  = new Set(this._hud?.getDisplayObjects()  ?? []);
    const uiObjects   = new Set([
      ...(this._dialogue?._getDisplayObjects?.() ?? []),
      ...(this._pauseMenu?._getDisplayObjects?.() ?? []),
      ...(this._mapScreen?._getDisplayObjects?.() ?? []),
      ...(this._inventory?._getDisplayObjects?.() ?? []),
      ...(this._shop?._getDisplayObjects?.() ?? []),
    ]);

    // ── Destroy static physics groups first ───────────────────────────────────
    this._platforms?.clear(true, true);
    this._hazards?.clear(true, true);

    // ── Destroy all dynamic entities ─────────────────────────────────────────
    for (const e of this._enemies)     { try { e.sprite?.destroy(); } catch(_){} }
    for (const n of this._npcs)        { try { n.sprite?.destroy(); } catch(_){} }
    for (const p of this._projectiles) { try { p.sprite?.destroy(); } catch(_){} }
    for (const s of this._shards)      { try { s.sprite?.destroy(); } catch(_){} }
    for (const b of (this._bosses??[])){ try { b.sprite?.destroy(); } catch(_){} }

    this._enemies     = [];
    this._npcs        = [];
    this._projectiles = [];
    this._shards      = [];
    this._items       = [];
    this._bosses      = [];
    this._transitions = [];

    // ── Now wipe all physics colliders/overlaps from the world ───────────────
    try { this.physics.world.colliders.destroy(); } catch(_) {}

    if (this._shade) { try { this._shade.sprite?.destroy(); } catch(_){} this._shade = null; }

    // ── Clear all scene display objects except knight sprite and UI ──────────
    const knightSprite = this.knight?.sprite;
    this.children.list.slice().forEach(c => {
      if (!c) return;
      if (c === knightSprite) return;
      if (hudObjects.has(c)) return;
      if (uiObjects.has(c)) return;
      try { c.destroy(); } catch(_) {}
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
    if (this._transitionCooldown > 0) return;   // prevent immediate re-trigger on arrival
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
      // Short cooldown after arriving so overlap zones don't re-fire instantly
      this._transitionCooldown = 0.6;
      this.time.delayedCall(600, () => {
        this._transitioning = false;
      });
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

    // Tick transition cooldown
    if (this._transitionCooldown > 0) this._transitionCooldown -= dt;

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

// ── Phase II: GameScene extensions ────────────────────────────────────────

const _origGameCreate = GameScene.prototype.create;
GameScene.prototype.create = function() {
  _origGameCreate.call(this);

  // Charm system
  this.knight._charms = new CharmSystem(this.knight, this._save);

  // Apply dream nail extension
  DreamNailExtension.apply(this.knight);

  // Inventory screen (replaces stub)
  this._inventory = new InventoryScreen(this);
};

// Extend _spawnEnemy to handle new types
const _origSpawnEnemy = GameScene.prototype._spawnEnemy;
GameScene.prototype._spawnEnemy = function(eData) {
  let enemy;
  switch (eData.type) {
    case 'mosscreep':
      enemy = new Mosscreep(this, eData.x, eData.y, eData.data ?? {});
      break;
    case 'vengefly':
      enemy = new Vengefly(this, eData.x, eData.y, eData.data ?? {});
      break;
    case 'aspid':
      enemy = new Aspid(this, eData.x, eData.y, eData.data ?? {});
      break;
    default:
      return _origSpawnEnemy.call(this, eData);
  }
  this._enemies.push(enemy);
  this.physics.add.collider(enemy.sprite, this._platforms);
};

// Extend _loadRoom to spawn bosses
const _origLoadRoom = GameScene.prototype._loadRoom;
GameScene.prototype._loadRoom = function(roomKey, spawnPoint) {
  _origLoadRoom.call(this, roomKey, spawnPoint);
  const def = WORLD_MAP[roomKey];
  if (!def) return;

  this._bosses = this._bosses ?? [];

  for (const bData of def.bosses ?? []) {
    if (this._save.flags?.[bData.id]) continue;   // already defeated
    this._spawnBoss(bData);
  }

  // Dream nail pedestal
  for (const item of def.items ?? []) {
    if (item.type === 'dream_nail_pedestal') {
      this._buildDreamNailPedestal(item);
    }
  }
};

GameScene.prototype._spawnBoss = function(bData) {
  let boss;
  switch (bData.type) {
    case 'false_knight':
      boss = new FalseKnight(this, bData.x, bData.y, bData);
      break;
    case 'gruz_mother':
      boss = new GruzMother(this, bData.x, bData.y, bData);
      break;
    case 'vengefly_king':
      boss = new VengeflyKing(this, bData.x, bData.y, bData);
      break;
    default:
      return;
  }
  if (!this._bosses) this._bosses = [];
  this._bosses.push(boss);
  this.physics.add.collider(boss.sprite, this._platforms);

  // Boss nail hit
  const overlap = this.physics.add.overlap(
    this.knight.sprite, boss.sprite, () => {
      // Boss contact damage is handled inside boss AI
    }
  );
};

GameScene.prototype._buildDreamNailPedestal = function(item) {
  if (this._save.abilities?.dreamnail) return; // already have it

  const collected = this._save.itemsCollected?.includes(item.id);
  if (collected) return;

  // Draw pedestal
  const g = this.add.graphics().setDepth(C.LAYER_TILES + 2);
  g.fillStyle(0x3a3a5a, 0.9);
  g.fillRect(item.x - 12, item.y - 4, 24, 8);
  g.fillStyle(0x5a5a8a, 0.6);
  g.fillRect(item.x - 10, item.y - 6, 20, 4);

  // Glow pulse
  const glow = this.add.graphics().setDepth(C.LAYER_TILES + 3);
  this.tweens.add({
    targets: { t: 0 }, t: 1, duration: 1200, yoyo: true, repeat: -1,
    onUpdate: (tween) => {
      const t = tween.getValue();
      glow.clear();
      glow.fillStyle(0xaaaaff, 0.1 + t * 0.25);
      glow.fillCircle(item.x, item.y - 10, 8 + t * 6);
    },
  });

  // Interaction zone
  const zone = this.physics.add.staticImage(item.x, item.y - 6, '__DEFAULT');
  zone.setSize(24, 16).setVisible(false);

  this.physics.add.overlap(this.knight.sprite, zone, () => {
    if (!this._input.interact) return;
    // Grant dream nail
    this.knight.abilities.dreamnail = true;
    this._save.abilities.dreamnail  = true;
    this._save.itemsCollected.push(item.id);
    SaveSystem.save(this._buildSaveData());

    g.destroy(); glow.destroy(); zone.destroy();
    this._dialogue.show(DIALOGUE.dream_nail_acquire, () => {});
    this._particles?.burst({ x: item.x, y: item.y - 10, count: 16, tint: 0xaaaaff });
    this._camera?.flash(0xaaaaff, 400);
  });
};

// Extend _buildBackground for Greenpath
const _origBuildBackground = GameScene.prototype._buildBackground;
GameScene.prototype._buildBackground = function(def) {
  const isGreen = def.key?.startsWith('greenpath');
  if (isGreen) {
    const W = def._w ?? C.WIDTH, H = def._h ?? C.HEIGHT;
    const far = this.add.graphics().setDepth(C.LAYER_BG).setScrollFactor(0.1);
    far.fillGradientStyle(0x060e04, 0x060e04, 0x0a1408, 0x0a1408, 1);
    far.fillRect(-W, -H, W * 3, H * 3);

    for (let i = 0; i < 5; i++) {
      const bx = (W / 5) * i + Phaser.Math.Between(0, W / 5);
      this.add.image(bx, -20, 'bg_greenpath')
        .setDepth(C.LAYER_BG_DETAIL).setScrollFactor(0.3).setAlpha(0.6);
    }

    // Green fireflies
    for (let i = 0; i < 10; i++) {
      const gp = this.add.graphics();
      gp.setPosition(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H));
      gp.setDepth(C.LAYER_BG_DETAIL + 0.5).setScrollFactor(0.5);
      gp.fillStyle(0x44ff44, 0.4);
      gp.fillCircle(0, 0, 0.6);
      this.tweens.add({
        targets: gp, alpha: { from: 0.1, to: 0.5 },
        duration: Phaser.Math.Between(1500, 3500),
        yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 2000),
      });
    }
  } else {
    _origBuildBackground.call(this, def);
  }
};

// Extend _drawPlatformTiles for Greenpath
const _origDrawPlatformTiles = GameScene.prototype._drawPlatformTiles;
GameScene.prototype._drawPlatformTiles = function(plat) {
  const isGreen = this._currentRoom?.startsWith('greenpath');
  if (!isGreen) { _origDrawPlatformTiles.call(this, plat); return; }

  const TS = C.TILE_SIZE;
  const cols = Math.ceil(plat.w / TS), rows = Math.ceil(plat.h / TS);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tx = plat.x + c * TS, ty = plat.y + r * TS;
      const variant = (c + r) % 4, isTop = r === 0;
      const texKey = isTop ? 'tile_green_floor' : 'tile_green_wall';
      // Fall back to regular tile if green tiles not generated yet
      const key = this.textures.exists(texKey) ? texKey : (isTop ? 'tile_floor' : 'tile_wall');
      this.add.image(tx, ty, key, variant).setOrigin(0, 0).setDepth(C.LAYER_TILES);
    }
  }
};

// Extend update to tick charm system, bosses, inventory
const _origGameUpdate = GameScene.prototype.update;
GameScene.prototype.update = function(time, delta) {
  _origGameUpdate.call(this, time, delta);

  const dt = delta / 1000;

  // Charm system tick
  this.knight?._charms?.update(dt);

  // Bosses
  if (this._bosses) {
    for (const b of this._bosses) b.alive && b.update(dt);
    this._bosses = this._bosses.filter(b => b.alive);
  }

  // Inventory toggle
  if (this._input.justPressed('INVENTORY') && !this._pauseMenu.isVisible && !this._dialogue.isVisible) {
    this._inventory?.isVisible ? this._inventory.hide() : this._inventory?.show();
  }
  if (this._inventory?.isVisible) {
    if (this._input.justPressed('PAUSE') || this._input.justPressed('INVENTORY')) {
      this._inventory.hide();
    }
    const dx = (this._input.justPressed('RIGHT') ? 1 : 0) - (this._input.justPressed('LEFT') ? 1 : 0);
    const dy = (this._input.justPressed('DOWN')  ? 1 : 0) - (this._input.justPressed('UP')   ? 1 : 0);
    if (dx || dy) this._inventory.navigate(dx, dy);
    if (this._input.justPressed('JUMP') || this._input.justPressed('ATTACK')) this._inventory.toggleSelected();
  }

  // Register new boss nail hits
  if (this._bosses?.length) {
    for (const boss of this._bosses) {
      if (!boss._nailRegistered && boss.alive) {
        boss._nailRegistered = true;
        this.physics.add.overlap(this.knight.sprite, boss.sprite, () => {
          // Contact damage handled inside boss — do nothing here
        });
      }
    }
  }
};

// Extend registerNailHit to also hit bosses
const _origRegisterNailHit = GameScene.prototype.registerNailHit;
GameScene.prototype.registerNailHit = function(nailBox) {
  _origRegisterNailHit.call(this, nailBox);

  for (const boss of this._bosses ?? []) {
    if (!boss.alive) continue;
    this.physics.add.overlap(nailBox, boss.sprite, () => {
      if (!nailBox.active) return;
      boss.onHit(nailBox.dmg * (this.knight._spellDmgMult ?? 1), this.knight);
      this.knight.gainSoul();
      this._hud.update();
      if (nailBox.dir === 'down') {
        this.knight.body.setVelocityY(C.KNIGHT_JUMP_VEL * 0.7);
      }
    });
  }
};

// Extend _clearRoom to clear bosses
const _origClearRoom = GameScene.prototype._clearRoom;
GameScene.prototype._clearRoom = function() {
  _origClearRoom.call(this);
  if (this._bosses) {
    for (const b of this._bosses) b.alive && b.destroy?.();
    this._bosses = [];
  }
};

// Extend _buildSaveData to include charms
const _origBuildSaveData = GameScene.prototype._buildSaveData;
GameScene.prototype._buildSaveData = function() {
  const base = _origBuildSaveData.call(this);
  if (this.knight?._charms) {
    Object.assign(base, this.knight._charms.toSaveData());
  }
  return base;
};

// Extend _buildItem for charm chests
const _origBuildItem = GameScene.prototype._buildItem;
GameScene.prototype._buildItem = function(item) {
  _origBuildItem.call(this, item);

  if (item.type === 'chest' && item.contains?.type === 'charm') {
    const collected = this._save.itemsCollected?.includes(item.id);
    if (collected) return;

    const chestSprite = this.add.graphics().setDepth(C.LAYER_TILES + 1);
    chestSprite.fillStyle(0x6a5a3a, 0.9);
    chestSprite.fillRoundedRect(item.x - 10, item.y - 8, 20, 16, 2);
    chestSprite.fillStyle(0xaa8a5a, 0.7);
    chestSprite.fillRect(item.x - 8, item.y - 8, 16, 4);
    chestSprite.lineStyle(1, 0xccaa66, 0.8);
    chestSprite.strokeRoundedRect(item.x - 10, item.y - 8, 20, 16, 2);

    const zone = this.physics.add.staticImage(item.x, item.y, '__DEFAULT');
    zone.setSize(20, 16).setVisible(false);

    this.physics.add.overlap(this.knight.sprite, zone, () => {
      if (!this._input.interact) return;
      if (this._save.itemsCollected.includes(item.id)) return;

      const charmId = item.contains.id;
      this._save.itemsCollected.push(item.id);

      // Add to owned charms
      if (!this._save.ownedCharms) this._save.ownedCharms = [];
      if (!this._save.ownedCharms.includes(charmId)) {
        this._save.ownedCharms.push(charmId);
      }

      SaveSystem.save(this._buildSaveData());

      // Burst effect
      this._particles?.burst({ x: item.x, y: item.y - 8, count: 12, tint: 0x5ae3e3 });
      this._audio?.playSfx('sfx_collect');

      // Destroy chest
      chestSprite.destroy(); zone.destroy();

      // Show charm dialogue
      const lines = DIALOGUE.charms?.[charmId];
      if (lines) this._dialogue.show(lines, () => {});
    });
  }
};
