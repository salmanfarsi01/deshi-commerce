import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Clock,
  Calendar,
  Percent,
  Check,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Search,
  Filter,
  Eye,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  SlidersHorizontal,
  CheckSquare,
  Square,
  Flame,
} from 'lucide-react';
import { Product, Category, FlashSaleCampaign } from '../../../types';
import { apiService } from '../../../services/apiClient';
import { formatBDT } from '../../../data/bangladeshGeo';
import { useApp } from '../../../context/AppContext';

interface Props {
  products: Product[];
  categories: Category[];
  onProductsUpdated: () => void;
}

export const AdminFlashSaleTab: React.FC<Props> = ({
  products,
  categories,
  onProductsUpdated,
}) => {
  const { showToast } = useApp();

  const [campaign, setCampaign] = useState<FlashSaleCampaign>({
    enabled: true,
    title: 'Flash Sale',
    badge: 'LIMITED TIME · UP TO 30% OFF',
    discountPercentage: 30,
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    durationDays: 3,
    description:
      'Curated picks at all-time-low prices. Stock updates continuously — once sold out, deals expire immediately.',
    productIds: [],
    includeMatchingDiscount: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterMode, setFilterMode] = useState<'all' | 'matching' | 'included'>('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Real-time ticking countdown for preview
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Load campaign on mount
  useEffect(() => {
    setLoading(true);
    apiService.flashSale
      .getCampaign()
      .then((res) => {
        if (res.data) {
          setCampaign(res.data);
          if (res.data.productIds) {
            setSelectedProductIds(res.data.productIds);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Update countdown clock
  useEffect(() => {
    if (!campaign.endDate) return;

    const tick = () => {
      const diff = new Date(campaign.endDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [campaign.endDate]);

  // Handle Preset Duration change (e.g. 1 day, 3 days, 7 days)
  const handleSetDurationDays = (days: number) => {
    const end = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    setCampaign((prev) => ({
      ...prev,
      durationDays: days,
      endDate: end,
    }));
  };

  // Handle Discount Percentage change (e.g. 30%)
  const handleSetDiscountPercentage = (pct: number) => {
    setCampaign((prev) => ({
      ...prev,
      discountPercentage: pct,
      badge: `LIMITED TIME · UP TO ${pct}% OFF`,
    }));
  };

  // Save Campaign Settings
  const handleSaveCampaign = async () => {
    setSaving(true);
    try {
      const payload: FlashSaleCampaign = {
        ...campaign,
        productIds: selectedProductIds,
      };
      await apiService.flashSale.updateCampaign(payload);
      showToast('Flash Sale Campaign updated successfully! Changes are live on the storefront.', 'success');
    } catch {
      showToast('Failed to save Flash Sale settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Toggle individual product selection
  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Select all visible products
  const handleSelectAllVisible = (visibleIds: string[]) => {
    const allSelected = visibleIds.every((id) => selectedProductIds.includes(id));
    if (allSelected) {
      setSelectedProductIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Bulk Apply Campaign Discount to selected products
  const handleBulkApplyDiscount = async () => {
    if (selectedProductIds.length === 0) {
      showToast('Please select at least one product', 'error');
      return;
    }
    try {
      await apiService.flashSale.applyDiscount(selectedProductIds, campaign.discountPercentage);
      showToast(
        `Applied ${campaign.discountPercentage}% Flash Sale discount to ${selectedProductIds.length} products!`,
        'success'
      );
      onProductsUpdated();
    } catch {
      showToast('Failed to apply discount', 'error');
    }
  };

  // Filtered products list for table
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        if (!matchName && !matchSku) return false;
      }
      // 2. Category Filter
      if (selectedCategory !== 'ALL' && p.categoryId !== selectedCategory) {
        return false;
      }
      // 3. Discount / Selection Mode
      const discountPct =
        p.price && p.discountPrice
          ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
          : 0;

      const isMatching = discountPct >= campaign.discountPercentage || p.isFlashDeal;
      const isSelected = selectedProductIds.includes(p.id);

      if (filterMode === 'matching') return isMatching;
      if (filterMode === 'included') return isSelected;
      return true;
    });
  }, [products, searchQuery, selectedCategory, filterMode, campaign.discountPercentage, selectedProductIds]);

  // Statistics
  const matchingProductsCount = useMemo(() => {
    return products.filter((p) => {
      if (p.isFlashDeal) return true;
      if (p.price && p.discountPrice) {
        const pct = Math.round(((p.price - p.discountPrice) / p.price) * 100);
        return pct >= campaign.discountPercentage;
      }
      return false;
    }).length;
  }, [products, campaign.discountPercentage]);

  const activeProductsInSaleCount = useMemo(() => {
    return products.filter((p) => {
      if (selectedProductIds.includes(p.id)) return true;
      if (p.isFlashDeal) return true;
      if (campaign.includeMatchingDiscount && p.price && p.discountPrice) {
        const pct = Math.round(((p.price - p.discountPrice) / p.price) * 100);
        return pct >= campaign.discountPercentage;
      }
      return false;
    }).length;
  }, [products, selectedProductIds, campaign]);

  return (
    <div className="space-y-6">
      {/* 1. MASTER STATUS & ACTION BAR */}
      <div className={`p-6 rounded-2xl border transition-all ${
        campaign.enabled
          ? 'bg-slate-900 border-amber-500/40 text-white shadow-xl ring-1 ring-amber-500/20'
          : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
              campaign.enabled
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}>
              <Zap className={`w-6 h-6 ${campaign.enabled ? 'fill-current animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                  campaign.enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${campaign.enabled ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
                  {campaign.enabled ? 'CAMPAIGN IS LIVE' : 'CAMPAIGN IS OFF'}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Target: {campaign.discountPercentage}% Discount Deals &bull; {activeProductsInSaleCount} Products Active
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-white">
                {campaign.enabled ? campaign.title : 'Flash Sale (Currently Inactive)'}
              </h2>
              <p className={`text-xs mt-1 max-w-xl ${campaign.enabled ? 'text-slate-300' : 'text-slate-500'}`}>
                {campaign.enabled
                  ? `Active on customer storefront with live countdown ticking to ${new Date(campaign.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.`
                  : 'Turning this off completely hides the Flash Sale section and countdown timer from the customer storefront.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            {/* Master Toggle */}
            <button
              type="button"
              onClick={() => setCampaign((prev) => ({ ...prev, enabled: !prev.enabled }))}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                campaign.enabled
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{campaign.enabled ? 'Turn OFF Flash Sale' : 'Turn ON Flash Sale'}</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveCampaign}
              disabled={saving}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Live Countdown Mini Display */}
        {campaign.enabled && (
          <div className="mt-5 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Time Remaining:</span>
              <div className="flex items-center gap-1.5 font-mono">
                <div className="bg-slate-800/80 px-2 py-1 rounded-md text-amber-400 font-bold text-xs border border-amber-500/20">
                  {timeLeft.days} <span className="text-[9px] text-slate-400 uppercase">Days</span>
                </div>
                <span className="text-slate-500 font-bold">:</span>
                <div className="bg-slate-800/80 px-2 py-1 rounded-md text-white font-bold text-xs border border-slate-700">
                  {String(timeLeft.hours).padStart(2, '0')} <span className="text-[9px] text-slate-400 uppercase">Hr</span>
                </div>
                <span className="text-slate-500 font-bold">:</span>
                <div className="bg-slate-800/80 px-2 py-1 rounded-md text-white font-bold text-xs border border-slate-700">
                  {String(timeLeft.minutes).padStart(2, '0')} <span className="text-[9px] text-slate-400 uppercase">Min</span>
                </div>
                <span className="text-slate-500 font-bold">:</span>
                <div className="bg-slate-800/80 px-2 py-1 rounded-md text-white font-bold text-xs border border-slate-700">
                  {String(timeLeft.seconds).padStart(2, '0')} <span className="text-[9px] text-slate-400 uppercase">Sec</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Campaign Ends: <strong className="text-white">{new Date(campaign.endDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. CAMPAIGN CONFIGURATION CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Settings */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <SlidersHorizontal className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Campaign Settings &amp; Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Campaign Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Campaign Title
              </label>
              <input
                type="text"
                value={campaign.title}
                onChange={(e) => setCampaign({ ...campaign, title: e.target.value })}
                placeholder="e.g. Flash Sale"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Campaign Headline / Badge */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Storefront Headline Badge
              </label>
              <input
                type="text"
                value={campaign.badge}
                onChange={(e) => setCampaign({ ...campaign, badge: e.target.value })}
                placeholder="e.g. LIMITED TIME · UP TO 30% OFF"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Discount Percentage with Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Flash Sale Discount Target (%)</span>
              <span className="text-[11px] font-mono text-emerald-600 font-bold">
                Current: {campaign.discountPercentage}% OFF
              </span>
            </label>
            <div className="flex items-center gap-3">
              <div className="relative w-32 shrink-0">
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={campaign.discountPercentage}
                  onChange={(e) => handleSetDiscountPercentage(Number(e.target.value) || 0)}
                  className="w-full pl-3 pr-8 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[10, 20, 30, 40, 50, 70].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleSetDiscountPercentage(pct)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      campaign.discountPercentage === pct
                        ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 font-black'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {pct}% {pct === 30 ? '★ (Your 30%)' : ''}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Existing products uploaded with {campaign.discountPercentage}% discount will be automatically eligible.
            </p>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Campaign Duration
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: '24 Hours (1 Day)', days: 1 },
                { label: '72 Hours (3 Days)', days: 3 },
                { label: '5 Days', days: 5 },
                { label: '7 Days (1 Week)', days: 7 },
              ].map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => handleSetDurationDays(opt.days)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    campaign.durationDays === opt.days
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-400'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs'
                  }`}
                >
                  <span className="block text-xs font-bold">{opt.label}</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">
                    {opt.days === 3 ? '★ Default (3 Days)' : `${opt.days * 24} hours`}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom End Date Input */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Or custom end date/time:</span>
              <input
                type="datetime-local"
                value={campaign.endDate ? new Date(campaign.endDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const newDate = new Date(e.target.value).toISOString();
                    const diffDays = Math.max(1, Math.round((new Date(newDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                    setCampaign({
                      ...campaign,
                      endDate: newDate,
                      durationDays: diffDays,
                    });
                  }
                }}
                className="px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Product Inclusion Rules */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Product Matching Rules
            </h4>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={campaign.includeMatchingDiscount}
                onChange={(e) =>
                  setCampaign({ ...campaign, includeMatchingDiscount: e.target.checked })
                }
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Include existing products uploaded with {campaign.discountPercentage}% discount automatically
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Any product currently in the catalog with a {campaign.discountPercentage}% or higher discount price will display the Flash Sale deal badge.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Right Preview Card: What Customers See */}
        <div className="bg-[#0F172A] text-white rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Eye className="w-4 h-4" />
                <span>Live Customer Storefront Preview</span>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                campaign.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {campaign.enabled ? 'VISIBLE' : 'HIDDEN'}
              </span>
            </div>

            <div className="space-y-4">
              {/* Mini banner */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-amber-400 tracking-wider block">
                      {campaign.badge}
                    </span>
                    <h4 className="text-sm font-bold uppercase text-white">
                      {campaign.title}
                    </h4>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">ENDS IN</span>
                  <div className="flex items-center gap-1 font-mono text-[11px] font-bold">
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400">{timeLeft.days}D</span>
                    <span>:</span>
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white">{String(timeLeft.hours).padStart(2, '0')}H</span>
                    <span>:</span>
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white">{String(timeLeft.minutes).padStart(2, '0')}M</span>
                    <span>:</span>
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-white">{String(timeLeft.seconds).padStart(2, '0')}S</span>
                  </div>
                </div>
              </div>

              {/* Sample Product Card in Flash Sale */}
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Sample Flash Deal Product Card:
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80"
                    alt="Sample"
                    className="w-12 h-12 rounded-lg object-cover bg-white"
                  />
                  <div>
                    <span className="inline-block bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-1.5 py-0.2 rounded font-mono mb-0.5">
                      {campaign.discountPercentage}% FLASH DEAL
                    </span>
                    <h5 className="text-xs font-bold text-white truncate max-w-[160px]">
                      Studio Acoustic Headphones
                    </h5>
                    <div className="flex items-center gap-1.5 mt-0.5 font-mono text-xs">
                      <span className="font-bold text-emerald-400">{formatBDT(2450)}</span>
                      <span className="text-[10px] text-slate-500 line-through">{formatBDT(3500)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            {campaign.enabled ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Customers can see and order these deals now.
              </span>
            ) : (
              <span className="text-slate-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Hidden until you turn on and save.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. PRODUCT INVENTORY ASSIGNMENT TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Select Products for {campaign.discountPercentage}% Flash Sale</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                {activeProductsInSaleCount} Active in Deal
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Checkmark products to include in this campaign, or click "Apply {campaign.discountPercentage}% Discount" to update their selling price automatically.
            </p>
          </div>

          {/* Bulk Action Button */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={handleBulkApplyDiscount}
              disabled={selectedProductIds.length === 0}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Apply campaign discount percentage to all checked products"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Apply {campaign.discountPercentage}% Off to Selected ({selectedProductIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                // Select all products matching 30% discount
                const matchingIds = products
                  .filter((p) => {
                    if (p.isFlashDeal) return true;
                    if (p.price && p.discountPrice) {
                      const pct = Math.round(((p.price - p.discountPrice) / p.price) * 100);
                      return pct >= campaign.discountPercentage;
                    }
                    return false;
                  })
                  .map((p) => p.id);
                setSelectedProductIds(matchingIds);
                showToast(`Selected all ${matchingIds.length} products with ${campaign.discountPercentage}% discount`, 'info');
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
            >
              Select All {campaign.discountPercentage}% Deals
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name or SKU..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('matching')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                filterMode === 'matching'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Matching {campaign.discountPercentage}% ({matchingProductsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('included')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                filterMode === 'included'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Selected In Deal ({selectedProductIds.length})
            </button>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredProducts.length > 0 &&
                      filteredProducts.every((p) => selectedProductIds.includes(p.id))
                    }
                    onChange={() => handleSelectAllVisible(filteredProducts.map((p) => p.id))}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">MRP (৳)</th>
                <th className="py-3 px-4 text-right">Discount Price (৳)</th>
                <th className="py-3 px-4 text-center">Discount %</th>
                <th className="py-3 px-4 text-center">Flash Deal Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No products matched your criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isChecked = selectedProductIds.includes(p.id);
                  const discountPct =
                    p.price && p.discountPrice
                      ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
                      : 0;

                  const isExactMatch = discountPct >= campaign.discountPercentage;
                  const isInCampaign = isChecked || p.isFlashDeal || (campaign.includeMatchingDiscount && isExactMatch);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isInCampaign ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleProduct(p.id)}
                          className="w-4 h-4 text-amber-600 rounded border-slate-300 cursor-pointer"
                        />
                      </td>

                      {/* Product Name & Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=80&q=80'}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-[220px]">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              SKU: {p.sku} &bull; Stock: {p.stock}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600">
                        {p.categoryName || 'General'}
                      </td>

                      {/* Regular Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatBDT(p.price)}
                      </td>

                      {/* Discount Price */}
                      <td className="py-3 px-4 text-right font-mono">
                        {p.discountPrice ? (
                          <span className="font-bold text-emerald-700">
                            {formatBDT(p.discountPrice)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">None</span>
                        )}
                      </td>

                      {/* Calculated Discount % */}
                      <td className="py-3 px-4 text-center">
                        {discountPct > 0 ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            isExactMatch
                              ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {discountPct}% OFF
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[10px]">—</span>
                        )}
                      </td>

                      {/* Flash Deal Status */}
                      <td className="py-3 px-4 text-center">
                        {isInCampaign ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                            <Zap className="w-2.5 h-2.5 fill-current text-amber-600" />
                            <span>IN FLASH DEAL</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-medium">
                            Standard
                          </span>
                        )}
                      </td>

                      {/* Action: Set 30% discount immediately */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={async () => {
                            const disc = Math.round(p.price * (1 - campaign.discountPercentage / 100));
                            await apiService.flashSale.applyDiscount([p.id], campaign.discountPercentage);
                            showToast(`Updated ${p.name} to ${campaign.discountPercentage}% Flash Deal (${formatBDT(disc)})`, 'success');
                            onProductsUpdated();
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 text-[10px] font-bold rounded-md border border-slate-200 transition-colors cursor-pointer"
                          title={`Set price to ${campaign.discountPercentage}% off`}
                        >
                          ⚡ Set {campaign.discountPercentage}%
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
