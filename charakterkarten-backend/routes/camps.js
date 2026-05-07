const express = require('express');
const db = require('../db/database');

const router = express.Router();

// GET /api/camps — alle Camps, optional nach typ filtern
router.get('/', (req, res) => {
  const { typ } = req.query;
  const camps = typ
    ? db.prepare('SELECT * FROM camps WHERE typ = ? ORDER BY standort').all(typ)
    : db.prepare('SELECT * FROM camps ORDER BY typ, standort').all();
  res.json(camps);
});

// GET /api/camps/typen — verfügbare Camp-Typen
router.get('/typen', (req, res) => {
  const typen = db.prepare('SELECT DISTINCT typ FROM camps ORDER BY typ').all().map(r => r.typ);
  res.json(typen);
});

module.exports = router;
