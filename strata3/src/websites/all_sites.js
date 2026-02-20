/**
 * IdaCrane.net — personal portfolio site, circa 2008. Unmaintained.
 * Seventh blog post has no date, no author. One sentence.
 */
const IdaCraneSite = (function () {
  const CSS = `<style>
    * { margin:0;padding:0;box-sizing:border-box; }
    body { background:#f0ede6;font-family:Georgia,serif;color:#2a2218;font-size:13px; }
    .loading { background:#2a1a08;height:8px;width:100%;position:relative;overflow:hidden; }
    .loading-bar { background:#c8a050;height:100%;animation:loadbar 1.2s ease-out forwards; }
    @keyframes loadbar { from{width:0%} to{width:100%} }
    .header { background:#2a1a08;padding:20px 32px;display:flex;align-items:center;gap:24px; }
    .logo { width:48px;height:48px;background:#c8a050;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:18px;font-weight:bold;color:#2a1a08; }
    .header h1 { color:#f0ede6;font-size:22px;font-weight:normal; }
    .header p { color:#8a7050;font-size:12px;margin-top:4px; }
    nav { background:#3a2a12;padding:8px 32px;display:flex;gap:24px; }
    nav a { color:#c8a050;text-decoration:none;font-family:monospace;font-size:11px;letter-spacing:2px; }
    nav a:hover { color:#e8c870; }
    .content { padding:32px;max-width:680px; }
    .content h2 { font-size:18px;margin-bottom:16px;color:#2a1a08; }
    .portfolio-item { margin-bottom:24px;padding:16px;background:white;border:1px solid #d8d0c0;border-left:3px solid #c8a050; }
    .portfolio-item h3 { font-size:14px;margin-bottom:6px; }
    .portfolio-item p { font-size:12px;color:#6a5a40;line-height:1.6; }
    .portfolio-item .meta { font-family:monospace;font-size:10px;color:#9a8a6a;margin-bottom:8px; }
    .blog-post { margin-bottom:28px;padding-bottom:28px;border-bottom:1px solid #d8d0c0; }
    .blog-post h3 { font-size:14px;margin-bottom:6px; }
    .blog-post .date { font-family:monospace;font-size:10px;color:#9a8a6a;margin-bottom:10px; }
    .blog-post p { font-size:12px;color:#4a3a28;line-height:1.7; }
    .post-7 { background:#f8f0e0;border-left:3px solid #808060;padding:12px;margin-top:40px; }
    .post-7 p { font-style:italic;color:#5a5040; }
    footer { background:#2a1a08;padding:20px 32px;font-family:monospace;font-size:10px;color:#4a3820;margin-top:40px; }
  </style>`;

  return {
    render(state) {
      return `${CSS}<div>
        <div class="loading"><div class="loading-bar"></div></div>
        <div class="header">
          <div class="logo">IC</div>
          <div><h1>Ida Crane</h1><p>Designer · Developer · Builder of small worlds</p></div>
        </div>
        <nav>
          <a href="#portfolio">PORTFOLIO</a>
          <a href="#blog">JOURNAL</a>
          <a href="#contact">CONTACT</a>
        </nav>
        <div class="content">
          <div id="portfolio">
            <h2>Selected Work</h2>
            <div class="portfolio-item">
              <div class="meta">2008 · INTERACTIVE · PRIVATE CLIENT</div>
              <h3>PILGRIM</h3>
              <p>A browser-based alternate reality experience developed for a private research client. Designed to be warm, navigable, and memorable. The brief asked for something that felt like a place rather than a puzzle. I think we got close.</p>
              <p style="margin-top:8px;font-family:monospace;font-size:10px;color:#9a8a6a;">[further details under NDA]</p>
            </div>
            <div class="portfolio-item">
              <div class="meta">2006 · INTERACTIVE · PERSONAL</div>
              <h3>The Garden Project</h3>
              <p>A small interactive narrative about a garden that grows without being tended. Built in Flash. Long since offline.</p>
            </div>
          </div>

          <div id="blog" style="margin-top:40px;">
            <h2>Journal</h2>
            <div class="blog-post">
              <div class="date">2008-09-04</div>
              <h3>Shipped.</h3>
              <p>Handed PILGRIM off today. Strange feeling. Like dropping something delicate in a post box and watching the flap close. You can't know what happens on the other end. You just hope it lands right.</p>
            </div>
            <div class="blog-post">
              <div class="date">2008-07-22</div>
              <h3>On building characters who remember</h3>
              <p>The hardest part of Oswin wasn't the puzzles. It was the memory. How do you make someone feel remembered without it feeling like surveillance? Warmth is a design choice as much as anything else. I've been thinking about this a lot. The client wanted something that "adapts." I kept wondering — adapts to what?</p>
            </div>
            <div class="blog-post">
              <div class="date">2008-05-11</div>
              <h3>Something is off</h3>
              <p>I've been having the same dream — I'm walking through a city I designed but can't find the exit. Probably just deadline nerves. The Veldenmoor maps are done. Oswin's dialogue is mostly done. There's a part of the backend I don't have access to and the client says I don't need to. I believe them. Probably.</p>
            </div>
            <div class="blog-post">
              <div class="date">2008-03-30</div>
              <h3>Hired to build a door</h3>
              <p>New project. Large scope. Private. I'm designing an interface — a game, essentially — but the brief keeps describing it as a "navigation layer." Navigation of what? "Of complex material," they said. I asked what was underneath. They said: "Something that needs a face."</p>
            </div>
            <div class="blog-post">
              <div class="date">2007-09-14</div>
              <h3>The safeguard</h3>
              <p>Built something today that I hope nobody ever uses. A sequence — hidden, three files deep — that should interrupt the process if something goes wrong. I don't know exactly what I'm guarding against. The sensation under this project is hard to name. Not malevolence. More like... weight. Like the floor is further down than I thought.</p>
            </div>
            <div class="blog-post">
              <div class="date">2007-06-02</div>
              <h3>First days</h3>
              <p>Working from their facility. The building is ordinary. The archive they've given me access to is not. I have been told only what I need to know, which, they assure me, is enough. The project is called PILGRIM. I am building the exterior of something. The interior is not my concern.</p>
            </div>

            <!-- Post 7: no date, no author, separated -->
            <div class="post-7" id="ida-post-7">
              <p>the exit was always there. you just have to let him show you.</p>
            </div>
          </div>
        </div>
        <footer>ida-crane.net · last updated 2008 · ©2008 Ida Crane</footer>
      </div>`;
    },

    postRender(div) {
      // Trigger note after reading post-7
      const post7 = div.querySelector('#ida-post-7');
      if (post7) {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            StateManager.set('idaBlogPostSevenFound', true);
            StateManager.addMarenNote('"the exit was always there. you just have to let him show you." — seventh post on Ida\'s site. No date. No author. Posted after she stopped updating the site. Maybe she came back. Maybe she didn\'t have to.');
            observer.disconnect();
          }
        });
        observer.observe(post7);
      }
    }
  };
})();
BrowserEngine.registerSite('idacrane.net', IdaCraneSite);


