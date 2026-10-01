import axios, { AxiosResponse } from 'axios';
import {
  initDatabase,
  getUsers,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  getCategories,
  saveCategory,
  deleteCategory,
  getProducts,
  getProductBySlug,
  saveProduct,
  deleteProduct,
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  getAddresses,
  saveAddress,
  deleteAddress,
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrderTracking,
  cancelOrder,
  simulateSSLCommerzSuccess,
  getNotificationLogs,
  addNotificationLog,
  getAdminDashboardSummary,
  getCustomer360Profile,
} from './dbStorage';
import {
  Category,
  Product,
  Cart,
  CartItem,
  Address,
  Order,
  OrderItem,
  CourierInfo,
  AdminDashboardSummary,
  Customer360Profile,
  NotificationLog,
  User,
  OrderStatus,
} from '../types';

// Initialize localStorage on module load
initDatabase();

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_API_URL) ||
  'http://localhost:8080/api/v1';

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        return (globalThis as any).localStorage.getItem(key);
      }
    } catch {
      // Ignore
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        (globalThis as any).localStorage.setItem(key, value);
      }
    } catch {
      // Ignore
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
        (globalThis as any).localStorage.removeItem(key);
      }
    } catch {
      // Ignore
    }
  },
};

export function normalizeCategoryId(catId?: string): string {
  if (!catId) return 'cat_01';
  const c = catId.toLowerCase();
  if (c === 'cat_01' || c === 'cat_mobile' || c.includes('mobile')) return 'cat_01';
  if (c === 'cat_02' || c === 'cat_electronics' || c.includes('elect')) return 'cat_02';
  if (c === 'cat_03' || c === 'cat_fashion' || c.includes('fash') || c.includes('cloth')) return 'cat_03';
  if (c === 'cat_04' || c === 'cat_groceries' || c.includes('home') || c.includes('appliance') || c.includes('groc')) return 'cat_04';
  return catId.startsWith('cat_') ? catId : 'cat_01';
}

let adminLoginPromise: Promise<string | null> | null = null;

export async function ensureAdminToken(): Promise<string | null> {
  const currentToken = safeLocalStorage.getItem('accessToken');
  // Check if current token is already a real JWT (has 3 parts) and not a mock string
  if (currentToken && currentToken.startsWith('ey') && currentToken.split('.').length === 3) {
    return currentToken;
  }

  if (adminLoginPromise) {
    return adminLoginPromise;
  }

  adminLoginPromise = (async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        identifier: 'admin@store.com.bd',
        password: 'Password123!',
      });
      if (res.data?.data?.accessToken) {
        const token = res.data.data.accessToken;
        const refreshToken = res.data.data.refreshToken;
        safeLocalStorage.setItem('accessToken', token);
        if (refreshToken) safeLocalStorage.setItem('refreshToken', refreshToken);
        return token;
      }
    } catch (err) {
      console.warn('Could not auto-acquire admin token from backend:', err);
    } finally {
      adminLoginPromise = null;
    }
    return null;
  })();

  return adminLoginPromise;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Injects Bearer JWT & Auto-authenticates Admin requests if needed
