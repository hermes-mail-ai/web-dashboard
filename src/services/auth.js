const API_URL = import.meta.env.VITE_API_URL;

export const login = () => {
  window.location.href = `${API_URL}/api/v1/auth/login`;
};

export const register = () => {
  window.location.href = `${API_URL}/api/v1/auth/register`;
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = `${API_URL}/api/v1/auth/logout`;
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getToken();
};
