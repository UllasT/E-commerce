import axios from 'axios';

function getApiBase() {
  const base = (import.meta.env.VITE_API_URL as string) || '/api/';
  return base.endsWith('/') ? base : `${base}/`;
}

const api = axios.create({ baseURL: getApiBase() });

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
