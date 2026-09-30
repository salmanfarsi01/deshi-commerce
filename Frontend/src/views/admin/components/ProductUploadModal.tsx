import React, { useState, useEffect } from 'react';
import { Product, Category } from '../../../types';
import { X, Plus, Trash2, Image, Sparkles, AlertCircle, Check } from 'lucide-react';
import { formatBDT } from '../../../data/bangladeshGeo';

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

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        ...initialProduct,
        images: initialProduct.images?.length
          ? initialProduct.images
          : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
        specs: initialProduct.specs || { 'Origin': 'Bangladesh' },
      });
    } else {
      setFormData({
        name: '',
        nameBn: '',
        brand: 'Deshi Commerce',
        categoryId: categories[0]?.id || 'cat_mobile',
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

  const regularPrice = formData.price || 0;
  const discountPrice = formData.discountPrice;
  const hasDiscount = discountPrice !== undefined && discountPrice > 0 && discountPrice < regularPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((regularPrice - discountPrice!) / regularPrice) * 100)
    : 0;

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
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
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
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
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
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
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
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
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
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* 3. Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Regular Price (৳) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.price || ''}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
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
                placeholder="Leave blank if no sale"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              />
              {hasDiscount && (
                <span className="text-[10px] font-bold text-emerald-600 mt-1 block">
                  {discountPercentage}% OFF (Customer saves {formatBDT(regularPrice - discountPrice!)})
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
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
                className={`w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white ${
                  (formData.stock || 0) <= 5 ? 'border-amber-400 text-amber-700' : 'border-slate-300'
                }`}
              />
              {(formData.stock || 0) <= 5 && (
                <span className="text-[10px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Low stock badge triggered
                </span>
              )}
            </div>
          </div>

          {/* 4. Product Images */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Product Images ({formData.images?.length || 0})</span>
              <span className="text-[10px] text-slate-400 font-normal">URL or 1-click preset</span>
            </label>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="text-[10px] text-slate-500 font-semibold mr-1">Presets:</span>
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleAddImage(preset.url)}
                  className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
                >
                  + {preset.label}
                </button>
              ))}
            </div>

            {/* URL input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={() => handleAddImage(imageUrlInput)}
                className="px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Image
              </button>
            </div>

            {/* Thumbnails list */}
            {formData.images && formData.images.length > 0 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group shrink-0 w-16 h-16 rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-0.5 left-0.5 bg-slate-900/80 text-white text-[8px] font-bold px-1 rounded-xs">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute inset-0 bg-red-900/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
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
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
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
                className="w-1/3 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                placeholder="Value (e.g. Bangladesh, 5000mAh)"
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
              <button
                type="button"
                onClick={handleAddSpec}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg cursor-pointer"
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
