const mongoose = require('mongoose');

const TestpadResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problemTitle: {
    type: String,
    required: [true, 'Please provide the problem title'],
  },
  passedCases: {
    type: Number,
    required: true,
    default: 0,
  },
  totalCases: {
    type: Number,
    required: true,
    default: 0,
  },
  attempts: {
    type: Number,
    required: true,
    default: 0,
  },
  lastAttemptedAt: {
    type: Date,
    default: Date.now,
  },
});

// A user should essentially have one specific record per problem title, so we can index it
TestpadResultSchema.index({ user: 1, problemTitle: 1 }, { unique: true });

module.exports = mongoose.model('TestpadResult', TestpadResultSchema);
