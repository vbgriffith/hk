/* js/systems/QuestSystem.js — Session 9: NPCs, Quests, and Collectibles
 * 
 * Complete quest and collectible item system
 */
'use strict';

// ══════════════════════════════════════════════════════════════════════════
// QUEST SYSTEM
// ══════════════════════════════════════════════════════════════════════════

class QuestSystem {
  constructor(scene) {
    this.scene = scene;
    this.quests = {};
    this.completedQuests = [];
    
    this._initQuests();
  }
  
  _initQuests() {
    // Load from save or initialize
    const save = this.scene._save;
    if (save?.quests) {
      this.quests = save.quests;
      this.completedQuests = save.completedQuests || [];
    } else {
      this._defineQuests();
    }
  }
  
  _defineQuests() {
    this.quests = {
      // Elderbug's Request
      elderbug_map: {
        id: 'elderbug_map',
        name: "Elderbug's Map",
        giver: 'elderbug',
        description: 'Find Cornifer and purchase a map for Elderbug.',
        objectives: [
          { id: 'find_cornifer', text: 'Find Cornifer the cartographer', done: false },
          { id: 'buy_map', text: 'Purchase a map', done: false },
          { id: 'return_elderbug', text: 'Return to Elderbug', done: false },
        ],
        rewards: { geo: 100, item: 'wanderers_journal' },
        active: false,
        completed: false,
      },
      
      // Sly's Lost Goods
      sly_shipment: {
        id: 'sly_shipment',
        name: "Sly's Lost Shipment",
        giver: 'sly',
        description: 'Find Sly\'s lost goods in Greenpath.',
        objectives: [
          { id: 'find_shipment', text: 'Search Greenpath for the shipment', done: false },
          { id: 'return_sly', text: 'Return to Sly in Dirtmouth', done: false },
        ],
        rewards: { geo: 200, item: 'shop_discount' },
        active: false,
        completed: false,
      },
      
      // Cloth's Courage
      cloth_warrior: {
        id: 'cloth_warrior',
        name: 'Warrior\'s Path',
        giver: 'cloth',
        description: 'Help Cloth prove herself in battle.',
        objectives: [
          { id: 'defeat_mantis_lords', text: 'Defeat the Mantis Lords', done: false },
          { id: 'visit_cloth', text: 'Speak with Cloth after victory', done: false },
        ],
        rewards: { geo: 300, charm: 'wayward_compass' },
        active: false,
        completed: false,
      },
      
      // Bretta's Rescue
      bretta_rescue: {
        id: 'bretta_rescue',
        name: 'Lost in the Dark',
        giver: 'auto', // Auto-starts when found
        description: 'Rescue Bretta from Fungal Wastes.',
        objectives: [
          { id: 'find_bretta', text: 'Find the lost bug', done: false },
          { id: 'escort_safe', text: 'Guide her to safety', done: false },
        ],
        rewards: { geo: 150 },
        active: false,
        completed: false,
      },
      
      // Myla's Song
      myla_crystals: {
        id: 'myla_crystals',
        name: 'The Miner\'s Song',
        giver: 'myla',
        description: 'Listen to Myla\'s song as she mines.',
        objectives: [
          { id: 'visit_1', text: 'Visit Myla in Crystal Peak', done: false },
          { id: 'visit_2', text: 'Return after obtaining Dream Nail', done: false },
        ],
        rewards: { item: 'precious_crystal' },
        active: false,
        completed: false,
      },
    };
  }
  
  startQuest(questId) {
    if (!this.quests[questId]) return false;
    
    this.quests[questId].active = true;
    this._showQuestNotification(`New Quest: ${this.quests[questId].name}`);
    return true;
  }
  
  updateObjective(questId, objectiveId) {
    const quest = this.quests[questId];
    if (!quest || !quest.active) return false;
    
    const obj = quest.objectives.find(o => o.id === objectiveId);
    if (!obj) return false;
    
    obj.done = true;
    this._showQuestNotification(`${obj.text} ✓`);
    
    // Check if quest complete
    if (quest.objectives.every(o => o.done)) {
      this.completeQuest(questId);
    }
    
    return true;
  }
  