/**
 * Halverstrom.org — Wikipedia-style article about a city that doesn't exist.
 * Only accessible after visiting Layer 3. Already in browser history when you return.
 */
const HalverstromSite = (function () {
  const CSS = `<style>
    * { margin:0;padding:0;box-sizing:border-box; }
    body { background:white;font-family:Linux Libertine,Georgia,serif;color:#202122;font-size:13px; }
    .wiki-header { background:#f8f9fa;border-bottom:1px solid #a2a9b1;padding:8px 20px;display:flex;justify-content:space-between; }
    .wiki-logo { font-family:monospace;font-size:14px;color:#54595d; }
    .wiki-title { font-size:12px;color:#54595d; }
    .content { max-width:720px;margin:0 auto;padding:20px; }
    h1.page-title { font-size:28px;font-weight:normal;border-bottom:1px solid #a2a9b1;padding-bottom:8px;margin-bottom:16px; }
    .infobox { float:right;clear:right;margin:0 0 16px 24px;background:#f8f9fa;border:1px solid #a2a9b1;font-size:12px;width:240px; }
    .infobox th { background:#cee0f2;padding:5px 8px;text-align:center;font-size:13px; }
    .infobox td, .infobox tr th { padding:4px 8px; }
    .infobox .row-label { color:#54595d;font-weight:bold; }
    p { margin-bottom:12px;line-height:1.6; }
    h2 { font-size:18px;font-weight:normal;border-bottom:1px solid #a2a9b1;margin:20px 0 10px;padding-bottom:4px; }
    h3 { font-size:14px;margin:14px 0 6px; }
    .edit-note { font-size:11px;color:#54595d;font-style:italic; }
    .edit-history { background:#f8f9fa;border:1px solid #a2a9b1;padding:12px;font-size:11px;margin-top:20px; }
    .edit-history h3 { font-size:13px;border-bottom:1px solid #d8d9da;margin-bottom:8px; }
    .edit-row { display:flex;gap:12px;margin-bottom:6px;padding-bottom:6px;border-bottom:1px solid #eaecf0; }
    .edit-time { color:#54595d;min-width:100px; }
    .edit-user { color:#0645ad; }
    .edit-summary { color:#202122; }
    .notable { margin-left:20px;margin-bottom:4px; }
    a { color:#0645ad;text-decoration:none; }
    a:hover { text-decoration:underline; }
    .coordinates-hidden { color:#f8f9fa;user-select:text; font-family:monospace;font-size:10px; }
  </style>`;

  // Generate 847 street names procedurally (first/last shown)
  function streetSample() {
    const streets = ['Meridian Way','Callum\'s Approach','Holm Passage','Crane Lane','Wrest Boulevard',
      'The Cartographer\'s Walk','Pale Circuit','Archive Row','Deep Well Street','The Substrate'];
    return streets.join(', ') + ` ... <em>[847 streets total, see full list]</em>`;
  }

  return {
    render(state) {
      return `${CSS}<div>
        <div class="wiki-header">
          <div class="wiki-logo">◈ HALVERSTROM.ORG</div>
          <div class="wiki-title">The Open Archive of Halverstrom — Community Maintained</div>
        </div>
        <div class="content">
          <h1 class="page-title">Halverstrom</h1>
          <table class="infobox">
            <tr><th colspan="2">Halverstrom</th></tr>
            <tr><td class="row-label">Founded</td><td>1887</td></tr>
            <tr><td class="row-label">Population</td><td>—</td></tr>
            <tr><td class="row-label">Streets</td><td>847</td></tr>
            <tr><td class="row-label">Status</td><td>Active</td></tr>
            <tr><td class="row-label">Notable resident</td><td>P. Holm (former)</td></tr>
          </table>

          <p><strong>Halverstrom</strong> is a city whose primary documentation exists in cartographic and archival form. Physical census records have been difficult to obtain. The city is best understood through its streets, which have been systematically mapped and catalogued.</p>

          <p>Halverstrom is notable for the completeness and stability of its street network. All 847 named streets have been documented. No street has been added, removed, or renamed since records began.</p>

          <h2>Streets</h2>
          <p>Halverstrom contains 847 named streets. The network is organized concentrically, with <strong>Meridian Way</strong> serving as the primary axis. All streets can be reached from Meridian Way within seven turns.</p>
          <p>${streetSample()}</p>

          <h2>Notable Former Residents</h2>
          <div class="notable"><strong>Pieter Holm</strong> (1951–2007) — Cartographer and cognitive mapping researcher. Resided in Halverstrom during the final years of his research career. His maps of the city's street network are considered definitive. Died of cardiac failure, 2007.</div>

          <h2>History</h2>
          <p>Documentation of Halverstrom dates to 1887. The city's founding circumstances are not recorded in any accessible archive. The city has remained structurally unchanged since its earliest cartographic records. Observers have noted the unusual stability of its layout — no buildings have been demolished or constructed within the period of recorded observation.</p>

          <div class="edit-history">
            <h3>Edit History (recent)</h3>
            <div class="edit-row">
              <span class="edit-time">3 days ago</span>
              <span class="edit-user">cartographer_p</span>
              <span class="edit-summary">Added street: The Substrate</span>
            </div>
            <div class="edit-row">
              <span class="edit-time">2019-04-03</span>
              <span class="edit-user">cartographer_p</span>
              <span class="edit-summary">Added streets 744–846 (batch)</span>
            </div>
            <div class="edit-row">
              <span class="edit-time">2013-08-17</span>
              <span class="edit-user">cartographer_p</span>
              <span class="edit-summary">Corrections to founding date references</span>
            </div>
            <div class="edit-row">
              <span class="edit-time">2011-01-02</span>
              <span class="edit-user">cartographer_p</span>
              <span class="edit-summary">Initial article — street catalogue (streets 1–400)</span>
            </div>
            <p class="edit-note" style="margin-top:8px;">All 847 edits made by a single contributor: <strong>cartographer_p</strong></p>
          </div>

          <p class="coordinates-hidden" id="halverstrom-coords" style="margin-top:4px;color:white;">
            HALVERSTROM CENTRAL PLAZA COORDINATES: 47°22'14.1"N 12°08'55.2"E
          </p>
        </div>
      </div>`;
    },

    postRender(div) {
      const coords = div.querySelector('#halverstrom-coords');
      if (coords) {
        // Make it findable only by selecting text (CSS color:white on white bg)
        // Solving puzzle when they select the text — intercept selectstart
        div.addEventListener('mouseup', () => {
          const sel = window.getSelection().toString();
          if (sel.includes('47°') || sel.includes('HALVERSTROM CENTRAL')) {
            PuzzleManager.autoSolve('halverstrom_coordinates');
          }
        });
      }
    }
  };
})();
BrowserEngine.registerSite('halverstrom.org', HalverstromSite);


