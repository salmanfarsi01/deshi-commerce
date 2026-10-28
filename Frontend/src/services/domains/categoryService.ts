import { apiClient, ApiResponse, wrapSuccess, simulateDelay } from '../baseClient';
import { getCategories, saveCategory, deleteCategory } from '../dbStorage';
import { Category } from '../../types';

export const categoryService = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>('/categories');
      if (res.data?.data && Array.isArray(res.data.data)) {
        const mapped: Category[] = res.data.data.map((c) => ({
          id: c.id,
          name: c.name,
          nameBn: c.nameBn || c.name,
          slug: c.slug,
          description: c.description || '',
          active: c.active ?? true,
          productCount: Number(c.productCount || 0),
        }));
        return wrapSuccess(mapped);
      }
    } catch {
      // Fallback to local storage
    }
    await simulateDelay();
    const list = getCategories();
    return wrapSuccess(list);
  },

  create: async (payload: Partial<Category>): Promise<ApiResponse<Category>> => {
    try {
      const reqBody = {
        name: payload.name || 'Category',
        slug:
          payload.slug ||
          (payload.name ? payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `cat-${Date.now()}`),
        description: payload.description || '',
      };
      const res = await apiClient.post<ApiResponse<any>>('/admin/categories', reqBody);
      if (res.data?.data) {
        const created: Category = {
          id: res.data.data.id,
          name: res.data.data.name,
          slug: res.data.data.slug,
          description: res.data.data.description || '',
          active: res.data.data.active ?? true,
          productCount: 0,
        };
        saveCategory(created);
        return wrapSuccess(created, 'Category created successfully');
      }
    } catch (err: any) {
      console.warn('Backend create category failed, saving locally:', err?.response?.data || err?.message);
    }
    await simulateDelay();
    const created = saveCategory(payload);
    return wrapSuccess(created, 'Category created successfully');
  },

  update: async (id: string, payload: Partial<Category>): Promise<ApiResponse<Category>> => {
    try {
      const reqBody = {
        name: payload.name || 'Category',
        description: payload.description || '',
        active: payload.active ?? true,
      };
      const res = await apiClient.put<ApiResponse<any>>(`/admin/categories/${id}`, reqBody);
      if (res.data?.data) {
        const updated: Category = {
          id: res.data.data.id,
          name: res.data.data.name,
          slug: res.data.data.slug,
          description: res.data.data.description || '',
          active: res.data.data.active ?? true,
        };
        saveCategory(updated);
        return wrapSuccess(updated, 'Category updated successfully');
      }
    } catch (err: any) {
      console.warn('Backend update category failed, saving locally:', err?.response?.data || err?.message);
    }
    await simulateDelay();
    const updated = saveCategory({ ...payload, id });
    return wrapSuccess(updated, 'Category updated successfully');
  },

  delete: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    try {
      const res = await apiClient.delete<ApiResponse<void>>(`/admin/categories/${id}`);
      if (res.data) {
        deleteCategory(id);
        return wrapSuccess({ id }, 'Category deleted successfully');
      }
    } catch (err: any) {
      console.warn('Backend delete category failed, removing locally:', err?.response?.data || err?.message);
    }
    await simulateDelay();
    deleteCategory(id);
    return wrapSuccess({ id }, 'Category deleted successfully');
  },
};
