const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Name is required"], 
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, "Email is required"], 
        unique: true, // prevent duplicate accounts
        trim: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: [true, "Password is required"] 
    }
}, { timestamps: true }); // adds createdAt and updatedAt (automatic)

module.exports = mongoose.model("user", userSchema);