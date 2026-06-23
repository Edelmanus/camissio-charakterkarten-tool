export const CAMPS = [
  {
    id: 'youth-camp',
    name: 'YOUTH CAMP',
    vollname: 'CAMISSIO YOUTH CAMP',
    zielgruppe: 'Teens 12–17 Jahre',
    beschreibung: 'Eine Woche voll mit Action und neuen Freundschaften für Teens von 12–17 Jahren.',
    farbe: '#a1a5dd',
    farbeHell: '#eaebf8',
    farbeText: '#4a4f99',
    logo: '/assets/youth-camp-logo-lila.png',
    eigenschaftenFile: '/data/eigenschaften-youth-camp.json',
    storageKey: 'camissio_charakterkarten_youth-camp',
  },
  {
    id: 'camp2go',
    name: 'CAMP2GO',
    vollname: 'CAMISSIO CAMP2GO',
    zielgruppe: 'Kinder 6–12 Jahre',
    beschreibung: 'Abenteuerferiencamp für Kinder von 6–12 Jahren direkt in deiner Stadt.',
    farbe: '#fa5c33',
    farbeHell: '#fde8e1',
    farbeText: '#c03a15',
    logo: '/assets/camp2go-logo.png',
    eigenschaftenFile: '/data/eigenschaften-camp2go.json',
    storageKey: 'camissio_charakterkarten_camp2go',
    altersgruppePillConfig: { jung: '6–9 J.', alt: '10–12 J.', alle: 'Alle' },
  },
  {
    id: 'quietschfidel',
    name: 'QUIETSCHFIDEL',
    vollname: 'CAMISSIO QUIETSCHFIDEL',
    zielgruppe: 'Kinder & Jugendliche mit Beeinträchtigungen',
    beschreibung: 'Eine Woche voller Freude für Kinder, Jugendliche und junge Erwachsene mit Beeinträchtigungen oder chronischen Krankheiten.',
    farbe: '#00ab67',
    farbeHell: '#d4ede5',
    farbeText: '#007a49',
    logo: '/assets/camissio-logo.png',
    eigenschaftenFile: '/data/eigenschaften-quietschfidel.json',
    storageKey: 'camissio_charakterkarten_quietschfidel',
    altersgruppePillConfig: { jung: 'Jüngere', alt: 'Ältere', alle: 'Alle' },
  },
];

export const CAMP_STORAGE_KEY = 'camissio_aktives_camp';

export function getCampById(id) {
  return CAMPS.find(c => c.id === id) || null;
}

