const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  totalPlannedLectures: {
    type: Number,
    required: true,
    default: 60
  },
  requiredAttendance: {
    type: Number,
    required: true,
    default: 75
  },
  delivered: {
    type: Number,
    default: 0
  },
  attended: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
