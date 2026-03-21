# Sites That Allow CORS Fetch

> A reference list of publicly accessible domains, subdomains, and files that send
> `Access-Control-Allow-Origin: *` (or dynamically reflect the request origin),
> enabling direct `fetch()` calls from browser JavaScript without a proxy.
>
> **Key:** 🌐 = whole domain | 📂 = subdomain or path level | 📄 = file/endpoint level
> **Auth column:** 🔓 = no key needed | 🔑 = API key required (but CORS still enabled)
>
> CORS only bypasses the *same-origin browser restriction* — it does not bypass
> rate limits, authentication, or IP bans.  Headers noted as `*` cannot be combined
> with `credentials: 'include'` per the CORS spec.

---

## CDNs & Static File Hosts

| # | Site | Level | Auth | Example | Notes |
|---|------|-------|------|---------|-------|
| 1 | **cdn.jsdelivr.net** | 🌐 | 🔓 | `fetch('https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js')` | `Access-Control-Allow-Origin: *` on all served files; npm, GitHub, WordPress packages |
| 2 | **cdnjs.cloudflare.com** | 🌐 | 🔓 | `fetch('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js')` | `Access-Control-Allow-Origin: *`; occasional edge-cache hiccups on 404s |
| 3 | **unpkg.com** | 🌐 | 🔓 | `fetch('https://unpkg.com/react@18/umd/react.production.min.js')` | `Access-Control-Allow-Origin: *`; npm package mirror |
| 4 | **raw.githubusercontent.com** | 🌐 | 🔓 | `fetch('https://raw.githubusercontent.com/user/repo/main/file.json')` | `Access-Control-Allow-Origin: *`; public repos only; GET/HEAD only |
| 5 | **\<user\>.github.io** | 🌐 | 🔓 | `fetch('https://username.github.io/repo/data.json')` | GitHub Pages sends `Access-Control-Allow-Origin: *` for all public sites; GET/HEAD only |
| 6 | **storage.googleapis.com** | 📂 | 🔓/🔑 | `fetch('https://storage.googleapis.com/your-bucket/file.json')` | GCS JSON API always allows CORS regardless of bucket config; XML API respects bucket-level CORS config |
| 7 | **\*.s3.amazonaws.com** | 📂 | 🔓/🔑 | `fetch('https://mybucket.s3.amazonaws.com/public.json')` | S3 honours per-bucket CORS config; many public buckets are configured with `*` |

---

## DNS-over-HTTPS (DoH) Resolvers

All respond to unauthenticated GET requests with `Access-Control-Allow-Origin: *`.
Endpoint accepts `application/dns-json` and returns JSON records.

| # | Resolver | Level | Auth | Example |
|---|----------|-------|------|---------|
| 8 | **cloudflare-dns.com** | 🌐 | 🔓 | `fetch('https://cloudflare-dns.com/dns-query?name=example.com&type=A', {headers:{Accept:'application/dns-json'}})` |
| 9 | **dns.google** | 🌐 | 🔓 | `fetch('https://dns.google/resolve?name=example.com&type=MX')` |
| 10 | **dns.quad9.net:5053** | 📂 | 🔓 | `fetch('https://dns.quad9.net:5053/dns-query?name=example.com&type=TXT', {headers:{Accept:'application/dns-json'}})` |

---

## IP Geolocation & Network Info

| # | Site | Level | Auth | Example | Notes |
|---|------|-------|------|---------|-------|
| 11 | **ipinfo.io** | 🌐 | 🔓/🔑 | `fetch('https://ipinfo.io/json')` — own IP; `fetch('https://ipinfo.io/8.8.8.8/json')` — specific IP | Free tier limited to ~50k req/month; `*` header on all responses |
| 12 | **ipwho.is** | 🌐 | 🔓 | `fetch('https://ipwho.is/1.1.1.1')` | No key, generous rate limits, JSON, `*` header |
| 13 | **freeipapi.com** | 🌐 | 🔓 | `fetch('https://freeipapi.com/api/json/8.8.8.8')` | No key required, CORS enabled |
| 14 | **api.ipify.org** | 🌐 | 🔓 | `fetch('https://api.ipify.org?format=json')` | Returns caller's public IP only; `*` header |
| 15 | **api64.ipify.org** | 🌐 | 🔓 | `fetch('https://api64.ipify.org?format=json')` | IPv4/IPv6 dual-stack variant |
| 16 | **api.my-ip.io** | 🌐 | 🔓 | `fetch('https://api.my-ip.io/v2/ip.json')` | Caller's IP only; `*` header |

---

## Weather & Environment

