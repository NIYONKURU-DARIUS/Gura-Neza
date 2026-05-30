export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Premium Emerald Watch",
    price: 299.99,
    description: "A luxury timepiece with an emerald green dial.",
    category: "Accessories",
    image: "/src/assets/watch.png" // We'll assume the user frees up space for this
  },
  {
    id: 2,
    name: "Wireless Studio Headphones",
    price: 199.50,
    description: "Crystal clear audio for professionals.",
    category: "Electronics",
    image: "https://via.placeholder.com/300?text=Headphones"
  },
  {
    id: 3,
    name: "Minimalist Smart Laptop",
    price: 1299.00,
    description: "Powerful and sleek for modern creators.",
    category: "Electronics",
    image: "https://via.placeholder.com/300?text=Laptop"
  }
];

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockProducts), 500);
    });
  }
};
