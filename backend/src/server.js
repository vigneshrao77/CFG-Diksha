require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const teacherRoutes = require('./routes/teacherRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request logger (dev) ─────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    module: 'teacher',
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);

// ── 404 ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ── Error handler ────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Error]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const { seedData } = require('./scripts/seed');

// ── Start ────────────────────────────────────────────────────
(async () => {
  await connectDB();
  try {
    await seedData();
  } catch (seedErr) {
    console.log('Seed check skipped:', seedErr.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Diksha Teacher API running on http://localhost:${PORT}`);
    console.log(`   Env: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   DB:  ${process.env.MONGODB_URI || 'mongodb://localhost:27017/diksha_db'}`);
  });
})();
