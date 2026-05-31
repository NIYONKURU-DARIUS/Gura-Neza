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
  }
};
