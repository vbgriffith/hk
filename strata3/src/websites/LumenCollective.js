/**
 * LumenCollective.com — corporate, clean, lying.
 * 2024 research consultancy. Everything is fine. Everything has always been fine.
 */
const LumenCollective = (function () {

  const CSS = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Georgia', serif; background: #f8f8f6; color: #1a1a1a; }
      .nav { background: #1a1a1a; padding: 16px 40px; display: flex; justify-content: space-between; align-items: center; }
      .nav-logo { color: #f5f0e8; font-family: monospace; font-size: 18px; letter-spacing: 4px; }
      .nav-links a { color: #8e8e8e; text-decoration: none; font-family: monospace; font-size: 11px; margin-left: 24px; letter-spacing: 2px; }
      .nav-links a:hover { color: #d4a853; }
      .hero { padding: 80px 40px; border-bottom: 1px solid #e0e0d8; }
      .hero h1 { font-size: 36px; font-weight: 300; color: #1a1a1a; margin-bottom: 16px; letter-spacing: 1px; }
      .hero p { font-size: 15px; color: #5a5a5a; max-width: 540px; line-height: 1.7; }
      .section { padding: 60px 40px; border-bottom: 1px solid #e0e0d8; }
      .section h2 { font-family: monospace; font-size: 11px; letter-spacing: 4px; color: #9a9a9a; text-transform: uppercase; margin-bottom: 32px; }
      .services { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
      .service-card { background: white; padding: 24px; border: 1px solid #e0e0d8; }
      .service-card h3 { font-size: 14px; margin-bottom: 12px; color: #1a1a1a; }
      .service-card p { font-size: 12px; color: #7a7a7a; line-height: 1.6; }
      .team { display: flex; gap: 32px; flex-wrap: wrap; }
      .person { width: 180px; }
      .person-photo { width: 80px; height: 80px; background: #e0e0d8; border-radius: 50%; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 11px; color: #9a9a9a; }
      .person h3 { font-size: 13px; margin-bottom: 4px; }
      .person p { font-size: 11px; color: #9a9a9a; font-family: monospace; }
      .news-item { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e8e8e0; }
      .news-item h3 { font-size: 14px; margin-bottom: 8px; }
      .news-item p { font-size: 12px; color: #7a7a7a; line-height: 1.6; }
      .news-date { font-family: monospace; font-size: 10px; color: #b0b0a8; margin-bottom: 6px; letter-spacing: 2px; }
      footer { padding: 40px; background: #1a1a1a; color: #5a5a5a; font-family: monospace; font-size: 11px; }
      footer a { color: #7a7a7a; text-decoration: none; }
      .privacy-line { color: #1e1e1e; } /* Nearly invisible */
      .fenn-photo-note { font-size: 10px; color: #b0b0a0; margin-top: 4px; font-style: italic; }
    </style>`;

  return {
    render(state) {
      const fennNote = state.flags['visited_layer3']
        ? '<p class="fenn-photo-note">[photo unavailable — last updated 2019]</p>'
        : '';

      return `${CSS}
      <div>
        <nav class="nav">
          <div class="nav-logo">LUMEN</div>
          <div class="nav-links">
            <a href="#" onclick="BrowserEngine.navigate('lumencollective.com#services')">SERVICES</a>
            <a href="#" onclick="BrowserEngine.navigate('lumencollective.com#team')">TEAM</a>
            <a href="#" onclick="BrowserEngine.navigate('lumencollective.com#news')">NEWS</a>
            <a href="#" onclick="BrowserEngine.navigate('lumencollective.com#contact')">CONTACT</a>
          </div>
        </nav>

        <div class="hero">
          <h1>Long-term thinking for<br>complex data problems.</h1>
          <p>Lumen Collective is a research and consulting group specializing in legacy data systems, cognitive archive management, and long-term behavioral modeling. We work quietly, carefully, and with a deep respect for the material in our care.</p>
        </div>

        <div class="section" id="services">
          <h2>What We Do</h2>
          <div class="services">
            <div class="service-card">
              <h3>Legacy Data Systems</h3>
              <p>We work with institutional clients to stabilize, document, and preserve data environments that have outgrown their original design parameters. Some systems require patience. We have patience.</p>
            </div>
            <div class="service-card">
              <h3>Cognitive Archive Management</h3>
              <p>Structured preservation of complex behavioral and cognitive datasets. We specialize in longitudinal studies and participant frameworks that extend beyond standard project timelines.</p>
            </div>
            <div class="service-card">
              <h3>Long-term Behavioral Modeling</h3>
              <p>Behavioral data collected over extended periods requires specialized interpretive frameworks. We have developed proprietary methodologies for exactly this kind of analysis.</p>
            </div>
          </div>
        </div>

        <div class="section" id="team">
          <h2>Our Team</h2>
          <div class="team">
            <div class="person">
              <div class="person-photo">R.O.</div>
              <h3>Ros Okafor</h3>
              <p>Project Lead</p>
            </div>
            <div class="person">
              <div class="person-photo" style="background:#2a2a2a;color:#4a4a4a;">T.A.</div>
              <h3>T. Albrecht</h3>
              <p>Legal & Compliance</p>
            </div>
            <div class="person">
              <div class="person-photo">DR.F</div>
              <h3>Dr. Fenn</h3>
              <p>Technical Liaison</p>
              ${fennNote}
            </div>
          </div>
        </div>

        <div class="section" id="news">
          <h2>News</h2>
          <div class="news-item">
            <div class="news-date">NOVEMBER 2024</div>
            <h3>Lumen Collective Enters Period of Strategic Consolidation</h3>
            <p>After a period of intensive project work, Lumen Collective is entering a phase of review and consolidation. We remain committed to the long-term stewardship of all active projects. No current engagements will be affected. Our work continues.</p>
          </div>
        </div>

        <div class="section" id="contact">
          <h2>Contact</h2>
          <p style="font-size:13px;color:#5a5a5a;line-height:1.8;">
            Lumen Collective<br>
            <span style="font-family:monospace;font-size:11px;color:#9a9a9a;">correspondence@lumencollective.com</span>
          </p>
        </div>

        <footer>
          <p>© 2024 Lumen Collective. All rights reserved.</p>
          <p style="margin-top:8px;"><a href="#" onclick="BrowserEngine.navigate('lumencollective.com#privacy')">Privacy Policy</a> · <a href="#">Terms of Service</a></p>
          <div id="privacy-section" style="display:none;margin-top:24px;padding-top:24px;border-top:1px solid #2a2a2a;">
            <p style="color:#4a4a4a;font-size:11px;line-height:1.8;">
              Lumen Collective collects and processes data in accordance with applicable law. Data collected through our services is used solely for the purposes stated at time of collection.<br><br>
              Data retention periods vary by project type and are governed by the terms of individual participant agreements.<br><br>
              <span class="privacy-line">Data subjects who predate the 2009 restructuring are governed by the original participant framework.</span><br><br>
              For data access or deletion requests, contact our legal team at the address above.
            </p>
          </div>
        </footer>
      </div>`;
    },

    postRender(div, url) {
      // Wire up privacy policy link
      const privacyLinks = div.querySelectorAll('a[href="#"]');
      privacyLinks.forEach(link => {
        if (link.textContent.includes('Privacy')) {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = div.querySelector('#privacy-section');
            if (section) {
              section.style.display = 'block';
              section.scrollIntoView({ behavior: 'smooth' });
              // Auto-solve discovery puzzle after short delay
              setTimeout(() => {
                PuzzleManager.autoSolve('privacy_policy_line');
              }, 2000);
            }
          });
        }
      });

      // Privacy policy auto-solve handled above
    }
  };
})();

// Registration handled by Layer0Scene.create()
