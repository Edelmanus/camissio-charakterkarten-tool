# CAMISSIO Charakterkarten-Tool

Web-App für alle CAMISSIO-Mitarbeiter zum Erstellen persönlicher Charakterkarten für Camp-Teilnehmer. Evangelistisches Camp-Ministerium der Deutschen Zeltmission.

## Projektstruktur

```
Charakterkarten Tool/
├── charakterkarten-app/      ← React + Vite App (hier wird gearbeitet)
│   ├── public/
│   │   ├── assets/           ← Logos (PNG)
│   │   │   ├── camissio-logo.png         ← Haupt-CAMISSIO-Logo (für QUIETSCHFIDEL)
│   │   │   ├── camp2go-logo.png          ← CAMP2GO Logo orange
│   │   │   ├── youth-camp-logo-lila.png  ← YOUTH CAMP Logo lila
│   │   │   ├── herzanker-dunkelblau.png  ← Symbol für Header (mobile)
│   │   │   └── ...weitere Logos
│   │   └── data/
│   │       ├── eigenschaften-youth-camp.json   ← 70+ Eigenschaften YOUTH CAMP
│   │       ├── eigenschaften-camp2go.json       ← Eigenschaften CAMP2GO (vorerst identisch)
│   │       └── eigenschaften-quietschfidel.json ← Eigenschaften QUIETSCHFIDEL (vorerst identisch)
│   └── src/
│       ├── config/
│       │   └── camps.js      ← Zentrale Camp-Konfiguration (Farben, Logos, Storage-Keys)
│       ├── components/       ← Alle UI-Komponenten
│       ├── utils/
│       │   ├── storage.js    ← Camp-aware LocalStorage-Logik
│       │   └── validierung.js ← Texthilfen & Live-Warnungen
│       ├── App.jsx           ← Root-Komponente, Camp-Flow, State-Management
│       └── index.css         ← Tailwind + CAMISSIO CSS-Variablen + Camp-Akzent-Utilities
├── referenzen/               ← INTERN, nicht im Git (gitignore)
│   ├── Charakterkarten YOUTH CAMP.docx
│   ├── CAMISSIO Logos/       ← Alle Originallogos
│   └── 01_CAMISSIO_Corporate Design Manual.pdf
└── CLAUDE_CODE_PROMPT.md     ← Ursprünglicher Projektauftrag
```

## Entwicklung starten

```bash
cd charakterkarten-app
npm install      # nur beim ersten Mal
npm run dev      # startet auf http://localhost:5173
npm run build    # Produktions-Build → dist/
```

## Tech Stack

- **React 18 + Vite 5** — Framework & Build
- **Tailwind CSS v3** — Styling (Custom Theme mit CAMISSIO-Farben)
- **Recharts** — Radar-Diagramm
- **react-to-print** — PDF/Druckexport
- **LocalStorage** — Persistenz, kein Backend

## CAMISSIO Corporate Design

```css
--camissio-dunkelblau: #1c4554   /* Primärfarbe, Text */
--camissio-petrol:     #007d99   /* Links, Akzente */
--camissio-lila:       #a1a5dd   /* YOUTH CAMP Farbe */
--camissio-orange:     #fa5c33   /* CAMP2GO Farbe */
--camissio-greige:     #f0f2ed   /* App-Hintergrund */
--camissio-summer-gruen: #00ab67 /* QUIETSCHFIDEL Farbe */
```

- **Headlines:** Bebas Neue (Google Fonts)
- **Fließtext:** Nunito Sans (Google Fonts)

## Camp-Module

Die App unterstützt drei Camp-Module, konfiguriert in `src/config/camps.js`:

| Camp | Farbe | Zielgruppe | Storage-Key |
|---|---|---|---|
| **YOUTH CAMP** | Lila `#a1a5dd` | Teens 12–17 J. | `camissio_charakterkarten_youth-camp` |
| **CAMP2GO** | Orange `#fa5c33` | Kinder 6–12 J. | `camissio_charakterkarten_camp2go` |
| **QUIETSCHFIDEL** | Grün `#00ab67` | Kinder/Jugend mit Beeinträchtigungen | `camissio_charakterkarten_quietschfidel` |

Das gewählte Camp wird unter `camissio_aktives_camp` gespeichert.

### camps.js — Struktur eines Camp-Eintrags

```js
{
  id: 'youth-camp',
  name: 'YOUTH CAMP',
  vollname: 'CAMISSIO YOUTH CAMP',
  zielgruppe: '...',
  beschreibung: '...',
  farbe: '#a1a5dd',       // Akzentfarbe (Buttons, Titel)
  farbeHell: '#eaebf8',   // Heller Hintergrund (Camp-Karte in Auswahl)
  farbeText: '#4a4f99',   // Textfarbe auf hellem Hintergrund
  logo: '/assets/youth-camp-logo-lila.png',
  eigenschaftenFile: '/data/eigenschaften-youth-camp.json',
  storageKey: 'camissio_charakterkarten_youth-camp',
}
```

**Neue Camps hinzufügen:** Eintrag in `CAMPS`-Array in `camps.js` ergänzen + JSON-Datei in `public/data/` anlegen.

## User Flow

