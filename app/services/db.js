const mysql = require('mysql2/promise');
const path = require('path');

// Load .env locally. Render supplies its own environment variables.
require('dotenv').config({
  path: path.join(__dirname, '../../.env')
});

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3308),
  user: process.env.DB_USER || process.env.MYSQL_ROOT_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'sd2-db',

  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,

  // Enable SSL when connecting to Aiven.
  ...(process.env.DB_SSL === 'true' ? { ssl: { ca: process.env.DB_CA_CERT } } : {})
};

const pool = mysql.createPool(config);

async function query(sql, params = []) {
  const safeParams = params.map(p =>
    typeof p === 'undefined' ? null : p
  );

  try {
    const [rows] = await pool.execute(sql, safeParams);
    return rows;
  } catch (err) {
    console.error('SQL Execution Error:', err.message);
    throw err;
  }
}

pool.getConnection()
  .then(conn => {
    console.log('Database connected successfully!');
    conn.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
  });

module.exports = { query };