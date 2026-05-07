# CAMISSIO Charakterkarten-Tool

Web-App für CAMISSIO-Gruppenleiter zum Erstellen persönlicher Charakterkarten für Camp-Teilnehmer — inkl. Backend, Korrektur-Portal und Gruppen-Workflow.

## Was ist eine Charakterkarte?

Eine Charakterkarte ist eine persönliche Ermutigung für jedes Kind in der Gruppe. Gruppenleiter wählen zwei positive Charaktereigenschaften aus und schreiben einen kurzen, herzlichen Text — eine Mitgabe für nach dem Camp.

## Features

### Gruppenleiter
- **Camp-Auswahl** — 3-Schritt-Flow: Camp-Typ (YOUTH CAMP / CAMP2GO / QUIETSCHFIDEL) → Standort → Gruppe (J1–J10 / M1–M10)
- **7 Wesenszug-Kategorien** mit Schiebereglern (1–5) und Live-Radardiagramm
- **Eigenschafts-Vorschläge** basierend auf höchsten Werten + alle 70+ Eigenschaften durchsuchbar
- **Live-Textvalidierung**: Adjektiv-Warnung (Regel 4), Vergangenheitsform (Regel 7), Nicht-Aussagen (Regel 9)
- **Wortzähler** mit Soll-Bereich-Feedback (60–100 Wörter)
- **Sidebar** mit 3 Sektionen: Entwurf / Fertig / Korrigiert
- **Als fertig markieren** — sendet Karte ins Korrektur-Portal
- **Korrigierte Karten** werden read-only angezeigt (inkl. Markup-Markierungen vom Korrektur-Team)
- **PDF/Druckexport** im CAMISSIO-Design (A5)
- **Anleitung-Modal** mit allen 15 Regeln

### Korrektur-Portal
- Passwortgeschützter Zugang (nur von der Startseite)
- Übersicht aller fertigen Karten aller Camps und Gruppen
- **Markup-Editor** mit Toolbar: Text gelb/grün/rot markieren, durchstreichen, Formatierung entfernen
- Korrektur-Notiz für Gruppenleiter hinterlegen
- Karte als korrigiert markieren (erscheint dann beim Gruppenleiter)

### Backend
- REST-API mit Node.js + Express + SQLite (`node:sqlite`)
- 50 Camp-Standorte vorgespeichert (46× CAMP2GO, 2× YOUTH CAMP, 2× QUIETSCHFIDEL)
- Alle Charakterkarten mit Status (Entwurf / Fertig / Korrigiert) in der Datenbank

## Setup

### Voraussetzungen

- Node.js ≥ 22.5 (für `node:sqlite`)
- npm ≥ 9

### Backend starten

```bash
cd charakterkarten-backend
npm install
node server.js          # läuft auf http://localhost:3001
# oder für Entwicklung:
node --watch server.js
```

### Frontend starten

```bash
cd charakterkarten-app
npm install
npm run dev             # läuft auf http://localhost:5173
```

Das Frontend proxyt `/api/*` automatisch ans Backend (konfiguriert in `vite.config.js`).

### Produktion Build

