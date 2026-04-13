import React from 'react';

/**
 * Theme-aware Input component. Uses CSS variables so it responds to
 * both light and dark mode automatically.
 */
const Input = React.memo(function Input({
    label,
    error,
    helperText,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = '',
    containerClassName = '',
    style = {},
    ...props
}) {
    const hasError = !!error;

    const baseStyle = {
        backgroundColor: 'var(--bg-surface)',
        borderColor: hasError ? 'var(--danger)' : 'var(--border)',
        color: 'var(--text-primary)',
        ...style,
    };

    return (
        <div className={`w-full ${containerClassName}`.trim()}>
            {label && (
                <label
                    className="block text-xs sm:text-sm font-medium mb-1.5 leading-snug"
                    style={{ color: 'var(--text-primary)' }}
                >
                    {label}
                </label>
            )}

            <div className="relative">
                {LeftIcon && (
                    <div
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <LeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                )}

                <input
                    className={`
                        w-full px-3 sm:px-4 py-2 sm:py-2.5
                        border rounded-xl
                        text-sm
                        focus:outline-none focus:ring-2
                        transition-colors duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        min-h-[44px]
                        ${hasError ? 'focus:ring-red-400/30' : 'focus:ring-blue-500/20'}
                        ${LeftIcon ? 'pl-9 sm:pl-10' : ''}
                        ${RightIcon ? 'pr-9 sm:pr-10' : ''}
                        ${className}
                    `.trim().replace(/\s+/g, ' ')}
                    style={{
                        ...baseStyle,
                        caretColor: 'var(--primary)',
                    }}
                    {...props}
                />

                {RightIcon && (
                    <div
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <RightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                )}
            </div>

            {(error || helperText) && (
                <p
                    className="mt-1.5 text-xs leading-snug"
                    style={{ color: hasError ? 'var(--danger)' : 'var(--text-secondary)' }}
                >
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

export const Textarea = React.memo(function Textarea({
    label,
    error,
    helperText,
    className = '',
    containerClassName = '',
    rows = 4,
    style = {},
    ...props
}) {
    const hasError = !!error;

    return (
        <div className={`w-full ${containerClassName}`.trim()}>
            {label && (
                <label
                    className="block text-sm font-medium mb-1.5 leading-snug"
                    style={{ color: 'var(--text-primary)' }}
                >
                    {label}
                </label>
            )}

            <textarea
                className={`
                    w-full px-4 py-2.5
                    border rounded-xl
                    text-sm
                    focus:outline-none focus:ring-2
                    transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    resize-none
                    ${hasError ? 'focus:ring-red-400/30' : 'focus:ring-blue-500/20'}
                    ${className}
                `.trim().replace(/\s+/g, ' ')}
                style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: hasError ? 'var(--danger)' : 'var(--border)',
                    color: 'var(--text-primary)',
                    caretColor: 'var(--primary)',
                    ...style,
                }}
                rows={rows}
                {...props}
            />

            {(error || helperText) && (
                <p
                    className="mt-1.5 text-xs leading-snug"
                    style={{ color: hasError ? 'var(--danger)' : 'var(--text-secondary)' }}
                >
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

export const Select = React.memo(function Select({
    label,
    error,
    helperText,
    options = [],
    className = '',
    containerClassName = '',
    style = {},
    ...props
}) {
    const hasError = !!error;

    return (
        <div className={`w-full ${containerClassName}`.trim()}>
            {label && (
                <label
                    className="block text-sm font-medium mb-1.5 leading-snug"
                    style={{ color: 'var(--text-primary)' }}
                >
                    {label}
                </label>
            )}

            <select
                className={`
                    w-full px-4 py-2.5
                    border rounded-xl
                    text-sm
                    focus:outline-none focus:ring-2
                    transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    min-h-[44px]
                    ${hasError ? 'focus:ring-red-400/30' : 'focus:ring-blue-500/20'}
                    ${className}
                `.trim().replace(/\s+/g, ' ')}
                style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: hasError ? 'var(--danger)' : 'var(--border)',
                    color: 'var(--text-primary)',
                    ...style,
                }}
                {...props}
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-primary)' }}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            {(error || helperText) && (
                <p
                    className="mt-1.5 text-xs leading-snug"
                    style={{ color: hasError ? 'var(--danger)' : 'var(--text-secondary)' }}
                >
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

export default Input;
