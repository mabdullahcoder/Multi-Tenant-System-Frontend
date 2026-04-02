import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import {
    HiOutlineHome,
    HiOutlineDocumentText,
    HiChevronLeft,
    HiChevronRight,
    HiOutlineBell,
    HiOutlineFlag,
    HiOutlineUser,
    HiOutlineLogout,
    HiOutlineCollection,
    HiOutlineFire,
} from 'react-icons/hi';

const USER_MENU = [
    { icon: HiOutlineHome, label: 'Dashboard', path: '/user/dashboard' },
    { icon: HiOutlineFlag, label: 'Order Menu', path: '/user/place-order' },
    { icon: HiOutlineBell, label: 'My Orders', path: '/user/my-orders' },
    { icon: HiOutlineDocumentText, label: 'Reports', path: '/user/reports' },
    { icon: HiOutlineUser, label: 'Profile', path: '/user/profile' },
];

const ADMIN_MENU = [
    { icon: HiOutlineHome, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: HiOutlineFire, label: 'Kitchen Display', path: '/admin/kitchen-display' },
    { icon: HiOutlineDocumentText, label: 'Reports', path: '/admin/reports' },
    { icon: HiOutlineBell, label: 'Orders', path: '/admin/orders' },
    { icon: HiOutlineCollection, label: 'Manage Menu', path: '/admin/menu' },
    { icon: HiOutlineFlag, label: 'Users', path: '/admin/users' },
    { icon: HiOutlineUser, label: 'Activity Logs', path: '/admin/activity-logs' },
];

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { sidebar, toggleSidebar, collapseSidebar } = useUI();

    const isCollapsed = sidebar?.isCollapsed ?? false;
    const isMobileOpen = sidebar?.isOpen ?? false;

    const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';
    const menuItems = isAdmin ? ADMIN_MENU : USER_MENU;

    useEffect(() => {
        if (isMobileOpen) toggleSidebar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const isActive = (path) =>
        location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    return (
        <>
            {/* Mobile overlay backdrop */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40"
                    style={{ top: 'var(--navbar-h)', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
                    onClick={toggleSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar - Responsive width and position */}
            <aside
                className={[
                    'fixed top-0 left-0 h-screen z-50 flex flex-col',
                    'transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                    isCollapsed ? 'w-16 lg:w-[var(--sidebar-w-collapsed)]' : 'w-48 sm:w-64 lg:w-[var(--sidebar-w)]',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                ].join(' ')}
                style={{
                    backgroundColor: 'var(--sidebar-bg)',
                    borderRight: '1px solid var(--sidebar-border)',
                    maxWidth: '90vw',
                }}
            >
                {/* Brand header - Responsive padding */}
                <div
                    className="flex items-center flex-shrink-0 px-2 sm:px-3"
                    style={{ height: 'var(--navbar-h)', borderBottom: '1px solid var(--sidebar-border)' }}
                >
                    {isCollapsed ? (
                        <button
                            onClick={collapseSidebar}
                            className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center mx-auto transition-colors active:bg-blue-800 min-h-[44px]"
                            aria-label="Expand sidebar"
                        >
                            <HiChevronRight className="w-4 h-4 text-white" />
                        </button>
                    ) : (
                        <div className="flex items-center justify-between w-full gap-2">
                            <div className="flex items-center sm:gap-2.5 min-w-0">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <img src="/logo.svg" alt="logo" className="w-10 h-10" />
                                </div>
                                <span className="text-xs sm:text-sm font-bold text-gray-900 truncate hidden sm:block">Restaurant</span>
                            </div>
                            <button
                                onClick={collapseSidebar}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0 active:bg-gray-200 min-h-[44px]"
                                aria-label="Collapse sidebar"
                            >
                                <HiChevronLeft className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Navigation items - Responsive spacing */}
                <nav className="flex-1 px-1 sm:px-2 py-2 sm:py-3 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-thin">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                aria-current={active ? 'page' : undefined}
                                className={[
                                    'w-full flex items-center rounded-lg transition-all duration-150 group relative',
                                    'min-h-[44px] active:scale-95',
                                    isCollapsed ? 'justify-center p-2 sm:p-2.5 hover:bg-gray-100' : 'gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5',
                                ].join(' ')}
                                style={active
                                    ? { backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6' }
                                    : { color: 'var(--text-secondary)' }
                                }
                            >
                                <Icon
                                    className="w-4 h-4 sm:w-[18px] sm:h-[18px] flex-shrink-0"
                                    style={{ color: active ? '#3b82f6' : 'var(--text-muted)' }}
                                />
                                {!isCollapsed && (
                                    <span className="text-xs sm:text-sm font-medium text-left whitespace-nowrap">{item.label}</span>
                                )}
                                {active && !isCollapsed && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                )}
                                {/* Tooltip on hover (desktop only) */}
                                {isCollapsed && (
                                    <span className="pointer-events-none absolute left-full ml-3 z-50 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-gray-900 whitespace-nowrap shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 hidden md:block">
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Logout button - Responsive */}
                <div className="px-1 sm:px-2 py-2 sm:py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className={[
                            'w-full flex items-center rounded-lg transition-colors duration-150 group relative',
                            'min-h-[44px] active:scale-95',
                            isCollapsed ? 'justify-center p-2 sm:p-2.5' : 'gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5',
                        ].join(' ')}
                        style={{ color: '#ef4444' }}
                        aria-label="Logout"
                    >
                        <HiOutlineLogout className="w-4 h-4 sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                        {!isCollapsed && <span className="text-xs sm:text-sm font-medium whitespace-nowrap">Logout</span>}
                        {/* Tooltip on hover (desktop only) */}
                        {isCollapsed && (
                            <span className="pointer-events-none absolute left-full ml-3 z-50 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-red-600 whitespace-nowrap shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200 hidden md:block">
                                Logout
                            </span>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