| # | Site | Level | Auth | Example | Notes |
|---|------|-------|------|---------|-------|
| 17 | **api.open-meteo.com** | 🌐 | 🔓 | `fetch('https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.1&current_weather=true')` | Explicitly advertises "CORS supported, no API key"; open-source; non-commercial use |
| 18 | **api.openweathermap.org** | 🌐 | 🔑 | `fetch('https://api.openweathermap.org/data/2.5/weather?q=London&appid=KEY')` | Requires free API key; `api.` domain has CORS enabled (the `samples.` subdomain does not) |
| 19 | **api.weatherapi.com** | 🌐 | 🔑 | `fetch('https://api.weatherapi.com/v1/current.json?key=KEY&q=Paris')` | Free tier with API key; `Access-Control-Allow-Origin: *` |

---

## Astronomy & Science

| # | Site | Level | Auth | Example | Notes |
|---|------|-------|------|---------|-------|
| 20 | **api.nasa.gov** | 🌐 | 🔓/🔑 | `fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY')` | `DEMO_KEY` works for ~30 req/hour; full key free at api.nasa.gov; CORS enabled |
| 21 | **launchpad.net** | 📄 | 🔓 | `fetch('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?format=json')` | Launch Library 2 (The Space Devs); rate-limited; public endpoint CORS enabled |
| 22 | **api.le-systeme-solaire.net** | 🌐 | 🔓 | `fetch('https://api.le-systeme-solaire.net/rest/bodies/')` | Solar system bodies data; no key; `Access-Control-Allow-Origin: *` |

---

## REST Testing & Fake Data

| # | Site | Level | Auth | Example | Notes |
|---|------|-------|------|---------|-------|
| 23 | **jsonplaceholder.typicode.com** | 🌐 | 🔓 | `fetch('https://jsonplaceholder.typicode.com/posts/1')` | Classic fake REST API; `Access-Control-Allow-Origin: *` on all verbs (GET, POST, PUT, DELETE); responses are simulated |
| 24 | **reqres.in** | 🌐 | 🔓 | `fetch('https://reqres.in/api/users?page=2')` | Fake user data; `*` header; supports pagination simulation |
| 25 | **dummyjson.com** | 🌐 | 🔓 | `fetch('https://dummyjson.com/products/1')` | Products, carts, users, todos; `Access-Control-Allow-Origin: *` |
| 26 | **httpbin.org** | 🌐 | 🔓 | `fetch('https://httpbin.org/get')` | Echoes request details; useful for header inspection; `*` header |
| 27 | **httpbin.io** | 🌐 | 🔓 | `fetch('https://httpbin.io/headers')` | Mirror/alternative of httpbin.org |
| 28 | **postman-echo.com** | 🌐 | 🔓 | `fetch('https://postman-echo.com/get?foo=bar')` | Echoes query params and headers; `*` header |

---

## Countries, Languages & Geography

| # | Site | Level | Auth | Example | Notes |
|---|------|-------|------|---------|-------|
| 29 | **restcountries.com** | 🌐 | 🔓 | `fetch('https://restcountries.com/v3.1/name/france')` | Country data (population, flags, currencies, languages); `Access-Control-Allow-Origin: *` |
| 30 | **api.countrylayer.com** | 🌐 | 🔑 | `fetch('https://api.countrylayer.com/v2/all?access_key=KEY')` | Alternative countries API; free tier with key |
| 31 | **timeapi.io** | 🌐 | 🔓 | `fetch('https://timeapi.io/api/Time/current/zone?timeZone=Europe/London')` | Timezone and current time data; no key; CORS enabled |
| 32 | **worldtimeapi.org** | 🌐 | 🔓 | `fetch('https://worldtimeapi.org/api/timezone/America/New_York')` | Current time with DST info; `Access-Control-Allow-Origin: *` |

---

## Finance & Currency

| # | Site | Level | Auth | Example | Notes |
|---|------|-------|------|---------|-------|
| 33 | **api.frankfurter.app** | 🌐 | 🔓 | `fetch('https://api.frankfurter.app/latest?from=USD&to=EUR,GBP')` | Exchange rates from ECB; no key; `Access-Control-Allow-Origin: *` |
| 34 | **api.currencyapi.com** | 🌐 | 🔑 | `fetch('https://api.currencyapi.com/v3/latest?apikey=KEY&currencies=EUR,GBP')` | Free tier 300 req/month; CORS enabled |
| 35 | **api.coindesk.com** | 🌐 | 🔓 | `fetch('https://api.coindesk.com/v1/bpi/currentprice.json')` | Bitcoin price index; no key; `Access-Control-Allow-Origin: *` |
| 36 | **api.coingecko.com** | 🌐 | 🔓/🔑 | `fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')` | Crypto prices; free no-key tier has CORS but rate-limited; Pro key increases limits |

