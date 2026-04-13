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
        className="px-4 py-3 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            {editMode ? 'Edit Order' : 'Your Order'}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {cartItems.length === 0 ? 'No items yet' : `${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'}`}
          </p>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors min-h-[32px]"
            style={{ color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Clear all items from order"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Order Items List */}
      <div className={`flex-1 min-h-0 flex flex-col ${cartItems.length > 2 ? 'overflow-y-auto scrollbar-custom' : 'overflow-y-hidden'}`}>
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--bg-surface-3)' }}>
              <HiOutlineShoppingCart className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Your cart is empty</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tap any item on the menu to add it here</p>
          </div>
        ) : (
          <ul className="space-y-1.5 px-3 py-3" aria-label="Cart items">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-1.5 rounded-lg px-3 py-2.5 transition-all"
                style={{
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)'}
              >
                {/* Item name — full row so it never truncates */}
                <span
                  className="text-xs font-semibold leading-snug"
                  style={{ color: 'var(--text-primary)' }}
                  title={item.name}
                >
                  {item.name}
                </span>

                {/* Controls row: stepper + price + remove */}
                <div className="flex items-center gap-2">
                  {/* Quantity stepper */}
                  <div
                    className="flex items-center rounded overflow-hidden flex-shrink-0"
                    style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
                    role="group"
                    aria-label={`Quantity for ${item.name}`}
                  >
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center transition-colors"
                      style={{ color: 'var(--text-muted)', borderRight: '1px solid var(--border)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <HiOutlineMinus className="w-2.5 h-2.5" />
                    </button>
                    <span
                      className="w-6 text-center text-xs font-bold tabular-nums leading-none"
                      style={{ color: 'var(--text-primary)' }}
                      aria-live="polite"
                      aria-label={`${item.quantity} of ${item.name}`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center transition-colors"
                      style={{ color: 'var(--text-muted)', borderLeft: '1px solid var(--border)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--success)'; e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <HiOutlinePlus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* Price */}
                  <span
                    className="flex-1 text-xs font-bold tabular-nums"
                    style={{ color: 'var(--primary)' }}
                  >
                    ₨{(item.price * (item.quantity || 1)).toLocaleString()}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 rounded transition-colors flex-shrink-0 flex items-center justify-center"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                    aria-label={`Remove ${item.name} from order`}
                    title={`Remove ${item.name}`}
                  >
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer: Summary + Checkout */}
      {cartItems.length > 0 && (
        <div
          className="flex-shrink-0 px-3 pt-2.5 pb-3 space-y-2.5"
          style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
        >
          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span className="font-semibold tabular-nums" style={{ color: 'var(--text-secondary)' }}>₨{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
              <span className="font-semibold" style={{ color: 'var(--success)' }}>Free</span>
            </div>
            <div
              className="flex justify-between items-center pt-2"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
              <span className="text-base font-bold tabular-nums" style={{ color: 'var(--primary)' }}>
                ₨{cartTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-2">
            {/* Delivery Address — normal mode only */}
            {!editMode && (
              <fieldset className="space-y-1.5">
                <legend
                  className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Delivery Address
                </legend>
                <input
                  type="text"
                  placeholder="Street address *"
                  required
                  aria-label="Street address"
                  className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--bg-surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    minHeight: '32px',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  value={deliveryAddress.street}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    placeholder="City *"
                    required
                    aria-label="City"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--bg-surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      minHeight: '32px',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="ZIP *"
                    required
                    aria-label="ZIP code"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--bg-surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      minHeight: '32px',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    value={deliveryAddress.zipCode}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                  />
                </div>
              </fieldset>
            )}

            {/* Action Buttons */}
            <div className="flex gap-1.5 pt-0.5">
              {!editMode && (
                <button
                  type="button"
                  className="flex-1 font-semibold py-2 rounded-lg text-xs transition-all min-h-[36px] active:scale-95"
                  style={{
                    backgroundColor: 'var(--bg-surface-3)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-surface-3)'}
                  onClick={handlePrintReceipt}
                  aria-label="Preview receipt"
                >
                  Receipt
                </button>
              )}
              <button
                type="submit"
                disabled={isProcessing}
                aria-busy={isProcessing}
                className="flex-1 font-bold py-2 rounded-lg text-xs transition-all min-h-[36px] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm"
                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                onMouseEnter={(e) => { if (!isProcessing) e.currentTarget.style.backgroundColor = 'var(--primary-dark)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; }}
              >
                {isProcessing ? (
                  <span className="inline-flex items-center justify-center gap-1.5">
                    <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing…
                  </span>
                ) : editMode ? 'Update Order' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
