import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    sidebar: {
        isOpen: false,   // closed by default — hamburger opens it on mobile
        isCollapsed: false,
    },
    notifications: [],
    modals: {
        isOpen: false,
        type: null,
        data: null,
    },
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        // Sidebar
        toggleSidebar: (state) => {
            state.sidebar.isOpen = !state.sidebar.isOpen;
        },
        collapseSidebar: (state) => {
            state.sidebar.isCollapsed = !state.sidebar.isCollapsed;
        },

        // Notifications
        addNotification: (state, action) => {
            const notification = {
                id: Date.now(),
                ...action.payload,
            };
            state.notifications.push(notification);
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter((n) => n.id !== action.payload);
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },

        // Modals
        openModal: (state, action) => {
            state.modals = {
                isOpen: true,
                type: action.payload.type,
                data: action.payload.data || null,
            };
        },
        closeModal: (state) => {
            state.modals = {
                isOpen: false,
                type: null,
                data: null,
            };
        },
    },
});

export const {
    toggleSidebar,
    collapseSidebar,
    addNotification,
    removeNotification,
    clearNotifications,
    openModal,
    closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
