const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userQuery.rows.length === 0) {
            return res.status(400).json({ error: "User not found" });
        }

        const user = userQuery.rows[0];

        // Validate password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Fetch user details
        const userData = await pool.query(`
            SELECT id, username, email, name, age, auth_code 
            FROM users WHERE email = $1
        `, [email]);

        // Fetch YouTube notes for the user
        const notesData = await pool.query(`
            SELECT * FROM youtube_notes WHERE user_id = $1
        `, [user.id]);

        // Response with user data and YouTube notes
        res.status(200).json({
            auth_code: userData.rows[0].auth_code, // Fetch actual auth_code
            message: "Login successful",
            user: userData.rows[0],
            notes: notesData.rows.length ? notesData.rows : [] // Returns empty array if no notes exist
        });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
