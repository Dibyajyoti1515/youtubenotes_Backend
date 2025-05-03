const express = require('express');
const cors = require("cors");
const router = express.Router();
const path = require("path")
//const methodOverride = require('method-override');
//app.use(methodOverride("_method"));
const app = express();
app.use(express.urlencoded({extended: true}))
require("./config/passport");


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

// Express middleware to handle COOP and COEP headers
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");  // Allows cross-origin interaction from the same origin
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");  // Ensures that the content is not blocked by cross-origin policies
    next();
  });
  
app.listen(port, () => {
    console.log(`Server started on ${port}`);
});
