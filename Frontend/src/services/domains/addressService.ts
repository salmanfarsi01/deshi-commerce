import { apiClient, ApiResponse, wrapSuccess, simulateDelay } from '../baseClient';
import { getAddresses, saveAddress, deleteAddress } from '../dbStorage';
import { mapBackendAddressToFrontendAddress } from '../mappers/dtoMappers';
import { Address } from '../../types';

export const addressService = {
  getAll: async (): Promise<ApiResponse<Address[]>> => {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>('/addresses');
      if (res.data?.data && Array.isArray(res.data.data)) {
        const mapped = res.data.data.map(mapBackendAddressToFrontendAddress);
        return wrapSuccess(mapped);
      }
    } catch {
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
    } catch {
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
};
