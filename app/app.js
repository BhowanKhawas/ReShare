/**
 * ReShare - Main Application Entry Point
 * Folder Location: /app/app.js
 * Group Name: Inferno
 * Description: community-based web application to reduce household waste
 */

const path = require("path");
const express = require("express");
const app = express();


// ==========================================
// 1. ENVIRONMENT & IMPORTS
// ==========================================
require("dotenv").config({ path: path.join(__dirname, '../.env') });

const db = require('./services/db'); 
const { User } = require('./models/User');
const { Auth } = require('./models/login-signup');
const Listing = require('./models/listing'); 
const Browse = require('./models/Browse');
const ItemDetail = require('./models/ItemDetail');
const Community = require('./models/Community');
const Category = require('./models/Category'); 
const Index = require('./models/Index');
const About = require('./models/About');
const Chat = require('./models/Chat'); 
const Inbox = require('./models/Inbox');
const Admin = require('./models/Admin');
const multer = require('multer');
const upload = multer({ dest: 'app/public/images/' });

// ==========================================
// 2. SETUP & MIDDLEWARE
// ==========================================
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//bootstrap static files
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'));
app.use('/bootstrap-icons', express.static('node_modules/bootstrap-icons'));

// Session Management
var session = require('express-session');
app.use(session({
    secret: 'secretkeysdfjsflyoifasd',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// Global Role & Dev Login Middleware
app.use(async (req, res, next) => {
    // 1. Check if session exists. 
    // If not logged in, we set uid to null (NOT a fake number like 1 or 11)
    if (!req.session.uid) {
        req.session.uid = null; 
        req.session.loggedIn = false;
    }

    try {
        // 2. ONLY call the Model if we actually have a user ID
        if (req.session.uid) {
            const role = await User.getRole(req.session.uid);
            req.session.role = role || 'user'; 
        } else {
            // 3. If no ID, they are a guest. No database query needed!
            req.session.role = 'guest';
        }
        
        res.locals.session = req.session;
        next();
    } catch (err) {
        // 4. If the database fails, log it but let the server live
        console.error("Auth Middleware Error:", err.message);
        req.session.role = 'guest'; 
        res.locals.session = req.session;
        next(); 
    }
});

// Admin Guard Middleware
const isAdmin = (req, res, next) => {
    if (req.session.role === 'admin') {
        next(); 
    } else {
        res.status(403).send("Access Denied: You do not have Admin permissions.");
    }
};

// ==========================================
// 3. PUBLIC & AUTH ROUTING
// ==========================================

// Render the login page
app.get("/login", (req, res) => res.render("login"));

// Render the signup page and fetch location data for the dropdown
app.get("/signup", async (req, res) => {
    try {
        const locations = await db.query("SELECT location_id, city, region FROM LOCATIONS");
        res.render("signup", { locations: locations });
    } catch (err) {
        console.error("Signup View Error:", err.message);
        res.status(500).send("Error loading signup page.");
    }
});

// SIGNUP: Handles account creation or password resets
app.post('/set-password', async (req, res) => {
    const { name, email, location, password } = req.body;
    
    // Use the Auth model for security-related tasks
    const auth = new Auth(email, name, location); 
    
    try {
        const uId = await auth.getIdFromEmail();
        
        if (uId) {
            // If user exists, update their password
            await auth.setUserPassword(password);
            res.send('Password updated successfully. <a href="/login">Login here</a>');
        } else {
            // If new user, add them to the database
            await auth.addUser(password);
            res.redirect('/login'); 
        }
    } catch (err) {
        console.error("Signup Error:", err.message);
        res.status(500).send('Server error during signup');
    }
});

// LOGIN: Authenticates user and starts a session
app.post('/authenticate', async (req, res) => {
    const { email, password } = req.body; 
    
    // Use the Auth model to handle the logic
    const auth = new Auth(email); 
    
    try {
        const uId = await auth.getIdFromEmail();
        
        if (uId) {
            const match = await auth.authenticate(password);
            
            if (match) {
                // Set session variables for use across the site
                req.session.uid = uId;
                req.session.loggedIn = true;
                req.session.role = auth.role; 
                
                res.redirect('/'); // Go to Home on success
            } else {
                res.send('Invalid password. <a href="/login">Try again</a>');
            }
        } else {
            res.send('Invalid email. <a href="/signup">Create an account</a>');
        }
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).send("Login error occurred.");
    }
});

// LOGOUT: Destroys the session and redirects to login
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error("Logout Error:", err);
        res.redirect('/login');
    });
});

