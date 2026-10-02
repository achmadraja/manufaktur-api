require('dotenv').config();
const { Pool, types } = require('pg');

types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle DB client', err);
});

module.exports = pool;