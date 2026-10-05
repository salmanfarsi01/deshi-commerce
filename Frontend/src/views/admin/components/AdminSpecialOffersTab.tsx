import React, { useState, useEffect } from 'react';
import {
  Gift,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Tag,
  Zap,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Check,
  Percent,
  Image as ImageIcon,
  Palette,
  Link as LinkIcon,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';
import { Product, Category, SpecialOfferItem, SpecialOffersCampaign, OfferType, BannerFormat } from '../../../types';
import { apiService } from '../../../services/apiClient';
import { formatBDT } from '../../../data/bangladeshGeo';

interface AdminSpecialOffersTabProps {
  products: Product[];
  categories: Category[];
  onOffersUpdated?: () => void;
}

const GRADIENT_PRESETS = [
  { name: 'Sunset Flame', color1: '#F97316', color2: '#EA580C', direction: 'to right' },
  { name: 'Crimson Rose', color1: '#E11D48', color2: '#9F1239', direction: 'to right' },
  { name: 'Royal Indigo', color1: '#6366F1', color2: '#4338CA', direction: 'to bottom right' },
  { name: 'Emerald Forest', color1: '#10B981', color2: '#047857', direction: 'to right' },
  { name: 'Golden Amber', color1: '#D97706', color2: '#92400E', direction: 'to bottom right' },
  { name: 'Midnight Violet', color1: '#7C3AED', color2: '#4C1D95', direction: 'to right' },
  { name: 'Dark Slate', color1: '#334155', color2: '#0F172A', direction: 'to bottom right' },
  { name: 'Ruby Glow', color1: '#FB7185', color2: '#BE123C', direction: 'to right' },
];

export const AdminSpecialOffersTab: React.FC<AdminSpecialOffersTabProps> = ({
  products,
  categories,
  onOffersUpdated,
}) => {
  const [campaign, setCampaign] = useState<SpecialOffersCampaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [filterFormat, setFilterFormat] = useState<'ALL' | 'IMAGE_BANNER' | 'CARD'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<SpecialOfferItem> | null>(null);
  const [destinationType, setDestinationType] = useState<'PRODUCT' | 'CATEGORY' | 'CUSTOM'>('CUSTOM');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  const loadCampaign = async () => {
    setLoading(true);
    try {
      const res = await apiService.specialOffers.getCampaign();
      if (res.data) {
        setCampaign(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaign();
  }, []);

  const handleToggleGlobal = async () => {
    if (!campaign) return;
    const updated: SpecialOffersCampaign = {
      ...campaign,
      enabled: !campaign.enabled,
    };
    setCampaign(updated);
    await apiService.specialOffers.updateCampaign(updated);
    if (onOffersUpdated) onOffersUpdated();
  };

  const handleSaveCampaignConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    setSavingConfig(true);
    try {
      await apiService.specialOffers.updateCampaign(campaign);
      if (onOffersUpdated) onOffersUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleToggleItemActive = async (id: string) => {
    if (!campaign) return;
    const updatedItems = campaign.items.map((it) => (it.id === id ? { ...it, active: !it.active } : it));
    const updated = { ...campaign, items: updatedItems };
    setCampaign(updated);
    await apiService.specialOffers.updateCampaign(updated);
    if (onOffersUpdated) onOffersUpdated();
  };

  const handleDeleteItem = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title || 'this item'}"?`)) return;
    if (!campaign) return;
    const updatedItems = campaign.items.filter((it) => it.id !== id);
    const updated = { ...campaign, items: updatedItems };
    setCampaign(updated);
    await apiService.specialOffers.deleteItem(id);
    if (onOffersUpdated) onOffersUpdated();
  };

  const handleMoveItem = async (index: number, direction: 'up' | 'down') => {
    if (!campaign) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= campaign.items.length) return;

    const copy = [...campaign.items];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    const updated = { ...campaign, items: copy };
    setCampaign(updated);
    await apiService.specialOffers.updateCampaign(updated);
  };

  const openAddModal = (format: 'IMAGE_BANNER' | 'CARD' = 'IMAGE_BANNER') => {
    if (format === 'IMAGE_BANNER') {
      setEditingItem({
        bannerFormat: 'IMAGE_BANNER',
        title: 'Canva Promo Banner',
        subtitle: '',
        offerType: 'CUSTOM',
        badgeText: '',
        tagline: '',
        originalPrice: 0,
        offerPrice: 0,
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80',
        active: true,
        linkUrl: '#catalog-grid',
      });
      setDestinationType('CUSTOM');
    } else {
      setEditingItem({
        bannerFormat: 'CARD',
        title: '',
        subtitle: 'Festive Edition · Double Joy',
        offerType: 'BOGO',
        badgeText: 'BUY 1 GET 1 FREE',
        tagline: 'Order 1 item today and receive an identical matching piece absolutely FREE at delivery.',
        originalPrice: 2500,
        offerPrice: 2500,
        image: products[0]?.images?.[0] || 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=80',
        active: true,
        colorScheme: 'rose',
        bgType: 'gradient',
        bgColor1: '#1E293B',
        bgColor2: '#0F172A',
        gradientDirection: 'to right',
        description: 'Limited-quantity exclusive promotional offer available while stock lasts nationwide.',
      });
      setDestinationType('PRODUCT');
    }
    setIsModalOpen(true);
  };

  const openEditModal = (item: SpecialOfferItem) => {
    let format = item.bannerFormat || 'CARD';
    if (format === ('FULL_BANNER' as any) || format === ('CUSTOM_BANNER' as any)) {
      format = item.bannerFormat === ('CUSTOM_BANNER' as any) ? 'CARD' : 'IMAGE_BANNER';
    }

    setEditingItem({
      ...item,
      bannerFormat: format,
      bgColor1: item.bgColor1 || '#1E293B',
      bgColor2: item.bgColor2 || '#0F172A',
      bgType: item.bgType || 'gradient',
      gradientDirection: item.gradientDirection || 'to right',
    });

    if (item.productId) {
      setDestinationType('PRODUCT');
    } else if (item.categorySlug) {
      setDestinationType('CATEGORY');
    } else {
      setDestinationType('CUSTOM');
    }
    setIsModalOpen(true);
  };

  const handleSelectProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod || !editingItem) return;

    if (editingItem.bannerFormat === 'CARD') {
      setEditingItem({
        ...editingItem,
        productId: prod.id,
        productSlug: prod.slug,
        title: prod.name,
        originalPrice: prod.price,
        offerPrice: prod.discountPrice || prod.price,
        image: prod.images?.[0] || editingItem.image,
        description: prod.description || editingItem.description,
      });
    } else {
      setEditingItem({
        ...editingItem,
        productId: prod.id,
        productSlug: prod.slug,
        categorySlug: undefined,
      });
    }
  };

  const handleSelectCategory = (slug: string) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      categorySlug: slug,
      productId: undefined,
      productSlug: undefined,
    });
  };

  const handleOfferTypeChange = (type: OfferType) => {
    if (!editingItem) return;
    let badgeText = 'BUY 1 GET 1 FREE';
    let tagline = 'Order 1 today and get another one free at doorstep delivery.';
    if (type === 'BUY_2_GET_1') {
      badgeText = 'BUY 2 GET 1 FREE';
      tagline = 'Buy 2 units and receive a 3rd identical item 100% free of charge.';
    } else if (type === 'BUY_3_GET_1') {
      badgeText = 'BUY 3 GET 1 FREE';
      tagline = 'Buy 3 units and get 1 bonus item free in this mega value pack.';
    } else if (type === 'COMBO_DEAL') {
      badgeText = 'MEGA COMBO PACK';
      tagline = 'Special multi-product bundle saver with extra doorstep gift.';
    } else if (type === 'CUSTOM') {
      badgeText = 'SPECIAL OFFER';
      tagline = 'Limited quantity promotional package deal.';
    }

    setEditingItem({
      ...editingItem,
      offerType: type,
      badgeText,
      tagline,
    });
  };

  const handleUploadImage = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const res = await apiService.admin.uploadImage(file);
      if (res.data?.url && editingItem) {
        setEditingItem({ ...editingItem, image: res.data.url });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !campaign) return;

    // Default title if empty for image banners
    const itemToSave = {
      ...editingItem,
      title: editingItem.title?.trim() || (editingItem.bannerFormat === 'IMAGE_BANNER' ? 'Canva Promo Banner' : 'BOGO Promotional Offer'),
    };

    await apiService.specialOffers.saveItem(itemToSave);
    await loadCampaign();
    setIsModalOpen(false);
    setEditingItem(null);
    if (onOffersUpdated) onOffersUpdated();
  };

  const items = campaign?.items || [];
  const activeItems = items.filter((it) => it.active);

  const filteredItems = items.filter((it) => {
    let itFormat: 'IMAGE_BANNER' | 'CARD' =
      it.bannerFormat === 'IMAGE_BANNER' || it.bannerFormat === ('FULL_BANNER' as any)
        ? 'IMAGE_BANNER'
        : 'CARD';

    const matchesFormat = filterFormat === 'ALL' || itFormat === filterFormat;
    const matchesSearch =
      searchQuery === '' ||
      it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.badgeText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFormat && matchesSearch;
  });

  const imageBannersCount = items.filter((i) => i.bannerFormat === 'IMAGE_BANNER' || i.bannerFormat === ('FULL_BANNER' as any)).length;
  const cardsCount = items.filter((i) => i.bannerFormat !== 'IMAGE_BANNER' && i.bannerFormat !== ('FULL_BANNER' as any)).length;

  return (
    <div className="space-y-6">
      {/* 1. Header & Master Global Switch */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold mb-2">
            <Gift className="w-3.5 h-3.5" />
            <span>Storefront Promotional Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Special Offers & Promotional Banners
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Master Storefront Toggle Switch */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-lg">
            <span className="text-xs font-semibold text-slate-300">
              Carousel:
            </span>
            <button
              type="button"
              onClick={handleToggleGlobal}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                campaign?.enabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  campaign?.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-[11px] font-bold ${campaign?.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
              {campaign?.enabled ? 'LIVE' : 'OFF'}
            </span>
          </div>

          {/* Upload Image Banner (Canva) */}
          <button
            type="button"
            onClick={() => openAddModal('IMAGE_BANNER')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Banner Image (Canva)</span>
          </button>

          {/* Add BOGO Deal Card */}
          <button
            type="button"
            onClick={() => openAddModal('CARD')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add BOGO Deal Card</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Stat Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Items
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{items.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Configured in engine</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Active in Carousel
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{activeItems.length}</div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">
            {campaign?.enabled && activeItems.length > 0 ? 'Displaying on storefront' : 'Hidden from storefront'}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <UploadCloud className="w-3.5 h-3.5 text-rose-500" />
            <span>Canva Image Banners</span>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{imageBannersCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Clean graphic designs</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
            <span>BOGO Deal Cards</span>
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{cardsCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Custom color & discount cards</div>
        </div>
      </div>

      {/* 3. Live Preview Card (Visualizing the Storefront Banner) */}
      {activeItems.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 text-white">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Storefront Live Carousel Preview ({previewSlideIdx + 1} of {activeItems.length})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                {activeItems[previewSlideIdx % activeItems.length]?.bannerFormat === 'IMAGE_BANNER' || activeItems[previewSlideIdx % activeItems.length]?.bannerFormat === ('FULL_BANNER' as any)
                  ? '🖼️ Clean Canva Image Banner'
                  : '🏷️ BOGO Deal Card'}
              </span>
            </div>
            {activeItems.length > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewSlideIdx((prev) => (prev > 0 ? prev - 1 : activeItems.length - 1))}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  title="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSlideIdx((prev) => (prev + 1) % activeItems.length)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  title="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Interactive Mock Banner Slide */}
          {(() => {
            const current = activeItems[previewSlideIdx % activeItems.length];
            if (!current) return null;

            const isImg = current.bannerFormat === 'IMAGE_BANNER' || current.bannerFormat === ('FULL_BANNER' as any);

            if (isImg) {
              return (
                <div className="relative rounded-xl overflow-hidden bg-transparent border border-slate-700 aspect-[21/8] md:aspect-[3/1] max-h-56">
                  <img
                    src={current.image}
                    alt={current.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    Pure Image (Clean, No Overlay)
                  </div>
                </div>
              );
            }

            const cardBg = current.bgColor1
              ? current.bgType === 'solid'
                ? current.bgColor1
                : `linear-gradient(${current.gradientDirection || 'to right'}, ${current.bgColor1}, ${current.bgColor2 || '#0A0E1A'})`
              : undefined;

            return (
              <div
                style={cardBg ? { background: cardBg } : {}}
                className={`rounded-xl border border-slate-700/60 p-5 sm:p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5 ${
                  !cardBg ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950' : ''
                }`}
              >
                <div className="space-y-2.5 z-10 max-w-lg">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-rose-600 text-white shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{current.badgeText || 'BUY 1 GET 1 FREE'}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {current.title}
                  </h3>
                  <p className="text-xs text-slate-300">{current.tagline}</p>
                  <div className="flex items-baseline gap-3 pt-1">
                    <span className="text-2xl font-black text-white">
                      {formatBDT(current.offerPrice)}
                    </span>
                    {current.originalPrice > 0 && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatBDT(current.originalPrice * 2)}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                      2nd Unit Free
                    </span>
                  </div>
                </div>

                <div className="relative z-10 shrink-0 w-36 h-36 sm:w-44 sm:h-44 rounded-xl overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-xl">
                  <img src={current.image} alt={current.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                    PROMO
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 4. Global Carousel Settings Bar */}
      {campaign && (
        <form onSubmit={handleSaveCampaignConfig} className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Storefront Carousel Section Heading
              </h3>
            </div>
            <button
              type="submit"
              disabled={savingConfig}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingConfig ? 'Saving...' : 'Save Section Title'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Section Heading
              </label>
              <input
                type="text"
                value={campaign.sectionTitle}
                onChange={(e) => setCampaign({ ...campaign, sectionTitle: e.target.value })}
                placeholder="Exclusive BOGO & Promotional Offers"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Section Subtitle
              </label>
              <input
                type="text"
                value={campaign.sectionSubtitle || ''}
                onChange={(e) => setCampaign({ ...campaign, sectionSubtitle: e.target.value })}
                placeholder="Limited-time offers available while stock lasts"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Slide Speed (Sec)
              </label>
              <input
                type="number"
                min="2"
                max="20"
                value={campaign.autoSlideIntervalSeconds || 5}
                onChange={(e) => setCampaign({ ...campaign, autoSlideIntervalSeconds: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 font-mono"
              />
            </div>
          </div>
        </form>
      )}

      {/* 5. Offers Table / List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Filter:
            </span>
            {[
              { id: 'ALL', label: `All (${items.length})` },
              { id: 'IMAGE_BANNER', label: `🖼️ Canva Banners (${imageBannersCount})` },
              { id: 'CARD', label: `🏷️ BOGO Cards (${cardsCount})` },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterFormat(f.id as any)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  filterFormat === f.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="w-full lg:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500"
            />
          </div>
        </div>

        {/* Offers Grid/List */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Gift className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700">No Items Found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No promotional items match your selected filter. Click below to add a new banner or deal card.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => openAddModal('IMAGE_BANNER')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Banner Image</span>
              </button>
              <button
                type="button"
                onClick={() => openAddModal('CARD')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add BOGO Card</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item, idx) => {
              const isImg = item.bannerFormat === 'IMAGE_BANNER' || item.bannerFormat === ('FULL_BANNER' as any);

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Thumbnail */}
                    {isImg ? (
                      <div className="w-24 h-12 sm:w-32 sm:h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 text-[8px] font-black uppercase px-1 py-0.2 bg-black/70 text-white rounded">
                          CANVA
                        </span>
                      </div>
                    ) : (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                    )}

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {isImg ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full text-white uppercase tracking-wider bg-rose-600 shadow-xs">
                            <UploadCloud className="w-3 h-3" />
                            <span>Canva Image Banner</span>
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full text-white uppercase tracking-wider ${
                              item.offerType === 'BOGO'
                                ? 'bg-rose-600'
                                : item.offerType === 'BUY_2_GET_1'
                                ? 'bg-indigo-600'
                                : 'bg-amber-600'
                            }`}
                          >
                            <Tag className="w-3 h-3" />
                            <span>{item.badgeText}</span>
                          </span>
                        )}

                        <span
                          className={`text-[11px] font-semibold px-2 py-0.2 rounded-full ${
                            item.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {item.active ? '● Active in Carousel' : 'Inactive (Draft)'}
                        </span>

                        {!isImg && item.bgColor1 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: item.bgColor1 }}
                            />
                            <span>{item.bgColor1}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {isImg ? (item.title || 'Canva Promotional Banner') : item.title}
                      </h4>

                      <p className="text-xs text-slate-500 line-clamp-1">
                        {isImg
                          ? `Click Destination: ${item.productSlug ? `Product (${item.productSlug})` : item.categorySlug ? `Category (${item.categorySlug})` : item.linkUrl || 'Catalog grid'}`
                          : item.tagline}
                      </p>

                      {!isImg && (
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span className="text-slate-900">{formatBDT(item.offerPrice)}</span>
                          {item.originalPrice > item.offerPrice && (
                            <span className="text-slate-400 line-through text-[11px]">
                              {formatBDT(item.originalPrice)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Reorder Buttons */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveItem(idx, 'up')}
                      className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Move slide earlier in carousel"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => handleMoveItem(idx, 'down')}
                      className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Move slide later in carousel"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    {/* Toggle Active */}
                    <button
                      type="button"
                      onClick={() => handleToggleItemActive(item.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                        item.active
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item.active ? 'Deactivate' : 'Activate'}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                      title="Edit item"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id, item.title)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Modal: Add / Edit Items */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {editingItem.bannerFormat === 'IMAGE_BANNER' || editingItem.bannerFormat === ('FULL_BANNER' as any) ? (
                  <UploadCloud className="w-5 h-5 text-rose-600" />
                ) : (
                  <Gift className="w-5 h-5 text-indigo-600" />
                )}
                <h3 className="text-base font-bold text-slate-900">
                  {editingItem.id
                    ? editingItem.bannerFormat === 'IMAGE_BANNER' || editingItem.bannerFormat === ('FULL_BANNER' as any)
                      ? 'Edit Uploaded Banner Image'
                      : 'Edit BOGO Deal Card'
                    : editingItem.bannerFormat === 'IMAGE_BANNER' || editingItem.bannerFormat === ('FULL_BANNER' as any)
                    ? 'Upload Banner Image (Canva Graphic)'
                    : 'Create BOGO Deal Card'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Format Switcher: 2 Options Only */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Item Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem({
                        ...editingItem,
                        bannerFormat: 'IMAGE_BANNER',
                        title: editingItem.title || 'Canva Promo Banner',
                        badgeText: '',
                        tagline: '',
                      });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      editingItem.bannerFormat === 'IMAGE_BANNER' || editingItem.bannerFormat === ('FULL_BANNER' as any)
                        ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold shadow-xs ring-1 ring-rose-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Upload Banner Image</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Canva / Graphic design. Clean display with zero overlay text.
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem({
                        ...editingItem,
                        bannerFormat: 'CARD',
                        offerType: editingItem.offerType || 'BOGO',
                        badgeText: editingItem.badgeText || 'BUY 1 GET 1 FREE',
                        originalPrice: editingItem.originalPrice || 2500,
                        offerPrice: editingItem.offerPrice || 2500,
                        bgType: editingItem.bgType || 'gradient',
                        bgColor1: editingItem.bgColor1 || '#1E293B',
                        bgColor2: editingItem.bgColor2 || '#0F172A',
                      });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      editingItem.bannerFormat !== 'IMAGE_BANNER' && editingItem.bannerFormat !== ('FULL_BANNER' as any)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-xs ring-1 ring-indigo-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">BOGO Deal Card</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Product offer with custom color & gradient styling.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* ========================================================= */}
              {/* FORMAT 1: UPLOAD IMAGE BANNER (CANVA / ZERO TEXT FIELDS)  */}
              {/* ========================================================= */}
              {editingItem.bannerFormat === 'IMAGE_BANNER' || editingItem.bannerFormat === ('FULL_BANNER' as any) ? (
                <div className="space-y-4 pt-1">
                  {/* Banner Image Upload & Live Clean Preview */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Banner Image File (From Computer or URL)
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={editingItem.image || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                        placeholder="https://... or upload from your computer"
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-rose-600 font-mono"
                      />

                      <label className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shrink-0 shadow-xs">
                        <UploadCloud className="w-4 h-4" />
                        <span>{isUploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadImage(file);
                          }}
                        />
                      </label>
                    </div>

                    {/* Clean Banner Preview with Clean Border */}
                    {editingItem.image && (
                      <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-200 bg-transparent aspect-[21/8] relative shadow-xs">
                        <img
                          src={editingItem.image}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                          Storefront Preview (Clean, No Overlay)
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Click Destination Configuration */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <label className="block text-xs font-bold text-slate-800">
                      When visitor clicks this banner:
                    </label>

                    <div className="flex gap-2">
                      {[
                        { id: 'CUSTOM', label: 'Scroll to Catalog / URL' },
                        { id: 'PRODUCT', label: 'Open Specific Product' },
                        { id: 'CATEGORY', label: 'Filter by Category' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setDestinationType(t.id as any)}
                          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                            destinationType === t.id
                              ? 'bg-slate-900 border-slate-900 text-white'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {destinationType === 'PRODUCT' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Select Destination Product
                        </label>
                        <select
                          value={editingItem.productId || ''}
                          onChange={(e) => handleSelectProduct(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 bg-white"
                        >
                          <option value="">-- Choose product --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({formatBDT(p.price)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {destinationType === 'CATEGORY' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Select Destination Category
                        </label>
                        <select
                          value={editingItem.categorySlug || ''}
                          onChange={(e) => handleSelectCategory(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 bg-white"
                        >
                          <option value="">-- Choose category --</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.slug}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {destinationType === 'CUSTOM' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Destination URL / Anchor
                        </label>
                        <input
                          type="text"
                          value={editingItem.linkUrl || '#catalog-grid'}
                          onChange={(e) => setEditingItem({ ...editingItem, linkUrl: e.target.value })}
                          placeholder="#catalog-grid or https://..."
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ========================================================= */
                /* FORMAT 2: BOGO DEAL CARD WITH COLOR & GRADIENT BUILDER   */
                /* ========================================================= */
                <div className="space-y-4 pt-1">
                  {/* Color & Gradient Setup Box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Palette className="w-4 h-4 text-indigo-600" />
                        <span>Card Background Color & Gradient</span>
                      </label>

                      {/* Solid vs Gradient Toggle */}
                      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, bgType: 'gradient' })}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                            editingItem.bgType !== 'solid' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                          }`}
                        >
                          Gradient
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, bgType: 'solid' })}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                            editingItem.bgType === 'solid' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                          }`}
                        >
                          Solid Color
                        </button>
                      </div>
                    </div>

                    {/* Color Code Inputs with Color Pickers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {editingItem.bgType === 'solid' ? 'Color Code (Hex)' : 'Color 1 / Start (Hex)'}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editingItem.bgColor1 || '#1E293B'}
                            onChange={(e) => setEditingItem({ ...editingItem, bgColor1: e.target.value })}
                            className="w-9 h-9 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                          />
                          <input
                            type="text"
                            value={editingItem.bgColor1 || '#1E293B'}
                            onChange={(e) => setEditingItem({ ...editingItem, bgColor1: e.target.value })}
                            placeholder="#1E293B"
                            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono uppercase font-bold focus:outline-none focus:border-indigo-600 bg-white"
                          />
                        </div>
                      </div>

                      {editingItem.bgType !== 'solid' && (
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Color 2 / End (Hex)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={editingItem.bgColor2 || '#0F172A'}
                              onChange={(e) => setEditingItem({ ...editingItem, bgColor2: e.target.value })}
                              className="w-9 h-9 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                            />
                            <input
                              type="text"
                              value={editingItem.bgColor2 || '#0F172A'}
                              onChange={(e) => setEditingItem({ ...editingItem, bgColor2: e.target.value })}
                              placeholder="#0F172A"
                              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono uppercase font-bold focus:outline-none focus:border-indigo-600 bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Gradient Direction */}
                    {editingItem.bgType !== 'solid' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Gradient Flow Direction
                        </label>
                        <select
                          value={editingItem.gradientDirection || 'to right'}
                          onChange={(e) => setEditingItem({ ...editingItem, gradientDirection: e.target.value as any })}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 bg-white font-medium"
                        >
                          <option value="to right">Left → Right (Horizontal)</option>
                          <option value="to bottom right">Top-Left → Bottom-Right (Diagonal)</option>
                          <option value="to bottom">Top → Bottom (Vertical)</option>
                          <option value="to top right">Bottom-Left → Top-Right</option>
                        </select>
                      </div>
                    )}

                    {/* Preset Palettes */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Quick Preset Color Themes:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {GRADIENT_PRESETS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() =>
                              setEditingItem({
                                ...editingItem,
                                bgColor1: p.color1,
                                bgColor2: p.color2,
                                gradientDirection: p.direction as any,
                                bgType: 'gradient',
                              })
                            }
                            className="px-2.5 py-1 rounded-md text-[10px] font-bold text-white shadow-xs cursor-pointer transition-transform hover:scale-105"
                            style={{
                              background: `linear-gradient(${p.direction}, ${p.color1}, ${p.color2})`,
                            }}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Real-time BOGO Card Color Preview */}
                    <div
                      style={{
                        background:
                          editingItem.bgType === 'solid'
                            ? editingItem.bgColor1 || '#1E293B'
                            : `linear-gradient(${editingItem.gradientDirection || 'to right'}, ${editingItem.bgColor1 || '#1E293B'}, ${editingItem.bgColor2 || '#0F172A'})`,
                      }}
                      className="p-3.5 rounded-xl text-white shadow-inner flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white">
                          {editingItem.badgeText || 'BUY 1 GET 1 FREE'}
                        </span>
                        <div className="text-xs font-bold">{editingItem.title || 'Product Title'}</div>
                      </div>
                      <span className="text-[10px] font-mono text-white/80 font-bold">
                        {editingItem.bgColor1} {editingItem.bgType !== 'solid' ? `→ ${editingItem.bgColor2}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Deal Type Preset Buttons */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Deal Type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'BOGO', label: 'Buy 1 Get 1 Free' },
                        { id: 'BUY_2_GET_1', label: 'Buy 2 Get 1 Free' },
                        { id: 'BUY_3_GET_1', label: 'Buy 3 Get 1 Free' },
                        { id: 'COMBO_DEAL', label: 'Combo Deal' },
                        { id: 'CUSTOM', label: 'Custom Deal' },
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleOfferTypeChange(preset.id as OfferType)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            editingItem.offerType === preset.id
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Pick Existing Product */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Autofill from Catalog Product (Optional)
                    </label>
                    <select
                      value={editingItem.productId || ''}
                      onChange={(e) => handleSelectProduct(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 bg-white"
                    >
                      <option value="">-- Choose existing product to autofill --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatBDT(p.price)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Badge Text */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Badge Text (e.g. BUY 1 GET 1 FREE)
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.badgeText || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, badgeText: e.target.value })}
                      placeholder="BUY 1 GET 1 FREE"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 font-bold uppercase tracking-wider"
                    />
                  </div>

                  {/* Offer Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Offer Title / Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem.title || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      placeholder="e.g. Aarong Heritage Semi-Silk Festive Panjabi"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 font-semibold"
                    />
                  </div>

                  {/* Tagline / Subtitle */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tagline / Special Condition
                    </label>
                    <input
                      type="text"
                      value={editingItem.tagline || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, tagline: e.target.value })}
                      placeholder="e.g. Order 1 item today and receive an identical matching piece absolutely FREE at delivery."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500"
                    />
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Regular / Combined Value (BDT)
                      </label>
                      <input
                        type="number"
                        required
                        value={editingItem.originalPrice || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, originalPrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Deal Offer Price (BDT)
                      </label>
                      <input
                        type="number"
                        required
                        value={editingItem.offerPrice || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, offerPrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 font-bold"
                      />
                    </div>
                  </div>

                  {/* Product Image URL & File Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Product Showcase Image
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={editingItem.image || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500"
                      />
                      <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors flex items-center gap-1 shrink-0">
                        <UploadCloud className="w-4 h-4" />
                        <span>{isUploadingImage ? 'Uploading...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadImage(file);
                          }}
                        />
                      </label>
                    </div>
                    {editingItem.image && (
                      <div className="mt-2 flex items-center gap-2">
                        <img
                          src={editingItem.image}
                          alt="Preview"
                          className="w-12 h-12 rounded object-cover border border-slate-200"
                        />
                        <span className="text-[11px] text-slate-500 truncate">Product preview ready</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Active Toggle Checkbox */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={editingItem.active}
                  onChange={(e) => setEditingItem({ ...editingItem, active: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="activeToggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Activate this promotional item on the storefront carousel immediately
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  {editingItem.id ? 'Save Changes' : 'Publish to Carousel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
