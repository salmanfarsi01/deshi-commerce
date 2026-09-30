import React from 'react';
import { Home, Grid, ShoppingBag, Package, User, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { currentView, setCurrentView, cart, openCart, openAuthModal, user } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#D4D4D4] px-2 py-2 flex items-center justify-around shadow-lg">
      <button
        type="button"
        onClick={() => setCurrentView('home')}
        className={`rounded-none flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
          currentView === 'home' ? 'text-[#E11D48]' : 'text-stone-500 hover:text-[#2B2B2B]'
        }`}
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrentView('catalog')}
        className={`rounded-none flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
          currentView === 'catalog' ? 'text-[#E11D48]' : 'text-stone-500 hover:text-[#2B2B2B]'
        }`}
      >
        <Grid className="w-4 h-4" />
        <span>Catalog</span>
      </button>

      <button
        type="button"
        onClick={openCart}
        className="rounded-none relative flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-700 hover:text-[#E11D48] transition-colors cursor-pointer"
      >
        <div className="relative">
          <ShoppingBag className="w-4 h-4" />
          {cart.itemCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#E11D48] text-white text-[9px] font-bold w-4 h-4 rounded-none flex items-center justify-center">
              {cart.itemCount}
            </span>
          )}
        </div>
        <span>Bag</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrentView('orders')}
        className={`rounded-none flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
          currentView === 'orders' ? 'text-[#E11D48]' : 'text-stone-500 hover:text-[#2B2B2B]'
        }`}
      >
        <Package className="w-4 h-4" />
        <span>Orders</span>
      </button>

      {user ? (
        <button
          type="button"
          onClick={() => setCurrentView('account')}
          className={`rounded-none flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            currentView === 'account' ? 'text-[#E11D48]' : 'text-stone-500 hover:text-[#2B2B2B]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Account</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="rounded-none flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#E11D48] cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In</span>
        </button>
      )}
    </nav>
  );
};

