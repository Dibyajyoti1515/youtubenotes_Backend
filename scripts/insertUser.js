const pool = require("../config/db");

const insertUser = async () => {
    try {
        const query = `
            INSERT INTO users (username, google_id, email, password, name, age)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const values = ["user123", null, "user@example.com", "hashedpassword", "John Doe", 25];

        const res = await pool.query(query, values);
        console.log("✅ User added:", res.rows[0]);
    } catch (err) {
        console.error("❌ Error inserting user:", err.message);
    } finally {
        pool.end();
    }
};

insertUser();
