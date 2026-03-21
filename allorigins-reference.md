# api.allorigins.win — Comprehensive Reference

A complete guide to every endpoint, parameter, response field, use case, limitation,
and workaround for the allOrigins CORS proxy service.

---

## What It Is

allOrigins is a free, open-source CORS proxy. You give it a URL; it fetches that URL
server-side and returns the content to your browser with
`Access-Control-Allow-Origin: *` headers attached. Your browser can then read the
response even if the original site has no CORS headers.

It is a JavaScript/Node.js clone of the original AnyOrigin service, itself inspired by
WhateverOrigin. The source code is MIT licensed and self-hostable.

- **Homepage:** https://allorigins.win/
- **GitHub repo:** https://github.com/gnuns/allOrigins
- **Docker Hub:** https://hub.docker.com/r/computeronix/allorigins
- **Base API URL:** `https://api.allorigins.win`

**Google searches used while writing this document:**
- [allorigins.win documentation endpoints parameters](https://www.google.com/search?q=api.allorigins.win+documentation+endpoints+parameters)
- [allorigins limitations rate limits caching known issues 2024](https://www.google.com/search?q=allorigins.win+limitations+rate+limits+caching+behavior+size+limits+known+issues+2024)
- [allorigins response format status_code content_type headers JSON envelope](https://www.google.com/search?q=allorigins.win+%22data.contents%22+%22data.status%22+full+response+object+fields+self-host+docker)
- [allorigins blocked sites authentication cookies limitations](https://www.google.com/search?q=allorigins.win+blocked+sites+authentication+cookies+limitations+what+it+cannot+do)

---

## The Three Endpoints

### 1. `/get` — JSON envelope (most common)

Returns the fetched content wrapped in a JSON object alongside metadata.

```
GET https://api.allorigins.win/get?url=<encoded-url>
```

**Example:**
```
https://api.allorigins.win/get?url=https%3A%2F%2Fexample.com
```

**Response shape:**
```json
{
  "contents": "<html>...</html>",
  "status": {
    "url": "https://example.com",
    "content_type": "text/html; charset=UTF-8",
    "http_code": 200
  }
}
```

| Field | Type | Description |
|---|---|---|
| `contents` | string | Full response body as a string. Will be `null` if the request failed. |
| `status.url` | string | The final URL after any redirects |
| `status.content_type` | string | `Content-Type` header returned by the target server |
| `status.http_code` | number | HTTP status code from the target server (200, 404, 500, etc.) |

**JavaScript fetch example:**
```js
const target = 'https://api.quotable.io/random';
const url = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;

const response = await fetch(url);
const data = await response.json();

console.log(data.status.http_code);   // e.g. 200
console.log(data.status.content_type); // e.g. "application/json"
console.log(data.contents);           // the raw response body string
```

**Parse JSON from the target (when target returns JSON):**
```js
const target = 'https://api.coindesk.com/v1/bpi/currentprice.json';
const url = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;

const res = await fetch(url);
const wrapper = await res.json();

// wrapper.contents is a string — parse it again
const coinData = JSON.parse(wrapper.contents);
console.log(coinData.bpi.USD.rate);
```

The double-parse (`response.json()` then `JSON.parse(data.contents)`) is the most
common source of confusion with `/get`. The outer envelope is always JSON; the inner
`contents` field is always a string regardless of the target's content type.

---

### 2. `/raw` — Direct passthrough (simplest)

Returns the fetched content exactly as the target server sent it, with CORS headers
added. No JSON wrapping. The response `Content-Type` matches whatever the target
returned.

```
GET https://api.allorigins.win/raw?url=<encoded-url>
```

**Example:**
```
https://api.allorigins.win/raw?url=https%3A%2F%2Fapi.open-meteo.com%2Fv1%2Fforecast%3Flatitude%3D51.5%26longitude%3D-0.1%26current_weather%3Dtrue
```

**JavaScript fetch example:**
```js
const target = 'https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1&current_weather=true';
const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`;

const res = await fetch(url);
const data = await res.json(); // works directly when target returns JSON
console.log(data.current_weather.temperature);
```

Use `/raw` when:
- The target returns JSON and you want to call `.json()` once, not twice
- The target returns binary data (images, files) — though see limitations below
- You want to pipe the response directly without unwrapping

Use `/get` when:
- You need the HTTP status code of the target response
- You need to know the target's `Content-Type`
- You want to detect whether the target returned an error vs. content

---

### 3. `/get?callback=` — JSONP

Returns the JSON envelope wrapped in a callback function call. Used to inject
cross-origin data via a `<script>` tag rather than `fetch()`.

```
GET https://api.allorigins.win/get?callback=myFunction&url=<encoded-url>
```

**Example:**
```
https://api.allorigins.win/get?callback=handleResult&url=https%3A%2F%2Fexample.com
```

**Response body:**
```js
handleResult({"contents":"<html>...</html>","status":{"url":"...","http_code":200}})
```

**Script tag usage:**
```js
function handleResult(data) {
  console.log(data.contents);
}

const script = document.createElement('script');
script.src = `https://api.allorigins.win/get?callback=handleResult&url=${encodeURIComponent('https://example.com')}`;
document.head.appendChild(script);
```

JSONP is generally unnecessary now that `/raw` and `/get` both serve with full CORS
headers. It remains useful when you need to target environments that cannot use
`fetch()` at all, or when `callback=` is a valid pattern the target API already
supports.

---

## Query Parameters

| Parameter | Endpoint | Description | Example |
|---|---|---|---|
| `url` | all | **Required.** The target URL, percent-encoded. | `?url=https%3A%2F%2Fexample.com` |
| `callback` | `/get` | JSONP callback function name. Switches response from JSON to JSONP. | `?callback=myFn&url=...` |
| `charset` | `/get` | Override character encoding for the response. Use when the target returns garbled text. | `?charset=ISO-8859-1&url=...` |

---

## URL Encoding

Always encode the target URL with `encodeURIComponent()`. Never use `encodeURI()` —
it does not encode characters like `?`, `&`, and `=` which will break the proxy
parameter parsing.

```js
// Correct
const proxy = 'https://api.allorigins.win/raw?url=';
const target = 'https://api.example.com/data?page=1&limit=50';
const url = proxy + encodeURIComponent(target);

// Wrong — & in target bleeds into proxy query string
const url = proxy + target;
```

For URLs with query strings, always encode the entire target including its parameters:

```js
const target = new URL('https://api.open-meteo.com/v1/forecast');
target.searchParams.set('latitude', '51.5074');
target.searchParams.set('longitude', '-0.1278');
target.searchParams.set('current_weather', 'true');

const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(target.toString())}`;
```

---

## Complete Working Examples

### Fetch a JSON API (single-parse with `/raw`)
```js
async function getWeather(lat, lon) {
  const target = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`);
  if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
  return res.json();
}

const weather = await getWeather(51.5, -0.1);
console.log(weather.current_weather.temperature); // e.g. 14.2
```

### Fetch a JSON API with status check (double-parse with `/get`)
```js
async function safeGet(targetUrl) {
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
  const res = await fetch(proxy);
  if (!res.ok) throw new Error(`Proxy HTTP error: ${res.status}`);
  const wrapper = await res.json();

  if (wrapper.status.http_code !== 200) {
    throw new Error(`Target returned ${wrapper.status.http_code}: ${targetUrl}`);
  }

  // Parse contents if the target is JSON
  const isJson = (wrapper.status.content_type || '').includes('application/json');
  return isJson ? JSON.parse(wrapper.contents) : wrapper.contents;
}

const data = await safeGet('https://api.coindesk.com/v1/bpi/currentprice.json');
console.log(data.bpi.USD.rate);
```

### Fetch HTML and parse it
```js
async function scrapeTitle(pageUrl) {
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(pageUrl)}`;
  const res = await fetch(proxy);
  const { contents } = await res.json();

  const parser = new DOMParser();
  const doc = parser.parseFromString(contents, 'text/html');
  return doc.querySelector('title')?.textContent;
}

const title = await scrapeTitle('https://example.com');
console.log(title); // "Example Domain"
```

### Reusable proxy wrapper function
```js
const allOrigins = {
  get:  url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  raw:  url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  jsonp: (url, cb) => `https://api.allorigins.win/get?callback=${cb}&url=${encodeURIComponent(url)}`,

  async fetchJSON(url) {
    const res = await fetch(this.raw(url));
    return res.json();
  },

  async fetchText(url) {
    const res = await fetch(this.raw(url));
    return res.text();
  },

  async fetchWithMeta(url) {
    const res = await fetch(this.get(url));
    const data = await res.json();
    return {
      body: data.contents,
      httpCode: data.status.http_code,
      contentType: data.status.content_type,
      finalUrl: data.status.url,
    };
  },
};

