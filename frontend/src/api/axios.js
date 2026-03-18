import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fk_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fk_token');
      localStorage.removeItem('fk_user');
      localStorage.removeItem('fk_session_id');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
