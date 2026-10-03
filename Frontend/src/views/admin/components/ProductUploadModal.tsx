import React, { useState, useEffect, useRef } from 'react';
import { Product, Category } from '../../../types';
import { X, Plus, Trash2, Image, Sparkles, AlertCircle, Check, Upload, UploadCloud, Loader2, Star, TrendingUp, TrendingDown, DollarSign, Calculator } from 'lucide-react';
import { formatBDT } from '../../../data/bangladeshGeo';
import { apiService } from '../../../services/apiClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<Product>) => Promise<void>;
  initialProduct: Partial<Product> | null;
  categories: Category[];
}

const PRESET_IMAGES = [
  { label: 'Smartphone', url: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80' },
  { label: 'Panjabi', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80' },
  { label: 'Jamdani Saree', url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Smart Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
  { label: 'Organic Tea', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80' },
];

export const ProductUploadModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
  categories,
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    nameBn: '',
    brand: 'Deshi Commerce',
    categoryId: categories[0]?.id || 'cat_mobile',
    buyingPrice: undefined,
    price: 1500,
    discountPrice: undefined,
    stock: 20,
    sku: `DESHI-${Math.floor(1000 + Math.random() * 9000)}`,
    description: '',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
    specs: { 'Origin': 'Bangladesh', 'Quality': '100% Authentic' },
    isFeatured: false,
    isAvailable: true,
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        ...initialProduct,
        brand: initialProduct.brand || '',
        buyingPrice: initialProduct.buyingPrice,
        images: initialProduct.images?.length
          ? initialProduct.images
          : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
        specs: initialProduct.specs || { 'Origin': 'Bangladesh' },
      });
    } else {
      setFormData({
        name: '',
        nameBn: '',
        brand: '',
        categoryId: categories[0]?.id || 'cat_mobile',
        buyingPrice: undefined,
        price: 1500,
        discountPrice: undefined,
        stock: 20,
        sku: `DESHI-${Math.floor(1000 + Math.random() * 9000)}`,
        description: '',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
        specs: { 'Origin': 'Bangladesh', 'Quality': '100% Authentic' },
        isFeatured: false,
        isAvailable: true,
      });
    }
  }, [initialProduct, categories, isOpen]);

  if (!isOpen) return null;

  const handleAddImage = (url: string) => {
    if (!url.trim()) return;
    const current = formData.images || [];
    setFormData({ ...formData, images: [...current, url.trim()] });
    setImageUrlInput('');
  };

  const handleRemoveImage = (index: number) => {
    const current = formData.images || [];
    setFormData({ ...formData, images: current.filter((_, i) => i !== index) });
  };

  const handleSetMainImage = (index: number) => {
    const current = [...(formData.images || [])];
    if (index <= 0 || index >= current.length) return;
    const [selected] = current.splice(index, 1);
    current.unshift(selected);
    setFormData({ ...formData, images: current });
  };

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const res = await apiService.admin.uploadImage(file);
        if (res.data?.url) {
          newUrls.push(res.data.url);
        }
      }
      if (newUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...(prev.images || []), ...newUrls],
        }));
      }
    } catch (err: any) {
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleAddSpec = () => {
    if (!specKey.trim() || !specValue.trim()) return;
    setFormData({
      ...formData,
      specs: {
        ...(formData.specs || {}),
        [specKey.trim()]: specValue.trim(),
      },
    });
    setSpecKey('');
    setSpecValue('');
  };

  const handleRemoveSpec = (key: string) => {
    const updated = { ...(formData.specs || {}) };
    delete updated[key];
    setFormData({ ...formData, specs: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.price) return;
    try {
      setSaving(true);
      await onSave(formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const regularPrice = Number(formData.price) || 0;
  const discountPrice = formData.discountPrice !== undefined && formData.discountPrice !== null ? Number(formData.discountPrice) : undefined;
  const buyingPrice = formData.buyingPrice !== undefined && formData.buyingPrice !== null ? Number(formData.buyingPrice) : 0;
  const stock = Number(formData.stock) || 0;

  const hasDiscount = discountPrice !== undefined && discountPrice > 0 && discountPrice < regularPrice;
  const effectivePrice = hasDiscount ? discountPrice! : regularPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((regularPrice - discountPrice!) / regularPrice) * 100)
    : 0;

  // Real-time calculations requested by user:
  const unitProfit = buyingPrice > 0 ? (effectivePrice - buyingPrice) : 0;
  const profitMarginPct = (buyingPrice > 0 && effectivePrice > 0)
    ? ((unitProfit / effectivePrice) * 100)
    : 0;
  const totalInventoryCost = buyingPrice * stock;
  const totalProjectedRevenue = effectivePrice * stock;
  const totalProjectedProfit = unitProfit * stock;
  const isLoss = buyingPrice > 0 && effectivePrice < buyingPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {formData.id ? 'Edit Product' : 'Upload New Product'}
            </h3>
            <p className="text-xs text-slate-500">
              {formData.id ? `Update catalog details for SKU: ${formData.sku}` : 'Add a verified item to the customer store catalog'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Samsung Galaxy A55 5G (8GB/128GB)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Samsung / Aarong"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Bengali Name Optional */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Bangla Title (Optional)
            </label>
            <input
              type="text"
              value={formData.nameBn || ''}
              onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
              placeholder="e.g. স্যামসাং গ্যালাক্সি এ৫৫"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* 2. Category & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={formData.categoryId || ''}
                onChange={(e) => {
                  const cat = categories.find((c) => c.id === e.target.value);
                  setFormData({
                    ...formData,
                    categoryId: e.target.value,
                    categoryName: cat?.name || 'General',
                  });
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>SKU Code</span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      sku: `DESHI-${Math.floor(10000 + Math.random() * 90000)}`,
                    })
                  }
                  className="text-[10px] text-blue-600 hover:underline font-normal cursor-pointer"
                >
                  Generate random
                </button>
              </label>
              <input
                type="text"
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* 3. Pricing, Cost & Stock Management */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-none border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>Pricing, Buying Cost &amp; Profit Margins</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                All amounts in BDT (৳)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-start">
              {/* 1. Buying Price */}
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 h-8 flex items-end leading-tight">
                  Buying Price / Cost (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.buyingPrice ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      buyingPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="e.g. 1000"
                  className="w-full h-10 px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Your purchase cost
                </span>
              </div>

              {/* 2. Regular Selling Price */}
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 h-8 flex items-end leading-tight">
                  Selling Price / MRP (৳) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.price || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  className="w-full h-10 px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Store listed price
                </span>
              </div>

              {/* 3. Discount Price */}
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 h-8 flex items-end leading-tight">
                  Discount Price (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.discountPrice ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="Leave empty if no sale"
                  className="w-full h-10 px-3 py-2 text-xs font-mono border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
                {hasDiscount ? (
                  <span className="text-[10px] font-bold text-emerald-600 mt-1 block truncate">
                    {discountPercentage}% OFF (Saves {formatBDT(regularPrice - discountPrice!)})
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Optional sale price
                  </span>
                )}

                {/* Quick Flash Sale Discount Presets */}
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Quick Flash Deal:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const regular = formData.price || 0;
                      if (regular > 0) {
                        const disc = Math.round(regular * 0.7);
                        setFormData({
                          ...formData,
                          discountPrice: disc,
                          isFlashDeal: true,
                          flashDealDiscount: 30,
                        });
                      }
                    }}
                    className="text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-0.5 rounded cursor-pointer transition-colors"
                    title="Apply 30% flash sale discount to this product"
                  >
                    ⚡ Set 30% Off
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const regular = formData.price || 0;
                      if (regular > 0) {
                        const disc = Math.round(regular * 0.5);
                        setFormData({
                          ...formData,
                          discountPrice: disc,
                          isFlashDeal: true,
                          flashDealDiscount: 50,
                        });
                      }
                    }}
                    className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    50% Off
                  </button>
                </div>
              </div>

              {/* 4. Stock Quantity */}
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 h-8 flex items-end leading-tight">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock ?? 0}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: Number(e.target.value) })
                  }
                  className={`w-full h-10 px-3 py-2 text-xs font-mono font-bold border rounded-none focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white ${
                    (formData.stock || 0) <= 5 ? 'border-amber-400 text-amber-700' : 'border-slate-300'
                  }`}
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Available inventory
                </span>
              </div>
            </div>

            {/* REAL-TIME PROFIT & REVENUE CALCULATOR CARD */}
            <div className="mt-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>Real-Time Profit &amp; Margin Analysis</span>
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Effective Sale: {formatBDT(effectivePrice)}
                </span>
              </div>

              {/* Loss Warning Banner */}
              {isLoss && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Warning: Selling price ({formatBDT(effectivePrice)}) is lower than buying price ({formatBDT(buyingPrice)})! You will lose {formatBDT(buyingPrice - effectivePrice)} per unit sold.
                  </span>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
                {/* 1. Unit Profit */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-sans">
                    Per Unit Profit
                  </span>
                  <span className={`text-sm font-extrabold block mt-0.5 ${
                    unitProfit > 0 ? 'text-emerald-600' : unitProfit < 0 ? 'text-rose-600' : 'text-slate-500'
                  }`}>
                    {buyingPrice > 0 ? (unitProfit >= 0 ? `+${formatBDT(unitProfit)}` : `-${formatBDT(Math.abs(unitProfit))}`) : '—'}
                  </span>
                </div>

                {/* 2. Profit Margin % */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-sans">
                    Profit Margin
                  </span>
                  <span className={`text-sm font-extrabold block mt-0.5 ${
                    profitMarginPct >= 25 ? 'text-emerald-600' : profitMarginPct > 0 ? 'text-blue-600' : profitMarginPct < 0 ? 'text-rose-600' : 'text-slate-500'
                  }`}>
                    {buyingPrice > 0 ? `${profitMarginPct.toFixed(1)}%` : '—'}
                  </span>
                </div>

                {/* 3. Total Inventory Cost */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-sans">
                    Total Cost
                  </span>
                  <span className="text-sm font-extrabold text-slate-800 block mt-0.5">
                    {buyingPrice > 0 ? formatBDT(totalInventoryCost) : '—'}
                  </span>
                </div>

                {/* 4. Total Potential Profit */}
                <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block font-sans">
                    Total Profit ({stock} units)
                  </span>
                  <span className={`text-sm font-extrabold block mt-0.5 ${
                    totalProjectedProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {buyingPrice > 0 ? (totalProjectedProfit >= 0 ? `+${formatBDT(totalProjectedProfit)}` : `-${formatBDT(Math.abs(totalProjectedProfit))}`) : '—'}
                  </span>
                </div>
              </div>

              {/* Total Revenue Summary Line */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-100 font-sans">
                <span>
                  Projected Gross Revenue: <strong className="text-slate-900 font-mono">{formatBDT(totalProjectedRevenue)}</strong> ({stock} units &times; {formatBDT(effectivePrice)})
                </span>
                {buyingPrice === 0 && (
                  <span className="text-amber-600 text-[10px] font-medium">
                    &bull; Enter buying price above to unlock profit calculation
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 4. Product Images */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Product Images ({formData.images?.length || 0}) *
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                {showUrlInput ? 'Hide link option' : '+ Enter image link instead'}
              </button>
            </div>

            {/* Direct File Upload Dropzone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                  : 'border-slate-300 hover:border-slate-800 bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files);
                }}
              />

              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-700">
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                  ) : (
                    <UploadCloud className="w-5 h-5 text-slate-700" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {isUploading ? (
                      <span className="text-emerald-700">Uploading image to server...</span>
                    ) : (
                      <>
                        <span className="text-[#E11D48] underline">Click to choose image</span> or drag and drop file here
                      </>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports JPG, PNG, WEBP, GIF, SVG (up to 15MB each) &bull; Select multiple files at once
                  </p>
                </div>
              </div>
            </div>

            {/* Optional Collapsible Image URL input & Presets */}
            {showUrlInput && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-semibold mr-1">Sample Presets:</span>
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleAddImage(preset.url)}
                      className="px-2 py-0.5 text-[10px] font-medium bg-white hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition-colors cursor-pointer"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImage(imageUrlInput)}
                    className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Link</span>
                  </button>
                </div>
              </div>
            )}

            {/* Image Preview Grid */}
            {formData.images && formData.images.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-500 font-medium">
                  {formData.images.length} image{formData.images.length > 1 ? 's' : ''} uploaded. First image will be used as the store cover photo.
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {formData.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative group rounded-xl border overflow-hidden bg-slate-100 aspect-square ${
                        idx === 0 ? 'border-2 border-emerald-600 ring-2 ring-emerald-500/20' : 'border-slate-200'
                      }`}
                    >
                      <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />

                      {idx === 0 ? (
                        <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm shadow-xs flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          Cover Photo
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(idx)}
                          className="absolute top-1 left-1 bg-slate-900/80 hover:bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                          title="Set as main cover photo"
                        >
                          Make Cover
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Product Description
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of features, materials, warranty, packaging..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-none focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* 6. Specifications */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Specifications &amp; Features
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                placeholder="Spec (e.g. Origin, Battery)"
                className="w-1/3 px-3 py-1.5 text-xs border border-slate-300 rounded-none"
              />
              <input
                type="text"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                placeholder="Value (e.g. Bangladesh, 5000mAh)"
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-none"
              />
              <button
                type="button"
                onClick={handleAddSpec}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-none cursor-pointer"
              >
                + Add
              </button>
            </div>

            {formData.specs && Object.keys(formData.specs).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(formData.specs).map(([k, v]) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                  >
                    <span className="font-semibold text-slate-600">{k}:</span>
                    <span>{v}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(k)}
                      className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 7. Highlights / Badges */}
          <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={formData.isFeatured ?? false}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded-xs text-slate-900 w-4 h-4"
              />
              <span>Featured on Homepage</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={formData.isAvailable ?? true}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="rounded-xs text-slate-900 w-4 h-4"
              />
              <span>Visible in Store (Active)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
              <input
                type="checkbox"
                checked={formData.isFlashDeal ?? false}
                onChange={(e) => setFormData({ ...formData, isFlashDeal: e.target.checked })}
                className="rounded-xs text-amber-600 w-4 h-4"
              />
              <span>⚡ Flash Sale Deal (30% Campaign)</span>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Saving...' : formData.id ? 'Save Changes' : 'Upload Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
