
import axios from 'axios';

// Create a base axios instance
const api = axios.create({
  baseURL: 'http://192.168.0.3:3334',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle auth errors (401/403)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear local storage on auth errors
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to login if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
