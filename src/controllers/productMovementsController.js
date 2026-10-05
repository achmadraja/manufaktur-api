const pool = require('../config/db');

const VALID_TYPES = ['production_in', 'sale_out', 'refund_in', 'repair_out', 'repair_in'];

// POST /products/:id/product-movements
async function createMovement(req, res) {
  try {
    const { id: productId } = req.params;
    const { type, quantity, movement_date, batch_id } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({ message: 'Field "type" wajib diisi dan harus berupa teks' });
    }
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: `Field "type" harus salah satu dari: ${VALID_TYPES.join(', ')}` });
    }
    if (!quantity || typeof quantity !== 'number') {
      return res.status(400).json({ message: 'Field "quantity" wajib diisi dan harus berupa angka' });
    } else if (quantity <= 0) {
      return res.status(422).json({ message: 'Field "quantity" harus berupa angka positif' });
    }
    if (!movement_date || typeof movement_date !== 'string' || isNaN(Date.parse(movement_date))) {
      return res.status(400).json({ message: 'Field "movement_date" wajib diisi dengan format tanggal yang valid' });
    }

    const product = await pool.query(
      `SELECT id FROM products WHERE id = $1 AND deleted_at IS NULL`,
      [productId]
    );
    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    const result = await pool.query(
      `INSERT INTO product_movements (product_id, batch_id, type, quantity, movement_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [productId, batch_id || null, type, quantity, movement_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan di server', error: err.message });
  }
}

// GET /products/:id/product-movements
async function listMovements(req, res) {
  try {
    const { id: productId } = req.params;

    const result = await pool.query(
      `SELECT * FROM product_movements
       WHERE product_id = $1
       ORDER BY movement_date ASC, id ASC`,
      [productId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan di server', error: err.message });
  }
}

// GET /products/:id/stock-balance
async function getStockBalance(req, res) {
  try {
    const { id: productId } = req.params;

    const result = await pool.query(
      `SELECT
         COALESCE(SUM(quantity) FILTER (WHERE type = 'production_in'), 0) AS total_production,
         COALESCE(SUM(quantity) FILTER (WHERE type = 'sale_out'), 0) AS total_sale,
         COALESCE(SUM(quantity) FILTER (WHERE type = 'refund_in'), 0) AS total_refund,
         COALESCE(SUM(quantity) FILTER (WHERE type = 'repair_out'), 0) AS total_repair_out,
         COALESCE(SUM(quantity) FILTER (WHERE type = 'repair_in'), 0) AS total_repair_in
       FROM product_movements
       WHERE product_id = $1`,
      [productId]
    );

    const row = result.rows[0];
    const total_production = Number(row.total_production);
    const total_sale = Number(row.total_sale);
    const total_refund = Number(row.total_refund);
    const total_repair_out = Number(row.total_repair_out);
    const total_repair_in = Number(row.total_repair_in);

    const outstanding_repair = total_repair_out - total_repair_in;
    const current_stock = total_production - total_sale + total_refund - total_repair_out + total_repair_in;

    res.status(200).json({
      product_id: Number(productId),
      total_production,
      total_sale,
      total_refund,
      total_repair_out,
      total_repair_in,
      outstanding_repair,
      current_stock,
    });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan di server', error: err.message });
  }
}

module.exports = { createMovement, listMovements, getStockBalance };