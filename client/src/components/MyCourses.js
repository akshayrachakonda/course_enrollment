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

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    if (!user._id) {
      console.error('User object is missing ID:', user);
      setError('User information is incomplete. Please log in again.');
      navigate('/login');
      return;
    }

    fetchCourses();
  }, [user, navigate]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate user object
      if (!user || !user._id) {
        console.error('Invalid user object:', user);
        setError('User information is not available. Please log in again.');
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      let response;
      if (user.role === 'instructor') {
        console.log('Fetching courses for instructor:', {
          userId: user._id,
          userName: user.name,
          userRole: user.role
        });

        if (!user._id) {
          throw new Error('Instructor ID is not available');
        }

        try {
          response = await axios.get(`http://localhost:5002/api/courses/instructor/${user._id}`, config);
          console.log('Instructor courses response:', response.data);
          
          if (!response.data) {
            console.error('No data received from server');
            throw new Error('No data received from server');
          }
          
          setCourses(Array.isArray(response.data) ? response.data : []);
          setEnrollments([]);
        } catch (error) {
          console.error('Error in instructor courses fetch:', error);
          if (error.response?.status === 404) {
            setError('No courses found for this instructor');
            setCourses([]);
          } else if (error.response?.status === 403) {
            console.error('Permission error:', error.response?.data);
            setError('You do not have permission to view these courses. Please make sure you are logged in as an instructor.');
            setCourses([]);
          } else {
            throw error;
          }
        }
      } else {
        // For students, fetch enrollments with populated course and instructor data
        response = await axios.get('http://localhost:5002/api/enrollments/my-enrollments', config);
        console.log('Enrollments response:', response.data);
        
        // Filter out any enrollments where the course might be null or status is dropped
        const validEnrollments = response.data.filter(enrollment => 
          enrollment.course && 
          enrollment.course.instructor &&
          enrollment.status === 'active'
        );
        setEnrollments(validEnrollments);
        
        // Extract courses from valid enrollments
        const enrolledCourses = validEnrollments.map(enrollment => ({
          ...enrollment.course,
          enrollmentId: enrollment._id,
          status: enrollment.status
        }));
        console.log('Enrolled courses:', enrolledCourses);
        setCourses(enrolledCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      if (error.response?.status === 401) {
        setError('Please log in again to view your courses');
        navigate('/login');
      } else {
        setError(error.response?.data?.message || error.message || 'Error fetching courses. Please try again.');
      }
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      // Find the course with the enrollment ID
      const course = courses.find(c => c._id === courseId);
      if (!course || !course.enrollmentId) {
        throw new Error('Enrollment information not found');
      }

      console.log('Unenrolling from course:', {
        courseId,
        enrollmentId: course.enrollmentId
      });

      await axios.delete(`http://localhost:5002/api/enrollments/${course.enrollmentId}`, config);
      setSuccessMessage('Successfully unenrolled from the course');
      await fetchCourses(); // Refresh the courses list
    } catch (error) {
      console.error('Error unenrolling:', error);
      if (error.response?.status === 401) {
        setError('Please log in again to unenroll from courses');
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to unenroll from this course');
      } else if (error.response?.status === 404) {
        setError('Enrollment not found');
      } else {
        setError(error.response?.data?.message || error.message || 'Error unenrolling from course');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      console.log('Attempting to delete course:', courseId);

      await axios.delete(`http://localhost:5002/api/courses/${courseId}`, config);
      console.log('Course deleted successfully');
      setSuccessMessage('Course deleted successfully');
      await fetchCourses(); // Refresh the courses list
    } catch (error) {
      console.error('Error deleting course:', error);
      if (error.response?.status === 401) {
        setError('Please log in again to delete courses');
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to delete this course');
      } else if (error.response?.status === 404) {
        setError('Course not found');
      } else {
        setError(error.response?.data?.message || error.message || 'Error deleting course');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Alert severity="error">
            Please log in to view your courses.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {user.role === 'instructor' ? 'My Created Courses' : 'My Enrolled Courses'}
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
        <Alert severity="info" sx={{ mb: 2 }}>
          {user.role === 'instructor' 
            ? (
              <>
                You haven't created any courses yet. 
                <Button 
                  color="primary" 
                  onClick={() => navigate('/create-course')}
                  sx={{ ml: 1 }}
                >
                  Create your first course
                </Button>
              </>
            )
            : (
              <>
                You haven't enrolled in any courses yet. 
                <Button 
                  color="primary" 
                  onClick={() => navigate('/')}
                  sx={{ ml: 1 }}
                >
                  Browse available courses
                </Button>
              </>
            )}
        </Alert>
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
                  {user.role === 'instructor' && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Students Enrolled: {course.enrolledStudents?.length || 0}
                      </Typography>
                    </Box>
                  )}
                  {user.role === 'student' && course.instructor && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Instructor: {course.instructor.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Status: {course.status || 'active'}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  {user.role === 'student' ? (
                    <Button
                      size="small"
                      color="secondary"
                      onClick={() => handleUnenroll(course._id)}
                    >
                      Unenroll
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      color="secondary"
                      onClick={() => handleDeleteCourse(course._id)}
                    >
                      Delete Course
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

export default MyCourses; 