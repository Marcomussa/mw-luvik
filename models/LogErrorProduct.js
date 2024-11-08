const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  type: String,
  productId: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  additionalInfo: Object,
});

const LogErrorProduct = mongoose.model("logSchema", logSchema, "updateLogs");

module.exports = LogErrorProduct;
