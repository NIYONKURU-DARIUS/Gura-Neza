import api from './api';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  walletBalance: number;
}

export const userService = {
  getMe: async (): Promise<UserProfile> => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  getAllUsers: async (): Promise<UserProfile[]> => {
    const response = await api.get('/users');
    return response.data;
  }
};
