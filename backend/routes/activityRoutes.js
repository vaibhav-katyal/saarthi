const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { logActivity, getRecentActivities } = require('../utils/logger');
const { getWeeklySummary } = require('../controllers/testpadController');
const { sendWeeklySummaryToUser, sendWeeklyEmailsToAllUsers } = require('../utils/emailScheduler');

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

// Get weekly summary for current user
router.get('/weekly-summary', protect, getWeeklySummary);

// TEST ENDPOINT: Send weekly summary email to current user
router.post('/test-weekly-email', protect, async (req, res) => {
  try {
    console.log(`[Test] Sending weekly email to ${req.user.email}...`);
    const result = await sendWeeklySummaryToUser(req.user._id);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Weekly summary email sent',
        messageId: result.messageId,
        previewUrl: result.previewUrl || null
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to send email'
      });
    }
  } catch (error) {
    console.error('Error in test-weekly-email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// TEST ENDPOINT: Trigger full weekly email batch (development only)
router.post('/test-weekly-batch', protect, async (req, res) => {
  try {
    // Optional: add a simple check to prevent accidental production use
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'This endpoint is disabled in production'
      });
    }

    console.log('[Test] Triggering full weekly email batch...');
    
    // Don't await — run in background so we can respond immediately
    sendWeeklyEmailsToAllUsers();
    
    res.json({
      success: true,
      message: 'Weekly email batch job started. Check server console for progress.'
    });
  } catch (error) {
    console.error('Error in test-weekly-batch:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
