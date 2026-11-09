const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    recipe: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Recipe", 
        required: true 
    },
    name: { 
        type: String, 
        required: [true, "Commenter name is required"] 
    },
    text: { 
        type: String, 
        required: [true, "Comment text is required"] 
    }
}, { timestamps: true });

module.exports = mongoose.model("comment", commentSchema);