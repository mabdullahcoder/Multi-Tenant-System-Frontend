import { HiArrowUp, HiArrowDown } from 'react-icons/hi';

function StatCard({ title, value, change, changeType = 'increase', icon: Icon, iconBgColor = 'bg-blue-500/10', iconColor = 'text-blue-500', className = '', trend }) {
    const isPositive = changeType === 'increase' || trend?.isPositive;

    return (
        <div
            className={`relative rounded-xl border p-4 sm:p-5 transition-all duration-200 group ${className}`}
            style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = ''; }}
        >
            {/* Icon */}
            {Icon && (
                <div className={`inline-flex p-2.5 rounded-xl ${iconBgColor} mb-3`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
            )}

            {/* Title */}
            <p
                className="text-[11px] font-semibold uppercase tracking-widest mb-1.5 leading-none"
                style={{ color: 'var(--text-secondary)' }}
            >
                {title}
            </p>

            {/* Value */}
            <p
                className="text-2xl sm:text-3xl font-bold mb-2 leading-tight"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
                {value}
            </p>

            {/* Trend */}
            {(change || trend) && (
                <div className="flex items-center gap-1.5">
                    <span
                        className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}
                        style={isPositive
                            ? { color: 'var(--success)' }
                            : { color: 'var(--danger)' }
                        }
                    >
                        {isPositive ? <HiArrowUp className="w-3 h-3" /> : <HiArrowDown className="w-3 h-3" />}
                        {change || `${trend?.value}%`}
                    </span>
                    <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-muted)' }}>vs last period</span>
                </div>
            )}
        </div>
    );
}

export default StatCard;
