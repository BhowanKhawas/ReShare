// Variables
var name = "Fred";
var age = 21;
var teacher = true;

document.write('Name: ' + name + '<br>');
document.write('Age: ' + age + '<br>');
document.write('Is teacher? ' + teacher + '<br>');

// Debugging
console.log(name);

// Targeting HTML elements by ID
function changeText() {
    document.getElementById("my_text").innerHTML = "You clicked me";
}

// Homework example: change color
function setRed() {
    document.getElementById("my_paragraph").style.color = "red";
}
function setBlue() {
    document.getElementById("my_paragraph").style.color = "blue";
}

// Function example
function greet(param) {
    return "Hello " + param;
}