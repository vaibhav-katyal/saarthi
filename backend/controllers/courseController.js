const courseService = require('../services/courseService');
const ragService = require('../services/ragService');
const userStatsService = require('../services/userStatsService');

// @desc    Get all courses for current user
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
  try {
    const courses = await courseService.getCourses(req.user.id);
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private
exports.createCourse = async (req, res) => {
  try {
    const course = await courseService.createCourse(req.user.id, req.body);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private
exports.updateCourse = async (req, res) => {
  try {
    const course = await courseService.updateCourse(req.params.id, req.user.id, req.body);

    // Auto-index course/attendance stats to Pinecone (non-blocking)
    try {
      const stats = await userStatsService.getUserStats(req.user.id);
      await ragService.indexUserStats(
        req.user.id,
        stats.testpadResults || [],
        stats.codeduelAchievements || [],
        course
      );
      console.log(`✅ Indexed course/attendance stats to Pinecone for user ${req.user.id}`);
    } catch (indexError) {
      console.error('⚠️ Indexing error (non-blocking):', indexError.message);
      // Don't fail the request if indexing fails
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    const statusCode = error.message === 'Not authorized' ? 401 : 404;
    res.status(statusCode).json({ success: false, error: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private
exports.deleteCourse = async (req, res) => {
  try {
    await courseService.deleteCourse(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    const statusCode = error.message === 'Not authorized' ? 401 : 404;
    res.status(statusCode).json({ success: false, error: error.message });
  }
};
