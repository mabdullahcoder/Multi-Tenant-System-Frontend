/**
 * User API Service
 * Handles user API calls
 */

import apiClient from './apiService';

export const userAPI = {
    // Get profile
    getProfile: async () => {
        const response = await apiClient.get('/user/profile');
        return response.data.data; // Extract user data from response
    },

    // Update profile
    updateProfile: async (data) => {
        const response = await apiClient.put('/user/profile', data);
        return response.data.data; // Extract updated user data from response
    },

    // Get all users (admin)
    // roleFilter: 'user' | 'admin' | 'all'
    getAllUsers: async (page = 1, limit = 50, filters = {}, roleFilter = 'user') => {
        const query = new URLSearchParams({ page, limit, roleFilter, ...filters });
        const response = await apiClient.get(`/user?${query}`);
        return response.data;
    },

    // Get user details (admin)
    getUserDetail: async (userId) => {
        const response = await apiClient.get(`/user/${userId}`);
        return response.data;
    },

    // Get user stats (admin)
    getUserStats: async () => {
        const response = await apiClient.get('/user/stats');
        return response.data;
    },

    // Search users (admin)
    searchUsers: async (query, page = 1, limit = 10) => {
        const response = await apiClient.get('/user/search', {
            params: { query, page, limit },
        });
        return response.data;
    },

    // Block user (admin)
    blockUser: async (userId) => {
        const response = await apiClient.patch(`/user/${userId}/block`);
        return response.data;
    },

    // Unblock user (admin)
    unblockUser: async (userId) => {
        const response = await apiClient.patch(`/user/${userId}/unblock`);
        return response.data;
    },

    // Create user or admin (admin/super-admin)
    createUser: async (data) => {
        const response = await apiClient.post('/user/create', data);
        return response.data;
    },
};

export default userAPI;
