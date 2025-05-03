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
            DO $$
            BEGIN
                -- Make password nullable
                BEGIN
                    ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
                EXCEPTION WHEN others THEN
                    RAISE NOTICE 'Password already nullable or column not found.';
                END;

                -- Make username nullable
                BEGIN
                    ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
                EXCEPTION WHEN others THEN
                    RAISE NOTICE 'Username already nullable or column not found.';
                END;

                -- Add google_id column
                BEGIN
                    ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
                EXCEPTION WHEN others THEN
                    RAISE NOTICE 'google_id already exists.';
                END;

                -- Add auth_code column
                BEGIN
                    ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_code TEXT UNIQUE;
                EXCEPTION WHEN others THEN
                    RAISE NOTICE 'auth_code already exists.';
                END;

                -- Optionally remove CHECK constraint on username (optional)
                BEGIN
                    ALTER TABLE users DROP CONSTRAINT users_username_check;
                EXCEPTION WHEN others THEN
                    RAISE NOTICE 'CHECK constraint not present.';
                END;
            END;
            $$;
        `);

        console.log("✅ Database schema updated successfully!");
    } catch (err) {
        console.error("❌ Failed to update database schema:", err);
    } finally {
        await pool.end();
    }
})();
