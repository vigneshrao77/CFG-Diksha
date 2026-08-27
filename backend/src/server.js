require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const connectDB     = require('./config/db');
const teacherRoutes = require('./routes/teacherRoutes');
const authRoutes    = require('./routes/authRoutes');
const adminRoutes   = require('./routes/adminRoutes');
const { seedData }  = require('./scripts/seed');
const { seedAdminData } = require('./scripts/seedAdmin');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during development
    }
  },
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
    modules: ['admin', 'teacher', 'auth'],
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);

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

// ── Start ────────────────────────────────────────────────────
(async () => {
  await connectDB();
  try {
    await seedData();
  } catch (seedErr) {
    console.log('Teacher seed check skipped:', seedErr.message);
  }

  try {
    await seedAdminData();
  } catch (adminSeedErr) {
    console.log('Admin seed check skipped:', adminSeedErr.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Diksha API running on http://localhost:${PORT}`);
    console.log(`   Env: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   DB:  ${process.env.MONGODB_URI}`);
    console.log(`   Admin API:   http://localhost:${PORT}/api/admin/dashboard`);
    console.log(`   Teacher API: http://localhost:${PORT}/api/teacher`);
  });
})();
