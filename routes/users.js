const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// ✅ Fetch all usernames
router.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT DISTINCT username FROM users"); // No duplicates
        const usernames = result.rows.map(row => row.username);

        res.json({ usernames });
    } catch (err) {
        console.error("❌ Error fetching usernames:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
