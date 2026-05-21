const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const {
  getVaultContent,
  getVaultItem,
  createFolder,
  createItem,
  deleteItem,
  deleteFolder,
  updateItem,
} = require('../controllers/vaultController');
const { protect } = require('../middlewares/authMiddleware');
const { logActivity } = require('../utils/logger');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'saarthi-vault',
    resource_type: 'auto',
    type: 'upload',
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

router.use(protect); // All vault routes require authentication

router.route('/')
  .get(getVaultContent)
  .post(upload.single('file'), (req, res, next) => {
    // Log the activity after item creation
    const originalSend = res.send;
    res.send = function(body) {
      if (res.statusCode === 200 || res.statusCode === 201) {
        try {
          const parsed = typeof body === 'string' ? JSON.parse(body) : body;
          if (parsed.success && parsed.data) {
            const item = parsed.data;
            logActivity('vault', 'ITEM_CREATED', req.user._id, {
              itemId: item._id,
              itemType: item.type,
              itemTitle: item.title,
              folder: item.folder || 'root'
            });
          }
        } catch (e) {}
      }
      return originalSend.call(this, body);
    };
    next();
  }, createItem);

router.route('/folders')
  .post((req, res, next) => {
    // Log the activity after folder creation
    const originalSend = res.send;
    res.send = function(body) {
      if (res.statusCode === 200 || res.statusCode === 201) {
        try {
          const parsed = typeof body === 'string' ? JSON.parse(body) : body;
          if (parsed.success && parsed.data) {
            const folder = parsed.data;
            logActivity('vault', 'FOLDER_CREATED', req.user._id, {
              folderId: folder._id,
              folderName: folder.name,
              parentFolder: folder.parentFolder || 'root'
            });
          }
        } catch (e) {}
      }
      return originalSend.call(this, body);
    };
    next();
  }, createFolder);

router.route('/folders/:id')
  .delete((req, res, next) => {
    const originalSend = res.send;
    res.send = function(body) {
      if (res.statusCode === 200) {
        try {
          const parsed = typeof body === 'string' ? JSON.parse(body) : body;
          if (parsed.success) {
            logActivity('vault', 'FOLDER_DELETED', req.user._id, {
              folderId: req.params.id
            });
          }
        } catch (e) {}
      }
      return originalSend.call(this, body);
    };
    next();
  }, deleteFolder);

router.route('/:id')
  .get(getVaultItem)
  .put((req, res, next) => {
    const originalSend = res.send;
    res.send = function(body) {
      if (res.statusCode === 200) {
        try {
          const parsed = typeof body === 'string' ? JSON.parse(body) : body;
          if (parsed.success && parsed.data) {
            logActivity('vault', 'ITEM_UPDATED', req.user._id, {
              itemId: req.params.id,
              updates: Object.keys(req.body).filter(k => k !== 'file')
            });
          }
        } catch (e) {}
      }
      return originalSend.call(this, body);
    };
    next();
  }, updateItem)
  .delete((req, res, next) => {
    const originalSend = res.send;
    res.send = function(body) {
      if (res.statusCode === 200) {
        try {
          const parsed = typeof body === 'string' ? JSON.parse(body) : body;
          if (parsed.success) {
            logActivity('vault', 'ITEM_DELETED', req.user._id, {
              itemId: req.params.id
            });
          }
        } catch (e) {}
      }
      return originalSend.call(this, body);
    };
    next();
  }, deleteItem);

module.exports = router;
