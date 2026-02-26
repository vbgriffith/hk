/**
 * scenes/GameScene.js
 * Phase 2: Core gameplay — aliens, player, math, combat.
 *
 * Architecture:
 *  - AlienGrid  : manages the formation, movement, answer labels
 *  - Player     : handles input, movement, shooting
 *  - MathEngine : current problem, answer checking
 *  - BarrierRow : destructible bunkers
 *  - Effects    : particles, screen flash, sounds
 */

class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  // ─────────────────────────────────────────────────────
  // Init & Create
  // ─────────────────────────────────────────────────────

  init(data) {
    this.currentLevel = data.level || 1;
    this.problemData  = null;
    this.answerGrid   = null;          // 2D: [row][col] = number value
    this.alienCells   = [];            // 2D: [row][col] = { sprite, label, alive, value }
    this.barriers     = [];
    this.bullets      = [];
    this.bombs        = [];
    this.playerBullet = null;
    this.lastShot     = 0;
    this.alienDir     = 1;             // 1 = right, -1 = left
    this.alienDropPending = false;
    this.moveTimer    = 0;
    this.moveDelay    = CONFIG.ALIEN_MOVE_DELAY - (this.currentLevel - 1) * CONFIG.ALIEN_SPEED_INC;
    this.moveDelay    = Math.max(this.moveDelay, CONFIG.ALIEN_MIN_DELAY);
    this.gameActive   = true;
    this.inputBuffer  = '';
    this.waveClear    = false;
  }

  create() {
    const { width, height } = this.scale;

    ScoreTracker.setLevel(this.currentLevel);
    ScoreTracker.showHUD();

    // Layers / depth groups
    this.starLayer    = this.add.group();
    this.barrierLayer = this.add.group();
    this.alienLayer   = this.add.group();
    this.bulletLayer  = this.add.group();
    this.fxLayer      = this.add.group();

    this.buildStarfield();
    this.buildBarriers();
    this.newProblem();
    this.buildPlayer();
    this.buildGroundLine();
    this.setupInput();
    this.setupParticles();

    // Level label
    this.levelBanner = this.add.text(width / 2, height / 2, `LEVEL ${this.currentLevel}`, {
      fontFamily: CONFIG.FONT_PIXEL,
      fontSize:   '32px',
      color:      CONFIG.COLORS.TEXT_YELLOW,
    }).setOrigin(0.5).setDepth(CONFIG.DEPTH.UI);

    this.time.delayedCall(1500, () => {
      this.tweens.add({ targets: this.levelBanner, alpha: 0, duration: 500, onComplete: () => this.levelBanner.destroy() });
    });
  }

  // ─────────────────────────────────────────────────────
  // Starfield
  // ─────────────────────────────────────────────────────

  buildStarfield() {
    const { width, height } = this.scale;
    this.starObjs = [];
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const s = this.add.rectangle(x, y, 1 + (i % 2), 1 + (i % 2), 0xffffff, 0.3 + Math.random() * 0.5)
                   .setDepth(CONFIG.DEPTH.STARS);
      s.scrollSpeed = 0.1 + Math.random() * 0.3;
      this.starObjs.push(s);
    }
  }

  // ─────────────────────────────────────────────────────
  // Math Problem
  // ─────────────────────────────────────────────────────

  newProblem() {
    // Clear existing aliens
    this.clearAliens();

    // Generate problem
    this.problemData = Utils.generateProblem(this.currentLevel);
    const rows       = CONFIG.ALIEN_ROWS;
    const cols       = Math.max(4, CONFIG.ALIEN_COLS - Math.floor(this.currentLevel / 2));
    this.answerGrid  = Utils.buildAnswerGrid(this.problemData, rows, cols);

    // Update DOM question
    ScoreTracker.updateQuestion(this.problemData.question);

    // Build alien grid
    this.buildAlienGrid(rows, cols);
  }

  // ─────────────────────────────────────────────────────
  // Alien Grid
  // ─────────────────────────────────────────────────────

  buildAlienGrid(rows, cols) {
    const { width } = this.scale;
    this.alienCells  = [];
    this.alienDir    = 1;
    this.alienDropPending = false;
    this.moveTimer   = 0;

    const totalW = (cols - 1) * CONFIG.ALIEN_X_GAP;
    const startX = (width - totalW) / 2;

    for (let r = 0; r < rows; r++) {
      this.alienCells[r] = [];
      const textureKey = `alien_${r}`;
      const rowColor   = [CONFIG.COLORS.ALIEN_ROW0, CONFIG.COLORS.ALIEN_ROW1, CONFIG.COLORS.ALIEN_ROW2][r];

      for (let c = 0; c < cols; c++) {
        const x     = startX + c * CONFIG.ALIEN_X_GAP;
        const y     = CONFIG.ALIEN_Y_START + r * CONFIG.ALIEN_Y_GAP;
        const value = this.answerGrid[r][c];

        // Alien sprite
        const sprite = this.add.image(x, y, textureKey)
          .setDepth(CONFIG.DEPTH.ALIENS)
          .setScale(0.9);

        // Hover tween
        this.tweens.add({
          targets:  sprite,
          y:        y + 4,
          duration: 800 + Phaser.Math.Between(0, 400),
          ease:     'Sine.easeInOut',
          yoyo:     true,
          repeat:   -1,
        });

        // Answer label ON the alien body
        const isCorrect = value === this.problemData.answer;
        const label = this.add.text(x, y + 1, String(value), {
          fontFamily: CONFIG.FONT_PIXEL,
          fontSize:   '11px',
          color:      isCorrect ? CONFIG.COLORS.TEXT_YELLOW : '#ffffff',
          stroke:     '#000000',
          strokeThickness: 3,
        }).setOrigin(0.5).setDepth(CONFIG.DEPTH.ALIENS + 1);

        this.alienCells[r][c] = { sprite, label, alive: true, value, isCorrect, x, y };
        this.alienLayer.add(sprite);
        this.alienLayer.add(label);
      }
    }

    // Entrance animation
    for (const row of this.alienCells) {
      for (const cell of row) {
        cell.sprite.setAlpha(0);
        cell.label.setAlpha(0);
        this.tweens.add({ targets: [cell.sprite, cell.label], alpha: 1, duration: 400, ease: 'Cubic.easeOut', delay: Phaser.Math.Between(0, 300) });
      }
    }
  }

  clearAliens() {
    if (this.alienCells.length === 0) return;
    for (const row of this.alienCells) {
      for (const cell of row) {
        if (cell.sprite) cell.sprite.destroy();
        if (cell.label)  cell.label.destroy();
      }
    }
    this.alienCells = [];
  }

  getLiveAliens() {
    const live = [];
    for (const row of this.alienCells) {
      for (const cell of row) {
        if (cell.alive) live.push(cell);
      }
    }
    return live;
  }

  getAlienBounds() {
    const live = this.getLiveAliens();
    if (live.length === 0) return null;
    let minX = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const cell of live) {
      const sx = cell.sprite.x;
      const sy = cell.sprite.y;
      if (sx < minX) minX = sx;
      if (sx > maxX) maxX = sx;
      if (sy > maxY) maxY = sy;
    }
    return { minX, maxX, maxY };
  }

  moveAliens(delta) {
    this.moveTimer += delta;
    if (this.moveTimer < this.moveDelay) return;
    this.moveTimer = 0;

    const bounds = this.getAlienBounds();
    if (!bounds) return;

    const { width } = this.scale;
    const margin = 30;
    let drop = false;

    // Check wall collision
    if (this.alienDir === 1  && bounds.maxX + CONFIG.ALIEN_MOVE_STEP > width - margin) {
      this.alienDir = -1;
      drop = true;
    } else if (this.alienDir === -1 && bounds.minX - CONFIG.ALIEN_MOVE_STEP < margin) {
      this.alienDir = 1;
      drop = true;
    }

    for (const row of this.alienCells) {
      for (const cell of row) {
        if (!cell.alive) continue;
        if (drop) {
          cell.sprite.y += CONFIG.ALIEN_DROP_STEP;
          cell.label.y  += CONFIG.ALIEN_DROP_STEP;
        } else {
          cell.sprite.x += this.alienDir * CONFIG.ALIEN_MOVE_STEP;
          cell.label.x  += this.alienDir * CONFIG.ALIEN_MOVE_STEP;
        }
      }
    }

    // Accelerate after kills
    const live  = this.getLiveAliens();
    const total = this.alienCells.reduce((s, r) => s + r.length, 0);
    const ratio = live.length / total;
    const boost = (1 - ratio) * 400;
    this.moveDelay = Math.max(
      CONFIG.ALIEN_MIN_DELAY,
      (CONFIG.ALIEN_MOVE_DELAY - (this.currentLevel - 1) * CONFIG.ALIEN_SPEED_INC) - boost
    );
  }

  dropBombs() {
    if (this.bombs.length >= CONFIG.BOMB_MAX) return;
    const live = this.getLiveAliens();
    for (const cell of live) {
      if (Math.random() < CONFIG.BOMB_CHANCE) {
        if (this.bombs.length >= CONFIG.BOMB_MAX) break;
        const bomb = this.physics.add.image(cell.sprite.x, cell.sprite.y + 24, 'bomb')
          .setDepth(CONFIG.DEPTH.BOMBS);
        bomb.setVelocityY(CONFIG.BOMB_SPEED);
        this.bombs.push(bomb);
      }
    }
  }

  // ─────────────────────────────────────────────────────
  // Player
  // ─────────────────────────────────────────────────────

  buildPlayer() {
    const { width, height } = this.scale;
    this.player = this.physics.add.image(width / 2, height - CONFIG.PLAYER_Y_OFFSET, 'player')
      .setCollideWorldBounds(true)
      .setDepth(CONFIG.DEPTH.PLAYER);

    // Engine glow effect
    this.engineGlow = this.add.graphics().setDepth(CONFIG.DEPTH.PLAYER - 1);
  }

  buildGroundLine() {
    const { width, height } = this.scale;
    const line = this.add.graphics().setDepth(CONFIG.DEPTH.UI);
    line.lineStyle(1, CONFIG.COLORS.ALIEN_ROW0, 0.5);
    line.lineBetween(0, height - 20, width, height - 20);
  }

  movePlayer(delta) {
    const keys   = this.cursors;
    const speed  = CONFIG.PLAYER_SPEED;
    this.player.setVelocityX(0);

    if (keys.left.isDown  || this.wasdKeys.A.isDown) {
      this.player.setVelocityX(-speed);
      this.player.setRotation(-0.05);
    } else if (keys.right.isDown || this.wasdKeys.D.isDown) {
      this.player.setVelocityX(speed);
      this.player.setRotation(0.05);
    } else {
      this.player.setRotation(0);
    }

    // Draw engine glow
    this.engineGlow.clear();
    if (this.gameActive) {
      this.engineGlow.fillStyle(0x00aaff, 0.4 + Math.sin(this.time.now / 80) * 0.2);
      this.engineGlow.fillEllipse(this.player.x, this.player.y + 20, 20, 8 + Math.random() * 6);
    }
  }

  // ─────────────────────────────────────────────────────
  // Shooting
  // ─────────────────────────────────────────────────────

  shoot() {
    const now = this.time.now;
    if (now - this.lastShot < CONFIG.SHOOT_COOLDOWN) return;
    if (!this.gameActive) return;
    this.lastShot = now;

    // Remove old bullet if still alive
    if (this.playerBullet && this.playerBullet.active) {
      this.playerBullet.destroy();
    }

    this.playerBullet = this.physics.add.image(this.player.x, this.player.y - 28, 'bullet')
      .setDepth(CONFIG.DEPTH.BULLETS);
    this.playerBullet.setVelocityY(-CONFIG.BULLET_SPEED);
    this.bullets.push(this.playerBullet);
  }

  checkBulletAlienCollisions() {
    if (!this.playerBullet || !this.playerBullet.active) return;
    const bx = this.playerBullet.x;
    const by = this.playerBullet.y;

    for (const row of this.alienCells) {
      for (const cell of row) {
        if (!cell.alive) continue;
        const sx = cell.sprite.x;
        const sy = cell.sprite.y;
        if (Math.abs(bx - sx) < 24 && Math.abs(by - sy) < 20) {
          // Hit!
          this.playerBullet.destroy();
          this.playerBullet = null;
          this.onAlienHit(cell);
          return;
        }
      }
    }

    // Off-screen
    if (this.playerBullet && this.playerBullet.y < -20) {
      this.playerBullet.destroy();
      this.playerBullet = null;
    }
  }

  onAlienHit(cell) {
    const wasCorrect = cell.value === this.problemData.answer;

    // Explosion
    this.explode(cell.sprite.x, cell.sprite.y, wasCorrect ? CONFIG.COLORS.ALIEN_ROW0 : CONFIG.COLORS.BOMB);

    // Kill the alien
    cell.alive = false;
    cell.sprite.destroy();
    cell.label.destroy();

    // Record answer
    ScoreTracker.recordAnswer({
      question:   this.problemData.question,
      answer:     this.problemData.answer,
      given:      cell.value,
      operation:  this.problemData.operation,
      wasCorrect,
    });

    ScoreTracker.flashScreen(wasCorrect);

    if (wasCorrect) {
      this.onCorrectAnswer();
    } else {
      this.onWrongAnswer();
    }
  }

  onCorrectAnswer() {
    // Clear entire wave and start new problem
    const live = this.getLiveAliens();
    for (const cell of live) {
      this.time.delayedCall(Phaser.Math.Between(0, 200), () => {
        if (cell.alive) {
          this.explode(cell.sprite.x, cell.sprite.y, CONFIG.COLORS.ALIEN_ROW1);
          cell.alive = false;
          cell.sprite.destroy();
          cell.label.destroy();
        }
      });
    }

    // Small delay before new problem
    this.gameActive = false;
    this.time.delayedCall(700, () => {
      this.gameActive = true;
      this.checkLevelUp();
      this.newProblem();
    });
  }

  onWrongAnswer() {
    // Flash feedback — wrong alien dies but problem continues
    // Player loses no life for wrong answer, just score penalty (handled in tracker)
    // Highlight remaining correct alien briefly
    this.highlightCorrectAlien();
  }

  highlightCorrectAlien() {
    for (const row of this.alienCells) {
      for (const cell of row) {
        if (cell.alive && cell.isCorrect) {
          this.tweens.add({
            targets:  cell.sprite,
            scaleX:   1.3,
            scaleY:   1.3,
            duration: 200,
            yoyo:     true,
            repeat:   2,
          });
        }
      }
    }
  }

  checkLevelUp() {
    const summary = ScoreTracker.getSummary();
    const thresholds = CONFIG.LEVEL_THRESHOLDS;
    const newLevel   = thresholds.filter(t => summary.score >= t).length;
    if (newLevel > this.currentLevel) {
      this.currentLevel = newLevel;
      ScoreTracker.setLevel(this.currentLevel);
      this.showLevelUpBanner();
      // Adjust speed
      this.moveDelay = Math.max(
        CONFIG.ALIEN_MIN_DELAY,
        CONFIG.ALIEN_MOVE_DELAY - (this.currentLevel - 1) * CONFIG.ALIEN_SPEED_INC
      );
    }
  }

  showLevelUpBanner() {
    const { width, height } = this.scale;
    const txt = this.add.text(width / 2, height / 2, `LEVEL ${this.currentLevel}!`, {
      fontFamily: CONFIG.FONT_PIXEL,
      fontSize:   '36px',
      color:      CONFIG.COLORS.TEXT_YELLOW,
    }).setOrigin(0.5).setDepth(CONFIG.DEPTH.UI);

    this.tweens.add({ targets: txt, y: height / 2 - 60, alpha: 0, duration: 1200, ease: 'Cubic.easeOut', onComplete: () => txt.destroy() });
  }

  // ─────────────────────────────────────────────────────
  // Barriers
  // ─────────────────────────────────────────────────────

  buildBarriers() {
    const { width, height } = this.scale;
    const gap    = width / (CONFIG.BARRIER_COUNT + 1);
    const y      = height - CONFIG.BARRIER_Y_OFFSET;

    this.barrierObjs = [];
    for (let i = 0; i < CONFIG.BARRIER_COUNT; i++) {
      const x = gap * (i + 1);
      const bar = {
        sprite: this.add.image(x, y, 'barrier').setDepth(CONFIG.DEPTH.BARRIERS),
        hp:     CONFIG.BARRIER_HP,
        x,
        y,
      };
      this.barrierObjs.push(bar);
    }
  }

  checkBombBarrierCollision(bomb) {
    for (const bar of this.barrierObjs) {
      if (bar.hp <= 0) continue;
      if (Math.abs(bomb.x - bar.x) < 32 && Math.abs(bomb.y - bar.y) < 20) {
        bar.hp--;
        const t = bar.hp / CONFIG.BARRIER_HP;
        bar.sprite.setTint(Phaser.Display.Color.GetColor(
          Math.floor(0 * t + 255 * (1 - t)),
          Math.floor(255 * t),
          0
        ));
        if (bar.hp <= 0) bar.sprite.setVisible(false);
        return true; // bomb destroyed
      }
    }
    return false;
  }

  checkBulletBarrierCollision() {
    if (!this.playerBullet || !this.playerBullet.active) return;
    for (const bar of this.barrierObjs) {
      if (bar.hp <= 0) continue;
      if (Math.abs(this.playerBullet.x - bar.x) < 32 && Math.abs(this.playerBullet.y - bar.y) < 20) {
        this.playerBullet.destroy();
        this.playerBullet = null;
        bar.hp--;
        if (bar.hp <= 0) bar.sprite.setVisible(false);
        return;
      }
    }
  }

  // ─────────────────────────────────────────────────────
  // Bombs
  // ─────────────────────────────────────────────────────

  updateBombs() {
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bomb = this.bombs[i];
      if (!bomb.active) { this.bombs.splice(i, 1); continue; }

      // Off-screen
      if (bomb.y > this.scale.height + 20) { bomb.destroy(); this.bombs.splice(i, 1); continue; }

      // Hit barrier
      if (this.checkBombBarrierCollision(bomb)) { bomb.destroy(); this.bombs.splice(i, 1); continue; }

      // Hit player
      if (this.player && this.player.active) {
        if (Math.abs(bomb.x - this.player.x) < 22 && Math.abs(bomb.y - this.player.y) < 18) {
          bomb.destroy();
          this.bombs.splice(i, 1);
          this.playerHit();
        }
      }
    }
  }

  playerHit() {
    if (!this.gameActive) return;
    ScoreTracker.recordBombHit();
    this.explode(this.player.x, this.player.y, CONFIG.COLORS.BOMB);
    ScoreTracker.flashScreen(false);

    const lives = ScoreTracker.getLives();
    if (lives <= 0) {
      this.gameOver();
    } else {
      // Brief invincibility flash
      this.gameActive = false;
      this.tweens.add({
        targets:  this.player,
        alpha:    0,
        duration: 120,
        yoyo:     true,
        repeat:   5,
        onComplete: () => {
          this.player.setAlpha(1);
          this.gameActive = true;
        },
      });
    }
  }

  // ─────────────────────────────────────────────────────
  // Particles & Effects
  // ─────────────────────────────────────────────────────

  setupParticles() {
    this.fxGraphics = this.add.graphics().setDepth(CONFIG.DEPTH.PARTICLES);
    this.particles  = []; // { x, y, vx, vy, life, color }
  }

  explode(x, y, color) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.particles.push({
        x, y,
        vx:    Math.cos(angle) * speed,
        vy:    Math.sin(angle) * speed,
        life:  1,
        color,
      });
    }
  }

  updateParticles(delta) {
    const dt = delta / 1000;
    this.fxGraphics.clear();

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x    += p.vx * dt;
      p.y    += p.vy * dt;
      p.vy   += 120 * dt; // gravity
      p.life -= dt * 2;

      if (p.life <= 0) { this.particles.splice(i, 1); continue; }

      const c = Phaser.Display.Color.IntegerToColor(p.color);
      this.fxGraphics.fillStyle(p.color, p.life);
      this.fxGraphics.fillRect(p.x - 3, p.y - 3, 6, 6);
    }
  }

  // ─────────────────────────────────────────────────────
  // Input
  // ─────────────────────────────────────────────────────

  setupInput() {
    this.cursors   = this.input.keyboard.createCursorKeys();
    this.wasdKeys  = this.input.keyboard.addKeys('W,A,S,D');
    this.spaceKey  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Alphanumeric for answer typing (not used in this shooting version, but kept for future)
    this.input.keyboard.on('keydown', (event) => {
      if (!this.gameActive) return;
      if (event.key === ' ' || event.code === 'Space') return; // handled by spaceKey

      // Number input for typed-answer alternative mode
      if (/^[0-9]$/.test(event.key)) {
        if (this.inputBuffer.length < 3) {
          this.inputBuffer += event.key;
          ScoreTracker.updateInput(this.inputBuffer);
        }
      } else if (event.key === 'Backspace') {
        this.inputBuffer = this.inputBuffer.slice(0, -1);
        ScoreTracker.updateInput(this.inputBuffer);
      } else if (event.key === 'Enter' && this.inputBuffer !== '') {
        this.submitTypedAnswer();
      } else if (event.key === 'Escape') {
        this.scene.start('MenuScene');
      }
    });
  }

  submitTypedAnswer() {
    const typed = parseInt(this.inputBuffer, 10);
    this.inputBuffer = '';
    ScoreTracker.updateInput('');

    // Find alien with this value (prefer bottom row)
    for (let r = this.alienCells.length - 1; r >= 0; r--) {
      for (const cell of this.alienCells[r]) {
        if (cell.alive && cell.value === typed) {
          // Aim and fire automatically at this alien
          this.player.x = cell.sprite.x;
          this.shoot();
          return;
        }
      }
    }

    // Typed value not on any alien
    ScoreTracker.recordAnswer({
      question:   this.problemData.question,
      answer:     this.problemData.answer,
      given:      typed,
      operation:  this.problemData.operation,
      wasCorrect: false,
    });
    ScoreTracker.flashScreen(false);
  }

  // ─────────────────────────────────────────────────────
  // Game Over / Win
  // ─────────────────────────────────────────────────────

  checkAliensReached() {
    const bounds = this.getAlienBounds();
    if (!bounds) return false;
    return bounds.maxY > this.scale.height - 100;
  }

  gameOver() {
    this.gameActive = false;
    const summary   = ScoreTracker.end();
    this.clearAliens();

    this.time.delayedCall(800, () => {
      ScoreTracker.hideHUD();
      this.scene.start('GameOverScene', { summary, won: false });
    });
  }

  // ─────────────────────────────────────────────────────
  // Update Loop
  // ─────────────────────────────────────────────────────

  update(time, delta) {
    if (!this.gameActive && this.getLiveAliens().length > 0) return;

    // Scroll stars
    for (const s of this.starObjs) {
      s.y += s.scrollSpeed;
      if (s.y > this.scale.height) s.y = 0;
    }

    if (!this.gameActive) return;

    // Player movement
    this.movePlayer(delta);

    // Shoot on SPACE
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.shoot();

    // Alien movement
    this.moveAliens(delta);

    // Alien bombs
    this.dropBombs();
    this.updateBombs();

    // Collision checks
    this.checkBulletAlienCollisions();
    this.checkBulletBarrierCollision();

    // Particles
    this.updateParticles(delta);

    // Did aliens reach the bottom?
    if (this.checkAliensReached()) {
      this.gameOver();
    }

    // Check all aliens dead (correct was already handled; shouldn't happen but safety)
    if (this.getLiveAliens().length === 0 && this.gameActive) {
      this.gameActive = false;
      this.time.delayedCall(400, () => { this.gameActive = true; this.newProblem(); });
    }
  }
}
