import {
  User,
  Address,
  Category,
  Product,
  Order,
  NotificationLog,
  AdminDashboardSummary,
  Customer360Profile,
  Cart,
  CartItem,
  OrderStatus,
  FAQItem,
  FlashSaleCampaign,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ADDRESSES,
  INITIAL_ORDERS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockDatabase';
import { calculateDeliveryFee, FREE_DELIVERY_THRESHOLD } from '../data/bangladeshGeo';

const STORAGE_KEYS = {
  USERS: 'deshi_users_v1',
  CATEGORIES: 'deshi_categories_v1',
  PRODUCTS: 'deshi_products_v1',
  ADDRESSES: 'deshi_addresses_v1',
  ORDERS: 'deshi_orders_v1',
  NOTIFICATIONS: 'deshi_notifications_v1',
  CURRENT_USER_ID: 'deshi_current_user_id_v1',
  CART: 'deshi_cart_v1',
  HERO_SHOWCASE: 'deshi_hero_showcase_v1',
  FAQS: 'deshi_faqs_v1',
  FLASH_SALE: 'deshi_flash_sale_v1',
};

// Initialize default state
export function initDatabase() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADDRESSES)) {
    localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(INITIAL_ADDRESSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.HERO_SHOWCASE)) {
    localStorage.setItem(STORAGE_KEYS.HERO_SHOWCASE, JSON.stringify(INITIAL_HERO_SHOWCASE));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FAQS)) {
    localStorage.setItem(STORAGE_KEYS.FAQS, JSON.stringify(INITIAL_FAQS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FLASH_SALE)) {
    localStorage.setItem(STORAGE_KEYS.FLASH_SALE, JSON.stringify(INITIAL_FLASH_SALE));
  }
}

// Helpers
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Local storage write error', e);
  }
}

// Users & Auth
export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function getCurrentUser(): User | null {
  const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  const token = localStorage.getItem('accessToken');
  if (!currentId || !token) return null;
  const users = getUsers();
  return users.find((u) => u.id === currentId) || null;
}

export function clearCurrentUser(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function setCurrentUser(userId: string): User {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  const users = getUsers();
  const user = users.find((u) => u.id === userId) || users[0];
  if (user.role === 'ADMIN') {
    localStorage.setItem('accessToken', 'mock-jwt-admin-token-deshi-9988');
    localStorage.setItem('refreshToken', 'mock-refresh-admin-token-deshi-7766');
  } else {
    localStorage.setItem('accessToken', 'mock-jwt-customer-token-deshi-8921');
    localStorage.setItem('refreshToken', 'mock-refresh-customer-token-deshi-4912');
  }
  return user;
}

export function deleteUser(userId: string): boolean {
  const users = getUsers();
  const updated = users.filter((u) => u.id !== userId);
  setItem(STORAGE_KEYS.USERS, updated);
  return true;
}

// Categories
export function getCategories(): Category[] {
  const cats = getItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const products = getProducts();
  return cats.map((cat) => ({
    ...cat,
    productCount: products.filter((p) => p.categoryId === cat.id).length,
  }));
}

export function saveCategory(category: Partial<Category>): Category {
  const list = getCategories();
  if (category.id) {
    const idx = list.findIndex((c) => c.id === category.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...category } as Category;
      setItem(STORAGE_KEYS.CATEGORIES, list);
      return list[idx];
    }
  }
  const newCat: Category = {
    id: `cat_${Date.now()}`,
    name: category.name || 'New Category',
    nameBn: category.nameBn || '',
    slug: category.slug || (category.name || 'new').toLowerCase().replace(/\s+/g, '-'),
    description: category.description || '',
    active: category.active ?? true,
    productCount: 0,
  };
  list.push(newCat);
  setItem(STORAGE_KEYS.CATEGORIES, list);
  return newCat;
}

export function deleteCategory(id: string): void {
  const list = getCategories().filter((c) => c.id !== id);
  setItem(STORAGE_KEYS.CATEGORIES, list);
}

// Products
export function getProducts(): Product[] {
  return getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
}

export function getProductBySlug(slug: string): Product | undefined {
  return getProducts().find((p) => p.slug === slug || p.id === slug);
}

