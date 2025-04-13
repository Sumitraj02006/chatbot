// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',          // ✅ change if you use a different MySQL user
    password: 'sumit@123',          // ✅ set if your MySQL user has a password
    database: 'voice_assistant'  // ✅ make sure this DB exists
});

connection.connect(err => {
    if (err) {
        console.error('❌ MySQL connection error:', err);
    } else {
        console.log('✅ Connected to MySQL');
    }
});

module.exports = connection;
