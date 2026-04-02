import { useEffect, useState, useCallback, useRef } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { useSocket } from '../../context/SocketContext';
import { useUI } from '../../context/UIContext';
import { orderAPI } from '../../services/orderAPI';
import {
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineCheck,
    HiOutlineXCircle,
    HiOutlinePlay,
    HiOutlineRefresh,
} from 'react-icons/hi';

/* ── KDS Status Config for Kitchen Workflow ── */
const KDS_STATUS_CONFIG = {
    pending: {
        label: 'New Order',
        icon: HiOutlineClock,
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300',
        priority: 'high',
    },
    confirmed: {
        label: 'Confirmed',
        icon: HiOutlineCheckCircle,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300',
        priority: 'high',
    },
    shipped: {
        label: 'Preparing',
        icon: HiOutlinePlay,
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-800',
        borderColor: 'border-amber-300',
        priority: 'medium',
    },
    delivered: {
        label: 'Ready',
        icon: HiOutlineCheck,
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300',
        priority: 'low',
    },
    cancelled: {
        label: 'Cancelled',
        icon: HiOutlineXCircle,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-300',
        priority: 'none',
    },
};

/* ── KDS Status Transitions for Kitchen Workflow ── */
const KDS_STATUS_TRANSITIONS = {
    pending: ['confirmed'],
    confirmed: ['shipped'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
};

function KitchenDisplaySystem() {
    const socket = useSocket();
    const { addNotification } = useUI();

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState({});
    const socketListenersRef = useRef(null);

    // Fetch pending and confirmed orders on mount
    useEffect(() => {
        fetchKDSOrders();
    }, []);

    const fetchKDSOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch pending and confirmed orders (orders that need to be processed)
            const pendingRes = await orderAPI.getAllOrders(1, 100, { status: 'pending' });
            const confirmedRes = await orderAPI.getAllOrders(1, 100, { status: 'confirmed' });
            const shippedRes = await orderAPI.getAllOrders(1, 100, { status: 'shipped' });

            const allOrders = [
                ...(pendingRes.data || []),
                ...(confirmedRes.data || []),
                ...(shippedRes.data || []),
            ];

            // Sort by newest first
            allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setOrders(allOrders);
            console.log('✓ KDS: Orders fetched:', allOrders.length);
        } catch (err) {
            console.error('KDS: Failed to fetch orders:', err);
            if (err.response?.status !== 404) {
                addNotification({
                    type: 'error',
                    message: err.response?.data?.message || 'Failed to fetch KDS orders',
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    // Set up socket listeners for real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleNewOrder = (data) => {
            console.log('✓ KDS: New order received via socket:', data.orderId);

            // Add new order to the top of the list
            setOrders((prevOrders) => {
                const updatedOrders = [data, ...prevOrders];
                // Sort by newest first
                updatedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                return updatedOrders;
            });

            // Play notification sound if order is pending
            if (data.status === 'pending') {
                playNotificationSound();
            }

            addNotification({
                type: 'success',
                message: `📦 New Order: ${data.orderId} - ${data.quantity}x ${data.productName}`,
            });
        };

        const handleOrderStatusUpdate = (data) => {
            console.log('✓ KDS: Order status updated:', data.orderId, '->', data.status);

            setOrders((prevOrders) =>
                prevOrders
                    .map((order) => {
                        if (order.orderId === data.orderId || order._id === data._id) {
                            return { ...order, status: data.status, updatedAt: data.updatedAt };
                        }
                        return order;
                    })
                    .filter((order) => {
                        // Keep order if it's still in KDS workflow (pending, confirmed, shipped)
                        return ['pending', 'confirmed', 'shipped'].includes(order.status);
                    })
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            );

            addNotification({
                type: 'info',
                message: `✓ Order #${data.orderId} status: ${KDS_STATUS_CONFIG[data.status]?.label}`,
            });
        };

        const handleOrderCancelled = (data) => {
            console.log('✓ KDS: Order cancelled:', data.orderId);

            setOrders((prevOrders) =>
                prevOrders.filter((order) => order.orderId !== data.orderId && order._id !== data._id)
            );

            addNotification({
                type: 'warning',
                message: `❌ Order #${data.orderId} was cancelled`,
            });
        };

        // Listen to admin panel events (includes new orders from all users)
        socket.on('orderCreated', handleNewOrder);
        socket.on('orderStatusUpdated', handleOrderStatusUpdate);
        socket.on('orderCancelled', handleOrderCancelled);

        socketListenersRef.current = {
            handleNewOrder,
            handleOrderStatusUpdate,
            handleOrderCancelled,
        };

        console.log('✓ KDS: Socket listeners registered');

        return () => {
            socket.off('orderCreated', handleNewOrder);
            socket.off('orderStatusUpdated', handleOrderStatusUpdate);
            socket.off('orderCancelled', handleOrderCancelled);
            console.log('✓ KDS: Socket listeners removed');
        };
    }, [socket, addNotification]);

    const playNotificationSound = () => {
        // Using Web Audio API to create a simple beep
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (err) {
            console.log('Notification sound not available:', err.message);
        }
    };

    const handleStatusUpdate = useCallback(
        async (orderId, newStatus) => {
            setIsUpdating((prev) => ({ ...prev, [orderId]: true }));
            try {
                console.log(`KDS: Updating order ${orderId} status to ${newStatus}`);
                await orderAPI.updateOrderStatus(orderId, { status: newStatus });
                console.log(`✓ KDS: Order ${orderId} status updated to ${newStatus}`);
            } catch (err) {
                console.error('KDS: Failed to update order status:', err);
                addNotification({
                    type: 'error',
                    message: err.response?.data?.message || 'Failed to update order status',
                });
            } finally {
                setIsUpdating((prev) => ({ ...prev, [orderId]: false }));
            }
        },
        [addNotification]
    );

    const pendingOrders = orders.filter((o) => o.status === 'pending');
    const confirmedOrders = orders.filter((o) => o.status === 'confirmed');
    const shippingOrders = orders.filter((o) => o.status === 'shipped');

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
                                Kitchen Display System
                            </h1>
                            <p className="text-gray-400">
                                Real-time order management for kitchen operations
                            </p>
                        </div>
                        {/* <button
                            onClick={fetchKDSOrders}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                            disabled={isLoading}
                        >
                            <HiOutlineRefresh
                                className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
                            />
                            Refresh
                        </button> */}
                    </div>

                    {/* Order Counts */}
                    <div className="grid grid-cols-3 gap-4 md:gap-6">
                        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                            <div className="text-red-400 text-sm font-semibold mb-1">New Orders</div>
                            <div className="text-3xl font-bold text-red-400">{pendingOrders.length}</div>
                        </div>
                        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                            <div className="text-blue-400 text-sm font-semibold mb-1">Confirmed</div>
                            <div className="text-3xl font-bold text-blue-400">{confirmedOrders.length}</div>
                        </div>
                        <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4">
                            <div className="text-amber-400 text-sm font-semibold mb-1">Preparing</div>
                            <div className="text-3xl font-bold text-amber-400">{shippingOrders.length}</div>
                        </div>
                    </div>
                </div>

                {/* Orders Display - Kanban Board Style */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* New Orders Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-red-900/20 border-2 border-red-700 rounded-xl p-4">
                            <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
                                <HiOutlineClock className="w-6 h-6" />
                                New Orders ({pendingOrders.length})
                            </h2>
                            <div className="space-y-3 min-h-96">
                                {pendingOrders.length === 0 ? (
                                    <div className="text-gray-500 text-center py-8">No new orders</div>
                                ) : (
                                    pendingOrders.map((order) => (
                                        <OrderTicket
                                            key={order._id}
                                            order={order}
                                            onStatusUpdate={handleStatusUpdate}
                                            isUpdating={isUpdating[order._id]}
                                            possibleTransitions={KDS_STATUS_TRANSITIONS[order.status] || []}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Confirmed Orders Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-blue-900/20 border-2 border-blue-700 rounded-xl p-4">
                            <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                                <HiOutlineCheckCircle className="w-6 h-6" />
                                Confirmed ({confirmedOrders.length})
                            </h2>
                            <div className="space-y-3 min-h-96">
                                {confirmedOrders.length === 0 ? (
                                    <div className="text-gray-500 text-center py-8">No confirmed orders</div>
                                ) : (
                                    confirmedOrders.map((order) => (
                                        <OrderTicket
                                            key={order._id}
                                            order={order}
                                            onStatusUpdate={handleStatusUpdate}
                                            isUpdating={isUpdating[order._id]}
                                            possibleTransitions={KDS_STATUS_TRANSITIONS[order.status] || []}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Preparing Orders Column */}
                    <div className="lg:col-span-1">
                        <div className="bg-amber-900/20 border-2 border-amber-700 rounded-xl p-4">
                            <h2 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                                <HiOutlinePlay className="w-6 h-6" />
                                Preparing ({shippingOrders.length})
                            </h2>
                            <div className="space-y-3 min-h-96">
                                {shippingOrders.length === 0 ? (
                                    <div className="text-gray-500 text-center py-8">No orders being prepared</div>
                                ) : (
                                    shippingOrders.map((order) => (
                                        <OrderTicket
                                            key={order._id}
                                            order={order}
                                            onStatusUpdate={handleStatusUpdate}
                                            isUpdating={isUpdating[order._id]}
                                            possibleTransitions={KDS_STATUS_TRANSITIONS[order.status] || []}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* All Orders Empty State */}
                {orders.length === 0 && !isLoading && (
                    <div className="mt-12 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-gray-400 mb-2">No Active Orders</h2>
                        <p className="text-gray-500">
                            All orders have been completed or cancelled. Waiting for new orders...
                        </p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

/**
 * OrderTicket Component - Displays individual order as a card/ticket
 */
function OrderTicket({ order, onStatusUpdate, isUpdating, possibleTransitions }) {
    const statusConfig = KDS_STATUS_CONFIG[order.status] || KDS_STATUS_CONFIG.pending;
    const StatusIcon = statusConfig.icon;

    const formatTime = (date) => {
        const now = new Date();
        const orderTime = new Date(date);
        const diffMs = now - orderTime;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        return `${diffHours}h ago`;
    };

    return (
        <div
            className={`${statusConfig.bgColor} border-2 ${statusConfig.borderColor} rounded-lg p-4 transition-all hover:shadow-lg`}
        >
            {/* Order Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className={`text-xl font-bold ${statusConfig.textColor}`}>
                        {order.orderId}
                    </h3>
                    <p className="text-xs text-gray-600">
                        {formatTime(order.createdAt)}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <StatusIcon className={`w-5 h-5 ${statusConfig.textColor}`} />
                    <span className={`text-xs font-semibold px-2 py-1 bg-black/20 rounded ${statusConfig.textColor}`}>
                        {statusConfig.label}
                    </span>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-black/20 rounded-lg p-3 mb-3">
                <p className="text-sm font-semibold text-gray-200 mb-1">Items:</p>
                <p className={`text-lg font-bold ${statusConfig.textColor}`}>
                    {order.quantity}x {order.productName}
                </p>
                {order.productDescription && (
                    <p className="text-xs text-gray-600 mt-1">{order.productDescription}</p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
                {possibleTransitions.map((nextStatus) => {
                    const nextConfig = KDS_STATUS_CONFIG[nextStatus];
                    const buttonLabel =
                        nextStatus === 'confirmed'
                            ? '👍 Confirm'
                            : nextStatus === 'shipped'
                                ? '🍳 Preparing'
                                : nextStatus === 'delivered'
                                    ? '✅ Ready'
                                    : nextStatus;

                    return (
                        <button
                            key={nextStatus}
                            onClick={() => onStatusUpdate(order._id, nextStatus)}
                            disabled={isUpdating}
                            className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${isUpdating
                                ? 'opacity-50 cursor-not-allowed'
                                : `${nextConfig.bgColor} ${nextConfig.textColor} hover:shadow-md active:scale-95`
                                }`}
                        >
                            {isUpdating ? '⏳...' : buttonLabel}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default KitchenDisplaySystem;
