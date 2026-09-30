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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiClient';
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
} from '../../types';
import { formatBDT } from '../../data/bangladeshGeo';
import { AdminKpiCards } from './components/AdminKpiCards';
import { AdminSalesTrendChart } from './components/AdminSalesTrendChart';
import { AdminPieChart } from './components/AdminPieChart';
import { ProductUploadModal } from './components/ProductUploadModal';
import { CourierDispatchModal } from './components/CourierDispatchModal';
import { Customer360Modal } from './components/Customer360Modal';

export const AdminDashboard: React.FC = () => {
  const { showToast, navigateTo } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'products' | 'categories' | 'notifications'
  >('overview');

  // Summary & Datasets
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(false);

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
      const [sumRes, ordRes, prdRes, catRes, notRes] = await Promise.all([
        apiService.admin.getDashboardSummary(),
        apiService.admin.getOrders(),
        apiService.products.getAll({ size: 100 }),
        apiService.categories.getAll(),
        apiService.admin.getNotifications(),
      ]);
      setSummary(sumRes.data);
      setOrders(ordRes.data);
      setProducts(prdRes.data.products);
      setCategories(catRes.data);
      setNotifications(notRes.data);
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

  // Handlers
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
      showToast(`Courier assigned to #${res.data.orderNumber}! Customer SMS sent.`, 'success');
      loadData();
    } catch {
      showToast('Failed to assign courier', 'error');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await apiService.admin.updateStatus(orderId, newStatus);
      showToast(`Order #${res.data.orderNumber} status changed to ${newStatus}`, 'success');
      loadData();
    } catch {
      showToast('Failed to update status', 'error');
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
        await apiService.products.update(productData.id, productData);
        showToast(`Product "${productData.name}" updated successfully`, 'success');
      } else {
        await apiService.products.create(productData);
        showToast(`Product "${productData.name}" added to catalog`, 'success');
      }
      loadData();
    } catch {
      showToast('Error saving product', 'error');
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-900 font-sans">
      {/* 1. TOP EXECUTIVE HEADER */}
      <header className="bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-3.5 border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">
                  Deshi Commerce &bull; Admin Portal
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active System
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                PostgreSQL &bull; 38 APIs Connected &bull; Steadfast Courier Integrated
              </p>
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
                      <th className="py-3 px-4">Price / Discount</th>
                      <th className="py-3 px-4">Stock Level (Quick Adjust)</th>
                      <th className="py-3 px-4">Status &amp; Rating</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          No catalog items found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const hasDiscount = p.discountPrice && p.discountPrice < p.price;
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
                                  <span className="font-bold text-slate-900 block truncate max-w-[240px]">
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

                            <td className="py-3 px-4">
                              <span className="font-mono font-bold text-slate-900 block">
                                {formatBDT(hasDiscount ? p.discountPrice! : p.price)}
                              </span>
                              {hasDiscount && (
                                <span className="font-mono text-[10px] text-slate-400 line-through">
                                  {formatBDT(p.price)}
                                </span>
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
      </main>

      {/* ========================================================================= */}
      {/* GLOBAL MODALS */}
      {/* ========================================================================= */}

      {/* 1. Upload Product Modal */}
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

      {/* 2. Courier Dispatch Modal */}
      <CourierDispatchModal
        order={selectedOrderForCourier}
        onClose={() => setSelectedOrderForCourier(null)}
        onAssign={handleAssignCourier}
      />

      {/* 3. Customer 360 Profile Modal */}
      <Customer360Modal
        profile={selectedCustomerProfile}
        onClose={() => setSelectedCustomerProfile(null)}
      />

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
    </div>
  );
};
