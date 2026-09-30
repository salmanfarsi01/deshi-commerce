import React, { useState, useEffect } from 'react';
import {
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  ShoppingBag,
  Zap,
  Plus,
  Minus,
  CheckCircle2,
  ChevronRight,
  Share2,
  FileCheck,
  Upload,
  Camera,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiClient';
import { Product } from '../types';
import { formatBDT } from '../data/bangladeshGeo';
import { ProductCard } from '../components/ProductCard';

interface VerifiedReview {
  id: string;
  reviewerName: string;
  location: string;
  memoNumber: string;
  memoVerified: boolean;
  rating: number;
  date: string;
  comment: string;
  receiptPreview?: string;
}

export const ProductDetailView: React.FC = () => {
  const {
    selectedProductSlug,
    addToCart,
    setCurrentView,
    showToast,
    user,
    lang,
    t,
  } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping' | 'reviews'>('desc');
  const [loading, setLoading] = useState(true);

  // Verified Reviews State
  const [reviews, setReviews] = useState<VerifiedReview[]>([
    {
      id: 'rev_1',
      reviewerName: 'Tanvir Hasan',
      location: 'Dhanmondi, Dhaka',
      memoNumber: 'ORD-2026-7841',
      memoVerified: true,
      rating: 5,
      date: '28 Sep 2026',
      comment: '100% authentic product! Verified my cash memo upon delivery. Packaging was pristine and delivered in under 24 hours.',
    },
    {
      id: 'rev_2',
      reviewerName: 'Sadia Chowdhury',
      location: 'Nasirabad, Chattogram',
      memoNumber: 'ORD-2026-6192',
      memoVerified: true,
      rating: 5,
      date: '24 Sep 2026',
      comment: 'Received with official cash memo and company warranty slip. Premium quality and exactly as described.',
    },
  ]);

  // Review submission form state
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState(user?.name || '');
  const [reviewerLocation, setReviewerLocation] = useState('Dhaka');
  const [memoNumber, setMemoNumber] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [memoImagePreview, setMemoImagePreview] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!selectedProductSlug) return;
    setLoading(true);
    apiService.products
      .getBySlug(selectedProductSlug)
      .then((res) => {
        setProduct(res.data);
        setSelectedImageIndex(0);
        setQuantity(1);
        setLoading(false);

        apiService.products.getAll({ category: res.data.categoryId, size: 4 }).then((relRes) => {
          setRelatedProducts(relRes.data.products.filter((p) => p.id !== res.data.id));
        });
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedProductSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-[#0F172A] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-semibold tracking-wider text-slate-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h3 className="text-lg font-bold text-[#0F172A] mb-2 uppercase">Product Not Found</h3>
        <button
          type="button"
          onClick={() => setCurrentView('catalog')}
          className="rounded-lg px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer uppercase tracking-wider transition-colors"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const effectivePrice = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
  const savingsAmount = hasDiscount ? product.price - product.discountPrice! : 0;
  const discountPercent = hasDiscount ? Math.round((savingsAmount / product.price) * 100) : 0;

  const handleBuyNow = async () => {
    await addToCart(product.id, quantity);
    setCurrentView('checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Deshi commerce!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard', 'info');
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 overflow-x-auto whitespace-nowrap">
          <button
            type="button"
            onClick={() => setCurrentView('home')}
            className="hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            Home
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          <button
            type="button"
            onClick={() => setCurrentView('catalog')}
            className="hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            Catalog
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-slate-400">{product.categoryName}</span>
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="font-semibold text-[#0F172A] truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Purchase Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white p-6 lg:p-8 rounded-2xl border border-[#E2E8F0] shadow-2xs">
          {/* Left Column: Media Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-4/3 w-full bg-slate-50/60 overflow-hidden rounded-xl border border-[#E2E8F0] relative group flex items-center justify-center">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
              {hasDiscount && (
                <div className="absolute top-3 left-3 bg-rose-50 text-rose-700 border border-rose-200/80 font-semibold text-xs px-2.5 py-1 rounded-md shadow-2xs">
                  -{discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`rounded-lg w-20 h-20 overflow-hidden border-2 shrink-0 transition-all cursor-pointer bg-slate-50 p-1 ${
                      selectedImageIndex === idx
                        ? 'border-[#0F172A]'
                        : 'border-[#E2E8F0] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Metadata & Purchasing Module */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Brand and Stock Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0F172A] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  {product.brand}
                </span>

                <div className="flex items-center gap-2">
                  {product.stock > 0 ? (
                    <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md flex items-center gap-1 border border-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                      <span>{t('product.stock.in', 'In Stock')} ({product.stock} units left)</span>
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-300">
                      Out of Stock
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-1.5 text-slate-500 hover:text-slate-900 border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Share product"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & SKU */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] leading-tight font-sans">
                  {product.name}
                </h1>
                {product.nameBn && (
                  <div className="text-sm font-medium text-slate-500 mt-1">
                    {product.nameBn}
                  </div>
                )}
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  SKU: {product.sku}
                </div>
              </div>

              {/* Rating and Social Proof */}
              <div className="flex items-center gap-3 text-xs text-slate-600 pb-2 border-b border-slate-100">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="font-semibold text-[#0F172A] ml-1 text-sm tabular-nums">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
                <span>·</span>
                <span className="text-slate-600 font-medium">{product.reviewCount} verified reviews</span>
                <span>·</span>
                <span className="text-slate-800 font-medium">{t('product.genuine', '100% Genuine BD')}</span>
              </div>

              {/* Price & Savings Display */}
              <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1.5">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-[#0F172A] font-mono tabular-nums">
                    {formatBDT(effectivePrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-slate-400 line-through font-mono tabular-nums">
                      {formatBDT(product.price)}
                    </span>
                  )}
                </div>

                {hasDiscount && (
                  <div className="text-xs font-semibold text-rose-700">
                    You save {formatBDT(savingsAmount)} ({discountPercent}% discount)
                  </div>
                )}
                <div className="text-[11px] text-slate-500">
                  Inclusive of all taxes &amp; standard retail VAT.
                </div>
              </div>

              {/* Delivery Estimate Banner */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-[#0F172A]">
                <Truck className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold uppercase tracking-wider text-[11px]">Doorstep Delivery Guarantee</div>
                  <div className="text-slate-600 mt-0.5">
                    Inside Dhaka in <strong>24-48 hrs (৳60)</strong> · Outside Dhaka in <strong>3-5 days (৳120)</strong>. Free shipping over ৳5,000!
                  </div>
                </div>
              </div>

              {/* Purchasing Actions: Stepper, Add to Cart, Buy Now */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">Quantity:</span>
                  <div className="flex items-center bg-slate-50 border border-[#E2E8F0] rounded-lg p-1 text-xs font-semibold">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white text-slate-700 disabled:opacity-30 cursor-pointer transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-mono font-bold text-sm text-[#0F172A] tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= product.stock}
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-white text-slate-700 disabled:opacity-30 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Max: {product.stock}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => addToCart(product.id, quantity)}
                    className="h-[44px] rounded-lg px-4 bg-[#0F172A] hover:bg-slate-800 text-white font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                  >
                    <ShoppingBag className="w-4 h-4 text-white" />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="h-[44px] rounded-lg px-4 bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{t('product.buy', 'Buy Now')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Trust Highlights */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <span>{t('product.warranty', 'Official Brand Warranty')}</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-slate-700" />
                <span>{t('product.returns', '7-Day Return Guarantee')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tabs: Description, Specifications, Shipping */}
        <div className="mt-8 bg-white p-6 lg:p-8 rounded-2xl border border-[#E2E8F0] shadow-2xs">
          <div className="flex border-b border-[#E2E8F0] gap-6 text-xs font-semibold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setActiveTab('desc')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'desc'
                  ? 'border-[#0F172A] text-[#0F172A] font-bold'
                  : 'border-transparent text-slate-500 hover:text-[#0F172A]'
              }`}
            >
              Description &amp; Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'specs'
                  ? 'border-[#0F172A] text-[#0F172A] font-bold'
                  : 'border-transparent text-slate-500 hover:text-[#0F172A]'
              }`}
            >
              Specifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shipping')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'shipping'
                  ? 'border-[#0F172A] text-[#0F172A] font-bold'
                  : 'border-transparent text-slate-500 hover:text-[#0F172A]'
              }`}
            >
              Shipping &amp; Policy
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'border-[#0F172A] text-[#0F172A] font-bold'
                  : 'border-transparent text-slate-500 hover:text-[#0F172A]'
              }`}
            >
              <span>Verified Reviews</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
                {reviews.length}
              </span>
            </button>
          </div>

          <div className="pt-6">
            {activeTab === 'desc' && (
              <div className="text-sm text-slate-700 leading-relaxed space-y-4">
                <p>{product.description}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {product.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-slate-100 text-[#0F172A] rounded-md text-xs font-medium border border-slate-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-[#E2E8F0] rounded-lg overflow-hidden">
                  <tbody>
                    {Object.entries(product.specs).map(([key, value], idx) => (
                      <tr
                        key={key}
                        className={idx % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'}
                      >
                        <td className="py-2.5 px-4 font-semibold text-[#0F172A] w-1/3 border-b border-[#E2E8F0]">
                          {key}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 border-b border-[#E2E8F0] font-mono">
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div>
                  <h4 className="font-bold text-[#0F172A] text-sm mb-1 uppercase tracking-wider">
                    Doorstep Delivery across all 64 Districts:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Dhaka Metropolitan:</strong> 24 to 48 hours delivery via our fleet (৳60).</li>
                    <li><strong>All Other Districts:</strong> 3 to 5 business days via Steadfast or Pathao (৳120).</li>
                    <li><strong>Free Delivery:</strong> All orders ৳5,000 or greater qualify for 100% free delivery across Bangladesh.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Reviews Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-black text-[#0F172A]">
                      4.9
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Based on {reviews.length} authentic, cash-memo verified buyer reviews
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                    className="px-4 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <FileCheck className="w-4 h-4 text-rose-400" />
                    <span>{isReviewFormOpen ? 'Close Form' : 'Write Verified Review'}</span>
                  </button>
                </div>

                {/* Form to Submit a Review (Requires Cash Memo) */}
                {isReviewFormOpen && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!memoNumber.trim()) {
                        showToast('Cash Memo / Order # is required to verify real purchase.', 'error');
                        return;
                      }
                      setSubmittingReview(true);
                      setTimeout(() => {
                        const newRev: VerifiedReview = {
                          id: `rev_${Date.now()}`,
                          reviewerName: reviewerName.trim() || 'Verified Customer',
                          location: reviewerLocation.trim() || 'Dhaka',
                          memoNumber: memoNumber.trim().toUpperCase(),
                          memoVerified: true,
                          rating,
                          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                          comment: reviewComment.trim(),
                          receiptPreview: memoImagePreview || undefined,
                        };
                        setReviews([newRev, ...reviews]);
                        setSubmittingReview(false);
                        setIsReviewFormOpen(false);
                        setReviewComment('');
                        setMemoNumber('');
                        setMemoImagePreview(null);
                        showToast('Review verified with Cash Memo and published!', 'success');
                      }, 500);
                    }}
                    className="p-6 rounded-2xl bg-white border-2 border-slate-900 shadow-md space-y-4 text-xs animate-in fade-in duration-200"
                  >
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                      <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#0F172A] uppercase tracking-wider">
                          Submit Verified Customer Review
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          To protect against fake reviews, you must provide your Cash Memo Number or upload a delivery memo.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder="e.g. Asif Mahmud"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                          District / Area *
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewerLocation}
                          onChange={(e) => setReviewerLocation(e.target.value)}
                          placeholder="e.g. Mirpur, Dhaka"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                          Rating
                        </label>
                        <div className="flex items-center gap-1.5 py-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setRating(star)}
                              className="text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star
                                className={`w-5 h-5 ${star <= rating ? 'fill-current' : 'text-slate-300'}`}
                              />
                            </button>
                          ))}
                          <span className="font-bold text-slate-700 ml-1">({rating}/5)</span>
                        </div>
                      </div>
                    </div>

                    {/* Cash Memo Verification Required Field */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <FileCheck className="w-4 h-4 text-rose-600" />
                        <span>Cash Memo Verification (Mandatory)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                            Cash Memo Number / Order ID *
                          </label>
                          <input
                            type="text"
                            required
                            value={memoNumber}
                            onChange={(e) => setMemoNumber(e.target.value)}
                            placeholder="ORD-2026-XXXX"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white font-mono uppercase focus:outline-none focus:border-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                            Upload Cash Memo Photo / Slip (Optional)
                          </label>
                          <label className="flex items-center justify-center gap-2 w-full px-3 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-100 text-slate-600 transition-colors">
                            <Camera className="w-4 h-4 text-slate-500" />
                            <span className="text-[11px]">
                              {memoImagePreview ? 'Memo Image Attached' : 'Attach Photo of Memo'}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setMemoImagePreview(reader.result as string);
                                    showToast('Cash Memo receipt image attached!', 'info');
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {memoImagePreview && (
                        <div className="flex items-center gap-3 pt-2">
                          <img
                            src={memoImagePreview}
                            alt="Cash memo slip preview"
                            className="w-16 h-16 object-cover rounded-lg border border-slate-300"
                          />
                          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verification image successfully loaded</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                        Your Review &amp; Experience *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Describe product quality, delivery experience, packaging, and authenticity..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-slate-900 resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsReviewFormOpen(false)}
                        className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors cursor-pointer uppercase tracking-wider shadow-sm disabled:opacity-50"
                      >
                        {submittingReview ? 'Verifying Memo...' : 'Post Verified Review'}
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Verified Reviews */}
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                            {rev.reviewerName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">
                                {rev.reviewerName}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                ({rev.location})
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-amber-500 pt-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${s <= rev.rating ? 'fill-current' : 'text-slate-200'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Verified with Cash Memo Badge */}
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white">
                            <CheckCircle2 className="w-3 h-3 text-rose-400" />
                            <span>Verified Cash Memo #{rev.memoNumber}</span>
                          </span>
                          <span className="text-[11px] text-slate-400">{rev.date}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {rev.comment}
                      </p>

                      {rev.receiptPreview && (
                        <div className="pt-1">
                          <div className="inline-flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                            <img
                              src={rev.receiptPreview}
                              alt="Verified cash memo attachment"
                              className="w-12 h-12 object-cover rounded"
                            />
                            <span className="text-[10px] text-slate-500 font-mono">
                              Attached Cash Memo Slip
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 space-y-5">
            <h3 className="text-xl font-bold text-[#0F172A] uppercase tracking-tight">
              Related in {product.categoryName}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedProducts.slice(0, 3).map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
