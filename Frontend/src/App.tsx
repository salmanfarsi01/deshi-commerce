import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { CatalogView } from './views/CatalogView';
import { ProductDetailView } from './views/ProductDetailView';
import { CheckoutView } from './views/CheckoutView';
import { OrderDetailView } from './views/OrderDetailView';
import { AccountView } from './views/AccountView';
import { WishlistView } from './views/WishlistView';
import { ContactSupportModal } from './components/ContactSupportModal';
import { AdminDashboard } from './views/admin/AdminDashboard';
import { AdminLoginView } from './views/admin/AdminLoginView';

const MainLayout: React.FC = () => {
  const { currentView, isAdminRoute, isAdmin } = useApp();

  // If URL path is /admin or subpaths, require Admin Sign In
  if (isAdminRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#2B2B2B] font-sans">
        {isAdmin ? <AdminDashboard /> : <AdminLoginView />}
        <ToastContainer />
      </div>
    );
  }

  // Customer Ecommerce Storefront (Zero admin cues)
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#2B2B2B] font-sans">
      <Header />

      <main className="flex-1">
        {currentView === 'home' && <CatalogView isLanding={true} />}
        {currentView === 'catalog' && <CatalogView isLanding={false} />}
        {currentView === 'wishlist' && <WishlistView />}
        {currentView === 'product-detail' && <ProductDetailView />}
        {currentView === 'checkout' && <CheckoutView />}
        {currentView === 'order-detail' && <OrderDetailView />}
        {currentView === 'orders' && <AccountView />}
        {currentView === 'account' && <AccountView />}
      </main>

      <Footer />

      {/* Global Overlays & Modals for Customer Storefront */}
      <CartDrawer />
      <AuthModal />
      <ContactSupportModal />
      <ToastContainer />
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
