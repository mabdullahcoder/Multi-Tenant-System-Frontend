import { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineDotsVertical,
    HiOutlineEye,
    HiOutlineTrash,
    HiOutlineChevronDown,
} from 'react-icons/hi';
import StatusSwitcher from './StatusSwitcher';
import { useUI } from '../../context/UIContext';
import { orderAPI } from '../../services/orderAPI';

/* ─────────────────────────────────────────────
   Shared status pill used in both views
───────────────────────────────────────────── */
function StatusPill({ config }) {
    const Icon = config.icon;
    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                px-2.5 py-1 rounded-full
                text-xs font-semibold tracking-wide
                border
                ${config.bgColor} ${config.textColor} ${config.borderColor}
            `}
        >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            {config.label}
        </span>
    );
}

/* ─────────────────────────────────────────────
   Actions dropdown (shared)
───────────────────────────────────────────── */
function ActionsDropdown({
    order,
    isOpen,
    onToggle,
    onViewDetails,
    onStatusChange,
    onDelete,
    getStatusConfig,
    availableTransitions,
    allStatuses = [],
    userRole,
    align = 'right', // 'right' | 'left'
}) {
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, openUp: false });

    // Calculate position when opening
    const updatePosition = () => {
        if (triggerRef.current && popoverRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const menuHeight = 160;
            const menuWidth = 208; // w-52 = 208px

            const spaceBelow = window.innerHeight - triggerRect.bottom;
            const spaceAbove = triggerRect.top;
            const openUp = spaceBelow < menuHeight && spaceAbove > menuHeight;

            // Calculate horizontal position based on alignment
            let left = triggerRect.right + window.scrollX;
            if (align === 'right') {
                left = triggerRect.right + window.scrollX - menuWidth;
            }

            // Ensure menu stays within viewport horizontally
            const minLeft = 8;
            const maxLeft = window.innerWidth - menuWidth - 8;
            left = Math.max(minLeft, Math.min(maxLeft, left));

            const top = openUp
                ? triggerRect.top + window.scrollY - menuHeight
                : triggerRect.bottom + window.scrollY;

            setPopoverPos({
                top,
                left,
                openUp,
            });
        }
    };

    // Handle outside click locally
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target) &&
                popoverRef.current && !popoverRef.current.contains(e.target)
            ) {
                onToggle();
            }
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') onToggle();
        };

        const handleRefresh = () => updatePosition();

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        window.addEventListener('scroll', handleRefresh, true);
        window.addEventListener('resize', handleRefresh);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            window.removeEventListener('scroll', handleRefresh, true);
            window.removeEventListener('resize', handleRefresh);
        };
    }, [isOpen, onToggle]);

    const handleOpen = () => {
        updatePosition();
        onToggle();
    };

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                onClick={handleOpen}
                className={`
                    inline-flex items-center justify-center
                    w-8 h-8 rounded-full
                    text-gray-400 hover:text-gray-600
                    hover:bg-gray-100 transition-all duration-200
                    ${isOpen ? 'bg-gray-100 text-gray-700 font-bold' : ''}
                `}
                aria-label="Order actions"
            >
                <HiOutlineDotsVertical className="w-4 h-4" />
            </button>

            {ReactDOM.createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={popoverRef}
                            initial={{
                                opacity: 0,
                                scale: 0.95,
                                y: popoverPos.openUp ? 8 : -8,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.95,
                                y: popoverPos.openUp ? 8 : -8,
                            }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            style={{
                                position: 'fixed',
                                top: popoverPos.top,
                                left: popoverPos.left,
                                zIndex: 9999,
                            }}
                            className="w-52 bg-white rounded-xl shadow-2xl border border-gray-200 py-1.5 pointer-events-auto"
                        >
                            {/* View Details */}
                            <button
                                onClick={() => { onViewDetails(order._id); onToggle(); }}
                                className="
                                    w-full flex items-center gap-3
                                    px-3.5 py-2.5
                                    text-sm text-gray-700 font-medium
                                    hover:bg-gray-50
                                    transition-colors duration-100
                                "
                            >
                                <HiOutlineEye className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                View Details
                            </button>

                            {/* Delete — super-admin only */}
                            {userRole === 'super-admin' && (
                                <>
                                    <div className="my-1 border-t border-gray-100" />
                                    <button
                                        onClick={() => { onDelete(order._id, order.orderId); onToggle(); }}
                                        className="
                                            w-full flex items-center gap-3
                                            px-3.5 py-2.5
                                            text-sm font-medium text-red-600
                                            hover:bg-red-50
                                            transition-colors duration-100
                                        "
                                    >
                                        <HiOutlineTrash className="w-4 h-4 flex-shrink-0" />
                                        Delete Order
                                    </button>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
function ResponsiveOrderTable({
    orders,
    onStatusChange,
    onDelete,
    onViewDetails,
    getStatusConfig,
    getAvailableStatusTransitions,
    allStatuses = [],
    userRole,
    deletingOrderId,
    showCustomer = true, // admin sees customer; user doesn't need it
}) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [updatingOrders, setUpdatingOrders] = useState({});
    const { addNotification } = useUI();

    const handleStatusUpdate = async (orderId, newStatus, currentStatus) => {
        setUpdatingOrders(prev => ({ ...prev, [orderId]: true }));
        try {
            await onStatusChange(orderId, newStatus, currentStatus);
            // Parent fetchOrders will handle the re-render
        } finally {
            setUpdatingOrders(prev => ({ ...prev, [orderId]: false }));
        }
    };

    /* close on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggle = (id) => setOpenDropdown((prev) => (prev === id ? null : id));

    /* ── Desktop table ── */
    const DesktopTable = () => (
        <div className="hidden md:block w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* thead */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div
                    className={`
                        grid items-center
                        ${showCustomer
                            ? 'grid-cols-[2fr_1.6fr_2.2fr_0.6fr_1.2fr_1.1fr_52px]'
                            : 'grid-cols-[2fr_2.4fr_0.6fr_1.2fr_1.1fr_52px]'
                        }
                        px-5 py-3 gap-4
                    `}
                >
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Order</span>
                    {showCustomer && (
                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Customer</span>
                    )}
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Product</span>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">Qty</span>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</span>
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">Status</span>
                    <span className="sr-only">Actions</span>
                </div>
            </div>

            {/* tbody */}
            <div className="divide-y divide-gray-100">
                {orders.map((order) => {
                    const cfg = getStatusConfig(order.status);
                    const transitions = getAvailableStatusTransitions(order.status);

                    return (
                        <div
                            key={order._id}
                            className={`
                                grid items-center
                                ${showCustomer
                                    ? 'grid-cols-[2fr_1.6fr_2.2fr_0.6fr_1.2fr_1.1fr_52px]'
                                    : 'grid-cols-[2fr_2.4fr_0.6fr_1.2fr_1.1fr_52px]'
                                }
                                px-5 py-3.5 gap-4
                                hover:bg-gray-50/70 transition-all duration-300
                                group relative
                                ${order._id === deletingOrderId ? 'opacity-40 grayscale pointer-events-none' : ''}
                            `}
                        >
                            {order._id === deletingOrderId && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/10 backdrop-blur-[1px]">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm">
                                        <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Deleting</span>
                                    </div>
                                </div>
                            )}
                            {/* Order ID + date */}
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate leading-snug">
                                    #{order.orderId}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric',
                                    })}
                                </p>
                                <p className="text-xs text-gray-400 leading-snug">
                                    {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                        hour: '2-digit', minute: '2-digit',
                                    })}
                                </p>
                            </div>

                            {/* Customer */}
                            {showCustomer && (
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate leading-snug">
                                        {order.userId?.firstName || '—'} {order.userId?.lastName || ''}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate mt-0.5 leading-snug">
                                        {order.userId?.email || ''}
                                    </p>
                                </div>
                            )}

                            {/* Product */}
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate leading-snug">
                                    {order.productName}
                                </p>
                                {order.productDescription && (
                                    <p className="text-xs text-gray-400 truncate mt-0.5 leading-snug">
                                        {order.productDescription}
                                    </p>
                                )}
                            </div>

                            {/* Qty */}
                            <div className="flex justify-center">
                                <span className="
                                    inline-flex items-center justify-center
                                    w-8 h-8 rounded-lg
                                    bg-gray-100 text-gray-700
                                    text-sm font-semibold
                                ">
                                    {order.quantity}
                                </span>
                            </div>

                            {/* Amount */}
                            <div className="text-right min-w-0">
                                <p className="text-sm font-bold text-gray-900 leading-snug">
                                    ₨{order.totalAmount?.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                                    ₨{(order.totalAmount / order.quantity)?.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ea.
                                </p>
                            </div>

                            {/* Status */}
                            <div className="flex justify-center items-center h-full">
                                <StatusSwitcher
                                    orderId={order._id}
                                    currentStatus={order.status}
                                    onStatusChange={handleStatusUpdate}
                                    statusConfig={Object.fromEntries(
                                        Object.keys(allStatuses.reduce((acc, s) => ({ ...acc, [s]: null }), {})).map(s => [s, getStatusConfig(s)])
                                    )}
                                    allStatuses={allStatuses}
                                    availableTransitions={transitions}
                                    userRole={userRole}
                                    isUpdating={updatingOrders[order._id]}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end items-center h-full">
                                <ActionsDropdown
                                    order={order}
                                    isOpen={openDropdown === order._id}
                                    onToggle={() => toggle(order._id)}
                                    onViewDetails={onViewDetails}
                                    onStatusChange={onStatusChange}
                                    onDelete={onDelete}
                                    getStatusConfig={getStatusConfig}
                                    availableTransitions={transitions}
                                    allStatuses={allStatuses}
                                    userRole={userRole}
                                    align="right"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    /* ── Mobile cards ── */
    const MobileCards = () => (
        <div className="md:hidden space-y-3">
            {orders.map((order) => {
                const cfg = getStatusConfig(order.status);
                const transitions = getAvailableStatusTransitions(order.status);
                const isExpanded = openDropdown === order._id;

                return (
                    <div
                        key={order._id}
                        className={`
                            bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 relative
                            ${order._id === deletingOrderId ? 'opacity-40 grayscale pointer-events-none scale-[0.98]' : ''}
                        `}
                    >
                        {order._id === deletingOrderId && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-lg">
                                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Deleting Order...</span>
                                </div>
                            </div>
                        )}
                        {/* Card header */}
                        <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-gray-100">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-bold text-gray-900">
                                        #{order.orderId}
                                    </span>
                                    {/* "New" badge — within 5 min */}
                                    {new Date() - new Date(order.createdAt) < 5 * 60 * 1000 && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wide">
                                            New
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric',
                                    })}{' '}
                                    ·{' '}
                                    {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                        hour: '2-digit', minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            <StatusSwitcher
                                orderId={order._id}
                                currentStatus={order.status}
                                onStatusChange={handleStatusUpdate}
                                statusConfig={Object.fromEntries(
                                    allStatuses.map(s => [s, getStatusConfig(s)])
                                )}
                                allStatuses={allStatuses}
                                availableTransitions={transitions}
                                userRole={userRole}
                                isUpdating={updatingOrders[order._id]}
                            />
                        </div>

                        {/* Card body */}
                        <div className="px-4 py-3 space-y-3">
                            {/* Product */}
                            <div>
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Product</p>
                                <p className="text-sm font-semibold text-gray-800 leading-snug">{order.productName}</p>
                                {order.productDescription && (
                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{order.productDescription}</p>
                                )}
                            </div>

                            {/* Meta row */}
                            <div className={`grid gap-3 ${showCustomer ? 'grid-cols-3' : 'grid-cols-2'}`}>
                                {showCustomer && (
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Customer</p>
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {order.userId?.firstName || '—'} {order.userId?.lastName || ''}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Qty</p>
                                    <p className="text-sm font-bold text-gray-900">{order.quantity}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Total</p>
                                    <p className="text-sm font-bold text-gray-900">
                                        ₨{order.totalAmount?.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card footer — actions */}
                        <div className="px-4 pb-4 flex items-center gap-2">
                            <button
                                onClick={() => onViewDetails(order._id)}
                                className="
                                    flex-1 flex items-center justify-center gap-2
                                    px-3 py-2 rounded-lg
                                    bg-blue-50 text-blue-700
                                    text-sm font-semibold
                                    hover:bg-blue-100
                                    transition-colors duration-150
                                "
                            >
                                <HiOutlineEye className="w-4 h-4" />
                                View Details
                            </button>

                            {(() => {
                                const isAdmin = userRole === 'admin' || userRole === 'super-admin';
                                const displayTransitions = isAdmin
                                    ? allStatuses.filter(s => s !== order.status)
                                    : transitions;

                                if (displayTransitions.length === 0 && userRole !== 'super-admin') return null;

                                return (
                                    <button
                                        onClick={() => toggle(order._id)}
                                        className="
                                            flex items-center gap-1.5
                                            px-3 py-2 rounded-lg
                                            bg-gray-100 text-gray-600
                                            text-sm font-semibold
                                            hover:bg-gray-200
                                            transition-colors duration-150
                                        "
                                    >
                                        Actions
                                        <HiOutlineChevronDown
                                            className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                );
                            })()}
                        </div>

                        {/* Expandable actions panel */}
                        {/* Expandable actions panel */}
                        {isExpanded && (
                            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-2">
                                <div className="text-center text-xs text-gray-400 italic mb-2">
                                    Status management moved to the top-right button.
                                </div>
                                {userRole === 'super-admin' && (
                                    <button
                                        onClick={() => { onDelete(order._id, order.orderId); toggle(order._id); }}
                                        className="
                                            w-full flex items-center justify-center gap-2
                                            px-3 py-2 rounded-lg
                                            bg-red-50 text-red-600
                                            text-sm font-semibold
                                            border border-red-200
                                            hover:bg-red-100 transition-colors
                                            mt-1
                                        "
                                    >
                                        <HiOutlineTrash className="w-4 h-4" />
                                        Delete Order
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <>
            <DesktopTable />
            <MobileCards />
        </>
    );
}

export default ResponsiveOrderTable;
