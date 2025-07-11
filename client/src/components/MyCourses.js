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
      navigate('/login');
      return;
    }

    if (!user._id) {
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

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      let response;
      if (user.role === 'instructor') {
        response = await axios.get(
          `https://course-enrollment-qs1d.onrender.com/api/courses/instructor/${user._id}`,
          config
        );
        setCourses(Array.isArray(response.data) ? response.data : []);
        setEnrollments([]);
      } else {
        response = await axios.get(
          'https://course-enrollment-qs1d.onrender.com/api/enrollments/my-enrollments',
          config
        );

        const validEnrollments = response.data.filter(enrollment =>
          enrollment.course &&
          enrollment.course.instructor &&
          enrollment.status === 'active'
        );

        setEnrollments(validEnrollments);

        const enrolledCourses = validEnrollments.map(enrollment => ({
          ...enrollment.course,
          enrollmentId: enrollment._id,
          status: enrollment.status
        }));

        setCourses(enrolledCourses);
      }
    } catch (error) {
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
      if (!token) throw new Error('No authentication token found');

      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const course = courses.find(c => c._id === courseId);
      if (!course || !course.enrollmentId) throw new Error('Enrollment information not found');

      await axios.delete(
        `https://course-enrollment-qs1d.onrender.com/api/enrollments/${course.enrollmentId}`,
        config
      );

      setSuccessMessage('Successfully unenrolled from the course');
      await fetchCourses();
    } catch (error) {
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
      if (!token) throw new Error('No authentication token found');

      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      await axios.delete(
        `https://course-enrollment-qs1d.onrender.com/api/courses/${courseId}`,
        config
      );

      setSuccessMessage('Course deleted successfully');
      await fetchCourses();
    } catch (error) {
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
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      {isLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : courses.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          {user.role === 'instructor' ? (
            <>
              You haven't created any courses yet.
              <Button color="primary" onClick={() => navigate('/create-course')} sx={{ ml: 1 }}>
                Create your first course
              </Button>
            </>
          ) : (
            <>
              You haven't enrolled in any courses yet.
              <Button color="primary" onClick={() => navigate('/')} sx={{ ml: 1 }}>
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
                  <Typography variant="h6">{course.title}</Typography>
                  <Typography color="textSecondary">Category: {course.category}</Typography>
                  <Typography variant="body2">{course.description}</Typography>
                  {user.role === 'instructor' && (
                    <Box mt={2}>
                      <Typography variant="body2" color="textSecondary">
                        Students Enrolled: {course.enrolledStudents?.length || 0}
                      </Typography>
                    </Box>
                  )}
                  {user.role === 'student' && course.instructor && (
                    <Box mt={2}>
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
                    <Button size="small" color="secondary" onClick={() => handleUnenroll(course._id)}>
                      Unenroll
                    </Button>
                  ) : (
                    <Button size="small" color="secondary" onClick={() => handleDeleteCourse(course._id)}>
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
