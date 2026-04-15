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
    HiOutlineShoppingCart,
    HiOutlineClipboardList,
} from 'react-icons/hi';

const USER_MENU = [
    { icon: HiOutlineHome, label: 'Dashboard', path: '/user/dashboard' },
    { icon: HiOutlineFlag, label: 'POS', path: '/user/place-order' },
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
    { icon: HiOutlineClipboardList, label: 'Activity Logs', path: '/admin/activity-logs' },
    { icon: HiOutlineUser, label: 'Profile', path: '/admin/profile' },
    // Customer-facing views
    { icon: HiOutlineShoppingCart, label: 'POS', path: '/user/place-order' },
    { icon: HiOutlineBell, label: 'User Orders', path: '/user/my-orders' },
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

    // Close mobile sidebar on route change
    useEffect(() => {
        if (isMobileOpen) toggleSidebar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const isActive = (path) =>
        location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    return (
        <>
            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40"
                    style={{
                        top: 'var(--navbar-h)',
                        backgroundColor: 'rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(2px)',
                    }}
                    onClick={toggleSidebar}
                    aria-hidden="true"
                />
            )}

            <aside
                className={[
                    'fixed top-0 left-0 h-screen z-50 flex flex-col',
                    'transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                    isCollapsed
                        ? 'w-16 lg:w-[var(--sidebar-w-collapsed)]'
                        : 'w-52 sm:w-64 lg:w-[var(--sidebar-w)]',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                ].join(' ')}
                style={{
                    backgroundColor: 'var(--sidebar-bg)',
                    borderRight: '1px solid var(--sidebar-border)',
                    maxWidth: '90vw',
                }}
            >
                {/* ── Brand header ── */}
                <div
                    className="flex items-center flex-shrink-0 px-3"
                    style={{ height: 'var(--navbar-h)', borderBottom: '1px solid var(--sidebar-border)' }}
                >
                    {isCollapsed ? (
                        <button
                            onClick={collapseSidebar}
                            className="w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center mx-auto transition-colors"
                            aria-label="Expand sidebar"
                        >
                            <HiChevronRight className="w-4 h-4 text-white" />
                        </button>
                    ) : (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                    className="text-sm font-bold truncate"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Restaurant
                                </span>
                            </div>
                            <button
                                onClick={collapseSidebar}
                                className="w-8 h-8 rounded-md flex items-center justify-center transition-colors flex-shrink-0"
                                style={{ color: 'var(--text-muted)' }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                aria-label="Collapse sidebar"
                            >
                                <HiChevronLeft className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Navigation ── */}
                <nav
                    className="flex-1 px-2 py-3 overflow-y-auto overflow-x-hidden scrollbar-thin"
                    style={{ gap: 0 }}
                >
                    <ul className="space-y-0.5 list-none m-0 p-0">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);

                            return (
                                <li key={`${item.path}-${item.label}`}>
                                    <button
                                        onClick={() => navigate(item.path)}
                                        aria-current={active ? 'page' : undefined}
                                        className={[
                                            'w-full flex items-center rounded-lg transition-all duration-150 group relative',
                                            'min-h-[44px] active:scale-[0.97]',
                                            isCollapsed
                                                ? 'justify-center p-2.5'
                                                : 'gap-3 px-3 py-2.5',
                                        ].join(' ')}
                                        style={
                                            active
                                                ? {
                                                    backgroundColor: 'rgba(59,130,246,0.1)',
                                                    color: '#3b82f6',
                                                }
                                                : {
                                                    color: 'var(--text-secondary)',
                                                }
                                        }
                                        onMouseEnter={(e) => {
                                            if (!active) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!active) e.currentTarget.style.backgroundColor = '';
                                        }}
                                    >
                                        {/* Icon */}
                                        <Icon
                                            className="w-[18px] h-[18px] flex-shrink-0 transition-colors"
                                            style={{ color: active ? '#3b82f6' : 'var(--text-muted)' }}
                                        />

                                        {/* Label */}
                                        {!isCollapsed && (
                                            <span
                                                className="text-sm font-medium text-left whitespace-nowrap leading-none flex-1"
                                                style={{ color: active ? '#3b82f6' : 'var(--text-primary)' }}
                                            >
                                                {item.label}
                                            </span>
                                        )}

                                        {/* Active indicator dot */}
                                        {active && !isCollapsed && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                        )}

                                        {/* Active indicator bar (collapsed) */}
                                        {active && isCollapsed && (
                                            <span
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-blue-500"
                                            />
                                        )}

                                        {/* Tooltip (collapsed, desktop only) */}
                                        {isCollapsed && (
                                            <span
                                                className="pointer-events-none absolute left-full ml-3 z-50 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shadow-lg opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 hidden md:block"
                                                style={{
                                                    backgroundColor: 'var(--bg-surface)',
                                                    color: 'var(--text-primary)',
                                                    border: '1px solid var(--border)',
                                                    boxShadow: 'var(--shadow-lg)',
                                                }}
                                            >
                                                {item.label}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* ── Logout ── */}
                <div
                    className="px-2 py-3 flex-shrink-0"
                    style={{ borderTop: '1px solid var(--sidebar-border)' }}
                >
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className={[
                            'w-full flex items-center rounded-lg transition-all duration-150 group relative',
                            'min-h-[44px] active:scale-[0.97]',
                            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                        ].join(' ')}
                        style={{ color: '#ef4444' }}
                        aria-label="Logout"
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
                    >
                        <HiOutlineLogout
                            className="w-[18px] h-[18px] flex-shrink-0"
                            style={{ color: '#ef4444' }}
                        />
                        {!isCollapsed && (
                            <span className="text-sm font-medium whitespace-nowrap flex-1 text-left leading-none">
                                Logout
                            </span>
                        )}

                        {/* Tooltip (collapsed, desktop only) */}
                        {isCollapsed && (
                            <span
                                className="pointer-events-none absolute left-full ml-3 z-50 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shadow-lg opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 hidden md:block"
                                style={{
                                    backgroundColor: 'var(--bg-surface)',
                                    color: 'var(--danger)',
                                    border: '1px solid var(--border)',
                                    boxShadow: 'var(--shadow-lg)',
                                }}
                            >
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
