const express = require("express");
const path = require("path");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const collection = require("./Config");

const app = express();
const views = path.join(__dirname, '../views');

app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.set("views", views);
app.use(express.urlencoded({ extended: false }));

// Render login page
app.get("/", (req, res) => {
    res.render("login");
});

// Render signup page
app.get("/signup", (req, res) => {
    res.render("signup");
});

// Signup route
app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    };
    
    const existingUser = await collection.findOne({ name: data.name });
    
    if (existingUser) {
        res.send("User already exists");
    } else {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;

        const userdata = await collection.insertOne(data);  // Changed to insertOne for single document
        console.log(userdata);
        res.send("Signup successful!");
    }
});

// Login route
app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        
        if (!check) {
            res.send("Username not found");
        } else {
            const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);  // Fixed typo: req.body.password
            
            if (isPasswordMatch) {
                res.render("home");
            } else {
                res.send("Wrong password");  // Fixed typo: req.send => res.send
            }
        }
    } catch (error) {
        res.send("Error during login: " + error.message);
    }
});

// Start server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
