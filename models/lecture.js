const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  classCode: {
    type: String,
    required: true
  },
  topics: {
    type: [String],   // an array of strings, e.g. ["Recursion", "Linked Lists"]
    required: true
  },
  lectureDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lecture', lectureSchema);