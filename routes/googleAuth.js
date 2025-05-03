const express = require("express");
const router = express.Router();
const passport = require("passport");

// Start Google OAuth flow
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Handle Google callback
router.get("/google/callback", passport.authenticate("google", { session: false }), (req, res) => {
  const user = req.user;
  return res.redirect(`${process.env.FRONTEND_URL}/login?auth_code=${user.auth_code}`);
});

module.exports = router;
