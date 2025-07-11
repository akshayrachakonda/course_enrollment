import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
    handleClose();
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#1a1a1a' }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <SchoolIcon sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Malla Reddy University
        </Typography>

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
          {user ? (
            <>
              {user.role === 'instructor' && (
                <>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/create-course')}
                    sx={{ mr: 2 }}
                  >
                    Create Course
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => navigate('/analytics')}
                    sx={{ mr: 2 }}
                  >
                    Analytics
                  </Button>
                </>
              )}
              <Button
                color="inherit"
                onClick={() => navigate('/my-courses')}
                sx={{ mr: 2 }}
              >
                My Courses
              </Button>
              <IconButton onClick={handleMenu}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    bgcolor: '#1a1a1a',
                    color: '#fff',
                    '& .MuiMenuItem-root': {
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }
                  }
                }}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                sx={{ mr: 2 }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
