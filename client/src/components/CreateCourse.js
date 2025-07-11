import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import BASE_URL from '../config'; // ✅ Import the base URL

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const categories = [
    'Programming',
    'Web Development',
    'Data Science',
    'Mathematics',
    'Business',
    'Language',
    'Other',
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Course title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Course description is required');
      return false;
    }
    if (!formData.category) {
      setError('Please select a category');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      console.log('Creating course with data:', formData);

      const courseData = {
        ...formData,
        instructor: user._id
      };

      const response = await axios.post(`${BASE_URL}/courses`, courseData, config); // ✅ Updated URL

      console.log('Course created successfully:', response.data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-courses');
      }, 2000);
    } catch (error) {
      console.error('Error creating course:', error);
      if (error.response?.status === 401) {
        setError('Please log in again to create a course');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to create courses');
      } else {
        setError(error.response?.data?.message || 'Error creating course. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== 'instructor') {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Alert severity="error">
            Only instructors can create courses. Please log in as an instructor.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Create New Course
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Course created successfully! Redirecting...
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Course Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
              error={!!error && error.includes('title')}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              required
              error={!!error && error.includes('description')}
              disabled={isLoading}
            />
            <FormControl fullWidth margin="normal" required error={!!error && error.includes('category')}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Category"
                disabled={isLoading}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                  Creating Course...
                </>
              ) : (
                'Create Course'
              )}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateCourse;
