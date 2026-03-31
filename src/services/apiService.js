/**
 * API Service
 * Handles all API calls to the backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to request headers
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 429) {
            const retryAfter =
                error.response?.data?.retryAfterSeconds ??
                (error.response?.headers?.['retry-after']
                    ? Number(error.response.headers['retry-after'])
                    : null);

            // Keep message stable and readable for UI notifications.
            if (retryAfter && Number.isFinite(retryAfter)) {
                error.response.data = {
                    ...(error.response.data || {}),
                    message:
                        error.response?.data?.message ||
                        `Too many requests. Please try again in ${retryAfter} seconds.`,
                };
            }
        }
        if (error.response?.status === 401) {
            // Token expired, logout user
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
