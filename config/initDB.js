require('dotenv').config();
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: "postgresql://postgres:iUUAGNwRyyctjiFulBXiAXZZWBoCZLqH@crossover.proxy.rlwy.net:32115/railway",
    ssl: { rejectUnauthorized: false }, // Required for cloud databases
});

console.log("➡️ Starting Database Initialization...");

const createTable = async () => {
    try {
        console.log("📡 Connecting to DB...");
        await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

        console.log("🔧 Creating users table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                username TEXT UNIQUE NOT NULL CHECK (username ~ '[A-Za-z]' AND username ~ '[0-9]'),
                google_id TEXT UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                age INTEGER,
                auth_code TEXT UNIQUE, -- Stores auth code for auto-login
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Users table created!");

        console.log("🔧 Creating folders_data table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS folders_data (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                folder_name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ Folders table created!");

        console.log("🔧 Creating youtube_notes table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS youtube_notes (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                youtube_link TEXT NOT NULL,
                note_pdf_link TEXT,
                folder_id UUID REFERENCES folders_data(id) ON DELETE CASCADE, -- Links to folders_data
                folder_name TEXT, -- Stores folder name for quick access
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("✅ YouTube Notes table created!");

        console.log("✅ Database initialized successfully!");
    } catch (err) {
        console.error("❌ Error initializing database:", err.message);
    } finally {
        await pool.end();
        console.log("🔌 Database connection closed.");
    }
};

createTable();
