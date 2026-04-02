import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import { orderAPI } from '../../services/orderAPI';
import { useUI } from '../../context/UIContext';
import {
    HiOutlineSearch, HiOutlineX,
    HiOutlineClock, HiOutlineCheckCircle,
    HiOutlineCheck, HiOutlineXCircle,
    HiOutlineShoppingBag, HiOutlinePlus,
} from 'react-icons/hi';
import { useSocket } from '../../context/SocketContext';


/* ── Status config (same palette as admin) ── */
const STATUS_CONFIG = {
    pending: { label: 'Pending', icon: HiOutlineClock, bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200', dotColor: 'bg-amber-500' },
    confirmed: { label: 'Confirmed', icon: HiOutlineCheckCircle, bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200', dotColor: 'bg-blue-500' },
    delivered: { label: 'Delivered', icon: HiOutlineCheck, bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200', dotColor: 'bg-emerald-500' },
    cancelled: { label: 'Cancelled', icon: HiOutlineXCircle, bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200', dotColor: 'bg-red-500' },
};

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
];

/* ── Status pill ── */
function StatusPill({ config }) {
    const Icon = config.icon;
    return (
        <span className={`
            inline-flex items-center gap-1.5
            px-2.5 py-1 rounded-full
            text-xs font-semibold tracking-wide border
            ${config.bgColor} ${config.textColor} ${config.borderColor}
        `}>
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            {config.label}
        </span>
    );
}

function MyOrdersPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { addNotification } = useUI();
    const socket = useSocket();
    const [orders, setOrders] = useState([]);

    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { fetchOrders(); }, []);

    /* Real-time socket updates */
    useEffect(() => {
        if (!socket) return;

        const handleStatusUpdate = (data) => {
            console.log('✓ Real-time status update received:', data);

            setOrders((prevOrders) =>
                prevOrders.map((order) => {
                    if (order.orderId === data.orderId || order._id === data._id) {
                        return { ...order, status: data.status, updatedAt: data.updatedAt };
                    }
                    return order;
                })
            );

            addNotification({
                type: 'info',
                message: data.message || `Order #${data.orderId} status updated to ${data.status}`,
            });
        };

        const handleOrderCancelled = (data) => {
            console.log('✓ Order cancellation received:', data);

            setOrders((prevOrders) =>
                prevOrders.map((order) => {
                    if (order.orderId === data.orderId || order._id === data._id) {
                        return { ...order, status: data.status, updatedAt: data.updatedAt };
                    }
                    return order;
                })
            );

            addNotification({
                type: 'warning',
                message: data.message || `Order #${data.orderId} has been cancelled.`,
            });
        };

        // Listen to both event names from backend
        socket.on('orderStatusUpdate', handleStatusUpdate);
        socket.on('orderCancelled', handleOrderCancelled);

        return () => {
            socket.off('orderStatusUpdate', handleStatusUpdate);
            socket.off('orderCancelled', handleOrderCancelled);
        };
    }, [socket, addNotification]);

    /* refresh on navigate-back */
    useEffect(() => {
        if (location.state?.refresh) {
            const t = setTimeout(fetchOrders, 500);
            window.history.replaceState({}, document.title);
            return () => clearTimeout(t);
        }
    }, [location.state]);

    useEffect(() => {
        window.addEventListener('focus', fetchOrders);
        return () => window.removeEventListener('focus', fetchOrders);
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const res = await orderAPI.getUserOrders(1, 100, {});
            setOrders(res.data || []);
        } catch (err) {
            if (err.response?.status !== 404) {
                addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to fetch orders' });
            }
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusConfig = (s) => STATUS_CONFIG[s] || STATUS_CONFIG.pending;

    /**
     * Calculate filtered orders with memoization for performance
     * Ensures consistent filtering logic across all status types
     */
    const { filteredOrders, statusCounts } = useMemo(() => {
        if (!orders || orders.length === 0) {
            return { filteredOrders: [], statusCounts: {} };
        }

        // Count orders by each status
        const counts = {
            all: orders.length,
            pending: 0,
            confirmed: 0,
            delivered: 0,
            cancelled: 0,
        };

        // Count each status
        orders.forEach((order) => {
            const status = order.status || 'pending';
            if (counts.hasOwnProperty(status)) {
                counts[status]++;
            }
        });

        // Apply search filter first
        let searchFiltered = orders;
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            searchFiltered = orders.filter((o) => {
                const orderId = (o.orderId || '').toLowerCase();
                const productName = (o.productName || '').toLowerCase();
                const productDesc = (o.productDescription || '').toLowerCase();
                return (
                    orderId.includes(query) ||
                    productName.includes(query) ||
                    productDesc.includes(query)
                );
            });
        }

        // Apply status filter
        let statusFiltered = searchFiltered;
        if (statusFilter !== 'all') {
            statusFiltered = searchFiltered.filter(
                (o) => (o.status || 'pending') === statusFilter
            );
        }

        return {
            filteredOrders: statusFiltered,
            statusCounts: counts,
        };
    }, [orders, statusFilter, searchTerm]);

    return (
        <MainLayout>
            <div className="space-y-5">

                {/* ── Page header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">My Orders</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Track and manage all your orders</p>
                    </div>
                    <button
                        onClick={() => navigate('/user/place-order')}
                        className="
                            self-start sm:self-auto
                            inline-flex items-center gap-2
                            px-4 py-2 rounded-lg
                            bg-blue-600 text-white text-sm font-semibold
                            hover:bg-blue-700 transition-colors shadow-sm
                        "
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        Place Order
                    </button>
                </div>

                {/* ── Search ── */}
                <div className="relative">
                    <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by product name or order ID…"
                        className="
                            w-full pl-10 pr-10 py-2.5
                            rounded-lg border border-gray-300 bg-white
                            text-sm text-gray-900 placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            transition-shadow
                        "
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <HiOutlineX className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* ── Filter tabs with status counts ── */}
                <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 scrollbar-hide">
                    <div className="flex gap-1.5 min-w-max">
                        {FILTERS.map(({ key, label }) => {
                            const count = statusCounts[key] || 0;
                            const isActive = statusFilter === key;

                            return (
                                <button
                                    key={key}
                                    onClick={() => setStatusFilter(key)}
                                    className={`
                                        relative px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                                        transition-all duration-150 flex items-center gap-2
                                        ${isActive
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                        }
                                    `}
                                    title={`View ${label.toLowerCase()} orders (${count})`}
                                >
                                    <span>{label}</span>
                                    {count > 0 && (
                                        <span className={`
                                            inline-flex items-center justify-center
                                            min-w-6 h-6 px-1.5 rounded-full text-xs font-bold
                                            ${isActive
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-700'
                                            }
                                        `}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Content ── */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="spinner" />
                        <p className="text-sm text-gray-500">Loading your orders…</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <>
                        {/* result count ── */}
                        <p className="text-xs text-gray-500 font-medium">
                            {searchTerm ? (
                                <>
                                    {filteredOrders.length} {filteredOrders.length === 1 ? 'result' : 'results'} found
                                    {statusFilter !== 'all' && ` (${statusFilter})`}
                                </>
                            ) : (
                                <>
                                    {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                                    {statusFilter !== 'all' && ` in ${statusFilter}`}
                                </>
                            )}
                        </p>

                        {/* ── Desktop table ── */}
                        <div className="hidden md:block w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* thead */}
                            <div className="bg-gray-50 border-b border-gray-200">
                                <div className="grid grid-cols-[2fr_2.4fr_0.6fr_1.2fr_1.1fr] items-center px-5 py-3 gap-4">
                                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Order</span>
                                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Product</span>
                                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">Qty</span>
                                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</span>
                                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">Status</span>
                                </div>
                            </div>

                            {/* tbody */}
                            <div className="divide-y divide-gray-100">
                                {filteredOrders.map((order) => {
                                    const cfg = getStatusConfig(order.status);
                                    const StatusIcon = cfg.icon;
                                    const isNew = new Date() - new Date(order.createdAt) < 5 * 60 * 1000;

                                    return (
                                        <div
                                            key={order._id}
                                            className="grid grid-cols-[2fr_2.4fr_0.6fr_1.2fr_1.1fr] items-center px-5 py-3.5 gap-4 hover:bg-gray-50/70 transition-colors duration-100"
                                        >
                                            {/* Order */}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-gray-900 truncate leading-snug">
                                                        #{order.orderId}
                                                    </span>
                                                    {isNew && (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wide flex-shrink-0">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <p className="text-xs text-gray-400 leading-snug">
                                                    {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>

                                            {/* Product */}
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate leading-snug">{order.productName}</p>
                                                {order.productDescription && (
                                                    <p className="text-xs text-gray-400 truncate mt-0.5 leading-snug">{order.productDescription}</p>
                                                )}
                                            </div>

                                            {/* Qty */}
                                            <div className="flex justify-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold">
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
                                            <div className="flex justify-center">
                                                <StatusPill config={cfg} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Mobile cards ── */}
                        <div className="md:hidden space-y-3">
                            {filteredOrders.map((order) => {
                                const cfg = getStatusConfig(order.status);
                                const isNew = new Date() - new Date(order.createdAt) < 5 * 60 * 1000;

                                return (
                                    <div key={order._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                        {/* header */}
                                        <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-gray-100">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-bold text-gray-900">#{order.orderId}</span>
                                                    {isNew && (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wide">New</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    {' · '}
                                                    {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <StatusPill config={cfg} />
                                        </div>

                                        {/* body */}
                                        <div className="px-4 py-3 space-y-3">
                                            <div>
                                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Product</p>
                                                <p className="text-sm font-semibold text-gray-800 leading-snug">{order.productName}</p>
                                                {order.productDescription && (
                                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{order.productDescription}</p>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
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

                                        {/* footer removed — no actions */}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    /* ── Empty state ── */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <HiOutlineShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                        {searchTerm ? (
                            <>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">No orders match your search</h3>
                                <p className="text-sm text-gray-500 max-w-xs mb-5">
                                    Try adjusting your search terms or {statusFilter !== 'all' ? 'viewing a different status.' : 'check back later.'}
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                    }}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Clear filters
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">
                                    {statusFilter !== 'all' ? `No ${statusFilter} orders` : 'No orders yet'}
                                </h3>
                                <p className="text-sm text-gray-500 max-w-xs mb-5">
                                    {statusFilter !== 'all'
                                        ? `You don't have any orders in "${statusFilter}" status. Try a different status or `
                                        : 'You haven\'t placed any orders yet. Start by '}
                                    placing your first order.
                                </p>
                                <button
                                    onClick={() => navigate('/user/place-order')}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <HiOutlinePlus className="w-4 h-4" />
                                    Place Order
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

export default MyOrdersPage;
