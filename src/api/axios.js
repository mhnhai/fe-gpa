import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
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

export default api;

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    return api.post('/api/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  getMe: () => api.get('/api/auth/me'),
};

// Semester API
export const semesterAPI = {
  getAll: () => api.get('/api/semesters/'),
  getOne: (id) => api.get(`/api/semesters/${id}`),
  create: (data) => api.post('/api/semesters/', data),
  update: (id, data) => api.put(`/api/semesters/${id}`, data),
  delete: (id) => api.delete(`/api/semesters/${id}`),
};

// Course API
export const courseAPI = {
  getBySemester: (semesterId) => api.get(`/api/courses/semester/${semesterId}`),
  getOne: (id) => api.get(`/api/courses/${id}`),
  create: (data) => api.post('/api/courses/', data),
  update: (id, data) => api.put(`/api/courses/${id}`, data),
  delete: (id) => api.delete(`/api/courses/${id}`),
};

// GPA API
export const gpaAPI = {
  getSummary: () => api.get('/api/gpa/summary'),
  getGradeTable: () => api.get('/api/gpa/grade-table'),
};

// Catalog API
export const catalogAPI = {
  getAll: (search = '') => api.get(`/api/catalog/${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  bulkAdd: (data) => api.post('/api/catalog/bulk-add', data),
  getCount: () => api.get('/api/catalog/count'),
};

