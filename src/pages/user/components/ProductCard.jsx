import React from 'react';
import { HiPlus } from 'react-icons/hi';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div
      onClick={() => onAddToCart(product)}
      className="rounded-xl overflow-hidden transition-all duration-300 active:scale-[0.98] group cursor-pointer flex flex-col h-full"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--primary)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Product Image */}
      <div className="aspect-square relative overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-surface-3)' }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/200x200?text=Food';
          }}
        />

        {/* Floating Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1.5 z-10">
          {product.originalPrice && (
            <span className="bg-blue-600/85 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shadow-[0_2px_8px_rgba(37,99,235,0.3)] border border-blue-400/20">
              Deal
            </span>
          )}
          {product.discount && (
            <span className="bg-white/90 backdrop-blur-md text-red-600 px-2 py-0.5 rounded-md text-[9px] font-black ml-auto shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-red-100/50">
              -₨{product.discount}
            </span>
          )}
        </div>

        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-300 flex items-center justify-center">
          <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <HiPlus className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-2 flex flex-col flex-1">
        <div className="flex-1">
          <h3
            className="font-bold text-[13px] leading-tight mb-1 line-clamp-1 transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            {product.name}
          </h3>
        </div>

        {/* Pricing */}
        <div className="mt-auto flex items-baseline gap-1.5">
          <span className="text-sm font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>
            ₨{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] line-through font-medium opacity-60" style={{ color: 'var(--text-muted)' }}>
              ₨{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
