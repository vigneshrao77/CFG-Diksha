const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const reportRoutes = require('./routes/reportRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/report', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'CFG-Diksha Backend API is running smoothly' });
});

// Central Error Handler
app.use(errorHandler);

// Connect MongoDB Atlas and start server
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI && MONGO_URI.includes('mongodb')) {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('Successfully connected to MongoDB Atlas DB');
    })
    .catch((err) => {
      console.warn('MongoDB Atlas connection warning (server will run with fallback storage):', err.message);
    });
} else {
  console.log('No MONGO_URI provided in .env, running backend with in-memory store');
}

app.listen(PORT, () => {
  console.log(`CFG-Diksha backend server running on port ${PORT}`);
});

module.exports = app;
