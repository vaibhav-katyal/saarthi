const Course = require('../models/Course');

// Get all courses for a user
const getCourses = async (userId) => {
  const courses = await Course.find({ user: userId }).sort('-createdAt');
  return courses;
};

// Create a new course
const createCourse = async (userId, courseData) => {
  const { name, requiredAttendance, delivered, attended } = courseData;
  
  const course = await Course.create({
    user: userId,
    name,
    requiredAttendance,
    delivered,
    attended
  });
  
  return course;
};

// Update a course
const updateCourse = async (courseId, userId, updateData) => {
  let course = await Course.findById(courseId);
  
  if (!course) {
    throw new Error('Course not found');
  }
  
  if (course.user.toString() !== userId) {
    throw new Error('Not authorized');
  }

  course = await Course.findByIdAndUpdate(courseId, updateData, { new: true, runValidators: true });
  
  return course;
};

// Delete a course
const deleteCourse = async (courseId, userId) => {
  const course = await Course.findById(courseId);
  
  if (!course) {
    throw new Error('Course not found');
  }
  
  if (course.user.toString() !== userId) {
    throw new Error('Not authorized');
  }

  await course.deleteOne();
  
  return {};
};

module.exports = {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse
};
