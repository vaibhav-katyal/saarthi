const mongoose = require('mongoose');

const VaultFolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a folder name'],
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VaultFolder',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('VaultFolder', VaultFolderSchema);
