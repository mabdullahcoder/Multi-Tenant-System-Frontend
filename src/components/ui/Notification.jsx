import { useEffect, useRef } from 'react';
import { useUI } from '../../context/UIContext';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamation, HiOutlineInformationCircle, HiX } from 'react-icons/hi';

const TYPE_CONFIG = {
    success: {
        icon: HiOutlineCheckCircle,
        iconColor: 'var(--success)',
        borderColor: 'var(--success)',
        label: 'Success',
    },
    error: {
        icon: HiOutlineXCircle,
        iconColor: 'var(--danger)',
        borderColor: 'var(--danger)',
        label: 'Error',
    },
    warning: {
        icon: HiOutlineExclamation,
        iconColor: 'var(--warning)',
        borderColor: 'var(--warning)',
        label: 'Warning',
    },
    info: {
        icon: HiOutlineInformationCircle,
        iconColor: 'var(--primary)',
        borderColor: 'var(--primary)',
        label: 'Info',
    },
};

function Notification() {
    const { notifications, removeNotification } = useUI();
    const timerRef = useRef(null);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (notifications.length > 0) {
            const current = notifications[0];
            timerRef.current = setTimeout(() => removeNotification(current.id), 5000);
        }
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [notifications, removeNotification]);

    const handleDismiss = (id) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        removeNotification(id);
    };

    return (
        <div className="fixed top-4 sm:top-5 right-3 sm:right-5 z-[9999] space-y-2 pointer-events-none w-[calc(100vw-1.5rem)] sm:w-auto sm:max-w-sm">
            {notifications.map((notification) => {
                const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;
                const Icon = cfg.icon;
                return (
                    <div
                        key={notification.id}
                        className="flex items-start gap-3 px-4 py-3.5 rounded-xl border pointer-events-auto animate-slide-in-right"
                        style={{
                            backgroundColor: 'var(--bg-surface)',
                            borderColor: 'var(--border)',
                            borderLeftWidth: '3px',
                            borderLeftColor: cfg.borderColor,
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    >
                        <Icon
                            className="w-5 h-5 flex-shrink-0 mt-0.5"
                            style={{ color: cfg.iconColor }}
                            aria-hidden="true"
                        />
                        <div className="flex-1 min-w-0">
                            <p
                                className="text-sm font-medium leading-snug"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {notification.message}
                            </p>
                        </div>
                        <button
                            onClick={() => handleDismiss(notification.id)}
                            className="flex-shrink-0 p-1 rounded-md transition-colors active:scale-95 mt-0.5"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            aria-label="Close notification"
                        >
                            <HiX className="w-3.5 h-3.5" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

export default Notification;
