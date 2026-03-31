import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useFormValidation, validateRegistrationForm } from '../hooks/useFormValidation';
import authAPI from '../services/authAPI';
import { HiOutlineAtSymbol, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';

function RegisterPage() {
    const navigate = useNavigate();
    const { isLoading, registerStart, registerSuccess, registerFailure } = useAuth();
    const { addNotification } = useUI();

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                    {/* Header */}
                    <div className="text-center mb-8">
                        {/* <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-lg">🍽️</span>
                        </div> */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">Get Started</h1>
                        <p className="text-sm text-gray-600">Create your account to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Fields - Side by side on larger screens */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="label-base">First Name</label>
                                <div className="relative">
                                    <HiOutlineUser className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className={`input-base pl-10 sm:pl-12 ${errors.firstName ? 'input-error' : ''}`}
                                        placeholder="John"
                                    />
                                </div>
                                {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
                            </div>
                            <div className="form-group">
                                <label className="label-base">Last Name</label>
                                <div className="relative">
                                    <HiOutlineUser className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className={`input-base pl-10 sm:pl-12 ${errors.lastName ? 'input-error' : ''}`}
                                        placeholder="Doe"
                                    />
                                </div>
                                {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="form-group">
                            <label className="label-base">Email Address</label>
                            <div className="relative">
                                <HiOutlineAtSymbol className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={`input-base pl-10 sm:pl-12 ${errors.email ? 'input-error' : ''}`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                        </div>

                        {/* Password Field */}
                        <div className="form-group">
                            <label className="label-base">Password</label>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className={`input-base pl-10 sm:pl-12 ${errors.password ? 'input-error' : ''}`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="form-group">
                            <label className="label-base">Confirm Password</label>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={`input-base pl-10 sm:pl-12 ${errors.confirmPassword ? 'input-error' : ''}`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-lg btn-primary-solid w-full mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating account...
                                </>
                            ) : (
                                'Create account'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">or</span>
                        </div>
                    </div>

                    {/* Sign In Link */}
                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                        >
                            Sign in
                        </button>
                    </p>
                </div>

                {/* Terms Link */}
                {/* <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">
                        By signing up, you agree to our{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
                    </p>
                </div> */}
            </div>
        </div>
    );
}

export default RegisterPage;
