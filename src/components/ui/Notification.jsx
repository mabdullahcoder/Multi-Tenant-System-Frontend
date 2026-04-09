import { useEffect, useRef } from 'react';
import { useUI } from '../../context/UIContext';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineExclamation, HiOutlineInformationCircle, HiX } from 'react-icons/hi';

const TYPE_CONFIG = {
    success: {
        icon: HiOutlineCheckCircle,
        style: {
            backgroundColor: 'rgba(16,185,129,0.12)',
            borderColor: 'rgba(16,185,129,0.3)',
            color: 'var(--success)',
        },
        textStyle: { color: 'var(--text-primary)' },
    },
    error: {
        icon: HiOutlineXCircle,
        style: {
            backgroundColor: 'rgba(239,68,68,0.12)',
            borderColor: 'rgba(239,68,68,0.3)',
            color: 'var(--danger)',
        },
        textStyle: { color: 'var(--text-primary)' },
    },
    warning: {
        icon: HiOutlineExclamation,
        style: {
            backgroundColor: 'rgba(245,158,11,0.12)',
            borderColor: 'rgba(245,158,11,0.3)',
            color: 'var(--warning)',
        },
        textStyle: { color: 'var(--text-primary)' },
    },
    info: {
        icon: HiOutlineInformationCircle,
        style: {
            backgroundColor: 'rgba(59,130,246,0.12)',
            borderColor: 'rgba(59,130,246,0.3)',
            color: 'var(--primary)',
        },
        textStyle: { color: 'var(--text-primary)' },
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
        <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-[9999] space-y-2 pointer-events-none max-w-sm w-full">
            {notifications.map((notification) => {
                const cfg = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;
                const Icon = cfg.icon;
                return (
                    <div
                        key={notification.id}
                        className="flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border pointer-events-auto animate-fade-in"
                        style={{
                            ...cfg.style,
                            backgroundColor: 'var(--bg-surface)',
                            borderColor: cfg.style.borderColor,
                            boxShadow: 'var(--shadow-lg)',
                        }}
                    >
                        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: cfg.style.color }} />
                        <span className="text-sm flex-1 leading-snug" style={cfg.textStyle}>
                            {notification.message}
                        </span>
                        <button
                            onClick={() => handleDismiss(notification.id)}
                            className="flex-shrink-0 p-0.5 rounded transition-colors active:scale-95"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                            aria-label="Close notification"
                        >
                            <HiX className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

export default Notification;
