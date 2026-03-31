/**
 * Report API Service
 * Handles report API calls
 */

import apiClient from './apiService';

export const reportAPI = {
    // Generate report
    generateReport: async (data) => {
        const response = await apiClient.post('/report', data);
        return response.data;
    },

    // Get user reports
    getUserReports: async (page = 1, limit = 10) => {
        const query = new URLSearchParams({
            page,
            limit,
        });
        const response = await apiClient.get(`/report/my-reports?${query}`);
        return response.data;
    },

    // Get report details
    getReportDetail: async (reportId) => {
        const response = await apiClient.get(`/report/${reportId}`);
        return response.data;
    },

    // Download report
    downloadReport: async (reportId) => {
        const response = await apiClient.get(`/report/${reportId}/download`);
        return response.data;
    },

    // Get all reports (admin)
    getAllReports: async (page = 1, limit = 10, filters = {}) => {
        const query = new URLSearchParams({
            page,
            limit,
            ...filters,
        });
        const response = await apiClient.get(`/report?${query}`);
        return response.data;
    },

    // Delete report (admin)
    deleteReport: async (reportId) => {
        const response = await apiClient.delete(`/report/${reportId}`);
        return response.data;
    },

    // Get report stats (admin)
    getReportStats: async () => {
        const response = await apiClient.get('/report/stats');
        return response.data;
    },
};

export default reportAPI;
