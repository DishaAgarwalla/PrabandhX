import API from './api';
import { jwtDecode } from "jwt-decode";

export const authService = {

  // Register
  register: async (userData) => {
    try {
      console.log('authService - Sending registration request:', userData);
      const response = await API.post('/auth/register', userData);
      console.log('authService - Registration response:', response.data);
      return response;
    } catch (error) {
      console.error('authService - Registration error:', error);
      
      // Throw the error with the response data for the component to handle
      throw {
        response: {
          data: error.response?.data || "Registration failed",
          status: error.response?.status
        },
        message: error.message
      };
    }
  },

  // Login
  login: async (email, password) => {
    try {
      console.log('authService - Sending login request...');
      const response = await API.post('/auth/login', { email, password });
      console.log('authService - Login response:', response.data);

      const token = response.data.token;

      if (!token) {
        throw new Error("Token not received");
      }

      // Save token
      localStorage.setItem("token", token);

      // Decode JWT
      const decoded = jwtDecode(token);
      console.log('authService - Decoded token:', decoded);

      // Get role (might be ROLE_ADMIN, ROLE_MANAGER, ROLE_USER)
      const role = decoded.role || decoded.authorities?.[0] || 'USER';
      console.log('authService - Raw role from token:', role);

      // Save user info
      const userData = {
        email: decoded.sub || email,
        name: decoded.name || email.split('@')[0]
      };
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Save role separately for easy access
      localStorage.setItem("role", role);

      return {
        success: true,
        role: role,
        user: userData,
        token: token
      };

    } catch (error) {
      console.error('authService - Login error:', error);
      
      // Handle different error types
      let errorMessage = "Login failed";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data || error.response.statusText || errorMessage;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    console.log('authService - User logged out');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const role = localStorage.getItem('role');
      
      if (!token || !userStr) {
        return null;
      }
      
      const user = JSON.parse(userStr);
      return { user, role, token };
    } catch (error) {
      console.error('authService - Error getting current user:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Get user role
  getUserRole: () => {
    return localStorage.getItem('role');
  }
};