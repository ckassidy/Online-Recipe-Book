//sample data for seeding the database

require("dotenv").config();
const mongoose = require("mongoose");

// Import the models
const User = require("./models/user");
const Recipe = require("./models/recipe");
const Category = require("./models/category");
const Comment = require("./models/comment");

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        await User.deleteMany({});
        await Recipe.deleteMany({});
        await Category.deleteMany({});
        await Comment.deleteMany({});
        console.log("Cleared old data.");

        const users = await User.insertMany([
            { name: "Lourainne", email: "lourainne@gmail.com", password: "pass123" },
            { name: "Kassandra", email: "mkl@gmail.com", password: "pass123" },
            { name: "CK", email: "ck@gmail.com", password: "pass123" }
        ]);
        console.log("Users created!");

        const categories = await Category.insertMany([
            { name: "Appetizers" },
            { name: "Soups" },
            { name: "Main Dishes" },
            { name: "Desserts" }
        ]);
        console.log("Categories created!");

       
        const recipesData = [
            {
                title: "Chicken Adobo",
                course: "Main Dishes",
                ingredient: "Chicken",
                image: "/images/recipes/adobo.jpg",
                ingredients: "1 kg chicken thighs\n1/2 cup soy sauce\n1/2 cup vinegar\n1 head garlic\n3 bay leaves\n1 tsp peppercorn",
                instructions: "Marinate chicken in soy sauce and garlic for 30 mins.\nSear chicken until brown.\nAdd marinade, bay leaves, and peppercorn. Simmer for 20 mins.\nAdd vinegar and simmer for another 10 mins without stirring.",
                authorId: users[0]._id, // Lourainne
                category: categories[2]._id // Main Dishes
            },
            {
                title: "Sinigang na Baboy",
                course: "Soups",
                ingredient: "Pork",
                image: "/images/recipes/sinigang.jpg",
                ingredients: "1 kg pork belly\n1 pack sinigang mix\n1 radish\n1 bunch kangkong\n2 tomatoes\n1 onion",
                instructions: "Boil pork until tender.\nAdd onions and tomatoes.\nAdd sinigang mix.\nAdd radish and kangkong. Cook for 5 minutes.",
                authorId: users[1]._id, // Kassandra
                category: categories[1]._id // Soups
            },
            {
                title: "Lumpia Shanghai",
                course: "Appetizers",
                ingredient: "Pork",
                image: "/images/recipes/lumpia.jpg",
                ingredients: "500g ground pork\n1 carrot (minced)\n1 onion (minced)\nLumpia wrappers\n1 egg",
                instructions: "Mix ground pork, carrot, and onion.\nWrap the mixture in lumpia wrappers.\nFry until golden brown.",
                authorId: users[2]._id, // CK
                category: categories[0]._id // Appetizers
            },
            {
                title: "Halo-Halo",
                course: "Desserts",
                ingredient: "Vegetables",
                image: "/images/recipes/halohalo.jpg",
                ingredients: "Shaved ice\nEvaporated milk\nSweet beans\nNata de coco\nUbe halaya\nLeche flan",
                instructions: "Put all sweet ingredients in a tall glass.\nTop with shaved ice.\nPour evaporated milk.\nAdd leche flan and ube on top.",
                authorId: users[0]._id, // Lourainne
                category: categories[3]._id // Desserts
            },
            {
                title: "Lechon Kawali",
                course: "Main Dishes",
                ingredient: "Pork",
                image: "/images/recipes/lechonkawali.jpg",
                ingredients: "1 kg pork belly\nSalt and pepper\nOil for frying",
                instructions: "Boil pork belly with salt and pepper until tender.\nLet it dry completely.\nDeep fry until skin is crispy.",
                authorId: users[1]._id, // Kassandra
                category: categories[2]._id // Main Dishes
            },
            {
                title: "Pancit Bihon",
                course: "Main Dishes",
                ingredient: "Rice",
                image: "/images/recipes/pancitbihon.jpg",
                ingredients: "1 pack rice noodles\n1 cup shredded chicken\n1 cup shredded cabbage\n1 carrot (sliced)\nSoy sauce and calamansi",
                instructions: "Soak noodles in water until soft.\nSauté garlic and onion, add chicken and veggies.\nAdd noodles and soy sauce. Mix well.",
                authorId: users[2]._id, // CK
                category: categories[2]._id // Main Dishes
            },
            {
                title: "Bulalo",
                course: "Soups",
                ingredient: "Beef",
                image: "/images/recipes/bulalo.jpg",
                ingredients: "1 kg beef shank\n1 corn on the cob\n1 bunch pechay\nSalt and pepper",
                instructions: "Boil beef shank for 2 hours until tender.\nAdd corn and simmer for 10 mins.\nSeason with salt and pepper, add pechay.",
                authorId: users[0]._id, // Lourainne
                category: categories[1]._id // Soups
            },
            {
                title: "Leche Flan",
                course: "Desserts",
                ingredient: "Eggs",
                image: "/images/recipes/lecheflan.jpg",
                ingredients: "10 egg yolks\n1 can condensed milk\n1 can evaporated milk\n1 cup sugar for caramel",
                instructions: "Melt sugar in a pan to make caramel, pour into molds.\nMix egg yolks and milks, strain.\nPour mixture into molds.\nSteam for 30 minutes.",
                authorId: users[1]._id, // Kassandra
                category: categories[3]._id // Desserts
            },
            {
                title: "Kinilaw",
                course: "Appetizers",
                ingredient: "Seafood",
                image: "/images/recipes/kinilaw.jpg",
                ingredients: "500g fresh tuna (cubed)\n1/2 cup vinegar\n1 onion (chopped)\nGinger\nChili",
                instructions: "Wash tuna in vinegar.\nMix with onion, ginger, and chili.\nServe chilled.",
                authorId: users[2]._id, // CK
                category: categories[0]._id // Appetizers
            },
            {
                title: "Bicol Express",
                course: "Main Dishes",
                ingredient: "Pork",
                image: "/images/recipes/bicolexpress.jpg",
                ingredients: "1 kg pork belly (sliced)\n2 cups coconut milk\nShrimp paste\nChili peppers",
                instructions: "Sauté pork until oil comes out.\nAdd shrimp paste and chili.\nPour coconut milk and simmer until sauce thickens.",
                authorId: users[0]._id, // Lourainne
                category: categories[2]._id // Main Dishes
            }
        ];

        const savedRecipes = await Recipe.insertMany(recipesData);
        console.log("10 Recipes created!");

        await Comment.insertMany([
            {
                recipe: savedRecipes[0]._id,
                name: "Kassandra",
                text: "I tried this recipe and it was so good! Added extra garlic."
            },
            {
                recipe: savedRecipes[0]._id,
                name: "CK",
                text: "Classic! Perfect with hot rice."
            }
        ]);
        console.log("Comments created!");

        console.log("Database seeded successfully! 🌱");
        
        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding database:", error);
        mongoose.connection.close();
    }
}

seedDatabase();