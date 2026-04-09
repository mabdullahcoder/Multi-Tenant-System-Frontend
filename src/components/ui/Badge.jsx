/**
 * Badge — theme-aware via CSS variables.
 * Hardcoded Tailwind color classes are avoided so dark mode works correctly.
 */
const VARIANT_STYLES = {
    default: {
        backgroundColor: 'var(--bg-surface-3)',
        color: 'var(--text-secondary)',
        borderColor: 'var(--border)',
    },
    success: {
        backgroundColor: 'rgba(16,185,129,0.1)',
        color: 'var(--success)',
        borderColor: 'rgba(16,185,129,0.25)',
    },
    warning: {
        backgroundColor: 'rgba(245,158,11,0.1)',
        color: 'var(--warning)',
        borderColor: 'rgba(245,158,11,0.25)',
    },
    danger: {
        backgroundColor: 'rgba(239,68,68,0.1)',
        color: 'var(--danger)',
        borderColor: 'rgba(239,68,68,0.25)',
    },
    info: {
        backgroundColor: 'rgba(59,130,246,0.1)',
        color: 'var(--primary)',
        borderColor: 'rgba(59,130,246,0.25)',
    },
    primary: {
        backgroundColor: 'rgba(59,130,246,0.1)',
        color: 'var(--primary)',
        borderColor: 'rgba(59,130,246,0.25)',
    },
};

function Badge({ children, variant = 'default', className = '', icon: Icon }) {
    const style = VARIANT_STYLES[variant] || VARIANT_STYLES.default;

    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold border transition-colors ${className}`}
            style={style}
        >
            {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
            {children}
        </span>
    );
}

export default Badge;
