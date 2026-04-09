import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import { orderAPI } from '../../services/orderAPI';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { HiArrowLeft, HiRefresh } from 'react-icons/hi';

function OrderDetailsPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('Fetching order with ID:', orderId);
            const response = await orderAPI.getOrderDetail(orderId);
            console.log('Order API response:', response);

            // orderAPI.getOrderDetail returns { success, message, data }
            const orderData = response.data;
            console.log('Extracted order data:', orderData);

            if (!orderData) {
                throw new Error('No order data received from server');
            }

            setOrder(orderData);
        } catch (error) {
            console.error('Error fetching order:', error);
            console.error('Error response:', error.response);
            setError(error.response?.data?.message || error.message || 'Failed to load order details');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="spinner" />
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading order details...</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="max-w-2xl mx-auto text-center py-12">
                    <Card className="p-8">
                        <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--danger)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-heading-3 mb-2">Order Not Found</h2>
                        <p className="text-description mb-6">{error}</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => navigate('/user/my-orders')}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px]"
                                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                            >
                                <HiArrowLeft className="w-5 h-5" />
                                Back to Orders
                            </button>
                            <button
                                onClick={fetchOrder}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px]"
                                style={{ backgroundColor: 'var(--bg-surface-3)', color: 'var(--text-primary)' }}
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
                <div className="text-center py-12 text-gray-500">Order not found</div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/user/my-orders')}
                        className="p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Back to Orders"
                    >
                        <HiArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-heading-2">Order #{order.orderId}</h1>
                        <p className="text-description mt-1">
                            Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={fetchOrder}
                        className="p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Refresh"
                    >
                        <HiRefresh className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Order Info - Takes 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Information Card */}
                        <Card>
                            <div className="flex items-start justify-between mb-4">
                                <h2 className="text-heading-4">
                                    {order.items?.length > 1 ? 'Order Items' : 'Product Details'}
                                </h2>
                                <Badge variant={
                                    order.status === 'delivered' ? 'success' :
                                        order.status === 'cancelled' ? 'danger' :
                                            order.status === 'confirmed' ? 'info' : 'warning'
                                }>
                                    {order.status}
                                </Badge>
                            </div>
                        </Card>
                        {/* Multi-item order display */}
                        {order.items && order.items.length > 0 ? (
                            <div className="space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead style={{ borderBottom: '1px solid var(--border)' }}>
                                            <tr className="text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                                <th className="pb-2">Product</th>
                                                <th className="pb-2 text-center">Qty</th>
                                                <th className="pb-2 text-right">Price</th>
                                                <th className="pb-2 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                                            {order.items.map((item, idx) => (
                                                <tr key={idx} className="transition-colors" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
                                                    <td className="py-3">
                                                        <div>
                                                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.productName}</p>
                                                            {item.productDescription && (
                                                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.productDescription}</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 text-center font-semibold" style={{ color: 'var(--text-primary)' }}>{item.quantity}</td>
                                                    <td className="py-3 text-right" style={{ color: 'var(--text-primary)' }}>₨{item.price?.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                                                    <td className="py-3 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>₨{item.subtotal?.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                    <div className="text-right">
                                        <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Order Total</p>
                                        <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>₨{order.totalAmount?.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Single-item order display (backward compatibility)
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                                        Product Name
                                    </p>
                                    <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{order.productName}</p>
                                </div>

                                {order.productDescription && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                                            Description
                                        </p>
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
                    </div>

                    {/* Delivery Address Card */}
                    {order.deliveryAddress && (
                        <Card>
                            <h2 className="text-heading-4 mb-4">Delivery Address</h2>
                            <div className="rounded-lg p-4 space-y-1" style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-secondary)' }}>
                                {order.deliveryAddress.street && <p className="font-medium">{order.deliveryAddress.street}</p>}
                                {(order.deliveryAddress.city || order.deliveryAddress.state) && (
                                    <p>{order.deliveryAddress.city}{order.deliveryAddress.city && order.deliveryAddress.state ? ', ' : ''}{order.deliveryAddress.state}</p>
                                )}
                                {(order.deliveryAddress.country || order.deliveryAddress.zipCode) && (
                                    <p>{order.deliveryAddress.country} {order.deliveryAddress.zipCode}</p>
                                )}
                            </div>
                        </Card>
                    )}

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
                            <h2 className="text-heading-4 mb-4">Notes</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>{order.notes}</p>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Status & Timeline */}
                <div className="space-y-6">
                    {/* Payment Information */}
                    <Card>
                        <h3 className="text-heading-5 mb-4">Payment Details</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Payment Status</p>
                                <Badge variant={
                                    order.paymentStatus === 'completed' ? 'success' :
                                        order.paymentStatus === 'failed' ? 'danger' :
                                            order.paymentStatus === 'refunded' ? 'info' : 'warning'
                                }>
                                    {order.paymentStatus}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Payment Method</p>
                                <p className="font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                                    {order.paymentMethod?.replace(/_/g, ' ')}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <h3 className="text-heading-5 mb-4">Order Timeline</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--primary)' }} />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Order Placed</p>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {order.estimatedDeliveryDate && (
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--warning)' }} />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Estimated Delivery</p>
                                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}

                            {order.actualDeliveryDate && (
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'var(--success)' }} />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Delivered</p>
                                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{new Date(order.actualDeliveryDate).toLocaleString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Tracking Number */}
                    {order.trackingNumber && (
                        <Card>
                            <h3 className="text-heading-5 mb-4">Tracking Information</h3>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Tracking Number</p>
                                <p className="font-mono font-medium px-3 py-2 rounded" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border)' }}>
                                    {order.trackingNumber}
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
            {/* </div> */}
        </MainLayout >
    );
}

export default OrderDetailsPage;
