import api from './api';

export interface CartItemResponse {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  category: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  id: number;
  items: CartItemResponse[];
  totalPrice: number;
}

export const cartService = {
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async (productId: number, quantity: number = 1): Promise<CartResponse> => {
    const response = await api.post('/cart/add', { productId, quantity });
    return response.data;
  },

  updateItem: async (itemId: number, quantity: number): Promise<CartResponse> => {
    const response = await api.put(`/cart/update/${itemId}?quantity=${quantity}`);
    return response.data;
  },

  removeItem: async (itemId: number): Promise<CartResponse> => {
    const response = await api.delete(`/cart/remove/${itemId}`);
    return response.data;
  },

  clearCart: async (): Promise<CartResponse> => {
    const response = await api.delete('/cart/clear');
    return response.data;
  }
};
