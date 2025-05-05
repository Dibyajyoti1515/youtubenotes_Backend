const express = require('express');
const router = express.Router();
const pool = require("../config/db");
const supabase = require('../config/supabase');

// DELETE /notes/:id
router.delete('/notes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Get note details before deletion
    const noteQuery = await pool.query(
      `SELECT * FROM youtube_notes WHERE id = $1`,
      [id]
    );

    if (noteQuery.rowCount === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    const note = noteQuery.rows[0];
    const userId = note.user_id;

    // 2. Extract file name from Supabase public URL
    const publicUrl = note.note_pdf_link;
    const fileName = publicUrl.split("/notes/")[1];

    if (!fileName) {
      return res.status(400).json({ error: "Invalid file URL format" });
    }

    // 3. Delete PDF from Supabase storage
    const { error: deleteError } = await supabase.storage
      .from('notes')
      .remove([`notes/${fileName}`]);

    if (deleteError) {
      console.error("Failed to delete file from Supabase:", deleteError.message);
      return res.status(500).json({ error: "File deletion failed", details: deleteError.message });
    }

    // 4. Delete note from database
    const deleteNote = await pool.query(
      `DELETE FROM youtube_notes WHERE id = $1 RETURNING *`,
      [id]
    );

    // 5. Fetch updated notes for user
    const updatedNotes = await pool.query(
      `SELECT * FROM youtube_notes WHERE user_id = $1`,
      [userId]
    );

    // 6. Get user info
    const userQuery = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [userId]
    );

    const user = userQuery.rows[0];

    // ✅ Return success response
    res.status(200).json({
      message: "Note and PDF deleted successfully",
      deleted_note: deleteNote.rows[0],
      auth_code: user.auth_code,
      user: user,
      notes: updatedNotes.rows
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
