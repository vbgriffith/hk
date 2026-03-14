# Google APIs — Complete Reference with Code Examples

A comprehensive guide to the major Google APIs, organized by category, with practical code examples for each. All examples use JavaScript/Node.js unless otherwise noted. Most APIs require a Google Cloud project, an API key or OAuth 2.0 credentials, and the relevant service enabled in the [Google Cloud Console](https://console.cloud.google.com).

---

## Table of Contents

1. [AI & Machine Learning](#ai--machine-learning)
   - Gemini API · Cloud Vision API · Cloud Natural Language API · Cloud Speech-to-Text · Cloud Text-to-Speech · Cloud Translation API · Cloud Video Intelligence API · Vertex AI
2. [Maps & Location](#maps--location)
   - Maps JavaScript API · Geocoding API · Directions API · Places API · Distance Matrix API · Maps Embed API · Street View API
3. [Google Workspace](#google-workspace)
   - Gmail API · Google Drive API · Google Sheets API · Google Docs API · Google Slides API · Google Calendar API · Google Tasks API · Google Meet API
4. [YouTube](#youtube)
   - YouTube Data API · YouTube Analytics API · YouTube Live Streaming API
5. [Identity & Auth](#identity--auth)
   - Google Identity Services · OAuth 2.0 · Google Sign-In
6. [Cloud Infrastructure](#cloud-infrastructure)
   - Cloud Storage API · Compute Engine API · Cloud Functions API · Cloud Pub/Sub · BigQuery API · Cloud Firestore API · Cloud Run API · Cloud SQL API
7. [Firebase APIs](#firebase-apis)
   - Realtime Database · Firestore · Authentication · Cloud Messaging · Remote Config
8. [Search & Discovery](#search--discovery)
   - Custom Search API · Knowledge Graph API · PageSpeed Insights API
9. [Communication](#communication)
   - Cloud Messaging (FCM) · Google Chat API
10. [Analytics & Advertising](#analytics--advertising)
    - Google Analytics Data API · Google Ads API
11. [Other Useful APIs](#other-useful-apis)
    - Fonts API · Chrome UX Report API · Safe Browsing API · Indexing API · reCAPTCHA

---

## AI & Machine Learning

### Gemini API

The flagship generative AI API supporting text, image, audio, and video understanding and generation.

```javascript
// npm install @google/genai
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Text generation
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: "Explain quantum entanglement in simple terms.",
});
console.log(response.text);

// Chat (multi-turn)
const chat = ai.chats.create({ model: "gemini-2.5-flash" });
const reply1 = await chat.sendMessage("What is the capital of France?");
const reply2 = await chat.sendMessage("What is its population?");
console.log(reply2.text);

// Vision — describe an image
const imageResponse = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [
    { text: "What is in this image?" },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: fs.readFileSync("photo.jpg").toString("base64"),
      },
    },
  ],
});

// Streaming
const stream = await ai.models.generateContentStream({
  model: "gemini-2.5-flash",
  contents: "Write a short poem about rain.",
});
for await (const chunk of stream) {
  process.stdout.write(chunk.text);
}

// REST (no SDK)
// curl https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent \
//   -H "x-goog-api-key: $GEMINI_API_KEY" \
//   -H "Content-Type: application/json" \
//   -d '{"contents":[{"parts":[{"text":"Hello, world!"}]}]}'
```

---

### Cloud Vision API

Detects objects, text, faces, landmarks, logos, and explicit content in images.

```javascript
// npm install @google-cloud/vision
const vision = require("@google-cloud/vision");
const client = new vision.ImageAnnotatorClient();

// Label detection
const [labelResult] = await client.labelDetection("gs://my-bucket/photo.jpg");
const labels = labelResult.labelAnnotations;
labels.forEach(label => console.log(label.description, label.score));

// OCR — read text from an image
const [textResult] = await client.textDetection("./receipt.png");
const detections = textResult.textAnnotations;
console.log(detections[0].description); // full extracted text

// Face detection
const [faceResult] = await client.faceDetection("./portrait.jpg");
faceResult.faceAnnotations.forEach(face => {
  console.log("Joy:", face.joyLikelihood);
  console.log("Anger:", face.angerLikelihood);
  console.log("Surprise:", face.surpriseLikelihood);
});

// Safe Search (detect adult/violent content)
const [safeResult] = await client.safeSearchDetection("./image.jpg");
const safe = safeResult.safeSearchAnnotation;
console.log("Adult:", safe.adult);
console.log("Violence:", safe.violence);

// Object localization
const [objResult] = await client.objectLocalization("./street.jpg");
objResult.localizedObjectAnnotations.forEach(obj => {
  console.log(obj.name, obj.score);
});
```

---

### Cloud Natural Language API

Analyzes text for sentiment, entities, syntax, and content classification.

```javascript
// npm install @google-cloud/language
const language = require("@google-cloud/language");
const client = new language.LanguageServiceClient();

const document = {
  content: "Google Cloud is an amazing platform for building scalable apps.",
  type: "PLAIN_TEXT",
};

// Sentiment analysis
const [sentiment] = await client.analyzeSentiment({ document });
const { score, magnitude } = sentiment.documentSentiment;
console.log(`Score: ${score}, Magnitude: ${magnitude}`);
// score: -1.0 (negative) to 1.0 (positive)

// Entity recognition
const [entities] = await client.analyzeEntities({ document });
entities.entities.forEach(entity => {
  console.log(`${entity.name} (${entity.type}) - salience: ${entity.salience}`);
});

// Syntax analysis
const [syntax] = await client.analyzeSyntax({ document });
syntax.tokens.forEach(token => {
  console.log(`${token.text.content} — ${token.partOfSpeech.tag}`);
});

// Content classification
const [classification] = await client.classifyText({ document });
classification.categories.forEach(cat => {
  console.log(cat.name, cat.confidence);
});
```

---

### Cloud Speech-to-Text

Converts audio to text supporting 125+ languages and real-time streaming.

```javascript
// npm install @google-cloud/speech
const speech = require("@google-cloud/speech");
const fs = require("fs");

const client = new speech.SpeechClient();

// Transcribe a local audio file
const audio = {
  content: fs.readFileSync("audio.flac").toString("base64"),
};
const config = {
  encoding: "FLAC",
  sampleRateHertz: 16000,
  languageCode: "en-US",
};

const [response] = await client.recognize({ audio, config });
response.results.forEach(result => {
  console.log(result.alternatives[0].transcript);
  console.log("Confidence:", result.alternatives[0].confidence);
});

// Long audio (from Cloud Storage)
const [operation] = await client.longRunningRecognize({
  audio: { uri: "gs://my-bucket/long-speech.mp3" },
  config: { encoding: "MP3", sampleRateHertz: 44100, languageCode: "en-US" },
});
const [longResult] = await operation.promise();
longResult.results.forEach(result => {
  console.log(result.alternatives[0].transcript);
});

// Streaming transcription
const recognizeStream = client
  .streamingRecognize({ config: { encoding: "LINEAR16", sampleRateHertz: 16000, languageCode: "en-US" } })
  .on("data", data => console.log(data.results[0].alternatives[0].transcript));

fs.createReadStream("audio.raw").pipe(recognizeStream);
```

---

### Cloud Text-to-Speech

Converts text to natural-sounding speech with 380+ voices in 50+ languages.

```javascript
// npm install @google-cloud/text-to-speech
const textToSpeech = require("@google-cloud/text-to-speech");
const fs = require("fs");

const client = new textToSpeech.TextToSpeechClient();

const [response] = await client.synthesizeSpeech({
  input: { text: "Welcome to Google Cloud Text-to-Speech." },
  voice: {
    languageCode: "en-US",
    name: "en-US-Neural2-C",
    ssmlGender: "FEMALE",
  },
  audioConfig: { audioEncoding: "MP3", speakingRate: 1.0, pitch: 0 },
});

fs.writeFileSync("output.mp3", response.audioContent, "binary");
console.log("Audio saved to output.mp3");

// SSML for fine control
const [ssmlResponse] = await client.synthesizeSpeech({
  input: {
    ssml: `<speak>
      Hello <break time="500ms"/> world.
      <emphasis level="strong">This is important.</emphasis>
    </speak>`,
  },
  voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
  audioConfig: { audioEncoding: "OGG_OPUS" },
});

// List available voices
const [voices] = await client.listVoices({ languageCode: "en-US" });
voices.voices.forEach(v => console.log(v.name, v.ssmlGender));
```

---

### Cloud Translation API

Translates text between 100+ languages, with auto language detection.

```javascript
// npm install @google-cloud/translate
const { Translate } = require("@google-cloud/translate").v2;
const translate = new Translate({ projectId: "your-project-id" });

// Translate text
const [translation] = await translate.translate("Hello, world!", "es");
console.log(translation); // "¡Hola, mundo!"

// Detect language
const [detection] = await translate.detect("Bonjour le monde");
console.log(detection.language); // "fr"
console.log(detection.confidence);

// Translate with source language specified
const [result] = await translate.translate(
  ["Good morning", "Good night"],
  { from: "en", to: "ja" }
);
result.forEach(t => console.log(t));

// List supported languages
const [languages] = await translate.getLanguages();
languages.forEach(lang => console.log(lang.code, lang.name));

// v3 Advanced (supports glossaries and batch)
const { TranslationServiceClient } = require("@google-cloud/translate").v3;
const v3Client = new TranslationServiceClient();
const [v3Result] = await v3Client.translateText({
  parent: "projects/my-project/locations/global",
  contents: ["The weather is lovely today."],
  mimeType: "text/plain",
  sourceLanguageCode: "en",
  targetLanguageCode: "de",
});
console.log(v3Result.translations[0].translatedText);
```

---

### Cloud Video Intelligence API

Analyzes video for labels, shot changes, speech, text, objects, and explicit content.

```javascript
// npm install @google-cloud/video-intelligence
const video = require("@google-cloud/video-intelligence");
const client = new video.VideoIntelligenceServiceClient();

const [operation] = await client.annotateVideo({
  inputUri: "gs://cloud-samples-data/video/cat.mp4",
  features: [
    "LABEL_DETECTION",
    "SHOT_CHANGE_DETECTION",
    "SPEECH_TRANSCRIPTION",
  ],
  videoContext: {
    speechTranscriptionConfig: {
      languageCode: "en-US",
      enableAutomaticPunctuation: true,
    },
  },
});

const [result] = await operation.promise();
const annotations = result.annotationResults[0];

// Labels
annotations.segmentLabelAnnotations.forEach(label => {
  console.log(`Label: ${label.entity.description}`);
});

// Shot changes
annotations.shotAnnotations.forEach(shot => {
  console.log(
    `Shot: ${shot.startTimeOffset.seconds}s — ${shot.endTimeOffset.seconds}s`
  );
});

// Transcription
annotations.speechTranscriptions.forEach(transcription => {
  transcription.alternatives.forEach(alt => {
    console.log(alt.transcript, alt.confidence);
  });
});
```

---

### Vertex AI

Google Cloud's fully managed ML platform for training, serving, and fine-tuning models.

```javascript
// npm install @google-cloud/aiplatform
const aiplatform = require("@google-cloud/aiplatform");

// Text prediction with PaLM / Gemini on Vertex
const { PredictionServiceClient } = aiplatform.v1;
const client = new PredictionServiceClient({
  apiEndpoint: "us-central1-aiplatform.googleapis.com",
});

const endpoint = `projects/my-project/locations/us-central1/publishers/google/models/gemini-2.5-flash`;

const [response] = await client.generateContent({
  model: endpoint,
  contents: [{ role: "user", parts: [{ text: "Summarize the water cycle." }] }],
});
console.log(response.candidates[0].content.parts[0].text);

// Using the Vertex AI SDK (Python example)
/*
from google.cloud import aiplatform
from vertexai.generative_models import GenerativeModel

aiplatform.init(project="my-project", location="us-central1")
model = GenerativeModel("gemini-2.5-flash")
response = model.generate_content("What is machine learning?")
print(response.text)
*/
```

---

## Maps & Location

### Maps JavaScript API

Embeds interactive maps in web pages with markers, overlays, and controls.

```html
<!-- Include in HTML head -->
<script
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"
  async defer
></script>
```

```javascript
// Initialize a map
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 12,
    mapTypeId: "roadmap",
  });

  // Add a marker
  const marker = new google.maps.Marker({
    position: { lat: 40.7128, lng: -74.006 },
    map,
    title: "New York City",
    animation: google.maps.Animation.DROP,
  });

  // Info window
  const infoWindow = new google.maps.InfoWindow({
    content: "<h3>New York City</h3><p>The Big Apple</p>",
  });
  marker.addListener("click", () => infoWindow.open(map, marker));

  // Draw a polygon
  const polygon = new google.maps.Polygon({
    paths: [
      { lat: 40.72, lng: -74.01 },
      { lat: 40.73, lng: -73.99 },
      { lat: 40.71, lng: -73.98 },
    ],
    strokeColor: "#FF0000",
    fillColor: "#FF0000",
    fillOpacity: 0.25,
    map,
  });

  // Heatmap layer
  const heatmap = new google.maps.visualization.HeatmapLayer({
    data: [
      new google.maps.LatLng(40.72, -74.01),
      new google.maps.LatLng(40.73, -73.99),
    ],
    map,
  });
}
```

---

### Geocoding API

Converts addresses to coordinates (and vice versa).

```javascript
// REST
const address = encodeURIComponent("1600 Amphitheatre Parkway, Mountain View, CA");
const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=YOUR_API_KEY`;

const response = await fetch(url);
const data = await response.json();
const { lat, lng } = data.results[0].geometry.location;
console.log(lat, lng); // 37.4224, -122.0842

// Reverse geocoding (coordinates → address)
const revUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=37.4224,-122.0842&key=YOUR_API_KEY`;
const revData = await (await fetch(revUrl)).json();
console.log(revData.results[0].formatted_address);

// In browser with Maps JS API
const geocoder = new google.maps.Geocoder();
geocoder.geocode({ address: "Sydney, Australia" }, (results, status) => {
  if (status === "OK") {
    console.log(results[0].geometry.location.lat());
  }
});
```

---

### Directions API

Calculates routes between locations with support for driving, walking, cycling, and transit.

```javascript
// REST request
const origin = "New+York,NY";
const destination = "Los+Angeles,CA";
const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=YOUR_API_KEY`;

const data = await (await fetch(url)).json();
const route = data.routes[0];
console.log("Distance:", route.legs[0].distance.text);
console.log("Duration:", route.legs[0].duration.text);
route.legs[0].steps.forEach(step => {
  console.log(step.html_instructions, step.distance.text);
});

// With waypoints and avoid tolls
const waypointUrl = `https://maps.googleapis.com/maps/api/directions/json
  ?origin=Chicago,IL
  &destination=New+York,NY
  &waypoints=via:Pittsburgh,PA
  &avoid=tolls
  &key=YOUR_API_KEY`;

// Transit example
const transitUrl = `https://maps.googleapis.com/maps/api/directions/json
  ?origin=Grand+Central+Station,New+York,NY
  &destination=Times+Square,New+York,NY
  &mode=transit
  &transit_mode=subway
  &key=YOUR_API_KEY`;
```

---

### Places API

Searches for businesses and points of interest, with detailed information and photos.

```javascript
// Nearby search
const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json
  ?location=37.7749,-122.4194
  &radius=1500
  &type=restaurant
  &key=YOUR_API_KEY`;

const nearby = await (await fetch(nearbyUrl)).json();
nearby.results.forEach(place => {
  console.log(place.name, place.rating, place.vicinity);
});

// Text search
const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json
  ?query=coffee+shops+in+Seattle
  &key=YOUR_API_KEY`;

// Place details
const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json
  ?place_id=ChIJN1t_tDeuEmsRUsoyG83frY4
  &fields=name,rating,formatted_phone_number,website,opening_hours
  &key=YOUR_API_KEY`;

const detail = await (await fetch(detailUrl)).json();
console.log(detail.result.name);
console.log(detail.result.formatted_phone_number);

// Autocomplete (for search boxes)
const autoUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json
  ?input=Staples+Ce
  &types=establishment
  &key=YOUR_API_KEY`;

// Photo retrieval
const photoRef = nearby.results[0].photos[0].photo_reference;
const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=YOUR_API_KEY`;
```

---

### Distance Matrix API

Computes travel time and distance for a matrix of origins and destinations.

```javascript
const origins = "New+York,NY|Boston,MA";
const destinations = "Philadelphia,PA|Washington,DC";
const url = `https://maps.googleapis.com/maps/api/distancematrix/json
  ?origins=${origins}
  &destinations=${destinations}
  &mode=driving
  &units=imperial
  &key=YOUR_API_KEY`;

const data = await (await fetch(url)).json();
data.rows.forEach((row, i) => {
  row.elements.forEach((el, j) => {
    console.log(
      `${data.origin_addresses[i]} → ${data.destination_addresses[j]}: ${el.distance.text}, ${el.duration.text}`
    );
  });
});
```

---

## Google Workspace

### Gmail API

Reads, sends, modifies, and organizes email programmatically.

```javascript
// npm install googleapis
const { google } = require("googleapis");

// Authenticate (using OAuth2)
const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
auth.setCredentials({ refresh_token: REFRESH_TOKEN });
const gmail = google.gmail({ version: "v1", auth });

// List messages
const { data } = await gmail.users.messages.list({
  userId: "me",
  q: "is:unread from:someone@example.com",
  maxResults: 10,
});
console.log(data.messages);

// Get a message
const msg = await gmail.users.messages.get({
  userId: "me",
  id: data.messages[0].id,
  format: "full",
});
const headers = msg.data.payload.headers;
const subject = headers.find(h => h.name === "Subject")?.value;
console.log("Subject:", subject);

// Send an email
const raw = Buffer.from(
  `To: recipient@example.com\r\nSubject: Hello!\r\nContent-Type: text/plain\r\n\r\nThis is the email body.`
).toString("base64url");

await gmail.users.messages.send({
  userId: "me",
  requestBody: { raw },
});

// Create a draft
await gmail.users.drafts.create({
  userId: "me",
  requestBody: {
    message: { raw },
  },
});

// Add a label
await gmail.users.messages.modify({
  userId: "me",
  id: data.messages[0].id,
  requestBody: {
    addLabelIds: ["STARRED"],
    removeLabelIds: ["UNREAD"],
  },
});
```

---

### Google Drive API

Uploads, downloads, manages, and shares files in Google Drive.

```javascript
const { google } = require("googleapis");
const drive = google.drive({ version: "v3", auth });

// List files
const { data } = await drive.files.list({
  pageSize: 10,
  fields: "files(id, name, mimeType, createdTime)",
  q: "mimeType='application/pdf'",
});
data.files.forEach(f => console.log(f.name, f.id));

// Upload a file
const fs = require("fs");
const { data: uploaded } = await drive.files.create({
  requestBody: {
    name: "my-document.pdf",
    parents: ["FOLDER_ID"],
  },
  media: {
    mimeType: "application/pdf",
    body: fs.createReadStream("./local-file.pdf"),
  },
  fields: "id, name, webViewLink",
});
console.log("Uploaded:", uploaded.webViewLink);

// Download a file
const dest = fs.createWriteStream("./downloaded.pdf");
await drive.files.get(
  { fileId: "FILE_ID", alt: "media" },
  { responseType: "stream" },
  (err, res) => res.data.pipe(dest)
);

// Share a file
await drive.permissions.create({
  fileId: "FILE_ID",
  requestBody: {
    type: "user",
    role: "reader",
    emailAddress: "colleague@example.com",
  },
});

// Create a folder
await drive.files.create({
  requestBody: {
    name: "My New Folder",
    mimeType: "application/vnd.google-apps.folder",
  },
});
```

---

### Google Sheets API

Reads and writes data in Google Sheets spreadsheets.

```javascript
const sheets = google.sheets({ version: "v4", auth });

// Read values
const { data } = await sheets.spreadsheets.values.get({
  spreadsheetId: "YOUR_SPREADSHEET_ID",
  range: "Sheet1!A1:D10",
});
const rows = data.values;
rows.forEach(row => console.log(row.join(", ")));

// Write values
await sheets.spreadsheets.values.update({
  spreadsheetId: "YOUR_SPREADSHEET_ID",
  range: "Sheet1!A1",
  valueInputOption: "USER_ENTERED",
  requestBody: {
    values: [
      ["Name", "Age", "City"],
      ["Alice", 30, "New York"],
      ["Bob", 25, "Los Angeles"],
    ],
  },
});

// Append rows
await sheets.spreadsheets.values.append({
  spreadsheetId: "YOUR_SPREADSHEET_ID",
  range: "Sheet1!A:D",
  valueInputOption: "USER_ENTERED",
  requestBody: { values: [["Charlie", 28, "Chicago"]] },
});

// Clear a range
await sheets.spreadsheets.values.clear({
  spreadsheetId: "YOUR_SPREADSHEET_ID",
  range: "Sheet1!A2:D100",
});

// Create a new spreadsheet
const { data: newSheet } = await sheets.spreadsheets.create({
  requestBody: {
    properties: { title: "My New Spreadsheet" },
    sheets: [{ properties: { title: "Data" } }],
  },
});
console.log("Created:", newSheet.spreadsheetId);

// Format cells (bold header row)
await sheets.spreadsheets.batchUpdate({
  spreadsheetId: "YOUR_SPREADSHEET_ID",
  requestBody: {
    requests: [{
      repeatCell: {
        range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
        cell: { userEnteredFormat: { textFormat: { bold: true } } },
        fields: "userEnteredFormat.textFormat.bold",
      },
    }],
  },
});
```

---

### Google Docs API

Creates, reads, and edits Google Docs programmatically.

```javascript
const docs = google.docs({ version: "v1", auth });

// Create a document
const { data: newDoc } = await docs.documents.create({
  requestBody: { title: "My Report" },
});
console.log("Document ID:", newDoc.documentId);

// Read document content
const { data: doc } = await docs.documents.get({
  documentId: "DOCUMENT_ID",
});
doc.body.content.forEach(element => {
  if (element.paragraph) {
    element.paragraph.elements.forEach(el => {
      if (el.textRun) console.log(el.textRun.content);
    });
  }
});

// Insert text at end of document
const { data: endDoc } = await docs.documents.get({ documentId: "DOCUMENT_ID" });
const endIndex = endDoc.body.content.at(-1).endIndex - 1;

await docs.documents.batchUpdate({
  documentId: "DOCUMENT_ID",
  requestBody: {
    requests: [
      {
        insertText: {
          location: { index: endIndex },
          text: "\nThis paragraph was added via the API.",
        },
      },
      {
        updateParagraphStyle: {
          range: { startIndex: endIndex, endIndex: endIndex + 50 },
          paragraphStyle: { namedStyleType: "HEADING_1" },
          fields: "namedStyleType",
        },
      },
    ],
  },
});

// Replace text throughout document
await docs.documents.batchUpdate({
  documentId: "DOCUMENT_ID",
  requestBody: {
    requests: [{
      replaceAllText: {
        containsText: { text: "{{NAME}}", matchCase: false },
        replaceText: "Alice Johnson",
      },
    }],
  },
});
```

---

### Google Calendar API

Manages calendars, events, and attendees.

```javascript
const calendar = google.calendar({ version: "v3", auth });

// List upcoming events
const { data } = await calendar.events.list({
  calendarId: "primary",
  timeMin: new Date().toISOString(),
  maxResults: 10,
  singleEvents: true,
  orderBy: "startTime",
});
data.items.forEach(event => {
  const start = event.start.dateTime || event.start.date;
  console.log(start, event.summary);
});

// Create an event
const { data: newEvent } = await calendar.events.insert({
  calendarId: "primary",
  requestBody: {
    summary: "Team Standup",
    description: "Daily sync meeting",
    start: {
      dateTime: "2025-06-15T09:00:00-07:00",
      timeZone: "America/Los_Angeles",
    },
    end: {
      dateTime: "2025-06-15T09:30:00-07:00",
      timeZone: "America/Los_Angeles",
    },
    attendees: [
      { email: "alice@example.com" },
      { email: "bob@example.com" },
    ],
    recurrence: ["RRULE:FREQ=DAILY;COUNT=5"],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 30 },
        { method: "popup", minutes: 10 },
      ],
    },
  },
});
console.log("Event link:", newEvent.htmlLink);

// Delete an event
await calendar.events.delete({ calendarId: "primary", eventId: "EVENT_ID" });

// List all calendars
const { data: calList } = await calendar.calendarList.list();
calList.items.forEach(cal => console.log(cal.summary, cal.id));
```

---

### Google Tasks API

Manages tasks and task lists in Google Tasks.

```javascript
const tasks = google.tasks({ version: "v1", auth });

// List task lists
const { data: lists } = await tasks.tasklists.list();
lists.items.forEach(list => console.log(list.title, list.id));

// List tasks in a list
const { data: taskList } = await tasks.tasks.list({
  tasklist: "@default",
  showCompleted: false,
});
taskList.items?.forEach(task => console.log(task.title, task.status));

// Create a task
const { data: newTask } = await tasks.tasks.insert({
  tasklist: "@default",
  requestBody: {
    title: "Buy groceries",
    notes: "Milk, eggs, bread",
    due: "2025-06-20T00:00:00.000Z",
  },
});

// Mark a task complete
await tasks.tasks.update({
  tasklist: "@default",
  task: newTask.id,
  requestBody: { ...newTask, status: "completed" },
});
```

---

## YouTube

### YouTube Data API

Searches videos, manages channels, playlists, comments, and subscriptions.

```javascript
const youtube = google.youtube({ version: "v3", auth });

// Search videos
const { data: search } = await youtube.search.list({
  part: ["snippet"],
  q: "JavaScript tutorial",
  type: ["video"],
  maxResults: 5,
  order: "viewCount",
});
search.items.forEach(item => {
  console.log(item.snippet.title, item.id.videoId);
});

// Get video details
const { data: video } = await youtube.videos.list({
  part: ["snippet", "statistics", "contentDetails"],
  id: ["dQw4w9WgXcQ"],
});
const v = video.items[0];
console.log(v.snippet.title);
console.log("Views:", v.statistics.viewCount);
console.log("Duration:", v.contentDetails.duration);

// List channel playlists
const { data: playlists } = await youtube.playlists.list({
  part: ["snippet", "contentDetails"],
  channelId: "UC_x5XG1OV2P6uZZ5FSM9Ttw",
  maxResults: 20,
});
playlists.items.forEach(p => {
  console.log(p.snippet.title, p.contentDetails.itemCount);
});

// Get channel info
const { data: channel } = await youtube.channels.list({
  part: ["snippet", "statistics"],
  forUsername: "GoogleDevelopers",
});
console.log("Subscribers:", channel.items[0].statistics.subscriberCount);

// Post a comment
await youtube.commentThreads.insert({
  part: ["snippet"],
  requestBody: {
    snippet: {
      videoId: "VIDEO_ID",
      topLevelComment: {
        snippet: { textOriginal: "Great video!" },
      },
    },
  },
});
```

---

### YouTube Analytics API

Retrieves analytics data for channels and videos.

```javascript
const youtubeAnalytics = google.youtubeAnalytics({ version: "v2", auth });

// Get channel metrics for last 30 days
const { data } = await youtubeAnalytics.reports.query({
  ids: "channel==MINE",
  startDate: "2025-05-01",
  endDate: "2025-05-31",
  metrics: "views,estimatedMinutesWatched,averageViewDuration,subscribersGained",
  dimensions: "day",
  sort: "day",
});

data.rows.forEach(row => {
  const [date, views, minutes, avgDuration, subs] = row;
  console.log(`${date}: ${views} views, ${subs} new subscribers`);
});

// Traffic sources report
const { data: traffic } = await youtubeAnalytics.reports.query({
  ids: "channel==MINE",
  startDate: "2025-01-01",
  endDate: "2025-05-31",
  metrics: "views",
  dimensions: "insightTrafficSourceType",
  sort: "-views",
});
```

---

## Identity & Auth

### Google Identity Services (OAuth 2.0)

Authenticates users and authorizes API access.

```html
<!-- One-tap sign-in button -->
<script src="https://accounts.google.com/gsi/client" async defer></script>
<div id="g_id_onload"
  data-client_id="YOUR_CLIENT_ID"
  data-callback="handleCredentialResponse">
</div>
<div class="g_id_signin" data-type="standard"></div>
```

```javascript
// Handle sign-in response
function handleCredentialResponse(response) {
  // Decode JWT to get user info
  const payload = JSON.parse(atob(response.credential.split(".")[1]));
  console.log("Name:", payload.name);
  console.log("Email:", payload.email);
  console.log("Picture:", payload.picture);
}

// Request OAuth2 access token (for API calls)
const tokenClient = google.accounts.oauth2.initTokenClient({
  client_id: "YOUR_CLIENT_ID",
  scope: "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/drive.readonly",
  callback: (tokenResponse) => {
    const accessToken = tokenResponse.access_token;
    // Use accessToken to call APIs
    fetch("https://www.googleapis.com/gmail/v1/users/me/messages", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },
});
tokenClient.requestAccessToken();

// Server-side OAuth2 with googleapis (Node.js)
const { google } = require("googleapis");
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID, CLIENT_SECRET, "http://localhost:3000/callback"
);

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/gmail.send"],
});

// Exchange code for tokens
const { tokens } = await oauth2Client.getToken(CODE_FROM_CALLBACK);
oauth2Client.setCredentials(tokens);
```

---

## Cloud Infrastructure

### Cloud Storage API

Stores and retrieves objects in Google Cloud Storage buckets.

```javascript
// npm install @google-cloud/storage
const { Storage } = require("@google-cloud/storage");
const storage = new Storage({ projectId: "your-project-id" });

const bucket = storage.bucket("my-bucket");

// Upload a file
await bucket.upload("./local-file.jpg", {
  destination: "images/photo.jpg",
  metadata: { contentType: "image/jpeg" },
});

// Download a file
await bucket.file("images/photo.jpg").download({ destination: "./downloaded.jpg" });

// Make file public
await bucket.file("images/photo.jpg").makePublic();
const publicUrl = `https://storage.googleapis.com/my-bucket/images/photo.jpg`;

// Generate a signed URL (temporary access)
const [signedUrl] = await bucket.file("private/doc.pdf").getSignedUrl({
  action: "read",
  expires: Date.now() + 15 * 60 * 1000, // 15 minutes
});

// List files
const [files] = await bucket.getFiles({ prefix: "images/" });
files.forEach(file => console.log(file.name));

// Delete a file
await bucket.file("images/old-photo.jpg").delete();

// Upload from a stream
const stream = require("stream");
const passthroughStream = new stream.PassThrough();
passthroughStream.write("Hello, World!");
passthroughStream.end();
passthroughStream.pipe(bucket.file("hello.txt").createWriteStream());
```

---

### BigQuery API

Runs SQL queries on massive datasets using Google's serverless data warehouse.

```javascript
// npm install @google-cloud/bigquery
const { BigQuery } = require("@google-cloud/bigquery");
const bigquery = new BigQuery({ projectId: "your-project-id" });

// Run a query
const query = `
  SELECT name, COUNT(*) AS count
  FROM \`bigquery-public-data.usa_names.usa_1910_2013\`
  WHERE state = 'TX'
  GROUP BY name
  ORDER BY count DESC
  LIMIT 10
`;

const [rows] = await bigquery.query({ query, location: "US" });
rows.forEach(row => console.log(`${row.name}: ${row.count}`));

// Parameterized query
const [results] = await bigquery.query({
  query: "SELECT * FROM `my_dataset.my_table` WHERE age > @minAge LIMIT @limit",
  params: { minAge: 18, limit: 100 },
});

// Insert rows (streaming)
const table = bigquery.dataset("my_dataset").table("my_table");
await table.insert([
  { id: 1, name: "Alice", timestamp: bigquery.timestamp(new Date()) },
  { id: 2, name: "Bob", timestamp: bigquery.timestamp(new Date()) },
]);

// Load data from Cloud Storage
const [job] = await table.load(storage.bucket("my-bucket").file("data.csv"), {
  sourceFormat: "CSV",
  skipLeadingRows: 1,
  autodetect: true,
});
await job.promise();

// Create a dataset
await bigquery.createDataset("new_dataset", { location: "US" });
```

---

### Cloud Pub/Sub API

Messaging service for event-driven architectures and stream processing.

```javascript
// npm install @google-cloud/pubsub
const { PubSub } = require("@google-cloud/pubsub");
const pubsub = new PubSub({ projectId: "your-project-id" });

// Publish a message
const topic = pubsub.topic("my-topic");
const messageId = await topic.publishMessage({
  data: Buffer.from(JSON.stringify({ event: "order_placed", orderId: 123 })),
  attributes: { source: "checkout-service", version: "1.0" },
});
console.log("Published:", messageId);

// Subscribe and receive messages
const subscription = pubsub.subscription("my-subscription");
const messageHandler = message => {
  const data = JSON.parse(message.data.toString());
  console.log("Received:", data);
  message.ack(); // Acknowledge to remove from queue
};
subscription.on("message", messageHandler);
subscription.on("error", err => console.error(err));

// Create topic and subscription
await pubsub.createTopic("new-topic");
await pubsub.topic("new-topic").createSubscription("new-subscription");

// Pull messages (synchronous)
const [messages] = await subscription.pull({ maxMessages: 10 });
messages.forEach(msg => {
  console.log(msg.data.toString());
  msg.ack();
});
```

---

### Cloud Firestore API

A NoSQL document database with real-time sync and offline support.

```javascript
// npm install @google-cloud/firestore
const { Firestore } = require("@google-cloud/firestore");
const db = new Firestore({ projectId: "your-project-id" });

// Add a document
const docRef = db.collection("users").doc("alice");
await docRef.set({
  name: "Alice Johnson",
  age: 30,
  email: "alice@example.com",
  createdAt: Firestore.Timestamp.now(),
});

// Read a document
const doc = await docRef.get();
if (doc.exists) console.log(doc.data());

// Update fields
await docRef.update({ age: 31, "address.city": "New York" });

// Query documents
const snapshot = await db.collection("users")
  .where("age", ">=", 18)
  .orderBy("age", "desc")
  .limit(10)
  .get();
snapshot.forEach(doc => console.log(doc.id, doc.data()));

// Real-time listener (Client SDK)
db.collection("orders").onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    if (change.type === "added") console.log("New order:", change.doc.data());
    if (change.type === "modified") console.log("Updated:", change.doc.data());
    if (change.type === "removed") console.log("Deleted:", change.doc.id);
  });
});

// Batch writes
const batch = db.batch();
batch.set(db.doc("products/p1"), { name: "Widget", price: 9.99 });
batch.update(db.doc("users/alice"), { lastPurchase: new Date() });
batch.delete(db.doc("cart/item-old"));
await batch.commit();

// Transaction
await db.runTransaction(async transaction => {
  const ref = db.doc("inventory/widget");
  const doc = await transaction.get(ref);
  const newCount = doc.data().count - 1;
  transaction.update(ref, { count: newCount });
});
```

---

### Compute Engine API

Manages virtual machine instances on Google Cloud.

```javascript
// npm install @google-cloud/compute
const compute = require("@google-cloud/compute");

// Create a VM instance
const instancesClient = new compute.InstancesClient();
const [operation] = await instancesClient.insert({
  project: "my-project",
  zone: "us-central1-a",
  instanceResource: {
    name: "my-instance",
    machineType: "zones/us-central1-a/machineTypes/e2-medium",
    disks: [{
      boot: true,
      autoDelete: true,
      initializeParams: {
        sourceImage: "projects/debian-cloud/global/images/family/debian-11",
        diskSizeGb: "10",
      },
    }],
    networkInterfaces: [{
      network: "global/networks/default",
      accessConfigs: [{ type: "ONE_TO_ONE_NAT", name: "External NAT" }],
    }],
  },
});
await operation.promise();

// List instances
const aggList = instancesClient.aggregatedListAsync({ project: "my-project" });
for await (const [zone, instancesObject] of aggList) {
  if (instancesObject.instances) {
    instancesObject.instances.forEach(i => console.log(zone, i.name, i.status));
  }
}

// Stop and delete an instance
const zonesClient = new compute.ZoneOperationsClient();
await instancesClient.stop({ project: "my-project", zone: "us-central1-a", instance: "my-instance" });
await instancesClient.delete({ project: "my-project", zone: "us-central1-a", instance: "my-instance" });
```

---

## Firebase APIs

### Firebase Realtime Database

A NoSQL JSON database with real-time synchronization.

```javascript
// npm install firebase
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, push, onValue, remove } from "firebase/database";

const app = initializeApp({ /* your firebase config */ });
const db = getDatabase(app);

// Write data
await set(ref(db, "users/alice"), {
  name: "Alice",
  email: "alice@example.com",
  score: 100,
});

// Read once
const snapshot = await get(ref(db, "users/alice"));
if (snapshot.exists()) console.log(snapshot.val());

// Real-time listener
const unsubscribe = onValue(ref(db, "scores"), snapshot => {
  const data = snapshot.val();
  console.log("Scores updated:", data);
});

// Push to a list (auto-generates key)
const newRef = await push(ref(db, "messages"), {
  text: "Hello!",
  timestamp: Date.now(),
});
console.log("New message key:", newRef.key);

// Delete
await remove(ref(db, "users/alice"));

// Stop listener
unsubscribe();
```

---

### Firebase Authentication

Handles user auth with email/password, phone, and social providers.

```javascript
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
         signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";

const auth = getAuth();

// Email/password sign-up
const userCredential = await createUserWithEmailAndPassword(auth, "user@example.com", "password123");
console.log("Created user:", userCredential.user.uid);

// Sign in
await signInWithEmailAndPassword(auth, "user@example.com", "password123");

// Google sign-in
const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
const token = GoogleAuthProvider.credentialFromResult(result).accessToken;
console.log("Google user:", result.user.displayName);

// Listen to auth state
onAuthStateChanged(auth, user => {
  if (user) {
    console.log("Logged in:", user.email);
  } else {
    console.log("Logged out");
  }
});

// Sign out
await signOut(auth);

// Get ID token for server verification
const idToken = await auth.currentUser.getIdToken();
// Send idToken to server and verify with firebase-admin
```

---

### Firebase Cloud Messaging (FCM)

Sends push notifications to mobile and web clients.

```javascript
// Server-side (Node.js): npm install firebase-admin
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.applicationDefault() });

const message = {
  notification: {
    title: "New message",
    body: "You have a new notification!",
  },
  data: { orderId: "12345", type: "order_update" },
  token: "DEVICE_FCM_TOKEN",
};

const response = await admin.messaging().send(message);
console.log("Sent:", response);

// Send to multiple devices
await admin.messaging().sendEachForMulticast({
  tokens: ["TOKEN_1", "TOKEN_2", "TOKEN_3"],
  notification: { title: "Broadcast", body: "Message to all users" },
});

// Send to a topic
await admin.messaging().send({
  topic: "news",
  notification: { title: "Breaking News", body: "Something happened!" },
});

// Client-side: receive notifications (web)
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const messaging = getMessaging();
const token = await getToken(messaging, { vapidKey: "YOUR_VAPID_KEY" });
console.log("FCM Token:", token);

onMessage(messaging, payload => {
  console.log("Message received:", payload.notification.title);
});
```

---

## Search & Discovery

### Custom Search API

Embeds Google Search into your own website or application.

```javascript
// REST request — no SDK needed
const apiKey = "YOUR_API_KEY";
const cx = "YOUR_SEARCH_ENGINE_ID"; // from Programmable Search Engine
const query = encodeURIComponent("site:developer.mozilla.org JavaScript promises");

const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}&num=5`;

const { items } = await (await fetch(url)).json();
items.forEach(item => {
  console.log(item.title);
  console.log(item.link);
  console.log(item.snippet);
  console.log("---");
});

// Image search
const imgUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=mountain+sunset&searchType=image&num=5`;
const imgResults = await (await fetch(imgUrl)).json();
imgResults.items.forEach(item => console.log(item.link));

// Filter by date range
const filteredUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=AI+news&dateRestrict=d7`; // last 7 days
```

---

### Knowledge Graph API

Searches Google's Knowledge Graph for entity information.

```javascript
const apiKey = "YOUR_API_KEY";
const query = encodeURIComponent("Taylor Swift");
const url = `https://kgsearch.googleapis.com/v1/entities:search?query=${query}&key=${apiKey}&limit=1&indent=True`;

const { itemListElement } = await (await fetch(url)).json();
const entity = itemListElement[0].result;
console.log("Name:", entity.name);
console.log("Description:", entity.description);
console.log("Types:", entity["@type"].join(", "));
if (entity.image) console.log("Image:", entity.image.url);
console.log("Score:", itemListElement[0].resultScore);
```

---

## Communication

### Google Chat API

Sends and manages messages in Google Chat spaces.

```javascript
const chat = google.chat({ version: "v1", auth });

// Send a simple text message to a space
const { data: message } = await chat.spaces.messages.create({
  parent: "spaces/SPACE_ID",
  requestBody: {
    text: "Hello from the Chat API!",
  },
});

// Send a card message with formatted content
await chat.spaces.messages.create({
  parent: "spaces/SPACE_ID",
  requestBody: {
    cardsV2: [{
      cardId: "info-card",
      card: {
        header: {
          title: "Deployment Status",
          subtitle: "Production environment",
          imageUrl: "https://example.com/deploy-icon.png",
        },
        sections: [{
          widgets: [
            { textParagraph: { text: "<b>Status:</b> ✅ Success" } },
            { textParagraph: { text: "<b>Version:</b> v2.1.0" } },
            {
              buttonList: {
                buttons: [{
                  text: "View Logs",
                  onClick: { openLink: { url: "https://console.cloud.google.com" } },
                }],
              },
            },
          ],
        }],
      },
    }],
  },
});

// List spaces the bot is in
const { data: spaces } = await chat.spaces.list();
spaces.spaces.forEach(s => console.log(s.name, s.displayName));
```

---

## Analytics & Advertising

### Google Analytics Data API

Retrieves reports and real-time data from Google Analytics 4.

```javascript
// npm install @google-analytics/data
const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const client = new BetaAnalyticsDataClient();

// Basic report
const [response] = await client.runReport({
  property: "properties/YOUR_GA4_PROPERTY_ID",
  dimensions: [{ name: "city" }, { name: "country" }],
  metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "bounceRate" }],
  dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
  orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  limit: 20,
});

response.rows.forEach(row => {
  const city = row.dimensionValues[0].value;
  const country = row.dimensionValues[1].value;
  const sessions = row.metricValues[0].value;
  console.log(`${city}, ${country}: ${sessions} sessions`);
});

// Real-time data
const [rtResponse] = await client.runRealtimeReport({
  property: "properties/YOUR_GA4_PROPERTY_ID",
  dimensions: [{ name: "unifiedScreenName" }],
  metrics: [{ name: "activeUsers" }],
});
console.log("Active users right now:", rtResponse.rows.length);
```

---

### Google Ads API

Programmatically manages Google Ads campaigns, ad groups, and keywords.

```javascript
// npm install google-ads-api
const { GoogleAdsApi } = require("google-ads-api");

const client = new GoogleAdsApi({
  client_id: "YOUR_CLIENT_ID",
  client_secret: "YOUR_CLIENT_SECRET",
  developer_token: "YOUR_DEVELOPER_TOKEN",
});

const customer = client.Customer({
  customer_id: "YOUR_CUSTOMER_ID",
  refresh_token: "YOUR_REFRESH_TOKEN",
});

// Query campaigns
const campaigns = await customer.query(`
  SELECT
    campaign.id,
    campaign.name,
    campaign.status,
    campaign.bidding_strategy_type,
    metrics.impressions,
    metrics.clicks,
    metrics.cost_micros
  FROM campaign
  WHERE campaign.status = 'ENABLED'
  ORDER BY metrics.impressions DESC
  LIMIT 10
`);

campaigns.forEach(({ campaign, metrics }) => {
  console.log(campaign.name, "—", metrics.clicks, "clicks");
  console.log("Cost: $", (metrics.cost_micros / 1_000_000).toFixed(2));
});

// Create a campaign
const campaignBudget = await customer.campaignBudgets.create([{
  name: "My Budget",
  amount_micros: 5_000_000, // $5/day
  delivery_method: "STANDARD",
}]);

await customer.campaigns.create([{
  name: "Summer Sale",
  status: "PAUSED",
  advertising_channel_type: "SEARCH",
  campaign_budget: campaignBudget[0].resource_name,
  bidding_strategy_type: "TARGET_CPA",
  target_cpa: { target_cpa_micros: 1_000_000 },
}]);
```

---

## Other Useful APIs

### Google Fonts API

Serves web fonts for use in websites.

```html
<!-- In HTML — simplest usage -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet" />

<style>
  body { font-family: 'Inter', sans-serif; }
  h1   { font-family: 'Playfair Display', serif; }
</style>
```

```javascript
// List available fonts via API
const apiKey = "YOUR_API_KEY";
const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`;
const { items: fonts } = await (await fetch(url)).json();
fonts.slice(0, 5).forEach(f => {
  console.log(f.family, f.variants.join(", "), f.category);
});
```

---

### PageSpeed Insights API

Analyzes web page performance using Lighthouse and Core Web Vitals.

```javascript
const apiKey = "YOUR_API_KEY";
const pageUrl = encodeURIComponent("https://www.example.com");
const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${pageUrl}&strategy=mobile&key=${apiKey}`;

const data = await (await fetch(url)).json();
const { categories, audits } = data.lighthouseResult;

console.log("Performance score:", categories.performance.score * 100);
console.log("Accessibility score:", categories.accessibility.score * 100);
console.log("SEO score:", categories.seo.score * 100);

const cwv = data.loadingExperience.metrics;
console.log("LCP:", cwv.LARGEST_CONTENTFUL_PAINT_MS?.category);
console.log("FID:", cwv.FIRST_INPUT_DELAY_MS?.category);
console.log("CLS:", cwv.CUMULATIVE_LAYOUT_SHIFT_SCORE?.category);

// Individual audit
console.log("First Contentful Paint:", audits["first-contentful-paint"].displayValue);
console.log("Speed Index:", audits["speed-index"].displayValue);
```

---

### Safe Browsing API

Checks URLs against Google's lists of unsafe websites.

```javascript
const apiKey = "YOUR_API_KEY";
const url = "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + apiKey;

const response = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    client: { clientId: "my-app", clientVersion: "1.0" },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [
        { url: "https://example.com" },
        { url: "https://suspicious-site.example" },
      ],
    },
  }),
});

