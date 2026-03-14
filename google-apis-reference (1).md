# Google APIs — Complete Reference with Code Examples

All examples use **plain `fetch()` REST calls** — no npm, no imports, no SDKs. Every snippet runs in any modern browser or Node.js 18+. Replace `YOUR_API_KEY`, `YOUR_ACCESS_TOKEN`, and resource IDs with real values.

Most APIs need an **API key** (public data) or an **OAuth 2.0 access token** (user data). See [Authentication](#authentication-quick-reference) at the bottom.

---

## Table of Contents

1. [AI & Machine Learning](#ai--machine-learning)
2. [Maps & Location](#maps--location)
3. [Google Workspace](#google-workspace)
4. [YouTube](#youtube)
5. [Identity & Auth](#identity--auth)
6. [Cloud Infrastructure](#cloud-infrastructure)
7. [Firebase APIs](#firebase-apis)
8. [Search & Discovery](#search--discovery)
9. [Communication](#communication)
10. [Analytics & Advertising](#analytics--advertising)
11. [Other Useful APIs](#other-useful-apis)
12. [Authentication Quick Reference](#authentication-quick-reference)

---

## AI & Machine Learning

### Gemini API

```javascript
const KEY = "YOUR_API_KEY";
const BASE = "https://generativelanguage.googleapis.com/v1beta";

// Text generation
const res = await fetch(`${BASE}/models/gemini-2.5-flash:generateContent?key=${KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: [{ text: "Explain quantum entanglement simply." }] }]
  })
});
const data = await res.json();
console.log(data.candidates[0].content.parts[0].text);

// Multi-turn chat
const chat = await fetch(`${BASE}/models/gemini-2.5-flash:generateContent?key=${KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [
      { role: "user",  parts: [{ text: "What is the capital of France?" }] },
      { role: "model", parts: [{ text: "Paris." }] },
      { role: "user",  parts: [{ text: "What is its population?" }] }
    ]
  })
});
const chatData = await chat.json();
console.log(chatData.candidates[0].content.parts[0].text);

// Vision — describe an image URL
const vision = await fetch(`${BASE}/models/gemini-2.5-flash:generateContent?key=${KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{
      parts: [
        { text: "What do you see?" },
        { image_url: { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Stonehenge.jpg/320px-Stonehenge.jpg" } }
      ]
    }]
  })
});

// Base64 image (browser — from file input)
async function describeImage(file) {
  const base64 = await new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result.split(",")[1]);
    reader.readAsDataURL(file);
  });
  const r = await fetch(`${BASE}/models/gemini-2.5-flash:generateContent?key=${KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Describe this image." },
          { inline_data: { mime_type: file.type, data: base64 } }
        ]
      }]
    })
  });
  return (await r.json()).candidates[0].content.parts[0].text;
}

// Streaming response (Server-Sent Events)
const stream = await fetch(
  `${BASE}/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: "Write a haiku about rain." }] }] })
  }
);
const reader = stream.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  for (const line of decoder.decode(value).split("\n")) {
    if (line.startsWith("data: ")) {
      const chunk = JSON.parse(line.slice(6));
      process.stdout.write(chunk.candidates?.[0]?.content?.parts?.[0]?.text ?? "");
    }
  }
}

// List available models
const models = await fetch(`${BASE}/models?key=${KEY}`);
const mData = await models.json();
mData.models.forEach(m => console.log(m.name, m.displayName));
```

---

### Cloud Vision API

```javascript
const KEY = "YOUR_API_KEY";
const URL = `https://vision.googleapis.com/v1/images:annotate?key=${KEY}`;

function visionReq(imageUri, features) {
  const image = imageUri.startsWith("gs://")
    ? { source: { gcsImageUri: imageUri } }
    : imageUri.startsWith("http")
    ? { source: { imageUri } }
    : { content: imageUri }; // base64
  return { requests: [{ image, features }] };
}

// Label detection
const labels = await fetch(URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(visionReq("https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400",
    [{ type: "LABEL_DETECTION", maxResults: 10 }]))
});
const lData = await labels.json();
lData.responses[0].labelAnnotations.forEach(l =>
  console.log(l.description, (l.score * 100).toFixed(1) + "%")
);

// OCR — extract text
const ocr = await fetch(URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(visionReq("gs://my-bucket/receipt.jpg", [{ type: "TEXT_DETECTION" }]))
});
const oData = await ocr.json();
console.log(oData.responses[0].textAnnotations[0].description);

// Face detection
const face = await fetch(URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(visionReq("gs://bucket/portrait.jpg", [{ type: "FACE_DETECTION" }]))
});
const fData = await face.json();
fData.responses[0].faceAnnotations?.forEach(f => {
  console.log("Joy:", f.joyLikelihood, "Anger:", f.angerLikelihood);
});

// Safe Search
const safe = await fetch(URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(visionReq("https://example.com/img.jpg", [{ type: "SAFE_SEARCH_DETECTION" }]))
});
const ss = (await safe.json()).responses[0].safeSearchAnnotation;
console.log("Adult:", ss.adult, "Violence:", ss.violence);

// Multiple features in one call
const multi = await fetch(URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    requests: [{
      image: { source: { imageUri: "https://example.com/photo.jpg" } },
      features: [
        { type: "LABEL_DETECTION", maxResults: 5 },
        { type: "LANDMARK_DETECTION" },
        { type: "LOGO_DETECTION" },
        { type: "OBJECT_LOCALIZATION" }
      ]
    }]
  })
});
const mData2 = await multi.json();
console.log("Landmarks:", mData2.responses[0].landmarkAnnotations);
```

---

### Cloud Natural Language API

```javascript
const KEY = "YOUR_API_KEY";
const BASE = "https://language.googleapis.com/v1";
const doc = {
  document: { type: "PLAIN_TEXT", content: "Google Cloud is amazing for building scalable apps!" }
};

// Sentiment analysis
const sent = await fetch(`${BASE}/documents:analyzeSentiment?key=${KEY}`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(doc)
});
const sData = await sent.json();
console.log("Score:", sData.documentSentiment.score.toFixed(2)); // -1.0 to +1.0

// Entity recognition
const ent = await fetch(`${BASE}/documents:analyzeEntities?key=${KEY}`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(doc)
});
const eData = await ent.json();
eData.entities.forEach(e => console.log(`${e.name} (${e.type}) — ${e.salience.toFixed(3)}`));

// Syntax analysis
const syn = await fetch(`${BASE}/documents:analyzeSyntax?key=${KEY}`, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(doc)
});
const syData = await syn.json();
syData.tokens.forEach(t => console.log(t.text.content, "—", t.partOfSpeech.tag));

// Content classification
const cls = await fetch(`${BASE}/documents:classifyText?key=${KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ document: { type: "PLAIN_TEXT", content: "Best cloud platforms for enterprise DevOps in 2025." } })
});
const cData = await cls.json();
cData.categories?.forEach(c => console.log(c.name, c.confidence.toFixed(3)));

// All-in-one annotateText
const all = await fetch(`${BASE}/documents:annotateText?key=${KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...doc, features: { extractSyntax: true, extractEntities: true, extractDocumentSentiment: true } })
});
const aData = await all.json();
console.log("Sentences:", aData.sentences.length, "Entities:", aData.entities.length);
```

---

### Cloud Speech-to-Text

```javascript
const KEY = "YOUR_API_KEY";

// Transcribe audio from Cloud Storage
const stt = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    config: {
      encoding: "FLAC",
      sampleRateHertz: 16000,
      languageCode: "en-US",
      enableAutomaticPunctuation: true
    },
    audio: { uri: "gs://cloud-samples-data/speech/brooklyn_bridge.flac" }
  })
});
const sData = await stt.json();
sData.results?.forEach(r => {
  console.log(r.alternatives[0].transcript);
  console.log("Confidence:", r.alternatives[0].confidence.toFixed(3));
});

