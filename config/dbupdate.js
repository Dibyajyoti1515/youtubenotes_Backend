require('dotenv').config();
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:iUUAGNwRyyctjiFulBXiAXZZWBoCZLqH@crossover.proxy.rlwy.net:32115/railway",
    ssl: { rejectUnauthorized: false },
});

console.log("➡️ Starting Database Initialization...");

(async () => {
    try {
        await pool.query(`
            DELETE FROM users CASCADE;
            DELETE FROM youtube_notes CASCADE;
        `);
        console.log("✅ Users table cleared!");
        console.log("✅ Database schema updated successfully!");
    } catch (err) {
        console.error("❌ Failed to update database schema:", err);
    } finally {
        await pool.end();
    }
})();
