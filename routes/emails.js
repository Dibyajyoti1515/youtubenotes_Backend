const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// ✅ Fetch all emails
router.get("/emails", async (req, res) => {
    try {
        const result = await pool.query("SELECT DISTINCT email FROM users"); // No duplicates
        const emails = result.rows.map(row => row.email);

        res.json({ emails });
    } catch (err) {
        console.error("❌ Error fetching emails:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
