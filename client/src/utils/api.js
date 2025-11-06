// src/utils/api.js
import axios from 'axios';

// Create a new axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

/*
  This is the important part:
  We are setting up an "interceptor". This is code that
  runs BEFORE every single request you make with this 'api' instance.
*/
api.interceptors.request.use(
  (config) => {
    // Get the token from local storage
    const token = localStorage.getItem('token');
    if (token) {
      // If the token exists, add it to the 'Authorization' header
      // The format is "Bearer YOUR_TOKEN"
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // If an error happens, just pass it along
    return Promise.reject(error);
  }
);

export default api;