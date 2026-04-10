const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { logActivity, getRecentActivities } = require('../utils/logger');

// Log activity endpoint - handles frontend activities that don't have backend routes
router.post('/log', protect, (req, res) => {
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

// Get recent activities for the logged-in user
router.get('/recent', protect, (req, res) => {
  try {
    console.log('[Activity Route] GET /recent - User:', req.user._id);
    const activities = getRecentActivities(req.user._id);
    console.log('[Activity Route] Returning', activities.length, 'activities');

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activities'
    });
  }
});

module.exports = router;

