# Real People Images: jsDelivr Packages & Stock Photo CDNs

A comprehensive reference for developers seeking images of real people (portraits, families, lifestyle) — covering what's available on jsDelivr as well as the major stock photo CDNs.

---

## Part 1: jsDelivr (cdn.jsdelivr.net)

> **Note:** jsDelivr is a CDN for open-source *code* libraries, not a stock photo host. Packages and repos that bundle actual photographs of real people as static assets are rare here due to privacy law (GDPR, CCPA) and model-release requirements. What exists instead are libraries that *work with*, *detect*, or *reference* images of real people.

### npm Packages — Face Detection & Recognition (include real sample photos)

These packages bundle a small number of real human face images as demo/test assets.

| Package | jsDelivr CDN URL | Description |
|---|---|---|
| `face-api.js` | `https://cdn.jsdelivr.net/npm/face-api.js/` | Face detection/recognition; demo folder includes real human face photos |
| `@vladmandic/face-api` | `https://cdn.jsdelivr.net/npm/@vladmandic/face-api/` | Maintained fork of face-api.js with real sample face images in `/demo/` |
| `@mediapipe/face_detection` | `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/` | Google MediaPipe face detection; includes real face test assets |
| `@tensorflow-models/face-detection` | `https://cdn.jsdelivr.net/npm/@tensorflow-models/face-detection/` | TensorFlow.js face detection model with real-face test imagery |

### npm Packages — Real Portrait Photo API Wrappers

These packages wrap APIs that serve **real photographs of real people** as profile/avatar placeholders at runtime.

| Package | jsDelivr CDN URL | Photo Source |
|---|---|---|
| `randomuser` | `https://cdn.jsdelivr.net/npm/randomuser/` | Wraps randomuser.me — real licensed portrait photos of men, women, children |
| `random-user-generator` | `https://cdn.jsdelivr.net/npm/random-user-generator/` | Wraps randomuser.me API |

### GitHub Repos via jsDelivr (`/gh/`) — Contain Real People Photos

| Repository | jsDelivr Base URL | Description |
|---|---|---|
| `justadudewhohacks/face-api.js` | `https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/` | `/example/` folder contains real human face photos |
| `vladmandic/face-api` | `https://cdn.jsdelivr.net/gh/vladmandic/face-api/` | `/demo/` folder contains real-person sample images |
| `yavuzceliker/sample-images` | `https://cdn.jsdelivr.net/gh/yavuzceliker/sample-images/` | 2,000 sample images for design/testing, including photos of people |
| `IQAndreas/sample-images` | `https://cdn.jsdelivr.net/gh/IQAndreas/sample-images/` | Sample images from LoremPixel, includes a "people" category |
| `mohammadimtiazz/standard-test-images-for-Image-Processing` | `https://cdn.jsdelivr.net/gh/mohammadimtiazz/standard-test-images-for-Image-Processing/` | Classic image processing test images including the "Lena" portrait |

---

## Part 2: Stock Photo CDNs — Real People & Families

These are the primary CDNs and APIs used to serve real photographs of people, families, and lifestyle imagery in production applications.

---

### 🟢 Free, No Attribution Required

#### Pravatar — Real Portrait Photos via CDN
Real CC0-licensed human face photos served directly via URL. Backed by Pexels.

```
https://i.pravatar.cc/{size}               → random portrait
https://i.pravatar.cc/{size}?img={1-70}    → specific portrait by ID
https://i.pravatar.cc/{size}?u={email}     → deterministic portrait by identifier
```

- **Docs:** https://pravatar.cc/
- **Photo count:** 70 real human portraits
- **License:** CC0 (no attribution required)
- **Direct CDN:** Yes — no API key needed
- **Example:** `<img src="https://i.pravatar.cc/150?img=12">`

---

#### randomuser.me — Real Portrait Photos via API
Real licensed photos of men, women, and children served by the randomuser.me CDN.

```
https://randomuser.me/api/portraits/men/{0-99}.jpg
https://randomuser.me/api/portraits/women/{0-99}.jpg
https://randomuser.me/api/portraits/lego/{0-9}.jpg
https://randomuser.me/api/portraits/thumb/men/{0-99}.jpg     → thumbnails
https://randomuser.me/api/portraits/thumb/women/{0-99}.jpg   → thumbnails
```

- **Docs:** https://randomuser.me/documentation
- **Photo count:** 200 real portraits (100 men, 100 women)
- **License:** Licensed for use via the API; check terms for redistribution
- **Direct CDN:** Yes — direct image URLs, no API key needed for portraits
- **Example:** `<img src="https://randomuser.me/api/portraits/women/44.jpg">`

---

#### Lorem Picsum — Real Photos via CDN (varied subjects, includes people)
High-quality photographs served directly by size or ID. Not always people-focused but includes many portraits and lifestyle shots of real people.

```
https://picsum.photos/{width}/{height}           → random photo
https://picsum.photos/{width}/{height}?grayscale → grayscale
https://picsum.photos/id/{0-1084}/{width}/{height} → specific photo by ID
https://picsum.photos/seed/{word}/{width}/{height} → consistent photo by seed
```

