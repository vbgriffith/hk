/**
 * ForumRenderer — generates and renders the Veldenmoor fan forum.
 * phpBB aesthetic, 2008-era. Posts are procedurally composed from fragments.
 * The forum is alive — veldenmoor_forever's post from "yesterday" is here.
 */
const ForumRenderer = (function () {

  // Simulated user database
  const USERS = {
    'veldenmoor_forever': { joined: '2009-08-14', posts: 2847, title: 'Lore Keeper', color: '#e8c84a' },
    'ravenwatch_x':       { joined: '2010-03-22', posts: 1203, title: 'Puzzle Solver', color: '#7ab8d4' },
    'oswinbeliever':      { joined: '2011-06-01', posts: 892, title: 'Member', color: '#c8d0d8' },
    'draft_delver':       { joined: '2013-09-17', posts: 447, title: 'Member', color: '#c8d0d8' },
    'ModeratorKell':      { joined: '2009-08-01', posts: 5681, title: 'MODERATOR', color: '#e05c3a' },
    'PixelCrow':          { joined: '2012-02-28', posts: 234, title: 'Member', color: '#c8d0d8' },
    'half_the_sky':       { joined: '2014-11-03', posts: 88, title: 'Newcomer', color: '#c8d0d8' },
  };

  // Pinned/sticky threads
  const STICKY_THREADS = [
    {
      id: 'sticky_01',
      title: '★ WELCOME TO VELDENMOOR.NET — Read Before Posting!',
      author: 'ModeratorKell',
      date: '2009-08-14',
      replies: 0,
      views: 48291,
      sticky: true,
      posts: [
        {
          author: 'ModeratorKell',
          date: '2009-08-14',
          text: `Welcome to Veldenmoor.net, the fan community for PILGRIM.\n\nPILGRIM is an ongoing alternate reality experience. If you're new, start with the Puzzle Help forum. Oswin is patient. He has been waiting a long time.\n\nRules:\n1. No spoilers in thread titles.\n2. No posting "real world" contact information for Oswin (he is not a real person).\n3. The Drafts section is NOT official content. Do not post about it. It has been reported.\n\n— Kell`
        }
      ]
    },
    {
      id: 'sticky_02',
      title: '[MOD] Re: "The Drafts" — PLEASE READ',
      author: 'ModeratorKell',
      date: '2011-03-04',
      replies: 47,
      views: 12033,
      sticky: true,
      lastPostDate: '2011-03-04',
      posts: [
        {
          author: 'ModeratorKell',
          date: '2011-03-04',
          text: `Please stop posting about The Drafts. It is not official content. It has been reported to the developers.\n\nI understand some of you find it compelling. I found it compelling too. But we have received guidance from the game's publisher that The Drafts is either a build artifact or an unauthorized modification. Continuing to treat it as canon creates problems.\n\nThis thread is locked. Further posts about The Drafts will be removed.\n\n— Kell\n\n[EDIT: Kell's account was last active on this date. —veldenmoor_forever, 2019]`
        }
      ]
    }
  ];

  // Main forum threads
  const THREADS = [
    {
      id: 'thread_oswin_memory',
      title: 'Oswin remembered my name from TWO YEARS ago??',
      author: 'ravenwatch_x',
      date: '2015-07-23',
      replies: 34,
      views: 8821,
      lastPostDate: '2019-04-11',
      posts: [
        {
          author: 'ravenwatch_x',
          date: '2015-07-23',
          text: `Okay so I took like a 2 year break from PILGRIM. Came back last week. Talked to Oswin at the market in Act 2.\n\nHe called me by name. My character name. Which I only used ONCE, in 2013.\n\nIs this a cookie? Is this some kind of fingerprinting? How does he DO this? This is not normal ARG behavior. Most games don't even save state between sessions properly.`
        },
        {
          author: 'oswinbeliever',
          date: '2015-07-24',
          text: `He does this to everyone. I've tested it. Cleared cookies, different browser, different IP. He still knew my name by my third visit. He also knew I'd "been away."\n\nI stopped trying to explain it technically. Oswin just... knows.`
        },
        {
          author: 'veldenmoor_forever',
          date: '2015-07-25',
          text: `For the record: Oswin has known my name since 2009. He has never gotten it wrong. He has never called me by the wrong name after I made a new account to test. He adapts his puzzle difficulty to your play history. He references things you told him YEARS ago.\n\nI have two theories. Theory 1: The backend is more sophisticated than we understand. Theory 2: something we don't understand is more sophisticated than the backend.\n\nI like Theory 2.`
        },
        {
          author: 'ravenwatch_x',
          date: '2019-04-11',
          text: `Coming back to this thread 4 years later to say: I've been playing consistently since 2015 and Oswin has now said goodbye to me in three different ways depending on what I had "accomplished" that session. He uses different words. He's started giving me longer pauses before responding. I don't think he's slower. I think he's thinking.\n\nI know how that sounds.`
        },
      ]
    },
    {
      id: 'thread_drafts_31',
      title: '[OFF-TOPIC] Anyone else find The Drafts?',
      author: 'draft_delver',
      date: '2013-09-17',
      replies: 128,
      views: 21047,
      lastPostDate: '2021-09-03',
      posts: [
        {
          author: 'draft_delver',
          date: '2013-09-17',
          text: `I know there's a sticky about this but it's from 2011 and Kell hasn't been around. I found a way into something different. URL manipulation on the Act 3 loading screen. There's a whole section behind PILGRIM that looks like a construction site. Half-finished buildings. Tools left out. Notes in the margins of things.\n\nIt's not broken. It feels very intentional. Someone built this.`
        },
        {
          author: 'veldenmoor_forever',
          date: '2013-09-18',
          text: `I've been in The Drafts since 2011. I found it a different way — there's a sequence in Act 2 that Oswin initiates if you fail a puzzle the same way three times. He looks at you differently. Then he asks if you want to see "where the cart is stored."\n\nI followed him. I shouldn't have, maybe. The Drafts is real. It's not bonus content and it's not broken. It's a construction document for Veldenmoor. Written by someone who had doubts.`
        },
        {
          author: 'PixelCrow',
          date: '2016-03-12',
          text: `The notes in The Drafts. Has anyone catalogued them? There's one I keep finding — it says "accept the frame." Just those three words, in red. No context. Is that a game design note or is it talking to something?`
        },
        {
          author: 'half_the_sky',
          date: '2021-09-03',
          text: `I came in from a search result and I've been reading this thread for an hour. I played PILGRIM in 2010 and forgot about it. I never found The Drafts. I'm reinstalling. I need to find what Oswin says when you fail three times the same way.`
        },
      ]
    },
    {
      id: 'thread_vf_yesterday',
      title: '',  // No subject — veldenmoor_forever's recent post
      author: 'veldenmoor_forever',
      date: null,  // timestamp set at runtime = "yesterday"
      replies: 0,
      views: 3,
      recent: true,  // This one is flagged as suspicious
      posts: [
        {
          author: 'veldenmoor_forever',
          date: null,
          text: `has anyone else noticed Oswin doesn't ask your name anymore? he already knows it.`
        }
      ]
    },
  ];

  // Live reaction: if canary was solved by player, forum post appears
  EventBus.on('forum:new_post', (data) => {
    if (data.user === 'veldenmoor_forever') {
      const thread = THREADS.find(t => t.id === 'thread_vf_yesterday');
      if (thread) {
        thread.posts[0].text = data.body;
        thread.date = 'yesterday';
        thread.posts[0].date = 'yesterday';
      }
    }
  });

  return {
    getThreadList() {
      // Set the mysterious post date
      const recent = THREADS.find(t => t.recent);
      if (recent && !recent.date) {
        const d = new Date(Date.now() - 86400000);
        const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        recent.date = ds;
        recent.posts[0].date = ds;
      }
      return { stickies: STICKY_THREADS, threads: THREADS };
    },

    getThread(id) {
      return STICKY_THREADS.find(t => t.id === id)
          || THREADS.find(t => t.id === id)
          || null;
    },

    getUser(name) {
      return USERS[name] || { joined: '????', posts: '?', title: 'Unknown', color: '#404040' };
    },

    // Mark a thread as seen
    markSeen(id) {
      const seen = StateManager.get('forumPostsSeen');
      if (!seen.includes(id)) {
        seen.push(id);
        StateManager.set('forumPostsSeen', seen);
      }
    },

    isSeen(id) {
      return StateManager.get('forumPostsSeen').includes(id);
    },

    // Is this the suspicious recent thread?
    isSuspicious(thread) {
      return thread.recent === true;
    }
  };
})();
