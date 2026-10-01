const pool = require('../config/db');

// GET /products
async function listProducts(req, res) {
  try {
    const companyId = 'PT_A'; 

    const result = await pool.query(
      `SELECT * FROM products
       WHERE company_id = $1
         AND deleted_at IS NULL
       ORDER BY id ASC`,
      [companyId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan di server', error: err.message });
  }
}

module.exports = { listProducts };