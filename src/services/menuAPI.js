/**
 * Menu API Service
 */
import apiClient from './apiService';

export const menuAPI = {
    // Public
    getMenuGrouped: () => apiClient.get('/menu/grouped').then((r) => r.data),
    getCategories: (includeInactive = false) =>
        apiClient.get(`/menu/categories?includeInactive=${includeInactive}`).then((r) => r.data),
    getItems: (params = {}) =>
        apiClient.get('/menu/items', { params }).then((r) => r.data),

    // Admin — Categories
    createCategory: (data) => apiClient.post('/menu/categories', data).then((r) => r.data),
    updateCategory: (id, data) => apiClient.put(`/menu/categories/${id}`, data).then((r) => r.data),
    deleteCategory: (id) => apiClient.delete(`/menu/categories/${id}`).then((r) => r.data),

    // Admin — Items
    createItem: (data) => apiClient.post('/menu/items', data).then((r) => r.data),
    updateItem: (id, data) => apiClient.put(`/menu/items/${id}`, data).then((r) => r.data),
    deleteItem: (id) => apiClient.delete(`/menu/items/${id}`).then((r) => r.data),
};

export default menuAPI;
