const bcrypt = require('bcrypt');
const pool = require('../src/config/db');
 
const ALL_PERMISSIONS = [
  'product:create', 'product:read', 'product:update', 'product:delete',
  'raw-material:create', 'raw-material:read', 'raw-material:update', 'raw-material:delete',
  'stock-movements:create', 'stock-movements:read',
  'batch:create', 'batch:read', 'batch:update', 'batch:delete',
  'reports:read',
];
 
const ROLE_PERMISSIONS = {
  staff_produksi: [
    'product:read',
    'raw-material:read',
    'stock-movements:create', 'stock-movements:read',
    'batch:create', 'batch:read', 'batch:update',
  ],
  admin: ALL_PERMISSIONS,
  owner: ALL_PERMISSIONS,
};
 
async function main() {
  const [email, password, role, companyArg] = process.argv.slice(2);
 
  if (!email || !password || !role || !companyArg) {
    console.error('Pemakaian: node scripts/createUser.js <email> <password> <role> <company_ids dipisah koma>');
    process.exit(1);
  }
  if (!ROLE_PERMISSIONS[role]) {
    console.error(`Role tidak dikenal. Pilihan: ${Object.keys(ROLE_PERMISSIONS).join(', ')}`);
    process.exit(1);
  }
 
  const companyIds = companyArg.split(',').map((c) => c.trim());
 
  const passwordHash = await bcrypt.hash(password, 10);
 
  const userResult = await pool.query(
    `INSERT INTO users (email, password_hash, role, permissions)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [email, passwordHash, role, ROLE_PERMISSIONS[role]]
  );
  const userId = userResult.rows[0].id;
 
  for (const companyId of companyIds) {
    await pool.query(
      `INSERT INTO user_companies (user_id, company_id) VALUES ($1, $2)`,
      [userId, companyId]
    );
  }
 
  console.log(`User dibuat: id=${userId}, email=${email}, role=${role}, companies=${companyIds.join(',')}`);
  await pool.end();
}
 
main().catch(async (err) => {
  console.error('Gagal membuat user:', err.message);
  await pool.end();
  process.exit(1);
});