// ==========================================
// 4. CORE APPLICATION ROUTES (GET)
// ==========================================

// HOME
app.get("/", async (req, res) => {
    if (!req.session || !req.session.uid) return res.redirect("/login");
    try {
        const exchanges = await Index.getRecentExchanges();
        res.render("index", { exchangeItems: exchanges, session: req.session });
    } catch (err) {
        res.status(500).send("Error loading home page.");
    }
});

// BROWSE
app.get("/browse", async (req, res) => {
    if (!req.session.uid) return res.redirect("/login");
    try {
        const categoryId = req.query.category;
        const items = await Browse.getAllItems(categoryId);
        const categories = await db.query("SELECT * FROM CATEGORIES");
        res.render("browse", { items, categories, selectedCategory: categoryId });
    } catch (err) {
        res.status(500).send("Error loading browse page.");
    }
});

// ITEM DETAIL
app.get("/item/:id", async (req, res) => {
    if (!req.session.uid) return res.redirect("/login");
    try {
        const itemData = await ItemDetail.getFullInfo(req.params.id);
        if (itemData) {
            res.render("itemdetail", { item: itemData, session: req.session, query: req.query });
        } else {
            res.status(404).send("Item not found.");
        }
    } catch (err) {
        res.status(500).send("Error loading item details.");
    }
});

// USER PROFILE (With Error Exposer)
app.get("/user/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        
        if (userId === "me" || !userId) {
            if (req.session.uid) return res.redirect("/user/" + req.session.uid);
            return res.redirect("/login");
        }
        
        const userData = await User.getById(userId);
        if (!userData) {
            return res.send("DEBUG ERROR: User ID was not found in the database."); 
        }

        const userListings = await Listing.getByUserId(userId); 
        res.render("user", { user: userData, listings: userListings, session: req.session });
        
    } catch (err) {
        // THIS PRINTS THE CRASH TO YOUR SCREEN
        console.error("PROFILE ROUTE CRASH:", err);
        res.send("<h1>Profile Crash Detected!</h1><p><b>Error Message:</b> " + err.message + "</p>");
    }
});

// THE BRIDGE: Connects the "/profile" URL to your "user.pug" template
app.get("/profile", async (req, res) => {
    // 1. Guard: If the user isn't logged in, send them to login
    if (!req.session || !req.session.uid) {
        return res.redirect("/login");
    }
    
    try {
        // 2. Fetch the data for the user who is currently logged in
        const userData = await User.getById(req.session.uid);
        const userListings = await Listing.getByUserId(req.session.uid); 
        
        // 3. Render your existing "user.pug" file
        res.render("user", { 
            user: userData, 
            listings: userListings, 
            session: req.session 
        });
    } catch (err) {
        console.error("Profile Route Error:", err);
        res.status(500).send("Could not load your profile dashboard.");
    }
});


// SECONDARY PAGES (Categories, Community, About)
app.get("/categories", async (req, res) => {
    if (!req.session.uid) return res.redirect("/login");
    try {
        const categoryData = await Category.getCategoryCounts();
        res.render("categories", { categories: categoryData });
    } catch (err) {
        res.status(500).send("Error loading categories page.");
    }
});

app.get("/community", async (req, res) => {
    if (!req.session.uid) return res.redirect("/login");
    try {
        const members = await Community.getAllMembers();
        res.render("community", { users: members });
    } catch (err) {
        res.status(500).send("Error loading community page.");
    }
});

