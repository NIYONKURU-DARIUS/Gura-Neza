import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SlidersHorizontal, Package, Star, ArrowUpRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import { productService, type Product } from '../services/productService';

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500">
      <Navbar />
      
      <div className="flex pt-20">
        {/* Sidebar */}
        <Sidebar className="hidden lg:block sticky top-20 h-[calc(100vh-80px)]" />

        <main className="flex-1 p-6 sm:p-10">
          {/* Mobile Filter Header */}
          <div className="lg:hidden flex justify-between items-center mb-10 bg-[var(--card-bg)] p-6 rounded-[2.5rem] border border-[var(--border-c)] shadow-sm">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Filter size={20} />
                </div>
                <span className="font-black text-xs uppercase tracking-widest text-[var(--text-p)]">Expand Filters</span>
             </div>
             <SlidersHorizontal size={20} className="text-primary" />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <div className="flex items-center gap-3 text-primary mb-3">
                <Package size={28} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Curated Collection</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-[var(--text-p)] italic tracking-tighter">Everything You Need.</h1>
              <p className="text-[var(--text-s)] font-bold mt-2">Explore {products.length}+ premium products verified for excellence.</p>
            </div>
            
            <div className="flex items-center gap-4 bg-[var(--card-bg)] px-6 py-3 rounded-2xl border border-[var(--border-c)] shadow-sm">
                <span className="text-[10px] font-black text-[var(--text-s)] uppercase tracking-widest">Sort by</span>
                <select className="bg-transparent outline-none font-black text-sm text-[var(--text-p)] cursor-pointer">
                    <option>Recommended</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-12"
              >
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[var(--card-bg)] rounded-[3rem] h-[550px] animate-pulse relative border border-[var(--border-c)]">
                    <div className="h-2/3 bg-[var(--bg-main)] rounded-t-[3rem]" />
                    <div className="p-8 space-y-4">
                        <div className="h-6 bg-[var(--bg-main)] rounded-full w-3/4" />
                        <div className="h-4 bg-[var(--bg-main)] rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="products"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-1k max-w-[1600px]"
              >
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default ProductCatalog;
