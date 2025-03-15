require('dotenv').config();
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:subham04@localhost:5432/youtube_notes_app",
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false, 
    connectionTimeoutMillis: 10000,
});

pool.connect()
    .then(() => console.log("✅ Database connected successfully!"))
    .catch(err => console.error("❌ Database connection error:", err));

module.exports = pool;
