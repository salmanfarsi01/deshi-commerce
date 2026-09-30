import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Phone, Mail, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentView, setSelectedCategorySlug } = useApp();

  return (
    <footer className="bg-[#2B2B2B] text-white border-t border-[#3D3D3D] text-xs">
      {/* 4 Feature Columns */}
      <div className="border-b border-stone-800 py-8 px-4 sm:px-6 lg:px-8 bg-[#222222]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-white/10 border border-white/20 text-[#E11D48] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">Nationwide Delivery</div>
              <div className="text-[11px] text-[#B3B3B3]">Inside Dhaka in 24h · 64 Districts</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-white/10 border border-white/20 text-[#E11D48] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">100% Genuine BD</div>
              <div className="text-[11px] text-[#B3B3B3]">Official Brand Warranties Verified</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-white/10 border border-white/20 text-[#E11D48] flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">7-Day Replacement</div>
              <div className="text-[11px] text-[#B3B3B3]">Doorstep Return &amp; Exchange</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-white/10 border border-white/20 text-[#E11D48] flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">Dedicated Hotline</div>
              <div className="text-[11px] text-[#B3B3B3]">09612-DESHI · 9 AM - 10 PM</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-3">
          <div className="text-xl font-extrabold text-white font-serif uppercase tracking-tight">
            Deshi commerce
          </div>
          <p className="text-[#D4D4D4] leading-relaxed text-xs">
            Deshi commerce is Bangladesh’s premier omnichannel retail platform, combining authentic Bangladeshi craftsmanship—Dhakai Jamdani and handcrafted festive Panjabis—with verified contemporary consumer electronics and organic superfoods.
          </p>
          <div className="pt-2 text-[11px] text-[#B3B3B3]">
            Registered with Dhaka South City Corporation · Trade License #TRAD/DSCC/028491
          </div>
        </div>

        <div className="md:col-span-2 space-y-2.5">
          <div className="font-bold text-white text-xs uppercase tracking-wider">Top Collections</div>
          <ul className="space-y-1.5 text-xs text-[#D4D4D4]">
            <li>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategorySlug('mobile');
                  setCurrentView('catalog');
                }}
                className="rounded-none hover:text-[#E11D48] transition-colors cursor-pointer text-left"
              >
                Mobile &amp; Gadgets
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategorySlug('fashion');
                  setCurrentView('catalog');
                }}
                className="rounded-none hover:text-[#E11D48] transition-colors cursor-pointer text-left"
              >
                Aarong &amp; Deshi Wear
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategorySlug('electronics');
                  setCurrentView('catalog');
                }}
                className="rounded-none hover:text-[#E11D48] transition-colors cursor-pointer text-left"
              >
                Laptops &amp; Computing
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategorySlug('organic-grocery');
                  setCurrentView('catalog');
                }}
                className="rounded-none hover:text-[#E11D48] transition-colors cursor-pointer text-left"
              >
                Sundarbans Raw Honey
              </button>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3 space-y-2.5">
          <div className="font-bold text-white text-xs uppercase tracking-wider">Customer Care &amp; Hubs</div>
          <ul className="space-y-2 text-xs text-[#D4D4D4]">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#E11D48] shrink-0 mt-0.5" />
              <span>Central Hub: Dhanmondi 27, Dhaka-1209, Bangladesh</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#E11D48] shrink-0" />
              <span>Support: +880 1722-222222</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#E11D48] shrink-0" />
              <span>Email: care@deshicommerce.com.bd</span>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3 space-y-3">
          <div className="font-bold text-white text-xs uppercase tracking-wider">Payment Escrow Partners</div>
          <p className="text-[11px] text-[#B3B3B3]">
            All online transactions are processed through SSLCommerz with dual OTP verification:
          </p>
          <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
            <span className="px-2 py-1 bg-stone-800 text-white border border-stone-700">
              bKash
            </span>
            <span className="px-2 py-1 bg-stone-800 text-white border border-stone-700">
              Nagad
            </span>
            <span className="px-2 py-1 bg-stone-800 text-white border border-stone-700">
              Rocket
            </span>
            <span className="px-2 py-1 bg-stone-800 text-white border border-stone-700">
              Visa / Master
            </span>
            <span className="px-2 py-1 bg-[#E11D48]/20 text-rose-300 border border-[#E11D48]/50">
              Cash on Delivery
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-800 py-5 px-4 sm:px-6 lg:px-8 text-[11px] text-[#B3B3B3]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            &copy; 2026 Deshi commerce Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentView('orders')}
              className="rounded-none hover:text-[#E11D48] transition-colors cursor-pointer"
            >
              Order Tracking
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setCurrentView('account')}
              className="rounded-none hover:text-[#E11D48] transition-colors cursor-pointer"
            >
              My Account
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('faq-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else {
                  setCurrentView('home');
                  setTimeout(() => {
                    document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 200);
                }
              }}
              className="rounded-none hover:text-[#E11D48] transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
