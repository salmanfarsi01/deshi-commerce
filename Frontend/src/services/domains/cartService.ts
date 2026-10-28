import { apiClient, ApiResponse, wrapSuccess, simulateDelay } from '../baseClient';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from '../dbStorage';
import { mapBackendCartToFrontendCart } from '../mappers/dtoMappers';
import { Cart } from '../../types';

export const cartService = {
  get: async (): Promise<ApiResponse<Cart>> => {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/cart');
      if (res.data?.data) {
        return wrapSuccess(mapBackendCartToFrontendCart(res.data.data));
      }
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
      // Fallback
    }
    await simulateDelay(40);
    const updated = clearCart();
    return wrapSuccess(updated, 'Bag cleared');
  },
};
