import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useFormValidation, validateRegistrationForm } from '../hooks/useFormValidation';
import authAPI from '../services/authAPI';
import { HiOutlineAtSymbol, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';
import PasswordToggleButton from '../components/ui/PasswordToggleButton';

function RegisterPage() {
    const navigate = useNavigate();
    const { isLoading, registerStart, registerSuccess, registerFailure } = useAuth();
    const { addNotification } = useUI();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { formData, errors, handleChange, setErrors } = useFormValidation({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateRegistrationForm(formData);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        registerStart();

        try {
            const response = await authAPI.register(formData);

            if (!response || !response.user || !response.token) {
                throw new Error('Invalid response from server');
            }

            registerSuccess(response);
            addNotification({ type: 'success', message: 'Registration successful! Welcome!' });
            navigate(response.user.role === 'admin' || response.user.role === 'super-admin' ? '/admin/dashboard' : '/user/dashboard');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Registration failed';
            registerFailure(message);
            addNotification({ type: 'error', message });
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center py-12 px-4"
            style={{ backgroundColor: 'var(--bg-base)' }}
        >
            <div className="w-full max-w-md">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-heading-2 mb-1">Create your account</h1>
                    <p className="text-description">Join us and start ordering today</p>
                </div>

                {/* Card */}
                <div
                    className="rounded-2xl p-6 sm:p-8 border"
                    style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border)',
                        boxShadow: 'var(--shadow-xl)',
                    }}
                >
                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {/* Name Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label htmlFor="reg-firstName" className="label-base">First name</label>
                                <div className="relative">
                                    <HiOutlineUser
                                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                                        style={{ color: 'var(--text-muted)' }}
                                        aria-hidden="true"
                                    />
                                    <input
                                        id="reg-firstName"
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        autoComplete="given-name"
                                        aria-describedby={errors.firstName ? 'reg-firstName-error' : undefined}
                                        aria-invalid={!!errors.firstName}
                                        className={`input-base pl-10 sm:pl-12 ${errors.firstName ? 'input-error' : ''}`}
                                        placeholder="John"
                                    />
                                </div>
                                {errors.firstName && (
                                    <p id="reg-firstName-error" role="alert" className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                                        <span aria-hidden="true">⚠</span> {errors.firstName}
                                    </p>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="reg-lastName" className="label-base">Last name</label>
                                <div className="relative">
                                    <HiOutlineUser
                                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                                        style={{ color: 'var(--text-muted)' }}
                                        aria-hidden="true"
                                    />
                                    <input
                                        id="reg-lastName"
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        autoComplete="family-name"
                                        aria-describedby={errors.lastName ? 'reg-lastName-error' : undefined}
                                        aria-invalid={!!errors.lastName}
                                        className={`input-base pl-10 sm:pl-12 ${errors.lastName ? 'input-error' : ''}`}
                                        placeholder="Doe"
                                    />
                                </div>
                                {errors.lastName && (
                                    <p id="reg-lastName-error" role="alert" className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                                        <span aria-hidden="true">⚠</span> {errors.lastName}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="form-group">
                            <label htmlFor="reg-email" className="label-base">Email address</label>
                            <div className="relative">
                                <HiOutlineAtSymbol
                                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                                    style={{ color: 'var(--text-muted)' }}
                                    aria-hidden="true"
                                />
                                <input
                                    id="reg-email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                    aria-describedby={errors.email ? 'reg-email-error' : undefined}
                                    aria-invalid={!!errors.email}
                                    className={`input-base pl-10 sm:pl-12 ${errors.email ? 'input-error' : ''}`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p id="reg-email-error" role="alert" className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                                    <span aria-hidden="true">⚠</span> {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="form-group">
                            <label htmlFor="reg-password" className="label-base">Password</label>
                            <div className="relative">
                                <HiOutlineLockClosed
                                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                                    style={{ color: 'var(--text-muted)' }}
                                    aria-hidden="true"
                                />
                                <input
                                    id="reg-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                    aria-describedby={errors.password ? 'reg-password-error' : 'reg-password-hint'}
                                    aria-invalid={!!errors.password}
                                    className={`input-base pl-10 sm:pl-12 pr-12 ${errors.password ? 'input-error' : ''}`}
                                    placeholder="Min. 8 characters"
                                />
                                <PasswordToggleButton
                                    show={showPassword}
                                    onToggle={() => setShowPassword((v) => !v)}
                                />
                            </div>
                            {errors.password ? (
                                <p id="reg-password-error" role="alert" className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                                    <span aria-hidden="true">⚠</span> {errors.password}
                                </p>
                            ) : (
                                <p id="reg-password-hint" className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                    Use at least 8 characters
                                </p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="form-group">
                            <label htmlFor="reg-confirmPassword" className="label-base">Confirm password</label>
                            <div className="relative">
                                <HiOutlineLockClosed
                                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                                    style={{ color: 'var(--text-muted)' }}
                                    aria-hidden="true"
                                />
                                <input
                                    id="reg-confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                    aria-describedby={errors.confirmPassword ? 'reg-confirmPassword-error' : undefined}
                                    aria-invalid={!!errors.confirmPassword}
                                    className={`input-base pl-10 sm:pl-12 pr-12 ${errors.confirmPassword ? 'input-error' : ''}`}
                                    placeholder="Re-enter your password"
                                />
                                <PasswordToggleButton
                                    show={showConfirmPassword}
                                    onToggle={() => setShowConfirmPassword((v) => !v)}
                                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p id="reg-confirmPassword-error" role="alert" className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                                    <span aria-hidden="true">⚠</span> {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            aria-busy={isLoading}
                            className="btn-lg btn-primary-solid w-full mt-2 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating account…
                                </>
                            ) : (
                                'Create account'
                            )}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="font-semibold underline-offset-2 hover:underline transition-colors"
                            style={{ color: 'var(--primary)' }}
                        >
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
