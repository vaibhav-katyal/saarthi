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

// @desc    Get weekly summary for current user
// @route   GET /api/activity/weekly-summary
// @access  Private
exports.getWeeklySummary = async (req, res) => {
  try {
    const CodeDuelAchievement = require('../models/CodeDuelAchievement');
    const fs = require('fs');
    const path = require('path');
    
    const userId = req.user.id.toString(); // Convert ObjectId to String for CodeDuel comparison
    
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
      user: req.user.id,
      lastAttemptedAt: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    });

    // Fetch CodeDuel achievements (MCQ-like activity) from this week
    // Note: winner is stored as String, so we convert userId to String for comparison
    const codeDuelWins = await CodeDuelAchievement.find({
      winner: userId,
      winTime: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    });

    // Count MCQ attempts from log files (since MCQ is logged, not in DB)
    let mcqsAttempted = 0;
    try {
      const mcqLogPath = path.join(__dirname, '../public/logs/mcq.log');
      if (fs.existsSync(mcqLogPath)) {
        const mcqLogs = fs.readFileSync(mcqLogPath, 'utf-8');
        const lines = mcqLogs.split('\n').filter(line => line.includes(`[User: ${req.user._id}]`) && line.includes('QUIZ_COMPLETED'));
        
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

    let bestDay = 'N/A';
    let maxActivity = 0;
    for (const [date, count] of Object.entries(dayActivityMap)) {
      if (count > maxActivity) {
        maxActivity = count;
        bestDay = date;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        problemsSolved,
        mcqsAttempted,
        accuracy,
        activeDays: activeDaysCount,
        bestDay: bestDay === 'N/A' ? 'N/A' : bestDay.split(' ').slice(1, 3).join(' '),
        week: {
          start: startOfWeek.toISOString().split('T')[0],
          end: endOfWeek.toISOString().split('T')[0]
        }
      }
    });
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
