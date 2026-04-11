import { HiPlus } from 'react-icons/hi';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onAddToCart(product)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAddToCart(product);
        }
      }}
      aria-label={`Add ${product.name} to order — ₨${product.price.toLocaleString()}`}
      className="rounded-xl overflow-hidden transition-all duration-200 active:scale-[0.97] group cursor-pointer flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-1"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Product Image */}
      <div
        className="aspect-[4/3] relative overflow-hidden flex-shrink-0"
        style={{ backgroundColor: 'var(--bg-surface-3)' }}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/200x150?text=Food';
          }}
        />

        {/* Badges */}
        {(product.originalPrice || product.discount) && (
          <div className="absolute top-1.5 left-1.5 right-1.5 flex items-start justify-between gap-1 z-10">
            {product.originalPrice && (
              <span className="bg-blue-600/90 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide shadow-sm">
                Deal
              </span>
            )}
            {product.discount && (
              <span className="bg-white/95 backdrop-blur-sm text-red-600 px-1.5 py-0.5 rounded text-[9px] font-bold ml-auto shadow-sm">
                −₨{product.discount}
              </span>
            )}
          </div>
        )}

        {/* Add overlay — appears on hover */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <HiPlus className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-2.5 flex flex-col flex-1 gap-1">
        <h3
          className="font-semibold text-[13px] leading-tight line-clamp-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {product.name}
        </h3>

        {product.description && (
          <p
            className="text-[11px] leading-snug line-clamp-2 flex-1"
            style={{ color: 'var(--text-muted)' }}
          >
            {product.description}
          </p>
        )}

        {/* Pricing */}
        <div className="mt-auto pt-1.5 flex items-baseline gap-1.5">
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: 'var(--text-primary)' }}
          >
            ₨{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span
              className="text-[10px] line-through"
              style={{ color: 'var(--text-muted)' }}
            >
              ₨{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
