import { create } from 'zustand';
import { type Product } from '../services/productService';
import { cartService } from '../services/cartService';
import { sayAddedToCart } from '../services/speechService';

interface CartItem {
  id: string; // This corresponds to the backend CartItem ID
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
  token: string | null;
  isLoadingCart: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  fetchCart: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleDarkMode: () => void;
  logout: () => void;
}

export const useStore = create<GuraState>((set, get) => ({
  user: null,
  cart: [],
  isDarkMode: false,
  token: localStorage.getItem('gura_token'),
  isLoadingCart: false,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem('gura_token', token);
    else localStorage.removeItem('gura_token');
    set({ token });
  },
  
  logout: () => {
    localStorage.removeItem('gura_token');
    set({ user: null, token: null, cart: [] });
  },

  fetchCart: async () => {
    if (!get().token) return;
    set({ isLoadingCart: true });
    try {
      const backendCart = await cartService.getCart();
      const mappedItems: CartItem[] = backendCart.items.map(item => ({
        id: item.id.toString(),
        product: {
          id: item.productId,
          name: item.productName,
          price: item.price,
          imageUrl: item.imageUrl,
          category: item.category,
          description: '', // Optional: fetch or provide from cache if needed
          likesCount: 0,
          rating: 0,
          totalReviews: 0,
          isFeatured: false
        } as Product,
        quantity: item.quantity
      }));
      set({ cart: mappedItems });
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      set({ isLoadingCart: false });
    }
  },

  addToCart: async (product, quantity = 1) => {
    if (!get().token) {
        return;
    }
    try {
        await cartService.addToCart(product.id, quantity);
        await get().fetchCart(); // Refresh from source of truth
        // 🔊 Speak the confirmation after cart is updated
        sayAddedToCart(product.name);
    } catch (err) {
        console.error("Failed to add to cart", err);
    }
  },

  removeFromCart: async (itemId) => {
    try {
        await cartService.removeItem(parseInt(itemId));
        await get().fetchCart();
    } catch (err) {
        console.error("Failed to remove from cart", err);
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
        await cartService.updateItem(parseInt(itemId), quantity);
        await get().fetchCart();
    } catch (err) {
        console.error("Failed to update quantity", err);
    }
  },

  clearCart: async () => {
    try {
        await cartService.clearCart();
        set({ cart: [] });
    } catch (err) {
        console.error("Failed to clear cart", err);
    }
  },
  
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
