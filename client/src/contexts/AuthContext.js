import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('http://localhost:5002/api/auth/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          console.log('Token verification response:', response.data);
          setUser(response.data.user);
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email });
      
      const response = await axios.post('http://localhost:5002/api/auth/login', {
        email,
        password,
      });

      console.log('Login response:', response.data);

      const { token, user } = response.data;
      
      if (!user || !user._id) {
        throw new Error('Invalid user data received from server');
      }

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        throw error.response.data.message || 'Login failed';
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw 'No response from server. Please try again.';
      } else {
        console.error('Error setting up request:', error.message);
        throw error.message || 'Error setting up request. Please try again.';
      }
    }
  };

  const register = async (name, email, password, role) => {
    try {
      console.log('Attempting registration with:', { name, email, role });
      
      const response = await axios.post('http://localhost:5002/api/auth/register', {
        name,
        email,
        password,
        role,
      });

      console.log('Registration response:', response.data);

      const { token, user } = response.data;
      
      if (!user || !user._id) {
        throw new Error('Invalid user data received from server');
      }

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return user;
    } catch (error) {
      console.error('Registration error details:', {
        error: error,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 400) {
        throw error.response.data.message || 'Invalid registration data';
      } else if (error.response?.status === 409) {
        throw 'Email already exists';
      } else if (error.response) {
        throw error.response.data.message || 'Registration failed';
      } else if (error.request) {
        throw 'Server not responding. Please try again.';
      } else {
        throw error.message || 'Error setting up registration. Please try again.';
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}; 