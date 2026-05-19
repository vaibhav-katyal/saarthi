// API Configuration
const API_BASE_FULL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const API_BASE_URL = API_BASE_FULL;

// Socket URL (remove /api suffix if present)
export const SOCKET_URL = API_BASE_FULL.replace('/api', '');

export const apiEndpoint = (endpoint: string) => `${API_BASE_URL}${endpoint}`;
