import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const authApi = {
  signup: (email: string, password: string) => api.post('/auth/signup', { email, password }),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

// Projects
export const projectsApi = {
  list: () => api.get('/projects'),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (name: string) => api.post('/projects', { name }),
  update: (id: string, name: string) => api.patch(`/projects/${id}`, { name }),
  delete: (id: string) => api.delete(`/projects/${id}`),
  regenerateApiKey: (id: string) => api.post(`/projects/${id}/api-key`),
  createInvite: (id: string, email?: string) => api.post(`/projects/${id}/invite`, { email }),
  exportCsv: (id: string) => api.post(`/projects/${id}/export/csv`, {}, { responseType: 'blob' }),
};

// Feedback
export const feedbackApi = {
  list: (projectId: string, params?: { page?: number; status?: string }) =>
    api.get(`/projects/${projectId}/feedback`, { params }),
  update: (id: string, data: { status?: string; priority?: string }) =>
    api.patch(`/feedback/${id}`, data),
  delete: (id: string) => api.delete(`/feedback/${id}`),
};