- **Docs:** https://picsum.photos/
- **Photo count:** 1,000+ curated images (sourced from Unsplash contributors)
- **License:** Photos are from Unsplash (free to use)
- **Direct CDN:** Yes — no API key needed
- **Example:** `<img src="https://picsum.photos/id/1005/400/300">` *(portrait of a woman)*

---

### 🔵 Free with API Key

#### Unsplash — High-Resolution People & Family Photos
Millions of high-resolution photos contributed by professional photographers. The Unsplash CDN (`images.unsplash.com`) serves images directly and supports dynamic resizing via Imgix parameters.

```
https://images.unsplash.com/photo-{photo-id}?w=800&q=80     → resized photo
https://api.unsplash.com/photos/random?query=family          → random family photo (JSON)
https://api.unsplash.com/search/photos?query=people&per_page=10  → search (JSON)
```

- **Docs:** https://unsplash.com/documentation
- **API Base URL:** `https://api.unsplash.com/`
- **Image CDN:** `https://images.unsplash.com/`
- **License:** Unsplash License (free for commercial & non-commercial use, no attribution required for most uses)
- **API Key:** Required for JSON API calls (free, register at https://unsplash.com/developers)
- **Rate Limit:** 50 req/hr (development), up to 5,000 req/hr (production)
- **People search URL:** https://unsplash.com/s/photos/family
- **Example:**
  ```html
  <!-- Direct embed (hotlinking required by Unsplash ToS) -->
  <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=640&q=80">
  ```

---

#### Pexels — Free Stock Photos of Families & People
Over 1 million high-resolution photos searchable by keyword. Images served from the Pexels CDN with direct URL access.

```
https://api.pexels.com/v1/search?query=family&per_page=15   → search people photos
https://api.pexels.com/v1/curated                           → curated photos
https://api.pexels.com/v1/photos/{id}                       → single photo metadata
```

- **Docs:** https://www.pexels.com/api/documentation/
- **API Base URL:** `https://api.pexels.com/v1/`
- **Image CDN:** `https://images.pexels.com/`
- **License:** Pexels License (free for commercial & personal use, no attribution required)
- **API Key:** Required for search/browse (free, register at https://www.pexels.com/api/)
- **Direct family photo search:** https://www.pexels.com/search/family/
- **Example response image URL format:**
  ```
  https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w=640
  ```

---

#### Pixabay — CC0 Photos of People & Families
Over 4 million CC0-licensed images. Served via Pixabay's CDN with direct image URLs returned by their API.

```
https://pixabay.com/api/?key={YOUR_KEY}&q=family&image_type=photo&per_page=20
```

- **Docs:** https://pixabay.com/api/docs/
- **API Base URL:** `https://pixabay.com/api/`
- **License:** Pixabay License / CC0 (free for commercial use, no attribution required)
- **API Key:** Required (free, register at https://pixabay.com/api/docs/)
- **Direct people search:** https://pixabay.com/images/search/family/
- **Example response image URL format:**
  ```
  https://cdn.pixabay.com/photo/{year}/{month}/{day}/{time}/{filename}_640.jpg
  ```

---

### 🔴 Paid / Subscription

#### Shutterstock CDN
Premium stock photos with the largest collection of professionally shot people/family images.

- **API Docs:** https://api-reference.shutterstock.com/
- **Image CDN:** `https://image.shutterstock.com/`
- **License:** Royalty-free (subscription or on-demand purchase required)
- **People search:** https://www.shutterstock.com/search/family-photos

#### Getty Images / iStock CDN
High-quality editorial and commercial photography.

- **Embed API:** https://developers.gettyimages.com/
- **Image CDN:** `https://media.gettyimages.com/`
- **License:** Royalty-free or rights-managed (subscription required)
- **People search:** https://www.gettyimages.com/photos/family

#### Adobe Stock CDN
Integrated with Creative Cloud; professional-quality people and family photos.

- **API Docs:** https://developer.adobe.com/stock/
- **Image CDN:** `https://stock.adobe.com/`
- **License:** Adobe Stock License (subscription required)
- **People search:** https://stock.adobe.com/search?k=family+photos

---

## Quick Reference: Direct CDN Image URLs (No API Key Needed)

| Service | URL Pattern | Real People? | Free? |
|---|---|---|---|
| Pravatar | `https://i.pravatar.cc/150?img={1-70}` | ✅ Yes | ✅ CC0 |
| randomuser.me | `https://randomuser.me/api/portraits/women/{0-99}.jpg` | ✅ Yes | ✅ Free |
| Lorem Picsum | `https://picsum.photos/id/{0-1084}/400/300` | ⚠️ Sometimes | ✅ Free |
| Unsplash (direct) | `https://images.unsplash.com/photo-{id}?w=640` | ✅ Yes | ✅ Free (hotlink) |
| Pexels (direct) | `https://images.pexels.com/photos/{id}/...jpeg` | ✅ Yes | ✅ Free (hotlink) |

---

*Last updated: February 2026*
