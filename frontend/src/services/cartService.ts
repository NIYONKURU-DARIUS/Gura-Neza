import { type Product } from './productService';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

let cart: CartItem[] = [];

export const cartService = {
  getCart: () => cart,
  
  addToCart: (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: Math.random(), product, quantity: 1 });
    }
    return [...cart];
  },
  
  removeFromCart: (itemId: number) => {
    cart = cart.filter(item => item.id !== itemId);
    return [...cart];
  },
  
  clearCart: () => {
    cart = [];
    return cart;
  },
  
  getTotal: () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }
};
