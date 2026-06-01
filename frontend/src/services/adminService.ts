import api from './api';

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export interface ProductStat {
  name: string;
  likes: number;
  rating: number;
  stock: number;
}

export interface AdminStats {
  todayRevenue: number;
  totalRevenue: number;
  pendingOrdersCount: number;
  confirmedOrdersCount: number;
  deliveredOrdersCount: number;
  cancelledOrdersCount: number;
  totalOrdersCount: number;
  totalUsersCount: number;
  totalProductsCount: number;
  lowStockCount: number;
  supportQueueCount: number;
  revenueChart: DailyRevenue[];
  ordersByStatus: Record<string, number>;
  topProducts: ProductStat[];
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};
