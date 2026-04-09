import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../../components/layouts/MainLayout';
import { useUI } from '../../context/UIContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../services/orderAPI';
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
    const [orderCount, setOrderCount] = useState(0);
    const [placedOrderIds, setPlacedOrderIds] = useState([]);
    const [placedAt, setPlacedAt] = useState(null);
    const [receiptItems, setReceiptItems] = useState([]);
    const [receiptTotal, setReceiptTotal] = useState(0);
    const [receiptAddress, setReceiptAddress] = useState({});
    const [deliveryAddress, setDeliveryAddress] = useState(
        editContext?.deliveryAddress || { street: '', city: '', state: '', country: '', zipCode: '' }
    );

    // Seed cart with existing order items when entering edit mode
    useEffect(() => {
        if (!editContext) return;
        const seeded = (editContext.existingItems || []).map((item) => ({
            id: item.productName, // use productName as stable id for menu items
            name: item.productName,
            description: item.productDescription || '',
            price: item.price,
            quantity: item.quantity,
        }));
        seedCart(seeded);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sample menu data
    const menuCategories = useMemo(() => [
        { id: 'all', label: 'All' },
        { id: 'deals', label: 'Deals' },
        { id: 'pizzas', label: 'Pizzas' },
        { id: 'chicken', label: 'Chicken' },
        { id: 'sides', label: 'Sides' },
        { id: 'desserts', label: 'Desserts' },
        { id: 'drinks', label: 'Drinks' },
    ], []);

    const products = useMemo(() => ({
        deals: [
            { id: 1, name: 'Cheese Burst Large', description: '1 Large Cheese Burst Pizza with Large Drink', price: 2650, originalPrice: 2770, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop', discount: 120 },
            { id: 2, name: 'Double Melt Deal Large', description: '1 Large Double Melt Pizza with Large Drink', price: 3350, originalPrice: 3470, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', discount: 120 },
            { id: 3, name: 'Super Loaded Large', description: '1 Super Loaded Large Pizza + 1.5 Ltr Drink', price: 2200, originalPrice: 2320, image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400&h=300&fit=crop', discount: 120 },
        ],
        pizzas: [
            { id: 4, name: 'Margherita Pizza', description: 'Fresh tomato sauce, mozzarella, fresh basil', price: 1500, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop' },
            { id: 5, name: 'Pepperoni Pizza', description: 'Crispy pepperoni with mozzarella cheese', price: 1800, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop' },
            { id: 6, name: 'Veggie Delight', description: 'Bell peppers, onions, mushrooms, olives', price: 1600, image: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=400&h=300&fit=crop' },
            { id: 7, name: 'BBQ Chicken', description: 'Smoky BBQ sauce with grilled chicken', price: 2000, image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop' },
        ],
        chicken: [
            { id: 8, name: 'Fried Chicken Wings', description: '8 pieces of crispy fried chicken wings', price: 1200, image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&h=300&fit=crop' },
            { id: 9, name: 'BBQ Chicken Strips', description: '6 pieces BBQ marinated chicken strips', price: 1400, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop' },
            { id: 10, name: 'Spicy Chicken Tenders', description: '5 pieces spicy breaded chicken tenders', price: 1100, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop' },
        ],
        sides: [
            { id: 11, name: 'Garlic Fries', description: 'Crispy fries with garlic and herbs', price: 450, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop' },
            { id: 12, name: 'Cheese Fries', description: 'Golden fries with melted cheese', price: 500, image: 'https://images.unsplash.com/photo-1630431341973-02e1d0f45e79?w=400&h=300&fit=crop' },
            { id: 13, name: 'Loaded Nachos', description: 'Tortilla chips with cheese and jalapeños', price: 600, image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop' },
        ],
        desserts: [
            { id: 14, name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with flowing center', price: 350, image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop' },
            { id: 15, name: 'Cheesecake Slice', description: 'Creamy New York style cheesecake', price: 400, image: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400&h=300&fit=crop' },
            { id: 16, name: 'Brownie Sundae', description: 'Warm brownie with ice cream', price: 450, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop' },
        ],
        drinks: [
            { id: 17, name: 'Coca Cola (1.5L)', description: 'Cold refreshing cola drink', price: 300, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop' },
            { id: 18, name: 'Sprite (1.5L)', description: 'Lemon-lime flavored drink', price: 300, image: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=400&h=300&fit=crop' },
            { id: 19, name: 'Orange Juice', description: 'Fresh squeezed orange juice', price: 250, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop' },
        ],
    }), []);

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

    // ── Edit-mode checkout: append only the delta items ──
    const handleAppendCheckout = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) {
            addNotification({ type: 'error', message: 'No items in order!' });
            return;
        }
        setIsProcessing(true);
        try {
            // Send the full current cart; backend computes the diff
            const items = cartItems.map((item) => ({
                productName: item.name,
                productDescription: item.description || '',
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity,
            }));

            const response = await orderAPI.appendItems(editContext.orderMongoId, items);

            clearCart();

            addNotification({
                type: 'success',
                message: `Items added to order #${editContext.orderId} successfully!`,
            });

            // Navigate back to KDS
            navigate('/admin/kitchen-display');
        } catch (error) {
            console.error('Append items error:', error);
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
        if (editContext) return handleAppendCheckout(e);

        e.preventDefault();
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
            setOrderCount(1);
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
            console.error('Checkout error:', error);
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
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium">
                    <span>
                        Editing Order <strong>#{editContext.orderId}</strong> — add items to the existing order.
                        Only quantities above the current order will be appended.
                    </span>
                    <button
                        onClick={() => { clearCart(); navigate('/admin/kitchen-display'); }}
                        className="ml-auto text-white/80 hover:text-white underline text-xs"
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 pb-4">
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                            ))}
                        </div>
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-8 sm:py-12">
                                <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>No items found for this search or category</p>
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
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div
                                className="rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-fade-in"
                                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                            >
                                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}>
                                    <svg className="w-10 h-10" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Order Successful!</h2>
                                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                                    Your order has been placed successfully. You can track its status in the "My Orders" section.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => {
                                            setShowSuccessModal(false);
                                            navigate('/user/my-orders', { state: { refresh: true } });
                                        }}
                                        className="w-full font-semibold py-3 rounded-lg shadow-md transition-all active:scale-95 min-h-[44px]"
                                        style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                                    >
                                        View My Orders
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowSuccessModal(false);
                                            setDeliveryAddress({ street: '', city: '', state: '', country: '', zipCode: '' });
                                        }}
                                        className="w-full font-semibold py-3 rounded-lg transition-all active:scale-95 min-h-[44px]"
                                        style={{ backgroundColor: 'var(--bg-surface-3)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                                    >
                                        Add More Items
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
