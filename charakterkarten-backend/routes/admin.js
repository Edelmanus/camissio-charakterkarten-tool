const express = require('express');
const db = require('../db/database');

const router = express.Router();

const ADMIN_PASSWORT = process.env.ADMIN_PASSWORT;

function authMiddleware(req, res, next) {
  const pw = req.headers['x-admin-password'];
  if (pw !== ADMIN_PASSWORT) {
    return res.status(401).json({ error: 'Falsches Passwort' });
  }
  next();
}

// POST /api/admin/login — Passwort prüfen
router.post('/login', (req, res) => {
  const { passwort } = req.body;
  if (passwort === ADMIN_PASSWORT) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Falsches Passwort' });
  }
});

// GET /api/admin/fehler-log — Übersicht fehlgeschlagener Saves
router.get('/fehler-log', authMiddleware, (req, res) => {
  const rows = db.prepare(`
    SELECT f.id, f.kontext, f.meldung, f.created_at,
           k.name AS kind_name, k.gruppe,
           c.typ AS camp_typ, c.standort AS camp_standort
    FROM fehler_log f
    LEFT JOIN kinder k ON f.kind_id = k.id
    LEFT JOIN camps c ON k.camp_id = c.id
    ORDER BY f.created_at DESC
    LIMIT 300
  `).all();

  res.json(rows);
});

module.exports = router;
