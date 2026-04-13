import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import { useUI } from '../../context/UIContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../services/orderAPI';
import { menuAPI } from '../../services/menuAPI';
import ReceiptModal from '../../components/ui/ReceiptModal';

// Components
import SearchBar from './components/SearchBar';
import CategoryTabs from './components/CategoryTabs';
import ProductCard from './components/ProductCard';
import OrderSummary from './components/OrderSummary';

function PlaceOrderPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { addNotification } = useUI();
    const { items: cartItems, cartTotal, cartItemCount, addToCart, removeFromCart, updateQuantity, clearCart, seedCart } = useCart();
    const { user } = useAuth();

    // ── Edit-mode state (admin appending items to an existing confirmed order) ──
    // Passed via router state: { editMode: true, orderId, orderMongoId, existingItems, deliveryAddress }
    const editContext = location.state?.editMode ? location.state : null;

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [placedOrderIds, setPlacedOrderIds] = useState([]);
    const [placedAt, setPlacedAt] = useState(null);
    const [receiptItems, setReceiptItems] = useState([]);
    const [receiptTotal, setReceiptTotal] = useState(0);
    const [receiptAddress, setReceiptAddress] = useState({});
    const [deliveryAddress, setDeliveryAddress] = useState(
        editContext?.deliveryAddress || { street: '', city: '', state: '', country: '', zipCode: '' }
    );

    // ── Menu state fetched from API ──
    // getMenuGrouped returns an array: [{ _id, name, slug, items: [...] }, ...]
    const [menuGrouped, setMenuGrouped] = useState([]);
    const [menuLoading, setMenuLoading] = useState(true);
    const [menuError, setMenuError] = useState(null);

    // Fetch live menu from the database on mount
    useEffect(() => {
        let cancelled = false;
        const fetchMenu = async () => {
            setMenuLoading(true);
            setMenuError(null);
            try {
                const res = await menuAPI.getMenuGrouped();
                if (!cancelled) setMenuGrouped(res.data || []);
            } catch (err) {
                if (!cancelled) setMenuError('Failed to load menu. Please refresh.');
            } finally {
                if (!cancelled) setMenuLoading(false);
            }
        };
        fetchMenu();
        return () => { cancelled = true; };
    }, []);

    // Seed cart with existing order items when entering edit mode
    useEffect(() => {
        if (!editContext) return;
        const seeded = (editContext.existingItems || []).map((item) => ({
            id: item.productName,
            name: item.productName,
            description: item.productDescription || '',
            price: item.price,
            quantity: item.quantity,
        }));
        seedCart(seeded);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Build category tabs from API response array: always prepend "All"
    const menuCategories = useMemo(() => {
        const cats = menuGrouped.map((group) => ({
            id: group._id,
            label: group.name,
        }));
        return [{ id: 'all', label: 'All' }, ...cats];
    }, [menuGrouped]);

    // Build flat products map keyed by category _id from API data
    const products = useMemo(() => {
        const map = {};
        menuGrouped.forEach((group) => {
            map[group._id] = (group.items || [])
                .filter((item) => item.isActive !== false)
                .map((item) => ({
                    id: item._id,
                    name: item.name,
                    description: item.description || '',
                    price: item.price,
                    originalPrice: item.originalPrice,
                    image: item.image,
                }));
        });
        return map;
    }, [menuGrouped]);

    const handleAddToCart = useCallback((product) => {
        addToCart(product);
        addNotification({ type: 'success', message: `${product.name} added to order!` });
    }, [addToCart, addNotification]);

    const handleQuantityChange = useCallback((productId, newQuantity) => {
        updateQuantity(productId, newQuantity);
    }, [updateQuantity]);

    const handleRemoveItem = useCallback((productId) => {
        removeFromCart(productId);
        addNotification({ type: 'success', message: 'Item removed from order' });
    }, [removeFromCart, addNotification]);

    const handleClearCart = useCallback(() => {
        clearCart();
        addNotification({ type: 'success', message: 'Order cleared' });
    }, [clearCart, addNotification]);

    // ── Edit-mode checkout: replace the full items list on the existing order ──
    const handleAppendCheckout = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) {
            addNotification({ type: 'error', message: 'No items in order!' });
            return;
        }
        setIsProcessing(true);
        try {
            const items = cartItems.map((item) => ({
                productName: item.name,
                productDescription: item.description || '',
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity,
            }));

            await orderAPI.updateItems(editContext.orderMongoId, items);

            clearCart();

            addNotification({
                type: 'success',
                message: `Order #${editContext.orderId} updated successfully!`,
            });

            navigate('/admin/kitchen-display');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to add items to order',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Normal checkout: create a new order ──
    const handleCheckout = async (e) => {
        e.preventDefault();
        if (editContext) return handleAppendCheckout(e);
        if (cartItems.length === 0) {
            addNotification({ type: 'error', message: 'No items in order!' });
            return;
        }
        if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.zipCode) {
            addNotification({ type: 'error', message: 'Please provide a valid delivery address' });
            return;
        }
        setIsProcessing(true);
        try {
            const items = cartItems.map((item) => ({
                productName: item.name,
                productDescription: item.description || '',
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity,
            }));

            const orderData = { items, deliveryAddress: { ...deliveryAddress } };
            const response = await orderAPI.createOrder(orderData);
            const createdOrder = response.data;

            const snapshotItems = [...cartItems];
            const snapshotTotal = cartTotal;
            const snapshotAddress = { ...deliveryAddress };
            const orderId = createdOrder._id || createdOrder.orderId;

            clearCart();
            setReceiptItems(snapshotItems);
            setReceiptTotal(snapshotTotal);
            setReceiptAddress(snapshotAddress);
            setPlacedOrderIds([orderId]);
            setPlacedAt(new Date());
            setShowReceipt(true);

            addNotification({
                type: 'success',
                message: `Order placed successfully with ${cartItems.length} items!`,
            });
        } catch (error) {
            addNotification({ type: 'error', message: 'Something went wrong while placing your order. Please try again.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrintReceipt = useCallback(() => {
        if (cartItems.length === 0) {
            addNotification({ type: 'error', message: 'No items in order!' });
            return;
        }
        setReceiptItems([...cartItems]);
        setReceiptTotal(cartTotal);
        setReceiptAddress({ ...deliveryAddress });
        setPlacedOrderIds([]);
        setPlacedAt(new Date());
        setShowReceipt(true);
    }, [cartItems, cartTotal, deliveryAddress, addNotification]);

    const filteredProducts = useMemo(() => {
        let currentProducts = [];
        if (selectedCategory === 'all') {
            currentProducts = Object.values(products).flat();
        } else {
            currentProducts = products[selectedCategory] || [];
        }
        return currentProducts.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, selectedCategory, searchQuery]);

    return (
        <MainLayout fullScreen={true}>
            {/* Edit-mode banner */}
            {editContext && (
                <div className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium flex-shrink-0" style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="flex-1">
                        Editing Order <strong>#{editContext.orderId}</strong> — modify items then click Update Order.
                    </span>
                    <button
                        onClick={() => { clearCart(); navigate('/admin/kitchen-display'); }}
                        className="text-white/80 hover:text-white text-xs font-semibold underline underline-offset-2 flex-shrink-0"
                        aria-label="Cancel editing and go back"
                    >
                        Cancel
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0" style={{ backgroundColor: 'var(--bg-base)' }}>
                {/* LEFT SIDE - Menu Section */}
                <div className="flex-1 flex flex-col overflow-hidden min-h-0" style={{ backgroundColor: 'var(--bg-base)' }}>
                    <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                    <CategoryTabs
                        menuCategories={menuCategories}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                    />

                    <div className="flex-1 overflow-y-auto px-2 sm:px-3 md:px-6 py-3 sm:py-4 md:py-6 scrollbar-thin">
                        {menuLoading ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <div className="spinner" />
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading menu…</p>
                            </div>
                        ) : menuError ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                                <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>{menuError}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="text-sm font-medium underline"
                                    style={{ color: 'var(--primary)' }}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 pb-4">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                                ))}
                            </div>
                        )}
                        {!menuLoading && !menuError && filteredProducts.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--bg-surface-3)' }}>
                                    <svg className="w-7 h-7" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No items found</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Try a different search or category</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE - Cart Section */}
                <OrderSummary
                    cartItems={cartItems}
                    cartItemCount={cartItemCount}
                    cartTotal={cartTotal}
                    deliveryAddress={deliveryAddress}
                    setDeliveryAddress={setDeliveryAddress}
                    handleClearCart={handleClearCart}
                    handleRemoveItem={handleRemoveItem}
                    handleQuantityChange={handleQuantityChange}
                    handleCheckout={handleCheckout}
                    handlePrintReceipt={handlePrintReceipt}
                    isProcessing={isProcessing}
                    editMode={!!editContext}
                />
            </div>

            {/* Modals — only shown in normal (non-edit) mode */}
            {!editContext && (
                <>
                    <ReceiptModal
                        isOpen={showReceipt}
                        onClose={() => {
                            setShowReceipt(false);
                            if (placedOrderIds.length > 0) setShowSuccessModal(true);
                        }}
                        cartItems={receiptItems}
                        cartTotal={receiptTotal}
                        cartItemCount={receiptItems?.reduce((s, i) => s + (i.quantity || 0), 0) || 0}
                        deliveryAddress={receiptAddress}
                        user={user}
                        orderIds={placedOrderIds}
                        placedAt={placedAt}
                    />

                    {showSuccessModal && (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="success-modal-title"
                        >
                            <div
                                className="rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-fade-in"
                                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                            >
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}>
                                    <svg className="w-9 h-9" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 id="success-modal-title" className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Order placed!</h2>
                                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                                    Your order is confirmed. You can track its status in My Orders.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => {
                                            setShowSuccessModal(false);
                                            navigate('/user/my-orders', { state: { refresh: true } });
                                        }}
                                        className="w-full font-semibold py-3 rounded-lg shadow-sm transition-all active:scale-95 min-h-[44px]"
                                        style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                                    >
                                        Track my order
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowSuccessModal(false);
                                            setDeliveryAddress({ street: '', city: '', state: '', country: '', zipCode: '' });
                                        }}
                                        className="w-full font-semibold py-3 rounded-lg transition-all active:scale-95 min-h-[44px]"
                                        style={{ backgroundColor: 'var(--bg-surface-3)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                                    >
                                        Order more items
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </MainLayout>
    );
}

export default PlaceOrderPage;
