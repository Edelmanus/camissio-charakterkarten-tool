const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'charakterkarten.db');

const db = new DatabaseSync(DB_PATH);

db.exec(`PRAGMA journal_mode = WAL`);
db.exec(`PRAGMA foreign_keys = ON`);

// Migration: text_markup Spalte falls noch nicht vorhanden
try {
  db.exec(`ALTER TABLE kinder ADD COLUMN text_markup TEXT NOT NULL DEFAULT ''`);
} catch {
  // Spalte existiert bereits
}

db.exec(`
  CREATE TABLE IF NOT EXISTS camps (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    typ      TEXT NOT NULL,
    standort TEXT NOT NULL,
    code     TEXT
  );

  CREATE TABLE IF NOT EXISTS kinder (
    id                      TEXT PRIMARY KEY,
    camp_id                 INTEGER NOT NULL,
    gruppe                  TEXT NOT NULL,
    name                    TEXT NOT NULL,
    geschlecht              TEXT NOT NULL DEFAULT 'keine',
    scores                  TEXT NOT NULL DEFAULT '{}',
    gewaehlte_eigenschaften TEXT NOT NULL DEFAULT '[]',
    bibelvers               TEXT NOT NULL DEFAULT '',
    text                    TEXT NOT NULL DEFAULT '',
    fertig                  INTEGER NOT NULL DEFAULT 0,
    korrigiert              INTEGER NOT NULL DEFAULT 0,
    korrektur_notiz         TEXT NOT NULL DEFAULT '',
    created_at              TEXT NOT NULL,
    updated_at              TEXT NOT NULL,
    FOREIGN KEY (camp_id) REFERENCES camps(id)
  );
`);

// Camps einmalig befüllen
const campCount = db.prepare('SELECT COUNT(*) as n FROM camps').get();
if (campCount.n === 0) {
  const camp2goStandorte = [
    'Augsburg','Bad Hersfeld','Bad Langensalza','Berlin','Brackenheim',
    'Daaden','Duisburg','Erding','Essen','Frankfurt','Freiburg',
    'Friedrichshafen','Gießen','Gifhorn','Gunzenhausen','Hanau',
    'Henstedt-Ulzburg','Herborn','Hersbruck','Hückeswagen','Krelingen',
    'Kuhle','Landau','Leipzig','Limbach-Oberfrohna','Lübeck','Ludwigsburg',
    'Magdeburg','Müden','Neustadt','Nümbrecht','Nürnberg','Plettenberg',
    'Rahden','Schwäbisch Hall','Serrahn','Siegburg','Siegen-Eiserfeld',
    'Siegen-Geisweid','Stuttgart','Velbert','Wiesbaden','Woltersdorf',
    'Wunstorf','Wuppertal','Würzburg',
  ];

  const insert = db.prepare('INSERT INTO camps (typ, standort, code) VALUES (?, ?, ?)');

  for (const standort of camp2goStandorte) {
    insert.run('CAMP2GO', standort, null);
  }
  insert.run('YOUTH CAMP', 'Augsburg', 'YC1');
  insert.run('YOUTH CAMP', 'Bad Hersfeld', 'YC2');
  insert.run('QUIETSCHFIDEL', 'Augsburg', 'Q1');
  insert.run('QUIETSCHFIDEL', 'Bad Hersfeld', 'Q2');
}

module.exports = db;