app.get("/about", async (req, res) => {
    try {
        const team = await About.getTeamMembers();
        res.render("about", { teamMembers: team, session: req.session });
    } catch (err) {
        res.status(500).send("Error loading about page.");
    }
});

// ==========================================
// 5. CORE APPLICATION ROUTES (POST / Actions)
// ==========================================

// ADD ITEM (Form View)
app.get("/add-item", (req, res) => {
    // Safety check: only logged-in users can see this page
    if (!req.session.uid) {
        return res.redirect("/login");
    }
    // Render the 'add_item.pug' file
    res.render("add_item", { session: req.session });
});

// UPDATE PROFILE NAME
app.post("/update-name", async (req, res) => {
    const { user_id, newName } = req.body;
    try {
        const userInstance = new User();
        userInstance.user_id = user_id; 
        await userInstance.updateName(newName);
        
        // Redirect to /profile with a success flag
        res.redirect(`/profile?success=updated`); 
    } catch (err) {
        res.status(500).send("Error updating profile name.");
    }
});

app.post("/mark-claimed/:id", async (req, res) => {
    if (!req.session.uid) return res.redirect("/login");
    try {
        const listingId = req.params.id;
        const convoId = req.body.convoId; // Grabbed from the hidden input in chat.pug

        // 1. Mark the item as completed
        await Listing.markAsClaimed(listingId, req.session.uid); 
        
        // 2. Increment the user's gifted count
        await db.query("UPDATE USERS SET items_gifted_count = items_gifted_count + 1 WHERE user_id = ?", [req.session.uid]);

        // 3. Smart Redirect: If we came from a chat, go back to the chat!
        if (convoId) {
            res.redirect(`/chat/${convoId}?success=claimed`);
        } else {
            res.redirect(`/item/${listingId}?success=claimed`);
        }
    } catch (err) {
        console.error("Claim Error:", err);
        res.status(500).send("Error updating listing status.");
    }
});

// CHANGE PASSWORD FROM PROFILE DASHBOARD
app.post("/profile/change-password", async (req, res) => {
    if (!req.session.uid) return res.redirect("/login");
    
    try {
        const { new_password } = req.body;
        
        // Use the Auth model to handle hashing and saving
        // We initialize it with an empty email because we use user_id to update
        const auth = new Auth();
        auth.user_id = req.session.uid; 
        
        await auth.setUserPassword(new_password);
        
        // Redirect back with a success message
        res.redirect(`/user/${req.session.uid}?success=password`);
    } catch (err) {
        console.error("Password Update Error:", err);
        res.status(500).send("Error updating password.");
    }
});

// ==========================================
// 6. MESSAGING & CHAT ROUTES
// ==========================================

// REQUEST CHAT: Creates a new conversation from an item page
app.post("/request-chat/:id", async (req, res) => {
    if (!req.session.uid) return res.redirect('/login');
    try {
        const listingId = req.params.id;
        const requesterId = req.session.uid;

        // Use the Model to create the conversation
        await Chat.createConversation(listingId, requesterId);
        
        // Redirect to inbox to see the new chat room
        res.redirect('/inbox');
    } catch (err) {
        console.error("Chat Request Error:", err.message);
        res.status(500).send("Could not process chat request.");
    }
});

// INBOX: Displays all active conversations for the logged-in user
app.get('/inbox', async (req, res) => {
    if (!req.session.uid) return res.redirect('/login');
    try {
        const conversations = await Inbox.getUserConversations(req.session.uid);
        
        // Pass session so nav.pug knows we are logged in
        res.render('inbox', { 
            conversations: conversations, 
            session: req.session 
        });
    } catch (err) {
        console.error("Inbox Load Error:", err.message);
        res.status(500).send("Could not load inbox.");
    }
});

