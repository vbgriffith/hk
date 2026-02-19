/* js/entities/enemies/EnemyVariants.js — Session 9: Unique Enemy Variants
 * 
 * Area-specific enemy types with unique behaviors and appearances
 */
'use strict';

// ══════════════════════════════════════════════════════════════════════════
// GREENPATH ENEMIES
// ══════════════════════════════════════════════════════════════════════════

class Mosscreep extends Enemy {
  constructor(scene, x, y, data) {
    super(scene, x, y, 'mosscreep', {
      hp: 4,
      damage: 1,
      speed: 25,
      geo: 3,
      ...data
    });
    
    this._hopTimer = 0;
    this._hopCooldown = 2000 + Math.random() * 1000;
  }
  
  update(dt, knight) {
    super.update(dt, knight);
    
    if (this.isDead) return;
    
    this._hopTimer += dt * 1000;
    
    // Hop toward player
    if (this._hopTimer >= this._hopCooldown && this.sprite.body.touching.down) {
      const dx = knight.sprite.x - this.sprite.x;
      const dir = Math.sign(dx);
      
      if (Math.abs(dx) < 150) {
        this.sprite.setVelocityX(dir * 80);
        this.sprite.setVelocityY(-150);
        this._hopTimer = 0;
      }
    }
    
    // Apply drag when on ground
    if (this.sprite.body.touching.down) {
      this.sprite.setVelocityX(this.sprite.body.velocity.x * 0.9);
    }
  }
}

class MossKnight extends Enemy {
  constructor(scene, x, y, data) {
    super(scene, x, y, 'moss_knight', {
      hp: 25,
      damage: 2,
      speed: 40,
      geo: 20,
      ...data
    });
    
    this._chargeTimer = 0;
    this._isCharging = false;
  }
  
