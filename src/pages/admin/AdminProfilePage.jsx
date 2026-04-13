import { useEffect, useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { userAPI } from '../../services/userAPI';
import { authAPI } from '../../services/authAPI';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
    HiOutlineUser,
    HiOutlineLockClosed,
    HiOutlineShieldCheck,
    HiOutlineRefresh,
} from 'react-icons/hi';

/* ── Role display helpers ── */
const ROLE_META = {
    'super-admin': { label: 'Super Admin', bg: 'rgba(139,92,246,0.10)', color: '#7c3aed' },
    admin: { label: 'Admin', bg: 'rgba(59,130,246,0.10)', color: '#2563eb' },
};

function RoleBadge({ role }) {
    const meta = ROLE_META[role] || { label: role, bg: 'var(--bg-surface-3)', color: 'var(--text-secondary)' };
    return (
        <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: meta.bg, color: meta.color }}
        >
            <HiOutlineShieldCheck className="w-3.5 h-3.5" />
            {meta.label}
        </span>
    );
}

/* ── Normalise API response to a flat form shape ── */
const normalise = (data) => ({
    firstName: data?.firstName || '',
    lastName: data?.lastName || '',
    email: data?.email || '',
    phone: data?.phone || '',
    address: data?.address || '',
    city: data?.city || '',
    state: data?.state || '',
    country: data?.country || '',
    zipCode: data?.zipCode || '',
});