1. **CampAuswahl** — Beim ersten Öffnen oder nach „Camp wechseln": 3 Camp-Karten auf Greige-Hintergrund
2. **Onboarding** — Beim ersten Besuch je Camp: Erklärung + LOSLEGEN (campspezifisch eingefärbt)
3. **Haupt-App** — Header + Sidebar (Gruppenliste) + KindEditor; letztes Camp wird gemerkt

## Wichtige Komponenten

| Datei | Aufgabe |
|---|---|
| `App.jsx` | Camp-Flow (CampAuswahl → Onboarding → App), State, Theming |
| `CampAuswahl.jsx` | Camp-Picker-Bildschirm, zeigt alle 3 Module |
| `Header.jsx` | Weißer Pill-Header (CAMISSIO-Website-Stil), Camp-Name, Wechsel-Button |
| `Sidebar.jsx` | Gruppen-Übersicht als weiße Card, Kind anlegen/löschen |
| `KindEditor.jsx` | Haupt-Editor: Slider, Vorschläge, Texteditor, Export |
| `RadarChart.jsx` | Recharts-Radardiagramm der 7 Wesenszüge |
| `TextEditor.jsx` | Textarea + Live-Validierung (Regel 4/7/9) + Formulierungen |
| `EigenschaftDetail.jsx` | Modal: Beschreibung, Bibelvers, Inspirationstext |
| `AnleitungModal.jsx` | Die 15 Regeln aus dem Manual (wortgetreu) |
| `KarteDruck.jsx` | Druckvorlage A5 im CAMISSIO-Design (forwardRef) |
| `Onboarding.jsx` | Erster-Start-Bildschirm je Camp, campspezifisch eingefärbt |
| `LeereAnsicht.jsx` | Platzhalter wenn kein Kind aktiv |

## Dynamisches Theming (CSS-Variablen)

Die Akzentfarbe wechselt automatisch mit dem Camp. In `App.jsx` wird gesetzt:

```js
document.documentElement.style.setProperty('--camp-akzent', camp.farbe);
document.documentElement.style.setProperty('--camp-akzent-hell', camp.farbeHell);
```

In `index.css` stehen die Utility-Klassen (mit `!important`, da Tailwind CSS-Variablen nicht nativ als HEX unterstützt):

```css
.bg-camp-akzent      { background-color: var(--camp-akzent) !important; }
.text-camp-akzent    { color: var(--camp-akzent) !important; }
.border-camp-akzent  { border-color: var(--camp-akzent) !important; }
.bg-camp-akzent-hell { background-color: var(--camp-akzent-hell) !important; }
```

Komponenten, die `bg-camp-akzent` verwenden: `Sidebar.jsx`, `LeereAnsicht.jsx`.

## UI-Layout (Card-Stil)

Alle drei Hauptbereiche (Header, Sidebar, Main) sind weiße Cards auf Greige-Hintergrund:

```
┌─────────────────────────────────────────┐  ← Header: bg-white rounded-2xl shadow-sm (pill)
├──────────────┬──────────────────────────┤     Abstand: px-3 pt-3 pb-0
│ Sidebar      │ Main                     │  ← beide: bg-white rounded-2xl shadow-sm
│ (w-64 Card)  │ (flex-1 Card)            │     Abstand: p-3 gap-3
└──────────────┴──────────────────────────┘
```

## Datenstruktur (LocalStorage)

```js
// Key: 'camissio_aktives_camp'  → z.B. "youth-camp"

// Key: 'camissio_charakterkarten_youth-camp' (je Camp eigener Key)
{
  onboardingGesehen: true,
  aktivesKindId: "uuid",
  kinder: [{
    id: "uuid",
    name: "Lukas Müller",
    geschlecht: "männlich" | "weiblich" | "keine",
    scores: {
      beziehungsstark: 1-5,
      anpacker: 1-5,
      unaufhaltsam: 1-5,
      verwurzelt: 1-5,
      gewissenhaft: 1-5,
      vorbild: 1-5,
      anbeter: 1-5
    },
    gewaehltEigenschaften: [{ name, beschreibung, bibelvers, inspirationstext, katId, katFarbe }],
    bibelvers: "Jeremia 29,11",
    text: "Persönlicher Fließtext...",
    fertig: false
  }]
}
```

## Eigenschaften-JSON — Struktur

10 Kategorien, 70+ Eigenschaften. Die ersten 7 haben Scoring-Slider, alle sind durchsuchbar.

```json
{
  "kategorien": [{
    "id": "beziehungsstark",
    "name": "Der Beziehungsstarke",
    "farbe": "#55c1c4",
    "eigenschaften": [{
      "name": "Freundlich",
      "beschreibung": "...",
      "bibelvers": "Micha 6,8",
      "inspirationstext": "[Name] ist..."
    }]
  }]
}
```

**Offener Punkt:** Camp-spezifische Wesenskategorien und Eigenschaften für CAMP2GO und QUIETSCHFIDEL ausformulieren (aktuell identisch mit YOUTH CAMP).

## Validierungsregeln im TextEditor

- **Regel 4** — Adjektiv der gewählten Eigenschaft im Text → gelbe Warnung
- **Regel 7** — Vergangenheitsformen (war, hatte, ging…) → blaue Warnung
- **Regel 9** — „nicht" im Text → orange Warnung
- **Wortzähler** — Ziel: 60–100 Wörter (grau → grün → orange)

## GitHub

```
https://github.com/Edelmanus/camissio-charakterkarten-tool
Branch: main
```