const data = await response.json();
if (data.matches) {
  data.matches.forEach(match => {
    console.log(`UNSAFE: ${match.threat.url} — ${match.threatType}`);
  });
} else {
  console.log("No threats detected.");
}
```

---

### Google Indexing API

Notifies Google to crawl or remove URLs from its search index.

```javascript
// Requires service account with Google Search Console property access
const { google } = require("googleapis");
const auth = new google.auth.GoogleAuth({
  keyFilename: "service-account-key.json",
  scopes: ["https://www.googleapis.com/auth/indexing"],
});

const indexing = google.indexing({ version: "v3", auth });

// Request indexing of a URL
await indexing.urlNotifications.publish({
  requestBody: {
    url: "https://www.example.com/new-page",
    type: "URL_UPDATED",
  },
});

// Request removal of a URL
await indexing.urlNotifications.publish({
  requestBody: {
    url: "https://www.example.com/deleted-page",
    type: "URL_DELETED",
  },
});

// Check notification status
const { data: status } = await indexing.urlNotifications.getMetadata({
  url: "https://www.example.com/new-page",
});
console.log("Latest update:", status.latestUpdate.notifyTime);
```

---

### reCAPTCHA Enterprise

Protects your site from bots and abuse.

```html
<!-- Include reCAPTCHA v3 (invisible) -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>

