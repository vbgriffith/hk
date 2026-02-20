/**
 * STRATA — site_renderers.js
 * HTML string renderers for IdaCrane, Halverstrom, SubstrateArchive, CallumWrest.
 * These override the canvas-based stubs in websites_extra.js.
 * Each exports an object with render(state) → HTML string.
 */

// ─────────────────────────────────────────────────────────────────────
// idacrane.net — circa 2008 personal portfolio. Unmaintained.
// ─────────────────────────────────────────────────────────────────────
const IdaCraneWebsite = {
  url: 'idacrane.net',

  render(state) {
    const seventhPost = state.flags && state.flags['ida_seventh_post_seen']
      ? '' : (() => {
          // Mark as seen when rendered
          if (typeof StateManager !== 'undefined') StateManager.flag('ida_seventh_post_seen');
          return '';
        })();

    return `<style>
      * { margin:0;padding:0;box-sizing:border-box; }
      body { font-family:Georgia,serif;background:#f0ece4;color:#2a2218; }
      .header { background:linear-gradient(180deg,#6b8a6a,#4a6a4a);padding:20px 28px; }
      .header h1 { color:#f0ece4;font-size:24px;letter-spacing:2px; }
      .header p { color:#c8d8c0;font-size:11px;margin-top:4px;font-family:monospace; }
      nav { display:flex;gap:24px;margin-top:12px; }
      nav a { color:#d0e8c8;font-size:11px;font-family:monospace;text-decoration:none; }
      nav a:hover { color:#fff; }
      .content { padding:28px; }
      .section-title { font-family:monospace;font-size:11px;letter-spacing:3px;color:#6a8060;text-transform:uppercase;margin-bottom:20px;border-bottom:1px solid #c8d0c0;padding-bottom:8px; }
      .post { background:#e8e4dc;padding:16px 20px;margin-bottom:16px;border-left:3px solid #6b8a6a; }
      .post-meta { font-family:monospace;font-size:10px;color:#8a9a80;margin-bottom:8px; }
      .post h3 { font-size:14px;color:#2a3220;margin-bottom:8px; }
      .post p { font-size:12px;color:#4a4238;line-height:1.7; }
      .post-7 { background:#e4e0d4;border-left:3px solid transparent;font-style:italic;color:#7a6a5a; }
      .post-7 .post-meta { color:#b0a890; }
      footer { background:#2a3220;padding:20px 28px;font-family:monospace;font-size:10px;color:#5a6850;margin-top:20px; }
    </style>
    <div class="header">
      <h1>IDA CRANE</h1>
      <p>interactive design &amp; digital experience</p>
      <nav>
        <a href="#">portfolio</a><a href="#">about</a><a href="#" style="color:#fff;border-bottom:1px solid #fff;">blog</a><a href="#">contact</a>
      </nav>
    </div>
    <div class="content">
      <div class="section-title">blog</div>

      <div class="post">
        <div class="post-meta">nov 2007</div>
        <h3>starting fresh: a new client</h3>
        <p>Got an interesting brief today. A games company — well, they call themselves a research collective — wants a browser game with a community puzzle element. The character work sounds fun. They're very specific about the personality brief for the main NPC. Unusually specific.</p>
      </div>

      <div class="post">
        <div class="post-meta">dec 2007</div>
        <h3>oswin</h3>
        <p>The character is taking shape. I've been given a "personality brief" which reads less like a game character brief and more like a diplomatic protocol. How to approach. What to acknowledge. What not to acknowledge. Dr. Holm wrote it. He's been very precise.</p>
      </div>

      <div class="post">
        <div class="post-meta">jan 2008</div>
        <h3>three months in</h3>
        <p>Something doesn't add up. The server infrastructure they've given me access to is enormous for a Flash game. When I asked Dr. Fenn about it he said to "think of it as a foundation." I keep thinking about what foundations are for.</p>
      </div>

      <div class="post">
        <div class="post-meta">feb 2008</div>
        <h3>I asked Fenn</h3>
        <p>I asked Dr. Fenn directly what was underneath the layer I was building on. He said: "think of it as a foundation. Very old. Very stable. It was there before the project. It will be there after." He said this very calmly. I have not stopped thinking about it.</p>
      </div>

      <div class="post">
        <div class="post-meta">apr 2008</div>
        <h3>(untitled)</h3>
        <p>Building the canary today. Just a precaution. If it ever fires I'll know someone found their way too deep. I don't know what I'll do with that information. I just want there to be a record that I tried to leave a warning.</p>
      </div>

      <div class="post">
        <div class="post-meta">aug 2008</div>
        <h3>finished</h3>
        <p>finished. handing it over tomorrow. I've been having the same dream — I'm walking through a city I designed but can't find the exit. probably just deadline nerves. the city in the dream is very quiet and the streets are very precise. someone is always just ahead of me, measuring things.</p>
      </div>

      <div class="post post-7">
        <div class="post-meta"></div>
        <p>the exit was always there. you just have to let him show you.</p>
      </div>
    </div>
    <footer>idacrane.net · last updated 2008 · site may load slowly on older connections</footer>`;
  },

  postRender() {
    if (typeof StateManager !== 'undefined') {
      StateManager.flag('ida_seventh_post_seen');
      StateManager.set('idaBlogPostSevenFound', true);
    }
  }
};

