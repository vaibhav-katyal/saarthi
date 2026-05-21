const VaultFolder = require('../models/VaultFolder');
const VaultItem = require('../models/VaultItem');
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get a single vault item by ID
const getVaultItem = async (itemId, userId) => {
  const item = await VaultItem.findById(itemId);

  if (!item) {
    throw new Error('Item not found');
  }

  if (item.user.toString() !== userId) {
    throw new Error('Not authorized');
  }

  return item;
};

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
    console.log('📁 File Info received:', JSON.stringify(fileInfo, null, 2));
    
    // Try multiple field names for Cloudinary
    fileData = fileInfo.secure_url || fileInfo.url || fileInfo.path;
    fileName = fileInfo.original_filename || fileInfo.originalname || fileInfo.filename;
    fileSize = fileInfo.bytes || fileInfo.size;
    
    // For PDFs, add transformation flags for better delivery
    if (fileInfo.format === 'pdf' && fileData) {
      fileData = fileData.replace('/upload/', '/upload/fl_attachment/');
    }
    
    console.log('💾 Data to save:', { fileData, fileName, fileSize });
  } else {
    console.log('⚠️  No file info received');
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

  // Delete file from Cloudinary if it exists
  if (item.fileData) {
    try {
      // Extract public_id from Cloudinary URL
      // URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[public_id]
      const urlParts = item.fileData.split('/');
      const fileNameWithExtension = urlParts[urlParts.length - 1];
      const fileName = fileNameWithExtension.split('.')[0];
      const publicId = `saarthi-vault/${fileName}`;
      
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      // Continue with item deletion even if Cloudinary deletion fails
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
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = item.fileData.split('/');
        const fileNameWithExtension = urlParts[urlParts.length - 1];
        const fileName = fileNameWithExtension.split('.')[0];
        const publicId = `saarthi-vault/${fileName}`;
        
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        // Continue with item deletion even if Cloudinary deletion fails
      }
    }
    await item.deleteOne();
  }
  
  // (Optional: recursively delete child folders too, omitting for brevity)

  return {};
};

module.exports = {
  getVaultContent,
  getVaultItem,
  createFolder,
  createItem,
  updateItem,
  deleteItem,
  deleteFolder
};
