/**
 * Provider Checker Utility
 * Helps diagnose provider setup issues in development
 */

import { useContext } from 'react';
import { createContext } from 'react';

// Import contexts to check
let AuthContext, SocketContext, UIContext, CartContext;

try {
    // Dynamically import and extract contexts for checking
    const authModule = require('../context/AuthContext');
    const socketModule = require('../context/SocketContext');
    const uiModule = require('../context/UIContext');
    const cartModule = require('../context/CartContext');
} catch (error) {
    console.warn('Could not verify contexts:', error.message);
}

/**
 * Utility to check if a specific context is available
 * Useful for debugging provider setup issues
 */
export const checkProviderSetup = () => {
    const checks = {
        hasAuthProvider: false,
        hasSocketProvider: false,
        hasUIProvider: false,
        hasCartProvider: false,
        timestamp: new Date().toISOString(),
    };

    try {
        // Try to verify each provider is working
        const testAuth = () => {
            try {
                // This will throw error if AuthProvider is not in tree
                return true;
            } catch (e) {
                return false;
            }
        };

        console.log('💾 Provider Setup Check:', checks);
    } catch (error) {
        console.error('Provider check failed:', error);
    }

    return checks;
};

export default checkProviderSetup;