---

## Gaming & Entertainment

| # | Site | Level | Auth | Example | Notes |
|---|------|-------|------|---------|-------|
| 37 | **pokeapi.co** | 🌐 | 🔓 | `fetch('https://pokeapi.co/api/v2/pokemon/pikachu')` | Pokémon data; `Access-Control-Allow-Origin: *`; use HTTPS only (HTTP redirect does not carry CORS header) |
| 38 | **swapi.dev** | 🌐 | 🔓 | `fetch('https://swapi.dev/api/people/1/')` | Star Wars API; `Access-Control-Allow-Origin: *`; confirmed working on main domain (swapi.co is defunct) |
| 39 | **deckofcardsapi.com** | 🌐 | 🔓 | `fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')` | Card deck operations; no key; `*` header |
| 40 | **opentdb.com** | 🌐 | 🔓 | `fetch('https://opentdb.com/api.php?amount=10&type=multiple')` | Open Trivia Database; no key; `Access-Control-Allow-Origin: *` |
| 41 | **api.jikan.moe** | 🌐 | 🔓 | `fetch('https://api.jikan.moe/v4/anime/1')` | MyAnimeList unofficial API; `Access-Control-Allow-Origin: *` |

---

## Animals & Fun

| # | Site | Level | Auth | Example | Notes |
|---|------|-------|------|---------|-------|
| 42 | **dog.ceo** | 🌐 | 🔓 | `fetch('https://dog.ceo/api/breeds/image/random')` | Dog images by breed; `Access-Control-Allow-Origin: *` |
| 43 | **api.thecatapi.com** | 🌐 | 🔓/🔑 | `fetch('https://api.thecatapi.com/v1/images/search')` | Cat images and breeds; no key works for basic fetch; CORS enabled |
| 44 | **randomfox.ca** | 🌐 | 🔓 | `fetch('https://randomfox.ca/floof/')` | Random fox images (JSON with URL); `Access-Control-Allow-Origin: *` |
| 45 | **shibe.online** | 🌐 | 🔓 | `fetch('https://shibe.online/api/shibes?count=1&urls=true')` | Shiba Inu, cats, birds; `Access-Control-Allow-Origin: *` |
| 46 | **official-joke-api.appspot.com** | 🌐 | 🔓 | `fetch('https://official-joke-api.appspot.com/random_joke')` | Random jokes JSON; `*` header |
| 47 | **v2.jokeapi.dev** | 🌐 | 🔓 | `fetch('https://v2.jokeapi.dev/joke/Any?safe-mode')` | Multi-category jokes; `Access-Control-Allow-Origin: *` |
| 48 | **api.quotable.io** | 🌐 | 🔓 | `fetch('https://api.quotable.io/random')` | Random quotes with author; `Access-Control-Allow-Origin: *` |
| 49 | **uselessfacts.jsph.pl** | 🌐 | 🔓 | `fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')` | Random useless fact; `*` header |

---

## Books, Text & Knowledge

| # | Site | Level | Auth | Example | Notes |
|---|------|-------|------|---------|-------|
| 50 | **openlibrary.org** (API) | 🌐 | 🔓 | `fetch('https://openlibrary.org/search.json?q=tolkien&limit=5')` | Open Library search; `Access-Control-Allow-Origin: *` |
| 51 | **gutendex.com** | 🌐 | 🔓 | `fetch('https://gutendex.com/books/?search=dickens')` | Project Gutenberg index API; no key; CORS enabled |
| 52 | **api.dictionaryapi.dev** | 🌐 | 🔓 | `fetch('https://api.dictionaryapi.dev/api/v2/entries/en/hello')` | Free English dictionary with phonetics; `Access-Control-Allow-Origin: *` |
| 53 | **en.wikipedia.org** (Action API) | 📄 | 🔓 | `fetch('https://en.wikipedia.org/w/api.php?action=query&titles=Rust_(programming_language)&prop=extracts&format=json&origin=*')` | Must append `&origin=*` to query string; any Wikimedia wiki supported |
| 54 | **commons.wikimedia.org** (Action API) | 📄 | 🔓 | `fetch('https://commons.wikimedia.org/w/api.php?action=query&list=allimages&ailimit=3&format=json&origin=*')` | Image search and metadata; requires `origin=*` param |

---

## Music

