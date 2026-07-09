require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');

const campsRouter = require('./routes/camps');
const kinderRouter = require('./routes/kinder');
const korrekturRouter = require('./routes/korrektur');
const fehlerLogRouter = require('./routes/fehlerLog');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://charakterkarten.camissio.de',
];
app.use(cors({ origin: allowedOrigins }));

// Max 500 Requests pro Minute pro IP — bewusst großzügig, da Camp-WLANs
// oft mehrere Gruppenleiter hinter derselben öffentlichen IP haben (NAT)
// und das Limit sich dadurch de facto auf alle Aktiven an einem Standort verteilt.
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(express.json());

app.use('/api/camps', campsRouter);
app.use('/api/kinder', kinderRouter);
app.use('/api/korrektur', korrekturRouter);
app.use('/api/fehler-log', fehlerLogRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Charakterkarten-Backend läuft auf http://localhost:${PORT}`);
});
