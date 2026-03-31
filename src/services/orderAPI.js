/**
 * Order API Service
 * Handles order API calls
 */

import apiClient from './apiService';

export const orderAPI = {
    // Create order
    createOrder: async (data) => {
        const response = await apiClient.post('/order', data);
        return response.data;
    },

    // Get user orders
    getUserOrders: async (page = 1, limit = 10, filters = {}) => {
        const query = new URLSearchParams({
            page,
            limit,
            ...filters,
        });
        const response = await apiClient.get(`/order/my-orders?${query}`);
        return response.data;
    },

    // Get order details
    getOrderDetail: async (orderId) => {
        const response = await apiClient.get(`/order/detail/${orderId}`);
        return response.data;
    },

    // Cancel order
    cancelOrder: async (orderId, cancellationReason) => {
        const response = await apiClient.patch(`/order/${orderId}/cancel`, {
            cancellationReason,
        });
        return response.data;
    },

    // Get all orders (admin)
    getAllOrders: async (page = 1, limit = 10, filters = {}) => {
        const query = new URLSearchParams({
            page,
            limit,
            ...filters,
        });
        const response = await apiClient.get(`/order?${query}`);
        return response.data;
    },

    // Update order status (admin)
    updateOrderStatus: async (orderId, status) => {
        const response = await apiClient.put(`/order/${orderId}/status`, { status });
        return response.data;
    },

    // Get order stats (admin)
    getOrderStats: async () => {
        const response = await apiClient.get('/order/stats');
        return response.data;
    },

    // Delete order (super admin only)
    deleteOrder: async (orderId) => {
        const response = await apiClient.delete(`/order/${orderId}`);
        return response.data;
    },
};

export default orderAPI;
