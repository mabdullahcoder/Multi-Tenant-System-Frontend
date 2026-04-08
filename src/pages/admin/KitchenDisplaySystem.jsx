import { useEffect, useState, useCallback, useRef } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { useSocket } from '../../context/SocketContext';
import { useUI } from '../../context/UIContext';
import { orderAPI } from '../../services/orderAPI';
import { typography } from '../../config/theme';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import {
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineCheck,
    HiOutlineXCircle,
} from 'react-icons/hi';

/* ── KDS Status Config for Kitchen Workflow ── */
const KDS_STATUS_CONFIG = {
    pending: {
        label: 'New Order',
        icon: HiOutlineClock,
        bgColor: 'bg-red-50',
        cardBg: 'bg-white',
        textColor: 'text-red-700',
        accentColor: 'text-red-600',
        borderColor: 'border-red-200',
        buttonColor: 'bg-red-600 hover:bg-red-700',
        priority: 'high',
        statIcon: HiOutlineClock,
        statBgColor: 'bg-red-500/10',
        statIconColor: 'text-red-500',
        timeDisplay: 'countdown', // Show countdown timer
    },
    confirmed: {
        label: 'Confirmed',
        icon: HiOutlineCheckCircle,
        bgColor: 'bg-blue-50',
        cardBg: 'bg-white',
        textColor: 'text-blue-700',
        accentColor: 'text-blue-600',
        borderColor: 'border-blue-200',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        priority: 'high',
        statIcon: HiOutlineCheckCircle,
        statBgColor: 'bg-blue-500/10',
        statIconColor: 'text-blue-500',
        timeDisplay: 'countdown', // Show countdown timer
    },
    delivered: {
        label: 'Ready',
        icon: HiOutlineCheck,
        bgColor: 'bg-emerald-50',
        cardBg: 'bg-white',
        textColor: 'text-emerald-700',
        accentColor: 'text-emerald-600',
        borderColor: 'border-emerald-200',
        buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
        priority: 'low',
        statIcon: HiOutlineCheck,
        statBgColor: 'bg-emerald-500/10',
        statIconColor: 'text-emerald-500',
        timeDisplay: 'completed', // Show completion time
    },
    cancelled: {
        label: 'Cancelled',
        icon: HiOutlineXCircle,
        bgColor: 'bg-gray-50',
        cardBg: 'bg-white',
        textColor: 'text-gray-700',
        accentColor: 'text-gray-600',
        borderColor: 'border-gray-200',
        buttonColor: 'bg-gray-600 hover:bg-gray-700',
        priority: 'none',
        statIcon: HiOutlineXCircle,
        statBgColor: 'bg-gray-500/10',
        statIconColor: 'text-gray-500',
        timeDisplay: 'none',
    },
};

const getOrderKey = (order) => `${order.orderId}-${order.userId?._id || order.userId || 'unknown'}`;

const normalizeOrderToGrouped = (order) => {
    const normalizedItems = Array.isArray(order.items)
        ? order.items
        : [{
            _id: order._id,
            productName: order.productName,
            productDescription: order.productDescription,
            quantity: order.quantity,
            price: order.price,
            totalAmount: order.totalAmount || 0,
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        }];

    return {
        _id: order._id,
        orderId: order.orderId,
        userId: order.userId,
        status: order.status || 'pending',
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: normalizedItems,
        totalAmount: normalizedItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
    };
};

