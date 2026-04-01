/**
 * API Service
 * Handles all API calls to the backend with robust error handling
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
}, (error) => {
    return Promise.reject(error);
});

// Handle response errors with comprehensive error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Network error or no response
        if (!error.response) {
            console.error('Network error:', error.message);
            return Promise.reject({
                response: {
                    status: 0,
                    data: {
                        success: false,
                        message: error.message || 'Network error. Please check your connection.',
                    },
                },
            });
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
            const retryAfter =
                error.response?.data?.retryAfterSeconds ??
                (error.response?.headers?.['retry-after']
                    ? Number(error.response.headers['retry-after'])
                    : null);

            if (retryAfter && Number.isFinite(retryAfter)) {
                error.response.data = {
                    ...(error.response.data || {}),
                    message:
                        error.response?.data?.message ||
                        `Too many requests. Please try again in ${retryAfter} seconds.`,
                };
            }
        }

        // Handle token expiration
        if (error.response?.status === 401) {
            console.warn('Token expired or invalid');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        // Handle server errors
        if (error.response?.status >= 500) {
            console.error('Server error:', error.response?.status);
            error.response.data = error.response.data || {
                success: false,
                message: 'Server error. Please try again later.',
            };
        }

        // Handle validation errors
        if (error.response?.status === 400) {
            console.warn('Validation error:', error.response?.data);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
