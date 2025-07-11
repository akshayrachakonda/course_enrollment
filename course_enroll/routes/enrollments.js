const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { auth, isStudent, isInstructor } = require('../middleware/auth');

// Enroll in a course
router.post('/:courseId', auth, isStudent, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
      status: 'active'
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: req.user._id,
      course: req.params.courseId,
      status: 'active'
    });

    await enrollment.save();

    // Add student to course's enrolled students
    course.enrolledStudents.push(req.user._id);
    await course.save();

    res.status(201).json(enrollment);
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Drop a course
router.delete('/:id', auth, isStudent, async (req, res) => {
  try {
    console.log('Attempting to drop course with ID:', req.params.id);
    
    // First try to find by enrollment ID
    let enrollment = await Enrollment.findById(req.params.id);
    
    // If not found by enrollment ID, try to find by course ID
    if (!enrollment) {
      console.log('Enrollment not found by ID, trying to find by course ID');
      enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: req.params.id,
        status: 'active'
      });
    }

    if (!enrollment) {
      console.log('No enrollment found');
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Verify the student owns this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
      console.log('Unauthorized attempt to drop course');
      return res.status(403).json({ message: 'Not authorized to drop this course' });
    }

    console.log('Found enrollment:', {
      id: enrollment._id,
      course: enrollment.course,
      status: enrollment.status
    });

    // Update enrollment status to dropped
    enrollment.status = 'dropped';
    await enrollment.save();

    // Remove student from course's enrolled students
    await Course.findByIdAndUpdate(
      enrollment.course,
      { $pull: { enrolledStudents: req.user._id } }
    );

    console.log('Successfully dropped the course');
    res.json({ message: 'Successfully dropped the course' });
  } catch (error) {
    console.error('Error dropping course:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get student's enrolled courses
router.get('/my-enrollments', auth, isStudent, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id,
      status: 'active'
    })
      .populate('course')
      .populate('course.instructor', 'name email')
      .select('-__v');

    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 