const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { auth, isInstructor } = require('../middleware/auth');

// Create a new course (Instructor only)
router.post('/', auth, isInstructor, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const course = new Course({
      title,
      description,
      category,
      instructor: req.user._id,
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'name email')
      .select('-__v');
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get instructor's courses
router.get('/instructor/:id', auth, isInstructor, async (req, res) => {
  try {
    console.log('Fetching courses for instructor:', req.params.id);
    console.log('Current user:', {
      id: req.user._id,
      role: req.user.role,
      name: req.user.name
    });
    
    // Verify the instructor is requesting their own courses
    if (req.user._id.toString() !== req.params.id) {
      console.log('Unauthorized access attempt. User ID:', req.user._id, 'Requested ID:', req.params.id);
      return res.status(403).json({ message: 'Not authorized to view these courses' });
    }

    const courses = await Course.find({ instructor: req.user._id })
      .populate('enrolledStudents', 'name email')
      .populate('instructor', 'name email')
      .select('-__v');
    
    console.log(`Found ${courses.length} courses for instructor ${req.user._id}`);
    
    if (courses.length === 0) {
      console.log('No courses found for instructor:', req.user._id);
      return res.status(404).json({ message: 'No courses found for this instructor' });
    }

    res.json(courses);
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get a single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('enrolledStudents', 'name email')
      .select('-__v');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a course (Instructor only)
router.put('/:id', auth, isInstructor, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if instructor owns the course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    const { title, description, category } = req.body;
    course.title = title || course.title;
    course.description = description || course.description;
    course.category = category || course.category;

    await course.save();
    res.json(course);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a course (Instructor only)
router.delete('/:id', auth, isInstructor, async (req, res) => {
  try {
    console.log('Attempting to delete course:', req.params.id);
    console.log('Current user:', {
      id: req.user._id,
      role: req.user.role,
      name: req.user.name
    });

    const course = await Course.findById(req.params.id);
    if (!course) {
      console.log('Course not found:', req.params.id);
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if instructor owns the course
    if (course.instructor.toString() !== req.user._id.toString()) {
      console.log('Unauthorized deletion attempt. Course instructor:', course.instructor, 'Requesting user:', req.user._id);
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await Course.deleteOne({ _id: req.params.id });
    console.log('Course deleted successfully:', req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ 
      message: 'Server error while deleting course',
      error: error.message 
    });
  }
});

module.exports = router; 