// ─────────────────────────────────────────────────────────────────────
// halverstrom.org — Wikipedia-style. Only appears in history after Layer 3.
// ─────────────────────────────────────────────────────────────────────
const HalverstromWebsite = {
  url: 'halverstrom.org',

  render(state) {
    return `<style>
      * { margin:0;padding:0;box-sizing:border-box; }
      body { font-family:Georgia,serif;background:#fff;color:#202122;font-size:13px; }
      .top-bar { background:#eaecf0;padding:8px 16px;border-bottom:1px solid #a2a9b1;display:flex;justify-content:space-between;align-items:center; }
      .top-bar .logo { font-family:serif;font-size:14px;color:#202122; }
      .top-bar .actions { font-family:monospace;font-size:10px;color:#3366cc; }
      .main { display:flex;padding:16px; }
      .sidebar { width:200px;flex-shrink:0;margin-left:16px;order:2; }
      .infobox { border:1px solid #a2a9b1;background:#f8f9fa;padding:12px;font-size:11px;font-family:monospace; }
      .infobox h3 { font-size:12px;background:#cee0f2;margin:-12px -12px 8px;padding:6px 12px; }
      .infobox td { padding:2px 4px;color:#54595d; }
      .content { flex:1; }
      .content h1 { font-size:24px;font-weight:normal;border-bottom:1px solid #a2a9b1;padding-bottom:4px;margin-bottom:12px; }
      .content p { margin-bottom:12px;line-height:1.6; }
      .content h2 { font-size:16px;border-bottom:1px solid #a2a9b1;margin:16px 0 8px; }
      .edit-history { font-family:monospace;font-size:10px;margin-top:16px;padding:8px;background:#f8f9fa;border:1px solid #a2a9b1; }
      .edit-row { display:flex;gap:16px;padding:3px 0;border-bottom:1px solid #eaecf0;color:#54595d; }
      .edit-row .url { color:#3366cc; }
      .note { background:#fef9e7;border-left:3px solid #f0c040;padding:8px 12px;font-size:12px;margin:12px 0; }
    </style>
    <div class="top-bar">
      <span class="logo">📖 Wikipedia — The Free Encyclopedia</span>
      <span class="actions">Talk · History · Edit · Watch</span>
    </div>
    <div class="main">
      <div class="content">
        <h1>Halverstrom</h1>
        <p>
          <strong>Halverstrom</strong> is a city of undetermined geographic location, notable for its complete cartographic documentation despite no verified historical record of settlement or inhabitation. The city's street network has been documented in full by a single Wikipedia contributor.
        </p>
        <div class="note">
          ⚠ This article's neutrality has been disputed. The subject may not meet notability guidelines. A single source is responsible for all article content.
        </div>
        <p>
          Halverstrom's street network consists of <strong>847 named streets</strong> arranged in a modified grid pattern, with documented deviations in the eastern quarter consistent with organic urban development over a long period. All streets have been individually named, measured, and verified.
        </p>
        <p>
          The city's founding year is listed as <strong>1887</strong> in contributor documentation, though no historical records corroborate this date. Population is recorded as zero. No geographic coordinates have been provided in official article text.
        </p>
        <p>
          The central plaza, designated as the city's geographic origin point, is described in contributor notes as "the place where the route always begins and always returns to."
        </p>

        <h2>Notable Former Residents</h2>
        <p>
          <strong>Pieter Holm</strong> (1954–2006) — Research methodologist. Known for work in cognitive spatial mapping. Died December 17, 2006. Listed under Former Residents at the request of the article's primary contributor, who added the note: "he was the first to walk all 847."
        </p>

        <h2>Edit History</h2>
        <div class="edit-history">
          <div class="edit-row"><span>2024-02-14</span><span class="url">cartographer_p</span><span>added: Blackwood Lane (street #847)</span></div>
          <div class="edit-row"><span>2024-01-30</span><span class="url">cartographer_p</span><span>added: Voss Alley (street #846)</span></div>
          <div class="edit-row"><span>2021-03-04</span><span class="url">cartographer_p</span><span>added notable residents section; added P. Holm</span></div>
          <div class="edit-row"><span>2019-08-22</span><span class="url">cartographer_p</span><span>corrected central plaza coordinates (hidden field)</span></div>
          <div class="edit-row"><span>2011-08-04</span><span class="url">cartographer_p</span><span>initial article creation; streets #1–400</span></div>
          <div class="edit-row" style="color:#a2a9b1;font-style:italic;"><span colspan="3">All 2,841 edits by single contributor: cartographer_p</span></div>
        </div>
      </div>
      <div class="sidebar">
        <div class="infobox">
          <h3>Halverstrom</h3>
          <table>
            <tr><td>Population:</td><td>0</td></tr>
            <tr><td>Founded:</td><td>1887</td></tr>
            <tr><td>Streets:</td><td>847</td></tr>
            <tr><td>Area:</td><td>unmeasured</td></tr>
            <tr><td>Coord:</td><td style="color:#a2a9b1;">see hidden</td></tr>
            <tr><td>Editor:</td><td style="color:#3366cc;">cartographer_p</td></tr>
          </table>
        </div>
      </div>
    </div>`;
  },

  postRender() {
    if (typeof StateManager !== 'undefined') {
      StateManager.flag('halverstrom_article_read');
      // Reading this gives the player the deep folder password hint (1887)
      if (!StateManager.hasFlag('halverstrom_year_noticed')) {
        StateManager.flag('halverstrom_year_noticed');
        StateManager.addMarenNote(
          `Halverstrom was founded in 1887. According to an article written entirely by an entity called "cartographer_p." ` +
          `The same entity that has been adding streets to this city since 2011. ` +
          `Street #846: Voss Alley. Added January 30th. ` +
          `That's three days before I was hired.`
        );
      }
    }
  }
};

