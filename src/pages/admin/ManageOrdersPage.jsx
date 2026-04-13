import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import { orderAPI } from '../../services/orderAPI';
import { menuAPI } from '../../services/menuAPI';
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
    HiOutlineShoppingCart, HiOutlineTruck,
    HiOutlinePlus, HiOutlineMinusSm, HiOutlineSearch,
    HiOutlineTrash,
} from 'react-icons/hi';

/* ── Status config ── */
const STATUS_CONFIG = {
    pending: { label: 'Pending', icon: HiOutlineClock, bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
    confirmed: { label: 'Confirmed', icon: HiOutlineCheckCircle, bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
    shipped: { label: 'Shipped', icon: HiOutlineTruck, bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
    delivered: { label: 'Delivered', icon: HiOutlineCheck, bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
    cancelled: { label: 'Cancelled', icon: HiOutlineXCircle, bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
};

// Mirrors backend OrderService validTransitions exactly
const STATUS_TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'delivered', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
};

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
];

/* ── Add Item Modal ── */
function AddItemModal({ isOpen, onClose, order, onSuccess }) {
    const { addNotification } = useUI();
    const [menuItems, setMenuItems] = useState([]);
    const [isLoadingMenu, setIsLoadingMenu] = useState(false);
    const [menuSearch, setMenuSearch] = useState('');
    const [cart, setCart] = useState([]); // [{ item, quantity }]
    const [isSaving, setIsSaving] = useState(false);

    // Fetch menu items when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setCart([]);
        setMenuSearch('');
        setIsLoadingMenu(true);
        menuAPI.getItems({ isActive: true, limit: 200 })
            .then((res) => setMenuItems(res.data || res.items || []))
            .catch(() => addNotification({ type: 'error', message: 'Failed to load menu items' }))
            .finally(() => setIsLoadingMenu(false));
    }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    const filteredMenu = menuItems.filter((m) =>
        m.name.toLowerCase().includes(menuSearch.toLowerCase())
    );

    const cartQty = (itemId) => cart.find((c) => c.item._id === itemId)?.quantity ?? 0;

    const adjustCart = (item, delta) => {
        setCart((prev) => {
            const existing = prev.find((c) => c.item._id === item._id);
            if (!existing) {
                if (delta <= 0) return prev;
                return [...prev, { item, quantity: delta }];
            }
            const next = existing.quantity + delta;
            if (next <= 0) return prev.filter((c) => c.item._id !== item._id);
            return prev.map((c) => c.item._id === item._id ? { ...c, quantity: next } : c);
        });
    };

    const removeFromCart = (itemId) =>
        setCart((prev) => prev.filter((c) => c.item._id !== itemId));

    const cartTotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

    const handleSave = async () => {
        if (cart.length === 0) return;
        setIsSaving(true);
        try {
            // Build the full updated items list: existing + new
            const existingItems = (order.items || []).map((i) => ({
                productId: i.productId,
                productName: i.productName,
                productDescription: i.productDescription || '',
                quantity: i.quantity,
                price: i.price,
                subtotal: i.subtotal,
            }));
            const newItems = cart.map((c) => ({
                productId: c.item._id,
                productName: c.item.name,
                productDescription: c.item.description || '',
                quantity: c.quantity,
                price: c.item.price,
                subtotal: c.item.price * c.quantity,
            }));
            await orderAPI.appendItems(order._id, [...existingItems, ...newItems]);
            addNotification({ type: 'success', message: `${cart.length} item(s) added to order #${order.orderId}` });
            onSuccess?.();
            onClose();
        } catch (err) {
            addNotification({ type: 'error', message: err.response?.data?.message || 'Failed to add items' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={() => !isSaving && onClose()} title={`Add Items — Order #${order?.orderId}`}>
            <div className="space-y-4">
                {/* Search menu */}
                <div className="relative">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search menu items…"
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
                        style={{
                            backgroundColor: 'var(--bg-surface-2)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)',
                        }}
                    />
                </div>

                {/* Menu item list */}
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                    {isLoadingMenu ? (
                        <div className="flex justify-center py-8"><div className="spinner" /></div>
                    ) : filteredMenu.length === 0 ? (
                        <p className="text-center text-sm py-6" style={{ color: 'var(--text-muted)' }}>No items found</p>
                    ) : filteredMenu.map((item) => {
                        const qty = cartQty(item._id);
                        return (
                            <div
                                key={item._id}
                                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg"
                                style={{ backgroundColor: qty > 0 ? 'rgba(59,130,246,0.06)' : 'var(--bg-surface-2)', border: `1px solid ${qty > 0 ? 'rgba(59,130,246,0.2)' : 'var(--border)'}` }}
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>₨{item.price?.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {qty > 0 ? (
                                        <>
                                            <button
                                                onClick={() => adjustCart(item, -1)}
                                                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                                                style={{ backgroundColor: 'var(--bg-surface-3)', color: 'var(--text-primary)' }}
                                            >
                                                <HiOutlineMinusSm className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="w-5 text-center text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{qty}</span>
                                            <button
                                                onClick={() => adjustCart(item, 1)}
                                                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                                                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                                            >
                                                <HiOutlinePlus className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => adjustCart(item, 1)}
                                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                            style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: 'var(--primary)' }}
                                        >
                                            <HiOutlinePlus className="w-3.5 h-3.5" />
                                            Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Cart summary */}
                {cart.length > 0 && (
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                        <div className="px-3 py-2" style={{ backgroundColor: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border)' }}>
                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                Selected ({cart.length} item{cart.length !== 1 ? 's' : ''})
                            </p>
                        </div>
                        <div className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                            {cart.map(({ item, quantity }) => (
                                <div key={item._id} className="flex items-center justify-between gap-2 px-3 py-2">
                                    <p className="text-sm truncate flex-1" style={{ color: 'var(--text-primary)' }}>
                                        {item.name} <span style={{ color: 'var(--text-muted)' }}>×{quantity}</span>
                                    </p>
                                    <p className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--text-primary)' }}>
                                        ₨{(item.price * quantity).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                                    </p>
                                    <button onClick={() => removeFromCart(item._id)} className="flex-shrink-0 p-1 rounded transition-colors" style={{ color: 'var(--danger)' }}>
                                        <HiOutlineTrash className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between px-3 py-2.5" style={{ backgroundColor: 'var(--bg-surface-2)', borderTop: '1px solid var(--border)' }}>
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Items subtotal</p>
                            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                                ₨{cartTotal.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                    <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        className="flex-1"
                        onClick={handleSave}
                        disabled={cart.length === 0}
                        loading={isSaving}
                    >
                        {isSaving ? 'Adding…' : `Add ${cart.length > 0 ? cart.length : ''} Item${cart.length !== 1 ? 's' : ''}`}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

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

    // Add item states
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [orderToAddItem, setOrderToAddItem] = useState(null);

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

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    /* SENIOR FIX: Separate socket listeners from data fetching to prevent infinite dependency loops */
    useEffect(() => {
        if (!socket) return;

        const handleOrderStatusUpdate = (data) => {
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
                message: `Order #${data.orderId} status updated to ${data.status}`,
            });
        };

        const handleOrderCancelled = (data) => {
            setOrders((prevOrders) =>
                prevOrders.map((order) => {
                    if (order.orderId === data.orderId || order._id === data._id) {
                        return { ...order, status: 'cancelled', updatedAt: data.updatedAt };
                    }
                    return order;
                })
            );

            addNotification({
                type: 'warning',
                message: `Order #${data.orderId} has been cancelled`,
            });
        };

        const handleOrderDeleted = (data) => {
            setOrders((prevOrders) =>
                prevOrders.filter((order) => order.orderId !== data.orderId && order._id !== data._id)
            );

            addNotification({
                type: 'warning',
                message: `Order #${data.orderId} has been deleted`,
            });
        };

        const handleBulkOrderStatusUpdated = (data) => {
            // Bulk updates are handled as individual orderStatusUpdated events from server
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

    const handleAddItem = (order) => {
        setOrderToAddItem(order);
        setIsAddItemModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!orderToDelete) return;

        setIsDeleting(true);
        try {
            await orderAPI.deleteOrder(orderToDelete.id);
            // Socket 'orderDeleted' event removes the order from state in real-time;
            // no need to refetch the entire list here.
            addNotification({ type: 'success', message: `Order #${orderToDelete.number} deleted successfully` });
            setIsDeleteModalOpen(false);
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
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading orders…</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <ResponsiveOrderTable
                        orders={filteredOrders}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteOrder}
                        onAddItem={handleAddItem}
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
                        <div
                            className="p-4 rounded-xl flex items-start gap-3"
                            style={{ backgroundColor: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' }}
                        >
                            <HiOutlineXCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--danger)' }} />
                            <div>
                                <p className="text-sm font-bold" style={{ color: 'var(--danger)' }}>This action cannot be undone</p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                    You are about to permanently delete order <span className="font-bold" style={{ color: 'var(--text-primary)' }}>#{orderToDelete?.number}</span>.
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
                {/* ── Add Item Modal ── */}
                <AddItemModal
                    isOpen={isAddItemModalOpen}
                    onClose={() => setIsAddItemModalOpen(false)}
                    order={orderToAddItem}
                    onSuccess={fetchOrders}
                />
            </div>
        </MainLayout>
    );
}

export default ManageOrdersPage;
