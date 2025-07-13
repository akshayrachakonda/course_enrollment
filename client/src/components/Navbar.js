import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleClose();
    setDrawerOpen(false); // close mobile drawer too
  };

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const renderMobileMenu = (
    <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
      <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
        <List>
          <ListItem button onClick={() => navigate('/')}>
            <ListItemText primary="Home" />
          </ListItem>
          {user ? (
            <>
              <ListItem button onClick={() => navigate('/my-courses')}>
                <ListItemText primary="My Courses" />
              </ListItem>
              {user.role === 'instructor' && (
                <>
                  <ListItem button onClick={() => navigate('/create-course')}>
                    <ListItemText primary="Create Course" />
                  </ListItem>
                  <ListItem button onClick={() => navigate('/analytics')}>
                    <ListItemText primary="Analytics" />
                  </ListItem>
                </>
              )}
              <ListItem button onClick={() => navigate('/profile')}>
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem button onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem button onClick={() => navigate('/login')}>
                <ListItemText primary="Login" />
              </ListItem>
              <ListItem button onClick={() => navigate('/register')}>
                <ListItemText primary="Register" />
              </ListItem>
            </>
          )}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: '#1a1a1a' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { sm: 'none' } }}
            onClick={toggleDrawer(true)}
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

          {/* Desktop buttons */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
            {user ? (
              <>
                {user.role === 'instructor' && (
                  <>
                    <Button color="inherit" onClick={() => navigate('/create-course')} sx={{ mr: 2 }}>
                      Create Course
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/analytics')} sx={{ mr: 2 }}>
                      Analytics
                    </Button>
                  </>
                )}
                <Button color="inherit" onClick={() => navigate('/my-courses')} sx={{ mr: 2 }}>
                  My Courses
                </Button>
                <IconButton onClick={handleMenu}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                  <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>Profile</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate('/login')} sx={{ mr: 2 }}>
                  Login
                </Button>
                <Button color="inherit" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
    </>
  );
};

export default Navbar;
