import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Search,
  MapPin,
  User,
  Heart,
  ChevronDown,
  LogOut,
  Package,
  Globe,
  X,
  LogIn,
  UserPlus,
  Menu,
  HelpCircle,
  Headphones,
  Shield,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiClient';
import { Product } from '../types';
import { formatBDT } from '../data/bangladeshGeo';
import mainLogo from '../images/main_logo.png';

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
    openSupportModal,
    openChat,
    chatUnreadCount,
    logout,
    navigateTo,
    viewProductDetail,
    lang,
    toggleLang,
    t,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Search Autocomplete state
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  const navCategories = [
    { slug: 'all', key: 'cat.all', label: 'All Catalog' },
    { slug: 'mobile', key: 'cat.mobile', label: 'Mobiles & Tablets' },
    { slug: 'electronics', key: 'cat.electronics', label: 'Electronics & Gadgets' },
    { slug: 'fashion', key: 'cat.fashion', label: 'Fashion & Wear' },
    { slug: 'home-appliance', key: 'cat.appliances', label: 'Home Appliances' },
    { slug: 'audio', key: 'cat.kitchen', label: 'Audio & Kitchen' },
    { slug: 'travel', key: 'cat.travel', label: 'Travel Accessories' },
    { slug: 'personal-care', key: 'cat.personalcare', label: 'Personal Care' },
    { slug: 'organic-grocery', key: 'cat.grocery', label: 'Food & Grocery' },
  ];

  // Live autocomplete query
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      apiService.products.getAll({ search: searchQuery.trim() }).then((res) => {
        if (res.data?.products) {
          setSearchSuggestions(res.data.products.slice(0, 5));
        }
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (product: Product) => {
    setIsSearchFocused(false);
    viewProductDetail(product.slug);
  };

  const handleExecuteSearch = () => {
    setIsSearchFocused(false);
    if (currentView !== 'catalog') {
      setCurrentView('catalog');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-xs font-sans">
      {/* Top Main Header Row (Aligned, compact & prominent search) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                setCurrentView('home');
                setSelectedCategorySlug('all');
              }}
              className="text-left cursor-pointer group flex items-center"
              title="Deshi Commerce"
            >
              <img
                src={mainLogo}
                alt="Deshi Commerce"
                className="h-8 sm:h-9 w-auto object-contain hover:opacity-90 transition-opacity"
              />
            </button>
          </div>

          {/* Wide Primary Search Bar with Real-Time Autocomplete */}
          <div ref={searchContainerRef} className="flex-1 max-w-xl hidden md:block relative">
            <div className="flex items-center h-10 border border-slate-300 bg-white focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/5 rounded-lg pl-3.5 pr-1 transition-all shadow-2xs">
              <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleExecuteSearch();
                  if (e.key === 'Escape') setIsSearchFocused(false);
                }}
                placeholder={t('header.search.placeholder', 'Search phones, electronics, fashion, groceries...')}
                className="flex-1 text-xs sm:text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none bg-transparent"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchSuggestions([]);
                  }}
                  className="p-1 mr-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded-full"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleExecuteSearch}
                className="h-8 px-4 rounded-md bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <span>{t('header.search.button', 'Search')}</span>
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in">
                {searchSuggestions.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    <div className="px-3.5 py-1.5 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Matching Products</span>
                      <span className="text-[10px] text-slate-400 font-normal">Press Enter to view all</span>
                    </div>
                    {searchSuggestions.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectSuggestion(item)}
                        className="px-3.5 py-2.5 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt={item.name} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-xs">📦</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-[#0F172A] truncate">{item.name}</h4>
                          <span className="text-[11px] text-slate-500 capitalize">{item.categoryName || item.categoryId} · {item.brand}</span>
                        </div>
                        <div className="text-xs font-bold text-[#0F172A] font-mono shrink-0">
                          {formatBDT(item.discountPrice || item.price)}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleExecuteSearch}
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-center text-xs font-semibold text-[#0F172A] flex items-center justify-center gap-1.5 cursor-pointer border-t border-slate-200"
                    >
                      <span>View all results for "{searchQuery}"</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : searchQuery.trim().length >= 2 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No products found matching "{searchQuery}". Try browsing categories.
                  </div>
                ) : (
                  <div className="p-3">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-slate-400" />
                      <span>Popular Searches in Bangladesh</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['Samsung A55', 'Aarong Panjabi', 'Smart Watch', 'Wireless Earbuds', 'Jamdani Saree', 'Cold Pressed Juice'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setSearchQuery(tag);
                            handleExecuteSearch();
                          }}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Header Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Delivery Zone Selector */}
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-[#0F172A] px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {t('header.location.deliverto', 'Deliver to')}: <strong className="text-[#0F172A] font-bold">{selectedRegion === 'Dhaka' ? 'Dhaka' : 'Outside'}</strong>
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLocationMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white text-[#0F172A] shadow-xl rounded-xl border border-[#E2E8F0] p-2 z-50 animate-in fade-in">
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
                        ? 'bg-slate-100 text-[#0F172A] font-bold border-l-2 border-[#0F172A]'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{t('header.location.dhaka', 'Inside Dhaka (24-48 hrs)')}</span>
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
                        ? 'bg-slate-100 text-[#0F172A] font-bold border-l-2 border-[#0F172A]'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{t('header.location.outsidedhaka', 'Outside Dhaka (3-5 days)')}</span>
                    <span className="font-mono text-xs font-bold text-[#0F172A]">৳ 120</span>
                  </button>
                  <div className="mt-1 pt-1.5 border-t border-slate-100 text-[10px] text-slate-600 px-2 font-semibold">
                    {t('header.location.freedelivery', 'Orders over ৳5,000 get 100% FREE Delivery!')}
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
              title="Change Language (বাংলা / English)"
            >
              <Globe className="w-3.5 h-3.5 text-slate-600" />
              <span>{lang === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Account / User Menu */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover border border-[#E2E8F0]"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-bold text-[#0F172A] hidden sm:inline max-w-[90px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl border border-[#E2E8F0] py-2 z-50 animate-in fade-in">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <span className="font-bold text-xs text-[#0F172A] block truncate">{user.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono block truncate">{user.phone || user.email}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('orders');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-[#0F172A] hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Package className="w-3.5 h-3.5 text-slate-600" />
                        <span>{t('header.myorders', 'My Orders')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('account');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-[#0F172A] hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-slate-600" />
                        <span>{t('header.addresses', 'Account & Addresses')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          openSupportModal();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-[#0F172A] hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Headphones className="w-3.5 h-3.5 text-slate-600" />
                        <span>{lang === 'bn' ? 'কাস্টমার সাপোর্ট' : 'Contact Support'}</span>
                      </button>

                      {user.role === 'ADMIN' && (
                        <button
                          type="button"
                          onClick={() => {
                            navigateTo('/admin');
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-bold"
                        >
                          <Shield className="w-3.5 h-3.5 text-rose-600" />
                          <span>Admin Console</span>
                        </button>
                      )}

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('header.signout', 'Sign Out')}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-[#0F172A] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {t('header.signin', 'Sign In')}
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal('register')}
                    className="hidden sm:inline-flex px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {t('header.signup', 'Sign Up')}
                  </button>
                </div>
              )}
            </div>

            {/* Support Live Chat Launcher */}
            <button
              type="button"
              onClick={openChat}
              className="relative hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-[#0F172A] transition-colors cursor-pointer"
              title="Customer Support Live Chat"
            >
              <Headphones className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden md:inline">{lang === 'bn' ? 'সাপোর্ট' : 'Support'}</span>
              {chatUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {chatUnreadCount}
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button
              type="button"
              onClick={() => setCurrentView('wishlist')}
              className="relative p-2 rounded-lg text-slate-700 hover:text-[#0F172A] hover:bg-slate-50 cursor-pointer transition-colors"
              title={lang === 'bn' ? 'পছন্দের পণ্যসমূহ' : 'Saved Wishlist'}
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'text-rose-600 fill-rose-50' : 'text-slate-700 hover:text-rose-600'}`} />
              {wishlist.length > 0 && (
                <span className="rounded-full absolute top-0.5 right-0.5 bg-rose-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={openCart}
              className="relative flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0F172A] rounded-lg transition-colors cursor-pointer font-bold text-xs"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#0F172A]" />
              <span className="hidden sm:inline">{t('header.cart', 'Cart')}</span>
              {cart.itemCount > 0 && (
                <span className="rounded-full bg-[#0F172A] text-white text-[10px] font-bold px-1.5 py-0.2 min-w-[18px] text-center">
                  {cart.itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Compact Mobile Search Input */}
        <div className="mt-2.5 md:hidden">
          <div className="flex items-center h-9.5 border border-slate-300 rounded-lg bg-white pl-3 pr-1 focus-within:border-slate-900 shadow-2xs transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentView !== 'catalog' && currentView !== 'home') {
                  setCurrentView('catalog');
                }
              }}
              placeholder={t('header.search.placeholder', 'Search in Bangladesh...')}
              className="flex-1 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 mr-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={handleExecuteSearch}
              className="h-7 px-3 rounded-md bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center shrink-0 cursor-pointer"
            >
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories Navigation Bar: Clean row with clear active state */}
      <div className="border-t border-slate-100 bg-white px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-start lg:justify-center gap-1.5 sm:gap-2 text-xs font-medium w-max lg:w-full min-w-full">
            <button
              type="button"
              onClick={() => {
                setSelectedCategorySlug('all');
                if (currentView !== 'catalog') setCurrentView('catalog');
              }}
              className={`rounded-md px-3 py-1.5 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 text-xs font-semibold ${
                selectedCategorySlug === 'all'
                  ? 'bg-[#0F172A] text-white shadow-2xs'
                  : 'bg-white text-slate-700 hover:text-[#0F172A] hover:bg-slate-100'
              }`}
            >
              <Menu className="w-3.5 h-3.5" />
              <span>{t('header.categories.all', 'All Categories')}</span>
            </button>

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
                  className={`rounded-md px-3 py-1.5 text-xs transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#0F172A] text-white font-bold shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 font-medium'
                  }`}
                >
                  {t(cat.key, cat.label)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
