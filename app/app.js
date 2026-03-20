/**
 * ReShare - Main Application Entry Point
 * Folder Location: /app/app.js
 */

const path = require("path");
const express = require("express");
const app = express();

// Set the sessions
var session = require('express-session');
app.use(session({
  secret: 'secretkeysdfjsflyoifasd',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Global Middleware to expose session data to all Pug views
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// 1. ENVIRONMENT CONFIGURATION
// Since .env is in the root (one level up), we point the path there
require("dotenv").config({ path: path.join(__dirname, '../.env') });

// 2. IMPORTS (The 'Model' and 'Service' layers)
const db = require('./services/db'); 

const { User } = require('./models/user');

const Listing = require('./models/listing'); // [ADDED] Listing Model for MVC

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

// Create a route for root - /
app.get("/", function(req, res) {
    console.log(req.session);
    if (req.session.uid) {
		res.render("index");
	} else {
		res.redirect("/login");
	}
	res.end();
});

app.get("/login", function(req, res){
    console.log(req.session);
    res.render("login");
});

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

    console.log("CURRENT SESSION:", req.session); // ADD THIS LINE
    try {
        const results = await db.query(sql, [userId]);
        if (results.length > 0) {
            // Renders 'user.pug' and passes the database object
            res.render('user', { user: results[0], session: req.session }); 
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
// AUTHENTICATION ROUTES
// ==========================================
app.get("/signup", async (req, res) => {
    try {
        const locations = await db.query("SELECT location_id, city, region FROM LOCATIONS");
        console.log("Locations loaded for signup:", locations);
        res.render("signup", { locations: locations });
    } catch (err) {
        console.error("Error loading locations:", err);
        res.status(500).send("Error loading signup page.");
    }
});

// POST: Handle Account Creation
app.post('/set-password', async (req, res) => {
    // Capture data from the form
    const { name, email, location, password } = req.body;
    
    // Initialize the Model with all captured fields (requires the updated User.js model)
    const user = new User(email, name, location);

    try {
        const uId = await user.getIdFromEmail();

        if (uId) {
            await user.setUserPassword(password);
            res.send('Password updated successfully for existing email.');
        } else {
            await user.addUser(password);
            res.redirect('/login'); 
        }
    } catch (err) {
        console.error(`Error while adding user:`, err.message);
        res.status(500).send('Server error during signup');
    }
});

// POST: Handle Login Verification
app.post('/authenticate', async (req, res) => {
    const { email, password } = req.body; 
    const user = new User(email); 
    
    try {
        const uId = await user.getIdFromEmail();
        if (uId) {
            const match = await user.authenticate(password);
            if (match) {
                req.session.uid = uId;
                req.session.loggedIn = true;
                req.session.role = user.role;
                
                // Redirect to the user's profile page
                res.redirect('/user/' + uId);
            } else {
                res.send('Invalid password.');
            }
        } else {
            res.send('Invalid email.');
        }
    } catch (err) {
        console.error(`Auth Error: `, err.message);
        res.status(500).send("A server error occurred during login.");
    }
});


// Logout
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/login');
  });
  



// ==========================================
// START SERVER
// ==========================================
const PORT = 3000;
app.listen(PORT, function(){
    console.log(`ReShare Server active at http://127.0.0.1:${PORT}/`);
});