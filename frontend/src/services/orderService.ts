import api from './api';

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'WALLET' | 'PAY_LATER';

export interface OrderResponse {
  id: number;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
  items: OrderItemResponse[];
  paymentMethod: PaymentMethod;
  userName?: string;
  userEmail?: string;
}

export const orderService = {
  checkout: async (paymentMethod: PaymentMethod = 'WALLET'): Promise<OrderResponse> => {
    const response = await api.post('/orders/checkout', { paymentMethod });
    return response.data;
  },

  getOrders: async (): Promise<OrderResponse[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrderById: async (id: number): Promise<OrderResponse> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Admin endpoints
  getAllOrders: async (): Promise<OrderResponse[]> => {
    const response = await api.get('/orders/admin/all');
    return response.data;
  },

  confirmOrder: async (id: number): Promise<OrderResponse> => {
    const response = await api.put(`/orders/${id}/confirm`);
    return response.data;
  },

  deliverOrder: async (id: number): Promise<OrderResponse> => {
    const response = await api.put(`/orders/${id}/deliver`);
    return response.data;
  },

  cancelOrder: async (id: number): Promise<OrderResponse> => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },
};
