import { ApiResponse, wrapSuccess, simulateDelay } from '../baseClient';
import {
  getHeroShowcase,
  saveHeroShowcase,
  HeroShowcaseItem,
  getFaqs,
  saveFaqs,
  saveFaq,
  deleteFaq,
  getFlashSaleCampaign,
  saveFlashSaleCampaign,
  applyFlashDiscountToProducts,
  getSpecialOffersCampaign,
  saveSpecialOffersCampaign,
  saveSpecialOfferItem,
  deleteSpecialOfferItem,
  toggleSpecialOfferItem,
} from '../dbStorage';
import { FAQItem, FlashSaleCampaign, SpecialOfferItem, SpecialOffersCampaign, Product } from '../../types';

export const heroService = {
  getShowcase: async (): Promise<ApiResponse<HeroShowcaseItem[]>> => {
    await simulateDelay(20);
    return wrapSuccess(getHeroShowcase());
  },
  updateShowcase: async (items: HeroShowcaseItem[]): Promise<ApiResponse<HeroShowcaseItem[]>> => {
    await simulateDelay(40);
    const saved = saveHeroShowcase(items);
    return wrapSuccess(saved, 'Hero showcase updated successfully');
  },
};

export const faqService = {
  getAll: async (): Promise<ApiResponse<FAQItem[]>> => {
    await simulateDelay(20);
    return wrapSuccess(getFaqs());
  },
  updateAll: async (items: FAQItem[]): Promise<ApiResponse<FAQItem[]>> => {
    await simulateDelay(40);
    const saved = saveFaqs(items);
    return wrapSuccess(saved, 'FAQs updated successfully');
  },
  save: async (item: Partial<FAQItem>): Promise<ApiResponse<FAQItem>> => {
    await simulateDelay(30);
    const saved = saveFaq(item);
    return wrapSuccess(saved, 'FAQ saved successfully');
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    await simulateDelay(30);
    deleteFaq(id);
    return wrapSuccess(undefined, 'FAQ deleted successfully');
  },
};

export const flashSaleService = {
  getCampaign: async (): Promise<ApiResponse<FlashSaleCampaign>> => {
    await simulateDelay(20);
    return wrapSuccess(getFlashSaleCampaign());
  },
  updateCampaign: async (campaign: FlashSaleCampaign): Promise<ApiResponse<FlashSaleCampaign>> => {
    await simulateDelay(40);
    const saved = saveFlashSaleCampaign(campaign);
    return wrapSuccess(saved, 'Flash Sale campaign updated successfully');
  },
  applyDiscount: async (productIds: string[], discountPercentage: number): Promise<ApiResponse<Product[]>> => {
    await simulateDelay(40);
    const updated = applyFlashDiscountToProducts(productIds, discountPercentage);
    return wrapSuccess(updated, `Applied ${discountPercentage}% discount to selected products`);
  },
};

export const specialOffersService = {
  getCampaign: async (): Promise<ApiResponse<SpecialOffersCampaign>> => {
    await simulateDelay(20);
    return wrapSuccess(getSpecialOffersCampaign());
  },
  updateCampaign: async (campaign: SpecialOffersCampaign): Promise<ApiResponse<SpecialOffersCampaign>> => {
    await simulateDelay(40);
    const saved = saveSpecialOffersCampaign(campaign);
    return wrapSuccess(saved, 'Special offers campaign updated successfully');
  },
  saveItem: async (item: Partial<SpecialOfferItem>): Promise<ApiResponse<SpecialOfferItem>> => {
    await simulateDelay(30);
    const saved = saveSpecialOfferItem(item);
    return wrapSuccess(saved, 'Special offer saved successfully');
  },
  deleteItem: async (id: string): Promise<ApiResponse<boolean>> => {
    await simulateDelay(30);
    deleteSpecialOfferItem(id);
    return wrapSuccess(true, 'Special offer removed successfully');
  },
  toggleItem: async (id: string): Promise<ApiResponse<boolean>> => {
    await simulateDelay(20);
    toggleSpecialOfferItem(id);
    return wrapSuccess(true, 'Special offer status updated');
  },
};
