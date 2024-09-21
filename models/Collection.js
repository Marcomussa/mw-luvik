const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
});

const Collection = mongoose.model('Collection', collectionSchema, "collections");

module.exports = Collection