import React from 'react';
import { HiChevronDown } from 'react-icons/hi';

/**
 * Theme-aware Select component. Uses CSS variables for dark mode support.
 */
function Select({
    label,
    value,
    onChange,
    options = [],
    placeholder,
    disabled = false,
    helperText,
    error,
    required = false,
    className = '',
    style = {},
    ...props
}) {
    const hasError = !!error;

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: 'var(--text-primary)' }}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className="w-full px-4 py-3 pr-10 border rounded-lg appearance-none cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: hasError ? 'var(--danger)' : 'var(--border)',
                        color: 'var(--text-primary)',
                        ...style,
                    }}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                    <HiChevronDown className={`w-5 h-5 ${disabled ? 'opacity-50' : ''}`} />
                </div>
            </div>

            {(helperText || error) && (
                <p className="text-xs mt-1.5" style={{ color: hasError ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
}

export default Select;
