import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext(null);

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check token and validate on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('http://localhost:5002/api/auth/verify');
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

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5002/api/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      if (!user || !user._id) {
        throw new Error('Invalid user data received from server');
      }

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return user;
    } catch (error) {
      if (error.response?.data?.message) {
        throw error.response.data.message;
      } else if (error.request) {
        throw 'No response from server. Please try again.';
      } else {
        throw error.message || 'Login failed';
      }
    }
  };

  // Register handler
  const register = async (name, email, password, role) => {
    try {
      const response = await axios.post('http://localhost:5002/api/auth/register', {
        name,
        email,
        password,
        role,
      });

      const { token, user } = response.data;

      if (!user || !user._id) {
        throw new Error('Invalid user data received from server');
      }

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return user;
    } catch (error) {
      if (error.response?.status === 400) {
        throw error.response.data.message || 'Invalid registration data';
      } else if (error.response?.status === 409) {
        throw 'Email already exists';
      } else if (error.request) {
        throw 'Server not responding. Please try again.';
      } else {
        throw error.message || 'Registration failed';
      }
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Auth context value
  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
