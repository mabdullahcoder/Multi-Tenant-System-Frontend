/**
 * Error Handler Utility
 * Centralized error handling and user-friendly error messages
 * Senior Developer Pattern
 */

const ERROR_MESSAGES = {
    // Network errors
    0: 'Network error. Please check your internet connection.',

    // Client errors
    400: 'Bad request. Please check your input.',
    401: 'Session expired. Please login again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    429: 'Too many requests. Please try again later.',

    // Server errors
    500: 'Server error. Please try again later.',
    502: 'Bad gateway. Please try again later.',
    503: 'Service unavailable. Please try again later.',
    504: 'Gateway timeout. Please try again later.',

    // Default
    DEFAULT: 'An unexpected error occurred. Please try again.',
};

/**
 * Parse error response and return user-friendly message
 * @param {Error|Object} error - Error object from API or network
 * @returns {Object} - { message, status, details }
 */
export const getErrorMessage = (error) => {
    if (!error) {
        return { message: ERROR_MESSAGES.DEFAULT, status: 0 };
    }

    // Handle axios/API errors
    if (error.response) {
        const status = error.response.status;
        const apiMessage = error.response.data?.message;

        return {
            message: apiMessage || ERROR_MESSAGES[status] || ERROR_MESSAGES.DEFAULT,
            status,
            details: error.response.data?.errors || null,
        };
    }

    // Handle network errors
    if (error.request && !error.response) {
        return {
            message: ERROR_MESSAGES[0],
            status: 0,
        };
    }

    // Handle other errors
    return {
        message: error.message || ERROR_MESSAGES.DEFAULT,
        status: null,
    };
};

/**
 * Log error for debugging (sends to console in dev, to server in prod)
 */
export const logError = (error, context = '') => {
    const errorInfo = {
        timestamp: new Date().toISOString(),
        context,
        message: error?.message,
        status: error?.response?.status,
        url: error?.config?.url,
        userAgent: navigator.userAgent,
        url: window.location.href,
    };

    if (process.env.NODE_ENV === 'development') {
        console.error('Error logged:', errorInfo);
    } else {
        // In production, you'd send this to a logging service
        // Example: sentry, datadog, etc.
        console.error('Error:', errorInfo);
    }

    return errorInfo;
};

/**
 * Determine if error is retry-able
 */
export const isRetryable = (error) => {
    const status = error?.response?.status;

    // Retry on network errors and specific status codes
    return !status || [408, 429, 500, 502, 503, 504].includes(status);
};

export default {
    getErrorMessage,
    logError,
    isRetryable,
    ERROR_MESSAGES,
};
