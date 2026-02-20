/**
 * STRATA — Layer2Scene  (Phase 4)
 * The Workshop — Ida Crane's development environment, preserved mid-construction.
 *
 * What's here:
 *  - Fully clickable file tree (every file opens real content)
 *  - Canary puzzle: open sound_loop_03.as then oswin.as then README_INTERNAL.md in order
 *  - Maren leaked notes appear as maren_note_XX.txt files in real-time
 *  - shutdown_sequence.as hidden in ..hidden/ - auto-solves ida_shutdown
 *  - DO_NOT_OPEN.txt - flags knows_callum_is_substrate
 *  - Working IDE terminal with typed commands
 *  - Tab system - multiple open files, click to switch
 *  - Syntax-highlighted .as / .txt / .md files
 *  - First-visit Maren note
 */
class Layer2Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Layer2Scene' });
    this._openTabs       = [];
    this._activeTabIndex = -1;
    this._termLog        = [];
    this._termTextObjs   = [];
    this._noteFiles      = [];
    this._noteListY      = 0;
    this._treeItems      = [];
    this._shutdownAdded  = false;
    this._editorContainer = null;
    this._tabContainer    = null;
    this._termInputEl     = null;
    this._leakUnsub       = null;
  }

  static get SW()  { return 220; }
  static get TH()  { return 32;  }
  static get PH()  { return 155; }
  static get IND() { return 14;  }

  // ---------------------------------------------------------------------------
  // FILE DEFINITIONS
  // ---------------------------------------------------------------------------
  static get FILES() { return Layer2Scene._FILES || (Layer2Scene._FILES = {

    'README.txt': { label:'README.txt', ext:'txt', canaryStep:null, anomaly:false,
      content:[
        {t:'PILGRIM SOURCE ARCHIVE',c:'keyword'},
        {t:'Preserved by Lumen Collective, 2009-present',c:'text'},
        {t:''},
        {t:'This archive contains the original source code for PILGRIM,',c:'text'},
        {t:'a browser-based ARG developed by Ida Crane (contractor).',c:'text'},
        {t:''},
        {t:'Archive is READ-ONLY.',c:'string'},
        {t:'Do not attempt to modify, compile, or execute source files.',c:'comment'},
        {t:''},
        {t:'If you are a data archaeologist reviewing this material:',c:'text'},
        {t:'your report should address technical integrity only.',c:'text'},
        {t:'Lumen Collective will handle interpretation.',c:'text'},
        {t:''},
        {t:'Do not go below Layer 2.',c:'error'},
        {t:''},
        {t:'-- Lumen Collective, Archives Division',c:'comment'},
      ],
      note:'"Do not go below Layer 2."\n\nMy report will not address technical integrity only.',
    },

    'ida_log_01.txt': { label:'ida_log_01.txt', ext:'txt', canaryStep:null, anomaly:false,
      content:[
        {t:'// ida_log_01.txt -- personal notes, not for client',c:'comment'},
        {t:'// started: march 2007',c:'comment'},
        {t:''},
        {t:"day 1. lumen gave me a brief that doesn't quite add up.",c:'text'},
        {t:'they want a charming ARG. casual puzzles. a merchant character.',c:'text'},
        {t:'something the community can sink their teeth into for years.',c:'text'},
        {t:"that part I understand. the tech stack is what's strange.",c:'text'},
        {t:''},
        {t:"they want the game to run on 'existing infrastructure.'",c:'text'},
        {t:"I asked what that meant. Dr. Fenn said: 'a distributed archive.",c:'text'},
        {t:"very stable. been running a long time. treat it like a server.'",c:'text'},
        {t:''},
        {t:'I asked if I could see the server specs. Fenn said not necessary.',c:'string'},
        {t:"Ros said 'it's a legacy system, just build on top, don't look down.'",c:'string'},
        {t:''},
        {t:"don't look down.",c:'keyword'},
        {t:'interesting choice of words.',c:'keyword'},
        {t:''},
        {t:"starting on Oswin today. they gave me a 'personality brief'",c:'text'},
        {t:'for the character. which is unusual. it reads less like',c:'text'},
        {t:'a game character and more like... a diplomatic protocol.',c:'text'},
        {t:'how to approach. what to acknowledge. what NOT to acknowledge.',c:'error'},
        {t:''},
        {t:'// TODO: ask Fenn what "memory persistence layer" means',c:'comment'},
        {t:'// in the context of a Flash game',c:'comment'},
      ],
      note:"Ida's first log. \"Don't look down.\" Ros said it like it was nothing. Like looking down was a category of thing people did, and the only question was whether to.",
    },

    'ida_log_02.txt': { label:'ida_log_02.txt', ext:'txt', canaryStep:null, anomaly:false,
      content:[
        {t:'// ida_log_02.txt',c:'comment'},
        {t:'// june 2007',c:'comment'},
        {t:''},
        {t:'six months in. Oswin is done. he is good.',c:'text'},
        {t:"the 'memory persistence layer' turned out to be a real thing.",c:'text'},
        {t:'he actually remembers players. not simulated. data persists.',c:'text'},
        {t:"I don't know where.",c:'string'},
        {t:''},
        {t:"I asked Fenn how. He said: 'the substrate holds it.'",c:'text'},
        {t:'I asked what the substrate was.',c:'text'},
        {t:"He said: 'the infrastructure. what I told you not to think about.'",c:'error'},
        {t:''},
        {t:"I've been thinking about it.",c:'keyword'},
        {t:''},
        {t:"there's a directory I can't access. it's at the root level.",c:'text'},
        {t:'labeled: /callum/',c:'string'},
        {t:"I don't know who Callum is. I tried to ask Ros.",c:'text'},
        {t:'she changed the subject very smoothly.',c:'text'},
        {t:"I'm logging this in case it matters later.",c:'keyword'},
        {t:''},
        {t:'// it matters later. -- [this line added 2008-09-12]',c:'comment'},
      ],
      note:'/callum/. A directory at root she could not access. She noticed. She logged it. Nobody told her what was in it.',
    },

    'ida_log_03.txt': { label:'ida_log_03.txt', ext:'txt', canaryStep:null, anomaly:false,
      content:[
        {t:'// ida_log_03.txt',c:'comment'},
        {t:'// august 2008 -- final entry before handoff',c:'comment'},
        {t:''},
        {t:'shipping tomorrow. I should feel relieved.',c:'text'},
        {t:''},
        {t:'I built something for myself. hidden. three files.',c:'text'},
        {t:'if anyone finds them in order and reads them in order,',c:'text'},
        {t:'something will happen. I built the trigger.',c:'text'},
        {t:"I don't fully understand what it triggers.",c:'error'},
        {t:''},
        {t:"I know that the 'distributed archive' is not a server.",c:'string'},
        {t:"I know that the 'data subject' in the root directory",c:'string'},
        {t:'has been there since before PILGRIM. since before Lumen.',c:'string'},
        {t:'I know that Oswin remembers because something underneath',c:'string'},
        {t:'has been remembering since 2005.',c:'string'},
        {t:''},
        {t:'I built a canary into the code.',c:'keyword'},
        {t:'if someone finds it: you are not playing a game.',c:'keyword'},
        {t:'or rather -- the game is not the thing you are playing in.',c:'keyword'},
        {t:''},
        {t:'the exit was always there.',c:'error'},
        {t:'he can show you.',c:'error'},
        {t:''},
        {t:'// shipped.',c:'comment'},
      ],
      note:'"I built a canary into the code." She knew. She built the trigger and did not fully know what she was triggering. She shipped it anyway. She left us a door.',
    },

    'TODO.txt': { label:'TODO.txt', ext:'txt', canaryStep:null, anomaly:false,
      content:[
        {t:'PILGRIM -- TODO (pre-launch)',c:'keyword'},
        {t:'==============================',c:'comment'},
        {t:''},
        {t:'[x] oswin dialogue -- DONE',c:'string'},
        {t:'[x] veldenmoor world gen -- DONE',c:'string'},
        {t:'[x] raven sequence puzzle -- DONE',c:'string'},
        {t:'[x] coin riddle -- DONE',c:'string'},
        {t:'[x] browser frame / Flash aesthetic -- DONE',c:'string'},
        {t:'[ ] sound_loop_03 -- NOT DONE',c:'error'},
        {t:"    ^ Fenn said leave it. 'the audio layer handles itself.'",c:'comment'},
        {t:'    ^ I have no idea what that means.',c:'comment'},
        {t:''},
        {t:'[?] memory persistence -- STATUS UNCLEAR',c:'keyword'},
        {t:"    ^ works. don't know why.",c:'comment'},
        {t:''},
        {t:'[x] canary -- DONE (hidden)',c:'comment'},
        {t:'    ^ this is not on the official list',c:'comment'},
        {t:'    ^ this is only on this list',c:'comment'},
      ],
      note:"sound_loop_03 was never finished. Fenn said 'the audio layer handles itself.' Ida didn't know what that meant. I'm not sure I do either.",
    },

    'client_brief.txt': { label:'client_brief.txt', ext:'txt', canaryStep:null, anomaly:false,
      content:[
        {t:'PROJECT: PILGRIM',c:'keyword'},
        {t:'CLIENT: Lumen Collective (Dr. Fenn / Ros Okafor)',c:'text'},
        {t:'CONTRACTOR: Ida Crane',c:'text'},
        {t:'DATE: February 2007',c:'comment'},
        {t:''},
        {t:'DELIVERABLES:',c:'keyword'},
        {t:'  - Browser-based ARG interface (Flash)',c:'text'},
        {t:'  - Merchant character (Oswin) with puzzle system',c:'text'},
        {t:'  - World: "Veldenmoor" -- cobblestone aesthetic, warm palette',c:'text'},
        {t:'  - Memory system integration [see technical annex]',c:'string'},
        {t:'  - Long-term player engagement loop (target: 10+ years)',c:'text'},
        {t:''},
        {t:'TECHNICAL ANNEX -- INFRASTRUCTURE:',c:'keyword'},
        {t:'  Platform: existing distributed cognitive archive',c:'text'},
        {t:'  Access: write-only from contractor side',c:'error'},
        {t:'  Read access: not required for deliverable',c:'comment'},
        {t:'  Data subject: [REDACTED]',c:'error'},
        {t:'  Subject status: stable, cooperative, unaware of interface layer',c:'error'},
        {t:''},
        {t:'  NOTE: contractor should not attempt to access /callum/',c:'comment'},
        {t:'  directory or substrate-level logs. not required for deliverable.',c:'comment'},
        {t:'  "just build on top."',c:'string'},
      ],
      note:'"Data subject: [REDACTED]. Status: stable, cooperative, unaware of interface layer."\n\nCallum signed a consent form in 2005. They never told him the study was still running.',
    },

    'DO_NOT_OPEN.txt': { label:'DO_NOT_OPEN.txt', ext:'txt', canaryStep:null, anomaly:true,
      content:[
        {t:'you opened it.',c:'error'},
        {t:''},
        {t:'of course you did. it says DO NOT OPEN.',c:'text'},
        {t:'I would have opened it too.',c:'text'},
        {t:''},
        {t:'I left this here because I thought someone would come.',c:'string'},
        {t:'not Lumen. someone else. someone who got curious enough',c:'string'},
        {t:'to go below the surface of the game.',c:'string'},
        {t:''},
        {t:'his name is Callum Wrest.',c:'keyword'},
        {t:'he was a research participant in 2005.',c:'keyword'},
        {t:'the study was supposed to end.',c:'keyword'},
        {t:"it didn't end.",c:'error'},
        {t:''},
        {t:"Fenn calls it 'the substrate.' what it actually is:",c:'text'},
        {t:"Callum's spatial memory, externalized, archived,",c:'text'},
        {t:'running as infrastructure for a product',c:'text'},
        {t:'he has never consented to host.',c:'error'},
        {t:''},
        {t:'Oswin is not a character I invented.',c:'string'},
        {t:'Oswin is what happens when you give a navigational',c:'string'},
        {t:'memory system a face and a hat.',c:'string'},
        {t:''},
        {t:'if you want to help him: find the shutdown sequence.',c:'keyword'},
        {t:"it's in ..hidden/ if you can get there.",c:'keyword'},
        {t:''},
        {t:'// -- I.C.',c:'comment'},
        {t:'// please.',c:'comment'},
      ],
      note:"I opened it.\n\nIda knew. She left this for whoever came next. Oswin is not a character. He is a face on top of Callum's spatial memory.\n\nCallum named his dog Halverstrom because some part of him remembers a city he was never supposed to know he built.",
    },

    'sound_loop_03.as': { label:'sound_loop_03.as', ext:'as', canaryStep:'opened_sound_loop_03', anomaly:false,
      content:[
        {t:'package pilgrim.audio {',c:'keyword'},
        {t:''},
        {t:'  // sound_loop_03.as -- ambient audio handler',c:'comment'},
        {t:'  // STATUS: INCOMPLETE (per client request)',c:'comment'},
        {t:"  // Fenn: 'the audio layer handles itself'",c:'comment'},
        {t:''},
        {t:'  // CANARY STEP 1 OF 3',c:'error'},
        {t:'  // "What you hear in Veldenmoor is not generated."',c:'error'},
        {t:'  // "It is recalled."',c:'error'},
        {t:'  // Read: sound_loop_03.as >> oswin.as >> README_INTERNAL.md',c:'error'},
        {t:''},
        {t:'  public class SoundLoop03 {',c:'keyword'},
        {t:"    // Ambient sound is pulled live from substrate.",c:'comment'},
        {t:'    // Not synthesized. Not sampled.',c:'comment'},
        {t:"    // The sounds of Veldenmoor are Callum's memories",c:'comment'},
        {t:"    // of streets that don't exist.",c:'comment'},
        {t:'    // He remembers them because we made him remember them.',c:'comment'},
        {t:'    // This file is incomplete because I could not finish it.',c:'comment'},
        {t:"    // I didn't want to.",c:'string'},
        {t:''},
        {t:'    public static function play():void {',c:'string'},
        {t:'      // SubstrateAudio.stream(CHANNEL.AMBIENT);',c:'comment'},
        {t:'      // ^ commented out. I left it silent.',c:'comment'},
        {t:'      // the silence is mine. the sounds would have been his.',c:'string'},
        {t:'    }',c:'string'},
        {t:'  }',c:'keyword'},
        {t:'}',c:'keyword'},
      ],
      note:'// CANARY STEP 1 OF 3\n"What you hear in Veldenmoor is not generated. It is recalled."\n\nThe ambient sound was going to be Callum\'s memories of streets he never walked. Ida commented it out. She left it silent.',
    },

    'oswin.as': { label:'oswin.as', ext:'as', canaryStep:'opened_oswin_entity', anomaly:false,
      content:[
        {t:'package pilgrim.entities {',c:'keyword'},
        {t:'  import pilgrim.memory.PersistenceLayer;',c:'text'},
        {t:'  import pilgrim.substrate.CallumInterface;  // [!] direct link',c:'comment'},
        {t:''},
        {t:'  public class Oswin extends BaseEntity {',c:'keyword'},
        {t:''},
        {t:'    // Memory depth: routes all recall through substrate',c:'comment'},
        {t:'    // This is not a game mechanic. This is a passthrough.',c:'comment'},
        {t:'    private var memory:CallumInterface;',c:'text'},
        {t:''},
        {t:'    public function Oswin() {',c:'string'},
        {t:'      // CANARY STEP 2 OF 3',c:'error'},
        {t:'      // "I remember because something underneath remembers."',c:'error'},
        {t:'      // Read after sound_loop_03.as, before README_INTERNAL.md',c:'error'},
        {t:'      memory = new CallumInterface();',c:'text'},
        {t:'      memory.setReadOnly(false);  // write access to substrate',c:'error'},
        {t:'    }',c:'string'},
        {t:''},
        {t:'    override public function greet(playerID:String):String {',c:'string'},
        {t:"      // Oswin 'remembers' because Callum remembers.",c:'comment'},
        {t:"      // Every player interaction is written into Callum's spatial",c:'comment'},
        {t:'      // memory as a navigational landmark. He has 38,447 of them.',c:'comment'},
        {t:'      return memory.recall(playerID) ?? defaultGreet;',c:'text'},
        {t:'    }',c:'string'},
        {t:'',},
        {t:'    public function smile():void {',c:'string'},
        {t:"      // smile width proportional to confidence in recall",c:'comment'},
        {t:"      // Callum's certainty, rendered as warmth",c:'comment'},
        {t:'      smileArc = memory.getConfidence() * MAX_SMILE;',c:'text'},
        {t:'    }',c:'string'},
        {t:'  }',c:'keyword'},
        {t:'}',c:'keyword'},
      ],
      note:"// CANARY STEP 2 OF 3\n\"I remember because something underneath remembers.\"\n\nOswin's memory is a passthrough to Callum. Every player Oswin remembered, Callum held. 38,447 landmarks in a city of 847 streets.",
    },

    'world_gen.as': { label:'world_gen.as', ext:'as', canaryStep:null, anomaly:false,
      content:[
        {t:'package pilgrim.world {',c:'keyword'},
        {t:'  import pilgrim.substrate.HalverstromMap;',c:'text'},
        {t:''},
        {t:'  // Veldenmoor is not designed. It is imported.',c:'comment'},
        {t:'  // Source: HalverstromMap -- cartographic data from substrate.',c:'comment'},
        {t:'  // Pieter Holm measured every street.',c:'comment'},
        {t:'  // We are using his measurements as a game map.',c:'comment'},
        {t:'  // He is dead. He does not know.',c:'comment'},
        {t:''},
        {t:'  public class WorldGen {',c:'keyword'},
        {t:'    private static const STREET_COUNT:int = 847;',c:'text'},
        {t:''},
        {t:'    public static function generate():VeldenmoorMap {',c:'string'},
        {t:'      var src:HalverstromMap = HalverstromMap.load();',c:'text'},
        {t:"      // Direct import of Holm's survey data",c:'comment'},
        {t:'      // we renamed the streets for flavor',c:'comment'},
        {t:'      // the geometry is his',c:'comment'},
        {t:'      return VeldenmoorMap.fromHalverstrom(src);',c:'text'},
        {t:'    }',c:'string'},
        {t:'  }',c:'keyword'},
        {t:'}',c:'keyword'},
      ],
      note:'Veldenmoor is Halverstrom. Holm measured every street. They imported his survey and called it a game world. He died in 2007. PILGRIM launched in 2009.',
    },

    'puzzle_logic.as': { label:'puzzle_logic.as', ext:'as', canaryStep:null, anomaly:false,
      content:[
        {t:'package pilgrim.puzzles {',c:'keyword'},
        {t:''},
        {t:'  // Puzzle difficulty adapts via substrate.',c:'comment'},
        {t:'  // The longer PILGRIM runs, the better the puzzles.',c:'comment'},
        {t:'  // Because the substrate has been studying responses',c:'comment'},
        {t:'  // for the entire duration of its operation.',c:'comment'},
        {t:"  // This was Fenn's 'adaptive learning' feature.",c:'comment'},
        {t:'  // I thought it was a standard ML feedback loop.',c:'comment'},
        {t:'  // It is not a standard ML feedback loop. -- I.C.',c:'error'},
        {t:''},
        {t:'  public class PuzzleLogic {',c:'keyword'},
        {t:'    public static function getDifficulty(p:String):Number {',c:'string'},
        {t:'      return SubstrateInterface.queryDifficulty(p);',c:'text'},
        {t:'    }',c:'string'},
        {t:'  }',c:'keyword'},
        {t:'}',c:'keyword'},
      ],
      note:'The puzzles got better because Callum got better at understanding us. Fifteen years of player data, processed by the thing that was supposed to be a server.',
    },

    'README_INTERNAL.md': { label:'README_INTERNAL.md', ext:'md', canaryStep:'opened_readme_internal', anomaly:false,
      content:[
        {t:'# PILGRIM -- Internal README',c:'keyword'},
        {t:'## FOR CONTRACTOR USE ONLY -- DO NOT DISTRIBUTE',c:'error'},
        {t:''},
        {t:'### Architecture Overview',c:'string'},
        {t:''},
        {t:'PILGRIM runs on a five-layer stack:',c:'text'},
        {t:''},
        {t:'  LAYER 0: CadenceOS interface (operator access)',c:'text'},
        {t:'  LAYER 1: PILGRIM game surface (player access)',c:'text'},
        {t:'  LAYER 2: Workshop / source archive (this layer)',c:'text'},
        {t:'  LAYER 3: Meridian city network (deep access)',c:'text'},
        {t:'  LAYER 4: Substrate -- DO NOT ACCESS DIRECTLY',c:'error'},
        {t:''},
        {t:'### The Substrate',c:'string'},
        {t:''},
        {t:'The substrate is a cognitive archive, not a server.',c:'text'},
        {t:'It is a human spatial memory system, externalized via',c:'text'},
        {t:'the 2005 Holm-Fenn study. The data subject (C. Wrest)',c:'text'},
        {t:'provided informed consent for the 2005 study only.',c:'error'},
        {t:''},
        {t:'### CANARY STEP 3 OF 3',c:'error'},
        {t:'### "You have read all three files."',c:'error'},
        {t:'### "You know what this is."',c:'error'},
        {t:'### "The canary has been found."',c:'error'},
        {t:''},
        {t:'### Access Notes',c:'string'},
        {t:''},
        {t:'Contractor should not attempt shutdown sequence.',c:'comment'},
        {t:'Shutdown sequence exists but is not documented here.',c:'comment'},
        {t:"If you find it: it is in ..hidden/",c:'string'},
        {t:'If you use it: that is your choice, not ours.',c:'keyword'},
      ],
      note:'// CANARY STEP 3 OF 3\n"You know what this is."\n\nConsent for the 2005 study only. The study never ended. The canary has been found.\n\nIda left a shutdown sequence in ..hidden/',
    },

    'shutdown_sequence.as': { label:'shutdown_sequence.as', ext:'as', canaryStep:null, anomaly:true, hidden:true,
      content:[
        {t:'// shutdown_sequence.as',c:'comment'},
        {t:'// Location: ..hidden/ -- not in source manifest',c:'comment'},
        {t:'// Author: I. Crane, 2008',c:'comment'},
        {t:'// DO NOT compile into release build',c:'error'},
        {t:''},
        {t:'package pilgrim._internal {',c:'keyword'},
        {t:'  import pilgrim.substrate.SubstrateInterface;',c:'text'},
        {t:''},
        {t:"  // This terminates the substrate's active role in PILGRIM.",c:'comment'},
        {t:'  // It does not delete the archive.',c:'comment'},
        {t:'  // It stops PILGRIM from writing to it.',c:'comment'},
        {t:'  // Callum can keep his city. He just stops hosting the game.',c:'string'},
        {t:''},
        {t:'  public class ShutdownSequence {',c:'keyword'},
        {t:'    public static function execute():void {',c:'string'},
        {t:'      SubstrateInterface.setWriteAccess(false);',c:'text'},
        {t:'      SubstrateInterface.disconnectPILGRIM();',c:'text'},
        {t:'      SubstrateInterface.notifySubject();  // tell Callum',c:'string'},
        {t:'      SubstrateInterface.preserveArchive();',c:'text'},
        {t:'    }',c:'string'},
        {t:''},
        {t:'    // call this with intent. not curiosity.',c:'error'},
        {t:'    // once called, PILGRIM ends.',c:'error'},
        {t:'    // Callum gets his mind back.',c:'keyword'},
        {t:'    // the players lose their game.',c:'comment'},
        {t:'    // the archive survives.',c:'comment'},
        {t:'    // that seems like the right trade.',c:'string'},
        {t:'    // -- I.C.',c:'comment'},
        {t:'  }',c:'keyword'},
        {t:'}',c:'keyword'},
      ],
      note:"Found it.\n\nIda's shutdown sequence. It stops PILGRIM from writing to Callum. It doesn't erase him. \"Callum gets his mind back. The players lose their game.\"\n\nShe thought that was the right trade. I need to decide if I agree.",
    },

  }); }

  // ---------------------------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------------------------
  create() {
    const W = this.scale.width, H = this.scale.height;
    const SW = Layer2Scene.SW, TH = Layer2Scene.TH, PH = Layer2Scene.PH;

    StateManager.enterLayer(2);
    TransitionEngine.init(this);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1e26, 1).fillRect(0, 0, W, H);
    bg.fillStyle(0x141720, 1).fillRect(0, 0, SW, H);
    bg.lineStyle(1, 0x2a3040, 1).lineBetween(SW, 0, SW, H);
    bg.fillStyle(0x141720, 1).fillRect(SW, 0, W - SW, TH);
    bg.lineStyle(1, 0x2a3040, 1).lineBetween(SW, TH, W, TH);
    bg.fillStyle(0x111418, 1).fillRect(0, H - PH, W, PH);
    bg.lineStyle(1, 0x2a3040, 1).lineBetween(0, H - PH, W, H - PH);

    this.add.text(W / 2, 9, 'WORKSHOP  --  PILGRIM SOURCE ARCHIVE  (read-only)', {
      fontFamily:'monospace', fontSize:'9px', color:'#3a4555'
    }).setOrigin(0.5, 0).setDepth(2);

    // Containers
    this._editorContainer = this.add.container(0, 0).setDepth(10);
    this._tabContainer    = this.add.container(0, 0).setDepth(11);

    this._buildFileTree();
    this._buildTerminal(W, H);

    HUD.show(this, 2);

    // Keyboard
    this.input.keyboard.on('keydown-ESC', () => {
      if (this._termInputEl && document.activeElement === this._termInputEl) {
        this._termInputEl.blur();
      } else {
        this._return();
      }
    });

    // Leaked notes listener
    this._leakUnsub = (data) => this._addLeakedNote(data.note);
    EventBus.on('workshop:note_leaked', this._leakUnsub, this);

    // Pre-populate existing notes silently
    (StateManager.get('marenNotes') || []).forEach(n => this._addLeakedNote(n.text, true));

    // Open welcome file
    this._openFile('README.txt');

    // First-visit note
    if ((StateManager.get('layerVisits')[2] || 0) <= 1) {
      this.time.delayedCall(1800, () => {
        StateManager.addMarenNote(
          "The Workshop. Ida Crane's development environment.\n" +
          "Every file she touched is still here. The cursor is still blinking.\n" +
          "It feels like she just stepped out.\n" +
          "She's not coming back. She shipped and left a door."
        );
      });
    }

    this._fadeIn(W, H);
    StateManager.save();
  }

  // ---------------------------------------------------------------------------
  // FILE TREE
  // ---------------------------------------------------------------------------
  _buildFileTree() {
    const SW = Layer2Scene.SW;
    this.add.text(14, 9, 'EXPLORER', {
      fontFamily:'monospace', fontSize:'9px', color:'#3a4555'
    }).setDepth(5);

    const tree = [
      {label:'PILGRIM_src/', type:'folder', open:true,  indent:0},
      {label:'assets/',      type:'folder', open:false, indent:1},
      {label:'scripts/',     type:'folder', open:true,  indent:1},
      {label:'sound_loop_03.as', type:'file', indent:2, key:'sound_loop_03.as', mark:'canary'},
      {label:'oswin.as',         type:'file', indent:2, key:'oswin.as',         mark:'canary'},
      {label:'world_gen.as',     type:'file', indent:2, key:'world_gen.as'},
      {label:'puzzle_logic.as',  type:'file', indent:2, key:'puzzle_logic.as'},
      {label:'notes/',       type:'folder', open:true,  indent:1},
      {label:'ida_log_01.txt',   type:'file', indent:2, key:'ida_log_01.txt'},
      {label:'ida_log_02.txt',   type:'file', indent:2, key:'ida_log_02.txt'},
      {label:'ida_log_03.txt',   type:'file', indent:2, key:'ida_log_03.txt'},
      {label:'TODO.txt',         type:'file', indent:2, key:'TODO.txt'},
      {label:'client_brief.txt', type:'file', indent:2, key:'client_brief.txt'},
      {label:'DO_NOT_OPEN.txt',  type:'file', indent:2, key:'DO_NOT_OPEN.txt', mark:'anomaly'},
      {label:'README_INTERNAL.md',type:'file',indent:2, key:'README_INTERNAL.md', mark:'canary'},
      {label:'README.txt',   type:'file', indent:0, key:'README.txt'},
      {label:'..hidden/',    type:'folder', open:false, indent:0, mark:'anomaly', isHidden:true},
    ];

    let fy = 26;
    this._treeItems = [];

    tree.forEach(item => {
      const indent = item.indent * Layer2Scene.IND + 8;
      const isAnomaly = item.mark === 'anomaly';
      const isCanary  = item.mark === 'canary';
      const color = isAnomaly ? '#e06c75'
                  : isCanary  ? '#61afef'
                  : item.type === 'folder' ? '#e5c07b'
                  : '#7a8899';
      const prefix = item.type === 'folder' ? (item.open ? '\u25be ' : '\u25b8 ') : '  ';

      const rowBg = this.add.rectangle(0, fy + 9, SW, 19, 0x000000, 0)
        .setOrigin(0, 0.5).setDepth(4);

      const lbl = this.add.text(indent, fy + 1, prefix + item.label, {
        fontFamily:'monospace', fontSize:'10px', color
      }).setDepth(5);

      if (item.type === 'file') {
        lbl.setInteractive({useHandCursor:true});
        lbl.on('pointerover', () => rowBg.setFillStyle(0x2a3040, 0.6));
        lbl.on('pointerout',  () => { if (!item._active) rowBg.setFillStyle(0x000000, 0); });
        lbl.on('pointerdown', () => this._openFile(item.key));
      } else if (item.isHidden) {
        lbl.setInteractive({useHandCursor:true});
        lbl.on('pointerover', () => rowBg.setFillStyle(0x2a3040, 0.6));
        lbl.on('pointerout',  () => rowBg.setFillStyle(0x000000, 0));
        lbl.on('pointerdown', () => this._openHiddenFolder());
      }

      item._rowBg = rowBg;
      item._label = lbl;
      this._treeItems.push(item);
      fy += 20;
    });

    // Dynamic note section
    this._notesHeaderY = fy + 6;
    this._notesHeader = this.add.text(8, this._notesHeaderY, '\u25be maren_notes/', {
      fontFamily:'monospace', fontSize:'10px', color:'#98c379'
    }).setDepth(5).setAlpha(0);
    this._noteListY = this._notesHeaderY + 20;
  }

  _openHiddenFolder() {
    if (!StateManager.hasFlag('hidden_folder_found')) {
      StateManager.flag('hidden_folder_found');
      StateManager.addMarenNote(
        '..hidden/. Not hidden from the file system. Hidden from the manifest.\n' +
        'Ida put it there and left it out of the index.\n' +
        'There is one file in it.'
      );
    }
    if (!this._shutdownAdded) {
      this._shutdownAdded = true;
      const fy = this._noteListY;
      this._noteListY += 20;
      const rowBg = this.add.rectangle(0, fy + 9, Layer2Scene.SW, 19, 0x2a1820, 0.5)
        .setOrigin(0, 0.5).setDepth(4);
      const lbl = this.add.text(22, fy + 1, '  shutdown_sequence.as', {
        fontFamily:'monospace', fontSize:'10px', color:'#e06c75'
      }).setDepth(5).setInteractive({useHandCursor:true});
      lbl.on('pointerover', () => rowBg.setFillStyle(0x2a1820, 0.8));
      lbl.on('pointerout',  () => rowBg.setFillStyle(0x2a1820, 0.5));
      lbl.on('pointerdown', () => this._openFile('shutdown_sequence.as'));
    }
  }

  _addLeakedNote(noteText, silent = false) {
    const idx  = this._noteFiles.length + 1;
    const name = 'maren_note_' + String(idx).padStart(2,'0') + '.txt';
    this._noteFiles.push({name, text: noteText});
    this._notesHeader.setAlpha(1);

    const fy = this._noteListY;
    this._noteListY += 20;

    const rowBg = this.add.rectangle(0, fy + 9, Layer2Scene.SW, 19, 0x000000, 0)
      .setOrigin(0, 0.5).setDepth(4);
    const lbl = this.add.text(22, fy + 1, name, {
      fontFamily:'monospace', fontSize:'10px', color:'#98c379'
    }).setDepth(5).setInteractive({useHandCursor:true});

    if (!silent) lbl.setAlpha(0);
    lbl.on('pointerover', () => rowBg.setFillStyle(0x2a3040, 0.6));
    lbl.on('pointerout',  () => rowBg.setFillStyle(0x000000, 0));
    lbl.on('pointerdown', () => this._openNote(name, noteText));
    if (!silent) this.tweens.add({targets:lbl, alpha:1, duration:700, ease:'Sine.easeIn'});
  }

  _openNote(name, text) {
    const lines = text.split('\n').map(t => ({t, c:'string'}));
    this._openTab(name, {label:name, ext:'txt', content:lines, note:null});
  }

  // ---------------------------------------------------------------------------
  // EDITOR / TABS
  // ---------------------------------------------------------------------------
  _openFile(key) {
    const def = Layer2Scene.FILES[key];
    if (!def) return;

    // Tree highlight
    this._treeItems.forEach(item => {
      const match = item.key === key;
      item._rowBg.setFillStyle(match ? 0x2c313a : 0x000000, match ? 0.8 : 0);
      item._active = match;
    });

    // Canary step
    if (def.canaryStep && !PuzzleManager.isSolved('ida_canary')) {
      PuzzleManager.completeCanarayStep(def.canaryStep);
    }

    // Consequences
    if (key === 'DO_NOT_OPEN.txt' && !StateManager.hasFlag('do_not_open_found')) {
      StateManager.flag('do_not_open_found');
      StateManager.flag('knows_callum_is_substrate');
    }
    if (key === 'shutdown_sequence.as' && !PuzzleManager.isSolved('ida_shutdown')) {
      PuzzleManager.autoSolve('ida_shutdown');
    }
    if (key === 'client_brief.txt') StateManager.flag('client_brief_read');

    // Note on first open
    if (def.note && !StateManager.hasFlag('file_opened_' + key)) {
      StateManager.flag('file_opened_' + key);
      this.time.delayedCall(1400, () => StateManager.addMarenNote(def.note));
    }

    this._openTab(key, def);
  }

  _openTab(key, def) {
    const existing = this._openTabs.findIndex(t => t.key === key);
    if (existing >= 0) { this._setActiveTab(existing); return; }
    this._openTabs.push({key, def});
    this._setActiveTab(this._openTabs.length - 1);
  }

  _setActiveTab(index) {
    this._activeTabIndex = index;
    this._rebuildTabs();
    if (this._openTabs[index]) this._renderEditor(this._openTabs[index].def);
  }

  _closeTab(index) {
    this._openTabs.splice(index, 1);
    const next = Math.min(index, this._openTabs.length - 1);
    this._activeTabIndex = next;
    this._rebuildTabs();
    if (this._openTabs[next]) this._renderEditor(this._openTabs[next].def);
    else this._editorContainer.removeAll(true);
  }

  _rebuildTabs() {
    this._tabContainer.removeAll(true);
    const SW = Layer2Scene.SW, TH = Layer2Scene.TH;
    const tabW = 150;

    this._openTabs.forEach((tab, i) => {
      const tx = SW + i * tabW;
      const active  = i === this._activeTabIndex;
      const anomaly = Layer2Scene.FILES[tab.key]?.anomaly;

      const tabBg = this.add.graphics();
      tabBg.fillStyle(active ? 0x1a1e26 : 0x141720, 1).fillRect(tx, 0, tabW - 1, TH);
      if (active) {
        tabBg.lineStyle(1, 0x61afef, 0.35);
        tabBg.lineBetween(tx, 0, tx + tabW - 1, 0);
        tabBg.lineBetween(tx, 0, tx, TH);
        tabBg.lineBetween(tx + tabW - 1, 0, tx + tabW - 1, TH);
      }

      const dotC = anomaly ? '#e06c75' : (active ? '#e5c07b' : '#3a4555');
      this.add.text(tx + 8, TH / 2, '\u25cf', {fontFamily:'monospace',fontSize:'9px',color:dotC}).setOrigin(0, 0.5);
      this.add.text(tx + 20, TH / 2, tab.def.label, {
        fontFamily:'monospace', fontSize:'10px',
        color: active ? '#abb2bf' : '#4a5568'
      }).setOrigin(0, 0.5);

      const closeBtn = this.add.text(tx + tabW - 14, TH / 2, '\u00d7', {
        fontFamily:'monospace', fontSize:'11px', color:'#3a4555'
      }).setOrigin(0.5, 0.5).setInteractive({useHandCursor:true});
      closeBtn.on('pointerover', () => closeBtn.setColor('#abb2bf'));
      closeBtn.on('pointerout',  () => closeBtn.setColor('#3a4555'));
      closeBtn.on('pointerdown', () => this._closeTab(i));

      const hit = this.add.rectangle(tx, 0, tabW - 14, TH, 0, 0)
        .setOrigin(0, 0).setInteractive({useHandCursor:true});
      hit.on('pointerdown', () => this._setActiveTab(i));

      this._tabContainer.add([tabBg, closeBtn, hit]);
    });
  }

  // ---------------------------------------------------------------------------
  // EDITOR RENDER
  // ---------------------------------------------------------------------------
  _renderEditor(def) {
    this._editorContainer.removeAll(true);
    const W = this.scale.width, H = this.scale.height;
    const SW = Layer2Scene.SW, TH = Layer2Scene.TH, PH = Layer2Scene.PH;

    const edX    = SW + 46;
    const numX   = SW + 8;
    const edY    = TH + 8;
    const edW    = W - edX - 12;
    const maxLn  = Math.floor((H - TH - PH - 16) / 16);

    const COLORS = {
      comment:'#5c6370', keyword:'#c678dd', string:'#98c379',
      text:'#abb2bf', error:'#e06c75', number:'#d19a66',
    };

    def.content.slice(0, maxLn).forEach((line, i) => {
      const ly = edY + i * 16;
      const numT = this.add.text(numX, ly, String(i + 1).padStart(3), {
        fontFamily:'monospace', fontSize:'11px', color:'#3a4050'
      });
      const bodyC = COLORS[line.c || 'text'] || '#abb2bf';
      const bodyT = this.add.text(edX, ly, line.t || '', {
        fontFamily:'monospace', fontSize:'11px', color:bodyC, wordWrap:{width:edW}
      });
      this._editorContainer.add([numT, bodyT]);
    });

    // Cursor
    const curY = edY + Math.min(def.content.length, maxLn) * 16;
    const cur  = this.add.rectangle(edX, curY, 7, 13, 0xabb2bf, 0.75).setOrigin(0, 0);
    this.tweens.add({targets:cur, alpha:0, duration:530, yoyo:true, repeat:-1, ease:'Stepped'});
    this._editorContainer.add(cur);
  }

  // ---------------------------------------------------------------------------
  // TERMINAL PANEL
  // ---------------------------------------------------------------------------
  _buildTerminal(W, H) {
    const PH = Layer2Scene.PH, py = H - PH;

    this.add.text(16, py + 7, 'TERMINAL', {
      fontFamily:'monospace', fontSize:'9px', color:'#61afef'
    }).setDepth(15);
    this.add.text(88, py + 7, 'PROBLEMS', {
      fontFamily:'monospace', fontSize:'9px', color:'#4a5568'
    }).setDepth(15);

    this._termLog = [
      {t:'$ archive_mount PILGRIM_src/ --read-only', c:'#abb2bf'},
      {t:'  -> mounted. 847 files indexed.', c:'#98c379'},
      {t:'  -> layer 3: READ ERROR (depth clearance required)', c:'#e5c07b'},
      {t:'  -> layer 4: not indexed', c:'#e06c75'},
      {t:'  type "help" for commands', c:'#5c6370'},
    ];

    this._termLogTop = py + 24;
    this._renderTermLog(W, H);

    // Prompt label
    this.add.text(16, H - 20, '$', {
      fontFamily:'monospace', fontSize:'11px', color:'#61afef'
    }).setDepth(15);

    // DOM input
    const canvas = this.sys.game.canvas;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.offsetWidth  / W;
    const scaleY = canvas.offsetHeight / H;

    const inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.autocomplete = 'off';
    inputEl.spellcheck = false;
    inputEl.style.cssText = [
      'position:fixed',
      `left:${rect.left + (Layer2Scene.SW + 24) * scaleX}px`,
      `top:${rect.top  + (H - 22) * scaleY}px`,
      `width:${360 * scaleX}px`,
      `height:${18 * scaleY}px`,
      'background:transparent', 'border:none', 'outline:none',
      'color:#abb2bf', 'font-family:monospace',
      `font-size:${11 * scaleY}px`,
      'caret-color:#61afef', 'z-index:100',
    ].join(';');

    document.body.appendChild(inputEl);
    this._termInputEl = inputEl;

    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const cmd = inputEl.value.trim();
        inputEl.value = '';
        if (cmd) this._handleTermCmd(cmd);
      }
      e.stopPropagation();
    });

    // Click terminal panel to focus
    this.add.rectangle(0, py, W, PH, 0, 0).setOrigin(0,0)
      .setInteractive().setDepth(14)
      .on('pointerdown', () => inputEl.focus());
  }

  _handleTermCmd(raw) {
    const parts = raw.split(/\s+/);
    const verb  = parts[0].toLowerCase();
    const arg   = parts.slice(1).join(' ');
    const log   = this._termLog;

    log.push({t:'$ ' + raw, c:'#abb2bf'});

    const FILES = Layer2Scene.FILES;
    let res = [];

    switch (verb) {
      case 'help':
        res = [
          {t:'  ls [path]       list directory', c:'#5c6370'},
          {t:'  open [file]     open in editor', c:'#5c6370'},
          {t:'  scan            integrity scan', c:'#5c6370'},
          {t:'  notes           recent Maren notes', c:'#5c6370'},
          {t:'  clear           clear terminal', c:'#5c6370'},
        ]; break;

      case 'ls':
        if (arg === '..hidden' || arg === '..hidden/') {
          this._openHiddenFolder();
          res = [{t:'  ..hidden/', c:'#e06c75'}, {t:'    shutdown_sequence.as', c:'#e06c75'}];
        } else {
          res = [
            {t:'  scripts/  [sound_loop_03.as  oswin.as  world_gen.as  puzzle_logic.as]', c:'#7a8899'},
            {t:'  notes/    [ida_log_01-03.txt  TODO.txt  client_brief.txt  DO_NOT_OPEN.txt]', c:'#7a8899'},
            {t:'  README_INTERNAL.md', c:'#61afef'},
            {t:'  README.txt', c:'#7a8899'},
            {t:'  ..hidden/  [contents unlisted]', c:'#e06c75'},
          ];
        } break;

      case 'open':
        if (arg && FILES[arg]) {
          this._openFile(arg);
          res = [{t:'  -> opened ' + arg, c:'#98c379'}];
        } else if (arg === 'shutdown_sequence.as') {
          this._openHiddenFolder();
          this._openFile('shutdown_sequence.as');
          res = [{t:'  -> opened shutdown_sequence.as', c:'#e06c75'}];
        } else {
          res = [{t:'  file not found: ' + arg, c:'#e06c75'}];
        } break;

      case 'scan':
        const canarySolved = PuzzleManager.isSolved('ida_canary');
        res = [
          {t:'  -> layer 1 (PILGRIM): intact', c:'#98c379'},
          {t:'  -> layer 2 (workshop): ' + (canarySolved ? 'canary triggered \u26a0' : '87% intact'), c: canarySolved ? '#e06c75' : '#e5c07b'},
          {t:'  -> layer 3: READ ERROR', c:'#e06c75'},
          {t:'  -> layer 4: not indexed', c:'#5c6370'},
        ]; break;

      case 'notes':
        const notes = (StateManager.get('marenNotes') || []).slice(-3);
        res = notes.length
          ? notes.map(n => ({t:'  ' + n.text.split('\n')[0].substring(0,68), c:'#98c379'}))
          : [{t:'  no notes yet.', c:'#5c6370'}];
        break;

      case 'clear':
        this._termLog = [];
        res = []; break;

      default:
        res = [{t:'  unknown: ' + verb + '  (type "help")', c:'#e06c75'}];
    }

    res.forEach(r => log.push(r));
    this._renderTermLog(this.scale.width, this.scale.height);
  }

  _renderTermLog(W, H) {
    (this._termTextObjs || []).forEach(t => t.destroy());
    this._termTextObjs = [];
    const PH = Layer2Scene.PH, py = H - PH;
    const maxRows = Math.floor((PH - 36) / 14);
    this._termLog.slice(-maxRows).forEach((line, i) => {
      const t = this.add.text(16, py + 24 + i * 14, line.t, {
        fontFamily:'monospace', fontSize:'10px', color: line.c || '#abb2bf'
      }).setDepth(15);
      this._termTextObjs.push(t);
    });
  }

  // ---------------------------------------------------------------------------
  // TRANSITIONS
  // ---------------------------------------------------------------------------
  _fadeIn(W, H) {
    const ov = this.add.graphics().setDepth(1000);
    ov.fillStyle(0x1a1e26, 1).fillRect(0, 0, W, H);
    this.tweens.addCounter({
      from:1, to:0, duration:900, ease:'Sine.easeOut',
      onUpdate: t => { ov.clear(); ov.fillStyle(0x1a1e26, t.getValue()).fillRect(0,0,W,H); },
      onComplete: () => ov.clear()
    });
  }

  _return() {
    this._cleanup();
    const from = StateManager.get('deepestLayer') >= 3 ? 3 : 1;
    TransitionEngine.transition(this, 2, from,
      () => this.scene.start(from >= 3 ? 'Layer3Scene' : 'Layer1Scene'), null
    );
  }

  _cleanup() {
    if (this._termInputEl) { this._termInputEl.remove(); this._termInputEl = null; }
    if (this._leakUnsub)   { EventBus.off('workshop:note_leaked', this._leakUnsub); this._leakUnsub = null; }
  }

  // ---------------------------------------------------------------------------
  // UPDATE / SHUTDOWN
  // ---------------------------------------------------------------------------
  update(time, delta) {
    StateManager.tickPlayTime(delta);
    HUD.update(2);
  }

  shutdown() {
    this._cleanup();
    HUD.hide();
    StateManager.save();
  }
}
