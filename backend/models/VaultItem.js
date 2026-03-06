const mongoose = require('mongoose');

const VaultItemSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['link', 'snippet', 'pdf', 'other'],
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  url: {
    type: String,
  },
  preview: {
    type: String,
  },
  fileName: {
    type: String,
  },
  fileData: {
    type: String, // Path to the uploaded file or Base64 string
  },
  fileSize: {
    type: Number,
  },
  summary: {
    type: String, // AI-generated summary
  },
  tags: [
    {
      type: String,
    },
  ],
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VaultFolder',
    default: null,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('VaultItem', VaultItemSchema);
