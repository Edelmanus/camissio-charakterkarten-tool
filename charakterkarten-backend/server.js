require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');

const campsRouter = require('./routes/camps');
const kinderRouter = require('./routes/kinder');
const korrekturRouter = require('./routes/korrektur');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://charakterkarten.camissio.de',
];
app.use(cors({ origin: allowedOrigins }));

// Max 100 Requests pro Minute pro IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(express.json());

app.use('/api/camps', campsRouter);
app.use('/api/kinder', kinderRouter);
app.use('/api/korrektur', korrekturRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Charakterkarten-Backend läuft auf http://localhost:${PORT}`);
});
