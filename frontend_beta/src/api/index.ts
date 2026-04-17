import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

export type Guid = string;

// ── TestPlans ──
export const testPlansApi = {
    getAll: () => api.get('/TestPlans'),
    get: (id: Guid) => api.get(`/TestPlans/${id}`),
    create: (data: any) => api.post('/TestPlans', data),
    update: (id: Guid, data: any) => api.put(`/TestPlans/${id}`, data),
    updateStatus: (id: Guid, status: string) => api.patch(`/TestPlans/${id}/status`, `"${status}"`, { headers: { 'Content-Type': 'application/json' } }),
    delete: (id: Guid) => api.delete(`/TestPlans/${id}`),
};

// ── TestTasks ──
export const testTasksApi = {
    getByPlan: (planId: Guid) => api.get(`/TestTasks/by-plan/${planId}`),
    get: (id: Guid) => api.get(`/TestTasks/${id}`),
    create: (data: any) => api.post('/TestTasks', data),
    update: (id: Guid, data: any) => api.put(`/TestTasks/${id}`, data),
    delete: (id: Guid) => api.delete(`/TestTasks/${id}`),
};

// ── ModeratorScripts ──
export const moderatorScriptsApi = {
    getByPlan: (planId: Guid) => api.get(`/ModeratorScripts/by-plan/${planId}`),
    get: (id: Guid) => api.get(`/ModeratorScripts/${id}`),
    create: (data: any) => api.post('/ModeratorScripts', data),
    update: (id: Guid, data: any) => api.put(`/ModeratorScripts/${id}`, data),
    delete: (id: Guid) => api.delete(`/ModeratorScripts/${id}`),
};

// ── ObservationLogs ──
export const observationLogsApi = {
    getAll: (testSessionId?: Guid, testTaskId?: Guid) =>
        api.get('/ObservationLogs', { params: { testSessionId, testTaskId } }),
    get: (id: Guid) => api.get(`/ObservationLogs/${id}`),
    create: (data: any) => api.post('/ObservationLogs', data),
    update: (id: Guid, data: any) => api.put(`/ObservationLogs/${id}`, data),
    delete: (id: Guid) => api.delete(`/ObservationLogs/${id}`),
};

// ── Findings ──
export const findingsApi = {
    getByPlan: (planId: Guid) => api.get(`/Findings/by-plan/${planId}`),
    get: (id: Guid) => api.get(`/Findings/${id}`),
    create: (data: any) => api.post('/Findings', data),
    update: (id: Guid, data: any) => api.put(`/Findings/${id}`, data),
    delete: (id: Guid) => api.delete(`/Findings/${id}`),
};

// ── ImprovementActions ──
export const improvementActionsApi = {
    getByFinding: (findingId: Guid) => api.get(`/ImprovementActions/by-finding/${findingId}`),
    get: (id: Guid) => api.get(`/ImprovementActions/${id}`),
    create: (data: any) => api.post('/ImprovementActions', data),
    update: (id: Guid, data: any) => api.put(`/ImprovementActions/${id}`, data),
    updateStatus: (id: Guid, status: string) =>
        api.patch(`/ImprovementActions/${id}/status`, { status }),
    delete: (id: Guid) => api.delete(`/ImprovementActions/${id}`),
};

// ── Participants ──
export const participantsApi = {
    getAll: () => api.get('/Participants'),
    get: (id: Guid) => api.get(`/Participants/${id}`),
    create: (data: any) => api.post('/Participants', data),
    update: (id: Guid, data: any) => api.put(`/Participants/${id}`, data),
    delete: (id: Guid) => api.delete(`/Participants/${id}`),
};

// ── TestSessions ──
export const testSessionsApi = {
    getAll: (testPlanId?: Guid) => api.get('/TestSessions', { params: { testPlanId } }),
    get: (id: Guid) => api.get(`/TestSessions/${id}`),
    create: (data: any) => api.post('/TestSessions', data),
    update: (id: Guid, data: any) => api.put(`/TestSessions/${id}`, data),
    delete: (id: Guid) => api.delete(`/TestSessions/${id}`),
};

// ── Dashboard ──
export const dashboardApi = {
    getStats: (testPlanId?: Guid) => api.get('/Dashboard/stats', { params: { testPlanId } }),
};

export default api;