// Browser: transcribe a Blob (e.g. from MediaRecorder)
async function transcribeBlob(blob) {
  const buf = await blob.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  const res = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      config: { encoding: "WEBM_OPUS", sampleRateHertz: 48000, languageCode: "en-US" },
      audio: { content: base64 }
    })
  });
  return (await res.json()).results?.[0]?.alternatives?.[0]?.transcript ?? "";
}

// Long-running operation (for audio > 1 min)
const long = await fetch(`https://speech.googleapis.com/v1/speech:longrunningrecognize?key=${KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    config: { encoding: "MP3", sampleRateHertz: 44100, languageCode: "en-US" },
    audio: { uri: "gs://my-bucket/interview.mp3" }
  })
});
const op = await long.json();

async function pollSTT(opName) {
  while (true) {
    const p = await fetch(`https://speech.googleapis.com/v1/operations/${opName}?key=${KEY}`);
    const d = await p.json();
    if (d.done) return d.response.results;
    await new Promise(r => setTimeout(r, 5000));
  }
}
const results = await pollSTT(op.name);
results.forEach(r => console.log(r.alternatives[0].transcript));
```

---

### Cloud Text-to-Speech

```javascript
const KEY = "YOUR_API_KEY";

// Synthesize speech
const tts = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    input: { text: "Hello from Google Cloud Text-to-Speech!" },
    voice: { languageCode: "en-US", name: "en-US-Neural2-C", ssmlGender: "FEMALE" },
    audioConfig: { audioEncoding: "MP3", speakingRate: 1.0, pitch: 0 }
  })
});
const { audioContent } = await tts.json(); // base64-encoded MP3

// Browser: play it
const audio = new Audio("data:audio/mp3;base64," + audioContent);
audio.play();

// SSML for fine control
const ssml = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    input: {
      ssml: `<speak>Hello <break time="500ms"/> world.
        <emphasis level="strong">This part is important.</emphasis>
        <prosody rate="slow" pitch="+2st">And this is slow and high.</prosody>
      </speak>`
    },
    voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "OGG_OPUS" }
  })
});

// List voices
const voices = await fetch(`https://texttospeech.googleapis.com/v1/voices?languageCode=en-US&key=${KEY}`);
const vData = await voices.json();
vData.voices.forEach(v => console.log(v.name, v.ssmlGender, v.naturalSampleRateHertz + "Hz"));
```

---

### Cloud Translation API

```javascript
const KEY = "YOUR_API_KEY";
const BASE = "https://translation.googleapis.com/language/translate/v2";

// Translate text
const trans = await fetch(`${BASE}?key=${KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ q: "Hello, world!", target: "es", format: "text" })
});
const tData = await trans.json();
console.log(tData.data.translations[0].translatedText); // ¡Hola, mundo!

// Batch translate
const batch = await fetch(`${BASE}?key=${KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ q: ["Good morning", "Good night", "Thank you"], source: "en", target: "ja" })
});
(await batch.json()).data.translations.forEach(t => console.log(t.translatedText));

// Detect language
const detect = await fetch(`${BASE}/detect?key=${KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ q: "Bonjour le monde" })
});
const det = (await detect.json()).data.detections[0][0];
console.log("Language:", det.language, "Confidence:", det.confidence.toFixed(3)); // fr

// List supported languages
const langs = await fetch(`${BASE}/languages?key=${KEY}&target=en`);
const lData = await langs.json();
lData.data.languages.forEach(l => console.log(l.language, l.name));
```

---

### Cloud Video Intelligence API

```javascript
const KEY = "YOUR_API_KEY";

// Start annotation job
const start = await fetch(
  `https://videointelligence.googleapis.com/v1/videos:annotate?key=${KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inputUri: "gs://cloud-samples-data/video/cat.mp4",
      features: ["LABEL_DETECTION", "SHOT_CHANGE_DETECTION", "SPEECH_TRANSCRIPTION"],
      videoContext: {
        speechTranscriptionConfig: { languageCode: "en-US", enableAutomaticPunctuation: true }
      }
    })
  }
);
const { name: opName } = await start.json();

// Poll until done
async function waitForVideo(name) {
  while (true) {
    const res = await fetch(`https://videointelligence.googleapis.com/v1/${name}?key=${KEY}`);
    const op = await res.json();
    if (op.done) {
      const ann = op.response.annotationResults[0];
      ann.segmentLabelAnnotations?.forEach(l => console.log("Label:", l.entity.description));
      ann.shotAnnotations?.forEach(s =>
        console.log(`Shot: ${s.startTimeOffset} -> ${s.endTimeOffset}`)
      );
      ann.speechTranscriptions?.forEach(t =>
        t.alternatives.forEach(a => console.log("Transcript:", a.transcript))
      );
      return ann;
    }
    await new Promise(r => setTimeout(r, 10000));
  }
}
await waitForVideo(opName);
```

---

## Maps & Location

### Maps JavaScript API

```html
<!-- Add to <head> -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initMap" async defer></script>
<div id="map" style="height:400px;width:100%"></div>
```

```javascript
function initMap() {
  const nyc = { lat: 40.7128, lng: -74.006 };
  const map = new google.maps.Map(document.getElementById("map"), {
    center: nyc, zoom: 12
  });

  // Marker with info window
  const marker = new google.maps.Marker({
    position: nyc, map, title: "New York",
    animation: google.maps.Animation.DROP
  });
  const info = new google.maps.InfoWindow({ content: "<b>New York City</b>" });
  marker.addListener("click", () => info.open(map, marker));

  // Polyline
  new google.maps.Polyline({
    path: [{ lat: 40.71, lng: -74.01 }, { lat: 40.76, lng: -73.98 }],
    strokeColor: "#FF0000", strokeWeight: 3, map
  });

  // Polygon
  new google.maps.Polygon({
    paths: [
      { lat: 40.72, lng: -74.01 },
      { lat: 40.73, lng: -73.99 },
      { lat: 40.71, lng: -73.98 }
    ],
    fillColor: "#0000FF", fillOpacity: 0.2, strokeColor: "#0000FF", map
  });

  // Click handler — drop a marker
  map.addListener("click", e => {
    new google.maps.Marker({ position: e.latLng, map });
    console.log(e.latLng.lat(), e.latLng.lng());
  });

  // Places autocomplete
  const input = document.getElementById("search");
  const ac = new google.maps.places.Autocomplete(input, {
    fields: ["place_id", "geometry", "name"]
  });
  ac.addListener("place_changed", () => {
    const place = ac.getPlace();
    map.setCenter(place.geometry.location);
    map.setZoom(17);
  });

  // Directions
  const svc = new google.maps.DirectionsService();
  const renderer = new google.maps.DirectionsRenderer({ map });
  svc.route(
    { origin: "Times Square, NY", destination: "Central Park, NY", travelMode: "WALKING" },
    (result, status) => {
      if (status === "OK") renderer.setDirections(result);
    }
  );

  // User's current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      map.setCenter(loc);
      new google.maps.Marker({ position: loc, map, title: "You are here" });
    });
  }
}
```

---

### Geocoding API

```javascript
const KEY = "YOUR_API_KEY";

// Address to coordinates
const geo = await fetch(
  `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent("1600 Amphitheatre Pkwy, Mountain View, CA")}&key=${KEY}`
);
const gData = await geo.json();
if (gData.status === "OK") {
  const { lat, lng } = gData.results[0].geometry.location;
  console.log(gData.results[0].formatted_address, lat, lng);
  // Address components
  gData.results[0].address_components.forEach(c =>
    console.log(c.long_name, c.types)
  );
}

// Reverse geocoding (coordinates to address)
const rev = await fetch(
  `https://maps.googleapis.com/maps/api/geocode/json?latlng=37.4224,-122.0842&key=${KEY}`
);
console.log((await rev.json()).results[0].formatted_address);

// Component filtering
const comp = await fetch(
  `https://maps.googleapis.com/maps/api/geocode/json?components=country:AU|locality:Sydney&key=${KEY}`
);
const loc = (await comp.json()).results[0].geometry.location;
console.log("Sydney:", loc.lat, loc.lng);

