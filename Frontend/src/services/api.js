import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ss_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ss_token');
      localStorage.removeItem('ss_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// Users
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  toggleStatus: (id) => api.put(`/users/${id}/toggle-status`),
  delete: (id) => api.delete(`/users/${id}`),
  follow: (id) => api.post(`/users/${id}/follow`),
  getTopCreators: () => api.get('/users/creators/top'),
};

// Videos
export const videoAPI = {
  getAll: (params) => api.get('/videos', { params }),
  getById: (id) => api.get(`/videos/${id}`),
  upload: (data, config = {}) => api.post('/videos', data, { headers: { 'Content-Type': 'multipart/form-data' }, ...config }),
  update: (id, data) => api.put(`/videos/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/videos/${id}`),
  like: (id, action) => api.post(`/videos/${id}/like`, { action }),
  updateProgress: (id, data) => api.put(`/videos/${id}/progress`, data),
  getHistory: (params) => api.get('/videos/history', { params }),
  getContinue: () => api.get('/videos/continue'),
  getMyVideos: (params) => api.get('/videos/creator/my', { params }),
  adminGetAll: (params) => api.get('/videos/admin/all', { params }),
};

// Categories
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getAdminAll: () => api.get('/categories/all'),
  create: (data) => api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Streams
export const streamAPI = {
  getAll: (params) => api.get('/streams', { params }),
  getById: (id) => api.get(`/streams/${id}`),
  create: (data) => api.post('/streams', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/streams/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  start: (id) => api.put(`/streams/${id}/start`),
  end: (id) => api.put(`/streams/${id}/end`),
  delete: (id) => api.delete(`/streams/${id}`),
  getMy: () => api.get('/streams/creator/my'),
};

// Chat
export const chatAPI = {
  getMessages: (room, params) => api.get(`/chat/${room}/messages`, { params }),
  send: (data) => api.post('/chat/send', data),
  delete: (id) => api.delete(`/chat/${id}`),
};

// Subscriptions
export const subscriptionAPI = {
  getMy: () => api.get('/subscriptions/me'),
  subscribe: (data) => api.post('/subscriptions/subscribe', data),
  cancel: (data) => api.post('/subscriptions/cancel', data),
  getBilling: () => api.get('/subscriptions/billing'),
  getAll: (params) => api.get('/subscriptions/all', { params }),
};

// Analytics
export const analyticsAPI = {
  getAdmin: () => api.get('/analytics/admin'),
  getCreator: () => api.get('/analytics/creator'),
};

export default api;
