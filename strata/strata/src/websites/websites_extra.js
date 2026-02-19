/**
 * STRATA — Halverstrom.js
 * halverstrom.org — appears in browser history after first visiting Layer 3.
 * Wikipedia-style. 847 streets. Edited only by cartographer_p.
 */
const HalverstromWebsite = {
  url: 'halverstrom.org',
  title: 'Halverstrom — Wikipedia',
  era: 2024,
  requiresFlag: null, // URL appears in history after Layer 3 visit, not via navigation

  render(engine, scene, x, y, w, h) {
    const g = scene.add.graphics();
    const contentGroup = [];

    // Wikipedia-esque white
    g.fillStyle(0xffffff, 1);
    g.fillRect(x, y, w, h);

    // Wikipedia top bar
    g.fillStyle(0xeaecf0, 1);
    g.fillRect(x, y, w, 44);
    g.lineStyle(1, 0xa2a9b1, 1);
    g.lineBetween(x, y + 44, x + w, y + 44);

    scene.add.text(x + 16, y + 14, '📖 Halverstrom', {
      fontFamily: 'serif', fontSize: '14px', color: '#202122'
    });
    scene.add.text(x + w - 100, y + 14, 'Talk  History  Edit', {
      fontFamily: 'monospace', fontSize: '10px', color: '#3366cc'
    });

    // Content
    const contentX = x + 160; // sidebar space
    const contentW = w - 180;

    scene.add.text(contentX, y + 56, 'Halverstrom', {
      fontFamily: 'Georgia, serif', fontSize: '24px', color: '#202122'
    });

    g.lineStyle(1, 0xa2a9b1, 1);
    g.lineBetween(contentX, y + 84, x + w - 20, y + 84);

    const paras = [
      "Halverstrom is a city of undetermined geographic location, notable for its complete cartographic documentation despite no verified historical record of settlement.",
      "Population: 0 (recorded). Founded: 1887 (disputed). Area: unmeasured.",
      "The city's street network consists of 847 named streets arranged in a grid pattern with notable deviations in the eastern quarter. All streets have been documented and verified by a single contributor.",
      "Halverstrom has no known relationship to any existing municipality. Inquiries to the article's primary contributor have not received response.",
      "The city's central plaza, which serves as the geographic origin point for all street measurements, is described in contributor notes as \"the place where the route always begins and always returns to.\""
    ];

    paras.forEach((p, i) => {
      scene.add.text(contentX, y + 96 + i * 52, p, {
        fontFamily: 'Georgia, serif', fontSize: '11px', color: '#202122',
        wordWrap: { width: contentW - 20 }
      });
    });

    // Edit history box
    scene.add.text(contentX, y + 380, 'Edit history (last 5)', {
      fontFamily: 'monospace', fontSize: '10px', color: '#3366cc'
    });
    const edits = [
      '2024-02-14  cartographer_p  added: Blackwood Lane (street #847)',
      '2024-01-30  cartographer_p  added: Voss Alley (street #846)',
      '2019-03-12  cartographer_p  corrected: plaza coordinates',
      '2011-08-04  cartographer_p  initial article creation',
      '— all edits by single contributor —'
    ];
    edits.forEach((e, i) => {
      scene.add.text(contentX, y + 398 + i * 14, e, {
        fontFamily: 'monospace', fontSize: '9px', color: i === 4 ? '#a2a9b1' : '#202122'
      });
    });

    // Sidebar — infobox
    g.fillStyle(0xeaecf0, 1);
    g.fillRect(x + 20, y + 56, 130, 200);
    g.lineStyle(1, 0xa2a9b1, 1);
    g.strokeRect(x + 20, y + 56, 130, 200);

    scene.add.text(x + 30, y + 64, 'HALVERSTROM', {
      fontFamily: 'monospace', fontSize: '9px', color: '#202122'
    });
    const infoData = ['Pop: 0', 'Streets: 847', 'Founded: 1887', 'Area: unknown', 'Coord: see source'];
    infoData.forEach((d, i) => {
      scene.add.text(x + 30, y + 84 + i * 18, d, {
        fontFamily: 'monospace', fontSize: '9px', color: '#54595d'
      });
    });

    return contentGroup;
  }
};

/**
 * STRATA — SubstrateArchive.js
 * substrate-archive.net — FTP index aesthetic. Only accessible after Layer 4 visit.
 */
