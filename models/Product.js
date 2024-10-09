const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    child_id: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    sku: {
        type: String,
        required: true,
        unique: false
    },
    collections: [{
        id: {
            type: Number,
            unique: false,
        },
        title: {
            type: String,
        },
        _id: false,
    }],
});

const Product = mongoose.model('Product', productSchema, "products");

module.exports = Product