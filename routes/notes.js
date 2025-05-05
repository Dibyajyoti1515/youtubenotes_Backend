const express = require('express');
const router = express.Router();
const pool = require("../config/db");

router.post('/notes', async (req, res) => {
    const { user_id } = req.body;

    try {
        const notesQuery = await pool.query(`
            SELECT * FROM youtube_notes WHERE user_id = $1
        `, [user_id]); 

        res.status(201).json({
            notes: notesQuery.rows.length ? notesQuery.rows : []
        });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
