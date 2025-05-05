const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../config/supabase');
const pool = require('../config/db');

// Set up multer for file upload (store in memory for now)
const upload = multer({ storage: multer.memoryStorage() });

// POST /ytnotes/pdf/upload
router.post('/pdf/upload', upload.single('file'), async (req, res) => {
  try {
    const { youtube_link, user_id, folder_id, folder_name } = req.body;
    const file = req.file;

    if (!file || !youtube_link || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Upload to Supabase Storage (bucket: "pdfs")
    const { data, error } = await supabase
      .storage
      .from('notes')
      .upload(`notes/${file.originalname}`, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: 'Upload failed', details: error.message });
    }

    // Get public URL of the uploaded PDF
    const publicUrl = supabase
      .storage
      .from('notes')
      .getPublicUrl(`notes/${file.originalname}`)
      .data
      .publicUrl;

    // Save data to PostgreSQL (youtube_notes table)
    let defult_folder_id = 'e1deca64-cab7-4978-91e4-c8495f7b6bae';
    const result = await pool.query(
      `INSERT INTO youtube_notes (user_id, youtube_link, note_pdf_link, folder_id, folder_name)
       VALUES ($1, $2, $3, COALESCE($4, uuid_generate_v4()), COALESCE($5, 'General')) RETURNING *`,
      [user_id, youtube_link, publicUrl, folder_id || defult_folder_id, folder_name || 'General'] // Default folder_name to 'General'
    );

    return res.status(200).json({
      message: 'PDF uploaded and note saved',
      note: result.rows[0],
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
