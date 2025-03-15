const express = require("express");
const app = express();
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/db");
const cors = require("cors");
app.use(cors());

router.use(express.urlencoded({ extended: true }));
router.use(express.json()); // To parse JSON request bodies

// Secret key for JWT (Store this in .env)
const JWT_SECRET = process.env.JWT_SECRET || "5330950fb48e9fbcc98a26cdd57c57d9939dbb1a76476b6bab87b31eeff78ade";

// Helper function to generate a secure authorization code
const generateAuthCode = () => {
    return crypto.randomBytes(16).toString("hex"); // 32-character random string
};

// 🚀 Signup Route
router.post("/signin", async (req, res) => {
    try {
        const { username, email, password, name, age } = req.body;
        console.log("User Data:", username, email, password, name, age);

        // 1️⃣ **Validation**
        if (!username || !email || !password || !name || !age) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        // Ensure username contains both letters & numbers
        if (!/[A-Za-z]/.test(username) || !/[0-9]/.test(username)) {
            return res.status(400).json({ error: "Username must contain letters and numbers!" });
        }

        // 2️⃣ **Check if user already exists**
        const userExists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Email already registered!" });
        }

        // 3️⃣ **Encrypt Password**
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4️⃣ **Generate Unique Authorization Code**
        const authCode = generateAuthCode();

        // 5️⃣ **Insert User into Database**
        const newUser = await pool.query(
            `INSERT INTO users (username, email, password, name, age, auth_code) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, name, age, auth_code`,
            [username, email, hashedPassword, name, age, authCode]
        );

        // 6️⃣ **Generate JWT Token**
        const token = jwt.sign({ userId: newUser.rows[0].id, email }, JWT_SECRET, { expiresIn: "7d" });

        // ✅ **Success Response**
        res.status(201).json({
            message: "Signup Successful!",
            user: newUser.rows[0],
            auth_code: authCode, // For auto-login feature
            token, // JWT Token for authentication
        });

    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ error: "Internal Server Error." });
    }
});

module.exports = router;
