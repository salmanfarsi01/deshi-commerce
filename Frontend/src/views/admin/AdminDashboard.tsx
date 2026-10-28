import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Layers,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  Sparkles,
  Users,
  HelpCircle,
  Menu,
  Zap,
  Gift,
  Bell,
  MessageCircle,
  LogOut,
  ExternalLink,
  RefreshCw,
  Download,
  Plus,
  X,
  UserCheck,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService, checkBackendConnection } from '../../services/apiClient';
import footerLogo from '../../images/footer logo.png';
import {
  AdminDashboardSummary,
  Order,
  Product,
  Category,
  NotificationLog,
  Customer360Profile,
  OrderStatus,
  TimeframeSlicer,
  TrendDataPoint,
  DonutSlice,
  HeroShowcaseItem,
  User,
  FAQItem,
  FlashSaleCampaign,
  SupportTicket,
} from '../../types';
import { INITIAL_HERO_SHOWCASE } from '../../services/dbStorage';
import { formatBDT } from '../../data/bangladeshGeo';

// Modular Tab Components
import { AdminKpiCards } from './components/AdminKpiCards';
import { AdminSalesTrendChart } from './components/AdminSalesTrendChart';
import { AdminPieChart } from './components/AdminPieChart';
import { AdminFlashSaleTab } from './components/AdminFlashSaleTab';
import { AdminSpecialOffersTab } from './components/AdminSpecialOffersTab';
import { AdminLiveChatTab } from './components/AdminLiveChatTab';
import { AdminOrdersTab } from './components/AdminOrdersTab';
import { AdminProductsTab } from './components/AdminProductsTab';
import { AdminCategoriesTab } from './components/AdminCategoriesTab';
import { AdminHeroTab } from './components/AdminHeroTab';
import { AdminUsersTab } from './components/AdminUsersTab';
import { AdminFaqsTab } from './components/AdminFaqsTab';
import { AdminSupportTab } from './components/AdminSupportTab';

const ProductUploadModal = React.lazy(() =>
  import('./components/ProductUploadModal').then((m) => ({ default: m.ProductUploadModal }))
);
const CourierDispatchModal = React.lazy(() =>
  import('./components/CourierDispatchModal').then((m) => ({ default: m.CourierDispatchModal }))
);
const Customer360Modal = React.lazy(() =>
  import('./components/Customer360Modal').then((m) => ({ default: m.Customer360Modal }))
);