export function saveProduct(product: Partial<Product>): Product {
  const list = getProducts();
  if (product.id) {
    const idx = list.findIndex((p) => p.id === product.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...product } as Product;
      setItem(STORAGE_KEYS.PRODUCTS, list);
      return list[idx];
    }
  }
  const newProduct: Product = {
    id: `prd_${Date.now()}`,
    name: product.name || 'Untitled Product',
    nameBn: product.nameBn || '',
    slug: product.slug || (product.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    brand: product.brand || 'Deshi Commerce',
    categoryId: product.categoryId || 'cat_mobile',
    categoryName: product.categoryName || 'Mobile & Gadgets',
    description: product.description || '',
    price: Number(product.price) || 0,
    discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined,
    buyingPrice: product.buyingPrice ? Number(product.buyingPrice) : undefined,
    stock: Number(product.stock) || 0,
    sku: product.sku || `DS-${Date.now().toString().slice(-6)}`,
    images: product.images && product.images.length > 0 ? product.images : [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    ],
    specs: product.specs || { 'Standard': 'Verified Quality' },
    rating: product.rating || 5.0,
    reviewCount: product.reviewCount || 1,
    isAvailable: product.isAvailable ?? true,
    isFeatured: product.isFeatured ?? false,
    tags: product.tags || [],
    createdAt: new Date().toISOString(),
  };
  list.unshift(newProduct);
  setItem(STORAGE_KEYS.PRODUCTS, list);
  return newProduct;
}

export function deleteProduct(id: string): void {
  const list = getProducts().filter((p) => p.id !== id);
  setItem(STORAGE_KEYS.PRODUCTS, list);
}

// Cart
export function getCart(): Cart {
  const raw = getItem<CartItem[]>(STORAGE_KEYS.CART, [
    {
      id: 'cart_item_init_1',
      productId: 'prd_samsung_a55',
      product: INITIAL_PRODUCTS[0],
      quantity: 1,
      price: INITIAL_PRODUCTS[0].discountPrice || INITIAL_PRODUCTS[0].price,
      totalPrice: INITIAL_PRODUCTS[0].discountPrice || INITIAL_PRODUCTS[0].price,
    },
  ]);

  const subtotal = raw.reduce((sum, item) => sum + item.totalPrice, 0);
  const itemCount = raw.reduce((sum, item) => sum + item.quantity, 0);
  const eligibleForFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return {
    id: 'cart_current',
    items: raw,
    subtotal,
    itemCount,
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    eligibleForFreeDelivery,
    amountNeededForFreeDelivery,
  };
}

export function addToCart(productId: string, quantity = 1): Cart {
  const cart = getCart();
  const products = getProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) return cart;

  const effectivePrice = product.discountPrice || product.price;
  const existing = cart.items.find((item) => item.productId === productId);

  let newItems: CartItem[];
  if (existing) {
    newItems = cart.items.map((item) =>
      item.productId === productId
        ? {
            ...item,
            quantity: Math.min(product.stock, item.quantity + quantity),
            totalPrice: Math.min(product.stock, item.quantity + quantity) * effectivePrice,
          }
        : item
    );
  } else {
    newItems = [
      ...cart.items,
      {
        id: `cart_item_${Date.now()}`,
        productId,
        product,
        quantity: Math.min(product.stock, quantity),
        price: effectivePrice,
        totalPrice: Math.min(product.stock, quantity) * effectivePrice,
      },
    ];
  }

  setItem(STORAGE_KEYS.CART, newItems);
  return getCart();
}

export function updateCartItemQuantity(itemId: string, quantity: number): Cart {
  const cart = getCart();
  if (quantity <= 0) {
    return removeCartItem(itemId);
  }

  const newItems = cart.items.map((item) => {
    if (item.id === itemId) {
      const q = Math.min(item.product.stock, quantity);
      return {
        ...item,
        quantity: q,
        totalPrice: q * item.price,
      };
    }
    return item;
  });

  setItem(STORAGE_KEYS.CART, newItems);
  return getCart();
}

