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

// Sperren gegen gleichzeitige Bearbeitung derselben Karte — rein in-memory,
// da einzelner PM2-Prozess. Anonym: nur clientId (pro Browser-Tab erzeugt),
// kein Name. Läuft automatisch nach LOCK_DAUER_MS ab, wenn kein Heartbeat kommt.
const LOCK_DAUER_MS = 15 * 60 * 1000;
const sperren = new Map(); // kindId -> { clientId, laeuftAb }

function sperreAktiv(id) {
  const s = sperren.get(id);
  if (!s) return null;
  if (Date.now() > s.laeuftAb) { sperren.delete(id); return null; }
  return s;
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

// GET /api/korrektur/locks — alle aktuell aktiven Sperren (für Badge-Polling in der Kartenliste)
router.get('/locks', authMiddleware, (req, res) => {
  const aktiv = {};
  for (const id of sperren.keys()) {
    const s = sperreAktiv(id);
    if (s) aktiv[id] = s.laeuftAb;
  }
  res.json(aktiv);
});

// POST /api/korrektur/kinder/:id/lock — Karte sperren (Öffnen) oder Sperre erneuern (Heartbeat)
router.post('/kinder/:id/lock', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { clientId, force } = req.body;
  if (!clientId) return res.status(400).json({ error: 'clientId fehlt' });

  const bestehend = sperreAktiv(id);
  if (bestehend && bestehend.clientId !== clientId && !force) {
    return res.status(409).json({ error: 'Karte wird bereits bearbeitet', laeuftAb: bestehend.laeuftAb });
  }

  const laeuftAb = Date.now() + LOCK_DAUER_MS;
  sperren.set(id, { clientId, laeuftAb });
  res.json({ laeuftAb });
});

// DELETE /api/korrektur/kinder/:id/lock — Sperre freigeben (nur eigene)
router.delete('/kinder/:id/lock', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { clientId } = req.body;
  const bestehend = sperren.get(id);
  if (bestehend && bestehend.clientId === clientId) {
    sperren.delete(id);
  }
  res.json({ ok: true });
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
