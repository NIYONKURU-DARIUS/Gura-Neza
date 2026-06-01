import api from './api';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  walletBalance: number;
}

export interface UserUpdateRequest {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const userService = {
  getMe: async (): Promise<UserProfile> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateMe: async (data: UserUpdateRequest): Promise<UserProfile> => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  getAllUsers: async (): Promise<UserProfile[]> => {
    const response = await api.get('/users');
    return response.data;
  }
};