// Campplan Sommer 2026 — Woche für Woche
// eintraege matchen auf camp_typ + camp_standort (+ camp_code für YC/QF)
export const CAMPPLAN = [
  {
    kw: 27, datumVon: '2026-06-29', datumBis: '2026-07-03',
    eintraege: [
      { typ: 'CAMP2GO', standort: 'Bad Hersfeld', code: null },
      { typ: 'CAMP2GO', standort: 'Frankfurt', code: null },
      { typ: 'CAMP2GO', standort: 'Herborn', code: null },
    ],
  },
  {
    kw: 28, datumVon: '2026-07-06', datumBis: '2026-07-10',
    eintraege: [
      { typ: 'CAMP2GO', standort: 'Leipzig', code: null },
      { typ: 'CAMP2GO', standort: 'Gifhorn', code: null },
      { typ: 'CAMP2GO', standort: 'Krelingen', code: null },
      { typ: 'CAMP2GO', standort: 'Wunstorf', code: null },
    ],
  },
  {
    kw: 29, datumVon: '2026-07-13', datumBis: '2026-07-17',
    eintraege: [
      { typ: 'CAMP2GO', standort: 'Berlin', code: null },
      { typ: 'CAMP2GO', standort: 'Gießen', code: null },
      { typ: 'CAMP2GO', standort: 'Lübeck', code: null },
      { typ: 'CAMP2GO', standort: 'Wiesbaden', code: null },
    ],
  },
  {
    kw: 30, datumVon: '2026-07-20', datumBis: '2026-07-24',
    eintraege: [
      { typ: 'CAMP2GO', standort: 'Woltersdorf', code: null },
      { typ: 'CAMP2GO', standort: 'Daaden', code: null },
      { typ: 'CAMP2GO', standort: 'Duisburg', code: null },
      { typ: 'CAMP2GO', standort: 'Velbert', code: null },
    ],
  },
  {
    kw: 31, datumVon: '2026-07-27', datumBis: '2026-07-31',
    eintraege: [
      { typ: 'CAMP2GO', standort: 'Magdeburg', code: null },
      { typ: 'CAMP2GO', standort: 'Hanau', code: null },
      { typ: 'CAMP2GO', standort: 'Rahden', code: null },
      { typ: 'CAMP2GO', standort: 'Wuppertal', code: null },
      { typ: 'CAMP2GO', standort: 'Bad Langensalza', code: null },
    ],
  },
  {
    kw: 32, datumVon: '2026-08-03', datumBis: '2026-08-07',
    eintraege: [
      { typ: 'CAMP2GO', standort: 'Müden', code: null },
      { typ: 'CAMP2GO', standort: 'Landau', code: null },
      { typ: 'CAMP2GO', standort: 'Siegen-Eiserfeld', code: null },
      { typ: 'CAMP2GO', standort: 'Neustadt', code: null },
      { typ: 'YOUTH CAMP', standort: 'Augsburg', code: 'YC1' },
    ],
  },
  {
    kw: 33, datumVon: '2026-08-10', datumBis: '2026-08-14',
    eintraege: [
      { typ: 'CAMP2GO', standort: 'Henstedt-Ulzburg', code: null },
      { typ: 'CAMP2GO', standort: 'Augsburg', code: null },
      { typ: 'CAMP2GO', standort: 'Würzburg', code: null },
      { typ: 'CAMP2GO', standort: 'Limbach-Oberfrohna', code: null },
      { typ: 'CAMP2GO', standort: 'Ludwigsburg', code: null },
      { typ: 'YOUTH CAMP', standort: 'Bad Hersfeld', code: 'YC2' },
    ],
  },
  {
    kw: 34, datumVon: '2026-08-17', datumBis: '2026-08-21',
    eintraege: [
      { typ: 'CAMP2GO', standort: 'Serrahn', code: null },
      { typ: 'CAMP2GO', standort: 'Hersbruck', code: null },
      { typ: 'CAMP2GO', standort: 'Plettenberg', code: null },
      { typ: 'CAMP2GO', standort: 'Nürnberg', code: null },
      { typ: 'CAMP2GO', standort: 'Kuhle', code: null },
      { typ: 'QUIETSCHFIDEL', standort: 'Augsburg', code: 'Q1' },
    ],
  },
  {
    kw: 35, datumVon: '2026-08-24', datumBis: '2026-08-28',
    eintraege: [
      { typ: 'CAMP2GO', standort: 'Nümbrecht', code: null },
      { typ: 'CAMP2GO', standort: 'Siegen-Geisweid', code: null },
      { typ: 'CAMP2GO', standort: 'Essen', code: null },
      { typ: 'CAMP2GO', standort: 'Siegburg', code: null },
      { typ: 'CAMP2GO', standort: 'Hückeswagen', code: null },
      { typ: 'QUIETSCHFIDEL', standort: 'Bad Hersfeld', code: 'Q2' },
    ],
  },
  {
    kw: 36, datumVon: '2026-08-31', datumBis: '2026-09-04',
    eintraege: [
      { typ: 'CAMP2GO', standort: 'Stuttgart', code: null },
      { typ: 'CAMP2GO', standort: 'Friedrichshafen', code: null },
      { typ: 'CAMP2GO', standort: 'Freiburg', code: null },
      { typ: 'CAMP2GO', standort: 'Gunzenhausen', code: null },
    ],
  },
  {
    kw: 37, datumVon: '2026-09-07', datumBis: '2026-09-11',
    eintraege: [
      { typ: 'CAMP2GO', standort: 'Erding', code: null },
      { typ: 'CAMP2GO', standort: 'Schwäbisch Hall', code: null },
      { typ: 'CAMP2GO', standort: 'Brackenheim', code: null },
    ],
  },
];

// Gibt KW-Objekt zurück, in dem dieser Standort liegt (matched über typ+standort)
export function getKWFuerEintrag(typ, standort) {
  return CAMPPLAN.find(w => w.eintraege.some(e => e.typ === typ && e.standort === standort)) || null;
}

// ISO-Kalenderwoche für ein Datum berechnen
export function getISOWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Formatiert Datum "29.06." aus ISO-String
export function formatDatum(iso) {
  const [, m, d] = iso.split('-');
  return `${d}.${m}.`;
}

// Anzeigename für einen Campplan-Eintrag
export function eintragLabel(e) {
  if (e.code) return `${e.typ} (${e.code})`;
  return e.standort;
}
