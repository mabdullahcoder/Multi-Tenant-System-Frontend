import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { HiOutlineUser, HiOutlineMenu, HiOutlineX, HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';

function Navbar() {
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user } = useAuth();
    const { sidebar, toggleSidebar, isDark, toggleTheme } = useUI();

    const isCollapsed = sidebar?.isCollapsed ?? false;
    const isMobileOpen = sidebar?.isOpen ?? false;

    const initials = `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.toUpperCase();
    const roleLabel = user?.role === 'super-admin' ? 'Super Admin' : (user?.role ?? '');

    return (
        <>
            <nav
                className={[
                    'fixed top-0 right-0 z-40 w-full lg:left-auto',
                    'transition-[left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                    'lg:navbar-offset-collapsed',
                ].join(' ')}
                style={{
                    left: 0,
                    height: 'var(--navbar-h)',
                    backgroundColor: 'var(--navbar-bg)',
                    borderBottom: '1px solid var(--navbar-border)',
                    boxShadow: 'var(--shadow-sm)',
                }}
            >
                <div className="flex items-center justify-between h-full px-3 sm:px-4 md:px-6">
                    {/* Mobile Menu Toggle - Touch optimized */}
                    <button
                        onClick={toggleSidebar}
                        aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
                        className="lg:hidden p-2 md:p-2.5 rounded-lg transition-colors active:bg-gray-200 md:hover:bg-gray-100"
                        style={{ color: 'var(--text-secondary)', minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {isMobileOpen
                            ? <HiOutlineX className="w-5 h-5 md:w-6 md:h-6" />
                            : <HiOutlineMenu className="w-5 h-5 md:w-6 md:h-6" />
                        }
                    </button>

                    <div className="flex-1" />

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="p-2 rounded-lg transition-colors mr-1 sm:mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {isDark
                            ? <HiOutlineSun className="w-5 h-5" />
                            : <HiOutlineMoon className="w-5 h-5" />
                        }
                    </button>

                    {/* Profile Section */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen((p) => !p)}
                            className="flex items-center gap-2 md:gap-2.5 px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-colors active:bg-gray-200 md:hover:bg-gray-100 min-h-[44px]"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            {/* Avatar */}
                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-sm">
                                {initials}
                            </div>
                            {/* User Info - Hidden on small mobile */}
                            <div className="text-left hidden sm:block">
                                <p className="text-xs sm:text-sm font-semibold truncate max-w-[120px] sm:max-w-[140px] md:max-w-[160px] leading-tight" style={{ color: 'var(--text-primary)' }}>
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-[10px] sm:text-xs capitalize truncate leading-tight" style={{ color: 'var(--text-muted)' }}>
                                    {roleLabel}
                                </p>
                            </div>
                        </button>

                        {/* Profile Dropdown */}
                        {isProfileOpen && (
                            <div
                                className="absolute right-0 mt-2 w-56 sm:w-60 rounded-xl py-2 z-50 animate-fade-in max-h-[90vh] overflow-y-auto"
                                style={{
                                    backgroundColor: 'var(--bg-surface)',
                                    border: '1px solid var(--border)',
                                    boxShadow: 'var(--shadow-xl)',
                                }}
                            >
                                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                                        {user?.email}
                                    </p>
                                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 capitalize">
                                        {roleLabel}
                                    </span>
                                </div>
                                <div className="py-1">
                                    <button
                                        onClick={() => { navigate('/user/profile'); setIsProfileOpen(false); }}
                                        className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors active:bg-gray-100 md:hover:bg-gray-50 min-h-[44px]"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        <HiOutlineUser className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                                        <span>Profile Settings</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Backdrop for dropdown on mobile */}
            {isProfileOpen && (
                <div className="fixed inset-0 z-30 lg:hidden" onClick={() => setIsProfileOpen(false)} />
            )}
        </>
    );
}

export default Navbar;