const SubstrateArchiveWebsite = {
  url: 'substrate-archive.net',
  title: 'Index of /',
  era: 1991,
  requiresLayer: 4,

  render(engine, scene, x, y, w, h) {
    const g = scene.add.graphics();

    g.fillStyle(0xffffff, 1);
    g.fillRect(x, y, w, h);

    scene.add.text(x + 16, y + 16, 'Index of /', {
      fontFamily: 'monospace', fontSize: '14px', color: '#000000'
    });
    g.lineStyle(1, 0x000000, 1);
    g.lineBetween(x + 16, y + 34, x + w - 16, y + 34);

    scene.add.text(x + 16, y + 40, 'Name                          Last modified     Size', {
      fontFamily: 'monospace', fontSize: '10px', color: '#666666'
    });

    const hasLayer4 = StateManager.get('deepestLayer') >= 4;
    const folders = [
      { name: '1991/', date: '1991-11-03 09:14', size: '-', note: '' },
      { name: '1993/', date: '1993-03-17 14:22', size: '-', note: '' },
      { name: '1997/', date: '1997-09-08 11:45', size: '-', note: '' },
      { name: '2001/', date: '2001-02-14 08:30', size: '-', note: '' },
      { name: '2004/', date: '2004-06-22 16:10', size: '-', note: '' },
      { name: '2005/', date: '2005-10-31 23:58', size: '-', note: '← power event logged' },
      { name: '2006/', date: '2006-12-09 00:00', size: '-', note: '← holm_p last entry' },
      { name: '2007/', date: '2007-04-12 09:22', size: '-', note: '' },
      { name: '2008/', date: '2008-08-15 14:00', size: '-', note: '' },
      { name: '2009/', date: '2009-03-01 00:00', size: '-', note: '← PILGRIM launch' },
      { name: '2009-2023/', date: '2023-12-31 23:59', size: '-', note: '← player_interaction_logs' },
      { name: '2024/', date: '2024-01-16 06:44', size: '1 file', note: hasLayer4 ? '← [maren_voss.dat] — created before hire' : '← [RESTRICTED]' },
    ];

    folders.forEach((f, i) => {
      const fy = y + 58 + i * 18;
      const isRestricted = f.name === '2024/' && !hasLayer4;
      const color = isRestricted ? '#cccccc' : (f.note ? '#880000' : '#0000cc');

      scene.add.text(x + 16, fy, f.name, {
        fontFamily: 'monospace', fontSize: '10px', color
      }).setInteractive({ useHandCursor: !isRestricted });

      scene.add.text(x + 200, fy, f.date, {
        fontFamily: 'monospace', fontSize: '10px', color: '#333333'
      });
      scene.add.text(x + 360, fy, f.size, {
        fontFamily: 'monospace', fontSize: '10px', color: '#333333'
      });
      if (f.note) {
        scene.add.text(x + 420, fy, f.note, {
          fontFamily: 'monospace', fontSize: '10px', color: '#880000'
        });
      }
    });

    scene.add.text(x + 16, y + h - 24, `Apache/1.3.42 Server at substrate-archive.net Port 21`, {
      fontFamily: 'monospace', fontSize: '9px', color: '#666666'
    });
  }
};

/**
 * STRATA — CallumWrest.js
 * callumwrest.com — the most important one. The quietest.
 * Simple personal site. One essay. Hidden coordinates in invisible text.
 */
const CallumWrestWebsite = {
  url: 'callumwrest.com',
  title: 'Callum Wrest',
  era: 2021,

  render(engine, scene, x, y, w, h) {
    const g = scene.add.graphics();

    // White background, serif font — nothing designed, just written
    g.fillStyle(0xffffff, 1);
    g.fillRect(x, y, w, h);

    const mx = x + 80;
    const mw = w - 160;

    scene.add.text(mx, y + 30, 'Callum Wrest', {
      fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1a1a1a'
    });
    scene.add.text(mx, y + 56, 'retired researcher. occasional writer. lives near the coast.', {
      fontFamily: 'Georgia, serif', fontSize: '11px', color: '#666666', fontStyle: 'italic'
    });

    g.lineStyle(1, 0xe0e0e0, 1);
    g.lineBetween(mx, y + 74, mx + mw, y + 74);

    // Essay excerpt
    scene.add.text(mx, y + 86, 'On Being Spatially Lost: A Life Without Internal Maps', {
      fontFamily: 'Georgia, serif', fontSize: '14px', color: '#1a1a1a'
    });
    scene.add.text(mx, y + 108, '— published 2021', {
      fontFamily: 'Georgia, serif', fontSize: '10px', color: '#888888', fontStyle: 'italic'
    });

    const essayParagraphs = [
      "I have never known where I am. Not in the philosophical sense — in the precise neurological sense. My brain does not retain spatial information between visits to the same place. I have lived in my current house for eleven years. Each morning when I walk to the kitchen, I navigate by landmark and habit, not by any internal map. There is no map. There never has been.",
      "I describe this to people and they often say: 'but surely you know your own house.' And I do, in a way. The way you know a poem. By sequence. By the feel of what comes next. Not by position.",
      "In my thirties I participated in a cognitive research study that I was told did not produce useful results. I signed a great deal of paperwork. For about four years after — perhaps 2006 to 2010 — I had a recurring dream of a city. I knew every street. I could navigate it in any direction from any starting point. I woke from those dreams feeling something I had no name for, so I called it north.",
      "They told me the study didn't work. I believed them. The dreams stopped. I have thought about that city most days since.",
      "My dog is named Halverstrom. I don't know why that name felt right. My partner asked where it came from. I said I wasn't sure. A city, maybe. One I visited once."
    ];

    essayParagraphs.forEach((p, i) => {
      scene.add.text(mx, y + 138 + i * 72, p, {
        fontFamily: 'Georgia, serif', fontSize: '11px', color: '#2a2a2a',
        wordWrap: { width: mw }, lineSpacing: 4
      });
    });

    // Hidden coordinates — same color as background
    // Player must "discover" via flag or select-all hint
    const hasFound = StateManager.hasFlag('callum_coordinates_visible');
    const coordColor = hasFound ? '#aaaaaa' : '#ffffff'; // invisible unless found
    const coordText = scene.add.text(mx, y + h - 36, '51.4823° N, 0.0897° W — halverstrom central plaza', {
      fontFamily: 'monospace', fontSize: '9px', color: coordColor
    });

    // Hint: if player has been to Layer 3, coordinates become barely visible
    if (StateManager.get('deepestLayer') >= 3 && !hasFound) {
      StateManager.flag('callum_coordinates_visible');
      StateManager.set('callumCoordinatesFound', true);
      coordText.setColor('#dddddd');
    }

    return [];
  }
};
