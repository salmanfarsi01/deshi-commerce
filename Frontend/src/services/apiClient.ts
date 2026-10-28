import { initDatabase } from './dbStorage';
import {
  apiClient,
  API_BASE_URL,
  safeLocalStorage,
  normalizeCategoryId,
  ensureAdminToken,
  checkBackendConnection,
  ApiResponse,
  wrapSuccess,
  simulateDelay,
} from './baseClient';
import {
  mapBackendProductToFrontend,
  mapBackendCartToFrontendCart,
  mapBackendAddressToFrontendAddress,
  mapBackendOrderToFrontendOrder,
  mapBackendNotification,
} from './mappers/dtoMappers';
import { categoryService } from './domains/categoryService';
import { productService } from './domains/productService';
import { cartService } from './domains/cartService';
import { addressService } from './domains/addressService';
import { orderService } from './domains/orderService';
import { paymentService } from './domains/paymentService';
import { authService } from './domains/authService';
import { adminService } from './domains/adminService';
import {
  heroService,
  faqService,
  flashSaleService,
  specialOffersService,
} from './domains/marketingService';
import {
  notificationService,
  supportTicketService,
  chatService,
} from './domains/supportService';

// Initialize localStorage on module load
initDatabase();

// Re-export core base client and utilities
export {
  apiClient,
  API_BASE_URL,
  safeLocalStorage,
  normalizeCategoryId,
  ensureAdminToken,
  checkBackendConnection,
  wrapSuccess,
  simulateDelay,
};
export type { ApiResponse };

// Re-export DTO mappers
export {
  mapBackendProductToFrontend,
  mapBackendCartToFrontendCart,
  mapBackendAddressToFrontendAddress,
  mapBackendOrderToFrontendOrder,
  mapBackendNotification,
};

// Re-export individual domain services
export {
  categoryService,
  productService,
  cartService,
  addressService,
  orderService,
  paymentService,
  authService,
  adminService,
  heroService,
  faqService,
  flashSaleService,
  specialOffersService,
  notificationService,
  supportTicketService,
  chatService,
};

// Unified apiService object matching existing frontend caller contracts
export const apiService = {
  categories: categoryService,
  products: productService,
  cart: cartService,
  addresses: addressService,
  orders: orderService,
  sslcommerz: paymentService,
  auth: authService,
  notifications: notificationService,
  admin: adminService,
  hero: heroService,
  faq: faqService,
  flashSale: flashSaleService,
  specialOffers: specialOffersService,
  support: supportTicketService,
  chat: chatService,
};