// Usage
const quote = await allOrigins.fetchJSON('https://api.quotable.io/random');
const { body, httpCode } = await allOrigins.fetchWithMeta('https://example.com');
```

### jQuery
```js
$.getJSON(
  'https://api.allorigins.win/get?url=' + encodeURIComponent('https://api.coindesk.com/v1/bpi/currentprice.json'),
  function(data) {
    const price = JSON.parse(data.contents).bpi.USD.rate;
    alert('BTC: $' + price);
  }
);
```

### Async/await with error handling
```js
async function fetchViaProxy(targetUrl, parseJson = true) {
  const endpoint = parseJson
    ? `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
    : `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`Proxy responded with ${res.status}`);
    return parseJson ? await res.json() : await res.text();
  } catch (e) {
    console.error('allOrigins proxy failed:', e.message);
    return null;
  }
}
```

### Fetching with charset override (non-UTF-8 pages)
```js
// Portuguese Wikipedia uses UTF-8 but some older sites use ISO-8859-1
const url = `https://api.allorigins.win/get?charset=ISO-8859-1&url=${encodeURIComponent('https://example-legacy-site.com')}`;
const res = await fetch(url);
const { contents } = await res.json();
```

---

## Self-Hosting

The service is straightforward to run locally, giving you no rate limits and full
control. This is the best option for any non-trivial use.

### Node.js
```bash
git clone https://github.com/gnuns/AllOrigins
cd AllOrigins
npm install
npm start            # runs on port 1458 by default
```

Then replace `https://api.allorigins.win` with `http://localhost:1458` in all your
URLs.

