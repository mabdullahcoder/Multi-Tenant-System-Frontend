import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import { orderAPI } from '../../services/orderAPI';
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
                <div className="text-center py-12">
                    <div className="spinner mx-auto mb-4" />
                    <p className="text-gray-500">Loading order details...</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="max-w-2xl mx-auto text-center py-12">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => navigate('/user/my-orders')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <HiArrowLeft className="w-5 h-5" />
                                Back to Orders
                            </button>
                            <button
                                onClick={fetchOrder}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <HiRefresh className="w-5 h-5" />
                                Retry
                            </button>
                        </div>
                    </div>
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
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Back to Orders"
                    >
                        <HiArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Order #{order.orderId}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={fetchOrder}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <HiRefresh className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Order Info - Takes 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Information Card */}
                        <div className="card">
                            <div className="flex items-start justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {order.items?.length > 1 ? 'Order Items' : 'Product Details'}
                                </h2>
                                <span className={`badge badge-${order.status === 'delivered' ? 'success' :
                                    order.status === 'cancelled' ? 'danger' :
                                        order.status === 'confirmed' ? 'info' : 'warning'
                                    } text-sm font-semibold capitalize px-4 py-2`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Multi-item order display */}
                            {order.items && order.items.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="border-b border-gray-200">
                                                <tr className="text-left text-gray-600 font-semibold">
                                                    <th className="pb-2">Product</th>
                                                    <th className="pb-2 text-center">Qty</th>
                                                    <th className="pb-2 text-right">Price</th>
                                                    <th className="pb-2 text-right">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {order.items.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="py-3">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{item.productName}</p>
                                                                {item.productDescription && (
                                                                    <p className="text-xs text-gray-500 mt-0.5">{item.productDescription}</p>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-center font-semibold text-gray-900">{item.quantity}</td>
                                                        <td className="py-3 text-right text-gray-900">₨{item.price?.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                                                        <td className="py-3 text-right font-semibold text-gray-900">₨{item.subtotal?.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600 mb-1">Order Total</p>
                                            <p className="text-3xl font-bold text-blue-600">₨{order.totalAmount?.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Single-item order display (backward compatibility)
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                            Product Name
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">{order.productName}</p>
                                    </div>

                                    {order.productDescription && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                                Description
                                            </p>
                                            <p className="text-gray-700">{order.productDescription}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                                Quantity
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">{order.quantity}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                                Unit Price
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">₨{order.price?.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                                Total
                                            </p>
                                            <p className="text-2xl font-bold text-blue-600">₨{order.totalAmount?.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Delivery Address Card */}
                        {order.deliveryAddress && (
                            <div className="card">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Delivery Address
                                </h2>
                                <div className="bg-gray-50 rounded-lg p-4 text-gray-700 space-y-1">
                                    {order.deliveryAddress.street && <p className="font-medium">{order.deliveryAddress.street}</p>}
                                    {(order.deliveryAddress.city || order.deliveryAddress.state) && (
                                        <p>{order.deliveryAddress.city}{order.deliveryAddress.city && order.deliveryAddress.state ? ', ' : ''}{order.deliveryAddress.state}</p>
                                    )}
                                    {(order.deliveryAddress.country || order.deliveryAddress.zipCode) && (
                                        <p>{order.deliveryAddress.country} {order.deliveryAddress.zipCode}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Cancellation Info */}
                        {order.status === 'cancelled' && order.cancellationReason && (
                            <div className="card bg-red-50 border-red-200">
                                <h2 className="text-xl font-bold text-red-900 mb-4">
                                    Cancellation Details
                                </h2>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-semibold text-red-700 mb-1">Reason</p>
                                        <p className="text-red-900">{order.cancellationReason}</p>
                                    </div>
                                    {order.cancelledBy && (
                                        <div>
                                            <p className="text-sm font-semibold text-red-700 mb-1">Cancelled By</p>
                                            <p className="text-red-900 capitalize">{order.cancelledBy}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {order.notes && (
                            <div className="card">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Notes
                                </h2>
                                <p className="text-gray-700">{order.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Status & Timeline */}
                    <div className="space-y-6">
                        {/* Payment Information */}
                        <div className="card">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Payment Details
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        Payment Status
                                    </p>
                                    <span className={`badge badge-${order.paymentStatus === 'completed' ? 'success' :
                                        order.paymentStatus === 'failed' ? 'danger' :
                                            order.paymentStatus === 'refunded' ? 'info' : 'warning'
                                        } capitalize text-sm px-3 py-1.5`}>
                                        {order.paymentStatus}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        Payment Method
                                    </p>
                                    <p className="font-medium text-gray-900 capitalize">
                                        {order.paymentMethod?.replace(/_/g, ' ')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="card">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Order Timeline
                            </h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900">Order Placed</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {order.estimatedDeliveryDate && (
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900">Estimated Delivery</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {order.actualDeliveryDate && (
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900">Delivered</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(order.actualDeliveryDate).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tracking Number */}
                        {order.trackingNumber && (
                            <div className="card">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Tracking Information
                                </h3>
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        Tracking Number
                                    </p>
                                    <p className="font-mono font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                                        {order.trackingNumber}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default OrderDetailsPage;
