import api from './api';

export interface TransactionResponse {
  id: number;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string | null;
  timestamp: string;
}

export interface WalletResponse {
  id: number;
  balance: number;
}

export interface TopUpRequestDto {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export const walletService = {
  getWallet: async (): Promise<WalletResponse> => {
    const response = await api.get('/wallet/');
    return response.data;
  },

  getTransactions: async (): Promise<TransactionResponse[]> => {
    const response = await api.get('/wallet/transactions');
    return response.data;
  },

  topUp: async (userId: number, amount: number): Promise<WalletResponse> => {
    const response = await api.post(`/wallet/topup/${userId}`, { amount });
    return response.data;
  },

  // User requests a top-up from admin
  requestTopUp: async (amount: number): Promise<TopUpRequestDto> => {
    const response = await api.post('/wallet/request-topup', { amount });
    return response.data;
  },

  // User views their own requests
  getMyRequests: async (): Promise<TopUpRequestDto[]> => {
    const response = await api.get('/wallet/my-requests');
    return response.data;
  },

  // Admin: get all requests
  getAllRequests: async (): Promise<TopUpRequestDto[]> => {
    const response = await api.get('/wallet/admin/requests');
    return response.data;
  },

  // Admin: approve a request
  approveRequest: async (id: number): Promise<TopUpRequestDto> => {
    const response = await api.put(`/wallet/admin/requests/${id}/approve`);
    return response.data;
  },

  // Admin: reject a request
  rejectRequest: async (id: number): Promise<TopUpRequestDto> => {
    const response = await api.put(`/wallet/admin/requests/${id}/reject`);
    return response.data;
  },
};