### Docker
```bash
docker run -p 1458:1458 computeronix/allorigins
```

Or with Docker Compose:
```yaml
version: '3'
services:
  allorigins:
    image: computeronix/allorigins
    ports:
      - "1458:1458"
    restart: unless-stopped
```

After starting, the API is at `http://localhost:1458`.

---

## Limitations and What It Cannot Do

### Things that will fail silently

**Cloudflare-protected sites and bot detection**
Sites behind Cloudflare's bot protection, Akamai, or similar services will often return
a challenge page (403, or an HTML Cloudflare interstitial) rather than the actual
content. `data.status.http_code` may still show 200 because the challenge page itself
returns 200 — but `data.contents` will be a Cloudflare HTML page, not your target
content.

**JavaScript-rendered content**
allOrigins is a plain HTTP proxy — it has no browser and runs no JavaScript. Anything
rendered client-side (React SPAs, Angular apps, dynamically loaded content) will not
be present in the fetched HTML. You will get only the initial server-delivered HTML,
which for many modern sites is nearly empty.

**Login-protected pages and sessions**
The proxy makes unauthenticated requests. It cannot send your session cookies,
authentication tokens, or any credentials to the target. Pages that require login will
return a login page or a redirect, not the protected content.

**Sites that block by user agent**
Some sites serve a block page when the user agent is not a real browser. The allOrigins
user agent is identifiable and may be blocked by sites with aggressive bot filtering.
If the target blocks it, `contents` will be an error page and `http_code` will be 403
or 401.

**Binary content via `/get`**
The `/get` endpoint wraps everything as a JSON string. Binary data (images, PDFs,
zip files) will be corrupted when coerced to a string. Use `/raw` for binary content —
though even then, reading binary data into JavaScript from a proxy is awkward and
usually better handled by simply referencing the URL directly as an `<img src>` or
`<a href>`.

**Large responses**
The public instance has an undocumented response size limit. Very large pages or
files may be truncated or rejected. Self-hosting removes this limit entirely.

**Rate limits**
The public instance is rate-limited. The exact limit is not publicly documented, but
community reports indicate it is fairly low. It is intended for development and
prototyping, not production traffic. Self-host for any production use.

