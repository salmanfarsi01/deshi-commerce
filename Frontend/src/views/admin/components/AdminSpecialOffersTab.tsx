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
} from 'lucide-react';
import { Product, Category, SpecialOfferItem, SpecialOffersCampaign, OfferType } from '../../../types';
import { apiService } from '../../../services/apiClient';
import { formatBDT } from '../../../data/bangladeshGeo';

interface AdminSpecialOffersTabProps {
  products: Product[];
  categories: Category[];
  onOffersUpdated?: () => void;
}

export const AdminSpecialOffersTab: React.FC<AdminSpecialOffersTabProps> = ({
  products,
  onOffersUpdated,
}) => {
  const [campaign, setCampaign] = useState<SpecialOffersCampaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<SpecialOfferItem> | null>(null);
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
    if (!confirm(`Are you sure you want to delete the offer "${title}"?`)) return;
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

  const openAddModal = () => {
    setEditingItem({
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
      description: 'Limited-quantity exclusive promotional offer available while stock lasts nationwide.',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: SpecialOfferItem) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleSelectProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod || !editingItem) return;
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

    await apiService.specialOffers.saveItem(editingItem);
    await loadCampaign();
    setIsModalOpen(false);
    setEditingItem(null);
    if (onOffersUpdated) onOffersUpdated();
  };

  const items = campaign?.items || [];
  const activeItems = items.filter((it) => it.active);

  const filteredItems = items.filter((it) => {
    const matchesFilter = filterType === 'ALL' || it.offerType === filterType;
    const matchesSearch =
      searchQuery === '' ||
      it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.badgeText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            Special Offers & BOGO Deals
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Configure Buy 1 Get 1, Buy 2 Get 1, and custom promotional bundle deals. When enabled and offers are active, an interactive carousel banner displays on the storefront right after the Hero section.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Master Storefront Toggle Switch */}
          <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-lg">
            <span className="text-xs font-semibold text-slate-300">
              Storefront Banner:
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
            <span className={`text-xs font-bold ${campaign?.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
              {campaign?.enabled ? 'VISIBLE' : 'HIDDEN'}
            </span>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Offer</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Stat Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Offers
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{items.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Configured in catalog</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Active on Website
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{activeItems.length}</div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">
            {campaign?.enabled && activeItems.length > 0 ? 'Carousel displaying' : 'Hidden from storefront'}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            BOGO (1+1 Free)
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {items.filter((i) => i.offerType === 'BOGO').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Buy 1 Get 1 Deals</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Buy 2 Get 1 Free
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">
            {items.filter((i) => i.offerType === 'BUY_2_GET_1').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Multi-pack Deals</div>
        </div>
      </div>

      {/* 3. Live Preview Card (Visualizing the Storefront Banner) */}
      {activeItems.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 text-white">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Storefront Banner Live Preview ({previewSlideIdx + 1} of {activeItems.length})
              </span>
            </div>
            {activeItems.length > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewSlideIdx((prev) => (prev > 0 ? prev - 1 : activeItems.length - 1))}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewSlideIdx((prev) => (prev + 1) % activeItems.length)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
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
            return (
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-xl border border-slate-700/60 p-5 sm:p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="space-y-2.5 z-10 max-w-lg">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-rose-600 text-white shadow-md">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{current.badgeText}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {current.title}
                  </h3>
                  <p className="text-xs text-slate-300">{current.tagline}</p>
                  <div className="flex items-baseline gap-3 pt-1">
                    <span className="text-2xl font-black text-white">
                      {formatBDT(current.offerPrice)}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      {formatBDT(current.originalPrice * 2)}
                    </span>
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

      {/* 4. Carousel Banner Title & Auto-Slide Settings */}
      {campaign && (
        <form onSubmit={handleSaveCampaignConfig} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Banner Heading & Carousel Settings
            </h3>
            <button
              type="submit"
              disabled={savingConfig}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingConfig ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6">
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

            <div className="sm:col-span-6">
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
          </div>
        </form>
      )}

      {/* 5. Offers Table / List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {['ALL', 'BOGO', 'BUY_2_GET_1', 'BUY_3_GET_1', 'COMBO_DEAL', 'CUSTOM'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  filterType === t
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t === 'ALL' && 'All Offers'}
                {t === 'BOGO' && 'Buy 1 Get 1 (BOGO)'}
                {t === 'BUY_2_GET_1' && 'Buy 2 Get 1'}
                {t === 'BUY_3_GET_1' && 'Buy 3 Get 1'}
                {t === 'COMBO_DEAL' && 'Combo Deals'}
                {t === 'CUSTOM' && 'Custom'}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search offers..."
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500"
            />
          </div>
        </div>

        {/* Offers Grid/List */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Gift className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-700">No Special Offers Found</div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You have not added any promotional offers matching this filter. Click &ldquo;Add New Offer&rdquo; to create your first BOGO deal.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Offer</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
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

                      <span
                        className={`text-[11px] font-semibold px-2 py-0.2 rounded-full ${
                          item.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {item.active ? '● Active in Carousel' : 'Inactive (Draft)'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      {item.tagline}
                    </p>

                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="text-slate-900">{formatBDT(item.offerPrice)}</span>
                      {item.originalPrice > item.offerPrice && (
                        <span className="text-slate-400 line-through text-[11px]">
                          {formatBDT(item.originalPrice)}
                        </span>
                      )}
                    </div>
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
                    title="Edit offer details"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id, item.title)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Delete offer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Modal: Add / Edit Offer */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingItem.id ? 'Edit Special Promotional Offer' : 'Create Special Promotional Offer'}
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
              {/* Offer Type Preset Buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Offer Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'BOGO', label: 'Buy 1 Get 1 Free' },
                    { id: 'BUY_2_GET_1', label: 'Buy 2 Get 1 Free' },
                    { id: 'BUY_3_GET_1', label: 'Buy 3 Get 1 Free' },
                    { id: 'COMBO_DEAL', label: 'Combo Deal' },
                    { id: 'CUSTOM', label: 'Custom Offer' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleOfferTypeChange(preset.id as OfferType)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        editingItem.offerType === preset.id
                          ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
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

              {/* Image URL & File Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
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
                    <span className="text-[11px] text-slate-500 truncate">Image preview ready</span>
                  </div>
                )}
              </div>

              {/* Active Toggle Checkbox */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={editingItem.active}
                  onChange={(e) => setEditingItem({ ...editingItem, active: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                />
                <label htmlFor="activeToggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Activate this offer on the storefront carousel immediately
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
                  {editingItem.id ? 'Save Changes' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
