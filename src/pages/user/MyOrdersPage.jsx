import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import { orderAPI } from '../../services/orderAPI';
import { useUI } from '../../context/UIContext';
import {
    HiOutlineSearch, HiOutlineX,
    HiOutlineClock, HiOutlineCheckCircle,
    HiOutlineTruck, HiOutlineCheck, HiOutlineXCircle,
    HiOutlineShoppingBag, HiOutlinePlus,
} from 'react-icons/hi';
import { useSocket } from '../../context/SocketContext';


/* ── Status config (same palette as admin) ── */
const STATUS_CONFIG = {
    pending: { label: 'Pending', icon: HiOutlineClock, bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200', dotColor: 'bg-amber-500' },
    confirmed: { label: 'Confirmed', icon: HiOutlineCheckCircle, bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200', dotColor: 'bg-blue-500' },
    shipped: { label: 'Shipped', icon: HiOutlineTruck, bgColor: 'bg-violet-50', textColor: 'text-violet-700', borderColor: 'border-violet-200', dotColor: 'bg-violet-500' },
    delivered: { label: 'Delivered', icon: HiOutlineCheck, bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200', dotColor: 'bg-emerald-500' },
    cancelled: { label: 'Cancelled', icon: HiOutlineXCircle, bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200', dotColor: 'bg-red-500' },
};

const FILTERS = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
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
            console.log('Real-time status update received:', data);
            
            setOrders((prevOrders) => 
                prevOrders.map((order) => {
                    if (order.orderId === data.orderId) {
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

        socket.on('statusUpdate', handleStatusUpdate);

        return () => {
            socket.off('statusUpdate', handleStatusUpdate);
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

    const filteredOrders = (orders || [])
        .filter((o) => {
            if (!searchTerm.trim()) return true;
            const q = searchTerm.toLowerCase();
            return o.productName?.toLowerCase().includes(q) || o.orderId?.toLowerCase().includes(q);
        })
        .filter((o) => {
            if (statusFilter === 'all') return true;
            if (statusFilter === 'completed') return o.status === 'delivered';
            return o.status === statusFilter;
        });

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

                {/* ── Filter tabs ── */}
                <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 scrollbar-hide">
                    <div className="flex gap-1.5 min-w-max">
                        {FILTERS.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setStatusFilter(key)}
                                className={`
                                    px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                                    transition-all duration-150
                                    ${statusFilter === key
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                    }
                                `}
                            >
                                {label}
                            </button>
                        ))}
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
                        {/* result count */}
                        <p className="text-xs text-gray-500">
                            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                            {(orders?.length || 0) > filteredOrders.length && ` · filtered from ${orders.length} total`}
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
                        <h3 className="text-base font-semibold text-gray-900 mb-1">No orders found</h3>
                        <p className="text-sm text-gray-500 max-w-xs mb-5">
                            {searchTerm
                                ? "No orders match your search. Try different keywords."
                                : "You haven't placed any orders yet. Start by placing your first order."}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => navigate('/user/place-order')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <HiOutlinePlus className="w-4 h-4" />
                                Place Your First Order
                            </button>
                        )}
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

export default MyOrdersPage;
