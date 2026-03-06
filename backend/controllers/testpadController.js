const TestpadResult = require('../models/TestpadResult');

// @desc    Save or update a testpad result
// @route   POST /api/testpad
// @access  Private
exports.saveResult = async (req, res) => {
  try {
    const { problemTitle, passedCases, totalCases, attempts } = req.body;

    if (!problemTitle) {
      return res.status(400).json({ success: false, error: 'Problem title is required' });
    }

    // Upsert the record for this user and problem
    let result = await TestpadResult.findOne({ 
      user: req.user.id, 
      problemTitle: problemTitle 
    });

    if (result) {
      // Update existing record
      result.passedCases = passedCases;
      result.totalCases = totalCases;
      result.attempts = attempts;
      result.lastAttemptedAt = Date.now();
      await result.save();
    } else {
      // Create new record
      result = await TestpadResult.create({
        user: req.user.id,
        problemTitle,
        passedCases,
        totalCases,
        attempts: attempts || 1
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all test results for current user
// @route   GET /api/testpad
// @access  Private
exports.getUserResults = async (req, res) => {
  try {
    const results = await TestpadResult.find({ user: req.user.id }).sort('-lastAttemptedAt');

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