// Batch geocode multiple addresses
const addresses = ["Paris, France", "Tokyo, Japan", "São Paulo, Brazil"];
const coords = await Promise.all(addresses.map(async addr => {
  const r = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addr)}&key=${KEY}`
  );
  const d = await r.json();
  return { address: addr, ...d.results[0].geometry.location };
}));
console.table(coords);
```

---

### Directions API

```javascript
const KEY = "YOUR_API_KEY";

// Basic driving route
const dir = await fetch(
  `https://maps.googleapis.com/maps/api/directions/json?origin=New+York,NY&destination=Los+Angeles,CA&mode=driving&key=${KEY}`
);
const dData = await dir.json();
const leg = dData.routes[0].legs[0];
console.log("Distance:", leg.distance.text);
console.log("Duration:", leg.duration.text);
leg.steps.forEach(s => console.log(s.html_instructions.replace(/<[^>]+>/g, ""), s.distance.text));

// With waypoints
const wp = await fetch(
  `https://maps.googleapis.com/maps/api/directions/json?origin=Chicago,IL&destination=New+York,NY&waypoints=via:Pittsburgh,PA&avoid=tolls&key=${KEY}`
);

// Transit route
const transit = await fetch(
  `https://maps.googleapis.com/maps/api/directions/json?origin=Grand+Central+Station,NY&destination=Penn+Station,NY&mode=transit&transit_mode=subway&key=${KEY}`
);
const tData = await transit.json();
tData.routes[0].legs[0].steps.forEach(s => {
  if (s.transit_details)
    console.log("Take", s.transit_details.line.short_name,
      "from", s.transit_details.departure_stop.name);
});

// Decode encoded polyline to lat/lng array
function decodePolyline(enc) {
  const pts = []; let i = 0, lat = 0, lng = 0;
  while (i < enc.length) {
    let b, shift = 0, result = 0;
    do { b = enc.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1; shift = result = 0;
    do { b = enc.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    pts.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return pts;
}
const path = decodePolyline(dData.routes[0].overview_polyline.points);
console.log("Route points:", path.length);
```

---

### Places API

```javascript
const KEY = "YOUR_API_KEY";

// Nearby search
const nearby = await fetch(
  `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.7749,-122.4194&radius=1500&type=restaurant&key=${KEY}`
);
const nData = await nearby.json();
nData.results.forEach(p => console.log(p.name, "⭐", p.rating, p.vicinity));

// Text search
const text = await fetch(
  `https://maps.googleapis.com/maps/api/place/textsearch/json?query=vegan+restaurants+Austin+TX&key=${KEY}`
);

// Place details
const detail = await fetch(
  `https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJN1t_tDeuEmsRUsoyG83frY4&fields=name,rating,formatted_phone_number,website,opening_hours,reviews&key=${KEY}`
);
const p = (await detail.json()).result;
console.log(p.name, p.formatted_phone_number);
p.opening_hours?.weekday_text.forEach(d => console.log(d));

// Autocomplete
const ac = await fetch(
  `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Starbucks+Se&types=establishment&key=${KEY}`
);
(await ac.json()).predictions.forEach(p => console.log(p.description, p.place_id));

// Place photo (use URL as img src — redirects to image)
const photoRef = nData.results[0]?.photos?.[0]?.photo_reference;
const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${KEY}`;
```

---

### Distance Matrix API

```javascript
const KEY = "YOUR_API_KEY";
const origins = encodeURIComponent("New York, NY|Boston, MA");
const dests   = encodeURIComponent("Washington, DC|Pittsburgh, PA");

const dm = await fetch(
  `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${dests}&mode=driving&units=imperial&key=${KEY}`
);
const d = await dm.json();
d.rows.forEach((row, i) =>
  row.elements.forEach((el, j) => {
    if (el.status === "OK")
      console.log(`${d.origin_addresses[i]} → ${d.destination_addresses[j]}: ${el.distance.text}, ${el.duration.text}`);
  })
);
```

---

## Google Workspace

> All Workspace APIs require `Authorization: Bearer YOUR_ACCESS_TOKEN` with appropriate OAuth 2.0 scopes.

### Gmail API

```javascript
const TOKEN = "YOUR_OAUTH2_ACCESS_TOKEN";
const GM = "https://gmail.googleapis.com/gmail/v1/users/me";

// List unread messages
const list = await fetch(`${GM}/messages?q=is:unread&maxResults=10`, {
  headers: { Authorization: `Bearer ${TOKEN}` }
});
const { messages } = await list.json();

// Get a full message
const msg = await fetch(`${GM}/messages/${messages[0].id}?format=full`, {
  headers: { Authorization: `Bearer ${TOKEN}` }
});
const mData = await msg.json();
const headers = mData.payload.headers;
console.log("From:", headers.find(h => h.name === "From")?.value);
console.log("Subject:", headers.find(h => h.name === "Subject")?.value);
// Decode base64url body
const bodyData = mData.payload.parts?.[0]?.body?.data ?? mData.payload.body?.data ?? "";
const body = atob(bodyData.replace(/-/g, "+").replace(/_/g, "/"));
console.log(body.slice(0, 200));

// Send an email
function makeRawEmail({ to, subject, body }) {
  const email = [`To: ${to}`, `Subject: ${subject}`,
    `Content-Type: text/plain; charset=utf-8`, "", body].join("\r\n");
  return btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
await fetch(`${GM}/messages/send`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ raw: makeRawEmail({ to: "alice@example.com", subject: "Hello!", body: "Hi from the API." }) })
});

// Create a draft
await fetch(`${GM}/drafts`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ message: { raw: makeRawEmail({ to: "bob@example.com", subject: "Draft", body: "Not sent yet." }) } })
});

// Label: mark read + star
await fetch(`${GM}/messages/${messages[0].id}/modify`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ removeLabelIds: ["UNREAD"], addLabelIds: ["STARRED"] })
});

// List labels
const labels = await fetch(`${GM}/labels`, { headers: { Authorization: `Bearer ${TOKEN}` } });
(await labels.json()).labels.forEach(l => console.log(l.name, l.id));
```

---

### Google Drive API

```javascript
const TOKEN = "YOUR_OAUTH2_ACCESS_TOKEN";
const DR = "https://www.googleapis.com/drive/v3";
const UP = "https://www.googleapis.com/upload/drive/v3";

// List files
const list = await fetch(`${DR}/files?q=mimeType='application/pdf'&pageSize=10&fields=files(id,name,webViewLink)`, {
  headers: { Authorization: `Bearer ${TOKEN}` }
});
(await list.json()).files.forEach(f => console.log(f.name, f.webViewLink));

// Upload a file (multipart — works with a browser Blob)
async function uploadFile(blob, name, mimeType, folderId = null) {
  const meta = { name, ...(folderId ? { parents: [folderId] } : {}) };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  form.append("file", blob, name);
  const res = await fetch(`${UP}/files?uploadType=multipart&fields=id,name,webViewLink`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form
  });
  return res.json();
}

// Download a file (browser)
const dl = await fetch(`${DR}/files/FILE_ID?alt=media`, {
  headers: { Authorization: `Bearer ${TOKEN}` }
});
const blob = await dl.blob();
const a = Object.assign(document.createElement("a"), {
  href: URL.createObjectURL(blob), download: "file.pdf"
});
a.click();

// Create a folder
const folder = await fetch(`${DR}/files`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ name: "My Folder", mimeType: "application/vnd.google-apps.folder" })
});
console.log("Folder ID:", (await folder.json()).id);

// Share a file
await fetch(`${DR}/files/FILE_ID/permissions`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ type: "user", role: "reader", emailAddress: "bob@example.com" })
});

// Delete a file
await fetch(`${DR}/files/FILE_ID`, { method: "DELETE", headers: { Authorization: `Bearer ${TOKEN}` } });
```

---

### Google Sheets API

```javascript
const TOKEN = "YOUR_OAUTH2_ACCESS_TOKEN";
const SH = "https://sheets.googleapis.com/v4/spreadsheets";
const ID = "YOUR_SPREADSHEET_ID";

// Read values
const read = await fetch(`${SH}/${ID}/values/Sheet1!A1:D10`, {
  headers: { Authorization: `Bearer ${TOKEN}` }
});
(await read.json()).values?.forEach(row => console.log(row.join(" | ")));

// Write values
await fetch(`${SH}/${ID}/values/Sheet1!A1?valueInputOption=USER_ENTERED`, {
  method: "PUT",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    values: [["Name", "Age", "City"], ["Alice", 30, "New York"], ["Bob", 25, "Austin"]]
  })
});

// Append rows
await fetch(`${SH}/${ID}/values/Sheet1!A:C:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ values: [["Charlie", 28, "Chicago"]] })
});