/* ─────────────────────────────────────────────────────────────
   AdminProfilePage
───────────────────────────────────────────────────────────── */
function AdminProfilePage() {
    const { user, updateUserProfile } = useAuth();
    const { addNotification } = useUI();

    const [activeTab, setActiveTab] = useState('profile');
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const [profileData, setProfileData] = useState(normalise(null));
    const [savedProfile, setSavedProfile] = useState(normalise(null));

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    /* ── Fetch profile on mount ── */
    const fetchProfile = async () => {
        setIsFetching(true);
        setFetchError(null);
        try {
            const data = await userAPI.getProfile();
            const normalised = normalise(data);
            setProfileData(normalised);
            setSavedProfile(normalised);
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to load profile. Please try again.';
            setFetchError(msg);
            addNotification({ type: 'error', message: msg });
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Handlers ── */
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
        setIsSaving(true);
        try {
            // email is read-only — never send it
            const { email, ...payload } = profileData;
            const updated = await userAPI.updateProfile(payload);
            updateUserProfile(updated);
            setSavedProfile({ ...profileData });
            addNotification({ type: 'success', message: 'Profile updated successfully' });
        } catch (err) {
            addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to update profile' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            addNotification({ type: 'error', message: 'New passwords do not match' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            addNotification({ type: 'error', message: 'Password must be at least 6 characters' });
            return;
        }
        setIsSaving(true);
        try {
            await authAPI.changePassword(passwordData);
            addNotification({ type: 'success', message: 'Password changed successfully' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to change password' });
        } finally {
            setIsSaving(false);
        }
    };

    /* ── Derived state ── */
    const isProfileDirty = JSON.stringify(profileData) !== JSON.stringify(savedProfile);
    const isPasswordReady = passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword;

    const initials = `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.toUpperCase();

    /* ── Render ── */
    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto space-y-6 pb-10">

                {/* Loading */}
                {isFetching && (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
                        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading profile…</p>
                    </div>
                )}

                {/* Error state */}
                {fetchError && !isFetching && (
                    <Card className="py-12">
                        <div className="flex flex-col items-center justify-center text-center gap-3">
                            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.08)' }}>
                                <svg className="w-5 h-5" style={{ color: 'var(--danger)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Unable to load profile</h3>
                                <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--text-muted)' }}>{fetchError}</p>
                            </div>
                            <Button onClick={fetchProfile} variant="outline" className="mt-1 px-6">
                                <HiOutlineRefresh className="w-4 h-4 mr-1.5" /> Try Again
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Main content */}
                {!isFetching && !fetchError && (
                    <>
                        {/* ── Profile hero card ── */}
                        {/* <div
                            className="rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5"
                            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                        >

                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md">
                                {initials || <HiOutlineUser className="w-7 h-7" />}
                            </div>

                            
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h1 className="text-lg font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                                        {profileData.firstName} {profileData.lastName}
                                    </h1>
                                    <RoleBadge role={user?.role} />
                                </div>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{profileData.email}</p>
                                {profileData.phone && (
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{profileData.phone}</p>
                                )}
                            </div>
                        </div> */}
                        <div></div>
                        {/* ── Page heading ── */}
                        <div>
                            <h2 className="text-heading-2">Account Settings</h2>
                            <p className="text-description mt-1">Manage your profile information and security settings</p>
                        </div>

                        {/* ── Tabs ── */}
                        <div className="flex gap-0" style={{ borderBottom: '2px solid var(--border)' }}>
                            {[
                                { id: 'profile', label: 'Profile Information', icon: HiOutlineUser },
                                { id: 'password', label: 'Change Password', icon: HiOutlineLockClosed },
                            ].map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className="flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all duration-150 -mb-0.5"
                                    style={
                                        activeTab === id
                                            ? { borderColor: 'var(--primary)', color: 'var(--primary)' }
                                            : { borderColor: 'transparent', color: 'var(--text-muted)' }
                                    }
                                    onMouseEnter={(e) => { if (activeTab !== id) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                    onMouseLeave={(e) => { if (activeTab !== id) e.currentTarget.style.color = 'var(--text-muted)'; }}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* ── Profile tab ── */}
                        {activeTab === 'profile' && (
                            <Card>
                                <form onSubmit={handleUpdateProfile} className="space-y-5">
                                    {/* Name row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="form-group">
                                            <label className="label-base block mb-1.5">First Name</label>
                                            <input
                                                type="text" name="firstName" required
                                                value={profileData.firstName}
                                                onChange={handleProfileChange}
                                                className="input-base"
                                                placeholder="First name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="label-base block mb-1.5">Last Name</label>
                                            <input
                                                type="text" name="lastName" required
                                                value={profileData.lastName}
                                                onChange={handleProfileChange}
                                                className="input-base"
                                                placeholder="Last name"
                                            />
                                        </div>
                                    </div>

                                    {/* Email — read-only */}
                                    <div className="form-group">
                                        <label className="label-base block mb-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            disabled
                                            className="input-base opacity-60 cursor-not-allowed"
                                            style={{ backgroundColor: 'var(--bg-surface-2)' }}
                                        />
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Email address cannot be changed</p>
                                    </div>

                                    {/* Phone */}
                                    <div className="form-group">
                                        <label className="label-base block mb-1.5">Phone Number</label>
                                        <input
                                            type="tel" name="phone"
                                            value={profileData.phone}
                                            onChange={handleProfileChange}
                                            className="input-base"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className="form-group">
                                        <label className="label-base block mb-1.5">Street Address</label>
                                        <input
                                            type="text" name="address"
                                            value={profileData.address}
                                            onChange={handleProfileChange}
                                            className="input-base"
                                            placeholder="123 Main Street"
                                        />
                                    </div>

                                    {/* City / State */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="form-group">
                                            <label className="label-base block mb-1.5">City</label>
                                            <input
                                                type="text" name="city"
                                                value={profileData.city}
                                                onChange={handleProfileChange}
                                                className="input-base"
                                                placeholder="New York"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="label-base block mb-1.5">State / Province</label>
                                            <input
                                                type="text" name="state"
                                                value={profileData.state}
                                                onChange={handleProfileChange}
                                                className="input-base"
                                                placeholder="NY"
                                            />
                                        </div>
                                    </div>

                                    {/* Country / Zip */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="form-group">
                                            <label className="label-base block mb-1.5">Country</label>
                                            <input
                                                type="text" name="country"
                                                value={profileData.country}
                                                onChange={handleProfileChange}
                                                className="input-base"
                                                placeholder="United States"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="label-base block mb-1.5">Zip / Postal Code</label>
                                            <input
                                                type="text" name="zipCode"
                                                value={profileData.zipCode}
                                                onChange={handleProfileChange}
                                                className="input-base"
                                                placeholder="10001"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            disabled={isSaving || !isProfileDirty}
                                            className="w-full"
                                        >
                                            {isSaving ? 'Saving…' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        )}

                        {/* ── Password tab ── */}
                        {activeTab === 'password' && (
                            <Card>
                                <form onSubmit={handleChangePassword} className="space-y-5">
                                    <div className="form-group">
                                        <label className="label-base block mb-1.5">Current Password</label>
                                        <input
                                            type="password" name="currentPassword" required
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className="input-base"
                                            placeholder="Enter your current password"
                                            autoComplete="current-password"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="label-base block mb-1.5">New Password</label>
                                        <input
                                            type="password" name="newPassword" required minLength={6}
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className="input-base"
                                            placeholder="Minimum 6 characters"
                                            autoComplete="new-password"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="label-base block mb-1.5">Confirm New Password</label>
                                        <input
                                            type="password" name="confirmPassword" required minLength={6}
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="input-base"
                                            placeholder="Re-enter new password"
                                            autoComplete="new-password"
                                        />
                                    </div>

                                    {/* Requirements hint */}
                                    <div
                                        className="p-4 rounded-lg text-sm"
                                        style={{ backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.18)' }}
                                    >
                                        <p className="font-medium mb-2" style={{ color: 'var(--primary)' }}>Password requirements</p>
                                        <ul className="space-y-1 list-disc list-inside" style={{ color: 'var(--text-secondary)' }}>
                                            <li>At least 6 characters long</li>
                                            <li>New password and confirmation must match</li>
                                        </ul>
                                    </div>

                                    <div className="pt-2">
                                        <Button
                                            type="submit"
                                            disabled={isSaving || !isPasswordReady}
                                            className="w-full"
                                        >
                                            {isSaving ? 'Updating…' : 'Change Password'}
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

export default AdminProfilePage;
