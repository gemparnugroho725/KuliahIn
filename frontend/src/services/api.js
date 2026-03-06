import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
});

// Attach JWT token from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('kuliahin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('kuliahin_token');
            localStorage.removeItem('kuliahin_user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// AUTH
export const authAPI = {
    demoLogin: () => api.get('/auth/demo-login'),
    getMe: () => api.get('/auth/me'),
    updatePreferences: (prefs) => api.put('/auth/preferences', prefs),
    logout: () => api.post('/auth/logout'),
};

// JADWAL
export const jadwalAPI = {
    getAll: () => api.get('/jadwal'),
    create: (data) => api.post('/jadwal', data),
    update: (id, data) => api.put(`/jadwal/${id}`, data),
    delete: (id) => api.delete(`/jadwal/${id}`),
};

// TUGAS
export const tugasAPI = {
    getAll: (params = {}) => api.get('/tugas', { params }),
    create: (data) => api.post('/tugas', data),
    update: (id, data) => api.put(`/tugas/${id}`, data),
    updateStatus: (id, status) => api.patch(`/tugas/${id}/status`, { status }),
    delete: (id) => api.delete(`/tugas/${id}`),
};

// TODO
export const todoAPI = {
    getAll: () => api.get('/todo'),
    create: (data) => api.post('/todo', data),
    update: (id, data) => api.put(`/todo/${id}`, data),
    toggle: (id) => api.patch(`/todo/${id}/toggle`),
    delete: (id) => api.delete(`/todo/${id}`),
};

// UPLOAD
export const uploadAPI = {
    upload: (formData) =>
        api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    getAll: () => api.get('/upload'),
};

// AI
export const aiAPI = {
    generateSummary: (teks, namaFile) => api.post('/ai/summary', { teks, namaFile }),
};

export default api;
