function Button({ children, variant = 'primary', size = 'md', disabled = false, loading = false, icon: Icon, iconPosition = 'left', className = '', ...props }) {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm active:bg-blue-800',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400 active:bg-gray-300',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm active:bg-red-800',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm active:bg-emerald-800',
        outline: 'border border-blue-500 text-blue-600 hover:bg-blue-500/10 focus:ring-blue-500 active:bg-blue-500/20',
        ghost: 'hover:bg-white/10 focus:ring-gray-400 active:bg-white/20',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs min-h-[36px]',
        md: 'px-4 py-2 text-sm min-h-[40px]',
        lg: 'px-5 py-2.5 text-sm min-h-[44px]',
    };

    return (
        <button
            disabled={disabled || loading}
            className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
            {...props}
        >
            {loading && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {Icon && iconPosition === 'left' && !loading && <Icon className="w-4 h-4" />}
            {children}
            {Icon && iconPosition === 'right' && !loading && <Icon className="w-4 h-4" />}
        </button>
    );
}

export default Button;
