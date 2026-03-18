# Browser Fetch & Cross-Origin Requests
## Why Some Sites Work, Others Fail — and How to Maximize Success

---

## Table of Contents

1. [The Core Problem](#1-the-core-problem)
2. [Failure Mode Reference](#2-failure-mode-reference)
3. [Why the Pattern Feels Random](#3-why-the-pattern-feels-random)
4. [Connection Methods Ranked by Reach](#4-connection-methods-ranked-by-reach)
5. [Fetch Options That Help](#5-fetch-options-that-help)
6. [Headers That Matter](#6-headers-that-matter)
7. [Detecting Failure Types](#7-detecting-failure-types)
8. [The Proxy Solution](#8-the-proxy-solution)
9. [Best-Practice Fetch Wrapper](#9-best-practice-fetch-wrapper)
10. [Decision Flowchart](#10-decision-flowchart)

---

## 1. The Core Problem

When JavaScript in a browser makes a request to a different origin, three
separate enforcement layers can block it — independently and in any combination:

```
Your JS code
    │
    ▼
[1] Browser CORS enforcement     ← reads response headers, may discard response
    │
    ▼
[2] Firewall / proxy             ← may drop connection before server ever responds
    │
    ▼
[3] Server / CDN                 ← may return 403, redirect, or close connection
```

All three failure modes produce an identical error in JavaScript:

```js
// Every one of these looks the same to your catch block:
// TypeError: Failed to fetch
// TypeError: NetworkError when attempting to fetch resource
// TypeError: Load failed

try {
  const res = await fetch('https://example.com');
} catch (err) {
  console.log(err.message); // "Failed to fetch" — could be any of the above
}
```

There is **no way from JS alone** to know which layer blocked you.

---

## 2. Failure Mode Reference

### 2.1 CORS — Cross-Origin Resource Sharing

The most common cause of the apparent randomness. CORS is enforced by the
**browser**, not the server. The server responds normally; the browser reads the
response headers and then throws the response away if they don't permit it.

```
Your page at file:// or localhost:3000
    │
    ├─── fetch('https://api.example.com/data')
    │         │
    │         ▼
    │    Server responds 200 OK with body
    │         │
    │         ▼
    │    Browser checks: does response include
    │    Access-Control-Allow-Origin: *  ?
    │         │
    │    NO ──┤── Browser discards response, throws TypeError
    │         │
    │    YES ─┴── Your code receives the response ✓
```

**Simple requests** (GET/HEAD with no custom headers) go straight through.
**Preflighted requests** (POST with JSON, or any custom header) first send an
OPTIONS request. If the server doesn't respond to OPTIONS correctly, the actual
request never goes out.

```js
// ── Triggers a PREFLIGHT (OPTIONS first) ──────────────────────
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },  // ← custom header
  body: JSON.stringify({ q: 'hello' })
});

// ── Simple request — NO preflight ────────────────────────────
fetch('https://api.example.com/data', {
  method: 'GET'
  // no custom headers
});
```

---

### 2.2 Firewall / Corporate Proxy Blocking

A firewall drops the TCP connection entirely. From JS, indistinguishable from
a CORS error. Common block categories:

- Social media domains
- Cloud storage (Dropbox, Google Drive)
- Sites in certain geographic regions
- Any URL matching a keyword blocklist
- WebSocket `Upgrade` headers (some firewalls block WS but allow HTTP)

---

### 2.3 Mixed Content

If your page is served over `https://` and you request `http://`, the browser
refuses before the request even leaves the machine.

```js
// Page served from https://myapp.com
fetch('http://api.example.com/data')  // ← BLOCKED — mixed content
fetch('https://api.example.com/data') // ← allowed (subject to CORS)
```

---

### 2.4 TLS / Certificate Errors

Self-signed certs, expired certs, or corporate MITM inspection certificates
that aren't in the browser's trust store all produce a network error identical
to CORS failure.

```js
fetch('https://internal-server.corp')
// Fails if the cert is self-signed and not trusted by the browser
```

---

### 2.5 Redirect Chains Losing CORS Headers

Some servers redirect `http://` → `https://` → `https://www.`. CORS headers
must be present on the **final** response. If any redirect in the chain crosses
origins and drops the headers, the browser blocks the final response.

---

### 2.6 `X-Frame-Options` / CSP Breaking iframes

Not a fetch issue, but relevant for alternative methods. If a site sends:

```
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none'
```

It cannot be loaded in an `<iframe>` at all.

---

## 3. Why the Pattern Feels Random

The same site may work sometimes and fail others. Causes:

| Situation | Reason |
|---|---|
| CDN assets work, homepage fails | CDNs set `CORS: *` for assets; HTML pages don't |
| API subdomain works, www doesn't | `api.example.com` has CORS; `www.example.com` doesn't |
| Works on mobile hotspot, fails on office WiFi | Firewall at office blocks it |
| Worked yesterday, fails today | Server removed CORS headers in a deploy |
| Some endpoints of same API work | CORS configured per-route, not globally |
| `no-cors` fetch succeeds, normal fetch fails | CORS enforcement only applies when you try to read the response |

---

## 4. Connection Methods Ranked by Reach

From most restrictive to most permissive:

### 4.1 Standard `fetch()` — most restricted

```js
// Only works if server sends correct CORS headers
const res  = await fetch('https://api.example.com/data');
const data = await res.json();
```

**Works for:** APIs that explicitly allow cross-origin access.  
**Fails for:** Most regular websites, any site without `Access-Control-Allow-Origin`.

---

### 4.2 `fetch()` with `mode: 'no-cors'` — wider reach, blind response

```js
const res = await fetch('https://example.com', {
  method: 'GET',
  mode: 'no-cors',    // ← never throws for CORS reasons
  cache: 'no-store',
});

// res.type === 'opaque'
// res.status === 0
// res.headers is empty
// You CANNOT read res.body
// But you CAN tell: if this didn't throw, the server responded
console.log('Server is reachable');
```

**Works for:** Checking reachability of almost any HTTPS site.  
**Fails for:** Reading the response content. Only useful as a ping.

---

### 4.3 `<img>` tag — broad reach, binary signal only

The browser loads images cross-origin without CORS checks. `onload`/`onerror`
give you a binary reachable/not-reachable signal. Fastest method for pure
connectivity testing.

```js
function pingWithImage(url, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => {
      img.src = '';
      resolve({ reachable: false, reason: 'timeout' });
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timer);
      resolve({ reachable: true });
    };

    img.onerror = (e) => {
      clearTimeout(timer);
      // onerror fires even for 404s and server errors —
      // the server DID respond, just not with a valid image.
      // This is still "reachable" from a network perspective.
      resolve({ reachable: true, reason: 'server responded (non-image)' });
    };

    // Append timestamp to bust any cache
    img.src = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();
  });
}

// Usage — works for most sites regardless of CORS
const result = await pingWithImage('https://example.com');
console.log(result); // { reachable: true }
```

**Works for:** Virtually any HTTP/HTTPS URL (images, HTML pages, APIs).  
**Fails for:** Sites that block all requests at the firewall level; reading content.

---

### 4.4 `<script>` tag injection — JSONP pattern

Old technique. If a server supports JSONP, the response is a JS function call
that executes in your page. Rarely supported today.

```js
function jsonpFetch(url, callbackParam = 'callback') {
  return new Promise((resolve, reject) => {
    const fnName = '__jsonp_' + Date.now();
    window[fnName] = (data) => {
      delete window[fnName];
      document.head.removeChild(script);
      resolve(data);
    };

    const script = document.createElement('script');
    script.src = url + (url.includes('?') ? '&' : '?') + callbackParam + '=' + fnName;
    script.onerror = () => {
      delete window[fnName];
      reject(new Error('JSONP failed'));
    };
    document.head.appendChild(script);
  });
}

// Only works if server supports JSONP
const data = await jsonpFetch('https://api.example.com/data');
```

**Works for:** Legacy APIs with explicit JSONP support.  
**Fails for:** Everything else. Don't use for new projects.

---

### 4.5 WebSocket — different firewall code path

WebSocket uses an HTTP `Upgrade` handshake. Many firewalls pass WebSocket
traffic that they would block for regular HTTP fetches, because WS is
associated with "real-time apps" rather than "web browsing."

```js
function testWebSocket(wsUrl, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const ws = new WebSocket(wsUrl);
    const timer = setTimeout(() => {
      ws.close();
      resolve({ reachable: false, reason: 'timeout' });
    }, timeoutMs);

    ws.onopen = () => {
      clearTimeout(timer);
      ws.close();
      resolve({ reachable: true, latency: Date.now() });
    };

    ws.onerror = () => {
      clearTimeout(timer);
      resolve({ reachable: false, reason: 'error' });
    };
  });
}

// wss:// is the encrypted form (required on https:// pages)
const result = await testWebSocket('wss://echo.websocket.org');
```

**Works for:** Servers that support WebSocket. Different firewall path than HTTP.  
**Fails for:** Servers with no WS endpoint; firewalls that block WS specifically.

---

### 4.6 `<iframe>` — page-level reachability

Loading a URL in a hidden iframe will succeed or fail independently of CORS.
The browser loads the full page. You can't read its content, but `onload` fires
if the server responded.

```js
function testWithIframe(url, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;';

    const timer = setTimeout(() => {
      document.body.removeChild(iframe);
      resolve({ reachable: false, reason: 'timeout' });
    }, timeoutMs);

    iframe.onload = () => {
      clearTimeout(timer);
      document.body.removeChild(iframe);
      resolve({ reachable: true });
    };

    iframe.onerror = () => {
      clearTimeout(timer);
      document.body.removeChild(iframe);
      resolve({ reachable: false, reason: 'error' });
    };

    iframe.src = url;
    document.body.appendChild(iframe);
  });
}
```

**Blocked by:** `X-Frame-Options: DENY` or `CSP: frame-ancestors 'none'`.  
**Works for:** Sites without frame restrictions.

---

### 4.7 Server-Sent Events

Only useful if the target server has an SSE endpoint. Niche.

```js
const es = new EventSource('https://api.example.com/stream');
es.onmessage = e => console.log(e.data);
es.onerror   = () => console.log('blocked or unsupported');
```

---

## 5. Fetch Options That Help

### 5.1 Avoid Preflight with Simple Request Rules

A request is "simple" (no preflight OPTIONS) if:

- Method is `GET`, `HEAD`, or `POST`
- No custom headers (no `Authorization`, `X-Custom-Header`, etc.)
- `Content-Type` is one of: `text/plain`, `application/x-www-form-urlencoded`,
  `multipart/form-data`

```js
// ── Triggers preflight (AVOID when testing reachability) ──────
fetch(url, {
  headers: {
    'Content-Type': 'application/json',   // ← causes preflight
    'Authorization': 'Bearer token',       // ← causes preflight
    'X-Custom': 'value',                   // ← causes preflight
  }
});

// ── No preflight ──────────────────────────────────────────────
fetch(url, {
  method: 'GET',
  mode: 'cors',   // or 'no-cors'
  // no custom headers
});
```

---

### 5.2 Cache Control

Always bust the cache when testing connectivity. A cached failure or success
from a previous request can mask the real current state.

```js
fetch(url, {
  cache: 'no-store',   // don't cache, don't use cached response
});
```

---

### 5.3 Credentials

Sending cookies or auth headers widens the CORS requirements significantly.
Avoid for connectivity testing.

```js
// Default — no cookies sent cross-origin (best for testing)
fetch(url, { credentials: 'omit' });

// Same-origin only — cookies sent only if same origin
fetch(url, { credentials: 'same-origin' });

// Sends cookies cross-origin — requires server to send
// Access-Control-Allow-Credentials: true AND a specific origin (not *)
fetch(url, { credentials: 'include' });
```

---

### 5.4 AbortController for Reliable Timeouts

`fetch()` has no built-in timeout. Without one, a request can hang for 2+
minutes before the browser gives up.

```js
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('Request timed out');
    throw err;
  }
}
```

---

## 6. Headers That Matter

### 6.1 Response Headers You Need the Server to Send

These are sent by the **server** in its response. You cannot fake or add them
from client-side JS. If you control the server, add all of these:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Max-Age: 86400
```

For credentialed requests (cookies), `*` doesn't work — you must echo the
requesting origin:

```http
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Credentials: true
```

---

### 6.2 Handle OPTIONS Preflight on Your Server

If you control an API server, always handle OPTIONS explicitly:

```js
// Node.js / Express example
app.options('*', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin':  req.headers.origin || '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Max-Age':       '86400',
  });
  res.sendStatus(204);
});

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
  next();
});
```

---

### 6.3 Request Headers Worth Setting

```js
fetch(url, {
  headers: {
    // Tells the server this is an XHR/fetch request
    // Some servers use this to return JSON instead of HTML
    'X-Requested-With': 'XMLHttpRequest',

    // Ask for JSON explicitly — many APIs check this
    'Accept': 'application/json',

    // If the server has rate limiting by User-Agent,
    // a descriptive string can help
    'User-Agent': 'MyApp/1.0',
  }
});
```

> **Note:** `X-Requested-With` is a custom header and will trigger a preflight.
> Only add it if you know the server handles it.

---

## 7. Detecting Failure Types

Since all failures look the same, use a multi-method probe to get more signal:

```js
async function probeURL(url, timeoutMs = 6000) {
  const result = {
    url,
    fetch_cors:   null,  // could read response
    fetch_opaque: null,  // server responded (no-cors)
    image_ping:   null,  // server responded to any request
    timing:       null,  // ms
  };

  const start = performance.now();

  // ── Method 1: standard fetch (can read response) ──────────────
  try {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), timeoutMs);
    const res  = await fetch(url, {
      method:      'GET',
      mode:        'cors',
      cache:       'no-store',
      credentials: 'omit',
      signal:      ctrl.signal,
    });
    clearTimeout(tid);
    result.fetch_cors = { ok: res.ok, status: res.status };
  } catch (err) {
    result.fetch_cors = { ok: false, error: err.name };
  }

  // ── Method 2: no-cors fetch (reachability only) ───────────────
  try {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), timeoutMs);
    await fetch(url, {
      method:      'GET',
      mode:        'no-cors',
      cache:       'no-store',
      credentials: 'omit',
      signal:      ctrl.signal,
    });
    clearTimeout(tid);
    result.fetch_opaque = { ok: true };
  } catch (err) {
    result.fetch_opaque = { ok: false, error: err.name };
  }

  // ── Method 3: image probe (broadest reach) ────────────────────
  result.image_ping = await new Promise((resolve) => {
    const img   = new Image();
    const tid   = setTimeout(() => { img.src=''; resolve({ ok: false, reason: 'timeout' }); }, timeoutMs);
    img.onload  = () => { clearTimeout(tid); resolve({ ok: true  }); };
    img.onerror = () => { clearTimeout(tid); resolve({ ok: true, reason: 'non-image response' }); };
    img.src = url + (url.includes('?') ? '&' : '?') + '_p=' + Date.now();
  });

  result.timing = Math.round(performance.now() - start);

  // ── Interpret results ──────────────────────────────────────────
  result.diagnosis = diagnose(result);
  return result;
}

function diagnose(r) {
  if (!r.image_ping.ok)  return 'BLOCKED — firewall or server down';
  if (!r.fetch_opaque.ok) return 'BLOCKED — firewall drops fetch but not img (rare)';
  if (r.fetch_cors.ok)   return 'FULLY ACCESSIBLE — CORS headers present';
  return 'REACHABLE but CORS BLOCKED — server responds, no CORS headers';
}

// Usage
const probe = await probeURL('https://example.com');
console.table(probe);
```

### Interpreting the Results

| `image_ping` | `fetch_opaque` | `fetch_cors` | Meaning |
|---|---|---|---|
| ✓ | ✓ | ✓ | Full access — CORS headers present |
| ✓ | ✓ | ✗ | Server reachable, CORS not configured |
| ✓ | ✗ | ✗ | Firewall blocks fetch but not img (unusual) |
| ✗ | ✗ | ✗ | Completely blocked — firewall or server down |

---

## 8. The Proxy Solution

The only way to reliably read cross-origin content is a proxy server you
control. The proxy makes the request server-side (no CORS), returns the result
with `Access-Control-Allow-Origin: *`.

### 8.1 Minimal Proxy — Node.js / Express

```js
// proxy.js — run with: node proxy.js
const express = require('express');
const app     = express();

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin',  '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/proxy', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).json({ error: 'Missing url param' });

  // Basic allowlist — prevent open proxy abuse
  const allowed = ['api.example.com', 'cdn.example.com'];
  try {
    const host = new URL(target).hostname;
    if (!allowed.includes(host)) return res.status(403).json({ error: 'Domain not allowed' });
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const upstream = await fetch(target, {
      headers: { 'User-Agent': 'MyProxy/1.0' }
    });
    const body = await upstream.text();
    res.status(upstream.status).send(body);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('Proxy running on http://localhost:3001'));
```

```js
// Client-side — fetch through your proxy
async function proxiedFetch(url) {
  const proxyBase = 'http://localhost:3001/proxy';
  const res = await fetch(proxyBase + '?url=' + encodeURIComponent(url));
  return res;
}

const res  = await proxiedFetch('https://example.com/api/data');
const data = await res.json();
```

---

### 8.2 Serverless Proxy — Cloudflare Worker (free tier)

```js
// Deploy at: https://dash.cloudflare.com → Workers
export default {
  async fetch(request) {
    const url    = new URL(request.url);
    const target = url.searchParams.get('url');
    if (!target) return new Response('Missing url', { status: 400 });

    const upstream = await fetch(target, {
      headers: { 'User-Agent': 'CF-Proxy/1.0' }
    });

    const response = new Response(upstream.body, upstream);
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }
};
```

```js
// Client usage
const res  = await fetch('https://your-worker.your-name.workers.dev/?url=' + encodeURIComponent(target));
const text = await res.text();
```

---

## 9. Best-Practice Fetch Wrapper

A single utility that handles timeouts, retries, CORS fallback, and useful
error messages:

```js
class SmartFetch {
  constructor(options = {}) {
    this.timeout    = options.timeout    || 8000;
    this.retries    = options.retries    || 1;
    this.proxyBase  = options.proxyBase  || null;
    this.retryDelay = options.retryDelay || 500;
  }

  async fetch(url, fetchOptions = {}) {
    let lastError;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      if (attempt > 0) await this._delay(this.retryDelay * attempt);

      // ── Try direct fetch with CORS ────────────────────────────
      try {
        const res = await this._fetchWithTimeout(url, {
          mode:        'cors',
          cache:       'no-store',
          credentials: 'omit',
          ...fetchOptions,
        });
        return { res, method: 'cors', attempt };
      } catch (corsErr) {
        lastError = corsErr;
      }

      // ── Try via proxy if configured ───────────────────────────
      if (this.proxyBase) {
        try {
          const proxyUrl = this.proxyBase + '?url=' + encodeURIComponent(url);
          const res = await this._fetchWithTimeout(proxyUrl, {
            cache: 'no-store',
            ...fetchOptions,
          });
          return { res, method: 'proxy', attempt };
        } catch (proxyErr) {
          lastError = proxyErr;
        }
      }
    }

    // ── Fall back: no-cors reachability check ─────────────────
    try {
      await this._fetchWithTimeout(url, {
        mode:        'no-cors',
        cache:       'no-store',
        credentials: 'omit',
      });
      throw Object.assign(lastError, {
        reachable: true,
        diagnosis: 'Server reachable but CORS not configured'
      });
    } catch (err) {
      if (err.reachable) throw err;
      throw Object.assign(lastError, {
        reachable: false,
        diagnosis: 'Server unreachable — firewall or server down'
      });
    }
  }

  _fetchWithTimeout(url, options) {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeout);
    return fetch(url, { ...options, signal: ctrl.signal })
      .finally(() => clearTimeout(timer));
  }

  _delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
}

