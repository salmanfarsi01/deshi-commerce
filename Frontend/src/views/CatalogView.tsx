import React, { useState, useEffect } from 'react';
import {
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Search,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Truck,
  ShieldCheck,
  Clock,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { FAQSection } from '../components/FAQSection';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiClient';
import { Product, Category } from '../types';
import { formatBDT } from '../data/bangladeshGeo';

export const CatalogView: React.FC<{ isLanding?: boolean }> = ({ isLanding = false }) => {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategorySlug,
    setSelectedCategorySlug,
    viewProductDetail,
    setCurrentView,
    t,
    lang,
  } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(160000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating_desc' | 'newest'>('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Hero carousel mini index
  const [heroSlide, setHeroSlide] = useState(0);

  // Live Flash Sale Countdown Timer (Hours, Minutes, Seconds)
  const [timeLeft, setTimeLeft] = useState({
    hours: 24,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch categories
  useEffect(() => {
    apiService.categories.getAll().then((res) => {
      setCategories(res.data);
    });
  }, []);

  // Fetch products with filters
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    apiService.products
      .getAll({
        category: selectedCategorySlug === 'all' ? undefined : selectedCategorySlug,
        search: searchQuery.trim() || undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 160000 ? maxPrice : undefined,
        availability: inStockOnly || undefined,
        sort: sortBy,
      })
      .then((res) => {
        if (!isCancelled) {
          setProducts(res.data.products);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedCategorySlug, searchQuery, minPrice, maxPrice, inStockOnly, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategorySlug('all');
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(160000);
    setInStockOnly(false);
    setSortBy('popular');
  };

  // Hero products showcase
  const heroShowcaseItems = [
    {
      title: 'Aarong Festive Embroidered Panjabi',
      slug: 'aarong-festive-panjabi',
      store: 'Feminine & Heritage Store',
      price: 3999,
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Samsung Galaxy A55 5G (8GB/128GB)',
      slug: 'samsung-galaxy-a55-5g',
      store: 'Official Samsung Flagship',
      price: 41999,
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Authentic Handloom Dhakai Jamdani Saree',
      slug: 'dhakai-jamdani-saree',
      store: 'Demra Heritage Weavers',
      price: 8200,
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const currentHeroItem = heroShowcaseItems[heroSlide % heroShowcaseItems.length];

  return (
    <div className="min-h-screen pb-16 bg-[#F8FAFC]">
      {/* 1. HERO CAMPAIGN SECTION (Polished 2-Column Split) */}
      {isLanding && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left Big Dark Banner */}
            <div className="lg:col-span-8 bg-[#0F172A] text-white p-6 sm:p-8 rounded-2xl border border-slate-800 flex flex-col justify-between relative overflow-hidden shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left text column */}
                <div className="md:col-span-7 space-y-4 z-10">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
                    {lang === 'bn' ? 'আসল পণ্যের নিশ্চয়তা, সরাসরি আপনার দরজায়' : 'Authentic Quality, Direct to Your Doorstep'}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                    {lang === 'bn'
                      ? 'সারাদেশে ক্যাশ অন ডেলিভারি এবং নিরাপদ SSLCommerz পেমেন্ট সুবিধা।'
                      : 'Trusted nationwide delivery with cash on delivery & secure SSLCommerz payments.'}
                  </p>

                  {/* 1 Insightful Trust Text (Replaced wordy 3 boxes) */}
                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2.5 text-xs text-slate-300 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/80">
                      <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>
                        {lang === 'bn'
                          ? '১০০% আসল পণ্য · ক্যাশ অন ডেলিভারি · ৬৪ জেলায় ৭ দিনের রিটার্ন সুবিধা'
                          : '100% Genuine Products · Cash on Delivery · 7-Day Easy Returns Across All 64 Districts'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('catalog-grid');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="rounded-lg px-6 py-3 bg-white text-[#0F172A] hover:bg-slate-100 font-semibold text-xs tracking-wider flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <span>{t('hero.shopnow', 'Shop Now')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-900" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentView('catalog')}
                      className="rounded-lg px-5 py-3 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
                    >
                      Browse Catalog
                    </button>
                  </div>
                </div>

                {/* Right Interactive Showcase (Clean full photo, no crammed nested mini-card) */}
                <div className="md:col-span-5 relative z-10 flex flex-col justify-center">
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900/60 border border-slate-700/80 shadow-xl group">
                    <img
                      src={currentHeroItem.image}
                      alt={currentHeroItem.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

                    {/* Store badge pill */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-200 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700/80 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>{currentHeroItem.store}</span>
                      </span>
                    </div>

                    {/* Nav arrows */}
                    <button
                      type="button"
                      onClick={() => setHeroSlide((prev) => (prev > 0 ? prev - 1 : heroShowcaseItems.length - 1))}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center cursor-pointer shadow-md backdrop-blur-xs transition-colors border border-slate-700"
                      aria-label="Previous showcase product"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroSlide((prev) => prev + 1)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center cursor-pointer shadow-md backdrop-blur-xs transition-colors border border-slate-700"
                      aria-label="Next showcase product"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-3 left-3 right-3 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-3 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <h4 className="text-xs font-semibold text-white truncate">{currentHeroItem.title}</h4>
                        <div className="text-sm font-bold text-white font-mono tabular-nums">
                          {formatBDT(currentHeroItem.price)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => viewProductDetail(currentHeroItem.slug)}
                        className="rounded-md px-3 py-1.5 bg-white hover:bg-slate-100 text-[#0F172A] font-semibold text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-colors shadow-2xs"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-900" />
                      </button>
                    </div>
                  </div>

                  {/* Indicator dots */}
                  <div className="flex justify-center gap-1.5 mt-3">
                    {heroShowcaseItems.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setHeroSlide(i)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          heroSlide % heroShowcaseItems.length === i
                            ? 'w-5 bg-white'
                            : 'w-1.5 bg-slate-600 hover:bg-slate-500'
                        }`}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Stacked 2 Eye-Catchy Promo Cards */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Card 1: 100% Cash on Delivery */}
              <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 rounded-2xl border border-slate-700/80 shadow-md hover:shadow-xl hover:border-rose-500/40 transition-all flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-rose-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />

                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      Zero Prepayment Risk
                    </span>
                    <h3 className="text-lg font-black tracking-tight text-white pt-1">
                      100% Cash on Delivery
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-[210px]">
                      Pay in cash when your order arrives at your door
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-slate-800/90 text-rose-400 border border-slate-700 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>

                <div className="pt-4 relative z-10">
                  <button
                    type="button"
                    onClick={() => setCurrentView('catalog')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-100 text-[#0F172A] rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all group-hover:gap-2.5 cursor-pointer"
                  >
                    <span>Shop Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-900" />
                  </button>
                </div>
              </div>

              {/* Card 2: Nationwide Delivery */}
              <div className="flex-1 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0A0A1A] p-6 rounded-2xl border border-indigo-900/60 shadow-md hover:shadow-xl hover:border-indigo-500/50 transition-all flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/15 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />

                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      All 64 Districts Express
                    </span>
                    <h3 className="text-lg font-black tracking-tight text-white pt-1">
                      Nationwide Delivery
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-[210px]">
                      Fast 24-72h dispatch across all 64 districts
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-slate-800/90 text-indigo-400 border border-indigo-800/60 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <Truck className="w-6 h-6" />
                  </div>
                </div>

                <div className="pt-4 relative z-10">
                  <button
                    type="button"
                    onClick={() => setCurrentView('catalog')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all group-hover:gap-2.5 cursor-pointer"
                  >
                    <span>Shop Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. FLASH SALE / LIMITED TIME BANNER (Sleek Midnight Slate & Crisp Timer) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-[#0F172A] text-white p-5 sm:p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                LIMITED TIME · UP TO 70% OFF
              </div>
              <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
                Flash Sale
              </h2>
            </div>
          </div>

          <div className="hidden lg:block text-xs text-slate-300 max-w-sm font-normal">
            Curated picks at all-time-low prices. Stock updates continuously — once sold out, deals expire immediately.
          </div>

          {/* Countdown Clock & View All Button */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">ENDS IN</span>
              <div className="flex items-center gap-1.5">
                <div className="bg-[#1E293B] border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-center min-w-[42px]">
                  <span className="font-mono font-bold text-sm text-white tabular-nums">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="block text-[8px] uppercase text-slate-400 font-semibold tracking-wider">HR</span>
                </div>
                <span className="font-bold text-slate-600">:</span>
                <div className="bg-[#1E293B] border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-center min-w-[42px]">
                  <span className="font-mono font-bold text-sm text-white tabular-nums">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="block text-[8px] uppercase text-slate-400 font-semibold tracking-wider">MIN</span>
                </div>
                <span className="font-bold text-slate-600">:</span>
                <div className="bg-[#1E293B] border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-center min-w-[42px]">
                  <span className="font-mono font-bold text-sm text-white tabular-nums">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="block text-[8px] uppercase text-slate-400 font-semibold tracking-wider">SEC</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedCategorySlug('all');
                const el = document.getElementById('catalog-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-lg px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. CATALOG & PRODUCT GRID */}
      <div id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Mobile filter bar */}
        <div className="md:hidden flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="rounded-lg flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E2E8F0] text-xs font-semibold uppercase text-[#0F172A]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-700" />
            <span>Filters</span>
          </button>
          <div className="text-xs text-slate-500 font-mono">
            {products.length} products
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* FILTER SIDEBAR (Midnight Slate brand alignment) */}
          <aside
            className={`md:col-span-3 lg:col-span-3 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-6 ${
              isMobileFilterOpen ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-700" />
                <span>Filter Catalog</span>
              </h3>
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-md text-xs text-slate-500 hover:text-[#0F172A] flex items-center gap-1 font-semibold cursor-pointer uppercase tracking-wider transition-colors"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Reset</span>
              </button>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
                Categories
              </label>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategorySlug('all')}
                  className={`rounded-lg w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer border ${
                    selectedCategorySlug === 'all'
                      ? 'bg-slate-100 text-[#0F172A] font-semibold border-slate-300'
                      : 'text-slate-600 border-transparent hover:bg-slate-50'
                  }`}
                >
                  <span>All Categories</span>
                  {selectedCategorySlug === 'all' && <Check className="w-3.5 h-3.5 text-[#0F172A]" />}
                </button>

                {categories.map((cat) => {
                  const isSelected = selectedCategorySlug === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategorySlug(cat.slug)}
                      className={`rounded-lg w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer border ${
                        isSelected
                          ? 'bg-slate-100 text-[#0F172A] font-semibold border-slate-300'
                          : 'text-slate-600 border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({cat.productCount ?? 0})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range (Primary Midnight Slate accent) */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                Price Range (BDT)
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="160000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#0F172A] cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs font-mono font-medium text-slate-600">
                  <span>৳ 0</span>
                  <span className="text-[#0F172A] bg-slate-50 px-2 py-0.5 border border-[#E2E8F0] rounded-md font-semibold">
                    Up to {formatBDT(maxPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* In Stock Only */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#0F172A]"
                />
                <span>In Stock Items Only</span>
              </label>
            </div>
          </aside>

          {/* MAIN PRODUCT LISTING */}
          <main className="md:col-span-9 lg:col-span-9 space-y-6">
            {/* Top Sort & Count Bar */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-normal">
                Showing <strong className="text-[#0F172A] font-semibold font-mono">{products.length}</strong> products
                {selectedCategorySlug !== 'all' && (
                  <span> in <strong className="text-[#0F172A] font-semibold">{selectedCategorySlug}</strong></span>
                )}
                {searchQuery && (
                  <span> matching "<strong className="text-[#0F172A] font-semibold">{searchQuery}</strong>"</span>
                )}
              </div>

              {/* Sort by dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="rounded-lg bg-slate-50 border border-[#E2E8F0] px-3 py-1.5 text-xs text-[#0F172A] font-medium focus:outline-none cursor-pointer"
                >
                  <option value="popular">Popularity / Deals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Top Rated</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Product Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3 animate-pulse">
                    <div className="aspect-square bg-slate-100 rounded-lg w-full" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-5 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center shadow-2xs">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-200">
                  <Search className="w-6 h-6 text-slate-500" />
                </div>
                <h4 className="font-semibold text-[#0F172A] text-base mb-1">No products match your filters</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Try adjusting your price range, clearing your search query, or selecting another category.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-lg px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 4. FAQ ACCORDION SECTION (Explicitly requested by user) */}
      <div className="mt-16">
        <FAQSection />
      </div>
    </div>
  );
};
