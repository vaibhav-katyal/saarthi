const codeduelService = require('../services/codeduelService');

// Get all achievements for a user
exports.getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Controller: Fetching achievements for user:', userId);

    const achievements = await codeduelService.getUserAchievements(userId);

    res.json({
      success: true,
      count: achievements.length,
      achievements
    });
  } catch (error) {
    console.error('Controller: Error fetching user achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements',
      error: error.message
    });
  }
};

// Save a new achievement
exports.saveAchievement = async (req, res) => {
  try {
    console.log('===============================================');
    console.log('🎯 SAVE ACHIEVEMENT CONTROLLER');
    console.log('===============================================');

    const savedAchievement = await codeduelService.saveAchievement(req.body);

    res.json({
      success: true,
      message: 'Achievement saved successfully',
      achievement: savedAchievement
    });
  } catch (error) {
    console.error('Controller: Error saving achievement:', error);
    console.error('Controller: Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      errors: error.errors
    });
    res.status(500).json({
      success: false,
      message: 'Failed to save achievement',
      error: error.message,
      details: error.errors || error
    });
  }
};

// Get achievement stats for a user
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Controller: Fetching stats for user:', userId);

    const stats = await codeduelService.getUserStats(userId);

    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Controller: Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
};
