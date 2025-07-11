const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { auth, isInstructor } = require('../middleware/auth');

// Get instructor dashboard analytics
router.get('/api/dashboard', auth, isInstructor, async (req, res) => {
  try {
    // Get instructor's courses
    const courses = await Course.find({ instructor: req.user._id })
      .populate('enrolledStudents', 'name email')
      .select('-__v');

    // Calculate statistics
    const totalStudents = courses.reduce((acc, course) => acc + course.enrolledStudents.length, 0);
    const totalCourses = courses.length;

    // Get enrollment trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEnrollments = await Enrollment.find({
      course: { $in: courses.map(c => c._id) },
      createdAt: { $gte: thirtyDaysAgo },
      status: 'active'
    }).select('createdAt');

    // Group enrollments by date
    const enrollmentTrends = recentEnrollments.reduce((acc, enrollment) => {
      const date = enrollment.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalStudents,
      totalCourses,
      enrollmentTrends,
      courses: courses.map(course => ({
        id: course._id,
        title: course.title,
        enrolledStudents: course.enrolledStudents.length,
        category: course.category
      }))
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 