apiClient.interceptors.request.use(async (config) => {
  let token = safeLocalStorage.getItem('accessToken');

  // If calling an admin route and token is missing or is a mock token, auto-acquire live admin JWT
  if (config.url?.includes('/admin') && (!token || !token.startsWith('ey'))) {
    const liveToken = await ensureAdminToken();
    if (liveToken) token = liveToken;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Auto Refresh or Auto Re-auth on 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // If it's an admin request or admin session, acquire a fresh admin token directly
        if (originalRequest.url?.includes('/admin')) {
          safeLocalStorage.removeItem('accessToken');
          const liveToken = await ensureAdminToken();
          if (liveToken) {
            originalRequest.headers.Authorization = `Bearer ${liveToken}`;
            return apiClient(originalRequest);
          }
        }

        const refreshToken = safeLocalStorage.getItem('refreshToken');
        if (refreshToken && refreshToken.startsWith('ey')) {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          const newAccessToken = res.data?.data?.accessToken;
          const newRefreshToken = res.data?.data?.refreshToken;
          if (newAccessToken) safeLocalStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) safeLocalStorage.setItem('refreshToken', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        safeLocalStorage.removeItem('accessToken');
        safeLocalStorage.removeItem('refreshToken');
        console.warn('Auth token refresh failed.');
      }
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

function wrapSuccess<T>(data: T, message = 'Operation successful'): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

const simulateDelay = async (ms = 60) => new Promise((resolve) => setTimeout(resolve, ms));

// =========================================================================
// Top-Level Data Mappers: Backend Spring Boot DTOs -> Frontend Domain Types
// =========================================================================

export function mapBackendProductToFrontend(p: any): Product {
  let images: string[] = [];
  if (Array.isArray(p.images)) {
    images = p.images
      .map((img: any) => (typeof img === 'string' ? img : img.url))
      .filter(Boolean);
  }
  if (images.length === 0) {
    images = ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80'];
  }
  return {
    id: p.id,
    name: p.name,
    nameBn: p.nameBn || p.name,
    slug: p.slug || (p.name ? p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : p.id),
    brand: p.brand || 'Deshi',
    categoryId: p.category?.id || p.categoryId || 'cat_01',
    categoryName: p.category?.name || p.categoryName || 'General',
    description: p.description || '',
    price: Number(p.price || 0),
    discountPrice: p.discountPrice !== undefined && p.discountPrice !== null ? Number(p.discountPrice) : undefined,
    stock: Number(p.stock || 0),
    sku: p.sku || `SKU-${p.id}`,
    images,
    specs: p.specs || {},
    rating: Number(p.rating || 4.8),
    reviewCount: Number(p.reviewCount || 12),
    isAvailable: p.available ?? p.isAvailable ?? (p.stock > 0),
    isFeatured: p.isFeatured ?? true,
    tags: p.tags || [],
    createdAt: p.createdAt || new Date().toISOString(),
  };
}

export function mapBackendCartToFrontendCart(bCart: any): Cart {
  const products = getProducts();
  const rawItems = bCart?.items || [];
  const items: CartItem[] = rawItems.map((bItem: any) => {
    const prod = products.find((p) => p.id === bItem.productId) || {
      id: bItem.productId,
      name: bItem.name || bItem.productName || 'Product',
      price: Number(bItem.unitPrice || 0),
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80'],
      stock: 50,
      slug: bItem.productId,
      brand: 'Deshi',
      categoryId: 'cat_01',
      categoryName: 'General',
      description: '',
      rating: 4.8,
      reviewCount: 12,
      isAvailable: true,
      createdAt: new Date().toISOString(),
    };
    const unitPrice = Number(bItem.unitPrice || prod.price);
    const qty = Number(bItem.quantity || 1);
    return {
      id: bItem.cartItemId || bItem.id || `item_${bItem.productId}`,
      productId: bItem.productId,
      product: prod,
      quantity: qty,
      price: unitPrice,
      totalPrice: Number(bItem.subtotal || unitPrice * qty),
    };
  });
  const subtotal = Number(bCart?.subtotal ?? items.reduce((s, i) => s + i.totalPrice, 0));
  const itemCount = items.reduce((cnt, i) => cnt + i.quantity, 0);
  const freeDeliveryThreshold = 5000;
  return {
    id: bCart?.id || 'cart_main',
    items,
    subtotal,
    itemCount,
    freeDeliveryThreshold,
    eligibleForFreeDelivery: subtotal >= freeDeliveryThreshold,
    amountNeededForFreeDelivery: Math.max(0, freeDeliveryThreshold - subtotal),
  };
}

export function mapBackendAddressToFrontendAddress(a: any): Address {
  return {
    id: a.id,
    userId: a.userId || 'usr_current',
    fullName: a.name || a.fullName || a.recipientName || 'Customer',
    phone: a.phone || a.mobile || a.contactPhone || '01700000000',
    division: a.division || 'Dhaka',
    district: a.district || 'Dhaka',
    upazila: a.upazila || a.thana || 'Dhanmondi',
    streetAddress: a.addressLine || a.streetAddress || a.detailedAddress || '',
    isDefault: a.default ?? a.isDefault ?? false,
    type: a.type || 'HOME',
  };
}

export function mapBackendOrderToFrontendOrder(o: any): Order {
  const products = getProducts();
  const rawItems = o?.items || [];
  const items: OrderItem[] = rawItems.map((bItem: any) => {
    const prod = products.find((p) => p.id === bItem.productId);
    const unitPrice = Number(bItem.unitPrice || prod?.price || 0);
    const qty = Number(bItem.quantity || 1);
    return {
      id: bItem.orderItemId || bItem.id || `item_${bItem.productId}`,
      productId: bItem.productId,
      productName: bItem.productName || prod?.name || 'Product',
      productImage:
        prod?.images?.[0] ||
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
      price: unitPrice,
      quantity: qty,
      totalPrice: Number(bItem.subtotal || unitPrice * qty),
    };
  });

  const address: Address = o.shippingAddress
    ? mapBackendAddressToFrontendAddress(o.shippingAddress)
    : {
        id: 'addr_def',
        userId: o.userId,
        fullName: 'Customer',
        phone: '01700000000',
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Dhanmondi',
        streetAddress: 'Dhanmondi 27',
        isDefault: true,
        type: 'HOME',
      };

  const courier: CourierInfo | undefined = o.courierName
    ? {
        courierName: o.courierName,
        trackingNumber: o.trackingNumber || '',
        trackingUrl: o.trackingUrl || '',
        estimatedDeliveryDate: o.estimatedDeliveryDate,
      }
    : undefined;

  return {
    id: o.id,
    orderNumber: o.orderNumber || `BD-${String(o.id).substring(0, 8).toUpperCase()}`,
    userId: o.userId,
    customerName: address.fullName,
    customerPhone: address.phone,
    shippingAddress: address,
    items,
    subtotal: Number(o.subtotal || 0),
    deliveryCharge: Number(o.deliveryCharge || 0),
    totalAmount: Number(o.total || Number(o.subtotal || 0) + Number(o.deliveryCharge || 0)),
    status: o.status || 'PENDING',
    paymentMethod: o.paymentMethod || 'COD',
    paymentStatus: o.paymentStatus || 'PENDING',
    paymentTxnId: o.payment?.transactionId,
    courier,
    customerNote: o.notes,
    createdAt: o.createdAt || new Date().toISOString(),
    updatedAt: o.updatedAt || new Date().toISOString(),
  };
}

export function mapBackendNotification(n: any): NotificationLog {
  return {
    id: n.id,
    orderId: n.orderId,
    orderNumber:
      n.orderNumber || (n.orderId ? `BD-${String(n.orderId).substring(0, 8).toUpperCase()}` : undefined),
    timestamp: n.createdAt || n.timestamp || new Date().toISOString(),
    channel: n.type === 'SMS' || n.channel === 'SMS' ? 'SMS' : 'EMAIL',
    event: n.event || 'ORDER_PLACED',
    recipient: n.recipient || '',
    message: n.message || n.body || n.content || n.subject || '',
    status: n.status === 'SENT' || n.delivered ? 'DELIVERED' : n.status || 'SENT',
    gatewayResponse: n.gatewayResponse,
  };
}

export const apiService = {
  // =========================================================================
  // 1. Categories (/api/v1/categories & /api/v1/admin/categories)
  // =========================================================================
  categories: {
    getAll: async (): Promise<ApiResponse<Category[]>> => {
      try {
        const res = await apiClient.get<ApiResponse<any[]>>('/categories');
        if (res.data?.data && Array.isArray(res.data.data)) {
          const mapped: Category[] = res.data.data.map((c) => ({
            id: c.id,
            name: c.name,
            nameBn: c.nameBn || c.name,
            slug: c.slug,
            description: c.description || '',
            active: c.active ?? true,
            productCount: Number(c.productCount || 0),
          }));
          return wrapSuccess(mapped);
        }
      } catch (err) {
        // Fallback to local storage
      }
      await simulateDelay();
      const list = getCategories();
      return wrapSuccess(list);
    },

    create: async (payload: Partial<Category>): Promise<ApiResponse<Category>> => {
      try {
        const reqBody = {
          name: payload.name || 'Category',
          slug:
            payload.slug ||
            (payload.name ? payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `cat-${Date.now()}`),
          description: payload.description || '',
        };
        const res = await apiClient.post<ApiResponse<any>>('/admin/categories', reqBody);
        if (res.data?.data) {
          const created: Category = {
            id: res.data.data.id,
            name: res.data.data.name,
            slug: res.data.data.slug,
            description: res.data.data.description || '',
            active: res.data.data.active ?? true,
            productCount: 0,
          };
          saveCategory(created);
          return wrapSuccess(created, 'Category created successfully');
        }
      } catch (err: any) {
        console.warn('Backend create category failed, saving locally:', err?.response?.data || err?.message);
      }
      await simulateDelay();
      const created = saveCategory(payload);
      return wrapSuccess(created, 'Category created successfully');
    },

    update: async (id: string, payload: Partial<Category>): Promise<ApiResponse<Category>> => {
      try {
        const reqBody = {
          name: payload.name || 'Category',
          description: payload.description || '',
          active: payload.active ?? true,
        };
        const res = await apiClient.put<ApiResponse<any>>(`/admin/categories/${id}`, reqBody);
        if (res.data?.data) {
          const updated: Category = {
            id: res.data.data.id,
            name: res.data.data.name,
            slug: res.data.data.slug,
            description: res.data.data.description || '',
            active: res.data.data.active ?? true,
          };
          saveCategory(updated);
          return wrapSuccess(updated, 'Category updated successfully');
        }
      } catch (err: any) {
        console.warn('Backend update category failed, saving locally:', err?.response?.data || err?.message);
      }
      await simulateDelay();
      const updated = saveCategory({ ...payload, id });
      return wrapSuccess(updated, 'Category updated successfully');
    },

    delete: async (id: string): Promise<ApiResponse<{ id: string }>> => {
      try {
        const res = await apiClient.delete<ApiResponse<void>>(`/admin/categories/${id}`);
        if (res.data) {
          deleteCategory(id);
          return wrapSuccess({ id }, 'Category deleted successfully');
        }
      } catch (err: any) {
        console.warn('Backend delete category failed, removing locally:', err?.response?.data || err?.message);
      }
      await simulateDelay();
      deleteCategory(id);
      return wrapSuccess({ id }, 'Category deleted successfully');
    },
  },

  // =========================================================================
  // 2. Products (/api/v1/products & /api/v1/admin/products)
  // =========================================================================
  products: {
    getAll: async (params?: {
      category?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      availability?: boolean;
      sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest' | 'popular';
      page?: number;
      size?: number;
    }): Promise<ApiResponse<{ products: Product[]; total: number; page: number; totalPages: number }>> => {
      try {
        const queryParams = { ...params };
        if (queryParams.category === 'all') delete queryParams.category;

        const res = await apiClient.get<ApiResponse<any>>('/products', { params: queryParams });
        if (res.data?.data) {
          const paged = res.data.data;
          const rawList = paged.items || paged.content || paged.products || [];
          const products = rawList.map(mapBackendProductToFrontend);
          const total = paged.totalItems ?? paged.totalElements ?? paged.total ?? products.length;
          const page = paged.page ?? paged.pageNumber ?? 0;
          const totalPages = paged.totalPages ?? Math.ceil(total / (params?.size || 20)) ?? 1;

          // Sync into local storage cache so getProducts() is immediately aware of all backend products
          if (products.length > 0) {
            try {
              const currentLocal = getProducts();
              const merged = [...products];
              for (const loc of currentLocal) {
                if (!merged.some((m) => m.id === loc.id)) {
                  merged.push(loc);
                }
              }
              localStorage.setItem('deshi_products_v1', JSON.stringify(merged));
            } catch {
              // Ignore local storage sync error
            }
          }

          return {
            success: true,
            message: res.data.message,
            data: { products, total, page, totalPages },
          };
        }
      } catch (err) {
        // Fallback to local storage
      }

      await simulateDelay();
      let list = getProducts();

      if (params?.category && params.category !== 'all') {
        const cat = params.category.toLowerCase();
        list = list.filter(
          (p) => p.categoryId.toLowerCase().includes(cat) || p.categoryName.toLowerCase().includes(cat)
        );
      }

      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            (p.nameBn && p.nameBn.includes(q))
        );
      }

      if (params?.minPrice !== undefined) {
        list = list.filter((p) => (p.discountPrice || p.price) >= params.minPrice!);
      }

      if (params?.maxPrice !== undefined) {
        list = list.filter((p) => (p.discountPrice || p.price) <= params.maxPrice!);
      }

      if (params?.availability) {
        list = list.filter((p) => p.isAvailable && p.stock > 0);
      }

      if (params?.sort) {
        switch (params.sort) {
          case 'price_asc':
            list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
            break;
          case 'price_desc':
            list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
            break;
          case 'rating_desc':
            list.sort((a, b) => b.rating - a.rating);
            break;
          case 'newest':
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        }
      }

      const page = params?.page || 0;
      const size = params?.size || 20;
      const start = page * size;
      const paginated = list.slice(start, start + size);

      return wrapSuccess({
        products: paginated,
        total: list.length,
        page,
        totalPages: Math.ceil(list.length / size) || 1,
      });
    },

    getBySlug: async (slug: string): Promise<ApiResponse<Product>> => {
      try {
        const res = await apiClient.get<ApiResponse<any>>(`/products/slug/${slug}`);
        if (res.data?.data) {
          return wrapSuccess(mapBackendProductToFrontend(res.data.data));
        }
      } catch (err) {
        // Fallback to local storage
      }
      await simulateDelay();
      const p = getProductBySlug(slug);
      if (!p) throw new Error('Product not found');
      return wrapSuccess(p);
    },

    create: async (payload: Partial<Product>): Promise<ApiResponse<Product>> => {
      const normalizedCategoryId = normalizeCategoryId(payload.categoryId);
      try {
        const reqBody = {
          name: payload.name || 'New Product',
          slug:
            payload.slug ||
            (payload.name ? payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `prod-${Date.now()}`),
          description: payload.description || '',
          price: payload.price !== undefined ? Number(payload.price) : 100,
          discountPrice: payload.discountPrice !== undefined && payload.discountPrice !== null ? Number(payload.discountPrice) : undefined,
          stock: payload.stock !== undefined ? Number(payload.stock) : 10,
          categoryId: normalizedCategoryId,
          images: (payload.images || []).map((img: any) =>
            typeof img === 'string' ? { url: img, alt: payload.name || 'Product Image' } : img
          ),
        };
        const res = await apiClient.post<ApiResponse<any>>('/admin/products', reqBody);
        if (res.data?.data) {
          const mapped = mapBackendProductToFrontend(res.data.data);
          saveProduct(mapped);
          return wrapSuccess(mapped, 'Product added to catalog');
        }
      } catch (err: any) {
        console.warn('Backend create product failed, saving locally:', err?.response?.data || err?.message);
      }
      await simulateDelay();
      const created = saveProduct({ ...payload, categoryId: normalizedCategoryId });
      return wrapSuccess(created, 'Product added to catalog');
    },

    update: async (id: string, payload: Partial<Product>): Promise<ApiResponse<Product>> => {
      const existing = getProducts().find((p) => p.id === id);
      const normalizedCategoryId = normalizeCategoryId(payload.categoryId || existing?.categoryId);

      const reqBody = {
        name: payload.name || existing?.name || 'Product',
        description: payload.description !== undefined ? payload.description : existing?.description || '',
        price: payload.price !== undefined ? Number(payload.price) : Number(existing?.price || 1),
        discountPrice: payload.discountPrice !== undefined && payload.discountPrice !== null
          ? Number(payload.discountPrice)
          : existing?.discountPrice !== undefined && existing?.discountPrice !== null
          ? Number(existing.discountPrice)
          : undefined,
        stock: payload.stock !== undefined ? Number(payload.stock) : Number(existing?.stock || 0),
        categoryId: normalizedCategoryId,
        images: (payload.images || existing?.images || []).map((img: any) =>
          typeof img === 'string' ? { url: img, alt: payload.name || existing?.name || 'Image' } : img
        ),
        available: payload.isAvailable !== undefined ? payload.isAvailable : existing?.isAvailable ?? true,
      };

      try {
        const res = await apiClient.put<ApiResponse<any>>(`/admin/products/${id}`, reqBody);
        if (res.data?.data) {
          const mapped = mapBackendProductToFrontend(res.data.data);
          saveProduct(mapped);
          return wrapSuccess(mapped, 'Product updated successfully');
        }
      } catch (err: any) {
        // If 404 (e.g. initial mock product prd_samsung_a55 not yet in Postgres), sync it by creating
        if (err.response?.status === 404) {
          try {
            console.log(`Product ${id} not found in database, creating record in backend...`);
            const createRes = await apiClient.post<ApiResponse<any>>('/admin/products', {
              ...reqBody,
              slug: payload.slug || existing?.slug || (payload.name ? payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `prod-${Date.now()}`),
            });
            if (createRes.data?.data) {
              const mapped = mapBackendProductToFrontend(createRes.data.data);
              saveProduct(mapped);
              return wrapSuccess(mapped, 'Product updated and catalog synced');
            }
          } catch (createErr: any) {
            console.warn('Backend fallback creation failed:', createErr?.response?.data || createErr?.message);
          }
        } else {
          console.warn('Backend update product failed, saving locally:', err?.response?.data || err?.message);
        }
      }
      await simulateDelay();
      const updated = saveProduct({ ...existing, ...payload, id, categoryId: normalizedCategoryId });
      return wrapSuccess(updated, 'Product updated successfully');
    },

    delete: async (id: string): Promise<ApiResponse<{ id: string }>> => {
      try {
        const res = await apiClient.delete<ApiResponse<void>>(`/admin/products/${id}`);
        if (res.data) {
          deleteProduct(id);
          return wrapSuccess({ id }, 'Product removed from catalog');
        }
      } catch (err: any) {
        console.warn('Backend delete product failed, removing locally:', err?.response?.data || err?.message);
      }
      await simulateDelay();
      deleteProduct(id);
      return wrapSuccess({ id }, 'Product removed from catalog');
    },
  },

  // =========================================================================
  // 3. Shopping Cart (/api/v1/cart)
  // =========================================================================
  cart: {
    get: async (): Promise<ApiResponse<Cart>> => {
      try {
        const res = await apiClient.get<ApiResponse<any>>('/cart');
        if (res.data?.data) {
          return wrapSuccess(mapBackendCartToFrontendCart(res.data.data));
        }
      } catch (err) {
        // Fallback to local storage
      }
      await simulateDelay(40);
      return wrapSuccess(getCart());
    },

    addItem: async (productId: string, quantity = 1): Promise<ApiResponse<Cart>> => {
      try {
        const res = await apiClient.post<ApiResponse<any>>('/cart/items', { productId, quantity });
        if (res.data?.data) {
          const mapped = mapBackendCartToFrontendCart(res.data.data);
          addToCart(productId, quantity);
          return wrapSuccess(mapped, 'Item added to your shopping bag');
        }
      } catch (err: any) {
        // Fallback
      }
      await simulateDelay(40);
      const updated = addToCart(productId, quantity);
      return wrapSuccess(updated, 'Item added to your shopping bag');
    },

    updateItem: async (itemId: string, quantity: number): Promise<ApiResponse<Cart>> => {
      try {
        const res = await apiClient.patch<ApiResponse<any>>(`/cart/items/${itemId}`, { quantity });
        if (res.data?.data) {
          const mapped = mapBackendCartToFrontendCart(res.data.data);
          updateCartItemQuantity(itemId, quantity);
          return wrapSuccess(mapped);
        }
      } catch (err: any) {
        // Fallback
      }
      await simulateDelay(40);
      const updated = updateCartItemQuantity(itemId, quantity);
      return wrapSuccess(updated);
    },

    removeItem: async (itemId: string): Promise<ApiResponse<Cart>> => {
      try {
        const res = await apiClient.delete<ApiResponse<any>>(`/cart/items/${itemId}`);
        if (res.data?.data) {
          const mapped = mapBackendCartToFrontendCart(res.data.data);
          removeCartItem(itemId);
          return wrapSuccess(mapped, 'Item removed from bag');
        }
      } catch (err: any) {
        // Fallback
      }
      await simulateDelay(40);
      const updated = removeCartItem(itemId);
      return wrapSuccess(updated, 'Item removed from bag');
    },

    clear: async (): Promise<ApiResponse<Cart>> => {
      try {
        const res = await apiClient.delete<ApiResponse<void>>('/cart');
        if (res.data) {
          const cleared = clearCart();
          return wrapSuccess(cleared, 'Bag cleared');
        }
      } catch (err) {
        // Fallback
      }
      await simulateDelay(40);
      const updated = clearCart();
      return wrapSuccess(updated, 'Bag cleared');
    },
  },

  // =========================================================================
  // 4. Bangladesh Addresses (/api/v1/addresses)
  // =========================================================================
  addresses: {
    getAll: async (): Promise<ApiResponse<Address[]>> => {
      try {
        const res = await apiClient.get<ApiResponse<any[]>>('/addresses');
        if (res.data?.data && Array.isArray(res.data.data)) {
          const mapped = res.data.data.map(mapBackendAddressToFrontendAddress);
          return wrapSuccess(mapped);
        }
      } catch (err) {
        // Fallback
      }
      await simulateDelay(40);
      return wrapSuccess(getAddresses());
    },

    create: async (payload: Partial<Address>): Promise<ApiResponse<Address>> => {
      try {
        const reqBody = {
          name: payload.fullName || 'Customer',
          phone: payload.phone || '01700000000',
          division: payload.division || 'Dhaka',
          district: payload.district || 'Dhaka',
          upazila: payload.upazila || 'Dhanmondi',
          addressLine: payload.streetAddress || 'Dhanmondi 27',
          isDefault: payload.isDefault ?? false,
        };
        const res = await apiClient.post<ApiResponse<any>>('/addresses', reqBody);
        if (res.data?.data) {
          const mapped = mapBackendAddressToFrontendAddress(res.data.data);
          saveAddress(mapped);
          return wrapSuccess(mapped, 'Delivery address saved');
        }
      } catch (err: any) {
        if (err.response?.data?.message) throw new Error(err.response.data.message);
      }
      await simulateDelay(60);
      const addr = saveAddress(payload);
      return wrapSuccess(addr, 'Delivery address saved');
    },

    update: async (id: string, payload: Partial<Address>): Promise<ApiResponse<Address>> => {
      try {
        const reqBody = {
          name: payload.fullName,
          phone: payload.phone,
          division: payload.division,
          district: payload.district,
          upazila: payload.upazila,
          addressLine: payload.streetAddress,
          isDefault: payload.isDefault,
        };
        const res = await apiClient.put<ApiResponse<any>>(`/addresses/${id}`, reqBody);
        if (res.data?.data) {
          const mapped = mapBackendAddressToFrontendAddress(res.data.data);
          saveAddress(mapped);
          return wrapSuccess(mapped, 'Address updated');
        }
      } catch (err: any) {
        if (err.response?.data?.message) throw new Error(err.response.data.message);
      }
      await simulateDelay(60);
      const addr = saveAddress({ ...payload, id });
      return wrapSuccess(addr, 'Address updated');
    },

    delete: async (id: string): Promise<ApiResponse<{ id: string }>> => {
      try {
        const res = await apiClient.delete<ApiResponse<void>>(`/addresses/${id}`);
        if (res.data) {
          deleteAddress(id);
          return wrapSuccess({ id }, 'Address deleted');
        }
      } catch (err: any) {
        if (err.response?.data?.message) throw new Error(err.response.data.message);
      }
      await simulateDelay(60);
      deleteAddress(id);
      return wrapSuccess({ id }, 'Address deleted');
    },

    setDefault: async (id: string): Promise<ApiResponse<Address>> => {
      try {
        const res = await apiClient.patch<ApiResponse<any>>(`/addresses/${id}/default`);
        if (res.data?.data) {
          const mapped = mapBackendAddressToFrontendAddress(res.data.data);
          return wrapSuccess(mapped, 'Default address updated');
        }
      } catch (err) {
        // Fallback
      }
      await simulateDelay(40);
      const addresses = getAddresses();
      const target = addresses.find((a) => a.id === id);
      if (target) {
        addresses.forEach((a) => (a.isDefault = a.id === id));
        localStorage.setItem('deshi_addresses_v1', JSON.stringify(addresses));
        return wrapSuccess(target, 'Default address updated');
      }
      throw new Error('Address not found');
    },
  },

  // =========================================================================
  // 5. Orders (/api/v1/orders & /api/v1/admin/orders)
  // =========================================================================
  orders: {
    getPaymentMethods: async (): Promise<
      ApiResponse<{ methods: { id: string; name: string; description: string; badge?: string }[] }>
    > => {
      try {
        const res = await apiClient.get<ApiResponse<any[]>>('/payments/methods');
        if (res.data?.data) {
          const methods = res.data.data.map((m: any) => ({
            id: m.method || m.id,
            name: m.displayName || m.name,
            description: m.description,
            badge: m.badge,
          }));
          return { success: true, data: { methods } };
        }
      } catch (err) {
        // Fallback
      }
      await simulateDelay(40);
      return wrapSuccess({
        methods: [
          {
            id: 'COD',
            name: 'Cash on Delivery (COD)',
            description: 'Pay with cash upon home delivery anywhere in Bangladesh.',
            badge: 'Cash',
          },
          {
            id: 'SSLCOMMERZ',
            name: 'SSLCOMMERZ Gateway',
            description: 'bKash, Nagad, Rocket, Visa, Mastercard, Internet Banking.',
            badge: 'Instant Online',
          },
        ],
      });
    },

    create: async (payload: {
      addressId: string;
      paymentMethod: 'COD' | 'SSLCOMMERZ';
      customerNote?: string;
    }): Promise<ApiResponse<Order>> => {
      try {
        const res = await apiClient.post<ApiResponse<any>>('/orders', {
          addressId: payload.addressId,
          paymentMethod: payload.paymentMethod,
          notes: payload.customerNote,
        });
        if (res.data?.data) {
          const mapped = mapBackendOrderToFrontendOrder(res.data.data);
          createOrder(payload);
          return wrapSuccess(mapped, `Order #${mapped.orderNumber} placed successfully!`);
        }
      } catch (err: any) {
        // If backend throws conflict or empty cart, fall back gracefully to local order creation
      }
      await simulateDelay(120);
      const order = createOrder(payload);
      return wrapSuccess(order, `Order #${order.orderNumber} placed successfully!`);
    },

    getCustomerOrders: async (): Promise<ApiResponse<Order[]>> => {
      try {
        const res = await apiClient.get<ApiResponse<any[]>>('/orders');
        if (res.data?.data && Array.isArray(res.data.data)) {
          const mapped = res.data.data.map(mapBackendOrderToFrontendOrder);
          return wrapSuccess(mapped);
        }
      } catch (err) {
        // Fallback
      }
      await simulateDelay(60);
      const user = getCurrentUser();
      const list = user ? getOrders(undefined, undefined, user.id) : [];
      return wrapSuccess(list);
    },

    getById: async (id: string): Promise<ApiResponse<Order>> => {
      try {
        const res = await apiClient.get<ApiResponse<any>>(`/orders/${id}`);
        if (res.data?.data) {
          return wrapSuccess(mapBackendOrderToFrontendOrder(res.data.data));
        }
      } catch (err) {
        // Fallback
      }
      await simulateDelay(60);
      const order = getOrderById(id);
      if (!order) throw new Error('Order not found');
      return wrapSuccess(order);
    },

    cancel: async (id: string, reason: string): Promise<ApiResponse<Order>> => {
      try {
        const res = await apiClient.post<ApiResponse<any>>(`/orders/${id}/cancel`, { reason });
        if (res.data?.data) {
          const mapped = mapBackendOrderToFrontendOrder(res.data.data);
          cancelOrder(id, reason);
          return wrapSuccess(mapped, `Order #${mapped.orderNumber} has been cancelled.`);
        }
      } catch (err: any) {
        if (err.response?.data?.message) throw new Error(err.response.data.message);
      }
      await simulateDelay(100);
      const order = cancelOrder(id, reason);
      return wrapSuccess(order, `Order #${order.orderNumber} has been cancelled.`);
    },
  },

  // =========================================================================
  // 6. SSLCommerz & Payments (/api/v1/payments)
  // =========================================================================
  sslcommerz: {
    init: async (orderId: string): Promise<ApiResponse<{ gatewayPageURL: string; sessionkey: string }>> => {
      try {
        const res = await apiClient.post<ApiResponse<any>>(`/payments/sslcommerz/init/${orderId}`);
        if (res.data?.data) {
          return {
            success: true,
            data: {
              gatewayPageURL: res.data.data.gatewayPageUrl || res.data.data.gatewayPageURL,
              sessionkey: res.data.data.sessionKey || res.data.data.sessionkey,
            },
          };
        }
      } catch (err) {
        // Fallback simulation
      }
      await simulateDelay(80);
      const sessionkey = `SSLCZ_SESS_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      return wrapSuccess({
        gatewayPageURL: `/payment/sslcommerz-portal?orderId=${orderId}&session=${sessionkey}`,
        sessionkey,
      });
    },

    simulateSuccess: async (orderId: string): Promise<ApiResponse<Order>> => {
      try {
        const res = await apiClient.post<ApiResponse<any>>(`/payments/sslcommerz/simulate-success/${orderId}`);
        if (res.data?.data) {
          const order = simulateSSLCommerzSuccess(orderId);
          return wrapSuccess(order, 'Payment verified successfully!');
        }
      } catch (err) {
        // Fallback
      }
      await simulateDelay(100);
      const order = simulateSSLCommerzSuccess(orderId);
      return wrapSuccess(order, 'Payment verified successfully!');
    },

    validate: async (tranId: string, valId: string): Promise<ApiResponse<{ status: string; tranId: string }>> => {
      try {
        const res = await apiClient.post<ApiResponse<any>>('/payments/verify', { transactionId: tranId });
        if (res.data?.data) return wrapSuccess({ status: 'VALIDATED', tranId });
      } catch (err) {
        // Fallback
      }
      await simulateDelay(80);
      return wrapSuccess({ status: 'VALIDATED', tranId });
    },
  },

  // =========================================================================
  // 7. Authentication & Profile (/api/v1/auth & /api/v1/users)
  // =========================================================================
  auth: {
    sendRegistrationOtp: async (payload: {
      phone: string;
      name?: string;
    }): Promise<ApiResponse<{ phone: string; message: string; demoOtp?: string }>> => {
      try {
        const response = await apiClient.post<ApiResponse<any>>('/auth/register/send-otp', payload);
        if (response.data && response.data.success) {
          return response.data;
        }
      } catch (err: any) {
        if (err.response?.data?.message) {
          throw new Error(err.response.data.message);
        }
      }

      // Standalone Sandbox Fallback
      await simulateDelay(80);
      const cleanPhone = payload.phone.replace(/[^0-9]/g, '');
      const demoOtp = '123456';
      localStorage.setItem(`reg_otp_${cleanPhone}`, demoOtp);
      return wrapSuccess(
        {
          phone: payload.phone,
          message: `Verification code dispatched to ${payload.phone}`,
          demoOtp,
        },
        `OTP sent to ${payload.phone}`
      );
    },

    login: async (credentials: { identifier: string; password?: string }): Promise<
      ApiResponse<{ user: User; accessToken: string; refreshToken: string }>
    > => {
      try {
        const response = await apiClient.post<ApiResponse<any>>('/auth/login', {
          identifier: credentials.identifier,
          password: credentials.password || 'Password123!',
        });
        if (response.data && response.data.success) {
          const { user: backendUser, accessToken, refreshToken } = response.data.data;
          if (accessToken) localStorage.setItem('accessToken', accessToken);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

          const loggedInUser: User = {
            id: backendUser.id,
            name: backendUser.name,
            phone: backendUser.phone,
            email: backendUser.email,
            role: backendUser.role,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(backendUser.name)}`,
            createdAt: backendUser.createdAt || new Date().toISOString(),
          };

          const users = getUsers();
          const existingIdx = users.findIndex((u) => u.id === loggedInUser.id || u.phone === loggedInUser.phone);
          if (existingIdx >= 0) {
            users[existingIdx] = { ...users[existingIdx], ...loggedInUser };
          } else {
            users.push(loggedInUser);
          }
          localStorage.setItem('deshi_users_v1', JSON.stringify(users));
          localStorage.setItem('deshi_current_user_id_v1', loggedInUser.id);

          return wrapSuccess(
            { user: loggedInUser, accessToken, refreshToken },
            `Welcome back, ${loggedInUser.name}!`
          );
        }
      } catch (err: any) {
        if (err.response?.data?.message) {
          throw new Error(err.response.data.message);
        }
      }

      // Standalone Sandbox Fallback
      await simulateDelay(80);
      const users = getUsers();
      const matched =
        users.find(
          (u) =>
            u.email.toLowerCase() === credentials.identifier.toLowerCase() ||
            u.phone.replace(/\s+/g, '') === credentials.identifier.replace(/\s+/g, '')
        ) || users[0];

      setCurrentUser(matched.id);
      const token =
        matched.role === 'ADMIN'
          ? 'mock-jwt-admin-token-deshi-9988'
          : 'mock-jwt-customer-token-deshi-8921';
      const refreshToken =
        matched.role === 'ADMIN'
          ? 'mock-refresh-admin-token-deshi-7766'
          : 'mock-refresh-customer-token-deshi-4912';

      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);

      return wrapSuccess(
        {
          user: matched,
          accessToken: token,
          refreshToken,
        },
        `Welcome back, ${matched.name}!`
      );
    },

    adminLogin: async (credentials: { identifier: string; password?: string }): Promise<
      ApiResponse<{ user: User; accessToken: string; refreshToken: string }>
    > => {
      try {
        const response = await apiClient.post<ApiResponse<any>>('/auth/login', {
          identifier: credentials.identifier,
          password: credentials.password || 'Password123!',
        });
        if (response.data && response.data.success) {
          const { user: backendUser, accessToken, refreshToken } = response.data.data;
          if (backendUser.role !== 'ADMIN') {
            throw new Error('Access denied. Administrator privileges required.');
          }
          if (accessToken) localStorage.setItem('accessToken', accessToken);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

          const adminUser: User = {
            id: backendUser.id,
            name: backendUser.name,
            phone: backendUser.phone,
            email: backendUser.email,
            role: 'ADMIN',
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(backendUser.name)}`,
            createdAt: backendUser.createdAt || new Date().toISOString(),
          };

          const users = getUsers();
          const existingIdx = users.findIndex((u) => u.id === adminUser.id || u.phone === adminUser.phone);
          if (existingIdx >= 0) {
            users[existingIdx] = { ...users[existingIdx], ...adminUser };
          } else {
            users.push(adminUser);
          }
          localStorage.setItem('deshi_users_v1', JSON.stringify(users));
          localStorage.setItem('deshi_current_user_id_v1', adminUser.id);

          return wrapSuccess(
            { user: adminUser, accessToken, refreshToken },
            `Admin login successful. Welcome, ${adminUser.name}!`
          );
        }
      } catch (err: any) {
        if (err.response?.data?.message) {
          throw new Error(err.response.data.message);
        }
        if (err.message) throw err;
      }

      // Standalone Sandbox Fallback
      await simulateDelay(80);
      const admin = setCurrentUser('usr_admin_01');
      return wrapSuccess(
        {
          user: admin,
          accessToken: 'mock-jwt-admin-token-deshi-9988',
          refreshToken: 'mock-refresh-admin-token-deshi-7766',
        },
        `Welcome to Executive Portal, ${admin.name}!`
      );
    },

    register: async (payload: {
      name: string;
      phone: string;
      email?: string;
      password?: string;
      otp?: string;
    }): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> => {
      try {
        const response = await apiClient.post<ApiResponse<any>>('/auth/register', payload);
        if (response.data && response.data.success) {
          const { user: backendUser, accessToken, refreshToken } = response.data.data;
          if (accessToken) localStorage.setItem('accessToken', accessToken);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

          const registeredUser: User = {
            id: backendUser.id,
            name: backendUser.name,
            phone: backendUser.phone,
            email: backendUser.email,
            role: backendUser.role,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(backendUser.name)}`,
            createdAt: backendUser.createdAt || new Date().toISOString(),
          };

          const users = getUsers();
          users.push(registeredUser);
          localStorage.setItem('deshi_users_v1', JSON.stringify(users));
          localStorage.setItem('deshi_current_user_id_v1', registeredUser.id);

          return wrapSuccess(
            { user: registeredUser, accessToken, refreshToken },
            'Account created successfully!'
          );
        }
      } catch (err: any) {
        if (err.response?.data?.message) {
          throw new Error(err.response.data.message);
        }
      }

      // Standalone Sandbox Fallback
      await simulateDelay(100);
      const cleanPhone = payload.phone.replace(/[^0-9]/g, '');
      const storedOtp = localStorage.getItem(`reg_otp_${cleanPhone}`);
      if (storedOtp && payload.otp && payload.otp.trim() !== storedOtp && payload.otp.trim() !== '123456') {
        throw new Error('Invalid verification code (OTP). Please check SMS.');
      }
      localStorage.removeItem(`reg_otp_${cleanPhone}`);

      const users = getUsers();
      const newUser: User = {
        id: `usr_new_${Date.now()}`,
        name: payload.name,
        phone: payload.phone,
        email: payload.email || `${payload.phone}@deshicommerce.com.bd`,
        role: 'CUSTOMER',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.name)}`,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      localStorage.setItem('deshi_users_v1', JSON.stringify(users));

      setCurrentUser(newUser.id);
      const accessToken = `mock-jwt-new-user-${newUser.id}`;
      const refreshToken = `mock-refresh-new-user-${newUser.id}`;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      return wrapSuccess({ user: newUser, accessToken, refreshToken }, 'Account created successfully!');
    },

    googleAuth: async (payload: {
      email: string;
      name: string;
      avatarUrl?: string;
      googleId?: string;
      isSignUp?: boolean;
    }): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> => {
      await simulateDelay(80);
      const users = getUsers();
      let user = users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());

      if (!user) {
        const newUser: User = {
          id: `usr_google_${Date.now()}`,
          name: payload.name || payload.email.split('@')[0],
          phone: '017' + Math.floor(10000000 + Math.random() * 90000000),
          email: payload.email,
          role: 'CUSTOMER',
          avatarUrl:
            payload.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.name || payload.email)}`,
          authProvider: 'google',
          googleId: payload.googleId || `gid_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        localStorage.setItem('deshi_users_v1', JSON.stringify(users));
        user = newUser;
      } else {
        user.authProvider = 'google';
        if (payload.avatarUrl) user.avatarUrl = payload.avatarUrl;
        if (payload.name && !user.name) user.name = payload.name;
        localStorage.setItem('deshi_users_v1', JSON.stringify(users));
      }

      setCurrentUser(user.id);
      const accessToken = `mock-jwt-google-${user.id}`;
      const refreshToken = `mock-refresh-google-${user.id}`;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      return wrapSuccess(
        { user, accessToken, refreshToken },
        payload.isSignUp
          ? `Welcome to Deshi commerce, ${user.name}! Registered with Google Mail.`
          : `Signed in successfully with Google Mail (${user.email})`
      );
    },

    logout: async (): Promise<ApiResponse<{ loggedOut: boolean }>> => {
      try {
        await apiClient.post('/auth/logout');
      } catch (err) {
        // Ignore network errors on logout
      }
      clearCurrentUser();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return wrapSuccess({ loggedOut: true }, 'Signed out successfully');
    },

    refresh: async (token: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
      try {
        const res = await apiClient.post<ApiResponse<any>>('/auth/refresh', { refreshToken: token });
        if (res.data?.data) return res.data;
      } catch (err) {
        // Fallback
      }
      await simulateDelay(40);
      const newAccessToken = `mock-refreshed-jwt-${Date.now()}`;
      const newRefreshToken = `mock-refreshed-refresh-${Date.now()}`;
      return wrapSuccess({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    },

    getProfile: async (): Promise<ApiResponse<User | null>> => {
      try {
        const res = await apiClient.get<ApiResponse<any>>('/users/me');
        if (res.data?.data) {
          const u = res.data.data;
          const user: User = {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: u.role,
            createdAt: u.createdAt || new Date().toISOString(),
          };
          return wrapSuccess(user);
        }
      } catch (err) {
        // Fallback
      }
      await simulateDelay(40);
      return wrapSuccess(getCurrentUser());
    },

    switchDemoUser: async (role: 'CUSTOMER' | 'ADMIN'): Promise<ApiResponse<User>> => {
      if (role === 'ADMIN') {
        try {
          const res = await apiService.auth.adminLogin({
            identifier: 'admin@store.com.bd',
            password: 'Password123!',
          });
          return wrapSuccess(res.data.user, `Switched session to ${res.data.user.name} (ADMIN)`);
        } catch {
          // fallback
        }
      } else {
        try {
          const res = await apiService.auth.login({
            identifier: '01722222222',
            password: 'Password123!',
          });
          return wrapSuccess(res.data.user, `Switched session to ${res.data.user.name} (CUSTOMER)`);
        } catch {
          // fallback
        }
      }
      await simulateDelay(40);
      const users = getUsers();
      const target = users.find((u) => u.role === role) || users[0];
      const user = setCurrentUser(target.id);
      return wrapSuccess(user, `Switched session to ${user.name} (${user.role})`);
    },

    changePassword: async (oldPass: string, newPass: string): Promise<ApiResponse<{ updated: boolean }>> => {
      try {
        const res = await apiClient.patch('/users/me/password', {
          oldPassword: oldPass,
          newPassword: newPass,
        });
        if (res.data) return wrapSuccess({ updated: true }, 'Password changed successfully');
      } catch (err: any) {
        if (err.response?.data?.message) throw new Error(err.response.data.message);
      }
      await simulateDelay(80);
      return wrapSuccess({ updated: true }, 'Password changed successfully');
    },

    forgotPassword: async (identifier: string): Promise<ApiResponse<{ message: string; otp?: string }>> => {
      try {
        const res = await apiClient.post<ApiResponse<any>>('/auth/forgot-password', {
          identifier,
        });
        if (res.data?.data) return res.data;
      } catch (err: any) {
        if (err.response?.data?.message) throw new Error(err.response.data.message);
      }
      await simulateDelay(80);
      return wrapSuccess({
        message: `Reset OTP sent to ${identifier}`,
        otp: '123456',
      });
    },

    resetPassword: async (otp: string, newPass: string): Promise<ApiResponse<{ reset: boolean }>> => {
      try {
        const res = await apiClient.post('/auth/reset-password', {
          phone: '',
          otp,
          newPassword: newPass,
        });
        if (res.data) return wrapSuccess({ reset: true }, 'Password successfully reset');
      } catch (err: any) {
        if (err.response?.data?.message) throw new Error(err.response.data.message);
      }
      await simulateDelay(80);
      return wrapSuccess({ reset: true }, 'Password successfully reset');
    },
  },

  // =========================================================================
  // 8. Notifications (/api/v1/users/me/notifications)
  // =========================================================================
  notifications: {
    getMyNotifications: async (): Promise<ApiResponse<NotificationLog[]>> => {
      try {
        const res = await apiClient.get<ApiResponse<any[]>>('/users/me/notifications');
        if (res.data?.data && Array.isArray(res.data.data)) {
          const logs: NotificationLog[] = res.data.data.map((n: any) => ({
            id: n.id,
            channel: n.channel,
            event: n.event,
            recipient: n.recipient,
            subject: n.subject || 'Order Update',
            message: n.message,
            status: n.status || 'SENT',
            orderId: n.orderId,
            userId: n.userId,
            createdAt: n.createdAt || new Date().toISOString(),
          }));
          return wrapSuccess(logs);
        }
      } catch (err) {
        // Fallback
      }
      await simulateDelay(60);
      const user = getCurrentUser();
      const allLogs = getNotificationLogs();
      const filtered = user ? allLogs.filter((l) => !l.userId || l.userId === user.id) : allLogs;
      return wrapSuccess(filtered);
    },
  },

  // =========================================================================
  // 9. Admin Operations (/api/v1/admin & /api/v1/admin/orders)
  // =========================================================================
  admin: {
    uploadImage: async (file: File): Promise<ApiResponse<{ url: string; fileName: string; size: number }>> => {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await apiClient.post<ApiResponse<any>>('/admin/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (res.data?.data?.url) {
          const rawUrl = res.data.data.url;
          const fullUrl = rawUrl.startsWith('http') ? rawUrl : `${API_BASE_URL.replace('/api/v1', '')}${rawUrl}`;
          return wrapSuccess({ ...res.data.data, url: fullUrl }, 'Image uploaded successfully');
        }
      } catch (err: any) {
        console.warn('Backend upload failed, converting to local data URL:', err?.message);
      }

      // Offline / fallback data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      return wrapSuccess(
        { url: dataUrl, fileName: file.name, size: file.size },
        'Image processed successfully'
      );
    },

    getDashboardSummary: async (): Promise<ApiResponse<AdminDashboardSummary>> => {
      try {
        const res = await apiClient.get<ApiResponse<any>>('/admin/dashboard/summary');
        if (res.data?.data) {
          const s = res.data.data;
          const fallback = getAdminDashboardSummary();
          const summary: AdminDashboardSummary = {
            totalRevenue: Number(s.totalSales ?? fallback.totalRevenue),
            totalOrders: Number(s.totalOrders ?? fallback.totalOrders),
            pendingOrders: Number(s.pendingOrders ?? fallback.pendingOrders),
            lowStockProducts: Number(s.lowStockProducts ?? fallback.lowStockProducts),
            monthlyGrowthRate: fallback.monthlyGrowthRate || 14.8,
            ordersFulfilledRate: fallback.ordersFulfilledRate || 92.4,
            recentOrders: fallback.recentOrders,
            revenueByMonth: fallback.revenueByMonth,
            statusBreakdown: fallback.statusBreakdown,
          };
          return wrapSuccess(summary);
        }
      } catch (err) {
        // Fallback
      }
      await simulateDelay(60);
      return wrapSuccess(getAdminDashboardSummary());
    },

    getOrders: async (filters?: {
      status?: string;
      search?: string;
      userId?: string;
    }): Promise<ApiResponse<Order[]>> => {
      try {
        const res = await apiClient.get<ApiResponse<any[]>>('/admin/orders', {
          params: filters,
        });
        if (res.data?.data && Array.isArray(res.data.data)) {
          const mapped = res.data.data.map(mapBackendOrderToFrontendOrder);
          return wrapSuccess(mapped);
        }
      } catch (err) {
        // Fallback
      }
      await simulateDelay(60);
      const list = getOrders(filters?.status, filters?.search, filters?.userId);
      return wrapSuccess(list);
    },

    updateTracking: async (
      orderId: string,
      courierData: {
        courierName: string;
        trackingNumber: string;
        trackingUrl?: string;
        estimatedDeliveryDate?: string;
        advanceToShipped?: boolean;
      }
    ): Promise<ApiResponse<Order>> => {
      try {
        const payload = {
          courierName: courierData.courierName,
          trackingNumber: courierData.trackingNumber,
          trackingUrl: courierData.trackingUrl,
          estimatedDeliveryDate: courierData.estimatedDeliveryDate,
          status: courierData.advanceToShipped ? 'SHIPPED' : undefined,
        };
        const res = await apiClient.patch<ApiResponse<any>>(
          `/admin/orders/${orderId}/tracking`,
          payload
        );
        if (res.data?.data) {
          const mapped = mapBackendOrderToFrontendOrder(res.data.data);
          try {
            updateOrderTracking(orderId, courierData);
          } catch {
            // Ignore mock localStorage errors
          }
          return wrapSuccess(mapped, `Courier assigned to #${mapped.orderNumber}. SMS sent to customer.`);
        }
      } catch (err: any) {
        console.warn('Backend updateTracking failed, saving locally:', err?.response?.data || err?.message);
        if (err?.response?.data?.message) {
          throw new Error(err.response.data.message);
        }
      }
      await simulateDelay(80);
      try {
        const updated = updateOrderTracking(orderId, courierData);
        return wrapSuccess(updated, `Courier assigned to #${updated.orderNumber}. SMS sent to customer.`);
      } catch {
        return wrapSuccess(
          { id: orderId, orderNumber: orderId } as Order,
          `Courier assigned to #${orderId}. SMS sent to customer.`
        );
      }
    },

    updateStatus: async (orderId: string, status: OrderStatus, comment?: string): Promise<ApiResponse<Order>> => {
      try {
        const res = await apiClient.patch<ApiResponse<any>>(`/admin/orders/${orderId}/status`, {
          status,
          comment: comment || `Status updated to ${status}`,
        });
        if (res.data?.data) {
          const mapped = mapBackendOrderToFrontendOrder(res.data.data);
          try {
            updateOrderStatus(orderId, status);
          } catch {
            // Ignore mock localStorage errors
          }
          return wrapSuccess(mapped, res.data.message || `Order #${mapped.orderNumber} status changed to ${status}`);
        }
      } catch (err: any) {
        console.warn('Backend updateStatus failed, saving locally:', err?.response?.data || err?.message);
        if (err?.response?.data?.message) {
          throw new Error(err.response.data.message);
        }
      }
      await simulateDelay(80);
      try {
        const updated = updateOrderStatus(orderId, status);
        return wrapSuccess(updated, `Order #${updated.orderNumber} status changed to ${status}`);
      } catch {
        return wrapSuccess(
          {
            id: orderId,
            orderNumber: orderId.startsWith('ord_') ? `BD-${orderId.substring(4, 12).toUpperCase()}` : orderId,
            status,
          } as Order,
          `Order status changed to ${status}`
        );
      }
    },

    getCustomer360: async (userId: string): Promise<ApiResponse<Customer360Profile>> => {
      try {
        const res = await apiClient.get<ApiResponse<any>>(`/admin/orders/customer/${userId}`);
        if (res.data?.data) {
          const s = res.data.data;
          const mappedOrders = (s.orders || []).map(mapBackendOrderToFrontendOrder);
          const profile: Customer360Profile = {
            user: {
              id: s.userId,
              name: s.customerName || 'Customer',
              email: s.customerEmail || `${s.customerPhone || 'customer'}@deshicommerce.com.bd`,
              phone: s.customerPhone || '01700000000',
              role: 'CUSTOMER',
              createdAt: new Date().toISOString(),
            },
            totalOrders: s.totalOrdersCount || mappedOrders.length,
            totalSpend: Number(s.totalAmountSpent || 0),
            lifetimeValue: Number(s.totalAmountSpent || 0),
            averageOrderValue: s.totalOrdersCount > 0 ? Number(s.totalAmountSpent || 0) / s.totalOrdersCount : 0,
            firstOrderDate: mappedOrders[0]?.createdAt || new Date().toISOString(),
            lastOrderDate: mappedOrders[mappedOrders.length - 1]?.createdAt || new Date().toISOString(),
            orders: mappedOrders,
            savedAddresses: [],
          };
          return wrapSuccess(profile);
        }
      } catch (err) {
        // Fallback
      }
      await simulateDelay(60);
      return wrapSuccess(getCustomer360Profile(userId));
    },

    getNotifications: async (orderId?: string): Promise<ApiResponse<NotificationLog[]>> => {
      try {
        const url = orderId
          ? `/admin/notifications/order/${orderId}`
          : '/admin/notifications';
        const res = await apiClient.get<ApiResponse<any[]>>(url);
        if (res.data?.data && Array.isArray(res.data.data)) {
          const logs = res.data.data.map(mapBackendNotification);
          return wrapSuccess(logs);
        }
      } catch (err) {
        // Fallback
      }
      await simulateDelay(40);
      return wrapSuccess(getNotificationLogs(orderId));
    },

    getUsers: async (): Promise<ApiResponse<User[]>> => {
      try {
        const res = await apiClient.get<ApiResponse<any[]>>('/admin/users');
        if (res.data?.data && Array.isArray(res.data.data)) {
          const users: User[] = res.data.data.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            role: u.role,
            createdAt: u.createdAt || new Date().toISOString(),
          }));
          return wrapSuccess(users);
        }
      } catch (err) {
        // Fallback
      }
      await simulateDelay(40);
      return wrapSuccess(getUsers());
    },

    setUserStatus: async (userId: string, active: boolean): Promise<ApiResponse<User>> => {
      try {
        const res = await apiClient.patch<ApiResponse<any>>(`/admin/users/${userId}/status?active=${active}`);
        if (res.data?.data) return res.data;
      } catch (err: any) {
        if (err.response?.data?.message) throw new Error(err.response.data.message);
      }
      await simulateDelay(60);
      const users = getUsers();
      const target = users.find((u) => u.id === userId);
      if (target) return wrapSuccess(target);
      throw new Error('User not found');
    },
  },
};
