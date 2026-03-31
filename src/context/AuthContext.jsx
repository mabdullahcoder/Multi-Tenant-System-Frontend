import { createContext, useContext, useReducer } from 'react';

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('token'),
};

function authReducer(state, action) {
    switch (action.type) {
        case 'LOGIN_START':
        case 'REGISTER_START':
            return { ...state, isLoading: true, error: null };

        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('token', action.payload.token);
            return {
                ...state,
                isLoading: false,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                error: null,
            };

        case 'LOGIN_FAILURE':
            return { ...state, isLoading: false, error: action.payload, isAuthenticated: false };

        case 'REGISTER_FAILURE':
            return { ...state, isLoading: false, error: action.payload };

        case 'LOGOUT':
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            return { user: null, token: null, isAuthenticated: false, isLoading: false, error: null };

        case 'UPDATE_USER_PROFILE':
            localStorage.setItem('user', JSON.stringify(action.payload));
            return { ...state, user: action.payload };

        case 'CLEAR_ERROR':
            return { ...state, error: null };

        default:
            return state;
    }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const loginStart = () => dispatch({ type: 'LOGIN_START' });
    const loginSuccess = (payload) => dispatch({ type: 'LOGIN_SUCCESS', payload });
    const loginFailure = (message) => dispatch({ type: 'LOGIN_FAILURE', payload: message });
    const registerStart = () => dispatch({ type: 'REGISTER_START' });
    const registerSuccess = (payload) => dispatch({ type: 'REGISTER_SUCCESS', payload });
    const registerFailure = (message) => dispatch({ type: 'REGISTER_FAILURE', payload: message });
    const logout = () => dispatch({ type: 'LOGOUT' });
    const updateUserProfile = (user) => dispatch({ type: 'UPDATE_USER_PROFILE', payload: user });
    const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

    return (
        <AuthContext.Provider value={{
            ...state,
            loginStart, loginSuccess, loginFailure,
            registerStart, registerSuccess, registerFailure,
            logout, updateUserProfile, clearError,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
