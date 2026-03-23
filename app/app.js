/**
 * ReShare - Main Application Entry Point
 * Folder Location: /app/app.js
 * Group Name: Inferno [cite: 5]
 * Description: community-based web application to reduce household waste [cite: 20]
 */

const path = require("path");
const express = require("express");
const app = express();

// --- SESSIONS & AUTHENTICATION SETUP ---
// Manages user login states using express-session [cite: 132, 155]
var session = require('express-session');
app.use(session({
  secret: 'secretkeysdfjsflyoifasd',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS [cite: 132]
}));

// Global Middleware: Automatic Role Verification
app.use(async (req, res, next) => {
    // 1. Maintain your temporary login for development
    req.session.uid = 11; 
    req.session.loggedIn = true;

    try {
        // 2. AUTOMATIC CHECK: Pull the real role from the DB for User 11
        const { User } = require('./models/user');
        const role = await User.getRole(req.session.uid);
        
        // 3. Assign the actual role from the DB to the session
        req.session.role = role; 
        
        // Expose to Pug templates
        res.locals.session = req.session;
        next();
    } catch (err) {
        console.error("Middleware Auth Error:", err);
        req.session.role = 'user'; // Safe fallback
        next();
    }
});

// 1. ENVIRONMENT CONFIGURATION
// Loads variables from .env to ensure identical configurations in Docker [cite: 53]
require("dotenv").config({ path: path.join(__dirname, '../.env') });

// 2. IMPORTS (The 'Model' and 'Service' layers)
// Models encapsulate data logic and MySQL schema enforcement [cite: 46-47]
const db = require('./services/db'); 
const { User } = require('./models/user');
const Listing = require('./models/listing'); 
const Browse = require('./models/browse');
const ItemDetail = require('./models/ItemDetail');
const Community = require('./models/Community');
const Category = require('./models/Category'); 
const Index = require('./models/Index');
const About = require('./models/About');
const Chat = require('./models/Chat'); 
const Inbox = require('./models/Inbox');
const Admin = require('./models/Admin');

/**
 * HOME PAGE ROUTE (Controller)
 * Fetches featured items (Exchanges & Sales) for the landing page grid [cite: 43]
 */
app.get("/", async (req, res) => {
    // 1. Security: If not logged in, go to login page
    if (!req.session.uid) {
        return res.redirect("/login");
    }

    try {
        // 2. Fetch only the items you want (assuming 'exchanges' are your free items)
        const exchanges = await Index.getRecentExchanges();
        
        // 3. Render and pass the data
        res.render("index", { 
            exchangeItems: exchanges,
            session: req.session 
        });
    } catch (err) {
        console.error("Home Route Error:", err.message);
        res.status(500).send("Error loading home page. Check if Index model functions exist.");
    }
});

// 3. MIDDLEWARE SETUP
// Essential for capturing data from PUG forms for processing [cite: 30-33]
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 4. VIEW ENGINE SETUP (The 'View' layer)
// PUG serves as the templating engine for ReShare [cite: 33, 45]
app.set('view engine', 'pug');

// This path configuration ensures compatibility within the Docker environment [cite: 53-54]
app.set('views', path.join(__dirname, 'views')); 

// Serve static files (Logo, CSS, Images) from the public folder [cite: 32]
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// FRONT-END PAGE ROUTES (View Controllers)
// ==========================================

/**
 * ROOT REDIRECT
 * Redirects guests to login and authenticated users to home [cite: 155, 172-174]
 */
app.get("/", function(req, res) {
    if (req.session.uid) {
        res.render("index");
    } else {
        res.redirect("/login");
    }
    res.end();
});

app.get("/login", function(req, res){
    res.render("login");
});

/**
 * CREATE LISTING VIEW
 * Renders the form for users to post a new community item [cite: 127, 149]
 */
app.get("/list-item", (req, res) => res.render("listing"));

/**
 * SINGLE USER PROFILE VIEW
 * Displays transparency and profile-based listing retrieval [cite: 51, 129]
 */
