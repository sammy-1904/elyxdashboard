// src/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Centralized error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const eventAPI = {
  getConversations: () => api.get('/conversations'),
  getDecisions:     () => api.get('/decisions'),
  getJourney:       () => api.get('/journey'),
  getMemberProfile: () => api.get('/member/profile'),
  getMetrics:       () => api.get('/metrics'),
  getHealth:        () => api.get('/health'),
};

export default api;
