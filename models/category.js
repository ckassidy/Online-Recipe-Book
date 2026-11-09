const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, "Category name is required"],
        unique: true,
        enum: {
            values: ["Appetizers", "Soups", "Main Dishes", "Desserts"],
            message: "{VALUE} is not a valid category"
        }
    }
}, { timestamps: true });

module.exports = mongoose.model("category", categorySchema);