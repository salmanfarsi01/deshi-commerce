import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, Phone, MessageSquare, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FAQItem } from '../types';
import { apiService } from '../services/apiClient';
import { INITIAL_FAQS } from '../services/dbStorage';

export const FAQSection: React.FC = () => {
  const { lang, t } = useApp();
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    apiService.faq.getAll().then((res) => {
      if (res.data && res.data.length > 0) {
        setFaqs(res.data);
      }
    });
  }, []);

  const filteredFaqs = faqs.filter((f) => (activeFilter === 'all' ? true : f.category === activeFilter));

  return (
    <section id="faq-section" className="py-12 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t('faq.title', 'Frequently Asked Questions')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight font-sans">
            {lang === 'bn' ? 'অর্ডার সংক্রান্ত প্রয়োজনীয় প্রশ্নোত্তর' : 'Everything You Need to Know About Ordering'}
          </h2>
          <p className="text-xs text-slate-500">
            {lang === 'bn'
              ? 'ডেলিভারি, ক্যাশ অন ডেলিভারি, এসএসএল কমার্জ এবং রিটার্ন সম্পর্কিত তথ্য।'
              : 'Clear, transparent answers on Bangladesh delivery, Cash on Delivery, SSLCommerz, and return policies.'}
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex justify-center gap-2 mb-8 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'all', label: lang === 'bn' ? 'সকল প্রশ্ন' : 'All Questions' },
            { id: 'delivery', label: lang === 'bn' ? 'ডেলিভারি ও কুরিয়ার' : 'Delivery & Courier' },
            { id: 'payment', label: lang === 'bn' ? 'পেমেন্ট ও সিওডি' : 'Payments & COD' },
            { id: 'returns', label: lang === 'bn' ? '৭ দিনের রিটার্ন' : '7-Day Returns' },
            { id: 'warranty', label: lang === 'bn' ? 'ব্র্যান্ড ওয়ারেন্টি' : 'Official Warranty' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer border ${
                activeFilter === cat.id
                  ? 'bg-[#0F172A] text-white border-[#0F172A] font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="max-w-3xl mx-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="bg-white">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <span className="font-bold text-xs sm:text-sm text-[#0F172A] leading-snug">
                    {lang === 'bn' && faq.questionBn ? faq.questionBn : faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-[#0F172A]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-100">
                    {lang === 'bn' && faq.answerBn ? faq.answerBn : faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Banner */}
        <div className="max-w-3xl mx-auto mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0F172A] text-white flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#0F172A]">
                {lang === 'bn' ? 'সরাসরি কথা বলতে চান?' : 'Need personalized assistance?'}
              </div>
              <div className="text-slate-500 text-[11px]">
                {lang === 'bn' ? 'হটলাইন: ০৯৬১২-দেশী (সকাল ৯টা - রাত ১০টা)' : 'Hotline: 09612-DESHI (33744) · 9 AM - 10 PM'}
              </div>
            </div>
          </div>

          <a
            href="tel:0961233744"
            className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs"
          >
            {lang === 'bn' ? 'কল করুন' : 'Call Support'}
          </a>
        </div>
      </div>
    </section>
  );
};
