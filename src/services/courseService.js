import api from '../api/axios';

const courseService = {
    getAll: async (params) => {
        const response = await api.get('/courses/search', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/courses/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/courses', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/courses/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/courses/${id}`);
    },

    publish: async (id) => {
        await api.patch(`/courses/${id}/publish`);
    },

    unpublish: async (id) => {
        await api.patch(`/courses/${id}/unpublish`);
    },

    enroll: async (id) => {
        const response = await api.post(`/courses/${id}/enroll`);
        return response.data;
    },

    getSummary: async (id) => {
        const response = await api.get(`/courses/${id}/summary`);
        return response.data;
    }
};

export default courseService;
