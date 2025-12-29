import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorDetail = error.response?.data?.detail || '';
      const isExpired = errorDetail.toLowerCase().includes('expired');

      localStorage.removeItem('token');

      // Store a message for the login page to display
      if (isExpired) {
        sessionStorage.setItem('authMessage', 'Your session has expired. Please log in again.');
      } else {
        sessionStorage.setItem('authMessage', 'Please log in to continue.');
      }

      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
