# 漢字道場 — Kanji Dojo

> **A complete offline Kanji learning tool for English speakers**

---

## What Is This?

Kanji Dojo is a single-folder, fully offline web application that teaches you to **read and write Japanese Kanji**. No internet connection, npm, APIs, or server required. Open `index.html` in any modern browser and start learning immediately.

---

## Features

| Section | What you get |
|---|---|
| **漢字 Kanji Library** | 100+ kanji, searchable by character, meaning, reading, or JLPT level |
| **語 Vocabulary** | 35+ compound words & vocabulary items with example sentences |
| **句 Phrases** | 35+ daily-use phrases with rōmaji, meaning, and usage notes |
| **文 Sentences** | 35+ natural Japanese sentences — reveal readings and translations when ready |
| **✏️ Quiz** | Multiple-choice quiz on kanji meanings OR readings, with session score tracking |
| **🖊 Writing Practice** | Freehand drawing canvas with grid overlay — practice stroke-by-stroke |
| **📊 Dashboard** | Session stats, mastery tracking, recent activity log, JLPT breakdown |

---

## Files

```
kanji-dojo/
├── index.html      — Main app shell, layout, and CSS
├── app.js          — All UI logic, quiz engine, canvas drawing
├── kanji-data.js   — Kanji database, vocabulary, phrases, sentences
└── README.md       — This file
```

---

## How to Use

1. Open `index.html` in Chrome, Firefox, Edge, or Safari.
2. Navigate using the buttons in the top bar.
3. **No installation. No server. No internet required.**

> **Tip:** On mobile, save to your home screen for an app-like experience.

---

## Kanji Covered

The app covers the kanji most commonly encountered in **daily Japanese life**, organised by JLPT level:

- **JLPT N5** — Beginner: numbers, days, basic verbs, family, nature, directions
- **JLPT N4** — Elementary: common adjectives, body parts, weather, time expressions
- **JLPT N3** — Pre-intermediate: selected high-frequency characters

### Categories

Numbers · Time · People · Body · Nature · Directions · Home & Buildings · Food & Drink · Verbs · Adjectives · School & Study · Transport · Daily Life

---

## Study Approach

### For Beginners
1. Start with the **Kanji Library** — browse by category (e.g. "Numbers" or "Time")
2. Click any card to see its readings, related vocabulary, and example sentences
3. Move to **Vocabulary** to see kanji in context
4. Read the **Phrases** — these are the expressions you'll use every day
5. Take the **Quiz** on Kanji mode to test meanings first, then readings

### For Intermediate Learners
1. Use the **Sentences** panel — try to read without revealing the answer
2. Take the **Vocabulary quiz** for more challenge
3. Use **Writing Practice** with the grid off for a harder exercise
4. Watch the **Mastered** count on the dashboard (3 correct quiz answers = mastered)

### Tips for Remembering Kanji
- **Associate meaning before reading** — learn what 山 means (mountain) before how to say it
- **Look for patterns** — 日 (sun/day) appears in 明 (bright), 時 (time), 明日 (tomorrow)
- **Use the writing canvas** — muscle memory reinforces visual memory
- **Context is king** — example sentences are more memorable than isolated definitions

---

## Understanding Japanese Writing

Japanese uses three scripts together:

| Script | Purpose | Example |
|---|---|---|
| **Kanji** 漢字 | Core content words (nouns, verb stems, adjectives) | 山、食べ |
| **Hiragana** ひらがな | Grammatical elements, native words | です、の、が |
| **Katakana** カタカナ | Foreign loanwords, emphasis | コーヒー、テレビ |

Kanji Dojo focuses on **Kanji**, since that is the biggest reading challenge for English speakers.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Enter` | Next quiz question (when answer is shown) |
| `Escape` | Close any modal |
| `←` `→` | Previous / Next kanji (Writing panel) |
| `Delete` | Clear the drawing canvas |

---

## Persistence

Your quiz score, mastered kanji, and recent activity are automatically saved in your browser's `localStorage`. They persist between sessions in the **same browser on the same device**.

---

## Reading the Kanji Cards

```
┌─────────────────┐
│  ★ Known        │  ← Appears after 3+ correct quiz answers
│                 │
│       山        │  ← The kanji character
│                 │
│  mountain       │  ← English meaning
│  さん · やま    │  ← On-reading · Kun-reading
│                 │
│  [N5] [Nature]  │  ← JLPT level and category tags
└─────────────────┘
```

### Readings Explained

Japanese kanji have two types of readings:
- **On-yomi** (音読み) — Chinese-derived pronunciation, often used in compound words. Written in katakana in dictionaries (e.g. サン for 山).
- **Kun-yomi** (訓読み) — Native Japanese pronunciation, used for standalone words. Written in hiragana (e.g. やま).

In this app, readings are shown in hiragana for both types for accessibility.

---

## Phrase Notes

The **Phrases** panel includes a hidden "Usage note" for each phrase. Click any phrase card to expand it and read the contextual explanation.

---

## Sentence Practice

In the **Sentences** panel:
- The Japanese sentence is always shown
- Click **Reading** to reveal the hiragana reading (furigana)
- Click **Translation** to reveal the English meaning
- Use **Reveal All** or **Hide All** buttons for batch control

This mimics real reading practice — you should try to understand before peeking.

---

## Writing Practice Tips

- The **grid overlay** divides the canvas into four quadrants — use it to check proportions
- Most kanji have a general stroke order rule: **top to bottom, left to right**
- The canvas supports **touch input** on tablets and phones
- Use **Thin / Thick** buttons to adjust brush weight
- Press **Clear** (or `Delete` key) to start over

---

## Credits & Data Sources

All kanji data, vocabulary, example sentences, and phrases are compiled from:
- JLPT N5/N4/N3 official syllabi
- Standard Japanese language education resources
- Common everyday Japanese usage patterns

This tool was built as a standalone educational aid with no external dependencies beyond optional Google Fonts (loaded for aesthetics — the app works without them too).

---

## Extending the App

To add more kanji, open `kanji-data.js` and add entries to the `KANJI_DB` array following the existing format:

```javascript
{ 
  kanji: "空",           // The character
  readings: ["くう","そら"],  // [on-yomi, kun-yomi]
  meaning: "sky / empty",  // English meaning
  strokes: 8,             // Stroke count (0 = compound word)
  level: "N5",            // JLPT level
  category: "Nature"      // Display category
}
```

Similarly, add vocabulary to `VOCABULARY`, phrases to `PHRASES`, and sentences to `SENTENCES`.

---

*Happy studying! 勉強頑張って！*
