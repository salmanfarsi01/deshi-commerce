export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatarUrl?: string;
  authProvider?: 'phone' | 'email' | 'google';
  googleId?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  streetAddress: string;
  isDefault: boolean;
  type?: 'HOME' | 'OFFICE';
}

export interface Category {
  id: string;
  name: string;
  nameBn?: string;
  slug: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  active: boolean;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  nameBn?: string;
  slug: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number;
  discountPrice?: number;
  buyingPrice?: number;
  stock: number;
  sku: string;
  images: string[];
  specs: Record<string, string>;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  flashDealDiscount?: number;
  tags?: string[];
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  freeDeliveryThreshold: number;
  eligibleForFreeDelivery: boolean;
  amountNeededForFreeDelivery: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'COD' | 'SSLCOMMERZ' | 'BKASH' | 'NAGAD';

export type PaymentStatus = 'PENDING' | 'INITIATED' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface CourierInfo {
  courierName: string; // 'Steadfast Courier' | 'Pathao' | 'Paperfly' | 'RedX' | 'In-House Dispatch'
  trackingNumber: string;
  trackingUrl: string;
  estimatedDeliveryDate?: string;
  shippedAt?: string;
  lastLocation?: string;
  statusNotes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. BD-73029654
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTxnId?: string;
  courier?: CourierInfo;
  customerNote?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockProducts: number;
  monthlyGrowthRate: number;
  ordersFulfilledRate: number;
  recentOrders: Order[];
  revenueByMonth: { month: string; amount: number }[];
  statusBreakdown: Record<OrderStatus, number>;
}

export interface NotificationLog {
  id: string;
  orderId?: string;
  orderNumber?: string;
  userId?: string;
  timestamp: string;
  channel: 'SMS' | 'EMAIL';
  event: 'ORDER_PLACED' | 'ORDER_CONFIRMED' | 'ORDER_SHIPPED' | 'PAYMENT_RECEIVED' | 'ORDER_DELIVERED' | 'ORDER_CANCELLED';
  recipient: string;
  subject?: string;
  message: string;
  status: 'SENT' | 'SIMULATED' | 'DELIVERED';
  gatewayResponse?: string;
}

export interface Customer360Profile {
  userId: string;
  name: string;
  phone: string;
  email: string;
  lifetimeSpent: number;
  completedOrdersCount: number;
  totalOrdersCount: number;
  returnRate: number;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  verifiedPhone: boolean;
  orders: Order[];
}

export interface BangladeshDivision {
  name: string;
  districts: string[];
}

export type TimeframeSlicer = 'day' | 'week' | 'month' | 'year';

export interface TrendDataPoint {
  label: string;
  subLabel?: string;
  revenue: number;
  orders: number;
  units: number;
}

export interface DonutSlice {
  label: string;
  value: number;
  percentage: number;
  color: string;
  formattedValue?: string;
}

export interface HeroShowcaseItem {
  id: string;
  title: string;
  slug: string;
  store: string;
  price: number;
  image: string;
}

export interface FAQItem {
  id: string;
  question: string;
  questionBn?: string;
  answer: string;
  answerBn?: string;
  category: 'delivery' | 'payment' | 'returns' | 'warranty' | 'general';
  order?: number;
}

export interface FlashSaleCampaign {
  enabled: boolean;
  title: string;
  badge: string; // e.g. "LIMITED TIME · UP TO 30% OFF"
  discountPercentage: number; // e.g. 30
  endDate: string; // ISO string e.g. 3 days from now
  description: string;
  productIds: string[]; // specific products included in flash sale
  includeMatchingDiscount: boolean; // whether products uploaded with matching discount % are included
  durationDays?: number;
  updatedAt?: string;
}

export type OfferType = 'BOGO' | 'BUY_2_GET_1' | 'BUY_3_GET_1' | 'COMBO_DEAL' | 'CUSTOM';
export type BannerFormat = 'CARD' | 'FULL_BANNER';

export interface SpecialOfferItem {
  id: string;
  bannerFormat?: BannerFormat; // 'CARD' (BOGO/Deal Card) or 'FULL_BANNER' (Canva / uploaded whole banner)
  title: string;
  subtitle?: string;
  offerType: OfferType;
  badgeText: string; // e.g. "BUY 1 GET 1 FREE", "CANVA SPECIAL", "EID MEGA SALE"
  tagline?: string;
  productId?: string;
  productSlug?: string;
  categorySlug?: string;
  linkUrl?: string; // Optional custom redirect URL or route
  originalPrice: number;
  offerPrice: number;
  image: string; // Product photo for CARD; Full graphic banner image for FULL_BANNER
  active: boolean;
  description?: string;
  colorScheme?: 'rose' | 'amber' | 'emerald' | 'indigo' | 'purple';
  createdAt?: string;
}

export interface SpecialOffersCampaign {
  enabled: boolean;
  sectionTitle: string;
  sectionSubtitle?: string;
  items: SpecialOfferItem[];
  autoSlide?: boolean;
  autoSlideIntervalSeconds?: number;
  updatedAt?: string;
}




