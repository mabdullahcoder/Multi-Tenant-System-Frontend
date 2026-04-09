import { HiOutlineTrash, HiOutlinePlus, HiOutlineMinus, HiOutlineShoppingCart } from 'react-icons/hi';

const OrderSummary = ({
  cartItems,
  cartTotal,
  deliveryAddress,
  setDeliveryAddress,
  handleClearCart,
  handleRemoveItem,
  handleQuantityChange,
  handleCheckout,
  handlePrintReceipt,
  isProcessing,
  editMode = false,
}) => {
  return (
    <div
      className={`w-full sm:w-80 md:w-96 flex flex-col min-h-0 overflow-hidden ${cartItems.length > 0 ? 'flex' : 'hidden sm:flex'}`}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
      }}
    >

      {/* Order Header */}
      <div
        className="px-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
      >
        <div className="flex items-center justify-between px-4 py-4 sticky top-0 z-20" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Current Order</h2>
            <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{cartItems.length} items</p>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm font-semibold transition-colors"
              style={{ color: 'var(--danger)' }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Order Items List */}
      <div className={`flex-1 min-h-0 flex flex-col ${cartItems.length > 2 ? 'overflow-y-auto scrollbar-custom' : 'overflow-y-hidden'}`}>
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--bg-surface-3)' }}>
              <HiOutlineShoppingCart className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Your cart is empty</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Add items from menu</p>
          </div>
        ) : (
          <div className="space-y-1.5 px-3 py-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl p-2.5 transition-all"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface)'}
              >
                {/* Row 1: Name + Remove */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-[13px] sm:text-sm truncate pr-2" style={{ color: 'var(--text-primary)' }}>
                    {item.name}
                  </h3>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-0.5 transition-colors"
                    style={{ color: 'var(--danger)' }}
                    title="Remove item"
                  >
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Row 2: Image + Qty + Price */}
                <div className="flex items-center justify-between gap-3">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover"
                      style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border)' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/48x48?text=Food';
                      }}
                    />
                  </div>

                  {/* Quantity Selector */}
                  <div
                    className="flex items-center rounded-md"
                    style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-2)' }}
                  >
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center transition-colors"
                      style={{ color: 'var(--text-muted)', borderRight: '1px solid var(--border)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <HiOutlineMinus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center transition-colors"
                      style={{ color: 'var(--text-muted)', borderLeft: '1px solid var(--border)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--success)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <HiOutlinePlus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Price */}
                  <p className="font-bold text-[13px] sm:text-sm tabular-nums whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                    Rs{(item.price * (item.quantity || 1)).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Summary + Checkout */}
      {cartItems.length > 0 && (
        <div
          className="flex-shrink-0 p-3 sm:p-4 space-y-3"
          style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
        >
          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>Rs{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Delivery</span>
              <span className="font-bold" style={{ color: 'var(--success)' }}>Free</span>
            </div>
            <div className="pt-2 flex justify-between mt-1" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
              <span className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>Rs{cartTotal.toLocaleString()}</span>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            {/* Delivery Address — normal mode only */}
            {!editMode && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                  Delivery Address
                </h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Street Address *"
                    required
                    className="w-full px-4 py-2 text-sm rounded-lg outline-none transition-all min-h-[40px]"
                    style={{
                      backgroundColor: 'var(--bg-surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City *"
                      required
                      className="w-full px-4 py-2 text-sm rounded-lg outline-none transition-all min-h-[40px]"
                      style={{
                        backgroundColor: 'var(--bg-surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code *"
                      required
                      className="w-full px-4 py-2 text-sm rounded-lg outline-none transition-all min-h-[40px]"
                      style={{
                        backgroundColor: 'var(--bg-surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                      value={deliveryAddress.zipCode}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
              {!editMode && (
                <button
                  type="button"
                  className="flex-1 font-bold py-3.5 rounded-lg text-sm transition-colors min-h-[44px]"
                  style={{
                    backgroundColor: 'var(--bg-surface-3)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                  }}
                  onClick={handlePrintReceipt}
                >
                  Receipt
                </button>
              )}
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 font-bold py-3.5 rounded-lg text-sm transition-all min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
              >
                {isProcessing ? 'Processing...' : editMode ? 'Update Order' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
