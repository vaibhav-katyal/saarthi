const vaultService = require('../services/vaultService');
const ragService = require('../services/ragService');
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Get all vault items and folders for the current user and folder
// @route   GET /api/vault
// @access  Private
exports.getVaultContent = async (req, res) => {
  try {
    const { folderId } = req.query;
    const data = await vaultService.getVaultContent(req.user.id, folderId);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('getVaultContent error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get a single vault item by ID
// @route   GET /api/vault/:id
// @access  Private
exports.getVaultItem = async (req, res) => {
  try {
    const item = await vaultService.getVaultItem(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('getVaultItem error:', error);
    const statusCode = error.message === 'Not authorized' ? 401 : 404;
    res.status(statusCode).json({ success: false, error: error.message });
  }
};

// @desc    Create a new folder in the vault
// @route   POST /api/vault/folders
// @access  Private
exports.createFolder = async (req, res) => {
  try {
    const folder = await vaultService.createFolder(req.user.id, req.body);
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
    console.log('createItem called');
    console.log('File:', req.file ? { fieldname: req.file.fieldname, mimetype: req.file.mimetype, size: req.file.size } : 'no file');
    console.log('Body:', req.body);
    
    // If file exists, upload to Cloudinary
    if (req.file) {
      try {
        // Upload file to Cloudinary from buffer
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'saarthi-vault',
              resource_type: 'auto',
              public_id: `${req.user.id}-${Date.now()}`,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });

        console.log('✅ Cloudinary upload success:', {
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
        });

        // Attach Cloudinary result to req.file for service to use
        req.file.secure_url = result.secure_url;
        req.file.original_filename = req.file.originalname;
        req.file.bytes = result.bytes;
        req.file.format = result.format;
      } catch (uploadError) {
        console.error('❌ Cloudinary upload failed:', uploadError);
        return res.status(500).json({ 
          success: false, 
          error: `File upload failed: ${uploadError.message}` 
        });
      }
    }

    const item = await vaultService.createItem(req.user.id, req.body, req.file);

    // Auto-index to Pinecone (non-blocking)
    try {
      await ragService.indexUserVault(req.user.id, [item]);
      console.log(`✅ Indexed vault item ${item._id} to Pinecone`);
    } catch (indexError) {
      console.error('⚠️ Indexing error (non-blocking):', indexError.message);
      // Don't fail the request if indexing fails
    }

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('createItem error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

// @desc    Update a vault item
// @route   PUT /api/vault/:id
// @access  Private
exports.updateItem = async (req, res) => {
  try {
    const item = await vaultService.updateItem(req.params.id, req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    const statusCode = error.message === 'Not authorized' ? 401 : 404;
    res.status(statusCode).json({ success: false, error: error.message });
  }
};

// @desc    Delete a vault item
// @route   DELETE /api/vault/:id
// @access  Private
exports.deleteItem = async (req, res) => {
  try {
    await vaultService.deleteItem(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    const statusCode = error.message === 'Not authorized' ? 401 : 404;
    res.status(statusCode).json({ success: false, error: error.message });
  }
};

// @desc    Delete a vault folder
// @route   DELETE /api/vault/folders/:id
// @access  Private
exports.deleteFolder = async (req, res) => {
  try {
    await vaultService.deleteFolder(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    const statusCode = error.message === 'Not authorized' ? 401 : 404;
    res.status(statusCode).json({ success: false, error: error.message });
  }
};
