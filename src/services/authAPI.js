/**
 * Auth API Service
 * Handles authentication API calls
 */

import apiClient from './apiService';

export const authAPI = {
    // Register
    register: async (data) => {
        const response = await apiClient.post('/auth/register', data);

        if (!response.data || !response.data.data) {
            throw new Error('Invalid response from server');
        }

        return response.data.data;
    },

    // Login
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });

        if (!response.data || !response.data.data) {
            throw new Error('Invalid response from server');
        }

        return response.data.data;
    },

    // Logout
    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },

    // Change password
    changePassword: async (data) => {
        const response = await apiClient.post('/auth/change-password', data);
        return response.data;
    },

    // Verify token
    verifyToken: async () => {
        const response = await apiClient.get('/auth/verify-token');
        return response.data.data; // Return the data object
    },
};

export default authAPI;
