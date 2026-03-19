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
const User = require('./models/user'); // Your OOP User Model
const Listing = require('./models/listing'); // [ADDED] Listing Model for MVC
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
 * [ADDED] LIST ITEM VIEW
 * Renders the form for users to post a new item
 */
app.get("/list-item", (req, res) => res.render("listing"));

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

/**
 * [ADDED] POST ROUTE: CREATE NEW LISTING
 * Captures the 'listing.pug' form data and uses the Model to save it
 */
app.post("/add-listing", async (req, res) => {
    try {
        // Capture data and pass to the Static Model Method
        await Listing.create(req.body);
        res.redirect("/LISTINGS"); // Redirect to the API test route to see your new data
    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving your listing.");
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