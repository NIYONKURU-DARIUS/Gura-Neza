import api from './api';

export interface AdminStats {
  todayRevenue: number;
  pendingOrdersCount: number;
  totalUsersCount: number;
  supportQueueCount: number;
}

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  }
};
