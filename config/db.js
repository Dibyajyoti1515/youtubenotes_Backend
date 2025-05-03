require('dotenv').config();
const { Pool } = require("pg");
require('dotenv').config();


const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:iUUAGNwRyyctjiFulBXiAXZZWBoCZLqH@crossover.proxy.rlwy.net:32115/railway",
    ssl: { rejectUnauthorized: false },
});

pool.connect()
    .then(() => console.log("✅ Database connected successfully!"))
    .catch(err => console.error("❌ Database connection error:", err));

module.exports = pool;
