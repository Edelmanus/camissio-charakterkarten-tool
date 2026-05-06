# CAMISSIO Charakterkarten-Tool

Web-App für CAMISSIO YOUTH CAMP Mitarbeiter zum Erstellen persönlicher Charakterkarten für Camp-Teilnehmer.

## Was ist eine Charakterkarte?

Eine Charakterkarte ist eine persönliche Ermutigung für jedes Kind in der Gruppe. Mitarbeiter wählen zwei positive Charaktereigenschaften aus und schreiben einen kurzen, herzlichen Text — eine Mitgabe für nach dem Camp.

## Features

- **7 Wesenszug-Kategorien** mit Schiebereglern (1–5) und Live-Radardiagramm
- **Eigenschafts-Vorschläge** basierend auf den höchsten Werten + alle 70+ Eigenschaften durchsuchbar
- **Detailpanel** pro Eigenschaft mit Beschreibung, Bibelvers & Inspirationstext
- **Live-Textvalidierung**: Adjektiv-Warnung (Regel 4), Vergangenheitsform (Regel 7), Nicht-Aussagen (Regel 9)
- **Wortzähler** mit Soll-Bereich-Feedback (60–100 Wörter)
- **Hilfreiche Formulierungen** (Einstieg, Übergänge, Schlusssätze, Christliche Formulierungen)
- **Anleitung-Modal** mit allen 15 Regeln wortgetreu
- **PDF/Druckexport** im CAMISSIO-Design (A5)
- **LocalStorage-Persistenz** — Daten bleiben über Sitzungen erhalten
- **Onboarding-Screen** beim ersten Start
- **Offline-fähig** (alles client-seitig, kein Backend)
- **Mobil-/Tablet-optimiert** (einklappbare Sidebar)

## Setup

### Voraussetzungen

- Node.js ≥ 18
- npm ≥ 9

### Installation & Start (Entwicklung)

```bash
cd charakterkarten-app
npm install
npm run dev
```

Öffne [http://localhost:5173](http://localhost:5173) im Browser.

### Produktion Build

```bash
cd charakterkarten-app
npm run build
```

Die statischen Dateien liegen danach in `charakterkarten-app/dist/`. Diese können direkt auf einem Webserver oder in eine bestehende Website eingebunden werden.

### In bestehende Website einbetten

**Als iframe:**
```html
<iframe
  src="/charakterkarten/"
  width="100%"
  height="800px"
  frameborder="0"
  style="border-radius: 12px;"
></iframe>
```

**Als Standalone-Seite:**
Einfach den Inhalt von `dist/` in einen Unterordner der Website kopieren.

## Projektstruktur

```
charakterkarten-app/
├── public/
│   ├── assets/                  # CAMISSIO-Logos (PNG)
│   └── data/
│       └── eigenschaften.json   # Alle Charaktereigenschaften (10 Kategorien)
├── src/
│   ├── components/
│   │   ├── AnleitungModal.jsx   # 15 Regeln (wortgetreu aus Manual)
│   │   ├── EigenschaftDetail.jsx # Detail-Panel mit Inspirationstext
│   │   ├── Header.jsx
│   │   ├── KarteDruck.jsx       # Druckansicht (A5-Format)
│   │   ├── KindEditor.jsx       # Haupt-Editor-Komponente
│   │   ├── LeereAnsicht.jsx
│   │   ├── Onboarding.jsx
│   │   ├── RadarChart.jsx       # Recharts Radardiagramm
│   │   ├── Sidebar.jsx          # Gruppen-Übersicht + Kind anlegen
│   │   └── TextEditor.jsx       # Textarea mit Live-Validierung
│   ├── utils/
│   │   ├── storage.js           # LocalStorage-Logik
│   │   └── validierung.js       # Texthilfen, Warnungen, Wortzähler
│   ├── App.jsx
│   └── index.css
└── tailwind.config.js           # CAMISSIO-Farben & Fonts
```

## Daten: `eigenschaften.json`

Enthält 10 Kategorien mit insgesamt 70+ Eigenschaften. Jede Eigenschaft hat:
- `name` — Bezeichnung (z. B. „Mutig")
- `beschreibung` — Was die Eigenschaft bedeutet
- `bibelvers` — Passende Bibelstelle
- `inspirationstext` — Beispielformulierung mit `[Name]`-Platzhalter

| Kategorie | Slider | Eigenschaften (Auswahl) |
|---|:---:|---|
| Der Beziehungsstarke | ✓ | Freundlich, Geduldig, Einfühlsam, Gütig … |
| Der Anpacker | ✓ | Macher, Dienend, Hilfsbereit, Großzügig … |
| Der Unaufhaltsame | ✓ | On fire, Motiviert, Zielstrebig, Diszipliniert … |
| Der Verwurzelte | ✓ | Standhaft, Glaubensfest, Gottergeben … |
| Der Gewissenhafte | ✓ | Zuverlässig, Verantwortungsvoll, Loyal … |
| Das Vorbild | ✓ | Vorbild, Selbstbewusst, Inspirierend, Leiter … |
| Der Anbeter | ✓ | Demütig, Dankbar, Fröhlich, Ehrlich … |
| Der Lernende | – | Weise, Urteilsfähig, Wissbegierig … |
| Der Gestalter | – | Kreativ, Einfallsreich, Lustig … |
| Der Überwinder | – | Mutig, Furchtlos, Anleitend … |

## Corporate Design

Gemäß `01_CAMISSIO_Corporate Design Manual.pdf`:

- **Primärfarben**: Dunkelblau `#1c4554`, Petrol `#007d99`, Lila `#a1a5dd`, Orange `#fa5c33`, Greige `#f0f2ed`
- **Schriften**: Bebas Neue (Headlines), Nunito Sans (Fließtext) — Google Fonts
- **Logos**: `public/assets/` — YOUTH CAMP Lila-Variante + Herzanker-Bildmarke

## Technologie

| Paket | Zweck |
|---|---|
| React 18 + Vite 5 | Framework & Build-Tool |
| Tailwind CSS v3 | Styling mit CAMISSIO Custom Theme |
| Recharts | Radar-/Netzdiagramm |
| react-to-print | PDF/Druckexport |
| LocalStorage | Datenpersistenz (kein Backend nötig) |

---

*Das Highlight deines Sommers! — camissio.de*

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
