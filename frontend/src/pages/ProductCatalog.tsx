import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal, Package } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/store';
import { productService, type Product } from '../services/productService';

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/admin');
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getAllProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err: any) {
        console.error("Failed to fetch products", err);
        setError(err.response?.data?.message || "Internal server serialization error");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [user, navigate]);

  useEffect(() => {
    let result = products;

    if (selectedCategory !== 'ALL') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, products]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500">
      <Navbar onSearch={setSearchQuery} />
      
      <div className="flex pt-20">
        {/* Sidebar */}
        <Sidebar 
          className="hidden lg:block sticky top-20 h-[calc(100vh-80px)]" 
          onCategoryChange={setSelectedCategory}
          selectedCategory={selectedCategory}
        />

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

          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Package size={20} />
                <span className="text-[8px] font-black uppercase tracking-[0.3em]">Premium Collection</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-p)] italic tracking-tighter uppercase">Curated Marketplace.</h1>
              <p className="text-[var(--text-s)] font-bold mt-1 text-xs">Explore {filteredProducts.length} verified products.</p>
            </div>
            
            <div className="flex items-center gap-3 bg-[var(--card-bg)] px-4 py-2 rounded-xl border border-[var(--border-c)] shadow-sm">
                <span className="text-[8px] font-black text-[var(--text-s)] uppercase tracking-widest">Sort</span>
                <select className="bg-transparent outline-none font-black text-xs text-[var(--text-p)] cursor-pointer">
                    <option>Recommended</option>
                    <option>Price: Low</option>
                    <option>Price: High</option>
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
                {error ? (
                  <div className="col-span-full py-20 text-center bg-red/5 rounded-[3rem] border border-dashed border-red/20">
                    <Package className="mx-auto text-red/40 mb-4" size={64} />
                    <p className="text-xl font-black text-red italic">Something went wrong.</p>
                    <p className="text-[var(--text-s)] font-bold mt-2">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-6 btn-primary px-8 py-3 rounded-xl text-[10px]">Try Reconnecting</button>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-[var(--card-bg)] rounded-[3rem] border border-dashed border-[var(--border-c)]">
                    <Package className="mx-auto text-[var(--text-s)] mb-4 opacity-20" size={64} />
                    <p className="text-xl font-black text-[var(--text-p)] italic">No products matched.</p>
                    <p className="text-[var(--text-s)] font-bold mt-2">Try adjusting your filters or search query.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default ProductCatalog;
