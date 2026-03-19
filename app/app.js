// app.js
const express = require("express");
const app = express();

// 1. Setup Data Parsing (Allows Express to read form data)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 2. Setup View Engine (PUG - The 'View' in MVC)
app.set('view engine', 'pug');
app.set('views', './views'); 

// 3. Setup Static Files (CSS/Images)
app.use(express.static("public"));

// 4. Import Routes (The 'Controller' in MVC)
// This imports all that logic you moved to routes/auth.js
const authRoutes = require('./routes/auth');
const db = require('./services/db'); // Keep your database connection

// ==========================================
// FRONT-END PAGE ROUTES (Views)
// ==========================================
app.get("/", (req, res) => res.render("login"));
app.get("/login", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));

// ==========================================
// BACK-END LOGIC ROUTES (Controllers)
// ==========================================
// Any form that submits to /auth/... will be handled by your auth.js file
app.use('/auth', authRoutes); 

// ==========================================
// API / DATABASE TEST ROUTES
// ==========================================
app.get("/ITEMS", function(req, res) {
    const sql = 'select * from ITEMS'; 
    db.query(sql)
        .then(results => res.json(results))
        .catch(err => res.status(500).send("Database connection failed.")); 
});

app.get("/USERS", function(req, res) {
    const sql = 'select * from USERS'; 
    db.query(sql)
        .then(results => res.json(results))
        .catch(err => res.status(500).send("Database connection failed.")); 
});

// ==========================================
// START SERVER
// ==========================================
app.listen(3000, function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});