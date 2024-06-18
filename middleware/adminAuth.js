const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.ADMIN_SECRET_KEY;

function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.admin = decoded;
    next();
  });
}

module.exports = adminAuth;
