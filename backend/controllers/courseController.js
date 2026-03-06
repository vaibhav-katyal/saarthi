const Course = require('../models/Course');

// @desc    Get all courses for current user
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ user: req.user.id }).sort('-createdAt');
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
    const { name, totalPlannedLectures, requiredAttendance, delivered, attended } = req.body;
    const course = await Course.create({
      user: req.user.id,
      name,
      totalPlannedLectures,
      requiredAttendance,
      delivered,
      attended
    });
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
    let course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
    if (course.user.toString() !== req.user.id) return res.status(401).json({ success: false, error: 'Not authorized' });

    course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
    if (course.user.toString() !== req.user.id) return res.status(401).json({ success: false, error: 'Not authorized' });

    await course.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
