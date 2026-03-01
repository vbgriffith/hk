/**
 * js/mapExtensions.js -- Build 8
 * Three new map systems + drawn decor sprites:
 *   1. ROOM_FLAVOR   -- per-room atmospheric descriptions keyed by type x theme
 *   2. SocialMapGen  -- intimate room maps for social encounters (tavern, court, market...)
 *   3. EnvironmentMapGen -- environment overview maps (forest, swamp, cave, city district...)
 *   4. DrawnSprites  -- canvas-drawn furniture/decor replacing emoji icons
 */

var MapExtensions = (function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ROOM FLAVOR TEXT
  // ═══════════════════════════════════════════════════════════════════════════

  var ROOM_FLAVOR = {
    // ── Classic Stone Dungeon ─────────────────────────────────────────────
    classic: {
      entry:    ['The gatehouse stinks of old torch oil and damp stone. Iron rings set into the walls once held chains. The portcullis grooves are worn smooth by years of use.',
                 'A pair of iron sconces flank the archway, their flames long since guttered. Boot prints in the dust lead deeper in -- none lead back out.',
                 'The ceiling here is low and blackened from smoke. Someone scratched a warning in the lintel stone, but the language is unfamiliar.'],
      combat:   ['Rusted weapon racks line the walls, most stripped bare. A training dummy of rotted straw still stands in one corner, bristling with crossbow bolts.',
                 'The barracks smell of old sweat and fear. Bunks are bolted to the walls, straw mattresses long since rotted. One still has a boot under it.',
                 'Scorch marks and old blood stain the flagstones in overlapping patterns. Whatever battles were fought here, they were many and brutal.'],
      treasure: ['The lock on the vault door is newer than the door itself -- someone has been maintaining it. The hinges are greased. Someone still cares what is inside.',
                 'Iron-banded chests are bolted to the floor in a ring. The wax seals on most are ancient, cracked but unbroken. Dust an inch thick.',
                 'A counting table dominates the center, abacus overturned, ledgers water-damaged. Behind the false wall, a second room.'],
      ritual:   ['A chalk circle covers most of the floor, its lines still sharp despite the years. Something about the proportions makes the eye slide away. The air tastes of copper.',
                 'The altar stone is basalt, polished by use. Channels carved into its surface drain toward a grate in the floor. The grate is sealed from below.',
                 'Nine iron candleholders in a ring, each one a different height. Wax has dripped and pooled on the floor, forming shapes that might be deliberate.'],
      utility:  ['The kitchen is cold but the grease on the walls is less than a decade old. Someone has been cooking here. The larder door is barred from the outside.',
                 'A cistern of still black water takes up half the room. The surface is perfectly undisturbed. Something that is not sediment drifts along the bottom.',
                 'Shelves of clay jars, most sealed with wax. A few have been opened and re-sealed. The ones on the lowest shelf are labeled in a cipher.'],
      library:  ['Row after row of iron scroll cases, most sealed. The few that have been opened are stacked haphazardly near a reading lectern, as if someone left in a hurry.',
                 'A broad writing desk faces the door -- the writer wanted to see who was coming. Ink is still in the well. A half-written page sits on the blotter.',
                 'The cataloguing system is elaborate and personal. Whoever organized this library understood it perfectly. Without them, it is a maze.'],
      boss:     ['The ceiling vaults forty feet overhead. Sound does strange things here. Footsteps echo twice, from different directions. The throne at the far end is occupied.',
                 'Trophy mounts cover every wall -- adventuring gear, weapons, armor. All sized for humans. The newest ones still have dried blood on them.',
                 'The floor is a mosaic of crushed tiles that were never repaired. The pattern, if there was one, is long gone. Only the throne remains intact, untouched by decay.'],
      special:  ['The oubliette is twelve feet deep. Scratch marks cover the walls from floor to ceiling. The dates carved into the stone span three hundred years.',
                 'The trophy room is locked with a complex mechanism. Inside, the trophies are strange -- not weapons or armor, but personal items. Locks of hair. Letters. Shoes.',
                 'The torture room is too clean. The instruments are too organized. Someone has been using this room recently, and they are precise about it.'],
    },

    // ── Necromantic Crypt ─────────────────────────────────────────────────
    undead: {
      entry:    ['The mausoleum entrance is carved from a single block of black granite. The epitaph has been deliberately defaced, every name scratched out. The door opens inward.',
                 'Bone dust coats the threshold half an inch deep. Something has been passing through here regularly -- the dust is disturbed in a path two feet wide.',
                 'Iron death masks line the archway, one for every person interred below. One of them is new. The wax has not yet fully set.'],
      combat:   ['The crypt guard chambers smell of rot and old violence. Manacles dangle from the ceiling, attached to nothing. The floor is sloped, slightly, toward a drain.',
                 'Cracked sarcophagi line the walls, their lids shoved aside from within. Whatever was inside left in a hurry. Grave goods are scattered but not stolen.',
                 'The walls are painted with scenes of death and resurrection, executed with clinical skill. The figures in the paintings have been given faces -- real faces, people the painter knew.'],
      treasure: ['The burial vault is sealed by a curse-lock -- break it and the contents are forfeit. The lock itself is worth more than the burial goods inside.',
                 'Sarcophagi of nobles, stacked three high. The lowest layer is the oldest. The uppermost have been opened and resealed. Something was added to them.',
                 'Grave goods arranged with obsessive care: weapons with their owners, jewelry sorted by material. A meticulous inventory carved into the wall is still accurate.'],
      ritual:   ['The necromancy circle is forty feet across. It has been used so many times the stone has absorbed the magic -- faint phosphorescence outlines each rune even now.',
                 'Chains of iron and silver descend from the ceiling to a central dais. The chains end in shackles sized for something larger than a person. The dais is warm.',
                 'Nine soul cages hang from iron hooks, eight empty, one dark and humming. Whatever is inside does not react to light, movement, or sound. Only to being watched.'],
      utility:  ['The embalming chamber is disturbingly well-stocked. The tools are clean. The slabs are occupied -- three of them -- by figures too still to be sleeping.',
                 'Bone dust fills the mill chamber to ankle height. The millstone has been running recently; the shaft is warm. Whatever was ground here is not grain.',
                 'Storage shelves hold clay amphorae sealed with black wax, each one labeled with a name and a date. The dates go back four hundred years. The names are not all historical figures.'],
      library:  ['A library of the dead. Every text concerns necromancy, undeath, soul theory. Many are annotated in multiple hands across decades. The most recent annotations are from this year.',
                 'Death liturgy scrolls cover the walls floor-to-ceiling, pinned directly to the stone. A scholar has been comparing texts, connecting ideas with red thread. The connections form a diagram.',
                 'The forbidden archive is cold even for a crypt. Books here are bound in materials that are not leather. The ink in several is not ink. Most are still readable.'],
      boss:     ['The lich\'s sanctum hums with contained power. Phylacteries line a shelf behind the throne -- one per century, each one different. The most recent is bone-white and warm to the touch.',
                 'An undead overlord\'s throne of fused skeleton, yellowed and cracked. The candles here burn with black flame that casts shadows in the wrong direction.',
                 'The vampire lord\'s lair smells of iron and old roses. Mirrors have been removed, their hooks still in the walls. One mirror remains, covered by a black cloth that occasionally moves.'],
      special:  ['The mass grave is old, but not old enough. The bodies are layered in a way that suggests organization rather than desperation. Someone chose who went in which layer.',
                 'The ossuary chapel has been rearranged. Bones that should be scattered in reverence have been reassembled into figures. They are posed. They are posed looking at the altar.',
                 'The plague pit was sealed two hundred years ago. The seal is intact, but something on the other side is testing it. The stone around the seal has hairline cracks.'],
    },

    // ── Arcane Tower ──────────────────────────────────────────────────────
    arcane: {
      entry:    ['The foyer wards activate when you cross the threshold -- a shimmer of light that logs your face, your height, the color of your aura. The log is current. Others have been here this week.',
                 'Sigil-etched tiles cover every surface of the entry hall. Most are dormant. The ones near the door are not. They have been freshly renewed.',
                 'The warded entrance passes magical energy through anyone who enters. Spellcasters feel a brief, profound wrongness -- like a hand passing through their chest -- and then nothing.'],
      combat:   ['The construct lab is thick with ozone. Half-finished golems are bolted to work-stands, some with tools still embedded in their torsos. One in the corner is breathing.',
                 'Guardian automata are stored in alcoves, unpowered. Their eyes are glass, their faces expressive in a way that seems deliberate. Someone designed them to look afraid.',
                 'Familiar kennels line the walls, each cell sized differently. Most are empty. Several have been broken out of rather than opened. Whatever lived in the largest one left burns on the ceiling.'],
      treasure: ['The artifact vault is secured by a puzzle-lock that changes every hour. The current configuration is unsolved. A skeleton near the door suggests the previous attempt.',
                 'Spellbooks are chained to desks at intervals, each one opened to a different page. The pages face the door. The books are being read -- the question is by what.',
                 'A catalog of component storage covers one wall, cross-referenced by rarity, spell level, and acquisition cost. The catalog is more valuable than most of the components listed.'],
      ritual:   ['The summoning circle is etched three inches deep into the floor. The central binding sigil is scorched outward -- something pushed back. The circle held, barely.',
                 'A transmutation laboratory smells of hot metal and overripe fruit. Three different experiments are still running, unattended. One has achieved something its creator did not intend.',
                 'The divination observatory ceiling is a perfect model of the night sky, stars replaced by crystals that shift position with the actual stars outside. One crystal is wrong. Deliberately.'],
      utility:  ['An alchemical workshop in mid-process: seventeen active distillations, eleven cooling, four abandoned. The notebooks describe experiments across forty years in one handwriting.',
                 'The arcane forge is cold but the metal in the quench barrel is still liquid. Whatever was being created is gone from the mold. The mold, left behind, is shaped like a key.',
                 'Distillation chambers of different sizes, all connected by copper tubing in a system too complex to trace without diagrams. The diagrams are missing.'],
      library:  ['The grand library is seven floors tall in a space that should not contain seven floors. The cataloguing system references books that do not appear to be on the shelves. They are.',
                 'Forbidden research was conducted here. The evidence has been partially destroyed, but partial destruction is not destruction. What remains tells a coherent story.',
                 'Scroll archives in climate-sealed tubes stacked floor to ceiling. A reading machine in the center of the room unfolds any tube placed in it. It has a memory -- it remembers the last three hundred documents accessed.'],
      boss:     ['The archmage\'s sanctum contains a paradox: it is larger inside than out. Significantly larger. The books on the shelves contain knowledge that has not yet been written.',
                 'The master laboratory is organized around a central experiment that has been running for decades. The results, visible in a crystal sphere, are terrifying.',
                 'At the tower apex, the walls are transparent -- looking out in every direction simultaneously. The night sky is wrong from here. The stars are closer than they should be.'],
      special:  ['The failed experiment chamber contains eight rooms that do not connect to each other in Euclidean space. You can enter room three from room one, room five from room three, room one from room five.',
                 'The spell prison holds fourteen cells. Twelve are empty. One holds something that may once have been human. One holds something that was never human and is waiting very patiently.',
                 'The rift observatory is cracked along every wall, not from structural failure but from something pressing outward from a point in the center of the room. The observatory was built around the rift, not the other way around.'],
    },

    // ── Ancient Grove / Cave ──────────────────────────────────────────────
    nature: {
      entry:    ['The living gate is an arch of two ancient trees, their crowns grown together overhead. The bark has been carved with warnings in a language that predates current scripts by six centuries.',
                 'Bioluminescent lichen covers the cave entrance, pulsing in a slow rhythm that matches something -- not a heartbeat, but something similarly biological.',
                 'The root archway is forty feet tall and clearly deliberate. Roots from trees twenty yards away have been coaxed toward each other over decades. This was planned by something patient.'],
      combat:   ['The predator den smells powerfully of musk and carrion. Bones -- all prey species -- form a knee-high ring around a cleared sleeping area. The clearing is warm from recent use.',
                 'A territorial zone marked by scratches on cave walls, claw-height, consistent spacing. Whatever marked this territory was precise about it. The scratches are fresh.',
                 'Hunting grounds with natural cover: boulders, root tangles, shadow pools. Something has arranged the cover to create fields of fire. The arrangement is too deliberate to be natural.'],
      treasure: ['An ancient cache behind a root barrier that can only be opened by someone who knows how to ask the tree. The cache has been undisturbed for centuries. The tree is not sure about visitors.',
                 'A druidic vault of stones that interlock perfectly without mortar. The key is a sequence of pressure points on the outer face. The sequence changes with the moon phase.',
                 'A blessed spring pool reflects the sky even when indoors. The water is cold and tastes of iron and sweet grass simultaneously. The bottom of the pool is deeper than it looks.'],
      ritual:   ['A sacred grove where trees grow in a perfect circle, none of them the same species. The inner space has no leaves on the ground despite the canopy overhead. The ground is bare earth, undisturbed.',
                 'A moon circle of standing stones, each one a different mineral. At certain hours, the shadows they cast align to form a map of the stars. The map is accurate.',
                 'A druidic ring of carved stones, half-buried, forming a pattern visible only from above. From ground level it looks random. A bird could read it.'],
      utility:  ['A mushroom farm that has been tended for generations. Some cultivars are unique to this cave -- they exist nowhere else. Several are labeled with properties not found in any herbalist\'s guide.',
                 'An herb cache in a naturally temperature-stable alcove. Dried bundles hang from root-pegs in organized clusters. The organization is medicinal -- someone knows exactly what they are doing.',
                 'A water source where three underground streams meet. The water runs in three colors that blend in the central pool. Taking water from only one stream requires a vessel that can hold it without mixing.'],
      library:  ['Carved stone records cover every available surface of this cavern. The earliest carvings are five thousand years old. The most recent are from last month. Someone has been maintaining this archive.',
                 'A bark archive: bark strips pressed flat, inscribed with iron needles, stored in stone tubes. The content is naturalistic -- ecological records of this region across centuries.',
                 'An ancient inscription wall in a language that predates human literacy in this region. The inscriptions have been translated in a newer hand, carved next to the originals. The translator\'s notes suggest they did not like what they found.'],
      boss:     ['The elder\'s chamber is a cavern with a ceiling so high it is lost in darkness. The floor is covered in living moss so fine it feels like carpet. At the center, something ancient is waiting.',
                 'The primal core pulses with energy that has no equivalent in arcane taxonomy. Whatever it is, it predates the current age. The plants nearest it grow toward it even when there is no light.',
                 'The ancient\'s heart is a chamber where time moves differently. Events from outside filter in -- sounds, vibrations -- but delayed, shuffled. What happened here an hour ago may only now be arriving.'],
      special:  ['A corrupted glade where the bioluminescence is the wrong color. The plants here have not adapted to it -- they are dying. Whatever caused the change happened recently.',
                 'A poison garden of extraordinary variety. Many plants have been hybridized. The hybridization shows purpose: specific symptom profiles, specific durations. Someone made these for reasons.',
                 'An abandoned den, recently abandoned. Nesting material is still warm. Food cached in the corners is fresh. Whatever lived here left with their young in apparent haste.'],
    },

    // ── Sacred Temple ─────────────────────────────────────────────────────
    divine: {
      entry:    ['The narthex floor is inlaid with the names of everyone who has taken sanctuary here, going back five hundred years. The most recent names are carved in a different hand -- rougher, hurried.',
                 'Pilgrim\'s markings cover the doorposts at hand height -- prayers, blessings, desperate scratchings. The blessings outnumber the prayers. The desperate scratchings are newest.',
                 'The threshold stone is worn concave by centuries of feet. The wards here are passive -- they do not stop entry, they remember it. The memory goes back to the founding.'],
      combat:   ['The inquisitor\'s chamber is designed for interrogation: a single chair bolted to the floor, angled toward the light from the high window. The chair has straps. The straps are padded.',
                 'Holy knights\' barracks with weapons maintained in perfect condition. Prayer books open on the bunks at the same passage -- a preparation rite. The knights who used these quarters believed in what they were doing.',
                 'Blessed armory where weapons have been consecrated individually. Each has a tag with the wielder\'s name and their oath. Several oaths have been crossed through.'],
      treasure: ['The relic vault smells of cedar and incense. Each relic is documented in a ledger chained to the wall. The most recent entries are annotated with question marks in a different hand.',
                 'An offering room where centuries of petitioners left gifts. Most are modest. A few are extraordinary and suggest the prayer was answered. The most valuable have been recently disturbed.',
                 'The holy repository is sealed by the names of the three founding priests. One name has been erased. The seal still holds -- barely -- on two names alone.'],
      ritual:   ['The inner sanctum has perfect acoustics. A whisper at the altar is audible throughout. The altar is stained in a way that the stone will not release despite centuries of scrubbing.',
                 'The high altar is elevated by seven steps, each one engraved with a virtue. The steps are worn from the center outward -- the priests who climbed them did so without shoes.',
                 'A consecration chamber where the air itself is charged. Spellcasters feel pressure here, as if a presence is observing them from directly above. The pressure is not hostile. It is evaluating.'],
      utility:  ['The vestibule between the public and private areas of the temple. Signs in three languages regulate who may enter. The signs are accurate -- or were, before whatever happened here.',
                 'Clergy quarters spartan by design, comfortable by accident. Personal effects remain on the shelves. Someone left in such a hurry that they left everything, and have not come back.',
                 'A preparation hall for holy ceremonies. Vestments in different sizes hang in order of rank. The highest rank vestments are still here. The priest who wore them is not.'],
      library:  ['Sacred texts archive where doctrinal evolution can be read in the margins of older books. The most contentious theological debates happened in these margins. Someone has been adding to them.',
                 'The prophecy hall contains forty-seven documented prophecies, each one annotated with its fulfillment date. Forty-three have been fulfilled. The remaining four are marked with the same date -- a date that is approaching.',
                 'Theological library where heresy and orthodoxy share shelves. A scholar\'s life\'s work is organized here -- and the conclusion they reached is marked in the last volume, in a shaking hand.'],
      boss:     ['The high priest\'s chamber is immaculate -- too immaculate. Sanctified, but in a way that is about concealment as much as purity. The hidden room behind the altar has been in use very recently.',
                 'The corruption core was a place of healing. The transition to what it is now was gradual -- the earliest records show nothing wrong, and the contamination crept in over decades before anyone noticed.',
                 'A desecrated sanctum where the divine symbols have not been removed but reversed. The reversal is precise and knowledgeable. Whatever did this understood what it was undoing.'],
      special:  ['The confessional is designed so the priest cannot see the penitent\'s face. What has been confessed here is encoded in a cipher unique to this order. The cipher key is hidden in a loose stone.',
                 'An ossuary chapel where the bones of the faithful form the architecture. The vaults, arches, and columns are human remains assembled with extraordinary skill and patience. Candles burn here. Someone lights them.',
                 'A miracle site that has not produced miracles in sixty years. The evidence that it once did is irrefutable. The question -- why it stopped -- has driven three investigators into madness.'],
    },

    // ── Planar Rift Site ──────────────────────────────────────────────────
    planar: {
      entry:    ['The planar gate hums at a frequency that is felt rather than heard. The air within ten feet of it has a quality like the moment before lightning. Objects left near it for more than an hour are subtly wrong afterward.',
                 'The anchor point is a node of crystallized planar force -- a knot where the fabric of reality was deliberately fixed to prevent drift. The fixings are loosening. Someone has been working at them.',
                 'The void entrance smells of ozone and something sweet and rotting that has no earthly equivalent. The threshold does not burn to cross. It calculates.'],
      combat:   ['Planar guardian posts for entities that no longer fully obey. The restraints are designed for creatures that can step partially out of reality -- layered bindings, overlapping jurisdictions.',
                 'A demon barracks where occupants have modified their quarters to match a home plane. The modifications are nostalgic rather than tactical -- touches of comfort from an existence without comfort.',
                 'Elemental holding cells where different environments have been constructed within the cells: a pocket of crushing pressure, a sphere of living flame, a sealed vacuum.'],
      treasure: ['The void cache is not in a fixed location -- it drifts within a twelve-foot radius, visible only from certain angles. The lock is temporal rather than mechanical.',
                 'Planar artifacts stored in null-energy containment, each one wrapped in inscribed lead. The inscriptions are warnings in eighteen languages. Several are in languages that do not exist yet.',
                 'A reality fragment store where pieces of other planes have been preserved in stasis. They are too small to be dangerous, too large to be studied safely. A scholar has been trying anyway.'],
      ritual:   ['The summoning nexus has been used ten thousand times by conservative estimate. Each use leaves a trace. The traces overlap into a palimpsest of contacts with eighty-seven distinct types of entity.',
                 'A planar binding circle where the mathematics of the bindings have been modified over centuries. The modifications improve them -- but also change what they attract.',
                 'The reality anchor chamber stabilizes this location against dimensional bleeding. It does not stabilize it completely. Twice per day, at irregular intervals, what is here flickers.'],
      utility:  ['The planar transit hub\'s routing table covers one wall -- a network map of planar connections, with travel times, hazard ratings, and toll information. Several connections are marked closed. Three are marked newly opened.',
                 'An anchor node that has drifted from its optimal position. The drift is measurable: half an inch per year. In three hundred years it will fail. Someone did the math and left a note.',
                 'A reality calibration room where baseline reality measurements are taken and compared against planar drift. The last calibration was six months ago. The current reading shows significant drift.'],
      library:  ['A planar almanac in forty volumes, one per explored plane. Several entries are written from the perspective of the plane itself -- first person, non-human grammar, profound alienness.',
                 'Void cartography room where maps of spaces that resist mapping have been created through indirect methods. The maps are wrong in systematic ways. The systematic wrongness is itself information.',
                 'The outsider taxonomy archive catalogs entities by behavior rather than biology. The taxonomist\'s methodology is sound. The entities they catalogued did not appreciate being studied.'],
      boss:     ['The planar overlord\'s throne is a geometrically impossible object that casts shadows in four directions simultaneously. Sitting in it provides perfect recall of every conversation held within one hundred feet for the past century.',
                 'The reality core is the original wound -- the first breach. Everything else in this location exists because of it. It is smaller than expected: six inches across, humming, and staring back.',
                 'The void sovereign\'s chamber exists at the intersection of three planes simultaneously. Objects in this room have three shadows. Sounds echo three ways. The sovereign occupies all three versions of the room at once.'],
      special:  ['A reality fracture zone where cause and effect are non-linear. Events that have not happened yet have left evidence. Evidence of events from the past is missing.',
                 'The temporal anomaly room has been visited more in the future than in the past. The guest registry, written in reverse chronological order, shows entries from dates that have not arrived yet.',
                 'A plane-bleed chamber where another reality is slowly overwriting this one. The process started in one corner and has moved six inches toward the center over the past year.'],
    },
  };

  // ── flavor text getter ────────────────────────────────────────────────────
  function getRoomFlavor(roomType, theme) {
    var themeKey = theme ? theme.replace(/\s.*/,'').toLowerCase() : 'classic';
    var themeMap = { stone:'classic', necromantic:'undead', arcane:'arcane', ancient:'nature', sacred:'divine', planar:'planar' };
    themeKey = themeMap[themeKey] || themeKey;
    var pool = (ROOM_FLAVOR[themeKey] && ROOM_FLAVOR[themeKey][roomType]) || (ROOM_FLAVOR.classic[roomType]);
    if (!pool || !pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ── Generate all flavor for a campaign ───────────────────────────────────
  function generateCampaignFlavor(campaign) {
    if (!campaign || !campaign.acts) return null;
    var results = [];
    campaign.acts.forEach(function(act) {
      var themeName = campaign.base && campaign.base.theme ? campaign.base.theme : 'classic';
      var actFlavors = {
        act: act.number,
        title: act.title,
        location: act.location,
        rooms: [],
      };
      var roomTypes = ['entry','combat','treasure','ritual','utility','library','boss','special'];
      var numRooms = 4 + Math.floor(Math.random() * 4);
      for (var i = 0; i < numRooms; i++) {
        var rtype = roomTypes[i % roomTypes.length];
        var flavor = getRoomFlavor(rtype, themeName);
        if (flavor) {
          actFlavors.rooms.push({ type: rtype, flavor: flavor });
        }
      }
      results.push(actFlavors);
    });
    return results;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. DRAWN SPRITES (canvas-drawn decor, no emoji)
  // ═══════════════════════════════════════════════════════════════════════════

  var Sprites = {
    // Each sprite: function(ctx, cx, cy, size, color, accentColor)
    // size is typically 10-18px radius

    altar: function(ctx, cx, cy, sz, col, acc) {
      var w = sz*1.6, h = sz*0.9;
      ctx.fillStyle = col;
      ctx.fillRect(cx-w/2, cy-h/2, w, h);
      ctx.fillStyle = acc;
      ctx.fillRect(cx-w/2, cy-h/2, w, 3);
      ctx.fillRect(cx-w/2, cy+h/2-3, w, 3);
      // candles
      for (var i=-1; i<=1; i+=2) {
        ctx.fillStyle = '#f5e6c8';
        ctx.fillRect(cx+i*sz*0.5-2, cy-h/2-8, 4, 8);
        ctx.fillStyle = '#ffcc44';
        ctx.beginPath(); ctx.arc(cx+i*sz*0.5, cy-h/2-9, 3, 0, Math.PI*2); ctx.fill();
      }
    },

    sarcophagus: function(ctx, cx, cy, sz, col, acc) {
      var w = sz*1.2, h = sz*2;
      ctx.fillStyle = col;
      // body
      ctx.beginPath();
      ctx.moveTo(cx-w/2, cy+h/2);
      ctx.lineTo(cx-w/2, cy-h/4);
      ctx.lineTo(cx, cy-h/2);
      ctx.lineTo(cx+w/2, cy-h/4);
      ctx.lineTo(cx+w/2, cy+h/2);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = acc; ctx.lineWidth = 2; ctx.stroke();
      // face carving
      ctx.fillStyle = acc;
      ctx.beginPath(); ctx.arc(cx, cy-h/6, sz*0.4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(cx, cy-h/6, sz*0.25, 0, Math.PI*2); ctx.fill();
    },

    weapon_rack: function(ctx, cx, cy, sz, col, acc) {
      // Rack frame
      ctx.strokeStyle = col; ctx.lineWidth = 3;
      ctx.strokeRect(cx-sz, cy-sz*0.8, sz*2, sz*1.6);
      // Weapons leaning
      var weapons = [[-0.6, -0.7, 0.5, 0.7], [-0.2, -0.65, 0.1, 0.65], [0.3, -0.7, -0.2, 0.7]];
      weapons.forEach(function(w) {
        ctx.beginPath();
        ctx.moveTo(cx+w[0]*sz, cy+w[1]*sz);
        ctx.lineTo(cx+w[2]*sz, cy+w[3]*sz);
        ctx.strokeStyle = acc; ctx.lineWidth = 2; ctx.stroke();
        // crossguard
        var mx = cx+(w[0]+w[2])/2*sz, my = cy+(w[1]+w[3])/2*sz;
        ctx.beginPath(); ctx.moveTo(mx-4,my); ctx.lineTo(mx+4,my);
        ctx.strokeStyle = acc; ctx.lineWidth = 2; ctx.stroke();
      });
    },

    brazier: function(ctx, cx, cy, sz, col, acc) {
      // tripod legs
      ctx.strokeStyle = col; ctx.lineWidth = 2;
      [[-0.5,0.7],[0,0.7],[0.5,0.7]].forEach(function(l) {
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+l[0]*sz, cy+l[1]*sz); ctx.stroke();
      });
      // bowl
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(cx, cy, sz*0.55, 0, Math.PI*2); ctx.fill();
      // fire
      ctx.fillStyle = '#ff6600';
      ctx.beginPath(); ctx.moveTo(cx-sz*0.3, cy); ctx.quadraticCurveTo(cx-sz*0.1, cy-sz*0.7, cx, cy-sz*0.9);
      ctx.quadraticCurveTo(cx+sz*0.1, cy-sz*0.7, cx+sz*0.3, cy); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath(); ctx.moveTo(cx-sz*0.15, cy); ctx.quadraticCurveTo(cx, cy-sz*0.5, cx, cy-sz*0.7);
      ctx.quadraticCurveTo(cx, cy-sz*0.5, cx+sz*0.15, cy); ctx.closePath(); ctx.fill();
    },

    chest: function(ctx, cx, cy, sz, col, acc) {
      var w = sz*1.4, h = sz*0.9;
      ctx.fillStyle = col;
      ctx.fillRect(cx-w/2, cy-h/4, w, h*0.7);
      // lid
      ctx.beginPath();
      ctx.moveTo(cx-w/2, cy-h/4);
      ctx.lineTo(cx-w/2, cy-h/2);
      ctx.arcTo(cx, cy-h*0.7, cx+w/2, cy-h/2, sz*0.3);
      ctx.lineTo(cx+w/2, cy-h/4);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = acc; ctx.lineWidth = 2; ctx.stroke();
      // lock
      ctx.fillStyle = '#c9973a';
      ctx.fillRect(cx-4, cy-h/4-4, 8, 8);
      ctx.fillStyle = acc;
      ctx.beginPath(); ctx.arc(cx, cy-h/4-2, 3, 0, Math.PI*2); ctx.fill();
    },

    bookshelf: function(ctx, cx, cy, sz, col, acc) {
      var w = sz*1.8, h = sz*1.4;
      ctx.fillStyle = col; ctx.fillRect(cx-w/2, cy-h/2, w, h);
      // shelves
      var colors = ['#8b1a1a','#1a5a1a','#1a1a8b','#8b6a1a','#4a1a5a'];
      var bookW = sz*0.2;
      var startX = cx - w/2 + 3;
      var shelfY = [cy-h/2+6, cy, cy+h/2-10];
      shelfY.forEach(function(sy) {
        ctx.fillStyle = acc; ctx.fillRect(cx-w/2, sy+8, w, 2);
        var bx = startX;
        while (bx < cx+w/2-bookW) {
          ctx.fillStyle = colors[Math.floor(Math.random()*colors.length)];
          var bh = 6 + Math.random()*6;
          ctx.fillRect(bx, sy+2, bookW-1, bh);
          bx += bookW;
        }
      });
    },

    table: function(ctx, cx, cy, sz, col, acc) {
      var w = sz*1.8, h = sz;
      // legs
      ctx.strokeStyle = col; ctx.lineWidth = 3;
      [[-0.75,0.3],[0.75,0.3],[-0.75,-0.1],[0.75,-0.1]].forEach(function(l) {
        ctx.beginPath(); ctx.moveTo(cx+l[0]*sz, cy+h*0.1); ctx.lineTo(cx+l[0]*sz, cy+l[1]*h+h*0.1); ctx.stroke();
      });
      // top
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(cx, cy-h*0.2, w/2, h*0.25, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = acc; ctx.lineWidth = 1.5; ctx.stroke();
    },

    throne: function(ctx, cx, cy, sz, col, acc) {
      var w = sz*1.4, h = sz*2;
      // seat
      ctx.fillStyle = col;
      ctx.fillRect(cx-w/2, cy, w, h*0.5);
      // back
      ctx.fillRect(cx-w/2, cy-h*0.6, w*0.18, h*0.6);
      ctx.fillRect(cx+w/2-w*0.18, cy-h*0.6, w*0.18, h*0.6);
      ctx.fillRect(cx-w/2, cy-h*0.6, w, h*0.2);
      // crown ornament
      ctx.fillStyle = acc;
      [-0.5,0,0.5].forEach(function(o) {
        ctx.beginPath(); ctx.moveTo(cx+o*sz*0.5, cy-h*0.6); ctx.lineTo(cx+o*sz*0.5-5, cy-h*0.6-8); ctx.lineTo(cx+o*sz*0.5+5, cy-h*0.6-8); ctx.closePath(); ctx.fill();
      });
      // cushion
      ctx.fillStyle = '#8b1a1a';
      ctx.fillRect(cx-w/2+4, cy+4, w-8, h*0.5-8);
    },

    pillar: function(ctx, cx, cy, sz, col, acc) {
      var r = sz*0.4;
      // base
      ctx.fillStyle = col; ctx.fillRect(cx-r*1.3, cy+sz*0.5, r*2.6, sz*0.3);
      // shaft
      var grad = ctx.createLinearGradient(cx-r, 0, cx+r, 0);
      grad.addColorStop(0, col); grad.addColorStop(0.4, acc); grad.addColorStop(1, col);
      ctx.fillStyle = grad; ctx.fillRect(cx-r, cy-sz*0.5, r*2, sz);
      // capital
      ctx.fillStyle = acc; ctx.fillRect(cx-r*1.3, cy-sz*0.5, r*2.6, sz*0.25);
    },

    arcane_circle: function(ctx, cx, cy, sz, col, acc) {
      ctx.strokeStyle = col; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, sz*0.9, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, sz*0.6, 0, Math.PI*2); ctx.stroke();
      var pts = 8;
      for (var i=0; i<pts; i++) {
        var a1 = (i/pts)*Math.PI*2, a2 = ((i+3)/pts)*Math.PI*2;
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(a1)*sz*0.9, cy+Math.sin(a1)*sz*0.9);
        ctx.lineTo(cx+Math.cos(a2)*sz*0.9, cy+Math.sin(a2)*sz*0.9);
        ctx.strokeStyle = acc; ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, sz*0.2, 0, Math.PI*2); ctx.fill();
    },

    cauldron: function(ctx, cx, cy, sz, col, acc) {
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(cx, cy, sz*0.7, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#1a2a0a';
      ctx.beginPath(); ctx.ellipse(cx, cy-sz*0.1, sz*0.55, sz*0.35, 0, 0, Math.PI*2); ctx.fill();
      // bubbles
      ctx.fillStyle = '#2aaa4a';
      [[0,-0.3],[0.3,-0.5],[-0.2,-0.45]].forEach(function(b) {
        ctx.beginPath(); ctx.arc(cx+b[0]*sz, cy+b[1]*sz, sz*0.12, 0, Math.PI*2); ctx.fill();
      });
      ctx.strokeStyle = acc; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx-sz*0.6, cy-sz*0.2); ctx.lineTo(cx+sz*0.6, cy-sz*0.2); ctx.stroke();
    },

    fountain: function(ctx, cx, cy, sz, col, acc) {
      // basin
      ctx.strokeStyle = col; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(cx, cy+sz*0.2, sz*0.9, sz*0.4, 0, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = '#4a7aaa66'; ctx.fill();
      // column
      ctx.fillStyle = col; ctx.fillRect(cx-4, cy-sz*0.5, 8, sz*0.7);
      // water top
      ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(cx, cy-sz*0.5, sz*0.3, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#4a7aaa'; ctx.lineWidth = 1.5;
      [[-0.2,-0.1],[0.2,-0.1],[0,-0.2]].forEach(function(d) {
        ctx.beginPath(); ctx.moveTo(cx, cy-sz*0.5); ctx.quadraticCurveTo(cx+d[0]*sz*0.5, cy-sz*0.2, cx+d[0]*sz, cy); ctx.stroke();
      });
    },

    bones: function(ctx, cx, cy, sz, col, acc) {
      ctx.strokeStyle = col; ctx.lineWidth = 3;
      // skull
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy-sz*0.4, sz*0.35, 0, Math.PI*2); ctx.fill();
      // crossed bones
      [[0.7,0.3,-0.7,-0.3],[0.7,-0.3,-0.7,0.3]].forEach(function(b) {
        ctx.beginPath(); ctx.moveTo(cx+b[0]*sz, cy+b[1]*sz); ctx.lineTo(cx+b[2]*sz, cy+b[3]*sz); ctx.stroke();
        [[b[0],b[1]],[b[2],b[3]]].forEach(function(e) {
          ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx+e[0]*sz, cy+e[1]*sz, sz*0.15, 0, Math.PI*2); ctx.fill();
        });
      });
    },

    crystal: function(ctx, cx, cy, sz, col, acc) {
      var pts = [[0,-sz*1.1],[sz*0.5,-sz*0.3],[sz*0.4,sz*0.7],[0,sz*0.5],[-sz*0.4,sz*0.7],[-sz*0.5,-sz*0.3]];
      ctx.beginPath(); ctx.moveTo(cx+pts[0][0], cy+pts[0][1]);
      for (var i=1; i<pts.length; i++) ctx.lineTo(cx+pts[i][0], cy+pts[i][1]);
      ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      ctx.strokeStyle = acc; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.globalAlpha = 0.4; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(cx, cy-sz*1.1); ctx.lineTo(cx-sz*0.15, cy-sz*0.5); ctx.lineTo(cx+sz*0.1, cy-sz*0.7); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    },

    torch_wall: function(ctx, cx, cy, sz, col, acc) {
      // bracket
      ctx.strokeStyle = col; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx-sz*0.3, cy); ctx.lineTo(cx, cy-sz*0.3); ctx.lineTo(cx+sz*0.15, cy-sz*0.3); ctx.stroke();
      // torch body
      ctx.fillStyle = col; ctx.fillRect(cx+sz*0.05, cy-sz*0.3-sz*0.5, sz*0.2, sz*0.5);
      // flame
      ctx.fillStyle = '#ff6600';
      ctx.beginPath(); ctx.moveTo(cx+sz*0.05, cy-sz*0.8); ctx.quadraticCurveTo(cx+sz*0.15, cy-sz*1.1, cx+sz*0.15, cy-sz*1.3);
      ctx.quadraticCurveTo(cx+sz*0.2, cy-sz*1.0, cx+sz*0.25, cy-sz*0.8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath(); ctx.moveTo(cx+sz*0.08, cy-sz*0.8); ctx.quadraticCurveTo(cx+sz*0.15, cy-sz*1.0, cx+sz*0.15, cy-sz*1.15);
      ctx.quadraticCurveTo(cx+sz*0.2, cy-sz*0.95, cx+sz*0.22, cy-sz*0.8); ctx.closePath(); ctx.fill();
    },

    tapestry: function(ctx, cx, cy, sz, col, acc) {
      var w = sz*1.4, h = sz*1.8;
      ctx.fillStyle = '#8b1a1a'; ctx.fillRect(cx-w/2, cy-h/2, w, h);
      // border
      ctx.strokeStyle = acc; ctx.lineWidth = 2; ctx.strokeRect(cx-w/2+3, cy-h/2+3, w-6, h-6);
      // pattern: diamond
      ctx.fillStyle = acc;
      ctx.beginPath(); ctx.moveTo(cx, cy-sz*0.5); ctx.lineTo(cx+sz*0.4, cy); ctx.lineTo(cx, cy+sz*0.5); ctx.lineTo(cx-sz*0.4, cy); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8b1a1a'; ctx.beginPath(); ctx.arc(cx, cy, sz*0.15, 0, Math.PI*2); ctx.fill();
      // fringe
      for (var fi=-3; fi<=3; fi++) {
        ctx.strokeStyle = acc; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx+fi*sz*0.2, cy+h/2); ctx.lineTo(cx+fi*sz*0.2, cy+h/2+sz*0.3); ctx.stroke();
      }
    },

    mushroom: function(ctx, cx, cy, sz, col, acc) {
      ctx.fillStyle = col; ctx.fillRect(cx-4, cy-sz*0.3, 8, sz*0.8);
      ctx.fillStyle = '#aa2222';
      ctx.beginPath(); ctx.ellipse(cx, cy-sz*0.4, sz*0.7, sz*0.5, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#fff';
      [[0,-0.6],[0.4,-0.3],[-0.35,-0.4]].forEach(function(d) {
        ctx.beginPath(); ctx.arc(cx+d[0]*sz, cy+d[1]*sz, sz*0.1, 0, Math.PI*2); ctx.fill();
      });
    },

    void_obelisk: function(ctx, cx, cy, sz, col, acc) {
      var w = sz*0.4, h = sz*2;
      ctx.fillStyle = col; ctx.fillRect(cx-w/2, cy-h/2, w, h);
      ctx.beginPath(); ctx.moveTo(cx-w/2, cy-h/2); ctx.lineTo(cx, cy-h/2-sz*0.4); ctx.lineTo(cx+w/2, cy-h/2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = acc; ctx.lineWidth = 1;
      for (var oi=0; oi<4; oi++) { var oy = cy-h/2+oi*(h/4); ctx.strokeRect(cx-w/2+2, oy+2, w-4, h/4-4); }
      ctx.fillStyle = acc; ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.arc(cx, cy, sz*0.25, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    },

    planar_rift: function(ctx, cx, cy, sz, col, acc) {
      ctx.save();
      ctx.shadowColor = acc; ctx.shadowBlur = 10;
      ctx.strokeStyle = acc; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, cy-sz); ctx.bezierCurveTo(cx+sz*0.5, cy-sz*0.3, cx-sz*0.5, cy+sz*0.3, cx, cy+sz); ctx.stroke();
      ctx.lineWidth = 1.5; ctx.strokeStyle = col;
      ctx.beginPath(); ctx.moveTo(cx-sz*0.15, cy-sz*0.7); ctx.bezierCurveTo(cx+sz*0.3, cy-sz*0.2, cx-sz*0.3, cy+sz*0.2, cx+sz*0.15, cy+sz*0.7); ctx.stroke();
      ctx.restore();
    },

  };

  // Map feature name -> sprite function
  var SPRITE_MAP = {
    'Stone Altar': Sprites.altar, 'Necrotic Altar': Sprites.altar, 'Grand Altar': Sprites.altar,
    'Stone Sarcophagus': Sprites.sarcophagus, 'Bone Throne': Sprites.throne,
    'Weapon Rack': Sprites.weapon_rack, 'Iron Brazier': Sprites.brazier, 'Sacred Flame': Sprites.brazier,
    'Coin Pile': Sprites.chest, 'Trophy Wall': Sprites.weapon_rack,
    'Bookshelf': Sprites.bookshelf, 'Scroll Rack': Sprites.bookshelf,
    'Arcane Circle': Sprites.arcane_circle, 'Binding Rune': Sprites.arcane_circle, 'Necromancy Circle': Sprites.arcane_circle,
    'Crystal Pillar': Sprites.crystal, 'Cave Crystal': Sprites.crystal, 'Reality Crystal': Sprites.crystal,
    'Bone Pile': Sprites.bones, 'Corpse Pile': Sprites.bones, 'Predator\'s Kill': Sprites.bones,
    'Holy Font': Sprites.fountain, 'Underground Spring': Sprites.fountain,
    'Magical Apparatus': Sprites.cauldron, 'Failed Experiment': Sprites.cauldron,
    'Tapestry': Sprites.tapestry, 'Divine Mosaic': Sprites.tapestry,
    'Mushroom Cluster': Sprites.mushroom, 'Glowing Moss': Sprites.mushroom,
    'Void Obelisk': Sprites.void_obelisk, 'Dimensional Anchor': Sprites.void_obelisk,
    'Planar Rift': Sprites.planar_rift, 'Ley Line Node': Sprites.planar_rift,
    'Iron Portcullis': Sprites.pillar, 'Crystal Pillar': Sprites.pillar,
    'Incense Burner': Sprites.brazier, 'Black Candles': Sprites.brazier,
    'Iron Brazier': Sprites.brazier, 'Funeral Pyre': Sprites.brazier,
  };

  function drawSprite(ctx, cx, cy, type, theme) {
    var spriteFn = SPRITE_MAP[type];
    var col = theme ? theme.featureFill : '#5a4a2a';
    var acc = theme ? theme.accentColor : '#c9973a';
    ctx.save();
    if (spriteFn) {
      spriteFn(ctx, cx, cy, 8, col, acc);
    } else {
      // fallback: simple circle with letter
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = acc; ctx.font = '7px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText((type||'?')[0], cx, cy);
    }
    ctx.restore();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. SOCIAL SCENE ROOM MAPS
  // ═══════════════════════════════════════════════════════════════════════════

  var SOCIAL_ROOM_TYPES = {
    tavern: {
      name: 'The Tavern',
      wallFill: '#3a2518', floorBase: '#8a6a40', floorAlt: '#7a5e38',
      accentColor: '#c9973a',
      furniture: 'warm',
      desc: 'Long tables, a bar counter, a hearth, stairs to upper rooms. Every surface holds secrets.',
    },
    throne_room: {
      name: 'Throne Room',
      wallFill: '#1a1206', floorBase: '#c8b070', floorAlt: '#b8a060',
      accentColor: '#d4a030',
      furniture: 'regal',
      desc: 'The seat of power. Banners, guards, supplicants. Everything is designed to intimidate.',
    },
    market: {
      name: 'Market Square',
      wallFill: '#4a3a1a', floorBase: '#9a8a60', floorAlt: '#8a7a50',
      accentColor: '#7a9a1a',
      furniture: 'crowded',
      desc: 'Stalls, crowds, noise. The perfect place for a discreet conversation -- or a public scene.',
    },
    courtyard: {
      name: 'Courtyard',
      wallFill: '#2a3a1a', floorBase: '#5a7a3a', floorAlt: '#4a6a2a',
      accentColor: '#8aaa4a',
      furniture: 'sparse',
      desc: 'Open sky, stone walls. The kind of place where meetings happen that cannot be overheard inside.',
    },
    great_hall: {
      name: 'Great Hall',
      wallFill: '#1a1a1a', floorBase: '#4a3a2a', floorAlt: '#3a2a1a',
      accentColor: '#8a6a30',
      furniture: 'grand',
      desc: 'Long banquet tables, hunting trophies, a massive hearth. Influence and feasting intertwined.',
    },
    garden: {
      name: 'Noble Garden',
      wallFill: '#1a3a1a', floorBase: '#4a7a3a', floorAlt: '#3a6a2a',
      accentColor: '#aad060',
      furniture: 'garden',
      desc: 'Sculpted hedges, stone paths, a reflecting pool. Privacy in plain sight.',
    },
    interrogation: {
      name: 'Interrogation Room',
      wallFill: '#1a1008', floorBase: '#4a3a28', floorAlt: '#3a2a18',
      accentColor: '#8b1a1a',
      furniture: 'sparse',
      desc: 'One chair. One light source. No windows. The room does half the work.',
    },
    library_social: {
      name: 'Private Library',
      wallFill: '#1a1206', floorBase: '#6a5038', floorAlt: '#5a4028',
      accentColor: '#c9973a',
      furniture: 'scholar',
      desc: 'Floor-to-ceiling shelves, a reading table, a decanter. Knowledge as power, shared carefully.',
    },
  };

  function generateSocialRoomMap(canvas, socialEncounter, campaign) {
    if (!canvas) return;
    var W = canvas.width, H = canvas.height;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pick room type from social encounter template name
    var roomKey = 'tavern';
    if (socialEncounter) {
      var name = (socialEncounter.template || '').toLowerCase();
      if (name.includes('throne') || name.includes('audience') || name.includes('court')) roomKey = 'throne_room';
      else if (name.includes('market') || name.includes('public') || name.includes('confrontation')) roomKey = 'market';
      else if (name.includes('garden') || name.includes('courtyard')) roomKey = 'courtyard';
      else if (name.includes('hall') || name.includes('feast') || name.includes('banquet')) roomKey = 'great_hall';
      else if (name.includes('interrogation') || name.includes('private')) roomKey = 'interrogation';
      else if (name.includes('library') || name.includes('study') || name.includes('interview')) roomKey = 'library_social';
    }

    var room = SOCIAL_ROOM_TYPES[roomKey];
    var CELL = Math.min(24, Math.floor(H / 20));
    var COLS = Math.floor(W / CELL);
    var ROWS = Math.floor(H / CELL);

    // Seed from encounter name
    var seedStr = (socialEncounter && socialEncounter.npcName) || 'social';
    var seed = seedStr.split('').reduce(function(a,c){return a+c.charCodeAt(0);}, 42);
    var s = seed >>> 0;
    var rng = function() {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      var t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };

    // ── Draw room background ──────────────────────────────────────────────
    ctx.fillStyle = room.wallFill;
    ctx.fillRect(0, 0, W, H);

    // Room bounds (leave wall border)
    var wallT = 2, wallB = ROWS-2, wallL = 2, wallR = COLS-2;
    for (var r = wallT; r < wallB; r++) {
      for (var c = wallL; c < wallR; c++) {
        // Checkerboard floor
        var isAlt = (r+c) % 2 === 0;
        ctx.fillStyle = isAlt ? room.floorBase : room.floorAlt;
        ctx.fillRect(c*CELL, r*CELL, CELL, CELL);
        // Grout lines
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(c*CELL, r*CELL, CELL, CELL);
        // Occasional tile wear
        if (rng() < 0.04) {
          ctx.fillStyle = 'rgba(0,0,0,0.08)';
          ctx.fillRect(c*CELL+2, r*CELL+2, CELL-4, CELL-4);
        }
      }
    }

    // ── Wall details ──────────────────────────────────────────────────────
    // Top/bottom walls
    ctx.fillStyle = room.wallFill;
    for (var wc = 0; wc < COLS; wc++) {
      ctx.fillRect(wc*CELL, 0, CELL, wallT*CELL);
      ctx.fillRect(wc*CELL, wallB*CELL, CELL, (ROWS-wallB)*CELL);
    }
    for (var wr = 0; wr < ROWS; wr++) {
      ctx.fillRect(0, wr*CELL, wallL*CELL, CELL);
      ctx.fillRect(wallR*CELL, wr*CELL, (COLS-wallR)*CELL, CELL);
    }

    // Wall edge (thick inner line)
    ctx.strokeStyle = room.accentColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(wallL*CELL, wallT*CELL, (wallR-wallL)*CELL, (wallB-wallT)*CELL);

    // ── Draw furniture by type ────────────────────────────────────────────
    drawSocialFurniture(ctx, room, roomKey, CELL, COLS, ROWS, wallL, wallT, wallR, wallB, rng, socialEncounter);

    // ── Door(s) ────────────────────────────────────────────────────────────
    var doorCount = roomKey === 'interrogation' ? 1 : 2;
    for (var di = 0; di < doorCount; di++) {
      var dside = di === 0 ? 'bottom' : 'left';
      var dcell = dside === 'bottom' ? Math.floor(COLS/2 + (di-0.5)*3) : Math.floor(ROWS/2);
      drawSocialDoor(ctx, dside, dcell, CELL, wallL, wallT, wallR, wallB, room);
    }

    // ── Border and title ──────────────────────────────────────────────────
    ctx.strokeStyle = room.accentColor; ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, W-4, H-4);

    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    var title = room.name + (socialEncounter && socialEncounter.npcName ? ' — ' + socialEncounter.npcName : '');
    ctx.font = 'bold 11px Georgia,serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    var tw = ctx.measureText(title).width;
    roundFill(ctx, 6, 6, tw+14, 18, 3);
    ctx.fillStyle = room.accentColor; ctx.fillText(title, 13, 9);

    // ── Scale ────────────────────────────────────────────────────────────
    ctx.font = '9px Georgia,serif'; ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('1 sq = 5 ft', 8, H-18);

    // ── Room description ──────────────────────────────────────────────────
    ctx.font = 'italic 9px Georgia,serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
    ctx.fillText(room.desc, W-8, H-4);
  }

  function drawSocialFurniture(ctx, room, roomKey, CELL, COLS, ROWS, wL, wT, wR, wB, rng, encounter) {
    var cw = (wR-wL)*CELL, ch = (wB-wT)*CELL;
    var ox = wL*CELL, oy = wT*CELL;
    var cx = ox+cw/2, cy = oy+ch/2;
    var acc = room.accentColor;
    var col = room.wallFill;

    if (roomKey === 'tavern') {
      // Bar counter along top wall
      ctx.fillStyle = '#5a3a18'; ctx.fillRect(ox+CELL, oy+CELL*0.5, cw-CELL*2, CELL*1.2);
      ctx.fillStyle = '#7a5a28'; ctx.fillRect(ox+CELL, oy+CELL*0.5, cw-CELL*2, CELL*0.3);
      // Stools
      for (var si=0; si<5; si++) {
        var sx = ox + CELL*1.5 + si*(cw-CELL*3)/4;
        ctx.fillStyle = '#4a2a10'; ctx.beginPath(); ctx.arc(sx, oy+CELL*2.2, CELL*0.4, 0, Math.PI*2); ctx.fill();
      }
      // Long tables
      [oy+ch*0.45, oy+ch*0.7].forEach(function(ty) {
        ctx.fillStyle = '#6a4a20'; ctx.fillRect(ox+CELL*2, ty-CELL*0.4, cw-CELL*4, CELL*0.8);
        // Benches
        ctx.fillStyle = '#4a3010'; ctx.fillRect(ox+CELL*2, ty-CELL*0.9, cw-CELL*4, CELL*0.35);
        ctx.fillRect(ox+CELL*2, ty+CELL*0.55, cw-CELL*4, CELL*0.35);
        // Cups/items on table
        for (var ti=0; ti<4; ti++) {
          var tx = ox+CELL*2.5+ti*(cw-CELL*5)/3;
          ctx.fillStyle = '#8b4a1a'; ctx.beginPath(); ctx.arc(tx, ty, CELL*0.2, 0, Math.PI*2); ctx.fill();
        }
      });
      // Hearth
      ctx.fillStyle = '#3a2018'; ctx.fillRect(cx-CELL, oy+CELL*0.2, CELL*2, CELL*1.5);
      ctx.fillStyle = '#ff6600'; ctx.beginPath(); ctx.ellipse(cx, oy+CELL*1, CELL*0.6, CELL*0.4, 0, 0, Math.PI*2); ctx.fill();
      // NPC marker (the contact)
      drawNPCMarker(ctx, cx-CELL*3, cy, '#8b1a1a', 'NPC', CELL);
      // Party entry marker
      drawNPCMarker(ctx, cx, oy+ch-CELL*1.5, '#1a5a1a', 'PARTY', CELL);

    } else if (roomKey === 'throne_room') {
      // Throne at top center
      ctx.fillStyle = '#8b6a10'; ctx.fillRect(cx-CELL*1.2, oy+CELL, CELL*2.4, CELL*1.5);
      ctx.fillStyle = '#8b1a1a'; ctx.fillRect(cx-CELL, oy+CELL*1.2, CELL*2, CELL);
      ctx.fillStyle = '#d4a030';
      for (var pi=-1; pi<=1; pi++) { ctx.beginPath(); ctx.arc(cx+pi*CELL*0.5, oy+CELL, 5, 0, Math.PI*2); ctx.fill(); }
      // Pillars
      [[cx-CELL*3, oy+ch*0.4],[cx+CELL*3, oy+ch*0.4],[cx-CELL*3, oy+ch*0.7],[cx+CELL*3, oy+ch*0.7]].forEach(function(p) {
        Sprites.pillar(ctx, p[0], p[1], 8, '#7a6a50', acc);
      });
      // Red carpet
      ctx.fillStyle = '#6a0a0a'; ctx.globalAlpha = 0.5;
      ctx.fillRect(cx-CELL*0.7, oy, CELL*1.4, ch);
      ctx.globalAlpha = 1;
      // Guards
      [[cx-CELL*2, oy+CELL*2],[cx+CELL*2, oy+CELL*2]].forEach(function(g) {
        drawNPCMarker(ctx, g[0], g[1], '#4a4a4a', 'GRD', CELL);
      });
      drawNPCMarker(ctx, cx, oy+CELL*1.8, '#8b1a1a', 'NPC', CELL);
      drawNPCMarker(ctx, cx, oy+ch-CELL*2, '#1a5a1a', 'PARTY', CELL);

    } else if (roomKey === 'market') {
      // Stalls grid
      var stalls = [[0.2,0.2],[0.5,0.2],[0.8,0.2],[0.15,0.6],[0.5,0.6],[0.85,0.6]];
      stalls.forEach(function(s) {
        var sx = ox + s[0]*cw, sy = oy + s[1]*ch;
        ctx.fillStyle = ['#8b3a1a','#1a5a3a','#1a3a8b','#8b8b1a'][Math.floor(rng()*4)];
        ctx.fillRect(sx-CELL*1.2, sy-CELL*0.8, CELL*2.4, CELL*1.2);
        ctx.fillStyle = '#c9973a'; ctx.fillRect(sx-CELL*1.2, sy-CELL*0.8, CELL*2.4, CELL*0.3);
      });
      // Crowd
      for (var ci=0; ci<8; ci++) {
        var cpx = ox+CELL+rng()*(cw-CELL*2), cpy = oy+CELL+rng()*(ch-CELL*2);
        ctx.fillStyle = 'rgba(180,160,120,0.5)';
        ctx.beginPath(); ctx.arc(cpx, cpy, CELL*0.3, 0, Math.PI*2); ctx.fill();
      }
      drawNPCMarker(ctx, ox+cw*0.5, oy+ch*0.4, '#8b1a1a', 'NPC', CELL);
      drawNPCMarker(ctx, ox+cw*0.3, oy+ch*0.75, '#1a5a1a', 'PARTY', CELL);

    } else if (roomKey === 'interrogation') {
      // Single chair center
      ctx.fillStyle = '#3a2018'; ctx.fillRect(cx-CELL*0.5, cy-CELL*0.4, CELL, CELL*0.9);
      ctx.fillRect(cx-CELL*0.5, cy-CELL*1, CELL, CELL*0.7);
      // Hanging lamp
      ctx.strokeStyle = '#8b6a1a'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, oy); ctx.lineTo(cx, cy-CELL*2); ctx.stroke();
      ctx.fillStyle = '#ffcc44'; ctx.beginPath(); ctx.arc(cx, cy-CELL*2, CELL*0.5, 0, Math.PI*2); ctx.fill();
      // Small table
      ctx.fillStyle = '#4a3018'; ctx.fillRect(cx+CELL*1.5, cy-CELL*0.4, CELL*2, CELL*0.8);
      drawNPCMarker(ctx, cx+CELL*2.5, cy+CELL, '#8b1a1a', 'INT', CELL);
      drawNPCMarker(ctx, cx, cy+CELL*0.3, '#1a5a1a', 'TGT', CELL);

    } else if (roomKey === 'great_hall') {
      // Massive table
      ctx.fillStyle = '#5a3a18'; ctx.fillRect(ox+CELL*2, cy-CELL*0.6, cw-CELL*4, CELL*1.2);
      // Chairs along sides
      for (var chi=0; chi<5; chi++) {
        var chx = ox+CELL*2.5+chi*(cw-CELL*5)/4;
        ctx.fillStyle = '#3a2010';
        ctx.fillRect(chx-CELL*0.3, cy-CELL*1.1, CELL*0.6, CELL*0.6);
        ctx.fillRect(chx-CELL*0.3, cy+CELL*0.7, CELL*0.6, CELL*0.6);
      }
      // Hearth
      ctx.fillStyle = '#2a1808'; ctx.fillRect(cx-CELL*1.5, oy+CELL*0.5, CELL*3, CELL*1.5);
      ctx.fillStyle = '#ff4400'; ctx.beginPath(); ctx.ellipse(cx, oy+CELL*1.5, CELL*0.9, CELL*0.5, 0, 0, Math.PI*2); ctx.fill();
      // Trophy mounts on walls
      [ox+CELL*2, ox+CELL*5, cx, ox+cw-CELL*5, ox+cw-CELL*2].forEach(function(tx) {
        ctx.fillStyle = '#5a3a18'; ctx.fillRect(tx-CELL*0.5, oy+CELL*0.2, CELL, CELL*0.8);
      });
      drawNPCMarker(ctx, cx-CELL*2, cy, '#8b1a1a', 'NPC', CELL);
      drawNPCMarker(ctx, cx+CELL*2, cy, '#1a5a1a', 'PARTY', CELL);

    } else if (roomKey === 'garden') {
      // Hedges (green blocks)
      [[0.1,0.1,0.25,0.7],[0.65,0.1,0.25,0.7],[0.1,0.1,0.8,0.15],[0.1,0.75,0.8,0.15]].forEach(function(h) {
        ctx.fillStyle = '#2a5a1a'; ctx.fillRect(ox+h[0]*cw, oy+h[1]*ch, h[2]*cw, h[3]*ch);
        // Hedge detail
        ctx.fillStyle = '#3a7a2a';
        for (var hd=0; hd<6; hd++) { ctx.beginPath(); ctx.arc(ox+h[0]*cw+rng()*h[2]*cw, oy+h[1]*ch+rng()*h[3]*ch, 5, 0, Math.PI*2); ctx.fill(); }
      });
      // Reflecting pool
      ctx.fillStyle = '#2a5a7a';
      ctx.beginPath(); ctx.ellipse(cx, cy+ch*0.1, CELL*2, CELL*1.2, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(100,180,220,0.3)'; ctx.fill();
      // Bench
      ctx.fillStyle = '#9a8a70'; ctx.fillRect(cx-CELL*1.2, cy-ch*0.2, CELL*2.4, CELL*0.5);
      drawNPCMarker(ctx, cx-CELL*1.5, cy, '#8b1a1a', 'NPC', CELL);
      drawNPCMarker(ctx, cx+CELL*1.5, cy, '#1a5a1a', 'PARTY', CELL);

    } else if (roomKey === 'library_social') {
      // Bookshelves on walls
      [[ox+CELL*0.3, oy+CELL, CELL*0.8, ch-CELL*2],[ox+cw-CELL*1.1, oy+CELL, CELL*0.8, ch-CELL*2]].forEach(function(b) {
        Sprites.bookshelf(ctx, b[0]+CELL*0.4, b[1]+b[3]/2, 16, '#4a3018', acc);
      });
      // Reading table
      ctx.fillStyle = '#5a3a18'; ctx.fillRect(cx-CELL*2, cy-CELL*0.5, CELL*4, CELL);
      ctx.fillStyle = '#3a2010';
      ctx.fillRect(cx-CELL*1.5, cy-CELL*1, CELL*1.2, CELL*0.5);
      ctx.fillRect(cx+CELL*0.3, cy-CELL*1, CELL*1.2, CELL*0.5);
      // Candles
      [cx-CELL*1.5, cx+CELL*1.5].forEach(function(cd) {
        ctx.fillStyle = '#f5e6c8'; ctx.fillRect(cd-2, cy-CELL*0.4, 4, CELL*0.5);
        ctx.fillStyle = '#ffcc44'; ctx.beginPath(); ctx.arc(cd, cy-CELL*0.4, 3, 0, Math.PI*2); ctx.fill();
      });
      drawNPCMarker(ctx, cx-CELL*1.5, cy+CELL, '#8b1a1a', 'NPC', CELL);
      drawNPCMarker(ctx, cx+CELL*1.5, cy+CELL, '#1a5a1a', 'PARTY', CELL);
    }

    // Cover objects (barrels, pillars etc for action scenes)
    var coverPos = [[ox+CELL*1.5, oy+ch*0.5],[ox+cw-CELL*1.5, oy+ch*0.5]];
    coverPos.forEach(function(cp) {
      ctx.fillStyle = '#5a4a2a';
      ctx.beginPath(); ctx.arc(cp[0], cp[1], CELL*0.45, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 1.5; ctx.stroke();
    });
  }

  function drawNPCMarker(ctx, x, y, color, label, CELL) {
    var r = CELL * 0.55;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    // Head
    ctx.fillStyle = 'rgba(240,210,170,0.9)';
    ctx.beginPath(); ctx.arc(x, y-r*0.3, r*0.4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 7px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(label, x, y+r+2);
  }

  function drawSocialDoor(ctx, side, cell, CELL, wL, wT, wR, wB, room) {
    var x, y, isH;
    if (side === 'bottom') { x = cell*CELL; y = wB*CELL; isH = true; }
    else { x = wL*CELL; y = cell*CELL; isH = false; }
    ctx.fillStyle = room.accentColor === '#8aaa4a' ? '#5a7a2a' : '#6a4820';
    if (isH) ctx.fillRect(x-CELL*0.6, y-4, CELL*1.2, 6);
    else ctx.fillRect(x-4, y-CELL*0.6, 6, CELL*1.2);
  }

  function roundFill(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
    ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
    ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
    ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
    ctx.closePath(); ctx.fill();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. ENVIRONMENT MAPS
  // ═══════════════════════════════════════════════════════════════════════════

  var ENV_TYPES = {
    forest: {
      name: 'Dense Woodland',
      bg: '#0d1a08', ground: '#2a4a1a', groundAlt: '#1e3a12',
      accent: '#6aaa4a', hazardColor: '#aa4a1a',
      features: ['Ancient Oak (Difficult)','Hollow Log (Cover)','Stream Crossing','Mushroom Ring','Deadfall (Hazard)','Fallen Tree (Barrier)','Thicket (Dense Cover)','Deer Trail'],
    },
    cave: {
      name: 'Cave System',
      bg: '#080808', ground: '#2a2520', groundAlt: '#1e1a15',
      accent: '#6a5a4a', hazardColor: '#4a6a8a',
      features: ['Stalactites (Falling Hazard)','Underground Pool','Crystal Formation','Narrow Passage','Sinkhole (Pitfall)','Rock Column (Cover)','Bat Roost','Mineral Vein'],
    },
    swamp: {
      name: 'Bogland',
      bg: '#0a1208', ground: '#2a3a1a', groundAlt: '#1e2a12',
      accent: '#5a8a3a', hazardColor: '#4a6a1a',
      features: ['Deep Bog (Hazard)','Cypress Grove','Quicksand Patch','Hag\'s Hut','Will-O-Wisp Zone','Twisted Roots (Cover)','Stagnant Pool','Vine Tangle'],
    },
    coastal: {
      name: 'Coastal Ruins',
      bg: '#08101a', ground: '#2a3a4a', groundAlt: '#1e2a3a',
      accent: '#4a8a9a', hazardColor: '#9a7a2a',
      features: ['Tidal Pool','Crumbling Arch','Sea Cave','Kelp Beds','Sunken Statue','Wave-Cut Ledge','Driftwood Barrier','Tide Channels'],
    },
    urban: {
      name: 'City District',
      bg: '#151008', ground: '#4a4030', groundAlt: '#3a3025',
      accent: '#8a7a50', hazardColor: '#8b1a1a',
      features: ['Market Stalls','Back Alley','Rooftop Path','Sewer Grate','Crowded Square','Guard Post','Collapsed Building','Fountain Plaza'],
    },
    mountain: {
      name: 'Mountain Pass',
      bg: '#0a0808', ground: '#3a3028', groundAlt: '#2a2218',
      accent: '#7a6a5a', hazardColor: '#9a9aaa',
      features: ['Boulder Field','Narrow Ledge (Acro DC 16)','Rockslide Zone','Snow Bridge','Mountain Shrine','Ice Shelf','Crevasse','Wind Tunnel'],
    },
    planar: {
      name: 'Planar Expanse',
      bg: '#050510', ground: '#1a1a3a', groundAlt: '#12122a',
      accent: '#6a40ff', hazardColor: '#ff40aa',
      features: ['Reality Fissure','Floating Platform','Gravity Inversion','Void Pool','Astral Current','Crystal Spire','Temporal Echo Zone','Outsider Nest'],
    },
  };

  function generateEnvironmentMap(canvas, act, campaign) {
    if (!canvas) return;
    var W = canvas.width, H = canvas.height;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pick environment type from act data
    var envKey = 'forest';
    if (act) {
      var loc = ((act.location || '') + ' ' + (act.environment && act.environment.terrain ? act.environment.terrain.join(' ') : '')).toLowerCase();
      if (loc.includes('cave') || loc.includes('underground') || loc.includes('mine')) envKey = 'cave';
      else if (loc.includes('swamp') || loc.includes('marsh') || loc.includes('bog')) envKey = 'swamp';
      else if (loc.includes('coast') || loc.includes('sea') || loc.includes('ruin')) envKey = 'coastal';
      else if (loc.includes('city') || loc.includes('town') || loc.includes('urban') || loc.includes('street')) envKey = 'urban';
      else if (loc.includes('mountain') || loc.includes('peak') || loc.includes('pass')) envKey = 'mountain';
      else if (loc.includes('planar') || loc.includes('void') || loc.includes('astral')) envKey = 'planar';
    }

    var env = ENV_TYPES[envKey];
    var CELL = Math.min(32, Math.floor(H / 18));

    var seedStr = (act && act.location) || envKey;
    var seed = seedStr.split('').reduce(function(a,c){return a+c.charCodeAt(0);}, 99);
    var s = seed >>> 0;
    var rng = function() {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      var t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };

    var COLS = Math.floor(W / CELL), ROWS = Math.floor(H / CELL);

    // ── Base ground ──────────────────────────────────────────────────────
    ctx.fillStyle = env.bg; ctx.fillRect(0, 0, W, H);

    // Draw irregular terrain patches
    for (var pr = 0; pr < ROWS; pr++) {
      for (var pc = 0; pc < COLS; pc++) {
        var noise = Math.sin(pc*0.7+pr*1.1)*0.5 + Math.cos(pc*1.3-pr*0.8)*0.5;
        ctx.fillStyle = noise > 0 ? env.ground : env.groundAlt;
        ctx.fillRect(pc*CELL, pr*CELL, CELL, CELL);
        // Texture
        if (rng() < 0.06) {
          ctx.fillStyle = 'rgba(255,255,255,0.03)';
          ctx.fillRect(pc*CELL+rng()*CELL*0.5, pr*CELL+rng()*CELL*0.5, 4, 4);
        }
      }
    }

    // ── Environment-specific terrain features ────────────────────────────
    if (envKey === 'forest') drawForestTerrain(ctx, W, H, CELL, COLS, ROWS, env, rng);
    else if (envKey === 'cave') drawCaveTerrain(ctx, W, H, CELL, COLS, ROWS, env, rng);
    else if (envKey === 'swamp') drawSwampTerrain(ctx, W, H, CELL, COLS, ROWS, env, rng);
    else if (envKey === 'coastal') drawCoastalTerrain(ctx, W, H, CELL, COLS, ROWS, env, rng);
    else if (envKey === 'urban') drawUrbanTerrain(ctx, W, H, CELL, COLS, ROWS, env, rng);
    else if (envKey === 'mountain') drawMountainTerrain(ctx, W, H, CELL, COLS, ROWS, env, rng);
    else if (envKey === 'planar') drawPlanarTerrain(ctx, W, H, CELL, COLS, ROWS, env, rng);

    // ── Hazard markers ───────────────────────────────────────────────────
    var numHazards = 3 + Math.floor(rng()*3);
    for (var hi=0; hi<numHazards; hi++) {
      var hx = CELL*2 + rng()*(W-CELL*4), hy = CELL*2 + rng()*(H-CELL*4);
      drawHazardMarker(ctx, hx, hy, env.features[hi % env.features.length], env, CELL);
    }

    // ── Party start zone ─────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(26,90,26,0.25)';
    ctx.beginPath(); ctx.arc(W/2, H-CELL*2, CELL*2, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#1a5a1a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = 'bold 8px sans-serif'; ctx.fillStyle = '#1a9a1a';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('START', W/2, H-CELL*2);

    // ── Objective marker ─────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(139,26,26,0.25)';
    ctx.beginPath(); ctx.arc(W/2, CELL*2.5, CELL*1.8, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#8b1a1a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#cc2a2a'; ctx.fillText('OBJECTIVE', W/2, CELL*2.5);

    // ── Path suggestion ──────────────────────────────────────────────────
    ctx.strokeStyle = 'rgba(201,151,58,0.4)'; ctx.lineWidth = 3; ctx.setLineDash([8,6]);
    ctx.beginPath(); ctx.moveTo(W/2, H-CELL*4);
    ctx.bezierCurveTo(W*0.3, H*0.7, W*0.6, H*0.4, W/2, CELL*4);
    ctx.stroke(); ctx.setLineDash([]);

    // ── Grid overlay ─────────────────────────────────────────────────────
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 0.5;
    for (var gx=0; gx<W; gx+=CELL) { ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke(); }
    for (var gy=0; gy<H; gy+=CELL) { ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke(); }

    // ── Border + title ───────────────────────────────────────────────────
    ctx.strokeStyle = env.accent; ctx.lineWidth = 3; ctx.setLineDash([]);
    ctx.strokeRect(2, 2, W-4, H-4);

    var mapTitle = env.name + (act ? ': ' + act.location : '');
    ctx.font = 'bold 11px Georgia,serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    var tw = ctx.measureText(mapTitle).width;
    ctx.fillStyle = 'rgba(0,0,0,0.78)'; roundFill(ctx, 6, 6, tw+14, 18, 3);
    ctx.fillStyle = env.accent; ctx.fillText(mapTitle, 13, 9);

    ctx.font = '9px Georgia,serif'; ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('1 sq = 5 ft', 8, H-18);

    // ── Act label ────────────────────────────────────────────────────────
    if (act) {
      ctx.font = 'italic 9px Georgia,serif'; ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillText('Act ' + act.number + ': ' + act.title, W-8, H-4);
    }
  }

  function drawForestTerrain(ctx, W, H, CELL, COLS, ROWS, env, rng) {
    // Dense tree clusters
    var treeClusters = 18;
    for (var i=0; i<treeClusters; i++) {
      var tx = CELL + rng()*(W-CELL*2), ty = CELL + rng()*(H-CELL*2);
      var treeCount = 2 + Math.floor(rng()*4);
      for (var j=0; j<treeCount; j++) {
        var tx2 = tx+(rng()-0.5)*CELL*2.5, ty2 = ty+(rng()-0.5)*CELL*2.5;
        var tr = CELL*(0.4+rng()*0.5);
        // Tree shadow
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath(); ctx.ellipse(tx2+4, ty2+4, tr, tr*0.7, 0, 0, Math.PI*2); ctx.fill();
        // Trunk
        ctx.fillStyle = '#3a2510'; ctx.fillRect(tx2-3, ty2-tr*0.3, 6, tr*0.6);
        // Canopy layers
        ['#1a4a08','#2a6a12','#3a8a1a'].forEach(function(col, ci) {
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(tx2, ty2-(ci*3), tr*(1-ci*0.1), 0, Math.PI*2); ctx.fill();
        });
      }
    }
    // Stream
    ctx.strokeStyle = '#2a6a9a'; ctx.lineWidth = CELL*0.5; ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(W*0.2, 0);
    ctx.bezierCurveTo(W*0.3, H*0.3, W*0.15, H*0.6, W*0.25, H); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawCaveTerrain(ctx, W, H, CELL, COLS, ROWS, env, rng) {
    // Stalactites top
    for (var si=0; si<12; si++) {
      var sx = rng()*W, sh = CELL*(0.5+rng()*1.5);
      ctx.fillStyle = '#4a3a2a';
      ctx.beginPath(); ctx.moveTo(sx-CELL*0.3, 0); ctx.lineTo(sx+CELL*0.3, 0); ctx.lineTo(sx, sh); ctx.closePath(); ctx.fill();
    }
    // Stalagmites bottom
    for (var smi=0; smi<10; smi++) {
      var smx = rng()*W, smh = CELL*(0.4+rng()*1.2);
      ctx.fillStyle = '#3a2a1a';
      ctx.beginPath(); ctx.moveTo(smx-CELL*0.25, H); ctx.lineTo(smx+CELL*0.25, H); ctx.lineTo(smx, H-smh); ctx.closePath(); ctx.fill();
    }
    // Underground pool
    ctx.fillStyle = '#1a3a5a'; ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.ellipse(W*0.3, H*0.4, CELL*2.5, CELL*1.5, 0.3, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    // Crystals
    for (var ci=0; ci<6; ci++) {
      var cx2 = CELL + rng()*(W-CELL*2), cy2 = CELL + rng()*(H-CELL*2);
      Sprites.crystal(ctx, cx2, cy2, 6, '#4a7a9a', '#8aaacc');
    }
  }

  function drawSwampTerrain(ctx, W, H, CELL, COLS, ROWS, env, rng) {
    // Bog patches
    for (var bi=0; bi<8; bi++) {
      var bx = rng()*W, by = rng()*H, bw = CELL*(1+rng()*3), bh = CELL*(0.5+rng()*2);
      ctx.fillStyle = '#1a2a0a'; ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.ellipse(bx, by, bw, bh, rng()*Math.PI, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // Cypress trees (tall narrow)
    for (var cyi=0; cyi<10; cyi++) {
      var ctx2 = ctx;
      var crx = CELL + rng()*(W-CELL*2), cry = CELL + rng()*(H-CELL*2);
      ctx2.fillStyle = '#1a3a10'; ctx2.fillRect(crx-3, cry-CELL*1.5, 6, CELL*1.5);
      ctx2.fillStyle = '#2a5a18';
      for (var cl=0; cl<4; cl++) {
        var cly = cry-CELL*0.3-cl*CELL*0.35;
        var clw = CELL*(0.5-cl*0.08);
        ctx2.beginPath(); ctx2.moveTo(crx-clw, cly); ctx2.lineTo(crx+clw, cly); ctx2.lineTo(crx, cly-CELL*0.4); ctx2.closePath(); ctx2.fill();
      }
    }
    // Will-o-wisp lights
    for (var wi=0; wi<4; wi++) {
      var wx = rng()*W, wy = rng()*H;
      ctx.fillStyle = 'rgba(200,255,200,0.3)';
      ctx.beginPath(); ctx.arc(wx, wy, CELL*0.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(200,255,200,0.8)';
      ctx.beginPath(); ctx.arc(wx, wy, CELL*0.15, 0, Math.PI*2); ctx.fill();
    }
  }

  function drawCoastalTerrain(ctx, W, H, CELL, COLS, ROWS, env, rng) {
    // Sea
    ctx.fillStyle = '#0a1a3a'; ctx.fillRect(0, 0, W*0.4, H);
    ctx.strokeStyle = '#1a3a6a'; ctx.lineWidth = 1.5;
    for (var wi=0; wi<6; wi++) {
      ctx.globalAlpha = 0.4;
      ctx.beginPath(); ctx.moveTo(0, wi*CELL*0.8); ctx.bezierCurveTo(W*0.1, wi*CELL*0.8+5, W*0.3, wi*CELL*0.8-5, W*0.4, wi*CELL*0.8); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Ruins
    [[W*0.5, H*0.3],[W*0.6, H*0.6],[W*0.75, H*0.45]].forEach(function(r) {
      ctx.fillStyle = '#4a4030';
      ctx.fillRect(r[0]-CELL, r[1]-CELL*1.5, CELL*2, CELL*1.5);
      // crumbled top
      ctx.fillStyle = env.ground;
      ctx.beginPath(); ctx.moveTo(r[0]-CELL, r[1]-CELL*1.5); ctx.lineTo(r[0]-CELL*0.5, r[1]-CELL*2); ctx.lineTo(r[0], r[1]-CELL*1.5); ctx.fill();
    });
    // Tide line
    ctx.strokeStyle = '#3a6a7a'; ctx.lineWidth = 2; ctx.setLineDash([5,5]);
    ctx.beginPath(); ctx.moveTo(W*0.4, 0); ctx.lineTo(W*0.4+CELL*0.5, H*0.3); ctx.lineTo(W*0.35, H*0.7); ctx.lineTo(W*0.4, H); ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawUrbanTerrain(ctx, W, H, CELL, COLS, ROWS, env, rng) {
    // Building footprints
    var buildings = [
      [0,0,W*0.3,H*0.35],[W*0.35,0,W*0.3,H*0.25],[W*0.7,0,W*0.3,H*0.3],
      [0,H*0.6,W*0.25,H*0.4],[W*0.75,H*0.55,W*0.25,H*0.45],
    ];
    buildings.forEach(function(b) {
      ctx.fillStyle = '#2a2018'; ctx.fillRect(b[0]+3, b[1]+3, b[2]-6, b[3]-6);
      // Windows
      for (var wxi=0; wxi<3; wxi++) {
        for (var wyi=0; wyi<2; wyi++) {
          ctx.fillStyle = rng()<0.4 ? '#f5e6a8' : '#1a1008';
          ctx.fillRect(b[0]+CELL*0.5+wxi*CELL*1.2, b[1]+CELL*0.5+wyi*CELL*1.5, CELL*0.5, CELL*0.7);
        }
      }
    });
    // Cobblestone road
    ctx.fillStyle = '#5a5040';
    ctx.fillRect(W*0.3, 0, W*0.4, H);
    ctx.fillRect(0, H*0.4, W, H*0.2);
    // Cobble pattern
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1;
    for (var cx3=Math.floor(W*0.3); cx3<W*0.7; cx3+=CELL*0.7) {
      for (var cy3=0; cy3<H; cy3+=CELL*0.5) {
        ctx.strokeRect(cx3, cy3, CELL*0.65, CELL*0.45);
      }
    }
    // Fountain in square
    Sprites.fountain(ctx, W/2, H/2, 14, '#6a5a40', env.accent);
    // Market stalls
    [[W*0.35,H*0.3],[W*0.6,H*0.35]].forEach(function(s) {
      ctx.fillStyle = ['#8b1a1a','#1a5a3a'][Math.floor(rng()*2)];
      ctx.fillRect(s[0]-CELL*0.8, s[1]-CELL*0.4, CELL*1.6, CELL*0.6);
      ctx.fillStyle = '#c9973a'; ctx.fillRect(s[0]-CELL, s[1]-CELL*0.4, CELL*2, CELL*0.2);
    });
  }

  function drawMountainTerrain(ctx, W, H, CELL, COLS, ROWS, env, rng) {
    // Mountain ridgeline
    ctx.fillStyle = '#3a3028';
    ctx.beginPath(); ctx.moveTo(0, H*0.6);
    var pts = [[0.1,0.4],[0.2,0.2],[0.35,0.05],[0.5,0.15],[0.65,0.03],[0.8,0.2],[0.9,0.35],[1,0.55],[1,1],[0,1]];
    pts.forEach(function(p) { ctx.lineTo(W*p[0], H*p[1]); });
    ctx.closePath(); ctx.fill();
    // Snow caps
    ctx.fillStyle = '#c8c0b8';
    [[W*0.35,H*0.05,W*0.13],[W*0.65,H*0.03,W*0.1]].forEach(function(pk) {
      ctx.beginPath(); ctx.ellipse(pk[0], pk[1]+pk[2]*0.25, pk[2]*0.5, pk[2]*0.25, 0, 0, Math.PI*2); ctx.fill();
    });
    // Rock boulders in pass
    for (var ri=0; ri<8; ri++) {
      var rx = CELL*2+rng()*(W-CELL*4), ry = H*0.5+rng()*H*0.3;
      ctx.fillStyle = '#5a5040';
      ctx.beginPath(); ctx.ellipse(rx, ry, CELL*(0.4+rng()*0.5), CELL*(0.3+rng()*0.3), rng(), 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#3a3028'; ctx.lineWidth = 1; ctx.stroke();
    }
    // Narrow path
    ctx.strokeStyle = '#8a7a60'; ctx.lineWidth = CELL*0.35; ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(W/2, H); ctx.bezierCurveTo(W*0.45, H*0.7, W*0.55, H*0.4, W/2, H*0.25); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawPlanarTerrain(ctx, W, H, CELL, COLS, ROWS, env, rng) {
    // Floating platforms
    for (var pi=0; pi<6; pi++) {
      var px = CELL + rng()*(W-CELL*4), py = CELL + rng()*(H-CELL*4);
      var pw = CELL*(1.5+rng()*2), pth = CELL*0.5;
      ctx.fillStyle = '#2a2040';
      ctx.beginPath(); ctx.ellipse(px, py, pw, pth, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = env.accent; ctx.lineWidth = 1.5; ctx.stroke();
      // Glow underneath
      ctx.fillStyle = 'rgba(100,60,255,0.2)';
      ctx.beginPath(); ctx.ellipse(px, py+pth, pw*0.8, pth*0.5, 0, 0, Math.PI*2); ctx.fill();
    }
    // Rifts
    for (var ri=0; ri<4; ri++) {
      var rx2 = rng()*W, ry2 = rng()*H;
      ctx.save(); ctx.shadowColor = env.accent; ctx.shadowBlur = 8;
      ctx.strokeStyle = env.accent; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(rx2, ry2-CELL); ctx.bezierCurveTo(rx2+CELL*0.4, ry2-CELL*0.3, rx2-CELL*0.4, ry2+CELL*0.3, rx2, ry2+CELL); ctx.stroke();
      ctx.restore();
    }
    // Stars/void background dots
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (var si=0; si<40; si++) {
      ctx.beginPath(); ctx.arc(rng()*W, rng()*H, rng()*1.5, 0, Math.PI*2); ctx.fill();
    }
  }

  function drawHazardMarker(ctx, x, y, label, env, CELL) {
    // Hazard diamond
    ctx.fillStyle = env.hazardColor; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.moveTo(x, y-CELL*0.6); ctx.lineTo(x+CELL*0.5, y); ctx.lineTo(x, y+CELL*0.6); ctx.lineTo(x-CELL*0.5, y); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('!', x, y);
    // Label
    ctx.font = 'italic 8px Georgia,serif'; ctx.fillStyle = 'rgba(255,220,100,0.85)';
    ctx.textBaseline = 'top'; ctx.fillText(label.split(' ').slice(0,3).join(' '), x, y+CELL*0.7);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════
  return {
    ROOM_FLAVOR:             ROOM_FLAVOR,
    getRoomFlavor:           getRoomFlavor,
    generateCampaignFlavor:  generateCampaignFlavor,
    drawSprite:              drawSprite,
    Sprites:                 Sprites,
    generateSocialRoomMap:   generateSocialRoomMap,
    generateEnvironmentMap:  generateEnvironmentMap,
    SOCIAL_ROOM_TYPES:       SOCIAL_ROOM_TYPES,
    ENV_TYPES:               ENV_TYPES,
  };
})();
