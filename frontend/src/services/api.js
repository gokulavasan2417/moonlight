import axios from 'axios';

let rawBaseURL = import.meta.env.VITE_API_URL || '/api';
if (rawBaseURL.startsWith('http') && !rawBaseURL.endsWith('/api')) {
  rawBaseURL = `${rawBaseURL.replace(/\/+$/, '')}/api`;
}

const api = axios.create({
  baseURL: rawBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('moonlight_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and on admin route, clear token
      if (window.location.pathname.startsWith('/erp')) {
        localStorage.removeItem('moonlight_token');
        localStorage.removeItem('moonlight_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
