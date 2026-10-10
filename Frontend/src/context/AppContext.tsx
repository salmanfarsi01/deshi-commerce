import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Cart, Order, Address } from '../types';
import { apiService } from '../services/apiClient';
import { translations, Language } from '../data/translations';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface AppContextType {
  // Routing
  pathname: string;
  navigateTo: (path: string) => void;
  isAdminRoute: boolean;

  // Auth
  user: User | null;
  isAdmin: boolean;
  isAuthLoading: boolean;
  login: (identifier: string, password?: string) => Promise<void>;
  adminLogin: (identifier: string, password?: string) => Promise<void>;
  sendRegistrationOtp: (phone: string, name?: string) => Promise<{ success: boolean; demoOtp?: string; message?: string }>;
  register: (payload: { name: string; phone: string; email?: string; password?: string; otp?: string }) => Promise<void>;
  loginWithGoogle: (payload: { email: string; name: string; avatarUrl?: string; googleId?: string }) => Promise<void>;
  registerWithGoogle: (payload: { email: string; name: string; avatarUrl?: string; googleId?: string }) => Promise<void>;
  logout: () => void;
  switchUserRole: (role: 'CUSTOMER' | 'ADMIN') => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<User | null>;

  // Cart
  cart: Cart;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Location selector (Dhaka vs Outside Dhaka)
  selectedRegion: 'Dhaka' | 'Outside Dhaka';
  setSelectedRegion: (region: 'Dhaka' | 'Outside Dhaka') => void;

  // Language & Currency
  lang: 'en' | 'bn';
  toggleLang: () => void;
  setLang: (lang: 'en' | 'bn') => void;
  t: (key: string, defaultText?: string) => string;

  // Customer View routing & modals
  currentView: 'home' | 'catalog' | 'product-detail' | 'checkout' | 'orders' | 'order-detail' | 'account' | 'wishlist' | 'faq';
  setCurrentView: (view: 'home' | 'catalog' | 'product-detail' | 'checkout' | 'orders' | 'order-detail' | 'account' | 'wishlist' | 'faq') => void;
  selectedProductSlug: string | null;
  viewProductDetail: (slug: string) => void;
  selectedOrderId: string | null;
  viewOrderDetail: (orderId: string) => void;

  // Support Contact Modal & Chatbot
  isSupportModalOpen: boolean;
  setIsSupportModalOpen: (open: boolean) => void;
  openSupportModal: () => void;
  closeSupportModal: () => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
  chatUnreadCount: number;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategorySlug: string;
  setSelectedCategorySlug: (slug: string) => void;

  // Auth Modal
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info', title?: string) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [cart, setCart] = useState<Cart>({
    id: 'init',
    items: [],
    subtotal: 0,
    itemCount: 0,
    freeDeliveryThreshold: 5000,
    eligibleForFreeDelivery: false,
    amountNeededForFreeDelivery: 5000,
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('deshi_wishlist_v1');
      return stored ? JSON.parse(stored) : ['prd_samsung_a55', 'prd_aarong_panjabi'];
    } catch {
      return ['prd_samsung_a55'];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<'Dhaka' | 'Outside Dhaka'>('Dhaka');
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [currentView, setCurrentView] = useState<AppContextType['currentView']>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname || '';
      if (path === '/faq') return 'faq';
    }
    return 'home';
  });
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Check chat unread count for current user
  useEffect(() => {
    const checkUnread = async () => {
      try {
        const convs = await apiService.chat.getConversations();
        if (convs.data) {
          const guestChatId = typeof window !== 'undefined' ? localStorage.getItem('deshi_guest_chat_id') : null;
          const userConv = user
            ? convs.data.find((c) => c.userId === user.id)
            : convs.data.find((c) => c.id === guestChatId);
          if (userConv) {
            setChatUnreadCount(userConv.unreadUserCount || 0);
          }
        }
      } catch {
        // ignore
      }
    };
    checkUnread();

    const handler = () => checkUnread();
    window.addEventListener('deshi_chat_updated', handler);
    window.addEventListener('deshi_user_notif_updated', handler);
    return () => {
      window.removeEventListener('deshi_chat_updated', handler);
      window.removeEventListener('deshi_user_notif_updated', handler);
    };
  }, [user]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setPathname(path);
      if (path === '/faq') {
        setCurrentView('faq');
      } else if (path === '/' || path === '') {
        setCurrentView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setPathname(path);
      if (path === '/faq') {
        setCurrentView('faq');
      } else if (path === '/' || path === '') {
        setCurrentView('home');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isAdminRoute = pathname.startsWith('/admin');

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const res = await apiService.cart.get();
      setCart(res.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const res = await apiService.auth.getProfile();
      setUser(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    refreshCart();
  }, [loadProfile, refreshCart]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem('deshi_wishlist_v1', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      showToast(exists ? 'Removed from wishlist' : 'Added to your wishlist!', 'info');
      return next;
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'bn' : 'en'));
  };

  const t = useCallback(
    (key: string, defaultText?: string): string => {
      const currentDict = translations[lang] || translations.en;
      if (currentDict && currentDict[key]) {
        return currentDict[key];
      }
      const fallbackDict = translations.en;
      if (fallbackDict && fallbackDict[key]) {
        return fallbackDict[key];
      }
      return defaultText !== undefined ? defaultText : key;
    },
    [lang]
  );

  const login = async (identifier: string, password?: string) => {
    try {
      const res = await apiService.auth.login({ identifier, password });
      setUser(res.data.user);
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${res.data.user.name}!`, 'success');
      refreshCart();
    } catch (e: any) {
      showToast(e?.message || 'Login failed. Please check your credentials.', 'error');
      throw e;
    }
  };

  const adminLogin = async (identifier: string, password?: string) => {
    try {
      const res = await apiService.auth.adminLogin({ identifier, password });
      setUser(res.data.user);
      showToast(`Admin access granted. Welcome, ${res.data.user.name}!`, 'success');
      refreshCart();
    } catch (e: any) {
      showToast(e?.message || 'Admin login failed. Please check credentials.', 'error');
      throw e;
    }
  };

  const sendRegistrationOtp = async (phone: string, name?: string) => {
    try {
      const res = await apiService.auth.sendRegistrationOtp({ phone, name });
      return { success: true, demoOtp: res.data.demoOtp, message: res.data.message };
    } catch (e: any) {
      showToast(e.message || 'Could not dispatch verification code', 'error');
      throw e;
    }
  };

  const register = async (payload: { name: string; phone: string; email?: string; password?: string; otp?: string }) => {
    try {
      const res = await apiService.auth.register(payload);
      setUser(res.data.user);
      setIsAuthModalOpen(false);
      showToast('Account registered and verified successfully!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Registration failed. Please check inputs.', 'error');
      throw e;
    }
  };

  const loginWithGoogle = async (payload: { email: string; name: string; avatarUrl?: string; googleId?: string }) => {
    try {
      const res = await apiService.auth.googleAuth({ ...payload, isSignUp: false });
      setUser(res.data.user);
      setIsAuthModalOpen(false);
      showToast(res.message || `Signed in with Google Mail as ${res.data.user.name}`, 'success');
      refreshCart();
    } catch (e) {
      showToast('Google Mail sign-in failed. Please try again.', 'error');
    }
  };

  const registerWithGoogle = async (payload: { email: string; name: string; avatarUrl?: string; googleId?: string }) => {
    try {
      const res = await apiService.auth.googleAuth({ ...payload, isSignUp: true });
      setUser(res.data.user);
      setIsAuthModalOpen(false);
      showToast(res.message || `Welcome to Deshi commerce, ${res.data.user.name}!`, 'success');
      refreshCart();
    } catch (e) {
      showToast('Google Mail sign-up failed. Please try again.', 'error');
    }
  };

  const logout = () => {
    apiService.auth.logout();
    setUser(null);
    showToast('You have been signed out.', 'info');
  };

  const switchUserRole = async (role: 'CUSTOMER' | 'ADMIN') => {
    try {
      const res = await apiService.auth.switchDemoUser(role);
      setUser(res.data);
      refreshCart();
    } catch (e) {
      console.error(e);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      const res = await apiService.auth.updateProfile(data);
      if (res.data) {
        setUser(res.data);
        showToast('Profile updated successfully!', 'success');
        return res.data;
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to update profile', 'error');
    }
    return null;
  };

  const addToCart = async (productId: string, quantity = 1) => {
    try {
      const res = await apiService.cart.addItem(productId, quantity);
      setCart(res.data);
      showToast('Item added to shopping bag', 'success');
      setIsCartOpen(true);
    } catch (e) {
      showToast('Could not add item to bag', 'error');
    }
  };

  const updateCartQuantity = async (itemId: string, quantity: number) => {
    try {
      const res = await apiService.cart.updateItem(itemId, quantity);
      setCart(res.data);
    } catch (e) {
      showToast('Could not update quantity', 'error');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const res = await apiService.cart.removeItem(itemId);
      setCart(res.data);
      showToast('Item removed from shopping bag', 'info');
    } catch (e) {
      showToast('Could not remove item', 'error');
    }
  };

  const clearCart = async () => {
    try {
      const res = await apiService.cart.clear();
      setCart(res.data);
      showToast('Shopping bag cleared', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  const viewProductDetail = (slug: string) => {
    setSelectedProductSlug(slug);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentView('order-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppContext.Provider
      value={{
        pathname,
        navigateTo,
        isAdminRoute,
        user,
        isAdmin: user?.role === 'ADMIN',
        isAuthLoading,
        login,
        adminLogin,
        sendRegistrationOtp,
        register,
        loginWithGoogle,
        registerWithGoogle,
        logout,
        switchUserRole,
        updateUserProfile,
        cart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        wishlist,
        toggleWishlist,
        isWishlisted,
        selectedRegion,
        setSelectedRegion,
        lang,
        toggleLang,
        setLang,
        t,
        currentView,
        setCurrentView,
        selectedProductSlug,
        viewProductDetail,
        selectedOrderId,
        viewOrderDetail,
        searchQuery,
        setSearchQuery,
        selectedCategorySlug,
        setSelectedCategorySlug,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal: (tab: 'login' | 'register' = 'login') => {
          setAuthModalTab(tab);
          setIsAuthModalOpen(true);
        },
        closeAuthModal: () => setIsAuthModalOpen(false),
        isSupportModalOpen,
        setIsSupportModalOpen,
        openSupportModal: () => setIsSupportModalOpen(true),
        closeSupportModal: () => setIsSupportModalOpen(false),
        isChatOpen,
        setIsChatOpen,
        openChat: () => setIsChatOpen(true),
        closeChat: () => setIsChatOpen(false),
        chatUnreadCount,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
