import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { CartProvider } from './context/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <AuthProvider>
                <UIProvider>
                    <CartProvider>
                        <Router>
                            <App />
                        </Router>
                    </CartProvider>
                </UIProvider>
            </AuthProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
