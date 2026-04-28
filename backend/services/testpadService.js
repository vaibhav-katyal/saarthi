const TestpadResult = require('../models/TestpadResult');
const CodeDuelAchievement = require('../models/CodeDuelAchievement');
const fs = require('fs');
const path = require('path');

// Save or update a testpad result
const saveResult = async (userId, resultData) => {
  const { problemTitle, passedCases, totalCases, attempts } = resultData;

  if (!problemTitle) {
    throw new Error('Problem title is required');
  }

  // Upsert the record for this user and problem
  let result = await TestpadResult.findOne({ 
    user: userId, 
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
      user: userId,
      problemTitle,
      passedCases,
      totalCases,
      attempts: attempts || 1
    });
  }

  return result;
};

// Get all test results for a user
const getUserResults = async (userId) => {
  const results = await TestpadResult.find({ user: userId }).sort('-lastAttemptedAt');
  return results;
};

// Get weekly summary for a user
const getWeeklySummary = async (userId) => {
  const userObjId = userId.toString();
  
  // Get CURRENT week's start (this Sunday 00:00) and end (this Saturday 23:59)
  // Dashboard shows "Current Week Summary", so we look at the ongoing week
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  
  // startOfWeek = this Sunday (dayOfWeek days ago)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // endOfWeek = this Saturday (6 days after startOfWeek)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Fetch testpad results from this week (DSA problems solved)
  const testpadResults = await TestpadResult.find({
    user: userId,
    lastAttemptedAt: {
      $gte: startOfWeek,
      $lte: endOfWeek
    }
  });

  // Fetch CodeDuel achievements from this week
  // Note: winner is stored as String, so we convert userId to String for comparison
  const codeDuelWins = await CodeDuelAchievement.find({
    winner: userObjId,
    winTime: {
      $gte: startOfWeek,
      $lte: endOfWeek
    }
  });

  // Count MCQ attempts from log files (since MCQ is logged, not in DB)
  let mcqsAttempted = 0;
  const mcqTimestamps = [];
  try {
    const mcqLogPath = path.join(__dirname, '../public/logs/mcq.log');
    if (fs.existsSync(mcqLogPath)) {
      const mcqLogs = fs.readFileSync(mcqLogPath, 'utf-8');
      const lines = mcqLogs.split('\n').filter(line => line.includes(`[User: ${userId}]`) && line.includes('QUIZ_COMPLETED'));
      
      for (const line of lines) {
        const timestampMatch = line.match(/\[(.*?)\]/);
        if (timestampMatch) {
          const timestamp = new Date(timestampMatch[1]);
          if (timestamp >= startOfWeek && timestamp <= endOfWeek) {
            mcqsAttempted++;
            mcqTimestamps.push(timestamp);
          }
        }
      }
    }
  } catch (logError) {
    console.error('Error reading MCQ logs:', logError);
  }

  // Calculate metrics
  // Include both testpad problems and CodeDuel wins as problems solved
  const problemsSolved = testpadResults.length + codeDuelWins.length;

  // Calculate accuracy: average pass rate across testpad problems
  let totalAccuracy = 0;
  if (testpadResults.length > 0) {
    const accuracies = testpadResults.map(r => {
      const total = Math.max(1, r.totalCases);
      return (r.passedCases / total) * 100;
    });
    totalAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
  }
  const accuracy = Math.round(totalAccuracy);

  // Calculate active days (unique dates with any activity)
  const activeDays = new Set();
  testpadResults.forEach(r => {
    activeDays.add(new Date(r.lastAttemptedAt).toDateString());
  });
  codeDuelWins.forEach(w => {
    activeDays.add(new Date(w.winTime).toDateString());
  });
  mcqTimestamps.forEach(ts => {
    activeDays.add(new Date(ts).toDateString());
  });
  const activeDaysCount = activeDays.size;

  // Find best day (day with most activity)
  const dayActivityMap = {};
  testpadResults.forEach(r => {
    const dateStr = new Date(r.lastAttemptedAt).toDateString();
    dayActivityMap[dateStr] = (dayActivityMap[dateStr] || 0) + 1;
  });
  codeDuelWins.forEach(w => {
    const dateStr = new Date(w.winTime).toDateString();
    dayActivityMap[dateStr] = (dayActivityMap[dateStr] || 0) + 1;
  });
  mcqTimestamps.forEach(ts => {
    const dateStr = new Date(ts).toDateString();
    dayActivityMap[dateStr] = (dayActivityMap[dateStr] || 0) + 1;
  });

  let bestDay = 'N/A';
  let maxActivity = 0;
  for (const [date, count] of Object.entries(dayActivityMap)) {
    if (count > maxActivity) {
      maxActivity = count;
      bestDay = date;
    }
  }

  return {
    problemsSolved,
    mcqsAttempted,
    accuracy,
    activeDays: activeDaysCount,
    bestDay: bestDay === 'N/A' ? 'N/A' : bestDay.split(' ').slice(1, 3).join(' '),
    week: {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    }
  };
};

module.exports = {
  saveResult,
  getUserResults,
  getWeeklySummary
};

