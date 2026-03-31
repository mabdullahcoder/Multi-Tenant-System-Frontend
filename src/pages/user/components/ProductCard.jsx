
import React from 'react';
import { HiPlus } from 'react-icons/hi';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div
      onClick={() => onAddToCart(product)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 text-left transition-all duration-300 active:scale-[0.98] group cursor-pointer flex flex-col h-full"
    >
      {/* Product Image Section */}
      <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden flex-shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/400x300?text=Food';
          }}
        />

        {/* Floating Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1.5 z-10">
          {product.originalPrice && (
            <span className="bg-blue-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg border border-blue-400/30">
              Deal
            </span>
          )}
          {product.discount && (
            <span className="bg-white/95 backdrop-blur-md text-red-600 px-2.5 py-1 rounded-full text-[9px] font-black ml-auto shadow-lg border border-red-100">
              -₨{product.discount}
            </span>
          )}
        </div>

        {/* Quick Add Overlay Icon */}
        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors duration-300 flex items-center justify-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
            <HiPlus className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Product Content Section */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-black text-gray-900 text-sm sm:text-base leading-tight tracking-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-1 uppercase">
            {product.name}
          </h3>
          {/* {product.description && (
            <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3 font-medium">
              {product.description}
            </p>
          )} */}
        </div>

        {/* Pricing Layout */}
        <div className="mt-auto pt-2 flex items-end justify-between">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through font-bold mb-0.5 opacity-60">
                ₨{product.originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-base sm:text-xl font-black text-gray-900 tabular-nums tracking-tighter">
              ₨{product.price.toLocaleString()}
            </span>
          </div>

          {/* Subtle CTA Label */}
          {/* <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Add to Order
          </span> */}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
