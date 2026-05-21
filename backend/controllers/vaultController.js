const vaultService = require('../services/vaultService');

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
    console.log('createItem called with file:', req.file ? { name: req.file.filename, size: req.file.size } : 'no file');
    console.log('request body:', req.body);
    
    const item = await vaultService.createItem(req.user.id, req.body, req.file);
    
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
