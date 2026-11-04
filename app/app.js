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
const Chat = require('./models/Chat'); // <-- Your Chat Model
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

// Bootstrap static files
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'));
app.use('/bootstrap-icons', express.static('node_modules/bootstrap-icons'));

// Session Management
const session = require('express-session');
const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required');
}

app.use(session({
    name: 'reshare.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// Global Role & Dev Login Middleware
app.use(async (req, res, next) => {
    if (!req.session.uid) {
        req.session.uid = null; 
        req.session.loggedIn = false;
    }

    try {
        if (req.session.uid) {
            const role = await User.getRole(req.session.uid);
            req.session.role = role || 'user'; 
        } else {
            req.session.role = 'guest';
        }
        
        res.locals.session = req.session;
        next();
    } catch (err) {
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
        console.error("Signup View Error:", err.message);
        res.status(500).send("Error loading signup page.");
    }
});

// Signup only creates new accounts. Email ownership alone must never authorize a password reset.
app.post('/set-password', async (req, res) => {
    const { name, email, location, password } = req.body;
    if (!name || !email || !location || typeof password !== 'string' || password.length < 8) {
        return res.status(400).send('Please provide all required fields and a password of at least 8 characters.');
    }
    try {
        const auth = new Auth(email.trim(), name.trim(), location);
        if (await auth.getIdFromEmail()) {
            return res.status(409).send('An account with this email already exists. Please log in.');
        }
        await auth.addUser(password);
        return res.redirect('/login');
    } catch (err) {
        console.error('Signup Error:', err.message);
        return res.status(500).send('Server error during signup.');
    }
});

app.post('/authenticate', async (req, res) => {
    const { email, password } = req.body; 
    const auth = new Auth(email); 
    
    try {
        const uId = await auth.getIdFromEmail();
        if (uId) {
            const match = await auth.authenticate(password);
            if (match) {
                // Regenerate the session ID after authentication to help prevent
                // session-fixation attacks.
                req.session.regenerate((err) => {
                    if (err) {
                        console.error("Session Regeneration Error:", err);
                        return res.status(500).send("Login error occurred.");
                    }

                    // Set session variables for use across the site.
                    req.session.uid = uId;
                    req.session.loggedIn = true;
                    req.session.role = auth.role;

                    req.session.save((saveErr) => {
                        if (saveErr) {
                            console.error("Session Save Error:", saveErr);
                            return res.status(500).send("Login error occurred.");
                        }

                        res.redirect('/');
                    });
                });
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

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error("Logout Error:", err);
        res.redirect('/login');
    });
});

// ==========================================
// 4. CORE APPLICATION ROUTES (GET)
// ==========================================
app.get("/", async (req, res) => {
    if (!req.session || !req.session.uid) return res.redirect("/login");
    try {
        const exchanges = await Index.getRecentExchanges();
        res.render("index", { exchangeItems: exchanges, session: req.session });
    } catch (err) {
        res.status(500).send("Error loading home page.");
    }
});

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

app.get("/user/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        if (userId === "me" || !userId) {
            if (req.session.uid) return res.redirect("/user/" + req.session.uid);
            return res.redirect("/login");
        }
        
        const userData = await User.getById(userId);
        if (!userData) return res.send("DEBUG ERROR: User ID was not found."); 

        const userListings = await Listing.getByUserId(userId); 
        res.render("user", { user: userData, listings: userListings, session: req.session });
    } catch (err) {
        console.error("PROFILE ROUTE CRASH:", err);
        res.send("<h1>Profile Crash Detected!</h1><p><b>Error Message:</b> " + err.message + "</p>");
    }
});

app.get("/profile", async (req, res) => {
    if (!req.session || !req.session.uid) return res.redirect("/login");
    try {
        const userData = await User.getById(req.session.uid);
        const userListings = await Listing.getByUserId(req.session.uid); 
        res.render("user", { user: userData, listings: userListings, session: req.session });
    } catch (err) {
        console.error("Profile Route Error:", err);
        res.status(500).send("Could not load your profile dashboard.");
    }
});

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
app.get("/add-item", (req, res) => {
    if (!req.session.uid) return res.redirect("/login");
    res.render("add_item", { session: req.session });
});

app.post("/update-name", async (req, res) => {
    if (!req.session.uid) return res.redirect("/login");
    const newName = typeof req.body.newName === "string" ? req.body.newName.trim() : "";
    if (!newName || newName.length > 100) return res.status(400).send("Please enter a name between 1 and 100 characters.");
    try {
        const userInstance = new User();
        userInstance.user_id = req.session.uid;
        await userInstance.updateName(newName);
        return res.redirect("/profile?success=updated");
    } catch (err) {
        console.error("Profile Name Update Error:", err.message);
        return res.status(500).send("Error updating profile name.");
    }
});

app.post("/mark-claimed/:id", async (req, res) => {
    if (!req.session.uid) return res.redirect("/login");
    try {
        const listingId = req.params.id;
        const convoId = req.body.convoId; 

        if (convoId) {
            const chatDetails = await Chat.getChatDetails(convoId, req.session.uid);
            if (!chatDetails || String(chatDetails.listing_id) !== String(listingId)) {
                return res.status(403).send("You are not allowed to claim this listing from that conversation.");
            }
        }
        await Listing.markAsClaimed(listingId, req.session.uid);
        return res.redirect(convoId
            ? `/chat/${convoId}?success=claimed`
            : `/item/${listingId}?success=claimed`);
    } catch (err) {
        console.error("Claim Error:", err);
        res.status(500).send("Error updating listing status.");
    }
});

app.post("/profile/change-password", async (req, res) => {
    if (!req.session.uid) return res.redirect("/login");
    try {
        const { new_password } = req.body;
        const auth = new Auth();
        auth.user_id = req.session.uid; 
        await auth.setUserPassword(new_password);
        res.redirect(`/user/${req.session.uid}?success=password`);
    } catch (err) {
        console.error("Password Update Error:", err);
        res.status(500).send("Error updating password.");
    }
});

// ==========================================
// 6. MESSAGING & CHAT ROUTES
// ==========================================
app.post("/request-chat/:id", async (req, res) => {
    if (!req.session.uid) return res.redirect('/login');
    try {
        const listingId = req.params.id;
        const requesterId = req.session.uid;
        await Chat.createConversation(listingId, requesterId);
        res.redirect('/inbox');
    } catch (err) {
        console.error("Chat Request Error:", err.message);
        res.status(500).send("Could not process chat request.");
    }
});

app.get('/inbox', async (req, res) => {
    if (!req.session.uid) return res.redirect('/login');
    try {
        const conversations = await Inbox.getUserConversations(req.session.uid);
        res.render('inbox', { conversations, session: req.session });
    } catch (err) {
        console.error("Inbox Load Error:", err.message);
        res.status(500).send("Could not load inbox.");
    }
});

app.get('/chat/:id', async (req, res) => {
    if (!req.session.uid) return res.redirect('/login');
    try {
        const convoId = req.params.id;
        const userId = req.session.uid;

        const chatDetails = await Chat.getChatDetails(convoId, userId);
        if (!chatDetails) return res.status(403).send("Access Denied: You are not a participant in this chat.");

        const messages = await Chat.getMessages(convoId);
        const chattingWith = (userId === chatDetails.owner_id) ? chatDetails.requester_name : chatDetails.owner_name;

        res.render('chat', { chatDetails, messages, chattingWith, session: req.session });
    } catch (err) {
        console.error("Chat Room Load Error:", err.message);
        res.status(500).send("Could not load the chat room.");
    }
});

app.post('/chat/:id/send', async (req, res) => {
    if (!req.session.uid) return res.redirect('/login');
    try {
        const convoId = req.params.id;
        const text = req.body.message_text; 
        
        const chatDetails = await Chat.getChatDetails(convoId, req.session.uid);
        if (!chatDetails) return res.status(403).send("Access Denied: You are not a participant in this chat.");
        if (typeof text !== "string" || !text.trim()) return res.redirect(`/chat/${convoId}`);
        if (text.length > 4000) return res.status(400).send("Messages must be 4,000 characters or fewer.");
        await Chat.sendMessage(convoId, req.session.uid, text.trim());
        return res.redirect(`/chat/${convoId}`);
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
// 8. RAW DATA API ROUTES
// =========================================
// Raw database dump endpoints removed: they exposed private user and listing data.



app.post("/add-item", upload.single('item_image'), async (req, res) => {
    if (!req.session.uid) return res.redirect("/login");
    try {
        const { title, description, category_id, condition } = req.body;
        const imagePath = req.file ? `/images/${req.file.filename}` : 'https://placehold.co/400x300';

        const newItemId = await Listing.create({
            title, description, image_url: imagePath, category_id: category_id || 1, condition: condition || 'Good'
        }, req.session.uid);

        res.redirect(`/item/${newItemId}`);
    } catch (err) {
        console.error("Upload Route Error:", err);
        res.status(500).send("There was an error uploading your item.");
    }
});

// ==========================================
// 9. SOCKET.IO & SERVER START
// ==========================================
const http = require('http');
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('A user connected to chat');

    socket.on('chat message', async (data) => {
        try {
            // Save to DB using the Chat model
            await Chat.sendMessage(data.conversation_id, data.sender_id, data.message);
            
            // Broadcast to both browsers instantly
            io.emit('chat message', data);
        } catch (error) {
            console.error("Socket DB Save Error:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// ==========================================
// --- CONTROLLER: Item Management ---
// ==========================================

const APP_CATEGORIES = [
    "Furniture", "Electronics", "Books", "Clothing", 
    "Home & Garden", "Toys & Games", "Sports Equipment", 
    "Musical Instruments", "Pet Supplies", "Art & Collectibles"
];

// 1. GET: Show the Edit Form
app.get('/edit-item/:id', async (req, res) => {
    if (!req.session.uid) return res.redirect("/login");
    const itemId = req.params.id;

    try {
        // FIX: Changed owner_id to user_id based on your phpMyAdmin screenshot
        const items = await db.query(
            "SELECT * FROM LISTINGS WHERE listing_id = ? AND user_id = ?", 
            [itemId, req.session.uid]
        );

        if (items.length > 0) {
            res.render('edit-item', { 
                item: items[0], 
                categories: APP_CATEGORIES, 
                session: req.session 
            });
        } else {
            res.redirect('/profile?error=unauthorized');
        }
    } catch (err) {
        res.status(500).send("Error loading item for edit.");
    }
});

app.post('/edit-item/:id', async (req, res) => {
    if (!req.session.uid) return res.redirect("/login");
    
    const itemId = req.params.id;
    const { title, description, category } = req.body;
    const userId = req.session.uid;

    try {
        // COALESCE ensures that if the category name doesn't match, 
        // it defaults to category_id 1 instead of NULL.
        await db.query(
            `UPDATE LISTINGS 
             SET title = ?, 
                 description = ?, 
                 category_id = COALESCE((SELECT category_id FROM CATEGORIES WHERE name = ? LIMIT 1), 1) 
             WHERE listing_id = ? AND user_id = ?`,
            [title, description, category, itemId, userId]
        );

        console.log(`✅ Update Successful for Listing #${itemId}`);
        res.redirect('/profile?success=updated');
    } catch (err) {
        console.error("❌ SQL Execution Error:", err.message); // This matches your log
        res.redirect('/profile?error=update_failed');
    }
});

// 3. POST: Process the Deletion
app.post('/delete-item/:id', async (req, res) => {
    if (!req.session.uid) return res.redirect("/login");
    const itemId = req.params.id;

    try {
        // FIX: Changed owner_id to user_id
        await db.query(
            "DELETE FROM LISTINGS WHERE listing_id = ? AND user_id = ?", 
            [itemId, req.session.uid]
        );
        res.redirect('/profile?success=deleted');
    } catch (err) {
        res.redirect('/profile?error=delete_failed');
    }
});

// ==========================================
// 10. 404 ERROR CATCH-ALL
// ==========================================
app.use((req, res) => {
    res.status(404).render('404', {
        title: "Page Not Found",
        user: req.session.user 
    });
});

// ==========================================
// 11. FINAL SERVER START
// ==========================================
const LISTEN_PORT = process.env.PORT || 3000; 
server.listen(LISTEN_PORT, () => {
    console.log(`🚀 ReShare Server active at http://127.0.0.1:${LISTEN_PORT}/`);
    console.log(`✅ Database Connected successfully!`);
});