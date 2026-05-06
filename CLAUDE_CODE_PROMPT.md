# Claude Code Prompt: CAMISSIO Charakterkarten Web-App

## Kontext & Ziel

Ich arbeite bei **CAMISSIO**, einem evangelistischen Camp-Ministerium für Kinder und Jugendliche (Dachorganisation: Deutsche Zeltmission, gegründet 2015). Bei unseren Sommercamps werden Teilnehmer in Gruppen von 8–10 Kindern eingeteilt, jeweils mit einem Mitarbeiter. Am Ende des Camps schreibt jeder Mitarbeiter eine **Charakterkarte** für jedes Kind seiner Gruppe.

Eine Charakterkarte enthält:
- **Name des Kindes** (oben)
- **Zwei Charaktereigenschaften** (z. B. „mutig" / „anleitend")
- **4–5 Sätze ermutigender Text**, der den Charakter des Kindes beschreibt
- Optional: passender Bibelvers

**Beispiel:**
> **Cam** — *mutig · anleitend*
> Cam ist ein absolut mutiger junger Mann. Er traut sich vieles zu und wächst dabei über sich hinaus. Er sucht die Herausforderung und liebt es sie zu meistern. Er will auch sehen, wie seine Freunde und die Menschen um ihn herum ebenso Erfolge erzielen. Er spornt andere an und übernimmt gerne die Leitung einer Gruppe.

## Aufgabe

Baue eine **Web-App, die Mitarbeiter beim Schreiben dieser Charakterkarten unterstützt**. Die App wird später in unsere Hauptwebsite eingebettet, daher: sauberer, einbettbarer Code (idealerweise eine statische Single-Page-App, die später als iframe oder Komponente integriert werden kann).

## Kern-Workflow (User Journey)

1. **Mitarbeiter legt ein neues Kind an** (Name eingeben).
2. **Mitarbeiter ordnet das Kind in 7 Wesenszug-Kategorien ein** auf einer Skala von **1–5**:
   - Der Beziehungsstarke
   - Der Anpacker
   - Der Unaufhaltsame
   - Der Verwurzelte
   - Der Gewissenhafte
   - Das Vorbild
   - Der Anbeter / Allerechteste
3. **Live-Visualisierung**: Aus den 7 Werten entsteht ein **Netz-/Radardiagramm** für das Kind.
4. **Eigenschafts-Vorschläge**: Basierend auf den höchsten Werten schlägt die App passende Charaktereigenschaften vor (aus den unten gelisteten Eigenschaften der jeweiligen Kategorie).
5. **Klick auf eine Eigenschaft** öffnet ein Detail-Panel mit:
   - Beschreibung der Eigenschaft
   - Passendem Bibelvers
   - **Inspirations-Textbaustein** (kein vorgeschriebener Text, sondern Beispielformulierung als Anregung)
6. **Mitarbeiter wählt 2 Eigenschaften** und schreibt **selbst** den 4–5-Satz-Text in einem Texteditor-Feld.
7. **Hilfsformulierungen-Button** (separates ein-/ausklappbares Panel) mit hilfreichen Satzanfängen, Übergängen und Formulierungen für den Fließtext.
8. **Anleitung/Hilfestellung** (aus dem Charakterkarten-Manual) ist permanent über einen Info-Button erreichbar.
9. **Export pro Kind**: PDF oder Druckansicht der fertigen Charakterkarte im CAMISSIO-Design.
10. **Speicherung**: Daten lokal speichern (LocalStorage oder IndexedDB), damit Mitarbeiter über mehrere Sitzungen an ihrer Gruppe arbeiten können. Mehrere Kinder pro Mitarbeiter verwalten.

## Daten: Charaktereigenschaften pro Kategorie

Die vollständigen Eigenschaften, Beschreibungen und Bibelverse findest du in der angehängten Datei `Charakterkarten_YOUTH_CAMP.docx`. Strukturiere sie als JSON (z. B. `data/eigenschaften.json`) mit folgendem Schema:

```json
{
  "kategorien": [
    {
      "id": "beziehungsstark",
      "name": "Der Beziehungsstarke",
      "eigenschaften": [
        {
          "name": "Freundlich",
          "beschreibung": "Mit einer freundlichen oder liebenswerten Art, nett, sympathisch ...",
          "bibelvers": "Micha 6,8",
          "inspirationstext": "[X] ist ein freundlicher Mensch, in dessen Nähe man sich sofort wohlfühlt. ..."
        }
      ]
    }
  ]
}
```

