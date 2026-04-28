const CodeDuelAchievement = require('../models/CodeDuelAchievement');

// Get all achievements for a user
const getUserAchievements = async (userId) => {
  console.log('Service: Fetching achievements for user:', userId);

  const achievements = await CodeDuelAchievement.find({ winner: userId })
    .sort({ winTime: -1 })
    .lean();

  console.log('Service: Found', achievements.length, 'achievements');

  return achievements;
};

// Save a new achievement
const saveAchievement = async (achievementData) => {
  console.log('===============================================');
  console.log('🎯 SAVE ACHIEVEMENT REQUEST RECEIVED');
  console.log('===============================================');
  console.log('Raw data:', achievementData);
  console.log('Data keys:', Object.keys(achievementData || {}));
  
  const { winner, winnerName, opponent, opponentName, problemTitle, difficulty, roomId } = achievementData;

  console.log('Destructured values:');
  console.log('- winner:', winner);
  console.log('- winnerName:', winnerName);
  console.log('- opponent:', opponent);
  console.log('- opponentName:', opponentName);
  console.log('- problemTitle:', problemTitle);
  console.log('- difficulty:', difficulty);
  console.log('- roomId:', roomId);

  console.log('Service: Saving achievement with data:', { winner, winnerName, opponent, opponentName, problemTitle, difficulty, roomId });

  // Relaxed validation - use fallbacks for missing fields
  const safeWinner = winner || 'unknown';
  const safeOpponent = opponent || 'unknown';
  const safeProblemTitle = problemTitle || 'CodeDuel Victory';
  const safeRoomId = roomId || 'solo';
  
  console.log('Service: Using safe values:', { safeWinner, safeOpponent, safeProblemTitle, safeRoomId });

  const achievement = new CodeDuelAchievement({
    winner: safeWinner,
    winnerName: winnerName || 'Champion',
    opponent: safeOpponent,
    opponentName: opponentName || 'Rival',
    problemTitle: safeProblemTitle,
    difficulty: difficulty || 'Medium',
    roomId: safeRoomId
  });

  console.log('Service: Created achievement object:', achievement.toObject());
  
  const savedAchievement = await achievement.save();
  console.log('Service: Achievement saved successfully to MongoDB:', savedAchievement._id);
  console.log('Service: Saved achievement data:', savedAchievement.toObject());

  return savedAchievement;
};

// Get achievement stats for a user
const getUserStats = async (userId) => {
  console.log('Service: Fetching stats for user:', userId);

  const achievements = await CodeDuelAchievement.find({ winner: userId }).lean();
  const totalWins = achievements.length;

  const byDifficulty = {
    Easy: achievements.filter(a => a.difficulty === 'Easy').length,
    Medium: achievements.filter(a => a.difficulty === 'Medium').length,
    Hard: achievements.filter(a => a.difficulty === 'Hard').length
  };

  console.log('Service: Stats for user:', { totalWins, byDifficulty });

  return {
    userId,
    totalWins,
    byDifficulty,
    achievements
  };
};

module.exports = {
  getUserAchievements,
  saveAchievement,
  getUserStats
};
