const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  const token = header.slice('Bearer '.length);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa' });
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    const permissions = (req.user && req.user.permissions) || [];

    if (!permissions.includes(permission)) {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk aksi ini' });
    }
    next();
  };
}

module.exports = { authenticate, requirePermission };