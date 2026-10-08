import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  MessageSquare,
  Truck,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  Headphones,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FAQItem } from '../types';
import { apiService } from '../services/apiClient';
import { INITIAL_FAQS } from '../services/dbStorage';

export const FaqView: React.FC = () => {
  const { lang, t, setCurrentView, navigateTo, openSupportModal } = useApp();
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openIndexes, setOpenIndexes] = useState<Record<string, boolean>>({
    '0': true, // Keep first one expanded by default
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    apiService.faq
      .getAll()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setFaqs(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load FAQs:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const categories = [
    { id: 'all', labelEn: 'All Questions', labelBn: 'সকল প্রশ্ন', icon: HelpCircle },
    { id: 'delivery', labelEn: 'Delivery & Shipping', labelBn: 'ডেলিভারি ও কুরিয়ার', icon: Truck },
    { id: 'payment', labelEn: 'Payment & COD', labelBn: 'পেমেন্ট ও সিওডি', icon: CreditCard },
    { id: 'returns', labelEn: 'Returns & Refund', labelBn: '৭ দিনের রিটার্ন ও রিফান্ড', icon: RotateCcw },
    { id: 'warranty', labelEn: 'Official Warranty', labelBn: 'ব্র্যান্ড ওয়ারেন্টি', icon: ShieldCheck },
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      // Category filter
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      if (!matchesCategory) return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const questionEn = (faq.question || '').toLowerCase();
      const questionBn = (faq.questionBn || '').toLowerCase();
      const answerEn = (faq.answer || '').toLowerCase();
      const answerBn = (faq.answerBn || '').toLowerCase();

      return (
        questionEn.includes(query) ||
        questionBn.includes(query) ||
        answerEn.includes(query) ||
        answerBn.includes(query)
      );
    });
  }, [faqs, activeCategory, searchQuery]);

  const toggleAccordion = (id: string) => {
    setOpenIndexes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    filteredFaqs.forEach((faq) => {
      allOpen[faq.id] = true;
    });
    setOpenIndexes(allOpen);
  };

  const collapseAll = () => {
    setOpenIndexes({});
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 1. Top Breadcrumbs Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => {
              setCurrentView('home');
              navigateTo('/');
            }}
            className="hover:text-slate-900 transition-colors font-medium cursor-pointer"
          >
            {lang === 'bn' ? 'হোম' : 'Home'}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">
            {lang === 'bn' ? 'সাধারণ জিজ্ঞাসা (FAQ)' : 'Frequently Asked Questions'}
          </span>
        </div>
      </div>

      {/* 2. Hero Search & Title Header */}
      <div className="bg-white text-slate-900 border-b border-slate-100 pt-10 pb-10 px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-1 rounded-full">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সহায়তা কেন্দ্র ও প্রশ্নোত্তর' : 'Help & Knowledge Base'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            {lang === 'bn' ? 'আমরা কীভাবে সাহায্য করতে পারি?' : 'Frequently Asked Questions'}
          </h1>

          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            {lang === 'bn'
              ? 'ডেলিভারি, পেমেন্ট, ক্যাশ অন ডেলিভারি, রিফান্ড ও রিটার্ন পলিসি সংক্রান্ত যাবতীয় তথ্যের উত্তর এখানে পাবেন।'
              : 'Find quick and clear answers regarding Bangladesh nationwide delivery, COD, SSLCommerz payments, and hassle-free returns.'}
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'প্রশ্ন বা কীওয়ার্ড খুঁজুন (যেমন: ডেলিভারি, বিকাশ, রিটার্ন)...'
                    : 'Search questions or keywords (e.g. delivery, bKash, return)...'
                }
                className="w-full pl-12 pr-10 py-3.5 bg-slate-50 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-2xs border border-slate-200"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Category Pills Card */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-lg border border-slate-200 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none justify-start sm:justify-center">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm font-bold'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-400' : 'text-slate-500'}`} />
                  <span>{lang === 'bn' ? cat.labelBn : cat.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Bar (Results Count & Expand/Collapse Toggle) */}
        <div className="flex items-center justify-between gap-4 mb-4 px-1">
          <div className="text-xs font-bold text-slate-600">
            {filteredFaqs.length} {lang === 'bn' ? 'টি প্রশ্ন পাওয়া গেছে' : 'questions found'}
            {searchQuery && (
              <span className="text-slate-400 font-normal">
                {' '}
                for &ldquo;<span className="text-slate-700 font-semibold">{searchQuery}</span>&rdquo;
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={expandAll}
              className="text-slate-500 hover:text-slate-900 font-medium cursor-pointer transition-colors"
            >
              {lang === 'bn' ? 'সব খুলুন' : 'Expand All'}
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-slate-500 hover:text-slate-900 font-medium cursor-pointer transition-colors"
            >
              {lang === 'bn' ? 'সব বন্ধ করুন' : 'Collapse All'}
            </button>
          </div>
        </div>

        {/* 4. FAQs Accordion List */}
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {lang === 'bn' ? 'কোনো প্রশ্নোত্তর খুঁজে পাওয়া যায়নি' : 'No matching questions found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
              {lang === 'bn'
                ? 'অন্য কোনো শব্দ দিয়ে অনুসন্ধান করুন অথবা সরাসরি আমাদের কাস্টমার কেয়ারে যোগাযোগ করুন।'
                : 'Try searching with different keywords or contact our support desk directly for immediate assistance.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Clear Filters'}
              </button>
              <button
                type="button"
                onClick={openSupportModal}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'সাপোর্ট টিকিট পাঠান' : 'Submit Support Ticket'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = !!openIndexes[faq.id || String(idx)];
              const questionText = lang === 'bn' && faq.questionBn ? faq.questionBn : faq.question;
              const answerText = lang === 'bn' && faq.answerBn ? faq.answerBn : faq.answer;

              return (
                <div
                  key={faq.id || idx}
                  className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-xs ${
                    isOpen ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id || String(idx))}
                    className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                        {questionText}
                      </span>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 text-xs text-slate-600 leading-relaxed bg-slate-50/40 border-t border-slate-100">
                      <p className="whitespace-pre-line">{answerText}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Direct Support Reach-out Banner */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2.5 py-0.5 rounded-md">
                <Headphones className="w-3 h-3" />
                <span>{lang === 'bn' ? '২৪/৭ কাস্টমার সাপোর্ট' : 'Still need help?'}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {lang === 'bn'
                  ? 'আপনার কাঙ্ক্ষিত উত্তর খুঁজে পাননি?'
                  : "Can't find the answer you're looking for?"}
              </h3>
              <p className="text-xs text-slate-500 max-w-lg">
                {lang === 'bn'
                  ? 'আমাদের ডেডিকেটেড সাপোর্ট টিম আপনাকে অর্ডার, পেমেন্ট অথবা ডেলিভারি সংক্রান্ত যেকোনো বিষয়ে সাহায্য করতে প্রস্তুত।'
                  : 'Our dedicated customer care team is available to assist you with order tracking, custom requests, or returns.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={openSupportModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                <Headphones className="w-4 h-4" />
                <span>{lang === 'bn' ? 'সাপোর্ট টিকিট তৈরি করুন' : 'Submit Support Ticket'}</span>
              </button>

              <a
                href="tel:0961233744"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>09612-DESHI</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
