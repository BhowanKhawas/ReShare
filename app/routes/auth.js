// routes/auth.js
const express = require('express');
const router = express.Router();
// Go up one directory to find the services folder
const db = require('../services/db'); 

// ==========================================
// HANDLE LOGIN
// ==========================================
router.post("/login", function(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    
    const sql = 'SELECT * FROM USERS WHERE email = ?';
    
    db.query(sql, [email])
        .then(results => {
            if (results.length === 0) {
                return res.status(401).send("Invalid email or password."); 
            }

            const user = results[0];

            if (user.passwordHash === password || user.password === password) {
                // Success!
                res.send(`Welcome back, ${user.name}! You are now logged in.`);
            } else {
                res.status(401).send("Invalid email or password.");
            }
        })
        .catch(err => {
            console.error("Database Error during login:", err);
            res.status(500).send("An error occurred while trying to log in.");
        });
});

// ==========================================
// HANDLE SIGN UP
// ==========================================
router.post("/signup", function(req, res) {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const sql = 'INSERT INTO USERS (name, email, passwordHash) VALUES (?, ?, ?)';
    
    db.query(sql, [name, email, password])
        .then(results => {
            res.send(`Account created successfully for ${name}! You can now log in.`);
        })
        .catch(err => {
            console.error("Database Error during signup:", err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).send("An account with that email already exists.");
            }
            res.status(500).send("An error occurred while creating your account.");
        });
});

// Export the router so app.js can use it
module.exports = router;