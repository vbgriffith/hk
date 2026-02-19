/**
 * STRATA — IdaCrane.js
 * idacrane.net — circa 2008 personal portfolio. Unmaintained.
 * Flash intro procedurally rendered. Portfolio, blog posts, the seventh post with no author.
 */
const IdaCraneWebsite = {
  url: 'idacrane.net',
  title: 'Ida Crane — Interactive Design',
  era: 2008,

  render(engine, scene, x, y, w, h) {
    const g = scene.add.graphics();
    const contentGroup = [];

    // Flash-era color scheme: warm neutrals, slight gradient feel
    g.fillStyle(0xf8f4ee, 1);
    g.fillRect(x, y, w, h);

    // Header gradient bar
    g.fillStyle(0x6b8a6a, 1);
    g.fillRect(x, y, w, 60);
    g.fillStyle(0x4a6a4a, 1);
    g.fillRect(x, y + 58, w, 2);

    // Name
    const name = scene.add.text(x + 24, y + 18, 'IDA CRANE', {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#f0ece4'
    });
    contentGroup.push(name);

    const tagline = scene.add.text(x + 24, y + 42, 'interactive design & digital experience', {
      fontFamily: 'monospace', fontSize: '10px', color: '#c8d8c0'
    });
    contentGroup.push(tagline);

    // Nav
    const navItems = ['portfolio', 'about', 'blog', 'contact'];
    navItems.forEach((item, i) => {
      const nx = x + w - 120 + i * 0;
      const navText = scene.add.text(x + w - 280 + i * 70, y + 30, item, {
        fontFamily: 'monospace', fontSize: '11px', color: '#d0e8c8'
      });
      contentGroup.push(navText);
    });

    // Active section: blog
    scene.add.text(x + 24, y + 80, 'BLOG', {
      fontFamily: 'Georgia, serif', fontSize: '16px', color: '#4a5a40'
    });
    g.lineStyle(1, 0xc8d4c0, 1);
    g.lineBetween(x + 24, y + 100, x + w - 24, y + 100);

    // Blog posts
    const posts = [
      { date: 'nov 2007', title: 'starting fresh: a new client', preview: 'Got an interesting brief today. A games company — well, they call themselves a research collective — wants a...' },
      { date: 'dec 2007', title: 'oswin', preview: "The character is taking shape. I've been given a 'personality brief' which is unlike anything I've..." },
      { date: 'jan 2008', title: 'three months in', preview: "Something doesn't add up. The server infrastructure they've given me access to is..." },
      { date: 'feb 2008', title: 'i asked fenn', preview: 'I asked Dr. Fenn directly what was underneath the layer I was building on. He said: "think of it as a foundation."' },
      { date: 'apr 2008', title: '(untitled)', preview: "Building the canary today. Just a precaution. If it ever fires I'll know someone found their way too deep." },
      { date: 'aug 2008', title: 'finished', preview: "finished. handing it over tomorrow. I've been having the same dream — I'm walking through a city I designed but can't find the exit. probably just deadline nerves." },
      { date: null, title: '', preview: "the exit was always there. you just have to let him show you.", anomaly: true },
    ];

    posts.forEach((p, i) => {
      const py = y + 112 + i * 58;
      if (py + 55 > y + h) return;

      if (p.anomaly) {
        // Seventh post — no metadata, different color
        g.fillStyle(0xf0ece4, 1);
        g.fillRect(x + 20, py, w - 40, 50);
        scene.add.text(x + 28, py + 16, p.preview, {
          fontFamily: 'Georgia, serif', fontSize: '12px', color: '#7a6a5a', fontStyle: 'italic'
        });
        if (!StateManager.hasFlag('ida_seventh_post_seen')) {
          StateManager.flag('ida_seventh_post_seen');
          StateManager.set('idaBlogPostSevenFound', true);
        }
        return;
      }

      g.fillStyle(i % 2 === 0 ? 0xf0ece4 : 0xeae6dc, 1);
      g.fillRect(x + 20, py, w - 40, 52);

      scene.add.text(x + 28, py + 6, p.date + ' — ' + p.title, {
        fontFamily: 'monospace', fontSize: '10px', color: '#6a8060'
      });
      scene.add.text(x + 28, py + 22, p.preview.substring(0, 80) + '...', {
        fontFamily: 'monospace', fontSize: '10px', color: '#5a5040',
        wordWrap: { width: w - 60 }
      });
    });

    return contentGroup;
  }
};
