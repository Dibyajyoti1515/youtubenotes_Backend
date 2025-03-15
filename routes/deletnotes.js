const express = require('express');
const router = express.Router();
const pool = require("../config/db");

router.delete('/notes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // 🛑 Delete note and return deleted row
        const deleteQuery = `DELETE FROM youtube_notes WHERE id = $1 RETURNING *`;
        const dataQuery = `SELECT * FROM youtube_notes WHERE id = $1`
        const dataQueryResult = await pool.query(dataQuery, [id]);
        const alldata_users = `SELECT * FROM users WHERE id = $1`
        const result = await pool.query(alldata_users, [dataQueryResult.rows[0].user_id]);

        const deleteResult = await pool.query(deleteQuery, [id]);
        const notesData = await pool.query(`
            SELECT * FROM youtube_notes WHERE user_id = $1
        `, [dataQueryResult.rows[0].user_id]);
        console.log(notesData,result.rows[0].id )
        // ❌ If no row was deleted, note doesn't exist
        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ error: "Note not found" });
        }

        // ✅ Successful deletion
        res.status(200).json({
            message: "Note deleted successfully",
            deleted_note: deleteResult.rows[0],
            auth_code: result.rows[0].auth_code, // Fetch actual auth_code
            message: "Login successful",
            user: result.rows[0],
            notes: notesData.rows.length ? notesData.rows : []
        });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Something went wrong while deleting the note." });
    }
});

module.exports = router;
