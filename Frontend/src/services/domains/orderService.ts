import { apiClient, ApiResponse, wrapSuccess, simulateDelay } from '../baseClient';
import {
  getOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  getCurrentUser,
} from '../dbStorage';
import { mapBackendOrderToFrontendOrder } from '../mappers/dtoMappers';
import { Order } from '../../types';

export const orderService = {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
};
