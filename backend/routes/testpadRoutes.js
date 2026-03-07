const express = require('express');
const router = express.Router();
const { saveResult, getUserResults } = require('../controllers/testpadController');
const { protect } = require('../middlewares/authMiddleware');
const { logActivity } = require('../utils/logger');

router.use(protect);

router.route('/')
  .post((req, res, next) => {
    // Log the activity after saving test results
    const originalSend = res.send;
    res.send = function(body) {
      if (res.statusCode === 200 || res.statusCode === 201) {
        try {
          const parsed = typeof body === 'string' ? JSON.parse(body) : body;
          if (parsed.success && parsed.data) {
            const result = parsed.data;
            logActivity('testpad', 'TEST_COMPLETED', req.user._id, {
              problemTitle: result.problemTitle,
              passedCases: result.passedCases,
              totalCases: result.totalCases,
              attempts: result.attempts,
              score: result.totalCases > 0 ? Math.round((result.passedCases / result.totalCases) * 100) : 0
            });
          }
        } catch (e) {}
      }
      return originalSend.call(this, body);
    };
    next();
  }, saveResult)
  .get(getUserResults);

module.exports = router;
