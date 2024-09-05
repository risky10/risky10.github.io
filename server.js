const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('./database/highscores.db');

app.use(express.static('public')); // Serve static files (like HTML, CSS, JS)
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data

// Route for registering new users
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Insert user data into the users table
    const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
    db.run(query, [username, password], function (err) {
        if (err) {
            return res.status(500).send('Error registering user');
        }
        res.redirect('/index'); // Redirect to login after successful registration
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});