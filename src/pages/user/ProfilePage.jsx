import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { userAPI } from '../../services/userAPI';
import { authAPI } from '../../services/authAPI';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingScreen from '../../components/LoadingScreen';

function ProfilePage() {
    const { user, token, updateUserProfile } = useAuth();
    const { addNotification } = useUI();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingProfile, setIsFetchingProfile] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');

    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
    });

    const [initialProfileData, setInitialProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [error, setError] = useState(null);

    // Normalize data to ensure consistent comparison
    const normalizeData = (data) => ({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        zipCode: data.zipCode || '',
    });

    // Fetch complete profile data on mount
    const fetchProfile = async () => {
        setIsFetchingProfile(true);
        setError(null);
        try {
            const profileResponse = await userAPI.getProfile();
            const data = normalizeData(profileResponse);
            setProfileData(data);
            setInitialProfileData(data);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to load profile. Please try again.';
            setError(msg);
            addNotification({ type: 'error', message: msg });
        } finally {
            setIsFetchingProfile(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Don't send email field (it's not editable)
            const { email, ...updateData } = profileData;
            const updatedUser = await userAPI.updateProfile(updateData);
            updateUserProfile(updatedUser);
            setInitialProfileData({ ...profileData });
            addNotification({ type: 'success', message: 'Profile updated successfully' });
        } catch (error) {
            addNotification({ type: 'error', message: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            addNotification({ type: 'error', message: 'Passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            addNotification({ type: 'error', message: 'Password must be at least 6 characters' });
            return;
        }

        setIsLoading(true);
        try {
            await authAPI.changePassword(passwordData);
            addNotification({ type: 'success', message: 'Password changed successfully' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            addNotification({ type: 'error', message: error.response?.data?.message || 'Failed to change password' });
        } finally {
            setIsLoading(false);
        }
    };

    const isProfileModified = () => {
        return JSON.stringify(profileData) !== JSON.stringify(initialProfileData);
    };

    const isPasswordFormComplete = () => {
        return passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword;
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {isFetchingProfile && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-sm text-gray-500 font-medium">Loading your profile...</p>
                    </div>
                )}

                {error && !isFetchingProfile && (
                    <Card className="py-12">
                        <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Unable to load profile</h3>
                            <p className="text-sm text-gray-600 max-w-xs">{error}</p>
                            <Button 
                                onClick={fetchProfile}
                                className="mt-4 px-8"
                                variant="outline"
                            >
                                Try Again
                            </Button>
                        </div>
                    </Card>
                )}

                {!isFetchingProfile && !error && (
                    <>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                My Profile
                            </h1>
                            <p className="text-sm text-gray-600">
                                Manage your account settings and preferences
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-4 border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`px-4 py-3 font-medium border-b-2 transition-colors text-sm ${activeTab === 'profile'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Profile Information
                            </button>
                            <button
                                onClick={() => setActiveTab('password')}
                                className={`px-4 py-3 font-medium border-b-2 transition-colors text-sm ${activeTab === 'password'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Change Password
                            </button>
                        </div>

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <Card>
                                <form onSubmit={handleUpdateProfile} className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={profileData.firstName}
                                                onChange={handleProfileChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors bg-white text-gray-900 placeholder-gray-500 text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={profileData.lastName}
                                                onChange={handleProfileChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors bg-white text-gray-900 placeholder-gray-500 text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            disabled
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed opacity-60 text-gray-900 text-sm"
                                        />
                                        <p className="text-xs text-gray-600 mt-1">
                                            Email cannot be changed
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profileData.phone}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors bg-white text-gray-900 placeholder-gray-500 text-sm"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={profileData.address}
                                            onChange={handleProfileChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors bg-white text-gray-900 placeholder-gray-500 text-sm"
                                            placeholder="123 Main Street"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={profileData.city}
                                                onChange={handleProfileChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors bg-white text-gray-900 placeholder-gray-500 text-sm"
                                                placeholder="New York"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                State
                                            </label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={profileData.state}
                                                onChange={handleProfileChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors bg-white text-gray-900 placeholder-gray-500 text-sm"
                                                placeholder="NY"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Country
                                            </label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={profileData.country}
                                                onChange={handleProfileChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors bg-white text-gray-900 placeholder-gray-500 text-sm"
                                                placeholder="United States"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Zip Code
                                            </label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={profileData.zipCode}
                                                onChange={handleProfileChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors bg-white text-gray-900 placeholder-gray-500 text-sm"
                                                placeholder="10001"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            disabled={isLoading || !isProfileModified()}
                                            className="w-full"
                                        >
                                            {isLoading ? 'Updating...' : 'Update Profile'}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        )}

                        {/* Password Tab */}
                        {activeTab === 'password' && (
                            <Card>
                                <form onSubmit={handleChangePassword} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors bg-white text-gray-900 placeholder-gray-500 text-sm"
                                            placeholder="Enter your current password"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            minLength={6}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors bg-white text-gray-900 placeholder-gray-500 text-sm"
                                            placeholder="Enter new password (min 6 characters)"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            minLength={6}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors bg-white text-gray-900 placeholder-gray-500 text-sm"
                                            placeholder="Confirm your new password"
                                        />
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-900 font-medium">
                                            Password Requirements:
                                        </p>
                                        <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                                            <li>Minimum 6 characters</li>
                                            <li>Both passwords must match</li>
                                        </ul>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            disabled={isLoading || !isPasswordFormComplete()}
                                            className="w-full"
                                        >
                                            {isLoading ? 'Changing Password...' : 'Change Password'}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
}

export default ProfilePage;
