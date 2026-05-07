const express = require('express');
const cors = require('cors');

const campsRouter = require('./routes/camps');
const kinderRouter = require('./routes/kinder');
const korrekturRouter = require('./routes/korrektur');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/camps', campsRouter);
app.use('/api/kinder', kinderRouter);
app.use('/api/korrektur', korrekturRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Charakterkarten-Backend läuft auf http://localhost:${PORT}`);
});
