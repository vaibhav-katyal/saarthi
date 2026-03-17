const CodeDuelAchievement = require('../models/CodeDuelAchievement');

// Get all achievements for a user
exports.getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Backend: Fetching achievements for user:', userId);

    const achievements = await CodeDuelAchievement.find({ winner: userId })
      .sort({ winTime: -1 })
      .lean();

    console.log('Backend: Found', achievements.length, 'achievements');

    res.json({
      success: true,
      count: achievements.length,
      achievements
    });
  } catch (error) {
    console.error('Backend: Error fetching user achievements:', error);
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
    console.log('🎯 SAVE ACHIEVEMENT REQUEST RECEIVED');
    console.log('===============================================');
    console.log('Raw request body:', req.body);
    console.log('Body keys:', Object.keys(req.body || {}));
    
    const { winner, winnerName, opponent, opponentName, problemTitle, difficulty, roomId } = req.body;

    console.log('Destructured values:');
    console.log('- winner:', winner);
    console.log('- winnerName:', winnerName);
    console.log('- opponent:', opponent);
    console.log('- opponentName:', opponentName);
    console.log('- problemTitle:', problemTitle);
    console.log('- difficulty:', difficulty);
    console.log('- roomId:', roomId);

    console.log('Backend: Saving achievement with data:', { winner, winnerName, opponent, opponentName, problemTitle, difficulty, roomId });

    // Relaxed validation - use fallbacks for missing fields
    const safeWinner = winner || 'unknown';
    const safeOpponent = opponent || 'unknown';
    const safeProblemTitle = problemTitle || 'CodeDuel Victory';
    const safeRoomId = roomId || 'solo';
    
    console.log('Backend: Using safe values:', { safeWinner, safeOpponent, safeProblemTitle, safeRoomId });

    const achievement = new CodeDuelAchievement({
      winner: safeWinner,
      winnerName: winnerName || 'Champion',
      opponent: safeOpponent,
      opponentName: opponentName || 'Rival',
      problemTitle: safeProblemTitle,
      difficulty: difficulty || 'Medium',
      roomId: safeRoomId
    });

    console.log('Backend: Created achievement object:', achievement.toObject());
    
    const savedAchievement = await achievement.save();
    console.log('Backend: Achievement saved successfully to MongoDB:', savedAchievement._id);
    console.log('Backend: Saved achievement data:', savedAchievement.toObject());

    res.json({
      success: true,
      message: 'Achievement saved successfully',
      achievement: savedAchievement
    });
  } catch (error) {
    console.error('Backend: Error saving achievement:', error);
    console.error('Backend: Error details:', {
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
    console.log('Backend: Fetching stats for user:', userId);

    const achievements = await CodeDuelAchievement.find({ winner: userId }).lean();
    const totalWins = achievements.length;

    const byDifficulty = {
      Easy: achievements.filter(a => a.difficulty === 'Easy').length,
      Medium: achievements.filter(a => a.difficulty === 'Medium').length,
      Hard: achievements.filter(a => a.difficulty === 'Hard').length
    };

    console.log('Backend: Stats for user:', { totalWins, byDifficulty });

    res.json({
      success: true,
      userId,
      totalWins,
      byDifficulty,
      achievements
    });
  } catch (error) {
    console.error('Backend: Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
};
