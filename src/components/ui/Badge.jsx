function Badge({ children, variant = 'default', className = '', icon: Icon }) {
    const variants = {
        default: 'bg-gray-100 text-gray-700 border-gray-200',
        success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        warning: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
        danger: 'bg-red-500/10 text-red-600 border-red-500/20',
        info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        primary: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    };

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold border transition-colors ${variants[variant] || variants.default} ${className}`}>
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {children}
        </span>
    );
}

export default Badge;
