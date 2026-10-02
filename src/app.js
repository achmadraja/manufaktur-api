const express = require('express');
const pool = require('./config/db');
const productsRoutes = require('./routes/productsRoutes');
const rawMaterialsRoutes = require('./routes/rawMaterialsRoutes');
const app = express();

app.use(express.json());

app.use('/products', productsRoutes);
app.use('/raw-materials', rawMaterialsRoutes);

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: err.message });
  }
});

module.exports = app;