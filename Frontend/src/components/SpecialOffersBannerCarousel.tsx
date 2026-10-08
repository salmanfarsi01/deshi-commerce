import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SpecialOfferItem, SpecialOffersCampaign } from '../types';
import { apiService } from '../services/apiClient';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../data/bangladeshGeo';

export const SpecialOffersBannerCarousel: React.FC = () => {
  const { addToCart, viewProductDetail, setCurrentView, setSelectedCategorySlug, t, lang } = useApp();
  const [campaign, setCampaign] = useState<SpecialOffersCampaign | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    apiService.specialOffers.getCampaign().then((res) => {
      if (res.data) {
        setCampaign(res.data);
      }
    });
  }, []);

  // Filter only active offer items
  const activeOffers: SpecialOfferItem[] =
    campaign && campaign.enabled
      ? (campaign.items || []).filter((item) => item.active)
      : [];

  // Auto-play slide transition (Must be called unconditionally on every render)
  useEffect(() => {
    if (activeOffers.length <= 1 || isPaused) return;

    const interval = (campaign?.autoSlideIntervalSeconds || 5) * 1000;
    autoPlayRef.current = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activeOffers.length);
    }, interval);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [activeOffers.length, isPaused, campaign?.autoSlideIntervalSeconds]);

  // CRITICAL REQUIREMENT: If campaign is disabled OR there are no active offer items, DO NOT show on website!
  if (!campaign || !campaign.enabled || activeOffers.length === 0) {
    return null;
  }

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : activeOffers.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % activeOffers.length);
  };

  const handleClaimOffer = (item: SpecialOfferItem) => {
    if (item.productSlug) {
      viewProductDetail(item.productSlug);
    } else if (item.productId) {
      addToCart(item.productId, item.offerType === 'BUY_2_GET_1' ? 2 : 1);
    } else {
      const el = document.getElementById('catalog-grid');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else setCurrentView('catalog');
    }
  };

  const handleBannerClick = (item: SpecialOfferItem) => {
    if (item.productSlug) {
      viewProductDetail(item.productSlug);
    } else if (item.productId) {
      addToCart(item.productId, 1);
    } else if (item.categorySlug && item.categorySlug !== 'all') {
      setSelectedCategorySlug(item.categorySlug);
      setCurrentView('catalog');
      const el = document.getElementById('catalog-grid');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (item.linkUrl && item.linkUrl.startsWith('http')) {
      window.open(item.linkUrl, '_blank', 'noopener,noreferrer');
    } else {
      const el = document.getElementById('catalog-grid');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else setCurrentView('catalog');
    }
  };

  const currentItem = activeOffers[currentIdx % activeOffers.length];
  const isImageBanner = currentItem.bannerFormat === 'IMAGE_BANNER' || currentItem.bannerFormat === 'FULL_BANNER';

  // Custom background for BOGO Card if colors are customized
  const bogoCardBgStyle: React.CSSProperties = currentItem.bgColor1
    ? {
        background:
          currentItem.bgType === 'solid'
            ? currentItem.bgColor1
            : `linear-gradient(${currentItem.gradientDirection || 'to right'}, ${currentItem.bgColor1}, ${currentItem.bgColor2 || '#0A0E1A'})`,
      }
    : {};

  return (
    <section
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Header Strip */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {campaign.sectionTitle || 'Special Promotional & BOGO Offers'}
          </h2>
        </div>

        {/* Carousel Slide Indicators & Arrows */}
        {activeOffers.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500 font-semibold hidden sm:inline">
              {currentIdx + 1} / {activeOffers.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                title="Previous offer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                title="Next offer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Dynamic Carousel Banner */}
      {isImageBanner ? (
        /* Format A: Pure Uploaded Canva Banner Graphic (Zero text overlay, zero strokes/borders) */
        <div
          onClick={() => handleBannerClick(currentItem)}
          className="relative rounded-3xl overflow-hidden bg-transparent shadow-md hover:shadow-xl cursor-pointer group transition-all"
        >
          <div className="relative w-full aspect-[16/7] sm:aspect-[21/8] md:aspect-[24/8] lg:aspect-[3/1] max-h-[420px] overflow-hidden flex items-center justify-center">
            <img
              src={currentItem.image}
              alt={currentItem.title || 'Promotional Banner'}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.012]"
            />

            {/* Floating Glassmorphic Dots for clean multiple-slide navigation */}
            {activeOffers.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 pointer-events-auto shadow-md">
                {activeOffers.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIdx(dotIdx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentIdx === dotIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                    }`}
                    title={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Format B: Rich Product Deal Card (BOGO / Buy 2 Get 1 / Bundle) with Custom Color/Gradient & Zero Harsh Strokes */
        <div
          style={bogoCardBgStyle}
          className={`relative rounded-3xl overflow-hidden shadow-xs border border-slate-200 ${
            !currentItem.bgColor1 ? 'bg-white text-slate-900' : 'text-white'
          }`}
        >
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-7 md:p-8 items-center">
            {/* Left Column: Details & Offer Hook */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-slate-100 text-slate-800 border border-slate-200">
                  <Sparkles className="w-3.5 h-3.5 fill-current text-slate-700" />
                  <span>{currentItem.badgeText || 'BUY 1 GET 1 FREE'}</span>
                </div>

                {currentItem.subtitle && (
                  <span className={`text-[11px] font-semibold tracking-wide uppercase ${currentItem.bgColor1 ? 'text-slate-300' : 'text-slate-500'}`}>
                    &bull; {currentItem.subtitle}
                  </span>
                )}
              </div>

              <div>
                <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight ${currentItem.bgColor1 ? 'text-white' : 'text-slate-900'}`}>
                  {currentItem.title}
                </h3>
                <p className={`text-xs sm:text-sm font-normal mt-2 leading-relaxed max-w-xl ${currentItem.bgColor1 ? 'text-slate-300' : 'text-slate-600'}`}>
                  {currentItem.tagline || currentItem.description || 'Exclusive bundle offer available for online orders nationwide.'}
                </p>
              </div>

              {/* Pricing Strip & Bonus Callout */}
              <div
                style={{
                  backgroundColor: currentItem.priceBoxColor || (currentItem.bgColor1 ? 'rgba(15, 23, 42, 0.75)' : '#F8FAFC'),
                }}
                className={`p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 max-w-lg ${
                  currentItem.bgColor1 ? 'shadow-xl text-white' : 'border border-slate-200 text-slate-900 shadow-2xs'
                }`}
              >
                <div className="space-y-0.5">
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${currentItem.bgColor1 ? 'text-white/70' : 'text-slate-500'}`}>
                    {currentItem.offerType === 'BUY_2_GET_1'
                      ? 'Pack Price for 3 Units'
                      : 'Offer Deal Price'}
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className={`text-2xl sm:text-3xl font-black font-mono ${currentItem.bgColor1 ? 'text-white' : 'text-slate-900'}`}>
                      {formatBDT(currentItem.offerPrice)}
                    </span>
                    {currentItem.originalPrice > 0 && (
                      <span className={`text-xs line-through font-mono ${currentItem.bgColor1 ? 'text-white/50' : 'text-slate-400'}`}>
                        {formatBDT(
                          currentItem.offerType === 'BOGO'
                            ? currentItem.originalPrice * 2
                            : currentItem.offerType === 'BUY_2_GET_1'
                            ? currentItem.originalPrice * 3
                            : currentItem.originalPrice
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black tracking-wide">
                    {currentItem.offerType === 'BUY_2_GET_1' ? '+1 FREE BONUS' : '+1 100% FREE'}
                  </span>
                  <span className={`block text-[10px] mt-0.5 font-medium ${currentItem.bgColor1 ? 'text-white/60' : 'text-slate-500'}`}>
                    Doorstep delivery
                  </span>
                </div>
              </div>

              {/* CTA Buttons & Guarantees */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleClaimOffer(currentItem)}
                  className="px-6 py-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {currentItem.offerType === 'BOGO'
                      ? 'Claim Buy 1 Get 1 Free'
                      : currentItem.offerType === 'BUY_2_GET_1'
                      ? 'Claim Buy 2 Get 1 Free'
                      : 'Claim Special Deal'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className={`flex items-center gap-2 text-[11px] px-3.5 py-2.5 rounded-xl font-medium ${
                  currentItem.bgColor1 ? 'bg-black/25 text-white/90' : 'bg-slate-50 text-slate-700 border border-slate-200'
                }`}>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cash on Delivery &bull; 7-Day Replacement</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Product Showcase with Unique Artistic Silhouette (No harsh strokes) */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-full max-w-[280px] sm:max-w-[330px] aspect-[4/4.2] group">
                {/* Layered Floating Offset Plate */}
                <div
                  className={`absolute inset-0 bg-slate-100 pointer-events-none transition-transform duration-500 group-hover:scale-100 ${
                    currentItem.imageShape === 'tilted'
                      ? 'rounded-3xl rotate-3 scale-95 translate-x-2 translate-y-2'
                      : currentItem.imageShape === 'squircle'
                      ? 'rounded-[44px] scale-95'
                      : currentItem.imageShape === 'ticket'
                      ? 'rounded-2xl scale-95 rotate-1'
                      : 'rounded-tl-[54px] rounded-br-[54px] rounded-tr-2xl rounded-bl-2xl -rotate-2 scale-95'
                  }`}
                />

                {/* Main Product Showcase Silhouette */}
                <div
                  className={`relative w-full h-full overflow-hidden shadow-sm border border-slate-200 transition-all duration-500 group-hover:scale-[1.02] ${
                    currentItem.imageShape === 'tilted'
                      ? 'rounded-3xl -rotate-2 group-hover:rotate-0'
                      : currentItem.imageShape === 'squircle'
                      ? 'rounded-[44px]'
                      : currentItem.imageShape === 'ticket'
                      ? 'rounded-2xl'
                      : 'rounded-tl-[50px] rounded-br-[50px] rounded-tr-2xl rounded-bl-2xl'
                  }`}
                >
                  <img
                    src={currentItem.image}
                    alt={currentItem.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Ribbon Badge (Borderless) */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>
                        {currentItem.offerType === 'BUY_2_GET_1'
                          ? '2 + 1 FREE'
                          : currentItem.offerType === 'BUY_3_GET_1'
                          ? '3 + 1 FREE'
                          : '1 + 1 FREE'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Floating Title & Price Pill (Borderless Glassmorphism) */}
                  <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-xs font-semibold text-white bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg">
                    <span className="truncate pr-2 font-bold">{currentItem.title}</span>
                    <span className="font-mono text-emerald-400 font-black shrink-0">
                      {formatBDT(currentItem.offerPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Bottom Dots Navigation */}
          {activeOffers.length > 1 && (
            <div className="pb-4 pt-1 flex items-center justify-center gap-1.5 z-20 relative">
              {activeOffers.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIdx(dotIdx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIdx === dotIdx
                      ? currentItem.bgColor1 ? 'w-7 bg-white' : 'w-7 bg-[#0F172A]'
                      : currentItem.bgColor1 ? 'w-2 bg-slate-700 hover:bg-slate-500' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