// Clear a range
await fetch(`${SH}/${ID}/values/Sheet1!A2:D100:clear`, {
  method: "POST", headers: { Authorization: `Bearer ${TOKEN}` }
});

// Create a spreadsheet
const newSheet = await fetch(SH, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ properties: { title: "My Spreadsheet" }, sheets: [{ properties: { title: "Data" } }] })
});
console.log("ID:", (await newSheet.json()).spreadsheetId);

// Format: bold header, set background color
await fetch(`${SH}/${ID}:batchUpdate`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    requests: [{
      repeatCell: {
        range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
        cell: { userEnteredFormat: {
          textFormat: { bold: true },
          backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 }
        }},
        fields: "userEnteredFormat(textFormat,backgroundColor)"
      }
    }]
  })
});
```

---

### Google Docs API

```javascript
const TOKEN = "YOUR_OAUTH2_ACCESS_TOKEN";
const DOCS = "https://docs.googleapis.com/v1/documents";

// Create a document
const newDoc = await fetch(DOCS, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ title: "My Report" })
});
const { documentId } = await newDoc.json();

// Read document text
const doc = await fetch(`${DOCS}/${documentId}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
const dData = await doc.json();
const endIdx = dData.body.content.at(-1).endIndex - 1;
dData.body.content.forEach(el =>
  el.paragraph?.elements.forEach(e => e.textRun && console.log(e.textRun.content))
);

// Insert text + heading style
await fetch(`${DOCS}/${documentId}:batchUpdate`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    requests: [
      { insertText: { location: { index: endIdx }, text: "\nIntroduction\n" } },
      {
        updateParagraphStyle: {
          range: { startIndex: endIdx + 1, endIndex: endIdx + 13 },
          paragraphStyle: { namedStyleType: "HEADING_1" },
          fields: "namedStyleType"
        }
      }
    ]
  })
});

// Find and replace (mail merge)
await fetch(`${DOCS}/${documentId}:batchUpdate`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    requests: [
      { replaceAllText: { containsText: { text: "{{NAME}}" }, replaceText: "Alice Johnson" } },
      { replaceAllText: { containsText: { text: "{{DATE}}" }, replaceText: new Date().toLocaleDateString() } }
    ]
  })
});
```

---

### Google Calendar API

```javascript
const TOKEN = "YOUR_OAUTH2_ACCESS_TOKEN";
const CAL = "https://www.googleapis.com/calendar/v3";

// List upcoming events
const events = await fetch(
  `${CAL}/calendars/primary/events?timeMin=${new Date().toISOString()}&maxResults=10&singleEvents=true&orderBy=startTime`,
  { headers: { Authorization: `Bearer ${TOKEN}` } }
);
(await events.json()).items.forEach(e =>
  console.log((e.start.dateTime ?? e.start.date), "—", e.summary)
);

// Create a recurring event
const newEvent = await fetch(`${CAL}/calendars/primary/events`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    summary: "Daily Standup",
    start: { dateTime: "2025-09-01T09:00:00-07:00", timeZone: "America/Los_Angeles" },
    end:   { dateTime: "2025-09-01T09:30:00-07:00", timeZone: "America/Los_Angeles" },
    recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;COUNT=20"],
    attendees: [{ email: "alice@example.com" }, { email: "bob@example.com" }],
    reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 5 }] }
  })
});
const created = await newEvent.json();
console.log("Link:", created.htmlLink);

// Update event
await fetch(`${CAL}/calendars/primary/events/${created.id}`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ summary: "Standup (Updated)", colorId: "5" })
});

// Delete event
await fetch(`${CAL}/calendars/primary/events/${created.id}`, {
  method: "DELETE", headers: { Authorization: `Bearer ${TOKEN}` }
});

// List all calendars
const calList = await fetch(`${CAL}/users/me/calendarList`, {
  headers: { Authorization: `Bearer ${TOKEN}` }
});
(await calList.json()).items.forEach(c => console.log(c.summary, c.id));
```

---

### Google Tasks API

```javascript
const TOKEN = "YOUR_OAUTH2_ACCESS_TOKEN";
const TASKS = "https://tasks.googleapis.com/tasks/v1";

// List task lists
const lists = await fetch(`${TASKS}/users/@me/lists`, { headers: { Authorization: `Bearer ${TOKEN}` } });
(await lists.json()).items.forEach(l => console.log(l.title, l.id));

// List tasks
const tasks = await fetch(`${TASKS}/lists/@default/tasks?showCompleted=false`, {
  headers: { Authorization: `Bearer ${TOKEN}` }
});
(await tasks.json()).items?.forEach(t => console.log(t.title, t.status));

// Create a task
const newTask = await fetch(`${TASKS}/lists/@default/tasks`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Finish quarterly report",
    notes: "Include Q3 data",
    due: "2025-09-30T00:00:00.000Z"
  })
});
const task = await newTask.json();

// Mark complete
await fetch(`${TASKS}/lists/@default/tasks/${task.id}`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ status: "completed" })
});

// Delete
await fetch(`${TASKS}/lists/@default/tasks/${task.id}`, {
  method: "DELETE", headers: { Authorization: `Bearer ${TOKEN}` }
});
```

---

## YouTube

### YouTube Data API

```javascript
const KEY = "YOUR_API_KEY";
const YT  = "https://www.googleapis.com/youtube/v3";

// Search videos
const search = await fetch(`${YT}/search?part=snippet&q=JavaScript+tutorial&type=video&maxResults=5&order=viewCount&key=${KEY}`);
(await search.json()).items.forEach(i => console.log(i.snippet.title, i.id.videoId));

// Video details + stats
const video = await fetch(`${YT}/videos?part=snippet,statistics,contentDetails&id=dQw4w9WgXcQ&key=${KEY}`);
const v = (await video.json()).items[0];
console.log(v.snippet.title);
console.log("Views:", v.statistics.viewCount);
console.log("Duration:", v.contentDetails.duration); // PT4M13S

// Parse ISO 8601 duration
function parseDur(d) {
  const m = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const [h, min, s] = [m[1]||0, m[2]||0, m[3]||0].map(Number);
  return h ? `${h}:${String(min).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${min}:${String(s).padStart(2,"0")}`;
}
console.log("Duration:", parseDur(v.contentDetails.duration)); // 4:13

// Channel info
const chan = await fetch(`${YT}/channels?part=snippet,statistics&id=UCVHFbw7woebKtX3KnZ3m9qA&key=${KEY}`);
const ch = (await chan.json()).items[0];
console.log(ch.snippet.title, "subscribers:", ch.statistics.subscriberCount);

// Channel playlists
const play = await fetch(`${YT}/playlists?part=snippet,contentDetails&channelId=UC_x5XG1OV2P6uZZ5FSM9Ttw&maxResults=10&key=${KEY}`);
(await play.json()).items.forEach(p => console.log(p.snippet.title, p.contentDetails.itemCount));

// Playlist items
const items = await fetch(`${YT}/playlistItems?part=snippet&playlistId=PLAYLIST_ID&maxResults=50&key=${KEY}`);
(await items.json()).items.forEach(i =>
  console.log(i.snippet.position + 1, i.snippet.title, i.snippet.resourceId.videoId)
);

// Comments
const comments = await fetch(`${YT}/commentThreads?part=snippet&videoId=dQw4w9WgXcQ&maxResults=5&order=relevance&key=${KEY}`);
(await comments.json()).items.forEach(c => {
  const top = c.snippet.topLevelComment.snippet;
  console.log(top.authorDisplayName, ":", top.textDisplay.slice(0, 80));
});

// Post a comment (requires OAuth token)
const TOKEN = "YOUR_OAUTH2_ACCESS_TOKEN";
await fetch(`${YT}/commentThreads?part=snippet`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    snippet: {
      videoId: "VIDEO_ID",
      topLevelComment: { snippet: { textOriginal: "Great video!" } }
    }
  })
});
```

---

### YouTube Analytics API

```javascript
const TOKEN = "YOUR_OAUTH2_ACCESS_TOKEN";
const YTA = "https://youtubeanalytics.googleapis.com/v2/reports";
const today = new Date().toISOString().slice(0, 10);
const ago28 = new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);

// Channel metrics by day
const report = await fetch(
  `${YTA}?ids=channel==MINE&startDate=${ago28}&endDate=${today}&metrics=views,estimatedMinutesWatched,subscribersGained&dimensions=day&sort=day`,
  { headers: { Authorization: `Bearer ${TOKEN}` } }
);
(await report.json()).rows?.forEach(([date, views, minutes, subs]) =>
  console.log(`${date}: ${views} views, +${subs} subs`)
);

// Traffic sources
const traffic = await fetch(
  `${YTA}?ids=channel==MINE&startDate=${ago28}&endDate=${today}&metrics=views&dimensions=insightTrafficSourceType&sort=-views`,
  { headers: { Authorization: `Bearer ${TOKEN}` } }
);
(await traffic.json()).rows?.forEach(([source, views]) => console.log(source, views));

// Top 10 videos
const top = await fetch(
  `${YTA}?ids=channel==MINE&startDate=${ago28}&endDate=${today}&metrics=views,estimatedMinutesWatched&dimensions=video&sort=-views&maxResults=10`,
  { headers: { Authorization: `Bearer ${TOKEN}` } }
);
(await top.json()).rows?.forEach(([id, views, minutes]) => console.log(id, views, "views"));
```

---

## Identity & Auth

### Google Sign-In (One Tap)

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
<div id="g_id_onload"
  data-client_id="YOUR_CLIENT_ID.apps.googleusercontent.com"
  data-callback="handleCredentialResponse"
  data-auto_prompt="true">
</div>
<div class="g_id_signin" data-type="standard" data-size="large" data-shape="pill"></div>
```

```javascript
function handleCredentialResponse(response) {
  // Decode the JWT — no library needed
  const payload = JSON.parse(atob(response.credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  console.log("Name:", payload.name);
  console.log("Email:", payload.email);
  console.log("Picture:", payload.picture);
  console.log("Google ID:", payload.sub);
  // Send response.credential to your server to verify
}

// Server-side token verification (no SDK)
async function verifyGoogleToken(idToken) {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
  const data = await res.json();
  if (data.aud !== "YOUR_CLIENT_ID.apps.googleusercontent.com") throw new Error("Invalid audience");
  return data; // { email, name, picture, sub, ... }
}
```

---

### OAuth 2.0 — Access Token Flow

```javascript
// 1. Redirect user to Google consent screen
function buildAuthUrl(scopes) {
  return "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
    client_id: "YOUR_CLIENT_ID.apps.googleusercontent.com",
    redirect_uri: "http://localhost:3000/callback",
    response_type: "code",
    scope: scopes.join(" "),
    access_type: "offline", // request refresh_token
    prompt: "consent"
  });
}

// window.location.href = buildAuthUrl([
//   "https://www.googleapis.com/auth/gmail.readonly",
//   "https://www.googleapis.com/auth/calendar"
// ]);

// 2. Exchange authorization code for tokens (server-side)
async function exchangeCode(code) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: "YOUR_CLIENT_ID",
      client_secret: "YOUR_CLIENT_SECRET",
      redirect_uri: "http://localhost:3000/callback",
      grant_type: "authorization_code"
    })
  });
  return res.json(); // { access_token, refresh_token, expires_in }
}