**Bitte extrahiere alle Eigenschaften aus dem docx vollständig.** Wo Inspirations-Beispieltexte fehlen, generiere sie passend im Stil der zwei mitgelieferten Beispiele (Cam, Missi) — ermutigend, persönlich, christusbezogen, 4–5 Sätze, mit Platzhalter `[Name]`.

## Corporate Design (verbindlich!)

Volle Spezifikation in `01_CAMISSIO_Corporate_Design_Manual.pdf`. Wichtigste Eckwerte:

### Farben (CSS-Variablen)
```css
:root {
  /* Primär */
  --camissio-dunkelblau: #1c4554;
  --camissio-petrol: #007d99;
  --camissio-lila: #a1a5dd;
  --camissio-orange: #fa5c33;
  --camissio-greige: #f0f2ed;        /* Hintergrund */

  /* Sekundär (Auswahl, alle in Manual) */
  --camissio-summer-gruen: #00ab67;
  --camissio-missi-gelb: #f5e563;
  --camissio-cam-blau: #55c1c4;
  --camissio-summer-pink: #de69a8;
  --camissio-youth-rot: #f35b56;
  /* … weitere aus Manual übernehmen */
}
```

### Typografie (Google Fonts)
- **Headlines**: `Bebas Neue` (für YOUTH CAMP) — über Google Fonts laden
- **Fließtext**: `Nunito Sans` — über Google Fonts laden
- *(Chromoxome ist Logo-Schrift, nicht öffentlich. Bebas Neue ist die offizielle Fallback-Variante laut Manual.)*
- Mindest-Schriftgröße Web: **16 px (1 rem)** — Barrierefreiheit ist wichtig!
- Laufweite: leicht erhöht (`letter-spacing: 0.03em`) wo passend

