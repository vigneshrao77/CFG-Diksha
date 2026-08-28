const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Check for Authorization header or x-student-id header for development/demo
  const authHeader = req.headers.authorization;
  const devStudentId = req.headers['x-student-id'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cfg_diksha_secret_jwt_key_2026');
      req.user = decoded;
      return next();
    } catch (err) {
      console.warn('JWT verification failed, checking fallback student identity:', err.message);
    }
  }

  // Fallback to dev header or default authenticated demo student ST001
  const studentId = devStudentId || 'ST001';
  req.user = {
    studentId: studentId,
    role: 'student',
    name: 'Sahasra V.'
  };

  next();
};

module.exports = authMiddleware;
