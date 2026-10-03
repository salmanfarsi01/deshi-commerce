import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Search,
  Truck,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  X,
  Mail,
  Smartphone,
  Layers,
  ArrowUpRight,
  Download,
  ExternalLink,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Eye,
  Sparkles,
  UploadCloud,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Users,
  HelpCircle,
  Shield,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiClient';
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
} from '../../types';
import { INITIAL_HERO_SHOWCASE } from '../../services/dbStorage';
import { formatBDT } from '../../data/bangladeshGeo';
import { AdminKpiCards } from './components/AdminKpiCards';
import { AdminSalesTrendChart } from './components/AdminSalesTrendChart';
import { AdminPieChart } from './components/AdminPieChart';
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
  const { showToast, navigateTo } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'products' | 'hero' | 'categories' | 'users' | 'faqs' | 'notifications'
  >('overview');

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

  // Load all initial data from API service
  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, ordRes, prdRes, catRes, notRes, heroRes, usersRes, faqsRes] = await Promise.all([
        apiService.admin.getDashboardSummary(),
        apiService.admin.getOrders(),
        apiService.products.getAll({ size: 100 }),
        apiService.categories.getAll(),
        apiService.admin.getNotifications(),
        apiService.hero.getShowcase(),
        apiService.admin.getUsers(),
        apiService.faq.getAll(),
      ]);
      setSummary(sumRes.data);
      setOrders(ordRes.data);
      setProducts(prdRes.data.products);
      setCategories(catRes.data);
      setNotifications(notRes.data);
      setHeroSlides(heroRes.data?.length ? heroRes.data : INITIAL_HERO_SHOWCASE);
      setUsersList(usersRes.data || []);
      setFaqsList(faqsRes.data || []);
    } catch (err) {
      console.error(err);
      showToast('Error syncing admin metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  // 1. Dynamic Trend Data based on Timeframe Slicer
  const trendData: TrendDataPoint[] = useMemo(() => {
    if (timeframe === 'day') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map((day, i) => {
        const rev = 48000 + (i * 19500) % 62000 + (i >= 4 ? 38000 : 0);
        const orderCount = Math.max(4, Math.round(rev / 3200));
        return {
          label: day,
          subLabel: `Day ${i + 1}`,
          revenue: rev,
          orders: orderCount,
          units: orderCount * 2 + (i % 2),
        };
      });
    } else if (timeframe === 'week') {
      return [
        { label: 'Wk 1', subLabel: 'Aug 04', revenue: 290000, orders: 48, units: 98 },
        { label: 'Wk 2', subLabel: 'Aug 11', revenue: 325000, orders: 55, units: 115 },
        { label: 'Wk 3', subLabel: 'Aug 18', revenue: 380000, orders: 62, units: 130 },
        { label: 'Wk 4', subLabel: 'Aug 25', revenue: 410000, orders: 70, units: 145 },
        { label: 'Wk 5', subLabel: 'Sep 01', revenue: 440000, orders: 74, units: 152 },
        { label: 'Wk 6', subLabel: 'Sep 08', revenue: 465000, orders: 79, units: 168 },
        { label: 'Wk 7', subLabel: 'Sep 15', revenue: 512000, orders: 88, units: 184 },
        { label: 'Wk 8', subLabel: 'Sep 22', revenue: 548000, orders: 94, units: 196 },
      ];
    } else if (timeframe === 'year') {
      return [
        { label: '2024', subLabel: 'FY24', revenue: 6800000, orders: 1250, units: 2840 },
        { label: '2025', subLabel: 'FY25', revenue: 11400000, orders: 2180, units: 4950 },
        { label: '2026', subLabel: 'FY26', revenue: 14829000, orders: 2940, units: 6820 },
      ];
    } else {
      // Monthly 12-month progression
      return [
        { label: 'Jan', revenue: 580000, orders: 92, units: 180 },
        { label: 'Feb', revenue: 640000, orders: 104, units: 210 },
        { label: 'Mar', revenue: 720000, orders: 118, units: 245 },
        { label: 'Apr', revenue: 820000, orders: 135, units: 280 },
        { label: 'May', revenue: 960000, orders: 154, units: 320 },
        { label: 'Jun', revenue: 1120000, orders: 178, units: 375 },
        { label: 'Jul', revenue: 1250000, orders: 195, units: 410 },
        { label: 'Aug', revenue: 1390000, orders: 215, units: 460 },
        { label: 'Sep', revenue: 1482900, orders: 232, units: 504 },
        { label: 'Oct', revenue: 1560000, orders: 245, units: 530 },
        { label: 'Nov', revenue: 1690000, orders: 268, units: 580 },
        { label: 'Dec', revenue: 1890000, orders: 305, units: 660 },
      ];
    }
  }, [timeframe]);

  // 2. Computed KPI aggregates
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

  // 3. Category Distribution Slices
  const categorySlices: DonutSlice[] = useMemo(() => {
    const catMap: Record<string, { count: number; revenue: number }> = {};
    products.forEach((p) => {
      const catName = p.categoryName || 'General';
      if (!catMap[catName]) catMap[catName] = { count: 0, revenue: 0 };
      catMap[catName].count++;
      catMap[catName].revenue += p.price * Math.max(1, p.stock);
    });
    const total = Object.values(catMap).reduce((s, v) => s + v.revenue, 0) || 1;
    const colors = ['#0F172A', '#E11D48', '#2563EB', '#059669', '#D97706', '#7C3AED', '#DB2777'];
    return Object.entries(catMap).map(([name, data], idx) => ({
      label: name,
      value: data.revenue,
      percentage: Math.max(1, Math.round((data.revenue / total) * 100)),
      color: colors[idx % colors.length],
      formattedValue: formatBDT(data.revenue),
    }));
  }, [products]);

  // 4. Status Distribution Slices
  const statusSlices: DonutSlice[] = useMemo(() => {
    const total = orders.length || 1;
    const statusCounts: Record<OrderStatus, number> = {
      DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
      SHIPPED: orders.filter((o) => o.status === 'SHIPPED').length,
      PROCESSING: orders.filter((o) => o.status === 'PROCESSING').length,
      CONFIRMED: orders.filter((o) => o.status === 'CONFIRMED').length,
      PENDING: orders.filter((o) => o.status === 'PENDING').length,
      CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
    };
    const colorMap: Record<OrderStatus, string> = {
      DELIVERED: '#059669',
      SHIPPED: '#2563EB',
      PROCESSING: '#D97706',
      CONFIRMED: '#4F46E5',
      PENDING: '#E11D48',
      CANCELLED: '#64748B',
    };
    return (Object.entries(statusCounts) as [OrderStatus, number][])
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        label: status,
        value: count,
        percentage: Math.round((count / total) * 100),
        color: colorMap[status] || '#94A3B8',
        formattedValue: `${count} orders`,
      }));
  }, [orders]);

  // 5. Payment Channel Slices
  const paymentSlices: DonutSlice[] = useMemo(() => {
    const total = orders.length || 1;
    const ssl = orders.filter((o) => o.paymentMethod === 'SSLCOMMERZ').length;
    const cod = orders.filter((o) => o.paymentMethod === 'COD').length;
    const bkash = orders.filter((o) => o.paymentMethod === 'BKASH' || o.paymentMethod === 'NAGAD').length;

    return [
      {
        label: 'SSLCommerz Cards/Net',
        value: ssl || 14,
        percentage: Math.round(((ssl || 14) / (total + 8)) * 100),
        color: '#6366F1',
        formattedValue: `${ssl || 14} orders`,
      },
      {
        label: 'Cash on Delivery (COD)',
        value: cod || 18,
        percentage: Math.round(((cod || 18) / (total + 8)) * 100),
        color: '#0284C7',
        formattedValue: `${cod || 18} orders`,
      },
      {
        label: 'bKash / Nagad Direct',
        value: bkash || 7,
        percentage: Math.round(((bkash || 7) / (total + 8)) * 100),
        color: '#EC4899',
        formattedValue: `${bkash || 7} orders`,
      },
    ];
  }, [orders]);

  // 6. Filtered Orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter !== 'ALL' && o.status !== orderStatusFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          o.shippingAddress?.district?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // 7. Filtered Products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (productCategoryFilter !== 'ALL' && p.categoryId !== productCategoryFilter) return false;
      if (productStockFilter === 'LOW_STOCK' && p.stock > 5) return false;
      if (productStockFilter === 'OUT_OF_STOCK' && p.stock > 0) return false;
      if (productStockFilter === 'IN_STOCK' && p.stock <= 0) return false;
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, productCategoryFilter, productStockFilter, productSearch]);

  // 8. Filtered Users list
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase();
      return (
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q))
      );
    });
  }, [usersList, userSearch]);

  // 9. Filtered FAQs list
  const filteredFaqs = useMemo(() => {
    return faqsList.filter((f) => {
      if (faqCategoryFilter !== 'ALL' && f.category !== faqCategoryFilter) return false;
      return true;
    });
  }, [faqsList, faqCategoryFilter]);

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
    // Optimistic update: instantly reflect the change in table dropdown
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const res = await apiService.admin.updateStatus(orderId, newStatus);
      showToast(
        res.message || `Order #${res.data?.orderNumber || orderId} status changed to ${newStatus}`,
        'success'
      );
      // Sync fresh list in background
      const ordRes = await apiService.admin.getOrders();
      setOrders(ordRes.data);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      showToast(err?.message || 'Failed to update status', 'error');
      // Revert if error
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
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-900 font-sans">
      {/* 1. TOP EXECUTIVE HEADER */}
      <header className="bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-3.5 border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="shrink-0 flex items-center">
              <img src={footerLogo} alt="Deshi Commerce" className="h-8 w-auto object-contain" />
            </div>
            <div className="border-l border-slate-800 pl-3">
              <h1 className="text-base font-bold tracking-tight text-white">
                Admin Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Refresh all metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
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
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Upload Product</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold rounded-lg border border-rose-500/40 transition-colors cursor-pointer flex items-center gap-1.5 ml-1"
              title="Switch to customer storefront view"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. NAVIGATION TABS */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex gap-6 overflow-x-auto text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'overview'
                ? 'border-slate-900 text-slate-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Dashboard &amp; Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'orders'
                ? 'border-slate-900 text-slate-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Truck className="w-4 h-4 text-blue-600" />
            <span>Customer Orders ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`py-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'products'
                ? 'border-slate-900 text-slate-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4 text-indigo-600" />
            <span>Product Inventory ({products.length})</span>
            {lowStockCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                {lowStockCount} low
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`py-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'hero'
                ? 'border-slate-900 text-slate-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Hero Showcase ({heroSlides.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`py-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'categories'
                ? 'border-slate-900 text-slate-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`py-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'users'
                ? 'border-slate-900 text-slate-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-sky-600" />
            <span>Users &amp; Accounts ({usersList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faqs')}
            className={`py-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'faqs'
                ? 'border-slate-900 text-slate-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-teal-600" />
            <span>Store FAQs ({faqsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`py-3.5 border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'notifications'
                ? 'border-slate-900 text-slate-900 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4 text-rose-600" />
            <span>Audit Trail &amp; SMS ({notifications.length})</span>
          </button>
        </div>
      </nav>

      {/* 3. MAIN DASHBOARD CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ========================================================================= */}
        {/* TAB 1: EXECUTIVE ANALYTICS DASHBOARD & SLICER */}
        {/* ========================================================================= */}
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

            {/* Sales Trend Visualizer with Timeframe Slicers */}
            <AdminSalesTrendChart
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              data={trendData}
            />

            {/* 3 Pie / Donut Charts: Category Distribution, Pipeline Status, and Payment Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pie Chart 1: Revenue by Category */}
              <AdminPieChart
                title="Sales by Category"
                subtitle="Share of catalog inventory &amp; sales"
                slices={categorySlices}
                centerSubtitle="Catalog"
                centerTitle={`${products.length} Items`}
              />

              {/* Pie Chart 2: Order Status Pipeline */}
              <AdminPieChart
                title="Order Status Pipeline"
                subtitle="Live customer delivery stages"
                slices={statusSlices}
                centerSubtitle="Total"
                centerTitle={`${orders.length} Orders`}
              />

              {/* Pie Chart 3: Payment Method Share */}
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
                              onClick={() => {
                                setSelectedOrderForCourier(o);
                              }}
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

        {/* ========================================================================= */}
        {/* TAB 2: CUSTOMER ORDERS & DISPATCH TRACKING */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Search and Slicer Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by order #, customer, phone, district..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Status Slicer Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      orderStatusFilter === st
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'ALL' ? 'All Orders' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Order Number</th>
                      <th className="py-3 px-4">Customer &amp; Phone</th>
                      <th className="py-3 px-4">Delivery Region</th>
                      <th className="py-3 px-4">Items / Total</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Order Status</th>
                      <th className="py-3 px-4">Courier Tracking</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          No customer orders match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => {
                        const isDhaka = o.shippingAddress?.district?.toLowerCase() === 'dhaka';
                        return (
                          <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-slate-900 block">
                                #{o.orderNumber}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => handleOpenCustomer360(o.userId)}
                                className="font-semibold text-blue-600 hover:underline block text-left cursor-pointer"
                                title="Click to view Customer 360 profile"
                              >
                                {o.customerName}
                              </button>
                              <span className="text-[10px] font-mono text-slate-500">
                                {o.customerPhone}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isDhaka ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {isDhaka ? 'Inside Dhaka (৳60)' : `${o.shippingAddress?.district || 'Outside'} (৳120)`}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate max-w-[140px] mt-0.5">
                                {o.shippingAddress?.streetAddress}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-slate-900 block">
                                {formatBDT(o.totalAmount)}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {o.items.length} item(s)
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                o.paymentStatus === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {o.paymentMethod} &bull; {o.paymentStatus}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <select
                                value={o.status}
                                onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                                className="px-2 py-1 text-[11px] font-bold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="PROCESSING">PROCESSING</option>
                                <option value="SHIPPED">SHIPPED</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </td>

                            <td className="py-3 px-4">
                              {o.courier ? (
                                <div>
                                  <span className="font-semibold text-slate-800 block text-[11px]">
                                    {o.courier.courierName}
                                  </span>
                                  <a
                                    href={o.courier.trackingUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-mono text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    <span>{o.courier.trackingNumber}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderForCourier(o)}
                                  className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Truck className="w-3 h-3" />
                                  <span>Assign Courier</span>
                                </button>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setInspectingOrder(o)}
                                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md cursor-pointer"
                                  title="View invoice details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderForCourier(o)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                                  title="Update courier tracking"
                                >
                                  <Truck className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PRODUCT INVENTORY & UPLOAD */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Search and Slicer Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by title, SKU, brand..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Slicers: Category & Stock status */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Category Slicer */}
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-semibold text-slate-700"
                >
                  <option value="ALL">All Categories ({products.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                {/* Stock Level Slicer */}
                <select
                  value={productStockFilter}
                  onChange={(e) => setProductStockFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-semibold text-slate-700"
                >
                  <option value="ALL">All Stock Levels</option>
                  <option value="IN_STOCK">In Stock (&gt; 0)</option>
                  <option value="LOW_STOCK">Low Stock Alert (&le; 5)</option>
                  <option value="OUT_OF_STOCK">Out of Stock (0)</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Product</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Item &amp; Image</th>
                      <th className="py-3 px-4">Category &amp; Brand</th>
                      <th className="py-3 px-4">Buying Cost</th>
                      <th className="py-3 px-4">Selling / Offer Price</th>
                      <th className="py-3 px-4">Profit / Unit (Margin)</th>
                      <th className="py-3 px-4">Stock Level (Quick Adjust)</th>
                      <th className="py-3 px-4">Status &amp; Rating</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          No catalog items found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const hasDiscount = p.discountPrice && p.discountPrice < p.price;
                        const sellingPrice = hasDiscount ? p.discountPrice! : p.price;
                        const buyingCost = p.buyingPrice || 0;
                        const unitProfit = sellingPrice - buyingCost;
                        const profitMargin = sellingPrice > 0 && buyingCost > 0 ? Math.round((unitProfit / sellingPrice) * 100) : null;
                        const isLoss = buyingCost > 0 && unitProfit < 0;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shrink-0">
                                  <img
                                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80'}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-900 block truncate max-w-[220px]">
                                    {p.name}
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-400">
                                    SKU: {p.sku}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-800 block">
                                {p.categoryName || 'General'}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Brand: {p.brand}
                              </span>
                            </td>

                            {/* Buying Cost */}
                            <td className="py-3 px-4">
                              {buyingCost > 0 ? (
                                <span className="font-mono font-semibold text-slate-700 block">
                                  {formatBDT(buyingCost)}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono text-[11px]">Not set</span>
                              )}
                            </td>

                            {/* Selling Price / Offer */}
                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-slate-900 block">
                                {formatBDT(sellingPrice)}
                              </span>
                              {hasDiscount && (
                                <span className="font-mono text-[10px] text-slate-400 line-through block">
                                  {formatBDT(p.price)}
                                </span>
                              )}
                            </td>

                            {/* Profit / Unit (Margin %) */}
                            <td className="py-3 px-4">
                              {buyingCost > 0 ? (
                                <div>
                                  <span className={`font-mono font-bold block ${isLoss ? 'text-rose-600' : 'text-emerald-700'}`}>
                                    {isLoss ? '-' : '+'}{formatBDT(Math.abs(unitProfit))}
                                  </span>
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                                    isLoss ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {profitMargin !== null ? `${profitMargin}% margin` : '0%'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 font-mono text-[11px]">—</span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleStockQuickAdjust(p.id, -1)}
                                  className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                                  title="Decrease stock by 1"
                                >
                                  -
                                </button>
                                <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                                  p.stock <= 0
                                    ? 'bg-rose-100 text-rose-700'
                                    : p.stock <= 5
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-900'
                                }`}>
                                  {p.stock} units
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStockQuickAdjust(p.id, +1)}
                                  className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
                                  title="Increase stock by 1"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {p.isAvailable ? 'Active In Store' : 'Draft / Hidden'}
                              </span>
                              <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                                &#9733; {p.rating || 4.8} ({p.reviewCount || 12})
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setIsProductModalOpen(true);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CATEGORIES MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Store Categories Management
                </h3>
                <p className="text-xs text-slate-500">
                  Organize items into customer navigation groups
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingCategory({ name: '', slug: '', description: '', active: true });
                  setIsCategoryModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((c) => {
                const count = products.filter((p) => p.categoryId === c.id).length;
                return (
                  <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                          <Layers className="w-4 h-4" />
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {count} Products
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-3">{c.name}</h4>
                      {c.nameBn && <p className="text-xs text-slate-500">{c.nameBn}</p>}
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{c.description}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-mono text-[10px] text-slate-400">/{c.slug}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(c);
                          setIsCategoryModalOpen(true);
                        }}
                        className="text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: AUDIT TRAIL & SMS NOTIFICATION LOGS */}
        {/* ========================================================================= */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm">
                SMS &amp; Email Notification Dispatch Logs
              </h3>
              <p className="text-xs text-slate-500">
                Audit trail of all automated customer communications triggered by order status and courier dispatches
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Channel</th>
                      <th className="py-3 px-4">Event</th>
                      <th className="py-3 px-4">Recipient</th>
                      <th className="py-3 px-4">Message Content</th>
                      <th className="py-3 px-4">Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <tr key={n.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {n.timestamp}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            n.channel === 'SMS' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {n.channel}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {n.event}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {n.recipient}
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-md">
                          {n.message}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {n.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: HERO SECTION SHOWCASE & BANNER MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Hero Section Product Showcase
                    </h2>
                    <p className="text-xs text-slate-500">
                      Upload and manage the featured product photos, titles, prices, and links rotating on the homepage hero banner.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={handleResetHeroSlides}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleAddHeroSlide}
                  className="px-3.5 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Slide</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveHeroSlides}
                  disabled={isHeroSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isHeroSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{isHeroSaving ? 'Saving Changes...' : 'Save Showcase Changes'}</span>
                </button>
              </div>
            </div>

            {/* Main Content Layout: Slides Editor + Live Storefront Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Slide Cards (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {heroSlides.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-xs ${
                      previewSlideIndex === idx
                        ? 'border-amber-400 ring-2 ring-amber-400/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Slide Top Bar */}
                    <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          Slide #{idx + 1}
                        </span>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Default First
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewSlideIndex(idx)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                            previewSlideIndex === idx
                              ? 'bg-amber-100 text-amber-900 font-bold'
                              : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveHeroSlide(idx, 'up')}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === heroSlides.length - 1}
                          onClick={() => handleMoveHeroSlide(idx, 'down')}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteHeroSlide(idx)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer ml-1"
                          title="Delete Slide"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Slide Body: Image Picker on Left, Fields on Right */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      {/* Image Preview & Upload (5 cols) */}
                      <div className="sm:col-span-5 flex flex-col gap-2.5">
                        <div className="relative aspect-4/3 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
                          {slide.image ? (
                            <img
                              src={slide.image}
                              alt={slide.title}
                              className="w-full h-full object-cover object-center"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                              <ImageIcon className="w-8 h-8 mb-1" />
                              <span className="text-[11px]">No Image Selected</span>
                            </div>
                          )}
                          {uploadingHeroIndex === idx && (
                            <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white text-xs gap-1.5 backdrop-blur-xs">
                              <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                              <span>Uploading image...</span>
                            </div>
                          )}
                        </div>

                        {/* Upload Button */}
                        <label className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs">
                          <UploadCloud className="w-4 h-4 text-amber-400" />
                          <span>Upload From PC</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleHeroImageUpload(idx, file);
                              e.target.value = '';
                            }}
                          />
                        </label>

                        {/* Or URL input */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                            Or Image URL / Link
                          </label>
                          <input
                            type="text"
                            value={slide.image || ''}
                            placeholder="https://images.unsplash.com/..."
                            onChange={(e) => handleHeroFieldChange(idx, 'image', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-[11px] font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/60"
                          />
                        </div>
                      </div>

                      {/* Text Fields (7 cols) */}
                      <div className="sm:col-span-7 space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Product Title *
                          </label>
                          <input
                            type="text"
                            value={slide.title || ''}
                            placeholder="e.g. Aarong Festive Embroidered Panjabi"
                            onChange={(e) => handleHeroFieldChange(idx, 'title', e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                            Store / Seller Badge *
                          </label>
                          <input
                            type="text"
                            value={slide.store || ''}
                            placeholder="e.g. Feminine & Heritage Store"
                            onChange={(e) => handleHeroFieldChange(idx, 'store', e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Price (BDT ৳) *
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={slide.price || 0}
                              onChange={(e) => handleHeroFieldChange(idx, 'price', Number(e.target.value) || 0)}
                              className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                              Product Slug / Link
                            </label>
                            <input
                              type="text"
                              value={slide.slug || ''}
                              placeholder="e.g. aarong-festive-panjabi"
                              onChange={(e) => handleHeroFieldChange(idx, 'slug', e.target.value)}
                              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-mono text-slate-400">ID: {slide.id}</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready to publish
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Slide Bottom Action */}
                <button
                  type="button"
                  onClick={handleAddHeroSlide}
                  className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-2xl text-slate-600 hover:text-slate-900 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-slate-100/50"
                >
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Add Another Slide to Hero Showcase</span>
                </button>
              </div>

              {/* Right Column: Live Storefront Preview (5 cols) */}
              <div className="lg:col-span-5 sticky top-24 space-y-4">
                <div className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
                  {/* Glowing background halo */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Live Storefront Preview
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      Slide {previewSlideIndex + 1} of {heroSlides.length}
                    </span>
                  </div>

                  {/* Render exact Hero Showcase Widget as seen on customer home */}
                  {heroSlides[previewSlideIndex] && (
                    <div className="space-y-4">
                      <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900/90 shadow-2xl aspect-4/3 flex items-center justify-center group">
                        {/* Slide Image */}
                        <img
                          src={heroSlides[previewSlideIndex].image}
                          alt={heroSlides[previewSlideIndex].title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Top Store Badge */}
                        <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-3 py-1 bg-slate-950/75 backdrop-blur-md border border-white/10 rounded-full text-[11px] font-medium text-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[160px]">
                            {heroSlides[previewSlideIndex].store || 'Featured Store'}
                          </span>
                        </div>

                        {/* Carousel Arrows */}
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewSlideIndex((prev) =>
                              prev === 0 ? heroSlides.length - 1 : prev - 1
                            )
                          }
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
                        >
                          <ChevronUp className="w-4 h-4 -rotate-90" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewSlideIndex((prev) =>
                              (prev + 1) % heroSlides.length
                            )
                          }
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
                        >
                          <ChevronUp className="w-4 h-4 rotate-90" />
                        </button>

                        {/* Bottom Floating Card */}
                        <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-950/85 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {heroSlides[previewSlideIndex].title}
                            </p>
                            <p className="text-xs font-bold text-emerald-400 font-mono">
                              {formatBDT(heroSlides[previewSlideIndex].price)}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="shrink-0 px-3 py-1.5 bg-white text-slate-950 hover:bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>View</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Pagination Dots */}
                      <div className="flex items-center justify-center gap-2 pt-1">
                        {heroSlides.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={() => setPreviewSlideIndex(dotIdx)}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                              previewSlideIndex === dotIdx
                                ? 'w-6 bg-white'
                                : 'w-2 bg-slate-700 hover:bg-slate-500'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Bottom Info Tip */}
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                        <p className="font-semibold text-slate-300">
                          &bull; Auto-slides on customer storefront every 4.5 seconds.
                        </p>
                        <p>
                          &bull; When visitors click "View &rarr;", they are taken directly to the product details page.
                        </p>
                      </div>

                      {/* Save Button in Sidebar as well */}
                      <button
                        type="button"
                        onClick={handleSaveHeroSlides}
                        disabled={isHeroSaving}
                        className="w-full py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isHeroSaving ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>{isHeroSaving ? 'Saving...' : 'Save Showcase Changes'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: USERS & SIGN-UP INFO MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Header and Search */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-sky-50 text-sky-600 rounded-lg">
                    <Users className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Customer Accounts &amp; Sign-Up Directory
                    </h3>
                    <p className="text-xs text-slate-500">
                      View registered users, inspect their sign-up information, and manage or delete customer accounts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, phone, or ID..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Auth Method</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Sign-Up Date</th>
                      <th className="py-3 px-4">Orders &amp; Spend</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          No users found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const userOrders = orders.filter((o) => o.userId === u.id);
                        const userSpend = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                        const formattedDate = u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Recent';

                        return (
                          <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center shrink-0 uppercase text-xs">
                                  {u.avatarUrl ? (
                                    <img src={u.avatarUrl} alt={u.name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    u.name?.charAt(0) || 'U'
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                                    {u.name || 'Anonymous User'}
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-400">
                                    ID: {u.id?.slice(0, 8)}...
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className="text-slate-800 font-semibold block">{u.email || 'No email provided'}</span>
                              <span className="text-slate-500 font-mono text-[11px] block mt-0.5">
                                {u.phone || 'No phone provided'}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                                {u.authProvider || 'Phone OTP'}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  u.role === 'ADMIN'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {u.role || 'CUSTOMER'}
                              </span>
                            </td>

                            <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                              {formattedDate}
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">
                                {userOrders.length} orders
                              </span>
                              <span className="font-mono text-slate-500 text-[10px]">
                                {formatBDT(userSpend)}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setInspectingUser(u)}
                                  className="px-2.5 py-1 text-sky-600 hover:bg-sky-50 rounded-md cursor-pointer flex items-center gap-1 font-semibold text-xs border border-sky-200"
                                  title="View full sign-up information"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Info</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer border border-rose-200"
                                  title="Delete user account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: STORE FAQ MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'faqs' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                    <HelpCircle className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Store FAQs &amp; Help Center
                    </h3>
                    <p className="text-xs text-slate-500">
                      Add, update, or delete FAQ questions. Any change saved here immediately updates on the customer storefront.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingFaq({
                    category: 'general',
                    question: '',
                    questionBn: '',
                    answer: '',
                    answerBn: '',
                  });
                  setIsFaqModalOpen(true);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add FAQ Question</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { key: 'ALL', label: `All FAQs (${faqsList.length})` },
                { key: 'delivery', label: 'Delivery & Shipping' },
                { key: 'payment', label: 'Payment & COD' },
                { key: 'returns', label: 'Returns & Replacement' },
                { key: 'warranty', label: 'Warranty & Guarantee' },
                { key: 'general', label: 'General' },
              ].map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setFaqCategoryFilter(pill.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    faqCategoryFilter === pill.key
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* FAQs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFaqs.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">
                  No FAQ questions found in this category. Click "+ Add FAQ Question" to create one.
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const categoryBadgeColor: Record<string, string> = {
                    delivery: 'bg-blue-100 text-blue-800',
                    payment: 'bg-emerald-100 text-emerald-800',
                    returns: 'bg-amber-100 text-amber-800',
                    warranty: 'bg-purple-100 text-purple-800',
                    general: 'bg-slate-100 text-slate-800',
                  };

                  return (
                    <div
                      key={faq.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              categoryBadgeColor[faq.category] || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {faq.category}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                            Active on storefront
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm">{faq.question}</h4>
                        {faq.questionBn && (
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{faq.questionBn}</p>
                        )}

                        <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                        {faq.answerBn && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed whitespace-pre-line border-t border-slate-100 pt-1.5">
                            {faq.answerBn}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-mono text-[10px] text-slate-400">ID: {faq.id}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFaq(faq);
                              setIsFaqModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 rounded-md font-semibold text-xs cursor-pointer flex items-center gap-1 border border-blue-200"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFaq(faq.id, faq.question)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer border border-rose-200"
                            title="Delete FAQ question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>

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
            {/* Header */}
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

            {/* Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Profile Card Summary */}
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

              {/* Sign-Up & Account Details Grid */}
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

              {/* Order History */}
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

            {/* Footer with Delete and Close */}
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
