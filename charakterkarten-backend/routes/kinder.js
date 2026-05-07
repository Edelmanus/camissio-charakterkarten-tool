const express = require('express');
const db = require('../db/database');

const router = express.Router();

// GET /api/kinder?camp_id=1&gruppe=J4
router.get('/', (req, res) => {
  const { camp_id, gruppe } = req.query;
  if (!camp_id || !gruppe) {
    return res.status(400).json({ error: 'camp_id und gruppe erforderlich' });
  }
  const kinder = db
    .prepare('SELECT * FROM kinder WHERE camp_id = ? AND gruppe = ? ORDER BY name')
    .all(Number(camp_id), gruppe);

  res.json(kinder.map(parseKind));
});

// POST /api/kinder — neues Kind anlegen
router.post('/', (req, res) => {
  const { camp_id, gruppe, name, geschlecht, scores, gewaehlte_eigenschaften, bibelvers, text } = req.body;
  if (!camp_id || !gruppe || !name) {
    return res.status(400).json({ error: 'camp_id, gruppe und name erforderlich' });
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO kinder (id, camp_id, gruppe, name, geschlecht, scores, gewaehlte_eigenschaften, bibelvers, text, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, Number(camp_id), gruppe, name,
    geschlecht || 'keine',
    JSON.stringify(scores || defaultScores()),
    JSON.stringify(gewaehlte_eigenschaften || []),
    bibelvers || '',
    text || '',
    now, now
  );

  const kind = db.prepare('SELECT * FROM kinder WHERE id = ?').get(id);
  res.status(201).json(parseKind(kind));
});

// PUT /api/kinder/:id — Kind aktualisieren
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const kind = db.prepare('SELECT * FROM kinder WHERE id = ?').get(id);
  if (!kind) return res.status(404).json({ error: 'Nicht gefunden' });

  const { name, geschlecht, scores, gewaehlte_eigenschaften, bibelvers, text } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE kinder SET
      name = ?, geschlecht = ?, scores = ?, gewaehlte_eigenschaften = ?,
      bibelvers = ?, text = ?, updated_at = ?
    WHERE id = ?
  `).run(
    name ?? kind.name,
    geschlecht ?? kind.geschlecht,
    JSON.stringify(scores ?? JSON.parse(kind.scores)),
    JSON.stringify(gewaehlte_eigenschaften ?? JSON.parse(kind.gewaehlte_eigenschaften)),
    bibelvers ?? kind.bibelvers,
    text ?? kind.text,
    now, id
  );

  res.json(parseKind(db.prepare('SELECT * FROM kinder WHERE id = ?').get(id)));
});

// PUT /api/kinder/:id/fertig
router.put('/:id/fertig', (req, res) => {
  const { id } = req.params;
  const kind = db.prepare('SELECT * FROM kinder WHERE id = ?').get(id);
  if (!kind) return res.status(404).json({ error: 'Nicht gefunden' });

  const { fertig } = req.body;
  const now = new Date().toISOString();

  db.prepare("UPDATE kinder SET fertig = ?, korrigiert = 0, korrektur_notiz = '', updated_at = ? WHERE id = ?")
    .run(fertig ? 1 : 0, now, id);

  res.json(parseKind(db.prepare('SELECT * FROM kinder WHERE id = ?').get(id)));
});

// DELETE /api/kinder/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM kinder WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json({ ok: true });
});

function defaultScores() {
  return {
    beziehungsstark: 3, anpacker: 3, unaufhaltsam: 3,
    verwurzelt: 3, gewissenhaft: 3, vorbild: 3, anbeter: 3,
  };
}

function parseKind(row) {
  return {
    ...row,
    scores: JSON.parse(row.scores),
    gewaehltEigenschaften: JSON.parse(row.gewaehlte_eigenschaften),
    fertig: row.fertig === 1,
    korrigiert: row.korrigiert === 1,
    text_markup: row.text_markup || '',
  };
}

module.exports = router;