app.get("/user/:id", async function (req, res) {
    const userId = req.params.id;
    const sql = "SELECT * FROM USERS WHERE user_id = ?";

    try {
        const results = await db.query(sql, [userId]);
        if (results.length > 0) {
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
 * UPDATE USER LOGIC
 * Interacts with User Model to update persistent data [cite: 158]
 */
app.post("/update-user-name", async function (req, res) {
    const { user_id, newName } = req.body; 
    const userModel = new User(user_id);

    try {
        await userModel.updateName(newName); 
        res.redirect(`/user/${user_id}`); 
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to update name.");
    }
});

/**
 * ADD LISTING LOGIC
 * Saves new community items to the MySQL database [cite: 46, 127]
 */
app.post("/add-listing", async (req, res) => {
    try {
        await Listing.create(req.body);
        res.redirect("/LISTINGS"); 
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
// AUTHENTICATION ROUTES (Sprint 3 Focus)
// ==========================================

/**
 * SIGNUP VIEW
 * Loads community locations to help users mask their position [cite: 220, 767]
 */
app.get("/signup", async (req, res) => {
    try {
        const locations = await db.query("SELECT location_id, city, region FROM LOCATIONS");
        res.render("signup", { locations: locations });
    } catch (err) {
        console.error("Error loading locations:", err);
        res.status(500).send("Error loading signup page.");
    }
});

/**
 * SET PASSWORD / REGISTRATION
 * Uses password hashing to protect user data privacy [cite: 132, 215, 764]
 */
app.post('/set-password', async (req, res) => {
    const { name, email, location, password } = req.body;
    const user = new User(email, name, location);

    try {
        const uId = await user.getIdFromEmail();
        if (uId) {
            await user.setUserPassword(password);
            res.send('Password updated successfully.');
        } else {
            await user.addUser(password);
            res.redirect('/login'); 
        }
    } catch (err) {
        console.error(`Error while adding user:`, err.message);
        res.status(500).send('Server error during signup');
    }
});

/**
 * AUTHENTICATE / LOGIN
 * Verifies credentials and creates a secure session [cite: 155, 174]
 */
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
                res.redirect('/user/' + uId);
            } else {
                res.send('Invalid password.');
            }
        } else {
            res.send('Invalid email.');
        }
    } catch (err) {
        console.error(`Auth Error: `, err.message);
        res.status(500).send("Login error occurred.");
    }
});

// DESTROY SESSION
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/login');
});

// ==========================================
// MAIN APP VIEWS
// ==========================================

/**
 * BROWSE MARKETPLACE
 * Displays all available community items for reuse [cite: 125, 140]
 */
app.get("/browse", async (req, res) => {
    try {
        const categoryId = req.query.category;
        
        // 1. Fetch filtered items based on ID
        const items = await Browse.getAllItems(categoryId);
        
        // 2. Fetch the actual categories list for the filter bar
        const categories = await db.query("SELECT * FROM CATEGORIES");
        
        res.render("browse", { 
            items: items, 
            categories: categories, // Send this to Pug
            selectedCategory: categoryId 
        });
    } catch (err) {
        res.status(500).send("Error loading browse page.");
    }
});

/**
 * ITEM DETAILS CONTROLLER
 * Fetches specific item data based on the listing_id in the URL
 */
app.get("/item/:id", async (req, res) => {
    try {
        const itemId = req.params.id;
        
        // MVC: Controller requests specific data from the ItemDetail Model
        const itemData = await ItemDetail.getFullInfo(itemId);
        
        if (itemData) {
            // Render the View and pass the 'item' object
            res.render("itemdetail", { item: itemData });
        } else {
            res.status(404).send("Item not found in ReShare database.");
        }
    } catch (err) {
        console.error("Controller Error (Item Detail):", err);
        res.status(500).send("Error loading item details.");
    }
});

/**
 * COMMUNITY LIST
 * Encourages trust and transparency within the neighborhood [cite: 130, 145]
 */
app.get("/community", async (req, res) => {
    try {
        const members = await Community.getAllMembers();
        res.render("community", { users: members });
    } catch (err) {
        console.error("Controller Error:", err);
        res.status(500).send("Error loading the community page.");
    }
});

/**
 * CATEGORIES
 * Allows discovery and filtering of essential household items [cite: 153]
 */
app.get("/categories", async (req, res) => {
    try {
        const categoryData = await Category.getCategoryCounts();
        
        // This 'categories' key must match the 'each cat in categories' in your pug
        res.render("categories", { categories: categoryData });
    } catch (err) {
        console.error("Controller Error:", err);
        res.status(500).send("Error loading categories page.");
    }
});

/**
 * ABOUT & TEAM
 * Outlines Inferno Group roles and the platform mission [cite: 5-11, 20-21]
 */
app.get("/about", async (req, res) => {
    try {
        const team = await About.getTeamMembers();
        res.render("about", { teamMembers: team });
    } catch (err) {
        console.error("Controller Error (About):", err);
        res.status(500).send("Error loading the about page.");
    }
});


/**
 * CHAT REQUEST CONTROLLER
 * Handles the logic when a user clicks "Request to Chat"
 */
