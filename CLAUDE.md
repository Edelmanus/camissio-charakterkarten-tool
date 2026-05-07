# CAMISSIO Charakterkarten-Tool

Web-App für CAMISSIO-Gruppenleiter zum Erstellen persönlicher Charakterkarten für Camp-Teilnehmer. Evangelistisches Camp-Ministerium der Deutschen Zeltmission.

## Projektstruktur

```
Charakterkarten Tool/
├── charakterkarten-app/          ← React + Vite Frontend
│   ├── public/
│   │   ├── assets/               ← CAMISSIO-Logos (PNG)
│   │   └── data/
│   │       ├── eigenschaften-youth-camp.json
│   │       ├── eigenschaften-camp2go.json
│   │       └── eigenschaften-quietschfidel.json
│   └── src/
│       ├── config/
│       │   └── camps.js          ← Camp-Konfiguration (Farben, Logos, IDs)
│       ├── components/           ← Alle UI-Komponenten
│       ├── utils/
│       │   ├── api.js            ← API-Client (fetch-Wrapper, Session)
│       │   ├── storage.js        ← Session-Hilfsfunktionen (sessionStorage)
│       │   └── validierung.js    ← Texthilfen & Live-Warnungen
│       ├── App.jsx               ← Root: Session-Flow, API-State
│       └── index.css             ← Tailwind + CAMISSIO CSS-Variablen
├── charakterkarten-backend/      ← Node.js + Express + node:sqlite Backend
│   ├── server.js                 ← Express-Server (Port 3001)
│   ├── db/
│   │   └── database.js           ← DB-Init, Schema, Camp-Seed (50 Standorte)
│   ├── routes/
│   │   ├── camps.js
│   │   ├── kinder.js
│   │   └── korrektur.js
│   └── package.json
└── referenzen/                   ← INTERN, nicht im Git
```

## Entwicklung starten

```bash
# Terminal 1: Backend (Node ≥ 22.5 erforderlich für node:sqlite)
cd charakterkarten-backend
npm install
node server.js          # Port 3001

# Terminal 2: Frontend
cd charakterkarten-app
npm install
npm run dev             # Port 5173 (proxyt /api/* → :3001)
```

## Tech Stack

- **React 18 + Vite** — Framework & Build
- **Tailwind CSS v3** — Styling (Custom Theme mit CAMISSIO-Farben)
- **Recharts** — Radar-Diagramm
- **react-to-print** — PDF/Druckexport
- **Node.js + Express** — Backend-API
- **node:sqlite** — SQLite (eingebaut in Node ≥ 22.5, kein nativer Addon)
- **sessionStorage** — Aktive Session (Camp + Gruppe)

## CAMISSIO Corporate Design

```css
--camissio-dunkelblau: #1c4554   /* Primärfarbe, Text */
--camissio-petrol:     #007d99   /* Links, Akzente */
--camissio-lila:       #a1a5dd   /* YOUTH CAMP Farbe, Buttons */
--camissio-orange:     #fa5c33   /* CAMP2GO Farbe */
--camissio-greige:     #f0f2ed   /* Hintergrund */
--camissio-summer-gruen: #00ab67 /* QUIETSCHFIDEL Farbe */
```

- **Headlines:** Bebas Neue (Google Fonts)
- **Fließtext:** Nunito Sans (Google Fonts)
- **Logos:** `public/assets/`

## Wichtige Komponenten

| Datei | Aufgabe |
|---|---|
| `App.jsx` | Session-Flow (CampAuswahl → GruppenApp / KorrekturPortal), API-State |
| `CampAuswahl.jsx` | 3-Schritt-Login: Camp-Typ → Standort → Gruppe + Korrektur-Portal-Button |
| `KorrekturPortal.jsx` | Passwortgeschützte Korrektur-Ansicht (alle fertigen Karten) |
| `KorrigiertAnsicht.jsx` | Read-only Ansicht korrigierter Karten beim Gruppenleiter (inkl. Markup) |
| `MarkupEditor.jsx` | ContentEditable-Editor mit Toolbar (Markieren/Durchstreichen) |
| `KindEditor.jsx` | Haupt-Editor: Slider, Vorschläge, Texteditor, Export. Bei `korrigiert=true` → KorrigiertAnsicht |
| `Sidebar.jsx` | 3 Sektionen: Entwurf / Fertig / Korrigiert |
| `Header.jsx` | Pill-Header: Camp-Name + Standort + Gruppe |
| `RadarChart.jsx` | Recharts-Radardiagramm der 7 Wesenszüge |
| `TextEditor.jsx` | Textarea + Live-Validierung (Regel 4/7/9) + Formulierungen |
| `EigenschaftDetail.jsx` | Modal: Beschreibung, Bibelvers, Inspirationstext |
| `AnleitungModal.jsx` | Die 15 Regeln aus dem Manual (wortgetreu) |
| `KarteDruck.jsx` | Druckvorlage A5 im CAMISSIO-Design (forwardRef) |