export function removeCartItem(itemId: string): Cart {
  const cart = getCart();
  const newItems = cart.items.filter((item) => item.id !== itemId);
  setItem(STORAGE_KEYS.CART, newItems);
  return getCart();
}

export function clearCart(): Cart {
  setItem(STORAGE_KEYS.CART, []);
  return getCart();
}

// Addresses
export function getAddresses(): Address[] {
  const user = getCurrentUser();
  const all = getItem<Address[]>(STORAGE_KEYS.ADDRESSES, INITIAL_ADDRESSES);
  if (!user) return all.filter((a) => a.userId === 'usr_customer_01' || a.userId === 'guest_user');
  return all.filter((a) => a.userId === user.id);
}

export function saveAddress(address: Partial<Address>): Address {
  const user = getCurrentUser();
  const userId = user ? user.id : 'usr_customer_01';
  const all = getItem<Address[]>(STORAGE_KEYS.ADDRESSES, INITIAL_ADDRESSES);

  if (address.isDefault) {
    all.forEach((a) => {
      if (a.userId === userId) a.isDefault = false;
    });
  }

  if (address.id) {
    const idx = all.findIndex((a) => a.id === address.id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...address } as Address;
      setItem(STORAGE_KEYS.ADDRESSES, all);
      return all[idx];
    }
  }

  const newAddr: Address = {
    id: `addr_${Date.now()}`,
    userId,
    fullName: address.fullName || (user ? user.name : 'Valued Customer'),
    phone: address.phone || (user ? user.phone : '01722222222'),
    division: address.division || 'Dhaka',
    district: address.district || 'Dhaka',
    upazila: address.upazila || 'Dhanmondi',
    streetAddress: address.streetAddress || '',
    isDefault: address.isDefault ?? all.filter((a) => a.userId === userId).length === 0,
    type: address.type || 'HOME',
  };

  all.unshift(newAddr);
  setItem(STORAGE_KEYS.ADDRESSES, all);
  return newAddr;
}

export function deleteAddress(id: string): void {
  const all = getItem<Address[]>(STORAGE_KEYS.ADDRESSES, INITIAL_ADDRESSES).filter((a) => a.id !== id);
  setItem(STORAGE_KEYS.ADDRESSES, all);
}

// Orders
export function getOrders(status?: string, search?: string, userId?: string): Order[] {
  let orders = getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);

  if (userId) {
    orders = orders.filter((o) => o.userId === userId);
  }
  if (status && status !== 'ALL') {
    orders = orders.filter((o) => o.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.shippingAddress.district.toLowerCase().includes(q)
    );
  }

  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOrderById(id: string): Order | undefined {
  const orders = getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  return orders.find((o) => o.id === id || o.orderNumber === id);
}

