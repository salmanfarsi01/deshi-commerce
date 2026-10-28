import { getProducts } from '../dbStorage';
import {
  Product,
  Cart,
  CartItem,
  Address,
  Order,
  OrderItem,
  CourierInfo,
  NotificationLog,
} from '../../types';

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
    buyingPrice: p.buyingPrice !== undefined && p.buyingPrice !== null ? Number(p.buyingPrice) : undefined,
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
