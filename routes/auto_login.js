const express = require("express");
const pool = require("../config/db");
const router = express.Router();
router.get("/auto-login", async (req, res) => {
    const authCode = req.cookies.auth_code;
    console.log(req.cookies);
    console.log("Auto-login auth code:", authCode);
  
    if (!authCode) return res.status(401).json({ error: "No auth code" });
  
    try {
      const result = await pool.query("SELECT * FROM users WHERE auth_code = $1", [authCode]);
      if (result.rows.length === 0) return res.status(401).json({ error: "Invalid auth code" });
  
      res.json({ user: result.rows[0] });
    } catch (err) {
      console.error("Auto-login error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;