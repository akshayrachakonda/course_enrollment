import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../config'; // ✅ added

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await axios.get(`${BASE_URL}/api/courses`); // ✅ updated
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Error fetching courses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      if (user.role !== 'student') {
        setError('Only students can enroll in courses');
        return;
      }

      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(`${BASE_URL}/enrollments/${courseId}`, {}, config); // ✅ updated
      setSuccessMessage('Successfully enrolled in the course');
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/my-courses');
      }, 2000);
    } catch (error) {
      console.error('Error enrolling:', error);
      if (error.response?.status === 401) {
        setError('Please log in to enroll in courses');
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to enroll in courses');
      } else if (
        error.response?.status === 400 &&
        error.response.data.message.includes('Already enrolled')
      ) {
        setError('You are already enrolled in this course');
      } else {
        setError(
          error.response?.data?.message ||
            error.message ||
            'Error enrolling in course'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Available Courses
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      {isLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : courses.length === 0 ? (
        <Alert severity="info">No courses available at the moment.</Alert>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {course.title}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Category: {course.category}
                  </Typography>
                  <Typography variant="body2" component="p">
                    {course.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Instructor: {course.instructor?.username || 'Unknown'}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  {user ? (
                    user.role === 'student' ? (
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => handleEnroll(course._id)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Enrolling...' : 'Enroll'}
                      </Button>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Instructors cannot enroll in courses
                      </Typography>
                    )
                  ) : (
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => navigate('/login')}
                    >
                      Login to Enroll
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default CourseList;
