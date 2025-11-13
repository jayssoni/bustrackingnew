import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, role) => api.post('/auth/register', { name, email, password, role }),
};

// Routes API
export const routesAPI = {
  getAll: () => api.get('/routes'),
  getById: (id) => api.get(`/routes/${id}`),
  create: (data) => api.post('/routes', data),
  update: (id, data) => api.put(`/routes/${id}`, data),
  delete: (id) => api.delete(`/routes/${id}`),
};

// Buses API
export const busesAPI = {
  getAll: () => api.get('/buses'),
  getById: (id) => api.get(`/buses/${id}`),
  create: (data) => api.post('/buses', data),
  update: (id, data) => api.put(`/buses/${id}`, data),
  delete: (id) => api.delete(`/buses/${id}`),
  toggleStatus: (id) => api.patch(`/buses/${id}/toggle-status`),
  updateLocation: (id, data) => api.put(`/buses/${id}/location`, data),
};

// Admin API
export const adminAPI = {
  getDrivers: () => api.get('/admin/drivers'),
  getUsers: () => api.get('/admin/users'),
  assignBus: (busId, driverId) => api.put(`/admin/buses/${busId}/assign`, { driverId }),
  getStats: () => api.get('/admin/stats'),
  createDriver: (data) => api.post('/admin/drivers', data),
  deleteDriver: (id) => api.delete(`/admin/drivers/${id}`),
};

export default api;
