const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    category: String,
    image: String,

    // Relationship: product belongs to a user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Product', ProductSchema);