// ── Usage ─────────────────────────────────────────────────────

const client = new SmartFetch({
  timeout:   6000,
  retries:   2,
  proxyBase: 'https://your-worker.workers.dev/',
});

try {
  const { res, method } = await client.fetch('https://api.example.com/data');
  console.log('Fetched via:', method);         // 'cors' or 'proxy'
  const data = await res.json();
} catch (err) {
  console.error('Failed:', err.diagnosis);      // human-readable reason
  console.error('Reachable:', err.reachable);   // true = CORS issue; false = network issue
}
```

---

## 10. Decision Flowchart

```
Do you need to READ the response content?
│
├─ NO ──► Use mode:'no-cors' fetch or <img> ping
│          Fastest, broadest reach, binary result only
│
└─ YES
    │
    Does the target server have CORS headers?
    │
    ├─ YES ──► Standard fetch() with no custom headers
    │           Keep request "simple" to avoid preflight
    │
    └─ NO
        │
        Do you control the target server?
        │
        ├─ YES ──► Add CORS headers to the server response
        │           Access-Control-Allow-Origin: *
        │
        └─ NO
            │
            Can you run a proxy?
            │
            ├─ YES ──► Route requests through your proxy
            │           Cloudflare Worker free tier works well
            │
            └─ NO ──► You cannot read arbitrary cross-origin
                       content from a browser. Options:
                       • Browser extension (bypasses CORS)
                       • Ask user to install a local proxy
                       • Use no-cors + opaque response for
                         reachability testing only