export function createOrder(payload: {
  addressId: string;
  paymentMethod: 'COD' | 'SSLCOMMERZ';
  customerNote?: string;
}): Order {
  const user = getCurrentUser();
  const cart = getCart();
  const addresses = getAddresses();
  const address = addresses.find((a) => a.id === payload.addressId) || addresses[0];

  const deliveryCharge = calculateDeliveryFee(address ? address.district : 'Dhaka', cart.subtotal);
  const totalAmount = cart.subtotal + deliveryCharge;
  const orderNumber = `BD-${Math.floor(70000000 + Math.random() * 20000000)}`;

  const newOrder: Order = {
    id: `ord_${Date.now()}`,
    orderNumber,
    userId: user ? user.id : 'usr_guest',
    customerName: address ? address.fullName : (user ? user.name : 'Customer'),
    customerPhone: address ? address.phone : (user ? user.phone : '01722222222'),
    customerEmail: user ? user.email : (address ? `${address.phone}@deshicommerce.com.bd` : 'customer@deshicommerce.com.bd'),
    shippingAddress: address || {
      id: 'addr_fallback',
      userId: user ? user.id : 'usr_guest',
      fullName: 'Customer',
      phone: '01722222222',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Dhanmondi',
      streetAddress: 'Dhanmondi, Dhaka',
      isDefault: true,
    },
    items: cart.items.map((item) => ({
      id: `item_${Date.now()}_${item.productId}`,
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.images[0],
      price: item.price,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
    })),
    subtotal: cart.subtotal,
    deliveryCharge,
    totalAmount,
    status: 'PENDING',
    paymentMethod: payload.paymentMethod,
    paymentStatus: payload.paymentMethod === 'SSLCOMMERZ' ? 'INITIATED' : 'PENDING',
    customerNote: payload.customerNote,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const all = getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  all.unshift(newOrder);
  setItem(STORAGE_KEYS.ORDERS, all);

  // Add audit logs for this order
  addNotificationLog({
    orderId: newOrder.id,
    orderNumber: newOrder.orderNumber,
    channel: 'SMS',
    event: 'ORDER_PLACED',
    recipient: `88${newOrder.customerPhone}`,
    message: `Thank you ${newOrder.customerName}! We received your order #${newOrder.orderNumber} for BDT ${newOrder.totalAmount.toLocaleString('en-IN')}. Payment: ${newOrder.paymentMethod}. - Deshi Commerce`,
  });

  addNotificationLog({
    orderId: newOrder.id,
    orderNumber: newOrder.orderNumber,
    channel: 'EMAIL',
    event: 'ORDER_PLACED',
    recipient: newOrder.customerEmail || 'customer@example.com',
    subject: `Order Confirmation #${newOrder.orderNumber} - Deshi Commerce`,
    message: `Dear ${newOrder.customerName}, We are processing order #${newOrder.orderNumber}. Total: ৳ ${newOrder.totalAmount.toLocaleString('en-IN')} with shipping to ${address.district}.`,
  });

  // Clear cart on successful order
  clearCart();

  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderStatus): Order {
  const all = getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const idx = all.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
  
  let targetOrder: Order;
  if (idx === -1) {
    targetOrder = {
      id: orderId,
      orderNumber: orderId.startsWith('ord_') ? `BD-${orderId.substring(4, 12).toUpperCase()}` : orderId,
      userId: 'usr_customer',
      customerName: 'Customer',
      customerPhone: '01700000000',
      shippingAddress: {
        id: 'addr_1',
        userId: 'usr_customer',
        fullName: 'Customer',
        phone: '01700000000',
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Dhaka',
        streetAddress: 'Dhaka',
        isDefault: true,
        type: 'HOME',
      },
      items: [],
      subtotal: 0,
      deliveryCharge: 0,
      totalAmount: 0,
      status,
      paymentMethod: 'COD',
      paymentStatus: status === 'DELIVERED' ? 'PAID' : 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.unshift(targetOrder);
  } else {
    targetOrder = all[idx];
    targetOrder.status = status;
    targetOrder.updatedAt = new Date().toISOString();
    if (status === 'DELIVERED') {
      targetOrder.paymentStatus = 'PAID';
    }
  }
  setItem(STORAGE_KEYS.ORDERS, all);

  // Trigger audit notifications on status transitions
  if (status === 'CONFIRMED') {
    addNotificationLog({
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      channel: 'SMS',
      event: 'ORDER_CONFIRMED',
      recipient: `88${targetOrder.customerPhone}`,
      message: `Dear ${targetOrder.customerName}, your order #${targetOrder.orderNumber} has been CONFIRMED by Deshi Commerce operations.`,
    });
  } else if (status === 'DELIVERED') {
    addNotificationLog({
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      channel: 'SMS',
      event: 'ORDER_DELIVERED',
      recipient: `88${targetOrder.customerPhone}`,
      message: `Dear ${targetOrder.customerName}, parcel #${targetOrder.orderNumber} has been DELIVERED. Thank you for shopping with Deshi Commerce!`,
    });
  }

  return targetOrder;
}

export function updateOrderTracking(
  orderId: string,
  courierData: {
    courierName: string;
    trackingNumber: string;
    trackingUrl?: string;
    estimatedDeliveryDate?: string;
    advanceToShipped?: boolean;
  }
): Order {
  const all = getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const idx = all.findIndex((o) => o.id === orderId || o.orderNumber === orderId);

  const defaultUrl =
    courierData.courierName === 'Steadfast Courier'
      ? `https://steadfast.com.bd/tracking/${courierData.trackingNumber}`
      : courierData.courierName === 'Pathao'
      ? `https://pathao.com/courier/tracking/${courierData.trackingNumber}`
      : `https://tracking.deshicommerce.com.bd/${courierData.trackingNumber}`;

  let targetOrder: Order;
  if (idx === -1) {
    targetOrder = {
      id: orderId,
      orderNumber: orderId.startsWith('ord_') ? `BD-${orderId.substring(4, 12).toUpperCase()}` : orderId,
      userId: 'usr_customer',
      customerName: 'Customer',
      customerPhone: '01700000000',
      shippingAddress: {
        id: 'addr_1',
        userId: 'usr_customer',
        fullName: 'Customer',
        phone: '01700000000',
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Dhaka',
        streetAddress: 'Dhaka',
        isDefault: true,
        type: 'HOME',
      },
      items: [],
      subtotal: 0,
      deliveryCharge: 0,
      totalAmount: 0,
      status: courierData.advanceToShipped ? 'SHIPPED' : 'CONFIRMED',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.unshift(targetOrder);
  } else {
    targetOrder = all[idx];
  }

  targetOrder.courier = {
    courierName: courierData.courierName,
    trackingNumber: courierData.trackingNumber,
    trackingUrl: courierData.trackingUrl || defaultUrl,
    estimatedDeliveryDate: courierData.estimatedDeliveryDate || '3-4 Business Days',
    shippedAt: new Date().toISOString(),
    lastLocation: 'Tejgaon Central Sorting Hub, Dhaka',
    statusNotes: 'Dispatched with courier partner. In-transit to local delivery station.',
  };

  if (courierData.advanceToShipped) {
    targetOrder.status = 'SHIPPED';
  }
  targetOrder.updatedAt = new Date().toISOString();
  setItem(STORAGE_KEYS.ORDERS, all);

  // Trigger dispatch SMS
  addNotificationLog({
    orderId: targetOrder.id,
    orderNumber: targetOrder.orderNumber,
    channel: 'SMS',
    event: 'ORDER_SHIPPED',
    recipient: `88${targetOrder.customerPhone}`,
    message: `Dear ${targetOrder.customerName}, your order #${targetOrder.orderNumber} has been SHIPPED via ${courierData.courierName} (${courierData.trackingNumber}). Track: ${targetOrder.courier?.trackingUrl || courierData.trackingUrl || 'N/A'}`,
  });

  return targetOrder;
}

export function cancelOrder(orderId: string, reason: string): Order {
  const all = getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const idx = all.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
  if (idx === -1) throw new Error('Order not found');

  all[idx].status = 'CANCELLED';
  all[idx].cancelReason = reason;
  all[idx].updatedAt = new Date().toISOString();
  setItem(STORAGE_KEYS.ORDERS, all);

  addNotificationLog({
    orderId: all[idx].id,
    orderNumber: all[idx].orderNumber,
    channel: 'SMS',
    event: 'ORDER_CANCELLED',
    recipient: `88${all[idx].customerPhone}`,
    message: `Notice: Order #${all[idx].orderNumber} has been CANCELLED. Reason: ${reason}. If paid online, refund will be credited within 72 hrs.`,
  });

  return all[idx];
}

// Payment SSLCommerz Simulation
export function simulateSSLCommerzSuccess(orderId: string): Order {
  const all = getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const idx = all.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
  if (idx === -1) throw new Error('Order not found');

  all[idx].paymentStatus = 'PAID';
  all[idx].status = 'CONFIRMED';
  all[idx].paymentTxnId = `SSLCZ_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  all[idx].updatedAt = new Date().toISOString();
  setItem(STORAGE_KEYS.ORDERS, all);

  addNotificationLog({
    orderId: all[idx].id,
    orderNumber: all[idx].orderNumber,
    channel: 'SMS',
    event: 'PAYMENT_RECEIVED',
    recipient: `88${all[idx].customerPhone}`,
    message: `Payment of BDT ${all[idx].totalAmount.toLocaleString('en-IN')} confirmed via SSLCommerz (Txn: ${all[idx].paymentTxnId}) for order #${all[idx].orderNumber}.`,
  });

  return all[idx];
}

// Notifications
export function getNotificationLogs(orderId?: string): NotificationLog[] {
  const list = getItem<NotificationLog[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  if (orderId) {
    return list.filter((n) => n.orderId === orderId || n.orderNumber === orderId);
  }
  return list;
}

export function addNotificationLog(log: Omit<NotificationLog, 'id' | 'timestamp' | 'status'>): NotificationLog {
  const list = getItem<NotificationLog[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;

  const entry: NotificationLog = {
    id: `notif_${Date.now()}`,
    timestamp,
    status: 'SENT',
    ...log,
  };

  list.unshift(entry);
  setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  return entry;
}

// Admin Summary
export function getAdminDashboardSummary(): AdminDashboardSummary {
  const orders = getItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const products = getProducts();

  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'PROCESSING').length;
  const lowStockProducts = products.filter((p) => p.stock <= 5).length;
  const fulfilledOrders = orders.filter((o) => o.status === 'DELIVERED').length;
  const ordersFulfilledRate = totalOrders > 0 ? Math.round((fulfilledOrders / totalOrders) * 100) : 0;

  const statusBreakdown: Record<OrderStatus, number> = {
    PENDING: 0,
    CONFIRMED: 0,
    PROCESSING: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };

  orders.forEach((o) => {
    if (statusBreakdown[o.status] !== undefined) {
      statusBreakdown[o.status]++;
    }
  });

  return {
    totalRevenue: totalRevenue || 1482900,
    totalOrders,
    pendingOrders,
    lowStockProducts,
    monthlyGrowthRate: 18.4,
    ordersFulfilledRate,
    recentOrders: orders.slice(0, 8),
    revenueByMonth: [
      { month: 'Apr', amount: 820000 },
      { month: 'May', amount: 960000 },
      { month: 'Jun', amount: 1120000 },
      { month: 'Jul', amount: 1250000 },
      { month: 'Aug', amount: 1390000 },
      { month: 'Sep', amount: 1482900 },
    ],
    statusBreakdown,
  };
}

// Customer 360
export function getCustomer360Profile(userId: string): Customer360Profile {
  const users = getUsers();
  const user = users.find((u) => u.id === userId) || users[0];
  const orders = getOrders(undefined, undefined, user.id);

  const completed = orders.filter((o) => o.status === 'DELIVERED');
  const cancelled = orders.filter((o) => o.status === 'CANCELLED');
  const spent = completed.reduce((sum, o) => sum + o.totalAmount, 0);
  const returnRate = orders.length > 0 ? Math.round((cancelled.length / orders.length) * 100) : 0;

  let riskScore: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (returnRate > 30) riskScore = 'HIGH';
  else if (returnRate > 10) riskScore = 'MEDIUM';

  return {
    userId: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    lifetimeSpent: spent || 84998,
    completedOrdersCount: completed.length,
    totalOrdersCount: orders.length,
    returnRate,
    riskScore,
    verifiedPhone: true,
    orders,
  };
}

// Hero Showcase Management
export interface HeroShowcaseItem {
  id: string;
  title: string;
  slug: string;
  store: string;
  price: number;
  image: string;
}

export const INITIAL_HERO_SHOWCASE: HeroShowcaseItem[] = [
  {
    id: 'hero_1',
    title: 'Aarong Festive Embroidered Panjabi',
    slug: 'aarong-festive-panjabi',
    store: 'Feminine & Heritage Store',
    price: 3999,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'hero_2',
    title: 'Samsung Galaxy A55 5G (8GB/128GB)',
    slug: 'samsung-galaxy-a55-5g',
    store: 'Official Samsung Flagship',
    price: 41999,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'hero_3',
    title: 'Authentic Handloom Dhakai Jamdani Saree',
    slug: 'dhakai-jamdani-saree',
    store: 'Demra Heritage Weavers',
    price: 8200,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  },
];

export function getHeroShowcase(): HeroShowcaseItem[] {
  return getItem<HeroShowcaseItem[]>(STORAGE_KEYS.HERO_SHOWCASE, INITIAL_HERO_SHOWCASE);
}

export function saveHeroShowcase(items: HeroShowcaseItem[]): HeroShowcaseItem[] {
  setItem(STORAGE_KEYS.HERO_SHOWCASE, items);
  return items;
}

// =========================================================================
// FAQ Storage Management
// =========================================================================
export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq_1',
    category: 'delivery',
    question: 'How does Cash on Delivery (COD) work across Bangladesh?',
    questionBn: 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (COD) কীভাবে কাজ করে?',
    answer:
      'You can place your order without any advance payment. Our logistics partner (Steadfast Courier or Pathao) delivers the parcel directly to your doorstep in all 64 districts. You pay cash to the courier representative only after receiving your package and an official SMS delivery receipt.',
    answerBn:
      'কোনো অগ্রিম পেমেন্ট ছাড়াই অর্ডার করতে পারেন। আমাদের কুরিয়ার পার্টনার (স্টিডফাস্ট বা পাঠাও) দেশের ৬৪টি জেলার যে কোনো প্রান্তে আপনার ঠিকানায় পার্সেল পৌঁছে দেবে। পার্সেল বুঝে পেয়ে ডেলিভারিম্যানের কাছে মূল্য পরিশোধ করবেন।',
    order: 1,
  },
  {
    id: 'faq_2',
    category: 'delivery',
    question: 'What are the delivery fees for inside Dhaka vs outside Dhaka?',
    questionBn: 'ঢাকার ভেতর ও ঢাকার বাইরের ডেলিভারি চার্জ কত?',
    answer:
      'Delivery charges are automated by delivery address: Inside Dhaka is ৳60 (24-48 hours delivery), and Outside Dhaka is ৳120 (3-5 business days). Any order with a subtotal of ৳5,000 or greater qualifies for 100% FREE delivery nationwide!',
    answerBn:
      'ঠিকানার ওপর ভিত্তি করে ডেলিভারি চার্জ স্বয়ংক্রিয়ভাবে নির্ধারিত হয়: ঢাকার ভেতরে ৳৬০ (২৪-৪৮ ঘণ্টা) এবং ঢাকার বাইরে ৳১২০ (৩-৫ দিন)। ৳৫,০০০ টাকার বেশি পণ্য কিনলে সারা বাংলাদেশে সম্পূর্ণ ফ্রি ডেলিভারি!',
    order: 2,
  },
  {
    id: 'faq_3',
    category: 'payment',
    question: 'Which online payment methods are supported through SSLCommerz?',
    questionBn: 'এসএসএল কমার্জের মাধ্যমে কী কী মাধ্যমে পেমেন্ট করা যায়?',
    answer:
      'We support instant digital payment via bKash, Nagad, Rocket, Upay, Visa, Mastercard, American Express, and internet banking (City Touch, CellFin, EBL Skybanking). All transactions are encrypted with 256-bit bank-level escrow security.',
    answerBn:
      'বিকাশ, নগদ, রকেট, ভিসা, মাস্টারকার্ড, অ্যামেক্স এবং সকল ব্যাংকের কার্ড বা ইন্টারনেট ব্যাংকিং-এর মাধ্যমে নিরাপদে পেমেন্ট করা যায়।',
    order: 3,
  },
  {
    id: 'faq_4',
    category: 'returns',
    question: 'What is the 7-Day Replacement & Return Guarantee?',
    questionBn: '৭ দিনের রিপ্লেসমেন্ট এবং রিটার্ন পলিসি কীভাবে কাজ করে?',
    answer:
      'If your received product has any physical defect, manufacturing fault, or does not match specifications, contact our hotline within 7 calendar days. Our courier partner will pick up the item from your location at zero return charge and deliver a replacement or full refund.',
    answerBn:
      'পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে কোনো ত্রুটি দেখা দিলে আমাদের হটলাইনে যোগাযোগ করুন। আমাদের কুরিয়ার আপনার বাসা থেকে পণ্য তুলে নেবে এবং নতুন পণ্য পাঠানো হবে।',
    order: 4,
  },
  {
    id: 'faq_5',
    category: 'delivery',
    question: 'How do I track my order live on the Steadfast portal?',
    questionBn: 'স্টিডফাস্ট পোর্টালে অর্ডার কীভাবে ট্র্যাক করব?',
    answer:
      'Once your order is packaged and dispatched from our Dhaka fulfillment center, you will receive an automated SMS containing your consignment number (e.g. ST-889900) and live tracking URL. You can also view live hub-by-hub tracking updates directly on our Track Order page.',
    answerBn:
      'পার্সেল প্রেরণের সাথে সাথে আপনার মোবাইলে ট্র্যাকিং নম্বর সহ এসএমএস চলে যাবে। লিংকে ক্লিক করে রিয়েল-টাইমে কুরিয়ার লোকেশন দেখতে পারবেন।',
    order: 5,
  },
  {
    id: 'faq_6',
    category: 'warranty',
    question: 'Are mobile phones and electronics covered by official Bangladesh warranty?',
    questionBn: 'স্মার্টফোন এবং গ্যাজেট কি অফিসিয়াল ওয়ারেন্টিযুক্ত?',
    answer:
      'Yes, 100%. All smartphones, laptops, and home appliances are BTRC approved and backed by verified manufacturer warranties (Samsung Bangladesh, Walton BD, Xiaomi Official, Sony BD). Warranty cards are stamped and verified prior to shipping.',
    answerBn:
      'হ্যাঁ, শতভাগ। সকল মোবাইল ও গ্যাজেট বিটিআরসি অনুমোদিত এবং ব্র্যান্ডের অফিসিয়াল ওয়ারেন্টি কার্ড সহ সরবরাহ করা হয়।',
    order: 6,
  },
];

