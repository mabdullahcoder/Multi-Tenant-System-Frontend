import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext({ socket: null, isConnected: false });

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { token, isAuthenticated, user } = useAuth();
    const reconnectAttemptRef = useRef(0);
    const maxReconnectAttemptsRef = useRef(5);
    const socketRef = useRef(null);

    useEffect(() => {
        // Only initialize socket if authenticated
        if (!isAuthenticated || !token) {
            // Cleanup if logged out
            if (socketRef.current) {
                console.log('User not authenticated, disconnecting socket');
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
                reconnectAttemptRef.current = 0;
            }
            return;
        }

        // Skip if socket already exists
        if (socketRef.current) {
            return;
        }

        try {
            console.log('🔌 Initializing Socket.IO connection...');

            const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
                auth: {
                    token: token,
                },
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: maxReconnectAttemptsRef.current,
                transports: ['websocket', 'polling'],
            });

            const handleConnect = () => {
                console.log('Socket CONNECTED | Socket ID:', newSocket.id);
                console.log('User Role:', user?.role);
                console.log('Transport:', newSocket.io.engine.transport.name);
                setIsConnected(true);
                reconnectAttemptRef.current = 0;
            };

            const handleConnectError = (err) => {
                console.error('Socket connection error:', err.message);
                setIsConnected(false);
                reconnectAttemptRef.current += 1;
                console.warn(
                    `Connection attempt ${reconnectAttemptRef.current}/${maxReconnectAttemptsRef.current}`
                );
            };

            const handleDisconnect = (reason) => {
                console.log('Socket disconnected | Reason:', reason);
                setIsConnected(false);

                if (reason !== 'io client namespace disconnect') {
                    console.warn('Unexpected socket disconnect:', reason);
                }
            };

            const handleError = (error) => {
                console.error('✗ Socket error:', error);
                setIsConnected(false);
            };

            newSocket.on('connect', handleConnect);
            newSocket.on('connect_error', handleConnectError);
            newSocket.on('disconnect', handleDisconnect);
            newSocket.on('error', handleError);

            socketRef.current = newSocket;
            setSocket(newSocket);
        } catch (error) {
            console.error('Failed to initialize socket:', error);
        }

        return () => {
            console.log('Cleaning up Socket.IO connection');
            if (socketRef.current) {
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [isAuthenticated, token, user?.role]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const { socket } = useContext(SocketContext);
    return socket;
};

// Expose connection status for UI indicators
export const useSocketStatus = () => {
    const { isConnected } = useContext(SocketContext);
    return isConnected;
};
