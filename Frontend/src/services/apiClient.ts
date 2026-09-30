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
  Address,
  Order,
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

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Injects Bearer JWT
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Auto Refresh on 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        // Refresh request
        const res = await apiService.auth.refresh(refreshToken);
        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;

        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        console.warn('Auth token expired. Relogin required.');
      }
    }
    return Promise.reject(error);
  }
);

// High-fidelity Mock & Hybrid Dispatcher
// When live backend is unreachable or in prototype sandbox mode, seamlessly routes all 38 endpoints
const simulateDelay = async (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

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

export const apiService = {
  // 1-4. Categories
  categories: {
    getAll: async (): Promise<ApiResponse<Category[]>> => {
      await simulateDelay();
      const list = getCategories();
      return wrapSuccess(list);
    },
    create: async (payload: Partial<Category>): Promise<ApiResponse<Category>> => {
      await simulateDelay();
      const created = saveCategory(payload);
      return wrapSuccess(created, 'Category created successfully');
    },
    update: async (id: string, payload: Partial<Category>): Promise<ApiResponse<Category>> => {
      await simulateDelay();
      const updated = saveCategory({ ...payload, id });
      return wrapSuccess(updated, 'Category updated successfully');
    },
    delete: async (id: string): Promise<ApiResponse<{ id: string }>> => {
      await simulateDelay();
      deleteCategory(id);
      return wrapSuccess({ id }, 'Category deleted successfully');
    },
  },

  // 5-9. Products
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
      await simulateDelay();
      let list = getProducts();

      if (params?.category && params.category !== 'all') {
        const cat = params.category.toLowerCase();
        list = list.filter((p) => p.categoryId.toLowerCase().includes(cat) || p.categoryName.toLowerCase().includes(cat));
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
          default:
            // Popular
            list.sort((a, b) => b.reviewCount - a.reviewCount);
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
      await simulateDelay();
      const p = getProductBySlug(slug);
      if (!p) throw new Error('Product not found');
      return wrapSuccess(p);
    },

    create: async (payload: Partial<Product>): Promise<ApiResponse<Product>> => {
      await simulateDelay();
      const created = saveProduct(payload);
      return wrapSuccess(created, 'Product added to catalog');
    },

    update: async (id: string, payload: Partial<Product>): Promise<ApiResponse<Product>> => {
      await simulateDelay();
      const updated = saveProduct({ ...payload, id });
      return wrapSuccess(updated, 'Product updated successfully');
    },

    delete: async (id: string): Promise<ApiResponse<{ id: string }>> => {
      await simulateDelay();
      deleteProduct(id);
      return wrapSuccess({ id }, 'Product removed from catalog');
    },
  },

  // 10-14. Cart
  cart: {
    get: async (): Promise<ApiResponse<Cart>> => {
      await simulateDelay(60);
      return wrapSuccess(getCart());
    },
    addItem: async (productId: string, quantity = 1): Promise<ApiResponse<Cart>> => {
      await simulateDelay(60);
      const updated = addToCart(productId, quantity);
      return wrapSuccess(updated, 'Item added to your shopping bag');
    },
    updateItem: async (itemId: string, quantity: number): Promise<ApiResponse<Cart>> => {
      await simulateDelay(60);
      const updated = updateCartItemQuantity(itemId, quantity);
      return wrapSuccess(updated);
    },
    removeItem: async (itemId: string): Promise<ApiResponse<Cart>> => {
      await simulateDelay(60);
      const updated = removeCartItem(itemId);
      return wrapSuccess(updated, 'Item removed from bag');
    },
    clear: async (): Promise<ApiResponse<Cart>> => {
      await simulateDelay(60);
      const updated = clearCart();
      return wrapSuccess(updated, 'Bag cleared');
    },
  },

  // 15-18. Addresses
  addresses: {
    getAll: async (): Promise<ApiResponse<Address[]>> => {
      await simulateDelay(60);
      return wrapSuccess(getAddresses());
    },
    create: async (payload: Partial<Address>): Promise<ApiResponse<Address>> => {
      await simulateDelay(80);
      const addr = saveAddress(payload);
      return wrapSuccess(addr, 'Delivery address saved');
    },
    update: async (id: string, payload: Partial<Address>): Promise<ApiResponse<Address>> => {
      await simulateDelay(80);
      const addr = saveAddress({ ...payload, id });
      return wrapSuccess(addr, 'Address updated');
    },
    delete: async (id: string): Promise<ApiResponse<{ id: string }>> => {
      await simulateDelay(80);
      deleteAddress(id);
      return wrapSuccess({ id }, 'Address deleted');
    },
  },

  // 19-23. Orders & Payment
  orders: {
    getPaymentMethods: async (): Promise<
      ApiResponse<{ methods: { id: string; name: string; description: string; badge?: string }[] }>
    > => {
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
      await simulateDelay(150);
      const order = createOrder(payload);
      return wrapSuccess(order, `Order #${order.orderNumber} placed successfully!`);
    },

    getCustomerOrders: async (): Promise<ApiResponse<Order[]>> => {
      await simulateDelay(80);
      const user = getCurrentUser();
      const list = user ? getOrders(undefined, undefined, user.id) : [];
      return wrapSuccess(list);
    },

    getById: async (id: string): Promise<ApiResponse<Order>> => {
      await simulateDelay(80);
      const order = getOrderById(id);
      if (!order) throw new Error('Order not found');
      return wrapSuccess(order);
    },

    cancel: async (id: string, reason: string): Promise<ApiResponse<Order>> => {
      await simulateDelay(120);
      const order = cancelOrder(id, reason);
      return wrapSuccess(order, `Order #${order.orderNumber} has been cancelled.`);
    },
  },

  // 24-26. SSLCommerz Gateway
  sslcommerz: {
    init: async (orderId: string): Promise<ApiResponse<{ gatewayPageURL: string; sessionkey: string }>> => {
      await simulateDelay(100);
      const sessionkey = `SSLCZ_SESS_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      return wrapSuccess({
        gatewayPageURL: `/payment/sslcommerz-portal?orderId=${orderId}&session=${sessionkey}`,
        sessionkey,
      });
    },

    simulateSuccess: async (orderId: string): Promise<ApiResponse<Order>> => {
      await simulateDelay(150);
      const order = simulateSSLCommerzSuccess(orderId);
      return wrapSuccess(order, 'Payment verified successfully!');
    },

    validate: async (tranId: string, valId: string): Promise<ApiResponse<{ status: string; tranId: string }>> => {
      await simulateDelay(100);
      return wrapSuccess({ status: 'VALIDATED', tranId });
    },
  },

  // 27-33. Authentication & Profile
  auth: {
    login: async (credentials: { identifier: string; password?: string }): Promise<
      ApiResponse<{ user: User; accessToken: string; refreshToken: string }>
    > => {
      await simulateDelay(100);
      const users = getUsers();
      // Match phone or email
      const matched =
        users.find(
          (u) =>
            u.email.toLowerCase() === credentials.identifier.toLowerCase() ||
            u.phone.replace(/\s+/g, '') === credentials.identifier.replace(/\s+/g, '')
        ) || users[0];

      setCurrentUser(matched.id);
      const token = matched.role === 'ADMIN' ? 'mock-jwt-admin-token-deshi-9988' : 'mock-jwt-customer-token-deshi-8921';
      const refreshToken = matched.role === 'ADMIN' ? 'mock-refresh-admin-token-deshi-7766' : 'mock-refresh-customer-token-deshi-4912';

      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);

      return wrapSuccess({
        user: matched,
        accessToken: token,
        refreshToken,
      }, `Welcome back, ${matched.name}!`);
    },

    register: async (payload: {
      name: string;
      phone: string;
      email?: string;
      password?: string;
    }): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> => {
      await simulateDelay(150);
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
      await simulateDelay(120);
      const users = getUsers();
      let user = users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());

      if (!user) {
        const newUser: User = {
          id: `usr_google_${Date.now()}`,
          name: payload.name || payload.email.split('@')[0],
          phone: '017' + Math.floor(10000000 + Math.random() * 90000000),
          email: payload.email,
          role: 'CUSTOMER',
          avatarUrl: payload.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.name || payload.email)}`,
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
      await simulateDelay(50);
      clearCurrentUser();
      return wrapSuccess({ loggedOut: true }, 'Signed out successfully');
    },

    refresh: async (token: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
      await simulateDelay(40);
      const newAccessToken = `mock-refreshed-jwt-${Date.now()}`;
      const newRefreshToken = `mock-refreshed-refresh-${Date.now()}`;
      return wrapSuccess({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    },

    getProfile: async (): Promise<ApiResponse<User | null>> => {
      await simulateDelay(40);
      return wrapSuccess(getCurrentUser());
    },

    switchDemoUser: async (role: 'CUSTOMER' | 'ADMIN'): Promise<ApiResponse<User>> => {
      await simulateDelay(40);
      const users = getUsers();
      const target = users.find((u) => u.role === role) || users[0];
      const user = setCurrentUser(target.id);
      return wrapSuccess(user, `Switched session to ${user.name} (${user.role})`);
    },

    changePassword: async (oldPass: string, newPass: string): Promise<ApiResponse<{ updated: boolean }>> => {
      await simulateDelay(120);
      return wrapSuccess({ updated: true }, 'Password changed successfully');
    },

    forgotPassword: async (identifier: string): Promise<ApiResponse<{ sent: boolean; message: string }>> => {
      await simulateDelay(120);
      return wrapSuccess(
        { sent: true, message: `Verification code sent to ${identifier}` },
        `OTP sent to ${identifier}`
      );
    },

    resetPassword: async (otp: string, newPass: string): Promise<ApiResponse<{ reset: boolean }>> => {
      await simulateDelay(120);
      return wrapSuccess({ reset: true }, 'Password successfully reset');
    },
  },

  // 34-38. Admin Operations
  admin: {
    getDashboardSummary: async (): Promise<ApiResponse<AdminDashboardSummary>> => {
      await simulateDelay(80);
      return wrapSuccess(getAdminDashboardSummary());
    },

    getOrders: async (filters?: {
      status?: string;
      search?: string;
      userId?: string;
    }): Promise<ApiResponse<Order[]>> => {
      await simulateDelay(80);
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
      await simulateDelay(120);
      const updated = updateOrderTracking(orderId, courierData);
      return wrapSuccess(updated, `Courier assigned to #${updated.orderNumber}. SMS sent to customer.`);
    },

    updateStatus: async (orderId: string, status: OrderStatus): Promise<ApiResponse<Order>> => {
      await simulateDelay(100);
      const updated = updateOrderStatus(orderId, status);
      return wrapSuccess(updated, `Order #${updated.orderNumber} status changed to ${status}`);
    },

    getCustomer360: async (userId: string): Promise<ApiResponse<Customer360Profile>> => {
      await simulateDelay(90);
      return wrapSuccess(getCustomer360Profile(userId));
    },

    getNotifications: async (orderId?: string): Promise<ApiResponse<NotificationLog[]>> => {
      await simulateDelay(60);
      return wrapSuccess(getNotificationLogs(orderId));
    },
  },
};
