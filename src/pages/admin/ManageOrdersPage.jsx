import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import { orderAPI } from '../../services/orderAPI';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ResponsiveOrderTable from '../../components/ui/ResponsiveOrderTable';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import SearchInput from '../../components/ui/SearchInput';
import {
    HiOutlineClock, HiOutlineCheckCircle,
    HiOutlineCheck, HiOutlineXCircle,
    HiOutlineShoppingCart,
} from 'react-icons/hi';

/* ── Status config ── */
const STATUS_CONFIG = {
    pending: { label: 'Pending', icon: HiOutlineClock, bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
    confirmed: { label: 'Confirmed', icon: HiOutlineCheckCircle, bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
    delivered: { label: 'Delivered', icon: HiOutlineCheck, bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
    cancelled: { label: 'Cancelled', icon: HiOutlineXCircle, bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
};

const STATUS_TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
};

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
];

function ManageOrdersPage() {
    const navigate = useNavigate();
    const { addNotification } = useUI();
    const { user } = useAuth();
    const socket = useSocket();

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Deletion states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => { fetchOrders(); }, [statusFilter]);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
            const res = await orderAPI.getAllOrders(1, 100, filters);
            setOrders(res.data || []);
        } catch (err) {
            if (err.response?.status !== 404) {
                addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to fetch orders' });
            }
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter, addNotification]);

    /* SENIOR FIX: Separate socket listeners from data fetching to prevent infinite dependency loops */
    useEffect(() => {
        if (!socket) return;

        const handleOrderStatusUpdate = (data) => {
            console.log('✓ Admin: Real-time order status update:', data);

            setOrders((prevOrders) =>
                prevOrders.map((order) => {
                    if (order.orderId === data.orderId || order._id === data._id) {
                        const updatedOrder = { ...order, status: data.status, updatedAt: data.updatedAt };
                        console.log('✓ Admin: Order updated:', updatedOrder);
                        return updatedOrder;
                    }
                    return order;
                })
            );

            addNotification({
                type: 'info',
                message: `Order #${data.orderId} status updated to ${data.status}`,
            });
        };

        const handleOrderCancelled = (data) => {
            console.log('✓ Admin: Order cancellation update:', data);

            setOrders((prevOrders) =>
                prevOrders.map((order) => {
                    if (order.orderId === data.orderId || order._id === data._id) {
                        const updatedOrder = { ...order, status: 'cancelled', updatedAt: data.updatedAt };
                        console.log('✓ Admin: Order cancelled:', updatedOrder);
                        return updatedOrder;
                    }
                    return order;
                })
            );

            addNotification({
                type: 'warning',
                message: `Order #${data.orderId} has been cancelled`,
            });
        };

        /** SENIOR FIX: Real-time order deletion handler */
        const handleOrderDeleted = (data) => {
            console.log('✓ Admin: Real-time order deletion:', data);

            setOrders((prevOrders) =>
                prevOrders.filter((order) => order.orderId !== data.orderId && order._id !== data._id)
            );

            addNotification({
                type: 'warning',
                message: `Order #${data.orderId} has been deleted`,
            });
        };

        /** SENIOR FIX: Handle individual order updates for bulk operations instead of refetching entire list */
        const handleBulkOrderStatusUpdated = (data) => {
            console.log('✓ Admin: Bulk order status update received:', data);
            // Bulk updates are handled as individual orderStatusUpdated events from server
            // No need to refetch - socket listeners above handle each order update

            addNotification({
                type: 'info',
                message: `${data.updated} order(s) status updated to ${data.status}`,
            });
        };

        // Listen to admin panel events
        socket.on('orderStatusUpdated', handleOrderStatusUpdate);
        socket.on('orderStatusUpdate', handleOrderStatusUpdate);
        socket.on('orderCancelled', handleOrderCancelled);
        socket.on('orderDeleted', handleOrderDeleted);
        socket.on('bulkOrderStatusUpdated', handleBulkOrderStatusUpdated);

        return () => {
            socket.off('orderStatusUpdated', handleOrderStatusUpdate);
            socket.off('orderStatusUpdate', handleOrderStatusUpdate);
            socket.off('orderCancelled', handleOrderCancelled);
            socket.off('orderDeleted', handleOrderDeleted);
            socket.off('bulkOrderStatusUpdated', handleBulkOrderStatusUpdated);
        };
    }, [socket, addNotification]);

    const getStatusConfig = (s) => STATUS_CONFIG[s] || STATUS_CONFIG.pending;
    const getAvailableStatusTransitions = (s) => STATUS_TRANSITIONS[s] || [];

    const handleStatusChange = async (orderId, newStatus, currentStatus) => {
        const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';

        // Strict transition check only for non-admins (if they had access) 
        // or as a safety layer. For admins, we allow manual overrides.
        if (!isAdmin && !STATUS_TRANSITIONS[currentStatus]?.includes(newStatus)) {
            addNotification({ type: 'error', message: `Cannot change from ${currentStatus} to ${newStatus}` });
            return;
        }
        try {
            await orderAPI.updateOrderStatus(orderId, newStatus);
            // SENIOR FIX: Don't call fetchOrders() here - socket listener handles real-time update
            addNotification({ type: 'success', message: `Status updated to ${newStatus}` });
        } catch (err) {
            addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to update status' });
        }
    };

    const handleDeleteOrder = (orderId, orderNumber) => {
        setOrderToDelete({ id: orderId, number: orderNumber });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!orderToDelete) return;

        setIsDeleting(true);
        try {
            await orderAPI.deleteOrder(orderToDelete.id);
            addNotification({ type: 'success', message: `Order #${orderToDelete.number} deleted successfully` });
            setIsDeleteModalOpen(false);
            fetchOrders();
        } catch (err) {
            addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to delete order' });
        } finally {
            setIsDeleting(false);
            setOrderToDelete(null);
        }
    };

    const filteredOrders = orders.filter((o) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
            o.productName?.toLowerCase().includes(q) ||
            o.orderId?.toLowerCase().includes(q) ||
            `${o.userId?.firstName || ''} ${o.userId?.lastName || ''}`.toLowerCase().includes(q)
        );
    });

    return (
        <MainLayout>
            <div className="space-y-5">

                {/* ── Page header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-heading-2">Manage Orders</h1>
                        <p className="text-description mt-1">View, update and manage all customer orders</p>
                    </div>
                    {!isLoading && (
                        <span
                            className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-lg text-sm font-semibold"
                            style={{ backgroundColor: 'rgba(59,130,246,0.08)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.2)' }}
                        >
                            <HiOutlineShoppingCart className="w-4 h-4" />
                            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                        </span>
                    )}
                </div>

                {/* ── Search ── */}
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClear={() => setSearchTerm('')}
                    placeholder="Search by order ID, product or customer…"
                />

                {/* ── Filter tabs ── */}
                <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0 scrollbar-hide">
                    <div className="flex gap-1.5 min-w-max">
                        {FILTERS.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setStatusFilter(key)}
                                className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 min-h-[36px]"
                                style={statusFilter === key
                                    ? { backgroundColor: 'var(--primary)', color: '#fff' }
                                    : { backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                                }
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
                        <p className="text-sm text-gray-500">Loading orders…</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <ResponsiveOrderTable
                        orders={filteredOrders}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteOrder}
                        onViewDetails={(id) => navigate(`/user/order/${id}`)}
                        getStatusConfig={getStatusConfig}
                        getAvailableStatusTransitions={getAvailableStatusTransitions}
                        allStatuses={Object.keys(STATUS_CONFIG)}
                        userRole={user?.role}
                        showCustomer={true}
                        deletingOrderId={isDeleting ? orderToDelete?.id : null}
                    />
                ) : (
                    /* ── Empty state ── */
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--bg-surface-3)' }}>
                            <HiOutlineShoppingCart className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No orders found</h3>
                        <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>
                            {searchTerm
                                ? 'No orders match your search. Try different keywords or clear the filter.'
                                : 'No orders have been placed yet. They will appear here once customers start ordering.'}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 text-sm font-medium transition-colors"
                                style={{ color: 'var(--primary)' }}
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}

                {/* ── Deletion Confirmation Modal ── */}
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                    title="Confirm Permanent Deletion"
                >
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                            <HiOutlineXCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-red-900">This action cannot be undone</p>
                                <p className="text-xs text-red-700 mt-0.5">
                                    You are about to permanently delete order <span className="font-bold">#{orderToDelete?.number}</span>.
                                    All associated records will be removed from the system.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                className="flex-1"
                                onClick={confirmDelete}
                                loading={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </MainLayout>
    );
}

export default ManageOrdersPage;