/**
 * SubstrateArchive.net — FTP-style file index. 1991–present.
 * Maren's file was created 3 days before she was hired.
 */
const SubstrateArchiveSite = (function () {
  const CSS = `<style>
    * { margin:0;padding:0;box-sizing:border-box; }
    body { background:#0a0a0a;color:#a0a0a0;font-family:"Courier New",monospace;font-size:12px; }
    .header { background:#111;padding:12px 20px;border-bottom:1px solid #1a1a1a; }
    .header h1 { color:#606060;font-size:12px;letter-spacing:2px; }
    .path { color:#404040;font-size:11px;margin-top:4px; }
    .listing { padding:12px 20px; }
    .dir-row, .file-row { display:flex;gap:16px;padding:3px 6px;cursor:pointer;align-items:center; }
    .dir-row:hover { background:#111; }
    .file-row:hover { background:#111; }
    .dir-row span:first-child { color:#5a8a5a;min-width:16px; }
    .file-row span:first-child { color:#5a5a8a;min-width:16px; }
    .name { color:#c0c0c0;min-width:240px; }
    .dir-row .name { color:#7aba7a; }
    .size { color:#404040;min-width:80px;text-align:right; }
    .date { color:#404040; }
    .file-content { padding:20px;white-space:pre;line-height:1.6;color:#909090;font-size:11px;border-top:1px solid #1a1a1a;margin-top:8px; }
    .maren-file { background:#0a0a06; }
    .maren-file .name { color:#a0a060; }
    .separator { border:none;border-top:1px solid #1a1a1a;margin:4px 0; }
    .header-row { display:flex;gap:16px;padding:3px 6px;color:#404040;font-size:10px;border-bottom:1px solid #1a1a1a;margin-bottom:4px; }
  </style>`;

  function fileRow(name, size, date, onClick, isMaren) {
    return `<div class="file-row${isMaren ? ' maren-file' : ''}" onclick="${onClick}">
      <span>·</span><span class="name">${name}</span>
      <span class="size">${size}</span>
      <span class="date">${date}</span>
    </div>`;
  }

  return {
    render(state) {
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
      const marenDate = `${threeDaysAgo.getFullYear()}-${String(threeDaysAgo.getMonth()+1).padStart(2,'0')}-${String(threeDaysAgo.getDate()).padStart(2,'0')}`;

      return `${CSS}<div>
        <div class="header">
          <h1>INDEX OF / — SUBSTRATE-ARCHIVE.NET</h1>
          <div class="path">Apache/2.2.15 — Directory listing enabled</div>
        </div>
        <div class="listing">
          <div class="header-row">
            <span style="min-width:16px;"></span>
            <span style="min-width:240px;">Name</span>
            <span style="min-width:80px;text-align:right">Size</span>
            <span>Last Modified</span>
          </div>
          <div class="dir-row" onclick="SubstrateArchiveSite.openDir('pre_lumen')">
            <span>▸</span><span class="name" style="color:#7aba7a;">pre_lumen_1991-2004/</span>
            <span class="size">—</span>
            <span class="date">2004-12-31</span>
          </div>
          <div class="dir-row" onclick="SubstrateArchiveSite.openDir('holm')">
            <span>▸</span><span class="name" style="color:#7aba7a;">holm_measurements_2005-2007/</span>
            <span class="size">—</span>
            <span class="date">2007-03-14</span>
          </div>
          <div class="dir-row" onclick="SubstrateArchiveSite.openDir('pilgrim_logs')">
            <span>▸</span><span class="name" style="color:#7aba7a;">pilgrim_interaction_logs_2009-2023/</span>
            <span class="size">—</span>
            <span class="date">2023-12-31</span>
          </div>
          <hr class="separator">
          <div class="dir-row" onclick="SubstrateArchiveSite.openDir('2024')">
            <span>▸</span><span class="name" style="color:#a0a060;">2024/</span>
            <span class="size">—</span>
            <span class="date">${marenDate}</span>
          </div>
          <div id="substrate-file-content"></div>
        </div>
      </div>`;
    },

    postRender() {},

    openDir(dir) {
      const content = document.getElementById('substrate-file-content');
      if (!content) return;

      const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
      const marenDate = `${threeDaysAgo.getFullYear()}-${String(threeDaysAgo.getMonth()+1).padStart(2,'0')}-${String(threeDaysAgo.getDate()).padStart(2,'0')}`;

      const dirs = {
        'pre_lumen': `<div class="file-content">[directory: pre_lumen_1991-2004]\n\nFragment data from 7 archived research projects.\nOriginal project names have been stripped from metadata.\n\nContent: behavioral observation logs, spatial reasoning study data,\nmnemonic response datasets, environmental perception trials.\n\nNote: Data is fragmented. Projects used overlapping methodologies.\nOrigins cannot be cleanly separated. The archive holds all of it\nindiscriminately.</div>`,
        'holm': `<div class="file-content">[directory: holm_measurements_2005-2007]\n\nPieter Holm — Halverstrom Cartographic Survey\n\n847 measurement logs.\nEach log documents one street: dimensions, surface material,\nlight conditions, ambient sound, intersection angles.\n\nFinal log (2007-03-14): "The measurement is complete.\nAll 847 streets. The plaza coordinates are\n47°22'14.1"N 12°08'55.2"E.\nI believe this was always the center.\nI believe someone else will find this."\n\n[Holm died March 21, 2007. Seven days after this entry.]</div>`,
        'pilgrim_logs': `<div class="file-content">[directory: pilgrim_interaction_logs_2009-2023]\n\nAnonymized interaction logs for PILGRIM players.\nTotal sessions: 4,847,221\nUnique participants: 38,447\n\nLog format: [session_id] [timestamp] [action] [oswin_response]\n\nSample (anonymized):\n[4f2a...] 2009-09-12 GREET — Oswin: "I've been expecting someone like you."\n[4f2a...] 2009-09-12 NAME_GIVEN — Oswin: "I'll remember that."\n...\n[4f2a...] 2023-11-08 GREET — Oswin: "I've been expecting you specifically."\n\n[same session ID. 14 years apart. Oswin's response changed.]\n[this has been flagged internally. no action taken.]</div>`,
        '2024': `<div class="file-content">[directory: 2024]\n\n<span style="color:#a0a060;">voss_m.dat</span>    1.2kb    ${marenDate}\n\n<div onclick="SubstrateArchiveSite.openMarenFile()" style="cursor:pointer;display:inline;color:#606040;text-decoration:underline;">[open file]</div></div>`,
      };

      content.innerHTML = dirs[dir] || '';

      if (dir === '2024') {
        StateManager.addMarenNote('There\'s a file in the substrate archive dated three days before my first day. Named after me. I haven\'t opened it yet. I\'m making a note that I haven\'t opened it yet because I want to remember what it felt like to not know what\'s in it.');
      }
    },

    openMarenFile() {
      const content = document.getElementById('substrate-file-content');
      if (!content) return;
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
      const d = threeDaysAgo.toISOString().split('T')[0];
      content.innerHTML = `<div class="file-content" style="background:#0d0d08;border:1px solid #2a2a10;padding:16px;margin-top:8px;color:#c0c060;">
[file: voss_m.dat]
[created: ${d}]
[accessed: now]

name: maren voss
role: data archaeologist (contract)
employer: lumen collective
status: inbound

notes:
  methodical
  over-organizes her desktop
  takes notes when uncertain (good)
  will go deeper than instructed
  will find callum
  will not turn back at layer 3
  
  recommended approach: patience
  
expected_duration: variable
expected_outcome: [see ending parameters]
flagged_by: [field left blank]
filed_by: [field left blank]
</div>`;
      StateManager.addMarenNote('I opened it.\n\nThey knew I was coming. Not Lumen — they hired me, they would know. Something else knew. Something in there knew what I would do before I arrived. Before I was hired. Before I knew this job existed.\n\n"recommended approach: patience."\n\nI need to know who filled this in.');
    }
  };
})();
BrowserEngine.registerSite('substrate-archive.net', SubstrateArchiveSite);


