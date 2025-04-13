// server.js
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); // Express ka built-in JSON parser

// Health check route (optional)
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// ✅ GET route to fetch all tasks
app.get('/api/tasks', (req, res) => {
    const sql = 'SELECT * FROM tasks';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Error fetching tasks:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(results);
        }
    });
});

// ✅ POST route to save speech content
app.post('/api/save-speech', (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ message: "No content provided" });
    }

    const query = "INSERT INTO speech_records (content) VALUES (?)";
    db.query(query, [content], (err, result) => {
        if (err) {
            console.error('❌ Error saving speech:', err);
            return res.status(500).json({ message: "Database error" });
        }
        res.status(201).json({ message: "Speech saved", id: result.insertId });
    });
});

// ✅ POST route for chatbot interaction
app.post('/chat', (req, res) => {
    const userMessage = req.body.message?.toLowerCase() || '';

    if (userMessage.includes('task') || userMessage.includes('kaam')) {
        const sql = 'SELECT * FROM tasks';
        db.query(sql, (err, results) => {
            if (err) {
                res.json({ reply: 'Database error occurred.' });
            } else {
                if (results.length === 0) {
                    res.json({ reply: 'Koi task nahi mila.' });
                } else {
                    let reply = 'Yeh rahe aapke tasks:\n';
                    results.forEach((task, index) => {
                        reply += `${index + 1}. ${task.task_name} (${task.status})\n`;
                    });
                    res.json({ reply });
                }
            }
        });
    } else {
        res.json({ reply: 'Main samajh nahi paya. Aap phir se poochein.' });
    }
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// ✅ Register user
app.post('/api/register', (req, res) => {
    const { full_name, email, username, password, confirm_password } = req.body;

    if (!full_name || !email || !username || !password || !confirm_password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirm_password) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    const sql = 'INSERT INTO users (full_name, email, username, password) VALUES (?, ?, ?, ?)';
    db.query(sql, [full_name, email, username, password], (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({ message: 'Database error or Username already taken' });
        }
        res.status(201).json({ message: 'User registered successfully' });
    });
});

// ✅ Login user
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password' });
    }

    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 1) {
            res.json({ message: 'Login successful', user: results[0] });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});
