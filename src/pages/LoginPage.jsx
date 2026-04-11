import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useFormValidation, validateLoginForm } from '../hooks/useFormValidation';
import authAPI from '../services/authAPI';
import { HiOutlineAtSymbol, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

function LoginPage() {
    const navigate = useNavigate();
    const { isLoading, loginStart, loginSuccess, loginFailure } = useAuth();
    const { addNotification } = useUI();
    const { formData, errors, handleChange, setErrors } = useFormValidation({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateLoginForm(formData);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        loginStart();

        try {
            const response = await authAPI.login(formData.email, formData.password);

            if (!response || !response.user || !response.token) {
                throw new Error('Invalid response from server');
            }

            loginSuccess(response);
            addNotification({ type: 'success', message: 'Login successful!' });
            navigate(response.user.role === 'admin' || response.user.role === 'super-admin' ? '/admin/dashboard' : '/user/dashboard');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Login failed';
            loginFailure(message);
            addNotification({ type: 'error', message });
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ backgroundColor: 'var(--bg-base)' }}
        >
            <div className="w-full max-w-md">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ backgroundColor: 'var(--primary)' }}>
                        <img src="/logo.svg" alt="Logo" className="w-8 h-8 brightness-0 invert" />
                    </div>
                    <h1 className="text-heading-2 mb-1">Welcome back</h1>
                    <p className="text-description">Sign in to your account to continue</p>
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
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Email Field */}
                        <div className="form-group">
                            <label htmlFor="login-email" className="label-base">
                                Email address
                            </label>
                            <div className="relative">
                                <HiOutlineAtSymbol
                                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                                    style={{ color: 'var(--text-muted)' }}
                                    aria-hidden="true"
                                />
                                <input
                                    id="login-email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                    aria-describedby={errors.email ? 'login-email-error' : undefined}
                                    aria-invalid={!!errors.email}
                                    className={`input-base pl-10 sm:pl-12 ${errors.email ? 'input-error' : ''}`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p id="login-email-error" role="alert" className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                                    <span aria-hidden="true">⚠</span> {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="form-group">
                            <label htmlFor="login-password" className="label-base">
                                Password
                            </label>
                            <div className="relative">
                                <HiOutlineLockClosed
                                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                                    style={{ color: 'var(--text-muted)' }}
                                    aria-hidden="true"
                                />
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="current-password"
                                    aria-describedby={errors.password ? 'login-password-error' : undefined}
                                    aria-invalid={!!errors.password}
                                    className={`input-base pl-10 sm:pl-12 pr-12 ${errors.password ? 'input-error' : ''}`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                                    style={{ color: 'var(--text-muted)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                    {showPassword ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p id="login-password-error" role="alert" className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                                    <span aria-hidden="true">⚠</span> {errors.password}
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
                                    Signing in…
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
                        Don&apos;t have an account?{' '}
                        <button
                            onClick={() => navigate('/register')}
                            className="font-semibold underline-offset-2 hover:underline transition-colors"
                            style={{ color: 'var(--primary)' }}
                        >
                            Create an account
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
