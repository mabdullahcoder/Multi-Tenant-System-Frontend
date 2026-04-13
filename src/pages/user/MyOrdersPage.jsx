import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import { orderAPI } from '../../services/orderAPI';
import { useUI } from '../../context/UIContext';
import {
    HiOutlineClock, HiOutlineCheckCircle,
    HiOutlineCheck, HiOutlineXCircle,
    HiOutlineShoppingBag, HiOutlinePlus,
    HiRefresh, HiOutlineTruck,
} from 'react-icons/hi';
import { useSocket } from '../../context/SocketContext';
import SearchInput from '../../components/ui/SearchInput';


/* ── Status config (same palette as admin) ── */
const STATUS_CONFIG = {
    pending: { label: 'Pending', icon: HiOutlineClock, bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200', dotColor: 'bg-amber-500' },
    confirmed: { label: 'Confirmed', icon: HiOutlineCheckCircle, bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200', dotColor: 'bg-blue-500' },
    shipped: { label: 'Shipped', icon: HiOutlineTruck, bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200', dotColor: 'bg-purple-500' },
    delivered: { label: 'Delivered', icon: HiOutlineCheck, bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200', dotColor: 'bg-emerald-500' },
    cancelled: { label: 'Cancelled', icon: HiOutlineXCircle, bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200', dotColor: 'bg-red-500' },
};

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'shipped', label: 'Shipped' },
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

    const fetchOrders = useCallback(async () => {
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
    }, [addNotification]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    /* Real-time socket updates */
    useEffect(() => {
        if (!socket) return;

        const handleStatusUpdate = (data) => {
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
    }, [location.state, fetchOrders]);

    // Refetch when the tab regains focus — stable ref ensures no listener leak
    useEffect(() => {
        window.addEventListener('focus', fetchOrders);
        return () => window.removeEventListener('focus', fetchOrders);
    }, [fetchOrders]);

    const getStatusConfig = (s) => STATUS_CONFIG[s] || STATUS_CONFIG.pending;

    /**
     * Calculate filtered orders with memoization for performance
     * Ensures consistent filtering logic across all status types
     * Supports both single-item and multi-item orders
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
            shipped: 0,
            delivered: 0,
            cancelled: 0,
        };

        // Count each status
        orders.forEach((order) => {
            const status = order.status || 'pending';
            if (Object.prototype.hasOwnProperty.call(counts, status)) {
                counts[status]++;
            }
        });

        // Apply search filter first
        let searchFiltered = orders;
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            searchFiltered = orders.filter((o) => {
                const orderId = (o.orderId || '').toLowerCase();

                // Handle multi-item orders
                if (o.items && o.items.length > 0) {
                    const itemsText = o.items
                        .map(item => item.productName)
                        .join(' ')
                        .toLowerCase();
                    return orderId.includes(query) || itemsText.includes(query);
                }

                // Handle single-item orders (backward compatibility)
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
                        <h1 className="text-heading-2">My Orders</h1>
                        <p className="text-description mt-1">Track and manage all your orders</p>
                    </div>
                    <button
                        onClick={() => navigate('/user/place-order')}
                        className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm min-h-[44px]"
                        style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        Place Order
                    </button>
                </div>

                {/* ── Search ── */}
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClear={() => setSearchTerm('')}
                    placeholder="Search by product name or order ID…"
                />

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
                                    className="relative px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 flex items-center gap-2 min-h-[36px]"
                                    style={isActive
                                        ? { backgroundColor: 'var(--primary)', color: '#fff' }
                                        : { backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                                    }
                                    title={`View ${label.toLowerCase()} orders (${count})`}
                                >
                                    <span>{label}</span>
                                    {count > 0 && (
                                        <span
                                            className="inline-flex items-center justify-center min-w-6 h-5 px-1.5 rounded-full text-xs font-bold"
                                            style={isActive
                                                ? { backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff' }
                                                : { backgroundColor: 'var(--bg-surface-3)', color: 'var(--text-secondary)' }
                                            }
                                        >
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
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading your orders…</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <>
                        {/* result count ── */}
                        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                            {searchTerm ? (
                                <>
                                    {filteredOrders.length} {filteredOrders.length === 1 ? 'result' : 'results'} found
                                    {statusFilter !== 'all' && ` · ${statusFilter}`}
                                </>
                            ) : (
                                <>
                                    Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                                    {statusFilter !== 'all' && ` · ${statusFilter}`}
                                </>
                            )}
                        </p>

                        {/* ── Desktop table ── */}
                        <div className="hidden md:block w-full rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                            {/* thead */}
                            <div style={{ backgroundColor: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border)' }}>
                                <div className="grid grid-cols-[2fr_2.4fr_0.6fr_1.2fr_1.1fr] items-center px-5 py-3 gap-4">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Order</span>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Product</span>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-center" style={{ color: 'var(--text-secondary)' }}>Qty</span>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--text-secondary)' }}>Amount</span>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-center" style={{ color: 'var(--text-secondary)' }}>Status</span>
                                </div>
                            </div>

                            {/* tbody */}
                            <div className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                                {filteredOrders.map((order) => {
                                    const cfg = getStatusConfig(order.status);
                                    const StatusIcon = cfg.icon;
                                    const isNew = new Date() - new Date(order.createdAt) < 5 * 60 * 1000;

                                    // Handle both single-item and multi-item orders
                                    const isMultiItem = order.items && order.items.length > 1;
                                    const totalQuantity = isMultiItem
                                        ? order.items.reduce((sum, item) => sum + item.quantity, 0)
                                        : order.quantity;
                                    const displayProductName = isMultiItem
                                        ? `${order.items.length} items`
                                        : order.productName;
                                    const displayProductDesc = isMultiItem
                                        ? order.items.map(item => item.productName).slice(0, 2).join(', ') + (order.items.length > 2 ? '...' : '')
                                        : order.productDescription;

                                    return (
                                        <div
                                            key={order._id}
                                            className="grid grid-cols-[2fr_2.4fr_0.6fr_1.2fr_1.1fr] items-center px-5 py-3.5 gap-4 transition-colors duration-100 cursor-pointer"
                                            style={{ color: 'var(--text-primary)' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
                                            onClick={() => navigate(`/user/order/${order._id}`, { state: { refresh: false } })}
                                        >
                                            {/* Order */}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold truncate leading-snug" style={{ color: 'var(--text-primary)' }}>
                                                        #{order.orderId}
                                                    </span>
                                                    {isNew && (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wide flex-shrink-0">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <p className="text-xs leading-snug" style={{ color: 'var(--text-muted)' }}>
                                                    {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>

                                            {/* Product */}
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate leading-snug" style={{ color: 'var(--text-primary)' }}>{displayProductName}</p>
                                                {displayProductDesc && (
                                                    <p className="text-xs truncate mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>{displayProductDesc}</p>
                                                )}
                                            </div>

                                            {/* Qty */}
                                            <div className="flex justify-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold" style={{ backgroundColor: 'var(--bg-surface-3)', color: 'var(--text-primary)' }}>
                                                    {totalQuantity}
                                                </span>
                                            </div>

                                            {/* Amount */}
                                            <div className="text-right min-w-0">
                                                <p className="text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                                                    ₨{order.totalAmount?.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                                <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>
                                                    ₨{(order.totalAmount / totalQuantity)?.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} avg
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

                                // Handle both single-item and multi-item orders
                                const isMultiItem = order.items && order.items.length > 1;
                                const totalQuantity = isMultiItem
                                    ? order.items.reduce((sum, item) => sum + item.quantity, 0)
                                    : order.quantity;
                                const displayProductName = isMultiItem
                                    ? `${order.items.length} items`
                                    : order.productName;
                                const displayProductDesc = isMultiItem
                                    ? order.items.map(item => item.productName).join(', ')
                                    : order.productDescription;

                                return (
                                    <div
                                        key={order._id}
                                        className="rounded-xl shadow-sm overflow-hidden cursor-pointer transition-shadow"
                                        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                                        onClick={() => navigate(`/user/order/${order._id}`, { state: { refresh: false } })}
                                    >
                                        {/* header */}
                                        <div className="flex items-start justify-between px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>#{order.orderId}</span>
                                                    {isNew && (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wide">New</span>
                                                    )}
                                                </div>
                                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
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
                                                <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Product</p>
                                                <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>{displayProductName}</p>
                                                {displayProductDesc && (
                                                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{displayProductDesc}</p>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Qty</p>
                                                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{totalQuantity}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Total</p>
                                                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                                        ₨{order.totalAmount?.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    /* ── Empty state ── */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--bg-surface-3)' }}>
                            <HiOutlineShoppingBag className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                        </div>
                        {searchTerm ? (
                            <>
                                <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No orders match your search</h3>
                                <p className="text-sm max-w-xs mb-5" style={{ color: 'var(--text-muted)' }}>
                                    Try adjusting your search terms or {statusFilter !== 'all' ? 'viewing a different status.' : 'check back later.'}
                                </p>
                                <button
                                    onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                                    style={{ color: 'var(--primary)' }}
                                >
                                    <HiRefresh className="w-4 h-4" />
                                    Clear filters
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                    {statusFilter !== 'all' ? `No ${statusFilter} orders` : 'No orders yet'}
                                </h3>
                                <p className="text-sm max-w-xs mb-5" style={{ color: 'var(--text-muted)' }}>
                                    {statusFilter !== 'all'
                                        ? `You don't have any ${statusFilter} orders. Try a different filter.`
                                        : "You haven't placed any orders yet. Browse the menu and place your first order!"}
                                </p>
                                <button
                                    onClick={() => navigate('/user/place-order')}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm min-h-[44px] active:scale-95"
                                    style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                                >
                                    <HiOutlinePlus className="w-4 h-4" />
                                    Browse Menu
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
