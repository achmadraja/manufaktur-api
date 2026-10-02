const pool = require('../config/db');

// GET /raw-materials
async function listRawMaterials(req, res) {
  try {
    const companyId = 'PT_A'; 

    const result = await pool.query(
      `SELECT * FROM raw_materials
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

// POST /raw-materials
async function createRawMaterial(req, res) {
  try {
    const { name, unit, attributes } = req.body;
    const companyId = 'PT_A'; 
 
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Field "name" wajib diisi dan harus berupa teks' });
    }
    if (!unit || typeof unit !== 'string') {
      return res.status(400).json({ message: 'Field "unit" wajib diisi dan harus berupa teks' });
    }
    if (attributes !== undefined && (typeof attributes !== 'object' || Array.isArray(attributes))) {
      return res.status(400).json({ message: 'Field "attributes" harus berupa objek JSON' });
    }
 
    const result = await pool.query(
      `INSERT INTO raw_materials (company_id, name, unit, attributes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [companyId, name, unit, attributes || {}]
    );
 
   
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan di server', error: err.message });
  }
}

// PATCH /raw-materials/:id
async function updateRawMaterial(req, res) {
  try {
    const { id } = req.params;
    const { name, unit, attributes } = req.body;
    const companyId = 'PT_A';
 
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({ message: 'Field "name" harus berupa teks dan tidak boleh kosong' });
    }
    if (unit !== undefined && (typeof unit !== 'string' || unit.trim() === '')) {
      return res.status(400).json({ message: 'Field "unit" harus berupa teks dan tidak boleh kosong' });
    }
    if (attributes !== undefined && (typeof attributes !== 'object' || Array.isArray(attributes))) {
      return res.status(400).json({ message: 'Field "attributes" harus berupa objek JSON' });
    }
 
    const result = await pool.query(
      `UPDATE raw_materials
       SET name = COALESCE($1, name),
           unit = COALESCE($2, unit),
           attributes = COALESCE($3, attributes)
       WHERE id = $4
         AND company_id = $5
         AND deleted_at IS NULL
       RETURNING *`,
      [name ?? null, unit ?? null, attributes ?? null, id, companyId]
    );
 
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
 
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan di server', error: err.message });
  }
}

// DELETE /raw-materials/:id  (soft delete)
async function softDeleteRawMaterial(req, res) {
  try {
    const { id } = req.params;
    const companyId = 'PT_A'; 
 
    const result = await pool.query(
      `UPDATE raw_materials
       SET deleted_at = NOW()
       WHERE id = $1
         AND company_id = $2
         AND deleted_at IS NULL
       RETURNING id`,
      [id, companyId]
    );
 
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
 
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan di server', error: err.message });
  }
}
 
module.exports = { listRawMaterials, createRawMaterial, updateRawMaterial, softDeleteRawMaterial };