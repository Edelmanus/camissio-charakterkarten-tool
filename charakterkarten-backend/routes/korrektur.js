const express = require('express');
const db = require('../db/database');

const router = express.Router();

const KORREKTUR_PASSWORT = 'CamundMissi';

function authMiddleware(req, res, next) {
  const pw = req.headers['x-korrektur-password'];
  if (pw !== KORREKTUR_PASSWORT) {
    return res.status(401).json({ error: 'Falsches Passwort' });
  }
  next();
}

// POST /api/korrektur/login — Passwort prüfen
router.post('/login', (req, res) => {
  const { passwort } = req.body;
  if (passwort === KORREKTUR_PASSWORT) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Falsches Passwort' });
  }
});

// GET /api/korrektur/kinder — alle fertigen Karten (mit Camp-Info)
router.get('/kinder', authMiddleware, (req, res) => {
  const kinder = db.prepare(`
    SELECT k.*, c.typ as camp_typ, c.standort as camp_standort, c.code as camp_code
    FROM kinder k
    JOIN camps c ON k.camp_id = c.id
    WHERE k.fertig = 1
    ORDER BY c.typ, c.standort, k.gruppe, k.name
  `).all();

  res.json(kinder.map(parseKind));
});

// PUT /api/korrektur/kinder/:id — Korrektur speichern
router.put('/kinder/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const kind = db.prepare('SELECT * FROM kinder WHERE id = ?').get(id);
  if (!kind) return res.status(404).json({ error: 'Nicht gefunden' });

  const { korrigiert, korrektur_notiz, text } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE kinder SET korrigiert = ?, korrektur_notiz = ?, text = ?, updated_at = ? WHERE id = ?
  `).run(
    korrigiert ? 1 : 0,
    korrektur_notiz ?? kind.korrektur_notiz,
    text ?? kind.text,
    now, id
  );

  res.json(parseKind(db.prepare('SELECT * FROM kinder WHERE id = ?').get(id)));
});

function parseKind(row) {
  return {
    ...row,
    scores: JSON.parse(row.scores),
    gewaehltEigenschaften: JSON.parse(row.gewaehlte_eigenschaften),
    fertig: row.fertig === 1,
    korrigiert: row.korrigiert === 1,
  };
}

module.exports = router;
