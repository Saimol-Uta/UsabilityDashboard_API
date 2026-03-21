import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// ── TestPlans ──
export const testPlansApi = {
  getAll: () => api.get('/TestPlans'),
  get: (id: number) => api.get(`/TestPlans/${id}`),
  create: (data: any) => api.post('/TestPlans', data),
  update: (id: number, data: any) => api.put(`/TestPlans/${id}`, data),
  delete: (id: number) => api.delete(`/TestPlans/${id}`),
};

// ── TestTasks ──
export const testTasksApi = {
  getAll: (testPlanId?: number) => api.get('/TestTasks', { params: { testPlanId } }),
  get: (id: number) => api.get(`/TestTasks/${id}`),
  create: (data: any) => api.post('/TestTasks', data),
  update: (id: number, data: any) => api.put(`/TestTasks/${id}`, data),
  delete: (id: number) => api.delete(`/TestTasks/${id}`),
};

// ── ModeratorScripts ──
export const moderatorScriptsApi = {
  getAll: (testPlanId?: number) => api.get('/ModeratorScripts', { params: { testPlanId } }),
  get: (id: number) => api.get(`/ModeratorScripts/${id}`),
  create: (data: any) => api.post('/ModeratorScripts', data),
  update: (id: number, data: any) => api.put(`/ModeratorScripts/${id}`, data),
  delete: (id: number) => api.delete(`/ModeratorScripts/${id}`),
};

// ── ObservationLogs ──
export const observationLogsApi = {
  getAll: (testPlanId?: number, testTaskId?: number) =>
    api.get('/ObservationLogs', { params: { testPlanId, testTaskId } }),
  get: (id: number) => api.get(`/ObservationLogs/${id}`),
  create: (data: any) => api.post('/ObservationLogs', data),
  update: (id: number, data: any) => api.put(`/ObservationLogs/${id}`, data),
  delete: (id: number) => api.delete(`/ObservationLogs/${id}`),
};

// ── Findings ──
export const findingsApi = {
  getAll: (testPlanId?: number, severity?: string) =>
    api.get('/Findings', { params: { testPlanId, severity } }),
  get: (id: number) => api.get(`/Findings/${id}`),
  create: (data: any) => api.post('/Findings', data),
  update: (id: number, data: any) => api.put(`/Findings/${id}`, data),
  delete: (id: number) => api.delete(`/Findings/${id}`),
};

// ── ImprovementActions ──
export const improvementActionsApi = {
  getAll: (findingId?: number, status?: string) =>
    api.get('/ImprovementActions', { params: { findingId, status } }),
  get: (id: number) => api.get(`/ImprovementActions/${id}`),
  create: (data: any) => api.post('/ImprovementActions', data),
  update: (id: number, data: any) => api.put(`/ImprovementActions/${id}`, data),
  updateStatus: (id: number, status: string) =>
    api.patch(`/ImprovementActions/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/ImprovementActions/${id}`),
};

// ── Dashboard ──
export const dashboardApi = {
  getStats: (testPlanId?: number) => api.get('/Dashboard/stats', { params: { testPlanId } }),
};

export default api;
