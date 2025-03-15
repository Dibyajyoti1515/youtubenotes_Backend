const express = require('express');
const router = express.Router();
const path = require("path")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { error } = require('console');
const pool = require("../config/db");
const app = express();
app.use(express.urlencoded({extended: true}))

app.post('/ytnotes', (req, res) => {
    res.json("This side is prepare");
});