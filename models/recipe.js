const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, "Recipe title is required"], 
        trim: true 
    },
    course: { 
        type: String, 
        required: true 
    },
    ingredient: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String, 
        default: "" 
    },
    ingredients: { 
        type: String, 
        required: [true, "Ingredients list is required"] 
    },
    instructions: { 
        type: String, 
        required: [true, "Instructions are required"] 
    },
    authorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Category", 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model("recipe", recipeSchema);