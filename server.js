const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();

// set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, "image-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// import models
const User = require("./models/user");
const Recipe = require("./models/recipe");
const Category = require("./models/category");
const Comment = require("./models/comment");

app.use(express.json());
app.use(express.static("public"));

//MongoDB----------------------------
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB Atlas!"))
    .catch((err) => console.log("Database connection error:", err));
//MongoDB----------------------------

//ROUTES

//user signup/login
app.post("/signup", async (req, res) => {
    const {name, email, password} = req.body;
    const existingUser = await User.findOne({email});
    if (existingUser) {
        return res.status(400).json({error: "Email is already registered."});
    }

    const newUser = new User({name, email, password});
    await newUser.save();
    res.status(201).json({message: "Account created successfully.", user: newUser});
});

app.post("/login", async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (!user || user.password !== password){
        return res.status(401).json({error: "Invalid email or password."});
    }
    res.json({message: "Login successful.", user});
});

//routes for recipes
//getting all recipes
app.get("/recipes", async (req, res) => {
    const {course, ingredient, q, authorId} = req.query;
    let query = {};

    if (course) query.course = {$regex: new RegExp("^" + course + "$", "i")}; //makes filtering more dynamic
    if (ingredient) query.ingredient = {$regex: new RegExp("^" + ingredient + "$", "i")};
    if (q) query.title = {$regex: q, $options: "i"};
    if (authorId) query.authorId = authorId;

    const recipes = await Recipe.find(query);
    res.json(recipes);
});

//getting recipe by id (UPDATED)
app.get("/recipes/:id", async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ error: "Recipe not found" });

        const comments = await Comment.find({ recipe: recipe._id });
        
        const recipeData = recipe.toObject();
        recipeData.comments = comments; 
        
        res.json(recipeData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//posting new recipe (UPDATED)
app.post("/recipes", upload.single("image"), async (req, res) => {
    try {
        const categoryDoc = await Category.findOne({ name: req.body.course });
        const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

        const newRecipe = new Recipe({
            title: req.body.title,
            course: req.body.course,
            ingredient: req.body.ingredient,
            image: imagePath,
            ingredients: req.body.ingredients,
            instructions: req.body.instructions,
            authorId: req.body.authorId,
            category: categoryDoc ? categoryDoc._id : null
        });

        const savedRecipe = await newRecipe.save();
        res.status(201).json(savedRecipe);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// editing recipe (UPDATED FOR FILE UPLOAD)
app.put("/recipes/:id", upload.single("image"), async (req, res) => {
    try {
        const updateData = {
            title: req.body.title,
            course: req.body.course,
            ingredient: req.body.ingredient,
            ingredients: req.body.ingredients,
            instructions: req.body.instructions,
        };

        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        const updatedRecipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            updateData,
            {new: true}
        );
        res.json(updatedRecipe);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

//deleting recipe
app.delete("/recipes/:id", async (req, res) => {
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({message: "Recipe deleted successfully."});
});

//posting comment (UPDATED)
app.post("/recipes/:id/comments", async (req, res) => {
    try {
        const newComment = new Comment({
            recipe: req.params.id,
            name: req.body.name,
            text: req.body.text
        });
        await newComment.save();
        res.status(201).json(newComment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// count of recipes per category
app.get("/categories/count", async (req, res) => {
    try {
        const counts = await Recipe.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);
        res.json(counts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log("Port 3000 is running...");
});