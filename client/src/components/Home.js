import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SecurityIcon from '@mui/icons-material/Security';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBrowseCourses = () => {
    if (user) {
      // If user is logged in, show available courses
      navigate('/courses');
    } else {
      // If user is not logged in, show login page with a message
      navigate('/login', { 
        state: { 
          message: 'Please login to browse available courses',
          redirectTo: '/courses'
        }
      });
    }
  };

  const handleGetStarted = () => {
    if (user) {
      // If user is logged in, navigate based on their role
      if (user.role === 'instructor') {
        navigate('/create-course');
      } else {
        navigate('/my-courses');
      }
    } else {
      // If user is not logged in, navigate to registration
      navigate('/register', {
        state: {
          message: 'Create an account to get started with your learning journey'
        }
      });
    }
  };

  const features = [
    {
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      title: 'Quality Courses',
      description: 'Access a wide range of high-quality courses from expert instructors.',
    },
    {
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      title: 'Interactive Learning',
      description: 'Engage with instructors and fellow students in a collaborative environment.',
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      title: 'Progress Tracking',
      description: 'Monitor your learning progress and achievements with detailed analytics.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure Platform',
      description: 'Your data and progress are protected with industry-standard security.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gradient Background */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(25, 118, 210, 0.1) 0%, rgba(220, 0, 78, 0.1) 100%)',
            zIndex: 1,
          }}
        />
        
        {/* Content */}
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                component="h1"
                variant="h2"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1976d2 30%, #dc004e 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Welcome to Malla Reddy University
              </Typography>
              <Typography variant="h5" color="text.secondary" paragraph>
                Experience excellence in education through our comprehensive course management system. Start your learning journey today!
              </Typography>
              {user && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Welcome back, {user.name}! {user.role === 'instructor' ? 'Ready to create courses?' : 'Ready to learn?'}
                </Alert>
              )}
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleBrowseCourses}
                  sx={{ 
                    mr: 2,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                    },
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative',
                    zIndex: 3,
                  }}
                >
                  Browse Courses
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                    },
                    transition: 'all 0.2s ease-in-out',
                    position: 'relative',
                    zIndex: 3,
                  }}
                >
                  {user ? (user.role === 'instructor' ? 'Create Course' : 'View My Courses') : 'Get Started'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography
          component="h2"
          variant="h3"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Why Choose Us?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 