  completeQuest(questId) {
    const quest = this.quests[questId];
    if (!quest) return;
    
    quest.completed = true;
    quest.active = false;
    this.completedQuests.push(questId);
    
    // Give rewards
    if (quest.rewards.geo) {
      this.scene.knight.geo += quest.rewards.geo;
    }
    if (quest.rewards.item) {
      this._giveItem(quest.rewards.item);
    }
    if (quest.rewards.charm) {
      this._giveCharm(quest.rewards.charm);
    }
    
    this._showQuestNotification(`Quest Complete: ${quest.name}!`, 3000);
  }
  
  _giveItem(itemId) {
    if (!this.scene.knight.inventory) {
      this.scene.knight.inventory = [];
    }
    this.scene.knight.inventory.push(itemId);
  }
  
  _giveCharm(charmId) {
    if (!this.scene.knight.charms) {
      this.scene.knight.charms = [];
    }
    this.scene.knight.charms.push(charmId);
  }
  
  _showQuestNotification(text, duration = 2000) {
    const notif = this.scene.add.text(
      C.WIDTH / 2, 30, text,
      {
        fontFamily: 'Cinzel',
        fontSize: 8,
        color: '#e8c84a',
        backgroundColor: '#1a1a2aaa',
        padding: { x: 8, y: 4 },
      }
    ).setScrollFactor(0).setDepth(C.LAYER_UI + 10).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: notif,
      alpha: 0,
      y: 20,
      duration: duration,
      ease: 'Sine.easeIn',
      onComplete: () => notif.destroy(),
    });
  }
  
  getActiveQuests() {
    return Object.values(this.quests).filter(q => q.active);
  }
  
  saveState() {
    return {
      quests: this.quests,
      completedQuests: this.completedQuests,
    };
  }
}

// ══════════════════════════════════════════════════════════════════════════
// COLLECTIBLE ITEMS
// ══════════════════════════════════════════════════════════════════════════

