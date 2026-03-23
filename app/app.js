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
const { User } = require('./models/User'); // Only ONE User import!
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

app.get("/login", (req, res) => res.render("login"));

app.get("/signup", async (req, res) => {
    try {
        const locations = await db.query("SELECT location_id, city, region FROM LOCATIONS");
        res.render("signup", { locations: locations });
    } catch (err) {
        res.status(500).send("Error loading signup page.");
    }
});

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
        res.status(500).send('Server error during signup');
    }
});

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
                res.redirect('/'); // Go to Home on success
            } else {
                res.send('Invalid password.');
            }
        } else {
            res.send('Invalid email.');
        }
    } catch (err) {
        res.status(500).send("Login error occurred.");
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
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
        req.session.name = newName;
        res.redirect(`/user/${user_id}`); 
    } catch (err) {
        res.status(500).send("Error updating profile name.");
    }
});

// MARK ITEM AS CLAIMED
app.post("/mark-claimed/:id", async (req, res) => {
    if (!req.session.uid) return res.redirect("/login");
    try {
        await Listing.markAsClaimed(req.params.id, req.session.uid); 
        res.redirect(`/item/${req.params.id}?success=claimed`);
    } catch (err) {
        res.status(500).send("Error updating listing status.");
    }
});

// ==========================================
// 6. MESSAGING & CHAT ROUTES
// ==========================================

app.post("/request-chat/:id", async (req, res) => {
    if (!req.session.uid) return res.redirect('/login');
    try {
        await Chat.createConversation(req.params.id, req.session.uid);
        res.redirect('/inbox');
    } catch (err) {
        res.status(500).send("Could not process chat request.");
    }
});

app.get('/inbox', async (req, res) => {
    if (!req.session.uid) return res.redirect('/login');
    try {
        const conversations = await Inbox.getUserConversations(req.session.uid);
        res.render('inbox', { conversations: conversations, currentUserId: req.session.uid });
    } catch (err) {
        res.status(500).send("Could not load inbox.");
    }
});

app.get('/chat/:id', async (req, res) => {
    if (!req.session.uid) return res.redirect('/login');
    try {
        const convoId = req.params.id;
        const userId = req.session.uid;
        const chatDetails = await Chat.getChatDetails(convoId, userId);
        
        if (!chatDetails) return res.status(403).send("Permission denied.");

        const messages = await Chat.getMessages(convoId);
        const chattingWith = (userId === chatDetails.owner_id) ? chatDetails.requester_name : chatDetails.owner_name;

        res.render('chat', { chatDetails, messages, currentUserId: userId, chattingWith });
    } catch (err) {
        res.status(500).send("Could not load the chat room.");
    }
});

app.post('/chat/:id/send', async (req, res) => {
    if (!req.session.uid) return res.redirect('/login');
    try {
        const text = req.body.message_text; 
        if (text && text.trim().length > 0) {
            await Chat.sendMessage(req.params.id, req.session.uid, text);
        }
        res.redirect(`/chat/${req.params.id}`);
    } catch (err) {
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
// 8. RAW DATA API ROUTES (For Dev/Testing)
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