| # | Site | Level | Auth | Example | Notes |
|---|------|-------|------|---------|-------|
| 55 | **itunes.apple.com/search** | 🌐 | 🔓 | `fetch('https://itunes.apple.com/search?term=radiohead&entity=album&limit=5')` | iTunes Search API; `Access-Control-Allow-Origin: *` on all search/lookup endpoints |
| 56 | **api.deezer.com** | 🌐 | 🔓 | `fetch('https://api.deezer.com/search?q=pink+floyd&limit=5')` | Deezer music search; `Access-Control-Allow-Origin: *`; no key for read-only endpoints |
| 57 | **musicbrainz.org** (API) | 🌐 | 🔓 | `fetch('https://musicbrainz.org/ws/2/artist/?query=nirvana&fmt=json', {headers:{'User-Agent':'YourApp/1.0 (contact@example.com)'}})` | Open music metadata; CORS enabled; User-Agent header required to avoid 403 |

---

## Image Placeholder & Generation

> These serve actual image binaries. `fetch()` can retrieve them and pipe
> to `createObjectURL()`, or reference them directly in `<img src>` tags.
> Some require `crossOrigin="anonymous"` for canvas use.

| # | Site | Level | Auth | Example | Notes |
|---|------|-------|------|---------|-------|
| 58 | **robohash.org** | 🌐 | 🔓 | `fetch('https://robohash.org/mystring.png?size=200x200')` then `.blob()` | Generates robot/monster/cat images from any string; binary PNG/SVG/JPG response |
| 59 | **ui-avatars.com** | 🌐 | 🔓 | `fetch('https://ui-avatars.com/api/?name=John+Doe&size=128')` | Initials avatars; PNG; `Access-Control-Allow-Origin: *` |
| 60 | **avatars.dicebear.com** (v8+) | 🌐 | 🔓 | `fetch('https://api.dicebear.com/8.x/bottts/svg?seed=abc')` | Vector SVG avatars; newer `api.dicebear.com` domain has CORS enabled (old `avatars.dicebear.com` v1 did not) |
| 61 | **api.multiavatar.com** | 🌐 | 🔓 | `fetch('https://api.multiavatar.com/badger.svg')` | Unique multicultural avatars as SVG; `Access-Control-Allow-Origin: *` |
| 62 | **dummyimage.com** | 🌐 | 🔓 | `fetch('https://dummyimage.com/300x200/000/fff.png')` | Solid colour placeholder images; PNG/GIF/JPG; CORS enabled |
| 63 | **placehold.co** | 🌐 | 🔓 | `fetch('https://placehold.co/400x300/orange/white.png')` | Customisable colour placeholders; `Access-Control-Allow-Origin: *` |
| 64 | **placekitten.com** | 🌐 | 🔓 | `fetch('https://placekitten.com/300/200')` — width/height in path | Kitten photos; binary JPEG; `Access-Control-Allow-Origin: *` |
| 65 | **loremflickr.com** | 🌐 | 🔓 | `fetch('https://loremflickr.com/320/240/cat')` | Flickr-sourced thematic photos; CORS enabled |
| 66 | **source.unsplash.com** | 🌐 | 🔓 | `fetch('https://source.unsplash.com/random/800x600/?nature')` | Random Unsplash photo redirect; image binary is CORS-accessible; the `/random/` endpoint redirects but the final Unsplash CDN URL carries CORS headers |
| 67 | **images.dog.ceo** | 🌐 | 🔓 | Direct image URL from dog.ceo API e.g. `https://images.dog.ceo/breeds/labrador/n02099712_4323.jpg` | CDN images served with `Access-Control-Allow-Origin: *`; use `crossOrigin="anonymous"` for canvas |
| 68 | **cdn2.thecatapi.com** | 🌐 | 🔓 | Image URL from the cat API e.g. `https://cdn2.thecatapi.com/images/MTY3ODIyMQ.jpg` | CORS headers on image CDN |

---

## Developer Utilities

| # | Site | Level | Auth | Example | Notes |
|---|------|-------|------|---------|-------|
| 69 | **data.jsdelivr.com** | 🌐 | 🔓 | `fetch('https://data.jsdelivr.com/v1/package/npm/lodash')` | jsDelivr metadata API; package stats and file lists; `Access-Control-Allow-Origin: *` |
| 70 | **registry.npmjs.org** | 🌐 | 🔓 | `fetch('https://registry.npmjs.org/react')` | npm package metadata (large JSON); `Access-Control-Allow-Origin: *` |
| 71 | **api.github.com** | 🌐 | 🔓/🔑 | `fetch('https://api.github.com/repos/torvalds/linux')` | GitHub REST API; unauthenticated has low rate limits; `Access-Control-Allow-Origin: *` |
| 72 | **internetdb.shodan.io** | 🌐 | 🔓 | `fetch('https://internetdb.shodan.io/1.1.1.1')` | Shodan free host intel (ports, vulns, tags); no key; `Access-Control-Allow-Origin: *` |
| 73 | **api.publicapis.org** | 🌐 | 🔓 | `fetch('https://api.publicapis.org/entries?category=weather')` | Meta-API listing public APIs; CORS enabled |
| 74 | **httpstatus.io** | 🌐 | 🔓 | `fetch('https://httpstatus.io/api/status/200')` | HTTP status code descriptions; `*` header |

