# jsDelivr Packages with Images of People

A curated list of npm packages and GitHub repositories available via [cdn.jsdelivr.net](https://cdn.jsdelivr.net) that include images of real or illustrated people.

---

## npm Packages

### Avatar / Profile Placeholder Images

| Package | jsDelivr URL | Description |
|---|---|---|
| `avatar-placeholder` | `https://cdn.jsdelivr.net/npm/avatar-placeholder/` | Generates placeholder avatar images |
| `boring-avatars` | `https://cdn.jsdelivr.net/npm/boring-avatars/` | SVG illustrated person avatars |
| `dicebear` | `https://cdn.jsdelivr.net/npm/@dicebear/avatars/` | Customizable avatar library with human-style sprites |
| `@dicebear/collection` | `https://cdn.jsdelivr.net/npm/@dicebear/collection/` | DiceBear avatar collection including human personas |

### UI Component Libraries with Person Imagery

| Package | jsDelivr URL | Description |
|---|---|---|
| `@uifaces/core` | `https://cdn.jsdelivr.net/npm/@uifaces/core/` | Real human face photos for UI mockups |
| `face-api.js` | `https://cdn.jsdelivr.net/npm/face-api.js/` | Face detection library bundled with sample face images |

### Icon / Illustration Packs with People

| Package | jsDelivr URL | Description |
|---|---|---|
| `@fortawesome/fontawesome-free` | `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free/` | Includes person/people icon SVGs |
| `bootstrap-icons` | `https://cdn.jsdelivr.net/npm/bootstrap-icons/` | Includes person, people, and profile icons |
| `heroicons` | `https://cdn.jsdelivr.net/npm/heroicons/` | Includes user/person SVG icons |
| `lucide` | `https://cdn.jsdelivr.net/npm/lucide/` | Icon library with user/people icons |
| `remixicon` | `https://cdn.jsdelivr.net/npm/remixicon/` | Large icon set including people/user imagery |
| `tabler-icons` | `https://cdn.jsdelivr.net/npm/@tabler/icons/` | 4000+ icons including many person/people icons |
| `ionicons` | `https://cdn.jsdelivr.net/npm/ionicons/` | Includes person and people icons |

### Stock / Sample Photo Libraries

| Package | jsDelivr URL | Description |
|---|---|---|
| `faker` | `https://cdn.jsdelivr.net/npm/@faker-js/faker/` | Generates fake data; references avatar image URLs |

---

## GitHub Repositories (via jsDelivr)

Format: `https://cdn.jsdelivr.net/gh/{user}/{repo}@{version}/`

| Repository | jsDelivr URL | Description |
|---|---|---|
| `uifaces/uifaces-api` | `https://cdn.jsdelivr.net/gh/uifaces/uifaces-api/` | API source for real human face photos used in mockups |
| `alohe/avatars` | `https://cdn.jsdelivr.net/gh/alohe/avatars/` | Collection of illustrated person avatars (PNG/SVG) |
| `Robohash/robohash` | `https://cdn.jsdelivr.net/gh/Robohash/robohash/` | Generates unique robot/human/alien images from strings |
| `nicholasgasior/8biticon` | `https://cdn.jsdelivr.net/gh/nicholasgasior/8biticon/` | 8-bit style person avatars |
| `stefanprodan/AspNetCoreRateLimit` | *(example only)* | — |
| `multiavatar/multiavatar` | `https://cdn.jsdelivr.net/gh/multiavatar/multiavatar/` | Multicultural human avatar SVGs |
| `dicebear/avatars` | `https://cdn.jsdelivr.net/gh/dicebear/avatars/` | Human-style avatar generation (source repo) |

---

## Usage Examples

### Load a Bootstrap Person Icon via jsDelivr
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
<i class="bi bi-person-fill"></i>
```

### Use a DiceBear Human Avatar
```html
<img src="https://api.dicebear.com/7.x/personas/svg?seed=Felix" alt="Person Avatar">
```

### Load a Multiavatar via jsDelivr GitHub CDN
```html
<script src="https://cdn.jsdelivr.net/gh/multiavatar/multiavatar@1.0.2/multiavatar.js"></script>
```

---

## Notes

- jsDelivr serves both **npm** (`/npm/`) and **GitHub** (`/gh/`) packages.
- For production use, always pin a specific version (e.g., `@1.2.3`) to ensure stability.
- Some packages (like `uifaces`) use photos of real people — review their licenses before use.
- Illustrated/generated avatar packages (DiceBear, Multiavatar, boring-avatars) are generally safer for commercial use.

---

*Last updated: February 2026*
