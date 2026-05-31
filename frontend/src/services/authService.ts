import api from './api';
import { userService } from './userService';

export interface LoginResponse {
  token: string;
  message?: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AuthError {
  message: string;
}

export const authService = {
  login: async (credentials: any): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('gura_token', response.data.token);
    }
    return response.data;
  },

  register: async (userData: any): Promise<any> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('gura_token');
    window.location.href = '/login';
  }
};
