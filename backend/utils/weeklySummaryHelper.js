const TestpadResult = require('../models/TestpadResult');
const CodeDuelAchievement = require('../models/CodeDuelAchievement');
const fs = require('fs');
const path = require('path');

/**
 * Get weekly summary for a specific user
 * @param {string} userId - MongoDB user ID
 * @returns {Object} - Weekly summary statistics
 */
const getWeeklySummaryForUser = async (userId) => {
  try {
    const userIdStr = userId.toString();
    
    // Get PREVIOUS week's start (last Sunday 00:00) and end (last Saturday 23:59)
    // The cron runs Sunday at 9 AM, so we want the week that just ended
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    
    // startOfWeek = last Sunday (7 days ago if today is Sunday, otherwise dayOfWeek days ago)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek - 7);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // endOfWeek = last Saturday (6 days after startOfWeek)
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
    const codeDuelWins = await CodeDuelAchievement.find({
      winner: userIdStr,
      winTime: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    });

    // Count MCQ attempts from log files
    let mcqsAttempted = 0;
    try {
      const mcqLogPath = path.join(__dirname, '../public/logs/mcq.log');
      if (fs.existsSync(mcqLogPath)) {
        const mcqLogs = fs.readFileSync(mcqLogPath, 'utf-8');
        const lines = mcqLogs.split('\n').filter(line => 
          line.includes(`[User: ${userIdStr}]`) && line.includes('QUIZ_COMPLETED')
        );
        
        for (const line of lines) {
          const timestampMatch = line.match(/\[(.*?)\]/);
          if (timestampMatch) {
            const timestamp = new Date(timestampMatch[1]);
            if (timestamp >= startOfWeek && timestamp <= endOfWeek) {
              mcqsAttempted++;
            }
          }
        }
      }
    } catch (logError) {
      console.error('Error reading MCQ logs:', logError);
    }

    // Calculate metrics
    const problemsSolved = testpadResults.length;

    // Calculate accuracy
    let totalAccuracy = 0;
    if (testpadResults.length > 0) {
      const accuracies = testpadResults.map(r => {
        const total = Math.max(1, r.totalCases);
        return (r.passedCases / total) * 100;
      });
      totalAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    }
    const accuracy = Math.round(totalAccuracy);

    // Calculate active days
    const activeDays = new Set();
    testpadResults.forEach(r => {
      activeDays.add(new Date(r.lastAttemptedAt).toDateString());
    });
    codeDuelWins.forEach(w => {
      activeDays.add(new Date(w.winTime).toDateString());
    });
    const activeDaysCount = activeDays.size;

    // Find best day
    const dayActivityMap = {};
    testpadResults.forEach(r => {
      const dateStr = new Date(r.lastAttemptedAt).toDateString();
      dayActivityMap[dateStr] = (dayActivityMap[dateStr] || 0) + 1;
    });
    codeDuelWins.forEach(w => {
      const dateStr = new Date(w.winTime).toDateString();
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
      weekStart: startOfWeek.toISOString().split('T')[0],
      weekEnd: endOfWeek.toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Error getting weekly summary for user:', error);
    return {
      problemsSolved: 0,
      mcqsAttempted: 0,
      accuracy: 0,
      activeDays: 0,
      bestDay: 'N/A',
      weekStart: '',
      weekEnd: ''
    };
  }
};

module.exports = {
  getWeeklySummaryForUser
};

