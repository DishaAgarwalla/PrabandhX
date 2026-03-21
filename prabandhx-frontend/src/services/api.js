import axios from 'axios';

// Make sure this matches your BACKEND URL exactly
const API = axios.create({
  baseURL: 'http://localhost:8080/api', // CHANGE THIS if your backend uses different port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request:', config.method.toUpperCase(), config.url, token ? '✅ Token present' : '❌ No token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      console.log('Unauthorized - redirecting to login');
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;