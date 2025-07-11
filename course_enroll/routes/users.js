const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, isInstructor } = require('../middleware/auth');
const Course = require('../models/Course');

// Get user profile
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('Fetching user profile for ID:', req.params.id);
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      console.log('User not found for ID:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User profile found:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Update user profile
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating user profile for ID:', req.params.id);
    console.log('Update data:', req.body);
    
    // Check if user is updating their own profile
    if (req.user._id.toString() !== req.params.id) {
      console.log('Unauthorized update attempt. User ID:', req.user._id, 'Target ID:', req.params.id);
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('User not found for ID:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.specialization) user.specialization = req.body.specialization;
    if (req.body.experience !== undefined) user.experience = req.body.experience;
    if (req.body.bio) user.bio = req.body.bio;

    await user.save();
    console.log('Profile updated successfully for user:', user._id);
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get instructor's courses
router.get('/:id/courses', auth, isInstructor, async (req, res) => {
  try {
    console.log('Fetching courses for instructor:', req.params.id);
    
    // Verify the instructor is requesting their own courses
    if (req.user._id.toString() !== req.params.id) {
      console.log('Unauthorized access attempt. User ID:', req.user._id, 'Requested ID:', req.params.id);
      return res.status(403).json({ message: 'Not authorized to view these courses' });
    }

    const courses = await Course.find({ instructor: req.params.id })
      .populate('enrolledStudents', 'name email')
      .select('-__v');
    
    console.log(`Found ${courses.length} courses for instructor ${req.params.id}`);
    
    if (courses.length === 0) {
      console.log('No courses found for instructor:', req.params.id);
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

module.exports = router; 