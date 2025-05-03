const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/google-auth", async (req, res) => {
  const { auth_code } = req.query;
  try {
    const userRes = await pool.query("SELECT * FROM users WHERE auth_code = $1", [auth_code]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      message: "Login successful",
      auth_code,
      user: userRes.rows[0],
      notes: [], // Later, add notes query
    });
  } catch (err) {
    console.error("Fetch User Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

