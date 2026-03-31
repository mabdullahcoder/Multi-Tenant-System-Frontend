import { useState } from 'react';

/**
 * Custom Hook for Form Validation
 * Provides common validation logic and error handling
 */
export const useFormValidation = (initialValues = {}) => {
    const [formData, setFormData] = useState(initialValues);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const setFieldError = (field, error) => {
        setErrors((prev) => ({ ...prev, [field]: error }));
    };

    const clearErrors = () => {
        setErrors({});
    };

    const reset = () => {
        setFormData(initialValues);
        setErrors({});
    };

    return {
        formData,
        setFormData,
        errors,
        setErrors,
        setFieldError,
        clearErrors,
        handleChange,
        reset,
    };
};

/**
 * Validation Utilities
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please provide a valid email';
    return '';
};

export const validatePassword = (password, minLength = 6) => {
    if (!password) return 'Password is required';
    if (password.length < minLength) return `Password must be at least ${minLength} characters`;
    return '';
};

export const validatePasswordMatch = (password, confirmPassword) => {
    if (!confirmPassword) return 'Confirm password is required';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
};

export const validateName = (name, fieldName = 'Name') => {
    if (!name || !name.trim()) return `${fieldName} is required`;
    return '';
};

/**
 * Registration Form Validation
 */
export const validateRegistrationForm = (formData) => {
    const newErrors = {};

    newErrors.firstName = validateName(formData.firstName, 'First name');
    newErrors.lastName = validateName(formData.lastName, 'Last name');
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    newErrors.confirmPassword = validatePasswordMatch(
        formData.password,
        formData.confirmPassword
    );

    // Remove empty error properties
    return Object.fromEntries(
        Object.entries(newErrors).filter(([, value]) => value !== '')
    );
};

/**
 * Login Form Validation
 */
export const validateLoginForm = (formData) => {
    const newErrors = {};

    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);

    // Remove empty error properties
    return Object.fromEntries(
        Object.entries(newErrors).filter(([, value]) => value !== '')
    );
};
