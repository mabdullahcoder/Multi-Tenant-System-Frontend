import React, { useEffect, useState, useRef } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { userAPI } from '../../services/userAPI';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/ui/Badge';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import {
    HiOutlineSearch, HiOutlineShieldCheck, HiOutlinePlus,
    HiOutlineX, HiOutlineEye, HiOutlineEyeOff, HiOutlineUser,
} from 'react-icons/hi';

const ROLE_CONFIG = {
    'super-admin': { label: 'Super Admin', variant: 'danger', icon: HiOutlineShieldCheck },
    'admin': { label: 'Admin', variant: 'warning', icon: HiOutlineShieldCheck },
    'user': { label: 'User', variant: 'info', icon: HiOutlineUser },
};

function Field({ label, required, error, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
        </div>
    );
}

function StyledInput({ error, className = '', ...props }) {
    return (
        <input
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${className}`}
            style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: error ? '#ef4444' : 'var(--border)',
                color: 'var(--text-primary)',
            }}
            onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = 'var(--border)'; }}
            {...props}
        />
    );
}

function CreateUserModal({ isOpen, onClose, onSuccess, currentUserRole }) {
    const { addNotification } = useUI();
    const overlayRef = useRef(null);
    const canCreateAdmin = currentUserRole === 'super-admin';

    const blank = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'user', phone: '' };
    const [form, setForm] = useState(blank);
    const [errors, setErrors] = useState({});
    const [showPwd, setShowPwd] = useState(false);
    const [showCfm, setShowCfm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) { setForm(blank); setErrors({}); setShowPwd(false); setShowCfm(false); }
    }, [isOpen]);

    useEffect(() => {
        const h = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', h);
        return () => document.removeEventListener('keydown', h);
    }, [isOpen, onClose]);

    const set = (f) => (e) => {
        setForm((p) => ({ ...p, [f]: e.target.value }));
        if (errors[f]) setErrors((p) => ({ ...p, [f]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.firstName.trim()) e.firstName = 'Required';
        if (!form.lastName.trim()) e.lastName = 'Required';
        if (!form.email.trim()) e.email = 'Required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
        if (!form.password) e.password = 'Required';
        else if (form.password.length < 6) e.password = 'Min. 6 characters';
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSubmitting(true);
        try {
            await userAPI.createUser({
                firstName: form.firstName.trim(), lastName: form.lastName.trim(),
                email: form.email.trim().toLowerCase(), password: form.password,
                role: form.role, phone: form.phone.trim(),
            });
            addNotification({ type: 'success', message: `${ROLE_CONFIG[form.role].label} created successfully` });
            onSuccess(); onClose();
        } catch (err) {
            addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to create user' });
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4"
        >
            <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-fade-in" style={{ backgroundColor: 'var(--bg-surface)' }}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(59,130,246,0.1)' }}>
                            <HiOutlinePlus className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>Create New Account</h2>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Fill in the details below</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                        <HiOutlineX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

                        {/* Role selector — super-admin only */}
                        {canCreateAdmin && (
                            <div className="p-3.5 rounded-xl" style={{ backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
                                <p className="text-[11px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-muted)' }}>Account Type</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {['user', 'admin'].map((r) => {
                                        const cfg = ROLE_CONFIG[r];
                                        const Icon = cfg.icon;
                                        const active = form.role === r;
                                        return (
                                            <button key={r} type="button" onClick={() => setForm((p) => ({ ...p, role: r }))}
                                                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-sm font-semibold transition-all duration-150 min-h-[44px]"
                                                style={active
                                                    ? { backgroundColor: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }
                                                    : { backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }
                                                }
                                            >
                                                <Icon className="w-4 h-4 flex-shrink-0" />
                                                {cfg.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Name */}
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="First Name" required error={errors.firstName}>
                                <StyledInput placeholder="John" value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
                            </Field>
                            <Field label="Last Name" required error={errors.lastName}>
                                <StyledInput placeholder="Doe" value={form.lastName} onChange={set('lastName')} error={errors.lastName} />
                            </Field>
                        </div>

                        {/* Email */}
                        <Field label="Email Address" required error={errors.email}>
                            <StyledInput type="email" placeholder="john@example.com" value={form.email} onChange={set('email')} error={errors.email} />
                        </Field>

                        {/* Phone */}
                        <Field label="Phone (optional)" error={errors.phone}>
                            <StyledInput type="tel" placeholder="+92 300 0000000" value={form.phone} onChange={set('phone')} />
                        </Field>

                        {/* Password */}
                        <Field label="Password" required error={errors.password}>
                            <div className="relative">
                                <StyledInput type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} error={errors.password} className="pr-10" />
                                <button type="button" onClick={() => setShowPwd((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                    {showPwd ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                                </button>
                            </div>
                        </Field>

                        {/* Confirm password */}
                        <Field label="Confirm Password" required error={errors.confirmPassword}>
                            <div className="relative">
                                <StyledInput type={showCfm ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} className="pr-10" />
                                <button type="button" onClick={() => setShowCfm((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                    {showCfm ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                                </button>
                            </div>
                        </Field>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-2)' }}>
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors min-h-[44px]" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm min-h-[44px]" style={{ backgroundColor: 'var(--primary)' }}>
                            {submitting
                                ? <><div className="spinner" />Creating…</>
                                : <><HiOutlinePlus className="w-4 h-4" />Create {ROLE_CONFIG[form.role].label}</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─── Main page ─── */
function ManageUsersPage() {
    const { addNotification } = useUI();
    const { user: currentUser } = useAuth();
    const isSuperAdmin = currentUser.role === 'super-admin';

    const [activeTab, setActiveTab] = useState('user');
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => { fetchUsers('', activeTab); }, [activeTab]);

    const fetchUsers = async (query = '', roleFilter = activeTab) => {
        setIsLoading(true);
        try {
            const res = await userAPI.getAllUsers(1, 50, query ? { search: query } : {}, roleFilter);
            setUsers(res.data || []);
        } catch (err) {
            if (err.response?.status !== 404) {
                addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to fetch users' });
            }
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        fetchUsers(q, activeTab);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchQuery('');
    };

    const handleBlock = async (userId, userRole) => {
        if (currentUser.role === 'admin' && (userRole === 'admin' || userRole === 'super-admin')) {
            addNotification({ type: 'error', message: 'Admins cannot block other admins or super-admins' }); return;
        }
        if (currentUser.role === 'super-admin' && userRole === 'super-admin') {
            addNotification({ type: 'error', message: 'Cannot block another super-admin' }); return;
        }
        try {
            await userAPI.blockUser(userId);
            addNotification({ type: 'success', message: 'User blocked' });
            fetchUsers(searchQuery, activeTab);
        } catch (err) {
            addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to block user' });
        }
    };

    const handleUnblock = async (userId, userRole) => {
        if (currentUser.role === 'admin' && (userRole === 'admin' || userRole === 'super-admin')) {
            addNotification({ type: 'error', message: 'Admins cannot unblock other admins or super-admins' }); return;
        }
        try {
            await userAPI.unblockUser(userId);
            addNotification({ type: 'success', message: 'User unblocked' });
            fetchUsers(searchQuery, activeTab);
        } catch (err) {
            addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to unblock user' });
        }
    };

    const canManage = (targetRole) => {
        if (currentUser.role === 'admin') return targetRole === 'user';
        if (currentUser.role === 'super-admin') return targetRole !== 'super-admin';
        return false;
    };

    const TABS = [
        { key: 'user', label: 'Users', icon: HiOutlineUser },
        { key: 'admin', label: 'Admins', icon: HiOutlineShieldCheck },
    ];

    return (
        <MainLayout>
            <div className="space-y-5">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-heading-2">Manage Users</h1>
                        <p className="text-description mt-1">
                            {isSuperAdmin ? 'View and manage all users and admin accounts' : 'View and manage all registered users'}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm min-h-[44px]"
                        style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        {isSuperAdmin ? 'Create User / Admin' : 'Create User'}
                    </button>
                </div>

                {/* Tabs — super-admin only */}
                {isSuperAdmin && (
                    <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
                        {TABS.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => handleTabChange(key)}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors"
                                style={activeTab === key
                                    ? { borderColor: 'var(--primary)', color: 'var(--primary)' }
                                    : { borderColor: 'transparent', color: 'var(--text-secondary)' }
                                }
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                                {!isLoading && users.length > 0 && activeTab === key && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--primary)' }}>
                                        {users.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab === 'admin' ? 'admins' : 'users'} by name or email…`}
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        style={{
                            backgroundColor: 'var(--bg-surface)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)',
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    />
                </div>

                {/* Table */}
                <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="spinner" />
                            <p className="text-sm text-gray-500">Loading {activeTab === 'admin' ? 'admins' : 'users'}…</p>
                        </div>
                    ) : users.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => {
                                        const roleCfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
                                        const RoleIcon = roleCfg.icon;
                                        const avatarCls = {
                                            'super-admin': 'bg-red-100 text-red-700',
                                            'admin': 'bg-amber-100 text-amber-700',
                                            'user': 'bg-blue-100 text-blue-700',
                                        }[user.role] || 'bg-blue-100 text-blue-700';

                                        return (
                                            <TableRow key={user._id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${avatarCls}`}>
                                                            <span className="text-xs font-bold">
                                                                {user.firstName?.[0]}{user.lastName?.[0]}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                                            {user.firstName} {user.lastName}
                                                            {user._id === currentUser.id && (
                                                                <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: 'var(--primary)', backgroundColor: 'rgba(59,130,246,0.1)' }}>You</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell style={{ color: 'var(--text-secondary)' }}>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={roleCfg.variant} icon={RoleIcon}>{roleCfg.label}</Badge>
                                                </TableCell>
                                                <TableCell style={{ color: 'var(--text-secondary)' }}>{user.phone || '—'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={user.isBlocked ? 'danger' : 'success'}>
                                                        {user.isBlocked ? 'Blocked' : 'Active'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                                                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </TableCell>
                                                <TableCell>
                                                    {user._id === currentUser.id ? (
                                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                                                    ) : canManage(user.role) ? (
                                                        user.isBlocked ? (
                                                            <button onClick={() => handleUnblock(user._id, user.role)}
                                                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                                                style={{ color: 'var(--success)', backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                                                Unblock
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => handleBlock(user._id, user.role)}
                                                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                                                style={{ color: 'var(--danger)', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                                                Block
                                                            </button>
                                                        )
                                                    ) : (
                                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }} title="Insufficient permissions">No access</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--bg-surface-3)' }}>
                                {activeTab === 'admin'
                                    ? <HiOutlineShieldCheck className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
                                    : <HiOutlineSearch className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
                                }
                            </div>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                No {activeTab === 'admin' ? 'admins' : 'users'} found
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                {searchQuery ? 'Try a different search term' : `Create the first ${activeTab === 'admin' ? 'admin' : 'user'} using the button above`}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <CreateUserModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onSuccess={() => fetchUsers(searchQuery, activeTab)}
                currentUserRole={currentUser.role}
            />
        </MainLayout>
    );
}

export default ManageUsersPage;
