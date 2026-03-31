import React from 'react';
import { HiChevronDown } from 'react-icons/hi';

/**
 * Select Component
 * Professional dropdown with icon
 * 
 * @param {string} label - Label text for the select
 * @param {string} value - Current selected value
 * @param {function} onChange - Change handler
 * @param {array} options - Array of {value, label} objects
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Disabled state
 * @param {string} helperText - Helper text below select
 * @param {string} error - Error message
 * @param {boolean} required - Required field indicator
 * @param {string} className - Additional classes
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
    ...props
}) {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`
                        w-full px-4 py-3 pr-10
                        bg-white
                        border rounded-lg
                        text-gray-900
                        appearance-none cursor-pointer
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
                        ${error
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300'
                        }
                        ${disabled ? '' : 'hover:border-gray-400'}
                    `}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            className="bg-white text-gray-900"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Dropdown Icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <HiChevronDown
                        className={`
                            w-5 h-5 transition-colors duration-200
                            ${error
                                ? 'text-red-400'
                                : 'text-gray-400'
                            }
                            ${disabled ? 'opacity-50' : ''}
                        `}
                    />
                </div>
            </div>

            {/* Helper Text or Error */}
            {(helperText || error) && (
                <p className={`
                    text-xs mt-1.5 transition-colors
                    ${error
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }
                `}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
}

export default Select;
