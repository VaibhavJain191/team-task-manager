import axios from 'axios';

const api = axios.create({
  baseURL: 'team-task-manager-production-4216.up.railway.app',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
