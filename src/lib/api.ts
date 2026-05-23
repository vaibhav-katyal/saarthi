import axios from 'axios';

// API Configuration
const API_BASE_FULL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_BASE_URL = API_BASE_FULL;

// Socket URL (remove /api suffix if present)
export const SOCKET_URL = API_BASE_FULL.replace('/api', '');

export const apiEndpoint = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