// 3. Refresh an expired token
async function refreshToken(refreshToken) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: "YOUR_CLIENT_ID",
      client_secret: "YOUR_CLIENT_SECRET",
      grant_type: "refresh_token"
    })
  });
  return res.json(); // { access_token, expires_in }
}

// 4. Get user info
async function getUserInfo(accessToken) {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return res.json(); // { id, email, name, picture }
}
```

---

## Cloud Infrastructure

### Cloud Storage API

```javascript
const TOKEN = "YOUR_SERVICE_ACCOUNT_TOKEN";
const GCS = "https://storage.googleapis.com";
const BUCKET = "my-bucket";

// List objects
const list = await fetch(`${GCS}/storage/v1/b/${BUCKET}/o?prefix=images/`, {
  headers: { Authorization: `Bearer ${TOKEN}` }
});
(await list.json()).items?.forEach(o => console.log(o.name, o.size + "B"));

// Upload (simple, < 5MB)
async function upload(blob, name, type) {
  const res = await fetch(
    `${GCS}/upload/storage/v1/b/${BUCKET}/o?uploadType=media&name=${encodeURIComponent(name)}`,
    { method: "POST", headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": type }, body: blob }
  );
  return res.json();
}

// Download
const dl = await fetch(
  `${GCS}/storage/v1/b/${BUCKET}/o/${encodeURIComponent("images/photo.jpg")}?alt=media`,
  { headers: { Authorization: `Bearer ${TOKEN}` } }
);
const imageBlob = await dl.blob();

// Object metadata
const meta = await fetch(
  `${GCS}/storage/v1/b/${BUCKET}/o/${encodeURIComponent("images/photo.jpg")}`,
  { headers: { Authorization: `Bearer ${TOKEN}` } }
);
const m = await meta.json();
console.log(m.size, m.contentType, m.timeCreated);

// Delete
await fetch(`${GCS}/storage/v1/b/${BUCKET}/o/${encodeURIComponent("old/file.txt")}`, {
  method: "DELETE", headers: { Authorization: `Bearer ${TOKEN}` }
});

// Public URL for a public object (no auth)
const publicUrl = `https://storage.googleapis.com/${BUCKET}/images/photo.jpg`;
```

---

### BigQuery API

```javascript
const TOKEN = "YOUR_SERVICE_ACCOUNT_TOKEN";
const PROJECT = "my-project";
const BQ = `https://bigquery.googleapis.com/bigquery/v2`;

// Synchronous query
const q = await fetch(`${BQ}/projects/${PROJECT}/queries`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    query: `SELECT name, COUNT(*) AS cnt
      FROM \`bigquery-public-data.usa_names.usa_1910_2013\`
      WHERE state = 'TX' GROUP BY name ORDER BY cnt DESC LIMIT 10`,
    useLegacySql: false,
    timeoutMs: 10000
  })
});
const qData = await q.json();
const fields = qData.schema.fields.map(f => f.name);
qData.rows?.forEach(row =>
  console.log(Object.fromEntries(fields.map((f, i) => [f, row.f[i].v])))
);

// Async job (for large queries)
const job = await fetch(`${BQ}/projects/${PROJECT}/jobs`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    configuration: {
      query: {
        query: "SELECT * FROM `my_dataset.events` WHERE date > '2025-01-01' LIMIT 1000",
        useLegacySql: false
      }
    }
  })
});
const { jobReference } = await job.json();

