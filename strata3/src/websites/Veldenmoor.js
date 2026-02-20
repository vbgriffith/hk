/**
 * Veldenmoor.net — phpBB fan forum, circa 2008 aesthetic.
 * The forum is alive. veldenmoor_forever posted yesterday.
 */
const VeldenmoorSite = (function () {

  const CSS = `<style>
    * { margin:0;padding:0;box-sizing:border-box; }
    body { background:#2a1a0a;font-family:"Courier New",monospace;font-size:12px;color:#e0d0b0; }
    .header { background: linear-gradient(180deg, #4a2a08 0%, #2a1508 100%); padding:12px 16px; border-bottom:2px solid #8a5a20; }
    .header h1 { color:#e8c84a;font-size:20px;font-weight:bold;text-shadow:1px 1px 0 #000; }
    .header p { color:#b89060;font-size:11px;margin-top:4px; }
    .nav { background:#1a0e04;padding:6px 16px;border-bottom:1px solid #4a2a08;display:flex;gap:16px; }
    .nav a { color:#c8a060;font-size:11px;text-decoration:none; }
    .nav a:hover { color:#e8c84a; }
    .breadcrumb { background:#1e1208;padding:6px 16px;font-size:11px;color:#8a6040;border-bottom:1px solid #3a1a04; }
    .forum-table { width:100%;border-collapse:collapse;background:#1e1208; }
    .forum-table th { background:#3a1a08;color:#c8a060;padding:8px 12px;text-align:left;font-size:11px;border-bottom:2px solid #4a2a10; }
    .forum-table td { padding:8px 12px;border-bottom:1px solid #2a1504;vertical-align:top; }
    .thread-title a { color:#e8c84a;text-decoration:none;font-weight:bold; }
    .thread-title a:hover { color:#f0d870; }
    .sticky .thread-title a { color:#c8d870; }
    .thread-meta { color:#6a4a28;font-size:10px;margin-top:3px; }
    .thread-stats { color:#6a4a28;font-size:11px;text-align:center; }
    .thread-last { font-size:10px;color:#7a5a30; }
    .subforum-icon { font-size:16px;margin-right:8px; }
    .suspicious { background:#1a1a06 !important; border-left:2px solid #6a6a20; }
    .suspicious .thread-title a { color:#c8c840; font-style:italic; }
    .post-container { background:#1e1208;padding:16px; }
    .post { background:#261606;border:1px solid #3a1a08;margin-bottom:12px;display:flex; }
    .post-left { background:#1e1004;padding:12px;min-width:120px;max-width:120px;border-right:1px solid #3a1a08; }
    .post-left .username { color:#e8c84a;font-weight:bold;font-size:12px; }
    .post-left .user-title { color:#8a6040;font-size:10px;margin-top:2px; }
    .post-left .user-stats { color:#5a3a18;font-size:10px;margin-top:8px; }
    .post-right { padding:12px;flex:1; }
    .post-date { color:#5a3a18;font-size:10px;margin-bottom:8px;border-bottom:1px solid #2a1504;padding-bottom:6px; }
    .post-text { color:#d0c090;line-height:1.6;font-size:12px;white-space:pre-wrap; }
    .back-link { display:block;margin:12px 16px;color:#8a6040;font-size:11px;text-decoration:none; }
    .back-link:hover { color:#e8c84a; }
    .sticky-badge { background:#3a3a08;color:#c8c840;font-size:9px;padding:1px 5px;border-radius:2px;margin-right:6px; }
    .footer { background:#111004;padding:16px;border-top:2px solid #2a1508;font-size:10px;color:#4a3018;text-align:center; }
    .online-bar { background:#1a0e04;padding:4px 16px;font-size:10px;color:#5a3a18;border-top:1px solid #2a1208; }
  </style>`;

  function renderThreadList() {
    const { stickies, threads } = ForumRenderer.getThreadList();
    const allSeen = (id) => ForumRenderer.isSeen(id);

    const threadRow = (t, isSticky) => {
      const suspicious = ForumRenderer.isSuspicious(t);
      const dateStr = t.date || '????-??-??';
      const subjectDisplay = t.title || '<em style="color:#6a6a20;">[no subject]</em>';
      return `<tr class="${isSticky ? 'sticky' : ''}${suspicious ? ' suspicious' : ''}"
                onclick="VeldenmoorSite.openThread('${t.id}')"
                style="cursor:pointer;">
        <td>
          <span class="subforum-icon">${isSticky ? '📌' : suspicious ? '◈' : '▸'}</span>
          ${isSticky ? '<span class="sticky-badge">STICKY</span>' : ''}
          <span class="thread-title"><a href="#">${subjectDisplay}</a></span>
          <div class="thread-meta">by <strong>${t.author}</strong> · ${dateStr}</div>
        </td>
        <td class="thread-stats">${t.replies}</td>
        <td class="thread-stats">${t.views.toLocaleString()}</td>
        <td class="thread-last">${t.lastPostDate || dateStr}</td>
      </tr>`;
    };

    return `
      <div class="breadcrumb">veldenmoor.net › General Discussion</div>
      <table class="forum-table">
        <thead>
          <tr>
            <th>Thread</th>
            <th style="width:60px;text-align:center;">Replies</th>
            <th style="width:70px;text-align:center;">Views</th>
            <th style="width:120px;">Last Post</th>
          </tr>
        </thead>
        <tbody>
          ${stickies.map(t => threadRow(t, true)).join('')}
          ${threads.map(t => threadRow(t, false)).join('')}
        </tbody>
      </table>
      <div class="online-bar">Users online: ravenwatch_x, oswinbeliever, veldenmoor_forever, 14 guests</div>
    `;
  }

  function renderThread(id) {
    const thread = ForumRenderer.getThread(id);
    if (!thread) return '<div style="padding:20px;color:#8a6040;">Thread not found.</div>';
    ForumRenderer.markSeen(id);

    const posts = thread.posts.map(post => {
      const user = ForumRenderer.getUser(post.author);
      const dateStr = post.date || '????-??-??';
      return `<div class="post">
        <div class="post-left">
          <div class="username" style="color:${user.color};">${post.author}</div>
          <div class="user-title">${user.title}</div>
          <div class="user-stats">Posts: ${user.posts}<br>Since: ${user.joined}</div>
        </div>
        <div class="post-right">
          <div class="post-date">Posted: ${dateStr}</div>
          <div class="post-text">${post.text.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
        </div>
      </div>`;
    }).join('');

    return `
      <div class="breadcrumb">
        <a href="#" onclick="VeldenmoorSite.goHome()" style="color:#8a6040;text-decoration:none;">veldenmoor.net</a>
        › ${thread.title || '[no subject]'}
      </div>
      <div class="post-container">
        <h2 style="color:#c8a060;font-size:14px;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #3a1a08;">
          ${thread.title || '<em>[no subject]</em>'}
        </h2>
        ${posts}
      </div>
    `;
  }

  let currentContent = null;

  return {
    render(state) {
      return `${CSS}
        <div>
          <div class="header">
            <h1>✦ VELDENMOOR.NET ✦</h1>
            <p>The Unofficial PILGRIM Fan Community & ARG Discussion Board — Est. August 2009</p>
          </div>
          <div class="nav">
            <a href="#" onclick="VeldenmoorSite.goHome()">⌂ HOME</a>
            <a href="#" onclick="VeldenmoorSite.goHome()">GENERAL DISCUSSION</a>
            <a href="#">PUZZLE HELP</a>
            <a href="#">OSWIN SIGHTINGS</a>
            <a href="#">OFF-TOPIC</a>
          </div>
          <div id="veldenmoor-content">${renderThreadList()}</div>
          <div class="footer">
            Veldenmoor.net is a fan site and is not affiliated with the creators of PILGRIM.<br>
            <span style="color:#2a1804;">Powered by phpBB v3.1.2 · Theme: "Golden Cobblestone" by ravenwatch_x</span>
          </div>
        </div>`;
    },

    postRender(div) {
      currentContent = div.querySelector('#veldenmoor-content');
    },

    openThread(id) {
      const content = document.getElementById('veldenmoor-content');
      if (content) content.innerHTML = renderThread(id);
    },

    goHome() {
      const content = document.getElementById('veldenmoor-content');
      if (content) content.innerHTML = renderThreadList();
    }
  };
})();

// Registration handled by Layer0Scene.create()
