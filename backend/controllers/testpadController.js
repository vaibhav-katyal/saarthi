const testpadService = require('../services/testpadService');

// @desc    Save or update a testpad result
// @route   POST /api/testpad
// @access  Private
exports.saveResult = async (req, res) => {
  try {
    const result = await testpadService.saveResult(req.user.id, req.body);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all test results for current user
// @route   GET /api/testpad
// @access  Private
exports.getUserResults = async (req, res) => {
  try {
    const results = await testpadService.getUserResults(req.user.id);
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get weekly summary for current user
// @route   GET /api/activity/weekly-summary
// @access  Private
exports.getWeeklySummary = async (req, res) => {
  try {
    const data = await testpadService.getWeeklySummary(req.user.id);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