export const AdminDashboard: React.FC = () => {
  const { showToast, navigateTo, user, logout } = useApp();

  const handleSignOut = () => {
    logout();
    showToast('Signed out of Admin Portal.', 'info');
    navigateTo('/admin');
  };

  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'products' | 'flash-sale' | 'special-offers' | 'hero' | 'categories' | 'users' | 'faqs' | 'notifications' | 'live-chat'
  >('overview');

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [flashCampaign, setFlashCampaign] = useState<FlashSaleCampaign | null>(null);
  const [specialOffersCount, setSpecialOffersCount] = useState<number>(0);

  // Connectivity status indicator (Live PostgreSQL vs Offline Local Sandbox)
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);

  // Summary & Datasets
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroShowcaseItem[]>([]);
  const [isHeroSaving, setIsHeroSaving] = useState(false);
  const [uploadingHeroIndex, setUploadingHeroIndex] = useState<number | null>(null);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // User Management State
  const [usersList, setUsersList] = useState<User[]>([]);
  const [inspectingUser, setInspectingUser] = useState<User | null>(null);
  const [userSearch, setUserSearch] = useState<string>('');

  // FAQ Management State
  const [faqsList, setFaqsList] = useState<FAQItem[]>([]);
  const [editingFaq, setEditingFaq] = useState<Partial<FAQItem> | null>(null);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [isFaqSaving, setIsFaqSaving] = useState(false);
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<string>('ALL');

  // Timeframe slicer for Sales Trend & KPI
  const [timeframe, setTimeframe] = useState<TimeframeSlicer>('month');

  // Filter Slicers
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [productSearch, setProductSearch] = useState<string>('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('ALL');
  const [productStockFilter, setProductStockFilter] = useState<string>('ALL');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [selectedOrderForCourier, setSelectedOrderForCourier] = useState<Order | null>(null);
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState<Customer360Profile | null>(null);
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Customer Support Inquiries State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [supportFilter, setSupportFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [supportSearch, setSupportSearch] = useState<string>('');
  const [notificationSubTab, setNotificationSubTab] = useState<'SUPPORT' | 'LOGS'>('SUPPORT');
  const [ticketNotesInput, setTicketNotesInput] = useState<{ [ticketId: string]: string }>({});
  const [unreadChatsCount, setUnreadChatsCount] = useState<number>(0);

  // Verify backend health & sync data
  const checkConnectivity = async () => {
    const isLive = await checkBackendConnection();
    setIsBackendConnected(isLive);
  };

  // Load all initial data from API service
  const loadData = async () => {
    setLoading(true);
    checkConnectivity();
    try {
      const [sumRes, ordRes, prdRes, catRes, notRes, heroRes, usersRes, faqsRes, flashRes, offersRes, ticketsRes, chatRes] = await Promise.all([
        apiService.admin.getDashboardSummary(),
        apiService.admin.getOrders(),
        apiService.products.getAll({ size: 100 }),
        apiService.categories.getAll(),
        apiService.admin.getNotifications(),
        apiService.hero.getShowcase(),
        apiService.admin.getUsers(),
        apiService.faq.getAll(),
        apiService.flashSale.getCampaign(),
        apiService.specialOffers.getCampaign(),
        apiService.support.getTickets(),
        apiService.chat.getConversations(),
      ]);
      setSummary(sumRes.data);
      setOrders(ordRes.data);
      setProducts(prdRes.data.products);
      setCategories(catRes.data);
      setNotifications(notRes.data);
      setHeroSlides(heroRes.data?.length ? heroRes.data : INITIAL_HERO_SHOWCASE);
      setUsersList(usersRes.data || []);
      setFaqsList(faqsRes.data || []);
      if (flashRes.data) setFlashCampaign(flashRes.data);
      if (offersRes.data?.items) {
        setSpecialOffersCount(offersRes.data.items.filter((i) => i.active).length);
      }
      if (ticketsRes?.data) setSupportTickets(ticketsRes.data);
      if (chatRes?.data) {
        const unread = chatRes.data.reduce((acc, c) => acc + (c.unreadAdminCount || 0), 0);
        setUnreadChatsCount(unread);
      }
    } catch (err) {
      console.error(err);
      showToast('Error syncing admin metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleTicketAdded = () => {
      apiService.support.getTickets().then((res) => {
        if (res.data) setSupportTickets(res.data);
      });
      apiService.admin.getNotifications().then((res) => {
        if (res.data) setNotifications(res.data);
      });
      showToast('New Customer Support message received!', 'info');
    };

    const handleChatUpdate = () => {
      apiService.chat.getConversations().then((res) => {
        if (res.data) {
          const unread = res.data.reduce((acc, c) => acc + (c.unreadAdminCount || 0), 0);
          setUnreadChatsCount(unread);
        }
      });
    };

    window.addEventListener('deshi_support_ticket_added', handleTicketAdded);
    window.addEventListener('support_ticket_submitted', handleTicketAdded);
    window.addEventListener('deshi_chat_updated', handleChatUpdate);
    return () => {
      window.removeEventListener('deshi_support_ticket_added', handleTicketAdded);
      window.removeEventListener('support_ticket_submitted', handleTicketAdded);
      window.removeEventListener('deshi_chat_updated', handleChatUpdate);
    };
  }, []);

  const openTicketsCount = useMemo(() => {
    return supportTickets.filter((t) => t.status === 'OPEN').length;
  }, [supportTickets]);

  const handleUpdateTicketStatus = async (
    ticketId: string,
    newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
  ) => {
    try {
      await apiService.support.updateTicket(ticketId, { status: newStatus });
      setSupportTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
      showToast(`Support inquiry #${ticketId} status changed to ${newStatus}`, 'success');
    } catch {
      showToast('Failed to update ticket status', 'error');
    }
  };

  const handleSaveTicketNote = async (ticketId: string) => {
    const note = ticketNotesInput[ticketId];
    if (note === undefined) return;
    try {
      await apiService.support.updateTicket(ticketId, { adminNotes: note.trim() });
      setSupportTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, adminNotes: note.trim() } : t))
      );
      showToast('Resolution note saved', 'success');
    } catch {
      showToast('Failed to save resolution note', 'error');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this customer inquiry?')) return;
    try {
      await apiService.support.deleteTicket(ticketId);
      setSupportTickets((prev) => prev.filter((t) => t.id !== ticketId));
      showToast('Support ticket deleted', 'info');
    } catch {
      showToast('Failed to delete ticket', 'error');
    }
  };

  // Sales Trend & Data Points
  const trendData: TrendDataPoint[] = useMemo(() => {
    if (timeframe === 'day') {
      return [
        { label: '00:00', revenue: 12000, orders: 4 },
        { label: '04:00', revenue: 4500, orders: 1 },
        { label: '08:00', revenue: 38000, orders: 11 },
        { label: '12:00', revenue: 95000, orders: 28 },
        { label: '16:00', revenue: 142000, orders: 42 },
        { label: '20:00', revenue: 188000, orders: 55 },
        { label: '23:59', revenue: 84000, orders: 22 },
      ];
    }
    if (timeframe === 'week') {
      return [
        { label: 'Mon', revenue: 145000, orders: 42 },
        { label: 'Tue', revenue: 182000, orders: 51 },
        { label: 'Wed', revenue: 210000, orders: 63 },
        { label: 'Thu', revenue: 195000, orders: 58 },
        { label: 'Fri', revenue: 320000, orders: 94 },
        { label: 'Sat', revenue: 290000, orders: 85 },
        { label: 'Sun', revenue: 245000, orders: 72 },
      ];
    }
    return [
      { label: 'Jan', revenue: 820000, orders: 240 },
      { label: 'Feb', revenue: 940000, orders: 280 },
      { label: 'Mar', revenue: 1120000, orders: 340 },
      { label: 'Apr', revenue: 1050000, orders: 310 },
      { label: 'May', revenue: 1380000, orders: 410 },
      { label: 'Jun', revenue: 1590000, orders: 480 },
      { label: 'Jul', revenue: 1482900, orders: 452 },
    ];
  }, [timeframe]);

  // Computed KPI aggregates
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0) || (summary?.totalRevenue ?? 1482900);
  }, [orders, summary]);

  const totalUnitsSold = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.items.reduce((acc, i) => acc + i.quantity, 0), 0) || 542;
  }, [orders]);

  const averageOrderValue = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'CANCELLED');
    return validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 3450;
  }, [orders, totalRevenue]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING').length;
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock <= 5).length;
  }, [products]);

  // Category Distribution Slices
  const categorySlices: DonutSlice[] = useMemo(() => {
    const catMap: Record<string, { count: number; revenue: number }> = {};
    products.forEach((p) => {
      const catName = p.categoryName || 'General';
      if (!catMap[catName]) catMap[catName] = { count: 0, revenue: 0 };
      catMap[catName].count++;
      catMap[catName].revenue += p.price * Math.max(1, p.stock);
    });
    const colors = ['#0F172A', '#E11D48', '#2563EB', '#059669', '#D97706', '#7C3AED', '#DB2777'];
    return Object.entries(catMap).map(([name, data], idx) => ({
      label: name,
      value: data.revenue,
      percentage: Math.round((data.count / Math.max(1, products.length)) * 100),
      color: colors[idx % colors.length],
      formattedValue: `${data.count} items`,
    }));
  }, [products]);

  // Order Pipeline Status Slices
  const statusSlices: DonutSlice[] = useMemo(() => {
    const total = orders.length || 1;
    const pending = orders.filter((o) => o.status === 'PENDING').length;
    const processing = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PROCESSING').length;
    const shipped = orders.filter((o) => o.status === 'SHIPPED').length;
    const delivered = orders.filter((o) => o.status === 'DELIVERED').length;
    const cancelled = orders.filter((o) => o.status === 'CANCELLED').length;

    return [
      { label: 'Delivered', value: delivered || 24, percentage: Math.round(((delivered || 24) / total) * 100), color: '#10B981', formattedValue: `${delivered || 24} orders` },
      { label: 'Shipped', value: shipped || 8, percentage: Math.round(((shipped || 8) / total) * 100), color: '#3B82F6', formattedValue: `${shipped || 8} orders` },
      { label: 'Processing', value: processing || 5, percentage: Math.round(((processing || 5) / total) * 100), color: '#F59E0B', formattedValue: `${processing || 5} orders` },
      { label: 'Pending', value: pending || 3, percentage: Math.round(((pending || 3) / total) * 100), color: '#8B5CF6', formattedValue: `${pending || 3} orders` },
      { label: 'Cancelled', value: cancelled || 2, percentage: Math.round(((cancelled || 2) / total) * 100), color: '#EF4444', formattedValue: `${cancelled || 2} orders` },
    ];
  }, [orders]);

  // Payment Method Distribution Slices
  const paymentSlices: DonutSlice[] = useMemo(() => {
    const total = orders.length || 1;
    const ssl = orders.filter((o) => o.paymentMethod === 'SSLCOMMERZ').length;
    const cod = orders.filter((o) => o.paymentMethod === 'COD').length;
    const bkash = orders.filter((o) => o.paymentMethod === 'BKASH' || o.paymentMethod === 'NAGAD').length;

    return [
      { label: 'SSLCommerz Gateway', value: ssl || 14, percentage: Math.round(((ssl || 14) / (total + 8)) * 100), color: '#6366F1', formattedValue: `${ssl || 14} orders` },
      { label: 'Cash on Delivery (COD)', value: cod || 18, percentage: Math.round(((cod || 18) / (total + 8)) * 100), color: '#0284C7', formattedValue: `${cod || 18} orders` },
      { label: 'bKash / Nagad Direct', value: bkash || 7, percentage: Math.round(((bkash || 7) / (total + 8)) * 100), color: '#EC4899', formattedValue: `${bkash || 7} orders` },
    ];
  }, [orders]);

  // Handlers
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${userName}"? This will erase their account.`)) return;
    try {
      await apiService.admin.deleteUser(userId);
      setUsersList((prev) => prev.filter((u) => u.id !== userId));
      showToast(`User account "${userName}" has been deleted`, 'success');
      if (inspectingUser?.id === userId) {
        setInspectingUser(null);
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete user', 'error');
    }
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq?.question?.trim() || !editingFaq?.answer?.trim()) {
      showToast('Question and Answer are required', 'error');
      return;
    }
    try {
      setIsFaqSaving(true);
      const res = await apiService.faq.save(editingFaq);
      showToast(res.message || 'FAQ saved successfully. Customer storefront updated.', 'success');
      setIsFaqModalOpen(false);
      setEditingFaq(null);
      const updated = await apiService.faq.getAll();
      setFaqsList(updated.data || []);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save FAQ', 'error');
    } finally {
      setIsFaqSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string, question: string) => {
    if (!confirm(`Delete FAQ: "${question}"?`)) return;
    try {
      await apiService.faq.delete(id);
      setFaqsList((prev) => prev.filter((f) => f.id !== id));
      showToast('FAQ deleted. Customer storefront updated automatically.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete FAQ', 'error');
    }
  };

  const handleAssignCourier = async (
    orderId: string,
    courierData: {
      courierName: string;
      trackingNumber: string;
      trackingUrl?: string;
      estimatedDeliveryDate?: string;
      advanceToShipped?: boolean;
    }
  ) => {
    try {
      const res = await apiService.admin.updateTracking(orderId, courierData);
      showToast(`Courier assigned to #${res.data?.orderNumber || orderId}! Customer SMS sent.`, 'success');
      const ordRes = await apiService.admin.getOrders();
      setOrders(ordRes.data);
    } catch (err: any) {
      console.error('Failed to assign courier:', err);
      showToast(err?.message || 'Failed to assign courier', 'error');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    try {
      const res = await apiService.admin.updateStatus(orderId, newStatus);
      showToast(
        res.message || `Order #${res.data?.orderNumber || orderId} status changed to ${newStatus}`,
        'success'
      );
      const ordRes = await apiService.admin.getOrders();
      setOrders(ordRes.data);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      showToast(err?.message || 'Failed to update status', 'error');
      const ordRes = await apiService.admin.getOrders();
      setOrders(ordRes.data);
    }
  };

  const handleOpenCustomer360 = async (userId: string) => {
    try {
      const res = await apiService.admin.getCustomer360(userId);
      setSelectedCustomerProfile(res.data);
    } catch {
      showToast('Could not load customer history', 'error');
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (productData.id) {
        const res = await apiService.products.update(productData.id, productData);
        showToast(res.message || `Product "${productData.name}" updated successfully`, 'success');
      } else {
        const res = await apiService.products.create(productData);
        showToast(res.message || `Product "${productData.name}" added to catalog`, 'success');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      console.error('Failed to save product:', err);
      showToast(err?.message || 'Error saving product', 'error');
    } finally {
      loadData();
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await apiService.products.delete(id);
      showToast('Product removed from catalog', 'info');
      loadData();
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  const handleStockQuickAdjust = async (productId: string, delta: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const newStock = Math.max(0, (prod.stock || 0) + delta);
    try {
      await apiService.products.update(productId, { stock: newStock });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      );
      showToast(`Stock updated to ${newStock} units`, 'success');
    } catch {
      showToast('Could not adjust stock', 'error');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;
    try {
      if (editingCategory.id) {
        await apiService.categories.update(editingCategory.id, editingCategory);
        showToast('Category updated', 'success');
      } else {
        await apiService.categories.create(editingCategory);
        showToast('Category created', 'success');
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      loadData();
    } catch {
      showToast('Failed to save category', 'error');
    }
  };

  const handleExportCSV = () => {
    const headers = ['OrderNumber', 'Customer', 'Phone', 'District', 'Total', 'Status', 'Payment', 'Courier'];
    const rows = orders.map((o) => [
      o.orderNumber,
      `"${o.customerName}"`,
      o.customerPhone,
      o.shippingAddress?.district || 'Dhaka',
      o.totalAmount,
      o.status,
      o.paymentMethod,
      o.courier ? `"${o.courier.courierName} (${o.courier.trackingNumber})"` : 'Unassigned',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Deshi_Commerce_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Orders report exported to CSV', 'success');
  };

  // Hero Showcase Handlers
  const handleHeroImageUpload = async (index: number, file: File) => {
    try {
      setUploadingHeroIndex(index);
      const res = await apiService.admin.uploadImage(file);
      const uploadedUrl = res.data.url;
      setHeroSlides((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], image: uploadedUrl };
        return updated;
      });
      showToast('Hero image uploaded successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload hero image', 'error');
    } finally {
      setUploadingHeroIndex(null);
    }
  };

  const handleHeroFieldChange = (index: number, field: keyof HeroShowcaseItem, value: any) => {
    setHeroSlides((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveHeroSlides = async () => {
    try {
      setIsHeroSaving(true);
      await apiService.hero.updateShowcase(heroSlides);
      showToast('Hero section showcase updated! Storefront now reflects the new images & products.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to save hero showcase', 'error');
    } finally {
      setIsHeroSaving(false);
    }
  };

  const handleAddHeroSlide = () => {
    const newSlide: HeroShowcaseItem = {
      id: `hero_${Date.now()}`,
      title: 'New Featured Product',
      slug: 'featured-product',
      store: 'Official Flagship Store',
      price: 2999,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    };
    setHeroSlides((prev) => [...prev, newSlide]);
    setPreviewSlideIndex(heroSlides.length);
    showToast('New slide added. Configure details and click Save.', 'info');
  };

  const handleDeleteHeroSlide = (index: number) => {
    if (heroSlides.length <= 1) {
      showToast('At least one hero slide must remain in the showcase', 'error');
      return;
    }
    setHeroSlides((prev) => prev.filter((_, i) => i !== index));
    if (previewSlideIndex >= heroSlides.length - 1) {
      setPreviewSlideIndex(Math.max(0, heroSlides.length - 2));
    }
    showToast('Slide removed from showcase list', 'info');
  };

  const handleMoveHeroSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= heroSlides.length) return;
    setHeroSlides((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
    setPreviewSlideIndex(targetIndex);
  };

  const handleResetHeroSlides = () => {
    if (confirm('Reset hero showcase to original defaults?')) {
      setHeroSlides(INITIAL_HERO_SHOWCASE);
      setPreviewSlideIndex(0);
      showToast('Reset to default slides. Click Save to persist.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-950 text-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Mobile Close */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={footerLogo} alt="Deshi Commerce" className="h-8 w-auto object-contain brightness-0 invert" />
            <div>
              <span className="text-xs font-bold text-white tracking-wider uppercase block">Deshi Admin</span>
              <span className="text-[10px] text-emerald-400 font-mono font-medium block">Executive Portal</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
          {/* Overview */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('overview');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="flex-1 text-left">Dashboard</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">KPI</span>
          </button>

          {/* Customer Orders */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('orders');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            <span className="flex-1 text-left">Orders &amp; Dispatch</span>
            {pendingOrdersCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-pulse">
                {pendingOrdersCount}
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono">{orders.length}</span>
            )}
          </button>

          {/* Products & Inventory */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('products');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-indigo-400" />
            <span className="flex-1 text-left">Products Catalog</span>
            <span className="text-[10px] text-slate-500 font-mono">{products.length}</span>
          </button>

          {/* Flash Sale Campaign */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('flash-sale');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'flash-sale'
                ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="flex-1 text-left">Flash Sale</span>
            {flashCampaign?.active && (
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider animate-pulse">
                Live
              </span>
            )}
          </button>

          {/* Special Offers / BOGO */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('special-offers');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'special-offers'
                ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Gift className="w-4 h-4 text-purple-400" />
            <span className="flex-1 text-left">Special Offers</span>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {specialOffersCount} Deals
            </span>
          </button>

          {/* Hero Section Showcase */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('hero');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'hero'
                ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="flex-1 text-left">Hero Banners</span>
            <span className="text-[10px] text-slate-500 font-mono">{heroSlides.length}</span>
          </button>

          {/* Categories */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('categories');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span className="flex-1 text-left">Categories</span>
            <span className="text-[10px] text-slate-500 font-mono">{categories.length}</span>
          </button>

          {/* Users */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('users');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span className="flex-1 text-left">Users</span>
            <span className="text-[10px] text-slate-500 font-mono">{usersList.length}</span>
          </button>

          {/* FAQs */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('faqs');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'faqs'
                ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-teal-400" />
            <span className="flex-1 text-left">FAQs</span>
            <span className="text-[10px] text-slate-500 font-mono">{faqsList.length}</span>
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('notifications');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bell className="w-4 h-4 text-rose-400" />
            <span className="flex-1 text-left">Inquiries &amp; Alerts</span>
            {openTicketsCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse shadow-xs">
                {openTicketsCount} new
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 font-mono">{supportTickets.length}</span>
            )}
          </button>

          {/* Live Chat Direct Messaging */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('live-chat');
              setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'live-chat'
                ? 'bg-slate-800 text-white shadow-xs ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span className="flex-1 text-left">Live Chat Support</span>
            {unreadChatsCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white animate-pulse shadow-xs">
                {unreadChatsCount} new
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-mono font-medium">Direct</span>
            )}
          </button>
        </nav>

        {/* Sidebar Footer with Admin Profile & Sign Out */}
        <div className="p-3 border-t border-slate-800 space-y-2.5">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
            <img
              src={user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=RahimAdmin'}
              alt={user?.name || 'Admin'}
              className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {user?.name || 'Administrator'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                {user?.email || 'admin@store.com.bd'}
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Session active" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              title="View Storefront"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 text-xs font-semibold rounded-lg border border-rose-900/50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN VIEW AREA */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 capitalize tracking-tight flex items-center gap-2">
                <span>
                  {activeTab === 'overview' && 'Executive Analytics Overview'}
                  {activeTab === 'orders' && 'Customer Orders & Dispatches'}
                  {activeTab === 'products' && 'Product Inventory Catalog'}
                  {activeTab === 'flash-sale' && 'Flash Sale Campaign Control'}
                  {activeTab === 'special-offers' && 'Special Deals & BOGO Bundles'}
                  {activeTab === 'hero' && 'Homepage Hero Showcase'}
                  {activeTab === 'categories' && 'Catalog Category Architecture'}
                  {activeTab === 'users' && 'Customer User Management'}
                  {activeTab === 'faqs' && 'Store FAQ & Help Center Editor'}
                  {activeTab === 'notifications' && 'Customer Inquiries & Audit Trail'}
                  {activeTab === 'live-chat' && 'Live Customer Chat Console'}
                </span>

                {/* 3.3 LIVE VS MOCK CONNECTIVITY INDICATOR BADGE */}
                {isBackendConnected === true && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live PostgreSQL API
                  </span>
                )}
                {isBackendConnected === false && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs" title="Connected to Local Browser Sandbox (Spring Boot offline)">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Offline Demo Sandbox
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Deshi Commerce BD &bull; Enterprise Admin Console
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 sm:px-3 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Customer Support Inquiries"
            >
              <Bell className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden md:inline text-xs font-semibold">Inquiries</span>
              {openTicketsCount > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-rose-600 rounded-full animate-pulse shadow-xs">
                  {openTicketsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="p-2 sm:px-3 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Refresh all metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="hidden sm:flex px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>

            {/* Admin Profile & Sign Out Button */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden md:flex items-center gap-2 text-right">
                <img
                  src={user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=RahimAdmin'}
                  alt={user?.name || 'Admin'}
                  className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 object-cover"
                />
                <div className="hidden lg:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {user?.name || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium font-mono">
                    Super Admin
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-semibold border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Sign Out of Admin Console"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* 3. MAIN DASHBOARD CONTENT */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24">
          {/* TAB: FLASH SALE */}
          {activeTab === 'flash-sale' && (
            <AdminFlashSaleTab
              products={products}
              categories={categories}
              onProductsUpdated={loadData}
            />
          )}

          {/* TAB: SPECIAL OFFERS */}
          {activeTab === 'special-offers' && (
            <AdminSpecialOffersTab
              products={products}
              categories={categories}
              onOffersUpdated={loadData}
            />
          )}

          {/* TAB 1: EXECUTIVE ANALYTICS DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards Strip */}
              <AdminKpiCards
                totalRevenue={totalRevenue}
                totalOrders={orders.length}
                totalUnitsSold={totalUnitsSold}
                averageOrderValue={averageOrderValue}
                pendingOrders={pendingOrdersCount}
                lowStockProducts={lowStockCount}
                monthlyGrowthRate={summary?.monthlyGrowthRate || 18.4}
                ordersFulfilledRate={summary?.ordersFulfilledRate || 75}
                onFilterPendingOrders={() => {
                  setOrderStatusFilter('PENDING');
                  setActiveTab('orders');
                }}
                onFilterLowStock={() => {
                  setProductStockFilter('LOW_STOCK');
                  setActiveTab('products');
                }}
              />

              {/* Sales Trend Visualizer */}
              <AdminSalesTrendChart
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                data={trendData}
              />

              {/* 3 Pie / Donut Charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AdminPieChart
                  title="Sales by Category"
                  subtitle="Share of catalog inventory &amp; sales"
                  slices={categorySlices}
                  centerSubtitle="Catalog"
                  centerTitle={`${products.length} Items`}
                />
                <AdminPieChart
                  title="Order Status Pipeline"
                  subtitle="Live customer delivery stages"
                  slices={statusSlices}
                  centerSubtitle="Total"
                  centerTitle={`${orders.length} Orders`}
                />
                <AdminPieChart
                  title="Payment Methods Share"
                  subtitle="SSLCommerz Gateway vs COD"
                  slices={paymentSlices}
                  centerSubtitle="Gateway"
                  centerTitle="SSL + COD"
                />
              </div>

              {/* Recent Orders Snapshot in Dashboard */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Recent Customer Transactions
                    </h3>
                    <p className="text-xs text-slate-500">
                      Latest orders received across Inside Dhaka &amp; Outside Dhaka
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All {orders.length} Orders</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Order #</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Region</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Courier</th>
                        <th className="py-2.5 px-3 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.slice(0, 5).map((o) => {
                        const isDhaka = o.shippingAddress?.district?.toLowerCase() === 'dhaka';
                        return (
                          <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              #{o.orderNumber}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-slate-800 block">
                                {o.customerName}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {o.customerPhone}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isDhaka ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {isDhaka ? 'Dhaka (৳60)' : `${o.shippingAddress?.district || 'Outside'} (৳120)`}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              {formatBDT(o.totalAmount)}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                o.status === 'DELIVERED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : o.status === 'SHIPPED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : o.status === 'CANCELLED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              {o.courier ? (
                                <span className="text-[11px] font-medium text-slate-700">
                                  {o.courier.courierName} ({o.courier.trackingNumber})
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">
                                  Unassigned
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedOrderForCourier(o)}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors cursor-pointer"
                              >
                                Dispatch
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <AdminOrdersTab
              orders={orders}
              orderSearch={orderSearch}
              onOrderSearchChange={setOrderSearch}
              orderStatusFilter={orderStatusFilter}
              onOrderStatusFilterChange={setOrderStatusFilter}
              onStatusChange={handleStatusChange}
              onOpenCustomer360={handleOpenCustomer360}
              onSelectCourier={setSelectedOrderForCourier}
              onInspectOrder={setInspectingOrder}
            />
          )}

          {/* TAB 3: PRODUCTS */}
          {activeTab === 'products' && (
            <AdminProductsTab
              products={products}
              categories={categories}
              productSearch={productSearch}
              onProductSearchChange={setProductSearch}
              productCategoryFilter={productCategoryFilter}
              onProductCategoryFilterChange={setProductCategoryFilter}
              productStockFilter={productStockFilter}
              onProductStockFilterChange={setProductStockFilter}
              onUploadClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              onEditProduct={(p) => {
                setEditingProduct(p);
                setIsProductModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              onStockQuickAdjust={handleStockQuickAdjust}
            />
          )}

          {/* TAB 4: HERO SECTION SHOWCASE */}
          {activeTab === 'hero' && (
            <AdminHeroTab
              heroSlides={heroSlides}
              previewSlideIndex={previewSlideIndex}
              onPreviewSlideIndexChange={setPreviewSlideIndex}
              isHeroSaving={isHeroSaving}
              uploadingHeroIndex={uploadingHeroIndex}
              onAddSlide={handleAddHeroSlide}
              onDeleteSlide={handleDeleteHeroSlide}
              onMoveSlide={handleMoveHeroSlide}
              onResetSlides={handleResetHeroSlides}
              onSaveSlides={handleSaveHeroSlides}
              onFieldChange={handleHeroFieldChange}
              onImageUpload={handleHeroImageUpload}
            />
          )}

          {/* TAB 5: CATEGORIES */}
          {activeTab === 'categories' && (
            <AdminCategoriesTab
              categories={categories}
              products={products}
              onAddCategory={() => {
                setEditingCategory(null);
                setIsCategoryModalOpen(true);
              }}
              onEditCategory={(c) => {
                setEditingCategory(c);
                setIsCategoryModalOpen(true);
              }}
            />
          )}

          {/* TAB 6: USERS */}
          {activeTab === 'users' && (
            <AdminUsersTab
              usersList={usersList}
              orders={orders}
              userSearch={userSearch}
              onUserSearchChange={setUserSearch}
              onInspectUser={setInspectingUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {/* TAB 7: FAQS */}
          {activeTab === 'faqs' && (
            <AdminFaqsTab
              faqsList={faqsList}
              faqCategoryFilter={faqCategoryFilter}
              onFaqCategoryFilterChange={setFaqCategoryFilter}
              onAddFaq={() => {
                setEditingFaq({
                  category: 'general',
                  question: '',
                  questionBn: '',
                  answer: '',
                  answerBn: '',
                });
                setIsFaqModalOpen(true);
              }}
              onEditFaq={(faq) => {
                setEditingFaq(faq);
                setIsFaqModalOpen(true);
              }}
              onDeleteFaq={handleDeleteFaq}
            />
          )}

          {/* TAB 8: CUSTOMER INQUIRIES & DISPATCH AUDIT LOGS */}
          {activeTab === 'notifications' && (
            <AdminSupportTab
              supportTickets={supportTickets}
              openTicketsCount={openTicketsCount}
              supportFilter={supportFilter}
              onSupportFilterChange={setSupportFilter}
              supportSearch={supportSearch}
              onSupportSearchChange={setSupportSearch}
              notifications={notifications}
              notificationSubTab={notificationSubTab}
              onNotificationSubTabChange={setNotificationSubTab}
              ticketNotesInput={ticketNotesInput}
              onTicketNotesInputChange={(id, val) =>
                setTicketNotesInput((prev) => ({ ...prev, [id]: val }))
              }
              onSaveTicketNote={handleSaveTicketNote}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              onDeleteTicket={handleDeleteTicket}
              onViewOrder={(ordNum) => {
                setOrderStatusFilter('ALL');
                setOrderSearch(ordNum);
                setActiveTab('orders');
              }}
            />
          )}

          {/* TAB 9: LIVE CHAT DIRECT MESSAGING */}
          {activeTab === 'live-chat' && (
            <AdminLiveChatTab
              onInspectCustomer={(userId) => {
                const target = usersList.find((u) => u.id === userId || u.phone === userId || u.email === userId);
                if (target) {
                  setInspectingUser(target);
                } else {
                  showToast(`Customer #${userId} profile details not found in database`, 'info');
                }
              }}
            />
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* GLOBAL MODALS */}
      {/* ========================================================================= */}

      {/* 1. Upload Product Modal */}
      {isProductModalOpen && (
        <React.Suspense fallback={null}>
          <ProductUploadModal
            isOpen={isProductModalOpen}
            onClose={() => {
              setIsProductModalOpen(false);
              setEditingProduct(null);
            }}
            onSave={handleSaveProduct}
            initialProduct={editingProduct}
            categories={categories}
          />
        </React.Suspense>
      )}

      {/* 2. Courier Dispatch Modal */}
      {selectedOrderForCourier && (
        <React.Suspense fallback={null}>
          <CourierDispatchModal
            order={selectedOrderForCourier}
            onClose={() => setSelectedOrderForCourier(null)}
            onAssign={handleAssignCourier}
          />
        </React.Suspense>
      )}

      {/* 3. Customer 360 Profile Modal */}
      {selectedCustomerProfile && (
        <React.Suspense fallback={null}>
          <Customer360Modal
            profile={selectedCustomerProfile}
            onClose={() => setSelectedCustomerProfile(null)}
          />
        </React.Suspense>
      )}

      {/* 4. Order Invoice Inspection Drawer / Modal */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">
                Order Receipt &bull; #{inspectingOrder.orderNumber}
              </h3>
              <button
                type="button"
                onClick={() => setInspectingOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-900">{inspectingOrder.customerName}</span>
                <p className="text-slate-600 font-mono">{inspectingOrder.customerPhone}</p>
                <p className="text-slate-500 text-[11px]">
                  {inspectingOrder.shippingAddress?.streetAddress}, {inspectingOrder.shippingAddress?.district}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-2">
                  Purchased Items
                </span>
                <div className="space-y-2">
                  {inspectingOrder.items.map((i, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-900">{i.productName}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">
                          Qty: {i.quantity} &times; {formatBDT(i.price)}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {formatBDT(i.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1 font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatBDT(inspectingOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Charge</span>
                  <span>{formatBDT(inspectingOrder.deliveryCharge)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total</span>
                  <span>{formatBDT(inspectingOrder.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingOrder(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Category Create / Edit Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingCategory?.id ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory?.name || ''}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Bangla Name
                </label>
                <input
                  type="text"
                  value={editingCategory?.nameBn || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, nameBn: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={editingCategory?.slug || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, slug: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingCategory?.description || ''}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. User Sign-Up Information Dossier Modal */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                  <UserCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Customer Profile &amp; Sign-Up Dossier
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ID: {inspectingUser.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              <div className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50/40 rounded-xl border border-sky-100 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-full bg-sky-200 text-sky-900 font-bold text-lg flex items-center justify-center shrink-0 uppercase border-2 border-white shadow-xs">
                    {inspectingUser.avatarUrl ? (
                      <img src={inspectingUser.avatarUrl} alt={inspectingUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      inspectingUser.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      {inspectingUser.name || 'Anonymous User'}
                    </h4>
                    <p className="text-slate-600 font-medium text-xs mt-0.5">
                      {inspectingUser.email || 'No email registered'}
                    </p>
                    <p className="text-slate-500 font-mono text-[11px]">
                      {inspectingUser.phone || 'No phone registered'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      inspectingUser.role === 'ADMIN'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {inspectingUser.role || 'CUSTOMER'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium capitalize">
                    Via {inspectingUser.authProvider || 'Phone OTP'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Registration &amp; Security Attributes
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Full Name</span>
                    <span className="font-bold text-slate-800">{inspectingUser.name || 'N/A'}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Sign-Up Timestamp</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {inspectingUser.createdAt
                        ? new Date(inspectingUser.createdAt).toLocaleString('en-GB')
                        : 'Pre-existing Account'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Verified Phone</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {inspectingUser.phone || 'Not verified'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Verified Email</span>
                    <span className="font-semibold text-slate-800">
                      {inspectingUser.email || 'Not verified'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Authentication Method</span>
                    <span className="font-semibold text-slate-800 capitalize">
                      {inspectingUser.authProvider === 'google'
                        ? 'Google OAuth 2.0 Single Sign-On'
                        : inspectingUser.authProvider === 'email'
                        ? 'Email & Password'
                        : 'Phone OTP Authentication'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-medium">Total Lifetime Spend</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatBDT(
                        orders
                          .filter((o) => o.userId === inspectingUser.id)
                          .reduce((s, o) => s + (o.totalAmount || 0), 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Order History ({orders.filter((o) => o.userId === inspectingUser.id).length} Orders)
                </span>
                {orders.filter((o) => o.userId === inspectingUser.id).length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-lg text-slate-400 text-center text-xs">
                    This customer has not placed any orders yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {orders
                      .filter((o) => o.userId === inspectingUser.id)
                      .map((ord) => (
                        <div
                          key={ord.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/70 rounded-lg border border-slate-100 transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block font-mono">
                              #{ord.orderNumber}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {ord.items.length} items &bull; {ord.paymentMethod}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-900 block">
                              {formatBDT(ord.totalAmount)}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDeleteUser(inspectingUser.id, inspectingUser.name)}
                className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 border border-rose-300"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete User Account</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectingUser(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Add / Edit Store FAQ Modal */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
                  <HelpCircle className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingFaq?.id ? 'Edit FAQ Question' : 'Add New FAQ Question'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFaqModalOpen(false);
                  setEditingFaq(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  FAQ Category *
                </label>
                <select
                  value={editingFaq?.category || 'general'}
                  onChange={(e) =>
                    setEditingFaq({
                      ...editingFaq,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="delivery">Delivery &amp; Shipping</option>
                  <option value="payment">Payment &amp; COD</option>
                  <option value="returns">Returns &amp; Replacement</option>
                  <option value="warranty">Warranty &amp; Guarantee</option>
                  <option value="general">General Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Question (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How long does delivery take inside Dhaka?"
                  value={editingFaq?.question || ''}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, question: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Question (Bengali)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ঢাকা সিটির ভেতরে ডেলিভারি হতে কত দিন সময় লাগে?"
                  value={editingFaq?.questionBn || ''}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, questionBn: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Answer (English) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed answer shown to customers..."
                  value={editingFaq?.answer || ''}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, answer: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Answer (Bengali)
                </label>
                <textarea
                  rows={2}
                  placeholder="বাংলায় বিস্তারিত উত্তর..."
                  value={editingFaq?.answerBn || ''}
                  onChange={(e) =>
                    setEditingFaq({ ...editingFaq, answerBn: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsFaqModalOpen(false);
                    setEditingFaq(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFaqSaving}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isFaqSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isFaqSaving ? 'Saving...' : 'Save FAQ Question'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
