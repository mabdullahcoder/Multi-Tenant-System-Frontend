import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    users: [],
    selectedUser: null,
    isLoading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    },
    filters: {},
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // Get users
        getUsersStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        getUsersSuccess: (state, action) => {
            state.isLoading = false;
            state.users = action.payload.users;
            state.pagination = action.payload.pagination;
            state.error = null;
        },
        getUsersFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },

        // Get single user
        getUserStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        getUserSuccess: (state, action) => {
            state.isLoading = false;
            state.selectedUser = action.payload;
            state.error = null;
        },
        getUserFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        },

        // Update user
        updateUserSuccess: (state, action) => {
            state.selectedUser = action.payload;
        },

        // Block/Unblock user
        blockUserSuccess: (state, action) => {
            const userIndex = state.users.findIndex((u) => u._id === action.payload._id);
            if (userIndex !== -1) {
                state.users[userIndex] = action.payload;
            }
            if (state.selectedUser?._id === action.payload._id) {
                state.selectedUser = action.payload;
            }
        },

        // Set filters
        setFilters: (state, action) => {
            state.filters = action.payload;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    getUsersStart,
    getUsersSuccess,
    getUsersFailure,
    getUserStart,
    getUserSuccess,
    getUserFailure,
    updateUserSuccess,
    blockUserSuccess,
    setFilters,
    clearError,
} = userSlice.actions;

export default userSlice.reducer;
