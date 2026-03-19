const mysql = require('mysql2/promise');
const path = require("path");

// 1. Load the .env from the root folder
require("dotenv").config({ path: path.join(__dirname, '../../.env') });

// 2. Database Configuration
const config = {
  db: {
    host: process.env.DB_CONTAINER || 'db',
    port: process.env.DB_PORT || 3306,
    user: process.env.MYSQL_ROOT_USER || 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE || 'sd2-db',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
  },
};

// 3. Create the Pool (Now it is defined!)
const pool = mysql.createPool(config.db);

// 4. Utility function for the Model to use
async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// 5. TEST THE CONNECTION (At the bottom, after pool is defined)
pool.getConnection()
    .then(conn => {
        console.log("✅ Database Connected successfully!");
        conn.release();
    })
    .catch(err => {
        console.log("❌ Database Connection Failed!");
        console.log("Error:", err.message);
    });

module.exports = { query };