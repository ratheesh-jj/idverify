import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Identity API (Maker)
export const identityAPI = {
  create: (formData) =>
    api.post('/identity/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyRequests: (params) => api.get('/identity/my', { params }),
  getById: (id) => api.get(`/identity/${id}`),
};

// Checker API
export const checkerAPI = {
  getRequests: (params) => api.get('/checker/pending', { params }),
  getRequest: (id) => api.get(`/checker/request/${id}`),
  approve: (id, data) => api.put(`/checker/approve/${id}`, data),
  reject: (id, data) => api.put(`/checker/reject/${id}`, data),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/user', data),
  updateUser: (id, data) => api.put(`/admin/user/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/user/${id}`),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getRequests: (params) => api.get('/admin/requests', { params }),
};

export default api;
