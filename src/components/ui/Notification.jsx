import React, { useEffect, useRef } from 'react';
import { useUI } from '../../context/UIContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

function Notification() {
    const { notifications, removeNotification } = useUI();
    const timersRef = useRef({});

    useEffect(() => {
        notifications.forEach((notification) => {
            if (!timersRef.current[notification.id]) {
                timersRef.current[notification.id] = setTimeout(() => {
                    removeNotification(notification.id);
                    delete timersRef.current[notification.id];
                }, 5000);
            }
        });

        const currentIds = new Set(notifications.map((n) => n.id));
        Object.keys(timersRef.current).forEach((id) => {
            if (!currentIds.has(Number(id))) {
                clearTimeout(timersRef.current[id]);
                delete timersRef.current[id];
            }
        });

        return () => {
            Object.values(timersRef.current).forEach(clearTimeout);
            timersRef.current = {};
        };
    }, [notifications, removeNotification]);

    return (
        <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50 space-y-2 pointer-events-none">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`px-6 py-4 rounded-lg shadow-lg text-white flex items-center justify-between pointer-events-auto max-w-sm sm:max-w-md animate-fade-in-down
                        ${notification.type === 'success' ? 'bg-green-500'
                            : notification.type === 'error' ? 'bg-red-500'
                                : notification.type === 'warning' ? 'bg-yellow-500'
                                    : 'bg-blue-500'
                        }`}
                >
                    <span className="text-sm sm:text-base">{notification.message}</span>
                    <button
                        onClick={() => removeNotification(notification.id)}
                        className="ml-4 text-white hover:text-gray-100 transition-colors flex-shrink-0 active:scale-95"
                        aria-label="Close notification"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            ))}
        </div>
    );
}

export default Notification;
