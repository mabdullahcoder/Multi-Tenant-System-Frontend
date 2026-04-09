import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    orders: [],
    selectedOrder: null,
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    },
    filters: {
        status: null,
    },
    stats: null,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        // Get orders
        getOrdersStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        getOrdersSuccess: (state, action) => {
            state.isLoading = false;
            state.orders = action.payload.orders;
            state.pagination = action.payload.pagination;
            state.error = null;
        },
        getOrdersFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },

        // Get single order
        getOrderStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        getOrderSuccess: (state, action) => {
            state.isLoading = false;
            state.selectedOrder = action.payload;
            state.error = null;
        },
        getOrderFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },

        // Create order
        createOrderStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        createOrderSuccess: (state, action) => {
            state.isLoading = false;
            state.orders.push(action.payload);
            state.error = null;
        },
        createOrderFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },

        // Update order status (admin)
        updateOrderStatusSuccess: (state, action) => {
            const orderIndex = state.orders.findIndex((o) => o._id === action.payload._id);
            if (orderIndex !== -1) {
                state.orders[orderIndex] = action.payload;
            }
            if (state.selectedOrder?._id === action.payload._id) {
                state.selectedOrder = action.payload;
            }
        },

        // Append items to existing order (admin)
        appendItemsSuccess: (state, action) => {
            const updated = action.payload;
            const idx = state.orders.findIndex((o) => o._id === updated._id);
            if (idx !== -1) state.orders[idx] = updated;
            if (state.selectedOrder?._id === updated._id) state.selectedOrder = updated;
        },

        // Cancel order
        cancelOrderSuccess: (state, action) => {
            const orderIndex = state.orders.findIndex((o) => o._id === action.payload._id);
            if (orderIndex !== -1) {
                state.orders[orderIndex] = action.payload;
            }
            if (state.selectedOrder?._id === action.payload._id) {
                state.selectedOrder = action.payload;
            }
        },

        // Get stats
        getStatsSuccess: (state, action) => {
            state.stats = action.payload;
        },

        // Set filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    getOrdersStart,
    getOrdersSuccess,
    getOrdersFailure,
    getOrderStart,
    getOrderSuccess,
    getOrderFailure,
    createOrderStart,
    createOrderSuccess,
    createOrderFailure,
    updateOrderStatusSuccess,
    appendItemsSuccess,
    cancelOrderSuccess,
    getStatsSuccess,
    setFilters,
    clearError,
} = orderSlice.actions;

export default orderSlice.reducer;
