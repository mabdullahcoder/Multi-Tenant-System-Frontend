import { createContext, useContext, useReducer } from 'react';

const initialState = {
    sidebar: { isOpen: false, isCollapsed: false },
    notifications: [],
    modals: { isOpen: false, type: null, data: null },
};

function uiReducer(state, action) {
    switch (action.type) {
        case 'TOGGLE_SIDEBAR':
            return { ...state, sidebar: { ...state.sidebar, isOpen: !state.sidebar.isOpen } };

        case 'COLLAPSE_SIDEBAR':
            return { ...state, sidebar: { ...state.sidebar, isCollapsed: !state.sidebar.isCollapsed } };

        case 'ADD_NOTIFICATION':
            // Dismiss all previous notifications and show only the new one
            return {
                ...state,
                notifications: [{ id: Date.now(), ...action.payload }],
            };

        case 'REMOVE_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.filter((n) => n.id !== action.payload),
            };

        case 'CLEAR_NOTIFICATIONS':
            return { ...state, notifications: [] };

        case 'OPEN_MODAL':
            return { ...state, modals: { isOpen: true, type: action.payload.type, data: action.payload.data || null } };

        case 'CLOSE_MODAL':
            return { ...state, modals: { isOpen: false, type: null, data: null } };

        default:
            return state;
    }
}

const UIContext = createContext(null);

export function UIProvider({ children }) {
    const [state, dispatch] = useReducer(uiReducer, initialState);

    const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });
    const collapseSidebar = () => dispatch({ type: 'COLLAPSE_SIDEBAR' });
    const addNotification = (payload) => dispatch({ type: 'ADD_NOTIFICATION', payload });
    const removeNotification = (id) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    const clearNotifications = () => dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    const openModal = (payload) => dispatch({ type: 'OPEN_MODAL', payload });
    const closeModal = () => dispatch({ type: 'CLOSE_MODAL' });

    return (
        <UIContext.Provider value={{
            ...state,
            toggleSidebar, collapseSidebar,
            addNotification, removeNotification, clearNotifications,
            openModal, closeModal,
        }}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const ctx = useContext(UIContext);
    if (!ctx) throw new Error('useUI must be used within UIProvider');
    return ctx;
}
