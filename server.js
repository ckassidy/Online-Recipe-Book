const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.use(express.json());
app.use(express.static("public"));

//MongoDB----------------------------







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

    const recipes = await recipePage.find(query);
    res.json(recipes);
});

//getting recipe by id
app.get("/recipes/:id", async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    res.json(recipe);
});

//posting new recipe
app.post("/recipes", async (req, res) => {
    const newRecipe = new Recipe({
        title: req.body.title,
        course: req.body.course,
        ingredient: req.body.ingredient,
        image: req.body.image || "",
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
        authorId: req.body.authorId,
        comments: []
    });

    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
});

//editing recipe
app.put("/recipes/:id", async (req, res) => {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        {
            title: req.body.title,
            course: req.body.course,
            ingredient: req.body.ingredient,
            image: req.body.image,
            ingredients: req.body.ingredients,
            instructions: req.body.instructions,
        },
        {new: true}
    );
    res.json(updatedRecipe);
});

//deleting recipe
app.delete("/recipes/:id", async (req, res) => {
    await Recipe.findByIdAndDelete(req.params,id);
    res.json({message: "Recipe deleted successfully."});
});

//posting comment
app.post("/recipes/:id/comments", async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    recipe.comments.push({
        name: req.body.name, 
        text: req.body.updatedRecipe
    });
    await recipe.save();
    res.status(201).json(recipe);
});

app.listen(3000, () => {
    console.log("Port 3000 is running...");
});