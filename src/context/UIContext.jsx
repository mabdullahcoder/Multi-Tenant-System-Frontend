import { createContext, useContext, useReducer, useEffect } from 'react';

// Read persisted theme before first render to avoid flash
const getInitialTheme = () => {
    try {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark' || saved === 'light') return saved;
        // Respect OS preference as fallback
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch { /* ignore */ }
    return 'light';
};

const initialState = {
    sidebar: { isOpen: false, isCollapsed: false },
    notifications: [],
    modals: { isOpen: false, type: null, data: null },
    theme: getInitialTheme(),
};

function uiReducer(state, action) {
    switch (action.type) {
        case 'TOGGLE_SIDEBAR':
            return { ...state, sidebar: { ...state.sidebar, isOpen: !state.sidebar.isOpen } };

        case 'COLLAPSE_SIDEBAR':
            return { ...state, sidebar: { ...state.sidebar, isCollapsed: !state.sidebar.isCollapsed } };

        case 'ADD_NOTIFICATION':
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

        case 'SET_THEME':
            return { ...state, theme: action.payload };

        default:
            return state;
    }
}

const UIContext = createContext(null);

export function UIProvider({ children }) {
    const [state, dispatch] = useReducer(uiReducer, initialState);

    // Apply data-theme attribute to <html> and persist to localStorage
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', state.theme);
        try { localStorage.setItem('theme', state.theme); } catch { /* ignore */ }
    }, [state.theme]);

    const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });
    const collapseSidebar = () => dispatch({ type: 'COLLAPSE_SIDEBAR' });
    const addNotification = (payload) => dispatch({ type: 'ADD_NOTIFICATION', payload });
    const removeNotification = (id) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    const clearNotifications = () => dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    const openModal = (payload) => dispatch({ type: 'OPEN_MODAL', payload });
    const closeModal = () => dispatch({ type: 'CLOSE_MODAL' });
    const setTheme = (theme) => dispatch({ type: 'SET_THEME', payload: theme });
    const toggleTheme = () => dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' });

    return (
        <UIContext.Provider value={{
            ...state,
            isDark: state.theme === 'dark',
            toggleSidebar, collapseSidebar,
            addNotification, removeNotification, clearNotifications,
            openModal, closeModal,
            setTheme, toggleTheme,
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
