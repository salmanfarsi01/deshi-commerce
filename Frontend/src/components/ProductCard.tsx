import React, { useState } from 'react';
import { ShoppingBag, Star, Plus, Minus, Heart, CheckCircle2 } from 'lucide-react';
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

  // Discreet low stock warning only when stock < 5
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group relative bg-white border border-[#E2E8F0] hover:border-slate-300 hover:shadow-sm rounded-xl transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top Media Container */}
      <div className="relative aspect-square w-full bg-slate-50/50 p-4 flex items-center justify-center border-b border-[#F1F5F9] overflow-hidden">
        {/* Top-Left: STRICT SINGLE STATUS BADGE (Discount OR New) */}
        {hasDiscount ? (
          <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
            -{discountPercent}%
          </span>
        ) : (
          <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
            NEW
          </span>
        )}

        {/* Top-Right: MINIMALIST WISHLIST HEART ICON */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full transition-colors cursor-pointer bg-white/80 backdrop-blur-xs hover:bg-white shadow-2xs ${
            wishlisted ? 'text-rose-600' : 'text-slate-400 hover:text-slate-700'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Main Product Image (Clean, No Stamped Stickers) */}
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
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
              <span className="text-3xl mb-1">📦</span>
              <span className="text-xs text-slate-500 font-medium">{product.brand}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
        <div className="space-y-1.5">
          {/* Brand & Compact Rating */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium truncate flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">{product.brand}</span>
            </span>

            {/* Compact Neutral Rating */}
            <div className="flex items-center gap-1 text-slate-600 text-xs font-medium shrink-0">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-400 text-[11px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => viewProductDetail(product.slug)}
            className="text-sm font-semibold text-[#0F172A] line-clamp-2 leading-snug hover:text-slate-700 transition-colors cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Price Row */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#0F172A] tabular-nums font-mono">
              {formatBDT(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through tabular-nums font-mono">
                {formatBDT(product.price)}
              </span>
            )}
          </div>

          {/* Low Stock Indicator: Only rendered if actually under 5 units */}
          {isLowStock && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center text-[10px] text-amber-700 font-medium">
                <span>Only {product.stock} left in stock</span>
              </div>
              <div className="w-full bg-amber-100 h-[3px] rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: `${(product.stock / 5) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Primary Action Button (42px height, 8px radius, Slate primary) */}
        <div className="pt-2 border-t border-slate-100">
          {inCartQty > 0 ? (
            <div className="flex items-center justify-between h-[42px] bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => updateCartQuantity(cartItem!.id, inCartQty - 1)}
                className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white text-slate-700 transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-[#0F172A]">{inCartQty} in Bag</span>
              <button
                type="button"
                disabled={inCartQty >= product.stock}
                onClick={() => updateCartQuantity(cartItem!.id, inCartQty + 1)}
                className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white text-slate-700 transition-colors cursor-pointer disabled:opacity-30"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() => addToCart(product.id, 1)}
              className="w-full h-[42px] rounded-lg bg-[#0F172A] hover:bg-[#1E293B] active:bg-[#0F172A] text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-xs disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Bag'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
