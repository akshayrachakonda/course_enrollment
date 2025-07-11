import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const BASE_URL = import.meta.env.REACT_APP_API_URL || 'https://course-enrollment-qs1d.onrender.com';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    specialization: '',
    experience: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user._id) {
      fetchProfile();
      if (user.role === 'instructor') {
        fetchInstructorCourses();
      }
    } else {
      setError('User data not available');
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${BASE_URL}/api/users/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        setError('Please log in again to view your profile');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view this profile');
      } else if (error.response?.status === 404) {
        setError('Profile not found');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${BASE_URL}/api/users/${user._id}/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching instructor courses:', error);
      if (error.response?.status === 403) {
        setError('You do not have permission to view these courses');
      } else if (error.response?.status === 404) {
        setError('No courses found for this instructor');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch courses');
      }
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `${BASE_URL}/api/users/${user._id}`,
        profile,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccess('Profile updated successfully');
      setIsEditing(false);
      await fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        setError('Please log in again to update your profile');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to update this profile');
      } else {
        setError(error.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">Please log in to view your profile</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            {user.role === 'instructor' ? 'Instructor Profile' : 'Student Profile'}
          </Typography>
          {!isEditing ? (
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              Save Changes
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 150,
                  height: 150,
                  margin: '0 auto',
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                {profile.name ? profile.name[0].toUpperCase() : 'U'}
              </Avatar>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={profile.name || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={profile.email || ''}
                    disabled
                  />
                </Grid>
                {user.role === 'instructor' && (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Specialization"
                        name="specialization"
                        value={profile.specialization || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Years of Experience"
                        name="experience"
                        value={profile.experience || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        name="bio"
                        value={profile.bio || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        multiline
                        rows={4}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </Grid>
        </Grid>

        {user.role === 'instructor' && (
          <>
            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" gutterBottom>
              Course Statistics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {courses.length}
                  </Typography>
                  <Typography variant="subtitle1">Total Courses</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {courses.reduce((acc, course) => acc + (course.enrolledStudents?.length || 0), 0)}
                  </Typography>
                  <Typography variant="subtitle1">Total Students</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {new Date().getFullYear() - new Date(user.createdAt).getFullYear()}
                  </Typography>
                  <Typography variant="subtitle1">Years Teaching</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" gutterBottom>
              Your Courses
            </Typography>
            <List>
              {courses.map((course) => (
                <ListItem key={course._id} divider>
                  <ListItemIcon>
                    <SchoolIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={course.title}
                    secondary={`${course.enrolledStudents?.length || 0} students enrolled`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;
