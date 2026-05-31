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

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  searchProducts: async (name: string): Promise<Product[]> => {
    const response = await api.get(`/products/search?name=${name}`);
    return response.data;
  },

  likeProduct: async (id: number): Promise<Product> => {
    const response = await api.post(`/products/${id}/like`);
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
  }
};
