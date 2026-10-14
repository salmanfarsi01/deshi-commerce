import React, { useState } from 'react';
import { ShoppingBag, Star, Plus, Minus, Heart, CheckCircle2, Truck } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../data/bangladeshGeo';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, updateCartQuantity, viewProductDetail, toggleWishlist, isWishlisted } = useApp();
  const [imageError, setImageError] = useState(false);

  const cartItem = cart.items.find((item) => item.productId === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const wishlisted = isWishlisted(product.id);

  const effectivePrice = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  // Real stock status
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const hasGenuineReviews = (product.reviewCount || 0) > 0 && (product.rating || 0) > 0;

  return (
    <div className="group relative bg-white border border-[#E2E8F0] hover:border-slate-300 hover:shadow-md rounded-xl transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top Media Container: consistent aspect ratio, optimal sizing */}
      <div className="relative h-52 w-full bg-slate-50/60 p-3 flex items-center justify-center border-b border-[#F1F5F9] overflow-hidden">
        {/* Status Badge: Discount OR Low Stock OR Out of Stock */}
        {isOutOfStock ? (
          <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-200 text-slate-700">
            Out of Stock
          </span>
        ) : hasDiscount ? (
          <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
            -{discountPercent}% OFF
          </span>
        ) : isLowStock ? (
          <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Only {product.stock} left
          </span>
        ) : (
          <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
            Genuine
          </span>
        )}

        {/* Minimalist Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full transition-colors cursor-pointer bg-white/90 backdrop-blur-xs hover:bg-white shadow-2xs ${
            wishlisted ? 'text-rose-600' : 'text-slate-400 hover:text-slate-700'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Product Image: properly scaled without vast empty voids */}
        <div
          onClick={() => viewProductDetail(product.slug)}
          className="w-full h-full flex items-center justify-center cursor-pointer"
        >
          {!imageError && product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <span className="text-3xl mb-1">📦</span>
              <span className="text-xs text-slate-500 font-medium">{product.brand}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
        <div className="space-y-1.5">
          {/* Brand & Genuine Rating (Only displayed if verified ratings exist) */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium truncate flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">{product.brand || 'Verified Authentic'}</span>
            </span>

            {/* Render rating only if genuine reviews exist */}
            {hasGenuineReviews ? (
              <div className="flex items-center gap-1 text-slate-700 text-xs font-semibold shrink-0">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-slate-400 text-[11px] font-normal">({product.reviewCount})</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">New Arrival</span>
            )}
          </div>

          {/* Product Title: Readable, larger, clear two-line hierarchy */}
          <h3
            onClick={() => viewProductDetail(product.slug)}
            className="text-[14px] sm:text-[15px] font-semibold text-[#0F172A] line-clamp-2 leading-snug hover:text-slate-700 transition-colors cursor-pointer min-h-[40px]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Local Delivery & COD Signal */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
            <Truck className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Cash on Delivery · 2-3 Days</span>
          </div>
        </div>

        {/* Pricing & Stock Details */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-[#0F172A] tabular-nums font-mono">
              {formatBDT(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through tabular-nums font-mono">
                {formatBDT(product.price)}
              </span>
            )}
          </div>

          {/* Low Stock Indicator */}
          {isLowStock && (
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-amber-700 font-medium">
              <span>Hurry, only {product.stock} remaining</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-100">
          {inCartQty > 0 ? (
            <div className="flex items-center justify-between h-10 bg-slate-50 border border-slate-300 rounded-lg p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => updateCartQuantity(cartItem!.id, inCartQty - 1)}
                className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white text-slate-700 transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-[#0F172A]">{inCartQty} in Bag</span>
              <button
                type="button"
                disabled={inCartQty >= product.stock}
                onClick={() => updateCartQuantity(cartItem!.id, inCartQty + 1)}
                className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white text-slate-700 transition-colors cursor-pointer disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => addToCart(product.id, 1)}
              className="w-full h-10 rounded-lg bg-[#0F172A] hover:bg-slate-800 active:bg-[#0F172A] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isOutOfStock ? 'Out of Stock' : 'Add to Bag'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