<script>
  async function onFormSubmit() {
    const token = await grecaptcha.execute("YOUR_SITE_KEY", { action: "submit" });
    // Send token to your server for verification
    const response = await fetch("/verify-captcha", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }
</script>
```

```javascript
// Server-side verification (Node.js)
const verifyRecaptcha = async (token) => {
  const url = "https://recaptchaenterprise.googleapis.com/v1/projects/MY_PROJECT/assessments";
  const response = await fetch(url + "?key=" + API_KEY, {
    method: "POST",
    body: JSON.stringify({
      event: {
        token,
        siteKey: "YOUR_SITE_KEY",
        expectedAction: "submit",
      },
    }),
  });

  const { riskAnalysis, tokenProperties } = await response.json();
  console.log("Score:", riskAnalysis.score); // 0.0 (bot) to 1.0 (human)
  console.log("Valid:", tokenProperties.valid);
  console.log("Action:", tokenProperties.action);

  // Block if score is too low
  return riskAnalysis.score >= 0.5;
};
```

---

## Authentication Quick Reference

Most Google APIs require one of these authentication methods:

| Method | Use case | How to get |
|---|---|---|
| **API Key** | Public data (Maps, YouTube search) | Google Cloud Console → Credentials |
| **OAuth 2.0** | User data (Gmail, Drive, Calendar) | OAuth consent screen + credentials |
| **Service Account** | Server-to-server (Cloud Storage, BigQuery) | IAM & Admin → Service Accounts |
| **Application Default Credentials** | Cloud-hosted apps (Compute, GKE) | Automatic when running on GCP |

```bash
# Install the Google Cloud CLI
curl https://sdk.cloud.google.com | bash

# Authenticate for local development
gcloud auth application-default login

# Enable an API
gcloud services enable gmail.googleapis.com

# Create an API key
gcloud alpha services api-keys create --display-name="My API Key"

# Create a service account
gcloud iam service-accounts create my-service-account
gcloud iam service-accounts keys create key.json --iam-account=my-service-account@PROJECT_ID.iam.gserviceaccount.com
```

---

## Resources

- [Google APIs Explorer](https://developers.google.com/apis-explorer) — interactive API testing
- [Google Cloud Console](https://console.cloud.google.com) — manage projects, credentials, and billing
- [Google Developers](https://developers.google.com) — official documentation for all APIs
- [Google AI Studio](https://aistudio.google.com) — get a Gemini API key instantly
- [Firebase Console](https://console.firebase.google.com) — Firebase project management
- [googleapis Node.js client](https://github.com/googleapis/google-api-nodejs-client) — official Node.js library
- [Google API Discovery Service](https://www.googleapis.com/discovery/v1/apis) — machine-readable list of all public APIs
