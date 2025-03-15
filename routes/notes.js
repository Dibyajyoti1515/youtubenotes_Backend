const express = require('express');
const router = express.Router();
const pool = require("../config/db");

router.post('/notes', async (req, res) => {
    const { user_id, youtube_link, note_pdf_link, folder_id, folder_name } = req.body;

    try {
        // 1️⃣ Insert Note into `youtube_notes`
        const insertNoteQuery = `
            INSERT INTO youtube_notes (user_id, youtube_link, note_pdf_link, folder_id, folder_name)
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;
        const values = [user_id, youtube_link, note_pdf_link, folder_id || null, folder_name || null];
        const addedNote = await pool.query(insertNoteQuery, values);

        // 2️⃣ Fetch User Data with `auth_code`
        const userQuery = await pool.query(`
            SELECT id, username, email, name, age, auth_code FROM users WHERE id = $1
        `, [user_id]);

        if (userQuery.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // 3️⃣ Fetch All Notes for the User
        const notesQuery = await pool.query(`
            SELECT * FROM youtube_notes WHERE user_id = $1
        `, [user_id]);

        // ✅ Response with user details & notes
        res.status(201).json({
            auth_code: userQuery.rows[0].auth_code, // Fetch actual auth_code
            message: "Note added successfully!",
            user: userQuery.rows[0],
            notes: notesQuery.rows.length ? notesQuery.rows : [],
            added_note: addedNote.rows[0] // Return newly added note
        });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