  update(dt, knight) {
    super.update(dt, knight);
    
    if (this.isDead) return;
    
    const dx = knight.sprite.x - this.sprite.x;
    const dist = Math.abs(dx);
    
    // Charge attack
    if (!this._isCharging && dist < 200 && dist > 50) {
      this._chargeTimer += dt * 1000;
      
      if (this._chargeTimer >= 1500) {
        this._isCharging = true;
        const dir = Math.sign(dx);
        this.sprite.setVelocityX(dir * 200);
        
        setTimeout(() => {
          this._isCharging = false;
          this._chargeTimer = 0;
        }, 800);
      }
    }
    
    // Normal movement when not charging
    if (!this._isCharging && dist > 30) {
      const dir = Math.sign(dx);
      this.sprite.setVelocityX(dir * this.stats.speed);
    } else if (!this._isCharging) {
      this.sprite.setVelocityX(0);
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// FUNGAL WASTES ENEMIES
// ══════════════════════════════════════════════════════════════════════════

class Fungoon extends Enemy {
  constructor(scene, x, y, data) {
    super(scene, x, y, 'fungoon', {
      hp: 6,
      damage: 1,
      speed: 15,
      geo: 4,
      dir: data.dir || 1,
      ...data
    });
    
    this._shootTimer = 0;
    this._shootCooldown = 3000;
  }
  
  update(dt, knight) {
    super.update(dt, knight);
    
    if (this.isDead) return;
    
    // Patrol behavior
    this.sprite.setVelocityX(this.stats.dir * this.stats.speed);
    
    // Turn at edges
    if (this.sprite.body.blocked.left) {
      this.stats.dir = 1;
    } else if (this.sprite.body.blocked.right) {
      this.stats.dir = -1;
    }
    
    // Shoot spores at player
    this._shootTimer += dt * 1000;
    const dx = knight.sprite.x - this.sprite.x;
    const dy = knight.sprite.y - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (this._shootTimer >= this._shootCooldown && dist < 180) {
      this._shootSpore(dx, dy, dist);
      this._shootTimer = 0;
    }
  }
  
  _shootSpore(dx, dy, dist) {
    const angle = Math.atan2(dy, dx);
    const spore = this.scene.add.circle(
      this.sprite.x, this.sprite.y - 5, 3, 0x9a6aaa
    );
    this.scene.physics.add.existing(spore);
    
    spore.body.setVelocity(
      Math.cos(angle) * 100,
      Math.sin(angle) * 100
    );
    
    // Despawn after 2 seconds
    setTimeout(() => spore.destroy(), 2000);
    
    // Damage on contact
    this.scene.physics.add.overlap(spore, this.scene.knight.sprite, () => {
      this.scene.knight.takeDamage(1);
      spore.destroy();
    });
  }
}

class ShrumalOgre extends Enemy {
  constructor(scene, x, y, data) {
    super(scene, x, y, 'shrumal_ogre', {
      hp: 35,
      damage: 2,
      speed: 30,
      geo: 25,
      ...data
    });
    
    this._slamTimer = 0;
    this._isSlam = false;
  }
  
  update(dt, knight) {
    super.update(dt, knight);
    
    if (this.isDead) return;
    
    const dx = knight.sprite.x - this.sprite.x;
    const dist = Math.abs(dx);
    
    // Slam attack
    if (dist < 80 && this.sprite.body.touching.down && !this._isSlam) {
      this._slamTimer += dt * 1000;
      
      if (this._slamTimer >= 1200) {
        this._performSlam();
        this._slamTimer = 0;
      }
    }
    
    // Slow movement
    if (!this._isSlam && dist > 50) {
      const dir = Math.sign(dx);
      this.sprite.setVelocityX(dir * this.stats.speed);
    }
  }
  
  _performSlam() {
    this._isSlam = true;
    this.sprite.setVelocityY(-200);
    
    setTimeout(() => {
      // Create shockwave when landing
      if (this.sprite.body.touching.down) {
        const wave = this.scene.add.circle(
          this.sprite.x, this.sprite.y + 10, 60, 0x9a6aaa, 0.3
        );
        
        // Damage in radius
        const dx = this.scene.knight.sprite.x - this.sprite.x;
        if (Math.abs(dx) < 70) {
          this.scene.knight.takeDamage(2);
        }
        
        setTimeout(() => wave.destroy(), 300);
      }
      
      this._isSlam = false;
    }, 600);
  }
}

// ══════════════════════════════════════════════════════════════════════════
// CRYSTAL PEAK ENEMIES
// ══════════════════════════════════════════════════════════════════════════

class CrystalCrawler extends Enemy {
  constructor(scene, x, y, data) {
    super(scene, x, y, 'crystal_crawler', {
      hp: 8,
      damage: 2,
      speed: 35,
      geo: 6,
      dir: data.dir || 1,
      ...data
    });
    
    this._canShoot = true;
  }
  
  update(dt, knight) {
    super.update(dt, knight);
    
    if (this.isDead) return;
    
    // Faster patrol
    this.sprite.setVelocityX(this.stats.dir * this.stats.speed);
    
    if (this.sprite.body.blocked.left) {
      this.stats.dir = 1;
      this._tryShootCrystal(knight);
    } else if (this.sprite.body.blocked.right) {
      this.stats.dir = -1;
      this._tryShootCrystal(knight);
    }
  }
  
  _tryShootCrystal(knight) {
    if (!this._canShoot) return;
    
    const dx = knight.sprite.x - this.sprite.x;
    const dy = knight.sprite.y - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 150) {
      this._canShoot = false;
      
      const shard = this.scene.add.rectangle(
        this.sprite.x, this.sprite.y - 5, 8, 3, 0xaae8ff
      );
      this.scene.physics.add.existing(shard);
      
      const angle = Math.atan2(dy, dx);
      shard.body.setVelocity(
        Math.cos(angle) * 150,
        Math.sin(angle) * 150
      );
      
      setTimeout(() => shard.destroy(), 1500);
      
      this.scene.physics.add.overlap(shard, knight.sprite, () => {
        knight.takeDamage(2);
        shard.destroy();
      });
      
      setTimeout(() => this._canShoot = true, 3000);
    }
  }
}

class CrystalGuardian extends Enemy {
  constructor(scene, x, y, data) {
    super(scene, x, y, 'crystal_guardian', {
      hp: 40,
      damage: 2,
      speed: 0,
      geo: 30,
      ...data
    });
    
    this._shootPattern = 0;
    this._shootTimer = 0;
  }
  
  update(dt, knight) {
    super.update(dt, knight);
    
    if (this.isDead) return;
    
    // Stationary turret
    this._shootTimer += dt * 1000;
    
    if (this._shootTimer >= 2000) {
      this._shootCrystalBurst(knight);
      this._shootTimer = 0;
      this._shootPattern = (this._shootPattern + 1) % 3;
    }
  }
  
  _shootCrystalBurst(knight) {
    const numShards = 5 + this._shootPattern * 2;
    
    for (let i = 0; i < numShards; i++) {
      const angle = (Math.PI * 2 / numShards) * i;
      
      const shard = this.scene.add.rectangle(
        this.sprite.x, this.sprite.y, 6, 6, 0xaae8ff
      );
      this.scene.physics.add.existing(shard);
      
      shard.body.setVelocity(
        Math.cos(angle) * 120,
        Math.sin(angle) * 120
      );
      
      setTimeout(() => shard.destroy(), 2000);
      
      this.scene.physics.add.overlap(shard, knight.sprite, () => {
        knight.takeDamage(2);
        shard.destroy();
      });
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════
// ANCIENT BASIN ENEMIES
// ══════════════════════════════════════════════════════════════════════════

class PaleLurker extends Enemy {
  constructor(scene, x, y, data) {
    super(scene, x, y, 'pale_lurker', {
      hp: 15,
      damage: 2,
      speed: 60,
      geo: 12,
      ...data
    });
    
    this._invisTimer = 0;
    this._isInvisible = false;
  }
  
  update(dt, knight) {
    super.update(dt, knight);
    
    if (this.isDead) return;
    
    const dx = knight.sprite.x - this.sprite.x;
    const dist = Math.abs(dx);
    
    this._invisTimer += dt * 1000;
    
    // Become invisible
    if (this._invisTimer >= 3000 && !this._isInvisible && dist > 100) {
      this._isInvisible = true;
      this.sprite.setAlpha(0.2);
      this._invisTimer = 0;
    }
    
    // Reappear when close
    if (this._isInvisible && dist < 50) {
      this._isInvisible = false;
      this.sprite.setAlpha(1);
      this._invisTimer = 0;
    }
    
    // Fast ambush movement
    if (dist < 200 && dist > 30) {
      const dir = Math.sign(dx);
      this.sprite.setVelocityX(dir * this.stats.speed);
    } else {
      this.sprite.setVelocityX(0);
    }
  }
}

class VoidTendrils extends Enemy {
  constructor(scene, x, y, data) {
    super(scene, x, y, 'void_tendrils', {
      hp: 20,
      damage: 3,
      speed: 0,
      geo: 15,
      ...data
    });
    
    this._grabTimer = 0;
    this._tendrils = [];
  }
  
  update(dt, knight) {
    super.update(dt, knight);
    
    if (this.isDead) return;
    
    this._grabTimer += dt * 1000;
    
    const dx = knight.sprite.x - this.sprite.x;
    const dy = knight.sprite.y - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Spawn grabbing tendrils
    if (this._grabTimer >= 4000 && dist < 150) {
      this._spawnTendril(knight);
      this._grabTimer = 0;
    }
  }
  
  _spawnTendril(knight) {
    const tendril = this.scene.add.line(
      0, 0,
      this.sprite.x, this.sprite.y,
      knight.sprite.x, knight.sprite.y - 10,
      0x3a3a5a
    );
    tendril.setLineWidth(3);
    tendril.setOrigin(0, 0);
    
    this._tendrils.push(tendril);
    
    // Hold player briefly
    knight.sprite.setVelocityX(0);
    knight.takeDamage(3);
    
    setTimeout(() => {
      tendril.destroy();
      const idx = this._tendrils.indexOf(tendril);
      if (idx >= 0) this._tendrils.splice(idx, 1);
    }, 1000);
  }
  
  destroy() {
    this._tendrils.forEach(t => t.destroy());
    super.destroy();
  }
}

// ══════════════════════════════════════════════════════════════════════════
// FOG CANYON ENEMIES
// ══════════════════════════════════════════════════════════════════════════

class Ooma extends Enemy {
  constructor(scene, x, y, data) {
    super(scene, x, y, 'ooma', {
      hp: 10,
      damage: 2,
      speed: 40,
      geo: 8,
      ...data
    });
    
    this._floatAngle = Math.random() * Math.PI * 2;
    this._explosionTimer = 0;
  }
  
  update(dt, knight) {
    super.update(dt, knight);
    
    if (this.isDead) return;
    
    // Floating movement
    this._floatAngle += dt * 2;
    const floatY = Math.sin(this._floatAngle) * 30;
    this.sprite.y = this.sprite.y - floatY * dt;
    
    const dx = knight.sprite.x - this.sprite.x;
    const dy = knight.sprite.y - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Move toward player
    if (dist < 200) {
      const angle = Math.atan2(dy, dx);
      this.sprite.setVelocity(
        Math.cos(angle) * this.stats.speed,
        Math.sin(angle) * this.stats.speed
      );
    }
    
    // Explode when close
    if (dist < 40) {
      this._explode(knight);
    }
  }
  
  _explode(knight) {
    const explosion = this.scene.add.circle(
      this.sprite.x, this.sprite.y, 50, 0xffa500, 0.5
    );
    
    const dx = knight.sprite.x - this.sprite.x;
    const dy = knight.sprite.y - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 60) {
      knight.takeDamage(3);
      const angle = Math.atan2(dy, dx);
      knight.sprite.setVelocity(
        Math.cos(angle) * 200,
        Math.sin(angle) * 200
      );
    }
    
    setTimeout(() => explosion.destroy(), 300);
    this.die();
  }
}

// ══════════════════════════════════════════════════════════════════════════
// QUEEN'S GARDENS ENEMIES
// ══════════════════════════════════════════════════════════════════════════

class MantisTraitor extends Enemy {
  constructor(scene, x, y, data) {
    super(scene, x, y, 'mantis_traitor', {
      hp: 30,
      damage: 3,
      speed: 80,
      geo: 22,
      ...data
    });
    
    this._dashTimer = 0;
    this._isDashing = false;
    this._comboCount = 0;
  }
  
  update(dt, knight) {
    super.update(dt, knight);
    
    if (this.isDead) return;
    
    const dx = knight.sprite.x - this.sprite.x;
    const dy = knight.sprite.y - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    this._dashTimer += dt * 1000;
    
    // Triple dash combo
    if (!this._isDashing && dist < 180 && this._dashTimer >= 1000) {
      this._performDash(dx, dy);
    }
    
    // Normal movement
    if (!this._isDashing && dist > 40 && dist < 200) {
      const dir = Math.sign(dx);
      this.sprite.setVelocityX(dir * 50);
    }
  }
  
  _performDash(dx, dy) {
    this._isDashing = true;
    
    const angle = Math.atan2(dy, dx);
    this.sprite.setVelocity(
      Math.cos(angle) * 250,
      Math.sin(angle) * 250
    );
    
    this._comboCount++;
    
    setTimeout(() => {
      this._isDashing = false;
      
      if (this._comboCount < 3) {
        this._dashTimer = 800; // Quick follow-up
      } else {
        this._comboCount = 0;
        this._dashTimer = 0;
      }
    }, 300);
  }
}

// ══════════════════════════════════════════════════════════════════════════
// SPRITE GENERATION
// ══════════════════════════════════════════════════════════════════════════

// Add to PreloadScene.js:
function _genEnemyVariants() {
  // Mosscreep
  const mossCanvas = this.textures.createCanvas('mosscreep', 16, 16);
  const mctx = mossCanvas.context;
  mctx.fillStyle = '#3a6a3a';
  mctx.fillRect(4, 8, 8, 6);
  mctx.fillStyle = '#2a5a2a';
  mctx.fillRect(6, 6, 4, 2);
  mctx.fillStyle = '#4a8a4a';
  mctx.fillRect(5, 9, 2, 4);
  mctx.fillRect(9, 9, 2, 4);
  mossCanvas.refresh();
  
  // Moss Knight
  const mkCanvas = this.textures.createCanvas('moss_knight', 24, 28);
  const mkctx = mkCanvas.context;
  mkctx.fillStyle = '#2a5a2a';
  mkctx.fillRect(6, 10, 12, 14);
  mkctx.fillStyle = '#3a7a3a';
  mkctx.fillRect(8, 6, 8, 8);
  mkctx.fillStyle = '#1a4a1a';
  mkctx.fillRect(9, 8, 2, 2);
  mkctx.fillRect(13, 8, 2, 2);
  mkCanvas.refresh();
  
  // Fungoon
  const fungCanvas = this.textures.createCanvas('fungoon', 20, 20);
  const fctx = fungCanvas.context;
  fctx.fillStyle = '#6a4a7a';
  fctx.beginPath();
  fctx.arc(10, 10, 8, 0, Math.PI * 2);
  fctx.fill();
  fctx.fillStyle = '#8a6a9a';
  fctx.beginPath();
  fctx.arc(8, 8, 3, 0, Math.PI * 2);
  fctx.fill();
  fungCanvas.refresh();
  
  // Shrumal Ogre
  const ogreCanvas = this.textures.createCanvas('shrumal_ogre', 32, 32);
  const octx = ogreCanvas.context;
  octx.fillStyle = '#5a3a6a';
  octx.fillRect(8, 12, 16, 16);
  octx.fillStyle = '#7a5a8a';
  octx.beginPath();
  octx.arc(16, 10, 10, 0, Math.PI);
  octx.fill();
  ogreCanvas.refresh();
  
  // Crystal Crawler
  const ccCanvas = this.textures.createCanvas('crystal_crawler', 18, 14);
  const ccctx = ccCanvas.context;
  ccctx.fillStyle = '#6a7a8a';
  ccctx.fillRect(5, 6, 8, 6);
  ccctx.fillStyle = '#aae8ff';
  ccctx.fillRect(6, 4, 2, 2);
  ccctx.fillRect(10, 4, 2, 2);
  ccCanvas.refresh();
  
  // Crystal Guardian
  const cgCanvas = this.textures.createCanvas('crystal_guardian', 28, 28);
  const cgctx = cgCanvas.context;
  cgctx.fillStyle = '#5a6a7a';
  cgctx.fillRect(8, 8, 12, 12);
  cgctx.fillStyle = '#aae8ff';
  cgctx.fillRect(6, 10, 4, 8);
  cgctx.fillRect(18, 10, 4, 8);
  cgCanvas.refresh();
  
  // Pale Lurker
  const plCanvas = this.textures.createCanvas('pale_lurker', 20, 22);
  const plctx = plCanvas.context;
  plctx.fillStyle = '#4a4a6a';
  plctx.fillRect(6, 8, 8, 10);
  plctx.fillStyle = '#e8e0d0';
  plctx.fillRect(7, 6, 6, 6);
  plCanvas.refresh();
  
  // Void Tendrils
  const vtCanvas = this.textures.createCanvas('void_tendrils', 24, 32);
  const vtctx = vtCanvas.context;
  vtctx.fillStyle = '#1a1a2a';
  vtctx.fillRect(8, 10, 8, 16);
  vtctx.strokeStyle = '#3a3a5a';
  vtctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    vtctx.beginPath();
    vtctx.moveTo(12 + i * 2, 26);
    vtctx.lineTo(12 + i * 2, 32);
    vtctx.stroke();
  }
  vtCanvas.refresh();
  
  // Ooma
  const oomaCanvas = this.textures.createCanvas('ooma', 18, 18);
  const oomactx = oomaCanvas.context;
  oomactx.fillStyle = '#8a9aaa';
  oomactx.beginPath();
  oomactx.arc(9, 9, 8, 0, Math.PI * 2);
  oomactx.fill();
  oomactx.fillStyle = 'rgba(255, 200, 100, 0.4)';
  oomactx.beginPath();
  oomactx.arc(9, 9, 6, 0, Math.PI * 2);
  oomactx.fill();
  oomaCanvas.refresh();
  
  // Mantis Traitor
  const mtCanvas = this.textures.createCanvas('mantis_traitor', 24, 32);
  const mtctx = mtCanvas.context;
  mtctx.fillStyle = '#3a5a3a';
  mtctx.fillRect(8, 10, 8, 16);
  mtctx.fillStyle = '#2a4a2a';
  mtctx.fillRect(6, 8, 12, 4);
  mtctx.fillStyle = '#ff6666';
  mtctx.fillRect(10, 12, 2, 2);
  mtctx.fillRect(12, 12, 2, 2);
  mtCanvas.refresh();
}

// ══════════════════════════════════════════════════════════════════════════
// INTEGRATION
// ══════════════════════════════════════════════════════════════════════════

/*
TO USE:
1. Add all enemy classes to your project
2. Add _genEnemyVariants() call in PreloadScene
3. Update room enemy definitions to use new types:

Example:
enemies: [
  { type: 'mosscreep', x: 100, y: 200, data: {} },
  { type: 'moss_knight', x: 300, y: 200, data: {} },
]

Each enemy has unique behaviors:
- Mosscreep: Hops toward player
- Moss Knight: Charges
- Fungoon: Shoots spores, patrols
- Shrumal Ogre: Slam attack with shockwave
- Crystal Crawler: Fast patrol, shoots crystals
- Crystal Guardian: Stationary turret, burst patterns
- Pale Lurker: Invisibility, ambush
- Void Tendrils: Grab attacks
- Ooma: Float and explode
- Mantis Traitor: Triple dash combo
*/