function KitchenDisplaySystem() {
    const socket = useSocket();
    const { addNotification } = useUI();

    const [orders, setOrders] = useState([]);
    const [isUpdating, setIsUpdating] = useState({});
    const socketListenersRef = useRef(null);
    // Persist the exact moment staff clicked "Start" for each order, survives re-renders/remounts
    const cookingStartTimes = useRef({});

    // Fetch pending and confirmed orders on mount
    useEffect(() => {
        fetchKDSOrders();
    }, []);

    const fetchKDSOrders = useCallback(async () => {
        try {
            // Fetch all KDS workflow orders (pending → confirmed → delivered)
            const pendingRes = await orderAPI.getAllOrders(1, 100, { status: 'pending' });
            const confirmedRes = await orderAPI.getAllOrders(1, 100, { status: 'confirmed' });
            const deliveredRes = await orderAPI.getAllOrders(1, 100, { status: 'delivered' });

            const allOrders = [
                ...(pendingRes.data || []),
                ...(confirmedRes.data || []),
                ...(deliveredRes.data || []),
            ];

            // Group orders by orderId and userId to create complete order tickets
            const groupedOrders = allOrders.reduce((acc, order) => {
                const key = getOrderKey(order);
                if (!acc[key]) {
                    acc[key] = normalizeOrderToGrouped(order);
                } else {
                    acc[key] = {
                        ...acc[key],
                        items: [
                            ...acc[key].items,
                            {
                                _id: order._id,
                                productName: order.productName,
                                productDescription: order.productDescription,
                                quantity: order.quantity,
                                price: order.price,
                                totalAmount: order.totalAmount || 0,
                                status: order.status,
                                createdAt: order.createdAt,
                                updatedAt: order.updatedAt,
                            },
                        ],
                        totalAmount: acc[key].totalAmount + (order.totalAmount || 0),
                        updatedAt: order.updatedAt || acc[key].updatedAt,
                    };

                    if (new Date(order.createdAt) < new Date(acc[key].createdAt)) {
                        acc[key].createdAt = order.createdAt;
                    }
                }

                return acc;
            }, {});

            // Convert grouped orders to array and sort by newest first
            const groupedOrdersArray = Object.values(groupedOrders).sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            setOrders(groupedOrdersArray);
            console.log('✓ KDS: Grouped orders fetched:', groupedOrdersArray.length);
        } catch (err) {
            console.error('KDS: Failed to fetch orders:', err);
            if (err.response?.status !== 404) {
                addNotification({
                    type: 'error',
                    message: err.response?.data?.message || 'Failed to fetch KDS orders',
                });
            }
        }
    }, [addNotification]);

    // Set up socket listeners for real-time updates
    useEffect(() => {
        if (!socket) return;

        const handleNewOrder = (data) => {
            console.log('KDS: New order received via socket:', data.orderId);

            setOrders((prevOrders) => {
                const key = getOrderKey(data);
                const existingIndex = prevOrders.findIndex((order) => getOrderKey(order) === key);
                const groupedOrder = normalizeOrderToGrouped(data);

                if (existingIndex >= 0) {
                    const existing = prevOrders[existingIndex];
                    const merged = {
                        ...existing,
                        status: groupedOrder.status,
                        updatedAt: groupedOrder.updatedAt,
                        items: [...existing.items, ...groupedOrder.items],
                        totalAmount: existing.totalAmount + groupedOrder.totalAmount,
                    };
                    const next = [...prevOrders];
                    next[existingIndex] = merged;
                    return next.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                }

                const updatedOrders = [groupedOrder, ...prevOrders];
                updatedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                return updatedOrders;
            });

            // Play notification sound if order is pending
            if (data.status === 'pending') {
                playNotificationSound();
            }

            addNotification({
                type: 'success',
                message: `New Order: ${data.orderId} - ${data.quantity}x ${data.productName}`,
            });
        };

        const handleOrderStatusUpdate = (data) => {
            console.log('\nKDS: SOCKET EVENT - Order status updated');
            console.log(`Order ID: ${data.orderId}`);
            console.log(`New Status: ${data.status}`);
            console.log(`Updated At: ${data.updatedAt}`);

            setOrders((prevOrders) => {
                const updated = prevOrders
                    .map((groupedOrder) => {
                        const items = Array.isArray(groupedOrder.items) ? groupedOrder.items : [];
                        const itemIndex = items.findIndex(item => item._id === data._id);
                        if (itemIndex !== -1) {
                            console.log(`Found order in grouped order: ${groupedOrder.orderId}`);
                            console.log(`Old Status: ${groupedOrder.status} → New Status: ${data.status}`);

                            const updatedOrder = {
                                ...groupedOrder,
                                status: data.status,
                                updatedAt: data.updatedAt,
                                items: items.map(item =>
                                    item._id === data._id
                                        ? { ...item, status: data.status, updatedAt: data.updatedAt }
                                        : item
                                ),
                            };

                            return updatedOrder;
                        }
                        return groupedOrder;
                    })
                    .filter((groupedOrder) => {
                        const items = Array.isArray(groupedOrder.items) ? groupedOrder.items : [];
                        const hasValidItems = items.some(item =>
                            ['pending', 'confirmed', 'delivered'].includes(item.status || groupedOrder.status)
                        );
                        if (!hasValidItems) {
                            console.log(`Filtered out grouped order ${groupedOrder.orderId} - no valid items`);
                        }
                        return hasValidItems;
                    })
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                console.log(`Total grouped orders after update: ${updated.length}`);
                return updated;
            });

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
                message: `Order #${data.orderId} was cancelled`,
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
            console.log('KDS: Socket listeners removed');
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

            // Record the exact click time when kitchen starts cooking
            if (newStatus === 'confirmed') {
                cookingStartTimes.current[orderId] = Date.now();
            }

            try {
                console.log(`\nKDS: ORDER STATUS UPDATE REQUEST`);
                console.log(`Order _id: ${orderId}, New Status: ${newStatus}`);

                const groupedOrder = orders.find(order => order._id === orderId);
                if (!groupedOrder) {
                    throw new Error('Order not found in local state');
                }

                // Optimistic UI update
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order._id === orderId
                            ? {
                                ...order,
                                status: newStatus,
                                items: (order.items || []).map((item) => ({ ...item, status: newStatus })),
                            }
                            : order
                    )
                );

                // The grouped order's _id IS the parent Order document's MongoDB _id.
                // Always update the parent document once — never iterate over embedded item _ids,
                // those are subdocument ids and don't exist as top-level Order documents.
                await orderAPI.updateOrderStatus(groupedOrder._id, newStatus);

                console.log(`✓ KDS: Order ${groupedOrder.orderId} → ${newStatus}`);

            } catch (err) {
                console.error('KDS: Failed to update order status:', err);
                // Roll back optimistic update
                fetchKDSOrders();
                addNotification({
                    type: 'error',
                    message: err.response?.data?.message || err.message || 'Failed to update order status',
                });
            } finally {
                setIsUpdating((prev) => ({ ...prev, [orderId]: false }));
            }
        },
        [addNotification, orders, fetchKDSOrders]
    );

    const pendingOrders = orders.filter((order) => order.status === 'pending');
    const confirmedOrders = orders.filter((order) => order.status === 'confirmed');
    const readyOrders = orders.filter((order) => order.status === 'delivered');

    return (
        <MainLayout>
            <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)', fontSize: typography.fontSize['4xl'] }}>
                                Kitchen Display System
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm sm:text-base" style={{ color: 'var(--text-muted)', fontSize: typography.fontSize.base }}>
                                Real-time order management for kitchen operations using your admin layout and color scheme.
                            </p>
                        </div>
                    </div>

                    {/* Order Counts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        <StatCard
                            title="New Orders"
                            value={pendingOrders.length}
                            icon={KDS_STATUS_CONFIG.pending.statIcon}
                            iconBgColor={KDS_STATUS_CONFIG.pending.statBgColor}
                            iconColor={KDS_STATUS_CONFIG.pending.statIconColor}
                            className="border-red-200"
                        />
                        <StatCard
                            title="Confirmed"
                            value={confirmedOrders.length}
                            icon={KDS_STATUS_CONFIG.confirmed.statIcon}
                            iconBgColor={KDS_STATUS_CONFIG.confirmed.statBgColor}
                            iconColor={KDS_STATUS_CONFIG.confirmed.statIconColor}
                            className="border-blue-200"
                        />
                        <StatCard
                            title="Ready"
                            value={readyOrders.length}
                            icon={KDS_STATUS_CONFIG.delivered.statIcon}
                            iconBgColor={KDS_STATUS_CONFIG.delivered.statBgColor}
                            iconColor={KDS_STATUS_CONFIG.delivered.statIconColor}
                            className="border-emerald-200"
                        />
                    </div>
                </div>

                {/* Orders Display - Kanban Board Style */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* New Orders Column */}
                    <div className="lg:col-span-1">
                        <Card className={`${KDS_STATUS_CONFIG.pending.borderColor} ${KDS_STATUS_CONFIG.pending.bgColor}`} padding="lg">
                            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${KDS_STATUS_CONFIG.pending.textColor}`} style={{ fontSize: typography.fontSize.xl }}>
                                <KDS_STATUS_CONFIG.pending.icon className="w-5 h-5" />
                                New Orders ({pendingOrders.length})
                            </h2>
                            <div className="space-y-4 min-h-96">
                                {pendingOrders.length === 0 ? (
                                    <div className="text-center py-8" style={{ color: 'var(--text-muted)', fontSize: typography.fontSize.base }}>No new orders</div>
                                ) : (
                                    pendingOrders.map((order) => (
                                        <OrderTicket
                                            key={order._id}
                                            order={order}
                                            onStatusUpdate={handleStatusUpdate}
                                            isUpdating={isUpdating[order._id]}
                                            cookingStartTimes={cookingStartTimes}
                                        />
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Confirmed Orders Column */}
                    <div className="lg:col-span-1">
                        <Card className={`${KDS_STATUS_CONFIG.confirmed.borderColor} ${KDS_STATUS_CONFIG.confirmed.bgColor}`} padding="lg">
                            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${KDS_STATUS_CONFIG.confirmed.textColor}`} style={{ fontSize: typography.fontSize.xl }}>
                                <KDS_STATUS_CONFIG.confirmed.icon className="w-5 h-5" />
                                Confirmed ({confirmedOrders.length})
                            </h2>
                            <div className="space-y-4 min-h-96">
                                {confirmedOrders.length === 0 ? (
                                    <div className="text-center py-8" style={{ color: 'var(--text-muted)', fontSize: typography.fontSize.base }}>No confirmed orders</div>
                                ) : (
                                    confirmedOrders.map((order) => (
                                        <OrderTicket
                                            key={order._id}
                                            order={order}
                                            onStatusUpdate={handleStatusUpdate}
                                            isUpdating={isUpdating[order._id]}
                                            cookingStartTimes={cookingStartTimes}
                                        />
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Ready for Pickup Column */}
                    <div className="lg:col-span-1">
                        <Card className={`${KDS_STATUS_CONFIG.delivered.borderColor} ${KDS_STATUS_CONFIG.delivered.bgColor}`} padding="lg">
                            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${KDS_STATUS_CONFIG.delivered.textColor}`} style={{ fontSize: typography.fontSize.xl }}>
                                <KDS_STATUS_CONFIG.delivered.icon className="w-5 h-5" />
                                Ready for Pickup ({readyOrders.length})
                            </h2>
                            <div className="space-y-4 min-h-96">
                                {readyOrders.length === 0 ? (
                                    <div className="text-center py-8" style={{ color: 'var(--text-muted)', fontSize: typography.fontSize.base }}>No orders ready yet</div>
                                ) : (
                                    readyOrders.map((order) => (
                                        <OrderTicket
                                            key={order._id}
                                            order={order}
                                            onStatusUpdate={handleStatusUpdate}
                                            isUpdating={isUpdating[order._id]}
                                            cookingStartTimes={cookingStartTimes}
                                        />
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* All Orders Empty State */}
                {/* {orders.length === 0 && !isLoading && (
                    <div className="mt-12 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">No Active Orders</h2>
                        <p className="text-gray-500">
                            All orders have been completed or cancelled. Waiting for new orders...
                        </p>
                    </div>
                )} */}
            </div>
        </MainLayout>
    );
}

/**
 * OrderTicket Component - Displays grouped order as a single ticket
 * Shows all items from one customer's order in one cohesive ticket
 */
function OrderTicket({ order, onStatusUpdate, isUpdating, cookingStartTimes }) {
    const statusConfig = KDS_STATUS_CONFIG[order.status] || KDS_STATUS_CONFIG.pending;
    const StatusIcon = statusConfig.icon;
    const [remainingSeconds, setRemainingSeconds] = useState(600);

    // Countdown timer — only runs for confirmed orders
    // Uses the exact click timestamp recorded in the parent ref, not the DB updatedAt
    useEffect(() => {
        if (order.status !== 'confirmed') return;

        const startTime = cookingStartTimes.current[order._id] ?? Date.now();

        const updateTimer = () => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(0, 600 - elapsed);
            setRemainingSeconds(remaining);

            if (remaining === 0) {
                onStatusUpdate(order._id, 'delivered');
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [order._id, order.status, onStatusUpdate, cookingStartTimes]);

    const formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const items = Array.isArray(order.items) ? order.items : [];

    const getTimerColor = () => {
        if (remainingSeconds <= 60) return 'text-red-600 font-bold animate-pulse';
        if (remainingSeconds <= 180) return 'text-amber-600 font-semibold';
        return 'text-slate-700';
    };

    const formatOrderTime = (timestamp) => {
        if (!timestamp) return '--';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Card
            className="bg-white border border-slate-200 shadow-lg rounded-3xl overflow-hidden transition-all duration-200 mb-4"
            padding="none"
        >
            <div className={`px-4 py-4 ${statusConfig.bgColor} ${statusConfig.borderColor} border-b`}>
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[0.70rem] font-semibold tracking-[0.25em] uppercase text-slate-500">
                            Order
                        </p>
                        <h3 className={`text-xl font-bold tracking-tight break-words ${statusConfig.textColor}`} style={{ fontSize: typography.fontSize['2xl'] }}>
                            #{order.orderId}
                        </h3>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${statusConfig.textColor} ${statusConfig.cardBg} border border-current`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusConfig.label}
                    </span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm" style={{ color: 'var(--text-muted)', fontSize: typography.fontSize.sm }}>
                    <span>{formatOrderTime(order.createdAt)}</span>
                    {order.status === 'confirmed' ? (
                        <span className={`font-semibold ${getTimerColor()}`}>{formatCountdown(remainingSeconds)}</span>
                    ) : (
                        <span>{order.status === 'pending' ? 'Pending' : 'Ready'}</span>
                    )}
                </div>
            </div>

            <div className="p-4 bg-white">
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div
                            key={item._id || index}
                            className="pb-3"
                            style={{ borderBottom: index < items.length - 1 ? '1px solid #e2e8f0' : 'none' }}
                        >
                            <p className="text-sm font-semibold text-slate-900" style={{ fontSize: typography.fontSize.sm }}>
                                {item.quantity}x {item.productName}
                            </p>
                            {item.productDescription && (
                                <p className="mt-1 text-xs text-slate-500" style={{ fontSize: typography.fontSize.xs }}>
                                    {item.productDescription}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200">
                {order.status === 'pending' && (
                    <Button
                        onClick={() => onStatusUpdate(order._id, 'confirmed')}
                        disabled={isUpdating}
                        variant="primary"
                        size="lg"
                        className="w-full bg-slate-900 text-white hover:bg-slate-800 py-3"
                        loading={isUpdating}
                        style={{ fontSize: typography.fontSize.base, fontWeight: 600 }}
                    >
                        {isUpdating ? 'Starting...' : 'Start'}
                    </Button>
                )}

                {order.status === 'confirmed' && (
                    <div className="space-y-3">
                        <Button
                            onClick={() => onStatusUpdate(order._id, 'delivered')}
                            disabled={isUpdating}
                            variant="success"
                            size="lg"
                            className="w-full bg-slate-900 text-white hover:bg-slate-800 py-3"
                            loading={isUpdating}
                            style={{ fontSize: typography.fontSize.base, fontWeight: 600 }}
                        >
                            {isUpdating ? 'Finishing...' : 'Ready'}
                        </Button>
                        <p className="text-center text-xs text-slate-500" style={{ fontSize: typography.fontSize.xs }}>
                            Tap when the order is ready for pickup
                        </p>
                    </div>
                )}

                {order.status === 'delivered' && (
                    <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                        <p className="text-sm font-semibold text-emerald-700" style={{ fontSize: typography.fontSize.sm }}>
                            Ready for pickup
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}


export default KitchenDisplaySystem;