// ─────────────────────────────────────────────────────────────────────
// substrate-archive.net — FTP index. Only after Layer 4.
// ─────────────────────────────────────────────────────────────────────
const SubstrateArchiveWebsite = {
  url: 'substrate-archive.net',

  render(state) {
    const hasLayer4 = state.deepestLayer >= 4;
    const folders = [
      { name: '1991/', date: '1991-11-03 09:14', note: '' },
      { name: '1993/', date: '1993-03-17 14:22', note: '' },
      { name: '1997/', date: '1997-09-08 11:45', note: '' },
      { name: '2001/', date: '2001-02-14 08:30', note: '' },
      { name: '2004/', date: '2004-06-22 16:10', note: '' },
      { name: '2005/', date: '2005-10-31 23:58', note: '← power surge logged 23:57' },
      { name: '2006/', date: '2006-12-17 00:00', note: '← holm_p · last entry date' },
      { name: '2007/', date: '2007-04-12 09:22', note: '' },
      { name: '2008/', date: '2008-08-15 14:00', note: '← ida_crane · last commit' },
      { name: '2009/', date: '2009-03-01 00:00', note: '← PILGRIM launch' },
      { name: '2009-2023/', date: '2023-12-31 23:59', note: '← player_interaction_logs [14yr]' },
      { name: '2024/', date: '2024-01-16 06:44', size: '1 file',
        note: hasLayer4 ? '← maren_voss.dat [created: 3 days pre-hire]' : '← [RESTRICTED]',
        restricted: !hasLayer4 }
    ];

    const rows = folders.map(f => `
      <tr style="font-family:monospace;font-size:11px;${f.restricted ? 'color:#aaa' : ''}">
        <td style="padding:3px 16px;color:${f.note ? '#cc3300' : '#0000cc'};${f.restricted ? 'color:#aaa' : ''}">${f.name}</td>
        <td style="padding:3px 16px;color:#333;">${f.date}</td>
        <td style="padding:3px 16px;color:#333;">${f.size || '-'}</td>
        <td style="padding:3px 16px;color:#cc3300;font-size:10px;">${f.note}</td>
      </tr>`).join('');

    return `<style>
      body { font-family:monospace;background:#fff;color:#000;font-size:12px;padding:16px; }
      h1 { font-size:14px;margin-bottom:4px; }
      hr { border:none;border-top:1px solid #000;margin:8px 0; }
      table { border-collapse:collapse;width:100%; }
      th { text-align:left;padding:3px 16px;color:#666;border-bottom:1px solid #aaa;font-size:10px; }
      tr:hover td { background:#f0f0f0; }
      .server-sig { margin-top:16px;color:#666;font-size:10px; }
    </style>
    <h1>Index of /</h1>
    <hr>
    <table>
      <thead><tr><th>Name</th><th>Last Modified</th><th>Size</th><th>Note</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="server-sig">Apache/1.3.42 Server at substrate-archive.net Port 21<br>
    [access logged · your session has been filed]</div>`;
  },

  postRender() {
    if (typeof StateManager !== 'undefined' && !StateManager.hasFlag('substrate_archive_read')) {
      StateManager.flag('substrate_archive_read');
      StateManager.addMarenNote(
        `The 2024 folder has one file: maren_voss.dat. ` +
        `Created January 16th. I was hired January 19th. ` +
        `The file predates my employment by three days. ` +
        `The system knew I was coming. Or it made me come. ` +
        `I don't know which is worse.`
      );
    }
  }
};

