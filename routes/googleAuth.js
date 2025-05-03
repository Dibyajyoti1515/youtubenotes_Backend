// // const express = require("express");
// // const router = express.Router();
// // const passport = require("passport");
// // const cors = require('cors');


// // router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// // const frontendUrl = 'http://localhost:5173';

// // router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
// //   // Handle login success
// //   res.redirect(`${process.env.FRONTEND_URL}/login?auth_code=${req.user.auth_code}`);
// // });

// // module.exports = router;

// signin.js
const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const pool = require("../config/db");
const passport = require("../config//passport");  // Import passport configuration
const router = express.Router();

// Route to handle Google Login
router.post("/google", async (req, res) => {
  console.log("Google Login Request:", req.body);
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    // Verify the token with Google OAuth2 tokeninfo endpoint
    const tokenInfo = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
    );

    
    if (tokenInfo.data.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json({ error: "Token audience mismatch" });
    }

    console.log(tokenInfo);
    const { sub, name, email } = tokenInfo.data;

    
    let userRes = await pool.query(
      "SELECT * FROM users WHERE google_id = $1 OR email = $2",
      [sub, email]
    );

    if (userRes.rows.length === 0) {

      const authCode = crypto.randomBytes(16).toString("hex");
      const newUser = await pool.query(
        `INSERT INTO users (google_id, email, name, auth_code)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [sub, email, name, authCode]
      );
      console.log("New User Created:", newUser.rows[0]);
      return res.json({ user: newUser.rows[0] });
    }

    res.json({ user: userRes.rows[0] });
  } catch (error) {
    console.error("Token Verification Error:", error);
    return res.status(500).json({ error: "Failed to verify token" });
  }
});

module.exports = router;
