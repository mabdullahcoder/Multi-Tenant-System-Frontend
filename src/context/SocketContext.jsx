import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { token, isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (isAuthenticated && token) {
            const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
                auth: {
                    token: token,
                },
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err.message);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                console.log('Socket disconnected');
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [isAuthenticated, token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
};