**No request caching**
The proxy does not cache responses by default. Every call fetches fresh from the target.
If you call the proxy repeatedly for the same URL, the target server sees every request.
This can trigger the target's own rate limiting. Implement your own caching layer if
needed.

**No POST, PUT, PATCH, DELETE**
allOrigins only supports GET requests. It is a read-only proxy. You cannot submit
forms, post JSON bodies, or make any mutating request through it.

**HTTPS-only target recommended**
While the proxy supports HTTP targets, many browsers will block loading HTTP content
when your page is on HTTPS (mixed content policy). Stick to HTTPS target URLs.

---

## Comparison with Similar Services

| Feature | allOrigins `/get` | allOrigins `/raw` | corsproxy.io | cors-anywhere |
|---|---|---|---|---|
| Response format | JSON envelope | Passthrough | Passthrough | Passthrough |
| Need to double-parse JSON? | Yes | No | No | No |
| Returns HTTP status of target | Yes (`data.status.http_code`) | No | No | No |
| Returns Content-Type of target | Yes (`data.status.content_type`) | No | No | No |
| JSONP support | Yes | No | No | No |
| Charset parameter | Yes | No | No | No |
| Rate limit | Undocumented, low | Same | Undocumented | Very low (demo) |
| Self-hostable | Yes (Node.js/Docker) | Same | No | Yes |
| Production suitable | No | No | No | No |

---

## Common Mistakes

**Forgetting to double-parse JSON with `/get`**
```js
// Wrong — data.contents is a STRING, not an object
const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`);
const data = await res.json();
console.log(data.contents.someField); // undefined

// Correct
const parsed = JSON.parse(data.contents);
console.log(parsed.someField); // works
```

**Not checking `data.status.http_code`**
The proxy itself returns HTTP 200 even when the target returned 404 or 500. You must
read `data.status.http_code` if you care about the target's actual status:
```js
const { contents, status } = await fetch(proxyUrl).then(r => r.json());
if (status.http_code !== 200) {
  throw new Error(`Target error: ${status.http_code}`);
}
```

**Using `encodeURI` instead of `encodeURIComponent`**
```js
// Wrong — does not encode & and = in target query strings
`https://api.allorigins.win/raw?url=${encodeURI(target)}`

// Correct
`https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`
```

**Expecting cookies or auth to carry through**
The proxy strips all request credentials. It makes an anonymous GET to the target.

**Using it for production traffic**
The public instance is a shared community resource. Heavy or sustained traffic will
hit rate limits and may get your IP blocked. Self-host or use a proper proxy service
with an SLA.

---

## When to Use Which Endpoint

```
Target returns JSON, you want to call .json() once:
  → /raw

Target returns HTML you want to parse:
  → /get  (need the string; /raw works too)

You need to know the target's HTTP status code:
  → /get  (check data.status.http_code)

You need to detect the target's Content-Type:
  → /get  (check data.status.content_type)

You're in an environment without fetch():
  → /get?callback=myFn  (JSONP via script tag)

Target page uses non-UTF-8 encoding:
  → /get?charset=ISO-8859-1

You want to pass binary data through:
  → /raw  (and handle as blob)
```

---

## Quick Reference Card

```
Base:      https://api.allorigins.win

Endpoints:
  /get?url=<encoded>                 JSON envelope: {contents, status}
  /raw?url=<encoded>                 Direct passthrough, CORS headers added
  /get?callback=fn&url=<encoded>     JSONP

Parameters:
  url=        Required. encodeURIComponent() the entire target URL
  callback=   JSONP function name (only with /get)
  charset=    Override encoding e.g. ISO-8859-1 (only with /get)

/get response:
  data.contents          string — the response body
  data.status.http_code  number — target's HTTP status code
  data.status.content_type  string — target's Content-Type header
  data.status.url        string — final URL after redirects

Cannot do:
  POST / PUT / PATCH / DELETE
  Authenticated requests (no cookies, no auth headers)
  JavaScript-rendered content
  Large files (undocumented size limit)
  Production traffic (no SLA, rate limited)

Self-host:
  npm: git clone https://github.com/gnuns/AllOrigins && npm install && npm start
  Docker: docker run -p 1458:1458 computeronix/allorigins
```