```bash
cd charakterkarten-app
npm run build
# → dist/ enthält die statischen Dateien
```

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
│       │   └── camps.js          ← Camp-Konfiguration (Farben, Logos)
│       ├── components/
│       │   ├── CampAuswahl.jsx          ← 3-Schritt-Login (Typ→Standort→Gruppe)
│       │   ├── KorrekturPortal.jsx      ← Passwortgeschütztes Korrektur-Portal
│       │   ├── KorrigiertAnsicht.jsx    ← Read-only Ansicht korrigierter Karten
│       │   ├── MarkupEditor.jsx         ← Rich-Text-Editor (Markieren/Durchstreichen)
│       │   ├── KindEditor.jsx           ← Haupt-Editor (Slider, Eigenschaften, Text)
│       │   ├── Sidebar.jsx              ← 3 Sektionen: Entwurf/Fertig/Korrigiert
│       │   ├── Header.jsx               ← Pill-Header mit Camp + Gruppe
│       │   ├── RadarChart.jsx           ← Recharts Radardiagramm
│       │   ├── TextEditor.jsx           ← Textarea + Live-Validierung
│       │   ├── KarteDruck.jsx           ← Druckvorlage A5
│       │   ├── EigenschaftDetail.jsx    ← Detail-Modal
│       │   ├── AnleitungModal.jsx       ← 15 Regeln
│       │   ├── Onboarding.jsx
│       │   └── LeereAnsicht.jsx
│       ├── utils/
│       │   ├── api.js            ← API-Client (fetch-Wrapper, Session-Handling)
│       │   ├── storage.js        ← Session-Hilfsfunktionen
│       │   └── validierung.js    ← Texthilfen & Warnungen
│       ├── App.jsx
│       └── index.css
├── charakterkarten-backend/      ← Node.js + Express + SQLite Backend
│   ├── server.js
│   ├── db/
│   │   └── database.js           ← DB-Init, Schema, Camp-Seed
│   ├── routes/
│   │   ├── camps.js
│   │   ├── kinder.js
│   │   └── korrektur.js          ← Passwortgeschützte Korrektur-Routen
│   └── package.json
└── referenzen/                   ← INTERN (gitignored)
```

## API-Endpunkte

| Methode | Pfad | Beschreibung |
|---|---|---|
| `GET` | `/api/camps?typ=CAMP2GO` | Camps nach Typ filtern |
| `GET` | `/api/kinder?camp_id=1&gruppe=J4` | Kinder einer Gruppe |
| `POST` | `/api/kinder` | Kind anlegen |
| `PUT` | `/api/kinder/:id` | Kind aktualisieren |
| `PUT` | `/api/kinder/:id/fertig` | Als fertig/nicht fertig markieren |
| `DELETE` | `/api/kinder/:id` | Kind löschen |
| `POST` | `/api/korrektur/login` | Passwort prüfen |
| `GET` | `/api/korrektur/kinder` | Alle fertigen Karten (Auth) |
| `PUT` | `/api/korrektur/kinder/:id` | Korrektur + Markup speichern (Auth) |

Korrektur-Routen benötigen den Header `x-korrektur-password`.

## Datenbank-Schema

```sql
camps (id, typ, standort, code)
-- typ: 'CAMP2GO' | 'YOUTH CAMP' | 'QUIETSCHFIDEL'
-- code: null bei CAMP2GO, 'YC1'/'YC2' bei YOUTH CAMP, 'Q1'/'Q2' bei QUIETSCHFIDEL

kinder (
  id, camp_id, gruppe, name, geschlecht,
  scores,                   -- JSON: { beziehungsstark: 1-5, ... }
  gewaehlte_eigenschaften,  -- JSON: [{ name, beschreibung, bibelvers, katFarbe }]
  bibelvers, text,
  text_markup,              -- HTML mit Korrektur-Markierungen (highlights, strikethrough)
  fertig,                   -- 0/1
  korrigiert,               -- 0/1
  korrektur_notiz,
  created_at, updated_at
)
```

## Workflow

```
Gruppenleiter schreibt Karte
        ↓
"Als fertig markieren" → Status: Fertig
        ↓
Korrektur-Team sieht Karte im Portal
        ↓
Markup + Notiz hinzufügen → "Als korrigiert markieren"
        ↓
Gruppenleiter sieht korrigierte Karte (read-only, mit Markup)
```

## Corporate Design

```css
--camissio-dunkelblau: #1c4554   /* Primärfarbe, Text */
--camissio-petrol:     #007d99   /* Links, Akzente */
--camissio-lila:       #a1a5dd   /* YOUTH CAMP */
--camissio-orange:     #fa5c33   /* CAMP2GO */
--camissio-greige:     #f0f2ed   /* App-Hintergrund */
--camissio-summer-gruen: #00ab67 /* QUIETSCHFIDEL */
```

- **Headlines:** Bebas Neue (Google Fonts)
- **Fließtext:** Nunito Sans (Google Fonts)

---

*Das Highlight deines Sommers! — camissio.de*