const COLLECTIBLES = {
  // Wanderer's Journals (16 total)
  journal_greenpath: {
    id: 'journal_greenpath',
    name: "Greenpath Journal",
    description: "A page describing the lush overgrowth.",
    type: 'journal',
    room: 'greenpath_lake',
    position: { x: 240, y: 180 },
  },
  
  journal_fungal: {
    id: 'journal_fungal',
    name: "Fungal Wastes Journal",
    description: "Notes on the spreading infection.",
    type: 'journal',
    room: 'fungal_deep',
    position: { x: 380, y: 190 },
  },
  
  journal_city: {
    id: 'journal_city',
    name: "City Journal",
    description: "Tales of the great capital.",
    type: 'journal',
    room: 'city_east',
    position: { x: 520, y: 280 },
  },
  
  journal_basin: {
    id: 'journal_basin',
    name: "Basin Journal",
    description: "Dark secrets of the ancient kingdom.",
    type: 'journal',
    room: 'basin_west',
    position: { x: 140, y: 200 },
  },
  
  // Arcane Eggs (4 total - rare collectibles)
  arcane_egg_greenpath: {
    id: 'arcane_egg_greenpath',
    name: "Greenpath Egg",
    description: "An ancient egg pulsing with life.",
    type: 'arcane_egg',
    room: 'greenpath_main',
    position: { x: 180, y: 250 },
    sellValue: 1200,
  },
  
  arcane_egg_crystal: {
    id: 'arcane_egg_crystal',
    name: "Crystal Egg",
    description: "A crystallized egg, impossibly old.",
    type: 'arcane_egg',
    room: 'crystal_peak_main',
    position: { x: 240, y: 240 },
    sellValue: 1200,
  },
  
  // Hallownest Seals (17 total)
  seal_crossroads: {
    id: 'seal_crossroads',
    name: "Crossroads Seal",
    description: "An ancient seal of Hallownest.",
    type: 'seal',
    room: 'crossroads_chest',
    position: { x: 450, y: 280 },
    sellValue: 450,
  },
  
  seal_gardens: {
    id: 'seal_gardens',
    name: "Queen's Seal",
    description: "A royal seal from the White Palace.",
    type: 'seal',
    room: 'queens_gardens_main',
    position: { x: 300, y: 190 },
    sellValue: 450,
  },
  
  // King's Idols (8 total)
  idol_basin: {
    id: 'idol_basin',
    name: "King's Idol",
    description: "An idol depicting the Pale King.",
    type: 'idol',
    room: 'ancient_basin_entrance',
    position: { x: 380, y: 210 },
    sellValue: 800,
  },
  
  // Rancid Eggs (scattered, 21 total)
  rancid_egg_crossroads_1: {
    id: 'rancid_egg_crossroads_1',
    name: "Rancid Egg",
    description: "Smells of death. Jiji wants these.",
    type: 'rancid_egg',
    room: 'crossroads_below',
    position: { x: 320, y: 190 },
  },
  
  rancid_egg_greenpath_1: {
    id: 'rancid_egg_greenpath_1',
    name: "Rancid Egg",
    description: "Smells of death. Jiji wants these.",
    type: 'rancid_egg',
    room: 'greenpath_entrance',
    position: { x: 180, y: 280 },
  },
  
  // Pale Ore (6 total - rare, used for upgrades)
  pale_ore_crystal: {
    id: 'pale_ore_crystal',
    name: "Pale Ore",
    description: "Ancient ore, said to strengthen nails.",
    type: 'pale_ore',
    room: 'crystal_peak_main',
    position: { x: 360, y: 110 },
  },
  
  pale_ore_basin: {
    id: 'pale_ore_basin',
    name: "Pale Ore",
    description: "Ancient ore, said to strengthen nails.",
    type: 'pale_ore',
    room: 'basin_depths',
    position: { x: 240, y: 220 },
  },
  
  // Grubs (46 total - trapped throughout world)
  grub_greenpath_1: {
    id: 'grub_greenpath_1',
    name: "Grub",
    description: "A trapped grub. Free it!",
    type: 'grub',
    room: 'greenpath_main',
    position: { x: 480, y: 200 },
  },
  
  grub_fungal_1: {
    id: 'grub_fungal_1',
    name: "Grub",
    description: "A trapped grub. Free it!",
    type: 'grub',
    room: 'fungal_main',
    position: { x: 280, y: 140 },
  },
  
  grub_city_1: {
    id: 'grub_city_1',
    name: "Grub",
    description: "A trapped grub. Free it!",
    type: 'grub',
    room: 'city_main',
    position: { x: 380, y: 120 },
  },
  
  // Simple Keys (4 total - unlock special rooms)
  simple_key_city: {
    id: 'simple_key_city',
    name: "Simple Key",
    description: "Opens simple locks throughout Hallownest.",
    type: 'simple_key',
    room: 'city_east',
    position: { x: 420, y: 170 },
  },
  
  // Mask Shards (16 total - 4 = 1 mask)
  mask_shard_greenpath: {
    id: 'mask_shard_greenpath',
    name: "Mask Shard",
    description: "Sacred shell fragment. Collect 4 for a new mask.",
    type: 'mask_shard',
    room: 'greenpath_lake',
    position: { x: 140, y: 190 },
  },
  
  mask_shard_fog: {
    id: 'mask_shard_fog',
    name: "Mask Shard",
    description: "Sacred shell fragment. Collect 4 for a new mask.",
    type: 'mask_shard',
    room: 'fog_canyon_main',
    position: { x: 320, y: 210 },
  },
  
  // Vessel Fragments (9 total - 3 = 1 soul vessel upgrade)
  vessel_fragment_crossroads: {
    id: 'vessel_fragment_crossroads',
    name: "Vessel Fragment",
    description: "Soul vessel fragment. Collect 3 to expand soul.",
    type: 'vessel_fragment',
    room: 'crossroads_main',
    position: { x: 420, y: 120 },
  },
  
  vessel_fragment_crystal: {
    id: 'vessel_fragment_crystal',
    name: "Vessel Fragment",
    description: "Soul vessel fragment. Collect 3 to expand soul.",
    type: 'vessel_fragment',
    room: 'crystal_peak_entrance',
    position: { x: 200, y: 150 },
  },
};

