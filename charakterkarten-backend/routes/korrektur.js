const express = require('express');
const db = require('../db/database');

const router = express.Router();

const KORREKTUR_PASSWORT = process.env.KORREKTUR_PASSWORT;

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

// GET /api/korrektur/stats — Zählwerte pro Standort (leichtgewichtig, für Sidebar)
router.get('/stats', authMiddleware, (req, res) => {
  const saison = req.query.saison || 'sommer_2026';
  const stats = db.prepare(`
    SELECT c.typ as camp_typ, c.standort as camp_standort, c.code as camp_code,
           COUNT(k.id) as gesamt, SUM(k.korrigiert) as korrigiert
    FROM kinder k
    JOIN camps c ON k.camp_id = c.id
    WHERE k.fertig = 1 AND k.saison = ?
    GROUP BY c.id
  `).all(saison);
  res.json(stats.map(s => ({ ...s, korrigiert: s.korrigiert ?? 0 })));
});

// GET /api/korrektur/kinder — fertige Karten, gefiltert nach typ+standort
router.get('/kinder', authMiddleware, (req, res) => {
  const saison = req.query.saison || 'sommer_2026';
  const { typ, standort } = req.query;

  let query = `
    SELECT k.*, c.typ as camp_typ, c.standort as camp_standort, c.code as camp_code
    FROM kinder k
    JOIN camps c ON k.camp_id = c.id
    WHERE k.fertig = 1 AND k.saison = ?
  `;
  const params = [saison];

  if (typ) { query += ' AND c.typ = ?'; params.push(typ); }
  if (standort) { query += ' AND c.standort = ?'; params.push(standort); }

  query += ' ORDER BY k.gruppe, k.name';

  res.json(db.prepare(query).all(...params).map(parseKind));
});

// PUT /api/korrektur/kinder/:id — Korrektur speichern
router.put('/kinder/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const kind = db.prepare('SELECT * FROM kinder WHERE id = ?').get(id);
  if (!kind) return res.status(404).json({ error: 'Nicht gefunden' });

  const { korrigiert, korrektur_notiz, text, text_markup, gewaehlte_eigenschaften } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE kinder SET korrigiert = ?, korrektur_notiz = ?, text = ?, text_markup = ?, gewaehlte_eigenschaften = ?, updated_at = ? WHERE id = ?
  `).run(
    korrigiert ? 1 : 0,
    korrektur_notiz ?? kind.korrektur_notiz,
    text ?? kind.text,
    text_markup ?? kind.text_markup ?? '',
    JSON.stringify(gewaehlte_eigenschaften ?? JSON.parse(kind.gewaehlte_eigenschaften)),
    now, id
  );

  res.json(parseKind(db.prepare('SELECT * FROM kinder WHERE id = ?').get(id)));
});

function safeJSON(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}

function parseKind(row) {
  return {
    ...row,
    scores: safeJSON(row.scores, {}),
    gewaehltEigenschaften: safeJSON(row.gewaehlte_eigenschaften, []),
    fertig: row.fertig === 1,
    korrigiert: row.korrigiert === 1,
  };
}

module.exports = router;
