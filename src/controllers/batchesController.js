const pool = require('../config/db');

// POST /batches
async function createBatch(req, res) {
  try {
    const { product_id, quantity } = req.body;
    const companyId = 'PT_A';

    if (!product_id || typeof product_id !== 'number') {
      return res.status(400).json({ message: 'Field "product_id" wajib diisi dan harus berupa angka' });
    }
    if (!quantity || typeof quantity !== 'number') {
      return res.status(400).json({ message: 'Field "quantity" wajib diisi dan harus berupa angka' });
    } else if (quantity <= 0) {
      return res.status(422).json({ message: 'Field "quantity" harus berupa angka positif' });
    }

    const productResult = await pool.query(
      `SELECT * FROM products WHERE id = $1 AND deleted_at IS NULL`,
      [product_id]
    );
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    const product = productResult.rows[0];

    const productSnapshot = product.attributes;

    const batchResult = await pool.query(
      `INSERT INTO batches (company_id, product_id, quantity, product_snapshot)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [companyId, product_id, quantity, productSnapshot]
    );

    res.status(201).json(batchResult.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan di server', error: err.message });
  }
}

// GET /batches
async function listBatches(req, res) {
  try {
    const companyId = 'PT_A'; 
    const result = await pool.query(
      `SELECT * FROM batches
       WHERE company_id = $1
         AND deleted_at IS NULL
       ORDER BY produced_at DESC`,
      [companyId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan di server', error: err.message });
  }
}

// GET /batches/:id
async function getBatch(req, res) {
  try {
    const { id } = req.params;
    const companyId = 'PT_A';

    const result = await pool.query(
      `SELECT * FROM batches
       WHERE id = $1
         AND company_id = $2
         AND deleted_at IS NULL`,
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Batch tidak ditemukan' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan di server', error: err.message });
  }
}

module.exports = { createBatch, listBatches, getBatch };