// ══════════════════════════════════════════════════════════════════════════
// NEW NPCS
// ══════════════════════════════════════════════════════════════════════════

const NPC_DIALOGUE = {
  cornifer: {
    initial: [
      { speaker: 'Cornifer', text: 'Ho there! I\'m Cornifer, cartographer extraordinaire!' },
      { speaker: 'Cornifer', text: 'I map the winding passages of this kingdom. Would you like to purchase a map?' },
      { speaker: 'Cornifer', text: 'Maps are 100 geo each. Very useful for not getting lost!' },
    ],
    purchased: [
      { speaker: 'Cornifer', text: 'Excellent choice! This map should help you navigate.' },
      { speaker: 'Cornifer', text: 'I\'ll be heading to other areas soon. Perhaps we\'ll meet again!' },
    ],
    repeat: [
      { speaker: 'Cornifer', text: 'Humming a little tune...' },
      { speaker: 'Cornifer', text: 'Ah, hello again! I\'m still working on my maps here.' },
    ],
  },
  
  cloth: {
    initial: [
      { speaker: 'Cloth', text: 'Oh! You startled me. I\'m Cloth, a warrior in training.' },
      { speaker: 'Cloth', text: 'I came to Hallownest seeking challenges to prove myself.' },
      { speaker: 'Cloth', text: 'These Mantis warriors... they\'re so skilled. I need to be stronger!' },
    ],
    quest_active: [
      { speaker: 'Cloth', text: 'Have you faced the Mantis Lords yet?' },
      { speaker: 'Cloth', text: 'I heard they test any warrior who dares challenge them.' },
      { speaker: 'Cloth', text: 'Maybe... if you defeat them, I\'ll find the courage to train harder.' },
    ],
    quest_complete: [
      { speaker: 'Cloth', text: 'You actually defeated them! The Mantis Lords!' },
      { speaker: 'Cloth', text: 'You\'ve inspired me. I won\'t give up on becoming a true warrior!' },
      { speaker: 'Cloth', text: 'Thank you, friend. Take this charm - you\'ve earned it.' },
    ],
  },
  
  myla: {
    visit_1: [
      { speaker: 'Myla', text: '♪ Bury my mother, pale and slight... ♪' },
      { speaker: 'Myla', text: 'Oh! Hello there! I didn\'t hear you approach.' },
      { speaker: 'Myla', text: 'I\'m mining for crystals. They\'re so beautiful when the light hits them!' },
      { speaker: 'Myla', text: '♪ Bury my father with his eyes shut tight... ♪' },
    ],
    visit_2: [
      { speaker: 'Myla', text: '♪ ...mine... dig... crystals... ♪' },
      { speaker: 'Myla', text: '...' },
      { speaker: '', text: 'Myla doesn\'t seem to recognize you. Her eyes glow orange...' },
    ],
  },
  
  bretta: {
    rescue: [
      { speaker: '', text: 'You find a small bug cowering in the darkness.' },
      { speaker: 'Bretta', text: 'P-please... don\'t hurt me...' },
      { speaker: 'Bretta', text: 'Wait... you\'re not one of those creatures!' },
      { speaker: 'Bretta', text: 'Thank you for finding me! I got so lost down here...' },
    ],
    dirtmouth: [
      { speaker: 'Bretta', text: 'I made it back safely thanks to you!' },
      { speaker: 'Bretta', text: 'You were so brave out there. Like a knight from the old stories!' },
      { speaker: 'Bretta', text: 'I\'ll be staying here in Dirtmouth now. Much safer!' },
    ],
  },
  
  quirrel_lake: {
    encounter: [
      { speaker: 'Quirrel', text: 'The Blue Lake... I feel I\'ve been here before.' },
      { speaker: 'Quirrel', text: 'Strange how this place feels both foreign and familiar.' },
      { speaker: 'Quirrel', text: 'Are you exploring these ruins too? Be careful, friend.' },
    ],
  },
  
  tiso: {
    first_meet: [
      { speaker: 'Tiso', text: 'Out of my way, small bug.' },
      { speaker: 'Tiso', text: 'I\'m heading to the Colosseum of Fools.' },
      { speaker: 'Tiso', text: 'Going to show everyone what a real warrior looks like.' },
    ],
  },
  
  grubfather: {
    no_grubs: [
      { speaker: 'Grubfather', text: '*sad muffled sounds*' },
      { speaker: 'Grubfather', text: 'My children... scattered throughout the kingdom...' },
      { speaker: 'Grubfather', text: 'If you find any, please free them and send them home!' },
    ],
    some_grubs: [
      { speaker: 'Grubfather', text: '*happy muffled sounds*' },
      { speaker: 'Grubfather', text: 'Thank you for rescuing my grubs!' },
      { speaker: 'Grubfather', text: 'Here, take this reward. Please find the others!' },
    ],
  },
};

