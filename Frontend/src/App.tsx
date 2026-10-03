import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { CatalogView } from './views/CatalogView';
import { ContactSupportModal } from './components/ContactSupportModal';
import { WhatsAppChatWidget } from './components/WhatsAppChatWidget';

// Code-split heavy views to keep initial bundle lean and fast
const AdminDashboard = lazy(() =>
  import('./views/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const AdminLoginView = lazy(() =>
  import('./views/admin/AdminLoginView').then((m) => ({ default: m.AdminLoginView }))
);
const ProductDetailView = lazy(() =>
  import('./views/ProductDetailView').then((m) => ({ default: m.ProductDetailView }))
);
const CheckoutView = lazy(() =>
  import('./views/CheckoutView').then((m) => ({ default: m.CheckoutView }))
);
const OrderDetailView = lazy(() =>
  import('./views/OrderDetailView').then((m) => ({ default: m.OrderDetailView }))
);
const AccountView = lazy(() =>
  import('./views/AccountView').then((m) => ({ default: m.AccountView }))
);
const WishlistView = lazy(() =>
  import('./views/WishlistView').then((m) => ({ default: m.WishlistView }))
);

const ViewLoadingFallback = () => (
  <div className="py-24 flex flex-col items-center justify-center gap-3">
    <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loading view...</span>
  </div>
);

const AdminLoadingFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-3">
    <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    <p className="text-sm font-medium tracking-wide text-slate-300">Loading Deshi Admin Workspace...</p>
  </div>
);

const MainLayout: React.FC = () => {
  const { currentView, isAdminRoute, isAdmin } = useApp();

  // If URL path is /admin or subpaths, require Admin Sign In
  if (isAdminRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#2B2B2B] font-sans">
        <Suspense fallback={<AdminLoadingFallback />}>
          {isAdmin ? <AdminDashboard /> : <AdminLoginView />}
        </Suspense>
        <ToastContainer />
      </div>
    );
  }

  // Customer Ecommerce Storefront (Zero admin cues)
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#2B2B2B] font-sans">
      <Header />

      <main className="flex-1">
        <Suspense fallback={<ViewLoadingFallback />}>
          {currentView === 'home' && <CatalogView isLanding={true} />}
          {currentView === 'catalog' && <CatalogView isLanding={false} />}
          {currentView === 'wishlist' && <WishlistView />}
          {currentView === 'product-detail' && <ProductDetailView />}
          {currentView === 'checkout' && <CheckoutView />}
          {currentView === 'order-detail' && <OrderDetailView />}
          {currentView === 'orders' && <AccountView />}
          {currentView === 'account' && <AccountView />}
        </Suspense>
      </main>

      <Footer />

      {/* Global Overlays & Modals for Customer Storefront */}
      <CartDrawer />
      <AuthModal />
      <ContactSupportModal />
      <ToastContainer />
      <WhatsAppChatWidget />
      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
