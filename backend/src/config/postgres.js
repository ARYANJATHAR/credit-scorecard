const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDB() {
  const schemaPath = path.join(__dirname, '..', 'models', 'pg', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  await pool.query(sql);
  console.log('PostgreSQL schema initialized');
}

module.exports = { pool, initDB };
