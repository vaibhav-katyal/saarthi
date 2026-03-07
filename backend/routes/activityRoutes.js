const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { logActivity } = require('../utils/logger');

// Log activity endpoint - handles frontend activities that don't have backend routes
router.use(protect);

router.post('/log', (req, res) => {
  try {
    const { section, action, details } = req.body;
    
    if (!section || !action) {
      return res.status(400).json({
        success: false,
        error: 'Section and action are required'
      });
    }

    // Log the activity
    logActivity(section, action, req.user._id, details || {});

    res.json({
      success: true,
      message: 'Activity logged successfully'
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log activity'
    });
  }
});

module.exports = router;

