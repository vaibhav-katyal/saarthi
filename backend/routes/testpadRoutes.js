const express = require('express');
const router = express.Router();
const { saveResult, getUserResults } = require('../controllers/testpadController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .post(saveResult)
  .get(getUserResults);

module.exports = router;
