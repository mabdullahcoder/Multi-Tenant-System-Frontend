import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import { orderAPI } from '../../services/orderAPI';
import { useSocket } from '../../context/SocketContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { HiArrowLeft, HiRefresh } from 'react-icons/hi';

function OrderDetailsPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const socket = useSocket();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    // Real-time status updates while user is on this page
    useEffect(() => {
        if (!socket || !order) return;

        const handleStatusUpdate = (data) => {
            if (data.orderId !== order.orderId && data._id !== order._id) return;
            setOrder((prev) => prev ? { ...prev, status: data.status, updatedAt: data.updatedAt } : prev);
        };

        const handleItemsUpdated = (data) => {
            if (data.orderId !== order.orderId && data._id !== order._id) return;
            setOrder((prev) => prev ? { ...prev, items: data.items, totalAmount: data.totalAmount, updatedAt: data.updatedAt } : prev);
        };

        const handleCancelled = (data) => {
            if (data.orderId !== order.orderId && data._id !== order._id) return;
            setOrder((prev) => prev ? { ...prev, status: 'cancelled', updatedAt: data.updatedAt } : prev);
        };

        socket.on('orderStatusUpdate', handleStatusUpdate);
        socket.on('orderItemsUpdated', handleItemsUpdated);
        socket.on('orderItemsAppended', handleItemsUpdated);
        socket.on('orderCancelled', handleCancelled);

        return () => {
            socket.off('orderStatusUpdate', handleStatusUpdate);
            socket.off('orderItemsUpdated', handleItemsUpdated);
            socket.off('orderItemsAppended', handleItemsUpdated);
            socket.off('orderCancelled', handleCancelled);
        };
    }, [socket, order?.orderId, order?._id]);

    const fetchOrder = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await orderAPI.getOrderDetail(orderId);
            const orderData = response.data;
            if (!orderData) throw new Error('No order data received from server');
            setOrder(orderData);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to load order details');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="spinner" />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading order details…</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="max-w-2xl mx-auto text-center py-12">
                    <Card className="p-8">
                        <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--danger)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-heading-3 mb-2">Order Not Found</h2>
                        <p className="text-description mb-6">{error}</p>
                        <div className="flex gap-3 justify-center flex-wrap">
                            <button
                                onClick={() => navigate('/user/my-orders')}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px] active:scale-95"
                                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                            >
                                <HiArrowLeft className="w-5 h-5" />
                                Back to Orders
                            </button>
                            <button
                                onClick={fetchOrder}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px] active:scale-95"
                                style={{ backgroundColor: 'var(--bg-surface-3)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                            >
                                <HiRefresh className="w-5 h-5" />
                                Retry
                            </button>
                        </div>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    if (!order) {
        return (
            <MainLayout>
                <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Order not found</div>
            </MainLayout>
        );
    }

    const statusVariant =
        order.status === 'delivered' ? 'success' :
            order.status === 'cancelled' ? 'danger' :
                order.status === 'confirmed' ? 'info' : 'warning';

    const paymentVariant =
        order.paymentStatus === 'completed' ? 'success' :
            order.paymentStatus === 'failed' ? 'danger' :
                order.paymentStatus === 'refunded' ? 'info' : 'warning';

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-6">

                {/* ── Page Header ── */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/user/my-orders')}
                        className="p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                        style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        aria-label="Back to My Orders"
                        title="Back to My Orders"
                    >
                        <HiArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-heading-2 truncate">Order #{order.orderId}</h1>
                        <p className="text-description mt-0.5">
                            Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={fetchOrder}
                        className="p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        aria-label="Refresh order details"
                        title="Refresh"
                    >
                        <HiRefresh className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left column — 2/3 width */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Order Items Card */}
                        <Card>
                            <div className="flex items-start justify-between mb-4">
                                <h2 className="text-heading-4">
                                    {order.items?.length > 1 ? 'Order Items' : 'Product Details'}
                                </h2>
                                <Badge variant={statusVariant}>
                                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                </Badge>
                            </div>

                            {order.items && order.items.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                                        <div className="min-w-full px-4 sm:px-0">
                                            <table className="w-full text-sm">
                                                <thead style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <tr className="text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                                        <th className="pb-2 pr-4">Product</th>
                                                        <th className="pb-2 text-center px-2">Qty</th>
                                                        <th className="pb-2 text-right px-2">Price</th>
                                                        <th className="pb-2 text-right pl-2">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.items.map((item, idx) => (
                                                        <tr
                                                            key={idx}
                                                            className="transition-colors"
                                                            style={{ borderBottom: '1px solid var(--border-light)' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                                                        >
                                                            <td className="py-3 pr-4">
                                                                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.productName}</p>
                                                                {item.productDescription && (
                                                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.productDescription}</p>
                                                                )}
                                                            </td>
                                                            <td className="py-3 text-center px-2 font-semibold" style={{ color: 'var(--text-primary)' }}>{item.quantity}</td>
                                                            <td className="py-3 text-right px-2" style={{ color: 'var(--text-primary)' }}>₨{item.price?.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                                                            <td className="py-3 text-right pl-2 font-semibold" style={{ color: 'var(--text-primary)' }}>₨{item.subtotal?.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="pt-3 flex justify-end" style={{ borderTop: '1px solid var(--border)' }}>
                                        <div className="text-right">
                                            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Order Total</p>
                                            <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                                                ₨{order.totalAmount?.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Single-item order (backward compatibility) */
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Product Name</p>
                                        <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{order.productName}</p>
                                    </div>
                                    {order.productDescription && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Description</p>
                                            <p style={{ color: 'var(--text-secondary)' }}>{order.productDescription}</p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-3 gap-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Quantity</p>
                                            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{order.quantity}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Unit Price</p>
                                            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>₨{order.price?.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Total</p>
                                            <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>₨{order.totalAmount?.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Cancellation Info */}
                        {order.status === 'cancelled' && order.cancellationReason && (
                            <Card>
                                <h2 className="text-heading-4 mb-4" style={{ color: 'var(--danger)' }}>Cancellation Details</h2>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--danger)' }}>Reason</p>
                                        <p style={{ color: 'var(--text-primary)' }}>{order.cancellationReason}</p>
                                    </div>
                                    {order.cancelledBy && (
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--danger)' }}>Cancelled By</p>
                                            <p className="capitalize" style={{ color: 'var(--text-primary)' }}>{order.cancelledBy}</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Notes */}
                        {order.notes && (
                            <Card>
                                <h2 className="text-heading-4 mb-3">Notes</h2>
                                <p style={{ color: 'var(--text-secondary)' }}>{order.notes}</p>
                            </Card>
                        )}
                    </div>

                    {/* Right column — sidebar */}
                    <div className="space-y-6">

                        {/* Payment */}
                        <Card>
                            <h3 className="text-heading-5 mb-4">Payment</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>Status</p>
                                    <Badge variant={paymentVariant}>
                                        {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Method</p>
                                    <p className="font-medium capitalize text-sm" style={{ color: 'var(--text-primary)' }}>
                                        {order.paymentMethod?.replace(/_/g, ' ')}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Delivery Address */}
                        {order.deliveryAddress && (
                            <Card>
                                <h3 className="text-heading-5 mb-3">Delivery Address</h3>
                                <address className="not-italic rounded-lg p-3 space-y-0.5 text-sm" style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' }}>
                                    {order.deliveryAddress.street && (
                                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{order.deliveryAddress.street}</p>
                                    )}
                                    {(order.deliveryAddress.city || order.deliveryAddress.state) && (
                                        <p>{order.deliveryAddress.city}{order.deliveryAddress.city && order.deliveryAddress.state ? ', ' : ''}{order.deliveryAddress.state}</p>
                                    )}
                                    {(order.deliveryAddress.country || order.deliveryAddress.zipCode) && (
                                        <p>{order.deliveryAddress.country} {order.deliveryAddress.zipCode}</p>
                                    )}
                                </address>
                            </Card>
                        )}

                        {/* Timeline */}
                        <Card>
                            <h3 className="text-heading-5 mb-4">Order Timeline</h3>
                            <ol className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--primary)' }} />
                                        {(order.estimatedDeliveryDate || order.actualDeliveryDate) && (
                                            <div className="w-px flex-1 mt-1 min-h-[16px]" style={{ backgroundColor: 'var(--border)' }} />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-1">
                                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Order Placed</p>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleString()}</p>
                                    </div>
                                </li>

                                {order.estimatedDeliveryDate && (
                                    <li className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--warning)' }} />
                                            {order.actualDeliveryDate && (
                                                <div className="w-px flex-1 mt-1 min-h-[16px]" style={{ backgroundColor: 'var(--border)' }} />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-1">
                                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Estimated Delivery</p>
                                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
                                        </div>
                                    </li>
                                )}

                                {order.actualDeliveryDate && (
                                    <li className="flex gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--success)' }} />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Delivered</p>
                                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{new Date(order.actualDeliveryDate).toLocaleString()}</p>
                                        </div>
                                    </li>
                                )}
                            </ol>
                        </Card>

                        {/* Tracking Number */}
                        {order.trackingNumber && (
                            <Card>
                                <h3 className="text-heading-5 mb-3">Tracking</h3>
                                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Tracking Number</p>
                                <p className="font-mono text-sm font-medium px-3 py-2 rounded-lg select-all" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
                                    {order.trackingNumber}
                                </p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default OrderDetailsPage;
