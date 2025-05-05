const express = require("express");
const crypto = require("crypto");
const pool = require("../config/db");
const router = express.Router();

router.get("/logout", async (req, res) => {
    const authCode = req.cookies.auth_code;
    console.log("Auth code from cookie:", authCode); // Debugging line
  
    if (!authCode) {
      return res.status(400).json({ error: "Auth code cookie not found" });
    }
  
    try {
      // Generate new auth code and invalidate old one
      const newAuthCode = crypto.randomBytes(16).toString("hex");
  
      await pool.query(
        "UPDATE users SET auth_code = $1 WHERE auth_code = $2",
        [newAuthCode, authCode]
      );
  
      // Clear cookie
      res.clearCookie("auth_code", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/", // Important: match the path used to set the cookie
      });
  
      return res.status(200).json({ message: "Logout successful" });
    } catch (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Logout failed" });
    }
  });
  

module.exports = router;  