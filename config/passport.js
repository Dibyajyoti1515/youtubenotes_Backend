const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("./db");
const passport = require("passport");
const crypto = require("crypto");
require('dotenv').config();  // Ensure this line is at the top of the file

console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);
console.log("GOOGLE_REDIRECT_URI:", process.env.GOOGLE_REDIRECT_URI);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails } = profile;
      const email = emails[0].value;

      try {
        let userRes = await pool.query("SELECT * FROM users WHERE google_id = $1 OR email = $2", [id, email]);

        if (userRes.rows.length === 0) {
          const authCode = crypto.randomBytes(16).toString("hex");
          const newUser = await pool.query(
            `INSERT INTO users (google_id, email, name, auth_code)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [id, email, displayName, authCode]
          );
          return done(null, newUser.rows[0]);
        }

        return done(null, userRes.rows[0]);
      } catch (err) {
        console.error("OAuth Error:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
