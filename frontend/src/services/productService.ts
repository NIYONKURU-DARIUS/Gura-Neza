import api from './api';

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  likesCount: number;
  rating: number;
  totalReviews: number;
  isFeatured: boolean;
  stock: number;
  likedByCurrentUser: boolean;
}

export interface PageResponse<T> {
  content: T[];
  number: number;       // current page (0-based)
  size: number;
  totalElements: number;
  totalPages: number;
}

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  getPagedProducts: async (
    page: number,
    size: number,
    sort: string,
    direction: string,
    category?: string,
    search?: string
  ): Promise<PageResponse<Product>> => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      sort,
      direction,
    });
    if (category && category !== 'ALL') params.set('category', category);
    if (search && search.trim()) params.set('search', search.trim());
    const response = await api.get(`/products/paged?${params.toString()}`);
    return response.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  searchProducts: async (name: string): Promise<Product[]> => {
    const response = await api.get(`/products/search?name=${encodeURIComponent(name)}`);
    return response.data;
  },

  likeProduct: async (id: number): Promise<Product> => {
    const response = await api.post(`/products/${id}/like`);
    return response.data;
  },

  rateProduct: async (id: number, rating: number): Promise<Product> => {
    const response = await api.post(`/products/${id}/rate`, { rating });
    return response.data;
  },

  canRate: async (id: number): Promise<boolean> => {
    const response = await api.get(`/products/${id}/can-rate`);
    return response.data;
  },

  createProduct: async (productData: any): Promise<Product> => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id: number, productData: any): Promise<Product> => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
