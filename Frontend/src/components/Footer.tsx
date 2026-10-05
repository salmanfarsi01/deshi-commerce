import { ShieldCheck, Truck, RotateCcw, Phone, Mail, MapPin, Headphones, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import footerLogo from '../images/footer logo.png';

export const Footer: React.FC = () => {
  const { setCurrentView, setSelectedCategorySlug, openSupportModal, navigateTo, t, lang } = useApp();

  return (
    <footer className="bg-[#0F172A] text-white border-t border-slate-800 text-xs font-sans">
      {/* 4 Feature Columns Strip */}
      <div className="border-b border-slate-800 py-6 px-4 sm:px-6 lg:px-8 bg-slate-950">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-rose-400 flex items-center justify-center shrink-0 border border-slate-700">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">
                {lang === 'bn' ? 'সারা বাংলাদেশে ডেলিভারি' : 'Nationwide Delivery'}
              </div>
              <div className="text-[11px] text-slate-400">
                {lang === 'bn' ? '২৪ ঘণ্টায় ঢাকায় · ৬৪ জেলায়' : 'Inside Dhaka in 24h · 64 Districts'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-rose-400 flex items-center justify-center shrink-0 border border-slate-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">
                {lang === 'bn' ? '১০০% আসল পণ্য' : '100% Genuine BD'}
              </div>
              <div className="text-[11px] text-slate-400">
                {lang === 'bn' ? 'যাচাইকৃত ব্র্যান্ড ওয়ারেন্টি' : 'Official Warranties Verified'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-rose-400 flex items-center justify-center shrink-0 border border-slate-700">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">
                {lang === 'bn' ? '৭ দিনের রিপ্লেসমেন্ট' : '7-Day Replacement'}
              </div>
              <div className="text-[11px] text-slate-400">
                {lang === 'bn' ? 'সহজ রিটার্ন ও এক্সচেঞ্জ' : 'Doorstep Return & Exchange'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-rose-400 flex items-center justify-center shrink-0 border border-slate-700">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">
                {lang === 'bn' ? 'ডেডিকেটেড হটলাইন' : 'Dedicated Hotline'}
              </div>
              <div className="text-[11px] text-slate-400">
                09612-DESHI · 9 AM - 10 PM
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center">
            <img
              src={footerLogo}
              alt="Deshi Commerce"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </div>
          <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
            {t('footer.about.text', 'Your trusted destination for authentic Bangladeshi products with verified courier delivery across all 64 districts.')}
          </p>
          <div className="pt-2 text-[11px] text-slate-500 font-mono">
            Dhaka South City Corp Trade Lic #TRAD/DSCC/028491
          </div>
        </div>

        <div className="md:col-span-3 space-y-2.5">
          <div className="font-bold text-white text-xs uppercase tracking-wider">
            {lang === 'bn' ? 'জনপ্রিয় কালেকশন' : 'Top Collections'}
          </div>
          <ul className="space-y-1.5 text-xs text-slate-400">
            <li>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategorySlug('mobile');
                  setCurrentView('catalog');
                }}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                {t('cat.mobile', 'Mobiles & Tablets')}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategorySlug('fashion');
                  setCurrentView('catalog');
                }}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                {t('cat.fashion', 'Fashion & Wear')}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategorySlug('electronics');
                  setCurrentView('catalog');
                }}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                {t('cat.electronics', 'Electronics & Gadgets')}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategorySlug('organic-grocery');
                  setCurrentView('catalog');
                }}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                {t('cat.grocery', 'Food & Grocery')}
              </button>
            </li>
          </ul>
        </div>

        <div className="md:col-span-4 space-y-2.5">
          <div className="font-bold text-white text-xs uppercase tracking-wider">
            {t('footer.help', 'Customer Care')}
          </div>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>09612-DESHI (33744) &bull; 9 AM – 10 PM</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>support@deshicommerce.com.bd</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>Gulshan-2, Dhaka-1212, Bangladesh</span>
            </li>
          </ul>

          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openSupportModal}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Headphones className="w-3.5 h-3.5 text-rose-400" />
              <span>{lang === 'bn' ? 'সাপোর্ট ফরম' : 'Submit Support Ticket'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView('faq');
                navigateTo('/faq');
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'bn' ? 'সাধারণ জিজ্ঞাসা (FAQ)' : 'Help & FAQs'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="border-t border-slate-800 py-4 px-4 sm:px-6 lg:px-8 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            &copy; {new Date().getFullYear()} Deshi Commerce Bangladesh. {t('footer.rights', 'All rights reserved.')}
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              type="button"
              onClick={() => navigateTo('/admin')}
              className="hover:text-rose-400 transition-colors cursor-pointer text-[11px] flex items-center gap-1 font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
