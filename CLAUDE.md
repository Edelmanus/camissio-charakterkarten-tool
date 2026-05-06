# CAMISSIO Charakterkarten-Tool

Web-App für CAMISSIO YOUTH CAMP Mitarbeiter zum Erstellen persönlicher Charakterkarten für Camp-Teilnehmer. Evangelistisches Camp-Ministerium der Deutschen Zeltmission.

## Projektstruktur

```
Charakterkarten Tool/
├── charakterkarten-app/      ← React + Vite App (hier wird gearbeitet)
│   ├── public/
│   │   ├── assets/           ← CAMISSIO-Logos (PNG)
│   │   └── data/
│   │       └── eigenschaften.json  ← Alle 70+ Charaktereigenschaften
│   └── src/
│       ├── components/       ← Alle UI-Komponenten
│       ├── utils/
│       │   ├── storage.js    ← LocalStorage-Logik
│       │   └── validierung.js ← Texthilfen & Live-Warnungen
│       ├── App.jsx           ← Root-Komponente, State-Management
│       └── index.css         ← Tailwind + CAMISSIO CSS-Variablen
├── referenzen/               ← INTERN, nicht im Git (gitignore)
│   ├── Charakterkarten YOUTH CAMP.docx
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
--camissio-lila:       #a1a5dd   /* YOUTH CAMP Farbe, Buttons */
--camissio-orange:     #fa5c33   /* Highlights */
--camissio-greige:     #f0f2ed   /* Hintergrund */
```

- **Headlines:** Bebas Neue (Google Fonts)
- **Fließtext:** Nunito Sans (Google Fonts)
- **Logos:** `public/assets/` — Herzanker-Lila + Youth Camp Logo

## Wichtige Komponenten

| Datei | Aufgabe |
|---|---|
| `App.jsx` | State (Kinder, aktives Kind), LocalStorage-Sync |
| `KindEditor.jsx` | Haupt-Editor: Slider, Vorschläge, Texteditor, Export |
| `Sidebar.jsx` | Gruppen-Übersicht, Kind anlegen/löschen |
| `RadarChart.jsx` | Recharts-Radardiagramm der 7 Wesenszüge |
| `TextEditor.jsx` | Textarea + Live-Validierung (Regel 4/7/9) + Formulierungen |
| `EigenschaftDetail.jsx` | Modal: Beschreibung, Bibelvers, Inspirationstext |
| `AnleitungModal.jsx` | Die 15 Regeln aus dem Manual (wortgetreu) |
| `KarteDruck.jsx` | Druckvorlage A5 im CAMISSIO-Design (forwardRef) |

## Datenstruktur (LocalStorage)

```js
// Key: 'camissio_charakterkarten'
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

## eigenschaften.json — Struktur

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
