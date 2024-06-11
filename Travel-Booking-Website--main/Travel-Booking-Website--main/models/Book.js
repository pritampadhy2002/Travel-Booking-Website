const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const BookSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  guests: {
    type: Number,
    required: true,
  },
  arrivals: {
    type: Date,
    required: true,
  },
  leaving: {
    type: Date,
    required: true,
  },
});

const BookModel = new mongoose.model("Book", BookSchema);

module.exports = BookModel;
