const express = require('express');
const db = require('../db/database');

const router = express.Router();

// POST /api/fehler-log — Client meldet einen endgültig fehlgeschlagenen Save
// (nach ausgeschöpften Retries). Bewusst ohne Auth, da der Gruppenleiter
// kein Admin-Passwort hat — best effort, wird nie dem Nutzer angezeigt.
// Zum Auslesen siehe routes/admin.js (GET /api/admin/fehler-log).
router.post('/', (req, res) => {
  const { kindId, kontext, meldung } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO fehler_log (kind_id, kontext, meldung, created_at) VALUES (?, ?, ?, ?)
  `).run(
    typeof kindId === 'string' ? kindId.slice(0, 100) : null,
    typeof kontext === 'string' ? kontext.slice(0, 200) : '',
    typeof meldung === 'string' ? meldung.slice(0, 500) : '',
    now
  );

  res.status(201).json({ ok: true });
});

module.exports = router;