## Camp-Konfiguration (`config/camps.js`)

Drei Camp-Module mit je eigenem Styling:

| Camp | ID | Farbe | Zielgruppe |
|---|---|---|---|
| YOUTH CAMP | `youth-camp` | Lila `#a1a5dd` | Teens 12–17 J. |
| CAMP2GO | `camp2go` | Orange `#fa5c33` | Kinder 6–12 J. |
| QUIETSCHFIDEL | `quietschfidel` | Grün `#00ab67` | Kinder/Jugend mit Beeinträchtigungen |

Das dynamische Theming setzt CSS-Variablen in `App.jsx` (`--camp-akzent`, `--camp-akzent-hell`, `--camp-akzent-text`).

## Datenbank-Schema (SQLite)

```sql
camps (id, typ, standort, code)
-- 46× CAMP2GO (alle Standorte), 2× YOUTH CAMP (YC1/YC2), 2× QUIETSCHFIDEL (Q1/Q2)

kinder (
  id TEXT,              -- UUID
  camp_id INTEGER,      -- FK → camps.id
  gruppe TEXT,          -- 'J1'..'J10' / 'M1'..'M10'
  name TEXT,
  geschlecht TEXT,      -- 'männlich' | 'weiblich' | 'keine'
  scores TEXT,          -- JSON: { beziehungsstark:1-5, anpacker:1-5, ... }
  gewaehlte_eigenschaften TEXT,  -- JSON: [{ name, beschreibung, bibelvers, katFarbe }]
  bibelvers TEXT,
  text TEXT,            -- Fließtext des Gruppenleiters
  text_markup TEXT,     -- HTML mit Korrektur-Markierungen (highlights, strikethrough)
  fertig INTEGER,       -- 0/1
  korrigiert INTEGER,   -- 0/1
  korrektur_notiz TEXT,
  created_at TEXT,
  updated_at TEXT
)
```

## Session-Flow

```
Startseite (CampAuswahl)
  ├── Gruppenleiter: Typ → Standort → Gruppe → sessionStorage
  │     └── GruppenApp: Kinder aus API laden, bearbeiten, fertig markieren
  │           └── Korrigierte Karte: KorrigiertAnsicht (read-only, Markup sichtbar)
  └── Korrektur-Team: Passwort eingeben
        └── KorrekturPortal: alle fertigen Karten, Markup-Editor, Notiz, korrigiert markieren
```

## API-Routen

| Methode | Pfad | Beschreibung |
|---|---|---|
| `GET` | `/api/camps?typ=...` | Camps nach Typ |
| `GET/POST` | `/api/kinder` | Kinder einer Gruppe |
| `PUT` | `/api/kinder/:id` | Kind aktualisieren (scores, text, eigenschaften…) |
| `PUT` | `/api/kinder/:id/fertig` | Fertig-Status setzen (setzt korrigiert zurück) |
| `DELETE` | `/api/kinder/:id` | Kind löschen |
| `POST` | `/api/korrektur/login` | Passwort prüfen |
| `GET` | `/api/korrektur/kinder` | Alle fertigen Karten (Header: `x-korrektur-password`) |
| `PUT` | `/api/korrektur/kinder/:id` | Markup + Notiz + korrigiert speichern |

## Validierungsregeln im TextEditor

- **Regel 4** — Adjektiv der gewählten Eigenschaft im Text → gelbe Warnung
- **Regel 7** — Vergangenheitsformen (war, hatte, ging…) → blaue Warnung
- **Regel 9** — „nicht" im Text → orange Warnung
- **Wortzähler** — Ziel: 60–100 Wörter (grau → grün → orange)

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

## GitHub

```
https://github.com/Edelmanus/camissio-charakterkarten-tool
Branch: main
```
