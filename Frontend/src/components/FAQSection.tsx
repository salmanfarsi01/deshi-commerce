import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Phone, MessageSquare, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FAQItem {
  question: string;
  questionBn?: string;
  answer: string;
  answerBn?: string;
  category: 'delivery' | 'payment' | 'returns' | 'warranty';
}

const FAQS: FAQItem[] = [
  {
    category: 'delivery',
    question: 'How does Cash on Delivery (COD) work across Bangladesh?',
    questionBn: 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (COD) কীভাবে কাজ করে?',
    answer:
      'You can place your order without any advance payment. Our logistics partner (Steadfast Courier or Pathao) delivers the parcel directly to your doorstep in all 64 districts. You pay cash to the courier representative only after receiving your package and an official SMS delivery receipt.',
    answerBn:
      'কোনো অগ্রিম পেমেন্ট ছাড়াই অর্ডার করতে পারেন। আমাদের কুরিয়ার পার্টনার (স্টিডফাস্ট বা পাঠাও) দেশের ৬৪টি জেলার যে কোনো প্রান্তে আপনার ঠিকানায় পার্সেল পৌঁছে দেবে। পার্সেল বুঝে পেয়ে ডেলিভারিম্যানের কাছে মূল্য পরিশোধ করবেন।',
  },
  {
    category: 'delivery',
    question: 'What are the delivery fees for inside Dhaka vs outside Dhaka?',
    questionBn: 'ঢাকার ভেতর ও ঢাকার বাইরের ডেলিভারি চার্জ কত?',
    answer:
      'Delivery charges are automated by delivery address: Inside Dhaka is ৳60 (24-48 hours delivery), and Outside Dhaka is ৳120 (3-5 business days). Any order with a subtotal of ৳5,000 or greater qualifies for 100% FREE delivery nationwide!',
    answerBn:
      'ঠিকানার ওপর ভিত্তি করে ডেলিভারি চার্জ স্বয়ংক্রিয়ভাবে নির্ধারিত হয়: ঢাকার ভেতরে ৳৬০ (২৪-৪৮ ঘণ্টা) এবং ঢাকার বাইরে ৳১২০ (৩-৫ দিন)। ৳৫,০০০ টাকার বেশি পণ্য কিনলে সারা বাংলাদেশে সম্পূর্ণ ফ্রি ডেলিভারি!',
  },
  {
    category: 'payment',
    question: 'Which online payment methods are supported through SSLCommerz?',
    questionBn: 'এসএসএল কমার্জের মাধ্যমে কী কী মাধ্যমে পেমেন্ট করা যায়?',
    answer:
      'We support instant digital payment via bKash, Nagad, Rocket, Upay, Visa, Mastercard, American Express, and internet banking (City Touch, CellFin, EBL Skybanking). All transactions are encrypted with 256-bit bank-level escrow security.',
    answerBn:
      'বিকাশ, নগদ, রকেট, ভিসা, মাস্টারকার্ড, অ্যামেক্স এবং সকল ব্যাংকের কার্ড বা ইন্টারনেট ব্যাংকিং-এর মাধ্যমে নিরাপদে পেমেন্ট করা যায়।',
  },
  {
    category: 'returns',
    question: 'What is the 7-Day Replacement & Return Guarantee?',
    questionBn: '৭ দিনের রিপ্লেসমেন্ট এবং রিটার্ন পলিসি কীভাবে কাজ করে?',
    answer:
      'If your received product has any physical defect, manufacturing fault, or does not match specifications, contact our hotline within 7 calendar days. Our courier partner will pick up the item from your location at zero return charge and deliver a replacement or full refund.',
    answerBn:
      'পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে কোনো ত্রুটি দেখা দিলে আমাদের হটলাইনে যোগাযোগ করুন। আমাদের কুরিয়ার আপনার বাসা থেকে পণ্য তুলে নেবে এবং নতুন পণ্য পাঠানো হবে।',
  },
  {
    category: 'delivery',
    question: 'How do I track my order live on the Steadfast portal?',
    questionBn: 'স্টিডফাস্ট পোর্টালে অর্ডার কীভাবে ট্র্যাক করব?',
    answer:
      'Once your order is packaged and dispatched from our Dhaka fulfillment center, you will receive an automated SMS containing your consignment number (e.g. ST-889900) and live tracking URL. You can also view live hub-by-hub tracking updates directly on our Track Order page.',
    answerBn:
      'পার্সেল প্রেরণের সাথে সাথে আপনার মোবাইলে ট্র্যাকিং নম্বর সহ এসএমএস চলে যাবে। লিংকে ক্লিক করে রিয়েল-টাইমে কুরিয়ার লোকেশন দেখতে পারবেন।',
  },
  {
    category: 'warranty',
    question: 'Are mobile phones and electronics covered by official Bangladesh warranty?',
    questionBn: 'স্মার্টফোন এবং গ্যাজেট কি অফিসিয়াল ওয়ারেন্টিযুক্ত?',
    answer:
      'Yes, 100%. All smartphones, laptops, and home appliances are BTRC approved and backed by verified manufacturer warranties (Samsung Bangladesh, Walton BD, Xiaomi Official, Sony BD). Warranty cards are stamped and verified prior to shipping.',
    answerBn:
      'হ্যাঁ, শতভাগ। সকল মোবাইল ও গ্যাজেট বিটিআরসি অনুমোদিত এবং ব্র্যান্ডের অফিসিয়াল ওয়ারেন্টি কার্ড সহ সরবরাহ করা হয়।',
  },
];

export const FAQSection: React.FC = () => {
  const { lang, t } = useApp();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredFaqs = FAQS.filter((f) => (activeFilter === 'all' ? true : f.category === activeFilter));

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