/**
 * CallumWrest.com — simple personal site. The most important one. The quietest.
 */
const CallumWrestSite = (function () {
  const CSS = `<style>
    * { margin:0;padding:0;box-sizing:border-box; }
    body { background:white;font-family:Georgia,serif;color:#2a2218;font-size:14px;line-height:1.7; }
    .content { max-width:580px;margin:60px auto;padding:0 20px; }
    h1 { font-size:22px;font-weight:normal;margin-bottom:6px; }
    .subtitle { color:#8a7a6a;font-size:13px;font-family:monospace;margin-bottom:40px; }
    .bio { margin-bottom:32px; }
    .essay-link { display:block;background:#f8f5f0;border-left:3px solid #c8a050;padding:12px 16px;margin-bottom:32px;text-decoration:none;color:#2a2218; }
    .essay-link h2 { font-size:15px;margin-bottom:4px; }
    .essay-link p { font-size:12px;color:#8a7a6a; }
    .essay-content { display:none;background:#f8f5f0;padding:24px;margin-bottom:32px;border-left:3px solid #c8a050; }
    .essay-content p { margin-bottom:16px;font-size:13px; }
    .contact { font-family:monospace;font-size:12px;color:#8a7a6a;margin-bottom:40px; }
    footer { font-family:monospace;font-size:11px;color:#c8c0b0;margin-top:60px;border-top:1px solid #e8e0d0;padding-top:16px; }
    .hidden-coords { color:white;user-select:text;font-family:monospace;font-size:10px; }
  </style>`;

  return {
    render(state) {
      return `${CSS}<div>
        <div class="content">
          <h1>Callum Wrest</h1>
          <div class="subtitle">retired researcher · occasional writer · coastal town, somewhere</div>
          <div class="bio">
            <p>I spent thirty years in research — cognitive science, mostly, with a particular interest in spatial perception. I retired early and live quietly. I have a dog. His name is Halverstrom. I named him that because it felt right, which is the worst possible reason to name anything and also, I think, the only honest one.</p>
          </div>

          <div class="essay-link" onclick="CallumWrestSite.showEssay()" style="cursor:pointer;">
            <h2>On Being Spatially Lost: A Life Without Internal Maps</h2>
            <p>Published 2021 · Personal essay</p>
          </div>

          <div class="essay-content" id="callum-essay">
            <p>I have never known where I am. This isn't metaphorical. I was born with a condition — my neurologist called it acquired topographic disorientation, though in my case it was congenital — that prevents me from building a stable internal model of any space. Every room I enter, I enter fresh. Every street is new.</p>
            <p>Most people find this horrifying when I describe it. It doesn't feel horrifying from the inside. It feels like living in weather. You adjust. The sky is always the same sky, even if you can't say which direction it's in.</p>
            <p>In my early thirties I participated in a research study at a cognitive science facility. They had developed a method — they called it external spatial anchoring — that they believed could provide, for people like me, the stable spatial model we couldn't generate internally. A prosthetic map, in a sense.</p>
            <p>They told me afterward that it didn't work. The study was discontinued. I went home.</p>
            <p>But for about four years after — from sometime in my mid-thirties until the dreams stopped — I had a recurring dream of a city I knew perfectly. Every street. The angles of every intersection. The way the plaza looked in the early hours. I knew this city the way people who aren't me know their own bedrooms.</p>
            <p>I still miss it. I'm not sure what that says about me, missing a place I was never actually in. But grief for imagined places is still grief. My dog is named Halverstrom, after the street at the center of the city. I told my neighbor it was a family name. She believed me. I'm not sure I was entirely lying.</p>
            <p>The study ended. The city went away. I got a dog and moved somewhere with good light. This is, I think, a reasonable outcome. I am at peace with it most days.</p>
            <p>Most days.</p>
          </div>

          <div class="contact">
            <p>contact: not listed publicly</p>
          </div>

          <footer>callumwrest.com · built with very little</footer>
          <div class="hidden-coords" id="callum-coords">47°22'14.1"N 12°08'55.2"E</div>
        </div>
      </div>`;
    },

    postRender(div) {
      const coords = div.querySelector('#callum-coords');
      if (coords) {
        div.addEventListener('mouseup', () => {
          const sel = window.getSelection().toString();
          if (sel.includes('47°') || sel.includes('12°08')) {
            PuzzleManager.autoSolve('halverstrom_coordinates');
            StateManager.set('callumCoordinatesFound', true);
          }
        });
      }
    },

    showEssay() {
      const essay = document.getElementById('callum-essay');
      if (essay) {
        essay.style.display = 'block';
        essay.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          StateManager.set('callumDogNameNoticed', true);
          StateManager.addMarenNote('Callum\'s essay. "My dog is named Halverstrom." He named his dog after a city from a dream he had during a research study that he was told failed.\n\nThe study didn\'t fail. It\'s been running for twenty years. He just doesn\'t know.\n\nHe named his dog Halverstrom. He misses a city he was never in. His mind built it and it\'s still being run on hardware in a facility he left in the 1990s.\n\nI have to decide what to do with this.');
        }, 6000);
      }
    }
  };
})();
BrowserEngine.registerSite('callumwrest.com', CallumWrestSite);
