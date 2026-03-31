import React from 'react';

/**
 * Enhanced Input Component with Mobile Responsiveness
 * 
 * A modern input field with support for labels, icons, error states, and more.
 * Touch-optimized for mobile devices with 44px minimum height.
 * 
 * Props:
 * - label: Input label text
 * - error: Error message to display
 * - helperText: Helper text below input
 * - leftIcon: Icon component to display on the left
 * - rightIcon: Icon component to display on the right
 * - className: Additional CSS classes
 * - containerClassName: CSS classes for the container
 * - ...props: All other input props (type, placeholder, value, onChange, etc.)
 */
const Input = React.memo(function Input({
    label,
    error,
    helperText,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = '',
    containerClassName = '',
    ...props
}) {
    const hasError = !!error;

    const inputClasses = `
        w-full px-3 sm:px-4 py-2 sm:py-2.5
        border rounded-xl
        bg-white 
        text-xs sm:text-sm text-gray-900
        placeholder:text-gray-400
        focus:outline-none focus:ring-2 
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        min-h-[44px]
        ${hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
        }
        ${LeftIcon ? 'pl-10 sm:pl-12' : ''}
        ${RightIcon ? 'pr-10 sm:pr-12' : ''}
        ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
        <div className={`w-full ${containerClassName}`.trim()}>
            {label && (
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}

            <div className="relative">
                {LeftIcon && (
                    <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
                        <LeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                )}

                <input
                    className={inputClasses}
                    {...props}
                />

                {RightIcon && (
                    <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10">
                        <RightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                )}
            </div>

            {(error || helperText) && (
                <p className={`mt-1.5 text-xs sm:text-sm ${hasError ? 'text-red-600' : 'text-gray-500'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

/**
 * Textarea Component
 * Similar to Input but for multi-line text
 */
export const Textarea = React.memo(function Textarea({
    label,
    error,
    helperText,
    className = '',
    containerClassName = '',
    rows = 4,
    ...props
}) {
    const hasError = !!error;

    const textareaClasses = `
        w-full px-4 py-2.5 
        border rounded-xl
        bg-white
        text-gray-900
        placeholder:text-gray-400
        focus:outline-none focus:ring-2
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        resize-none
        ${hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
        }
        ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
        <div className={`w-full ${containerClassName}`.trim()}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}

            <textarea
                className={textareaClasses}
                rows={rows}
                {...props}
            />

            {(error || helperText) && (
                <p className={`mt-1.5 text-sm ${hasError ? 'text-red-600' : 'text-gray-500'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

/**
 * Select Component
 * Dropdown select input
 */
export const Select = React.memo(function Select({
    label,
    error,
    helperText,
    options = [],
    className = '',
    containerClassName = '',
    ...props
}) {
    const hasError = !!error;

    const selectClasses = `
        w-full px-4 py-2.5 
        border rounded-xl
        bg-white
        text-gray-900
        focus:outline-none focus:ring-2
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
        }
        ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
        <div className={`w-full ${containerClassName}`.trim()}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}

            <select
                className={selectClasses}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {(error || helperText) && (
                <p className={`mt-1.5 text-sm ${hasError ? 'text-red-600' : 'text-gray-500'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

export default Input;