app.post("/request-chat/:id", async (req, res) => {
    // Security check: Make sure the user is actually logged in
    if (!req.session.uid) {
        return res.redirect('/login');
    }

    const listingId = req.params.id;
    const requesterId = req.session.uid;

    try {
        // MVC: Controller asks the Model to create the database entries
        await Chat.createConversation(listingId, requesterId);
        
        // Redirect straight to the Inbox!
        res.redirect('/inbox');
    } catch (err) {
        console.error("Controller Error (Chat Request):", err);
        res.status(500).send("Could not process chat request.");
    }
});

/**
 * CHAT ROOM CONTROLLERS
 */
// 1. Load the Chat Room page
app.get('/chat/:id', async (req, res) => {
    if (!req.session.uid) return res.redirect('/login');
    
    try {
        const convoId = req.params.id;
        const userId = req.session.uid;

        // Verify access and get details
        const chatDetails = await Chat.getChatDetails(convoId, userId);
        if (!chatDetails) {
            return res.status(403).send("You do not have permission to view this chat.");
        }

        // Get all text messages
        const messages = await Chat.getMessages(convoId);

        // Figure out the name of the person you are talking to
        const isOwner = userId === chatDetails.owner_id;
        const chattingWith = isOwner ? chatDetails.requester_name : chatDetails.owner_name;

        res.render('chat', { 
            chatDetails, 
            messages, 
            currentUserId: userId,
            chattingWith 
        });
    } catch (err) {
        console.error("Error loading chat:", err);
        res.status(500).send("Could not load the chat room.");
    }
});

// 2. Handle sending a new message
app.post('/chat/:id/send', async (req, res) => {
    if (!req.session.uid) return res.redirect('/login');
    
    try {
        const convoId = req.params.id;
        const text = req.body.message_text; // Matches the 'name' attribute in the HTML form
        
        if (text && text.trim().length > 0) {
            await Chat.sendMessage(convoId, req.session.uid, text);
        }
        
        // Redirect back to the same chat room so the new message appears instantly
        res.redirect(`/chat/${convoId}`);
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).send("Could not send your message.");
    }
});

/**
 * INBOX CONTROLLER
 * Loads all active chats for the logged-in user
 */
app.get('/inbox', async (req, res) => {
    // MVC: Controller uses session ID to fetch conversations
    const userId = req.session.uid; 

    try {
        const conversations = await Inbox.getUserConversations(userId);
        res.render('inbox', { 
            conversations: conversations,
            currentUserId: userId 
        });
    } catch (err) {
        console.error("Inbox Route Error:", err);
        res.status(500).send("Could not load inbox.");
    }
});

// ==========================================
// ADMIN & MODERATION LOGIC (MVC Guard)
// ==========================================

// 1. The Guard: Standalone function to verify Admin role
const isAdmin = (req, res, next) => {
    if (req.session.role === 'admin') {
        next(); 
    } else {
        res.status(403).send("Access Denied: You do not have Admin permissions.");
    }
};

/**
 * ROUTE: GET Admin Edit Form
 */
app.get("/admin/edit-item/:id", isAdmin, async (req, res) => {
    try {
        const listing_id = req.params.id;
        const item = await ItemDetail.getFullInfo(listing_id);
        
        // 👇 1. Fetch the list from the database
        const categories = await db.query("SELECT * FROM CATEGORIES");
        
        // 👇 2. Send 'categories' to the Pug file
        res.render("admin_edit", { item, categories });
    } catch (err) {
        res.status(500).send("Error loading admin edit form.");
    }
});

/**
 * ROUTE: POST Admin Update (Rewrite)
 */
app.post("/admin/update-item/:id", isAdmin, async (req, res) => {
    try {
        // MVC: Hand data from Controller to Admin Model
        await Admin.updateListing(req.params.id, req.body);
        res.redirect(`/item/${req.params.id}`); 
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).send("Admin Update Failed.");
    }
});

/**
 * ROUTE: POST Admin Delete
 */
app.post("/admin/delete-item/:id", isAdmin, async (req, res) => {
    try {
        await Admin.deleteListing(req.params.id);
        res.redirect("/browse"); 
    } catch (err) {
        res.status(500).send("Admin Delete Failed.");
    }
});

/**
 * CLAIM ITEM CONTROLLER (Owner Only)
 */
app.post("/mark-claimed/:listingId", async (req, res) => {
    const { listingId } = req.params;
    const { requesterId } = req.body;
    try {
        await Listing.markAsClaimed(listingId, requesterId);
        res.redirect('/inbox');
    } catch (err) {
        res.status(500).send("Failed to mark item as claimed.");
    }
});

// ==========================================
// START SERVER
// ==========================================
const PORT = 3000;
app.listen(PORT, function(){
    console.log(`ReShare Server active at http://127.0.0.1:${PORT}/`);
});