// ══════════════════════════════════════════════════════════════════════════
// COLLECTIBLE SPAWNING
// ══════════════════════════════════════════════════════════════════════════

class CollectibleManager {
  constructor(scene) {
    this.scene = scene;
    this.collected = [];
    
    // Load from save
    if (scene._save?.collectibles) {
      this.collected = scene._save.collectibles;
    }
  }
  
  spawnCollectibles(roomKey) {
    const roomCollectibles = Object.values(COLLECTIBLES).filter(
      c => c.room === roomKey && !this.collected.includes(c.id)
    );
    
    roomCollectibles.forEach(item => {
      this._spawnCollectible(item);
    });
  }
  
  _spawnCollectible(item) {
    const sprite = this.scene.add.sprite(
      item.position.x, item.position.y, 
      this._getSpriteKey(item.type)
    );
    sprite.setScale(1.5);
    
    // Add glow effect
    const glow = this.scene.add.circle(
      item.position.x, item.position.y, 20,
      this._getGlowColor(item.type), 0.2
    );
    
    // Bob animation
    this.scene.tweens.add({
      targets: [sprite, glow],
      y: item.position.y - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    // Collect on overlap
    const zone = this.scene.physics.add.staticImage(
      item.position.x, item.position.y, '__DEFAULT'
    );
    zone.setSize(30, 30);
    
    this.scene.physics.add.overlap(
      this.scene.knight.sprite, zone,
      () => this._collectItem(item, sprite, glow, zone)
    );
  }
  
  _collectItem(item, sprite, glow, zone) {
    if (this.collected.includes(item.id)) return;
    
    this.collected.push(item.id);
    
    // Show notification
    this._showCollectNotification(item);
    
    // Apply effect
    this._applyItemEffect(item);
    
    // Cleanup
    sprite.destroy();
    glow.destroy();
    zone.destroy();
    
    // Play sound
    this.scene._audio?.playSfx('sfx_item_get');
  }
  
  _applyItemEffect(item) {
    const knight = this.scene.knight;
    
    switch(item.type) {
      case 'mask_shard':
        if (!knight.maskShards) knight.maskShards = 0;
        knight.maskShards++;
        if (knight.maskShards >= 4) {
          knight.masksMax++;
          knight.masks = knight.masksMax;
          knight.maskShards = 0;
          this._showNotification('New Mask!', '#e8e0d0');
        }
        break;
        
      case 'vessel_fragment':
        if (!knight.vesselFragments) knight.vesselFragments = 0;
        knight.vesselFragments++;
        if (knight.vesselFragments >= 3) {
          C.SOUL_MAX += 33;
          knight.vesselFragments = 0;
          this._showNotification('Soul Vessel Expanded!', '#5ae3e3');
        }
        break;
        
      case 'pale_ore':
        if (!knight.paleOre) knight.paleOre = 0;
        knight.paleOre++;
        break;
        
      case 'grub':
        if (!knight.grubsRescued) knight.grubsRescued = 0;
        knight.grubsRescued++;
        break;
        
      case 'rancid_egg':
        if (!knight.rancidEggs) knight.rancidEggs = 0;
        knight.rancidEggs++;
        break;
        
      default:
        // Store in inventory
        if (!knight.inventory) knight.inventory = [];
        knight.inventory.push(item.id);
    }
  }
  
  _getSpriteKey(type) {
    const map = {
      journal: 'collectible_journal',
      arcane_egg: 'collectible_egg',
      seal: 'collectible_seal',
      idol: 'collectible_idol',
      rancid_egg: 'collectible_rancid',
      pale_ore: 'collectible_ore',
      grub: 'collectible_grub',
      simple_key: 'collectible_key',
      mask_shard: 'collectible_mask',
      vessel_fragment: 'collectible_vessel',
    };
    return map[type] || 'particle';
  }
  
  _getGlowColor(type) {
    const map = {
      journal: 0xd4cfc9,
      arcane_egg: 0xe8c84a,
      seal: 0x5ae3e3,
      idol: 0xffd700,
      rancid_egg: 0x6a4a3a,
      pale_ore: 0xe8e4dc,
      grub: 0x88ff88,
      simple_key: 0xcccccc,
      mask_shard: 0xe8e0d0,
      vessel_fragment: 0x5ae3e3,
    };
    return map[type] || 0xffffff;
  }
  
  _showCollectNotification(item) {
    const notif = this.scene.add.text(
      C.WIDTH / 2, C.HEIGHT - 60,
      `${item.name} collected!`,
      {
        fontFamily: 'Cinzel',
        fontSize: 9,
        color: '#e8c84a',
        backgroundColor: '#1a1a2aaa',
        padding: { x: 10, y: 6 },
      }
    ).setScrollFactor(0).setDepth(C.LAYER_UI + 10).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: notif,
      alpha: 0,
      y: C.HEIGHT - 70,
      duration: 2500,
      ease: 'Sine.easeIn',
      onComplete: () => notif.destroy(),
    });
  }
  
