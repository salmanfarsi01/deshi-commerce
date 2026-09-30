import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  MapPin,
  User,
  Heart,
  ChevronDown,
  LogOut,
  Package,
  Bell,
  Menu,
  HelpCircle,
  Truck,
  Globe,
  X,
  LogIn,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    user,
    cart,
    wishlist,
    openCart,
    selectedRegion,
    setSelectedRegion,
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    selectedCategorySlug,
    setSelectedCategorySlug,
    openAuthModal,
    logout,
    lang,
    toggleLang,
    showToast,
    navigateTo,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState('All');

  const navCategories = [
    { slug: 'all', label: 'All Catalog' },
    { slug: 'mobile', label: 'Mobiles & Tablets' },
    { slug: 'electronics', label: 'Electronics & Gadget' },
    { slug: 'fashion', label: 'Fashion & Wear' },
    { slug: 'home-appliance', label: 'Appliances' },
    { slug: 'audio', label: 'Kitchen & Dining' },
    { slug: 'travel', label: 'Travel Accessories' },
    { slug: 'personal-care', label: 'Personal Care' },
    { slug: 'organic-grocery', label: 'Food & Grocery' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-xs">
      {/* 1. Top Micro Bar */}
      <div className="bg-[#0F172A] text-slate-300 px-4 sm:px-6 lg:px-8 py-1.5 text-xs font-normal border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left top items */}
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Deliver to <strong className="text-white font-medium">{selectedRegion === 'Dhaka' ? 'Dhaka 1209' : 'Outside Dhaka'}</strong>
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLocationMenuOpen && (
                <div className="absolute left-0 mt-1.5 w-64 bg-white text-[#0F172A] shadow-xl rounded-xl border border-[#E2E8F0] p-2 z-50 animate-in fade-in">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Select Bangladesh Delivery Zone
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRegion('Dhaka');
                      setIsLocationMenuOpen(false);
                    }}
                    className={`rounded-lg w-full text-left px-3 py-2 text-xs flex items-center justify-between cursor-pointer ${
                      selectedRegion === 'Dhaka'
                        ? 'bg-slate-100 text-[#0F172A] font-semibold border-l-2 border-[#0F172A]'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Inside Dhaka (24-48 hrs)</span>
                    <span className="font-mono text-xs font-bold text-[#0F172A]">৳ 60</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRegion('Outside Dhaka');
                      setIsLocationMenuOpen(false);
                    }}
                    className={`rounded-lg w-full text-left px-3 py-2 text-xs flex items-center justify-between cursor-pointer ${
                      selectedRegion === 'Outside Dhaka'
                        ? 'bg-slate-100 text-[#0F172A] font-semibold border-l-2 border-[#0F172A]'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Outside Dhaka (3-5 days)</span>
                    <span className="font-mono text-xs font-bold text-[#0F172A]">৳ 120</span>
                  </button>
                  <div className="mt-1 pt-1.5 border-t border-slate-100 text-[10px] text-emerald-700 px-2 font-semibold">
                    Orders over ৳5,000 get 100% FREE Delivery!
                  </div>
                </div>
              )}
            </div>

            <span className="hidden md:inline text-slate-700">|</span>

            <button
              type="button"
              onClick={() => showToast('Merchant seller onboarding is open! Call 09612-DESHI.', 'info')}
              className="hidden md:inline hover:text-white cursor-pointer transition-colors"
            >
              Sell on Deshi
            </button>

            <span className="hidden md:inline text-stone-500">|</span>

            <button
              type="button"
              onClick={() => setCurrentView('orders')}
              className="rounded-none hover:text-white cursor-pointer transition-colors"
            >
              Track order
            </button>

            <span className="hidden md:inline text-slate-700">|</span>

            <button
              type="button"
              onClick={() => navigateTo('/admin')}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Open Executive Admin Dashboard"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Admin Portal</span>
            </button>

            <span className="hidden sm:inline text-stone-500">|</span>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('faq-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setCurrentView('home');
                  setTimeout(() => {
                    document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 200);
                }
              }}
              className="rounded-none hidden sm:inline hover:text-white cursor-pointer transition-colors"
            >
              Help center / FAQ
            </button>
          </div>

          {/* Right top items */}
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-[#D4D4D4]">
            {/* Top Bar User Authentication Links */}
            {!user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="rounded-none hover:text-white font-bold cursor-pointer transition-colors"
                >
                  Sign In
                </button>
                <span className="text-stone-500">/</span>
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className="rounded-none text-rose-300 hover:text-white font-bold cursor-pointer transition-colors"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 text-xs">
                <span>Welcome, <strong className="text-white">{user.name.split(' ')[0]}</strong></span>
                <span className="text-stone-500">·</span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-none text-stone-400 hover:text-rose-400 cursor-pointer font-bold"
                >
                  Sign Out
                </button>
              </div>
            )}

            <span className="hidden sm:inline text-stone-500">|</span>

            <button
              type="button"
              onClick={() => showToast('You have 2 new flash sale discounts available today!', 'info')}
              className="hidden sm:flex items-center gap-1 hover:text-white cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              <span>Notifications</span>
            </button>

            <span className="hidden sm:inline text-slate-700">|</span>

            <button
              type="button"
              onClick={toggleLang}
              className="flex items-center gap-1 hover:text-white cursor-pointer"
            >
              <Globe className="w-3 h-3 text-slate-400" />
              <span>{lang === 'en' ? 'বাংলা / EN' : 'EN / বাংলা'}</span>
            </button>

            <span className="text-slate-700">|</span>

            <span className="font-semibold text-white">BDT ৳</span>
          </div>
        </div>
      </div>

      {/* 2. Main Search Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Name (Geometric clean sans-serif) */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => {
                setCurrentView('home');
                setSelectedCategorySlug('all');
              }}
              className="text-left cursor-pointer group"
            >
              <span className="text-2xl font-bold tracking-tight text-[#0F172A] font-sans uppercase">
                Deshi Commerce
              </span>
            </button>
          </div>

          {/* Search Bar (44px height, subtle gray background, soft focus ring) */}
          <div className="flex-1 max-w-2xl mx-2 hidden md:block">
            <div className="flex items-center h-11 border border-[#E2E8F0] bg-[#F8FAFC] focus-within:border-slate-400 focus-within:bg-white rounded-lg overflow-hidden shadow-2xs transition-all">
              {/* Inside Search Category Dropdown */}
              <div className="relative border-r border-[#E2E8F0] bg-slate-100/70 h-full flex items-center">
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="h-full px-3.5 text-xs font-semibold text-[#0F172A] flex items-center gap-1.5 cursor-pointer whitespace-nowrap hover:bg-slate-200/60 transition-colors"
                >
                  <span>{searchCategory}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-[#E2E8F0] rounded-lg shadow-lg py-1 z-50">
                    {['All', 'Phones & Gadgets', 'Fashion', 'Appliances', 'Organics'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setSearchCategory(c);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentView !== 'catalog' && currentView !== 'home') {
                    setCurrentView('catalog');
                  }
                }}
                placeholder="Search phones, beauty, home & more..."
                className="flex-1 px-3.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none bg-transparent"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Search Button (Slate Primary) */}
              <button
                type="button"
                onClick={() => {
                  if (currentView !== 'catalog') setCurrentView('catalog');
                }}
                className="h-full px-5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Right Action Widgets: Sign in, Wishlist, Cart */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* User / Sign In & Sign Up */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="rounded-lg flex items-center gap-2 p-1.5 border border-transparent hover:border-[#E2E8F0] hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-300"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      {user.authProvider === 'google' && (
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center shadow-xs border border-slate-200">
                          <span className="text-[8px] font-black text-blue-600">G</span>
                        </div>
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Account</div>
                      <div className="text-xs font-bold text-[#0F172A] max-w-[90px] truncate leading-tight">
                        {user.name.split(' ')[0]}
                      </div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-1.5 z-50 animate-in zoom-in-95 duration-100">
                      <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/80 rounded-t-lg">
                        <div className="text-xs font-bold text-[#0F172A] truncate">{user.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">{user.email || user.phone}</div>
                        {user.authProvider === 'google' && (
                          <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px] font-bold uppercase tracking-wider">
                            <span>Google Mail Connected</span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('orders');
                          setIsUserMenuOpen(false);
                        }}
                        className="rounded-lg w-full text-left px-3 py-2 text-xs text-[#0F172A] hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Package className="w-3.5 h-3.5 text-slate-600" />
                        <span>My Orders</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('account');
                          setIsUserMenuOpen(false);
                        }}
                        className="rounded-lg w-full text-left px-3 py-2 text-xs text-[#0F172A] hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-slate-600" />
                        <span>Account &amp; Addresses</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigateTo('/admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="rounded-lg w-full text-left px-3 py-2 text-xs text-rose-700 bg-rose-50/80 hover:bg-rose-100 flex items-center justify-between cursor-pointer font-bold transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                          <span>Admin Control Panel</span>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 font-extrabold uppercase">
                          Portal
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          openAuthModal('login');
                          setIsUserMenuOpen(false);
                        }}
                        className="rounded-lg w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <LogIn className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sign in with another account</span>
                      </button>

                      <div className="my-1 border-t border-slate-100"></div>

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="rounded-lg w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold uppercase tracking-wider"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="rounded-lg px-3.5 py-2 border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-50 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openAuthModal('register')}
                    className="rounded-lg hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              type="button"
              onClick={() => {
                showToast(`Wishlist has ${wishlist.length} saved items`, 'info');
                setCurrentView('catalog');
              }}
              className="relative flex flex-col items-center text-xs font-medium text-slate-700 hover:text-[#0F172A] cursor-pointer transition-colors"
            >
              <div className="relative">
                <Heart className="w-5 h-5 text-slate-700" />
                {wishlist.length > 0 && (
                  <span className="rounded-full absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium mt-0.5">Wishlist</span>
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={openCart}
              className="relative flex flex-col items-center text-xs font-medium text-slate-700 hover:text-[#0F172A] cursor-pointer transition-colors"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-slate-700" />
                {cart.itemCount > 0 && (
                  <span className="rounded-full absolute -top-1.5 -right-2 bg-[#0F172A] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center">
                    {cart.itemCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium mt-0.5">Cart</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2.5 md:hidden">
          <div className="flex h-10 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] overflow-hidden focus-within:border-slate-400">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentView !== 'catalog' && currentView !== 'home') {
                  setCurrentView('catalog');
                }
              }}
              placeholder="Search in Bangladesh..."
              className="flex-1 px-3 py-2 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => {
                if (currentView !== 'catalog') setCurrentView('catalog');
              }}
              className="px-4 bg-[#0F172A] text-white text-xs font-semibold"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Categories Navigation Ribbon Bar (Light, subtle bordered All Categories button) */}
      <div className="border-t border-[#E2E8F0] bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1.5">
          {/* All Categories Dropdown Button (Subtle bordered light button) */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategorySlug('all');
              if (currentView !== 'catalog') setCurrentView('catalog');
            }}
            className="rounded-lg bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] text-xs font-semibold px-3.5 py-1.5 flex items-center gap-2 shrink-0 cursor-pointer transition-colors shadow-2xs"
          >
            <Menu className="w-4 h-4 text-slate-700" />
            <span>All Categories</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Horizontal Category Text Links */}
          <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap pl-2">
            {navCategories.slice(1).map((cat) => {
              const isActive = selectedCategorySlug === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => {
                    setSelectedCategorySlug(cat.slug);
                    if (currentView !== 'catalog') setCurrentView('catalog');
                  }}
                  className={`px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                    isActive
                      ? 'text-[#0F172A] font-bold border-b-2 border-[#0F172A]'
                      : 'text-slate-600 hover:text-[#0F172A]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
