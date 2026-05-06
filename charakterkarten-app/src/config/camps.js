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
  },
];

export const CAMP_STORAGE_KEY = 'camissio_aktives_camp';

export function getCampById(id) {
  return CAMPS.find(c => c.id === id) || null;
}
