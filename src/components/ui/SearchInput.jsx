import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';

/**
 * Reusable search input — theme-aware, consistent across all pages.
 */
function SearchInput({ value, onChange, onClear, placeholder = 'Search…', className = '' }) {
    return (
        <div className={`relative ${className}`}>
            <HiOutlineSearch
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
            />
            <input
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
            {value && onClear && (
                <button
                    onClick={onClear}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    aria-label="Clear search"
                >
                    <HiOutlineX className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

export default SearchInput;
