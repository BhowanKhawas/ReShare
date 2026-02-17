// Require express
const express = require('express');
const app = express();
const port = 3000;

// Serve static files from 'static' folder
app.use(express.static('static'));

// Root route
app.get("/", function(req, res) {
    res.send("Hello Ismail!");
});

// Simple route
app.get("/roehampton", function(req, res) {
    console.log(req.url);
    let path = req.url;
    res.send(path.substring(0,3)); // first 3 letters
});

// Dynamic route for /hello/:name
app.get("/hello/:name", function(req, res) {
    console.log(req.params);
    res.send("Hello " + req.params.name);
});

// Dynamic route for /user/:id
app.get("/user/:id", function(req, res) {
    res.send("User ID: " + req.params.id);
});

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