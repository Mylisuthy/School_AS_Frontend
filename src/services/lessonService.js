import api from '../api/axios';

const lessonService = {
    getByCourseId: async (courseId) => {
        const response = await api.get(`/lessons/course/${courseId}`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/lessons/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/lessons', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/lessons/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/lessons/${id}`);
    },

    reorder: async (courseId, lessonIds) => {
        await api.post(`/lessons/course/${courseId}/reorder`, lessonIds);
    },

    complete: async (id) => {
        const response = await api.post(`/lessons/${id}/complete`);
        return response.data;
    }
};

export default lessonService;
