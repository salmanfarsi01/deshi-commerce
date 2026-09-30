import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/apiClient';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Heart, ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { wishlist, toggleWishlist, setCurrentView, t, lang } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    apiService.products
      .getAll()
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
  }, []);

  const likedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen pb-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => setCurrentView('catalog')}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold uppercase tracking-wider cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('catalog.clearfilter', 'Return to Catalog')}</span>
          </button>

          {likedProducts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                likedProducts.forEach((p) => toggleWishlist(p.id));
              }}
              className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'সব মুছে ফেলুন' : 'Clear Wishlist'}</span>
            </button>
          )}
        </div>

        {/* Title Header */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight uppercase">
                {lang === 'bn' ? 'আপনার পছন্দের তালিকা' : 'My Saved Wishlist'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {likedProducts.length}{' '}
                {lang === 'bn'
                  ? 'টি পণ্য সংরক্ষিত আছে'
                  : `item${likedProducts.length === 1 ? '' : 's'} saved for later`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentView('catalog')}
            className="px-5 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{lang === 'bn' ? 'আরও পণ্য দেখুন' : 'Explore More Products'}</span>
          </button>
        </div>

        {/* Products Grid or Empty State */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-[#E2E8F0] rounded-xl p-4 animate-pulse space-y-3"
              >
                <div className="aspect-square bg-slate-100 rounded-lg" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : likedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {likedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">
              {lang === 'bn' ? 'পছন্দের তালিকা খালি' : 'Your Wishlist is Empty'}
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {lang === 'bn'
                ? 'পণ্য ব্রাউজ করার সময় হার্ট (♡) আইকনে ক্লিক করে সহজেই সংরক্ষণ করুন।'
                : 'Tap the heart icon on any product in our store to save it here for quick access later.'}
            </p>
            <button
              type="button"
              onClick={() => setCurrentView('catalog')}
              className="px-6 py-3 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{lang === 'bn' ? 'পণ্য ব্রাউজ করুন' : 'Browse Catalog'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
