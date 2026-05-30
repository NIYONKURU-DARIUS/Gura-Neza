import { create } from 'zustand';
import { type Product } from '../services/productService';

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  walletBalance: number;
  role: 'USER' | 'ADMIN';
}

interface GuraState {
  user: User | null;
  cart: CartItem[];
  isDarkMode: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleDarkMode: () => void;
}

export const useStore = create<GuraState>((set) => ({
  user: {
    id: '1',
    name: 'Darius',
    email: 'darius@example.com',
    walletBalance: 1250.00,
    role: 'USER'
  },
  cart: [],
  isDarkMode: false,

  setUser: (user) => set({ user }),
  
  addToCart: (product, quantity = 1) => set((state) => {
    const existing = state.cart.find(item => item.product.id === product.id);
    if (existing) {
      return {
        cart: state.cart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      };
    }
    return { 
      cart: [...state.cart, { id: Math.random().toString(36).substr(2, 9), product, quantity }]
    };
  }),

  removeFromCart: (itemId) => set((state) => ({
    cart: state.cart.filter(item => item.id !== itemId)
  })),

  updateQuantity: (itemId, quantity) => set((state) => ({
    cart: state.cart.map(item => 
      item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
    )
  })),

  clearCart: () => set({ cart: [] }),
  
  toggleDarkMode: () => set((state) => {
    const newMode = !state.isDarkMode;
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { isDarkMode: newMode };
  })
}));
