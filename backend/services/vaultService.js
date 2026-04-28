const VaultFolder = require('../models/VaultFolder');
const VaultItem = require('../models/VaultItem');
const fs = require('fs');
const path = require('path');

// Get all vault items and folders for the current user and folder
const getVaultContent = async (userId, folderId) => {
  // Convert 'null' string or empty to actual null
  const parentFolder = (!folderId || folderId === 'null') ? null : folderId;

  const folders = await VaultFolder.find({ 
    user: userId, 
    parentFolder: parentFolder 
  }).sort('-createdAt');

  const items = await VaultItem.find({ 
    user: userId, 
    folder: parentFolder 
  }).sort('-createdAt');

  return {
    folders,
    items
  };
};

// Create a new folder in the vault
const createFolder = async (userId, folderData) => {
  const { name, parentFolder } = folderData;

  const folder = await VaultFolder.create({
    name,
    user: userId,
    parentFolder: parentFolder || null,
  });

  return folder;
};

// Create a new vault item
const createItem = async (userId, itemData, fileInfo) => {
  const { type, title, description, url, preview, folder, tags, summary } = itemData;
  
  let fileData = null;
  let fileName = null;
  let fileSize = null;

  if (fileInfo) {
    // Create a URL path to the file
    fileData = `/uploads/vault/${fileInfo.filename}`;
    fileName = fileInfo.originalname;
    fileSize = fileInfo.size;
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
    user: userId
  });

  return item;
};

// Update a vault item
const updateItem = async (itemId, userId, updateData) => {
  let item = await VaultItem.findById(itemId);

  if (!item) {
    throw new Error('Item not found');
  }

  if (item.user.toString() !== userId) {
    throw new Error('Not authorized');
  }

  item = await VaultItem.findByIdAndUpdate(itemId, updateData, {
    new: true,
    runValidators: true
  });

  return item;
};

// Delete a vault item
const deleteItem = async (itemId, userId) => {
  const item = await VaultItem.findById(itemId);

  if (!item) {
    throw new Error('Item not found');
  }

  if (item.user.toString() !== userId) {
    throw new Error('Not authorized');
  }

  // Delete file if it exists
  if (item.fileData) {
    const filePath = path.join(__dirname, '..', item.fileData);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await item.deleteOne();

  return {};
};

// Delete a vault folder
const deleteFolder = async (folderId, userId) => {
  const folder = await VaultFolder.findById(folderId);

  if (!folder) {
    throw new Error('Folder not found');
  }

  if (folder.user.toString() !== userId) {
    throw new Error('Not authorized');
  }

  // A real app should also delete all child items and folders recursively.
  // For simplicity, we just delete the folder itself or throw an error if not empty.
  
  // Simple deletion:
  await folder.deleteOne();

  // Also delete any direct children items to prevent orphans
  const items = await VaultItem.find({ folder: folderId });
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

  return {};
};

module.exports = {
  getVaultContent,
  createFolder,
  createItem,
  updateItem,
  deleteItem,
  deleteFolder
};
