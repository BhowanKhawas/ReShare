/**
 * ReShare - Main Application Entry Point
 * Folder Location: /app/app.js
 */

const path = require("path");
const express = require("express");
const app = express();

// 1. ENVIRONMENT CONFIGURATION
// Since .env is in the root (one level up), we point the path there
require("dotenv").config({ path: path.join(__dirname, '../.env') });

// 2. IMPORTS (The 'Model' and 'Service' layers)
const db = require('./services/db'); 
const User = require('./models/User'); // Your OOP User Model
const authRoutes = require('./routes/auth'); // Your Auth Controller

// 3. MIDDLEWARE SETUP
// Essential for capturing data from PUG forms (Session 8 Method)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 4. VIEW ENGINE SETUP (The 'View' layer)
app.set('view engine', 'pug');

// Fix: This ensures Docker finds the views folder inside /app
app.set('views', path.join(__dirname, 'views')); 

// Serve static files (Logo, CSS) from the /app/public folder
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// FRONT-END PAGE ROUTES (Views)
// ==========================================

app.get("/", (req, res) => res.render("login"));
app.get("/login", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));

/**
 * SINGLE USER PROFILE VIEW
 * Displays data for a specific user ID
 */
app.get("/user/:id", async function (req, res) {
    const userId = req.params.id;
    const sql = "SELECT * FROM USERS WHERE user_id = ?";
    
    try {
        const results = await db.query(sql, [userId]);
        if (results.length > 0) {
            // Renders 'user.pug' and passes the database object
            res.render('user', { user: results[0] }); 
        } else {
            res.status(404).send("User not found in ReShare.");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error accessing database.");
    }
});

// ==========================================
// BACK-END LOGIC ROUTES (Controllers)
// ==========================================

// Mount authentication routes (Login/Signup logic)
app.use('/auth', authRoutes); 

/**
 * POST ROUTE: UPDATE USER NAME
 * Captures user input and updates the Model without changing schema
 */
app.post("/update-user-name", async function (req, res) {
    // 1. Capture data from the form
    const { user_id, newName } = req.body; 
    
    // 2. Initialize the OOP Model
    const userModel = new User(user_id);

    try {
        // 3. Tell the Model to save the data to the USERS table
        await userModel.updateName(newName); 
        
        // 4. Redirect back to the profile to show the change
        res.redirect(`/user/${user_id}`); 
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to update name.");
    }
});

// ==========================================
// API / DATABASE TEST ROUTES
// ==========================================

app.get("/LISTINGS", function(req, res) {
    db.query('SELECT * FROM LISTINGS')
        .then(results => res.json(results))
        .catch(err => res.status(500).send("Database connection failed.")); 
});

app.get("/USERS", function(req, res) {
    db.query('SELECT * FROM USERS')
        .then(results => res.json(results))
        .catch(err => res.status(500).send("Database connection failed.")); 
});

// ==========================================
// START SERVER
// ==========================================
const PORT = 3000;
app.listen(PORT, function(){
    console.log(`ReShare Server active at http://127.0.0.1:${PORT}/`);
});