const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getVaultContent,
  createFolder,
  createItem,
  deleteItem,
  deleteFolder,
  updateItem,
} = require('../controllers/vaultController');
const { protect } = require('../middlewares/authMiddleware');
const { logActivity } = require('../utils/logger');

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/vault';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

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
