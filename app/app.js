// Require express
const express = require('express');
const app = express();
const port = 3000;

// Serve static files from 'static' folder
app.use(express.static('static'));

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Add static files location
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require('./services/db');

// Create a route for root
app.get("/", function(req, res) {
    res.render("index");
});

// Create a route for testing the db
app.get("/ITEMS", function(req, res) {
// Assumes a table called ITEMS exists in your database
var sql = 'select * from ITEMS';
// As we are not inside an async function we cannot use await // So we use .then syntax to ensure that we wait until the
// promise returned by the async function is resolved before we proceed
db.query (sql).then(results => {
console.log(results);
res.json(results)
}) ;
}) ;

// Create a route for testing the db
app.get("/USERS", function(req, res) {
// Assumes a table called USERS exists in your database
var sql = 'select * from USERS';
// As we are not inside an async function we cannot use await // So we use .then syntax to ensure that we wait until the
// promise returned by the async function is resolved before we proceed
db.query (sql).then(results => {
console.log(results);
res.json(results)
}) ;
}) ;

// Dynamic route for /student/:name/:id
app.get("/student/:name/:id", function(req, res) {
    let name = req.params.name;
    let id = req.params.id;
    res.send(`<table border="1">
                <tr><th>Name</th><th>ID</th></tr>
                <tr><td>${name}</td><td>${id}</td></tr>
              </table>`);
});

// Dynamic route for /number/:n
app.get("/number/:n", function(req, res) {
    let n = parseInt(req.params.n);
    let html = "<table border='1'><tr>";
    for(let i=0; i<=n; i++) {
        html += "<td>" + i + "</td>";
    }
    html += "</tr></table>";
    res.send(html);
});

// /roehampton route with reversed string logic
app.get("/reverse_roehampton", function(req, res) {
    let path = "/roehampton";
    let arr = path.split(''); // split string to array
    arr.splice(0,1); // remove leading '/'
    let reversed = arr.reverse().join('');
    res.send(reversed);
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});