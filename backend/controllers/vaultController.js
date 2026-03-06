const VaultFolder = require('../models/VaultFolder');
const VaultItem = require('../models/VaultItem');
const fs = require('fs');
const path = require('path');

// @desc    Get all vault items and folders for the current user and folder
// @route   GET /api/vault
// @access  Private
exports.getVaultContent = async (req, res) => {
  try {
    const { folderId } = req.query;
    
    // Convert 'null' string or empty to actual null
    const parentFolder = (!folderId || folderId === 'null') ? null : folderId;

    const folders = await VaultFolder.find({ 
      user: req.user.id, 
      parentFolder: parentFolder 
    }).sort('-createdAt');

    const items = await VaultItem.find({ 
      user: req.user.id, 
      folder: parentFolder 
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      data: {
        folders,
        items
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create a new folder in the vault
// @route   POST /api/vault/folders
// @access  Private
exports.createFolder = async (req, res) => {
  try {
    const { name, parentFolder } = req.body;

    const folder = await VaultFolder.create({
      name,
      user: req.user.id,
      parentFolder: parentFolder || null,
    });

    res.status(201).json({
      success: true,
      data: folder
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create a new vault item
// @route   POST /api/vault
// @access  Private
exports.createItem = async (req, res) => {
  try {
    const { type, title, description, url, preview, folder, tags, summary } = req.body;
    
    let fileData = null;
    let fileName = null;
    let fileSize = null;

    if (req.file) {
      // Create a URL path to the file
      fileData = `/uploads/vault/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
    }

    const itemTags = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()).filter(Boolean)) : [];

    const item = await VaultItem.create({
      type,
      title,
      description,
      url,
      preview,
      fileName,
      fileData,
      fileSize,
      summary,
      tags: itemTags,
      folder: (!folder || folder === 'null') ? null : folder,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update a vault item
// @route   PUT /api/vault/:id
// @access  Private
exports.updateItem = async (req, res) => {
  try {
    let item = await VaultItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    item = await VaultItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete a vault item
// @route   DELETE /api/vault/:id
// @access  Private
exports.deleteItem = async (req, res) => {
  try {
    const item = await VaultItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    // Delete file if it exists
    if (item.fileData) {
      const filePath = path.join(__dirname, '..', item.fileData);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete a vault folder
// @route   DELETE /api/vault/folders/:id
// @access  Private
exports.deleteFolder = async (req, res) => {
  try {
    const folder = await VaultFolder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({ success: false, error: 'Folder not found' });
    }

    if (folder.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    // A real app should also delete all child items and folders recursively.
    // For simplicity, we just delete the folder itself or throw an error if not empty.
    
    // Simple deletion:
    await folder.deleteOne();

    // Also delete any direct children items to prevent orphans
    const items = await VaultItem.find({ folder: req.params.id });
    for (const item of items) {
      if (item.fileData) {
        const filePath = path.join(__dirname, '..', item.fileData);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      await item.deleteOne();
    }
    
    // (Optional: recursively delete child folders too, omitting for brevity)

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
