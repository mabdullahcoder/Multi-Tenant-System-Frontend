function Card({ children, className = '', hover = false, padding = 'default', ...props }) {
    const paddingClasses = {
        none: '',
        sm: 'p-3 sm:p-4',
        default: 'p-4 sm:p-5 md:p-6',
        lg: 'p-5 sm:p-6 md:p-8',
    };

    return (
        <div
            className={`rounded-xl border transition-all duration-200 ${paddingClasses[padding]} ${hover ? 'cursor-pointer active:scale-95' : ''} ${className}`}
            style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={hover ? (e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; } : undefined}
            onMouseLeave={hover ? (e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = ''; } : undefined}
            {...props}
        >
            {children}
        </div>
    );
}

export default Card;
