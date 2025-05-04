const express = require('express');
const cors = require("cors");
const router = express.Router();
const path = require("path")
//const methodOverride = require('method-override');
//app.use(methodOverride("_method"));
const app = express();
app.use(express.urlencoded({extended: true}))
require("./config/passport");

app.use(cors({
  origin: ["http://localhost:5173", "https://youtubenotemaker.vercel.app"], // your frontend URLs
  credentials: true,
}));



const pool = require("./config/db");
const loginrouts = require("./routes/login");
const signinrouts = require("./routes/signin");
const noterouts = require("./routes/notes");
const deletnotes = require("./routes/deletnotes");
const users = require("./routes/users");
const emails = require("./routes/emails");
const googleAuthRoutes = require("./routes/googleAuth");
const googleLoginRoutes = require("./routes/googlelogin");


const port = 8080;

app.use(cors());
app.use(express.json());
app.use("/ytnotes", loginrouts);
app.use("/ytnotes", signinrouts);
app.use("/ytnotes", noterouts);
app.use("/ytnotes",deletnotes);
app.use("/ytnotes",users);
app.use("/ytnotes",emails);
app.use("/ytnotes", googleAuthRoutes);
app.use("/ytnotes", googleLoginRoutes);

router.get("/auto-login", async (req, res) => {
  const authCode = req.cookies.auth_code;

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



app.use((req, res, next) => {
    const allowedOrigins = ["http://localhost:5173", "https://youtubenotemaker.vercel.app"];
    const origin = req.headers.origin;
  
    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
  
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  
    next();
  });
  
app.listen(port, () => {
    console.log(`Server started on ${port}`);
});
