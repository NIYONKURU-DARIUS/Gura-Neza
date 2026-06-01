import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/store';
import { productService, type Product } from '../services/productService';

type SortOption = 'id,asc' | 'price,asc' | 'price,desc';

const SORT_LABELS: Record<SortOption, string> = {
  'id,asc':    'Recommended',
  'price,asc': 'Price: Low to High',
  'price,desc':'Price: High to Low',
};

const PAGE_SIZE = 12;
const ABSOLUTE_MAX_PRICE = 2000;

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('id,asc');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Fine Tune filter state
  const [maxPrice, setMaxPrice] = useState(ABSOLUTE_MAX_PRICE);
  const [trendingFirst, setTrendingFirst] = useState(false);
  const [highlyRated, setHighlyRated] = useState(false);

  const { user } = useStore();
  const navigate = useNavigate();

  const fetchProducts = useCallback(async (
    currentPage: number,
    sort: SortOption,
    category: string,
    search: string
  ) => {
    if (user?.role === 'ADMIN') { navigate('/admin'); return; }
    setLoading(true);
    setError(null);
    try {
      const [sortField, sortDir] = sort.split(',');

      if (search.trim()) {
        // Search doesn't support pagination — fetch all and filter client-side
        const data = await productService.searchProducts(search.trim());
        let filtered = data;
        if (category !== 'ALL') filtered = filtered.filter(p => p.category === category);
        // Apply sort client-side
        filtered = [...filtered].sort((a, b) =>
          sortDir === 'desc' ? Number(b.price) - Number(a.price) : Number(a.price) - Number(b.price)
        );
        setProducts(filtered);
        setTotalPages(1);
        setTotalElements(filtered.length);
      } else {
        const result = await productService.getPagedProducts(currentPage, PAGE_SIZE, sortField, sortDir);
        let content = result.content;
        if (category !== 'ALL') {
          content = content.filter(p => p.category === category);
        }
        setProducts(content);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  // Fetch when page, sort, category, or search changes
  useEffect(() => {
    fetchProducts(page, sortOption, selectedCategory, searchQuery);
  }, [page, sortOption, selectedCategory, searchQuery, fetchProducts]);

  // Reset to page 0 when filters change
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(0);
  };
  const handleSortChange = (s: SortOption) => {
    setSortOption(s);
    setPage(0);
  };
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setPage(0);
  };

  // Apply Fine Tune filters client-side on top of fetched products
  const displayedProducts = React.useMemo(() => {
    let list = [...products];

    // Price ceiling
    if (maxPrice < ABSOLUTE_MAX_PRICE) {
      list = list.filter(p => p.price <= maxPrice);
    }

    // Trending first — sort by likesCount desc
    if (trendingFirst) {
      list = list.sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0));
    }

    // Highly rated — sort by rating desc (overrides trending if both active)
    if (highlyRated) {
      list = list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    return list;
  }, [products, maxPrice, trendingFirst, highlyRated]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-body transition-colors duration-500">
      <Navbar onSearch={handleSearch} />

      <div className="flex pt-20">
        <Sidebar
          className="hidden lg:block sticky top-20 h-[calc(100vh-80px)]"
          onCategoryChange={handleCategoryChange}
          selectedCategory={selectedCategory}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
          trendingFirst={trendingFirst}
          onTrendingFirstChange={setTrendingFirst}
          highlyRated={highlyRated}
          onHighlyRatedChange={setHighlyRated}
          absoluteMaxPrice={ABSOLUTE_MAX_PRICE}
        />

        <main className="flex-1 p-6 sm:p-10">
          {/* Mobile filter header */}
          <div className="lg:hidden flex justify-between items-center mb-8 bg-[var(--card-bg)] p-5 rounded-[2rem] border border-[var(--border-c)] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Filter size={18} />
              </div>
              <span className="font-black text-xs uppercase tracking-widest text-[var(--text-p)]">Filters</span>
            </div>
            <SlidersHorizontal size={18} className="text-primary" />
          </div>

          {/* Header row */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary mb-1">
                <Package size={18} />
                <span className="text-[8px] font-black uppercase tracking-[0.3em]">Premium Collection</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-p)] italic tracking-tighter uppercase">
                Curated Marketplace.
              </h1>
              <p className="text-[var(--text-s)] font-bold mt-1 text-xs">
                {loading ? 'Loading...' : `${displayedProducts.length} verified products`}
              </p>
            </div>

            {/* Sort control */}
            <div className="flex items-center gap-3 bg-[var(--card-bg)] px-4 py-2.5 rounded-xl border border-[var(--border-c)] shadow-sm">
              <span className="text-[8px] font-black text-[var(--text-s)] uppercase tracking-widest">Sort</span>
              <select
                value={sortOption}
                onChange={e => handleSortChange(e.target.value as SortOption)}
                className="bg-transparent outline-none font-black text-xs text-[var(--text-p)] cursor-pointer"
              >
                {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product grid */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[var(--card-bg)] rounded-[2.5rem] h-[480px] animate-pulse border border-[var(--border-c)]">
                    <div className="h-2/3 bg-[var(--bg-main)] rounded-t-[2.5rem]" />
                    <div className="p-6 space-y-3">
                      <div className="h-5 bg-[var(--bg-main)] rounded-full w-3/4" />
                      <div className="h-4 bg-[var(--bg-main)] rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {error ? (
                  <div className="py-20 text-center bg-red/5 rounded-[2.5rem] border border-dashed border-red/20">
                    <Package className="mx-auto text-red/40 mb-4" size={56} />
                    <p className="text-xl font-black text-red italic">Something went wrong.</p>
                    <p className="text-[var(--text-s)] font-bold mt-2">{error}</p>
                    <button onClick={() => fetchProducts(page, sortOption, selectedCategory, searchQuery)}
                      className="mt-6 btn-primary px-8 py-3 rounded-xl text-[10px]">
                      Try Again
                    </button>
                  </div>
                ) : displayedProducts.length === 0 ? (
                  <div className="py-20 text-center bg-[var(--card-bg)] rounded-[2.5rem] border border-dashed border-[var(--border-c)]">
                    <Package className="mx-auto text-[var(--text-s)] mb-4 opacity-20" size={56} />
                    <p className="text-xl font-black text-[var(--text-p)] italic">No products matched.</p>
                    <p className="text-[var(--text-s)] font-bold mt-2">Try adjusting your filters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {displayedProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {!error && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-12">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-c)] font-black text-xs text-[var(--text-p)] hover:border-primary/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>

                    <span className="text-xs font-black text-[var(--text-s)] uppercase tracking-widest">
                      Page {page + 1} of {totalPages}
                    </span>

                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-c)] font-black text-xs text-[var(--text-p)] hover:border-primary/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight size={16} />
                    </button>
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
