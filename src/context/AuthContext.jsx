import { createContext, useContext, useReducer, useMemo } from 'react';

const getInitialState = () => {
    try {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        // Validate user is valid JSON if present
        let parsedUser = null;
        if (user) {
            try {
                parsedUser = JSON.parse(user);
                // Validate required fields
                if (!parsedUser.id && !parsedUser._id) {
                    throw new Error('Invalid user object - missing id');
                }
            } catch (parseError) {
                console.warn('Corrupted user data, clearing:', parseError.message);
                localStorage.removeItem('user');
            }
        }

        // Validate token is a string
        const validToken = (typeof token === 'string' && token.length > 0) ? token : null;

        return {
            user: parsedUser,
            token: validToken,
            isLoading: false,
            error: null,
            isAuthenticated: !!validToken,
        };
    } catch (error) {
        console.error('Failed to initialize auth state:', error.message);
        // Clear potentially corrupted data
        try {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } catch (clearError) {
            console.error('Failed to clear localStorage:', clearError);
        }

        return {
            user: null,
            token: null,
            isLoading: false,
            error: null,
            isAuthenticated: false,
        };
    }
};

const initialState = getInitialState();

function authReducer(state, action) {
    switch (action.type) {
        case 'LOGIN_START':
        case 'REGISTER_START':
            return { ...state, isLoading: true, error: null };

        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
            try {
                localStorage.setItem('user', JSON.stringify(action.payload.user));
                localStorage.setItem('token', action.payload.token);
            } catch (error) {
                console.error('Failed to save auth data to localStorage:', error);
            }
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
            try {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            } catch (error) {
                console.error('Failed to clear auth data from localStorage:', error);
            }
            return { user: null, token: null, isAuthenticated: false, isLoading: false, error: null };

        case 'UPDATE_USER_PROFILE':
            try {
                localStorage.setItem('user', JSON.stringify(action.payload));
            } catch (error) {
                console.error('Failed to update user profile in localStorage:', error);
            }
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

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        ...state,
        loginStart,
        loginSuccess,
        loginFailure,
        registerStart,
        registerSuccess,
        registerFailure,
        logout,
        updateUserProfile,
        clearError,
    }), [state]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);

    if (!ctx) {
        console.error('useAuth called outside AuthProvider - check component tree');
        throw new Error(
            'useAuth must be used within AuthProvider. ' +
            'Make sure AuthProvider wraps the component that uses useAuth.'
        );
    }

    return ctx;
}
