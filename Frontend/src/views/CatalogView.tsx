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
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiClient';
import { Product, Category, FlashSaleCampaign } from '../types';
import { SpecialOffersBannerCarousel } from '../components/SpecialOffersBannerCarousel';
import { formatBDT } from '../data/bangladeshGeo';
import heroSmartWatch from '../images/hero_smart_watch.jpg';
import heroFruitJuice from '../images/hero_fruit_juice.jpg';
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

  // Hero carousel mini index
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

  // Hero products showcase (synced dynamically from admin)
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

  return (
    <div className="min-h-screen pb-16 bg-white">
      {/* 1. HERO CAMPAIGN SECTION (Minimal White & Clean Proportional Layout) */}
      {isLanding && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
            {/* Left Big Minimal White Banner */}
            <div className="lg:col-span-8 bg-white text-slate-900 p-5 sm:p-7 md:p-8 rounded-2xl border border-slate-200/90 relative overflow-hidden shadow-xs flex flex-col justify-center">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 items-center">
                {/* Left text column */}
                <div className="md:col-span-7 space-y-4 z-10">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-slate-900">
                    {lang === 'bn' ? 'আসল পণ্যের নিশ্চয়তা, সরাসরি আপনার দরজায়' : 'Authentic Quality, Direct to Your Doorstep'}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed max-w-xl">
                    {lang === 'bn'
                      ? 'সারাদেশে ক্যাশ অন ডেলিভারি এবং নিরাপদ SSLCommerz পেমেন্ট সুবিধা।'
                      : 'Trusted nationwide delivery with cash on delivery & secure SSLCommerz payments.'}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('catalog-grid');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="rounded-lg px-5 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                    >
                      <span>{t('hero.shopnow', 'Shop Now')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentView('catalog')}
                      className="rounded-lg px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors cursor-pointer text-center"
                    >
                      Browse Catalog
                    </button>
                  </div>
                </div>

                {/* Right Interactive Showcase */}
                <div className="md:col-span-5 relative z-10 flex flex-col justify-center">
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shadow-xs group max-w-[280px] mx-auto md:max-w-none">
                    <img
                      src={currentHeroItem.image}
                      alt={currentHeroItem.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

                    {/* Store badge pill */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-800 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        <span>{currentHeroItem.store}</span>
                      </span>
                    </div>

                    {/* Nav arrows */}
                    <button
                      type="button"
                      onClick={() => setHeroSlide((prev) => (prev > 0 ? prev - 1 : activeItems.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center cursor-pointer shadow-xs backdrop-blur-xs transition-colors border border-slate-200"
                      aria-label="Previous showcase product"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroSlide((prev) => prev + 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center cursor-pointer shadow-xs backdrop-blur-xs transition-colors border border-slate-200"
                      aria-label="Next showcase product"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg p-2.5 flex items-center justify-between shadow-xs">
                      <div className="min-w-0 pr-2">
                        <h4 className="text-[11px] font-semibold text-slate-900 truncate">{currentHeroItem.title}</h4>
                        <div className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                          {formatBDT(currentHeroItem.price)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => viewProductDetail(currentHeroItem.slug)}
                        className="rounded-md px-2.5 py-1 bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer shrink-0 transition-colors shadow-2xs"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Indicator dots */}
                  <div className="flex justify-center gap-1.5 mt-2.5">
                    {activeItems.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setHeroSlide(i)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          heroSlide % activeItems.length === i
                            ? 'w-4 bg-[#0F172A]'
                            : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                        }`}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Stacked 2 Minimal White Advert Cards */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {/* Card 1: Smart Watch Advert (Minimal White Design) */}
              <div
                onClick={() => {
                  setSelectedCategorySlug('electronics');
                  const el = document.getElementById('catalog-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex items-center justify-between relative overflow-hidden group cursor-pointer"
              >
                {/* Left Text / Typography (Ad Layout) */}
                <div className="space-y-2 z-10 pr-3 flex-1">
                  <div>
                    <span className="block text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">
                      JUST FOR
                    </span>
                    <span className="block text-2xl sm:text-3xl font-serif italic font-extrabold text-slate-900 leading-tight">
                      You.
                    </span>
                  </div>

                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                      Online Order
                    </span>
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-black font-mono text-slate-800 bg-slate-100 border border-slate-200 tracking-wide">
                      30% OFF
                    </span>
                  </div>

                  <div className="pt-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-slate-600 transition-colors">
                      <span>Shop Now</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>

                {/* Right Visual: Perfectly Circular Cutout with Smart Watch */}
                <div className="relative z-10 shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden p-1 bg-slate-50 border-2 border-slate-200 shadow-xs group-hover:border-slate-300 transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <img
                      src={heroSmartWatch}
                      alt="Smart Watch Collection"
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Card 2: Fresh Fruit Juice Advert (Minimal White Design) */}
              <div
                onClick={() => {
                  setSelectedCategorySlug('organic-grocery');
                  const el = document.getElementById('catalog-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex items-center justify-between relative overflow-hidden group cursor-pointer"
              >
                {/* Left Text / Typography (Ad Layout) */}
                <div className="space-y-2 z-10 pr-3 flex-1">
                  <div>
                    <span className="block text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">
                      COLD PRESSED
                    </span>
                    <span className="block text-2xl sm:text-3xl font-serif italic font-extrabold text-slate-900 leading-tight">
                      Fruit Juice
                    </span>
                  </div>

                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                      Summer Deal
                    </span>
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-black font-mono text-slate-800 bg-slate-100 border border-slate-200 tracking-wide">
                      25% OFF
                    </span>
                  </div>

                  <div className="pt-1.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-slate-600 transition-colors">
                      <span>Order Now</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>

                {/* Right Visual: Perfectly Circular Cutout with Fruit Juice Bottle */}
                <div className="relative z-10 shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden p-1 bg-slate-50 border-2 border-slate-200 shadow-xs group-hover:border-slate-300 transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <img
                      src={heroFruitJuice}
                      alt="Fresh Fruit Juice"
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. DYNAMIC SPECIAL OFFERS & BOGO CAROUSEL (Controlled dynamically by Admin Panel) */}
      {isLanding && <SpecialOffersBannerCarousel />}

      {/* 3. DYNAMIC FLASH SALE BANNER (Controlled by Admin Panel: On/Off, Dynamic %, Duration) */}
      {flashCampaign?.enabled && !timeLeft.isExpired && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-white text-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 fill-current animate-pulse" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                  {flashCampaign.badge || `LIMITED TIME · UP TO ${flashCampaign.discountPercentage}% OFF`}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-900">
                  {flashCampaign.title || 'Flash Sale'}
                </h2>
              </div>
            </div>

            <div className="hidden lg:block text-xs text-slate-600 max-w-sm font-normal">
              {flashCampaign.description ||
                'Curated picks at all-time-low prices. Stock updates continuously — once sold out, deals expire immediately.'}
            </div>

            {/* Countdown Clock & View All Button */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">ENDS IN</span>
                <div className="flex items-center gap-1.5">
                  {timeLeft.days > 0 && (
                    <>
                      <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-center min-w-[38px] sm:min-w-[42px]">
                        <span className="font-mono font-bold text-xs sm:text-sm text-amber-600 tabular-nums">
                          {String(timeLeft.days).padStart(2, '0')}
                        </span>
                        <span className="block text-[7px] sm:text-[8px] uppercase text-slate-500 font-semibold tracking-wider">DAY</span>
                      </div>
                      <span className="font-bold text-slate-400">:</span>
                    </>
                  )}
                  <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-center min-w-[38px] sm:min-w-[42px]">
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 tabular-nums">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="block text-[7px] sm:text-[8px] uppercase text-slate-500 font-semibold tracking-wider">HR</span>
                  </div>
                  <span className="font-bold text-slate-400">:</span>
                  <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-center min-w-[38px] sm:min-w-[42px]">
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 tabular-nums">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="block text-[7px] sm:text-[8px] uppercase text-slate-500 font-semibold tracking-wider">MIN</span>
                  </div>
                  <span className="font-bold text-slate-400">:</span>
                  <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-center min-w-[38px] sm:min-w-[42px]">
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 tabular-nums">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="block text-[7px] sm:text-[8px] uppercase text-slate-500 font-semibold tracking-wider">SEC</span>
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
                className="rounded-lg px-3.5 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Flash Sale Featured Items Preview Row (If products available) */}
          {flashSaleProducts.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {flashSaleProducts.slice(0, 4).map((fp) => (
                <div key={fp.id} className="relative">
                  <div className="absolute top-2 left-2 z-10 bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    <span>{flashCampaign.discountPercentage}% DEAL</span>
                  </div>
                  <ProductCard product={fp} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

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
    </div>
  );
};