```

---

## Quick Reference

```js
// ── 1. Best for APIs with CORS ────────────────────────────────
const res = await fetch(url, {
  method: 'GET',
  mode: 'cors',
  cache: 'no-store',
  credentials: 'omit',
  signal: AbortSignal.timeout(8000),  // modern browsers
});

// ── 2. Best for reachability testing ─────────────────────────
const res = await fetch(url, {
  method: 'GET',
  mode: 'no-cors',     // never throws for CORS
  cache: 'no-store',
  credentials: 'omit',
  signal: AbortSignal.timeout(8000),
});
// res.type === 'opaque', status === 0, body unreadable

// ── 3. Best for broadest reachability (image ping) ────────────
const reachable = await new Promise(res => {
  const img = new Image();
  const tid = setTimeout(() => { img.src=''; res(false); }, 6000);
  img.onload  = img.onerror = () => { clearTimeout(tid); res(true); };
  img.src = url + '?_=' + Date.now();
});

// ── 4. Avoid preflight — keep headers minimal ─────────────────
// DON'T add these unless you need them:
// 'Content-Type': 'application/json'  ← triggers preflight
// 'Authorization': 'Bearer ...'       ← triggers preflight
// Any 'X-' custom header              ← triggers preflight

// ── 5. Always add a timeout ──────────────────────────────────
// AbortSignal.timeout() — modern (Chrome 103+, FF 100+, Safari 16+)
fetch(url, { signal: AbortSignal.timeout(8000) });

// AbortController — universal fallback
const ctrl = new AbortController();
setTimeout(() => ctrl.abort(), 8000);
fetch(url, { signal: ctrl.signal });
```

---

*All techniques run entirely in the browser. No libraries required.*  
*Proxy examples require a server or Cloudflare Workers account (free tier sufficient).*
