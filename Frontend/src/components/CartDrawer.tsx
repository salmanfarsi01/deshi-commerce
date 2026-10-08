import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus, Truck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatBDT, calculateDeliveryFee } from '../data/bangladeshGeo';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    selectedRegion,
    setCurrentView,
  } = useApp();

  if (!isCartOpen) return null;

  const deliveryFee = calculateDeliveryFee(selectedRegion === 'Dhaka' ? 'Dhaka' : 'Chattogram', cart.subtotal);
  const totalWithDelivery = cart.subtotal + deliveryFee;
  const progressPercent = Math.min(100, Math.round((cart.subtotal / cart.freeDeliveryThreshold) * 100));

  const handleProceedToCheckout = () => {
    closeCart();
    setCurrentView('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-[#D4D4D4]">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0F172A]" />
              <h2 className="font-bold text-[#0F172A] text-base uppercase tracking-tight">Shopping Bag</h2>
              <span className="text-xs bg-slate-100 text-[#0F172A] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                {cart.itemCount} items
              </span>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="rounded-none p-1.5 text-stone-500 hover:text-[#2B2B2B] hover:bg-[#EAEAEA] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Progress Bar */}
          <div className="p-4 bg-rose-50/50 border-b border-rose-200">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-[#2B2B2B] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#E11D48]" />
                {cart.eligibleForFreeDelivery ? (
                  <span className="font-bold text-slate-900">You qualify for 100% FREE Delivery!</span>
                ) : (
                  <span>
                    Add <strong className="text-[#E11D48] font-mono">{formatBDT(cart.amountNeededForFreeDelivery)}</strong> more for <strong>FREE Delivery</strong>
                  </span>
                )}
              </span>
              <span className="font-mono text-[11px] text-stone-800 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#D4D4D4] h-2 rounded-none overflow-hidden">
              <div
                className="bg-gradient-to-r from-orange-500 to-[#E11D48] h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-[#D4D4D4]/60">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                <div className="w-16 h-16 bg-slate-50 flex items-center justify-center mb-3 border border-slate-200 rounded-2xl">
                  <ShoppingBag className="w-8 h-8 text-[#0F172A]" />
                </div>
                <h3 className="font-bold text-[#2B2B2B] text-base mb-1">Your bag is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mb-4">
                  Browse through authentic Bangladeshi garments, gadgets, organics, and home appliances.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    setCurrentView('catalog');
                  }}
                  className="rounded-none px-4 py-2 bg-[#2B2B2B] text-white text-xs font-bold hover:bg-[#E11D48] transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div key={item.id} className="py-3.5 flex gap-3.5 items-start">
                  <div className="w-16 h-16 bg-stone-100 overflow-hidden shrink-0 border border-[#D4D4D4]">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#2B2B2B] line-clamp-2 leading-tight">
                      {item.product.name}
                    </h4>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Unit: <span className="font-mono text-stone-800 font-semibold">{formatBDT(item.price)}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg p-0.5 text-xs font-medium">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="rounded-md w-6 h-6 flex items-center justify-center hover:bg-white text-slate-700 transition-colors cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-6 text-center tabular-nums font-bold text-[#0F172A]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= item.product.stock}
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="rounded-md w-6 h-6 flex items-center justify-center hover:bg-white text-slate-700 transition-colors cursor-pointer disabled:opacity-30"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {/* Total for item & trash button */}
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs text-[#0F172A] tabular-nums">
                          {formatBDT(item.totalPrice)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="rounded-md text-slate-400 hover:text-red-700 p-1 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.itemCount} items)</span>
                  <span className="font-mono font-bold text-[#2B2B2B] tabular-nums">
                    {formatBDT(cart.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Estimated Delivery ({selectedRegion})</span>
                  {deliveryFee === 0 ? (
                    <span className="font-bold text-[#E11D48] bg-rose-50 px-2 py-0.5 border border-rose-200 text-[11px]">
                      FREE
                    </span>
                  ) : (
                    <span className="font-mono text-stone-800 font-bold tabular-nums">
                      {formatBDT(deliveryFee)}
                    </span>
                  )}
                </div>
                <div className="pt-2 border-t border-[#D4D4D4] flex justify-between items-baseline font-bold text-sm text-[#2B2B2B]">
                  <span>Estimated Total</span>
                  <span className="text-base text-[#E11D48] font-mono tabular-nums font-bold">
                    {formatBDT(totalWithDelivery)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={clearCart}
                  className="rounded-none px-3 py-3 text-xs font-bold text-stone-600 hover:text-[#2B2B2B] hover:bg-white border border-[#D4D4D4] transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="rounded-none flex-1 py-3 px-4 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider shadow-xs"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