  _showNotification(text, color) {
    const notif = this.scene.add.text(
      C.WIDTH / 2, C.HEIGHT / 2,
      text,
      {
        fontFamily: 'Cinzel',
        fontSize: 14,
        color: color,
        stroke: '#000',
        strokeThickness: 3,
      }
    ).setScrollFactor(0).setDepth(C.LAYER_UI + 10).setOrigin(0.5);
    
    this.scene.tweens.add({
      targets: notif,
      scale: 1.2,
      duration: 300,
      yoyo: true,
    });
    
    this.scene.tweens.add({
      targets: notif,
      alpha: 0,
      delay: 1000,
      duration: 1000,
      onComplete: () => notif.destroy(),
    });
  }
  
  saveState() {
    return this.collected;
  }
}

// ══════════════════════════════════════════════════════════════════════════
// INTEGRATION
// ══════════════════════════════════════════════════════════════════════════

/*
TO INTEGRATE:

1. Add QuestSystem to GameScene:
   this._questSystem = new QuestSystem(this);

2. Add CollectibleManager to GameScene:
   this._collectibles = new CollectibleManager(this);

3. In _buildRoom(), spawn collectibles:
   this._collectibles.spawnCollectibles(roomData.key);

4. Update save system to include:
   - quest states
   - collected items
   - grub count
   - inventory

5. Add NPC dialogue to DIALOGUE object in dialogueData.js

6. Generate collectible sprites in PreloadScene
*/