// ─────────────────────────────────────────────────────────────────────
// callumwrest.com — the quietest one.
// ─────────────────────────────────────────────────────────────────────
const CallumWrestWebsite = {
  url: 'callumwrest.com',

  render(state) {
    const hasLayer3 = state.deepestLayer >= 3;
    // Coordinates are "hidden" (white on white) until player visits Layer 3
    const coordStyle = hasLayer3
      ? 'color:#888888;font-size:10px;font-family:monospace;'
      : 'color:#ffffff;font-size:10px;font-family:monospace;user-select:all;';

    return `<style>
      * { margin:0;padding:0;box-sizing:border-box; }
      body { font-family:Georgia,serif;background:#ffffff;color:#1a1a1a;max-width:640px;margin:0 auto;padding:40px 20px; }
      h1 { font-size:22px;font-weight:normal;margin-bottom:8px; }
      .tagline { font-style:italic;color:#666;font-size:13px;margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #eee; }
      .essay-title { font-size:16px;margin:24px 0 6px; }
      .essay-date { font-family:monospace;font-size:10px;color:#888;margin-bottom:20px; }
      p { font-size:13px;line-height:1.9;margin-bottom:18px;color:#2a2a2a; }
      footer { margin-top:40px;padding-top:20px;border-top:1px solid #eee;font-family:monospace;font-size:10px;color:#ccc; }
    </style>
    <h1>Callum Wrest</h1>
    <p class="tagline">retired researcher. occasional writer. lives near the coast.</p>

    <h2 class="essay-title">On Being Spatially Lost: A Life Without Internal Maps</h2>
    <p class="essay-date">— published 2021</p>

    <p>I have never known where I am. Not in the philosophical sense — in the precise neurological sense. My brain does not retain spatial information between visits to the same place. I have lived in my current house for eleven years. Each morning when I walk to the kitchen, I navigate by landmark and habit, not by any internal map. There is no map. There never has been.</p>

    <p>I describe this to people and they often say: "but surely you know your own house." And I do, in a way. The way you know a poem. By sequence. By the feel of what comes next. Not by position.</p>

    <p>In my thirties I participated in a cognitive research study that I was told did not produce useful results. I signed a great deal of paperwork. For about four years after — perhaps 2006 to 2010 — I had a recurring dream of a city. I knew every street. I could navigate it in any direction from any starting point. I woke from those dreams feeling something I had no name for, so I called it north.</p>

    <p>They told me the study didn't work. I believed them. The dreams stopped. I have thought about that city most days since. The streets were very precise. Someone was always just ahead of me, measuring things. I never caught up to them. I don't think I was supposed to.</p>

    <p>My dog is named Halverstrom. I don't know why that name felt right. My partner asked where it came from. I said I wasn't sure. A city, maybe. One I visited once.</p>

    <p>If you're reading this and you know what that city is — I would like to know too.</p>

    <footer>
      callumwrest.com · contact via form<br>
      <span style="${coordStyle}">51.4823° N, 0.0897° W — halverstrom central plaza</span>
    </footer>`;
  },

  postRender() {
    if (typeof StateManager !== 'undefined') {
      if (!StateManager.hasFlag('callum_site_read')) {
        StateManager.flag('callum_site_read');
        StateManager.addMarenNote(
          `Callum Wrest has a website. He wrote an essay about his condition. ` +
          `He says he had dreams of a city for four years and then they stopped. ` +
          `2006 to 2010 — the study ran the whole time and he didn't know. ` +
          `He named his dog Halverstrom. He doesn't know why.`
        );
      }
      if (StateManager.get('deepestLayer') >= 3) {
        StateManager.flag('callum_coordinates_visible');
        StateManager.set('callumCoordinatesFound', true);
      }
    }
  }
};
