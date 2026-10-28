import React from 'react';
import {
  Sparkles,
  Plus,
  RefreshCw,
  CheckCircle2,
  Eye,
  ChevronUp,
  ChevronDown,
  Trash2,
  UploadCloud,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';
import { HeroShowcaseItem } from '../../../types';
import { formatBDT } from '../../../data/bangladeshGeo';

interface Props {
  heroSlides: HeroShowcaseItem[];
  previewSlideIndex: number;
  onPreviewSlideIndexChange: (idx: number | ((prev: number) => number)) => void;
  isHeroSaving: boolean;
  uploadingHeroIndex: number | null;
  onAddSlide: () => void;
  onDeleteSlide: (idx: number) => void;
  onMoveSlide: (idx: number, direction: 'up' | 'down') => void;
  onResetSlides: () => void;
  onSaveSlides: () => void;
  onFieldChange: (index: number, field: keyof HeroShowcaseItem, value: any) => void;
  onImageUpload: (index: number, file: File) => void;
}

export const AdminHeroTab: React.FC<Props> = ({
  heroSlides,
  previewSlideIndex,
  onPreviewSlideIndexChange,
  isHeroSaving,
  uploadingHeroIndex,
  onAddSlide,
  onDeleteSlide,
  onMoveSlide,
  onResetSlides,
  onSaveSlides,
  onFieldChange,
  onImageUpload,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Hero Section Product Showcase
              </h2>
              <p className="text-xs text-slate-500">
                Upload and manage the featured product photos, titles, prices, and links rotating on the homepage hero banner.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={onResetSlides}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={onAddSlide}
            className="px-3.5 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slide</span>
          </button>
          <button
            type="button"
            onClick={onSaveSlides}
            disabled={isHeroSaving}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isHeroSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{isHeroSaving ? 'Saving Changes...' : 'Save Showcase Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout: Slides Editor + Live Storefront Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Slide Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-xs ${
                previewSlideIndex === idx
                  ? 'border-amber-400 ring-2 ring-amber-400/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Slide Top Bar */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Slide #{idx + 1}
                  </span>
                  {idx === 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Default First
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onPreviewSlideIndexChange(idx)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                      previewSlideIndex === idx
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => onMoveSlide(idx, 'up')}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === heroSlides.length - 1}
                    onClick={() => onMoveSlide(idx, 'down')}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSlide(idx)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer ml-1"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Slide Body: Image Picker on Left, Fields on Right */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Image Preview & Upload (5 cols) */}
                <div className="sm:col-span-5 flex flex-col gap-2.5">
                  <div className="relative aspect-4/3 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
                    {slide.image ? (
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8 mb-1" />
                        <span className="text-[11px]">No Image Selected</span>
                      </div>
                    )}
                    {uploadingHeroIndex === idx && (
                      <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white text-xs gap-1.5 backdrop-blur-xs">
                        <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                        <span>Uploading image...</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <label className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs">
                    <UploadCloud className="w-4 h-4 text-amber-400" />
                    <span>Upload From PC</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onImageUpload(idx, file);
                      }}
                    />
                  </label>
                  <input
                    type="url"
                    value={slide.image}
                    onChange={(e) => onFieldChange(idx, 'image', e.target.value)}
                    placeholder="Or paste image URL..."
                    className="w-full px-2.5 py-1.5 text-[11px] font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
                  />
                </div>

                {/* Form Fields (7 cols) */}
                <div className="sm:col-span-7 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => onFieldChange(idx, 'title', e.target.value)}
                      placeholder="e.g. Minimalist Watch"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Store / Seller Name
                    </label>
                    <input
                      type="text"
                      value={slide.store}
                      onChange={(e) => onFieldChange(idx, 'store', e.target.value)}
                      placeholder="e.g. Official Flagship Store"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Price (BDT) *
                      </label>
                      <input
                        type="number"
                        value={slide.price}
                        onChange={(e) => onFieldChange(idx, 'price', Number(e.target.value))}
                        placeholder="2999"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Product Slug / Link
                      </label>
                      <input
                        type="text"
                        value={slide.slug}
                        onChange={(e) => onFieldChange(idx, 'slug', e.target.value)}
                        placeholder="minimalist-watch"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-slate-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Live Storefront Simulated Preview (5 cols, sticky) */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Storefront Preview
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Slide {previewSlideIndex + 1} of {heroSlides.length}
              </span>
            </div>

            {/* Simulated Hero Banner Card */}
            {heroSlides[previewSlideIndex] && (
              <div className="space-y-3">
                <div className="relative aspect-4/3 w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                  <img
                    src={heroSlides[previewSlideIndex].image}
                    alt={heroSlides[previewSlideIndex].title}
                    className="w-full h-full object-cover object-center"
                  />

                  {/* Left / Right Nav Arrows */}
                  <button
                    type="button"
                    onClick={() =>
                      onPreviewSlideIndexChange((prev: number) =>
                        (prev - 1 + heroSlides.length) % heroSlides.length
                      )
                    }
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
                  >
                    <ChevronUp className="w-4 h-4 -rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onPreviewSlideIndexChange((prev: number) =>
                        (prev + 1) % heroSlides.length
                      )
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
                  >
                    <ChevronUp className="w-4 h-4 rotate-90" />
                  </button>

                  {/* Bottom Floating Card */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/85 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {heroSlides[previewSlideIndex].title}
                      </p>
                      <p className="text-xs font-bold text-emerald-400 font-mono">
                        {formatBDT(heroSlides[previewSlideIndex].price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 px-3 py-1.5 bg-white text-slate-950 hover:bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  {heroSlides.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => onPreviewSlideIndexChange(dotIdx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        previewSlideIndex === dotIdx
                          ? 'w-6 bg-white'
                          : 'w-2 bg-slate-700 hover:bg-slate-500'
                      }`}
                    />
                  ))}
                </div>

                {/* Bottom Info Tip */}
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">
                    &bull; Auto-slides on customer storefront every 4.5 seconds.
                  </p>
                  <p>
                    &bull; When visitors click "View &rarr;", they are taken directly to the product details page.
                  </p>
                </div>

                {/* Save Button in Sidebar as well */}
                <button
                  type="button"
                  onClick={onSaveSlides}
                  disabled={isHeroSaving}
                  className="w-full py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isHeroSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{isHeroSaving ? 'Saving...' : 'Save Showcase Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
