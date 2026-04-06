
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
  isProcessing
}) => {
  return (
    <div className={`w-full sm:w-80 md:w-96 bg-white border-t sm:border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col min-h-0 overflow-hidden ${cartItems.length > 0 ? 'flex' : 'hidden sm:flex'}`}>
      {/* Order Header - Fixed at top */}
      <div className="px-4 border-b border-gray-100 flex-shrink-0 bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-gray-100 bg-white sticky top-0 z-20">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Current Order</h2>
            <p className="text-xs font-semibold text-gray-400 mt-0.5">{cartItems.length} items</p>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Order Items List - Image Match - Optimized Density - Flexible to fill space */}
      <div className={`flex-1 min-h-0 flex flex-col ${cartItems.length > 2 ? 'overflow-y-auto scrollbar-custom' : 'overflow-y-hidden'}`}>
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/10">
            <div className="w-16 h-16 bg-gray-100/50 rounded-lg flex items-center justify-center mb-4">
              <HiOutlineShoppingCart className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">Your cart is empty</h3>
            <p className="text-gray-400 text-xs mt-1">Add items from menu</p>
          </div>
        ) : (
          <div className="space-y-1.5 px-3 py-3">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-100 rounded-xl p-2.5 transition-all hover:bg-gray-50/20"
              >
                {/* Row 1: Name and Red Trash Icon - Density Adjusted */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800 text-[13px] sm:text-sm truncate pr-2">
                    {item.name}
                  </h3>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-600 transition-colors p-0.5"
                    title="Remove item"
                  >
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Row 2: Image, Selector, and Price */}
                <div className="flex items-center justify-between gap-3">
                  {/* Compact Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover bg-gray-100 border border-gray-100"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/48x48?text=Food';
                      }}
                    />
                  </div>

                  {/* Quantity Selector - Compact */}
                  <div className="flex items-center border border-gray-100 rounded-md bg-gray-50/30">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors border-r border-gray-100"
                    >
                      <HiOutlineMinus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-gray-900 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-green-600 transition-colors border-l border-gray-100"
                    >
                      <HiOutlinePlus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Bold Price */}
                  <p className="font-bold text-gray-900 text-[13px] sm:text-sm tabular-nums whitespace-nowrap">
                    Rs{((item.price * (item.quantity || 1))).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Summary & Details (Flat) - Explicitly attached to bottom */}
      {cartItems.length > 0 && (
        <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-100 bg-white space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium font-bold">Subtotal</span>
              <span className="text-gray-900 font-bold tabular-nums">Rs{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium font-bold">Delivery</span>
              <span className="text-green-500 font-bold">Free</span>
            </div>
            <div className="pt-2 flex justify-between border-t border-gray-100 mt-1">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900 tabular-nums">Rs{cartTotal.toLocaleString()}</span>
            </div>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                Delivery Address
              </h3>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Street Address *"
                  required
                  className="w-full px-4 py-2 text-sm border border-gray-100 rounded-lg outline-none transition-all placeholder:text-gray-300 text-gray-700"
                  value={deliveryAddress.street}
                  onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City *"
                    required
                    className="w-full px-4 py-2 text-sm border border-gray-100 rounded-lg outline-none transition-all placeholder:text-gray-300 text-gray-700"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code *"
                    required
                    className="w-full px-4 py-2 text-sm border border-gray-100 rounded-lg outline-none transition-all placeholder:text-gray-300 text-gray-700"
                    value={deliveryAddress.zipCode}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zipCode: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Explicit Bottom Actions */}
            <div className="flex gap-2 pt-2 border-t border-gray-50 mt-4">
              <button
                type="button"
                className="flex-1 bg-gray-50 text-gray-700 font-bold py-3.5 rounded-lg text-sm border border-gray-100 transition-colors"
                onClick={handlePrintReceipt}
              >
                Receipt
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 bg-blue-600 disabled:bg-gray-200 text-white font-bold py-3.5 rounded-lg text-sm transition-all"
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
