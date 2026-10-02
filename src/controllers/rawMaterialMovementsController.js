const pool = require('../config/db');

const VALID_TYPES = ['purchase', 'usage'];

// POST /raw-materials/:id/stock-movements
async function createMovement(req, res) {
  try {
    const { id: rawMaterialId } = req.params;
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

    const rm = await pool.query(
      `SELECT id FROM raw_materials WHERE id = $1 AND deleted_at IS NULL`,
      [rawMaterialId]
    );
    if (rm.rows.length === 0) {
      return res.status(404).json({ message: 'Raw material tidak ditemukan' });
    }

    const result = await pool.query(
      `INSERT INTO raw_material_movements (raw_material_id, batch_id, type, quantity, movement_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [rawMaterialId, batch_id || null, type, quantity, movement_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan di server', error: err.message });
  }
}

// GET /raw-materials/:id/stock-movements
async function listMovements(req, res) {
  try {
    const { id: rawMaterialId } = req.params;

    const result = await pool.query(
      `SELECT * FROM raw_material_movements
       WHERE raw_material_id = $1
       ORDER BY movement_date ASC, id ASC`,
      [rawMaterialId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan di server', error: err.message });
  }
}

// GET /raw-materials/:id/stock-balance
async function getStockBalance(req, res) {
  try {
    const { id: rawMaterialId } = req.params;

    const result = await pool.query(
      `SELECT
         COALESCE(SUM(quantity) FILTER (WHERE type = 'purchase'), 0) AS total_purchase,
         COALESCE(SUM(quantity) FILTER (WHERE type = 'usage'), 0) AS total_usage
       FROM raw_material_movements
       WHERE raw_material_id = $1`,
      [rawMaterialId]
    );

    const { total_purchase, total_usage } = result.rows[0];
    const balance = Number(total_purchase) - Number(total_usage);

    res.status(200).json({
      raw_material_id: Number(rawMaterialId),
      total_purchase: Number(total_purchase),
      total_usage: Number(total_usage),
      balance,
    });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan di server', error: err.message });
  }
}

module.exports = { createMovement, listMovements, getStockBalance };