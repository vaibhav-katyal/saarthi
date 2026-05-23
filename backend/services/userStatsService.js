const TestpadResult = require('../models/TestpadResult');
const CodeDuelAchievement = require('../models/CodeDuelAchievement');
const Course = require('../models/Course');

/**
 * Get user's testpad results
 */
const getUserTestpadResults = async (userId, limit = 50) => {
  try {
    const results = await TestpadResult.find({ user: userId })
      .sort({ lastAttemptedAt: -1 })
      .limit(limit)
      .lean();

    return results || [];
  } catch (error) {
    console.error('Error fetching testpad results:', error);
    return [];
  }
};

/**
 * Get user's codeduel achievements
 */
const getUserCodeDuelAchievements = async (userId, limit = 50) => {
  try {
    const achievements = await CodeDuelAchievement.find({ winner: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return achievements || [];
  } catch (error) {
    console.error('Error fetching codeduel achievements:', error);
    return [];
  }
};

/**
 * Get user's course data
 */
const getUserCourseData = async (userId) => {
  try {
    const course = await Course.findOne({ user: userId }).lean();
    return course || null;
  } catch (error) {
    console.error('Error fetching course data:', error);
    return null;
  }
};

/**
 * Get aggregated user stats
 */
const getUserStats = async (userId) => {
  try {
    const testpadResults = await getUserTestpadResults(userId);
    const codeduelAchievements = await getUserCodeDuelAchievements(userId);
    const courseData = await getUserCourseData(userId);

    // Calculate stats
    const totalProblems = testpadResults.length;
    const totalSolvedProblems = testpadResults.filter(
      (r) => r.passedCases === r.totalCases
    ).length;
    const totalCodeDuelWins = codeduelAchievements.length;

    const attendance = courseData
      ? {
          attended: courseData.attended,
          delivered: courseData.delivered,
          percentage: courseData.delivered > 0
            ? Math.round((courseData.attended / courseData.delivered) * 100)
            : 0,
          required: courseData.requiredAttendance,
        }
      : null;

    return {
      totalProblems,
      totalSolvedProblems,
      solvePercentage:
        totalProblems > 0
          ? Math.round((totalSolvedProblems / totalProblems) * 100)
          : 0,
      totalCodeDuelWins,
      attendance,
      recentProblems: testpadResults.slice(0, 10),
      recentWins: codeduelAchievements.slice(0, 10),
    };
  } catch (error) {
    console.error('Error aggregating user stats:', error);
    return null;
  }
};

/**
 * Get weekly stats for user
 */
const getWeeklyStats = async (userId) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyProblems = await TestpadResult.find({
      user: userId,
      lastAttemptedAt: { $gte: startOfWeek },
    }).lean();

    const weeklyWins = await CodeDuelAchievement.find({
      winner: userId,
      createdAt: { $gte: startOfWeek },
    }).lean();

    return {
      startDate: startOfWeek,
      endDate: now,
      problemsAttempted: weeklyProblems.length,
      problemsSolved: weeklyProblems.filter(
        (p) => p.passedCases === p.totalCases
      ).length,
      codeDuelWins: weeklyWins.length,
    };
  } catch (error) {
    console.error('Error getting weekly stats:', error);
    return null;
  }
};

module.exports = {
  getUserTestpadResults,
  getUserCodeDuelAchievements,
  getUserCourseData,
  getUserStats,
  getWeeklyStats,
};