async function waitForJob(jobId) {
  while (true) {
    const p = await fetch(`${BQ}/projects/${PROJECT}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    const d = await p.json();
    if (d.status.state === "DONE") {
      if (d.status.errorResult) throw new Error(d.status.errorResult.message);
      return d;
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}
await waitForJob(jobReference.jobId);

// Streaming insert
await fetch(`${BQ}/projects/${PROJECT}/datasets/my_dataset/tables/events/insertAll`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    rows: [
      { insertId: "r1", json: { user_id: 42, event: "purchase", amount: 29.99 } },
      { insertId: "r2", json: { user_id: 17, event: "view", amount: 0 } }
    ]
  })
});
```

---

### Cloud Pub/Sub

```javascript
const TOKEN = "YOUR_SERVICE_ACCOUNT_TOKEN";
const PS = `https://pubsub.googleapis.com/v1/projects/my-project`;

// Publish messages
const pub = await fetch(`${PS}/topics/my-topic:publish`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      { data: btoa(JSON.stringify({ event: "order_placed", id: 123 })), attributes: { source: "checkout" } },
      { data: btoa(JSON.stringify({ event: "payment_received", id: 123 })) }
    ]
  })
});
console.log("Message IDs:", (await pub.json()).messageIds);

// Pull messages
const pull = await fetch(`${PS}/subscriptions/my-sub:pull`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ maxMessages: 10 })
});
const pullData = await pull.json();
const ackIds = [];
pullData.receivedMessages?.forEach(msg => {
  console.log("Received:", JSON.parse(atob(msg.message.data)));
  ackIds.push(msg.ackId);
});

// Acknowledge
if (ackIds.length) {
  await fetch(`${PS}/subscriptions/my-sub:acknowledge`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ackIds })
  });
}
```

---

### Cloud Firestore API

```javascript
const TOKEN = "YOUR_SERVICE_ACCOUNT_TOKEN";
const FS = `https://firestore.googleapis.com/v1/projects/my-project/databases/(default)/documents`;

// Write a document
await fetch(`${FS}/users/alice`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    fields: {
      name:     { stringValue: "Alice Johnson" },
      age:      { integerValue: 30 },
      email:    { stringValue: "alice@example.com" },
      isActive: { booleanValue: true }
    }
  })
});

// Read a document
const doc = await fetch(`${FS}/users/alice`, { headers: { Authorization: `Bearer ${TOKEN}` } });
const d = await doc.json();
function unwrap(fields) {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => {
    const val = v.stringValue ?? v.integerValue ?? v.doubleValue ?? v.booleanValue ?? v.nullValue;
    return [k, val !== undefined ? val : JSON.stringify(v)];
  }));
}
console.log(unwrap(d.fields));

// Query documents
const q = await fetch(`${FS}:runQuery`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    structuredQuery: {
      from: [{ collectionId: "users" }],
      where: {
        compositeFilter: {
          op: "AND",
          filters: [
            { fieldFilter: { field: { fieldPath: "age" }, op: "GREATER_THAN_OR_EQUAL", value: { integerValue: 18 } } },
            { fieldFilter: { field: { fieldPath: "isActive" }, op: "EQUAL", value: { booleanValue: true } } }
          ]
        }
      },
      orderBy: [{ field: { fieldPath: "age" }, direction: "DESCENDING" }],
      limit: 10
    }
  })
});
(await q.json()).forEach(r => r.document && console.log(unwrap(r.document.fields)));

// Delete a document
await fetch(`${FS}/users/alice`, { method: "DELETE", headers: { Authorization: `Bearer ${TOKEN}` } });
```

---

### Compute Engine API

```javascript
const TOKEN = "YOUR_SERVICE_ACCOUNT_TOKEN";
const CE = "https://compute.googleapis.com/compute/v1/projects/my-project";
const ZONE = "us-central1-a";

// List instances
const list = await fetch(`${CE}/zones/${ZONE}/instances`, { headers: { Authorization: `Bearer ${TOKEN}` } });
(await list.json()).items?.forEach(i => console.log(i.name, i.status));

// Create a VM
const create = await fetch(`${CE}/zones/${ZONE}/instances`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "my-instance",
    machineType: `zones/${ZONE}/machineTypes/e2-medium`,
    disks: [{
      boot: true, autoDelete: true,
      initializeParams: {
        sourceImage: "projects/debian-cloud/global/images/family/debian-11",
        diskSizeGb: "20"
      }
    }],
    networkInterfaces: [{
      network: "global/networks/default",
      accessConfigs: [{ type: "ONE_TO_ONE_NAT", name: "External NAT" }]
    }],
    metadata: {
      items: [{ key: "startup-script", value: "#!/bin/bash\napt-get update && apt-get install -y nginx" }]
    }
  })
});
console.log("Operation:", (await create.json()).name);

// Stop and delete
await fetch(`${CE}/zones/${ZONE}/instances/my-instance/stop`, {
  method: "POST", headers: { Authorization: `Bearer ${TOKEN}` }
});
await fetch(`${CE}/zones/${ZONE}/instances/my-instance`, {
  method: "DELETE", headers: { Authorization: `Bearer ${TOKEN}` }
});
```

---

## Firebase APIs

### Firebase Realtime Database

```javascript
const DB = "https://my-project-default-rtdb.firebaseio.com";
// Append ?auth=ID_TOKEN for authenticated requests

// Write
await fetch(`${DB}/users/alice.json`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Alice", email: "alice@example.com", score: 100 })
});

// Read
const user = await fetch(`${DB}/users/alice.json`);
console.log(await user.json());

// Push (auto-key)
const push = await fetch(`${DB}/messages.json`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "Hello!", timestamp: Date.now(), author: "alice" })
});
console.log("Key:", (await push.json()).name); // -NxKABC123...

// Update specific fields
await fetch(`${DB}/users/alice.json`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ score: 150, lastSeen: Date.now() })
});

// Query: order by child, limit
const scores = await fetch(`${DB}/leaderboard.json?orderBy="score"&limitToLast=5`);
console.log(await scores.json());

// Real-time streaming (SSE)
const source = new EventSource(`${DB}/messages.json`);
source.addEventListener("put", e => {
  const d = JSON.parse(e.data);
  console.log("Change at", d.path, ":", d.data);
});

// Delete
await fetch(`${DB}/users/alice.json`, { method: "DELETE" });
```

---

### Firebase Authentication REST API

```javascript
const API_KEY = "YOUR_FIREBASE_WEB_API_KEY";
const AUTH = `https://identitytoolkit.googleapis.com/v1/accounts`;

// Sign up
const signup = await fetch(`${AUTH}:signUp?key=${API_KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "user@example.com", password: "Pass123!", returnSecureToken: true })
});
const { localId, idToken, refreshToken } = await signup.json();
console.log("UID:", localId);

// Sign in
const signin = await fetch(`${AUTH}:signInWithPassword?key=${API_KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "user@example.com", password: "Pass123!", returnSecureToken: true })
});
const tokens = await signin.json();

// Get user profile
const profile = await fetch(`${AUTH}:lookup?key=${API_KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ idToken: tokens.idToken })
});
console.log((await profile.json()).users[0]);

// Refresh expired ID token
const refresh = await fetch(`https://securetoken.googleapis.com/v1/token?key=${API_KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ grant_type: "refresh_token", refresh_token: tokens.refreshToken })
});
const { id_token: newIdToken } = await refresh.json();

// Send password reset email
await fetch(`${AUTH}:sendOobCode?key=${API_KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ requestType: "PASSWORD_RESET", email: "user@example.com" })
});

// Update profile
await fetch(`${AUTH}:update?key=${API_KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ idToken: tokens.idToken, displayName: "Alice Johnson", returnSecureToken: true })
});

