const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// POST /auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Field "email" dan "password" wajib diisi' });
    }
    
    const userResult = await pool.query(
      `SELECT id, email, password_hash, role, permissions
       FROM users
       WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );
    const user = userResult.rows[0];

    const passwordOk = user ? await bcrypt.compare(password, user.password_hash) : false;

    if (!passwordOk) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const companyResult = await pool.query(
      `SELECT company_id FROM user_companies WHERE user_id = $1`,
      [user.id]
    );
    const companyIds = companyResult.rows.map((r) => r.company_id);

    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        company_ids: companyIds,
        role: user.role,
        permissions: user.permissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan di server', error: err.message });
  }
}

module.exports = { login };