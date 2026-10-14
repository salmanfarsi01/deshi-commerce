import React from 'react';
import { Home, Grid, ShoppingBag, Package, User, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { currentView, setCurrentView, cart, openCart, openAuthModal, user } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-sm font-sans">
      <button
        type="button"
        onClick={() => setCurrentView('home')}
        className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
          currentView === 'home'
            ? 'bg-slate-100 text-[#0F172A]'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrentView('catalog')}
        className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
          currentView === 'catalog'
            ? 'bg-slate-100 text-[#0F172A]'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Grid className="w-4 h-4" />
        <span>Catalog</span>
      </button>

      <button
        type="button"
        onClick={openCart}
        className="relative flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
      >
        <div className="relative">
          <ShoppingBag className="w-4 h-4 text-slate-800" />
          {cart.itemCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#0F172A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cart.itemCount}
            </span>
          )}
        </div>
        <span>Bag</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrentView('orders')}
        className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
          currentView === 'orders'
            ? 'bg-slate-100 text-[#0F172A]'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Package className="w-4 h-4" />
        <span>Orders</span>
      </button>

      {user ? (
        <button
          type="button"
          onClick={() => setCurrentView('account')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
            currentView === 'account'
              ? 'bg-slate-100 text-[#0F172A]'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Account</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider text-slate-700 hover:text-[#0F172A] cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </button>
      )}
    </nav>
  );
};