// CHAT ROOM: Displays messages and the input area
app.get('/chat/:id', async (req, res) => {
    if (!req.session.uid) return res.redirect('/login');
    try {
        const convoId = req.params.id;
        const userId = req.session.uid;

        // 1. Fetch details and verify this user is a participant
        const chatDetails = await Chat.getChatDetails(convoId, userId);
        
        if (!chatDetails) {
            return res.status(403).send("Access Denied: You are not a participant in this chat.");
        }

        // 2. Get message history
        const messages = await Chat.getMessages(convoId);

        // 3. Logic: Determine the name of the person you are talking to
        const chattingWith = (userId === chatDetails.owner_id) 
            ? chatDetails.requester_name 
            : chatDetails.owner_name;

        // 4. Render the clean CSS-based view
        res.render('chat', { 
            chatDetails, 
            messages, 
            chattingWith,
            session: req.session 
        });
    } catch (err) {
        console.error("Chat Room Load Error:", err.message);
        res.status(500).send("Could not load the chat room.");
    }
});

// SEND MESSAGE: Processes new message text
app.post('/chat/:id/send', async (req, res) => {
    if (!req.session.uid) return res.redirect('/login');
    try {
        const convoId = req.params.id;
        const text = req.body.message_text; // Matches the 'name' attribute in chat.pug [cite: 39]
        
        if (text && text.trim().length > 0) {
            await Chat.sendMessage(convoId, req.session.uid, text);
        }
        
        // Refresh the chat room to show the new message
        res.redirect(`/chat/${convoId}`);
    } catch (err) {
        console.error("Message Send Error:", err.message);
        res.status(500).send("Could not send your message.");
    }
});

// ==========================================
// 7. ADMIN CONTROLS (Protected)
// ==========================================

app.get("/admin/users", isAdmin, async (req, res) => {
    try {
        const allUsers = await Admin.getAllUsers();
        res.render("admin_users", { users: allUsers, session: req.session });
    } catch (err) {
        res.status(500).send("Error loading user directory.");
    }
});

app.get("/admin/edit-item/:id", isAdmin, async (req, res) => {
    try {
        const item = await ItemDetail.getFullInfo(req.params.id);
        const categories = await db.query("SELECT * FROM CATEGORIES");
        res.render("admin_edit", { item, categories });
    } catch (err) {
        res.status(500).send("Error loading admin edit form.");
    }
});

app.post("/admin/update-item/:id", isAdmin, async (req, res) => {
    try {
        await Admin.updateListing(req.params.id, req.body);
        res.redirect(`/item/${req.params.id}`); 
    } catch (err) {
        res.status(500).send("Admin Update Failed.");
    }
});


app.post("/admin/delete-item/:id", isAdmin, async (req, res) => {
    try {
        await Admin.deleteListing(req.params.id);
        res.redirect("/browse"); 
    } catch (err) {
        res.status(500).send("Admin Delete Failed.");
    }
});



// =========================================
// 8. RAW DATA API ROUTES (For Developers / Debugging)
// =========================================
app.get("/LISTINGS", (req, res) => {
    db.query('SELECT * FROM LISTINGS').then(r => res.json(r)).catch(() => res.status(500).send("DB Error"));
});
app.get("/USERS", (req, res) => {
    db.query('SELECT * FROM USERS').then(r => res.json(r)).catch(() => res.status(500).send("DB Error"));
});



app.post("/add-item", upload.single('item_image'), async (req, res) => {
    if (!req.session.uid) return res.redirect("/login");
    try {
        const { title, description, category_id, condition } = req.body;
        
        // Use the filename generated by multer
        const imagePath = req.file ? `/images/${req.file.filename}` : 'https://placehold.co/400x300';

        const newItemId = await Listing.create({
            title, 
            description, 
            image_url: imagePath, 
            category_id: category_id || 1, 
            condition: condition || 'Good'
        }, req.session.uid);

        res.redirect(`/item/${newItemId}`);
    } catch (err) {
        console.error("Upload Route Error:", err);
        res.status(500).send("There was an error uploading your item.");
    }
});


// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, function(){
    console.log(`🚀 ReShare Server active at http://127.0.0.1:${PORT}/`);
});
