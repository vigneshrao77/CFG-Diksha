require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const connectDB     = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const adminRoutes   = require('./routes/adminRoutes');
let authRoutes;
try { authRoutes = require('./routes/authRoutes'); } catch (e) {}
let reportRoutes;
try { reportRoutes = require('./routes/reportRoutes'); } catch (e) {}

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

// Support up to 50mb payloads for audio base64 voice recordings
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
    modules: ['student', 'admin', 'teacher', 'auth', 'report'],
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ───────────────────────────────────────────────────
if (authRoutes) app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
if (reportRoutes) app.use('/api/report', reportRoutes);

// ── Error handler ────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Error]', err);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

// ── Start ────────────────────────────────────────────────────
(async () => {
  try {
    await connectDB();
  } catch (dbErr) {
    console.warn('DB connection initial note:', dbErr.message);
  }

  try {
    const { seedData } = require('./scripts/seed');
    if (seedData) await seedData();
  } catch (seedErr) {}

  try {
    const { seedAdminData } = require('./scripts/seedAdmin');
    if (seedAdminData) await seedAdminData();
  } catch (adminSeedErr) {}

  app.listen(PORT, () => {
    console.log(`🚀 Diksha API running on http://localhost:${PORT}`);
    console.log(`   Env: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Student API: http://localhost:${PORT}/api/student/profile`);
    console.log(`   Teacher API: http://localhost:${PORT}/api/teacher`);
    console.log(`   Admin API:   http://localhost:${PORT}/api/admin/dashboard`);
  });
})();

module.exports = app;
