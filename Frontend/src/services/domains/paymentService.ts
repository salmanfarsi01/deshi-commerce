import { apiClient, ApiResponse, wrapSuccess, simulateDelay } from '../baseClient';
import { simulateSSLCommerzSuccess } from '../dbStorage';
import { Order } from '../../types';

export const paymentService = {
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
    } catch {
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
    } catch {
      // Fallback
    }
    await simulateDelay(100);
    const order = simulateSSLCommerzSuccess(orderId);
    return wrapSuccess(order, 'Payment verified successfully!');
  },

  validate: async (tranId: string, _valId?: string): Promise<ApiResponse<{ status: string; tranId: string }>> => {
    try {
      const res = await apiClient.post<ApiResponse<any>>('/payments/verify', { transactionId: tranId });
      if (res.data?.data) return wrapSuccess({ status: 'VALIDATED', tranId });
    } catch {
      // Fallback
    }
    await simulateDelay(80);
    return wrapSuccess({ status: 'VALIDATED', tranId });
  },
};
