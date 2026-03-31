/**
 * Activity Log API Service
 * Handles activity log API calls
 */

import apiClient from './apiService';

export const activityLogAPI = {
    // Get all activity logs (admin)
    getAllActivityLogs: async (page = 1, limit = 20, filters = {}) => {
        const query = new URLSearchParams({
            page,
            limit,
            ...filters,
        });
        const response = await apiClient.get(`/activity-logs?${query}`);
        return response.data;
    },

    // Get user activity logs (admin)
    getUserActivityLogs: async (userId, page = 1, limit = 20) => {
        const query = new URLSearchParams({
            page,
            limit,
        });
        const response = await apiClient.get(
            `/activity-logs/user/${userId}?${query}`
        );
        return response.data;
    },

    // Get user login history (admin)
    getUserLoginHistory: async (userId, limit = 10) => {
        const response = await apiClient.get(
            `/activity-logs/user/${userId}/login-history?limit=${limit}`
        );
        return response.data;
    },

    // Get logs by date range (admin)
    getLogsByDateRange: async (startDate, endDate, filters = {}) => {
        const query = new URLSearchParams({
            startDate,
            endDate,
            ...filters,
        });
        const response = await apiClient.get(`/activity-logs/date-range?${query}`);
        return response.data;
    },

    // Get activity stats (admin)
    getActivityStats: async () => {
        const response = await apiClient.get('/activity-logs/stats');
        return response.data;
    },
};

export default activityLogAPI;
