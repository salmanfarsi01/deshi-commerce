import React, { useState, useEffect, useRef } from 'react';
import {
  Gift,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Tag,
  Zap,
} from 'lucide-react';
import { SpecialOfferItem, SpecialOffersCampaign } from '../types';
import { apiService } from '../services/apiClient';
import { useApp } from '../context/AppContext';
import { formatBDT } from '../data/bangladeshGeo';

export const SpecialOffersBannerCarousel: React.FC = () => {
  const { addToCart, viewProductDetail, setCurrentView, t, lang } = useApp();
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

  const currentItem = activeOffers[currentIdx % activeOffers.length];

  return (
    <section
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Header Strip */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-600/10 border border-rose-600/30 text-rose-600 flex items-center justify-center">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{campaign.sectionTitle || 'Special Promotional & BOGO Offers'}</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white tracking-wider animate-pulse">
                LIMITED DEALS
              </span>
            </h2>
          </div>
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
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#0A0E1A] text-white border border-slate-800 shadow-lg shadow-slate-950/20">
        {/* Decorative background glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-7 md:p-8 items-center">
          {/* Left Column: Details & Offer Hook */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-md shadow-rose-950/50">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>{currentItem.badgeText || 'BUY 1 GET 1 FREE'}</span>
              </div>

              {currentItem.subtitle && (
                <span className="text-[11px] font-semibold text-rose-300/90 tracking-wide uppercase">
                  &bull; {currentItem.subtitle}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {currentItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-normal mt-2 leading-relaxed max-w-xl">
                {currentItem.tagline || currentItem.description || 'Exclusive bundle offer available for online orders nationwide.'}
              </p>
            </div>

            {/* Pricing Strip & Bonus Callout */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex flex-wrap items-center justify-between gap-3 max-w-lg">
              <div className="space-y-0.5">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {currentItem.offerType === 'BUY_2_GET_1'
                    ? 'Pack Price for 3 Units'
                    : 'Offer Deal Price'}
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {formatBDT(currentItem.offerPrice)}
                  </span>
                  {currentItem.originalPrice > 0 && (
                    <span className="text-xs text-slate-400 line-through font-mono">
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
                <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black tracking-wide">
                  {currentItem.offerType === 'BUY_2_GET_1' ? '+1 FREE BONUS' : '+1 100% FREE'}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5">Doorstep delivery</span>
              </div>
            </div>

            {/* CTA Buttons & Guarantees */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleClaimOffer(currentItem)}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-rose-950/60"
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

              <div className="flex items-center gap-2 text-[11px] text-slate-300 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cash on Delivery &bull; 7-Day Replacement</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Product Showcase with Glow & Badge */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-2xl overflow-hidden bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 border-2 border-slate-700/80 shadow-2xl p-2 group">
              <div className="w-full h-full rounded-xl overflow-hidden relative">
                <img
                  src={currentItem.image}
                  alt={currentItem.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                {/* Floating Ribbon Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <div className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black shadow-lg shadow-rose-950/70 uppercase tracking-wider flex items-center gap-1">
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

                {/* Bottom title pill */}
                <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-xs font-semibold text-white bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700">
                  <span className="truncate pr-2">{currentItem.title}</span>
                  <span className="font-mono text-emerald-400 font-bold shrink-0">
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
                onClick={() => setCurrentIdx(dotIdx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIdx === dotIdx ? 'w-7 bg-rose-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
