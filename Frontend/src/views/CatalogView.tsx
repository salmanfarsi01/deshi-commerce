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
  Truck,
  ShieldCheck,
  Banknote,
  RotateCcw as ReturnIcon,
  CheckCircle2,
  Smartphone,
  Laptop,
  ShoppingBag,
  Tv,
  Headphones,
  Apple,
  Sparkles,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiClient';
import { Product, Category, FlashSaleCampaign } from '../types';
import { SpecialOffersBannerCarousel } from '../components/SpecialOffersBannerCarousel';
import { formatBDT } from '../data/bangladeshGeo';
import { HeroShowcaseItem, INITIAL_HERO_SHOWCASE } from '../services/dbStorage';

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

  // Hero showcase index
  const [heroSlide, setHeroSlide] = useState(0);

  // Dynamic Flash Sale Campaign State
  const [flashCampaign, setFlashCampaign] = useState<FlashSaleCampaign | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    apiService.flashSale.getCampaign().then((res) => {
      if (res.data) setFlashCampaign(res.data);
    });
  }, []);

  useEffect(() => {
    if (!flashCampaign || !flashCampaign.enabled || !flashCampaign.endDate) {
      return;
    }

    const calculateTime = () => {
      const diff = new Date(flashCampaign.endDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [flashCampaign]);

  // Participating Flash Sale Products
  const flashSaleProducts = React.useMemo(() => {
    if (!flashCampaign || !flashCampaign.enabled || timeLeft.isExpired) return [];
    return products.filter((p) => {
      if (flashCampaign.productIds && flashCampaign.productIds.length > 0) {
        return flashCampaign.productIds.includes(p.id);
      }
      if (p.isFlashDeal) return true;
      if (flashCampaign.includeMatchingDiscount && p.price && p.discountPrice) {
        const discountPct = Math.round(((p.price - p.discountPrice) / p.price) * 100);
        return discountPct >= flashCampaign.discountPercentage;
      }
      return false;
    });
  }, [products, flashCampaign, timeLeft.isExpired]);

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
  const [heroShowcaseItems, setHeroShowcaseItems] = useState<HeroShowcaseItem[]>(INITIAL_HERO_SHOWCASE);

  useEffect(() => {
    apiService.hero.getShowcase().then((res) => {
      if (res.data && res.data.length > 0) {
        setHeroShowcaseItems(res.data);
      }
    });
  }, []);

  const activeItems = heroShowcaseItems.length > 0 ? heroShowcaseItems : INITIAL_HERO_SHOWCASE;
  const currentHeroItem = activeItems[heroSlide % activeItems.length];

  // Visual Category Tiles
  const visualCategories = [
    { slug: 'mobile', label: 'Mobiles & Tablets', icon: Smartphone, count: '12+ Models' },
    { slug: 'electronics', label: 'Gadgets & Tech', icon: Laptop, count: '30+ Items' },
    { slug: 'fashion', label: 'Fashion & Wear', icon: ShoppingBag, count: '45+ Styles' },
    { slug: 'home-appliance', label: 'Home Appliances', icon: Tv, count: '18+ Items' },
    { slug: 'audio', label: 'Audio & Kitchen', icon: Headphones, count: '24+ Items' },
    { slug: 'organic-grocery', label: 'Food & Grocery', icon: Apple, count: 'Fresh Daily' },
    { slug: 'personal-care', label: 'Personal Care', icon: Sparkles, count: '100% Genuine' },
  ];

  return (
    <div className="min-h-screen pb-16 bg-white font-sans">
      {/* 1. SINGLE MAIN HERO BANNER (Uncluttered, High-Impact & Balanced) */}
      {isLanding && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Brand Message & Primary Actions */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-5 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{lang === 'bn' ? 'সারাদেশে হোম ডেলিভারি চালু আছে' : 'Nationwide Doorstep Delivery Active'}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
                  {lang === 'bn' ? 'আসল পণ্যের নির্ভরযোগ্য অনলাইন ঠিকানা' : 'Authentic Products, Direct to Your Doorstep'}
                </h1>

                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-xl">
                  {lang === 'bn'
                    ? 'বাংলাদেশের ৬৪ জেলায় নির্ভরযোগ্য ক্যাশ অন ডেলিভারি, ৭ দিনের সহজ রিটার্ন এবং নিরাপদ পেমেন্ট সুবিধা।'
                    : 'Genuine electronics, fashion, and everyday essentials delivered across all 64 districts with Cash on Delivery and easy returns.'}
                </p>

                {/* Clear Primary Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('catalog-grid');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="rounded-lg px-6 py-3 bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                  >
                    <span>{t('hero.shopnow', 'Shop Collection')}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentView('catalog')}
                    className="rounded-lg px-5 py-3 bg-white hover:bg-slate-100 text-[#0F172A] font-semibold text-xs sm:text-sm border border-slate-300 transition-colors cursor-pointer"
                  >
                    Browse All Products
                  </button>
                </div>
              </div>

              {/* Right Column: Hero Product Showcase */}
              <div className="lg:col-span-5 relative z-10 flex flex-col justify-center">
                <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm group">
                  <img
                    src={currentHeroItem.image}
                    alt={currentHeroItem.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

                  {/* Certified Store Tag */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-200 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{currentHeroItem.store}</span>
                    </span>
                  </div>

                  {/* Slider Arrows */}
                  <button
                    type="button"
                    onClick={() => setHeroSlide((prev) => (prev > 0 ? prev - 1 : activeItems.length - 1))}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center cursor-pointer shadow-xs transition-colors border border-slate-200"
                    aria-label="Previous showcase product"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroSlide((prev) => prev + 1)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center cursor-pointer shadow-xs transition-colors border border-slate-200"
                    aria-label="Next showcase product"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Bottom Product Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-xs">
                    <div className="min-w-0 pr-3">
                      <h4 className="text-xs sm:text-sm font-semibold text-[#0F172A] truncate">{currentHeroItem.title}</h4>
                      <div className="text-xs sm:text-sm font-bold text-[#0F172A] font-mono tabular-nums">
                        {formatBDT(currentHeroItem.price)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => viewProductDetail(currentHeroItem.slug)}
                      className="rounded-md px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-colors shadow-2xs"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Carousel Indicator Dots */}
                <div className="flex justify-center gap-1.5 mt-3">
                  {activeItems.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setHeroSlide(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        heroSlide % activeItems.length === i
                          ? 'w-5 bg-[#0F172A]'
                          : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. COMPACT PROMOTIONAL & TRUST STRIP UNDERNEATH */}
      {isLanding && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-[#0F172A] shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#0F172A] truncate">Free Delivery ৳5,000+</h4>
                <p className="text-[11px] text-slate-500 truncate">Dhaka ৳60 · Outside ৳120</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-[#0F172A] shrink-0">
                <Banknote className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#0F172A] truncate">Cash on Delivery</h4>
                <p className="text-[11px] text-slate-500 truncate">Pay at doorstep nationwide</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-[#0F172A] shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#0F172A] truncate">100% Genuine</h4>
                <p className="text-[11px] text-slate-500 truncate">Official brand warranty</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-3 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-[#0F172A] shrink-0">
                <ReturnIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#0F172A] truncate">7-Day Easy Returns</h4>
                <p className="text-[11px] text-slate-500 truncate">Hassle-free replacement</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. POPULAR CATEGORIES ROW (Direct Visual Navigation) */}
      {isLanding && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight">Explore Categories</h2>
              <p className="text-xs text-slate-500 font-normal">Find verified authentic items by department</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCategorySlug('all');
                const el = document.getElementById('catalog-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-semibold text-[#0F172A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {visualCategories.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedCategorySlug === item.slug;
              return (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => {
                    setSelectedCategorySlug(item.slug);
                    const el = document.getElementById('catalog-grid');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold leading-snug truncate">{item.label}</h3>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>{item.count}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. FLASH SALE COMPACT ROW (If campaign active) */}
      {flashCampaign?.enabled && !timeLeft.isExpired && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Limited Quantity Deal</span>
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A] leading-tight">
                  {flashCampaign.title || 'Flash Sale'} · Up to {flashCampaign.discountPercentage}% OFF
                </h3>
              </div>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ends In:</span>
              <div className="flex items-center gap-1 font-mono font-bold text-xs">
                {timeLeft.days > 0 && (
                  <span className="bg-white border border-slate-200 px-2 py-1 rounded text-amber-700">
                    {String(timeLeft.days).padStart(2, '0')}d
                  </span>
                )}
                <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-800">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </span>
                <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-800">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </span>
                <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-800">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>
            </div>
          </div>

          {flashSaleProducts.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {flashSaleProducts.slice(0, 4).map((fp) => (
                <ProductCard key={fp.id} product={fp} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 5. MAIN CATALOG & PRODUCT GRID (High up on the page for effortless discovery) */}
      <div id="catalog-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex items-center justify-between pb-3.5 border-b border-slate-200 mb-4">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="rounded-lg flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-xs font-semibold text-[#0F172A]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-700" />
            <span>Filter Products</span>
          </button>
          <div className="text-xs text-slate-500 font-mono font-medium">
            {products.length} Products
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* FILTER SIDEBAR */}
          <aside
            className={`md:col-span-3 lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-6 ${
              isMobileFilterOpen ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-[#0F172A] text-xs uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-700" />
                <span>Filters</span>
              </h3>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-[#0F172A] flex items-center gap-1 font-semibold cursor-pointer transition-colors"
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
                      ? 'bg-slate-100 text-[#0F172A] font-bold border-slate-300'
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
                          ? 'bg-slate-100 text-[#0F172A] font-bold border-slate-300'
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

            {/* Price Range */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                Price (BDT)
              </label>
              <div className="space-y-2.5">
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
                  <span className="text-[#0F172A] bg-slate-50 px-2 py-0.5 border border-slate-200 rounded font-semibold">
                    Up to {formatBDT(maxPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* In Stock Only */}
            <div className="pt-3 border-t border-slate-100">
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
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-600 font-normal">
                Showing <strong className="text-[#0F172A] font-bold font-mono">{products.length}</strong> products
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
                  className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-[#0F172A] font-medium focus:outline-none cursor-pointer"
                >
                  <option value="popular">Popularity</option>
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
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 animate-pulse">
                    <div className="h-48 bg-slate-100 rounded-lg w-full" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-5 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-2xs">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 border border-slate-200">
                  <Search className="w-5 h-5 text-slate-500" />
                </div>
                <h4 className="font-bold text-[#0F172A] text-base mb-1">No products match your filters</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Try adjusting your price range, clearing your search query, or selecting another category.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-lg px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
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

      {/* 6. CURATED PROMOTIONS & BOGO OFFERS (Placed cleanly below discovery) */}
      {isLanding && (
        <section className="pt-12">
          <SpecialOffersBannerCarousel />
        </section>
      )}
    </div>
  );
};