// Delete account
await fetch(`${AUTH}:delete?key=${API_KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ idToken: tokens.idToken })
});
```

---

### Firebase Cloud Messaging

```javascript
// Server-side only — requires service account OAuth token
const FCM_TOKEN = "YOUR_SERVICE_ACCOUNT_TOKEN";
const PROJECT = "my-firebase-project";
const FCM = `https://fcm.googleapis.com/v1/projects/${PROJECT}/messages:send`;

// Send to a single device
await fetch(FCM, {
  method: "POST",
  headers: { Authorization: `Bearer ${FCM_TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    message: {
      token: "DEVICE_REGISTRATION_TOKEN",
      notification: { title: "New Message", body: "You have an unread message." },
      data: { orderId: "12345", type: "order_update" },
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default", badge: 1 } } }
    }
  })
});

// Send to a topic
await fetch(FCM, {
  method: "POST",
  headers: { Authorization: `Bearer ${FCM_TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    message: {
      topic: "breaking-news",
      notification: { title: "Breaking News!", body: "Big story just in." }
    }
  })
});
```

---

## Search & Discovery

### Custom Search API

```javascript
const KEY = "YOUR_API_KEY";
const CX  = "YOUR_SEARCH_ENGINE_ID"; // from cse.google.com
const BASE = "https://www.googleapis.com/customsearch/v1";

// Web search
const search = await fetch(`${BASE}?key=${KEY}&cx=${CX}&q=JavaScript+async+await&num=5`);
const sData = await search.json();
console.log("Total:", sData.searchInformation.totalResults);
sData.items.forEach(i => { console.log(i.title); console.log(i.link); console.log(i.snippet); });

// Image search
const imgs = await fetch(`${BASE}?key=${KEY}&cx=${CX}&q=northern+lights&searchType=image&num=5&imgSize=large`);
(await imgs.json()).items.forEach(i => console.log(i.title, i.link, i.image.thumbnailLink));

// Filter by recency (last 7 days)
const recent = await fetch(`${BASE}?key=${KEY}&cx=${CX}&q=AI+news&dateRestrict=d7&sort=date`);

// Paginate (up to 100 results, 10 per page)
async function* searchAll(query) {
  for (let start = 1; start <= 91; start += 10) {
    const res = await fetch(`${BASE}?key=${KEY}&cx=${CX}&q=${encodeURIComponent(query)}&start=${start}&num=10`);
    const data = await res.json();
    if (!data.items?.length) break;
    yield* data.items;
  }
}
for await (const item of searchAll("machine learning")) console.log(item.title);
```

---

### Knowledge Graph API

```javascript
const KEY = "YOUR_API_KEY";

const kg = await fetch(
  `https://kgsearch.googleapis.com/v1/entities:search?query=Nikola+Tesla&key=${KEY}&limit=3&indent=True`
);
(await kg.json()).itemListElement.forEach(item => {
  const e = item.result;
  console.log("Name:", e.name);
  console.log("Types:", e["@type"]?.join(", "));
  console.log("Description:", e.description);
  console.log("Detail:", e.detailedDescription?.articleBody?.slice(0, 200));
  if (e.image) console.log("Image:", e.image.url);
  console.log("Score:", item.resultScore);
});

// Filter by entity type
const person = await fetch(
  `https://kgsearch.googleapis.com/v1/entities:search?query=Marie+Curie&types=Person&key=${KEY}&limit=1`
);
```

---

### PageSpeed Insights API

```javascript
const KEY = "YOUR_API_KEY";
const url = "https://www.example.com";

const psi = await fetch(
  `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&key=${KEY}`
);
const d = await psi.json();
const cats = d.lighthouseResult.categories;
const audits = d.lighthouseResult.audits;

console.log("Performance:",    Math.round(cats.performance.score * 100));
console.log("Accessibility:",  Math.round(cats.accessibility.score * 100));
console.log("Best Practices:", Math.round(cats["best-practices"].score * 100));
console.log("SEO:",            Math.round(cats.seo.score * 100));

console.log("\nFCP:",  audits["first-contentful-paint"].displayValue);
console.log("LCP:",   audits["largest-contentful-paint"].displayValue);
console.log("TBT:",   audits["total-blocking-time"].displayValue);
console.log("CLS:",   audits["cumulative-layout-shift"].displayValue);
console.log("TTI:",   audits["interactive"].displayValue);

// Real user Core Web Vitals
const cwv = d.loadingExperience?.metrics;
if (cwv) {
  console.log("\nReal LCP:", cwv.LARGEST_CONTENTFUL_PAINT_MS?.category);
  console.log("Real FID:", cwv.FIRST_INPUT_DELAY_MS?.category);
  console.log("Real CLS:", cwv.CUMULATIVE_LAYOUT_SHIFT_SCORE?.category);
}

// Opportunities to fix
Object.values(audits)
  .filter(a => a.details?.type === "opportunity" && a.score !== null && a.score < 0.9)
  .forEach(a => console.log("\n⚠", a.title, a.displayValue ?? ""));
```

---

## Communication

### Google Chat API

```javascript
const TOKEN = "YOUR_OAUTH2_ACCESS_TOKEN";
const CHAT = "https://chat.googleapis.com/v1";

// Send a text message
const msg = await fetch(`${CHAT}/spaces/SPACE_ID/messages`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ text: "Hello from the Chat REST API! 👋" })
});
console.log("Message name:", (await msg.json()).name);

// Incoming Webhook — no OAuth needed
const webhookUrl = "https://chat.googleapis.com/v1/spaces/SPACE_ID/messages?key=...&token=...";
await fetch(webhookUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "Deployment *succeeded* ✅ — v2.1.0 is live." })
});

// Rich card message
await fetch(`${CHAT}/spaces/SPACE_ID/messages`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    cardsV2: [{
      cardId: "status-card",
      card: {
        header: { title: "Build Status", subtitle: "Production" },
        sections: [{
          widgets: [
            { textParagraph: { text: "<b>Status:</b> ✅ Success" } },
            { textParagraph: { text: "<b>Version:</b> v2.1.0" } },
            {
              buttonList: { buttons: [
                { text: "View Logs", onClick: { openLink: { url: "https://console.cloud.google.com" } } }
              ]}
            }
          ]
        }]
      }
    }]
  })
});

// List spaces
const spaces = await fetch(`${CHAT}/spaces`, { headers: { Authorization: `Bearer ${TOKEN}` } });
(await spaces.json()).spaces?.forEach(s => console.log(s.displayName, s.name));

// Reply to a thread
await fetch(`${CHAT}/spaces/SPACE_ID/messages`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ text: "Done! ✅", thread: { name: "spaces/SPACE_ID/threads/THREAD_ID" } })
});
```

---

## Analytics & Advertising

### Google Analytics Data API

```javascript
const TOKEN = "YOUR_SERVICE_ACCOUNT_OR_OAUTH_TOKEN";
const PROP = "properties/YOUR_GA4_PROPERTY_ID";
const GA = "https://analyticsdata.googleapis.com/v1beta";

// Standard report
const report = await fetch(`${GA}/${PROP}:runReport`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    dimensions: [{ name: "city" }, { name: "country" }],
    metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "bounceRate" }],
    dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 20
  })
});
const rData = await report.json();
console.log("Rows:", rData.rowCount);
rData.rows?.forEach(row => {
  const dims = row.dimensionValues.map(d => d.value);
  const mets = row.metricValues.map(m => m.value);
  console.log(dims.join(", "), "—", mets.join(", "));
});

// Real-time active users
const rt = await fetch(`${GA}/${PROP}:runRealtimeReport`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    dimensions: [{ name: "unifiedScreenName" }],
    metrics: [{ name: "activeUsers" }]
  })
});
const rtData = await rt.json();
const total = rtData.rows?.reduce((s, r) => s + parseInt(r.metricValues[0].value), 0) ?? 0;
console.log("Active users right now:", total);
rtData.rows?.forEach(r => console.log(r.dimensionValues[0].value, r.metricValues[0].value));
```

---

### Google Ads API

```javascript
const ADS_TOKEN = "YOUR_OAUTH2_ACCESS_TOKEN";
const DEV_TOKEN  = "YOUR_DEVELOPER_TOKEN";
const CUSTOMER   = "YOUR_CUSTOMER_ID"; // 10-digit, no dashes
const ADS = `https://googleads.googleapis.com/v18/customers/${CUSTOMER}`;

