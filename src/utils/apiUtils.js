/**
 * Shared API Utilities
 * Common patterns and utilities for API calls
 */

/**
 * Build pagination query parameters
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {object} filters - Additional filter parameters
 * @returns {URLSearchParams}
 */
export const buildPaginationQuery = (page = 1, limit = 10, filters = {}) => {
    const query = new URLSearchParams({
        page,
        limit,
        ...filters,
    });
    return query;
};

/**
 * Extract pagination metadata from API response
 * @param {object} response - API response object
 * @returns {object} Pagination object
 */
export const extractPaginationMeta = (response) => {
    return {
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 0,
    };
};

/**
 * Handle common API errors
 * @param {Error} error - Error object
 * @returns {string} Error message
 */
export const getErrorMessage = (error) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.message) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

/**
 * Check if API response is successful
 * @param {object} response - API response
 * @returns {boolean}
 */
export const isApiSuccess = (response) => {
    return response?.success !== false && response?.data !== undefined;
};

/**
 * Format API error for display
 * @param {object} error - Axios error object
 * @returns {object} Formatted error object
 */
export const formatApiError = (error) => {
    return {
        message: getErrorMessage(error),
        status: error.response?.status,
        data: error.response?.data,
    };
};
