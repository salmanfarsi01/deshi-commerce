import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Phone, MessageSquare, ShieldCheck, Truck, CreditCard } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'delivery' | 'payment' | 'returns' | 'warranty';
}

const FAQS: FAQItem[] = [
  {
    category: 'delivery',
    question: 'How does Cash on Delivery (COD) work across Bangladesh?',
    answer:
      'You can place your order without any advance payment. Our logistics partner (Steadfast Courier or Pathao) delivers the parcel directly to your doorstep in all 64 districts. You pay cash to the courier representative only after receiving your package and an official SMS delivery receipt.',
  },
  {
    category: 'delivery',
    question: 'What are the delivery fees for inside Dhaka vs outside Dhaka?',
    answer:
      'Delivery charges are automated by delivery address: Inside Dhaka is ৳60 (24-48 hours delivery), and Outside Dhaka is ৳120 (3-5 business days). Any order with a subtotal of ৳5,000 or greater qualifies for 100% FREE delivery nationwide!',
  },
  {
    category: 'payment',
    question: 'Which online payment methods are supported through SSLCommerz?',
    answer:
      'We support instant digital payment via bKash, Nagad, Rocket, Upay, Visa, Mastercard, American Express, and internet banking (City Touch, CellFin, EBL Skybanking). All transactions are encrypted with 256-bit bank-level escrow security.',
  },
  {
    category: 'returns',
    question: 'What is the 7-Day Replacement & Return Guarantee?',
    answer:
      'If your received product has any physical defect, manufacturing fault, or does not match specifications, contact our hotline within 7 calendar days. Our courier partner will pick up the item from your location at zero return charge and deliver a replacement or full refund.',
  },
  {
    category: 'delivery',
    question: 'How do I track my order live on the Steadfast portal?',
    answer:
      'Once your order is packaged and dispatched from our Dhaka fulfillment center, you will receive an automated SMS containing your consignment number (e.g. ST-889900) and live tracking URL. You can also view live hub-by-hub tracking updates directly on our Track Order page.',
  },
  {
    category: 'warranty',
    question: 'Are mobile phones and electronics covered by official Bangladesh warranty?',
    answer:
      'Yes, 100%. All smartphones, laptops, and home appliances are BTRC approved and backed by verified manufacturer warranties (Samsung Bangladesh, Walton BD, Xiaomi Official, Sony BD). Warranty cards are stamped and verified prior to shipping.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredFaqs = FAQS.filter((f) => (activeFilter === 'all' ? true : f.category === activeFilter));

  return (
    <section id="faq-section" className="py-12 bg-white border-t border-[#D4D4D4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E11D48] bg-rose-50 px-2.5 py-1 border border-rose-200">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2B2B2B] tracking-tight font-serif uppercase">
            Everything You Need to Know About Ordering
          </h2>
          <p className="text-xs text-stone-600">
            Clear, transparent answers on Bangladesh delivery, Cash on Delivery, SSLCommerz, and return policies.
          </p>
        </div>

        {/* Category Filter Pills (Zero radius) */}
        <div className="flex justify-center gap-2 mb-8 overflow-x-auto text-xs font-bold uppercase tracking-wider">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'delivery', label: 'Delivery & Shipping' },
            { id: 'payment', label: 'Payments & COD' },
            { id: 'returns', label: '7-Day Returns' },
            { id: 'warranty', label: 'Official Warranty' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveFilter(cat.id)}
              className={`rounded-none px-3.5 py-2 transition-colors cursor-pointer border ${
                activeFilter === cat.id
                  ? 'bg-[#2B2B2B] text-white border-[#2B2B2B]'
                  : 'bg-[#F8F9FA] text-stone-700 border-[#D4D4D4] hover:bg-[#EAEAEA]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="max-w-3xl mx-auto divide-y divide-[#D4D4D4] border border-[#D4D4D4] bg-white">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="bg-white">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="rounded-none w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F8F9FA] transition-colors"
                >
                  <span className="font-bold text-xs sm:text-sm text-[#2B2B2B]">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#B3B3B3] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#E11D48]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-stone-600 leading-relaxed bg-[#F8F9FA] border-t border-[#EAEAEA]">
                    <p className="pt-3">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="max-w-3xl mx-auto mt-8 p-6 bg-[#2B2B2B] text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#3D3D3D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E11D48] text-white flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-white">Have more questions?</h4>
              <p className="text-[11px] text-[#D4D4D4]">Our Dhaka customer operations desk is available 9 AM – 10 PM</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:0961233744"
              className="rounded-none px-4 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs uppercase tracking-wider transition-colors inline-block"
            >
              Call 09612-DESHI
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