// GAQL query — get campaign metrics
const q = await fetch(`${ADS}/googleAds:search`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${ADS_TOKEN}`,
    "developer-token": DEV_TOKEN,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    query: `
      SELECT campaign.id, campaign.name, campaign.status,
             metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.ctr
      FROM campaign
      WHERE campaign.status = 'ENABLED'
        AND segments.date DURING LAST_30_DAYS
      ORDER BY metrics.impressions DESC
      LIMIT 10`
  })
});
(await q.json()).results?.forEach(({ campaign, metrics }) => {
  console.log(campaign.name,
    "| Views:", metrics.impressions,
    "| Clicks:", metrics.clicks,
    "| Cost: $" + (metrics.costMicros / 1_000_000).toFixed(2),
    "| CTR:", (metrics.ctr * 100).toFixed(2) + "%");
});

// Create a budget
const budget = await fetch(`${ADS}/campaignBudgets:mutate`, {
  method: "POST",
  headers: { Authorization: `Bearer ${ADS_TOKEN}`, "developer-token": DEV_TOKEN, "Content-Type": "application/json" },
  body: JSON.stringify({
    operations: [{ create: { name: "Summer Budget", amountMicros: 5_000_000, deliveryMethod: "STANDARD" } }]
  })
});
const bData = await budget.json();

// Create a campaign
await fetch(`${ADS}/campaigns:mutate`, {
  method: "POST",
  headers: { Authorization: `Bearer ${ADS_TOKEN}`, "developer-token": DEV_TOKEN, "Content-Type": "application/json" },
  body: JSON.stringify({
    operations: [{
      create: {
        name: "Summer Sale 2025",
        status: "PAUSED",
        advertisingChannelType: "SEARCH",
        campaignBudget: bData.results[0].resourceName,
        biddingStrategyType: "TARGET_CPA",
        targetCpa: { targetCpaMicros: 1_000_000 }
      }
    }]
  })
});
```

---

## Other Useful APIs

### Google Fonts API

```html
<!-- Simplest — no JS needed -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet" />
<style>
  body { font-family: 'Inter', sans-serif; }
  h1   { font-family: 'Playfair Display', serif; }
</style>
```

```javascript
// List available fonts sorted by popularity
const fonts = await fetch(
  "https://www.googleapis.com/webfonts/v1/webfonts?key=YOUR_API_KEY&sort=popularity"
);
const { items } = await fonts.json();
items.slice(0, 10).forEach(f => console.log(f.family, f.category, f.variants.join(", ")));

// Dynamically load a font (browser)
function loadFont(family, weights = "400;700") {
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weights}&display=swap`;
  if (!document.querySelector(`link[href="${href}"]`)) {
    document.head.appendChild(Object.assign(document.createElement("link"), { rel: "stylesheet", href }));
  }
}
loadFont("Roboto Slab", "300;400;700");
document.body.style.fontFamily = "'Roboto Slab', serif";
```

---

### Safe Browsing API

```javascript
const KEY = "YOUR_API_KEY";

async function checkUrls(urls) {
  const res = await fetch(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: { clientId: "my-app", clientVersion: "1.0" },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: urls.map(url => ({ url }))
        }
      })
    }
  );
  const data = await res.json();
  const unsafe = new Set(data.matches?.map(m => m.threat.url) ?? []);
  return urls.map(url => ({
    url,
    safe: !unsafe.has(url),
    threat: data.matches?.find(m => m.threat.url === url)?.threatType
  }));
}

const results = await checkUrls([
  "https://google.com",
  "https://example-phishing-site.example",
]);
results.forEach(r => console.log(r.url, r.safe ? "✅ Safe" : "⚠ UNSAFE: " + r.threat));
```

---

### Google Indexing API

```javascript
// Requires service account token with Search Console property access
const TOKEN = "YOUR_SERVICE_ACCOUNT_TOKEN";
const IDX = "https://indexing.googleapis.com/v3/urlNotifications:publish";

// Notify of new/updated URL
const notify = await fetch(IDX, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ url: "https://example.com/new-page", type: "URL_UPDATED" })
});
console.log((await notify.json()).urlNotificationMetadata?.latestUpdate?.notifyTime);

// Notify of deleted URL
await fetch(IDX, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ url: "https://example.com/old-page", type: "URL_DELETED" })
});

// Check status
const status = await fetch(
  `https://indexing.googleapis.com/v3/urlNotifications/metadata?url=${encodeURIComponent("https://example.com/new-page")}`,
  { headers: { Authorization: `Bearer ${TOKEN}` } }
);
console.log((await status.json()).latestUpdate?.notifyTime);
```

---

### reCAPTCHA Enterprise

```html
<!-- Include script, then execute on action -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY" async defer></script>
<button onclick="submitForm()">Submit</button>
```

```javascript
// Browser: get a token
async function submitForm() {
  const token = await new Promise(resolve => {
    grecaptcha.ready(() => grecaptcha.execute("YOUR_SITE_KEY", { action: "submit" }).then(resolve));
  });
  // Send token to your server
  await fetch("/api/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: "...", captchaToken: token })
  });
}

// Server: verify token and get risk score
async function verifyCaptcha(token, userIp) {
  const res = await fetch(
    "https://recaptchaenterprise.googleapis.com/v1/projects/MY_PROJECT/assessments?key=YOUR_API_KEY",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: {
          token,
          siteKey: "YOUR_SITE_KEY",
          expectedAction: "submit",
          userIpAddress: userIp
        }
      })
    }
  );
  const d = await res.json();
  const score = d.riskAnalysis?.score ?? 0;
  console.log("Score:", score, "(0.0 = bot, 1.0 = human)");
  console.log("Valid:", d.tokenProperties?.valid);
  return { pass: d.tokenProperties?.valid && score >= 0.5, score };
}
```

---

## Authentication Quick Reference

### API Key (public data)

```javascript
// Query parameter
fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=Paris&key=YOUR_API_KEY`)
// Header (Gemini)
fetch("https://generativelanguage.googleapis.com/...", { headers: { "x-goog-api-key": "YOUR_API_KEY" } })
```

### OAuth 2.0 Access Token (user data)

```javascript
// Redirect user to consent screen
const authUrl = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
  client_id: "YOUR_CLIENT_ID.apps.googleusercontent.com",
  redirect_uri: "http://localhost:3000/callback",
  response_type: "code",
  scope: "https://www.googleapis.com/auth/gmail.readonly",
  access_type: "offline",
  prompt: "consent"
});

// Exchange code for tokens (server-side)
const tokens = await (await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ code: "CODE", client_id: "...", client_secret: "...", redirect_uri: "...", grant_type: "authorization_code" })
})).json();

// Use token
fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages", {
  headers: { Authorization: `Bearer ${tokens.access_token}` }
});

// Refresh when expired
const fresh = await (await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ refresh_token: tokens.refresh_token, client_id: "...", client_secret: "...", grant_type: "refresh_token" })
})).json();
```

### Enable an API via gcloud CLI

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable gmail.googleapis.com
gcloud services enable maps-backend.googleapis.com
gcloud services enable vision.googleapis.com
gcloud services enable translate.googleapis.com
gcloud services enable youtube.googleapis.com
gcloud services enable bigquery.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable generativelanguage.googleapis.com
```

| Method | Use case | Auth header |
|---|---|---|
| **API key** | Public data (Maps, YouTube, Search, Fonts) | `?key=YOUR_KEY` |
| **OAuth 2.0** | User data (Gmail, Drive, Calendar) | `Authorization: Bearer TOKEN` |
| **Service Account** | Server-to-server (BigQuery, GCS, Firestore) | `Authorization: Bearer TOKEN` |
| **App Default Creds** | Apps on GCP (Compute, Cloud Run, GKE) | Automatic |

---

## Resources

- [Google APIs Explorer](https://developers.google.com/apis-explorer) — interactive testing for every endpoint
- [Google Cloud Console](https://console.cloud.google.com) — manage projects, keys, and billing
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) — get access tokens interactively in the browser
- [Google AI Studio](https://aistudio.google.com) — get a Gemini API key in seconds
- [Firebase Console](https://console.firebase.google.com) — Firebase project setup
- [Google Developers](https://developers.google.com) — full API documentation
- [API Discovery Service](https://www.googleapis.com/discovery/v1/apis) — JSON list of every public Google API
