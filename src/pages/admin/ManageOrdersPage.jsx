import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import { orderAPI } from '../../services/orderAPI';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import ResponsiveOrderTable from '../../components/ui/ResponsiveOrderTable';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import {
    HiOutlineSearch, HiOutlineX,
    HiOutlineClock, HiOutlineCheckCircle,
    HiOutlineTruck, HiOutlineCheck, HiOutlineXCircle,
    HiOutlineShoppingCart,
} from 'react-icons/hi';

/* ── Status config ── */
const STATUS_CONFIG = {
    pending: { label: 'Pending', icon: HiOutlineClock, bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
    confirmed: { label: 'Confirmed', icon: HiOutlineCheckCircle, bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
    shipped: { label: 'Shipped', icon: HiOutlineTruck, bgColor: 'bg-violet-50', textColor: 'text-violet-700', borderColor: 'border-violet-200' },
    delivered: { label: 'Delivered', icon: HiOutlineCheck, bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
    cancelled: { label: 'Cancelled', icon: HiOutlineXCircle, bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
};

const STATUS_TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
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

function ManageOrdersPage() {
    const navigate = useNavigate();
    const { addNotification } = useUI();
    const { user } = useAuth();

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Deletion states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => { fetchOrders(); }, [statusFilter]);

    const fetchOrders = async () => {
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
    };

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
            addNotification({ type: 'success', message: `Status updated to ${newStatus}` });
            fetchOrders();
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
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                            Manage Orders
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            View, update and manage all customer orders
                        </p>
                    </div>
                    {/* order count chip */}
                    {!isLoading && (
                        <span className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold">
                            <HiOutlineShoppingCart className="w-4 h-4" />
                            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                        </span>
                    )}
                </div>

                {/* ── Search ── */}
                <div className="relative">
                    <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by order ID, product or customer…"
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
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <HiOutlineShoppingCart className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">No orders found</h3>
                        <p className="text-sm text-gray-500 max-w-xs">
                            {searchTerm
                                ? 'No orders match your search. Try different keywords or clear the filter.'
                                : 'No orders have been placed yet. They will appear here once customers start ordering.'}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
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
