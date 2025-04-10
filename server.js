const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "sumit@123",
    database: "virtual_assistant"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected...");
});

// Register User
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) return res.status(500).send("Error: " + err.message);
        res.send("User registered successfully");
    });
});

// Login User
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).send("Error: " + err.message);

        if (results.length > 0) {
            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                res.send("Login successful");
            } else {
                res.status(401).send("Invalid password");
            }
        } else {
            res.status(404).send("User not found");
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
