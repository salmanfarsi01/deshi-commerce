import { apiClient, ApiResponse, wrapSuccess, simulateDelay, normalizeCategoryId } from '../baseClient';
import { getProducts, getProductBySlug, saveProduct, deleteProduct } from '../dbStorage';
import { mapBackendProductToFrontend } from '../mappers/dtoMappers';
import { Product } from '../../types';

export const productService = {
  getAll: async (params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    availability?: boolean;
    sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest' | 'popular';
    page?: number;
    size?: number;
  }): Promise<ApiResponse<{ products: Product[]; total: number; page: number; totalPages: number }>> => {
    try {
      const queryParams = { ...params };
      if (queryParams.category === 'all') delete queryParams.category;

      const res = await apiClient.get<ApiResponse<any>>('/products', { params: queryParams });
      if (res.data?.data) {
        const paged = res.data.data;
        const rawList = paged.items || paged.content || paged.products || [];
        const products = rawList.map(mapBackendProductToFrontend);
        const total = paged.totalItems ?? paged.totalElements ?? paged.total ?? products.length;
        const page = paged.page ?? paged.pageNumber ?? 0;
        const totalPages = paged.totalPages ?? Math.ceil(total / (params?.size || 20)) ?? 1;

        if (products.length > 0) {
          try {
            const currentLocal = getProducts();
            const merged = [...products];
            for (const loc of currentLocal) {
              if (!merged.some((m) => m.id === loc.id)) {
                merged.push(loc);
              }
            }
            localStorage.setItem('deshi_products_v1', JSON.stringify(merged));
          } catch {
            // Ignore local storage sync error
          }
        }

        return {
          success: true,
          message: res.data.message,
          data: { products, total, page, totalPages },
        };
      }
    } catch {
      // Fallback to local storage
    }

    await simulateDelay();
    let list = getProducts();

    if (params?.category && params.category !== 'all') {
      const cat = params.category.toLowerCase();
      list = list.filter(
        (p) => p.categoryId.toLowerCase().includes(cat) || p.categoryName.toLowerCase().includes(cat)
      );
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.nameBn && p.nameBn.includes(q))
      );
    }

    if (params?.minPrice !== undefined) {
      list = list.filter((p) => (p.discountPrice || p.price) >= params.minPrice!);
    }

    if (params?.maxPrice !== undefined) {
      list = list.filter((p) => (p.discountPrice || p.price) <= params.maxPrice!);
    }

    if (params?.availability) {
      list = list.filter((p) => p.isAvailable && p.stock > 0);
    }

    if (params?.sort) {
      switch (params.sort) {
        case 'price_asc':
          list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
          break;
        case 'price_desc':
          list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
          break;
        case 'rating_desc':
          list.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }
    }

    const page = params?.page || 0;
    const size = params?.size || 20;
    const start = page * size;
    const paginated = list.slice(start, start + size);

    return wrapSuccess({
      products: paginated,
      total: list.length,
      page,
      totalPages: Math.ceil(list.length / size) || 1,
    });
  },

  getBySlug: async (slug: string): Promise<ApiResponse<Product>> => {
    try {
      const res = await apiClient.get<ApiResponse<any>>(`/products/slug/${slug}`);
      if (res.data?.data) {
        return wrapSuccess(mapBackendProductToFrontend(res.data.data));
      }
    } catch {
      // Fallback
    }
    await simulateDelay();
    const p = getProductBySlug(slug);
    if (!p) throw new Error('Product not found');
    return wrapSuccess(p);
  },

  create: async (payload: Partial<Product>): Promise<ApiResponse<Product>> => {
    const normalizedCategoryId = normalizeCategoryId(payload.categoryId);
    try {
      const reqBody = {
        name: payload.name || 'New Product',
        brand: payload.brand || 'Deshi Commerce',
        slug:
          payload.slug ||
          (payload.name ? payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `prod-${Date.now()}`),
        description: payload.description || '',
        price: payload.price !== undefined ? Number(payload.price) : 100,
        discountPrice: payload.discountPrice !== undefined && payload.discountPrice !== null ? Number(payload.discountPrice) : undefined,
        buyingPrice: payload.buyingPrice !== undefined && payload.buyingPrice !== null ? Number(payload.buyingPrice) : undefined,
        stock: payload.stock !== undefined ? Number(payload.stock) : 10,
        categoryId: normalizedCategoryId,
        images: (payload.images || []).map((img: any) =>
          typeof img === 'string' ? { url: img, alt: payload.name || 'Product Image' } : img
        ),
      };
      const res = await apiClient.post<ApiResponse<any>>('/admin/products', reqBody);
      if (res.data?.data) {
        const mapped = mapBackendProductToFrontend(res.data.data);
        saveProduct(mapped);
        return wrapSuccess(mapped, 'Product added to catalog');
      }
    } catch (err: any) {
      console.warn('Backend create product failed, saving locally:', err?.response?.data || err?.message);
    }
    await simulateDelay();
    const created = saveProduct({ ...payload, categoryId: normalizedCategoryId });
    return wrapSuccess(created, 'Product added to catalog');
  },

  update: async (id: string, payload: Partial<Product>): Promise<ApiResponse<Product>> => {
    const existing = getProducts().find((p) => p.id === id);
    const normalizedCategoryId = normalizeCategoryId(payload.categoryId || existing?.categoryId);

    const reqBody = {
      name: payload.name || existing?.name || 'Product',
      brand: payload.brand || existing?.brand || 'Deshi Commerce',
      description: payload.description !== undefined ? payload.description : existing?.description || '',
      price: payload.price !== undefined ? Number(payload.price) : Number(existing?.price || 1),
      discountPrice: payload.discountPrice !== undefined && payload.discountPrice !== null
        ? Number(payload.discountPrice)
        : existing?.discountPrice !== undefined && existing?.discountPrice !== null
        ? Number(existing.discountPrice)
        : undefined,
      buyingPrice: payload.buyingPrice !== undefined && payload.buyingPrice !== null
        ? Number(payload.buyingPrice)
        : existing?.buyingPrice !== undefined && existing?.buyingPrice !== null
        ? Number(existing.buyingPrice)
        : undefined,
      stock: payload.stock !== undefined ? Number(payload.stock) : Number(existing?.stock || 0),
      categoryId: normalizedCategoryId,
      images: (payload.images || existing?.images || []).map((img: any) =>
        typeof img === 'string' ? { url: img, alt: payload.name || existing?.name || 'Image' } : img
      ),
      available: payload.isAvailable !== undefined ? payload.isAvailable : existing?.isAvailable ?? true,
    };

    try {
      const res = await apiClient.put<ApiResponse<any>>(`/admin/products/${id}`, reqBody);
      if (res.data?.data) {
        const mapped = mapBackendProductToFrontend(res.data.data);
        saveProduct(mapped);
        return wrapSuccess(mapped, 'Product updated successfully');
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        try {
          console.log(`Product ${id} not found in database, creating record in backend...`);
          const createRes = await apiClient.post<ApiResponse<any>>('/admin/products', {
            ...reqBody,
            slug: payload.slug || existing?.slug || (payload.name ? payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `prod-${Date.now()}`),
          });
          if (createRes.data?.data) {
            const mapped = mapBackendProductToFrontend(createRes.data.data);
            saveProduct(mapped);
            return wrapSuccess(mapped, 'Product updated and catalog synced');
          }
        } catch (createErr: any) {
          console.warn('Backend fallback creation failed:', createErr?.response?.data || createErr?.message);
        }
      } else {
        console.warn('Backend update product failed, saving locally:', err?.response?.data || err?.message);
      }
    }
    await simulateDelay();
    const updated = saveProduct({ ...existing, ...payload, id, categoryId: normalizedCategoryId });
    return wrapSuccess(updated, 'Product updated successfully');
  },

  delete: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    try {
      const res = await apiClient.delete<ApiResponse<void>>(`/admin/products/${id}`);
      if (res.data) {
        deleteProduct(id);
        return wrapSuccess({ id }, 'Product removed from catalog');
      }
    } catch (err: any) {
      console.warn('Backend delete product failed, removing locally:', err?.response?.data || err?.message);
    }
    await simulateDelay();
    deleteProduct(id);
    return wrapSuccess({ id }, 'Product removed from catalog');
  },
};
