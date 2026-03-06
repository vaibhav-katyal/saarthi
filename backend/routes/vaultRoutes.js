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
  .post(upload.single('file'), createItem);

router.route('/folders')
  .post(createFolder);

router.route('/folders/:id')
  .delete(deleteFolder);

router.route('/:id')
  .put(updateItem)
  .delete(deleteItem);

module.exports = router;