### Gestaltungselemente
- **Abgerundete Ecken** für Karten/Container
- **YOUTH CAMP**-Farbe ist **Lila (#a1a5dd)** — die App ist dem Youth Camp zugeordnet, also Herzanker-Bildmarke in Lila
- **Slogan**: „Das Highlight deines Sommers!" + „...denn jeder soll von Jesus hören!" passend platzieren
- **Sterne** als Störer/Akzent-Elemente (siehe Manual S. 44)
- **Logo**: oben in der App-Header-Leiste (Platzhalter falls SVG noch nicht vorliegt — TODO-Kommentar setzen)

### Bild-/UI-Sprache
- Fröhlich, klar, modern, **barrierefrei**
- Ausreichend Kontrast (Dunkelblau auf Greige für Fließtext)
- Hintergrund-Welle im YOUTH CAMP-Bereich (siehe Manual S. 44) als dezentes Designelement

## Technologie-Empfehlungen

- **Framework**: React + Vite (oder Next.js statisch exportiert) — sauber einbettbar
- **Styling**: Tailwind CSS mit custom Theme-Konfiguration für CAMISSIO-Farben & Fonts
- **Charts**: `recharts` für das Radar-/Netzdiagramm
- **Persistenz**: `localStorage` (einfach, ausreichend) — Schema: `{ mitarbeiter_id, gruppe: [{kind_id, name, scores: {kategorie: 1-5}, eigenschaften: [], text}] }`
- **PDF-Export**: `react-to-print` oder `html2pdf.js` für Druckansicht
- **Sprache**: Deutsch durchgehend
- **Keine Backend-Abhängigkeit** — alles client-seitig, damit einfach in Website integrierbar

## Konkrete UI-Struktur

```
┌─────────────────────────────────────────────────┐
│ [CAMISSIO YOUTH CAMP Logo]   [ℹ️ Anleitung]    │
├─────────────────────────────────────────────────┤
│ Sidebar: Meine Gruppe        │ Hauptbereich     │
│  • Lukas       ✓             │                  │
│  • Sophie      (in Arbeit)   │  [Kindname]      │
│  • Tim         ○             │                  │
│  + Neues Kind                │  Kategorien-     │
│                              │  Slider (1–5)    │
│                              │                  │
│                              │  [Radarchart]    │
│                              │                  │
│                              │  Vorschläge:     │
│                              │  [Eigenschaft 1] │
│                              │  [Eigenschaft 2] │
│                              │  [Eigenschaft 3] │
│                              │                  │
│                              │  Gewählte        │
│                              │  Eigenschaften:  │
│                              │  • mutig         │
│                              │  • anleitend     │
│                              │                  │
│                              │  [Texteditor]    │
│                              │                  │
│                              │  [💡 Hilfreiche  │
│                              │   Formulierungen]│
│                              │                  │
│                              │  [PDF Export]    │
└─────────────────────────────────────────────────┘
```

### Detailpanel beim Klick auf Eigenschafts-Vorschlag (Modal/Slide-in)

```
┌──────────────────────────────────────┐
│ Freundlich                       [×] │
├──────────────────────────────────────┤
│ Mit einer freundlichen oder         │
│ liebenswerten Art, nett, sympathisch │
│ ...                                  │
│                                      │
│ 📖 Bibelvers: Micha 6,8             │
│                                      │
│ 💭 Beispielformulierung (zur        │
│    Inspiration — bitte selbst       │
│    schreiben!):                      │
│ "[Name] ist ein freundlicher        │
│  Mensch, in dessen Nähe ..."        │
│                                      │
│ [In meine Karte aufnehmen]           │
└──────────────────────────────────────┘
```

### Hilfreiche Formulierungen (ausklappbares Panel)

Sammlung von **Satzanfängen** und **Übergängen**, kategorisiert:
- **Einstiegssätze**: „[Name] zeichnet sich besonders aus durch…", „An [Name] beeindruckt mich…", „Was [Name] besonders macht, ist…"
- **Übergänge**: „Außerdem …", „Darüber hinaus …", „Was mir auch aufgefallen ist …"
- **Ermutigende Schlusssätze**: „Ich bin gespannt, wie Gott dich weiter gebrauchen wird.", „Bleib so, wie du bist — du bist ein Geschenk!"

→ Bitte ca. 8–12 pro Kategorie generieren, im warmherzigen, christlich-ermutigenden Ton der CAMISSIO-Sprache (siehe Manual S. 47: „klare, barrierefreie und wertschätzende Sprache").

## Anleitung/Hilfestellung Modal

Die folgenden **15 Regeln** sind der verbindliche Inhalt des Anleitungs-Modals. Bitte **wortgetreu** in die App übernehmen (Reihenfolge beibehalten, ggf. mit Icons/Hervorhebungen visuell aufbereitet, aber Inhalt nicht umformulieren):

> **Anleitung/Hilfestellung für Charakterkarten**
>
> 1. Schreibe den Vor- und Nachnamen jedes Teilnehmers auf die Charakterkarte.
> 2. Wähle **zwei positive und passende Eigenschaften** für jeden Teilnehmer aus. Überprüfe, dass sich die beiden Eigenschaften unterscheiden. Ein gutes Beispiel wären die Adjektive „Hilfsbereit" und „Mutig". Die Adjektive „Dienend" und „Hilfsbereit" unterscheiden sich hingegen nicht hinreichend.
> 3. Schreibe die Charakterkarte in der **dritten Person**. Benutze nicht „du", „ich" oder „wir".
> 4. Die Charakterkarte beinhaltet die von dir gewählten zwei Adjektive und anschließend eine Beschreibung, welche die Charaktereigenschaften näher erläutert. **In deiner Beschreibung dürfen die beiden Adjektive nicht vorkommen.** Stattdessen sollst du mithilfe deiner Beschreibung die beiden Adjektive definieren. Erkläre, wie du weißt, dass der Teilnehmer diese Eigenschaften besitzt. Es ist nicht ausreichend zu schreiben, dass der Teilnehmer geduldig ist. Du musst erklären, auf welche Art und Weise der Teilnehmer seine Geduld zeigt.
> 5. Deine Beschreibung sollte eine Länge von **ungefähr vier bis fünf aussagekräftigen Sätzen** haben. Bleibe bei den von dir ausgewählten Adjektiven. Schreibe nicht, dass der Teilnehmer loyal und sanftmütig ist und dann, wie kreativ und furchtlos der Teilnehmer ist. Als Faustregel gilt: Überlege dir zwei aussagekräftige Sätze für jede Eigenschaft. Füllsätze zählen nicht dazu.
> 6. Denke daran, dass du Eigenschaften wählst, die **auch über das Camp hinaus** für die Teilnehmer gelten. Schreibe zum Beispiel nicht über Aktivitäten des Camps.
> 7. Wähle das **Präsens** als Zeitform, da der Teilnehmer diese Charaktereigenschaften immer noch besitzt.
> 8. Versuche, dich nicht zu wortreich auszudrücken. Eine Charakterkarte ist keine wissenschaftliche Arbeit. Sage einfach, wie es ist.
> 9. Vermeide **„nicht"-Aussagen** wie: „Er ist nicht schüchtern, wenn es darum geht, die Wahrheit zu teilen."
> 10. Schreibe nicht über negative Erfahrungen. Sage nicht, dass der Teilnehmer mutig war, als er sich nach fünf Stunden Weinen endlich auf die Rutsche gewagt hat.
> 11. Sei kreativ! Alle Teilnehmer sind unterschiedlich; benutze dementsprechend auch verschiedene Charaktereigenschaften.
> 12. Vermeide es, immer wieder dieselben Wörter wie „super" oder „fantastisch" zu verwenden.
> 13. Achte darauf, dass deine Sprache dem **Geschlecht der Teilnehmer angemessen** ist. Jungs wünschen sich nicht, sanftmütig zu sein, sondern vielleicht geduldig. Mädchen träumen nicht davon, hart zu sein, sondern vielleicht zielstrebig.
> 14. Suche eine **passende Bibelstelle** für den Teilnehmer raus.
> 15. Und erinnere dich: **schreibe über die zwei Eigenschaften, die du wählst!**

### UI-Konsequenzen aus den Regeln

Mehrere dieser Regeln sollen sich direkt im Verhalten der App widerspiegeln:

- **Regel 1**: Eingabefeld erwartet **Vor- UND Nachnamen** (zwei separate Felder oder ein Feld mit Hinweis-Placeholder „z. B. Lukas Müller").
- **Regel 2**: Wenn der Mitarbeiter zwei Eigenschaften aus derselben Unterkategorie wählt, die sich semantisch ähneln (z. B. „Dienend" + „Hilfsbereit"), zeige einen **freundlichen Hinweis** („Diese beiden Eigenschaften sind sehr ähnlich — möchtest du eine kontrastreichere Kombination wählen?"). Hinweis ist nicht blockierend, nur ein Tipp.
- **Regel 4**: Im Texteditor läuft **Live-Validierung**: Wenn eine der gewählten Adjektive (oder offensichtliche Wortvarianten wie „mutig" → „Mut", „mutigen") im Text vorkommt, dezent gelb unterringeln mit Tooltip „Tipp: Beschreibe die Eigenschaft, statt sie zu nennen (siehe Regel 4)."
- **Regel 5**: **Wortzähler** unter dem Texteditor mit Soll-Angabe (~60–100 Wörter / 4–5 Sätze). Farb-Feedback: grau (zu kurz) → grün (im Bereich) → orange (zu lang).
- **Regel 7**: Im Texteditor optional ein dezenter Tense-Check: Treffer von Vergangenheits-Hilfsverben („war", „hatte", „ging") als Hinweis markieren („Tipp: Präsens verwenden — siehe Regel 7"). Nicht blockierend.
- **Regel 9**: Vorkommen von „ nicht " als gelber Hinweis markieren mit Tooltip auf Regel 9.
- **Regel 13**: Beim Anlegen eines Kindes optional **Geschlecht** abfragen (männlich / weiblich / keine Angabe). Falls gesetzt, kann die App bei Eigenschafts-Vorschlägen leichte Gewichtung vornehmen oder Inspirations-Texte mit korrekten Pronomen vorbefüllen (er/sie).
- **Regel 14**: Bibelvers ist **integraler Teil der Charakterkarte** — auf der finalen Karte mit angezeigt/gedruckt. Mitarbeiter kann den vorgeschlagenen Vers übernehmen oder einen eigenen eintippen.

Diese Hinweise sind alle **wohlwollend formuliert** („Tipp:", „Möchtest du …?") — die App belehrt nicht, sondern unterstützt. Mitarbeiter können jeden Hinweis ignorieren und trotzdem speichern/exportieren.

### Zusätzlich: Kurzer Onboarding-Screen beim ersten Start

Einseitiger Willkommens-Screen (überspringbar) mit:
- Was ist eine Charakterkarte? (Zweck: Ermutigung, Wertschätzung, Mitgabe für nach dem Camp)
- 3-Schritte-Übersicht: Einordnen → Eigenschaften wählen → Text schreiben
- Hinweis: „Die vollständige Anleitung findest du jederzeit oben rechts unter ℹ️"

## Akzeptanz-Kriterien

- [ ] Funktioniert offline (alles client-seitig, LocalStorage)
- [ ] Mehrere Kinder können parallel bearbeitet werden
- [ ] Eingabefeld für **Vor- und Nachname** (Regel 1)
- [ ] Optional: Geschlecht beim Anlegen abfragen (Regel 13)
- [ ] Radar-Diagramm aktualisiert sich live beim Slider-Bewegen
- [ ] Eigenschafts-Vorschläge basieren auf den 2–3 höchsten Kategorie-Werten
- [ ] Detail-Panel zeigt Beschreibung + Bibelvers + Inspirations-Text
- [ ] Mitarbeiter schreiben den finalen Text **selbst** (kein Auto-Fill)
- [ ] Hinweis bei semantisch zu ähnlichen Eigenschafts-Paaren (Regel 2)
- [ ] Live-Markierung der gewählten Adjektive im Text (Regel 4)
- [ ] Wortzähler mit Soll-Bereich-Feedback (Regel 5)
- [ ] Hinweise auf „nicht"-Aussagen und Vergangenheitsformen (Regel 7, 9)
- [ ] Hilfreiche Formulierungen separat ein-/ausklappbar
- [ ] Anleitungs-Modal mit allen 15 Regeln wortgetreu
- [ ] Bibelvers wird auf der finalen Karte mit angezeigt/gedruckt (Regel 14)
- [ ] PDF-Export pro Kind im CAMISSIO-Design
- [ ] CAMISSIO Corporate Design durchgängig: Farben, Fonts, abgerundete Ecken, Greige-Hintergrund
- [ ] Mobile-tauglich (Tablet-Nutzung im Camp wahrscheinlich)
- [ ] Barrierefrei: ausreichender Kontrast, min. 16 px, Tastatur-Navigation, Screenreader-Labels

## Lieferumfang

1. Vollständige Projektstruktur mit `README.md` (Setup-Anleitung)
2. Build-Befehl produziert statische Files, die wir 1:1 in unsere Website einbetten können
3. `data/eigenschaften.json` mit allen Charaktereigenschaften aus dem docx
4. Logos aus `referenzen/CAMISSIO Logos/` korrekt eingebunden (YOUTH CAMP-Logo + Herzanker-Bildmarke)
5. Kommentierter Code (Deutsch oder Englisch, konsistent)

## Verfügbare Referenzdateien

Liegen alle im Ordner `referenzen/`:

- `Charakterkarten_YOUTH_CAMP.docx` — alle Eigenschaften, Beschreibungen, Bibelverse, Anleitung
- `01_CAMISSIO_Corporate_Design_Manual.pdf` — komplettes Corporate Design
- `CAMISSIO Logos/` — Ordner mit allen offiziellen Logo-PNGs (Dachmarke, Submarken, Herzanker-Bildmarke in verschiedenen Farben). **Bitte die passenden Logos direkt in die App einbinden** — für diese Web-App relevant ist primär das **CAMISSIO YOUTH CAMP**-Logo (Lila-Variante) sowie die Herzanker-Bildmarke. Kopiere die benötigten Dateien aus dem Referenz-Ordner in `public/assets/` (oder Äquivalent je nach Framework) und referenziere sie im Code.
- Website (für visuelle Orientierung): camissio.de

## Bitte vor dem Start

Stell mir gerne **Rückfragen** zu unklaren Punkten, bevor du startest — z. B.:
- Wie viele Eigenschafts-Vorschläge gleichzeitig anzeigen? (Vorschlag: 3–6)
- Wie aggressiv sollen die Live-Validierungen (Regel 4, 7, 9) sein? (Vorschlag: dezent, nicht-blockierend, abschaltbar)
- Brauchen wir Mehrbenutzer-Support oder reicht 1 Mitarbeiter pro Browser?
- Soll die Geschlechts-Abfrage (Regel 13) Pflichtfeld oder optional sein? (Vorschlag: optional)