export function getFaqs(): FAQItem[] {
  return getItem<FAQItem[]>(STORAGE_KEYS.FAQS, INITIAL_FAQS);
}

export function saveFaqs(items: FAQItem[]): FAQItem[] {
  setItem(STORAGE_KEYS.FAQS, items);
  return items;
}

export function saveFaq(faq: Partial<FAQItem>): FAQItem {
  const list = getFaqs();
  if (faq.id) {
    const idx = list.findIndex((f) => f.id === faq.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...faq } as FAQItem;
      setItem(STORAGE_KEYS.FAQS, list);
      return list[idx];
    }
  }
  const newFaq: FAQItem = {
    id: `faq_${Date.now()}`,
    question: faq.question || '',
    questionBn: faq.questionBn || '',
    answer: faq.answer || '',
    answerBn: faq.answerBn || '',
    category: faq.category || 'general',
    order: list.length + 1,
  };
  list.push(newFaq);
  setItem(STORAGE_KEYS.FAQS, list);
  return newFaq;
}

export function deleteFaq(id: string): boolean {
  const list = getFaqs();
  const updated = list.filter((f) => f.id !== id);
  setItem(STORAGE_KEYS.FAQS, updated);
  return true;
}

// Flash Sale Campaign Management
export const INITIAL_FLASH_SALE: FlashSaleCampaign = {
  enabled: true,
  title: 'Flash Sale',
  badge: 'LIMITED TIME · UP TO 30% OFF',
  discountPercentage: 30,
  endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
  durationDays: 3,
  description: 'Curated picks at all-time-low prices. Stock updates continuously — once sold out, deals expire immediately.',
  productIds: [],
  includeMatchingDiscount: true,
  updatedAt: new Date().toISOString(),
};

export function getFlashSaleCampaign(): FlashSaleCampaign {
  return getItem<FlashSaleCampaign>(STORAGE_KEYS.FLASH_SALE, INITIAL_FLASH_SALE);
}

export function saveFlashSaleCampaign(campaign: FlashSaleCampaign): FlashSaleCampaign {
  const updated: FlashSaleCampaign = {
    ...campaign,
    updatedAt: new Date().toISOString(),
  };
  setItem(STORAGE_KEYS.FLASH_SALE, updated);
  return updated;
}

export function applyFlashDiscountToProducts(productIds: string[], discountPercentage: number): Product[] {
  const products = getProducts();
  const updated = products.map((p) => {
    if (productIds.includes(p.id)) {
      const discountPrice = Math.round(p.price * (1 - discountPercentage / 100));
      return {
        ...p,
        discountPrice,
        isFlashDeal: true,
        flashDealDiscount: discountPercentage,
      };
    }
    return p;
  });
  setItem(STORAGE_KEYS.PRODUCTS, updated);
  return updated;
}



