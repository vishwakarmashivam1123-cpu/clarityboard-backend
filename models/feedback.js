const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  classCode: {
    type: String,
    required: true
  },
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: true
  },
  topicRatings: {
    type: Map,
    of: String   // e.g. { "Recursion": "Confused", "Linked Lists": "Clear" }
  },
  doubt: {
    type: String,
    default: ""
  },
  lectureRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  suggestion: {
    type: String,
    default: ""
  },
  resolved: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);