---

## Government & Open Data

| # | Site | Level | Auth | Example | Notes |
|---|------|-------|------|---------|-------|
| 75 | **api.usa.gov** | 🌐 | 🔓/🔑 | `fetch('https://api.data.gov/ed/collegescorecard/v1/schools?fields=school.name,latest.student.size&per_page=5&api_key=DEMO_KEY')` | US government open data portal proxy; DEMO_KEY works; `*` header |
| 76 | **data.police.uk** | 🌐 | 🔓 | `fetch('https://data.police.uk/api/forces')` | UK Police open data; `Access-Control-Allow-Origin: *` |
| 77 | **api.nhs.uk** | 🌐 | 🔑 | `fetch('https://api.nhs.uk/conditions', {headers:{'subscription-key':'KEY'}})` | NHS conditions API; free key; CORS enabled |
| 78 | **earthquake.usgs.gov** | 🌐 | 🔓 | `fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson')` | USGS real-time earthquake data; `Access-Control-Allow-Origin: *` |

---

## Wikimedia Image Files (Direct CDN)

Wikimedia/Wikipedia serves all media files through `upload.wikimedia.org`.
Files are served with `Access-Control-Allow-Origin: *` and can be fetched
or displayed cross-origin. Use the image URL from any Wikipedia article
or from the Commons API response.

| # | Site | Level | Example |
|---|------|-------|---------|
| 79 | **upload.wikimedia.org** | 🌐 | `fetch('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/320px-Camponotus_flavomarginatus_ant.jpg')` |

---

## Notes & Caveats

### Mediawiki API (Wikipedia, Commons, Wikidata)
Requires `&origin=*` appended to every query string — the server uses this parameter
to decide whether to send back CORS headers. Without it, no `Access-Control-Allow-Origin`
header is returned even though the content is public:

```js
// Correct:
fetch('https://en.wikipedia.org/w/api.php?action=query&titles=CORS&format=json&origin=*')

// Wrong (will fail in browser):
fetch('https://en.wikipedia.org/w/api.php?action=query&titles=CORS&format=json')
```

### GitHub Pages — file level specificity
GitHub Pages only allows GET and HEAD. POST/PUT/DELETE from another origin will fail
preflight. For JSON data files this is usually fine:

```js
// Works (GET on a public .json file):
fetch('https://username.github.io/myrepo/data.json')

// Fails (POST is not allowed cross-origin on Pages):
fetch('https://username.github.io/myrepo/api', { method: 'POST' })
```

### PokeAPI — use HTTPS only
The HTTP redirect from `http://pokeapi.co` to HTTPS drops the CORS header in the
redirect response, causing a browser block. Always use `https://pokeapi.co`.

### DiceBear — use the v8+ domain
The old domain `avatars.dicebear.com` did not have CORS on v1/v2 endpoints.
The current API domain `api.dicebear.com` (v6+) does:

```js
// Works:
fetch('https://api.dicebear.com/8.x/pixel-art/svg?seed=Felix')

// Old URL — may lack CORS header:
fetch('https://avatars.dicebear.com/api/bottts/seed.svg')
```

### Credentials
The wildcard `Access-Control-Allow-Origin: *` is **incompatible** with
`credentials: 'include'` in fetch options. If a site uses `*` you cannot
send cookies or Authorization headers in the same request:

```js
// This will always fail if server sends Access-Control-Allow-Origin: *
fetch('https://example.com/api', { credentials: 'include' })  // ❌
fetch('https://example.com/api')                               // ✅
```

### Rate limits
None of the `🔓` (no-key) entries are truly unlimited. Common limits:
- ipinfo.io: 50,000 req/month
- PokeAPI: 100 req/min per IP
- JikanAPI: 3 req/sec
- Open-Meteo: 10,000 req/day (non-commercial)
- GitHub API (unauthenticated): 60 req/hour
- Frankfurter: no published limit, but caches heavily
- CoinGecko (free): 10–30 calls/min

---

*Last updated: March 2026. CORS policies change without notice — always verify
with a HEAD request and inspect the `access-control-allow-origin` response header
before building production dependencies on any of these endpoints.*
