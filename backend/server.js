import 'dotenv/config';
import express    from 'express';
import mongoose   from 'mongoose';
import cors       from 'cors';
import helmet     from 'helmet';
import morgan     from 'morgan';
import rateLimit  from 'express-rate-limit';

import authRoutes    from './routes/auth.js';
import articleRoutes from './routes/articles.js';

const app = express();

/* ─── Security middleware ─────────────────────────────────── */
app.use(helmet());                          // sets secure HTTP headers
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Global rate limit — 200 req / 15 min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, slow down.' }
}));

// Auth routes stricter — 20 req / 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts.' }
});

app.use(express.json({ limit: '10kb' }));   // block huge payloads
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'tiny'));

/* ─── Database ────────────────────────────────────────────── */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅  MongoDB connected'))
  .catch(err => { console.error('❌  MongoDB error:', err.message); process.exit(1); });

/* ─── Routes ──────────────────────────────────────────────── */
app.use('/api/auth',     authLimiter, authRoutes);
app.use('/api/articles', articleRoutes);
app.get('/api/health', (_req, res) => res.json({ ok: true }));

/* ─── 404 & error handler ─────────────────────────────────── */
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀  API running → http://localhost:${PORT}`));
